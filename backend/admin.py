"""
Admin API Router
Handles ingestion control, status monitoring, and system settings.
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["Admin"])

# Pydantic models for API responses
class IngestionSource(BaseModel):
    id: int
    source_name: str
    source_type: str
    base_url: Optional[str]
    frequency: str
    is_active: bool
    dry_run_mode: bool
    throttle_rpm: int
    last_run_status: Optional[str]
    last_run_at: Optional[str]
    records_updated: int

class IngestionLog(BaseModel):
    id: int
    source_id: int
    run_type: str
    records_fetched: int
    records_inserted: int
    records_updated: int
    records_skipped: int
    error_summary: Optional[str]
    schema_drift_detected: bool
    started_at: Optional[str]
    finished_at: Optional[str]
    duration_seconds: Optional[int]

class SystemSetting(BaseModel):
    setting_key: str
    setting_value: str
    description: Optional[str]

# Database dependency
def get_db():
    from database import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ================================================================
# STATUS ENDPOINTS
# ================================================================

@router.get("/ingestion/status")
async def get_all_sources_status(db: Session = Depends(get_db)):
    """Get status of all ingestion sources"""
    result = db.execute(text("""
        SELECT id, source_name, source_type, base_url, frequency, 
               is_active, dry_run_mode, throttle_rpm, last_run_status, 
               last_run_at, records_updated
        FROM ingestion_sources
        ORDER BY source_name
    """))
    
    sources = []
    for row in result:
        sources.append({
            "id": row[0],
            "source_name": row[1],
            "source_type": row[2],
            "base_url": row[3],
            "frequency": row[4],
            "is_active": bool(row[5]),
            "dry_run_mode": bool(row[6]),
            "throttle_rpm": row[7],
            "last_run_status": row[8],
            "last_run_at": row[9],
            "records_updated": row[10] or 0
        })
    
    return {"sources": sources, "total": len(sources)}

@router.get("/ingestion/{source_id}/logs")
async def get_source_logs(source_id: int, limit: int = 10, db: Session = Depends(get_db)):
    """Get recent logs for a specific source"""
    result = db.execute(text("""
        SELECT id, source_id, run_type, records_fetched, records_inserted,
               records_updated, records_skipped, error_summary, 
               schema_drift_detected, started_at, finished_at, duration_seconds
        FROM ingestion_logs
        WHERE source_id = :source_id
        ORDER BY started_at DESC
        LIMIT :limit
    """), {"source_id": source_id, "limit": limit})
    
    logs = []
    for row in result:
        logs.append({
            "id": row[0],
            "source_id": row[1],
            "run_type": row[2],
            "records_fetched": row[3],
            "records_inserted": row[4],
            "records_updated": row[5],
            "records_skipped": row[6],
            "error_summary": row[7],
            "schema_drift_detected": bool(row[8]),
            "started_at": row[9],
            "finished_at": row[10],
            "duration_seconds": row[11]
        })
    
    return {"logs": logs, "source_id": source_id}

# ================================================================
# CONTROL ENDPOINTS
# ================================================================

@router.post("/ingestion/{source_id}/start")
async def start_ingestion(
    source_id: int, 
    background_tasks: BackgroundTasks,
    dry_run: bool = True,
    db: Session = Depends(get_db)
):
    """Start ingestion worker for a specific source"""
    
    # Check kill switch
    kill_switch = db.execute(text(
        "SELECT setting_value FROM system_settings WHERE setting_key = 'GLOBAL_KILL_SWITCH'"
    )).scalar()
    
    if kill_switch == 'ON':
        raise HTTPException(status_code=403, detail="Global kill switch is ON. All ingestions paused.")
    
    # Get source
    source = db.execute(text(
        "SELECT id, source_name, is_active FROM ingestion_sources WHERE id = :id"
    ), {"id": source_id}).fetchone()
    
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    
    if not source[2]:  # is_active
        raise HTTPException(status_code=400, detail="Source is disabled")
    
    # Update status to RUNNING
    db.execute(text("""
        UPDATE ingestion_sources 
        SET last_run_status = 'RUNNING', last_run_at = :now
        WHERE id = :id
    """), {"id": source_id, "now": datetime.now().isoformat()})
    db.commit()
    
    # Add background task
    background_tasks.add_task(run_ingestion_worker, source_id, source[1], dry_run)
    
    return {
        "message": f"Ingestion worker for '{source[1]}' started in background",
        "source_id": source_id,
        "dry_run": dry_run
    }

@router.post("/ingestion/{source_id}/stop")
async def stop_ingestion(source_id: int, db: Session = Depends(get_db)):
    """Stop/mark source as idle"""
    db.execute(text("""
        UPDATE ingestion_sources 
        SET last_run_status = 'IDLE'
        WHERE id = :id
    """), {"id": source_id})
    db.commit()
    
    return {"message": f"Source {source_id} marked as IDLE"}

@router.post("/ingestion/{source_id}/toggle")
async def toggle_source(source_id: int, db: Session = Depends(get_db)):
    """Toggle source active/inactive"""
    db.execute(text("""
        UPDATE ingestion_sources 
        SET is_active = NOT is_active
        WHERE id = :id
    """), {"id": source_id})
    db.commit()
    
    result = db.execute(text(
        "SELECT is_active FROM ingestion_sources WHERE id = :id"
    ), {"id": source_id}).scalar()
    
    return {"source_id": source_id, "is_active": bool(result)}

# ================================================================
# SYSTEM SETTINGS
# ================================================================

@router.get("/settings")
async def get_system_settings(db: Session = Depends(get_db)):
    """Get all system settings"""
    result = db.execute(text(
        "SELECT setting_key, setting_value, description FROM system_settings"
    ))
    
    settings = {}
    for row in result:
        settings[row[0]] = {"value": row[1], "description": row[2]}
    
    return {"settings": settings}

@router.post("/settings/kill-switch")
async def toggle_kill_switch(db: Session = Depends(get_db)):
    """Toggle global kill switch"""
    current = db.execute(text(
        "SELECT setting_value FROM system_settings WHERE setting_key = 'GLOBAL_KILL_SWITCH'"
    )).scalar()
    
    new_value = 'OFF' if current == 'ON' else 'ON'
    
    db.execute(text("""
        UPDATE system_settings 
        SET setting_value = :value, updated_at = :now
        WHERE setting_key = 'GLOBAL_KILL_SWITCH'
    """), {"value": new_value, "now": datetime.now().isoformat()})
    db.commit()
    
    return {"kill_switch": new_value, "message": f"Kill switch is now {new_value}"}

# ================================================================
# BACKGROUND WORKER (Mock Implementation)
# ================================================================

async def run_ingestion_worker(source_id: int, source_name: str, dry_run: bool):
    """
    Background worker for ingestion.
    This is a mock implementation - real workers would call actual ingestors.
    """
    from database import SessionLocal
    import time
    
    db = SessionLocal()
    started_at = datetime.now()
    
    try:
        # Simulate ingestion work
        time.sleep(2)  # Simulate network/processing time
        
        # Mock results
        records_fetched = 10
        records_inserted = 5 if not dry_run else 0
        records_updated = 3 if not dry_run else 0
        records_skipped = 2
        
        # Log success
        db.execute(text("""
            INSERT INTO ingestion_logs 
            (source_id, run_type, records_fetched, records_inserted, 
             records_updated, records_skipped, started_at, finished_at, duration_seconds)
            VALUES (:source_id, :run_type, :fetched, :inserted, :updated, :skipped, 
                    :started, :finished, :duration)
        """), {
            "source_id": source_id,
            "run_type": "DRY_RUN" if dry_run else "FULL",
            "fetched": records_fetched,
            "inserted": records_inserted,
            "updated": records_updated,
            "skipped": records_skipped,
            "started": started_at.isoformat(),
            "finished": datetime.now().isoformat(),
            "duration": int((datetime.now() - started_at).total_seconds())
        })
        
        # Update source status
        db.execute(text("""
            UPDATE ingestion_sources 
            SET last_run_status = 'SUCCESS', 
                records_updated = records_updated + :updated
            WHERE id = :id
        """), {"id": source_id, "updated": records_inserted + records_updated})
        
        db.commit()
        
    except Exception as e:
        # Log failure
        db.execute(text("""
            INSERT INTO ingestion_logs 
            (source_id, run_type, error_summary, started_at, finished_at, duration_seconds)
            VALUES (:source_id, :run_type, :error, :started, :finished, :duration)
        """), {
            "source_id": source_id,
            "run_type": "DRY_RUN" if dry_run else "FULL",
            "error": str(e),
            "started": started_at.isoformat(),
            "finished": datetime.now().isoformat(),
            "duration": int((datetime.now() - started_at).total_seconds())
        })
        
        db.execute(text("""
            UPDATE ingestion_sources 
            SET last_run_status = 'FAILED'
            WHERE id = :id
        """), {"id": source_id})
        
        db.commit()
    
    finally:
        db.close()

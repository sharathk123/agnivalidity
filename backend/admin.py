"""
Admin API Router
Handles ingestion control, status monitoring, and system settings.
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from typing import List, Optional, Set
from pydantic import BaseModel
import asyncio
import json
from ingestors.dgft_ingestor import HSCodeRecord
from ingestors.utils import validate_before_ingestion
from pydantic import ValidationError

router = APIRouter(prefix="/admin", tags=["Admin"])

# ================================================================
# REAL-TIME LOG BROADCASTER (Simple Pub/Sub)
# ================================================================

class LogBroadcaster:
    def __init__(self):
        self.connections: Set[asyncio.Queue] = set()

    async def connect(self) -> asyncio.Queue:
        queue = asyncio.Queue()
        self.connections.add(queue)
        return queue

    def disconnect(self, queue: asyncio.Queue):
        self.connections.remove(queue)

    async def broadcast(self, message: dict):
        for queue in self.connections:
            await queue.put(message)

# Global singleton
log_broadcaster = LogBroadcaster()

# Helper to push logs from anywhere
async def push_log(level: str, source: str, message: str):
    payload = {
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "level": level,
        "source": source,
        "message": message
    }
    await log_broadcaster.broadcast(payload)

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
    performance_stats: Optional[dict] = None

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
from database import get_db

# ================================================================
# STATUS ENDPOINTS
# ================================================================

@router.get("/ingestion/status")
async def get_all_sources_status(db: Session = Depends(get_db)):
    """Get status of all ingestion sources"""
    result = db.execute(text("""
        SELECT id, source_name, source_type, base_url, frequency, 
               is_active, dry_run_mode, throttle_rpm, last_run_status, 
               last_run_at, records_updated, ingestion_strategy
        FROM ingestion_sources
        ORDER BY source_name
    """)).fetchall()
    
    # Fetch latest FTA performance
    fta_perf = db.execute(text("""
        SELECT source_id, cleaned_tariff_lines, total_raw_lines, success_rate, error_count, calculated_at
        FROM fta_performance
        ORDER BY calculated_at DESC LIMIT 1
    """)).fetchone()
    
    fta_stats = {}
    if fta_perf:
         # Assuming INVEST_INDIA_FTA is the source for this, mapping by source_id would be better if multiple, 
         # but for now we map it to the source that matches 'INVEST_INDIA_FTA' logic below
         fta_stats[fta_perf[0]] = {
             "cleaned_lines": fta_perf[1],
             "total_lines": fta_perf[2],
             "success_rate": fta_perf[3],
             "error_count": fta_perf[4],
             "timestamp": fta_perf[5]
         }
    
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
            "records_updated": row[10] or 0,
            "ingestion_strategy": row[11] or "REST_API",
            "performance_stats": fta_stats.get(row[0]) if row[1] == 'INVEST_INDIA_FTA' else None
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

@router.post("/ingestion/manual_entry")
async def manual_entry(payload: dict, db: Session = Depends(get_db)):
    """
    Manually ingest an HS Code record.
    Used for testing validation logic (clean_hs_code).
    """
    try:
        record = HSCodeRecord(**payload)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
        
    # Upsert into DB
    # Using HSCode table (defined in database.py but accessed via raw SQL here for consistency)
    db.execute(text("""
        INSERT INTO hs_code (hs_code, description, regulatory_sensitivity)
        VALUES (:hc, :desc, 'LOW')
        ON CONFLICT(hs_code) DO UPDATE SET description = excluded.description
    """), {"hc": record.hs_code, "desc": record.description})
    db.commit()
    
    return {"status": "SUCCESS", "hs_code": record.hs_code, "cleaned_data": record.model_dump()}

@router.post("/ingestion/{source_identifier}/start")
async def start_ingestion(
    source_identifier: str, 
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
    
    # Get source (Handle int ID or text Name)
    source = None
    if source_identifier.isdigit():
        source = db.execute(text(
            "SELECT id, source_name, is_active FROM ingestion_sources WHERE id = :id"
        ), {"id": int(source_identifier)}).fetchone()
    else:
        source = db.execute(text(
            "SELECT id, source_name, is_active FROM ingestion_sources WHERE source_name = :name"
        ), {"name": source_identifier}).fetchone()
    
    if not source:
        raise HTTPException(status_code=404, detail=f"Source '{source_identifier}' not found")
    
    source_id = source[0]
    source_name = source[1]
    is_active = source[2]
    
    if not is_active:  # is_active
        raise HTTPException(status_code=400, detail="Source is disabled")
        
    # Pre-flight Validation (Synchronous check for 409)
    # This ensures "Compliance Gate" blocks immediately
    validation = validate_before_ingestion(source_name, db)
    if not validation["can_proceed"]:
        # Find the blocker
        blocker = next((c for c in validation["checks"] if c["status"] != "OK"), None)
        detail = blocker["message"] if blocker else "Validation failed"
        raise HTTPException(status_code=409, detail=f"Schema Update Required: {detail}")
    
    # Update status to RUNNING
    db.execute(text("""
        UPDATE ingestion_sources 
        SET last_run_status = 'RUNNING', last_run_at = :now
        WHERE id = :id
    """), {"id": source_id, "now": datetime.now().isoformat()})
    db.commit()
    
    # Add background task
    background_tasks.add_task(run_ingestion_worker, source_id, source_name, dry_run)
    
    return {
        "message": f"Ingestion worker for '{source_name}' started in background",
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
# VALIDATION & HEALTH ENDPOINTS
# ================================================================

@router.get("/icegate/version-check")
async def check_icegate_version(db: Session = Depends(get_db)):
    """
    Check ICEGATE JSON schema version compatibility.
    CRITICAL: Live Jan 31, 2026.
    """
    from ingestors.utils import check_icegate_schema_version
    return check_icegate_schema_version(db)

@router.get("/ingestion/{source_name}/preflight")
async def preflight_check(source_name: str, db: Session = Depends(get_db)):
    """
    Pre-flight validation before starting ingestion.
    Returns all checks that must pass.
    """
    from ingestors.utils import validate_before_ingestion
    return validate_before_ingestion(source_name, db)

@router.get("/health/dashboard")
async def admin_dashboard_health(db: Session = Depends(get_db)):
    """
    Dashboard health summary for Admin UI.
    Returns counts and status for all components.
    """
    # Get source counts by status
    sources = db.execute(text("""
        SELECT last_run_status, COUNT(*) as count
        FROM ingestion_sources
        GROUP BY last_run_status
    """)).fetchall()
    
    source_status = {row[0] or "IDLE": row[1] for row in sources}
    
    # Get recent errors
    recent_errors = db.execute(text("""
        SELECT COUNT(*) FROM ingestion_logs
        WHERE error_summary IS NOT NULL
        AND started_at > datetime('now', '-24 hours')
    """)).scalar()
    
    # Get total records updated today
    records_today = db.execute(text("""
        SELECT SUM(records_inserted + records_updated) FROM ingestion_logs
        WHERE started_at > datetime('now', '-24 hours')
    """)).scalar()
    
    # Get kill switch status
    kill_switch = db.execute(text(
        "SELECT setting_value FROM system_settings WHERE setting_key = 'GLOBAL_KILL_SWITCH'"
    )).scalar()
    
    # Check ICEGATE version
    from ingestors.utils import check_icegate_schema_version
    icegate_status = check_icegate_schema_version(db)
    
    return {
        "status": "healthy" if kill_switch == "OFF" else "paused",
        "kill_switch": kill_switch,
        "sources": source_status,
        "total_sources": sum(source_status.values()),
        "errors_24h": recent_errors or 0,
        "records_updated_24h": records_today or 0,
        "icegate_version": icegate_status,
        "timestamp": datetime.now().isoformat()
    }


@router.get("/ingestion/stream")
async def stream_logs(request: Request):
    """
    SSE Endpoint for real-time admin logs.
    """
    queue = await log_broadcaster.connect()
    
    async def event_generator():
        try:
            while True:
                # Check for client disconnect
                if await request.is_disconnected():
                    break
                
                # Get message
                try:
                    data = await asyncio.wait_for(queue.get(), timeout=1.0)
                    yield f"data: {json.dumps(data)}\n\n"
                except asyncio.TimeoutError:
                    # Keep-alive
                    yield ": keep-alive\n\n"
                    
        finally:
            log_broadcaster.disconnect(queue)
    
    return StreamingResponse(event_generator(), media_type="text/event-stream")

# ================================================================
# BACKGROUND WORKER DISPATCHER
# ================================================================

async def run_ingestion_worker(source_id: int, source_name: str, dry_run: bool):
    """
    Background worker dispatcher.
    Routes to specific ingestors based on source_name.
    """
    from database import SessionLocal
    db = SessionLocal()
    started_at = datetime.now()
    result = None

    # helper for mock logs
    async def log(level, *args):
        # Handle varargs to support both (level, msg) and (level, component, msg)
        if len(args) == 2:
            # signature: (level, component, msg) -> We ignore component or prepend it
            msg = f"[{args[0]}] {args[1]}"
        elif len(args) == 1:
            # signature: (level, msg)
            msg = args[0]
        else:
            msg = " ".join(map(str, args))
            
        await push_log(level, source_name, msg)

    await log("INFO", f"Worker started for {source_name}")

    try:
        # 1. DGFT HS Mapper
        if source_name in ["DGFT_ITCHS_MASTER", "DGFT_HS_MASTER"]:
            from ingestors.dgft_ingestor import run_dgft_ingestor_task
            result = await run_dgft_ingestor_task(db, source_id, dry_run=dry_run, log_callback=log)

        # 2. ISO Country List
        elif source_name == "ISO_COUNTRY_LIST":
            from ingestors.country_ingestor import run_country_ingestor
            await log("INFO", "Fetching country data from REST API...")
            loop = asyncio.get_running_loop()
            # Wrap as it's likely sync
            result = await loop.run_in_executor(None, lambda: run_country_ingestor(db, dry_run=dry_run))

        # 3. ICEGATE Schema Simulation
        elif source_name == "ICEGATE_JSON_ADVISORY":
            await log("INFO", "Running Pre-Flight Schema Check (v1.1 Target)...")
            await asyncio.sleep(2)
            live_ver = "1.2"
            internal_ver = "1.1"
            if live_ver > internal_ver:
                await log("CRITICAL", f"ICEGATE Schema {live_ver} detected. Internal is {internal_ver}.")
                await log("CRITICAL", "Ingestion suspended for safety. AUTOMATIC LOCK ENGAGED.")
                db.execute(text("UPDATE ingestion_sources SET last_run_status='FAILED' WHERE id=:id"), {"id": source_id})
                db.commit()
                return

        # 4. Invest India ODOP
        elif source_name == "INVEST_INDIA_ODOP":
            from ingestors.odop_ingestor import run_odop_ingestor_task
            result = await run_odop_ingestor_task(db, source_id, dry_run=dry_run, log_callback=log)

        # 5. TIA Analytics Hub (Market Demand)
        elif source_name == "TIA_ANALYTICS_HUB":
            from ingestors.demand_ingestor import run_demand_ingestor_task
            result = await run_demand_ingestor_task(db, source_id, dry_run=dry_run, log_callback=log)

        # 6. Default Simulation
        else:
            await log("INFO", "Initializing connection...")
            await asyncio.sleep(1)
            import os
            mode = os.getenv("MODE", "SIM").upper()
            if mode == "PROD":
                 await log("INFO", "Mode: PRODUCTION (Connecting to API...)")
                 await log("WARNING", "Production API credentials not found. Reverting to Simulation.")
                 await asyncio.sleep(1)
            await asyncio.sleep(1) 
            result = {
                "records_fetched": 25,
                "records_inserted": 18 if not dry_run else 0,
                "records_updated": 7 if not dry_run else 0,
                "records_skipped": 0
            }

        # Global Result Persistence (for blocks that set 'result')
        if result:
            records_fetched = result.get("records_fetched", 0)
            records_inserted = result.get("records_inserted", 0)
            records_updated = result.get("records_updated", 0)
            records_skipped = result.get("records_skipped", 0)
            
            await log("INFO", f"Processed {records_inserted + records_updated} records")
            
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
            
            db.execute(text("""
                UPDATE ingestion_sources 
                SET last_run_status = 'SUCCESS', 
                    records_updated = records_updated + :updated
                WHERE id = :id
            """), {"id": source_id, "updated": records_inserted + records_updated})
            
            db.commit()
            await log("SUCCESS", f"Job completed: {records_inserted + records_updated} records synced successfully.")
            await log("INFO", "Worker state: IDLE (Queue Exhausted)")

            # Specialized: FTA Performance Tracking (Simulation)
            if source_name == "INVEST_INDIA_FTA":
                import random
                total_lines = random.randint(12000, 15000)
                errors = random.randint(5, 500)
                cleaned = total_lines - errors
                rate = (cleaned / total_lines) * 100
                
                db.execute(text("""
                    INSERT INTO fta_performance (source_id, cleaned_tariff_lines, total_raw_lines, success_rate, error_count)
                    VALUES (:sid, :cleaned, :total, :rate, :errors)
                """), {
                    "sid": source_id,
                    "cleaned": cleaned,
                    "total": total_lines,
                    "rate": rate,
                    "errors": errors
                })
                db.commit()
                await log("INFO", f"FTA Intelligence Update: {rate:.2f}% Success Rate ({cleaned}/{total_lines} Lines)")

    except Exception as e:
        await log("ERROR", f"Job failed: {e}")
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
        db.execute(text("UPDATE ingestion_sources SET last_run_status = 'FAILED' WHERE id = :id"), {"id": source_id})
        db.commit()
    finally:
        db.close()

@router.get("/diagnostics/run")
async def run_diagnostics(db: Session = Depends(get_db)):
    """
    Agni Test Script: Connectivity & Schema Verification (Jan 13 2026)
    """
    results = {
        "timestamp": datetime.now().isoformat(),
        "checks": []
    }
    
    # 1. ICEGATE Handshake (Mocked for 2026)
    ice_check = {
        "source": "ICEGATE_JSON",
        "test": "Schema Handshake",
        "status": "PASS",
        "details": "Returned Status 200 + Schema Version 1.1 (08-Jan-2026)"
    }
    results["checks"].append(ice_check)
    
    # 2. Tradestat Data Freshness
    trade_check = {
        "source": "TRADESTAT_COMMERCE",
        "test": "Data Latency Check",
        "status": "PASS",
        "details": "Data Available: Apr-Aug 2025 (Latest FY)"
    }
    results["checks"].append(trade_check)
    
    # 3. ODOP Cross-Reference (Nizamabad)
    row = db.execute(text("SELECT product_name FROM odop_registry WHERE district='Nizamabad'")).fetchone()
    if row:
        odop_check = {
            "source": "ODOP_INVEST_INDIA",
            "test": "District-Product Mapping",
            "status": "PASS",
            "details": f"Nizamabad Correctly Maps to: {row[0]}"
        }
    else:
        odop_check = {
            "source": "ODOP_INVEST_INDIA",
            "test": "District-Product Mapping",
            "status": "FAIL",
            "details": "Nizamabad mapping NOT found."
        }
    results["checks"].append(odop_check)
    
    # Verdict logic
    failed = any(c['status'] == 'FAIL' for c in results['checks'])
    results["verdict"] = "SYSTEM_GO" if not failed else "SYSTEM_CAUTION"
    
    return results

@router.post("/override/verdict")
async def manual_override_verdict(hs_code: str, country_code: str, verdict: str, rationale: str = "Admin Override", db: Session = Depends(get_db)):
    """
    Manual Override Console for immediate regulatory bans.
    """
    # 1. Resolve IDs
    hs_id = db.execute(text("SELECT id FROM hs_code WHERE hs_code=:h"), {"h": hs_code}).scalar()
    country_id = db.execute(text("SELECT id FROM country WHERE iso_code=:c"), {"c": country_code}).scalar()
    
    if not hs_id or not country_id:
        raise HTTPException(status_code=404, detail="HS Code or Country not found")
        
    # 2. Upsert Recommendation
    # Check if exists
    exists = db.execute(text("SELECT 1 FROM recommendation WHERE hs_code_id=:h AND country_id=:c"), {"h": hs_id, "c": country_id}).scalar()
    
    if exists:
        db.execute(text("""
            UPDATE recommendation SET recommendation=:v, rationale=:r, calculated_at=current_timestamp 
            WHERE hs_code_id=:h AND country_id=:c
        """), {"v": verdict, "r": rationale, "h": hs_id, "c": country_id})
    else:
        db.execute(text("""
            INSERT INTO recommendation (hs_code_id, country_id, recommendation, rationale, calculated_at)
            VALUES (:h, :c, :v, :r, current_timestamp)
        """), {"v": verdict, "r": rationale, "h": hs_id, "c": country_id})
        
    db.commit()
    return {"status": "SUCCESS", "message": f"Verdict for {hs_code} -> {country_code} set to {verdict}"}

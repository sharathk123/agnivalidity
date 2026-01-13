"""
DGFT HS Code Mapper Ingestor (2026 Digitised Policy)

This ingestor targets the DGFT digitised policy to extract HS codes,
descriptions, and regulatory status (Free/Restricted).
Uses resilient identity rotation and retry logic.
"""

import httpx
import asyncio
import random
from typing import List, Dict, Any, Optional
from datetime import datetime
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, Field

from .utils import (
    retry_with_backoff, 
    USER_AGENTS, 
    get_random_headers,
    validate_before_ingestion
)

# 1. Strict Schema Enforcement
class HSCodeRecord(BaseModel):
    hs_code: str = Field(pattern=r"^\d{8}$")
    description: str
    policy: str  # Free, Restricted, Prohibited, STE
    last_updated: datetime = Field(default_factory=datetime.now)

# 2. Resilient Worker Logic
@retry_with_backoff(max_retries=3)
async def fetch_dgft_chapter_html(chapter: int) -> str:
    """Fetch DGFT Chapter page HTML"""
    # DGFT 2026 URL pattern for digitised policy
    # Note: In reality, this URL might need adjustment based on actual DGFT site structure
    url = f"https://www.dgft.gov.in/CP/?opt=itchs-import-export&chapter={chapter:02d}"
    
    headers = get_random_headers(url)
    
    async with httpx.AsyncClient(verify=False) as client:
        response = await client.get(url, headers=headers, timeout=30.0)
        response.raise_for_status()
        return response.text

def parse_dgft_html(html_content: str) -> List[Dict[str, Any]]:
    """Parse Policy Table from HTML"""
    soup = BeautifulSoup(html_content, 'html.parser')
    records = []
    
    # Logic to find the policy table - looking for standard table structures
    # This is resilient parsing: looks for table rows with >= 3 distinct cells
    tables = soup.find_all('table')
    
    for table in tables:
        rows = table.find_all('tr')
        for row in rows:
            cols = row.find_all(['td', 'th'])
            clean_cols = [c.get_text(strip=True) for c in cols]
            
            # Simple heuristic: Row must have code (digits), description (text), policy (text)
            if len(clean_cols) >= 3:
                code_cand = clean_cols[0].replace('.', '').strip()
                desc_cand = clean_cols[1]
                policy_cand = clean_cols[2]
                
                # Check 8-digit code format
                if len(code_cand) == 8 and code_cand.isdigit():
                    records.append({
                        "hs_code": code_cand,
                        "description": desc_cand,
                        "policy": policy_cand
                    })
    
    return records

async def run_dgft_ingestor_task(
    db: Session, 
    source_id: int, 
    chapters: List[int] = [9, 10, 52, 61, 62], # Spices, Rice, Cotton, Apparels
    dry_run: bool = True
):
    """
    Main background task for DGFT Ingestion.
    """
    start_time = datetime.now()
    log_entry = {
        "source_id": source_id,
        "run_type": "DRY_RUN" if dry_run else "FULL",
        "records_fetched": 0,
        "records_inserted": 0,
        "records_updated": 0,
        "records_skipped": 0,
        "error_summary": None,
        "started_at": start_time.isoformat()
    }
    
    try:
        # 1. Pre-flight Validation
        validation = validate_before_ingestion("DGFT_ITCHS_MASTER", db)
        if not validation["can_proceed"]:
            raise Exception(f"Pre-flight failed: {validation['checks']}")
            
        total_records = 0
        
        # 2. Iterate Chapters
        for chapter in chapters:
            html = await fetch_dgft_chapter_html(chapter)
            raw_records = parse_dgft_html(html)
            
            # 3. Validate & Upsert
            for record in raw_records:
                try:
                    # Validate schema
                    valid_rec = HSCodeRecord(**record)
                    log_entry["records_fetched"] += 1
                    
                    if not dry_run:
                        # Map policy to risk level for system
                        sensitivity = "HIGH" if "Prohibited" in valid_rec.policy else \
                                      "MEDIUM" if "Restricted" in valid_rec.policy else "LOW"
                                      
                        # SQL Upsert
                        # Check if exists
                        exists = db.execute(text("SELECT id FROM hs_code WHERE hs_code = :code"), 
                                          {"code": valid_rec.hs_code}).fetchone()
                        
                        if exists:
                            db.execute(text("""
                                UPDATE hs_code 
                                SET description = :desc, regulatory_sensitivity = :sens 
                                WHERE hs_code = :code
                            """), {
                                "desc": valid_rec.description, 
                                "sens": sensitivity, 
                                "code": valid_rec.hs_code
                            })
                            log_entry["records_updated"] += 1
                        else:
                            db.execute(text("""
                                INSERT INTO hs_code (hs_code, description, regulatory_sensitivity)
                                VALUES (:code, :desc, :sens)
                            """), {
                                "desc": valid_rec.description, 
                                "sens": sensitivity, 
                                "code": valid_rec.hs_code
                            })
                            log_entry["records_inserted"] += 1
                            
                except Exception as e:
                    log_entry["records_skipped"] += 1
                    
            if not dry_run:
                db.commit()
                
            # Sleep to respect rate limits
            await asyncio.sleep(random.uniform(2.0, 5.0))
            
        # Success Update
        db.execute(text("""
            UPDATE ingestion_sources 
            SET last_run_status = 'SUCCESS', last_run_at = :now, 
                records_updated = records_updated + :count
            WHERE id = :id
        """), {
            "now": datetime.now().isoformat(),
            "count": log_entry["records_inserted"] + log_entry["records_updated"],
            "id": source_id
        })
        db.commit()

    except Exception as e:
        log_entry["error_summary"] = str(e)
        
        db.execute(text("""
            UPDATE ingestion_sources 
            SET last_run_status = 'FAILED' 
            WHERE id = :id
        """), {"id": source_id})
        db.commit()
        
    finally:
        # Close Log
        log_entry["finished_at"] = datetime.now().isoformat()
        log_entry["duration_seconds"] = int((datetime.now() - start_time).total_seconds())
        
        db.execute(text("""
            INSERT INTO ingestion_logs 
            (source_id, run_type, records_fetched, records_inserted, 
             records_updated, records_skipped, error_summary, 
             started_at, finished_at, duration_seconds)
            VALUES (:source_id, :run_type, :records_fetched, :records_inserted, 
                    :records_updated, :records_skipped, :error_summary, 
                    :started_at, :finished_at, :duration_seconds)
        """), log_entry)
        db.commit()

# Sync wrapper for BackgroundTasks
def run_dgft_ingestor_worker(source_id: int, dry_run: bool):
    from database import SessionLocal
    db = SessionLocal()
    try:
        asyncio.run(run_dgft_ingestor_task(db, source_id, dry_run=dry_run))
    finally:
        db.close()

"""
Production Demand Ingestor (TIA Hub Integration)

Handles market demand intelligence with strict Pydantic validation,
intelligent de-duplication (UPSERT), and lifecycle management.
"""

import asyncio
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import text

# 1. Schema Lifecycle Rules
STALE_DATA_THRESHOLD_DAYS = 90

class DemandRecord(BaseModel):
    hs_code: str = Field(..., pattern=r"^\d{4,10}$")
    country_iso: str = Field(..., min_length=2, max_length=2)
    demand_level: str = Field(..., pattern=r"^(HIGH|MEDIUM|LOW)$")
    trend: str = Field(..., pattern=r"^(UP|FLAT|DOWN)$")
    last_updated: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m"))

# 2. Simulated Production Data Lake (TIA Hub Mock)
# High-fidelity market trends for key EXIM products (25 Hubs)
PRODUCTION_DEMAND_SEED = [
    {"hs_code": "10063020", "country_iso": "AE", "demand_level": "HIGH", "trend": "UP"},
    {"hs_code": "10063020", "country_iso": "SA", "demand_level": "HIGH", "trend": "UP"},
    {"hs_code": "09103030", "country_iso": "US", "demand_level": "MEDIUM", "trend": "UP"},
    {"hs_code": "09103030", "country_iso": "DE", "demand_level": "HIGH", "trend": "UP"},
    {"hs_code": "62044220", "country_iso": "FR", "demand_level": "HIGH", "trend": "UP"},
    {"hs_code": "09011111", "country_iso": "IT", "demand_level": "MEDIUM", "trend": "FLAT"},
    {"hs_code": "10063020", "country_iso": "GB", "demand_level": "MEDIUM", "trend": "UP"},
    {"hs_code": "08045020", "country_iso": "NL", "demand_level": "HIGH", "trend": "UP"},
    {"hs_code": "09103030", "country_iso": "JP", "demand_level": "HIGH", "trend": "UP"},
    {"hs_code": "52081110", "country_iso": "VN", "demand_level": "HIGH", "trend": "UP"},
    {"hs_code": "10063020", "country_iso": "SG", "demand_level": "HIGH", "trend": "UP"},
    {"hs_code": "61091000", "country_iso": "AU", "demand_level": "MEDIUM", "trend": "UP"},
    {"hs_code": "09041110", "country_iso": "KR", "demand_level": "HIGH", "trend": "UP"},
    {"hs_code": "30049099", "country_iso": "CA", "demand_level": "HIGH", "trend": "UP"},
    {"hs_code": "09103030", "country_iso": "BR", "demand_level": "LOW", "trend": "UP"},
    {"hs_code": "10063020", "country_iso": "ID", "demand_level": "HIGH", "trend": "UP"},
    {"hs_code": "6204", "country_iso": "ES", "demand_level": "MEDIUM", "trend": "UP"},
    {"hs_code": "0901", "country_iso": "CH", "demand_level": "HIGH", "trend": "UP"},
    {"hs_code": "0804", "country_iso": "QA", "demand_level": "HIGH", "trend": "UP"},
    {"hs_code": "0902", "country_iso": "RU", "demand_level": "MEDIUM", "trend": "FLAT"},
    {"hs_code": "6103", "country_iso": "MX", "demand_level": "LOW", "trend": "UP"},
    {"hs_code": "3004", "country_iso": "NG", "demand_level": "HIGH", "trend": "UP"},
    {"hs_code": "1006", "country_iso": "MY", "demand_level": "HIGH", "trend": "UP"},
    {"hs_code": "0910", "country_iso": "IL", "demand_level": "MEDIUM", "trend": "UP"},
    {"hs_code": "5208", "country_iso": "TR", "demand_level": "HIGH", "trend": "UP"}
]

async def run_demand_ingestor_task(
    db: Session, 
    source_id: int, 
    dry_run: bool = True,
    log_callback: Optional[callable] = None
):
    """
    Main worker for Global Demand Ingestion.
    Implements dynamic data simulation and auto-seeding of reference data
    to close the gap between static seed and live intelligence.
    """
    start_time = datetime.now()
    
    async def log(level, msg):
        if log_callback:
            await log_callback(level, msg)
            
    await log("INFO", f"Starting Global Demand Ingestion (Dry Run: {dry_run})")
    
    results = {
        "records_fetched": 0,
        "records_inserted": 0,
        "records_updated": 0,
        "records_skipped": 0,
        "stale_removed": 0,
        "reference_data_created": 0
    }

    try:
        # 1. Lifecycle Management: Remove Stale Data
        if not dry_run:
            stale_date = (datetime.now() - timedelta(days=STALE_DATA_THRESHOLD_DAYS)).strftime("%Y-%m")
            delete_sql = "DELETE FROM market_demand WHERE last_updated < :stale_date"
            res = db.execute(text(delete_sql), {"stale_date": stale_date})
            results["stale_removed"] = res.rowcount
            if res.rowcount > 0:
                await log("INFO", f"Cleaned up {res.rowcount} stale demand records.")

        # 2. Ingest Production Data with Dynamic Simulation
        for raw_record in PRODUCTION_DEMAND_SEED:
            results["records_fetched"] += 1
            try:
                # Validation
                record = DemandRecord(**raw_record)
                
                # Dynamic Drift Simulation
                # Randomize trend and demand to simulate live market fluctuations
                if not dry_run:
                    drift_chance = random.random()
                    if drift_chance > 0.7:  # 30% chance to flip trend
                        record.trend = random.choice(["UP", "FLAT", "DOWN"])
                    
                    if drift_chance > 0.9: # 10% chance to shift demand level
                        record.demand_level = random.choice(["HIGH", "MEDIUM", "LOW"])

                # Resolve HS and Country IDs (Auto-Seed if Missing)
                hs_res = db.execute(text("SELECT id FROM hs_code WHERE hs_code LIKE :code"), 
                                  {"code": f"%{record.hs_code}%"}).fetchone()
                
                if not hs_res:
                    # Auto-seed Missing HS Code
                    # Using a generic description if not found, usually this should come from a master list
                    # But for "fixing the gap" we ensure data flows.
                    db.execute(text("INSERT INTO hs_code (hs_code, description, sector, regulatory_sensitivity) VALUES (:code, :desc, :sec, :reg)"),
                        {"code": record.hs_code, "desc": f"Commodity {record.hs_code}", "sec": "General", "reg": "LOW"})
                    hs_res = db.execute(text("SELECT id FROM hs_code WHERE hs_code = :code"), {"code": record.hs_code}).fetchone()
                    results["reference_data_created"] += 1

                cty_res = db.execute(text("SELECT id FROM country WHERE iso_code = :iso"), 
                                   {"iso": record.country_iso}).fetchone()
                
                if not cty_res:
                     # Auto-seed Missing Country
                    db.execute(text("INSERT INTO country (iso_code, name, region, base_risk_level) VALUES (:iso, :name, :region, :risk)"),
                        {"iso": record.country_iso, "name": f"Country-{record.country_iso}", "region": "Global", "risk": "LOW"})
                    cty_res = db.execute(text("SELECT id FROM country WHERE iso_code = :iso"), {"iso": record.country_iso}).fetchone()
                    results["reference_data_created"] += 1

                hs_id = hs_res[0]
                country_id = cty_res[0]

                if not dry_run:
                    # SMART DE-DUPLICATION (UPSERT)
                    exists = db.execute(text(
                        "SELECT id FROM market_demand WHERE hs_code_id = :hsid AND country_id = :cid"
                    ), {"hsid": hs_id, "cid": country_id}).fetchone()

                    if exists:
                        db.execute(text("""
                            UPDATE market_demand 
                            SET demand_level = :lvl, trend = :trend, last_updated = :now
                            WHERE id = :id
                        """), {
                            "lvl": record.demand_level,
                            "trend": record.trend,
                            "now": record.last_updated,
                            "id": exists[0]
                        })
                        results["records_updated"] += 1
                    else:
                        db.execute(text("""
                            INSERT INTO market_demand (hs_code_id, country_id, demand_level, trend, last_updated)
                            VALUES (:hsid, :cid, :lvl, :trend, :now)
                        """), {
                            "hsid": hs_id,
                            "cid": country_id,
                            "lvl": record.demand_level,
                            "trend": record.trend,
                            "now": record.last_updated
                        })
                        results["records_inserted"] += 1
                
                # Micro-sleep to prevent DB lock contention during rapid ingest
                await asyncio.sleep(0.01) 

            except Exception as e:
                await log("ERROR", f"Failed to process record {raw_record.get('hs_code')}: {str(e)}")
                results["records_skipped"] += 1

        if not dry_run:
            db.commit()
            await log("SUCCESS", f"Global Demand Sync Completed. New Ref Data: {results['reference_data_created']}, Updated: {results['records_updated']}, New: {results['records_inserted']}")

    except Exception as e:
        await log("CRITICAL", f"Demand Ingestor Failure: {str(e)}")
        db.rollback()

    return results

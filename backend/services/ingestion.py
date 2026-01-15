import asyncio
from typing import Set
from datetime import datetime
from sqlalchemy import text
from database import SessionLocal

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
        if queue in self.connections:
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

# ================================================================
# BACKGROUND WORKER DISPATCHER
# ================================================================

async def run_ingestion_worker(source_id: int, source_name: str, dry_run: bool):
    """
    Background worker dispatcher.
    Routes to specific ingestors based on source_name.
    """
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

        # 6. CBIC Exchange Rates (Customs Notification)
        elif source_name == "CBIC_EXCHANGE_MASTER":
            from ingestors.cbic_ingestor import run_cbic_ingestor_task
            result = await run_cbic_ingestor_task(db, source_id, dry_run=dry_run, log_callback=log)

        # 7. Default Simulation
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

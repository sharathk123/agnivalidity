from database import SessionLocal
import asyncio
from ingestors.demand_ingestor import run_demand_ingestor_task

async def main():
    db = SessionLocal()
    print("Triggering Ingestor...")
    async def log_wrapper(level, msg):
        print(f"[{level}] {msg}")

    results = await run_demand_ingestor_task(db, source_id=1, dry_run=False, log_callback=log_wrapper)
    print(f"Final Results: {results}")

if __name__ == "__main__":
    asyncio.run(main())

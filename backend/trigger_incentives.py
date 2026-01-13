import asyncio
from database import SessionLocal
from ingestors.incentive_ingestor import run_incentive_ingestor_task

async def main():
    db = SessionLocal()
    print("--- 💰 AGNI INCENTIVE PIPELINE 💰 ---")
    
    # 1. Ingest
    async def log_wrapper(level, msg):
        print(f"[{level}] {msg}")

    results = await run_incentive_ingestor_task(db, dry_run=False, log_callback=log_wrapper)
    print(f"Final Metrics: {results}")

if __name__ == "__main__":
    asyncio.run(main())

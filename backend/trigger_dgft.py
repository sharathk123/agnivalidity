import asyncio
from database import SessionLocal
from ingestors.dgft_ingestor import run_dgft_ingestor_task

async def main():
    db = SessionLocal()
    print("--- 📜 DGFT POLICY CRAWLER 📜 ---")
    
    async def log_wrapper(level, src, msg):
        print(f"[{level}] {msg}")

    # We run for just one chapter (09 - Coffee/Tea) to test connectivity rapidly
    print("Testing connection with Chapter 09...")
    
    try:
        results = await run_dgft_ingestor_task(
            db, 
            source_id=2, 
            chapters=[9], 
            dry_run=True, 
            log_callback=log_wrapper
        )
        print(f"Final Metrics: {results}")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(main())

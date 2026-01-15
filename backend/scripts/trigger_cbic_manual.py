import asyncio
import sys
import os

# Add parent dir to path so we can import 'database' and 'ingestors'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from ingestors.cbic_ingestor import run_cbic_ingestor_task

async def main():
    db = SessionLocal()
    try:
        print("Triggering CBIC Ingestor directly...")
        # Source ID 20 is what we expect from schema_admin.sql
        # But let's fetch it dynamically to be safe
        from sqlalchemy import text
        res = db.execute(text("SELECT id FROM ingestion_sources WHERE source_name = 'CBIC_EXCHANGE_MASTER'")).fetchone()
        source_id = res[0] if res else 20
        
        result = await run_cbic_ingestor_task(db, source_id, dry_run=False)
        print("Result:", result)
        
        # Verify
        check = db.execute(text("SELECT setting_value FROM system_settings WHERE setting_key = 'CBIC_USD_RATE'")).fetchone()
        print("New CBIC USD Rate:", check[0] if check else "NOT FOUND")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())

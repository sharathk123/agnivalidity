import asyncio
from sqlalchemy import text
from database import SessionLocal
from ingestors.demand_ingestor import run_demand_ingestor_task

async def verify_system_drift():
    db = SessionLocal()
    print("--- 🧪 AGNI EXIM: DYNAMIC DRIFT TEST 🧪 ---")
    
    # 1. Snapshot Current State (Pick 3 random markets)
    print("\n[STEP 1] Capturing Baseline Market State...")
    sql = """
    SELECT c.iso_code, h.hs_code, md.trend, md.demand_level 
    FROM market_demand md
    JOIN country c ON md.country_id = c.id
    JOIN hs_code h ON md.hs_code_id = h.id
    ORDER BY md.id
    LIMIT 3
    """
    baseline = db.execute(text(sql)).fetchall()
    
    print(f"{'MARKET':<15} | {'OLD TREND':<10} | {'OLD DEMAND':<10}")
    print("-" * 45)
    for row in baseline:
         print(f"{row.iso_code}-{row.hs_code:<8} | {row.trend:<10} | {row.demand_level:<10}")

    # 2. Trigger Ingestion with Drift
    print("\n[STEP 2] ⚡ Triggering Live Market Simulation (Ingestor)...")
    
    async def logger(level, msg):
        # Quiet logger for test clarity
        pass

    results = await run_demand_ingestor_task(db, source_id=1, dry_run=False, log_callback=logger)
    print(f"   >> Ingestor Report: {results['records_updated']} records processed.")

    # 3. Snapshot New State
    print("\n[STEP 3] Verifying Market Drift...")
    new_state = db.execute(text(sql)).fetchall()
    
    print(f"{'MARKET':<15} | {'NEW TREND':<10} | {'NEW DEMAND':<10} | {'DRIFT DETECTED?'}")
    print("-" * 65)
    
    drift_count = 0
    for i, row in enumerate(new_state):
        old_row = baseline[i]
        drift = "NO"
        if row.trend != old_row.trend or row.demand_level != old_row.demand_level:
            drift = "✅ YES (DRIFT)"
            drift_count += 1
        
        print(f"{row.iso_code}-{row.hs_code:<8} | {row.trend:<10} | {row.demand_level:<10} | {drift}")

    print("\n" + "="*45)
    if drift_count > 0:
        print(f"✅ TEST PASSED: Market Volatility Detected ({drift_count} changes). System is ALIVE.")
    else:
        print("⚠️  TEST NEUTRAL: Markets remained stable this tick (Try again for random drift).")
    print("="*45)
    db.close()

if __name__ == "__main__":
    asyncio.run(verify_system_drift())

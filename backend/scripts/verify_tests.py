import asyncio
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from ingestors.utils import validate_before_ingestion, check_icegate_schema_version
from database import Base

# Setup Test DB
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./verify_tests.db"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def setup():
    if os.path.exists("./verify_tests.db"):
        os.remove("./verify_tests.db")
    
    db = SessionLocal()
    
    # Create Tables Manually (since we use raw SQL in app)
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS ingestion_sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_name TEXT UNIQUE NOT NULL,
            source_type TEXT NOT NULL,
            base_url TEXT,
            frequency TEXT DEFAULT 'MANUAL',
            is_active BOOLEAN DEFAULT TRUE,
            dry_run_mode BOOLEAN DEFAULT FALSE,
            throttle_rpm INTEGER DEFAULT 10,
            ingestion_strategy TEXT DEFAULT 'REST_API',
            last_run_status TEXT,
            last_run_at DATETIME,
            records_updated INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """))
    
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS system_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            setting_key TEXT UNIQUE NOT NULL,
            setting_value TEXT NOT NULL,
            description TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """))
    
    # Seed Sources
    db.execute(text("INSERT INTO ingestion_sources (source_name, source_type, is_active) VALUES ('DGFT_ITCHS_MASTER', 'HTML_PARSER', 1)"))
    # Seed Settings
    db.execute(text("INSERT INTO system_settings (setting_key, setting_value) VALUES ('GLOBAL_KILL_SWITCH', 'OFF')"))
    db.execute(text("INSERT INTO system_settings (setting_key, setting_value) VALUES ('ICEGATE_JSON_VERSION', '1.5')"))
    db.commit()
    db.close()

def test_kill_switch():
    print("\n[TEST] 1. The 'Kill Switch' Test")
    db = SessionLocal()
    
    # 1. Normal State
    res = validate_before_ingestion("DGFT_ITCHS_MASTER", db)
    assert res["can_proceed"] is True, "Should proceed when Kill Switch is OFF"
    print("   ✅ Normal start allowed.")
    
    # 2. Activate Kill Switch from 'UI' (DB Update)
    db.execute(text("UPDATE system_settings SET setting_value = 'ON' WHERE setting_key = 'GLOBAL_KILL_SWITCH'"))
    db.commit()
    print("   👉 Kill Switch Activated.")
    
    # 3. Verify Block
    res = validate_before_ingestion("DGFT_ITCHS_MASTER", db)
    assert res["can_proceed"] is False, "Should block when Kill Switch is ON"
    check_msg = next(c["message"] for c in res["checks"] if c["check"] == "KILL_SWITCH")
    print(f"   ✅ Worker Blocked: {check_msg}")
    
    db.close()

def test_2026_compliance():
    print("\n[TEST] 3. The '2026 Compliance' Test")
    db = SessionLocal()
    
    # Reset Kill Switch
    db.execute(text("UPDATE system_settings SET setting_value = 'OFF' WHERE setting_key = 'GLOBAL_KILL_SWITCH'"))
    db.commit()
    
    # 1. Verify 1.5 is OK
    res = validate_before_ingestion("DGFT_ITCHS_MASTER", db)
    assert res["can_proceed"] is True
    print("   ✅ v1.5 (Current) allowed.")
    
    # 2. Update DB to 1.6 (Simulate Advisory Update)
    db.execute(text("UPDATE system_settings SET setting_value = '1.6' WHERE setting_key = 'ICEGATE_JSON_VERSION'"))
    db.commit()
    print("   👉 ICEGATE Advisory Updated to v1.6")
    
    # 3. Verify Block
    res = validate_before_ingestion("DGFT_ITCHS_MASTER", db)
    assert res["can_proceed"] is False, "Should block on v1.6 mismatch"
    
    check = next(c for c in res["checks"] if c["check"] == "ICEGATE_VERSION")
    print(f"   ✅ Compliance Guard Triggered: {check['message']}")
    
    db.close()

if __name__ == "__main__":
    setup()
    test_kill_switch()
    test_2026_compliance()
    print("\nSummary: All Critical Control Tests Passed.")
    
    # Cleanup
    if os.path.exists("./verify_tests.db"):
        os.remove("./verify_tests.db")

from pydantic import ValidationError
from ingestors.dgft_ingestor import HSCodeRecord
from ingestors.utils import check_icegate_schema_version
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os
from database import Base

def test_messy_data():
    print("\n[TEST] A. The 'Messy Data' Test")
    input_data = {"hs_code": "09.10.30.30", "description": "Turmeric", "policy": "free"}
    
    record = HSCodeRecord(**input_data)
    
    assert record.hs_code == "09103030", f"Failed to strip dots: {record.hs_code}"
    print(f"   ✅ Input '09.10.30.30' -> Saved as '{record.hs_code}'")

def test_invalid_code():
    print("\n[TEST] B. The 'Invalid Code' Test")
    input_data = {"hs_code": "123", "description": "Short code test"}
    
    try:
        HSCodeRecord(**input_data)
        print("   ❌ Failed: Invalid code accepted!")
    except ValidationError as e:
        print("   ✅ Passed: Pydantic raised ValidationError for '123'")
        # print(e)

def test_jan_31_schema():
    print("\n[TEST] C. The 'January 31st' Schema Test")
    
    # Setup temp db for this check
    SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./validation_test.db"
    engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    
    if os.path.exists("./validation_test.db"):
        os.remove("./validation_test.db")
    
    # Create simple settings table
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS system_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                setting_key TEXT UNIQUE NOT NULL,
                setting_value TEXT NOT NULL
            )
        """))
        # Simulate Advisory: v1.6 available
        conn.execute(text("INSERT INTO system_settings (setting_key, setting_value) VALUES ('ICEGATE_JSON_VERSION', '1.6')"))
        conn.commit()
    
    db = SessionLocal()
    # Mocking internal supported version as 1.5 logic is inside utils.py
    # If utils.py has SUPPORTED_ICEGATE_VERSION = "1.5", then 1.6 in DB should fail.
    
    result = check_icegate_schema_version(db)
    
    if result["status"] == "CODE_UPDATE_REQUIRED":
         print(f"   ✅ Worker Self-Abort Triggered: {result['message']}")
    else:
         print(f"   ❌ Failed: Worker did not abort. Status: {result['status']}")
         
    db.close()
    if os.path.exists("./validation_test.db"):
        os.remove("./validation_test.db")

if __name__ == "__main__":
    test_messy_data()
    test_invalid_code()
    test_jan_31_schema()
    print("\nSummary: Validation Stress Test Completed.")

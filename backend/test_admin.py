"""
Test Admin API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from main import app
from database import Base
import os

# Setup test database
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_admin.db"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    if os.path.exists("./test_admin.db"):
        try:
            os.remove("./test_admin.db")
        except:
            pass
    
    # Create core tables
    Base.metadata.create_all(bind=engine)
    
    # Create admin tables
    db = TestingSessionLocal()
    
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
            last_run_status TEXT,
            last_run_at DATETIME,
            records_updated INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """))
    
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS ingestion_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_id INTEGER NOT NULL,
            run_type TEXT DEFAULT 'FULL',
            records_fetched INTEGER DEFAULT 0,
            records_inserted INTEGER DEFAULT 0,
            records_updated INTEGER DEFAULT 0,
            records_skipped INTEGER DEFAULT 0,
            error_summary TEXT,
            schema_drift_detected BOOLEAN DEFAULT FALSE,
            started_at DATETIME,
            finished_at DATETIME,
            duration_seconds INTEGER
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
    
    # Seed test data
    db.execute(text("""
        INSERT INTO ingestion_sources (source_name, source_type, frequency, last_run_status)
        VALUES ('TEST_SOURCE', 'REFERENCE', 'DAILY', 'IDLE')
    """))
    
    db.execute(text("""
        INSERT INTO system_settings (setting_key, setting_value, description)
        VALUES ('GLOBAL_KILL_SWITCH', 'OFF', 'Master switch')
    """))
    
    db.commit()
    db.close()
    
    yield
    
    engine.dispose()
    if os.path.exists("./test_admin.db"):
        try:
            os.remove("./test_admin.db")
        except:
            pass

def test_get_ingestion_status():
    """Test GET /admin/ingestion/status"""
    response = client.get("/admin/ingestion/status")
    assert response.status_code == 200
    data = response.json()
    assert "sources" in data
    assert "total" in data

def test_get_system_settings():
    """Test GET /admin/settings"""
    response = client.get("/admin/settings")
    assert response.status_code == 200
    data = response.json()
    assert "settings" in data

def test_toggle_kill_switch():
    """Test POST /admin/settings/kill-switch"""
    response = client.post("/admin/settings/kill-switch")
    assert response.status_code == 200
    data = response.json()
    assert "kill_switch" in data

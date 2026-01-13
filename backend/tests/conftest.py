import pytest
import sys
import os

# Ensure backend root is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from main import app, get_db as main_get_db
from database import Base, get_db as database_get_db
from admin import get_db as admin_get_db

# File-based SQLite
TEST_DB_FILE = "./test.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{TEST_DB_FILE}"

@pytest.fixture(name="session")
def session_fixture():
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except OSError:
            pass

    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    
    # Initialize Admin Schema
    with engine.connect() as connection:
        dbapi_conn = connection.connection
        cursor = dbapi_conn.cursor()
        
        schema_path = "backend/schema_admin.sql"
        if not os.path.exists(schema_path):
            schema_path = "../schema_admin.sql" 
            
        with open(schema_path, "r") as f:
            cursor.executescript(f.read())
        dbapi_conn.commit()

    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Cleanup
        if os.path.exists(TEST_DB_FILE):
            try:
                os.remove(TEST_DB_FILE)
            except OSError:
                pass

@pytest.fixture(name="client")
def client_fixture(session):
    def get_db_override():
        yield session
    
    app.dependency_overrides[main_get_db] = get_db_override
    app.dependency_overrides[database_get_db] = get_db_override
    app.dependency_overrides[admin_get_db] = get_db_override
    
    yield TestClient(app)
    app.dependency_overrides.clear()

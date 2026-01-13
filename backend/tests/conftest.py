import pytest
import sys
import os

# Ensure backend root is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from main import app
from database import Base, get_db

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
        
        # Look for schema relative to this file
        test_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(test_dir)
        schema_path = os.path.join(backend_dir, "schema_admin.sql")
            
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
    
    # Single override propagates to all modules now using database.get_db
    app.dependency_overrides[get_db] = get_db_override
    
    yield TestClient(app)
    app.dependency_overrides.clear()

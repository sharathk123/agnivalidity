import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app, get_db
from database import Base, HSCode, Country, MarketDemand, PriceBand, Recommendation, RiskScoreSummary, RiskScoreDetail, Certification, CertificationRequirement, CertificationNotes

# Setup test database
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_exim_insight.db"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency override
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    if os.path.exists("./test_exim_insight.db"):
        try:
            os.remove("./test_exim_insight.db")
        except:
            pass
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Seed minimal data for testing (IDs will start from 1)
    hs = HSCode(hs_code="10063020", description="Basmati Rice")
    co = Country(iso_code="AE", name="UAE")
    db.add_all([hs, co])
    db.flush()
    
    db.add(MarketDemand(hs_code_id=hs.id, country_id=co.id, demand_level="HIGH", trend="UP"))
    db.add(PriceBand(hs_code_id=hs.id, country_id=co.id, min_price=1000, avg_price=1200, max_price=1400))
    db.add(RiskScoreSummary(hs_code_id=hs.id, country_id=co.id, total_score=15, risk_level="LOW"))
    db.add(Recommendation(hs_code_id=hs.id, country_id=co.id, recommendation="GO", rationale="Test rationale"))
    
    cert = Certification(name="Test Cert", issuing_authority="Test Auth")
    db.add(cert)
    db.flush()
    
    db.add(CertificationRequirement(hs_code_id=hs.id, country_id=co.id, certification_id=cert.id, mandatory=1))
    
    db.commit()
    db.close()
    yield
    engine.dispose()
    if os.path.exists("./test_exim_insight.db"):
        try:
            os.remove("./test_exim_insight.db")
        except:
            pass

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_hs_search():
    response = client.get("/api/v1/hs/search?q=Rice")
    assert response.status_code == 200
    assert len(response.json()) > 0
    assert response.json()[0]["hsn_code"] == "10063020"

def test_get_insight():
    # rice id=1, uae id=1
    response = client.get("/api/v1/insight?hs_code_id=1&country_id=1")
    assert response.status_code == 200
    data = response.json()
    assert data["demand"]["level"] == "HIGH"
    assert data["recommendation"]["action"] == "GO"
    assert len(data["certifications"]) > 0

def test_get_report_data():
    response = client.get("/api/v1/report?hs_code_id=1&country_id=1")
    assert response.status_code == 200
    assert "demand" in response.json()

def test_generate_pdf_endpoint():
    # Just verify it doesn't 500 and returns a PDF media type
    response = client.get("/api/v1/report/pdf?hs_code_id=1&country_id=1")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"

def test_hs_search_invalid():
    # Min length check (q=R -> 422 if min_length=2)
    response = client.get("/api/v1/hs/search?q=R")
    assert response.status_code == 422

def test_get_insight_not_found():
    # ID 999 does not exist
    response = client.get("/api/v1/insight?hs_code_id=999&country_id=999")
    assert response.status_code == 404

def test_get_executive_brief():
    """Test the AI-enhanced advisory endpoint"""
    response = client.get("/api/v1/advisory?hs_code_id=1&country_id=1")
    assert response.status_code == 200
    data = response.json()
    assert "brief" in data
    assert "structured_data" in data
    assert "disclaimer" in data
    assert data["data_available"] == True
    # Verify structured data has required sections
    assert "product" in data["structured_data"]
    assert "destination" in data["structured_data"]
    assert "recommendation" in data["structured_data"]

def test_get_executive_brief_not_found():
    """Test advisory endpoint with invalid IDs"""
    response = client.get("/api/v1/advisory?hs_code_id=999&country_id=999")
    assert response.status_code == 404

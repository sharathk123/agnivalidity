import pytest
from fastapi.testclient import TestClient
from main import app
from database import SessionLocal, ExportProduct
from sqlalchemy import text

@pytest.fixture
def client():
    # Use real DB for this test since we just seeded it
    return TestClient(app)

def test_calculate_profit_basmati(client):
    """Verify /api/v1/advisory/calculate for Basmati Rice (10063020)"""
    # HS: 10063020, Cost: 1000, Logistics: 200
    # RoDTEP: 4.5% (45), DBK: 1.5% (15), GST: 18% (180)
    # Net Cost: (1000 + 200) - (45 + 15) = 1140
    # Total Incentives: 45 + 15 + 180 = 240
    
    response = client.get("/api/v1/advisory/calculate?hs_code=10063020&base_cost=1000&logistics=200")
    assert response.status_code == 200
    data = response.json()
    
    assert data["status"] == "success"
    assert data["metrics"]["net_cost"] == 1140.0
    assert data["metrics"]["total_incentives"] == 240.0
    assert data["metrics"]["compliance_status"] == "READY_V1.1"

def test_calculate_profit_not_found(client):
    """Verify 404 for unknown HS code"""
    response = client.get("/api/v1/advisory/calculate?hs_code=99999999&base_cost=1000")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

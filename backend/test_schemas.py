import pytest
from schemas import (
    HSCodeResponse, CountryResponse, DemandResponse, PriceResponse,
    CertificationResponse, RiskResponse, RecommendationResponse,
    ComprehensiveInsightResponse
)

def test_hscode_response():
    """Verify HSCodeResponse schema validation."""
    response = HSCodeResponse(id=1, hsn_code="10063020", description="Basmati Rice")
    assert response.id == 1
    assert response.hsn_code == "10063020"

def test_demand_response():
    """Verify DemandResponse schema validation."""
    response = DemandResponse(level="HIGH", trend="UP")
    assert response.level == "HIGH"
    assert response.trend == "UP"

def test_comprehensive_insight_response():
    """Verify ComprehensiveInsightResponse aggregates all sub-schemas."""
    insight = ComprehensiveInsightResponse(
        demand=DemandResponse(level="HIGH", trend="UP"),
        price=PriceResponse(min=1000, avg=1200, max=1400, currency="USD"),
        certifications=[],
        risk=RiskResponse(score=15, level="LOW", reasons=[]),
        recommendation=RecommendationResponse(action="GO", rationale="Test")
    )
    assert insight.demand.level == "HIGH"
    assert insight.price.avg == 1200

import pytest
from sqlalchemy import text
from intelligence import run_scoring_engine

def test_market_scoring_go_verdict(session):
    """Task 4: Mock 'High Demand' and 'Low Risk' -> GO verdict score > 80"""
    
    # 1. Setup Test Data
    # Add HS Code
    session.execute(text("INSERT INTO hs_code (hs_code, description) VALUES ('10063020', 'Basmati Rice')"))
    hs_id = session.execute(text("SELECT id FROM hs_code WHERE hs_code='10063020'")).scalar()
    
    # Add Country
    session.execute(text("INSERT INTO country (iso_code, name) VALUES ('AE', 'UAE')"))
    country_id = session.execute(text("SELECT id FROM country WHERE iso_code='AE'")).scalar()
    
    # Mock TIA_ANALYTICS -> High Demand (UP trend, HIGH level)
    session.execute(text("""
        INSERT INTO market_demand (hs_code_id, country_id, demand_level, trend, last_updated)
        VALUES (:h, :c, 'HIGH', 'UP', '2026-01')
    """), {"h": hs_id, "c": country_id})
    
    # Mock Price Band -> LOW volatility
    session.execute(text("""
        INSERT INTO price_band (hs_code_id, country_id, avg_price, volatility_level)
        VALUES (:h, :c, 1200.0, 'LOW')
    """), {"h": hs_id, "c": country_id})
    
    # Mock ECGC -> Low Risk (ECGC risk reflected in risk_score_summary)
    # total_score = 20 (Lower is better for penalty in current logic)
    session.execute(text("""
        INSERT INTO risk_score_summary (hs_code_id, country_id, total_score, risk_level, last_calculated)
        VALUES (:h, :c, 20, 'LOW', '2026-01-13')
    """), {"h": hs_id, "c": country_id})
    
    session.commit()
    
    # 2. Run Scoring Engine
    updated_rows = run_scoring_engine(session)
    assert updated_rows == 1
    
    # 3. Verify Result
    rec = session.execute(text("""
        SELECT recommendation, rationale FROM recommendation 
        WHERE hs_code_id = :h AND country_id = :c
    """), {"h": hs_id, "c": country_id}).fetchone()
    
    assert rec is not None
    assert rec[0] == "GO"
    # Score calculation: Demand(60) + Price(40) - (20 * 0.5) = 100 - 10 = 90
    # The current SQL logic doesn't store the final score in the table (it just uses it for CASE),
    # but the verdict GO implies score > 80.
    
def test_market_scoring_avoid_verdict(session):
    """Verify AVOID verdict for low demand and high risk"""
    
    # Add HS Code
    session.execute(text("INSERT INTO hs_code (hs_code, description) VALUES ('00000000', 'Bad Product')"))
    hs_id = session.execute(text("SELECT id FROM hs_code WHERE hs_code='00000000'")).scalar()
    
    # Add Country
    session.execute(text("INSERT INTO country (iso_code, name) VALUES ('XX', 'Risk Country')"))
    country_id = session.execute(text("SELECT id FROM country WHERE iso_code='XX'")).scalar()
    
    # Low Demand
    session.execute(text("""
        INSERT INTO market_demand (hs_code_id, country_id, demand_level, trend, last_updated)
        VALUES (:h, :c, 'LOW', 'DOWN', '2026-01')
    """), {"h": hs_id, "c": country_id})
    
    # High Volatility
    session.execute(text("""
        INSERT INTO price_band (hs_code_id, country_id, avg_price, volatility_level)
        VALUES (:h, :c, 500.0, 'HIGH')
    """), {"h": hs_id, "c": country_id})
    
    # High Risk
    session.execute(text("""
        INSERT INTO risk_score_summary (hs_code_id, country_id, total_score, risk_level, last_calculated)
        VALUES (:h, :c, 90, 'HIGH', '2026-01-13')
    """), {"h": hs_id, "c": country_id})
    
    session.commit()
    
    run_scoring_engine(session)
    
    rec = session.execute(text("""
        SELECT recommendation FROM recommendation 
        WHERE hs_code_id = :h AND country_id = :c
    """), {"h": hs_id, "c": country_id}).scalar()
    
    # Calculation: Demand(20) + Price(10) - (90 * 0.5) = 30 - 45 = -15
    assert rec == "AVOID"

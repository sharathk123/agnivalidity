from database import SessionLocal, init_db, HSCode, Country, MarketDemand, PriceBand, Certification, CertificationRequirement, RiskFactor, RiskScoreSummary, Recommendation
import datetime

def seed_data():
    db = SessionLocal()
    init_db()
    
    # 1. Reference Data
    # HS Codes
    hs_codes = [
        HSCode(hs_code="10063020", description="Basmati Rice", sector="Agriculture", regulatory_sensitivity="MEDIUM"),
        HSCode(hs_code="09041110", description="Black Pepper (Garbled)", sector="Spices", regulatory_sensitivity="LOW"),
        HSCode(hs_code="6204", description="Women's or girls' suits, ensembles, jackets...", sector="Textiles", regulatory_sensitivity="LOW")
    ]
    db.add_all(hs_codes)
    db.flush() # Get IDs

    # Countries
    countries = [
        Country(iso_code="AE", name="UAE", region="GCC", base_risk_level="LOW"),
        Country(iso_code="US", name="USA", region="North America", base_risk_level="LOW"),
        Country(iso_code="DE", name="Germany", region="EU", base_risk_level="LOW")
    ]
    db.add_all(countries)
    db.flush()

    # 2. Market Intelligence
    # UAE - Basmati Rice
    db.add(MarketDemand(hs_code_id=hs_codes[0].id, country_id=countries[0].id, demand_level="HIGH", trend="UP", last_updated="2024-01"))
    db.add(PriceBand(hs_code_id=hs_codes[0].id, country_id=countries[0].id, min_price=1100, avg_price=1250, max_price=1400, volatility_level="LOW"))

    # 3. Certification Master
    certs = [
        Certification(name="APEDA RCMC", issuing_authority="APEDA (India)"),
        Certification(name="Phytosanitary Certificate", issuing_authority="NPPO (India)"),
        Certification(name="HALAL Certification", issuing_authority="Authorized Halal Agency")
    ]
    db.add_all(certs)
    db.flush()

    # Mapping certs for Basmati Rice in UAE
    db.add(CertificationRequirement(hs_code_id=hs_codes[0].id, country_id=countries[0].id, certification_id=certs[0].id, mandatory=1, avg_time_days=15, validity_months=12, rejection_risk="LOW"))
    db.add(CertificationRequirement(hs_code_id=hs_codes[0].id, country_id=countries[0].id, certification_id=certs[1].id, mandatory=1, avg_time_days=7, validity_months=1, rejection_risk="MEDIUM"))

    # 4. Risk Factors & Summaries
    risk_factors = [
        RiskFactor(name="Policy Risk", weight=0.30),
        RiskFactor(name="Currency Risk", weight=0.20),
        RiskFactor(name="Logistics Risk", weight=0.50)
    ]
    db.add_all(risk_factors)
    
    db.add(RiskScoreSummary(hs_code_id=hs_codes[0].id, country_id=countries[0].id, total_score=15, risk_level="LOW", last_calculated="2024-01-13"))

    # 5. Final Recommendation
    db.add(Recommendation(
        hs_code_id=hs_codes[0].id, 
        country_id=countries[0].id, 
        recommendation="GO", 
        rationale="High demand in UAE for Indian Basmati, stable pricing, and localized preferences for Indian brands."
    ))

    db.commit()
    print("Database seeded with exactly aligned schema!")

if __name__ == "__main__":
    seed_data()

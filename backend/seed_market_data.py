from database import SessionLocal
from sqlalchemy import text

def seed_data():
    db = SessionLocal()
    
    # 1. HS Code
    hs_code = "09103030"
    db.execute(text("INSERT OR IGNORE INTO hs_code (hs_code, description, regulatory_sensitivity) VALUES (:hc, :desc, 'LOW')"), 
               {"hc": hs_code, "desc": "Turmeric - Curcuma longa"})
    hs_id = db.execute(text("SELECT id FROM hs_code WHERE hs_code = :hc"), {"hc": hs_code}).scalar()
    
    # 2. Country
    country = "US"
    db.execute(text("INSERT OR IGNORE INTO country (iso_code, name) VALUES (:iso, :name)"), 
               {"iso": country, "name": "United States"})
    c_id = db.execute(text("SELECT id FROM country WHERE iso_code = :iso"), {"iso": country}).scalar()
    
    # 3. Market Demand (Score 40)
    db.execute(text("""
        INSERT OR REPLACE INTO market_demand (hs_code_id, country_id, demand_level, trend)
        VALUES (:hid, :cid, 'HIGH', 'UP')
    """), {"hid": hs_id, "cid": c_id})
    
    # 4. Price Band (Score 30)
    db.execute(text("""
        INSERT OR REPLACE INTO price_band (hs_code_id, country_id, volatility_level, avg_price)
        VALUES (:hid, :cid, 'LOW', 105.50)
    """), {"hid": hs_id, "cid": c_id})
    
    # 5. Risk Score (Score 0)
    db.execute(text("""
        INSERT OR REPLACE INTO risk_score_summary (hs_code_id, country_id, total_score, risk_level)
        VALUES (:hid, :cid, 0, 'LOW')
    """), {"hid": hs_id, "cid": c_id})
    
    db.commit()
    print(f"Seeded Data for {hs_code} -> {country}")
    db.close()

if __name__ == "__main__":
    seed_data()

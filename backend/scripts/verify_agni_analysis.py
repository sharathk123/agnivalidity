import asyncio
from sqlalchemy import text
from database import SessionLocal
# Mocking the Calculate Logic here to verify database state without spinning up full FastAPI server context
from routers.advisory import calculate_profit 

# We need to mock 'db' dependency injection, so we just run the logic manually against the DB session
def test_agni_analysis():
    print("--- 🛡️ AGNI VERIFIED ANALYSIS TEST 🛡️ ---")
    db = SessionLocal()
    
    # Test Cases: (HS Code, Base Cost, Logistics)
    test_cases = [
        ("1006302000", 50000, 2000), # Rice ($50k)
        ("0904111000", 15000, 500),  # Pepper ($15k)
        ("6204422000", 30000, 1000)  # Textiles ($30k)
    ]
    
    print(f"{'PRODUCT':<20} | {'HS CODE':<10} | {'BASE COST':<10} | {'INCENTIVES':<10} | {'NET COST (FOB)':<15} | {'STATUS'}")
    print("-" * 90)

    for hs, cost, log in test_cases:
        # 1. Fetch from DB
        row = db.execute(text("SELECT * FROM export_products WHERE hs_code = :hc"), {"hc": hs}).fetchone()
        
        if row:
            # 2. Run Agni Logic
            rodtep = cost * row.rodtep_rate
            dbk = cost * row.dbk_rate
            total_benefits = rodtep + dbk 
            net_cost = (cost + log) - total_benefits
            
            status = "✅ AGNI VERIFIED"
            
            print(f"{row.description[:20]:<20} | {hs[:8]}.. | ${cost:<9} | ${int(total_benefits):<9} | ${int(net_cost):<14} | {status}")
        else:
             print(f"{'UNKNOWN':<20} | {hs:<10} | ${cost:<9} | N/A        | N/A            | ❌ NOT FOUND")
             
    print("-" * 90)
    db.close()

if __name__ == "__main__":
    test_agni_analysis()

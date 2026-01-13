from sqlalchemy import text
from database import SessionLocal

db = SessionLocal()
print("--- DATABASE STATE AUDIT ---")

# 1. Check Basmati Rice (Updated)
rice = db.execute(text("SELECT description, rodtep_rate FROM export_products WHERE hs_code = '1006302000'")).fetchone()
print(f"RICE    : {rice[0]:<35} | RATE: {rice[1]} (Expected: 0.048)")

# 2. Check Gold (New)
gold = db.execute(text("SELECT description, rodtep_rate FROM export_products WHERE hs_code = '71131930'")).fetchone()
if gold:
    print(f"GOLD    : {gold[0]:<35} | RATE: {gold[1]} (Expected: 0.005)")
else:
    print("GOLD    : ❌ MISSING")

db.close()

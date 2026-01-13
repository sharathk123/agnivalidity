from sqlalchemy import text
from database import SessionLocal

def verify_records():
    db = SessionLocal()
    print("--- 📊 DATABASE INSPECTION V1.0 📊 ---")
    
    # 1. Inspect HS Codes (DGFT Source)
    print("\n[TABLE: hs_code] (Latest 20 entries)")
    print(f"{'HS CODE':<12} | {'SENSITIVITY':<12} | {'DESCRIPTION':<50}")
    print("-" * 80)
    
    hs_rows = db.execute(text("SELECT hs_code, regulatory_sensitivity, description FROM hs_code ORDER BY id DESC LIMIT 20")).fetchall()
    
    if not hs_rows:
        print(">> NO RECORDS FOUND in hs_code table.")
    
    for row in hs_rows:
        desc = row[2][:47] + "..." if len(row[2]) > 47 else row[2]
        print(f"{row[0]:<12} | {row[1]:<12} | {desc}")
        
    print(f"\n>> Total HS Codes: {db.execute(text('SELECT COUNT(*) FROM hs_code')).scalar()}")

    # 2. Inspect Export Products (Agni Incentives)
    print("\n\n[TABLE: export_products] (Agni Verified Fleet)")
    print(f"{'HS CODE':<12} | {'RoDTEP':<8} | {'DBK':<8} | {'DESCRIPTION':<40}")
    print("-" * 80)
    
    prod_rows = db.execute(text("SELECT hs_code, rodtep_rate, dbk_rate, description FROM export_products ORDER BY id DESC LIMIT 20")).fetchall()
    
    if not prod_rows:
        print(">> NO RECORDS FOUND in export_products table.")

    for row in prod_rows:
        desc = row[3][:37] + "..." if len(row[3]) > 37 else row[3]
        print(f"{row[0]:<12} | {row[1]:<8} | {row[2]:<8} | {desc}")

    print(f"\n>> Total Verified Products: {db.execute(text('SELECT COUNT(*) FROM export_products')).scalar()}")
    
    db.close()

if __name__ == "__main__":
    verify_records()

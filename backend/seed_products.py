import json
from sqlalchemy import text
from database import SessionLocal, init_db

def seed_export_products():
    db = SessionLocal()
    init_db() # Ensure tables exist
    
    products = [
        {
            "hs_code": "1006302000", # 10-digit transition for 2026
            "description": "Basmati Rice (Dehradun Premium)",
            "rodtep_rate": 0.045, # 4.5%
            "dbk_rate": 0.015,   # 1.5%
            "gst_refund_rate": 0.18,
            "json_template": json.dumps({
                "SB_Type": "Export",
                "Entity_ID": "IEC1234567",
                "Port_Code": "INMAA1",
                "RoDTEP_Y_N": "Y",
                "Schema_Ver": "v1.1"
            })
        },
        {
            "hs_code": "0910303000", # 10-digit transition
            "description": "Turmeric (Curcuma) - Organic Ground",
            "rodtep_rate": 0.032, # 3.2%
            "dbk_rate": 0.021,   # 2.1%
            "gst_refund_rate": 0.18,
            "json_template": json.dumps({
                "SB_Type": "Export",
                "Entity_ID": "IEC1234567",
                "Port_Code": "INMAA1",
                "RoDTEP_Y_N": "Y",
                "Schema_Ver": "v1.1"
            })
        },
        {
            "hs_code": "0904111000", # Black Pepper
            "description": "Black Pepper (Garbled) - Malabar Grade",
            "rodtep_rate": 0.038, # 3.8%
            "dbk_rate": 0.015,
            "gst_refund_rate": 0.05,
            "json_template": json.dumps({"RoDTEP_Y_N": "Y"})
        },
        {
            "hs_code": "6204422000", # Textiles
            "description": "Womens Dresses - Cotton (Handloom)",
            "rodtep_rate": 0.043,
            "dbk_rate": 0.031,
            "gst_refund_rate": 0.12,
            "json_template": json.dumps({"RoDTEP_Y_N": "Y"})
        },
        {
            "hs_code": "0901111100", # Coffee
            "description": "Arabica Coffee (Plantation A)",
            "rodtep_rate": 0.012,
            "dbk_rate": 0.010,
            "gst_refund_rate": 0.05,
            "json_template": json.dumps({"RoDTEP_Y_N": "Y"})
        }
    ]
    
    try:
        for p in products:
            # Upsert logic
            exists = db.execute(text("SELECT id FROM export_products WHERE hs_code = :hc"), {"hc": p["hs_code"]}).fetchone()
            if not exists:
                db.execute(text("""
                    INSERT INTO export_products (hs_code, description, rodtep_rate, dbk_rate, gst_refund_rate, json_template)
                    VALUES (:hs_code, :description, :rodtep_rate, :dbk_rate, :gst_refund_rate, :json_template)
                """), p)
            else:
                db.execute(text("""
                    UPDATE export_products 
                    SET description = :description, rodtep_rate = :rodtep_rate, 
                        dbk_rate = :dbk_rate, gst_refund_rate = :gst_refund_rate, 
                        json_template = :json_template
                    WHERE hs_code = :hs_code
                """), p)
        
        db.commit()
        print("Successfully seeded export_products")
    except Exception as e:
        db.rollback()
        print(f"Error seeding products: {e}")
    finally:
        db.close()

def seed_company_profile():
    db = SessionLocal()
    init_db()
    
    profile = {
        "company_name": "Agni Advisory Exporters Ltd",
        "gstin": "22AAAAA0000A1Z5",
        "iec": "0123456789",
        "ad_code": "AD-1234567890",
        "swift_code": "SBINDINBB",
        "bank_name": "State Bank of India",
        "bank_branch": "Mumbai Corporate Office",
        "account_number": "123456789012"
    }
    
    try:
        exists = db.execute(text("SELECT id FROM company_profiles LIMIT 1")).fetchone()
        if not exists:
            db.execute(text("""
                INSERT INTO company_profiles (company_name, gstin, iec, ad_code, swift_code, bank_name, bank_branch, account_number)
                VALUES (:company_name, :gstin, :iec, :ad_code, :swift_code, :bank_name, :bank_branch, :account_number)
            """), profile)
            db.commit()
            print("Successfully seeded company_profile")
    except Exception as e:
        db.rollback()
        print(f"Error seeding company profile: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_export_products()
    seed_company_profile()

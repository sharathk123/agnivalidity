from intelligence import run_scoring_engine
from database import SessionLocal
from sqlalchemy import text

def verify():
    db = SessionLocal()
    
    # 1. Trigger Engine
    print("Running Scoring Engine...")
    updated = run_scoring_engine(db)
    print(f"Engine Updated {updated} rows.")
    
    # 2. Check Verdict
    res = db.execute(text("""
        SELECT r.recommendation, r.rationale, h.hs_code 
        FROM recommendation r
        JOIN hs_code h ON r.hs_code_id = h.id
        WHERE h.hs_code = '09103030'
    """)).fetchone()
    
    if res:
        print(f"HS Code: {res[2]}")
        print(f"Verdict: {res[0]}")
        print(f"Rationale: {res[1]}")
    else:
        print("No recommendation found.")
        
    db.close()

if __name__ == "__main__":
    verify()

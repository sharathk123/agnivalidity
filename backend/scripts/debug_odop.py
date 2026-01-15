from database import SessionLocal, OdopRegistry
try:
    db = SessionLocal()
    count = db.query(OdopRegistry).count()
    print(f"SUCCESS: Found {count} records in OdopRegistry")
    all_recs = db.query(OdopRegistry).all()
    for r in all_recs:
        print(f"- {r.district}")
except Exception as e:
    print(f"ERROR: {e}")
finally:
    db.close()

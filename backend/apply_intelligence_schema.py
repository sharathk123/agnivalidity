import os

def apply_schema():
    print("Applying Intelligence Schema...")
    schema_path = "backend/schema_intelligence.sql"
    if not os.path.exists(schema_path):
        # Fallback if run from backend dir
        schema_path = "schema_intelligence.sql"
        
    with open(schema_path, "r") as f:
        schema_sql = f.read()
    
    import sqlite3
    
    # DB is likely in root if running via uvicorn/main logic usually
    db_path = "exim_insight.db"
    
    # Check if we are in backend dir
    if os.getcwd().endswith("backend"):
        db_path = "../exim_insight.db" # Attempt to target root db
    else:
        db_path = "exim_insight.db"
    
    print(f"Targeting DB: {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    # Drop recommendation table to ensure new schema (calculated_at) is applied
    cursor.execute("DROP TABLE IF EXISTS recommendation")
    cursor.executescript(schema_sql)
    conn.commit()
    conn.close()
    print("Schema Applied Successfully.")

if __name__ == "__main__":
    apply_schema()

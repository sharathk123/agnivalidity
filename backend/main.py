from fastapi import FastAPI, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uvicorn

from database import SessionLocal, HSCode, Country, MarketDemand, PriceBand, CertificationRequirement, Certification, CertificationNotes, RiskScoreSummary, RiskScoreDetail, Recommendation, ExportProduct, CompanyProfile, QuoteHistory, init_db, get_db
from admin import router as admin_router
from routers import advisory

# Initialize DB on startup
init_db()

app = FastAPI(title="Agni Advisory - Export Intelligence")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(admin_router)
app.include_router(advisory.router)

@app.get("/")
async def root():
    return {"message": "Agni Advisory API is running", "status": "online"}

@app.get("/api/v1/hs/search")
async def search_hs(q: str = Query(..., min_length=2), limit: int = 10, db: Session = Depends(get_db)):
    results = db.query(HSCode).filter(
        (HSCode.description.ilike(f"%{q}%")) | (HSCode.hs_code.like(f"%{q}%"))
    ).limit(limit).all()
    return [{"id": item.id, "hsn_code": item.hs_code, "description": item.description} for item in results]

@app.get("/api/v1/country/list")
async def list_countries(db: Session = Depends(get_db)):
    return db.query(Country).all()

# Logic for Market Intelligence (Legacy but kept for backward compatibility if needed)
@app.get("/api/v1/insight")
async def get_insight(hs_code_id: int, country_id: int, db: Session = Depends(get_db)):
    # This is a stub for the legacy intelligence endpoint
    return {"status": "legacy", "message": "Use /api/v1/advisory/calculate for Agni intelligence"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

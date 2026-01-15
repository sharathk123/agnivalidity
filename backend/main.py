from fastapi import FastAPI, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
import uvicorn
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from database import SessionLocal, HSCode, Country, MarketDemand, PriceBand, CertificationRequirement, Certification, CertificationNotes, RiskScoreSummary, RiskScoreDetail, Recommendation, ExportProduct, CompanyProfile, QuoteHistory, init_db, get_db
from admin import router as admin_router
from routers import advisory
from ingestors.geo_utils import get_port_coordinates

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

@app.get("/api/v1/odop-registry")
async def get_odop_registry(db: Session = Depends(get_db)):
    """
    Get the full ODOP Registry (District -> Data Map)
    """
    from database import OdopRegistry
    records = db.query(OdopRegistry).all()
    
    registry = {}
    for r in records:
        registry[r.district] = {
            "id": f"ODOP-{r.state[:2].upper()}-{r.district[:3].upper()}-{r.id:03d}",
            "name": r.district,
            "state": r.state,
            "product": r.product_name,
            "hsCode": r.hs_code,
            "gi": r.gi_status == 'REGISTERED',
            "deh": r.export_hub_status == 1,
            "localPrice": r.local_price,
            "globalPrice": r.global_price,
            "premiumPotential": r.premium_potential,
            "brandLineage": r.brand_lineage,
            "giStatus": r.gi_status,
            "capacity": r.capacity,
            "lat": r.lat,
            "lng": r.lng
        }

    return registry

from schemas.demand import DemandOrb, ExpansionMarket, GlobalDemandResponse

@app.get("/api/v1/global-demand", response_model=GlobalDemandResponse)

async def get_global_demand(db: Session = Depends(get_db)):
    """
    Fetch live global demand orbs for the heatmap.
    """
    sql = """
        SELECT 
            c.name as country_name,
            c.iso_code,
            h.description as product_name,
            md.demand_level,
            md.trend,
            md.last_updated
        FROM market_demand md
        JOIN country c ON md.country_id = c.id
        JOIN hs_code h ON md.hs_code_id = h.id
        ORDER BY md.demand_level DESC
    """
    result = db.execute(text(sql)).fetchall()
    
    level_map = {"HIGH": 90, "MEDIUM": 60, "LOW": 30}
    orbs = []
    
    for idx, row in enumerate(result):
        iso_code = row.iso_code
        coord_data = get_port_coordinates(iso_code)
        if not coord_data: continue
        
        orbs.append({
            "id": idx + 1,
            "name": coord_data["name"],
            "lat": coord_data["lat"],
            "lng": coord_data["lng"],
            "volume": level_map.get(row.demand_level, 50),
            "growth": f"+{15 if row.trend == 'UP' else 5}%",
            "product": row.product_name
        })

    # Expansion Market Ranking Logic: (Growth * 1.5) + (Volume * 0.5)
    # Note: We simulate growth percentage for now as it's not in the DB, but using trend to weight it.
    expansion_sql = """
        SELECT c.name, md.trend, h.description, md.demand_level
        FROM market_demand md
        JOIN country c ON md.country_id = c.id
        JOIN hs_code h ON md.hs_code_id = h.id
        WHERE md.trend = 'UP'
    """
    expansion_result = db.execute(text(expansion_sql)).fetchall()
    
    markets_with_scores = []
    for r in expansion_result:
        vol_val = level_map.get(r.demand_level, 50)
        growth_val = 15 # Baseline for 'UP' trend
        score = (growth_val * 1.5) + (vol_val * 0.5)
        
        markets_with_scores.append({
            "country": r.name,
            "growth": f"{growth_val + (vol_val // 20)}%", # Dynamic growth simulation Based on volume/potential
            "goods": r.description,
            "score": score
        })
    
    # Sort by score descending and take top 5
    top_expansion = sorted(markets_with_scores, key=lambda x: x["score"], reverse=True)[:5]

    return {
        "orbs": orbs,
        "expansion_markets": top_expansion,
        "is_live": True,
        "last_sync": datetime.now().strftime("%H:%M:%S")
    }



if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

from fastapi import FastAPI, Query, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import List, Optional
from sqlalchemy.orm import Session
import uvicorn
import os
from reportlab.pdfgen import canvas
from database import SessionLocal, HSCode, Country, MarketDemand, PriceBand, CertificationRequirement, Certification, RiskScoreSummary, Recommendation, init_db

# Initialize DB on startup
init_db()

app = FastAPI(title="EXIM Insight India - Rule-based Validation MVP")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "EXIM Insight India Rule-based MVP is running", "status": "online"}

@app.get("/api/v1/hsn/search")
async def search_hsn(q: str = Query(..., min_length=2), limit: int = 10, db: Session = Depends(get_db)):
    results = db.query(HSCode).filter(
        (HSCode.description.ilike(f"%{q}%")) | (HSCode.hs_code.like(f"%{q}%"))
    ).limit(limit).all()
    
    return [
        {
            "id": item.id,
            "hsn_code": item.hs_code,
            "description": item.description,
            "sector": item.sector
        } for item in results
    ]

@app.get("/api/v1/countries")
async def list_countries(db: Session = Depends(get_db)):
    return db.query(Country).all()

@app.get("/api/v1/advisory")
async def get_advisory(hs_code_id: int, country_id: int, db: Session = Depends(get_db)):
    # Market Demand
    demand = db.query(MarketDemand).filter(MarketDemand.hs_code_id == hs_code_id, MarketDemand.country_id == country_id).first()
    
    # Price Band
    price = db.query(PriceBand).filter(PriceBand.hs_code_id == hs_code_id, PriceBand.country_id == country_id).first()
    
    # Certifications
    certs_query = db.query(CertificationRequirement, Certification).join(
        Certification, CertificationRequirement.certification_id == Certification.id
    ).filter(
        CertificationRequirement.hs_code_id == hs_code_id, 
        CertificationRequirement.country_id == country_id
    ).all()
    
    # Risk Summary
    risk = db.query(RiskScoreSummary).filter(RiskScoreSummary.hs_code_id == hs_code_id, RiskScoreSummary.country_id == country_id).first()
    
    # Recommendation
    rec = db.query(Recommendation).filter(Recommendation.hs_code_id == hs_code_id, Recommendation.country_id == country_id).first()

    if not demand and not price and not certs_query and not rec:
        raise HTTPException(status_code=404, detail="Advisory data not found for this combination")

    return {
        "demand": {
            "level": demand.demand_level if demand else "N/A",
            "trend": demand.trend if demand else "N/A"
        },
        "price": {
            "avg": price.avg_price if price else "N/A",
            "currency": price.currency if price else "USD",
            "volatility": price.volatility_level if price else "N/A"
        },
        "certifications": [
            {
                "name": c.name,
                "authority": c.issuing_authority,
                "mandatory": req.mandatory == 1,
                "days": req.avg_time_days
            } for req, c in certs_query
        ],
        "risk": {
            "score": risk.total_score if risk else "N/A",
            "level": risk.risk_level if risk else "N/A"
        },
        "recommendation": {
            "action": rec.recommendation if rec else "CAUTION",
            "rationale": rec.rationale if rec else "Indicative data only."
        }
    }

@app.get("/api/v1/report/pdf")
async def generate_pdf(hs_code_id: int, country_id: int, db: Session = Depends(get_db)):
    # Fetch data
    hsn = db.query(HSCode).filter(HSCode.id == hs_code_id).first()
    country = db.query(Country).filter(Country.id == country_id).first()
    
    if not hsn or not country:
        raise HTTPException(status_code=404, detail="HSN or Country not found")
    
    # Get advisory data
    try:
        data = await get_advisory(hs_code_id, country_id, db)
    except:
        data = {"recommendation": {"action": "N/A", "rationale": "No data available"}, "demand": {"level": "N/A", "trend": "N/A"}, "price": {"avg": "N/A", "currency": "USD", "volatility": "N/A"}, "risk": {"score": "N/A", "level": "N/A"}, "certifications": []}

    # Generate PDF
    filename = f"report_{hsn.hs_code}_{country.iso_code}.pdf"
    path = os.path.join(os.getcwd(), filename)
    
    c = canvas.Canvas(path)
    c.drawString(100, 800, "EXIM Insight India - Directional Trade Advisory")
    c.drawString(100, 780, f"Route: {hsn.hs_code} ({hsn.description}) to {country.name}")
    c.drawString(100, 750, f"Recommendation: {data['recommendation']['action']}")
    c.drawString(100, 730, f"Rationale: {data['recommendation']['rationale']}")
    c.drawString(100, 700, f"Demand: {data['demand']['level']} (Trend: {data['demand']['trend']})")
    c.drawString(100, 680, f"Avg Price: {data['price']['avg']} {data['price']['currency']}")
    c.drawString(100, 660, f"Risk: {data['risk']['score']}/100 ({data['risk']['level']})")
    
    c.drawString(100, 630, "Certifications:")
    y = 610
    for cert in data['certifications']:
        c.drawString(120, y, f"- {cert['name']} ({cert['authority']}) - Mandatory: {cert['mandatory']}")
        y -= 20
        
    c.showPage()
    c.save()
    
    return FileResponse(path=path, filename=filename, media_type='application/pdf')

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

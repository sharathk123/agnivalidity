from fastapi import FastAPI, Query, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import List, Optional
from sqlalchemy.orm import Session
import uvicorn
import os
from reportlab.pdfgen import canvas
from database import SessionLocal, HSCode, Country, MarketDemand, PriceBand, CertificationRequirement, Certification, CertificationNotes, RiskScoreSummary, RiskScoreDetail, Recommendation, init_db

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

@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "system": "ready"}

@app.get("/api/v1/hs/search")
async def search_hs(q: str = Query(..., min_length=2), limit: int = 10, db: Session = Depends(get_db)):
    # Search in hs_code table
    results = db.query(HSCode).filter(
        (HSCode.description.ilike(f"%{q}%")) | (HSCode.hs_code.like(f"%{q}%"))
    ).limit(limit).all()
    
    return [
        {
            "id": item.id,
            "hsn_code": item.hs_code,
            "description": item.description
        } for item in results
    ]

@app.get("/api/v1/country/list")
async def list_countries(db: Session = Depends(get_db)):
    return db.query(Country).all()

@app.get("/api/v1/demand")
async def get_demand(hs_code_id: int, country_id: int, db: Session = Depends(get_db)):
    demand = db.query(MarketDemand).filter(
        MarketDemand.hs_code_id == hs_code_id, 
        MarketDemand.country_id == country_id
    ).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand data not found")
    return {
        "level": demand.demand_level,
        "trend": demand.trend
    }

@app.get("/api/v1/price")
async def get_price(hs_code_id: int, country_id: int, db: Session = Depends(get_db)):
    price = db.query(PriceBand).filter(
        PriceBand.hs_code_id == hs_code_id, 
        PriceBand.country_id == country_id
    ).first()
    if not price:
        raise HTTPException(status_code=404, detail="Price data not found")
    return {
        "min": price.min_price,
        "avg": price.avg_price,
        "max": price.max_price,
        "currency": price.currency
    }

@app.get("/api/v1/certification")
async def get_certifications(hs_code_id: int, country_id: int, db: Session = Depends(get_db)):
    certs_query = db.query(CertificationRequirement, Certification).join(
        Certification, CertificationRequirement.certification_id == Certification.id
    ).filter(
        CertificationRequirement.hs_code_id == hs_code_id, 
        CertificationRequirement.country_id == country_id
    ).all()
    
    results = []
    for req, cert in certs_query:
        # Get optional notes
        notes = db.query(CertificationNotes).filter(CertificationNotes.certification_requirement_id == req.id).all()
        results.append({
            "name": cert.name,
            "authority": cert.issuing_authority,
            "mandatory": True if req.mandatory == 1 else False,
            "notes": [n.note for n in notes]
        })
    
    return results

@app.get("/api/v1/risk")
async def get_risk(hs_code_id: int, country_id: int, db: Session = Depends(get_db)):
    summary = db.query(RiskScoreSummary).filter(
        RiskScoreSummary.hs_code_id == hs_code_id, 
        RiskScoreSummary.country_id == country_id
    ).first()
    
    if not summary:
        raise HTTPException(status_code=404, detail="Risk data not found")
        
    details = db.query(RiskScoreDetail).filter(
        RiskScoreDetail.hs_code_id == hs_code_id, 
        RiskScoreDetail.country_id == country_id
    ).limit(3).all()
    
    return {
        "score": summary.total_score,
        "level": summary.risk_level,
        "reasons": [d.reason for d in details if d.reason]
    }

@app.get("/api/v1/recommendation")
async def get_recommendation(hs_code_id: int, country_id: int, db: Session = Depends(get_db)):
    rec = db.query(Recommendation).filter(
        Recommendation.hs_code_id == hs_code_id, 
        Recommendation.country_id == country_id
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation data not found")
    return {
        "action": rec.recommendation,
        "rationale": rec.rationale
    }

@app.get("/api/v1/insight")
async def get_insight(hs_code_id: int, country_id: int, db: Session = Depends(get_db)):
    # Market Demand
    demand_data = await get_demand(hs_code_id, country_id, db)
    
    # Price Band
    price_data = await get_price(hs_code_id, country_id, db)
    
    # Certifications
    certs_data = await get_certifications(hs_code_id, country_id, db)
    
    # Risk Summary
    risk_data = await get_risk(hs_code_id, country_id, db)
    
    # Recommendation
    rec_data = await get_recommendation(hs_code_id, country_id, db)

    return {
        "demand": demand_data,
        "price": price_data,
        "certifications": certs_data,
        "risk": risk_data,
        "recommendation": rec_data
    }

@app.get("/api/v1/report")
async def get_report_data(hs_code_id: int, country_id: int, db: Session = Depends(get_db)):
    # Slice 9: Structured JSON for PDF/Reporting
    return await get_insight(hs_code_id, country_id, db)

@app.get("/api/v1/report/pdf")
async def generate_pdf(hs_code_id: int, country_id: int, db: Session = Depends(get_db)):
    # Fetch data
    hsn = db.query(HSCode).filter(HSCode.id == hs_code_id).first()
    country = db.query(Country).filter(Country.id == country_id).first()
    
    if not hsn or not country:
        raise HTTPException(status_code=404, detail="HSN or Country not found")
    
    # Get advisory data
    try:
        data = await get_insight(hs_code_id, country_id, db)
    except:
        data = {"recommendation": {"action": "N/A", "rationale": "No data available"}, "demand": {"level": "N/A", "trend": "N/A"}, "price": {"min": 0, "avg": 0, "max": 0, "currency": "USD"}, "risk": {"score": 0, "level": "N/A", "reasons": []}, "certifications": []}

    # Generate PDF
    filename = f"report_{hsn.hs_code}_{country.iso_code}.pdf"
    path = os.path.join(os.getcwd(), filename)
    
    c = canvas.Canvas(path)
    c.drawString(100, 800, "EXIM Insight India - Directional Trade Advisory")
    c.drawString(100, 780, f"Route: {hsn.hs_code} ({hsn.description}) to {country.name}")
    c.drawString(100, 750, f"Recommendation: {data['recommendation']['action']}")
    c.drawString(100, 730, f"Rationale: {data['recommendation']['rationale']}")
    c.drawString(100, 700, f"Demand: {data['demand']['level']} (Trend: {data['demand']['trend']})")
    
    avg_price = data['price']['avg']
    price_str = f"{avg_price:.2f}" if isinstance(avg_price, (int, float)) else str(avg_price)
    c.drawString(100, 680, f"Avg Price: {price_str} {data['price']['currency']}")
    
    risk_score = data['risk']['score']
    risk_str = f"{risk_score}" if isinstance(risk_score, (int, float)) else str(risk_score)
    c.drawString(100, 660, f"Risk: {risk_str}/100 ({data['risk']['level']})")
    
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

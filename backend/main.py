from fastapi import FastAPI, Query, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import List, Optional
from sqlalchemy.orm import Session
import uvicorn
import os
from reportlab.pdfgen import canvas
from database import SessionLocal, HSCode, Country, MarketDemand, PriceBand, CertificationRequirement, Certification, CertificationNotes, RiskScoreSummary, RiskScoreDetail, Recommendation, init_db
from admin import router as admin_router
from intelligence import router as intelligence_router

# Initialize DB on startup
init_db()

app = FastAPI(title="EXIM Insight India - Enterprise SaaS")

# Include admin router
app.include_router(admin_router)
app.include_router(intelligence_router)

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

@app.get("/api/v1/advisory")
async def get_executive_brief(hs_code_id: int, country_id: int, db: Session = Depends(get_db)):
    """
    Generate AI-enhanced Executive Brief for trade advisory.
    Uses EXECUTIVE_BRIEF prompt template with structured trade data.
    AI is optional - returns structured data if AI fails.
    """
    from datetime import datetime
    
    # Fetch core data
    hsn = db.query(HSCode).filter(HSCode.id == hs_code_id).first()
    country = db.query(Country).filter(Country.id == country_id).first()
    
    if not hsn or not country:
        raise HTTPException(status_code=404, detail="Product or destination not found")
    
    # Get all insight data
    try:
        insight_data = await get_insight(hs_code_id, country_id, db)
    except HTTPException:
        return {
            "brief": "Insufficient data available for this trade route. Please verify the product and destination combination.",
            "data_available": False,
            "generated_at": datetime.now().isoformat()
        }
    
    # Assemble context for AI
    structured_context = {
        "product": {
            "hs_code": hsn.hs_code,
            "description": hsn.description,
            "sector": hsn.sector if hasattr(hsn, 'sector') else None
        },
        "destination": {
            "country": country.name,
            "iso_code": country.iso_code,
            "region": country.region if hasattr(country, 'region') else None,
            "base_risk": country.base_risk_level if hasattr(country, 'base_risk_level') else None
        },
        "market": insight_data.get("demand", {}),
        "pricing": insight_data.get("price", {}),
        "risk": insight_data.get("risk", {}),
        "certifications": insight_data.get("certifications", []),
        "recommendation": insight_data.get("recommendation", {}),
        "data_sources": ["DGFT", "UN Comtrade", "APEDA"],
        "data_last_updated": datetime.now().strftime("%Y-%m-%d")
    }
    
    # Try to get AI explanation
    try:
        from services.ai_service import get_explanation
        ai_brief = get_explanation(
            explanation_type="EXECUTIVE_BRIEF",
            structured_payload=structured_context,
            hs_code=hsn.hs_code,
            country_code=country.iso_code,
            db=db
        )
    except Exception:
        # Fallback: Generate rule-based brief without AI
        risk_alert = "⚠️ REGULATORY ALERT\n\n" if structured_context["risk"].get("level") == "HIGH" else ""
        
        ai_brief = f"""{risk_alert}**EXECUTIVE BRIEF: {hsn.description} to {country.name}**

**MARKET OPPORTUNITY**
• Demand Level: {structured_context['market'].get('level', 'Pending verification')}
• Price Range: {structured_context['pricing'].get('currency', 'USD')} {structured_context['pricing'].get('min', 'N/A')} - {structured_context['pricing'].get('max', 'N/A')}

**RISK & COMPLIANCE**
• Risk Score: {structured_context['risk'].get('score', 'N/A')}/100 ({structured_context['risk'].get('level', 'N/A')})
• Certifications Required: {len(structured_context['certifications'])}

**RECOMMENDATION: {structured_context['recommendation'].get('action', 'N/A')}**
{structured_context['recommendation'].get('rationale', 'Review data above.')}

---
*Data Sources: DGFT, UN Comtrade, APEDA*
*Last Updated: {structured_context['data_last_updated']}*
*This is indicative guidance. Consult a licensed trade advisor for binding decisions.*"""
    
    return {
        "brief": ai_brief,
        "structured_data": structured_context,
        "data_available": True,
        "generated_at": datetime.now().isoformat(),
        "disclaimer": "This advisory is indicative and based on public data. It does not constitute legal or financial advice."
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

from fastapi import FastAPI, Query, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import List, Optional
from sqlalchemy.orm import Session
import uvicorn
import os
import json
from datetime import datetime, timedelta
from database import SessionLocal, HSCode, Country, MarketDemand, PriceBand, CertificationRequirement, Certification, CertificationNotes, RiskScoreSummary, RiskScoreDetail, Recommendation, ExportProduct, CompanyProfile, QuoteHistory, init_db, get_db
from services.document_service import DocumentService
from pydantic import BaseModel
from admin import router as admin_router

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
app.include_router(admin_router)

doc_service = DocumentService()

class QuoteRequest(BaseModel):
    hs_code: str
    base_cost: float
    logistics: float = 0
    currency: str = "USD"
    incoterm: str = "FOB"
    exchange_rate: float = 83.5
    payment_terms: str = "30% Advance, 70% against BL"
    validity_days: int = 30

@app.get("/api/v1/advisory/calculate")
async def calculate_profit(hs_code: str, base_cost: float, logistics: float = 0, db: Session = Depends(get_db)):
    """
    Agni Profitability API: Calculates hidden margins and target FOB.
    """
    # 1. Fetch our local verified data
    # Handle both 8 and 10 digit lookups
    product = db.query(ExportProduct).filter_by(hs_code=hs_code).first()
    if not product and len(hs_code) >= 8:
        product = db.query(ExportProduct).filter(ExportProduct.hs_code.like(f"{hs_code[:8]}%")).first()
    
    if not product:
        raise HTTPException(status_code=404, detail=f"Incentive data for HS Code {hs_code} not found in 2026 fleet.")
    
    # 2. Automated Incentive Calculation
    rodtep_benefit = base_cost * product.rodtep_rate
    dbk_benefit = base_cost * product.dbk_rate
    gst_benefit = base_cost * product.gst_refund_rate
    
    total_incentives = rodtep_benefit + dbk_benefit + gst_benefit
    
    # 3. The "Agni" Competitive FOB
    # We subtract benefits from cost to show the user how low they can quote safely
    target_fob = (base_cost + logistics) - (rodtep_benefit + dbk_benefit)
    
    return {
        "status": "success",
        "hs_code": hs_code,
        "product_name": product.description,
        "verdict": "GO",
        "metrics": {
            "base_cost": base_cost,
            "logistics": logistics,
            "rodtep_benefit": round(rodtep_benefit, 2),
            "dbk_benefit": round(dbk_benefit, 2),
            "gst_benefit": round(gst_benefit, 2),
            "net_cost": round(target_fob, 2),
            "total_incentives": round(total_incentives, 2),
            "compliance_status": "READY_V1.1" # Jan 31st ready
        }
    }

@app.post("/api/v1/advisory/quote")
async def generate_quote(req: QuoteRequest, db: Session = Depends(get_db)):
    """
    Module 6: Dynamic PDF Architect
    Generates a branded Pro Forma Quotation PDF.
    """
    # 1. Fetch Company Profile
    profile = db.query(CompanyProfile).first()
    if not profile:
        raise HTTPException(status_code=500, detail="Company profile not configured.")
    
    profile_dict = {
        "company_name": profile.company_name,
        "gstin": profile.gstin,
        "iec": profile.iec,
        "ad_code": profile.ad_code,
        "swift_code": profile.swift_code,
        "bank_name": profile.bank_name,
        "account_number": profile.account_number
    }

    # 2. Fetch Product & Calculate Metrics
    product = db.query(ExportProduct).filter_by(hs_code=req.hs_code).first()
    if not product and len(req.hs_code) >= 8:
        product = db.query(ExportProduct).filter(ExportProduct.hs_code.like(f"{req.hs_code[:8]}%")).first()
        
    if not product:
        raise HTTPException(status_code=404, detail="Product incentive data not found.")

    rodtep_benefit = req.base_cost * product.rodtep_rate
    dbk_benefit = req.base_cost * product.dbk_rate
    gst_benefit = req.base_cost * product.gst_refund_rate
    total_incentives = rodtep_benefit + dbk_benefit + gst_benefit
    target_fob = (req.base_cost + req.logistics) - (rodtep_benefit + dbk_benefit)

    calc_metrics = {
        "base_cost": req.base_cost,
        "logistics": req.logistics,
        "net_cost": round(target_fob, 2),
        "total_incentives": round(total_incentives, 2),
        "rodtep_benefit": round(rodtep_benefit, 2),
        "dbk_benefit": round(dbk_benefit, 2),
        "gst_benefit": round(gst_benefit, 2)
    }

    # 3. Generate Quote Metadata
    quote_number = f"QTN-{datetime.now().strftime('%Y%m%d')}-{product.hs_code[:4]}"
    validity_date = (datetime.now() + timedelta(days=req.validity_days)).strftime('%Y-%m-%d')
    
    params = {
        "incoterm": req.incoterm,
        "exchange_rate": req.exchange_rate,
        "validity_date": validity_date,
        "payment_terms": req.payment_terms
    }

    # 4. Generate PDF via DocumentService
    pdf_path = doc_service.generate_quotation_pdf(
        quote_number=quote_number,
        company_profile=profile_dict,
        product={"hs_code": product.hs_code, "description": product.description},
        calc_metrics=calc_metrics,
        params=params
    )

    # 5. Save to History
    new_quote = QuoteHistory(
        quote_number=quote_number,
        hs_code=product.hs_code,
        product_name=product.description,
        total_value=calc_metrics['net_cost'],
        currency=req.currency,
        exchange_rate=req.exchange_rate,
        incoterm=req.incoterm,
        validity_date=validity_date,
        payment_terms=req.payment_terms,
        pdf_path=pdf_path,
        created_at=datetime.now().isoformat()
    )
    db.add(new_quote)
    db.commit()

    return {
        "status": "success",
        "quote_number": quote_number,
        "pdf_url": f"http://localhost:8000/api/v1/advisory/quote/download?quote_number={quote_number}"
    }

@app.get("/api/v1/advisory/quote/download")
async def download_quote(quote_number: str, db: Session = Depends(get_db)):
    quote = db.query(QuoteHistory).filter_by(quote_number=quote_number).first()
    if not quote or not os.path.exists(quote.pdf_path):
        raise HTTPException(status_code=404, detail="Quote PDF not found.")
    return FileResponse(path=quote.pdf_path, filename=os.path.basename(quote.pdf_path), media_type='application/pdf')

# Rest of the original endpoints...
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

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
import os
from datetime import datetime, timedelta

from database import get_db, ExportProduct, CompanyProfile, QuoteHistory
from schemas.advisory import QuoteRequest
from services.document_service import DocumentService

# Initialize Router
router = APIRouter(
    prefix="/api/v1/advisory",
    tags=["Advisory"]
)

# Initialize Services
doc_service = DocumentService()

@router.get("/calculate")
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

@router.post("/quote")
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

@router.get("/quote/download")
async def download_quote(quote_number: str, db: Session = Depends(get_db)):
    quote = db.query(QuoteHistory).filter_by(quote_number=quote_number).first()
    if not quote or not os.path.exists(quote.pdf_path):
        raise HTTPException(status_code=404, detail="Quote PDF not found.")
    return FileResponse(path=quote.pdf_path, filename=os.path.basename(quote.pdf_path), media_type='application/pdf')

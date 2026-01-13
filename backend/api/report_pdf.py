from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
from reportlab.pdfgen import canvas
from database import HSCode, Country, get_db
from api.report import get_insight

router = APIRouter(prefix="/api/v1/report", tags=["Report"])

@router.get("/pdf")
async def generate_pdf(hs_code_id: int, country_id: int, db: Session = Depends(get_db)):
    """
    Generates a printable PDF report for the selected HSN-Country route.
    """
    hsn = db.query(HSCode).filter(HSCode.id == hs_code_id).first()
    country = db.query(Country).filter(Country.id == country_id).first()
    
    if not hsn or not country:
        raise HTTPException(status_code=404, detail="HSN or Country not found")
    
    try:
        data = await get_insight(hs_code_id, country_id, db)
    except:
        # Fallback for missing data
        data = None

    filename = f"report_{hsn.hs_code}_{country.iso_code}.pdf"
    path = os.path.join(os.getcwd(), filename)
    
    _create_pdf_file(path, hsn, country, data)
    
    return FileResponse(path=path, filename=filename, media_type='application/pdf')

def _create_pdf_file(path, hsn, country, data):
    """
    Internal helper to handle PDF draw operations, keeping API handler short.
    """
    c = canvas.Canvas(path)
    c.drawString(100, 800, "EXIM Insight India - Directional Trade Advisory")
    c.drawString(100, 780, f"Route: {hsn.hs_code} ({hsn.description}) to {country.name}")
    
    if not data:
        c.drawString(100, 750, "Data: Not Available")
        c.showPage()
        c.save()
        return

    c.drawString(100, 750, f"Recommendation: {data.recommendation.action}")
    c.drawString(100, 730, f"Rationale: {data.recommendation.rationale}")
    c.drawString(100, 700, f"Demand: {data.demand.level} (Trend: {data.demand.trend})")
    
    avg_price = data.price.avg
    price_str = f"{avg_price:.2f}"
    c.drawString(100, 680, f"Avg Price: {price_str} {data.price.currency}")
    c.drawString(100, 660, f"Risk: {data.risk.score}/100 ({data.risk.level})")
    
    c.drawString(100, 630, "Certifications:")
    y = 610
    for cert in data.certifications:
        c.drawString(120, y, f"- {cert.name} ({cert.authority}) - Mandatory: {cert.mandatory}")
        y -= 20
        if y < 100:
            c.showPage()
            y = 800
            
    c.showPage()
    c.save()

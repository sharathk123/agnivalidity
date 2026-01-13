from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas import ComprehensiveInsightResponse
from api.demand import get_demand
from api.price import get_price
from api.certification import get_certifications
from api.risk import get_risk
from api.recommendation import get_recommendation

router = APIRouter(prefix="/api/v1", tags=["Insight"])

@router.get("/insight", response_model=ComprehensiveInsightResponse)
async def get_insight(hs_code_id: int, country_id: int, db: Session = Depends(get_db)):
    """
    Aggregates all directional insights into a single response payload.
    """
    demand_data = await get_demand(hs_code_id, country_id, db)
    price_data = await get_price(hs_code_id, country_id, db)
    certs_data = await get_certifications(hs_code_id, country_id, db)
    risk_data = await get_risk(hs_code_id, country_id, db)
    rec_data = await get_recommendation(hs_code_id, country_id, db)

    return ComprehensiveInsightResponse(
        demand=demand_data,
        price=price_data,
        certifications=certs_data,
        risk=risk_data,
        recommendation=rec_data
    )

@router.get("/report", response_model=ComprehensiveInsightResponse)
async def get_report_data(hs_code_id: int, country_id: int, db: Session = Depends(get_db)):
    """
    Provides a structured data snapshot for report generation.
    """
    return await get_insight(hs_code_id, country_id, db)

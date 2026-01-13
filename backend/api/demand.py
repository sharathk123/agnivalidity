from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import MarketDemand, get_db
from schemas import DemandResponse

router = APIRouter(prefix="/api/v1/demand", tags=["Insight"])

@router.get("", response_model=DemandResponse)
async def get_demand(hs_code_id: int, country_id: int, db: Session = Depends(get_db)):
    """
    Retrieves demand level and trend for a specific HSN-Country route.
    """
    demand = db.query(MarketDemand).filter(
        MarketDemand.hs_code_id == hs_code_id, 
        MarketDemand.country_id == country_id
    ).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand data not found")
    return DemandResponse(
        level=demand.demand_level,
        trend=demand.trend
    )

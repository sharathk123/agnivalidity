from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import PriceBand, get_db
from schemas import PriceResponse

router = APIRouter(prefix="/api/v1/price", tags=["Insight"])

@router.get("", response_model=PriceResponse)
async def get_price(hs_code_id: int, country_id: int, db: Session = Depends(get_db)):
    """
    Retrieves indicative price bands for a specific HSN-Country route.
    """
    price = db.query(PriceBand).filter(
        PriceBand.hs_code_id == hs_code_id, 
        PriceBand.country_id == country_id
    ).first()
    if not price:
        raise HTTPException(status_code=404, detail="Price data not found")
    return PriceResponse(
        min=price.min_price,
        avg=price.avg_price,
        max=price.max_price,
        currency=price.currency
    )

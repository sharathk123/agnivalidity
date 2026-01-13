from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from typing import List
from database import HSCode, get_db
from schemas import HSCodeResponse

router = APIRouter(prefix="/api/v1/hs", tags=["HS Code"])

@router.get("/search", response_model=List[HSCodeResponse])
async def search_hs(q: str = Query(..., min_length=2), limit: int = 10, db: Session = Depends(get_db)):
    """
    Directional search for HS codes by partial code or description.
    """
    results = db.query(HSCode).filter(
        (HSCode.description.ilike(f"%{q}%")) | (HSCode.hs_code.like(f"%{q}%"))
    ).limit(limit).all()
    
    return [
        HSCodeResponse(
            id=item.id,
            hsn_code=item.hs_code,
            description=item.description
        ) for item in results
    ]

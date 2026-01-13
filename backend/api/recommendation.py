from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import Recommendation, get_db
from schemas import RecommendationResponse

router = APIRouter(prefix="/api/v1/recommendation", tags=["Insight"])

@router.get("", response_model=RecommendationResponse)
async def get_recommendation(hs_code_id: int, country_id: int, db: Session = Depends(get_db)):
    """
    Retrieves the final trade advisory recommendation and rationale.
    """
    rec = db.query(Recommendation).filter(
        Recommendation.hs_code_id == hs_code_id, 
        Recommendation.country_id == country_id
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation data not found")
    return RecommendationResponse(
        action=rec.recommendation,
        rationale=rec.rationale
    )

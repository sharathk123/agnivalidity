from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import RiskScoreSummary, RiskScoreDetail, get_db
from schemas import RiskResponse

router = APIRouter(prefix="/api/v1/risk", tags=["Insight"])

@router.get("", response_model=RiskResponse)
async def get_risk(hs_code_id: int, country_id: int, db: Session = Depends(get_db)):
    """
    Retrieves rule-based risk score and contributing factors.
    """
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
    
    return RiskResponse(
        score=summary.total_score,
        level=summary.risk_level,
        reasons=[d.reason for d in details if d.reason]
    )

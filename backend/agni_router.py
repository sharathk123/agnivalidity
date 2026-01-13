from fastapi import APIRouter, Depends, Query, Body 
from sqlalchemy.orm import Session
from database import get_db
from services.agni_logic import calculate_landed_cost, validate_icegate_json, get_odop_intelligence

router = APIRouter(prefix="/agni", tags=["Agni Logic"])

@router.post("/calculator/landed-cost")
def api_landed_cost(
    hs_code: str = Query(...), 
    base_cost: float = Query(...), 
    district: str = Query(None),
    logistics: float = Query(0),
    db: Session = Depends(get_db)
):
    # 1. Calc Incentives
    result = calculate_landed_cost(db, hs_code, base_cost, logistics)
    
    # 2. Add ODOP Context if error not present
    if "error" not in result and district:
        odop_msg = get_odop_intelligence(db, district, hs_code)
        if odop_msg:
            result["odop_intelligence"] = odop_msg
            
    return result

@router.post("/compliance/validate")
def api_validate_json(payload: dict = Body(...)):
    return validate_icegate_json(payload)

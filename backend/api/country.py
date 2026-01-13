from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import Country, get_db
from schemas import CountryResponse

router = APIRouter(prefix="/api/v1/country", tags=["Country"])

@router.get("/list", response_model=List[CountryResponse])
async def list_countries(db: Session = Depends(get_db)):
    """
    Returns list of supported destination countries.
    """
    return db.query(Country).all()

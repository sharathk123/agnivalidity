from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import CertificationRequirement, Certification, CertificationNotes, get_db
from schemas import CertificationResponse

router = APIRouter(prefix="/api/v1/certification", tags=["Insight"])

@router.get("", response_model=List[CertificationResponse])
async def get_certifications(hs_code_id: int, country_id: int, db: Session = Depends(get_db)):
    """
    Retrieves mandatory certification requirements for a specific HSN-Country route.
    """
    certs_query = db.query(CertificationRequirement, Certification).join(
        Certification, CertificationRequirement.certification_id == Certification.id
    ).filter(
        CertificationRequirement.hs_code_id == hs_code_id, 
        CertificationRequirement.country_id == country_id
    ).all()
    
    results = []
    for req, cert in certs_query:
        notes = db.query(CertificationNotes).filter(CertificationNotes.certification_requirement_id == req.id).all()
        results.append(CertificationResponse(
            name=cert.name,
            authority=cert.issuing_authority,
            mandatory=True if req.mandatory == 1 else False,
            notes=[n.note for n in notes]
        ))
    
    return results

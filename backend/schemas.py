from pydantic import BaseModel
from typing import List, Optional

class HSCodeResponse(BaseModel):
    id: int
    hsn_code: str
    description: str

    class Config:
        from_attributes = True

class CountryResponse(BaseModel):
    id: int
    iso_code: str
    name: str
    region: Optional[str]

    class Config:
        from_attributes = True

class DemandResponse(BaseModel):
    level: str
    trend: str

class PriceResponse(BaseModel):
    min: float
    avg: float
    max: float
    currency: str

class CertificationResponse(BaseModel):
    name: str
    authority: Optional[str]
    mandatory: bool
    notes: List[str]

class RiskResponse(BaseModel):
    score: int
    level: str
    reasons: List[str]

class RecommendationResponse(BaseModel):
    action: str
    rationale: str

class ComprehensiveInsightResponse(BaseModel):
    demand: DemandResponse
    price: PriceResponse
    certifications: List[CertificationResponse]
    risk: RiskResponse
    recommendation: RecommendationResponse

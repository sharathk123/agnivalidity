from pydantic import BaseModel
from typing import List, Optional

class DemandOrb(BaseModel):
    id: int
    name: str
    lat: float
    lng: float
    volume: int
    growth: str
    product: Optional[str]

class ExpansionMarket(BaseModel):
    country: str
    growth: str
    goods: str
    score: float

class GlobalDemandResponse(BaseModel):
    orbs: List[DemandOrb]
    expansion_markets: List[ExpansionMarket]
    is_live: bool
    last_sync: str

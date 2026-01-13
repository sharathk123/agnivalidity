from pydantic import BaseModel
from typing import Optional

class QuoteRequest(BaseModel):
    hs_code: str
    base_cost: float
    logistics: float = 0
    currency: str = "USD"
    incoterm: str = "FOB"
    exchange_rate: float = 83.5
    payment_terms: str = "30% Advance, 70% against BL"
    validity_days: int = 30

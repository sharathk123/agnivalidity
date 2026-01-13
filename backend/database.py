from sqlalchemy import create_engine, Column, String, Float, Integer, ForeignKey, UniqueConstraint, Index, TEXT
from sqlalchemy.orm import sessionmaker, relationship, declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./exim_insight.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# 1. Reference Tables
class HSCode(Base):
    __tablename__ = "hs_code"
    id = Column(Integer, primary_key=True, autoincrement=True)
    hs_code = Column(TEXT, nullable=False, unique=True)
    description = Column(TEXT, nullable=False)
    sector = Column(TEXT)
    regulatory_sensitivity = Column(TEXT) # LOW | MEDIUM | HIGH

class Country(Base):
    __tablename__ = "country"
    id = Column(Integer, primary_key=True, autoincrement=True)
    iso_code = Column(TEXT, nullable=False, unique=True)
    name = Column(TEXT, nullable=False)
    region = Column(TEXT)
    base_risk_level = Column(TEXT) # LOW | MEDIUM | HIGH

# 2. Market Intelligence
class MarketDemand(Base):
    __tablename__ = "market_demand"
    id = Column(Integer, primary_key=True, autoincrement=True)
    hs_code_id = Column(Integer, ForeignKey("hs_code.id"), nullable=False)
    country_id = Column(Integer, ForeignKey("country.id"), nullable=False)
    demand_level = Column(TEXT, nullable=False) # LOW | MEDIUM | HIGH
    trend = Column(TEXT, nullable=False) # UP | FLAT | DOWN
    last_updated = Column(TEXT) # YYYY-MM
    __table_args__ = (UniqueConstraint('hs_code_id', 'country_id'),)

class PriceBand(Base):
    __tablename__ = "price_band"
    id = Column(Integer, primary_key=True, autoincrement=True)
    hs_code_id = Column(Integer, ForeignKey("hs_code.id"), nullable=False)
    country_id = Column(Integer, ForeignKey("country.id"), nullable=False)
    min_price = Column(Float)
    avg_price = Column(Float)
    max_price = Column(Float)
    currency = Column(TEXT, default='USD')
    volatility_level = Column(TEXT) # LOW | MEDIUM | HIGH
    __table_args__ = (UniqueConstraint('hs_code_id', 'country_id'),)

# 3. Certification Intelligence
class Certification(Base):
    __tablename__ = "certification"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(TEXT, nullable=False)
    issuing_authority = Column(TEXT)

class CertificationRequirement(Base):
    __tablename__ = "certification_requirement"
    id = Column(Integer, primary_key=True, autoincrement=True)
    hs_code_id = Column(Integer, ForeignKey("hs_code.id"), nullable=False)
    country_id = Column(Integer, ForeignKey("country.id"), nullable=False)
    certification_id = Column(Integer, ForeignKey("certification.id"), nullable=False)
    mandatory = Column(Integer, nullable=False) # 1 = Yes, 0 = No
    avg_time_days = Column(Integer)
    validity_months = Column(Integer)
    rejection_risk = Column(TEXT) # LOW | MEDIUM | HIGH

class CertificationNotes(Base):
    __tablename__ = "certification_notes"
    id = Column(Integer, primary_key=True, autoincrement=True)
    certification_requirement_id = Column(Integer, ForeignKey("certification_requirement.id"), nullable=False)
    note = Column(TEXT)

# 4. Risk Scoring
class RiskFactor(Base):
    __tablename__ = "risk_factor"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(TEXT, nullable=False)
    weight = Column(Float, nullable=False)

class RiskScoreDetail(Base):
    __tablename__ = "risk_score_detail"
    id = Column(Integer, primary_key=True, autoincrement=True)
    hs_code_id = Column(Integer, ForeignKey("hs_code.id"), nullable=False)
    country_id = Column(Integer, ForeignKey("country.id"), nullable=False)
    risk_factor_id = Column(Integer, ForeignKey("risk_factor.id"), nullable=False)
    score = Column(Integer, nullable=False) # 0–100
    reason = Column(TEXT)

class RiskScoreSummary(Base):
    __tablename__ = "risk_score_summary"
    id = Column(Integer, primary_key=True, autoincrement=True)
    hs_code_id = Column(Integer, ForeignKey("hs_code.id"), nullable=False)
    country_id = Column(Integer, ForeignKey("country.id"), nullable=False)
    total_score = Column(Integer, nullable=False)
    risk_level = Column(TEXT, nullable=False) # LOW | MEDIUM | HIGH
    last_calculated = Column(TEXT) # YYYY-MM-DD
    __table_args__ = (UniqueConstraint('hs_code_id', 'country_id'),)

# 5. Final Recommendation
class Recommendation(Base):
    __tablename__ = "recommendation"
    id = Column(Integer, primary_key=True, autoincrement=True)
    hs_code_id = Column(Integer, ForeignKey("hs_code.id"), nullable=False)
    country_id = Column(Integer, ForeignKey("country.id"), nullable=False)
    recommendation = Column(TEXT, nullable=False) # GO | CAUTION | AVOID
    rationale = Column(TEXT, nullable=False)
    calculated_at = Column(TEXT)
    __table_args__ = (UniqueConstraint('hs_code_id', 'country_id'),)
    
# 6. Export Pricing & Compliance (Jan 31st Readiness)
class ExportProduct(Base):
    __tablename__ = "export_products"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    hs_code = Column(String(10), unique=True, index=True) # Transitioned to 10-digit for 2026
    description = Column(TEXT)
    
    # 2026 INCENTIVES (Crawled & Frozen)
    rodtep_rate = Column(Float) # e.g., 0.02 (for 2%)
    dbk_rate = Column(Float)    # Duty Drawback
    gst_refund_rate = Column(Float, default=0.18) 
    
    # 2026 COMPLIANCE (ICEGATE v1.1 Schema Mapping)
    json_template = Column(JSON if 'postgresql' in SQLALCHEMY_DATABASE_URL else TEXT)

# 7. Document & Quote Management (Module 6)
class CompanyProfile(Base):
    __tablename__ = "company_profiles"
    
    id = Column(Integer, primary_key=True)
    company_name = Column(String, default="Agni Exporter Ltd")
    gstin = Column(String(15), unique=True)
    iec = Column(String(10), unique=True)
    ad_code = Column(String(20))
    swift_code = Column(String(11))
    bank_name = Column(String)
    bank_branch = Column(String)
    account_number = Column(String)

class QuoteHistory(Base):
    __tablename__ = "quote_history"
    
    id = Column(Integer, primary_key=True)
    quote_number = Column(String, unique=True, index=True)
    hs_code = Column(String(10))
    product_name = Column(String)
    total_value = Column(Float)
    currency = Column(String(3), default="USD")
    exchange_rate = Column(Float, default=83.5)
    incoterm = Column(String(3)) # FOB, CIF, etc.
    validity_date = Column(TEXT)
    payment_terms = Column(TEXT)
    pdf_path = Column(String)
    created_at = Column(TEXT)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

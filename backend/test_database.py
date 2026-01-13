from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, HSCode, Country, MarketDemand

# Use named in-memory SQLite to allow shared cache between connections
SQLALCHEMY_DATABASE_URL = "sqlite:///file:testdb?mode=memory&cache=shared"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_database_init():
    # Verify that tables can be created
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Verify schema by inserting a sample record
    hs = HSCode(hs_code="test_code", description="test description")
    db.add(hs)
    db.commit()
    
    selected = db.query(HSCode).filter(HSCode.hs_code == "test_code").first()
    assert selected is not None
    assert selected.description == "test description"
    db.close()

def test_relationships():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    hs = HSCode(hs_code="1234", description="test")
    co = Country(iso_code="XX", name="Testland")
    db.add_all([hs, co])
    db.commit()
    
    demand = MarketDemand(hs_code_id=hs.id, country_id=co.id, demand_level="HIGH", trend="UP")
    db.add(demand)
    db.commit()
    
    res = db.query(MarketDemand).first()
    assert res.demand_level == "HIGH"
    db.close()

def test_unique_constraint_violation():
    from sqlalchemy.exc import IntegrityError
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    hs1 = HSCode(hs_code="unique_code", description="first")
    db.add(hs1)
    db.commit()
    
    hs2 = HSCode(hs_code="unique_code", description="second")
    db.add(hs2)
    import pytest
    with pytest.raises(IntegrityError):
        db.commit()
    db.close()

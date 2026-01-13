from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
import logging
from database import get_db

logger = logging.getLogger("EXIM_Intelligence")
router = APIRouter(prefix="/intelligence", tags=["Intelligence"])

MASTER_INTELLIGENCE_PROMPT = """
You are the EXIM Insight India Chief Strategy Officer.
Based on the following market data, generate a 3-sentence advisory for the exporter.
HS Code: {hs_code}
Country: {country}
Verdict: {verdict}
Rationale: {rationale}
"""

@router.post("/run-scoring")
def trigger_scoring_engine(db: Session = Depends(get_db)):
    """
    Manually triggers the Scoring Engine.
    """
    rows = run_scoring_engine(db)
    return {"status": "SUCCESS", "rows_updated": rows}

@router.get("/insight")
def get_insight(hs_code: str, country_code: str, db: Session = Depends(get_db)):
    """
    AI Enrichment Endpoint.
    Fetches the verdict and generates an advisory.
    """
    # 1. Fetch Verdict
    sql = """
        SELECT r.recommendation, r.rationale, c.name, h.description 
        FROM recommendation r
        JOIN hs_code h ON r.hs_code_id = h.id
        JOIN country c ON r.country_id = c.id
        WHERE h.hs_code = :hs_code AND c.iso_code = :country_code
    """
    result = db.execute(text(sql), {"hs_code": hs_code, "country_code": country_code}).fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="No intelligence data found for this target.")
    
    verdict, rationale, country_name, hs_desc = result
    
    # 2. Mock AI Generation (for MVP speed/stability)
    # In production, this calls OpenAI/etc.
    advisory = f"Given the {verdict} verdict for {hs_desc} in {country_name}, we advise immediate action. {rationale} Ensure compliance with latest DGFT norms."
    
    return {
        "hs_code": hs_code,
        "country": country_name,
        "verdict": verdict,
        "rationale": rationale,
        "advisory": advisory
    }

def run_scoring_engine(db: Session):
    """
    Executes the Market Intelligence Scoring Engine.
    Calculates GO/CAUTION/AVOID verdicts based on Demand, Price, and Risk.
    """
    logger.info("Starting Scoring Engine...")
    
    # 1. Ensure Recommendation Rows Exist
    # We populate the recommendation table for all HS+Country pairs that have Demand data
    db.execute(text("""
        INSERT INTO recommendation (hs_code_id, country_id, recommendation, rationale)
        SELECT hs_code_id, country_id, 'PENDING', 'Initializing...' 
        FROM market_demand
        WHERE NOT EXISTS (
            SELECT 1 FROM recommendation r 
            WHERE r.hs_code_id = market_demand.hs_code_id 
              AND r.country_id = market_demand.country_id
        )
    """))
    db.commit()
    
    # 2. Run the Scoring Logic (The "Brain")
    # Using the deterministic logic provided in the prompt
    
    scoring_sql = """
    UPDATE recommendation
    SET 
        recommendation = CASE 
            WHEN (demand_score + price_score - risk_penalty) > 75 THEN 'GO'
            WHEN (demand_score + price_score - risk_penalty) BETWEEN 50 AND 75 THEN 'CAUTION'
            ELSE 'AVOID'
        END,
        rationale = 'Calculated based on ' || demand_level || ' demand and ' || risk_level || ' risk factors.',
        calculated_at = :now
    FROM (
        SELECT 
            md.hs_code_id, 
            md.country_id,
            -- Demand Pillar (Max 40 pts)
            CASE 
                WHEN md.demand_level = 'HIGH' AND md.trend = 'UP' THEN 40
                WHEN md.demand_level = 'HIGH' THEN 30
                WHEN md.demand_level = 'MEDIUM' THEN 20
                ELSE 5 
            END as demand_score,
            -- Price Pillar (Max 30 pts)
            CASE 
                WHEN pb.volatility_level = 'LOW' THEN 30
                WHEN pb.volatility_level = 'MEDIUM' THEN 15
                ELSE 0 
            END as price_score,
            -- Risk Penalty (Subtract pts)
            rss.total_score as risk_penalty,
            md.demand_level,
            rss.risk_level
        FROM market_demand md
        JOIN price_band pb ON md.hs_code_id = pb.hs_code_id AND md.country_id = pb.country_id
        JOIN risk_score_summary rss ON md.hs_code_id = rss.hs_code_id AND md.country_id = rss.country_id
    ) AS scoring_data
    WHERE recommendation.hs_code_id = scoring_data.hs_code_id 
      AND recommendation.country_id = scoring_data.country_id;
    """
    
    result = db.execute(text(scoring_sql), {"now": datetime.now()})
    db.commit()
    
    logger.info(f"Scoring Engine Completed. Rows updated: {result.rowcount}")
    return result.rowcount

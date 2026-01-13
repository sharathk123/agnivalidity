from sqlalchemy.orm import Session
from sqlalchemy import text

# TASK 1: Incentive Calculator
def calculate_landed_cost(db: Session, hs_code: str, base_cost: float, logistics: float = 0):
    # 1. Fetch HS Info
    hs = db.execute(text("SELECT description, regulatory_sensitivity FROM hs_code WHERE hs_code=:h"), {"h": hs_code}).fetchone()
    if not hs:
        return {"error": "HS Code not found"}
    
    desc, sensitivity = hs
    
    # Policy Warning Logic
    warnings = []
    if sensitivity == 'HIGH':
        warnings.append("POLICY WARNING: Restricted/High-Risk Item. Incentives may be denied.")
        return {
             "hs_code": hs_code,
             "product": desc,
             "base_cost": base_cost,
             "net_export_price": base_cost + logistics, # No deduction
             "incentives": [],
             "warnings": warnings
        }
        
    # 2. Fetch Rates
    rates = db.execute(text("SELECT scheme_name, rate_pct FROM incentive_rates WHERE hs_code=:h"), {"h": hs_code}).fetchall()
    
    benefits = []
    total_benefit = 0
    for r in rates:
        amt = base_cost * (r.rate_pct / 100.0)
        benefits.append({"scheme": r.scheme_name, "rate": f"{r.rate_pct}%", "amount": round(amt, 2)})
        total_benefit += amt
        
    net_price = (base_cost + logistics) - total_benefit
    
    return {
        "hs_code": hs_code,
        "product": desc,
        "base_cost": base_cost,
        "logistics": logistics,
        "total_benefit": round(total_benefit, 2),
        "net_export_price": round(net_price, 2),
        "breakdown": benefits,
        "warnings": warnings
    }

# TASK 2: Compliance Validator
def validate_icegate_json(payload: dict):
    # Mock Schema Check (2026 Standards)
    violations = []
    
    required_tags = ["SB_Type", "Entity_ID", "Port_Code", "RoDTEP_Y_N"]
    
    for tag in required_tags:
        if tag not in payload:
            violations.append(f"Missing mandatory tag: {tag}")
            
    if violations:
        return {
            "status": "FAILED", 
            "compliance_ver": "v1.6 (Jan 2026)", 
            "remediation_plan": violations
        }
        
    return {"status": "SUCCESS", "message": "Payload Compliant with MIG_CIM v1.6"}

# TASK 3: ODOP Intelligence
def get_odop_intelligence(db: Session, district: str, hs_code: str):
    # Check if this district + HS combo matches registry
    # Use exact match or prefix
    # Need to handle case sensitivity
    row = db.execute(text("""
        SELECT scheme_name, benefit_pct FROM odop_registry 
        WHERE LOWER(district) = LOWER(:d) AND :h LIKE hs_code_prefix || '%'
    """), {"d": district, "h": hs_code}).fetchone()
    
    if row:
        scheme, pct = row
        return f"As an ODOP product for {district}, you qualify for {scheme} with a potential {pct}% subsidy on processing units."
    
    return None

# CODING_BEST_PRACTICES.md
## EXIM Insight India – Validation MVP

----------------------------------------------------------------
AUTHORITY
----------------------------------------------------------------
This document defines HOW code must be written.

Precedence order:
1. MASTER_PRODUCT_CONTRACT.md
2. TESTING_CONTRACT.md
3. This file

Applies primarily to BACKEND code.

----------------------------------------------------------------
CORE PRINCIPLE (NON-NEGOTIABLE)
----------------------------------------------------------------
Boring code is good code.
Clear code beats clever code.
Deterministic code beats flexible code.

If code looks impressive or “smart”, it is wrong for this MVP.

----------------------------------------------------------------
FILE & MODULE STRUCTURE
----------------------------------------------------------------
Rules:
- One file = one responsibility
- Prefer one API endpoint per file
- No generic utils files
- No file mixing API + business logic
- Maximum nesting depth: 3

GOOD:
app/api/hs_search.py
app/services/hs_service.py
tests/api/test_hs_search.py

BAD:
app/core/helpers/utils/common.py

----------------------------------------------------------------
FUNCTION DESIGN RULES
----------------------------------------------------------------
MUST:
- Max 30 lines per function
- Explicit parameters
- Explicit return values
- Deterministic behavior

MUST NOT:
- Use global variables
- Create side effects
- Depend on hidden state
- Use magic defaults

GOOD:
def calculate_total_risk(scores: list[int]) -> int:
    return sum(scores)

BAD:
def calc():
    global risk
    risk += random.random()

----------------------------------------------------------------
NAMING CONVENTIONS (STRICT)
----------------------------------------------------------------
Variables & Functions:
- Descriptive and boring
- No abbreviations unless industry standard

GOOD:
market_demand
get_price_band()

BAD:
md
getPB()

Files:
- snake_case.py
- Name reflects responsibility

GOOD:
risk_service.py

BAD:
risk_v2_final.py

----------------------------------------------------------------
DATABASE ACCESS RULES
----------------------------------------------------------------
MUST:
- Follow DATABASE_SCHEMA.md exactly
- Explicit column selection
- Readable joins

MUST NOT:
- Use SELECT *
- Modify schema
- Add migrations
- Hide DB logic in API files

GOOD:
select(
    market_demand.demand_level,
    market_demand.trend
)

BAD:
select("*")

----------------------------------------------------------------
API DESIGN RULES
----------------------------------------------------------------
MUST:
- One clear responsibility per endpoint
- Explicit query parameters
- Stable response shape
- Use response models / DTOs

MUST NOT:
- Overload endpoints
- Return raw ORM objects
- Leak internal IDs
- Embed business logic in controllers

Rule:
If frontend needs backend code to understand a response,
the API is wrong.

----------------------------------------------------------------
ERROR HANDLING (MVP LEVEL)
----------------------------------------------------------------
MUST:
- Validate inputs
- Use correct HTTP status codes
- Plain-English error messages

MUST NOT:
- Return stack traces
- Use generic “Something went wrong”
- Swallow exceptions silently

----------------------------------------------------------------
COMMENTS & DOCSTRINGS
----------------------------------------------------------------
MUST:
- Explain WHY, not WHAT
- Add docstrings for public functions

MUST NOT:
- Describe obvious code
- Use marketing language
- Mention AI or intelligence

GOOD:
"""
Computes composite risk score using fixed,
rule-based logic defined in product contracts.
"""

BAD:
# This smart function intelligently calculates risk

----------------------------------------------------------------
TESTING DISCIPLINE
----------------------------------------------------------------
Compliance with TESTING_CONTRACT.md is mandatory.

Additional rules:
- Tests must be readable
- Tests must reflect real usage
- Tests must fail meaningfully

A test that always passes is worse than no test.

----------------------------------------------------------------
DEPENDENCY RULES
----------------------------------------------------------------
ALLOWED:
- FastAPI
- SQLAlchemy / SQLModel
- Pydantic
- pytest

FORBIDDEN:
- Meta-frameworks
- Code generators
- Heavy utility libraries
- Experimental packages

If a new dependency seems required:
STOP and ask.

----------------------------------------------------------------
REFACTORING RULES
----------------------------------------------------------------
ALLOWED:
- Small local refactors
- Removing duplication within a single slice

FORBIDDEN:
- Cross-slice refactors
- “Preparing for scale”
- Architecture rewrites

MVP code is disposable. Do not treat it as permanent.

----------------------------------------------------------------
PERFORMANCE RULE
----------------------------------------------------------------
Correctness > Speed.

Sub-second responses are sufficient.

MUST NOT:
- Add caching
- Add async complexity
- Optimize prematurely

----------------------------------------------------------------
LANGUAGE & TONE (GUARDRAIL)
----------------------------------------------------------------
All code, comments, and messages MUST be:
- Neutral
- Advisory
- Factual

FORBIDDEN EVERYWHERE:
- AI-powered
- Smart
- Intelligent
- High-fidelity
- Enterprise-grade
- Production-ready

----------------------------------------------------------------
PRE-SUBMISSION CHECKLIST
----------------------------------------------------------------
Before marking work complete, verify:

- [ ] Single responsibility per file
- [ ] Clear, boring naming
- [ ] No schema changes
- [ ] Test exists and passes
- [ ] Deterministic logic
- [ ] No marketing language
- [ ] Scope limited to current story

If any item is unchecked, work is INCOMPLETE.

----------------------------------------------------------------
FINAL PRINCIPLE
----------------------------------------------------------------
Write code as if it will be reviewed by a cautious regulator,
not a startup demo audience.

END OF CODING_BEST_PRACTICES.md

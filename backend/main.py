from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from database import init_db

# Import Routers
from api import hsn, country, demand, price, certification, risk, recommendation, report, report_pdf

# Initialize DB on startup
init_db()

app = FastAPI(title="EXIM Insight India - Rule-based Validation MVP")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(hsn.router)
app.include_router(country.router)
app.include_router(demand.router)
app.include_router(price.router)
app.include_router(certification.router)
app.include_router(risk.router)
app.include_router(recommendation.router)
app.include_router(report.router)
app.include_router(report_pdf.router)

@app.get("/")
async def root():
    """
    Entry point for service status verification.
    """
    return {"message": "EXIM Insight India Rule-based MVP is running", "status": "online"}

@app.get("/api/v1/health")
async def health_check():
    """
    Liveness probe for deployment environment.
    """
    return {"status": "healthy", "system": "ready"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

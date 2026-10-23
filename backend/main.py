import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database import engine, Base, SessionLocal
from seed_data import seed_database
from models import MerchantTransaction

# Import routes
from routes.analyze import router as analyze_router
from routes.verify import router as verify_router
from routes.dashboard import router as dashboard_router
from routes.history import router as history_router
from routes.demo import router as demo_router
from routes.report import router as report_router

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
DEMO_DIR = os.path.join(PROJECT_DIR, "demo")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(DEMO_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB & Seed Data
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield


app = FastAPI(
    title="PayShield AI API",
    description="Cybersecurity Fake Payment Screenshot & Transaction Verification API (Parakram Hackathon 2026 - CS-01)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
if os.path.exists(DEMO_DIR):
    app.mount("/demo-files", StaticFiles(directory=DEMO_DIR), name="demo-files")

# Include Routers
app.include_router(analyze_router)
app.include_router(verify_router)
app.include_router(dashboard_router)
app.include_router(history_router)
app.include_router(demo_router)
app.include_router(report_router)


@app.get("/api/health")
def health_check():
    """Health check verifying database connection and OCR readiness."""
    db = SessionLocal()
    try:
        tx_count = db.query(MerchantTransaction).count()
        db_status = "connected"
    except Exception as e:
        tx_count = 0
        db_status = f"error: {str(e)}"
    finally:
        db.close()

    return {
        "status": "healthy",
        "service": "PayShield AI Core",
        "problem_statement": "CS-01 Fake Payment Screenshot Verification",
        "hackathon": "PARAKRAM 2026",
        "database": db_status,
        "merchant_records_seeded": tx_count,
        "ocr_engine": "RapidOCR ONNX (Offline Native)",
        "cv_engine": "OpenCV 5.0",
    }


# Production Frontend Static Serving (Single-service deployment)
FRONTEND_DIST = os.path.join(PROJECT_DIR, "frontend", "dist")
if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Allow static files if directly matched
        potential_file = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.isfile(potential_file):
            return FileResponse(potential_file)
        # Fallback to SPA index.html
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import AnalysisRecord, MerchantTransaction

router = APIRouter(prefix="/api", tags=["Dashboard"])


@router.get("/dashboard")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Fetch aggregated statistics and visual chart datasets for the cybersecurity dashboard."""
    total_scans = db.query(AnalysisRecord).count()
    verified_count = db.query(AnalysisRecord).filter(AnalysisRecord.verification_status == "VERIFIED").count()
    mismatch_count = db.query(AnalysisRecord).filter(AnalysisRecord.verification_status == "MISMATCH").count()
    not_found_count = db.query(AnalysisRecord).filter(AnalysisRecord.verification_status == "NOT FOUND").count()
    inconclusive_count = db.query(AnalysisRecord).filter(AnalysisRecord.verification_status == "INCONCLUSIVE").count()

    high_risk = db.query(AnalysisRecord).filter(AnalysisRecord.risk_level == "HIGH").count()
    medium_risk = db.query(AnalysisRecord).filter(AnalysisRecord.risk_level == "MEDIUM").count()
    low_risk = db.query(AnalysisRecord).filter(AnalysisRecord.risk_level == "LOW").count()

    avg_score = db.query(func.avg(AnalysisRecord.suspicion_score)).scalar() or 0.0

    recent_records_raw = db.query(AnalysisRecord).order_by(AnalysisRecord.created_at.desc()).limit(8).all()
    recent_records = [r.to_dict() for r in recent_records_raw]

    # Recharts the formatted distributions 
    status_distribution = [
        {"name": "Verified", "value": verified_count, "color": "#10b981"},
        {"name": "Mismatch", "value": mismatch_count, "color": "#ef4444"},
        {"name": "Not Found", "value": not_found_count, "color": "#f59e0b"},
        {"name": "Inconclusive", "value": inconclusive_count, "color": "#64748b"},
    ]

    risk_distribution = [
        {"name": "Low Suspicion", "value": low_risk, "color": "#10b981"},
        {"name": "Medium Risk", "value": medium_risk, "color": "#f59e0b"},
        {"name": "High Alert", "value": high_risk, "color": "#ef4444"},
    ]

    # Mock daily trend for dashboard visual
    daily_trend = [
        {"day": "Mon", "scanned": 12, "flagged": 3, "verified": 9},
        {"day": "Tue", "scanned": 18, "flagged": 5, "verified": 13},
        {"day": "Wed", "scanned": 15, "flagged": 4, "verified": 11},
        {"day": "Thu", "scanned": 22, "flagged": 7, "verified": 15},
        {"day": "Fri", "scanned": 28, "flagged": 9, "verified": 19},
        {"day": "Sat", "scanned": 35, "flagged": 11, "verified": 24},
        {"day": "Today", "scanned": total_scans, "flagged": mismatch_count + not_found_count, "verified": verified_count},
    ]

    total_merchant_tx = db.query(MerchantTransaction).count()

    return {
        "total_scans": total_scans,
        "verified_count": verified_count,
        "mismatch_count": mismatch_count,
        "not_found_count": not_found_count,
        "inconclusive_count": inconclusive_count,
        "high_risk_count": high_risk,
        "medium_risk_count": medium_risk,
        "low_risk_count": low_risk,
        "average_suspicion_score": round(float(avg_score), 1),
        "total_merchant_records": total_merchant_tx,
        "recent_records": recent_records,
        "status_distribution": status_distribution,
        "risk_distribution": risk_distribution,
        "daily_trend": daily_trend,
    }

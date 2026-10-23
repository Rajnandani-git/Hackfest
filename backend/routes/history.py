from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import AnalysisRecord, MerchantTransaction

router = APIRouter(prefix="/api", tags=["History"])


@router.get("/history")
def get_analysis_history(
    search: Optional[str] = Query(None, description="Search by UTR or Payee"),
    status: Optional[str] = Query(None, description="Filter by status (VERIFIED, MISMATCH, NOT FOUND, INCONCLUSIVE)"),
    risk_level: Optional[str] = Query(None, description="Filter by risk (LOW, MEDIUM, HIGH)"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Retrieve filtered and paginated history of screenshot verifications."""
    query = db.query(AnalysisRecord)

    if status:
        query = query.filter(AnalysisRecord.verification_status == status.upper())

    if risk_level:
        query = query.filter(AnalysisRecord.risk_level == risk_level.upper())

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (AnalysisRecord.extracted_utr.ilike(s)) |
            (AnalysisRecord.extracted_payee.ilike(s)) |
            (AnalysisRecord.ocr_raw_text.ilike(s))
        )

    total = query.count()
    records = query.order_by(AnalysisRecord.created_at.desc()).offset(offset).limit(limit).all()

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "records": [r.to_dict() for r in records]
    }


@router.get("/history/{record_id}")
def get_analysis_detail(record_id: str, db: Session = Depends(get_db)):
    """Retrieve a single detailed verification record by ID or UUID."""
    # Check if integer ID or UUID string
    if record_id.isdigit():
        record = db.query(AnalysisRecord).filter(AnalysisRecord.id == int(record_id)).first()
    else:
        record = db.query(AnalysisRecord).filter(AnalysisRecord.analysis_id == record_id).first()

    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found.")

    res = record.to_dict()
    matched = None
    if record.matched_transaction_id:
        tx = db.query(MerchantTransaction).filter(MerchantTransaction.id == record.matched_transaction_id).first()
        if tx:
            matched = tx.to_dict()
    res["matched_transaction"] = matched
    return res

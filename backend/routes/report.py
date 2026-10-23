from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from database import get_db
from models import AnalysisRecord, MerchantTransaction
from services.pdf_service import PDFReportService

router = APIRouter(prefix="/api", tags=["Report"])


@router.get("/report/{record_id}/pdf")
def download_pdf_report(record_id: str, db: Session = Depends(get_db)):
    """Generate and return binary PDF audit certificate."""
    if record_id.isdigit():
        record = db.query(AnalysisRecord).filter(AnalysisRecord.id == int(record_id)).first()
    else:
        record = db.query(AnalysisRecord).filter(AnalysisRecord.analysis_id == record_id).first()

    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found.")

    matched_tx = None
    if record.matched_transaction_id:
        matched_tx = db.query(MerchantTransaction).filter(
            MerchantTransaction.id == record.matched_transaction_id
        ).first()

    pdf_buffer = PDFReportService.generate_report(record, matched_tx)

    filename = f"PayShield_Audit_{record.analysis_id[:8].upper()}.pdf"
    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

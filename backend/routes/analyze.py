import os
import uuid
import json
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import AnalysisRecord, MerchantTransaction
from services.cv_service import ComputerVisionService
from services.ocr_service import OCRService
from services.verification_service import VerificationService

router = APIRouter(prefix="/api", tags=["Analysis"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Instantiate OCR engine once
ocr_engine = OCRService()

ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/analyze")
async def analyze_screenshot(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1. Validate content type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format: {file.content_type}. Please upload JPG or PNG screenshots."
        )

    # 2. Read file bytes and validate size
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds maximum allowable limit of 10MB.")

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # 3. Save file locally
    file_ext = os.path.splitext(file.filename)[1]
    if not file_ext:
        file_ext = ".png" if "png" in file.content_type else ".jpg"
    
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    saved_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(saved_path, "wb") as f:
        f.write(file_bytes)

    # 4. Computer Vision Analysis
    cv_results = ComputerVisionService.run_full_cv_pipeline(saved_path, file_bytes, db_session=db)

    # 5. RapidOCR text extraction & heuristic parsing
    ocr_data = ocr_engine.extract_text(saved_path)
    parsed_details = ocr_engine.parse_transaction_details(ocr_data)

    # 6. Cross-verification against simulated merchant ledger and heuristic risk scoring
    verification_outcome = VerificationService.verify_and_score(
        db=db,
        extracted=parsed_details,
        cv_metrics=cv_results
    )

    # 7. Persist record in SQLite
    record_id = str(uuid.uuid4())
    record = AnalysisRecord(
        analysis_id=record_id,
        image_filename=unique_filename,
        image_hash=cv_results.get("sha256"),
        extracted_utr=parsed_details.get("extracted_utr"),
        extracted_amount=parsed_details.get("extracted_amount"),
        extracted_status=parsed_details.get("extracted_status"),
        extracted_timestamp=parsed_details.get("extracted_timestamp"),
        extracted_payee=parsed_details.get("extracted_payee"),
        ocr_raw_text=ocr_data.get("full_text"),
        verification_status=verification_outcome["verification_status"],
        suspicion_score=verification_outcome["suspicion_score"],
        risk_level=verification_outcome["risk_level"],
        risk_factors_json=json.dumps(verification_outcome["risk_factors"], default=str),
        cv_metrics_json=json.dumps(cv_results, default=str),
        suggested_action=verification_outcome["suggested_action"],
        matched_transaction_id=verification_outcome.get("matched_transaction_id")
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    res = record.to_dict()
    res["matched_transaction"] = verification_outcome.get("matched_transaction")
    res["ocr_blocks"] = ocr_data.get("blocks", [])
    return res

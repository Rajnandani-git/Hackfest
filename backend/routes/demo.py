import os
import uuid
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import AnalysisRecord
from services.cv_service import ComputerVisionService
from services.ocr_service import OCRService
from services.verification_service import VerificationService

router = APIRouter(prefix="/api/demo", tags=["Demo Mode"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_DIR = os.path.dirname(BASE_DIR)
DEMO_DIR = os.path.join(PROJECT_DIR, "demo")

ocr_engine = OCRService()

DEMO_CASES = [
    {
        "id": 1,
        "title": "Demo 1: Genuine Payment",
        "badge": "Expected: VERIFIED",
        "description": "A payment screenshot containing details matching a successful transaction in the simulated merchant database (₹850, UTR 329847192834).",
        "filename": "demo1_genuine.png",
        "expected_status": "VERIFIED",
        "expected_risk": "LOW"
    },
    {
        "id": 2,
        "title": "Demo 2: Fake Payment Claim",
        "badge": "Expected: NOT FOUND",
        "description": "A screenshot claiming successful payment of ₹1,200 with an uncredited UTR 889102938475 not found in the merchant ledger.",
        "filename": "demo2_fake_claim.png",
        "expected_status": "NOT FOUND",
        "expected_risk": "MEDIUM"
    },
    {
        "id": 3,
        "title": "Demo 3: Tampered Amount Mismatch",
        "badge": "Expected: MISMATCH",
        "description": "A screenshot visually claiming ₹5,000 while the corresponding merchant bank credit for UTR 491028374619 is only ₹500.",
        "filename": "demo3_amount_mismatch.png",
        "expected_status": "MISMATCH",
        "expected_risk": "HIGH"
    }
]


@router.get("/cases")
def list_demo_cases():
    """Returns available hackathon demonstration cases."""
    return DEMO_CASES


@router.post("/run/{case_id}")
def run_demo_pipeline(case_id: int, db: Session = Depends(get_db)):
    """
    Executes the genuine backend pipeline (OpenCV + RapidOCR + Heuristics + DB verification)
    on the chosen demo screenshot file without hardcoding outcomes!
    """
    selected_case = next((c for c in DEMO_CASES if c["id"] == case_id), None)
    if not selected_case:
        raise HTTPException(status_code=404, detail="Demo scenario not found.")

    image_path = os.path.join(DEMO_DIR, selected_case["filename"])
    if not os.path.exists(image_path):
        raise HTTPException(status_code=500, detail=f"Demo image {selected_case['filename']} not found on server.")

    with open(image_path, "rb") as f:
        file_bytes = f.read()

    # Copy demo file into uploads dir so frontend can display it
    upload_dir = os.path.join(BASE_DIR, "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    unique_filename = f"demo_{case_id}_{uuid.uuid4().hex[:8]}.png"
    target_upload_path = os.path.join(upload_dir, unique_filename)
    with open(target_upload_path, "wb") as f:
        f.write(file_bytes)

    # 1. Computer Vision forensics
    cv_results = ComputerVisionService.run_full_cv_pipeline(target_upload_path, file_bytes, db_session=db)

    # 2. RapidOCR text extraction
    ocr_data = ocr_engine.extract_text(target_upload_path)
    parsed_details = ocr_engine.parse_transaction_details(ocr_data)

    # 3. Cross-verification against merchant database & risk scoring
    verification_outcome = VerificationService.verify_and_score(
        db=db,
        extracted=parsed_details,
        cv_metrics=cv_results
    )

    # 4. Save audit record to SQLite
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
    res["demo_metadata"] = selected_case
    return res

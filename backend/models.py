import datetime
import json
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from database import Base


class MerchantTransaction(Base):
    __tablename__ = "merchant_transactions"

    id = Column(Integer, primary_key=True, index=True)
    utr_number = Column(String(50), unique=True, index=True, nullable=False)
    amount = Column(Float, nullable=False)
    payer_name = Column(String(100), nullable=True)
    payer_upi = Column(String(100), nullable=True)
    merchant_vpa = Column(String(100), default="payshield.merchant@icici")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(20), default="SUCCESS")  # SUCCESS, PENDING, FAILED
    order_ref = Column(String(50), nullable=True)
    notes = Column(String(200), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "utr_number": self.utr_number,
            "amount": self.amount,
            "payer_name": self.payer_name,
            "payer_upi": self.payer_upi,
            "merchant_vpa": self.merchant_vpa,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "status": self.status,
            "order_ref": self.order_ref,
            "notes": self.notes,
        }


class AnalysisRecord(Base):
    __tablename__ = "analysis_records"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(String(36), unique=True, index=True, nullable=False)
    image_filename = Column(String(255), nullable=False)
    image_hash = Column(String(64), index=True, nullable=True)
    
    # Extracted fields from OCR
    extracted_utr = Column(String(50), nullable=True)
    extracted_amount = Column(Float, nullable=True)
    extracted_status = Column(String(50), nullable=True)
    extracted_timestamp = Column(String(100), nullable=True)
    extracted_payee = Column(String(100), nullable=True)
    ocr_raw_text = Column(Text, nullable=True)
    
    # Verification & Risk Analysis
    verification_status = Column(String(30), nullable=False)  # VERIFIED, MISMATCH, NOT FOUND, INCONCLUSIVE
    suspicion_score = Column(Integer, default=0)              # 0 to 100
    risk_level = Column(String(20), default="LOW")            # LOW, MEDIUM, HIGH
    risk_factors_json = Column(Text, default="[]")           # JSON list of detected flags
    cv_metrics_json = Column(Text, default="{}")             # JSON object of CV metrics
    suggested_action = Column(Text, nullable=True)
    
    # Matching merchant transaction (if found the match)
    matched_transaction_id = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    @property
    def risk_factors(self):
        try:
            return json.loads(self.risk_factors_json) if self.risk_factors_json else []
        except Exception:
            return []

    @property
    def cv_metrics(self):
        try:
            return json.loads(self.cv_metrics_json) if self.cv_metrics_json else {}
        except Exception:
            return {}

    def to_dict(self):
        return {
            "id": self.id,
            "analysis_id": self.analysis_id,
            "image_filename": self.image_filename,
            "image_url": f"/uploads/{self.image_filename}",
            "image_hash": self.image_hash,
            "extracted_utr": self.extracted_utr,
            "extracted_amount": self.extracted_amount,
            "extracted_status": self.extracted_status,
            "extracted_timestamp": self.extracted_timestamp,
            "extracted_payee": self.extracted_payee,
            "ocr_raw_text": self.ocr_raw_text,
            "verification_status": self.verification_status,
            "suspicion_score": self.suspicion_score,
            "risk_level": self.risk_level,
            "risk_factors": self.risk_factors,
            "cv_metrics": self.cv_metrics,
            "suggested_action": self.suggested_action,
            "matched_transaction_id": self.matched_transaction_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

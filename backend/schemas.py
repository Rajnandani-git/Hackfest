from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class AnalysisResponse(BaseModel):
    id: int
    analysis_id: str
    image_filename: str
    image_url: str
    image_hash: Optional[str] = None
    extracted_utr: Optional[str] = None
    extracted_amount: Optional[float] = None
    extracted_status: Optional[str] = None
    extracted_timestamp: Optional[str] = None
    extracted_payee: Optional[str] = None
    ocr_raw_text: Optional[str] = None
    verification_status: str
    suspicion_score: int
    risk_level: str
    risk_factors: List[str]
    cv_metrics: Dict[str, Any]
    suggested_action: Optional[str] = None
    matched_transaction: Optional[Dict[str, Any]] = None
    created_at: Optional[str] = None


class ManualVerifyRequest(BaseModel):
    utr_number: str
    claimed_amount: Optional[float] = None


class MerchantTransactionSchema(BaseModel):
    id: int
    utr_number: str
    amount: float
    payer_name: Optional[str]
    payer_upi: Optional[str]
    merchant_vpa: Optional[str]
    timestamp: Optional[str]
    status: str
    order_ref: Optional[str]


class DashboardStats(BaseModel):
    total_scans: int
    verified_count: int
    mismatch_count: int
    not_found_count: int
    inconclusive_count: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    average_suspicion_score: float
    recent_records: List[Dict[str, Any]]
    status_distribution: List[Dict[str, Any]]
    risk_distribution: List[Dict[str, Any]]

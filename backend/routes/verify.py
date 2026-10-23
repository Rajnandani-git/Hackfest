from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import MerchantTransaction
from schemas import ManualVerifyRequest

router = APIRouter(prefix="/api", tags=["Verify"])


@router.post("/verify")
def verify_transaction(req: ManualVerifyRequest, db: Session = Depends(get_db)):
    """
    Directly query merchant records for a UTR and claimed amount
    for instant lookup or merchant double-checking.
    """
    utr = req.utr_number.strip()
    if not utr:
        raise HTTPException(status_code=400, detail="UTR number cannot be empty.")

    matched_tx = db.query(MerchantTransaction).filter(
        MerchantTransaction.utr_number == utr
    ).first()

    if not matched_tx:
        return {
            "utr_number": utr,
            "verification_status": "NOT FOUND",
            "message": "No transaction matching this UTR exists in merchant records.",
            "matched_transaction": None
        }

    amount_matched = True
    if req.claimed_amount is not None:
        amount_matched = abs(float(req.claimed_amount) - float(matched_tx.amount)) < 0.05

    if amount_matched and matched_tx.status == "SUCCESS":
        status = "VERIFIED"
        message = f"Transaction confirmed! ₹{matched_tx.amount:,.2f} received successfully."
    else:
        status = "MISMATCH"
        if not amount_matched:
            message = f"Amount mismatch: Claimed ₹{req.claimed_amount}, but bank ledger recorded ₹{matched_tx.amount}."
        else:
            message = f"Status issue: Bank record shows '{matched_tx.status}'."

    return {
        "utr_number": utr,
        "verification_status": status,
        "message": message,
        "matched_transaction": matched_tx.to_dict()
    }

from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from models import MerchantTransaction, AnalysisRecord


class VerificationService:
    @classmethod
    def verify_and_score(
        cls,
        db: Session,
        extracted: dict,
        cv_metrics: dict,
        manual_override: bool = False
    ) -> dict:
        """
        Cross-verifies extracted screenshot details against the merchant's simulated
        ledger and computes an explainable heuristic suspicion score (0-100).
        """
        utr = extracted.get("extracted_utr")
        amount = extracted.get("extracted_amount")
        status = extracted.get("extracted_status") or "UNKNOWN"
        
        risk_factors: List[str] = []
        matched_tx: Optional[MerchantTransaction] = None
        
        # 1. Determine Verification Status against Merchant Ledger
        if not utr:
            verification_status = "INCONCLUSIVE"
            risk_factors.append("No valid 12-digit UPI Reference / UTR number could be detected in the screenshot.")
            base_score = 45
        else:
            # Query merchant transaction records
            matched_tx = db.query(MerchantTransaction).filter(
                MerchantTransaction.utr_number == utr
            ).first()

            if matched_tx:
                # Compare Amount and Status
                amount_matched = False
                if amount is not None and matched_tx.amount is not None:
                    # Allow 0.05 rounding tolerance
                    amount_matched = abs(float(amount) - float(matched_tx.amount)) < 0.05
                elif amount is None:
                    amount_matched = False

                if amount_matched and matched_tx.status == "SUCCESS":
                    verification_status = "VERIFIED"
                    base_score = 5
                else:
                    verification_status = "MISMATCH"
                    base_score = 85
                    if not amount_matched and amount is not None:
                        risk_factors.append(
                            f"Critical Amount Mismatch: Screenshot claims ₹{amount:,.2f}, but merchant bank record logged ₹{matched_tx.amount:,.2f}."
                        )
                    if matched_tx.status != "SUCCESS":
                        risk_factors.append(
                            f"Status Discrepancy: Merchant ledger records transaction status as '{matched_tx.status}', not successful."
                        )
            else:
                verification_status = "NOT FOUND"
                base_score = 55
                risk_factors.append(
                    f"UTR '{utr}' is not present in merchant bank records. Screenshot cannot confirm fund receipt."
                )

        # 2. Add Heuristic Risk Factors
        score = base_score

        # Amount extraction check
        if amount is None:
            score += 15
            risk_factors.append("Payment amount could not be clearly verified from OCR extraction.")

        # Payment status text check
        if status == "FAILED":
            score += 35
            risk_factors.append("Screenshot text explicitly indicates a FAILED or cancelled transaction.")
        elif status == "PENDING":
            score += 20
            risk_factors.append("Screenshot text indicates transaction is still PENDING / Processing.")

        # Duplicate screenshot detection
        if cv_metrics.get("is_duplicate"):
            dup_count = cv_metrics.get("duplicate_count", 1)
            score += 30
            risk_factors.append(
                f"Duplicate Submission Alert: This exact screenshot has been analyzed {dup_count} time(s) previously."
            )

        # Computer vision ELA (Error Level Analysis) check
        ela = cv_metrics.get("ela", {})
        if ela.get("ela_anomaly_detected"):
            score += 20
            risk_factors.append(
                "Visual Compression Inconsistency: Error Level Analysis (ELA) detected anomalous pixel variance around text regions, suggesting digital editing or splicing."
            )

        # Blurriness / image quality check
        quality = cv_metrics.get("quality", {})
        if quality.get("is_blurry"):
            score += 10
            risk_factors.append("Low image sharpness / blurry capture makes optical verification unreliable.")

        if not quality.get("is_mobile_aspect", True):
            score += 5
            risk_factors.append("Image dimensions deviate from standard smartphone screenshot aspect ratios.")

        # Clamp score between 0 and 100
        suspicion_score = max(0, min(100, int(score)))

        # Determine Risk Level Category
        if suspicion_score <= 29:
            risk_level = "LOW"
        elif suspicion_score <= 69:
            risk_level = "MEDIUM"
        else:
            risk_level = "HIGH"

        # 3. Actionable Operational Recommendation
        if verification_status == "VERIFIED":
            suggested_action = (
                "Verified payment receipt. Transaction reference and amount match confirmed merchant settlement records."
            )
        elif verification_status == "MISMATCH":
            suggested_action = (
                "DO NOT DISPATCH GOODS. There is a verified amount or status mismatch against actual bank ledger credits. Contact customer or verify bank statement."
            )
        elif verification_status == "NOT FOUND":
            suggested_action = (
                "HOLD DISPATCH. No credit has been received for this UTR in the merchant bank account. Ask customer to wait for merchant soundbox announcement or live bank notification."
            )
        else:  # INCONCLUSIVE
            suggested_action = (
                "MANUAL CHECK REQUIRED. UTR number was obscured or unreadable. Ask the customer to display the live transaction screen in their UPI app."
            )

        return {
            "verification_status": verification_status,
            "suspicion_score": suspicion_score,
            "risk_level": risk_level,
            "risk_factors": risk_factors,
            "suggested_action": suggested_action,
            "matched_transaction": matched_tx.to_dict() if matched_tx else None,
            "matched_transaction_id": matched_tx.id if matched_tx else None
        }

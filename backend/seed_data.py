import datetime
import uuid
import json
from database import engine, SessionLocal, Base
from models import MerchantTransaction, AnalysisRecord


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    existing_count = db.query(MerchantTransaction).count()
    if existing_count > 0:
        db.close()
        return

    now = datetime.datetime.utcnow()

    # 1. Realistic Simulated Merchant Transactions
    transactions = [
        # Match for Demo 1: Genuine Payment
        MerchantTransaction(
            utr_number="329847192834",
            amount=850.00,
            payer_name="Aditya Sharma",
            payer_upi="aditya.sharma@okaxis",
            merchant_vpa="payshield.merchant@icici",
            timestamp=now - datetime.timedelta(minutes=45),
            status="SUCCESS",
            order_ref="ORD-99120",
            notes="Retail Grocery Basket"
        ),
        # Match for Demo 3: Tampered Amount Mismatch (Ledger has 500.00, screenshot claims 5,000.00)
        MerchantTransaction(
            utr_number="491028374619",
            amount=500.00,
            payer_name="Rahul Verma",
            payer_upi="rahul.v@ybl",
            merchant_vpa="payshield.merchant@icici",
            timestamp=now - datetime.timedelta(hours=2),
            status="SUCCESS",
            order_ref="ORD-88231",
            notes="Cafe dine-in bill"
        ),
        # Additional Realistic Transactions
        MerchantTransaction(
            utr_number="582910482910",
            amount=1450.00,
            payer_name="Pooja Patel",
            payer_upi="pooja@paytm",
            merchant_vpa="payshield.merchant@icici",
            timestamp=now - datetime.timedelta(hours=3),
            status="SUCCESS",
            order_ref="ORD-77192",
            notes="Pharmacy medicine order"
        ),
        MerchantTransaction(
            utr_number="619283019283",
            amount=250.00,
            payer_name="Karan Malhotra",
            payer_upi="karan@oksbi",
            merchant_vpa="payshield.merchant@icici",
            timestamp=now - datetime.timedelta(hours=5),
            status="SUCCESS",
            order_ref="ORD-66281",
            notes="Stationery supplies"
        ),
        MerchantTransaction(
            utr_number="729104820194",
            amount=3200.00,
            payer_name="Neha Gupta",
            payer_upi="neha@hdfcbank",
            merchant_vpa="payshield.merchant@icici",
            timestamp=now - datetime.timedelta(hours=6),
            status="SUCCESS",
            order_ref="ORD-55392",
            notes="Electronics accessories"
        ),
        MerchantTransaction(
            utr_number="810293847561",
            amount=120.00,
            payer_name="Amit Kumar",
            payer_upi="amit99@ybl",
            merchant_vpa="payshield.merchant@icici",
            timestamp=now - datetime.timedelta(hours=8),
            status="SUCCESS",
            order_ref="ORD-44102",
            notes="Snacks counter"
        ),
        MerchantTransaction(
            utr_number="918273645019",
            amount=9500.00,
            payer_name="Siddharth Rao",
            payer_upi="sid.rao@okaxis",
            merchant_vpa="payshield.merchant@icici",
            timestamp=now - datetime.timedelta(days=1),
            status="SUCCESS",
            order_ref="ORD-33291",
            notes="Bulk office supplies"
        ),
        MerchantTransaction(
            utr_number="102938475610",
            amount=420.00,
            payer_name="Meera Joshi",
            payer_upi="meera@icici",
            merchant_vpa="payshield.merchant@icici",
            timestamp=now - datetime.timedelta(days=1, hours=4),
            status="SUCCESS",
            order_ref="ORD-22194",
            notes="Bakery items"
        ),
        MerchantTransaction(
            utr_number="293847561029",
            amount=1800.00,
            payer_name="Vikram Singh",
            payer_upi="vikram.singh@oksbi",
            merchant_vpa="payshield.merchant@icici",
            timestamp=now - datetime.timedelta(days=2),
            status="FAILED",  # Gateway reversed/failed
            order_ref="ORD-11029",
            notes="Hardware goods (Card decline)"
        ),
    ]

    for tx in transactions:
        db.add(tx)
    db.commit()

    # 2. Seed initial sample analysis records to populate dashboard & analytics
    sample_analyses = [
        AnalysisRecord(
            analysis_id=str(uuid.uuid4()),
            image_filename="sample_verified.png",
            image_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            extracted_utr="329847192834",
            extracted_amount=850.00,
            extracted_status="SUCCESS",
            extracted_timestamp="24 Oct 2026, 12:45 PM",
            extracted_payee="Sharma General Store",
            ocr_raw_text="Paid successfully to Sharma General Store\n₹850\nUPI Ref No: 329847192834",
            verification_status="VERIFIED",
            suspicion_score=8,
            risk_level="LOW",
            risk_factors_json=json.dumps([]),
            cv_metrics_json=json.dumps({
                "ela": {"ela_mean_delta": 2.1, "ela_max_delta": 14.0, "ela_anomaly_detected": False},
                "quality": {"sharpness_score": 240.5, "is_blurry": False, "resolution": "1080x2400", "is_mobile_aspect": True},
                "is_duplicate": False
            }),
            suggested_action="Verified payment receipt. Transaction reference and amount match confirmed merchant settlement records.",
            matched_transaction_id=1,
            created_at=now - datetime.timedelta(minutes=30)
        ),
        AnalysisRecord(
            analysis_id=str(uuid.uuid4()),
            image_filename="sample_fake_app.png",
            image_hash="7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
            extracted_utr="889102938475",
            extracted_amount=1200.00,
            extracted_status="SUCCESS",
            extracted_timestamp="24 Oct 2026, 01:05 PM",
            extracted_payee="Sharma General Store",
            ocr_raw_text="Payment of ₹1,200 successful\nUPI Ref: 889102938475",
            verification_status="NOT FOUND",
            suspicion_score=68,
            risk_level="MEDIUM",
            risk_factors_json=json.dumps([
                "UTR '889102938475' is not present in merchant bank records. Screenshot cannot confirm fund receipt.",
                "Visual Compression Inconsistency: Error Level Analysis (ELA) detected anomalous pixel variance around text regions."
            ]),
            cv_metrics_json=json.dumps({
                "ela": {"ela_mean_delta": 6.8, "ela_max_delta": 62.0, "ela_anomaly_detected": True},
                "quality": {"sharpness_score": 110.2, "is_blurry": False, "resolution": "720x1600", "is_mobile_aspect": True},
                "is_duplicate": False
            }),
            suggested_action="HOLD DISPATCH. No credit has been received for this UTR in the merchant bank account. Ask customer to wait for merchant soundbox announcement or live bank notification.",
            created_at=now - datetime.timedelta(minutes=15)
        ),
        AnalysisRecord(
            analysis_id=str(uuid.uuid4()),
            image_filename="sample_mismatch.png",
            image_hash="cb8379ac2098aa165029e374bcac5dac449e1e3ecff5402891093505883149f4",
            extracted_utr="491028374619",
            extracted_amount=5000.00,
            extracted_status="SUCCESS",
            extracted_timestamp="24 Oct 2026, 11:20 AM",
            extracted_payee="Sharma General Store",
            ocr_raw_text="Paid to Sharma General Store ₹5,000\nUTR: 491028374619",
            verification_status="MISMATCH",
            suspicion_score=94,
            risk_level="HIGH",
            risk_factors_json=json.dumps([
                "Critical Amount Mismatch: Screenshot claims ₹5,000.00, but merchant bank record logged ₹500.00.",
                "Visual Compression Inconsistency: Error Level Analysis (ELA) detected anomalous pixel variance around text regions, suggesting digital editing or splicing."
            ]),
            cv_metrics_json=json.dumps({
                "ela": {"ela_mean_delta": 9.4, "ela_max_delta": 85.0, "ela_anomaly_detected": True},
                "quality": {"sharpness_score": 180.4, "is_blurry": False, "resolution": "1080x2340", "is_mobile_aspect": True},
                "is_duplicate": False
            }),
            suggested_action="DO NOT DISPATCH GOODS. There is a verified amount or status mismatch against actual bank ledger credits. Contact customer or verify bank statement.",
            matched_transaction_id=2,
            created_at=now - datetime.timedelta(minutes=5)
        )
    ]

    for rec in sample_analyses:
        db.add(rec)
    db.commit()
    db.close()
    print("Database seeded successfully with merchant ledger and baseline records.")


if __name__ == "__main__":
    seed_database()

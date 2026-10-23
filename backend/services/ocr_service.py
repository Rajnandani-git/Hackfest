import re
import cv2
import numpy as np
from rapidocr_onnxruntime import RapidOCR


class OCRService:
    def __init__(self):
        # Initialize RapidOCR engine
        self.engine = RapidOCR()

    def preprocess_image(self, image_path: str) -> np.ndarray:
        """Read and enhance screenshot for optimal OCR readability."""
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Unable to read image file")

        # Convert to RGB as RapidOCR expects
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        return img_rgb

    def extract_text(self, image_path: str) -> dict:
        """Run OCR on image and return raw text lines and bounding boxes."""
        try:
            img = self.preprocess_image(image_path)
            results, elapse_list = self.engine(img)
            
            raw_lines = []
            extracted_blocks = []
            
            if results:
                for item in results:
                    box, text, confidence = item
                    text = text.strip()
                    if text:
                        raw_lines.append(text)
                        extracted_blocks.append({
                            "text": text,
                            "confidence": round(float(confidence), 3),
                            "box": box
                        })
            
            full_text = "\n".join(raw_lines)
            return {
                "raw_lines": raw_lines,
                "full_text": full_text,
                "blocks": extracted_blocks
            }
        except Exception as e:
            return {
                "raw_lines": [],
                "full_text": "",
                "blocks": [],
                "error": str(e)
            }

    def parse_transaction_details(self, ocr_data: dict) -> dict:
        """
        Extract structured transaction attributes (UTR, amount, status, date)
        using multi-tier regex and heuristic matching.
        """
        full_text = ocr_data.get("full_text", "")
        lines = ocr_data.get("raw_lines", [])

        # 1. Extract UTR / UPI Reference Number (12 digits standard)
        extracted_utr = self._extract_utr(full_text, lines)

        # 2. Extract Amount (₹, Rs, INR, or large prominent number)
        extracted_amount = self._extract_amount(full_text, lines)

        # 3. Extract Status ("Paid successfully", "Completed", "Failed", etc.)
        extracted_status = self._extract_status(full_text)

        # 4. Extract Date & Time
        extracted_timestamp = self._extract_timestamp(full_text)

        # 5. Extract Payee Name or VPA
        extracted_payee = self._extract_payee(full_text, lines)

        return {
            "extracted_utr": extracted_utr,
            "extracted_amount": extracted_amount,
            "extracted_status": extracted_status,
            "extracted_timestamp": extracted_timestamp,
            "extracted_payee": extracted_payee,
        }

    def _extract_utr(self, text: str, lines: list) -> str:
        """Detect 12-digit UTR or alphanumeric UPI Transaction ID."""
        # Check explicit labels first
        explicit_patterns = [
            r'(?:UPI\s*Ref(?:\s*No|\s*ID)?|UTR|Ref\s*No|RRN|UPI\s*Txn\s*ID)[:\s\-]*([0-9]{12})',
            r'(?:Txn\s*ID|Transaction\s*ID)[:\s\-]*([A-Za-z0-9]{10,25})',
            r'(?:Google\s*Transaction\s*ID)[:\s\-]*([A-Za-z0-9_\-]{10,30})',
            r'\b(T[0-9]{20,24})\b',  # PhonePe transaction ID format
            r'\b(CIC[0-9]{15,22})\b', # Paytm internal format
        ]
        
        for pat in explicit_patterns:
            match = re.search(pat, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()

        # Look in individual lines near "Ref" or "UPI"
        for line in lines:
            if any(k in line.lower() for k in ["ref", "utr", "rrn", "txn", "transaction", "id"]):
                digits = re.findall(r'\b[0-9]{12}\b', line)
                if digits:
                    return digits[0]

        # General standalone 12-digit search (UPI banking standard)
        standalone_12_digits = re.findall(r'\b[0-9]{12}\b', text)
        if standalone_12_digits:
            return standalone_12_digits[0]

        return None

    def _extract_amount(self, text: str, lines: list) -> float:
        """Extract payment amount considering currency symbols and formatting."""
        # 1. Look for explicit rupee symbols or labels with numbers
        patterns = [
            r'[₹]\s*([0-9,]+(?:\.[0-9]{1,2})?)',
            r'(?:Rs\.?|INR)\s*([0-9,]+(?:\.[0-9]{1,2})?)',
            r'(?:Amount|Paid|Payment)\s*[:\-]?\s*[₹RsINR\s]*([0-9,]+(?:\.[0-9]{1,2})?)',
        ]

        for pat in patterns:
            matches = re.finditer(pat, text, re.IGNORECASE)
            for match in matches:
                amt_str = match.group(1).replace(",", "").strip()
                try:
                    val = float(amt_str)
                    if 0.5 <= val <= 1000000:
                        return val
                except ValueError:
                    continue

        # 2. Look for standalone amounts with .00 at end or prominent decimal
        decimal_matches = re.findall(r'\b([0-9,]+\.[0-9]{2})\b', text)
        for m in decimal_matches:
            val_str = m.replace(",", "")
            try:
                val = float(val_str)
                if 1.0 <= val <= 1000000:
                    return val
            except ValueError:
                pass

        # 3. Look for standalone lines that are pure numbers with ₹ or isolated numbers
        for line in lines:
            cleaned = line.replace("₹", "").replace("Rs.", "").replace("Rs", "").replace("INR", "").replace(",", "").strip()
            if re.match(r'^[0-9]+(?:\.[0-9]{1,2})?$', cleaned):
                try:
                    val = float(cleaned)
                    if 1.0 <= val <= 500000:
                        return val
                except ValueError:
                    pass

        return None

    def _extract_status(self, text: str) -> str:
        """Identify payment status keywords in recognized text."""
        lower = text.lower()
        if any(k in lower for k in [
            "paid successfully", "payment successful", "successful", "transferred successfully",
            "sent successfully", "payment of ₹", "payment done", "completed"
        ]):
            return "SUCCESS"
        elif any(k in lower for k in ["failed", "declined", "cancelled", "payment failure"]):
            return "FAILED"
        elif any(k in lower for k in ["processing", "pending", "in progress", "initiated"]):
            return "PENDING"
        return "UNKNOWN"

    def _extract_timestamp(self, text: str) -> str:
        """Extract transaction timestamp from text."""
        date_patterns = [
            r'(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4},?\s*\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm|AM|PM)?)',
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm|AM|PM)?)',
            r'(\d{1,2}:\d{2}\s*(?:am|pm|AM|PM)\s*on\s*\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})',
        ]
        for pat in date_patterns:
            match = re.search(pat, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return None

    def _extract_payee(self, text: str, lines: list) -> str:
        """Extract merchant or recipient name/UPI ID."""
        # UPI VPA pattern: username@bank
        vpa_match = re.search(r'\b([a-zA-Z0-9.\-_]{2,30}@[a-zA-Z]{2,15})\b', text)
        if vpa_match:
            return vpa_match.group(1)

        # "Paid to <Name>" or "To <Name>"
        paid_to_match = re.search(r'(?:Paid to|To)\s*[:\-]?\s*([A-Za-z0-9\s]{3,30})', text, re.IGNORECASE)
        if paid_to_match:
            return paid_to_match.group(1).strip()

        return None

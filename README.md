# PayShield AI – Fake Payment Screenshot & Transaction Verification System

**PARAKRAM HACKATHON 2026**  
**Theme 2:** Cyber Security & Safety  
**Problem Statement:** CS-01 – Fake Payment Screenshot and Transaction Verification  
**Tagline:** *Verify Before You Trust.*

---

## 1. Project Overview & Problem Statement

In physical retail and small businesses across India, UPI payments are ubiquitous. However, fraudsters frequently exploit shopkeepers using **Fake Payment APK Generators** (spoofed Paytm/PhonePe/Google Pay apps) that synthesize genuine-looking transaction screens, complete with green checkmarks, timestamps, and chime sounds. In other cases, fraudsters take a legitimate micro-transaction screenshot (e.g. ₹50) and digitally alter the text to display ₹5,000 before taking high-value goods.

**Fundamental Cybersecurity Principle:**  
*Screenshot visual inspection alone cannot prove that a payment succeeded.* 

**PayShield AI** addresses this challenge through a multi-tiered verification pipeline:
1. **Computer Vision & Tampering Forensics (OpenCV):** Executes Error Level Analysis (ELA) to spot compression variance in spliced text regions, analyzes edge sharpness, and detects re-used duplicate screenshot hashes.
2. **Offline Optical Entity Recognition (RapidOCR):** Extracts 12-digit UPI Reference Numbers (UTR), currency amounts (₹), payment status strings, and timestamps without requiring external system binaries.
3. **Merchant Bank Ledger Cross-Verification:** Cryptographically queries the simulated merchant bank ledger to confirm whether funds have legitimately settled.
4. **Explainable Suspicion Scoring (0–100):** Provides a transparent heuristic score (Low / Medium / High) with actionable guidance (e.g. "Do not dispatch goods until SMS/Soundbox announces credit").
5. **Digital Forensic PDF Certificate:** Generates downloadable audit sheets for merchant recordkeeping.
6. **Dedicated Hackathon Demo Mode:** 3 pre-built scenarios processed through the genuine backend pipeline.

---

## 2. Technology Stack

- **Backend:** Python 3.13, FastAPI (Asynchronous REST API), Uvicorn
- **Computer Vision:** OpenCV (`opencv-python`), Pillow, NumPy
- **OCR Engine:** `rapidocr-onnxruntime` (High-accuracy ONNX offline neural OCR)
- **Database:** SQLite with SQLAlchemy ORM
- **Forensic PDF Engine:** ReportLab
- **Frontend:** React 19, Vite, Tailwind CSS v4, Framer Motion, Lucide React icons, Recharts
- **Platform:** Windows / Cross-platform

---

## 3. Architecture & Verification Outcomes

```
[Merchant / User]
       │ Upload Screenshot
       ▼
[React 19 Cyber SaaS UI] ──(REST API)──► [FastAPI Backend]
                                                │
                 ┌──────────────────────────────┼──────────────────────────────┐
                 ▼                              ▼                              ▼
        [OpenCV Forensics]              [RapidOCR Engine]           [SQLAlchemy Database]
     - Error Level Analysis (ELA)    - 12-Digit UTR Parser        - Merchant Settlement Ledger
     - Pixel Compression Delta       - Currency Amount (₹)        - Audit Log Persistence
     - SHA-256 & Perceptual Hash     - Payment Status & Date
                 │                              │                              │
                 └──────────────────────────────┼──────────────────────────────┘
                                                ▼
                             [Verification & Heuristic Risk Engine]
                                                │
         ┌─────────────────────┬────────────────┴────────────────────┬─────────────────────┐
         ▼                     ▼                                     ▼                     ▼
     VERIFIED               MISMATCH                             NOT FOUND            INCONCLUSIVE
(Ledger Match:         (UTR Exists, but                      (UTR Not Found        (UTR Obscured
 Risk 0–29 / LOW)       Amount/Status Differs:                in Merchant Ledger:   or Unreadable:
                        Risk 70–100 / HIGH)                   Risk 30–69 / MED)     Risk 30–50 / MED)
```

---

## 4. Quick Start Guide (Windows PowerShell)

### Prerequisites
- Python 3.10+ (Tested on Python 3.13)
- Node.js 18+ and npm (Tested on Node v25)

### Step 1: Clone or Navigate to Project
```powershell
cd "c:\Users\Mona\OneDrive\Desktop\Clg hackthon\payshield-ai"
```

### Step 2: Set Up & Run Backend
Open a PowerShell terminal:
```powershell
cd backend
python -m pip install -r requirements.txt
python main.py
```
*The backend starts at `http://127.0.0.1:8000`. On first launch, the database automatically seeds with realistic merchant transaction data and generates the demo images.*

You can check backend health by opening: `http://127.0.0.1:8000/api/health`

### Step 3: Set Up & Run Frontend
Open a second PowerShell terminal:
```powershell
cd "c:\Users\Mona\OneDrive\Desktop\Clg hackthon\payshield-ai\frontend"
npm install
npm run dev
```
*The frontend starts at `http://localhost:5173`. Open this URL in your web browser.*

---

## 5. Hackathon Live Demo Mode (Judge Presentation Guide)

The application includes a dedicated **Demo Mode** tab designed for a crisp 3-minute pitch:

| Scenario | Screenshot Details | Merchant Ledger Truth | Expected Outcome | Suspicion Score |
|---|---|---|---|---|
| **Demo 1: Genuine Payment** | ₹850 paid to Sharma General Store, UTR: `329847192834` | Record exists: Amount=850.00, Status=SUCCESS | **VERIFIED** | **5 / 100 (LOW)** |
| **Demo 2: Fake Payment Claim** | ₹1,200 via Paytm spoof app, UTR: `889102938475` | No record exists in merchant bank account | **NOT FOUND** | **55–65 / 100 (MEDIUM)** |
| **Demo 3: Amount Mismatch** | Tampered ₹5,000 display, UTR: `491028374619` | Record exists: Amount=500.00, Status=SUCCESS | **MISMATCH** | **85–94 / 100 (HIGH)** |

*All 3 demos execute through the real backend OCR and verification pipeline via `POST /api/demo/run/{id}`.*

---

## 6. REST API Endpoints

- `POST /api/analyze` - Upload screenshot file (JPG/PNG). Executes CV, OCR, and Ledger verification.
- `POST /api/verify` - Query merchant ledger for a specific UTR and expected amount.
- `GET /api/dashboard` - Metrics, risk distributions, and recent audit activity for Recharts.
- `GET /api/history` - Filtered and paginated audit history.
- `GET /api/history/{id}` - Detailed forensic inspection record.
- `GET /api/demo/cases` - Metadata for the 3 Hackathon demonstration scenarios.
- `POST /api/demo/run/{case_id}` - Runs full OCR & verification pipeline on demo test vector.
- `GET /api/report/{id}/pdf` - Downloads branded cybersecurity forensic audit PDF report.
- `GET /api/health` - Health check verifying database and OCR engine status.

---

## 7. Security & Ethics Disclaimer

- PayShield AI utilizes simulated merchant settlement records for demonstration and competition testing.
- No real banking credentials, passwords, or customer payment data are collected or stored.
- Analysis results are heuristic risk indicators; merchants are instructed to always rely on official banking SMS or merchant soundbox announcements before releasing goods.

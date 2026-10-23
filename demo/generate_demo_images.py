import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

DEMO_DIR = os.path.dirname(os.path.abspath(__file__))
os.makedirs(DEMO_DIR, exist_ok=True)


def get_default_font(size):
    try:
        # Standard Windows fonts
        return ImageFont.truetype("arial.ttf", size)
    except Exception:
        try:
            return ImageFont.truetype("segoeui.ttf", size)
        except Exception:
            return ImageFont.load_default()


def create_demo_1_genuine():
    """
    Demo 1: Genuine Successful Payment
    Amount: ₹850
    UTR: 329847192834
    Matches database record: 850.00, Status: SUCCESS
    """
    w, h = 720, 1400
    img = Image.new("RGB", (w, h), color="#0f172a")  # Dark slate navy
    draw = ImageDraw.Draw(img)

    title_font = get_default_font(38)
    amt_font = get_default_font(68)
    sub_font = get_default_font(24)
    label_font = get_default_font(20)
    val_font = get_default_font(22)

    # Top Status Bar
    draw.text((40, 25), "01:15", fill="#94a3b8", font=label_font)
    draw.text((620, 25), "5G  100%", fill="#94a3b8", font=label_font)

    # App header
    draw.text((270, 80), "PhonePe UPI", fill="#a855f7", font=get_default_font(28))

    # Success Circle
    center_x, center_y = 360, 230
    draw.ellipse((center_x - 55, center_y - 55, center_x + 55, center_y + 55), fill="#10b981")
    # Draw white checkmark
    draw.line((center_x - 22, center_y + 2, center_x - 6, center_y + 22), fill="#ffffff", width=6)
    draw.line((center_x - 6, center_y + 22, center_x + 26, center_y - 18), fill="#ffffff", width=6)

    # Paid message
    draw.text((150, 310), "Paid successfully to", fill="#cbd5e1", font=sub_font)
    draw.text((160, 350), "Sharma General Store", fill="#ffffff", font=title_font)

    # Amount
    draw.text((260, 420), "Rs 850", fill="#38bdf8", font=amt_font)
    draw.text((210, 510), "24 Oct 2026, 12:45 PM", fill="#94a3b8", font=sub_font)

    # Transaction details card
    card_top = 580
    draw.rounded_rectangle((40, card_top, 680, card_top + 480), radius=16, fill="#1e293b", outline="#334155", width=2)
    draw.text((70, card_top + 30), "Transaction Details", fill="#38bdf8", font=get_default_font(24))

    details = [
        ("UPI Ref No:", "329847192834"),
        ("To UPI ID:", "sharma.store@icici"),
        ("From:", "State Bank of India (•••4102)"),
        ("Payment Status:", "Completed"),
        ("Type:", "Merchant Payment"),
    ]

    y = card_top + 90
    for lbl, val in details:
        draw.text((70, y), lbl, fill="#94a3b8", font=label_font)
        draw.text((70, y + 28), val, fill="#f1f5f9", font=val_font)
        y += 72

    # Footer note
    draw.text((160, 1100), "Powered by NPCI UPI System", fill="#64748b", font=label_font)
    draw.text((190, 1130), "Fictional Demo Data for Hackathon", fill="#475569", font=label_font)

    path = os.path.join(DEMO_DIR, "demo1_genuine.png")
    img.save(path)
    print(f"Generated Demo 1: {path}")


def create_demo_2_fake_claim():
    """
    Demo 2: Fake Payment Claim (Unverified)
    Amount: ₹1,200
    UTR: 889102938475 (NOT in database)
    Outcome: NOT FOUND
    """
    w, h = 720, 1400
    img = Image.new("RGB", (w, h), color="#030712")  # Deep dark
    draw = ImageDraw.Draw(img)

    title_font = get_default_font(36)
    amt_font = get_default_font(66)
    sub_font = get_default_font(24)
    label_font = get_default_font(20)
    val_font = get_default_font(22)

    # Fake app header
    draw.rectangle((0, 0, w, 90), fill="#1e3a8a")
    draw.text((250, 30), "Paytm FastPay", fill="#60a5fa", font=get_default_font(28))

    # Fake success checkmark
    center_x, center_y = 360, 230
    draw.ellipse((center_x - 55, center_y - 55, center_x + 55, center_y + 55), fill="#059669")
    draw.line((center_x - 20, center_y + 2, center_x - 5, center_y + 20), fill="#ffffff", width=6)
    draw.line((center_x - 5, center_y + 20, center_x + 25, center_y - 18), fill="#ffffff", width=6)

    # Details
    draw.text((130, 310), "Payment of", fill="#9ca3af", font=sub_font)
    draw.text((270, 300), "Rs 1200", fill="#10b981", font=get_default_font(36))
    draw.text((430, 310), "successful", fill="#9ca3af", font=sub_font)

    draw.text((180, 360), "To: Sharma General Store", fill="#f9fafb", font=title_font)
    draw.text((230, 440), "Rs 1,200.00", fill="#38bdf8", font=amt_font)
    draw.text((220, 525), "24 Oct 2026, 01:05 PM", fill="#9ca3af", font=sub_font)

    # Card
    card_top = 590
    draw.rounded_rectangle((40, card_top, 680, card_top + 470), radius=16, fill="#111827", outline="#374151", width=2)
    draw.text((70, card_top + 28), "Payment Confirmation", fill="#60a5fa", font=get_default_font(24))

    details = [
        ("UPI Ref No:", "889102938475"),  # Fabricated UTR
        ("Merchant VPA:", "sharma.store@icici"),
        ("Wallet / Bank:", "Paytm Payments Bank"),
        ("Payment Status:", "Completed"),
        ("Reference Code:", "CLAIM-889102"),
    ]

    y = card_top + 85
    for lbl, val in details:
        draw.text((70, y), lbl, fill="#9ca3af", font=label_font)
        draw.text((70, y + 26), val, fill="#f3f4f6", font=val_font)
        y += 72

    draw.text((180, 1120), "[UNVERIFIED CLAIM SCREENSHOT]", fill="#ef4444", font=get_default_font(20))
    draw.text((170, 1150), "Fabricated UTR not present in ledger", fill="#6b7280", font=label_font)

    path = os.path.join(DEMO_DIR, "demo2_fake_claim.png")
    img.save(path)
    print(f"Generated Demo 2: {path}")


def create_demo_3_amount_mismatch():
    """
    Demo 3: Tampered Amount Mismatch
    Screenshot claims: ₹5,000
    Database ledger has: ₹500 for UTR 491028374619
    Outcome: MISMATCH
    """
    w, h = 720, 1400
    img = Image.new("RGB", (w, h), color="#090d16")
    draw = ImageDraw.Draw(img)

    title_font = get_default_font(36)
    amt_font = get_default_font(72)
    sub_font = get_default_font(24)
    label_font = get_default_font(20)
    val_font = get_default_font(22)

    # Header
    draw.text((250, 70), "Google Pay UPI", fill="#3b82f6", font=get_default_font(30))

    # Circle
    center_x, center_y = 360, 220
    draw.ellipse((center_x - 55, center_y - 55, center_x + 55, center_y + 55), fill="#059669")
    draw.line((center_x - 20, center_y + 2, center_x - 5, center_y + 20), fill="#ffffff", width=6)
    draw.line((center_x - 5, center_y + 20, center_x + 25, center_y - 18), fill="#ffffff", width=6)

    draw.text((150, 305), "Paid to Sharma General Store", fill="#f1f5f9", font=title_font)

    # Tampered amount box - simulate edited text overlay with subtle border/font contrast
    draw.rectangle((180, 390, 540, 485), fill="#0d1527")
    draw.text((210, 400), "Rs 5,000", fill="#38bdf8", font=amt_font)

    draw.text((220, 510), "24 Oct 2026, 11:20 AM", fill="#94a3b8", font=sub_font)

    # Card
    card_top = 580
    draw.rounded_rectangle((40, card_top, 680, card_top + 480), radius=16, fill="#151e32", outline="#253350", width=2)
    draw.text((70, card_top + 30), "UPI Transaction Information", fill="#38bdf8", font=get_default_font(24))

    details = [
        ("UPI Ref No:", "491028374619"),  # Matches DB UTR with actual credit of 500!
        ("Recipient UPI:", "sharma.store@icici"),
        ("Debited From:", "HDFC Bank (•••9018)"),
        ("Payment Status:", "Completed"),
        ("Google Transaction ID:", "CICAgKDy_4nOcg"),
    ]

    y = card_top + 90
    for lbl, val in details:
        draw.text((70, y), lbl, fill="#94a3b8", font=label_font)
        draw.text((70, y + 28), val, fill="#f1f5f9", font=val_font)
        y += 72

    draw.text((150, 1120), "[TAMPERED / MISMATCH TEST CASE]", fill="#f59e0b", font=get_default_font(20))
    draw.text((140, 1150), "Screenshot says Rs 5,000 vs DB credit Rs 500", fill="#64748b", font=label_font)

    path = os.path.join(DEMO_DIR, "demo3_amount_mismatch.png")
    img.save(path)
    print(f"Generated Demo 3: {path}")


if __name__ == "__main__":
    create_demo_1_genuine()
    create_demo_2_fake_claim()
    create_demo_3_amount_mismatch()

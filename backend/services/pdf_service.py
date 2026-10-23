import io
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from models import AnalysisRecord


class PDFReportService:
    @staticmethod
    def generate_report(record: AnalysisRecord, matched_tx=None) -> io.BytesIO:
        """Generate a professional cybersecurity forensic audit report PDF."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=4
        )
        
        subtitle_style = ParagraphStyle(
            'SubtitleStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=15
        )
        
        section_style = ParagraphStyle(
            'SectionStyle',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=13,
            textColor=colors.HexColor('#1e293b'),
            spaceBefore=12,
            spaceAfter=6
        )

        normal_style = ParagraphStyle(
            'NormalStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            textColor=colors.HexColor('#334155'),
            leading=13
        )
        
        bold_style = ParagraphStyle(
            'BoldStyle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            textColor=colors.HexColor('#0f172a'),
            leading=13
        )

        elements = []

        # Header Banner
        elements.append(Paragraph("PAYSHIELD AI // FORENSIC AUDIT REPORT", title_style))
        elements.append(Paragraph("Parakram Hackathon 2026 • Theme: Cyber Security & Safety • Fake Payment Verification", subtitle_style))
        elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#0284c7'), spaceAfter=15))

        # Status Badge & Suspicion Score Box
        status_colors = {
            "VERIFIED": colors.HexColor('#10b981'),      # Green
            "MISMATCH": colors.HexColor('#ef4444'),      # Red
            "NOT FOUND": colors.HexColor('#f59e0b'),     # Orange
            "INCONCLUSIVE": colors.HexColor('#64748b'),  # Slate
        }
        status_color = status_colors.get(record.verification_status, colors.HexColor('#64748b'))
        
        status_data = [
            [
                Paragraph("<b>VERIFICATION STATUS</b>", bold_style),
                Paragraph("<b>SUSPICION SCORE</b>", bold_style),
                Paragraph("<b>RISK CATEGORY</b>", bold_style),
            ],
            [
                Paragraph(f"<font color='{status_color.hexval()}'><b>{record.verification_status}</b></font>", ParagraphStyle('StatusP', fontName='Helvetica-Bold', fontSize=14, leading=16)),
                Paragraph(f"<b>{record.suspicion_score} / 100</b>", ParagraphStyle('ScoreP', fontName='Helvetica-Bold', fontSize=14, leading=16)),
                Paragraph(f"<b>{record.risk_level}</b>", ParagraphStyle('RiskP', fontName='Helvetica-Bold', fontSize=14, leading=16)),
            ]
        ]
        status_table = Table(status_data, colWidths=[180, 180, 180])
        status_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(status_table)
        elements.append(Spacer(1, 15))

        # Meta Information
        meta_data = [
            [Paragraph("<b>Audit ID:</b>", bold_style), Paragraph(record.analysis_id, normal_style)],
            [Paragraph("<b>Timestamp:</b>", bold_style), Paragraph(record.created_at.strftime('%Y-%m-%d %H:%M:%S UTC') if record.created_at else "N/A", normal_style)],
            [Paragraph("<b>Image SHA-256:</b>", bold_style), Paragraph(record.image_hash or "N/A", normal_style)],
            [Paragraph("<b>Source File:</b>", bold_style), Paragraph(record.image_filename, normal_style)],
        ]
        meta_table = Table(meta_data, colWidths=[130, 410])
        meta_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 12))

        # Extracted OCR vs Merchant Records Comparison
        elements.append(Paragraph("TRANSACTION DATA COMPARISON", section_style))
        amt_str = f"₹{record.extracted_amount:,.2f}" if record.extracted_amount is not None else "Not Detected"
        merchant_amt = f"₹{matched_tx.amount:,.2f}" if matched_tx else "No matching record"
        merchant_status = matched_tx.status if matched_tx else "Not found in ledger"
        merchant_ref = matched_tx.order_ref if matched_tx else "N/A"

        comparison_data = [
            [Paragraph("<b>Attribute</b>", bold_style), Paragraph("<b>Extracted from Screenshot (OCR)</b>", bold_style), Paragraph("<b>Merchant Ledger Record (DB)</b>", bold_style)],
            [Paragraph("UTR / UPI Ref", normal_style), Paragraph(record.extracted_utr or "Unrecognized", bold_style), Paragraph(matched_tx.utr_number if matched_tx else "N/A", normal_style)],
            [Paragraph("Transaction Amount", normal_style), Paragraph(amt_str, bold_style), Paragraph(merchant_amt, bold_style)],
            [Paragraph("Payment Status", normal_style), Paragraph(record.extracted_status or "UNKNOWN", normal_style), Paragraph(merchant_status, normal_style)],
            [Paragraph("Payer / Order", normal_style), Paragraph(record.extracted_payee or "N/A", normal_style), Paragraph(merchant_ref, normal_style)],
        ]
        comp_table = Table(comparison_data, colWidths=[130, 205, 205])
        comp_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e2e8f0')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#94a3b8')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(comp_table)
        elements.append(Spacer(1, 12))

        # Detected Risk Factors & Explanations
        elements.append(Paragraph("HEURISTIC RISK FACTORS DETECTED", section_style))
        factors = record.risk_factors
        if factors:
            factor_rows = []
            for idx, factor in enumerate(factors, 1):
                factor_rows.append([
                    Paragraph(f"<b>[!]</b>", ParagraphStyle('Flag', fontName='Helvetica-Bold', textColor=colors.HexColor('#b91c1c'))),
                    Paragraph(factor, normal_style)
                ])
            factor_table = Table(factor_rows, colWidths=[25, 515])
            factor_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            elements.append(factor_table)
        else:
            elements.append(Paragraph("No significant heuristic risk factors identified. Screenshot matches verified settlement record.", normal_style))

        elements.append(Spacer(1, 12))

        # Computer Vision Forensics
        elements.append(Paragraph("COMPUTER VISION & COMPRESSION FORENSICS", section_style))
        cv = record.cv_metrics
        ela = cv.get("ela", {})
        quality = cv.get("quality", {})
        
        cv_data = [
            [
                Paragraph(f"<b>Error Level Analysis (ELA):</b> Mean Delta: {ela.get('ela_mean_delta', 0)}, Max Delta: {ela.get('ela_max_delta', 0)}", normal_style),
                Paragraph(f"<b>Splicing Detected:</b> {'YES - High Variance' if ela.get('ela_anomaly_detected') else 'No Anomalous Splicing'}", bold_style)
            ],
            [
                Paragraph(f"<b>Resolution:</b> {quality.get('resolution', 'N/A')} (Ratio: {quality.get('aspect_ratio', 'N/A')})", normal_style),
                Paragraph(f"<b>Duplicate Hash Match:</b> {'YES (Re-submitted)' if cv.get('is_duplicate') else 'Original Image'}", normal_style)
            ]
        ]
        cv_table = Table(cv_data, colWidths=[270, 270])
        cv_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(cv_table)
        elements.append(Spacer(1, 12))

        # Operational Action Guidance
        elements.append(Paragraph("RECOMMENDED OPERATIONAL ACTION", section_style))
        action_box = [
            [Paragraph(f"<b>{record.suggested_action}</b>", ParagraphStyle('Action', fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor('#1e293b'), leading=14))]
        ]
        action_table = Table(action_box, colWidths=[540])
        action_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#e0f2fe')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#38bdf8')),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(action_table)
        elements.append(Spacer(1, 15))

        # Disclaimer
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#94a3b8'), spaceAfter=8))
        disclaimer_text = (
            "<b>NOTICE:</b> PayShield AI provides heuristic suspicion detection and merchant database cross-verification. "
            "A screenshot alone is not legal proof of fund transfer. Simulated ledger records represent merchant gateway settlement feeds. "
            "Always rely on actual bank statement credits or authorized soundbox voice confirmations for physical commerce handovers."
        )
        elements.append(Paragraph(disclaimer_text, ParagraphStyle('Disclaimer', fontName='Helvetica-Oblique', fontSize=7.5, textColor=colors.HexColor('#64748b'), leading=10)))

        doc.build(elements)
        buffer.seek(0)
        return buffer

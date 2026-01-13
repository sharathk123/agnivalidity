import os
from datetime import datetime, timedelta
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import Table, TableStyle

class DocumentService:
    def __init__(self, output_dir="quotes"):
        self.output_dir = output_dir
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

    def generate_quotation_pdf(self, 
                               quote_number: str, 
                               company_profile: dict, 
                               product: dict, 
                               calc_metrics: dict, 
                               params: dict):
        """
        Generates an Apple-style minimal Pro Forma Quotation PDF.
        """
        filename = f"quote_{quote_number}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        
        c = canvas.Canvas(filepath, pagesize=A4)
        width, height = A4

        # --- Watermark (Compliance) ---
        c.saveState()
        c.setFont("Helvetica-Bold", 40)
        c.setFillGray(0.9)
        c.translate(width/2, height/2)
        c.rotate(45)
        c.drawCentredString(0, 0, "ICEGATE v1.1 READY")
        c.restoreState()

        # --- Header ---
        c.setFont("Helvetica-Bold", 24)
        c.setStrokeColor(colors.black)
        c.drawString(2*cm, height - 3*cm, "PRO FORMA QUOTATION")
        
        c.setFont("Helvetica", 10)
        c.setFillColor(colors.grey)
        c.drawString(2*cm, height - 3.5*cm, f"Quote Ref: {quote_number} | Date: {datetime.now().strftime('%Y-%m-%d')}")
        
        # --- Company & Bank Block (Right Aligned) ---
        c.setFillColor(colors.black)
        c.setFont("Helvetica-Bold", 12)
        c.drawRightString(width - 2*cm, height - 3*cm, company_profile['company_name'])
        c.setFont("Helvetica", 9)
        c.drawRightString(width - 2*cm, height - 3.5*cm, f"GSTIN: {company_profile['gstin']}")
        c.drawRightString(width - 2*cm, height - 3.8*cm, f"IEC: {company_profile['iec']}")
        c.drawRightString(width - 2*cm, height - 4.1*cm, f"AD Code: {company_profile['ad_code']}")
        c.drawRightString(width - 2*cm, height - 4.4*cm, f"SWIFT: {company_profile['swift_code']}")

        # --- Line Divider ---
        c.setStrokeColor(colors.lightgrey)
        c.line(2*cm, height - 5*cm, width - 2*cm, height - 5*cm)

        # --- Product & Compliance Section ---
        c.setFont("Helvetica-Bold", 11)
        c.drawString(2*cm, height - 6*cm, "PRODUCT COMPLIANCE (JAN 2026 Fleet)")
        
        c.setFont("Helvetica", 10)
        c.drawString(2*cm, height - 6.5*cm, f"HS Code (10-Digit): {product['hs_code']}")
        c.drawString(2*cm, height - 7*cm, f"Description: {product['description']}")

        # --- Table Data ---
        data = [
            ["Description", "Incoterm", "Unit Price", "Total (USD)", "Total (INR)"],
            [
                product['description'], 
                params['incoterm'], 
                f"{calc_metrics['net_cost']}", 
                f"${calc_metrics['net_cost']}", 
                f"₹{round(calc_metrics['net_cost'] * params['exchange_rate'], 2)}"
            ]
        ]
        
        table = Table(data, colWidths=[6*cm, 2.5*cm, 3*cm, 3*cm, 3*cm])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.whitesmoke),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
        ]))
        
        table.wrapOn(c, width, height)
        table.drawOn(c, 2*cm, height - 10*cm)

        # --- Incentive Footnote ---
        benefit_total = calc_metrics['total_incentives']
        c.setFont("Helvetica-Oblique", 8)
        c.setFillColor(colors.darkgreen)
        c.drawString(2*cm, height - 11*cm, f"* Agni Incentive Offset: Price includes ₹{benefit_total} in export benefits (RoDTEP/DBK) as per current DGFT 2026 policy.")

        # --- Terms & Validity ---
        c.setFillColor(colors.black)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(2*cm, height - 13*cm, "TERMS & CONDITIONS")
        
        c.setFont("Helvetica", 9)
        c.drawString(2*cm, height - 13.5*cm, f"1. Validity: This quote is valid until {params['validity_date']}.")
        c.drawString(2*cm, height - 14*cm, f"2. Payment Terms: {params['payment_terms']}.")
        c.drawString(2*cm, height - 14.5*cm, f"3. Bank Details: {company_profile['bank_name']} | A/c No: {company_profile['account_number']}")

        # --- Signature ---
        c.setFont("Helvetica-Bold", 10)
        c.drawString(2*cm, height - 17*cm, "For Agni Advisory Exporters Ltd,")
        c.drawString(2*cm, height - 18.5*cm, "[Authorised Signatory]")

        c.showPage()
        c.save()
        
        return filepath

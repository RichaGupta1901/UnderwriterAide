# backend/services/openai_service.py

from openai import OpenAI
import json
import markdown
from fpdf import FPDF
from datetime import datetime
from flask import current_app

client = None


def init_openai():
    """Initializes the OpenAI client."""
    global client
    api_key = current_app.config['OPENAI_API_KEY']
    if api_key:
        client = OpenAI(api_key=api_key)
        print("✓ OpenAI client initialized successfully.")
    else:
        print("⚠️  OPENAI_API_KEY not found. AI features will be disabled.")


def generate_enhanced_policy_with_user_data(product_json, fund_json, user_data_json):
    """Generates policy content using OpenAI."""
    if not client:
        return "OpenAI client is not initialized."

    ENHANCED_SUMMARY_PROMPT = "You are an expert insurance policy drafter. Use the provided product, fund, and user data JSON to generate a comprehensive draft policy schedule..."  # Abridged for brevity

    full_context = f"Product: {json.dumps(product_json)}\nFund: {json.dumps(fund_json)}\nApplicant: {json.dumps(user_data_json)}"

    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=[
            {"role": "system", "content": ENHANCED_SUMMARY_PROMPT},
            {"role": "user", "content": full_context}
        ])
        return resp.choices[0].message.content
    except Exception as e:
        print(f"❌ OpenAI API error: {e}")
        return f"Error generating policy draft: {e}"


def enhanced_apra_compliance_check(policy_text, checklist_data):
    """Performs compliance check using OpenAI."""
    if not client:
        return {"error": "OpenAI client is not initialized."}

    ENHANCED_COMPLIANCE_PROMPT = "You are a senior APRA compliance analyst... Analyze the provided policy text against the APRA compliance requirements and return valid JSON..."  # Abridged

    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": ENHANCED_COMPLIANCE_PROMPT},
                {"role": "user",
                 "content": f"Policy Text:\n```\n{policy_text}\n```\n\nAPRA Checklist:\n```json\n{json.dumps(checklist_data, indent=2)}\n```"}
            ]
        )
        return json.loads(resp.choices[0].message.content)
    except Exception as e:
        print(f"❌ APRA compliance check error: {e}")
        return {"error": f"Compliance analysis failed: {e}"}


def save_ai_draft_pdf_enhanced(draft_text):
    """Generates a PDF from markdown text."""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    # Simple conversion for demonstration. For complex HTML, a library like WeasyPrint is better.
    # markdown.markdown() converts markdown to HTML, but FPDF doesn't render HTML directly.
    # We will just write the plain text line by line.
    for line in draft_text.split('\n'):
        pdf.multi_cell(0, 10, txt=line, align='L')

    # Return PDF content as bytes
    return pdf.output(dest='S').encode('latin-1')
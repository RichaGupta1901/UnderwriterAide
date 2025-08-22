# backend/services/pdf_processor.py

import re
import fitz  # PyMuPDF


def extract_text_from_pdf(file_stream):
    """Extract text from PDF with enhanced error handling."""
    try:
        print("📄 Starting PDF text extraction")
        doc = fitz.open(stream=file_stream, filetype="pdf")
        full_text = ""

        for page in doc:
            page_text = page.get_text("text")
            page_text = re.sub(r'\s+', ' ', page_text)  # Normalize whitespace
            full_text += f" {page_text}"

        doc.close()
        full_text = full_text.strip()
        print(f"✓ Extracted {len(full_text)} characters from PDF")

        if len(full_text) < 10:
            raise ValueError("PDF appears to be empty or unreadable")

        return full_text

    except Exception as e:
        print(f"❌ PDF extraction error: {e}")
        raise


def parse_city_from_text(text):
    """Enhanced city parser with better debugging and more cities."""
    if not text:
        print("❌ No text provided for city parsing")
        return None

    print(f"🔍 Parsing city from {len(text)} characters of text")

    # List of cities (can be expanded or moved to a separate file)
    known_cities = [
        "sydney", "melbourne", "brisbane", "perth", "adelaide", "canberra", "darwin", "hobart",
        "london", "new york", "tokyo", "singapore", "hong kong", "auckland"
    ]

    text_lower = text.lower()
    for city in known_cities:
        if re.search(r'\b' + re.escape(city) + r'\b', text_lower):
            print(f"✓ City found in text: {city.title()}")
            return city.title()

    print("❌ No city found in PDF text")
    return None
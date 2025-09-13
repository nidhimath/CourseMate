#!/usr/bin/env python3
"""
Extract text from the transcript PDF to understand the format
"""

import sys
import os

try:
    import PyPDF2
    HAS_PYPDF2 = True
except ImportError:
    HAS_PYPDF2 = False

try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False

def extract_with_pypdf2(pdf_path):
    """Extract text using PyPDF2"""
    print("📄 Extracting text with PyPDF2...")
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        for page_num, page in enumerate(pdf_reader.pages):
            text += f"\n--- PAGE {page_num + 1} ---\n"
            text += page.extract_text()
        return text

def extract_with_pdfplumber(pdf_path):
    """Extract text using pdfplumber"""
    print("📄 Extracting text with pdfplumber...")
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            text += f"\n--- PAGE {page_num + 1} ---\n"
            page_text = page.extract_text()
            if page_text:
                text += page_text
    return text

def main():
    pdf_path = "unofficial-transcript.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"❌ PDF file not found: {pdf_path}")
        return
    
    text = ""
    
    # Try pdfplumber first (better for tables)
    if HAS_PDFPLUMBER:
        try:
            text = extract_with_pdfplumber(pdf_path)
        except Exception as e:
            print(f"❌ pdfplumber failed: {e}")
            text = ""
    
    # Fallback to PyPDF2
    if not text and HAS_PYPDF2:
        try:
            text = extract_with_pypdf2(pdf_path)
        except Exception as e:
            print(f"❌ PyPDF2 failed: {e}")
    
    if not text:
        print("❌ Could not extract text from PDF")
        print("💡 Try installing: pip install pdfplumber PyPDF2")
        return
    
    # Save extracted text
    with open("extracted_transcript.txt", "w", encoding="utf-8") as f:
        f.write(text)
    
    print(f"✅ Extracted text saved to extracted_transcript.txt")
    print(f"📊 Text length: {len(text)} characters")
    
    # Show first 1000 characters
    print("\n📋 First 1000 characters:")
    print("=" * 50)
    print(text[:1000])
    print("=" * 50)
    
    # Look for course patterns
    import re
    course_patterns = [
        r'CS\s*\d+[A-Z]?',
        r'EECS\s*\d+[A-Z]?', 
        r'COMPSCI\s*\d+[A-Z]?',
        r'MATH\s*\d+[A-Z]?',
        r'PHYSICS\s*\d+[A-Z]?'
    ]
    
    print("\n🔍 Found course codes:")
    for pattern in course_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            print(f"  {pattern}: {matches[:10]}")  # Show first 10 matches

if __name__ == "__main__":
    main()

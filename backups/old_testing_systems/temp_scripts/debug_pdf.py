#!/usr/bin/env python3
"""
Debug script to read PDF content
"""

import PyPDF2
from pathlib import Path

def debug_pdf():
    pdf_path = Path("documentation/backend_architecture_improvement_suggestions.pdf")
    
    print(f"📄 Reading PDF: {pdf_path}")
    print(f"📏 File size: {pdf_path.stat().st_size} bytes")
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            print(f"📄 Number of pages: {len(pdf_reader.pages)}")
            
            for i, page in enumerate(pdf_reader.pages):
                print(f"\n--- Page {i+1} ---")
                text = page.extract_text()
                print(f"Text length: {len(text)} characters")
                print("Content:")
                print(text)
                print("-" * 50)
                
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_pdf()

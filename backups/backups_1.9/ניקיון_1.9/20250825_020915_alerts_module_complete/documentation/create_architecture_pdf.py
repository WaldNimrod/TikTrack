#!/usr/bin/env python3
"""
Script to create PDF documentation for the new backend architecture
"""

import os
import sys
from pathlib import Path

def create_pdf_from_markdown():
    """Create PDF from markdown documentation"""
    try:
        # Check if required packages are available
        import markdown
        from weasyprint import HTML, CSS
        from weasyprint.text.fonts import FontConfiguration
    except ImportError as e:
        print(f"❌ Missing required packages: {e}")
        print("Installing required packages...")
        os.system("pip install markdown weasyprint")
        return False
    
    # Read the markdown file
    markdown_file = Path("documentation/backend_architecture_new.md")
    if not markdown_file.exists():
        print(f"❌ Markdown file not found: {markdown_file}")
        return False
    
    with open(markdown_file, 'r', encoding='utf-8') as f:
        markdown_content = f.read()
    
    # Convert markdown to HTML
    html_content = markdown.markdown(
        markdown_content,
        extensions=['tables', 'fenced_code', 'codehilite']
    )
    
    # Create full HTML document
    full_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>TikTrack Backend Architecture - New Design</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                margin: 40px;
                color: #333;
            }}
            h1, h2, h3, h4 {{
                color: #2c3e50;
                border-bottom: 2px solid #3498db;
                padding-bottom: 10px;
            }}
            h1 {{
                font-size: 2.5em;
                text-align: center;
                color: #2980b9;
            }}
            h2 {{
                font-size: 1.8em;
                margin-top: 30px;
            }}
            h3 {{
                font-size: 1.4em;
                margin-top: 25px;
            }}
            code {{
                background-color: #f8f9fa;
                padding: 2px 4px;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
            }}
            pre {{
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                overflow-x: auto;
                border-left: 4px solid #3498db;
            }}
            table {{
                border-collapse: collapse;
                width: 100%;
                margin: 20px 0;
            }}
            th, td {{
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
            }}
            th {{
                background-color: #3498db;
                color: white;
            }}
            tr:nth-child(even) {{
                background-color: #f2f2f2;
            }}
            .highlight {{
                background-color: #fff3cd;
                padding: 10px;
                border-radius: 5px;
                border-left: 4px solid #ffc107;
            }}
            .warning {{
                background-color: #f8d7da;
                padding: 10px;
                border-radius: 5px;
                border-left: 4px solid #dc3545;
            }}
            .success {{
                background-color: #d4edda;
                padding: 10px;
                border-radius: 5px;
                border-left: 4px solid #28a745;
            }}
        </style>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """
    
    # Create PDF
    pdf_file = Path("documentation/backend_architecture_new.pdf")
    
    try:
        # Configure fonts
        font_config = FontConfiguration()
        
        # Create PDF
        HTML(string=full_html).write_pdf(
            pdf_file,
            font_config=font_config
        )
        
        print(f"✅ PDF created successfully: {pdf_file}")
        return True
        
    except Exception as e:
        print(f"❌ Error creating PDF: {e}")
        return False

def main():
    """Main function"""
    print("📄 Creating PDF documentation for new backend architecture...")
    
    # Create documentation directory if it doesn't exist
    Path("documentation").mkdir(exist_ok=True)
    
    # Create PDF
    success = create_pdf_from_markdown()
    
    if success:
        print("\n🎉 Documentation PDF created successfully!")
        print("📁 Location: documentation/backend_architecture_new.pdf")
        print("\n📋 Next steps:")
        print("1. Review the PDF documentation")
        print("2. Start implementing the new architecture")
        print("3. Begin with Phase 1: Foundation")
    else:
        print("\n❌ Failed to create PDF documentation")
        print("Please check the error messages above")

if __name__ == "__main__":
    main()

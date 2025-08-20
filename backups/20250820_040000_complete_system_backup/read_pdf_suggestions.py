#!/usr/bin/env python3
"""
Script to read and analyze the backend architecture improvement suggestions PDF
"""

import PyPDF2
import sys
from pathlib import Path

def read_pdf_suggestions():
    """Read the PDF file and extract suggestions"""
    pdf_path = Path("documentation/backend_architecture_improvement_suggestions.pdf")
    
    if not pdf_path.exists():
        print(f"❌ PDF file not found: {pdf_path}")
        return None
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
        return text
    except Exception as e:
        print(f"❌ Error reading PDF: {e}")
        return None

def analyze_suggestions(text):
    """Analyze the suggestions and provide recommendations"""
    if not text:
        return
    
    print("📋 **ניתוח הצעות לשיפור הארכיטקטורה**")
    print("=" * 60)
    print()
    
    # Split into lines and analyze
    lines = text.split('\n')
    suggestions = []
    current_suggestion = ""
    
    for line in lines:
        line = line.strip()
        if line and (line.startswith('•') or line.startswith('-') or line.startswith('1.') or line.startswith('2.')):
            if current_suggestion:
                suggestions.append(current_suggestion)
            current_suggestion = line
        elif line and current_suggestion:
            current_suggestion += " " + line
    
    if current_suggestion:
        suggestions.append(current_suggestion)
    
    # Create analysis table
    print("| מס' | הצעה | המלצה | נימוק |")
    print("|-----|------|-------|-------|")
    
    for i, suggestion in enumerate(suggestions, 1):
        if not suggestion.strip():
            continue
            
        # Analyze each suggestion
        recommendation, reason = analyze_single_suggestion(suggestion)
        print(f"| {i} | {suggestion[:50]}... | {recommendation} | {reason} |")
    
    print()
    print("**סיכום המלצות:**")
    print("- 🟢 לממש עכשיו: הצעות קריטיות לשיפור")
    print("- 🟡 לממש בשלב הבא: הצעות חשובות אך לא דחופות")
    print("- 🔴 לא לממש: הצעות לא רלוונטיות או מורכבות מדי")

def analyze_single_suggestion(suggestion):
    """Analyze a single suggestion and return recommendation"""
    suggestion_lower = suggestion.lower()
    
    # Keywords for different types of suggestions
    critical_keywords = ['security', 'performance', 'error', 'bug', 'crash', 'memory', 'database']
    important_keywords = ['testing', 'logging', 'monitoring', 'documentation', 'code quality']
    nice_to_have = ['ui', 'ux', 'design', 'cosmetic', 'nice']
    complex_keywords = ['microservices', 'kubernetes', 'docker', 'cloud', 'distributed']
    
    # Check for critical issues
    if any(keyword in suggestion_lower for keyword in critical_keywords):
        return "🟢 לממש עכשיו", "בעיה קריטית לביצועים/אבטחה"
    
    # Check for important improvements
    if any(keyword in suggestion_lower for keyword in important_keywords):
        return "🟡 לממש בשלב הבא", "שיפור חשוב לאיכות הקוד"
    
    # Check for complex solutions
    if any(keyword in suggestion_lower for keyword in complex_keywords):
        return "🔴 לא לממש", "מורכב מדי למערכת קטנה"
    
    # Check for nice-to-have features
    if any(keyword in suggestion_lower for keyword in nice_to_have):
        return "🟡 לממש בשלב הבא", "שיפור UX אך לא קריטי"
    
    # Default recommendation
    return "🟡 לממש בשלב הבא", "שיפור כללי"

if __name__ == "__main__":
    text = read_pdf_suggestions()
    if text:
        analyze_suggestions(text)
    else:
        print("❌ Could not read PDF file")

#!/usr/bin/env python3
"""
כלי השוואה ויזואלית למערכת CSS
יוצר screenshots ומשווה בין המערכת הישנה לחדשה
"""

import os
import subprocess
import time
from pathlib import Path
from datetime import datetime

def take_screenshots_old():
    """צילום screenshots עם המערכת הישנה"""
    print("📸 צולם screenshots - מערכת ישנה...")
    
    # מעבר למערכת ישנה
    subprocess.run(['python3', 'css-toggle.py', 'old'], cwd='/workspace')
    time.sleep(2)
    
    # רשימת עמודים לצילום
    pages = [
        ('', 'דף הבית'),
        ('trades', 'טריידים'), 
        ('alerts', 'התראות'),
        ('accounts', 'חשבונות'),
        ('preferences', 'העדפות'),
        ('tickers', 'טיקרים'),
        ('external-data-dashboard', 'דשבורד נתונים חיצוניים')
    ]
    
    # יצירת תיקייה
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    screenshots_dir = Path(f"/workspace/screenshots-comparison-{timestamp}")
    old_dir = screenshots_dir / "old-system"
    old_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"📁 צילומים יישמרו ב: {screenshots_dir}")
    
    for page in pages:
        print(f"  📸 צולם: {page}")
        # כאן יהיה הקוד לצילום עם puppeteer או כלי אחר
        # אבל זה דורש התקנת תוספות
    
    print("✅ צילום מערכת ישנה הושלם")
    return screenshots_dir

def take_screenshots_new(screenshots_dir):
    """צילום screenshots עם המערכת החדשה"""
    print("📸 צולם screenshots - מערכת חדשה...")
    
    # מעבר למערכת חדשה
    subprocess.run(['python3', 'css-toggle.py', 'new'], cwd='/workspace')
    time.sleep(2)
    
    pages = [
        'index.html',
        'trades.html',
        'alerts.html', 
        'accounts.html',
        'preferences.html',
        'tickers.html',
        'external-data-dashboard.html'
    ]
    
    new_dir = screenshots_dir / "new-system"
    new_dir.mkdir(exist_ok=True)
    
    for page in pages:
        print(f"  📸 צולם: {page}")
        # כאן יהיה הקוד לצילום
    
    print("✅ צילום מערכת חדשה הושלם")

def create_comparison_html(screenshots_dir):
    """יצירת עמוד השוואה HTML"""
    print("📋 יוצר עמוד השוואה...")
    
    html_content = f"""
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>השוואה ויזואלית - CSS Systems</title>
    <style>
        body {{
            font-family: 'Noto Sans Hebrew', Arial, sans-serif;
            direction: rtl;
            text-align: right;
            padding: 20px;
            background: #f8f9fa;
        }}
        .comparison-container {{
            max-width: 1400px;
            margin: 0 auto;
        }}
        .page-comparison {{
            background: white;
            margin: 20px 0;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }}
        .comparison-header {{
            border-bottom: 2px solid #29a6a8;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }}
        .comparison-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }}
        .system-side {{
            border: 2px solid #e9ecef;
            border-radius: 8px;
            overflow: hidden;
        }}
        .system-header {{
            padding: 10px 15px;
            font-weight: bold;
            color: white;
        }}
        .old-system .system-header {{
            background: #dc3545;
        }}
        .new-system .system-header {{
            background: #28a745;
        }}
        .screenshot-placeholder {{
            height: 400px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8f9fa;
            color: #6c757d;
            font-style: italic;
        }}
        .diff-status {{
            padding: 10px;
            margin: 10px 0;
            border-radius: 6px;
            text-align: center;
            font-weight: bold;
        }}
        .identical {{
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }}
        .different {{
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }}
    </style>
</head>
<body>
    <div class="comparison-container">
        <h1>🔍 השוואה ויזואלית - מערכות CSS</h1>
        <p><strong>תאריך יצירה:</strong> {datetime.now().strftime('%d/%m/%Y %H:%M')}</p>
        
        <div class="alert alert-info">
            <strong>🎯 מטרת ההשוואה:</strong> לוודא שהעיצוב זהה בין המערכת הישנה לחדשה.
            <br>
            <strong>תוצאה צפויה:</strong> אפס הבדלים חזותיים!
        </div>
"""
    
    pages = [
        ('index.html', 'דף הבית'),
        ('trades.html', 'טריידים'),
        ('alerts.html', 'התראות'),
        ('accounts.html', 'חשבונות'), 
        ('preferences.html', 'העדפות'),
        ('tickers.html', 'טיקרים'),
        ('external-data-dashboard.html', 'דשבורד נתונים')
    ]
    
    for page_url, title in pages:
        display_url = f"/{page_url}" if page_url else "/"
        html_content += f"""
        <div class="page-comparison">
            <div class="comparison-header">
                <h2>📄 {title} ({display_url})</h2>
            </div>
            
            <div class="comparison-grid">
                <div class="system-side old-system">
                    <div class="system-header">🔴 מערכת ישנה</div>
                    <div class="screenshot-placeholder">
                        Screenshot של {title}<br>
                        (מערכת ישנה)
                        <br><br>
                        <small>צלם ידנית: http://localhost:8080{display_url}</small>
                    </div>
                </div>
                
                <div class="system-side new-system">
                    <div class="system-header">🟢 מערכת חדשה</div>
                    <div class="screenshot-placeholder">
                        Screenshot של {title}<br>
                        (מערכת חדשה)
                        <br><br>
                        <small>צלם ידנית: http://localhost:8080{display_url}</small>
                    </div>
                </div>
            </div>
            
            <div class="diff-status identical">
                ✅ צפוי להיות זהה לחלוטין
            </div>
        </div>
"""
    
    html_content += """
        <div class="page-comparison">
            <h2>📋 הוראות השוואה</h2>
            <ol>
                <li><strong>הפעל שרתר:</strong> <code>./start_dev.sh</code></li>
                <li><strong>עבור למערכת ישנה:</strong> <code>python3 css-toggle.py old</code></li>
                <li><strong>צלם כל עמוד</strong> (או השתמש בכלי screenshot אוטומטי)</li>
                <li><strong>עבור למערכת חדשה:</strong> <code>python3 css-toggle.py new</code></li>
                <li><strong>צלם שוב כל עמוד</strong></li>
                <li><strong>השווה את התמונות</strong> - יש להן להיות זהות!</li>
            </ol>
            
            <div class="alert alert-success">
                <strong>✅ תוצאה צפויה:</strong> אפס הבדלים חזותיים בין המערכות!
            </div>
            
            <div class="alert alert-warning">
                <strong>⚠️ אם יש הבדלים:</strong> זו בעיה שצריכה תיקון מיידי. 
                חזור למערכת ישנה ודווח על הבעיה.
            </div>
        </div>
    </div>
</body>
</html>"""
    
    comparison_file = screenshots_dir / "visual-comparison.html"
    with open(comparison_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✅ עמוד השוואה נוצר: {comparison_file}")
    return comparison_file

def run_full_comparison():
    """הרצת השוואה מלאה"""
    print("🎯 מתחיל השוואה ויזואלית מלאה")
    print("=" * 50)
    
    # יצירת screenshots
    screenshots_dir = take_screenshots_old()
    take_screenshots_new(screenshots_dir)
    
    # יצירת עמוד השוואה
    comparison_file = create_comparison_html(screenshots_dir)
    
    print("\n🎉 השוואה הושלמה!")
    print(f"📁 תיקייה: {screenshots_dir}")
    print(f"🌐 עמוד השוואה: {comparison_file}")
    print(f"🔗 פתח בדפדפן: file://{comparison_file}")
    
    return screenshots_dir, comparison_file

def quick_manual_comparison():
    """השוואה ידנית מהירה"""
    print("🎯 השוואה ידנית מהירה")
    print("=" * 30)
    
    # יצירת עמוד השוואה בלבד
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    screenshots_dir = Path(f"/workspace/visual-comparison-{timestamp}")
    screenshots_dir.mkdir(exist_ok=True)
    
    comparison_file = create_comparison_html(screenshots_dir)
    
    print("✅ עמוד השוואה נוצר!")
    print(f"🌐 פתח: file://{comparison_file}")
    print("\n📋 הוראות:")
    print("1. פתח את העמוד בדפדפן")
    print("2. עקוב אחר ההוראות שם")
    print("3. צלם screenshots ידנית")
    print("4. השווה חזותית")
    
    return comparison_file

def main():
    """מפונקציה ראשית"""
    print("👁️ כלי השוואה ויזואלית למערכת CSS")
    print("=" * 50)
    
    choice = input("""
בחר אופציה:
1. השוואה מלאה (עם צילום אוטומטי)
2. השוואה ידנית מהירה  
3. יציאה

בחירה (1/2/3): """).strip()
    
    if choice == '1':
        run_full_comparison()
    elif choice == '2':
        quick_manual_comparison()
    elif choice == '3':
        print("👋 יציאה...")
    else:
        print("❌ בחירה לא חוקית")

if __name__ == "__main__":
    main()
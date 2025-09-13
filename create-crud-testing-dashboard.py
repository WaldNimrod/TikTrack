#!/usr/bin/env python3
"""
יצירת דשבורד בדיקות CRUD אינטראקטיבי
"""

import os
from datetime import datetime
from pathlib import Path

def create_crud_testing_dashboard():
    """יצירת דשבורד HTML לבדיקות CRUD"""
    print("📊 יוצר דשבורד בדיקות CRUD...")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    dashboard_file = f"trading-ui/crud-testing-dashboard.html"
    
    # רשימת עמודים לבדיקה
    pages = [
        {
            'id': 'index',
            'name': 'דף הבית',
            'url': '/',
            'priority': 'high',
            'crud_level': 'view',
            'main_features': [
                'ניווט ראשי',
                'כרטיסי סקירה',
                'גרפים וסטטיסטיקות',
                'קישורים מהירים'
            ],
            'key_buttons': [
                'קישורי ניווט',
                'כפתורי פעולות מהירות',
                'לינקים לעמודים'
            ]
        },
        {
            'id': 'trades',
            'name': 'טריידים',
            'url': '/trades', 
            'priority': 'critical',
            'crud_level': 'full',
            'main_features': [
                'טבלת טריידים',
                'הוספת טרייד חדש',
                'עריכת טרייד',
                'סגירת/ביטול טרייד',
                'מיון ופילטרים'
            ],
            'key_buttons': [
                'הוסף טרייד חדש',
                'ערוך (בעמודת פעולות)',
                'מחק (בעמודת פעולות)',
                'סגור טרייד',
                'בטל טרייד',
                'רענן נתונים',
                'מיון עמודות',
                'פילטרים'
            ]
        },
        {
            'id': 'accounts', 
            'name': 'חשבונות',
            'url': '/accounts',
            'priority': 'critical',
            'crud_level': 'full',
            'main_features': [
                'טבלת חשבונות',
                'הוספת חשבון חדש',
                'עריכת חשבון',
                'מחיקת חשבון'
            ],
            'key_buttons': [
                'הוסף חשבון חדש',
                'ערוך (בעמודת פעולות)',
                'מחק (בעמודת פעולות)',
                'הצג פרטים',
                'רענן נתונים'
            ]
        },
        {
            'id': 'alerts',
            'name': 'התראות',
            'url': '/alerts',
            'priority': 'critical', 
            'crud_level': 'full',
            'main_features': [
                'טבלת התראות',
                'יצירת התראה חדשה',
                'עריכת התראות',
                'מחיקת התראות',
                'בדיקת תנאים'
            ],
            'key_buttons': [
                'הוסף התראה חדשה',
                'ערוך (בעמודת פעולות)',
                'מחק (בעמודת פעולות)', 
                'בדוק תנאי',
                'הפעל/השבת',
                'פילטר לפי סטטוס'
            ]
        },
        {
            'id': 'tickers',
            'name': 'טיקרים',
            'url': '/tickers',
            'priority': 'high',
            'crud_level': 'full',
            'main_features': [
                'טבלת טיקרים',
                'הוספת טיקר חדש',
                'עריכת טיקר', 
                'רענון נתונים חיצוניים',
                'מחיקת טיקר'
            ],
            'key_buttons': [
                'הוסף טיקר חדש',
                'ערוך (בעמודת פעולות)',
                'מחק (בעמודת פעולות)',
                'רענן מחיר',
                'עדכן נתונים חיצוניים'
            ]
        },
        {
            'id': 'executions',
            'name': 'ביצועים',
            'url': '/executions',
            'priority': 'high',
            'crud_level': 'full',
            'main_features': [
                'טבלת ביצועים',
                'הוספת ביצוע חדש',
                'עריכת ביצוע',
                'קישור לטרייד'
            ],
            'key_buttons': [
                'הוסף ביצוע חדש',
                'ערוך (בעמודת פעולות)',
                'מחק (בעמודת פעולות)',
                'קשר לטרייד'
            ]
        },
        {
            'id': 'cash_flows',
            'name': 'תזרימי מזומנים',
            'url': '/cash_flows',
            'priority': 'medium',
            'crud_level': 'full',
            'main_features': [
                'טבלת תזרימים',
                'הוספת תזרים חדש',
                'עריכת תזרים',
                'חישוב יתרה'
            ],
            'key_buttons': [
                'הוסף תזרים חדש',
                'ערוך (בעמודת פעולות)',
                'מחק (בעמודת פעולות)',
                'חשב יתרה',
                'ייצא דוח'
            ]
        },
        {
            'id': 'trade_plans',
            'name': 'תוכניות מסחר',
            'url': '/trade_plans',
            'priority': 'medium',
            'crud_level': 'full',
            'main_features': [
                'טבלת תוכניות',
                'יצירת תוכנית חדשה',
                'עריכת תוכנית',
                'ביצוע תוכנית'
            ],
            'key_buttons': [
                'הוסף תוכנית חדשה',
                'ערוך (בעמודת פעולות)',
                'מחק (בעמודת פעולות)',
                'בצע תוכנית',
                'העתק תוכנית'
            ]
        },
        {
            'id': 'notes',
            'name': 'הערות',
            'url': '/notes',
            'priority': 'medium',
            'crud_level': 'full',
            'main_features': [
                'טבלת הערות',
                'יצירת הערה חדשה',
                'עריכת הערה',
                'קבצים מצורפים'
            ],
            'key_buttons': [
                'הוסף הערה חדשה',
                'ערוך (בעמודת פעולות)',
                'מחק (בעמודת פעולות)',
                'צרף קובץ',
                'הורד קובץ'
            ]
        },
        {
            'id': 'preferences',
            'name': 'העדפות V1',
            'url': '/preferences',
            'priority': 'high',
            'crud_level': 'settings',
            'main_features': [
                'הגדרות כלליות',
                'צבעי מערכת',
                'שמירת העדפות',
                'איפוס לברירת מחדל'
            ],
            'key_buttons': [
                'שמור העדפות',
                'אפס לברירת מחדל',
                'ייצא העדפות',
                'ייבא העדפות'
            ]
        },
        {
            'id': 'preferences-v2',
            'name': 'העדפות V2',
            'url': '/preferences-v2',
            'priority': 'high',
            'crud_level': 'settings',
            'main_features': [
                'מערכת העדפות מתקדמת',
                'פרופילים מרובים',
                'יבוא/יצוא',
                'היסטוריית שינויים'
            ],
            'key_buttons': [
                'שמור העדפות',
                'ייצא העדפות',
                'ייבא העדפות', 
                'שמור כפרופיל חדש',
                'מיגרציה מ-V1'
            ]
        },
        {
            'id': 'css-management',
            'name': 'מנהל CSS',
            'url': '/css-management',
            'priority': 'medium',
            'crud_level': 'admin', 
            'main_features': [
                'החלפה בין מערכות CSS',
                'בדיקות אוטומטיות',
                'ניתוח ביצועים',
                'השוואה חזותית'
            ],
            'key_buttons': [
                'עבור למערכת ישנה',
                'עבור למערכת חדשה',
                'ניתוח CSS',
                'בדיקת RTL',
                'בדיקת ביצועים',
                'השוואה חזותית'
            ]
        }
    ]
    
    # יצירת HTML
    html_content = f"""<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>דשבורד בדיקות CRUD - TikTrack</title>
    
    <!-- TikTrack CSS -->
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="styles-new/main.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <style>
        .testing-dashboard {{
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }}
        .page-test-card {{
            border: 1px solid #dee2e6;
            border-radius: 12px;
            margin-bottom: 20px;
            overflow: hidden;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }}
        .page-header {{
            padding: 15px 20px;
            background: linear-gradient(135deg, #29a6a8 0%, #1f8a8c 100%);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        .page-header.critical {{
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        }}
        .page-header.high {{
            background: linear-gradient(135deg, #ff9c05 0%, #e68a00 100%);
        }}
        .page-header.medium {{
            background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
        }}
        .page-title {{
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0;
        }}
        .priority-badge {{
            background: rgba(255,255,255,0.2);
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 500;
        }}
        .page-body {{
            padding: 20px;
        }}
        .test-section {{
            margin-bottom: 25px;
        }}
        .test-section h4 {{
            color: #495057;
            border-bottom: 2px solid #29a6a8;
            padding-bottom: 8px;
            margin-bottom: 15px;
        }}
        .checklist {{
            list-style: none;
            padding: 0;
        }}
        .checklist li {{
            padding: 8px 0;
            border-bottom: 1px solid #f8f9fa;
            display: flex;
            align-items: center;
            gap: 10px;
        }}
        .checklist input[type="checkbox"] {{
            transform: scale(1.2);
            accent-color: #29a6a8;
        }}
        .button-item {{
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 8px 12px;
            margin: 4px 0;
        }}
        .button-item.create {{
            border-color: #28a745;
            background: rgba(40, 167, 69, 0.05);
        }}
        .button-item.update {{
            border-color: #17a2b8;
            background: rgba(23, 162, 184, 0.05);
        }}
        .button-item.delete {{
            border-color: #dc3545;
            background: rgba(220, 53, 69, 0.05);
        }}
        .button-item.other {{
            border-color: #6c757d;
            background: rgba(108, 117, 125, 0.05);
        }}
        .test-actions {{
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }}
        .status-indicator {{
            width: 12px;
            height: 12px;
            border-radius: 50%;
            display: inline-block;
            margin-left: 8px;
        }}
        .status-not-tested {{
            background: #6c757d;
        }}
        .status-pass {{
            background: #28a745;
        }}
        .status-fail {{
            background: #dc3545;
        }}
        .summary-stats {{
            background: #e9ecef;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            text-align: center;
        }}
        .summary-item {{
            background: white;
            padding: 10px;
            border-radius: 6px;
            border: 1px solid #dee2e6;
        }}
        .summary-number {{
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 4px;
        }}
        .summary-label {{
            font-size: 0.9rem;
            color: #6c757d;
        }}
    </style>
</head>
<body>
    <div class="testing-dashboard">
        <div class="container-with-border">
            <h1>🧪 דשבורד בדיקות CRUD - TikTrack</h1>
            <p><strong>נוצר:</strong> {datetime.now().strftime('%d/%m/%Y %H:%M')}</p>
            
            <div class="summary-stats" id="summaryStats">
                <div class="summary-item">
                    <div class="summary-number" id="totalPages">{len(pages)}</div>
                    <div class="summary-label">עמודים לבדיקה</div>
                </div>
                <div class="summary-item">
                    <div class="summary-number" id="testedPages">0</div>
                    <div class="summary-label">עמודים נבדקו</div>
                </div>
                <div class="summary-item">
                    <div class="summary-number" id="passedPages">0</div>
                    <div class="summary-label">עמודים תקינים</div>
                </div>
                <div class="summary-item">
                    <div class="summary-number" id="progressPercent">0%</div>
                    <div class="summary-label">התקדמות</div>
                </div>
            </div>
            
            <div class="alert alert-info">
                <h5>📋 הוראות שימוש</h5>
                <ol>
                    <li>לחץ על "פתח עמוד" לכל עמוד</li>
                    <li>בצע את כל הבדיקות ברשימה</li>
                    <li>סמן ✅ לבדיקות שעברו ו-❌ לבדיקות שנכשלו</li>
                    <li>לחץ "סיימתי בדיקה" לעדכון הסטטיסטיקות</li>
                    <li>חזור על התהליך לכל עמוד</li>
                </ol>
            </div>
        </div>
        
        <div id="pagesContainer">
"""
    
    # יצירת כרטיס לכל עמוד
    for page in pages:
        priority_class = page['priority']
        crud_icon = {
            'full': '🔧',
            'settings': '⚙️',
            'admin': '🛠️',
            'view': '👀'
        }.get(page['crud_level'], '❓')
        
        html_content += f"""
            <div class="page-test-card" id="pageCard{page['id'].title()}">
                <div class="page-header {priority_class}">
                    <div class="page-title">
                        {crud_icon} {page['name']}
                    </div>
                    <div>
                        <span class="priority-badge">{page['priority']}</span>
                        <span class="status-indicator status-not-tested" id="status{page['id'].title()}"></span>
                    </div>
                </div>
                
                <div class="page-body">
                    <div class="test-actions">
                        <a href="{page['url']}" target="_blank" class="btn btn-primary">
                            <i class="fas fa-external-link-alt"></i> פתח עמוד
                        </a>
                        <button class="btn btn-success" onclick="markPageComplete('{page['id']}')">
                            <i class="fas fa-check"></i> סיימתי בדיקה
                        </button>
                        <button class="btn btn-warning" onclick="markPagePartial('{page['id']}')">
                            <i class="fas fa-exclamation"></i> יש בעיות
                        </button>
                    </div>
                    
                    <div class="test-section">
                        <h4>🔍 בדיקות בסיסיות</h4>
                        <ul class="checklist">
                            <li>
                                <input type="checkbox" id="{page['id']}_load">
                                <label for="{page['id']}_load">עמוד נטען ללא שגיאות</label>
                            </li>
                            <li>
                                <input type="checkbox" id="{page['id']}_css">
                                <label for="{page['id']}_css">עיצוב CSS נראה תקין</label>
                            </li>
                            <li>
                                <input type="checkbox" id="{page['id']}_js">
                                <label for="{page['id']}_js">אין שגיאות JavaScript בקונסול</label>
                            </li>
                            <li>
                                <input type="checkbox" id="{page['id']}_rtl">
                                <label for="{page['id']}_rtl">RTL ועברית נכונים</label>
                            </li>
                        </ul>
                    </div>
                    
                    <div class="test-section">
                        <h4>🎛️ כפתורים לבדיקה</h4>
                        <div class="buttons-list">
"""
        
        # הוספת כפתורים לבדיקה
        for i, button in enumerate(page['key_buttons']):
            button_type = 'create' if 'הוסף' in button else 'update' if 'ערוך' in button else 'delete' if 'מחק' in button else 'other'
            
            html_content += f"""
                            <div class="button-item {button_type}">
                                <input type="checkbox" id="{page['id']}_btn_{i}">
                                <label for="{page['id']}_btn_{i}"><strong>{button}</strong> - עובד כהלכה</label>
                            </div>
"""
        
        # הוספת בדיקות CRUD ספציפיות
        if page['crud_level'] == 'full':
            html_content += f"""
                        </div>
                    </div>
                    
                    <div class="test-section">
                        <h4>🔧 בדיקות CRUD מפורטות</h4>
                        <ul class="checklist">
                            <li>
                                <input type="checkbox" id="{page['id']}_create">
                                <label for="{page['id']}_create"><strong>Create:</strong> יצירה חדשה עובדת (מודל נפתח, שמירה מצליחה)</label>
                            </li>
                            <li>
                                <input type="checkbox" id="{page['id']}_read">
                                <label for="{page['id']}_read"><strong>Read:</strong> קריאת נתונים עובדת (טבלה נטענת, נתונים מוצגים)</label>
                            </li>
                            <li>
                                <input type="checkbox" id="{page['id']}_update_test">
                                <label for="{page['id']}_update_test"><strong>Update:</strong> עדכון עובד (מודל עריכה, שמירת שינויים)</label>
                            </li>
                            <li>
                                <input type="checkbox" id="{page['id']}_delete_test">
                                <label for="{page['id']}_delete_test"><strong>Delete:</strong> מחיקה עובדת (אישור, רשומה נעלמת)</label>
                            </li>
                        </ul>
                    </div>
                    
                    <div class="test-section">
                        <h4>📊 בדיקות נוספות</h4>
                        <ul class="checklist">
                            <li>
                                <input type="checkbox" id="{page['id']}_sorting">
                                <label for="{page['id']}_sorting">מיון עמודות עובד</label>
                            </li>
                            <li>
                                <input type="checkbox" id="{page['id']}_filtering">
                                <label for="{page['id']}_filtering">פילטרים עובדים</label>
                            </li>
                            <li>
                                <input type="checkbox" id="{page['id']}_pagination">
                                <label for="{page['id']}_pagination">דפדפן (pagination) עובד</label>
                            </li>
                            <li>
                                <input type="checkbox" id="{page['id']}_modals">
                                <label for="{page['id']}_modals">מודלים נפתחים ונסגרים נכון</label>
                            </li>
                        </ul>
"""
        else:
            html_content += f"""
                        </div>
"""
        
        html_content += f"""
                    </div>
                    
                    <div class="test-section">
                        <h4>📝 הערות ובעיות</h4>
                        <textarea class="form-control" id="{page['id']}_notes" rows="3" 
                                  placeholder="תעד כאן בעיות, שגיאות או הערות על העמוד..."></textarea>
                    </div>
                </div>
            </div>
"""
    
    html_content += f"""
        </div>
        
        <div class="container-with-border">
            <h2>📊 סיכום ובעיות</h2>
            <div id="finalSummary">
                <p>בצע בדיקות של כל העמודים לקבלת סיכום מלא.</p>
            </div>
            
            <div class="test-actions">
                <button class="btn btn-info" onclick="generateSummaryReport()">
                    <i class="fas fa-chart-bar"></i> יצור דוח סיכום
                </button>
                <button class="btn btn-success" onclick="exportResults()">
                    <i class="fas fa-download"></i> ייצא תוצאות
                </button>
                <button class="btn btn-secondary" onclick="resetAllTests()">
                    <i class="fas fa-refresh"></i> אפס כל הבדיקות
                </button>
            </div>
        </div>
    </div>

    <script>
        let pageResults = {{}};
        
        function markPageComplete(pageId) {{
            // ספירת בדיקות שעברו
            const checkboxes = document.querySelectorAll(`[id^="${{pageId}}_"]`);
            const checkedBoxes = document.querySelectorAll(`[id^="${{pageId}}_"]:checked`);
            
            const score = checkedBoxes.length / checkboxes.length * 100;
            
            pageResults[pageId] = {{
                status: 'completed',
                score: score,
                totalChecks: checkboxes.length,
                passedChecks: checkedBoxes.length,
                notes: document.getElementById(`${{pageId}}_notes`).value,
                completedAt: new Date().toISOString()
            }};
            
            // עדכון אייקון סטטוס
            const statusIcon = document.getElementById(`status${{pageId.charAt(0).toUpperCase() + pageId.slice(1)}}`);
            if (score >= 90) {{
                statusIcon.className = 'status-indicator status-pass';
            }} else if (score >= 70) {{
                statusIcon.className = 'status-indicator status-partial';
                statusIcon.style.background = '#ffc107';
            }} else {{
                statusIcon.className = 'status-indicator status-fail';
            }}
            
            updateSummaryStats();
            
            alert(`✅ בדיקת ${{pageId}} הושלמה!\\nציון: ${{score.toFixed(1)}}% (${{checkedBoxes.length}}/${{checkboxes.length}})`);
        }}
        
        function markPagePartial(pageId) {{
            pageResults[pageId] = {{
                status: 'partial',
                notes: document.getElementById(`${{pageId}}_notes`).value,
                completedAt: new Date().toISOString()
            }};
            
            const statusIcon = document.getElementById(`status${{pageId.charAt(0).toUpperCase() + pageId.slice(1)}}`);
            statusIcon.style.background = '#ffc107';
            
            updateSummaryStats();
        }}
        
        function updateSummaryStats() {{
            const totalPages = {len(pages)};
            const testedPages = Object.keys(pageResults).length;
            const passedPages = Object.values(pageResults).filter(r => r.score >= 90).length;
            const progress = (testedPages / totalPages * 100).toFixed(1);
            
            document.getElementById('testedPages').textContent = testedPages;
            document.getElementById('passedPages').textContent = passedPages;
            document.getElementById('progressPercent').textContent = progress + '%';
        }}
        
        function generateSummaryReport() {{
            let report = `דוח בדיקות CRUD - TikTrack\\n`;
            report += `נוצר: ${{new Date().toLocaleString('he-IL')}}\\n`;
            report += `=====================================\\n\\n`;
            
            const totalPages = {len(pages)};
            const testedPages = Object.keys(pageResults).length;
            
            report += `סיכום כללי:\\n`;
            report += `- עמודים לבדיקה: ${{totalPages}}\\n`;
            report += `- עמודים נבדקו: ${{testedPages}}\\n`;
            report += `- התקדמות: ${{(testedPages/totalPages*100).toFixed(1)}}%\\n\\n`;
            
            report += `תוצאות מפורטות:\\n`;
            for (const [pageId, result] of Object.entries(pageResults)) {{
                report += `\\n📄 ${{pageId}}:\\n`;
                if (result.score !== undefined) {{
                    report += `   ציון: ${{result.score.toFixed(1)}}% (${{result.passedChecks}}/${{result.totalChecks}})\\n`;
                }}
                if (result.notes) {{
                    report += `   הערות: ${{result.notes}}\\n`;
                }}
            }}
            
            // העתקה ללוח
            navigator.clipboard.writeText(report).then(() => {{
                alert('✅ דוח הועתק ללוח!');
            }});
        }}
        
        function exportResults() {{
            const dataStr = JSON.stringify(pageResults, null, 2);
            const dataBlob = new Blob([dataStr], {{type: 'application/json'}});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `crud-test-results-${{new Date().toISOString().slice(0,19).replace(/[T:]/g, '-')}}.json`;
            link.click();
        }}
        
        function resetAllTests() {{
            if (confirm('⚠️ זה ימחק את כל התוצאות. להמשיך?')) {{
                pageResults = {{}};
                document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
                document.querySelectorAll('textarea').forEach(ta => ta.value = '');
                document.querySelectorAll('.status-indicator').forEach(si => si.className = 'status-indicator status-not-tested');
                updateSummaryStats();
                alert('🔄 כל הבדיקות אופסו');
            }}
        }}
        
        // עדכון סטטיסטיקות כל 5 שניות
        setInterval(updateSummaryStats, 5000);
    </script>
</body>
</html>"""
    
    with open(dashboard_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✅ דשבורד בדיקות נוצר: {dashboard_file}")
    return dashboard_file

def main():
    """פונקציה ראשית"""
    print("📊 יוצר דשבורד בדיקות CRUD")
    print("=" * 30)
    
    dashboard_file = create_crud_testing_dashboard()
    
    print(f"\n🎯 דשבורד בדיקות מוכן!")
    print(f"🌐 פתח בדפדפן: http://localhost:8080/crud-testing-dashboard")
    print(f"📁 קובץ: {dashboard_file}")
    
    print(f"\n📋 להפעלת השרתר (אם לא רץ):")
    print(f"   cd /workspace && ./start_dev.sh")

if __name__ == "__main__":
    main()
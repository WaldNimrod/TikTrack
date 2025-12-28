#!/usr/bin/env python3
"""
סקריפט סריקה מקיף לכל העמודים לזיהוי מצב סטנדרטיזציה
יוצר/מעדכן דוחות מפורטים לכל עמוד
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime

PAGES = [
    {"name": "index", "file": "index.html", "has_crud": False, "category": "Central"},
    {"name": "trades", "file": "trades.html", "has_crud": True, "category": "Central"},
    {"name": "trade_plans", "file": "trade_plans.html", "has_crud": True, "category": "Central"},
    {"name": "alerts", "file": "alerts.html", "has_crud": True, "category": "Central"},
    {"name": "tickers", "file": "tickers.html", "has_crud": True, "category": "Central"},
    {"name": "trading_accounts", "file": "trading_accounts.html", "has_crud": True, "category": "Central"},
    {"name": "executions", "file": "executions.html", "has_crud": True, "category": "Central"},
    {"name": "data_import", "file": "data_import.html", "has_crud": True, "category": "Central"},
    {"name": "cash_flows", "file": "cash_flows.html", "has_crud": True, "category": "Central"},
    {"name": "notes", "file": "notes.html", "has_crud": True, "category": "Central"},
    {"name": "research", "file": "research.html", "has_crud": False, "category": "Central"},
    {"name": "preferences", "file": "preferences.html", "has_crud": True, "category": "Central"},
    {"name": "external-data-dashboard", "file": "external_data_dashboard.html", "has_crud": False, "category": "Supporting"},
    {"name": "chart-management", "file": "chart_management.html", "has_crud": False, "category": "Supporting"},
    {"name": "crud-testing-dashboard", "file": "crud_testing_dashboard.html", "has_crud": False, "category": "Supporting"},
    {"name": "db_display", "file": "db_display.html", "has_crud": False, "category": "Technical"},
    {"name": "db_extradata", "file": "db_extradata.html", "has_crud": False, "category": "Technical"},
]

SERVICE_MAP = {
    "index": "dashboard-data.js",
    "data_import": "data-import-data.js",
    "trade_plans": "trade-plans-data.js",
    "cash_flows": "cash-flows-data.js",
    "trading_accounts": "trading-accounts-data.js",
}

BASE_DIR = Path(__file__).parent.parent
REPORTS_DIR = BASE_DIR / "documentation" / "reports" / "user-pages-standardization"

def check_file_exists(path):
    """בדיקת קיום קובץ"""
    return (BASE_DIR / path).exists()

def count_pattern_in_file(file_path, pattern):
    """ספירת מופעי pattern בקובץ"""
    if not check_file_exists(file_path):
        return 0
    try:
        with open(BASE_DIR / file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            return len(re.findall(pattern, content))
    except:
        return 0

def check_pattern_in_file(file_path, pattern):
    """בדיקת קיום pattern בקובץ"""
    """בדיקת קיום pattern בקובץ"""
    if not check_file_exists(file_path):
        return False
    try:
        with open(BASE_DIR / file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            return bool(re.search(pattern, content))
    except:
        return False

def scan_page(page):
    """סריקת עמוד בודד"""
    page_name = page["name"]
    html_file = f"trading-ui/{page['file']}"
    js_file = f"trading-ui/scripts/{page_name}.js"
    modal_config = f"trading-ui/scripts/modal-configs/{page_name.replace('_', '-')}-config.js"
    
    # שירות נתונים
    expected_service = SERVICE_MAP.get(page_name, f"{page_name.replace('-', '_')}-data.js")
    service_path = f"trading-ui/scripts/services/{expected_service}"
    service_exists = check_file_exists(service_path)
    
    service_has_crud = False
    service_uses_cache_sync = False
    if service_exists:
        service_has_crud = check_pattern_in_file(service_path, r'\b(create|update|delete)\w+')
        service_uses_cache_sync = check_pattern_in_file(service_path, r'CacheSyncManager|invalidateByAction')
    
    # JS file checks
    js_exists = check_file_exists(js_file)
    uses_crud_handler = check_pattern_in_file(js_file, r'CRUDResponseHandler|handleSaveResponse|handleUpdateResponse')
    uses_modal_v2 = check_pattern_in_file(js_file, r'ModalManagerV2|showModal')
    console_logs = count_pattern_in_file(js_file, r'console\.(log|error|warn)')
    
    # Modal config
    modal_config_exists = check_file_exists(modal_config)
    
    # Page config
    page_configs_file = "trading-ui/scripts/page-initialization-configs.js"
    has_page_config = check_pattern_in_file(page_configs_file, f'["\']{page_name.replace("-", "_")}["\']')
    
    # Auto loading
    has_auto_loading = False
    if js_exists:
        load_patterns = [
            f"load{page_name.replace('_', '').replace('-', '_').title()}Data",
            "loadData",
            "initializePage",
            "customInitializers"
        ]
        for pattern in load_patterns:
            if check_pattern_in_file(js_file, pattern):
                has_auto_loading = True
                break
    
    # HTML checks
    html_exists = check_file_exists(html_file)
    inline_styles = count_pattern_in_file(html_file, r'style\s*=\s*["\']')
    
    return {
        "page": page_name,
        "category": page["category"],
        "has_crud": page["has_crud"],
        "html_exists": html_exists,
        "js_exists": js_exists,
        "data_service": expected_service if service_exists else None,
        "data_service_exists": service_exists,
        "data_service_has_crud": service_has_crud,
        "data_service_uses_cache_sync": service_uses_cache_sync,
        "uses_crud_handler": uses_crud_handler,
        "uses_modal_v2": uses_modal_v2,
        "modal_config_exists": modal_config_exists,
        "console_logs_count": console_logs,
        "has_auto_loading": has_auto_loading,
        "has_page_config": has_page_config,
        "inline_styles_count": inline_styles,
    }

def generate_report(page_data):
    """יצירת דוח מפורט לעמוד"""
    page_name = page_data["page"]
    category = page_data["category"]
    has_crud = page_data["has_crud"]
    
    # סטטוסים
    data_service_status = "✅ כן" if page_data["data_service_exists"] else "❌ לא"
    data_service_used = "✅ כן" if page_data["data_service_exists"] else "❌ לא"
    crud_handler_status = "✅ כן" if page_data["uses_crud_handler"] else "❌ לא"
    modal_v2_status = "✅ כן" if page_data["uses_modal_v2"] else "❌ לא"
    cache_sync_status = "✅ כן" if page_data["data_service_uses_cache_sync"] else "❌ לא"
    
    report = f"""# דוח סטנדרטיזציה - {page_name}

## סקירה כללית
- **סוג עמוד**: עמוד {category.lower()}
- **קובץ HTML**: `trading-ui/{page_name}.html`
- **קובץ JavaScript**: `trading-ui/scripts/{page_name}.js`
- **תאריך סריקה**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## שימוש במערכות כלליות

### שירות נתונים
- **שירות נתונים קיים**: {data_service_status}
- **שירות נתונים בשימוש**: {data_service_used}
- **שירות נתונים עם CRUD מלא**: {"✅ כן" if page_data["data_service_has_crud"] else "❌ לא"}
- **שירות נתונים עם CacheSyncManager**: {cache_sync_status}
- **קובץ שירות**: `trading-ui/scripts/services/{page_data["data_service"] or "לא קיים"}`

### מערכת מטמון
- **UnifiedCacheManager**: {"✅ כן" if page_data["data_service_exists"] else "❌ לא"}
- **CacheTTLGuard**: {"✅ כן" if page_data["data_service_exists"] else "❌ לא"}
- **CacheSyncManager**: {cache_sync_status}

### מערכת CRUD
- **CRUDResponseHandler**: {crud_handler_status}
- **שירות נתונים עם CRUD**: {"✅ כן" if page_data["data_service_has_crud"] else "❌ לא"}

### מערכת מודלים
- **ModalManagerV2**: {modal_v2_status}
- **קובץ קונפיגורציה**: {"✅ כן" if page_data["modal_config_exists"] else "❌ לא"}

### ניהול מצב עמוד
- **PAGE_CONFIGS**: {"✅ כן" if page_data["has_page_config"] else "❌ לא"}
- **טעינה אוטומטית**: {"✅ כן" if page_data["has_auto_loading"] else "❌ לא"}

### מערכת לוגים
- **Logger Service**: {"⚠️ חלקי" if page_data["console_logs_count"] > 0 else "✅ כן"}
- **console.log/warn/error**: {page_data["console_logs_count"]}

## חובות טכניים מרכזיים

"""
    
    issues = []
    if not page_data["data_service_exists"] and has_crud:
        issues.append("- ❌ אין שירות נתונים ייעודי")
    if page_data["data_service_exists"] and not page_data["data_service_has_crud"] and has_crud:
        issues.append("- ⚠️ שירות נתונים ללא פונקציות CRUD מלאות")
    if page_data["data_service_exists"] and not page_data["data_service_uses_cache_sync"]:
        issues.append("- ⚠️ שירות נתונים לא משתמש ב-CacheSyncManager")
    if not page_data["uses_crud_handler"] and has_crud:
        issues.append("- ⚠️ אין שימוש ב-CRUDResponseHandler")
    if not page_data["uses_modal_v2"] and has_crud:
        issues.append("- ⚠️ אין שימוש ב-ModalManagerV2")
    if not page_data["modal_config_exists"] and has_crud:
        issues.append("- ⚠️ אין קובץ קונפיגורציה למודל")
    if page_data["console_logs_count"] > 0:
        issues.append(f"- ⚠️ שימוש ב-console.log במקום Logger ({page_data['console_logs_count']} מופעים)")
    if page_data["inline_styles_count"] > 0:
        issues.append(f"- ⚠️ סטיילים inline ב-HTML ({page_data['inline_styles_count']} מופעים)")
    if not page_data["has_auto_loading"]:
        issues.append("- ⚠️ אין טעינה אוטומטית של נתונים")
    if not page_data["has_page_config"]:
        issues.append("- ⚠️ אין הגדרה ב-PAGE_CONFIGS")
    
    if issues:
        report += "\n".join(issues)
    else:
        report += "- ✅ כל המערכות מיושמות כראוי"
    
    report += f"""

## משימות מומלצות

"""
    
    tasks = []
    if not page_data["data_service_exists"] and has_crud:
        tasks.append(f"1. יצירת שירות נתונים `{page_data['data_service'] or '*-data.js'}` עם פונקציות CRUD מלאות")
    if page_data["data_service_exists"] and not page_data["data_service_has_crud"] and has_crud:
        tasks.append("2. הוספת פונקציות CRUD מלאות לשירות הנתונים (create, update, delete, fetchDetails)")
    if page_data["data_service_exists"] and not page_data["data_service_uses_cache_sync"]:
        tasks.append("3. שילוב CacheSyncManager.invalidateByAction בשירות הנתונים")
    if not page_data["uses_crud_handler"] and has_crud:
        tasks.append("4. שילוב CRUDResponseHandler בכל פעולות CRUD")
    if not page_data["uses_modal_v2"] and has_crud:
        tasks.append("5. מעבר ל-ModalManagerV2 (הסרת קוד מודלים ישן)")
    if not page_data["modal_config_exists"] and has_crud:
        tasks.append(f"6. יצירת קובץ קונפיגורציה `modal-configs/{page_name.replace('_', '-')}-config.js`")
    if page_data["console_logs_count"] > 0:
        tasks.append("7. החלפת כל console.log/warn/error ב-window.Logger עם context object")
    if page_data["inline_styles_count"] > 0:
        tasks.append("8. העברת כל הסטיילים לקובץ CSS חיצוני")
    if not page_data["has_auto_loading"]:
        tasks.append("9. הוספת טעינה אוטומטית של נתונים ב-PAGE_CONFIGS.customInitializers")
    if not page_data["has_page_config"]:
        tasks.append("10. הוספת הגדרה ב-PAGE_CONFIGS עם requiredGlobals מלא")
    
    if tasks:
        for i, task in enumerate(tasks, 1):
            report += f"{i}. {task}\n"
    else:
        report += "1. ✅ כל המשימות הושלמו\n"
    
    report += f"""
## סטטיסטיקות

- **שימוש ב-console.log**: {page_data["console_logs_count"]}
- **סטיילים inline**: {page_data["inline_styles_count"]}
- **שירות נתונים**: {"קיים" if page_data["data_service_exists"] else "חסר"}
- **CRUD Handler**: {"בשימוש" if page_data["uses_crud_handler"] else "לא בשימוש"}
- **Modal V2**: {"בשימוש" if page_data["uses_modal_v2"] else "לא בשימוש"}

---
*דוח נוצר אוטומטית על ידי סקריפט ניתוח סטנדרטיזציה - {datetime.now().strftime('%Y-%m-%d')}*
"""
    
    return report

def main():
    """פונקציה ראשית"""
    print("🔍 מתחיל סריקת עמודים...")
    
    all_results = {}
    for page in PAGES:
        print(f"  📄 סורק {page['name']}...")
        result = scan_page(page)
        all_results[page["name"]] = result
    
    print("\n📝 יוצר/מעדכן דוחות...")
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    
    for page_name, page_data in all_results.items():
        report = generate_report(page_data)
        report_file = REPORTS_DIR / f"{page_name}.report.md"
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"  ✅ נוצר/עודכן: {report_file.name}")
    
    # יצירת סיכום JSON
    summary_file = REPORTS_DIR / "scan_summary.json"
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump(all_results, f, indent=2, ensure_ascii=False)
    print(f"\n✅ סיכום JSON: {summary_file.name}")
    
    print(f"\n✅ הושלם! נסרקו {len(PAGES)} עמודים")

if __name__ == "__main__":
    main()


# רשימת עמודים - TikTrack
**תאריך עדכון:** ינואר 2025  
**גרסה:** 2.0.0  
**סטטוס:** ✅ מעודכן - מערכת ניטור ולידציה הושלמה  

---

## 📋 עמודים ראשיים (28 עמודים) ✅ **סטנדרטיזציה מלאה הושלמה**

### עמודים מרכזיים
| עמוד | תיאור | גישה | API |
|------|--------|------|-----|
| **index.html** | דשבורד ראשי | `http://localhost:5000/` | `/api/dashboard/*` |
| **trades.html** | ניהול טריידים | `http://localhost:5000/trades.html` | `/api/trades/*` |
| **trade_plans.html** | תכניות מסחר | `http://localhost:5000/trade_plans.html` | `/api/trade_plans/*` |
| **alerts.html** | מערכת התראות | `http://localhost:5000/alerts.html` | `/api/alerts/*` |
| **tickers.html** | ניהול טיקרים | `http://localhost:5000/tickers.html` | `/api/tickers/*` |
| **trading_accounts.html** | חשבונות מסחר | `http://localhost:5000/trading_accounts.html` | `/api/trading_accounts/*` |
| **executions.html** | ביצועי עסקאות | `http://localhost:5000/executions.html` | `/api/executions/*` |
| **cash_flows.html** | תזרימי מזומן | `http://localhost:5000/cash_flows.html` | `/api/cash_flows/*` |
| **notes.html** | מערכת הערות | `http://localhost:5000/notes.html` | `/api/notes/*` |
| **research.html** | מחקר וניתוח | `http://localhost:5000/research.html` | `/api/research/*` |
| **preferences.html** | הגדרות מערכת | `http://localhost:5000/preferences.html` | `/api/preferences/*` |

### עמודים טכניים
| עמוד | תיאור | גישה | API |
|------|--------|------|-----|
| **db_display.html** | תצוגת בסיס נתונים | `http://localhost:5000/db_display.html` | `/api/db/*` |
| **db_extradata.html** | נתונים נוספים | `http://localhost:5000/db_extradata.html` | `/api/db/extra/*` |
| **constraints.html** | אילוצי מערכת | `http://localhost:5000/constraints.html` | `/api/constraints/*` |
| **background-tasks.html** | משימות רקע | `http://localhost:5000/background-tasks.html` | `/api/background/*` |
| **server-monitor.html** | ניטור שרת | `http://localhost:5000/server-monitor.html` | `/api/monitor/*` |
| **system-management.html** | ניהול מערכת | `http://localhost:5000/system-management.html` | `/api/system/*` |
| **cache-test.html** | בדיקת מטמון | `http://localhost:5000/cache-test.html` | `/api/cache/*` |
| **linter-realtime-monitor.html** | ניטור לינטר | `http://localhost:5000/linter-realtime-monitor.html` | `/api/linter/*` |
| **notifications-center.html** | מרכז התראות | `http://localhost:5000/notifications-center.html` | `/api/notifications/*` |
| **page-scripts-matrix.html** | מטריצת סקריפטים | `http://localhost:5000/page-scripts-matrix.html` | `/api/scripts/*` |
| **css-management.html** | ניהול CSS | `http://localhost:5000/css-management.html` | `/api/css/*` |
| **dynamic-colors-display.html** | תצוגת צבעים | `http://localhost:5000/dynamic-colors-display.html` | `/api/colors/*` |
| **designs.html** | עיצובים | `http://localhost:5000/designs.html` | `/api/designs/*` |

---

## 📁 עמודים משניים

### עמודים חיצוניים
| עמוד | תיאור | גישה |
|------|--------|------|
| **external-data-dashboard.html** | דשבורד נתונים חיצוניים | `http://localhost:5000/external-data-dashboard.html` |
| **chart-management.html** | ניהול גרפים | `http://localhost:5000/chart-management.html` |
| **crud-testing-dashboard.html** | דשבורד בדיקות CRUD | `http://localhost:5000/crud-testing-dashboard.html` |

### עמודים חיצוניים נוספים
| עמוד | תיאור | גישה |
|------|--------|------|
| **test_external_data.html** | בדיקת נתונים חיצוניים | `http://localhost:5000/external_data_integration_client/pages/test_external_data.html` |
| **test_models.html** | בדיקת מודלים | `http://localhost:5000/external_data_integration_client/pages/test_models.html` |

---

## 🔗 קישורים רלוונטיים

### דוקומנטציה
- [מערכת אתחול מאוחדת](frontend/UNIFIED_INITIALIZATION_SYSTEM.md)
- [מערכת מטמון מאוחדת](04-FEATURES/CORE/UNIFIED_CACHE_SYSTEM.md)
- [מערכת תנאים](04-FEATURES/CORE/conditions-system/CONDITIONS_SYSTEM.md)

### ספציפיקציות עמודים
- [תכניות מסחר](pages/TRADE_PLANS_PAGE_SPECIFICATION.md)
- [טריידים](pages/TRADES_PAGE_SPECIFICATION.md)
- [התראות](04-FEATURES/CORE/alerts-system/ALERTS_SYSTEM.md)

---

## 📊 סטטיסטיקות

- **סה"כ עמודים ראשיים:** 24 עמודים
- **עמודים מרכזיים:** 11 עמודים
- **עמודים טכניים:** 13 עמודים
- **עמודים משניים:** 5 עמודים
- **סה"כ עמודים:** 29 עמודים

---

## ⚠️ הערות חשובות

1. **כל העמודים** עובדים עם מערכת האתחול המאוחדת
2. **כל העמודים** תומכים במערכת המטמון המאוחדת
3. **כל העמודים** עובדים עם מערכת ההתראות הגלובלית
4. **כל העמודים** תומכים במערכת התנאים החדשה
5. **כל העמודים** עובדים עם מערכת הכפתורים המרכזית

---

**תאריך עדכון אחרון:** 19 אוקטובר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ מעודכן ומדויק

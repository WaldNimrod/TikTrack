# רשימת עמודים — סוג ישות לא ברור (לדיוק על ידי המשתמש)

**id:** PAGES_UNCLEAR_ENTITY_LIST  
**תאריך:** 2026-01-31  
**סטטוס:** שיוך זמני בוצע — ניתן לדייק לפי הצורך

---

## עמודים שסוג הישות דורש אימות/הגדרה

להלן העמודים שלא קיימת להם ישות חד־משמעית ב־DNA. **כרגע שויכו לפי ההנחה הטובה ביותר:**

| # | Route | שם העמוד (עברית) | שיוך נוכחי | אפשרויות חלופיות |
|---|-------|------------------|------------|-------------------|
| 1 | ai_analysis | אנליזת AI | **research** | trade_plan |
| 2 | watch_lists | רשימות צפייה | **ticker** | trade_plan |
| 3 | data_dashboard | דשבורד נתונים | **ticker** | execution |
| 4 | tag_management | ניהול תגיות | **note** | (חדש: tag) |
| 5 | preferences | העדפות | **note** | (חדש: settings) |
| 6 | system_management | ניהול מערכת | **message-info** (כחול) | — |
| 7 | data_import | ייבוא נתונים | **execution** | cash_flow |

---

## עדכון (אחרי דיוק)

אם יש לעדכן שיוך:
1. עדכן את `PAGES_ENTITY_COLOR_MAPPING.md`
2. עדכן bodyClass ב־`page-manifest.json`
3. הרץ `node ui/scripts/generate-pages.js`

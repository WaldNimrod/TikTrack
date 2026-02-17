# Team 30 — ADR-015 D18 עמלות לפי חשבון מסחר — Evidence

**מאת:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-12  
**מקור:** TEAM_10_TO_TEAM_30_ADR_015_BROKER_REFERENCE_MANDATE.md  
**תאום API:** TEAM_20_TO_TEAM_30_ADR_015_D18_API_READY.md  

---

## 1. סיכום ביצוע

**משימה (שלב 4):** D18 — בחירת חשבון מסחר + עמלות לפי חשבון (trading_account_id).

**סטטוס:** ✅ **הושלם**

---

## 2. חוזה API — התאמה

| פעולה | מימוש |
|--------|--------|
| רשימה | GET /brokers_fees?trading_account_id={ulid} — `tradingAccountId` ב-filters |
| סיכום | GET /brokers_fees/summary?trading_account_id={ulid} — אותו סינון |
| יצירה | POST /brokers_fees — `trading_account_id`, `commission_type`, `commission_value`, `minimum` |
| עדכון | PUT /brokers_fees/{id} — אותם שדות (אופציונלי) |
| תגובה | הצגת `account_name` בעמודה "חשבון מסחר" |

---

## 3. קבצים ששונו

| קובץ | שינויים |
|------|---------|
| `brokersFeesForm.js` | טופס עם בחירת חשבון מסחר (trading_account_id) במקום broker |
| `brokersFeesTableInit.js` | טבלה: account_name; save: trading_account_id; פילטר חשבון |
| `brokersFeesDataLoader.js` | תמיכה ב-`tradingAccountId` בשאילתות |
| `brokers_fees.html` | עמודה "חשבון מסחר"; בחירת חשבון לפילטר; כפתור "הוסף עמלה" |
| `fetchReferenceBrokers.js` | נרמול `display_name` (D16) |

---

## 4. לוגיקת D18 (כפי שמומלץ ב-Team 20)

1. **בחירת חשבון** — Select מ-`GET /trading_accounts` ב-header + בטופס הוספה
2. **טעינת עמלות** — `GET /brokers_fees?trading_account_id={selected}` (כאשר נבחר חשבון)
3. **יצירת עמלה** — POST עם `trading_account_id` של החשבון הנבחר
4. **הצעת מילוי** — לא מומשה בשלב זה (אופציונלי מ-reference/brokers לפי default_fees)

---

## 5. תלות במיגרציה

Team 60 צריך להריץ מיגרציה לפי `TEAM_20_TO_TEAM_60_ADR_015_MIGRATION_SCRIPT_DELIVERY.md`.  
לפיתוח מקומי — יש להריץ את הסקריפט לפני בדיקות.

---

## 6. רפרנסים

- **מנדט:** TEAM_10_TO_TEAM_30_ADR_015_BROKER_REFERENCE_MANDATE.md  
- **תאום API:** TEAM_20_TO_TEAM_30_ADR_015_D18_API_READY.md  
- **תוכנית:** TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md §4  

---

**Team 30 (Frontend Execution)**  
**log_entry | ADR_015 | D18_FEES_PER_ACCOUNT_COMPLETE | 2026-02-12**

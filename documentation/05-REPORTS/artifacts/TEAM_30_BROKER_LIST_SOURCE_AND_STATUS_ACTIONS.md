# Team 30: מקור רשימת ברוקרים + פעולות ממצאים

**תאריך:** 2026-01-31  
**נושא:** תשובות לשאלות על רשימת ברוקרים, סטטוסים, וולידציה

---

## 1. מאיפה מגיעה רשימת הברוקרים?

### מקור הנתונים

| שלב | מקור | תיאור |
|-----|------|-------|
| 1 | `api/data/defaults_brokers.json` | רשימת ברוקרים קבועה (11 ברוקרים + "אחר") |
| 2 | `trading_accounts.broker` | ברוקרים ייחודיים מחשבונות המסחר הקיימים של המשתמש |
| 3 | `reference_service.py` | משלב: known (מ-defaults) + custom (מחשבונות) + "other" בסוף |

### איפה הקוד

- **API:** `api/services/reference_service.py` — `get_reference_brokers()`
- **Frontend:** `ui/src/views/financial/shared/fetchReferenceBrokers.js` — קורא `GET /api/v1/reference/brokers`
- **Defaults:** `api/data/defaults_brokers.json`

### למה יש המון שמות?

הרשימה כוללת:
1. **ברוקרים מה-JSON** — Interactive Brokers, TD Ameritrade, Charles Schwab, Fidelity, וכו' (11 + "אחר")
2. **ברוקרים מחשבונות המשתמש** — כל ערך ייחודי ב-`trading_accounts.broker` שמופיע בחשבונות קיימים נוסף לרשימה (למשל אם יצר חשבון עם "ברוקר X" — יופיע ברשימה)

### למה "אחר" הופיע פעמיים?

- אם למשתמש יש חשבון עם `broker="אחר"` (או "other") — הוא נוסף כברוקר מותאם אישית
- ברירת המחדל כוללת תמיד "other" עם display_name "אחר"
- **תיקון:** Deduplication ב-`reference_service.py` וב-`tradingAccountsForm.js` — כעת "אחר" מופיע פעם אחת

---

## 2. סטטוסים — העלאה ל-Team 10

**מסמך:** `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_STATUS_SSOT_ESCALATION.md`

סטטוסים חשובים ל-PhoenixFilter. נדרש SSOT רוחבי — הועלה ל-Team 10 לטיפול.

---

## 3. וולידציה — תיאום Team 20

**מסמך:** `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_20_VALIDATION_COORDINATION_REQUEST.md`

- **צד לקוח (Team 30):** נוסף — ברוקר חובה, מספר חשבון חובה, ייחודיות שם/מספר
- **צד שרת (Team 20):** נדרש — וולידציה ב-API, constraints ב-DB, תיאום על שדות חובה לכל הטבלאות

---

## 4. שינויים שבוצעו (Team 30)

| נושא | קובץ | תיאור |
|------|------|-------|
| עיצוב input vs select | `phoenix-modal.css` | input: יותר ריווח אנכי; select: פחות; focus: צבע ראשי אחיד |
| Dedupe "אחר" | `tradingAccountsForm.js`, `reference_service.py` | מניעת כפילות ברשימת ברוקרים |
| וולידציה | `tradingAccountsForm.js` | ברוקר + מספר חשבון חובה; ייחודיות שם/מספר (client-side) |

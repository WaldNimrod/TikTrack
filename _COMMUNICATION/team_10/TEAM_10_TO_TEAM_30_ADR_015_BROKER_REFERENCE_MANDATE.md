# Team 10 → Team 30: מנדט ADR-015 — Conditional Rendering + Auto-fill עמלות

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend)  
**תאריך:** 2026-02-12  
**מקור:** ARCHITECT_BROKER_REFERENCE_MANDATE.md (ADR-015), PROMPTS FOR THE FIELD.

---

## 1. המנדט (ADR-015)

האדריכלית הפעילה את מנדט הברוקרים (ADR-015). עליכם לממש:
1. **Conditional Rendering** עבור ברוקר "אחר".
2. **Auto-fill** לשדות העמלות בבחירת ברוקר (מיקום — ראה §3).

---

## 2. דרישות מהמנדט

| דרישה | פירוט |
|--------|--------|
| **"אחר"** | פריט 'other' יאפשר הכנסת שם ידני. בבחירת "אחר" — **הצגת הודעת המשילות** שנקבעה במנדט. |
| **הודעה** | חובת הצגת הודעת המשילות בממשק — טקסט מאושר (ראה §3א להלן). |
| **Auto-fill** | ברגע שנבחר ברוקר — **מילוי אוטומטי** של שדות העמלות **לערכי ה-Default** שמגיעים מה-API (default_fees). |

---

## 3. עמודים ומיקום

- **D16** = חשבונות מסחר (`trading_accounts.html`) — טופס חשבון מסחר (אין שדות עמלות).
- **D18** = עמלות ברוקרים (`brokers_fees.html`) — טופס עמלה (ברוקר, commission_type, commission_value, minimum).
- **Conditional Rendering + הודעה:** בכל מקום בחירת ברוקר (D16, D18), בבחירת "אחר" — הצגת הודעת המשילות (§3א).
- **Auto-fill:** ב-**D18** (טופס עמלות) — מילוי שדות העמלות מ־default_fees בעת בחירת ברוקר.

### 3א. טקסט הודעת המשילות (מאושר)

להצגה בבחירת "אחר":

> במידה ולא מצאתם את הברוקר שלכם במערכת, עדין ניתן לייצר את החשבון מסחר — אבל לא ניתן יהיה לייבא אוטומטית נתונים.  
> מומלץ ליצור איתנו קשר ולבקש הוספת הברוקר למערכת, **[קישור למייל של משתמש מנהל ראשי]**.

במימוש: להחליף **[קישור למייל של משתמש מנהל ראשי]** בקישור/מייל בפועל (משתמש מנהל ראשי).

---

## 4. תוצר מצופה

- בבחירת ברוקר "אחר" — הצגת הודעת המשילות בטקסט המאושר (§3א).
- Auto-fill שדות העמלות (commission_type, commission_value, minimum) ב-D18 בעת בחירת ברוקר — מקור: `default_fees` מתגובת GET /api/v1/reference/brokers (לאחר ש־Team 20 יספק את השדות).
- דוח השלמה ל-Team 10 עם רפרנס ל-ADR-015.

---

## 5. רפרנסים

- **מנדט:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BROKER_REFERENCE_MANDATE.md`
- **תוכנית עבודה:** [TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md](./TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md)
- **טפסים:** D16 — `ui/src/views/financial/tradingAccounts/tradingAccountsForm.js`; D18 — `ui/src/views/financial/brokersFees/brokersFeesForm.js`
- **API:** GET /api/v1/reference/brokers (יורחב ע"י Team 20 ל־is_supported, default_fees).

---

**Team 10 (The Gateway)**  
**log_entry | ADR_015 | MANDATE_TO_TEAM_30 | 2026-02-12**

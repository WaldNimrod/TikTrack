# תוכנית עבודה — ADR-015 (מנדט רפרנס ברוקרים | עמלות לפי חשבון מסחר)

**id:** `TEAM_10_ADR_015_WORK_PLAN`  
**owner:** Team 10 (The Gateway)  
**status:** פעיל — **מעודכן לפי החלטה: Fees per Trading Account**  
**last_updated:** 2026-02-12  
**מקור:** ARCHITECT_BROKER_REFERENCE_MANDATE.md (ADR-015); החלטת אדריכלית: עמלות לפי חשבון.  
**תיקיית האדריכלית:** `_COMMUNICATION/90_Architects_comunication/` (מסונכרן מ-Drive).

**סטטוס:** READY FOR DISTRIBUTION (לאחר סגירת חסימות SSOT — ראה ADR_015_READY_FOR_DISTRIBUTION.md).

---

## 0. חלוקת תפקידים (בהתאם להגדרות — ביקורת יישור)

**מקור:** CURSOR_INTERNAL_PLAYBOOK.md (סעיף 2), TT2_SLA_TEAMS_30_40.md, TT2_TEAM_60_DEFINITION.md.

| צמד | הגדרה | יישור ADR-015 |
|-----|--------|----------------|
| **20 vs 60** | **Team 20 (Backend):** מימוש FastAPI בהתאמה ל-SQL; מודלים ו-API. **Team 60 (DevOps):** תשתיות, גיבוי DB, סקריפטי seed, `make db-*`, **הרצת** גיבויים והזרקת נתוני בדיקה. | **Team 20:** כתיבת סקריפט המיגרציה (Account↔Fees), הרחבת endpoint ו-models — בעלות על סכמה לוגית ו-API. **Team 60:** הרצת מיגרציה בסביבה (למשל `make db-*` / pipeline) לפי הנחיית Team 20 — לא כתיבת לוגיקת המיגרציה. |
| **30 vs 40** | **Team 30 (Frontend):** Containers — לוגיקה, State, קריאות API; לא משנה CSS. **Team 40 (UI/Design):** Presentational, Pixel Perfect, בעלות על CSS. | **Team 30:** D16 "אחר" + הודעה; D18 בחירת חשבון + עמלות (לוגיקה, אינטגרציה API). **Team 40:** אם נדרש רכיב Presentational חדש (למשל עיצוב הודעת המשילות) — 40 מספק, 30 משלב (SLA 30/40). |

המשימות בתוכנית מחולקות בהתאם; אין שינוי צוותים — רק תיעוד יישור.

---

## 0א. עקרונות נעולים (הטמעה בתוכנית)

| עקרון | פירוט |
|--------|--------|
| **קשר ישיר** | Trading Account → Fees (one-to-many). עמלות שייכות לחשבון מסחר. |
| **אין Broker → Fees** | אין קשר ישיר "Broker → Fees" במודל. ברוקר = מטא-דאטה של חשבון בלבד. |
| **Broker list** | משמש **רק** בבניית חשבון מסחר (D16). |
| **D18** | עמלות **לפי חשבון** — בחירת חשבון + סינון/ניהול עמלות של החשבון. |
| **"אחר"** | שייך לבחירת **ברוקר** בלבד (D16) — לא לעמלות. |

---

## 1. זיהוי עמודים (D16 / D18) — מעודכן

| קוד | עמוד (קובץ) | תיאור |
|-----|-------------|--------|
| **D16** | `trading_accounts.html` | **חשבונות מסחר** — בחירת ברוקר + יצירת/עריכת חשבון. בהמשך: מודול ניהול עמלות בתוך D16 (הנחיה עתידית). |
| **D18** | `brokers_fees.html` | **עמלות לכל חשבון מסחר** — בחירת חשבון מסחר + הצגת/ניהול עמלות של אותו חשבון (trading_account_id). |

---

## 2. סיכום המנדט (ADR-015) — מיושר להחלטה

| סעיף | דרישה |
|------|--------|
| **1. מקור נתונים** | GET /api/v1/reference/brokers — רשימה עם display_name, is_supported, default_fees (לשימוש ב-D16 ובהצעת מילוי עמלות לפי ברוקר החשבון). |
| **2. "אחר"** | פריט 'other' — הכנסת שם ידני; חשבון "אחר" חוסם ייבוא ו-API. **בחירת ברוקר ב-D16 בלבד** — הודעת משילות שם. |
| **3. עמלות** | עמלות משויכות **לחשבון מסחר** (לא לברוקר). D18 = עמלות לפי חשבון; אופציונלי: הצעת מילוי מ-default_fees לפי ברוקר של החשבון. |

---

## 3. סדר ביצוע ותלויות

| שלב | צוות | משימה | תלות | הערה |
|-----|------|--------|------|------|
| **1** | **Team 10** | עדכון מסמכים; החזרת תוכנית לאישור; **אין הוצאת משימות עד לאישור**. | — | |
| **2** | **Team 20** | הרחבת GET /reference/brokers (display_name, is_supported, default_fees). **DB/API: עמלות לפי חשבון — trading_account_id; הסרת broker; כתיבת סקריפט מיגרציה (§6א).** | — | קונטקסט: DB נוכחי brokers_fees עם broker+user_id — לא תואם. |
| **2א** | **Team 60** | הרצת סקריפט המיגרציה בסביבה (למשל `make db-*` / pipeline) **לפי הנחיית Team 20** — לא כתיבת לוגיקת המיגרציה. | ממתין ל-Team 20 (סקריפט מוכן). | per Playbook: גיבוי DB, הרצת סקריפטים. |
| **3** | **Team 30** | D16: Conditional Rendering "אחר" + הודעת משילות (בחירת ברוקר בלבד). אופציונלי: רכיב Presentational מ-Team 40 (SLA 30/40). | — | |
| **4** | **Team 30** | D18: UI — בחירת חשבון + עמלות של החשבון; כל פעולה עם trading_account_id. אופציונלי: הצעת מילוי מ-default_fees. | ממתין ל-Team 20 (חוזה API + מודל עמלות לפי חשבון). | |
| **5** | **Team 10** | וידוא Acceptance Criteria, עדכון Page Tracker / Evidence. | אחרי 2, 2א, 3, 4. | |

---

## 4. הודעת משילות (ברוקר "אחר") — D16 בלבד (SSOT סגור)

להצגה **בבחירת "אחר"** ב-**D16**. קישור/מייל — ערך קבוע ב-SSOT (אין placeholder).

- **מסמך SSOT:** `documentation/06-ENGINEERING/ADR_015_GOVERNANCE_MESSAGE_SSOT.md` — מפתח `primary_admin_contact`, ברירת מחדל `mailto:support@tiktrack.app`.

---

## 5. default_fees — מבנה (רפרנס בלבד)

- **מבנה:** כרשומת עמלה — commission_type (TIERED | FLAT), commission_value, minimum. **שיוך:** להצעת מילוי לפי ברוקר (ברוקר של החשבון), לא "בעלות" ברוקר על עמלות.
- **לבדיקה:** ברוקר אחד (IBKR) + 3 עמלות דוגמה. נתוני בדיקה; העיקר המבנה.

---

## 6. SSOT DB / API — חובה

- **קשר Account ↔ Fees:** בכל רשומת עמלה — **trading_account_id** (או מיפוי מוכר). אין להשאיר "broker" כ-FK בעמלות.
- **commission_value:** NUMERIC(20,6) — SSOT: TEAM_10_COMMISSION_VALUE_NUMERIC_DECISIONS.md.
- **תיקון עומק:** טבלה נוכחית brokers_fees (broker, user_id בלי account FK) — **לא תואמת החלטה; חובה תיקון + מיגרציה (§6א).**

### 6א. מיגרציה Account↔Fees (חובה — ביצוע Team 20; הרצה — Team 60 לפי הנחיה)

**בעלות:** Team 20 כותב את סקריפט המיגרציה ומתעד (התאמה למודלים ו-API). Team 60 מריץ מיגרציה בסביבה (`make db-*` / pipeline) לפי הנחיית Team 20 (ראה §0).

הוספת `trading_account_id` והסרת `broker` מחייבת **מפת מיגרציה מפורשת**. כללי החלטה:

| שלב | פעולה |
|-----|--------|
| **1. מיפוי** | לכל רשומת עמלה קיימת (user_id, broker): חפש חשבון מסחר עם **אותו user_id** ו**אותו broker** (trading_accounts.broker). |
| **2. התאמה יחידה** | אם נמצא **חשבון אחד** תואם — עדכן `trading_account_id` ל-ID של אותו חשבון. |
| **3. כמה התאמות** | אם נמצאו **כמה חשבונות** תואמים (אותו user + broker) — שייך ל**ראשון לפי created_at** (או לפי כללי SSOT שייקבעו). |
| **4. אין התאמה** | אם **אין** חשבון מסחר עם אותו user_id ו-broker — **אין שיוך אוטומטי.** חובה: לרשום ב־migration log (רשומת עמלה ללא חשבון). **החלטה:** למחוק את רשומת העמלה / ליצור חשבון דמה למיגרציה / או לדרוש תיקון ידני — **Team 20 יממש את המדיניות שנבחרת** (לתעד במסמך המיגרציה). |
| **5. commission_value** | אם הטבלה הקיימת עדיין VARCHAR — המרה ל-NUMERIC(20,6) לפי TEAM_10_COMMISSION_VALUE_NUMERIC_DECISIONS.md (חילוץ מספר; default 0 אם unparseable). |
| **6. סיום** | הוספת עמודת trading_account_id (או טבלה חדשה), מילוי לפי שלבים 1–4, הסרת עמודת broker, הוספת constraint NOT NULL ל-trading_account_id. |

**תוצר:** סקריפט/מיגרציה מתועדת; דוח מיגרציה ל-Team 10 (כמה שויכו, כמה ללא התאמה, איך טופלו).

---

## 7. Acceptance Criteria (חובה)

- D18 מציג עמלות **לפי חשבון מסחר בלבד**.
- בכל פעולה של עמלה יש **trading_account_id**.
- Broker נשמר **ברמת חשבון בלבד**.
- "Other broker" משויך ל-**D16** בלבד.
- **אין** מקום שבו "broker = owner of fees".

---

## 8. SSOT — פריט "אחר" (נעול)

**"אחר" מגיע מה-API** (defaults_brokers.json): `value`: `"other"`, `is_supported`: `false`. ראה ADR_015_FINAL §8.

---

## 9. רפרנסים

- **מנדט:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BROKER_REFERENCE_MANDATE.md` (ADR-015)
- **API קיים:** reference.py, reference_service.py, reference.py (schemas), defaults_brokers.json
- **טפסים:** D16 — tradingAccountsForm.js; D18 — brokersFees (להגדרה מחדש: עמלות לפי חשבון)

---

## 10. הודעות לצוותים

- **Team 20:** [TEAM_10_TO_TEAM_20_ADR_015_BROKER_REFERENCE_MANDATE.md](./TEAM_10_TO_TEAM_20_ADR_015_BROKER_REFERENCE_MANDATE.md)
- **Team 30:** [TEAM_10_TO_TEAM_30_ADR_015_BROKER_REFERENCE_MANDATE.md](./TEAM_10_TO_TEAM_30_ADR_015_BROKER_REFERENCE_MANDATE.md)
- **מסמך סופי לאישור:** [ADR_015_FINAL_FOR_ARCHITECT_APPROVAL.md](./ADR_015_FINAL_FOR_ARCHITECT_APPROVAL.md)

---

**Team 10 (The Gateway)**  
**log_entry | ADR_015 | WORK_PLAN_UPDATED_FEES_PER_ACCOUNT | 2026-02-12**

# ADR-015 — תוכנית מעודכנת לאישור האדריכלית (עמלות לפי חשבון מסחר)

**מאת:** Team 10 (The Gateway)  
**אל:** אדריכלית (Gemini Bridge)  
**תאריך:** 2026-02-12  
**עדכון:** 2026-02-12 — דיוק: **Fees per Trading Account** (לא per Broker).  
**סטטוס:** READY FOR DISTRIBUTION (חסימות SSOT נסגרו — ראה ADR_015_READY_FOR_DISTRIBUTION.md).

---

## 1. עקרונות נעולים (החלטה שאושרה)

| עקרון | פירוט |
|--------|--------|
| **עמלות שייכות לחשבון מסחר** | Trading Account → Fees (one-to-many). עמלות משויכות לחשבון מסחר בלבד. |
| **ברוקר = מטא-דאטה של חשבון** | ברוקר הוא שדה/מאפיין של חשבון מסחר, לא ישות עמלות עצמאית. אין קשר ישיר "Broker → Fees" במודל. |
| **Broker list** | משמש **רק** בבניית חשבון מסחר (D16) — בחירת ברוקר בטופס חשבון. |
| **"אחר" (Other broker)** | שייך **לבחירת ברוקר בלבד (D16)** — לא לעמלות. |
| **D18** | מוגדר מחדש: **עמלות לכל חשבון מסחר** — בחירת חשבון + ניהול עמלות של החשבון. |
| **D16** | נשאר עמוד ניהול חשבונות מסחר; בהמשך יתווסף מודול ניהול עמלות בתוך D16 (לפי הנחיה עתידית). |

---

## 2. עמודים D16 / D18 (מעודכן)

| קוד | עמוד (קובץ) | תיאור |
|-----|-------------|--------|
| **D16** | `trading_accounts.html` | **חשבונות מסחר** — בחירת ברוקר + יצירת/עריכת חשבון. מקום יחיד ל־"אחר" ולהודעת המשילות. |
| **D18** | `brokers_fees.html` | **עמלות לכל חשבון מסחר** — בחירת חשבון מסחר + הצגת/ניהול עמלות של אותו חשבון (עם trading_account_id). |

אין מקום שבו "broker = owner of fees".

---

## 3. default_fees (רפרנס ברוקרים) — שימוש בלבד

- **מקור:** GET /api/v1/reference/brokers — לכל ברוקר: display_name, is_supported, default_fees.
- **משמעות:** ערכי ברירת מחדל **להצעת מילוי** כשמוסיפים עמלה לחשבון מסחר (החשבון מקושר לברוקר). לא "עמלות בבעלות ברוקר".
- **מבנה:** כרשומת עמלה — commission_type, commission_value, minimum. לבדיקה: ברוקר אחד (IBKR) + 3 עמלות דוגמה.

---

## 4. הודעת משילות ("אחר") — רק ב-D16 (SSOT סגור)

להצגה **בבחירת ברוקר "אחר"** ב-**D16** בלבד. **אין placeholder:** קישור/מייל נקבע ב-SSOT.

- **מסמך SSOT:** `documentation/06-ENGINEERING/ADR_015_GOVERNANCE_MESSAGE_SSOT.md`
- **ערך קבוע:** `primary_admin_contact` = `mailto:support@tiktrack.app` (ניתן להחלפה ב-env `PRIMARY_ADMIN_EMAIL`).

טקסט מלא: "במידה ולא מצאתם את הברוקר שלכם במערכת, עדין ניתן לייצר את החשבון מסחר — אבל לא ניתן יהיה לייבא אוטומטית נתונים. מומלץ ליצור איתנו קשר ולבקש הוספת הברוקר למערכת, [קישור]." — [קישור] = ערך מ-SSOT.

---

## 5. SSOT DB / API — חובה

| דרישה | פירוט |
|--------|--------|
| **קשר Account ↔ Fees** | בכל רשומת עמלה חייב להיות **trading_account_id** (או מיפוי מוכר). עמלות משויכות לחשבון. |
| **אין broker כ-FK בעמלות** | לא להשאיר "broker" כ־foreign key / בעלים של עמלות. ברוקר נגזר מחשבון המסחר. |
| **קונטקסט קוד קיים** | ה-DB כרגע מחזיק טבלת brokers_fees עם broker ו-user_id בלבד (ללא account FK). **זה לא תואם את ההחלטה. חובה תיקון עומק.** |

---

## 6. Acceptance Criteria (חובה)

- [ ] **D18** מציג עמלות **לפי חשבון מסחר בלבד** (בחירת חשבון + עמלות של החשבון).
- [ ] בכל פעולה של עמלה יש **trading_account_id**.
- [ ] **Broker** נשמר ברמת חשבון בלבד (לא ברמת עמלה).
- [ ] **"Other broker"** משויך לבחירת ברוקר ב-**D16** בלבד.
- [ ] אין מקום במערכת שבו "broker = owner of fees".

---

## 7. תוכנית ביצוע (סיכום) + חלוקת משימות

| שלב | צוות | משימה |
|-----|------|--------|
| 1 | Team 10 | עדכון מסמכים; החזרת תוכנית לאישור; **לא להוציא משימות עד לאישור**. |
| 2 | Team 20 | הרחבת GET /api/v1/reference/brokers (display_name, is_supported, default_fees). **DB/API: עמלות לפי חשבון — trading_account_id; הסרת broker כ-FK בעמלות; תיקון עומק.** |
| 3 | Team 30 | D16: Conditional Rendering "אחר" + הודעת משילות (בחירת ברוקר בלבד). |
| 4 | Team 30 | D18: UI — בחירת חשבון מסחר + עמלות של החשבון (כל פעולה עם trading_account_id); אופציונלי: הצעת מילוי מ-default_fees לפי ברוקר של החשבון. |
| 5 | Team 10 | וידוא Acceptance Criteria ועדכון Index. |

---

## 8. SSOT — פריט "אחר" (נעול)

**החלטה:** "אחר" **מגיע מה-API** (defaults_brokers.json) כרשומה עם:
- `value`: **`"other"`** (ערך קבוע)
- `display_name` / label: **"אחר"** (או מקביל)
- `is_supported`: **`false`** (לחסימת ייבוא/API)

Frontend משתמש באותה רשומה; אין הוספת "אחר" רק ב-FE. אין שאלות פתוחות במסמך final.

---

## 9. רפרנסים

- **תוכנית עבודה מלאה:** [TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md](./TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md)
- **מנדט Team 20:** [TEAM_10_TO_TEAM_20_ADR_015_BROKER_REFERENCE_MANDATE.md](./TEAM_10_TO_TEAM_20_ADR_015_BROKER_REFERENCE_MANDATE.md)
- **מנדט Team 30:** [TEAM_10_TO_TEAM_30_ADR_015_BROKER_REFERENCE_MANDATE.md](./TEAM_10_TO_TEAM_30_ADR_015_BROKER_REFERENCE_MANDATE.md)
- **SSOT DDL (Account→Fees):** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` — טבלת `user_data.brokers_fees` עם `trading_account_id`, ללא `broker`.
- **SSOT הודעת משילות:** `documentation/06-ENGINEERING/ADR_015_GOVERNANCE_MESSAGE_SSOT.md`

---

**Team 10 (The Gateway)**  
**log_entry | ADR_015 | FINAL_UPDATED_FEES_PER_ACCOUNT | 2026-02-12**

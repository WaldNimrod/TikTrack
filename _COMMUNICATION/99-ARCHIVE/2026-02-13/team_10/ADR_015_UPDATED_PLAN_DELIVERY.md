# ADR-015 — החזרת תוכנית מעודכנת וחלוקת משימות (לא להוציא עד לאישור)

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-12  
**נושא:** דיוק תוכנית העבודה — עמלות לפי חשבון מסחר (לא לפי ברוקר).

---

## מה בוצע

בהתאם להחלטה שאושרה (עמלות שייכות לחשבון מסחר; D18 = עמלות לכל חשבון; "אחר" רק ב-D16; תיקון עומק DB), עודכנו המסמכים הבאים:

| מסמך | עדכון |
|------|--------|
| **ADR_015_FINAL_FOR_ARCHITECT_APPROVAL.md** | הגדרת ישות: Fees per Trading Account; הסרת ניסוחים "עמלות תחת ברוקר"; "אחר" — broker selection (D16) בלבד; Acceptance Criteria; SSOT DB (trading_account_id; אין broker כ-FK). |
| **TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md** | D18 = Fees per Account; D16 = Broker selection + Account creation; עקרונות נעולים; סדר ביצוע + חלוקת משימות. |
| **TEAM_10_TO_TEAM_20_ADR_015_BROKER_REFERENCE_MANDATE.md** | הדגשה: fees קשורות לחשבון; חובה trading_account_id; הסרת broker כ-FK; תיקון עומק. |
| **TEAM_10_TO_TEAM_30_ADR_015_BROKER_REFERENCE_MANDATE.md** | D18 UI: בחירת חשבון + עמלות של החשבון; "אחר" ב-D16 בלבד; Acceptance Criteria. |

---

## חלוקת משימות מדויקת (לאחר אישור)

### Team 20
- הרחבת GET /api/v1/reference/brokers (display_name, is_supported, default_fees); קובץ ברוקרים (IBKR + 3 עמלות דוגמה).
- **DB/API:** עמלות לפי חשבון — trading_account_id בכל רשומת עמלה; הסרת broker כ-FK בעמלות; תיקון עומק (טבלה נוכחית brokers_fees ללא account FK לא תואמת).

### Team 30
- **D16:** Conditional Rendering "אחר" + הודעת משילות (בחירת ברוקר בלבד).
- **D18:** UI — בחירת חשבון מסחר + עמלות של החשבון (כל פעולה עם trading_account_id); אופציונלי: הצעת מילוי מ-default_fees לפי ברוקר החשבון.

---

## Acceptance Criteria (חובה)

- D18 מציג עמלות לפי חשבון מסחר בלבד.
- בכל פעולה של עמלה יש trading_account_id.
- Broker נשמר ברמת חשבון בלבד.
- "Other broker" משויך ל-D16 בלבד.
- אין מקום שבו "broker = owner of fees".

---

## הוראה

**לא להוציא למשימות את צוותים 20/30 עד שהתוכנית המעודכנת מאושרת.**

לאחר אישור האדריכלית — Team 10 תעביר את המנדטים המעודכנים לצוותים.

---

**Team 10 (The Gateway)**  
**log_entry | ADR_015 | UPDATED_PLAN_DELIVERY | 2026-02-12**

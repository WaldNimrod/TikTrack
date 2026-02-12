# Evidence Log — ADR-015 Broker Reference Activation

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-12  
**נושא:** סבב פיתוח — מנדט רפרנס ברוקרים ועמלות ברירת מחדל (ADR-015)  
**סטטוס:** תוכנית עבודה והודעות צוותים הוכנו | שאלות השלמה לאדריכלית נשלחו

---

## 1. מקור

- **מנדט:** ARCHITECT_BROKER_REFERENCE_MANDATE.md (ADR-015)  
- **תיקייה:** `_COMMUNICATION/90_Architects_comunication/` (מסונכרן מ-Google Drive)  
- **PROMPTS FOR THE FIELD:** Team 10, 20, 30 — הועברו כמנדטים מסודרים.

---

## 2. בוצע על ידי Team 10

| פעולה | קובץ / מיקום |
|--------|----------------|
| תוכנית עבודה (סדר ביצוע, תלויות) | `_COMMUNICATION/team_10/TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md` |
| שאלות השלמה לאדריכלית (פילטר — ללא ניחושים) | `_COMMUNICATION/team_10/TEAM_10_TO_ARCHITECT_ADR_015_COMPLETION_QUESTIONS.md` |
| מנדט ל-Team 20 (Endpoint + JSON ברוקרים) | `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_ADR_015_BROKER_REFERENCE_MANDATE.md` |
| מנדט ל-Team 30 (Conditional Rendering + Auto-fill) | `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_ADR_015_BROKER_REFERENCE_MANDATE.md` |
| מסמך סופי לאישור אדריכלית | `_COMMUNICATION/team_10/ADR_015_FINAL_FOR_ARCHITECT_APPROVAL.md` |

---

## 3. הבהרות (מאושרות)

- **עמודים:** D16 = חשבונות מסחר (trading_accounts.html), D18 = עמלות ברוקרים (brokers_fees.html). Auto-fill ב-D18.
- **default_fees:** מבנה כ־brokers_fees (commission_type, commission_value, minimum); ברוקר אחד לבדיקה — IBKR + 3 עמלות דוגמה.
- **הודעה:** טקסט מאושר עם פлей스홀דר לקישור למייל מנהל ראשי (ראה תוכנית/מנדטים).

**שאלה פתוחה לאדריכלית:** פריט "אחר" — מה-API או רק Frontend? (מסמך סופי: ADR_015_FINAL_FOR_ARCHITECT_APPROVAL.md)

---

## 4. סדר ביצוע (מתוך תוכנית העבודה)

1. Team 10 — העברת מנדט + שאלות לאדריכלית ✅  
2. Team 20 — הרחבת GET /api/v1/reference/brokers + קובץ ברוקרים עם default_fees  
3. Team 30 — Conditional Rendering "אחר" + הודעת משילות  
4. Team 30 — Auto-fill עמלות (תלוי ב-20 + בהבהרת מיקום)  
5. Team 10 — וידוא השלמה ועדכון Index

---

**log_entry | TEAM_10 | ADR_015_EVIDENCE | 2026-02-12**

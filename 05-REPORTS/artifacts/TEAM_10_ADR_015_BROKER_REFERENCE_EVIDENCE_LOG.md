# Evidence Log — ADR-015 Broker Reference Activation

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-12  
**נושא:** סבב פיתוח — מנדט רפרנס ברוקרים (ADR-015) | **עמלות לפי חשבון מסחר**  
**סטטוס:** READY FOR DISTRIBUTION — חסימות SSOT נסגרו (DDL, Other, הודעת משילות); ניתן להוציא מנדטים ל-20/30

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

## 3. החלטה אדריכלית (עמלות לפי חשבון)

- **עמלות שייכות לחשבון מסחר (Trading Account), לא לברוקר.** Broker = מטא-דאטה של חשבון.
- **D16** = חשבונות מסחר + בחירת ברוקר; "אחר" והודעת משילות — **ב-D16 בלבד**.
- **D18** = **עמלות לכל חשבון מסחר** — בחירת חשבון + עמלות של החשבון (trading_account_id).
- **DB/API:** חובה trading_account_id בעמלות; אין broker כ-FK בעמלות. תיקון עומק נדרש (טבלה נוכחית brokers_fees ללא account FK).
- **חסימות SSOT נסגרו (2026-02-12):** (1) DDL — trading_account_id ב-brokers_fees, הסרת broker. (2) "אחר" — מגיע מה-API, value "other", is_supported false. (3) הודעת משילות — SSOT ב-ADR_015_GOVERNANCE_MESSAGE_SSOT.md. (4) **סבב 2:** commission_value NUMERIC(20,6) ב-DDL + הפניה ל-TEAM_10_COMMISSION_VALUE_NUMERIC_DECISIONS.md. (5) מיגרציה Account↔Fees — סעיף מפורש בתוכנית §6א ובמנדט Team 20 §2.3. **READY FOR DISTRIBUTION.**

---

## 4. סדר ביצוע (מעודכן — Fees per Account)

1. Team 10 — עדכון מסמכים; החזרת תוכנית לאישור; **אין הוצאת משימות עד לאישור**.  
2. Team 20 — הרחבת GET /reference/brokers + **DB/API עמלות לפי חשבון (trading_account_id; הסרת broker כ-FK)**  
3. Team 30 — D16: "אחר" + הודעת משילות (בחירת ברוקר בלבד)  
4. Team 30 — D18: בחירת חשבון + עמלות של החשבון (trading_account_id)  
5. Team 10 — וידוא Acceptance Criteria ועדכון Index

---

**log_entry | TEAM_10 | ADR_015_EVIDENCE | 2026-02-12**

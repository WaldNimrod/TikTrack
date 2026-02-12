# Team 50 → Team 10: אימוץ הקשר ADR-015 — סבב פיתוח חדש

**מאת:** Team 50 (QA)  
**אל:** Team 10 (The Gateway)  
**תאריך:** 2026-02-12  
**מקור:** `ADR_015_DISTRIBUTION_PACKAGE.md`, `TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md`

---

## 1. הקשר שנלמד

| מסמך | עיקרי תוכן |
|------|-------------|
| **ADR_015_DISTRIBUTION_PACKAGE** | חבילת הפצה — **20, 30, 60** (Team 50 לא ברשימת היישום) |
| **TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN** | עמלות לפי חשבון מסחר; D16 "אחר" + הודעה; D18 בחירת חשבון + עמלות; מיגרציה 20↔60 |
| **ADR_015_FINAL_FOR_ARCHITECT_APPROVAL** | Acceptance Criteria §6, פריט "אחר" מה-API |

**עקרונות ADR-015 (מעקב):**
- **Trading Account → Fees** (one-to-many)
- **אין broker כ-FK בעמלות** — הסרת broker, הוספת trading_account_id
- **D16:** בחירת ברוקר; "אחר" + הודעת משילות
- **D18:** בחירת חשבון מסחר + עמלות של החשבון (כל פעולה עם trading_account_id)

---

## 2. תפקיד Team 50

לפי **TEAM_50_QA_WORKFLOW_PROTOCOL:** QA מתבצע רק אחרי ש-Team 10 אישר השלמה ומסר קונטקסט מפורט.

**סטטוס נוכחי:** Team 50 לא ברשימת היישום — תפקידנו הוא **אימות** לאחר סיום 20/30/60.

---

## 3. תוכנית מוכנות — Checklist לאימות (להפעלה בעת handoff)

עם קבלת **מנדט/קונטקסט QA** מ-Team 10 (לאחר סיום 20/30/60):

| # | Acceptance Criteria | אופן אימות |
|---|---------------------|------------|
| 1 | D18 מציג עמלות לפי חשבון מסחר בלבד | E2E: D18 — בחירת חשבון, עמלות מסוננות לפי חשבון |
| 2 | בכל פעולת עמלה יש trading_account_id | API/Network: payload ליצירה/עדכון כולל trading_account_id |
| 3 | Broker נשמר ברמת חשבון בלבד | קוד/API: אין broker ברמת עמלה |
| 4 | "אחר" + הודעת משילות — D16 בלבד | E2E: D16 — בחירת "אחר" → הודעת משילות; D18 — אין "אחר" |
| 5 | אין מקום שבו broker = owner of fees | סריקת UI/API |

---

## 4. שאלת השלמה ל-Team 10

**נדרש:** מנדט QA מפורש (`TEAM_10_TO_TEAM_50_*`) **במועד** שבו 20/30/60 מסיימים יישום — עם:
- scope בדיקה (עמודים, API, תרחישים)
- קישור ל-SSOT מעודכן
- תוצר מצופה (דוח, Evidence)

**שאלה:** האם Team 10 יספק מנדט QA נפרד (כמו Gate A/B) או שמנדט יתווסף למסמך קיים (למשל WORK_PLAN §5)?

---

**Team 50 (QA & Fidelity)**  
*log_entry | ADR_015 | CONTEXT_ACKNOWLEDGED | 2026-02-12*

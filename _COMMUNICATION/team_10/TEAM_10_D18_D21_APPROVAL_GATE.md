# Team 10: שער אישור D18/D21 — חסימה עד רפקטור עמלות (ADR-014/ADR-017)

**id:** `TEAM_10_D18_D21_APPROVAL_GATE`  
**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-13  
**מקור:** BATCH_2_5_COMPLETIONS_MANDATE.md (ADR-017 §2)

---

## 1. כלל חסימה

**אין לאשר** עמודי D18 (Brokers Fees) ו-D21 (Cash Flows) **ללא** רפקטור נתונים מלא — מעבר לטבלת `trading_account_fees` (ADR-014).

---

## 2. תנאי להסרת חסימה

- **Team 20 + Team 60:** סיום מעבר לטבלת `trading_account_fees`; Data Migration Plan מתועד ומאושר.
- **Team 10:** וידוא קבלת תוכנית מיגרציה והשלמת מימוש לפני אישור D18/D21.

---

## 3. סטטוס

**חסימה פעילה** — עד להשלמת רפקטור עמלות, D18/D21 לא יאושרו כ־COMPLETE באישור רשמי מ־Team 10.

---

**log_entry | TEAM_10 | D18_D21_APPROVAL_GATE | LOCKED_UNTIL_FEES_REFACTOR | 2026-02-13**

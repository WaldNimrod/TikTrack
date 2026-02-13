# 🚀 פקודת אדריכל: ביצוע פייז 2.0 והטמעת שער קידום (Promotion Gate)

**סטטוס:** 🟢 **ACTIVE** | **תאריך:** 2026-02-06
**סימוכין:** SPY_FINAL_GREEN | BATCH_2_PLAN_V1.1

### 🏆 1. אישור שחרור (Green Light)
בעקבות עמידה ב-100% מדרישות המשילות, אנו פותחים את הפיתוח עבור:
- **Brokers Fees (D18):** מימוש API ו-UI.
- **Cash Flows (D21):** מימוש API ו-UI.

### 🏛️ 2. נוהל ה-Promotion Gate (חדש ומחייב)
בסיום כל באץ' מאושר, יופעל "שער קידום":
1. **זיקוק:** צוות 10 יסרוק את תיקיות ה-Sandbox ב-Communication.
2. **קידום:** מסמכים מהותיים (Field Maps, ADRs) יועברו לתיקיית `documentation/`.
3. **ארכוב:** כל שאר חומרי התיאום יועברו ל-`99-ARCHIVE/`.
4. **חתימה:** פתיחת הבאץ' הבא מותנית ב"דיסק נקי" ב-Communication.

### 🛠️ 3. יישור קו טכני סופי
- **Transformers:** שימוש אך ורק ב-`ui/src/cubes/shared/utils/transformers.js`.
- **Naming:** שמות שדות ביחיד (`user_id`), ישויות ברבים (`trades`).

---
**log_entry | [Architect] | PHASE_2_ACTIVE | PROMOTION_GATE_LOCKED | GREEN | 2026-02-06**
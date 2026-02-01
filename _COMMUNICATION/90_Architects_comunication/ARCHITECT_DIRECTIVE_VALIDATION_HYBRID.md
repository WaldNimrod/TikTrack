# 📡 הודעה: אדריכלית ראשית ← צוות 10 (Validation Conflict Resolution)

**From:** Chief Architect (Gemini)
**To:** Team 10 (The Gateway)
**Date:** 2026-02-01
**Session:** SESSION_01 - Phase 1.5
**Subject:** VALIDATION_HYBRID_DECISION | Status: 🛡️ **MANDATORY**
**Priority:** 🔴 **CRITICAL - ARCHITECTURAL RESOLUTION**

---

## 📢 החלטה אדריכלית: מודל ולידציה היברידי (v1.2)

בעקבות ניתוח צוות 10, הוחלט לאמץ את **האפשרות ההיברידית** כדי לגשר על הפער בין ה-OpenAPI הקיים לחזון ה-Contract-First:

### 1. טיפול בשגיאות (The Hybrid Error Protocol)
* **Backend:** נשמור על שדה ה-`detail` כפי שמוגדר ב-OpenAPI (עבור Pydantic errors).
* **שדרוג:** צוות 20 יוסיף שדה אופציונלי `error_code` לכל תגובת שגיאה.
* **Frontend:** המערכת תיתן עדיפות ל-`error_code`. אם אינו קיים, תשתמש ב-`detail` ותבצע טרנספורמציה דרך מילון מרכזי.

### 2. הקמת PhoenixSchema (The Logic Layer)
* **החלטה:** PhoenixSchema אינו קובץ קיים, אלא **דרישה חדשה**.
* **מימוש:** צוות 30 יקים תיקיית `src/logic/schemas/`. שם ירוכזו כל חוקי הולידציה (למשל `userSchema.js`).
* **חובה:** רכיבי ה-UI (Input) לא יכילו לוגיקת בדיקה. הם רק יקבלו "מצב" (Error State) מה-Schema.

### 3. ולידציה צד-שרת (Security Integrity)
* ולידציה צד-שרת היא **חובה** לכל שדה. היא נועדה לאבטחה ושלמות נתונים.
* ולידציה צד-לקוח היא **UX בלבד**. ה-Frontend לעולם לא קובע את "האמת", רק משקף אותה מהר למשתמש.

---

**log_entry | [Architect] | VALIDATION_HYBRID | TO_TEAM_10 | GREEN | 2026-02-01**
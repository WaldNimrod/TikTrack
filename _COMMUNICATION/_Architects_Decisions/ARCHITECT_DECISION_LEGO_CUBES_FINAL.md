# 📡 הודעה: אדריכלית ראשית ← צוות 10 (Final Architectural Decisions - Cubes, Fluidity & Governance)
**project_domain:** TIKTRACK

**From:** Chief Architect (Gemini)
**To:** Team 10 (Gateway), Team 30 (Frontend), Team 40 (Design)
**Date:** 2026-02-02
**Session:** SESSION_01 - Phase 1.6
**Subject:** FINAL_GOVERNANCE_LOCK | Status: 🛡️ **MANDATORY**
**Priority:** 🔴 **CRITICAL - EXECUTION AUTHORIZATION**

---

## 📢 פסיקת האדריכל: נעילה ארכיטקטונית כוללת (v2.0)

צוות 10, להלן הסטנדרט המחייב לכל עבודת ה-Refactor והפיתוח העתידי. כל חריגה תגרור פסילת G-Bridge מיידית:

### 1. מבנה התיקיות והיררכיית Cubes 🔴
* **אומץ המודל ההיברידי:**
    - `src/components/core/`: רכיבים "טיפשים" (Button, Input, Spinner) - ללא לוגיקה עסקית.
    - `src/cubes/shared/`: רכיבים המשמשים יותר מקוביה אחת (PhoenixTable, Contexts, Transformers).
    - `src/cubes/{cube-name}/`: יחידות לוגיות עצמאיות (Identity, Financial).
* **מיקום רכיבים קיימים:** `PhoenixTable` ו-`PhoenixFilterContext` עוברים ל-`cubes/shared`.

### 2. רספונסיביות אוטומטית (Fluid Design Mandate) 📱
* **ללא קוד נפרד:** חל איסור על שימוש ב-Media Queries עבור גדלי פונטים וריווחים.
* **הנחיה טכנית:** שימוש בלעדי ב-`clamp()`, `min()`, ו-`max()`.
* **Layout:** שימוש ב-Grid עם `auto-fit` / `auto-fill` כדי שהמערכת תתאים עצמה לכל מסך דינמית.

### 3. אסטרטגיית Design Tokens 🔴
* **SSOT:** קובץ `phoenix-base.css` הוא מקור האמת היחיד.
* **Cleanup:** קבצי ה-JSON מבוטלים ברמת הקוד. יש להסיר את `design-tokens.css` מהפרויקט.

### 4. משמעת סקריפטים (The Clean Slate Rule) 🔴
* **איסור מוחלט:** אין לכתוב תגי `<script>` בתוך קבצי HTML או JSX.
* **רטרואקטיביות:** כל עמודי ה-Auth הקיימים חייבים לעבור Refactor להוצאת הלוגיקה לקבצים חיצוניים.

---

**log_entry | [Architect] | FINAL_GOVERNANCE_LOCK | TO_TEAM_10 | GREEN | 2026-02-02**
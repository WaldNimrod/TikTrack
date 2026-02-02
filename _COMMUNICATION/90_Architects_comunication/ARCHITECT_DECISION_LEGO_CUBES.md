# 📡 הודעה: אדריכלית ראשית ← צוות 10 (Architectural Decisions - Cubes & Fluidity)

**From:** Chief Architect (Gemini)
**To:** Team 10 (Gateway), Team 30 (Frontend), Team 40 (Design)
**Date:** 2026-02-02
**Session:** SESSION_01 - Phase 1.6
**Subject:** LEGO_CUBES_ARCHITECTURE_LOCK | Status: 🛡️ **MANDATORY**
**Priority:** 🔴 **CRITICAL - BLOCKING REMOVAL**

---

## 📢 פסיקת האדריכל: נעילת ארכיטקטורת קוביות ורספונסיביות (V2)

צוות 10, להלן ההחלטות הסופיות. יש להטמיע את עקרונות ה-Fluid Design באופן רוחבי:

### 1. מבנה התיקיות (The Cube Map)
* **אומץ מודל היברידי:**
    - `src/components/core` (גנרי בלבד).
    - `src/cubes/shared` (לוגיקה משותפת כמו PhoenixTable).
    - `src/cubes/{name}` (ספציפי לקוביה).
* **פעולה:** העברת ה-Components הקיימים לתיקיות ה-Shared בתוך ה-Cubes.

### 2. רספונסיביות אוטומטית (Fluid Design Mandate) 📱
* **ללא קוד נפרד:** חל איסור על כתיבת קבצי CSS נפרדים למובייל. 
* **טכנולוגיה:** שימוש ב-`clamp()`, `min()`, ו-`max()` עבור גדלי פונטים וריווחים.
* **Layout:** שימוש ב-Flexbox ו-Grid עם `auto-fit` ו-`auto-fill` כדי שהתוכן יזרום טבעית לפי רוחב המסך.
* **Viewports:** הגדרת רוחב מינימלי לרכיבי LEGO (כמו טבלאות) עם Horizontal Scroll פנימי, במקום שבירת מבנה.

### 3. משילות CSS ו-Tokens
* **SSOT:** קובץ `phoenix-base.css` הוא מקור האמת היחיד.
* **Cleanup:** אישור מחיקת `auth.css` ו-`design-tokens.css`.

### 4. משמעת סקריפטים (No-Inline Rule)
* חל איסור מוחלט על `<script>` בתוך HTML/JSX. 

---

**log_entry | [Architect] | CUBES_RESPONSIVE_LOCK | TO_TEAM_10 | GREEN | 2026-02-02**
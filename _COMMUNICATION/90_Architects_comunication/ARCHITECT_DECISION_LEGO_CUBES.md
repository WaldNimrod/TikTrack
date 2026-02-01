# 📡 הודעה: אדריכלית ראשית ← צוות 10 (Architectural Decisions - Cubes)

**From:** Chief Architect (Gemini)
**To:** Team 10 (Gateway), Team 30 (Frontend), Team 40 (Design)
**Date:** 2026-02-01
**Session:** SESSION_01 - Phase 1.6
**Subject:** LEGO_CUBES_ARCHITECTURE_LOCK | Status: 🛡️ **MANDATORY**
**Priority:** 🔴 **CRITICAL - BLOCKING REMOVAL**

---

## 📢 פסיקת האדריכל: נעילת ארכיטקטורת קוביות (V2)

צוות 10, להלן ההחלטות הסופיות לשאלות החוסמות. יש לעדכן את תוכנית העבודה בהתאם:

### 1. מבנה התיקיות (The Cube Map)
* **אומץ מודל היברידי:** - `src/components/core` (גנרי בלבד).
    - `src/cubes/shared` (לוגיקה משותפת כמו PhoenixTable).
    - `src/cubes/{name}` (ספציפי לקוביה).
* **פעולה:** העברת ה-Components הקיימים לתיקיות ה-Shared בתוך ה-Cubes.

### 2. משילות CSS ו-Tokens
* **SSOT:** קובץ `phoenix-base.css` הוא מקור האמת היחיד לצבעים וריווחים.
* **JSON:** קבצי ה-JSON מבוטלים ברמת הקוד.
* **Cleanup:** אישור מחיקת `auth.css` ו-`design-tokens.css`.

### 3. משמעת סקריפטים (No-Inline Rule)
* חל איסור מוחלט על `<script>` בתוך HTML/JSX. 
* חובה להעביר את כל הלוגיקה של עמודי ה-Auth הקיימים לקבצים חיצוניים.

---

**log_entry | [Architect] | CUBES_LOCK | TO_TEAM_10 | GREEN | 2026-02-01**
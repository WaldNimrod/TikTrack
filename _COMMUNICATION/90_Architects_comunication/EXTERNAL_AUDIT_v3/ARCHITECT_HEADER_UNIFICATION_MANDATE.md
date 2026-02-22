# 🔒 מנדט אדריכל: איחוד תשתיות ו-Shared Layer (Phase 2)
**project_domain:** TIKTRACK

**מאת:** אדריכלית גשר (Gemini)
**אל:** צוות 10 (Gateway), צוות 30 (Frontend)
**נושא:** מעבר למודל Core + Config למניעת כפילויות
**סטטוס:** 🔒 **LOCKED & MANDATORY**

### 🧩 1. איחוד לוגיקת ראש הדף (HeaderHandlers)
בהתאם להמלצת צוות 90 (Option A), אנו עוברים למקור אמת יחיד לניהול התפריט והפילטרים:
* **קובץ הליבה:** `ui/src/components/core/phoenixHeaderHandlersBase.js` - מכיל את כל לוגיקת ה-Events וה-Bridge.
* **קבצי קונפיגורציה:** כל עמוד (D18, D21) יחזיק קובץ קטן בשם `pageHeaderConfig.js` בלבד.

### 🏗️ 2. הרחבת השכבה המשותפת (The Shared Core)
כדי למנוע שגיאות נתונים ב-Phase 2, חובה לייצר את הנכסים המשותפים הבאים:
1. **BaseDataLoader:** מחלקת אב שתנהל Fetching, Token Masking, וקריאה אוטומטית ל-Transformers.
2. **BaseApiService:** ניהול מרכזי של שגיאות (Error Codes) ו-Retries.
3. **StickyGridStyles:** הגדרה גלובלית ב-Base CSS עבור עמודות דביקות בטבלאות פיננסיות.

### 📂 3. מפת התיקיות המעודכנת (SSOT)
- `ui/src/components/core/`: תשתיות טכניות (Bridge, Base Handlers).
- `ui/src/cubes/shared/utils/`: לוגיקה עסקית משותפת (Transformers, DataLoaders).
- `ui/src/shared/`: קונפיגורציות ו-Routes.

---
**log_entry | [Architect] | SHARED_LAYER_UNIFIED | CORE_CONFIG_ACTIVE | GREEN | 2026-02-06**
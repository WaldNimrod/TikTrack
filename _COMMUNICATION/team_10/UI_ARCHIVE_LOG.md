# לוג העברות לארכיון - תקיית UI

**תאריך:** 2026-02-04 20:22:32  
**מבצע:** AI Assistant

---

## סיכום העברות

| קטגוריה | כמות | מיקום |
|:--------|:-----|:------|
| Legacy Files | 3 | `99-ARCHIVE/ui/legacy/` |
| Duplicate Files | 2 | `99-ARCHIVE/ui/duplicate/` |
| **סה"כ** | **5** | |

---

## רשימת העברות

### 1. Legacy Files (3 קבצים)

#### `global_page_template.jsx`
- **מקור:** `ui/src/layout/global_page_template.jsx`
- **יעד:** `99-ARCHIVE/ui/legacy/layout/global_page_template.jsx`
- **סיבה:** כפילות עם `unified-header.html` - לא בשימוש
- **תאריך:** 2026-02-04 20:22:32
- **סטטוס:** ✅ הועבר

#### `blueprint-diff-report-fix-suggestions.json`
- **מקור:** `ui/src/cubes/identity/components/auth/blueprint-diff-report-fix-suggestions.json`
- **יעד:** `99-ARCHIVE/ui/legacy/components/auth/blueprint-diff-report-fix-suggestions.json`
- **סיבה:** דוח diff - לא נדרש בקוד פעיל
- **תאריך:** 2026-02-04 20:22:32
- **סטטוס:** ✅ הועבר

#### `blueprint-diff-report.json`
- **מקור:** `ui/src/cubes/identity/components/auth/blueprint-diff-report.json`
- **יעד:** `99-ARCHIVE/ui/legacy/components/auth/blueprint-diff-report.json`
- **סיבה:** דוח diff - לא נדרש בקוד פעיל
- **תאריך:** 2026-02-04 20:22:32
- **סטטוס:** ✅ הועבר

---

### 2. Duplicate Files (2 קבצים)

#### `user_profile.html`
- **מקור:** `ui/src/views/financial/user_profile.html`
- **יעד:** `99-ARCHIVE/ui/duplicate/views/financial/user_profile.html`
- **סיבה:** כפילות עם `ProfileView.jsx` (React component)
- **החלטה:** להשאיר את `ProfileView.jsx` ולהעביר את ה-HTML לארכיון
- **Route שהוסר:** `/user_profile` מ-vite.config.js
- **תאריך:** 2026-02-04 20:22:32
- **סטטוס:** ✅ הועבר

#### `userProfile.js`
- **מקור:** `ui/src/views/financial/userProfile.js` (לאחר שינוי שם)
- **יעד:** `99-ARCHIVE/ui/duplicate/views/financial/userProfile.js`
- **סיבה:** JavaScript handler ל-`user_profile.html` שהועבר לארכיון
- **תאריך:** 2026-02-04 20:22:32
- **סטטוס:** ✅ הועבר

---

## שינויים נלווים

### קבצים שעודכנו:

1. **`ui/vite.config.js`**
   - הוסר route `/user_profile` מ-`routeToHtmlMap`
   - נוספה הערה: "Archived - using ProfileView.jsx instead"

---

## בדיקות נדרשות

- [ ] וידוא ש-`ProfileView.jsx` עובד ב-`/profile`
- [ ] וידוא שאין references ל-`user_profile.html` בקוד
- [ ] וידוא שאין references ל-`userProfile.js` בקוד
- [ ] וידוא שאין references ל-`global_page_template.jsx` בקוד

---

**תאריך:** 2026-02-04 20:22:32  
**מבצע:** AI Assistant

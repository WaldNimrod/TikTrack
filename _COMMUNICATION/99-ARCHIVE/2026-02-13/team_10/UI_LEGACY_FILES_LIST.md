# רשימת קבצים לגסי/מיותרים - תקיית UI

**תאריך:** 2026-02-04 20:22:32  
**מבצע:** AI Assistant  
**סטטוס:** ⚠️ לבדיקה והעברה לארכיון

---

## קבצים לגסי/מיותרים (להעביר לארכיון)

### 1. קבצים עם כפילות

#### כפילות Header:
| נתיב | סוג | גודל | Git | הערה |
|:-----|:----|:-----|:----|:-----|
| `ui/src/layout/global_page_template.jsx` | JSX | 8.8K | ✅ | ⚠️ כפילות עם `unified-header.html` - לא בשימוש |

**ניתוח:**
- הקובץ מכיל `TtHeader` ו-`TtGlobalFilter` - כפילות עם `unified-header.html`
- לא נמצא שימוש בקובץ זה בקוד
- רק מוזכר בהערה ב-CSS
- **המלצה:** להעביר לארכיון

---

### 2. קבצי Blueprint Diff Reports (JSON)

| נתיב | סוג | גודל | Git | הערה |
|:-----|:----|:-----|:----|:-----|
| `ui/src/cubes/identity/components/auth/blueprint-diff-report-fix-suggestions.json` | JSON | 10K | ✅ | דוח diff - לא נדרש בקוד פעיל |
| `ui/src/cubes/identity/components/auth/blueprint-diff-report.json` | JSON | 16K | ✅ | דוח diff - לא נדרש בקוד פעיל |

**ניתוח:**
- קבצי דוחות diff מ-blueprint comparison
- לא נדרשים לריצת האפליקציה
- **המלצה:** להעביר לארכיון

---

### 3. כפילות User Profile

| נתיב | סוג | גודל | Git | Route | הערה |
|:-----|:----|:-----|:----|:------|:-----|
| `ui/src/views/financial/user_profile.html` | HTML | 22K | ✅ | `/user_profile` | ⚠️ כפילות עם `ProfileView.jsx` |

**ניתוח:**
- יש שני עמודים לאותו מטרה:
  - `ProfileView.jsx` - React component ב-`/profile`
  - `user_profile.html` - HTML page ב-`/user_profile`
- שני העמודים פעילים (HTML דרך Vite config)
- **המלצה:** להחליט איזה גרסה פעילה ולהעביר את השנייה לארכיון

---

## סיכום קבצים לגסי/מיותרים

| קטגוריה | כמות | הערה |
|:--------|:-----|:-----|
| כפילות Header | 1 | `global_page_template.jsx` |
| Blueprint Reports | 2 | JSON files |
| כפילות Profile | 1 | `user_profile.html` (לבדיקה) |
| **סה"כ** | **4** | |

---

## המלצות

### קבצים להעברה מיידית לארכיון:
1. ✅ `ui/src/layout/global_page_template.jsx` - כפילות עם UnifiedHeader
2. ✅ `ui/src/cubes/identity/components/auth/blueprint-diff-report-fix-suggestions.json` - דוח diff
3. ✅ `ui/src/cubes/identity/components/auth/blueprint-diff-report.json` - דוח diff

### קבצים שדורשים החלטה:
1. ⚠️ `ui/src/views/financial/user_profile.html` - כפילות עם `ProfileView.jsx`
   - **אפשרות 1:** להשאיר את `ProfileView.jsx` ולהעביר `user_profile.html` לארכיון
   - **אפשרות 2:** להשאיר את `user_profile.html` ולהעביר `ProfileView.jsx` לארכיון
   - **המלצה:** להשאיר את `ProfileView.jsx` (React component) ולהעביר `user_profile.html` לארכיון

---

## מבנה הארכיון המוצע

```
99-ARCHIVE/ui/
├── legacy/
│   ├── layout/
│   │   └── global_page_template.jsx
│   └── components/
│       └── auth/
│           ├── blueprint-diff-report-fix-suggestions.json
│           └── blueprint-diff-report.json
└── duplicate/
    └── views/
        └── financial/
            └── user_profile.html
```

---

**תאריך:** 2026-02-04 20:22:32  
**מבצע:** AI Assistant

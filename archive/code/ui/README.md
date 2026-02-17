# ארכיון תקיית UI

**תאריך יצירה:** 2026-02-04 20:22:32  
**מבצע:** AI Assistant  
**מטרה:** אחסון קבצים לגסי/מיותרים/כפולים

---

## מבנה הארכיון

```
99-ARCHIVE/ui/
├── legacy/          # קבצים לגסי שלא בשימוש
│   ├── layout/
│   │   └── global_page_template.jsx
│   └── components/
│       └── auth/
│           ├── blueprint-diff-report-fix-suggestions.json
│           └── blueprint-diff-report.json
└── duplicate/       # קבצים כפולים
    └── views/
        └── financial/
            ├── user_profile.html
            └── userProfile.js
```

---

## קבצים בארכיון

### Legacy Files (3 קבצים):

1. **`legacy/layout/global_page_template.jsx`**
   - **סיבה:** כפילות עם `unified-header.html`
   - **תאריך העברה:** 2026-02-04
   - **הערה:** לא בשימוש - כפילות עם UnifiedHeader

2. **`legacy/components/auth/blueprint-diff-report-fix-suggestions.json`**
   - **סיבה:** דוח diff - לא נדרש בקוד פעיל
   - **תאריך העברה:** 2026-02-04
   - **הערה:** דוח diff מ-blueprint comparison

3. **`legacy/components/auth/blueprint-diff-report.json`**
   - **סיבה:** דוח diff - לא נדרש בקוד פעיל
   - **תאריך העברה:** 2026-02-04
   - **הערה:** דוח diff מ-blueprint comparison

### Duplicate Files (2 קבצים):

1. **`duplicate/views/financial/user_profile.html`**
   - **סיבה:** כפילות עם `ProfileView.jsx` (React component)
   - **תאריך העברה:** 2026-02-04
   - **הערה:** הוחלט להשאיר את `ProfileView.jsx` ולהעביר את ה-HTML לארכיון
   - **Route שהוסר:** `/user_profile` (מ-vite.config.js)

2. **`duplicate/views/financial/userProfile.js`**
   - **סיבה:** JavaScript handler ל-`user_profile.html` שהועבר לארכיון
   - **תאריך העברה:** 2026-02-04
   - **הערה:** קשור ל-`user_profile.html`

---

## הוראות שחזור

אם יש צורך לחזור לקבצים בארכיון:

```bash
# שחזור קובץ לגסי
cp 99-ARCHIVE/ui/legacy/layout/global_page_template.jsx ui/src/layout/

# שחזור קבצי diff
cp 99-ARCHIVE/ui/legacy/components/auth/*.json ui/src/cubes/identity/components/auth/

# שחזור user_profile (לא מומלץ - יש כפילות)
cp 99-ARCHIVE/ui/duplicate/views/financial/user_profile.html ui/src/views/financial/
cp 99-ARCHIVE/ui/duplicate/views/financial/userProfile.js ui/src/views/financial/
```

---

## הערות

- כל הקבצים בארכיון הם קבצים שלא בשימוש או כפולים
- הקבצים נשמרים למקרה של צורך עתידי
- אין למחוק קבצים מהארכיון ללא אישור

---

**תאריך יצירה:** 2026-02-04 20:22:32  
**מבצע:** AI Assistant

# 🔧 תשתית עבודה V2 - Team 31 Blueprint

**תאריך:** 2026-02-02  
**מסמך בסיס:** TEAM_30_TO_TEAM_31_BLUEPRINT_WORK_GUIDELINES_V2.md  
**סטטוס:** ✅ **ACTIVE - ADOPTED AS MANDATORY**

---

## 📋 עקרונות יסוד

### **1. עבודה מבודדת (CRITICAL)**
- ✅ **כל העריכה רק בתוך תקיית הצוות:** `_COMMUNICATION/team_31/team_31_staging/`
- ✅ **אסור לערוך שום קובץ מחוץ לתקייה שלנו**
- ✅ **קישור לקבצים חיים:** מותר לקשר לקבצי הסגנונות והתמונות הפעילים במערכת
- ✅ **טעינה מבחוץ:** העבודה צריכה להישען ולטעון קבצים מבחוץ אבל כל עריכה או תוספת רק בתוך התקייה שלנו

### **2. קישור לקבצים הפעילים במערכת**
- ✅ **קבצי CSS חיים:** `ui/src/styles/` - קישור לקבצים האמיתיים במערכת
- ✅ **תמונות ואייקונים חיים:** `ui/public/images/` - קישור לקבצים האמיתיים במערכת
- ✅ **נתיבים יחסיים:** שימוש בנתיבים יחסיים (`../../../../ui/src/styles/phoenix-base.css`)

---

## 📐 מבנה עבודה

### **סביבת עבודה:**
```
_COMMUNICATION/team_31/team_31_staging/
├── sandbox_v2/                    # סביבת עבודה V2
│   ├── D16_ACCTS_VIEW.html        # בלופרינטים
│   ├── D15_INDEX.html             # בלופרינטים
│   └── ...
└── ...
```

### **קישור לקבצים חיים:**
```
ui/src/styles/                     # קבצי CSS חיים במערכת
├── phoenix-base.css
├── phoenix-components.css
├── phoenix-header.css
└── D15_DASHBOARD_STYLES.css

ui/public/images/                  # תמונות ואייקונים חיים במערכת
├── logo.svg
└── icons/
    └── entities/
        ├── home.svg
        ├── trades.svg
        └── ...
```

---

## 🔗 נתיבים יחסיים

### **מ-`sandbox_v2/` לקבצי CSS:**
```html
<!-- מיקום: _COMMUNICATION/team_31/team_31_staging/sandbox_v2/D16_ACCTS_VIEW.html -->
<!-- קבצי CSS: ui/src/styles/phoenix-base.css -->

<!-- נתיב יחסי: -->
<link rel="stylesheet" href="../../../../ui/src/styles/phoenix-base.css">
<link rel="stylesheet" href="../../../../ui/src/styles/phoenix-components.css">
<link rel="stylesheet" href="../../../../ui/src/styles/phoenix-header.css">
<link rel="stylesheet" href="../../../../ui/src/styles/D15_DASHBOARD_STYLES.css">
```

### **מ-`sandbox_v2/` לתמונות ואייקונים:**
```html
<!-- מיקום: _COMMUNICATION/team_31/team_31_staging/sandbox_v2/D16_ACCTS_VIEW.html -->
<!-- תמונות: ui/public/images/logo.svg -->

<!-- נתיב יחסי: -->
<img src="../../../../ui/public/images/logo.svg" alt="TikTrack Logo">
<img src="../../../../ui/public/images/icons/entities/home.svg" alt="בית">
```

---

## 📋 סדר טעינת CSS (CRITICAL - DO NOT CHANGE)

```html
<!-- CSS Loading Order (CRITICAL - DO NOT CHANGE): -->
<!-- 1. Pico CSS FIRST (Framework) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">

<!-- 2. Phoenix Base Styles (Global defaults & DNA variables) -->
<link rel="stylesheet" href="../../../../ui/src/styles/phoenix-base.css">

<!-- 3. LEGO Components (Reusable components) -->
<link rel="stylesheet" href="../../../../ui/src/styles/phoenix-components.css">

<!-- 4. Header Component (If header is used) -->
<link rel="stylesheet" href="../../../../ui/src/styles/phoenix-header.css">

<!-- 5. Page-Specific Styles (If needed) -->
<!-- Dashboard pages: -->
<link rel="stylesheet" href="../../../../ui/src/styles/D15_DASHBOARD_STYLES.css">
<!-- Auth pages: -->
<link rel="stylesheet" href="../../../../ui/src/styles/D15_IDENTITY_STYLES.css">
```

**⚠️ קריטי:** הסדר הוא קדוש - אין לחרוג ממנו!

---

## 🎯 מבנה HTML - תבנית V3 (חובה)

### **מבנה בסיסי:**
```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Page Title] | TikTrack Phoenix</title>
  
  <!-- CSS Loading Order (CRITICAL - DO NOT CHANGE): -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">
  <link rel="stylesheet" href="../../../../ui/src/styles/phoenix-base.css">
  <link rel="stylesheet" href="../../../../ui/src/styles/phoenix-components.css">
  <link rel="stylesheet" href="../../../../ui/src/styles/phoenix-header.css">
  <link rel="stylesheet" href="../../../../ui/src/styles/D15_DASHBOARD_STYLES.css">
</head>
<body class="index-page">
  
  <!-- Unified Header (if page uses header) -->
  <header id="unified-header">
    <!-- Header content -->
  </header>
  
  <!-- Page Content -->
  <div class="page-wrapper">
    <div class="page-container">
      <main>
        <tt-container>
          <!-- Sections -->
          <tt-section data-section="[section-name]">
            <!-- CRITICAL: tt-section is transparent. Background is on header and body separately -->
            
            <!-- Section Header - White card with background -->
            <div class="index-section__header">
              <!-- Header content -->
            </div>
            
            <!-- Section Body - White card with background -->
            <div class="index-section__body">
              <tt-section-row>
                <!-- Content -->
              </tt-section-row>
            </div>
          </tt-section>
        </tt-container>
      </main>
    </div>
  </div>
  
</body>
</html>
```

**⚠️ קריטי:** `tt-section` הוא **שקוף** - הרקע נמצא על header ו-body בנפרד!

---

## 📋 Checklist לפני מסירה

### **מבנה HTML**
- [ ] הבלופרינט משתמש בתבנית V3 המדויקת
- [ ] הבלופרינט מקשר לקבצי ה-CSS החיים במערכת (`ui/src/styles/`)
- [ ] הבלופרינט משתמש במחלקות הקיימות במערכת בלבד
- [ ] אין מחלקות חדשות אלא אם כן באמת נדרש
- [ ] מבנה DOM זהה בדיוק למה שצריך להיות ב-React Component
- [ ] `tt-section` הוא שקוף (ללא רקע)
- [ ] `.index-section__header` ו-`.index-section__body` הם עם רקע נפרד
- [ ] הערות מפורשות על מבנה סקשנים (שקוף עם רקע נפרד)

### **תוכן**
- [ ] הבלופרינט מכיל תוכן דמה מלא
- [ ] אין placeholder ריקים
- [ ] כל האלמנטים מוגדרים עם תוכן
- [ ] כל הטקסטים בעברית (RTL)

### **תמונות ואייקונים**
- [ ] כל התמונות מקושרות לקבצי התמונה החיים במערכת (`ui/public/images/`)
- [ ] כל האייקונים מקושרים לקבצי האייקונים החיים במערכת
- [ ] אין תמונות מקומיות (local files)
- [ ] כל האייקונים משתמשים בנתיבים יחסיים (`../../../../ui/public/images/icons/entities/...`)

### **CSS**
- [ ] כל הערכים משתמשים ב-CSS Variables מ-`phoenix-base.css`
- [ ] אין ערכי צבע hardcoded (חוץ מ-fallback values)
- [ ] אין Media Queries (חוץ מ-Dark Mode אם נדרש)
- [ ] שימוש ב-`clamp()` ל-typography ו-spacing (Fluid Design)
- [ ] Grid עם `auto-fit` / `auto-fill` ל-layout
- [ ] כל המחלקות משתמשות ב-display properties הנכונים
- [ ] ריווחים משתמשים ב-rem units (לא px)

### **JavaScript (אם נדרש)**
- [ ] כל הלוגיקה מיושמת ב-JavaScript (לא inline scripts)
- [ ] כל ה-event handlers מוגדרים ב-JavaScript
- [ ] אין תגי `<script>` inline
- [ ] שימוש ב-`js-` prefixed classes (לא BEM classes)

---

## 🔗 קישורים רלוונטיים

### **קבצי CSS חיים במערכת:**
- **phoenix-base.css:** `ui/src/styles/phoenix-base.css`
- **phoenix-components.css:** `ui/src/styles/phoenix-components.css`
- **phoenix-header.css:** `ui/src/styles/phoenix-header.css`
- **D15_DASHBOARD_STYLES.css:** `ui/src/styles/D15_DASHBOARD_STYLES.css`
- **D15_IDENTITY_STYLES.css:** `ui/src/styles/D15_IDENTITY_STYLES.css`

### **תמונות ואייקונים חיים במערכת:**
- **אייקונים של ישויות:** `ui/public/images/icons/entities/`
- **לוגו:** `ui/public/images/logo.svg`

### **מסמכי עבודה:**
- **הנחיות צוות 30:** `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_31_BLUEPRINT_WORK_GUIDELINES_V2.md`
- **תבנית V3:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D15_PAGE_TEMPLATE_V3.html`

---

**עודכן על ידי:** Team 31 (Blueprint) | 2026-02-02  
**סטטוס:** ✅ **ACTIVE - MANDATORY WORKFLOW**

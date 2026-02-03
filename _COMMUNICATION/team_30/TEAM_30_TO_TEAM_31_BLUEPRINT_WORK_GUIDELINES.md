# 📋 הנחיות עבודה: הכנת בלופרינט למערכת

**From:** Team 30 (Frontend Execution)  
**To:** Team 31 (Blueprint)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** BLUEPRINT_WORK_GUIDELINES | הכנת בלופרינט מדויק  
**Priority:** 🟡 **IMPORTANT**

---

## 🎯 מטרת המסמך

מסמך עבודה מפורט המגדיר את הדרישות וההנחיות להכנת בלופרינט מדויק למערכת, תוך שמירה על אחידות מקסימלית בשימוש במחלקות קבועות וברירות מחדל מדויקות.

---

## 🔧 סביבת עבודה

### סביבה מבודדת
- **עבודה בסביבה מבודדת:** אתם עובדים בסביבה מבודדת (`_COMMUNICATION/team_31/team_31_staging/`)
- **קישור לקבצים קיימים:** **אבל!!!** אתם יכולים לקשר לקבצי הסגנונות וקבצי התמונה הפעילים במערכת עצמה

### קבצי CSS קיימים במערכת
כל בלופרינט **חייב** לקשר לקבצי ה-CSS הקיימים הבאים:

```html
<!-- CSS Loading Order (CRITICAL - DO NOT CHANGE): -->
<!-- 1. Pico CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">

<!-- 2. Phoenix Base Styles (Global defaults & DNA variables) -->
<link rel="stylesheet" href="./phoenix-base.css">

<!-- 3. LEGO Components (Reusable components) -->
<link rel="stylesheet" href="./phoenix-components.css">

<!-- 4. Header Component (If header is used) -->
<link rel="stylesheet" href="./phoenix-header.css">

<!-- 5. Dashboard-specific styles (If dashboard page) -->
<link rel="stylesheet" href="./D15_DASHBOARD_STYLES.css">
```

**מיקום קבצי CSS במערכת:**
- `ui/src/styles/phoenix-base.css`
- `ui/src/styles/phoenix-components.css`
- `ui/src/styles/phoenix-header.css`
- `ui/src/styles/D15_DASHBOARD_STYLES.css`

**הערה:** בבלופרינט, השתמשו בנתיבים יחסיים (`./phoenix-base.css`) - הקבצים יועתקו למיקום הנכון בעת השילוב.

---

## 📐 מבנה HTML

### תבנית V3 (חובה)
כל בלופרינט **חייב** להשתמש בתבנית V3 המדויקת:

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Page Title] | TikTrack Phoenix</title>
  
  <!-- CSS Loading Order (CRITICAL): -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">
  <link rel="stylesheet" href="./phoenix-base.css">
  <link rel="stylesheet" href="./phoenix-components.css">
  <link rel="stylesheet" href="./phoenix-header.css">
  <link rel="stylesheet" href="./D15_DASHBOARD_STYLES.css">
</head>
<body class="index-page">
  
  <!-- Unified Header -->
  <header id="unified-header">
    <!-- Header content -->
  </header>
  
  <!-- Page Content -->
  <div class="page-wrapper">
    <div class="page-container">
      <main>
        <tt-container>
          <tt-section data-section="[section-name]">
            <!-- Section Header -->
            <div class="index-section__header">
              <!-- Header content -->
            </div>
            
            <!-- Section Body -->
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
  
  <!-- Page Footer -->
  <footer id="page-footer">
    <!-- Footer content -->
  </footer>
  
</body>
</html>
```

---

## 🎨 שימוש במחלקות CSS

### עקרון יסוד: אחידות מקסימלית
**המטרה:** כמה שיותר אחידות בשימוש במחלקות קבועות וברירות מחדל מדויקות למערכת שלא מחייבות הגדרות לכל אלמנט בכלל.

### מחלקות קיימות במערכת

#### 1. LEGO Components (phoenix-components.css)
- `tt-container` - קונטיינר חיצוני (max-width: 1400px)
- `tt-section` - יחידת תוכן עצמאית (רקע שקוף)
- `tt-section-row` - חלוקה פנימית ל-Flex/Grid alignment

#### 2. Section Components (phoenix-components.css)
- `index-section__header` - כותרת סקשן (רקע לבן נפרד)
- `index-section__body` - גוף סקשן (רקע לבן נפרד)
- `index-section__header-title` - כותרת עם אייקון
- `index-section__header-meta` - מטא-מידע
- `index-section__header-actions` - פעולות

#### 3. Dashboard Components (D15_DASHBOARD_STYLES.css)
- `active-alerts` - התראות פעילות
- `active-alerts__list` - רשימת התראות (grid layout)
- `active-alerts__card` - כרטיס התראה
- `info-summary` - סיכום מידע
- `info-summary__row` - שורת סיכום
- `widget-placeholder` - וויגיט (flex column layout)
- `widget-placeholder__header` - כותרת וויגיט
- `widget-placeholder__body` - גוף וויגיט

#### 4. Header Components (phoenix-header.css)
- `tiktrack-nav-list` - רשימת ניווט ראשית
- `tiktrack-nav-item` - פריט ניווט
- `tiktrack-dropdown-menu` - תפריט נפתח
- `tiktrack-dropdown-item` - פריט בתפריט נפתח
- `separator` - מפריד בתפריט

### כללי שימוש במחלקות

#### ✅ מה לעשות:
1. **שימוש במחלקות קיימות:** השתמשו במחלקות הקיימות במערכת בלבד
2. **ברירות מחדל:** השתמשו בברירות המחדל - אין צורך בהגדרות לכל אלמנט
3. **קישור לקבצים:** קשרו לקבצי ה-CSS הקיימים במערכת

#### ❌ מה לא לעשות:
1. **אין מחלקות חדשות:** אל תיצרו מחלקות חדשות אלא אם כן באמת נדרש
2. **אין inline styles:** אל תשתמשו ב-inline styles אלא אם כן באמת נדרש
3. **אין קבצי CSS חדשים:** אל תיצרו קבצי CSS חדשים אלא אם כן באמת נדרש

---

## 🎯 הגדרות עבודה ברורות

### 1. כל בלופרינט יכלול רק את המחלקות או ההגדרות הנוספות הדרושות למימוש שלו

**עקרון:** כל בלופרינט משתמש במחלקות הקיימות במערכת. אם יש צורך במחלקה או הגדרה נוספת, היא תוגדר בבלופרינט בלבד.

**דוגמה:**
```html
<!-- אם יש צורך במחלקה נוספת: -->
<style>
  /* רק המחלקות או ההגדרות הנוספות הדרושות */
  .custom-widget-specific-class {
    /* הגדרות ספציפיות */
  }
</style>
```

### 2. קישור לקבצי התמונה הפעילים במערכת

**מיקום תמונות במערכת:**
- `ui/public/images/icons/entities/` - אייקונים של ישויות
- `ui/public/images/logo.svg` - לוגו

**שימוש בתמונות:**
```html
<!-- אייקון ישות -->
<img src="images/icons/entities/trades.svg" alt="טרייד" width="20" height="20" class="widget-placeholder__title-icon">

<!-- לוגו -->
<img src="images/logo.svg" alt="TikTrack Logo" class="logo-image">
```

### 3. תוכן דמה מלא

**דרישה:** כל בלופרינט חייב להכיל תוכן דמה מלא - אין placeholder ריקים.

**דוגמה:**
```html
<!-- ✅ נכון: תוכן דמה מלא -->
<div class="info-summary">
  <div class="info-summary__row">
    <div>סה"כ טריידים: <strong>82</strong></div>
    <div>סה"כ התראות: <strong>3</strong></div>
    <!-- ... -->
  </div>
</div>

<!-- ❌ שגוי: placeholder ריק -->
<div class="info-summary">
  <!-- תוכן יוגדר מאוחר יותר -->
</div>
```

---

## 📋 Checklist לפני מסירה

### מבנה HTML
- [ ] הבלופרינט משתמש בתבנית V3 המדויקת
- [ ] הבלופרינט מקשר לקבצי ה-CSS הקיימים במערכת
- [ ] הבלופרינט משתמש במחלקות הקיימות במערכת בלבד
- [ ] אין מחלקות חדשות אלא אם כן באמת נדרש

### תוכן
- [ ] הבלופרינט מכיל תוכן דמה מלא
- [ ] אין placeholder ריקים
- [ ] כל האלמנטים מוגדרים עם תוכן

### תמונות ואייקונים
- [ ] כל התמונות מקושרות לקבצי התמונה הפעילים במערכת
- [ ] כל האייקונים מקושרים לקבצי האייקונים במערכת
- [ ] אין תמונות מקומיות (local files)

### JavaScript (אם נדרש)
- [ ] כל הלוגיקה מיושמת ב-JavaScript (לא inline scripts)
- [ ] כל ה-event handlers מוגדרים ב-JavaScript
- [ ] אין תגי `<script>` inline

---

## 🔍 דוגמאות

### דוגמה 1: עמוד בית (D15_INDEX)
```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>דף הבית | TikTrack Phoenix</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">
  <link rel="stylesheet" href="./phoenix-base.css">
  <link rel="stylesheet" href="./phoenix-components.css">
  <link rel="stylesheet" href="./phoenix-header.css">
  <link rel="stylesheet" href="./D15_DASHBOARD_STYLES.css">
</head>
<body class="index-page">
  <!-- Unified Header -->
  <header id="unified-header">
    <!-- Header content using tiktrack-nav-list, etc. -->
  </header>
  
  <!-- Page Content -->
  <div class="page-wrapper">
    <div class="page-container">
      <main>
        <tt-container>
          <!-- Section 1: Active Alerts -->
          <tt-section data-section="top">
            <div class="index-section__header">
              <!-- Header content -->
            </div>
            <div class="index-section__body">
              <div class="active-alerts">
                <div class="active-alerts__list">
                  <!-- Alert cards using active-alerts__card -->
                </div>
              </div>
            </div>
          </tt-section>
          
          <!-- Section 2: Dashboard Widgets -->
          <tt-section data-section="main">
            <div class="index-section__header">
              <!-- Header content -->
            </div>
            <div class="index-section__body">
              <tt-section-row>
                <div class="widget-placeholder">
                  <!-- Widget content -->
                </div>
              </tt-section-row>
            </div>
          </tt-section>
        </tt-container>
      </main>
    </div>
  </div>
  
  <!-- Page Footer -->
  <footer id="page-footer">
    <!-- Footer content -->
  </footer>
</body>
</html>
```

---

## 📝 הערות חשובות

1. **אחידות מקסימלית:** המטרה היא כמה שיותר אחידות בשימוש במחלקות קבועות וברירות מחדל מדויקות

2. **אין הגדרות לכל אלמנט:** השימוש בברירות המחדל מספיק - אין צורך בהגדרות לכל אלמנט

3. **קישור לקבצים קיימים:** כל בלופרינט מקשר לקבצי ה-CSS הקיימים - אין צורך בהעתקת קבצים

4. **תוכן דמה מלא:** כל בלופרינט חייב להכיל תוכן דמה מלא - אין placeholder ריקים

5. **תהליך מסודר:** זהו תהליך עבודה מסודר לייצור עמודים - זהו העמוד הראשון מתוך ~40 עמודים

---

## 🔗 קישורים רלוונטיים

- **תבנית V3:** `ui/src/components/HomePage.jsx` (דוגמה ליישום)
- **קבצי CSS:** `ui/src/styles/` (phoenix-base.css, phoenix-components.css, phoenix-header.css, D15_DASHBOARD_STYLES.css)
- **תמונות:** `ui/public/images/` (אייקונים ולוגו)
- **תהליך עבודה:** `documentation/05-PROCEDURES/TT2_BLUEPRINT_INTEGRATION_WORKFLOW.md`

---

**עודכן על ידי:** צוות 30 (Frontend Execution) | 2026-01-31  
**סטטוס:** ✅ **ACTIVE - FOR TEAM 31 USE**

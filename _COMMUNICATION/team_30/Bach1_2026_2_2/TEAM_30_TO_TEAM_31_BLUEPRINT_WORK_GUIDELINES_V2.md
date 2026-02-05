# 📋 הנחיות עבודה מפורטות: הכנת בלופרינט למערכת (V2)

**From:** Team 30 (Frontend Execution)  
**To:** Team 31 (Blueprint)  
**Date:** 2026-02-02  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** BLUEPRINT_WORK_GUIDELINES_V2 | הכנת בלופרינט מדויק  
**Priority:** 🔴 **CRITICAL - LESSONS LEARNED**

---

## 📢 הקשר וחשיבות המסמך

מסמך זה הוא גרסה משופרת של המסמך הקודם, המבוססת על **למידה מהקשיים שהיו בתהליך יישום דף הבית**.

**רקע:**
- תהליך העבודה על דף הבית (D15_INDEX) היה קשה מאוד
- זוהו **11 בעיות עיצוב** שדרשו תיקון
- רוב הבעיות היו בעיות של **טעינת CSS** או **מבנה DOM**
- תהליך התיקון דרש זמן רב ובדיקות רבות

**מטרת המסמך:**
להבהיר בדיוק מה דרוש לנו כדי שנוכל לממש את הקבצים שלכם בצורה המדויקת הנדרשת וללא שגיאות.

---

## 🎯 עקרון יסוד: קישור לקבצים הפעילים במערכת

### **המלצה קריטית:**

**עבדו עם קישור ישיר לקבצי הסגנונות והתמונות הפעילים במערכת + תוספות ספציפיות בלבד.**

**למה זה חשוב:**
- זה מבטיח שהעיצובים שלכם לא ישברו
- זה מבטיח שאנחנו משתמשים באותם קבצים בדיוק
- זה מבטיח אחידות מקסימלית במערכת
- זה חוסך זמן וטעויות

---

## 🔧 סביבת עבודה

### **סביבה מבודדת**
- **עבודה בסביבה מבודדת:** אתם עובדים בסביבה מבודדת (`_COMMUNICATION/team_31/team_31_staging/`)
- **קישור לקבצים קיימים:** **אבל!!!** אתם יכולים לקשר לקבצי הסגנונות וקבצי התמונה הפעילים במערכת עצמה

### **מיקום קבצי CSS במערכת (קישורים מדויקים)**

**קבצי CSS הפעילים במערכת:**
- `ui/src/styles/phoenix-base.css` - CSS Variables, Base Styles (SSOT)
- `ui/src/styles/phoenix-components.css` - LEGO Components
- `ui/src/styles/phoenix-header.css` - Unified Header Styles
- `ui/src/styles/D15_DASHBOARD_STYLES.css` - Dashboard-specific styles
- `ui/src/styles/D15_IDENTITY_STYLES.css` - Auth pages specific styles

**קישור בבלופרינט:**
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

<!-- 5. Page-Specific Styles (If needed) -->
<!-- Dashboard pages: -->
<link rel="stylesheet" href="./D15_DASHBOARD_STYLES.css">
<!-- Auth pages: -->
<link rel="stylesheet" href="./D15_IDENTITY_STYLES.css">
```

**⚠️ חשוב:** השתמשו בנתיבים יחסיים (`./phoenix-base.css`) - הקבצים יועתקו למיקום הנכון בעת השילוב.

---

## 📐 מבנה HTML - תבנית V3 (חובה)

### **מבנה בסיסי (חובה לכל בלופרינט):**

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Page Title] | TikTrack Phoenix</title>
  
  <!-- CSS Loading Order (CRITICAL - DO NOT CHANGE): -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">
  <link rel="stylesheet" href="./phoenix-base.css">
  <link rel="stylesheet" href="./phoenix-components.css">
  <link rel="stylesheet" href="./phoenix-header.css">
  <!-- Page-specific CSS (if needed) -->
  <link rel="stylesheet" href="./D15_DASHBOARD_STYLES.css">
</head>
<body class="index-page">
  
  <!-- Unified Header (if page uses header) -->
  <header id="unified-header">
    <!-- Header content - use exact structure from D15_INDEX.html -->
  </header>
  
  <!-- Page Content -->
  <div class="page-wrapper">
    <div class="page-container">
      <main>
        <tt-container>
          <!-- Sections -->
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
  
  <!-- Page Footer (if page uses footer) -->
  <footer id="page-footer">
    <!-- Footer content -->
  </footer>
  
</body>
</html>
```

---

## 🎨 שימוש במחלקות CSS - מדריך מפורט

### **עקרון יסוד: אחידות מקסימלית**

**המטרה:** כמה שיותר אחידות בשימוש במחלקות קבועות וברירות מחדל מדויקות למערכת שלא מחייבות הגדרות לכל אלמנט בכלל.

---

### **1. LEGO Components (phoenix-components.css)**

#### **`tt-container`**
- **תפקיד:** קונטיינר חיצוני (max-width: 1400px, ממורכז)
- **שימוש:** עטיפה חיצונית לכל התוכן בעמוד
- **דוגמה:**
```html
<tt-container>
  <!-- כל התוכן של העמוד -->
</tt-container>
```

#### **`tt-section`**
- **תפקיד:** יחידת תוכן עצמאית
- **רקע:** **שקוף** (transparent) - אין רקע על `tt-section` עצמו
- **מבנה:** רקע נמצא על `.index-section__header` ו-`.index-section__body` בנפרד
- **דוגמה:**
```html
<tt-section data-section="top">
  <!-- Section Header - רקע לבן נפרד -->
  <div class="index-section__header">
    <!-- Header content -->
  </div>
  
  <!-- Section Body - רקע לבן נפרד -->
  <div class="index-section__body">
    <!-- Body content -->
  </div>
</tt-section>
```

**⚠️ קריטי:** `tt-section` הוא **שקוף** - הרקע נמצא על header ו-body בנפרד!

#### **`tt-section-row`**
- **תפקיד:** חלוקה פנימית ל-Flex/Grid alignment
- **שימוש:** בתוך `.index-section__body` לחלוקת תוכן
- **דוגמה:**
```html
<div class="index-section__body">
  <tt-section-row>
    <div class="widget-placeholder">Widget 1</div>
    <div class="widget-placeholder">Widget 2</div>
  </tt-section-row>
</div>
```

---

### **2. Section Components (phoenix-components.css)**

#### **`.index-section__header`**
- **תפקיד:** כותרת סקשן (רקע לבן נפרד)
- **מבנה:** רקע לבן, border, shadow נפרדים
- **דוגמה:**
```html
<div class="index-section__header">
  <div class="index-section__header-title">
    <img src="images/icons/entities/trades.svg" alt="טרייד" width="20" height="20" class="index-section__header-icon">
    <h2>התראות פעילות</h2>
  </div>
  <div class="index-section__header-actions">
    <!-- Actions -->
  </div>
</div>
```

#### **`.index-section__body`**
- **תפקיד:** גוף סקשן (רקע לבן נפרד)
- **מבנה:** רקע לבן, border, shadow נפרדים
- **דוגמה:**
```html
<div class="index-section__body">
  <tt-section-row>
    <!-- Content -->
  </tt-section-row>
</div>
```

---

### **3. Dashboard Components (D15_DASHBOARD_STYLES.css)**

#### **`.active-alerts`**
- **תפקיד:** קונטיינר להתראות פעילות
- **מבנה:** `display: grid` עם `auto-fit` (Fluid Design)
- **דוגמה:**
```html
<div class="active-alerts">
  <div class="active-alerts__list">
    <div class="active-alerts__card">
      <!-- Alert content -->
    </div>
  </div>
</div>
```

#### **`.info-summary`**
- **תפקיד:** סיכום מידע
- **מבנה:** `display: flex` עם `justify-content: space-between`
- **דוגמה:**
```html
<div class="info-summary">
  <div class="info-summary__row">
    <div>סה"כ טריידים: <strong>82</strong></div>
    <div>סה"כ התראות: <strong>3</strong></div>
    <button class="portfolio-summary__toggle-btn">הצג עוד</button>
  </div>
</div>
```

#### **`.widget-placeholder`**
- **תפקיד:** וויגיט (flex column layout)
- **מבנה:** `display: flex`, `flex-direction: column`
- **דוגמה:**
```html
<div class="widget-placeholder">
  <div class="widget-placeholder__header">
    <h3>Recent Trades</h3>
  </div>
  <div class="widget-placeholder__body">
    <!-- Widget content -->
  </div>
</div>
```

---

### **4. Header Components (phoenix-header.css)**

#### **`.tiktrack-nav-list`**
- **תפקיד:** רשימת ניווט ראשית
- **מבנה:** `display: flex`, `gap: 0` (ריווח רק מה-`padding` של `.tiktrack-dropdown-item`)
- **דוגמה:**
```html
<ul class="tiktrack-nav-list">
  <li class="tiktrack-nav-item">
    <a href="/" class="tiktrack-nav-link">ראשי</a>
  </li>
  <li class="tiktrack-nav-item dropdown">
    <a href="#" class="tiktrack-nav-link tiktrack-dropdown-toggle">תכנון</a>
    <ul class="tiktrack-dropdown-menu">
      <li><a class="tiktrack-dropdown-item" href="/ai_analysis">אנליזת AI</a></li>
    </ul>
  </li>
</ul>
```

**⚠️ קריטי:** ריווח בין רשומות בתפריט רמה שנייה הוא `0.0625rem` (לא `0.92px`)!

#### **`.separator`**
- **תפקיד:** מפריד בתפריט
- **מבנה:** `height: 1px`, `box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05)`
- **דוגמה:**
```html
<li class="separator"></li>
```

**⚠️ קריטי:** Separator הוא עדין מאוד - פיקסל אחד וצל עדין!

---

## 🖼️ תמונות ואייקונים - קישורים מדויקים

### **מיקום תמונות במערכת:**

**אייקונים של ישויות:**
- `ui/public/images/icons/entities/home.svg`
- `ui/public/images/icons/entities/trades.svg`
- `ui/public/images/icons/entities/trading_accounts.svg`
- `ui/public/images/icons/entities/tickers.svg`
- `ui/public/images/icons/entities/user.svg`
- `ui/public/images/icons/entities/alerts.svg`
- `ui/public/images/icons/entities/notes.svg`
- `ui/public/images/icons/entities/preferences.svg`
- `ui/public/images/icons/entities/research.svg`
- `ui/public/images/icons/entities/trade_plans.svg`
- `ui/public/images/icons/entities/cash_flows.svg`
- `ui/public/images/icons/entities/conditions.svg`
- `ui/public/images/icons/entities/executions.svg`
- `ui/public/images/icons/entities/db_display.svg`
- `ui/public/images/icons/entities/development.svg`

**לוגו:**
- `ui/public/images/logo.svg`

**קישור בבלופרינט:**
```html
<!-- אייקון ישות -->
<img src="images/icons/entities/trades.svg" alt="טרייד" width="20" height="20" class="widget-placeholder__title-icon">

<!-- לוגו -->
<img src="images/logo.svg" alt="TikTrack Logo" class="logo-image">
```

**⚠️ חשוב:** השתמשו בנתיבים יחסיים (`images/icons/entities/trades.svg`) - הקבצים יועתקו למיקום הנכון בעת השילוב.

---

## 📝 תוכן דמה מלא - דרישה קריטית

### **דרישה:**
כל בלופרינט **חייב** להכיל תוכן דמה מלא - אין placeholder ריקים.

### **דוגמה נכונה:**
```html
<!-- ✅ נכון: תוכן דמה מלא -->
<div class="info-summary">
  <div class="info-summary__row">
    <div>סה"כ טריידים: <strong>82</strong></div>
    <div>סה"כ התראות: <strong>3</strong></div>
    <div>יתרה: <strong>$142,500.42</strong></div>
    <div>P/L: <strong>+$2,340.15</strong></div>
    <button class="portfolio-summary__toggle-btn">הצג עוד</button>
  </div>
</div>
```

### **דוגמה שגויה:**
```html
<!-- ❌ שגוי: placeholder ריק -->
<div class="info-summary">
  <!-- תוכן יוגדר מאוחר יותר -->
</div>
```

---

## 🎯 הגדרות עבודה ברורות

### **1. כל בלופרינט יכלול רק את המחלקות או ההגדרות הנוספות הדרושות למימוש שלו**

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

**⚠️ חשוב:** רק אם באמת נדרש - המטרה היא כמה שיותר אחידות!

---

## ⚠️ למידה מהקשיים שהיו בדף הבית

### **בעיות שזוהו ותוקנו:**

#### **1. טעינת CSS**
- **בעיה:** `D15_DASHBOARD_STYLES.css` לא נטען ב-`HomePage.jsx`
- **סיבה:** הקובץ לא היה מיובא ב-React Component
- **פתרון:** הוספת `import '../styles/D15_DASHBOARD_STYLES.css'` ל-`HomePage.jsx`
- **למידה:** יש לוודא שכל קבצי ה-CSS מקושרים בבלופרינט בסדר הנכון

#### **2. מבנה DOM**
- **בעיה:** מבנה DOM לא תואם לבלופרינט
- **סיבה:** שימוש במחלקות לא נכונות או מבנה לא נכון
- **פתרון:** השוואה מדויקת בין הבלופרינט לקוד בפועל
- **למידה:** יש לוודא שהמבנה זהה בדיוק לבלופרינט

#### **3. ריווחים וגדלים**
- **בעיה:** ריווחים וגדלים לא מדויקים (למשל: `0.92px` במקום `0.0625rem`)
- **סיבה:** שימוש בערכים לא נכונים או לא עקביים
- **פתרון:** שימוש ב-CSS Variables ו-rem units
- **למידה:** יש לוודא שכל הערכים משתמשים ב-CSS Variables מ-`phoenix-base.css`

#### **4. Display Properties**
- **בעיה:** `display: block` במקום `display: grid` או `display: flex`
- **סיבה:** שימוש במחלקות לא נכונות או CSS לא נכון
- **פתרון:** שימוש במחלקות הנכונות מ-`D15_DASHBOARD_STYLES.css`
- **למידה:** יש לוודא שכל המחלקות משתמשות ב-display properties הנכונים

---

## 📋 Checklist לפני מסירה - מפורט

### **מבנה HTML**
- [ ] הבלופרינט משתמש בתבנית V3 המדויקת
- [ ] הבלופרינט מקשר לקבצי ה-CSS הקיימים במערכת בסדר הנכון
- [ ] הבלופרינט משתמש במחלקות הקיימות במערכת בלבד
- [ ] אין מחלקות חדשות אלא אם כן באמת נדרש
- [ ] מבנה DOM זהה בדיוק למה שצריך להיות ב-React Component

### **תוכן**
- [ ] הבלופרינט מכיל תוכן דמה מלא
- [ ] אין placeholder ריקים
- [ ] כל האלמנטים מוגדרים עם תוכן
- [ ] כל הטקסטים בעברית (RTL)

### **תמונות ואייקונים**
- [ ] כל התמונות מקושרות לקבצי התמונה הפעילים במערכת
- [ ] כל האייקונים מקושרים לקבצי האייקונים במערכת
- [ ] אין תמונות מקומיות (local files)
- [ ] כל האייקונים משתמשים בנתיבים יחסיים (`images/icons/entities/...`)

### **CSS**
- [ ] כל הערכים משתמשים ב-CSS Variables מ-`phoenix-base.css`
- [ ] אין ערכי צבע hardcoded (חוץ מ-fallback values)
- [ ] אין Media Queries (חוץ מ-Dark Mode אם נדרש)
- [ ] שימוש ב-`clamp()` ל-typography ו-spacing (Fluid Design)
- [ ] Grid עם `auto-fit` / `auto-fill` ל-layout

### **JavaScript (אם נדרש)**
- [ ] כל הלוגיקה מיושמת ב-JavaScript (לא inline scripts)
- [ ] כל ה-event handlers מוגדרים ב-JavaScript
- [ ] אין תגי `<script>` inline
- [ ] שימוש ב-`js-` prefixed classes (לא BEM classes)

---

## 🔍 דוגמאות מפורטות

### **דוגמה 1: עמוד בית (D15_INDEX) - מבנה מלא**

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>דף הבית | TikTrack Phoenix</title>
  
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
    <div class="header-content">
      <div class="header-top">
        <div class="header-container">
          <div class="header-nav">
            <nav class="main-nav">
              <ul class="tiktrack-nav-list">
                <!-- Home Link -->
                <li class="tiktrack-nav-item">
                  <a href="/" class="tiktrack-nav-link" data-page="home">
                    <img src="images/icons/entities/home.svg" alt="בית" width="36" height="36" class="nav-icon home-icon-only">
                  </a>
                </li>
                
                <!-- Dropdown Menus -->
                <li class="tiktrack-nav-item dropdown">
                  <a href="/trade_plans" class="tiktrack-nav-link tiktrack-dropdown-toggle" data-page="trade_plans">
                    <span class="nav-text">תכנון</span>
                    <span class="tiktrack-dropdown-arrow">▼</span>
                  </a>
                  <ul class="tiktrack-dropdown-menu" id="menu-0">
                    <li><a class="tiktrack-dropdown-item" href="/ai_analysis">אנליזת AI</a></li>
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
      
      <!-- Filters Row -->
      <div class="filters-container">
        <!-- Filter content -->
      </div>
    </div>
  </header>
  
  <!-- Page Content -->
  <div class="page-wrapper">
    <div class="page-container">
      <main>
        <tt-container>
          <!-- Section 1: Active Alerts -->
          <tt-section data-section="top">
            <div class="index-section__header">
              <div class="index-section__header-title">
                <img src="images/icons/entities/alerts.svg" alt="התראות" width="20" height="20" class="index-section__header-icon">
                <h2>התראות פעילות</h2>
              </div>
              <div class="index-section__header-actions">
                <button class="index-section__header-alert-btn">🔔</button>
              </div>
            </div>
            <div class="index-section__body">
              <div class="active-alerts">
                <div class="active-alerts__list">
                  <div class="active-alerts__card">
                    <div class="active-alerts__card-header">
                      <span class="active-alerts__card-type">טרייד</span>
                      <span class="active-alerts__card-time">לפני 5 דקות</span>
                    </div>
                    <div class="active-alerts__card-body">
                      <p>טרייד חדש: AAPL @ $150.25</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </tt-section>
          
          <!-- Section 2: Info Summary -->
          <tt-section data-section="top">
            <div class="index-section__header">
              <div class="index-section__header-title">
                <h2>סיכום מידע</h2>
              </div>
            </div>
            <div class="index-section__body">
              <div class="info-summary">
                <div class="info-summary__row">
                  <div>סה"כ טריידים: <strong>82</strong></div>
                  <div>סה"כ התראות: <strong>3</strong></div>
                  <div>יתרה: <strong>$142,500.42</strong></div>
                  <div>P/L: <strong>+$2,340.15</strong></div>
                  <button class="portfolio-summary__toggle-btn">הצג עוד</button>
                </div>
              </div>
            </div>
          </tt-section>
          
          <!-- Section 3: Dashboard Widgets -->
          <tt-section data-section="main">
            <div class="index-section__header">
              <div class="index-section__header-title">
                <img src="images/icons/entities/trades.svg" alt="טריידים" width="20" height="20" class="index-section__header-icon">
                <h2>לוח בקרה</h2>
              </div>
            </div>
            <div class="index-section__body">
              <tt-section-row>
                <div class="widget-placeholder">
                  <div class="widget-placeholder__header">
                    <h3>Recent Trades</h3>
                  </div>
                  <div class="widget-placeholder__body">
                    <p>תוכן דמה של וויגיט</p>
                  </div>
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

### **דוגמה 2: מבנה Section נכון**

```html
<!-- ✅ נכון: מבנה Section עם רקע נפרד על header ו-body -->
<tt-section data-section="top">
  <!-- Section Header - רקע לבן נפרד -->
  <div class="index-section__header">
    <div class="index-section__header-title">
      <img src="images/icons/entities/trades.svg" alt="טריידים" width="20" height="20" class="index-section__header-icon">
      <h2>כותרת סקשן</h2>
    </div>
    <div class="index-section__header-actions">
      <button class="index-section__header-toggle-btn">▼</button>
    </div>
  </div>
  
  <!-- Section Body - רקע לבן נפרד -->
  <div class="index-section__body">
    <tt-section-row>
      <!-- Content -->
    </tt-section-row>
  </div>
</tt-section>
```

**⚠️ קריטי:** `tt-section` הוא **שקוף** - הרקע נמצא על header ו-body בנפרד!

---

### **דוגמה 3: מבנה Header נכון**

```html
<!-- ✅ נכון: מבנה Header עם ריווח נכון -->
<ul class="tiktrack-nav-list">
  <li class="tiktrack-nav-item">
    <a href="/" class="tiktrack-nav-link">ראשי</a>
  </li>
  <li class="tiktrack-nav-item dropdown">
    <a href="#" class="tiktrack-nav-link tiktrack-dropdown-toggle">תכנון</a>
    <ul class="tiktrack-dropdown-menu">
      <li><a class="tiktrack-dropdown-item" href="/ai_analysis">אנליזת AI</a></li>
      <li class="separator"></li>
      <li><a class="tiktrack-dropdown-item" href="/trade_history">היסטוריית טרייד</a></li>
    </ul>
  </li>
</ul>
```

**⚠️ קריטי:** ריווח בין רשומות בתפריט רמה שנייה הוא `0.0625rem` (לא `0.92px`)!

---

## 🔗 קישורים מדויקים לקבצים

### **קבצי CSS:**
- **phoenix-base.css:** `ui/src/styles/phoenix-base.css` - CSS Variables, Base Styles (SSOT)
- **phoenix-components.css:** `ui/src/styles/phoenix-components.css` - LEGO Components
- **phoenix-header.css:** `ui/src/styles/phoenix-header.css` - Unified Header Styles
- **D15_DASHBOARD_STYLES.css:** `ui/src/styles/D15_DASHBOARD_STYLES.css` - Dashboard-specific styles
- **D15_IDENTITY_STYLES.css:** `ui/src/styles/D15_IDENTITY_STYLES.css` - Auth pages specific styles

### **תמונות ואייקונים:**
- **אייקונים של ישויות:** `ui/public/images/icons/entities/`
- **לוגו:** `ui/public/images/logo.svg`

### **בלופרינטים לדוגמה:**
- **D15_INDEX.html:** `_COMMUNICATION/team_01/team_01_staging/D15_INDEX.html` - דוגמה מלאה לעמוד בית
- **D15_PAGE_TEMPLATE_V3.html:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D15_PAGE_TEMPLATE_V3.html` - תבנית V3

### **יישום React לדוגמה:**
- **HomePage.jsx:** `ui/src/components/HomePage.jsx` - יישום React של עמוד בית

---

## ⚠️ נקודות קריטיות - למידה מהקשיים

### **1. סדר טעינת CSS (CRITICAL)**

**הסדר הוא קדוש - אין לחרוג ממנו:**

```html
<!-- 1. Pico CSS FIRST (Framework) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">

<!-- 2. Phoenix Base Styles (Global defaults) -->
<link rel="stylesheet" href="./phoenix-base.css">

<!-- 3. LEGO Components (Reusable components) -->
<link rel="stylesheet" href="./phoenix-components.css">

<!-- 4. Header Component (If header is used) -->
<link rel="stylesheet" href="./phoenix-header.css">

<!-- 5. Page-Specific Styles (If needed) -->
<link rel="stylesheet" href="./D15_DASHBOARD_STYLES.css">
```

**⚠️ IMPORTANT:** שינוי הסדר יגרום לשבירת סגנונות!

---

### **2. מבנה Section (CRITICAL)**

**`tt-section` הוא שקוף - הרקע נמצא על header ו-body בנפרד:**

```html
<!-- ✅ נכון: מבנה Section עם רקע נפרד -->
<tt-section data-section="top">
  <!-- Section Header - רקע לבן נפרד -->
  <div class="index-section__header">
    <!-- Header content -->
  </div>
  
  <!-- Section Body - רקע לבן נפרד -->
  <div class="index-section__body">
    <!-- Body content -->
  </div>
</tt-section>
```

**⚠️ קריטי:** `tt-section` הוא **שקוף** - אין רקע עליו!

---

### **3. ריווחים וגדלים (CRITICAL)**

**שימוש ב-CSS Variables ו-rem units:**

```css
/* ✅ נכון: שימוש ב-CSS Variables */
padding: var(--spacing-md, 16px);
font-size: var(--font-size-base, 16px);
color: var(--apple-text-primary, #1d1d1f);

/* ❌ שגוי: ערכים hardcoded */
padding: 16px;
font-size: 16px;
color: #1d1d1f;
```

**⚠️ קריטי:** כל הערכים חייבים להשתמש ב-CSS Variables מ-`phoenix-base.css`!

---

### **4. Display Properties (CRITICAL)**

**שימוש במחלקות הנכונות:**

```css
/* ✅ נכון: שימוש במחלקות הנכונות */
.active-alerts__list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.info-summary__row {
  display: flex;
  justify-content: space-between;
}

.widget-placeholder {
  display: flex;
  flex-direction: column;
}

/* ❌ שגוי: display לא נכון */
.active-alerts__list {
  display: block; /* שגוי - צריך grid */
}
```

**⚠️ קריטי:** כל המחלקות חייבות להשתמש ב-display properties הנכונים!

---

### **5. Fluid Design (CRITICAL)**

**אין Media Queries (חוץ מ-Dark Mode):**

```css
/* ✅ נכון: Fluid Design עם clamp() */
font-size: clamp(14px, 2vw + 0.5rem, 18px);
padding: clamp(16px, 2vw, 24px);
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));

/* ❌ שגוי: Media Queries */
@media (min-width: 768px) {
  font-size: 18px;
}
```

**⚠️ קריטי:** אין Media Queries (חוץ מ-Dark Mode)!

---

## 📋 Checklist לפני מסירה - מפורט מאוד

### **מבנה HTML**
- [ ] הבלופרינט משתמש בתבנית V3 המדויקת
- [ ] הבלופרינט מקשר לקבצי ה-CSS הקיימים במערכת בסדר הנכון
- [ ] הבלופרינט משתמש במחלקות הקיימות במערכת בלבד
- [ ] אין מחלקות חדשות אלא אם כן באמת נדרש
- [ ] מבנה DOM זהה בדיוק למה שצריך להיות ב-React Component
- [ ] `tt-section` הוא שקוף (ללא רקע)
- [ ] `.index-section__header` ו-`.index-section__body` הם עם רקע נפרד

### **בדיקת טעינת CSS (חובה לפני מסירה)**
- [ ] **דרישה מפורשת:** כל בלופרינט חייב לעבור בדיקת טעינת CSS לפני מסירה
- [ ] **כלי בדיקה:** הרצת `check-css-loading.js` בקונסולת הדפדפן על הבלופרינט
- [ ] **וידוא טעינה:** בדיקה שכל קבצי ה-CSS הנדרשים נטענים
- [ ] **וידוא סדר:** בדיקה שסדר הטעינה נכון (לפי `CSS_LOADING_ORDER.md`)
- [ ] **וידוא אין כפילויות:** בדיקה שאין כפילויות בטעינה
- [ ] **תיעוד בעיות:** תיעוד כל בעיות טעינת CSS שנמצאו

### **בדיקת מבנה DOM (חובה לפני מסירה)**
- [ ] **דרישה מפורשת:** כל בלופרינט חייב לעבור בדיקת מבנה DOM לפני מסירה
- [ ] **כלי בדיקה:** הרצת `blueprint-comparison.js` בקונסולת הדפדפן על הבלופרינט
- [ ] **וידוא מבנה:** בדיקה שמבנה DOM תואם לתבנית V3
- [ ] **וידוא מחלקות:** בדיקה שכל המחלקות קיימות במערכת
- [ ] **תיעוד בעיות:** תיעוד כל בעיות מבנה DOM שנמצאו

### **תוכן**
- [ ] הבלופרינט מכיל תוכן דמה מלא
- [ ] אין placeholder ריקים
- [ ] כל האלמנטים מוגדרים עם תוכן
- [ ] כל הטקסטים בעברית (RTL)

### **תמונות ואייקונים**
- [ ] כל התמונות מקושרות לקבצי התמונה הפעילים במערכת
- [ ] כל האייקונים מקושרים לקבצי האייקונים במערכת
- [ ] אין תמונות מקומיות (local files)
- [ ] כל האייקונים משתמשים בנתיבים יחסיים (`images/icons/entities/...`)

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

## 📝 הערות חשובות

1. **אחידות מקסימלית:** המטרה היא כמה שיותר אחידות בשימוש במחלקות קבועות וברירות מחדל מדויקות

2. **אין הגדרות לכל אלמנט:** השימוש בברירות המחדל מספיק - אין צורך בהגדרות לכל אלמנט

3. **קישור לקבצים קיימים:** כל בלופרינט מקשר לקבצי ה-CSS הקיימים - אין צורך בהעתקת קבצים

4. **תוכן דמה מלא:** כל בלופרינט חייב להכיל תוכן דמה מלא - אין placeholder ריקים

5. **תהליך מסודר:** זהו תהליך עבודה מסודר לייצור עמודים - זהו העמוד הראשון מתוך ~40 עמודים

6. **למידה מהקשיים:** כל הבעיות שזוהו בדף הבית תוקנו - המסמך הזה מבוסס על הלמידה

---

## 🔗 קישורים רלוונטיים

### **קבצי CSS:**
- **phoenix-base.css:** `ui/src/styles/phoenix-base.css`
- **phoenix-components.css:** `ui/src/styles/phoenix-components.css`
- **phoenix-header.css:** `ui/src/styles/phoenix-header.css`
- **D15_DASHBOARD_STYLES.css:** `ui/src/styles/D15_DASHBOARD_STYLES.css`
- **D15_IDENTITY_STYLES.css:** `ui/src/styles/D15_IDENTITY_STYLES.css`

### **תמונות ואייקונים:**
- **אייקונים של ישויות:** `ui/public/images/icons/entities/`
- **לוגו:** `ui/public/images/logo.svg`

### **בלופרינטים לדוגמה:**
- **D15_INDEX.html:** `_COMMUNICATION/team_01/team_01_staging/D15_INDEX.html`
- **D15_PAGE_TEMPLATE_V3.html:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D15_PAGE_TEMPLATE_V3.html`

### **יישום React לדוגמה:**
- **HomePage.jsx:** `ui/src/components/HomePage.jsx`

### **תהליכי עבודה:**
- **תהליך בלופרינט:** `_COMMUNICATION/team_30/TT2_BLUEPRINT_INTEGRATION_WORKFLOW.md`
- **כלי בדיקת CSS:** `ui/check-css-loading.js` (הרץ בקונסולת הדפדפן)
- **כלי בדיקת DOM:** `ui/blueprint-comparison.js` (הרץ בקונסולת הדפדפן)
- **תיעוד סדר טעינת CSS:** `documentation/04-DESIGN_UX_UI/CSS_LOADING_ORDER.md`

---

**עודכן על ידי:** צוות 30 (Frontend Execution) | 2026-02-02  
**סטטוס:** ✅ **ACTIVE - FOR TEAM 31 USE - LESSONS LEARNED APPLIED**

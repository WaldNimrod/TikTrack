# מדריך סטנדרטיזציה - עמודי מוקאפ

# Mockups Standardization Guide

**תאריך יצירה:** 27 בנובמבר 2025  
**סטטוס:** מדריך מקיף לסטנדרטיזציה של עמודי המוקאפ  
**מיקום:** `documentation/frontend/`

---

## רקע

עמודי המוקאפ (15 עמודים ב-`trading-ui/mockups/daily-snapshots/`) עברו תהליך סטנדרטיזציה מלא כדי להתאים לדרישות המערכת:

1. מבנה HTML בסיסי נכון (תבנית עמוד, קונטיינרים וסקשנים)
2. ITCSS מדויק וייבוא נכון של הסגנונות
3. שילוב נכון של אלמנט ראש הדף והתפריט הראשי

---

## תבנית נכונה - מבנה HTML

### מבנה חובה לכל עמוד

```html
<body class="[page-name]-page">
    <!-- Notification container (אופציונלי) -->
    <div class="notification-container" id="notificationContainer"></div>
    
    <!-- ===== TEMPLATE ZONE 1: BACKGROUND WRAPPER (LOCKED) ===== -->
    <div class="background-wrapper">
        <!-- ===== TEMPLATE ZONE 2: HEADER SYSTEM (LOCKED - DO NOT TOUCH) ===== -->
        <div id="unified-header"></div>

        <!-- ===== TEMPLATE ZONE 3: PAGE BODY (LOCKED) ===== -->
        <div class="page-body">
            <!-- ===== TEMPLATE ZONE 4: MAIN CONTENT (EDITABLE) ===== -->
            <div class="main-content">
                <!-- ===== CONTENT SECTIONS START (EDITABLE) ===== -->
                
                <!-- Top Section (אופציונלי) -->
                <div class="top-section" id="topSection" data-section="top">
                    <div class="section-header">
                        <!-- כותרת -->
                    </div>
                    <div class="section-body">
                        <!-- תוכן -->
                    </div>
                </div>
                
                <!-- Content Sections -->
                <div class="content-section" id="section1" data-section="section1">
                    <div class="section-header">
                        <div class="table-title">
                            <img src="..." class="section-icon">
                            כותרת
                        </div>
                        <div class="table-actions">
                            <!-- כפתורים -->
                        </div>
                    </div>
                    <div class="section-body">
                        <!-- תוכן -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
```

### קבצים התייחסות

- `trading-ui/test-header-only.html` - תבנית מושלמת
- `trading-ui/background-tasks.html` - תבנית טובה
- `trading-ui/scripts/init-system/dev-tools/page-template-generator.js` - תבנית אוטומטית

---

## ITCSS - דרישות

### 1. ייבוא נכון של CSS

```html
<!-- TikTrack ITCSS Master Styles -->
<link rel="stylesheet" href="../../styles-new/master.css">
<!-- Header Styles - Separate CSS file -->
<link rel="stylesheet" href="../../styles-new/header-styles.css">
```

### 2. איסורים חמורים

- ❌ אין `<style>` tags בתוך HTML
- ❌ אין `style=""` attributes (inline styles)
- ❌ אין `!important` ב-CSS (אלא במקרים נדירים ומתועדים)
- ❌ אין ייבוא של Bootstrap Icons/FontAwesome ישירות (משתמשים ב-IconSystem)

### 3. מיקום סגנונות

- כל הסגנונות ב-`trading-ui/styles-new/` לפי ITCSS
- סגנונות ספציפיים למוקאפ: `06-components/_mockups-common.css`
- אין צורך ב-`@import` - הקבצים נטענים דרך `master.css`

### קבצים התייחסות

- `trading-ui/styles-new/main.css` - מבנה ITCSS מלא
- `trading-ui/mockups/daily-snapshots/MOCKUPS_UNIFIED_STYLES_GUIDE.md` - מדריך סגנונות

---

## Header System - דרישות

### 1. מיקום ב-HTML

```html
<div class="background-wrapper">
    <div id="unified-header"></div>  <!-- בתוך background-wrapper! -->
    <div class="page-body">
        <!-- תוכן -->
    </div>
</div>
```

### 2. טעינת סקריפטים

```html
<!-- Header System (Must load early) -->
<script src="../../scripts/header-system.js" defer></script>
<script>
    // Auto-initialize HeaderSystem when DOM is ready
    (function() {
        function initHeader() {
            if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
                try {
                    window.HeaderSystem.initialize();
                } catch (error) {
                    if (window.console && window.console.error) {
                        window.console.error('Error initializing HeaderSystem:', error);
                    }
                }
            } else {
                setTimeout(initHeader, 100);
            }
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initHeader);
        } else {
            setTimeout(initHeader, 100);
        }
    })();
</script>
```

### קבצים התייחסות

- `trading-ui/mockups/daily-snapshots/trade-history-page.html` - דוגמה טובה
- `trading-ui/scripts/header-system.js` - מערכת Header

---

## כלי בדיקה

### סקריפט בדיקה אוטומטי

```bash
node scripts/mockups-standardization-checker.js
```

הסקריפט בודק:

- מבנה HTML נכון
- נוכחות inline styles
- ייבוא CSS נכון
- שילוב Header System

**פלט:** `trading-ui/mockups/MOCKUPS_STANDARDIZATION_REPORT.md`

---

## רשימת עמודי מוקאפ

### עמודי daily-snapshots (11 עמודים)

1. `comparative-analysis-page.html`
2. `date-comparison-modal.html`
3. `economic-calendar-page.html`
4. `emotional-tracking-widget.html`
5. `history-widget.html`
6. `portfolio-state-page.html`
7. `price-history-page.html`
8. `strategy-analysis-page.html`
9. `trade-history-page.html`
10. `trading-journal-page.html`
11. `tradingview-test-page.html`

### עמודי מוקאפ נוספים

12. `../add-ticker-modal.html` - Modal קטן
13. `../flag-quick-action.html` - Modal קטן
14. `../watch-list-modal.html` - Modal קטן
15. `../watch-lists-page.html` - Full page

---

## הערות חשובות

- לא כל העמודים הם full pages - חלקם widgets/modals
- עמודי modal/widget לא חייבים unified-header אם הם נטענים כמודלים
- כל הסגנונות המשותפים נמצאים ב-`_mockups-common.css`
- אין להשתמש ב-inline styles - הכל דרך ITCSS

---

## עדכון אחרון

**תאריך:** 27 בנובמבר 2025  
**סטטוס:** ✅ הושלם - כל 15 עמודי המוקאפ עברו סטנדרטיזציה


# אינדקס מחלקות CSS - מפה למפתח
**project_domain:** TIKTRACK

**id:** `CSS_CLASSES_INDEX`  
**owner:** Team 40 (UI Assets & Design)  
**status:** 🔒 **SSOT - MANDATORY**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-02  
**version:** v1.4

---

**מיקום:** `documentation/04-DESIGN_UX_UI/`  
**תוקף:** מחייב לכל המערכת  
**עדכון אחרון:** Stage 2.4 - CSS Classes Index Update (Media Queries removal, Entity Colors, Fluid Design)

---

## 🎯 מטרה

מסמך זה מהווה מפה מרכזית לכל המחלקות CSS החשובות במערכת Phoenix V2. המטרה היא לאפשר שימוש חוזר מסודר בסגנונות אחידים ולמנוע כפילויות ודריסות.

**קישור לנוהל CSS:** `documentation/10-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md`  
**קישור ל-Fluid Design:** `documentation/04-DESIGN_UX_UI/TT2_RESPONSIVE_FLUID_DESIGN.md` 🛡️ **MANDATORY**

---

## 📚 היררכיית קבצי CSS (ITCSS)

### **סדר טעינה (קריטי!):**
1. **Pico CSS** (CDN) - Reset & Base (Generic Layer)
2. **phoenix-base.css** - Variables & Base Styles (Settings + Generic + Elements Layers) - **SSOT למשתני CSS**
3. **phoenix-components.css** - LEGO Components (Objects Layer)
4. **phoenix-header.css** - Unified Header (Components Layer) - **Fluid Design ✅**
5. **D15_IDENTITY_STYLES.css** - Auth Pages Styles (Components Layer)
6. **D15_DASHBOARD_STYLES.css** - Dashboard Pages Styles (Components Layer)

**הערה:** `phoenix-tables.css` לא קיים כרגע - יועבר מסטייג'ינג בעתיד.

**📋 תיעוד מפורט:** `documentation/04-DESIGN_UX_UI/CSS_LOADING_ORDER.md`  
**🔧 כלי בדיקה:** `npm run check:css` (הרץ `check-css-loading.js` בקונסולת הדפדפן)

### **ITCSS Layers:**
- **Settings:** CSS Variables (phoenix-base.css) - **SSOT לכל המשתנים**
- **Generic:** Reset & Base (Pico CSS + phoenix-base.css)
- **Elements:** HTML Elements (phoenix-base.css)
- **Objects:** LEGO Components (phoenix-components.css)
- **Components:** Page-specific Components (phoenix-tables.css, phoenix-header.css, D15_IDENTITY_STYLES.css, D15_DASHBOARD_STYLES.css)
- **Trumps:** Overrides (if needed)

### **🛡️ Fluid Design Mandate:**
- ✅ **אין Media Queries** (חוץ מ-Dark Mode: `@media (prefers-color-scheme: dark)`)
- ✅ **שימוש בלעדי ב-`clamp()`, `min()`, `max()`** ל-typography ו-spacing
- ✅ **Grid עם `auto-fit` / `auto-fill`** ל-layout
- ✅ **כל הערכים דינמיים** - אין breakpoints קבועים

### **🎨 Entity Colors (SSOT):**
כל ה-Entity Colors מוגדרים ב-`phoenix-base.css` בלבד:
- `--entity-trade-color` (#26baac)
- `--entity-trade-border`, `--entity-trade-bg`, `--entity-trade-text`
- `--entity-ticker-color` (#17a2b8)
- `--entity-ticker-border`, `--entity-ticker-bg`, `--entity-ticker-text`
- `--entity-trading-account-color` (#28a745)
- `--entity-trading-account-border`, `--entity-trading-account-bg`, `--entity-trading-account-text`
- `--entity-research-color` (#9c27b0)
- `--entity-execution-color` (#ff9800)

---

## 🗂️ קטגוריות מחלקות

### **1. מבנה עמוד (Page Structure)**

#### **`.page-wrapper`**
- **קובץ:** `phoenix-base.css`
- **תפקיד:** ראפר ראשי עם רקע אפור
- **שימוש:** כל עמוד
- **מאפיינים:**
  - `width: 100%`
  - `background-color: var(--apple-bg-secondary)`
  - `overflow-x: hidden !important`
  - `margin: 0; padding: 0`

#### **`.page-container`**
- **קובץ:** `phoenix-base.css`
- **תפקיד:** קונטיינר ממורכז, max-width 1400px
- **שימוש:** כל עמוד
- **מאפיינים:**
  - `max-width: 1400px !important`
  - `margin-inline: auto`
  - `overflow-x: hidden !important`

---

### **2. LEGO Components** (ITCSS: Objects Layer)

#### **`tt-container`**
- **קובץ:** `phoenix-components.css`
- **ITCSS Layer:** Objects
- **תפקיד:** Wrapper לתוכן עם padding אופקי
- **שימוש:** כל עמוד
- **מאפיינים:**
  - `padding-inline: var(--grid-gutter)`
  - `overflow-x: hidden !important`

#### **`tt-section`** 🛡️ **As Made (2026-02-02)**
- **קובץ:** `phoenix-components.css`
- **ITCSS Layer:** Objects
- **תפקיד:** יחידת תוכן עצמאית - **שקוף ללא רקע**
- **שימוש:** כל קונטיינר תוכן
- **מאפיינים:**
  - `background: transparent !important` - **CRITICAL: שקוף, רקע נמצא על header/body**
  - `border: none !important` - אין border (header/body יש להם)
  - `border-radius: 0 !important` - אין border-radius (header/body יש להם)
  - `box-shadow: none !important` - אין shadow (header/body יש להם)
  - `margin-block-start/end: var(--grid-gutter)`
  - `overflow-x: hidden !important`

**🛡️ CRITICAL - מבנה סקשנים:**
- `tt-section` הוא שקוף - הרקע נמצא על `.index-section__header` ו-`.index-section__body`
- עמודי Auth דורשים override ספציפי ב-`D15_IDENTITY_STYLES.css` (ראה למטה)

#### **`tt-section-row`**
- **קובץ:** `phoenix-components.css`
- **ITCSS Layer:** Objects
- **תפקיד:** חלוקה פנימית ל-Flex/Grid
- **שימוש:** בתוך `tt-section`
- **מאפיינים:**
  - `display: flex`
  - `flex-direction: column`
  - `gap: var(--grid-gutter)`

---

### **3. Authentication & Identity Pages** (ITCSS: Components Layer)

#### **`.auth-layout-root` / `body.auth-layout-root`**
- **קובץ:** `D15_IDENTITY_STYLES.css`
- **ITCSS Layer:** Components
- **תפקיד:** Layout root לעמודי Auth
- **שימוש:** Login, Register, Reset Password, Profile
- **מאפיינים:**
  - `min-height: 100vh`
  - `direction: rtl`
  - `display: flex`
  - `align-items: center`
  - `justify-content: center`
  - `background: var(--color-bg-grad)`

#### **`.auth-header`**
- **קובץ:** `D15_IDENTITY_STYLES.css`
- **ITCSS Layer:** Components
- **תפקיד:** כותרת עמוד Auth
- **שימוש:** כל עמוד Auth
- **מאפיינים:**
  - `text-align: center`
  - `margin-bottom: var(--spacing-lg)`

#### **`.auth-logo`**
- **קובץ:** `D15_IDENTITY_STYLES.css`
- **ITCSS Layer:** Components
- **תפקיד:** קונטיינר לוגו Auth
- **מאפיינים:**
  - `margin-bottom: var(--spacing-md)`

#### **`.auth-title`**
- **קובץ:** `D15_IDENTITY_STYLES.css`
- **ITCSS Layer:** Components
- **תפקיד:** כותרת ראשית Auth
- **מאפיינים:**
  - `font-size: 1.875rem`
  - `font-weight: 600`
  - `color: var(--color-text-main)`

#### **`.auth-subtitle`**
- **קובץ:** `D15_IDENTITY_STYLES.css`
- **ITCSS Layer:** Components
- **תפקיד:** כותרת משנה Auth
- **מאפיינים:**
  - `font-size: 1rem`
  - `color: var(--color-text-muted)`

#### **`.btn-auth-primary`**
- **קובץ:** `D15_IDENTITY_STYLES.css`
- **ITCSS Layer:** Components
- **תפקיד:** כפתור ראשי Auth
- **שימוש:** כל כפתור שליחה בטופס Auth
- **מאפיינים:**
  - `background-color: var(--color-brand)`
  - `color: white`
  - `width: 100%`
  - `padding: 0.75rem 1rem`
  - `border-radius: var(--apple-radius-medium)`

#### **`.auth-form__error`**
- **קובץ:** `D15_IDENTITY_STYLES.css`
- **ITCSS Layer:** Components
- **תפקיד:** הודעת שגיאה בטופס Auth
- **מאפיינים:**
  - `color: var(--color-error)`
  - `background-color: var(--color-error-lighter)`
  - `padding: var(--spacing-md)`
  - `border-radius: var(--apple-radius-small)`

#### **`.auth-form__error--hidden`**
- **קובץ:** `D15_IDENTITY_STYLES.css`
- **ITCSS Layer:** Components
- **תפקיד:** הסתרת שגיאה
- **מאפיינים:**
  - `display: none`

#### **`.auth-form__error-message`**
- **קובץ:** `D15_IDENTITY_STYLES.css`
- **ITCSS Layer:** Components
- **תפקיד:** הודעת שגיאה לשדה ספציפי
- **מאפיינים:**
  - `color: var(--color-error)`
  - `font-size: 0.875rem`

#### **`.auth-form__input--error`**
- **קובץ:** `D15_IDENTITY_STYLES.css`
- **ITCSS Layer:** Components
- **תפקיד:** שדה קלט עם שגיאה
- **מאפיינים:**
  - `border-color: var(--color-error)`

#### **`.auth-link`**
- **קובץ:** `D15_IDENTITY_STYLES.css`
- **ITCSS Layer:** Components
- **תפקיד:** קישור Auth
- **מאפיינים:**
  - `color: var(--color-brand)`
  - `text-decoration: none`

#### **`.auth-link-bold`**
- **קובץ:** `D15_IDENTITY_STYLES.css`
- **ITCSS Layer:** Components
- **תפקיד:** קישור Auth מודגש
- **מאפיינים:**
  - `font-weight: 600`

#### **`.auth-footer-zone`**
- **קובץ:** `D15_IDENTITY_STYLES.css`
- **ITCSS Layer:** Components
- **תפקיד:** אזור תחתון Auth
- **מאפיינים:**
  - `text-align: center`
  - `margin-top: var(--spacing-lg)`

#### **`.form-options`**
- **קובץ:** `D15_IDENTITY_STYLES.css`
- **ITCSS Layer:** Components
- **תפקיד:** קונטיינר אפשרויות טופס
- **מאפיינים:**
  - `display: flex`
  - `justify-content: space-between`
  - `align-items: center`

#### **`.remember-me`**
- **קובץ:** `D15_IDENTITY_STYLES.css`
- **ITCSS Layer:** Components
- **תפקיד:** תיבת סימון "זכור אותי"
- **מאפיינים:**
  - `display: flex`
  - `align-items: center`

---

### **4. Form Elements** (ITCSS: Elements Layer)

#### **`.form-group`**
- **קובץ:** `phoenix-base.css`
- **ITCSS Layer:** Elements
- **תפקיד:** קבוצת שדות טופס
- **שימוש:** כל טופס
- **מאפיינים:**
  - `margin-bottom: var(--spacing-md)`

#### **`.form-label`**
- **קובץ:** `phoenix-base.css` + `D15_IDENTITY_STYLES.css` (overrides)
- **ITCSS Layer:** Elements
- **תפקיד:** תווית שדה טופס
- **מאפיינים:**
  - `display: block`
  - `margin-bottom: var(--spacing-xs)`
  - `font-weight: 500`

#### **`.form-control`**
- **קובץ:** `phoenix-base.css` + `D15_IDENTITY_STYLES.css` (overrides)
- **ITCSS Layer:** Elements
- **תפקיד:** שדה קלט טופס
- **מאפיינים:**
  - `width: 100%`
  - `padding: var(--spacing-sm) var(--spacing-md)`
  - `border: 1px solid var(--apple-border)`
  - `border-radius: var(--apple-radius-small)`

#### **`.form-select`**
- **קובץ:** `phoenix-base.css`
- **ITCSS Layer:** Elements
- **תפקיד:** Dropdown טופס
- **מאפיינים:**
  - `width: 100%`
  - `padding: var(--spacing-sm) var(--spacing-md)`
  - `border: 1px solid var(--apple-border)`
  - `border-radius: var(--apple-radius-small)`

---

### **5. כותרות קונטיינרים (Container Headers)** (ITCSS: Components Layer)

#### **`.index-section__header` / `.dashboard-section__header`** 🛡️ **As Made (2026-02-02)**
- **קובץ:** `phoenix-components.css` ⚠️ **הועבר מ-D15_DASHBOARD_STYLES.css**
- **תפקיד:** כותרת קונטיינר ראשי - **כרטיס לבן נפרד**
- **שימוש:** כל קונטיינר תוכן (בתוך `tt-section` שקוף)
- **מבנה:** 3 חלקים (Title | Subtitle | Actions)
- **מאפיינים:**
  - `height: 60px !important` (קבוע, לא ניתן לשנות)
  - `flex-wrap: nowrap !important`
  - `align-items: center` - **CRITICAL: כל האלמנטים מיושרים לאמצע**
  - `justify-content: space-between` - **CRITICAL: מבנה 3 חלקים**
  - `padding: 0 var(--spacing-lg, 24px)` - רק אופקי, אין אנכי
  - `background: var(--apple-bg-elevated, #ffffff)` - רקע לבן
  - `border: 1px solid var(--apple-border-light, #e5e5e5)`
  - `border-radius: 8px`
  - `box-shadow: var(--apple-shadow-light, 0 1px 3px rgba(0, 0, 0, 0.1))`
  - `border-inline-start: 3px solid var(--color-brand)` - צבע ישות
  - `border-block-end: 3px solid var(--color-brand)` - צבע ישות
  - `margin-block-end: var(--spacing-xs, 4px)` - רווח קטן אפור

#### **`.index-section__header-title`** 🛡️ **As Made (2026-02-02)**
- **קובץ:** `phoenix-components.css` ⚠️ **הועבר מ-D15_DASHBOARD_STYLES.css**
- **תפקיד:** חלק 1 - כותרת עם איקון
- **מאפיינים:**
  - `flex-shrink: 0`
  - `display: flex`
  - `align-items: center`

#### **`.index-section__header-meta`** 🛡️ **As Made (2026-02-02)**
- **קובץ:** `phoenix-components.css` ⚠️ **הועבר מ-D15_DASHBOARD_STYLES.css**
- **תפקיד:** חלק 2 - כותרת משנה (מרכז)
- **מאפיינים:**
  - `flex: 1`
  - `justify-content: center`
  - `align-items: center`

#### **`.index-section__header-count`** 🛡️ **As Made (2026-02-02)**
- **קובץ:** `phoenix-components.css` ⚠️ **הועבר מ-D15_DASHBOARD_STYLES.css**
- **תפקיד:** טקסט כותרת משנה
- **מאפיינים:**
  - `text-align: center`
  - `opacity: 0.8`
  - `color: var(--color-brand)`

#### **`.index-section__header-actions`** 🛡️ **As Made (2026-02-02)**
- **קובץ:** `phoenix-components.css` ⚠️ **הועבר מ-D15_DASHBOARD_STYLES.css**
- **תפקיד:** חלק 3 - אזור כפתורים
- **מאפיינים:**
  - `flex-shrink: 0`
  - `justify-content: flex-end`
  - `align-items: center`

#### **`.index-section__header-toggle-btn`** 🛡️ **As Made (2026-02-02)**
- **קובץ:** `phoenix-components.css` ⚠️ **הועבר מ-D15_DASHBOARD_STYLES.css**
- **תפקיד:** כפתור סגירת סקשן
- **מאפיינים:**
  - `width: 32px`
  - `height: 32px`
  - `border-radius: 4px`

---

### **6. גופי קונטיינרים (Container Bodies)** (ITCSS: Components Layer)

#### **`.index-section__body` / `.dashboard-section__body`** 🛡️ **As Made (2026-02-02)**
- **קובץ:** `phoenix-components.css` ⚠️ **הועבר מ-D15_DASHBOARD_STYLES.css**
- **תפקיד:** גוף קונטיינר (כרטיס לבן נפרד)
- **מאפיינים:**
  - `background: var(--apple-bg-elevated, #ffffff)` - רקע לבן
  - `border: 1px solid var(--apple-border-light, #e5e5e5)`
  - `border-radius: 8px`
  - `box-shadow: var(--apple-shadow-light, 0 1px 3px rgba(0, 0, 0, 0.1))`
  - `padding: var(--spacing-lg, 24px)`

---

### **7. וויגיטים (Widgets)** (ITCSS: Components Layer)

#### **`.widget-placeholder`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** קונטיינר וויגיט
- **מאפיינים:**
  - `background: var(--apple-bg-elevated)`
  - `border-radius: 8px`
  - `min-height: 200px`

#### **`.widget-placeholder__header`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** כותרת וויגיט (כרטיס נפרד)
- **מאפיינים:**
  - `min-height: 48px`
  - `max-height: 60px`
  - `border-bottom: 1px solid`

#### **`.widget-placeholder__header-title-row`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** שורת כותרת וויגיט
- **מאפיינים:**
  - `height: 40px !important`
  - `align-items: center`
  - `padding: 0 var(--spacing-md)`

#### **`.widget-placeholder__title`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** כותרת וויגיט
- **מאפיינים:**
  - `font-size: clamp(0.875rem, 2vw, 1rem)`
  - `font-weight: 600`
  - `display: flex`
  - `align-items: center`

#### **`.widget-placeholder__title-icon`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** איקון כותרת וויגיט
- **מאפיינים:**
  - `width: 20px`
  - `height: 20px`
  - `flex-shrink: 0`

#### **`.widget-placeholder__refresh-btn`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** כפתור רענון וויגיט
- **מאפיינים:**
  - `width: 32px`
  - `height: 32px`
  - `border-radius: 4px`

#### **`.widget-placeholder__body`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** גוף וויגיט (כרטיס נפרד)
- **מאפיינים:**
  - `background: var(--apple-bg-elevated)`
  - `border-radius: 8px`

---

### **8. Header (אלמנט ראש הדף)** (ITCSS: Components Layer)

#### **`#unified-header`**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** Header ראשי - מופיע בכל העמודים (חוץ מעמודי Auth)
- **מאפיינים:**
  - `height: 120px !important` (60px + 60px)
  - `z-index: 950`
  - `position: sticky`
  - `background: var(--apple-bg-elevated, #ffffff)`

#### **`.header-content`**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** קונטיינר תוכן Header
- **מאפיינים:**
  - `display: flex`
  - `flex-direction: column`
  - `position: relative`

#### **`.header-top`**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** שורה עליונה של Header (60px)
- **מאפיינים:**
  - `height: 60px !important`
  - `border-bottom: 1px solid var(--apple-border-light)`
  - `direction: rtl`

#### **`.header-container`** 🛡️ **Fluid Design (2026-02-02)**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** קונטיינר Header
- **מאפיינים:**
  - `max-width: 1400px`
  - `margin: 0 auto`
  - `padding: clamp(12px, 2vw, 16px) clamp(10px, 1.5vw, 16px)` - **Fluid padding**
  - `flex-wrap: wrap` - **Fluid Design - wrap when needed**

#### **`.logo-section`**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** אזור לוגו
- **מאפיינים:**
  - `display: flex`
  - `align-items: center`
  - `direction: ltr`
  - `order: 3`

#### **`.logo`**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** קישור לוגו
- **מאפיינים:**
  - `display: flex`
  - `align-items: center`
  - `text-decoration: none`

#### **`.logo-image`**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** תמונת לוגו
- **מאפיינים:**
  - `width: 125px`
  - `height: 37.5px`
  - `object-fit: contain`

#### **`.logo-text`**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** טקסט סלוגן
- **מאפיינים:**
  - `font-size: 1rem !important`
  - `font-weight: 300 !important`
  - `color: #26baac !important`
  - `direction: ltr !important`

#### **`.user-zone`**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** אזור משתמש
- **מאפיינים:**
  - `display: flex`
  - `align-items: center`
  - `gap: var(--spacing-md)`

#### **`.user-info`**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** מידע משתמש
- **מאפיינים:**
  - `display: flex`
  - `flex-direction: column`
  - `align-items: flex-end`

#### **`.u-name`**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** שם משתמש
- **מאפיינים:**
  - `font-weight: 700`
  - `color: var(--color-text-main)`

#### **`.u-role`**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** תפקיד משתמש
- **מאפיינים:**
  - `font-size: 0.5625rem`
  - `text-transform: uppercase`

#### **`.u-avatar`**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** תמונת פרופיל משתמש
- **מאפיינים:**
  - `width: 36px`
  - `height: 36px`
  - `border-radius: 50%`

#### **`.header-nav`**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** אזור ניווט
- **מאפיינים:**
  - `display: flex`
  - `flex: 1`
  - `direction: rtl`
  - `order: 1`

#### **`.main-nav`**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** ניווט ראשי
- **מאפיינים:**
  - `display: flex`
  - `align-items: center`
  - `gap: 1rem`

#### **`.tiktrack-nav-list`** 🛡️ **Fluid Design (2026-02-02)**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** רשימת ניווט
- **מאפיינים:**
  - `display: flex`
  - `align-items: center`
  - `gap: clamp(0.5rem, 1vw, 1rem)` - **Fluid gap**

#### **`.tiktrack-nav-item`**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** פריט ניווט
- **מאפיינים:**
  - `position: relative`

#### **`.tiktrack-nav-link`** 🛡️ **Fluid Design (2026-02-02)**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** קישור ניווט
- **מאפיינים:**
  - `display: flex`
  - `align-items: center`
  - `padding: clamp(0.4rem, 1vw, 0.5rem) clamp(0.8rem, 1.5vw, 1rem)` - **Fluid padding**
  - `font-size: clamp(14px, 2vw, 16px)` - **Fluid font size**
  - `color: #26baac`

#### **`.nav-text`**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** טקסט ניווט
- **מאפיינים:**
  - `font-size: inherit`
  - `line-height: 1.4`

#### **`.nav-icon`**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** איקון ניווט
- **מאפיינים:**
  - `width: 16px`
  - `height: 16px`

#### **`.tiktrack-dropdown-menu`** 🛡️ **As Made (2026-02-02)**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** תפריט משנה
- **יישור:** `inset-inline-end: 0; inset-inline-start: auto;` - מיושר לתחילת הכפתור, הולך שמאלה
- **מאפיינים:**
  - `padding: 0.25rem 0;` - ריווח מופחת
  - `top: calc(100% + 3px);`
  - התנהגות: נפתח במעבר עכבר (hover-based)

#### **`.tiktrack-dropdown-item`** 🛡️ **As Made (2026-02-02)**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** פריט בתפריט משנה
- **מאפיינים:**
  - `padding: 0.25rem 0.5rem;` - ריווח מופחת

#### **`.tiktrack-dropdown-arrow`**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** חץ תפריט משנה
- **מאפיינים:**
  - `transition: transform 0.2s ease`

#### **`.separator`** 🛡️ **As Made (2026-02-02)**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** קו מפריד בתפריט משנה
- **מאפיינים:**
  - `height: 1px;` - דק מאוד
  - `margin: 0.25rem 0;` - ריווח מופחת
  - `box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);` - צל עדין מאוד

#### **`.header-filters`**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** אזור פילטרים (שורה תחתונה, 60px)
- **מאפיינים:**
  - `height: 60px`
  - `border-top: 1px solid var(--apple-border-light)`
  - `direction: rtl`

#### **`.filters-container`** 🛡️ **Fluid Design (2026-02-02)**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** קונטיינר פילטרים
- **מאפיינים:**
  - `display: flex`
  - `flex-wrap: wrap` - **Fluid Design**
  - `gap: clamp(0.75rem, 1.5vw, 1rem)` - **Fluid gap**
  - `padding: clamp(20px, 3vw, 24px) clamp(16px, 2vw, 20px) 0 clamp(16px, 2vw, 20px)` - **Fluid padding**
  - `justify-content: space-between` - **Fluid Design**

#### **`.filter-group`**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** קבוצת פילטרים
- **מאפיינים:**
  - `display: flex`
  - `position: relative`

#### **`.filter-toggle`** 🛡️ **Fluid Design (2026-02-02)**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** כפתור פילטר
- **מאפיינים:**
  - `display: flex`
  - `align-items: center`
  - `min-width: clamp(100px, 15vw, 120px)` - **Fluid min-width**
  - `font-size: clamp(0.85rem, 1.5vw, 1rem)` - **Fluid font size**
  - `padding: 0.125rem 0.6rem`

#### **`.filter-toggle:hover`** 🛡️ **As Made (2026-02-02)**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** התנהגות מעבר עכבר על פילטרים
- **מאפיינים:**
  - `border-color: var(--header-brand, #26baac)` - רק צבע משני
  - `color: var(--header-brand, #26baac)` - רק צבע משני
  - `background: white` - **CRITICAL: ללא שינוי רקע**
  - **ללא shadow** - רק שינוי צבע

#### **`.filter-menu`**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** תפריט פילטר
- **מאפיינים:**
  - `position: absolute`
  - `background: white`
  - `border: 1px solid var(--apple-border-light)`

#### **`.filter-toggle-section`**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** אזור כפתור toggle פילטרים
- **מאפיינים:**
  - `display: flex`
  - `align-items: center`

#### **`.filter-toggle-main`**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** כפתור toggle פילטרים ראשי
- **מאפיינים:**
  - `position: absolute`
  - `bottom: -24px`
  - `inset-inline-start: 50%`
  - `transform: translateX(-50%)`

#### **`.main-content`** 🛡️ **Fluid Design (2026-02-02)**
- **קובץ:** `phoenix-header.css`
- **ITCSS Layer:** Components
- **תפקיד:** קונטיינר תוכן ראשי
- **מאפיינים:**
  - `width: 100%`
  - `max-width: min(100%, 1400px)` - **Fluid Design - uses min() instead of Media Queries**
  - `margin: 0 auto`
  - `padding: 0`

#### **`body.auth-layout-root tt-section`** 🛡️ **As Made (2026-02-02)**
- **קובץ:** `D15_IDENTITY_STYLES.css`
- **תפקיד:** Override ספציפי לעמודי Auth
- **מאפיינים:**
  - `background: var(--apple-bg-elevated, #ffffff) !important;` - רקע לבן
  - `border: 1px solid var(--apple-border-light, #e5e5e5) !important;`
  - `box-shadow: var(--apple-shadow-medium, 0 4px 12px rgba(0, 0, 0, 0.15)) !important;`
  - `padding: var(--spacing-xl, 32px);`
  - `border-radius: 12px;`
- **סיבה:** עמודי Auth משתמשים ב-`tt-section` ישירות ללא `index-section__header`/`index-section__body`

---

### **9. פילטרים (Filters)** (ITCSS: Components Layer)

#### **`.portfolio-header-filters`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** קונטיינר פילטרים פורטפוליו
- **מאפיינים:**
  - `flex-wrap: nowrap !important`
  - `align-items: center`
  - `height: 100%`

#### **`.portfolio-filter-select`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** Dropdown פילטר
- **מאפיינים:**
  - `height: 32px`
  - `width: 50%`
  - `max-width: 200px`

#### **`.portfolio-side-filter-btn`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** כפתור פילטר צד
- **מאפיינים:**
  - `width: 32px`
  - `height: 32px`
  - `border-radius: 4px`

---

### **10. טבלאות (Tables)** (ITCSS: Components Layer)

#### **Phoenix Tables System** (`phoenix-tables.css`)

##### **Base Classes:**
- **`.phoenix-table-wrapper`** - Wrapper לטבלה (טיפול ב-overflow ו-scroll)
- **`.phoenix-table`** - טבלה בסיסית
- **`.phoenix-table__head`** - כותרת טבלה
- **`.phoenix-table__header`** - תא כותרת
- **`.phoenix-table__body`** - גוף טבלה
- **`.phoenix-table__row`** - שורה
- **`.phoenix-table__cell`** - תא

##### **Modifier Classes:**
- **`.phoenix-table__cell--numeric`** - תא מספרי (`tabular-nums`, monospace font)
- **`.phoenix-table__cell--currency`** - תא מטבע
- **`.phoenix-table__cell--date`** - תא תאריך
- **`.phoenix-table__cell--status`** - תא סטטוס
- **`.phoenix-table__cell--actions`** - תא פעולות

##### **Status Badges:**
- **`.phoenix-table__status-badge`** - Badge בסיסי
- **`.phoenix-table__status-badge--active`** - Badge פעיל
- **`.phoenix-table__status-badge--inactive`** - Badge לא פעיל
- **`.phoenix-table__status-badge--verified`** - Badge מאומת
- **`.phoenix-table__status-badge--pending`** - Badge ממתין
- **`.phoenix-table__status-badge--long`** - Badge Long
- **`.phoenix-table__status-badge--short`** - Badge Short

##### **Sort Indicators:**
- **`.phoenix-table__sort-indicator`** - Container לאינדיקטור סידור
- **`.phoenix-table__sort-icon`** - אייקון סידור
- **`.phoenix-table__sort-icon[data-sort-state="asc"]`** - מצב סידור עולה
- **`.phoenix-table__sort-icon[data-sort-state="desc"]`** - מצב סידור יורד
- **`.phoenix-table__sort-icon[data-sort-state="none"]`** - מצב ללא סידור

##### **JS Selectors (לבדיקות Selenium):**
- **`.js-table`** - selector לטבלה
- **`.js-table-sort-trigger`** - selector לסידור
- **`.js-sort-indicator`** - selector לאינדיקטור סידור
- **`.js-sort-icon`** - selector לאייקון סידור
- **`.js-table-error`** - selector לשגיאה
- **`.js-table-loading`** - selector לטעינה

**קישור למסמך מלא:** `documentation/01-ARCHITECTURE/TT2_TABLES_REACT_FRAMEWORK.md`

#### **`.portfolio-table-wrapper`** (Legacy)
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** Wrapper לטבלת פורטפוליו
- **מאפיינים:**
  - `overflow-x: auto`
  - `border-radius: 8px`

---

## 🎨 לוגיקת הגדרת מחלקות

### **עקרון 1: BEM Naming Convention**
```
.block__element--modifier
```

**דוגמאות:**
- `.index-section__header` (Block: `index-section`, Element: `header`)
- `.widget-placeholder__title-icon` (Block: `widget-placeholder`, Element: `title-icon`)
- `.portfolio-filter-select` (Block: `portfolio-filter`, Element: `select`)

### **עקרון 2: ITCSS Specificity Hierarchy**
1. **Settings** (`phoenix-base.css` - CSS Variables) - נמוכה ביותר
2. **Generic** (`Pico CSS` + `phoenix-base.css` - Reset & Base) - נמוכה
3. **Elements** (`phoenix-base.css` - HTML Elements) - בינונית-נמוכה
4. **Objects** (`phoenix-components.css` - LEGO Components) - בינונית
5. **Components** (`phoenix-tables.css`, `phoenix-header.css`, `D15_IDENTITY_STYLES.css`, `D15_DASHBOARD_STYLES.css`) - בינונית-גבוהה
6. **Trumps** (Overrides) - גבוהה ביותר

### **עקרון 3: CSS Variables בלבד (SSOT)**
```css
/* ✅ נכון */
color: var(--apple-text-primary);
color: var(--entity-trade-color);

/* ❌ שגוי */
color: #1d1d1f;
color: #26baac;
```

**חוק ברזל:** כל הצבעים חייבים להיות מוגדרים ב-`phoenix-base.css` בלבד (SSOT).

### **עקרון 3.1: Fluid Design - אין Media Queries**
```css
/* ✅ נכון - Fluid Design */
padding: clamp(12px, 2vw, 16px);
font-size: clamp(14px, 2vw, 16px);
max-width: min(100%, 1400px);
gap: clamp(0.5rem, 1vw, 1rem);

/* ❌ שגוי - Media Queries אסורים */
@media (min-width: 768px) {
  padding: 16px;
}
```

**חוק ברזל:** Media Queries מותרים **רק** עבור Dark Mode (`@media (prefers-color-scheme: dark)`).

### **עקרון 4: Fixed Heights עם !important**
```css
/* ✅ נכון */
height: 60px !important;
min-height: 60px !important;
max-height: 60px !important;

/* ❌ שגוי */
height: 60px;
```

### **עקרון 5: Overflow Prevention**
```css
/* ✅ נכון */
overflow-x: hidden !important;
width: 100%;
max-width: 100%;

/* ❌ שגוי */
overflow-x: auto;
```

---

## 📋 טבלת מחלקות מהירה

| מחלקה | קובץ | ITCSS Layer | שימוש | גובה קבוע |
|------|------|-------------|------|-----------|
| `.page-wrapper` | phoenix-base.css | Elements | כל עמוד | - |
| `.page-container` | phoenix-base.css | Elements | כל עמוד | - |
| `tt-container` | phoenix-components.css | Objects | כל עמוד | - |
| `tt-section` | phoenix-components.css | Objects | כל קונטיינר | - | 🛡️ **שקוף - רקע על header/body**
| `.auth-layout-root` | D15_IDENTITY_STYLES.css | Components | עמודי Auth | 100vh |
| `.auth-header` | D15_IDENTITY_STYLES.css | Components | עמודי Auth | - |
| `.btn-auth-primary` | D15_IDENTITY_STYLES.css | Components | כפתורי Auth | - |
| `.form-group` | phoenix-base.css | Elements | כל טופס | - |
| `.form-control` | phoenix-base.css | Elements | כל טופס | - |
| `.index-section__header` | phoenix-components.css | Components | כותרת קונטיינר | 60px | ⚠️ **הועבר מ-D15_DASHBOARD_STYLES.css**
| `.widget-placeholder__header-title-row` | D15_DASHBOARD_STYLES.css | Components | כותרת וויגיט | 40px |
| `#unified-header` | phoenix-header.css | Components | Header | 120px |
| `.header-top` | phoenix-header.css | Components | שורה עליונה | 60px |

---

## 🔍 חיפוש מחלקות לפי תפקיד

### **כותרות:**
- `.auth-header` - כותרת עמוד Auth
- `.auth-title` - כותרת ראשית Auth
- `.auth-subtitle` - כותרת משנה Auth
- `.index-section__header` - כותרת קונטיינר ראשי
- `.widget-placeholder__header-title-row` - כותרת וויגיט
- `#unified-header` - Header עמוד

### **גופים:**
- `.auth-layout-root` - Layout root לעמודי Auth
- `.index-section__body` - גוף קונטיינר
- `.widget-placeholder__body` - גוף וויגיט

### **כפתורים:**
- `.btn-auth-primary` - כפתור ראשי Auth
- `.index-section__header-toggle-btn` - כפתור סגירה
- `.widget-placeholder__refresh-btn` - כפתור רענון
- `.portfolio-side-filter-btn` - כפתור פילטר

### **טופסים:**
- `.form-group` - קבוצת שדות טופס
- `.form-label` - תווית שדה טופס
- `.form-control` - שדה קלט טופס
- `.form-select` - Dropdown טופס
- `.auth-form__error` - הודעת שגיאה בטופס
- `.auth-form__input--error` - שדה קלט עם שגיאה

### **פילטרים:**
- `.portfolio-header-filters` - קונטיינר פילטרים
- `.portfolio-filter-select` - Dropdown פילטר

---

## ⚠️ כללים למניעת כפילויות

### **1. בדיקה לפני יצירת מחלקה חדשה:**
- [ ] האם יש מחלקה קיימת שמתאימה?
- [ ] האם אפשר להרחיב מחלקה קיימת?
- [ ] האם זה באמת צריך מחלקה חדשה?

### **2. שימוש חוזר:**
- **תמיד** להשתמש במחלקות קיימות לפני יצירת חדשות
- **תמיד** לבדוק את האינדקס הזה לפני יצירת מחלקה

### **3. תיעוד:**
- כל מחלקה חדשה חייבת להיות מתועדת כאן
- כל שינוי במחלקה קיימת חייב להיות מתועד

---

## 🔗 קישורים רלוונטיים

- `documentation/10-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md` - נוהל CSS מלא
- `documentation/04-DESIGN_UX_UI/TT2_RESPONSIVE_FLUID_DESIGN.md` - אמנת רספונסיביות דינמית (Fluid Design) 🛡️ **MANDATORY**
- `documentation/04-DESIGN_UX_UI/CONTAINER_HEADER_STRUCTURE_GUIDELINES.md` - הנחיות כותרות
- `documentation/04-DESIGN_UX_UI/SYSTEM_WIDE_DESIGN_PATTERNS.md` - תובנות מערכתיות
- `ui/src/styles/phoenix-base.css` - SSOT למשתני CSS (v1.2.0)
- `ui/src/styles/phoenix-components.css` - LEGO Components
- `ui/src/styles/phoenix-tables.css` - Tables System ⚠️ **נדרש להעברה מסטייג'ינג**
- `ui/src/styles/phoenix-header.css` - Unified Header
- `ui/src/styles/D15_IDENTITY_STYLES.css` - Auth Pages Styles
- `ui/src/styles/D15_DASHBOARD_STYLES.css` - Dashboard Pages Styles
- `documentation/08-REPORTS/artifacts_SESSION_01/TEAM_40_CSS_HIERARCHY_AUDIT.md` - CSS Audit Report
- `documentation/08-REPORTS/artifacts_SESSION_01/TEAM_40_TASK_2.3_EVIDENCE.md` - CSS Refactor Evidence

---

**Team 40 (UI Assets & Design)**  
**Date:** 2026-02-02 (עודכן עם Fluid Design Mandate, Entity Colors, Media Queries removal)  
**Status:** ✅ **MANDATORY INDEX - ALL DEVELOPERS MUST USE**

**עדכון אחרון:** 2026-02-02 - Stage 2.4 Completion:
- ✅ הוספת Entity Colors documentation
- ✅ הוספת Fluid Design Mandate (clamp(), min(), max())
- ✅ עדכון Media Queries policy (רק Dark Mode מותר)
- ✅ עדכון Header Container עם Fluid Design
- ✅ עדכון ITCSS Layers עם SSOT information

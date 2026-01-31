# 🔄 עדכון חשוב: שילוב Blueprint (Team 31) | Team 30 (Frontend)

**From:** Team 10 (The Gateway)  
**To:** Team 30 (Frontend)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.3  
**Status:** ⚠️ **WORKFLOW UPDATE - CRITICAL**

---

## 🎯 שינוי חשוב בתהליך העבודה

**צוות 31 (Blueprint)** סיים את Batch 1 - Authentication Pages וסיפק **HTML/CSS מוכן ואושר**.

**השפעה על תהליך העבודה:**
- במקום לבנות components מאפס, אתם **חייבים להשתמש ב-HTML/CSS המוכן** של Team 31
- תפקידכם: **הוספת JavaScript/React Logic + חיבור ל-Backend API**
- **חובה לשמור על CSS Architecture** של Team 31

---

## 📦 מה Team 31 סיפק (Batch 1)

### ✅ קבצים מוכנים ואושרים:

**HTML Pages (3/3):**
- `D15_LOGIN.html` - ✅ VISUALLY APPROVED
- `D15_REGISTER.html` - ✅ VISUALLY APPROVED  
- `D15_RESET_PWD.html` - ✅ VISUALLY APPROVED

**CSS Architecture:**
- `phoenix-base.css` - Global base styles, CSS variables, typography
- `phoenix-components.css` - LEGO System components (tt-container, tt-section)
- `phoenix-header.css` - Unified header component (לא בשימוש ב-auth pages)
- `D15_IDENTITY_STYLES.css` - Auth-specific styles

**מיקום:** `_COMMUNICATION/team_31/team_31_staging/`

**⚠️ CRITICAL:** כל הקבצים ב-`team_31_staging/` הם **SIGNED-OFF ו-READY FOR INTEGRATION**

---

## 🔧 תהליך עבודה מעודכן - Phase 1.3

### **שלב 1: העתקת קבצים מ-Team 31**

**מקור:** `_COMMUNICATION/team_31/team_31_staging/`

**יעד:** `/ui/src/views/auth/` (או מיקום אחר לפי המבנה שלכם)

**קבצים להעתקה:**
1. HTML Files:
   - `D15_LOGIN.html`
   - `D15_REGISTER.html`
   - `D15_RESET_PWD.html`

2. CSS Files (אם לא קיימים כבר):
   - `phoenix-base.css` → `/ui/styles/phoenix-base.css`
   - `phoenix-components.css` → `/ui/styles/phoenix-components.css`
   - `D15_IDENTITY_STYLES.css` → `/ui/styles/D15_IDENTITY_STYLES.css`

**⚠️ IMPORTANT:** שמרו על סדר טעינת ה-CSS בדיוק כפי שמוגדר ב-HTML:
```html
<!-- 1. Pico CSS FIRST -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">

<!-- 2. Phoenix Base Styles -->
<link rel="stylesheet" href="./phoenix-base.css">

<!-- 3. LEGO Components -->
<link rel="stylesheet" href="./phoenix-components.css">

<!-- 4. Auth-Specific Styles -->
<link rel="stylesheet" href="./D15_IDENTITY_STYLES.css">
```

---

### **שלב 2: המרה ל-React Components (או שימוש ישיר)**

**אפשרות A: React Components (מומלץ)**
- המרת ה-HTML ל-JSX/TSX
- שמירה על המבנה המדויק של ה-HTML
- שמירה על כל ה-class names ו-structure
- הוספת React state management

**אפשרות B: HTML ישיר (אם אתם לא משתמשים ב-React)**
- שימוש ישיר ב-HTML files
- הוספת JavaScript vanilla לניהול forms
- חיבור ל-Backend API

**⚠️ CRITICAL:** **אל תשנו את ה-CSS או ה-HTML structure!**  
Team 31 עבדו קשה מאוד על pixel-perfect fidelity. כל שינוי צריך אישור.

---

### **שלב 3: הוספת JavaScript/React Logic**

#### **משימה 30.1.1: Auth Service (Frontend)** ✅ ללא שינוי
**תוצר:** `services/auth.ts` (או `.js`)

**פונקציות נדרשות:**
- `login(username_or_email, password)` → `LoginResponse`
- `register(user_data)` → `RegisterResponse`
- `refreshToken()` → `RefreshResponse` (using httpOnly cookie)
- `logout()` → Clear tokens
- `getCurrentUser()` → `UserResponse`
- Axios interceptor ל-JWT injection
- Token refresh interceptor (automatic refresh on 401)

**מקור:** `documentation/05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml`

---

#### **משימה 30.1.2: Login Component Integration** 🔄 מעודכן

**במקום:** בניית Login component מאפס

**עכשיו:**
1. ✅ השתמשו ב-`D15_LOGIN.html` של Team 31
2. ✅ המרו ל-React component (או השתמשו ישירות)
3. ✅ הוסיפו form handling:
   - Form submission handler
   - Validation (client-side)
   - Error handling & display
   - Loading states
   - Integration עם Auth Service
   - Redirect after login

**Form Fields (מתוך HTML של Team 31):**
- `username/email` input
- `password` input
- `remember_me` checkbox
- Submit button

**API Endpoint:** `POST /api/auth/login`

**תוצר:** `components/auth/LoginForm.tsx` (או `.jsx`)  
**Evidence:** שמור ב-`documentation/05-REPORTS/artifacts_SESSION_01/`

---

#### **משימה 30.1.3: Register Component Integration** 🔄 מעודכן

**במקום:** בניית Register component מאפס

**עכשיו:**
1. ✅ השתמשו ב-`D15_REGISTER.html` של Team 31
2. ✅ המרו ל-React component
3. ✅ הוסיפו form handling:
   - Form validation (username, email, password, phone)
   - Error handling
   - Loading states
   - Integration עם Auth Service
   - Redirect after registration

**Form Fields (מתוך HTML של Team 31):**
- `username` input
- `email` input
- `password` input
- `phone` input (optional)
- Submit button

**API Endpoint:** `POST /api/auth/register`

**תוצר:** `components/auth/RegisterForm.tsx`  
**Evidence:** שמור ב-`documentation/05-REPORTS/artifacts_SESSION_01/`

---

#### **משימה 30.1.4: Password Reset Flow Integration** 🔄 מעודכן

**במקום:** בניית Password Reset מאפס

**עכשיו:**
1. ✅ השתמשו ב-`D15_RESET_PWD.html` של Team 31
2. ✅ המרו ל-React component
3. ✅ הוסיפו form handling:
   - Request reset (EMAIL/SMS selection - אם נדרש)
   - Verify reset component (token/code input)
   - New password form
   - Error handling
   - Integration עם backend endpoints

**Form Fields (מתוך HTML של Team 31):**
- `email_or_phone` input
- Submit button

**API Endpoints:**
- `POST /api/auth/reset-password` (request)
- `POST /api/auth/verify-reset` (verify token/code)
- `POST /api/auth/verify-phone` (SMS verification)

**תוצר:** `components/auth/PasswordResetFlow.tsx`  
**Evidence:** שמור ב-`documentation/05-REPORTS/artifacts_SESSION_01/`

---

#### **משימות 30.1.5-30.1.7:** ללא שינוי
- משימה 30.1.5: API Keys Management (D24) - עדיין צריך לבנות מאפס (לא סופק על ידי Team 31)
- משימה 30.1.6: Security Settings View (D25) - עדיין צריך לבנות מאפס
- משימה 30.1.7: Protected Routes - ללא שינוי

---

## 🎨 Design System Compliance

**חובה לשמור על:**

1. **CSS Architecture של Team 31:**
   - סדר טעינת CSS בדיוק כפי שמוגדר
   - שימוש ב-CSS Variables מ-`phoenix-base.css`
   - שימוש ב-LEGO Components (`tt-container`, `tt-section`)

2. **RTL Charter:**
   - כל ה-HTML של Team 31 הוא RTL-compliant
   - שמרו על `dir="rtl"` ו-`direction: rtl`

3. **Visual Fidelity:**
   - אל תשנו את ה-styling
   - אל תשנו את ה-structure
   - Pixel-perfect match ל-legacy design

---

## 🚨 נוהל CSS מחייב - TT2_CSS_STANDARDS_PROTOCOL

**⚠️ CRITICAL:** לאחר ביקורת אדריכלית ראשית, הוגדר **נוהל CSS מחייב** שכל הצוותים חייבים לעמוד בו.

### **📄 מסמך מחייב:**
`documentation/07-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md`

**חובה לקרוא ולעקוב אחרי כל הכללים במסמך זה לפני כל עבודה על CSS.**

### **עיקרי הנוהל:**

#### **1. מתודולוגיית עבודה: ITCSS + BEM**
- **ITCSS Hierarchy:** סדר קדוש - Settings → Tools → Generic → Elements → Objects → Components → Trumps
- **BEM Naming:** Block__Element--Modifier (אין קינון של יותר מ-2 רמות)

#### **2. בקרת רספונסיביות (Fluid Design)**
- **Fluid Typography:** שימוש ב-`clamp()` במקום Media Queries
- **Container Queries:** שימוש ב-`@container` במקום `@media` (מסך)
- **Logical Viewports:** שימוש ב-`svh`/`lvh` במקום `vh` רגיל

#### **3. הרחבת G-Bridge: אוטומציית Linter**
- **Physical Property Blocker:** חסימה אוטומטית של כל מאפיין פיזי (`margin-left`, `padding-right`, `left`, `right`, `float: left/right`)
- **Z-Index Registry:** כל Z-Index חייב להיות מוגדר דרך משתנה DNA (`--z-index-*`)
- **Color Clamp:** חסימה של כל צבע שלא מופיע ברשימת המשתנים המאושרת

#### **4. מערכת הבקרה הויזואלית**
- **Pixel Match:** סטייה של 0 פיקסלים בכל אלמנט (Digital Twin)
- **RTL Mirroring:** כל אלמנטים עם `position: absolute` משתמשים ב-`inset-inline-*`
- **State Integrity:** כל מצבי Hover, Focus, Active נשמרים

#### **5. חוקי הניקיון (Maintainability)**
- **No Magic Numbers:** כל ריווח חייב להיות כפולה של 8px (יחידת DNA בסיסית)
- **CSS Shorthand:** חובה להשתמש בקיצורים (`margin-block`, `padding-inline`)
- **Comments LOD 400:** כל בלוק קוד חייב לכלול כותרת עם Purpose, Legacy Reference, LOD 400 Requirement

#### **6. סדר טעינת קבצי CSS (CRITICAL)**
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
<link rel="stylesheet" href="./D15_IDENTITY_STYLES.css">
```

**⚠️ IMPORTANT:** שינוי הסדר יגרום לשבירת סגנונות.

#### **7. רשימת בדיקות לפני הגשה**

**בדיקות אוטומטיות (G-Bridge):**
- [ ] G-Bridge validation passed
- [ ] No physical properties found
- [ ] All Z-Indexes use CSS variables
- [ ] No hardcoded colors found
- [ ] All spacing uses DNA multiples (8px)
- [ ] RTL Charter compliance verified

**בדיקות ידניות:**
- [ ] Visual comparison with Legacy (0 pixel deviation)
- [ ] RTL mirroring verified
- [ ] All states tested (hover, focus, active, disabled)
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Container queries tested (if used)
- [ ] Logical viewports tested (svh/lvh)
- [ ] Comments LOD 400 added to all major blocks
- [ ] CSS shorthand used throughout
- [ ] No magic numbers found

### **⚠️ כללי ברזל נוספים:**

1. **אין מאפיינים פיזיים:** רק `margin-inline-*`, `padding-block-*`, `inset-inline-*`
2. **אין צבעים ישירים:** רק CSS Variables מ-`:root`
3. **אין Z-Index ישיר:** רק דרך `--z-index-*` variables
4. **אין Magic Numbers:** רק כפולות של 8px
5. **אין Media Queries:** רק Container Queries ו-Fluid Typography

### **📚 משאבים:**
- **מסמך מלא:** `documentation/07-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md`
- **דוגמאות מעשיות:** כלולות במסמך
- **G-Bridge:** כלי אוטומטי לבדיקת compliance

**חובה לקרוא את המסמך המלא לפני כל עבודה על CSS!**

---

## 📋 קבצים רלוונטיים מ-Team 31

**חובה לקרוא:**

1. **Handoff Document:**
   - `_COMMUNICATION/team_31/TEAM_31_BATCH_1_HANDOFF_TO_TEAM_10.md`

2. **Implementation Guide:**
   - `_COMMUNICATION/team_31/team_31_staging/BATCH_1_AUTH_COMPLETE.md`

3. **Standard Workflow:**
   - `_COMMUNICATION/team_31/team_31_staging/STANDARD_PAGE_BUILD_WORKFLOW.md`

4. **Preview Files (להתייחסות ויזואלית):**
   - `_COMMUNICATION/team_31/team_31_staging/_PREVIEW_D15_LOGIN.html`
   - `_COMMUNICATION/team_31/team_31_staging/_PREVIEW_D15_REGISTER.html`
   - `_COMMUNICATION/team_31/team_31_staging/_PREVIEW_D15_RESET_PWD.html`

5. **🚨 CSS Standards Protocol (MANDATORY):**
   - `documentation/07-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md` - **חובה לקרוא לפני כל עבודה על CSS!**

---

## 🚨 כללי ברזל

1. **אל תשנו את ה-HTML/CSS של Team 31** ללא אישור מפורש
2. **שמרו על CSS Loading Order** בדיוק כפי שמוגדר
3. **השתמשו ב-CSS Variables** מ-`phoenix-base.css` (לא hardcoded colors)
4. **שמרו על RTL compliance** בכל השינויים
5. **תעדו כל שינוי** שאתם עושים ב-Evidence files
6. **🚨 חובה לעמוד בנוהל CSS המחייב:** `TT2_CSS_STANDARDS_PROTOCOL.md`
7. **🚨 אין מאפיינים פיזיים:** רק Logical Properties (`margin-inline-*`, `padding-block-*`)
8. **🚨 אין Magic Numbers:** רק כפולות של 8px (יחידת DNA בסיסית)
9. **🚨 אין Z-Index ישיר:** רק דרך CSS Variables (`--z-index-*`)
10. **🚨 G-Bridge validation:** חובה לפני כל הגשה

---

## 📡 דיווח נדרש

### דיווח EOD (End of Day):
כל יום בסיום העבודה, שלחו לצוות 10:
- מה הושלם היום
- מה מתוכנן למחר
- חסמים או שאלות
- Integration issues (אם יש)
- **שינויים ב-HTML/CSS של Team 31** (אם היו)

### דיווח סיום משימה:
לאחר השלמת כל משימה, שלחו:
```text
From: Team 30
To: Team 10 (The Gateway)
Subject: Task Completion | WP-30.1.X | Blueprint Integration
Status: COMPLETED
Blueprint Source: team_31_staging/[FILE_NAME]
Changes Made: [רשימת שינויים ב-HTML/CSS, אם היו]
Evidence: documentation/05-REPORTS/artifacts_SESSION_01/TEAM_30_TASK_30.1.X_EVIDENCE.md
log_entry | [Team 30] | TASK_COMPLETE | 30.1.X | GREEN
```

---

## 🔄 Next Steps

1. **🚨 CRITICAL:** קראו את `TT2_CSS_STANDARDS_PROTOCOL.md` לפני כל עבודה על CSS
2. **קראו את כל המסמכים של Team 31:**
   - Handoff Document
   - Implementation Guide
   - Standard Workflow
3. **העתיקו קבצים:** העתיקו את כל הקבצים מ-`team_31_staging/` למיקום המתאים ב-`/ui`
4. **התחילו עם Auth Service:** משימה 30.1.1 (ללא שינוי)
5. **התחילו עם Login Integration:** משימה 30.1.2 (עם HTML של Team 31)
6. **בדיקת G-Bridge:** הרצו G-Bridge validation לפני כל הגשה

---

## 📞 Support

**לשאלות על Blueprint:**
- **Documentation:** `team_31_staging/BATCH_1_AUTH_COMPLETE.md`
- **Workflow:** `team_31_staging/STANDARD_PAGE_BUILD_WORKFLOW.md`
- **Contact:** Team 31 (Blueprint) דרך Team 10

**לשאלות על Backend Integration:**
- **API Spec:** `documentation/05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml`
- **Contact:** Team 20 (Backend) דרך Team 10

---

**Prepared by:** Team 10 (The Gateway)  
**Status:** ⚠️ **WORKFLOW UPDATED - TEAM 30 MUST USE TEAM 31 BLUEPRINT + CSS STANDARDS PROTOCOL**  
**Next:** Awaiting Team 30 confirmation and integration progress

**Updates:**
- 2026-01-31: Added CSS Standards Protocol (TT2_CSS_STANDARDS_PROTOCOL.md) - MANDATORY compliance required

---

**log_entry | Team 10 | WORKFLOW_UPDATE | TEAM_30_BLUEPRINT_INTEGRATION | YELLOW | 2026-01-31**
**log_entry | Team 10 | CSS_STANDARDS_UPDATE | TT2_CSS_STANDARDS_PROTOCOL | RED | 2026-01-31**

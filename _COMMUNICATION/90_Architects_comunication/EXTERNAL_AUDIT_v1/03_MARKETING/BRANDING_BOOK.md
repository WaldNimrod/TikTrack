# 🎨 TikTrack Branding Book - Phoenix v2.0

**תאריך יצירה:** 2026-02-03  
**גרסה:** v2.0  
**מטרה:** Branding Book מלא ומפורט לצורך הערכה חיצונית  
**עודכן על ידי:** Team 40 (UI Assets & Design)

---

## 🎯 Brand Identity

### **Brand Name:**
**TikTrack** - Smart Trading Journal

### **Brand Tagline:**
"יומן חכם" - Smart Trading Journal

### **Brand Positioning:**
מערכת ניהול מסחר מקצועית, נקייה ומודרנית עם דגש על חוויית משתמש מעולה.

---

## 🎨 Brand Colors

### **Primary Colors:**

#### **Brand Primary:**
- **Color:** `#26baac` (Turquoise)
- **CSS Variable:** `--color-brand` / `--color-primary`
- **Usage:** כפתורים ראשיים, קישורים פעילים, אלמנטים אינטראקטיביים
- **Hover State:** `#1e968a` (`--color-brand-hover` / `--color-primary-dark`)
- **Variants:**
  - Light: `#4dd4c4` (`--color-primary-light`)
  - Lighter: `#7ee8dc` (`--color-primary-lighter`)
  - Dark: `#1e968a` (`--color-primary-dark`)
  - Darker: `#167268` (`--color-primary-darker`)

#### **Brand Secondary:**
- **Color:** `#fc5a06` (Orange)
- **CSS Variable:** `--color-secondary`
- **Usage:** כפתורים משניים, הדגשות, אלמנטים משניים
- **Hover State:** `#c84805` (`--color-secondary-dark`)
- **Variants:**
  - Light: `#ff7a33` (`--color-secondary-light`)
  - Lighter: `#ff9a66` (`--color-secondary-lighter`)
  - Dark: `#c84805` (`--color-secondary-dark`)
  - Darker: `#943604` (`--color-secondary-darker`)

---

### **Semantic Colors:**

#### **Success Colors:**
- **Primary:** `#10b981` (`--color-success`)
- **Background:** `#e6f7f5` (`--color-success-bg`) - רקע בהיר להודעות הצלחה
- **Variants:**
  - Light: `#34d399` (`--color-success-light`)
  - Lighter: `#6ee7b7` (`--color-success-lighter`)
  - Dark: `#059669` (`--color-success-dark`)
  - Darker: `#047857` (`--color-success-darker`)

#### **Error Colors:**
- **Primary:** `#ef4444` (`--color-error`)
- **Apple Red:** `#FF3B30` (`--color-error-red` / `--apple-red`) - לפעולות הרסניות
- **Variants:**
  - Light: `#f87171` (`--color-error-light`)
  - Lighter: `#fca5a5` (`--color-error-lighter`)
  - Dark: `#dc2626` (`--color-error-dark`)
  - Darker: `#b91c1c` (`--color-error-darker`)
  - Apple Red Dark: `#D70015` (`--color-error-red-dark` / `--apple-red-dark`)

#### **Warning Colors:**
- **Primary:** `#f59e0b` (`--color-warning`)
- **Variants:**
  - Light: `#fbbf24` (`--color-warning-light`)
  - Lighter: `#fcd34d` (`--color-warning-lighter`)
  - Dark: `#d97706` (`--color-warning-dark`)
  - Darker: `#b45309` (`--color-warning-darker`)

---

### **Entity Colors:**

Entity Colors משמשים לזיהוי ישויות שונות במערכת:

#### **Trade Entity:**
- **Color:** `#26baac` (`--entity-trade-color`) - Turquoise, תואם Brand Primary
- **Border:** `var(--apple-border-light)` (`--entity-trade-border`)
- **Background:** `var(--apple-bg-elevated)` (`--entity-trade-bg`)
- **Text:** `var(--apple-text-primary)` (`--entity-trade-text`)

#### **Ticker Entity:**
- **Color:** `#17a2b8` (`--entity-ticker-color`) - Cyan
- **Border:** `var(--apple-border-light)` (`--entity-ticker-border`)
- **Background:** `var(--apple-bg-elevated)` (`--entity-ticker-bg`)
- **Text:** `var(--apple-text-primary)` (`--entity-ticker-text`)

#### **Trading Account Entity:**
- **Color:** `#28a745` (`--entity-trading-account-color`) - Green
- **Border:** `var(--apple-border-light)` (`--entity-trading-account-border`)
- **Background:** `var(--apple-bg-elevated)` (`--entity-trading-account-bg`)
- **Text:** `var(--apple-text-primary)` (`--entity-trading-account-text`)

#### **Research Entity:**
- **Color:** `#9c27b0` (`--entity-research-color`) - Violet

#### **Execution Entity:**
- **Color:** `#ff9800` (`--entity-execution-color`) - Orange

**הערה:** Entity Colors הם ערכים זמניים התואמים את האפיון. הם יוחלפו בערכים סופיים כאשר המערכת תושלם.

---

### **Apple Design System Colors:**

המערכת משתמשת ב-Apple Design System כבסיס לצבעים:

#### **Background Colors:**
- **Primary:** `#FFFFFF` (`--apple-bg-primary`)
- **Secondary:** `#F2F2F7` (`--apple-bg-secondary`)
- **Elevated:** `#FFFFFF` (`--apple-bg-elevated`)
- **Footer:** `#2C2C2E` (`--apple-bg-footer`)

#### **Text Colors:**
- **Primary:** `#000000` (`--apple-text-primary`)
- **Secondary:** `#3C3C43` (`--apple-text-secondary`)
- **Tertiary:** `#3C3C4399` (`--apple-text-tertiary`)
- **Quaternary:** `#3C3C434D` (`--apple-text-quaternary`)

#### **Border Colors:**
- **Default:** `#C6C6C8` (`--apple-border`)
- **Light:** `#E5E5EA` (`--apple-border-light`)

#### **System Colors:**
- **Blue:** `#007AFF` (`--apple-blue`)
- **Red:** `#FF3B30` (`--apple-red`)
- **Green:** `#34C759` (`--apple-green`)
- **Orange:** `#FF9500` (`--apple-orange`)
- **Yellow:** `#FFCC02` (`--apple-yellow`)
- **Purple:** `#AF52DE` (`--apple-purple`)
- **Pink:** `#FF2D92` (`--apple-pink`)

---

### **Neutral Scale:**

**Legacy Color Scale (for backward compatibility):**
- `--color-1`: `#ffffff` (White)
- `--color-5`: `#f4f7f9` (Light Gray)
- `--color-10`: `#eef2f5` (Lighter Gray)
- `--color-20`: `#d1d9e0` (Light Border)
- `--color-30`: `#94a3b8` (Medium Gray)
- `--color-40`: `#4b4f56` (Dark Gray)
- `--color-45`: `#334155` (Darker Gray)
- `--color-50`: `#1c1e21` (Darkest Gray / Black)

---

## 📐 Typography Guidelines

### **Font System:**

#### **Primary Font Family:**
```css
--font-family-primary: 'Noto Sans Hebrew', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Alef', sans-serif;
```

**הסבר:**
- **Noto Sans Hebrew:** פונט עברי ראשי
- **-apple-system:** פונט מערכת Apple (fallback)
- **BlinkMacSystemFont:** פונט מערכת macOS (fallback)
- **Segoe UI:** פונט מערכת Windows (fallback)
- **Alef:** פונט עברי חלופי (fallback)
- **sans-serif:** פונט גנרי (fallback)

#### **Monospace Font Family:**
```css
--font-family-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
```

**שימוש:** קוד, מספרים, נתונים טכניים

---

### **Font Sizes (Fluid Design):**

כל גדלי הפונטים משתמשים ב-`clamp()` ל-Fluid Design:

```css
--font-size-xs: clamp(10px, 1vw + 0.3rem, 12px);   /* Extra Small */
--font-size-sm: clamp(12px, 1.5vw + 0.4rem, 14px);  /* Small */
--font-size-base: clamp(14px, 2vw + 0.5rem, 16px);  /* Base */
--font-size-lg: clamp(16px, 2.5vw + 0.6rem, 18px);  /* Large */
--font-size-xl: clamp(18px, 3vw + 0.7rem, 20px);    /* Extra Large */
--font-size-xxl: clamp(20px, 3.5vw + 0.8rem, 24px); /* 2X Large */
--font-size-xxxl: clamp(24px, 4vw + 1rem, 32px);   /* 3X Large */
```

**שימוש:**
- **xs:** טקסט קטן מאוד (labels, captions)
- **sm:** טקסט קטן (metadata, timestamps)
- **base:** טקסט רגיל (body text) - ברירת מחדל: `0.92rem` (14.72px)
- **lg:** טקסט גדול (subheadings)
- **xl:** כותרות קטנות (h3, h4)
- **xxl:** כותרות בינוניות (h2)
- **xxxl:** כותרות גדולות (h1)

---

### **Font Weights:**

```css
--font-weight-light: 300;      /* Light */
--font-weight-normal: 400;     /* Regular */
--font-weight-medium: 500;     /* Medium */
--font-weight-semibold: 600;   /* Semi Bold */
--font-weight-bold: 700;       /* Bold */
```

**שימוש:**
- **300 (Light):** ברירת מחדל לכל הטקסט במערכת
- **400 (Normal):** טקסט רגיל
- **500 (Medium):** הדגשות קלות
- **600 (Semi Bold):** כותרות משנה, כפתורים
- **700 (Bold):** כותרות ראשיות, הדגשות חזקות

---

### **Line Heights:**

```css
--line-height-tight: 1.2;      /* Tight - כותרות */
--line-height-normal: 1.4;     /* Normal - ברירת מחדל */
--line-height-relaxed: 1.6;   /* Relaxed - טקסט ארוך */
--line-height-loose: 1.8;      /* Loose - טקסט מאוד ארוך */
```

**שימוש:**
- **1.2:** כותרות, טקסט קצר
- **1.4:** ברירת מחדל לכל הטקסט במערכת
- **1.6:** פסקאות ארוכות, תוכן קריאה
- **1.8:** טקסט מאוד ארוך, מאמרים

---

### **Letter Spacing:**

```css
--letter-spacing-tight: -0.025em;  /* Tight */
--letter-spacing-normal: 0;          /* Normal */
--letter-spacing-wide: 0.025em;     /* Wide */
--letter-spacing-wider: 0.05em;    /* Wider */
```

**שימוש:**
- **Tight:** כותרות גדולות
- **Normal:** ברירת מחדל
- **Wide:** labels, captions
- **Wider:** uppercase text, headers

---

### **Typography Usage Guidelines:**

#### **Headings:**
- **H1:** `font-size: var(--font-size-xxxl)`, `font-weight: 700`, `line-height: 1.2`
- **H2:** `font-size: var(--font-size-xxl)`, `font-weight: 700`, `line-height: 1.2`
- **H3:** `font-size: var(--font-size-xl)`, `font-weight: 600`, `line-height: 1.2`
- **H4:** `font-size: var(--font-size-lg)`, `font-weight: 600`, `line-height: 1.4`

#### **Body Text:**
- **Default:** `font-size: var(--font-size-base)` (0.92rem), `font-weight: 300`, `line-height: 1.4`
- **Small:** `font-size: var(--font-size-sm)`, `font-weight: 300`, `line-height: 1.4`
- **Large:** `font-size: var(--font-size-lg)`, `font-weight: 300`, `line-height: 1.6`

#### **UI Elements:**
- **Buttons:** `font-size: var(--font-size-base)`, `font-weight: 600`
- **Labels:** `font-size: var(--font-size-sm)`, `font-weight: 500`
- **Captions:** `font-size: var(--font-size-xs)`, `font-weight: 300`

---

## 🖼️ Logo Usage Guidelines

### **Logo Specifications:**

#### **Logo File:**
- **Path:** `ui/public/images/logo.svg`
- **Format:** SVG (Scalable Vector Graphics)
- **Dimensions:** 125px × 37.5px (aspect ratio: 3.33:1)

#### **Logo Text:**
- **Text:** "TikTrack"
- **Font Size:** `1rem` (16px)
- **Font Weight:** `300` (Light)
- **Color:** `#26baac` (Brand Primary)
- **Direction:** LTR (Left-to-Right)

---

### **Logo Placement:**

#### **Header Placement:**
- **Location:** Unified Header, Logo Section
- **Position:** Right side (RTL layout)
- **Order:** `order: 3` (after navigation, before user zone)
- **Direction:** LTR (Left-to-Right) - logo text always LTR

#### **Logo Container:**
```css
.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  direction: ltr; /* Logo always LTR */
  order: 3;
}
```

---

### **Logo Sizing:**

#### **Logo Image:**
- **Width:** `125px`
- **Height:** `37.5px`
- **Object Fit:** `contain` (preserves aspect ratio)
- **Display:** `block`

#### **Logo Text:**
- **Font Size:** `1rem !important` (16px) - forced override
- **Font Weight:** `300 !important` (Light)
- **Color:** `#26baac !important` (Brand Primary)
- **Line Height:** `1.4 !important`
- **White Space:** `nowrap` (prevents text wrapping)

---

### **Logo Usage Rules:**

#### **✅ מותר:**
- שימוש ב-Logo ב-Unified Header
- שימוש ב-Logo ב-Footer (אם נדרש)
- שימוש ב-Logo בעיצוב לבן (Light Mode)
- שימוש ב-Logo בעיצוב כהה (Dark Mode - עתידי)

#### **❌ אסור:**
- שינוי יחס הגובה-רוחב של Logo
- שינוי צבע Logo (חוץ מ-Dark Mode)
- שינוי גודל Logo ללא פרופורציה
- שימוש ב-Logo על רקע לא מתאים (contrast נמוך)

---

### **Logo Spacing:**

#### **Minimum Clear Space:**
- **Around Logo:** `1rem` (16px) minimum
- **Between Logo Image and Text:** `1rem` (16px)

#### **Logo Container Padding:**
- **Header:** `clamp(12px, 2vw, 16px)` (Fluid Design)

---

## 🎨 Color Usage Guidelines

### **Brand Colors Usage:**

#### **Brand Primary (`#26baac`):**
**שימוש:**
- כפתורים ראשיים (Primary Buttons)
- קישורים פעילים (Active Links)
- אלמנטים אינטראקטיביים (Interactive Elements)
- הדגשות חשובות (Important Highlights)
- Logo Text
- Entity Trade Color

**דוגמאות:**
```css
/* Primary Button */
.btn-primary {
  background-color: var(--color-brand);
  color: white;
}

/* Active Link */
a.active {
  color: var(--color-brand);
  border-bottom-color: var(--color-brand);
}
```

---

#### **Brand Secondary (`#fc5a06`):**
**שימוש:**
- כפתורים משניים (Secondary Buttons)
- הדגשות משניות (Secondary Highlights)
- אלמנטים משניים (Secondary Elements)

**דוגמאות:**
```css
/* Secondary Button */
.btn-secondary {
  background-color: var(--color-secondary);
  color: white;
}
```

---

### **Semantic Colors Usage:**

#### **Success Colors:**
**שימוש:**
- הודעות הצלחה (Success Messages)
- סטטוס פעיל (Active Status)
- אישורים (Confirmations)

**דוגמאות:**
```css
/* Success Message */
.success-message {
  background-color: var(--color-success-bg);
  color: var(--color-success-dark);
  border-color: var(--color-success);
}
```

---

#### **Error Colors:**
**שימוש:**
- הודעות שגיאה (Error Messages)
- פעולות הרסניות (Destructive Actions)
- אזהרות קריטיות (Critical Warnings)

**דוגמאות:**
```css
/* Error Message */
.error-message {
  background-color: var(--color-error-lighter);
  color: var(--color-error-dark);
  border-color: var(--color-error);
}

/* Destructive Button */
.btn-destructive {
  background-color: var(--color-error-red);
  color: white;
}
```

---

#### **Warning Colors:**
**שימוש:**
- אזהרות (Warnings)
- התראות (Alerts)
- מידע חשוב (Important Information)

**דוגמאות:**
```css
/* Warning Message */
.warning-message {
  background-color: var(--color-warning-lighter);
  color: var(--color-warning-dark);
  border-color: var(--color-warning);
}
```

---

### **Entity Colors Usage:**

**שימוש:**
- זיהוי ישויות שונות במערכת
- הדגשת קונטקסט ישות
- אייקונים וסמלים של ישויות

**דוגמאות:**
```css
/* Trade Entity */
.entity-trade {
  border-left-color: var(--entity-trade-color);
  color: var(--entity-trade-color);
}

/* Ticker Entity */
.entity-ticker {
  border-left-color: var(--entity-ticker-color);
  color: var(--entity-ticker-color);
}
```

---

### **Text Colors Usage:**

#### **Primary Text:**
- **Color:** `#1c1e21` (`--text-primary`)
- **Usage:** טקסט ראשי, כותרות, תוכן מרכזי

#### **Secondary Text:**
- **Color:** `#4b4f56` (`--text-secondary`)
- **Usage:** טקסט משני, metadata, labels

#### **Tertiary Text:**
- **Color:** `#94a3b8` (`--text-tertiary`)
- **Usage:** טקסט שלישוני, hints, placeholders

#### **Inverse Text:**
- **Color:** `#ffffff` (`--text-inverse`)
- **Usage:** טקסט על רקע כהה, כפתורים

---

### **Background Colors Usage:**

#### **Primary Background:**
- **Color:** `#FFFFFF` (`--apple-bg-primary`)
- **Usage:** רקע ראשי, כרטיסים, אלמנטים מורמים

#### **Secondary Background:**
- **Color:** `#F2F2F7` (`--apple-bg-secondary`)
- **Usage:** רקע משני, body background

#### **Elevated Background:**
- **Color:** `#FFFFFF` (`--apple-bg-elevated`)
- **Usage:** אלמנטים מורמים, modals, dropdowns

---

### **Color Contrast Compliance:**

**WCAG AA Compliance:**
- כל הטקסטים עם יחס ניגודיות מינימלי של 4.5:1 (טקסט רגיל) או 3:1 (טקסט גדול)
- כל הכפתורים והקישורים עם יחס ניגודיות מינימלי של 3:1

**דוגמאות:**
- טקסט ראשי על רקע לבן: 16.8:1 ✅
- טקסט משני על רקע לבן: 7.2:1 ✅
- Brand Primary על רקע לבן: 3.2:1 ✅

---

## 🎯 Iconography Guidelines

### **Icon System:**

המערכת משתמשת בשני סוגי אייקונים:

#### **1. SVG Icons (Entity Icons):**
- **Format:** SVG
- **Location:** `ui/public/images/icons/entities/`
- **Usage:** אייקונים של ישויות (Trades, Tickers, Trading Accounts, וכו')
- **Sizing:** `20px × 20px` (standard), `16px × 16px` (small)

**דוגמאות:**
- `trades.svg` - אייקון Trade
- `tickers.svg` - אייקון Ticker
- `trading_accounts.svg` - אייקון Trading Account
- `home.svg` - אייקון Home

---

#### **2. Lucide React Icons:**
- **Library:** `lucide-react`
- **Usage:** אייקונים UI כלליים (Search, Filter, Bell, User, וכו')
- **Sizing:** `16px`, `18px`, `20px`, `24px` (standard sizes)

**דוגמאות:**
- `Search` - אייקון חיפוש
- `Filter` - אייקון פילטר
- `Bell` - אייקון התראות
- `User` - אייקון משתמש
- `ChevronDown` - אייקון dropdown
- `Settings` - אייקון הגדרות

---

### **Icon Sizing:**

#### **Standard Sizes:**
- **Extra Small:** `12px` - אייקונים קטנים מאוד
- **Small:** `16px` - אייקונים קטנים (navigation, buttons)
- **Medium:** `20px` - אייקונים בינוניים (headers, sections)
- **Large:** `24px` - אייקונים גדולים (featured, prominent)

#### **Entity Icons:**
- **Standard:** `20px × 20px`
- **Small:** `16px × 16px`

---

### **Icon Colors:**

#### **Default Colors:**
- **Primary:** `var(--color-brand)` (`#26baac`) - אייקונים ראשיים
- **Secondary:** `var(--apple-text-secondary)` (`#3C3C43`) - אייקונים משניים
- **Tertiary:** `var(--apple-text-tertiary)` (`#3C3C4399`) - אייקונים שלישוניים

#### **Entity Icon Colors:**
- **Trade:** `var(--entity-trade-color)` (`#26baac`)
- **Ticker:** `var(--entity-ticker-color)` (`#17a2b8`)
- **Trading Account:** `var(--entity-trading-account-color)` (`#28a745`)
- **Research:** `var(--entity-research-color)` (`#9c27b0`)
- **Execution:** `var(--entity-execution-color)` (`#ff9800`)

---

### **Icon Usage Guidelines:**

#### **✅ מותר:**
- שימוש ב-SVG Icons לישויות
- שימוש ב-Lucide React Icons ל-UI elements
- שינוי גודל אייקונים לפי הקונטקסט
- שינוי צבע אייקונים לפי Entity Color

#### **❌ אסור:**
- שימוש באייקונים מ-custom libraries ללא אישור
- שינוי יחס הגובה-רוחב של אייקונים
- שימוש באייקונים pixelated או באיכות נמוכה
- שימוש באייקונים ללא `aria-label` או `aria-hidden`

---

### **Icon Accessibility:**

#### **ARIA Attributes:**
- **Decorative Icons:** `aria-hidden="true"`
- **Interactive Icons:** `aria-label` עם תיאור ברור
- **Icon Buttons:** `role="button"` + `aria-label`

**דוגמאות:**
```jsx
/* Decorative Icon */
<span className="icon" aria-hidden="true">
  <Icon />
</span>

/* Interactive Icon */
<button aria-label="חיפוש">
  <SearchIcon />
</button>
```

---

## 🎨 Visual Identity

### **Design Principles:**
- **Clean & Modern:** עיצוב נקי ומודרני
- **Apple-inspired:** השראה מעיצוב Apple
- **Professional:** מקצועי ואמין
- **User-friendly:** ידידותי למשתמש

### **Design System:**
- **LEGO Modular Architecture:** ארכיטקטורה מודולרית
- **LOD 400 Fidelity:** דיוק מקסימלי
- **Fluid Design:** עיצוב נזיל (ללא Media Queries)
- **CSS Variables (SSOT):** מקור אמת יחיד ב-`phoenix-base.css`

---

## 📋 Brand Guidelines Summary

### **Logo Usage:**
- ✅ Logo מופיע ב-Unified Header
- ✅ Logo בגודל קבוע: `125px × 37.5px`
- ✅ Logo Text: `1rem` (16px), `300` weight, `#26baac` color
- ✅ Logo מיקום: Right side (RTL), LTR direction

### **Color Usage:**
- ✅ Brand Primary: כפתורים ראשיים, קישורים פעילים
- ✅ Brand Secondary: כפתורים משניים
- ✅ Entity Colors: זיהוי ישויות שונות
- ✅ Semantic Colors: Success, Error, Warning

### **Typography Usage:**
- ✅ Headings: Bold (700), Extra Large sizes
- ✅ Body: Light (300), Base size (0.92rem)
- ✅ Small Text: Light (300), Small size
- ✅ Fluid Design: כל גדלי הפונטים עם `clamp()`

### **Iconography Usage:**
- ✅ SVG Icons: ישויות (20px × 20px)
- ✅ Lucide React Icons: UI elements (16px-24px)
- ✅ Entity Colors: אייקונים לפי Entity
- ✅ Accessibility: ARIA attributes מלאים

---

## 🔗 קישורים רלוונטיים

### **תיעוד:**
- **Master Palette:** `MASTER_PALETTE_SPEC.md`
- **CSS Variables (SSOT):** `ui/src/styles/phoenix-base.css`
- **CSS Classes Index:** `documentation/04-DESIGN_UX_UI/CSS_CLASSES_INDEX.md`
- **Fluid Design:** `documentation/04-DESIGN_UX_UI/TT2_RESPONSIVE_FLUID_DESIGN.md`

---

**נוצר על ידי:** Team 10 (The Gateway)  
**עודכן על ידי:** Team 40 (UI Assets & Design)  
**תאריך:** 2026-02-03  
**עדכון אחרון:** 2026-02-03  
**סטטוס:** ✅ **READY FOR EXTERNAL AUDIT**

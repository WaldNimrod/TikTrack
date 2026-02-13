# Team 40 → Team 10: Color Palette Structure - Final Specification

**Date:** 2026-01-31  
**Status:** ✅ Structure Defined - Ready for Implementation  
**Priority:** P0

---

## 📋 Summary

Final structure specification for CSS color variables based on Team 10 requirements.

---

## 🏗️ Color Palette Structure

### 1. Brand Colors (Primary & Secondary)

**Structure: 3 variants per brand color (for Dark Mode compatibility)**
- Base color (normal)
- Light variant
- Dark variant

**CSS Variables:**
```css
/* Primary Brand */
--color-primary              /* Base */
--color-primary-light        /* Light variant */
--color-primary-dark         /* Dark variant */

/* Secondary Brand */
--color-secondary            /* Base */
--color-secondary-light      /* Light variant */
--color-secondary-dark       /* Dark variant */
```

**Total: 2 brands × 3 variants = 6 variables**

**Dark Mode Consideration:**
- May need additional variants for dark mode backgrounds/text
- To be determined during dark mode implementation

---

### 2. Entity Colors

**Structure: 3 variants per entity (unified naming)**
- Light variant (`-light`)
- Base color (no suffix)
- Dark variant (`-dark`)

**9 Core Entities (with their own colors):**
1. `trade`
2. `trade_plan`
3. `execution`
4. `trading_account`
5. `cash_flow`
6. `ticker`
7. `alert`
8. `note`
9. `research`

**CSS Variables Pattern:**
```css
/* For each entity: trade, trade_plan, execution, etc. */
--entity-{name}-light         /* Light variant */
--entity-{name}              /* Base color (normal) */
--entity-{name}-dark         /* Dark variant */
```

**Examples:**
```css
--entity-trade-light
--entity-trade
--entity-trade-dark

--entity-ticker-light
--entity-ticker
--entity-ticker-dark
```

**Total: 9 entities × 3 variants = 27 variables**

**Other entities inherit colors from core entities:**
- Need mapping document (to be provided by Team 10)

---

### 3. Message & Status Colors (סוגי הודעות ומצבים)

**Structure: 3 variants per message type (unified naming)**
- Light variant (`-light`)
- Base color (no suffix)
- Dark variant (`-dark`)

**4 Message Types:**
- `info` (מידע)
- `warning` (אזהרה)
- `error` (שגיאה)
- `success` (אישור)

**CSS Variables:**
```css
/* Info */
--message-info-light
--message-info
--message-info-dark

/* Warning */
--message-warning-light
--message-warning
--message-warning-dark

/* Error */
--message-error-light
--message-error
--message-error-dark

/* Success */
--message-success-light
--message-success
--message-success-dark
```

**Total: 4 message types × 3 variants = 12 variables**

**Usage:** Alerts, notifications, status messages, badges, etc.

---

### 4. Investment Type Colors

**Structure: Single color per type**

**3 Investment Types (confirmed from system):**
- `trade` (טרייד) - Trading
- `investment` (השקעה) - Investment
- `passive` (פאסיבי) - Passive

**CSS Variables:**
```css
--investment-trade-color
--investment-investment-color
--investment-passive-color
```

**Total: 3 types × 1 color = 3 variables**

---

### 5. Numeric Value Colors

**Structure: 3 variants per value type (unified naming)**
- Light variant (`-light`)
- Base color (no suffix)
- Dark variant (`-dark`)

**3 Value Types:**
- `positive`
- `negative`
- `zero`

**CSS Variables:**
```css
--numeric-positive-light
--numeric-positive
--numeric-positive-dark

--numeric-negative-light
--numeric-negative
--numeric-negative-dark

--numeric-zero-light
--numeric-zero
--numeric-zero-dark
```

**Total: 3 types × 3 variants = 9 variables**

---

### 6. Base Colors (צבעי בסיס)

**Structure: Single color per base element**

**Base Elements:**
- `background` (רקע)
- `background-secondary` (רקע משני)
- `text` (טקסט)
- `text-secondary` (טקסט משני)

**CSS Variables:**
```css
--color-background              /* Base background color */
--color-background-secondary     /* Secondary background color */
--color-text                     /* Base text color */
--color-text-secondary           /* Secondary text color */
```

**Total: 4 base colors × 1 = 4 variables**

**Note:** 
- Footer is always black (no variable needed)
- These are the fundamental colors for the entire system
- May have variants for dark mode

---

### 7. Border Colors (צבעי גבולות)

**Structure: Single color per border type**

**Border Types:**
- `border` (גבול רגיל)
- `border-light` (גבול בהיר)

**CSS Variables:**
```css
--color-border                  /* Base border color */
--color-border-light            /* Light border color */
```

**Total: 2 border colors × 1 = 2 variables**

**Usage:** Borders throughout the system, dividers, separators.

---

### 8. Apple Colors Mapping (מיפוי צבעי אפל)

**Status:** Apple colors are mapped to Message colors - **Palette is the source of truth**

**Mapping:**
```css
--apple-blue: var(--message-info);
--apple-blue-dark: var(--message-info-dark);
--apple-red: var(--message-error);
--apple-red-dark: var(--message-error-dark);
--apple-green: var(--message-success);
--apple-green-dark: var(--message-success-dark);
--apple-orange: var(--message-warning);
--apple-orange-dark: var(--message-warning-dark);
```

**Apple Background/Text/Border Mapping:**
```css
--apple-bg-primary: var(--color-background);
--apple-bg-secondary: var(--color-background-secondary);
--apple-bg-elevated: var(--color-background);
--apple-text-primary: var(--color-text);
--apple-text-secondary: var(--color-text-secondary);
--apple-border: var(--color-border);
--apple-border-light: var(--color-border-light);
```

**Total: 0 new variables** (all are aliases/mappings)

**Note:** 
- Apple colors are **aliases** - palette variables are the source of truth
- Changing palette colors automatically updates Apple colors
- This ensures consistency across the entire system

---

### 9. Semantic Colors - ⚠️ REMOVED (Duplicate of Message & Status Colors)

**Status:** Removed - same as Message & Status Colors (Section 3)

**Reason:** Message & Status Colors already include:
- `info` (מידע)
- `warning` (אזהרה)
- `error` (שגיאה)
- `success` (אישור)

**No separate Semantic Colors needed - use Message Colors instead.**

---

### 10. Neutral Scale (Slate 50-950) - ⏸️ FUTURE OPTION

**Status:** Not required for current implementation - reserved for future use

**Structure: Single value per shade**

**Scale Definition:** TBD (11 shades Tailwind-style or 50-color scale)

**CSS Variables (Future):**
```css
--slate-50
--slate-100
--slate-200
/* ... up to slate-950 */
```

**Total: TBD (11-50 variables) - NOT INCLUDED IN CURRENT COUNT**

---

## 📊 Summary: Total Structure

| Category | Items | Variants per Item | Total Variables |
|----------|-------|------------------|-----------------|
| **Brand Colors** | 2 | 3 | 6 |
| **Entity Colors** | 9 | 3 | 27 |
| **Message & Status Colors** | 4 | 3 | 12 |
| **Investment Types** | 3 | 1 | 3 |
| **Numeric Values** | 3 | 3 | 9 |
| **Base Colors** | 4 | 1 | 4 |
| **Border Colors** | 2 | 1 | 2 |
| **Apple Colors Mapping** | - | - | 0 (aliases) |
| **Semantic Colors** | ⚠️ Removed | - | 0 (duplicate) |
| **Neutral Scale** | ⏸️ Future | - | 0 (reserved) |
| **TOTAL (Current)** | - | - | **63** |

---

## ✅ Unified Naming Convention

**Rule: All variants follow the same pattern:**
- `-light` = Light variant (always first)
- Base = No suffix (always middle)
- `-dark` = Dark variant (always last)

**Examples:**
```css
/* Entity */
--entity-trade-light
--entity-trade
--entity-trade-dark

/* Numeric */
--numeric-positive-light
--numeric-positive
--numeric-positive-dark

/* Message & Status */
--message-info-light
--message-info
--message-info-dark

--message-success-light
--message-success
--message-success-dark
```

---

---

## 🔗 Apple Colors Mapping (מיפוי צבעי אפל)

**Status:** ✅ Implemented - Apple colors mapped to Message colors

**Principle:** **Palette is the source of truth** - editing palette automatically updates Apple colors

**Mapping Implementation:**
```css
/* Apple Colors → Message Colors */
--apple-blue: var(--message-info);
--apple-blue-dark: var(--message-info-dark);
--apple-red: var(--message-error);
--apple-red-dark: var(--message-error-dark);
--apple-green: var(--message-success);
--apple-green-dark: var(--message-success-dark);
--apple-orange: var(--message-warning);
--apple-orange-dark: var(--message-warning-dark);

/* Apple Background/Text/Border → Base Colors */
--apple-bg-primary: var(--color-background);
--apple-bg-secondary: var(--color-background-secondary);
--apple-bg-elevated: var(--color-background);
--apple-text-primary: var(--color-text);
--apple-text-secondary: var(--color-text-secondary);
--apple-border: var(--color-border);
--apple-border-light: var(--color-border-light);
```

**Benefits:**
- ✅ Single source of truth (palette)
- ✅ Changing palette colors updates Apple colors automatically
- ✅ Consistency across entire system
- ✅ Entity colors remain clean (no Apple color pollution)

---

## ❓ Questions for Team 10

1. **Entity Inheritance:**
   - Which entities inherit from which core entities?
   - Need mapping document?

2. **Dark Mode:**
   - What additional variants needed for brand colors?
   - Background/text variants?

---

**Team 40 - UI Assets & Design**  
**DNA Guardians - CSS Variables & Color System**

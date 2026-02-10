# Team 40 → Team 10: Color Palette Structure Analysis

**Date:** 2026-01-31  
**Status:** 📊 Structure Analysis Complete  
**Priority:** P0

---

## 📋 Objective

Analyze the **structure** of the color palette system (not values) to understand how to build CSS variables correctly.

---

## 🏗️ Color Palette Structure (from Legacy System)

### 1. Brand Colors Structure

**Variants per Brand Color:**
- `PRIMARY` - Base color
- `PRIMARY_TEXT` - Darker variant (for text)
- `PRIMARY_LIGHT` - Light variant
- `PRIMARY_BG` - Background (rgba with 0.1 opacity)
- `PRIMARY_BORDER` - Border (rgba with 0.3 opacity)

**Total: 5 variants per brand color**

**Brand Colors:**
- Brand Primary
- Brand Secondary

**Total Brand Variants: 2 × 5 = 10 variables**

---

### 2. Entity Colors Structure

**Each Entity has 6 variants:**
1. `ENTITY_COLORS[entity]` - Primary color (hex)
2. `ENTITY_BACKGROUND_COLORS[entity]` - Background (rgba with 0.1 opacity)
3. `ENTITY_TEXT_COLORS[entity]` - Text color (darker variant, hex)
4. `ENTITY_BORDER_COLORS[entity]` - Border (rgba with 0.3 opacity)
5. `ENTITY_LIGHT_COLORS[entity]` - Light variant (hex or rgba)
6. `ENTITY_DARK_COLORS[entity]` - Dark variant (hex)

**Entities Found in Legacy:**
- trade
- trade_plan
- execution
- account
- trading_account
- cash_flow
- ticker
- alert
- note
- constraint
- design
- research
- preference
- development
- position
- import_session (uses cash_flow colors)

**Total: 15 entities × 6 variants = 90 entity color variables**

---

### 3. Status Colors Structure

**Simple structure - single color per status:**
- `STATUS_COLORS[status]` - Single hex color

**Statuses:**
- active
- inactive
- pending
- completed
- cancelled
- error
- warning
- info
- success

**Total: 9 status colors**

---

### 4. Investment Type Colors Structure

**Each Investment Type has 3 variants:**
- `medium` - Base color (hex)
- `light` - Background (rgba with 0.1 opacity)
- `border` - Border (rgba with 0.3 opacity)

**Investment Types:**
- swing
- day
- scalping

**Total: 3 types × 3 variants = 9 variables**

---

### 5. Numeric Value Colors Structure

**Each Value Type has 3 variants:**
- `medium` - Base color (hex)
- `light` - Background (rgba with 0.1 opacity)
- `border` - Border (rgba with 0.3 opacity)

**Value Types:**
- positive
- negative
- zero

**Total: 3 types × 3 variants = 9 variables**

---

### 6. Neutral Scale Structure

**From Specification: "50 Neutrals (Slate 50-950)"**

**Possible Interpretations:**
1. **Tailwind-style scale:** 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950 = **11 shades**
2. **Full 50-color scale:** 50, 60, 70... 950 (increments of 10) = **50 shades**
3. **Custom scale:** Need specification

**Current Implementation:**
- Only 8 colors defined: `--color-1`, `--color-5`, `--color-10`, `--color-20`, `--color-30`, `--color-40`, `--color-45`, `--color-50`
- **Structure:** Single value per shade (no variants)

**Total Neutral Variables: TBD (depends on scale definition)**

---

## 📊 CSS Variable Naming Structure

### Brand Colors Pattern:
```css
--color-primary
--color-primary-light
--color-primary-lighter
--color-primary-dark
--color-primary-darker
--color-primary-text (if needed)
--color-primary-bg (if needed)
--color-primary-border (if needed)
```

### Entity Colors Pattern:
```css
--entity-{entity-name}-color      /* Primary */
--entity-{entity-name}-bg         /* Background rgba(0.1) */
--entity-{entity-name}-text       /* Text (darker) */
--entity-{entity-name}-border     /* Border rgba(0.3) */
--entity-{entity-name}-light      /* Light variant */
--entity-{entity-name}-dark       /* Dark variant */
```

**Example:**
```css
--entity-trade-color
--entity-trade-bg
--entity-trade-text
--entity-trade-border
--entity-trade-light
--entity-trade-dark
```

### Status Colors Pattern:
```css
--status-{status-name}-color
```

**Example:**
```css
--status-active-color
--status-pending-color
```

### Investment Type Colors Pattern:
```css
--investment-{type}-color         /* medium */
--investment-{type}-bg            /* light */
--investment-{type}-border        /* border */
```

### Numeric Value Colors Pattern:
```css
--numeric-{type}-color            /* medium */
--numeric-{type}-bg               /* light */
--numeric-{type}-border           /* border */
```

### Neutral Scale Pattern:
```css
--slate-{shade}                   /* e.g., --slate-50, --slate-100, etc. */
/* OR */
--color-{number}                  /* e.g., --color-50, --color-100, etc. */
```

---

## 🎯 Summary: Total Structure

| Category | Entities/Types | Variants per Entity | Total Variables |
|----------|---------------|-------------------|-----------------|
| **Brand Colors** | 2 | 5 | 10 |
| **Entity Colors** | 15 | 6 | 90 |
| **Status Colors** | 9 | 1 | 9 |
| **Investment Types** | 3 | 3 | 9 |
| **Numeric Values** | 3 | 3 | 9 |
| **Neutral Scale** | TBD (11-50) | 1 | TBD |
| **Semantic Colors** | 3 (success, error, warning) | 6 | 18 |
| **Apple System Colors** | 7 | 1 | 7 |
| **TOTAL** | - | - | **~152-191** |

---

## ✅ Recommended CSS Structure

### 1. Brand Colors (10 variables)
```css
/* Primary Brand */
--color-primary
--color-primary-light
--color-primary-lighter
--color-primary-dark
--color-primary-darker

/* Secondary Brand */
--color-secondary
--color-secondary-light
--color-secondary-lighter
--color-secondary-dark
--color-secondary-darker
```

### 2. Entity Colors (90 variables - 15 entities × 6 variants)
```css
/* For each entity: trade, ticker, execution, etc. */
--entity-{name}-color
--entity-{name}-bg
--entity-{name}-text
--entity-{name}-border
--entity-{name}-light
--entity-{name}-dark
```

### 3. Semantic Colors (18 variables - 3 types × 6 variants)
```css
/* Success */
--color-success
--color-success-light
--color-success-lighter
--color-success-dark
--color-success-darker
--color-success-bg

/* Error */
--color-error
--color-error-light
--color-error-lighter
--color-error-dark
--color-error-darker
--color-error-bg

/* Warning */
--color-warning
--color-warning-light
--color-warning-lighter
--color-warning-dark
--color-warning-darker
--color-warning-bg
```

### 4. Status Colors (9 variables)
```css
--status-active-color
--status-inactive-color
--status-pending-color
--status-completed-color
--status-cancelled-color
--status-error-color
--status-warning-color
--status-info-color
--status-success-color
```

### 5. Investment Type Colors (9 variables)
```css
--investment-swing-color
--investment-swing-bg
--investment-swing-border

--investment-day-color
--investment-day-bg
--investment-day-border

--investment-scalping-color
--investment-scalping-bg
--investment-scalping-border
```

### 6. Numeric Value Colors (9 variables)
```css
--numeric-positive-color
--numeric-positive-bg
--numeric-positive-border

--numeric-negative-color
--numeric-negative-bg
--numeric-negative-border

--numeric-zero-color
--numeric-zero-bg
--numeric-zero-border
```

### 7. Neutral Scale (TBD - need specification)
```css
/* Option A: Tailwind-style (11 shades) */
--slate-50
--slate-100
--slate-200
--slate-300
--slate-400
--slate-500
--slate-600
--slate-700
--slate-800
--slate-900
--slate-950

/* Option B: Full 50-color scale (need specification) */
--slate-50
--slate-60
--slate-70
/* ... up to slate-950 */
```

---

## 🔍 Questions for Team 10

1. **Neutral Scale:**
   - Is it Tailwind-style (11 shades: 50-950)?
   - Or full 50-color scale (need specification)?
   - What naming convention? `--slate-{shade}` or `--color-{number}`?

2. **Entity List:**
   - Are all 15 entities from legacy still valid?
   - Or should we use the 7 from spec (Home, Plan, Track, Research, Data, Settings, Dev)?
   - Need mapping: Legacy entities → Phoenix entities?

3. **Variant Completeness:**
   - Should all entities have all 6 variants?
   - Or can some entities have fewer variants?

4. **CSS Variable Naming:**
   - Confirm naming patterns above?
   - Any deviations needed?

---

**Team 40 - UI Assets & Design**  
**DNA Guardians - CSS Variables & Color System**

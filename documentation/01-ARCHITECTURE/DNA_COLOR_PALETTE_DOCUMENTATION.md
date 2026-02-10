# DNA Color Palette - Complete Documentation

**Version:** 1.0  
**Date:** 2026-01-31  
**Status:** ✅ Complete - Production Ready  
**Owner:** Team 40 (UI Assets & Design) - DNA Guardians  
**SSOT:** `ui/src/styles/phoenix-base.css`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Palette Structure](#palette-structure)
3. [Design Philosophy](#design-philosophy)
4. [Implementation](#implementation)
5. [Usage Guidelines](#usage-guidelines)
6. [Examples](#examples)
7. [Apple Colors Mapping](#apple-colors-mapping)
8. [Developer Guide](#developer-guide)
9. [FAQ](#faq)

---

## 🎯 Overview

### What is the DNA Color Palette?

The **DNA Color Palette** is the **Single Source of Truth (SSOT)** for all colors in the TikTrack Phoenix system. It consists of **63 CSS variables** organized into 7 logical categories, ensuring consistency, maintainability, and scalability across the entire application.

### Why Does It Exist?

1. **Consistency:** All colors come from one central location
2. **Maintainability:** Change colors once, update everywhere
3. **Scalability:** Easy to add new colors or modify existing ones
4. **Developer Experience:** Clear naming conventions and structure
5. **Design System:** Foundation for the entire visual DNA

### Key Principles

- ✅ **Palette is the Source of Truth** - All colors derive from the palette
- ✅ **No Hardcoded Colors** - All colors must use CSS variables
- ✅ **Transparency Support** - Use `rgba()` with variables for additional shades
- ✅ **Entity Colors Stay Clean** - No Apple color pollution in entity definitions
- ✅ **Inheritance & Mapping** - Apple colors map to Message colors

---

## 🏗️ Palette Structure

### Total: 63 Variables

| Category | Count | Purpose |
|----------|-------|---------|
| **Brand Colors** | 6 | Primary & Secondary brand identity |
| **Entity Colors** | 27 | 9 core entities × 3 variants each |
| **Message & Status Colors** | 12 | 4 message types × 3 variants each |
| **Investment Types** | 3 | 3 investment type colors |
| **Numeric Values** | 9 | 3 value types × 3 variants each |
| **Base Colors** | 4 | Backgrounds and text colors |
| **Border Colors** | 2 | Border colors for UI elements |
| **TOTAL** | **63** | |

---

## 📐 Detailed Structure

### 1. Brand Colors (6 variables)

**Purpose:** Primary and secondary brand identity colors

**Structure:** 3 variants per brand color (light, base, dark)

```css
/* Primary Brand - Turquoise */
--color-primary: #26baac;
--color-primary-light: #4dd4c4;
--color-primary-dark: #1e968a;

/* Secondary Brand - Orange */
--color-secondary: #fc5a06;
--color-secondary-light: #ff7a33;
--color-secondary-dark: #c84805;
```

**Usage:**
- Primary brand elements (logos, headers, CTAs)
- Secondary brand elements (accents, highlights)
- Brand-specific UI components

**When to Use:**
- ✅ Brand-specific elements
- ✅ Primary call-to-action buttons
- ✅ Logo and brand identity
- ❌ Don't use for entity-specific colors
- ❌ Don't use for status/message colors

---

### 2. Entity Colors (27 variables)

**Purpose:** Colors for core system entities

**Structure:** 9 entities × 3 variants (light, base, dark)

**Core Entities:**
1. `trade` - Trading operations
2. `trade_plan` - Trading plans
3. `execution` - Trade executions
4. `trading_account` - Trading accounts
5. `cash_flow` - Cash flow operations
6. `ticker` - Stock tickers
7. `alert` - System alerts
8. `note` - Notes and annotations
9. `research` - Research documents

**Naming Convention:**
```css
--entity-{name}-light    /* Light variant */
--entity-{name}         /* Base color */
--entity-{name}-dark    /* Dark variant */
```

**Examples:**
```css
--entity-trade-light: #7ee8dc;
--entity-trade: #26baac;
--entity-trade-dark: #1e968a;

--entity-ticker-light: #c5f4ea;
--entity-ticker: #17a2b8;
--entity-ticker-dark: #138496;
```

**Usage:**
- Entity-specific UI elements
- Badges and labels
- Table row colors
- Card headers
- Entity icons

**When to Use:**
- ✅ Entity-specific components
- ✅ Entity badges and labels
- ✅ Entity table rows
- ✅ Entity card headers
- ❌ Don't use for generic UI elements
- ❌ Don't use for status/message colors

**Entity Inheritance:**
- Other entities inherit colors from core entities
- Mapping document to be provided by Team 10

---

### 3. Message & Status Colors (12 variables)

**Purpose:** Colors for messages, alerts, notifications, and status indicators

**Structure:** 4 message types × 3 variants (light, base, dark)

**Message Types:**
- `info` (מידע) - Informational messages
- `warning` (אזהרה) - Warning messages
- `error` (שגיאה) - Error messages
- `success` (אישור) - Success messages

**Naming Convention:**
```css
--message-{type}-light    /* Light variant */
--message-{type}          /* Base color */
--message-{type}-dark     /* Dark variant */
```

**Examples:**
```css
--message-info-light: #bee5eb;
--message-info: #17a2b8;
--message-info-dark: #0c5460;

--message-success-light: #6ee7b7;
--message-success: #10b981;
--message-success-dark: #059669;
```

**Usage:**
- Alert messages
- Notification badges
- Status indicators
- Toast notifications
- Form validation messages
- Operation type badges (deposit, withdrawal, transfer, execution)

**When to Use:**
- ✅ Alert/notification components
- ✅ Status indicators
- ✅ Form validation
- ✅ Operation type badges
- ✅ Success/error messages
- ❌ Don't use for entity colors
- ❌ Don't use for brand colors

---

### 4. Investment Type Colors (3 variables)

**Purpose:** Colors for investment type classification

**Structure:** Single color per investment type

**Investment Types:**
- `trade` (טרייד) - Trading
- `investment` (השקעה) - Investment
- `passive` (פאסיבי) - Passive

**Naming Convention:**
```css
--investment-{type}-color
```

**Examples:**
```css
--investment-trade-color: #0d9488;        /* טרייד - Dark Turquoise (Color Scale) */
--investment-investment-color: #14b8a6;   /* השקעה - Medium Turquoise (Color Scale) */
--investment-passive-color: #5eead4;       /* פאסיבי - Light Turquoise (Color Scale) */
```

**Note:** Investment Type Colors form a **color scale** (dark → medium → light) using turquoise tones for visual consistency.

**Usage:**
- Investment type badges
- Investment type filters
- Investment type labels

**When to Use:**
- ✅ Investment type classification
- ✅ Investment type badges
- ✅ Investment type filters
- ❌ Don't use for generic colors

---

### 5. Numeric Value Colors (9 variables)

**Purpose:** Colors for numeric values (positive, negative, zero)

**Structure:** 3 value types × 3 variants (light, base, dark)

**Value Types:**
- `positive` - Positive values
- `negative` - Negative values
- `zero` - Zero values

**Naming Convention:**
```css
--numeric-{type}-light    /* Light variant (rgba with transparency) */
--numeric-{type}          /* Base color */
--numeric-{type}-dark     /* Dark variant */
```

**Examples:**
```css
--numeric-positive-light: rgba(40, 167, 69, 0.2);
--numeric-positive: #28a745;
--numeric-positive-dark: #1e7e34;

--numeric-negative-light: rgba(220, 53, 69, 0.2);
--numeric-negative: #dc3545;
--numeric-negative-dark: #b02a37;
```

**Usage:**
- Numeric value display
- Financial data tables
- Profit/loss indicators
- Balance displays

**When to Use:**
- ✅ Numeric value display
- ✅ Financial indicators
- ✅ Profit/loss displays
- ✅ Balance displays
- ❌ Don't use for non-numeric elements

---

### 6. Base Colors (4 variables)

**Purpose:** Fundamental colors for backgrounds and text

**Structure:** Single color per base element

**Base Elements:**
- `background` - Primary background color
- `background-secondary` - Secondary background color
- `text` - Primary text color
- `text-secondary` - Secondary text color

**Naming Convention:**
```css
--color-background
--color-background-secondary
--color-text
--color-text-secondary
```

**Examples:**
```css
--color-background: #ffffff;
--color-background-secondary: #F2F2F7;
--color-text: #1c1e21;
--color-text-secondary: #86868b; /* Distinct gray - clearly different from primary text */
```

**Usage:**
- Page backgrounds
- Card backgrounds
- Text colors
- Elevated surfaces

**When to Use:**
- ✅ Page backgrounds
- ✅ Card backgrounds
- ✅ Text colors
- ✅ Elevated surfaces
- ❌ Don't use for entity-specific colors
- ❌ Don't use for status colors

**Note:** Footer is always black (hardcoded, no variable needed)

---

### 7. Border Colors (2 variables)

**Purpose:** Colors for borders and dividers

**Structure:** Single color per border type

**Border Types:**
- `border` - Standard border color
- `border-light` - Light border color

**Naming Convention:**
```css
--color-border
--color-border-light
```

**Examples:**
```css
--color-border: #C6C6C8;
--color-border-light: #E5E5EA;
```

**Usage:**
- Element borders
- Dividers
- Separators
- Card borders
- Table borders

**When to Use:**
- ✅ Element borders
- ✅ Dividers and separators
- ✅ Card borders
- ✅ Table borders
- ❌ Don't use for colored borders (use entity/message colors)

---

## 🎨 Design Philosophy

### Unified Naming Convention

**Rule:** All variants follow the same pattern across all categories:

- `-light` = Light variant (always first)
- Base = No suffix (always middle)
- `-dark` = Dark variant (always last)

**Examples:**
```css
/* Entity */
--entity-trade-light
--entity-trade
--entity-trade-dark

/* Message */
--message-info-light
--message-info
--message-info-dark

/* Numeric */
--numeric-positive-light
--numeric-positive
--numeric-positive-dark
```

### Transparency Support

**Key Feature:** The palette supports transparency through `rgba()` with existing variables.

**How It Works:**
- Use `rgba()` with palette variables for additional shades
- Example: `rgba(var(--message-success), 0.1)` for light backgrounds
- Example: `rgba(var(--entity-trade), 0.3)` for borders

**Benefits:**
- Creates additional shades without adding variables
- Maintains consistency with base colors
- Reduces palette size

**Example Usage:**
```css
/* Light background with transparency */
background: rgba(38, 186, 172, 0.1);  /* Using --entity-trade with 10% opacity */

/* Border with transparency */
border: 1px solid rgba(38, 186, 172, 0.3);  /* Using --entity-trade with 30% opacity */
```

### Entity Colors Stay Clean

**Principle:** Entity colors remain pure and unmodified.

**Rules:**
- ✅ Entity colors are defined once in the palette
- ✅ Use transparency for variants (light backgrounds, borders)
- ❌ Don't pollute entity colors with Apple/system colors
- ❌ Don't create entity-specific Apple color mappings

**Example:**
```css
/* ✅ Correct - Entity color stays clean */
.trade-badge {
  background: rgba(var(--entity-trade), 0.1);
  border: 1px solid var(--entity-trade);
  color: var(--entity-trade);
}

/* ❌ Incorrect - Don't mix Apple colors with entities */
.trade-badge {
  background: var(--apple-green);  /* Wrong! */
}
```

---

## 🔧 Implementation

### File Location

**SSOT:** `ui/src/styles/phoenix-base.css`

**Section:** Lines 132-244 (DNA COLOR SYSTEM section)

### CSS Loading Order

**Critical:** The palette file must be loaded in the correct order:

1. **Pico CSS** (Framework) - First
2. **phoenix-base.css** (Palette SSOT) - Second
3. **phoenix-components.css** (Components) - Third
4. **Other CSS files** (Page-specific) - Fourth

**Example HTML:**
```html
<!-- 1. Pico CSS FIRST -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">

<!-- 2. Phoenix Base (Palette SSOT) -->
<link rel="stylesheet" href="ui/src/styles/phoenix-base.css">

<!-- 3. Components -->
<link rel="stylesheet" href="ui/src/styles/phoenix-components.css">

<!-- 4. Page-specific -->
<link rel="stylesheet" href="ui/src/styles/D15_DASHBOARD_STYLES.css">
```

### Variable Definition Format

**Structure:**
```css
:root {
  /* Category Comment */
  /* Subcategory Comment */
  --variable-name: #hexvalue;  /* Comment explaining usage */
}
```

**Example:**
```css
:root {
  /* ===== 2. Entity Colors (27 variables - 9 entities × 3 variants) ===== */
  /* Trade Entity */
  --entity-trade-light: #7ee8dc;
  --entity-trade: #26baac;
  --entity-trade-dark: #1e968a;
}
```

---

## 📖 Usage Guidelines

### ✅ DO

1. **Always use CSS variables:**
   ```css
   /* ✅ Correct */
   color: var(--color-text);
   background: var(--color-background);
   border: 1px solid var(--color-border-light);
   ```

2. **Use transparency for variants:**
   ```css
   /* ✅ Correct - Light background */
   background: rgba(38, 186, 172, 0.1);  /* Using --entity-trade */
   
   /* ✅ Correct - Border with transparency */
   border: 1px solid rgba(38, 186, 172, 0.3);
   ```

3. **Use appropriate category:**
   ```css
   /* ✅ Correct - Entity badge */
   .trade-badge {
     color: var(--entity-trade);
   }
   
   /* ✅ Correct - Success message */
   .success-message {
     color: var(--message-success);
   }
   ```

4. **Follow naming conventions:**
   ```css
   /* ✅ Correct - Use light/base/dark pattern */
   background: var(--entity-trade-light);
   color: var(--entity-trade);
   border: 1px solid var(--entity-trade-dark);
   ```

### ❌ DON'T

1. **Never use hardcoded colors:**
   ```css
   /* ❌ Incorrect */
   color: #26baac;
   background: #ffffff;
   border: 1px solid #e5e5e5;
   ```

2. **Never use inline styles:**
   ```html
   <!-- ❌ Incorrect -->
   <div style="color: #26baac;">Text</div>
   ```

3. **Never mix categories incorrectly:**
   ```css
   /* ❌ Incorrect - Don't use entity color for message */
   .error-message {
     color: var(--entity-alert);  /* Wrong! Use --message-error */
   }
   ```

4. **Never create new variables:**
   ```css
   /* ❌ Incorrect - Don't create new variables */
   :root {
     --my-custom-color: #ff0000;  /* Wrong! Use existing palette */
   }
   ```

---

## 💡 Examples

### Example 1: Entity Badge

```css
.trade-badge {
  background: rgba(38, 186, 172, 0.1);  /* --entity-trade with 10% opacity */
  border: 1px solid var(--entity-trade);
  color: var(--entity-trade);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}
```

### Example 2: Success Message

```css
.success-message {
  background: var(--message-success-light);
  border: 1px solid var(--message-success);
  color: var(--message-success-dark);
  padding: 1rem;
  border-radius: 8px;
}
```

### Example 3: Numeric Value Display

```css
.positive-value {
  color: var(--numeric-positive);
  font-weight: 600;
}

.negative-value {
  color: var(--numeric-negative);
  font-weight: 600;
}

.zero-value {
  color: var(--numeric-zero);
  font-weight: 400;
}
```

### Example 4: Button with Entity Color

```css
.btn-trade {
  background: var(--color-background);
  border: 1px solid var(--entity-trade);
  color: var(--entity-trade);
}

.btn-trade:hover {
  background: var(--entity-trade);
  color: var(--color-background);
  box-shadow: 0 2px 8px rgba(38, 186, 172, 0.3);
}
```

### Example 5: Card with Secondary Background

```css
.card {
  background: var(--color-background);
  border: 1px solid var(--color-border-light);
  color: var(--color-text);
}

.card-header {
  background: var(--color-background-secondary);
  border-bottom: 1px solid var(--color-border-light);
  color: var(--color-text-secondary);
}
```

---

## 🔗 Apple Colors Mapping

### Overview

**Principle:** **Palette is the source of truth** - Apple colors are mapped to palette variables as aliases.

**Benefit:** Changing palette colors automatically updates Apple colors throughout the system.

### Mapping Structure

**Apple Colors → Message Colors:**
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

**Apple Background/Text/Border → Base Colors:**
```css
--apple-bg-primary: var(--color-background);
--apple-bg-secondary: var(--color-background-secondary);
--apple-bg-elevated: var(--color-background);
--apple-text-primary: var(--color-text);
--apple-text-secondary: var(--color-primary-dark, #1e968a); /* Mapped to primary-dark for distinct secondary text */
--apple-border: var(--color-border);
--apple-border-light: var(--color-border-light);
```

**Note:** `--apple-text-secondary` is mapped to `--color-primary-dark` to provide a distinct secondary text color that is clearly different from the primary text color.

### Usage

**Legacy Code:**
- Existing code using `--apple-blue`, `--apple-red`, etc. continues to work
- These variables automatically use palette colors

**New Code:**
- Prefer using palette variables directly (`--message-info` instead of `--apple-blue`)
- Apple colors are maintained for backward compatibility

**Example:**
```css
/* ✅ Both work - but prefer palette variables */
.operation-transfer {
  color: var(--apple-blue);        /* Legacy - works */
  color: var(--message-info);     /* Preferred - direct palette */
}
```

---

## 👨‍💻 Developer Guide

### For New Developers

**Step 1: Understand the Structure**
- Read this documentation
- Review `phoenix-base.css` lines 132-244
- Check the demo page: `_COMMUNICATION/team_40/demos/button-system-demo.html`

**Step 2: Choose the Right Color**
- **Entity-specific?** → Use Entity Colors
- **Message/Status?** → Use Message Colors
- **Numeric value?** → Use Numeric Colors
- **Generic UI?** → Use Base/Border Colors
- **Brand element?** → Use Brand Colors

**Step 3: Use Variables Correctly**
```css
/* ✅ Always use var() */
color: var(--color-text);

/* ✅ Use transparency for variants */
background: rgba(38, 186, 172, 0.1);

/* ❌ Never hardcode */
color: #26baac;  /* Wrong! */
```

### Adding New Colors

**Process:**
1. **Check if color exists** - Search palette first
2. **Use transparency** - Can you achieve it with `rgba()`?
3. **Request addition** - Contact Team 40 if truly needed
4. **Update documentation** - If approved, update this doc

**Criteria for New Colors:**
- ✅ Used in multiple places
- ✅ Cannot be achieved with transparency
- ✅ Not entity/message/brand specific
- ❌ One-off use case (use transparency instead)

### Modifying Existing Colors

**Process:**
1. **Edit `phoenix-base.css`** - Update the variable value
2. **Test thoroughly** - Check all pages/components
3. **Update demo page** - Reflect changes in demo
4. **Notify Team 10** - Report changes

**Example:**
```css
/* Before */
--color-primary: #26baac;

/* After */
--color-primary: #20a89a;  /* Updated value */
```

**Note:** Changing palette colors automatically updates:
- All direct uses
- Apple color mappings
- Legacy compatibility variables

---

## ❓ FAQ

### Q1: Can I use hardcoded colors temporarily?

**A:** No. Always use CSS variables. If you need a color that doesn't exist:
1. Check if you can use transparency (`rgba()`)
2. Check if you can use an existing color
3. Contact Team 40 to add to palette

### Q2: How do I create a light background variant?

**A:** Use `rgba()` with the base color:
```css
background: rgba(38, 186, 172, 0.1);  /* 10% opacity */
```

### Q3: Can I use Apple colors in new code?

**A:** Prefer palette variables directly. Apple colors are for backward compatibility:
```css
/* ✅ Preferred */
color: var(--message-info);

/* ⚠️ Works but legacy */
color: var(--apple-blue);
```

### Q4: What if I need a color that's not in the palette?

**A:** 
1. Check if you can use transparency
2. Check if you can use an existing similar color
3. Contact Team 40 with justification
4. If approved, it will be added to the palette

### Q5: How do I know which color category to use?

**A:** Follow this decision tree:
- **Entity-specific element?** → Entity Colors
- **Message/alert/status?** → Message Colors
- **Numeric value?** → Numeric Colors
- **Generic UI element?** → Base/Border Colors
- **Brand element?** → Brand Colors

### Q6: Can I create my own color variables?

**A:** No. All colors must come from the palette. If you need a new color, request it from Team 40.

### Q7: How do I use transparency with variables?

**A:** Use `rgba()` with the RGB values:
```css
/* Extract RGB from hex: #26baac = rgb(38, 186, 172) */
background: rgba(38, 186, 172, 0.1);
```

### Q8: What's the difference between Entity and Message colors?

**A:**
- **Entity Colors:** For entity-specific UI (trade badges, ticker labels, etc.)
- **Message Colors:** For messages/alerts/status (success messages, error alerts, etc.)

### Q9: How do I update colors system-wide?

**A:** Edit the variable in `phoenix-base.css`. The change will propagate automatically to:
- All direct uses
- Apple color mappings
- Legacy compatibility variables

### Q10: Where can I see all colors visually?

**A:** Open the demo page: `_COMMUNICATION/team_40/demos/button-system-demo.html`

---

## 📚 Related Documentation

- **Button System:** `_COMMUNICATION/team_40/DNA_BUTTON_SYSTEM.md`
- **Color Structure Spec:** `_COMMUNICATION/team_40/TEAM_40_COLOR_PALETTE_STRUCTURE_FINAL.md`
- **Master Palette Spec:** `documentation/01-ARCHITECTURE/TT2_MASTER_PALETTE_SPEC.md`
- **Visual Demo:** `_COMMUNICATION/team_40/demos/button-system-demo.html`

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-31 | Initial complete documentation |

---

## 📞 Contact

**Team 40 - UI Assets & Design**  
**DNA Guardians - CSS Variables & Color System**

For questions, additions, or modifications to the palette, contact Team 40.

---

**Last Updated:** 2026-01-31  
**Status:** ✅ Production Ready

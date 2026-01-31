# 🎨 CSS Architecture & Hierarchy - Team 31 (Blueprint)

**Status:** ✅ ACTIVE DOCUMENTATION  
**Version:** v1.0.0  
**Date:** 2026-01-31  
**Team:** Team 31 (Blueprint)

---

## 📋 Overview

This document describes the complete CSS architecture and hierarchy used in Phoenix V2. It explains the file structure, loading order, and design principles.

---

## 🏗️ CSS File Hierarchy

### **Loading Order (CRITICAL)**

CSS files **MUST** be loaded in this exact order:

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

**⚠️ IMPORTANT:** Changing the loading order will break styles due to CSS cascade and specificity.

---

## 📁 File Structure & Purpose

### **1. phoenix-base.css**
**Purpose:** Global base styles - Single Source of Truth (SSOT)

**Contains:**
- CSS Variables (`:root`) - Apple Design System
  - Colors (Apple color palette)
  - Typography (font families, sizes, weights)
  - Spacing (spacing scale)
  - Shadows, borders, border-radius
  - Legacy compatibility variables
- Global defaults (`*` selector)
  - `font-family`: `var(--font-family-primary)` - **SINGLE SOURCE OF TRUTH**
  - `font-size`: `0.92rem` (14.72px) - System-wide default
  - `font-weight`: `300` (Light)
  - `line-height`: `1.4`
  - `box-sizing`: `border-box`
- Typography base (h1-h6)
  - Relative sizes using `rem` units
  - h1: 1.5rem, h2: 1.25rem, h3: 1.125rem, h4: 1rem, etc.
- Form elements base
  - `input`, `textarea`, `select` - System defaults
  - `padding`: `0.125rem 0.6rem` (reduced vertical padding)
  - `height`: `fit-content`
  - `border`: `1px solid #ddd`
  - `border-radius`: `4px`
- Button base styles
  - `height`: `fit-content`
  - Inherits font defaults

**Key Principle:** This file defines **system-wide defaults**. Other files override only when necessary.

---

### **2. phoenix-components.css**
**Purpose:** LEGO System Components - Reusable building blocks

**Contains:**
- `tt-container` - Outer container
  - Max-width: 1400px
  - Centers content
  - Padding: `var(--spacing-md)`
- `tt-section` - Content sections
  - Background: white
  - Border: `1px solid var(--apple-border-light)`
  - Border-radius: `2px`
  - Box-shadow: light shadow
  - Padding: `var(--spacing-lg, 24px)`
- `tt-section-row` - Row layouts
  - Flexbox layout
  - Gap: `var(--spacing-md)`
- `tt-section[data-title]` - Section headers
  - Auto-generated from `data-title` attribute

**Key Principle:** These components are **reusable across all pages**. Use them instead of custom layouts.

---

### **3. phoenix-header.css**
**Purpose:** Unified Header component styles

**Contains:**
- `#unified-header` - Main header container
  - Height: 120px (60px + 60px)
  - Sticky positioning
  - Z-index: 950
- `.header-top` - Top row (navigation)
  - Height: 60px
  - Contains: logo, navigation menu
- `.header-filters` - Filters row
  - Height: 60px
  - Contains: filter dropdowns, search, user icon
- Navigation styles
  - Main menu: `font-size: 1rem` (16px)
  - Dropdown menus
  - Utility icons
- Filter styles
  - Dropdowns, toggles, menus
  - Search input
  - Action buttons

**Key Principle:** Header-specific styles only. Not loaded on auth pages.

---

### **4. D15_IDENTITY_STYLES.css**
**Purpose:** Authentication pages specific styles

**Contains:**
- Auth layout (`body.auth-layout-root`)
  - Centered layout
  - Background gradient
  - Padding for G-Bridge banner
- Auth form controls
  - **Override:** Larger padding (`0.75rem 1rem`) for spacious layout
  - Form groups spacing (`8px` top/bottom)
- Auth-specific components
  - Logo, titles, subtitles
  - Buttons, links
  - Color hierarchy (Primary/Secondary)

**Key Principle:** Only loaded on auth pages. Uses `!important` where needed to override base styles.

---

## 🎯 Design Principles

### **1. Single Source of Truth (SSOT)**
- `font-family` defined **ONLY** in `phoenix-base.css` (`:root` → `*`)
- All elements inherit unless specifically overridden
- No duplicate definitions

### **2. CSS Variables (DNA Sync)**
- All colors use CSS variables (`var(--header-brand)`)
- All spacing uses variables (`var(--spacing-md)`)
- No hardcoded hex colors (except legacy compatibility)

### **3. Specificity Over !important**
- Use high-specificity selectors instead of `!important`
- `!important` only when:
  - Overriding Pico CSS defaults
  - Overriding inline styles
  - Auth pages (spacious layout needs)

### **4. Minimal CSS**
- No redundant declarations
- No duplicate class definitions
- Clean, maintainable code

### **5. RTL Charter**
- All elements use `direction: rtl`
- Logical properties where applicable
- Text alignment: `text-align: right`

---

## 📊 Specificity Hierarchy

From lowest to highest specificity:

1. **Pico CSS** (framework defaults)
2. **phoenix-base.css** (`*` selector, element selectors)
3. **phoenix-components.css** (LEGO components)
4. **phoenix-header.css** (header-specific, high specificity)
5. **Page-specific CSS** (highest specificity, e.g., `body.auth-layout-root form input`)

---

## 🔄 Override Strategy

### **System Defaults (phoenix-base.css)**
```css
* {
  font-size: 0.92rem; /* System default */
}
```

### **Component Override (phoenix-header.css)**
```css
#unified-header .tiktrack-nav-link {
  font-size: 1rem; /* Navigation larger than default */
}
```

### **Page-Specific Override (D15_IDENTITY_STYLES.css)**
```css
body.auth-layout-root form input {
  padding: 0.75rem 1rem !important; /* Auth pages need larger padding */
}
```

---

## 📐 Spacing System

**Base Spacing (phoenix-base.css):**
- `--spacing-xs`: 4px
- `--spacing-sm`: 8px
- `--spacing-md`: 16px
- `--spacing-lg`: 24px
- `--spacing-xl`: 32px

**Usage:**
- Form elements: `padding: 0.125rem 0.6rem` (system default)
- Auth pages: `padding: 0.75rem 1rem` (override for spacious layout)
- Form groups: `margin: 8px` (half spacing)

---

## 🎨 Color System

**Primary Colors:**
- `--header-brand`: `#26baac` (Primary - teal)
- `--header-dropdown-item-hover`: `#ff9e04` (Secondary - orange)

**Usage:**
- Primary: Subtitles, main actions
- Secondary: Titles, hover states

**All colors defined in:** `phoenix-base.css` → `:root`

---

## 🧩 LEGO System Components

**Components Available:**
- `tt-container` - Page container (max-width: 1400px)
- `tt-section` - Content section
- `tt-section-row` - Row layout

**Usage:**
```html
<tt-container>
  <tt-section data-title="כותרת">
    <tt-section-row>
      <!-- Content -->
    </tt-section-row>
  </tt-section>
</tt-container>
```

---

## 📝 File Naming Convention

- `phoenix-base.css` - Base styles (shared)
- `phoenix-components.css` - LEGO components (shared)
- `phoenix-header.css` - Header component (shared, conditional)
- `D15_[PAGE]_STYLES.css` - Page-specific styles (if needed)

---

## 📂 Assets Path Management

**ARCHITECTURAL NOTE:** All asset paths use relative paths from the HTML file location.

### **Current Structure:**
```
team_31_staging/
├── images/
│   └── logo.svg          # Logo asset
├── D15_LOGIN.html        # References: ./images/logo.svg
├── D15_REGISTER.html     # References: ./images/logo.svg
└── D15_RESET_PWD.html    # References: ./images/logo.svg
```

### **Path Convention:**
- **Relative paths:** `./images/logo.svg` (relative to HTML file)
- **No absolute paths:** Avoid `/images/logo.svg` (breaks in different environments)
- **No hardcoded URLs:** Avoid `https://example.com/images/logo.svg` (breaks offline)

### **QA Checklist:**
- ✅ Verify all asset paths work in staging environment
- ✅ Verify all asset paths work in production environment
- ✅ Check for broken links (404 errors)
- ✅ Ensure consistent folder structure across environments

### **Future Considerations:**
When integrating with backend:
- Consider using template variables for asset paths (e.g., `{{ ASSETS_URL }}/images/logo.svg`)
- Or use a build process to resolve paths at compile time
- Document any path resolution logic in backend integration guide

---

## ✅ Best Practices

1. **Always use CSS variables** for colors and spacing
2. **Inherit from base** - don't redefine unless necessary
3. **Use LEGO components** instead of custom layouts
4. **Maintain loading order** - critical for cascade
5. **Document overrides** - explain why `!important` is needed
6. **Keep it minimal** - no redundant CSS
7. **RTL first** - all styles must support RTL

---

## 🔍 Validation

All CSS follows:
- ✅ RTL Charter compliance
- ✅ DNA Sync (CSS Variables)
- ✅ LEGO System usage
- ✅ G-Bridge validation

---

## 📚 Related Documentation

- `STANDARD_PAGE_BUILD_WORKFLOW.md` - Page build process
- `BATCH_1_AUTH_COMPLETE.md` - Auth module documentation
- `CSS_NO_IMPORTANT_POLICY.md` - !important usage policy

---

**Last Updated:** 2026-01-31  
**Maintained By:** Team 31 (Blueprint)

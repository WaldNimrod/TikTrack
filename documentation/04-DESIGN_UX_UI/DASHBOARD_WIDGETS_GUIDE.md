# 📊 Dashboard & Widgets Implementation Guide

**Version:** 1.0  
**Last Updated:** 2026-01-31  
**Team:** Team 31 (Blueprint)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Dashboard Structure](#dashboard-structure)
3. [Widget System](#widget-system)
4. [Container Headers](#container-headers)
5. [Visual Fidelity Details](#visual-fidelity-details)
6. [JavaScript Functionality](#javascript-functionality)
7. [CSS Architecture](#css-architecture)
8. [Common Patterns](#common-patterns)

---

## 🎯 Overview

This guide documents the complete implementation of the Dashboard page (`D15_INDEX.html`) and the Widget system, including all visual fidelity requirements, architectural decisions, and implementation details.

### Key Principles
- **100% Visual Fidelity** to legacy design
- **System-Wide Consistency** across all components
- **Clean Architecture** - no `!important` pollution
- **Reusable Patterns** - DRY principle throughout

---

## 🏗️ Dashboard Structure

### Page Template

```html
<body>
  <header id="unified-header">...</header>
  <div class="page-wrapper">
    <div class="page-container">
      <main>
        <tt-container>
          <tt-section data-section="...">
            <!-- Section content -->
          </tt-section>
        </tt-container>
      </main>
    </div>
  </div>
</body>
```

### Critical CSS Rules

```css
/* Page wrapper: Full-width gray background */
.page-wrapper {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  background-color: var(--apple-bg-secondary, #F2F2F7);
}

/* Page container: Centered, 1400px max-width */
.page-container {
  max-width: 1400px;
  width: 100%;
  margin-inline: auto;
  padding: 0;
  overflow-x: hidden;
}
```

**⚠️ CRITICAL:** These rules prevent horizontal scrolling and establish the base page structure for the entire system.

---

## 🧩 Widget System

### Widget Types

#### Type 1: Widgets WITHOUT Tabs
- **Examples:** Tags Widget, Ticker Chart Widget
- **Header Height:** 40px
- **Structure:**
  ```html
  <div class="widget-placeholder">
    <div class="widget-placeholder__header">
      <div class="widget-placeholder__header-title-row">
        <!-- Title, icon, badges -->
      </div>
    </div>
    <div class="widget-placeholder__body">
      <!-- Content -->
    </div>
  </div>
  ```

#### Type 2: Widgets WITH Tabs
- **Examples:** Recent Trades, Pending Actions, Ticker List
- **Header Height:** 76px (40px title-row + 36px tabs)
- **Structure:**
  ```html
  <div class="widget-placeholder">
    <div class="widget-placeholder__header">
      <div class="widget-placeholder__header-title-row">
        <!-- Title, icon, badges -->
      </div>
      <ul class="widget-placeholder__tabs">
        <!-- Tab buttons -->
      </ul>
    </div>
    <div class="widget-placeholder__body">
      <!-- Content -->
    </div>
  </div>
  ```

### Widget Header Specifications

#### Unified Header Design
- **Height:** 
  - Type 1: 40px
  - Type 2: 76px (40px title-row + 36px tabs)
- **Title Row Height:** 40px (fixed, cannot break)
- **Alignment:** All elements vertically centered
- **Border:** 
  - Type 1: Border-bottom on header
  - Type 2: Border-bottom on title-row (between title and tabs)

#### Entity-Specific Colors

| Widget | Entity Color | CSS Variable |
|--------|-------------|--------------|
| Portfolio | Trading Account | `--entity-trading-account-color` |
| Ticker Chart | Ticker | `--entity-ticker-color` |
| Ticker List | Ticker | `--entity-ticker-color` |
| Tags | Research | `--entity-research-color` |
| Recent Trades | Trade | `--entity-trade-color` |
| Pending Actions | Execution | `--entity-execution-color` |

**Implementation:**
```css
/* Border only on title-row, NOT on header itself */
.widget-placeholder:has(.widget-placeholder__title-icon[alt="טריידים אחרונים"]):has(.widget-placeholder__tabs) .widget-placeholder__header-title-row {
  border-inline-start: 3px solid var(--entity-trade-color, #26baac);
}

/* CRITICAL: Ensure header itself does NOT have border */
.widget-placeholder:has(.widget-placeholder__title-icon[alt="טריידים אחרונים"]) .widget-placeholder__header {
  border-inline-start: none;
}
```

### Widget Elements

#### Refresh Button
- **Size:** 22px × 22px
- **Icon Size:** 14px × 14px (30% reduction from original 20px)
- **Alignment:** Vertically centered in title-row
- **CSS:**
  ```css
  .widget-placeholder__refresh-btn {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .widget-placeholder__refresh-btn svg {
    width: 14px;
    height: 14px;
    margin: auto; /* Perfect centering */
  }
  ```

#### Search Form (Tags Widget)
- **Height:** 20px (all elements)
- **Elements:** Input, Select, Button
- **Alignment:** All elements same height, vertically aligned
- **CSS:**
  ```css
  .widget-placeholder__search-input,
  .widget-placeholder__search-select,
  .widget-placeholder__search-btn {
    height: 20px;
    line-height: 20px;
    margin: 0;
    padding: 0 var(--spacing-xs, 4px);
  }
  ```

#### Tag Buttons
- **Padding:** 2px horizontal, minimal vertical
- **Font Size:** 0.75rem
- **Border Radius:** 12px
- **Height:** Fit-content (no fixed height)

---

## 📐 Container Headers

### Structure

```html
<div class="index-section__header">
  <div class="index-section__header-title">
    <img class="index-section__header-icon" src="..." alt="...">
    <h1 class="index-section__header-text">Title</h1>
  </div>
  <div class="index-section__header-meta">
    <span class="index-section__header-count">Subtitle</span>
  </div>
  <div class="index-section__header-actions">
    <button class="index-section__header-toggle-btn">Toggle</button>
  </div>
</div>
```

### Specifications

- **Height:** 60px (fixed, cannot break or stretch)
- **Layout:** 3-part flexbox (Title | Subtitle | Actions)
- **Borders:**
  - Left border: 3px (entity color)
  - Bottom border: 3px (entity color)
  - Top/Right: 1px (standard border)
- **Icon:** 35px × 35px with 3px padding-top
- **Alignment:** All elements vertically centered

### Entity Colors

| Section | Entity Color | CSS Variable |
|---------|-------------|--------------|
| Portfolio | Trading Account | `--entity-trading-account-color` |
| Dashboard | Trade (default) | `--entity-trade-color` |

**Implementation:**
```css
/* Portfolio header */
tt-section[data-section="portfolio"] .index-section__header {
  border-inline-start-color: var(--entity-trading-account-color, #28a745);
  border-block-end-color: var(--entity-trading-account-color, #28a745);
}
```

---

## 🎨 Visual Fidelity Details

### Spacing & Layout

#### Container Gap
- **Between sections:** `var(--spacing-md, 16px)` (gray background visible)
- **Between header and body:** `var(--spacing-xs, 4px)` (gray gap)

#### Widget Spacing
- **Between widgets in same row:** Standard grid gap
- **Widget internal padding:** `var(--spacing-lg, 24px)`

### Typography

#### Container Headers
- **Title:** `clamp(1.25rem, 3vw, 1.75rem)`, weight 600
- **Subtitle:** `0.92rem`, weight 500, opacity 0.8, centered

#### Widget Headers
- **Title:** `clamp(0.875rem, 2vw, 1rem)`, weight 600
- **Small text:** `0.75rem` (search inputs, tag buttons)

### Colors

#### Backgrounds
- **Page wrapper:** `var(--apple-bg-secondary, #F2F2F7)` (gray)
- **Cards (header/body):** `var(--apple-bg-elevated, #ffffff)` (white)

#### Borders
- **Standard:** `var(--apple-border-light, #e5e5e5)` (1px)
- **Entity accent:** 3px solid (entity-specific color)

---

## ⚙️ JavaScript Functionality

### Section Toggle

**Location:** Inline script in `D15_INDEX.html`

**Features:**
- Smooth animation (0.3s ease)
- Icon rotation (0° open, 180° closed)
- ARIA attributes (`aria-expanded`)
- Centralized, reusable code

**Usage:**
```javascript
// Automatically initializes on page load
// Finds all toggle buttons and their associated sections
// No manual initialization needed
```

**CSS Animation:**
```css
.index-section__body {
  transition: opacity 0.3s ease, max-height 0.3s ease, padding-block 0.3s ease;
}

.index-section__body[hidden] {
  opacity: 0;
  max-height: 0;
  padding-block: 0;
}
```

### Widget Tabs

**Features:**
- Tab switching within widgets
- Active state management
- Content pane visibility control

---

## 🏛️ CSS Architecture

### File Hierarchy

1. **Pico CSS** (external CDN)
2. **phoenix-base.css** - Base styles, CSS variables
3. **phoenix-components.css** - LEGO components
4. **phoenix-header.css** - Header styles
5. **D15_DASHBOARD_STYLES.css** - Page-specific styles

### Key Principles

#### No `!important` Policy
- ✅ **Exception:** Header styles (explicitly approved)
- ✅ All overrides use high-specificity selectors
- ✅ Proper CSS hierarchy ensures correct application

#### BEM Naming
- **Block:** `.widget-placeholder`
- **Element:** `.widget-placeholder__header`
- **Modifier:** `.widget-placeholder__tab-btn--active`

#### CSS Variables
- All colors use CSS variables
- All spacing uses CSS variables
- Entity colors defined in `phoenix-base.css`

---

## 🔄 Common Patterns

### Adding a New Widget

1. **HTML Structure:**
   ```html
   <div class="widget-placeholder">
     <div class="widget-placeholder__header">
       <div class="widget-placeholder__header-title-row">
         <h3 class="widget-placeholder__title">
           <img class="widget-placeholder__title-icon" alt="Widget Name" src="...">
           Widget Name
         </h3>
       </div>
       <!-- Add tabs here if Type 2 -->
     </div>
     <div class="widget-placeholder__body">
       <!-- Content -->
     </div>
   </div>
   ```

2. **Add Entity Color:**
   ```css
   .widget-placeholder:has(.widget-placeholder__title-icon[alt="Widget Name"]) .widget-placeholder__header-title-row {
     border-inline-start: 3px solid var(--entity-color, #color);
   }
   ```

### Adding a New Section

1. **HTML Structure:**
   ```html
   <tt-section data-section="section-name">
     <div class="index-section__header">
       <!-- Header content -->
     </div>
     <div class="index-section__body">
       <!-- Body content -->
     </div>
   </tt-section>
   ```

2. **Add Entity Color (if needed):**
   ```css
   tt-section[data-section="section-name"] .index-section__header {
     border-inline-start-color: var(--entity-color, #color);
     border-block-end-color: var(--entity-color, #color);
   }
   ```

---

## ✅ Checklist for New Implementations

- [ ] Page wrapper and container structure correct
- [ ] No horizontal scrolling
- [ ] Container header: 60px height, 3-part layout
- [ ] Widget header: Correct type (1 or 2), correct height
- [ ] Entity colors applied correctly (left border on title-row only)
- [ ] All elements vertically aligned
- [ ] No `!important` (except Header)
- [ ] Proper BEM naming
- [ ] CSS variables used
- [ ] RTL Charter compliance
- [ ] Smooth animations where applicable
- [ ] ARIA attributes for accessibility

---

## 📚 Related Documentation

- [Container Header Structure Guidelines](./CONTAINER_HEADER_STRUCTURE_GUIDELINES.md)
- [System-Wide Design Patterns](./SYSTEM_WIDE_DESIGN_PATTERNS.md)
- [CSS Classes Index](./CSS_CLASSES_INDEX.md)
- [CSS Standards Protocol](../10-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md)

---

**Last Updated:** 2026-01-31  
**Maintained by:** Team 31 (Blueprint)

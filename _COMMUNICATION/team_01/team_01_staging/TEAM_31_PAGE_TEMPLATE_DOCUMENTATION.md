# 📄 Phoenix Page Template - Documentation
**project_domain:** TIKTRACK

**Version:** 1.0.0  
**Date:** 2026-01-31  
**Team:** Team 31 (Blueprint)  
**Status:** ✅ **APPROVED BASE TEMPLATE**

---

## 🎯 Purpose

This document describes the **Phoenix Page Template** (`D15_PAGE_TEMPLATE.html`), a standardized base template that ensures consistency across all pages in the Phoenix system.

### Why This Template?

1. **Consistency**: All pages share the same base structure
2. **Maintainability**: Changes to base structure happen in one place
3. **Efficiency**: Developers start with a ready-made foundation
4. **Quality**: Ensures compliance with architectural standards
5. **Documentation**: Clear comments guide implementation

---

## 📋 Template Structure

### Core Components

```
D15_PAGE_TEMPLATE.html
├── <head>
│   ├── Meta tags
│   ├── CSS Loading (5 layers in correct order)
│   └── External scripts
├── <body>
│   ├── Unified Header (120px, fixed)
│   ├── Page Wrapper (full-width gray background)
│   │   └── Page Container (centered, 1400px max-width)
│   │       └── <main>
│   │           └── <tt-container>
│   │               └── <tt-section> (one or more)
│   │                   ├── Section Header (60px fixed)
│   │                   └── Section Body (white card)
│   ├── G-Bridge Banner
│   └── JavaScript (section toggle + page-specific)
```

---

## 🔥 Hot Zones (Areas to Customize)

The template includes **6 Hot Zones** marked with clear comments:

### **HOT ZONE 1: Page Title**
```html
<title>שם העמוד | TikTrack Phoenix</title>
```
**Action Required:** Update with your page name

---

### **HOT ZONE 2: Page-Specific CSS**
```html
<link rel="stylesheet" href="./D15_DASHBOARD_STYLES.css">
```
**Action Required:** Add your page-specific stylesheet (or remove if using shared CSS)

---

### **HOT ZONE 3: Body Class**
```html
<body class="page-template">
```
**Action Required:** Change to match your page (e.g., `"portfolio-page"`, `"settings-page"`)

---

### **HOT ZONE 4: Page Sections**
```html
<tt-section data-section="example-section">
  <!-- Section Header -->
  <!-- Section Body -->
</tt-section>
```
**Action Required:** 
- Delete the example section
- Add your actual page sections
- Each section needs:
  - Unique `data-section` attribute
  - Section header (title, subtitle, actions)
  - Section body (content)

---

### **HOT ZONE 5: Section Content**
```html
<div class="index-section__body">
  <tt-section-row>
    <!-- Your content here -->
  </tt-section-row>
</div>
```
**Action Required:** Add your actual content (forms, tables, widgets, etc.)

---

### **HOT ZONE 6: Page-Specific JavaScript**
```html
<!-- <script>
  // Your page-specific JavaScript here
</script> -->
```
**Action Required:** Uncomment and add your page-specific JavaScript

---

## 📐 Standard Section Structure

Every section follows this structure:

```html
<tt-section data-section="unique-section-name">
  <!-- Section Header: 60px fixed height, 3-part layout -->
  <div class="index-section__header">
    <!-- Part 1: Title (Icon + Text) -->
    <div class="index-section__header-title">
      <img src="..." class="index-section__header-icon" width="35" height="35">
      <h1 class="index-section__header-text">Section Title</h1>
    </div>
    
    <!-- Part 2: Subtitle/Metadata (centered, max-width remaining) -->
    <div class="index-section__header-meta">
      <span class="index-section__header-count">Subtitle or metadata</span>
    </div>
    
    <!-- Part 3: Actions (Toggle button, alert button, etc.) -->
    <div class="index-section__header-actions">
      <button class="index-section__header-toggle-btn">Toggle</button>
    </div>
  </div>

  <!-- Section Body: White card, separate from header -->
  <div class="index-section__body">
    <tt-section-row>
      <!-- Your content here -->
    </tt-section-row>
  </div>
</tt-section>
```

### Section Header Rules

- **Height:** 60px (fixed, cannot break or stretch)
- **Layout:** 3-part flexbox (Title | Subtitle | Actions)
- **Borders:** 
  - Left border: 3px (entity-specific color)
  - Bottom border: 3px (entity-specific color)
- **Icon:** 35px × 35px with 3px padding-top
- **Alignment:** All elements vertically centered

---

## 🎨 CSS Loading Order

**CRITICAL:** CSS must load in this exact order:

1. **Pico CSS** (external CDN) - Base framework
2. **phoenix-base.css** - CSS variables, reset, base typography
3. **phoenix-components.css** - LEGO system components
4. **phoenix-header.css** - Unified header styles
5. **Page-specific CSS** - Your page styles

**DO NOT** change this order.

---

## 🏗️ LEGO System Components

The template uses the LEGO system for consistent structure:

### `<tt-container>`
- Main container wrapper
- Provides consistent spacing and layout
- Required for all pages

### `<tt-section>`
- Individual content sections
- Each section is independent
- Can be toggled open/closed
- Entity colors applied via `data-section` attribute

### `<tt-section-row>`
- Grid rows within sections
- Use Bootstrap grid classes (`col-md-*`, etc.)
- Provides responsive layout

---

## ⚙️ Built-in Functionality

### Section Toggle
- **Automatic:** All sections can be toggled open/closed
- **Animation:** Smooth 0.3s ease transition
- **Icon:** Rotates 180° when closed
- **Accessibility:** ARIA attributes included

### Entity Colors
- Applied automatically based on `data-section` attribute
- Left border: 3px solid (entity color)
- Bottom border: 3px solid (entity color)

---

## 📝 Usage Workflow

### Step 1: Copy Template
```bash
cp D15_PAGE_TEMPLATE.html D15_YOUR_PAGE.html
```

### Step 2: Update Hot Zones
1. Update page title (HOT ZONE 1)
2. Add page-specific CSS (HOT ZONE 2)
3. Change body class (HOT ZONE 3)
4. Add your sections (HOT ZONE 4)
5. Add section content (HOT ZONE 5)
6. Add page-specific JavaScript (HOT ZONE 6)

### Step 3: Update Metadata
- Update the comment block at the top of `<body>`
- Update `Sync-Time`
- Update `Status`
- Update `Purpose`

### Step 4: Test
- Verify Unified Header displays correctly
- Check section toggle functionality
- Validate responsive behavior
- Test entity colors

---

## 🚫 What NOT to Modify

### DO NOT Modify:
- ✅ Unified Header structure
- ✅ Page wrapper/container structure
- ✅ CSS loading order
- ✅ Section toggle JavaScript (unless explicitly requested)
- ✅ G-Bridge banner

### DO Modify:
- ✅ Page title
- ✅ Body class
- ✅ Page sections (add/remove/modify)
- ✅ Section content
- ✅ Page-specific CSS
- ✅ Page-specific JavaScript

---

## 📚 Related Documentation

- [Container Header Structure Guidelines](../../documentation/04-DESIGN_UX_UI/CONTAINER_HEADER_STRUCTURE_GUIDELINES.md)
- [Unified Header Specification](../../documentation/04-DESIGN_UX_UI/UNIFIED_HEADER_SPECIFICATION.md)
- [System-Wide Design Patterns](../../documentation/04-DESIGN_UX_UI/SYSTEM_WIDE_DESIGN_PATTERNS.md)
- [Dashboard & Widgets Guide](../../documentation/04-DESIGN_UX_UI/DASHBOARD_WIDGETS_GUIDE.md)

---

## ✅ Checklist for New Pages

- [ ] Copied template to new file
- [ ] Updated page title (HOT ZONE 1)
- [ ] Added page-specific CSS (HOT ZONE 2)
- [ ] Changed body class (HOT ZONE 3)
- [ ] Updated metadata comment block
- [ ] Added page sections (HOT ZONE 4)
- [ ] Added section content (HOT ZONE 5)
- [ ] Added page-specific JavaScript (HOT ZONE 6)
- [ ] Verified Unified Header displays
- [ ] Tested section toggle functionality
- [ ] Validated entity colors
- [ ] Checked responsive behavior
- [ ] Updated documentation index

---

## 📞 Support

For questions or issues with the template:
1. Check this documentation first
2. Review related documentation links above
3. Contact Team 31 (Blueprint) through Team 10 (The Gateway)

---

**Last Updated:** 2026-01-31  
**Maintained by:** Team 31 (Blueprint)

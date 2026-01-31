# 🔍 D15_INDEX (Home Page) - Analysis & Build Plan

**Date:** 2026-01-31  
**Team:** Team 31 (Blueprint)  
**Status:** Phase 1 - Research & Analysis  
**Target:** D15_INDEX.html (דף הבית)

---

## 📋 Phase 1: Research & Analysis

### Step 1.1: Legacy File Study

**Source:** `_COMMUNICATION/Legace_html_for_blueprint/Home.html`

**Initial Observations:**
- ✅ Has `unified-header` (already built in Batch 1)
- ✅ Dashboard structure with widgets
- ✅ Multiple widgets: recent-items, pending-actions, tag-widget, ticker-list, ticker-chart
- ⚠️ Many CSS variables in inline style (need to extract to CSS)
- ⚠️ Many JavaScript dependencies (widgets, dashboard-data, etc.)
- ✅ RTL layout (`dir="rtl"`)

**Structure Overview:**
```
<body class="index-page">
  <div id="unified-header">...</div>
  <main>
    <!-- Dashboard widgets -->
    <!-- Recent items widget -->
    <!-- Pending actions widget -->
    <!-- Tag widget -->
    <!-- Ticker list widget -->
    <!-- Ticker chart widget -->
  </main>
</body>
```

---

### Step 1.2: Standard Legacy Analysis Script

**Status:** ⏳ **WAITING FOR USER**

**Action Required:**
1. Open `_COMMUNICATION/Legace_html_for_blueprint/Home.html` in browser
2. Open Console (F12)
3. Copy and paste `STANDARD_LEGACY_ANALYSIS.js` content
4. Share the console output or `window.LEGACY_ANALYSIS` object

**Expected Output:**
- DOM structure mapping
- Top 20 CSS classes
- Component inventory
- JavaScript dependencies
- Inline styles inventory

---

### Step 1.3: Review Existing Phoenix Pages

**Reference Pages:**
- ✅ `D15_LOGIN.html` - Auth page structure
- ✅ `D15_REGISTER.html` - Form patterns
- ✅ `D15_RESET_PWD.html` - Simple page structure

**Key Patterns to Reuse:**
- LEGO Components: `tt-container`, `tt-section`, `tt-section-row`
- CSS loading order (ITCSS hierarchy)
- RTL Charter compliance
- CSS Standards Protocol (ITCSS + BEM, Logical Properties)

---

## 📐 Phase 2: Planning & Scripting

**Status:** ⏳ **PENDING Phase 1 completion**

---

## 🏗️ Phase 3: Implementation

**Status:** ⏳ **PENDING Phase 1 & 2**

**Planned Structure:**
```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <!-- ITCSS Loading Order -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">
  <link rel="stylesheet" href="./phoenix-base.css">
  <link rel="stylesheet" href="./phoenix-components.css">
  <link rel="stylesheet" href="./phoenix-header.css">
  <link rel="stylesheet" href="./D15_INDEX_STYLES.css"> <!-- Page-specific -->
</head>
<body class="index-page">
  <!-- Unified Header (already built) -->
  <header id="unified-header">...</header>
  
  <!-- Main Content -->
  <main>
    <tt-container>
      <tt-section>
        <!-- Dashboard Widgets -->
      </tt-section>
    </tt-container>
  </main>
</body>
</html>
```

---

## ✅ Phase 4: Validation

**Planned Checks:**
- G-Bridge v2.0 validation
- RTL Charter compliance
- CSS Standards Protocol
- LEGO System usage
- Visual comparison with Legacy

---

## 📝 Notes

- This page includes the unified header (already built)
- Need to identify all widgets and their structure
- Need to extract CSS variables from inline styles
- Need to plan JavaScript integration (may be separate task)

---

**Last Updated:** 2026-01-31  
**Next Action:** Wait for user to run STANDARD_LEGACY_ANALYSIS.js

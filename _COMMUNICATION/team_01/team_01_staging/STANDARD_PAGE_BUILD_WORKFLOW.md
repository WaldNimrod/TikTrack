# 📋 Standard Page Build Workflow - Team 30
**project_domain:** TIKTRACK

**Status:** ✅ ACTIVE WORKFLOW  
**Effective Date:** 2026-01-31  
**Team:** Team 30 (Frontend)  
**Purpose:** Standardized workflow for building all pages in Phoenix V2

---

## 🎯 Workflow Overview

This workflow ensures consistent, high-quality page implementation following LOD 400 standards and pixel-perfect fidelity requirements.

---

## 📝 Step-by-Step Process

### **Phase 1: Research & Analysis** 🔍

#### Step 1.1: Study Legacy Files
- **Location:** `_COMMUNICATION/Legace_html_for_blueprint/`
- **Actions:**
  - Read and analyze the legacy HTML file for the target page
  - Study all related DOM files in the legacy directory
  - Document structure, components, and styling patterns
  - Identify all CSS classes, IDs, and data attributes
  - Note any JavaScript dependencies or interactions

#### Step 1.2: Run Initial Analysis Script
- **Script:** `_COMMUNICATION/cursor_messages/STANDARD_LEGACY_ANALYSIS.js`
- **Usage:** Copy script into browser console when viewing legacy HTML file
- **Purpose:** Extract insights from legacy version
- **Output:** Analysis report with:
  - DOM structure mapping
  - CSS class inventory (top 20 classes)
  - Component dependencies (forms, tables, cards, etc.)
  - Styling patterns
  - JavaScript interactions
  - RTL/LTR detection
  - Inline styles inventory
- **Data Export:** Results stored in `window.LEGACY_ANALYSIS` for further processing

#### Step 1.3: Review Existing Phoenix Pages
- Check similar pages already built in Phoenix
- Review CSS patterns and component usage
- Identify reusable LEGO components
- Note any established patterns to follow

---

### **Phase 2: Planning & Scripting** 📐

#### Step 2.1: Build Page-Specific Analysis Script
- **Purpose:** Deep dive into the specific page requirements
- **Script Location:** `_COMMUNICATION/cursor_messages/[PAGE_NAME]_ANALYSIS.js`
- **Should Include:**
  - DOM structure comparison
  - CSS specificity analysis
  - Component mapping
  - Style inheritance tracking
  - RTL compliance checks

---

### **Phase 3: Implementation** 🏗️

#### Step 3.1: Build Page Structure
- Create HTML file: `D15_[PAGE_NAME].html`
- Use LEGO components (`tt-container`, `tt-section`, `tt-section-row`)
- Follow RTL Charter (direction: rtl, text-align: right)
- Implement exact DOM structure from legacy

#### Step 3.2: Apply Styling
- Use existing CSS files hierarchy:
  1. Pico CSS (framework)
  2. `phoenix-base.css` (base styles)
  3. `phoenix-components.css` (LEGO components)
  4. `phoenix-header.css` (if header needed)
  5. Page-specific CSS (if needed)
- Follow DNA Sync (use CSS variables)
- Avoid `!important` unless absolutely necessary
- Ensure single source of truth for common styles

#### Step 3.3: Implement Functionality
- Add JavaScript for interactions (if needed)
- Ensure RTL support
- Test all interactive elements

---

### **Phase 4: Validation** ✅

#### Step 4.1: G-Bridge Validation
- **Command:** `node "../../cursor_messages/HOENIX G-BRIDGE.js" D15_[PAGE_NAME].html`
- **Checks:**
  - RTL Charter compliance
  - LEGO System usage
  - DNA Sync (CSS Variables)
  - Structure validation
  - No hardcoded colors

#### Step 4.2: Visual Comparison
- Open `_PREVIEW_D15_[PAGE_NAME].html` in browser
- Compare with legacy version side-by-side
- Check pixel-perfect fidelity
- Verify all elements render correctly

---

### **Phase 5: Visual Approval & Refinement** 👁️

#### Step 5.1: Visual Review
- Present preview to visual reviewer
- Document feedback and required changes
- Implement corrections iteratively

#### Step 5.2: Iterative Refinement
- Make adjustments based on feedback
- Re-run G-Bridge validation after each change
- Update preview files
- Repeat until visual approval granted

---

### **Phase 6: Cleanup & Optimization** 🧹

#### Step 6.1: CSS Cleanup
- **Check for:**
  - Duplicate class definitions
  - Redundant CSS rules
  - Unused styles
  - Overly specific selectors
  - Missing CSS variable usage

#### Step 6.2: Logic Review
- **Verify:**
  - Correct class division and hierarchy
  - Proper use of LEGO components
  - Logical CSS organization
  - Clean separation of concerns
  - Proper inheritance and specificity

#### Step 6.3: Code Quality
- Remove commented-out code
- Ensure consistent formatting
- Verify all comments are accurate
- Check file headers are updated

---

### **Phase 7: Final Submission** 📤

#### Step 7.1: Final Validation
- Run G-Bridge one final time
- Verify all checks pass
- Ensure preview file is up-to-date

#### Step 7.2: Documentation Update
- Update page header comments:
  - Version number
  - Status: ✅ READY FOR VISUAL APPROVAL
  - Compliance checkmarks
- Update G-Bridge banner in HTML

#### Step 7.3: Submit for Sign-Off
- Present final preview for visual approval
- Document any final adjustments needed
- Prepare for sign-off

---

### **Phase 8: Sign-Off & Handoff** ✍️

#### Step 8.1: Final Sign-Off
- Update all file headers:
  - Status: ✅ FINALLY APPROVED | ✅ READY FOR DEVELOPMENT | ✅ SIGNED OFF
  - Version: vX.X.X (FINAL APPROVED)
  - Visual Approval: ✅ FINAL APPROVAL GRANTED
- Update G-Bridge banner: ✅ FINALLY APPROVED | ✅ SIGNED OFF

#### Step 8.2: Git Commit
- Stage all related files
- Commit with descriptive message:
  ```
  [Page Name]: Final approval and sign-off
  
  ✅ FINALLY APPROVED | ✅ READY FOR DEVELOPMENT | ✅ SIGNED OFF
  
  [Key features implemented]
  - Feature 1
  - Feature 2
  
  All pages:
  - G-Bridge Validated ✅
  - Visual Approval ✅ FINAL APPROVAL GRANTED
  - Ready for Development Handoff ✅
  ```

#### Step 8.3: Handoff Documentation
- Create/update completion report
- Document any special considerations
- Note dependencies or requirements for backend

---

## 📊 Quality Checklist

Before final submission, verify:

- [ ] Legacy files studied and understood
- [ ] Initial analysis script run
- [ ] Page-specific script created and run
- [ ] HTML structure matches legacy exactly
- [ ] CSS follows hierarchy (Pico → Base → Components → Page-specific)
- [ ] RTL Charter compliance verified
- [ ] DNA Sync (CSS Variables) used throughout
- [ ] LEGO System components used correctly
- [ ] G-Bridge validation passed
- [ ] Visual comparison completed
- [ ] Visual approval received
- [ ] CSS cleaned (no duplicates, redundant rules)
- [ ] Logic reviewed and optimized
- [ ] File headers updated
- [ ] Preview file generated
- [ ] Final sign-off completed
- [ ] Git commit created

---

## 🎯 Next Pages to Build

Based on existing files, next pages in order:

**Note:** D15_INDEX.html (Home page) already exists - this is the dashboard/home page.

1. **D15_PROF_VIEW.html** - Profile view page
2. **D16_ACCTS_VIEW.html** - Accounts view page
3. **D18_BRKRS_VIEW.html** - Brokers view page
4. **D21_CASH_VIEW.html** - Cash flow view page
5. **D24_API_VIEW.html** - API keys view page
6. **D25_SEC_VIEW.html** - Securities view page

---

## 📁 File Locations

- **Legacy Files:** `_COMMUNICATION/Legace_html_for_blueprint/`
- **Analysis Scripts:** `_COMMUNICATION/cursor_messages/`
- **Built Pages:** `_COMMUNICATION/team_01/team_01_staging/`
- **Preview Files:** `_COMMUNICATION/team_01/team_01_staging/_PREVIEW_D15_*.html`
- **G-Bridge Script:** `_COMMUNICATION/cursor_messages/HOENIX G-BRIDGE.js`

---

## 🔄 Continuous Improvement

This workflow should be refined based on:
- Lessons learned from each page build
- New requirements or standards
- Tool improvements
- Team feedback

## 💡 Suggested Enhancements

1. **Automated Comparison Tool:** Script to compare legacy vs Phoenix side-by-side
2. **CSS Specificity Calculator:** Tool to verify selector specificity hierarchy
3. **Component Library:** Documented LEGO components with usage examples
4. **Style Guide Reference:** Quick reference for common patterns

## ✅ Workflow Approval

**Status:** ✅ APPROVED AND ACTIVE  
**Approved By:** Visual Review  
**Effective Date:** 2026-01-31  
**Next Review:** After 3 pages completed

**Last Updated:** 2026-01-31

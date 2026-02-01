# 📄 Phoenix Page Template - Quick Reference

**Version:** 1.0.0  
**Date:** 2026-01-31  
**Team:** Team 31 (Blueprint)  
**Status:** ✅ **APPROVED BASE TEMPLATE**

---

## 🎯 Purpose

Standardized base template for all Phoenix pages. Ensures consistency and provides a solid foundation for new pages.

**File Location:** `_COMMUNICATION/team_31/team_31_staging/D15_PAGE_TEMPLATE.html`  
**Sandbox Location:** `_COMMUNICATION/team_01/team_01_staging/D15_PAGE_TEMPLATE.html`  
**Sandbox Preview:** `_COMMUNICATION/team_01/team_01_staging/_PREVIEW_D15_PAGE_TEMPLATE.html`  
**G-Bridge Status:** ✅ **PASSED** (0 issues)

---

## 🔥 Hot Zones (6 Areas to Customize)

1. **HOT ZONE 1:** Page Title (`<title>` tag)
2. **HOT ZONE 2:** Page-Specific CSS (`<link>` in head)
3. **HOT ZONE 3:** Body Class (`<body class="...">`)
4. **HOT ZONE 4:** Page Sections (`<tt-section>` elements)
5. **HOT ZONE 5:** Section Content (inside `<tt-section-row>`)
6. **HOT ZONE 6:** Page-Specific JavaScript (at end of body)

---

## 📋 Usage

1. Copy template: `cp D15_PAGE_TEMPLATE.html D15_YOUR_PAGE.html`
2. Update all 6 Hot Zones
3. Update metadata comment block
4. Run G-Bridge validation: `node "../../cursor_messages/HOENIX G-BRIDGE.js" D15_YOUR_PAGE.html`
5. Fix any validation issues
6. Update G-Bridge banner status

---

## ✅ Validation

Use the existing **G-Bridge v2.0** system:
- Script: `_COMMUNICATION/cursor_messages/HOENIX G-BRIDGE.js`
- Command: `node "../../cursor_messages/HOENIX G-BRIDGE.js" [filename].html`
- Must pass before proceeding to visual validation

---

## 📚 Related Documentation

- [Container Header Structure Guidelines](../../documentation/04-DESIGN_UX_UI/CONTAINER_HEADER_STRUCTURE_GUIDELINES.md)
- [Unified Header Specification](../../documentation/04-DESIGN_UX_UI/UNIFIED_HEADER_SPECIFICATION.md)
- [System-Wide Design Patterns](../../documentation/04-DESIGN_UX_UI/SYSTEM_WIDE_DESIGN_PATTERNS.md)
- [Standard Page Build Workflow](../team_31_staging/STANDARD_PAGE_BUILD_WORKFLOW.md)

---

**Last Updated:** 2026-01-31  
**Maintained by:** Team 31 (Blueprint)

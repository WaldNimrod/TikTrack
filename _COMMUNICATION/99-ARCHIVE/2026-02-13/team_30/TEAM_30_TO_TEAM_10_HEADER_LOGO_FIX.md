# Team 30 → Team 10: Header Logo and Icon Path Fix

**Date:** 2026-02-03  
**From:** Team 30 (Frontend Implementation)  
**To:** Team 10 (The Gateway)  
**Priority:** Medium  
**Status:** ✅ Fixed

---

## 🎯 Issue Summary

Logo and home icon in the header were not displaying because they used **relative paths** that broke when the HTML was served from clean routes (e.g., `/trading_accounts`).

### Issues:
1. **Logo:** `<img src="../../../../ui/public/images/logo.svg">` - Broken link
2. **Home Icon:** `<img src="../../../../ui/public/images/icons/entities/home.svg">` - Broken link

---

## 🔍 Root Cause

When `unified-header.html` is loaded dynamically via `header-loader.js` and the page is served from `/trading_accounts`, relative paths like `../../../../ui/public/images/logo.svg` resolve incorrectly.

**Solution:** Changed to absolute paths using `/images/...` which Vite serves from the `public` directory.

---

## ✅ Solution Implemented

**Changed relative paths to absolute paths:**

| Old (Relative) | New (Absolute) |
|----------------|----------------|
| `../../../../ui/public/images/logo.svg` | `/images/logo.svg` |
| `../../../../ui/public/images/icons/entities/home.svg` | `/images/icons/entities/home.svg` |

### Files Updated:

1. **`ui/src/components/core/unified-header.html`**
   - ✅ Logo path updated to `/images/logo.svg`
   - ✅ Home icon path updated to `/images/icons/entities/home.svg`

---

## 📋 Notes

- Vite automatically serves files from the `public` directory at the root path (`/`)
- Files in `ui/public/images/` are accessible at `/images/...`
- This works consistently regardless of which route serves the HTML page

---

## 🧪 Testing Required

**Please verify:**
1. Navigate to `/trading_accounts`
2. Check that logo appears in header (top center)
3. Check that home icon appears in navigation menu (first item)
4. Verify both images load correctly

---

## 🔗 Related Files

- `ui/src/components/core/unified-header.html` - Header component
- `ui/public/images/logo.svg` - Logo file
- `ui/public/images/icons/entities/home.svg` - Home icon file

---

**Team 30 Status:** ✅ Fixed - Ready for testing

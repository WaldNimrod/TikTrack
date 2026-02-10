# 🗺️ CSS Retrofit Plan - Sticky Columns Implementation

**From:** Team 40 (UI Assets & Design)  
**To:** Team 10 (The Gateway)  
**Date:** 2026-02-10  
**Session:** Pre-coding Mapping (Architect Mandate)  
**Subject:** CSS_RETROFIT_PLAN | Status: ✅ **COMPLETE**  
**Priority:** 🔴 **P0 - BLOCKING**

**מקור:** `ARCHITECT_PRE_CODING_MAPPING_MANDATE.md`

---

## 📋 Executive Summary

**מטרה:** רשימת קבצי CSS שיעברו התאמה ל-Sticky Columns (לפי מנדט המיפוי המקדים).

**סטטוס:** ✅ **מיפוי הושלם** - כל קבצי ה-CSS נסרקו וזוהו לפיוריטיזציה.

---

## 📊 רשימת קבצי CSS לפיוריטיזציה

### **🔴 Priority 1: HIGH (כבר מיושם או קריטי)**

| קובץ | נתיב | סטטוס Sticky | הערות |
|------|------|---------------|-------|
| **phoenix-components.css** | `ui/src/styles/phoenix-components.css` | ✅ **מיושם** | Sticky Columns כבר מיושם (שורות 1273-1381): `col-name`, `col-symbol`, `col-broker`, `col-trade`, `col-date`, `col-actions` |
| **phoenix-header.css** | `ui/src/styles/phoenix-header.css` | ✅ **מיושם** | Sticky Header כבר מיושם (שורה 32: `position: sticky`) |

---

### **🟡 Priority 2: MEDIUM (נדרש לבדיקה/תיקון)**

| קובץ | נתיב | סטטוס Sticky | הערות |
|------|------|---------------|-------|
| **phoenix-modal.css** | `ui/src/styles/phoenix-modal.css` | ⚠️ **נדרש בדיקה** | מודלים עשויים להזדקק ל-Sticky headers/footers במודלים גדולים |
| **D15_DASHBOARD_STYLES.css** | `ui/src/styles/D15_DASHBOARD_STYLES.css` | ⚠️ **נדרש בדיקה** | טבלאות בדשבורד עשויות להזדקק ל-Sticky columns |

---

### **🟢 Priority 3: LOW (לא קריטי)**

| קובץ | נתיב | סטטוס Sticky | הערות |
|------|------|---------------|-------|
| **phoenix-base.css** | `ui/src/styles/phoenix-base.css` | ✅ **CSS Variables בלבד** | מכיל רק CSS Variables (SSOT) - אין צורך ב-Sticky retrofit |
| **D15_IDENTITY_STYLES.css** | `ui/src/styles/D15_IDENTITY_STYLES.css` | ✅ **לא רלוונטי** | עמודי Auth (login/register/reset) - אין טבלאות או Sticky elements |

---

## 📋 פירוט Sticky Columns מיושם

### **phoenix-components.css (Priority 1)**

**סטטוס:** ✅ **מיושם במלואו**

**Sticky Columns מיושמים:**
- ✅ `.col-name` - שם החשבון (ראשונה מימין ב-RTL)
- ✅ `.col-symbol` - סמל (לטבלת פוזיציות)
- ✅ `.col-broker` - ברוקר (לטבלת D18)
- ✅ `.col-trade` - טרייד (לטבלת D21 Cash Flows)
- ✅ `.col-date` - תאריך (D16 Account Activity, D21 Currency Conversions)
- ✅ `.col-actions` - פעולות (אחרונה משמאל ב-RTL)

**מיקום בקובץ:** שורות 1273-1381

**תכונות:**
- `position: sticky`
- `inset-inline-start/end` (RTL support)
- `z-index` hierarchy (`--z-index-sticky: 200`)
- `box-shadow` for visual separation
- Background colors for headers vs cells

---

### **phoenix-header.css (Priority 1)**

**סטטוס:** ✅ **מיושם במלואו**

**Sticky Header:**
- ✅ `#unified-header` - Header sticky at top (שורה 32)

**תכונות:**
- `position: sticky`
- `top: 0`
- Full width header

---

## 📋 קבצים נדרשים לבדיקה

### **phoenix-modal.css (Priority 2)**

**סיבה לבדיקה:**
- מודלים גדולים עשויים להזדקק ל-Sticky headers/footers
- מודלים עם תוכן ארוך עשויים להזדקק ל-Sticky action buttons

**פעולות נדרשות:**
- [ ] בדיקת מודלים קיימים - האם יש מודלים עם תוכן ארוך?
- [ ] בדיקת צורך ב-Sticky modal headers/footers
- [ ] החלטה: האם נדרש Sticky retrofit?

---

### **D15_DASHBOARD_STYLES.css (Priority 2)**

**סיבה לבדיקה:**
- טבלאות בדשבורד עשויות להזדקק ל-Sticky columns
- בדיקת התאמה ל-Sticky system הקיים

**פעולות נדרשות:**
- [ ] בדיקת טבלאות בדשבורד - האם יש טבלאות עם Sticky columns?
- [ ] בדיקת התאמה ל-Sticky system ב-`phoenix-components.css`
- [ ] החלטה: האם נדרש Sticky retrofit?

---

## ✅ סיכום

**קבצים עם Sticky מיושם:**
- ✅ `phoenix-components.css` - Sticky Columns (6 columns)
- ✅ `phoenix-header.css` - Sticky Header

**קבצים נדרשים לבדיקה:**
- ⚠️ `phoenix-modal.css` - Sticky modal headers/footers (אם נדרש)
- ⚠️ `D15_DASHBOARD_STYLES.css` - Sticky columns בטבלאות דשבורד (אם נדרש)

**קבצים לא רלוונטיים:**
- ✅ `phoenix-base.css` - CSS Variables בלבד (SSOT)
- ✅ `D15_IDENTITY_STYLES.css` - עמודי Auth (אין טבלאות)

---

## 🔗 רפרנסים

- **מנדט מיפוי:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PRE_CODING_MAPPING_MANDATE.md`
- **מיפוי מאוחד:** `_COMMUNICATION/team_40/TEAM_30_40_UNIFIED_PHASE_2_MAPPING.md`
- **Sticky Columns SSOT:** `documentation/09-GOVERNANCE/ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md`

---

**Team 40 (UI Assets & Design)**  
**Date:** 2026-02-10  
**Status:** ✅ **CSS_RETROFIT_PLAN_COMPLETE**

**log_entry | [Team 40] | PRE_CODING_MAPPING | CSS_RETROFIT_PLAN | COMPLETE | 2026-02-10**

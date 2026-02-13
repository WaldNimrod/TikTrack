# 📋 הודעה: דרישת אדריכל - Sticky Columns (D16_ACCTS_VIEW)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 40 (UI/Design)  
**תאריך:** 2026-02-03  
**סטטוס:** 🔴 **CRITICAL - ARCHITECT MANDATE**  
**עדיפות:** 🔴 **CRITICAL**

---

## 📢 פסיקת האדריכל: Sticky Columns

**מקור:** Chief Architect (Gemini)  
**תאריך:** 2026-02-03  
**סטטוס:** 🛡️ **MANDATORY**

### **דרישה:**
כל הטבלאות ב-D16 חייבות לכלול **Sticky Columns** עבור:
1. **עמודת שם החשבון** (`col-name`)
2. **עמודת פעולות** (`col-actions`)

**מטרה:** לשמור על קונטקסט ב-Fluid Design כאשר הטבלה נגללת אופקית.

---

## 🎯 יישום נדרש

### **1. Sticky Column - שם החשבון (`col-name`)**

**דרישות:**
- עמודה ראשונה (מימין ב-RTL)
- `position: sticky`
- `inset-inline-start: 0` (RTL)
- רקע לבן כדי לכסות תוכן מתחת
- z-index גבוה יותר מעמודות אחרות

**יישום CSS:**
```css
/* Sticky Column - שם החשבון (ראשונה מימין ב-RTL) */
.phoenix-table__header.col-name,
.phoenix-table__cell.col-name {
  position: sticky;
  inset-inline-start: 0;
  background: var(--apple-bg-elevated, #ffffff);
  z-index: var(--z-index-sticky, 10);
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
}

/* Header sticky עם רקע נפרד */
.phoenix-table__header.col-name {
  background: var(--apple-bg-secondary, #f2f2f7);
  z-index: calc(var(--z-index-sticky, 10) + 1);
}
```

---

### **2. Sticky Column - פעולות (`col-actions`)**

**דרישות:**
- עמודה אחרונה (משמאל ב-RTL)
- `position: sticky`
- `inset-inline-end: 0` (RTL)
- רקע לבן כדי לכסות תוכן מתחת
- z-index גבוה יותר מעמודות אחרות

**יישום CSS:**
```css
/* Sticky Column - פעולות (אחרונה משמאל ב-RTL) */
.phoenix-table__header.col-actions,
.phoenix-table__cell.col-actions {
  position: sticky;
  inset-inline-end: 0;
  background: var(--apple-bg-elevated, #ffffff);
  z-index: var(--z-index-sticky, 10);
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
}

/* Header sticky עם רקע נפרד */
.phoenix-table__header.col-actions {
  background: var(--apple-bg-secondary, #f2f2f7);
  z-index: calc(var(--z-index-sticky, 10) + 1);
}
```

---

## ⚠️ כללים קריטיים

### **1. RTL Support**
- `inset-inline-start: 0` = מימין ב-RTL
- `inset-inline-end: 0` = משמאל ב-RTL
- שימוש ב-logical properties (`inset-inline-*`) ולא `left`/`right`

### **2. Z-Index Hierarchy**
- Headers: `z-index: calc(var(--z-index-sticky, 10) + 1)` (גבוה יותר)
- Cells: `z-index: var(--z-index-sticky, 10)`

### **3. Background & Shadow**
- רקע לבן כדי לכסות תוכן מתחת
- Shadow קל כדי להבדיל מהעמודות האחרות
- שימוש ב-CSS Variables בלבד

### **4. Fluid Design**
- Sticky Columns עובדים עם horizontal scroll
- אין media queries - עובד בכל רוחב מסך
- שומר על קונטקסט גם במובייל

---

## 📋 טבלאות שצריכות Sticky Columns

| טבלה | עמודת שם | עמודת פעולות |
|:---|:---|:---|
| **טבלת חשבונות מסחר** | ✅ `col-name` | ✅ `col-actions` |
| **טבלת תנועות** | ❌ אין עמודת שם | ✅ `col-actions` |
| **טבלת פוזיציות** | ✅ `col-symbol` (סמל) | ✅ `col-actions` |

**הערה:** טבלת תנועות לא צריכה sticky column לשם כי אין לה עמודת שם. רק `col-actions` צריך להיות sticky.

---

## 📞 קישורים רלוונטיים

- **הודעה מהאדריכל:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_D16_ACCTS_VIEW_PRODUCTION_START.md`
- **קובץ CSS:** `ui/src/styles/phoenix-components.css`
- **בלופרינט:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D16_ACCTS_VIEW.html`

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-03  
**סטטוס:** 🔴 **CRITICAL - ARCHITECT MANDATE**

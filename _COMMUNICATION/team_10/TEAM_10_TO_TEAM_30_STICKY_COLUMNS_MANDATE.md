# 📋 הודעה: דרישת אדריכל - Sticky Columns (D16_ACCTS_VIEW)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Implementation)  
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
1. **עמודת שם החשבון** (`col-name`) או **עמודת סמל** (`col-symbol`)
2. **עמודת פעולות** (`col-actions`)

**מטרה:** לשמור על קונטקסט ב-Fluid Design כאשר הטבלה נגללת אופקית.

---

## 🎯 יישום נדרש ב-HTML

### **1. טבלת חשבונות מסחר (קונטיינר 1)**

**עמודות Sticky:**
- ✅ עמודה ראשונה: `col-name` (שם החשבון)
- ✅ עמודה אחרונה: `col-actions` (פעולות)

**מבנה HTML:**
```html
<th class="phoenix-table__header col-name js-table-sort-trigger" 
    data-sortable="true" 
    data-sort-key="name" 
    data-sort-type="string" 
    role="columnheader" 
    aria-sort="none" 
    tabindex="0">
  <span class="phoenix-table__header-text">שם החשבון</span>
  <!-- Sticky column - CSS יטופל ב-phoenix-components.css -->
</th>

<!-- ... עמודות אחרות ... -->

<th class="phoenix-table__header col-actions" 
    data-sortable="false" 
    role="columnheader">
  <span class="phoenix-table__header-text">פעולות</span>
  <!-- Sticky column - CSS יטופל ב-phoenix-components.css -->
</th>
```

---

### **2. טבלת תנועות (קונטיינר 3)**

**עמודות Sticky:**
- ❌ אין עמודת שם (לא נדרש)
- ✅ עמודה אחרונה: `col-actions` (פעולות)

**מבנה HTML:**
```html
<!-- ... עמודות אחרות ... -->

<th class="phoenix-table__header col-actions" 
    data-sortable="false" 
    role="columnheader">
  <span class="phoenix-table__header-text">פעולות</span>
  <!-- Sticky column - CSS יטופל ב-phoenix-components.css -->
</th>
```

---

### **3. טבלת פוזיציות (קונטיינר 4)**

**עמודות Sticky:**
- ✅ עמודה ראשונה: `col-symbol` (סמל)
- ✅ עמודה אחרונה: `col-actions` (פעולות)

**מבנה HTML:**
```html
<th class="phoenix-table__header col-symbol js-table-sort-trigger" 
    data-sortable="true" 
    data-sort-key="symbol" 
    data-sort-type="string" 
    role="columnheader" 
    aria-sort="none" 
    tabindex="0">
  <span class="phoenix-table__header-text">סמל</span>
  <!-- Sticky column - CSS יטופל ב-phoenix-components.css -->
</th>

<!-- ... עמודות אחרות ... -->

<th class="phoenix-table__header col-actions" 
    data-sortable="false" 
    role="columnheader">
  <span class="phoenix-table__header-text">פעולות</span>
  <!-- Sticky column - CSS יטופל ב-phoenix-components.css -->
</th>
```

---

## ⚠️ כללים קריטיים

### **1. CSS Classes**
- Sticky columns יטופלו ב-`phoenix-components.css` על ידי Team 40
- אין צורך להוסיף inline styles או classes נוספים
- רק וודא שהמחלקות `col-name`, `col-symbol`, `col-actions` קיימות

### **2. RTL Support**
- Sticky columns עובדים אוטומטית ב-RTL עם `inset-inline-start` ו-`inset-inline-end`
- אין צורך בשינויים ב-HTML

### **3. Fluid Design**
- Sticky columns עובדים עם horizontal scroll
- שומר על קונטקסט גם במובייל
- אין media queries נדרשות

---

## 📋 Checklist

### **טבלת חשבונות מסחר:**
- [ ] עמודה ראשונה: `col-name` עם מחלקה נכונה
- [ ] עמודה אחרונה: `col-actions` עם מחלקה נכונה
- [ ] CSS יטופל על ידי Team 40

### **טבלת תנועות:**
- [ ] עמודה אחרונה: `col-actions` עם מחלקה נכונה
- [ ] CSS יטופל על ידי Team 40

### **טבלת פוזיציות:**
- [ ] עמודה ראשונה: `col-symbol` עם מחלקה נכונה
- [ ] עמודה אחרונה: `col-actions` עם מחלקה נכונה
- [ ] CSS יטופל על ידי Team 40

---

## 📞 קישורים רלוונטיים

- **הודעה מהאדריכל:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_D16_ACCTS_VIEW_PRODUCTION_START.md`
- **הודעה ל-Team 40:** `TEAM_10_TO_TEAM_40_STICKY_COLUMNS_MANDATE.md`
- **בלופרינט:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D16_ACCTS_VIEW.html`

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-03  
**סטטוס:** 🔴 **CRITICAL - ARCHITECT MANDATE**

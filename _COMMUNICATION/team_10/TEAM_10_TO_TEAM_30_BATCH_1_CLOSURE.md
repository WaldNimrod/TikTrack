# 📡 הודעה: צוות 10 → Team 30 (Batch 1 Closure - Frontend Mandate)

**From:** Team 10 (The Gateway)  
**To:** Team 30 (Frontend Execution)  
**Date:** 2026-02-02  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** BATCH_1_CLOSURE_FRONTEND_MANDATE | Status: 🛡️ **MANDATORY**  
**Priority:** 🔴 **CRITICAL**

---

## 📢 פסיקת האדריכל: צוות 30 - "בוני הלגו"

חבילה 1 (Identity & Auth) מאושרת רשמית כבלופרינט המחייב של המערכת.

להלן ההנחיות הספציפיות לצוות 30:

---

## 🎯 תפקיד: "בוני הלגו"

**האדריכלית הגדירה את צוות 30 כ"בוני הלגו"** - אכיפת בידוד מוחלט בין קוביות (Cubes).

---

## 🚨 חוקי ברזל

### **1. בידוד מוחלט בין קוביות**

**חוק ברזל:**
- 🚨 **אין imports בין קוביות (חוץ מ-`cubes/shared`)**
- 🚨 **כל קוביה היא אי עצמאי**

**דוגמאות:**
```javascript
// ✅ נכון - import מ-shared
import { transformers } from '../../shared/utils/transformers.js';

// ✅ נכון - import מ-core components
import UnifiedHeader from '../../../../components/core/UnifiedHeader.jsx';

// ❌ שגוי - import מקוביה אחרת
import { something } from '../../financial/services/something.js'; // אסור!
```

**פעולות נדרשות:**
- ✅ בדיקת כל ה-imports בקוביות
- ✅ אכיפת בידוד מוחלט בין קוביות
- ✅ שימוש ב-`cubes/shared` רק ללוגיקה משותפת

---

### **2. כל קוביה היא אי עצמאי**

**חוק ברזל:**
- 🚨 **כל קוביה היא אי עצמאי המתקשר רק דרך ה-Shared**
- 🚨 **אין תלות ישירה בין קוביות**

**מבנה מותר:**
```
cubes/
  ├── identity/          # קוביית Identity (אי עצמאי)
  │   ├── components/
  │   ├── hooks/
  │   └── services/
  ├── financial/        # קוביית Financial (אי עצמאי)
  │   ├── components/
  │   ├── hooks/
  │   └── services/
  └── shared/            # לוגיקה משותפת (מותר לייבא)
      ├── components/
      ├── hooks/
      └── utils/
```

**פעולות נדרשות:**
- ✅ כל קוביה עצמאית לחלוטין
- ✅ תקשורת רק דרך `cubes/shared`
- ✅ אין תלות ישירה בין קוביות

---

### **3. שימוש ב-Shared רק ללוגיקה משותפת**

**חוק ברזל:**
- 🚨 **שימוש ב-`cubes/shared` רק ללוגיקה משותפת**
- 🚨 **אין לוגיקה ספציפית ב-Shared**

**דוגמאות:**
```javascript
// ✅ נכון - לוגיקה משותפת
import { transformers } from '../../shared/utils/transformers.js';
import { PhoenixTable } from '../../shared/components/tables/PhoenixTable.jsx';

// ❌ שגוי - לוגיקה ספציפית
import { identitySpecificLogic } from '../../shared/utils/identity.js'; // אסור!
```

**פעולות נדרשות:**
- ✅ שימוש ב-Shared רק ללוגיקה משותפת
- ✅ אין לוגיקה ספציפית ב-Shared
- ✅ כל לוגיקה ספציפית בקוביה שלה

---

## 📋 פעולות נדרשות מיידיות

### **1. בדיקת Imports**
- [ ] בדיקת כל ה-imports בקוביית Identity
- [ ] בדיקת כל ה-imports בקוביות אחרות
- [ ] אכיפת בידוד מוחלט בין קוביות

### **2. בדיקת תלויות**
- [ ] כל קוביה עצמאית לחלוטין
- [ ] תקשורת רק דרך `cubes/shared`
- [ ] אין תלות ישירה בין קוביות

### **3. בדיקת Shared**
- [ ] שימוש ב-Shared רק ללוגיקה משותפת
- [ ] אין לוגיקה ספציפית ב-Shared
- [ ] כל לוגיקה ספציפית בקוביה שלה

---

## 🔗 קבצים רלוונטיים

- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BATCH_1_FINAL_SUMMARY.md` - הודעה מלאה מהאדריכלית
- `documentation/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md` - ספר החוקים המאסטר (עודכן)
- `_COMMUNICATION/team_10/TEAM_10_TO_ARCHITECT_IDENTITY_CUBE_FILE_MAPPING.md` - מיפוי קבצי Identity (כולל Dependency Analysis)

---

**Team 10 (The Gateway)**  
**Date:** 2026-02-02  
**Status:** 🛡️ **MANDATORY - FOUNDATION SEAL**

**log_entry | [Team 10] | BATCH_1_CLOSURE | TO_TEAM_30 | GREEN | 2026-02-02**

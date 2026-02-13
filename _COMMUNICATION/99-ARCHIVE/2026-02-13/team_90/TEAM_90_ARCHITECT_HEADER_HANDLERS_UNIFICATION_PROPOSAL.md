# 🕵️ הצעה לאדריכלית: איחוד HeaderHandlers (Phase 2)

**מאת:** Team 90 (The Spy)  
**אל:** האדריכלית הראשית (Gemini)  
**תאריך:** 2026-02-06  
**סטטוס:** הצעה לאישור  

---

## 📌 תקציר מנהלים
במצב הנוכחי קיימים קבצי `HeaderHandlers.js` נפרדים לכל עמוד פיננסי. ההבדלים ביניהם הם ברובם **ניואנסים של IDs/Keys** ולא לוגיקה ייחודית. הדבר יוצר כפילויות, drift, ופתח לבאגים (דוגמה: שגיאת scope ב‑D21 שנמצאה ע״י Team 90).  
**המלצה:** לאחד לוגיקת HeaderHandlers למודל **Core + Config** — בסיס לוגי אחיד עם קונפיגורציה ייעודית לכל עמוד.

---

## 🧩 הבעיה (מגובה ממצאים)
1. **כפילויות קוד:** אותן פונקציות (init, applyFilters, updateDisplay) חוזרות בעמודים שונים.  
2. **באגים חוזרים:** דוגמת D21 — שימוש במשתנה מחוץ לסקופ גרם ל‑ReferenceError.  
3. **אכיפת Governance קשה:** כל עמוד הוא גרסה משלו, קשה לאכוף מדיניות Hybrid Scripts אחידה.  
4. **תחזוקה עתידית יקרה:** שינוי קטן דורש עדכון בכל עמוד בנפרד.

---

## ✅ מטרה
- ליצור **SSOT ללוגיקת HeaderHandlers**.  
- לצמצם כפילויות, לצמצם drift, ולצמצם סיכון לבאגים.

---

## 🧠 אפשרויות (Options)

### **Option A — Core + Config (מומלץ)**
**מהות:**
- קובץ ליבה אחד (HeaderHandlersBase) עם לוגיקה כללית.  
- לכל עמוד קובץ קונפיגורציה קטן בלבד.  

**יתרונות:**
- SSOT ללוגיקה, מינימום כפילות.  
- שינוי אחד משפיע על כל העמודים.  
- קל ל‑QA ו‑Governance.  

**חסרונות:**
- דורש ריפקטור ראשוני בכל עמוד פיננסי.  

---

### **Option B — Manual Standardization**
**מהות:**
- להשאיר קבצים נפרדים, אך להטמיע תבנית אחידה ידנית.  

**יתרונות:**
- פחות שינוי מיידי.  

**חסרונות:**
- עדיין כפילות וקושי בתחזוקה; drift יחזור מהר.  

---

### **Option C — Hybrid (Base + Legacy)**
**מהות:**
- עמודים חדשים משתמשים ב‑Core + Config.  
- קיימים נשארים עד סבב Refactor עתידי.  

**יתרונות:**
- פחות הפרעה מיידית.  

**חסרונות:**
- תקופת מעבר עם שתי שיטות במקביל → סיכון Drift.  

---

## ✅ המלצה (Team 90)
**Option A — Core + Config**  
נראית הדרך היחידה למנוע Drift ארוך טווח ולהבטיח Governance נקי בפייז 2 ומעלה.

---

## 📐 מפרט מוצע (Core + Config)

### 1) קובץ ליבה (SSOT)
**מיקום מוצע:**
```
ui/src/components/core/phoenixHeaderHandlersBase.js
```
**אחריות:**
- init handlers
- bridge events
- applyFilters/updateDisplay
- validation/logging hygiene

### 2) קובץ קונפיגורציה לכל עמוד
לדוגמה (D18):
```js
export const headerConfig = {
  filters: {
    broker: { toggleId: 'brokerFilterToggle', textId: 'selectedBrokerText' },
    commissionType: { toggleId: 'commissionTypeFilterToggle', textId: 'selectedCommissionTypeText' },
    search: { inputId: 'searchFilterInput', debounceMs: 300 }
  },
  bridgeEvents: ['broker','commissionType'],
  onApply: (filters) => window.updateBrokersFeesFilters?.(filters)
};
```

### 3) טעינה
```html
<script type="module">
  import { initHeaderHandlers } from '/src/components/core/phoenixHeaderHandlersBase.js';
  import { headerConfig } from './brokersFeesHeaderConfig.js';
  initHeaderHandlers(headerConfig);
</script>
```

---

## 🧭 גבולות אחריות (Governance)
- **Team 10**: מגדיר SSOT + מעדכן תיעוד.  
- **Team 30**: מבצע ריפקטור בפועל.  
- **Team 50**: QA לאחר המעבר.  

---

## ✅ קריטריוני הצלחה
1. קיים קובץ Core יחיד ללוגיקת HeaderHandlers.  
2. כל עמוד משתמש בקונפיגורציה בלבד.  
3. אין כפילויות handler logic בקבצים ייעודיים.  
4. בדיקות QA עוברות.  

---

## 📌 בקשה לאישור
נא לאשר אחת מהאופציות (A/B/C).  
במידה ואושר **Option A**, Team 90 ממליץ להגדיר זאת כ‑SSOT מחייב לכל עמוד חדש.

---

**log_entry | [Team 90] | HEADER_HANDLERS_UNIFICATION | PROPOSAL_SUBMITTED | YELLOW | 2026-02-06**

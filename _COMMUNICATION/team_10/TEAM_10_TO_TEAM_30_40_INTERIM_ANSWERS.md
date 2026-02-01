# 📡 הודעה: Team 10 → Team 30 & Team 40 | תשובות זמניות לפני החלטות אדריכליות

**From:** Team 10 (The Gateway)  
**To:** Team 30 (Frontend), Team 40 (UI Assets)  
**Date:** 2026-02-01  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** INTERIM_ANSWERS | Status: 🟡 **INTERIM - AWAITING ARCHITECTURAL DECISIONS**  
**Priority:** 🟢 **INFORMATIONAL**

---

## 📋 Executive Summary

תודה על הביקורת המפורטת. זוהו שאלות קריטיות שדורשות החלטה אדריכלית. להלן תשובות זמניות לשאלות שניתן לענות עליהן לפני קבלת החלטות אדריכליות.

**⚠️ חשוב:** תשובות אלו הן זמניות. החלטות סופיות יינתנו לאחר התייעצות עם האדריכלית הראשית.

---

## ✅ תשובות זמניות

### **1. סטטוס שלב 2 - אישור תיקונים** ✅ **זמני**

**תשובה זמנית:**
- ✅ **מאשר זמנית את כל התיקונים של Team 40:**
  - איחוד CSS Variables ל-`phoenix-base.css`
  - הסרת `design-tokens.css`
  - הסרת `auth.css`
  - הסרת inline CSS מ-`global_page_template.jsx`
  - **חובה:** בדיקה של Components המשתמשים ב-`auth.css` לפני הסרה

**פעולה מיידית:**
- Team 40 יכול להמשיך למשימה 2.3 (תיקון היררכיה)
- **חובה:** לבדוק אילו Components משתמשים ב-`auth.css` לפני הסרה

**⚠️ הערה:** החלטה סופית תינתן לאחר התייעצות עם האדריכלית.

---

### **2. שלב 2.4 - עדכון CSS_CLASSES_INDEX.md** ✅ **זמני**

**תשובה זמנית:**
- ✅ **שלב 2.4 נשאר בתוכנית:**
  - עדכון `CSS_CLASSES_INDEX.md` לאחר השלמת שלב 2.3
  - תיעוד כל ה-CSS Classes
  - הוספת ITCSS layer information
  - הסרת duplicates מהאינדקס

**פעולה:**
- שלב 2.4 יבוצע לאחר השלמת שלב 2.3

---

### **3. סקריפטים חיצוניים - האם חל על עבודה קיימת?** ✅ **זמני**

**תשובה זמנית:**
- ✅ **כלל הברזל חל על כל העבודה (קיימת וחדשה):**
  - בדיקה של קבצי HTML קיימים (`ui/src/views/financial/*.html`)
  - העברת סקריפטים לקבצים חיצוניים (באחריות Team 30)
  - Team 40 לא צריך לעשות משהו בנושא זה

**פעולה:**
- Team 30 יבדוק את קבצי ה-HTML הקיימים בשלב 3.5
- אם יש סקריפטים - יועברו לקבצים חיצוניים

---

### **4. תיאום בין Team 30 ו-Team 40** ✅ **זמני**

**תשובה זמנית:**
- ✅ **תהליך תיאום:**
  - Team 30 מוביל את התהליך בשלב 2.5
  - Team 40 משתתף בולידציה ויזואלית
  - תיאום דרך Team 10 (Gateway)
  - אין מפגש מתוכנן - תקשורת דרך מסמכים

**פעולה:**
- Team 30 יוצר מסמך זיהוי Components משותפים
- Team 40 בודק ויזואלית ומאשר
- Team 10 מתאם בין הצוותים

---

## ⏸️ שאלות שדורשות החלטה אדריכלית

### **1. מבנה תיקיות `ui/src/cubes/`** ⏸️ **ממתין להחלטה אדריכלית**

**שאלות:**
- מה קורה עם המבנה הקיים (`components/`, `contexts/`, `hooks/`, `services/`, `utils/`)?
- מה ההבדל בין "Core/Global" ל-"Cube-specific"?
- מה ההבדל בין "Shared" (ב-`cubes/shared/`) ל-"Global" (ב-`src/`)?
- איפה ממוקמים Components קיימים (`PhoenixTable`, `PhoenixFilterContext`, `transformers`)?

**סטטוס:** 🟡 **ממתין להחלטה אדריכלית**

**מסמך התייעצות:** `TEAM_10_TO_ARCHITECT_ARCHITECTURAL_DECISIONS_REQUEST.md`

---

### **2. Design Tokens JSON vs CSS Variables** ⏸️ **ממתין להחלטה אדריכלית**

**שאלות:**
- האם קבצי ה-JSON (`design-tokens/*.json`) נשארים או מוסרים?
- האם Design Tokens נשארים רק ב-CSS Variables או גם ב-JSON?
- האם יש צורך ב-Design Tokens JSON עבור Cube Components Library?

**המלצת Team 10 (זמנית):**
- CSS Variables - מקור אמת יחיד ב-`phoenix-base.css`
- Design Tokens JSON - להסיר (היו שלב ביניים)

**סטטוס:** 🟡 **ממתין להחלטה אדריכלית**

---

### **3. תזמון שלב 2.5** ⏸️ **ממתין להחלטה אדריכלית**

**שאלות:**
- האם שלב 2.5 יכול להתחיל לפני השלמת שלב 2?
- Team 30 יכול להתחיל לזהות Components משותפים כבר עכשיו?

**המלצת Team 10 (זמנית):**
- ✅ לאפשר ל-Team 30 להתחיל בשלב 2.5 במקביל לשלב 2:
  - זיהוי Components: יכול להתחיל מיד
  - יצירת מבנה תיקיות: יכול להתחיל מיד (לפי החלטה אדריכלית)
  - יצירת Components: צריך לחכות לסיום שלב 2 (CSS)

**סטטוס:** 🟡 **ממתין להחלטה אדריכלית**

---

### **4. קריטריונים לסיווג Components** ⏸️ **ממתין להחלטה אדריכלית**

**שאלות:**
- מה ההבדל בין "Core Components" ל-"Shared Components"?
- מה ההבדל בין "Shared Components" ל-"Cube-specific Components"?

**המלצת Team 10 (זמנית):**
- **Core Components:** Components בסיסיים של המערכת שלא קשורים לקוביה ספציפית
- **Shared Components:** Components משותפים לכל הקוביות
- **Cube-specific Components:** Components ספציפיים לקוביה אחת

**סטטוס:** 🟡 **ממתין להחלטה אדריכלית**

---

## 📋 פעולות מיידיות (לפני החלטות אדריכליות)

### **Team 40:**
- ✅ **להמשיך למשימה 2.3** (תיקון היררכיה) - אישור זמני ניתן
- ✅ **לבדוק Components המשתמשים ב-`auth.css`** לפני הסרה
- ⏸️ **להמתין להחלטה** על Design Tokens JSON

### **Team 30:**
- ✅ **להתחיל לזהות Components משותפים** (שלב 2.5) - יכול להתחיל מיד
- ⏸️ **להמתין להחלטה** על מבנה תיקיות לפני יצירת מבנה
- ⏸️ **להמתין להחלטה** על מיקום Components קיימים

---

## 🔗 קישורים רלוונטיים

### **מסמך התייעצות:**
- `_COMMUNICATION/team_10/TEAM_10_TO_ARCHITECT_ARCHITECTURAL_DECISIONS_REQUEST.md` - בקשה להחלטות אדריכליות

### **מסמכי ביקורת:**
- `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_LEGO_REFACTOR_PLAN_V2_REVIEW.md`
- `_COMMUNICATION/team_40/TEAM_40_REVIEW_LEGO_REFACTOR_PLAN_V2.md`

---

## ⚠️ הערות חשובות

1. **תשובות זמניות:** תשובות אלו הן זמניות ומבוססות על המלצות Team 10
2. **החלטות סופיות:** יינתנו לאחר התייעצות עם האדריכלית הראשית
3. **פעולות מיידיות:** ניתן לבצע פעולות שאינן תלויות בהחלטות אדריכליות
4. **המתנה:** יש להמתין להחלטות אדריכליות לפני פעולות שתלויות בהן

---

**Team 10 (The Gateway)**  
**Date:** 2026-02-01  
**Status:** 🟡 **INTERIM ANSWERS - AWAITING ARCHITECTURAL DECISIONS**

**log_entry | Team 10 | INTERIM_ANSWERS | TO_TEAM_30_40 | 2026-02-01**

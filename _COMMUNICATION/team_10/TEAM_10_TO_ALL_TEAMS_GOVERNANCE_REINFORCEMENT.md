# 📡 הודעה: חיזוק משילות ותזכורת נהלים

**From:** Team 10 (The Gateway) - "מערכת העצבים"  
**To:** כל הצוותים (Team 20, 30, 40, 50, 60)  
**Date:** 2026-02-02  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** GOVERNANCE_REINFORCEMENT | Status: 🛡️ **MANDATORY**  
**Priority:** 🔴 **CRITICAL - GOVERNANCE UPDATE**

---

## 📢 הודעה כללית

צוותים יקרים,

לאור איבוד סדר העבודה בצוותים, אנו נדרשים לרענן את הנהלים והגדרות התפקידים שלנו. **חובה על כל צוות להכיר ולפעול לפי הנהלים המפורטים להלן.**

---

## 🛡️ תפקיד צוות 10 (The Gateway) - "מערכת העצבים"

### **תפקידים:**
- אכיפת ה-SSOT בספר האדריכל
- ניהול מטריצת עמודים מרכזית (`TT2_OFFICIAL_PAGE_TRACKER.md`)
- אי-שינוי קבצי מפתח ללא תיאום מול האדריכל
- אי-קידום עמודים לסטטוס APPROVED ללא בדיקת G-Bridge
- ניהול Tracking מקומי ב-`team_10_staging/`
- אכיפת Transformation Layer ו-`snake_case` בכל ה-Payloads

### **חוק ברזל:**
- 🚨 **חל איסור על הפצת הנחיות שלא עברו דרך תיקיית ה-90**
- כל הנחיה אדריכלית חייבת לעבור דרך `_COMMUNICATION/90_Architects_comunication/`

### **נוהלי עבודה:**
1. כל הודעה לצוותים חייבת להיות מסודרת ומפורטת
2. כל הודעה חייבת לכלול:
   - הקשר מלא
   - משימות ברורות לכל צוות
   - נקודות עצירה לאינטגרציה ו-QA
   - קישורים למסמכים רלוונטיים
3. עדכון תעוד מרכזי לאחר כל שלב
4. עדכון אינדקסים לאחר כל שינוי

---

## 📋 תפקידי הצוותים האחרים

### **צוות 20 (Backend) - "מקור האמת"**
- **תפקיד:** חובת הקפדה על חוזי נתונים (`snake_case`), קודי שגיאה יציבים
- **חוק ברזל:** כל ה-Payloads חייבים להיות ב-`snake_case`, קודי שגיאה יציבים

### **צוות 30 (Frontend) - "בוני הלגו"**
- **תפקיד:** אכיפת בידוד מוחלט בין קוביות (Cubes)
- **חוק ברזל:** אין imports בין קוביות (חוץ מ-`cubes/shared`), כל קוביה היא אי עצמאי

### **צוות 40 (UI/Design) - "שומרי ה-DNA"**
- **תפקיד:** ניהול בלעדי של ה-CSS Variables, שמירה על ה-DNA העיצובי
- **חוק ברזל:** אין להכניס עיצוב מקומי בתוך רכיבים, כל העיצוב דרך CSS Variables ב-`phoenix-base.css`

### **צוות 50 (QA/Fidelity) - "שופטי האיכות"**
- **תפקיד:** פסילת כל קובץ שאינו עובר את ה-Audit Trail תחת debug
- **חוק ברזל:** עליכם לפסול כל קובץ שאינו עובר את ה-Audit Trail תחת debug

### **צוות 60 (DevOps/Infra) - "ספקי הכלים"**
- **תפקיד:** בניית ה-Scaffolding לקוביות חדשות, ניהול ה-Vite Proxy
- **חוק ברזל:** אתם מאפשרים את המהירות - כל הכלים חייבים להיות מוכנים מראש

---

## 📁 ניהול קבצים ותעוד

### **תיקיות תקשורת:**
- כל צוות חייב לייצר קבצים חדשים רק בתיקיה שלו (`_COMMUNICATION/team_{ID}/`)
- כל צוות יכול לייצר תת-תיקיות בתיקיה שלו לפי הצורך
- בשורש התקשורת (`_COMMUNICATION/`) אמורים להיות רק קבצים לטווח ארוך או שדורשים שילוב בתעוד הכללי

### **תיקיות תעוד:**
- **אסור לצוותים לייצר קבצים ישירות לתקיית התעוד ללא אישור מפורש**
- כל הקבצים תעוד, דוחות ותקשורת של כל צוות יש ליצור רק בתקיית הצוות
- בסיום כל שלב יבוצע מיזוג של המידע החשוב לתעוד הכללי

### **תיקיות אדריכל:**
- `_COMMUNICATION/90_Architects_comunication/` - לשימוש האדריכלית בלבד
- `documentation/90_Architects_documentation/` - לשימוש האדריכלית בלבד
- **אסור לך או לאף צוות אחר במערכת המקומית לכתוב או לערוך קבצים בתקיות אלו**

---

## 🔗 קישורים רלוונטיים

### **מסמכי משילות:**
- **PHOENIX_MASTER_BIBLE:** `documentation/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md`
- **CURSOR_INTERNAL_PLAYBOOK:** `documentation/06-GOVERNANCE_&_COMPLIANCE/standards/CURSOR_INTERNAL_PLAYBOOK.md`

### **הודעות ספציפיות לכל צוות:**
- **Team 20:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_GOVERNANCE_REINFORCEMENT.md`
- **Team 30:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_GOVERNANCE_REINFORCEMENT.md`
- **Team 40:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_40_GOVERNANCE_REINFORCEMENT.md`
- **Team 50:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_GOVERNANCE_REINFORCEMENT.md`
- **Team 60:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_60_GOVERNANCE_REINFORCEMENT.md`

---

## 📋 צעדים הבאים

1. **כל צוות:** קריאה והכרה של התפקידים והחוקים שלכם
2. **כל צוות:** וידוא עמידה בנהלי ניהול קבצים ותעוד
3. **Team 10:** המשך אכיפת הנהלים והמשילות

---

```
log_entry | [Team 10] | GOVERNANCE_REINFORCEMENT | SENT_TO_ALL_TEAMS | 2026-02-02
log_entry | [Team 10] | FILE_MANAGEMENT_RULES | REINFORCED | 2026-02-02
log_entry | [Team 10] | TEAM_ROLES | REINFORCED | 2026-02-02
```

---

**Team 10 (The Gateway) - "מערכת העצבים"**  
**Date:** 2026-02-02  
**Status:** 🛡️ **GOVERNANCE REINFORCED**

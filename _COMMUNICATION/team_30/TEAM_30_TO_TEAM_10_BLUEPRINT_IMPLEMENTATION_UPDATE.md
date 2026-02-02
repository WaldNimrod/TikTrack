# Team 30 → Team 10: עדכון על יישום בלופרינטים

**תאריך:** 2026-01-31  
**מאת:** Team 30 (Frontend)  
**אל:** Team 10 (Gateway)  
**נושא:** זיהוי בעיות קריטיות בתהליך יישום הבלופרינטים

---

## 🚨 בעיה קריטית שזוהתה

**שימוש בבלופרינטים ישנים ולא מעודכנים**

כל התהליך הנוכחי מבוסס על בלופרינטים שלא תואמים את התבנית הבסיסית הסופית. זה יצר:
- חוסר אחידות במבנה העמודים
- שימוש בתבניות שגויות
- בלבול בין בלופרינטים שונים

---

## ✅ הבלופרינט הנכון

**התבנית הבסיסית המדויקת:**
- `_COMMUNICATION/team_01/team_01_staging/D15_PAGE_TEMPLATE_STAGE_1.html`

**זהו הבלופרינט היחיד שצריך לשמש כבסיס לכל העמודים.**

---

## 📋 פעולות שננקטו

### 1. **זיהוי הבלופרינט הנכון**
- זוהה שהבלופרינט הנכון הוא `D15_PAGE_TEMPLATE_STAGE_1.html` ולא בלופרינטים אחרים
- זוהה שכל התקייה של הבלופרינט יש ליישם לפי הקובץ אינדקס: `_COMMUNICATION/team_01/team_01_staging/index.html`

### 2. **הודעה לצוות 40**
- נשלחה הודעה מפורטת ל-Team 40 עם:
  - בקשה להוספת פוטר קבוע לעמודי Auth
  - בקשה להבטחת אחידות במחלקות ובמבנה
  - בקשה ליישום תבנית נקייה לעמוד ניהול משתמש
  - הדגשה על הצורך לעקוב אחרי `index.html` לכל הבלופרינטים

### 3. **תכנון תהליך עבודה**
- **שלב 1:** יישום תבנית נקייה ומדויקת (ללא תוכן מורכב)
- **שלב 2:** לאחר אישור - שכפול התבנית ויציקת התוכן

---

## ⚠️ נקודות קריטיות שצריך להדגיש

### 1. **אלמנט ראש הדף (Unified Header)** ⚠️ **קריטי ומורכב מאוד**

**מבנה מלא (לפי התיעוד):**
- **Row 1 (header-top):** 60px
  - Navigation (header-nav) - תפריט ניווט ראשי
  - Logo Section (logo-section) - לוגו + סלוגן
  - User Zone (user-zone) - מידע משתמש + avatar
- **Row 2 (header-filters):** 60px
  - **5 פילטרים:** Status, Investment Type, Trading Account, Date Range, Search
  - **Filter Actions:** Reset, Clear
  - **User Profile Link:** קישור לפרופיל משתמש
  - **Filter Toggle Button:** כפתור הצגה/הסתרה

**אינטגרציה עם React:**
- **PhoenixFilterContext:** כל הפילטרים מחוברים ל-Context API
- **TtGlobalFilter:** רכיב React שמחבר את הפילטרים ל-Context
- **החלטה אדריכלית:** הטבלאות מאזינות לשינויים ב-`TtGlobalFilter` דרך `PhoenixFilterContext`

**מפרט טכני:**
- **גובה כולל:** `120px` (קבוע, LOD 400) - **אסור לשנות**
- **Z-Index:** `950`
- **Position:** `sticky top: 0`
- **מקור תיעוד:** `documentation/04-DESIGN_UX_UI/UNIFIED_HEADER_SPECIFICATION.md`

**חייב להיות זהה בדיוק לבלופרינט:** `D15_PAGE_TEMPLATE_STAGE_1.html`

### 2. **יישום לפי Index**
**קריטי:** כל התקייה של הבלופרינט יש ליישם לפי הקובץ אינדקס שלה:
- `_COMMUNICATION/team_01/team_01_staging/index.html`

יש לעקוב אחרי הקישורים הרלוונטיים ולבצע יישום מדויק לפי התבנית הבסיסית.

### 3. **עמודי Auth**
- שלושת עמודי הכניסה (כניסה, הרשמה, שיחזור סיסמה) נראים טוב
- חסר: פוטר קבוע ואחידות במחלקות ובמבנה העמוד הבסיסי

---

## 🎯 מידע קריטי על Unified Header והפילטר הראשי

### **החלטה אדריכלית מתועדת:**
- **מקור:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DIRECTIVE_TABLES_REACT.md`
- **החלטה:** הפילטר הראשי הוא חלק אינטגרלי מה-Unified Header
- **אינטגרציה:** הטבלאות מאזינות לשינויים ב-`TtGlobalFilter` המרכזי דרך `PhoenixFilterContext`

### **תיעוד מלא של צוות 10:**
- **מקור:** `_COMMUNICATION/team_10/TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md`
- **החלטה:** React Context (`PhoenixFilterContext`) - לשמור על פונקציונליות קיימת
- **מבנה:** Unified Header כולל 2 שורות:
  - **Row 1 (header-top):** Navigation, Logo, User Zone (60px)
  - **Row 2 (header-filters):** Global Filter עם 5 פילטרים + חיפוש + User Profile Link (60px)

### **מפרט טכני מלא:**
- **מקור:** `documentation/04-DESIGN_UX_UI/UNIFIED_HEADER_SPECIFICATION.md`
- **גובה כולל:** `120px` (קבוע, LOD 400)
- **Z-Index:** `950`
- **מבנה:** `#unified-header` > `.header-content` > `.header-top` + `.header-filters`

### **רכיבי React קיימים:**
- **PhoenixFilterContext:** `ui/src/cubes/shared/contexts/PhoenixFilterContext.jsx`
- **TtGlobalFilter:** `ui/src/layout/global_page_template.jsx` (צריך לעדכן לפי הבלופרינט)
- **TtHeader:** `ui/src/layout/global_page_template.jsx` (צריך לעדכן לפי הבלופרינט)

---

## 📝 המלצות ל-Team 10

### 1. **עדכון תהליך העבודה**
- יש להדגיש שכל יישום בלופרינט חייב להתחיל מ-`D15_PAGE_TEMPLATE_STAGE_1.html`
- יש להדגיש שכל הבלופרינטים יש ליישם לפי `index.html`
- יש להדגיש את החשיבות של Unified Header והפילטר הראשי כחלק אינטגרלי מהתבנית

### 2. **תיעוד**
- יש לעדכן את התיעוד עם הבלופרינט הנכון
- יש להסיר או לסמן כ"ישן" בלופרינטים שלא מעודכנים
- יש לעדכן את התיעוד עם המידע המלא על Unified Header והפילטר הראשי

### 3. **תקשורת עם צוותים אחרים**
- יש להעביר את ההודעה גם לצוותים אחרים שעובדים על יישום בלופרינטים
- יש להדגיש את החשיבות של שימוש בבלופרינט הנכון
- יש להדגיש את החשיבות של Unified Header והפילטר הראשי

---

## ✅ צעדים הבאים

1. **Team 40** - יבצע את המשימות שהוגדרו בהודעה
2. **Team 30** - יחכה לאישור התבנית לפני שכפול ויציקת תוכן
3. **Team 10** - יעדכן את התהליך והתיעוד

---

## 📞 תקשורת

לשאלות או הבהרות, אנא פנו ל-Team 30.

---

**חתימה:**  
Team 30 (Frontend)  
2026-01-31

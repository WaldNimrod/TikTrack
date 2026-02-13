# Team 30 → Team 40: בקשה ליישום בלופרינטים

**תאריך:** 2026-01-31  
**מאת:** Team 30 (Frontend)  
**אל:** Team 40 (UI Assets & Design)  
**נושא:** יישום בלופרינטים לפי התבנית הבסיסית המדויקת

---

## 🎯 רקע

זוהינו בעיות קריטיות בתהליך היישום הנוכחי:
- **שימוש בבלופרינטים ישנים ולא מעודכנים** - כל התהליך מבוסס על בלופרינטים שלא תואמים את התבנית הבסיסית הסופית
- **חוסר אחידות** - עמודי Auth נראים טוב אבל חסר להם פוטר קבוע ואחידות במחלקות
- **צורך בתבנית מדויקת** - יש צורך ליישם את התבנית הבסיסית הנכונה לפני שכפול ויציקת תוכן

---

## 📋 המשימות הנדרשות

### 1. **עמודי Auth - הוספת פוטר ואחידות**

שלושת עמודי הכניסה (כניסה, הרשמה, שיחזור סיסמה) נראים טוב, אבל יש צורך:

#### א. הוספת פוטר קבוע
- כל עמודי Auth צריכים לכלול את הפוטר הקבוע של המערכת
- הפוטר צריך להיות זהה לזה שבתבנית הבסיסית (`D15_PAGE_TEMPLATE_STAGE_1.html`)
- הפוטר נטען דינמית דרך `footer-loader.js` (כמו בתבנית הבסיסית)

#### ב. הבטחת אחידות במחלקות ובמבנה העמוד הבסיסי
- וודא שכל עמודי Auth משתמשים באותן מחלקות CSS כמו התבנית הבסיסית
- וודא שהמבנה הבסיסי (`page-wrapper` > `page-container` > `main` > `tt-container` > `tt-section`) זהה

**קבצים רלוונטיים:**
- `ui/src/cubes/identity/components/auth/LoginForm.jsx`
- `ui/src/cubes/identity/components/auth/RegisterForm.jsx`
- `ui/src/cubes/identity/components/auth/PasswordResetFlow.jsx`

**בלופרינט התייחסות:**
- `_COMMUNICATION/team_01/team_01_staging/D15_LOGIN.html`
- `_COMMUNICATION/team_01/team_01_staging/D15_REGISTER.html`
- `_COMMUNICATION/team_01/team_01_staging/D15_RESET_PWD.html`

---

### 2. **עמוד ניהול משתמש - יישום תבנית נקייה**

#### א. יישום התבנית הבסיסית המדויקת
- יש ליישם את התבנית הבסיסית הנכונה לפי הבלופרינט: `_COMMUNICATION/team_01/team_01_staging/D15_PAGE_TEMPLATE_STAGE_1.html`
- **לא** להשתמש בבלופרינטים ישנים או לא מעודכנים
- התבנית חייבת לכלול:
  - **Unified Header** (LOD 400) - אלמנט ראש הדף הקריטי והמורכב
  - **Page wrapper/container structure** (`page-wrapper` > `page-container` > `main` > `tt-container`)
  - **Section structure** עם `index-section__header` ו-`index-section__body`
  - **Section toggle functionality** (JavaScript)
  - **Modular Footer** (נטען דינמית)

#### ב. מבנה Sections לעמוד ניהול משתמש
לפי הבלופרינט, עמוד ניהול משתמש צריך 3 sections:
- **Section 0:** מידע (User Info)
- **Section 1:** עריכת פרטי משתמש (User Settings)
- **Section 2:** מפתחות API (API Keys)

**קובץ רלוונטי:**
- `ui/src/cubes/identity/components/profile/ProfileView.jsx`

**בלופרינט התייחסות:**
- `_COMMUNICATION/team_01/team_01_staging/D15_PAGE_TEMPLATE_STAGE_1.html` (תבנית בסיסית)
- `_COMMUNICATION/team_01/team_01_staging/D15_PROFILE.html` (תוכן עמוד ניהול משתמש)

---

### 3. **יישום כל הבלופרינטים לפי Index**

**קריטי:** כל התקייה של הבלופרינט יש ליישם לפי הקובץ אינדקס שלה:
- `_COMMUNICATION/team_01/team_01_staging/index.html`

יש לעקוב אחרי הקישורים הרלוונטיים ולבצע יישום מדויק לפי התבנית הבסיסית.

---

## ⚠️ נקודות קריטיות

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

### 2. **תהליך עבודה**
1. **קודם כל:** יישום תבנית נקייה ומדויקת (ללא תוכן מורכב)
2. **לאחר אישור:** שכפול התבנית ויציקת התוכן של עמוד ניהול משתמש

### 3. **CSS Architecture**
- `phoenix-base.css` - CSS Variables, Reset, Base Typography
- `phoenix-components.css` - LEGO System (tt-container, tt-section, etc.)
- `phoenix-header.css` - Unified Header styles
- **אין צורך** בקבצי CSS ספציפיים לעמוד - כל הסגנונות בשכבות הבסיס

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

## 📝 שאלות לבדיקה

1. **פוטר:** האם יש קובץ `footer-loader.js` ו-`footer.html` זמינים? איפה הם ממוקמים?
2. **אייקונים:** האם כל האייקונים הנדרשים (`images/icons/entities/*.svg`) זמינים?
3. **Unified Header:** האם יש רכיב React ל-Unified Header המלא (2 שורות) או שצריך לבנות אותו לפי הבלופרינט?
4. **JavaScript:** איפה ממוקמים קבצי ה-JavaScript לפונקציונליות Header (Filter Toggle, Dropdowns)?

---

## ✅ קריטריונים להצלחה

- [ ] כל עמודי Auth כוללים פוטר קבוע זהה
- [ ] כל עמודי Auth אחידים במחלקות ובמבנה הבסיסי
- [ ] עמוד ניהול משתמש מיושם לפי התבנית הבסיסית המדויקת
- [ ] Unified Header מיושם במדויק (LOD 400)
- [ ] כל ה-JavaScript פונקציונליות עובדת (Section Toggle, Filter Toggle, etc.)
- [ ] התבנית נקייה ומוכנה לשכפול ויציקת תוכן

---

## 📞 תקשורת

לשאלות או הבהרות, אנא פנו ל-Team 30 או ל-Team 10 (Gateway).

---

**חתימה:**  
Team 30 (Frontend)  
2026-01-31

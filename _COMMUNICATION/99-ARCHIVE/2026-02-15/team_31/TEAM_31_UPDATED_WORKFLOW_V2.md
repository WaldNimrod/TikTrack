# 📋 נוהל עבודה מעודכן V2 - צוות 31 (Blueprint)

**תאריך עדכון:** 2026-02-01  
**גרסה:** v3.0.0  
**בסיס:** תוכנית LEGO Refactor V2 + הבהרות מ-Team 10

---

## 🎯 מטרת הנוהל

נוהל זה מגדיר את תהליך העבודה של צוות 31 (Blueprint) ליצירת Blueprint HTML/JSX לעמודים חדשים, בהתאם לארכיטקטורת LEGO מודולרית וקוביות מודולריות.

---

## ⚠️ תפקיד מעודכן

### **תפקיד צוות 31:**
- ✅ **ייצור בלופרינטים לעמודים הבאים** לפי המטריצה
- ✅ **התאמת הבלופרינטים למבנה הקוביות המודולריות**
- ✅ **שמירה על עקביות** עם הבלופרינטים הקיימים

### **מה לא באחריותנו:**
- ❌ **לא מעורבים בבנייה מחדש** של עמודים קיימים
- ❌ **לא מעורבים בעדכון** `global_page_template.jsx` או תיקון CSS
- ❌ **רק ספקי Blueprints** - הבלופרינטים עוברים ל-Team 30 + Team 40 למימוש

---

## 📋 שלבי העבודה

### **שלב 0: המתנה והכנה** ⏸️ **PENDING**

#### 0.1 המתנה להשלמת שלב 2.5
- [ ] להמתין להשלמת שלב 2.5 (Cube Components Library) על ידי Team 30 + Team 40
- [ ] לעקוב אחרי התקדמות התוכנית
- [ ] לא להתחיל עבודה על בלופרינטים חדשים עד להשלמת שלב 2.5

#### 0.2 קבלת דוגמאות ותבניות
**לאחר השלמת שלב 2.5:**
- [ ] לקבל דוגמאות/תבניות מ-Team 30 + Team 40
- [ ] לקבל את המסמך `CUBE_COMPONENTS_REFERENCE.md`
- [ ] להבין את המבנה המדויק של הקוביות המודולריות (`ui/src/cubes/{cube_name}/pages/`)
- [ ] להבין איך LEGO System מתחבר ל-Modular Cubes
- [ ] להבין את Shared Components שזוהו בשלב 2.5

#### 0.3 תיאום לפני יצירת בלופרינט
**לפני כל בלופרינט חדש:**
- [ ] תיאום עם Team 10
- [ ] זיהוי הקוביה המודולרית (Identity, Financial, API Management, Security)
- [ ] בדיקת Shared Components שזוהו בשלב 2.5

---

### **שלב 1: יצירת Blueprint HTML/JSX**

#### 1.1 מבנה בסיסי
- [ ] ליצור קובץ HTML/JSX: `[PAGE_NAME].html` או `[PAGE_NAME].jsx`
- [ ] לוודא מבנה LEGO System נכון:
  - `tt-container` - קונטיינר חיצוני
  - `tt-section` - סקשן תוכן
  - `tt-section-row` - שורת תוכן
- [ ] להתאים למבנה הקוביות המודולריות (`ui/src/cubes/{cube_name}/pages/`)

#### 1.2 Fluid Design (רספונסיביות אוטומטית) 📱 **MANDATORY**
- [ ] שימוש ב-`clamp()` לגדלי פונטים
- [ ] שימוש ב-`clamp()` לריווחים
- [ ] שימוש ב-Grid עם `auto-fit` / `auto-fill`
- [ ] **אין Media Queries** עבור גדלי פונטים וריווחים

**דוגמאות:**
```css
/* Typography - Fluid */
font-size: clamp(0.875rem, 2vw + 0.5rem, 1.125rem);

/* Spacing - Fluid */
padding: clamp(0.5rem, 1vw + 0.25rem, 1rem);
margin: clamp(1rem, 2vw + 0.5rem, 2rem);

/* Grid - Fluid */
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
```

#### 1.3 Design Tokens SSOT 🔴 **MANDATORY**
- [ ] שימוש ב-CSS Variables מ-`phoenix-base.css` בלבד
- [ ] אין הגדרת CSS Variables חדשות
- [ ] אין שימוש בקבצי JSON או `design-tokens.css`

#### 1.4 שימוש ב-Shared Components
- [ ] שימוש ב-Shared Components שזוהו בשלב 2.5
- [ ] מבנה HTML/JSX שמאפשר שימוש ב-Components משותפים
- [ ] תיעוד Components משותפים פוטנציאליים

#### 1.5 ⚠️ כלל ברזל - אין JavaScript 🔴 **MANDATORY**
- [ ] **אין `<script>` tags** בתוך HTML/JSX
- [ ] **אין inline event handlers** (`onclick`, `onchange`, וכו')
- [ ] **כל הסקריפטים בקבצים חיצוניים** (באחריות Team 30)
- [ ] **הערות על פונקציונליות נדרשת** (למשל: `<!-- TODO: Add form validation -->`)
- [ ] **JS Selectors עם `js-` prefix** (למשל: `js-login-trigger`)

#### 1.4 מה צריך להיות בבלופרינט
✅ **חובה:**
- HTML/JSX נקי עם מבנה LEGO System
- CSS Classes מ-BEM (לא inline styles)
- JS Selectors עם `js-` prefix
- הערות על פונקציונליות נדרשת

❌ **אסור:**
- אין JavaScript בתוך הבלופרינט
- אין inline event handlers
- אין State Management hints (באחריות Team 30)
- אין CSS מותאם אישית

---

### **שלב 2: CSS Architecture**

#### 2.1 שמירה על CSS Architecture
- [ ] סדר טעינת CSS נכון (10 שלבים)
- [ ] שימוש ב-CSS Variables מ-`phoenix-base.css` בלבד (SSOT)
- [ ] עמידה ב-ITCSS hierarchy
- [ ] שימוש ב-CSS Classes מותאמים אישית (לא Tailwind)

#### 2.2 Fluid Design (רספונסיביות אוטומטית) 📱 **MANDATORY**
- [ ] כל גדלי הפונטים עם `clamp()`
- [ ] כל הריווחים עם `clamp()`
- [ ] Layout עם Grid `auto-fit` / `auto-fill`
- [ ] אין Media Queries עבור גדלי פונטים וריווחים

#### 2.3 LEGO System
- [ ] שימוש ב-`tt-container` > `tt-section` > `tt-section-row`
- [ ] אין CSS מותאם אישית - רק Logical Properties
- [ ] שמירה על עקביות עם הבלופרינטים הקיימים

---

### **שלב 3: תעוד**

#### 3.1 תעוד מבנה
- [ ] לתעד את מבנה העמוד (קונטיינרים, סקשנים)
- [ ] לתעד את הטבלאות (אם יש) - עמודות, מיון, pagination
- [ ] לתעד את הפילטרים (אם יש) - גלובליים או פנימיים

#### 3.2 תעוד פונקציונליות
- [ ] הערות על פונקציונליות נדרשת
- [ ] ציון שכל הסקריפטים יהיו בקבצים חיצוניים
- [ ] תיעוד Components משותפים פוטנציאליים

#### 3.3 מדריך מפורט (אם נדרש)
- [ ] ליצור מדריך מפורט (`[PAGE]_TABLES_GUIDE.md`) אם יש טבלאות
- [ ] לכלול מבנה, עמודות, דוגמאות נתונים, סטנדרטים עיצוביים

---

### **שלב 4: בדיקה ואימות**

#### 4.1 בדיקת מבנה
- [ ] לבדוק את מבנה LEGO System
- [ ] לבדוק את היררכיית CSS
- [ ] לבדוק RTL ו-DNA Sync
- [ ] לבדוק התאמה למבנה הקוביות המודולריות

#### 4.2 בדיקת Fluid Design 📱 **MANDATORY**
- [ ] אין Media Queries עבור גדלי פונטים וריווחים
- [ ] כל גדלי הפונטים עם `clamp()`
- [ ] כל הריווחים עם `clamp()`
- [ ] Layout עם Grid `auto-fit` / `auto-fill`

#### 4.3 בדיקת Design Tokens SSOT 🔴 **MANDATORY**
- [ ] שימוש ב-CSS Variables מ-`phoenix-base.css` בלבד
- [ ] אין הגדרת CSS Variables חדשות
- [ ] אין שימוש בקבצי JSON או `design-tokens.css`

#### 4.4 בדיקת כלל ברזל 🔴 **MANDATORY**
- [ ] **אין JavaScript בתוך הבלופרינט**
- [ ] **אין inline event handlers**
- [ ] **כל הסקריפטים בקבצים חיצוניים** (הערות בלבד)
- [ ] **JS Selectors עם `js-` prefix**

#### 4.3 בדיקת תעוד
- [ ] לבדוק שהתעוד מלא ומפורט
- [ ] לבדוק שהמדריכים נכונים (אם יש)

---

### **שלב 5: הגשה**

#### 5.1 הכנת הודעה לצוות 10
- [ ] ליצור הודעה מסודרת עם כל הקישורים
- [ ] לכלול סיכום של מה הושלם
- [ ] לכלול רשימת קבצים ותעוד
- [ ] לכלול הערות חשובות

#### 5.2 הגשה
- [ ] לשלוח את ההודעה לצוות 10
- [ ] לוודא שכל הקבצים במקום הנכון
- [ ] לוודא שכל התעוד מעודכן

---

## ✅ Checklist לבלופרינטים חדשים

### **לפני יצירת בלופרינט חדש:**
- [ ] תיאום עם Team 10 (לאחר השלמת שלב 2.5)
- [ ] קבלת דוגמאות/תבניות מ-Team 30 + Team 40
- [ ] קבלת המסמך `CUBE_COMPONENTS_REFERENCE.md`
- [ ] זיהוי הקוביה המודולרית (Identity, Financial, API Management, Security)

### **בזמן יצירת הבלופרינט:**
- [ ] שימוש ב-Shared Components שזוהו בשלב 2.5
- [ ] שמירה על מבנה LEGO System (`tt-container` > `tt-section` > `tt-section-row`)
- [ ] **Fluid Design:** שימוש ב-`clamp()` לגדלי פונטים וריווחים
- [ ] **Fluid Design:** Layout עם Grid `auto-fit` / `auto-fill`
- [ ] **אין Media Queries** עבור גדלי פונטים וריווחים
- [ ] שימוש ב-CSS Variables מ-`phoenix-base.css` בלבד (SSOT)
- [ ] שמירה על CSS Architecture
- [ ] **⚠️ כלל ברזל:** אין JavaScript בתוך הבלופרינט
- [ ] שימוש ב-JS Selectors עם `js-` prefix
- [ ] הערות על פונקציונליות נדרשת
- [ ] תיעוד Components משותפים פוטנציאליים

### **לפני הגשה:**
- [ ] בדיקת מבנה LEGO System
- [ ] בדיקת Fluid Design (אין Media Queries, שימוש ב-`clamp()`)
- [ ] בדיקת Design Tokens SSOT (רק `phoenix-base.css`)
- [ ] בדיקת כלל ברזל (אין JavaScript)
- [ ] בדיקת תעוד
- [ ] הודעה מסודרת לצוות 10

---

## 🎯 בלופרינטים נדרשים לפי המטריצה

### **API Management Cube (D24):**
- D24_API_VIEW

### **Security Settings Cube (D25):**
- D25_SEC_VIEW

### **Financial Cube (D18, D21):**
- D18_BRKRS_VIEW
- D21_CASH_VIEW

### **עמודים נוספים:**
- עמודים נוספים לפי `TT2_OFFICIAL_PAGE_TRACKER.md`

---

## ⚠️ כללי עבודה קריטיים

### 1. **כלל ברזל - אין JavaScript בתוך הבלופרינט** 🔴 **MANDATORY**
- ⚠️ **חובה:** אין `<script>` tags בתוך HTML/JSX
- ⚠️ **חובה:** אין inline event handlers
- ⚠️ **חובה:** כל הסקריפטים בקבצים חיצוניים (הערות בלבד)
- ⚠️ **חובה:** JS Selectors עם `js-` prefix
- ⚠️ **השלכה:** כל חריגה תגרור פסילת G-Bridge מיידית 🛡️

### 2. **Fluid Design Mandate** 📱 **MANDATORY**
- ⚠️ **חובה:** שימוש ב-`clamp()` לגדלי פונטים וריווחים
- ⚠️ **חובה:** Layout עם Grid `auto-fit` / `auto-fill`
- ⚠️ **איסור:** אין Media Queries עבור גדלי פונטים וריווחים
- ⚠️ **השלכה:** כל חריגה תגרור פסילת G-Bridge מיידית 🛡️

### 3. **Design Tokens SSOT** 🔴 **MANDATORY**
- ⚠️ **חובה:** שימוש ב-CSS Variables מ-`phoenix-base.css` בלבד
- ⚠️ **איסור:** אין הגדרת CSS Variables חדשות
- ⚠️ **איסור:** אין שימוש בקבצי JSON או `design-tokens.css`

### 4. **התאמה למבנה הקוביות המודולריות**
- ⚠️ **חובה:** הבלופרינט צריך להיות מוכן לשילוב במבנה `ui/src/cubes/{cube_name}/pages/`
- ⚠️ **חובה:** שימוש ב-Shared Components שזוהו
- ⚠️ **חובה:** מבנה HTML/JSX שמאפשר שימוש ב-Components משותפים

### 5. **תיאום לפני יצירת בלופרינט**
- ⚠️ **חובה:** תיאום עם Team 10 לפני יצירת כל בלופרינט חדש
- ⚠️ **חובה:** קבלת דוגמאות/תבניות מ-Team 30 + Team 40
- ⚠️ **חובה:** קבלת המסמך `CUBE_COMPONENTS_REFERENCE.md`

### 6. **מתי להתחיל**
- ⚠️ **חובה:** רק לאחר סיום התהליך על ידי צוותי הפיתוח
- ⚠️ **חובה:** רק לאחר קבלת תעוד "as made"
- ⚠️ **חובה:** רק לאחר תיאום עם Team 10

---

## 🔗 קישורים רלוונטיים

### **מסמכי הבהרות:**
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_31_LEGO_REFACTOR_V2.md` - הודעה מפורטת
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_31_ANSWERS_AND_CLARIFICATIONS.md` - תשובות מפורטות

### **תוכנית מלאה:**
- `_COMMUNICATION/team_10/TEAM_10_TO_ALL_TEAMS_LEGO_REFACTOR_PLAN_V2.md` - תוכנית מעודכנת מלאה

### **מטריצה:**
- `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md` - מטריצת עמודים (קוביות מוגדרות)

### **החלטות אדריכלית:**
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DECISION_LEGO_CUBES_FINAL.md` - החלטות סופיות 🛡️
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_RESPONSIVE_CHARTER.md` - אמנת רספונסיביות

### **תיעוד:**
- `documentation/01-ARCHITECTURE/TT2_SECTION_ARCHITECTURE_SPEC.md` - LEGO System Spec
- `documentation/04-DESIGN_UX_UI/SYSTEM_WIDE_DESIGN_PATTERNS.md` - Design Patterns
- `documentation/04-DESIGN_UX_UI/TT2_RESPONSIVE_FLUID_DESIGN.md` - Fluid Design Documentation
- `_COMMUNICATION/team_31/team_31_staging/CSS_ARCHITECTURE_HIERARCHY.md` - CSS Architecture

### **בלופרינטים קיימים (להתייחסות):**
- `_COMMUNICATION/team_31/team_31_staging/` - כל הבלופרינטים הקיימים

---

## 📝 הערות חשובות

- **אתם לא מעורבים בתהליך הבנייה מחדש** של העמודים הקיימים
- **תפקידכם:** לייצר בלופרינטים חדשים בצורה אופטימלית לשילוב במבנה החדש
- **מתי להתחיל:** לאחר סיום התהליך וקבלת תעוד "as made"
- **תיאום:** חובה לפני יצירת כל בלופרינט חדש
- **בלופרינטים קיימים:** לא באחריותכם - עברו ל-Team 30 + Team 40

### **החלטות אדריכלית סופיות:**
- 🛡️ **כל חריגה תגרור פסילת G-Bridge מיידית**
- 📱 **Fluid Design Mandate:** שימוש ב-`clamp()`, אין Media Queries
- 🔴 **Clean Slate Rule:** אין JavaScript בתוך הבלופרינט (רטרואקטיבי)
- 🔴 **Design Tokens SSOT:** רק `phoenix-base.css` הוא מקור האמת

**מסמך עדכון מפורט:** `_COMMUNICATION/team_31/TEAM_31_ARCHITECT_DECISIONS_UPDATE.md`

---

---

## ⏸️ עדכון סטטוס: בחופשה עד לסיום התהליך

**תאריך עדכון:** 2026-02-01  
**סטטוס:** ⏸️ **בחופשה עד לסיום התהליך**

**הבהרה חשובה:**
- ⏸️ **צוות 31 בחופשה** עד לסיום התהליך על ידי צוותי הפיתוח (Team 30, Team 40)
- ⏸️ **לא מתחילים עבודה** על בלופרינטים חדשים עד לסיום התהליך
- ✅ **ממתינים** להשלמת התוכנית ולקבלת תעוד "as made" מהצוותים

**תוכנית סופית:**
- `_COMMUNICATION/team_10/TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md` - תוכנית מלאה (814 שורות)
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DECISION_LEGO_CUBES.md` - החלטת האדריכלית

**לאחר סיום התהליך:**
- קבלת תעוד "as made" מהצוותים
- יצירת בלופרינטים חדשים בהתאם למבנה הסופי
- יישום בהתאם לתוכנית ולמבנה החדש

---

**צוות 31 (Blueprint)**  
**תאריך עדכון:** 2026-02-01  
**גרסה:** v3.0.0  
**סטטוס:** ⏸️ **בחופשה עד לסיום התהליך**

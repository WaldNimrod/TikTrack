# 📋 עדכון: החלטות אדריכלית סופיות - צוות 31 (Blueprint)

**תאריך:** 2026-02-02  
**סטטוס:** 🛡️ **MANDATORY - FINAL GOVERNANCE LOCK**  
**גרסה:** v1.0.0

---

## 📢 סיכום החלטות אדריכלית סופיות

האדריכלית הראשית הוציאה החלטות סופיות ומחייבות. **כל חריגה תגרור פסילת G-Bridge מיידית.**

**מקורות:**
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DECISION_LEGO_CUBES_FINAL.md` - החלטות סופיות
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_RESPONSIVE_CHARTER.md` - אמנת רספונסיביות
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_FINAL_GOVERNANCE_LOCK.md` - הודעה מפורטת

---

## 🛡️ עקרונות מחייבים לבלופרינטים עתידיים

### **1. מבנה התיקיות והיררכיית Cubes** 🔴 **MANDATORY**

**מבנה סופי:**
```
ui/src/
├── components/
│   └── core/              # רכיבים "טיפשים" (Button, Input, Spinner) - ללא לוגיקה עסקית
├── cubes/
│   ├── shared/           # רכיבים המשמשים יותר מקוביה אחת (PhoenixTable, Contexts, Transformers)
│   │   ├── components/
│   │   ├── contexts/
│   │   └── scripts/
│   └── {cube-name}/      # יחידות לוגיות עצמאיות (Identity, Financial)
│       ├── components/
│       ├── contexts/
│       ├── hooks/
│       ├── services/
│       ├── scripts/      # סקריפטים ספציפיים לקוביה
│       └── pages/        # עמודים של הקוביה
```

**השלכות לבלופרינטים:**
- הבלופרינט צריך להיות מוכן לשילוב ב-`cubes/{cube-name}/pages/`
- שימוש ב-Components מ-`cubes/shared/` (אם רלוונטי)
- מבנה HTML/JSX שמאפשר שימוש ב-Components משותפים

---

### **2. רספונסיביות אוטומטית (Fluid Design Mandate)** 📱 **MANDATORY**

**איסור מוחלט:**
- ❌ אין Media Queries עבור גדלי פונטים וריווחים
- ❌ אין קוד נפרד לרספונסיביות

**חובה:**
- ✅ שימוש בלעדי ב-`clamp(min, preferred, max)` לגדלי פונטים
- ✅ שימוש ב-`clamp()` לריווחים (Margins, Paddings)
- ✅ שימוש ב-`min()` ו-`max()` כנדרש
- ✅ Layout: Grid עם `auto-fit` / `auto-fill`

**דוגמאות:**
```css
/* ✅ נכון - Fluid Typography */
font-size: clamp(0.875rem, 2vw + 0.5rem, 1.125rem);

/* ✅ נכון - Fluid Spacing */
padding: clamp(0.5rem, 1vw + 0.25rem, 1rem);

/* ✅ נכון - Fluid Grid */
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
```

**השלכות לבלופרינטים:**
- הבלופרינט צריך לכלול CSS עם Fluid Design
- אין Media Queries בבלופרינט
- שימוש ב-`clamp()`, `min()`, `max()` בלבד

---

### **3. אסטרטגיית Design Tokens** 🔴 **MANDATORY**

**SSOT (Single Source of Truth):**
- ✅ קובץ `phoenix-base.css` הוא מקור האמת היחיד לצבעים וריווחים
- ✅ כל ה-CSS Variables מוגדרים ב-`phoenix-base.css` בלבד

**Cleanup:**
- ❌ קבצי JSON מבוטלים ברמת הקוד
- ❌ יש להסיר את `design-tokens.css` מהפרויקט (אם עדיין קיים)

**השלכות לבלופרינטים:**
- שימוש ב-CSS Variables מ-`phoenix-base.css` בלבד
- אין הגדרת CSS Variables חדשות בבלופרינט
- אין שימוש בקבצי JSON או `design-tokens.css`

---

### **4. משמעת סקריפטים (The Clean Slate Rule)** 🔴 **MANDATORY - RETROACTIVE**

**איסור מוחלט:**
- ❌ אין תגי `<script>` בתוך קבצי HTML או JSX
- ❌ אין event handlers inline (`onclick`, `onchange`, `onsubmit`, וכו')

**חובה:**
- ✅ כל הסקריפטים בקבצים חיצוניים (`.js` או `.jsx`)
- ✅ ארגון קבצי סקריפטים לפי קוביות מודולריות
- ✅ שימוש ב-`js-` prefixed classes במקום inline handlers
- ✅ הוספת `<script src="...">` בסוף `<body>` (לפני G-Bridge banner)

**מבנה קבצי סקריפטים:**
```
cubes/{cube-name}/scripts/
├── {page-name}-init.js      # לוגיקת עמוד ספציפי
├── {page-name}-handlers.js  # Event handlers
└── {cube-name}-common.js    # פונקציות משותפות לקוביה
```

**השלכות לבלופרינטים:**
- **אין JavaScript בתוך הבלופרינט** - כלל ברזל
- הערות על פונקציונליות נדרשת (למשל: `<!-- TODO: Add form validation -->`)
- JS Selectors עם `js-` prefix (למשל: `js-login-trigger`)
- ציון שכל הסקריפטים יהיו בקבצים חיצוניים

---

## 📋 עדכון נוהל עבודה לבלופרינטים עתידיים

### **שלב 1: הכנה (לאחר סיום התהליך)**

#### 1.1 קבלת תעוד "as made"
- [ ] קבלת תעוד המבנה הסופי מ-Team 30 + Team 40
- [ ] קבלת המסמך `CUBE_COMPONENTS_REFERENCE.md`
- [ ] קבלת דוגמאות ותבניות של Cube Components
- [ ] הבנת המבנה הסופי של הקוביות המודולריות

#### 1.2 הבנת החלטות אדריכלית
- [ ] קריאת `ARCHITECT_DECISION_LEGO_CUBES_FINAL.md`
- [ ] קריאת `ARCHITECT_RESPONSIVE_CHARTER.md`
- [ ] הבנת Fluid Design Mandate
- [ ] הבנת Clean Slate Rule

---

### **שלב 2: יצירת Blueprint HTML/JSX**

#### 2.1 מבנה בסיסי
- [ ] ליצור קובץ HTML/JSX: `[PAGE_NAME].html` או `[PAGE_NAME].jsx`
- [ ] לוודא מבנה LEGO System נכון:
  - `tt-container` - קונטיינר חיצוני
  - `tt-section` - סקשן תוכן
  - `tt-section-row` - שורת תוכן
- [ ] להתאים למבנה הקוביות המודולריות (`ui/src/cubes/{cube_name}/pages/`)

#### 2.2 Fluid Design (רספונסיביות אוטומטית)
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

#### 2.3 Design Tokens
- [ ] שימוש ב-CSS Variables מ-`phoenix-base.css` בלבד
- [ ] אין הגדרת CSS Variables חדשות
- [ ] אין שימוש בקבצי JSON או `design-tokens.css`

#### 2.4 ⚠️ כלל ברזל - אין JavaScript
- [ ] **אין `<script>` tags** בתוך HTML/JSX
- [ ] **אין inline event handlers** (`onclick`, `onchange`, `onsubmit`, וכו')
- [ ] **JS Selectors עם `js-` prefix** (למשל: `js-login-trigger`)
- [ ] **הערות על פונקציונליות נדרשת** (למשל: `<!-- TODO: Add form validation -->`)
- [ ] **ציון שכל הסקריפטים יהיו בקבצים חיצוניים**

**דוגמה נכונה:**
```html
<!-- ✅ נכון -->
<form class="js-login-form">
  <input type="email" class="js-email-input" />
  <button class="js-login-submit">התחבר</button>
  <!-- Note: JavaScript will be in cubes/identity/scripts/auth-login.js -->
</form>
```

#### 2.5 שימוש ב-Shared Components
- [ ] שימוש ב-Shared Components שזוהו בשלב 2.5
- [ ] מבנה HTML/JSX שמאפשר שימוש ב-Components משותפים
- [ ] תיעוד Components משותפים פוטנציאליים

---

### **שלב 3: CSS Architecture**

#### 3.1 שמירה על CSS Architecture
- [ ] סדר טעינת CSS נכון (10 שלבים)
- [ ] שימוש ב-CSS Variables מ-`phoenix-base.css` בלבד
- [ ] עמידה ב-ITCSS hierarchy
- [ ] שימוש ב-CSS Classes מותאמים אישית (לא Tailwind)

#### 3.2 Fluid Design
- [ ] כל גדלי הפונטים עם `clamp()`
- [ ] כל הריווחים עם `clamp()`
- [ ] Layout עם Grid `auto-fit` / `auto-fill`
- [ ] אין Media Queries

---

### **שלב 4: תעוד**

#### 4.1 תעוד מבנה
- [ ] לתעד את מבנה העמוד (קונטיינרים, סקשנים)
- [ ] לתעד את הטבלאות (אם יש) - עמודות, מיון, pagination
- [ ] לתעד את הפילטרים (אם יש) - גלובליים או פנימיים

#### 4.2 תעוד Fluid Design
- [ ] לתעד את השימוש ב-`clamp()` לגדלי פונטים
- [ ] לתעד את השימוש ב-`clamp()` לריווחים
- [ ] לתעד את השימוש ב-Grid `auto-fit` / `auto-fill`

#### 4.3 תעוד פונקציונליות
- [ ] הערות על פונקציונליות נדרשת
- [ ] ציון שכל הסקריפטים יהיו בקבצים חיצוניים
- [ ] תיעוד Components משותפים פוטנציאליים

---

### **שלב 5: בדיקה ואימות**

#### 5.1 בדיקת מבנה
- [ ] לבדוק את מבנה LEGO System
- [ ] לבדוק את היררכיית CSS
- [ ] לבדוק RTL ו-DNA Sync
- [ ] לבדוק התאמה למבנה הקוביות המודולריות

#### 5.2 בדיקת Fluid Design
- [ ] אין Media Queries עבור גדלי פונטים וריווחים
- [ ] כל גדלי הפונטים עם `clamp()`
- [ ] כל הריווחים עם `clamp()`
- [ ] Layout עם Grid `auto-fit` / `auto-fill`

#### 5.3 בדיקת כלל ברזל
- [ ] **אין JavaScript בתוך הבלופרינט**
- [ ] **אין inline event handlers**
- [ ] **כל הסקריפטים בקבצים חיצוניים** (הערות בלבד)
- [ ] **JS Selectors עם `js-` prefix**

---

## ✅ Checklist לבלופרינטים חדשים (מעודכן)

### **לפני יצירת בלופרינט חדש:**
- [ ] תיאום עם Team 10 (לאחר סיום התהליך)
- [ ] קבלת תעוד "as made" מ-Team 30 + Team 40
- [ ] קבלת המסמך `CUBE_COMPONENTS_REFERENCE.md`
- [ ] קריאת החלטות אדריכלית סופיות
- [ ] זיהוי הקוביה המודולרית (Identity, Financial, API Management, Security)

### **בזמן יצירת הבלופרינט:**
- [ ] שימוש ב-Shared Components שזוהו
- [ ] שמירה על מבנה LEGO System (`tt-container` > `tt-section` > `tt-section-row`)
- [ ] **Fluid Design:** שימוש ב-`clamp()` לגדלי פונטים וריווחים
- [ ] **Fluid Design:** Layout עם Grid `auto-fit` / `auto-fill`
- [ ] **אין Media Queries** עבור גדלי פונטים וריווחים
- [ ] שימוש ב-CSS Variables מ-`phoenix-base.css` בלבד
- [ ] שמירה על CSS Architecture
- [ ] **⚠️ כלל ברזל:** אין JavaScript בתוך הבלופרינט
- [ ] שימוש ב-JS Selectors עם `js-` prefix
- [ ] הערות על פונקציונליות נדרשת
- [ ] תיעוד Components משותפים פוטנציאליים

### **לפני הגשה:**
- [ ] בדיקת מבנה LEGO System
- [ ] בדיקת Fluid Design (אין Media Queries, שימוש ב-`clamp()`)
- [ ] בדיקת כלל ברזל (אין JavaScript)
- [ ] בדיקת תעוד
- [ ] הודעה מסודרת לצוות 10

---

## ⚠️ כללי עבודה קריטיים (מעודכנים)

### 1. **כלל ברזל - אין JavaScript בתוך הבלופרינט**
- ⚠️ **חובה:** אין `<script>` tags בתוך HTML/JSX
- ⚠️ **חובה:** אין inline event handlers
- ⚠️ **חובה:** כל הסקריפטים בקבצים חיצוניים (הערות בלבד)
- ⚠️ **חובה:** JS Selectors עם `js-` prefix

### 2. **Fluid Design Mandate**
- ⚠️ **חובה:** שימוש ב-`clamp()` לגדלי פונטים וריווחים
- ⚠️ **חובה:** Layout עם Grid `auto-fit` / `auto-fill`
- ⚠️ **איסור:** אין Media Queries עבור גדלי פונטים וריווחים

### 3. **Design Tokens SSOT**
- ⚠️ **חובה:** שימוש ב-CSS Variables מ-`phoenix-base.css` בלבד
- ⚠️ **איסור:** אין הגדרת CSS Variables חדשות
- ⚠️ **איסור:** אין שימוש בקבצי JSON או `design-tokens.css`

### 4. **התאמה למבנה הקוביות המודולריות**
- ⚠️ **חובה:** הבלופרינט צריך להיות מוכן לשילוב במבנה `ui/src/cubes/{cube_name}/pages/`
- ⚠️ **חובה:** שימוש ב-Shared Components שזוהו
- ⚠️ **חובה:** מבנה HTML/JSX שמאפשר שימוש ב-Components משותפים

---

## 🔗 קישורים רלוונטיים

### **החלטות אדריכלית:**
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DECISION_LEGO_CUBES_FINAL.md` - החלטות סופיות 🛡️
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_RESPONSIVE_CHARTER.md` - אמנת רספונסיביות

### **הודעות צוות 10:**
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_FINAL_GOVERNANCE_LOCK.md` - Final Governance Lock
- `_COMMUNICATION/team_10/TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md` - תוכנית עבודה

### **תיעוד:**
- `documentation/04-DESIGN_UX_UI/TT2_RESPONSIVE_FLUID_DESIGN.md` - Fluid Design Documentation
- `documentation/10-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md` - JS Standards Protocol
- `documentation/10-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md` - CSS Standards Protocol

---

## 📝 הערות חשובות

- **כל חריגה מהכללים תגרור פסילת G-Bridge מיידית** 🛡️
- **Fluid Design הוא חובה** - אין Media Queries עבור גדלי פונטים וריווחים
- **כלל ברזל הוא רטרואקטיבי** - חל גם על בלופרינטים קיימים (אבל הם לא באחריותנו)
- **Design Tokens SSOT** - רק `phoenix-base.css` הוא מקור האמת

---

**צוות 31 (Blueprint)**  
**תאריך:** 2026-02-02  
**סטטוס:** 🛡️ **MANDATORY - FINAL GOVERNANCE LOCK**

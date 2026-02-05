# 📋 נוהל עבודה מעודכן - Team 31 (Blueprint) v2.1

**תאריך עדכון:** 2026-01-31  
**גרסה:** v2.1  
**סטטוס:** ✅ **ACTIVE WORKFLOW**  
**מטרה:** נוהל עבודה מקיף ומעודכן ליצירת בלופרינטים אופטימליים

**⚠️ כללי שמות קבצים חשובים:**
- ✅ כל קבצי הבלופרינט מסתיימים ב-`_BLUEPRINT.html`
- ❌ **אין שימוש בתחיליות D15, D16, D21 וכו'** - זה מפריע ויוצר בעיות
- ✅ **שמות קבצים חייבים להיות מדויקים לפי רשימת העמודים הרשמית בתיעוד** (snake_case)
- ✅ שמות קבצים ברורים ומתארים את התוכן
- ✅ במטריצה ובאינדקס יש להוסיף לשם המדויק גם מספור פנימי לצורך ניהול מסודר
- ✅ האינדקס (`sandbox_v2/index.html`) והמטריצה (קובץ זה) חייבים להיות מתואמים תמיד
- ✅ עדכון סטטוס רק בהוראה מפורשת
- ⚠️ **המטריצה והאינדקס יוסדרו לפי סדר עבודה וחבילות שיוגדרו בהמשך**

---

## 📊 מטריצת עמודים - רשימה רשמית

**⚠️ כללי מטריצה:**
- **#** - מספור פנימי לניהול (יוסדר לפי סדר עבודה וחבילות)
- **שם מדויק** - שם רשמי לפי הרשימה הרשמית בתיעוד (snake_case)
- **קובץ Blueprint** - שם קובץ מדויק עם סיומת `_BLUEPRINT.html`
- **סטטוס** - עדכון רק בהוראה מפורשת

### **מניפסט 40 העמודים המלא**

| # | שם מדויק | קובץ Blueprint | סטטוס | הערות |
|---|----------|----------------|-------|-------|
| **1-15: Core Analytics (Dash, Trades, Plans)** |
| - | - | - | ⏳ ממתין להגדרת חבילות | - |
| **16-27: Data Hub (Accounts, Import, Playbooks)** |
| - | trading_accounts | trading_accounts_BLUEPRINT.html | ✅ הושלם | תבנית טבלאות |
| - | brokers_fees | brokers_fees_BLUEPRINT.html | ✅ הושלם | - |
| - | cash_flows | cash_flows_BLUEPRINT.html | ✅ הושלם | - |
| - | api_keys | api_keys_BLUEPRINT.html | ⏳ לא התחיל | - |
| - | securities | securities_BLUEPRINT.html | ⏳ לא התחיל | - |
| **28-36: Engineering Console (Pulse, Tasker, Designer)** |
| - | - | - | ⏳ ממתין להגדרת חבילות | - |
| **37-40: Future Prototypes** |
| - | - | - | ⏳ ממתין להגדרת חבילות | - |

### **עמודים נוספים (לא במניפסט הרשמי)**

| # | שם מדויק | קבצי Blueprint | סטטוס | הערות |
|---|----------|----------------|-------|-------|
| - | home / index | index_BLUEPRINT.html | ✅ הושלם | דף הבית/דשבורד |
| - | login | login_BLUEPRINT.html | ✅ הושלם | עמוד התחברות |
| - | register | register_BLUEPRINT.html | ✅ הושלם | עמוד הרשמה |
| - | reset_password | reset_password_BLUEPRINT.html | ✅ הושלם | איפוס סיסמה |
| - | user_profile | user_profile_BLUEPRINT.html<br>user_profile_view_BLUEPRINT.html | ✅ הושלם | **שתי גרסאות:** user_profile_BLUEPRINT.html, user_profile_view_BLUEPRINT.html |

### **סיכום סטטוס**

- ✅ **הושלמו:** 8 עמודים (index, login, register, reset_password, user_profile - 2 גרסאות, trading_accounts, brokers_fees, cash_flows)
- ⏳ **לא התחילו:** 32 עמודים
- 📊 **סה"כ:** 40 עמודים רשמיים + 5 עמודי Auth/Profile (user_profile עם 2 גרסאות)

**⚠️ הערה:** המטריצה תוסדר לפי סדר עבודה וחבילות שיוגדרו בהמשך. המספור הפנימי (#) יוסדר בהתאם.

---

## 🎯 תהליך עבודה מעודכן - לקחים וכללים

### **שלב 1: מחקר וניתוח מקיף** 🔍

#### **1.1 סקירת Legacy Files**
- **מיקום:** `_COMMUNICATION/team_01/team_01_staging/`
- **פעולות:**
  - ✅ קריאה וניתוח של קובץ HTML Legacy לעמוד המטרה
  - ✅ לימוד כל קבצי DOM בתיקיית Legacy
  - ✅ תיעוד מבנה, קומפוננטות וסגנונות
  - ✅ זיהוי כל מחלקות CSS, IDs ו-data attributes
  - ✅ זיהוי תלויות JavaScript או אינטראקציות

**לקח חשוב:** סקירה מקיפה של Legacy חוסכת זמן רב בהמשך.

#### **1.2 בדיקת DB Schema**
- **מיקום:** `documentation/05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml`
- **פעולות:**
  - ✅ בדיקת טבלאות DB רלוונטיות
  - ✅ בדיקת שדות וטיפוסים
  - ✅ בדיקת קשרים בין טבלאות
  - ✅ השוואה לשדות ב-Legacy

**לקח חשוב:** השוואה ל-DB Schema מבטיחה שכל השדות קיימים בבלופרינט.

#### **1.3 בדיקת OpenAPI Spec**
- **מיקום:** `documentation/05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml`
- **פעולות:**
  - ✅ בדיקת endpoints רלוונטיים
  - ✅ בדיקת request/response schemas
  - ✅ בדיקת שמות שדות (plural names only)
  - ✅ בדיקת ULID strings ל-IDs

**לקח חשוב:** OpenAPI Spec הוא מקור האמת לשמות שדות וטיפוסים.

#### **1.4 ניתוח מבנה טבלאות קיים**
- **תבנית בסיסית:** trading_accounts_BLUEPRINT.html
- **פעולות:**
  - ✅ השוואה למבנה טבלאות ב-trading_accounts
  - ✅ זיהוי דפוסים משותפים
  - ✅ זיהוי קומפוננטות LEGO System
  - ✅ זיהוי מחלקות CSS סטנדרטיות

**לקח חשוב:** שימוש ב-trading_accounts כתבנית חוסך זמן ומבטיח עקביות.

---

### **שלב 2: תכנון ותיעוד** 📐

#### **2.1 יצירת סקריפט ניתוח**
- **דוגמה:** `analyze_d18_d21_specs.py`
- **תכולה:**
  - ✅ ניתוח מבנה טבלאות
  - ✅ השוואת שדות Legacy vs DB Schema
  - ✅ יצירת דוח JSON
  - ✅ יצירת דוח Markdown

**לקח חשוב:** סקריפט ניתוח אוטומטי חוסך זמן ומבטיח דיוק.

#### **2.2 יצירת טבלת השוואת שדות**
- **דוגמה:** `TEAM_31_FIELDS_COMPARISON_TABLE.md`
- **תכולה:**
  - ✅ טבלה משווה: Legacy | DB Schema | Blueprint
  - ✅ זיהוי שדות חסרים
  - ✅ זיהוי שדות מיותרים
  - ✅ תיעוד החלטות

**לקח חשוב:** טבלת השוואה מקלה על בדיקה ואימות.

---

### **שלב 3: יצירת בלופרינט** 🏗️

#### **3.1 בסיס: trading_accounts_BLUEPRINT.html**
- **חשיבות קריטית:** trading_accounts הוא התבנית לכל הטבלאות במערכת
- **פעולות:**
  - ✅ העתקת מבנה בסיסי מ-trading_accounts_BLUEPRINT.html
  - ✅ שמירה על מבנה HTML זהה
  - ✅ שמירה על מחלקות CSS זהה
  - ✅ התאמה לשדות ספציפיים
- **⚠️ כללי שמות קבצים:**
  - ✅ שם קובץ מסתיים ב-`_BLUEPRINT.html`
  - ❌ אין שימוש בתחיליות D15, D16, D21 וכו'
  - ✅ **שם קובץ חייב להיות מדויק לפי רשימת העמודים הרשמית בתיעוד** (snake_case)
  - ✅ שמות קבצים ברורים ומתארים את התוכן

**לקח חשוב:** שימוש ב-trading_accounts כתבנית מבטיח עקביות ומונע טעויות.

#### **3.2 מבנה HTML**
```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <!-- CSS Loading Order (CRITICAL - DO NOT CHANGE) -->
  <!-- 1. Pico CSS FIRST -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">
  
  <!-- 2. Phoenix Base Styles (Global defaults & DNA variables) - LIVE FILE -->
  <link rel="stylesheet" href="../../../../ui/src/styles/phoenix-base.css">
  
  <!-- 3. LEGO Components (Reusable components) - LIVE FILE -->
  <link rel="stylesheet" href="../../../../ui/src/styles/phoenix-components.css">
  
  <!-- 4. Header Component (Unified Header Styles) - LIVE FILE -->
  <link rel="stylesheet" href="../../../../ui/src/styles/phoenix-header.css">
  
  <!-- 5. Page-Specific Styles (Dashboard-specific styles) - LIVE FILE -->
  <link rel="stylesheet" href="../../../../ui/src/styles/D15_DASHBOARD_STYLES.css">
  
  <!-- Page-Specific Styles (MINIMAL - only fixes) -->
  <style>
    /* PAGE-SPECIFIC FIXES ONLY */
    /* All standard styles are in phoenix-components.css */
  </style>
</head>
<body>
  <!-- Unified Header -->
  <header id="unified-header" class="unified-header">
    <!-- Header structure -->
  </header>
  
  <!-- Page Content -->
  <div class="page-wrapper">
    <div class="page-container">
      <main>
        <tt-container>
          <tt-section>
            <!-- Section Header -->
            <div class="index-section__header">
              <!-- Title, filters, etc. -->
            </div>
            
            <!-- Section Body -->
            <div class="index-section__body">
              <!-- Tables, content, etc. -->
            </div>
          </tt-section>
        </tt-container>
      </main>
    </div>
  </div>
  
  <!-- Footer (loaded dynamically) -->
  <footer id="phoenix-footer"></footer>
  
  <!-- JavaScript (External only) -->
  <script src="./footer-loader.js"></script>
  <script src="./header-filters.js"></script>
  <script src="./header-dropdown.js"></script>
</body>
</html>
```

**לקח חשוב:** מבנה HTML אחיד מקל על תחזוקה ומימוש.

#### **3.3 CSS Architecture**

**עקרונות:**
- ✅ **אין כפילויות** - כל הסגנונות הסטנדרטיים ב-`phoenix-components.css`
- ✅ **רק תיקונים ספציפיים** - רק ב-inline `<style>`
- ✅ **שימוש במחלקות קבועות** - `padding-xs`, `margin-xs`, וכו'
- ✅ **אין `!important`** - רק במקרים קריטיים (כמו override של Pico CSS)
- ✅ **RTL Support** - שימוש ב-logical properties (`margin-inline-start`, `padding-inline-end`)

**לקח חשוב:** CSS נקי ללא כפילויות מקל על תחזוקה ומבטיח עקביות.

#### **3.4 טבלאות**

**מבנה סטנדרטי:**
```html
<table id="[tableId]Table" class="phoenix-table js-table" data-table-type="[tableType]">
  <thead>
    <tr>
      <th class="phoenix-table__header col-[column] js-table-sort-trigger" 
          data-sortable="true" data-sort-key="[key]" data-sort-type="[type]">
        <span class="phoenix-table__header-text">[Header Text]</span>
        <span class="phoenix-table__sort-indicator js-sort-indicator"></span>
      </th>
      <!-- ... more headers ... -->
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="phoenix-table__cell col-[column]">[Content]</td>
      <!-- ... more cells ... -->
    </tr>
  </tbody>
</table>
```

**לקח חשוב:** מבנה טבלאות אחיד מקל על מימוש ותחזוקה.

#### **3.5 פאגינציה**

**מיקום:** תמיד בתחתית הטבלה (לפני סגירת `</div class="index-section__body">`)

**לקח חשוב:** מיקום אחיד של פאגינציה משפר UX.

---

### **שלב 4: בדיקות ואימות** ✅

#### **4.1 בדיקת מבנה HTML**
- ✅ מבנה עמוד תקין (`page-wrapper > page-container > main > tt-container > tt-section`)
- ✅ Header מלא עם כל הפילטרים
- ✅ Footer נטען דינמית
- ✅ אין JavaScript inline

#### **4.2 בדיקת CSS**
- ✅ כל קבצי CSS נטענים בסדר הנכון
- ✅ אין כפילויות CSS
- ✅ RTL alignment תקין
- ✅ Header alignment תקין (user icon, reset/clear buttons)
- ✅ Filter alignment תקין (vertical center)

#### **4.3 בדיקת טבלאות**
- ✅ כל העמודות מוצגות נכון
- ✅ Badges צבעוניים מוצגים נכון
- ✅ פאגינציה בתחתית הטבלה

#### **4.4 בדיקת פילטרים**
- ✅ כל הפילטרים מוצגים נכון
- ✅ Dropdowns מוצגים נכון
- ✅ כפתורי Reset/Clear מוצגים נכון

---

### **שלב 5: תיעוד והגשה** 📤

#### **5.1 יצירת מדריך יישום מפורט**
- **דוגמה:** `TEAM_31_D18_D21_IMPLEMENTATION_GUIDE.md`
- **תכולה:**
  - ✅ סקירה כללית של העמודים
  - ✅ מבנה HTML מפורט
  - ✅ CSS Architecture והיררכיית קבצים
  - ✅ מבנה טבלאות מפורט (עמודות, classes, badges)
  - ✅ פילטרים וסינון
  - ✅ פאגינציה
  - ✅ פעולות (Actions)
  - ✅ Edge Cases והערות חשובות
  - ✅ רשימת בדיקות ואימות
  - ✅ שלבי יישום מומלצים

**לקח חשוב:** מדריך יישום מפורט מקל על צוות 30 למימוש.

#### **5.2 יצירת מסמך הגשה**
- **דוגמה:** `TEAM_31_TO_TEAM_10_D18_D21_DELIVERY.md`
- **תכולה:**
  - ✅ Executive Summary
  - ✅ מה נוצר
  - ✅ קבצים שנמסרו
  - ✅ עקרונות יסוד
  - ✅ מבנה טבלאות מפורט
  - ✅ פילטרים
  - ✅ פעולות
  - ✅ Edge Cases והערות חשובות
  - ✅ בדיקות שבוצעו
  - ✅ הערות יישום

**לקח חשוב:** מסמך הגשה מסודר מקל על צוות 10 להעביר לצוות 30.

#### **5.3 עדכון אינדקס**
- **קובץ:** `index.html`
- **פעולות:**
  - ✅ הוספת עמודים חדשים
  - ✅ עדכון סטטוס
  - ✅ עדכון תאריך
  - ✅ הוספת הערות

**לקח חשוב:** אינדקס מעודכן מקל על מעקב אחרי התקדמות.

---

## 📊 לקחים מרכזיים

### **מה עבד טוב** ✅

1. **שימוש ב-D16 כתבנית** - חיסכון זמן משמעותי, עקביות מלאה
2. **סקריפט ניתוח אוטומטי** - דיוק גבוה, חיסכון זמן
3. **טבלת השוואת שדות** - זיהוי בעיות מוקדם, תיעוד ברור
4. **מדריך יישום מפורט** - צוות 30 יכול לממש בקלות
5. **CSS נקי ללא כפילויות** - תחזוקה קלה, עקביות

### **מה לא עבד טוב** ❌

1. **חוסר בדיקה מוקדמת של Legacy** - גרם לעבודה חוזרת
2. **חוסר השוואה ל-DB Schema** - גרם לשדות חסרים
3. **CSS כפילויות** - גרם לעבודה חוזרת וניקוי
4. **חוסר תיעוד מספיק** - גרם לבלבול בצוות 30

### **מה נשמר בין גרסאות** 💾

1. **מבנה HTML אחיד** - trading_accounts כתבנית לכל הטבלאות
2. **CSS Architecture** - היררכיית קבצים קבועה
3. **מחלקות CSS סטנדרטיות** - `phoenix-table`, `phoenix-table__header`, וכו'
4. **מבנה פילטרים** - מבנה אחיד לכל העמודים
5. **מבנה פאגינציה** - מבנה אחיד לכל העמודים

### **מה ננטש בין גרסאות** 🗑️

1. **CSS כפילויות** - הועבר ל-`phoenix-components.css`
2. **JavaScript inline** - הועבר לקבצים חיצוניים
3. **מחלקות CSS מותאמות אישית** - הוחלפו במחלקות סטנדרטיות
4. **תבניות ישנות** - הוחלפו ב-D16 כתבנית

### **מה הביא להתקדמות משמעותית** 🚀

1. **שימוש ב-trading_accounts כתבנית** - חיסכון זמן של 70%
2. **סקריפט ניתוח אוטומטי** - דיוק גבוה, חיסכון זמן של 50%
3. **מדריך יישום מפורט** - צוות 30 יכול לממש ללא שאלות
4. **CSS נקי ללא כפילויות** - תחזוקה קלה, עקביות מלאה

### **מה היה מטעה לדרישות של צוות 30** ⚠️

1. **חוסר תיעוד מספיק** - גרם לבלבול ושאלות
2. **CSS כפילויות** - גרם לעבודה חוזרת
3. **חוסר השוואה ל-DB Schema** - גרם לשדות חסרים
4. **חוסר בדיקה מוקדמת של Legacy** - גרם לעבודה חוזרת

---

## 🎯 כללי עבודה מחייבים

### **1. עבודה מבודדת לחלוטין** 🔒

- ✅ כל הבלופרינטים בתיקיית התקשורת שלנו (`_COMMUNICATION/team_31/team_31_staging/sandbox_v2/`)
- ❌ אין עריכה של קבצים בפרויקט עצמו (`ui/src/`, `documentation/`, וכו')
- ✅ רק קריאה והתייחסות לקבצים שיצרו צוות 30/40

### **2. שימוש ב-trading_accounts כתבנית** 📋

- ✅ כל טבלאות מבוססות על trading_accounts_BLUEPRINT.html
- ✅ שמירה על מבנה HTML זהה
- ✅ שמירה על מחלקות CSS זהה
- ✅ **כללי שמות קבצים:** שם קובץ מסתיים ב-`_BLUEPRINT.html`, אין שימוש בתחיליות D15, D16, D21 וכו', **שם קובץ חייב להיות מדויק לפי רשימת העמודים הרשמית בתיעוד** (snake_case)

### **3. CSS Architecture** 🎨

- ✅ אין כפילויות - כל הסגנונות הסטנדרטיים ב-`phoenix-components.css`
- ✅ רק תיקונים ספציפיים - רק ב-inline `<style>`
- ✅ שימוש במחלקות קבועות - `padding-xs`, `margin-xs`, וכו'
- ✅ אין `!important` - רק במקרים קריטיים

### **4. תיעוד מפורט** 📝

- ✅ מדריך יישום מפורט לכל חבילה
- ✅ מסמך הגשה מסודר
- ✅ עדכון אינדקס

### **5. בדיקות מקיפות** ✅

- ✅ בדיקת מבנה HTML
- ✅ בדיקת CSS
- ✅ בדיקת טבלאות
- ✅ בדיקת פילטרים

---

## 📁 מבנה קבצים

### **תיקיית עבודה:**
```
_COMMUNICATION/team_31/team_31_staging/
├── sandbox_v2/                          # סביבת עבודה מבודדת V2
│   ├── trading_accounts_BLUEPRINT.html  # תבנית טבלאות (בסיס)
│   ├── brokers_fees_BLUEPRINT.html      # Blueprint - ברוקרים
│   ├── cash_flows_BLUEPRINT.html        # Blueprint - תזרימי מזומנים
│   ├── [שם_מדויק_רשמי]_BLUEPRINT.html  # בלופרינטים חדשים (⚠️ NO D15, D16 prefixes, snake_case)
│   ├── footer.html                      # Footer מודולרי
│   ├── footer-loader.js                # טעינת Footer
│   ├── header-filters.js               # פילטרים של Header
│   ├── header-dropdown.js               # תפריטי דרופדאון
│   ├── section-toggle.js                # הצגה/הסתרה של סקשנים
│   ├── index.html                       # אינדקס
│   └── README.md                        # תיעוד
├── TEAM_31_WORKFLOW_PROCESS_V2.md       # נוהל עבודה (קובץ זה)
└── [תיעוד נוספים]
```

### **קבצי CSS חיים במערכת (LIVE - קריאה בלבד):**
```
ui/src/styles/
├── phoenix-base.css                     # Design Tokens & Global Styles (SSOT)
├── phoenix-components.css               # LEGO Components (Tables, Badges, Pagination)
├── phoenix-header.css                   # Unified Header Styles
└── D15_DASHBOARD_STYLES.css             # Dashboard-specific styles
```

---

## 🔄 תהליך עבודה מומלץ לחבילה חדשה

### **שלב 1: מחקר וניתוח** (2-3 שעות)
1. סקירת Legacy Files
2. בדיקת DB Schema
3. בדיקת OpenAPI Spec
4. ניתוח מבנה טבלאות קיים (trading_accounts_BLUEPRINT.html)

### **שלב 2: תכנון** (1-2 שעות)
1. יצירת סקריפט ניתוח
2. יצירת טבלת השוואת שדות
3. תכנון מבנה טבלאות

### **שלב 3: יצירת בלופרינט** (4-6 שעות)
1. העתקת מבנה בסיסי מ-trading_accounts_BLUEPRINT.html
2. שימוש בשם קובץ מדויק לפי רשימת העמודים הרשמית בתיעוד (snake_case)
3. שם קובץ מסתיים ב-`_BLUEPRINT.html` (⚠️ NO D15, D16 prefixes)
2. התאמה לשדות ספציפיים
3. הוספת פילטרים
4. הוספת פאגינציה
5. הוספת פעולות

### **שלב 4: בדיקות** (1-2 שעות)
1. בדיקת מבנה HTML
2. בדיקת CSS
3. בדיקת טבלאות
4. בדיקת פילטרים

### **שלב 5: תיעוד והגשה** (2-3 שעות)
1. יצירת מדריך יישום מפורט
2. יצירת מסמך הגשה
3. עדכון אינדקס

**סה"כ זמן משוער:** 10-16 שעות לחבילה

---

## 📋 Checklist לפני הגשה

### **בלופרינט:**
- [ ] מבוסס על trading_accounts_BLUEPRINT.html
- [ ] שם קובץ מדויק לפי רשימת העמודים הרשמית בתיעוד (snake_case)
- [ ] שם קובץ מסתיים ב-`_BLUEPRINT.html` (⚠️ NO D15, D16 prefixes)
- [ ] שם קובץ ברור ומתאר את התוכן
- [ ] כל השדות מ-Legacy ו-DB Schema קיימים
- [ ] מבנה HTML תקין
- [ ] CSS נקי ללא כפילויות
- [ ] RTL alignment תקין
- [ ] Header alignment תקין
- [ ] Filter alignment תקין
- [ ] פאגינציה בתחתית הטבלה

### **תיעוד:**
- [ ] מדריך יישום מפורט נוצר
- [ ] מסמך הגשה נוצר
- [ ] אינדקס מעודכן

### **בדיקות:**
- [ ] כל הבדיקות עברו
- [ ] אין שגיאות בקונסולה
- [ ] כל הפילטרים עובדים

---

**Team 31 (Blueprint)**  
**Date:** 2026-01-31  
**Status:** ✅ **ACTIVE WORKFLOW V2.0**

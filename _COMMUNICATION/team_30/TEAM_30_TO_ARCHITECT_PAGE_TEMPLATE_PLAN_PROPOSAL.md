# Team 30 → אדריכלית: תוכנית מימוש — תבנית עמוד אחידה + חוזה ולידציה

**מאת:** Team 30 (Frontend Execution)  
**אל:** אדריכלית גשר (Gemini) / Team 10 (Gateway)  
**תאריך:** 2026-02-13  
**נושא:** אישור תוכנית — תבנית עמוד בסיסית + חוזה עמוד + ולידציה  
**מקור:** התייעצות — שיפור תחזוקתיות תבנית עמודים

---

## 1. רקע ויעדים

### 1.1 הבעיה
- כל עמודי המערכת (למעט אוטנטיקציה) בנויים על תבנית בסיסית אחידה.
- שינוי או עדכון בתבנית יוצר בעיות תחזוקה קשות — עדכון ידני בכל עמוד.
- ככל שיתווספו עמודים, הסיכון ל-drift ולאי-עקביות יגדל.

### 1.2 היעד
- **אחידות:** שינוי אחד בתבנית → השפעה על כל העמודים.
- **פשטות:** ללא מנגנון מורכב, ללא ריצה בזמן אמת.
- **אכיפה:** ולידציה אוטומטית שעמודים עומדים בחוזה.

### 1.3 ההחלטה
מימוש **שילוב 1+3:**
- **1:** תבנית יחידה (Single Template) — SSOT לתבנית הבסיסית.
- **3:** חוזה עמוד + ולידציה — תיעוד מחייב וסקריפט בדיקה.

---

## 2. ארכיטקטורת הפתרון

### 2.1 עקרון פעולה

```
┌─────────────────────────────────────────────────────────────────┐
│  documentation/  (SSOT - עריכה: אדריכל / Team 10)              │
│  ├── TT2_PAGE_TEMPLATE_CONTRACT.md     ← חוזה העמוד             │
│  └── (ייחוס ל-CSS_LOADING_ORDER, TT2_BLUEPRINT_*)               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  ui/  (מקור קוד)                                                 │
│  ├── src/views/shared/                                          │
│  │   └── page-base-template.html    ← תבנית SSOT (ייחוס)         │
│  ├── scripts/                                                    │
│  │   ├── generate-pages.js           ← בניית עמודים מהתבנית     │
│  │   └── validate-pages.js           ← בדיקת עמידה בחוזה        │
│  └── src/views/financial/*/                                      │
│      ├── trading_accounts.content.html  ← תוכן בלבד              │
│      ├── brokers_fees.content.html                              │
│      └── cash_flows.content.html                                │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 תואם GOV-MANDATE-V3
- **יושרה טריטוריאלית:** Team 30 כותב קוד ב־`ui/`; תיעוד SSOT ב־`documentation/` — **עריכה ע"י Team 10/אדריכל** (קידום ידע).
- **Sandbox:** מסמך זה ב־`_COMMUNICATION/team_30/` — הצעה לאישור. לאחר אישור — Team 10 מעביר את החוזה ל־`documentation/`.

---

## 3. פירוט מימוש — רכיב 1: תבנית יחידה

### 3.1 מיקום
- **קובץ:** `ui/src/views/shared/page-base-template.html`
- **תפקיד:** מקור יחיד לתבנית — לא נטען ישירות; משמש כקלט לסקריפט הבנייה.

### 3.2 Placeholders בתבנית

| Placeholder | תיאור | דוגמה |
|-------------|--------|-------|
| `{{PAGE_TITLE}}` | כותרת `<title>` | `חשבונות מסחר \| TikTrack Phoenix` |
| `{{BODY_CLASS}}` | classes ל־`<body>` | `trading-accounts-page context-trading` |
| `{{PAGE_CONFIG_SCRIPT}}` | נתיב ל־PageConfig.js | `/src/views/financial/tradingAccounts/tradingAccountsPageConfig.js` |
| `{{PAGE_CONTENT}}` | תוכן ה־`<main>` — tt-container + tt-section(s) | HTML מלא |
| `{{PAGE_SCRIPTS}}` | סקריפטים ספציפיים לעמוד (לפני `</body>`) | HTML מלא |

### 3.3 מבנה התבנית (תרשים)

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{PAGE_TITLE}}</title>
  <!-- Favicon -->
  <!-- CSS 1-6 (סדר קבוע per CSS_LOADING_ORDER.md) -->
  <!-- Lucide -->
</head>
<body class="{{BODY_CLASS}}">
  <!-- UAI: PageConfig + UnifiedAppInit -->
  <script src="{{PAGE_CONFIG_SCRIPT}}"></script>
  <script type="module" src="/src/components/core/UnifiedAppInit.js"></script>
  <div class="page-wrapper">
    <div class="page-container">
      <main>
        {{PAGE_CONTENT}}
      </main>
    </div>
  </div>
  <!-- Core scripts (קבועים) -->
  {{PAGE_SCRIPTS}}
</body>
</html>
```

### 3.4 קבצי תוכן (Content-Only)
- כל עמוד → קובץ `.content.html` המכיל **רק** את ה־`<tt-container>` הפנימי (ללא wrapper חיצוני).
- דוגמה: `trading_accounts.content.html` — כולל את כל ה־tt-section(s) והמבנה הפנימי.
- **מספר קונטיינרים גמיש:** כל עמוד יכול להכיל 1 עד N tt-sections (בפועל: 2–5).

### 3.5 סקריפט בנייה — `scripts/generate-pages.js`

**תיאור:** Node.js script שקורא:
- `page-base-template.html`
- `*.content.html` מתוך כל תיקיית עמוד
- קובץ מפה (למשל `scripts/page-manifest.json`) המגדיר: title, bodyClass, configPath, contentPath, pageScripts

**פלט:** קבצי HTML מלאים ב־`ui/src/views/financial/*/` (למשל `trading_accounts.html`).

**הרצה:**
- ידנית: `node ui/scripts/generate-pages.js`
- אופציונלי: הוספה ל־`npm run build` או `npm run build:pages`

---

## 4. פירוט מימוש — רכיב 3: חוזה עמוד + ולידציה

### 4.1 מסמך חוזה — `TT2_PAGE_TEMPLATE_CONTRACT.md`

**מיקום מוצע:** `documentation/05-PROCEDURES/` או `documentation/10-POLICIES/`  
**בעלים:** Team 10 (קידום ידע — לאחר אישור אדריכל)

**תוכן (תמצית):**
1. **סדר טעינת CSS** — הפניה מחייבת ל־`CSS_LOADING_ORDER.md`.
2. **מבנה DOM מחייב:**
   - `page-wrapper > page-container > main > tt-container > [tt-section × N]` (N ≥ 1)
   - אלמנטים חובה: `page-wrapper`, `page-container`, `main`, `tt-container`
   - **מספר tt-section גמיש** — כל עמוד מגדיר את מספר הקונטיינרים שלו
3. **מבנה tt-section (לכל קונטיינר):**
   - `tt-section[data-section]` → `index-section__header` + `index-section__body`
   - `index-section__body` → `tt-section-row` → `col-12` → [תוכן]
4. **UAI Entry Point:**
   - PageConfig → UnifiedAppInit (בלי שינוי סדר).
5. **סקריפטים ליבה:** משתנים לפי עמוד — sectionToggleHandler.js (כל העמודים), footerLoader.js (רוב העמודים), headerFilters/headerLinksUpdater (עמודים עם פילטרים גלובליים).
6. **מאפיינים:** `lang="he"`, `dir="rtl"`, favicon, viewport.

### 4.2 סקריפט ולידציה — `scripts/validate-pages.js`

**תיאור:** Node.js script שבודק את כל קבצי ה־HTML הרלוונטיים:

| בדיקה | תיאור |
|-------|--------|
| סדר CSS | וידוא שכל 6 ה־CSS links מופיעים באותו סדר כמו בחוזה |
| מבנה DOM | נוכחות `page-wrapper`, `page-container`, `main`, `tt-container` |
| tt-container | לפחות tt-section אחד בתוך tt-container |
| tt-section | כל tt-section מכיל `index-section__header` + `index-section__body` + `tt-section-row` |
| UAI | נוכחות PageConfig + UnifiedAppInit לפני ה־page-wrapper |
| RTL | `dir="rtl"` ו־`lang="he"` |
| Favicon | נוכחות link ל־favicon |

**פלט:** רשימת הפרות (אם יש) עם נתיב קובץ ומספר שורה; exit code 1 אם יש הפרה.

**הרצה:**
- `node ui/scripts/validate-pages.js`
- אופציונלי: הוספה ל־CI או ל־pre-commit hook

---

## 5. תוכנית עבודה מוצעת

### שלב 1: הכנה (Team 30)
| # | משימה | תוצר |
|---|--------|------|
| 1.1 | כתיבת `page-base-template.html` עם placeholders | קובץ תבנית |
| 1.2 | פירוק עמודים קיימים ל־`.content.html` + `page-manifest.json` | קבצי תוכן + מפה |
| 1.3 | כתיבת `generate-pages.js` | סקריפט בנייה |
| 1.4 | וידוא שכל העמודים נוצרים נכון והמערכת פועלת | אימות |

### שלב 2: חוזה ולידציה (Team 30 + Team 10)
| # | משימה | אחראי | תוצר |
|---|--------|--------|------|
| 2.1 | טיוטת `TT2_PAGE_TEMPLATE_CONTRACT.md` | Team 30 | מסמך ב־_COMMUNICATION |
| 2.2 | כתיבת `validate-pages.js` | Team 30 | סקריפט |
| 2.3 | אישור אדריכל | אדריכלית | חתימה |
| 2.4 | קידום חוזה ל־documentation (Knowledge Promotion) | Team 10 | SSOT ב־documentation/ |

### שלב 3: אינטגרציה
| # | משימה | תוצר |
|---|--------|------|
| 3.1 | הוספת `npm run build:pages` ו/או `npm run validate:pages` | package.json scripts |
| 3.2 | עדכון תיעוד (Blueprint, CSS_LOADING_ORDER) — הפניות לחוזה | consistency |
| 3.3 | (אופציונלי) הוספת validate ל־CI | אכיפה אוטומטית |

---

## 6. אימות מול מבנה בפועל

נבדק מול עמודים: `trading_accounts`, `brokers_fees`, `cash_flows`.

| עמוד | מספר tt-sections | data-section |
|------|------------------|--------------|
| trading_accounts | 5 | summary-alerts, trading-accounts-management, account-movements-summary, account-by-dates, positions-by-account |
| brokers_fees | 2 | summary-alerts, brokers-management |
| cash_flows | 3 | summary-alerts, cash-flows-management, currency-conversions |

**מבנה DOM מאומת:**
```
page-wrapper > page-container > main > tt-container > tt-section[data-section] × N
  └─ tt-section
       ├─ index-section__header
       └─ index-section__body
            └─ tt-section-row
                 └─ col-12
                      └─ [תוכן]
```

**פתיחה וסגירה:** כל tt-section נפתח ונסוג לפי מספר הקונטיינרים בעמוד; הקוד והעיצוב נשמרים מדויקים.

---

## 7. שאלות לאישור האדריכלית

1. **מיקום החוזה:** האם `documentation/05-PROCEDURES/TT2_PAGE_TEMPLATE_CONTRACT.md` מתאים, או להעדיף `documentation/10-POLICIES/`?

2. **סקריפטים:** האם `ui/scripts/` הוא המיקום הנכון לסקריפטי Node (generate, validate), או שיש תיקייה סטנדרטית אחרת?

3. **אישור תוכנית:** האם לתוכנית זו יש אישור להתחיל בשלב 1?

4. **חריגים:** עמודי אוטנטיקציה (login, register, reset-password) — האם להוציא במפורש מהחוזה ומהלולידציה?

---

## 8. סיכום

| רכיב | תיאור |
|------|--------|
| **תבנית יחידה** | `page-base-template.html` + placeholders; `generate-pages.js` מרכיב עמודים |
| **חוזה עמוד** | `TT2_PAGE_TEMPLATE_CONTRACT.md` ב־documentation (לאחר אישור) |
| **ולידציה** | `validate-pages.js` — בודק עמידה בחוזה |
| **תואם מנדט** | Sandbox → קידום ידע; יושרה טריטוריאלית; LOD 400 |

---

**Team 30 (Frontend Execution)**  
**log_entry | TEAM_30 | PAGE_TEMPLATE_PLAN | TO_ARCHITECT | PENDING_APPROVAL | 2026-02-13**

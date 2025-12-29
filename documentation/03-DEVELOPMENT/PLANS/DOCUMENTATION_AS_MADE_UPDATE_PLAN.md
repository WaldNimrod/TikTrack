# תוכנית עדכון תיעוד As‑Made

**מטרה:** ליישר את כל התיעוד לקוד בפועל, לנקות לגסי/כפילויות, ולהפיק סט תיעוד נקי ומדויק לשחרור.

---

## 1) עקרונות עבודה (As‑Made)

- **מקור אמת:** הקוד בפועל (Backend routes, `trading-ui/*.html`, `trading-ui/scripts/**`, APIs).
- **תיעוד מרכזי בלבד:** מסמכי ליבה נשארים ומעודכנים; דוחות ישנים עוברים לארכיון.
- **אין תמיכה לאחור:** כל רפרנס ל‑legacy routes/filenames יוסר מהתיעוד.
- **כל שינוי חייב מקור בקוד:** מסמך שלא מגובה בקוד יסומן כפער או יעודכן.
- **מסמכים שנוצרו בשבוע האחרון לא מועברים לארכיון.**

---

## 2) שכבות מידע וכיסוי

### שכבות חובה (לעדכון מלא)

1. **INDEX** – `documentation/INDEX.md`
2. **Pages List** – `documentation/PAGES_LIST.md`
3. **Setup / Routing** – `documentation/03-DEVELOPMENT/SETUP/PAGE_URL_MAPPING.md`
4. **Architecture** – `documentation/02-ARCHITECTURE/**`
5. **Features** – `documentation/04-FEATURES/**`
6. **Development Guides** – `documentation/03-DEVELOPMENT/GUIDES/**`
7. **Testing / Tools** – `documentation/03-DEVELOPMENT/TESTING/**`, `documentation/03-DEVELOPMENT/TOOLS/**`
8. **Admin / Production** – `documentation/admin/**`, `documentation/production/**`

### מקורות אמת (Code)

- **Routes:** `Backend/routes/pages.py`
- **Pages:** `trading-ui/*.html`
- **Packages/Init:** `trading-ui/scripts/init-system/package-manifest.js`, `trading-ui/scripts/page-initialization-configs.js`
- **Core Systems:** `trading-ui/scripts/modules/**`, `trading-ui/scripts/services/**`
- **APIs:** `Backend/routes/api/**`, `Backend/services/**`

---

## 3) שלבי עבודה

### שלב A – אינדוקס ומיפוי

- יצירת רשימת מסמכים לפי שכבות.
- סימון מסמכי ליבה מול דוחות זמניים.
- זיהוי מסמכים כפולים/חופפים.

**תוצר:**

- טבלת `doc → layer → owner → status`.

### שלב B – הצלבה מול הקוד

- הצלבת Routes מול קבצי HTML בפועל.
- הצלבת שמות עמודים ו‑URLs מול `PAGES_LIST.md`.
- הצלבת שירותים/Modules מול מדריכי מפתחים.
- הצלבת APIs מול Feature Docs.

**תוצר:**

- רשימת פערים (Mismatch / Missing / Legacy / Duplicate).

### שלב C – עדכון מסמכים מרכזיים

- INDEX, Pages List, URL Mapping – עדכון מלא ראשון.
- Features מרכזיים: Watch Lists, Tags, Preferences, Historical Pages.
- Guides מרכזיים: Bundling, Init, CRUD, Tagging, Preferences.

**תוצר:**

- סט מסמכים מרכזיים מיושר לקוד.

### שלב D – ניקוי לגסי/כפילויות

- הסרת רפרנסים ל‑legacy routes/filenames.
- מיזוג מסמכים חופפים.
- העברת דוחות ישנים לארכיון.

**תוצר:**

- תיקיות נקיות ללא כפילויות/legacy.

### שלב E – ולידציה סופית

- בדיקת לינקים פנימיים.
- בדיקת תאימות שמות קבצים/Routes.
- בדיקת consistency מול page groups (cross-page testing).

**תוצר:**

- דוח סיכום סופי + רשימת חריגים לבדיקה חוזרת.

---

## 4) קריטריוני הצלחה

- אין מסמך עם URL/route שלא קיים בקוד.
- אין תיעוד של קובץ HTML שלא קיים ב‑`trading-ui/`.
- אין כפילויות משמעותיות בין מסמכים.
- כל מדריך מפתח מצביע על קבצים ושמות מדויקים.
- כל legacy references מתוייגים להסרה או הוסרו.

---

## 5) Deliverables

1. **עדכון מלא של מסמכי ליבה** (INDEX, PAGES_LIST, PAGE_URL_MAPPING).
2. **יישור מסמכי Features/Guides** מול הקוד בפועל.
3. **דוח פערים ולגסי** – עדכון ל‑`documentation/05-REPORTS/AS_MADE_DOCUMENTATION_UPDATE_REPORT.md`.
4. **סט תיעוד נקי** (ללא כפילויות/legacy/דוחות ישנים).
5. **דוח סריקה רוחבית** – `documentation/05-REPORTS/DOCUMENTATION_FULL_SCAN_GAPS_REPORT.md`.

---

## 6) סדר עדיפויות מומלץ

1. **Routing + Pages** (כי משפיע על כל התיעוד)
2. **Features מרכזיים** (Preferences, Watch Lists, Tags)
3. **Architecture + Guides**
4. **Admin/Production**
5. **Testing/Tools**

---

## 7) חריגים וארכיון

- מסמכים שנוצרו בשבוע האחרון נשארים גם אם הם דוחות.
- דוחות ותכניות ישנים מועברים לארכיון: `documentation/ARCHIVE/**`, `reports/ARCHIVE/**`.

---

## 8) Backlog עבודה (קוד + תיעוד)

### תיעוד

- לסגור כל פער בדוח הסריקה: `documentation/05-REPORTS/DOCUMENTATION_FULL_SCAN_GAPS_REPORT.md`.
- לוודא שכל URLs ב‑documentation משתמשים ב‑underscore עבור HTML/דפדפן, ו‑kebab עבור API.
  - סטטוס נוכחי: 42 הפניות HTML + 79 Routes דורשים התאמת קוד/שמות.

### קוד / אחידות שמות

- לעדכן `Backend/routes/pages.py` כך שכל routes ו‑HTML names יהיו ב‑underscore.
- לאחד שמות HTML ב‑`production/trading-ui` ל‑underscore (ולעדכן build).
- להוסיף redirects מ‑kebab-case ל‑underscore (כל עוד קיימות הפניות ישנות).
  - נדרשת פעולת rename גורפת לכל קבצי HTML עם `-` ב‑`trading-ui/` וב‑`production/trading-ui/`.

### לגסי ותמיכה לאחור

- מיפוי מלא של legacy routes/HTML/JS להסרה (frontend + backend).
- הסרה בפועל של רפרנסים ל‑legacy במערכת לאחר אישור.

### פונקציונליות חסרה

- Watch Lists: מדיניות רשימת ברירת מחדל + empty-state עקבי.
- User Profile: החלטה על CRUD מול `/api/auth/me` + `/api/auth/me/password` ומימוש בפועל.

### ניקוי וארכיון

- מעבר שיטתי על דוחות ישנים והעברה לארכיון (שמירה על 7 ימים אחרונים).

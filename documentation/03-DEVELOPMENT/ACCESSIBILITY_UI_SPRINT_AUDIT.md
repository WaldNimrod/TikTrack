# ♿ Accessibility & UI Consistency Sprint – Audit & Spec

## 1. תחום הבדיקה

- **מערכות נבדקות**: `header-system.js`, `button-system-init.js`, רכיבי ITCSS ב־`styles-new/**/*`, מערכת הטבלאות (`tables.js`, `table-mappings.js`, רנדררים בעמודים המרכזיים).
- **יעד**: הכנת מפרט תיקונים לשיפור נגישות (WCAG 2.1 AA), ניווט מקלדת, ניגודיות וצמצום חוסר אחידות ב־UI לפני יישום הפיצ׳רים.

## 2. ממצאים מרכזיים

### 2.1 ניווט וכותרת (Header System)

- **ללא ARIA / Landmark Roles**: אלמנט ה־`header` והניווט אינם מציינים `role="navigation"` / `aria-label`.
- **היעדר תאימות מקלדת**: אין טיפול ב־`keydown` למעבר בתוך התפריט והפילטרים, כפתורי toggle מתבססים על עכבר בלבד.
- **חוסר מנגנון נגיש להחלפת ערכות נושא**: קיימת ערכת ‎`_high-contrast.css` אך אין toggle חשוף, ואין עדכון CSS Variables בהתאם לבחירת המשתמש.
- **מצבי פוקוס**: סגנונות קיימים מעיפים outline (`outline: none`) ללא חלופה בולטת → משתמשי מקלדת אינם רואים היכן הפוקוס נמצא.

#### דרישות יישום

- הוספת landmark roles (`role="banner"`, `role="navigation"`, Labels ב־`aria-label`).
- בניית Keyboard loop (Focus Trap) לתפריטים/חיפוש עם `keydown` (Arrow/Tab/Enter/Escape).
- שילוב toggle לניגודיות גבוהה/הגדלת טקסט בהתאם למערכת ההעדפות וטעינת `--theme-*`.
- יצירת מחלקת `focus-visible` גלובלית והחזרת הפוקוס הוויזואלי.

### 2.2 מערכת הכפתורים (Button System)

- `button-system-init.js` מייצר כפתורים ללא `aria-label` כאשר הטקסט מוסתר (וריאנט small / icon-only).
- Tooltip מבוסס Bootstrap בלבד → אין fallback נגיש למשתמשי מקלדת (trigger hover) או לקוראי מסך.
- `title` נוצר אוטומטית, אך אין שימוש ב־`aria-describedby`/`aria-live` בהודעות.

#### דרישות יישום

- כאשר `variant="small"` או שאייקון בלבד מוצג → חובה לספק `aria-label` או `data-a11y-label`.
- הרחבת תצורת tooltip להוסיף `aria-describedby` + תמיכה בהפעלת tooltip ע״י מקש `Enter/Space`.
- הוספת utility שמחזיר תקני `tabindex` ו־`role="button"` עבור אלמנטים שאינם `<button>` (למשל קישורים עם data-onclick).

### 2.3 שכבת ה־CSS (ITCSS `styles-new`)

- קבצים רבים (למשל `_forms-advanced.css`, `_bootstrap-overrides.css`) מבטלים outline ללא אלטרנטיבה.
- משתני המותג (Turquoise/Orange: ‎`#26baac` / ‎`#fc5a06`) אינם משמשים כ־primary/secondary. ערכי ברירת המחדל נשארו Bootstrap (`#007bff`).
- חסרה ספריית utility עבור `focus-visible`, ניגודיות גבוהה, והגדלת גדלי פונט לפי breakpoints.

#### דרישות יישום

- הפסקת שימוש ב־`outline: none` ללא מחלקת `.focus-visible` מוגדרת.
- עדכון `01-settings/_colors-dynamic.css` ו־`_color-variables.css` כך ש־`--primary-color`, `--secondary-color`, `--brand-primary` מצביעים על צבעי הלוגו.
- הוספת mixin/utility לכלי ניגודיות גבוהה (שימוש ב־`prefers-contrast` ו־CSS Custom Properties).
- הרחבת מערכת ה־spacing/typography עבור התאמות נגישות (≥14px טקסט, יחידות `rem`).

### 2.4 טבלאות ועדכוני זמן

- עמודת “עודכן” קיימת רק ב־`tickers.html`. שאר העמודים לא מציגים זמן עדכון, למרות הדרישה בתיעוד.
- `getTimeDuration()` קיימת אך לא מנוצלת ברכיבי הרנדר (למשל `tickers.js` ממשיך להציג מחרוזת תאריך).
- קיימים ערכי דמה (mock data) עבור P/L ושינוי יומי בקובצי `trades.js`, `accounts.js` וכו׳ — הפרה של כלל “אין נתוני ברירת מחדל”.
- טבלאות נגישות: אין ציון `scope="col"`, `role="row"`, או מצבי פוקוס לשורות נבחרות.

#### דרישות יישום

- עדכון כל עמודי ה־HTML המרכזיים (trades/accounts/alerts/notes/cash-flows/trade-plans/executions) להוסיף עמודת “עודכן” + שימוש במערכת הכותרות הגלובלית (`col-updated`).
- התאמת הרנדרים JS לשימוש ב־`getTimeDuration` או ב־`FieldRendererService.renderDuration`.
- הסרת נתוני דמה: הצגת “לא זמין” והפעלת הודעת שגיאה כאשר אין מידע אמיתי.
- החלת Roles ב־thead (`scope="col"`, `aria-sort`) ו־`tabindex` לשורות אינטראקטיביות.

### 2.5 תוספות כלליות

- אין “Skip to content” גלובלי.
- מודלים (ModalManagerV2) אינם מחזירים פוקוס לאלמנט הקורא.
- אין מערכת בדיקות אוטומטית לנגישות (axe-core) כחלק מ־CI או מתסריטי QA.

## 3. חבילות תיקון מוצעות

| נושא | קבצים מושפעים | פעולות נדרשות |
|------|---------------|----------------|
| Landmark & Keyboard Navigation | `trading-ui/scripts/header-system.js`, `styles-new/header-styles.css` | הוספת roles, ניהול פוקוס, טיפול במקשי חצים/Tab/Escape, Skip Link. |
| Button A11y Enhancements | `trading-ui/scripts/button-system-init.js`, `button-icons.js`, `button-texts.js` | `aria-label` לאייקון בלבד, Tooltip נגיש, תיאורי קול. |
| Focus Styling & Themes | `styles-new/01-settings/_colors-*.css`, `styles-new/06-components/_tables.css`, `_bootstrap-overrides.css` | שינוי primary/secondary לצבעי המותג, יצירת `:focus-visible`, מצב High Contrast. |
| Table Update Column | עמודי HTML ו־JS לכל הישויות + `table-mappings.js`, `tables.js` | עמודת “עודכן”, שימוש ב־`getTimeDuration`, Roles בטבלה. |
| Mock Data Removal | `trading-ui/scripts/trades.js` ועוד | הסרת ערכי דמה, שימוש ב־Notification System לשגיאות נתונים. |
| QA Tooling | `package.json` scripts (אם רלוונטי), תסריטי QA ב־documentation | שילוב axe-core / בדיקות ידניות, צ׳קליסט עדכני. |

## 4. בדיקות נדרשות

1. **בדיקות ידניות**: ניווט מקלדת בכל עמודי ה־UI, בדיקת מודלים, ווידוא פוקוס.
2. **בדיקות אוטומטיות**: הפעלת axe-core / Lighthouse בכל עמוד פיתוח מרכזי.
3. **התאמה לרספונסיביות**: בדיקת טווחי breakpoints (≥320px, ≥1024px).
4. **בדיקות ניגודיות**: שימוש ב־WCAG contrast ratio ≥ 4.5:1 בכותרות, ≥ 3:1 לאייקונים.

## 5. המלצות המשך

- להוסיף ל־`FUTURE_TASKS_MASTER_LIST.md` סטטוס “בעבודה” עבור הפרויקט הנוכחי לאחר יישום.
- לעדכן את מסמכי ה־UI (PAGE_UPDATE_GUIDE, CSS_ARCHITECTURE_GUIDE) עם כללים חדשים לנגישות.
- לשקול הוספת פרופיל העדפות משתמש לניגודיות/פונט כחלק מ־`Preferences` כדי לשמור העדפות לגולש.

## 6. סטטוס אוטומציה מעודכן

- 🔄 **בדיקות axe-core**: נוספה הרצת smoke בדיקות ב־Jest (`npm run test:a11y`) על דפי הליבה (`trades`, `trade_plans`, `trading_accounts`, `alerts`, `cash_flows`, `notes`, `executions`, `data_import`, `tickers`). הבדיקה מדווחת על חריגות ברמה Serious/Critical ומנטרלת זמנית את בדיקת הניגודיות (מכוסה בתיקון העיצובי).
- 📄 **מיקום הבדיקה**: `tests/integration/accessibility/a11y-baseline.test.js`
- 🧪 **שימוש מומלץ**: לשלב את הפקודה ב־CI ובסבבי QA לפני העלאה לסביבת בדיקות.

## 7. סטטוס כיסוי צבעים דינמי

- **העדפות > UI**: צבעי חיובי/שלילי/ניטרלי ממערכת ההעדפות (valuePositive / valueNegative / valueNeutral) מפרנסים כעת את כל משתני ה־CSS הסמנטיים (`--color-success`, `--color-danger`, `--color-neutral`, וכו׳) כולל גזרות רקע/מסגרת.
- **Theme צבעי אזהרה/מידע**: `warningColor` ו־`infoColor` נצרכים בזמן ריצה ומרעננים `--color-warning` / `--color-info` והנגזרות שלהם (רקע/מסגרת) לצד fallback מאובטח.
- **מערכת ניהול > Dashboards**: רכיבי System Management (SMUI) משתמשים ב־`SMUIColorUtils` החדש כדי לשלוף את הגוונים הדינמיים עבור סטטוסים, מדדי ביצועים ופסי התקדמות (אחידות ב־Dashboard, Cache, Server).
- **מרכז התראות**: חלוניות הסיווג משתמשות בצבעי ישויות גלובליים (`--entity-*`) ובצבעים סמנטיים קלים לעדכון במקום hex קשיחים.
- **ייבוא נתונים**: מדד התאמה (confidence score) משתקף באמצעות `var(--color-success / warning / danger)` במקום צבעים קשיחים.

---
**המסמך נוצר כחלק מהשלמת המשימה “audit-accessibility” בתוכנית הספציפית וילווה את שלבי הפיתוח הבאים.**


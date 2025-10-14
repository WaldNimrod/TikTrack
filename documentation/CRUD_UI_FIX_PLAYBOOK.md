## מדריך עבודה: Playbook לבדיקות ותיקוני CRUD בעמודי UI

מסמך זה מגדיר כללים מחייבים, רשימת עמודים נבדקים, וסדר פעולות ממוספר לטיפול עקבי בכל בעיות ה־CRUD בממשק. כולל דוגמאות בעיה→פתרון מכלל העמודים (עם דגש על `cash_flows`, `executions`, `tickers`).

---

### 1) כללים מחייבים וסטנדרטים (ליישם תחילה)

- טעינה ואתחול מערכת העדפות
  - חובה לטעון `trading-ui/scripts/preferences-core.js` לפני כל Services.
  - האתחול מתבצע גלובלית ב־Stage 3 דרך `UnifiedAppInitializer` ב־`scripts/modules/core-systems.js` ומשדר `preferences:loaded`.
  - איסור על `preferences.js` הישן ואתחולי Preferences נקודתיים בעמודים.
  - אפיון: `documentation/02-ARCHITECTURE/FRONTEND/UNIFIED_INITIALIZATION_SYSTEM.md`, `documentation/02-ARCHITECTURE/FRONTEND/PAGE_STRUCTURE_TEMPLATE.md`.

- שימוש במערכות כלליות בלבד (ללא כפילויות עמודיות)
  - SelectPopulatorService – ברירות מחדל, `defaultFromPreferences`, `defaultText`:
    - קוד: `trading-ui/scripts/services/select-populator-service.js`
    - אפיון: `documentation/frontend/SERVICES_ARCHITECTURE.md`
  - DefaultValueSetter – קביעת ברירות מחדל בטפסים:
    - קוד: `trading-ui/scripts/services/default-value-setter.js`
    - אפיון: `documentation/frontend/SERVICES_ARCHITECTURE.md`
  - CRUDResponseHandler – טיפול שמירה/עדכון אחיד:
    - קוד: `trading-ui/scripts/services/crud-response-handler.js`
    - אפיון: `SERVICES_TESTING_GUIDE.md`
  - UnifiedCacheManager – מטמון 4 שכבות:
    - קוד: `trading-ui/scripts/modules/cache-module.js`
    - אפיון: `CACHE_IMPLEMENTATION_GUIDE.md`
  - Translation Utils – מיפוי ערכים עברית/אנגלית:
    - קוד: `trading-ui/scripts/translation-utils.js`

- אחידות UI ותהליכים
  - מודלים: שימוש ב־`bootstrap.Modal.getOrCreateInstance(element)` בלבד.
  - סדר כפתורי מודל: "ביטול" → "שמירה/עדכון" בכל המודלים.
  - טפסי הוספה: פתיחה ריקה (ללא placeholders סטטיים).
  - מיון ברירת מחדל: עמודת תאריך בסדר יורד (חדש ראשון) בלי לדרוס מצב סידור שמור (`applyDefaultSort`).

---

### 2) רשימת עמודים (משתמשים תחילה → כלי פיתוח)

- עמודי משתמש (13):
  - alerts.html, cash_flows.html, executions.html, notes.html, preferences.html, tickers.html, trade_plans.html, trades.html, trading_accounts.html, db_display.html, db_extradata.html, notifications-center.html, constraints.html

- עמודי כלי פיתוח:
  - system-management.html, server-monitor.html, crud-testing-dashboard.html, external-data-dashboard.html, css-management.html, linter-realtime-monitor.html, cache-test.html, research.html (דמה), index.html (דמה), js-map.html (עזר), designs.html, chart-management.html, dynamic-colors-display.html, background-tasks.html

---

### 3) סעיפי ביצוע ממוספרים (עם דוגמאות בעיה→פתרון)

1) מודלים לא נפתחים / ReferenceError על modal
- **בעיה**: קריאה ל־Bootstrap Modal עם משתנה `modal` לא מוגדר, לדוגמה: `new bootstrap.Modal(modal)`.
- **פתרון**: לעבוד עם מופע מאוחסן מראש או `bootstrap.Modal.getOrCreateInstance` על אלמנט קונקרטי.
- **יישום**:
  - לאתחל מופעי מודל גלובליים בשלב האתחול המאוחד (`UnifiedAppInitializer`).
  - בפונקציות פתיחה להשתמש במופע הקיים או ב־`getOrCreateInstance(element)` ורק אז `show()`.

2) טעינת ברירות מחדל ל־selectים (הוספה): חשבון מסחר ומטבע
- **בעיה**: בחלון הוספה לא נבחר חשבון ברירת מחדל לפי העדפות.
- **פתרון**: להשתמש ב־`SelectPopulatorService.populateAccountsSelect`/`populateCurrenciesSelect` עם `defaultFromPreferences: true` ובמידת הצורך לחזק עם `DefaultValueSetter.setPreferenceValue`.
- **דוגמה (tickers – מטבע ברירת מחדל)**: `populateCurrenciesSelect('addTickerCurrency', { includeEmpty: true, defaultFromPreferences: true })`.
- **דרישת מקדימה חשובה**: לפני שימוש ב־`defaultFromPreferences`, יש לאתחל את מערכת ההעדפות בעמוד: לטעון `scripts/preferences-core.js` ולהריץ `await window.PreferencesSystem.initialize()` במהלך אתחול הדף.
- **הערות**: העיקרון – קודם טעינת אופציות, ואז הצבה/בחירה בערך ברירת מחדל.

3) טעינת ערכי select במודל עריכה – מעבר מהתבססות על מזהים לשמות
- **בעיה**: ה־API עשוי להחזיר שם חשבון ומטבע (שם/סימול) במקום מזהי ID. בחירה לפי ID גורמת לשדות להישאר ריקים.
- **פתרון**: הרחבת `SelectPopulatorService` לתמיכה ב־`defaultText`, ובמודל עריכה לבחור לפי טקסט האופציה ולא לפי מזהה.
- **יישום**:
  - `SelectPopulatorService._populateSelect(...)` תומך ב־`defaultText`: אם הועבר, בוחר את ה־option לפי טקסט.
  - חשבון: להעביר `defaultText` מתוך `account_name`/`account.name`.
  - מטבע: להעביר `defaultText` בפורמט התואם לייצוג בטקסט האופציות (למשל: "שם (קוד/סימול)").

4) שדות חבויים במודל עריכה
- **בעיה**: שמירה נכשלת בגלל `id` ריק (למשל URL `.../null`).
- **פתרון**: לוודא קיום `input type="hidden"` עבור מזהים נדרשים, כגון `edit<Entity>Id`, `edit<Entity>ExternalId`.

5) מיפוי שם→מזהה בשמירה (Fallback)
- **בעיה**: גם אם בחרנו לפי טקסט, בעת שמירה נדרש מזהה (`*_id`) ל־PUT/POST.
- **פתרון**: אם הערך הנבחר אינו מכיל מזהה, לבצע מיפוי לפי טקסט:
  - לטעון רשימת הישויות הרלוונטית מה־API (`/api/trading-accounts/` וכו').
  - למצוא Entity לפי שם האופציה (טקסט) ולהציב את ה־`id` ל־payload.
- **טיפ**: השאירו את ערך ה־value של האופציות כ־ID כאשר זה אפשרי; `defaultText` משמש רק לבחירה הראשונית.

6) איסור מילוי אוטומטי של שער דולר במודלי תזרימי מזומנים
- **בעיה**: מילוי אוטומטי של `usd_rate` אינו משקף בהכרח את השער ביום התזרים.
- **פתרון**: לא לבצע auto-fill; לאפשר עריכה ידנית בלבד. להסיר מאזיני onchange שמושכים שער.

7) סדר כפתורים במודל – אחידות מערכתית
- **בעיה**: במודלים רבים סדר הכפתורים הפוך.
- **פתרון**: הסדר התקני הוא: "ביטול" ואז "שמירה/עדכון" בכל המודלים.
- **בדיקה**: לעבור על כל עמודי היישותים ולוודא שה־HTML של ה־footer תואם.

8) מיון טבלת ברירת מחדל
- **בעיה**: ברירת המחדל הציגה תאריך ישן ראשון.
- **פתרון**: ברירת מחדל: מיון לפי תאריך בסדר יורד (חדש ראשון), מבלי לדרוס מצב סידור שמור.
- **יישום**: בפונקציה הגלובלית `applyDefaultSort(tableType, data, updateFunction)`
  - לקבוע לעמודות הזמן המתאימות איפוס מצב ל־`asc` ואז קריאה ל־sort כדי שיתקבל `desc` בפועל, ואז לשמור מצב.

9) טיפול בשגיאות שמירה / עדכון אחיד
- **בעיה**: הודעות שגיאה לא עקביות / לא ממופות לשדות.
- **פתרון**: שימוש ב־`CRUDResponseHandler.handleSaveResponse / handleUpdateResponse` עם `customValidationParser` למיפוי הודעות שגיאה לשדות טופס.

10) בדיקות רגרסיה מומלצות אחרי תיקון
- פתיחת מודל (הוספה/עריכה) ללא שגיאות קונסול.
- וידוא טעינת selectים: בחירה אוטומטית לפי העדפות (בהוספה) ולפי שם הרשומה (בעריכה).
- בדיקת שמירה/עדכון: ה־payload כולל מזהי `*_id` כנדרש, ה־API מחזיר 200/201.
- טבלת נתונים: מסודרת כברירת מחדל (חדש ראשון), ושומרת מצב סידור בחזרות.
- סדר כפתורים במודלים: "ביטול" ואז "שמירה/עדכון".

11) To-Do קצר ליישום בעמוד נוסף
- לאתר selectים לישות חשבון/מטבע/וכו' ולשנות את מילוי ברירת המחדל ל־`defaultText` לפי שם.
- בהוספה: להשתמש ב־`defaultFromPreferences: true` ב־SelectPopulatorService (למשל מטבע/חשבון).
- להוסיף שדות `hidden` למזהים במודל עריכה אם חסרים.
- בשמירה: אם מזהה חסר – לגזור מזהה לפי שם האופציה.
- לאכוף סדר כפתורי מודל.
- לעדכן מיון ברירת מחדל של הטבלה בלי לדרוס מצב שמור.
- להפעיל `CRUDResponseHandler` עם parser לשגיאות ולידציה.

הערות כלליות
- שמרו על ארכיטקטורת הטעינה המאוחדת (`UnifiedAppInitializer`) ולא להוסיף מאזיני DOMContentLoaded פרטניים.
- השתמשו במערכות הכלליות הקיימות: `SelectPopulatorService`, `DefaultValueSetter`, `CRUDResponseHandler`, `UnifiedCacheManager`.
- שמרו עקביות טקסט האופציות ב־select בין השירות שממלא לבין הטקסט שמגיע מהשרת (שם + קוד/סימול).

12) Cash Flows – פירוט בעיות → פתרונות לכל שדה חשוד

- בעיה (type): רשימת סוגי התזרים בטופס חלקית/לא עדכנית; תצוגה בעברית אך שמירה באנגלית.
  - פתרון: לעדכן את האופציות בטפסים לערכים באנגלית עם תווית בעברית:
    - deposit=הפקדה, withdrawal=משיכה, fee=עמלה, dividend=דיבידנד,
      transfer_in=העברה מחשבון אחר, transfer_out=העברה לחשבון אחר,
      other_positive=אחר חיובי, other_negative=אחר שלילי.
    - להצגה: להשתמש ב־`translateCashFlowType(type)`.

- בעיה (source): ערכי מקור מגוונים; UI בעברית, שמירה באנגלית.
  - פתרון: להשתמש בערכים: manual, file_import, direct_import, api.
    - להצגה: `translateCashFlowSource(source)` ממפה: ידני / יבוא קובץ / יבוא ישיר / API.

- בעיה (account): ה־API עשוי להחזיר שם חשבון במקום מזהה → ה־select לא נבחר, והשמירה נכשלת ללא id.
  - פתרון: בטעינה להשתמש ב־`SelectPopulatorService.populateAccountsSelect` עם `defaultText` (שם החשבון).
    - בשמירה: אם `trading_account_id` חסר, למפות לפי שם נבחר ל־id דרך `/api/trading-accounts/`.

- בעיה (currency): בחירה על בסיס שם/סימול, לא תמיד יש `currency_id`.
  - פתרון: בטעינה להשתמש ב־`populateCurrenciesSelect` עם `defaultText` בפורמט "שם (קוד/סימול)".
    - אין לבצע auto-fill ל־usd_rate (ראה סעיף הבא).

- בעיה (usd_rate): מולא אוטומטית ולא מייצג בהכרח את שער יום התזרים.
  - פתרון: להסיר מילוי אוטומטי; שדה נשאר ידני בלבד; לוודא ולידציה שהערך חיובי ומספרי.

- בעיה (hidden ids): חסר `editCashFlowId`/`editCashFlowExternalId` → PUT עם `null`.
  - פתרון: להוסיף 2 שדות hidden ולוודא שה־id מוזן לפני שליחת הבקשה.

- בעיה (מיון ברירת מחדל): הטבלה נטענת ישן→חדש.
  - פתרון: `applyDefaultSort('cash_flows', ...)` ממוין לפי תאריך בסדר יורד (חדש ראשון), בלי לדרוס מצב שמור.

- בעיה (סדר כפתורים במודלים): סדר הפוך בחלק מהעמודים.
  - פתרון: אחיד – כפתור "ביטול" קודם, אחריו "שמירה/עדכון".

- בעיה (שגיאות ולידציה): הודעות לא ממופות לשדות.
  - פתרון: להשתמש ב־`CRUDResponseHandler` עם `customValidationParser` למיפוי הודעות DB לשדות (type/source/amount/usd_rate/account_id).



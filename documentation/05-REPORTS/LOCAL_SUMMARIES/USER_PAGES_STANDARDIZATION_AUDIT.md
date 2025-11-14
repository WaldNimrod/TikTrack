# דו\"ח אודיט עמודי משתמש – סטנדרטיזציית CRUD ומטמון

## תקציר
- סריקה מקיפה הושלמה לכל העמודים שהוגדרו ב`documentation/PAGES_LIST.md`, תוך הצלבה עם מערכות כלליות ב`documentation/frontend/GENERAL_SYSTEMS_LIST.md`.
- העמודים Trades, Trade Plans, Tickers ו-Tag Management עומדים במלוא הדרישות (שירותי נתונים ייעודיים, `UnifiedCacheManager`, `CRUDResponseHandler`, `ModalManagerV2`, `TagService`).
- Dashboard, Alerts ו-Preferences משתמשים ברוב המערכות אך נדרשת השלמת שירותי נתונים/סנכרון מטמון עבור פעולות משניות.
- Executions, Trading Accounts, Cash Flows, Notes, Data Import, DB Display ו-DB Extra Data עדיין מבצעים `fetch` ישיר, ללא `CacheTTLGuard` וללא שימוש מלא ב-`CRUDResponseHandler`, ויוצרים דפוסי אי-עמידה שחוזרים על עצמם.
- Research מפר הפרדה נתונים/תצוגה (הזרמת נתונים מדומים), בניגוד ל-Rule 48.

## טבלת סטטוס (עמודות = סעיפים מרכזיים)
| עמוד | Data Service + Cache | CRUD + Refresh | מערכות כלליות | חריגות / תיעוד | בדיקות לאחר תיקון |
| --- | --- | --- | --- | --- | --- |
| Dashboard (`index.html`, `scripts/index.js`) | ⚠️ טעינה מרובת `fetch` ישיר (`/api/trades`, `/api/alerts`, `/api/trading-accounts`, `/api/cash-flows`) ללא שירות נתונים מרוכז; יש `CacheTTLGuard` אך ללא `clearByPattern` אחרי פעולות CRUD. | ⚠️ פעולות `quickAction` ו-`refreshOverview` עוקפות `handleApiResponseWithRefresh`; נדרשת הזרמת `CRUDResponseHandler` כפי שנעשה בטיקרים. | ✅ משתמש ב-`FieldRendererService`, `NotificationSystem`, `UnifiedTableSystem`. | לתעד הקמת `dashboard-data-service.js` + חיבור ל-`PAGE_CONFIGS.dashboard`. | בדיקת רענון גרפים לאחר CRUD בטיקרים/חשבונות; אימות TTL באמצעות שינוי ידני בבסיס הנתונים. |
| Trades | ✅ `trading-ui/scripts/services/trades-data.js` עם `UnifiedCacheManager` (מפתח `trades-data`) ו-`CacheSyncManager`. | ✅ כל פעולות CRUD עוברות דרך `CRUDResponseHandler` ו-`handleApiResponseWithRefresh`, כולל `checkLinkedItemsAndPerformAction`. | ✅ `ModalManagerV2`, `TagService`, `LinkedItemsService`. | תיעוד קיים ב-`documentation/05-REPORTS/LOCAL_SUMMARIES/TRADE_PAGES_STANDARDIZATION_GAP_ANALYSIS.md`. | להריץ ביטול/עדכון/מחיקה ולוודא ריענון טבלה + ניקוי מטמון (בדיקת שכבות UCM). |
| Trade Plans | ✅ `trading-ui/scripts/services/trade-plans-data.js`, מפתח `trade-plans-data`, TTL דרך `CacheTTLGuard`. | ✅ CRUD דרך `CRUDResponseHandler`, `window.cancelItem`, `checkLinkedItemsAndPerformAction`. | ✅ אינטגרציה מלאה עם `ModalManagerV2`, `TagService`. | עודכן באותו דו\"ח סטנדרטיזציה. | להריץ ביטול/שכפול + וידוא `clearByPattern('trade-plans-data')` (קונסולה). |
| Executions | ❌ `loadExecutionsData` מבצע `fetch('/api/executions/?_t=Date.now()')` ישיר, ללא שירות `executions-data.js` וללא שימוש במפתח UCM. | ⚠️ CRUD חלקיים עוברים דרך `CRUDResponseHandler`, אך ניקוי מטמון מבוצע ידנית וללא `CacheSyncManager`; אין `handleApiResponseWithRefresh`. | ⚠️ `ModalManagerV2` קיים אך אין שימוש ב`UnifiedCacheManager` וב`CacheTTLGuard`. | לתעד מעבר ל-`services/executions-data.js` + `invalidate_cache` בצד השרת. | בדיקת ביטול ביצוע + טעינת טיקר קשור; מעקב דפוסי טעינה לאחר ניקוי מטמון (צפייה ב-UCM). |
| Alerts | ✅ `alerts-data` מנוהל דרך `alert-service.js`, `UnifiedCacheManager`, `CacheTTLGuard`. | ✅ דוגמטית (`CRUDResponseHandler`, `handleError`, ריענון טבלה). | ✅ `ModalManagerV2`, `TagService`, `LinkedItemsService`. | להשלים Reference ב-`documentation/04-FEATURES/CORE/alerts-system/ALERTS_SYSTEM.md` לתהליך הסנכרון העדכני. | להריץ יצירה/עריכה/מחיקה + וידוא Invalidations (לוגי unified cache). |
| Tickers | ✅ `services/tickers-data.js` + `UnifiedCacheManager` (`tickers-data`). | ✅ `CRUDResponseHandler`, `handleApiResponseWithRefresh`, `clearByPattern`. | ✅ כל המערכות הכלליות (Modal, Tags, Header). | מהווה דוגמה רשמית (אוזכרה בהשוואה). | להריץ CRUD מלא ולהשוות זמני טבלה מול מדדים קיימים (Baseline). |
| Trading Accounts | ❌ `loadTradingAccountsData` מבצע `fetch('/api/trading-accounts/?_t=...')` ישיר; אין שירות `trading-accounts-data.js` ואין מפתח UCM. | ⚠️ משתמש חלקית ב`CRUDResponseHandler`, אך מחיקות/ביצועי `POST` לא מנקים מטמון. | ⚠️ שימוש ב-`ModalManagerV2` חלקי; אין איחוד עם `LinkedItemsService`. | לתעד מעבר מלא לשירות נתונים + קישור ל-`CacheSyncManager` (`accounts-data`). | בדיקת יצירת חשבון + טעינת יתרות; וידוא שכבות מטמון וסטטיסטיקות. |
| Cash Flows | ❌ `loadCashFlowsData` מבצע `fetch` עם לוגים ידניים, ללא שירות נתונים וללא מפתח UCM. | ⚠️ CRUD עובר דרך `fetch` + `CRUDResponseHandler` חלקי; אין `handleApiResponseWithRefresh`. | ⚠️ מודלים ו-Notifications קיימים אך לא נעשה שימוש ב`checkLinkedItemsBeforeAction`. | לתעד יצירת `cash-flows-data.js` + אחידות עם `tickers`. | בדיקת עדכון תזרים → וידוא שהטבלה מסתנכרנת בלי רענון ידני. |
| Notes | ⚠️ שימוש ב-`UnifiedCacheManager.remove('notes')` (שם מפתח שגוי, חסר `notes-data`). | ✅ CRUD דרך `CRUDResponseHandler`, אבל מטמון לא מסונכרן עם `CacheSyncManager`. | ✅ `ModalManagerV2`, `TagService`, `LinkedItems`. | לעדכן מפתח מטמון תקני ולהגדיר שירות `notes-data`. | בדיקת שמירת הערה + עדכון תגיות, וידוא שהנתונים נטענים מחדש ללא רענון. |
| Research | ❌ אין קריאת נתונים אמיתית; `loadResearchData`, `analyzeMarketTrends` וכו' מפעילים `setTimeout` וסימולציות – מפר Rule 48. | ❌ אין CRUD אמיתי; אין `CRUDResponseHandler`. | ⚠️ רק NotificationSystem. | חובה לחבר לנתוני אמת (DB או שירות קיים) או להציג הודעת שגיאה אם נתונים אינם זמינים. | לאחר החיבור ל-API, להריץ בדיקת נתונים (טעינת סקירה, חדשות, אנליטיקות). |
| Preferences | ⚠️ `preferences-core-new.js` משתמש ב-`UnifiedCacheManager` אך `fetch` מתבצע מתוך הלוגיקה עצמה; חסרים שירותים מודולריים לכל Resource (types, defaults, user profiles). | ⚠️ שמירה עוטפת `fetch` ישיר; `CRUDResponseHandler` לא בשימוש (כיוון שמופעלת מערכת ייעודית). | ✅ NotificationSystem, Modal/Lazy Loader. | לתעד מפה בין endpoints לשירותים (לדוגמה `preferences-service.js`) + חיבור ל-`CacheSyncManager`. | להריץ שמירה לפרופילים שונים, לוודא ש-`updated_at` מקודם ושגרסת ההעדפות ב-`/api/preferences/version` מתעדכנת. |
| Data Import | ❌ כל הקריאות (`API_ENDPOINTS.accounts`, `history`) מתבצעות ישירות בקובץ `data_import.js`; אין שימוש במפתח UCM. | ⚠️ אין `CRUDResponseHandler`; פעולות רענון ייחודיות שלא מסונכרנות עם Cache Sync. | ⚠️ משתמש ב-NotificationSystem אך לא ב-ModalManagerV2. | להגדיר `data-import-service.js` + שימוש ב-`CacheTTLGuard` לפי קובץ המניפסט. | לבצע רענון היסטוריה + בדיקת סשן ייבוא חדש לאחר מעבר לשירות נתונים. |
| DB Display | ❌ `db_display.js` טוען כל טבלה באמצעות `fetch('/api/${tableType}/')` בלי Cache/Services. | ❌ אין שימוש במנגנוני CRUD אחידים או ב-`handleApiResponseWithRefresh`. | ⚠️ מסתמך על console בלבד, ללא NotificationSystem. | נדרש לחבר למערכת קריאות כללית (למשל `SystemDiagnosticsService`) ולתעד מתווה חדש. | בדיקת טעינת כל טבלה + הבטחת טיפול בשגיאות דרך NotificationSystem. |
| DB Extra Data | ❌ זהה ל-DB Display (`fetch('/api/${apiSlug}/')`), ללא Cache/Services/TTL. | ❌ אין CRUD Handler. | ⚠️ רק console. | לאגד שני העמודים לאותו שירות כללי עם טיפול במטמון. | בדיקת תצוגת Extra Data לאחר המעבר למערכת הכללית. |
| Tag Management | ✅ נשען על `TagService.fetchCategories/fetchTags/getAnalytics`, משתמש ב-UCM דרך השירות. | ✅ CRUD מנוהל על ידי `TagService` + מודלי Tag. | ✅ `ModalManagerV2`, `TagEvents`, `UnifiedTableSystem`. | להשלים תיעוד Cross-link ל-`documentation/04-FEATURES/CORE/tags/TAG_MANAGEMENT.md` (אם חסר). | להריץ טעינת קטגוריות/תגיות + מחיקת תגית לווידוא `refreshAll`. |

## דפוסים חוזרים והצעה לעבודה רוחבית
1. **חוסר בשכבת שירות נתונים ייעודית** – Executions, Trading Accounts, Cash Flows, Notes, Data Import, DB Display/Extra Data ורכיבי Dashboard נטענים דרך `fetch` מקומי. מומלץ להרחיב את קטלוג השירותים ב-`trading-ui/scripts/services/` (לפי דוגמת `trades-data.js`) ולהוסיף את המפתחות ל-`unified-cache-manager.js` וכן ל-`CacheSyncManager`.
2. **ניקוי מטמון ידני ולא מתואם** – שימוש ב-`remove('notes')` או `clearByPattern` פרטני בלי `CacheTTLGuard.ensure` או `invalidate_cache` בצד השרת מוביל לחוסר עקביות. יש להגדיר מפתחות סטנדרטיים לכל ישות ולחבר את ה-CRUD ל-`handleApiResponseWithRefresh`.
3. **לוגים ידניים ב-Console** – בעמודי Cash Flows, DB Display ו-DB Extra Data קיימת תלות ב-`console.log` במקום ב-`Logger` ובמערכת ההתראות. יש להחליף בלוגים סטנדרטיים ולשמור על UX אחיד.
4. **נתונים מדומים (Research)** – יש להפסיק שימוש ב-`setTimeout` המדמה API. במידה ואין מקור אמת, להציג למשתמש הודעת \"לא זמין\" עם הנחיות (בהתאם ל-Rule 48).
5. **היעדר תיעוד קונקרטי** – עבור העמודים שאינם עומדים בסטנדרט (Executions, Trading Accounts, Cash Flows וכו') יש לעדכן את `documentation/05-REPORTS/LOCAL_SUMMARIES/` עם תוכניות פעולה ספציפיות, כך שכל צוות מקבל חבילת משימות מתואמת.

### חלוקת עבודה מוצעת לצוותים
- **צוות נתונים**: בניית `*-data.js` לכל העמודים החסרים (Executions, Trading Accounts, Cash Flows, Notes, Data Import, DB Display, DB Extra Data, Dashboard). 
- **צוות Frontend CRUD**: הטמעת `handleApiResponseWithRefresh` ו-`CRUDResponseHandler` בכל הפעולות, כולל שילוב עם `checkLinkedItemsAndPerformAction`.
- **צוות תיעוד ובדיקות**: עדכון דוקומנטציה (Index, Reports) + כתיבת רשימות בדיקה ייעודיות לכל עמוד; אחריות על בדיקות רגרסיה לאחר כל גל הסבה.

## בדיקות לאחר תיקון (Regression Checklist)
1. **בדיקות CRUD מלאות**: יצירה/עריכה/ביטול/מחיקה ב-Trading Accounts, Cash Flows, Executions, Notes – לוודא שהטבלה מתעדכנת מיד ללא רענון דף.
2. **וולידציית מטמון**: להפעיל `window.UnifiedCacheManager.inspect('page-key')` בקונסולה עבור כל עמוד לאחר CRUD כדי לוודא שהמפתח מתאפס ונטען מחדש דרך `CacheTTLGuard`.
3. **Header & Filter Integration**: להפעיל פילטרים גלובליים בכל עמוד מרכזי ולוודא שהסטטוס נשמר בין ניווטים (PageStateManager + Unified Header).
4. **בדיקות תיעוד**: לוודא שכל שינוי קוד מגובה בקישור לדוקומנטציה (`documentation/05-REPORTS/...`) לפי כללי הפרויקט.

התוצרים לעיל מהווים בסיס ישיר לשלב הסטנדרטיזציה הרחב ולחלוקת המשימות בין הצוותים.


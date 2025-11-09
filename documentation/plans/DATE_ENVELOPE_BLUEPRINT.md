# Date Envelope Timezone Alignment Blueprint

## 🎯 מטרות והיקף
- מגדירים פורמט אחיד לניהול תאריכים (DateEnvelope) שמשרת את כלל שכבות המערכת.
- מוודאים שאחסון הנתונים נשאר ב־UTC, אך ממשקי המשתמש מקבלים זמני ברירת מחדל לפי איזור הזמן של המשתמש.
- מצמצמים המרות אד־הוק ויוצרים שכבת שירות מרכזית לשימוש חוזר בכל מערכות הליבה (API, מטמון, טבלאות, פילטרים, Header System, Unified Initialization).

## 🔍 ממצאי סריקה – מצב קיים (פברואר 2026)
### Backend – אחסון ומודלים
- `BaseModel.created_at` נשמר ללא `timezone=True`; הערכים מתקבלים מ־`func.now()` (SQLite) ולכן חסרי TZ מפורש.
- מודלים כגון `Trade.closed_at`, `Trade.cancelled_at`, `TradePlan.cancelled_at`, `Execution.date`, `Alert.triggered_at`, `ImportSession.completed_at` משתמשים ב־`datetime.utcnow()`/`datetime.now()` ומוחזרים כ־strftime ללא TZ.
- מודלים בתחום הנתונים החיצוניים (`MarketDataQuote.asof_utc`, `DataRefreshLog.start_time`, `IntradayDataSlot.slot_start_utc`) כן מוגדרים עם `timezone=True`, אך קיימת הטרוגניות בתוך אותה ישות (שדות אחרים ללא TZ).

### Backend – שירותים ו־API
- מחלקת `DateNormalizationService` הוטמעה מחדש בכל ה־Blueprints הקריטיים: `alerts`, `executions`, `trade_plans`, `trading-accounts`, `trades`, `cache_management`. כל ה־responses וה־errors כוללים כעת `timestamp` מסוג DateEnvelope, וכל `POST/PUT` עוברים דרך `normalize_input_payload`.
- המודלים `Trade`, `Execution`, `Alert`, `TradePlan`, `CashFlow` ועוד מחזירים כעת datetime מקוריים (ללא strftime), כך שהשכבה הכללית אחראית על ההמרה ל־DateEnvelope.
- מתודות שירות מבוססות SQLAlchemy משתמשות ב־DateEnvelope דרך שכבת ה־API במקום `fromisoformat` ידני. הקוד הישן הוסר מהבדיקות.
- משימות רקע ומערכות מטמון טרם עברו ריענון מלא; בהמשך יש להתאים את ה־loggers וה־cache changes כך שיספקו Envelope במקום מחרוזות.

### Frontend – שימושי תאריך בולטים
- `date-utils.js` כבר תומך ב־DateEnvelope (`isDateEnvelope`, `toDateObject`, `getEpochMilliseconds`, `buildDisplayString`). בהטמעה האחרונה וידאנו התאמה מלאה לאEnvelope היוצאים מה־API.
- המערכות הכלליות יועברו להסתמך על פונקציות אלו – נדרש עדיין סבב התאמות ל־`tables.js`, `table-mappings.js` ו־`FieldRendererService` שעדיין משתמשים ב־`new Date`.
- Unified Cache Manager ושאר הכלים עדיין משלימים ריענון, אך יש כעת תשתית ב־date-utils לצרוך envelopes בקלות.

### מערכות כלליות – סטטוס עדכני
| מערכת | מיקום קובץ | שימוש נוכחי בזמן | הערות אינטגרציה |
|-------|-------------|------------------|------------------|
| Unified Cache / Advanced Cache | `trading-ui/scripts/unified-cache-manager.js`, `Backend/services/advanced_cache_service.py` | עדיין נשמר כמחרוזת ISO | יעודכן לשימוש ב־`epochMs`/Envelope בסבב הבא. |
| Unified Initialization System | `trading-ui/scripts/modules/core-systems.js`, init bundles | משתמש ב־ISO strings בתיעוד לוגים | מחכה לתיאום לאחר מעבר מלא של header/filter. |
| Table System + Sorting | `trading-ui/scripts/tables.js`, `table-mappings.js` | נמצא בשלבי הסבה ל־Envelope | צריך לעדכן את מנוע המיון להשתמש ב־`getEpochMilliseconds`. |
| Filter System + Header | `header-system.js`, `translateDateRangeToDates` | פונקציות הליבה יודעות לקבל Envelope | יש להשלים שליחת Envelope חזרה ל־API בעת ריענון נתונים. |
| Notification / Modal / Logging | `modal-manager-v2.js`, Logger | עדיין `new Date().toISOString()` | יוסב לאחר הטמעת cache & header. |

### דוקומנטציה ובדיקות קיימות
- `DATE_UTILITIES_SYSTEM.md`, `EXTERNAL_DATA_INTEGRATION_SPECIFICATION`, `TABLE_MAPPING_SYSTEM.md`, `TABLE_SORTING_SYSTEM.md`, `GENERAL_SYSTEMS_LIST.md` – כולם לא מעודכנים ל־DateEnvelope.
- אין כרגע בדיקות (unit/integration/UI) שמכסה את הזרימה המלאה: הזנה מקומית → נירמול → DB → החזרה ל־UI עם envelope.

## 📦 פורמט DateEnvelope
```json
{
  "utc": "2025-11-09T09:30:00Z",
  "epochMs": 1731144600000,
  "local": "2025-11-09T11:30:00+02:00",
  "timezone": "Asia/Jerusalem",
  "display": "09/11/2025 11:30"
}
```
- `utc` – הערך שנשמר ב־DB, משמש גם ל־backward compatibility.
- `epochMs` – בסיס חישובי/מיון/פאגינציה בכל שכבות ה־UI והמטמון.
- `local` – הערך המקומי עפ״י העדפת המשתמש (IANA timezone) להאכלת רכיבי UI ללא המרות נוספות.
- `display` – טקסט מוכן לשימוש; ניתן לייצר דינמית דרך `date-utils` אם נעדיף למנוע כפילות.
- ניתן להוסיף `sourceTimezone` / `marketTimezone` עבור נתוני שוק (NYSE וכד׳) במידת הצורך.

### כללי ברירת מחדל לקלט
1. כל זמן שמגיע מה־UI נחשב כברירת מחדל כ-local timezone של המשתמש.
2. `DateNormalizationService.normalize_input_payload()` ממיר ל־UTC (ללא tzinfo) לפני כתיבה למסד הנתונים.
3. ה־API מחזיר DateEnvelope כברירת מחדל; ניתן להשבית עבור אינטגרציות Legacy באמצעות פרמטר (למשל `?envelope=false`).

## 🛠️ תכנית אינטגרציה מעודכנת
### 1. audit-datetime-usage
- להשלים טבלת מיפוי (Backend/Frontend) – תיעוד המרות ידניות, `strftime`, שימוש ב־`datetime.utcnow`.
- לאסוף חריגות לשדות DB ללא `timezone=True` ולציין היכן דרוש טיפול עתידי (מיגרציות).
- לתעד היכן DateEnvelope כבר בשימוש (BaseEntity, Trades/Executions GET) לעומת מקומות שחסרים (כל שאר ה־Blueprints, משימות רקע, לוגים).

### 2. backend-date-envelope
- להשתמש ב־`DateNormalizationService` הקיים ולהרחיבו: 
  - הזרקת normalizer בכל ה־Blueprints (`trade_plans`, `alerts`, `notes`, `preferences`, `external_data`, `system_overview`, `cache_changes`, `user_data_import`).
  - שימוש ב־`normalize_input_payload` בקבלת POST/PUT/PATCH (כולל וידוא שמירה ב־UTC נקי).
  - אינטגרציה עם משימות רקע/שירותי מטמון כדי ש־envelope יועבר גם ללוגים ומתן ממשק אחיד למסדי נתונים (CacheChangeLog, BackgroundTasks API).

### 3. documentation-blueprint (מסמך זה)
- המסמך יעודכן לאורך הפרויקט: 
  - הוספת תרשימי זרימה: *User Input → API → Normalizer → DB* ו-*DB → Service → Envelope → UI Renderer*.
  - הפניות לקבצים שיתעדכנו בכל שלב.
  - רשימת תאימות לאחור (לדוגמה: החזרת `utc` כמחרוזת לצרכנים קיימים).

### 4. frontend-integration
- הרחבת `date-utils` לתמוך ב־DateEnvelope: 
  - `parseDate`, `formatDate`, `formatDateTime`, `translateDateRangeToDates` יקבלו envelope או raw ויעבדו לפי `timezone` מהעדפות.
- התאמת מערכות כלליות:
  - **Table Sorting** – שימוש ב־`epochMs` למיון במקום `new Date`.
  - **Filters/Header** – שליחת envelopes או לפחות {local, timezone} ולבצע הידור אחיד בעת שליחה ל־API.
  - **UnifiedCacheManager / Core Systems** – שמירת timestamps כ־envelope (או לפחות `{utc, epochMs}`) עבור היסטוריה ומטמון.
  - **Notification / Modals / Logs** – אחסון envelopes לצורך הצגה ועקיבות.

### 5. system-sync-tests-docs
- **Backend**: בדיקות יחידה ל־DateNormalizationService, בדיקות אינטגרציה ל־Endpoints (create/update/get) עם אזורי זמן שונים, בדיקות לרענון מטמון/לוגים.
- **Frontend**: בדיקות יחידה/אוטומציה למיון טבלאות, פילטרי תאריך, עמודי דשבורדים. וידוא שה־Header filter שומר מצב עם envelope.
- **דוקומנטציה**: עדכון הקבצים הבאים בסיום כל שלב:
  - `frontend/DATE_UTILITIES_SYSTEM.md`
  - `02-ARCHITECTURE/FRONTEND/TABLE_SYSTEM_ANALYSIS.md`
  - `02-ARCHITECTURE/FRONTEND/TABLE_SORTING_SYSTEM.md`
  - `frontend/GENERAL_SYSTEMS_LIST.md` (הכללת DateNormalizationService/DateEnvelope כסיסטם כללי)
  - `EXTERNAL_DATA_INTEGRATION_SPECIFICATION.md`, `CACHE_*`, `HEADER_SYSTEM` ועוד לפי הצורך.

## 🧪 בדיקות והבטחת איכות
- **Unit**: נוספו בדיקות עדכניות ל־`DateNormalizationService`, מודלים (Trade/Alert), וסרביסים כדי לאמת ש-envelopeים נשמרים לאורך השרשרת.
- **Integration**: הוחלפו בדיקות ה־import legacy בבדיקות smoke שמוודאות ש־connectors מחזירות Envelope והנורמליזציה שומרת על המבנה.
- **UI Automated**: Sorting/Filtering עם נתונים אמיתיים, התמדה של מצב הפילטר הראשי והאיצ׳ול (Initialization bundles) – מתוכנן בסבב ההמשך.

## ⚠️ סיכונים ופתרונות מוצעים
- **שדות DB ללא TZ** – המשך אחסון ב־UTC ללא tzinfo ושימוש ב־Envelope להוספת המטא-דאטה. תכנון מיגרציה עתידית להוספת `timezone=True`.
- **אינטגרציות Legacy** – לשמור על השדה `utc` כמחרוזת ולהוסיף דגל `envelope=false` עבור צרכנים ישנים.
- **ביצועים** – מעטפת על רשימות גדולות: לבחון memoization של envelope או שימוש ב־batch normalization בתוך השירות (לדוגמה פונקציה שמבצעת normalize ברמה של queryset).

---
מסמך זה משמש כבסיס מעודכן לפיתוח. בכל שלב נשלים את המיפוי, נעדכן את ההטמעות בפועל ונוסיף הפניות לבדיקות ולדוקומנטציה משלימה. בעת סיום כל משימה בתכנית, יש לחזור למסמך ולסמן את המצב החדש של המערכת.

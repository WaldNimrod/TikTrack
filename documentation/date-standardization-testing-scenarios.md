# תרחישי בדיקה ידנית - סטנדרטיזציה של ניהול תאריכים

## תאריך יצירה: 21 בנובמבר 2025

## סיכום העבודה שבוצעה

### שלב 1: API Endpoints - נרמול תאריכים ב-Backend ✅

תוקנו כל ה-API endpoints שזוהו כחסרי נרמול תאריכים:

- `Backend/routes/api/tickers.py` - `check_linked_items`, `update_active_trades`, `update_ticker_status_auto`
- `Backend/routes/api/plan_conditions.py` - `test_plan_condition`, `validate_plan_condition`, `create_bulk_plan_conditions`, `evaluate_condition`, `evaluate_all_conditions`, `get_evaluation_history`, `create_condition_alert`
- `Backend/routes/api/trade_conditions.py` - `update_trade_condition`, `delete_trade_condition`, `test_trade_condition`, `validate_trade_condition`, `inherit_conditions_from_plan`, `create_bulk_trade_conditions`, `evaluate_condition`, `evaluate_all_conditions`, `get_evaluation_history`
- `Backend/routes/api/users.py` - `update_user`
- `Backend/routes/api/user_data_import.py` - `link_trading_account`

### שלב 2: Frontend - דפים מרכזיים ✅

תוקנו כל הדפים המרכזיים:

- `trading-ui/scripts/trades.js` - שימוש ב-`FieldRendererService.renderDate` ו-`dateUtils`
- `trading-ui/scripts/alerts.js` - שימוש ב-`FieldRendererService.renderDate` ו-`dateUtils`
- `trading-ui/scripts/cash_flows.js` - שימוש ב-`FieldRendererService.renderDate` ו-`dateUtils`
- `trading-ui/scripts/tickers.js` - שימוש ב-`FieldRendererService.renderDate` ו-`dateUtils`
- `trading-ui/scripts/notes.js` - שימוש ב-`FieldRendererService.renderDate` ו-`dateUtils`
- `trading-ui/scripts/trade_plans.js` - שימוש ב-`FieldRendererService.renderDate` ו-`dateUtils`

### שלב 3: קבצים תומכים ✅

תוקנו הקבצים התומכים:

- `trading-ui/scripts/server-monitor.js` - שימוש ב-`FieldRendererService.renderDate` ו-`dateUtils`
- `trading-ui/scripts/widgets/recent-trades-widget.js` - שימוש ב-`FieldRendererService.renderDate` ו-`dateUtils`
- `trading-ui/scripts/validation-utils.js` - שימוש ב-`dateUtils` לוולידציה

## תרחישי בדיקה ידנית

### 1. דף Trades (`/trades`)

#### 1.1 תצוגת תאריכים

- [ ] טעינת הדף - תאריכים מוצגים בפורמט עברי (dd.mm.yyyy)
- [ ] תאריך "נוצר ב:" מוצג נכון לכל trade
- [ ] תאריך "עודכן" מוצג נכון לכל trade (אם קיים)
- [ ] תאריכים null/undefined מוצגים כ-"לא זמין" או "-"

#### 1.2 מיון לפי תאריך

- [ ] מיון לפי "נוצר ב:" - עובד נכון (מהחדש לישן ולהיפך)
- [ ] מיון לפי "עודכן" - עובד נכון (מהחדש לישן ולהיפך)
- [ ] מיון מעורב - מיון לפי תאריך ואז לפי עמודה אחרת

#### 1.3 הוספת Trade

- [ ] פתיחת מודול הוספה
- [ ] שדה תאריך נטען נכון
- [ ] שמירת trade - תאריך יצירה מוצג נכון בטבלה
- [ ] תאריך מוצג בפורמט עברי

#### 1.4 עריכת Trade

- [ ] פתיחת מודול עריכה
- [ ] תאריכים קיימים מוצגים נכון בשדות
- [ ] עדכון תאריך - תאריך מעודכן נכון
- [ ] שמירה - תאריך עדכון מוצג נכון בטבלה

### 2. דף Alerts (`/alerts`)

#### 2.1 תצוגת תאריכים

- [ ] טעינת הדף - תאריכים מוצגים נכון
- [ ] תאריך "נוצר ב:" מוצג נכון לכל alert
- [ ] תאריך "הופעל" מוצג נכון (אם קיים)
- [ ] תאריך "תפוגה" מוצג נכון (אם קיים)
- [ ] תאריך "עודכן" מוצג נכון (אם קיים)

#### 2.2 מיון לפי תאריך

- [ ] מיון לפי תאריך יצירה - עובד נכון
- [ ] מיון לפי תאריך הפעלה - עובד נכון
- [ ] מיון לפי תאריך תפוגה - עובד נכון
- [ ] מיון לפי תאריך עדכון - עובד נכון

#### 2.3 הוספת Alert

- [ ] פתיחת מודול הוספה
- [ ] שדות תאריך נטענים נכון
- [ ] שמירת alert - תאריכים נשמרים נכון
- [ ] תאריכים מוצגים בפורמט עברי

#### 2.4 עריכת Alert

- [ ] פתיחת מודול עריכה
- [ ] תאריכים קיימים מוצגים נכון בשדות
- [ ] עדכון תאריכים - תאריכים מעודכנים נכון
- [ ] שמירה - תאריכים מוצגים נכון בטבלה

### 3. דף Cash Flows (`/cash_flows`)

#### 3.1 תצוגת תאריכים

- [ ] טעינת הדף - תאריכים מוצגים נכון
- [ ] תאריך "תאריך" מוצג נכון לכל cash flow
- [ ] תאריך "עודכן" מוצג נכון (אם קיים)

#### 3.2 מיון לפי תאריך

- [ ] מיון לפי תאריך - עובד נכון
- [ ] מיון לפי תאריך עדכון - עובד נכון

#### 3.3 הוספת Cash Flow

- [ ] פתיחת מודול הוספה
- [ ] שדה תאריך נטען נכון
- [ ] שמירת cash flow - תאריך נשמר נכון
- [ ] תאריך מוצג בפורמט עברי

#### 3.4 עריכת Cash Flow

- [ ] פתיחת מודול עריכה
- [ ] תאריך קיים מוצג נכון בשדה
- [ ] עדכון תאריך - תאריך מעודכן נכון
- [ ] שמירה - תאריך מוצג נכון בטבלה

### 4. דף Tickers (`/tickers`)

#### 4.1 תצוגת תאריכים

- [ ] טעינת הדף - תאריך "עודכן" מוצג נכון (לא N/A)
- [ ] תאריך מוצג בפורמט עברי
- [ ] תאריכים null/undefined מוצגים כ-"N/A"

#### 4.2 מיון לפי תאריך

- [ ] מיון לפי תאריך - עובד נכון

#### 4.3 הוספת Ticker

- [ ] פתיחת מודול הוספה
- [ ] שמירת ticker - תאריך יצירה מוצג נכון
- [ ] תאריך מוצג בפורמט עברי

### 5. דף Notes (`/notes`)

#### 5.1 תצוגת תאריכים

- [ ] טעינת הדף - תאריכים מוצגים נכון
- [ ] תאריך "נוצר ב:" מוצג נכון לכל note
- [ ] תאריך "עודכן" מוצג נכון לכל note

#### 5.2 מיון לפי תאריך

- [ ] מיון לפי "נוצר ב:" - עובד נכון
- [ ] מיון לפי "עודכן" - עובד נכון

#### 5.3 הוספת Note

- [ ] פתיחת מודול הוספה
- [ ] שמירת note - תאריך יצירה מוצג נכון
- [ ] תאריך מוצג בפורמט עברי

#### 5.4 עריכת Note

- [ ] פתיחת מודול עריכה
- [ ] תאריך יצירה מוצג נכון (read-only)
- [ ] שמירה - תאריך עדכון מעודכן נכון
- [ ] תאריך עדכון מוצג נכון בטבלה

### 6. דף Trade Plans (`/trade_plans`)

#### 6.1 תצוגת תאריכים

- [ ] טעינת הדף - תאריכים מוצגים נכון
- [ ] תאריך "נוצר ב:" מוצג נכון לכל trade plan
- [ ] תאריך "עודכן" מוצג נכון (אם קיים)

#### 6.2 מיון לפי תאריך

- [ ] מיון לפי תאריך - עובד נכון

#### 6.3 הוספת Trade Plan

- [ ] פתיחת מודול הוספה
- [ ] שדות תאריך נטענים נכון
- [ ] שמירת trade plan - תאריכים נשמרים נכון
- [ ] תאריכים מוצגים בפורמט עברי

#### 6.4 עריכת Trade Plan

- [ ] פתיחת מודול עריכה
- [ ] תאריכים קיימים מוצגים נכון בשדות
- [ ] עדכון תאריכים - תאריכים מעודכנים נכון
- [ ] שמירה - תאריכים מוצגים נכון בטבלה

### 7. בדיקת Timezone

#### 7.1 תצוגת תאריכים ב-timezone הנכון

- [ ] כל התאריכים מוצגים ב-timezone של המשתמש (Asia/Jerusalem)
- [ ] תאריכים מהשרת מומרים נכון ל-timezone המקומי
- [ ] תאריכים שנשלחים לשרת נשמרים ב-UTC

#### 7.2 בדיקת תאריכים null

- [ ] תאריכים null מחזירים `DateEnvelope` עם `null` values
- [ ] תאריכים null מוצגים כ-"לא זמין" או "-"

### 8. בדיקת API Endpoints

#### 8.1 בדיקת נרמול תאריכים

- [ ] כל endpoint מחזיר `DateEnvelope` תקין
- [ ] תאריכים מוחזרים בפורמט `DateEnvelope` עם `utc`, `epochMs`, `local`, `timezone`, `display`
- [ ] `timestamp` ב-response הוא `DateEnvelope` תקין

#### 8.2 בדיקת endpoints שתוקנו

- [ ] `GET /api/tickers/<id>/linked-items` - מחזיר `DateEnvelope` תקין
- [ ] `PUT /api/tickers/<id>/update-active-trades` - מחזיר `DateEnvelope` תקין
- [ ] `PUT /api/tickers/<id>/update-status-auto` - מחזיר `DateEnvelope` תקין
- [ ] `POST /api/plan-conditions/<id>/test` - מחזיר `DateEnvelope` תקין
- [ ] `POST /api/plan-conditions/validate` - מחזיר `DateEnvelope` תקין
- [ ] `POST /api/plan-conditions/bulk` - מחזיר `DateEnvelope` תקין
- [ ] `POST /api/plan-conditions/<id>/evaluate` - מחזיר `DateEnvelope` תקין
- [ ] `POST /api/plan-conditions/evaluate-all` - מחזיר `DateEnvelope` תקין
- [ ] `GET /api/plan-conditions/<id>/evaluation-history` - מחזיר `DateEnvelope` תקין
- [ ] `POST /api/plan-conditions/<id>/create-alert` - מחזיר `DateEnvelope` תקין
- [ ] `PUT /api/trade-conditions/<id>` - מחזיר `DateEnvelope` תקין
- [ ] `DELETE /api/trade-conditions/<id>` - מחזיר `DateEnvelope` תקין
- [ ] `POST /api/trade-conditions/<id>/test` - מחזיר `DateEnvelope` תקין
- [ ] `POST /api/trade-conditions/validate` - מחזיר `DateEnvelope` תקין
- [ ] `POST /api/trade-conditions/inherit-from-plan` - מחזיר `DateEnvelope` תקין
- [ ] `POST /api/trade-conditions/bulk` - מחזיר `DateEnvelope` תקין
- [ ] `POST /api/trade-conditions/<id>/evaluate` - מחזיר `DateEnvelope` תקין
- [ ] `POST /api/trade-conditions/evaluate-all` - מחזיר `DateEnvelope` תקין
- [ ] `GET /api/trade-conditions/<id>/evaluation-history` - מחזיר `DateEnvelope` תקין
- [ ] `PUT /api/users/<id>` - מחזיר `DateEnvelope` תקין
- [ ] `POST /api/user-data-import/session/<id>/link-account` - מחזיר `DateEnvelope` תקין

### 9. בדיקת תאימות בין Frontend ל-Backend

#### 9.1 תאריכים מהשרת

- [ ] תאריכים מהשרת מוצגים נכון בדפדפן
- [ ] תאריכים מוצגים בפורמט עברי
- [ ] תאריכים מוצגים ב-timezone הנכון

#### 9.2 תאריכים לשרת

- [ ] תאריכים שנשלחים לשרת נשמרים נכון
- [ ] תאריכים מומרים נכון ל-UTC לפני שמירה
- [ ] תאריכים מוצגים נכון לאחר שמירה

### 10. בדיקת קבצים תומכים

#### 10.1 Server Monitor

- [ ] תאריכים בלוגים מוצגים נכון
- [ ] תאריך "לפני X זמן" מוצג נכון
- [ ] תאריכים בלוג מפורט מוצגים נכון

#### 10.2 Recent Trades Widget

- [ ] תאריכים ב-widget מוצגים נכון
- [ ] מיון לפי תאריך עובד נכון

#### 10.3 Validation Utils

- [ ] וולידציה של תאריכים עובדת נכון
- [ ] הודעות שגיאה מציגות תאריכים בפורמט נכון

## הערות חשובות

1. **כל התאריכים** במערכת עוברים דרך הקוד המרכזי:
   - Frontend: `FieldRendererService.renderDate`, `dateUtils`, `window.formatDate`
   - Backend: `DateNormalizationService`, `BaseEntityUtils.normalize_output`

2. **תאריכים null** מוצגים כ-"לא זמין" או "-"

3. **Timezone** - כל התאריכים מוצגים ב-timezone של המשתמש (Asia/Jerusalem)

4. **פורמט תאריך** - כל התאריכים מוצגים בפורמט עברי (dd.mm.yyyy)

5. **DateEnvelope** - כל התאריכים מהשרת מוחזרים בפורמט `DateEnvelope` עם `utc`, `epochMs`, `local`, `timezone`, `display`

## תוצאות צפויות

לאחר השלמת כל הבדיקות:

- כל התאריכים במערכת עוברים דרך הקוד המרכזי ✅
- תאימות מלאה בין Frontend ל-Backend ✅
- תצוגה עקבית של תאריכים בכל הדפים ✅
- תמיכה נכונה ב-timezone ✅
- קוד נקי ונוח לתחזוקה ✅



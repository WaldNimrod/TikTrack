# תקציר מנהלים – אפיון בנוי לאחור (POC Web)

## מטרה

- לנסח אפיון עדכני בהתאם למימוש בפועל כדי להציג יכולות למשקיעים/יזמים ולהנחות צוותים טכניים
  בהמשך פיתוח.
- לשמש בסיס למצגות ולדמואים: מה המערכת עושה היום, אילו דפי POC קיימים, ומה נדרש כדי להפוך
  למוצר מלא.

## סטטוס נוכחי (דצמבר 2025)

- סביבה: פיתוח על PostgreSQL (start_server.sh מזהה env לפי שם התיקייה; Dev על 8080).
- Backend: Flask + SQLAlchemy, שכבת Business Logic מאוחדת, Scheduler לנתונים חיצוניים.
- Frontend: trading-ui עם מערכות כלליות (Unified Initialization/Cache/Modal/Events/Headers),
  ITCSS חדש.
- כיסוי עמודים: 60 עמודים לפי `documentation/PAGES_LIST.md`, כולל Mockups ו-Daily Snapshots.
- נתונים חיצוניים: אינטגרציה מלאה ל-Yahoo Finance עם caching ושגרות רענון.

## קהלי יעד והדגמה

- משקיעים/יזמים: סיפור דמו קצר – כניסה (auth modal), דשבורד ראשי, דשבורד טיקר,
  תוכניות/טריידים, התראות, יומן מסחר, דף נתונים חיצוניים, העדפות, Watch Lists (mockups זמינים).
- צוותים טכניים: מסלולי עומק במסמכי האנגלית (ארכיטקטורה, מודל נתונים, API, עמודים).

## יכולות ליבה (היום)

- ישויות מסחר: Trading Accounts, Trades, Trade Plans, Executions, Cash Flows, Notes, Alerts,
  Tags, Watch Lists.
- Data Layer: User↔Ticker mapping, preferences v4, tag links cleanup, cache multi-layer,
  health/metrics/logs.
- חישובים ו-Business Logic: wrappers ב-Data Services (validate, calculations),
  Trade Plan Matching, Investment calculations, statistics, conditions system (6 methods).
- UI Systems: Unified initialization, cache, filters/header, modal manager+navigation+z-index,
  event handler manager, info summaries, table pipelines, widget overlays, icon/button/color systems,
  RTL.
- External Data: Yahoo Finance fetch+historical+technical indicators; dashboards למעקב וניהול.

## עמודים ומוקאפים (מפתח)

- עמודים מרכזיים: index, trades, trade_plans, alerts, tickers, ticker-dashboard,
  trading_accounts, executions, cash_flows, notes, research, data_import, preferences, ai-analysis,
  watch-list, trading-journal.
- עמודים טכניים/ניהול: db_display, db_extradata, constraints, background-tasks, system-management,
  server-monitor, notifications-center, css-management, cache-management, code-quality-dashboard,
  init-system-management.
- Mockups / Daily Snapshots: portfolio-state, trade-history, daily-snapshots-* (heatmap,
  comparison, economic calendar, emotional tracking, price-history, strategy-analysis),
  watch-list modal/add-ticker/flag quick action, tradingview-test-page.
- וידג'טים ודשבורדים: external-data-dashboard, crud-testing-dashboard,
  tradingview-widgets-showcase, button-color-mapping tools.

## נתונים ומודל (תמצית)

- ליבה: users, trading_accounts, tickers, user_ticker (custom fields/status), trades,
  trade_plans, executions, cash_flows, alerts (conditions), notes (+relation types), tags/tag_links,
  watch_lists (+items), preferences (profiles/v4), system_settings.
- נתונים חיצוניים: quotes, quotes_last, external_data_providers, eod metrics.
- תמיכה משלימה: currencies, plan_condition/trade_condition, trading_method, email_log,
  cache_change_log, import_session, password_reset_token, ai_analysis.

## אינטגרציות ושירותי תשתית

- Auth: מודול auth.js (modal), API `/api/auth/*` כולל reset-password/register.
- Scheduler/Background: DataRefreshScheduler, BackgroundTaskManager.
- ניטור/איכות: health/metrics endpoints, quality checks, Selenium console-scan script
  (`scripts/test_pages_console_errors.py`).
- התחלה וניהול שרת: תמיד דרך `./start_server.sh` (זיהוי env אוטומטי, PostgreSQL vars).

## סיכונים/פערים בולטים

- חסר Business Service מלא במספר עמודים (index, data_import, research) – נדרש חיזוק API/BL.
- חלק ממוקאפי daily snapshots טרם מגובים ב-BL/API.
- תלות ב-General Systems: יש להקפיד להשתמש בשירותים קיימים (FieldRenderer, CRUDResponseHandler,
  Table Pipeline וכו') בכל הרחבה.
- בדיקות: להריץ Selenium console scan לפני מסירה; כיסוי בדיקות ידני למוקאפים וזרימות auth.

## צעדי המשך מומלצים (למצגות ולפיתוח)

- להדגיש זרימת דמו אחידה (Dashboard → Ticker Dashboard → Trades/Plans → Alerts → Journal →
  External Data).
- להשלים פערי Business Logic בעמודי index/data_import/research לפני חשיפה ללקוחות.
- להקשיח auth/permissions לקראת חשיפה חיצונית (כיום dev-mode פתוח).
- לייצר נתוני דמו עקביים (סקריפטי generate demo data קיימים).
- לאשר POC storytelling לכל 60 העמודים ולמוקאפים העיקריים.

## ניווט למסמכי עומק (אנגלית)

- Overview: `../technical/OVERVIEW.md`
- Architecture: `../technical/ARCHITECTURE.md`
- Data Model: `../technical/DATA_MODEL.md`
- API Surface: `../technical/API_SURFACE.md`
- UI Pages & Flows: `../technical/FRONTEND_PAGES_AND_FLOWS.md`
- Runtime & Ops: `../technical/RUNTIME_AND_OPS.md`
- Gaps & Roadmap: `../technical/ROADMAP_AND_GAPS.md`


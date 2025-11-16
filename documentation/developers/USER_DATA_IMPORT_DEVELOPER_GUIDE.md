# מדריך מפתחים – מערכת ייבוא נתונים (2025-11)

## סקירה מהירה
- מערכת הייבוא בנויה סביב `ImportOrchestrator` שמנהל תהליכי ניתוח, תצוגה מוקדמת וייבוא בפועל.
- כל שכבה (Connector → Normalization → Validation → Duplicate Detection → Preview/Execute) צריכה להשתמש במערכות הכלליות הקיימות לפני כתיבת לוגיקה חדשה.
- מטרת המדריך: לאפשר למפתח העתידי להרחיב או לתחזק את התהליך ללא שבירת הסטנדרטים שנקבעו.
- **חוזה record_index (נובמבר 2025):** כל רשומה ב-`records_to_skip` מקבלת `record_index` יציב שמשמש את ה-UI ואת ה-API (`acceptDuplicate`, `rejectDuplicate`). חובה לשמר ערך זה בכל שלבי העיבוד ולוודא שהוא נחשף ל-frontend.

## ארכיטקטורת Back-End
1. **Connectors** – קריאת מקטעי הדו"ח (IBKR כרגע):
   - קלאסים תחת `Backend/connectors/user_data_import`.
   - מחזירים רשימות dict-ים אחידים לכל `task_type`.
   - שומרים `_raw_row` + `metadata` מלא לכל רישום.
   - החל מ-נובמבר 2025 זיהוי `Stock Yield Enhancement Program` מתבצע גם בתוך מקטעי Interest כללים (לא רק ב-`Stock Yield Enhancement Program Securities Lent Interest Details`) כדי שכל רשומת SYEP תישמר עם `cashflow_type=syep_interest`.
2. **Normalization Service** – `NormalizationService.normalize_records()`:
   - אחראי על המרת השדות לפורמט הקנוני.
   - עבור Cashflows חובה לשמור `metadata` עם המפתחות:
     - `original_cashflow_type`
     - `storage_cashflow_type` (עדכני אחרי המיפוי)
     - `mapping_note` (טקסט קצר, לדוגמה "SYEP interest")
     - `notes` (מערך הערות – להוסיף במידת הצורך)
     - `original_source_account` כאשר `_ensure_cashflow_account_binding` החליף ערך.
3. **Validation Service** – בדיקת סכומים, מטבע, סוגים ושיוך חשבון:
   - בטיפול בחשבונות, אם חסר `source_account` אך נבחר חשבון בשלב 1, הרשומה נשארת חוקית והשיוך מתבצע בהמשך.
   - `issues_by_type`, `currency_issues`, `missing_account_details` משמשים את ה-UI להצגת כרטיסי בעיות.
4. **Duplicate Detection Service** – חותמות (`signature`) ו-external_id:
   - עבור תזרימים – השוואה לפי (`cashflow_type`, `effective_date`, `abs(amount)`, `currency`, `source_account`).
   - הפלט כולל `clean_records`, `within_file_duplicates`, `existing_records`.
   - כל רשומה שנכנסת ל-`records_to_skip` מקבלת `record_index` ייחודי (כולל `within_file_duplicate_match`) שנשמר מה-cache ועד פעולת המשתמש, ולכן אסור למחוק אותו.
5. **ImportOrchestrator**:
   - `create_import_session()` – יוצר רשומה בטבלת `import_sessions`. חובה להשאיר את הערכים ב-UTC.
   - `_ensure_cashflow_account_binding()` – מוודא שכל התזרימים משויכים לחשבון שנבחר, ושומר את הערך המקורי במטא-דאטה.
   - `_resolve_cashflow_storage_type()` – מיפוי הסוגים הגולמיים ל-ENUM של `cash_flows.type`.
   - `_upgrade_preview_data_structure()` – מריץ מעבר נתונים על cache קיים ומזריק `record_index` חסר (למשל בסשנים ישנים שנשמרו בלי מזהה זה).
   - `generate_preview()` – משחזר את הנתונים + מוסיף `storage_type`/`mapping_note` לכל רשומות הייבוא וההשהיה.
   - `get_preview_snapshot(session_id)` – מחזיר את ה-preview האחרון מתוך cache/summary בלי להריץ עיבוד מחדש; משמש את `refresh-preview`.
   - `refresh_preview()` – endpoint שמחזיר את snapshot העדכני (כולל השינויים שבוצעו דרך `acceptDuplicate`/`rejectDuplicate`) ולא בונה preview חדש שמאפס את הסטטוס.
   - `_execute_import_cashflows()` – משתמש ב-`storage_type` לצורך יצירת הישות הסופית ומוסיף לתיאור `מקור תזרים: …`.

## טבלת מיפוי רשמית (חיוני לשמירה)
| סוג מקור | סוג שמור | הערת מקור |
|----------|----------|-----------|
| `deposit` | `deposit` | — |
| `withdrawal` | `withdrawal` | — |
| `transfer` | `transfer_in` / `transfer_out` | לפי סימן הסכום |
| `forex_conversion` | `currency_exchange_to` / `currency_exchange_from` | הערה: `Forex conversion` |
| `dividend` | `dividend` | — |
| `dividend_accrual` | `other_positive` / `other_negative` | לפי סימן הסכום |
| `interest` | `interest` | — |
| `interest_accrual` | `other_positive` / `other_negative` | לפי סימן הסכום |
| `tax` | `tax` | — |
| `fee` | `fee` | — |
| `borrow_fee` | `fee` | הערה: `Borrow fee` |
| `syep_interest` | `syep_interest` | הערה: `SYEP interest` |
| `cash_adjustment` | `other_positive` / `other_negative` | לפי סימן הסכום |
| אחר | `other_positive` / `other_negative` | `mapping_note` = שם המקור |

> 📝 בעת הוספת סוג חדש יש לעדכן גם את הטבלה הזו וגם את הקוד ב-`ImportOrchestrator`.

## ניהול תאריכים וסשנים
- טבלת `import_sessions` חייבת לשמור את `created_at` ו-`completed_at` ב-UTC (`datetime.now(timezone.utc)` בלבד!).
- כל נקודת קצה שמחזירה סשנים משתמשת ב-`_project_storage_payload` → `DateNormalizationService` כדי להחזיר `DateEnvelope`.
- Frontend מסתמך על הפורמט הזה לצורך הצגות בלוח המוביל ובכרטיסי סטטוס.

## Account Linking Prerequisite (Phase 1 – Nov 2025)
- טבלת `trading_accounts` הורחבה עם העמודה `external_account_number` (טקסט ייחודי). העמודה משמשת כקישור הקנוני לחשבון החיצוני ומוצגת/נערכת דרך מודל חשבון המסחר (`brokerAccountNumber`).
- החל מנובמבר 2025 אין יותר בחירת חשבון ידנית במסך הייבוא. הלקוח מעלה קובץ → המערכת קוראת את מספר החשבון מהקובץ (`extract_account_metadata`) ומאתרת אוטומטית את החשבון המתאים:
  - **מזהה מוכר** – השרת קושר את ה-session לחשבון שמצא ומחזיר `ACCOUNT_LINK_REQUIRED` עם `status=pending_confirmation`. ה-UI מציג חלון "אישור חשבון" עם פרטי החשבון המלאים. רק לאחר אישור (או בחירה ידנית של חשבון אחר) מותר להמשיך לניתוח.
  - **מזהה לא מוכר** – מוחזר `status=unlinked/mismatch` יחד עם מספר הקובץ. ה-UI פותח את מודול השיוך במצב בחירה ומציג אזהרה אם החשבון שנבחר כבר מכיל מספר חיצוני. ניתן לעדכן את השיוך רק דרך המודל.
- נקודות קצה חדשות:
  - `GET /api/user-data-import/session/<id>/account-link/status` – החזרת מצב השיוך הנוכחי (סטטוס, חשבון מזוהה, מספר מהקובץ).
  - `POST /api/user-data-import/session/<id>/account-link/confirm` – מאשר שיוך אוטומטי (מצב pending) ומסמן את הסשן כ-`linking_confirmed`.
  - `POST /api/user-data-import/session/<id>/account-link/select` – שומר שיוך לחשבון שנבחר ידנית. במידה והחשבון כבר מכיל `external_account_number`, מוחזר `error_code=ACCOUNT_LINK_OVERWRITE_REQUIRED` והלקוח צריך לשלוח שוב עם `confirm_overwrite=true`.
  - הנתיב ההיסטורי `POST /session/<id>/link-account` נשאר כתמיכה אחורה אך קורא לאותה לוגיקה חדשה.
- `_enforce_account_link` מוסיף סטטוסי linking חדשים (`pending_confirmation`, `linked`, `missing_in_file`) ומחזיר תמיד `linking.recognized_account` על מנת שה-UI יוכל להציג את שם החשבון/המטבע.
- לאחר שיוך מוצלח (`linking_confirmed=True`) נקראים שוב `analyze_file`/`generate_preview` ברקע כך שאין צורך להעלות את הקובץ מחדש.
- ה-UI מציג כרטיס זיהוי חדש בשלב 1: מספר מהקובץ + חשבון מזוהה במערכת. כל שינוי במצב השיוך (אישור, בחירה, ביטול) מעדכן את הכרטיס ואת המדדים של הסשן הפעיל.
- מודל עריכת חשבון מסחר כולל שדה `brokerAccountNumber` שממפה ישירות ל-`external_account_number` ומוודא ייחודיות מול שאר החשבונות.

### File Precheck & Step 1 Layout (Nov 2025)
- נוסף Endpoint חדש `POST /api/user-data-import/precheck` שמריץ בדיקה קלה דרך הקונקטור ברגע שהמשתמש בוחר קובץ. כל קונקטור (לדוגמה `IBKRConnector.precheck_file`) מאמת מבנה בסיסי, מחפש כותרות קריטיות ומחזיר `success/warnings/errors`.
- ה-Frontend (`runFilePrecheck()` ב-`import-user-data.js`) שולח את הקובץ מיד לאחר הבחירה או שינוי ספק/תהליך, מציג Badge מצב (`idle/pending/success/error`) ומונע לחיצה על כפתור "ניתוח" עד שהבדיקה הצליחה. הודעות האזהרה מוצגות דרך Notification System.
- פריסת שלב 1 עודכנה: שורה ראשונה – בחירת ספק → בחירת תהליך → כרטיס הסבר. שורה שנייה – בחירת קובץ (כולל סטטוס הבדיקה) → כרטיס זיהוי חשבון שמופיע רק כאשר קיים session פעיל.
- איפוס סשן (`resetImportSession`) מאפס גם את כרטיס הזיהוי והסטטוס של הבדיקה כך שהמשתמש לא רואה נתונים היסטוריים.
- בעת הפעלת `analyze_file` התהליך מתחיל בזיהוי החשבון: ה-Orchestrator יוצר session, שומר את מספר החשבון ונעצר עם `ACCOUNT_LINK_REQUIRED` עד לאישור. לאחר שהמשתמש מאשר/מעדכן שיוך, ה-UI אינו מעלה את הקובץ שוב אלא מריץ `reanalyseSessionForTask` (GET `/session/<id>/analyze`) על אותו session ולכן כל השלבים שאחרי הקישור מתבצעים רק פעם אחת.

## Task Plugins – Portfolio Positions & Taxes/Fx (Nov 2025)
### Portfolio Positions (`task_type=portfolio_positions`)
- **Connector**: `IBKRConnector` מפרק את המקטעים `Open Positions`, `Forex Balances`, `Net Asset Value` ו-`Change in NAV` ומחזיר רשומות אחידות (כולל `_raw_row`, `statement_period`, `statement_period_end` ו-`account_id`).
- **Normalization**: `_normalize_portfolio_record` מוסיף envelope של תאריך (`statement_period_end`), מזהה חיצוני ייחודי (`account_id + symbol + period`), ושומר את כל הערכים המספריים (`quantity`, `market_value`, `cost_basis`, `unrealized_pl`) כ-float.
- **Validation**: `_validate_portfolio_records` קובע סטטיסטיקות `currency_totals`, `asset_category_totals`, ורשימת `zero_quantity_positions` (משמשת לבעיות בממשק). אין Persist – זה דו"ח חכם בלבד.
- **Duplicate Detection**: `DuplicateDetectionService` מחזיר `clean_records` ללא עיבוד נוסף (פלט ריק עבור כפילויות). כל לוגיקת האכיפה נשארת ב-Validation.
- **Orchestrator**: `_build_analysis_payload` ו-`_build_preview_payload` מוסיפים `positions_detected`, summary לנתוני המטבע/קטגוריה ו-Payload קל ל-UI. `execute_import` מפעיל `_execute_report_only` – אין כתיבה ל-DB, רק סימון שהדו"ח הושלם.
- **UI**: `renderPortfolioAnalysisSummary()` משתמש בשדות החדשים כדי להציג כרטיסי-מטבע, כרטיסי קטגוריה ורשימת "פוזיציות אפס". תצוגת ה-Preview מציגה טבלאות ייעודיות (סמל, קטגוריה, מטבע, כמות, עלות, שווי, רווח/הפסד).

### Taxes & FX (`task_type=taxes_and_fx`)
- **Connector**: מנתח את `Withholding Tax`, `Change in NAV`, `Mark-to-Market Performance Summary` (רק מט"ח) ועסקאות `forex_conversion` שנוצרו בשלב התזרימים. כל רשומה מתויגת עם `record_type` (tax_cashflow / withholding_tax / forex_conversion / nav_component).
- **Normalization**: `_normalize_tax_fx_record` יוצר מזהה אחיד על בסיס `record_type + currency + amount + date`, מוסיף שדות לפירוט המרות מטבע (source/target currencies, quantity, price).
- **Validation**: `_validate_tax_fx_records` מאמת סכומים ומייצר:
  - `totals_by_currency` – סכום המיסים/עמלות לפי מטבע.
  - `totals_by_type` – פירוט לפי סוג רשומה (withholding, cash_report, forex_conversion).
  - `nav_components` – Diff מתוך Change in NAV.
  - `forex_trades` – רשימת העסקאות ששימשו לחישוב הפרשי מטבע (משמש את ה-UI כרשימת "אירועים לבדיקה").
- **Duplicate Detection**: משתמש ב-`_passthrough_duplicate_result`, אין חיפוש כפילויות במודול זה.
- **Orchestrator/UI**: בדומה לפורטפוליו – דו"ח בלבד (`_execute_report_only`). `renderTaxFxAnalysisSummary()` מציג כרטיסי מטבעות/סוגים ואת רכיבי ה-NAV. ה-Preview ייעודי (סוג, מטבע, תיאור, תאריך, נתוני FX).

> הערה: שני ה-Task Plugins חדשים משתמשים בכל המערכות הגנריות (Modal, Button, Notification, ModalNavigationService). אין קוד UI חדש מחוץ לקומפוננטים הסטנדרטיים.

## ממשק משתמש (עמוד `data_import.html`)
- טוען את המערכת דרך סקריפט `trading-ui/scripts/import-user-data.js`:
  - משתמש ב-`CASHFLOW_TYPE_LABELS` כדי להציג את שמות הסוגים (אין להוסיף לייבל חדש בלי לעדכן כאן).
  - `renderCashflowTypeCards()` מצפה לסטטיסטיקות הכוללות `storage_type` במטא-דאטה.
  - מודול טיפול בכפילויות (נובמבר 2025):
    - `deduplicateDuplicateRecords()` מסיר כפילויות לוגיות כך שכל `record_index` מוצג פעם אחת בלבד, בעוד ה-`within_file_duplicate_match` שלו מוצמד כ"שורת התאמה" מקוננת.
    - `renderDuplicateRow()` מצמיד `duplicate_type` + `record_index` ל-`data-onclick` של כפתורי `acceptDuplicate` / `rejectDuplicate` ומוסיף תת-טבלה להצגת Matches.
    - `initializeButtonsForProblemTable()` מפעיל את `window.ButtonSystem.processButtons(tbody)` בתוך `requestAnimationFrame` כדי למנוע אזהרות "Skipping button without parent node" ולשמור על סטנדרט Button System.
    - `getPreviewRecordIndex()` הוא השכבה היחידה שמותר לה להמר את `record_index` מהמבנה שהשרת מחזיר – אין לבצע parsing נוסף מחוץ לפונקציה הזו.
    - `refreshPreviewData()` שולח `POST /api/user-data-import/session/<id>/refresh-preview` (לא GET) כדי לקבל Snapshot עדכני שנבנה בשרת לאחר פעולות קודמות; קדימות מלאה לניקוי cache דרך `problemResolutionState` לפני הצגת התוצאה החדשה.
  - כל קריאה ל-`window.processButtons()` חייבת לקבל קונטיינר (document / modal) כדי למנוע התראות "No container provided".
- שלב 2 ו-3 של המודל נשענים על הסכמה הבאה:
  - `analysis_results.cashflow_type_stats[typeKey]` – נתוני כרטיסים.
  - `records_to_import[i].metadata.storage_cashflow_type` – הצגת סוג המערכת בתצוגה המקדימה.
  - `records_to_skip[*].mapping_note` – הצגת הערה בהודעות הבעיה.
- חובה להשתמש במערכות הכלליות:
  - ModalManagerV2, Button System, Notification System, Unified Cache.

## תהליך עבודה מומלץ למפתח
1. **לפני שינוי** – להריץ `documentation/frontend/GENERAL_SYSTEMS_LIST.md` ולוודא שקיימת מערכת כללית.
2. **פיתוח**:
   - עבודה על קבצי backend → לוודא שכל התאריכים ב-UTC.
   - בדיקת מיפויים חדשים → לעדכן קודם בטבלה לעיל.
   - הרחבת ה-UI → שימוש בכיתות קיימות בלבד (אין inline styles).
3. **בדיקות**:
   - `python3 -m compileall` על הקבצים שנערכו.
  - טעינת `_tmp/activity - 2024.csv` והרצת `ImportOrchestrator` ידנית כדי לבדוק סטטיסטיקות ועמודות.
   - בדיקת תוצאות ב-DB (`CashFlow`, `import_sessions`).
4. **תיעוד** – לעדכן את מסמך המערכת (קובץ זה + `systems/user-data-import-system.md`).

## בדיקות רגרסיה קצרות לפני דחיפה
- בדיקת API:
  - `GET /api/user-data-import/sessions/active`
  - `GET /api/user-data-import/history?trading_account_id=<id>`
  - `GET /api/user-data-import/session/<id>/preview`
- בדיקת UI:
  - לטעון קובץ לדוגמה ולוודא שכרטיסי cashflow מעודכנים עם הסכומים התקינים.
  - לבדוק שחלק "כפילויות" מציג את הערך במטא-דאטה (storage_type/mapping_note).
- בדיקת DB:
  - לוודא שכל רשומות `cash_flows` שנוצרו משתמשות באנום התקין ולתיאור יש "מקור תזרים".
  - לוודא שסשנים חדשים נשמרים עם חותמות UTC.

## מה אסור לשבור
- אסור להוסיף סוגים חדשים בלי לעדכן את המיפוי ואת הטבלה.
- אסור לשמור תאריכים ללא timezone.
- אסור לעקוף את Button/Modal/Notification systems.
- אסור להכניס קוד לוגי לקובצי הדוקומנטציה (הם משקפים מצב קיים בלבד).

## שלב 2 – הרחבת אובייקט חשבון (תכנון)
- השדה `external_account_number` הוא הצעד הראשון במעבר לחיבור חשבונות דרך API. בשלב הבא נוסיף לטבלת `trading_accounts` עמודות עבור `margin_status`, `base_currency_code`, רשימות `entitlements` ו-`missing_documents` כדי לשמר את תוצאות תהליך ה-Account Reconciliation ודו"חות ה-Portfolio/Tax ללא תלות ב-session JSON.
- נתוני ה-`summary_values`, `account_aliases`, `currency_totals` (מהדו"ח), ו-`totals_by_currency` (מיסים/FX) יועברו לטבלאות ייעודיות / JSON column שישמשו את Dashboard ואת Broker API sync.
- שני ה-Task Plugins החדשים נבנו מראש כ-"report only" כך שאפשר למפות אותם בקלות ל-Webhook/Streaming כאשר חיבור ה-API לבורסה יהיה מוכן (אותו payload יהפוך ל-events ולא רק Preview).
- אחרי הרחבת הסכמה נריץ sync דו-כיווני: Account Linking → Broker API (OAuth או session token) כדי למשוך נתונים חיים במקום קובצי CSV. המימוש הנוכחי כבר מכיל את ה-hooks הדרושים (`link_trading_account_to_file`, `_execute_report_only`) כך שהחיבור יהיה backwards compatible.
- מדריך זה יתעדכן מחדש כאשר העמודות החדשות יתווספו (שלב 2), כולל מדיניות מיגרציה, בדיקות רגרסיה ויישום Endpointים לחשיפת הסטטוס ל-UI ולקונסולת הפיתוח.

## הצעות להמשך
- הוספת Task רשמי ל-`account_reconciliation` עם Persist מלא.
- הרחבת דוחות live כדי לכלול diff מטבע/חשבונות לפני ואחרי הייבוא.
- ניתוח אוטומטי של פערים (alerts) על בסיס `mapping_note`.



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
| `forex_conversion` | `transfer_in` / `transfer_out` | הערה: `Forex conversion` |
| `dividend` | `dividend` | — |
| `dividend_accrual` | `other_positive` / `other_negative` | לפי סימן הסכום |
| `interest` | `interest` | — |
| `interest_accrual` | `other_positive` / `other_negative` | לפי סימן הסכום |
| `tax` | `tax` | — |
| `fee` | `fee` | — |
| `borrow_fee` | `fee` | הערה: `Borrow fee` |
| `syep_interest` | `interest` | הערה: `SYEP interest` |
| `cash_adjustment` | `other_positive` / `other_negative` | לפי סימן הסכום |
| אחר | `other_positive` / `other_negative` | `mapping_note` = שם המקור |

> 📝 בעת הוספת סוג חדש יש לעדכן גם את הטבלה הזו וגם את הקוד ב-`ImportOrchestrator`.

## ניהול תאריכים וסשנים
- טבלת `import_sessions` חייבת לשמור את `created_at` ו-`completed_at` ב-UTC (`datetime.now(timezone.utc)` בלבד!).
- כל נקודת קצה שמחזירה סשנים משתמשת ב-`_project_storage_payload` → `DateNormalizationService` כדי להחזיר `DateEnvelope`.
- Frontend מסתמך על הפורמט הזה לצורך הצגות בלוח המוביל ובכרטיסי סטטוס.

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

## הצעות להמשך
- הוספת Task רשמי ל-`account_reconciliation` עם Persist מלא.
- הרחבת דוחות live כדי לכלול diff מטבע/חשבונות לפני ואחרי הייבוא.
- ניתוח אוטומטי של פערים (alerts) על בסיס `mapping_note`.



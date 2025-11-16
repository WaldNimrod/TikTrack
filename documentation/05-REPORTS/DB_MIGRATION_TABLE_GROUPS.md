# DB Migration – Table Grouping

**Last updated:** 15 November 2025  
**Source of record:** `documentation/05-REPORTS/DATABASE_TABLES_REPORT.md` (1 Nov 2025) + עדכונים ידועים (`user_preferences_v3`, `tickers_new`)

המסמך מרכז את כל טבלאות ה-SQLite הנוכחיות ומחלק אותן לקבוצות פעולה עבור המיגרציה ל-PostgreSQL.  
החלוקה מיישמת את ההנחיות:
1. **טבלאות ישויות מרכזיות** – מכילות מידע דמה; אין צורך להעתיק נתונים, רק לבנות סכמות ולהריץ Seed מינימלי.
2. **טבלאות עזר/מערכת** – חייבות להישמר בדיוק כפי שהן (preferences, אילוצים, מטבעות, ועוד).
3. **טבלאות לוגים/נגזרות** – ניתן להחליט אם להעתיק או לבצע ניקוי, בכפוף לכללי fallback ולנהלים העדכניים.

---

## סיכום קבוצות

| קבוצה | מטרה | טבלאות | מדיניות מיגרציה |
|-------|-------|---------|------------------|
| **A. ישויות עסקיות / נתוני בדיקות** | טריידים, תוכניות, ביצועים, אלרטים – מידע דמה בלבד | `trades`, `executions`, `trade_plans`, `plan_conditions`, `trade_conditions`, `condition_alerts_mapping`, `alerts`, `cash_flows`, `market_data_quotes`, `quotes_last`, `intraday_data_slots`, `data_refresh_logs`, `tickers`, `trading_accounts`, `notes` | *Reset*: לבנות סכמות ב-PostgreSQL ולהפעיל Seed/Fixtures לפי צרכי QA. אין צורך בשימור נתונים מה-SQLite. |
| **B. משתמשים, העדפות ושיטות** | טבלת משתמשים + שכבת ההעדפות והגדרות שיטות מסחר | `users`, `preference_types`, `preference_groups`, `preference_profiles`, `user_preferences`, `user_preferences_v3`, `trading_methods`, `method_parameters` | *Preserve + Consolidate*: שימור נתונים מלא והעברה לטבלה אחת בשם `user_preferences` (איחוד ה-v3 והlegacy) ולהשאיר נתוני trading_methods/method_parameters במדויק. |
| **C. אילוצים וקישוריות** | סוגי קשרים, אילוצים, ערכי enum | `constraints`, `constraint_validations`, `enum_values`, `note_relation_types`, `link_types` (אם קיים) | *Preserve*: נתוני reference קבועים – חובה לשמר. |
| **D. מטבעות ונתוני עזר פיננסיים** | מטבעות, ספקי נתונים חיצוניים | `currencies`, `external_data_providers` | *Preserve*: נדרשים כברירת מחדל לתפעול. |
| **E. מערכות תצורה ו-import** | חוצצי Import, הגדרות מערכת, לוגים טכניים | `import_sessions`, `system_setting_types`, `system_settings`, `system_setting_groups`, `system_setting_profiles`, `data_refresh_logs` | *Mixed*: הגדרות – לשמר; `import_sessions` – למחוק נתונים לפני מיגרציה (להתחיל נקי); `data_refresh_logs` – לגבות ולנקות בהתאם לנוהל. |

> ⚠️ **שימו לב:** כללי fallback של TikTrack אוסרים על שימוש בערכי ברירת מחדל מומצאים. בעת בדיקות פוסט-מיגרציה יש לוודא שכל הטבלאות מקבוצות B–D מלאות במידע המדויק לפני הפעלת הסביבה.

---

## פירוט מלא לפי קבוצה

### קבוצה A – ישויות עסקיות (Dummy / Reset)
- trades
- executions
- trade_plans
- plan_conditions
- trade_conditions
- condition_alerts_mapping
- alerts
- cash_flows
- market_data_quotes
- quotes_last
- intraday_data_slots
- data_refresh_logs
- tickers
- trading_accounts
- notes

**פעולה:**  
1. ליצור סכמות PostgreSQL זהות (SQLAlchemy metadata).  
2. להריץ Seed נתוני QA (fixtures) לפי הצורך.  
3. לוגים/market data – מומלץ לנקות ולהתחיל מחוצץ נקי או להריץ crawler מחדש.

### קבוצה B – משתמשים, העדפות ושיטות (Preserve + Consolidate)
- users
- preference_types
- preference_groups
- preference_profiles
- user_preferences
- user_preferences_v3
- trading_methods
- method_parameters
- **target unified table:** להזיז את הנתונים ל-`user_preferences` (שם קבוע ללא סיומת גרסה).  
- `user_preferences_v3` יישאר מקור נתונים עד להפעלת המיגרציה; לאחר מעבר מוצלח הטבלה היחידה תהיה `user_preferences`.

**פעולה:**  
1. להריץ סקריפט העתקה (`scripts/db/migrate_sqlite_to_pg.py`) – קריאה מ-SQLite, כתיבה ל-PostgreSQL.  
2. בזמן ההעברה – לאחד רשומות `user_preferences` הישנות אל מבנה v3, ולייצא הכל לטבלה יחידה בשם `user_preferences`.  
3. לשמר ולהעתיק את תוכן `trading_methods` ו-`method_parameters` כפי שהוא.  
4. לאמת checksum/ספירת רשומות ולהוסיף בדיקת `updated_at`/`created_at` כדי לוודא שמירה על סדר כרונולוגי.

### קבוצה C – אילוצים, סוגי קשרים ו-Enums (Preserve)
- constraints
- constraint_validations (גם אם ריק – ליצור טבלה ולהשאיר ריקה, אין התאמות נתונים)
- enum_values
- note_relation_types
- method_parameters *(כאשר מכיל תיאור פרמטרים סטטי)*
- trading_methods *(כאשר מתאר סוגי שיטות קבועות; אם זו ישות פעילה – ראה קבוצה A)*

**פעולה:**  
שמירה מלאה + בדיקת תקינות של foreign keys על מנת לוודא התאמות בעתיד.

### קבוצה D – מטבעות ונתוני עזר פיננסיים (Preserve)
- currencies
- external_data_providers

**פעולה:**  
1. גיבוי והעתקה מלאים.  
2. בדיקת עקביות קודי ISO / מזהי ספקים.  
3. וידוא שכל שכבות המערכת מאתחלות caching מחדש כדי לא ליצור fallback לערכים חסרים.

### קבוצה E – מערכות תצורה וייבוא
- import_sessions *(מוחקים נתונים קיימים לפני העלאה – מתחילים נקי/QA בלבד)*
- system_setting_types
- system_settings
- system_setting_groups
- system_setting_profiles *(אם קיים בסכמות החדשות)*
- data_refresh_logs *(גיבוי → ניקוי או רוטציה)*

**פעולה:**  
לשמר הגדרות; עבור import_sessions ניתן לשמור או לאפס בהתאם ל-Runbook. ממליץ להעתיק כדי לשמור עקבות QA.

---

## שלבים הבאים
1. קבלת אישור על הקבוצות לפני כתיבת סקריפט המיגרציה.  
2. לאחר האישור – לעדכן את סקריפטי ההעתקה כך שיודעים אילו טבלאות מועברות ואילו מאותחלות מחדש.  
3. לתעד את ההחלטה בדוח המיגרציה והבדיקות.


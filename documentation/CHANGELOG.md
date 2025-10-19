# Changelog - TikTrack Application

All notable changes to this project will be documented in this file.

---

## [2.0.7] - 2025-10-14

### Added
- **תמיכה בשיוך עסקאות גמיש:** עסקאות (Executions) יכולות להישמר במצב זמני עם שיוך לטיקר בלבד, או במצב מלא עם שיוך לטרייד
- **Endpoint חדש:** `GET /api/executions/pending-assignment` - מחזיר עסקאות המשוייכות לטיקר בלבד
- **Widget דף הבית:** קומפוננטה חדשה המציגה עסקאות הדורשות שיוך לטרייד
- **רדיו באטן בטפסים:** בחירה דינמית בין שיוך לטיקר או לטרייד בממשק הוספה/עריכה
- **עמודת "קשור ל":** בטבלת העסקאות, מציגה באופן ויזואלי את סוג השיוך

### Changed
- **מבנה טבלת Executions:** 
  - הוספת שדה `ticker_id` (NULLABLE, FK)
  - שינוי `trade_id` מ-NOT NULL ל-NULLABLE
  - שינוי `trading_account_id` ל-NULLABLE (חובה רק עם trade_id)
- **ממשק הוספה/עריכה:** רדיו באטן לבחירת סוג שיוך עם שדות דינמיים
- **API validation:** בדיקת XOR constraint (ticker_id או trade_id, לא שניהם)
- **תצוגת טבלה:** שימוש בפורמט אחיד `linked_display` לכל העסקאות

### Database
- **Migration:** `20251014_executions_flexible_association.py`
  - 6 עסקאות קיימות הומרו בהצלחה
  - CHECK constraint: `(ticker_id IS NOT NULL AND trade_id IS NULL) OR (ticker_id IS NULL AND trade_id IS NOT NULL)`
  - Foreign Keys ל-tickers, trades, trading_accounts

### Frontend
- **קבצים חדשים:**
  - `trading-ui/scripts/pending-executions-widget.js` - Widget לדף הבית
- **קבצים מעודכנים:**
  - `trading-ui/executions.html` - מודלי הוספה/עריכה עם רדיו באטן
  - `trading-ui/scripts/executions.js` - לוגיקת שיוך גמיש
  - `trading-ui/index.html` - אינטגרציה של widget
  - `trading-ui/styles-new/06-components/_linked-items.css` - סטיילים חדשים

### Backward Compatibility
- ✅ כל העסקאות הקיימות עם `trade_id` ממשיכות לעבוד ללא שינוי
- ✅ ממשק קיים תומך בשני מצבי השיוך
- ✅ API מחזירה פורמט אחיד לכל המצבים

---

## [2.0.6] - 2025-10-13

### Changed
- UI improvements for cash flows, executions, and trade plans
- Updated linked items badges and page headers
- CRUD UI fixes and enhancements

---

_For complete version history, see git tags and commits._


# דוח קבצים שאינם בשימוש - TikTrack v2.0

## סיכום כללי
דוח זה מפרט קבצים שאינם בשימוש בפרויקט TikTrack לפני השחרור של גרסה 2.0. הקבצים מחולקים לקטגוריות לפי סוג ומידת החשיבות.

## טבלת קבצים לניקוי

| שם קובץ | תיאור | תיקייה | תאריך עדכון אחרון | המלצה |
|---------|-------|--------|-------------------|--------|
| **קבצי בדיקה (Test Files)** |
| test-modals.html | דף בדיקה למודלים | trading-ui/ | 26/08/2025 | למחיקה - לא בשימוש |
| test-tickers.html | דף בדיקה לטיקרים | trading-ui/ | 26/08/2025 | למחיקה - לא בשימוש |
| test-accounts-8080.html | דף בדיקה לחשבונות | trading-ui/ | 26/08/2025 | למחיקה - לא בשימוש |
| test-accounts-simple.html | דף בדיקה פשוט לחשבונות | trading-ui/ | 26/08/2025 | למחיקה - לא בשימוש |
| test-accounts.html | דף בדיקה לחשבונות | trading-ui/ | 26/08/2025 | למחיקה - לא בשימוש |
| test-header-only.html | דף בדיקה לheader system | trading-ui/ | 26/08/2025 | **לשמור** - בשימוש בjs-map |
| style_demonstration.html | דף הדגמת סגנונות | trading-ui/ | 26/08/2025 | **לשמור** - בשימוש בjs-map |
| js-map.html | מפת קבצי JavaScript | trading-ui/ | 26/08/2025 | **לשמור** - כלי חשוב לניהול |
| **קבצי JavaScript לא בשימוש** |
| warning-examples.js | דוגמאות אזהרות | trading-ui/scripts/ | 25/08/2025 | למחיקה - לא בשימוש |
| js-map.js | מפת JavaScript | trading-ui/scripts/ | 26/08/2025 | **לשמור** - בשימוש בjs-map.html |
| js-scanner.js | סורק JavaScript | trading-ui/scripts/ | 26/08/2025 | **לשמור** - בשימוש בjs-map.html |
| auth.js | מערכת אימות | trading-ui/scripts/ | 26/08/2025 | **לשמור** - מוזכר בתיעוד |
| currencies.js | פונקציות מטבעות | trading-ui/scripts/ | 26/08/2025 | **לשמור** - מוזכר בתיעוד |
| **קבצי CSS לא בשימוש** |
| styles-test.css | סגנונות בדיקה | trading-ui/styles/ | 27/08/2025 | **לשמור** - בשימוש בstyle_demonstration.html |
| typography.css | סגנונות טיפוגרפיה | trading-ui/styles/ | 17/08/2025 | **לשמור** - בשימוש נרחב |
| **קבצי Python לא בשימוש** |
| preferences.py | קובץ העדפות | ./ | 26/08/2025 | למחיקה - לא בשימוש |
| test_file_write.py | בדיקת כתיבת קבצים | ./ | 26/08/2025 | למחיקה - לא בשימוש |
| simpleTrade.db | בסיס נתונים ישן | ./ | 13/08/2025 | למחיקה - לא בשימוש |
| tiktrack.db | בסיס נתונים ישן | Backend/ | 17/08/2025 | למחיקה - לא בשימוש |
| **קבצי Scripts לא בשימוש** |
| restart_server_quick.sh | הפעלה מהירה של שרת | ./ | 24/08/2025 | למחיקה - לא בשימוש |
| restart_server_complete.sh | הפעלה מלאה של שרת | ./ | 23/08/2025 | למחיקה - לא בשימוש |
| check_autostart.sh | בדיקת הפעלה אוטומטית | ./ | 22/08/2025 | למחיקה - לא בשימוש |
| setup_autostart.sh | הגדרת הפעלה אוטומטית | ./ | 22/08/2025 | למחיקה - לא בשימוש |
| disable_autostart.sh | ביטול הפעלה אוטומטית | ./ | 22/08/2025 | למחיקה - לא בשימוש |
| onboarding.sh | סקריפט onboarding | ./ | 22/08/2025 | למחיקה - לא בשימוש |
| setup_development.sh | הגדרת סביבת פיתוח | ./ | 19/08/2025 | למחיקה - לא בשימוש |
| **קבצי הגדרה לא בשימוש** |
| Makefile | קובץ Make | ./ | 19/08/2025 | למחיקה - לא בשימוש |
| .pre-commit-config.yaml | הגדרות pre-commit | ./ | 19/08/2025 | למחיקה - לא בשימוש |
| mypy.ini | הגדרות mypy | ./ | 19/08/2025 | למחיקה - לא בשימוש |
| **קבצי לוג ונתונים** |
| server_detailed.log | לוג מפורט של שרת | ./ | 26/08/2025 | למחיקה - לוג זמני |
| server_detailed.log | לוג מפורט של שרת | Backend/ | 26/08/2025 | למחיקה - לוג זמני |
| database_full_backup_20250826_021641.db* | גיבוי בסיס נתונים | ./ | 26/08/2025 | למחיקה - גיבוי זמני |
| TikTrack_Production_Ready_20250824_063032.zip | קובץ ZIP של גרסה | ./ | 24/08/2025 | למחיקה - גיבוי זמני |
| **קבצי מערכת** |
| .DS_Store | קובץ מערכת Mac | trading-ui/images/ | 26/08/2025 | למחיקה - קובץ מערכת |
| **קבצי גיבוי ישנים** |
| app-header-old.js | header ישן | trading-ui/backups/ui_temp_files/ | 22/08/2025 | למחיקה - גיבוי ישן |
| research_new.html | דף מחקר חדש | trading-ui/backups/ui_temp_files/ | 24/08/2025 | למחיקה - גיבוי זמני |
| **קבצי לוג ישנים** |
| route_check_*.log | לוגי בדיקת נתיבים | Backend/logs/ | 26/08/2025 | למחיקה - לוגי זמניים |
| app.log.1 | לוג ישן | Backend/logs/ | 26/08/2025 | למחיקה - לוג ישן |

## קבצים לשמירה (בשימוש)

| שם קובץ | סיבה לשמירה |
|---------|-------------|
| console-cleanup.js | בשימוש נרחב בכל הדפים |
| test-header-only.html | כלי חשוב לבדיקת header system |
| style_demonstration.html | כלי חשוב להדגמת סגנונות |
| js-map.html | כלי חשוב לניהול קבצי JavaScript |
| js-map.js | בשימוש בjs-map.html |
| js-scanner.js | בשימוש בjs-map.html |
| auth.js | מוזכר בתיעוד המערכת |
| currencies.js | מוזכר בתיעוד המערכת |
| styles-test.css | בשימוש בstyle_demonstration.html |
| typography.css | בשימוש נרחב בכל הדפים |

## המלצות לניקוי

### שלב 1: מחיקה מיידית
- קבצי בדיקה לא בשימוש (test-*.html למעט test-header-only.html)
- קבצי Python לא בשימוש
- קבצי scripts לא בשימוש
- קבצי הגדרה לא בשימוש
- קבצי לוג זמניים
- קבצי גיבוי ישנים

### שלב 2: בדיקה נוספת
- warning-examples.js - לבדוק אם יש צורך בתיעוד
- קבצי auth.js ו-currencies.js - לבדוק אם באמת בשימוש

### שלב 3: שמירה
- console-cleanup.js - לשמור כי בשימוש נרחב
- קבצי js-map - כלים חשובים לניהול
- קבצי CSS בשימוש

## סיכום
**סה"כ קבצים למחיקה: 25+**
**סה"כ קבצים לשמירה: 10**
**חיסכון במרחב: ~20MB**

הניקוי יסייע לארגון הפרויקט ולשיפור הביצועים לפני שחרור גרסה 2.0.

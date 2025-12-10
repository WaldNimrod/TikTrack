# Pre-Launch Code Tasks for Online Deployment

**תאריך:** דצמבר 2025  
**גרסה:** 1.0  
**מטרה:** להציג לצוות את המשימות הקודיות שנמצאו במהלך סריקה מהירה של `TikTrackApp` ולוודא שהן מוכנות לפני העלאת סביבת ה־Lightsail.

---

## 🔍 סריקת TODO-ים רלוונטיים

בזמן בדיקת המערכת לפני העליה לאוויר זיהינו מספר TODO-ים בולטים בקוד שמכריחים טיפול כדי שה־POC יהיה שלם:

### 1. Trading Journal (`trading-ui/scripts/trading-journal-page.js`)
 - **משימה:** העצמת לחצן "הוסף רשומה" מפעיל כרגע רק הודעה; אין פתיחת מודלים/שמירה לבסיס נתונים.
 - **למה חשוב:** כדי שהמעקב יהיה אמיתי בפרזנטציה חייבים חיבור ל־backend – לכל סוגי הרשומות (notes, alerts, executions, etc.).
 - **מה לבצע:** ליישם את `handleAddEntry()` כך שיפתח את הטפסים הרלוונטיים ויוכל לבצע שליחה ל־API (או לפחות לשמור state מקומי עד ל־backend חיבור מלא).

### 2. Executions Page (`trading-ui/scripts/executions.js`)
 - **משימות:** TODOים בפונקציות ניתוב/פתיחת מודלים:
   1. ניתוב לדף טיקר לפי `symbol`.
   2. פתיחת מודל הוספת טיקר.
   3. פתיחת מודל הוספת תכנון.
   4. פתיחת מודל הוספת טרייד.
 - **למה חשוב:** דף executions הוא עמוד המרכזי שמציג מידע חי; כל אחד מהמודלים חשוב לניהול עצמי בזמן הפרזנטציה. אין release בלי functionality בסיסית.
 - **מה לבצע:** לחבר את המודלים ל־header/system, לוודא שה־API קיים וכי ניהול הטפסים עובד (שומר/מעדכן/רענון רשימות).

### 3. Portfolio / Account Views (`trading-ui/scripts/portfolio-state*.js`)
 - **משימות:** קיימים TODOים שמציינים `TODO: Load from API` ו־"Implement account-level EOD data".
 - **למה חשוב:** תצוגת פורטפוליו ופילוח לפי חשבונות מופיעים בעמודי תיק, והנתונים חייבים להיות אמיתיים ל־demo.
 - **מה לבצע:** לחבר את החישובים ל־API קיים או ליצור mock שמבוסס על נתוני הארכיון (כדי שאינדיקטורים מוצגים). במיוחד להציג `cash_balance_by_account` ו־`positions_count_by_account`.

### 4. Alert / Notification Core (`trading-ui/scripts/modules/core-systems.js` + `notification-system.js`)
 - **משימות:** TODOים ל־update/trigger/read של התראות.
 - **למה חשוב:** מערכת ההתרעות חייבת להיות פונקציונלית כדי להציג alerts בזמן אמת ותגובות (בנינו logging אבל לא את הלוגיקה עצמה).
 - **מה לבצע:** להשלים את הלוגיקה שמעדכנת ה-alerts, מפעילה טריגרים и מסמנת קריאות, כך שחולצות ה־notifications וה־Logger יהיו משולבים.

### 5. Import & Background Tasks (`trading-ui/scripts/import-user-data.js`, `background-tasks.js`)
 - **משימות:** TODOים ל-force import מיוחד ולחינת פרטי היסטוריה.
 - **למה חשוב:** המערכת מבוססת על data import; צריך להבטיח שהייבוא יתבצע באופן יציב לפני השקת ממשק הטסטים.
 - **מה לבצע:** להשלים את הפעולות המיוחדות שמופיעות ב־TODO (skip/import), ולסיים את מודל ה־history details המופיע ב־background-tasks.

## ✅ סדר עדיפויות מוקדם

| עדיפות | משימה | אחראי |
| --- | --- | --- |
| גבוה | handleAddEntry מלא ל־Trading Journal | Frontend team / UI |
| גבוה | ניתוב + מודלים ל־Executions | Frontend + Backend coordination |
| בינוני | חיבור נתוני פרוטפוליו/חשבונות ל־API | Backend (data) + Frontend |
| בינוני | לוגיקה מלאה ל־Alerts/Notifications | Core systems + Logger |
| נמוך | השלים import-specific flows ומודל היסטוריה ב־background tasks | Backend workflow team |

## 📌 מהכולל release checklist

1. לסמן TODOים הנ"ל כבתהליך/בוצעו (`documentation/03-DEVELOPMENT/FUTURE_TASKS_MASTER_LIST.md` + קבצי JS).
2. להריץ את `MISSING_TASKS_AFTER_HANDOFF.md` + בדיקות שה־Lightsail replica עובד (Git pull, API health).
3. לעדכן את השני (2) טבלאות: `portfolio-state` + `account-activity` עם נתוני API, לוודא שחישובי אחוזים מתעדכנים בזמן אמת.
4. לוודא שה־notification system מתעדכן ושההודעות מציגות סטטוס נכון לפני הדמו.

---

**הערה:** רשימה זו מתבססת על TODOים פעילים ועל ההערכה שהפונקציות הללו נדרשות לפני שהשרת יעלה; אם יתגלה TODO נוסף אחר בתחנה (למשל במודול אחר), יש להוסיף אותו לרשימה ולהתעדכן ב־`PRE_LAUNCH_CODE_TASKS.md`.



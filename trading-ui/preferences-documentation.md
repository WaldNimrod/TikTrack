# דוקומנטציה - הגדרות מערכת TikTrack

## סקירה כללית
עמוד הגדרות המערכת מכיל 7 סקשנים עיקריים עם מגוון רחב של הגדרות למערכת ולממשק המשתמש.

---

## סקשן עליון: כותרת ראשית + כפתורי פעולה
- **כותרת ראשית**: "העדפות"
- **כפתור שמירה**: בולט ונראה
- **כפתור סגירה/פתיחה**: פותח וסוגר את כל הסקשנים

---

## סקשן 1: ניהול פרופילים 👤

### רכיבי הפרופיל
- **בחירת פרופיל** (`profileSelect`) - פעיל
  - רשימה דינמית של פרופילים קיימים
- **שם פרופיל חדש** (`newProfileName`) - פעיל
  - שדה טקסט ליצירת פרופיל חדש

### פעולות פרופיל (כל הכפתורים בשורה)
- **טעינת פרופיל** (`loadProfile`) - פעיל
- **יצירת פרופיל** (`createProfile`) - פעיל
- **שמירת פרופיל נוכחי** (`saveCurrentProfile`) - פעיל
- **שכפול פרופיל** (`duplicateProfile`) - פעיל
- **ייצוא פרופיל** (`exportProfile`) - פעיל
- **מחיקת פרופיל** (`deleteProfile`) - פעיל
- **עריכת שם פרופיל** - אפשרות לערוך שם של פרופיל

---

## סקשן 2: הגדרות בסיסיות 🏦

### מטבעות 💰
- **מטבע ראשי** (`primaryCurrency`) - פעיל
  - אפשרויות: USD, EUR, GBP, ILS
  - ברירת מחדל: USD
  - **הגבלה**: כרגע נתמך רק דולר ארה"ב - שינוי מטבע אחר יחזיר הודעה ויחזיר ל-USD
- **מטבע משני** (`secondaryCurrency`) - עתידי (מושבת)
  - אפשרויות: USD, EUR, GBP, ILS

### אזור זמן וגלובליזציה 🌍
- **אזור זמן** (`timezone`) - פעיל
  - אפשרויות: Asia/Jerusalem, America/New_York, Europe/London, וכו'
  - ברירת מחדל: Asia/Jerusalem
- **שפה** (`language`) - עתידי (מושבת)
  - אפשרויות: he, en, ar

---

## סקשן 3: הגדרות מסחר 📈

### הגדרות בסיסיות
- **Stop Loss ברירת מחדל** (`defaultStopLoss`) - פעיל
  - טווח: 0-100, צעד: 0.1
- **Target Price ברירת מחדל** (`defaultTargetPrice`) - פעיל
  - טווח: 0-1000, צעד: 0.1
- **עמלה ברירת מחדל** (`defaultCommission`) - פעיל
  - מינימום: 0, צעד: 0.01

### ניהול סיכונים (עתידי - מושבת)
- **סיכון מקסימלי לחשבון** (`maxAccountRisk`) - עתידי
  - טווח: 0-100%, צעד: 0.1
- **סיכון מקסימלי לטריד** (`maxTradeRisk`) - עתידי
  - טווח: 0-100%, צעד: 0.1
- **גודל פוזיציה מקסימלי** (`maxPositionSize`) - עתידי
  - טווח: 0-100%, צעד: 0.1

---

## סקשן 4: פילטרים ברירת מחדל 🔍

### פילטרים בסיסיים
- **סטטוס ברירת מחדל** (`defaultStatusFilter`) - פעיל
  - אפשרויות: הכל, פתוח, סגור, מבוטל
- **סוג ברירת מחדל** (`defaultTypeFilter`) - פעיל
  - אפשרויות: הכל, Swing, השקעה, פסיבי
- **טווח תאריכים ברירת מחדל** (`defaultDateRangeFilter`) - פעיל
  - אפשרויות: השבוע, החודש, השנה, הכל, מותאם אישית

### פילטרים נוספים
- **חיפוש ברירת מחדל** (`defaultSearchFilter`) - פעיל
  - שדה טקסט חופשי
- **חשבון ברירת מחדל** (`defaultAccountFilter`) - פעיל
  - רשימה דינמית של חשבונות פתוחים

---

## סקשן 5: צבעים 🎨

### צבעי מערכת בסיסיים
- **צבע ראשי** (`primaryColor`) - פעיל
  - ברירת מחדל: #29a6a8
- **צבע משני** (`secondaryColor`) - פעיל
  - ברירת מחדל: #ff9c05
- **הצלחה** (`successColor`) - פעיל
  - ברירת מחדל: #28a745
- **אזהרה** (`warningColor`) - פעיל
  - ברירת מחדל: #ffc107
- **סכנה** (`dangerColor`) - פעיל
  - ברירת מחדל: #dc3545
- **מידע** (`infoColor`) - פעיל
  - ברירת מחדל: #007bff

### צבעי ישויות (3 וריאנטים כל אחד: רגיל, בהיר, כהה)
- **טריידים** (`entityTradeColor`, `entityTradeColorLight`, `entityTradeColorDark`) - פעיל
- **חשבונות** (`entityAccountColor`, `entityAccountColorLight`, `entityAccountColorDark`) - פעיל
- **טיקרים** (`entityTickerColor`, `entityTickerColorLight`, `entityTickerColorDark`) - פעיל
- **התראות** (`entityAlertColor`, `entityAlertColorLight`, `entityAlertColorDark`) - פעיל
- **תזרים מזומנים** (`entityCashFlowColor`, `entityCashFlowColorLight`, `entityCashFlowColorDark`) - פעיל
- **הערות** (`entityNoteColor`, `entityNoteColorLight`, `entityNoteColorDark`) - פעיל
- **תכניות מסחר** (`entityTradePlanColor`, `entityTradePlanColorLight`, `entityTradePlanColorDark`) - פעיל
- **ביצועים** (`entityExecutionColor`, `entityExecutionColorLight`, `entityExecutionColorDark`) - פעיל

### צבעי סטטוסים (3 וריאנטים כל אחד)
- **פתוח** (`statusOpenColor`, `statusOpenColorLight`, `statusOpenColorDark`) - פעיל
- **סגור** (`statusClosedColor`, `statusClosedColorLight`, `statusClosedColorDark`) - פעיל
- **מבוטל** (`statusCancelledColor`, `statusCancelledColorLight`, `statusCancelledColorDark`) - פעיל

### צבעי סוגי השקעה (3 וריאנטים כל אחד)
- **Swing** (`typeSwingColor`, `typeSwingColorLight`, `typeSwingColorDark`) - פעיל
- **השקעה** (`typeInvestmentColor`, `typeInvestmentColorLight`, `typeInvestmentColorDark`) - פעיל
- **פסיבי** (`typePassiveColor`, `typePassiveColorLight`, `typePassiveColorDark`) - פעיל

### צבעי ערכים (3 וריאנטים כל אחד)
- **חיובי** (`valuePositiveColor`, `valuePositiveColorLight`, `valuePositiveColorDark`) - פעיל
- **ניטרלי** (`valueNeutralColor`, `valueNeutralColorLight`, `valueNeutralColorDark`) - פעיל
- **שלילי** (`valueNegativeColor`, `valueNegativeColorLight`, `valueNegativeColorDark`) - פעיל

---

## סקשן 6: הגדרות מערכת ושרת ⚙️

### הגדרות שרת
- **כתובת שרת** (`serverUrl`) - פעיל
  - ברירת מחדל: http://localhost:8080
- **פורט** (`serverPort`) - פעיל
  - ברירת מחדל: 8080

### הגדרות ביצועים
- **מרווח רענון** (`refreshInterval`) - פעיל
  - יחידות: דקות, טווח: 1-60
- **זמן Cache** (`cacheTTL`) - פעיל
  - יחידות: דקות, טווח: 1-1440
- **גודל זיכרון מקסימלי** (`maxMemorySize`) - פעיל
  - יחידות: MB, טווח: 100-2048

### הגדרות קונסולה ולוג
- **זמן ניקוי קונסולה** (`consoleCleanupInterval`) - פעיל
  - יחידות: דקות, טווח: 5-1440
- **ניקוי ידני של קונסולה** (`manualConsoleCleanup`) - פעיל
  - checkbox
- **רמת לוג** (`logLevel`) - פעיל
  - אפשרויות: Debug, Info, Warning, Error
- **גודל קובץ לוג מקסימלי** (`maxLogFileSize`) - פעיל
  - יחידות: MB, טווח: 1-100

---

## הגדרות תצוגה נוספות

### תצוגת טבלאות (עתידי - מושבת)
- **שורות בעמוד** (`tableRowsPerPage`) - עתידי
  - ברירת מחדל: 25
- **ערכת נושא ברירת מחדל** (`defaultTheme`) - עתידי
  - אפשרויות: light, dark

---

## כפתורי פעולה

### כפתורי שמירה
- **כפתור שמירה עליון** (`saveButton`) - בכותרת הראשית
- **כפתור שמירה תחתון** (`saveButtonBottom`) - בתחתית העמוד

### מערכת פרופילים
- **טעינה, יצירה, שמירה, שכפול, ייצוא, מחיקה** - כפתורי פעולה לניהול פרופילים

---

## הערות טכניות

### מערכת צבעים דינמית
- כל צבע מכיל `data-color-key` לעדכון דינמי של CSS custom properties
- 3 וריאנטים לכל ישות: רגיל (primary), בהיר (light), כהה (dark)

### מצב עתידי
- הגדרות המסומנות כ"עתידי" מושבתות (`disabled`) אך נראות בממשק
- מיועדות לפיתוח עתידי

### מערכת פרופילים
- תומכת בניהול מרובה של קבוצות הגדרות
- כוללת ייבוא/ייצוא, שכפול ומחיקה
- פרופיל ברירת מחדל תמיד קיים

---

## סה"כ הגדרות: 94 שדות
- **פעילות**: ~75 שדות
- **עתידיות (מושבתות)**: ~19 שדות
- **צבעים**: 54 שדות (18 ישויות × 3 וריאנטים)
- **טקסט/מספר**: 25 שדות
- **רשימות נפתחות**: 15 שדות

# מדריך בדיקות מערכת רמזור ATR

## סקירה כללית

מסמך זה מתאר את כל הבדיקות למערכת רמזור ATR, כולל בדיקות יחידה, אינטגרציה, E2E וביצועים.

## בדיקות Backend

### הרצת בדיקות Backend

```bash
cd Backend
export POSTGRES_HOST=localhost
export POSTGRES_DB=TikTrack-db-development
export POSTGRES_USER=TikTrakDBAdmin
export POSTGRES_PASSWORD="BigMeZoo1974!?"
python3 scripts/test_atr_threshold_preferences.py
```

### מה נבדק

1. **קיום העדפות במסד הנתונים**
   - בדיקה ש-`atr_high_threshold` קיים
   - בדיקה ש-`atr_danger_threshold` קיים

2. **ערכי ברירת מחדל**
   - `atr_high_threshold` = 3.0
   - `atr_danger_threshold` = 5.0

3. **אילוצים (Constraints)**
   - min = 0.1
   - max = 50

4. **שיוך לקבוצה**
   - שתי ההעדפות משויכות ל-`trading_settings`

5. **טעינה דרך PreferencesService**
   - בדיקה שהעדפות נטענות נכון דרך השירות

## בדיקות Frontend

### הרצת בדיקות Frontend

1. פתח את עמוד העדפות: `http://localhost:8080/trading-ui/preferences.html`
2. פתח את קונסול הדפדפן (F12)
3. הרץ: `window.runATRTests()`

### קטגוריות בדיקות

#### 1. בדיקות יחידה (Unit Tests)

- **testFieldRendererServiceExists()**: בדיקה ש-`FieldRendererService.renderATR()` קיים
- **testRenderATRWithDefaults()**: בדיקה שרנדור עובד עם ברירות מחדל (3% ו-5%)
- **testRenderATRWithCustomThresholds()**: בדיקה שרנדור עובד עם גבולות מותאמים אישית
- **testRenderATRWithNullValues()**: בדיקה שטיפול בערכים null/undefined עובד

#### 2. בדיקות אינטגרציה (Integration Tests)

- **testPreferencesLoading()**: בדיקה שהעדפות נטענות מהשרת
- **testEntityDetailsRendererIntegration()**: בדיקה שאינטגרציה עם EntityDetailsRenderer עובדת

#### 3. בדיקות CSS

- **testCSSClassesExist()**: בדיקה שכל ה-CSS classes קיימים (atr-green, atr-yellow, atr-red)

#### 4. בדיקות E2E

- **testTickerDetailsPage()**: בדיקה ש-ATR מוצג בעמוד פרטי טיקר

#### 5. בדיקות ביצועים

- **testRenderATRPerformance()**: בדיקה שרנדור ATR מהיר מספיק (< 10ms בממוצע)

## תרחישי בדיקה ידנית

### תרחיש 1: הצגת ATR במודול פרטי טיקר

1. פתח עמוד פרטי טיקר (למשל: `http://localhost:8080/trading-ui/ticker-details.html?id=1`)
2. בדוק ש-ATR מוצג עם רמזור:
   - ירוק אם ATR < 3%
   - צהוב אם 3% ≤ ATR < 5%
   - אדום אם ATR ≥ 5%
3. בדוק שהערך והבאדג' מוצגים נכון

### תרחיש 2: עדכון העדפות

1. פתח עמוד העדפות: `http://localhost:8080/trading-ui/preferences.html`
2. מצא את סקשן "הגדרות מסחר" (section3)
3. בדוק ש-2 השדות החדשים מוצגים:
   - "גבול ATR גבוה (%)"
   - "גבול ATR מסוכן (%)"
4. שנה את הערכים ושמור
5. רענן את העמוד ובדוק שהערכים נשמרו
6. פתח עמוד פרטי טיקר ובדוק שהרמזור משתנה בהתאם

### תרחיש 3: ערכים שונים

בדוק את הרמזור עם ערכי ATR שונים:

| ATR מוחלט | מחיר | ATR באחוזים | צפוי רמזור |
|-----------|------|-------------|-----------|
| 2.0 | 100 | 2.0% | ירוק |
| 3.5 | 100 | 3.5% | צהוב |
| 6.0 | 100 | 6.0% | אדום |
| 0.5 | 100 | 0.5% | ירוק |
| 4.9 | 100 | 4.9% | צהוב |
| 5.1 | 100 | 5.1% | אדום |

### תרחיש 4: גבולות מותאמים אישית

1. שנה את "גבול ATR גבוה" ל-2%
2. שנה את "גבול ATR מסוכן" ל-4%
3. שמור
4. בדוק שהרמזור משתנה בהתאם:
   - ירוק: ATR < 2%
   - צהוב: 2% ≤ ATR < 4%
   - אדום: ATR ≥ 4%

## בדיקות אוטומטיות נוספות

### בדיקת מיגרציה

```bash
cd Backend/migrations
export POSTGRES_HOST=localhost
export POSTGRES_DB=TikTrack-db-development
export POSTGRES_USER=TikTrakDBAdmin
export POSTGRES_PASSWORD="BigMeZoo1974!?"
python3 add_atr_threshold_preferences.py
```

המיגרציה צריכה:

- לבדוק אם ההעדפות כבר קיימות (idempotent)
- להוסיף את ההעדפות אם הן לא קיימות
- לתקן sequence אם נדרש

### בדיקת תאימות אחור

1. בדוק שהמערכת עובדת גם אם העדפות לא נטענו (משתמש בברירות מחדל)
2. בדוק שהמערכת עובדת גם אם ATR לא זמין (מציג "-")
3. בדוק שהמערכת עובדת גם אם `atrPercent` לא מסופק (מחשב מ-`atrValue` ו-`currentPrice`)

## דוח תוצאות

לאחר הרצת כל הבדיקות, תראה דוח סיכום:

```
============================================================
TEST SUMMARY
============================================================
Total Tests: X
Passed: Y ✅
Failed: Z ❌
Success Rate: XX.XX%
```

## פתרון בעיות

### בעיה: העדפות לא נטענות

**פתרון**:

1. בדוק שהמיגרציה הורצה בהצלחה
2. בדוק שהעדפות קיימות במסד הנתונים
3. בדוק שהמשתמש והפרופיל נכונים

### בעיה: רמזור לא משתנה

**פתרון**:

1. בדוק שהעדפות נטענו נכון (בקונסול)
2. בדוק ש-`atrPercent` מחושב נכון
3. בדוק שהגבולות נכונים

### בעיה: CSS לא מוצג

**פתרון**:

1. בדוק ש-`_badges-status.css` נטען
2. בדוק שה-classes קיימים (atr-green, atr-yellow, atr-red)
3. רענן את הדף עם Ctrl+F5

## הערות חשובות

- כל הבדיקות צריכות לעבור לפני שחרור לפרודקשן
- בדיקות ביצועים חשובות במיוחד - רנדור ATR צריך להיות מהיר
- בדיקות תאימות אחור חשובות - המערכת צריכה לעבוד גם במצבים קיצוניים


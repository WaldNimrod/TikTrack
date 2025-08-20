# מערכת ההתראות - Alert System Documentation

## סקירה כללית
מערכת ההתראות מאפשרת למשתמשים להגדיר התראות על תנאים שונים בשוק ולקבל עדכונים כאשר התנאים מתממשים.

## מבנה הטבלה

### שדות הטבלה:
- `id`: מזהה ייחודי של ההתראה
- `type`: סוג ההתראה (price_alert, stop_loss, volume_alert, וכו')
- `status`: מצב ההתראה (open, closed, cancelled)
- `condition`: התנאי להפעלת ההתראה
- `message`: הודעה שתוצג למשתמש
- `triggered_at`: תאריך הפעלת ההתראה
- `is_triggered`: מצב הפעלה (false, new, true)
- `related_type_id`: מזהה סוג הישות המשויכת (מצביע ל-note_relation_types)
- `related_id`: מזהה הישות הספציפית
- `created_at`: תאריך יצירת ההתראה

## מערכת השיוך הגמישה

### טבלת העזר note_relation_types:
התראות משתמשות באותה טבלת עזר כמו הערות לשיוך גמיש לישויות שונות:

- `id`: מזהה ייחודי
- `note_relation_type`: שם סוג השיוך

### סוגי שיוך נתמכים:
1. **account** (id=1): התראה משויכת לחשבון
2. **trade** (id=2): התראה משויכת לטרייד
3. **trade_plan** (id=3): התראה משויכת לתכנון טרייד
4. **ticker** (id=4): התראה משויכת לטיקר

### יתרונות המערכת החדשה:
- **גמישות**: אפשרות לשייך התראות לכל סוג של ישות
- **הרחבה קלה**: הוספת סוגי ישות חדשים ללא שינוי מבנה הטבלה
- **עקביות**: שימוש באותה מערכת שיוך כמו הערות
- **תאימות לאחור**: שמירה על API קיים עם endpoints חדשים
- **ניקיון קוד**: הסרת שדות ישירים (account_id, ticker_id) לטובת מערכת גמישה

## מחזור החיים של התראה

### 1. יצירת התראה חדשה
```
status: 'open'
is_triggered: 'false'
triggered_at: null
```
- התראה פעילה וממתינה להתממשות התנאי
- מוצגת בדף ההתראות
- לא מוצגת בחלון ההתראות בשאר העמודים

### 2. התממשות התנאי
```
status: 'closed'
is_triggered: 'new'
triggered_at: [תאריך הפעלה]
```
- התראה הופעלה
- מוצגת בחלון ההתראות בכל העמודים
- מוצגת בדף ההתראות

### 3. קריאת ההתראה ע"י המשתמש
```
status: 'closed'
is_triggered: 'true'
triggered_at: [תאריך הפעלה]
```
- המשתמש סימן "קראתי"
- התראה מוצגת בדף ההתראות בלבד
- לא מוצגת בחלון ההתראות בשאר העמודים

### 4. ניהול התראה בדף ההתראות

#### החזרה למצב פעיל:
```
status: 'open'
is_triggered: 'false'
triggered_at: null
```

#### ביטול התראה:
```
status: 'cancelled'
is_triggered: 'true'
```

## משמעות הסטטוסים

### Status (סטטוס):
- `open`: התראה פעילה וממתינה להתממשות
- `closed`: התראה הופעלה
- `cancelled`: התראה בוטלה

### Is_triggered (מצב הפעלה):
- `false`: התראה לא הופעלה
- `new`: התראה הופעלה אך לא נקראה
- `true`: התראה נקראה או בוטלה

## סוגי התראות

### price_alert
התראה על מחיר - מופעלת כאשר מחיר הטיקר עובר רף מסוים

### stop_loss
התראה על עצירת הפסד - מופעלת כאשר מחיר יורד מתחת לרף מסוים

### volume_alert
התראה על נפח מסחר - מופעלת כאשר נפח המסחר עובר רף מסוים

### custom_alert
התראה מותאמת אישית - מופעלת לפי תנאים מותאמים

## API Endpoints

### יצירת התראה חדשה
```
POST /api/v1/alerts/
```

### קבלת כל ההתראות
```
GET /api/v1/alerts/
```

### קבלת התראה לפי מזהה
```
GET /api/v1/alerts/{alert_id}
```

### עדכון התראה
```
PUT /api/v1/alerts/{alert_id}
```

### מחיקת התראה
```
DELETE /api/v1/alerts/{alert_id}
```

### סימון התראה כנקראה
```
PATCH /api/v1/alerts/{alert_id}/mark-read
```

### החזרת התראה למצב פעיל
```
PATCH /api/v1/alerts/{alert_id}/reactivate
```

### ביטול התראה
```
PATCH /api/v1/alerts/{alert_id}/cancel
```

### קבלת התראות לפי ישות (חדש)
```
GET /api/v1/alerts/entity/{entity_type}/{entity_id}
```

### קבלת התראות לפי חשבון (תאימות לאחור)
```
GET /api/v1/alerts/account/{account_id}
```

### קבלת התראות לפי טיקר (תאימות לאחור)
```
GET /api/v1/alerts/ticker/{ticker_id}
```

### קבלת התראות לפי טרייד (חדש)
```
GET /api/v1/alerts/trade/{trade_id}
```

### קבלת התראות לפי תכנון טרייד (חדש)
```
GET /api/v1/alerts/trade-plan/{trade_plan_id}
```

## דוגמאות שימוש

### יצירת התראה חדשה:
```json
{
  "related_type": "account",
  "related_id": 1,
  "type": "price_alert",
  "condition": "מחיר > 160$",
  "message": "Apple הגיע ליעד המחיר"
}
```

### יצירת התראה לטרייד:
```json
{
  "related_type": "trade",
  "related_id": 5,
  "type": "stop_loss",
  "condition": "מחיר < 150$",
  "message": "סטופ לוס לטרייד AAPL"
}
```

### יצירת התראה לתכנון טרייד:
```json
{
  "related_type": "trade_plan",
  "related_id": 3,
  "type": "price_alert",
  "condition": "מחיר = 155$",
  "message": "תנאי כניסה לתכנון TSLA"
}
```

### עדכון התראה לאחר הפעלה:
```json
{
  "status": "closed",
  "is_triggered": "new",
  "triggered_at": "2025-08-18T10:30:00"
}
```

### סימון התראה כנקראה:
```json
{
  "is_triggered": "true"
}
```

## לוגיקת הצגה

### חלון התראות (Header):
- מציג רק התראות עם `is_triggered = 'new'`
- לא מציג התראות עם `is_triggered = 'true'`

### דף התראות:
- מציג את כל ההתראות
- מאפשר ניהול (החזרה למצב פעיל, ביטול)
- מסנן לפי סטטוס ומצב הפעלה

### דפים אחרים:
- מציגים התראות חדשות בלבד (`is_triggered = 'new'`)
- לא מציגים התראות שנקראו (`is_triggered = 'true'`)

## מיגרציה

### עדכון מבנה הטבלה:
המיגרציה `update_alerts_structure.py` מבצעת:
1. הוספת שדות `related_type_id` ו-`related_id`
2. העברת נתונים קיימים למערכת החדשה
3. הסרת שדות `account_id`, `ticker_id` ו-`related_type_id` ו-`related_id`
4. הוספת סוג שיוך 'ticker' לטבלת העזר
5. יצירת אינדקסים לביצועים

### הרצת המיגרציה:
```bash
cd Backend
python3 migrations/update_alerts_structure.py
```

## תאימות לאחור

המערכת החדשה שומרת על תאימות לאחור:
- Endpoints ישנים ממשיכים לעבוד
- שדות `account_id`, `ticker_id` זמינים דרך `to_dict()`
- API responses כוללים את השדות הישנים

## יתרונות המערכת החדשה

1. **גמישות**: שיוך התראות לכל סוג של ישות
2. **הרחבה קלה**: הוספת סוגי ישות חדשים ללא שינוי מבנה
3. **עקביות**: שימוש באותה מערכת שיוך כמו הערות
4. **ביצועים**: אינדקסים מותאמים לחיפושים מהירים
5. **תחזוקה**: קוד מאורגן ומודולרי יותר

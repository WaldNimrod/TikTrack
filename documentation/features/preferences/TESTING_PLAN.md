# תוכנית בדיקות - מערכת העדפות

## שלב 5: בדיקות מקיפות

## 5.1 בדיקות יחידה

### בדיקת PreferencesManager

**קבצים לבדיקה:**
- `trading-ui/scripts/preferences-manager.js`

**תרחישי בדיקה:**

1. **initialize()**
   - [ ] אתחול מוצלח עם userId ו-profileId
   - [ ] אתחול מוצלח ללא פרמטרים (שימוש ב-defaults)
   - [ ] מניעת אתחול כפול (idempotency)
   - [ ] טעינת critical preferences
   - [ ] dispatch event `preferences:initialized`

2. **loadGroup()**
   - [ ] טעינה מהמטמון (cache hit)
   - [ ] טעינה מהשרת (cache miss)
   - [ ] deduplication - מניעת טעינות כפולות
   - [ ] forceRefresh - טעינה מחדש מהשרת
   - [ ] עדכון `window.currentPreferences`

3. **saveGroup()**
   - [ ] שמירה מוצלחת
   - [ ] optimistic update - עדכון UI מיד
   - [ ] עדכון מטמון עם ערכים שנשמרו
   - [ ] dispatch event `preferences:saved`
   - [ ] rollback במקרה של שגיאה
   - [ ] deduplication - מניעת שמירות כפולות

4. **refreshGroup()**
   - [ ] ניקוי מטמון
   - [ ] טעינה מחדש מהשרת
   - [ ] force flag - טעינה מחדש גם אם יש במטמון

**סקריפט בדיקה:** `Backend/scripts/test_preferences_manager.py`

### בדיקת PreferencesCache

**קבצים לבדיקה:**
- `trading-ui/scripts/preferences-cache.js`

**תרחישי בדיקה:**

1. **buildKey()**
   - [ ] פורמט נכון: `preference_{type}_{identifier}_{userId}_{profileId}`
   - [ ] טיפול ב-null/undefined values
   - [ ] עקביות בפורמט

2. **parseKey()**
   - [ ] parsing נכון של cache keys
   - [ ] טיפול ב-keys לא תקינים

3. **get()**
   - [ ] קריאה מ-memory layer
   - [ ] קריאה מ-localStorage layer
   - [ ] קריאה מ-IndexedDB layer
   - [ ] fallback ל-API אם אין במטמון
   - [ ] TTL validation

4. **set()**
   - [ ] שמירה ל-memory layer
   - [ ] שמירה ל-localStorage layer
   - [ ] שמירה ל-IndexedDB layer
   - [ ] TTL setting

5. **invalidate()**
   - [ ] ניקוי key ספציפי
   - [ ] ניקוי pattern (wildcards)
   - [ ] ניקוי מכל השכבות

6. **clearGroup()**
   - [ ] ניקוי מטמון של קבוצה
   - [ ] ניקוי גם של all preferences cache

**סקריפט בדיקה:** `Backend/scripts/test_preferences_cache.py`

### בדיקת PreferencesUI

**קבצים לבדיקה:**
- `trading-ui/scripts/preferences-ui-layer.js`

**תרחישי בדיקה:**

1. **populateGroup()**
   - [ ] מילוי שדות בקבוצה
   - [ ] דילוג על שדות modified
   - [ ] תמיכה ב-checkbox, select, input
   - [ ] שימוש ב-PreferencesGroupManager אם זמין

2. **updateField()**
   - [ ] עדכון שדה בודד
   - [ ] תמיכה ב-checkbox
   - [ ] תמיכה ב-input/select

3. **updateFields()**
   - [ ] עדכון מספר שדות
   - [ ] עדכון רק שדות קיימים

4. **markFieldAsModified() / clearFieldModification()**
   - [ ] סימון שדה כנערך
   - [ ] ניקוי סימון
   - [ ] עדכון dataset

**סקריפט בדיקה:** `Backend/scripts/test_preferences_ui.py`

### בדיקת PreferencesEvents

**קבצים לבדיקה:**
- `trading-ui/scripts/preferences-events.js`

**תרחישי בדיקה:**

1. **dispatch()**
   - [ ] שליחת event מוצלחת
   - [ ] detail object נכון
   - [ ] timestamp נכון

2. **listen()**
   - [ ] האזנה ל-event
   - [ ] handler נקרא נכון
   - [ ] unsubscribe function עובד
   - [ ] error handling ב-handler

3. **removeAllListeners()**
   - [ ] הסרת כל ה-listeners
   - [ ] cleanup נכון

**סקריפט בדיקה:** `Backend/scripts/test_preferences_events.py`

## 5.2 בדיקות אינטגרציה

### בדיקת תהליך טעינת עמוד מלא

**תרחיש:**
1. טעינת עמוד העדפות
2. אתחול PreferencesManager
3. טעינת critical preferences
4. טעינת קבוצות לפי demand
5. מילוי שדות UI

**בדיקות:**
- [ ] כל השלבים רצים בסדר הנכון
- [ ] אין טעינות כפולות
- [ ] מטמון עובד נכון
- [ ] UI מתמלא נכון
- [ ] אין שגיאות בקונסול

**סקריפט בדיקה:** `Backend/scripts/test_preferences_page_load.py`

### בדיקת תהליך שמירה מלא

**תרחיש:**
1. שינוי ערך בשדה
2. לחיצה על שמור
3. שמירה לשרת
4. optimistic update
5. עדכון מטמון
6. dispatch event

**בדיקות:**
- [ ] שמירה לשרת מוצלחת
- [ ] UI מתעדכן מיד (optimistic)
- [ ] מטמון מתעדכן
- [ ] event נשלח
- [ ] אין טעינה מחדש מהשרת
- [ ] אין שגיאות

**סקריפט בדיקה:** `Backend/scripts/test_preferences_save_flow.py`

### בדיקת ניהול מטמון

**תרחיש:**
1. טעינת העדפות
2. שמירה במטמון
3. קריאה מהמטמון
4. ניקוי מטמון
5. טעינה מחדש

**בדיקות:**
- [ ] שמירה לכל השכבות
- [ ] קריאה מהשכבה הנכונה
- [ ] TTL עובד נכון
- [ ] ניקוי מטמון עובד
- [ ] אין race conditions

**סקריפט בדיקה:** `Backend/scripts/test_preferences_cache_integration.py`

### בדיקת event system

**תרחיש:**
1. dispatch event
2. listener מקבל event
3. handler רץ
4. cleanup

**בדיקות:**
- [ ] events נשלחים נכון
- [ ] listeners מקבלים events
- [ ] handlers רצים נכון
- [ ] cleanup עובד
- [ ] אין memory leaks

**סקריפט בדיקה:** `Backend/scripts/test_preferences_events_integration.py`

## 5.3 בדיקות ביצועים

### מדידת זמן טעינה

**לפני אופטימיזציה:**
- [ ] מדידת זמן טעינת עמוד
- [ ] מדידת מספר קריאות API
- [ ] מדידת זמן שמירה

**אחרי אופטימיזציה:**
- [ ] מדידת זמן טעינת עמוד (צריך להיות מהיר יותר)
- [ ] מדידת מספר קריאות API (צריך להיות פחות)
- [ ] מדידת זמן שמירה (צריך להיות מהיר יותר)

**יעדים:**
- זמן טעינה: < 500ms
- קריאות API: < 3 (לעמוד העדפות)
- זמן שמירה: < 200ms (ללא טעינה מחדש)

**סקריפט בדיקה:** `Backend/scripts/test_preferences_performance.py`

### מדידת שימוש במטמון

**בדיקות:**
- [ ] cache hit rate > 80%
- [ ] זמן קריאה מהמטמון < 10ms
- [ ] זמן שמירה למטמון < 20ms
- [ ] גודל מטמון < 5MB

**סקריפט בדיקה:** `Backend/scripts/test_preferences_cache_performance.py`

### זיהוי bottlenecks

**בדיקות:**
- [ ] זיהוי קריאות API מיותרות
- [ ] זיהוי טעינות כפולות
- [ ] זיהוי population כפול
- [ ] זיהוי race conditions

**סקריפט בדיקה:** `Backend/scripts/test_preferences_bottlenecks.py`

## 5.4 בדיקות משתמש

### בדיקת שינוי ערך ושמירה

**תרחיש:**
1. פתיחת עמוד העדפות
2. שינוי ערך בשדה (למשל `atr_period`)
3. לחיצה על שמור
4. בדיקת שהערך נשמר
5. ריענון עמוד
6. בדיקת שהערך נשאר

**בדיקות:**
- [ ] הערך משתנה מיד ב-UI (optimistic)
- [ ] השמירה מוצלחת
- [ ] הערך נשאר אחרי ריענון
- [ ] אין טעינה מחדש מיותרת
- [ ] אין שגיאות

**סקריפט בדיקה:** `Backend/scripts/test_preferences_user_save.py`

### בדיקת ריענון עמוד

**תרחיש:**
1. טעינת עמוד העדפות
2. שינוי ערך
3. שמירה
4. ריענון עמוד (F5)
5. בדיקת שהערכים נטענים נכון

**בדיקות:**
- [ ] הערכים נטענים מהמטמון
- [ ] הערכים נכונים (לא ישנים)
- [ ] אין טעינה מחדש מיותרת
- [ ] זמן טעינה מהיר

**סקריפט בדיקה:** `Backend/scripts/test_preferences_page_refresh.py`

### בדיקת החלפת פרופיל

**תרחיש:**
1. טעינת עמוד העדפות
2. החלפת פרופיל
3. בדיקת שהעדפות נטענות לפרופיל החדש
4. בדיקת שהמטמון נוקה

**בדיקות:**
- [ ] העדפות נטענות לפרופיל החדש
- [ ] מטמון נוקה מהפרופיל הישן
- [ ] אין עירוב בין פרופילים
- [ ] זמן טעינה סביר

**סקריפט בדיקה:** `Backend/scripts/test_preferences_profile_switch.py`

### בדיקת edge cases

**תרחישים:**
1. שמירה עם שגיאת רשת
2. טעינה עם מטמון פגום
3. שמירה עם ערכים לא תקינים
4. טעינה עם userId/profileId לא תקינים
5. שמירה במקביל (race condition)

**בדיקות:**
- [ ] rollback במקרה של שגיאה
- [ ] טיפול במטמון פגום
- [ ] validation של ערכים
- [ ] טיפול ב-race conditions
- [ ] error messages ברורים

**סקריפט בדיקה:** `Backend/scripts/test_preferences_edge_cases.py`

## 5.5 תוכנית ביצוע

### שלב 1: בדיקות יחידה (יום 1)
- [ ] בדיקת PreferencesManager
- [ ] בדיקת PreferencesCache
- [ ] בדיקת PreferencesUI
- [ ] בדיקת PreferencesEvents

### שלב 2: בדיקות אינטגרציה (יום 2)
- [ ] בדיקת תהליך טעינה מלא
- [ ] בדיקת תהליך שמירה מלא
- [ ] בדיקת ניהול מטמון
- [ ] בדיקת event system

### שלב 3: בדיקות ביצועים (יום 3)
- [ ] מדידת זמן טעינה
- [ ] מדידת שימוש במטמון
- [ ] זיהוי bottlenecks

### שלב 4: בדיקות משתמש (יום 4)
- [ ] בדיקת שינוי ושמירה
- [ ] בדיקת ריענון עמוד
- [ ] בדיקת החלפת פרופיל
- [ ] בדיקת edge cases

### שלב 5: סיכום ותיעוד (יום 5)
- [ ] סיכום תוצאות
- [ ] תיעוד בעיות
- [ ] תיעוד שיפורים
- [ ] המלצות להמשך

## 5.6 כלי בדיקה

### כלי בדיקה אוטומטיים

1. **Browser DevTools**
   - Performance tab - מדידת ביצועים
   - Network tab - מדידת קריאות API
   - Console - בדיקת שגיאות
   - Application tab - בדיקת מטמון

2. **Custom Test Scripts**
   - סקריפטי Python לבדיקות backend
   - סקריפטי JavaScript לבדיקות frontend
   - סקריפטי integration

3. **Manual Testing Checklist**
   - רשימת בדיקות ידניות
   - תרחישי משתמש
   - edge cases

## 5.7 קריטריוני הצלחה

### ביצועים
- [ ] זמן טעינה < 500ms
- [ ] קריאות API < 3 לעמוד
- [ ] זמן שמירה < 200ms
- [ ] cache hit rate > 80%

### פונקציונליות
- [ ] כל הפונקציות עובדות
- [ ] אין שגיאות בקונסול
- [ ] optimistic updates עובדים
- [ ] מטמון עובד נכון

### UX
- [ ] אין עיכובים מיותרים
- [ ] אין "קפיצות" בערכים
- [ ] הערכים נשמרים נכון
- [ ] ריענון עמוד עובד

## סיכום

**מספר בדיקות:** ~40
**זמן ביצוע מוערך:** 4-5 ימים
**כלים נדרשים:** Browser DevTools, Python scripts, Manual testing


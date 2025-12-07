# העברה לצוות הטסטים - עדכון סביבת Testing

**תאריך:** ינואר 2025  
**מטרה:** עדכון הסביבה הנוכחית (production) לסביבת Testing

---

## 📌 הקשר והרקע

### המצב הנוכחי:
- יש לנו סביבה שנקראת **"production"** ונמצאת בתיקייה: `production/`
- זו **סביבת פרודקשן מקומית** (local production) ששימשה עד כה כסביבת פרודקשן מקומית
- הסביבה מכירה את עצמה כ-`IS_PRODUCTION = True`
- Database: `TikTrack-db-production`
- פורט: `5001`

### המעבר ל-3 סביבות:
כחלק מתהליך המעבר לסביבה אינטרנטית, אנחנו עוברים ל-**3 סביבות**:
1. **Development** - סביבת פיתוח (תיקייה: `TikTrackApp/`)
2. **Testing** - סביבת בדיקות (תיקייה: `production/` - **תישאר!**)
3. **Online** - סביבת אונליין (תיקייה חדשה שתיווצר)

### המשימה:
להפוך את הסביבה הנוכחית (`production/`) מסביבת פרודקשן מקומית לסביבת **Testing**.

⚠️ **חשוב:** התיקייה `production/` תישאר בשם הזה, אבל התוכן שלה ישתנה:
- הגדרות הסביבה: `IS_PRODUCTION = True` → `IS_TESTING = True`
- שם Database: `TikTrack-db-production` → `TikTrack-db-testing`
- ייעוד: סביבת פרודקשן מקומית → סביבת בדיקות לפני עליה לאוויר

---

## 📋 מסמכים להעברה

### מסמך ראשי (חובה!) ⭐
**`TESTING_ENVIRONMENT_WORK_INSTRUCTIONS.md`** - הוראות עבודה מפורטות

זה המסמך הראשי - כולל את כל השלבים המפורטים, פקודות, בדיקות, ופתרון בעיות.

### Quick Reference ⭐
**`TESTING_ENVIRONMENT_QUICK_REFERENCE.md`** - Quick reference מהיר

לשימוש מהיר - פקודות ובדיקות עיקריות.

### מסמכי תמיכה (אופציונלי)
- `TESTING_ENVIRONMENT_UPDATE_PLAN.md` - תוכנית מפורטת (תיעוד)
- `TESTING_ENVIRONMENT_CHECKLIST.md` - Checklist מקיף

---

## 🚀 התחלה

### שלב 1: קריאה
1. קרא את `TESTING_ENVIRONMENT_WORK_INSTRUCTIONS.md` מהתחלה עד הסוף
2. ודא שהבנת את כל השלבים
3. ודא שיש לך את כל ההרשאות הנדרשות

### שלב 2: ביצוע
1. בצע את כל השלבים לפי הסדר
2. השתמש ב-`TESTING_ENVIRONMENT_QUICK_REFERENCE.md` לבדיקות מהירות
3. בדוק אחרי כל שלב

### שלב 3: אימות
1. בצע את כל הבדיקות המפורטות
2. ודא שהכל עובד
3. Commit & Push

---

## ⚠️ חשוב לפני התחלה

### חובה:
- ✅ **גיבוי מלא** של database הנוכחי
- ✅ **גיבוי** של כל קבצי config
- ✅ **בדיקה** שהסביבה הנוכחית עובדת
- ✅ **תיעוד** של כל ההגדרות הנוכחיות

### תנאים:
- ✅ יש גישה ל-PostgreSQL
- ✅ יש גישה לתיקייה `production/`
- ✅ יש הרשאות לערוך קבצים
- ✅ יש הרשאות להפעיל שרת

---

## 📝 מה משתנה

### שינויים:
- שם סביבה: `production` → `testing`
- שם Database: `TikTrack-db-production` → `TikTrack-db-testing`
- הגדרות Config: `IS_PRODUCTION = True` → `IS_TESTING = True`

### נשאר זהה:
- תיקיית הקוד: `production/` (נשאר)
- פורט: 5001 (נשאר)
- תהליך עדכון: Master Script נשאר זהה

---

## ✅ Checklist מהיר

- [ ] גיבוי database
- [ ] גיבוי config
- [ ] יצירת `TikTrack-db-testing`
- [ ] העתקת data
- [ ] עדכון `settings.py`
- [ ] עדכון `start_server.sh`
- [ ] בדיקת config
- [ ] בדיקת server
- [ ] Commit & Push

---

## 🔍 בדיקות מהירות

```bash
# Config
cd production/Backend
python3 -c "from config.settings import IS_TESTING, POSTGRES_DB; \
    print(f'Testing: {IS_TESTING}, DB: {POSTGRES_DB}')"

# Database
psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c "SELECT COUNT(*) FROM trades;"

# Server
curl http://localhost:5001/api/health
```

---

## 📞 תמיכה

**אם יש בעיות:**
1. בדוק את הלוגים: `production/Backend/server_output.log`
2. בדוק את ה-config: `production/Backend/config/settings.py`
3. בדוק את ה-database: `psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c "\dt"`
4. פנה לצוות הפיתוח עם פרטי השגיאה

---

**עודכן:** ינואר 2025  
**גרסה:** 1.0



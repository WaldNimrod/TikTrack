# מסמכי Online Deployment - TikTrack

**תאריך:** ינואר 2025  
**גרסה:** 1.0  
**מטרה:** מסמכי תכנון והכנה להעלאת TikTrack לאינטרנט

---

## 📋 רשימת מסמכים

### שלב 1: מחקר שרת (הושלם)

- `SERVER_COMPARISON.md` - השוואת שרתים
- `SERVER_RECOMMENDATION.md` - המלצה סופית
- `SYSTEM_REQUIREMENTS.md` - דרישות מערכת
- `UPress_VPS_ALL_PLANS_ANALYSIS.md` - ניתוח כל חבילות uPress
- `UPress_FINAL_RECOMMENDATION.md` - המלצה סופית מעודכנת
- `UPress_INQUIRY_LETTER.md` - מכתב פניה ל-uPress
- `STAGE_1_FINAL_SUMMARY.md` - סיכום שלב 1

### שלב 2: תכנון סביבות

- `ENVIRONMENT_SETUP.md` - הגדרת 3 סביבות
- `ENVIRONMENT_NAMING.md` - שמות וזיהוי סביבות
- `CODE_CHANGES_PLAN.md` - תוכנית שינויים בקוד

### שלב 3: עדכון סביבת Testing (דחוף!) ⚠️

- `TESTING_ENVIRONMENT_WORK_INSTRUCTIONS.md` - **הוראות עבודה לצוות** ⭐
- `TESTING_ENVIRONMENT_QUICK_REFERENCE.md` - Quick reference ⭐
- `TESTING_ENVIRONMENT_UPDATE_PLAN.md` - תוכנית מפורטת
- `TESTING_ENVIRONMENT_CHECKLIST.md` - Checklist מקיף
- `PRE_HANDOFF_CHECKLIST.md` - Checklist הכנות לפני העברה
- `HANDOFF_README.md` - README להעברה לצוות

### שלב 4: תכנון DNS/SSL

- `DNS_SETUP.md` - הוראות הגדרת DNS
- `SSL_SETUP.md` - הוראות SSL (אם נוצר)

### שלב 5: תכנון Database

- `DATABASE_MIGRATION_PLAN.md` - תוכנית העברת database

### שלב 6: תכנון Deployment

- `DEPLOYMENT_CHECKLIST.md` - Checklist פריסה

### שלב 7: מסמכי תמיכה

- `WHILE_WAITING_FOR_UPress.md` - מה לעשות עד לקבלת תשובה
- `README.md` - זה הקובץ

---

## 🚀 סדר עדיפויות

### עדיפות גבוהה (דחוף!)

1. **עדכון סביבת Testing** - חייב להיעשות לפני עליה לאוויר
   - מסמכים: `TESTING_ENVIRONMENT_WORK_INSTRUCTIONS.md`, `TESTING_ENVIRONMENT_QUICK_REFERENCE.md`

### עדיפות בינונית

2. **תכנון 3 סביבות** - בסיס לכל השאר
3. **תכנון DNS/SSL** - לא תלוי בתשובה מ-uPress
4. **תכנון העברת database** - חשוב לתכנן מראש

---

## 📝 הוראות שימוש

### לצוות הטסטים

1. קרא את `HANDOFF_README.md`
2. קרא את `TESTING_ENVIRONMENT_WORK_INSTRUCTIONS.md` מהתחלה
3. בצע את כל השלבים לפי הסדר
4. השתמש ב-`TESTING_ENVIRONMENT_QUICK_REFERENCE.md` לבדיקות מהירות

### לצוות הפיתוח

1. קרא את `PRE_HANDOFF_CHECKLIST.md` לפני העברה
2. ודא שכל המסמכים נשמרו ב-Git
3. העבר את המסמכים לצוות הטסטים

---

## 🔗 קבצים רלוונטיים

### במערכת

- `Backend/config/settings.py` - Development config
- `production/Backend/config/settings.py` - Testing config (לאחר עדכון)
- `start_server.sh` - זיהוי סביבות
- `scripts/production-update/master.py` - תהליך עדכון

### Documentation

- `documentation/production/UPDATE_PROCESS.md` - תהליך עדכון קיים
- `documentation/production/ENVIRONMENT_ISOLATION_GUIDE.md` - בידוד סביבות

---

**עודכן:** ינואר 2025  
**גרסה:** 1.0


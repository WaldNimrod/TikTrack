# הודעה להעברה לצוות הטסטים

**תאריך:** ינואר 2025  
**מטרה:** הודעה מוכנה להעברה לצוות הטסטים

---

## 📧 הודעה לצוות הטסטים

```
שלום,

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 הקשר והרקע:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

כרגע יש לנו סביבה שנקראת "production" ונמצאת בתיקייה:
📁 production/

זו סביבת פרודקשן מקומית (local production) ששימשה עד כה כסביבת 
פרודקשן מקומית.

כחלק מתהליך המעבר לסביבה אינטרנטית, אנחנו עוברים ל-3 סביבות:
1. Development - סביבת פיתוח (תיקייה: TikTrackApp/)
2. Testing - סביבת בדיקות (תיקייה: production/ - תישאר!)
3. Online - סביבת אונליין (תיקייה חדשה שתיווצר)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 המשימה:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

להפוך את הסביבה הנוכחית (production/) מסביבת פרודקשן מקומית
לסביבת Testing.

⚠️ חשוב: התיקייה production/ תישאר בשם הזה, אבל התוכן שלה ישתנה:
- הגדרות הסביבה: IS_PRODUCTION → IS_TESTING
- שם Database: TikTrack-db-production → TikTrack-db-testing
- ייעוד: סביבת פרודקשן מקומית → סביבת בדיקות לפני עליה לאוויר

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 מסמכי עבודה:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

הכנו מסמכי עבודה מפורטים עם הוראות שלב אחר שלב, כל הפקודות הנדרשות, 
בדיקות ואימות, ופתרון בעיות.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 מסמכים להעברה:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⭐ מסמך ראשי (חובה!):
📄 TESTING_ENVIRONMENT_WORK_INSTRUCTIONS.md
   הוראות עבודה מפורטות שלב אחר שלב
   קישור: https://github.com/WaldNimrod/TikTrack/blob/main/documentation/production/ONLINE_DEPLOYMENT/TESTING_ENVIRONMENT_WORK_INSTRUCTIONS.md

⭐ Quick Reference:
📄 TESTING_ENVIRONMENT_QUICK_REFERENCE.md
   Quick reference מהיר - פקודות ובדיקות עיקריות
   קישור: https://github.com/WaldNimrod/TikTrack/blob/main/documentation/production/ONLINE_DEPLOYMENT/TESTING_ENVIRONMENT_QUICK_REFERENCE.md

⭐ README להעברה:
📄 HANDOFF_README.md
   README עם הוראות התחלה וסקירה כללית
   קישור: https://github.com/WaldNimrod/TikTrack/blob/main/documentation/production/ONLINE_DEPLOYMENT/HANDOFF_README.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 מיקום ב-Git:

תיקייה: documentation/production/ONLINE_DEPLOYMENT/

קישור לתיקייה:
https://github.com/WaldNimrod/TikTrack/tree/main/documentation/production/ONLINE_DEPLOYMENT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 הוראות התחלה:

1. קראו את HANDOFF_README.md לפני התחלת העבודה
2. קראו את TESTING_ENVIRONMENT_WORK_INSTRUCTIONS.md מהתחלה עד הסוף
3. השתמשו ב-TESTING_ENVIRONMENT_QUICK_REFERENCE.md לבדיקות מהירות
4. בצעו את כל השלבים לפי הסדר
5. בדקו אחרי כל שלב

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ חשוב לפני התחלה:

- חובה: גיבוי מלא של database הנוכחי
- חובה: גיבוי של כל קבצי config
- חובה: בדיקה שהסביבה הנוכחית עובדת
- חובה: תיעוד של כל ההגדרות הנוכחיות

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 מה משתנה:

- שם סביבה: production → testing
- שם Database: TikTrack-db-production → TikTrack-db-testing
- הגדרות Config: IS_PRODUCTION = True → IS_TESTING = True

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 תמיכה:

אם יש בעיות:
1. בדקו את הלוגים: production/Backend/server_output.log
2. בדקו את ה-config: production/Backend/config/settings.py
3. בדקו את ה-database: psql -U TikTrakDBAdmin -d "TikTrack-db-testing" -c "\dt"
4. פנו לצוות הפיתוח עם פרטי השגיאה

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

בהצלחה!
```

---

## 📋 קישורים ישירים לכל הקבצים

### מסמכים ראשיים (חובה):
1. **TESTING_ENVIRONMENT_WORK_INSTRUCTIONS.md**
   ```
   https://github.com/WaldNimrod/TikTrack/blob/main/documentation/production/ONLINE_DEPLOYMENT/TESTING_ENVIRONMENT_WORK_INSTRUCTIONS.md
   ```

2. **TESTING_ENVIRONMENT_QUICK_REFERENCE.md**
   ```
   https://github.com/WaldNimrod/TikTrack/blob/main/documentation/production/ONLINE_DEPLOYMENT/TESTING_ENVIRONMENT_QUICK_REFERENCE.md
   ```

3. **HANDOFF_README.md**
   ```
   https://github.com/WaldNimrod/TikTrack/blob/main/documentation/production/ONLINE_DEPLOYMENT/HANDOFF_README.md
   ```

### מסמכי תמיכה (אופציונלי):
4. **TESTING_ENVIRONMENT_UPDATE_PLAN.md**
   ```
   https://github.com/WaldNimrod/TikTrack/blob/main/documentation/production/ONLINE_DEPLOYMENT/TESTING_ENVIRONMENT_UPDATE_PLAN.md
   ```

5. **TESTING_ENVIRONMENT_CHECKLIST.md**
   ```
   https://github.com/WaldNimrod/TikTrack/blob/main/documentation/production/ONLINE_DEPLOYMENT/TESTING_ENVIRONMENT_CHECKLIST.md
   ```

### קישור לתיקייה:
```
https://github.com/WaldNimrod/TikTrack/tree/main/documentation/production/ONLINE_DEPLOYMENT
```

---

## 📧 הודעה קצרה (אופציה 2)

```
שלום,

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 הקשר:

כרגע יש לנו סביבה שנקראת "production" בתיקייה production/.
זו סביבת פרודקשן מקומית שצריכה להפוך לסביבת Testing.

⚠️ התיקייה production/ תישאר, אבל התוכן ישתנה:
- הגדרות: IS_PRODUCTION → IS_TESTING
- Database: TikTrack-db-production → TikTrack-db-testing
- ייעוד: פרודקשן מקומי → Testing לפני עליה לאוויר

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

הכנו מסמכי עבודה מפורטים לעדכון סביבת Testing.

מסמך ראשי:
https://github.com/WaldNimrod/TikTrack/blob/main/documentation/production/ONLINE_DEPLOYMENT/TESTING_ENVIRONMENT_WORK_INSTRUCTIONS.md

Quick Reference:
https://github.com/WaldNimrod/TikTrack/blob/main/documentation/production/ONLINE_DEPLOYMENT/TESTING_ENVIRONMENT_QUICK_REFERENCE.md

README:
https://github.com/WaldNimrod/TikTrack/blob/main/documentation/production/ONLINE_DEPLOYMENT/HANDOFF_README.md

תיקייה מלאה:
https://github.com/WaldNimrod/TikTrack/tree/main/documentation/production/ONLINE_DEPLOYMENT

אנא קראו את HANDOFF_README.md לפני התחלת העבודה.

בהצלחה!
```

---

**עודכן:** ינואר 2025  
**גרסה:** 1.0



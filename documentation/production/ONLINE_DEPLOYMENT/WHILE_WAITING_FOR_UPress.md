# מה אפשר לקדם עד לקבלת תשובה מ-uPress

**תאריך:** ינואר 2025  
**גרסה:** 1.0  
**מטרה:** רשימת משימות שניתן לבצע כבר עכשיו, ללא תלות בתשובה מ-uPress

---

## ✅ משימות שניתן לבצע כבר עכשיו

### 1. תכנון 3 סביבות - שלב 2

**מה אפשר לעשות:**
- ✅ תכנון מפורט של מבנה 3 הסביבות
- ✅ הגדרת שמות databases לכל סביבה
- ✅ תכנון זיהוי סביבות (directory names, environment variables)
- ✅ יצירת מסמכי תכנון

**קבצים ליצירה:**
- `documentation/production/ONLINE_DEPLOYMENT/ENVIRONMENT_SETUP.md` - מדריך הגדרת 3 סביבות
- `documentation/production/ONLINE_DEPLOYMENT/ENVIRONMENT_NAMING.md` - שמות וזיהוי סביבות

---

### 2. עדכון מערכת הסביבות - שלב 4 (חלקי)

**מה אפשר לעשות:**
- ✅ תכנון השינויים הנדרשים בקוד
- ✅ יצירת רשימת קבצים לעדכון
- ✅ תכנון מבנה קבצי config חדשים
- ⚠️ לא לבצע שינויים בקוד עד לקבלת תשובה מ-uPress

**קבצים לתכנון:**
- רשימת קבצים לעדכון
- תכנון מבנה `online/Backend/config/settings.py`
- תכנון עדכון `start_server.sh` לזיהוי 3 סביבות

---

### 3. הכנת סאב-דומיין - שלב 3

**מה אפשר לעשות:**
- ✅ בדיקת זמינות הדומיין `tiktrack.nimrod.bio`
- ✅ תכנון הגדרת DNS
- ✅ תכנון הגדרת SSL
- ✅ יצירת מדריך DNS setup

**קבצים ליצירה:**
- `documentation/production/ONLINE_DEPLOYMENT/DNS_SETUP.md` - הוראות הגדרת DNS
- `documentation/production/ONLINE_DEPLOYMENT/SSL_SETUP.md` - הוראות SSL

---

### 4. מסמכי תכנון נוספים

**מה אפשר לעשות:**
- ✅ תכנון תהליך העברת database מ-testing ל-online
- ✅ תכנון תהליך deployment
- ✅ תכנון בדיקות מקיפות
- ✅ יצירת checklists

**קבצים ליצירה:**
- `documentation/production/ONLINE_DEPLOYMENT/DATABASE_MIGRATION_PLAN.md` - תכנון העברת database
- `documentation/production/ONLINE_DEPLOYMENT/DEPLOYMENT_CHECKLIST.md` - checklist פריסה
- `documentation/production/ONLINE_DEPLOYMENT/TESTING_PLAN.md` - תוכנית בדיקות

---

### 5. הכנת סקריפטים

**מה אפשר לעשות:**
- ✅ תכנון סקריפטי deployment
- ✅ תכנון סקריפטי sync ל-online
- ✅ תכנון סקריפטי בדיקות
- ⚠️ לא ליצור סקריפטים סופיים עד לקבלת תשובה (יכול להיות שינויים)

**קבצים לתכנון:**
- תכנון `scripts/sync_to_online.py`
- תכנון `scripts/deployment/deploy_to_online.sh`
- תכנון `scripts/testing/test_online_environment.py`

---

## 🎯 סדר עדיפויות

### עדיפות גבוהה (ניתן לבצע מיד)
1. **עדכון סביבת Testing** - ⚠️ **קריטי לפני עליה לאוויר!**
2. **תכנון 3 סביבות** - מדריך מפורט
3. **תכנון DNS/SSL** - מדריכי הגדרה
4. **תכנון העברת database** - תהליך מפורט

### עדיפות בינונית
4. **תכנון עדכוני קוד** - רשימת שינויים נדרשים
5. **תכנון בדיקות** - תוכנית בדיקות מקיפה

### עדיפות נמוכה (לאחר תשובה)
6. **יצירת סקריפטים** - דורש מידע מ-uPress
7. **עדכון קוד** - דורש אישור על תמיכה

---

## 📝 רשימת משימות מפורטת

### משימה 0: עדכון סביבת Testing (קריטי!) ⚠️

**מסמכים לצוות הטסטים:**
- ✅ `TESTING_ENVIRONMENT_WORK_INSTRUCTIONS.md` - **הוראות עבודה מפורטות לצוות** ⭐
- ✅ `TESTING_ENVIRONMENT_QUICK_REFERENCE.md` - Quick reference מהיר
- `TESTING_ENVIRONMENT_UPDATE_PLAN.md` - תוכנית מפורטת (תיעוד)
- `TESTING_ENVIRONMENT_CHECKLIST.md` - checklist מפורט

**סטטוס:**
- [x] מסמכי עבודה מוכנים
- [ ] העברה לצוות הטסטים
- [ ] ביצוע על ידי הצוות
- [ ] בדיקות ואימות

**קבצים להעברה לצוות:**
1. `documentation/production/ONLINE_DEPLOYMENT/TESTING_ENVIRONMENT_WORK_INSTRUCTIONS.md` - **מסמך ראשי**
2. `documentation/production/ONLINE_DEPLOYMENT/TESTING_ENVIRONMENT_QUICK_REFERENCE.md` - **Quick reference**

### משימה 1: תכנון 3 סביבות
- [ ] יצירת `ENVIRONMENT_SETUP.md` - מדריך מפורט
- [ ] יצירת `ENVIRONMENT_NAMING.md` - שמות וזיהוי
- [ ] תכנון מבנה directories
- [ ] תכנון database names
- [ ] תכנון זיהוי סביבות

### משימה 2: תכנון DNS/SSL
- [ ] יצירת `DNS_SETUP.md` - הוראות DNS
- [ ] יצירת `SSL_SETUP.md` - הוראות SSL
- [ ] בדיקת זמינות `tiktrack.nimrod.bio`
- [ ] תכנון הגדרת DNS records

### משימה 3: תכנון העברת database
- [ ] יצירת `DATABASE_MIGRATION_PLAN.md`
- [ ] תכנון תהליך העתקת data מ-testing ל-online
- [ ] תכנון גיבוי ושחזור
- [ ] תכנון מיגרציות

### משימה 4: תכנון עדכוני קוד
- [ ] רשימת קבצים לעדכון
- [ ] תכנון מבנה `online/Backend/config/settings.py`
- [ ] תכנון עדכון `start_server.sh`
- [ ] תכנון עדכון `production/Backend/config/settings.py` → `testing`

### משימה 5: תכנון בדיקות
- [ ] יצירת `TESTING_PLAN.md`
- [ ] תכנון בדיקות תשתית
- [ ] תכנון בדיקות אפליקציה
- [ ] תכנון בדיקות ביצועים
- [ ] תכנון בדיקות אבטחה

---

## ⏰ זמן משוער

### משימות עדיפות גבוהה
- **עדכון סביבת Testing:** 3-5 שעות (כולל בדיקות)
- **תכנון 3 סביבות:** 2-3 שעות
- **תכנון DNS/SSL:** 1-2 שעות
- **תכנון העברת database:** 1-2 שעות

**סה"כ:** 7-12 שעות עבודה

### משימות עדיפות בינונית
- **תכנון עדכוני קוד:** 2-3 שעות
- **תכנון בדיקות:** 2-3 שעות

**סה"כ:** 4-6 שעות עבודה

---

## 🚀 המלצה

### להתחיל עם:
1. **עדכון סביבת Testing** - ⚠️ **קריטי לפני עליה לאוויר!**
   - זה חייב להיעשות לפני כל עליה לאוויר
   - משתמש בתהליך הקיים (`master.py`)
   - רק שינוי שם סביבה ו-database
2. **תכנון 3 סביבות** - זה הבסיס לכל השאר
3. **תכנון DNS/SSL** - זה לא תלוי בתשובה מ-uPress
4. **תכנון העברת database** - חשוב לתכנן מראש

### לחכות עם:
- עדכון קוד בפועל (דורש אישור על תמיכה)
- יצירת סקריפטים סופיים (יכול להיות שינויים)

---

**עודכן:** ינואר 2025  
**גרסה:** 1.0


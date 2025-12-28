# בעיות עם API Key של SendGrid

## SendGrid API Key Issues

**תאריך יצירה**: 28 בינואר 2025  
**גרסה**: 1.0.0  
**מחבר**: TikTrack Development Team

---

## ❌ שגיאה: "535 Authentication failed: The provided authorization grant is invalid, expired, or revoked"

### מה זה אומר

השגיאה הזו אומרת שה-API Key לא תקין, פג תוקפו, או בוטל.

---

## 🔍 בדיקות

### 1. האם זה באמת SendGrid

**API Keys של SendGrid** בדרך כלל:

- מתחילים ב-`SG.` (לדוגמה: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
- ארוכים יותר (כ-70 תווים)

**אם המפתח שלך לא מתחיל ב-`SG.`**:

- יכול להיות שזה לא SendGrid
- יכול להיות שזה API Key בפורמט ישן
- יכול להיות שזה שירות אחר

### 2. בדיקת API Key ב-SendGrid

1. היכנס ל-SendGrid: https://app.sendgrid.com
2. Settings → API Keys
3. בדוק את ה-API Keys שלך:
   - האם המפתח שאתה משתמש בו מופיע ברשימה?
   - האם הוא פעיל (Active)?
   - האם יש לו הרשאות Mail Send?

### 3. יצירת API Key חדש

אם המפתח לא תקין, צור חדש:

1. Settings → API Keys
2. לחץ "Create API Key"
3. תן שם: `TikTrack SMTP`
4. בחר **"Restricted Access"**
5. תחת "Mail Send", בחר **"Full Access"**
6. לחץ "Create & View"
7. **העתק את ה-API Key מיד!** (תוצג פעם אחת בלבד)
   - זה אמור להתחיל ב-`SG.` ולהכיל כ-70 תווים

---

## ✅ עדכון ב-TikTrack

לאחר יצירת API Key חדש:

1. פתח: `http://localhost:8080/user_profile`
2. גלול לסקשן "הגדרות SMTP"
3. עדכן:
   - **Password**: ה-API Key החדש (החל מ-`SG.`)
4. לחץ "עדכן הגדרות SMTP"
5. לחץ "בדיקת חיבור"

---

## 🔄 אם זה לא SendGrid

אם המפתחות שלך לא מתחילים ב-`SG.`, יכול להיות שזה:

1. **Mailgun** - מפתחות נראים אחרת
2. **שירות אחר** - צריך לבדוק את התיעוד שלהם

**אם זה לא SendGrid**, ספר לי מה השירות ואעדכן את ההגדרות בהתאם.

---

## 📋 סיכום

1. ✅ ודא שזה SendGrid (API Keys מתחילים ב-`SG.`)
2. ✅ בדוק שה-API Key פעיל ב-SendGrid Dashboard
3. ✅ צור API Key חדש אם צריך
4. ✅ עדכן ב-TikTrack

---

**עדכון אחרון**: 28 בינואר 2025  
**גרסה**: 1.0.0


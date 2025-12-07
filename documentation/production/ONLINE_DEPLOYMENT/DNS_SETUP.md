# הגדרת DNS - tiktrack.nimrod.bio

**תאריך:** ינואר 2025  
**גרסה:** 1.0  
**מטרה:** הוראות להגדרת סאב-דומיין tiktrack.nimrod.bio

---

## 📋 סקירה כללית

סאב-דומיין `tiktrack.nimrod.bio` צריך להיות מוגדר להצביע על שרת uPress VPS.

---

## 🔍 בדיקת זמינות הדומיין

### שלב 1: בדיקת בעלות על הדומיין
**שאלות לבדיקה:**
- האם `nimrod.bio` בבעלותך?
- האם יש גישה ל-DNS management?
- איזה DNS provider? (Cloudflare, Namecheap, אחר)

### שלב 2: בדיקת זמינות סאב-דומיין
**סאב-דומיין:** `tiktrack.nimrod.bio`

**בדיקה:**
```bash
# בדיקת DNS resolution
nslookup tiktrack.nimrod.bio

# או
dig tiktrack.nimrod.bio

# או
host tiktrack.nimrod.bio
```

**תוצאה צפויה (לפני הגדרה):**
- `NXDOMAIN` - לא קיים
- או `SERVFAIL` - לא מוגדר

---

## ⚙️ הגדרת DNS Record

### שלב 1: קבלת IP של השרת
**לאחר קבלת תשובה מ-uPress:**
- קבלת IP address של VPS
- או hostname של השרת

### שלב 2: יצירת A Record

**סוג:** A Record  
**שם:** `tiktrack`  
**ערך:** IP address של השרת (מ-uPress)  
**TTL:** 300-3600 שניות (מומלץ: 3600)

**דוגמה:**
```
Type: A
Name: tiktrack
Value: 123.45.67.89  (IP של השרת)
TTL: 3600
```

### שלב 3: יצירת CNAME (אלטרנטיבה)

**אם uPress מספק hostname:**
- **סוג:** CNAME Record
- **שם:** `tiktrack`
- **ערך:** hostname של uPress (למשל: `server.upress.co.il`)

**דוגמה:**
```
Type: CNAME
Name: tiktrack
Value: server.upress.co.il
TTL: 3600
```

---

## 🔄 תהליך הגדרה

### שלב 1: כניסה ל-DNS Provider
1. התחברות ל-DNS provider (Cloudflare, Namecheap, וכו')
2. בחירת הדומיין `nimrod.bio`
3. מעבר ל-DNS Management / DNS Records

### שלב 2: יצירת Record
1. לחיצה על "Add Record" / "Create Record"
2. בחירת סוג: A Record או CNAME
3. מילוי הפרטים:
   - **Name:** `tiktrack`
   - **Value:** IP או hostname (מ-uPress)
   - **TTL:** 3600

### שלב 3: שמירה
1. שמירת ה-Record
2. המתנה ל-propagation (5-60 דקות)

---

## ✅ בדיקת הגדרה

### בדיקה 1: DNS Resolution
```bash
# בדיקת DNS
nslookup tiktrack.nimrod.bio

# תוצאה צפויה:
# Name: tiktrack.nimrod.bio
# Address: 123.45.67.89  (IP של השרת)
```

### בדיקה 2: Ping
```bash
# בדיקת חיבור
ping tiktrack.nimrod.bio

# תוצאה צפויה:
# PING tiktrack.nimrod.bio (123.45.67.89): 56 data bytes
```

### בדיקה 3: HTTP
```bash
# בדיקת HTTP (לאחר הגדרת Nginx)
curl -I http://tiktrack.nimrod.bio

# תוצאה צפויה:
# HTTP/1.1 200 OK
```

---

## ⏰ זמן Propagation

### זמן Propagation
- **מינימום:** 5-15 דקות
- **ממוצע:** 30-60 דקות
- **מקסימום:** עד 48 שעות (נדיר)

### גורמים המשפיעים
- **TTL:** TTL נמוך = propagation מהיר יותר
- **DNS Provider:** חלק מהירים יותר
- **מיקום:** propagation גלובלי לוקח זמן

---

## 🔧 הגדרות מומלצות

### TTL
- **לפני הגדרה:** TTL נמוך (300 שניות) - לבדיקות
- **אחרי הגדרה:** TTL גבוה (3600 שניות) - ליציבות

### DNS Provider
- **מומלץ:** Cloudflare (חינם, מהיר, אבטחה)
- **אלטרנטיבות:** Namecheap, GoDaddy, אחר

---

## 📝 Checklist הגדרת DNS

### לפני הגדרה
- [ ] בדיקת בעלות על `nimrod.bio`
- [ ] בדיקת גישה ל-DNS management
- [ ] קבלת IP או hostname מ-uPress

### הגדרה
- [ ] יצירת A Record או CNAME
- [ ] מילוי הפרטים (Name, Value, TTL)
- [ ] שמירת ה-Record

### אחרי הגדרה
- [ ] בדיקת DNS resolution
- [ ] בדיקת ping
- [ ] המתנה ל-propagation
- [ ] בדיקת HTTP (לאחר הגדרת Nginx)

---

## 🔗 קבצים רלוונטיים

### Documentation
- `documentation/production/ONLINE_DEPLOYMENT/DNS_SETUP.md` - זה הקובץ
- `documentation/production/ONLINE_DEPLOYMENT/SSL_SETUP.md` - הגדרת SSL

### Scripts
- `scripts/deployment/check_dns.py` - סקריפט בדיקת DNS (אם נוצר)

---

## ⚠️ הערות חשובות

### לפני הגדרת DNS
- **חובה:** לקבל IP או hostname מ-uPress לפני הגדרה
- **מומלץ:** לבדוק את ה-IP עם ping לפני הגדרה

### אחרי הגדרת DNS
- **חובה:** לבדוק DNS resolution לפני המשך
- **מומלץ:** להמתין ל-propagation לפני הגדרת SSL

---

**עודכן:** ינואר 2025  
**גרסה:** 1.0  
**סטטוס:** מוכן - ממתין ל-IP מ-uPress


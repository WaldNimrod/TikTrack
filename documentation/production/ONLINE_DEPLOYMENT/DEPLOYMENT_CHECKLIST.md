# Checklist פריסה - TikTrack Online

**תאריך:** ינואר 2025  
**גרסה:** 1.0  
**מטרה:** Checklist מקיף לפריסת TikTrack לסביבת Online

---

## 📋 Checklist כללי

### לפני התחלה
- [ ] תשובה מ-uPress התקבלה
- [ ] אישור על תמיכה ב-Python/Flask/PostgreSQL
- [ ] קבלת IP או hostname של השרת
- [ ] קבלת פרטי גישה (SSH, credentials)

### תכנון
- [ ] תכנון 3 סביבות הושלם
- [ ] תכנון DNS הושלם
- [ ] תכנון SSL הושלם
- [ ] תכנון העברת database הושלם

---

## 🔧 הגדרת שרת

### התקנת מערכת הפעלה
- [ ] מערכת הפעלה מותקנת (Ubuntu 22.04 LTS)
- [ ] עדכונים מותקנים
- [ ] משתמש מערכת נוצר
- [ ] SSH keys מוגדרים

### התקנת תוכנות
- [ ] Python 3.9+ מותקן
- [ ] PostgreSQL 15+ מותקן
- [ ] Nginx מותקן
- [ ] Git מותקן
- [ ] Firewall מוגדר (UFW)

### הגדרות אבטחה
- [ ] Firewall rules מוגדרים
- [ ] SSH key-based authentication
- [ ] Strong passwords
- [ ] SSL certificate מוכן (Let's Encrypt)

---

## 💾 הגדרת Database

### יצירת Database
- [ ] Database `TikTrack-db-online` נוצר
- [ ] User עם הרשאות נוצר
- [ ] Connection string מוגדר
- [ ] בדיקת חיבור

### העברת Data
- [ ] גיבוי database testing נוצר
- [ ] גיבוי הועתק לשרת
- [ ] Database שוחזר על השרת
- [ ] מיגרציות רצו (אם נדרש)
- [ ] בדיקת data

---

## 📁 הגדרת אפליקציה

### Clone והתקנה
- [ ] Repository cloned לשרת
- [ ] Virtual environment נוצר
- [ ] Dependencies מותקנים (`pip install -r requirements.txt`)
- [ ] Environment variables מוגדרים
- [ ] בדיקת imports

### הגדרות
- [ ] `online/Backend/config/settings.py` מוגדר
- [ ] Database connection string מוגדר
- [ ] UI_DIR מוגדר נכון
- [ ] בדיקת config

---

## 🌐 הגדרת Nginx

### קונפיגורציה
- [ ] Nginx config נוצר
- [ ] Reverse proxy מוגדר
- [ ] SSL termination מוגדר
- [ ] Static files מוגדרים
- [ ] בדיקת syntax (`nginx -t`)

### הפעלה
- [ ] Nginx מופעל
- [ ] בדיקת status
- [ ] בדיקת logs

---

## 🔒 הגדרת SSL

### התקנת Certificate
- [ ] Certbot מותקן
- [ ] SSL certificate נוצר
- [ ] Auto-renewal מוגדר
- [ ] בדיקת certificate

### קונפיגורציה
- [ ] HTTPS redirect מוגדר
- [ ] Strong ciphers מוגדרים
- [ ] HSTS מוגדר (אם נדרש)
- [ ] בדיקת SSL

---

## ⚙️ הגדרת Process Manager

### systemd Service
- [ ] Service file נוצר (`tiktrack-online.service`)
- [ ] Service מופעל
- [ ] Auto-start מוגדר
- [ ] בדיקת status

### בדיקות
- [ ] Server מתחיל אוטומטית
- [ ] Server מתחיל אחרי reboot
- [ ] Logs נשמרים נכון

---

## 🧪 בדיקות

### בדיקות תשתית
- [ ] בדיקת חיבור לשרת (SSH)
- [ ] בדיקת PostgreSQL connection
- [ ] בדיקת DNS resolution
- [ ] בדיקת SSL certificate
- [ ] בדיקת Firewall rules

### בדיקות אפליקציה
- [ ] Health check endpoint (`/api/health`)
- [ ] טעינת דפים ראשיים
- [ ] בדיקת API endpoints
- [ ] בדיקת database operations
- [ ] בדיקת static files

### בדיקות ביצועים
- [ ] Response time
- [ ] Load testing
- [ ] Memory usage
- [ ] CPU usage
- [ ] Database performance

### בדיקות אבטחה
- [ ] SSL configuration
- [ ] Firewall rules
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CORS configuration

---

## 📊 ניטור

### הגדרת ניטור
- [ ] Health checks מוגדרים
- [ ] Logs מוגדרים
- [ ] Alerts מוגדרים (אם נדרש)
- [ ] Monitoring tools (אם נדרש)

### בדיקות ניטור
- [ ] Health checks עובדים
- [ ] Logs נשמרים
- [ ] Alerts עובדים (אם נדרש)

---

## 🔄 גיבויים

### הגדרת גיבויים
- [ ] גיבויים אוטומטיים מוגדרים
- [ ] תדירות גיבויים מוגדרת
- [ ] Retention policy מוגדר
- [ ] בדיקת גיבויים

### בדיקות גיבויים
- [ ] גיבוי נוצר
- [ ] בדיקת שחזור
- [ ] בדיקת תקינות

---

## ✅ Checklist סופי

### לפני עליה לאוויר
- [ ] כל הבדיקות עברו
- [ ] גיבויים מוגדרים
- [ ] ניטור מוגדר
- [ ] תיעוד מעודכן
- [ ] Rollback plan מוכן

### אחרי עליה לאוויר
- [ ] בדיקת זמינות
- [ ] בדיקת ביצועים
- [ ] בדיקת לוגים
- [ ] בדיקת גיבויים
- [ ] מעקב 24 שעות

---

## 🔗 קבצים רלוונטיים

### Documentation
- `documentation/production/ONLINE_DEPLOYMENT/DEPLOYMENT_CHECKLIST.md` - זה הקובץ
- `documentation/production/ONLINE_DEPLOYMENT/DEPLOYMENT_GUIDE.md` - מדריך פריסה
- `documentation/production/ONLINE_DEPLOYMENT/TESTING_PLAN.md` - תוכנית בדיקות

### Scripts
- `scripts/deployment/deploy_to_online.sh` - סקריפט פריסה
- `scripts/testing/test_online_environment.py` - סקריפט בדיקות

---

**עודכן:** ינואר 2025  
**גרסה:** 1.0



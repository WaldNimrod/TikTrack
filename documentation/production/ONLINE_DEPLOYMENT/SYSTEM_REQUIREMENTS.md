# דרישות מערכת - TikTrack Online Deployment

**תאריך:** ינואר 2025  
**גרסה:** 1.0  
**מטרה:** מפרט טכני מדויק של דרישות המערכת לשרת אונליין

---

## 📋 סקירה כללית

מסמך זה מפרט את כל הדרישות הטכניות להפעלת TikTrack בסביבת אונליין, כולל דרישות חומרה, תוכנה, רשת ואבטחה.

---

## 💻 דרישות חומרה

### מינימום (לשלב ראשוני)
- **CPU:** 1 vCPU (2 vCPU מומלץ)
- **RAM:** 2GB (4GB מומלץ)
- **Storage:** 20GB SSD (40GB מומלץ)
- **Bandwidth:** 1TB/חודש

### מומלץ (לצמיחה עתידית)
- **CPU:** 2-4 vCPU
- **RAM:** 4-8GB
- **Storage:** 40-80GB SSD
- **Bandwidth:** 2-4TB/חודש

### הערות
- **Storage:** כולל מערכת הפעלה, אפליקציה, database, לוגים
- **Bandwidth:** מספיק לשלב ראשוני (עד 10 משתמשים)
- **CPU:** Burstable OK לשלב ראשוני, Dedicated מומלץ לשלב מתקדם

---

## 🖥️ דרישות תוכנה

### מערכת הפעלה
- **מומלץ:** Ubuntu 22.04 LTS
- **אלטרנטיבות:** Ubuntu 20.04 LTS, Debian 11/12
- **לא מומלץ:** Windows Server (לא נדרש)

### Python
- **גרסה:** Python 3.9+ (3.10+ מומלץ)
- **התקנה:** דרך package manager או pyenv
- **חבילות:** כל החבילות מ-`Backend/requirements.txt`

### PostgreSQL
- **גרסה:** PostgreSQL 15+ (15.3+ מומלץ)
- **התקנה:** דרך package manager
- **Database:** `TikTrack-db-online`
- **User:** `TikTrakDBAdmin` (או custom)
- **Extensions:** לא נדרש extensions מיוחדים

### Nginx
- **גרסה:** Nginx 1.18+ (1.22+ מומלץ)
- **תפקיד:** Reverse proxy, SSL termination, static files
- **התקנה:** דרך package manager

### SSL/TLS
- **Certificate:** Let's Encrypt (מומלץ) או commercial
- **Auto-renewal:** חובה (Certbot)
- **Protocols:** TLS 1.2+ (TLS 1.3 מומלץ)

### Process Manager
- **מומלץ:** systemd (built-in)
- **אלטרנטיבות:** supervisor, PM2
- **תפקיד:** ניהול תהליך השרת, auto-restart

---

## 🔧 דרישות אפליקציה

### Python Dependencies
כל החבילות מ-`Backend/requirements.txt`:

**Core:**
- Flask==2.3.3
- Flask-CORS==4.0.0
- Werkzeug==2.3.7
- SQLAlchemy==2.0.23
- psycopg2-binary==2.9.9

**Production Server:**
- gunicorn==21.2.0
- waitress==2.1.2

**Additional:**
- requests==2.31.0
- cryptography==41.0.7
- bcrypt==4.1.2
- bleach==6.1.0
- pytz==2023.3
- yfinance==0.2.18
- httpx==0.28.1
- google-generativeai==0.8.5

### Environment Variables
**חובה:**
- `TIKTRACK_ENV=online`
- `POSTGRES_HOST` (localhost או IP)
- `POSTGRES_DB=TikTrack-db-online`
- `POSTGRES_USER` (default: TikTrakDBAdmin)
- `POSTGRES_PASSWORD` (strong password)

**אופציונלי:**
- `POSTGRES_PORT=5432` (default)
- `DATABASE_URL` (full connection string)

### File Structure
```
/tiktrack/
├── Backend/
│   ├── app.py
│   ├── config/
│   ├── routes/
│   ├── services/
│   └── ...
├── trading-ui/
│   ├── *.html
│   ├── scripts/
│   └── styles/
└── ...
```

---

## 🌐 דרישות רשת

### Ports
- **80 (HTTP):** חובה - redirect ל-HTTPS
- **443 (HTTPS):** חובה - traffic ראשי
- **22 (SSH):** חובה - ניהול שרת
- **5432 (PostgreSQL):** אופציונלי - רק אם remote access נדרש

### DNS
- **Domain:** `tiktrack.nimrod.bio`
- **Record Type:** A (IPv4) או CNAME
- **TTL:** 300-3600 שניות

### Firewall Rules
**חובה:**
- Allow: 22 (SSH) - רק מ-IPs מורשים
- Allow: 80 (HTTP) - כל
- Allow: 443 (HTTPS) - כל
- Deny: כל השאר

**אופציונלי:**
- Allow: 5432 (PostgreSQL) - רק מ-IPs מורשים (אם remote access)

---

## 🔒 דרישות אבטחה

### SSL/TLS (חובה)
- **Certificate:** Let's Encrypt (מומלץ) או commercial
- **Auto-renewal:** חובה
- **Protocols:** TLS 1.2+ (TLS 1.3 מומלץ)
- **Ciphers:** Strong ciphers only
- **HSTS:** מומלץ

### Firewall (חובה)
- **UFW** (Ubuntu) או **iptables**
- **Rules:** רק ports נדרשים פתוחים
- **SSH:** רק מ-IPs מורשים

### Authentication
- **SSH:** Key-based authentication (מומלץ)
- **Database:** Strong passwords
- **Application:** לפי הגדרות אפליקציה

### Updates
- **System:** Auto-updates למינימום (security patches)
- **Applications:** Manual updates עם בדיקות

### Monitoring
- **Logs:** ניטור לוגים לשגיאות
- **Health Checks:** `/api/health` endpoint
- **Alerts:** התראות על בעיות

---

## 💾 דרישות Database

### PostgreSQL Configuration
- **Version:** 15+
- **Database:** `TikTrack-db-online`
- **User:** `TikTrakDBAdmin` (או custom)
- **Password:** Strong password (12+ characters)
- **Encoding:** UTF-8
- **Timezone:** UTC

### Storage
- **Initial:** ~100MB (empty database)
- **Growth:** ~10-50MB/חודש (תלוי בשימוש)
- **Backups:** 2-3x database size

### Backups
- **Frequency:** יומי (מומלץ)
- **Retention:** 7-30 ימים
- **Location:** Remote storage (S3, etc.)

### Performance
- **Connections:** 20-50 concurrent (מספיק לשלב ראשוני)
- **Query Timeout:** 30 שניות
- **Idle Timeout:** 10 דקות

---

## 📊 דרישות ביצועים

### Response Time
- **API:** < 500ms (95th percentile)
- **Pages:** < 2s (95th percentile)
- **Static Files:** < 100ms

### Throughput
- **Requests/sec:** 10-50 (מספיק לשלב ראשוני)
- **Concurrent Users:** 10-20 (מספיק לשלב ראשוני)

### Resource Usage
- **CPU:** < 50% average (מספיק לשלב ראשוני)
- **RAM:** < 70% average
- **Disk I/O:** < 50% average

---

## 🔄 דרישות תחזוקה

### Updates
- **System:** Security patches (auto או manual)
- **Python:** Manual updates עם בדיקות
- **PostgreSQL:** Manual updates עם בדיקות
- **Application:** דרך Git deployment

### Monitoring
- **Health Checks:** `/api/health` endpoint
- **Logs:** ניטור לוגים לשגיאות
- **Metrics:** CPU, RAM, Disk, Network
- **Alerts:** התראות על בעיות

### Backups
- **Database:** יומי (אוטומטי)
- **Application:** דרך Git (version control)
- **Config:** דרך Git או manual backup

---

## 📝 דרישות תיעוד

### Documentation
- **Setup Guide:** הוראות התקנה והגדרה
- **Deployment Guide:** הוראות פריסה
- **Troubleshooting:** פתרון בעיות נפוצות
- **Maintenance:** תחזוקה שוטפת

### Logs
- **Application Logs:** `Backend/logs/`
- **System Logs:** `/var/log/`
- **Nginx Logs:** `/var/log/nginx/`
- **PostgreSQL Logs:** `/var/log/postgresql/`

---

## ✅ Checklist דרישות

### לפני התקנה
- [ ] מערכת הפעלה מותקנת (Ubuntu 22.04 LTS)
- [ ] Python 3.9+ מותקן
- [ ] PostgreSQL 15+ מותקן
- [ ] Nginx מותקן
- [ ] Firewall מוגדר
- [ ] SSH keys מוגדרים
- [ ] Domain מוגדר (DNS)

### אחרי התקנה
- [ ] Application מותקן
- [ ] Database נוצר
- [ ] Environment variables מוגדרים
- [ ] SSL certificate מותקן
- [ ] Nginx מוגדר
- [ ] Process manager מוגדר
- [ ] Health checks עובדים
- [ ] Backups מוגדרים

---

## 🎯 סיכום

### דרישות מינימליות (לשלב ראשוני)
- **CPU:** 1-2 vCPU
- **RAM:** 2-4GB
- **Storage:** 20-40GB
- **Bandwidth:** 1TB/חודש
- **OS:** Ubuntu 22.04 LTS
- **Python:** 3.9+
- **PostgreSQL:** 15+
- **SSL:** Let's Encrypt
- **Firewall:** UFW/iptables

### דרישות מומלצות (לצמיחה עתידית)
- **CPU:** 2-4 vCPU
- **RAM:** 4-8GB
- **Storage:** 40-80GB
- **Bandwidth:** 2-4TB/חודש
- **Monitoring:** ניטור מתקדם
- **Backups:** אוטומטיים + remote

---

**עודכן:** ינואר 2025  
**גרסה:** 1.0



# System Management Data Validation Guide

## מטרת המסמך

מסמך זה מכיל מידע מפורט על כל הנתונים המוצגים בעמוד מנהל מערכת, מקורם, ואיך לבדוק אותם ידנית.

## Dashboard Section

### בריאות מערכת (System Score)

- **מקור:** `/api/system/overview` → `data.system_score`
- **טווח תקין:** 0-100
- **בדיקה ידנית:**
  - פתח DevTools → Network
  - חפש `/api/system/overview`
  - בדוק את `system_score` ב-response
- **דוגמה תקינה:** `85`

### זמן תגובה (Response Time)

- **מקור:** `/api/system/overview` → `data.response_time_ms`
- **טווח תקין:** 0-10000 (מילישניות)
- **בדיקה ידנית:**
  - פתח DevTools → Network
  - חפש `/api/system/overview`
  - בדוק את `response_time_ms` ב-response
- **דוגמה תקינה:** `245.5`

### זמן פעילות (Uptime)

- **מקור:** `/api/system/overview` → `data.summary.uptime`
- **טווח תקין:** מחרוזת זמן (לדוגמה: "2 days, 5 hours")
- **בדיקה ידנית:**
  - פתח DevTools → Network
  - חפש `/api/system/overview`
  - בדוק את `summary.uptime` ב-response
- **דוגמה תקינה:** `"2 days, 5 hours, 30 minutes"`

### סביבה (Environment)

- **מקור:** `/api/system/environment` → `data.environment`
- **ערכים תקינים:** `"development"` או `"production"`
- **בדיקה ידנית:**
  - פתח DevTools → Network
  - חפש `/api/system/environment`
  - בדוק את `environment` ב-response
- **דוגמה תקינה:** `"development"`

### פורט שרת (Port)

- **מקור:** `/api/system/environment` → `data.port`
- **ערכים תקינים:** `8080` (development) או `5001` (production)
- **בדיקה ידנית:**
  - פתח DevTools → Network
  - חפש `/api/system/environment`
  - בדוק את `port` ב-response
- **דוגמה תקינה:** `8080`

### שם בסיס נתונים (Database Name)

- **מקור:** `/api/system/environment` → `data.database.name`
- **ערכים תקינים:** שם בסיס נתונים (לדוגמה: `"TikTrack-db-development"`)
- **בדיקה ידנית:**
  - פתח DevTools → Network
  - חפש `/api/system/environment`
  - בדוק את `database.name` ב-response
- **דוגמה תקינה:** `"TikTrack-db-development"`

## Server Section

### סטטוס שרת

- **מקור:** `/api/server/status` → `data.server_mode.current`
- **ערכים תקינים:** `"development"`, `"production"`, `"no-cache"`, `"preserve"`
- **בדיקה ידנית:**
  - פתח DevTools → Network
  - חפש `/api/server/status`
  - בדוק את `server_mode.current` ב-response
- **דוגמה תקינה:** `"development"`

### שימוש במעבד (CPU)

- **מקור:** `/api/system/overview` → `data.summary.cpu_usage_percent`
- **טווח תקין:** 0-100 (%)
- **בדיקה ידנית:**
  - פתח DevTools → Network
  - חפש `/api/system/overview`
  - בדוק את `summary.cpu_usage_percent` ב-response
- **דוגמה תקינה:** `15.5`

### שימוש בזיכרון (RAM)

- **מקור:** `/api/system/overview` → `data.summary.memory_usage_percent`
- **טווח תקין:** 0-100 (%)
- **בדיקה ידנית:**
  - פתח DevTools → Network
  - חפש `/api/system/overview`
  - בדוק את `summary.memory_usage_percent` ב-response
- **דוגמה תקינה:** `67.8`

## Cache Section

### Hit Rate

- **מקור:** `/api/cache/stats` → `data.hit_rate`
- **טווח תקין:** 0-100 (%)
- **בדיקה ידנית:**
  - פתח DevTools → Network
  - חפש `/api/cache/stats`
  - בדוק את `hit_rate` ב-response
- **דוגמה תקינה:** `85.5`

### Miss Rate

- **מקור:** `/api/cache/stats` → `data.miss_rate`
- **טווח תקין:** 0-100 (%)
- **בדיקה ידנית:**
  - פתח DevTools → Network
  - חפש `/api/cache/stats`
  - בדוק את `miss_rate` ב-response
- **דוגמה תקינה:** `14.5`

### בקשות כולל

- **מקור:** `/api/cache/stats` → `data.total_requests`
- **טווח תקין:** מספר שלם >= 0
- **בדיקה ידנית:**
  - פתח DevTools → Network
  - חפש `/api/cache/stats`
  - בדוק את `total_requests` ב-response
- **דוגמה תקינה:** `1250`

## Performance Section

### זיכרון מערכת

- **מקור:** `/api/system/performance` → `data.memory`
- **טווח תקין:** 0-100 (%)
- **בדיקה ידנית:**
  - פתח DevTools → Network
  - חפש `/api/system/performance`
  - בדוק את `memory` ב-response
- **דוגמה תקינה:** `67.8`

### עומס CPU

- **מקור:** `/api/system/performance` → `data.cpu`
- **טווח תקין:** 0-100 (%)
- **בדיקה ידנית:**
  - פתח DevTools → Network
  - חפש `/api/system/performance`
  - בדוק את `cpu` ב-response
- **דוגמה תקינה:** `15.5`

## External Data Section

### ספקים פעילים

- **מקור:** External Data Dashboard → `providers.filter(p => p.active).length`
- **טווח תקין:** מספר שלם >= 0
- **בדיקה ידנית:**
  - פתח DevTools → Console
  - הרץ: `window.externalDataDashboard?.providers?.filter(p => p.active).length`
- **דוגמה תקינה:** `3`

## Database Section

### סטטוס DB

- **מקור:** `/api/system/database` → `data.status`
- **ערכים תקינים:** `"connected"`, `"disconnected"`, `"error"`
- **בדיקה ידנית:**
  - פתח DevTools → Network
  - חפש `/api/system/database`
  - בדוק את `status` ב-response
- **דוגמה תקינה:** `"connected"`

### גודל DB

- **מקור:** `/api/system/database` → `data.size`
- **טווח תקין:** מספר >= 0 (ב-bytes)
- **בדיקה ידנית:**
  - פתח DevTools → Network
  - חפש `/api/system/database`
  - בדוק את `size` ב-response
- **דוגמה תקינה:** `52428800` (50MB)

## System Settings Section

### SMTP Settings

- **מקור:** `/api/system-settings/smtp` → `data`
- **שדות נדרשים:**
  - `smtp_host` (string)
  - `smtp_port` (number, 1-65535)
  - `smtp_user` (string)
  - `smtp_from_email` (string, email format)
  - `smtp_from_name` (string)
  - `smtp_use_tls` (boolean)
  - `smtp_enabled` (boolean)
- **בדיקה ידנית:**
  - פתח DevTools → Network
  - חפש `/api/system-settings/smtp`
  - בדוק את כל השדות ב-response
- **דוגמה תקינה:**

```json
{
  "smtp_host": "smtp.gmail.com",
  "smtp_port": 587,
  "smtp_user": "admin@mezoo.co",
  "smtp_from_email": "admin@mezoo.co",
  "smtp_from_name": "TikTrack",
  "smtp_use_tls": true,
  "smtp_enabled": true
}
```

### External Data Settings

- **מקור:** `/api/system-settings/external-data` → `data`
- **שדות נדרשים:**
  - `ttlActiveSeconds` (number, >= 0)
  - `ttlOpenSeconds` (number, >= 0)
  - `ttlClosedSeconds` (number, >= 0)
  - `ttlCancelledSeconds` (number, >= 0)
  - `externalDataSchedulerEnabled` (boolean)
  - `externalDataMaxBatchSize` (number, > 0)
- **בדיקה ידנית:**
  - פתח DevTools → Network
  - חפש `/api/system-settings/external-data`
  - בדוק את כל השדות ב-response
- **דוגמה תקינה:**

```json
{
  "ttlActiveSeconds": 300,
  "ttlOpenSeconds": 900,
  "ttlClosedSeconds": 3600,
  "ttlCancelledSeconds": 7200,
  "externalDataSchedulerEnabled": true,
  "externalDataMaxBatchSize": 100
}
```

## כללי

### טווחי ערכים תקינים

- **אחוזים:** 0-100
- **זמנים:** מספרים חיוביים (שניות/מילישניות)
- **גדלים:** מספרים חיוביים (bytes/KB/MB)
- **מספרים שלמים:** מספרים >= 0

### בדיקות כלליות

1. פתח DevTools → Network
2. רענן את העמוד
3. חפש את ה-API endpoint הרלוונטי
4. בדוק את ה-response
5. השווה את הנתונים המוצגים בעמוד לנתונים ב-response

### שגיאות נפוצות

- **נתונים לא מוצגים:** בדוק אם ה-API מחזיר נתונים
- **נתונים שגויים:** בדוק את validation של הנתונים
- **שגיאות בקונסולה:** בדוק את ה-error messages

## הערות

- תאריך עדכון: ___________
- גרסה: ___________
























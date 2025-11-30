# Email Logs API - TikTrack
## Email Logs API Documentation

**תאריך יצירה**: 28 בינואר 2025  
**גרסה**: 1.0.0  
**מחבר**: TikTrack Development Team

---

## סקירה כללית

Email Logs API מספק גישה ללוגי מיילים במערכת. כל שליחת מייל נרשמת במסד הנתונים עם פרטים מלאים לניטור וניפוי באגים.

---

## Endpoints

### GET `/api/email-logs`

קבלת לוגי מיילים עם פילטרים אופציונליים.

#### Query Parameters

| פרמטר | סוג | תיאור | דוגמה |
|--------|-----|-------|-------|
| `status` | string | סינון לפי status | `success`, `failed`, `pending` |
| `email_type` | string | סינון לפי סוג מייל | `password_reset`, `test`, `system_notification` |
| `recipient` | string | סינון לפי כתובת נמען | `user@example.com` |
| `user_id` | integer | סינון לפי ID משתמש | `1` |
| `days` | integer | מספר ימים לאחור (ברירת מחדל: 7) | `30` |
| `limit` | integer | מספר מקסימלי של רשומות (ברירת מחדל: 100) | `50` |
| `offset` | integer | אופסט לפאגינציה (ברירת מחדל: 0) | `10` |
| `sort_by` | string | שדה למיון (ברירת מחדל: `created_at`) | `status`, `recipient` |
| `sort_order` | string | סדר מיון (ברירת מחדל: `desc`) | `asc`, `desc` |

#### Response

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 1,
        "recipient": "user@example.com",
        "subject": "איפוס סיסמה - TikTrack",
        "status": "success",
        "sent_at": "2025-01-28T10:30:00",
        "created_at": "2025-01-28T10:30:00",
        "error_message": null,
        "email_type": "password_reset",
        "user_id": 1
      }
    ],
    "pagination": {
      "total": 10,
      "limit": 100,
      "offset": 0,
      "count": 10
    },
    "filters": {
      "status": "success",
      "days": 7
    },
    "sort": {
      "sort_by": "created_at",
      "sort_order": "desc"
    }
  }
}
```

#### דוגמאות

```bash
# קבלת כל הלוגים
curl http://localhost:8080/api/email-logs

# סינון לפי status
curl "http://localhost:8080/api/email-logs?status=success"

# סינון לפי סוג מייל
curl "http://localhost:8080/api/email-logs?email_type=password_reset"

# סינון לפי recipient
curl "http://localhost:8080/api/email-logs?recipient=user@example.com"

# סינון לפי טווח תאריכים
curl "http://localhost:8080/api/email-logs?days=30"

# פאגינציה
curl "http://localhost:8080/api/email-logs?limit=50&offset=10"
```

---

### GET `/api/email-logs/statistics`

קבלת סטטיסטיקות לוגי מיילים.

#### Query Parameters

| פרמטר | סוג | תיאור | דוגמה |
|--------|-----|-------|-------|
| `days` | integer | מספר ימים לאחור (ברירת מחדל: 7) | `30` |

#### Response

```json
{
  "success": true,
  "data": {
    "total": 100,
    "by_status": {
      "success": 95,
      "failed": 5,
      "pending": 0
    },
    "by_type": {
      "password_reset": 50,
      "test": 30,
      "system_notification": 20
    },
    "top_recipients": [
      {
        "recipient": "user@example.com",
        "count": 10
      }
    ],
    "daily_distribution": [
      {
        "date": "2025-01-28",
        "count": 15
      }
    ],
    "period": {
      "days": 7,
      "from": "2025-01-21T00:00:00",
      "to": "2025-01-28T23:59:59"
    }
  }
}
```

#### דוגמאות

```bash
# סטטיסטיקות 7 ימים אחרונים
curl http://localhost:8080/api/email-logs/statistics

# סטטיסטיקות 30 ימים אחרונים
curl "http://localhost:8080/api/email-logs/statistics?days=30"
```

---

### GET `/api/email-logs/<log_id>`

קבלת לוג ספציפי לפי ID.

#### Path Parameters

| פרמטר | סוג | תיאור |
|--------|-----|-------|
| `log_id` | integer | ID של הלוג |

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "recipient": "user@example.com",
    "subject": "איפוס סיסמה - TikTrack",
    "status": "success",
    "sent_at": "2025-01-28T10:30:00",
    "created_at": "2025-01-28T10:30:00",
    "error_message": null,
    "email_type": "password_reset",
    "user_id": 1
  }
}
```

#### דוגמאות

```bash
# קבלת לוג לפי ID
curl http://localhost:8080/api/email-logs/1
```

---

## מבנה נתונים

### EmailLog Model

| שדה | סוג | תיאור |
|-----|-----|-------|
| `id` | integer | מזהה ייחודי |
| `recipient` | string | כתובת נמען |
| `subject` | string | נושא המייל |
| `status` | string | סטטוס (`success`, `failed`, `pending`) |
| `sent_at` | datetime | תאריך ושעה של שליחה |
| `created_at` | datetime | תאריך ושעה של יצירה |
| `error_message` | string (nullable) | הודעת שגיאה (אם נכשל) |
| `email_type` | string (nullable) | סוג מייל |
| `user_id` | integer (nullable) | ID משתמש שהפעיל את המייל |

---

## קישורים רלוונטיים

- [SMTP Service Guide](./SMTP_SERVICE_GUIDE.md) - מדריך שירות SMTP
- [Email Templates Guide](./EMAIL_TEMPLATES_GUIDE.md) - מדריך templates
- [SMTP Management Guide](../admin/SMTP_MANAGEMENT_GUIDE.md) - מדריך ניהול SMTP

---

**עדכון אחרון**: 28 בינואר 2025  
**גרסה**: 1.0.0


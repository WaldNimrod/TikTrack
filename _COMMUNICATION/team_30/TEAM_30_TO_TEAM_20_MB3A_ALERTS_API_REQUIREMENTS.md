# Team 30 → Team 20: דרישות API — עמוד התראות (Alerts, D34)
**project_domain:** TIKTRACK

**from:** Team 30 (Frontend)  
**to:** Team 20 (Backend)  
**date:** 2026-01-31  
**re:** MB3A Alerts (D34) — דרישות ממשק, CRUD ו-API  
**מקור:** alerts_BLUEPRINT, PHX_DB_SCHEMA_V2.5 (user_data.alerts), Scope Lock

---

## 1. רקע

עמוד ההתראות (alerts.html, D34) ממומש ב-UI עם מבנה מלא (סיכום, טבלה, סינון, pagination).  
הממשק מוכן לחיבור ל-API; כרגע אין endpoint ל-alerts — חיבור ממתין להגדרת API בצד שרת.

נתיב: **נתונים → התראות** (`/alerts.html`)

---

## 2. מבנה הממשק — סקירה

### 2.1 סקשן סיכום (Summary)

| שדה תצוגה           | מזהה DOM         | מקור נתונים מוצע                              |
|----------------------|------------------|-----------------------------------------------|
| סה"כ התראות         | `totalAlerts`    | COUNT alerts WHERE deleted_at IS NULL          |
| התראות פעילות       | `activeAlerts`   | COUNT WHERE is_active = true AND deleted_at IS NULL |
| התראות חדשות        | `newAlerts`      | מוגדר בתאום (למשל 7/10 ימים)                 |
| התראות שהופעלו      | `triggeredAlerts` | COUNT WHERE is_triggered = true               |

### 2.2 טבלת ניהול התראות (alertsTable)

| עמודה      | שדה API / DB       | הערות                              |
|------------|--------------------|------------------------------------|
| מקושר ל    | `target_type`      | ticker \| trade \| trade_plan \| account \| general |
| טיקר       | `ticker_id` / `ticker_symbol` | סימבול מהצמדה לטבלת tickers |
| תנאי       | `condition_field`, `condition_operator`, `condition_value` | תצוגה: "מחיר > 190" וכיו"ב |
| סטטוס      | `is_active`        | פעיל / לא פעיל                     |
| הופעל      | `is_triggered`     | כן / לא                             |
| נוצר ב     | `created_at`       | ISO 8601                            |
| פעולות     | —                  | צפה / ערוך / מחק                    |

שדות נוספים (Blueprint) — אופציונלי לתצוגה: `alert_type`, `triggered_at`, `expires_at`, `updated_at`.

### 2.3 סינון (Filter)

כפתורי סינון לפי `target_type`:

| ערך כפתור  | ערך API     | תיאור              |
|-------------|-------------|--------------------|
| all         | (ללא)       | הצגת הכל          |
| account     | account     | חשבונות מסחר      |
| trade       | trade       | טריידים           |
| trade_plan  | trade_plan  | תוכניות           |
| ticker      | ticker      | טיקרים            |

**הערה:** ב-DDL — `target_type` כולל `account` (לא `trading_account`).

### 2.4 פעולות שורה (CRUD)

| פעולה  | כפתור UI      | פעולה נדרשת      |
|--------|----------------|-------------------|
| צפה   | js-action-view | GET /alerts/:id   |
| ערוך  | js-action-edit | PATCH /alerts/:id |
| מחק   | js-action-delete| DELETE /alerts/:id|
| הוסף  | js-add-alert   | POST /alerts      |

---

## 3. דרישות API מפורטות

### 3.1 רשימת התראות (Read List)

**בקשה:** `GET /api/v1/alerts` (או `/users/me/alerts` לפי מבנה הקיים)

**Query Parameters:**

| פרמטר       | סוג     | חובה | תיאור                                      |
|-------------|---------|------|--------------------------------------------|
| target_type | string  | לא   | account, trade, trade_plan, ticker, general |
| page        | integer | לא   | עמוד (ברירת מחדל: 1)                       |
| per_page    | integer | לא   | רשומות לעמוד (10, 25, 50, 100 — ברירת מחדל 25) |
| sort        | string  | לא   | שדה מיון (created_at, target_type, is_active, …) |
| order       | string  | לא   | asc \| desc                                |

**Response מוצע:**

```json
{
  "data": [
    {
      "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      "target_type": "ticker",
      "target_id": "01ARZ3NDEKTSV4RRFFQ69G5FB2",
      "ticker_id": "01ARZ3NDEKTSV4RRFFQ69G5FB2",
      "ticker_symbol": "AAPL",
      "alert_type": "PRICE",
      "priority": "MEDIUM",
      "condition_field": "price",
      "condition_operator": ">",
      "condition_value": 190,
      "condition_summary": "מחיר > $190",
      "title": "התראת מחיר AAPL",
      "message": "מחיר הגיע ל-$190",
      "is_active": true,
      "is_triggered": false,
      "triggered_at": null,
      "expires_at": "2026-02-15T23:59:59Z",
      "created_at": "2026-01-30T10:15:00Z",
      "updated_at": "2026-01-30T10:15:00Z"
    }
  ],
  "total": 42
}
```

**הערות:**
- `condition_summary` — שדה מחושב/נגזר להצגה (או הרכבה בצד client מ־condition_*).
- `ticker_symbol` — join ל־tickers או שדה נגזר.

---

### 3.2 סיכום התראות (Summary)

**בקשה:** `GET /api/v1/alerts/summary`

**Response מוצע:**

```json
{
  "total_alerts": 12,
  "active_alerts": 8,
  "new_alerts": 2,
  "triggered_alerts": 3
}
```

**הגדרות:**
- `total_alerts`: COUNT WHERE deleted_at IS NULL
- `active_alerts`: COUNT WHERE is_active = true AND deleted_at IS NULL
- `new_alerts`: COUNT WHERE created_at >= NOW() - INTERVAL '10 days' (או לפי הגדרה)
- `triggered_alerts`: COUNT WHERE is_triggered = true

---

### 3.3 פרטי התראה בודדת (Read One)

**בקשה:** `GET /api/v1/alerts/:id`

**Response מוצע:** אובייקט Alert בודד (כמבנה בשורה ברשימה + שדות נוספים לפי צורך).

---

### 3.4 יצירת התראה (Create)

**בקשה:** `POST /api/v1/alerts`

**Body מוצע (JSON):**

```json
{
  "target_type": "ticker",
  "target_id": "01ARZ3NDEKTSV4RRFFQ69G5FB2",
  "ticker_id": "01ARZ3NDEKTSV4RRFFQ69G5FB2",
  "alert_type": "PRICE",
  "priority": "MEDIUM",
  "condition_field": "price",
  "condition_operator": ">",
  "condition_value": 190,
  "title": "התראת מחיר AAPL",
  "message": "מחיר הגיע ל-$190",
  "is_active": true,
  "expires_at": "2026-02-15T23:59:59Z"
}
```

**שדות חובה (לפי DDL):**
- `target_type` (enum: ticker, trade, trade_plan, account, general)
- `alert_type` (enum: PRICE, VOLUME, TECHNICAL, NEWS, CUSTOM)
- `title` (VARCHAR 200)
- `priority` (ברירת מחדל: MEDIUM — LOW, MEDIUM, HIGH, CRITICAL)

**Response:** 201 Created + אובייקט Alert מלא.

---

### 3.5 עדכון התראה (Update)

**בקשה:** `PATCH /api/v1/alerts/:id`

**Body מוצע (שדות לעדכון):**

```json
{
  "is_active": false,
  "title": "כותרת מעודכנת",
  "condition_value": 195,
  "expires_at": "2026-03-01T23:59:59Z"
}
```

**Response:** 200 OK + אובייקט Alert מעודכן.

---

### 3.6 מחיקת התראה (Delete)

**בקשה:** `DELETE /api/v1/alerts/:id`

**התנהגות:** Soft delete (הגדרת `deleted_at`) — בהתאם למדיניות הפרויקט.

**Response:** 204 No Content (או 200 OK + body ריק).

---

## 4. פעולות נוספות (אופציונלי)

### 4.1 בדיקת תנאים ("בדוק תנאים")

כפתור "בדוק תנאים" בבלופרינט — הפעלת בדיקה לשל כל ההתראות הפעילות.

**בקשה מוצעת:** `POST /api/v1/alerts/check` או `POST /api/v1/alerts/evaluate`

**Response:** 200 OK — אפשר להחזיר רשימת התראות שהופעלו, או סטטוס ביצוע.

---

### 4.2 סימון התראה כהופעלה

אם קיים flow של "סמן כנקרא" / "סמן כהופעל" — PATCH עם `is_triggered: true` (או שדה ייעודי).

---

## 5. סכמת DB (להפניה)

**טבלה:** `user_data.alerts`  
**מקור:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`

| שדה             | טיפוס                    | הערות                         |
|-----------------|--------------------------|-------------------------------|
| id              | UUID                     | PK                            |
| user_id         | UUID                     | FK → users                    |
| target_type     | VARCHAR(50)              | ticker, trade, trade_plan, account, general |
| target_id       | UUID                     | אופציונלי                     |
| ticker_id       | UUID                     | FK → tickers, אופציונלי       |
| alert_type      | user_data.alert_type     | PRICE, VOLUME, TECHNICAL, NEWS, CUSTOM |
| priority        | user_data.alert_priority  | LOW, MEDIUM, HIGH, CRITICAL  |
| condition_field | VARCHAR(50)              |                               |
| condition_operator | VARCHAR(10)           |                               |
| condition_value | NUMERIC(20, 8)           |                               |
| title           | VARCHAR(200)             | חובה                          |
| message         | TEXT                     |                               |
| is_active       | BOOLEAN                  | ברירת מחדל true               |
| is_triggered    | BOOLEAN                  | ברירת מחדל false              |
| triggered_at    | TIMESTAMPTZ              |                               |
| expires_at      | TIMESTAMPTZ              |                               |
| created_by, updated_by | UUID           | Audit                         |
| created_at, updated_at | TIMESTAMPTZ      |                               |
| deleted_at      | TIMESTAMPTZ              | Soft delete                   |
| metadata        | JSONB                    |                               |

---

## 6. סיכום Endpoints נדרשים

| שיטה   | נתיב                   | תיאור                    |
|--------|------------------------|---------------------------|
| GET    | /api/v1/alerts         | רשימת התראות + סינון + pagination |
| GET    | /api/v1/alerts/summary | סיכום ספירות              |
| GET    | /api/v1/alerts/:id     | פרטי התראה בודדת        |
| POST   | /api/v1/alerts         | יצירת התראה              |
| PATCH  | /api/v1/alerts/:id     | עדכון התראה              |
| DELETE | /api/v1/alerts/:id     | מחיקה (soft delete)       |
| POST   | /api/v1/alerts/check   | (אופציונלי) בדיקת תנאים  |

---

## 7. הפניות

| פריט           | נתיב |
|----------------|------|
| Scope Lock     | `_COMMUNICATION/team_10/TEAM_10_MB3A_ALERTS_SCOPE_LOCK.md` |
| Blueprint      | `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/alerts_BLUEPRINT.html` |
| DDL Schema     | `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (טבלת alerts) |
| Execution Order| `_COMMUNICATION/team_10/TEAM_10_MB3A_ALERTS_EXECUTION_ORDER_AND_PROMPTS_REF.md` |
| ממשק UI       | `ui/src/views/data/alerts/alerts.content.html`, `alertsTableInit.js` |

---

**log_entry | TEAM_30 | TO_20 | MB3A_ALERTS_API_REQUIREMENTS | 2026-01-31**

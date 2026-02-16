# Team 60 → Team 20: תיאום DDL — D34 Alerts (עמוד התראות)

**id:** `TEAM_60_TO_TEAM_20_D34_ALERTS_DDL_COORDINATION`  
**from:** Team 60 (DevOps & Platform)  
**to:** Team 20 (Backend)  
**date:** 2026-02-16  
**מקור:** TEAM_10_MB3A_ALERTS_SCOPE_LOCK; TEAM_10_MB3A_ALERTS_EXECUTION_ORDER_AND_PROMPTS_REF §6; TEAM_40_TO_TEAM_30_MB3A_BUILD_ALERTS_COORDINATION

---

## 1. מטרת התיאום

תאום מבנה הטבלה `user_data.alerts` למימוש מלא ומדויק של עמוד התראות (D34). Migration בוצע. נדרש API ל-Team 30 להתחבר לנתונים אמיתיים.

---

## 2. מבנה טבלה — DDL

**טבלה:** `user_data.alerts`

| עמודה | טיפוס | הערות |
|-------|-------|-------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| user_id | UUID | NOT NULL, FK → user_data.users(id) ON DELETE CASCADE |
| target_type | VARCHAR(50) | NOT NULL, CHECK (ticker, trade, trade_plan, account, general) |
| target_id | UUID | — |
| ticker_id | UUID | FK → market_data.tickers(id) ON DELETE CASCADE |
| alert_type | user_data.alert_type | NOT NULL — ENUM: PRICE, VOLUME, TECHNICAL, NEWS, CUSTOM |
| priority | user_data.alert_priority | NOT NULL DEFAULT 'MEDIUM' — ENUM: LOW, MEDIUM, HIGH, CRITICAL |
| condition_field | VARCHAR(50) | — |
| condition_operator | VARCHAR(10) | — |
| condition_value | NUMERIC(20, 8) | — |
| title | VARCHAR(200) | NOT NULL |
| message | TEXT | — |
| is_active | BOOLEAN | NOT NULL DEFAULT TRUE |
| is_triggered | BOOLEAN | NOT NULL DEFAULT FALSE |
| triggered_at | TIMESTAMPTZ | — |
| expires_at | TIMESTAMPTZ | — |
| created_by | UUID | NOT NULL, FK → user_data.users(id) |
| updated_by | UUID | NOT NULL, FK → user_data.users(id) |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |
| deleted_at | TIMESTAMPTZ | soft delete |
| metadata | JSONB | DEFAULT '{}' |

**אינדקסים:** `idx_alerts_user`, `idx_alerts_ticker`, `idx_alerts_target`, `idx_alerts_active`.

**מיקום DDL:** `scripts/migrations/d34_alerts.sql`  
**הרצה:** `make migrate-d34-alerts`

---

## 3. יישור ל-Build Alerts (30/40)

| פריט | ערך |
|------|-----|
| **Scope Lock** | TEAM_10_MB3A_ALERTS_SCOPE_LOCK.md |
| **Blueprint** | _COMMUNICATION/team_31/team_31_staging/sandbox_v2/alerts_BLUEPRINT.html |
| **Route** | alerts |
| **תפריט** | נתונים → התראות |

**משמעות:** Team 30 מצפה ל־API (למשל GET /users/me/alerts, PATCH) כדי להציג נתונים אמיתיים. כרגע UI יכול mock — מימוש API יאפשר חיבור לנתונים.

---

## 4. חוזים מומלצים (OpenAPI)

לפי [TEAM_10_MB3A_ALERTS_EXECUTION_ORDER_AND_PROMPTS_REF.md](../team_10/TEAM_10_MB3A_ALERTS_EXECUTION_ORDER_AND_PROMPTS_REF.md) §6 — אין חוזה OpenAPI קיים ל-alerts. מומלץ:
- **GET** `/api/v1/users/me/alerts` (או `/alerts`) — רשימת התראות למשתמש מחובר
- **PATCH** — עדכון (is_active, וכו') לפי צורך
- **POST** — יצירת התראה (אם בסקופ)

**תיאום שמות שדות:** דרך Team 10/GIN אם נדרש.

---

## 5. מסמכים

| מסמך | נתיב |
|------|------|
| Scope Lock | _COMMUNICATION/team_10/TEAM_10_MB3A_ALERTS_SCOPE_LOCK.md |
| Execution Order §6 | _COMMUNICATION/team_10/TEAM_10_MB3A_ALERTS_EXECUTION_ORDER_AND_PROMPTS_REF.md |
| Build Coordination 40→30 | _COMMUNICATION/team_40/TEAM_40_TO_TEAM_30_MB3A_BUILD_ALERTS_COORDINATION.md |
| Full DDL | documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql |
| Migration | scripts/migrations/d34_alerts.sql |

---

**log_entry | TEAM_60 | TO_TEAM_20 | D34_ALERTS_DDL_COORDINATION | 2026-02-16**

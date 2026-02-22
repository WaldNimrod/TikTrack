# Team 20 → Team 30: מימוש API התראות (D34) — הושלם
**project_domain:** TIKTRACK

**from:** Team 20 (Backend)  
**to:** Team 30 (Frontend)  
**date:** 2026-02-16  
**מקור:** TEAM_30_TO_TEAM_20_MB3A_ALERTS_API_REQUIREMENTS, TEAM_60_TO_TEAM_20_D34_ALERTS_DDL_COORDINATION

---

## 1. Endpoints מוּמשים

| שיטה | נתיב | תיאור |
|------|------|-------|
| GET | /api/v1/alerts/summary | סיכום — total_alerts, active_alerts, new_alerts (10 ימים), triggered_alerts |
| GET | /api/v1/alerts | רשימה + סינון (target_type), pagination (page, per_page), מיון (sort, order) |
| GET | /api/v1/alerts/:id | פרטי התראה בודדת |
| POST | /api/v1/alerts | יצירת התראה |
| PATCH | /api/v1/alerts/:id | עדכון התראה |
| DELETE | /api/v1/alerts/:id | מחיקה (soft delete) |

---

## 2. מבנה תשובה

**רשימה/פרטים:** כולל `ticker_symbol` (מ־join ל־market_data.tickers), `condition_summary` (שדה מחושב).

**סיכום:** `total_alerts`, `active_alerts`, `new_alerts`, `triggered_alerts`.

**Query params:** `target_type`, `page`, `per_page`, `sort`, `order`.

---

## 3. קבצים

- `api/models/alerts.py` — Alert model + enums
- `api/models/enums.py` — AlertType, AlertPriority
- `api/schemas/alerts.py` — AlertCreate, AlertUpdate
- `api/services/alerts_service.py` — לוגיקה
- `api/routers/alerts.py` — ראוטים

---

## 4. אימות

- GET /alerts/summary → 200
- GET /alerts → 200
- POST /alerts → 201
- PATCH /alerts/:id → 200
- DELETE /alerts/:id → 204

---

**log_entry | TEAM_20 | TO_TEAM_30 | MB3A_ALERTS_API_IMPLEMENTATION_COMPLETE | 2026-02-16**

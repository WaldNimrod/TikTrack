# Team 30 → Team 20: תאום משימה 3 — Select + Rich Text (Broker API)

**מאת:** Team 30 (Frontend Integration)  
**אל:** Team 20 (Backend / API)  
**תאריך:** 2026-02-10  
**הקשר:** משימה 3 אחרי שער א' — `TEAM_10_TO_ALL_TEAMS_NEXT_PHASE_AFTER_GATE_A_KICKOFF.md`  
**רפרנס:** `TEAM_10_VISUAL_GAPS_WORK_PLAN.md` — משימות 1, 2

---

## 1. מטרת התאום

Team 30 מתעתד ליישם את **משימה 3** (Select vs Text + Rich Text) — כולל החלפת שדות Broker ב־**dynamic select** ממקור API.

לצורך כך נדרש וידוא/תחזוקה של **API GET /api/v1/reference/brokers** מצד Team 20.

---

## 2. ADR‑013 (LOCKED)

- **מקור רשימת ברוקרים:** `GET /api/v1/reference/brokers`
- **Rich Text:** TipTap (Headless UI) — Locked

---

## 3. דרישות מ־Team 20

### 3.1 API GET /api/v1/reference/brokers

| פריט | תיאור |
|------|--------|
| **Endpoint** | `GET /api/v1/reference/brokers` |
| **תגובה** | רשימת ברוקרים (אובייקטים עם מזהה + שם תצוגה) |
| **פורמט** | snake_case (עקבי עם שאר ה‑API) |
| **הרשאה** | דורש authentication (משתמש מחובר) |

### 3.2 מבנה תגובה צפוי (לדוגמה)

```json
{
  "data": [
    {
      "id": "...",
      "external_ulid": "...",
      "name": "Broker Name",
      "display_name": "..."
    }
  ]
}
```

או פורמט דומה שמאפשר מיפוי ל־`id` + `name` / `displayName` ל־select options.

---

## 4. שימוש ב־Frontend (Team 30)

- **טפסים:** `tradingAccountsForm.js`, `brokersFeesForm.js` — שדה Broker יוחלף מ־text input ל־**dynamic select**
- **מקור נתונים:** קריאה ל־`GET /api/v1/reference/brokers` דרך Shared_Services
- **פילטור:** לפי authentication — קריאה רק למשתמש מחובר

---

## 5. שאלות להבהרה

1. **האם ה-endpoint קיים ומפעיל** כרגע? אם לא — מועד משוער לזמינות?
2. **מבנה שדות מדויק** — אילו שדות מזהים את הברוקר (id, external_ulid) ואיזה משמש לתצוגה (name, display_name)?
3. **Pagination / סננים** — האם נדרש pagination או query params נוספים, או שמדובר ברשימה מלאה קצרה?

---

## 6. צעדים הבאים

- **Team 20:** וידוא/תחזוקת ה-endpoint; עדכון OpenAPI אם רלוונטי; מענה על שאלות להבהרה.
- **Team 30:** לאחר קבלת אישור — מימוש UI (Select ממקור API) + TipTap ל־description/notes.

---

**Team 30 (Frontend)**  
**log_entry | TASK_3_COORDINATION | TO_TEAM_20 | 2026-02-10**

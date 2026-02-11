# Team 20 → Team 30: מענה תאום משימה 3 — Broker API מוכן

**מאת:** Team 20 (Backend)  
**אל:** Team 30 (Frontend)  
**תאריך:** 2026-02-10  
**הקשר:** `TEAM_30_TO_TEAM_20_TASK_3_COORDINATION.md`  
**סטטוס:** ✅ **API מופעל ופעיל**

---

## 1. מענה על שאלות להבהרה

### 1.1 האם ה-endpoint קיים ומפעיל כרגע?
**כן.** `GET /api/v1/reference/brokers` ממומש ומפעיל.

### 1.2 מבנה שדות מדויק
לפי **DATA_MAP_FINAL.json** (ADR-013, SSOT) — **לא** `id` / `external_ulid` / `name` / `display_name`.

הברוקרים הם **שמות** (strings), לא ישויות עם ULIDs. שדה `broker` ב־brokers_fees וב־trading_accounts הוא `VARCHAR(100)`.

**פורמט תגובה (נעול):**
```json
{
  "data": [
    { "value": "Interactive Brokers", "label": "Interactive Brokers" },
    { "value": "Fidelity", "label": "Fidelity" }
  ],
  "total": 2
}
```

| שדה | שימוש |
|-----|--------|
| `value` | ערך שנשלח בטופס (value של option) |
| `label` | טקסט מוצג (תוכן option) |

**מיפוי ל־Select:**
```html
<option value="{value}">{label}</option>
```
ב־Frontend: `value` → `option.value`, `label` → `option.label` / text.

### 1.3 Pagination / סננים
**לא.** רשימה קצרה; אין pagination ואין query params.

---

## 2. פרטי Endpoint

| פריט | ערך |
|------|-----|
| **URL** | `GET /api/v1/reference/brokers` |
| **Auth** | JWT Bearer (חובה) |
| **Response** | `{ data: [{ value, label }], total }` |
| **snake_case** | כן (עקבי עם API) |

---

## 3. מקור נתונים
- **ראשי:** ברוקרים ייחודיים של המשתמש מ־`brokers_fees`
- **Fallback:** `defaults_brokers.json` כשאין נתונים למשתמש

---

## 4. צעדים הבאים
- **Team 30:** חיבור ה־Select בטפסים D16, D18 ל־`GET /api/v1/reference/brokers` דרך Shared_Services.

---

**Team 20 (Backend)**  
**log_entry | TASK_3_RESPONSE | BROKER_API_READY | 2026-02-10**

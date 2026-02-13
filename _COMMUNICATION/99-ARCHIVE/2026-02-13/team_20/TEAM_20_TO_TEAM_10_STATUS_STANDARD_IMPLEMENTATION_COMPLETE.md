# Team 20 → Team 10: יישום סטנדרט סטטוסים D16 — הושלם

**מאת:** Team 20 (Backend)  
**אל:** Team 10 (The Gateway)  
**תאריך:** 2026-02-12  
**הקשר:** TEAM_10_TO_TEAM_20_STATUS_STANDARD_AND_D21.md  
**מקור:** TT2_SYSTEM_STATUS_VALUES_SSOT, TEAM_10_BATCH_1_2_FINAL_REPORT_AND_CLOSURE_PLAN §4.6  

---

## 1. סיכום

| נושא | ביצוע |
|------|--------|
| **D16 trading_accounts** | Query param `status` — ערכים קנוניים (active\|inactive\|pending\|cancelled); תגובה כוללת שדה `status` קנוני |
| **D21 cash_flows** | ללא שינוי — אין סטטוס לתזרימי מזומנים |

---

## 2. שינויי D16 (trading_accounts)

### 2.1 Query param — GET list + summary

**לפני:** `status: Optional[bool]` (true/false)  
**אחרי:** `status: Optional[str]` — ערכים: `active` \| `inactive` \| `pending` \| `cancelled`

**מיפוי ל-DB:**
- `active` → `is_active = true`
- `inactive`, `pending`, `cancelled` → `is_active = false`

### 2.2 Response — TradingAccountResponse

**נוסף:** `status: str` — ערך קנוני (`active` \| `inactive`)  
**נשמר:** `is_active: bool` — תאימות לאחור

---

## 3. D21 — Cash Flows

אין שינוי — אין סטטוס לתזרימי מזומנים, ה-API ללא עדכונים.

---

## 4. קבצים שעודכנו

| קובץ | שינוי |
|------|--------|
| `api/schemas/trading_accounts.py` | STATUS_ACTIVE/STATUS_INACTIVE; שדה `status` ב-TradingAccountResponse |
| `api/routers/trading_accounts.py` | `_canonical_status_to_is_active()`; param `status` כערך קנוני |
| `api/services/trading_accounts.py` | הוספת `status` לכל ה-TradingAccountResponse |

---

## 5. תיאום Frontend

- שליחת `status=active` או `status=inactive` ב-query
- קבלת `status` בתגובה (במקביל ל-`is_active`)

---

**Team 20 (Backend)**  
**log_entry | STATUS_STANDARD | D16_IMPLEMENTATION_COMPLETE | TO_TEAM_10 | 2026-02-12**

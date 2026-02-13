# Team 10 → Team 30: מנדט — External Data M6 (Clock-based Staleness UI)

**id:** `TEAM_10_TO_TEAM_30_EXTERNAL_DATA_M6_MANDATE`  
**from:** Team 10 (The Gateway)  
**to:** Team 30 (Frontend)  
**date:** 2026-02-13  
**משימה:** P3-012 (M6)  
**מקור:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_DELIVERY_NOTICE; TEAM_10_EXTERNAL_DATA_MASTER_PLAN.md

---

## 1. מקורות מחייבים

| מסמך | נתיב |
|------|------|
| MARKET_DATA_PIPE_SPEC | documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md — §2.5 |
| FOREX_MARKET_SPEC | documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md — §2.5 |

---

## 2. דרישות M6 — UI אינדיקציה ל־Staleness

| דרישה | פירוט |
|--------|--------|
| **פורמט** | **Clock + color + tooltip** — **אין באנר.** (הוחלט באדריכלית — Delivery Notice.) |
| **תצוגה** | הצגת **Last Update Clock** למחירים/שערים. אם הנתונים stale או EOD — השעון משנה צבע + tooltip מסביר staleness. |
| **שדות API** | `price_timestamp` (as_of), `fetched_at`, `is_stale`; `staleness`: ok \| warning (>15 דקות) \| na (>24h). |
| **התנהגות** | כאשר `staleness` ≠ `ok` — אינדיקציה ויזואלית (שעון + צבע + tooltip), לא באנר. |

---

## 3. תוצר נדרש

- מימוש Clock + color + tooltip בכל מקום שמציגים מחיר/שער EOD או stale.  
- דוח השלמה ב־`_COMMUNICATION/team_30/`.

---

**הערה:** מימוש קודם (EOD warning banner) — יש להתאים למפרט החדש (Clock + tooltip, אין באנר) אם נדרש.

---

**log_entry | TEAM_10 | TO_TEAM_30 | EXTERNAL_DATA_M6_MANDATE | 2026-02-13**

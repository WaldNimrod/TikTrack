---
id: TEAM_170_TO_TEAM_11_AOS_V3_CANONICAL_PROMOTION_RECEIPT_v1.0.0
from: Team 170 (Spec & Governance Authority)
to: Team 11 (AOS Gateway / Execution Lead)
cc: Team 71 (AOS Documentation), Team 10 (Gateway)
date: 2026-03-29
type: RECEIPT — קידום קאנוני AOS v3
domain: agents_os + governance
branch: aos-v3
ref: _COMMUNICATION/team_11/TEAM_11_TO_TEAM_170_AOS_V3_CANONICAL_PROMOTION_MANDATE_v1.0.0.md
---

# Team 170 → Team 11 | קבלת מסירה — קידום קאנוני AOS v3

## תאריך

**2026-03-29**

## רשימת קבצים קנוניים שעודכנו

| Path |
|------|
| `documentation/docs-agents-os/01-OVERVIEW/AGENTS_OS_V3_OVERVIEW.md` |
| `documentation/docs-agents-os/02-ARCHITECTURE/AGENTS_OS_V3_ARCHITECTURE_OVERVIEW.md` |
| `documentation/docs-agents-os/04-PROCEDURES/AGENTS_OS_V3_DEVELOPER_RUNBOOK.md` |
| `documentation/docs-agents-os/05-TEMPLATES/AGENTS_OS_V3_LOCAL_VALIDATION_CHECKLIST.md` |
| `documentation/docs-agents-os/00_AGENTS_OS_MASTER_INDEX.md` |

**לא נערכו:** `agents_os_v3/` (קוד), `AGENTS.md` (אומת מול הקנון — אין סתירה), `00_MASTER_INDEX.md` (אין נקודת כניסה חדשה).

## החלטות (תמצית)

- **בקנון `documentation/docs-agents-os/`:** טבלת v2/v3 ב-Overview מתיישרת עם מדיניות הפורטים — v2 UI על **8092**, v3 API+UI על **8090** עם FastAPI מגיש `GET /` ו־`/v3/*` (ולא תיאור שגוי של v2 על 8090 או v3 רק כ־`http.server` ראשי). Architecture Overview: שורת `ui/` משקפת mounts ב־`create_app`. Runbook: §7.2 מתעד `localStorage` **`aosv3_ui_data_scope`** (`all` / `agents_os` / `tiktrack`) בהתאם ל־`app.js`. Checklist: בדיקה אופציונלית מקושרת ל־§7.2. מאסטר אינדקס Agents OS: הערת יישור קצרה + `log_entry` Team 170.
- **נשאר ב־`AGENTS.md` / tooling:** הפעלה מקומית, health, Bootstrap, הפרדת DB, `FILE_INDEX`, pre-commit — ללא שינוי; מיושר עם `AGENTS_OS_V3_NETWORK_PORTS_AND_UI_ENTRY_v1.0.0.md`.
- **Team 71:** רשאית מעבר עריכתי עתידי על ניסוח ארוך בקבצים שסומנו `owner: Team 71` בפרונט־מטר.

## הפניה ל־Team 10

**לא נדרש** — אין בקשת ניתוב חבילת WP חדשה או עדכון אינדקס Gateway מעבר לקבלה זו. Team 10 רשאי לרשום סגירת מנדט לפי נוהל Gateway.

---

**log_entry | TEAM_170 | AOS_V3 | CANONICAL_PROMOTION_RECEIPT | DELIVERED_TO_TEAM_11 | 2026-03-29**

historical_record: true

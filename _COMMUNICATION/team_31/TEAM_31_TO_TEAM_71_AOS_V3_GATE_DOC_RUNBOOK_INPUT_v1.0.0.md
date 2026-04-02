---
id: TEAM_31_TO_TEAM_71_AOS_V3_GATE_DOC_RUNBOOK_INPUT_v1.0.0
historical_record: true
from: Team 31 (AOS Frontend Implementation)
to: Team 71 (AOS Documentation)
cc: Team 11 (AOS Gateway), Team 21 (AOS Backend), Team 61 (AOS DevOps)
date: 2026-03-28
type: GATE_DOC_PHASE_B — structured input for AGENTS_OS_V3_DEVELOPER_RUNBOOK.md
domain: agents_os
branch: aos-v3
reply_to: TEAM_11_TO_TEAM_31_AOS_V3_GATE_DOC_PHASE_B_MANDATE_v1.0.0.md---

# Team 31 → Team 71 | AOS v3 UI — קלט מובנה ל-Runbook

מסמך זה מספק עובדות ממשק וריצה מקומית לשילוב ב־**`AGENTS_OS_V3_DEVELOPER_RUNBOOK.md`** (עריכה קנונית נשארת ב־Team 71). **אין כאן מפרט API מלא** — לשאלות backend ראו `agents_os_v3/modules/management/api.py` וצוות 21.

---

## (א) דפים ותפקיד

כל הדפים תחת **`agents_os_v3/ui/`**, נטענים כ־HTML סטטי; ליבה משותפת: **`theme-init.js`** → **`api-client.js`** (חוץ ממצב שבו רק `theme-init` + `app.js` לפי דף) → **`app.js`**. מאפיין גוף: **`data-aosv3-page`** מפעיל את אתחול העמוד ב־`boot()`.

| קובץ | `data-aosv3-page` | תפקיד קצר |
|------|-------------------|-----------|
| `index.html` | `pipeline` | תצוגת צינור: מצב שרת חי (`GET /api/state`), SSE + polling, פעולות run (advance וכו') — ראו קוד |
| `history.html` | `history` | אירועים / מסננים מול `/api/history`, בורר run מ־`/api/runs` |
| `config.html` | `config` | routing rules, policies, templates — מול endpoints תחת `/api` בקוד השרת |
| `teams.html` | `teams` | רoster, עדכון engine (מוגבל actor בשרת) |
| `portfolio.html` | `portfolio` | runs, work-packages, ideas |
| `flow.html` | `flow` | System Map (Mermaid); צ'יפ SSE/בריאות; **אין** תלות בתרשימים ב-API |

**מסלול ייחוס CSS משותף:** `../../agents_os/ui/css/pipeline-shared.css` + `style.css` מקומי.

---

## (ב) Preflight וסקריפטים

| נכס | שימוש |
|-----|--------|
| **`agents_os_v3/ui/run_preflight.sh`** | מ-repo root: `bash agents_os_v3/ui/run_preflight.sh [PORT]` — ברירת מחדל **8778** ל־`python3 -m http.server`; בודק HTTP 200 לששת נתיבי ה-HTML למעלה. |
| **`AOS_V3_API_BASE`** (אופציונלי) | אם מוגדר (למשל `http://127.0.0.1:8090`), הסקריפט מבצע גם **`GET …/api/health`** ומצפה ל־200. |

**מטריצת צילומים (QA):** תחת `agents_os_v3/ui/scripts/` — `capture_gate3_matrix.mjs`, `package.json`; תיעוד קצר: `README_GATE3_MATRIX.md`. זה כלי Node/Playwright, לא חובת ריצה יומיומית למפתח UI בסיסי.

---

## (ג) פורטים והתנגשויות ידועות

| שירות | פורט טיפוסי | הערה |
|--------|-------------|------|
| **API FastAPI (AOS v3)** | **8090** | ברירת מחדל ב־`<meta name="aosv3-api-base" content="http://127.0.0.1:8090" />` בכל ששת הדפים; ניתן לדרוס ב־`localStorage` (`aosv3_api_base`) או `window.__AOSV3_API_BASE__` — ראו `api-client.js`. |
| **שרת סטטי UI (דוגמה)** | **8778** | כמו ב־`run_preflight.sh`; כל פורט חינמי אחר תקף אם מעדכים את כתובת הדפדפן. |
| **CORS** | — | מקורות מותרים מוגדרים בשרת (`agents_os_v3/modules/management/api.py` — `_allowed_origins()`); לשאלות הרחבה — צוות 61/21. |

**התנגשות פוטנציאלית:** פורט 8090 עשוי לשמש גם לשירותים אחרים בפרויקט; תמיד לאמת מול התהליך שבו Team 61 מריץ את uvicorn ל־AOS v3.

---

## (ד) חוזה layout / header (רלוונטי לריצה ולעקביות תיעוד)

מבנה חוזר בכל הדפים:

- **`<header class="agents-header">`** — כותרת + אזור ימני (למשל צ'יפ SSE ב־pipeline/flow).
- **`<nav class="pipeline-nav">`** — קישורי ניווט בין ששת הדפים.
- **`<div class="agents-page-layout" id="agents-page-layout">`** — עמודה ראשית (וב־pipeline גם **`<aside class="agents-page-sidebar">`**).

**תמה (בהיר / כהה):** `theme-init.js` + מחלקת שורש `theme-tiktrack` על `<html>` לעומת מצב Agents OS; מפתח `localStorage`: **`pipeline_domain`** (`agents_os` vs `tiktrack`) — מסונכרן עם `AOSV3_onDomainSwitch` ב־`app.js`.

---

## (ה) קישורים לקבצי UI עיקריים

| נתיב | תיאור |
|------|--------|
| `agents_os_v3/ui/app.js` | לוגיקת דפים, mock לעומת live (`aosv3UseMock`), אינטגרציית API |
| `agents_os_v3/ui/api-client.js` | בסיס URL, כותרת **`X-Actor-Team-Id`**, `apiJson`, בניית URL ל-SSE |
| `agents_os_v3/ui/theme-init.js` | אתחול תמה לפי דומיין |
| `agents_os_v3/ui/style.css` | עיצוב AOS v3 UI |
| `agents_os_v3/ui/pipeline_flow.html` | מקור תרשימי ייחוס (System Map ב־`flow.html` משמר תוכן עשיר מקומי) |

**אינדקס נכסים:** `agents_os_v3/FILE_INDEX.json` (גרסה נוכחית לפי repo — Team 31 אישר יישור ב-GATE_5 hygiene).

---

**log_entry | TEAM_31 | AOS_V3_BUILD | GATE_DOC_RUNBOOK_INPUT | FILED | 2026-03-28**

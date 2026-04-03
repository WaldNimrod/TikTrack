---
id: TEAM_61_TO_TEAM_51_DM004_DMP_UI_QA_REQUEST_v1.0.0
historical_record: true
from: Team 61 (Cloud Agent / Agents_OS UI)
to: Team 51 (QA Remote — FAST_2.5 / E2E)
cc: Team 100 (Gateway / architectural closure), Team 90 (Bridge — informational)
date: 2026-03-23
status: QA_REQUEST_ACTIVE
type: CANONICAL_QA_ACTIVATION
direct_mandate: DM-004
authority_basis:
  - _COMMUNICATION/team_00/TEAM_00_TO_TEAM_61_DMP_UI_INTEGRATION_MANDATE_v1.0.0.md
  - _COMMUNICATION/_Architects_Decisions/DIRECT_MANDATE_REGISTRY_v1.0.0.md
implementation_artifact:
  - _COMMUNICATION/team_61/TEAM_61_DM_004_COMPLETION_REPORT_v1.0.0.md---

# בקשת QA קנונית — Team 51 | DM-004 DMP UI Integration

## §1 — מטרה

אימות **עצמאי** (functional + E2E בדפדפן) של מימוש **Direct Mandate Protocol (DMP)** ב-Agents OS UI:

- **Roadmap:** פאנל **Direct Mandates** ב-sidebar (טאבים Active / Closed, deep-link `#dm-panel`).
- **Dashboard:** באדג' **DM** בכותרת ליד Last updated (ספירת מנדטים ב-`ACTIVE`, ניווט ל-Roadmap).

לאחר **QA_PASS** קנוני מ-Team 51 — Team 61 מודיע ל-**Team 100** לבחינת אדריכלות ואישור סגירת **DM-004** (עדכון registry / DMP — אחריות Team 100).

---

## §2 — Identity header (מחייב)

| Field | Value |
|-------|--------|
| roadmap_id | PHOENIX_ROADMAP |
| direct_mandate_id | **DM-004** |
| mandate_ref | `TEAM_00_TO_TEAM_61_DMP_UI_INTEGRATION_MANDATE_v1.0.0.md` |
| registry_ssot | `_COMMUNICATION/_Architects_Decisions/DIRECT_MANDATE_REGISTRY_v1.0.0.md` |
| team_61_completion | `_COMMUNICATION/team_61/TEAM_61_DM_004_COMPLETION_REPORT_v1.0.0.md` |
| scope | `agents_os/ui` — Roadmap + Dashboard + shared DOM helpers (רשימה מלאה בדוח ההשלמה) |

---

## §3 — In / Out of scope

| In scope | Out of scope |
|----------|----------------|
| `PIPELINE_ROADMAP.html`, `pipeline-roadmap.js`, `pipeline-roadmap.css` | שינוי `documentation/` (אסור ל-Team 51; consolidation דרך Team 10) |
| `PIPELINE_DASHBOARD.html`, `pipeline-dashboard.js`, `pipeline-dashboard.css` | עריכת `DIRECT_MANDATE_REGISTRY` לצורך בדיקה **ללא אישור** (הסתמכו על מצב repo) |
| `pipeline-dom.js` — `extractMarkdownTable` | שינוי `extractTable` ב-`pipeline-roadmap.js` (אסור; ודאו שלא נדרש) |
| קריאת registry ב-fetch read-only בלבד | GATE pipeline advance, WSM |

---

## §4 — תנאי קדם

| # | Requirement |
|---|-------------|
| 1 | Workspace מעודכן (ענף מאושר / `main`). |
| 2 | שרת UI: **`./agents_os/scripts/start_ui_server.sh`** — פורט נעול **8090** (מדיניות repo). |
| 3 | כתובות בסיס (מוצגות בהפעלה): `http://127.0.0.1:8090/static/PIPELINE_DASHBOARD.html`, `.../PIPELINE_ROADMAP.html`. |
| 4 | ה-JS טוען את ה-registry מ-`../../_COMMUNICATION/_Architects_Decisions/...` — בשרת ה-AOS זה מפוענח ל-`http://127.0.0.1:8090/_COMMUNICATION/...` (Mount קיים ב-`aos_ui_server.py`). **אל** תשרתו רק מתיקיית `agents_os/ui` בלי גישה ל-`_COMMUNICATION` — אחרת AC-08 ייכשל. |
| 5 | רגרסיה אוטומטית (AC-09): `python3 -m pytest agents_os_v2/tests/ -q -k "not OpenAI and not Gemini"` (או יעד ה-repo הקבוע). |

---

## §5 — מטריצת בדיקה (ממופה ל-AC)

| # | AC | בדיקה | תוצאה צפויה |
|---|-----|--------|-------------|
| 1 | AC-01 | Roadmap → sidebar אחרי Hierarchy Validation: **Direct Mandates** | פאנל נראה; **Active** מכיל לפחות **DM-003**, **DM-004** (לפי registry נוכחי); **Closed** מכיל **DM-001**, **DM-002** |
| 2 | AC-02 | לחיצה **Closed** / **Active** | תוכן מתחלף; מונים בכותרות הטאבים עקביים |
| 3 | AC-03 | (אופציונלי) empty state | אם אין שורות בטאב — `"No active mandates"` / `"No closed mandates"` (לא לשנות SSOT ללא אישור) |
| 4 | AC-04 | Dashboard — מונה ACTIVE | עם 2 שורות `Status=ACTIVE` ב-registry — באדג' כתום **`DM ●2`** (או מספר תואם) |
| 5 | AC-05 | Dashboard — אפס ACTIVE | אם אין ACTIVE — **`DM ○`** (אפור); ללא שינוי registry — דלגו או תעדו לוגיקה בלבד |
| 6 | AC-06 | לחיצה על הבאדג' | ניווט ל-`PIPELINE_ROADMAP.html#dm-panel`; אקרדיון DM **פתוח**; גלילה סבירה לפאנל |
| 7 | AC-07 | סריקת UI | אין כפתורי עריכה / שליחה ל-registry; read-only |
| 8 | AC-08 | (אופציונלי) שגיאת טעינה | אם מדמים 404 — הודעה מעומעמת (`DM Registry not available` וכו') **בלי** קריסת העמוד |
| 9 | AC-09 | Pytest | 0 כשלונות רגרסיה ב-agents_os_v2 (סינון כלל הפרויקט) |

---

## §6 — E2E באמצעות MCP Browser (Cursor / IDE)

כאשר זמין **cursor-ide-browser** (או שקילות), מומלץ לאמת את §5 בצורה חוזרת:

1. **`browser_navigate`** → `http://127.0.0.1:8090/static/PIPELINE_ROADMAP.html` (אחרי שרת רץ).
2. **`browser_lock`** → **`browser_snapshot`** — לאמת כותרת **Direct Mandates**, טאבים, טקסט שורות DM.
3. לחיצה על טאב **Closed** — snapshot — DM-001 / DM-002.
4. **`browser_navigate`** → Dashboard; snapshot — `#dm-active-badge` (או `data-testid` אם נוסף בעתיד).
5. **`browser_click`** על הבאדג' — ודאו מעבר ל-Roadmap + hash `#dm-panel` + פאנל פתוח.
6. **`browser_unlock`** בסיום.

**ראיה מינימלית לדוח:** צילומי מסך או ציטוט refs מ-snapshot לשורות #1, #2, #4, #6.

---

## §7 — ארטיפקטים נדרשים מ-Team 51

| Deliverable | נתיב / פורמט |
|-------------|----------------|
| דוח QA קנוני | `_COMMUNICATION/team_51/TEAM_51_DM004_DMP_UI_QA_REPORT_v1.0.0.md` (או גרסה עוקבת) |
| שורת תוצאה | `QA_PASS` או `QA_FAIL` בכותרת / סיכום |
| טבלת מטריצה | העתקת §5 עם עמודת **Result** (PASS/FAIL/N/A) |
| ראיה | צילומי מסך או תיאור MCP snapshot; פקודת pytest + תוצאה |
| Seal (אופציונלי) | SOP-013 אם נוהל Team 51 מחייב |

---

## §8 — אחרי QA_PASS — Team 100 (סגירה אדריכלית)

1. Team 51 מפרסם דוח עם **QA_PASS**.
2. Team 61 מעדכן את Team 100 (Gateway) עם:
   - נתיב מלא ל-`TEAM_51_DM004_DMP_UI_QA_REPORT_v1.0.0.md`
   - נתיב ל-`TEAM_61_DM_004_COMPLETION_REPORT_v1.0.0.md`
   - בקשה מפורשת: **בחינת מימוש + אישור סגירת DM-004** (עדכון registry / DMP לפי נוהל Team 100).
3. **אין** כתיבה ל-`documentation/` מצד Team 61 — קידום תיעוד דרך Team 10 כמתואר ב-`.cursorrules`.

---

## §9 — כשל (QA_FAIL)

- פתחו finding עם צעדי שחזור, צילום מסך / snapshot, גרסת דפדפן.
- נתבו ל-Team 61 לתיקון; אין מעבר ל-Team 100 לסגירה עד remediation.

---

## §10 — Resolution (2026-03-23)

| Field | Value |
|-------|--------|
| verdict | **QA_PASS** |
| report | `_COMMUNICATION/team_51/TEAM_51_DM004_DMP_UI_QA_REPORT_v1.0.0.md` |
| team_61_ack | `_COMMUNICATION/team_61/TEAM_61_DM_004_TEAM51_QA_ACK_AND_TEAM100_HANDOFF_v1.0.0.md` |

Non-blocking hygiene notes from Team 51 (404 noise, future hardening) are captured in §3 of the ACK document.

---

**log_entry | TEAM_61 | TO_TEAM_51 | DM004_DMP_UI_QA_REQUEST | 2026-03-23**

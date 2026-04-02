---
id: TEAM_61_TO_TEAM_51_DM005_ITEM0_DASHBOARD_QA_REQUEST_v1.0.0
historical_record: true
from: Team 61
to: Team 51 (QA Remote)
cc: Team 101, Team 100
date: 2026-03-24
status: QA_REQUEST_FULFILLED — QA_PASS
type: CANONICAL_QA_ACTIVATION
mandate_ref: TEAM_101_TO_TEAM_61_DM005_ITEM0_DASHBOARD_HARDENING_MANDATE_v1.0.0.md
delivery_ref: TEAM_61_DM005_ITEM0_DASHBOARD_HARDENING_DELIVERY_v1.0.0.md---

# בקשת QA — DM-005 ITEM-0 Dashboard Hardening

## §1 — מטרה

אימות עצמאי שה-Dashboard / Roadmap **ללא 404 מיותרים ב-Network**, **ללא console.error** רלוונטיים, ורגרסיה פונקציונלית — אחרי תיקוני Team 61 (FIX-1..4).

## §2 — תנאי קדם

| # | Requirement |
|---|-------------|
| 1 | `./agents_os/scripts/start_ui_server.sh` — פורט **8090** (או שרת HTTP שמגיש `agents_os/ui/` תחת `/static/` כב-smoke) |
| 2 | `pipeline-config.js?v=17`, `pipeline-dashboard.js?v=19`, `pipeline-roadmap.js?v=6` (נטען מה-HTML) |

## §3 — בדיקות נדרשות (5)

1. **Pytest regression (מנוע pipeline):**  
   `python3 -m pytest agents_os_v2/tests/ -q -k "not OpenAI and not Gemini"`  
   → **0 failures**, **206 passed** (6 deselected).

2. **Browser — Dashboard:**  
   טען `http://127.0.0.1:8090/static/PIPELINE_DASHBOARD.html` (או מקביל).  
   DevTools Console: **אפס** `console.error` אדומים הקשורים לטעינה.  
   Network → filter **4xx**: **אפס** בקשות שנכשלו **שקשורות ל-prompt / expected files / Team 10 canonical** במצב WP סגור (HEAD לקבצים אופציונליים לא אמור לרוץ מ-Roadmap לשלושת קבצי Team 10).

3. **Browser — Roadmap:**  
   טען `http://127.0.0.1:8090/static/PIPELINE_ROADMAP.html`.  
   Sidebar **Canonical Files**: שלושת פריטי Team 10 → **⚪** (לא 🔴), עם תווית `(TikTrack domain — see Team 10)`.  
   **אפס** HEAD failures לנתיבי Team 10 האלה.

4. **Dashboard functional — מצב COMPLETE / סגור:**  
   Banner מציג **Work Package Closed** (או מקביל).  
   `#files-badge` = **N/A** כשאין WP פעיל / gate COMPLETE.  
   פאנל Expected Files: הודעת **No active work package — file checks not applicable**.

5. **Roadmap functional (רגרסיה):**  
   DM Registry / program selector / gate history — עובדים ללא שבירה (smoke).

## §4 — דוח

| Deliverable | Path |
|-------------|------|
| דוח | `_COMMUNICATION/team_51/TEAM_51_DM005_ITEM0_DASHBOARD_QA_REPORT_v1.0.0.md` |
| תוצאה | `QA_PASS` או `QA_FAIL` |

### Pass

כל 5 הבדיקות עוברות → **QA_PASS** → Team 101 יכולה לסגור ITEM-0 ולפתוח ITEM-2.

### Fail

**QA_FAIL** + BN → Team 61 מתקן → re-QA.

---

**log_entry | TEAM_61 | TO_TEAM_51 | DM005_ITEM0_QA | 2026-03-24**

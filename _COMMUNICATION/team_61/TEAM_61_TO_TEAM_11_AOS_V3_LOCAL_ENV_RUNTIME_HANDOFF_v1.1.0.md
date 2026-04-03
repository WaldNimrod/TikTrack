---
id: TEAM_61_TO_TEAM_11_AOS_V3_LOCAL_ENV_RUNTIME_HANDOFF_v1.1.0
historical_record: true
from: Team 61 (AOS DevOps & Platform)
to: Team 11 (AOS Gateway / Execution Lead)
cc: Team 21 (AOS Backend), Team 31 (AOS Frontend), Team 51 (AOS QA), Team 100 (Chief Architect), Team 191 (Git Governance)
date: 2026-03-28
type: COMPLETION_HANDOFF — GATE_0 + local runtime stack (BUILD track)
domain: agents_os
branch: aos-v3
authority: TEAM_61_TO_TEAM_11_AOS_V3_GATE_0_COMPLETION_CANONICAL_v1.0.0.md (baseline) + runtime hardening 2026-03-28
status: LOCAL_ENV_READY — agents_os_v2 UI on :8090 stopped; AOS v3 API bound :8090; dual-DB verify PASS---

# השלמה ועדכון לצוות 11 — סביבה מקומית מלאה + זמן ריצה AOS v3

## מטרת המסמך

מסמך זה **מעדכן ומרחיב** את [TEAM_61_TO_TEAM_11_AOS_V3_GATE_0_COMPLETION_CANONICAL_v1.0.0.md](./TEAM_61_TO_TEAM_11_AOS_V3_GATE_0_COMPLETION_CANONICAL_v1.0.0.md) בנוגע ל־**מדיניות פורט 8090**, **סקריפטי הפעלה**, **פרוביז’ן DB אוטומטי**, ואימות חיבור שבוצע בריפו.

**תמצית לצוות 11:** במסלול BUILD (`aos-v3`), ברירת המחדל המומלצת לפיתוח מקומי היא **API של AOS v3 על פורט 8090**. שרת ה־UI של **agents_os_v2** (`agents_os/scripts/start_ui_server.sh`) משתמש באותו פורט — **אין להריץ את שניהם במקביל** על 8090. בבדיקה אופרטיבית (2026-03-28) נעצר תהליך v2 שנשאר מאזין על 8090, הופעל v3, ואומתו חיבור API ושני מסדי הנתונים.

## סטטוס GATE_0 (ללא שינוי מהותי)

| דרישה | מצב |
|--------|-----|
| מיגרציות + כלי הרצה + `init` מבודד מ־`api/.env` | סופק; ראה גם `agents_os_v3/db/ensure_local_postgres_for_aos.py` (פרוביז’ן Docker מקומי) |
| `FILE_INDEX.json` (IR-3) | גרסה **1.0.7** (נכון ל־2026-03-28) |
| `definition.yaml` + `seed.py` | סופק |
| אימות דואלי | `python3 scripts/verify_dual_domain_database_connectivity.py` — **PASS** (AOS: סכימה + `team_00`) |
| FastAPI shell | `agents_os_v3/modules/management/api.py` — `/api/health`, SSE שלד, `business_router` |
| `cli/pipeline_run.sh` (IR-1) | stub GATE_0 |
| `check_aos_v3_build_governance.sh` | יש להריץ לפני commit על `agents_os_v3/` |

## סקריפטים לצוותים (שורש הריפו)

| סקריפט | שימוש |
|--------|--------|
| `scripts/init_aos_v3_database.sh` | פרוביז’ן (כשמתאים) + מיגרציה `001` + `seed.py` — רק `agents_os_v3/.env` |
| `scripts/bootstrap_aos_v3_local.sh` | DB init + הפעלת API (דילוג DB: `AOS_V3_SKIP_DATABASE_INIT=1`) |
| `scripts/start-aos-v3-server.sh` | API ברקע (PID `/tmp/aos_v3_server.pid`); `--foreground` לדיבוג; `AOS_V3_SERVER_PORT` לחריגה מ־8090 |
| `scripts/stop-aos-v3-server.sh` / `scripts/restart-aos-v3-server.sh` | עצירה / ריסטארט |
| `scripts/verify_dual_domain_database_connectivity.py` | TikTrack + AOS — בידוד URL |
| `agents_os/scripts/stop_ui_server.sh` | עצירת **v2** על 8090 כשצריך לפנות פורט ל־v3 |

**Cursor / VS Code:** `.vscode/tasks.json` — משימות: Init AOS v3 DB, Start/Stop/Restart AOS v3 API, Bootstrap; משימות v2 מסומנות כ־**v2 frozen**.

**הנחיה לסוכני Cursor:** `.cursorrules` — סעיף שרתים מעודכן ל־AOS v3 + רשימת סקריפטים.

## אימות שבוצע (2026-03-28, סביבת מפעיל)

| בדיקה | תוצאה |
|--------|--------|
| עצירת מאזין ישן על 8090 (v2) | בוצע; פורט פנוי |
| `bash scripts/start-aos-v3-server.sh` | API על **8090** |
| `curl -s http://127.0.0.1:8090/api/health` | `{"status":"ok"}` |
| `verify_dual_domain_database_connectivity.py` | **PASS** |

> הערה: לוגי 404 לנתיבי legacy (למשל `/_COMMUNICATION/...`, `/api/log/events`) צפויים ב־**v3** עד רישום routes עסקיים ב־Team 21 — זה לא כשל חיבור ל־health/DB.

## הפניה לראיות וחותמת SOP-013 (GATE_0)

פרטי מיגרציה, רשימת קבצים, ו־**Seal** נשארים ב־[TEAM_61_AOS_V3_GATE_0_EVIDENCE_AND_SEAL_v1.0.0.md](./TEAM_61_AOS_V3_GATE_0_EVIDENCE_AND_SEAL_v1.0.0.md).

מדריך מפעיל מפורט: [TEAM_61_AOS_V3_LOCAL_DATABASE_SETUP_GUIDE_v1.0.0.md](./TEAM_61_AOS_V3_LOCAL_DATABASE_SETUP_GUIDE_v1.0.0.md).

## בקשת פעולה מצוות 11

1. **אשרו** שמפת הבנייה / onboarding לצוותים (21/31/51) מתייחסים ל־**8090 = v3 API** במסלול `aos-v3`, ולכיבוי v2 לפני הפעלת v3 (או שימוש ב־`AOS_V3_SERVER_PORT`).
2. **סמנו** GATE_0 PASS אם כל AC עדיין מתקיימים מול המנדט (הקנוני v1.0.0 נשאר בסיס).
3. **המשיכו** הפעלת Team 21 ל־GATE_1 לפי [TEAM_11_AOS_V3_BUILD_STAGE_MAP_WORKING_v1.0.0.md §1](../team_11/TEAM_11_AOS_V3_BUILD_STAGE_MAP_WORKING_v1.0.0.md).

## ארטיפקטים נוספים (מול v1.0.0)

| נתיב | תפקיד |
|------|--------|
| `agents_os_v3/db/ensure_local_postgres_for_aos.py` | פרוביז’ן role+DB מול Docker localhost |
| `scripts/start-aos-v3-server.sh` | הפעלת API v3 |
| `scripts/stop-aos-v3-server.sh` | עצירה |
| `scripts/restart-aos-v3-server.sh` | ריסטארט |
| `scripts/bootstrap_aos_v3_local.sh` | אתחול DB + API |
| `AGENTS.md` | סעיף AOS v3 + שרתים (Cursor Cloud) |
| `.cursorrules` | סעיף שרתים |

---

**log_entry | TEAM_61 | AOS_V3_BUILD | TO_TEAM_11_LOCAL_ENV_RUNTIME_HANDOFF | V2_STOPPED_V3_8090_VERIFY_PASS | 2026-03-28**

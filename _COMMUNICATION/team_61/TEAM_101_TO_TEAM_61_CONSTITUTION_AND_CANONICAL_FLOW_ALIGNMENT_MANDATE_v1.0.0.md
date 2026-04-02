---
id: TEAM_101_TO_TEAM_61_CONSTITUTION_AND_CANONICAL_FLOW_ALIGNMENT_MANDATE_v1.0.0
historical_record: true
from: Team 101
to: Team 61 (Agents_OS / pipeline tooling)
authority: Gateway routing — סגירת פערי “תהליך קנוני” במסך Constitution מול מנוע האורקסטרטור
date: 2026-03-23
status: ACTIVE
classification: EXECUTION_MANDATE---

# מנדט — יישור PIPELINE_CONSTITUTION.html + מפת פאזים מול SSOT הקוד

## 1. מטרה

לאחר בחינת `http://127.0.0.1:8090/static/PIPELINE_CONSTITUTION.html` מול **`agents_os_v2/orchestrator/pipeline.py`** (`GATE_SEQUENCE`) ומול **`agents_os_v2/ssot/gates.yaml`** + **`agents_os/ui/js/pipeline-monitor-core.js`** (`PHASE_DEFINITIONS`), יש **לסגור פערי תצוגה/תיעוד** כך שהמשתמש רואה **את אותו מודל שערים** שהמנוע מריץ, ולהכין בסיס לתיקון **SIM-CLOSE-01** (expected files ל-GATE_0/GATE_1) בתיאום עם Team 30.

## 2. מקורות אמת (חובה — אל תתבססו על טקסט חופשי בלבד)

| שכבה | מסמך / קובץ | תפקיד |
|------|----------------|--------|
| **A — מנוע** | `agents_os_v2/orchestrator/pipeline.py` — `GATE_SEQUENCE`, `_DOMAIN_PHASE_ROUTING` | אמת זמן ריצה לשערים ופאזים |
| **B — alias / נכסים גנרטיביים** | `agents_os_v2/ssot/gates.yaml` → `generate_gate_map_assets.py` → `pipeline-gate-map.generated.js` | מיפוי legacy→canonical ל-UI |
| **C — מוניטור/חוקה** | `agents_os/ui/js/pipeline-monitor-core.js` — `PHASE_DEFINITIONS` | טבלת פאזים בדף Constitution / Monitor |
| **D — דשבורד צפוי קבצים** | `agents_os/ui/js/pipeline-config.js` — `getExpectedFiles` | רשימת קבצים צפויים (SIM-CLOSE-01) |

**הערת פער ידועה:** ב־`gates.yaml` קיים `GATE_0: GATE_1` תחת `legacy_to_canonical`, בעוד `pipeline.py` מגדיר **`GATE_0` כשער ראשון ב־`GATE_SEQUENCE`**. זה **חייב** להיפתר במסגרת המנדט (או עדכון SSOT + רגנרציה, או הסבר קנוני חד-משמעי ב-UI + תיעוד — ללא סתירה בין מסכים).

## 3. ממצאים (פערים) — בסיס עבודה

| ID | פער | ראיה | השפעה |
|----|-----|------|--------|
| **CON-001** | תרשים הזרימה הסטטי ב־`PIPELINE_CONSTITUTION.html` מתחיל מ־**Idea Intake → GATE_1** ללא **GATE_0** | שורות ~88–101 בקובץ ה-HTML | המשתמש רואה תהליך “קנוני” בלי שער Scope שמופיע במנוע |
| **CON-002** | `PHASE_DEFINITIONS` ב־`pipeline-monitor-core.js` מתחיל מ־**GATE_1** — אין פאזים ל־**GATE_0** | תחילת המערך ~שורה 55+ | אקורדיון “All Gate Phases” לא משקף את מלוא הרצף הקנוני |
| **CON-003** | `gates.yaml` ממפה `GATE_0` → `GATE_1` | `legacy_to_canonical` | סיכון ל-alias שגוי מול מודל 5-gate+GATE_0 ב-pipeline.py |
| **CON-004** | פאזה **GATE_2 / 2.2** ב־`PHASE_DEFINITIONS`: `TRACK_FOCUSED` → **team_11**; ב־`pipeline.py` יש **`tiktrack+TRACK_FOCUSED` → team_10** | השוואת `pipeline-monitor-core.js` ל־`_DOMAIN_PHASE_ROUTING` | דף החוקה/מוניטור עלול להציג בעלות שגויה ל-TikTrack |

## 4. תוצרים נדרשים (Definition of Done)

1. **עדכון UI חוקה:** תרשים זרימה שכולל **GATE_0** במיקום הנכון יחסית ל־`GATE_SEQUENCE`, או הוספת צומת/הערת SSOT אם הוחלט מודל תצוגה אחר — **עם ערכי טקסט תואמים ל־`pipeline.py`**.
2. **הרחבה / תיקון `PHASE_DEFINITIONS` או מקור נתונים משותף** כך ש־**GATE_0** (ופאזים אם קיימים בקוד) יופיעו ב־“All Gate Phases” — או מסמך נלווה ב־UI שמסביר למה אין פאז משנה (אם אפס פאזים רשמי).
3. **רה-ארגון SSOT:** עדכון **`gates.yaml`** + הרצת **`python3 agents_os_v2/tools/generate_gate_map_assets.py`** (check-only או commit לפי נהלי Team 61) כך שלא תישאר סתירה בין alias לבין `GATE_SEQUENCE` — **באישור Team 100/170 אם נוגעים לחוזה governance**.
4. **תיקון בעלות TRACK_FOCUSED ל-GATE_2/2.2 עבור TikTrack** בנתוני המוניטור (או הפרדת תצוגה per-domain אם כבר קיים pattern).
5. **תיאום SIM-CLOSE-01:** פתיחת משימה / PR ל־**Team 30** על `getExpectedFiles` ל־GATE_0/GATE_1 (או הצעת patch מוכן לסקירה) — Team 61 **לא חייב** למזג קוד Team 30 ללא review.

## 5. הרצות מקדימות (בוצעו מצד Team 101)

- `python3 scripts/canary_simulation/generate_mocks.py --wp S003-P013-WP002`
- `python3 scripts/canary_simulation/verify_layer1.py --wp S003-P013-WP002 --phase-b` → **PASS** (כולל `ssot_check` tiktrack)

## 6. החזרה ל-Team 101 (חובה לאחר מימוש)

- קישור ל-PR / רשימת קבצים ששונו
- צילום מסך או MCP snapshot של `PIPELINE_CONSTITUTION.html` אחרי התיקון
- הערה אם נדרש עדכון ל־`TEAM_101_PIPELINE_SIMULATION_RESEARCH_GAP_ANALYSIS_v1.0.0.md` / JSON מחקר

## 7. בעלות צולבת

| נושא | בעלות ראשית |
|------|-------------|
| `gates.yaml` + gate map gen | Team 61 / Team 170 (אם שינוי חוזה) |
| `pipeline-monitor-core.js` / Constitution HTML | Team 61 + Team 30 (UI Agents_OS) לפי חלוקה ב-repo |
| `pipeline-config.js` getExpectedFiles | Team 30 — תיאום |

---

**log_entry | TEAM_101 | TO_TEAM_61_CONSTITUTION_ALIGNMENT_MANDATE | 2026-03-23**

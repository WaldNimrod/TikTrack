---
id: TEAM_170_AGENTS_OS_DOC_GOALS_GAP_ANALYSIS_v1.0.0
historical_record: true
from: Team 170
to: Team 00 (Chief Architect), Team 10 (Gateway — documentation promotion)
cc: Team 11, Team 61, Team 100
date: 2026-02-19
status: ANALYSIS
scope: Mapping documentation goals (anti-drift, onboarding, full schema) vs. current code + docs---

# Agents OS — ניתוח מטרות תיעוד מול מצב בפועל

## מקור אמת בקוד (SSOT pointers)

| נושא | מיקום בקוד |
|------|------------|
| רצף שערים קנוני | `agents_os_v2/orchestrator/pipeline.py` — `GATE_SEQUENCE` (כיום: `GATE_1`…`GATE_5`) |
| מטא־שערים + בניית GATE_CONFIG | `GATE_META`, `_build_gate_config()`, `GATE_CONFIG.update({... legacy ...})` |
| מסלולי כשל | `FAIL_ROUTING` (כולל שערים legacy + שערים חדשים) |
| Phases / TRACK_FOCUSED | `_resolve_phase_owner()`, `GATE_META` + טבלאות phase |
| מנועי צוותים | `_load_team_engine_config()` → `_COMMUNICATION/agents_os/team_engine_config.json` |
| ברירות מחדל למסלול תהליך | `agents_os_v2/config.py` — `DOMAIN_DEFAULT_VARIANT`, `PROCESS_VARIANT_*` |
| סגירת תיעוד לפי דומיין | `DOMAIN_DOC_TEAM` (GATE_5 קנוני / legacy GATE_8) |
| מודל מצב | `agents_os_v2/orchestrator/state.py` — `PipelineState` (כל השדות) |
| CLI | `pipeline_run.sh` |

---

## מטרה 1 — שמירה על החלטות ארכיטקטוניות ומניעת דריפט תכנוני

### מה עובד היום
- דוח הפערים (`TEAM_170_AGENTS_OS_DOC_CODE_GAP_REPORT_v1.0.0.md`) מזהה נכון את **פער N01–N05**: מודל 5 שערים בקוד לעומת תיאור ישן בתיעוד.
- `config.py` מגדיר במפורש **TRACK_FULL / TRACK_FOCUSED / TRACK_FAST** ו־**ברירות מחדל לפי דומיין** — זה חומר אדריכלי שחייב להופיע בתיעוד קנוני.

### פערים שמגבירים דריפט
| סיכון | תיאור | פעולה נדרשת |
|--------|--------|-------------|
| **שני מודלים במקביל ללא תווית** | `AGENTS_OS_ARCHITECTURE_OVERVIEW.md` ו־`AGENTS_OS_OVERVIEW.md` עדיין מתארים **GATE_0→GATE_8 + G3_PLAN…** בעוד `GATE_SEQUENCE` = **חמישה שערים**. סוכן/צוות שקורא תיעוד יבנה מנטלי מודל שונה מה־runtime. | מסמך אחד SSOT: **"Canonical Gate Model v2 (5 gates)"** + פסקה **Legacy compatibility** (מתי GATE_0/G3_PLAN/… עדיין ב־`GATE_CONFIG`). |
| **Overview שורה 1** | `AGENTS_OS_OVERVIEW.md`: "GATE_0 → GATE_8" — סותר את הקוד. | עדכון טקסט + דוגמת Quick Start (למשל `gate GATE_1` במקום GATE_0 לאחר אתחול WP). |
| **Correction Cycle §5** | Architecture עדיין מפנה ל־G3_PLAN / G3_6_MANDATES כיעדי full route — ב־FAIL_ROUTING לשערים החדשים יש מיפויים אחרים (למשל `GATE_3`, `GATE_2`). | יישור טבלאות routing לפי מפתחות **GATE_1–GATE_5** בקוד בפועל. |
| **אין קישור ל־LLD400 קנוני** | החלטות S003-P011 (Process Architecture v2.0) ממומשות בקוד וב־`_COMMUNICATION` אך לא מסוכמות ב־`documentation/docs-agents-os/` כשכבת SSOT. | קישור/תקציר ל־LLD400 / GATE_SEQUENCE_CANON (אם קיים ב־governance) מתוך Master Index. |

---

## מטרה 2 — עקומת למידה מהירה לצוות / איגנט חדש

### מה חסר לעומת צורך אופרטיבי
| צורך | מצב | מה להוסיף |
|------|-----|-----------|
| **מי בעלים על מה ב־AOS** | תיעוד מדבר ב־Team 10 כ־gateway ל־AOS; הקוד + `team_engine_config.json` מגדירים **Team 11** ל־AOS. | טבלת **דומיין × צוות × תפקיד** (שורה אחת: TT vs AOS) + קישור ל־`TEAM_ROSTER_v2.0.0` אם קיים ב־docs-governance. |
| **איך מתחילים WP חדש** | `AGENTS_OS_OVERVIEW` מציע `gate GATE_0` — לא תואם מודל 5 שערים. | 5–7 פקודות סדר: `init_pipeline.sh` → `gate GATE_1` (או הערת domain) → `pass` … |
| **מתי ללחוץ approve** | `PIPELINE_CLI_REFERENCE` עדיין מזכיר GATE_6/GATE_7; ב־`state.py` מופיע **gate_state = HUMAN_PENDING** (מחליף מודל WAITING ישן). | טבלה קצרה: **מצב gate_state × פעולה** (approve / pass / insist). |
| **איפה קובץ state** | חלקית מתועד — טוב. | להדגיש: שני קבצי דומיין + סנכרון ל־`pipeline_state.json` (legacy) כפי שב־`state.save()`. |

---

## מטרה 3 — סכמה מלאה ומדויקת (תהליכים, טבלאות, פונקציות מרכזיות)

### 3.1 PipelineState — שדות שלא ממופים בתיעוד Agents OS

התיעוד `PIPELINE_STATE_AND_BEHAVIOR` מכסה DOC-01–03. בפועל `PipelineState` כולל (בין היתר):

| שדה | מקור | נדרש בתיעוד |
|-----|------|----------------|
| `process_variant` | `TRACK_FULL` \| `TRACK_FOCUSED` \| `TRACK_FAST` | כן — טבלת ברירות מחדל + איפה נשמר |
| `current_phase` | מחרוזת (`"2.1"`, `"3.2"`, …) | כן — קשר ל־GATE_2 / GATE_3 |
| `finding_type`, `fcp_level`, `return_target_team`, `lod200_author_team` | FCP / Process Architecture v2.0 | כן — גלוסריון קצר או הפניה ל־LLD400 §4 |
| `gate_state` | `PASS_WITH_ACTION`, `OVERRIDE`, `HUMAN_PENDING` | כן — קישור ל־`pass_with_actions`, `override`, `approve` |
| `last_blocking_findings`, `last_blocking_gate`, `remediation_cycle_count` | remediation | אופציונלי — או הפניה ל־pipeline_run fail/route |
| `spec_path`, `phase8_content` | legacy / GATE_8 | סמן כ־legacy אם רלוונטי |

**פעולה:** מסמך **PipelineState schema v1** (טבלה אחת) או הרחבת `PIPELINE_STATE_AND_BEHAVIOR` בגרסה v1.1.

### 3.2 config.py — קבועים מרכזיים

| קבוע | תפקיד | בתיעוד |
|------|--------|--------|
| `DOMAIN_DEFAULT_VARIANT` | TT → TRACK_FULL, AOS → TRACK_FOCUSED | חסר |
| `DOMAIN_DOC_TEAM` | מי סוגר תיעוד ב־GATE_5 לפי דומיין | חסר |
| `DOMAIN_GATE_OWNERS` | GATE_2/GATE_6 overrides לפי דומיין | חלקי בלבד ב־Architecture |

### 3.3 פונקציות / נקודות כניסה מרכזיות (רשימת ביקורת)

| פונקציה / זרימה | קובץ | סטטוס תיעוד |
|------------------|------|----------------|
| `advance_gate` / `write_wsm_state` | `pipeline.py`, `wsm_writer.py` | חלקי (§6 Architecture) |
| `_write_state_view` | `pipeline.py` | חסר — STATE_VIEW.json |
| `_resolve_phase_owner` | `pipeline.py` | חסר — קריטי ל־TRACK_FOCUSED |
| `PipelineState.load` auto-detect | `state.py` | DOC-01; לעדכן ניסוח "past GATE_0" אם המודל הקנוני מתחיל ב־GATE_1 |

### 3.4 API (מעבר ל־Event Log)

| נתיב | תפקיד |
|------|--------|
| `/api/state/{domain}`, `/api/state/drift`, `/api/pipeline/...` | stubs — לתעד כ־**stub / future** או להסיר מהציפיות בדשבורד |

---

## סיכום — מה נדרש להשלים (עדיפות)

| עדיפות | פריט | מטרה |
|--------|------|------|
| **P0** | עדכון `AGENTS_OS_ARCHITECTURE_OVERVIEW` + `AGENTS_OS_OVERVIEW` למודל 5 שערים + Legacy | 1 + 2 |
| **P0** | טבלת Team 10 vs Team 11 (TT vs AOS) + `team_engine_config.json` | 1 + 2 |
| **P0** | מסמך/סעיף: `process_variant` + phases + `_resolve_phase_owner` | 1 + 3 |
| **P1** | `PipelineState` schema מלא (או v1.1 ל־PIPELINE_STATE_AND_BEHAVIOR) | 3 |
| **P1** | יישור `PIPELINE_CLI_REFERENCE` (approve, דוגמאות gate) + `config.py` קבועים | 2 + 3 |
| **P2** | EVENT_LOG_REFERENCE — סעיף stubs ל־state API | 3 |

---

## קישור לדוח פערים קיים

`TEAM_170_AGENTS_OS_DOC_CODE_GAP_REPORT_v1.0.0.md` — GAP-N01–N08 נשארים התשובה הממוספרת לפערי "תיעוד מול קוד"; מסמך זה מרחיב לשלוש המטרות האסטרטגיות ומוסיף דרישות סכמה (PipelineState, config).

---

**log_entry | TEAM_170 | AGENTS_OS_DOC_GOALS_GAP_ANALYSIS | AUTHORED | 2026-02-19**

---
id: ARCHITECT_DIRECTIVE_ORG_AND_PIPELINE_ARCHITECTURE_v1.0.0
from: Team 00 (Nimrod — System Designer)
authority: Team 00 constitutional authority
date: 2026-03-21
historical_record: true
status: LOCKED — Iron Rule
supersedes: ARCHITECT_DIRECTIVE_TEAM_ROSTER_v2.0.0 (supplements, does not replace)
scope: Organizational architecture + pipeline routing + role model + SSOT + work modes
---

# Architectural Directive — Organizational & Pipeline Architecture

## §0 — מקור

מסמך זה נעול בעקבות דיון אדריכלי מקיף שנערך ב-2026-03-21 במסגרת ניתוח טיסת מבחן S003-P003-WP001. כל ההחלטות נעולות ע"י Nimrod (Team 00).

---

## §1 — שלושת מצבי העבודה (Work Modes — Iron Rule)

### 1.1 הגדרות קנוניות

| מצב | תיאור | פעולות Nimrod מותרות |
|---|---|---|
| **ידני (Manual)** | Nimrod = אורקסטרטור אנושי. Pipeline שבור/לא זמין, או WP דורש תהליך שונה | (1) העברת/דיוק פרומטים לצוותים. (2) פעולות בממשק דשבורד (שמפעילות קוד). (3) הרצת פקודות טרמינל מוכנות ע"י המערכת |
| **דשבורד (Dashboard)** | Pipeline מנהל את הזרימה. כל פרומטים, מעברים ותהליכים — דרך ממשק idiot-proof | כל פעולות הממשק. Nimrod אינו עורך קבצים ידנית |
| **אוטומטי (Automatic)** | מעבר מלא ל-CLI. אדם רק בשערים מוגדרים. Dashboard → Monitor בלבד | intervention בשערי human-approval בלבד |

### 1.2 Iron Rules

1. Nimrod **אינו עורך קבצי state ישירות לעולם** — בשום מצב עבודה
2. מצב ידני = bypass מתועד — לא מצב קבע. כל bypass מתועד ב-Monitor Log
3. כל write ל-state מגיע דרך `pipeline_run.sh` (או equivalent API/CLI) — בכל שלושת המצבים
4. מצב ידני הוא ה-safety net המאפשר גמישות ומעקפים — ייהפך ל-legacy/edge-case לאחר ייצוב הפייפליין

---

## §2 — SSOT — Single Source of Truth (Iron Rule)

### 2.1 מבנה שלוש שכבות

```
pipeline_state_{domain}.json     ← SINGLE MASTER (SSOT)
WSM CURRENT_OPERATIONAL_STATE    ← auto-projection (pipeline בלבד — אסור עריכה ידנית)
STATE_SNAPSHOT.json              ← auto-rebuilt בכל advance
```

### 2.2 כללי כתיבה

| כותב | מה הוא כותב | מה אסור לו |
|---|---|---|
| `pipeline_run.sh` pass/fail/approve | pipeline_state + WSM block + STATE_SNAPSHOT | — |
| Dashboard button | → קוראת לאותה advance logic → כותבת כנ"ל | bypass logic |
| Auto trigger (עתידי) | → אותה advance logic | — |
| כל צוות (10..190) | `_COMMUNICATION/teamXX/` בלבד | WSM CURRENT_OPERATIONAL_STATE, pipeline_state |
| Team 170 | registry sync, canonical docs | WSM CURRENT_OPERATIONAL_STATE |

### 2.3 CI --check policy

| קובץ | מדיניות |
|---|---|
| `pipeline_state_*.json` ↔ WSM block | CI FAIL (exit 1) על drift |
| STATE_SNAPSHOT.json | CI WARN — auto-regen |
| `_COMMUNICATION/teamXX/*.md` | ללא CI check (תקשורת צוות) |

### 2.4 Background sync (Team 110 scope)

מודול background tasks של Team 110 יכלול `wsm_sync` כ-use case ראשוני:
- interval: מוגדר ע"י המשתמש (default: 5 דקות)
- action: ssot_check --auto-sync
- effect: drift → auto-patch WSM from pipeline_state

### 2.5 מנדט יישום

`_COMMUNICATION/team_00/TEAM_00_TO_TEAM_61_SSOT_MANDATE_v1.0.0.md` — BLOCKING לכל חבילה הבאה.

---

## §3 — מבנה ארגוני חדש — Team Roster v3.0

### 3.1 עקרונות

1. **סימטריה מלאה בין דומיינים:** לכל צוות TikTrack יש mirror ב-AOS
2. **מספר צוות = רשומה מאחדת:** תפקיד + קבוצה + דומיין + שם-מזהה
3. **TRACK_FULL vs TRACK_FOCUSED:** ההבדל היחיד = איחוד implementation לצוות בודד
4. **Team 61 מוגדר מחדש:** לא "עושה הכל ב-AOS" — אלא AOS TRACK_FOCUSED unified implementor

### 3.2 קבוצות (Groups)

| קבוצה | תפקידים | Team IDs |
|---|---|---|
| **A — Architecture** | spec_author, arch_reviewer (chief + per-domain) | 100, 110, 111 |
| **B — Execution** | domain_gateway, backend_impl, frontend_impl, design_advisory (opt), devops (opt) | 10/11, 20/21, 30/31, 40/41, 60, 61 |
| **C — Validation** | qa_authority, validation_authority, adversarial_validator | 50/51, 90, 190 |
| **D — Documentation/Control** | doc_closure, registry_governance, git_backup | 70/170, 191 |

### 3.3 Roster מלא v3.0

#### קבוצה A — Architecture

| Team | Title | Engine | Domain | Role | Group |
|---|---|---|---|---|---|
| **00** | System Designer (Nimrod) | Human | BOTH | The single human. Requirements, decisions, instructions. Not an AI agent | — |
| **100** | Chief System Architect | Claude Code | BOTH | System-level arch decisions. GATE_2/4 architectural review. Primary spec approver. | A |
| **110** | AOS Domain Architect (IDE) | OpenAI/Codex | AOS | AOS domain architectural authority. LOD200 production for AOS WPs. Substitutes Team 100 in TRACK_FOCUSED/TRACK_FAST. Roster **team_110** (formerly 101). | A |
| **111** | TikTrack Domain Architect (IDE) | OpenAI/Codex | TIKTRACK | TikTrack domain architectural authority. *(registered, not yet active)* Roster **team_111** (formerly 102). | A |

#### קבוצה B — Execution (TikTrack)

| Team | Title | Engine | Domain | Role | Group |
|---|---|---|---|---|---|
| **10** | TikTrack Gateway | Cursor Composer | TIKTRACK | GATE_3/3.1 mandate generation + GATE_3 coordination. TikTrack ONLY. | B |
| **20** | Backend Implementation | Cursor Composer | TIKTRACK | API, business logic, DB, services. Server-side. TRACK_FULL | B |
| **30** | Frontend Execution | Cursor Composer | TIKTRACK | UI components, pages, API integration. Client-side. TRACK_FULL | B |
| **40** | UI Assets & Design | Cursor Composer | TIKTRACK | Design tokens, CSS, visual consistency. Advisory unless new assets required. **Never QA.** | B |
| **60** | DevOps & Platform | Cursor Composer | TIKTRACK | CI/CD, infra, env, platform readiness. **Conditional: only when `requires_devops: true`** | B |

#### קבוצה B — Execution (AOS)

| Team | Title | Engine | Domain | Role | Group |
|---|---|---|---|---|---|
| **11** | AOS Gateway | Cursor Composer | AOS | GATE_3/3.1 mandate generation + GATE_3 coordination. AOS ONLY. Mirror of Team 10. | B |
| **21** | AOS Backend Implementation | Cursor Composer | AOS | API, business logic, agents_os_v2 backend logic. TRACK_FULL (AOS). Mirror of Team 20. **NEW** | B |
| **31** | AOS Frontend / UI Execution | Cursor Composer | AOS | agents_os/ui pages, dashboard components, JS logic. TRACK_FULL (AOS). Mirror of Team 30. **NEW** | B |
| **41** | AOS UI Assets & Design | Cursor Composer | AOS | AOS design tokens, CSS architecture, visual consistency. Advisory. Mirror of Team 40. **NEW** | B |
| **61** | AOS Unified Implementor | Cursor Composer | AOS | **TRACK_FOCUSED unified implementor.** Combines 21+31+41 in a single context. Used ONLY in TRACK_FOCUSED/TRACK_FAST for AOS. NOT used in TRACK_FULL. | B |

#### קבוצה C — Validation

| Team | Title | Engine | Domain | Role | Group |
|---|---|---|---|---|---|
| **50** | QA & FAV | Cursor Composer | TIKTRACK | All QA: E2E, regression, FAV, SOP-013. GATE_3/3.3 + GATE_4. Correction cycle orchestrator. | C |
| **51** | AOS QA & FAV | Cursor Composer | AOS | Same as Team 50, AOS domain. Mirror of Team 50. | C |
| **90** | Validation Authority | OpenAI/Codex | BOTH | GATE_4/4.1 dev validation + GATE_5/5.2 closure validation. FCP authority. | C |
| **190** | Constitutional Validator ("Spy") | OpenAI/Codex | BOTH | **Adversarial architectural validation.** Always cross-domain, always independent. Must NOT see Teams 100/110/111 conclusions before own output. Fixed — not in department definition (always active). | C |

#### קבוצה D — Documentation/Control

| Team | Title | Engine | Domain | Role | Group |
|---|---|---|---|---|---|
| **70** | TikTrack Documentation | Cursor Composer | TIKTRACK | GATE_5/5.1 AS_MADE documentation closure. TikTrack domain. | D |
| **170** | AOS Spec & Governance | Cursor Composer | AOS | LOD200/LLD400 production (AOS), registry sync, canonical doc maintenance, GATE_5/5.1 for AOS. | D |
| **191** | GitHub & Backup | OpenAI/Codex | BOTH | Git operations, PR creation, backup. Never produces code/arch opinions. | D |

---

## §4 — מודל תפקידים דינמי (Department Definition)

### 4.1 מבנה Department Definition

בכל WP activation (GATE_0), ה-pipeline_state מכיל:

```json
{
  "program_department": {
    "domain": "tiktrack | agents_os",
    "variant": "TRACK_FULL | TRACK_FOCUSED | TRACK_FAST",
    "roles": {
      "domain_gateway":       "team_10",
      "backend_impl":         "team_20",
      "frontend_impl":        "team_30",
      "qa_authority":         "team_50",
      "validation_authority": "team_90",
      "doc_closure":          "team_70",
      "spec_author":          "team_110",
      "arch_reviewer":        "team_100"
    },
    "optional_active": {
      "design_advisory": false,
      "devops": false
    }
  }
}
```

### 4.2 Default Departments — טבלת התאמה

| Role | TT+TRACK_FULL | TT+TRACK_FOCUSED | AOS+TRACK_FOCUSED | AOS+TRACK_FULL | AOS+TRACK_FAST |
|---|---|---|---|---|---|
| domain_gateway | team_10 | team_10 | team_11 | team_11 | team_11 |
| backend_impl | team_20 | team_20 | team_61 | team_21 | team_61 |
| frontend_impl | team_30 | team_30* | team_61 | team_31 | team_61 |
| design_advisory | team_40 (opt) | — | — | team_41 (opt) | — |
| devops | team_60 (opt) | — | — | — | — |
| qa_authority | team_50 | team_50 | team_51 | team_51 | team_51 |
| validation_authority | team_90 | team_90 | team_90 | team_90 | team_90 |
| doc_closure | team_70 | team_70 | team_170 | team_170 | team_170 |
| spec_author | team_110 | team_110 | team_110 | team_110 | team_110 |
| arch_reviewer | team_100 | team_100 | team_100/110 | team_100/110 | team_110 |
| adversarial_validator | **team_190** | **team_190** | **team_190** | **team_190** | **team_190** |

*`team_30` = default impl ב-TikTrack TRACK_FOCUSED; LOD200 יכול לציין team_20 אם WP backend-heavy.

**note:** `adversarial_validator` (Team 190) = FIXED — לא בdepartment roles (cross-domain, always active).

### 4.3 TRACK_FOCUSED — כלל ה-Implementation Consolidation

**הגדרה:** TRACK_FOCUSED vs TRACK_FULL — ההבדל היחיד הוא **איחוד ה-implementation לצוות בודד.**

| Variant | Implementation |
|---|---|
| **TRACK_FULL** | כל הצוותים המתמחים: backend_impl + frontend_impl + design_advisory (opt) |
| **TRACK_FOCUSED** | צוות אחד שמכסה את כל ה-implementation (team_61 ל-AOS; team_30/20 ל-TikTrack per LOD200) |
| **TRACK_FAST** | כנ"ל TRACK_FOCUSED אבל עם قوانין מקוצרות נוספים (עתידי) |

### 4.4 Pipeline Stage → Role Parameters Matrix

כל שלב ב-pipeline מוגדר ע"י הפרמטרים הנדרשים לו:

| Gate/Phase | Role נדרש | אסימון b-department |
|---|---|---|
| GATE_1 / 1.1 | spec_author | מי כותב LOD200 |
| GATE_1 / 1.2 | adversarial_validator | team_190 (fixed) |
| GATE_2 / 2.2 | domain_gateway | מי בונה work plan |
| GATE_2 / 2.3 | arch_reviewer | מי מאשר spec |
| GATE_3 / 3.1 | domain_gateway | מי מנפיק מנדטים |
| GATE_3 / 3.2 | backend_impl, frontend_impl, [design_advisory], [devops] | impl teams |
| GATE_3 / 3.3 | qa_authority | QA in-gate |
| GATE_4 / 4.1 | validation_authority | team_90 |
| GATE_4 / 4.2 | arch_reviewer | team_100/110 |
| GATE_4 / 4.3 | arch_reviewer (senior) | team_100 |
| GATE_5 / 5.1 | doc_closure | מי סוגר תיעוד |
| GATE_5 / 5.2 | validation_authority | team_90 |

**חוק:** אם WP ב-LOD200 לא מגדיר role נדרש בשלב ספציפי → BLOCKING FINDING. Pipeline מתריע ולא מאפשר GATE_0 PASS.

---

## §5 — הגדרת ה-"Spy" Role (Team 190)

### 5.1 הגדרה

| שדה | ערך |
|---|---|
| **סוג תפקיד** | Adversarial Validator |
| **עיקרון** | Independent counter-force — מוצא מה שהאדריכלים מפספסים |
| **חובת עצמאות** | Team 190 **לעולם לא רואה** מסקנות Teams 100/110/111 לפני שמייצר validations משלו |
| **scope** | Cross-domain (BOTH) — אין דומיין ספציפי |
| **placement** | Fixed — אינו ב-`department.roles` הרגיל; מופיע כ-`adversarial_validator` בכל department definition |

### 5.2 מתי מופעל

| Gate/Phase | תפקיד Team 190 |
|---|---|
| GATE_1 / 1.2 | LLD400 adversarial validation |
| GATE_2 / 2.1v | LOD200/spec adversarial validation |
| GATE_2 / 2.2 | context review (לא validation) |
| כל GATE_4 שדורש cross-check | architectural challenge |

### 5.3 החלטה

**Team 190 נשאר כ-role קבוע ומיוחד — לא נפצל לדומיינים.** עצמאות ה-"spy" תלויה דווקא בcross-domain placement. אין צורך בצוות ייעודי נוסף.

---

## §6 — QA כאורקסטרטור מחזורי תיקון

### 6.1 Roadmap נעול

| שלב | מצב | מודל |
|---|---|---|
| **S003-P012 WPs (עכשיו)** | Pipeline שבור | **אפשרות A:** QA מנהל הכל. Team 50/51 מנפיק sequential correction mandates |
| **לאחר WP002 (prompts fixed)** | Pipeline משוקם | **אפשרות C (Hybrid):** QA מגדיר agenda → Team 10/11 מנתב → impl team מבצע → QA מאמת |
| **לאחר WP004/5 (testkit)** | Pipeline יציב | **אפשרות D:** Pipeline-driven correction cycle (automated) |

### 6.2 Sequential Correction Protocol (אפשרות A — immediate)

```
Team 50 GATE_4_FAIL
  → כותב CORRECTION_AGENDA (ordered list per finding_type)
  → Fix #1: sends mandate to impl team directly
  → impl team returns FIX_CONFIRMATION
  → Team 50 validates fix
  → Fix #2 ... (next item)
  → כל הfixes done → Team 50 runs full re-QA → GATE_4_PASS/FAIL
```

---

## §7 — TRACK_FOCUSED TikTrack (Implementation)

### 7.1 מה בוצע ב-pipeline.py (2026-03-21)

```python
# GATE_3/3.2
"tiktrack+TRACK_FOCUSED": "teams_20_30"   # → [team_20, team_30]

# GATE_3/3.3
"tiktrack+TRACK_FOCUSED": "team_50"       # TikTrack QA always team_50
"tiktrack+TRACK_FULL":    "team_50"
"agents_os+TRACK_FULL":   "team_51"

# GATE_ALIASES — 8→5 canonical (11 aliases)
"G3_6_MANDATES" → "GATE_3", "GATE_7" → "GATE_4", "GATE_8" → "GATE_5", ...
```

### 7.2 TikTrack TRACK_FOCUSED — Primary implementor

**כלל:** LOD200 מציין `primary_impl_team` לצורך TRACK_FOCUSED:
- Default = `team_30` (frontend-heavy majority of cases)
- LOD200 override = `team_20` אם WP backend-heavy
- pipeline_state.program_department["frontend_impl"] = primary_impl_team (TRACK_FOCUSED)

---

## §8 — Constitution + Dashboard Pages כנקודות אמת

### 8.1 Iron Rule — UI as Truth Endpoint

**כלל חדש נעול:** כל מצב מערכת שאמור להיות תקין חייב להיות גלוי ומדויק בממשק. כשל שאינו גלוי בממשק לא נחשב "מתוקן."

| עמוד | נקודת אמת עבור |
|---|---|
| **Constitution** | System state: gate, phase, WP, domain, department roster, drift warnings |
| **Teams** | הגדרות צוותים, תפקידים, חוזים, engine assignments |
| **Map (Roadmap)** | מצב חבילות, רעיונות, program status |
| **Monitor** | מצב נוכחי חבילות פתוחות/פעילות, event log, health |

### 8.2 Constitution page — required fields

Constitution page חייב להציג:
- Current pipeline state (gate, phase, WP, domain)
- WSM alignment status (consistent/drift)
- Department roster לWP הפעיל
- Gate routing table לvariant הפעיל
- Health: GREEN/YELLOW/RED

---

## §9 — Team 60 — Conditional DevOps

**כלל נעול:** Team 60 אינו חלק אוטומטי מ-TRACK_FULL. הפעלתו מותנית ב-LOD200 flag:

```json
"requires_devops": true  // triggers Team 60 inclusion
```

**מתי `requires_devops: true`:**
- WPs עם background services חדשים
- שינויי DB/infra/env vars
- CI pipeline changes
- Secrets management

**מתי `false`:** WPs frontend/backend-only ללא infra changes (רוב WPs ב-S003).

---

## §10 — S003-P012 Meta-Process (נעול)

**מסגרת ביצוע לחמש חבילות S003-P012:**

```
לכל WP:
  Team 00 → mandate ישיר לTeam 61 (AOS infra) או Team relevant
  Team 61/relevant → delivers
  Team 51 (או Team 190 לSSoT) → QA session
  Team 00 → approves
  Team 170 → documents closure

אין pipeline_run.sh לתהליך עצמו.
בסיום כל WP → dry-run validation test מוכיח שהתיקון עבד.
```

**pre-condition לכל חבילה S003 (TikTrack/AOS):** AC-01..AC-10 ב-SSOT mandate PASS.

---

## §11 — Iron Rules Summary (מסמך זה)

1. **SSOT:** pipeline_state = SSOT. WSM CURRENT_OPERATIONAL_STATE = auto-projection. אסור edit ידני.
2. **Team 190 (Spy):** Cross-domain, fixed, always independent. לעולם לא רואה arch outputs לפני validation.
3. **Team 61:** AOS TRACK_FOCUSED unified implementor ONLY. לא active בAOS TRACK_FULL (Teams 21/31/41 active).
4. **Teams 21/31/41:** AOS mirrors של 20/30/40. Active בAOS TRACK_FULL בלבד.
5. **Team 60:** Conditional — `requires_devops: true` בLOD200 בלבד.
6. **TRACK_FULL vs TRACK_FOCUSED:** ההבדל היחיד = implementation consolidation.
7. **UI Truth:** כל מצב תקין חייב להיות גלוי בממשק. Constitution = system truth endpoint.
8. **Pipeline routing:** compound key "domain+variant" בעדיפות על variant ועל domain.
9. **QA orchestrates corrections:** Team 50/51 מנהל sequential correction cycle.
10. **Mode ידני:** bypass מתועד בלבד. Nimrod לא עורך state files ישירות לעולם.

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE | ORG_AND_PIPELINE_ARCHITECTURE_v1.0.0 | LOCKED | SSOT+ROSTER_v3+ROLE_MODEL+TRACKS+QA_PROTOCOL+CONSTITUTION | 2026-03-21**

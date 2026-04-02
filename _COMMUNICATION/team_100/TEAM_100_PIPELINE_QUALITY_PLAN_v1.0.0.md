date: 2026-04-01
historical_record: true

# תכנית איכות פייפליין — Point 2 + Point 3
## TEAM_100 | 2026-04-01 | v1.0.0

---

## מבוא

מסמך זה מסכם את ממצאי הסריקה המקיפה של מנגנון ה-detection וההזרקות, ומגדיר תכנית מסודרת ל-2 נושאים:

- **Point 2** — תיקון מלא של כל כשלי זיהוי סיום הצוותות (detection layers 1–4)
- **Point 3** — תכנון קונספטואלי להזרקות קונטקסט אופטימליות (concept doc לאישור לפני מימוש)

---

# PART 1 — POINT 2: PIPELINE DETECTION — ממצאים ותכנית

---

## 1.1 כשלים שתוקנו כבר (בסשן הנוכחי)

| # | כשל | קובץ | תיקון |
|---|-----|------|--------|
| F-01 | Mode B גלוב כפול `_GATE_GATE_1_` | `ingestion.py` | `_gate_short()` מסיר prefix; 7-priority pattern list |
| F-02 | Mode B ללא `TEAM_` prefix | `ingestion.py` | פטרנים עם `TEAM_{id}_` בעדיפות ראשונה |
| F-03 | `gate_role_authorities` ריק — כל `fail_run()` = advisory | `seed.py`, `definition.yaml` | 2 שורות + seeding loop |
| F-04 | seed.py דחה bootstrap WP IDs (22 תווים) | `seed.py` | regex `{20,26}` |

---

## 1.2 כשלים פתוחים — ממצאי הסריקה

### דפוסים חוזרים (root causes)

הסריקה חשפה **4 דפוסים חוזרים** שמסבירים את רוב הכשלים:

| דפוס | תיאור | דוגמאות |
|------|--------|---------|
| **P-A** "Config exists, never seeded" | מבנה קיים, נתונים חסרים | `gate_role_authorities`, governance files |
| **P-B** "Backend complete, UI stub" | backend מלא, UI = mock curl בלבד | Layers 2-4 forms, Layer 1 auto-advance |
| **P-C** "No team instruction chain" | המערכת יודעת מה לעשות, הצוות לא קיבל הוראות | Layer 1/2 trigger protocol חסר בתבניות |
| **P-D** "Implicit format assumptions" | המערכת מצפה לפורמט ספציפי אך לא תיעדה אותו | file naming convention לא מוגדרת בתבניות |

---

### F-05 — UI Forms לא ממומשים (Layers 2–4)
**דפוס:** P-B | **עדיפות:** HIGH

**מה חסר:**
- `index.html` — אין form elements לשום שכבת detection
- `app.js` — קיימים רק mock curl examples (שורות ~132-139, ~1514)
- שכבה 2 (OPERATOR_NOTIFY): אין כפתור "Agent Completed" אמיתי עם UI flow
- שכבה 3 (NATIVE_FILE): אין text input לנתיב קובץ
- שכבה 4 (RAW_PASTE): אין textarea להדבקת טקסט

**מה נדרש לממש:**
```
index.html: הוסף feedback section עם:
  - <div id="aosv3-feedback-panel"> [מוסתר כשאין run פעיל]
  - Radio: "🔍 Scan for file (Layer 2)" | "📁 Provide file path (Layer 3)" | "📋 Paste text (Layer 4)"
  - Layer 3: <input type="text" id="aosv3-feedback-file-path" placeholder="_COMMUNICATION/team_170/...">
  - Layer 4: <textarea id="aosv3-feedback-raw-text">
  - CTA: <button id="aosv3-btn-ingest-feedback">Submit Feedback</button>

app.js: wireLiveAction לכפתור ה-Submit:
  - קריאה ל-POST /api/runs/{run_id}/feedback עם body בהתאם לשכבה שנבחרה
  - loadPipelineStateFromApi(true) אחרי הצלחה
  - הצגת proposed_action + verdict בתשובה
```

---

### F-06 — Layer 2 File Watcher לא קיים
**דפוס:** P-B + P-C | **עדיפות:** MEDIUM

**המצב:** אין מנגנון אוטומטי שמזהה כשצוות כתב קובץ ל-`_COMMUNICATION/`. Layer 2 דורש פעולה ידנית של המשתמש.

**שתי אפשרויות מימוש:**

אפשרות א' — **APScheduler polling** (מומלצת — כבר קיים APScheduler):
```python
# בתוך lifespan / scheduler_registry.py
# כל 30 שניות: סרוק _COMMUNICATION/*/TEAM_*_VERDICT*.md
# אם נמצא קובץ חדש (mtime > run.started_at) → POST /api/runs/{run_id}/feedback
```

אפשרות ב' — **watchdog FileSystemEventHandler** (real-time אך תלויות חיצוניות):
```python
# pip install watchdog
# FileSystemEventHandler על _COMMUNICATION/
# on_created/on_modified → match לפי filename pattern → trigger
```

**המלצה:** APScheduler (P-A' — אפשרות א'), interval=30s, env var `AOS_V3_LAYER2_POLLING_ENABLED=1`.

---

### F-07 — Layer 1 Auto-Advance לא בfow Production
**דפוס:** P-B | **עדיפות:** HIGH

**המצב:** `CANONICAL_AUTO` קיים ב-`ingestion.py` ומוזכר בטסטים (`test_gate3_fip.py:79`). אבל ב-production flow:
- `POST /api/runs/{run_id}/feedback` → מחזיר `proposed_action: "ADVANCE"` אך **לא מבצע** advance אוטומטי
- המשתמש רואה את ה-proposed_action ב-UI אך צריך ללחוץ ידנית

**מה נדרש:**
```python
# use_cases.py — uc_15_ingest_feedback()
# אחרי notify_feedback_ingested():
if row["proposed_action"] == "ADVANCE" and row["confidence"] == "HIGH":
    # auto-advance (אם `auto_advance_enabled` ב-policy)
    uc_02_advance_gate(conn, actor_team_id=actor_team_id, run_id=run_id, ...)
```

**הערה:** דורש policy `auto_advance_on_canonical_high_confidence` + UI indicator שמראה "auto-advanced by Layer 1".

---

### F-08 — Layer 1 UI Alert חסר
**דפוס:** P-B | **עדיפות:** MEDIUM

**המצב:** SSE מלא קיים (`sse.py`). ה-EventSource ב-`app.js` מאזין ל-`feedback_ingested`. אבל:
- `feedback_ingested` handler קורא רק ל-`refresh()` (מרענן state)
- אין **alert בולט** שמודיע "Agent {team} הושלם — ממתין לאישורך"
- SSE indicator קיים (`.aosv3-sse--connected`) אך לא מציג notification בנפרד

**מה נדרש:**
```javascript
// app.js — EventSource handler
es.addEventListener("feedback_ingested", function(ev) {
    var d = JSON.parse(ev.data || "{}");
    var msg = "📬 Feedback התקבל מ-" + (d.actor_team_id || "agent")
              + " — verdict: " + d.verdict + " [" + d.confidence + "]"
              + " | Action: " + d.proposed_action;
    showAosv3Toast(msg, { level: d.verdict === "PASS" ? "success" : "warning", duration: 12000 });
    loadPipelineStateFromApi(true);
});
```

---

### F-09 — הצוותות לא מקבלים הוראות Layer 1/2 בתבניות
**דפוס:** P-C + P-D | **עדיפות:** CRITICAL

**המצב:** אף תבנית ב-`definition.yaml` לא מסבירה לצוות:
- איך לשלוח Layer 1 trigger (API call)
- איך לכתוב קובץ Layer 2 (שם קובץ, פורמט, מיקום)
- מה ה-expected output format (JSON block, Verdict:, BF-01:)

**זה הכשל הכי חמור מבחינת שימושיות** — הסיבה ש-team_190 "עקף" בלחיצת כפתור.

**מה נדרש:** ראה Part 2 (Point 3) — זה קשור ישירות לתבניות ולhazraqot.

---

## 1.3 רשימת פריטים לביצוע — Point 2

```
[ ] F-05 UI Forms — feedback panel + 3 שכבות + CTA button
[ ] F-06 Layer 2 Polling — APScheduler job (AOS_V3_LAYER2_POLLING_ENABLED)
[ ] F-07 Layer 1 Auto-Advance — policy + uc_15 extension
[ ] F-08 Layer 1 UI Alert — feedback_ingested SSE handler upgrade
[ ] F-09 Team Instructions — ראה Part 2 (Point 3)
```

**סדר ביצוע מומלץ:** F-05 → F-08 → F-07 → F-06 → F-09 (בתוך Point 3)

---

# PART 2 — POINT 3: CONTEXT INJECTION — מסמך קונספט

---

## 2.1 מה אנחנו מנסים לפתור

### הבעיה הבסיסית

כל ה-LLM agent שמקבל prompt מה-pipeline מקבל **4 שכבות** מידע:

```
L1: תבנית (מה לעשות — mission briefing)
L2: governance (מי אתה — identity + authority)
L3: policies JSON (חוקים גלובליים)
L4: run state JSON (מצב הריצה הנוכחי)
```

הבעיה: **L1 ו-L2 הם השכבות ה"אנושיות"** — הן מה שה-agent קורא ומבין. L3/L4 הם data. אם L1/L2 לקוניים, כלליים, או חסרי הקשר — ה-agent יעשה עבודה גנרית ולא מדויקת.

### מה מפריד agent מצוין מ-agent בינוני

| agent בינוני | agent מצוין |
|-------------|-------------|
| יודע מה המשימה | יודע **למה** המשימה קיימת ומה ה-stakes |
| פועל לפי הוראות כלליות | יודע **Iron Rules ספציפיות** שאסור לו להפר |
| מחזיר פלט בפורמט שהמציא | מחזיר **פלט בפורמט canonical** שהמערכת יכולה לצרוך אוטומטית |
| לא יודע עם מי לדבר | יודע **בדיוק לאן לשלוח** output ואיזה קובץ לכתוב |
| מנחש scope | מקבל **context injection מדויק** — מה כלול, מה לא |

---

## 2.2 ארכיטקטורת שכבות ה-Injection — הגדרה מחודשת

### L1 — תבנית (Mission Briefing)

**מה זה עכשיו:** טקסט קצר שאומר "אתה צוות X, עשה Y"

**מה זה צריך להיות:**
```
[SECTION 1: MISSION]
- מה המשימה הספציפית לשלב זה
- מה ה-input שקיבלת (ומאיפה)
- מה ה-output המצופה (פורמט מדויק + שם קובץ + מיקום)

[SECTION 2: CONSTRAINTS]
- Iron Rules הרלוונטיות לשלב (לא "ראה AGENTS.md" — הדבק אותם)
- מה אסור לעשות
- מה דורש עצירה והעברה

[SECTION 3: TRIGGER PROTOCOL]
- איך לסמן סיום (Layer 1 API call / Layer 2 file format)
- שם הקובץ המדויק שיש לכתוב
- פורמט ה-JSON block בתוך הקובץ
```

### L2 — Governance (Identity + Authority)

**מה זה עכשיו:** זהות, authority scope, Iron Rules כלליות

**מה זה צריך להיות:** כנ"ל + **הרחבות ספציפיות לשלב**:
```
[SECTION: GATE-SPECIFIC AUTHORITY]
- מה מותר לך להחליט בשלב הזה
- מה חייב לעלות לצוות 00

[SECTION: INPUT VALIDATION]
- על מה לבדוק לפני שמתחילים
- מה נחשב "incomplete brief" שמצדיק עצירה

[SECTION: OUTPUT CONTRACT]
- פורמט output מוגדר עם שדות חובה
- דוגמה מלאה (canonical example)
```

### L3 — Policies JSON

**מה זה עכשיו:** כל ה-policies מה-DB כ-JSON flat array

**מה זה צריך להיות:** פורמט **מסונן ומורחב**:
```json
{
  "active_policies": [...],     // policies רלוונטיות לשלב הנוכחי
  "iron_rules_summary": [...],  // תמצית של Iron Rules (לא כל ה-DB)
  "gate_constraints": [...]     // constraints ספציפיים לשלב
}
```

### L4 — Run State JSON

**מה זה עכשיו:** run row גולמי מה-DB

**מה זה צריך להיות:** **enriched context** — run + WP + program + stage + links:
```json
{
  "run": { ...current run state... },
  "work_package": { "id": "S003-P005-WP001", "label": "...", "spec_file": "..." },
  "program": { "id": "S003-P005", "label": "..." },
  "stage": { "id": "S003", "label": "..." },
  "actor_team": { "id": "team_190", "role": "CONSTITUTIONAL_VALIDATOR" },
  "spec_ref": "_COMMUNICATION/team_170/TEAM_170_S003_P005_WP001_GATE_1_LLD400_v1.0.0.md",
  "communication_paths": {
    "write_to": "_COMMUNICATION/team_190/",
    "expected_filename": "TEAM_190_S003_P005_WP001_GATE_1_VERDICT_v1.0.0.md"
  }
}
```

---

## 2.3 מיפוי צוותות — זהות, סמכויות, Skills, תפוקות

### TIER 1 — Governance Teams (Gate-critical)

#### Team 190 — Constitutional Validator (GATE_0, GATE_1/1.2)
| | |
|--|--|
| **Engine** | OpenAI / Codex API |
| **Seniority** | Senior reviewer — adversarial, independent |
| **Input** | WP brief + spec (שלב 0: brief בלבד; שלב 1.2: LLD400) |
| **Output** | BLOCKING_REPORT עם JSON block + BF findings |
| **Authority** | Binary: PASS → advance; FAIL → CORRECTION (blocking) |
| **Iron Rules** | לא מיישם, לא מייעץ, לא מסביר — רק ולידציה |
| **Skills** | ניתוח spec completeness, API contract analysis, Iron Rule compliance |
| **Trigger Protocol** | Layer 1: `POST /api/runs/{run_id}/feedback` עם `detection_mode: CANONICAL_AUTO` |
| **Output File** | `TEAM_190_{wp_id}_GATE_{n}_VERDICT_v1.0.0.md` ב-`_COMMUNICATION/team_190/` |
| **Output Format** | JSON block: `{verdict, summary, blocking_findings[{id, description, evidence}], route_recommendation}` |

#### Team 170 — Spec Author (GATE_1/1.1)
| | |
|--|--|
| **Engine** | OpenAI / Codex API |
| **Seniority** | Senior architect — spec writer |
| **Input** | WP brief (מ-team_10/11), domain requirements |
| **Output** | LLD400 spec עם 6 sections חובה |
| **Authority** | לכתוב spec; לא לאשר, לא לדחות |
| **Iron Rules** | אין "should/may/as needed" — כל AC חייב להיות measurable ו-unambiguous |
| **Skills** | API design, spec completeness, team assignment rules |
| **Trigger Protocol** | Layer 2: כתיבת קובץ spec ל-`_COMMUNICATION/team_170/` (מיידית trigger Layer 1 אחריו) |
| **Output File** | `TEAM_170_{wp_id}_GATE_1_LLD400_v1.0.0.md` |
| **Output Format** | 6 sections: scope, exclusions, ACs, constraints, assignments, open items |

#### Team 111 — AOS Domain Architect (GATE_2/2.1)
| | |
|--|--|
| **Engine** | Cursor Composer |
| **Seniority** | Senior architect — AOS domain |
| **Input** | LLD400 from team_170 + AOS governance + run state |
| **Output** | Architecture verdict עם 8-check validation |
| **Authority** | ADVANCE (pass) או FAIL (correction) — **לא APPROVE** (`is_human_gate=0`) |
| **Iron Rules** | AOS-specific: no ES modules, no bundler, CSS/JS separation, single rich-text object |
| **Skills** | AOS architecture patterns, anti-pattern detection, LOD200/400 reading |
| **Trigger Protocol** | Layer 1: `POST /api/runs/{run_id}/advance` עם `{verdict: "pass", summary: "..."}` |
| **Output File** | `TEAM_111_{wp_id}_GATE_2_VERDICT_v1.0.0.md` |

#### Team 110 — TikTrack Domain Architect (GATE_2/2.1)
| | |
|--|--|
| **Engine** | Cursor Composer |
| **Input/Output** | כ-team_111 אך ל-TikTrack domain |
| **Iron Rules TikTrack** | NUMERIC(20,8), maskedLog, collapsible-container, 4-state status, D40 extension pattern |

#### Team 100 — Chief System Architect (GATE_2 fallback, GATE_6)
| | |
|--|--|
| **Engine** | Claude Code |
| **Role** | Fallback approver; domain-neutral; GATE_6 co-owner |
| **Authority** | כ-team_111/110 כ-fallback; לא displace architect פעיל |

---

### TIER 2 — Gateway Teams (Pipeline Coordinators)

#### Team 10 — TikTrack Gateway (GATE_1 coordination + GATE_3-5)
| | |
|--|--|
| **Engine** | Cursor Composer |
| **Role** | מתאם spec writing, מנתב ל-teams 20/30/40/50 ב-TRACK_FULL |
| **Output** | Mandate packages + orchestration documents |
| **Trigger Protocol** | Layer 2: כתיבת orchestration doc ל-`_COMMUNICATION/team_10/` |

#### Team 11 — AOS Gateway (GATE_1 coordination + GATE_3-5)
| | |
|--|--|
| **Engine** | Cursor Composer |
| **Role** | מתאם ל-AOS domain; TRACK_FOCUSED (team_61 + team_51) |

---

### TIER 3 — Execution Teams (GATE_3 Implementation)

| Team | Domain | Role | Engine | Iron Rules ספציפיות |
|------|--------|------|--------|---------------------|
| **20** | TikTrack | Backend Dev | Cursor | NUMERIC(20,8), maskedLog, APScheduler, SSOT DDL |
| **30** | TikTrack | Frontend Dev | Cursor | collapsible-container, page template, rich-text Iron Rule |
| **40** | TikTrack | DevOps/Infra | Cursor | migration reversibility, no schema destructive ops |
| **50** | TikTrack | QA | Cursor | test-suite 0 failures mandatory |
| **51** | AOS | QA | Cursor | cross-engine validation principle |
| **60** | TikTrack | Spec/Review | Cursor | — |
| **61** | AOS | Execution | Cursor | single human principal |
| **70** | TikTrack | Doc Closure | Cursor | GATE_8 / lifecycle |
| **71** | AOS | Doc Closure | Cursor | — |
| **90** | Cross | Validation | Cursor | — |

---

### TIER 4 — Infrastructure Teams

| Team | Role | Notes |
|------|------|-------|
| **191** | GitHub & Backup | not yet active |
| **00** | Human Principal | Nimrod — GATE_4 + GATE_7; לא auto-default לשום דבר |

---

## 2.4 Canonical Output Contracts (פורמט קובץ לכל צוות)

### Layer 1 — CANONICAL_AUTO (Agent שולח API call ישיר)

```bash
POST http://localhost:8090/api/runs/{run_id}/feedback
X-Actor-Team-Id: {team_id}
Content-Type: application/json

{
  "detection_mode": "CANONICAL_AUTO",
  "structured_json": {
    "verdict": "PASS" | "FAIL",
    "summary": "תיאור קצר",
    "confidence": "HIGH",
    "blocking_findings": [
      { "id": "BF-01", "description": "...", "evidence": "file:line" }
    ],
    "route_recommendation": "doc" | "impl" | "arch" | null
  }
}
```

### Layer 2 — OPERATOR_NOTIFY (כתיבת קובץ)

**שם קובץ canonical:** `TEAM_{team_id}_{wp_id}_GATE_{n}_VERDICT_v{x.y.z}.md`

**מיקום:** `_COMMUNICATION/{team_id}/`

**תוכן חובה:**
````markdown
```json
{
  "verdict": "PASS" | "FAIL",
  "summary": "תיאור",
  "blocking_findings": [...],
  "route_recommendation": "..."
}
```

---
id: TEAM_{team_id}_{wp_id}_GATE_{n}_VERDICT_v1.0.0
from: Team {id}
to: {recipient teams}
date: YYYY-MM-DD
status: PASS | FAIL
````

---

## 2.5 מה חסר עכשיו ב-L1/L2 — Gap Analysis

### Gap Analysis לפי שלב

| שלב | צוות | L1 (Template) — חסר | L2 (Governance) — חסר |
|-----|------|---------------------|----------------------|
| GATE_0 | 190 | output file format, Layer 1 trigger instructions, BF format | ✓ קיים (סביר) |
| GATE_1/1.1 | 170 | Layer 2 file naming convention, what constitutes "ambiguous AC" | ✓ קיים (טוב) |
| GATE_1/1.2 | 190 | route_recommendation חובה, BF format | חסר: GATE-specific authority |
| GATE_2/2.1 | 111/110 | anti-pattern examples, Layer 1 trigger | חסר: anti-pattern library |
| GATE_3/3.1 | 10/11 | mandate structure, ACs confirmation flow | **חסר לחלוטין** (אין governance) |
| GATE_4 (human) | 00 | approval checklist objective | ✓ לא agent |
| GATE_5/5.1 | 10/11 | doc closure checklist, registry update flow | **חסר לחלוטין** |

### Governance Files חסרים לחלוטין

מ-**12 execution teams** — **אפס** קבצי governance קיימים:
`team_20`, `team_30`, `team_40`, `team_50`, `team_51`, `team_60`, `team_61`, `team_70`, `team_71`, `team_90`, `team_10`, `team_11`

⚠️ אם מי מהם יהיה routed ב-pipeline → `GovernanceNotFoundError` → prompt יכשל עם שגיאה.

---

## 2.6 תכנית מימוש Point 3 — שלבים

### שלב א' — Infrastructure (לא דורש אישור)

```
1. builder.py — L4 enrichment:
   הוסף WP + program + stage + spec_ref + communication_paths ל-L4 JSON
   (מידע זה כבר ב-DB; רק enrichment של run row הקיים)

2. builder.py — L3 filtering:
   סנן policies לפי gate_id + domain_id הנוכחיים (לא כל ה-DB)
   הוסף "iron_rules_summary" מ-governance file parsing
```

### שלב ב' — Template Upgrades (דורש אישור — Part 3 של תכנית זו)

```
עדכון כל 6 התבניות ב-definition.yaml:
1. הוסף SECTION: TRIGGER PROTOCOL לכל תבנית
2. הוסף SECTION: OUTPUT CONTRACT (פורמט + שם קובץ)
3. הוסף Iron Rules inline (לא reference — paste)
4. הוסף דוגמה canonical אחת לפלט
```

### שלב ג' — Governance Files (דורש אישור — Part 3 של תכנית זו)

```
יצירת governance files לצוותות החסרים:
Priority 1 (pipeline-blocking אם מגיעים לשלב):
  - team_10.md (expanded — עכשיו skeletal)
  - team_11.md (expanded — עכשיו skeletal)
  - team_61.md (AOS execution — GATE_3/3.1 כבר פעיל)
  - team_51.md (AOS QA — GATE_4/4.1 כבר פעיל)

Priority 2 (TikTrack path):
  - team_20.md, team_30.md, team_40.md, team_50.md, team_60.md

Priority 3 (lifecycle):
  - team_70.md, team_71.md, team_90.md
```

### שלב ד' — Injection Framework (ביצוע אחרי אישור שלבים ב'+ג')

```
1. canonical_template_v2 — new template format with 3 sections (mission, constraints, trigger)
2. governance_v2 — new governance format with 4 sections (identity, gate-authority, input-validation, output-contract)
3. builder.py — L1+L2 assembly upgrade
4. bump all template versions in definition.yaml + re-seed
```

---

## 2.7 עקרונות עיצוב לתכנית Point 3

### עקרון 1 — Locality (מידע קרוב לצורך)

Iron Rules לא ב-AGENTS.md ובמסמכי governance נפרדים — **הכנסה inline לתבנית** ב-L1. ה-agent לא צריך לדעת לחפש; הוא מקבל.

### עקרון 2 — Specificity (פרטים ולא כלליות)

```
❌ "Write your output to the communication folder"
✅ "Write to: _COMMUNICATION/team_190/TEAM_190_S003_P005_WP001_GATE_1_VERDICT_v1.0.0.md
    File must contain JSON block with: verdict, summary, blocking_findings[], route_recommendation"
```

### עקרון 3 — Canonical Example (דוגמה אחת מלאה)

כל תבנית מכילה דוגמה אחת מלאה של פלט נכון. ה-agent מחקה את הדוגמה — לא ממציא.

### עקרון 4 — Negative Examples (מה לא לעשות)

```
❌ "204 or 200" — לא מותר; בחר אחד
❌ "price_as_of (or D33 field name)" — לא מותר; ציין שם מדויק
❌ "implementation-defined" — לא מותר; הגדר במפורש
```

### עקרון 5 — Progressive Disclosure (L1 compact, L2 detailed)

- L1 (תבנית): קצר, focused, action-oriented (מה לעשות עכשיו)
- L2 (governance): מפורט, comprehensive, reference (מי אתה ומה הסמכויות)
- לא כפילות — L2 לא חוזר על L1; L1 מפנה ל-L2 רק לפרטים

---

## 2.8 הצגה לאישור — מה צריך החלטה

הנושאים הבאים דורשים אישור **לפני** מימוש:

| # | נושא | האפשרויות | המלצה |
|---|------|-----------|--------|
| A | Auto-advance ב-CANONICAL_AUTO HIGH | (1) Auto + policy; (2) Manual תמיד | Option 1 עם env flag |
| B | Layer 2 polling interval | 15s / 30s / 60s | 30s (balance freshness/load) |
| C | Template format — backwards compat | (1) bump version in-place; (2) new template IDs | Option 1 (version bump) |
| D | Governance file depth — execution teams | (1) minimal 1-pager; (2) full detailed | Priority 1 teams: full; P2/P3: minimal |
| E | L4 enrichment — ספציפיות | (1) enrich builder; (2) new `/api/runs/{id}/context` endpoint | Option 1 (simpler) |

---

## סיכום — מה מחכה לאישור

**Point 2 (detection):** ניתן לממש מיידית — F-05 עד F-08. F-09 תלוי ב-Point 3.

**Point 3 (injection):** מסמך זה = הקונספט + תכנון. דרוש אישור על:
- שלב א' (infrastructure) — ניתן לאשר מיידית, ללא השפעה על templates קיימים
- שלב ב' (template upgrades) + שלב ג' (governance files) — דורשים אישור מפורט
- שלב ד' (injection framework) — ממומש רק אחרי ב'+ג' מאושרים

---

**log_entry | TEAM_100 | PIPELINE_QUALITY_PLAN_v1.0.0 | DRAFT_FOR_REVIEW | 2026-04-01**

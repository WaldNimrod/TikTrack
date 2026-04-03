date: 2026-04-01
historical_record: true

# תכנית איכות פייפליין — v2.0.0 (לאחר אישור 5 ההחלטות)
## TEAM_100 | 2026-04-01 | STATUS: APPROVED FOR EXECUTION

> מחליף: TEAM_100_PIPELINE_QUALITY_PLAN_v1.0.0.md

---

## עקרון-על (מאישור ה-5)

> *"מה שחשוב כאן זה לא עוד שניה בממשק — אלא איכות האיגנט שנייצר.
> זה בעל המשקל הגדול ביותר בכל החלטה."*

**כל בחירה implementation, כל פשרה, כל עדיפות — נמדדת בשאלה:**
**"האם זה עושה את ה-agent שיקבל את הפרומט הזה מדויק יותר?"**

---

## 5 ההחלטות — גרסה סופית

| # | נושא | החלטה |
|---|------|--------|
| **A** | Auto-advance | Policy per gate. GATE_0 + GATE_1/1.1 = auto. שאר = manual. **בנוסף:** כל הודעת feedback → banner בולט בראש העמוד (לא רק toast) |
| **B** | Polling interval | APScheduler 30s default. **בנוסף:** dropdown בעמוד Configuration לשינוי interval |
| **C** | Template versioning | Git + תיקיית archive. עדכון תבנית = bump version + re-seed. פשוט |
| **D** | Governance depth | Tiered. **בנוסף:** מטריצת governance status מוצגת דינמית בעמוד Configuration. **אסור שזה יאבד** |
| **E** | L4 enrichment | Endpoint `/api/runs/{id}/context` shared by builder + UI. **בנוסף:** Teams page = אותן תבניות בדיוק, ללא mission ספציפי — placeholder לשאלה "מה המשימה הבאה שלי?" |

---

# PART 1 — POINT 2: DETECTION FIXES

## P2-F01 — Feedback Forms UI (Layers 2–4)
**עדיפות:** HIGH | **קבצים:** `index.html`, `app.js`

### המצב
`#aosv3-handoff-feedback-forms` קיים ב-HTML (שורה 237) אך ריק.
`app.js` משתמש ב-`aosv3-handoff-feedback-forms` — הכנת הבסיס קיימת, המימוש חסר.

### מה לממש

**index.html — בתוך `#aosv3-handoff-feedback-forms`:**
```html
<div id="aosv3-handoff-feedback-forms" class="aosv3-handoff-feedback-forms" hidden>
  <div class="sidebar-label">Submit agent feedback</div>

  <!-- Layer selector -->
  <div class="aosv3-feedback-layer-tabs">
    <label class="aosv3-team-checkbox-label">
      <input type="radio" name="feedback-layer" value="OPERATOR_NOTIFY" checked>
      🔍 Layer 2 — Scan file
    </label>
    <label class="aosv3-team-checkbox-label">
      <input type="radio" name="feedback-layer" value="NATIVE_FILE">
      📁 Layer 3 — File path
    </label>
    <label class="aosv3-team-checkbox-label">
      <input type="radio" name="feedback-layer" value="RAW_PASTE">
      📋 Layer 4 — Paste text
    </label>
  </div>

  <!-- Layer 2: scan only — no input needed -->
  <div id="aosv3-feedback-layer-b" class="aosv3-feedback-layer-panel">
    <p class="aosv3-sidebar-hint">
      יסרוק <code>_COMMUNICATION/{team_id}/</code> לפי קונבנציית שמות canonical.
      ודא שהקובץ נכתב לפני שלוחצים.
    </p>
  </div>

  <!-- Layer 3: file path input -->
  <div id="aosv3-feedback-layer-c" class="aosv3-feedback-layer-panel" hidden>
    <input type="text" id="aosv3-feedback-file-path" class="aosv3-input"
           placeholder="_COMMUNICATION/team_190/TEAM_190_…_VERDICT_v1.0.0.md"
           autocomplete="off" />
  </div>

  <!-- Layer 4: raw paste textarea -->
  <div id="aosv3-feedback-layer-d" class="aosv3-feedback-layer-panel" hidden>
    <textarea id="aosv3-feedback-raw-text" class="aosv3-input"
              rows="8" placeholder="Verdict: PASS&#10;Summary: ...&#10;BF-01: ..."></textarea>
  </div>

  <button type="button" class="btn btn-primary" id="aosv3-btn-ingest-feedback"
          title="Submit feedback to pipeline">Submit Feedback →</button>
  <p class="aosv3-sidebar-hint" id="aosv3-feedback-hint"></p>
</div>
```

**app.js — `wireLiveAction` על `aosv3-btn-ingest-feedback`:**
```javascript
// logic:
// 1. קרא איזה layer radio נבחר
// 2. בנה body בהתאם
// 3. POST /api/runs/{run_id}/feedback
// 4. הצג banner (ראה P2-F04) + loadPipelineStateFromApi(true)
```

---

## P2-F02 — Layer 2 APScheduler Polling
**עדיפות:** MEDIUM | **קבצים:** `scheduler_registry.py` (או equivalent), `api.py`

### מה לממש

```python
# scheduler_registry.py (או lifespan ב-api.py)
# Job: scan_communication_for_new_feedback
# interval: 30s default (נקרא מ-policy DB בזמן startup)
# env guard: AOS_V3_LAYER2_POLLING_ENABLED=1

async def _scan_communication_feedback():
    """Layer 2 auto-detect: scan _COMMUNICATION/{team_id}/ for new verdict files."""
    # 1. GET כל runs IN_PROGRESS/CORRECTION
    # 2. לכל run: resolve team_id מ-routing
    # 3. בדוק _mode_b_candidate_paths() עם mtime > run.started_at
    # 4. אם נמצא קובץ → POST /api/runs/{run_id}/feedback (mode=OPERATOR_NOTIFY)
    # 5. SSE notify → browser receives feedback_ingested event
```

**Policy ב-definition.yaml (לצורך dropdown בעמוד Config):**
```yaml
- id: "01JK8AOSV3POL00000000010"
  scope_type: GLOBAL
  policy_key: layer2_polling_interval_seconds
  policy_value_json: '{"value": 30, "options": [15, 30, 60, 120]}'
  priority: 100
```

---

## P2-F03 — Layer 1 Auto-Advance (Policy-based)
**עדיפות:** HIGH | **קבצים:** `use_cases.py`, `definition.yaml`

### מה לממש

**definition.yaml — policies:**
```yaml
- id: "01JK8AOSV3POL00000000011"
  scope_type: GATE
  gate_id: GATE_0
  phase_id: null
  policy_key: auto_advance_on_high_confidence
  policy_value_json: '{"enabled": true}'
  priority: 100

- id: "01JK8AOSV3POL00000000012"
  scope_type: GATE
  gate_id: GATE_1
  phase_id: "1.1"
  policy_key: auto_advance_on_high_confidence
  policy_value_json: '{"enabled": true}'
  priority: 100
# GATE_2 ואילך: לא מוגדר = default=false = manual
```

**use_cases.py — uc_15_ingest_feedback() (אחרי notify_feedback_ingested):**
```python
# אחרי שמירת feedback ו-SSE notify:
if (row["proposed_action"] == "ADVANCE"
        and row["confidence"] == "HIGH"
        and _policy_auto_advance_enabled(cur, gate_id, phase_id)):
    uc_02_advance_gate(conn, actor_team_id="system_auto", run_id=run_id,
                       summary="Auto-advance: Layer 1 HIGH confidence PASS")
    return {**feedback_record, "auto_advanced": True}
return {**feedback_record, "auto_advanced": False}
```

---

## P2-F04 — Feedback Banner (בולט בראש העמוד)
**עדיפות:** HIGH | **קבצים:** `index.html`, `app.js`

### הכלל (מאישור A)
**כל** הודעת feedback (Layer 1–4) חייבת banner בולט בראש `<main>` — לא רק toast.
Banner נשאר עד שהמשתמש סוגר אותו ידנית (X) **או** עד שהrun מתקדם.

### מה לממש

**index.html — בראש `<main class="agents-page-main">`:**
```html
<!-- Banner קיים לescalation; נוסיף feedback banner נפרד -->
<div id="aosv3-feedback-received-banner" class="aosv3-feedback-received-banner"
     hidden role="alert" aria-live="polite">
  <button class="aosv3-banner-close" id="aosv3-feedback-banner-close" aria-label="Dismiss">✕</button>
  <span id="aosv3-feedback-banner-text"></span>
</div>
```

**app.js — handler על SSE `feedback_ingested`:**
```javascript
es.addEventListener("feedback_ingested", function(ev) {
    var d = JSON.parse(ev.data || "{}");
    var verdict  = d.verdict || "?";
    var conf     = d.confidence || "?";
    var action   = d.proposed_action || "?";
    var actor    = d.actor_team_id || "agent";
    var icon     = verdict === "PASS" ? "✅" : verdict === "FAIL" ? "🚫" : "⏳";
    var lvl      = verdict === "PASS" ? "success" : "warning";

    // 1. Toast (קצר — 8s)
    showAosv3Toast(icon + " Feedback מ-" + actor + " — " + verdict
                   + " [" + conf + "] → " + action, { level: lvl, duration: 8000 });

    // 2. Banner (נשאר עד סגירה ידנית)
    var banner = document.getElementById("aosv3-feedback-received-banner");
    var text   = document.getElementById("aosv3-feedback-banner-text");
    if (banner && text) {
        text.innerHTML = icon + " <strong>Feedback התקבל</strong> מ-<code>" + esc(actor)
            + "</code> — verdict: <strong>" + esc(verdict) + "</strong>"
            + " | confidence: " + esc(conf)
            + " | next action: <strong>" + esc(action) + "</strong>"
            + (d.auto_advanced ? " ✨ <em>auto-advanced</em>" : "");
        banner.className = "aosv3-feedback-received-banner aosv3-feedback-banner--" + lvl;
        banner.hidden = false;
    }

    loadPipelineStateFromApi(true);
});
```

---

## P2-F05 — Polling Dropdown בעמוד Configuration
**עדיפות:** MEDIUM | **קבצים:** `config.html`, `app.js`

### מה לממש

**config.html — tab חדש "System" (או בתוך tab קיים):**
```html
<div class="aosv3-config-section">
  <div class="sidebar-label">Layer 2 — Auto-detect polling</div>
  <label class="aosv3-form-label">Scan interval
    <select id="aosv3-polling-interval-select" class="aosv3-input">
      <option value="15">15 seconds</option>
      <option value="30" selected>30 seconds (default)</option>
      <option value="60">60 seconds</option>
      <option value="120">2 minutes</option>
    </select>
  </label>
  <button type="button" class="btn btn-primary" id="aosv3-polling-interval-save">
    Save interval
  </button>
  <p class="aosv3-sidebar-hint" id="aosv3-polling-interval-status"></p>
</div>
```

**app.js — save handler:**
```javascript
// PATCH /api/policies/{id} עם value חדש
// אחרי שמירה: APScheduler reschedule (מקשיב לDB בכל startup)
```

---

## P2-F06 — Governance Status Matrix בעמוד Configuration
**עדיפות:** CRITICAL (מאישור D — "מסוכן אם יאבד")
**קבצים:** `api.py`, `config.html`, `app.js`

### הבעיה
מטריצת governance status — מה ממומש ובאיזו רמה — חייבת להיות:
1. **מקום אחד, נגיש לכולם**
2. **דינמי** — מתעדכן אוטומטית כשנוסף governance file
3. **לא יאבד** — לא בגוגל שיטס, לא במסמך נפרד, אלא בתוך ה-system עצמו

### Endpoint חדש — `GET /api/governance/status`

```python
# api.py
@_api_router.get("/governance/status")
def get_governance_status() -> dict:
    """
    סורק את תיקיית governance/ ומחזיר מטריצה של:
    - אילו teams יש להם קובץ
    - גודל הקובץ (proxy לרמת הפירוט)
    - תאריך שינוי אחרון
    - האם הצוות routed בפועל בפייפליין (יש routing rule שמצביע עליו)
    """
    from pathlib import Path
    gov_dir = Path(__file__).resolve().parents[2] / "governance"
    # ... סריקה + cross-reference מ-teams table ו-routing_rules
```

**Response:**
```json
{
  "governance_matrix": [
    {
      "team_id": "team_190",
      "has_file": true,
      "file_size_bytes": 1718,
      "last_modified": "2026-04-01",
      "quality_tier": "full",      // full | minimal | missing
      "is_routed": true,           // יש routing rule שמצביע לצוות זה
      "gates_served": ["GATE_0", "GATE_1/1.2"]
    },
    {
      "team_id": "team_61",
      "has_file": false,
      "quality_tier": "missing",
      "is_routed": true,           // DANGER: routed but no governance!
      "gates_served": ["GATE_3/3.1"]
    }
  ],
  "summary": {
    "total_teams": 20,
    "has_governance": 8,
    "missing_governance": 12,
    "routed_without_governance": 5   // CRITICAL: אלה שיגרמו ל-crash
  }
}
```

**config.html — tab "Governance":**
```html
<div id="aosv3-panel-governance" class="aosv3-tab-panel">
  <div class="sidebar-label">Governance Coverage Matrix</div>
  <p class="aosv3-sidebar-hint">
    מציג את מצב ה-governance files לכל צוות. 🔴 = routed without governance (יגרום ל-crash).
  </p>
  <div id="aosv3-governance-summary" class="aosv3-governance-summary"></div>
  <table class="aosv3-table" id="aosv3-governance-matrix-table">
    <thead>
      <tr>
        <th>Team</th><th>Governance</th><th>Quality</th>
        <th>Gates served</th><th>Routed?</th><th>Risk</th>
      </tr>
    </thead>
    <tbody id="aosv3-governance-matrix-tbody"></tbody>
  </table>
</div>
```

---

# PART 2 — POINT 3: CONTEXT INJECTION

## עקרון עיצוב מרכזי

**Teams page = Pipeline page — אותה תשתית, אותן תבניות, אותו context.**

ההבדל היחיד:
- Pipeline page: prompt = mission ספציפי לgate הנוכחי
- Teams page: prompt = identity + authority + skills + **"ask for your next task"** placeholder

זה לא פשרה — זו הגדרה נכונה. ה-agent שמקבל prompt מעמוד Teams:
1. יודע בדיוק מי הוא (L2 governance)
2. יודע את ה-Iron Rules שלו (L2)
3. יודע איך לדווח ומה הפורמט (L2 output contract)
4. מקבל prompt: *"אין לך משימה פעילה כרגע. מה הפרויקט הנוכחי שאתה עובד עליו? שאל את הoperator מה הצעד הבא."*

---

## P3-A: Infrastructure — L4 Enrichment Endpoint

### `GET /api/runs/{run_id}/context`

**מה מחזיר:**
```json
{
  "run_id": "01KN21WSXDSJC0SKRQS34B1KHC",
  "run": { "status": "CORRECTION", "current_gate_id": "GATE_1", ... },
  "work_package": {
    "id": "S003-P005-WP001",
    "label": "Watchlist Feature — TikTrack",
    "stage_id": "S003",
    "program_id": "S003-P005"
  },
  "actor_team": {
    "id": "team_190",
    "role": "CONSTITUTIONAL_VALIDATOR",
    "engine": "openai"
  },
  "communication": {
    "write_to": "_COMMUNICATION/team_190/",
    "expected_filename": "TEAM_190_S003_P005_WP001_GATE_1_VERDICT_v1.0.0.md",
    "spec_ref": "_COMMUNICATION/team_170/TEAM_170_S003_P005_WP001_GATE_1_LLD400_v1.0.0.md"
  },
  "correction_context": {
    "cycle": 1,
    "blocking_findings": [...],
    "route_recommendation": "doc"
  }
}
```

**builder.py — L4 enriched:**
```python
# במקום run row גולמי:
ctx = fetch_run_context(cur, run_id)   # endpoint logic → reused
layers["L4_context_json"] = json.dumps(ctx, default=str)
```

**Teams page — `/api/teams/{team_id}/context`:**
```json
{
  "team_id": "team_190",
  "governance": "# Team 190 — Constitutional Validator\n...",
  "current_assignment": null,   // אין run פעיל
  "mission_placeholder": "No active task. Ask the operator: what is the next work package for constitutional validation?"
}
```

---

## P3-B: Template Upgrades — פורמט חדש

### מבנה template v2 (3 sections חובה)

```markdown
# [GATE_X/Y | {role} | {date}]

## SECTION 1: MISSION
{מה המשימה הספציפית לשלב הזה — מה ה-input, מה ה-output הצפוי}

## SECTION 2: CONSTRAINTS
{Iron Rules inline — לא reference — paste the rules}
{מה אסור לעשות}
{מתי לעצור ולהעלות}

## SECTION 3: TRIGGER PROTOCOL
{Layer 1: POST /api/runs/{run_id}/feedback — דוגמה מלאה}
{Layer 2: שם קובץ מדויק + מיקום + פורמט JSON block}
{Output contract: שדות חובה בפלט}

### CANONICAL OUTPUT EXAMPLE
{דוגמה מלאה אחת — הפלט שה-agent צריך לחקות}

### NEGATIVE EXAMPLES — מה אסור
{❌ "204 or 200" — בחר אחד}
{❌ "implementation-defined" — הגדר במפורש}
```

### versioning workflow (Decision C)
```bash
# כשמעדכנים תבנית:
# 1. העתק קובץ ישן לארכיון
cp agents_os_v3/definition.yaml agents_os_v3/archive/definition_$(date +%Y%m%d_%H%M%S).yaml
# 2. עדכן body_markdown + bump version field
# 3. python3 agents_os_v3/seed.py  (re-seed — ON CONFLICT UPDATE version)
# 4. git commit
```

---

## P3-C: Governance Files — מטריצת ביצוע

### Priority 1 — מיידי (gates כבר פעילים או ב-pipeline פעיל)

| Team | Gate | Content focus | רמה |
|------|------|---------------|-----|
| **team_10** | GATE_3-5 (TikTrack coord) | Mandate structure, TRACK_FULL team routing, ACs confirmation flow | Full |
| **team_11** | GATE_3-5 (AOS coord) | TRACK_FOCUSED routing, team_61+51 coordination | Full |
| **team_61** | GATE_3/3.1 (AOS execution) | Single human principal Iron Rule, AOS patterns, no ES modules | Full |
| **team_51** | GATE_4/4.1 (AOS QA) | Test suite 0 failures, cross-engine validation | Full |

### Priority 2 — TikTrack path (לפני GATE_3 ב-TikTrack)

| Team | Role | Content focus | רמה |
|------|------|---------------|-----|
| **team_20** | TikTrack Backend | NUMERIC(20,8), maskedLog, APScheduler canon | Full |
| **team_30** | TikTrack Frontend | collapsible-container, rich-text Iron Rule, page template | Full |
| **team_40** | TikTrack DevOps | Migration reversibility, no destructive ops | Minimal |
| **team_50** | TikTrack QA | Selenium, 0 failures, test infrastructure | Full |
| **team_60** | TikTrack Spec | — | Minimal |

### Priority 3 — lifecycle

| Team | Role | רמה |
|------|------|-----|
| **team_70** | TikTrack Doc Closure | Minimal |
| **team_71** | AOS Doc Closure | Minimal |
| **team_90** | Cross validation | Minimal |

---

## P3-D: Teams Page Integration

### עמוד Teams — prompt flow חדש

**כרגע:** Teams page מציג מידע סטטי על כל צוות (engine, domain, assignments).

**אחרי P3-D:** כל צוות מציג:
1. **Identity block** (מ-governance file) — מי הצוות, סמכויות, engine
2. **Governance quality indicator** (מ-P2-F06 matrix) — full / minimal / missing
3. **"Generate Context Prompt" button** → קורא ל-`GET /api/teams/{team_id}/context`
   - אם יש run פעיל שמנותב לצוות זה → מחזיר prompt עם mission ספציפי
   - אם אין → מחזיר identity prompt עם placeholder "ask for your next task"
4. **Copy button** — copy ל-clipboard, בדיוק כמו Pipeline page

### Templates connection

Teams page משתמש **אותן** governance files (L2) שה-prompt assembler משתמש בהן.
**אין duplicates, אין divergence** — קובץ governance אחד, שני contexts:
- Pipeline context: + L1 (mission template) + L3 (policies) + L4 (run state)
- Teams context: + mission placeholder + last_assignment info

---

# PART 3 — ORDER OF EXECUTION

## Phase 1: Point 2 — מיידי (ללא dependencies)

```
[ ] P2-F04  Feedback banner (index.html + app.js SSE handler) ← מהיר, High impact
[ ] P2-F01  Feedback forms UI (Layers 2-4 in handoff section)
[ ] P2-F03  Auto-advance policy (definition.yaml + use_cases.py + seed)
[ ] P2-F02  Layer 2 APScheduler polling (scheduler + env flag)
[ ] P2-F05  Polling dropdown (config.html + app.js + API policy PATCH)
[ ] P2-F06  Governance matrix endpoint + config page tab ← CRITICAL
```

## Phase 2: Point 3-A — Infrastructure (ללא תכנון נוסף)

```
[ ] P3-A1   GET /api/runs/{run_id}/context endpoint (api.py)
[ ] P3-A2   builder.py — L4 use context endpoint
[ ] P3-A3   GET /api/teams/{team_id}/context endpoint
[ ] P3-A4   Teams page — "Generate Context Prompt" button
```

## Phase 3: Point 3-B+C — Templates + Governance (עבודת תוכן)

```
[ ] P3-C1   team_10.md expanded (Priority 1)
[ ] P3-C2   team_11.md expanded (Priority 1)
[ ] P3-C3   team_61.md (Priority 1)
[ ] P3-C4   team_51.md (Priority 1)
[ ] P3-B1   עדכון Template GATE_1/1.1 (team_170) — v2 format
[ ] P3-B2   עדכון Template GATE_1/1.2 (team_190) — add SECTION 3
[ ] P3-B3   עדכון Template GATE_0 (team_190) — add output contract
[ ] P3-B4   עדכון Template GATE_2/2.1 — add anti-patterns + Layer 1 trigger
[ ] P3-C5   Priority 2 governance (team_20, team_30, team_40, team_50)
[ ] P3-C6   Priority 3 governance (team_70, team_71, team_90)
```

## Phase 4: Tests + Validation

```
[ ] python3 -m pytest agents_os_v3/tests/ -q → 133 passed
[ ] Manual: config page governance matrix מציג נכון
[ ] Manual: feedback banner מופיע אחרי Layer 2 detection
[ ] Manual: Teams page context prompt מעתיק נכון
```

---

## מדד הצלחה

> לא "כמה features מימשנו" — אלא "האם ה-agent שיקבל את הפרומט יבצע את המשימה נכון בפעם הראשונה?"

**ברי מדידה:**
- Team 190 מסיים GATE_0 ב-round 1 ✓
- Team 170 מייצר spec שעובר team_190 validation ב-round 1 ✓
- Team 111/110 מאשר GATE_2 עם referenced Anti-patterns ✓
- Governance matrix = 0 "routed without governance" לפני כל gate ✓

---

**log_entry | TEAM_100 | PIPELINE_QUALITY_PLAN_v2.0.0 | APPROVED | 2026-04-01**

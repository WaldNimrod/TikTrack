date: 2026-04-01
historical_record: true

# תכנית איכות פייפליין — v3.1.0 (Option A נעול — מוכן לביקורת חוזרת)
## TEAM_100 | 2026-04-01 | STATUS: PENDING SECOND REVIEW (team_190)

> מחליף: v3.0.0. שינוי יחיד: §A — נעילת Option A (החלטת team_00).
> כל שאר הסעיפים זהים ל-v3.0.0.

---

## DELTA מ-v2.0.0 — תיקונים בלבד

| # | ממצא team_190 | חומרה | תיקון בתכנית |
|---|---------------|-------|--------------|
| BF-190-01 | Layer 1 דרך `/advance+feedback_json`, לא `/feedback` | BLOCKER | §A — **Option A נעול** (team_00 2026-04-01) |
| BF-190-02 | UI forms קיימים (mock) — לא לשכפל | HIGH | §B — wire existing, לא build new |
| BF-190-03 | team_10/11 governance קיים (skeletal, לא missing) | HIGH | §C — "expand" לא "create" |
| BF-190-04 | team_110/111 engine = `codex` (לא Cursor) | HIGH | §D — תיקון מיפוי בכל התכנית |
| BF-190-05 | `uc_02_advance_gate` לא קיים; actor check קשיח | HIGH | §E — actor resolution + שם נכון |
| BF-190-06 | Polling ללא idempotency/dedupe | MEDIUM | §F — file fingerprint key |
| BF-190-07 | חוזה שם קובץ קשיח מול parser 7-priority | MEDIUM | §G — canonical primary + variants noted |
| BF-190-08 | Token budget לא מאוכף בעוד מוסיפים L1/L2 כבד | MEDIUM | §H — enforcement בתכנית |

---

# §A — BLOCKER: חוזה Layer 1 ✅ LOCKED: Option A (team_00, 2026-04-01)

## המצב האמיתי

`FeedbackIngestBody` (`models.py:33`) מוגבל ל-Literal:
```python
detection_mode: Literal["OPERATOR_NOTIFY", "NATIVE_FILE", "RAW_PASTE"]
```
**`CANONICAL_AUTO` לא קיים ב-`/feedback`.**

Layer 1 בפועל: `POST /advance` עם `feedback_json` — כבר ממומש ב-`machine.py:396`.

## החלטה: Option A — הרחב `/feedback` ל-CANONICAL_AUTO

```python
# models.py
class FeedbackIngestBody(BaseModel):
    detection_mode: Literal[
        "CANONICAL_AUTO",      # NEW — Layer 1
        "OPERATOR_NOTIFY",     # Layer 2
        "NATIVE_FILE",         # Layer 3
        "RAW_PASTE",           # Layer 4
    ]
    structured_json: Optional[dict[str, Any]] = None  # NEW — Layer 1
    file_path: Optional[str] = None
    raw_text: Optional[str] = None

    @model_validator(mode="after")
    def _check_layer1(self) -> "FeedbackIngestBody":
        if self.detection_mode == "CANONICAL_AUTO" and not self.structured_json:
            raise ValueError("structured_json required for CANONICAL_AUTO")
        return self
```

```python
# api.py — post_feedback handler: הוסף branch לפני uc_15
if body.detection_mode == "CANONICAL_AUTO":
    return UC.uc_15_ingest_feedback(
        conn, actor_team_id=actor_team_id, run_id=run_id,
        detection_mode="CANONICAL_AUTO",
        structured_json=body.structured_json,
    )
```

### רציונל

כל feedback (כל 4 layers) עובר דרך endpoint אחד — consistency, observability, policy auto-advance applies uniformly. `/advance+feedback_json` נשאר תקף כ-legacy path אך **לא יתועד לצוותות כ-Layer 1 canonical**.

### השפעה על תיעוד לצוותות

Layer 1 canonical protocol (יופיע ב-TRIGGER PROTOCOL של כל תבנית):
```bash
POST http://localhost:8090/api/runs/{run_id}/feedback
X-Actor-Team-Id: {team_id}
Content-Type: application/json

{
  "detection_mode": "CANONICAL_AUTO",
  "structured_json": {
    "verdict": "PASS" | "FAIL",
    "summary": "...",
    "confidence": "HIGH",
    "blocking_findings": [...],
    "route_recommendation": "doc" | "impl" | "arch" | null
  }
}
```

**Option B (`/advance+feedback_json`) — deprecated as Layer 1 path.** נשאר עובד ב-machine.py אך לא מוצג בתיעוד.

---

# §B — HIGH: UI Wiring — existing forms, לא new panel

## המצב האמיתי

**קיים ב-`app.js:1703`:**
- `renderHandoffIngestionExtra()` — מרנדר file path input + textarea
- `wireHandoffIngestionToggles()` — מגיב ל-buttons
- buttons קיימים אך עם `data-mock-toast` — מציגים toast בלבד, **לא שולחים API call**

**קיים ב-`index.html:237`:**
- `<div id="aosv3-handoff-feedback-forms">` — קונטיינר ייעודי

## מה לעשות (במקום build new)

**שלב 1 — ב-`renderHandoffIngestionExtra()`:**
החלף `data-mock-toast` ב-live action על כפתורי "Parse" / "Parse Feedback":

```javascript
// כפתור Layer 3 (NATIVE_FILE):
var filePath = document.getElementById("aosv3-ingest-file-path").value.trim();
AOSV3_apiJson("/api/runs/" + encodeURIComponent(rid()) + "/feedback", {
    method: "POST",
    body: JSON.stringify({ detection_mode: "NATIVE_FILE", file_path: filePath }),
    headers: { "Content-Type": "application/json" },
})
.then(function(r) { showFeedbackReceivedBanner(r); return loadPipelineStateFromApi(true); })
.catch(function(e) { showAosv3Toast(_friendlyErr(e.body?.detail?.code, null, e.message), {level:"error"}); });

// כפתור Layer 4 (RAW_PASTE):
var rawText = document.getElementById("aosv3-ingest-paste").value.trim();
AOSV3_apiJson("/api/runs/" + encodeURIComponent(rid()) + "/feedback", {
    method: "POST",
    body: JSON.stringify({ detection_mode: "RAW_PASTE", raw_text: rawText }),
    headers: { "Content-Type": "application/json" },
})...
```

**שלב 2 — Layer 2 (OPERATOR_NOTIFY):**
הוסף כפתור "🔍 Scan now" ל-`aosv3-handoff-feedback-forms` שמפעיל OPERATOR_NOTIFY scan:

```javascript
AOSV3_apiJson("/api/runs/" + encodeURIComponent(rid()) + "/feedback", {
    method: "POST",
    body: JSON.stringify({ detection_mode: "OPERATOR_NOTIFY" }),
    headers: { "Content-Type": "application/json" },
})...
```

**שלב 3 — Layer 1 (CANONICAL_AUTO):**
לאחר נעילת §A — הוסף טופס JSON paste עם `structured_json` body.

**⚠️ אסור** ליצור `<div>` חדשים מחוץ ל-`aosv3-handoff-ingestion-extra` / `aosv3-handoff-feedback-forms`.

---

# §C — HIGH: Governance — "expand" לא "create"

## המצב האמיתי

| Team | קובץ | גודל | רמה |
|------|------|------|-----|
| team_10 | ✅ קיים | ~400B | skeletal (4 sections, 1 משפט כל אחד) |
| team_11 | ✅ קיים | ~400B | skeletal |
| team_100 | ✅ קיים | ~1.6KB | סביר |
| team_110 | ✅ קיים | ~1.9KB | טוב |
| team_111 | ✅ קיים | ~1.8KB | טוב |
| team_170 | ✅ קיים | ~2.0KB | טוב |
| team_190 | ✅ קיים | ~1.7KB | טוב |

## Priority 1 — Expand (לא יצירה מחדש)

**team_10.md** — נדרש הרחבה:
- הוסף: GATE authority scope (GATE_3/3.1, GATE_5/5.1)
- הוסף: Mandate structure format + team routing table (TRACK_FULL → 20, 30, 40, 50)
- הוסף: ACs confirmation flow + trigger protocol (Layer 2 file naming)
- הוסף: Output contract + canonical example

**team_11.md** — נדרש הרחבה:
- כ-team_10 אבל: TRACK_FOCUSED → team_61 + team_51
- הוסף: AOS-specific routing rules

---

# §D — HIGH: Engine Mapping — תיקון מוחלט

**SSOT:** `definition.yaml`

| Team | engine ב-SSOT | מה נכתב בטעות בתכנית |
|------|--------------|----------------------|
| team_100 | `claude-code` | ✓ נכון |
| team_110 | **`codex`** | ❌ "Cursor Composer" |
| team_111 | **`codex`** | ❌ "Cursor Composer" |
| team_170 | codex/openai | — |
| team_190 | codex/openai | — |

**מעתה בכל תיעוד:** team_110/111 = `codex` (OpenAI Codex API), לא Cursor.
**Iron Rule:** engine assignment = `definition.yaml` בלבד. תיעוד ידני לא מוסמך.

---

# §E — HIGH: Auto-Advance — מימוש נכון

## הבעיה

הקוד שנכתב בתכנית v2.0.0:
```python
uc_02_advance_gate(conn, actor_team_id="system_auto", ...)  # ❌ לא קיים
```

שתי שגיאות:
1. הפונקציה נקראת `uc_02_advance_run` (לא `uc_02_advance_gate`)
2. `_assert_g02` (`machine.py:119`) בודק שה-actor תואם לassignment — `"system_auto"` ייכשל תמיד עם `WRONG_ACTOR`

## מימוש נכון

```python
# use_cases.py — uc_15_ingest_feedback() — אחרי notify_feedback_ingested():

if (row["proposed_action"] == "ADVANCE"
        and row["confidence"] == "HIGH"
        and _policy_auto_advance_enabled(cur, run["current_gate_id"], run["current_phase_id"])):

    # חייבים לפתור את ה-actor הנכון מה-routing — לא "system_auto"
    from agents_os_v3.modules.routing.resolver import resolve_actor_team_id
    actual_actor = resolve_actor_team_id(cur, run)
    if actual_actor:
        try:
            uc_02_advance_run(
                conn,
                actor_team_id=actual_actor,   # ✅ actor אמיתי מה-routing
                run_id=run_id,
                verdict="pass",
                summary="Auto-advance: Layer 1 HIGH confidence PASS",
                feedback_json=row.get("structured_json"),
            )
            notify_run_state_changed(run_id, domain_id, "IN_PROGRESS", "IN_PROGRESS")
            return {**feedback_record, "auto_advanced": True, "auto_actor": actual_actor}
        except StateMachineError:
            pass  # fail-safe: אם auto-advance נכשל — המשתמש רואה proposed_action=ADVANCE
return {**feedback_record, "auto_advanced": False}
```

**הערה:** `resolve_actor_team_id` מחזיר את הצוות לפי routing_rules + assignments — בדיוק מה ש-`_assert_g02` מצפה.

---

# §F — MEDIUM: Polling Idempotency

## הבעיה

APScheduler מריץ job כל 30s. אם הפעולה לוקחת >30s, או אם יש restart, **אותו קובץ עלול להיות processed פעמיים**. `FEEDBACK_ALREADY_INGESTED` מגן אם הפעולה הראשונה עדיין pending — אבל אחרי consume, אין הגנה.

## פתרון: File Fingerprint Key

```python
# scheduler job — לפני POST /feedback:
import hashlib

def _file_fingerprint(path: Path) -> str:
    """sha1(path + mtime) — unique per file content state."""
    stat = path.stat()
    return hashlib.sha1(f"{path}:{stat.st_mtime}:{stat.st_size}".encode()).hexdigest()[:16]

# In-memory set (process lifetime):
_PROCESSED_FILES: set[str] = set()

def _scan_and_ingest(conn, run):
    ...
    for candidate in candidates:
        if not candidate.is_file(): continue
        fp = _file_fingerprint(candidate)
        if fp in _PROCESSED_FILES:
            continue   # כבר עובד
        # POST /feedback...
        _PROCESSED_FILES.add(fp)
```

**הערה:** In-memory מספיק ל-single process. אם בעתיד multi-process — צריך Redis/DB key, אבל לא עכשיו.

**הוסף גם:** `max_concurrent=1` ל-APScheduler job (`coalesce=True, max_instances=1`) למניעת overlapping executions.

---

# §G — MEDIUM: File Naming Convention — Primary + Variants

## הבעיה בתכנית v2.0.0

נכתב **רק** הפורמט הקאנוני. המשמעות המשתמעת: פורמטים אחרים = שגויים.

## ניסוח נכון בתיעוד לצוותות

```markdown
### Output File — Canonical (עדיפות ראשונה למערכת):
TEAM_{team_id}_{wp_id}_GATE_{n}_VERDICT_v{x.y.z}.md
מיקום: _COMMUNICATION/{team_id}/

### Output File — Variants (גם מזוהים אוטומטית):
TEAM_{team_id}_{wp_id}_COMPLETION_v{x.y.z}.md
TEAM_{team_id}_{wp_id}_GATE_{n}_DECISION_v{x.y.z}.md
{wp_id}_VERDICT.md   ← legacy, ללא prefix (עדיין עובד)

⚠️ הערה: כל הפורמטים מזוהים, אבל CANONICAL הוא הנבדק **ראשון**.
להשתמש תמיד בפורמט CANONICAL לdocuments חדשים.
```

---

# §H — MEDIUM: Token Budget Enforcement

## הבעיה

`builder.py:116` מחזיר `token_budget_warning: None` תמיד. התכנית מוסיפה inline Iron Rules, דוגמאות, anti-patterns — L1+L2 עלולים לצמוח ל-10K+ tokens. agent שמקבל prompt בלי גבול = ייתכן truncation שקט ע"י ה-LLM או timeout.

## מימוש

```python
# builder.py — לפני return out:

_TOKEN_BUDGET_BY_GATE = {
    "GATE_0": 4000,
    "GATE_1": 6000,
    "GATE_2": 8000,
    "default": 6000,
}
_WARN_THRESHOLD = 0.85   # אזהרה כשמגיעים ל-85% מהתקציב

def _approx_tokens(text: str) -> int:
    return len(text) // 4   # heuristic: 4 chars ≈ 1 token

gate_budget = _TOKEN_BUDGET_BY_GATE.get(
    str(run.get("current_gate_id", "")),
    _TOKEN_BUDGET_BY_GATE["default"]
)

total_tokens = sum(_approx_tokens(s) for s in [l1, l2, l3, l4] if s)
warning = None
if total_tokens > gate_budget:
    warning = f"OVER_BUDGET: ~{total_tokens} tokens > {gate_budget} limit"
    # fail-soft: קצר L3+L4 (לא L1/L2 — mission-critical)
    l3 = l3[:2000] + "\n... [truncated — token budget]" if l3 else l3
    l4 = l4[:3000] + "\n... [truncated — token budget]" if l4 else l4
elif total_tokens > gate_budget * _WARN_THRESHOLD:
    warning = f"NEAR_BUDGET: ~{total_tokens} tokens (~{int(total_tokens/gate_budget*100)}% of {gate_budget})"

out["meta"]["token_budget_warning"] = warning
out["meta"]["approx_tokens"] = total_tokens
```

**UI update:** הצג `token_budget_warning` ב-prompt section badge (כרגע `aosv3-prompt-token-badge` = `—`):
```javascript
// אם warning קיים:
var tokenBadge = document.getElementById("aosv3-prompt-token-badge");
if (meta.token_budget_warning) {
    tokenBadge.textContent = "⚠ " + meta.approx_tokens + " tokens";
    tokenBadge.className = "status-pill pill-warning";
} else {
    tokenBadge.textContent = "~" + (meta.approx_tokens || "?") + " tokens";
    tokenBadge.className = "status-pill pill-current";
}
```

---

# תוספת team_190 §I — KPI Framework

team_190 דרש מדדי איכות לפני מימוש. **מקבל — זה קריטי.**

## KPIs מוצעים

| KPI | מדידה | יעד |
|-----|-------|-----|
| Detection accuracy by layer | events.detection_mode distribution | >80% Layer 1+2, <20% Layer 3+4 |
| IL-1 parse rate | ingestion_layer="JSON_BLOCK" / total | >70% (אם נמוך → templates לא מלמדים format נכון) |
| IL-3 fallback rate | ingestion_layer="RAW_DISPLAY" / total | <10% (MANUAL_REVIEW = ידני) |
| Correction cycle count p50 | runs.correction_cycle_count median | ≤1 (spec passes constitutional validation in ≤2 rounds) |
| Auto-advance rate (GATE_0+1.1) | events עם auto_advanced=true / eligible | >60% (לאחר Layer 1 adoption) |
| Prompt token p95 by gate | approx_tokens distribution | GATE_0≤4K, GATE_1≤6K, GATE_2≤8K |

## היכן מוצגים

עמוד Configuration — tab חדש "Quality KPIs":
- נתונים מ-`GET /api/events?aggregate=detection_mode` (endpoint חדש)
- אפשר לבנות מעל `events` table הקיים (event_type, detection_mode columns)

---

# סדר ביצוע — מעודכן

## Phase 0 — נעילות
```
[✅] §A — Option A נעול (team_00, 2026-04-01)
[ ]  עדכון תיעוד לצוותות: TRIGGER PROTOCOL = POST /feedback + CANONICAL_AUTO
```

## Phase 1 — Point 2 (מיידי, סדר מעודכן)
```
[ ] P2-F04  Feedback banner SSE (index.html + app.js)        ← 30 דק׳
[ ] §B      Wire existing forms (app.js — data-mock-toast→live) ← 1-2 שעות
[ ] §H      Token budget enforcement (builder.py + UI badge)  ← 1 שעה
[ ] P2-F03  Auto-advance policy (§E actor resolution)         ← 1-2 שעות
[ ] §F      Layer 2 polling + idempotency (APScheduler)       ← 1-2 שעות
[ ] P2-F05  Polling dropdown (config.html + policy PATCH)     ← 30 דק׳
[ ] P2-F06  Governance matrix endpoint + config tab           ← 1-2 שעות
```

## Phase 2 — Point 3 Infrastructure
```
[ ] P3-A1   GET /api/runs/{run_id}/context endpoint
[ ] P3-A2   builder.py — L4 use context
[ ] P3-A3   GET /api/teams/{team_id}/context endpoint
[ ] P3-A4   Teams page — "Generate Context Prompt" button
[ ] §I      GET /api/events?aggregate=detection_mode + KPI tab
```

## Phase 3 — Templates + Governance Content
```
[ ] §C      team_10.md expanded (Priority 1)
[ ] §C      team_11.md expanded (Priority 1)
[ ] §D      engine correction בכל governance files (codex לא Cursor)
[ ] P3-C3   team_61.md (Priority 1 — new)
[ ] P3-C4   team_51.md (Priority 1 — new)
[ ] P3-B1   Template GATE_1/1.1 — v2 format + TRIGGER PROTOCOL section
[ ] P3-B2   Template GATE_1/1.2 — v2 format + output contract
[ ] P3-B3   Template GATE_0 — v2 format + canonical example
[ ] P3-B4   Template GATE_2/2.1 — anti-patterns + Layer 1 trigger
[ ] P3-C5   Priority 2 governance (team_20, team_30, team_40, team_50)
[ ] P3-C6   Priority 3 governance (team_70, team_71, team_90)
```

## Phase 4 — Validation
```
[ ] python3 -m pytest agents_os_v3/tests/ -q → 133 passed
[ ] Manual: feedback banner מופיע אחרי Layer 2 detection
[ ] Manual: Layer 3/4 forms שולחים live API (לא mock toast)
[ ] Manual: config page governance matrix + KPI tab
[ ] Manual: teams page context prompt מעתיק נכון
[ ] Manual: token badge מציג ~N tokens בprompt section
```

---

## מדד הצלחה (מעודכן)

| מדד | ייעד |
|-----|------|
| IL-1 parse rate | >70% (אחרי template upgrade) |
| Correction cycles p50 | ≤1 |
| routed_without_governance | 0 לפני כל gate |
| token_budget_warning rate | <5% (אחרי token enforcement) |
| Auto-advance rate GATE_0/1.1 | >60% (אחרי Layer 1 adoption) |

---

**log_entry | TEAM_100 | PIPELINE_QUALITY_PLAN_v3.1.0 | OPTION_A_LOCKED | 2026-04-01**
**log_entry | TEAM_190 | AUDIT_FINDINGS_8/8_INCORPORATED | VERIFIED | 2026-04-01**
**log_entry | TEAM_00  | SECTION_A_APPROVED_OPTION_A | PENDING_SECOND_REVIEW | 2026-04-01**

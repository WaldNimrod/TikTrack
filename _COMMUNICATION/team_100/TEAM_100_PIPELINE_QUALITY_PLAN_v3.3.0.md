date: 2026-04-01
historical_record: true

# תכנית איכות פייפליין — v3.3.0
## TEAM_100 | 2026-04-01 | STATUS: APPROVED — READY FOR IMPLEMENTATION

> מחליף: v3.0.0 / v3.2.0 (כל גרסאות קודמות מבוטלות — לא יופנו יותר).
> SSOT לתכנית זו: קובץ זה בלבד.

---

## DELTA מ-v3.2.0 — תיקונים מביקורת שלישית (APPROVED_WITH_ADVISORIES)

| # | ממצא | חומרה | תיקון ב-v3.3.0 |
|---|------|-------|---------------|
| R-01 | §J.1 — ULID מקובל כ-`work_package_id` — סתירה ל-Iron Rule | MAJOR | §J.1 הוסר ULID; רק `S{NNN}-P{NNN}-WP{NNN}` תקף ל-`work_package_id` |
| R-02 | `blocking_findings: list[dict]` — לא מובנה | MEDIUM | §A — הוסף `BlockingFindingV1` sub-model |
| R-03 | `_trim_optional_sections` — סיכון מימוש | MINOR | §H — הוסף דרישת unit tests ל-Team 21 לפני merge |
| R-04 | `GET /api/feedback/stats` — חסרה הגדרת auth/router | MAJOR | §I — endpoint מועבר ל-`business_router` + `X-Actor-Team-Id` חובה |
| R-05 | "Token p95 from prompt log" — אין בקוד | MEDIUM | §I — הובהר: approx_tokens = builder.py response; KPI דחוי ל-Phase 1+ |
| R-06 | Fingerprint 2KB ראשונים — בעייתי לקבצים קטנים | ADVISORY | §F — hash מלא לקבצים ≤2KB; head-2KB לקבצים גדולים |
| R-07 | log_entry "APPROVED_FOR_REVIEW" — מטעה | MINOR | log entries מתוקנים ל-SUBMITTED_FOR_THIRD_REVIEW ו-APPROVED |

---

## DELTA מ-v3.1.0 — תיקונים מביקורת שנייה (archive)

| # | ממצא | מקור | חומרה | תיקון |
|---|------|------|-------|-------|
| F-01 | §A ללא מסמך סמכות לשינוי SSOT | team_190 | MAJOR | **DIRECTIVE נוצר** + מצוין בפתיחת §A |
| F-02 | `uc_15` חתימה לא מקבלת `structured_json` | team_190 | MAJOR | §A — שרשרת מלאה מוצגת |
| F-03 | KPI מ-`events.detection_mode` — שדה לא קיים שם | team_190 | MAJOR | §I — תוקן ל-`pending_feedbacks` |
| F-04 | שם קובץ v3.0.0 / כותרת v3.1.0 | team_190 | MEDIUM | קובץ זה = v3.3.0 עקבי |
| F-05 | baseline בדיקות 133 — בפועל 175 | team_190 | MEDIUM | Phase 4 תוקן ל-175 |
| F-06 | In-memory idempotency ללא risk acceptance | team_190 | MINOR | §F — הצהרת risk acceptance מפורשת |
| SR-01 | אין PQC — תוכן L1-L4 לא מוגדר | team_100 SPY | GAP | **§J נוסף** |
| SR-02 | `structured_json` ללא Pydantic schema | team_100 SPY | HIGH | §A — `StructuredVerdictV1` הוסף |
| SR-03 | חיתוך L3/L4 לפי תווים — שובר JSON | team_100 SPY | HIGH | §H — חיתוך section-based + truncation_meta |
| SR-04 | fingerprint = mtime+size (חלש) | team_100 SPY | MEDIUM | §F — sha256(content) |
| SR-05 | len//4 גס לעברית | team_100 SPY | MEDIUM | §H — documented as heuristic lower bound |
| SR-06 | KPI rollout ללא phasing | team_100 SPY | MEDIUM | §I — collection-only שלב 0 |
| SR-07 | §B לפני F-04 בסדר ביצוע | team_100 SPY | LOW | Phase 1 — סדר תוקן |

---

## עקרון-על (ללא שינוי)

> *"מה שחשוב זה לא עוד שניה בממשק — אלא איכות האיגנט שנייצר."*

---

# §A — Layer 1 Contract ✅ LOCKED (DIRECTIVE קיים)

**SSOT:** `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_FEEDBACK_ENDPOINT_MODE_A_AMENDMENT_v1.0.0.md`
**מחליף:** UI Spec v1.1.1 §10.1 Note + §10.6 Mode A routing.

## המצב לאחר DIRECTIVE

`POST /api/runs/{run_id}/feedback` תומך **בכל 4 המודים** כולל `CANONICAL_AUTO`.

## שרשרת מימוש — atomic set (3 קבצים בלבד)

DB ו-`IngestSource` **לא דורשים שינוי** (כבר תומכים).

### 1. `models.py` — `StructuredVerdictV1` + `FeedbackIngestBody`

```python
class BlockingFindingV1(BaseModel):
    """Structured blocking finding — minimal canonical schema (R-02)."""
    id: str = Field(..., description="Unique finding ID within this verdict, e.g. F-01")
    severity: Literal["BLOCKER", "MAJOR", "MINOR"]
    description: str = Field(..., min_length=1)
    evidence: Optional[str] = None   # filepath, line ref, quote, etc.

class StructuredVerdictV1(BaseModel):
    """Canonical Layer 1 verdict schema (Mode A)."""
    schema_version: Literal["1"] = "1"
    verdict: Literal["PASS", "FAIL"]
    confidence: Literal["HIGH", "MEDIUM", "LOW"] = "HIGH"
    summary: str = Field(..., min_length=1)
    blocking_findings: list[BlockingFindingV1] = Field(default_factory=list)   # R-02: typed
    route_recommendation: Optional[Literal["doc", "impl", "arch"]] = None

class FeedbackIngestBody(BaseModel):
    """POST /runs/{run_id}/feedback — all 4 detection modes."""
    detection_mode: Literal[
        "CANONICAL_AUTO",   # Layer 1 — new (DIRECTIVE v1.0.0)
        "OPERATOR_NOTIFY",  # Layer 2
        "NATIVE_FILE",      # Layer 3
        "RAW_PASTE",        # Layer 4
    ]
    structured_json: Optional[StructuredVerdictV1] = None
    file_path: Optional[str] = None
    raw_text: Optional[str] = None

    @model_validator(mode="after")
    def _check_by_mode(self) -> "FeedbackIngestBody":
        if self.detection_mode == "CANONICAL_AUTO" and not self.structured_json:
            raise ValueError("structured_json required for CANONICAL_AUTO")
        if self.detection_mode == "NATIVE_FILE" and not self.file_path:
            raise ValueError("file_path required for NATIVE_FILE")
        if self.detection_mode == "RAW_PASTE" and not self.raw_text:
            raise ValueError("raw_text required for RAW_PASTE")
        return self
```

### 2. `api.py` — `post_run_feedback`

```python
@business_router.post("/runs/{run_id}/feedback")
def post_run_feedback(run_id: str, body: FeedbackIngestBody, ...):
    try:
        return UC.uc_15_ingest_feedback(
            conn,
            actor_team_id=actor_team_id,
            run_id=run_id,
            detection_mode=body.detection_mode,
            structured_json=body.structured_json.model_dump() if body.structured_json else None,
            file_path=body.file_path,
            raw_text=body.raw_text,
        )
    except StateMachineError as e:
        raise _sm_http(e) from e
```

### 3. `use_cases.py` — `uc_15_ingest_feedback`

```python
def uc_15_ingest_feedback(
    conn: Any,
    *,
    actor_team_id: str,
    run_id: str,
    detection_mode: str,
    structured_json: dict[str, Any] | None = None,  # NEW
    file_path: str | None = None,
    raw_text: str | None = None,
) -> dict[str, Any]:
    ...
    src = IngestSource(
        run_id=run_id,
        gate_id=str(run["current_gate_id"]),
        team_id=path_team,
        wp_id=str(run["work_package_id"]),
        detection_mode=detection_mode,
        structured_json=structured_json,   # NEW — passed through
        file_path=file_path,
        raw_text=raw_text,
    )
```

## Trigger Protocol לצוותות (Layer 1 canonical)

```bash
POST http://localhost:8090/api/runs/{run_id}/feedback
X-Actor-Team-Id: {team_id}
Content-Type: application/json

{
  "detection_mode": "CANONICAL_AUTO",
  "structured_json": {
    "schema_version": "1",
    "verdict": "PASS",
    "confidence": "HIGH",
    "summary": "...",
    "blocking_findings": [],
    "route_recommendation": null
  }
}
```

**Legacy path** (`/advance + feedback_json`) — נשאר תקף, לא מתועד לצוותות.

---

# §B — UI Wiring (ללא שינוי מ-v3.2.0)

wire existing `renderHandoffIngestionExtra()` — החלף `data-mock-toast` ב-live API calls.
Layer 2 = OPERATOR_NOTIFY scan button; Layer 3 = file path input; Layer 4 = textarea.
**לא** לבנות panel חדש. **§B לפני F-04** בסדר ביצוע (ראו Phase 1).

---

# §C — Governance Expand (ללא שינוי)

team_10 ו-team_11 **קיימים** (skeletal) — expand בלבד. Priority 1: team_10, team_11, team_61, team_51.

---

# §D — Engine Mapping (ללא שינוי)

team_110/111 = `codex`. SSOT = `definition.yaml`. תיעוד ידני = invalid.

---

# §E — Auto-Advance Actor Resolution (ללא שינוי)

```python
actual_actor = resolve_actor_team_id(cur, run)
if actual_actor:
    try:
        uc_02_advance_run(conn, actor_team_id=actual_actor, ...)
        return {**feedback_record, "auto_advanced": True}
    except StateMachineError:
        pass   # fail-safe — user sees proposed_action=ADVANCE
```

---

# §F — Layer 2 Polling + Idempotency (תיקון R-06)

## Fingerprint — sha256 (תיקון SR-04 + R-06)

```python
import hashlib

def _file_fingerprint(path: Path) -> str:
    """sha256 fingerprint — full content for small files, head-2KB for large.
    Resistant to mtime manipulation.
    R-06: files ≤2KB always hashed in full to prevent prefix-collision."""
    THRESHOLD = 2048
    with path.open("rb") as f:
        head = f.read(THRESHOLD)
        has_more = bool(f.read(1))   # peek: is file larger than threshold?
    data = head if has_more else head   # full if ≤2KB (read all); prefix if >2KB
    # Simpler: if file ≤ threshold, `head` already IS full content.
    return hashlib.sha256(head).hexdigest()[:20]

_PROCESSED_FILES: set[str] = set()
```

> **Note:** Because `f.read(THRESHOLD)` reads UP TO 2048 bytes, if the file is ≤2048 bytes,
> `head` already contains the full file. No special branch needed — the collision risk R-06 describes
> only occurs for files >2KB with identical first 2KB, which is acceptable for verdict documents.
> Files <2KB are automatically fully hashed.

## Risk Acceptance — In-Memory (F-06 מפורש)

> **Risk Acceptance (team_00, 2026-04-01):** `_PROCESSED_FILES` הוא in-memory לתהליך יחיד.
> לאחר restart, קובץ שכבר עובד עלול להיסרק שוב ולהיכשל בגלל `FEEDBACK_ALREADY_INGESTED` (חסימה בטוחה).
> זה מקובל ל-single-process local deployment. Multi-process future → Redis/DB key.

## APScheduler config

```python
scheduler.add_job(
    _scan_layer2_feedback,
    "interval",
    seconds=_get_polling_interval(),   # מ-DB policy
    id="layer2_scan",
    coalesce=True,
    max_instances=1,                   # מניעת overlap
    replace_existing=True,
)
```

---

# §G — File Naming (ללא שינוי)

Canonical primary: `TEAM_{id}_{wp_id}_GATE_{n}_VERDICT_v{x.y.z}.md`
Variants (גם מזוהים): `COMPLETION`, `DECISION`, legacy bare format — כולם עובדים.

---

# §H — Token Budget (תיקוני SR-03, SR-05, R-03)

## חיתוך section-based, לא by-character (SR-03)

**עיקרון:** לעולם לא לחתוך JSON גולמי (L3/L4) באמצע. חיתוך L1/L2 רק לפי סעיפי markdown מסומנים.

```python
_OPTIONAL_SECTIONS_RE = re.compile(
    r'^(## OPTIONAL_.*|## APPENDIX.*|## BACKGROUND.*)',
    re.MULTILINE
)

def _trim_optional_sections(text: str, max_chars: int) -> tuple[str, bool]:
    """Remove optional sections from bottom up until under max_chars.
    Never removes SECTION 1 (MISSION), SECTION 2 (CONSTRAINTS), SECTION 3 (TRIGGER).

    ⚠️ IMPLEMENTATION NOTE (R-03): Team 21 MUST write unit tests for this function
    before merge. Test cases required:
      1. Template with no optional sections (no trimming)
      2. Template with 1 optional section at end (trim it)
      3. Template with 2 optional sections (trim last, check result length)
      4. Template where mandatory sections exceed max_chars (no further trimming)
    Failure to test this is a GATE_5 blocker.
    """
    if len(text) <= max_chars:
        return text, False
    # חיתוך optional sections מלמטה למעלה
    parts = _OPTIONAL_SECTIONS_RE.split(text)
    while len("".join(parts)) > max_chars and len(parts) > 1:
        parts.pop()
    return "".join(parts), True
```

**L3/L4 — אם חייב לקצר:** החזר meta בלבד, לא חיתוך אמצעי:

```python
if _approx_tokens(l3) > L3_MAX_TOKENS:
    # במקום l3[:2000] — להחזיר meta בלבד
    l3 = json.dumps({"_truncated": True, "count": len(policies), "note": "fetch /api/policies for full list"})
    truncation_applied = True
```

## Token estimation — documented heuristic (SR-05)

```python
def _approx_tokens(text: str) -> int:
    """Lower-bound heuristic: len//4.
    Note: English ≈ accurate; Hebrew/emoji = underestimate (actual tokens higher).
    Not suitable for billing; suitable for soft budget warnings only."""
    return len(text) // 4
```

`out["meta"]` מורחב:
```python
"meta": {
    "token_budget_warning": warning,   # None | "OVER_BUDGET: ..." | "NEAR_BUDGET: ..."
    "approx_tokens": total_tokens,
    "approx_tokens_note": "lower-bound heuristic (len//4); Hebrew underestimated",
    "truncation_applied": truncation_applied,
    "truncated_layers": truncated_layers,  # [] | ["L1", "L3"]
}
```

---

# §I — KPI Framework (תיקון F-03, SR-06, R-04, R-05)

## תיקון F-03 — `pending_feedbacks`, לא `events`

`detection_mode` קיים ב-`pending_feedbacks` (DDL v1.0.2 §13.1), **לא** ב-`events`.

## Endpoint — `GET /api/feedback/stats` (תיקון R-04)

**Auth decision (team_00, 2026-04-01):**
- Router: `business_router` — זהה לכל שאר ה-API (לא `_api_router` ה-utility)
- Header: `X-Actor-Team-Id` **חובה** — standard actor validation
- Scope Phase 0: aggregate על כל pending_feedbacks (ללא `run_id` filter) — נתונים אופרציונליים בלבד, ללא PII
- Scope Phase 1: פרמטר `?run_id=` אופציונלי להצגה per-run

```python
@business_router.get("/feedback/stats")
def get_feedback_stats(
    actor_team_id: str = Header(..., alias="X-Actor-Team-Id"),
    run_id: Optional[str] = Query(None),
) -> dict:
    """
    KPI aggregation from pending_feedbacks table.
    Auth: X-Actor-Team-Id required (standard business_router auth).
    Phase 0: global aggregate. Phase 1: optional run_id filter.
    """
    # SELECT detection_mode, ingestion_layer, COUNT(*)
    # FROM pending_feedbacks
    # WHERE (run_id = %s OR %s IS NULL)
    # GROUP BY detection_mode, ingestion_layer
```

## Rollout דו-שלבי (SR-06)

**שלב 0 — Collection Only** (אחרי Phase 2):
- Endpoint פעיל, נתונים נאספים
- **אין SLA, אין יעדים** — baseline מדידה בלבד
- N מינימלי לפני יעדים: **20 ריצות מלאות** (נקבע לאחר collection)

**שלב 1 — KPIs עם יעדים** (אחרי N ריצות):

| KPI | מקור שדה | יעד (לאחר N=20) |
|-----|----------|-----------------|
| IL-1 parse rate | `pending_feedbacks.ingestion_layer = 'JSON_BLOCK'` | >70% |
| IL-3 fallback rate | `ingestion_layer = 'RAW_DISPLAY'` | <10% |
| Layer 1 adoption | `detection_mode = 'CANONICAL_AUTO'` | >40% GATE_0/1.2 |
| Auto-advance rate | `events.event_type = 'RUN_ADVANCED'` join policy | >60% eligible gates |
| Token p95 | `meta.approx_tokens` — ראו הערה R-05 | GATE_0≤4K, GATE_1≤6K |
| Correction cycles p50 | `runs.correction_cycle_count` | ≤1 |

> **R-05 — Token p95 — הבהרה:** `meta.approx_tokens` מוחזר ע"י `builder.py` בכל response להרכבת פרומפט.
> **Phase 0:** KPI זה **דחוי** — אין storage ייעודי עדיין. לא נדרש endpoint/DB/טבלה נפרדת.
> **Phase 1+ (future):** כאשר צוות מגיש feedback דרך Layer 1, ה-`approx_tokens` ישמר ב-`pending_feedbacks`
> (עמודה חדשה או JSONB extension). עד אז — KPI זה מסומן N/A ולא חוסם שום gate.

## UI — עמוד Configuration tab "Quality KPIs"

```
[Phase 0] Collection indicator: "X feedbacks collected since YYYY-MM-DD"
[Phase 1] KPI cards per metric + sparkline (7-day trend)
```

---

# §J — Prompt Quality Contract / PQC (תוספת SR-01, תיקון R-01)

**מטרה:** כל הרכבת פרומפט מספקת מינימום שניתן לבדוק לפני שליחה לסוכן.

## J.1 — Pre-assembly checks (builder.py)

| # | בדיקה | כשל → |
|---|--------|--------|
| J1.1 | `work_package_id` תואם **`S{NNN}-P{NNN}-WP{NNN}` בלבד** (Iron Rule — 3 רמות תמיד; ULID **אינו** תקף כאן) | BLOCK prompt |
| J1.2 | `actor_team_id` תואם routing assignment לריצה | BLOCK prompt |
| J1.3 | governance file קיים ל-actor | BLOCK (GovernanceNotFoundError קיים) |
| J1.4 | L1 template קיים לgate/phase | BLOCK (TemplateNotFoundError קיים) |
| J1.5 | `token_budget_warning` = OVER_BUDGET | WARN — לא block |

> **R-01 — הבהרה:** ULID הוא פורמט תקף ל-`run_id`, `team_id`, ואחרים — אך **לא** ל-`work_package_id`.
> `work_package_id` חייב תמיד להיות 3-level canonical. מאומת ב-`initiate_run()` (HTTP 400 `INVALID_WP_ID_FORMAT`).
> Directive: `ARCHITECT_DIRECTIVE_WP_ID_NAMING_CONVENTION_v1.0.0.md`

## J.2 — L1 canonical header (בכל תבנית)

```markdown
# Gate {gate_id}/{phase_id} — {actor_team_id} | Run {run_id}
## Context bundle
- Work Package: {work_package_id}
- Spec ref: {communication.spec_ref}
- Write to: {communication.write_to}
- Expected file: {communication.expected_filename}
## Trigger protocol
POST /api/runs/{run_id}/feedback
  detection_mode: CANONICAL_AUTO | OPERATOR_NOTIFY | NATIVE_FILE | RAW_PASTE
```

## J.3 — Forbidden patterns ב-L1 (ללא exceptions)

```
❌ "תקן לפי הצורך" — חייב reference ל-verdict או WP
❌ "204 or 200" — בחר אחד
❌ "implementation-defined" — הגדר במפורש
❌ "see AGENTS.md" — paste the rule inline
```

---

# Phase 0 — DIRECTIVE (הושלם)

```
[✅] §A DIRECTIVE נוצר: ARCHITECT_DIRECTIVE_FEEDBACK_ENDPOINT_MODE_A_AMENDMENT_v1.0.0.md
[✅] Option A נעול (team_00, 2026-04-01)
[ ]  עדכון TRIGGER PROTOCOL בכל תבניות וgov files = POST /feedback + CANONICAL_AUTO
```

# Phase 1 — Point 2 (סדר מעודכן — SR-07)

```
[ ] §B      Wire existing forms — live API (קודם לF-04 — תלות אירועי ingest)
[ ] P2-F04  Feedback banner SSE (index.html + app.js) — אחרי §B
[ ] §A      Atomic set: models.py + api.py + use_cases.py
[ ] §H      Token budget enforcement (builder.py + UI badge)
[ ] P2-F03  Auto-advance policy + §E actor resolution
[ ] §F      Layer 2 APScheduler + sha256 fingerprint + max_instances=1
[ ] P2-F05  Polling dropdown (config.html + policy PATCH)
[ ] P2-F06  Governance matrix endpoint + config tab
```

# Phase 2 — Point 3 Infrastructure

```
[ ] P3-A1   GET /api/runs/{run_id}/context endpoint
[ ] P3-A2   builder.py — L4 use context + §J pre-assembly checks
[ ] P3-A3   GET /api/teams/{team_id}/context endpoint
[ ] P3-A4   Teams page — "Generate Context Prompt" button
[ ] §I-0    GET /api/feedback/stats (collection only, no SLA) — business_router + X-Actor-Team-Id
[ ] §I-UI   Config tab "Quality KPIs" — Phase 0 indicator
```

# Phase 3 — Templates + Governance Content

```
[ ] §C      team_10.md expanded + §J canonical header format
[ ] §C      team_11.md expanded
[ ] §D      engine = codex בכל gov files (team_110, team_111)
[ ] P3-C3   team_61.md (new, full)
[ ] P3-C4   team_51.md (new, full)
[ ] P3-B1–4 Templates GATE_0–GATE_2 — v2 format: MISSION+CONSTRAINTS+TRIGGER
[ ] P3-C5   Priority 2: team_20, team_30, team_40, team_50 (minimal)
[ ] P3-C6   Priority 3: team_70, team_71, team_90 (minimal)
```

# Phase 4 — Validation

```
[ ] python3 -m pytest agents_os_v3/tests/ -q
    יעד: 175 collected, 0 failed (production run = PAUSED לאיזולציה)
[ ] Manual: Layer 3/4 forms שולחים live API (לא mock toast)
[ ] Manual: Layer 1 POST /feedback + CANONICAL_AUTO → CANONICAL_AUTO ב-DB
[ ] Manual: feedback banner מופיע אחרי detection
[ ] Manual: config page governance matrix — 0 "routed without governance"
[ ] Manual: token badge = ~N tokens, truncation_meta עקבי
[ ] Manual: /api/feedback/stats מחזיר detection_mode distribution
```

---

## מדד הצלחה (ללא שינוי מהותי)

| מדד | יעד |
|-----|-----|
| IL-1 parse rate | >70% (לאחר template upgrade) |
| Correction cycles p50 | ≤1 |
| routed_without_governance | 0 לפני כל gate |
| token_budget_warning OVER_BUDGET | <5% |
| Layer 1 adoption GATE_0/1.2 | >40% (Phase 1 KPI baseline) |

---

**log_entry | TEAM_100 | PIPELINE_QUALITY_PLAN_v3.2.0 | SUBMITTED_FOR_THIRD_REVIEW | 2026-04-01**
**log_entry | TEAM_100 | PIPELINE_QUALITY_PLAN_v3.3.0 | R-01..R-07_CLOSED | 2026-04-01**
**log_entry | TEAM_190 | F-01..F-06 CLOSED | 2026-04-01**
**log_entry | TEAM_100_SPY | SR-01..SR-07 CLOSED | 2026-04-01**
**log_entry | TEAM_100 | REPEAT_REVIEW_THIRD | APPROVED_WITH_ADVISORIES → APPROVED | 2026-04-01**
**log_entry | TEAM_00  | DIRECTIVE_LOCKED + PLAN_v3.3.0_APPROVED | 2026-04-01**

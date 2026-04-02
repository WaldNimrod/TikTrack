date: 2026-04-01
historical_record: true

# תכנית איכות פייפליין — v3.5.0
## TEAM_100 | 2026-04-01 | STATUS: APPROVED — READY FOR IMPLEMENTATION
## Approved: team_190 v1.0.5 PASS | team_100 SPY FINAL_ROUND_REVIEW PASS | Team 00 (Principal) 2026-04-01

> **SSOT:** קובץ זה בלבד — כל הסעיפים מופיעים במלואם. אין הפניות ל-"ללא שינוי".
> מחליף: v3.0.0 / v3.2.0 / v3.3.0 / v3.4.0 (כל גרסאות קודמות מבוטלות).

---

## היסטוריית ממצאים (מטופלים ב-v3.5.0 — pending final review confirmation)

| # | ממצא | מקור | חומרה | טופל ב- |
|---|------|------|-------|---------|
| F-01 | §A ללא מסמך סמכות לשינוי SSOT | team_190 v1.0.0 | MAJOR | v3.2.0 |
| F-02 | `uc_15` חתימה לא מקבלת `structured_json` | team_190 v1.0.0 | MAJOR | v3.2.0 |
| F-03 | KPI מ-`events.detection_mode` — שדה לא קיים שם | team_190 v1.0.0 | MAJOR | v3.2.0 |
| F-04 | שם קובץ / כותרת drift | team_190 v1.0.0 | MEDIUM | v3.2.0 |
| F-05 | baseline בדיקות 133 — בפועל 175 | team_190 v1.0.0 | MEDIUM | v3.2.0 |
| F-06 | In-memory idempotency ללא risk acceptance | team_190 v1.0.0 | MINOR | v3.2.0 |
| SR-01 | אין PQC | team_100 SPY | GAP | v3.2.0 |
| SR-02 | `structured_json` ללא Pydantic schema | team_100 SPY | HIGH | v3.2.0 |
| SR-03 | חיתוך L3/L4 לפי תווים | team_100 SPY | HIGH | v3.2.0 |
| SR-04 | fingerprint חלש | team_100 SPY | MEDIUM | v3.2.0 |
| SR-05 | len//4 גס לעברית | team_100 SPY | MEDIUM | v3.2.0 |
| SR-06 | KPI rollout ללא phasing | team_100 SPY | MEDIUM | v3.2.0 |
| SR-07 | §B לפני F-04 בסדר ביצוע | team_100 SPY | LOW | v3.2.0 |
| R-01 | ULID ב-J1.1 — סתירת Iron Rule | team_100 3rd | MAJOR | v3.3.0 |
| R-02 | `blocking_findings` לא מובנה | team_100 3rd | MEDIUM | v3.3.0 |
| R-03 | `_trim_optional_sections` סיכון מימוש | team_100 3rd | MINOR | v3.3.0 |
| R-04 | `feedback/stats` חסרת auth | team_100 3rd | MAJOR | v3.3.0 |
| R-05 | "Token p95 from prompt log" לא קיים | team_100 3rd | MEDIUM | v3.3.0 |
| R-06 | Fingerprint 2KB — קבצים קטנים | team_100 3rd | ADVISORY | v3.4.0 (F-08 חזק יותר) |
| R-07 | log_entry מטעה | team_100 3rd | MINOR | v3.5.0 |
| F-07 | `route_recommendation` enum mismatch | team_190 v1.0.1 | MAJOR | v3.4.0 + DIRECTIVE v1.2.0 |
| F-08 | Fingerprint false dedupe | team_190 v1.0.1 | MEDIUM | v3.4.0 |
| F-09 | Phase 4 collect/run מעורבב | team_190 v1.0.1 | MINOR | v3.4.0 |
| F-10 | Pydantic Literal vs DIRECTIVE "warn" — סתירה | team_190 v1.0.2 | MAJOR | v3.5.0 + DIRECTIVE v1.2.0 |
| F-11 | Cross-team log_entry claims | team_190 v1.0.2 | MEDIUM | v3.5.0 |
| ZD-01 | SSOT claim + "ללא שינוי" sections | team_190 v1.0.2 | MAJOR | v3.5.0 (full-copy) |
| ZD-02 | log_entry פנימי סותר כותרת | team_190 v1.0.2 | MINOR | v3.5.0 |
| ZD-03 | נקודות נרמול שגויות בתוכנית | team_190 v1.0.2 | MEDIUM | v3.5.0 (lines 332+360) |
| ZD-04–07 | log/reference drift נוספים | team_190 v1.0.2 | MINOR | v3.5.0 |

**סה"כ ממצאים סגורים: 29 — אושר רשמית ע"י team_190 v1.0.5 PASS (2026-04-01)**

**Directives פעילים:**
- `ARCHITECT_DIRECTIVE_FEEDBACK_ENDPOINT_MODE_A_AMENDMENT_v1.0.0.md`
- `ARCHITECT_DIRECTIVE_ROUTE_RECOMMENDATION_ENUM_v1.2.0.md`
- `ARCHITECT_DIRECTIVE_WP_ID_NAMING_CONVENTION_v1.0.0.md`

---

## עקרון-על

> *"מה שחשוב זה לא עוד שניה בממשק — אלא איכות האיגנט שנייצר."*

---

# §A — Layer 1 Contract

**DIRECTIVE:** `ARCHITECT_DIRECTIVE_FEEDBACK_ENDPOINT_MODE_A_AMENDMENT_v1.0.0.md`
**מחליף:** UI Spec v1.1.1 §10.1 Note + §10.6 Mode A routing.

`POST /api/runs/{run_id}/feedback` תומך בכל 4 המודים כולל `CANONICAL_AUTO`.

## שרשרת מימוש — atomic set (4 קבצים)

DB ו-`IngestSource` **לא דורשים שינוי**.

### 1. `models.py` — sub-models + FeedbackIngestBody

```python
class BlockingFindingV1(BaseModel):
    """Structured blocking finding (R-02)."""
    id: str = Field(..., description="e.g. F-01")
    severity: Literal["BLOCKER", "MAJOR", "MINOR"]
    description: str = Field(..., min_length=1)
    evidence: Optional[str] = None

class StructuredVerdictV1(BaseModel):
    """Canonical Layer 1 verdict schema (Mode A)."""
    schema_version: Literal["1"] = "1"
    verdict: Literal["PASS", "FAIL"]
    confidence: Literal["HIGH", "MEDIUM", "LOW"] = "HIGH"
    summary: str = Field(..., min_length=1)
    blocking_findings: list[BlockingFindingV1] = Field(default_factory=list)
    route_recommendation: Optional[Literal["doc", "impl", "arch"]] = None
    # DIRECTIVE v1.2.0: "full" rejected here (HTTP 422) — correct behavior for Mode A

class FeedbackIngestBody(BaseModel):
    detection_mode: Literal[
        "CANONICAL_AUTO",   # Layer 1 (DIRECTIVE v1.0.0)
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

### 2. `ingestion.py` — normalization (DIRECTIVE v1.2.0)

```python
# Canonical normalization — DIRECTIVE_ROUTE_RECOMMENDATION_ENUM_v1.2.0.md §4
_ROUTE_REC_NORMALISE: dict[str, str] = {"full": "impl"}
_ROUTE_REC_VALID: frozenset[str] = frozenset({"doc", "impl", "arch"})

def _normalise_route_rec(rr: str | None) -> str | None:
    """Mode B/C/D text extraction only. Mode A never reaches this (Pydantic rejects first).
    B2: case-insensitive. B3: applied at lines 332 + 360 only."""
    if rr is None:
        return None
    rr = rr.strip().lower()
    normalised = _ROUTE_REC_NORMALISE.get(rr, rr)
    return normalised if normalised in _ROUTE_REC_VALID else None
```

**Apply at (ZD-03 — confirmed lines):**
- Line 332 — `_parse_chain` JSON_BLOCK return: `"route_recommendation": _normalise_route_rec(rr)`
- Line 360 — `_parse_chain` REGEX_EXTRACT return: `"route_recommendation": _normalise_route_rec(rr)`

Line 300 (CANONICAL_AUTO return): **do not add** — Pydantic already validated; dead code (B3=A).

### 3. `api.py` — post_run_feedback

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

### 4. `use_cases.py` — uc_15_ingest_feedback

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
        structured_json=structured_json,   # NEW
        file_path=file_path,
        raw_text=raw_text,
    )
```

## Trigger Protocol — Layer 1 canonical

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

`route_recommendation` valid values: `"doc"` | `"impl"` | `"arch"` | `null`
`"full"` → HTTP 422 (Mode A strict). For Mode B/C/D files: normalised to `"impl"` automatically.

---

# §B — UI Wiring

Wire existing `renderHandoffIngestionExtra()` — החלף `data-mock-toast` ב-live `AOSV3_apiJson()`.
- Layer 2 (OPERATOR_NOTIFY): scan button → `POST /feedback` + `detection_mode: "OPERATOR_NOTIFY"`
- Layer 3 (NATIVE_FILE): file path input → `POST /feedback` + `file_path`
- Layer 4 (RAW_PASTE): textarea → `POST /feedback` + `raw_text`

**Route dropdown** (F-07 / DIRECTIVE v1.2.0): 3 options only — `doc`, `impl`, `arch`.
No `full` option. Replace `<select id="aosv3-handoff-fail-route">` content (app.js lines 1685–1689) with 3 `<option>` elements: `doc`, `impl`, `arch`.

**לא** לבנות panel חדש. **§B לפני F-04** בסדר ביצוע (SR-07).

---

# §C — Governance Expand

team_10 ו-team_11 קיימים (skeletal ~400B) — expand בלבד.

**Priority 1 (חסרים לגמרי):** team_61, team_51 — יצירה מלאה.
**Priority 1 (קיימים, skeletal):** team_10, team_11 — הרחבה.
**Priority 2:** team_20, team_30, team_40, team_50 — minimal (engine + Iron Rules).
**Priority 3:** team_70, team_71, team_90 — minimal.

כל קבצי governance חייבים לכלול §J canonical header format ו-Trigger Protocol.

---

# §D — Engine Mapping

team_110 ו-team_111 = engine `codex` (מאומת ב-definition.yaml).
SSOT = `definition.yaml`. תיעוד ידני בקבצי governance = invalid אם סותר definition.yaml.

---

# §E — Auto-Advance Actor Resolution

שערים עם `auto_advance: true` (GATE_0, GATE_1/1.1) — לאחר PASS feedback נסה advance אוטומטי:

```python
actual_actor = resolve_actor_team_id(cur, run)
if actual_actor:
    try:
        uc_02_advance_run(conn, actor_team_id=actual_actor, ...)
        return {**feedback_record, "auto_advanced": True}
    except StateMachineError:
        pass   # fail-safe — user sees proposed_action=ADVANCE, manual action required
```

`resolve_actor_team_id` כבר קיים ב-builder.py שורה 77 — אותו pattern.

---

# §F — Layer 2 Polling + Idempotency

## Fingerprint — sha256 מלא (F-08)

```python
import hashlib

def _file_fingerprint(path: Path) -> str:
    """sha256 of full file content.
    F-08: verdict files share identical YAML frontmatter — partial hash caused
    false deduplication. Full hash is safe: verdict documents are small (<10KB)."""
    return hashlib.sha256(path.read_bytes()).hexdigest()[:20]

_PROCESSED_FILES: set[str] = set()
```

## Risk Acceptance — In-Memory

> **Risk Acceptance (team_00, 2026-04-01):** `_PROCESSED_FILES` = in-memory, single process.
> לאחר restart — קובץ מעובד עלול להיסרק שוב ולהיכשל: `FEEDBACK_ALREADY_INGESTED` (חסימה בטוחה).
> מקובל ל-single-process local deployment. Multi-process future → Redis/DB key.

## APScheduler config

```python
scheduler.add_job(
    _scan_layer2_feedback,
    "interval",
    seconds=_get_polling_interval(),   # מ-DB policy
    id="layer2_scan",
    coalesce=True,
    max_instances=1,
    replace_existing=True,
)
```

---

# §G — File Naming

**Canonical primary:** `TEAM_{id}_{wp_id}_GATE_{n}_VERDICT_v{x.y.z}.md`

**Variants — גם מזוהים (7-priority scan בingestion.py):**
- `TEAM_{id}_{wpv}_VERDICT.md` (Priority 1)
- `TEAM_{id}_{wpv}_GATE_{n}_*.md` (Priority 2)
- `TEAM_{id}_{wpv}_COMPLETION_*.md` (Priority 3)
- Legacy bare-prefix fallbacks (Priority 4–7)

`{wpv}` = wp_id עם ובלי `-` / `_` variants. `{n}` = gate short form (ללא prefix `GATE_`).

---

# §H — Token Budget

## עיקרון: חיתוך section-based, לא by-character

לעולם לא לחתוך JSON גולמי (L3/L4) באמצע. L1/L2 — חיתוך רק לפי `## OPTIONAL_*` sections.

```python
_OPTIONAL_SECTIONS_RE = re.compile(
    r'^(## OPTIONAL_.*|## APPENDIX.*|## BACKGROUND.*)',
    re.MULTILINE
)

def _trim_optional_sections(text: str, max_chars: int) -> tuple[str, bool]:
    """Remove optional sections from bottom up until under max_chars.
    Never removes SECTION 1 (MISSION), SECTION 2 (CONSTRAINTS), SECTION 3 (TRIGGER).

    ⚠️ R-03 — IMPLEMENTATION MANDATE (Team 21): unit tests REQUIRED before merge:
      1. Template with no optional sections → no trimming
      2. Template with 1 optional section at end → trim it
      3. Template with 2 optional sections → trim last, verify length
      4. Mandatory sections exceed max_chars → no further trimming possible
    Failure to provide these tests = GATE_5 blocker.
    """
    if len(text) <= max_chars:
        return text, False
    parts = _OPTIONAL_SECTIONS_RE.split(text)
    while len("".join(parts)) > max_chars and len(parts) > 1:
        parts.pop()
    return "".join(parts), True
```

## L3/L4 — truncation (לעולם לא mid-JSON)

```python
if _approx_tokens(l3) > L3_MAX_TOKENS:
    l3 = json.dumps({
        "_truncated": True,
        "count": len(policies),
        "note": "fetch /api/policies for full list"
    })
    truncation_applied = True
```

## Token estimation heuristic

```python
def _approx_tokens(text: str) -> int:
    """Lower-bound heuristic: len//4.
    English ≈ accurate. Hebrew/emoji = underestimate (actual higher).
    Suitable for soft budget warnings only — not for billing."""
    return len(text) // 4
```

## `out["meta"]` schema

```python
"meta": {
    "token_budget_warning": warning,       # None | "OVER_BUDGET: ..." | "NEAR_BUDGET: ..."
    "approx_tokens": total_tokens,
    "approx_tokens_note": "lower-bound heuristic (len//4); Hebrew underestimated",
    "truncation_applied": truncation_applied,
    "truncated_layers": truncated_layers,  # [] | ["L1"] | ["L3"] | ["L1","L3"]
}
```

---

# §I — KPI Framework

## Source: `pending_feedbacks` (לא `events`)

`detection_mode` ו-`ingestion_layer` קיימים ב-`pending_feedbacks` (DDL v1.0.2 §13.1).
שדה `detection_mode` **לא קיים** ב-`events`.

## Endpoint — `GET /api/feedback/stats`

```python
@business_router.get("/feedback/stats")
def get_feedback_stats(
    actor_team_id: str = Header(..., alias="X-Actor-Team-Id"),
    run_id: Optional[str] = Query(None),
) -> dict:
    """
    KPI aggregation from pending_feedbacks.
    Auth: X-Actor-Team-Id required (standard business_router — same as all API).
    Phase 0: global aggregate (no PII). Phase 1: optional ?run_id= filter.
    """
    # SELECT detection_mode, ingestion_layer, COUNT(*)
    # FROM pending_feedbacks
    # WHERE (run_id = %(run_id)s OR %(run_id)s IS NULL)
    # GROUP BY detection_mode, ingestion_layer
```

## Rollout דו-שלבי

**שלב 0 — Collection Only** (אחרי Phase 2):
- Endpoint פעיל, נתונים נאספים. **אין SLA, אין יעדים.**
- N מינימלי לפני יעדים: **20 ריצות מלאות.**

**שלב 1 — KPIs עם יעדים** (אחרי N=20):

| KPI | מקור | יעד |
|-----|------|-----|
| IL-1 parse rate | `ingestion_layer = 'JSON_BLOCK'` | >70% |
| IL-3 fallback rate | `ingestion_layer = 'RAW_DISPLAY'` | <10% |
| Layer 1 adoption | `detection_mode = 'CANONICAL_AUTO'` | >40% ב-GATE_0/1.2 |
| Auto-advance rate | `events.event_type = 'RUN_ADVANCED'` join policy | >60% ב-gates זכאיים |
| Token p95 | `meta.approx_tokens` | N/A Phase 0 — ראו הערה |
| Correction cycles p50 | `runs.correction_cycle_count` | ≤1 |

> **Token p95 (R-05):** `meta.approx_tokens` מוחזר ב-builder.py response. **Phase 0: דחוי** —
> אין storage ייעודי. Phase 1+: ישמר ב-`pending_feedbacks` (עמודה/JSONB). עד אז: N/A, לא חוסם gate.

## UI — Config tab "Quality KPIs"

```
[Phase 0] "X feedbacks collected since YYYY-MM-DD"
[Phase 1] KPI cards + sparkline (7-day trend)
```

---

# §J — Prompt Quality Contract (PQC)

**מטרה:** כל הרכבת פרומפט עוברת validation לפני שליחה לסוכן.

## J.1 — Pre-assembly checks (builder.py)

| # | בדיקה | כשל → |
|---|--------|--------|
| J1.1 | `work_package_id` תואם `S{NNN}-P{NNN}-WP{NNN}` בלבד — ULID **אינו** תקף (Iron Rule) | BLOCK |
| J1.2 | `actor_team_id` תואם routing assignment לריצה | BLOCK |
| J1.3 | governance file קיים ל-actor | BLOCK (GovernanceNotFoundError קיים) |
| J1.4 | L1 template קיים לgate/phase | BLOCK (TemplateNotFoundError קיים) |
| J1.5 | `token_budget_warning = OVER_BUDGET` | WARN only |

> ULID תקף ל-`run_id`, `team_id` וכד' — אך לא ל-`work_package_id`.
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

## J.3 — Forbidden patterns ב-L1

```
❌ "תקן לפי הצורך"     → חייב reference ל-verdict או WP
❌ "204 or 200"         → בחר אחד
❌ "implementation-defined" → הגדר במפורש
❌ "see AGENTS.md"      → paste the rule inline
```

---

# Phase 0 — DIRECTIVE (הושלם)

```
[✅] DIRECTIVE §A: ARCHITECT_DIRECTIVE_FEEDBACK_ENDPOINT_MODE_A_AMENDMENT_v1.0.0.md
[✅] DIRECTIVE route_recommendation: ARCHITECT_DIRECTIVE_ROUTE_RECOMMENDATION_ENUM_v1.2.0.md
[✅] B1 locked: Mode A rejects "full" (422)
[✅] B2 locked: case-insensitive rr.strip().lower()
[✅] B3 locked: normalization at lines 332 + 360 only
[ ] עדכון TRIGGER PROTOCOL בכל templates + governance files → POST /feedback + CANONICAL_AUTO
```

# Phase 1 — Point 2

```
[ ] §B      Wire existing forms — live API (קודם לF-04 — SR-07)
            ⚠️ Route dropdown: doc | impl | arch ONLY (DIRECTIVE v1.2.0)
[ ] P2-F04  Feedback banner SSE — prominent banner at page top for all ingest events
[ ] §A      Atomic set: models.py + ingestion.py(_normalise lines 332,360) + api.py + use_cases.py
[ ] §H      Token budget: builder.py section-trim + meta + UI badge
[ ] P2-F03  Auto-advance: definition.yaml policy + §E resolve_actor_team_id
[ ] §F      Layer 2 APScheduler + sha256 full-file + max_instances=1
[ ] P2-F05  Polling interval dropdown in config page (DB policy PATCH)
[ ] P2-F06  Governance matrix: GET /api/governance/status + config tab
```

# Phase 2 — Point 3 Infrastructure

```
[ ] P3-A1   GET /api/runs/{run_id}/context endpoint
[ ] P3-A2   builder.py — L4 enriched from context + §J pre-assembly checks
[ ] P3-A3   GET /api/teams/{team_id}/context endpoint
[ ] P3-A4   Teams page — "Generate Context Prompt" button (same templates as prompt builder)
[ ] §I-0    GET /api/feedback/stats — business_router + X-Actor-Team-Id
[ ] §I-UI   Config tab "Quality KPIs" — Phase 0 collection indicator
```

# Phase 3 — Templates + Governance Content

```
[ ] §C-P1   team_10.md expanded (§J header + trigger protocol)
[ ] §C-P1   team_11.md expanded (§J header + trigger protocol)
[ ] §C-P1   team_61.md — new, full
[ ] §C-P1   team_51.md — new, full
[ ] §D      engine = codex in governance (team_110, team_111)
[ ] §B-T    Templates GATE_0–GATE_2 → v2: MISSION + CONSTRAINTS + TRIGGER PROTOCOL
[ ] §C-P2   team_20, team_30, team_40, team_50 — minimal
[ ] §C-P3   team_70, team_71, team_90 — minimal
[ ] DOC     UI Spec v1.1.1 §10.3: doc|full → doc|impl|arch
[ ] DOC     Stage8B mandate §IL-2: annotation update
```

# Phase 4 — Validation

```
[ ] STEP 1 — Sanity (collect-only, no execution):
    python3 -m pytest agents_os_v3/tests/ --collect-only -q
    יעד: 175 tests collected

[ ] STEP 2 — Full run:
    python3 -m pytest agents_os_v3/tests/ -q
    יעד: 0 failed

[ ] Manual — Layer 3/4 forms שולחים live API (לא data-mock-toast)
[ ] Manual — Mode A: POST /feedback + CANONICAL_AUTO → CANONICAL_AUTO ב-DB
[ ] Manual — Mode A: route_recommendation: "full" → HTTP 422 (expected)
[ ] Manual — Mode B/C/D: file with route_recommendation: full → "impl" ב-DB
[ ] Manual — Mode B/C/D: file with route_recommendation: FULL → "impl" ב-DB (case-insensitive)
[ ] Manual — Feedback banner מופיע אחרי כל ingest event (SSE)
[ ] Manual — Config governance matrix: 0 "routed without governance"
[ ] Manual — Token badge: ~N tokens, truncation_meta עקבי
[ ] Manual — GET /api/feedback/stats → detection_mode distribution (X-Actor-Team-Id required)
```

---

## מדד הצלחה

| מדד | יעד |
|-----|-----|
| IL-1 parse rate | >70% (לאחר template upgrade) |
| Correction cycles p50 | ≤1 |
| routed_without_governance | 0 לפני כל gate |
| token_budget_warning OVER_BUDGET | <5% |
| Layer 1 adoption GATE_0/1.2 | >40% (Phase 1 baseline) |

---

## References לאישורים חיצוניים

| מקור | ארטיפקט |
|------|---------|
| team_190 סגירת F-01..F-06 | `_COMMUNICATION/team_190/TEAM_190_PIPELINE_QUALITY_PLAN_V3_REVIEW_v1.0.0.md` |
| team_190 סגירת F-07..F-09 | `_COMMUNICATION/team_190/TEAM_190_PIPELINE_QUALITY_PLAN_V3_REVIEW_v1.0.1.md` |
| team_190 זיהוי F-10..F-11 + ZD-01..07 (טופלו ב-v3.5.0) | `_COMMUNICATION/team_190/TEAM_190_PIPELINE_QUALITY_PLAN_V3_REVIEW_v1.0.2.md` |
| team_100 SPY זיהוי SR-01..SR-07 (טופלו ב-v3.2.0) | `_COMMUNICATION/team_100/TEAM_100_PIPELINE_QUALITY_PLAN_DETAILED_SPY_REVIEW_FEEDBACK_v1.0.0.md` |
| team_100 3rd review זיהוי R-01..R-07 (טופלו ב-v3.3.0) | `_COMMUNICATION/team_100/TEAM_100_PIPELINE_QUALITY_PLAN_v3.2.0_REPEAT_REVIEW_v1.0.0.md` |
| Team 00 החלטות B1/B2/B3 + directives locked | `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_ROUTE_RECOMMENDATION_ENUM_v1.2.0.md` |

---

**log_entry | TEAM_100 | PIPELINE_QUALITY_PLAN_v3.5.0 | SUBMITTED_FOR_FINAL_REVIEW | 2026-04-01**

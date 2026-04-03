date: 2026-04-01
historical_record: true

# תכנית איכות פייפליין — v3.4.0
## TEAM_100 | 2026-04-01 | STATUS: APPROVED — READY FOR IMPLEMENTATION

> מחליף: v3.0.0 / v3.2.0 / v3.3.0 (כל גרסאות קודמות מבוטלות).
> SSOT לתכנית זו: קובץ זה בלבד.

---

## DELTA מ-v3.3.0 — תיקונים מביקורת team_190 v1.0.1 (FAIL → CLOSED)

| # | ממצא | חומרה | תיקון ב-v3.4.0 |
|---|------|-------|---------------|
| F-07 | `route_recommendation` enum: `doc|impl|arch` ב-§A מול `doc|full` ב-SSOT/UI | MAJOR | **DIRECTIVE נוצר** + §A מעודכן + normalization rule מוגדרת |
| F-08 | Fingerprint 2KB ראשונים — false dedupe לקבצי verdict עם frontmatter זהה | MEDIUM | §F — hash מלא תמיד (`path.read_bytes()`) — ללא threshold |
| F-09 | Phase 4 מערבב collect-only עם pass/fail | MINOR | Phase 4 — פוצל לשני קריטריונים מפורשים |

---

## DELTA מ-v3.2.0 — תיקונים (archive — R-01..R-07)

| # | ממצא | מקור | תיקון |
|---|------|------|-------|
| R-01 | §J.1 ULID ל-`work_package_id` — סתירה ל-Iron Rule | team_100 | §J.1 — ULID הוסר; רק 3-level |
| R-02 | `blocking_findings` לא מובנה | team_100 | `BlockingFindingV1` sub-model |
| R-03 | `_trim_optional_sections` סיכון מימוש | team_100 | §H — unit test mandate ל-Team 21 |
| R-04 | `feedback/stats` חסרת auth | team_100 | §I — business_router + X-Actor-Team-Id |
| R-05 | "Token p95 from prompt log" — לא קיים | team_100 | §I — דחוי ל-Phase 1+ |
| R-06 | Fingerprint 2KB — קבצים קטנים | team_100 | §F — נסגר מחדש בF-08 (גרסה חזקה יותר) |
| R-07 | log_entry "APPROVED" מטעה | team_100 | log entries מתוקנים |

---

## DELTA מ-v3.1.0 (archive — F-01..F-06, SR-01..SR-07)

ראו v3.3.0 DELTA archive — כל 13 הממצאים סגורים.

---

## עקרון-על (ללא שינוי)

> *"מה שחשוב זה לא עוד שניה בממשק — אלא איכות האיגנט שנייצר."*

---

# §A — Layer 1 Contract ✅ LOCKED

**DIRECTIVE §A:** `ARCHITECT_DIRECTIVE_FEEDBACK_ENDPOINT_MODE_A_AMENDMENT_v1.0.0.md`
**DIRECTIVE route_recommendation:** `ARCHITECT_DIRECTIVE_ROUTE_RECOMMENDATION_ENUM_v1.0.0.md`

## שרשרת מימוש — atomic set (3 קבצים + normalization)

DB ו-`IngestSource` **לא דורשים שינוי** (כבר תומכים).

### 1. `models.py` — `BlockingFindingV1` + `StructuredVerdictV1` + `FeedbackIngestBody`

```python
class BlockingFindingV1(BaseModel):
    """Structured blocking finding (R-02)."""
    id: str = Field(..., description="e.g. F-01")
    severity: Literal["BLOCKER", "MAJOR", "MINOR"]
    description: str = Field(..., min_length=1)
    evidence: Optional[str] = None

class StructuredVerdictV1(BaseModel):
    """Canonical Layer 1 verdict schema."""
    schema_version: Literal["1"] = "1"
    verdict: Literal["PASS", "FAIL"]
    confidence: Literal["HIGH", "MEDIUM", "LOW"] = "HIGH"
    summary: str = Field(..., min_length=1)
    blocking_findings: list[BlockingFindingV1] = Field(default_factory=list)
    route_recommendation: Optional[Literal["doc", "impl", "arch"]] = None   # F-07: DIRECTIVE v1.0.0

class FeedbackIngestBody(BaseModel):
    detection_mode: Literal["CANONICAL_AUTO", "OPERATOR_NOTIFY", "NATIVE_FILE", "RAW_PASTE"]
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

### 2. `ingestion.py` — normalization (F-07)

```python
# Directive: ARCHITECT_DIRECTIVE_ROUTE_RECOMMENDATION_ENUM_v1.0.0.md §4
_ROUTE_REC_NORMALISE = {"full": "impl"}   # backward compat: deprecated "full" → "impl"
_ROUTE_REC_VALID = {"doc", "impl", "arch"}

def _normalise_route_rec(rr: str | None) -> str | None:
    if rr is None:
        return None
    normalised = _ROUTE_REC_NORMALISE.get(rr, rr)
    return normalised if normalised in _ROUTE_REC_VALID else None
```

Apply at **all 5 extraction points** in `ingestion.py` (lines ~253, ~266, ~300, ~319, ~351):
```python
"route_recommendation": _normalise_route_rec(rr),
```

### 3. `api.py` + `use_cases.py` — ללא שינוי מ-v3.3.0

(ראו v3.3.0 §A סעיפים 2-3)

## Trigger Protocol (Layer 1 canonical)

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

**`route_recommendation` valid values:** `"doc"` | `"impl"` | `"arch"` | `null`
**DEPRECATED:** `"full"` — normalises to `"impl"` at ingestion.

---

# §B — UI Wiring (ללא שינוי)

wire `renderHandoffIngestionExtra()` — החלף `data-mock-toast` ב-live API.
**Route dropdown:** 3 options — `doc`, `impl`, `arch` (F-07 — DIRECTIVE v1.0.0).

---

# §C — Governance Expand (ללא שינוי)
# §D — Engine Mapping (ללא שינוי)
# §E — Auto-Advance Actor Resolution (ללא שינוי)

---

# §F — Layer 2 Polling + Idempotency (תיקון F-08)

## Fingerprint — sha256 מלא תמיד (תיקון F-08)

**F-08 root cause:** כל קבצי verdict מתחילים עם YAML frontmatter זהה (template). 2KB ראשונים
עלולים להיות זהים לשני קבצים שונים מאותו team/gate. hash חלקי = false dedupe.

**פתרון:** hash מלא תמיד. קבצי verdict קטנים (בד"כ <10KB) — עלות זניחה.

```python
import hashlib

def _file_fingerprint(path: Path) -> str:
    """sha256 of full file content.
    F-08: partial hash (first 2KB) was insufficient — verdict files share
    identical YAML frontmatter, causing false deduplication.
    Full hash is safe: verdict documents are small (<10KB typical)."""
    return hashlib.sha256(path.read_bytes()).hexdigest()[:20]

_PROCESSED_FILES: set[str] = set()
```

## Risk Acceptance — In-Memory (ללא שינוי מ-v3.3.0)

> **Risk Acceptance (team_00, 2026-04-01):** `_PROCESSED_FILES` הוא in-memory לתהליך יחיד.
> לאחר restart, קובץ שכבר עובד עלול להיסרק שוב ולהיכשל בגלל `FEEDBACK_ALREADY_INGESTED` (חסימה בטוחה).
> זה מקובל ל-single-process local deployment.

## APScheduler config (ללא שינוי)

```python
scheduler.add_job(
    _scan_layer2_feedback, "interval",
    seconds=_get_polling_interval(),
    id="layer2_scan", coalesce=True, max_instances=1, replace_existing=True,
)
```

---

# §G — File Naming (ללא שינוי)

Canonical primary: `TEAM_{id}_{wp_id}_GATE_{n}_VERDICT_v{x.y.z}.md`

---

# §H — Token Budget (ללא שינוי מ-v3.3.0)

_trim_optional_sections עם unit test mandate ל-Team 21 (R-03).
Token heuristic: `len//4` (lower bound, documented).
`truncation_meta` in prompt response.

---

# §I — KPI Framework (ללא שינוי מ-v3.3.0)

`GET /api/feedback/stats` — `business_router` + `X-Actor-Team-Id` (R-04).
Token p95 — N/A Phase 0, דחוי ל-Phase 1+ (R-05).

---

# §J — Prompt Quality Contract / PQC (ללא שינוי מ-v3.3.0)

J1.1: `work_package_id` = `S{NNN}-P{NNN}-WP{NNN}` בלבד. ULID אינו תקף (R-01).

---

# Phase 0 — DIRECTIVE (הושלם)

```
[✅] §A DIRECTIVE נוצר: ARCHITECT_DIRECTIVE_FEEDBACK_ENDPOINT_MODE_A_AMENDMENT_v1.0.0.md
[✅] §A route_recommendation DIRECTIVE: ARCHITECT_DIRECTIVE_ROUTE_RECOMMENDATION_ENUM_v1.0.0.md
[✅] Option A נעול (team_00, 2026-04-01)
[ ]  עדכון TRIGGER PROTOCOL בכל תבניות וgov files = POST /feedback + CANONICAL_AUTO
```

# Phase 1 — Point 2 (סדר מעודכן — SR-07)

```
[ ] §B      Wire existing forms — live API (קודם לF-04)
            ⚠️ Route dropdown: doc | impl | arch (DIRECTIVE_ROUTE_RECOMMENDATION_ENUM v1.0.0)
[ ] P2-F04  Feedback banner SSE (index.html + app.js)
[ ] §A      Atomic set: models.py + ingestion.py(_normalise) + api.py + use_cases.py
[ ] §H      Token budget enforcement (builder.py + UI badge)
[ ] P2-F03  Auto-advance policy + §E actor resolution
[ ] §F      Layer 2 APScheduler + sha256 full-file fingerprint + max_instances=1
[ ] P2-F05  Polling dropdown (config.html + policy PATCH)
[ ] P2-F06  Governance matrix endpoint + config tab
```

# Phase 2 — Point 3 Infrastructure

```
[ ] P3-A1   GET /api/runs/{run_id}/context endpoint
[ ] P3-A2   builder.py — L4 use context + §J pre-assembly checks
[ ] P3-A3   GET /api/teams/{team_id}/context endpoint
[ ] P3-A4   Teams page — "Generate Context Prompt" button
[ ] §I-0    GET /api/feedback/stats — business_router + X-Actor-Team-Id
[ ] §I-UI   Config tab "Quality KPIs" — Phase 0 indicator
```

# Phase 3 — Templates + Governance Content

```
[ ] §C      team_10.md expanded + §J canonical header
[ ] §C      team_11.md expanded
[ ] §D      engine = codex (team_110, team_111)
[ ] P3-C3   team_61.md (new, full)
[ ] P3-C4   team_51.md (new, full)
[ ] P3-B1–4 Templates GATE_0–GATE_2 — v2: MISSION+CONSTRAINTS+TRIGGER
[ ] P3-C5   Priority 2: team_20/30/40/50 (minimal)
[ ] P3-C6   Priority 3: team_70/71/90 (minimal)
[ ] DOC     UI Spec v1.1.1 §10.3 — עדכון route_recommendation מ-doc|full ל-doc|impl|arch
[ ] DOC     Stage8B mandate §IL-2 — עדכון annotation
```

# Phase 4 — Validation (תיקון F-09)

```
[ ] STEP 1 — Sanity (collect-only):
    python3 -m pytest agents_os_v3/tests/ --collect-only -q
    יעד: 175 tests collected (לא ריצה, רק איסוף — מוודא שאין syntax errors)

[ ] STEP 2 — Full run:
    python3 -m pytest agents_os_v3/tests/ -q
    יעד: 0 failed (production run = PAUSED לאיזולציה)

[ ] Manual: Layer 3/4 forms שולחים live API (לא mock toast)
[ ] Manual: Layer 1 POST /feedback + CANONICAL_AUTO → `CANONICAL_AUTO` ב-DB
[ ] Manual: route_recommendation "full" → normalizes to "impl" ב-DB
[ ] Manual: feedback banner מופיע אחרי detection
[ ] Manual: config page governance matrix — 0 "routed without governance"
[ ] Manual: token badge = ~N tokens, truncation_meta עקבי
[ ] Manual: /api/feedback/stats מחזיר detection_mode distribution (X-Actor-Team-Id required)
```

---

## מדד הצלחה

| מדד | יעד |
|-----|-----|
| IL-1 parse rate | >70% |
| Correction cycles p50 | ≤1 |
| routed_without_governance | 0 לפני כל gate |
| token_budget_warning OVER_BUDGET | <5% |
| Layer 1 adoption GATE_0/1.2 | >40% |

---

**log_entry | TEAM_100 | PIPELINE_QUALITY_PLAN_v3.2.0 | SUBMITTED_FOR_THIRD_REVIEW | 2026-04-01**
**log_entry | TEAM_100 | PIPELINE_QUALITY_PLAN_v3.3.0 | R-01..R-07_CLOSED | 2026-04-01**
**log_entry | TEAM_190 | PIPELINE_QUALITY_PLAN_V3_REVIEW_v1.0.1 | F-07..F-09 | 2026-04-01**
**log_entry | TEAM_100 | PIPELINE_QUALITY_PLAN_v3.4.0 | F-07..F-09_CLOSED | 2026-04-01**
**log_entry | TEAM_190 | F-01..F-09 CLOSED | 2026-04-01**
**log_entry | TEAM_100_SPY | SR-01..SR-07 CLOSED | 2026-04-01**
**log_entry | TEAM_00  | DIRECTIVE_ROUTE_ENUM_LOCKED + PLAN_v3.4.0_APPROVED | 2026-04-01**

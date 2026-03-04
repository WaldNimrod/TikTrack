---
**project_domain:** TIKTRACK
**id:** TEAM_00_D25_PRODUCT_CONCEPT_v1.0.0
**from:** Team 00 (Chief Architect)
**to:** Team 10 (Gateway — for awareness), Team 170 (for LOD200 scoping when S005 activates)
**date:** 2026-03-04
**status:** CONCEPT LOCKED — LOD200 authoring deferred to Session #2 (S005 prep)
---

# TEAM 00 | D25 — AI ANALYSIS: PRODUCT CONCEPT v1.0.0

## §1 EXECUTIVE SUMMARY

D25 (AI Analysis / Market Intelligence) is a **template-based AI prompt interface** enabling users to submit structured market analysis requests to an AI engine of their choice and receive, view, and store analysis results. The system is admin-configured (templates) and user-operated (template selection + variable input + engine selection).

**Critical finding (2026-03-04):** The legacy TikTrack v1 codebase already contains ~80% of this feature:
- Full template system with `variables_json` structure ✅
- Template-card UI with selection modal ✅
- Dynamic form generation from template definitions ✅
- Analysis result storage (`ai_analysis_results` table) ✅
- History tracking per user ✅
- Auto-population of system values (tickers, accounts) into template variables ✅

**Phoenix implementation of D25 will migrate and refactor this legacy system, not rebuild from scratch.**

---

## §2 PRODUCT VISION (Nimrod — 2026-03-04)

### 2.1 Admin Interface — Template Management

Admin users can define AI prompt templates. Each template consists of:
- **Fixed text segments** — static narrative portions of the prompt
- **Named parameters** — user-fillable variables inserted into the prompt at render time

Example template: `"Analyze [ticker_symbol] for a [timeframe] trading opportunity with entry near [price]. Consider [market_context] conditions."`

Admin operations:
- Create / edit / delete templates
- Define parameter list per template (name, type, required/optional, input type)
- Set template visibility (published / draft)

### 2.2 User Interface — Analysis Execution

1. **Template gallery** — User sees a card grid of available published templates, each with name + description + icon
2. **Template selection** — Click on card opens execution modal
3. **Parameter form** — Modal renders a form with one input per template parameter. Some parameters auto-populated from system context (e.g., tickers in user's portfolio). User fills/confirms values.
4. **Engine selection** — User selects AI engine (e.g., GPT-4o / Claude 3.5 Sonnet). Available engines are configured by system + user's API keys in D39.
5. **Submission** — System builds the final prompt string, sends to selected engine via user's API key, displays response in-modal.
6. **Save + storage** — Analysis result saved automatically to user's analysis history (`ai_analysis_results` table). Accessible from user's history page.

### 2.3 Template Request (User → Admin)

Users have a small UI element to submit a **template request** to admin — a structured form requesting a new analysis template. Admin sees incoming requests in D41 or D40 (admin panel).

### 2.4 Phase 2 (Separate Program — Post-S005)

The system reads stored analysis results and extracts named variables/parameters for aggregate statistics, computation, and pattern analysis across multiple analysis runs. This enables:
- "My AI analyses predict 60% bullish on AAPL" (aggregate sentiment)
- Performance correlation: "analyses that rated trade potential HIGH had X% win rate"
- Pattern extraction from LLM responses using structured output prompting

**Phase 2 is out of scope for D25 S005. Registered as S006+ program.**

---

## §3 ARCHITECTURAL DECISIONS (Pre-LOD200 — to be confirmed at Session #2)

| Decision | Proposed | Notes |
|----------|----------|-------|
| Template storage | DB table (`ai_templates`) with `variables_json` JSONB | Matches legacy model |
| Result storage | DB table (`ai_analysis_results`) with full response text | Matches legacy model |
| Engine integration | User's API key (from `user_api_keys` table) → direct API call from backend | User pays; backend proxies to preserve key security |
| Available engines | OpenAI (GPT-4o) + Anthropic (Claude 3.x) | Configurable via admin feature flags |
| Template versioning | `version` field on template; historical analyses reference template snapshot | Prevents break on template edit |
| Admin template builder | Form-based UI (not raw JSON) — field type selector + drag reorder | Better DX for non-technical admins |
| Template request feature | Simple form → `admin_data.template_requests` table → shown in D40 admin | S005 scope |
| Phase 2 extraction | Separate program; uses structured output mode of LLM APIs | Post-S005 |

---

## §4 TEAM 00 IMPROVEMENT RECOMMENDATIONS

The following items should be addressed in Session #2 (LOD200 scoping):

### 4.1 File format for saved analyses
**Question:** What does "save as file" mean? Options:
- **A (recommended):** Row in `ai_analysis_results` DB table — no actual file; "file" = queryable record
- **B:** Export to PDF/Markdown on user request
- **C:** Auto-save to cloud storage per analysis

Recommendation: Option A (DB record) as the core. Option B (export) as a UI affordance on the history page. NOT Option C — adds infrastructure complexity with no clear benefit for MVP.

### 4.2 Cost/token transparency
When user submits a prompt, show estimated token count. After submission, show actual tokens used + approximate cost (based on published pricing for each engine). This helps users understand their API usage.

### 4.3 Prompt preview before submission
Allow user to see the fully-rendered prompt (with all variables inserted) before sending to AI. Reduces wasted API calls on poorly-constructed prompts.

### 4.4 Template parameter types
Beyond the legacy types (text, select, textarea), consider:
- **Ticker picker** — Selects from user's tickers (already in legacy via auto-population)
- **Date range** — Start/end date picker (useful for period-based analysis)
- **Number** — Numeric input with range validation
- **Multi-select** — Multiple ticker or timeframe selection

### 4.5 Engine configuration — who controls which engines are available?
- **Admin** sets which engines are enabled system-wide (via feature_flags: `openai_enabled`, `anthropic_enabled`)
- **User** chooses from enabled engines (using their own API key for that engine)
- If user has no API key for an engine → engine appears greyed out with "API key required" note linking to D39

### 4.6 Legacy migration considerations
Before building D25 in Phoenix:
1. Review `ai-analysis-manager.js` (54KB) for all logic that must be preserved
2. Review `ai_analysis_results` DB table schema — may need extension for Phoenix model
3. Identify any breaking changes in the template format (variables_json structure)

---

## §5 LEGACY REFERENCE

| Legacy artifact | Description |
|----------------|-------------|
| `ui/src/views/planning/aiAnalysis/` | D25 page (html + content + config) |
| `ai-analysis-manager.js` | 54KB main controller — template loading, form generation, API call, result display |
| `ai-template-selector.js` | Template card UI component |
| `ai_analysis_results` table | Result storage (template_id, variables_json, response, status, timestamps) |
| `ai-analysis-data.test.js` | Test data structures for reference |

---

## §6 ROADMAP POSITION

| Field | Value |
|-------|-------|
| Stage | S005 |
| Program | S005-P003 (Market Intelligence — D27+D25) |
| D-number | D25 |
| Menu | Planning → AI Analysis |
| SSOT route | `/ai_analysis` |
| LOD200 session | Session #2 (dedicated; timing TBD after S003 activates) |
| Prerequisite | S004-P007 (Indicators Infrastructure) GATE_8 PASS |
| Phase 2 | Post-S005 separate program |

---

## §7 FINAL ARCHITECTURAL DECISIONS (2026-03-04 — Nimrod)

### 7.1 Analysis Storage — Anti-Bloat Strategy

**Decision (Team 00, delegated by Nimrod):**

| Phase | Storage method | Notes |
|-------|---------------|-------|
| **Phase A (D25 MVP)** | DB row (`ai_analysis_results.response_text TEXT`) + retention policy: keep last 20 analyses per user per template; archive older rows | Simple, no infra overhead; cap prevents bloat |
| **Phase B (post-MVP)** | Object storage (S3/MinIO-compatible); DB row stores metadata + `response_url` reference only | Unlimited scale; clean separation of data vs metadata |

Both phases: metadata always in DB (template_id, variables_json, status, engine, token_count, timestamps, user_id, cache_hit flag).

### 7.2 Template Builder — Open-Source First

Before building custom: investigate existing free/flexible/quality solutions:
- **Candidates to evaluate:** React JSON Schema Form (react-jsonschema-form), Formio (open-source tier), SurveyJS (MIT), React Hook Form with dynamic schema
- **Decision criteria:** MIT license, active maintenance, supports custom field types, mobile-friendly, extensible
- **If none suitable:** build lightweight custom builder in-house (form with field-type selector + drag reorder)
- **Pre-Session #2 action:** Team 30 evaluates top 2-3 candidates, reports to Team 00 before Session #2

### 7.3 Engine Configuration (Confirmed)

- **Admin** defines which engines are available system-wide (those with backend connectors). Managed via D40 feature flags.
- **User** enters API keys per engine (in D39 Preferences, Group F extension or dedicated section)
- **At runtime:** user sees only engines where (1) admin has enabled the engine AND (2) user has a valid API key configured
- Engines with no key → greyed out with "הוסף מפתח API" link to D39

### 7.4 Template Request (User → Admin)

**Minimal implementation:**
- Small "בקשת תבנית" button on D25 template gallery page
- Opens a simple free-text textarea + submit
- Backend: inserts row into `admin_data.template_requests` (user_id, request_text, created_at, status=pending)
- Admin sees pending requests as a badge on D40 Section 7 (Feature Flags area, or dedicated sub-section)
- No email infrastructure needed in MVP — DB-based, admin polls on D40

### 7.5 Prompt Preview (Confirmed)

Required before submission. Shows fully-rendered prompt string with all variables substituted. "שלח" button only after preview is acknowledged. Reduces wasted API calls.

### 7.6 Cross-User Response Caching — ARCHITECTURAL DECISION

**Nimrod proposed:** When multiple users request the same template with the same parameters, share the cached AI response transparently. Significant token savings for popular analyses.

**Team 00 assessment and decision:**

| Parameter | Decision |
|-----------|----------|
| **Mechanism** | SHA-256 hash of `(template_id + canonical_sorted_variables_json)` = cache key |
| **Cache store** | `admin_data.analysis_cache` table (cache_key, response_text, engine_id, created_at, hit_count) |
| **TTL policy** | Per-template configurable; default: 4 hours (intraday data); 24 hours for daily/weekly templates |
| **User transparency** | 100% opaque — user sees normal "מנתח..." state; `cache_hit=true` stored silently in result row |
| **Exclusion rule (IRON RULE)** | Templates with user-specific variables (account_id, portfolio_id, user-specific tickers) are **NEVER cached**. Only market-generic analyses (e.g., "analyze AAPL for the day") qualify. Template must be flagged `cacheable=true` by admin explicitly. |
| **Privacy** | No user data leaks — the cache stores only the LLM response (generic market analysis), not user identity or personal context |
| **Cost model** | Cache hit = no API call = zero cost to user. Admin may configure per-template cache policy. |
| **Phase** | Phase B (post-MVP). Phase A: no caching. Phase B: implement cache table + cache lookup on submission. |

**This is the single most impactful token-efficiency mechanism in the entire D25 system.** A popular template ("analyze AAPL") requested by 50 users in a 4-hour window = 1 API call instead of 50.

---

**log_entry | TEAM_00 | D25_PRODUCT_CONCEPT_v1.0.0_UPDATED_FINAL_DECISIONS | 2026-03-04**

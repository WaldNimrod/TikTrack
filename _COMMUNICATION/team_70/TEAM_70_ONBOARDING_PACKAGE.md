# Team 70 Onboarding Package (Full Context)

**id:** `TEAM_70_ONBOARDING_PACKAGE`  
**owner:** Team 90 (The Spy)  
**team:** Team 70 (Product Intelligence)  
**status:** ACTIVE  
**date:** 2026-02-14

---

## 1) Mission in One Line

Turn distributed technical and legacy knowledge into one coherent product/business package that can be used by marketing and investor-facing teams without guessing.

---

## 2) Why Team 70 Exists

- Team 10 is focused on orchestration and active delivery.
- Product/business consolidation requires a dedicated stream.
- The package must cover both present system reality and planned target architecture.

---

## 3) Organizational Position

- **Reports to:** Architect + Team 90.
- **Works with:** Team 10 (handoff for promotion only), Team 20/30/40/50/60 (evidence clarification).
- **Does not report operationally to Team 10** like development teams.

---

## 4) Mandatory Reading Order (Day 1–2)

### A. Governance and roadmap foundation
**Canonical source rule (mandatory):**  
Use `_COMMUNICATION/_Architects_Decisions/` as the architect decision SSOT.  
`_COMMUNICATION/90_Architects_comunication/` is communication/supplemental context only.

1. `documentation/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_SYSTEM_OVERVIEW.md`
2. `documentation/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_CURRENT_STATE_AND_GAPS.md`
3. `documentation/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_ROADMAP_NEXT_STEPS.md`
4. `documentation/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_WORK_OPERATING_MODEL.md`

### B. Scope and interfaces
5. `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md`
6. `ui/public/routes.json`
7. `ui/src/views/shared/unified-header.html`

### C. Core architecture and data contracts
8. `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md`
9. `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
10. `api/routers/` + `api/models/` (current runtime surface)

### D. Legacy product/business context
11. `_COMMUNICATION/99-ARCHIVE/_Cursor_full_design_V1_final_PROJECT_PHOENIX/EXECUTIVE_SUMMARY.md`
12. `_COMMUNICATION/99-ARCHIVE/_Cursor_full_design_V1_final_PROJECT_PHOENIX/01-PLANNING/00_STRATEGIC_ANALYSIS.md`
13. `_COMMUNICATION/99-ARCHIVE/_Cursor_full_design_V1_final_PROJECT_PHOENIX/01-PLANNING/SPY_TRADE_DATA_JOURNEY_MAP.md`
14. `_COMMUNICATION/99-ARCHIVE/_Cursor_full_design_V1_final_PROJECT_PHOENIX/00_Strategic_Decisions/TT2_USER_PAGES_SCOPE_DESIGN_FREEZE.md`

### E. Marketing and narrative assets (existing drafts)
**Note:** These are supplemental/context drafts (non-canonical), unless explicitly locked in `_Architects_Decisions`.
15. `_COMMUNICATION/90_Architects_comunication/EXTERNAL_AUDIT_v1/02_PRODUCT/USER_EXPERIENCE_DOCUMENTATION.md`
16. `_COMMUNICATION/90_Architects_comunication/EXTERNAL_AUDIT_v1/03_MARKETING/PRODUCT_POSITIONING.md`
17. `_COMMUNICATION/90_Architects_comunication/EXTERNAL_AUDIT_v1/03_MARKETING/BRANDING_BOOK.md`

---

## 5) First 7-Day Execution Plan

### Day 1–2: Baseline mapping
- Build page inventory: planned / implemented / verified.
- Build feature-process map by domain (Auth, Financial Core, External Data, Analytics, Admin).

### Day 3–4: Product/business structuring
- Build persona-to-value matrix.
- Build journey map: anonymous visitor -> registered user -> active trader.

### Day 5: Gap register
- List contradictions and missing decisions with severity and owner.
- Mark blockers for marketing homepage and investor narrative.

### Day 6: Team 90 verification checkpoint
- Submit package draft for “no-assumption” audit.

### Day 7: Architect-ready handoff package
- Deliver approved draft + promotion-ready delta list for Team 10.

---

## 6) Output Format (Mandatory)

Each document must include:
- id / owner / status / date
- scope
- evidence table (claim -> source path)
- open questions table (if any)
- decision requests (if required)

---

## 7) Quality Bar (LOD 400)

- No claim without evidence path.
- No legacy claim without code/SSOT validation.
- No “future promise” without roadmap stage reference.
- No mixed terminology across docs (single canonical terms per entity/page/process).

---

## 8) Interfaces With Other Teams

- **Team 20/30/40/60:** evidence clarification requests only.
- **Team 50:** QA evidence intake for claims related to runtime behavior.
- **Team 10:** final promotion-ready package only.
- **Team 90:** continuous verification and conflict resolution.

---

## 9) Deliverable Checklist

- [ ] PI-001 Product Scope Atlas
- [ ] PI-002 Business Narrative Pack
- [ ] PI-003 Marketing Input Pack
- [ ] PI-004 Investor/Partner Input Pack
- [ ] PI-005 Gap Register + action plan

---

## 10) Exit Criteria (Onboarding Complete)

Team 70 is considered onboarded only after:
1. Reading list confirmed.
2. Baseline inventory submitted.
3. First verified gap register approved by Team 90.

---

**log_entry | TEAM_90 | TEAM_70_ONBOARDING_PACKAGE_PUBLISHED | 2026-02-14**

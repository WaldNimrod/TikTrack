# 🕵️ Team 90 → Architect: Rich‑Text + Design System Decisions — Spy Report (Phase 2)

**From:** Team 90 (The Spy)  
**To:** Architect  
**Date:** 2026-02-11  
**Status:** 📌 **Decision Request — SSOT Lock Needed**  
**Context:** Phase 2 — Visual Gaps / Stage 0–1 (Gate A passed)  

---

## 0) Why this report
You receive only files (no code access). This report consolidates **code evidence**, **prior architectural decisions**, and **open decisions** needed to finish Phase 2 **without patches**. Our mandate is clean, foundational implementation.

---

## 1) Decisions already approved (locked by G‑Lead)
These are already approved and must be treated as **SSOT**:

1) **TipTap = Rich‑Text editor** (per ADR‑013)  
2) **Broker list = API‑based** (`GET /api/v1/reference/brokers`)  
3) **Design Admin** route = `/admin/design-system` (Type D)  
4) **DNA_BUTTON_SYSTEM.md** (Team 40, 24h) = button SSOT

**Reference:** ADR‑013 (ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md)

---

## 2) Findings from code + spec scan (spy evidence)
### 2.1 Auth & Bridge context
- Admin pages are **React** (Type D).  
- Legacy pages D16/D18/D21 are **HTML** with UAI stages.  
- Stage 0 Bridge is locked: **no hybrid patches**; everything consistent with SSOT.  

**Implication:** The Design System page must be **React** (admin group), even if it renders an HTML-like layout.

### 2.2 Rich‑Text risks
- Frontend will render HTML from TipTap.  
- Backend must store and return HTML safely.  
- **Sanitization** must be defined to prevent XSS.

**Implication:** We cannot proceed without a locked **allowed tags + sanitization policy**.

---

## 3) Open decisions required (must be locked in SSOT)
These are **not** changes in scope; they are **precision locks** needed to implement cleanly.

### 3.1 Rich‑Text — Allowed HTML Tags/Attributes
**Required:** explicit allowlist (tags + attributes).  
Suggested baseline:
- Text: `p`, `br`, `span`, `strong`, `em`, `u`, `s`
- Lists: `ul`, `ol`, `li`
- Links: `a[href]` (http/https only)
- Direction: `dir="rtl"`, `dir="ltr"`
- Alignment: class‑based (`.align-start`, `.align-center`, `.align-end`) **or** safe inline `text-align`

**Decision needed:** list + whether alignment is class‑only or inline.

### 3.2 Sanitization Policy
**Required:** tool + scope + version.  
Options:
- **DOMPurify (recommended)** — FE sanitization + optional BE re‑sanitize.
- sanitize‑html (BE only) — FE trust, BE sanitize.

**Decision needed:**
- Tool name + version
- Location: FE only / BE only / FE+BE

### 3.3 TipTap package lock
**Required:** exact packages + versions + RTL support.
Example:
- `@tiptap/core`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-text-align`
- RTL handling: built‑in vs extension vs CSS

**Decision needed:** approved package list + RTL strategy.

### 3.4 Backend HTML acceptance
**Required:** explicit confirmation that `description/notes` fields accept and persist HTML without stripping, or **explicit constraints** if stripping is mandatory.

**Decision needed:**
- Is HTML stored as‑is?
- Are tags stripped?
- Length/size limits?

### 3.5 Design System page implementation
**Required:** final position on **React vs static HTML**

**Recommendation (aligned to Bridge):**
- **React page** (`/admin/design-system`) that renders HTML‑structured content.
- CSS variables only (no inline styles).
- Two tables: buttons + color variables.

**Decision needed:** confirm React implementation with HTML‑style layout (no static HTML exceptions).

---

## 4) Recommendations (clean, foundational)
1) **Lock allowlist + sanitizer** in SSOT now — prevents unsafe quick fixes.  
2) **FE+BE sanitization** if feasible; otherwise FE-only with locked allowlist + BE validation.  
3) **React‑only Design System** to avoid hybrid patches.  
4) **Treat Rich‑Text as reusable component** (future fields).  

---

## 5) Deliverables after your decision
Once you lock the above, Team 10 will:
- Update SSOT + Work Plan
- Distribute precise tasks to Teams 20/30/40
- Add Acceptance Criteria to Gate A/B checks

---

## 6) Files referenced
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md`
- `_COMMUNICATION/team_10/ADR_STAGE0_BRIDGE_AND_REACT_TABLES_SSOT.md`
- `_COMMUNICATION/team_30/TEAM_30_SPEC_DECISIONS_REMAINING_TASKS.md`
- `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_20_RICH_TEXT_DESCRIPTION_VERIFICATION.md`
- `_COMMUNICATION/team_30/TEAM_30_TO_ARCHITECT_RICH_TEXT_QUESTIONS.md`

---

**Prepared by:** Team 90 (The Spy)  
**log_entry | RICH_TEXT + DESIGN_SYSTEM | DECISION_REQUEST | 2026‑02‑11**

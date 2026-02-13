# 🕵️ Team 90 → Architect: Review & Recommendation — Module/Menu Styling (Gap #1)

**id:** `TEAM_90_TO_ARCHITECT_BATCH_1_2_MODULE_MENU_STYLING_REVIEW`  
**from:** Team 90 (The Spy)  
**to:** Architect (Gemini Bridge)  
**date:** 2026-02-12  
**context:** Batch 1+2 Audit — SSOT gap for Module/Menu Styling  
**status:** 📌 **REVIEW REQUIRED**

---

## 1) What we checked (SSOT scan)
We scanned the architect communication folder and SSOT docs for a **formal decision** covering:
- RTL button order in modules/forms
- Module header color standard
- Main menu/module styling standard

**Relevant documents found (but not decisive for these 3 items):**
- `documentation/90_ARCHITECTS_DOCUMENTATION/TT2_RTL_DEVELOPMENT_CHARTER.md` — logical properties only, **no button order rule**.
- `documentation/90_ARCHITECTS_DOCUMENTATION/CSS_EXCELLENCE_PROTOCOL.md` — BEM + transformation layer, **no styling rules**.
- `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_HEADER_UNIFICATION_MANDATE.md` — **architecture/loader**, not visual styling.
- `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md` — Auth model + TipTap/Buttons, **no module/menu styling**.

**Conclusion:** The three styling items are **not defined in SSOT**. Team 10’s request is valid and blocking closure.

---

## 2) Recommendation — decision format (minimal, enforceable)
We recommend the architect issue a **single SSOT decision** that contains:

| Topic | Required Decision | Example Acceptance Criteria |
|---|---|---|
| **RTL Button Order** | Official RTL order for module/form actions | “Cancel right, Confirm left”; enforced for all modals/forms in Phase 2 |
| **Module Header Color** | Which palette & variant to use (per entity) | “Use entity color LIGHT variant in module header background; text color per DNA variables” |
| **Main Menu Styling** | Standard for nav/menu block (colors, active states, spacing) | “Menu inherits header palette; no inline styles; class-based styling only” |

---

## 3) Preferred SSOT placement
**Option A (Preferred):** New SSOT doc under `documentation/04-DESIGN_UX_UI/` with clear title, then linked in `00_MASTER_INDEX.md`.
**Option B:** Promote existing coordination doc (if any) **only if** fully rewritten to SSOT grade.

---

## 4) Notes for implementation
- Must align with **DNA Button System** and **DNA Palette** (no inline styles).
- Menu styling must remain consistent with **unified-header.html** (single header source).
- RTL decision must be explicit, not inferred from CSS logical properties.

---

## 5) Request to Architect
Please issue a **locked SSOT decision** for the 3 styling items. Once received:
- Team 10 will promote to SSOT & update indexes.
- Team 40 will implement visual precision per G‑Lead guidance.

---

**Prepared by:** Team 90 (The Spy)

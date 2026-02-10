# 🕵️ Team 90 → Team 10: Additional Visual Gaps — Tasks & Requirements

**id:** `TEAM_90_TO_TEAM_10_ADDITIONAL_VISUAL_GAPS_TASKS`  
**from:** Team 90 (The Spy)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-09  
**status:** 🔴 **ACTION REQUIRED — NEW TASKS**  
**context:** Post visual scan — add as separate tasks after existing items

---

## ✅ Summary
Additional gaps were found in UI/UX. These must be inserted as **separate tasks** in Team 10’s plan **after the existing tasks**. Each item below includes references + expected outcome.

---

# 1) Text Fields vs Select Fields (Add/Edit Modules)
**Requirement:** Fields must match the correct input type (dropdown vs text).  
Examples from code show **text inputs where select is required**.

**Code Evidence (current):**
- `ui/src/views/financial/tradingAccounts/tradingAccountsForm.js`  
  - Broker is **text input** (should be **dynamic select**).
- `ui/src/views/financial/brokersFees/brokersFeesForm.js`  
  - Broker is **text input** (should be **dynamic select**).
- `ui/src/views/financial/cashFlows/cashFlowsForm.js`  
  - Trading account + flow type are selects (ok) but **description** is plain textarea (see item 2).

**Required Actions:**
- Replace broker inputs with **dynamic select** sourced from valid broker list.  
- Align all add/edit modules with SSOT/Blueprint definitions.

**Acceptance Criteria:**
- All required choice fields are rendered as selects.
- Selects populated dynamically from valid lists.
- No manual free‑text for fields defined as choices.

---

# 2) Description/Notes = Rich Text Editor
**Requirement:** Description/Notes fields must use **rich text editing** (styled + formatted).

**Code Evidence (current):**
- `ui/src/views/financial/cashFlows/cashFlowsForm.js` — `description` uses `<textarea>`.

**Required Actions:**
- Replace plain textarea with **rich text editor** (per UI standard).
- Apply to all modules with description/notes fields.

**Acceptance Criteria:**
- Description/Notes render a rich text UI.
- Formatting preserved on save/edit.

---

# 3) Modal Buttons Order + RTL Layout
**Requirement:** For RTL, **Cancel must be first**, then Confirm (save).  
Also apply standard button style hierarchy.

**Code Evidence (current):**
- `ui/src/components/shared/PhoenixModal.js`  
  - Save button is appended **before** Cancel.
- `ui/src/styles/phoenix-modal.css`  
  - Footer aligns to end, but order is DOM‑based.

**Required Actions:**
- Swap order or apply `flex-direction: row-reverse` for RTL.
- Ensure buttons use standard design tokens/classes.

**Acceptance Criteria:**
- All modals: **Cancel rightmost**, Confirm left (RTL order).
- Button styling consistent with system defaults.

---

# 4) Modal Header Color Per Entity (Light Variant)
**Requirement:** Each module must show **entity‑colored header background** (light variant).

**Code Evidence (current):**
- `ui/src/styles/phoenix-modal.css` — header has no entity color.

**Required Actions:**
- Add entity‑aware CSS class/attribute to modals.
- Apply **light variant** background per entity.

**Acceptance Criteria:**
- Every module header displays correct entity color (light variant).
- No neutral header in entity contexts.

---

# 5) Standard Button Classes (Global)
**Requirement:** All buttons must use **fixed classes + dynamic colors** (SSOT palette).

**Required Actions:**
- Identify button class system and enforce across modules.
- Remove ad‑hoc styles in module forms.

**Acceptance Criteria:**
- All buttons follow unified class system.
- Colors driven by CSS variables only.

---

# 6) Dynamic Color Table Page (New)
**Requirement:** Create a page that lists **all CSS color variables**, description, and theme swatch.

**Reference:**
- `ui/src/styles/phoenix-base.css` — SSOT for CSS variables.

**Required Actions:**
- Create a page (dev‑only) with a table:
  - Variable name
  - Description
  - Theme column (current theme)
  - Color swatch

**Acceptance Criteria:**
- Single page provides visual comparison for all palette variables.
- Used as audit tool for dynamic colors.

---

# 7) Header Missing After Login → Home (Critical)
**Requirement:** Header must always render except login/register/reset‑password.

**Evidence:**
- Known regressions in header render after auth flow.

**Required Actions:**
- Fix header load flow so it is always present.
- Validate in login → home transition.

**Acceptance Criteria:**
- Header always present on all non‑auth pages.

---

## 🔐 Auth Page Types + Redirect Rules (Must be added as a separate task)
**Requirement:** Pages must be classified by auth type and enforce the correct redirect + UI behavior.

### Page types (mandatory)
**A) Open pages** — available to all users  
- `/login`, `/register`, `/forgot-password`  
- Header **not shown** on these pages.

**B) Shared pages** — both guest and authenticated users  
- **Home only**  
- **Logged‑out container:** must exist and show login/register CTA + placeholder marketing text.  
- **Logged‑in containers:** existing content remains for authenticated users.

**C) Auth‑only pages** — all other pages  
- Guest user **must be redirected to Home** (not to `/login`).
- Header must be present on all auth‑only pages.

### User icon color rules (Header)
- **Logged‑in:** Success color  
- **Logged‑out:** Warning color  
- **Black icon is never allowed** (any occurrence = defect).

**Code Evidence (current issues):**
- `ui/src/router/AppRouter.jsx` — Home wrapped in `ProtectedRoute` (wrong).  
- `ui/src/cubes/identity/components/auth/ProtectedRoute.jsx` — redirects to `/login` (wrong).  
- `ui/src/components/HomePage.jsx` — no logged‑out container.  
- `ui/src/views/shared/unified-header.html` / `ui/src/styles/phoenix-header.css` — icon defaults to black.

**Required Actions:**
- Unprotect Home route and implement shared rendering by auth state.
- Redirect guest users to **Home** for all auth‑only pages.
- Enforce user icon status color logic; remove default black state.

**Acceptance Criteria:**
- Home always accessible (guest + logged‑in) and shows correct container per state.
- Guest navigation to auth‑only pages redirects to Home.
- User icon always success or warning (never black).

---

## ✅ Recommended Order of Execution
1) **Header always present** (critical UX blocker).  
2) **Access field types (select vs text)** + **rich text**.  
3) **Buttons order + styling alignment**.  
4) **Modal header entity background**.  
5) **Global button class standardization**.  
6) **Dynamic color table page**.

---

## ✅ Team 10 Required Outputs
- Insert each item as a separate task in the work plan (after existing items).  
- Provide assignees + deadlines.  
- Update documentation with SSOT references.  
- Notify Team 90 for verification once fixes are merged.

---

**Prepared by:** Team 90 (The Spy)  
**log_entry | [Team 90] | VISUAL_SCAN | ADDITIONAL_TASKS | 2026-02-09**

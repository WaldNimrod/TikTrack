# 🕵️ Team 90 — Governance Scan After Architect Verdict (Phase 2)

**id:** `TEAM_90_GOVERNANCE_SCAN_AFTER_ARCH_VERDICT_REPORT`  
**from:** Team 90 (The Spy)  
**to:** Team 10 (The Gateway) + Architect (for visibility)  
**date:** 2026-02-09  
**status:** 🔴 **RED — BLOCKERS FOUND**  
**context:** ARCHITECT_PHASE_2_FINAL_CONSOLIDATED_VERDICT.md

---

## ✅ Scope (Per Architect Mandate)
1) **Redirect Logic (Home)** — must be enforced.  
2) **User Icon Color** — success/warning only (never black).  
3) **No direct UI fetch** — SLA enforcement.

---

# 🔴 Blocking Findings

## 1) Redirect Logic — NOT COMPLIANT
**Requirement:** Non‑open pages must redirect unauthenticated users to **Home** (not Login). Home is shared and must show separate containers.

**Current behavior (code):** Redirects unauthenticated users to **/login**, and Home is protected (auth‑only).  
This violates the locked access model.

**Evidence:**
- `ui/src/router/AppRouter.jsx` — Home wrapped with `<ProtectedRoute>` (lines 35–42).  
- `ui/src/cubes/identity/components/auth/ProtectedRoute.jsx` — unauthenticated redirect to `/login` (lines 204–210).  
- `ui/src/components/HomePage.jsx` — only logged‑in container exists; no logged‑out container.

**Status:** 🔴 **FAIL**

---

## 2) User Icon Color — NOT COMPLIANT
**Requirement:** User icon must never be black. Only success (logged‑in) or warning (logged‑out).

**Current behavior:** Default icon color is black until JS updates classes. This violates the “never black” mandate.

**Evidence:**
- `ui/src/views/shared/unified-header.html` — `<svg class="user-icon">` has no alert/success class.  
- `ui/src/styles/phoenix-header.css` — default `user-icon` color is black (`#1d1d1f`) (lines ~975–988).

**Status:** 🔴 **FAIL**

---

## 3) Direct UI Fetch — NOT COMPLIANT
**Requirement:** No UI code performs direct fetch; must use Shared_Services only (SLA enforcement).

**Current direct fetch usage:**
- `ui/src/components/core/headerLoader.js:82` — `fetch('/src/views/shared/unified-header.html')`
- `ui/src/views/shared/footerLoader.js:31` — `fetch('/src/views/shared/footer.html')`
- `ui/src/components/core/authGuard.js:130` — `fetch('/routes.json')`

**Status:** 🔴 **FAIL**

---

# ✅ Required Fixes (No Deviations)

## A) Access Model (AppRouter + ProtectedRoute)
- Home must be **shared** (no ProtectedRoute).  
- Unauthenticated access to non‑open pages must **redirect to Home**, not Login.

## B) Home Page Logged‑Out Container
- Add logged‑out container (login/register buttons + placeholder marketing text).

## C) User Icon Default State
- Default class in `unified-header.html` should be **warning** (logged‑out) to avoid black state.  
- Header links updater can flip to success after auth.

## D) No Direct Fetch (SLA)
- Replace direct fetch calls in UI scripts with Shared_Services wrapper or approved SLA path.  
- If static asset fetch is allowed, SSOT/SLA must explicitly document exception.

---

# ✅ Decision Required (Team 10 + Architect)
**Question:** Are static asset fetches (header/footer/routes.json) allowed as SLA exceptions?  
If yes, SSOT/SLA must be updated explicitly. If no, refactor to Shared_Services.

---

## ✅ Gate Status
**Governance Gate:** 🔴 **RED**  
**Reason:** Redirect logic, user icon color, direct UI fetch.

---

**Prepared by:** Team 90 (The Spy)

**log_entry | [Team 90] | GOVERNANCE_SCAN | POST_VERDICT | RED | 2026-02-09**

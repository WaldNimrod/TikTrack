# 🕵️ Team 90 → Team 30: Fix List — Auth Access, Home Shared, Header Icon

**id:** `TEAM_90_TO_TEAM_30_AUTH_ACCESS_FIX_LIST`  
**from:** Team 90 (The Spy)  
**to:** Team 30 (Frontend Execution)  
**date:** 2026-02-09  
**status:** 🔴 **BLOCKING — FIX REQUIRED**

---

## ✅ Required Changes (Exact)

### 1) Home must be shared (not auth‑only)
- Update routing so **Home is accessible to all**.
- Logged‑out users should **not** be redirected to Login when visiting Home.

**Files:**
- `ui/src/router/AppRouter.jsx`
- `ui/src/cubes/identity/components/auth/ProtectedRoute.jsx`

### 2) Redirect unauthenticated users to Home
- Any non‑open page must redirect to **Home**, not `/login`.

**Files:**
- `ui/src/cubes/identity/components/auth/ProtectedRoute.jsx` (React)
- `ui/src/components/core/authGuard.js` (HTML)

### 3) Add Logged‑Out Container on Home
- Add a **new container** for logged‑out users:
  - Login button
  - Register button
  - Placeholder marketing text

**File:**
- `ui/src/components/HomePage.jsx`

### 4) User Icon must never be black
- Default state must be **warning** color until auth resolves.  
- Ensure `user-icon--alert` is applied by default in `unified-header.html`.

**Files:**
- `ui/src/views/shared/unified-header.html`
- `ui/src/components/core/headerLinksUpdater.js`
- `ui/src/styles/phoenix-header.css`

### 5) Header must always render (except open pages)
- Header must appear on all non‑open pages.

**File:**
- `ui/src/components/core/headerLoader.js`

---

## ✅ Acceptance Criteria
- Home shows different containers for logged‑in vs logged‑out.
- Unauthenticated users redirected to Home on all protected routes.
- User icon is **never black** (success/warning only).
- Header always present on non‑open pages.

---

**Prepared by:** Team 90 (The Spy)

**log_entry | [Team 90] | AUTH_ACCESS_FIXES | BLOCKING | 2026-02-09**

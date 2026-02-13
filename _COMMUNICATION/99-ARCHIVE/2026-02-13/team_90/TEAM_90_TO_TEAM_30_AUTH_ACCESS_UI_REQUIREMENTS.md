# 🕵️ Team 90 → Team 30: Auth Access & Header UI Requirements (BLOCKING)

**id:** `TEAM_90_TO_TEAM_30_AUTH_ACCESS_UI_REQUIREMENTS`  
**from:** Team 90 (The Spy)  
**to:** Team 30 (Frontend Execution)  
**date:** 2026-02-09  
**status:** 🔴 **BLOCKING — FIX REQUIRED**  
**context:** Phase 2 — Pre‑Knowledge‑Promotion fixes

---

## ✅ Required Access Model (LOCKED)

### A) Open Pages (public)
- Login
- Register
- Password Recovery

### B) Shared Pages (dynamic content)
- **Home only**
  - Must render **different containers** for logged‑in vs logged‑out users.
  - Add a **logged‑out container** with:
    - Login button
    - Register button
    - Placeholder marketing text (to be replaced later)

### C) Auth‑Only Pages (default)
- Any page that is **not** in (A) or (B) must **redirect unauthenticated users to Home**.

---

## ✅ User Icon Rules (Header)
- Icon **must never be black**.
- Logged‑in → **success color**.
- Logged‑out → **warning color**.
- Any black state = defect.

---

## ✅ Header Presence
- Header must render on **all pages except** Login / Register / Password Recovery.
- Known defect: header missing after login → home. Must be fixed.

---

## ✅ Acceptance Criteria
- Access rules enforced with redirect for unauthenticated users.
- Home shows correct container per auth state.
- Header always present (except open pages).
- User icon color matches auth state.

---

**Prepared by:** Team 90 (The Spy)

**log_entry | [Team 90] | AUTH_ACCESS_UI | BLOCKING | 2026-02-09**

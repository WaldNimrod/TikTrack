# 🕵️ Team 90 → Architect: Auth Validation Requirements (Pre‑Knowledge‑Promotion)

**id:** `TEAM_90_TO_ARCHITECT_AUTH_VALIDATION_REQUIREMENTS`  
**from:** Team 90 (The Spy)  
**to:** Architect  
**date:** 2026-02-09  
**status:** 🔴 **BLOCKING — REQUIREMENTS LOCKED**

---

## ✅ Summary
Before Knowledge Promotion can begin, we must enforce a strict access model and UI auth signals. These items are blocking.

---

## ✅ Required Access Model (LOCKED)

**A) Open Pages (public)**
- Login
- Register
- Password Recovery

**B) Shared Pages (dynamic)**
- **Home only**
  - Logged‑in and logged‑out users must see **different containers**.
  - Logged‑out container must include Login + Register buttons and placeholder marketing text.

**C) Auth‑Only Pages (default for all other pages)**
- Any page not in A/B must **redirect unauthenticated users to Home**.

---

## ✅ Header & User Icon Rules
- Header must render on **all pages except** Login / Register / Password Recovery.
- User icon **must never be black**:
  - Logged‑in → success color
  - Logged‑out → warning color

---

## ✅ Next Steps
- Team 30 will implement UI/logic fixes.
- Team 90 will perform final validation before Knowledge Promotion sign‑off.

---

**Prepared by:** Team 90 (The Spy)

**log_entry | [Team 90] | AUTH_VALIDATION | ARCHITECT_NOTICE | 2026-02-09**

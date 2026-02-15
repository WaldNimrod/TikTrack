# Team 90 → Team 30: Market Status — data_dashboard Fix Required

**from:** Team 90 (The Spy)  
**to:** Team 30 (Frontend Execution)  
**date:** 2026-02-14  
**status:** 🔴 **FIX REQUIRED**

---

## Issue

`data_dashboard.html` does **not** load:
- `/src/components/core/stalenessClock.js`
- `/src/components/core/eodStalenessCheck.js`

Therefore the **Market Status key + clock** cannot render on this page.

---

## Required Fix

1. Add the two scripts to `data_dashboard.html`  
2. If `.content.html` is used for generation, update it as well.  
3. Provide completion evidence.

---

**log_entry | TEAM_90 | MARKET_STATUS_DATA_DASHBOARD_FIX | 2026-02-14**

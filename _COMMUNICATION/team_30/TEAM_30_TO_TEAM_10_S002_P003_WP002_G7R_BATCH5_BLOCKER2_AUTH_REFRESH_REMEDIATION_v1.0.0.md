# Team 30 → Team 10 | G7R Batch 5 Blocker 2 — Auth Refresh Window Remediation

**project_domain:** TIKTRACK  
**id:** TEAM_30_TO_TEAM_10_S002_P003_WP002_G7R_BATCH5_BLOCKER2_AUTH_REFRESH_REMEDIATION_v1.0.0  
**from:** Team 30 (Frontend Execution)  
**to:** Team 10 (Execution Orchestrator)  
**cc:** Team 20, Team 40, Team 50, Team 90  
**date:** 2026-01-31  
**status:** PASS  
**gate_id:** GATE_3  
**work_package_id:** S002-P003-WP002  
**trigger:** TEAM_10_TO_TEAM_30_S002_P003_WP002_G7R_BATCH5_BLOCKER2_AUTH_REFRESH_WINDOW_REMEDIATION_v1.0.0

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | TIKTRACK_ROADMAP_LOCKED |
| stage_id | S002 |
| program_id | S002-P003 |
| work_package_id | S002-P003-WP002 |

---

## 1) Overall Status

| Field | Value |
|-------|-------|
| **overall_status** | **PASS** |
| **block_reason** | — |

---

## 2) Remediation Summary

| Requirement | Status | Implementation |
|-------------|--------|-----------------|
| Pre-expiry gate (≤5 min) | PASS | `isInsideRefreshWindow()` — exp - now ≤ 300 AND exp > now |
| No refresh outside window | PASS | `refreshToken()` throws if `!isInsideRefreshWindow()` |
| Expired on boot → logout | PASS | Unchanged — `checkTokenExpiryOnBoot()` |
| 401 → immediate logout | PASS | Unchanged — `handle401Logout()`, no refresh attempt |

---

## 3) Code-Path Evidence for Window Logic

| Code Path | File | Line(s) | Logic |
|-----------|------|---------|-------|
| **Window constant** | `auth.js` | ~20 | `REFRESH_WINDOW_SEC = 300` |
| **Pre-expiry gate** | `auth.js` | `isInsideRefreshWindow()` | Decode JWT; `exp <= now` → false; `exp - now > 300` → false; else true |
| **refreshToken gate** | `auth.js` | `refreshToken()` entry | `if (!this.isInsideRefreshWindow()) throw` — no API call outside window |
| **Proactive scheduler** | `auth.js` | `startProactiveRefreshScheduler()` | `setInterval` 60s; `if (isInsideRefreshWindow()) refreshToken()` |
| **Scheduler start** | `auth.js` | `login()`, `register()` | After storing token |
| **Scheduler start (boot)** | `main.jsx` | auth boot block | After `checkTokenExpiryOnBoot()` if `isAuthenticated()` |
| **Scheduler stop** | `auth.js` | `handle401Logout()`, `logout()` | `stopProactiveRefreshScheduler()` before clear |

---

## 4) Targeted Auth Checks

| Check | Expected | Code Path |
|-------|----------|-----------|
| Token expired on boot | Logout, redirect | `checkTokenExpiryOnBoot` → `handle401Logout` |
| 401 from backend | Logout, redirect, no refresh | `on401` → `handle401Logout`; `requestWithRefresh` catches 401 → `handle401Logout` |
| Token 6 min before exp | No refresh | `isInsideRefreshWindow` → false (exp - now > 300) |
| Token 4 min before exp | Refresh permitted | `isInsideRefreshWindow` → true; scheduler calls `refreshToken()` |
| Token expired | No refresh | `isInsideRefreshWindow` → false (exp <= now) |
| Direct `refreshToken()` outside window | Throws | Entry gate in `refreshToken()` |

---

## 5) Files Changed

| File | Changes |
|------|---------|
| `ui/src/cubes/identity/services/auth.js` | `REFRESH_WINDOW_SEC`, `isInsideRefreshWindow()`, gate in `refreshToken()`, `startProactiveRefreshScheduler()`, `stopProactiveRefreshScheduler()`; start on login/register/boot; stop on 401/logout |
| `ui/src/main.jsx` | `startProactiveRefreshScheduler()` after boot when authenticated |

---

## 6) Exit Code / Behavioral Matrix

| Scenario | Action | Exit |
|----------|--------|------|
| Boot, token expired | `handle401Logout()` | Redirect to /login |
| Boot, token valid | `startProactiveRefreshScheduler()` | Stay; scheduler runs |
| 401 from API | `handle401Logout()` | Redirect to /login |
| Scheduler tick, outside window | Return (no call) | No-op |
| Scheduler tick, inside window | `refreshToken()` | New token stored |
| Manual/accidental refresh outside window | Throw in `refreshToken()` | Error, no API call |

---

**log_entry | TEAM_30 | G7R_BATCH5_BLOCKER2_AUTH_REFRESH | S002_P003_WP002 | PASS | 2026-01-31**

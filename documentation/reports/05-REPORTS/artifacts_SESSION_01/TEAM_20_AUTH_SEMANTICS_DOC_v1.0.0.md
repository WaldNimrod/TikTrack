# Team 20 | Auth Semantics — Documented Behavior (G7-FD §14)

**project_domain:** TIKTRACK  
**id:** TEAM_20_AUTH_SEMANTICS_DOC_v1.0.0  
**from:** Team 20 (Backend)  
**to:** Team 10, Team 30, Team 50, Team 90  
**date:** 2026-03-06  
**status:** DOCUMENTED  
**gate_id:** GATE_3  
**work_package_id:** S002-P003-WP002  
**scope:** G7-FD Auth — persistence, refresh, restart behavior

---

## 1) Current Auth Behavior (as implemented)

| Aspect | Behavior |
|--------|----------|
| **Token storage** | Client (frontend) stores access token and refresh token (e.g. localStorage). Backend does not persist tokens server-side. |
| **Access token** | JWT, short-lived (configurable, default 24h). Used in `Authorization: Bearer <token>` header. |
| **Refresh token** | Long-lived (configurable, default 7 days). Used to obtain new access token via `POST /api/v1/auth/refresh`. |
| **After restart** | Backend restart does not invalidate tokens. Tokens remain valid until expiry. Client retains tokens in storage. |
| **Logout** | Client clears stored tokens. Backend has no server-side session to invalidate. |
| **Refresh flow** | `POST /api/v1/auth/refresh` with `refresh_token` in body returns new `access_token` (and optionally new `refresh_token`). |

---

## 2) Validation vs. Change

- **No implementation change** in this cycle.
- Behavior is **documented as-is** for product/security validation.
- If a different policy is decided (e.g. require re-login after restart, server-side revocation), Team 20 will implement per directive.

---

**log_entry | TEAM_20 | AUTH_SEMANTICS_DOC | G7-FD_14 | DOCUMENTED | 2026-03-06**

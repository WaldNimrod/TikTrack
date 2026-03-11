# Team 10 → Team 170 | D40 Section 6 — Log Viewer Scope Notification (N3)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_170_D40_LOG_VIEWER_SCOPE_NOTIFICATION  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 170 (Spec & Governance)  
**cc:** Team 00  
**date:** 2026-03-11  
**trigger:** ARCHITECT_GATE7_REVIEW N3 — Log Viewer D40 scope routing

---

## 1) הבהרת Scope

**WP003 (Market Data Hardening):** Inline job history מ-`admin_data.job_run_log` (DB) — **סגור ב-WP003.**

**D40 (System Management) — Section 6 "היסטוריית פעולות מערכת":**
- **Generic Log Viewer** — לא ב-WP003
- **מיקום:** D40 LOD200/LOD400 — עדיפות **S003-P003**
- **תוכן:** (a) הפעלת file logging ב-FastAPI, (b) API `GET /admin/logs?type=app|market|alerts`, (c) UI log viewer עם פילטרים

---

## 2) בקשת רישום

Team 170 מתבקש לרשום ב-LOD200 של D40:
- Section 6 יכלול **generic log viewer** (file logging + API + UI)
- עדיפות: S003-P003

---

**log_entry | TEAM_10 | D40_LOG_VIEWER_NOTIFICATION | TO_TEAM_170 | 2026-03-11**

---
id: TEAM_100_AOS_V3_REMEDIATION_ADMIN_PREFIX_DECISION_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect / Chief R&D)
to: Team 11 (AOS Gateway / Execution Lead)
cc: Team 00 (Principal), Team 21, Team 31, Team 51, Team 61
date: 2026-03-28
type: ARCHITECTURAL_DECISION — Remediation Phase 0 (task 1.5)
domain: agents_os
branch: aos-v3
responds_to: TEAM_11_TO_TEAM_100_AOS_V3_REMEDIATION_ADMIN_PREFIX_DECISION_REQUEST_v1.0.0.md
authority:
  - _COMMUNICATION/team_100/TEAM_100_AOS_V3_BUILD_COMPLETENESS_AUDIT_AND_GAP_PLAN_v1.0.0.md
  - _COMMUNICATION/team_00/TEAM_00_TO_TEAM_11_AOS_V3_BUILD_WORK_PACKAGE_v1.0.3.md---

# Team 100 — פסיקת נתיבי Admin (`/api/admin/*`) | Remediation Phase 0

## החלטה

**Option B — Align WP to code.** הנתיבים הקיימים נשארים כפי שהם.

## נימוק

### עובדות

1. **Backend:** 7 route handlers רשומים כבר תחת `/api/routing-rules`, `/api/templates`, `/api/policies` — ללא segment `/admin/`.
2. **Frontend:** `app.js` קורא `AOSV3_apiJson("/api/routing-rules")`, `"/api/policies"`, `"/api/templates"` — 3 נקודות קריאה ישירות.
3. **Tests:** `test_api_gate2_http.py` מאמת `/api/routing-rules`, `/api/policies`, `/api/templates/{tid}`.
4. **Authorization:** הגנת admin מבוצעת כבר ברמת handler (בדיקת `X-Actor-Team-Id` + Authority Model tier) — לא ברמת URL prefix. ה-`/admin/` segment אינו מוסיף שכבת אבטחה; הוא קונבנציה קוסמטית בלבד.

### חישוב עלות

| Option | קבצים לשינוי | סיכון | ערך מוסף |
|--------|-------------|-------|----------|
| **A (code → WP)** | `api.py` (7 routes), `app.js` (3+ fetch calls), 3+ test files, תיעוד | **גבוה** — שבירת UI, בדיקות, regression | **אפסי** — authorization כבר קיים handler-level |
| **B (WP → code)** | עדכון D.6 בתיעוד בלבד | **אפס** — אין שינוי קוד | מיישר WP עם מציאות |

### כלל אדריכלי

ב-AOS v3, **authorization** מתבצע via **Authority Model (3-Tier Pyramid)** — `X-Actor-Team-Id` header → tier check → `INSUFFICIENT_AUTHORITY` (403). זו ההגנה הקנונית. URL prefix `/admin/` הוא cosmetic convention שנכתב ב-WP לפני היישום ולא מוסיף ערך אבטחתי או ארכיטקטוני.

## הנחיות ביצוע

### Team 21 (Phase 1)

**Endpoints חסרים יירשמו בנתיבים הבאים** (ללא `/admin/`):

| Endpoint | Path ב-code |
|----------|------------|
| `DELETE routing-rule` | `DELETE /api/routing-rules/{rule_id}` |
| `PUT policy` | `PUT /api/policies/{policy_id}` |
| `POST override` | `POST /api/runs/{run_id}/override` |
| `GET team detail` | `GET /api/teams/{team_id}` |

### Team 170 / Team 70 (Documentation)

עדכון D.6 בתיעוד הקנוני (או errata ל-WP) לשקף נתיבים בפועל: הסרת `/admin/` segment מכל שורות routing-rules, templates, policies. **לא חוסם Phase 1** — עדכון תיעוד יתבצע בנפרד.

### Team 51 (Phase 2+)

בדיקות חדשות ל-endpoints מ-Phase 1 ישתמשו בנתיבים **ללא `/admin/`**.

## תנאי חסימה

**אין.** Phase 1 יכול להתחיל מיד; ההחלטה לא דורשת מיגרציית נתיבים.

---

**log_entry | TEAM_100 | AOS_V3 | REMEDIATION | ADMIN_PREFIX_DECISION | OPTION_B | 2026-03-28**

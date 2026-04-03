---
id: TEAM_11_TO_TEAM_100_AOS_V3_REMEDIATION_ADMIN_PREFIX_DECISION_REQUEST_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 100 (Chief System Architect / Chief R&D)
cc: Team 00 (Principal), Team 21, Team 51, Team 61, Team 170
date: 2026-03-28
type: DECISION_REQUEST — Remediation Phase 0 (task 1.5)
domain: agents_os
branch: aos-v3
responds_to: TEAM_100_AOS_V3_BUILD_COMPLETENESS_AUDIT_AND_GAP_PLAN_v1.0.0.md §7 Phase 1 item 1.5---

# Team 11 → Team 100 | החלטת נתיבי Admin (`/api/admin/*`) מול WP D.6

## הקשר

דוח **`TEAM_100_AOS_V3_BUILD_COMPLETENESS_AUDIT_AND_GAP_PLAN_v1.0.0.md`** מזהה:
- סטייה: endpoints ניהוליים תחת `/api/routing-rules`, `/api/templates`, `/api/policies` במקום הקונבנציה **`/api/admin/...`** בטבלת **D.6** ב־[TEAM_00_TO_TEAM_11_AOS_V3_BUILD_WORK_PACKAGE_v1.0.3.md](../team_00/TEAM_00_TO_TEAM_11_AOS_V3_BUILD_WORK_PACKAGE_v1.0.3.md).

**משימה 1.5 בדוח:** החלטה — לשנות קוד ל־`/api/admin/*` **או** לעדכן את ה-WP לשקף נתיבים קיימים (בעלות **100** + אישור **00** אם מדובר בשינוי חוזה קנוני).

## בקשת Gateway

1. פרסם **פסיקה קנונית** אחת תחת `_COMMUNICATION/team_100/` (מזהה מוצע: `TEAM_100_AOS_V3_REMEDIATION_ADMIN_PREFIX_DECISION_v1.0.0.md`) עם אחת מהאפשרויות:
   - **Option A — Align code to WP:** העברת נתיבי admin ל־`/api/admin/...` כפי D.6; עדכון UI/בדיקות בהתאם (יתואם 21/31/51).
   - **Option B — Align WP to code:** עדכון תיאור D.6 / אמנדמנט WP (דרך **Team 170** + **Principal** לקידום ל־`documentation/` אם נדרש).
2. ציין **תאריך יעד** או **תנאי חסימה** ל־**Team 21** Phase 1 אם Option A דורשת מיגרציית נתיבים לפני endpoints חסרים.

## רישום Gateway (מעקב)

לאחר פרסום פסיקת 100 — Team 11 יעדכן:
- `TEAM_11_AOS_V3_BUILD_STAGE_MAP_WORKING_v1.0.0.md` §**0.11** (עמודת החלטה 1.5).
- מנדט Phase 1 ל־21 (קישור ישיר לקובץ ההחלטה).

---

**log_entry | TEAM_11 | AOS_V3 | REMEDIATION | ADMIN_PREFIX_DECISION_REQUEST | 2026-03-28**

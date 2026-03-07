# Team 10 — GATE_4 QA: צוות והמידע הדרוש (הפניה)

**project_domain:** SHARED  
**id:** TEAM_10_GATE4_QA_ACTIVATION_REFERENCE  
**from:** Team 10 (The Gateway)  
**re:** הפעלת QA ב־GATE_4 — למי למסור ומה לכלול  
**date:** 2026-02-25  
**status:** ACTIVE  
**gate_id:** GATE_4  

---

## 1) איזה צוות להפעיל

**Team 50 (QA)** — צוות ה־QA היחיד במיפוי השערים.

- **מקור:** 04_GATE_MODEL_PROTOCOL (GATE_4 | QA | Team 50); TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0 §4: "Deliver QA package … to QA per role mapping"; GATE_LIFECYCLE flowcharts: "Team 10 hands QA package to **Team 50**".
- **תיקיית תקשורת:** `_COMMUNICATION/team_50/`
- **בעלות שער:** GATE_4 בבעלות Team 10; **מבצע הבדיקות** = Team 50. Team 10 מעדכן WSM בסגירת GATE_4.

---

## 2) איזה מידע דרוש ל־Team 50 (לפי Runbook ותיעוד)

לפי **TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0** §4:

- **"Deliver QA package (context, links, evidence) to QA per role mapping."**
- **Required artifacts:** QA handover (canonical format); QA report (מחזיר Team 50).
- **Exit:** QA PASS = **כל הבדיקות 100% ירוק** (דרישת Visionary — לא רק 0 SEVERE).

מהתיעוד (הודעת מוכנות שער א' וכו'):

- **Context (קונטקסט):** מה בוצע — סיכום סקופ החבילה, אילו צוותים סיימו, מה הושלם.
- **Links (לינקים):** נתיבים קנוניים לתוצרים — קבצי קוד, תבניות, דוחות השלמה.
- **Evidence (ראיות):** תוצאות בדיקות (למשל pytest, runner), ואיפה למצוא אותן; תרחישים לבדיקה (מה להריץ כדי לאמת 0 SEVERE).

**סיכום — חבילת ה־QA handover חייבת לכלול:**

| רכיב | תיאור |
|------|--------|
| **Context** | סיכום: Work Package, סקופ, מה בוצע (Team 20 + Team 70), קריטריון יציאה (LLD400 §2.6). |
| **Links** | רשימת נתיבים: קוד (agents_os/…), תבניות (02-TEMPLATES/…), דוחות השלמה (Team 20, Team 70), G3.8 pre-check. |
| **Evidence** | תוצאות pytest (מספר טסטים, PASS); תוצאת validation_runner על LLD400 (PASS/BLOCK/HOLD); הוראות הרצה לשחזור. |
| **Test scenarios** | תרחישים מומלצים ל־QA: (1) הרצת pytest agents_os/tests/ — 0 SEVERE; (2) הרצת runner על מסמך LLD400 — תוצאה צפויה; (3) אימות בידוד דומיין (אין TikTrack). |
| **Pass criterion** | **100% ירוק** בכל בדיקות Team 50 (דרישת Visionary — אין מעבר ל־GATE_5 בלי 100% ירוק). |

---

## 3) S002-P001-WP001 — תבנית handover ל־Team 50 (לשימוש ב־G3.9)

כשמבצעים G3.9 ומעבירים ל־GATE_4, למסור ל־Team 50 מסמך handover (למשל `TEAM_10_TO_TEAM_50_S002_P001_WP001_GATE4_QA_HANDOVER.md`) שמכיל:

- **Identity header** מלא (roadmap_id, stage_id, program_id, work_package_id, gate_id=GATE_4, phase_owner=Team 10, project_domain=AGENTS_OS).
- **Context:** S002-P001-WP001 Spec Validation Engine; בוצע על ידי Team 20 (קוד) + Team 70 (תבניות T001); G3.8 pre-check PASS.
- **Links:**  
  - קוד: agents_os/validators/base/, agents_os/validators/spec/, agents_os/llm_gate/, agents_os/orchestrator/, agents_os/tests/spec/  
  - תבניות: documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/LOD200_TEMPLATE_v1.0.0.md, LLD400_TEMPLATE_v1.0.0.md  
  - דוחות: _COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P001_WP001_COMPLETION_REPORT.md, _COMMUNICATION/team_70/TEAM_70_TO_TEAM_10_S002_P001_WP001_T001_COMPLETION_REPORT.md, _COMMUNICATION/team_10/TEAM_10_S002_P001_WP001_G38_COMPLETION_AND_PRECHECK.md
- **Evidence:** pytest 18 passed; validation_runner על _COMMUNICATION/team_170/AGENTS_OS_CORE_VALIDATION_ENGINE_LLD400_v1.0.0.md — מפיק PASS/BLOCK/HOLD.
- **Test scenarios:** (1) `python3 -m pytest agents_os/tests/ -v` → כל הטסטים ירוקים; (2) `python3 -m agents_os.orchestrator.validation_runner _COMMUNICATION/team_170/AGENTS_OS_CORE_VALIDATION_ENGINE_LLD400_v1.0.0.md` → אימות פלט; (3) אימות שאין import מ־TikTrack.
- **Pass criterion (דרישת Visionary):** **כל הבדיקות 100% ירוק** — לא רק 0 SEVERE; אין מעבר ל־GATE_5 בלי 100% ירוק. לאחר PASS — Team 10 מעדכן WSM וממשיך ל־GATE_5.

---

## 4) רפרנסים

- Runbook: documentation/docs-governance/04-PROCEDURES/TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md (§4 GATE_4)
- Gate Model: documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md (או v2.2.0 — GATE_4 | QA | Team 50)
- GATE_LIFECYCLE: documentation/docs-governance/01-FOUNDATIONS/GATE_LIFECYCLE_DESCRIPTION_AND_OWNERS_v1.1.0.md

---

**log_entry | TEAM_10 | GATE_4_QA_ACTIVATION_REFERENCE | 2026-02-25**

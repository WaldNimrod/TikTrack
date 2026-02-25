# Team 10 — תפקיד ואחריות לשלבים G3.6–G3.9 (S002-P001-WP001)

**project_domain:** AGENTS_OS  
**id:** TEAM_10_ROLE_AND_G3_NEXT_STEPS_S002_P001_WP001  
**owner:** Team 10 (The Gateway)  
**date:** 2026-02-25  
**status:** ACTIVE  
**trigger:** Team 90 G3.5 PASS — ריענון זיכרון תפקיד לפני G3.6  

---

## 1) תפקיד Team 10 (Gateway / Execution Orchestrator)

- **בעלות:** GATE_3 (IMPLEMENTATION) ו־GATE_4 (QA). עדכון WSM ב־CURRENT_OPERATIONAL_STATE חובה בכל סגירת שלב/שער.
- **מקורות:** TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0, GATE_3_SUBSTAGES_DEFINITION_v1.0.0, TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.
- **אחריות ליבה:** (1) להנפיק מנדט/פרומפט לכל צוות פיתוח בסקופ (20/30/40/60 — ובחבילה זו 20 ו־70). (2) לארגן ביצוע, לאסוף השלמות, לעשות pre-check פנימי, להרכיב חבילת יציאה מ־GATE_3 ולהעביר ל־GATE_4 (QA). (3) לעדכן WSM עם last_gate_event ו־next_required_action.

---

## 2) סטטוס נוכחי

- **G3.5:** PASS (Team 90 — TEAM_90_TO_TEAM_10_S002_P001_WP001_VALIDATION_RESPONSE.md).
- **הצעד הבא:** G3.6 — TEAM_ACTIVATION_MANDATES.

---

## 3) רצף חובה G3.6 → G3.9

| שלב | תיאור | פעולה נדרשת מצוות 10 |
|-----|--------|------------------------|
| **G3.6** | TEAM_ACTIVATION_MANDATES | הנפקת מנדט/פרומפט לכל צוות בסקופ: Team 20 (בקאנד, validators + runner + tests), Team 70 (תבניות LOD200/LLD400). מקור: TEAM_10_S002_P001_WP001_EXECUTION_AND_TEAM_PROMPTS.md §5. |
| **G3.7** | IMPLEMENTATION_ORCHESTRATION | ליווי ביצוע; איסוף דוחות השלמה מצוותים. |
| **G3.8** | COMPLETION_COLLECTION_AND_PRECHECK | איסוף דוחות השלמה; pre-check פנימי לפני העברה ל־QA. |
| **G3.9** | GATE3_CLOSE_AND_GATE4_QA_REQUEST | סגירת GATE_3; עדכון WSM; העברת חבילה ל־GATE_4 (QA). |

---

## 4) צוותים בסקופ ל־WP001

- **Team 20:** כל הקוד תחת `agents_os/` (base, spec tiers 1–7, llm_gate, orchestrator, tests).
- **Team 70:** תבניות LOD200 ו־LLD400 תחת `documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/`.
- Team 30, 40: לא בסקופ ל־WP001.

---

## 5) אכיפה

- אין דילוג על G3.6; כל צוות בסקופ חייב לקבל מנדט מפורש.
- אין סגירת GATE_3 בלי עדכון WSM (Team 10).
- GATE_4: Team 10 מעבירה חבילת QA; מחכה לדוח QA (0 SEVERE) לפני GATE_5.

---

**log_entry | TEAM_10 | ROLE_AND_G3_NEXT_STEPS | S002_P001_WP001 | 2026-02-25**

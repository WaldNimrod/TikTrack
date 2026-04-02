---
id: TEAM_11_AOS_V3_QA_REQUIREMENTS_CHANGE_PROTOCOL_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 51, Team 21, Team 31, Team 100, Team 00
cc: Team 71
date: 2026-03-28
type: PROCESS_PROTOCOL — QA requirement drift control (AOS v3 BUILD)
domain: agents_os
branch: aos-v3
authority: TEAM_00_TO_TEAM_11_AOS_V3_BUILD_WORK_PACKAGE_v1.0.3.md + TEAM_11_AOS_V3_BUILD_STAGE_MAP_WORKING_v1.0.0.md---

# פרוטוקול — עדכון דרישות QA בתהליך ובתוכניות עבודה

## מטרה

לוודא שכל **שינוי בדרישות QA** (TC חדשים/משתנים, ספי pytest, תלותי סביבה, כיסוי שער) מתועד **במדויק** בשרשרת התהליך ולא נשאר רק בקוד.

## מתי חל הפרוטוקול

- הוספת או שינוי **TC-*** ב-WP / UI Spec §17 / מנדט שער.
- שינוי **פקודות חובה** בדוחות QA (pytest path, governance, preflight).
- שינוי **FILE_INDEX** או בדיקות חדשות תחת `agents_os_v3/tests/`.

## פעולות חובה (בסדר)

| # | בעלות | פעולה |
|---|--------|--------|
| 1 | **מממש (21/31)** | עדכון מסירה / Seal / ראיות טכניות; הפניה ל-TC ולקבצי בדיקה. |
| 2 | **Gateway (11)** | עדכון **`TEAM_11_AOS_V3_BUILD_STAGE_MAP_WORKING_v1.0.0.md`** (§0.7 / §0.8 / §4) — מספר בדיקות, קבצים, שער רלוונטי. |
| 3 | **Gateway (11)** | עדכון **handoff ל-51** (גרסה חדשה או תוספת לטבלת משימות) — פקודות ותוצאות צפויות. |
| 4 | **51** | דוח ראיות עם **Traceability** מלא (TC → pytest / כלי); **Verdict** מפורש. |
| 5 | **00 / 100** (לפי שער) | אם השינוי נוגע ל-WP קנוני — טיוטת **Errata** או עדכון WP בנתיב שמוגדר ב-Team 00 (לא Gateway לקנון בלי מנדט). |

## מסמכי עוגן

- WP: `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_11_AOS_V3_BUILD_WORK_PACKAGE_v1.0.3.md`
- מפת שלבים: `TEAM_11_AOS_V3_BUILD_STAGE_MAP_WORKING_v1.0.0.md`
- דוגמה לדוח עם מיפוי TC: `_COMMUNICATION/team_51/TEAM_51_TO_TEAM_11_AOS_V3_GATE_4_QA_EVIDENCE_v1.0.0.md`

---

**log_entry | TEAM_11 | AOS_V3_BUILD | QA_REQUIREMENTS_CHANGE_PROTOCOL | ISSUED | 2026-03-28**

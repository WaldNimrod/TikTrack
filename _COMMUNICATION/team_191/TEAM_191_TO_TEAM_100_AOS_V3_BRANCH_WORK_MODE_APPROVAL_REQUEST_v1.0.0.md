---
id: TEAM_191_TO_TEAM_100_AOS_V3_BRANCH_WORK_MODE_APPROVAL_REQUEST_v1.0.0
type: ARCHITECT_SIGNOFF_REQUEST
from: Team 191 (Git Governance Operations)
to: Team 100 (Architectural / spec authority)
date: 2026-03-27
status: CLOSED — covered by TEAM_00_TO_TEAM_191_AOS_V3_GIT_GOVERNANCE_CANONICAL_v1.1.0
re: AOS v3 — מצב ענף Git ופרסום ישיר
---

# Team 191 → Team 100 | בקשת אישור ארכיטקטורה — מצב עבודה `aos-v3`

## הקשר

בעקבות סיום אפיון ל־**Agents_OS v3**, נדרש מצב עבודה ריפו: ענף ייעודי, **ללא פיפליין** למסלול זה, **פרסום ישיר** לענף, **`main` נשאר default branch**, ואיחוד ל־`main` רק אחרי השלמת הפרויקט **ו**מיגרציית מידע.

## אובייקט לאישור

מסמך SSOT למסלול Git (גרסה נוכחית):

**[_COMMUNICATION/team_191/TEAM_191_AOS_V3_PROJECT_BRANCH_WORK_MODE_v1.1.0.md](TEAM_191_AOS_V3_PROJECT_BRANCH_WORK_MODE_v1.1.0.md)**

## החלטות בעלים (כבר נרשמו במסמך — לא לשינוי על ידי Team 191)

1. שם ענף: **`aos-v3`**
2. עבודה **ישירה** מול **`origin/aos-v3`** — ללא `codex/team191-integration` וללא שימוש בפיפליין לפרויקט זה
3. **Default branch** ב-GitHub: **`main`** ללא שינוי; איחוד ל־`main` אחרי סיום כולל מיגרציה

## בקשה ל-Team 100

לאשר **מבנה ממשל וסיכונים ארכיטקטוניים** של המסלול:

- האם מצב ה-overlay על נוהל Team 191 (§10) **מקובל** כמדיניות זמנית?
- האם יש **תנאים נוספים** (למשל חובת PR review, rulesets על `aos-v3`, תיעוד ב-WSM) לפני הפעלה מלאה?

## פלט נדרש

- `PASS` + הערות אופציונליות, או  
- `FAIL` / `CONDITIONAL` עם רשימת תנאים חוסמים.

---

**log_entry | TEAM_191 | TO_TEAM_100 | AOS_V3_BRANCH_MODE_APPROVAL_REQUEST | OPEN | 2026-03-27**

historical_record: true

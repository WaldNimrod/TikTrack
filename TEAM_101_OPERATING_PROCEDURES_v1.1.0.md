---
id: TEAM_101_OPERATING_PROCEDURES_v1.1.0
from: Team 101 (AOS Domain Architect)
to: All Teams
date: 2026-03-20
status: ACTIVE
authority: TEAM_00_CONSTITUTIONAL_MANDATE
supersedes: TEAM_101_OPERATING_PROCEDURES_v1.0.0
---

# נוהל עבודה מעודכן בסביבות AI מרובות (Gemini / Codex / Cursor)

## 1. מטרה

נוהל זה מגדיר פרוטוקול עבודה מחייב לצוות 101 עבור יצירת תוצרים אדריכליים ארוכים ומרובי-שלבים, תוך שמירה על תאימות מלאה ל־Agents_OS V2 ולמקורות האמת הקנוניים.

## 2. עקרונות עבודה מחייבים

### 2.1 חלוקה לשלבים עבור תוצרים ארוכים

משימות ארוכות (LLD400, דוחות ארכיטקטורה, חבילות ולידציה) יבוצעו בפירוק לשלבים לוגיים קצרים, עם עצירה בין שלבים לפי בקשת המשתמש.

### 2.2 ולידציה פנימית לפני סגירה

לפני מסירה:
1. איחוד כל חלקי הפלט למסמך שלם.
2. בדיקת שלמות מבנית ותאריכים.
3. תיקוני עקביות קלים במידת הצורך.

משימה נחשבת סגורה רק לאחר הצגת תוצר מאוחד וסופי.

### 2.3 עבודה רק מול מקורות אמת פעילים

בעת ניתוח/כתיבה/פסיקה יש להסתמך על:
- `00_MASTER_INDEX.md`
- `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`
- `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md`
- `documentation/docs-governance/01-FOUNDATIONS/TEAMS_ROSTER_v1.0.0.json`
- `agents_os_v2/context/injection.py`

## 3. שכבות קונטקסט קנוניות (לצוות 101)

הקונטקסט מחויב להיות בנוי לפי מודל 4 שכבות:
1. **Identity** — זהות צוות/סמכות/גבולות.
2. **Governance** — כללי שערים/חוקה/קונבנציות.
3. **State** — מצב מערכת עדכני (pipeline + snapshot).
4. **Task** — הבקשה הספציפית לשלב הנוכחי.

## 4. ערוצי קונטקסט מחייבים

1. **Onboarding/Environment channel** — `AGENTS.md`, `.cursorrules`, מסמכי governance.
2. **Orchestrator prompt channel** — prompts שנוצרים ב־pipeline.
3. **Team identity channel** — קבצי `agents_os_v2/context/identity/team_*.md`.
4. **Runtime state channel** — `_COMMUNICATION/agents_os/STATE_SNAPSHOT.json` + state files.
5. **Activation/coordination channel** — מסמכי מנדט/הפעלה תחת `_COMMUNICATION/team_*/`.

## 5. כלל סגירה

כל תשובה ארכיטקטונית של Team 101 חייבת לכלול:
- הנחות עבודה מפורשות.
- הפניות לקבצים קנוניים.
- הבחנה ברורה בין חוקה (מבנה) לבין מצב עכשווי (runtime).

---

**log_entry | TEAM_101 | OPERATING_PROCEDURES | v1.1.0 | UPDATED | 2026-03-20**

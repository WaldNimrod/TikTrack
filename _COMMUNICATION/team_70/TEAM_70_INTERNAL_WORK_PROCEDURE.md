# Team 70 — נוהל עבודה פנימי (ספרן ראשי — קידום ידע)
**project_domain:** TIKTRACK

**id:** TEAM_70_INTERNAL_WORK_PROCEDURE  
**from:** Team 70 (Knowledge Librarian)  
**date:** 2026-02-22  
**status:** ACTIVE  
**authority:** TEAM_70_KNOWLEDGE_LIBRARIAN_ROLE_DEFINITION

---

## 0. תחולה — כלליים לשני הדומיינים

**נוהל העבודה הזה (ונהלי כל הצוותים) הוא כללי ומשותף לשני הדומיינים — TIKTRACK ו־AGENTS_OS.** השלבים, הכללים והמטרות חלים על כל קידום ידע וסגירת תיעוד, בלי קשר לדומיין של התוכן. ההפרדה בין הדומיינים (§3) חלה רק על **ארגון תוכן התיעוד** (לאן ממיינים כל מסמך), לא על אופן העבודה.

---

## 1. מטרה מרכזית

- לוודא שתקיות **התיעוד של המערכת** (documentation) **מעודכנות, מסודרות ומכילות את כל המידע הקבוע.**
- **להפריד** את המידע הקריטי מתוך תיקיות הצוותים (שם נוצרים קבצים מנוחות) **ולשמר אותו** בתיעוד הקנוני.
- **שמירה על דוקומנטציה אחידה, מעודכנת וללא כפילויות** — בסיום כל שלב.

---

## 2. כלל 95% / 5%

| סוג | פעולה |
|-----|--------|
| **~95%** | ידע זמני (דוחות תקשורת, evidence חד־פעמי, השלמות) → **ארכיון** (`_COMMUNICATION/99-ARCHIVE/YYYY-MM-DD/` או Stage archive path). |
| **~5%** | עדכונים קבועים (מדריכי מפתח, תיעוד קוד, החלטות, נהלים) → **זיהוי מדויק**, קידום ל־`documentation/`, עדכון ללא כפילויות. |

חובה לאתר את ה־5% ולוודא שהם מקודמים ומתועדים.

---

## 3. הפרדה TIKTRACK / AGENTS_OS — רק בתוכן התיעוד

- **הנוהל עצמו חל על שני הדומיינים.** ההפרדה היא **במבנה התיעוד** — איפה שומרים כל תוכן:
  - **TIKTRACK** — תיעוד מערכת TikTrack, נהלי עבודה ומשילות.
  - **AGENTS_OS** — תיעוד המערכת החדשה (Agents_OS); מפרטים ונהלים שלה.
- בכל קידום ידע: לסווג **תוכן** לפי `project_domain` (TIKTRACK | AGENTS_OS | SHARED) ולשמור על מבנה/נתיבים שמבטיחים הפרדה בתיקיות. **נהלי העבודה נשארים כלליים ומשותפים.**

---

## 4. שלבי עבודה (GATE_8 / קידום ידע לשלב)

1. **איסוף:** סריקת `_COMMUNICATION/team_XX/` (כל הצוותים הרלוונטיים ל־WP/Stage); זיהוי דוחות השלמה, החלטות, שינויים.
2. **סיווג:** לכל פריט — **ארכיון** (95%) או **קידום** (5%); סיווג domain: TIKTRACK / AGENTS_OS / SHARED.
3. **קידום ה־5%:** זיהוי מסמכי SSOT רלוונטיים ב־`documentation/`; עדכון או יצירת מסמך; עדכון מדריכי מפתח/נהלים; שמירה על הפרדת TIKTRACK vs AGENTS_OS.
4. **ארכיון:** העברת ארטיפקטים זמניים ל־Stage archive path; מניפסט ו־cross-reference.
5. **ניקוי:** בתיקיות הצוותים נשארים רק נהלים/מפרטים/קבצים קבועים; אי־געת ב־`_Architects_Decisions`.
6. **אימות:** וידוא שאין evidence פתוח מחוץ לנתיבים קנוניים; דוחות GATE_8 (AS_MADE, Developer Guides, Cleanup, Archive, Closure Check).

---

## 5. מקורות חובה

- `TEAM_70_KNOWLEDGE_LIBRARIAN_ROLE_DEFINITION.md`
- `documentation/docs-governance/02-PROCEDURES/TT2_KNOWLEDGE_PROMOTION_PROTOCOL.md`
- `_COMMUNICATION/team_100/DEV_OS_TARGET_MODEL_CANONICAL_v1.3.1/04_GATE_MODEL_PROTOCOL_v2.2.0.md` (GATE_8)
- תבניות Team 170 CANONICAL_TEMPLATES (כולל 04_AS_MADE_REPORT.md)

---

**log_entry | TEAM_70 | INTERNAL_WORK_PROCEDURE | LOCKED | 2026-02-22**

# TEAM 170 → Team 100: העברת תבניות LLD400/LOD200 למשילות משותפת
## Document: TEAM_170_TO_TEAM_100_LLD400_LOD200_MOVE_TO_SHARED_GOVERNANCE_v1.0.0.md

**From:** Team 170 (Governance Spec / Documentation)
**To:** Team 100 (Architect Agents_OS — אדריכל מערכת Agents_OS, לקוח מרכזי של התיעוד)
**cc:** Team 10 (Gateway)
**date:** 2026-02-19
**historical_record:** true
**purpose:** הודעה קנונית — העברת תבניות LLD400 ו־LOD200 לתיקיית המשילות המשותפת; בקשת בחינת השלכות ואישור/תיקונים נדרשים

---

## 1. הקשר

כחלק מתוכנית העבודה **אופציה C — ספריית תיעוד Agents_OS** (שערי Team 190, הפרדת דומיינים, נעילת מבנה תיקיות), מתבצעת העברה של תבניות משותפות למיקום קנוני אחד תחת משילות.

**תוכנית העבודה הראשית:** אופציה C מפורטת במסמך התוכנית (Plan: Option C Agents_OS Documentation) — שלב 0.2 ושלב 2.

---

## 2. השינוי המתוכנן

| פריט | מיקום נוכחי | מיקום יעד |
|------|--------------|-----------|
| LLD400_TEMPLATE_v1.0.0.md | `documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/` | `documentation/docs-governance/06-TEMPLATES/` |
| LOD200_TEMPLATE_v1.0.0.md | `documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/` | `documentation/docs-governance/06-TEMPLATES/` |

- **כלל ברזל:** שום קובץ לא נמחק. תוכן `AGENTS_OS_GOVERNANCE/02-TEMPLATES/` יועבר ל־06-TEMPLATES; המקור יארכיין ב־`documentation/docs-governance/99-archive/AGENTS_OS_GOVERNANCE_02_TEMPLATES_<date>/` עם MANIFEST.
- לפי מבנה הקנון (`00_DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL_v1.0.0.md`): תבניות משותפות (כולל אלה הרלוונטיות ל־Agents_OS) אמורות לשבת ב־`documentation/docs-governance/06-TEMPLATES/` — לא תחת תת־תיקיית דומיין.

---

## 3. בקשת Team 100

- **בחינת השלכות:** האם יש תלויות (קישורים, נהלים, אוטומציה, פרומפטים) בתבניות LLD400/LOD200 שמפנים לנתיב הנוכחי תחת AGENTS_OS_GOVERNANCE — ויש לעדכן או ליידע?
- **אישור או תיקונים:** האם יש התנגדות להעברה, או דרישה לתיקונים (שמות, מטא־דאטה, קישורים) לפני ביצוע?
- **תאריך מענה מועדף:** בהתאם ללוח התוכנית (לפני ביצוע שלב 2 — הפרדת דומיינים והעברת תבניות).

---

## 4. הפניה לתוכנית הראשית

תוכנית אופציה C כוללת: שער Team 190 לתוכנית, נעילת מבנה תיקיות (כולל דוחות כפולים), הפרדת דומיינים, ספריית תיעוד Agents_OS, נקודות כניסה, ושער 190 בסיום. מסמך זה הוא חלק משלב 0 (הכנות) והעברת התבניות תבוצע בשלב 2 לאחר אישור Team 190 לתוכנית.

---

**log_entry | TEAM_170 | TEAM_100_LLD400_LOD200_MOVE | DELIVERED | 2026-02-19**

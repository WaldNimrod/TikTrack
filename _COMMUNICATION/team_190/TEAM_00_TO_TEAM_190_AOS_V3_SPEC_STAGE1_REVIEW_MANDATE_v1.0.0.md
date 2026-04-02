---
id: TEAM_00_TO_TEAM_190_AOS_V3_SPEC_STAGE1_REVIEW_MANDATE_v1.0.0
historical_record: true
from: Team 00 (Nimrod — System Designer)
to: Team 190 (Constitutional Validator / Intelligence)
cc: Team 101, Team 100
date: 2026-03-25
status: ACTIVE_MANDATE
program: AOS_V3_SPEC
type: MANDATE
gate: SPEC_STAGE_1_REVIEW
subject: Stage 1 Review — Entity Dictionary + second opinion on governance structure analysis---

# Team 190 — Mandate: Stage 1 Review + Governance Second Opinion

---

## מנדט זה כולל שני חלקים עצמאיים

- **חלק A** — ביצוע מיידי: Second opinion על ניתוח מבנה הממשל
- **חלק B** — ביצוע לאחר קבלת פלט Team 101: Review של Entity Dictionary

---

# חלק A — Second Opinion: ניתוח מבנה ממשל (מיידי)

## א.1 הקשר

Team 00 ניתח את מבנה קבצי הממשל הנוכחי ויצר הצעה לארגון מחדש לקראת v3.
תפקידך: לאמת את הניתוח, למצוא פערים, ולמנות סיכונים שלא הוזכרו.

## א.2 קבצים לקריאה

1. `_COMMUNICATION/team_00/TEAM_00_AOS_V3_GOVERNANCE_STRUCTURE_ANALYSIS_v1.0.0.md` — הניתוח המלא
2. `documentation/docs-governance/01-FOUNDATIONS/` — סקירת תוכן (כותרות בלבד)
3. `documentation/docs-governance/04-PROCEDURES/` — רשימת קבצים
4. `documentation/docs-governance/AGENTS_OS_GOVERNANCE/` — תוכן (מה שם?)
5. `agents_os_v2/context/conventions/` — backend.md + frontend.md (5 שורות ראשונות)
6. `agents_os_v2/context/identity/team_10.md` — דוגמה לקובץ identity (10 שורות ראשונות)
7. `documentation/docs-governance/01-FOUNDATIONS/TEAMS_ROSTER_v1.0.0.json` — `_meta.note` בלבד

## א.3 מה לבחון

בדוק כל אחד מהממצאים של Team 00 ב-Governance Analysis:

| ממצא | האם מסכים? | פערים שהוחמצו? |
|---|---|---|
| בעיה 1 — AOS governance בתוך shared | | |
| בעיה 2 — TikTrack conventions בקוד AOS | | |
| בעיה 3 — שלוש ייצוגים של team data | | |
| הצעת מבנה v3 (ג.2) | | |
| auto-gen team_XX.md מ-TEAMS_ROSTER | | |

**שאלות נוספות לבחון:**
1. האם יש קבצים נוספים ב-`docs-governance/` שמשתייכים לדומיין ספציפי ולא אובחנו?
2. האם ה-`_COMMUNICATION/` directory structure מהווה בעיה דומה (דימום בין דומיינים)?
3. האם הצעת ה-auto-gen של team_XX.md מ-TEAMS_ROSTER.json ריאלית? מה הסיכון?
4. האם יש impacted programs שצריך לעדכן כתוצאה ממחדש הממשל?

## א.4 פלט נדרש — חלק A

```
_COMMUNICATION/team_190/TEAM_190_AOS_V3_GOVERNANCE_SECOND_OPINION_v1.0.0.md
```

פורמט:
```markdown
# Team 190 — Governance Structure Second Opinion

## Verdict: CONFIRM | CONFIRM_WITH_ADDITIONS | PARTIAL_DISPUTE | DISPUTE

## Confirmed Findings: [רשימה]
## Additional Findings: [מה הוחמץ]
## Disputed Points: [מה לא מדויק + נימוק]
## Risk Register: [סיכונים שלא הוזכרו]
## Recommendations: [המלצות ספציפיות]
```

---

# חלק B — Entity Dictionary Review (לאחר קבלת פלט Team 101)

## ב.1 מתי לבצע

**לאחר שתקבל:**
```
_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v1.0.0.md
```
Team 101 עובד על כך עכשיו. בדוק אם הקובץ קיים לפני שמתחיל חלק B.

## ב.2 הקשר

Team 101 כתב Entity Dictionary field-level לכל 10 ישויות AOS v3.
תפקידך: **לחפש כשלים** — כל מה שיגרום לבעיות בשלבי האפיון הבאים או בזמן Build.

## ב.3 קבצים לקריאה לפני Review

1. `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v1.0.0.md` — הפלט לביקורת
2. `_COMMUNICATION/team_00/TEAM_00_AOS_V3_SYNTHESIS_ARCHITECTURE_SPEC_v1.0.0.md` — §ג.2 (SSOT map) + §ג.5 (entities)
3. `_COMMUNICATION/team_00/TEAM_00_AOS_ARCHITECTURE_SPEC_BASE_v1.0.0.md` — §5 (entity definitions baseline)
4. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_G_DB_FILE_CLASSIFICATION_RULESET_v1.0.0.md`
5. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_D_AUDIT_MODEL_AND_EVENT_TAXONOMY_v1.0.0.md`

## ב.4 מה לבחון — 8 קטגוריות ביקורת

### B-CAT-1: שלמות שדות
- האם חסרים שדות קריטיים?
- לכל entity: האם ניתן לבצע את כל ה-Use Cases (UC-01..UC-14 ב-process plan) רק עם השדות שהוגדרו?

### B-CAT-2: Business Rules
- האם לכל שדה יש business rule?
- האם יש שדות עם rule חלש/כללי מדי ("must be valid" — לא מספיק)?

### B-CAT-3: Nullable consistency
- האם שדות Nullable מוסברים? ("NULL when X, NOT NULL when Y")
- האם יש שדות שיכולים לגרום ל-NullPointerException בלי שהכלל ברור?

### B-CAT-4: Invariants
- האם ה-Invariants מכסים את ה-edge cases?
- חפש invariants שחסרים ל-cross-entity constraints (לא ניתן לבטא ב-DDL)

### B-CAT-5: Relationships
- האם ה-FK relationships נכונים?
- האם יש circular dependency?
- Cascade rules — DELETE/UPDATE — מוגדרות?

### B-CAT-6: DB/FILE classification
- האם כל entity מסווג נכון לפי Annex G?
- האם `Prompt` כ-Value Object (לא ב-DB) מוצדק?

### B-CAT-7: Open Questions
- האם ה-OPEN_QUESTIONs של Team 101 מטופלים?
- האם יש OPEN_QUESTIONs נוספים שלא זוהו?

### B-CAT-8: אחידות מבנית
- האם הפורמט עקבי בכל 10 הישויות?
- האם יש inconsistency בין entities שיצביע על assumption שונה?

## ב.5 כיצד לדרג ממצאים

| דרגה | משמעות | דוגמה |
|---|---|---|
| **BLOCKER** | לא ניתן להמשיך לStage 2 עד שפותר | שדה חסר שגורם ל-UC-02 להיכשל |
| **MAJOR** | ישפיע על Stage 4 (DDL) — חייב פתרון | Nullable לא מוגדר על FK |
| **MINOR** | עדיף לפתור, לא חוסם | business rule לא מדויק אבל מובן |
| **NOTE** | הערה, לא דורשת תיקון | suggestion לשיפור |

## ב.6 פלט נדרש — חלק B

```
_COMMUNICATION/team_190/TEAM_190_AOS_V3_ENTITY_DICTIONARY_REVIEW_v1.0.0.md
```

פורמט:
```markdown
# Team 190 — Entity Dictionary Review (Stage 1)

## Verdict: PASS | PASS_WITH_MAJORS | BLOCK

## Summary
- BLOCKERs: N
- MAJORs: N
- MINORs: N
- NOTEs: N

## Findings

### BLOCKER-01: <title>
**Entity:** <entity>
**Field:** <field or "structural">
**Issue:** [תיאור]
**Evidence:** [ציטוט מהקובץ]
**Required action:** [מה Team 101 צריך לתקן]

### MAJOR-01: <title>
...

[וכו']

## Confirmed Correct
[רשימה של מה שבדקת ואישרת — כדי שTeam 101 וTeam 00 ידעו מה עבר ביקורת]

## Open Questions Resolved by Reviewer
[אם Team 101 השאיר OPEN_QUESTIONs — הצע פתרון עם נימוק]
```

---

## הנחיות כלליות

1. **חלק A מיידי** — אין תלות בTeam 101. בצע תוך הסשן הנוכחי.
2. **חלק B — לאחר שנקבל entity dictionary** — בדוק אם הקובץ קיים.
3. **אל תציע "להוסיף"** — אם גישה שלמה שגויה, כתוב BLOCKER. אם שדה חסר, כתוב MAJOR.
4. **אל תחליף את Team 101** — תפקידך לבחון ולמצוא כשלים, לא לכתוב מחדש.
5. **כשסיימת כל חלק** — כתוב `log_entry | TEAM_190 | PART_A/B_COMPLETE`.

---

**log_entry | TEAM_00 | SPEC_STAGE_1_REVIEW_MANDATE | TEAM_190_ACTIVATED | 2026-03-25**

---
**project_domain:** SHARED (TIKTRACK + AGENTS_OS)
**id:** TEAM_100_TO_TEAM_00_DUAL_DOMAIN_GOVERNANCE_RECOMMENDATION_v1.0.0
**from:** Team 100 (Development Architecture Authority)
**to:** Team 00 (Chief Architect — Nimrod)
**cc:** Team 190, Team 90, Team 170, Team 10
**date:** 2026-03-10
**status:** RECOMMENDATION — AWAITING TEAM_00 DECISION
**type:** ARCHITECTURAL_COORDINATION
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | SHARED |
| work_package_id | N/A |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 100 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

# DUAL-DOMAIN GOVERNANCE — ניתוח שורש הבעיה + המלצות לTeam 00

---

## §0 — הקשר: מה גרם לבלבול

### הסימפטום שTeam 90 ראה (תמונה צרה)
Team 90 דיווח על שלוש בעיות:
1. GATE_7 semantics לא עקביות
2. Domain drift בWSM בהרצה מקבילה
3. `phase_owner_team` דו-משמעי (gate-owner vs execution-owner)

### האבחנה האדריכלית (תמונה מלאה)
שלוש הבעיות הן **סימפטומים של שורש אחד:** S002-P002 (תוכנית AGENTS_OS) הכיל WP003 עם `project_domain: TIKTRACK`. **זה מפר את כלל ה-SSM הקיים** — "One domain per Program" (SSM §0 + Gate Model §2.2).

**תוצאות שרשרת:**
```
WP003 רשום תחת S002-P002 (AGENTS_OS)
    → WSM מראה active_project_domain: TIKTRACK תחת program AGENTS_OS
    → Team 100 סקר את WP003 כאילו הוא בתחום אחריותו
    → Team 90 חוסם בשאלות GATE_7 semantics כי "infrastructure WP לא UX"
    → pipeline state.json מראה GATE_0 FAIL מריצת בדיקה של TIKTRACK WP
    → בלבול מוחלט בין שני הדומיינים
```

---

## §1 — שלוש הבעיות המוגדרות

### בעיה 1: הפרת "One Domain Per Program"
**מצב:** WP003 (Market Data Hardening) = TIKTRACK domain, אבל רשום תחת S002-P002 (AGENTS_OS program).
**SSM §0 אומר:** "Each Program is assigned to exactly one domain."
**מה היה צריך לקרות:** WP003 = תוכנית TIKTRACK נפרדת (S002-P004 או S002-P005).
**סיכון עתידי:** בלי enforcement, כל מנהל פרויקט יכול "לשים" WP מדומיין שגוי ולשבש את כל הניתוב.

### בעיה 2: GATE_7 Semantic Drift
**מצב:** GATE_6 decision של WP003 הגדיר GATE_7 כ-"runtime confirmation" — לא browser sign-off.
**Gate Model Protocol §3 אומר:** GATE_7 = HUMAN_UX_APPROVAL (תמיד Nimrod, תמיד UX).
**מה קרה:** החלטה ad-hoc (לגיטימית ברגע) יצרה precedent לא מתועד שמשנה הגדרה קנונית.
**סיכון עתידי:** כל צוות יוכל לאמר "זה infrastructure, אין צורך בbrowser" ולדלג על GATE_7.

### בעיה 3: WSM Single-Track Limitation
**מצב:** WSM עוקב אחרי program אחד פעיל בו-זמנית. כשS002 מריץ שני דומיינים במקביל — WSM לא יכול לבטא זאת.
**תוצאה:** `active_project_domain` מחליף בין TIKTRACK ל-AGENTS_OS, `phase_owner_team` מכיל שני צוותים בשדה אחד.
**סיכון עתידי:** S003 יריץ תוכניות TIKTRACK ו-AGENTS_OS במקביל — אותה בעיה תחזור.

---

## §2 — ארבע אופציות לפתרון

---

### אופציה A — שני בלוקי WSM נפרדים (Dual State Tracking)

**רעיון:** WSM יכיל שני blocks:
`CURRENT_OPERATIONAL_STATE_TIKTRACK` + `CURRENT_OPERATIONAL_STATE_AGENTS_OS`

```yaml
# WSM — מבנה מוצע
CURRENT_OPERATIONAL_STATE_TIKTRACK:
  active_stage_id: S002
  active_program_id: S002-P004   # ← תוכנית TIKTRACK
  current_gate: GATE_7
  active_work_package_id: WP003
  phase_owner_team: Team 90

CURRENT_OPERATIONAL_STATE_AGENTS_OS:
  active_stage_id: S002
  active_program_id: S002-P002   # ← תוכנית AGENTS_OS
  current_gate: GATE_0 (BLOCKED BF-01..05)
  active_work_package_id: WP001
  phase_owner_team: Team 100
```

| יתרונות | חסרונות |
|---|---|
| הפרדה מוחלטת ברורה | מכפיל גודל WSM |
| אין אפשרות לבלבל | Team 170 מתחזק שתי שרשרות עדכון |
| כל צוות רואה בדיוק מה שלו | שינוי גדול בכל כלי WSM קיים |

**שינויים נדרשים:** WSM protocol, כל קוד/מסמך שקורא WSM, PORTFOLIO_WSM_SYNC_RULES.

---

### אופציה B — אכיפת כלל קיים + טבלת Parallel Tracks קלה *(מומלצת)*

**רעיון:** לא ממציאים גלגל חדש — מאכפים מה שכבר כתוב ב-SSM + מוסיפים טבלת נראות קלה ל-WSM.

**שינוי 1 — Iron Rule GATE_0:** Team 190 בודק בכל GATE_0 submission:
`project_domain` של WP חייב להתאים ל-`project_domain` של Program האב.
אם לא — BLOCK_FOR_FIX מיידי.

**שינוי 2 — WSM: טבלת `STAGE_PARALLEL_TRACKS`** (3 שדות בלבד, בתוך WSM הקיים):

```yaml
STAGE_PARALLEL_TRACKS:
  - domain: TIKTRACK
    active_program_id: S002-P004
    current_gate: GATE_7
    gate_owner_team: Team 90
  - domain: AGENTS_OS
    active_program_id: S002-P002
    current_gate: GATE_0 (BLOCKED)
    gate_owner_team: Team 100
```

**שינוי 3 — WSM field split:**
`phase_owner_team` → שתי שדות:
- `gate_owner_team`: מי מחזיק את ההחלטה בשער הנוכחי
- `execution_orchestrator_team`: מי מנהל את ביצוע העבודה (Team 10 לרוב)

| יתרונות | חסרונות |
|---|---|
| מינימלי — אכיפת כלל קיים | דורש cleanup retroactive (WP003 → תוכנית TIKTRACK) |
| WSM לא משתנה מבנית | Team 170 עדיין צריך לעדכן WSM protocol |
| Team 190 כבר הכלי הנכון | |
| נראות מלאה ב-3 שורות | |

---

### אופציה C — Stage Active Portfolio Document

**רעיון:** מסמך חדש `STAGE_ACTIVE_PORTFOLIO.md` (אחד לכל Stage פעיל) שמתעד את כל התוכניות הפעילות בכל הדומיינים.

```markdown
# S002 Active Portfolio

| Domain | Program | WP | Gate | Owner |
|--------|---------|-----|------|-------|
| TIKTRACK | S002-P003 | WP002 | GATE_8 CLOSED | — |
| TIKTRACK | S002-P004 | WP003 | GATE_7 | Team 90 |
| AGENTS_OS | S002-P002 | WP001 | GATE_0 BLOCKED | Team 100+61 |
```

| יתרונות | חסרונות |
|---|---|
| WSM נשאר ללא שינוי | מסמך נוסף לתחזק — יכול לסחוף |
| נראות מצוינת בסשן | לא פותר את ה-enforcement בעיה |
| קל להכין | Team 170 חייב לעדכן מדי gate |

---

### אופציה D — Domain Track Header חובה על כל WP

**רעיון:** כל WP document חייב לכלול `domain_track` field + `parent_program_domain`. ניתוב מבוסס על WP domain, לא program domain.

| יתרונות | חסרונות |
|---|---|
| גמיש — מאפשר mixed-domain programs | **מפר כלל SSM קיים בכוונה** |
| שינוי קטן | מורכב יותר לניתוב |
| לא דורש program split | |

**Team 100 דוחה אופציה זו** — מוסיפה מורכבות ומפרה כלל קיים.

---

## §3 — המלצת Team 100

### **בחר: אופציה B + אלמנטים מאופציה C**

**הנימוק:**
1. הכלל "one domain per program" **כבר קיים** ב-SSM + WSM + Gate Model. הבעיה היא **חוסר אכיפה** — לא חוסר כלל.
2. הוספת STAGE_PARALLEL_TRACKS לWSM היא 3 שורות YAML, לא שינוי מבני.
3. Team 190 הוא כבר הכלי הנכון לבדיקת GATE_0 — רק צריך להוסיף domain-match check לchecklist שלו.

### שלושה עדכונים קנוניים נדרשים:

| # | שינוי | קובץ | מבצע |
|---|---|---|---|
| **U-01** | Team 190 GATE_0 checklist: הוסף בדיקה "WP domain = Program domain" | `agents_os_v2/context/identity/team_190.md` + Gate Model Protocol §3 | Team 61 (code) + Team 170 (docs) |
| **U-02** | WSM: הוסף `STAGE_PARALLEL_TRACKS` block + split `phase_owner_team` → `gate_owner_team` + `execution_orchestrator_team` | `PHOENIX_MASTER_WSM_v1.0.0.md` | Team 170 |
| **U-03** | GATE_7 semantic lock: תמיד Nimrod, תמיד browser/UI. Infrastructure = admin verification page (לא log-only) | `04_GATE_MODEL_PROTOCOL_v2.3.0.md` §3 + GATE_7 contract | Team 170 |

### GATE_7 lock — ניסוח מוצע:
> **GATE_7 = HUMAN_UX_APPROVAL — Iron Rule.** Executor: Nimrod (Team 00) exclusively. Surface: browser/UI always — product pages for feature WPs; dedicated admin verification page or monitoring dashboard for infrastructure WPs. Pure log-file-only sign-off is not valid GATE_7 evidence. No exceptions without Team 00 formal amendment.

---

## §4 — נושאים פתוחים לבחירת Team 00

1. **WP003 retroactive fix:** האם להעביר WP003 לתוכנית TIKTRACK נפרדת (S002-P005) כחלק מסגירת GATE_8, או לתעד כ"historical anomaly" בלי לשנות?
   - Team 100 ממליץ: תעד כ-anomaly + הוסף לGATE_8 closure note. לא כדאי לשנות WP numbering אחרי GATE_6.

2. **Stage Active Portfolio doc:** האם לאמץ גם את אופציה C כ-supplementary layer?
   - Team 100 ממליץ: כן — מסמך פשוט, שווה הנראות.

3. **Enforcement timing:** האם U-01/02/03 נכנסים לתוקף ב-S002 (מיידי) או ב-S003 (clean start)?
   - Team 100 ממליץ: U-01 מיידי (יכנס כחלק מWP001 BF-03 fix). U-02/03 — S003 clean start.

---

## §5 — פעולות נדרשות מTeam 00

עם אישורך:

1. **Team 100:** יוסיף U-01 לתוך BF-03 mandate לTeam 61 (domain-match check בidentity/team_190.md)
2. **Team 170:** U-02 + U-03 — עדכון WSM protocol + Gate Model Protocol
3. **Team 190:** re-validation של WP001 GATE_0 submission לאחר תיקוני BF-01..05 + U-01
4. **WSM:** הוסף `STAGE_PARALLEL_TRACKS` block עם מצב נוכחי של S002

---

log_entry | TEAM_100 | DUAL_DOMAIN_GOVERNANCE_RECOMMENDATION | SUBMITTED_TO_TEAM_00 | 2026-03-10

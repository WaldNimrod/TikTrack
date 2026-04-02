---
id: TEAM_00_TO_TEAM_101_AOS_V3_SPEC_STAGE1_ENTITY_DICTIONARY_MANDATE_v1.0.0
historical_record: true
from: Team 00 (System Designer / Principal — בן־אנוש יחיד)
to: Team 101 (TT Domain Architect / Data Model Specialist)
cc: Team 190 (will receive your output for review), Team 100
date: 2026-03-25
status: ACTIVE_MANDATE
program: AOS_V3_SPEC
type: MANDATE
gate: SPEC_STAGE_1
subject: Stage 1 — Entity Dictionary (field-level spec) for AOS v3---

# Team 101 — Mandate: AOS v3 Entity Dictionary (Stage 1)

---

## 1. הקשר ורקע

אנחנו בתחילת תהליך אפיון מלא של AOS v3 — מחדש greenfield.
עיקרון מנחה: **אפיון כפול → כתיבת קוד פעם אחת, מהר ומדוייק.**

**Stage 1** הוא Entity Dictionary. תפקידך: לכתוב את מסמך הישויות המלא ברמת שדה בודד.
לאחר שתסיים, Team 190 יקבל את הפלט שלך ויחפש כשלים. שלב ה-Build מתחיל רק לאחר שכל 8 שלבי האפיון אושרו.

---

## 2. קבצים לקריאה (MANDATORY לפני כתיבה)

**ארכיטקטורה — קרא בסדר הזה:**
1. `_COMMUNICATION/team_00/TEAM_00_AOS_V3_SYNTHESIS_ARCHITECTURE_SPEC_v1.0.0.md` — הסינתזה הארכיטקטונית המלאה (ג.2, ג.4, ג.5 קריטיים)
2. `_COMMUNICATION/team_00/TEAM_00_AOS_ARCHITECTURE_SPEC_BASE_v1.0.0.md` — Entity definitions ראשוניות (§5)
3. `_COMMUNICATION/team_00/TEAM_00_AOS_GREENFIELD_ARCHITECTURE_v1.0.0.md` — §3.1 definition.yaml structure
4. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_G_DB_FILE_CLASSIFICATION_RULESET_v1.0.0.md` — כללי DB/FILE classification
5. `documentation/docs-governance/01-FOUNDATIONS/TEAMS_ROSTER_v1.0.0.json` — מבנה צוות קיים (reference)
6. `_COMMUNICATION/agents_os/pipeline_state.json` — מבנה state קיים (reference, לא לחקות)

---

## 3. מה לכתוב

**פלט נדרש:** קובץ Entity Dictionary מלא, field-level, לכל 10 הישויות.

### 3.1 ישויות לכסות (סדר כתיבה מחייב)

```
1. Domain         — הגדרת דומיין (tiktrack / agents_os)
2. Team           — צוות (engine, scope, capabilities)
3. Gate           — שער בפייפליין
4. Phase          — תת-שלב בתוך שער
5. RoutingRule    — כלל ניתוב (gate+phase+domain+variant → team)
6. Run            — הרצה פעילה (aggregate root)
7. Event          — רישום audit immutable
8. Template       — task layer template (per gate/phase)
9. Policy         — cache/token policy
10. Prompt        — Value Object (לא entity ב-DB, אבל יש לתעד את המבנה)
```

### 3.2 פורמט חובה לכל ישות

```markdown
---
## Entity: <Name>

**Description:** [תיאור תפקיד הישות במשפט אחד]
**Storage:** DB | FILE | Value Object
**Table name:** `<table_name>` (אם DB)
**Aggregate root:** yes / no
**Layer:** Domain / Application / Infrastructure

### Fields

| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|-------|------|----------|---------|------------|---------------|---------|
| id | TEXT | NO | auto | PK, UNIQUE | ULID format | 01HXXX... |
| ... | | | | | | |

### Invariants
_(חוקים שחייבים להיות נכונים תמיד — לא constraint ב-DB, אלא חוק עסקי)_
1. ...
2. ...

### Relationships
- belongs_to: <Entity> via <field>
- has_many: <Entity> via <field>
- mutually_exclusive_with: ...

### Notes
_(edge cases, הגדרות מיוחדות, החלטות שדורשות attention)_
```

### 3.3 כללים לכתיבה

1. **כל שדה חייב business rule.** "ראה ישות" לא מספיק. אם שדה לא קריטי — אמור מפורשות "no business constraint".
2. **כל Nullable שדה** — הסבר מתי הוא NULL ומתי לא.
3. **כל Enum** — רשום את כל הערכים האפשריים + משמעות כל אחד.
4. **שדות נגזרים** — סמן `DERIVED` ב-Default, הסבר מה גוזר אותם.
5. **אם יש ספק** — כתוב שאלה מפורשת ב-Notes עם `OPEN_QUESTION:`.

---

## 4. החלטות ארכיטקטוניות נעולות (Iron Rules — לא לשאול עליהן)

אלו כבר נעלו על ידי Team 00:

1. **DB-first for control plane.** RoutingRule, Team, Gate, Phase, Run, Event, Template, Policy → DB.
2. **FILE for artifacts.** team_XX.md, governance.md, communication docs → FILE.
3. **`Prompt` הוא Value Object** — לא שורה ב-DB. הוא נבנה runtime ונעלם.
4. **Events הם immutable append-only** — אין UPDATE על events. אין DELETE.
5. **Single `pipeline_state.json`** — ה-Run entity מתמצת ל-JSON file (projected view). domain הוא field, לא שם קובץ.
6. **ULID כ-primary key** — לא auto-increment integer.
7. **4-layer Prompt:** Layer1 (identity) + Layer2 (governance) + Layer3 (state) + Layer4 (task template). אין שכבה 5.

---

## 5. שאלות פתוחות שיש לך לפתור (החלטות שנשארו ל-Stage 1)

אלו שאלות שנפתרות תוך כדי הכתיבה — אתה מחליט ומנמק, Team 190 יבחן:

1. **`Run` vs `Execution`:** מה שם נכון יותר? יש השלכה על naming של כל הקוד.
2. **`current_phase` על `Run`:** האם זה שדה על `Run` או שמחשבים אותו מהאחרון ב-`Event`?
3. **`correction_cycle_count`:** integer על `Run`, או נגזר מסך FAIL events?
4. **`RoutingRule.priority`:** integer מפורש, או נגזר מ-specificity (domain+variant)?
5. **`Template.domain_id`:** האם template יכול להיות domain-specific? או תמיד universal?
6. **`Policy` granularity:** policy per domain, per gate, או global?
7. **`Event.actor_type`:** human | agent | scheduler? איך מייצגים זאת?

לכל שאלה — החלט + נמק ב-2 משפטים. אם אתה לא יכול להחליט — כתוב `OPEN_QUESTION` + שתי האופציות + ה-tradeoff.

---

## 6. פלט נדרש

**קובץ אחד:**
```
_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v1.0.0.md
```

**מבנה הקובץ:**
```markdown
---
id: TEAM_101_AOS_V3_ENTITY_DICTIONARY_v1.0.0
from: Team 101
to: Team 190 (review), Team 100, Team 00
date: <today>
status: SUBMITTED_FOR_REVIEW
stage: SPEC_STAGE_1
---

# AOS v3 — Entity Dictionary (Stage 1)

## Summary
[רשימה של OPEN_QUESTIONs שנותרו + המלצה לכל אחת]

---
[10 ישויות בפורמט המוגדר]
```

---

## 7. הנחיות תפעוליות

- **לא להתחיל לכתוב קוד.** Stage 1 = spec בלבד.
- **לא לשנות קבצים קיימים** — כותבים רק לתיקיית `_COMMUNICATION/team_101/`.
- **OPEN_QUESTIONs מותרות** — עדיפות על פני החלטה שגויה.
- **פורמט MANDATORY** — Team 190 יסרוק לפי הפורמט. סטייה מהפורמט = ה-review לא יוכל להשוות.
- **כשתסיים** — שלח `→ SUBMITTED` ב-log entry בקובץ.

---

**log_entry | TEAM_00 | SPEC_STAGE_1_MANDATE | TEAM_101_ACTIVATED | 2026-03-25**

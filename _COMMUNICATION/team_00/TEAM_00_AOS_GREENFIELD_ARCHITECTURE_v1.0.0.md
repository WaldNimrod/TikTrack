date: 2026-03-25
historical_record: true

# AOS — Green-Field Architecture
**Author:** Team 100 (architectural research)
**Date:** 2026-03-25
**Intent:** Clean thinking from scratch — no legacy constraints

---

## 1. מה המערכת צריכה לעשות (יעדים)

1. **לתעד ניתוב** — לדעת, לכל שלב בכל שער, איזה צוות מפעיל אותו ואיזו מנוע
2. **לנהל מצב** — לדעת אני נמצא עכשיו: בארגז עבודה X, בשער Y, בשלב Z, בדומיין W
3. **לייצר פרומפט** — לבנות הוראת הפעלה מלאה לצוות הנכון בהינתן המצב הנוכחי
4. **לשמור היסטוריה** — לתעד כל מעבר שער (מי, מתי, PASS/FAIL, סיבה)
5. **לתת ממשק לאדם** — CLI פשוט + דשבורד ויזואלי שממנו נימרוד רואה ומפעיל
6. **לאכוף HITL** — רק האדם מקדם את הפייפליין; שום סוכן לא מריץ pipeline_run.sh

**זה הכל.** כל דבר נוסף הוא either infrastructure שרוי (logging, KB-84) או feature שנוסף בלי לשאול "האם זה שייך כאן?"

---

## 2. החלקים המרכזיים שעל המערכת ליישם

| חלק | מה הוא עושה | גודל סביר |
|---|---|---|
| **Definition** | מגדיר מי מה ואיך — שערים, שלבים, צוותים, דומיינים | קובץ YAML אחד |
| **State** | מצב ריצה נוכחי — איפה אנחנו | JSON אחד לכל דומיין |
| **Router** | "מי מפעיל שלב X בשער Y בדומיין Z?" — פונקציה אחת | ~50 שורות |
| **Prompt Factory** | בונה פרומפט מלא ב-4 שכבות לצוות הנכון | ~100 שורות |
| **State Machine** | PASS → next gate, FAIL → retry loop, COMPLETE → done | ~100 שורות |
| **CLI** | `./pipeline_run.sh pass/fail/status` | ~100 שורות |
| **Dashboard** | מציג מצב, מאפשר העתקת פקודות | SPA קל |

**סה"כ מהות:** ~350 שורות Python + ~200 שורות JS + YAML + JSON. כל השאר — infra.

---

## 3. אם היינו מתחילים מאפס — הארכיטקטורה הנכונה

### עיקרון יחיד: נתון → גזור. לא: קוד → שכפל.

כל מה שמשתנה בין שערים, דומיינים, וצוותים — **חי בנתונים**.
כל מה שנשאר קבוע — **חי בקוד פעם אחת**.

---

### 3.1 שכבת הגדרה (Definition Layer)

```
pipeline/
  definition.yaml     ← המקור היחיד לאמת
  teams/
    team_10.md        ← context שמוזרק לפרומפט (כבר קיים, עובד טוב)
    team_11.md
    ...
  governance.md       ← context גלובלי (כבר קיים, עובד טוב)
```

**`definition.yaml`** — קובץ אחד מגדיר הכל:

```yaml
gates:
  - id: GATE_0
    phases:
      - id: "0.1"
        owner:
          default: team_190

  - id: GATE_1
    phases:
      - id: "1.1"
        owner:
          default: team_170
      - id: "1.2"
        owner:
          default: team_190

  - id: GATE_2
    phases:
      - id: "2.2"
        owner:
          tiktrack: team_10
          agents_os: team_11
      - id: "2.3"
        owner:
          default: team_100
          resolve_from_state: lod200_author_team  # sentinel

  ...

domains:
  tiktrack:
    variant: TRACK_FULL
    doc_team: team_70

  agents_os:
    variant: TRACK_FOCUSED
    doc_team: team_170

teams:
  team_10:
    name: Gateway / Execution Lead (TikTrack)
    engine: cursor
    domain: tiktrack
  team_100:
    name: Architectural Review
    engine: claude
    domain: all
  ...
```

**כלל:** רוצה לשנות ניתוב? פותח `definition.yaml`. רוצה לשנות context צוות? פותח `teams/team_XX.md`. לא נוגעים בקוד.

---

### 3.2 שכבת הריצה (Runtime Layer)

```
pipeline/
  runtime/
    router.py         ← "מי מפעיל gate G, phase P, domain D?"
    prompt.py         ← "מה הפרומפט לצוות T בשלב הנוכחי?"
    machine.py        ← "מה קורה אחרי PASS / FAIL?"
    state.py          ← load / save state JSON
    log.py            ← append-only event log
```

**router.py** — פונקציה אחת, חכמה אחת:
```python
def resolve_owner(gate, phase, domain, state) -> str:
    """
    מחזיר team_id. קוראת מ-definition.yaml בלבד.
    priority: state.sentinel > domain-specific > default
    """
```

**machine.py** — state machine רזה:
```python
TRANSITIONS = {
    "PASS": lambda state: next_gate(state),
    "FAIL": lambda state: retry_or_escalate(state),
    "HOLD": lambda state: state,  # no change
    "COMPLETE": lambda state: mark_done(state),
}
```

**אין per-gate code.** gate_0.py, gate_1.py... — לא קיים. הכל גנרי.

---

### 3.3 שכבת הממשק (Interface Layer)

```
pipeline/
  interface/
    cli.sh            ← pass / fail / status / init
    dashboard/
      index.html      ← SPA אחד
      app.js          ← טוען state.json + definition.yaml → מרנדר
      style.css       ← עיצוב
```

**עיקרון הדשבורד:** הדשבורד הוא **read-only + copy tool**. הוא לא מבצע mutations. הוא מציג את המצב וגורם לנימרוד לרוץ פקודת CLI. אין server ב-dashboard. אין `/api/state PATCH`. יש `GET /state` אחד.

**app.js** — טוען שני קבצים:
1. `definition.yaml` → יודע מה שערים קיימים, איזה צוות מצופה
2. `state.json` → יודע איפה אנחנו עכשיו

מרנדר timeline. מציג צוות פעיל. מציג פקודת CLI. זה הכל.

---

### 3.4 שכבת ה-Context (Context Layer) — כבר קיימת, לא לשנות

```
pipeline/
  context/
    teams/            ← teams/team_XX.md — מוזרק לפרומפט (כבר עובד)
    governance.md     ← כללים גלובליים (כבר עובד)
    gate_rules.md     ← מודל השערים (תוקן לאחרונה)
```

זאת השכבה הכי בריאה במערכת הקיימת. אין מה לשנות.

---

## 4. מה שונה מהיום

| היום | מהיסוד |
|---|---|
| ניתוב ב-3 מקומות (pipeline.py + config.py + pipeline-config.js) | ניתוב פעם אחת ב-`definition.yaml` |
| 8 קובצי gate conversation זהים | `router.py` + `prompt.py` גנריים |
| `pipeline.py` 3,854 שורות | 3 קבצים × ~100 שורות |
| JS roster hardcoded (300 שורות) | JS טוען מ-`definition.yaml` (או JSON שנוצר ממנו) |
| Dashboard עם FastAPI server + `/api/state PATCH` | Dashboard read-only, CLI בלבד לשינוי state |
| 5 CSS files, 17 JS files | 1 HTML + 1 JS + 1 CSS |
| "הוסיפו gate" = ניתוח ב-6 קבצים | "הוסיפו gate" = 5 שורות ב-YAML |

---

## 5. מה לא לשנות (אפילו מהיסוד)

- **HITL rule** — רק נימרוד מריץ pipeline commands. אי אפשר להתפשר על זה.
- **KB-84 precision guard** — אפשר לפשט את ה-UI שלו, אבל הרעיון חיוני.
- **4-layer prompt injection** — identity + governance + state + task. זה עובד.
- **Append-only audit log** — לא מוחקים היסטוריה.
- **Domain isolation** — שני state files עצמאיים. נכון.
- **Branch-per-WP** (S003-P016) — גיט isolation שכרגע עובד.

---

## 6. שאלה לנימרוד לפני שמחליטים

**האם refactoring מלא מוצדק עכשיו, לפני S004 — או לאחריו?**

הסיכון של "refactor עכשיו": מערכת עובדת מפסיקה לעבוד בזמן שTikTrack זקוק לה.

הסיכון של "refactor אחרי S004": S004 יוסיף עוד סטייה, וה-refactoring יהיה גדול יותר.

**המלצה:** Strangle Fig Pattern.
- לא מוחקים את הקוד הישן בבת אחת
- כותבים את `definition.yaml` + `router.py` חדש לצד הישן
- מריצים שניהם במקביל עם assertion שהתוצאות זהות
- ברגע שהחדש יציב — מוחקים את הישן

---

**log_entry | TEAM_100 | GREENFIELD_ARCH | AOS_FROM_SCRATCH | 2026-03-25**

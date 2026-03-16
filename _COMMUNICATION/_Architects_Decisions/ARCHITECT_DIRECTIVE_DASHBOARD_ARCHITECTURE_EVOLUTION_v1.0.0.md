---
directive_id:   ARCHITECT_DIRECTIVE_DASHBOARD_ARCHITECTURE_EVOLUTION_v1.0.0
author:         Team 00 — Chief Architect
date:           2026-03-16
status:         PENDING_NIMROD_APPROVAL
authority:      Team 00 Constitutional Authority
applies_to:     ALL teams — agents_os domain, S003-P007 scope definition
problem_solved: Static HTML Dashboard ceiling; state management drift; Mode 2 → Mode 3 evolution path
---

# Architectural Directive — Dashboard Evolution & State Management Root Cause
## Team 00 | Deep Analysis | Dashboard Architecture | Three-Mode System

---

## 0. השאלה המרכזית

> "אולי שורש כל הבעיה שלנו שאנחנו מנסים לנהל תהליכים מתקדמים רק עם ממשק משתמש ללא שכבת צד שרת?"

**תשובה ישירה: כן. ולא רק בגלל drift — אלא בגלל שלושה כשלים מבניים בסיסיים שנדונים להחמרה ככל שהמערכת גדלה.**

---

## 1. שלושת כשלי ה-Static HTML

### כשל 1: עיוורון לזמן-אמת

דשבורד HTML סטטי יכול לקרוא רק מה שנמצא בקבצי דיסק.
אין שרת — אין חישוב חי. אין חישוב חי — **תמיד יש חלון drift.**

כל ה"פתרונות" שניסינו עד כה (STATE_SNAPSHOT, OPERATIONAL_VIEW, cache-busting) הם עבודות עיגול של הגבלה מבנית בלתי-ניתנת לפתרון בשכבת ה-HTML.

```
File A (WSM) → written by human
File B (JSON) → written by CLI
File C (STATE_SNAPSHOT) → generated periodically

Dashboard sees File C.
File C is stale the moment WSM or JSON change.
There is no server to compute the current truth.
```

### כשל 2: ביצוע פקודות = copy-paste ידני

בMode 2, הדשבורד **מייצר** פקודות אך **לא מבצע** אותן. המפעיל צריך:
- לקרוא את הפקודה בדשבורד
- לפתוח טרמינל
- להעתיק ולהדביק
- לחזור לדשבורד לאימות

זה עובד בMode 2. בMode 3 — זה בלתי-אפשרי בהגדרה.

### כשל 3: עסקיות (Transactions) = אפס

כשGate Owner מעדכן WSM, הדשבורד לא יודע. כש-CLI מריץ `pass`, WSM לא מתעדכן אוטומטית.
אין אפשרות לבצע **עדכון אטומי** של WSM + JSON ביחד — כי אין שכבה שמחזיקה את שניהם.

---

## 2. מדוע שכבת שרת = תיקון השורש

### מה שכבת שרת מאפשרת:

| יכולת | Static HTML | עם שרת |
|-------|------------|---------|
| קריאת state עדכנית בכל request | ❌ רק מה שבקובץ | ✅ חישוב חי |
| drift detection real-time | ❌ בלתי-אפשרי | ✅ כל request |
| ביצוע פקודות מהדשבורד | ❌ copy-paste | ✅ POST /api/pipeline/pass |
| עדכון אטומי WSM + JSON | ❌ שני תהליכים נפרדים | ✅ transaction אחת |
| WebSocket / real-time updates | ❌ | ✅ |
| Mode 3 (full automation) | ❌ בלתי-אפשרי | ✅ foundation |

### WSM + JSON drift — הפתרון האמיתי:

ללא שרת:
```
[WSM] ← human writes → [might be stale vs JSON]
[JSON] ← CLI writes → [might be stale vs WSM]
[Dashboard] ← reads pre-computed file → [stale by definition]
```

עם שרת:
```
[WSM] ← human writes ─┐
                        ├→ [Server: reads both live on every request → returns unified state]
[JSON] ← CLI writes ───┘         ↕
                        [Dashboard reads /api/state/{domain}]
```

**אין drift כי אין pre-computed file שיכול להתיישן.**
השרת קורא WSM + JSON בכל request — תמיד מחזיר אמת.

---

## 3. S003-P007 — הגדרה מחודשת

### ההגדרה הנוכחית (לא מספקת)

S003-P007 הוגדר עד כה כ-**"Command Bridge Lite"** = הוספת כפתורי "Copy Command" בדשבורד.
זו תפישה **צרה מדי** — פותרת את כשל 2 בלבד (copy-paste) אך משאירה כשלים 1 ו-3 פתוחים.

### ההגדרה הנכונה (מורחבת)

**S003-P007 = "Command Bridge Lite" = שכבת שרת ל-AOS Dashboard**

```
┌─────────────────────────────────────────────────────────┐
│  AOS Pipeline Server (Starlette / FastAPI — קטן וממוקד) │
│                                                         │
│  GET  /api/state/{domain}                               │
│       → קריאת WSM + JSON חיה → unified state object     │
│       → drift detection inline (אין pre-computed file)  │
│                                                         │
│  POST /api/pipeline/{domain}/{command}                  │
│       → מריץ pipeline_run.sh בשרת                       │
│       → מחזיר תוצאה לדשבורד                             │
│                                                         │
│  GET  /api/health                                       │
│       → WSM freshness, JSON integrity, stage violations │
│                                                         │
│  (Mode 3) /ws/pipeline-events                           │
│       → WebSocket: push updates ל-Dashboard             │
└──────────────┬──────────────────────────────────────────┘
               │ serves static files + API
               ▼
┌─────────────────────────────────────────────────────────┐
│  Dashboard (HTML + JS — "dumb display layer")           │
│  - קוראת אך ורק מ- /api/state                           │
│  - שולחת פקודות ל- /api/pipeline                        │
│  - אין קריאת קבצים ישירה בשום מצב                       │
└─────────────────────────────────────────────────────────┘
```

### מה הדשבורד הופך להיות

**לפני S003-P007 (Mode 2 — היום):**
```
Dashboard = read files + display + generate commands (for human to copy-paste)
```

**אחרי S003-P007 (Mode 2+):**
```
Dashboard = call API + display + execute commands directly (one click)
```

**Mode 3 (S004-P008):**
```
Dashboard = monitoring surface; pipeline engine drives everything autonomously
```

---

## 4. ציר הזמן האדריכלי — שלושה שלבים

```
עכשיו (Mode 2 — ניהול דרך דשבורד)
│
├── WP003: CS-01..CS-08 symptom fixes
│          (State provenance, fallback removal, sentinel fix)
│
├── WP004: State schema cleanup
│          (STAGE_PARALLEL_TRACKS + JSON identity fields removal +
│           STATE_SNAPSHOT improvement — Option B)
│          NOTE: STATE_SNAPSHOT REMAINS until S003-P007 replaces it
│
└── S003-P007: AOS Pipeline Server (Command Bridge Lite — EXPANDED)
               ├── Starlette/FastAPI micro-server
               ├── /api/state → live WSM + JSON reconciliation
               ├── /api/pipeline → execute commands from dashboard
               ├── Real-time drift detection (no pre-computed files)
               ├── Atomic WSM + JSON updates
               └── Foundation for Mode 3

S004-P008 (Mode 3): Full automation — pipeline engine runs autonomously
```

---

## 5. תיקון מיידי 1: agents_os_parallel_track

### ממצאי חקירה

| שאלה | תשובה |
|------|-------|
| האם קוד קורא את השדה? | **לא** — אפס קוד, אפס scripts |
| מי משתמש בו? | Teams 10, 51, 61, 90, 170 — קריאה אנושית בלבד |
| מדוע נוצר? | Workaround ידני לWSM single-track limitation — נוצר בהנחיית Team 00 (2026-03) |
| כמה תהליכי שער מתייחסים אליו? | 12+ gate update steps ב-SOP של Teams שונים |
| מה הסיכון בהסרה? | גבוה עד שיש חלופה מובנית |

### פעולות מיידיות (לפני WP004)

**שלב א — עכשיו (Gate Owner):**
הוספת `STAGE_PARALLEL_TRACKS` כטבלה מובנית ב-WSM, בנוסף ל-`agents_os_parallel_track`.
שניהם קיימים בינתיים — ה-table הוא הנכון; ה-prose ממשיך לשרת teams עד WP004.

**שלב ב — WP004:**
- הסרת `agents_os_parallel_track` prose field
- `STAGE_PARALLEL_TRACKS` = replacement מלא
- עדכון SOP לכל gate process שמתייחס לשדה הישן
- Team 170 mandate לעדכן כל activation prompts

**ה-workaround הצליח** — שימש אותנו 3+ חודשים. אבל עכשיו שאנחנו מבינים את הבעיה לעומק, הגיע הזמן לפיתרון מבני.

---

## 6. תיקון מיידי 2: Stage = Milestone — נעילה בתיעוד

### ההגדרה הנכונה (נעולה מהיום)

```
PHOENIX_ROADMAP Hierarchy:
  Roadmap (אחד — PHOENIX_ROADMAP)
    └── Milestone / Stage (שלב)     ← L1
          └── Program (תכנית)       ← L2
                └── Work Package    ← L3
                      └── Task      ← L4
```

### כללי ברזל לנעילה

**IR-STAGE-01:** תמיד יש רק **שלב (milestone) אחד פעיל** בכל רגע. הוא גלובלי לכל הדומיינים.

**IR-STAGE-02:** כל תוכנית פעילה **חייבת** להיות בשלב הפעיל.
`program_id.prefix == active_stage_id` → validation rule בכל שכבת בדיקה.

**IR-STAGE-03:** שינוי שלב = **Gate event ברמת ה-Roadmap** — לא ב-WSM רגיל.
מצריך Team 00 approval + Team 190 validation + Team 170 documentation.

**IR-STAGE-04:** מינוח רשמי: **"Stage" = "Milestone"**.
בקוד ובתיעוד: `stage_id`, `active_stage_id`, `stage_label` — קריאה כ-"Milestone" בשיחה עם Nimrod.

### אכיפה ב-STAGE_PARALLEL_TRACKS

כל שורה בטבלה נאכפת אוטומטית:
```
active_stage_id = S002
STAGE_PARALLEL_TRACKS:
  - domain: AGENTS_OS
    active_program_id: S002-P005   ← MUST start with "S002" → VALID
  - domain: TIKTRACK
    active_program_id: —           ← IDLE → VALID

VIOLATION example:
  active_program_id: S001-P002   ← prefix S001 ≠ active_stage S002 → BLOCK
  (exception only via AUTHORIZED_STAGE_EXCEPTIONS)
```

---

## 7. אשרור ה-Roadmap (עדכון scope S003-P007)

**השינוי הנדרש:**

S003-P007 כפי שהוגדר ב-ADR-031 = "Command Bridge Lite"
ה-LOD200 של S003-P007 **לא נכתב עדיין** (confirmed per memory).

**הנחיית Team 00:** כאשר LOD200 של S003-P007 ייכתב, הוא חייב לכלול:

| רכיב | תיאור |
|------|-------|
| AOS Pipeline Server | Starlette/FastAPI micro-server, פורט נפרד (8091 מוצע) |
| State API | GET /api/state/{domain} — live WSM + JSON reconciliation |
| Pipeline API | POST /api/pipeline/{domain}/{command} — executes CLI |
| Health API | GET /api/health — drift, freshness, stage violations |
| Dashboard refactor | כל קריאות קבצים ישירות → API calls |
| Atomic updates | WSM + JSON updated in single server-side transaction |
| Legacy removal | pipeline_state.json, STATE_SNAPSHOT.pipeline section |
| Mode 3 foundation | /ws/pipeline-events WebSocket (stub) |

**זה לא הרחבת scope — זה ה-scope הנכון שADR-031 ביקש ולא הגדיר מספיק.**

---

## 8. סיכום — עמדת Team 00

**השאלה שנשאלה:** האם הדשבורד צריך שכבת שרת?
**תשובה:** כן. זה לא פיצ'ר — זה תשתית בסיסית ל-Mode 2+ ול-Mode 3.

**הבעיה עם drift/sync** היא **תסמין** של הגבלה מבנית: HTML סטטי לא יכול לחשב state חי.
כל workaround (STATE_SNAPSHOT, OPERATIONAL_VIEW, CI enforcement) הוא עיגול של הגבלה זו.

**שכבת שרת = הפיתרון הנכון** — ולראיה: S003-P007 כבר רשום ב-roadmap כ"Command Bridge Lite".
הוא הרגיש נכון מהתחלה. עכשיו אנחנו מבינים בדיוק למה.

**ציר ההחלטות:**

```
WP003 (עכשיו)   → תיקוני תסמינים — CS-01..CS-08
WP004 (אחרי)    → ניקוי schema — STAGE_PARALLEL_TRACKS + JSON cleanup
S003-P007        → הפיתרון — AOS Pipeline Server
```

---

## 9. החלטות הנדרשות מ-Nimrod

**החלטה 1 — האם S003-P007 scope מאושר כפי שמוגדר בסעיף 6?**
(AOS Pipeline Server — לא רק copy buttons)

**החלטה 2 — agents_os_parallel_track:**
א) מאשר שלב א (הוספת STAGE_PARALLEL_TRACKS ל-WSM עכשיו, שניהם קיימים עד WP004)?

**החלטה 3 — Stage = Milestone:**
IR-STAGE-01..04 נעולים?

**החלטה 4 — WP003 + WP004 flow:**
WP003 מתקדם עכשיו → Nimrod + Team 00 מייצרים שלד WP004 → מנדט לTeam 61?

---

**log_entry | TEAM_00 | DASHBOARD_ARCHITECTURE_EVOLUTION | v1.0.0_CREATED | PENDING_APPROVAL | 2026-03-16**

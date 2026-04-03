date: 2026-03-25
historical_record: true

# AOS — Architecture Specification Base
**Author:** Team 100
**Date:** 2026-03-25
**Status:** PRE-SPEC — pending Nimrod approval before LOD200
**Scope:** Green-field redesign of AOS pipeline engine + dashboard

---

## 1. יעדים

1. לנהל ניתוב — לדעת, לכל שלב בכל שער בכל דומיין, איזה צוות מפעיל ואיזה מנוע
2. לנהל מצב ריצה — WP X נמצא ב-gate Y, phase Z, domain W, mode M
3. לייצר פרומפט — הוראת הפעלה מלאה ויעילה לצוות הנכון
4. לתמוך ב-3 מצבי עבודה — ידני / דשבורד / אוטומטי (ראה §4)
5. לשמור היסטוריה מלאה וניתנת לשאילתה
6. לאפשר שינויים במבנה — דומיינים חדשים, שינוי שערים/שלבים — ללא שינוי קוד
7. לספק ממשק idiot-proof לאדם — CLI + Dashboard עם ולידציה מלאה

---

## 2. עקרונות ארכיטקטורה (Anti-Spaghetti Rules)

### 2.1 כלל התלויות — One Direction Only
```
Presentation → Application → Domain ← Infrastructure
```
- Domain: לא יודע שיש DB, לא יודע שיש CLI
- Application: לא יודע שיש SQLite, לא יודע שיש HTTP
- Infrastructure: מממשת interfaces שה-Application מגדירה
- Presentation: קוראת ל-Application בלבד, ללא לוגיקה עסקית

### 2.2 כלל ה-Use Case — One Class, One Operation
כל פעולה = class אחד. AdvanceGate לא יודע על GeneratePrompt. GeneratePrompt לא יודע על DB.
שבירת הכלל הזה היא מה שיצר את pipeline.py (3,854 שורות).

### 2.3 כלל הנתונים — Data is Truth, Code is Behavior
מה שמשתנה (שערים, שלבים, ניתוב, צוותים, דומיינים) → DB.
מה שקבוע (לוגיקת transition, בניית פרומפט) → code.
**אף ניתוב לא hardcoded בקוד.**

### 2.4 כלל ה-Event — Facts are Immutable
כל שינוי state מייצר Event. Events לעולם לא נמחקים ולא נערכים.
State נוכחי = תוצאת replay על Events, או projected view שנשמר לביצועים.

### 2.5 כלל הפרומפט — Prompt is a Value Object
פרומפט הוא אובייקט מובנה עם 4 שכבות מוגדרות, לא string.
כל שכבה נבנית ממקור נפרד. שכבות ניתנות לשימוש חוזר ולcaching.

### 2.6 כלל ה-Mode — Same Use Case, Different Actor
AdvanceGate זהה ב-3 המצבים. ההבדל הוא רק מי מפעיל אותו:
- Manual: Nimrod דרך CLI
- Dashboard: Nimrod דרך כפתור
- Automatic: Scheduler דרך API פנימי
אין "automatic code path" נפרד. יש Actor שונה.

---

## 3. שכבות המערכת

```
┌──────────────────────────────────────────────────────────┐
│  PRESENTATION                                            │
│  CLI (pipeline_run.sh)   │   Dashboard SPA               │
│  Manual mode             │   Dashboard mode              │
│  copy-paste to agent     │   copy/click actions          │
├──────────────────────────────────────────────────────────┤
│  APPLICATION (Use Cases)                                 │
│  InitiateRun   │  AdvanceGate  │  GeneratePrompt         │
│  ExecuteAgent  │  QueryStatus  │  QueryHistory           │
│  ManageRouting │  ManageDomain │  ManageTeam             │
├──────────────────────────────────────────────────────────┤
│  DOMAIN (Entities + Rules)                               │
│  Run  Gate  Phase  Team  Event  Prompt  RoutingRule      │
│  StateMachine  PhaseRouter  PromptBuilder                │
├────────────────────────────┬─────────────────────────────┤
│  INFRASTRUCTURE            │                             │
│  SQLiteRunRepo             │  ContextReader              │
│  SQLiteRoutingRepo         │  (team_XX.md files)         │
│  SQLiteEventRepo           │  AgentCallers               │
│  SQLiteTeamRepo            │  (Claude/OAI/Cursor APIs)   │
└────────────────────────────┴─────────────────────────────┘
```

---

## 4. שלושת מצבי העבודה

### 4.1 Manual Mode
- Nimrod מריץ `./pipeline_run.sh`
- המערכת מדפיסה פרומפט עם מרקרים ▼▼▼ / ▲▲▲
- Nimrod מעתיק לסשן של הצוות
- Nimrod מריץ `./pipeline_run.sh pass/fail`
- **Actor:** Nimrod (CLI)

### 4.2 Dashboard Mode
- Nimrod פותח דשבורד בדפדפן
- רואה מצב נוכחי, פרומפט, צוות מצופה
- לוחץ "Copy Prompt" → מעתיק לסשן
- לוחץ "PASS" / "FAIL" → מאשר בדיאלוג ולידציה → state מתקדם
- **Actor:** Nimrod (HTTP → Application Layer)

### 4.3 Automatic Mode
- המערכת מפעילה את הצוות ישירות דרך API
- AgentExecutor קורא ל-engine המתאים, מקבל תשובה, מנתח verdict
- מציג תוצאה לנימרוד לאישור (HITL checkpoint) — או מתקדם אוטומטית אם configured
- **Actor:** Scheduler / Trigger → ExecuteAgent Use Case

**שים לב:** HITL ב-Automatic Mode הוא configurable per domain:
```
auto_mode_hitl: true   → Nimrod מאשר כל PASS
auto_mode_hitl: false  → pipeline מתקדם אוטומטית (only for trusted gates)
```

---

## 5. ישויות ה-Domain

| ישות | תכונות מרכזיות | הערות |
|---|---|---|
| `Run` | id, wp_id, domain_id, variant, current_gate, current_phase, execution_mode, status, started_at | aggregate root |
| `Gate` | id, sequence_order, name, is_human_gate | sequence חי ב-DB |
| `Phase` | id, gate_id, sequence_order, name, allow_auto | תת-שלב |
| `Domain` | id, name, default_variant, doc_team_id | extensible |
| `Team` | id, name, engine, domain_scope | engine מגדיר מה אפשרי |
| `RoutingRule` | gate_id, phase_id, domain_id, variant, team_id | priority: specific > general |
| `Event` | id, run_id, gate_id, phase_id, team_id, event_type, verdict, reason, occurred_at | immutable |
| `Prompt` | identity_layer, governance_layer, state_layer, task_layer | Value Object, not string |
| `ExecutionMode` | MANUAL / DASHBOARD / AUTOMATIC | per-run |

---

## 6. ניתוב — איך עובד

**שאלה אחת:** `resolve(gate_id, phase_id, domain_id, variant) → Team`

**Priority (מהספציפי לכללי):**
```
1. domain + variant   (הכי ספציפי)
2. domain only
3. variant only
4. sentinel           (resolve_from_state field — למקרה lod200_author_team)
5. default            (fallback מוגדר בשלב)
```

**זה ה-resolver כולו** — ~30 שורות. לא nested dicts, לא composite string keys.
הוא קורא שאילתה אחת מ-`routing_rules` עם ORDER BY priority DESC LIMIT 1.

---

## 7. חיסכון בטוקנים — Token Efficiency

### 7.1 שכבות הפרומפט — מה יציב, מה משתנה
```
Layer 1 — Identity:    ~40 tokens  (stable — team_id + current gate/wp)
Layer 2 — Governance:  ~200 tokens (stable — governance.md, cached)
Layer 3 — State:       ~100 tokens (variable — minimal diff from last state)
Layer 4 — Task:        ~300 tokens (variable — gate/phase specific)
─────────────────────────────────────────
Total budget:          ~640 tokens
```

### 7.2 עקרונות
- Context files (team_XX.md, governance.md) נקראים פעם ונשמרים ב-memory / DB
- State layer מכיל רק מה שרלוונטי לשלב הנוכחי, לא dump מלא
- Task layer = template שמגיע מ-DB (per gate/phase), לא נבנה מחדש בכל הרצה
- Governance layer = immutable — ניתן לhash + cache לפי version

### 7.3 ניהול דרך דשבורד
- הדשבורד מאפשר לערוך task templates per gate/phase
- Nimrod מעדכן טמפלט → כל ה-runs הבאים מקבלים גרסה מעודכנת
- בלי לגעת בקוד

---

## 8. דשבורד — Idiot-Proof Design

### 8.1 עקרונות UI/UX
- **כל פעולה מבצעתית** (PASS, FAIL, initiate, delete) → confirmation dialog עם תצוגת preview
- **Optimistic UI אסור** — state מתעדכן בUI רק אחרי confirmation מהserver
- **Inline validation** על כל שדה לפני submit
- **Error states** ברורים — לא silent failures
- **Current state** תמיד גלוי — לא צריך לחפש איפה אנחנו

### 8.2 Validation Stack — שני שכבות
```
Client-side:  immediate feedback (field format, required fields)
Server-side:  domain invariants (cannot PASS a gate not in progress, cannot initiate when active run exists)
```
שכבת ה-server מחזירה error codes מובנים, לא strings.

### 8.3 מינימום עמודים
| עמוד | תכלית |
|---|---|
| Pipeline View | מצב נוכחי + prompt + פעולות |
| History View | רשימת Events עם filter |
| Configuration View | ניהול routing rules, domains, teams, task templates |
| Teams View | רשימת צוותים + status |

### 8.4 דשבורד = read + copy + confirm. לא execute.
הדשבורד לא "עושה דברים" ישירות. הוא מראה → מאשר → קורא ל-Application Layer.
Application Layer מחזיר תוצאה → דשבורד מציג.

---

## 9. תמיכה בשינויים עתידיים

### 9.1 הוספת דומיין חדש
```sql
INSERT INTO domains (id, name, default_variant, doc_team_id)
VALUES ('new_domain', 'New Domain', 'TRACK_FOCUSED', 'team_70');

INSERT INTO routing_rules (gate_id, phase_id, domain_id, variant, team_id)
VALUES ('GATE_3', '3.1', 'new_domain', NULL, 'team_15');
-- ...
```
שינוי קוד: אפס.

### 9.2 שינוי מבנה שערים/שלבים
```sql
INSERT INTO gates (id, sequence_order, name) VALUES ('GATE_6', 6, 'New Gate');
INSERT INTO phases (gate_id, phase_id, name) VALUES ('GATE_6', '6.1', 'New Phase');
INSERT INTO routing_rules (...);
```
שינוי קוד: אפס. State machine רץ על sequence_order מה-DB.

### 9.3 שינוי הרכב צוותים
```sql
UPDATE routing_rules SET team_id = 'team_15' WHERE gate_id = 'GATE_3' AND domain_id = 'tiktrack';
```
שינוי קוד: אפס.

---

## 10. שלבי האפיון הנדרשים

| שלב | תוצר | מבוסס על |
|---|---|---|
| **1. Entity Dictionary** | ישויות, תכונות, invariants | §5 above (טיוטה קיימת) |
| **2. State Machine Spec** | States, transitions, guards, per-mode | §4 above (טיוטה קיימת) |
| **3. Use Case Catalog** | 12–15 use cases, input/output/side effects | §3 above (טיוטה קיימת) |
| **4. Data Schema** | DDL — נגזר מ-Entity Dictionary | §5+§6 above |
| **5. Routing Spec** | Priority rules, sentinel handling, fallback | §6 above |
| **6. Prompt Architecture** | 4 layers, budget, caching strategy | §7 above |
| **7. Module Map** | directory tree עם תכלית לכל קובץ | §3 above |
| **8. UI Contract** | עמודים, פעולות, validation rules, error codes | §8 above |

**סדר מחייב:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → Build.

---

## 11. נקודות פתוחות לאישור נימרוד

1. **Automatic Mode HITL:** per-gate configurable (כל שלב אפשר לסמן allow_auto=true/false) — או global per-domain?
2. **מצב ידני לעומת dashboard mode:** האם CLI נשאר? או שדשבורד mode מחליף אותו לחלוטין?
3. **execution_mode per-run או per-domain?** — האם WP אחד יכול לרוץ ב-auto בזמן שאחר רץ ידנית?
4. **SQLite מספיק?** — לטווח הנראה לעין, כן. אם נדרש scale → PostgreSQL, migration פשוטה כי Repository pattern.

---

**log_entry | TEAM_100 | ARCH_SPEC_BASE | AOS_GREENFIELD | 2026-03-25**

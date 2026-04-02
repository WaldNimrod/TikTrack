---
id: TEAM_00_AOS_V3_SYSTEM_MAP_CANONICAL_DECLARATION_v1.0.0
historical_record: true
from: Team 00 (Principal — Nimrod)
to: ALL TEAMS — AOS v3 BUILD
date: 2026-03-28
type: CANONICAL_DECLARATION — System Map as official process reference
authority: TEAM_00_CONSTITUTION_v1.0.0.md — Principal constitutional authority
artifact: agents_os_v3/ui/pipeline_flow.html (standalone) → agents_os_v3/ui/flow.html (GATE_4 integrated)---

# AOS v3 — System Map: הכרזה קנונית

## 1. הכרזה

מסמך זה מכריז כי **System Map (Pipeline Flow Diagrams)** הוא:

1. **מסמך הבנה קנוני רשמי** של מסלול הפייפליין ב-AOS v3
2. **מקור אמת ויזואלי** לכל agent וכל מפעיל אנושי
3. **חלק ממנשק ההפעלה** — לא תיעוד צדדי

---

## 2. מה System Map מכיל

8 דיאגרמות, מסודרות מהכללי לפרטי:

| # | דיאגרמה | מה היא מסבירה |
|---|---------|---------------|
| 1 | **Gate Sequence** | רצף 6 שערים, אחריות צוותים, HITL conditions |
| 2 | **State Machine** | 5 states, 12 transitions, כל guard ו-action |
| 3 | **UC-01 InitiateRun** | pre-conditions G01, routing 2-שלבי |
| 4 | **Gate Execution Loop** | HITL vs Agent path, 4 verdicts |
| 5 | **Correction Cycle** | UC-09/10/11, cycle check, escalation |
| 6 | **Pause/Resume** | UC-07/08, atomic snapshot, Branch A/B |
| 7 | **Principal Override** | UC-12, 5 FORCE actions, A10A–A10E |
| 8 | **FIP** | Feedback Ingestion Pipeline, 4×3 matrix, pending_feedbacks |

---

## 3. SSOT — מקורות עליהם מבוסס ה-System Map

| ספק | גרסה | תוכן |
|-----|------|------|
| State Machine Spec | v1.0.2 | T01–T12, G01–G09, A01–A10E |
| Use Case Catalog | v1.0.4 | UC-01 עד UC-14, error codes |
| Routing Spec | v1.0.1 | resolve_actor(), Sentinel, B.1+B.2 |
| UI Spec Amendment (8B) | v1.1.1 §13 | FIP: detection modes, ingestion layers, pending_feedbacks |
| Authority Model | v1.0.0 | 3-tier pyramid, GATE_4 HITL permanent, GATE_2 conditional |
| DDL | v1.0.2 | schema backing all entities shown |

**שינוי ב-SSOT = שינוי ב-System Map.** Team 111 אחראי לעדכן את הדיאגרמות בכל שינוי spec.

---

## 4. שימוש נדרש — לכל Agent

### 4a — בעת קבלת activation prompt

כל agent שמקבל הפעלה לשלב הקשור לפייפליין **חייב** לקרוא את הסקשן הרלוונטי מתוך System Map:

| שלב | סקשן רלוונטי |
|-----|-------------|
| כל הפעלה | 1 (Gate Sequence) + 2 (State Machine) — הכרה בסיסית |
| GATE_0 | 3 (InitiateRun) |
| GATE_1 / GATE_2 | 4 (Gate Loop) |
| עבודה עם correction | 5 (Correction Cycle) |
| UC-07/08 | 6 (Pause/Resume) |
| UC-12 | 7 (Principal Override) |
| GATE_3 / FIP | 8 (FIP) |

### 4b — בעת פרשנות שגיאות

כל `error_code` שמוחזר מה-API מופה ל-guard/action ב-System Map.
Agent שמקבל שגיאה → ישייך אותה לדיאגרמה הרלוונטית לפני escalation.

### 4c — בעת שאילת שאלות ארכיטקטורה

לפני שליחת שאלה ל-team_00 או team_100 —
Agent חייב לאמת שהתשובה אינה כבר מופיעה ב-System Map.

---

## 5. שימוש נדרש — Nimrod כמפעיל

| מצב | פעולה |
|-----|-------|
| Run נכנס ל-CORRECTION | פתח System Map סקשן 5 → בדוק cycle_count מול policy |
| Dashboard מציג PENDING_REVIEW | פתח סקשן 4 (Gate Loop) → בדוק HITL path |
| צורך ב-pause/resume | פתח סקשן 6 → בדוק Branch A/B conditions |
| emergency override | פתח סקשן 7 → בחר את ה-FORCE action הנכון |
| שאלה על FIP verdict | פתח סקשן 8 → בדוק detection mode + confidence |

---

## 6. גרסאות ונתיבים קנוניים

### נוכחי (עצמאי)
```
agents_os_v3/ui/pipeline_flow.html
```
גרסה: v1.1.0 — Team 111 — 2026-03-28.
זמין ב: `http://localhost:8091/pipeline_flow.html` (dev server port 8091).

### GATE_4 (משולב בדשבורד — יעד)
```
agents_os_v3/ui/flow.html
```
Tab: "System Map" בניווט הראשי — אחרי Portfolio.
מנדט: `_COMMUNICATION/team_31/TEAM_31_AOS_V3_PIPELINE_FLOW_INTEGRATION_MANDATE_v1.0.0.md`
זמין ב: `http://localhost:8091/flow.html` (אחרי GATE_4 PASS).

### תיעוד מלא (markdown)
```
_COMMUNICATION/team_111/TEAM_111_AOS_V3_PIPELINE_FLOW_DIAGRAM_v1.0.0.md
```
מקור: Team 111 — כולל Mermaid code + SSOT references.

---

## 7. Iron Rules

1. **תוכן הדיאגרמות אינו משתנה ללא מנדט מ-Team 111 או Team 100.**
   שינוי תוכן (הוספת transition, שינוי guard) = שינוי spec = דורש גרסה חדשה.

2. **System Map אינו מחליף spec docs.**
   הוא visualization של spec docs. ב-conflict — ה-spec הכתוב גובר.

3. **בכל גרסה חדשה של spec — System Map חייב להתעדכן.**
   Team 111 מוציא עדכון לפי אותה מחזור gate שבו ה-spec עודכן.

4. **System Map הוא read-only לכל agent.**
   אף agent אינו מאושר לשנות את `pipeline_flow.html` או `flow.html` ללא מנדט מ-Team 00.

---

## 8. Versioning

| גרסה | תאריך | שינוי |
|------|-------|-------|
| v1.0.0 | 2026-03-28 | יצירה ראשונית — 8 diagrams, standalone HTML |
| v1.1.0 | 2026-03-28 | סדר מהכללי לפרטי, State Machine כ-flowchart עם Gate Review hub, domain clarifications |
| v1.x.0 | GATE_3+ | עדכונים לפי spec changes (FIP detail, SSE, etc.) |
| v2.0.0 | GATE_4 | שילוב בדשבורד כ-flow.html (team_31 execution) |

---

**log_entry | TEAM_00 | AOS_V3_SYSTEM_MAP | CANONICAL_DECLARATION | v1.0.0 | 2026-03-28**

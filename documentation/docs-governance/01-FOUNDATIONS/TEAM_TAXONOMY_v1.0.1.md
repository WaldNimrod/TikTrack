---
id: TEAM_TAXONOMY_v1.0.1
authority: Team 00 — System Designer
date: 2026-03-29
status: CANONICAL
supersedes: TEAM_TAXONOMY_v1.0.0.md
source_roster: TEAMS_ROSTER_v1.0.0.json (see roster_version in _meta)
---

# Team Taxonomy — Canonical Definition
## טקסונומיית הצוותים — הגדרה קנונית

---

## 1. Group Enum — קבוצות

| value (en) | תרגום | תיאור | צוותים |
|---|---|---|---|
| `leadership` | **מנהיגות** | סמכות עליונה — Principal, הגדרת Iron Rules, אישור סופי | team_00 |
| `gateway` | **שער ביצוע** | Gateway — work plans, mandates, gate submissions; **מצב pipeline ו-WSM בשגרה = מנוע pipeline**, לא עדכון ידני של Team 10 בכל צעד (ראה `TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.1.md` §3) | team_10, team_11 |
| `implementation` | **ביצוע** | כתיבת קוד ייצור — backend, frontend, devops | team_20, team_21, team_30, team_31, team_60, team_61 |
| `qa` | **בטיחות וקבלה** | QA, E2E tests, functional acceptance, gate seals | team_50, team_51 |
| `design` | **עיצוב** | Design tokens, CSS, UI assets, visual consistency | team_40 |
| `architecture` | **אדריכלות** | Spec production, LOD200/LOD400, architectural decisions | team_00, team_100, team_110, team_111 |
| `governance` | **ממשל** | Constitutional validation, spec governance, git ops, dev validation | team_90, team_170, team_190, team_191 |
| `documentation` | **תיעוד** | Technical writing, AS_MADE_REPORT, knowledge promotion | team_70, team_71 |

> **הערה:** team_00 מופיע בשתי קבוצות (leadership + architecture) — תפקיד כפול מובנה.  
> **הערה:** team_170 ו-team_190 מסווגים כ-governance. תפקידם היועצי (advisory mode) אינו מצריך קבוצה נפרדת — הוא מצב הפעלה שנטען בLayer 4.

---

## 2. Profession Enum — מקצועות

| value (en) | תרגום | תיאור | צוותים |
|---|---|---|---|
| `principal` | **מנהל עליון** | Product Principal + Constitutional Architect — הגדרת WHAT+WHY+Iron Rules | team_00 |
| `gateway_orchestrator` | **מנהל ביצוע** | Gateway — תיאום תוכניות עבודה והפעלה; **אינו** מחליף את אוטומציית ה-pipeline לעדכוני state שוטפים | team_10, team_11 |
| `backend_engineer` | **מהנדס Backend** | API, DB, services, logic, runtime — server-side only | team_20, team_21 |
| `frontend_engineer` | **מהנדס Frontend** | UI components, pages, client-side logic, API integration | team_30, team_31 |
| `devops_engineer` | **מהנדס DevOps** | Infrastructure, CI/CD, runtimes, platform readiness | team_60, team_61 |
| `qa_engineer` | **מהנדס QA** | Test suites, E2E, regression, functional acceptance, SOP-013 seals | team_50, team_51 |
| `ui_designer` | **מעצב UI** | Design tokens, CSS frameworks, visual consistency, UI assets | team_40 |
| `domain_architect` | **אדריכל דומיין** | Spec production, LOD200/LOD400, domain authority, GATE_2/6 ownership | team_100, team_110, team_111 |
| `constitutional_validator` | **ולידטור חוקתי** | GATE_0–2 validation, architectural integrity, BLOCKER authority | team_190 |
| `spec_governance` | **ממשל ומפרט** | Document maintenance, registry sync, canonical governance | team_170 |
| `dev_validator` | **ולידטור פיתוח** | Cross-domain dev validation, GATE_5+ checks, blocking reports | team_90 |
| `git_operator` | **מפעיל Git** | Pre-push guard, header normalization, registry sync, git ops | team_191 |
| `technical_writer` | **כותב טכני** | AS_MADE_REPORT, spec docs, knowledge promotion, governance writing | team_70, team_71 |

---

## 3. מיפוי מלא — כל צוות

| ID | שם | Group | Profession | Domain | Engine |
|---|---|---|---|---|---|
| team_00 | Principal & Chief Architect | leadership / architecture | principal | multi | claude-code |
| team_10 | Execution Orchestrator | gateway | gateway_orchestrator | tiktrack | cursor |
| team_11 | AOS Gateway / Execution Lead | gateway | gateway_orchestrator | agents_os | cursor |
| team_20 | Backend Implementation | implementation | backend_engineer | tiktrack | cursor |
| team_21 | AOS Backend Implementation | implementation | backend_engineer | agents_os | cursor |
| team_30 | Frontend Implementation | implementation | frontend_engineer | tiktrack | cursor |
| team_31 | AOS Frontend Implementation | implementation | frontend_engineer | agents_os | cursor |
| team_40 | UI Assets & Design | design | ui_designer | tiktrack | cursor |
| team_50 | QA & Functional Acceptance | qa | qa_engineer | tiktrack | cursor |
| team_51 | AOS QA & Functional Acceptance | qa | qa_engineer | agents_os | cursor |
| team_60 | DevOps & Platform | implementation | devops_engineer | tiktrack | cursor |
| team_61 | AOS DevOps & Platform | implementation | devops_engineer | agents_os | cursor |
| team_70 | TikTrack Documentation | documentation | technical_writer | tiktrack | codex |
| team_71 | AOS Documentation | documentation | technical_writer | agents_os | codex |
| team_90 | Dev Validator | governance | dev_validator | multi | codex |
| team_100 | Chief System Architect / Chief R&D | architecture | domain_architect | agents_os | codex |
| team_110 | AOS Domain Architect (IDE) | architecture | domain_architect | agents_os | codex |
| team_111 | TikTrack Domain Architect (IDE) | architecture | domain_architect | tiktrack | codex |
| team_170 | Spec & Governance | governance | spec_governance | multi | codex |
| team_190 | Constitutional Validator | governance | constitutional_validator | multi | codex |
| team_191 | Git-Governance Lane | governance | git_operator | multi | cursor |

**סה"כ: 21 צוותים** (19 פעילים/רשומים + team_00 Principal)

---

## 4. עיקרון Context Isolation לפי Profession

| Profession | Layer 2 size | Layer 3 | כלל |
|---|---|---|---|
| backend_engineer | SMALL — domain rules only | current WP, current gate | backend rules + DB patterns בלבד |
| frontend_engineer | SMALL — domain UI rules | current WP, current gate | UI rules + component patterns בלבד |
| devops_engineer | SMALL — domain infra rules | current WP, current gate | infra rules בלבד |
| gateway_orchestrator | MEDIUM — pipeline + domain | full pipeline state + assignments | יודע מה קורה, לא איך לממש |
| qa_engineer | MEDIUM — QA protocols + domain | current WP + test state | QA protocols + domain context |
| domain_architect | LARGE — spec framework + domain | full architecture state | LOD200/400 + all domain rules |
| constitutional_validator | LARGE — constitutional rules | gate submission under review | cross-domain constitution — מוצדק |
| dev_validator | LARGE — both domains | gate submission under review | multi-domain — מוצדק לcross-validation |
| spec_governance | MEDIUM — governance rules | current registry state | governance docs + canonical paths |
| principal | FULL — all | all | סמכות עליונה — context מלא מוצדק |

**עיקרון:** ככל שה-profession נמוך יותר בהיררכיה, הקונטקסט שלו צריך להיות **קטן יותר** — כך הפלט מדויק יותר.

---

## 5. תבנית x0/x1 — TikTrack / AOS

```
x0 (TikTrack)    x1 (AOS)         pair
─────────────────────────────────────────
team_10          team_11          Gateway
team_20          team_21          Backend
team_30          team_31          Frontend
team_50          team_51          QA
team_60          team_61          DevOps
team_70          team_71          Documentation
```

**כלל:** כל צוות x0 ו-x1 מקבלים אותו Layer 4 task template, עם domain parameter שונה.  
**תועלת:** skill אחד ניתן לשכפל לשני דומיינים פשוט על ידי החלפת ה-domain field.

---

## 6. Parent/child לכל הזוגות (hub §10) + 4 שכבות קונטקסט

התבנית **shared + inherited + child override** חלה **ברוחב מלא** על כל זוג x0/x1 (לא רק 50/51):

1. **Base משותף** לזוג (תבנית תפקיד).  
2. **ירושה** של ברירות מחדל (Iron Rules חלקיים, גודל Layer 2).  
3. **Override ילד** ב-**Layer 4** (והערות Layer 1).  
4. **טעינת קונטקסט** חייבת לקשור **מזהה צוות ספציפי** (למשל 11 לא 10) כדי שלא ייטען תבנית גנרית שגויה.

---

## 7. Dual-Mode Teams

הצוותים הבאים פועלים בשני מצבים עם Layer 4 templates שונים:

| צוות | מצב A (Gate) | מצב B (Advisory) | Trigger |
|---|---|---|---|
| team_170 | Spec production mandate | Governance research request | אם request type = ADVISORY |
| team_190 | Gate BLOCK/PASS verdict | Architectural second opinion | אם request type = ADVISORY |

**אין שינוי ב-Layer 1 או Layer 2** — רק Layer 4 template מוחלף.

---

## 8. Pipeline Fidelity Suite (PFS)

הגדרה קנונית קצרה: `PRINCIPAL_AND_TEAM_00_MODEL_v1.0.0.md` §3.  
PFS = כלי/חבילת בדיקות לזרימת pipeline + dashboard **בלי** הרחבת רוסטר סקוודים.

---

**log_entry | TEAM_TAXONOMY | v1.0.1 | CANONICAL | 2026-03-26**

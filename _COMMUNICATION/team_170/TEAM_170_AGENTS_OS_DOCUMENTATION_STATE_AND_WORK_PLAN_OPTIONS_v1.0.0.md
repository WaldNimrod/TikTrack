# TEAM 170 — Agents_OS Documentation: Current State & Work Plan Options
## Document: TEAM_170_AGENTS_OS_DOCUMENTATION_STATE_AND_WORK_PLAN_OPTIONS_v1.0.0.md

**From:** Team 170 (Governance Spec / Documentation / UI Spec)
**To:** Team 00 / Team 100 (Architect / Program Manager); Team 10 (Gateway)
**date:** 2026-03-14
**purpose:** תמונת מצב עדכנית של תיעוד דומיין Agents_OS + אופציות לתוכניות עבודה לספריית תיעוד מסודרת

---

## Identity

```
project_domain: SHARED (AGENTS_OS documentation strategy)
document_type: STATE_ANALYSIS + WORK_PLAN_OPTIONS
issuing_team: team_170
```

---

## 1. מבנה התיעוד הקיים (קנון)

לפי `00_DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL_v1.0.0.md` ו־`00_MASTER_INDEX.md`:

| שורש | דומיין | תוכן |
|------|--------|------|
| `documentation/docs-system/` | **TIKTRACK** | ארכיטקטורה (01-ARCHITECTURE, LOGIC, FRONTEND), שרת (02-SERVER), עיצוב (07-DESIGN), מוצר (08-PRODUCT). ~83 קבצי MD. |
| `documentation/docs-governance/` | **משותף** (TIKTRACK + AGENTS_OS) | יסודות (WSM, SSM, Gate Model, Program Registry, Roadmap), נהלים (FAST_TRACK, TEAM_10_RUNBOOK, AGENTS_OS_V2_OPERATING_PROCEDURES), חוזים, תבניות, אינדקסים. **לא** תיעוד מוצר/ארכיטקטורה ייחודי ל־Agents_OS. |
| `agents_os/` | **AGENTS_OS** | שורש דומיין: קוד (runtime, validators, orchestrator, llm_gate), + `docs-governance/` (Concept Package, AOS_workpack, QUARANTINE). |
| `agents_os_v2/` | **AGENTS_OS** | אורקסטרטור V2: pipeline, context/identity, context/governance, engines, validators. |

**כלל מחייב (ממבנה הקנון):** תוכן **ייחודי** ל־Agents_OS אמור לשבת תחת `agents_os/` (כולל `agents_os/docs-governance/` ו־אופציונלי `agents_os/documentation/`). מסמכי **משילות משותפים** (שערים, WSM, נהלים) ב־`documentation/docs-governance/` בלבד.

---

## 2. תמונת מצב — מה קיים והיכן (דומיין Agents_OS)

### 2.1 תיעוד ייחודי Agents_OS (תחת `agents_os/`)

| מיקום | סוג | תוכן עיקרי |
|--------|-----|------------|
| `agents_os/README.md` | SSOT מבנה | ריצה, validators, domain isolation, חיבור 10↔90. |
| `agents_os/AGENTS_OS_FOUNDATION_v1.0.0.md` | יסוד | Foundation spec; ללא לוגיקת מוצר TikTrack. |
| `agents_os/docs-governance/AGENTS_OS_PHASE_1_CONCEPT_PACKAGE_v1.0.0/` | חבילת קונספט | ARCHITECTURAL_CONCEPT, DOMAIN_ISOLATION_MODEL, ROADMAP_ALIGNMENT, RISK_REGISTER, REPO_IMPACT_ANALYSIS, COVER_NOTE, TEAM_100_TO_TEAM_170_ACTIVATION_AGENTS_OS_PHASE_1_LLD400. |
| `agents_os/docs-governance/AOS_workpack/` | פרוטוקול/workpack | AOS_WORKSPACE_PROTOCOL, AOS_SUBMISSION_PACK_SPEC, AOS_WP001_DEFINITION_OF_DONE, TEAM_100_TO_TEAM_10_ACTIVATION_WORKTREE_SANDBOX, TEAM_100_TO_TEAM_90_VALIDATION_UPDATE_WORKTREE. |
| `agents_os/docs-governance/99-QUARANTINE_STAGE3/` | קרנטין | MB3A_POC_AGENT_OS_SPEC_PACKAGE_v1.4.0. |

**סיכום:** יש אפיון קונספט, מודל בידוד דומיין, פרוטוקולי workpack והגדרות־דone — **לא** מאורגן כספרייה עם אינדקס ברור, ולא ממופה ל־docs-system בסגנון TikTrack.

### 2.2 משילות משותפת (docs-governance) — רלוונטית ל־Agents_OS

| מיקום | תוכן |
|--------|------|
| `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` | נוהל הפעלה V2: pipeline, צוותים, context, MCP. |
| `documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/` | **רק תבניות:** LLD400_TEMPLATE_v1.0.0.md, LOD200_TEMPLATE_v1.0.0.md. (יתר docs-governance ישירות תחת 00-INDEX, 01-FOUNDATIONS וכו' — לא תחת AGENTS_OS_GOVERNANCE.) |
| `documentation/docs-governance/01-FOUNDATIONS/` | WSM, Program Registry, Roadmap, Gate Model, Team Role Mapping — כוללים תוכניות ו־programs של Agents_OS. |

**הערה:** לפי הקנון, `AGENTS_OS_GOVERNANCE` הוגדר כהיסטורי/מיפוי — "יעד פעיל נוכחי = תיקיות ישירות תחת docs-governance". בפועל רק `02-TEMPLATES` תחת AGENTS_OS_GOVERNANCE מכיל קבצים (LLD400, LOD200).

### 2.3 תקשורת וארגזי כניסה (לא ספריית תיעוד)

| מיקום | תוכן |
|--------|------|
| `_COMMUNICATION/agents_os/` | **Runtime/תצורה:** pipeline_state.json, STATE_SNAPSHOT.json, prompts (GATE_*_prompt.md, implementation_mandates.md, test prompts). **לא** ספריית תיעוד — תפעול pipeline. |
| `_COMMUNICATION/_ARCHITECT_INBOX/AGENT_OS_PHASE_*` | הגשות היסטוריות: LLD400, GATE2, Execution Approval, Validation וכו'. |
| `_COMMUNICATION/_Architects_Decisions/` | החלטות אדריכליות (כולל Agents_OS Independence, Fast Track Default, Continuation Strategic Decisions). |
| `_COMMUNICATION/team_*` | דוחות צוותים, handoffs, מנדטים — רבים מתייחסים ל־Agents_OS אך מפוזרים לפי צוות. |

**מסקנה:** יש תוכניות עבודה, מסמכי חזון/קונספט והחלטות — **אין** תיקייה אחת מסומנת כ"ספריית תיעוד Agents_OS" עם אינדקס ו־SSOT ברור.

### 2.4 קוד ו־context (לא תיעוד משתמש)

| מיקום | תוכן |
|--------|------|
| `agents_os_v2/context/identity/` | team_*.md (תפקידי צוותים — קונטקסט לאוטומציה). |
| `agents_os_v2/context/governance/` | gate_rules.md. |
| `agents_os/validators/`, `orchestrator/`, `llm_gate/` | קוד Python; README מתאר מבנה. |

---

## 3. פערים (Gaps)

1. **אין אינדקס מרכזי** לתיעוד Agents_OS (מקביל ל־00_MASTER_INDEX / docs-system עבור TikTrack).
2. **פיצול מיקומים:** ייחודי Agents_OS נמצא ב־`agents_os/`, תבניות ב־`documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/`, נהלי V2 ב־`documentation/docs-governance/04-PROCEDURES/` — ללא מסמך "כניסה אחת" לדומיין.
3. **`agents_os/documentation/`** מוזכר בקנון כאופציונלי — **לא קיים** בפועל; כל התיעוד הייחודי היום ב־`agents_os/docs-governance/` (Concept Package + AOS_workpack).
4. **חזון / אסטרטגיה / תוכניות עבודה** — קיימים ב־_COMMUNICATION ו־_Architects_Decisions ובחבילת הקונספט — **לא** מרוכזים תחת ספרייה מסודרת עם סיווג (vision / procedures / specs / templates).
5. **הבחנה חלשה** בין: (א) תיעוד **משותף** (שערים, WSM, נהלים) — נשאר ב־docs-governance; (ב) תיעוד **ייחודי** Agents_OS — אמור להיות נגיש ומוגדר תחת `agents_os/` (+ אופציונלי אינדקס ב־documentation).

---

## 4. אופציות לתוכניות עבודה (מימוש מטרה: ספריית תיעוד מסודרת לדומיין Agents_OS)

### אופציה A — מינימלית (Index + קישורים)

**רעיון:** לא להעביר קבצים; ליצור **אינדקס יחיד** שממפה "מה קיים והיכן" לדומיין Agents_OS, ולעדכן את `00_MASTER_INDEX.md` (או docs-governance) עם בלוק "Agents_OS Documentation Entry".

**פעולות עיקריות:**
- יצירת `agents_os/00_AGENTS_OS_DOCUMENTATION_INDEX_v1.0.0.md` (או תחת `documentation/docs-governance/00-INDEX/` — בהתאם להחלטה אם האינדקס שייך לדומיין או למשילות).
- טבלה: מסמך / סוג / נתיב / הערה.
- עדכון `00_DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL` / Master Index עם הפניה לאינדקס Agents_OS.

**יתרונות:** שינוי קטן, תאימות מלאה לקנון קיים, ללא העברת קבצים.  
**חסרונות:** לא נוצר "מקום אחד" פיזי; המשתמש עדיין קופץ בין תיקיות.

---

### אופציה B — בינונית (אינדקס + ארגון תחת `agents_os/`)

**רעיון:** אינדקס (כמו ב־A) **בתוספת** ארגון ברור תחת `agents_os/`:
- `agents_os/documentation/` (אופציונלי בקנון — לממש):
  - `01-FOUNDATIONS/` — קישורים או עותקים של AGENTS_OS_FOUNDATION, README מורחב.
  - `02-CONCEPT/` — קישור או העתקה מבוקרת של AGENTS_OS_PHASE_1_CONCEPT_PACKAGE (או רק אינדקס אליו).
  - `03-PROCEDURES/` — קישור ל־AGENTS_OS_V2_OPERATING_PROCEDURES (נשאר ב־docs-governance) + רשימת נהלים רלוונטיים.
  - `04-TEMPLATES/` — קישור ל־LLD400/LOD200 ב־docs-governance או עותק סמלי.
- `agents_os/00_AGENTS_OS_DOCUMENTATION_INDEX_v1.0.0.md` — כניסה אחת עם כל הנתיבים והסיווג.

**פעולות עיקריות:**
- יצירת `agents_os/documentation/` + תת־תיקיות לפי הצורך (ללא כפילות מיותרת — עדיף קישורים למשילות משותפות).
- כתיבת אינדקס עם סיווג: Foundations, Concept, Procedures, Templates, Communication (הפניות).
- עדכון מבנה הקנון ב־00_DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL אם מחליטים על מבנה קבוע.

**יתרונות:** מקום ברור לדומיין; התאמה להגדרת הקנון "agents_os/documentation אופציונלי".  
**חסרונות:** דורש החלטה מה לעשות עם קבצים קיימים (קישור vs עותק) וסנכרון עתידי.

---

### אופציה C — מלאה (מראה docs-system תחת דומיין Agents_OS)

**רעיון:** להקים תחת `agents_os/` ספרייה במבנה **מקביל** ל־`documentation/docs-system/` (ארכיטקטורה, נהלים, תבניות, מוצר/חזון), כך ש־Agents_OS יהיה עצמאי בתיעודו.

**פעולות עיקריות:**
- `agents_os/documentation/` עם תיקיות כגון:
  - `01-ARCHITECTURE/` — אפיון ארכיטקטורת Agents_OS (כולל DOMAIN_ISOLATION_MODEL, ARCHITECTURAL_CONCEPT).
  - `02-PROCEDURES/` — נהלי הפעלה ייחודיים (קישור ל־V2 Operating Procedures + נהלים נוספים אם יש).
  - `03-TEMPLATES/` — תבניות LLD400/LOD200 (קישור או עותק קנוני).
  - `04-CONCEPT/` — חבילות קונספט (Phase 1, workpack).
  - `05-VISION-AND-ROADMAP/` — מסמכי חזון/אסטרטגיה (איסוף מהארכיון והחלטות).
- אינדקס מרכזי + עדכון `00_MASTER_INDEX` ו־Folder Structure Canonical.
- כללי קידום ידע: מה נשאר ב־docs-governance (משותף) ומה מועבר/מקושר ב־agents_os/documentation.

**יתרונות:** ספרייה מלאה וברורה; דומיין Agents_OS מקביל ל־TikTrack מבחינת מבנה תיעוד.  
**חסרונות:** היקף עבודה גדול; סכנת כפילות אם לא מגדירים היטב מה "משותף" ומה "ייחודי".

---

### אופציה D — היברידית (אינדקס + קונסולידציה ללא שכפול)

**רעיון:**
- **אינדקס אחד** ב־`agents_os/00_AGENTS_OS_DOCUMENTATION_INDEX_v1.0.0.md` (או תחת docs-governance/00-INDEX כ־AGENTS_OS_DOCUMENTATION_INDEX).
- **ללא** יצירת עותקים: כל מסמך נשאר במיקום הקנוני שלו; האינדקס מפנה לנתיבים הקיימים ומסווג לפי סוג (Foundations, Concept, Procedures, Templates, Decisions, Communication).
- **מסמך אחד חדש:** `agents_os/AGENTS_OS_DOCUMENTATION_ENTRY_v1.0.0.md` — עמוד כניסה קצר: מטרה, קישור לאינדקס, קישור ל־V2 Operating Procedures, קישור ל־Program Registry / Roadmap (משותף).

**פעולות עיקריות:**
- כתיבת האינדקס (טבלה: מסמך, סוג, נתיב, הערה).
- כתיבת עמוד הכניסה.
- עדכון 00_MASTER_INDEX עם הפניה ל־Agents_OS Documentation Entry.

**יתרונות:** מינימום שינוי מבנה; כניסה אחת וברורה; תאימות מלאה לקנון (אין העתקות).  
**חסרונות:** אין "תיקייה אחת" פיזית — רק כניסה ואינדקס.

---

## 5. המלצה ראשונית (Team 170)

- **שלב 1 (מהיר):** לאמץ **אופציה D (היברידית)** או **אופציה A (מינימלית)** — אינדקס + עמוד כניסה — כדי לקבל תמונת מצב נגישה בלי להזיז קבצים.
- **שלב 2 (לפי צורך):** אם יידרש "מקום אחד" פיזי לדומיין — להרחיב ל־**אופציה B** (ארגון תחת `agents_os/documentation/` עם קישורים).
- **אופציה C** מתאימה אם מחליטים על השקעה ארוכת טווח בספרייה מלאה במקביל ל־docs-system.

**חשוב:** כל אופציה חייבת לעבור **תאימות לקנון** — בפרט `00_DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL_v1.0.0.md` (תוכן ייחודי Agents_OS תחת `agents_os/`; משותף ב־docs-governance) ו־Knowledge Promotion Protocol (Team 170 כותב ל־_COMMUNICATION/team_170; קידום ל־documentation רק דרך Team 10).

---

## 6. קבצים רלוונטיים לסריקה (רשימה מצומצמת)

- `documentation/docs-governance/00_DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL_v1.0.0.md`
- `00_MASTER_INDEX.md`
- `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`
- `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md`
- `agents_os/README.md`, `agents_os/AGENTS_OS_FOUNDATION_v1.0.0.md`
- `agents_os/docs-governance/AGENTS_OS_PHASE_1_CONCEPT_PACKAGE_v1.0.0/` (כל המסמכים)
- `agents_os/docs-governance/AOS_workpack/` (כל המסמכים)
- `documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/` (LLD400, LOD200)

---

**log_entry | TEAM_170 | AGENTS_OS_DOCUMENTATION_STATE_AND_OPTIONS | DELIVERED | 2026-03-19**

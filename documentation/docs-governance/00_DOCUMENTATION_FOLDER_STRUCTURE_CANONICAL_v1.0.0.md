# מבנה תיקיות התעוד — קנון מחייב (v1.0.0)

**project_domain:** TIKTRACK (משותף); Agents_OS — תחת דומיין נפרד  
**id:** DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL_v1.0.0  
**owner:** Team 10 (The Gateway); אימוץ מחייב — Team 70 (ספרן ראשי)  
**date:** 2026-02-22  
**status:** LOCKED — תיקון טופולוגי: הפרדת דומיינים

**Active reference unification (2026-03-10):** הנתיב הקנוני הפעיל לממשל הוא שורש `documentation/docs-governance/` עם תיקיות ישירות: `00-INDEX/`, `01-FOUNDATIONS/`, `02-POLICIES/`, `04-PROCEDURES/`, `05-CONTRACTS/`, וכו'. אין שימוש פעיל בנתיב `PHOENIX_CANONICAL/` — ראה `00_MASTER_INDEX.md` (deprecated_alias_notice). כל ההפניות המבצעיות מפנות ל־`documentation/docs-governance/01-FOUNDATIONS/`, `04-PROCEDURES/`, `05-CONTRACTS/` וכו' ישירות.

---

## 1. עקרונות מחייבים

1. **כל מה שקשור לדומיין Agents_OS** חייב לשבת **תחת תיקיית המערכת** `agents_os/` — ולא תחת תיקיות התעוד הראשיות של הממשל או של TikTrack.
2. **כל המסמכים המשותפים לשני הדומיינים** (TikTrack + Agents_OS) חייבים לשבת **בתיקיות תעוד המשילות הראשיות** — `documentation/docs-governance/` — **לא** בתיקייה של מערכת האיגנטים.
3. **SSM, WSM, נוהל שערים, Artifact Taxonomy, Retry, Directives, Procedures, Policies, Templates** — הם **משותפים** (Phoenix/Dev OS). מקומם הקנוני הפעיל: **documentation/docs-governance/** עם תיקיות ישירות (`01-FOUNDATIONS/`, `04-PROCEDURES/`, `05-CONTRACTS/` וכו'). **אין שימוש פעיל** בנתיב `PHOENIX_CANONICAL/` (היסטורי — ראה §2.1). **אסור** שיישבו תחת `agents_os/` או תחת תיקייה בשם `AGENTS_OS_GOVERNANCE`.

### 1.1 מצב (SSM / WSM) — משותף; אין קבצי מצב נפרדים לדומיין

**מקור יחיד למצב:** קובץ ה־WSM וקובץ ה־SSM הם **משותפים** לשני הדומיינים (TikTrack ו־Agents_OS). **אין** קבצי מצב (SSM/WSM) נפרדים לדומיין האיגנטים.

- **נתיב קנוני (פעיל):** `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`, `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md`.
- **בידוד דומיינים:** בידוד מתבטא במיקום **תוכן ייחודי** — כל תוכן ייחודי ל־Agents_OS תחת `agents_os/`; השכבה המשותפת (מצב ריצה, היררכיה, שערים, נהלים) נמצאת ב־`documentation/docs-governance/01-FOUNDATIONS/`, `04-PROCEDURES/`, `05-CONTRACTS/` וכו' ומשמשת את שני הדומיינים.
- **נוהל משלים:** ראה גם `agents_os/docs-governance/AGENTS_OS_PHASE_1_CONCEPT_PACKAGE_v1.0.0/DOMAIN_ISOLATION_MODEL.md` §4 (Domain Enforcement Rule) ו־§5 להלן.

---

## 2. מבנה תיקיות תעוד — הנכון (לאחר תיקון)

### 2.1 תעוד משילות ראשית (משותף לשני הדומיינים) — טופולוגיה פעילה יחידה

**שורש פעיל:** `documentation/docs-governance/` (תיקיות ישירות; אין תת־תיקיית PHOENIX_CANONICAL בנתיב הפעיל.)

| תיקייה (ישירות תחת docs-governance/) | תוכן | הערה |
|--------------------------------------|------|------|
| `00-INDEX/` | GOVERNANCE_PROCEDURES_INDEX.md, GOVERNANCE_PROCEDURES_SOURCE_MAP.md, PORTFOLIO_INDEX.md | אינדקס נהלים, Source Map |
| `01-FOUNDATIONS/` | PHOENIX_MASTER_SSM_v1.0.0.md, PHOENIX_MASTER_WSM_v1.0.0.md, 04_GATE_MODEL_PROTOCOL_v2.3.0.md, GATE_0_GATE_1_CANONICAL_DESIGN_GATES_LOCK.md, 03_ARTIFACT_TAXONOMY_REGISTRY.md, 03_IRON_RULES_AND_GOVERNANCE_CONSTITUTION.md, 07_TEAM_190_CONSTITUTION.md, 00_INDEX_CANONICAL.md | **מקום יחיד** ל־SSM, WSM ונוהל השערים |
| `02-POLICIES/` | נהלי מדיניות (למשל ARCHITECT_POLICY_*) | |
| `03-PROTOCOLS/` | 05_RETRY_PROTOCOL.md, ARCHITECT_KNOWLEDGE_PROMOTION_PROTOCOL.md | |
| `04-PROCEDURES/` | FAST_TRACK_EXECUTION_PROTOCOL_v1.2.0.md, TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md, ARCHITECT_GOVERNANCE_PROCEDURES_V2.md וכו' | |
| `05-CONTRACTS/` | GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT_v1.1.0.md, GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.1.0.md, ARCHITECT_DESIGN_CONTRACTS_MANDATE.md וכו' | |
| `06-TEMPLATES/` | ARCHITECT_DECISION_TEMPLATE*, ARCHITECT_VERDICT_* | |
| `07-DIRECTIVES_AND_DECISIONS/` | (אם קיים) | |
| `08-WORKING_VALIDATION_RECORDS/` | (אם קיים) | |
| `09-GOVERNANCE/` | **לא פעיל** — הועבר לארכיון; קונטקסט איגנטים: `00_MASTER_INDEX.md` §Active agent context | |

**היסטורי (לא לנתיב פעיל):** בעבר שימשה תת־תיקייה `PHOENIX_CANONICAL/` — כיום כל ההפניות המבצעיות מפנות ישירות ל־`documentation/docs-governance/00-INDEX/`, `01-FOUNDATIONS/`, `04-PROCEDURES/`, `05-CONTRACTS/` וכו'.

### 2.2 תעוד דומיין Agents_OS בלבד

**שורש:** `agents_os/`

| תיקייה | תוכן |
|--------|------|
| `agents_os/` | README, AGENTS_OS_FOUNDATION*, כל תוכן ייחודי למערכת האיגנטים |
| `agents_os/docs-governance/` | Concept Package, MB3A POC Spec, AOS_workpack, כל אפיון/ספק ייחודי ל־Agents_OS |
| `agents_os/documentation/` | ספריית תיעוד ייעודית — אינדקס 00_INDEX + תיקיות לוגיות (אופציה C ממומשת): |
| ↳ `agents_os/documentation/01-FOUNDATIONS/` | מסמכי יסוד: AGENTS_OS_FOUNDATION, חבילת קונספט (Cover, Domain Isolation, Architect) |
| ↳ `agents_os/documentation/02-SPECS/` | מפרטים: Concept Package, AOS Workpack, קרנטין |
| ↳ `agents_os/documentation/03-TEMPLATES/` | קישורים לתבניות משותפות (LLD400, LOD200 ב־06-TEMPLATES) |

### 2.3 תעוד מערכת (TikTrack)

**שורש:** `documentation/docs-system/` — ארכיטקטורה, שרת, עיצוב, מוצר (קיים).

### 2.3.1 תעוד Agents_OS (מאורגן)

**שורש:** `documentation/docs-agents-os/` — אינדקס ראשי, סקירה, ארכיטקטורה, CLI, נהלים, תבניות (מקביל ל־docs-system). ראה [00_AGENTS_OS_MASTER_INDEX.md](../../docs-agents-os/00_AGENTS_OS_MASTER_INDEX.md).

### 2.4 דוחות וארטיפקטים — נתיב קנוני יחיד (מחייב)

**נתיב קבוע:** דוחות וארטיפקטים (Evidence, QA, Gate) — **רק** תחת:
- `documentation/reports/05-REPORTS` (ותת־תיקיות: artifacts, artifacts_SESSION_01 וכו')
- `documentation/reports/08-REPORTS`

**איסור:** אסור ליצור או להשתמש ב־`documentation/05-REPORTS`, `documentation/08-REPORTS` (בשורש documentation), או ב־`05-REPORTS`/`08-REPORTS` בשורש ה־repo. תיקיות כפולות יארכיינו; קוד ונהלים מפנים לנתיב הקנוני בלבד.

### 2.5 תקשורת וארכיון

| נתיב | תוכן |
|------|------|
| `_COMMUNICATION/` | _Architects_Decisions, _ARCHITECT_INBOX, team_* — משותף; לא מועבר לדומיין איגנטים |
| `archive/` | תיעוד וקוד בארכיון |
| `_COMMUNICATION/99-ARCHIVE/` | ארכיון תקשורת |

---

## 3. מיפוי תיקון (היסטורי — מקור → יעד פעיל נוכחי)

**מקור שגוי (היסטורי):** `documentation/docs-governance/AGENTS_OS_GOVERNANCE/`  
**יעד פעיל נוכחי:** תיקיות ישירות תחת `documentation/docs-governance/` (למשל `00-INDEX/`, `01-FOUNDATIONS/`, `04-PROCEDURES/`, `05-CONTRACTS/`).  
**הערה:** נתיב `PHOENIX_CANONICAL/` אינו בשימוש פעיל; אם קיימת תיקייה כזו — תוכן הקנון הפעיל נמצא כבר תחת התיקיות הישירות.

- `AGENTS_OS_GOVERNANCE/00-INDEX/*` → `documentation/docs-governance/00-INDEX/`
- `AGENTS_OS_GOVERNANCE/01-FOUNDATIONS/*` → `documentation/docs-governance/01-FOUNDATIONS/`
- (וכן הלאה לתיקיות 02–08, 99-archive.)

**חובה:** כל הפניה מבצעית חדשה — לנתיבים הישירים תחת `documentation/docs-governance/` בלבד.

---

## 4. נתיבים קנוניים פעילים (מחייב)

| מסמך | נתיב קנוני פעיל |
|------|------------------|
| PHOENIX_MASTER_SSM_v1.0.0 | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md` |
| PHOENIX_MASTER_WSM_v1.0.0 | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` |
| 04_GATE_MODEL_PROTOCOL_v2.3.0 | `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md` |
| GATE_0_GATE_1_CANONICAL_DESIGN_GATES_LOCK | `documentation/docs-governance/01-FOUNDATIONS/GATE_0_GATE_1_CANONICAL_DESIGN_GATES_LOCK.md` |
| FAST_TRACK_EXECUTION_PROTOCOL (active) | `documentation/docs-governance/04-PROCEDURES/FAST_TRACK_EXECUTION_PROTOCOL_v1.2.0.md` |
| אינדקס נהלים | `documentation/docs-governance/00-INDEX/GOVERNANCE_PROCEDURES_INDEX.md` |
| Source Map | `documentation/docs-governance/00-INDEX/GOVERNANCE_PROCEDURES_SOURCE_MAP.md` |
| **דוחות וארטיפקטים** | `documentation/reports/05-REPORTS`, `documentation/reports/08-REPORTS` *(נתיב קבוע יחיד; ראה §2.4)* |
| **ספריית תיעוד Agents_OS** | `agents_os/documentation/00_INDEX.md` (01-FOUNDATIONS, 02-SPECS, 03-TEMPLATES) |
| **תיעוד מערכת TikTrack** | `documentation/docs-system/00_INDEX.md` |

---

## 5. אימוץ מחייב

- **Team 70 (ספרן ראשי):** נוהל קידום ידע, עדכון אינדקסים וקישורים — **חובה** לפי מבנה זה. כל הפניה ל־SSM/WSM/נוהל שערים — **לנתיבים הישירים** תחת `documentation/docs-governance/` (למשל `01-FOUNDATIONS/`, `04-PROCEDURES/`, `05-CONTRACTS/`) כמופיע בסעיף 4.
- **צוותים 10, 100, 170, 190:** עדכון הפניות במסמכים לפי הנתיבים בסעיף 4 בלבד (ללא שימוש ב־PHOENIX_CANONICAL).

---

**log_entry | TEAM_170 | DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL | DELIVERED | 2026-03-14**

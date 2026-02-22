# מבנה תיקיות התעוד — קנון מחייב (v1.0.0)

**project_domain:** TIKTRACK (משותף); Agents_OS — תחת דומיין נפרד  
**id:** DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL_v1.0.0  
**owner:** Team 10 (The Gateway); אימוץ מחייב — Team 70 (ספרן ראשי)  
**date:** 2026-02-22  
**status:** LOCKED — תיקון טופולוגי: הפרדת דומיינים

---

## 1. עקרונות מחייבים

1. **כל מה שקשור לדומיין Agents_OS** חייב לשבת **תחת תיקיית המערכת** `agents_os/` — ולא תחת תיקיות התעוד הראשיות של הממשל או של TikTrack.
2. **כל המסמכים המשותפים לשני הדומיינים** (TikTrack + Agents_OS) חייבים לשבת **בתיקיות תעוד המשילות הראשיות** — `documentation/docs-governance/` — **לא** בתיקייה של מערכת האיגנטים.
3. **SSM, WSM, נוהל שערים, Artifact Taxonomy, Retry, Directives, Procedures, Policies, Templates** — הם **משותפים** (Phoenix/Dev OS). מקומם הקנוני: **documentation/docs-governance/PHOENIX_CANONICAL/** (או כפי שיוגדר בסעיף 2). **אסור** שיישבו תחת `agents_os/` או תחת תיקייה בשם `AGENTS_OS_GOVERNANCE`.

---

## 2. מבנה תיקיות תעוד — הנכון (לאחר תיקון)

### 2.1 תעוד משילות ראשית (משותף לשני הדומיינים)

**שורש:** `documentation/docs-governance/`

| תיקייה | תוכן | הערה |
|--------|------|------|
| `PHOENIX_CANONICAL/` | קנון משותף: SSM, WSM, Gate Model, Artifact Taxonomy, Retry, Iron Rules, Team 190 Constitution, Directives, Procedures, Protocols, Policies, Templates, Working Validation Records | **מקום יחיד** ל־SSM, WSM ונוהל השערים; לא תחת דומיין איגנטים |
| `PHOENIX_CANONICAL/00-INDEX/` | אינדקס נהלים, Source Map | |
| `PHOENIX_CANONICAL/01-FOUNDATIONS/` | PHOENIX_MASTER_SSM_v1.0.0.md, PHOENIX_MASTER_WSM_v1.0.0.md, 04_GATE_MODEL_PROTOCOL*, GATE_0_GATE_1_CANONICAL_DESIGN_GATES_LOCK.md, 03_ARTIFACT_TAXONOMY_REGISTRY.md, 03_IRON_RULES_AND_GOVERNANCE_CONSTITUTION.md, 07_TEAM_190_CONSTITUTION.md, 00_INDEX_CANONICAL.md | יסודות קנוניים |
| `PHOENIX_CANONICAL/02-POLICIES/` | נהלי מדיניות (למשל ARCHITECT_POLICY_*) | |
| `PHOENIX_CANONICAL/03-PROTOCOLS/` | 05_RETRY_PROTOCOL.md, ARCHITECT_KNOWLEDGE_PROMOTION_PROTOCOL.md | |
| `PHOENIX_CANONICAL/04-PROCEDURES/` | ARCHITECT_GOVERNANCE_PROCEDURES_V2.md וכו' | |
| `PHOENIX_CANONICAL/05-CONTRACTS/` | ARCHITECT_DESIGN_CONTRACTS_MANDATE.md וכו' | |
| `PHOENIX_CANONICAL/06-TEMPLATES/` | ARCHITECT_DECISION_TEMPLATE*, ARCHITECT_VERDICT_* | |
| `PHOENIX_CANONICAL/07-DIRECTIVES_AND_DECISIONS/` | כל ה־ARCHITECT_* mandates ו־MISSION_DIRECTIVE_* | |
| `PHOENIX_CANONICAL/08-WORKING_VALIDATION_RECORDS/` | 08_EXEC_SUMMARY_STANDARD, 09_TECHNICAL_REPORT_STANDARD, ARCHITECT_* approval records | |
| `00-FOUNDATIONS/` | ADR Template, Documentation Standards Index (תוכן קיים) | לא להזיז |
| `01-POLICIES/` | (קיים) | |
| `02-PROCEDURES/` | (קיים) | |
| `06-CONTRACTS/` | (קיים) | |
| `09-GOVERNANCE/` | standards, GINs (קיים) | |

### 2.2 תעוד דומיין Agents_OS בלבד

**שורש:** `agents_os/`

| תיקייה | תוכן |
|--------|------|
| `agents_os/` | README, AGENTS_OS_FOUNDATION*, כל תוכן ייחודי למערכת האיגנטים |
| `agents_os/docs-governance/` | Concept Package, MB3A POC Spec, AOS_workpack, כל אפיון/ספק ייחודי ל־Agents_OS |
| `agents_os/documentation/` | (אופציונלי) תעוד נוסף ייחודי ל־Agents_OS — לא קנון משותף |

### 2.3 תעוד מערכת (TikTrack)

**שורש:** `documentation/docs-system/` — ארכיטקטורה, שרת, עיצוב, מוצר (קיים).

### 2.4 תקשורת וארכיון

| נתיב | תוכן |
|------|------|
| `_COMMUNICATION/` | _Architects_Decisions, _ARCHITECT_INBOX, team_* — משותף; לא מועבר לדומיין איגנטים |
| `archive/` | תיעוד וקוד בארכיון |
| `_COMMUNICATION/99-ARCHIVE/` | ארכיון תקשורת |

---

## 3. מיפוי תיקון (מקור → יעד)

**מקור שגוי:** `documentation/docs-governance/AGENTS_OS_GOVERNANCE/`  
**יעד נכון:** `documentation/docs-governance/PHOENIX_CANONICAL/`

- `AGENTS_OS_GOVERNANCE/00-INDEX/*` → `PHOENIX_CANONICAL/00-INDEX/`
- `AGENTS_OS_GOVERNANCE/01-FOUNDATIONS/*` → `PHOENIX_CANONICAL/01-FOUNDATIONS/`
- `AGENTS_OS_GOVERNANCE/02-POLICIES/*` → `PHOENIX_CANONICAL/02-POLICIES/`
- `AGENTS_OS_GOVERNANCE/03-PROTOCOLS/*` → `PHOENIX_CANONICAL/03-PROTOCOLS/`
- `AGENTS_OS_GOVERNANCE/04-PROCEDURES/*` → `PHOENIX_CANONICAL/04-PROCEDURES/`
- `AGENTS_OS_GOVERNANCE/05-CONTRACTS/*` → `PHOENIX_CANONICAL/05-CONTRACTS/`
- `AGENTS_OS_GOVERNANCE/06-TEMPLATES/*` → `PHOENIX_CANONICAL/06-TEMPLATES/`
- `AGENTS_OS_GOVERNANCE/07-DIRECTIVES_AND_DECISIONS/*` → `PHOENIX_CANONICAL/07-DIRECTIVES_AND_DECISIONS/`
- `AGENTS_OS_GOVERNANCE/08-WORKING_VALIDATION_RECORDS/*` → `PHOENIX_CANONICAL/08-WORKING_VALIDATION_RECORDS/`
- `AGENTS_OS_GOVERNANCE/99-ARCHIVE/*` → `PHOENIX_CANONICAL/99-ARCHIVE/` (או 99-archive תחת docs-governance)

**חובה:** העתקה מלאה של כל הקבצים לפני מחיקת `AGENTS_OS_GOVERNANCE`. מחיקת התיקייה השגויה — **רק לאחר** אימות שההעתקה הושלמה ושאין קישורים שבורים.

---

## 4. נתיבים קנוניים מעודכנים (לאחר תיקון)

| מסמך | נתיב קנוני (חדש) |
|------|-------------------|
| PHOENIX_MASTER_SSM_v1.0.0 | `documentation/docs-governance/PHOENIX_CANONICAL/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md` |
| PHOENIX_MASTER_WSM_v1.0.0 | `documentation/docs-governance/PHOENIX_CANONICAL/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` |
| 04_GATE_MODEL_PROTOCOL_v2.3.0 | `documentation/docs-governance/PHOENIX_CANONICAL/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md` |
| GATE_0_GATE_1_CANONICAL_DESIGN_GATES_LOCK | `documentation/docs-governance/PHOENIX_CANONICAL/01-FOUNDATIONS/GATE_0_GATE_1_CANONICAL_DESIGN_GATES_LOCK.md` |
| אינדקס נהלים | `documentation/docs-governance/PHOENIX_CANONICAL/00-INDEX/GOVERNANCE_PROCEDURES_INDEX.md` |
| Source Map | `documentation/docs-governance/PHOENIX_CANONICAL/00-INDEX/GOVERNANCE_PROCEDURES_SOURCE_MAP.md` |

---

## 5. אימוץ מחייב

- **Team 70 (ספרן ראשי):** נוהל קידום ידע, עדכון אינדקסים וקישורים — **חובה** לפי מבנה זה. כל הפניה ל־SSM/WSM/נוהל שערים — לנתיבים תחת `documentation/docs-governance/PHOENIX_CANONICAL/`.
- **צוותים 10, 100, 170, 190:** עדכון הפניות במסמכים לפי הנתיבים בסעיף 4.

---

**log_entry | TEAM_170 | DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL | DELIVERED | 2026-02-22**

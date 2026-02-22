# Team 170 → Team 70 — עדכון מחייב: מבנה תיקיות התעוד

**project_domain:** TIKTRACK (משותף)

**id:** TEAM_170_TO_TEAM_70_DOCUMENTATION_FOLDER_STRUCTURE_MANDATORY_UPDATE_v1.0.0  
**from:** Team 170 (Specification Engineering)  
**to:** Team 70 (ספרן ראשי — Chief Librarian)  
**cc:** Team 10 (The Gateway), Team 190  
**date:** 2026-02-22  
**status:** MANDATORY_ADOPTION  
**re:** תיקון טופולוגי — הפרדת דומיינים; נוהל מבנה תיקיות ומקום קנון SSM/WSM.

---

## 1) רקע

זוהתה שגיאה חמורה בסידור התעוד:

- מסמכים **משותפים** (SSM, WSM, נוהל שערים, Directives, Procedures וכו') יושבים **תחת תיקייה בשם AGENTS_OS_GOVERNANCE** — כלומר תחת דומיין מערכת האיגנטים. זה לא תקין.
- **כל מה שקשור לדומיין Agents_OS** חייב לשבת תחת `agents_os/`.
- **כל המסמכים המשותפים** חייבים לשבת **בתיקיות תעוד המשילות הראשיות** — לא תחת תיקיית מערכת האיגנטים.

בוצע תיקון: העתקה מלאה של כל הקנון המשותף מ־`documentation/docs-governance/AGENTS_OS_GOVERNANCE/` ל־`documentation/docs-governance/PHOENIX_CANONICAL/`.

---

## 2) נוהל ומבנה מחייבים

**חובה לאמץ כנוהל מחייב:**

- **מסמך המגדיר את מבנה תיקיות התעוד (קנון):**  
  **`documentation/docs-governance/00_DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL_v1.0.0.md`**

- **מבנה התיקיות המלא הנכון** (תמצית):
  - **משותף (TikTrack + Agents_OS):**  
    `documentation/docs-governance/PHOENIX_CANONICAL/`  
    — 00-INDEX, 01-FOUNDATIONS (SSM, WSM, Gate Model, Artifact Taxonomy, Retry, Iron Rules, Team 190 Constitution), 02-POLICIES, 03-PROTOCOLS, 04-PROCEDURES, 05-CONTRACTS, 06-TEMPLATES, 07-DIRECTIVES_AND_DECISIONS, 08-WORKING_VALIDATION_RECORDS.
  - **דומיין Agents_OS בלבד:**  
    `agents_os/`, `agents_os/docs-governance/` (Concept, MB3A, AOS_workpack וכו').
  - **מצב נוכחי (WSM):**  
    `documentation/docs-governance/PHOENIX_CANONICAL/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` (בלוק CURRENT_OPERATIONAL_STATE).
  - **SSM, נוהל שערים:**  
    `documentation/docs-governance/PHOENIX_CANONICAL/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md`,  
    `documentation/docs-governance/PHOENIX_CANONICAL/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md`.

---

## 3) דרישה לצוות 70

1. **לקרוא** את המסמך הקנוני:  
   `documentation/docs-governance/00_DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL_v1.0.0.md`
2. **לאמץ** את מבנה התיקיות והנתיבים כנוהל מחייב בכל קידום ידע, עדכון אינדקסים והפניות.
3. **להפנות** כל הפניה ל־SSM/WSM/נוהל שערים/קנון משותף — לנתיבים תחת `documentation/docs-governance/PHOENIX_CANONICAL/` (לא תחת `AGENTS_OS_GOVERNANCE` ולא תחת `agents_os/`).
4. **לא** להחזיר קנון משותף (SSM, WSM, Gate Model, Directives וכו') לתיקיות תחת דומיין Agents_OS.

---

## 4) קישורים ישירים

| מה | נתיב |
|----|------|
| נוהל מבנה תיקיות (קנון) | [00_DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL_v1.0.0.md](../../documentation/docs-governance/00_DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL_v1.0.0.md) |
| WSM (מצב נוכחי) | [PHOENIX_MASTER_WSM_v1.0.0.md](../../documentation/docs-governance/PHOENIX_CANONICAL/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md) |
| SSM | [PHOENIX_MASTER_SSM_v1.0.0.md](../../documentation/docs-governance/PHOENIX_CANONICAL/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md) |
| נוהל שערים | [04_GATE_MODEL_PROTOCOL_v2.3.0.md](../../documentation/docs-governance/PHOENIX_CANONICAL/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md) |
| אינדקס נהלים | [GOVERNANCE_PROCEDURES_INDEX.md](../../documentation/docs-governance/PHOENIX_CANONICAL/00-INDEX/GOVERNANCE_PROCEDURES_INDEX.md) |

---

**log_entry | TEAM_170 | TEAM_70_DOCUMENTATION_FOLDER_STRUCTURE_MANDATORY_UPDATE | SENT | 2026-02-22**

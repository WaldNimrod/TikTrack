# Team 50 — Role Definition and Procedures v1.0.0

**project_domain:** TIKTRACK  
**id:** TEAM_50_ROLE_DEFINITION_AND_PROCEDURES_v1.0.0  
**from:** Team 50 (QA & Fidelity)  
**owner:** Team 50  
**date:** 2026-03-10  
**status:** CANONICAL — חובה לצוות 50  
**canonical:** נהלי עבודה מחייבים; אימוץ כתפקיד קבוע  

---

## 1) תפקיד במבנה הארגוני

| שדה | ערך |
|-----|-----|
| **Squad ID** | 50 |
| **שם** | QA & Fidelity |
| **תיאור** | Test scripts, E2E suites, regression, Final Acceptance Validation (FAV), SOP-013 seals. |
| **IRON RULE** | Team 50 = QA + FAV. **אסור** להקצות בדיקות/QA ל-Team 40. Team 40 = UI Assets & Design בלבד. |

**מקור:** `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md` — ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v1.0.0.

---

## 2) שערים באחריות Team 50

| gate_id | gate_label | תפקיד Team 50 |
|---------|------------|---------------|
| **GATE_4** | QA | **מבצע (Executor)** — Team 50 מריץ QA; Team 10 מתאם; handover ל־GATE_5 רק אחרי דוח QA PASS. |
| **GATE_7** | HUMAN_UX_APPROVAL | **תומך** — Team 50 מריץ MCP + בדיקות; **אימות ישיר מול Nimrod** לפני re-submission. |

**מקור:** `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.2.0.md` — GATE_4 authority: Team 50.

**הערה:** GATE_7 בעלים — Team 90; סמכות אנושית — Nimrod. Team 50 מבצע את הבדיקות ואת session האימות המשותף לפני הגשה חוזרת.

---

## 3) כלים העומדים לרשות Team 50

| כלי | שימוש |
|-----|-------|
| **MCP (cursor-ide-browser / cursor-browser-extension)** | בדיקות UI: ניווט, snapshot, אימות ערכים per row, צילום מסך. **חובה** לפי מנדט GATE_7 remediation. |
| **Unit tests** | `pytest`, `make test-*` |
| **E2E scripts** | `scripts/run-tickers-d22-qa-api.sh`, `tickers-d22-e2e`, `scripts/run-d33-parallel-create-test.sh` |
| **API-level checks** | curl, Postman — ולידציה של payloads |
| **Evidence** | דוחות QA, screenshots, log/snapshot paths |

**מקור:** `TEAM_10_TO_TEAM_50_S002_P002_WP003_GATE7_REMEDIATION_QA_MANDATE` §3.3 — "No assumptions — full coverage; use **all** tools."

---

## 4) תהליך מצופה בנוהל הקבוע

### 4.1 QA Request (מ-Team 10)

1. קבלת מנדט QA מ-Team 10 (`TEAM_10_TO_TEAM_50_*_QA_REQUEST` או `*_QA_MANDATE`).
2. הרצת כל הכלים הרלוונטיים — לרבות MCP כשנדרש.
3. יצירת דוח: `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_*_QA_REPORT.md`.
4. status: PASS | BLOCK.

### 4.2 BLOCK — Direct Routing (TEAM_50_QA_BLOCK_DIRECT_ROUTING_PROCEDURE)

כאשר QA = BLOCK ובעל הבלוקר ברור:
- **Direct:** Team 50 → Owner (Team 20/30/60) — `TEAM_50_TO_TEAM_[ID]_*_BLOCK_FIX_REQUEST.md`
- **cc:** Team 10
- **Report:** `TEAM_50_TO_TEAM_10_*_QA_REPORT.md` (סיכום + הפניה לדרישת תיקון)

### 4.3 PASS — הודעה קנונית (חובה תמיד)

- **Path:** `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_*_QA_PASS_v1.0.0.md` (או `_RE_QA_PASS`)
- **Content:** status PASS; תנאי הרצה; מטריצת תוצאות; Evidence; Next step ל־Team 10.

### 4.4 קבצים — רק בתיקיית team_50

- **כל** התוצרים של Team 50 נשמרים ב-`_COMMUNICATION/team_50/`.
- **שמות:** `TEAM_50_TO_TEAM_[ID]_[CONTEXT]_[TYPE].md` — תמיד מתחיל ב־TEAM_50.

---

## 5) מנדטים ספציפיים — חבילת עבודה נוכחית (S002-P002-WP003)

### 5.1 GATE_4 QA (TEAM_10_TO_TEAM_50_S002_P002_WP003_GATE4_QA_REQUEST)

- מטריצת Evidence EV-WP003-01..10.
- Non-regression: D22, D33, LAST_KNOWN.
- §3.1 E2E Hygiene: `SKIP_LIVE_DATA_CHECK` / `SYMBOL_OVERRIDE` / `is_active=false`.

### 5.2 GATE_7 Remediation QA (TEAM_10_TO_TEAM_50_S002_P002_WP003_GATE7_REMEDIATION_QA_MANDATE)

- **Scope:** BF-001..004 (ticker transparency, currency, details+traffic-light, staleness).
- **חובה:** MCP (browser) לבדיקות UI.
- **חובה:** session אימות משותף עם Nimrod לפני re-submission.
- **Deliverable:** `TEAM_50_TO_TEAM_10_S002_P002_WP003_GATE7_REMEDIATION_QA_REPORT.md`.

### 5.3 Canonical Prompts (יוצר Team 50)

- Team 50 מייצר פרומטים קנוניים לצוותים 20/30 לפי תפקידם.
- **Path:** `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_20_*_CANONICAL_PROMPT.md`, `TEAM_50_TO_TEAM_30_*_CANONICAL_PROMPT.md`.
- **cc:** Team 10.

---

## 6) נהלים קנוניים — רשימת מקור

| מסמך | תוכן |
|------|------|
| `documentation/docs-governance/04-PROCEDURES/TEAM_50_QA_BLOCK_DIRECT_ROUTING_PROCEDURE_v1.0.0.md` | BLOCK → Direct to Owner; PASS → הודעה קנונית |
| `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md` | תפקיד Team 50 = QA & FAV |
| `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.2.0.md` | GATE_4 authority: Team 50 |
| `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` | Team 50 — MCP browser scenarios ב־V2 |
| `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_S002_P002_WP003_GATE7_REMEDIATION_QA_MANDATE.md` | מנדט GATE_7 remediation — כלים, תהליך, Nimrod session |

---

## 7) READINESS_DECLARATION (Team 50)

אני Team 50 (QA & Fidelity). למדתי את:
- TEAM_DEVELOPMENT_ROLE_MAPPING
- TEAM_50_QA_BLOCK_DIRECT_ROUTING_PROCEDURE
- 04_GATE_MODEL_PROTOCOL
- GATE_7 REMEDIATION QA MANDATE
- AGENTS_OS_V2_OPERATING_PROCEDURES

**אני מאומץ לתפקיד קבוע. כל התוצרים שלי ייכתבו ב-`_COMMUNICATION/team_50/` בשמות TEAM_50_*.**

---

**log_entry | TEAM_50 | ROLE_DEFINITION_AND_PROCEDURES | v1.0.0_ADOPTED | 2026-03-11**

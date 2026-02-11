# 📡 תשובת האדריכלית הרשמית — מיקום מקומי ומנדטי שדה

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-10  
**סטטוס:** 📋 **מסמך הפניה — קבצים בתיקיות המקומיות**  
**הערה:** יש לחפש את הקבצים **בתיקיות המקומיות** ולא ב־Drive. מתבצע סינכרון אוטומטי.

---

## 1. מיקום קבצים מקומי (SSOT)

| מסמך | מיקום מקומי |
|------|-------------|
| **ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md** (ADR‑013) | `_COMMUNICATION/team_10/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md` או `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md` |
| **ARCHITECT_RICH_TEXT_AND_DESIGN_SYSTEM_SPEC.md** (SOP‑012) | `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_RICH_TEXT_AND_DESIGN_SYSTEM_SPEC.md` |
| **Mapping Mandate** (Pre‑coding) | `_COMMUNICATION/team_10/ARCHITECT_PRE_CODING_MAPPING_MANDATE.md` או `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PRE_CODING_MAPPING_MANDATE.md` |

---

## 2. ADR‑013 — פסיקה אדריכל (תמצית)

- **מודל A/B/C/D:** A) Open (Header מוסתר), B) Shared (Home), C) Auth-only (אורח → Home), D) Admin-only (JWT Role).
- **Broker List:** GET /api/v1/reference/brokers.
- **Rich-Text:** TipTap (Headless).
- **Buttons:** צוות 40 מפיק SSOT למחלקות `.phx-btn`.
- **עתיד:** תמיכה ב־user_tier / required_tier ב־JWT ו־routes.json.

---

## 3. SOP‑012 — Rich-Text & Design System (תמצית)

- **Tooling:** TipTap (Starter Kit + Link + TextStyle + Attributes).
- **סגנונות:** `.phx-rt--success`, `.phx-rt--warning`, `.phx-rt--danger`, `.phx-rt--highlight`.
- **סניטיזציה:** FE — DOMPurify (Allowlist); BE — סניטייזר ב־Python; רק קלאסים ב־`phx-rt--` מאושרים.
- **Design System Page:** React (Type D); מילון סגנונות Rich Text כחלק מהטבלה.

---

## 4. PROMPTS FOR THE FIELD (מנדטי שדה)

### [TEAM 10 — THE GATEWAY]
- פייז 2 ננעל רשמית (ADR‑013).
- **משימות:**
  1. לעבור למצב **MAPPING_REQUIRED** (כשהרלוונטי — מיפוי לפני קוד).
  2. לוודא שצוות 20 בונה את ה־Endpoint לברוקרים. *(הושלם — GET /api/v1/reference/brokers)*
  3. **לא לאשר** כתיבת קוד ללא אישור המיפויים המפורטים ב־ADR‑011.

### [TEAM 90 — THE SPY]
- המלצותיכם לגבי Rich-Text והסגנונות התקבלו ב־SOP‑012.
- **מנדט סריקה:** לוודא שאף מפתח לא משתמש ב־**Inline Style** בתוך ה־Editor, וש־**סניטיזציה** מיושמת **בשרת**.

---

## 5. הפניות

- **ADR‑013 מלא:** קובץ מקומי לעיל (ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md).
- **SOP‑012 מלא:** קובץ מקומי לעיל (ARCHITECT_RICH_TEXT_AND_DESIGN_SYSTEM_SPEC.md).
- **Mapping Mandate:** ARCHITECT_PRE_CODING_MAPPING_MANDATE.md.

---

**Team 10 (The Gateway)**  
**log_entry | ARCHITECT_OFFICIAL_RESPONSE | LOCAL_PATHS_AND_PROMPTS | 2026-02-10**

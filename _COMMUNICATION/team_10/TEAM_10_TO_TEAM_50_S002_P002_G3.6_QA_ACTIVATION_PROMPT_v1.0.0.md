# TEAM_10 → TEAM_50 | S002-P002 G3.6 — פרומפט הפעלה לבדיקות (v1.0.0)

**project_domain:** AGENTS_OS  
**id:** TEAM_10_TO_TEAM_50_S002_P002_G3.6_QA_ACTIVATION_PROMPT_v1.0.0  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 50 (QA)  
**date:** 2026-03-07  
**status:** ACTIVE  
**program_id:** S002-P002  
**gate_id:** GATE_3_PREPARATION (G3.6 step)  
**authority:** G3.5 PASS — TEAM_10_S002_P002_G3.5_CHECKPOINT_SIGNOFF_v1.0.0.md  

---

## 1) אישור כניסה ל־G3.6

**G3.5 PASS.** תשתית Team 60 מוכנה (MCP+Chrome, runtime, signing). צוות 50 **מאושר** להריץ G3.6 — ריצות parity (MCP + Selenium) ולהפיק evidence.

---

## 2) מה מבקשים מכם לבדוק

- **Parity (יישור):** אותם **flows** (login, ניווט, CRUD, D22/D33/D34/D35 וכו') — פעם עם **Selenium** ופעם עם **Chrome דרך MCP**. לוודא שהתוצאות/כיסוי תואמים (אותו אפליקציה, אותה התנהגות; נהג שונה).
- **Evidence:** כל ריצה (או סיכום ריצות) שמיועדת להגשה — להפיק **MATERIALIZATION_EVIDENCE.json** תואם חוזה (provenance + signature block + gate + artifact path), באמצעות התשתית של צוות 60.

---

## 3) איך להריץ — צעדים

### 3.1 הכנה

1. **קראו:** `infrastructure/s002_p002_mcp_qa/MCP_CHROME_SETUP.md` — איך רצים עם Chrome דרך MCP (Cursor MCP servers: cursor-ide-browser / cursor-browser-extension).
2. **הפעלת stack:** Backend 8082 + Frontend 8080 — למשל `scripts/init-servers-for-qa.sh` או `start-backend.sh` + `start-frontend.sh`.

### 3.2 ריצת Selenium (baseline)

- **נתיב:** `tests/` — Node + selenium-webdriver + Chrome.
- **הגדרות:** `tests/selenium-config.js` (פורט 8080/8082, Chrome).
- **הרצה:** `cd tests && npm run test:gate-a` (או סקריפטים רלוונטיים מ־`tests/package.json`).
- תיעוד: אילו טסטים רצו, תוצאה (pass/fail), נתיב ללוגים/תוצרים אם יש.

### 3.3 ריצת אותם flows דרך MCP + Chrome

- **כלים:** MCP ב-Cursor (browser_navigate, browser_snapshot, browser_click, browser_type וכו') — לפי MCP_CHROME_SETUP.
- **סדר:** navigate → lock → ביצוע אותם צעדים כמו ב-Selenium (login, ניווט, טבלאות, מודלים) → unlock.
- תיעוד: אילו flows בוצעו, תוצאה, והשוואה ל-Selenium (parity: אותו כיסוי/תוצאה).

### 3.4 הפקת Evidence (חובה להגשה)

- **סקריפט:** `infrastructure/s002_p002_mcp_qa/generate_evidence.py`  
  דוגמה:  
  `python3 infrastructure/s002_p002_mcp_qa/generate_evidence.py --provenance TARGET_RUNTIME --gate GATE_3_PREPARATION --artifact path/to/artifact --sign --out out.json`
- **חתימה:** משתמשת ב־`scripts/signing/sign_evidence.py` ומפתח ב־`scripts/signing/keys/` (מפתח Team 60).
- **דוגמה:** `infrastructure/s002_p002_mcp_qa/sample_MATERIALIZATION_EVIDENCE.json`.
- **Provenance:** TARGET_RUNTIME (ריצה בסביבה מוגדרת) או LOCAL_DEV_NON_AUTHORITATIVE (ריצה מקומית) — לפי `infrastructure/s002_p002_mcp_qa/RUNTIME_IDENTITY.md`.

---

## 4) תוצר נדרש מכם

1. **ריצות parity** — תיעוד קצר: מה רצתם ב-Selenium, מה ב-MCP+Chrome, והאם יש parity (אותו כיסוי/תוצאות).
2. **קבצי evidence** (לפחות אחד לסבב) — MATERIALIZATION_EVIDENCE.json חתום, עם provenance / gate / artifact path.
3. **דוח השלמה ל־Team 10** — עם evidence_path לכל deliverable (פורמט §2: id, status, owner, artifact_path, verification_report, verification_type, verified_by, closed_date, notes). קובץ מומלץ: `TEAM_50_TO_TEAM_10_S002_P002_G3.6_QA_COMPLETION_v1.0.0.md`.

---

## 5) מקורות (בתוך ה-repo)

| נושא | נתיב |
|------|------|
| MCP + Chrome — איך ואיך | `infrastructure/s002_p002_mcp_qa/MCP_CHROME_SETUP.md` |
| Runtime / provenance | `infrastructure/s002_p002_mcp_qa/RUNTIME_IDENTITY.md` |
| מפתחות וחתימה | `infrastructure/s002_p002_mcp_qa/KEY_CUSTODY.md`, `scripts/signing/README.md` |
| הפקת evidence + חתימה | `infrastructure/s002_p002_mcp_qa/generate_evidence.py`, `scripts/signing/sign_evidence.py` |
| דוגמת evidence | `infrastructure/s002_p002_mcp_qa/sample_MATERIALIZATION_EVIDENCE.json` |
| Selenium | `tests/selenium-config.js`, `tests/package.json` |

---

**log_entry | TEAM_10 | TO_TEAM_50 | S002_P002_G3.6_QA_ACTIVATION_PROMPT | 2026-03-07**

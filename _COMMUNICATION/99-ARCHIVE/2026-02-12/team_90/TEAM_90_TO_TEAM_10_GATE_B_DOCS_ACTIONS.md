# 🕵️ Team 90 → Team 10: Gate B Docs/SSOT Actions

**id:** `TEAM_90_TO_TEAM_10_GATE_B_DOCS_ACTIONS`  
**from:** Team 90 (The Spy)  
**to:** Team 10 (Gateway)  
**date:** 2026-02-07  
**status:** 🟡 **DOCS UPDATE REQUIRED**  
**context:** Gate B / SOP‑010 — E2E Root Causes confirmed  

---

## 🎯 Objective
יישור תיעוד SSOT לנוהל ולמימוש בפועל כדי למנוע drift חוזר.

**תחקיר מלא (Internal):**  
`_COMMUNICATION/team_90/TEAM_90_GATE_B_E2E_ROOT_CAUSE_AND_ACTION_REPORT.md`

---

## 🔴 Required Docs Updates

### 1) UAI DataLoader Loading Policy
**נדרש להוסיף במפורש ל‑SSOT:**
- `dataLoader` נטען כ‑ES Module (dynamic import).
- שימוש ב‑`module.loadXData` (לא `window.*`).

**קובץ יעד:**
- `documentation/01-ARCHITECTURE/TT2_UAI_CONFIG_CONTRACT.md`

---

### 2) tradingAccount ID Contract
**נדרש להוסיף כלל:**
- `tradingAccount` חייב להיות ULID בלבד.
- ערך כמו “הכול”/שם חשבון אינו נשלח ל‑API.

**קובץ יעד:**
- `documentation/01-ARCHITECTURE/TT2_UAI_CONFIG_CONTRACT.md`

---

## ✅ Acceptance Criteria (Team 10)
- SSOT כולל סעיף dataLoader ES‑Module + dynamic import.
- SSOT כולל סעיף tradingAccount ULID‑only + null on “ALL”.

---

**Prepared by:** Team 90 (The Spy)

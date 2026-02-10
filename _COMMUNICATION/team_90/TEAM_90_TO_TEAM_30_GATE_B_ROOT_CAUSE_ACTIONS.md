# 🕵️ Team 90 → Team 30: Gate B Root‑Cause Actions (Frontend)

**id:** `TEAM_90_TO_TEAM_30_GATE_B_ROOT_CAUSE_ACTIONS`  
**from:** Team 90 (The Spy)  
**to:** Team 30 (Frontend Execution)  
**date:** 2026-02-07  
**status:** 🔴 **ACTION REQUIRED**  
**context:** Gate B / SOP‑010 — E2E failures persist  

---

## 🎯 Objective
סגירת שורשי הכשל בצד ה‑Frontend כדי לאפשר ריצת E2E מלאה ו‑GREEN ב‑Gate B.

**תחקיר מלא (Internal):**  
`_COMMUNICATION/team_90/TEAM_90_GATE_B_E2E_ROOT_CAUSE_AND_ACTION_REPORT.md`

**Policy (Server Start):**  
`_COMMUNICATION/team_90/TEAM_90_TO_ALL_TEAMS_SERVER_START_POLICY.md`

---

## 🔴 Required Actions (No Alternatives)

### 1) DataLoader Loading — ES Module (Blocking)
**בעיה:** DataLoaders הם ES Modules אבל נטענים כ‑non‑module ⇒ `Cannot use import statement outside a module`.

**ביצוע חובה:**
- ב־`ui/src/components/core/stages/DataStage.js` — להחליף `loadScript()` ב‑dynamic import:
  - `const module = await import(loaderPath)`
  - קריאה ל‑`module.loadXData(...)` במקום `window.loadXData`
- אין להשאיר טעינה דרך `<script type="text/javascript">`.

**קבצים רלוונטיים:**
- `ui/src/components/core/stages/DataStage.js`
- `ui/src/components/core/stages/StageBase.js`
- `ui/src/views/financial/*/*DataLoader.js`

---

### 2) Normalize `tradingAccount` → ULID בלבד (Blocking)
**בעיה:** ערכי Header כוללים “הכול”/שם חשבון ⇒ מגיעים כ‑`tradingAccountId` לא תקין ⇒ 400 ב‑`cash_flows/currency_conversions`.

**ביצוע חובה:**
- ב‑`ui/src/components/core/phoenixFilterBridge.js`:
  - אם הערך אינו ULID תקין ⇒ להגדיר `null` ולהסיר מה‑query.
- ב‑DataLoaders: לשלוח `tradingAccountId` רק אם ULID תקין.

**קבצים רלוונטיים:**
- `ui/src/components/core/phoenixFilterBridge.js`
- `ui/src/views/financial/*/*DataLoader.js`

---

## ✅ Acceptance Criteria (Team 30)
- אין שגיאת `import statement outside a module` ב‑Console.
- `cash_flows/currency_conversions` מחזיר 200 כאשר `tradingAccountId` לא נשלח.
- Console נקי מ‑SEVERE ב‑D16/D18/D21.

---

## 🔬 Point Tests (לאחר תיקון)
1) **Static UI Load**: `/trading_accounts`, `/brokers_fees`, `/cash_flows` — 0 SEVERE.
2) **Currency Conversions**: שינוי פילטר חשבון/"הכול" ⇒ לא נשלח ULID לא תקין.
3) **E2E**: `npm run test:phase2-e2e` — PASS מלא.

---

## 📌 Handoff
לאחר תיקונים, לעדכן את Team 50 לביצוע ריצה חוזרת ולאשר שאין SEVERE.

**Prepared by:** Team 90 (The Spy)

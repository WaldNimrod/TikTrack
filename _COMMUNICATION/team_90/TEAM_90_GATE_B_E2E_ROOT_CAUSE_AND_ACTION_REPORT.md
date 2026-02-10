# 🕵️ Team 90 — Gate B E2E Root Cause & Action Report (Post‑Multiple Reruns)

**id:** `TEAM_90_GATE_B_E2E_ROOT_CAUSE_AND_ACTION_REPORT`  
**owner:** Team 90 (The Spy)  
**date:** 2026-02-07  
**status:** 🔴 **BLOCKING — ROOT CAUSES CONFIRMED**  
**context:** Gate B / SOP‑010 — E2E failures persist despite multiple feedback cycles  

---

## 🎯 Executive Summary
לאחר סריקה ישירה של הקוד וה‑SSOT מול ארטיפקטים, נמצאו **שורשי כשל ברורים** שגורמים ל‑E2E להישאר 50% PASS.  
שתי בעיות בסיסיות מונעות יציבות:  
1) **טעינת Data Loaders כ‑non‑module בזמן שהם ES Modules** → SyntaxError → UAI DataStage נכשל.  
2) **ערך `tradingAccount` שאינו ULID** (כולל “הכול”/שם חשבון) זורם ל‑API ומייצר **400** (cash_flows/currency_conversions).  
בנוסף קיימת **400 ב‑brokers_fees/summary** שדורשת תיקון Backend/param handling.  

---

## ✅ מקורות אמת (Code + SSOT)
- **SSOT:** `documentation/01-ARCHITECTURE/TT2_UAI_CONFIG_CONTRACT.md` — dataLoader מוגדר כ‑module path.  
- **UAI DataStage:** `ui/src/components/core/stages/DataStage.js` → `loadScript()` משתמש ב‑`text/javascript`.  
- **StageBase:** `ui/src/components/core/stages/StageBase.js` → `loadScript()` לא תומך ב‑`type="module"`.  
- **Data Loaders (ES Modules):**  
  - `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js`  
  - `ui/src/views/financial/brokersFees/brokersFeesDataLoader.js`  
  - `ui/src/views/financial/cashFlows/cashFlowsDataLoader.js`  
  כולם כוללים `import` + `export` (ESM).  

- **Phoenix Filter Bridge:** `ui/src/components/core/phoenixFilterBridge.js`  
  מגדיר `tradingAccount` כ‑`account.id || account.externalUlid || account.name` כולל “הכול”.  

- **Currency Conversions Backend:** `api/services/cash_flows.py`  
  מבצע `ulid_to_uuid(trading_account_id)` → ערך לא‑ULID = **400**.  

---

## 🔴 Root Cause #1 — Data Loader ESM vs Non‑Module Loader
**בעיה:** DataStage טוען קובץ JS עם `<script type="text/javascript">`, אבל הקובץ הוא ES Module.  
**תוצאה:** `Cannot use import statement outside a module` → Data loader לא נטען → `Data loader function not found`.  

**Evidence:**
- Team 50 Updated Feedback:  
  - `tradingAccountsDataLoader.js 20:0 Uncaught SyntaxError: Cannot use import statement outside a module`
  - `brokersFeesDataLoader.js 16:0 ...`
  - `cashFlowsDataLoader.js 17:0 ...`

**נדרש תיקון מיידי (Team 30 / Core Frontend):**
**Option A (Recommended, aligns with SSOT):**
- לשנות את DataStage ל‑dynamic import:
  - `const module = await import(loaderPath)`
  - להשתמש ב‑`module.loadXData` במקום `window.loadXData`.

**Option B (Fallback, not aligned with SSOT):**
- להסיר `import/export` ולחבר את הפונקציה ל‑`window` (UMD/IIFE).  
**לא מומלץ** כי SSOT מגדיר dataLoader כ‑module.

---

## 🔴 Root Cause #2 — `tradingAccount` אינו ULID
**בעיה:** ערך `tradingAccount` שמגיע מה‑Header כולל מחרוזת “הכול” או שם חשבון, לא ULID.  
**תוצאה:** `cash_flows/currency_conversions` מחזיר **400** בגלל `ulid_to_uuid`.

**Evidence:**
- `phoenixFilterBridge.js` קובע `account.id || account.externalUlid || account.name`.  
- ב‑HTML של Header “הכול” קיים כ‑data‑value.  
- Backend מחזיר 400 אם `trading_account_id` לא ULID.  

**נדרש תיקון מיידי (Team 30):**
1) **Normalize** `tradingAccount` לערך ULID בלבד.  
2) אם הערך הוא “הכול/ALL/empty” → **להגדיר null** ולהסיר מה‑query.  
3) ב‑DataLoader: לשלוח `tradingAccountId` רק אם ערך עומד בתבנית ULID.  

---

## 🔴 Root Cause #3 — 400 ב‑`brokers_fees/summary`
**בעיה:** `GET /api/v1/brokers_fees/summary` מחזיר 400 למרות ש‑filters אמורים להיות optional.  

**נדרש תיקון (Team 20):**
- להוסיף לוג Backend ולבדוק מה ה‑query בפועל.  
- לוודא שה‑endpoint מקבל **בקשות ריקות** ו‑filters optional (broker/commission_type/search).  
- ליישר תגובה ל‑200 בכל מצב שבו אין ולידציה קשיחה.

---

## 🟡 Root Cause #4 — בדיקות E2E לא אוספות את שגיאת ה‑SEVERE האמיתית
**בעיה:** `console_logs.json` שומר רק 20 שורות ראשונות.  
SEVERE יכולה להיות מחוץ ל‑20 ולכן מקור הכשל נשאר נסתר.  

**נדרש תיקון (Team 50):**
- לשמור **כל ה‑SEVERE** ולא רק `slice(0, 20)`.  
- להוסיף `errors: errors.map(e => e.message)` ל‑artifacts.  

---

## 🟡 TokenLeakage — False Positive אפשרי
הטסט מחפש `access_token` במחרוזת ארוכה.  
`Auth Guard` מדווח על `checkedKeys: ['access_token', 'authToken']` → עשוי להפעיל false positive.  

**נדרש תיקון (Team 50):**
- לזהות רק JWT מלא (`Bearer eyJ...` באורך תקין).  
- **לא** להכשיל על הופעת מילות מפתח ללא ערך טוקן.

---

## ✅ משימות לפי צוות (ביצוע אופרטיבי)

### **Team 30 (Frontend Core + UAI)**
1) לתקן DataStage כך ש‑`dataLoader` נטען כ‑ES Module (dynamic import).  
2) לנרמל `tradingAccount` לערך ULID בלבד; “הכול” → null.  
3) לוודא ש‑DataLoaders שולחים `tradingAccountId` רק אם ULID תקין.  

### **Team 20 (Backend)**
1) לתקן `brokers_fees/summary` כך שיחזיר 200 גם ללא פרמטרים.  
2) לאשר ש‑`cash_flows/currency_conversions` מחזיר 200 כאשר trading_account_id לא נשלח.  

### **Team 50 (QA)**
1) לשפר ארטיפקטים: לשמור כל ה‑SEVERE.  
2) לעדכן TokenLeakage regex (JWT בלבד).  
3) ריצה חוזרת **אחרי** תיקוני Team 20/30 בלבד.  

### **Team 10 (Docs)**
- לעדכן SSOT/Docs שה‑`dataLoader` הוא ES Module ונטען ב‑dynamic import (UAI DataStage).  
- להוסיף כלל: `tradingAccount` חייב להיות ULID (לא label).  

---

## 📌 קבצים קריטיים
- `ui/src/components/core/stages/DataStage.js`
- `ui/src/components/core/stages/StageBase.js`
- `ui/src/components/core/phoenixFilterBridge.js`
- `ui/src/views/financial/*/*DataLoader.js`
- `api/routers/brokers_fees.py`
- `api/services/cash_flows.py`
- `documentation/01-ARCHITECTURE/TT2_UAI_CONFIG_CONTRACT.md`

---

## ✅ תנאי GREEN (Gate B)
- אין SEVERE ב‑Console (D16/D18/D21).  
- `brokers_fees/summary` ו‑`cash_flows/currency_conversions` מחזירים 200 ללא פרמטרים חובה.  
- Data loaders נטענים ללא SyntaxError.  
- TokenLeakage PASS (JWT אמיתי בלבד).

---

**Prepared by:** Team 90 (The Spy)

**log_entry | [Team 90] | GATE_B | ROOT_CAUSE_ACTION_REPORT | RED | 2026-02-07**

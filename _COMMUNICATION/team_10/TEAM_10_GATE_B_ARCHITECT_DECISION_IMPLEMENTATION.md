# Gate B RED — החלטה אדריכלית ויישום (Team 10)

**מאת:** Team 10 (The Gateway)  
**אל:** צוותים 20, 30, 50, 90  
**תאריך:** 2026-02-07  
**סטטוס:** 🔴 **Gate B RED** — עד סגירת כל הסעיפים  
**מקור:** החלטה אדריכלית — SSOT מורחב (אין אופציה B)

---

## ✅ החלטת מדיניות (ננעלה)

- **אין אופציה B.** לא מבצעים "נירמול/צמצום" או הסרת פילטרים.
- מעדכנים את ה-SSOT כך שיכיר בפילטרים הפנימיים כפי שהם קיימים **בפועל בקוד**, ואז מיישרים קוד/configs ל-SSOT החדש.

---

## 📋 SSOT עודכן (תוך 24 שעות)

**קובץ:** `documentation/01-ARCHITECTURE/TT2_UAI_CONFIG_CONTRACT.md` (גרסה v1.2.0)

**מה בוצע:**
1. **Global Filters נעולים:** `status`, `investmentType`, `tradingAccount`, `dateRange`, `search`
2. **Internal Filters per page:** רשימה מפורשת לכל עמוד (D16, D18, D21) עם מיפוי מדויק לפי הקוד הקיים
3. **Endpoint drift:** החלטה רשמית — `trading_accounts/summary` **SSOT REQUIRED** (🔒 LOCKED). Backend מיושם. Config ו-Docs חייבים להכריז עליו. **אין הסרה, אין אלטרנטיבה.** עדכון רשמי: `TEAM_10_TRADING_ACCOUNTS_SUMMARY_SSOT_REQUIRED_UPDATE.md`

**רישום מפתחות פילטרים נעולים (לפי קוד):**

| עמוד | Global (מההדר/תצוגה) | Internal (פנימי לעמוד) |
|------|------------------------|-------------------------|
| **D16 Trading Accounts** | status, investmentType, tradingAccount, dateRange, search | — (כולם גלובליים) |
| **D18 Brokers Fees** | search | broker, commissionType |
| **D21 Cash Flows** | tradingAccount, dateRange, search | flowType (ליישר type/flowType, tradingAccount/tradingAccountId) |

---

## 🔴 פעולות חובה לפי צוות

### Architect / Team 10 (Decision Owner) — הושלם

- [x] הרחבת SSOT `TT2_UAI_CONFIG_CONTRACT.md`
- [x] הגדרת Global Filters נעולים
- [x] הגדרת Internal Filters per page (רשימה מפורשת + מיפוי לקוד)
- [x] החלטת Endpoint: `trading_accounts/summary` = **SSOT REQUIRED** 🔒 LOCKED (מעודכן ב-SSOT; אין הסרה/אלטרנטיבה)
- [x] יישור Configs בפועל: `tradingAccountsPageConfig.js`, `brokersFeesPageConfig.js`, `cashFlowsPageConfig.js` עודכנו לפי SSOT v1.2.0

---

### Team 30 (Frontend) — אחרי נעילת SSOT

**משימה:** יישור מלא לקונטרקט החדש (ללא הסרות פילטרים).

**Trading Accounts (D16):**
- [ ] לוודא ש-Global Filters = 5 הנעולים בלבד ב-Config
- [ ] לאשר/לתקן התאמה בין filter keys בקוד: Header / FiltersIntegration / DataLoader

**Brokers Fees (D18):**
- [ ] להגדיר `broker`, `commissionType` כ-internal filters ב-Config (לא להשאיר removed)
- [ ] לוודא שה-Config מצהיר: `filters.internal: ['broker', 'commissionType']`, `filters.global: ['search']`

**Cash Flows (D21):**
- [ ] ליישר בין `type`/`flowType`, `tradingAccount`/`tradingAccountId`, `dateFrom`/`dateTo` כדי למנוע drift פנימי

**Update configs (חובה):**
- [x] `tradingAccountsPageConfig.js` — filters + `dataEndpoints`/`summary.endpoint` כולל `trading_accounts/summary` (בוצע על ידי Team 10)
- [x] `brokersFeesPageConfig.js` — filters משקפים SSOT (internal: broker, commissionType) (בוצע)
- [x] `cashFlowsPageConfig.js` — filters משקפים SSOT (internal: flowType; global: tradingAccount, dateRange, search) (בוצע)
- [ ] **Team 30:** לאמת התאמת filter keys ב-Header/FiltersIntegration/DataLoader (תיקון drift ב-D21: type/flowType, tradingAccount/tradingAccountId)

**מקור:** `documentation/01-ARCHITECTURE/TT2_UAI_CONFIG_CONTRACT.md` § Filter Keys Lock (by page)

---

### Team 20 (Backend)

- [x] **Endpoint `trading_accounts/summary`:** Architect קבע שנדרש — **כבר מיושם** (Team 20).
- [ ] לאשר שאין תלויות חסרות ולתעד ב-Docs/API Guide ש-`GET /api/v1/trading_accounts/summary` הוא חלק מה-SSOT.

---

### Team 50 (QA)

- **Gate B RED = עצירה.** אין ריצות חדשות לפני יישור SSOT + Configs.
- [x] לבצע ריצה חוזרת **רק אחרי** SSOT + Configs מיושרים וחתימת Team 10 על SSOT החדש ותיקוני Team 30/20.
- [x] לאחר אישור Team 10 — להכין דוח/אישור ולהעביר ל-Team 90.  
  **דוח:** `_COMMUNICATION/team_50/TEAM_50_GATE_B_RE_RUN_REPORT.md` | **Handoff:** `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_90_GATE_B_HANDOFF.md`

---

### Team 90 (Spy)

- **Re-Verification Gate B** רק **אחרי**:
  1. חתימת Team 10 על SSOT החדש
  2. תיקוני Team 30 (Configs)
  3. תיקוני Team 20 (תיעוד אם נדרש)
  4. חתימת Team 50 על ריצה חוזרת

---

## 🚦 תנאי GREEN

| תנאי | סטטוס |
|------|--------|
| SSOT עודכן ונחתם | ✅ הושלם (v1.2.0) |
| Configs מיושרים | ✅ בוצע (Team 10) — Team 30 אימת קוד (keys) |
| Endpoint החלטה בוצעה | ✅ REQUIRED, Backend מיושם |
| Team 50 ריצה חוזרת + Handoff | ✅ הושלם |
| Team 90 Re-Verification | 🔴 **RED** — כשלי Runtime/E2E (ראה להלן) |

---

## 🔴 Team 90 Re-Verification — RED (Runtime + E2E)

**מקור:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_GATE_B_RUNTIME_E2E_STATUS.md`

**סיכום:** בוצעו `npm run test:phase2` ו-`npm run test:phase2-e2e`. Gate B נשאר **RED** — כשלי Runtime/E2E חוסמים GREEN.

**חסמים (עיקריים):**
1. **Console SEVERE Errors** — בכל D16/D18/D21; חוסם UAI + טבלאות
2. **CRUD E2E** — 0 API calls detected (שגיאות UI/Init)
3. **Routes SSOT Compliance** — נכשל (routes.json/Shared_Services לא מזוהים ע"י הטסט)
4. **Security Token Leakage Test** — נכשל (קשור ל-SEVERE)
5. **Runtime Login** — לא התקבל token; בדיקות API לא רצות

**תנאי למעבר ל-GREEN:**
- Runtime login עובד (token)
- E2E עובר ללא Console SEVERE
- CRUD tests מזהה API calls
- Routes SSOT test עובר

**פעולות נדרשות לפי צוות:** ראה `TEAM_10_GATE_B_RUNTIME_E2E_ACTIONS.md`

---

## 📌 קבצים

- **SSOT:** `documentation/01-ARCHITECTURE/TT2_UAI_CONFIG_CONTRACT.md` (v1.2.0) — § Endpoint Decision LOCKED
- **עדכון רשמי trading_accounts/summary:** `_COMMUNICATION/team_10/TEAM_10_TRADING_ACCOUNTS_SUMMARY_SSOT_REQUIRED_UPDATE.md`
- **דוח Gate B:** `_COMMUNICATION/team_90/TEAM_90_PHASE_2_GATE_B_GOVERNANCE_REPORT.md`
- **דוח Re-Verification (Runtime/E2E):** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_GATE_B_RUNTIME_E2E_STATUS.md`
- **בקשת Re-Run ל-Team 50:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_50_GATE_B_QA_RERUN_REQUEST.md`
- **משימות תיקון Runtime/E2E:** `_COMMUNICATION/team_10/TEAM_10_GATE_B_RUNTIME_E2E_ACTIONS.md`
- **מנדט Team 50 (Re-Run):** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_GATE_B_QA_RERUN_MANDATE.md`
- **מנדטים:** `_COMMUNICATION/team_10/TEAM_10_GATE_B_MANDATE_*.md` (לפי צוות)

**log_entry | [Team 10] | GATE_B | ARCHITECT_DECISION_IMPLEMENTATION | SSOT_EXPANDED | 2026-02-07**

# Evidence Log: בץ 2.5 (ADR-017/018)

**מבצע:** Team 30  
**תאריך:** 2026-02-12  
**מקור:** `_COMMUNICATION/_Architects_Decisions/BATCH_2_5_COMPLETIONS_MANDATE.md`

---

## 1. יישור גרסת UI ל־1.0.0

| קובץ | לפני | אחרי |
|------|------|------|
| package.json | 1.0.0 | 1.0.0 (קיים) |
| package-lock.json | 2.0.0 | 1.0.0 |
| phoenixFilterBridge.js | V2.0 | v1.0 |
| brokersFeesDataLoader.js | v2.0 | v1.0 |
| cashFlowsDataLoader.js | v2.1 | v1.0 |
| tradingAccountsDataLoader.js | v2.0 | v1.0 |

---

## 2. Redirect (ADR-017)

- **authGuard.js:** `window.location.href = '/'` לכל עמוד Type C/D
- **Open routes:** `/login`, `/register`, `/reset-password`
- **headerLinksUpdater.js:** Token check מעודכן ל-`access_token` + `authToken`

---

## 3. User Icon

- **phoenix-header.css:** Default = Warning (#f59e0b); Success = #10b981
- **אף מצב לא שחור**

---

## 4. ברוקר "אחר" (ADR-018)

- **tradingAccountsForm.js:** brokerOtherNameGroup + isSupported: false
- **adr015GovernanceMessage.js:** "רוצה שנוסיף תמיכה בברוקר שלך? צור קשר"

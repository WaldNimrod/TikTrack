# Team 30 — ADR-015 D16 הודעת משילות — Evidence

**מאת:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-12  
**מקור:** TEAM_10_TO_TEAM_30_ADR_015_BROKER_REFERENCE_MANDATE.md  
**תיאום:** TEAM_40_TO_TEAM_30_ADR_015_GOVERNANCE_MESSAGE_COORDINATION.md  

---

## 1. סיכום ביצוע

**משימה (שלב 3):** D16 — Conditional Rendering "אחר" + הודעת משילות בבחירת ברוקר.

**סטטוס:** ✅ **הושלם**

---

## 2. קבצים ששונו

| קובץ | שינויים |
|------|---------|
| `ui/src/views/financial/tradingAccounts/tradingAccountsForm.js` | הוספת "אחר" לרשימת ברוקרים, הודעת משילות, שדה הזנה ידנית (brokerOtherName), Conditional Rendering, ולוגיקת שמירה |
| `ui/src/views/financial/shared/adr015GovernanceMessage.js` | SSOT לטקסט הודעה ולקישור (מסמך ADR_015_GOVERNANCE_MESSAGE_SSOT) |

---

## 3. Acceptance Criteria — התאמה

| קריטריון | מימוש |
|----------|--------|
| הודעה מוצגת רק כאשר `broker.value === 'other'` | ✅ `initBrokerOtherHandlers()` — `toggleOtherUI` |
| הודעה מוסתרת כאשר נבחר ברוקר אחר | ✅ |
| הודעה מוצגת נכון במצב עריכה (אם broker === 'other') | ✅ `toggleOtherUI()` נקרא בתחילת האתחול |
| הקישור מ-SSOT | ✅ `getGovernanceMessageData()` — `mailto:support@tiktrack.app` |
| שימוש ב-Classes מ-Team 40 | ✅ `governance-message`, `governance-message--warning`, `governance-message__text`, `governance-message__link` |
| "אחר" — הזנה ידנית ושמירה | ✅ brokerOtherName נדרש, נשלח כשם ברוקר במקום "other" |
| ולידציה | ✅ שדה חובה כשנבחר "אחר" |

---

## 4. רפרנסים

- **מנדט:** TEAM_10_TO_TEAM_30_ADR_015_BROKER_REFERENCE_MANDATE.md  
- **תוכנית עבודה:** TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md §3  
- **תיאום Team 40:** TEAM_40_TO_TEAM_30_ADR_015_GOVERNANCE_MESSAGE_COORDINATION.md  
- **SSOT הודעה:** documentation/06-ENGINEERING/ADR_015_GOVERNANCE_MESSAGE_SSOT.md  

---

## 5. צעדים הבאים

- **D18:** ממתין ל-Team 20 — חוזה API + מודל עמלות לפי חשבון (trading_account_id).
- **התראה ל-Team 10:** דוח זה מעדכן את הסטטוס — דרוש עדכון Index.

---

**Team 30 (Frontend Execution)**  
**log_entry | ADR_015 | D16_GOVERNANCE_MESSAGE_COMPLETE | 2026-02-12**

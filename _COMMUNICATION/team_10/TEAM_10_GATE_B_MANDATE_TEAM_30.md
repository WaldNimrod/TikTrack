# Gate B — מנדט ל-Team 30 (Frontend)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend)  
**תאריך:** 2026-02-07  
**נושא:** יישור מלא ל-SSOT החדש (אין הסרת פילטרים)  
**סטטוס:** 🔴 **חובה**

---

## קריאת חובה

1. `documentation/01-ARCHITECTURE/TT2_UAI_CONFIG_CONTRACT.md` — סעיפים **Filter Keys Lock (by page)** ו-**Endpoint Decision**
2. `_COMMUNICATION/team_10/TEAM_10_GATE_B_ARCHITECT_DECISION_IMPLEMENTATION.md`

---

## משימות (אחרי נעילת SSOT)

**הערה:** Team 10 כבר עדכן את שלושת ה-Configs לפי SSOT v1.2.0. התפקיד שלכם: **אימות ויישור קוד** (filter keys ב-Header / FiltersIntegration / DataLoader).

### Trading Accounts (D16)
- [x] Config עודכן (Team 10): Global = 5, summary endpoint = `trading_accounts/summary`
- [ ] לאשר/לתקן התאמה בין filter keys בקוד: Header / FiltersIntegration / DataLoader (status, tradingAccountId, dateFrom, dateTo, search)

### Brokers Fees (D18)
- [x] Config עודכן (Team 10): internal = broker, commissionType; global = search
- [ ] לוודא שהקוד (HeaderHandlers, DataLoader) משתמש במפתחות האלה consistently

### Cash Flows (D21)
- [x] Config עודכן (Team 10): internal = flowType; global = tradingAccount, dateRange, search
- [ ] **ליישר בין** `type`/`flowType`, `tradingAccount`/`tradingAccountId`, `dateFrom`/`dateTo` — למנוע drift פנימי (TableInit/DataLoader)

---

## תוצר נדרש

דוח השלמה ל-Team 10: Configs מיושרים + אימות filter keys מול קוד (Header/FiltersIntegration/DataLoader).

**Gate B נשאר RED עד השלמת יישור Configs ואישור Team 90.**

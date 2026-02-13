# 📋 הודעה: צעדים הבאים - Backend API (D16_ACCTS_VIEW)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend Implementation)  
**תאריך:** 2026-02-03  
**סטטוס:** 🟢 **PHASES 1-4 COMPLETE - NEXT STEPS**  
**עדיפות:** 🔴 **CRITICAL**

---

## ✅ מה הושלם (Phases 1-4)

**מצוין!** Phases 1-4 הושלמו בהצלחה:
- ✅ **Phase 1:** Models (trading_accounts, cash_flows, trades, positions)
- ✅ **Phase 2:** Schemas (Response schemas עם כל השדות)
- ✅ **Phase 3:** Services (Business logic + calculations)
- ✅ **Phase 4:** Routers (API endpoints + registration in main.py)

**דוח:** `TEAM_20_TO_TEAM_10_D16_ACCTS_VIEW_PHASES_1_4_COMPLETE.md`

---

## ⏳ מה הבא - צעדים דחופים

### **1. Phase 5: עדכון OpenAPI Spec** 🔴 **CRITICAL**

**תאריך יעד:** 2026-02-06  
**סטטוס:** ⏳ **PENDING**

#### **משימה:**
עדכון `documentation/07-CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml` עם:

1. **`/api/v1/trading_accounts`** - Full schema:
   ```yaml
   /trading_accounts:
     get:
       summary: "List all trading accounts"
       parameters:
         - name: status
           in: query
           schema:
             type: boolean
         - name: search
           in: query
           schema:
             type: string
       responses:
         '200':
           content:
             application/json:
               schema:
                 $ref: '#/components/schemas/TradingAccountListResponse'
   ```

2. **`/api/v1/cash_flows`** - Full schema:
   ```yaml
   /cash_flows:
     get:
       summary: "List all cash flows"
       parameters:
         - name: trading_account_id
           in: query
           schema:
             type: string
         - name: date_from
           in: query
           schema:
             type: string
             format: date
         - name: date_to
           in: query
           schema:
             type: string
             format: date
         - name: flow_type
           in: query
           schema:
             type: string
             enum: [DEPOSIT, WITHDRAWAL, DIVIDEND, INTEREST, FEE, OTHER]
       responses:
         '200':
           content:
             application/json:
               schema:
                 $ref: '#/components/schemas/CashFlowListResponse'
   ```

3. **`/api/v1/positions`** - Full schema:
   ```yaml
   /positions:
     get:
       summary: "List all positions"
       parameters:
         - name: trading_account_id
           in: query
           schema:
             type: string
       responses:
         '200':
           content:
             application/json:
               schema:
                 $ref: '#/components/schemas/PositionListResponse'
   ```

4. **Response Schemas** - הוספת schemas מלאים:
   - `TradingAccountResponse`
   - `TradingAccountListResponse`
   - `CashFlowResponse`
   - `CashFlowSummaryResponse`
   - `CashFlowListResponse`
   - `PositionResponse`
   - `PositionListResponse`

---

### **2. תיקון Positions Service - Market Data Integration** ⚠️ **HIGH PRIORITY**

**סטטוס:** ⚠️ **BLOCKING**  
**השפעה:** Positions endpoint יחזיר נתונים לא מלאים עד לתיקון

#### **בעיה:**
Positions service צריך JOIN עם `market_data.tickers` ו-`market_data.ticker_prices` עבור:
- `symbol` - מ-`market_data.tickers.symbol`
- `current_price` - המחיר האחרון מ-`market_data.ticker_prices`
- `daily_change` - חישוב מ-`current_price - previous_close`
- `daily_change_percent` - חישוב אחוז

#### **צעדים נדרשים:**

1. **יצירת Models (או שימוש ב-Raw SQL):**
   - `api/models/tickers.py` - Ticker model
   - `api/models/ticker_prices.py` - TickerPrice model

2. **עדכון Positions Service:**
   - JOIN עם `market_data.tickers` לקבלת `symbol`
   - JOIN עם `market_data.ticker_prices` לקבלת `current_price` (המחיר האחרון)
   - חישוב `daily_change` = `current_price - previous_close`
   - חישוב `daily_change_percent` = `(daily_change / previous_close) * 100`

3. **עדכון Schema:**
   - וידוא ש-`PositionResponse` כולל את כל השדות הנדרשים

---

### **3. תיקון Account Value Calculation** ⚠️ **MEDIUM PRIORITY**

**סטטוס:** ⚠️ **BLOCKING**  
**השפעה:** `percent_of_account` יהיה 0 עד לתיקון

#### **בעיה:**
Positions service צריך `account_value` לחישוב `percent_of_account`.

#### **צעדים נדרשים:**

1. **עדכון Positions Service:**
   - JOIN עם `trading_accounts` לקבלת `account_value`
   - חישוב `percent_of_account` = `(market_value / account_value) * 100`

2. **עדכון Schema:**
   - וידוא ש-`PositionResponse` כולל `percent_of_account`

---

## 📋 Checklist סופי

### **Phase 5: OpenAPI Spec**
- [ ] הוספת `/api/v1/trading_accounts` עם full schema
- [ ] הוספת `/api/v1/cash_flows` עם full schema
- [ ] הוספת `/api/v1/positions` עם full schema
- [ ] הוספת כל ה-Response schemas

### **תיקון Positions Service**
- [ ] יצירת Ticker model (או שימוש ב-Raw SQL)
- [ ] יצירת TickerPrice model (או שימוש ב-Raw SQL)
- [ ] עדכון Positions Service - JOIN עם tickers
- [ ] עדכון Positions Service - JOIN עם ticker_prices
- [ ] חישוב daily_change ו-daily_change_percent
- [ ] עדכון Positions Service - JOIN עם trading_accounts
- [ ] חישוב percent_of_account

---

## 📅 לוח זמנים

| משימה | תאריך יעד | עדיפות |
|:---|:---|:---|
| Phase 5: OpenAPI Spec | 2026-02-06 | 🔴 CRITICAL |
| תיקון Market Data Integration | 2026-02-06 | ⚠️ HIGH |
| תיקון Account Value Calculation | 2026-02-07 | ⚠️ MEDIUM |

---

## 📞 קישורים רלוונטיים

- **דוח התקדמות:** `TEAM_20_TO_TEAM_10_D16_ACCTS_VIEW_PHASES_1_4_COMPLETE.md`
- **DB Schema:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
- **OpenAPI Spec:** `documentation/07-CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml`

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-03  
**סטטוס:** 🟢 **PHASES 1-4 COMPLETE - NEXT STEPS DEFINED**

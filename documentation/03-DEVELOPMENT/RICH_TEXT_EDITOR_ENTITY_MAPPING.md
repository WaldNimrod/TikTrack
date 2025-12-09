# מיפוי ישויות עם שדות תוכן - Rich Text Editor

## Entity Mapping for Rich Text Fields

**תאריך:** 6 בנובמבר 2025  
**מטרה:** מיפוי כל הישויות במערכת שיש להן שדות תוכן/הערות/פרטים

---

## 📊 טבלת מיפוי מלאה

| ישות | שדה בקונפיג | שדה במודל | שם DB | גודל נוכחי | גודל מוצע | סטטוס |
|------|-------------|-----------|-------|------------|-----------|-------|
| **Note** | `noteContent` | `content` | `content` | String(1000) | String(10000) | ✅ מוכן |
| **Trade** | `tradeNotes` | `notes` | `notes` | String(500) | String(5000) | 🔄 לעדכן |
| **TradePlan** | `tradePlanNotes` | ❌ אין | `reasons` | String(500) | String(5000) | ⚠️ צריך לבדוק |
| **Execution** | `executionNotes` | `notes` | `notes` | String(500) | String(5000) | 🔄 לעדכן |
| **Alert** | `alertNotes` | `message` | `message` | String(500) | String(5000) | 🔄 לעדכן |
| **CashFlow** | `cashFlowDescription` | `description` | `description` | String(500) | String(5000) | 🔄 לעדכן |
| **TradingAccount** | `accountNotes` | `notes` | `notes` | String(500) | String(5000) | 🔄 לעדכן |

---

## 🔍 פרטים נוספים

### 1. Note (הערות)

- **שדה:** `content`
- **סוג:** String(1000) → String(10000)
- **קונפיג:** `notes-config.js` - `noteContent` (textarea)
- **סטטוס:** ✅ מוכן - זה העבודה הראשונית

### 2. Trade (טריידים)

- **שדה:** `notes`
- **סוג:** String(500) → String(5000)
- **קונפיג:** `trades-config.js` - `tradeNotes` (textarea)
- **סטטוס:** 🔄 צריך לעדכן

### 3. TradePlan (תוכניות מסחר)

- **שדה:** `reasons` (או `entry_conditions`?)
- **בעיה:** בקונפיג יש `tradePlanNotes` אבל במודל אין שדה `notes`
- **קונפיג:** `trade-plans-config.js` - `tradePlanNotes` (textarea)
- **מודל:** `reasons` (String(500)) או `entry_conditions` (String(500))
- **סטטוס:** ⚠️ צריך לבדוק - איזה שדה בדיוק?

### 4. Execution (ביצועים)

- **שדה:** `notes`
- **סוג:** String(500) → String(5000)
- **קונפיג:** `executions-config.js` - `executionNotes` (textarea)
- **סטטוס:** 🔄 צריך לעדכן

### 5. Alert (התראות)

- **שדה:** `message`
- **סוג:** String(500) → String(5000)
- **קונפיג:** `alerts-config.js` - `alertNotes` (textarea)
- **מודל:** `message` (String(500))
- **סטטוס:** 🔄 צריך לעדכן

### 6. CashFlow (תזרימי מזומנים)

- **שדה:** `description`
- **סוג:** String(500) → String(5000)
- **קונפיג:** `cash-flows-config.js` - `cashFlowDescription` (textarea)
- **סטטוס:** 🔄 צריך לעדכן

### 7. TradingAccount (חשבונות מסחר)

- **שדה:** `notes`
- **סוג:** String(500) → String(5000)
- **קונפיג:** `trading-accounts-config.js` - `accountNotes` (textarea)
- **סטטוס:** 🔄 צריך לעדכן

---

## ⚠️ בעיות שצריך לפתור

### 1. TradePlan - חוסר התאמה

**בעיה:** בקונפיג יש `tradePlanNotes` אבל במודל אין שדה `notes`
**אפשרויות:**

- א) `reasons` - הסיבות לתוכנית
- ב) `entry_conditions` - תנאי כניסה (יותר טכני)
- ג) להוסיף שדה `notes` חדש למודל

**המלצה:** לבדוק עם המשתמש איזה שדה הוא רוצה.

### 2. Alert - חוסר התאמה

**בעיה:** בקונפיג יש `alertNotes` אבל במודל יש `message`
**פתרון:** למפות `alertNotes` ל-`message` (או להוסיף שדה `notes` נפרד)

---

## 📋 רשימת קבצים לעדכון

### Backend Models

1. `Backend/models/note.py` - `content`: String(1000) → String(10000)
2. `Backend/models/trade.py` - `notes`: String(500) → String(5000)
3. `Backend/models/execution.py` - `notes`: String(500) → String(5000)
4. `Backend/models/alert.py` - `message`: String(500) → String(5000)
5. `Backend/models/cash_flow.py` - `description`: String(500) → String(5000)
6. `Backend/models/trading_account.py` - `notes`: String(500) → String(5000)
7. `Backend/models/trade_plan.py` - `reasons`: String(500) → String(5000) (או להוסיף `notes`)

### Frontend Configs

1. `trading-ui/scripts/modal-configs/notes-config.js` - `noteContent`: textarea → rich-text
2. `trading-ui/scripts/modal-configs/trades-config.js` - `tradeNotes`: textarea → rich-text
3. `trading-ui/scripts/modal-configs/executions-config.js` - `executionNotes`: textarea → rich-text
4. `trading-ui/scripts/modal-configs/alerts-config.js` - `alertNotes`: textarea → rich-text
5. `trading-ui/scripts/modal-configs/cash-flows-config.js` - `cashFlowDescription`: textarea → rich-text
6. `trading-ui/scripts/modal-configs/trading-accounts-config.js` - `accountNotes`: textarea → rich-text
7. `trading-ui/scripts/modal-configs/trade-plans-config.js` - `tradePlanNotes`: textarea → rich-text

### Frontend Scripts

1. `trading-ui/scripts/notes.js` - עדכון תצוגה
2. `trading-ui/scripts/trades.js` - עדכון תצוגה
3. `trading-ui/scripts/executions.js` - עדכון תצוגה
4. `trading-ui/scripts/alerts.js` - עדכון תצוגה
5. `trading-ui/scripts/cash_flows.js` - עדכון תצוגה
6. `trading-ui/scripts/trading-accounts.js` - עדכון תצוגה
7. `trading-ui/scripts/trade-plans.js` - עדכון תצוגה

### Backend Routes

1. `Backend/routes/api/notes.py` - sanitization
2. `Backend/routes/api/trades.py` - sanitization
3. `Backend/routes/api/executions.py` - sanitization
4. `Backend/routes/api/alerts.py` - sanitization
5. `Backend/routes/api/cash_flows.py` - sanitization
6. `Backend/routes/api/trading_accounts.py` - sanitization
7. `Backend/routes/api/trade_plans.py` - sanitization

---

**עדכון אחרון:** 6 בנובמבר 2025



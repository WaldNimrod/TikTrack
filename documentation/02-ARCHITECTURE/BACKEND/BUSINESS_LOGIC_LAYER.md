# Business Logic Layer - Architecture Documentation
# שכבת לוגיקה עסקית - תיעוד ארכיטקטורה

**תאריך יצירה:** 22 נובמבר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ תיעוד מלא  
**מטרה:** תיעוד מקיף של ארכיטקטורת Business Logic Layer במערכת TikTrack

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [ארכיטקטורה](#ארכיטקטורה)
3. [Business Services](#business-services)
4. [API Endpoints](#api-endpoints)
5. [Frontend Wrappers](#frontend-wrappers)
6. [אינטגרציה עם מערכות טעינה ואיתחול](#אינטגרציה-עם-מערכות-טעינה-ואיתחול)
7. [אינטגרציה עם מערכות מטמון](#אינטגרציה-עם-מערכות-מטמון)
8. [דיאגרמות](#דיאגרמות)

---

## 🎯 סקירה כללית

Business Logic Layer הוא שכבת הלוגיקה העסקית המרכזית במערכת TikTrack. השכבה אחראית על:

- **ולידציה של נתונים עסקיים** - בדיקת תקינות נתונים לפי חוקי עסק
- **חישובים עסקיים** - ביצוע חישובים מורכבים (מחירים, אחוזים, P/L, וכו')
- **אכיפת חוקי עסק** - יישום חוקי עסק מרכזיים דרך Business Rules Registry
- **אחידות** - הבטחת אחידות בלוגיקה העסקית בין Frontend ל-Backend

### עקרונות מרכזיים:

1. **הפרדת אחריות** - כל הלוגיקה העסקית ב-Backend, Frontend מכיל רק UI logic
2. **מרכזיות** - כל החישובים והולידציות במקום אחד
3. **שימוש חוזר** - Services משותפים לכל הישויות
4. **תחזוקה קלה** - שינוי חוק עסקי במקום אחד משפיע על כל המערכת

---

## 🏗️ ארכיטקטורה

### מבנה כללי:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (UI Layer)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Data Services (*-data.js)                     │   │
│  │  - Wrappers ל-Business Logic API                      │   │
│  │  - Cache Integration (UnifiedCacheManager)           │   │
│  │  - Error Handling                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP API Calls
                            │ /api/business/*
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Business Logic Layer)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         API Routes (business_logic.py)                │   │
│  │  - 29+ Endpoints                                      │   │
│  │  - Performance Monitoring                            │   │
│  │  - Batch Operations                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Business Services (12 Services)              │   │
│  │  - TradeBusinessService                              │   │
│  │  - ExecutionBusinessService                          │   │
│  │  - AlertBusinessService                              │   │
│  │  - StatisticsBusinessService                         │   │
│  │  - CashFlowBusinessService                           │   │
│  │  - NoteBusinessService                               │   │
│  │  - TradingAccountBusinessService                     │   │
│  │  - TradePlanBusinessService                          │   │
│  │  - TickerBusinessService                             │   │
│  │  - CurrencyBusinessService                           │   │
│  │  - TagBusinessService                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         BaseBusinessService                          │   │
│  │  - validate() (abstract)                            │   │
│  │  - calculate() (abstract)                           │   │
│  │  - apply_rules()                                     │   │
│  │  - log_business_event()                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         BusinessRulesRegistry                        │   │
│  │  - Central registry לכל חוקי העסק                   │   │
│  │  - Validation rules                                 │   │
│  │  - Business rules                                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### רכיבים מרכזיים:

#### 1. BaseBusinessService
**מיקום:** `Backend/services/business_logic/base_business_service.py`

Base class לכל ה-Business Services. מספק:
- `validate(data)` - ולידציה של נתונים (abstract method)
- `calculate(data)` - חישובים עסקיים (abstract method)
- `apply_rules(data, rule_type)` - יישום חוקי עסק
- `log_business_event(event_type, data, level)` - לוגים עסקיים

#### 2. BusinessRulesRegistry
**מיקום:** `Backend/services/business_logic/business_rules_registry.py`

Registry מרכזי לכל חוקי העסק. מכיל:
- חוקי ולידציה לכל ישות
- טווחי ערכים מותרים
- חוקי עסק מורכבים

**ראה:** `documentation/02-ARCHITECTURE/BACKEND/BUSINESS_RULES_REGISTRY.md` לפרטים מלאים

#### 3. Entity Services
כל ישות במערכת יש לה Business Service משלה:
- יורש מ-BaseBusinessService
- מממש validate() ו-calculate()
- משתמש ב-BusinessRulesRegistry

---

## 🏢 Business Services

### רשימת כל ה-12 Business Services:

| Service | קובץ | ישות | API Endpoints | Frontend Wrappers | סטטוס |
| --- | --- | --- | --- | --- | --- |
| **TradeBusinessService** | `trade_business_service.py` | Trade | 7 endpoints | ✅ 6 wrappers | ✅ מוכן |
| **ExecutionBusinessService** | `execution_business_service.py` | Execution | 3 endpoints | ✅ 3 wrappers | ✅ מוכן |
| **AlertBusinessService** | `alert_business_service.py` | Alert | 2 endpoints | ✅ 2 wrappers | ✅ מוכן |
| **StatisticsBusinessService** | `statistics_business_service.py` | Statistics | 4 endpoints | ✅ 4 wrappers | ✅ מוכן |
| **CashFlowBusinessService** | `cash_flow_business_service.py` | CashFlow | 3 endpoints | ✅ 2 wrappers | ✅ מוכן |
| **NoteBusinessService** | `note_business_service.py` | Note | 2 endpoints | ✅ 2 wrappers | ✅ מוכן |
| **TradingAccountBusinessService** | `trading_account_business_service.py` | TradingAccount | 1 endpoint | ✅ 1 wrapper | ✅ מוכן |
| **TradePlanBusinessService** | `trade_plan_business_service.py` | TradePlan | 1 endpoint | ✅ 1 wrapper | ✅ מוכן |
| **TickerBusinessService** | `ticker_business_service.py` | Ticker | 2 endpoints | ✅ 2 wrappers | ✅ מוכן |
| **CurrencyBusinessService** | `currency_business_service.py` | Currency | 1 endpoint | ✅ 1 wrapper | ✅ מוכן |
| **TagBusinessService** | `tag_business_service.py` | Tag | 2 endpoints | ✅ 2 wrappers | ✅ מוכן |
| **PreferencesBusinessService** | ✅ `preferences_business_service.py` | Preferences | ✅ 3 endpoints | ✅ 3 wrappers | ✅ מוכן (שלב ראשון) |

**סה"כ:** 12 Services (12 קיימים - כולל PreferencesBusinessService בשלב ראשון)

### פירוט Services:

#### TradeBusinessService
**תפקיד:** חישובים וולידציות עבור טריידים

**פונקציות עיקריות:**
- `calculate_stop_price(current_price, stop_percentage, side)` - חישוב מחיר stop
- `calculate_target_price(current_price, target_percentage, side)` - חישוב מחיר target
- `calculate_percentage_from_price(current_price, target_price, side)` - חישוב אחוז
- `calculate_investment(price, quantity, amount)` - חישוב השקעה (דו-כיווני)
- `calculate_pl(entry_price, exit_price, quantity, side)` - חישוב P/L
- `calculate_risk_reward(entry_price, stop_price, target_price, quantity, side)` - חישוב Risk/Reward
- `validate(data)` - ולידציה של trade

**API Endpoints:**
- `POST /api/business/trade/calculate-stop-price`
- `POST /api/business/trade/calculate-target-price`
- `POST /api/business/trade/calculate-percentage-from-price`
- `POST /api/business/trade/calculate-investment`
- `POST /api/business/trade/calculate-pl`
- `POST /api/business/trade/calculate-risk-reward`
- `POST /api/business/trade/validate`

#### ExecutionBusinessService
**תפקיד:** חישובים וולידציות עבור ביצועים

**פונקציות עיקריות:**
- `calculate_execution_values(quantity, price, commission, action, is_edit)` - חישוב ערכי ביצוע
- `calculate_average_price(executions)` - חישוב מחיר ממוצע
- `validate(data)` - ולידציה של execution

**API Endpoints:**
- `POST /api/business/execution/calculate-values`
- `POST /api/business/execution/calculate-average-price`
- `POST /api/business/execution/validate`

#### AlertBusinessService
**תפקיד:** ולידציות עבור התראות

**פונקציות עיקריות:**
- `validate(data)` - ולידציה של alert
- `validate_condition_value(condition_attribute, condition_number)` - ולידציה של ערך תנאי

**API Endpoints:**
- `POST /api/business/alert/validate`
- `POST /api/business/alert/validate-condition-value`

#### StatisticsBusinessService
**תפקיד:** חישובים סטטיסטיים ו-KPI

**פונקציות עיקריות:**
- `calculate_kpi(calculation_type, records, params)` - חישוב KPI
- `calculate_sum(records, field)` - חישוב סכום
- `calculate_average(records, field)` - חישוב ממוצע
- `count_records(records)` - ספירת רשומות

**API Endpoints:**
- `POST /api/business/statistics/calculate`
- `POST /api/business/statistics/calculate-sum`
- `POST /api/business/statistics/calculate-average`
- `POST /api/business/statistics/count-records`

#### CashFlowBusinessService
**תפקיד:** חישובים וולידציות עבור תזרימי מזומנים

**פונקציות עיקריות:**
- `calculate_account_balance(initial_balance, cash_flows)` - חישוב יתרה
- `calculate_currency_conversion(amount, from_currency_rate, to_currency_rate)` - המרת מטבע
- `validate(data)` - ולידציה של cash flow

**API Endpoints:**
- `POST /api/business/cash-flow/calculate-balance`
- `POST /api/business/cash-flow/calculate-currency-conversion`
- `POST /api/business/cash-flow/validate`

#### NoteBusinessService
**תפקיד:** ולידציות עבור הערות

**פונקציות עיקריות:**
- `validate(data)` - ולידציה של note
- `validate_relation(related_type_id, related_id)` - ולידציה של קשר

**API Endpoints:**
- `POST /api/business/note/validate`
- `POST /api/business/note/validate-relation`

#### TradingAccountBusinessService
**תפקיד:** ולידציות עבור חשבונות מסחר

**פונקציות עיקריות:**
- `validate(data)` - ולידציה של trading account

**API Endpoints:**
- `POST /api/business/trading-account/validate`

#### TradePlanBusinessService
**תפקיד:** ולידציות עבור תוכניות מסחר

**פונקציות עיקריות:**
- `validate(data)` - ולידציה של trade plan

**API Endpoints:**
- `POST /api/business/trade-plan/validate`

#### TickerBusinessService
**תפקיד:** ולידציות עבור טיקרים

**פונקציות עיקריות:**
- `validate(data)` - ולידציה של ticker
- `validate_symbol(symbol)` - ולידציה של סמל

**API Endpoints:**
- `POST /api/business/ticker/validate`
- `POST /api/business/ticker/validate-symbol`

#### CurrencyBusinessService
**תפקיד:** ולידציות עבור מטבעות

**פונקציות עיקריות:**
- `validate_exchange_rate(rate)` - ולידציה של שער חליפין

**API Endpoints:**
- `POST /api/business/currency/validate-rate`

#### TagBusinessService
**תפקיד:** ולידציות עבור תגיות

**פונקציות עיקריות:**
- `validate(data)` - ולידציה של tag
- `validate_category(category)` - ולידציה של קטגוריה

**API Endpoints:**
- `POST /api/business/tag/validate`
- `POST /api/business/tag/validate-category`

---

## 🌐 API Endpoints

### סקירה כללית:

**Base URL:** `/api/business`

**סה"כ Endpoints:** 32 endpoints + 1 batch endpoint

### רשימת כל ה-Endpoints:

#### Trade Endpoints (7)
- `POST /api/business/trade/calculate-stop-price` - חישוב מחיר stop
- `POST /api/business/trade/calculate-target-price` - חישוב מחיר target
- `POST /api/business/trade/calculate-percentage-from-price` - חישוב אחוז
- `POST /api/business/trade/calculate-investment` - חישוב השקעה
- `POST /api/business/trade/calculate-pl` - חישוב P/L
- `POST /api/business/trade/calculate-risk-reward` - חישוב Risk/Reward
- `POST /api/business/trade/validate` - ולידציה של trade

#### Execution Endpoints (3)
- `POST /api/business/execution/calculate-values` - חישוב ערכי ביצוע
- `POST /api/business/execution/calculate-average-price` - חישוב מחיר ממוצע
- `POST /api/business/execution/validate` - ולידציה של execution

#### Alert Endpoints (2)
- `POST /api/business/alert/validate` - ולידציה של alert
- `POST /api/business/alert/validate-condition-value` - ולידציה של ערך תנאי

#### Statistics Endpoints (4)
- `POST /api/business/statistics/calculate` - חישוב סטטיסטיקות
- `POST /api/business/statistics/calculate-sum` - חישוב סכום
- `POST /api/business/statistics/calculate-average` - חישוב ממוצע
- `POST /api/business/statistics/count-records` - ספירת רשומות

#### Cash Flow Endpoints (3)
- `POST /api/business/cash-flow/calculate-balance` - חישוב יתרה
- `POST /api/business/cash-flow/calculate-currency-conversion` - המרת מטבע
- `POST /api/business/cash-flow/validate` - ולידציה של cash flow

#### Note Endpoints (2)
- `POST /api/business/note/validate` - ולידציה של note
- `POST /api/business/note/validate-relation` - ולידציה של קשר

#### Trading Account Endpoints (1)
- `POST /api/business/trading-account/validate` - ולידציה של trading account

#### Trade Plan Endpoints (1)
- `POST /api/business/trade-plan/validate` - ולידציה של trade plan

#### Ticker Endpoints (2)
- `POST /api/business/ticker/validate` - ולידציה של ticker
- `POST /api/business/ticker/validate-symbol` - ולידציה של סמל

#### Currency Endpoints (1)
- `POST /api/business/currency/validate-rate` - ולידציה של שער חליפין

#### Tag Endpoints (2)
- `POST /api/business/tag/validate` - ולידציה של tag
- `POST /api/business/tag/validate-category` - ולידציה של קטגוריה

#### Preferences Endpoints (3)
- `POST /api/business/preferences/validate` - ולידציה של preference
- `POST /api/business/preferences/validate-profile` - ולידציה של profile
- `POST /api/business/preferences/validate-dependencies` - ולידציה של תלויות

#### Batch Operations (1)
- `POST /api/business/batch` - ביצוע מספר פעולות בבת אחת

### Performance Monitoring

כל ה-Endpoints משתמשים ב-`@monitor_performance` decorator למעקב אחר ביצועים:
- לוגים של שאילתות איטיות (>200ms)
- מדידת זמן תגובה
- מעקב אחר שגיאות

---

## 🔌 Frontend Wrappers

### סקירה כללית:

כל Data Service מכיל wrappers ל-Business Logic API. ה-wrappers מספקים:
- **Cache Integration** - שימוש ב-UnifiedCacheManager ו-CacheTTLGuard
- **Error Handling** - טיפול אחיד בשגיאות
- **Fallback** - גיבוי אם Cache System לא זמין
- **Type Safety** - המרות טיפוסים אוטומטיות

### רשימת כל ה-Wrappers:

#### Trade Wrappers (6)
**מיקום:** `trading-ui/scripts/services/trades-data.js`

- `calculateStopPrice(currentPrice, stopPercentage, side)` - חישוב מחיר stop
- `calculateTargetPrice(currentPrice, targetPercentage, side)` - חישוב מחיר target
- `calculatePercentageFromPrice(currentPrice, targetPrice, side)` - חישוב אחוז
- `calculateInvestment(params)` - חישוב השקעה
- `calculatePL(params)` - חישוב P/L
- `validateTrade(tradeData)` - ולידציה של trade

**Cache:** TTL 30 שניות (חישובים), 60 שניות (ולידציות)

#### Execution Wrappers (3)
**מיקום:** `trading-ui/scripts/services/executions-data.js`

- `calculateExecutionValues(params)` - חישוב ערכי ביצוע
- `calculateAveragePrice(executions)` - חישוב מחיר ממוצע
- `validateExecution(executionData)` - ולידציה של execution

**Cache:** TTL 30 שניות (חישובים), 60 שניות (ולידציות)

#### Alert Wrappers (2)
**מיקום:** `trading-ui/scripts/services/alerts-data.js`

- `validateAlert(alertData)` - ולידציה של alert
- `validateConditionValue(conditionAttribute, conditionNumber)` - ולידציה של ערך תנאי

**Cache:** TTL 60 שניות

#### Statistics Wrappers (4)
**מיקום:** `trading-ui/scripts/services/statistics-data.js` (אם קיים)

- `calculateStatistics(calculationType, records, params)` - חישוב סטטיסטיקות
- `calculateSum(records, field)` - חישוב סכום
- `calculateAverage(records, field)` - חישוב ממוצע
- `countRecords(records)` - ספירת רשומות

**Cache:** TTL 30 שניות

#### Cash Flow Wrappers (2)
**מיקום:** `trading-ui/scripts/services/cash-flows-data.js`

- `calculateCashFlowBalance(accountId, params)` - חישוב יתרה
- `validateCashFlow(cashFlowData)` - ולידציה של cash flow

**Cache:** TTL 30 שניות (חישובים), 60 שניות (ולידציות)

#### Note Wrappers (2)
**מיקום:** `trading-ui/scripts/services/notes-data.js`

- `validateNote(noteData)` - ולידציה של note
- `validateNoteRelation(relatedTypeId, relatedId)` - ולידציה של קשר

**Cache:** TTL 60 שניות

#### Trading Account Wrappers (1)
**מיקום:** `trading-ui/scripts/services/trading-accounts-data.js`

- `validateTradingAccount(accountData)` - ולידציה של trading account

**Cache:** TTL 60 שניות

#### Trade Plan Wrappers (1)
**מיקום:** `trading-ui/scripts/services/trade-plans-data.js`

- `validateTradePlan(planData)` - ולידציה של trade plan

**Cache:** TTL 60 שניות

#### Ticker Wrappers (2)
**מיקום:** `trading-ui/scripts/services/tickers-data.js`

- `validateTicker(tickerData)` - ולידציה של ticker
- `validateTickerSymbol(symbol)` - ולידציה של סמל

**Cache:** TTL 60 שניות

#### Currency Wrappers (1)
**מיקום:** `trading-ui/scripts/services/currencies-data.js` (או קובץ אחר)

**Wrappers:**
- `validateCurrencyRate(rate)` - ולידציה של שער חליפין

**Cache:** TTL 60 שניות

#### Tag Wrappers (2)
**מיקום:** `trading-ui/scripts/services/tag-service.js`

**Wrappers:**
- `validateTagViaAPI(tagData)` - ולידציה של tag דרך API
- `validateTagCategoryViaAPI(category)` - ולידציה של קטגוריה דרך API

**Cache:** TTL 60 שניות

#### Preferences Wrappers (3)
**מיקום:** `trading-ui/scripts/services/preferences-data.js`

**Wrappers:**
- `validatePreference(preferenceName, value, dataType)` - ולידציה של preference
- `validateProfile(profileData)` - ולידציה של profile
- `validateDependencies(preferences)` - ולידציה של תלויות

**Cache:** TTL 60 שניות

**סה"כ Wrappers:** 32 wrappers (32 קיימים)

### דוגמת שימוש:

```javascript
// Example: Using Trade Wrapper
const stopPrice = await window.TradesData.calculateStopPrice(
  100,  // currentPrice
  5,    // stopPercentage
  'Long' // side
);

// Example: Using Validation Wrapper
const validationResult = await window.TradesData.validateTrade({
  price: 100,
  quantity: 10,
  side: 'buy',
  investment_type: 'Swing',
  status: 'open'
});

if (!validationResult.is_valid) {
  console.error('Validation errors:', validationResult.errors);
}
```

---

## 🔄 אינטגרציה עם מערכות טעינה ואיתחול

### 5 שלבי איתחול:

Business Logic Layer משולב ב-5 שלבי האיתחול של UnifiedAppInitializer:

#### Stage 1: Core Systems
**תפקיד:** טעינת מערכות ליבה

**Business Logic Integration:**
- Cache System (UnifiedCacheManager, CacheTTLGuard, CacheSyncManager) נטען כאן
- Cache System נדרש לכל ה-Business Logic API calls

**קובץ:** `trading-ui/scripts/modules/core-systems.js`

#### Stage 2: UI Systems
**תפקיד:** טעינת מערכות UI

**Business Logic Integration:**
- ✅ לא נדרש - Business Logic לא תלוי ב-UI Systems

#### Stage 3: Page Systems
**תפקיד:** טעינת מערכות עמוד ספציפיות

**Business Logic Integration:**
- Data Services נטענים כאן (כולל Business Logic API wrappers)
- Custom Initializers רצים כאן - יכולים להשתמש ב-Business Logic API
- **חשוב:** יש לוודא ש-Data Services זמינים לפני שימוש ב-Business Logic API

**דוגמה:**
```javascript
// Custom Initializer example
async function initializeTradesPage(pageConfig) {
  // Wait for Data Services to be available
  if (!window.TradesData) {
    await new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (window.TradesData) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }
  
  // Now we can use Business Logic API
  const validationResult = await window.TradesData.validateTrade({...});
}
```

#### Stage 4: Validation Systems
**תפקיד:** ולידציות

**Business Logic Integration:**
- Business Logic API משמש לולידציות מורכבות
- Form validations יכולים להשתמש ב-Business Logic API

#### Stage 5: Finalization
**תפקיד:** סיום איתחול

**Business Logic Integration:**
- Business Logic API משמש לחישובים סופיים
- Cache invalidation אחרי mutations

### Packages System

**קובץ:** `trading-ui/scripts/init-system/package-manifest.js`

Data Services מוגדרים ב-`services` package:
- כל Data Service נטען ב-Stage 3 (Page Systems)
- Business Logic API wrappers זמינים מיד אחרי טעינת Data Service

### Page Configs

**קובץ:** `trading-ui/scripts/page-initialization-configs.js`

כל עמוד מגדיר:
- `packages` - רשימת packages נדרשים (כולל `services`)
- `requiredGlobals` - רשימת globals נדרשים (כולל Data Services)
- `customInitializers` - initializers ספציפיים לעמוד

### Preferences Loading Events

**Events:**
- `preferences:critical-loaded` - Preferences קריטיים נטענו
- `preferences:all-loaded` - כל ה-Preferences נטענו

**Business Logic Integration:**
- Business Logic API לא תלוי ב-Preferences (לרוב)
- אם נדרש, יש לבדוק `window.__preferencesCriticalLoaded` לפני שימוש

### Monitoring System

**קובץ:** `trading-ui/scripts/monitoring-functions.js`

**תפקיד:** מוניטורינג ותיעוד (לא טעינה דינמית)

**Business Logic Integration:**
- Monitoring System בודק מה נטען ומה צריך להיות נטען
- לא משפיע על Business Logic API

---

## 💾 אינטגרציה עם מערכות מטמון

### 4 שכבות מטמון:

Business Logic API משתמש ב-4 שכבות המטמון דרך UnifiedCacheManager:

#### 1. Memory Cache
**תפקיד:** מטמון זיכרון מהיר

**Business Logic Usage:**
- תוצאות חישובים (TTL קצר: 30 שניות)
- תוצאות ולידציות (TTL בינוני: 60 שניות)

#### 2. localStorage
**תפקיד:** מטמון דפדפן

**Business Logic Usage:**
- תוצאות חישובים נפוצים
- תוצאות ולידציות

#### 3. IndexedDB
**תפקיד:** מטמון גדול

**Business Logic Usage:**
- תוצאות חישובים מורכבים
- היסטוריית ולידציות

#### 4. Backend Cache
**תפקיד:** מטמון שרת

**Business Logic Usage:**
- ⏳ כבוי כרגע (CACHE_DISABLED=true)

### CacheTTLGuard

**קובץ:** `trading-ui/scripts/cache-ttl-guard.js`

**תפקיד:** ניהול TTL אוטומטי

**Business Logic Integration:**
- כל Business Logic API wrapper משתמש ב-CacheTTLGuard
- TTL מוגדר לפי סוג פעולה:
  - חישובים: 30 שניות
  - ולידציות: 60 שניות

**דוגמה:**
```javascript
// Using CacheTTLGuard in wrapper
const cacheKey = `business:calculate-stop-price:${currentPrice}:${stopPercentage}:${side}`;
return await window.CacheTTLGuard.ensure(cacheKey, async () => {
  // API call
}, { ttl: 30 * 1000 });
```

### CacheSyncManager

**קובץ:** `trading-ui/scripts/cache-sync-manager.js`

**תפקיד:** סנכרון Frontend ↔ Backend

**Business Logic Integration:**
- Cache invalidation אחרי mutations
- סנכרון תוצאות חישובים

**דוגמה:**
```javascript
// Cache invalidation after trade creation
if (result.status === 'success' && window.CacheSyncManager?.invalidateByAction) {
  await window.CacheSyncManager.invalidateByAction('trade-created');
}
```

### Cache Key Generation

**קובץ:** `trading-ui/scripts/utils/cache-key-helper.js`

**תפקיד:** יצירת מפתחות מטמון אופטימליים

**Business Logic Integration:**
- כל Business Logic API wrapper משתמש ב-CacheKeyHelper
- מפתחות מטמון עקביים ומאופטמלים

**דוגמה:**
```javascript
const cacheKey = window.CacheKeyHelper?.generateCacheKeyFromObject 
  ? window.CacheKeyHelper.generateCacheKeyFromObject('business:validate-trade', tradeData)
  : `business:validate-trade:${JSON.stringify(tradeData)}`;
```

### Cache Invalidation Patterns

**Patterns:**
1. **After Mutations** - Invalidation אחרי create/update/delete
2. **By Action** - Invalidation לפי action type (trade-created, trade-updated, וכו')
3. **By Entity** - Invalidation לפי ישות
4. **Manual** - Invalidation ידני

---

## 🔍 Validation Architecture

### סקירה כללית

מערכת הולידציה במערכת TikTrack מחולקת ל-3 שכבות עיקריות:

1. **Database Constraints** (ValidationService) - אילוצים בסיסיים מבסיס הנתונים
2. **Business Rules** (BusinessRulesRegistry) - חוקי עסק מורכבים
3. **Frontend Validation** - ולידציה בלקוח (UI-level)

### חלוקת אחריות:

#### 1. Database Constraints (ValidationService)
**מיקום:** `Backend/services/validation_service.py`

**תפקיד:** ולידציה מול constraints מבסיס הנתונים

**סוגי Constraints:**
- **NOT NULL** - שדה חובה
- **UNIQUE** - ערך ייחודי
- **FOREIGN KEY** - קשר לטבלה אחרת
- **ENUM** - ערכים מותרים
- **RANGE** - טווח ערכים
- **CHECK** - בדיקות מותאמות אישית
- **CUSTOM** - אילוצים מותאמים אישית (cross-table)

**שימוש:**
- כל Business Service קורא ל-`validate_with_constraints()` כשלב ראשון ב-`validate()`
- מתבצע דרך `BaseBusinessService.validate_with_constraints()`
- דורש `db_session` ו-`table_name`

#### 2. Business Rules (BusinessRulesRegistry)
**מיקום:** `Backend/services/business_logic/business_rules_registry.py`

**תפקיד:** חוקי עסק מורכבים

**סוגי Rules:**
- חוקי עסק מורכבים (תלויות, חישובים, לוגיקה עסקית)
- חוקים שלא ניתן לבטא ב-constraints (למשל: "לא למחוק profile פעיל")
- חוקים דינמיים (תלויים בהקשר)

**שימוש:**
- כל Business Service משתמש ב-`BusinessRulesRegistry.validate_value()` כשלב שני ב-`validate()`
- מתבצע אחרי Database Constraints

#### 3. Frontend Validation
**תפקיד:** ולידציה לפני שליחה לשרת (UX)

**שימוש:**
- Fallback אם API לא זמין
- Format validation (email, phone, etc.)
- UX improvements (validation בזמן אמת)

### סדר ולידציה (CRITICAL):

**חובה** לכל Business Service ב-`validate()`:

1. **שלב 1:** Database Constraints (ValidationService)
   ```python
   is_valid, constraint_errors = self.validate_with_constraints(data)
   if not is_valid:
       errors.extend(constraint_errors)
   ```

2. **שלב 2:** Business Rules Registry
   ```python
   for field, value in data.items():
       rule_result = self.registry.validate_value('entity', field, value)
       if not rule_result['is_valid']:
           errors.append(rule_result['error'])
   ```

3. **שלב 3:** Complex Business Rules
   ```python
   # חוקי עסק מורכבים (תלויות, לוגיקה עסקית)
   # למשל: stop price validation, profile deletion rules, etc.
   ```

### אינטגרציה עם BaseBusinessService:

כל Business Service יורש מ-`BaseBusinessService` ומקבל:
- `table_name` property - שם הטבלה ב-DB (או `None` אם אין טבלה)
- `db_session` - session לבסיס הנתונים (אופציונלי)
- `validate_with_constraints()` - method לולידציה מול constraints

**דוגמה:**
```python
class TradeBusinessService(BaseBusinessService):
    @property
    def table_name(self) -> Optional[str]:
        return 'trades'
    
    def __init__(self, db_session: Optional[Session] = None):
        super().__init__(db_session)
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        errors = []
        
        # Step 1: Database Constraints
        is_valid, constraint_errors = self.validate_with_constraints(data)
        if not is_valid:
            errors.extend(constraint_errors)
        
        # Step 2: Business Rules Registry
        # ...
        
        # Step 3: Complex Business Rules
        # ...
        
        return {'is_valid': len(errors) == 0, 'errors': errors}
```

### Services ללא Database Table:

Services כמו `StatisticsBusinessService` שאין להם טבלה ב-DB:
- מחזירים `None` ל-`table_name`
- `validate_with_constraints()` מדלג אוטומטית על ולידציית constraints
- עדיין יכולים להשתמש ב-BusinessRulesRegistry

---

## 📊 דיאגרמות

### דיאגרמת זרימת נתונים:

```
User Action (Frontend)
    │
    ▼
Page Script (trades.js)
    │
    ▼
Data Service (trades-data.js)
    │
    ├─► Cache Check (UnifiedCacheManager)
    │   │
    │   ├─► Cache Hit → Return Cached Result
    │   │
    │   └─► Cache Miss → Continue
    │
    ▼
Business Logic API Wrapper
    │
    ├─► CacheTTLGuard.ensure()
    │   │
    │   ├─► Cache Hit → Return Cached Result
    │   │
    │   └─► Cache Miss → API Call
    │
    ▼
HTTP Request → /api/business/trade/validate
    │
    ▼
Backend API Route (business_logic.py)
    │
    ▼
Business Service (TradeBusinessService)
    │
    ├─► BusinessRulesRegistry
    │   │
    │   └─► Validation Rules
    │
    ▼
Response: {is_valid: true/false, errors: [...]}
    │
    ▼
Cache Save (UnifiedCacheManager)
    │
    ▼
Return to Frontend
```

### דיאגרמת ארכיטקטורה:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                            │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Page Scripts │  │ Data Services│  │ Cache System │      │
│  │  (trades.js) │→ │(trades-data) │→ │(UnifiedCache)│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                │                    │             │
│         └────────────────┴────────────────────┘             │
│                            │                                 │
│                            ▼                                 │
│                  Business Logic API Wrappers                  │
│                  (calculateStopPrice, validateTrade, etc.)     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP /api/business/*
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Layer                             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         API Routes (business_logic.py)                │   │
│  │  - 29+ Endpoints                                      │   │
│  │  - Performance Monitoring                            │   │
│  │  - Batch Operations                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Business Services (12 Services)               │   │
│  │  - TradeBusinessService                              │   │
│  │  - ExecutionBusinessService                         │   │
│  │  - AlertBusinessService                             │   │
│  │  - ... (9 more services)                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         BaseBusinessService                           │   │
│  │  - validate() (abstract)                             │   │
│  │  - calculate() (abstract)                             │   │
│  │  - apply_rules()                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         BusinessRulesRegistry                         │   │
│  │  - Central registry לכל חוקי העסק                     │   │
│  │  - Validation rules                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 קישורים נוספים

- [Business Rules Registry Documentation](BUSINESS_RULES_REGISTRY.md)
- [Business Logic Developer Guide](../../03-DEVELOPMENT/GUIDES/BUSINESS_LOGIC_DEVELOPER_GUIDE.md)
- [Business Logic Migration Guide](../../03-DEVELOPMENT/GUIDES/BUSINESS_LOGIC_MIGRATION_GUIDE.md)
- [Data Services Developer Guide](../../03-DEVELOPMENT/GUIDES/DATA_SERVICES_DEVELOPER_GUIDE.md)
- [Complete System Reference](../../03-DEVELOPMENT/PLANS/BUSINESS_LOGIC_COMPLETE_SYSTEM_REFERENCE.md)

---

**תאריך עדכון אחרון:** 22 נובמבר 2025  
**גרסה:** 1.0.0


# תוכנית אופטימיזציה מקיפה למערכת AI Analysis

## מטרה

לשפר משמעותית את איכות הניתוחים על ידי:
1. הוספת נתוני טריידים מלאים למנוע AI
2. הסרת trading_account מהמידע הנשלח (שמירה כפילטר בלבד)
3. התאמת תבניות ושדות לכל סוג ניתוח
4. יצירת מבנה גמיש לשמירת פרמטרים מדויקים

---

## שלב 1: יצירת Trade Aggregation System (מערכת כללית)

### 1.1 יצירת Trade Aggregation Service כללי

**קובץ חדש:** `Backend/services/trade_aggregation_service.py`

**תפקידים:**
- מערכת כללית לאגרגציית נתוני טריידים לשימושים שונים (AI Analysis, דוחות, סטטיסטיקות, וכו')
- הבאת טריידים לפי פילטרים שונים (ticker, account, date range, investment type, trading method, trade ID)
- איגוד נתונים מלאים: Trade + Executions + TradePlan + Conditions + Position
- פורמט נתונים מובנה וניתן להרחבה

**פונקציות עיקריות:**
- `aggregate_trades()` - אגרגציה כללית של טריידים עם כל הנתונים
- `get_trades_by_filters()` - הבאת טריידים לפי פילטרים
- `enrich_trade_data()` - העשרת טרייד בודד בנתונים מלאים
- `format_trades_for_ai()` - פורמט מובנה לניתוח AI (wrapper)
- `format_trades_for_report()` - פורמט לדוחות (לעתיד)
- `get_trade_summary()` - סיכום סטטיסטיקות טריידים

**פילטרים נתמכים:**
- `trade_ids` - רשימת IDs ספציפיים
- `ticker_id` / `ticker_symbol` - סינון לפי טיקר
- `trading_account_id` - סינון לפי חשבון
- `investment_type` - סינון לפי סוג השקעה
- `trading_method_id` - סינון לפי שיטת מסחר
- `date_range` - טווח תאריכים (opened_at / closed_at)
- `status` - סטטוס טרייד (open, closed, cancelled)
- `side` - צד (Long, Short)

### 1.2 מבנה נתונים מובנה

**מבנה Trade Enriched:**
```python
{
    "trade": {
        "id": 123,
        "ticker": {
            "id": 1,
            "symbol": "TSLA",
            "name": "Tesla, Inc."
        },
        "account": {
            "id": 1,
            "name": "Main Account"
        },
        "status": "open",
        "investment_type": "swing",
        "side": "Long",
        "planned_quantity": 10,
        "planned_amount": 2500,
        "entry_price": 250,
        "total_pl": 50,
        "opened_at": "2024-01-15T10:00:00",
        "closed_at": null,
        "notes": "..."
    },
    "executions": [
        {
            "id": 1,
            "action": "buy",
            "date": "2024-01-15T10:30:00",
            "quantity": 10,
            "price": 250,
            "fee": 1,
            "realized_pl": null,
            "mtm_pl": 50,
            "notes": "..."
        }
    ],
    "trade_plan": {
        "id": 45,
        "planned_amount": 10000,
        "entry_price": 245,
        "target_price": 300,
        "stop_price": 230,
        "reasons": "Strong fundamentals",
        "entry_conditions": "Price breaks above 250",
        "conditions": [
            {
                "id": 12,
                "method": {
                    "id": 3,
                    "name_he": "RSI",
                    "name_en": "RSI"
                },
                "parameters": {"rsi_value": 70},
                "trigger_action": "enter_trade_positive"
            }
        ]
    },
    "conditions": [
        {
            "id": 12,
            "method": {...},
            "parameters": {...},
            "trigger_action": "...",
            "is_active": true
        }
    ],
    "position": {
        "quantity": 10,
        "avg_cost": 250,
        "current_price": 255,
        "unrealized_pl": 50,
        "realized_pl": 0,
        "total_cost": 2500,
        "market_value": 2550,
        "total_fees": 1
    },
    "summary": {
        "total_executions": 3,
        "total_fees": 5,
        "holding_period_days": 15,
        "avg_entry_price": 250,
        "current_exit_price": 255
    }
}
```

**מבנה Aggregate Result:**
```python
{
    "trades": [
        {
            "trade": {...},
            "executions": [...],
            "trade_plan": {...},
            "conditions": [...],
            "position": {...},
            "summary": {...}
        }
    ],
    "aggregate_summary": {
        "total_trades": 10,
        "total_pl": 5000,
        "realized_pl": 3000,
        "unrealized_pl": 2000,
        "win_rate": 0.7,
        "total_fees": 50,
        "avg_holding_period": 12.5
    },
    "filters_applied": {
        "ticker_symbol": "TSLA",
        "date_range": "2024-01-01 - 2024-12-31",
        "investment_type": "swing"
    }
}
```

### 1.3 תיעוד מערכת כללית

**קובץ חדש:** `documentation/backend/TRADE_AGGREGATION_SYSTEM.md`

**תיעוד:**
- סקירה כללית של המערכת
- API של הפונקציות
- דוגמאות שימוש
- פורמטי נתונים
- שימושים עתידיים (דוחות, סטטיסטיקות, AI Analysis)
- אינטגרציה עם מערכות קיימות

---

## שלב 2: עדכון AI Analysis Service

### 2.1 הרחבת build_prompt להכללת נתוני טריידים

**קובץ:** `Backend/services/ai_analysis_service.py`

**שינויים:**
- הרחבת `build_prompt()` לקבל `trade_data` נוסף
- הוספת נתוני טריידים בפורמט מובנה ב-prompt
- זיהוי סוג תבנית (Portfolio Performance, Technical, Risk) והוספת נתונים רלוונטיים
- פורמט נתונים קריא למנוע AI

**לוגיקה:**
```python
def build_prompt(template, variables, trade_data=None):
    prompt = str(template.prompt_text)
    # Replace variables
    # If trade_data exists and template is portfolio/technical/risk:
    #   Add structured trade data section with clear formatting
```

**פורמט נתונים למנוע AI:**
```
=== TRADING DATA ===

Ticker: TSLA
Total Trades Analyzed: 5
Period: 2024-01-01 to 2024-12-31

Trade #1 (ID: 123):
- Status: Open
- Investment Type: Swing Trading
- Side: Long
- Planned Entry: $245.00
- Actual Entry: $250.00 (via 3 executions)
- Current Position: 10 shares @ $250.00 avg cost
- Current Price: $255.00
- Unrealized P/L: +$50.00 (+2.0%)
- Realized P/L: $0.00
- Total Fees: $1.00

Executions:
  1. 2024-01-15: BUY 5 shares @ $248.00 (Fee: $0.50)
  2. 2024-01-16: BUY 3 shares @ $251.00 (Fee: $0.30)
  3. 2024-01-17: BUY 2 shares @ $252.00 (Fee: $0.20)

Trade Plan:
- Target Price: $300.00 (+20.0% from entry)
- Stop Price: $230.00 (-8.2% from entry)
- Reasons: Strong fundamentals, positive earnings
- Entry Conditions: Price breaks above $250.00

Conditions:
- RSI > 70 (Active)
- MACD Crossover (Active)

---
[Additional trades...]

Summary:
- Total Trades: 5
- Winning Trades: 4 (80% win rate)
- Total P/L: +$2,450.00
- Average Holding Period: 12.5 days
```

### 2.2 עדכון generate_analysis להבאת נתוני טריידים

**קובץ:** `Backend/services/ai_analysis_service.py`

**שינויים:**
- זיהוי תבנית Portfolio Performance / Technical / Risk
- קריאה ל-`TradeAggregationService.aggregate_trades()` לפי הפילטרים
- קריאה ל-`TradeAggregationService.format_trades_for_ai()` לפורמט נתונים
- העברת נתוני טריידים ל-`build_prompt()`
- שמירת פילטרים נפרדים (כולל trading_account) ב-variables_json

**מבנה variables_json משופר (גרסה 2.0):**
```json
{
    "version": "2.0",
    "prompt_variables": {
        "ticker_symbol": "TSLA",
        "date_range": "2024-01-01 - 2024-12-31",
        "analysis_focus": "Performance Review",
        "investment_type_filter": "Swing Trading"
    },
    "filters": {
        "trading_account_id": 1,
        "trading_method_id": 3,
        "internal_notes": "Analysis requested by user"
    },
    "analysis_type": "portfolio_performance",
    "trade_selection": {
        "type": "multiple",
        "criteria": {
            "ticker_symbol": "TSLA",
            "date_range": {
                "start": "2024-01-01",
                "end": "2024-12-31"
            },
            "investment_type": "swing"
        },
        "trade_ids": null
    },
    "metadata": {
        "analysis_scope": "portfolio_performance",
        "filters_applied": [
            "ticker_symbol",
            "date_range",
            "investment_type",
            "trading_account_id"
        ],
        "trades_count": 5
    }
}
```

---

## שלב 3: עדכון תבניות Prompt

### 3.1 תבנית Portfolio Performance - שינויים מרכזיים

**קובץ:** `Backend/migrations/seed_ai_prompt_templates.py`

**שינויים:**
- הסרת `Trading Account: {trading_account}` מה-prompt
- הוספת סעיף "Trading Data" ב-prompt שיכיל נתונים מובנים
- עדכון המבנה לניתוח נתוני טריידים אמיתיים
- הוספת הנחיות מפורטות למנוע לנתח נתונים אמיתיים

**Prompt חדש:**
```
Act as a senior portfolio analyst at a top-tier trading firm. You excel at analyzing trading performance, identifying patterns in execution, and providing actionable recommendations for portfolio optimization. Analyze the trading data provided below and structure your response according to the framework.

Analysis Parameters:
Ticker Symbol: {ticker_symbol}
Date Range: {date_range}
Analysis Focus: {analysis_focus}
Investment Type Filter: {investment_type_filter}

=== TRADING DATA ===
{trade_data_structured}

IMPORTANT: Use the actual trading data provided above to calculate real metrics and provide specific insights. The data includes actual executions, positions, and performance.

Use the following structure to deliver a clear, well-reasoned performance analysis:

1. Performance Overview
- Total P&L for the period (calculate from actual data)
- Win rate and average win/loss ratio (based on actual trades)
- Best and worst performing trades (with specific IDs and details)
- ROI and Sharpe ratio if applicable (calculated from data)

2. Trade Pattern Analysis
- Most profitable entry strategies (analyze actual execution patterns)
- Exit timing effectiveness (analyze actual exit points vs targets)
- Holding period analysis (calculate from actual trade dates)
- Correlation with market conditions

3. Risk Assessment
- Maximum drawdown period (from actual P&L data)
- Risk per trade analysis (actual position sizes and stops)
- Position sizing effectiveness (compare planned vs actual)
- Volatility impact on performance

4. Execution Quality Review
- Entry price vs intended price analysis (compare planned vs actual)
- Slippage assessment (actual vs planned execution prices)
- Timing of entries/exits (analyze execution timing)
- Comparison to market benchmarks

5. Trade Plan vs Execution Analysis
- Compare original trade plan targets vs actual results
- Analyze condition effectiveness (which conditions triggered)
- Assess reasons and thesis validity

6. Portfolio Optimization Recommendations
- Suggested position sizing adjustments (based on actual performance)
- Entry/exit strategy improvements (learned from actual trades)
- Risk management enhancements (based on actual drawdowns)
- Diversification suggestions

7. Action Plan
- 5-bullet summary of key findings
- Top 3 actionable recommendations
- Priority level for each recommendation
- Expected impact of implementing changes

Build the report this way:
- Use markdown
- Use bullet points where appropriate
- Include specific numbers and percentages from actual data
- Reference specific trade IDs when relevant
- Be concise, professional, and insight-driven
- Do not explain your process just deliver the analysis
```

### 3.2 תבנית Technical Analysis - הוספת נתוני טריידים

**שינויים:**
- הוספת נתוני טריידים קיימים לטיקר (אם יש)
- ניתוח ביצועי טריידים קודמים בניתוח הטכני
- השוואת תכנון טכני לביצוע בפועל
- הוספת פילטרים רלוונטיים

**הוספה ל-prompt:**
```
=== PREVIOUS TRADES PERFORMANCE ===
{trade_data_structured}

Analyze how previous trades performed with this ticker and incorporate lessons learned into the technical analysis.
```

### 3.3 תבנית Risk & Conditions - הוספת נתוני תכנון

**שינויים:**
- הוספת נתוני Trade Plans ו-Conditions בפורמט מובנה
- ניתוח יעילות תנאים בפועל
- השוואת תכנון לביצוע
- ניתוח false positives/negatives

**הוספה ל-prompt:**
```
=== TRADE PLAN & CONDITIONS DATA ===
{trade_data_structured}

Analyze the effectiveness of conditions, compare planned vs actual execution, and assess condition trigger accuracy.
```

**לא לגעת בתבנית Fundamental Analysis** (Equity Research)

---

## שלב 4: עדכון Frontend - שדות מודול

### 4.1 תבנית Portfolio Performance - שדות חדשים

**קובץ:** `Backend/migrations/seed_ai_prompt_templates.py`

**שדות חדשים ב-variables_json:**

```json
{
    "variables": [
        {
            "key": "trade_selection_type",
            "label": "סוג בחירת טריידים",
            "type": "select",
            "required": false,
            "options": [
                {"value": "single", "label": "טרייד בודד"},
                {"value": "multiple", "label": "קבוצת טריידים"},
                {"value": "all", "label": "כל הטריידים"}
            ],
            "default_value": "multiple"
        },
        {
            "key": "single_trade_id",
            "label": "מספר טרייד",
            "type": "number",
            "required": false,
            "placeholder": "הזן מספר טרייד...",
            "default_value": null,
            "conditional": {
                "show_if": "trade_selection_type",
                "equals": "single"
            }
        },
        {
            "key": "ticker_symbol",
            "label": "טיקר",
            "type": "select",
            "required": false,
            "placeholder": "בחר טיקר...",
            "default_value": null,
            "options": [],
            "integration": "tickers"
        },
        {
            "key": "date_range",
            "label": "טווח תאריכים",
            "type": "text",
            "required": false,
            "placeholder": "2024-01-01 - 2024-12-31",
            "default_value": null
        },
        {
            "key": "analysis_focus",
            "label": "מיקוד ניתוח",
            "type": "select",
            "required": false,
            "options": [
                {"value": "Performance Review", "label": "סקירת ביצועים"},
                {"value": "Risk Assessment", "label": "הערכת סיכונים"},
                {"value": "Optimization Recommendations", "label": "המלצות לאופטימיזציה"},
                {"value": "Execution Quality", "label": "איכות ביצוע"},
                {"value": "Trade Plan Analysis", "label": "ניתוח תכנית מסחר"},
                {"value": "Conditions Effectiveness", "label": "יעילות תנאים"}
            ],
            "default_value": "Performance Review"
        },
        {
            "key": "analysis_topics",
            "label": "נושאים ספציפיים",
            "type": "multi-select",
            "required": false,
            "options": [
                {"value": "win_rate", "label": "Win Rate"},
                {"value": "avg_pl", "label": "Average P/L"},
                {"value": "holding_period", "label": "Holding Period"},
                {"value": "slippage", "label": "Slippage Analysis"},
                {"value": "position_sizing", "label": "Position Sizing"},
                {"value": "entry_timing", "label": "Entry Timing"},
                {"value": "exit_timing", "label": "Exit Timing"},
                {"value": "risk_reward", "label": "Risk/Reward Ratio"}
            ],
            "default_value": []
        },
        {
            "key": "investment_type_filter",
            "label": "סינון לפי סוג השקעה",
            "type": "select",
            "required": false,
            "options": [
                {"value": "swing", "label": "סווינג"},
                {"value": "investment", "label": "השקעה"},
                {"value": "passive", "label": "פאסיבי"}
            ],
            "default_value": null
        },
        {
            "key": "trading_method_filter",
            "label": "סינון לפי שיטת מסחר",
            "type": "select",
            "required": false,
            "placeholder": "בחר שיטת מסחר...",
            "default_value": null,
            "options": [],
            "integration": "trading_methods"
        },
        {
            "key": "trading_account",
            "label": "חשבון מסחר (פילטר)",
            "type": "select",
            "required": false,
            "placeholder": "בחר חשבון מסחר...",
            "default_value": null,
            "options": [],
            "integration": "trading_accounts",
            "note": "שדה זה משמש לפילטרציה בלבד ולא נשלח למנוע AI"
        },
        {
            "key": "response_language",
            "label": "שפת המשוב",
            "type": "select",
            "required": false,
            "placeholder": "בחר שפה...",
            "default_value": "hebrew",
            "options": [
                {"value": "hebrew", "label": "עברית"},
                {"value": "english", "label": "English"}
            ]
        }
    ]
}
```

### 4.2 עדכון renderVariablesFormModal

**קובץ:** `trading-ui/scripts/ai-analysis-manager.js`

**שינויים:**
- הוספת שדות חדשים לפי תבנית
- טיפול ב-trade_selection_type (תלות בין שדות - הצגת/הסתרת single_trade_id)
- טעינת רשימת טריידים לבחירה (אם נבחר "טרייד בודד")
- טעינת רשימת טריידים לפי פילטרים (אם נבחר "קבוצת טריידים")
- שמירת trading_account כפילטר אבל לא בשליחה למנוע
- תמיכה ב-multi-select עבור analysis_topics

### 4.3 עדכון handleGenerateAnalysis

**קובץ:** `trading-ui/scripts/ai-analysis-manager.js`

**שינויים:**
- הפרדת prompt_variables מ-filters
- בניית מבנה trade_selection לפי בחירת המשתמש
- שליחת מבנה משופר ל-API:
```javascript
{
    template_id: 3,
    variables: {
        version: "2.0",
        prompt_variables: {
            ticker_symbol: "TSLA",
            date_range: "2024-01-01 - 2024-12-31",
            analysis_focus: "Performance Review",
            analysis_topics: ["win_rate", "avg_pl"]
        },
        filters: {
            trading_account_id: 1  // לא נשלח למנוע
        },
        trade_selection: {
            type: "multiple",
            criteria: {
                ticker_symbol: "TSLA",
                date_range: {...},
                investment_type: "swing"
            }
        }
    },
    provider: "perplexity"
}
```

---

## שלב 5: Backend API - עדכון generate endpoint

### 5.1 עדכון /api/ai-analysis/generate

**קובץ:** `Backend/routes/api/ai_analysis.py`

**שינויים:**
- קבלת מבנה variables משופר (גרסה 2.0)
- הפרדת prompt_variables מ-filters
- קריאה ל-`TradeAggregationService.aggregate_trades()` לפי trade_selection
- קריאה ל-`TradeAggregationService.format_trades_for_ai()` לפורמט נתונים
- שמירת מבנה מלא ב-variables_json (למעקב עתידי)

**לוגיקה:**
```python
# Extract variables structure
variables = data.get('variables', {})
if isinstance(variables, dict) and 'version' in variables:
    # New structure (v2.0)
    prompt_variables = variables.get('prompt_variables', variables)
    filters = variables.get('filters', {})
    trade_selection = variables.get('trade_selection', {})
else:
    # Legacy structure (v1.0) - backward compatibility
    prompt_variables = variables
    filters = {}
    trade_selection = {}

# Get trade data if needed
trade_data = None
if template_id in [2, 3, 4]:  # Technical, Portfolio, Risk
    trade_data = TradeAggregationService.aggregate_trades(
        db=db,
        user_id=user_id,
        **trade_selection.get('criteria', {}),
        **filters
    )
    trade_data = TradeAggregationService.format_trades_for_ai(trade_data)

# Generate analysis with trade data
request_obj = ai_analysis_service.generate_analysis(
    db=db,
    template_id=template_id,
    variables={
        'prompt_variables': prompt_variables,
        'filters': filters,
        'trade_selection': trade_selection,
        'version': '2.0'
    },
    user_id=user_id,
    provider=provider,
    trade_data=trade_data
)
```

---

## שלב 6: עדכון מבנה שמירת נתונים

### 6.1 מבנה variables_json גמיש (גרסה 2.0)

**קובץ:** `Backend/services/ai_analysis_service.py`

**מבנה:**
```json
{
    "version": "2.0",
    "prompt_variables": {
        "ticker_symbol": "TSLA",
        "date_range": "2024-01-01 - 2024-12-31",
        "analysis_focus": "Performance Review",
        "analysis_topics": ["win_rate", "avg_pl"]
    },
    "filters": {
        "trading_account_id": 1,
        "internal_notes": "Analysis requested by user"
    },
    "trade_selection": {
        "type": "multiple",
        "criteria": {
            "ticker_symbol": "TSLA",
            "date_range": {
                "start": "2024-01-01",
                "end": "2024-12-31"
            },
            "investment_type": "swing"
        },
        "trade_ids": null
    },
    "metadata": {
        "analysis_scope": "portfolio_performance",
        "filters_applied": [
            "ticker_symbol",
            "date_range",
            "investment_type",
            "trading_account_id"
        ],
        "trades_count": 5,
        "created_at": "2024-12-06T15:50:00Z"
    }
}
```

**תמיכה ב-backward compatibility:**
- אם variables הוא dict פשוט (גרסה 1.0) - ממיר אוטומטית ל-2.0
- שמירה תמיד בגרסה 2.0

---

## שלב 7: תיעוד ומבנה נתונים

### 7.1 תיעוד Trade Aggregation System

**קובץ חדש:** `documentation/backend/TRADE_AGGREGATION_SYSTEM.md`

**תיעוד:**
- סקירה כללית של המערכת
- API של הפונקציות
- דוגמאות שימוש
- פורמטי נתונים
- שימושים עתידיים (דוחות, סטטיסטיקות, AI Analysis)
- אינטגרציה עם מערכות קיימות (TradeService, PositionCalculator, EntityDetailsService)

### 7.2 תיעוד פורמט נתוני טריידים ל-AI

**קובץ חדש:** `documentation/04-FEATURES/AI_ANALYSIS_TRADE_DATA_FORMAT.md`

**תיעוד:**
- פורמט נתוני טריידים שנשלחים למנוע
- מבנה variables_json (גרסה 2.0)
- דוגמאות לכל סוג ניתוח
- הסבר על הפרדת filters מ-prompt_variables

### 7.3 עדכון תיעוד AI Analysis

**קובץ:** `documentation/04-FEATURES/AI_ANALYSIS_SYSTEM_DEVELOPER_GUIDE.md`

**עדכונים:**
- הוספת סעיף על Trade Aggregation System
- הסבר על מבנה variables_json החדש
- דוגמאות לשימוש בנתוני טריידים

### 7.4 עדכון רשימת מערכות כללית

**קובץ:** `documentation/frontend/GENERAL_SYSTEMS_LIST.md`

**הוספה:**
- Trade Aggregation Service - מערכת כללית לאגרגציית נתוני טריידים

---

## סדר יישום מומלץ

1. **שלב 1** - יצירת Trade Aggregation System (בסיס כללי - חשוב ביותר)
   - 1.1 יצירת Service
   - 1.2 מבנה נתונים
   - 1.3 תיעוד

2. **שלב 2** - עדכון AI Analysis Service (אינטגרציה)
   - 2.1 הרחבת build_prompt
   - 2.2 עדכון generate_analysis

3. **שלב 3** - עדכון תבניות (Portfolio, Technical, Risk)
   - 3.1 Portfolio Performance
   - 3.2 Technical Analysis
   - 3.3 Risk & Conditions

4. **שלב 4** - עדכון Frontend (שדות מודול)
   - 4.1 שדות חדשים
   - 4.2 renderVariablesFormModal
   - 4.3 handleGenerateAnalysis

5. **שלב 5** - עדכון API endpoint
   - 5.1 עדכון generate endpoint

6. **שלב 6** - מבנה שמירת נתונים
   - 6.1 מבנה variables_json גמיש

7. **שלב 7** - תיעוד
   - 7.1 Trade Aggregation System
   - 7.2 AI Analysis Trade Data Format
   - 7.3 עדכון תיעוד קיים

---

## נקודות חשובות

1. **Trade Aggregation System**: מערכת כללית - ישמש בעתיד לדוחות, סטטיסטיקות, וכו'
2. **trading_account**: נשמר ב-filters, לא נשלח למנוע
3. **מבנה גמיש**: variables_json תומך במבנים שונים לכל תבנית (גרסה 2.0)
4. **נתוני טריידים**: נשלחים רק לתבניות רלוונטיות (לא Fundamental)
5. **שמירת פרמטרים**: כל פרמטר נשמר במדויק למעקב וחיתוך עתידי
6. **איכות ניתוח**: המטרה - ניתוח ברמה מקצועית גבוהה כמו יועץ השקעות איכותי
7. **Backward Compatibility**: תמיכה בגרסה 1.0 של variables_json

---

## הערות טכניות

### פורמט נתונים למנוע AI

הנתונים יוצגו בפורמט קריא ומבני למנוע:
- רשימות ברורות
- מספרים ומחירים בפורמט USD
- אחוזים ומדדים מחושבים
- התייחסות ל-Trade IDs ספציפיים
- השוואות בין תכנון לביצוע

### ביצועים

- אגרגציית טריידים תתבצע ב-Backend (לא Frontend)
- שימוש ב-joinedload לאופטימיזציה של שאילתות DB
- מטמון אפשרי לתוצאות אגרגציה (עם TTL מתאים)



# AI Analysis Trade Data Format - TikTrack
## פורמט נתוני טריידים למערכת ניתוח AI

**תאריך יצירה:** 06/12/2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ מתועד  
**מטרה:** תיעוד פורמט נתוני הטריידים הנשלחים למנועי AI

---

## 📋 תוכן עניינים

1. [מבוא](#מבוא)
2. [מבנה הנתונים](#מבנה-הנתונים)
3. [פורמט הטקסט](#פורמט-הטקסט)
4. [דוגמאות](#דוגמאות)
5. [שימוש בתבניות](#שימוש-בתבניות)

---

## 🎯 מבוא

מערכת AI Analysis משתמשת ב-`TradeAggregationService` לאגרגציית נתוני טריידים מלאים, ומעצבת אותם לפורמט מובנה שמתאים למנועי AI.

הפורמט כולל:
- נתוני טרייד בסיסיים
- ביצועים (Executions)
- תוכניות מסחר (Trade Plans)
- תנאים (Conditions)
- מצב פוזיציה נוכחי
- סטטיסטיקות כוללות

---

## 📊 מבנה הנתונים

### מקור הנתונים

הנתונים מגיעים מ-`TradeAggregationService.aggregate_trades()` ומעובדים דרך `format_trades_for_ai()`.

### מבנה JSON (לפני פורמט)

```json
{
  "trades": [
    {
      "trade": {
        "id": 1929,
        "ticker": {"symbol": "WIX", "name": "Wix.com Ltd."},
        "investment_type": "passive",
        "side": "Long",
        "status": "closed",
        "planned_amount": 62329.25,
        "planned_quantity": 179.06,
        "entry_price": 347.80,
        "total_pl": 8437.94,
        "opened_at": "2025-12-04T19:24:53",
        "closed_at": "2025-12-05T19:24:53"
      },
      "executions": [
        {
          "action": "BUY",
          "quantity": 89.53,
          "price": 347.80,
          "fee": 41.20,
          "date": "2025-12-04T19:24:53"
        }
      ],
      "trade_plan": {
        "target_price": 443.62,
        "stop_price": 321.82,
        "reasons": "תוכנית passive עבור WIX"
      },
      "position": {
        "quantity": 0.0,
        "average_price": 348.09,
        "side": "closed"
      },
      "summary": {
        "total_executions": 4,
        "total_fees": 102.48,
        "holding_period_days": 1
      }
    }
  ],
  "aggregate_summary": {
    "total_trades": 80,
    "win_rate": 0.755,
    "total_pl": 166217.74,
    "avg_holding_period": 121.7
  }
}
```

---

## 📝 פורמט הטקסט

הפורמט הסופי הוא מחרוזת טקסט מובנת עם מבנה היררכי:

```
=== TRADING DATA ===

Total Trades Analyzed: 80

Trade #1 (ID: 1929):
- Status: closed
- Ticker: WIX (Wix.com Ltd.)
- Investment Type: passive
- Side: Long
- Planned Entry: $347.80
- Actual Entry: $348.09 (via 4 executions)
- Current Position: 0.00 shares @ $348.09 avg cost
- Total P/L: $8437.94
- Total Fees: $102.48

Executions:
  2025-12-04T19:24:53.502336: BUY 89.53 shares @ $347.80 (Fee: $41.20)
  2025-12-04T19:24:53.502336: BUY 89.53 shares @ $347.80 (Fee: $10.98)
  2025-12-05T19:24:53.502336: SELL 89.53 shares @ $442.05 (Fee: $48.72)
  2025-12-05T19:24:53.502336: SELL 89.53 shares @ $442.05 (Fee: $1.58)

Trade Plan:
- Target Price: $443.62 (+27.6% from entry)
- Stop Price: $321.82 (-7.5% from entry)
- Reasons: תוכנית passive עבור WIX

---

Trade #2 (ID: 1965):
...

---

Summary:
- Total Trades: 80
- Winning Trades: 40 (75.5% win rate)
- Total P/L: $166217.74
- Realized P/L: $166217.74
- Unrealized P/L: $0.00
- Total Fees: $7324.78
- Average Holding Period: 121.7 days
```

---

## 💡 דוגמאות

### דוגמה 1: טרייד בודד (Closed)

```
Trade #1 (ID: 1929):
- Status: closed
- Ticker: WIX (Wix.com Ltd.)
- Investment Type: passive
- Side: Long
- Planned Entry: $347.80
- Actual Entry: $348.09 (via 4 executions)
- Current Position: 0.00 shares @ $348.09 avg cost
- Total P/L: $8437.94
- Total Fees: $102.48

Executions:
  2025-12-04T19:24:53.502336: BUY 89.53 shares @ $347.80 (Fee: $41.20)
  2025-12-04T19:24:53.502336: BUY 89.53 shares @ $347.80 (Fee: $10.98)
  2025-12-05T19:24:53.502336: SELL 89.53 shares @ $442.05 (Fee: $48.72)
  2025-12-05T19:24:53.502336: SELL 89.53 shares @ $442.05 (Fee: $1.58)

Trade Plan:
- Target Price: $443.62 (+27.6% from entry)
- Stop Price: $321.82 (-7.5% from entry)
- Reasons: תוכנית passive עבור WIX
```

### דוגמה 2: טרייד פתוח עם פוזיציה

```
Trade #2 (ID: 1965):
- Status: open
- Ticker: CHKP (Check Point Software Technologies Ltd.)
- Investment Type: investment
- Side: Long
- Planned Entry: $151.68
- Actual Entry: $151.94 (via 5 executions)
- Current Position: 140.67 shares @ $151.94 avg cost
- Total P/L: $5026.68 (unrealized)
- Total Fees: $90.04

Executions:
  2025-12-03T19:24:53.502336: BUY 315.54 shares @ $151.68 (Fee: $22.37)
  2025-12-05T19:24:53.502336: SELL 315.54 shares @ $167.61 (Fee: $31.63)
  2025-12-05T19:24:53.502336: BUY 140.67 shares @ $152.75 (Fee: $16.87)

Trade Plan:
- Target Price: $172.88 (+14.0% from entry)
- Stop Price: $137.12 (-9.6% from entry)
- Reasons: תוכנית investment עבור CHKP
```

---

## 🎨 שימוש בתבניות

### Portfolio Performance Template

התבנית משתמשת בפורמט זה ליצירת ניתוחים מפורטים:

```python
# ב-prompt template
"""
=== TRADING DATA ===
{trade_data_structured}

IMPORTANT: Use the actual trading data provided above to calculate real metrics...
"""
```

### Technical Analysis Template

התבנית משתמשת בנתונים להשוואת תבניות טכניות עם ביצועים בפועל:

```python
# ב-prompt template
"""
=== HISTORICAL TRADING DATA ===
{trade_data_structured}

IMPORTANT: If trading data is provided above, use it to:
- Validate technical patterns with actual entry/exit points
- Compare predicted support/resistance levels with actual price action
...
"""
```

### Risk & Conditions Template

התבנית משתמשת בנתונים לניתוח יעילות תנאים:

```python
# ב-prompt template
"""
=== TRADING DATA (TRADE PLANS & CONDITIONS) ===
{trade_data_structured}

IMPORTANT: If trading data is provided above, use it to:
- Analyze actual condition trigger rates and timing
- Compare planned conditions with actual trade outcomes
...
"""
```

---

## 🔍 פרטי מימוש

### יצירת הפורמט

```python
from services.trade_aggregation_service import TradeAggregationService

# Aggregate trades
result = TradeAggregationService.aggregate_trades(
    db=db,
    user_id=user_id,
    include_closed=True
)

# Format for AI
formatted = TradeAggregationService.format_trades_for_ai(result)
```

### החלפה ב-Prompt

```python
from services.ai_analysis_service import PromptTemplateService

# Build prompt with trade data
prompt = PromptTemplateService.build_prompt(
    template=template,
    variables=variables,
    trade_data_structured=formatted
)
```

---

## 📊 שדות חשובים

### Trade Fields

- **ID** - מזהה ייחודי
- **Status** - open/closed/cancelled
- **Side** - Long/Short
- **Planned vs Actual** - השוואה בין תכנון לביצוע

### Execution Fields

- **Action** - BUY/SELL
- **Quantity & Price** - כמויות ומחירים
- **Fees** - עמלות
- **Date** - תאריך ביצוע

### Position Fields

- **Quantity** - כמות נוכחית
- **Average Price** - מחיר ממוצע
- **Side** - long/short/closed
- **Total Cost** - עלות כוללת

### Summary Fields

- **Win Rate** - אחוז הצלחה
- **Total P/L** - רווח/הפסד כולל
- **Average Holding Period** - תקופת החזקה ממוצעת

---

## ⚠️ הערות חשובות

1. **מחירים** - כל המחירים בפורמט דולר ($)
2. **תאריכים** - בפורמט ISO 8601
3. **כמויות** - מספרי מניות (float)
4. **אחוזים** - בפורמט עשרוני (0.755 = 75.5%)
5. **P/L** - יכול להיות חיובי (רווח) או שלילי (הפסד)

---

## 🔄 גרסאות

### v1.0.0 (06/12/2025)
- ✅ יצירה ראשונית של הפורמט
- ✅ תמיכה בכל סוגי הטריידים
- ✅ כלול Trade Plans ו-Conditions
- ✅ חישוב פוזיציות אוטומטי
- ✅ סטטיסטיקות כוללות

---

## 📚 קבצים קשורים

- `Backend/services/trade_aggregation_service.py` - יצירת הפורמט
- `Backend/services/ai_analysis_service.py` - שימוש בפורמט
- `documentation/backend/TRADE_AGGREGATION_SYSTEM.md` - תיעוד השירות

---

**עודכן לאחרונה:** 06/12/2025



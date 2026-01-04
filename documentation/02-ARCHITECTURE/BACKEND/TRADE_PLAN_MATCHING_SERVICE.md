# Trade Plan Matching Service

## Overview

התאמת טריידים לתוכניות מסחר והפקת הצעות ליצירת תוכניות חדשות.

## File

- `Backend/services/trade_plan_matching_service.py`

## Features

### Plan Matching Algorithm

- התאמה לפי קריטריונים
- דירוג התאמה (0-100%)
- הצעות ליצירת תוכניות
- Learning from user behavior

### Matching Criteria

#### Basic Criteria

- **Symbol**: התאמת סימול
- **Direction**: Buy/Sell alignment
- **Timeframe**: זמן כניסה/יציאה
- **Price Range**: טווח מחירים

#### Advanced Criteria

- **Strategy**: סוג אסטרטגיה
- **Risk Level**: רמת סיכון
- **Position Size**: גודל פוזיציה
- **Market Conditions**: תנאי שוק

## API

```python
from services.trade_plan_matching_service import TradePlanMatchingService

# התאמת טרייד לתוכניות קיימות
matches = TradePlanMatchingService.match_trade_to_plans(trade_data)

# דירוג התאמה
ranked_matches = TradePlanMatchingService.rank_matches(matches)

# הצעות ליצירת תוכנית חדשה
suggestions = TradePlanMatchingService.generate_plan_suggestions(trade_data)
```

## Matching Process

### Step 1: Criteria Extraction

```python
criteria = {
    'symbol': trade.symbol,
    'direction': trade.side,
    'entry_price': trade.entry_price,
    'stop_loss': trade.stop_loss,
    'take_profit': trade.take_profit,
    'timeframe': trade.timeframe
}
```

### Step 2: Plan Database Query

```python
# חיפוש תוכניות דומות
similar_plans = Plan.query.filter(
    Plan.symbol == criteria['symbol'],
    Plan.direction == criteria['direction']
).all()
```

### Step 3: Similarity Scoring

```python
for plan in similar_plans:
    score = TradePlanMatchingService.calculate_similarity_score(trade, plan)
    if score > 0.8:  # 80% similarity threshold
        matches.append((plan, score))
```

### Step 4: Learning Update

```python
# עדכון מודל למידה
TradePlanMatchingService.update_learning_model(trade, selected_plan)
```

## Performance

### Optimization

- Database indexing
- Caching of frequent queries
- Async processing for heavy calculations
- Memory-efficient algorithms

### Benchmarks

- **Single Match**: < 50ms
- **Bulk Match (100 trades)**: < 2s
- **Plan Generation**: < 500ms

## Status

✅ **ACTIVE** - Intelligent trade-plan matching system

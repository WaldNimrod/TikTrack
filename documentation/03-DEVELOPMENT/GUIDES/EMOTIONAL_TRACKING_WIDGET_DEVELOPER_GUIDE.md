# Emotional Tracking Widget Developer Guide

## Overview

מדריך מפתחים לוידג'ט Emotional Tracking - מעקב אחר מצב רגשי במהלך מסחר.

## File

- `trading-ui/scripts/widgets/emotional-tracking-widget.js`

## Features

- רישום מצב רגשי לפני/אחרי עסקאות
- ניתוח דפוסי התנהגות
- המלצות לשיפור משמעת
- גרפים וסטטיסטיקות

## API

```javascript
// אתחול הוידג'ט
const emotionalWidget = new EmotionalTrackingWidget({
  container: '#emotional-container',
  userId: currentUser.id
});

// רישום מצב רגשי
await emotionalWidget.recordEmotion({
  beforeTrade: 'excited',
  afterTrade: 'regretful',
  tradeId: 123,
  notes: 'FOMO trade'
});

// הצגת ניתוח
emotionalWidget.showAnalysis();
```

## Emotional States

- excited - נרגש
- fearful - מפוחד
- greedy - חמדן
- regretful - מתחרט
- disciplined - משמעתי
- patient - סבלני

## Status

✅ **ACTIVE** - Used in trading journal and self-improvement features

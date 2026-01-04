# Pending Trade Plan Widget Developer Guide

## Overview

מדריך מפתחים לוידג'ט Pending Trade Plan - ניהול תוכניות מסחר ממתינות.

## File

- `trading-ui/scripts/widgets/pending-trade-plan-widget.js`

## Features

- הצגת תוכניות מסחר ממתינות
- עדכון סטטוס בזמן אמת
- התראות על תנאים
- ביצוע אוטומטי/ידני

## API

```javascript
// אתחול הוידג'ט
const pendingPlansWidget = new PendingTradePlanWidget({
  container: '#pending-plans-container',
  autoRefresh: true
});

// טעינת תוכניות ממתינות
await pendingPlansWidget.loadPendingPlans();

// ביצוע תוכנית
await pendingPlansWidget.executePlan(planId);

// עדכון סטטוס
pendingPlansWidget.updatePlanStatus(planId, 'executed');
```

## Plan States

- `pending` - ממתין לתנאים
- `ready` - מוכן לביצוע
- `executing` - בביצוע
- `executed` - בוצע
- `cancelled` - בוטל

## Status

✅ **ACTIVE** - Integrated with trade plan system

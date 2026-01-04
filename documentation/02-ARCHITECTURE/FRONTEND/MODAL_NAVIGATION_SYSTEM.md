# Modal Navigation System

## Overview

מערכת ניווט stack של מודלים עם breadcrumb ו-backdrop מאוחד.

## File

- `trading-ui/scripts/modal-navigation-manager.js`

## Features

- ניהול stack מודלים
- breadcrumb navigation
- backdrop מאוחד
- תמיכה בניווט עמוק

## API

```javascript
// פתיחת מודל חדש
ModalNavigation.push('trade-edit', { tradeId: 123 });

// חזרה למודל קודם
ModalNavigation.pop();

// חזרה לשורש
ModalNavigation.popToRoot();

// קבלת breadcrumb נוכחי
const breadcrumb = ModalNavigation.getBreadcrumb();
```

## Navigation States

- **Root** - מודל ראשי
- **Child** - מודל בתוך stack
- **Modal** - מודל צף

## Status

✅ **ACTIVE** - Used for complex modal workflows

# Translation Functions

## Overview

טיפול במחרוזות, בחירת שפה ותמיכה ב-RTL.

## File

- `trading-ui/scripts/translation-utils.js`

## Features

### Language Management

- זיהוי שפה נוכחית
- החלפת שפה דינמית
- שמירת העדפת שפה
- Fallback לברירת מחדל

### Text Translation

- תרגום מחרוזות סטטיות
- תרגום דינמי עם parameters
- תרגום plural forms
- תרגום עם context

### RTL Support

- זיהוי כיוון טקסט
- התאמת UI לכיוון
- תמיכה ב-mixed content

## API

```javascript
// תרגום פשוט
const text = Translation.get('save_button');

// תרגום עם parameters
const message = Translation.get('items_selected', { count: 5 });

// תרגום עם plural
const result = Translation.plural('item', 3); // "3 פריטים"

// החלפת שפה
await Translation.setLanguage('he');

// קבלת שפה נוכחית
const currentLang = Translation.getCurrentLanguage();
```

## Translation Files

```
locales/
├── en.json
├── he.json
└── ar.json
```

## Status

✅ **ACTIVE** - Multi-language support

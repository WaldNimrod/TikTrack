# רשימת מלאה של משתני צבעים במערכת TikTrack
**תאריך:** 14 אוקטובר 2025  
**מטרה:** מיפוי מלא של כל משתני הצבעים במערכת לצורך המרה לצבעים דינאמיים

---

## 📚 מקורות משתני הצבעים

### 1. קבצי ITCSS Settings (01-settings/)

#### `_variables.css` - משתנים גלובליים
```css
/* צבעי Apple System - קבועים */
--apple-blue: #007AFF
--apple-blue-dark: #0056CC
--logo-orange: #ff9e04
--apple-gray-1: #F2F2F7
--apple-gray-2: #E5E5EA
--apple-gray-3: #D1D1D6
--apple-gray-4: #C7C7CC
--apple-gray-5: #AEAEB2
--apple-gray-6: #8E8E93
--apple-gray-7: #636366
--apple-gray-8: #48484A
--apple-gray-9: #3A3A3C
--apple-gray-10: #2C2C2E
--apple-gray-11: #1C1C1E
--apple-red: #FF3B30
--apple-red-dark: #D70015
--apple-green: #34C759
--apple-green-dark: #248A3D
--apple-orange: #FF9500
--apple-orange-dark: #CC7700
--apple-yellow: #FFCC02
--apple-purple: #AF52DE
--apple-pink: #FF2D92

/* רקעים - קבועים */
--apple-bg-primary: #FFFFFF
--apple-bg-secondary: #F2F2F7
--apple-bg-tertiary: #FFFFFF
--apple-bg-elevated: #FFFFFF

/* טקסט - קבועים */
--apple-text-primary: #000000
--apple-text-secondary: #3C3C43
--apple-text-tertiary: #3C3C4399
--apple-text-quaternary: #3C3C434D
--color-text-primary: #000000
--color-text-secondary: #6c757d
--color-text-muted: #868e96
--color-text-primary-dark: #212529

/* גבולות - קבועים */
--apple-border: #C6C6C8
--apple-border-light: #E5E5EA
```

#### `_colors-dynamic.css` - צבעים דינמיים (נטענים מה-API)
```css
/* צבעים ראשיים - DYNAMIC */
--primary-color: var(--user-primary-color, #26baac)
--chart-primary-color: var(--user-chart-primary-color, #1d8b7d)
--secondary-color: var(--user-secondary-color, #6c757d)

/* צבעי מערכת בסיסיים - DYNAMIC */
--success-color: var(--user-success-color, #28a745)
--warning-color: var(--user-warning-color, #ffc107)
--danger-color: var(--user-danger-color, #dc3545)
--info-color: var(--user-info-color, #17a2b8)
--light-color: var(--user-light-color, #f8f9fa)
--dark-color: var(--user-dark-color, #343a40)

/* צבעי רקע וטקסט - DYNAMIC */
--card-background: var(--user-card-background, #ffffff)
--input-background: var(--user-input-background, #ffffff)
--text-color: var(--user-text-color, #212529)
--text-muted: var(--user-text-muted, #6c757d)
--border-color: var(--user-border-color, #dee2e6)

/* צבעי hover - DYNAMIC */
--primary-hover: var(--user-primary-hover, #0056b3)
--secondary-hover: var(--user-secondary-hover, #545b62)
--success-hover: var(--user-success-hover, #1e7e34)
--warning-hover: var(--user-warning-hover, #e0a800)
--danger-hover: var(--user-danger-hover, #c82333)
--info-hover: var(--user-info-hover, #138496)

/* צבעי רקע עם שקיפות - DYNAMIC */
--success-background: var(--user-success-background, rgba(40, 167, 69, 0.1))
--warning-background: var(--user-warning-background, rgba(255, 193, 7, 0.1))
--danger-background: var(--user-danger-background, rgba(220, 53, 69, 0.1))
--info-background: var(--user-info-background, rgba(23, 162, 184, 0.1))

/* צבעי גרפים - DYNAMIC */
--chart-background-color: var(--user-chart-background-color, #ffffff)
--chart-text-color: var(--user-chart-text-color, #212529)
--chart-grid-color: var(--user-chart-grid-color, #e9ecef)
--chart-border-color: var(--user-chart-border-color, #dee2e6)
--chart-point-color: var(--user-chart-point-color, #007bff)

/* צבעי ישויות - DYNAMIC (8 ישויות) */
--entity-trade-color: var(--user-entity-trade-color, #26baac)
--entity-trade-bg: var(--user-entity-trade-bg, rgba(38, 186, 172, 0.1))
--entity-trade-text: var(--user-entity-trade-text, #1d8b7d)
--entity-trade-border: var(--user-entity-trade-border, rgba(38, 186, 172, 0.3))

--entity-trade-plan-color: var(--user-entity-trade-plan-color, #8e44ad)
--entity-trade-plan-bg: var(--user-entity-trade-plan-bg, rgba(142, 68, 173, 0.1))
--entity-trade-plan-text: var(--user-entity-trade-plan-text, #6c358f)
--entity-trade-plan-border: var(--user-entity-trade-plan-border, rgba(142, 68, 173, 0.3))

--entity-execution-color: var(--user-entity-execution-color, #2c3e50)
--entity-execution-bg: var(--user-entity-execution-bg, rgba(44, 62, 80, 0.1))
--entity-execution-text: var(--user-entity-execution-text, #1a2633)
--entity-execution-border: var(--user-entity-execution-border, rgba(44, 62, 80, 0.3))

--entity-account-color: var(--user-entity-account-color, #5499c7)
--entity-account-bg: var(--user-entity-account-bg, rgba(84, 153, 199, 0.1))
--entity-account-text: var(--user-entity-account-text, #3d7399)
--entity-account-border: var(--user-entity-account-border, rgba(84, 153, 199, 0.3))

--entity-cash-flow-color: var(--user-entity-cash-flow-color, #d4a574)
--entity-cash-flow-bg: var(--user-entity-cash-flow-bg, rgba(212, 165, 116, 0.1))
--entity-cash-flow-text: var(--user-entity-cash-flow-text, #a07f56)
--entity-cash-flow-border: var(--user-entity-cash-flow-border, rgba(212, 165, 116, 0.3))

--entity-ticker-color: var(--user-entity-ticker-color, #229954)
--entity-ticker-bg: var(--user-entity-ticker-bg, rgba(34, 153, 84, 0.1))
--entity-ticker-text: var(--user-entity-ticker-text, #1a7340)
--entity-ticker-border: var(--user-entity-ticker-border, rgba(34, 153, 84, 0.3))

--entity-alert-color: var(--user-entity-alert-color, #e67e22)
--entity-alert-bg: var(--user-entity-alert-bg, rgba(230, 126, 34, 0.1))
--entity-alert-text: var(--user-entity-alert-text, #b85f1a)
--entity-alert-border: var(--user-entity-alert-border, rgba(230, 126, 34, 0.3))

--entity-note-color: var(--user-entity-note-color, #a29bfe)
--entity-note-bg: var(--user-entity-note-bg, rgba(162, 155, 254, 0.1))
--entity-note-text: var(--user-entity-note-text, #7e75cc)
--entity-note-border: var(--user-entity-note-border, rgba(162, 155, 254, 0.3))
```

#### `_colors-semantic.css` - צבעים סמנטיים
```css
/* צבעי הצלחה/שגיאה/אזהרה - STATIC (יש fallback בהעדפות) */
--color-success: #28a745
--color-success-light: #d4edda
--color-success-border: #c3e6cb

--color-danger: #dc3545
--color-danger-light: #f8d7da
--color-danger-border: #f5c6cb

--color-warning: #ffc107
--color-warning-light: #fff3cd
--color-warning-border: #ffeaa7

--color-info: #007bff
--color-info-light: #d1ecf1
--color-info-border: #bee5eb

/* צבעי סטטוסים - DYNAMIC */
--status-open-color: var(--user-status-open-color, #28a745)
--status-closed-color: var(--user-status-closed-color, #6c757d)
--status-cancelled-color: var(--user-status-cancelled-color, #dc3545)

/* ערכים מספריים - DYNAMIC */
--numeric-positive-color: var(--user-value-positive-color, #28a745)
--numeric-negative-color: var(--user-value-negative-color, #dc3545)
--numeric-zero-color: var(--user-value-neutral-color, #6c757d)

/* סוגי השקעה - DYNAMIC */
--type-swing-color: var(--user-type-swing-color, #007bff)
--type-investment-color: var(--user-type-investment-color, #28a745)
--type-passive-color: var(--user-type-passive-color, #6c757d)

/* עדיפויות - DYNAMIC */
--priority-high-color: var(--user-priority-high-color, #dc3545)
--priority-medium-color: var(--user-priority-medium-color, #ffc107)
--priority-low-color: var(--user-priority-low-color, #28a745)
```

---

## 📊 סיכום משתני צבעים לפי קטגוריות

### 🎨 צבעי Apple System (קבועים) - 21 משתנים
- Apple Blues (2)
- Apple Grays (11)
- Apple Colors (6)
- Logo Orange (1)
- Apple Text & Border (1)

### 🏢 צבעי רקע וטקסט (חלקם דינאמיים) - 13 משתנים
- רקעים (4)
- טקסטים (5)
- גבולות (2)
- כרטיסים (2)

### 🌈 צבעי מערכת בסיסיים (דינאמיים) - 6 משתנים
- Success, Warning, Danger, Info, Light, Dark

### 🎯 צבעי ישויות (דינאמיים) - 32 משתנים (8 ישויות × 4 וריאנטים)
- Trade, Trade Plan, Execution, Account, Cash Flow, Ticker, Alert, Note

### 📈 צבעי גרפים (דינאמיים) - 5 משתנים
- Background, Text, Grid, Border, Point

### 🏷️ צבעי סטטוסים (דינאמיים) - 3 משתנים
- Open, Closed, Cancelled

### 💰 צבעי ערכים מספריים (דינאמיים) - 3 משתנים
- Positive, Negative, Neutral

### 📊 צבעי סוגי השקעה (דינאמיים) - 3 משתנים
- Swing, Investment, Passive

### ⚡ צבעי עדיפויות (דינאמיים) - 3 משתנים
- High, Medium, Low

### 🎨 צבעי Hover (דינאמיים) - 6 משתנים
- Primary, Secondary, Success, Warning, Danger, Info

---

## 🔢 סיכום סופי

| קטגוריה | מספר משתנים | סוג |
|---------|-------------|-----|
| **צבעי Apple System** | 21 | קבועים (Static) |
| **צבעי רקע וטקסט** | 13 | מעורב |
| **צבעי מערכת בסיסיים** | 6 | דינאמיים |
| **צבעי ישויות** | 32 | דינאמיים |
| **צבעי גרפים** | 5 | דינאמיים |
| **צבעי סטטוסים** | 3 | דינאמיים |
| **צבעי ערכים מספריים** | 3 | דינאמיים |
| **צבעי סוגי השקעה** | 3 | דינאמיים |
| **צבעי עדיפויות** | 3 | דינאמיים |
| **צבעי Hover** | 6 | דינאמיים |
| **סה"כ** | **95** | - |

---

## 📋 רשימה מלאה לפי מערכת ההעדפות

### מערכת ההעדפות (110 העדפות צבעים)

#### Basic UI Colors (6)
1. `primaryColor` - צבע ראשי
2. `secondaryColor` - צבע משני
3. `successColor` - צבע הצלחה
4. `warningColor` - צבע אזהרה
5. `dangerColor` - צבע סכנה
6. `chartPrimaryColor` - צבע ראשי לגרפים

#### Entity Colors (24 - 8 ישויות × 3 וריאנטים)
7-9. Trade: `entityTradeColor`, `entityTradeColorLight`, `entityTradeColorDark`
10-12. Trade Plan: `entityTradePlanColor`, `entityTradePlanColorLight`, `entityTradePlanColorDark`
13-15. Execution: `entityExecutionColor`, `entityExecutionColorLight`, `entityExecutionColorDark`
16-18. Account: `entityAccountColor`, `entityAccountColorLight`, `entityAccountColorDark`
19-21. Cash Flow: `entityCashFlowColor`, `entityCashFlowColorLight`, `entityCashFlowColorDark`
22-24. Ticker: `entityTickerColor`, `entityTickerColorLight`, `entityTickerColorDark`
25-27. Alert: `entityAlertColor`, `entityAlertColorLight`, `entityAlertColorDark`
28-30. Note: `entityNoteColor`, `entityNoteColorLight`, `entityNoteColorDark`

#### Status Colors (3)
31. `statusOpenColor` - סטטוס פתוח
32. `statusClosedColor` - סטטוס סגור
33. `statusCancelledColor` - סטטוס מבוטל

#### Type Colors (3)
34. `typeSwingColor` - סווינג
35. `typeInvestmentColor` - השקעה
36. `typePassiveColor` - פסיבי

#### Priority Colors (3)
37. `priorityHighColor` - עדיפות גבוהה
38. `priorityMediumColor` - עדיפות בינונית
39. `priorityLowColor` - עדיפות נמוכה

#### Value Colors (3)
40. `valuePositiveColor` - ערכים חיוביים
41. `valueNegativeColor` - ערכים שליליים
42. `valueNeutralColor` - ערכים ניטרליים

#### Chart Colors (6)
43. `chartBackgroundColor` - רקע גרף
44. `chartTextColor` - טקסט בגרף
45. `chartGridColor` - רשת בגרף
46. `chartBorderColor` - מסגרת גרף
47. `chartPointColor` - נקודות בגרף
48. `chartLineColor` - קווים בגרף (אם קיים)

---

## 🎯 המלצות להמשך

### משתנים שצריך להישאר קבועים (Static):
1. **צבעי Apple System** (21) - אלו הם צבעי הבסיס של העיצוב ולא צריכים להיות דינאמיים
2. **צבעי גבולות בסיסיים** - `--apple-border`, `--apple-border-light`
3. **צללים** - כל משתני הצללים (`--apple-shadow-*`)
4. **רדיוסים** - כל משתני הבורדר-רדיוס

### משתנים שכבר דינאמיים ועובדים:
- ✅ צבעי ישויות (32)
- ✅ צבעי סטטוסים (3)
- ✅ צבעי סוגי השקעה (3)
- ✅ צבעי עדיפויות (3)
- ✅ צבעי ערכים מספריים (3)

---

**סה"כ משתני צבעים במערכת:** 95  
**משתנים דינאמיים (מחוברים להעדפות):** 64  
**משתנים קבועים (סטטיים):** 31

**תאריך:** 14 אוקטובר 2025  
**גרסה:** 1.0


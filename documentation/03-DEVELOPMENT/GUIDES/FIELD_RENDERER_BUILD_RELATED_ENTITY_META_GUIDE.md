# מדריך לפונקציה buildRelatedEntityMeta
## Field Renderer Service - buildRelatedEntityMeta Guide

**תאריך יצירה:** 21 בינואר 2025  
**גרסה:** 1.0.0  
**מערכת:** Field Renderer Service  
**קובץ:** `trading-ui/scripts/services/field-renderer-service.js`

---

## 📋 סקירה כללית

הפונקציה `buildRelatedEntityMeta` היא פונקציה כללית מרכזית לבניית metadata עבור רינדור ישויות מקושרות בטבלאות. הפונקציה מחליפה קוד כפול ומקומי שהיה קיים ב-`notes.js` ו-`alerts.js`, ומאפשרת רינדור אחיד של עמודת "אובייקט מקושר" בכל העמודים.

### מטרה
- **אחידות:** רינדור אחיד של ישויות מקושרות בכל העמודים
- **תחזוקה:** קוד מרכזי במקום אחד במקום כפילות
- **גמישות:** תמיכה בכל סוגי הישויות (Account, Trade, Trade Plan, Ticker)

---

## 🔧 חתימת הפונקציה

```javascript
static buildRelatedEntityMeta(relatedTypeId, relatedId, additionalData = {}, options = {})
```

### פרמטרים

| פרמטר | סוג | חובה | תיאור |
|--------|-----|------|-------|
| `relatedTypeId` | `number\|string` | כן | סוג הישות: `1`=Account, `2`=Trade, `3`=Trade Plan, `4`=Ticker |
| `relatedId` | `number\|string` | כן | מזהה הישות (ID) |
| `additionalData` | `Object` | לא | אובייקט עם מערכים של נתונים: `{ accounts, trades, tradePlans, tickers }` |
| `options` | `Object` | לא | אפשרויות נוספות (כרגע לא בשימוש) |

### ערך החזרה

```javascript
{
  displayName: string,      // שם לתצוגה (סימבול לטיקרים/טריידים, שם לחשבונות)
  metaForEntity: Object    // metadata מוכן לשימוש ב-renderLinkedEntity
}
```

---

## 📊 סוגי ישויות נתמכים

### 1. Trading Account (relatedTypeId = 1)

**displayName:**
- שם החשבון (`account.name` או `account.account_name`)
- Fallback: `חשבון מסחר {id}`

**metaForEntity:**
```javascript
{
  renderMode: 'notes-table',
  name: string,           // שם החשבון
  status: string,         // סטטוס החשבון
  currency: string        // סמל מטבע
}
```

### 2. Trade (relatedTypeId = 2)

**displayName:**
- סימבול הטיקר (`trade.ticker_symbol` או `trade.ticker.symbol`)
- Fallback: `null` (לא מזהה!)

**metaForEntity:**
```javascript
{
  renderMode: 'notes-table',
  ticker: string,         // סימבול הטיקר (רק סימבול, לא ID)
  date: DateEnvelope,     // תאריך יצירה/פתיחה
  date_envelope: DateEnvelope,
  status: string,         // סטטוס הטרייד
  side: string,           // צד (Long/Short)
  investment_type: string // סוג השקעה
}
```

### 3. Trade Plan (relatedTypeId = 3)

**displayName:**
- סימבול הטיקר (`plan.ticker.symbol` או `plan.ticker_symbol`)
- Fallback: `null` (לא מזהה!)

**metaForEntity:**
```javascript
{
  renderMode: 'notes-table',
  ticker: string,         // סימבול הטיקר (רק סימבול, לא ID)
  date: DateEnvelope,     // תאריך יצירה
  date_envelope: DateEnvelope,
  status: string,         // סטטוס התוכנית
  side: string,           // צד (Long/Short)
  investment_type: string, // סוג השקעה
  planned_amount: number  // סכום מתוכנן
}
```

### 4. Ticker (relatedTypeId = 4)

**displayName:**
- סימבול הטיקר (`ticker.symbol`)
- Fallback: `null` (לא מזהה!)

**metaForEntity:**
```javascript
{
  renderMode: 'notes-table',
  ticker: string,         // סימבול הטיקר (רק סימבול, לא ID)
  status: string          // סטטוס הטיקר
}
```

---

## 💡 דוגמאות שימוש

### דוגמה 1: רינדור Trade בטבלת הערות

```javascript
// טעינת נתונים נוספים
const additionalData = await loadAdditionalNotesData();
// additionalData = { accounts: [], trades: [tradeObj], tradePlans: [], tickers: [tickerObj] }

// בניית metadata
const { displayName, metaForEntity } = window.FieldRendererService.buildRelatedEntityMeta(
  2,  // Trade
  123, // ID של הטרייד
  additionalData
);

// רינדור
const relatedCellHtml = window.FieldRendererService.renderLinkedEntity(
  2,  // relatedType
  123, // relatedId
  displayName,
  metaForEntity
);

// הוספה לטבלה
row.innerHTML = `<td class="related-cell">${relatedCellHtml}</td>`;
```

### דוגמה 2: רינדור Account בטבלת התראות

```javascript
const dataSources = {
  accounts: accountsArray,
  trades: tradesArray,
  tradePlans: tradePlansArray,
  tickers: tickersArray
};

const { displayName, metaForEntity } = window.FieldRendererService.buildRelatedEntityMeta(
  1,  // Trading Account
  456, // ID של החשבון
  dataSources
);

const relatedCellHtml = window.FieldRendererService.renderLinkedEntity(
  1,
  456,
  displayName,
  metaForEntity
);
```

### דוגמה 3: שימוש ב-shortcut גלובלי

```javascript
// ניתן להשתמש גם ב-shortcut גלובלי
const { displayName, metaForEntity } = window.buildRelatedEntityMeta(
  2,  // Trade
  123,
  additionalData
);
```

---

## ⚠️ הערות חשובות

### 1. סימבולים בלבד, לא מזההים
- **חשוב:** עבור Trade, Trade Plan ו-Ticker, `displayName` תמיד מכיל **רק סימבול** (או `null`), **לא מזהה**!
- **לא נכון:** `displayName = "טרייד 123"` ❌
- **נכון:** `displayName = "AAPL"` או `null` ✅

### 2. מבנה additionalData
הפונקציה מצפה לאובייקט עם המבנה הבא:
```javascript
{
  accounts: Array,      // מערך של חשבונות מסחר
  trades: Array,        // מערך של טריידים
  tradePlans: Array,   // מערך של תוכניות מסחר
  tickers: Array       // מערך של טיקרים
}
```

### 3. תאריכים
- הפונקציה משתמשת ב-`window.dateUtils.ensureDateEnvelope` אם זמין
- Fallback לערכים גולמיים אם `dateUtils` לא זמין
- תאריכים מוחזרים כ-`DateEnvelope` objects

### 4. renderMode
- ברירת המחדל היא `'notes-table'` - מתאים לרינדור בטבלאות
- ניתן לשנות ב-`metaForEntity` אם נדרש

---

## 🔄 אינטגרציה עם renderLinkedEntity

הפונקציה `buildRelatedEntityMeta` מיועדת לשימוש יחד עם `renderLinkedEntity`:

```javascript
// שלב 1: בניית metadata
const { displayName, metaForEntity } = FieldRendererService.buildRelatedEntityMeta(
  relatedTypeId,
  relatedId,
  additionalData
);

// שלב 2: רינדור
const html = FieldRendererService.renderLinkedEntity(
  relatedTypeId,
  relatedId,
  displayName,
  metaForEntity
);
```

---

## 📝 היסטוריית שינויים

### גרסה 1.0.0 (21 בינואר 2025)
- יצירת הפונקציה הכללית
- החלפת קוד כפול ב-`notes.js` ו-`alerts.js`
- תמיכה ב-4 סוגי ישויות: Account, Trade, Trade Plan, Ticker
- הבטחת תצוגת סימבולים בלבד (לא מזההים) עבור Trade/Trade Plan/Ticker

---

## 🔗 קישורים רלוונטיים

- **קובץ הקוד:** `trading-ui/scripts/services/field-renderer-service.js`
- **רשימת מערכות כלליות:** [GENERAL_SYSTEMS_LIST.md](../../frontend/GENERAL_SYSTEMS_LIST.md)
- **Field Renderer Service:** ראה תיעוד כללי של השירות
- **renderLinkedEntity:** ראה תיעוד של `renderLinkedEntity` לשימוש משולב

---

## ✅ בדיקות מומלצות

1. **בדיקת סימבולים:** וודא ש-`displayName` מכיל רק סימבול (לא מזהה) עבור Trade/Trade Plan/Ticker
2. **בדיקת fallback:** וודא ש-`displayName` הוא `null` (לא מחרוזת עם מזהה) כשאין סימבול
3. **בדיקת תאריכים:** וודא ש-`date` ו-`date_envelope` מוחזרים כ-`DateEnvelope` objects
4. **בדיקת Account:** וודא ש-`displayName` מכיל שם חשבון (לא מזהה) עבור Account

---

**מחבר:** TikTrack Development Team  
**עדכון אחרון:** 21 בינואר 2025


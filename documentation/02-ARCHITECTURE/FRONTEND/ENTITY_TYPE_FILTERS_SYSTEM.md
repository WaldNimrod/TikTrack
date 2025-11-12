# Entity Type Filters System – Documentation
## ========================================

**File:** `trading-ui/scripts/related-object-filters.js`
**Version:** 4.0
**Last Updated:** 2025-11-12
**Owner:** TikTrack Development Team

---

## Overview

מערכת הפילטרים לפי סוג ישות אחראית על הפעלת פילטרים לוגיים (Account / Trade / Trade Plan / Ticker וכו') בכל מקום במערכת. החל מגרסה 4.0 המערכת היא חלק אינטגרלי מאופציית ה-Table Integration Option A: כל פעולה ב-UI מוזרמת דרך `UnifiedTableSystem.filter.apply`, הנתונים מסוננים ברמת `TableDataRegistry`, וכל הצרכנים המשניים (פאג'ינציה, InfoSummarySystem, כרטיסיות חישוב) מקבלים את אותה תוצאה.

---

## Option A Integration Snapshot

- **Canonical Data Source:** `filterByRelatedObjectType` → `UnifiedTableSystem.filter.apply` → `TableDataRegistry.setFilteredData`.
- **Multi-Target Update:** טבלת היעד, פאג'ינציה, InfoSummarySystem, כרטיסיות Dashboard/Trading Accounts.
- **Custom Context:** הערך נשמר ב-`TableDataRegistry.meta.activeFilters.custom.relatedType` לכל טבלה.
- **Debounced UI:** שינוי כפתורים, שמירת מצב (PageStateManager), והפעלת `filterSystem.triggerFilterUpdate` של ה-Header System.
- **Legacy Fallback:** אם UnifiedTableSystem אינו זמין, קיים סינון Array מקומי כדי למנוע רגרסיה ב-UAT.

---

## Architecture Overview

### File Structure

```
trading-ui/scripts/related-object-filters.js
├── filterByRelatedObjectType()          # נקודת כניסה אחידה
├── filterAlertsByRelatedObjectType()    # עטיפה לעמוד ההתראות
├── filterNotesByRelatedObjectType()     # עטיפה לעמוד ההערות
├── createRelatedObjectFilter()          # יצירת עטיפות ישויות נוספות
├── legacyFilterRelatedObjects()         # fallback לוגיקה מקומית
├── generateEntityTypeFilterButtons()    # HTML לכפתורים
├── generateEntityTypeFilterButton()
└── generateAllFilterButton()
```

### Canonical Flow (Unified Mode)

1. המשתמש בוחר פילטר (Header / מודול פרטים / כפתור דינמי).
2. `filterByRelatedObjectType`:
   - מעדכן מצבי כפתורים וצבעים.
   - גוזר `tableType` מתוך `options.tableType` או `TableDataRegistry.resolveTableType(tableId)`.
   - קורא ל-`UnifiedTableSystem.filter.apply(tableType, { custom: { relatedType } }, { mergeWithActiveFilters, tableIdOverride })`.
3. TableFilter:
   - מאחד פילטרים קיימים (`mergeWithActiveFilters`).
   - מפעיל `_matchesCustom()` → `_matchesRelatedType()` עם תמיכה ב-`related_type_id`, `related_type`, `type`.
   - מעדכן את `TableDataRegistry` בנתונים המסוננים + הקשר הפילטרים.
4. מאזיני Registry (פאג'ינציה, InfoSummarySystem, כרטיסיות חישוב) מקבלים טריגר אוטומטי.
5. במידה וה-try-catch מזהה ש-UnifiedTableSystem אינו זמין → `legacyFilterRelatedObjects` מפעיל סינון Array כדי לשמור על UI תקין.

---

## API Reference

### `filterByRelatedObjectType(type, data, updateFn, countSelector, itemName, options = {})`

| פרמטר | Type | תיאור |
|-------|------|--------|
| `type` | `string` | `'account' | 'trade' | 'trade_plan' | 'ticker' | 'all'` |
| `data` | `Array` | מערך מקומי (משמש רק ב-fallback או עבור מספרים לספירה). |
| `updateFn` | `Function` | Callback לעדכון הטבלה (משמש גם על ידי `updateTableWithPagination`). |
| `countSelector` | `string` | אלמנט לביצוע עדכון ספירה (אופציונלי). |
| `itemName` | `string` | טקסט לספירת פריטים (לוגים / UI). |
| `options.tableId` | `string` | מזהה DOM לטבלה (חובה בלינקד אייטמס). |
| `options.tableType` | `string` | שם טבלה בתצורת UnifiedTableSystem (אם ריק → resolve). |
| `options.mergeWithActiveFilters` | `boolean` (default `true`) | מאפשר לשמר פילטרים אחרים (סטטוס, טווח תאריך). |
| `options.logSource` | `string` | תיוג לוגים (Alerts / Notes / Modal). |

**התנהגות:**
- מנסה Unified Flow (שלבים לעיל) ומחזיר את המערך המסונן.
- ב-fallback מחזיר מערך מסונן באמצעות `related_type_id`/`type` ומעדכן את הטבלה ידנית.

### Wrappers

- `filterAlertsByRelatedObjectType(type)` – מוגדר עם `tableId = 'alertsTable'`, `tableType = 'alerts'`.
- `filterNotesByRelatedObjectType(type)` – מוגדר עם `tableId = 'notesTable'`, `tableType = 'notes'`.
- `createRelatedObjectFilter(entityName, dataVarName, updateFnName, itemName, countSelector, options)` – בונה wrapper מותאם (לדוגמה: `filterPositionsByRelatedObjectType`).

### Button Helpers

- `generateEntityTypeFilterButtons(entityTypes, options)` – אוסף כפתורים לפי סדר.
- `generateAllFilterButton(options)` – יוצר כפתור "הכל" ומגדיר אותו כ-active כברירת מחדל.
- `generateEntityTypeFilterButton(entityType, options)` – כפתור יחיד עם איקון מוגדר דרך `LinkedItemsService`.

---

## Usage Patterns

### Alerts Page (Header System)

```html
<div class="filter-buttons-container button-row">
  ${window.generateAllFilterButton({ filterFunctionName: 'filterAlertsByRelatedObjectType' })}
  ${window.generateEntityTypeFilterButtons(['account', 'trade', 'trade_plan', 'ticker'], {
    filterFunctionName: 'filterAlertsByRelatedObjectType'
  })}
</div>
```

### Entity Details (Linked Items Table)

```javascript
const tableId = `linkedItemsTable_${parentEntity}_${parentId}`;
const buttonsHtml = window.generateEntityTypeFilterButtons(
  ['trading_account', 'trade', 'trade_plan', 'ticker', 'execution', 'cash_flow', 'note'],
  {
    filterFunctionName: 'window.filterLinkedItemsByType',
    tableId,
    tableType: `linked_items__${parentEntity}_${parentId}`,
    containerId: `linkedItemsFilter_${tableId}`,
    useDataOnclick: true,
    useTooltips: true,
    iconSize: 20
  }
);
```

---

## Integration Checklist

1. **טעינת קבצים:** `related-object-filters.js` לאחר `LinkedItemsService` ולפני הסקריפט הדף.
2. **רישום טבלה:** ודא שסוג הטבלה (`tableType`) נרשם ב-`UnifiedTableSystem.registry` לפני הפעלת הפילטר.
3. **TableDataRegistry Mapping:** במקרה של טבלאות דינמיות (Linked Items) יש לרשום `registerTable({ tableType, tableId })` ולהזין נתונים באמצעות `setFullData`.
4. **Header System:** הפונקציה `window.filterSystem.triggerFilterUpdate` מאזינה לשינויים ומונעת קריאות כפולות.
5. **Info Summary & Cards:** אין צורך בקוד נוסף – המאזינים של `TableDataRegistry` מפעילים את העדכונים אוטומטית.

---

## Testing & QA

| סוג בדיקה | תרחיש | תוצאה צפויה |
|-----------|--------|---------------|
| Unit | `UnifiedTableSystem.filter.apply` עם `{ custom: { relatedType: 'trade' } }` | מוחזר מערך עם `item.type === 'trade'` ומטא נתונים מעודכן. |
| Integration | פילטר בעמוד התראות + פאג'ינציה + InfoSummary | כל הרכיבים מציגים את אותה כמות רשומות לאחר לחיצה. |
| Modal | מודול פריטי פרטים עבור טיקר → פילטר "execution" | הטבלה מציגה רק רשומות מסוג Execution, הלוג מציין `linked_items__ticker_ID`. |
| Fallback | ניתוק UnifiedTableSystem לצורך בדיקה | המערכת מסננת באמצעות `legacyFilterRelatedObjects` ומעדכנת טבלה אחת ללא Registry. |

---

## Troubleshooting

| סימפטום | סיבה | פתרון |
|----------|-------|---------|
| `TableFilter.apply: Table type "linked_items__..." not registered` | טבלת linked items לא נרשמה לפני הפעלת הפילטר | קרוא ל-`TableDataRegistry.registerTable` ו-`UnifiedTableSystem.registry.register` בעת רינדור הטבלה. |
| Info Summary / כרטיסיות לא מתעדכנים | `setFilteredData` לא נקרא (fallback) | לבדוק לוגים; לוודא שה-try/catch לא נכנס ל-fallback בגלל שגיאה מוקדמת. |
| כפתור נשאר active למרות בחירת אחר | חסר `data-type` על הכפתור או DOM עודכן אחרי הייצור | לשמור על `data-type` ולוודא שהכפתורים נוצרים מחדש בכל רענון רכיב. |
| פילטר "הכל" משאיר פילטר פעיל | הערך המועבר הוא `'all '` (עם רווח) | לבצע trim לפני שליחת הערך (נעשה כבר בפונקציה – לבדוק קריאה חיצונית). |

---

## Related Documentation

- [LINKED_ITEMS_SYSTEM.md](LINKED_ITEMS_SYSTEM.md)
- [INFO_SUMMARY_SYSTEM.md](INFO_SUMMARY_SYSTEM.md)
- [PAGINATION_SYSTEM.md](PAGINATION_SYSTEM.md)
- [TABLE_SYSTEM_ANALYSIS.md](TABLE_SYSTEM_ANALYSIS.md)
- [GENERAL_SYSTEMS_LIST.md](GENERAL_SYSTEMS_LIST.md)

---

## Revision History

| תאריך | גרסה | תיאור |
|-------|------|--------|
| 2025-11-12 | 4.0 | איחוד מלא עם UnifiedTableSystem, TableDataRegistry והוצאת fallback לוגי לקוד נפרד. |
| 2025-11-05 | 3.2 | יצירת מערכת ייצור כפתורים מרכזית (pre-option A). |
| 2025-01-12 | 3.0 | איחוד הפילטרים במודול הפרטים עם LinkedItemsService (גרסת bootstrap). |


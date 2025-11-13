# Table Integration Option A – Implementation Notes (Nov 2025)

**Scope:** Canonical integration of Header Filters, TableDataRegistry, PaginationSystem, InfoSummarySystem, Linked Items, ודפי הבית/חשבונות.

## Summary

| רכיב | שינוי מרכזי | קבצים |
|-------|--------------|-------|
| TableFilter (UnifiedTableSystem) | קלט `custom.relatedType`, מיזוג פילטרים קיימים, שמירת הקשר ב-Registry | `trading-ui/scripts/unified-table-system.js` |
| TableDataRegistry | אחסון activeFilters, חשיפת `getActiveFilters`, הפצת events ל-InfoSummary וכרטיסיות | `trading-ui/scripts/table-data-registry.js` |
| Header System | `applyAllFilters` משתמש ב-TableFilter ומעביר נתונים קנוניים לפאג'ינציה ולטבלאות משנה | `trading-ui/scripts/header-system.js` |
| Linked Items | רישום דינמי (`linked_items__{entity}_{id}`) + פילטר קנוני דרך TableFilter | `trading-ui/scripts/entity-details-renderer.js`, `.../related-object-filters.js` |
| Info Summary | פתרון נתונים דרך TableDataRegistry (filtered → full → fallback) + `tableType` בכל קונפיגורציה | `trading-ui/scripts/info-summary-system.js`, `info-summary-configs.js` |
| Dashboard / Trading Accounts Cards | צריכת נתונים מסוננים (`TableDataRegistry.getFilteredData`) לפני חישוב כרטיסיות וסיכומים | `trading-ui/scripts/index.js`, `trading-ui/scripts/trading_accounts.js` |

## Developer Checklist

1. **הגדרת tableType:**
   - ב-`info-summary-configs.js` לכל עמוד.
   - בטבלאות דינמיות (Linked Items) – שם ייחודי המתאים לרישום.
2. **רישום טבלה:** `UnifiedTableSystem.registry.register` + `TableDataRegistry.registerTable` + `setFullData` לאחר טעינה ראשונית.
3. **הפעלת פילטרים:** שימוש רק ב-`filterByRelatedObjectType` או בעטיפות שנוצרו ע"י `createRelatedObjectFilter`.
4. **PageStateManager:** `TableDataRegistry.meta.activeFilters` מספק הקשר לשמירת מצב פילטרים (אין צורך במבנים נפרדים).
5. **בדיקות:**
   - `npm test -- tests/unit/table-system.test.js`
   - QA ידני: Alerts (פילטרים + Info Summary), Entity Modal (פילטר + פאג'ינציה), Dashboard cards (0 רשומות → תצוגה ריקה).

## User-Facing Changes

- לחיצה על פילטר ישות (Header או מודול פרטים) משפיעה מיידית על כל הסטטיסטיקות והכרטיסיות.
- מצב "הכל" מאפס את הנתונים לכל הרכיבים (כולל ספירות סיכום).
- סינון מודול הפרטים זוכר את הבחירה ומחזיר את אותה תוצאה בפתיחה חוזרת של המודול.

## Follow-up

- **Automation:** להרחיב כיסוי בדיקות אינטגרציה לפילטרים/סיכומים (WIP בתוכנית בדיקות מורחבת).
- **Telemetry:** להוסיף metric ספציפי לפילטרים (מספר לחיצות / טווחי זמן) – לא הוכלל בסבב זה.

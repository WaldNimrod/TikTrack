# Table Pipeline Workflow Guide

מדריך זה מסכם את האופן שבו טבלאות ב־TikTrack חייבות לפעול מרגע טעינת הנתונים ועד להצגת העמודים, ומיועד לכל מפתח שיצטרף בעתיד לצוות.

הוא מכסה את שלב הטעינה, שמירת הנתונים במערכות הכלליות, שילוב הפילטרים (הראשיים והפנימיים), מיון, ופאג׳ינציה – הכל בתיאום עם מערכת המטמון בשני המצבים (Development / Production).

## 1. Canonical Data Flow

1. **Load + Cache** – כל שליפת נתונים עוברת דרך `UnifiedCacheManager`. אין קוד שמטפל אחרת ב־Dev/Prod; ההבדל היחיד הוא שכבת המטמון שמתעוררת (Memory, LocalStorage, IndexedDB או Backend).
2. **TableDataRegistry** – מיד לאחר הטעינה קוראים ל־`updateTableWithPagination` או `PaginationSystem.create`, שמעדכנים:
   - `setFullData(tableType, data)`
   - `setFilteredData(tableType, data)` (לפני הפעלת פילטרים מתקדמים)
   - `setPageData(tableType, pageSlice)` עם metadata של העמוד.
3. **UnifiedTableSystem.register** – ה־`dataGetter` עטוף כדי לשלוף קודם את הנתונים מה־Registry. רק אם אין נתונים שם הוא מפעיל את הפונקציה המקורית ומסנכרן חזרה ל־Registry.

## 2. Filter Integration (Header + Internal)

### Header System (ראש הדף)

- כל העמודים טוענים את `header-system.js` + `filter-system.js`.
- בעת שינוי פילטר:
  1. `UnifiedTableSystem.filter.apply(tableType, filterContext)` מרענן את `TableDataRegistry.filteredData`.
  2. מיד לאחר מכן חובה לקרוא `updateTableWithPagination({ tableId, tableType, skipRegistry: true, render })` כדי שהפאג׳ינציה תחלק את התוצאה החדשה.
  3. `filterSystem.currentFilters` נשמר ב־`PageStateManager` וב־`UnifiedCacheManager`, ולכן חזרה לדף/רענון שומר את הבחירות.

### פילטרים פנימיים (Side Filters, Wizards, Entity Filters)

- חייבים להשתמש ב־`TableFilter` / `related-object-filters.js` כדי להפיק `filterContext` ולהימנע מלוגיקה מקומית.
- אחרי כל שינוי פנימי:  
  `TableDataRegistry.setFilteredData(tableType, filteredArray, { tableId, filterContext })` → `updateTableWithPagination({ skipRegistry: true })`.
- דוגמאות:
  - כפתורי הצד בפורטפוליו (לונג/שורט) קוראים ל־`loadPortfolio`, שמעדכן את הכל דרך אותה pipeline.
  - Entity Filters משתמשים ב־`filterByRelatedObjectType` ומרנדרים מחדש את הפאג׳ינציה בלי קוד ספציפי לעמוד.

## 3. Sorting + Pagination

- **לעולם לא** מרנדרים ישירות את המערך המלא בתוך `updateFunction`. במקום זאת קוראים ל־`sync<Table>Pagination(fullData)` שמזמן את `updateTableWithPagination`.
- `TableRegistry.register` כבר דואג שהמיון יתבצע על הנתונים שב־Registry. לאחר המיון מועבר המערך המסודר אל `sync<Table>Pagination`, כך שהעמודים מחשבים מחדש את ה־slice.
- Render callbacks (`render(pageData, context)`) חייבים להגביל את עצמם להחזרת עמוד בודד וכל לוגיקה נוספת (סיכומים, Counters) צריכה להשתמש ב־`TableDataRegistry.getFilteredData(tableType)`.

## 4. Cache Modes (Dev / Prod)

- אין תנאי `if (isProd)` בקוד. `UnifiedCacheManager` הוא שכבה מאוחדת שמנהלת TTL שונה לכל סוג נתונים, אך הקוד הקורא לה זהה לחלוטין בין הסביבות.
- ב־Dev ניתן לנטר את השכבות דרך ה־Logger (`window.UnifiedCacheManager.debug()`), וב־Prod יש מפתחי ניטור ברקע. אין לכתוב קוד שעוקף מטמון רק בגלל סביבת Dev.

## 5. Checklist ליצירת/תחזוקת טבלה

1. **טעינת נתונים** – דרך שירות/Fetcher שמחזיר מערך אחיד (DateEnvelope, Amount envelopes וכו').
2. **Cache & Registry** – להבטיח שכל טעינה מסתיימת בקריאה ל־`updateTableWithPagination`.
3. **פילטרים** – לבדוק ב־`documentation/PAGES_LIST.md` אילו פילטרים נדרשים בעמוד ולוודא שכולם מזינים את אותה pipeline.
4. **מיון** – `UnifiedTableSystem.registry.register` חייב לקבל `sortable: true` רק אם קיימת פונקציית `sync<Table>Pagination`. אחרת להשאיר `false`.
5. **PageState** – כל טבלה שסומנה כקריטית ברשימת הדפים צריכה לשמור `sort`, `filter`, `pageSize` דרך `PageStateManager` (ע"י קריאה ל־`saveTableState` / `saveSortState` שכבר משתמשות ב־UnifiedCacheManager).
6. **בדיקות** – עבור כל עמוד ברשימה, להריץ לפחות תרחיש ידני:
   - Load → Filter → Sort → Change Page → Refresh.  
   - לוודא שהעמוד נפתח באותו מצב (כולל בחירת פילטרים ועמוד).

## 6. Troubleshooting טבלאות קיימות

- אם המיון משפיע רק על העמוד הנוכחי – בדקו שה־state הגלובלי לא נכתב מחדש במערך המצומצם (page slice). יש להשתמש בשדות ייעודיים כמו `positionsPageData`/`portfolioPagePositions`.
- אם `UnifiedTableSystem.sorter.sort` זורק שאין נתונים – ודאו שהטבלה נרשמה וש־`TableDataRegistry.registerTable` קיבל `tableId`.
- אם header filter לא משפיע – וודאו שהקריאה ל־`updateTableWithPagination` מקבלת `skipRegistry: true` וש`filterSystem.currentFilters` מעודכן לפני ההרצה.

## 7. מקורות קשורים

- `documentation/02-ARCHITECTURE/FRONTEND/TABLE_INTEGRATION_OPTION_A.md`
- `documentation/02-ARCHITECTURE/FRONTEND/TABLE_SORTING_SYSTEM.md`
- `documentation/02-ARCHITECTURE/FRONTEND/PAGINATION_SYSTEM.md`
- `documentation/frontend/GENERAL_SYSTEMS_LIST.md` (ערכים: Pagination System, TableDataRegistry, Header System, UnifiedCacheManager)

---

**עדכון:** 15 נובמבר 2025  
**תחזוקה:** צוות TikTrack Frontend


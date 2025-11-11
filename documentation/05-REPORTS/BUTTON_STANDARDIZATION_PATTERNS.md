# Button Standardization – Conversion Patterns

מסמך זה מפרט את דפוסי ההמרה הנדרשים בכדי ליישר את כל הכפתורים במערכת למערכת הכפתורים המאוחדת (`button-system-init.js`). הדפוסים נשענים על מערכות כלליות קיימות בלבד ומגדירים עבור כל סוג כפתור את המאפיינים, הלוגיקה והאירועים הנלווים.

## 1. מיון טבלאות (`SORT`)
- **מערכת אחראית:** `tables.js` + `unified-table-system.js`
- **רכיב יצירה מועדף:** `window.createSortButtonHelper(container, onclick, classes, attributes, text)`
- **נתונים חובה:**
  - `data-button-type="SORT"`
  - `data-onclick="window.sortTableDataHandler('table_type', columnIndex)"` (ראו להלן)
  - טקסט כותרת העמודה + אייקון המיון (`↕️`) מנוהלים ע"י המערכת
- **אירוע:** מנוהל דרך `EventHandlerManager` בעזרת ערך `data-onclick`
- **לוגיקה מומלצת ל-onclick:** להשתמש בפונקציה קיימת כגון `window.handleSortClick(tableType, columnIndex)` או להגדיר ב-`tables.js` פונקציה גלובלית `window.sortTableHandler = (tableType, columnIndex) => window.sortTableData(columnIndex, window.TABLE_DATA[tableType], tableType, updateFn);`
- **בדיקות:**
  - הדלקה/כיבוי של הסימן `sort-active` לפי מצב המיון (ע"י `tables.js`)
  - שמירת מצב בטבלת `PageStateManager`

## 2. טוגל סקשנים (`TOGGLE`)
- **מערכת אחראית:** `ui-utils.js` (`toggleSection`) + `SectionToggleSystem`
- **רכיב יצירה מועדף:** `window.createToggleButtonHelper(container, "window.toggleSection('sectionId')", title, classes)`
- **נתונים חובה:**
  - `data-button-type="TOGGLE"`
  - `data-onclick="toggleSection('sectionId')"` (ניתן להשאיר ריק – `EventHandlerManager` יזהה ויקשר אוטומטית לפי הסקשן הקרוב)
  - `data-variant="small"` עבור כפתורי כותרת טבלה לפי המינימליזם המבוקש
  - `data-text="הצג/הסתר"` לייצוג טקסטואלי (מוזן למערכת בטולטים)
- **אירוע:** `EventHandlerManager` + fallback auto-wire
- **בדיקות:**
  - שמירת מצב סקשן ב-`PageStateManager`
  - התנהגות RTL (סימון `aria-expanded` אם רלוונטי)

## 3. כפתורי פילטר ופעולות קטנות (`FILTER`, `SECONDARY`, `MENU`)
- **מערכת אחראית:** `FieldRendererService`, `ui-utils.js`, `filter-system`
- **רכיב יצירה מועדף:** `window.createButtonHelper(container, 'FILTER', "window.applyFilter('entity','value')", 'btn-filter', 'data-filter="..."')`
- **נתונים חובה:**
  - `data-button-type` מתאים (`FILTER`, `SECONDARY`, `MENU`, `CHECK` וכו')
  - `data-onclick` מפנה לפונקציה כללית הקיימת כבר (למשל `handlePortfolioSideFilter` בעמוד index – יש לוודא שהפונקציה חשופה על `window`)
  - `data-variant` לפי הצורך (`small`, `pill`, `outline`)
  - `data-entity-type` במידה ויש גווני צבע ייעודיים (ע"פ `AdvancedButtonSystem.ENTITY_COLOR_MAP`)
- **אירוע:** דרך `EventHandlerManager`
- **בדיקות:**
  - שמירת סטטוס בעזרת `PageStateManager`
  - אינטראקציה עם `filter-system.js` (אין לגעת בראש הדף)

## 4. כפתורי CRUD (`ADD`, `SAVE`, `EDIT`, `DELETE`, `CANCEL`, `REACTIVATE`)
- **מערכת אחראית:** `button-helpers.js` + `ModalManagerV2` + `CRUDResponseHandler`
- **רכיב יצירה מועדף:** `createButtonHelper`, `createEditButtonHelper`, `createDeleteButtonByTypeHelper`, `createCancelButtonHelper`
- **נתונים חובה:**
  - `data-button-type` בהתאם לפעולה
  - `data-onclick` מפנה לפונקציה קיימת (למשל `window.showModalSafe('tradingAccountsModal','add')`)
  - `data-entity-type` ו-`data-item-id` לשימוש בצבע וריסוסים
  - טקסט/tooltip מנוהל ע"י `BUTTON_TEXTS`
- **אירוע:** מתבצע דרך `EventHandlerManager`; פונקציות CRUD צריכות להחזיר Promise או לטפל בשגיאות דרך `CRUDResponseHandler`
- **בדיקות:**
  - הפעלת מודלים/CRUD קיימים
  - שילוב עם מערכת הלינקד-אייטמס אם קיים (`LinkedItemsService`)

## 5. כפתורי טבלאות מתקדמים (Actions Menu)
- **מערכת אחראית:** `modules/actions-menu-system.js`
- **רכיב יצירה מועדף:** `loadTableActionButtons(tableId, entityType, config)`
- **המרה נדרשת:** לוודא שהמערכת מייצרת כפתורים עם `data-button-type` (במידה ועדיין קיימות יציאות ישירות – לעדכן את ה-builders בקובץ זה)
- **בדיקות:**
  - ניהול Tooltip
  - שילוב עם `LinkedItemsService` ו-`ModalManagerV2`

## 6. הפניות אירועיות כלליות
- כל כפתור חייב להשתמש ב-`data-onclick` בלבד. בשום מקרה אין להשאיר `onclick`.
- פונקציות `data-onclick` צריכות להיות מוגדרות כ-`window.someFunction = () => { ... }` בקובצי העמוד או במודולים כלליים קיימים.
- אין ליצור פונקציות חדשות לפני בדיקה שהן לא קיימות ב-`ui-utils.js`, `notification-system.js`, `tables.js`, `main.js` או שירותים אחרים. אם לא קיימות – לתעד בקובץ זה ולהוסיף דרך מערכת השירותים.

## 7. בדיקות אוטומטיות ואימות ידני
1. להריץ `python3 scripts/analyze_user_pages_buttons.py` ולוודא שמספר הכפתורים הרגילים = 0 (מלבד ראש הדף).
2. להריץ בדיקות פונקציונליות על כל 14 העמודים:
   - מיון טבלאות (כפול ציר)
   - פתיחה/סגירה של כל סקשן
   - הפעלת פילטרים, שמירת העדפות, CRUD מלא
3. לעבור על קבצי ה-JS המשותפים שהוגדרו ב-`BUTTON_SHARED_SCRIPT_SCAN.md` ולסמן בכל אחד שהייצור משתמש ב-Button System.

## 8. מעקב אחר יישום
- לכל שינוי יש לציין בקובץ ההיסטוריה את התאריך, הקובץ ופורמט הכפתורים שהומר.
- הטבלה הסופית (`BUTTON_STANDARDIZATION_SUMMARY.md`) תאסוף את מצב ההמרה לכל עמוד ולכל מערכת כללית.

מסמך זה משרת כסטנדרט עבודה בזמן ההמרה ומוודא שכל הצוות משתמש באותם דפוסים.

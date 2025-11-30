# מפרט מוקאפים: Watch List
## Mockup Specification: Watch List System

**תאריך:** 28 בינואר 2025  
**גרסה:** 1.0.0

---

## מוקאפים שנוצרו

### 1. עמוד ראשי
**קובץ:** `trading-ui/mockups/watch-lists-page.html`

**תכונות:**
- ✅ מבנה סטנדרטי לפי תבנית העמוד
- ✅ ITCSS מלא
- ✅ Header System (unified-header)
- ✅ 4 Sections: Top, Lists Grid, Active List, Flagged Tickers
- ✅ 3 רשימות לדוגמה
- ✅ 4 טיקרים לדוגמה בטבלה
- ✅ 3 תצוגות (Table, Cards, Compact) - Table פעיל
- ✅ Quick actions לדגלים
- ✅ Drag handles
- ✅ Summary stats cards

**Sections:**
1. **Top Section**: Header + Summary Stats (4 cards)
2. **Watch Lists Grid**: 3 cards לדוגמה
3. **Active List View**: Table view עם 4 טיקרים
4. **Flagged Tickers**: Section עם filter buttons

---

### 2. Modal - Add/Edit Watch List
**קובץ:** `trading-ui/mockups/watch-list-modal.html`

**תכונות:**
- ✅ Form עם כל השדות
- ✅ Name (required)
- ✅ Icon selector
- ✅ Color picker
- ✅ View mode selector
- ✅ Validation hints

---

### 3. Modal - Add Ticker
**קובץ:** `trading-ui/mockups/add-ticker-modal.html`

**תכונות:**
- ✅ Search ticker מהמערכת
- ✅ Search results עם typeahead
- ✅ External ticker input
- ✅ Optional: Flag + Notes
- ✅ Two-step flow: System ticker OR External

---

### 4. Quick Action - Flag Palette
**קובץ:** `trading-ui/mockups/flag-quick-action.html`

**תכונות:**
- ✅ 8 צבעי דגלים (grid 4x2)
- ✅ Hover effects
- ✅ Active state
- ✅ Remove flag button
- ✅ Compact popup design

---

## אינטגרציות במוקאפ

### Button System
- כל הכפתורים משתמשים ב-`data-button-type`
- `data-onclick` לפעולות

### Icon System
- כל האיקונים דרך `<img>` עם paths מ-`images/icons/tabler/`
- Prepared ל-IconSystem integration

### Section Toggle
- כל Sections עם `data-section`
- Toggle buttons עם `toggleSection()`

### View Modes
- 3 תצוגות מוכנות
- JavaScript needed ל-switching

---

## דוגמאות נתונים

### Watch Lists
1. **מניות טכנולוגיה** - 15 טיקרים, איקון chart-line, צבע #26baac
2. **אנרגיה** - 12 טיקרים, איקון flame, צבע #fc5a06
3. **קריפטו** - 15 טיקרים, איקון coins, צבע #28a745

### Watch List Items
1. **AAPL** - במערכת, דגל #26baac, מחיר $150.25, +1.42%
2. **MSFT** - במערכת, דגל #fc5a06, מחיר $378.90, -0.39%
3. **TSLA** - חיצוני, ללא דגל, מחיר $245.80, -0.85%
4. **GOOGL** - במערכת, ללא דגל, מחיר $142.30, +3.79%

---

## נקודות לבדיקה

### UI/UX
- [ ] Cards grid responsive
- [ ] Table scrollable על mobile
- [ ] Flag palette positioning
- [ ] Drag & drop visual feedback
- [ ] Empty states

### אינטגרציות
- [ ] Button System עובד
- [ ] Icon paths נכונים
- [ ] Section toggles עובדים
- [ ] Modal opening/closing

---

## הערות מימוש

### JavaScript Needed
- Page logic: `watch-lists.js`
- Data service: `watch-lists-data.js`
- UI service: `watch-lists-ui-service.js`

### Styling
- Watch list card styles (inline במוקאפ)
- Flag palette styles (inline)
- View mode styles (inline)
- יועברו ל-CSS file בעת מימוש

---

**סיכום:** כל המוקאפים מוכנים לבדיקה עם דוגמאות נתונים ואינטגרציות בסיסיות.





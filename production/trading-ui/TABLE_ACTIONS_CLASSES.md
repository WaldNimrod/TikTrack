# מחלקות עמודת פעולות לטבלאות

## Actions Column Classes - TikTrack System

---

## 🔄 עדכון ינואר 2025: Actions Menu Popup System

### מה השתנה

**במקום רשימת כפתורים** → **כפתור ⋮ אחד + popup על hover**

### ✅ המערכת החדשה (רספונסיבית)

#### רוחב עמודת הפעולות

```css
/* משתנים ב-_variables.css */
--col-actions-percent: 5%;        /* רוחב באחוזים */
--col-actions-min-width: 60px;    /* מינימום לכפתור אחד */
--col-actions-max-width: 80px;    /* מקסימום להגבלת רוחב */
```

#### שימוש ב-HTML

```html
<!-- כותרת טבלה -->
<th class="col-actions actions-cell">
    <span class="actions-header-icon">⋮</span>
</th>

<!-- תא בטבלה -->
<td class="col-actions actions-cell">
    ${window.createActionsMenu([...], entityId)}
</td>
```

#### איך זה עובד

1. **רוחב באחוזים (5%)** - משתלב עם מערכת רספונסיבית
2. **מינימום 60px** - מספיק לכפתור ⋮ אחד (32px + padding)
3. **מקסימום 80px** - הגבלה למניעת התרחבות מוגזמת

#### התאמה למסכים

| **מסך** | **רוחב קונטיינר** | **5% = רוחב עמודה** | **מה קורה?** |
|----------|-------------------|---------------------|--------------|
| **XS** | 320px | 16px | מינימום 60px ✅ |
| **SM** | 480px | 24px | מינימום 60px ✅ |
| **MD** | 768px | 38px | מינימום 60px ✅ |
| **LG** | 992px | 50px | מינימום 60px ✅ |
| **XL** | 1200px | 60px | בדיוק 60px ✅ |
| **XXL** | 1400px | 70px | 70px (בתוך max) ✅ |

---

## ❌ המערכת הישנה (לא רלוונטית יותר)

### מחלקות CSS שהיו

- `.actions-1-btn` - 60px (1 כפתור)
- `.actions-2-btn` - 80px (2 כפתורים)  
- `.actions-3-btn` - 120px (3 כפתורים)
- `.actions-4-btn` - 160px (4 כפתורים)
- `.actions-5-btn` - 200px (5 כפתורים)

### למה הן לא רלוונטיות

עכשיו יש רק כפתור **⋮ אחד** שמציג popup עם כל הפעולות.

### מה קורה עם המשתנים הישנים

נשארו ב-`_variables.css` להמשכיות, אבל **לא משמשים יותר**.

---

## 📋 עמודים במערכת

### עמודים שעודכנו (8 עמודים)

1. ✅ `cash_flows.html` - תזרימי מזומנים
2. ✅ `trades.html` - עסקאות
3. ✅ `executions.html` - ביצועים
4. ✅ `accounts.html` - חשבונות מסחר
5. ✅ `alerts.html` - התראות
6. ✅ `tickers.html` - מניות
7. ✅ `trade_plans.html` - תכנוני מסחר
8. ✅ `notes.html` - הערות

### מספר כפתורים בכל עמוד

| **עמוד** | **מספר כפתורים** | **סוגים** |
|----------|------------------|----------|
| `trades.html` | 5 | Link, Edit, View, Cancel, Delete |
| `trade_plans.html` | 4 | Link, Edit, View, Delete |
| `executions.html` | 4 | Link, Edit, View, Delete |
| `tickers.html` | 3 | Link, Edit, Delete |
| `cash_flows.html` | 3 | Link, Edit, Delete |
| `alerts.html` | 4 | Link, Edit, View, Delete |
| `notes.html` | 4 | Link, Edit, View, Delete |
| `trading_accounts.html` | 3 | Link, Edit, Delete |

**כל הכפתורים בפופאפ - רוחב עמודה אחיד!** ✅

---

## 🔧 מערכות קשורות

### קבצים מעורבים

1. **`button-icons.js`** - יוצר את הכפתורים + `createActionsMenu()`
2. **`actions-menu-system.js`** - מנהל hover behavior
3. **`_variables.css`** - משתני רוחב
4. **`_tables.css`** - עיצוב כללי
5. **`07-trumps/_*.css`** - עיצובים ספציפיים לעמודים

### מסמכים נוספים

- **`ACTIONS_MENU_VERIFICATION.md`** - מדריך בדיקה
- **`IMPORTANT_VARIABLE_BUTTONS.md`** - מספר כפתורים דינמי
- **`RESPONSIVE_SYSTEM_SPECIFICATION.md`** - מערכת רספונסיבית

---

## 📝 הוראות תחזוקה

### הוספת עמוד חדש

1. **HTML**: השתמש ב-`col-actions actions-cell` (ללא מספר כפתורים)
2. **JavaScript**: קרא ל-`window.createActionsMenu([...], id)`
3. **CSS**: לא צריך עדכון - אוטומטי!

### שינוי רוחב

```css
/* _variables.css */
--col-actions-percent: 6%;        /* שנה את האחוז */
--col-actions-min-width: 70px;    /* שנה מינימום */
--col-actions-max-width: 90px;    /* שנה מקסימום */
```

### בדיקת תקינות

```bash
# וודא שאין מחלקות ישנות
grep -r "actions-[1-5]-btn" trading-ui/*.html
# (צריך להחזיר: No matches found)
```

---

**עודכן:** 13 ינואר 2025  
**גרסה:** 2.0 (Actions Menu Popup)  
**סטטוס:** ✅ מושלם ופעיל

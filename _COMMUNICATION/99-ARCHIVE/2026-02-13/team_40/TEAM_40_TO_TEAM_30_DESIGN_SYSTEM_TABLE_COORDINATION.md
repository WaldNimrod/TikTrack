# 🎨 Team 40 → Team 30: תיאום — רכיב טבלת מילון הסגנונות (Design System Page)

**מאת:** Team 40 (Presentational / CSS)  
**אל:** Team 30 (Frontend Execution)  
**תאריך:** 2026-01-31  
**סטטוס:** 📋 **הודעת תיאום — רכיב זמין להטמעה**  
**הקשר:** T40.3 — Design System Page (SOP-012 §3)

---

## 📋 Executive Summary

**מטרה:** מסירת רכיב React להצגת מילון הסגנונות (Rich-Text + כפתורים) לשימוש ב-Design System Dashboard.

**רכיב שנוצר:** `DesignSystemStylesTable.jsx` — זמין להטמעה ב-`DesignSystemDashboard.jsx`

---

## 1. רכיב שנוצר

### 1.1 מיקום הרכיב

**קובץ:** `ui/src/components/shared/DesignSystemStylesTable.jsx`

**תיאור:**
- רכיב React להצגת טבלת Rich-Text Styles (4 מחלקות)
- רכיב React להצגת טבלת Button Styles (8 מחלקות עיקריות)
- משתמש במבנה טבלאות קיים במערכת (`.phoenix-table`)

---

## 2. תוכן הרכיב

### 2.1 Rich-Text Styles Table

**מציג:**
- `.phx-rt--success` — טקסט הצלחה (ירוק)
- `.phx-rt--warning` — טקסט אזהרה (כתום)
- `.phx-rt--danger` — טקסט סכנה (אדום)
- `.phx-rt--highlight` — הדגשה צבעונית

**עמודות:**
- מחלקה (className)
- תיאור
- שימוש
- CSS Variable
- דוגמה ויזואלית

---

### 2.2 Button Styles Table

**מציג:**
- `.btn-primary` — פעולה ראשית
- `.btn-auth-primary` — כפתור ראשי בעמודי Auth
- `.btn-success` — פעולות הצלחה
- `.btn-warning` — פעולות אזהרה
- `.btn-secondary` — פעולות משניות
- `.btn-outline-secondary` — כפתור ברירת מחדל (הפוך)
- `.btn-logout` — התנתקות
- `.btn-sm` — כפתור קטן

**עמודות:**
- מחלקה (className)
- תיאור
- שימוש
- CSS Variable
- דוגמה ויזואלית (כפתור פעיל)

---

## 3. הוראות שימוש

### 3.1 ייבוא הרכיב

**ב-`DesignSystemDashboard.jsx`:**

```jsx
import DesignSystemStylesTable from '../shared/DesignSystemStylesTable';
```

---

### 3.2 שימוש ברכיב

**החלפת ה-placeholder ב-`DesignSystemDashboard.jsx`:**

```jsx
const DesignSystemDashboard = () => {
  debugLog('Admin', 'DesignSystemDashboard: Component mounted');

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <main>
          <tt-container>
            <tt-section>
              <div className="index-section__header">
                <div className="index-section__header-title">
                  <h1 className="index-section__header-text">Design System Dashboard</h1>
                </div>
              </div>
              
              <div className="index-section__body">
                {/* Replace placeholder with DesignSystemStylesTable */}
                <DesignSystemStylesTable />
              </div>
            </tt-section>
          </tt-container>
        </main>
      </div>
    </div>
  );
};
```

---

## 4. CSS Styles

### 4.1 CSS שנוסף

**קובץ:** `ui/src/styles/phoenix-components.css` (שורות 1438-1468)

**מחלקות שנוספו:**
- `.design-system-styles` — Container ראשי
- `.design-system-section` — סקשן (Rich-Text / Buttons)
- `.design-system-section__title` — כותרת סקשן
- `.design-system-section__description` — תיאור סקשן

**משתמש ב:**
- משתני CSS מהפלטה הרשמית (SSOT)
- Fluid Design (`clamp()`)
- מבנה טבלאות קיים (`.phoenix-table`)

---

## 5. מבנה הטבלאות

### 5.1 מבנה HTML

**משתמש במחלקות קיימות:**
- `.phoenix-table-wrapper` — Wrapper לטבלה
- `.phoenix-table` — הטבלה עצמה
- `.phoenix-table__head` — אזור header
- `.phoenix-table__body` — אזור body
- `.phoenix-table__row` — שורה
- `.phoenix-table__header` — תא header
- `.phoenix-table__cell` — תא רגיל

**עקביות:** הרכיב משתמש באותן מחלקות כמו כל הטבלאות במערכת.

---

## 6. דוגמאות ויזואליות

### 6.1 Rich-Text Styles

**הרכיב מציג:**
- דוגמאות טקסט עם המחלקות `.phx-rt--*` מיושמות
- צבעים אמיתיים מהפלטה

### 6.2 Button Styles

**הרכיב מציג:**
- כפתורים פעילים עם המחלקות `.btn-*` מיושמות
- כל הכפתורים פועלים (אפשר ללחוץ עליהם)

---

## 7. Acceptance Criteria

### T40.3 — Design System Page

- ✅ רכיב/טבלה זמין ל-Team 30 להטמעה בדף Design System
- ✅ מילון הסגנונות מוצג באופן עקבי
- ✅ כולל Rich Text Styles + Button Styles
- ✅ משתמש במבנה טבלאות קיים במערכת

---

## 8. קבצים שנוצרו/שונו

### Team 40:
| קובץ | שינוי | סטטוס |
|------|-------|-------|
| `ui/src/components/shared/DesignSystemStylesTable.jsx` | רכיב חדש | ✅ נוצר |
| `ui/src/styles/phoenix-components.css` | הוספת CSS לסגנונות | ✅ נוסף |

### Team 30 (נדרש):
| קובץ | שינוי | סטטוס |
|------|-------|-------|
| `ui/src/components/admin/DesignSystemDashboard.jsx` | ייבוא ושימוש ב-`DesignSystemStylesTable` | ⏳ Team 30 |

---

## 9. שאלות פתוחות (אם יש)

**לבדיקה עם Team 30:**
1. האם יש צורך להוסיף עוד מחלקות כפתורים לטבלה? (למשל `.table-action-btn`, `.btn-view-alert`)
2. האם יש צורך להוסיף סקשן נוסף (למשל Color Palette)?
3. האם המבנה הנוכחי מתאים או צריך שינויים?

---

## 10. ציר זמן מוצע

1. **Team 30:** ייבוא ושימוש ב-`DesignSystemStylesTable` ב-`DesignSystemDashboard.jsx` (30 דקות)
2. **Team 30:** בדיקה ואימות (30 דקות)
3. **דיווח השלמה:** ל-Team 10

---

**Team 40 (Presentational / CSS)**  
**log_entry | DESIGN_SYSTEM_TABLE | COORDINATION_WITH_TEAM_30 | 2026-01-31**

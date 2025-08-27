# 📱 דוקומנטציה לממשק משתמש - TikTrack

## 🎯 סקירה כללית

מסמך זה מתאר את מערכת הממשק משתמש של TikTrack, כולל עקרונות עיצוב, מבנה קבצים, רכיבים וסגנונות.

## 📁 מבנה קבצי הסגנונות

### היררכיית טעינת קבצי CSS

```
1. apple-theme.css      - בסיס מערכת העיצוב (Apple Design System)
2. styles.css           - סגנונות כלליים של הפרויקט
3. menu.css             - סגנונות תפריט וניווט
4. grid-table.css       - סגנונות טבלאות וגרידים
5. typography.css       - הגדרות פונטים וטיפוגרפיה (נטען אחרון)
```

### תיאור קבצים

#### `apple-theme.css`
- **תפקיד**: מערכת העיצוב הבסיסית בהשראת Apple Design System
- **תכולת**: משתני CSS, צבעים, מרווחים, צללים, רדיוסים
- **היררכיה**: נטען ראשון כבסיס לכל הסגנונות

#### `styles.css`
- **תפקיד**: סגנונות כלליים לכל האתר
- **תכולת**: כפתורים, קישורים, רכיבים בסיסיים, page-body
- **היררכיה**: נטען שני, דורס הגדרות בסיסיות

#### `menu.css`
- **תפקיד**: סגנונות תפריט וניווט
- **תכולת**: header, dropdown menus, filter sections
- **היררכיה**: נטען שלישי, סגנונות ייעודיים לתפריט

#### `grid-table.css`
- **תפקיד**: סגנונות טבלאות וגרידים
- **תכולת**: data tables, sortable headers, status badges, modals
- **היררכיה**: נטען רביעי, סגנונות ייעודיים לטבלאות

#### `typography.css`
- **תפקיד**: הגדרות פונטים וטיפוגרפיה
- **תכולת**: טעינת פונטים, הגדרות פונט גלובליות
- **היררכיה**: נטען אחרון כדי לוודא שהפונטים חלים על הכל

## 🎨 מערכת הצבעים

### צבעי בסיס (Apple System)
```css
--apple-blue: #007AFF;        /* כחול ראשי */
--apple-red: #FF3B30;         /* אדום אזהרה */
--apple-green: #34C759;       /* ירוק הצלחה */
--apple-orange: #FF9500;      /* כתום התראה */
--logo-orange: #ff9e04;       /* כתום לוגו */
```

### צבעי אפור (Apple Gray Scale)
```css
--apple-gray-1: #F2F2F7;      /* רקע בהיר */
--apple-gray-6: #8E8E93;      /* טקסט משני */
--apple-gray-11: #1C1C1E;     /* רקע כהה */
```

### צבעי מותאם אישית
```css
--primary-color: #29a6a8;     /* צבע ראשי של האפליקציה */
--secondary-color: #1f8a8c;   /* צבע משני */
```

## 🧩 רכיבי ממשק

### 1. כותרת האפליקציה (App Header)
- **רכיב**: `<app-header>`
- **תפקיד**: ניווט ראשי, פילטרים, לוגו
- **תכונות**: 
  - Sticky positioning
  - Backdrop blur effect
  - Responsive design
  - Filter dropdowns

### 2. כרטיסיות התראות (Alert Cards)
- **תפקיד**: הצגת התראות חדשות
- **עיצוב**: 
  - רקע לבן עם צל קל
  - כותרת עם אייקון
  - תוכן עם זמן יצירה
  - כפתור "קראתי" בתחתית
- **מיקום**: בחלק העליון של הדף

### 3. טבלאות נתונים (Data Tables)
- **תפקיד**: הצגת נתונים בצורה מסודרת
- **תכונות**:
  - כותרות למיון
  - סטטוס badges
  - כפתורי פעולה
  - Responsive design
- **עיצוב**: 
  - רקע לבן
  - גבולות עדינים
  - צל קל

### 4. כפתורים (Buttons)
- **סוגים**:
  - Primary (ירוק): פעולות ראשיות
  - Secondary (לבן): פעולות משניות
  - Danger (אדום): מחיקה/ביטול
  - Close (כתום): סגירת חלונות
- **עיצוב**: 
  - Rounded corners
  - Hover effects
  - Consistent sizing

### 5. חלונות קופצים (Modals)
- **תפקיד**: הוספה/עריכה של נתונים
- **עיצוב**:
  - רקע שקוף
  - תוכן מרכזי
  - כפתור סגירה בפינה
  - Responsive design

## 📱 עיצוב רספונסיבי

### Breakpoints
```css
/* Mobile */
@media (max-width: 768px) {
  /* התאמות למסכים קטנים */
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  /* התאמות למסכים בינוניים */
}

/* Desktop */
@media (min-width: 1025px) {
  /* התאמות למסכים גדולים */
}
```

### עקרונות רספונסיביים
1. **Mobile First**: עיצוב מתחיל ממסכים קטנים
2. **Flexible Layouts**: שימוש ב-Flexbox ו-Grid
3. **Touch Friendly**: כפתורים גדולים מספיק למגע
4. **Readable Text**: גודל טקסט מותאם לכל מסך

## 🎯 עקרונות עיצוב

### 1. עקביות (Consistency)
- שימוש במשתני CSS לצבעים ומרווחים
- עיצוב אחיד לכל הרכיבים
- שמות CSS classes עקביים

### 2. נגישות (Accessibility)
- ניגודיות צבעים טובה
- גודל טקסט קריא
- תמיכה בניווט מקלדת
- Alt text לתמונות

### 3. ביצועים (Performance)
- שימוש ב-CSS Variables
- מינימיזציה של קבצי CSS
- Lazy loading של פונטים

### 4. שמישות (Usability)
- ניווט אינטואיטיבי
- משוב ויזואלי לפעולות
- הודעות שגיאה ברורות
- Loading states

## 🔧 כלי פיתוח

### CSS Variables
```css
/* שימוש במשתנים */
.button {
  background-color: var(--primary-color);
  border-radius: var(--apple-radius-small);
  padding: var(--apple-spacing-sm);
}
```

### Utility Classes
```css
/* כיתות עזר נפוצות */
.text-center { text-align: center; }
.mb-1 { margin-bottom: var(--apple-spacing-sm); }
.shadow-light { box-shadow: var(--apple-shadow-light); }
```

## 📋 רשימת בדיקות

### לפני שחרור
- [ ] כל הקבצים עוברים CSS validation
- [ ] עיצוב רספונסיבי עובד בכל המסכים
- [ ] נגישות נבדקה
- [ ] ביצועים נבדקו
- [ ] עקביות עיצוב נבדקה

### בדיקות אוטומטיות
- [ ] CSS syntax validation
- [ ] Responsive design testing
- [ ] Cross-browser compatibility
- [ ] Performance testing

## 🚀 עדכונים עתידיים

### מתוכנן
- [ ] Dark mode support
- [ ] Advanced animations
- [ ] Custom scrollbars
- [ ] Enhanced accessibility

### רעיונות
- [ ] Theme customization
- [ ] Advanced grid layouts
- [ ] Micro-interactions
- [ ] Progressive Web App features

---

**עודכן לאחרונה**: 2025-01-16  
**גרסה**: 1.0  
**מחבר**: TikTrack Development Team

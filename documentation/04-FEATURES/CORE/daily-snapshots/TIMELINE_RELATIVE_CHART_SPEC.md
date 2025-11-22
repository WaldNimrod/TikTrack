# מפרט גרף טיימליין מצב יחסי
# Timeline Relative View Chart Specification

**תאריך יצירה:** 21 נובמבר 2025  
**גרסה:** 1.0  
**סטטוס:** 📋 דרישות לפני מימוש

---

## 🎯 מטרה

יצירת גרף משולב המציג את התפתחות הטרייד לאורך זמן במצב יחסי, עם שני צירי Y:
- **ציר Y שמאלי:** גודל פוזיציה (משתנה רק בביצועים)
- **ציר Y ימני:** P/L (משתנה יומי)

---

## 📊 דרישות הגרף

### 1. מבנה כללי

**קונטיינר:**
- כל מצב (מוחלט ויחסי) יוצג בקונטיינר נפרד
- אין מעבר בין מצבים - שני המצבים מוצגים זה מעל זה
- כל קונטיינר עם כותרת משלו

**גרף יחסי:**
- **סוג:** Line Chart משולב (Combined Chart)
- **גובה:** 400px (ניתן להתאמה)
- **רוחב:** 100% של הקונטיינר
- **רספונסיבי:** כן

---

### 2. נתונים (Data Points)

**סוגי נקודות:**
1. **Trade Plan** - תכנון טרייד
   - `type: 'Trade Plan'`
   - `id: [מספר]` - מזהה רשומה
   - `date: 'DD/MM/YYYY'` - תאריך
   - `positionSize: 0` - גודל פוזיציה (תמיד 0)
   - `realizedPL: 0` - P/L ממומש
   - `unrealizedPL: 0` - P/L לא ממומש
   - `totalPL: 0` - P/L כולל

2. **Execution** - ביצוע (קנייה/מכירה)
   - `type: 'Execution'`
   - `id: [מספר]` - מזהה רשומה
   - `date: 'DD/MM/YYYY'` - תאריך
   - `positionSize: [מספר]` - גודל פוזיציה (משתנה כאן)
   - `realizedPL: [מספר]` - P/L ממומש
   - `unrealizedPL: [מספר]` - P/L לא ממומש
   - `totalPL: [מספר]` - P/L כולל

3. **Cash Flow** - תזרים מזומן (מקושר לטרייד)
   - `type: 'Cash Flow'`
   - `id: [מספר]` - מזהה רשומה
   - `date: 'DD/MM/YYYY'` - תאריך
   - `amount: [מספר]` - סכום (חיובי/שלילי)
   - `positionSize: [מספר]` - גודל פוזיציה (לא משתנה)
   - `realizedPL: [מספר]` - P/L ממומש
   - `unrealizedPL: [מספר]` - P/L לא ממומש
   - `totalPL: [מספר]` - P/L כולל

4. **Daily** - עדכון יומי (P/L משתנה, פוזיציה לא)
   - `type: 'Daily'`
   - `id: null` - אין מזהה (לא רשומה)
   - `date: 'DD/MM/YYYY'` - תאריך
   - `positionSize: [מספר]` - גודל פוזיציה (נשאר כמו בביצוע הקודם)
   - `realizedPL: [מספר]` - P/L ממומש
   - `unrealizedPL: [מספר]` - P/L לא ממומש (משתנה יומי)
   - `totalPL: [מספר]` - P/L כולל

**מרווחי זמן:**
- המרווחים בין נקודות משתנים (לא קבועים)
- ציר X מציג תאריכים אמיתיים
- המרווח הוויזואלי מייצג את הזמן שעבר בין נקודות

---

### 3. ציר X (X-Axis)

**סוג:** Category (תאריכים)
- **תווית:** "תאריך (מרווחי זמן משתנים)"
- **פורמט:** DD/MM (יום/חודש)
- **סיבוב:** 45 מעלות (maxRotation: 45, minRotation: 45)
- **מיקום:** תחתית

---

### 4. ציר Y שמאלי (Left Y-Axis) - גודל פוזיציה

**סוג:** Linear
- **תווית:** "גודל פוזיציה (מניות)"
- **מיקום:** שמאל
- **סוג קו:** Stepped Line (קו מדורג)
  - `stepped: 'after'` - השינוי קורה אחרי הנקודה
  - `borderDash: [8, 4]` - קו מקווקו
  - `tension: 0` - ללא עקומות
- **צבע:** `var(--muted-color)` או `var(--text-muted)` (דינאמי)
- **עובי קו:** 3px
- **נקודות:**
  - `pointRadius: 6`
  - `pointHoverRadius: 8`
  - רק בנקודות Execution (לא ב-Daily)
- **התחלה:** `beginAtZero: true`

**התנהגות:**
- גודל פוזיציה משתנה **רק** בנקודות Execution
- בין Execution ל-Execution הבא - הערך נשאר קבוע
- בנקודות Daily - הערך נשאר כמו בביצוע הקודם

---

### 5. ציר Y ימני (Right Y-Axis) - P/L

**סוג:** Linear
- **תווית:** "P/L ($)"
- **מיקום:** ימין
- **סוג קו:** Smooth Line (קו חלק)
  - `tension: 0.4` - עקומות חלקות
  - `borderDash: []` - קו רציף
- **לא מתחיל מאפס:** `beginAtZero: false` (או לא מוגדר)

**3 קווים נפרדים:**
1. **P/L ממומש (Realized P/L)**
   - צבע: `var(--success-color)` (דינאמי)
   - עובי: 2px
   - `pointRadius: 5`

2. **P/L לא ממומש (Unrealized P/L)**
   - צבע: `var(--warning-color)` (דינאמי)
   - עובי: 2px
   - `pointRadius: 5`

3. **P/L כולל (Total P/L)**
   - צבע: `var(--primary-color)` או `var(--chart-primary-color)` (דינאמי)
   - עובי: 3px (בולט יותר)
   - `pointRadius: 6`

**התנהגות:**
- P/L משתנה **יומי** (גם בנקודות Daily)
- כל נקודה (כולל Daily) מציגה את ערכי ה-P/L

---

### 6. Labels על נקודות הגרף

**כל נקודה בגרף:**
- **תצוגה:** `display: true` ב-`datalabels` plugin (או Chart.js labels)
- **תוכן:** סוג נקודה + ערך ראשי
  - Trade Plan: "תכנון"
  - Execution: "ביצוע #[id]"
  - Cash Flow: "תזרים $[amount]"
  - Daily: לא מציג label (רק tooltip)
- **מיקום:** מעל הנקודה (`position: 'top'`)
- **גופן:** `size: 10`, `weight: 'bold'`
- **צבע:** `var(--text-color)` או `var(--chart-text-color)`
- **רקע:** `var(--card-background)` עם שקיפות
- **Padding:** 4px
- **Border radius:** 4px

**ערכים:**
- גודל פוזיציה: "[ערך] מניות"
- P/L כולל: "$[ערך]" (רק בנקודות עם ערך משמעותי)

---

### 7. Tooltips (על hover)

**כל נקודה:**
- **כותרת:** תאריך + סוג נקודה
  - פורמט: "DD/MM/YYYY - [סוג]"
  - Daily: "DD/MM/YYYY - עדכון יומי"
  - אחרת: "DD/MM/YYYY - [Trade Plan/Execution]"

- **תוויות:**
  - גודל פוזיציה: "[ערך] מניות"
  - P/L ממומש: "$[ערך]"
  - P/L לא ממומש: "$[ערך]"
  - P/L כולל: "$[ערך]"

- **מידע נוסף (אחרי התוויות):**
  - רק לנקודות עם מזהה (לא Daily):
    - "סוג: [Trade Plan/Execution] | מזהה: #[מספר]"

- **Footer (תחתית):**
  - רק לנקודות עם מזהה (לא Daily):
    - "👁️ לחץ לפרטים מלאים"

---

### 8. אינטראקטיביות

**Click (לחיצה):**
- רק על נקודות עם מזהה (Trade Plan או Execution)
- לא על נקודות Daily
- **פעולה:** פתיחת מודול פרטים מלאים
  - `showExecutionDetails(id, type)`
  - `type: 'plan'` עבור Trade Plan
  - `type: 'execution'` עבור Execution

**Hover:**
- **Cursor:** `pointer` על נקודות עם מזהה
- **Cursor:** `default` על נקודות Daily
- **Tooltip:** מופיע על כל נקודה

---

### 9. Legend (מקרא)

**מיקום:** תחתית הגרף
- **תצוגה:** `display: true`
- **סגנון:** `usePointStyle: true`
- **רווח:** `padding: 15`
- **גודל גופן:** `size: 11`

**פריטים:**
1. גודל פוזיציה (אפור, קו מקווקו)
2. P/L ממומש (ירוק)
3. P/L לא ממומש (צהוב)
4. P/L כולל (כחול, בולט)

---

### 10. Grid (רשת)

**ציר Y שמאלי (גודל פוזיציה):**
- `drawOnChartArea: true` - מציג קווי רשת

**ציר Y ימני (P/L):**
- `drawOnChartArea: false` - לא מציג קווי רשת (למניעת בלבול)

---

### 11. Interaction Mode

**Mode:** `'index'`
- מציג tooltip לכל ה-datasets בנקודה
- `intersect: false` - לא צריך לחיצה מדויקת

---

## 🔧 דרישות טכניות

### Chart System
- **מערכת:** ChartSystem (מערכת מרכזית)
- **סוג:** `'line'`
- **Container:** `'#timelineChart'`
- **ID:** `'timelineChart'`

### Fallback
- אם ChartSystem לא זמין → fallback ל-Chart.js ישיר
- אם Chart.js לא זמין → הודעת שגיאה

### Performance
- **Responsive:** `true`
- **maintainAspectRatio:** `false`
- **Animation:** לפי הגדרות Theme (אופציונלי)

---

## 📐 מבנה HTML

**קונטיינר נפרד:**
```html
<!-- Timeline Absolute View -->
<div class="content-section" id="timeline-absolute-section">
    <div class="section-header">
        <h2><i class="bi bi-list-ul"></i> Timeline מוחלט</h2>
        <div class="header-actions">
            <button class="filter-toggle-btn" onclick="toggleSection('timeline-absolute-section')">
                <span class="section-toggle-icon">▼</span>
            </button>
        </div>
    </div>
    <div class="section-body">
        <!-- Absolute timeline content -->
        <!-- כולל: Trade Plans, Executions, Cash Flows, הערות, התראות -->
        <!-- כל פריט מסודר לפי תאריך -->
    </div>
</div>

<!-- Timeline Relative View -->
<div class="content-section" id="timeline-relative-section">
    <div class="section-header">
        <h2><i class="bi bi-graph-up"></i> Timeline יחסי</h2>
        <div class="header-actions">
            <button class="filter-toggle-btn" onclick="toggleSection('timeline-relative-section')">
                <span class="section-toggle-icon">▼</span>
            </button>
        </div>
    </div>
    <div class="section-body">
        <div class="timeline-chart-container" style="height: 400px; position: relative;">
            <canvas id="timelineChart"></canvas>
        </div>
        <div class="text-center mt-3" style="font-size: 0.9rem; color: var(--text-muted);">
            <p><strong>גרף משולב:</strong> ציר Y שמאלי - גודל פוזיציה (משתנה בביצועים) | ציר Y ימני - P/L (משתנה יומי)</p>
            <p style="margin-top: 5px;">👁️ לחץ על נקודה עם מזהה לפרטים מלאים | מרווחי זמן משתנים בין נקודות</p>
        </div>
    </div>
</div>
```

---

## 📋 תצוגה מוחלטת - הערות והתראות

**בתצוגה המוחלטת יש להציג גם:**

1. **הערות (Notes)**
   - `type: 'Note'`
   - `id: [מספר]` - מזהה הערה
   - `date: 'DD/MM/YYYY'` - תאריך
   - `text: [טקסט]` - תוכן ההערה
   - `icon: 'bi-chat-left-text'` - אייקון הערה
   - **מיקום:** לפי תאריך, בין נקודות הטיימליין

2. **התראות (Alerts)**
   - `type: 'Alert'`
   - `id: [מספר]` - מזהה התראה
   - `date: 'DD/MM/YYYY'` - תאריך
   - `text: [טקסט]` - תוכן ההתראה
   - `severity: 'info'|'warning'|'danger'` - חומרה
   - `icon: 'bi-bell'` - אייקון התראה
   - **מיקום:** לפי תאריך, בין נקודות הטיימליין

**עיצוב:**
- כל הערה/התראה ככרטיס קטן (`card-sm`)
- צבע רקע לפי חומרה (info/warning/danger)
- קישור לפרטים מלאים (אם יש)

---

## ✅ Checklist לפני מימוש

- [x] הגדרת מבנה נתונים (timelineData)
- [x] הגדרת ציר X (תאריכים)
- [x] הגדרת ציר Y שמאלי (גודל פוזיציה, stepped line)
- [x] הגדרת ציר Y ימני (P/L, 3 קווים)
- [x] הגדרת Tooltips
- [x] הגדרת Click handlers
- [x] הגדרת Legend
- [x] הגדרת Grid
- [ ] הפרדת קונטיינרים (מוחלט ויחסי)
- [ ] הסרת כפתורי toggle
- [ ] אתחול גרף בטעינת עמוד (לא רק בעת מעבר)

---

## 📝 הערות

1. **גודל פוזיציה:** משתנה רק בביצועים, נשאר קבוע בין ביצועים
2. **P/L:** משתנה יומי, גם בנקודות Daily
3. **נקודות Daily:** לא ניתנות ללחיצה, רק תצוגה
4. **נקודות עם מזהה:** ניתנות ללחיצה, פותחות מודול פרטים
5. **מרווחי זמן:** משתנים - המרווח הוויזואלי מייצג זמן אמיתי
6. **תזרימי מזומן:** נקודות זמן נוספות, לא משנות גודל פוזיציה
7. **הערות והתראות:** מוצגות רק בתצוגה המוחלטת, לא בגרף היחסי
8. **צבעים:** כל הצבעים דינאמיים ממשתני CSS (`var(--...)`)
9. **Labels:** כל נקודה מציגה סוג וערך גם ללא tooltip

---

**סיכום:** גרף משולב עם שני צירי Y, מציג גודל פוזיציה (stepped) ו-P/L (smooth), עם אינטראקטיביות מלאה לנקודות עם מזהה.


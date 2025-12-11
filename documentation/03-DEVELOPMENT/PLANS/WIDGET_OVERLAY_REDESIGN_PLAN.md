# תוכנית תכנון מחדש - מערכת Overlay לוויג'טים

## מטרה

לתכנן מחדש את מערכת ה-overlay לוויג'טים כדי לפתור את הבעיות הבסיסיות:

1. **Gap Problem** - Overlay נסגר כשהעכבר עובר על gap בין items
2. **Z-index Problem** - Overlays נפתחים מאחורי items אחרים אחרי מספר פתיחות

---

## ניתוח הבעיות

### בעיה 1: Gap Problem

**תיאור:**

- יש `margin-bottom: 0.75rem` בין items
- כשהעכבר עובר על ה-gap, `mouseleave` נשלח
- ה-overlay נסגר למרות שהעכבר עדיין "באזור" של ה-item

**סיבות:**

- `mouseleave` נשלח גם כשהעכבר עובר על gap (לא על element)
- אין "bridge" בין item ל-overlay
- ה-logic הנוכחי לא מטפל ב-gaps בצורה חכמה

**פתרונות אפשריים:**

1. **Invisible Bridge Elements** - יצירת אלמנטים בלתי נראים שממלאים את ה-gaps
2. **Smart Mouse Tracking** - מעקב אחר מיקום העכבר וזיהוי אם הוא "באזור" של item+overlay
3. **Delayed Close** - עיכוב בסגירת overlay עם timeout
4. **Extended Hover Area** - הרחבת אזור ה-hover לכלול את ה-gap

### בעיה 2: Z-index Problem

**תיאור:**

- כל overlay מקבל `z-index: 1050` קבוע
- Items מקבלים `z-index: 10` כש-hovered
- אחרי מספר פתיחות, overlays נפתחים מאחורי items אחרים

**סיבות:**

- אין ניהול דינמי של z-index
- כל overlay מקבל אותו z-index
- אין "stacking context" נכון

**פתרונות אפשריים:**

1. **Dynamic Z-index Manager** - מערכת שמעלה את ה-overlay הפעיל
2. **Stacking Context Management** - ניהול נכון של stacking contexts
3. **Portal Pattern** - העברת overlays ל-body עם z-index גבוה

---

## פתרון מוצע: ארכיטקטורה חדשה

### עקרונות עיצוב

1. **Unified Overlay Manager** - מערכת מרכזית אחת שמנהלת את כל ה-overlays
2. **Smart Gap Handling** - טיפול חכם ב-gaps עם invisible bridges
3. **Dynamic Z-index** - ניהול דינמי של z-index לכל overlay
4. **Event Coordination** - תיאום בין events של items, gaps, ו-overlays

### רכיבים

1. **OverlayManager** - מנהל מרכזי
   - ניהול z-index דינמי
   - מעקב אחר overlays פעילים
   - תיאום events

2. **GapBridge** - מערכת לטיפול ב-gaps
   - יצירת invisible bridges
   - ניהול hover state על gaps
   - תיאום עם items ו-overlays

3. **ZIndexStack** - מערכת z-index
   - stack של overlays פעילים
   - העלאת overlay פעיל ל-top
   - ניהול stacking contexts

---

## שלבי יישום

### שלב 1: ניתוח מעמיק

- [ ] בדיקת כל ה-gaps ב-3 הוויג'טים
- [ ] בדיקת z-index hierarchy הנוכחית
- [ ] זיהוי כל edge cases

### שלב 2: עיצוב ארכיטקטורה

- [ ] עיצוב OverlayManager
- [ ] עיצוב GapBridge
- [ ] עיצוב ZIndexStack
- [ ] תיעוד API

### שלב 3: מימוש

- [ ] מימוש OverlayManager
- [ ] מימוש GapBridge
- [ ] מימוש ZIndexStack
- [ ] אינטגרציה עם 3 הוויג'טים

### שלב 4: בדיקות

- [ ] בדיקת gap handling
- [ ] בדיקת z-index management
- [ ] בדיקת edge cases
- [ ] בדיקת performance

---

## החלטות עיצוב

### Gap Handling - איזה פתרון

**אפשרות 1: Invisible Bridge Elements** ✅ מומלץ

- **יתרונות:** פשוט, אמין, לא תלוי ב-mouse tracking
- **חסרונות:** מוסיף DOM elements

**אפשרות 2: Smart Mouse Tracking**

- **יתרונות:** לא מוסיף DOM
- **חסרונות:** מורכב, תלוי ב-performance

**אפשרות 3: Delayed Close**

- **יתרונות:** פשוט
- **חסרונות:** UX לא טוב (עיכוב)

**החלטה:** **אפשרות 1** - Invisible Bridge Elements

### Z-index Management - איזה פתרון

**אפשרות 1: Dynamic Z-index Manager** ✅ מומלץ

- **יתרונות:** גמיש, נשלט
- **חסרונות:** צריך ניהול state

**אפשרות 2: Portal Pattern**

- **יתרונות:** פשוט, z-index גבוה תמיד
- **חסרונות:** מורכב יותר (צריך repositioning)

**החלטה:** **אפשרות 1** - Dynamic Z-index Manager

---

## קבצים חדשים

1. `trading-ui/scripts/services/overlay-manager.js` - מנהל מרכזי
2. `trading-ui/scripts/services/gap-bridge.js` - טיפול ב-gaps
3. `trading-ui/scripts/services/z-index-stack.js` - ניהול z-index

## קבצים לעדכון

1. `trading-ui/scripts/services/widget-overlay-service.js` - refactor לשימוש ב-OverlayManager
2. `trading-ui/scripts/widgets/recent-items-widget.js` - אינטגרציה
3. `trading-ui/scripts/widgets/unified-pending-actions-widget.js` - אינטגרציה
4. `trading-ui/styles-new/06-components/_widget-overlay.css` - עדכון styles

---

## קריטריונים להצלחה

- [ ] Overlay לא נסגר כשהעכבר עובר על gap
- [ ] Overlay תמיד מופיע מעל כל ה-items
- [ ] אין בעיות z-index אחרי מספר פתיחות
- [ ] Performance טוב (ללא lag)
- [ ] קוד נקי ומתועד
- [ ] תמיכה ב-RTL
- [ ] תמיכה ב-responsive

---

## הערות חשובות

1. **זה תכנון מחדש מלא** - לא patch על הקוד הקיים
2. **צריך לבדוק עם 3 הוויג'טים** - Recent Items, Unified Pending Actions, Tags
3. **צריך לשמור על backward compatibility** - אם אפשר
4. **צריך תיעוד מלא** - API, usage, examples

---

## שאלות לדיון

1. האם להשתמש ב-Portal Pattern או ב-Dynamic Z-index?
2. האם GapBridge צריך להיות חלק מ-OverlayManager או נפרד?
3. האם צריך לשמור על הקוד הישן או להחליף אותו לחלוטין?





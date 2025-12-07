# Unified UI Positioning Service - Developer Guide

## סקירה כללית

`UnifiedUIPositioning` הוא שירות מרכזי למיקום אלמנטי UI במערכת, המשתמש ב-Floating UI library למיקום חכם עם fallback אוטומטי למיקום ידני.

**יתרונות:**
- מיקום חכם אוטומטי (מטפל ב-transform, overflow, viewport boundaries)
- תמיכה מלאה ב-RTL
- Fallback אוטומטי אם Floating UI לא נטען
- אינטגרציה עם WidgetZIndexManager
- תמיכה באנימציות GSAP (אופציונלי)

**קובץ:** `trading-ui/scripts/services/unified-ui-positioning-service.js`

---

## API

### `positionElement(referenceElement, floatingElement, options)`

ממקם אלמנט floating יחסית לאלמנט reference.

**Parameters:**
- `referenceElement` (HTMLElement) - אלמנט ה-reference (הפריט)
- `floatingElement` (HTMLElement) - אלמנט ה-floating (ה-overlay)
- `options` (Object) - אפשרויות מיקום:
  - `placement` (string) - מיקום יחסית ל-reference: `'bottom-start'`, `'top-start'`, `'bottom-end'`, `'top-end'` (default: `'bottom-start'`)
  - `gap` (number) - רווח בין reference ל-floating (default: `8`)
  - `minWidth` (number) - רוחב מינימלי (default: `280`)
  - `maxWidth` (number) - רוחב מקסימלי (default: `400`)
  - `zIndex` (number) - z-index (default: `1050`)
  - `strategy` (string) - `'fixed'` או `'absolute'` (default: `'fixed'`)
  - `middleware` (Array) - Floating UI middleware נוסף (אופציונלי)

**Returns:** `Promise<void>`

**Example:**
```javascript
await window.UnifiedUIPositioning.positionElement(
  itemElement,
  overlayElement,
  {
    placement: 'bottom-start',
    gap: 8,
    minWidth: 280,
    maxWidth: 400
  }
);
```

---

### `setupOverlay(listElement, itemSelector, detailsSelector, options)`

מגדיר event handlers ל-overlay hover על רשימת פריטים.

**Parameters:**
- `listElement` (HTMLElement) - אלמנט הרשימה
- `itemSelector` (string) - selector לפריטים (למשל: `'.widget-item'`)
- `detailsSelector` (string) - selector ל-overlay (למשל: `'.widget-details'` או `'[data-overlay="true"]'`)
- `options` (Object) - אפשרויות:
  - `hoverClass` (string) - class להוספה על hover (default: `'is-hovered'`)
  - `transitionDuration` (number) - משך transition במילישניות (default: `100`)
  - `gap` (number) - רווח בין item ל-overlay (default: `8`)
  - `minWidth` (number) - רוחב מינימלי (default: `280`)
  - `maxWidth` (number) - רוחב מקסימלי (default: `400`)
  - `zIndex` (number) - z-index (default: `1050`)
  - `placement` (string) - מיקום overlay (default: `'bottom-start'`, אוטומטי ל-`'top-start'` לפריטים האחרונים)
  - `useAnimations` (boolean) - האם להשתמש באנימציות GSAP (default: `true`)

**התנהגות פשוטה ומינימלית:**
- **mouseenter** על item → פתיחת overlay (סוגר את כל האחרים)
- **mouseleave** מ-item → סגירה (אלא אם העכבר עובר לאוברליי של אותו item או עדיין בתוך אותו item)
- **mouseleave** מ-overlay → סגירה (אלא אם העכבר עובר חזרה לאותו item)

**טיפול ב"חורים" בתוך item:**
הקוד בודק אם `relatedTarget` עדיין בתוך אותו item - אם כן, ה-overlay נשאר פתוח. זה מונע סגירה לא רצויה כשהעכבר עובר בין אלמנטים בתוך אותו item (למשל מ-`<span>` ל-`<div>`).

**Example:**
```javascript
window.UnifiedUIPositioning.setupOverlay(
  document.getElementById('widgetList'),
  '.widget-item',
  '[data-overlay="true"]',
  {
    gap: 8,
    minWidth: 280,
    maxWidth: 400,
    useAnimations: true,
    transitionDuration: 100
  }
);
```

---

### `destroy(listElement)`

מסיר event handlers ומנקה resources.

**Parameters:**
- `listElement` (HTMLElement) - אלמנט הרשימה שנוצר עבורו overlay

**Example:**
```javascript
window.UnifiedUIPositioning.destroy(document.getElementById('widgetList'));
```

---

### `animateElement(element, action, options)`

מנהל אנימציות לפתיחה/סגירה של אלמנט.

**Parameters:**
- `element` (HTMLElement) - אלמנט לאנימציה
- `action` (string) - `'show'` או `'hide'`
- `options` (Object) - אפשרויות:
  - `duration` (number) - משך במילישניות (default: `200`)
  - `ease` (string) - easing function (default: `'power2.out'`)

**Example:**
```javascript
window.UnifiedUIPositioning.animateElement(overlayElement, 'show', {
  duration: 200,
  ease: 'power2.out'
});
```

---

### `isAvailable()`

בודק אם Floating UI זמין.

**Returns:** `boolean`

**Example:**
```javascript
if (window.UnifiedUIPositioning.isAvailable()) {
  // Floating UI is loaded
} else {
  // Using fallback positioning
}
```

---

### `isGSAPAvailable()`

בודק אם GSAP זמין.

**Returns:** `boolean`

**Example:**
```javascript
if (window.UnifiedUIPositioning.isGSAPAvailable()) {
  // GSAP animations available
} else {
  // Using CSS transitions
}
```

---

## דוגמאות שימוש

### דוגמה 1: שימוש ב-Widget Overlay Service

`WidgetOverlayService` משתמש ב-`UnifiedUIPositioning` אוטומטית:

```javascript
// Widget Overlay Service משתמש ב-UnifiedUIPositioning אוטומטית
window.WidgetOverlayService.setupOverlayHover(
  listElement,
  '.widget-item',
  '.widget-details',
  {
    gap: 8,
    minWidth: 280,
    maxWidth: 400
  }
);
```

---

### דוגמה 2: שימוש ישיר ב-UnifiedUIPositioning

```javascript
// מיקום overlay ידני
const item = document.querySelector('.item');
const overlay = document.querySelector('.overlay');

await window.UnifiedUIPositioning.positionElement(item, overlay, {
  placement: 'bottom-start',
  gap: 8
});

// אנימציה
window.UnifiedUIPositioning.animateElement(overlay, 'show');
```

---

### דוגמה 3: שימוש ב-setupOverlay

```javascript
// הגדרת overlay hover על רשימה
window.UnifiedUIPositioning.setupOverlay(
  document.getElementById('myList'),
  '.list-item',
  '.item-details',
  {
    gap: 8,
    closeDelay: 150,
    useAnimations: true
  }
);

// ניקוי
window.UnifiedUIPositioning.destroy(document.getElementById('myList'));
```

---

## Floating UI Integration

### טעינת Floating UI

Floating UI נטען מ-CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.6.0/dist/floating-ui.dom.min.js"></script>
```

### Fallback

אם Floating UI לא נטען, המערכת משתמשת במיקום ידני (manual positioning) אוטומטית.

---

## GSAP Integration

### טעינת GSAP

GSAP נטען מ-CDN (אופציונלי) דרך package-manifest.js:

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
```

**סדר טעינה:**
- Floating UI (loadOrder: 16.5)
- **GSAP (loadOrder: 16.6)** ← נטען מיד אחרי Floating UI
- Unified UI Positioning Service (loadOrder: 8.15)
- Widget Overlay Service (loadOrder: 8.2)

### אנימציות

אם GSAP זמין, המערכת משתמשת בו לאנימציות חלקות. אחרת, משתמשים ב-CSS transitions אוטומטית.

**סוגי אנימציות:**
- **Fade in/out** - אנימציית שקיפות (opacity)
- **Slide** - אנימציית החלקה (translateY)
- **Scale** - אנימציית גודל (scale)

**דוגמאות קוד:**

```javascript
// אנימציית show עם GSAP
window.UnifiedUIPositioning.animateElement(overlay, 'show', {
  duration: 0.2, // 200ms
  onComplete: () => {
    console.log('Animation complete');
  }
});

// אנימציית hide עם GSAP
window.UnifiedUIPositioning.animateElement(overlay, 'hide', {
  duration: 0.15, // 150ms
  onComplete: () => {
    overlay.style.display = 'none';
  }
});

// בדיקת זמינות GSAP
if (window.UnifiedUIPositioning.isGSAPAvailable()) {
  // GSAP animations available - smooth animations
} else {
  // Fallback to CSS transitions
}
```

**Fallback:**
אם GSAP לא נטען, המערכת משתמשת ב-CSS transitions אוטומטית:
```css
transition: opacity 200ms ease-in-out, transform 200ms ease-in-out;
```

---

## Best Practices

### 1. תמיד נקה resources

```javascript
// בסוף חיי ה-widget
window.UnifiedUIPositioning.destroy(listElement);
```

### 2. בדוק זמינות לפני שימוש

```javascript
if (window.UnifiedUIPositioning && window.UnifiedUIPositioning.isAvailable()) {
  // Use Floating UI
} else {
  // Fallback logic
}
```

### 3. השתמש ב-placement הנכון

- `'bottom-start'` - מתחת, יישור שמאלה (LTR) / ימינה (RTL)
- `'top-start'` - מעל, יישור שמאלה (LTR) / ימינה (RTL)
- `'bottom-end'` - מתחת, יישור ימינה (LTR) / שמאלה (RTL)
- `'top-end'` - מעל, יישור ימינה (LTR) / שמאלה (RTL)

### 4. הגדר gap מתאים

```javascript
{
  gap: 8  // רווח קטן - עדין
  gap: 12 // רווח בינוני - נוח
  gap: 16 // רווח גדול - מרווח
}
```

---

## Troubleshooting

### בעיה: Overlay לא ממוקם נכון

**פתרון:**
1. בדוק ש-Floating UI נטען: `window.UnifiedUIPositioning.isAvailable()`
2. בדוק ש-overlay יש `position: fixed` או `position: absolute`
3. בדוק שאין CSS שמשפיע על המיקום (transform, overflow)

### בעיה: Overlay נחתך על ידי container

**פתרון:**
1. ודא ש-container יש `overflow: visible`
2. בדוק שאין transform על parent containers
3. Floating UI מטפל בזה אוטומטית אם זמין

### בעיה: אנימציות לא עובדות

**פתרון:**
1. בדוק ש-GSAP נטען: `window.UnifiedUIPositioning.isGSAPAvailable()`
2. אם GSAP לא זמין, המערכת משתמשת ב-CSS transitions אוטומטית
3. ודא ש-`useAnimations: true` ב-options

---

## אינטגרציה עם מערכות אחרות

### WidgetZIndexManager

`UnifiedUIPositioning` משתמש ב-`WidgetZIndexManager` אוטומטית לניהול z-index:

```javascript
// אוטומטי - לא צריך לעשות כלום
// UnifiedUIPositioning משתמש ב-WidgetZIndexManager אם זמין
```

### Widget Overlay Service

`WidgetOverlayService` משתמש ב-`UnifiedUIPositioning` אוטומטית:

```javascript
// WidgetOverlayService משתמש ב-UnifiedUIPositioning פנימית
window.WidgetOverlayService.setupOverlayHover(...);
```

---

## קישורים

- [Floating UI Documentation](https://floating-ui.com/)
- [GSAP Documentation](https://greensock.com/docs/)
- [Widget Overlay Service Guide](./WIDGET_OVERLAY_SERVICE_GUIDE.md)

---

## הערות

1. **Backward Compatibility:** המערכת תומכת ב-backward compatibility - אם Floating UI לא נטען, משתמשים במיקום ידני.
2. **Performance:** Floating UI קל משקל (~3KB gzipped) ולא משפיע על ביצועים.
3. **RTL Support:** תמיכה מלאה ב-RTL אוטומטית.


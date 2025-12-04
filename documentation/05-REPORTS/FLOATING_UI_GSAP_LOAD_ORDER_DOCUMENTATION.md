# תיעוד סדר הטעינה - Floating UI ו-GSAP

**תאריך:** 3 בדצמבר 2025  
**גרסה:** 1.0.0

---

## סדר הטעינה המדוייק

### BASE Package (loadOrder: 1)

#### Floating UI
- **קובץ:** `https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.6.0/dist/floating-ui.dom.min.js`
- **loadOrder:** 16.5
- **מיקום:** אחרי Bootstrap JS (16), לפני event-handler-manager (17)
- **required:** false (אופציונלי - יש fallback)
- **globalCheck:** `window.computePosition`

#### GSAP (להתווסף)
- **קובץ:** `https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js`
- **loadOrder:** 16.6 (להתווסף)
- **מיקום:** אחרי Floating UI (16.5), לפני event-handler-manager (17)
- **required:** false (אופציונלי - יש fallback)
- **globalCheck:** `window.gsap`

### SERVICES Package (loadOrder: 2)

#### Unified UI Positioning Service
- **קובץ:** `services/unified-ui-positioning-service.js`
- **loadOrder:** 8.15
- **מיקום:** אחרי widget-z-index-manager (8.1), לפני widget-overlay-service (8.2)
- **required:** false
- **globalCheck:** `window.UnifiedUIPositioning`
- **תלויות:** Floating UI (BASE package, loadOrder: 16.5)

#### Widget Overlay Service
- **קובץ:** `services/widget-overlay-service.js`
- **loadOrder:** 8.2
- **מיקום:** אחרי unified-ui-positioning-service (8.15)
- **required:** false
- **globalCheck:** `window.WidgetOverlayService`
- **תלויות:** Unified UI Positioning Service (SERVICES package, loadOrder: 8.15)

### DASHBOARD-WIDGETS Package (loadOrder: 19.5)

#### Recent Items Widget
- **קובץ:** `widgets/recent-items-widget.js`
- **loadOrder:** 1
- **תלויות:** Widget Overlay Service (SERVICES package, loadOrder: 8.2)

#### Unified Pending Actions Widget
- **קובץ:** `widgets/unified-pending-actions-widget.js`
- **loadOrder:** 2
- **תלויות:** Widget Overlay Service (SERVICES package, loadOrder: 8.2)

#### Tag Widget
- **קובץ:** `widgets/tag-widget.js`
- **loadOrder:** 5
- **תלויות:** Widget Overlay Service (SERVICES package, loadOrder: 8.2)

---

## סדר הטעינה המלא

1. **BASE Package (1)**
   - ... (סקריפטים קודמים)
   - Bootstrap JS (16)
   - **Floating UI (16.5)** ← נטען כאן
   - **GSAP (16.6)** ← להתווסף
   - event-handler-manager (17)
   - ... (סקריפטים נוספים)

2. **SERVICES Package (2)**
   - ... (סקריפטים קודמים)
   - widget-z-index-manager (8.1)
   - **Unified UI Positioning Service (8.15)** ← נטען כאן
   - **Widget Overlay Service (8.2)** ← נטען כאן
   - ... (סקריפטים נוספים)

3. **DASHBOARD-WIDGETS Package (19.5)**
   - **Recent Items Widget (1)** ← נטען כאן
   - **Unified Pending Actions Widget (2)** ← נטען כאן
   - **Tag Widget (5)** ← נטען כאן
   - ... (סקריפטים נוספים)

---

## תלויות

```
Floating UI (BASE, 16.5)
    ↓
Unified UI Positioning Service (SERVICES, 8.15)
    ↓
Widget Overlay Service (SERVICES, 8.2)
    ↓
Widgets (DASHBOARD-WIDGETS, 19.5)
    ├─ Recent Items Widget
    ├─ Unified Pending Actions Widget
    └─ Tag Widget
```

---

## הערות חשובות

1. **Floating UI** נטען ב-BASE package לפני כל השירותים
2. **GSAP** צריך להיטען מיד אחרי Floating UI
3. **Unified UI Positioning Service** בודק אם Floating UI זמין ויש fallback
4. **Widget Overlay Service** משתמש ב-Unified UI Positioning Service אוטומטית
5. **הוויג'טים** נטענים אחרי כל השירותים

---

## בדיקות

### בדיקת טעינה נכונה:
```javascript
// בדיקת Floating UI
console.log('Floating UI:', typeof window.computePosition !== 'undefined');

// בדיקת GSAP
console.log('GSAP:', typeof window.gsap !== 'undefined');

// בדיקת Unified UI Positioning
console.log('UnifiedUIPositioning:', typeof window.UnifiedUIPositioning !== 'undefined');

// בדיקת Widget Overlay Service
console.log('WidgetOverlayService:', typeof window.WidgetOverlayService !== 'undefined');
```

---

**מסמך זה מתעד את סדר הטעינה הנוכחי והמתוכנן של Floating UI ו-GSAP במערכת.**


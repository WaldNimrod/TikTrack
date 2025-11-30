# דוח משימות - history-widget.html

**תאריך יצירה:** 1764521947.967354  
**קטגוריה:** עמוד מוקאפ  
**עדיפות:** נמוכה

---

## סטטוס נוכחי

- **קובץ JS:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/scripts/history-widget.js
- **קובץ HTML:** None
- **סה"כ בעיות:** 88

---

## סיכום קטגוריות

- ❌ **unified_init**: missing (0 בעיות)
- ❌ **section_toggle**: missing (0 בעיות)
- ✅ **notifications**: ok (12 בעיות)
- ✅ **modals**: ok (0 בעיות)
- ❌ **tables**: missing (0 בעיות)
- ✅ **field_renderer**: ok (10 בעיות)
- ❌ **crud_handler**: missing (0 בעיות)
- ❌ **select_populator**: missing (0 בעיות)
- ❌ **data_collection**: missing (0 בעיות)
- ✅ **icons**: ok (5 בעיות)
- ❌ **colors**: missing (0 בעיות)
- ❌ **info_summary**: missing (0 בעיות)
- ❌ **pagination**: missing (0 בעיות)
- ❌ **entity_details**: missing (0 בעיות)
- ❌ **conditions**: missing (0 בעיות)
- ✅ **page_state**: ok (0 בעיות)
- ⚠️ **logger**: issues_found (57 בעיות)
- ❌ **cache**: missing (0 בעיות)
- ⚠️ **dom_manipulation**: issues_found (31 בעיות)
- ✅ **html_structure**: ok (0 בעיות)

---

## בעיות מפורטות

### logger

- **שורה 726** (js): `console.warn('⚠️ [createQuickLinksActionsMenu] window.createActionsMenu not avai...`
- **שורה 28** (js): `if (window.Logger) {...`
- **שורה 29** (js): `window.Logger.info('✅ Header System initialized', { page: 'history-widget' });...`
- **שורה 32** (js): `if (window.Logger) {...`
- **שורה 33** (js): `window.Logger.error('Error initializing Header System', {...`
- **שורה 44** (js): `if (window.Logger) {...`
- **שורה 45** (js): `window.Logger.error('Error initializing Header System (retry)', {...`
- **שורה 52** (js): `if (window.Logger) {...`
- **שורה 53** (js): `window.Logger.warn('HeaderSystem not available after retry', { page: 'history-wi...`
- **שורה 127** (js): `if (window.Logger) {...`
- ... ועוד 47 בעיות

### dom_manipulation

- **שורה 157** (js): `totalValueElement.innerHTML = window.FieldRendererService.renderNumericValue(...`
- **שורה 172** (js): `changePercentElement.innerHTML = window.FieldRendererService.renderNumericValue(...`
- **שורה 361** (js): `container.innerHTML = '<div class="text-muted text-center p-3">שגיאה בטעינת הגרף...`
- **שורה 387** (js): `tbody.innerHTML = '';...`
- **שורה 394** (js): `instrumentCell.innerHTML = `<div><strong>${item.ticker}</strong></div><div class...`
- **שורה 416** (js): `plChangeCell.innerHTML = `<div>${plHtml}</div><div class="small">${changeHtml}</...`
- **שורה 423** (js): `lastPriceCell.innerHTML = `<div class="${priceColor}"><strong>${item.lastPrice.t...`
- **שורה 474** (js): `tbody.innerHTML = '';...`
- **שורה 481** (js): `instrumentCell.innerHTML = `<div><strong>${item.ticker}</strong></div><div class...`
- **שורה 490** (js): `plMktValCell.innerHTML = `...`
- ... ועוד 21 בעיות

---

## תיקונים נדרשים

- הוספת מערכות חסרות (ראה מטריצת סטנדרטיזציה)

---

## הערכת זמן

- **עדיפות:** נמוכה
- **זמן משוער:** 6 דקות

---

**הערות:**
- דוח זה נוצר אוטומטית על בסיס סריקה מעמיקה
- יש לבדוק ידנית את כל הבעיות לפני תיקון
- ראה `STANDARDIZATION_REMAINING_PAGES_TASKS_REPORT.md` למידע נוסף

# דוח משימות - portfolio-state-page.html

**תאריך יצירה:** 1764521947.967354  
**קטגוריה:** עמוד מוקאפ  
**עדיפות:** נמוכה

---

## סטטוס נוכחי

- **קובץ JS:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/scripts/portfolio-state-page.js
- **קובץ HTML:** None
- **סה"כ בעיות:** 146

---

## סיכום קטגוריות

- ❌ **unified_init**: missing (0 בעיות)
- ✅ **section_toggle**: ok (7 בעיות)
- ⚠️ **notifications**: issues_found (21 בעיות)
- ✅ **modals**: ok (0 בעיות)
- ❌ **tables**: missing (14 בעיות)
- ✅ **field_renderer**: ok (42 בעיות)
- ❌ **crud_handler**: missing (0 בעיות)
- ❌ **select_populator**: missing (0 בעיות)
- ✅ **data_collection**: ok (42 בעיות)
- ✅ **icons**: ok (4 בעיות)
- ❌ **colors**: missing (72 בעיות)
- ✅ **info_summary**: ok (13 בעיות)
- ❌ **pagination**: missing (0 בעיות)
- ✅ **entity_details**: ok (1 בעיות)
- ❌ **conditions**: missing (0 בעיות)
- ✅ **page_state**: ok (4 בעיות)
- ✅ **logger**: ok (163 בעיות)
- ✅ **cache**: ok (14 בעיות)
- ⚠️ **dom_manipulation**: issues_found (30 בעיות)
- ⚠️ **html_structure**: issues_found (9 בעיות)

---

## בעיות מפורטות

### notifications

- **שורה 2903** (js): `alert('נא לבחור שני תאריכים להשוואה');...`
- **שורה 161** (js): `if (window.NotificationSystem) {...`
- **שורה 162** (js): `window.NotificationSystem.showError('שגיאה בטעינת נתונים', errorMsg);...`
- **שורה 1142** (js): `if (window.NotificationSystem) {...`
- **שורה 1143** (js): `window.NotificationSystem.showError('שגיאה בטעינת נתונים', errorMsg);...`
- **שורה 1559** (js): `if (window.NotificationSystem) {...`
- **שורה 1560** (js): `window.NotificationSystem.showError('שגיאה בטעינת גרפים', errorMsg);...`
- **שורה 1572** (js): `if (window.NotificationSystem) {...`
- **שורה 1573** (js): `window.NotificationSystem.showError('שגיאה בטעינת גרפים', errorMsg);...`
- **שורה 1743** (js): `if (window.NotificationSystem) {...`
- ... ועוד 11 בעיות

### tables

- **שורה 1260** (js): `// Render trades table row (for UnifiedTableSystem)...`
- **שורה 1314** (js): `// Update trades table (using UnifiedTableSystem if available, fallback to manua...`
- **שורה 1316** (js): `// Use UnifiedTableSystem if available...`
- **שורה 1317** (js): `if (window.UnifiedTableSystem && window.UnifiedTableSystem.renderer) {...`
- **שורה 1317** (js): `if (window.UnifiedTableSystem && window.UnifiedTableSystem.renderer) {...`
- **שורה 1318** (js): `window.UnifiedTableSystem.renderer.render('portfolio-trades', filteredTrades);...`
- **שורה 3114** (js): `* Register trades table with UnifiedTableSystem...`
- **שורה 3117** (js): `if (!window.UnifiedTableSystem || !window.UnifiedTableSystem.registry) {...`
- **שורה 3117** (js): `if (!window.UnifiedTableSystem || !window.UnifiedTableSystem.registry) {...`
- **שורה 3119** (js): `window.Logger.warn('⚠️ UnifiedTableSystem not available for table registration',...`
- ... ועוד 4 בעיות

### colors

- **שורה 1599** (js): `(typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRA...`
- **שורה 1599** (js): `(typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRA...`
- **שורה 1599** (js): `(typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRA...`
- **שורה 1642** (js): `(typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRA...`
- **שורה 1642** (js): `(typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRA...`
- **שורה 1642** (js): `(typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRA...`
- **שורה 1647** (js): `(typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRA...`
- **שורה 1647** (js): `(typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRA...`
- **שורה 1647** (js): `(typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRA...`
- **שורה 1652** (js): `(typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRA...`
- ... ועוד 62 בעיות

### dom_manipulation

- **שורה 74** (js): `tempDiv.innerHTML = iconHTML;...`
- **שורה 222** (js): `accountItem.innerHTML = `<span class="option-text">${account.name}</span>`;...`
- **שורה 263** (js): `investmentSelect.innerHTML = '<option value="">הכל</option>';...`
- **שורה 947** (js): `spinner.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"...`
- **שורה 1327** (js): `tbody.innerHTML = '<tr><td colspan="13" class="text-center text-muted">אין טרייד...`
- **שורה 1332** (js): `tbody.innerHTML = filteredTrades.map(trade => renderTradeRow(trade)).join('');...`
- **שורה 1357** (js): `summaryElement.innerHTML = `...`
- **שורה 1374** (js): `totalCashEl.innerHTML = window.FieldRendererService.renderAmount(data.total_cash...`
- **שורה 1377** (js): `cashBalanceTotalEl.innerHTML = window.FieldRendererService.renderAmount(data.tot...`
- **שורה 1381** (js): `document.getElementById('total-cash-balance').innerHTML = window.FieldRendererSe...`
- ... ועוד 20 בעיות

### html_structure

- **שורה 221** (js): `accountItem.setAttribute('data-onclick', `window.portfolioStatePage.selectAccoun...`
- **שורה 916** (js): `document.querySelectorAll('[data-onclick*="setChartPeriod"]').forEach(btn => {...`
- **שורה 918** (js): `if (btn.getAttribute('data-onclick').includes(`'${periodButton}'`)) {...`
- **שורה 932** (js): `document.querySelectorAll('[data-onclick*="setChartPeriod(\'month\'"]').forEach(...`
- **שורה 1505** (js): `// If no button from event, find it by the period value in data-onclick...`
- **שורה 1507** (js): `const buttons = document.querySelectorAll(`[data-onclick*="setChartPeriod('${per...`
- **שורה 1512** (js): `document.querySelectorAll(`[data-onclick*="setChartPeriod"]`).forEach(btn => {...`
- **שורה 3320** (js): `document.querySelectorAll('[data-onclick*="setChartPeriod"]').forEach(btn => {...`
- **שורה 3322** (js): `if (btn.getAttribute('data-onclick').includes(`'${state.charts.period}'`)) {...`

---

## תיקונים נדרשים

- הוספת מערכות חסרות (ראה מטריצת סטנדרטיזציה)

---

## הערכת זמן

- **עדיפות:** נמוכה
- **זמן משוער:** 10 דקות

---

**הערות:**
- דוח זה נוצר אוטומטית על בסיס סריקה מעמיקה
- יש לבדוק ידנית את כל הבעיות לפני תיקון
- ראה `STANDARDIZATION_REMAINING_PAGES_TASKS_REPORT.md` למידע נוסף

# דוח משימות - trade-history-page.html

**תאריך יצירה:** 1764521947.967354  
**קטגוריה:** עמוד מוקאפ  
**עדיפות:** נמוכה

---

## סטטוס נוכחי

- **קובץ JS:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/scripts/trade-history-page.js
- **קובץ HTML:** None
- **סה"כ בעיות:** 52

---

## סיכום קטגוריות

- ❌ **unified_init**: missing (0 בעיות)
- ❌ **section_toggle**: missing (0 בעיות)
- ⚠️ **notifications**: issues_found (21 בעיות)
- ✅ **modals**: ok (14 בעיות)
- ❌ **tables**: missing (8 בעיות)
- ✅ **field_renderer**: ok (32 בעיות)
- ❌ **crud_handler**: missing (0 בעיות)
- ❌ **select_populator**: missing (0 בעיות)
- ✅ **data_collection**: ok (16 בעיות)
- ✅ **icons**: ok (30 בעיות)
- ❌ **colors**: missing (0 בעיות)
- ✅ **info_summary**: ok (1 בעיות)
- ❌ **pagination**: missing (0 בעיות)
- ✅ **entity_details**: ok (2 בעיות)
- ❌ **conditions**: missing (0 בעיות)
- ✅ **page_state**: ok (16 בעיות)
- ✅ **logger**: ok (71 בעיות)
- ✅ **cache**: ok (26 בעיות)
- ⚠️ **dom_manipulation**: issues_found (17 בעיות)
- ⚠️ **html_structure**: issues_found (6 בעיות)

---

## בעיות מפורטות

### notifications

- **שורה 495** (js): `alert(`פרטי טרייד #${tradeId}\n\nטיקר: ${trade.ticker}\nצד: ${trade.side}\nסוג: ...`
- **שורה 238** (js): `if (window.NotificationSystem) {...`
- **שורה 239** (js): `window.NotificationSystem.showWarning('טעינת נתונים', 'נטענים נתוני דמה במקום נת...`
- **שורה 673** (js): `if (window.NotificationSystem && typeof window.NotificationSystem.showError === ...`
- **שורה 673** (js): `if (window.NotificationSystem && typeof window.NotificationSystem.showError === ...`
- **שורה 674** (js): `window.NotificationSystem.showError('שגיאה בטעינת נתונים', errorMsg);...`
- **שורה 681** (js): `if (window.NotificationSystem && typeof window.NotificationSystem.showError === ...`
- **שורה 681** (js): `if (window.NotificationSystem && typeof window.NotificationSystem.showError === ...`
- **שורה 682** (js): `window.NotificationSystem.showError('שגיאה בטעינת נתונים מהמטמון', errorMsg);...`
- **שורה 754** (js): `if (window.NotificationSystem && typeof window.NotificationSystem.showError === ...`
- ... ועוד 11 בעיות

### tables

- **שורה 1237** (js): `* Register plan vs execution table with UnifiedTableSystem...`
- **שורה 1240** (js): `if (!window.UnifiedTableSystem || !window.UnifiedTableSystem.registry) {...`
- **שורה 1240** (js): `if (!window.UnifiedTableSystem || !window.UnifiedTableSystem.registry) {...`
- **שורה 1242** (js): `window.Logger.warn('UnifiedTableSystem not available for plan vs execution table...`
- **שורה 1250** (js): `if (window.UnifiedTableSystem.registry.isRegistered && window.UnifiedTableSystem...`
- **שורה 1250** (js): `if (window.UnifiedTableSystem.registry.isRegistered && window.UnifiedTableSystem...`
- **שורה 1339** (js): `window.UnifiedTableSystem.registry.register(tableType, {...`
- **שורה 1375** (js): `window.Logger.info('✅ Registered plan vs execution table with UnifiedTableSystem...`

### dom_manipulation

- **שורה 163** (js): `tickerSelect.innerHTML = '<option value="">הכל</option>';...`
- **שורה 179** (js): `investmentSelect.innerHTML = '<option value="">הכל</option>';...`
- **שורה 340** (js): `tbody.innerHTML = '';...`
- **שורה 346** (js): `tbody.innerHTML = filteredTrades.map(trade => {...`
- **שורה 903** (js): `totalPLEl.innerHTML = window.FieldRendererService.renderAmount(statistics.totalP...`
- **שורה 908** (js): `totalPLPercentEl.innerHTML = `(${percent})`;...`
- **שורה 919** (js): `returnPercentEl.innerHTML = window.FieldRendererService.renderNumericValue(stati...`
- **שורה 951** (js): `sideEl.innerHTML = window.FieldRendererService.renderSide(trade.side);...`
- **שורה 953** (js): `sideEl.innerHTML = `<span class="badge bg-success">${trade.side || '-'}</span>`;...`
- **שורה 962** (js): `investmentTypeEl.innerHTML = window.FieldRendererService.renderType(trade.invest...`
- ... ועוד 7 בעיות

### html_structure

- **שורה 374** (js): `<button class="btn btn-sm" data-onclick="window.tradeHistoryPage.viewTradeDetail...`
- **שורה 376** (js): `<button class="btn btn-sm btn-primary" data-onclick="window.tradeHistoryPage.sel...`
- **שורה 1028** (js): ``<div><a href="#" data-onclick="showConditionDetails(${cond.id}); return false;"...`
- **שורה 1189** (js): `<div class="${stepClass}" data-step="${index}" data-onclick="selectTimelineStep(...`
- **שורה 1210** (js): `<a href="#" class="timeline-step-link" data-onclick="${onClickFn}; return false;...`
- **שורה 1190** (js): `<div class="timeline-point-absolute" ${pointColor ? `style="background-color: ${...`

---

## תיקונים נדרשים

- הוספת מערכות חסרות (ראה מטריצת סטנדרטיזציה)

---

## הערכת זמן

- **עדיפות:** נמוכה
- **זמן משוער:** 3 דקות

---

**הערות:**
- דוח זה נוצר אוטומטית על בסיס סריקה מעמיקה
- יש לבדוק ידנית את כל הבעיות לפני תיקון
- ראה `STANDARDIZATION_REMAINING_PAGES_TASKS_REPORT.md` למידע נוסף

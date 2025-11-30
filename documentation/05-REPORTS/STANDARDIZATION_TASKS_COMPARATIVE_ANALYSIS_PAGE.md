# דוח משימות - comparative-analysis-page.html

**תאריך יצירה:** 1764521947.967354  
**קטגוריה:** עמוד מוקאפ  
**עדיפות:** נמוכה

---

## סטטוס נוכחי

- **קובץ JS:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/scripts/comparative-analysis-page.js
- **קובץ HTML:** None
- **סה"כ בעיות:** 54

---

## סיכום קטגוריות

- ❌ **unified_init**: missing (0 בעיות)
- ✅ **section_toggle**: ok (1 בעיות)
- ✅ **notifications**: ok (21 בעיות)
- ✅ **modals**: ok (0 בעיות)
- ❌ **tables**: missing (0 בעיות)
- ✅ **field_renderer**: ok (18 בעיות)
- ❌ **crud_handler**: missing (0 בעיות)
- ❌ **select_populator**: missing (0 בעיות)
- ✅ **data_collection**: ok (15 בעיות)
- ✅ **icons**: ok (4 בעיות)
- ❌ **colors**: missing (13 בעיות)
- ✅ **info_summary**: ok (1 בעיות)
- ❌ **pagination**: missing (0 בעיות)
- ❌ **entity_details**: missing (0 בעיות)
- ❌ **conditions**: missing (0 בעיות)
- ✅ **page_state**: ok (25 בעיות)
- ✅ **logger**: ok (126 בעיות)
- ✅ **cache**: ok (8 בעיות)
- ⚠️ **dom_manipulation**: issues_found (30 בעיות)
- ⚠️ **html_structure**: issues_found (11 בעיות)

---

## בעיות מפורטות

### colors

- **שורה 23** (js): `// ⚠️ REMOVED: Local getEntityColor() function - use centralized Color Scheme Sy...`
- **שורה 24** (js): `// Use window.getEntityColor() directly instead...`
- **שורה 34** (js): `const color = (typeof window.getEntityColor === 'function')...`
- **שורה 35** (js): `? window.getEntityColor(series.entityType)...`
- **שורה 2037** (js): `const color = (typeof window.getEntityColor === 'function')...`
- **שורה 2038** (js): `? window.getEntityColor(seriesConfig.entityType)...`
- **שורה 2065** (js): `const color = (typeof window.getEntityColor === 'function')...`
- **שורה 2066** (js): `? window.getEntityColor(seriesConfig.entityType)...`
- **שורה 2167** (js): `const color = (typeof window.getEntityColor === 'function')...`
- **שורה 2168** (js): `? window.getEntityColor(seriesConfig.entityType)...`
- ... ועוד 3 בעיות

### dom_manipulation

- **שורה 32** (js): `container.innerHTML = AVAILABLE_SERIES.map(series => {...`
- **שורה 1488** (js): `thead.innerHTML = headerHTML;...`
- **שורה 1600** (js): `tbody.innerHTML = dataRows + summaryRow;...`
- **שורה 1617** (js): `summary.innerHTML = `...`
- **שורה 1633** (js): `filterInfo.innerHTML = `<strong>פרמטרי סינון:</strong> ${filterText}`;...`
- **שורה 1644** (js): `comparisonInfo.innerHTML = `<strong>פרמטרי השוואה:</strong> ${comparisonText}`;...`
- **שורה 1657** (js): `tbody.innerHTML = data.map((item, index) => {...`
- **שורה 1721** (js): `tooltip.innerHTML = `...`
- **שורה 1813** (js): `grid.innerHTML = '';...`
- **שורה 1856** (js): `cell.innerHTML = `...`
- ... ועוד 20 בעיות

### html_structure

- **שורה 1677** (js): `data-onclick="filterByCategory('${item.category}')">...`
- **שורה 3899** (js): `const exportBtn = document.querySelector('button[data-button-type="EXPORT"]');...`
- **שורה 46** (js): `<div class="series-color-indicator" ${color ? `style="--series-color: ${color};"...`
- **שורה 807** (js): `return `<span class="badge rounded-pill bg-light text-dark border me-1 mb-1 comp...`
- **שורה 1679** (js): `<td style="${getColorStyle(item.tradesPercentile, item.trades)}" data-value="${i...`
- **שורה 1680** (js): `<td style="${getColorStyle(item.avgPLPercentile, item.avgPL)}" data-value="${ite...`
- **שורה 1681** (js): `<td style="${getColorStyle(item.plPercentile, item.totalPL)}" data-value="${item...`
- **שורה 1682** (js): `<td style="${getColorStyle(item.successPercentile, item.successRate)}" data-valu...`
- **שורה 1683** (js): `<td class="text-end" style="${getColorStyle(item.maxInvestmentPercentile, item.m...`
- **שורה 1684** (js): `<td class="text-end" style="${getColorStyle(item.totalPurchasesPercentile, item....`
- ... ועוד 1 בעיות

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

# דוח סטנדרטיזציה - עמודי מוקאפ

# Mockups Standardization Report

**תאריך:** 2025-11-25T02:01:06.751038  
**סה"כ עמודים:** 12  
**עמודים נסרקו:** 12  
**עמודים עם בעיות:** 12  
**סה"כ בעיות:** 212

---

## סיכום כללי

### חלוקה לפי חומרה

- **קריטי:** 11
- **גבוה:** 187
- **בינוני:** 14
- **נמוך:** 0

### חלוקה לפי מערכת

- **unknown:** 212

---

## דוח פרטני לכל עמוד

### comparative_analysis_page.html

❌ **סה"כ בעיות:** 47
**מספר סקריפטים:** 27

#### Button System

- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 321
  - קוד: `</div><button class="filter-toggle-btn" data-onclick="if(typeof window.toggleAllSections === 'functi`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 337
  - קוד: `<button class="btn btn-outline-secondary btn-sm" data-onclick="resetRecordFilters()" title="נקה את כ`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 340
  - קוד: `<button class="btn btn-outline-primary btn-sm" data-onclick="resetRecordFiltersToDefaults()" title="`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 343
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('record-filter-panel')" title="הצג/הסת`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 358
  - קוד: `<button class="filter-toggle filter-toggle-full-width date-range-filter-toggle" id="dateRangeFilterT`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 363
  - קוד: `<div class="date-range-filter-item" data-value="כל זמן" data-onclick="selectDateRangeOption('כל זמן'`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 366
  - קוד: `<div class="date-range-filter-item" data-value="היום" data-onclick="selectDateRangeOption('היום')">`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 369
  - קוד: `<div class="date-range-filter-item" data-value="אתמול" data-onclick="selectDateRangeOption('אתמול')"`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 372
  - קוד: `<div class="date-range-filter-item" data-value="השבוע" data-onclick="selectDateRangeOption('השבוע')"`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 375
  - קוד: `<div class="date-range-filter-item" data-value="שבוע" data-onclick="selectDateRangeOption('שבוע')">`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 378
  - קוד: `<div class="date-range-filter-item" data-value="שבוע קודם" data-onclick="selectDateRangeOption('שבוע`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 381
  - קוד: `<div class="date-range-filter-item" data-value="החודש" data-onclick="selectDateRangeOption('החודש')"`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 384
  - קוד: `<div class="date-range-filter-item" data-value="חודש" data-onclick="selectDateRangeOption('חודש')">`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 387
  - קוד: `<div class="date-range-filter-item" data-value="חודש קודם" data-onclick="selectDateRangeOption('חודש`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 390
  - קוד: `<div class="date-range-filter-item" data-value="השנה" data-onclick="selectDateRangeOption('השנה')">`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 393
  - קוד: `<div class="date-range-filter-item" data-value="שנה" data-onclick="selectDateRangeOption('שנה')">`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 396
  - קוד: `<div class="date-range-filter-item" data-value="שנה קודמת" data-onclick="selectDateRangeOption('שנה`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 429
  - קוד: `<button class="btn btn-link btn-link-small p-0 text-decoration-none" data-onclick="selectAllOptions(`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 432
  - קוד: `<button class="btn btn-link btn-link-small p-0 text-decoration-none" data-onclick="clearAllOptions('`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 445
  - קוד: `<button class="btn btn-link btn-link-small p-0 text-decoration-none" data-onclick="selectAllOptions(`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 448
  - קוד: `<button class="btn btn-link btn-link-small p-0 text-decoration-none" data-onclick="clearAllOptions('`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 462
  - קוד: `<button class="filter-toggle filter-toggle-full-width side-filter-toggle" id="sideFilterToggle" data`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 467
  - קוד: `<div class="side-filter-item" data-value="הכול" data-onclick="selectSideOption('הכול')">`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 470
  - קוד: `<div class="side-filter-item" data-value="Long" data-onclick="selectSideOption('Long')">`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 473
  - קוד: `<div class="side-filter-item" data-value="Short" data-onclick="selectSideOption('Short')">`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 486
  - קוד: `<button class="filter-toggle filter-toggle-full-width status-filter-toggle" id="statusFilterToggle"`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 491
  - קוד: `<div class="status-filter-item" data-value="הכול" data-onclick="selectStatusOption('הכול')">`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 494
  - קוד: `<div class="status-filter-item" data-value="open" data-onclick="selectStatusOption('open')">`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 497
  - קוד: `<div class="status-filter-item" data-value="closed" data-onclick="selectStatusOption('closed')">`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 500
  - קוד: `<div class="status-filter-item" data-value="cancelled" data-onclick="selectStatusOption('cancelled')`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 534
  - קוד: `<button class="btn btn-outline-secondary btn-sm" data-onclick="resetComparisonParameters()" title="נ`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 537
  - קוד: `<button class="btn btn-outline-primary btn-sm" data-onclick="resetComparisonParametersToDefaults()"`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 540
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('comparison-parameters-panel')" title=`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 554
  - קוד: `<button class="btn btn-link btn-link-small p-0 text-decoration-none" data-onclick="selectAllOptions(`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 557
  - קוד: `<button class="btn btn-link btn-link-small p-0 text-decoration-none" data-onclick="clearAllOptions('`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 573
  - קוד: `<button class="btn btn-link btn-link-small p-0 text-decoration-none" data-onclick="selectAllOptions(`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 576
  - קוד: `<button class="btn btn-link btn-link-small p-0 text-decoration-none" data-onclick="clearAllOptions('`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 590
  - קוד: `<button class="btn btn-link btn-link-small p-0 text-decoration-none" data-onclick="selectAllOptions(`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 593
  - קוד: `<button class="btn btn-link btn-link-small p-0 text-decoration-none" data-onclick="clearAllOptions('`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 607
  - קוד: `<button class="btn btn-link btn-link-small p-0 text-decoration-none" data-onclick="selectAllOptions(`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 610
  - קוד: `<button class="btn btn-link btn-link-small p-0 text-decoration-none" data-onclick="clearAllOptions('`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 645
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('comparison-table-section')" title="הצ`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 688
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('heatmap-section')" title="הצג/הסתר סק`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 742
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('visual-heatmap-section')" title="הצג/`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 841
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('comparison-chart-section')" title="הצ`

#### Initialization System

- 🔴 **MISSING:** Missing core-systems.js script
- 🟠 **MISSING:** Missing page-initialization-configs.js script

---

### date_comparison_modal.html

❌ **סה"כ בעיות:** 19
**מספר סקריפטים:** 24

#### Button System

- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 121
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('date-selection-section')" title="הצג/`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 133
  - קוד: `<button class="filter-toggle filter-toggle-full-width date-range-filter-toggle" id="dateComparisonRa`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 138
  - קוד: `<div class="date-range-filter-item" data-value="אתמול" data-onclick="selectDateComparisonRangeOption`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 141
  - קוד: `<div class="date-range-filter-item" data-value="השבוע" data-onclick="selectDateComparisonRangeOption`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 144
  - קוד: `<div class="date-range-filter-item" data-value="שבוע" data-onclick="selectDateComparisonRangeOption(`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 147
  - קוד: `<div class="date-range-filter-item" data-value="שבוע קודם" data-onclick="selectDateComparisonRangeOp`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 150
  - קוד: `<div class="date-range-filter-item" data-value="החודש" data-onclick="selectDateComparisonRangeOption`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 153
  - קוד: `<div class="date-range-filter-item" data-value="חודש" data-onclick="selectDateComparisonRangeOption(`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 156
  - קוד: `<div class="date-range-filter-item" data-value="חודש קודם" data-onclick="selectDateComparisonRangeOp`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 159
  - קוד: `<div class="date-range-filter-item selected" data-value="השנה" data-onclick="selectDateComparisonRan`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 162
  - קוד: `<div class="date-range-filter-item" data-value="שנה" data-onclick="selectDateComparisonRangeOption('`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 165
  - קוד: `<div class="date-range-filter-item" data-value="שנה קודמת" data-onclick="selectDateComparisonRangeOp`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 176
  - קוד: `<button data-button-type="COMPARE" data-variant="primary" data-text="השווה" data-onclick="compareDat`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 193
  - קוד: `<button data-button-type="ADD" data-variant="secondary" data-text="הוסף" data-onclick="addDateFromIn`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 213
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('date_comparison_modal-טבלת-השוואות')"`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 245
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('date_comparison_modal-גרף-bar-chart--`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 273
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('date_comparison_modal-גרף-line-chart-`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 309
  - קוד: `<button class="btn btn-secondary" data-onclick="window.close()">סגור</button>`

#### Initialization System

- 🔴 **MISSING:** Missing core-systems.js script

---

### economic_calendar_page.html

❌ **סה"כ בעיות:** 6
**מספר סקריפטים:** 20

#### Button System

- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 106
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('economic_calendar_page-פילטרים')" tit`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 149
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('economic_calendar_page-אירועים-כלכליי`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 189
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('economic_calendar_page-אירועים-שמורים`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 209
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('economic_calendar_page-סטטיסטיקות')"`

#### Initialization System

- 🔴 **MISSING:** Missing core-systems.js script
- 🟠 **MISSING:** Missing page-initialization-configs.js script

---

### emotional_tracking_widget.html

⚠️ **סה"כ בעיות:** 3
**מספר סקריפטים:** 19

#### Button System

- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 111
  - קוד: `</div><button class="filter-toggle-btn" data-onclick="toggleSection(\'emotional_tracking_widget_top_`

#### Initialization System

- 🔴 **MISSING:** Missing core-systems.js script
- 🟠 **MISSING:** Missing page-initialization-configs.js script

---

### heatmap_visual_example.html

⚠️ **סה"כ בעיות:** 4
**מספר סקריפטים:** 1

#### Icon System

- 🟠 **MISSING:** Missing icon-system.js script

#### Notification System

- 🟠 **MISSING:** Missing notification-system.js script

#### Initialization System

- 🔴 **MISSING:** Missing core-systems.js script
- 🟠 **MISSING:** Missing page-initialization-configs.js script

---

### history_widget.html

❌ **סה"כ בעיות:** 15
**מספר סקריפטים:** 21

#### Button System

- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 113
  - קוד: `<button data-button-type="REFRESH" data-variant="small" data-icon="🔄" data-text="רענון" data-onclick`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 114
  - קוד: `</div><button class="filter-toggle-btn" data-onclick="toggleSection(\'history_widget_top_section\')"`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 147
  - קוד: `<button class="filter-toggle filter-toggle-full-width date-range-filter-toggle" id="chartDateRangeTo`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 152
  - קוד: `<div class="date-range-filter-item" data-value="היום" data-onclick="window.historyWidget.selectChart`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 155
  - קוד: `<div class="date-range-filter-item" data-value="אתמול" data-onclick="window.historyWidget.selectChar`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 158
  - קוד: `<div class="date-range-filter-item selected" data-value="השבוע" data-onclick="window.historyWidget.s`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 161
  - קוד: `<div class="date-range-filter-item" data-value="שבוע" data-onclick="window.historyWidget.selectChart`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 164
  - קוד: `<div class="date-range-filter-item" data-value="שבוע קודם" data-onclick="window.historyWidget.select`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 167
  - קוד: `<div class="date-range-filter-item" data-value="החודש" data-onclick="window.historyWidget.selectChar`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 170
  - קוד: `<div class="date-range-filter-item" data-value="חודש" data-onclick="window.historyWidget.selectChart`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 173
  - קוד: `<div class="date-range-filter-item" data-value="חודש קודם" data-onclick="window.historyWidget.select`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 176
  - קוד: `<div class="date-range-filter-item" data-value="השנה" data-onclick="window.historyWidget.selectChart`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 179
  - קוד: `<div class="date-range-filter-item" data-value="שנה" data-onclick="window.historyWidget.selectChartD`

#### Initialization System

- 🔴 **MISSING:** Missing core-systems.js script
- 🟠 **MISSING:** Missing page-initialization-configs.js script

---

### portfolio_state_page.html

❌ **סה"כ בעיות:** 37
**מספר סקריפטים:** 25

#### Icon System

- 🟡 **ERROR:** Direct <img> tag for Tabler icons (should use IconSystem)
  - שורה: 247
  - קוד: `<img src="/trading-ui/images/icons/tabler/chevron-down.svg" width="16" height="16" alt="chevron-down`
- 🟡 **ERROR:** Direct <img> tag for Tabler icons (should use IconSystem)
  - שורה: 283
  - קוד: `<img src="/trading-ui/images/icons/tabler/chevron-down.svg" width="16" height="16" alt="chevron-down`
- 🟡 **ERROR:** Direct <img> tag for Tabler icons (should use IconSystem)
  - שורה: 312
  - קוד: `<img src="/trading-ui/images/icons/tabler/chevron-down.svg" width="16" height="16" alt="chevron-down`

#### Button System

- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 116
  - קוד: `<button data-button-type="COMPARE" data-variant="small" data-text="השווה" data-onclick="window.portf`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 118
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('portfolio-state-top-section')" title=`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 134
  - קוד: `<button class="filter-toggle filter-toggle-full-width date-range-filter-toggle" id="dateRangeFilterT`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 139
  - קוד: `<div class="date-range-filter-item" data-value="כל זמן" data-onclick="window.portfolioStatePage.sele`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 142
  - קוד: `<div class="date-range-filter-item" data-value="היום" data-onclick="window.portfolioStatePage.select`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 145
  - קוד: `<div class="date-range-filter-item" data-value="אתמול" data-onclick="window.portfolioStatePage.selec`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 148
  - קוד: `<div class="date-range-filter-item" data-value="השבוע" data-onclick="window.portfolioStatePage.selec`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 151
  - קוד: `<div class="date-range-filter-item" data-value="שבוע" data-onclick="window.portfolioStatePage.select`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 154
  - קוד: `<div class="date-range-filter-item" data-value="שבוע קודם" data-onclick="window.portfolioStatePage.s`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 157
  - קוד: `<div class="date-range-filter-item" data-value="החודש" data-onclick="window.portfolioStatePage.selec`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 160
  - קוד: `<div class="date-range-filter-item" data-value="חודש" data-onclick="window.portfolioStatePage.select`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 163
  - קוד: `<div class="date-range-filter-item" data-value="חודש קודם" data-onclick="window.portfolioStatePage.s`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 166
  - קוד: `<div class="date-range-filter-item" data-value="השנה" data-onclick="window.portfolioStatePage.select`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 169
  - קוד: `<div class="date-range-filter-item" data-value="שנה" data-onclick="window.portfolioStatePage.selectD`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 172
  - קוד: `<div class="date-range-filter-item" data-value="שנה קודמת" data-onclick="window.portfolioStatePage.s`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 175
  - קוד: `<div class="date-range-filter-item" data-value="מותאם אישית" data-onclick="window.portfolioStatePage`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 205
  - קוד: `<button class="filter-toggle filter-toggle-full-width account-filter-toggle" id="accountFilterToggle`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 210
  - קוד: `<div class="account-filter-item" data-value="הכול" data-onclick="window.portfolioStatePage.selectAcc`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 230
  - קוד: `<button data-button-type="CLEAR" data-variant="small" data-text="נקה מסננים" data-onclick="window.po`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 246
  - קוד: `<button class="btn btn-sm btn-outline-secondary" data-onclick="window.portfolioStatePage.toggleCardD`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 282
  - קוד: `<button class="btn btn-sm btn-outline-secondary" data-onclick="window.portfolioStatePage.toggleCardD`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 308
  - קוד: `<div class="compact-stat-card clickable-card" data-onclick="window.portfolioStatePage.toggleCardDeta`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 337
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('charts-section')" title="הצג/הסתר סקש`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 345
  - קוד: `<button data-button-type="PERIOD" data-variant="small" data-text="שבוע" data-onclick="setChartPeriod`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 346
  - קוד: `<button data-button-type="PERIOD" data-variant="small" data-text="חודש" data-onclick="setChartPeriod`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 347
  - קוד: `<button data-button-type="PERIOD" data-variant="small" data-text="3 חודשים" data-onclick="setChartPe`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 348
  - קוד: `<button data-button-type="PERIOD" data-variant="small" data-text="שנה" data-onclick="setChartPeriod(`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 349
  - קוד: `<button data-button-type="PERIOD" data-variant="small" data-text="כל הזמן" data-onclick="setChartPer`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 417
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('trades-table-section')" title="הצג/הס`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 463
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('comparison-section')" title="הצג/הסתר`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 473
  - קוד: `<button data-button-type="COMPARE" data-variant="small" data-text="השווה" data-onclick="compareDates`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 474
  - קוד: `<button class="btn btn-sm btn-outline-danger hidden" id="removeComparisonDate" data-onclick="window.`

#### Initialization System

- 🔴 **MISSING:** Missing core-systems.js script
- 🟠 **MISSING:** Missing page-initialization-configs.js script

---

### price_history_page.html

❌ **סה"כ בעיות:** 5
**מספר סקריפטים:** 23

#### Button System

- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 113
  - קוד: `</div><button class="filter-toggle-btn" data-onclick="toggleSection('price_history_page_top_section'`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 159
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('change-statistics-section')" title="ה`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 204
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('tradingview-widget-section')" title="`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 232
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('linked-items-section')" title="הצג/הס`

#### Initialization System

- 🔴 **MISSING:** Missing core-systems.js script

---

### strategy_analysis_page.html

❌ **סה"כ בעיות:** 41
**מספר סקריפטים:** 24

#### Button System

- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 318
  - קוד: `<button class="filter-toggle-btn" data-onclick="if(typeof window.toggleAllSections === 'function') {`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 336
  - קוד: `<button class="btn btn-outline-secondary btn-sm" data-onclick="resetRecordFilters()" title="נקה את כ`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 339
  - קוד: `<button class="btn btn-outline-primary btn-sm" data-onclick="resetRecordFiltersToDefaults()" title="`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 342
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('record-filter-panel')" title="הצג/הסת`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 357
  - קוד: `<button class="filter-toggle filter-toggle-full-width date-range-filter-toggle" id="dateRangeFilterT`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 362
  - קוד: `<div class="date-range-filter-item" data-value="כל זמן" data-onclick="selectDateRangeOption('כל זמן'`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 365
  - קוד: `<div class="date-range-filter-item" data-value="היום" data-onclick="selectDateRangeOption('היום')">`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 368
  - קוד: `<div class="date-range-filter-item" data-value="אתמול" data-onclick="selectDateRangeOption('אתמול')"`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 371
  - קוד: `<div class="date-range-filter-item" data-value="השבוע" data-onclick="selectDateRangeOption('השבוע')"`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 374
  - קוד: `<div class="date-range-filter-item" data-value="שבוע" data-onclick="selectDateRangeOption('שבוע')">`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 377
  - קוד: `<div class="date-range-filter-item" data-value="שבוע קודם" data-onclick="selectDateRangeOption('שבוע`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 380
  - קוד: `<div class="date-range-filter-item" data-value="החודש" data-onclick="selectDateRangeOption('החודש')"`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 383
  - קוד: `<div class="date-range-filter-item" data-value="חודש" data-onclick="selectDateRangeOption('חודש')">`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 386
  - קוד: `<div class="date-range-filter-item" data-value="חודש קודם" data-onclick="selectDateRangeOption('חודש`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 389
  - קוד: `<div class="date-range-filter-item" data-value="השנה" data-onclick="selectDateRangeOption('השנה')">`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 392
  - קוד: `<div class="date-range-filter-item" data-value="שנה" data-onclick="selectDateRangeOption('שנה')">`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 395
  - קוד: `<div class="date-range-filter-item" data-value="שנה קודמת" data-onclick="selectDateRangeOption('שנה`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 427
  - קוד: `<button class="btn btn-link btn-link-small p-0 text-decoration-none" data-onclick="selectAllOptions(`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 430
  - קוד: `<button class="btn btn-link btn-link-small p-0 text-decoration-none" data-onclick="clearAllOptions('`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 443
  - קוד: `<button class="btn btn-link btn-link-small p-0 text-decoration-none" data-onclick="selectAllOptions(`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 446
  - קוד: `<button class="btn btn-link btn-link-small p-0 text-decoration-none" data-onclick="clearAllOptions('`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 460
  - קוד: `<button class="filter-toggle filter-toggle-full-width status-filter-toggle" id="statusFilterToggle"`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 465
  - קוד: `<div class="status-filter-item" data-value="הכול" data-onclick="selectStatusOption('הכול')">`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 468
  - קוד: `<div class="status-filter-item" data-value="active" data-onclick="selectStatusOption('active')">`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 471
  - קוד: `<div class="status-filter-item" data-value="inactive" data-onclick="selectStatusOption('inactive')">`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 492
  - קוד: `<button class="btn btn-outline-secondary btn-sm" data-onclick="resetComparisonParameters()" title="נ`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 495
  - קוד: `<button class="btn btn-outline-primary btn-sm" data-onclick="resetComparisonParametersToDefaults()"`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 498
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('comparison-parameters-panel')" title=`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 512
  - קוד: `<button class="btn btn-link btn-link-small p-0 text-decoration-none" data-onclick="selectAllOptions(`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 515
  - קוד: `<button class="btn btn-link btn-link-small p-0 text-decoration-none" data-onclick="clearAllOptions('`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 529
  - קוד: `<button class="btn btn-link btn-link-small p-0 text-decoration-none" data-onclick="selectAllOptions(`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 532
  - קוד: `<button class="btn btn-link btn-link-small p-0 text-decoration-none" data-onclick="clearAllOptions('`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 546
  - קוד: `<button class="btn btn-link btn-link-small p-0 text-decoration-none" data-onclick="selectAllOptions(`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 549
  - קוד: `<button class="btn btn-link btn-link-small p-0 text-decoration-none" data-onclick="clearAllOptions('`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 568
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('comparison-table-section')" title="הצ`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 611
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('heatmap-section')" title="הצג/הסתר סק`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 665
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('visual-heatmap-section')" title="הצג/`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 764
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('strategy-performance-chart-section')"`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 805
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('strategy-insights-section')" title="ה`

#### Initialization System

- 🔴 **MISSING:** Missing core-systems.js script
- 🟠 **MISSING:** Missing page-initialization-configs.js script

---

### trade_history_page.html

❌ **סה"כ בעיות:** 18
**מספר סקריפטים:** 27

#### Button System

- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 142
  - קוד: `<button class="btn btn-sm btn-primary" data-onclick="window.tradeHistoryPage.openTradeSelectorModal(`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 145
  - קוד: `<button class="btn btn-sm btn-outline-primary" data-onclick="exportData()" title="ייצא נתונים">`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 149
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('trade-history-top-section')" title="ה`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 163
  - קוד: `<button class="btn btn-sm btn-outline-secondary" data-onclick="window.tradeHistoryPage.clearSelected`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 206
  - קוד: `<button class="btn btn-sm btn-outline-primary ms-3" data-onclick="showTradeDetailsModal(); return fa`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 292
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('timeline-absolute-section')" title="ה`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 317
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('timeline-relative-section')" title="ה`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 376
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('plan-vs-execution-section')" title="ה`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 417
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('linked-items-section')" title="הצג/הס`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 1629
  - קוד: `<button class="btn btn-primary" data-onclick="window.viewLinkedItemsForTrade(${tradeId})">`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 1851
  - קוד: `<button class="btn btn-outline-secondary btn-sm w-100" data-onclick="window.tradeHistoryPage.clearTr`

#### Section Toggle System

- 🟡 **ERROR:** Direct style.display manipulation (should use toggleSection)
  - שורה: 501
  - קוד: `if (absoluteViewWrapper) absoluteViewWrapper.style.display = 'block';`
- 🟡 **ERROR:** Direct style.display manipulation (should use toggleSection)
  - שורה: 502
  - קוד: `if (absoluteView) absoluteView.style.display = 'flex';`
- 🟡 **ERROR:** Direct style.display manipulation (should use toggleSection)
  - שורה: 504
  - קוד: `relativeView.style.display = 'none';`
- 🟡 **ERROR:** Direct style.display manipulation (should use toggleSection)
  - שורה: 508
  - קוד: `if (absoluteViewWrapper) absoluteViewWrapper.style.display = 'none';`
- 🟡 **ERROR:** Direct style.display manipulation (should use toggleSection)
  - שורה: 509
  - קוד: `if (absoluteView) absoluteView.style.display = 'none';`
- 🟡 **ERROR:** Direct style.display manipulation (should use toggleSection)
  - שורה: 511
  - קוד: `relativeView.style.display = 'block';`

#### Initialization System

- 🔴 **MISSING:** Missing core-systems.js script

---

### trading_journal_page.html

❌ **סה"כ בעיות:** 15
**מספר סקריפטים:** 70

#### Button System

- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 284
  - קוד: `</div><button class="filter-toggle-btn" data-onclick="toggleSection('trading_journal_page_top_sectio`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 293
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('trading_journal_page-תצוגה-חודשית')"`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 462
  - קוד: `data-onclick="filterJournalByEntityType('all')"`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 474
  - קוד: `data-onclick="filterJournalByEntityType('execution')"`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 486
  - קוד: `data-onclick="filterJournalByEntityType('cash_flow')"`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 498
  - קוד: `data-onclick="filterJournalByEntityType('trade')"`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 510
  - קוד: `data-onclick="filterJournalByEntityType('trade_plan')"`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 522
  - קוד: `data-onclick="filterJournalByEntityType('note')"`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 534
  - קוד: `data-onclick="filterJournalByEntityType('alert')"`
- 🟠 **ERROR:** Using onclick instead of data-onclick
  - שורה: 542
  - קוד: `<button class="filter-toggle-btn" data-onclick="toggleSection('journal-entries-list-section')" title`

#### Section Toggle System

- 🟡 **ERROR:** Direct style.display manipulation (should use toggleSection)
  - שורה: 842
  - קוד: `entry.style.display = '';`
- 🟡 **ERROR:** Direct style.display manipulation (should use toggleSection)
  - שורה: 844
  - קוד: `entry.style.display = '';`
- 🟡 **ERROR:** Direct style.display manipulation (should use toggleSection)
  - שורה: 846
  - קוד: `entry.style.display = '';`
- 🟡 **ERROR:** Direct style.display manipulation (should use toggleSection)
  - שורה: 848
  - קוד: `entry.style.display = '';`
- 🟡 **ERROR:** Direct style.display manipulation (should use toggleSection)
  - שורה: 850
  - קוד: `entry.style.display = 'none';`

---

### tradingview_test_page.html

⚠️ **סה"כ בעיות:** 2
**מספר סקריפטים:** 18

#### Initialization System

- 🔴 **MISSING:** Missing core-systems.js script
- 🟠 **MISSING:** Missing page-initialization-configs.js script

---


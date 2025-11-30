# Data Collection Service - Deviations Report

**תאריך יצירה:** 26.11.2025
**סה"כ קבצים שנבדקו:** 61

## 📊 סיכום כללי

- **סה"כ סטיות שנמצאו:** 398
- **קבצים עם סטיות:** 61

## 📋 פירוט סטיות לפי קובץ

### account-activity.js

#### השמת ערך ישירה .value = (3):

- שורה 75: `option.value = account.id;...`
- שורה 118: `selector.value = defaultAccountId;...`
- שורה 126: `selector.value = firstAccountId;...`

---

### alerts.js

#### שימושים ישירים ב-getElementById().value (4):

- שורה 2663: `const alertId = document.getElementById('editAlertId').value;...`
- שורה 3517: `const sourceType = document.getElementById('conditionSourceType').value;...`
- שורה 3592: `const sourceType = document.getElementById('conditionSourceType').value;...`
- שורה 3685: `const message = document.getElementById('alertMessageFromCondition').value;...`

#### השמת ערך ישירה .value = (12):

- שורה 1251: `option.value = '';...`
- שורה 1260: `option.value = item.id;...`
- שורה 1432: `field.value = '';...`
- שורה 2500: `statusHidden.value = 'open';...`
- שורה 2504: `statusHidden.value = 'open';...`
- שורה 2506: `triggeredHidden.value = currentTriggered;...`
- שורה 2509: `statusHidden.value = 'closed';...`
- שורה 2513: `statusHidden.value = 'closed';...`
- שורה 2517: `statusHidden.value = 'cancelled';...`
- שורה 2521: `statusHidden.value = 'open';...`
- ... ועוד 2 מופעים

---

### auth.js

#### השמת ערך ישירה .value = (1):

- שורה 109: `if (usernameField) {usernameField.value = savedUsername;}...`

#### פונקציות מקומיות לטפסים (1):

- שורה 180 (populate): `function setupLoginForm(formId = 'loginForm', onSuccess = null) {...`

---

### cash_flows.js

#### שימושים ישירים ב-getElementById().value (8):

- שורה 2581: `document.getElementById('currency').value = defaultCurrency;...`
- שורה 3242: `document.getElementById('currencyExchangeFromCurrency').value = fromFlow.currenc...`
- שורה 3245: `document.getElementById('currencyExchangeToCurrency').value = toFlow.currency_id...`
- שורה 3248: `document.getElementById('currencyExchangeFromAmount').value = Math.abs(fromFlow....`
- שורה 3251: `document.getElementById('currencyExchangeRate').value = exchangeData.exchange_ra...`
- שורה 3254: `document.getElementById('currencyExchangeFeeAmount').value = feeAmount;...`
- שורה 3258: `document.getElementById('currencyExchangeSource').value = fromFlow.source || 'ma...`
- שורה 3266: `document.getElementById('currencyExchangeDate').value = fromFlow.date;...`

#### השמת ערך ישירה .value = (17):

- שורה 449: `select.value = normalizedValue;...`
- שורה 468: `select.value = activeCashFlowTypeFilter || 'all';...`
- שורה 2581: `document.getElementById('currency').value = defaultCurrency;...`
- שורה 3041: `toAmountField.value = calculatedToAmount ? calculatedToAmount.toFixed(6) : '';...`
- שורה 3239: `accountField.value = fromFlow.trading_account_id;...`
- שורה 3242: `document.getElementById('currencyExchangeFromCurrency').value = fromFlow.currenc...`
- שורה 3245: `document.getElementById('currencyExchangeToCurrency').value = toFlow.currency_id...`
- שורה 3248: `document.getElementById('currencyExchangeFromAmount').value = Math.abs(fromFlow....`
- שורה 3251: `document.getElementById('currencyExchangeRate').value = exchangeData.exchange_ra...`
- שורה 3254: `document.getElementById('currencyExchangeFeeAmount').value = feeAmount;...`
- ... ועוד 7 מופעים

---

### code-quality-dashboard.js

#### השמת ערך ישירה .value = (5):

- שורה 731: `categorySelect.value = currentValue;...`
- שורה 734: `categorySelect.value = 'all';...`
- שורה 887: `slider.value = value;...`
- שורה 906: `if (typeSelect) typeSelect.value = 'all';...`
- שורה 907: `if (categorySelect) categorySelect.value = 'all';...`

---

### comparative-analysis-page.js

#### שימושים ישירים ב-getElementById().value (2):

- שורה 624: `document.getElementById('customDateFrom').value = filters.dateRangeStart;...`
- שורה 627: `document.getElementById('customDateTo').value = filters.dateRangeEnd;...`

#### השמת ערך ישירה .value = (10):

- שורה 346: `fromInput.value = '';...`
- שורה 349: `toInput.value = '';...`
- שורה 624: `document.getElementById('customDateFrom').value = filters.dateRangeStart;...`
- שורה 627: `document.getElementById('customDateTo').value = filters.dateRangeEnd;...`
- שורה 2386: `if (fromInput) fromInput.value = '';...`
- שורה 2442: `if (fromInput) fromInput.value = '';...`
- שורה 3162: `fromInput.value = '';...`
- שורה 3165: `toInput.value = '';...`
- שורה 3232: `fromInput.value = '';...`
- שורה 3235: `toInput.value = '';...`

---

### conditions/conditions-form-generator.js

#### השמת ערך ישירה .value = (6):

- שורה 257: `option.value = method.id;...`
- שורה 265: `methodSelect.value = conditionData.method_id;...`
- שורה 626: `logicalOperator.value = conditionData.logical_operator;...`
- שורה 631: `conditionGroup.value = conditionData.condition_group;...`
- שורה 641: `triggerAction.value = conditionData.trigger_action;...`
- שורה 654: `input.value = value;...`

---

### constraint-manager.js

#### שימושים ישירים ב-getElementById().value (6):

- שורה 466: `table_name: document.getElementById('table-name').value,...`
- שורה 468: `constraint_type: document.getElementById('constraint-type').value,...`
- שורה 470: `constraint_definition: document.getElementById('constraint-definition').value,...`
- שורה 526: `table_name: document.getElementById('modal-table-name').value,...`
- שורה 528: `constraint_type: document.getElementById('modal-constraint-type').value,...`
- שורה 530: `constraint_definition: document.getElementById('modal-constraint-definition').va...`

#### השמת ערך ישירה .value = (2):

- שורה 161: `option.value = table;...`
- שורה 449: `if (e.target.value === 'ENUM') {...`

---

### constraints.js

#### השמת ערך ישירה .value = (1):

- שורה 148: `option.value = table;...`

---

### css-management.js

#### שימושים ישירים ב-getElementById().value (5):

- שורה 411: `const searchTerm = document.getElementById('cssSearchInput').value.trim();...`
- שורה 1268: `const targetFile = document.getElementById('mergeTargetFile').value;...`
- שורה 1378: `const targetFile = document.getElementById('specificMergeTargetFile').value;...`
- שורה 1484: `const targetFile = document.getElementById('deleteFromFile').value;...`
- שורה 1778: `const fileName = document.getElementById('newCssFileName').value.trim();...`

#### השמת ערך ישירה .value = (1):

- שורה 578: `searchInput.value = '';...`

---

### currencies.js

#### שימושים ישירים ב-getElementById().value (4):

- שורה 57: `document.getElementById('editCurrencyId').value = currency.id;...`
- שורה 59: `document.getElementById('editCurrencyName').value = currency.name;...`
- שורה 79: `document.getElementById('deleteCurrencyId').value = currency.id;...`
- שורה 138: `const id = parseInt(document.getElementById('deleteCurrencyId').value);...`

#### השמת ערך ישירה .value = (3):

- שורה 57: `document.getElementById('editCurrencyId').value = currency.id;...`
- שורה 59: `document.getElementById('editCurrencyName').value = currency.name;...`
- שורה 79: `document.getElementById('deleteCurrencyId').value = currency.id;...`

---

### date-comparison-modal.js

#### השמת ערך ישירה .value = (4):

- שורה 172: `newDateInput.value = '';...`
- שורה 228: `dateInput.value = oldDate;...`
- שורה 238: `dateInput.value = oldDate || '';...`
- שורה 1514: `newDateInput.value = '';...`

---

### debug-cash-flow-filter-console.js

#### השמת ערך ישירה .value = (1):

- שורה 116: `select.value = select.value === 'all' ? 'deposit' : 'all';...`

---

### debug-trade-fields.js

#### השמת ערך ישירה .value = (2):

- שורה 142: `console.log('Run: document.querySelector("#tradeQuantity").value = ' + testQuant...`
- שורה 152: `console.log('Run: document.querySelector("#tradeTotalInvestment").value = ' + te...`

---

### emotional-tracking-widget.js

#### השמת ערך ישירה .value = (1):

- שורה 557: `if (tradeSelect) tradeSelect.value = '';...`

#### פונקציות מקומיות לטפסים (1):

- שורה 453 (populate): `function setupQuickEntryForm() {...`

---

### entity-details-renderer.js

#### השמת ערך ישירה .value = (1):

- שורה 3248: `} else if (defaultAccountInfo && typeof defaultAccountInfo.value === 'string') {...`

---

### executions.js

#### שימושים ישירים ב-getElementById().value (3):

- שורה 2642: `const quantity = parseFloat(document.getElementById(`${prefix}Quantity`).value) ...`
- שורה 2644: `const commission = parseFloat(document.getElementById(`${prefix}Commission`).val...`
- שורה 2862: `? document.getElementById('executionTradeId').value...`

#### השמת ערך ישירה .value = (8):

- שורה 271: `realizedPLField.value = '';...`
- שורה 2225: `option.value = trade.id; // מספר ישיר...`
- שורה 2520: `quantityField.value = 100;...`
- שורה 2526: `priceField.value = ticker.current_price;...`
- שורה 2536: `commissionField.value = defaultCommission;...`
- שורה 3463: `externalIdField.value = '';...`
- שורה 3721: `tickerSelect.value = tickerId;...`
- שורה 3828: `option.value = ticker.id;...`

---

### external-data-dashboard.js

#### השמת ערך ישירה .value = (2):

- שורה 1757: `if (hotElement) hotElement.value = '';...`
- שורה 1759: `if (maxElement) maxElement.value = '';...`

---

### header-system-old.js

#### השמת ערך ישירה .value = (4):

- שורה 4526: `if (searchInput) searchInput.value = '';...`
- שורה 4591: `searchInput.value = filters.search || '';...`
- שורה 4880: `searchInput.value = defaultFilters.search || '';...`
- שורה 4931: `searchInput.value = '';...`

---

### header-system-v2.js

#### השמת ערך ישירה .value = (3):

- שורה 1226: `searchInput.value = '';...`
- שורה 1304: `searchInput.value = defaultFilters.search;...`
- שורה 1346: `if (searchInput) searchInput.value = '';...`

---

### header-system.js

#### השמת ערך ישירה .value = (3):

- שורה 1225: `searchInput.value = '';...`
- שורה 1303: `searchInput.value = defaultFilters.search;...`
- שורה 1345: `if (searchInput) searchInput.value = '';...`

---

### import-user-data.js

#### השמת ערך ישירה .value = (24):

- שורה 1063: `select.value = '';...`
- שורה 1097: `option.value = account.id;...`
- שורה 1942: `select.value = selectedDataTypeKey;...`
- שורה 1971: `option.value = definition.key;...`
- שורה 1981: `select.value = previousValue;...`
- שורה 1983: `select.value = selectedDataTypeKey;...`
- שורה 2028: `select.value = fallbackOption.value;...`
- שורה 2757: `textarea.value = htmlContent;...`
- שורה 2858: `dataTypeSelect.value = taskType;...`
- שורה 3342: `inputElement.value = value;...`
- ... ועוד 14 מופעים

#### שימוש ישיר ב-FormData (2):

- שורה 618: `const formData = new FormData();...`
- שורה 5561: `const formData = new FormData();...`

---

### init-system/pages-standardization-plan.js

#### שימושים ישירים ב-getElementById().value (1):

- שורה 294: `const filter = document.getElementById('pagesFilter').value;...`

---

### init-system-check.js

#### השמת ערך ישירה .value = (1):

- שורה 311: `textArea.value = text;...`

---

### init-system-management.js

#### שימושים ישירים ב-getElementById().value (3):

- שורה 969: `const pageName = document.getElementById('newPageName').value.trim();...`
- שורה 993: `const pageName = document.getElementById('newPageName').value.trim();...`
- שורה 1014: `const pageName = document.getElementById('newPageName').value.trim();...`

#### השמת ערך ישירה .value = (1):

- שורה 1269: `textArea.value = text;...`

---

### modal-configs/notes-config.js

#### שימוש ישיר ב-FormData (1):

- שורה 243: `const formData = new FormData();...`

---

### modules/business-module.js

#### שימושים ישירים ב-getElementById().value (7):

- שורה 1073: `id: document.getElementById('editTradeId').value,...`
- שורה 1075: `side: document.getElementById('editTradeSide').value,...`
- שורה 1077: `trade_plan_id: document.getElementById('editTradeTradePlanId').value || null,...`
- שורה 1079: `opened_at: document.getElementById('editTradeOpenedAt').value,...`
- שורה 1081: `ticker_id: document.getElementById('editTradeTickerId').value,...`
- שורה 1560: `document.getElementById('addTradeTickerId').value = '';...`
- שורה 1581: `document.getElementById('addTradeTickerId').value = tickerId;...`

#### השמת ערך ישירה .value = (29):

- שורה 821: `option.value = account.id;...`
- שורה 834: `option.value = ticker.id;...`
- שורה 851: `option.value = plan.id;...`
- שורה 886: `if (editTradeId) {editTradeId.value = trade.id;}...`
- שורה 889: `if (editTradeType) {editTradeType.value = trade.investment_type || '';}...`
- שורה 892: `if (editTradeSide) {editTradeSide.value = trade.side || '';}...`
- שורה 896: `editTradeAccountId.value = trade.account_id || '';...`
- שורה 900: `if (editTradeNotes) {editTradeNotes.value = trade.notes || '';}...`
- שורה 930: `tickerIdInput.value = displayTickerId;...`
- שורה 945: `editTradePlanSelect.value = trade.trade_plan_id;...`
- ... ועוד 19 מופעים

---

### modules/core-systems.js

#### השמת ערך ישירה .value = (1):

- שורה 3519: `textarea.value = text;...`

---

### modules/ui-basic.js

#### השמת ערך ישירה .value = (2):

- שורה 142: `stopPriceElement.value = newStopPrice.toFixed(2);...`
- שורה 189: `stopPercentageElement.value = newStopPercentage.toFixed(2);...`

---

### notes.js

#### השמת ערך ישירה .value = (4):

- שורה 1116: `option.value = item.id;...`
- שורה 1336: `select.value = selectedId;...`
- שורה 1992: `fileInput.value = '';...`
- שורה 2713: `fileInput.value = '';...`

#### שימוש ישיר ב-FormData (2):

- שורה 1489: `const formData = new FormData();...`
- שורה 1632: `const formData = new FormData();...`

---

### notification-system.js

#### השמת ערך ישירה .value = (2):

- שורה 1125: `fallback.value = textContent;...`
- שורה 1246: `textarea.value = text;...`

---

### notifications-center.js

#### השמת ערך ישירה .value = (1):

- שורה 947: `option.value = page;...`

---

### pending-execution-trade-creation.js

#### השמת ערך ישירה .value = (2):

- שורה 953: `totalInvestmentField.value = summary.totalValue ? summary.totalValue.toFixed(2) ...`
- שורה 960: `entryDateField.value = entryValue;...`

---

### portfolio-state-page.js

#### שימושים ישירים ב-getElementById().value (4):

- שורה 764: `document.getElementById('filterInvestmentType').value = '';...`
- שורה 899: `const investmentType = document.getElementById('filterInvestmentType').value;...`
- שורה 2758: `const date2 = document.getElementById('datePicker2').value;...`
- שורה 2824: `document.getElementById('datePicker2').value = '';...`

#### השמת ערך ישירה .value = (6):

- שורה 245: `option.value = type.value;...`
- שורה 313: `fromInput.value = weekAgo.toISOString().split('T')[0];...`
- שורה 316: `toInput.value = today.toISOString().split('T')[0];...`
- שורה 764: `document.getElementById('filterInvestmentType').value = '';...`
- שורה 2824: `document.getElementById('datePicker2').value = '';...`
- שורה 3132: `investmentSelect.value = state.filters.investmentType;...`

---

### positions-portfolio.js

#### השמת ערך ישירה .value = (6):

- שורה 258: `option.value = tradingAccount.id;...`
- שורה 293: `selector.value = defaultAccountId;...`
- שורה 298: `selector.value = firstAccountId;...`
- שורה 653: `selector.value = previousValue;...`
- שורה 671: `option.value = tradingAccount.id;...`
- שורה 678: `selector.value = previousValue;...`

---

### preferences-colors.js

#### השמת ערך ישירה .value = (2):

- שורה 521: `picker.element.value = cleanValue;...`
- שורה 555: `picker.element.value = picker.originalValue;...`

---

### preferences-debug-monitor.js

#### השמת ערך ישירה .value = (1):

- שורה 139: `const hasEmptyOption = optionsCount > 0 && selectElement.options[0]?.value === '...`

---

### preferences-group-manager.js

#### השמת ערך ישירה .value = (3):

- שורה 346: `field.value = normalizedValue;...`
- שורה 350: `field.value = sourceValue;...`
- שורה 354: `if (field.value === '' && previousValue !== '') {...`

---

### preferences-page.js

#### השמת ערך ישירה .value = (6):

- שורה 270: `option.value = account.id;...`
- שורה 281: `accountSelect.value = defaultAccountId;...`
- שורה 290: `accountSelect.value = defaultAccountId;...`
- שורה 299: `const totalOptions = Math.max(accountSelect.options.length - (accountSelect.opti...`
- שורה 451: `nameInput.value = '';...`
- שורה 607: `fallbackInput.value = logContent;...`

---

### preferences-ui-v4.js

#### השמת ערך ישירה .value = (8):

- שורה 330: `if (pageSizeEl) pageSizeEl.value = pageSize;...`
- שורה 418: `input.value = colorValue;...`
- שורה 422: `input.value = '#000000';...`
- שורה 433: `input.value = colorValue || '#000000';...`
- שורה 440: `input.value = numValue;...`
- שורה 447: `input.value = value;...`
- שורה 456: `input.value = matchingOption.value;...`
- שורה 469: `input.value = String(value);...`

---

### preferences-ui.js

#### השמת ערך ישירה .value = (11):

- שורה 193: `input.value = value.substring(0, 7);...`
- שורה 196: `input.value = value;...`
- שורה 202: `input.value = colorManager.convertToColorInputFormat(value);...`
- שורה 204: `input.value = '#000000';...`
- שורה 207: `input.value = '#000000';...`
- שורה 211: `input.value = '#000000';...`
- שורה 214: `input.value = value;...`
- שורה 1869: `option.value = optionValue;...`
- שורה 1899: `profileSelect.value = activeOption.value;...`
- שורה 1909: `profileSelect.value = defaultOption.value;...`
- ... ועוד 1 מופעים

#### שימוש ישיר ב-FormData (1):

- שורה 1643: `const formData = new FormData(form);...`

---

### preferences-validation.js

#### השמת ערך ישירה .value = (1):

- שורה 102: `this.value = value;...`

---

### preferences.js

#### השמת ערך ישירה .value = (6):

- שורה 480: `element.value = parseFloat(value) || 0;...`
- שורה 482: `element.value = value || '#000000';...`
- שורה 484: `element.value = value || '';...`
- שורה 486: `element.value = value || '';...`
- שורה 649: `option.value = profile.name;...`
- שורה 662: `defaultOption.value = 'ברירת מחדל';...`

---

### price-history-page.js

#### השמת ערך ישירה .value = (1):

- שורה 165: `tickerSelect.value = tvSymbol;...`

---

### services/alert-condition-renderer.js

#### השמת ערך ישירה .value = (1):

- שורה 181: `input.value = currentValue;...`

---

### services/default-value-setter.js

#### השמת ערך ישירה .value = (4):

- שורה 44: `element.value = dateStr;...`
- שורה 72: `element.value = dateTimeStr;...`
- שורה 98: `element.value = cachedValue;...`
- שורה 130: `element.value = defaultValue;...`

---

### services/investment-calculation-service.js

#### השמת ערך ישירה .value = (15):

- שורה 356: `input.value = '';...`
- שורה 364: `input.value = formatPercent(percentValue, context.options);...`
- שורה 400: `const rawValue = typeof percentInput.value === 'string' ? percentInput.value.tri...`
- שורה 402: `priceInput.value = '';...`
- שורה 415: `priceInput.value = computedPrice.toFixed(context.options.amountDecimals ?? DEFAU...`
- שורה 667: `const safeValue = field.value === null || field.value === undefined || field.val...`
- שורה 678: `const safeValue = field.value === null || field.value === undefined || field.val...`
- שורה 795: `stopInput.value = stopPrice.toFixed(2);...`
- שורה 808: `targetInput.value = targetPrice.toFixed(2);...`
- שורה 853: `context.quantityInput.value = '';...`
- ... ועוד 5 מופעים

---

### services/select-populator-service.js

#### השמת ערך ישירה .value = (13):

- שורה 635: `emptyOption.value = '';...`
- שורה 647: `option.value = config.valueField(item);...`
- שורה 649: `option.value = item[config.valueField];...`
- שורה 670: `select.value = config.defaultValue;...`
- שורה 676: `opt.value === String(config.defaultValue) ||...`
- שורה 682: `select.value = match.value;...`
- שורה 689: `select.value = match.value;...`
- שורה 711: `option.value = '';...`
- שורה 720: `option.value = item.id;...`
- שורה 917: `tickerSelect.value = '';...`
- ... ועוד 3 מופעים

---

### strategy-analysis-page.js

#### השמת ערך ישירה .value = (13):

- שורה 480: `fromInput.value = '';...`
- שורה 483: `toInput.value = '';...`
- שורה 625: `if (fromInput) fromInput.value = '';...`
- שורה 668: `if (fromInput) fromInput.value = '';...`
- שורה 764: `select.value = '';...`
- שורה 2339: `if (fromInput) fromInput.value = savedState.dateRangeStart;...`
- שורה 2343: `if (toInput) toInput.value = savedState.dateRangeEnd;...`
- שורה 2515: `if (firstOption && firstOption.value === '') {...`
- שורה 2521: `option.value = account.id;...`
- שורה 2584: `option.value = method.id;...`
- ... ועוד 3 מופעים

---

### system-management.js

#### השמת ערך ישירה .value = (1):

- שורה 1782: `select.value = provider;...`

---

### tag-management-page.js

#### השמת ערך ישירה .value = (11):

- שורה 187: `select.value = state.filters.categoryId;...`
- שורה 278: `if (categorySelect) categorySelect.value = '';...`
- שורה 280: `if (searchInput) searchInput.value = '';...`
- שורה 374: `if (nameInput) nameInput.value = entityData?.name || '';...`
- שורה 375: `if (descriptionInput) descriptionInput.value = entityData?.description || '';...`
- שורה 377: `orderInput.value = Number.isFinite(Number(entityData?.order_index))...`
- שורה 396: `if (nameInput) nameInput.value = entityData?.name || '';...`
- שורה 397: `if (descriptionInput) descriptionInput.value = entityData?.description || '';...`
- שורה 403: `option.value = category.id;...`
- שורה 410: `categorySelect.value = String(entityData.category_id);...`
- ... ועוד 1 מופעים

---

### tag-search-controller.js

#### השמת ערך ישירה .value = (1):

- שורה 207: `elements.quickSearchInput.value = tag.name || '';...`

---

### tag-ui-manager.js

#### השמת ערך ישירה .value = (1):

- שורה 52: `option.value = tag.id;...`

---

### ticker-service.js

#### השמת ערך ישירה .value = (2):

- שורה 493: `option.value = ticker.id;...`
- שורה 540: `option.value = ticker.id;...`

---

### tickers.js

#### השמת ערך ישירה .value = (1):

- שורה 775: `input.value = mapping.provider_symbol || '';...`

---

### trade-history-page.js

#### שימושים ישירים ב-getElementById().value (8):

- שורה 460: `document.getElementById('filterTicker').value = '';...`
- שורה 462: `document.getElementById('filterInvestmentType').value = '';...`
- שורה 464: `document.getElementById('filterDateTo').value = '';...`
- שורה 1451: `document.getElementById('filterTicker').value = ticker;...`
- שורה 1454: `document.getElementById('filterSide').value = side;...`
- שורה 1457: `document.getElementById('filterInvestmentType').value = investmentType;...`
- שורה 1460: `document.getElementById('filterDateFrom').value = dateFrom;...`
- שורה 1463: `document.getElementById('filterDateTo').value = dateTo;...`

#### השמת ערך ישירה .value = (11):

- שורה 56: `const typeMap = INVESTMENT_TYPES.find(t => t.value === type);...`
- שורה 166: `option.value = ticker.symbol;...`
- שורה 182: `option.value = type.value;...`
- שורה 460: `document.getElementById('filterTicker').value = '';...`
- שורה 462: `document.getElementById('filterInvestmentType').value = '';...`
- שורה 464: `document.getElementById('filterDateTo').value = '';...`
- שורה 1451: `document.getElementById('filterTicker').value = ticker;...`
- שורה 1454: `document.getElementById('filterSide').value = side;...`
- שורה 1457: `document.getElementById('filterInvestmentType').value = investmentType;...`
- שורה 1460: `document.getElementById('filterDateFrom').value = dateFrom;...`
- ... ועוד 1 מופעים

---

### trade-selector-modal.js

#### השמת ערך ישירה .value = (3):

- שורה 743: `tradeField.value = tradeId;...`
- שורה 842: `tradeField.value = '';...`
- שורה 862: `tradeField.value = '';...`

---

### trade_plans.js

#### שימושים ישירים ב-getElementById().value (10):

- שורה 454: `const tickerId = document.getElementById('editTradePlanTickerId').value;...`
- שורה 458: `const tradePlanId = document.getElementById('editTradePlanId').value;...`
- שורה 487: `document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticke...`
- שורה 494: `document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticke...`
- שורה 513: `document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticke...`
- שורה 517: `document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticke...`
- שורה 533: `document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticke...`
- שורה 537: `document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticke...`
- שורה 572: `document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticke...`
- שורה 575: `document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticke...`

#### השמת ערך ישירה .value = (17):

- שורה 288: `entryPriceField.value = ticker.current_price;...`
- שורה 487: `document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticke...`
- שורה 494: `document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticke...`
- שורה 513: `document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticke...`
- שורה 517: `document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticke...`
- שורה 533: `document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticke...`
- שורה 537: `document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticke...`
- שורה 572: `document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticke...`
- שורה 575: `document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticke...`
- שורה 697: `sharesInput.value = result.shares;...`
- ... ועוד 7 מופעים

---

### trades.js

#### השמת ערך ישירה .value = (6):

- שורה 725: `entryPriceField.value = ticker.current_price;...`
- שורה 2062: `option.value = value;...`
- שורה 2185: `field.value = '';...`
- שורה 3605: `tradePlanSelect.value = originalTrade.trade_plan_id;...`
- שורה 3607: `tradePlanSelect.value = '';...`
- שורה 3626: `tickerIdInput.value = plan.ticker_id;...`

---

### ui-utils.js

#### השמת ערך ישירה .value = (2):

- שורה 170: `stopPriceElement.value = newStopPrice.toFixed(2);...`
- שורה 217: `stopPercentageElement.value = newStopPercentage.toFixed(2);...`

---

### unified-log-display.js

#### השמת ערך ישירה .value = (6):

- שורה 964: `if (searchInput) searchInput.value = '';...`
- שורה 966: `if (categorySelect) categorySelect.value = '';...`
- שורה 968: `if (timeRangeSelect) timeRangeSelect.value = 'all';...`
- שורה 1098: `option.value = type;...`
- שורה 1110: `option.value = category;...`
- שורה 1122: `option.value = page;...`

---


/**
 * Investment Calculation Service
 * שירות חישובי השקעה מאוחד לטפסי טריידים ותוכניות מסחר
 *
 * מספק המרות דו־כיווניות בין סכום השקעה, כמות ומחיר כניסה,
 * ומאפשר חיבור אירועים אוטומטי לשדות הטופס במודלים שונים.
 *
 * @file investment-calculation-service.js
 * @version 1.0.0
 * @author TikTrack
 */
(function () {
    'use strict';

    const DEFAULT_OPTIONS = {
        allowFractionalShares: false,
        amountDecimals: 2,
        quantityDecimals: 4,
        syncPreference: 'auto', // 'amount-first' | 'quantity-first' | 'auto'
        priceDisplay: null,
        stopField: null,
        targetField: null,
        stopPercentField: null,
        targetPercentField: null,
        sideField: null,
        tickerField: null,
        summaryField: null,
        summaryTitle: 'סיכום',
        stopPreferenceKey: 'defaultStopLoss',
        targetPreferenceKey: 'defaultTargetPrice',
        forceRiskOnBind: false,
        forceSyncOnBind: false,
        percentDecimals: 2,
        currencySymbol: '$'
    };

    const boundContexts = new WeakMap();
    const riskCache = new Map();
    const riskPromises = new Map();

    function resolveElement(root, ref) {
        if (!ref) {
            return null;
        }
        if (typeof ref === 'string') {
            return root.querySelector(ref);
        }
        if (ref instanceof HTMLElement) {
            return ref;
        }
        return null;
    }

    function parseNumericString(rawValue) {
        if (rawValue === null || rawValue === undefined) {
            return 0;
        }
        const value = String(rawValue).trim();
        if (value === '' || value === '.' || value === '-' || value === '-.') {
            return 0;
        }
        const normalized = value.replace(/,/g, '');
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function parseInputValue(input) {
        if (!input) {
            return 0;
        }
        return parseNumericString(input.value);
    }

    function parseDisplayValue(element) {
        if (!element || !element.textContent) {
            return 0;
        }
        const normalized = element.textContent.replace(/[^\d.\-]/g, '');
        return parseNumericString(normalized);
    }

    function isPositiveNumber(value) {
        return typeof value === 'number' && Number.isFinite(value) && value > 0;
    }

    function formatPercent(percent, options) {
        if (!Number.isFinite(percent)) {
            return '';
        }
        const decimals = Number.isInteger(options.percentDecimals) ? options.percentDecimals : DEFAULT_OPTIONS.percentDecimals;
        return Number(percent).toFixed(decimals);
    }

    function computeStopPercent(entryPrice, stopPrice) {
        if (!Number.isFinite(entryPrice) || entryPrice === 0 || !Number.isFinite(stopPrice) || stopPrice <= 0) {
            return null;
        }
        const percent = ((entryPrice - stopPrice) / entryPrice) * 100;
        return Number.isFinite(percent) ? percent : null;
    }

    function computeTargetPercent(entryPrice, targetPrice) {
        if (!Number.isFinite(entryPrice) || entryPrice === 0 || !Number.isFinite(targetPrice) || targetPrice <= 0) {
            return null;
        }
        const percent = ((targetPrice - entryPrice) / entryPrice) * 100;
        return Number.isFinite(percent) ? percent : null;
    }

    function computePriceFromPercent(entryPrice, percentValue, type) {
        if (!isPositiveNumber(entryPrice) || !Number.isFinite(percentValue)) {
            return null;
        }
        const ratio = percentValue / 100;
        if (type === 'stop') {
            const price = entryPrice * (1 - ratio);
            return price > 0 ? price : null;
        }
        if (type === 'target') {
            const price = entryPrice * (1 + ratio);
            return price > 0 ? price : null;
        }
        return null;
    }

    function getSelectedOptionText(selectElement) {
        if (!selectElement) {
            return '';
        }
        if (selectElement instanceof HTMLSelectElement) {
            const option = selectElement.options[selectElement.selectedIndex];
            if (option) {
                const text = option.textContent || option.innerText;
                if (text) {
                    return text.trim();
                }
            }
        }
        const value = selectElement.value || '';
        return typeof value === 'string' ? value.trim() : '';
    }

    function normalizeSide(sideValue) {
        if (!sideValue) {
            return '';
        }
        return String(sideValue).trim().toLowerCase();
    }

    function formatQuantityDisplay(quantity, options) {
        if (!Number.isFinite(quantity)) {
            return '-';
        }
        const decimals = Number.isInteger(options.quantityDecimals) ? options.quantityDecimals : DEFAULT_OPTIONS.quantityDecimals;
        const formatter = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
        return formatter.format(quantity);
    }

    function formatCurrencyDisplay(amount, currencySymbol = '$', decimals = 2) {
        if (!Number.isFinite(amount)) {
            return '-';
        }
        const formatter = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
        return `${currencySymbol}${formatter.format(amount)}`;
    }

    function formatRatioDisplay(ratio) {
        if (!Number.isFinite(ratio) || ratio <= 0) {
            return '-';
        }
        const formatted = ratio >= 10 ? ratio.toFixed(1) : ratio.toFixed(2);
        return `1:${formatted}`;
    }

    function escapeHtmlText(value) {
        if (value === null || value === undefined) {
            return '-';
        }
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderAmountWithVariant(value, options, variant = 'neutral') {
        if (value === null || value === undefined || value === '') {
            return '<span class="numeric-value-zero">-</span>';
        }

        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) {
            return '<span class="numeric-value-zero">-</span>';
        }

        let signedValue = numericValue;
        if (variant === 'negative') {
            signedValue = -Math.abs(numericValue);
        } else if (variant === 'positive') {
            signedValue = Math.abs(numericValue);
        }

        const currencySymbol = options.currencySymbol || DEFAULT_OPTIONS.currencySymbol;
        const decimals = Number.isInteger(options.amountDecimals) ? options.amountDecimals : DEFAULT_OPTIONS.amountDecimals;
        const showPositiveSign = variant !== 'neutral';

        if (window.FieldRendererService && typeof window.FieldRendererService.renderAmount === 'function') {
            return window.FieldRendererService.renderAmount(signedValue, currencySymbol, decimals, showPositiveSign);
        }

        const formatted = formatCurrencyDisplay(Math.abs(signedValue), currencySymbol, decimals);
        let sign = '';
        if (signedValue < 0) {
            sign = '-';
        } else if (showPositiveSign && signedValue > 0) {
            sign = '+';
        }
        const cssClass = signedValue > 0
            ? 'numeric-value-positive'
            : (signedValue < 0 ? 'numeric-value-negative' : 'numeric-value-zero');
        const display = sign ? `${sign}${formatted}` : formatted;
        return `<span class="${cssClass}" dir="ltr">${display}</span>`;
    }

    function computeQuantityFromInvestment(totalInvestment, price, options = {}) {
        if (!isPositiveNumber(totalInvestment) || !isPositiveNumber(price)) {
            return { quantity: null, normalizedInvestment: null };
        }

        const allowFractionalSharesOption = Object.prototype.hasOwnProperty.call(options, 'allowFractionalShares')
            ? options.allowFractionalShares
            : DEFAULT_OPTIONS.allowFractionalShares;
        const fractionalArg = allowFractionalSharesOption === null ? null : Boolean(allowFractionalSharesOption);

        let result = null;
        if (typeof window.convertAmountToShares === 'function') {
            result = window.convertAmountToShares(totalInvestment, price, fractionalArg);
        } else if (typeof convertAmountToShares === 'function') {
            result = convertAmountToShares(totalInvestment, price, fractionalArg);
        } else {
            result = totalInvestment / price;
        }

        if (result === null || result === undefined) {
            return { quantity: null, normalizedInvestment: null };
        }

        if (typeof result === 'object') {
            const sharesValue = Number(result.shares);
            const adjustedAmount = result.adjustedAmount !== undefined ? Number(result.adjustedAmount) : null;
            return {
                quantity: Number.isFinite(sharesValue) ? sharesValue : null,
                normalizedInvestment: Number.isFinite(adjustedAmount) ? adjustedAmount : null
            };
        }

        const numericResult = Number(result);
        return {
            quantity: Number.isFinite(numericResult) ? numericResult : null,
            normalizedInvestment: null
        };
    }

    function computeInvestmentFromQuantity(quantity, price) {
        if (!isPositiveNumber(quantity) || !isPositiveNumber(price)) {
            return null;
        }

        let result = null;
        if (typeof window.convertSharesToAmount === 'function') {
            result = window.convertSharesToAmount(quantity, price);
        } else if (typeof convertSharesToAmount === 'function') {
            result = convertSharesToAmount(quantity, price);
        } else {
            result = quantity * price;
        }

        const numericResult = Number(result);
        return Number.isFinite(numericResult) ? numericResult : null;
    }

    function formatAmount(amount, options) {
        if (!Number.isFinite(amount)) {
            return '';
        }
        const decimals = Number.isInteger(options.amountDecimals) ? options.amountDecimals : DEFAULT_OPTIONS.amountDecimals;
        return Number(amount).toFixed(decimals);
    }

    function formatQuantity(quantity, options) {
        if (!Number.isFinite(quantity)) {
            return '';
        }

        const allowFractionalShares = Object.prototype.hasOwnProperty.call(options, 'allowFractionalShares')
            ? options.allowFractionalShares
            : DEFAULT_OPTIONS.allowFractionalShares;

        if (allowFractionalShares === null || allowFractionalShares) {
            const decimals = Number.isInteger(options.quantityDecimals) ? options.quantityDecimals : DEFAULT_OPTIONS.quantityDecimals;
            return Number(quantity).toFixed(decimals);
        }

        return String(Math.round(quantity));
    }

    function markFieldAsUserModified(field) {
        if (!field || field.dataset.investmentCalcRiskBound) {
            return;
        }
        const handler = () => {
            field.dataset.userModified = 'true';
            delete field.dataset.systemGenerated;
        };
        field.addEventListener('input', handler);
        field.addEventListener('change', handler);
        field.dataset.investmentCalcRiskBound = 'true';
    }

    function markFieldAsSystemGenerated(field) {
        if (!field) {
            return;
        }
        field.dataset.systemGenerated = 'true';
        delete field.dataset.userModified;
    }

    function attachRiskListeners(context) {
        markFieldAsUserModified(context.stopInput);
        markFieldAsUserModified(context.targetInput);
        markFieldAsUserModified(context.stopPercentInput);
        markFieldAsUserModified(context.targetPercentInput);
    }

    function updatePercentFromPrices(context, options = {}) {
        if (!context) {
            return;
        }

        const systemGenerated = options.systemGenerated !== false;
        const entryPrice = getPriceFromContext(context);

        const applyValue = (input, percentValue) => {
            if (!input) {
                return;
            }

            if (percentValue === null || !Number.isFinite(percentValue)) {
                // Use DataCollectionService to clear field if available
                if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
                  window.DataCollectionService.setValue(input.id, '', 'text');
                } else {
                  // Use DataCollectionService to clear field if available
                  if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
                    window.DataCollectionService.setValue(input.id, '', 'text');
                  } else {
                    input.value = '';
                  }
                }
                if (systemGenerated) {
                    delete input.dataset.userModified;
                    delete input.dataset.systemGenerated;
                }
                return;
            }

            // Use DataCollectionService to set value if available
            if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
              window.DataCollectionService.setValue(input.id, formatPercent(percentValue, context.options), 'text');
            } else {
              input.value = formatPercent(percentValue, context.options);
            }

            if (systemGenerated) {
                input.dataset.systemGenerated = 'true';
                delete input.dataset.userModified;
            } else {
                delete input.dataset.systemGenerated;
            }
        };

        if (context.stopPercentInput) {
            const stopPrice = parseInputValue(context.stopInput);
            const stopPercent = Number.isFinite(entryPrice) ? computeStopPercent(entryPrice, stopPrice) : null;
            applyValue(context.stopPercentInput, stopPercent);
        }

        if (context.targetPercentInput) {
            const targetPrice = parseInputValue(context.targetInput);
            const targetPercent = Number.isFinite(entryPrice) ? computeTargetPercent(entryPrice, targetPrice) : null;
            applyValue(context.targetPercentInput, targetPercent);
        }

        updateSummary(context);
    }

    function updatePriceFromPercent(context, type) {
        if (!context) {
            return false;
        }

        const percentInput = type === 'stop' ? context.stopPercentInput : context.targetPercentInput;
        const priceInput = type === 'stop' ? context.stopInput : context.targetInput;
        if (!percentInput || !priceInput) {
            return false;
        }

        const rawValue = typeof percentInput.value === 'string' ? percentInput.value.trim() : '';
        if (rawValue === '') {
            // Use DataCollectionService to clear field if available
            if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
              window.DataCollectionService.setValue(priceInput.id, '', 'text');
            } else {
              // Use DataCollectionService to clear field if available
              if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
                window.DataCollectionService.setValue(priceInput.id, '', 'text');
              } else {
                priceInput.value = '';
              }
            }
            delete priceInput.dataset.systemGenerated;
            return true;
        }

        const percentValue = parseNumericString(rawValue);
        const entryPrice = getPriceFromContext(context);
        const computedPrice = computePriceFromPercent(entryPrice, percentValue, type === 'stop' ? 'stop' : 'target');

        if (!Number.isFinite(computedPrice) || computedPrice <= 0) {
            return false;
        }

        // Use DataCollectionService to set value if available
        if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
          window.DataCollectionService.setValue(priceInput.id, computedPrice.toFixed(context.options.amountDecimals ?? DEFAULT_OPTIONS.amountDecimals), 'number');
        } else {
          priceInput.value = computedPrice.toFixed(context.options.amountDecimals ?? DEFAULT_OPTIONS.amountDecimals);
        }
        markFieldAsSystemGenerated(priceInput);
        return true;
    }

    function computeSummaryData(context) {
        if (!context) {
            window.Logger?.warn('⚠️ computeSummaryData: context is null', { source: 'InvestmentCalculationService' });
            return {
                tickerLabel: '-',
                sideNormalized: null,
                sideLabel: '-',
                totalInvestment: null,
                quantity: null,
                riskAmount: null,
                rewardAmount: null,
                ratio: null
            };
        }

        const tickerLabel = getSelectedOptionText(context.tickerInput);
        const sideRaw = context.sideInput ? context.sideInput.value : '';
        const sideNormalized = normalizeSide(sideRaw);
        const sideLabel = getSelectedOptionText(context.sideInput);

        const entryPrice = getPriceFromContext(context);
        const quantityValue = parseInputValue(context.quantityInput);
        const amountValue = parseInputValue(context.amountInput);
        const stopPrice = parseInputValue(context.stopInput);
        const targetPrice = parseInputValue(context.targetInput);

        // Debug logging
        window.Logger?.debug('🔍 computeSummaryData:', {
            entryPrice,
            quantityValue,
            amountValue,
            stopPrice,
            targetPrice,
            sideNormalized,
            priceInput: context.priceInput?.value,
            priceDisplay: context.priceDisplay?.textContent,
            quantityInput: context.quantityInput?.value,
            amountInput: context.amountInput?.value,
            stopInput: context.stopInput?.value,
            targetInput: context.targetInput?.value
        }, { source: 'InvestmentCalculationService' });

        let quantity = Number.isFinite(quantityValue) && quantityValue > 0 ? quantityValue : null;
        const amount = Number.isFinite(amountValue) && amountValue > 0 ? amountValue : null;

        // Calculate quantity from amount and price if quantity is not available
        // This is important for edit mode where quantity might not be loaded yet
        if (quantity === null && amount !== null && isPositiveNumber(entryPrice)) {
            const { quantity: calculatedQuantity } = computeQuantityFromInvestment(amount, entryPrice, context.options);
            if (calculatedQuantity !== null && calculatedQuantity > 0) {
                quantity = calculatedQuantity;
                window.Logger?.debug('✅ Calculated quantity from amount and price:', calculatedQuantity, { source: 'InvestmentCalculationService' });
            }
        }

        let totalInvestment = amount;
        if ((!totalInvestment || totalInvestment <= 0) && quantity !== null && isPositiveNumber(entryPrice)) {
            totalInvestment = quantity * entryPrice;
        }

        // Calculate risk and reward per unit (doesn't require quantity)
        // For Short: Risk is when price goes UP (above entry), Reward is when price goes DOWN (below entry)
        // For Long: Risk is when price goes DOWN (below entry), Reward is when price goes UP (above entry)
        // Note: stop and target can be in either direction, so we use absolute values
        let riskPerUnit = null;
        if (isPositiveNumber(entryPrice) && isPositiveNumber(stopPrice)) {
            // Risk is always the absolute difference between entry and stop
            // The direction determines if it's a loss (risk) or profit (reward)
            const diff = Math.abs(entryPrice - stopPrice);
            riskPerUnit = diff > 0 ? diff : null;
        }

        let rewardPerUnit = null;
        if (isPositiveNumber(entryPrice) && isPositiveNumber(targetPrice)) {
            // Reward is always the absolute difference between entry and target
            // The direction determines if it's a profit (reward) or loss (risk)
            const diff = Math.abs(entryPrice - targetPrice);
            rewardPerUnit = diff > 0 ? diff : null;
        }

        // Calculate risk and reward amounts (requires quantity)
        // Use calculated quantity if available
        const riskAmount = riskPerUnit !== null && quantity !== null ? riskPerUnit * quantity : null;
        const rewardAmount = rewardPerUnit !== null && quantity !== null ? rewardPerUnit * quantity : null;
        const ratio = riskAmount !== null && riskAmount > 0 && rewardAmount !== null && rewardAmount > 0
            ? rewardAmount / riskAmount
            : null;

        // Debug logging for results
        window.Logger?.debug('📊 computeSummaryData results:', {
            quantity,
            riskPerUnit,
            rewardPerUnit,
            riskAmount,
            rewardAmount,
            ratio
        }, { source: 'InvestmentCalculationService' });

        return {
            tickerLabel,
            sideNormalized,
            sideLabel,
            totalInvestment,
            quantity,
            riskAmount,
            rewardAmount,
            ratio
        };
    }

    function renderSideDisplay(sideNormalized, sideLabel) {
        if (!sideNormalized && !sideLabel) {
            return '-';
        }

        const capitalized = sideNormalized ? `${sideNormalized.charAt(0).toUpperCase()}${sideNormalized.slice(1)}` : '';
        if (window.FieldRendererService && typeof window.FieldRendererService.renderSide === 'function' && capitalized) {
            return window.FieldRendererService.renderSide(capitalized);
        }
        if (typeof window.renderSide === 'function' && capitalized) {
            return window.renderSide(capitalized);
        }

        return sideLabel || capitalized || '-';
    }

    function renderSummaryCard(context, summaryData) {
        if (!context.summaryElement) {
            return;
        }

        const currencySymbol = context.options.currencySymbol || DEFAULT_OPTIONS.currencySymbol;
        const amountDecimals = Number.isInteger(context.options.amountDecimals)
            ? context.options.amountDecimals
            : DEFAULT_OPTIONS.amountDecimals;
        const quantityText = summaryData.quantity !== null
            ? formatQuantityDisplay(summaryData.quantity, context.options)
            : '-';
        const ratioText = formatRatioDisplay(summaryData.ratio);
        const sideDisplay = renderSideDisplay(summaryData.sideNormalized, summaryData.sideLabel);

        const summaryTitle = context.options.summaryTitle || DEFAULT_OPTIONS.summaryTitle;
        const tickerDisplay = summaryData.tickerLabel || '-';

        const summaryFields = [
            { label: 'טיקר', value: tickerDisplay, valueType: 'text' },
            { label: 'צד', value: sideDisplay, valueType: 'html' },
            {
                label: 'סה"כ השקעה',
                value: summaryData.totalInvestment,
                valueType: 'amount'
            },
            {
                label: 'מספר מניות',
                value: quantityText,
                valueType: 'text',
                direction: 'ltr'
            },
            {
                label: 'סיכון / סיכוי',
                valueType: 'riskRewardSummary',
                direction: 'ltr'
            }
        ];

        context.summaryElement.innerHTML = '';

        const container = document.createElement('div');
        container.classList.add('risk-summary-card', 'summary-card');

        if (summaryTitle) {
            const titleEl = document.createElement('div');
            titleEl.classList.add('risk-summary-card__title');
            titleEl.textContent = summaryTitle;
            container.appendChild(titleEl);
        }

        const table = document.createElement('table');
        table.classList.add('risk-summary-card__table', 'table', 'table-sm');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.tableLayout = 'fixed';
        table.setAttribute('dir', 'rtl');

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.classList.add('risk-summary-card__row', 'risk-summary-card__row--header');

        const tbody = document.createElement('tbody');
        const dataRow = document.createElement('tr');
        dataRow.classList.add('risk-summary-card__row', 'risk-summary-card__row--values');

        summaryFields.forEach((field, index) => {
            const th = document.createElement('th');
            th.textContent = field.label;
            th.style.fontWeight = '600';
            th.style.fontSize = '0.75rem';
            th.style.padding = '6px 10px';
            th.style.textAlign = 'right';
            th.style.whiteSpace = 'nowrap';
            th.style.color = field.labelVariant === 'negative'
                ? 'var(--numeric-negative-medium)'
                : (field.labelVariant === 'positive'
                    ? 'var(--numeric-positive-medium)'
                    : 'var(--text-muted, #6c757d)');
            if (index < summaryFields.length - 1) {
                th.style.borderLeft = '1px solid var(--border-color, #e0e0e0)';
            }
            headerRow.appendChild(th);

            const td = document.createElement('td');
            td.style.padding = '8px 10px';
            td.style.fontSize = '0.95rem';
            td.style.color = 'var(--text-color, #1d1d1f)';
            td.style.textAlign = 'center';
            td.style.verticalAlign = 'middle';
            if (index < summaryFields.length - 1) {
                td.style.borderLeft = '1px solid var(--border-color, #e0e0e0)';
            }

            switch (field.valueType) {
                case 'html':
                    td.innerHTML = field.value || '-';
                    break;
                case 'amount':
                    td.innerHTML = renderAmountWithVariant(field.value, { currencySymbol, amountDecimals }, 'neutral');
                    break;
                case 'riskRewardSummary': {
                    const riskHtml = renderAmountWithVariant(summaryData.riskAmount, { currencySymbol, amountDecimals }, 'negative');
                    const rewardHtml = renderAmountWithVariant(summaryData.rewardAmount, { currencySymbol, amountDecimals }, 'positive');
                    const ratioHtml = escapeHtmlText(ratioText);

                    td.innerHTML = `
                        <div class="risk-summary-card__risk-reward" style="display: flex; flex-direction: column; gap: 6px; align-items: center;">
                            <div class="risk-summary-card__risk-reward-row" style="display: flex; gap: 12px; align-items: center; justify-content: center;">
                                <span>${riskHtml}</span>
                                <span style="color: var(--text-muted, #6c757d);">/</span>
                                <span>${rewardHtml}</span>
                            </div>
                            <div class="risk-summary-card__risk-reward-ratio" style="font-size: 0.85rem; color: var(--text-muted, #6c757d);" dir="ltr">
                                ${ratioHtml}
                            </div>
                        </div>
                    `;
                    break;
                }
                case 'text': {
                    const safeValue = field.value === null || field.value === undefined || field.value === ''
                        ? '-'
                        : field.value;
                    if (field.direction === 'ltr') {
                        td.innerHTML = `<span dir="ltr">${escapeHtmlText(safeValue)}</span>`;
                    } else {
                        td.textContent = safeValue;
                    }
                    break;
                }
                default: {
                    const safeValue = field.value === null || field.value === undefined || field.value === ''
                        ? '-'
                        : field.value;
                    td.textContent = safeValue;
                    break;
                }
            }

            dataRow.appendChild(td);
        });

        thead.appendChild(headerRow);
        tbody.appendChild(dataRow);
        table.appendChild(thead);
        table.appendChild(tbody);
        container.appendChild(table);

        context.summaryElement.appendChild(container);
    }

    function updateSummary(context) {
        if (!context || !context.summaryElement) {
            window.Logger?.warn('⚠️ updateSummary: context or summaryElement is missing', {
                hasContext: !!context,
                hasSummaryElement: !!context?.summaryElement,
                source: 'InvestmentCalculationService'
            });
            return;
        }

        window.Logger?.debug('🔄 updateSummary called', {
            priceInput: context.priceInput?.value,
            quantityInput: context.quantityInput?.value,
            amountInput: context.amountInput?.value,
            stopInput: context.stopInput?.value,
            targetInput: context.targetInput?.value,
            sideInput: context.sideInput?.value,
            tickerInput: context.tickerInput?.value,
            source: 'InvestmentCalculationService'
        }, { source: 'InvestmentCalculationService' });

        const summaryData = computeSummaryData(context);
        
        window.Logger?.debug('📊 updateSummary: summaryData computed', summaryData, { source: 'InvestmentCalculationService' });
        
        renderSummaryCard(context, summaryData);
        
        window.Logger?.debug('✅ updateSummary: summary card rendered', {
            riskAmount: summaryData.riskAmount,
            rewardAmount: summaryData.rewardAmount,
            ratio: summaryData.ratio,
            source: 'InvestmentCalculationService'
        }, { source: 'InvestmentCalculationService' });
    }

    function getRiskCacheKey(options) {
        const stopKey = options.stopPreferenceKey || DEFAULT_OPTIONS.stopPreferenceKey;
        const targetKey = options.targetPreferenceKey || DEFAULT_OPTIONS.targetPreferenceKey;
        return `${stopKey}|${targetKey}`;
    }

    async function loadDefaultRiskPercents(options) {
        const cacheKey = getRiskCacheKey(options);
        if (riskCache.has(cacheKey)) {
            return riskCache.get(cacheKey);
        }
        if (riskPromises.has(cacheKey)) {
            return riskPromises.get(cacheKey);
        }

        const promise = (async () => {
            let stopPercent = 2.5;
            let targetPercent = 5;
            try {
                if (typeof window.getUserPreference === 'function') {
                    const stopPref = await window.getUserPreference(options.stopPreferenceKey || DEFAULT_OPTIONS.stopPreferenceKey, null);
                    if (stopPref !== null && stopPref !== undefined && !Number.isNaN(parseFloat(stopPref))) {
                        stopPercent = Math.abs(parseFloat(stopPref));
                    }

                    const targetPref = await window.getUserPreference(options.targetPreferenceKey || DEFAULT_OPTIONS.targetPreferenceKey, null);
                    if (targetPref !== null && targetPref !== undefined && !Number.isNaN(parseFloat(targetPref))) {
                        targetPercent = Math.abs(parseFloat(targetPref));
                    }
                }
            } catch (error) {
                window.Logger?.warn?.('⚠️ Error loading risk preferences', { error, source: 'InvestmentCalculationService' });
            }

            const result = { stopPercent, targetPercent };
            riskCache.set(cacheKey, result);
            riskPromises.delete(cacheKey);
            return result;
        })();

        riskPromises.set(cacheKey, promise);
        return promise;
    }

    function applyDefaultRiskLevels(context, options = {}) {
        const { stopInput, targetInput } = context;
        if (!stopInput && !targetInput) {
            return Promise.resolve();
        }

        const price = getPriceFromContext(context);
        if (!isPositiveNumber(price)) {
            return Promise.resolve();
        }

        const force = Boolean(options.force);

        return loadDefaultRiskPercents(context.options).then(({ stopPercent, targetPercent }) => {
            if (stopInput && stopPercent > 0) {
                if (force || !stopInput.dataset.userModified) {
                    const stopPrice = price * (1 - stopPercent / 100);
                    if (isPositiveNumber(stopPrice)) {
                        // Use DataCollectionService to set value if available
                        if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
                          window.DataCollectionService.setValue(stopInput.id, stopPrice.toFixed(2), 'number');
                        } else {
                          stopInput.value = stopPrice.toFixed(2);
                        }
                        stopInput.dataset.systemGenerated = 'true';
                        if (force && options.resetUserModified !== false) {
                            delete stopInput.dataset.userModified;
                        }
                    }
                }
            }

            if (targetInput && targetPercent > 0) {
                if (force || !targetInput.dataset.userModified) {
                    const targetPrice = price * (1 + targetPercent / 100);
                    if (isPositiveNumber(targetPrice)) {
                        // Use DataCollectionService to set value if available
                        if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
                          window.DataCollectionService.setValue(targetInput.id, targetPrice.toFixed(2), 'number');
                        } else {
                          targetInput.value = targetPrice.toFixed(2);
                        }
                        targetInput.dataset.systemGenerated = 'true';
                        if (force && options.resetUserModified !== false) {
                            delete targetInput.dataset.userModified;
                        }
                    }
                }
            }

            updatePercentFromPrices(context);
            updateSummary(context);
        });
    }

    function getPriceFromContext(context) {
        const priceFromInput = parseInputValue(context.priceInput);
        if (isPositiveNumber(priceFromInput)) {
            return priceFromInput;
        }

        const priceFromDisplay = parseDisplayValue(context.priceDisplay);
        if (isPositiveNumber(priceFromDisplay)) {
            return priceFromDisplay;
        }

        return 0;
    }

    function withLock(context, callback) {
        if (!context || context.updateLock) {
            return;
        }
        context.updateLock = true;
        try {
            callback();
        } finally {
            context.updateLock = false;
        }
    }

    function updateFromAmount(context) {
        const amountValue = parseInputValue(context.amountInput);

        if (!isPositiveNumber(amountValue)) {
            if (context.quantityInput) {
                // Use DataCollectionService to clear field if available
                if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
                  window.DataCollectionService.setValue(context.quantityInput.id, '', 'text');
                } else {
                  context.quantityInput.value = '';
                }
            }
            updateSummary(context);
            return;
        }

        const price = getPriceFromContext(context);
        const { quantity, normalizedInvestment } = computeQuantityFromInvestment(amountValue, price, context.options);

        if (context.quantityInput) {
            const formattedQuantity = quantity !== null ? formatQuantity(quantity, context.options) : '';
            context.quantityInput.value = formattedQuantity;
            if (formattedQuantity !== '') {
                markFieldAsSystemGenerated(context.quantityInput);
            } else {
                delete context.quantityInput.dataset.systemGenerated;
            }
        }

        if (context.amountInput && normalizedInvestment !== null) {
            context.amountInput.value = formatAmount(normalizedInvestment, context.options);
        }

        updatePercentFromPrices(context);
        updateSummary(context);
    }

    function updateFromQuantity(context) {
        const quantityValue = parseInputValue(context.quantityInput);

        if (!isPositiveNumber(quantityValue)) {
            if (context.amountInput) {
                // Use DataCollectionService to clear field if available
                if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
                  window.DataCollectionService.setValue(context.amountInput.id, '', 'text');
                } else {
                  context.amountInput.value = '';
                }
            }
            updateSummary(context);
            return;
        }

        const price = getPriceFromContext(context);
        const amount = computeInvestmentFromQuantity(quantityValue, price);

        if (context.amountInput) {
            if (amount !== null) {
                context.amountInput.value = formatAmount(amount, context.options);
                markFieldAsSystemGenerated(context.amountInput);
            } else {
                // Use DataCollectionService to clear field if available
                if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
                  window.DataCollectionService.setValue(context.amountInput.id, '', 'text');
                } else {
                  context.amountInput.value = '';
                }
                delete context.amountInput.dataset.systemGenerated;
            }
        }

        updatePercentFromPrices(context);
        updateSummary(context);
    }

    function syncValues(context, options = {}) {
        if (!context) {
            return;
        }

        const amountValue = parseInputValue(context.amountInput);
        const quantityValue = parseInputValue(context.quantityInput);
        const preference = context.options.syncPreference || DEFAULT_OPTIONS.syncPreference;
        const force = Boolean(options.force);
        const hasAmount = isPositiveNumber(amountValue);
        const hasQuantity = isPositiveNumber(quantityValue);
        const hasAmountInput = Boolean(context.amountInput);
        const hasQuantityInput = Boolean(context.quantityInput);

        let effectivePreference = preference;
        if (preference === 'auto') {
            const amountModified = context.amountInput && context.amountInput.dataset.userModified === 'true';
            const quantityModified = context.quantityInput && context.quantityInput.dataset.userModified === 'true';

            if (quantityModified && !amountModified) {
                effectivePreference = 'quantity-first';
            } else if (amountModified && !quantityModified) {
                effectivePreference = 'amount-first';
            } else if (!quantityModified && !amountModified) {
                if (force && hasQuantity && !hasAmount) {
                    effectivePreference = 'quantity-first';
                } else if (force && hasAmount && !hasQuantity) {
                    effectivePreference = 'amount-first';
                } else {
                    effectivePreference = 'amount-first';
                }
            } else {
                effectivePreference = 'amount-first';
            }
        }

        const prefersQuantity = effectivePreference === 'quantity-first';

        if (prefersQuantity) {
            if ((force && hasQuantity && hasAmountInput) || (!hasAmount && hasQuantity && hasAmountInput)) {
                withLock(context, () => updateFromQuantity(context));
                return;
            }
            if ((force && hasAmount && hasQuantityInput) || (!hasQuantity && hasAmount && hasQuantityInput)) {
                withLock(context, () => updateFromAmount(context));
                return;
            }
        } else {
            if ((force && hasAmount && hasQuantityInput) || (!hasQuantity && hasAmount && hasQuantityInput)) {
                withLock(context, () => updateFromAmount(context));
                return;
            }
            if ((force && hasQuantity && hasAmountInput) || (!hasAmount && hasQuantity && hasAmountInput)) {
                withLock(context, () => updateFromQuantity(context));
                return;
            }
        }

        updatePercentFromPrices(context);
        updateSummary(context);
    }

    function attachListeners(context) {
        if (!context) {
            return;
        }

        const { amountInput, quantityInput, priceInput } = context;

        attachRiskListeners(context);

        if (quantityInput && !quantityInput.dataset.investmentCalcBound) {
            const markQuantityModified = () => {
                quantityInput.dataset.userModified = 'true';
                delete quantityInput.dataset.systemGenerated;
            };
            const handleQuantityCommit = () => {
                markQuantityModified();
                withLock(context, () => updateFromQuantity(context));
            };
            quantityInput.addEventListener('input', markQuantityModified);
            quantityInput.addEventListener('change', handleQuantityCommit);
            quantityInput.addEventListener('blur', handleQuantityCommit);
            quantityInput.dataset.investmentCalcBound = 'true';
        }

        if (context.stopPercentInput && !context.stopPercentInput.dataset.investmentCalcPercentInputBound) {
            const markStopPercentModified = () => {
                context.stopPercentInput.dataset.userModified = 'true';
                delete context.stopPercentInput.dataset.systemGenerated;
            };
            const handleStopPercentCommit = () => {
                markStopPercentModified();
                withLock(context, () => {
                    const updated = updatePriceFromPercent(context, 'stop');
                    if (updated) {
                        updatePercentFromPrices(context, { systemGenerated: false });
                        updateSummary(context);
                    }
                });
            };
            context.stopPercentInput.addEventListener('input', markStopPercentModified);
            context.stopPercentInput.addEventListener('change', handleStopPercentCommit);
            context.stopPercentInput.addEventListener('blur', handleStopPercentCommit);
            context.stopPercentInput.dataset.investmentCalcPercentInputBound = 'true';
        }

        if (context.targetPercentInput && !context.targetPercentInput.dataset.investmentCalcPercentInputBound) {
            const markTargetPercentModified = () => {
                context.targetPercentInput.dataset.userModified = 'true';
                delete context.targetPercentInput.dataset.systemGenerated;
            };
            const handleTargetPercentCommit = () => {
                markTargetPercentModified();
                withLock(context, () => {
                    const updated = updatePriceFromPercent(context, 'target');
                    if (updated) {
                        updatePercentFromPrices(context, { systemGenerated: false });
                        updateSummary(context);
                    }
                });
            };
            context.targetPercentInput.addEventListener('input', markTargetPercentModified);
            context.targetPercentInput.addEventListener('change', handleTargetPercentCommit);
            context.targetPercentInput.addEventListener('blur', handleTargetPercentCommit);
            context.targetPercentInput.dataset.investmentCalcPercentInputBound = 'true';
        }

        if (priceInput && !priceInput.dataset.investmentCalcBound) {
            const handler = () => {
                priceInput.dataset.userModified = 'true';
                delete priceInput.dataset.systemGenerated;
                const amountValue = parseInputValue(amountInput);
                const quantityValue = parseInputValue(quantityInput);

                if (isPositiveNumber(amountValue)) {
                    withLock(context, () => updateFromAmount(context));
                } else if (isPositiveNumber(quantityValue)) {
                    withLock(context, () => updateFromQuantity(context));
                }

                const riskPromise = applyDefaultRiskLevels(context, { force: false });
                if (riskPromise && typeof riskPromise.catch === 'function') {
                    riskPromise.catch(error => {
                        window.Logger?.warn?.('⚠️ Error applying default risk levels after price change', { error, source: 'InvestmentCalculationService' });
                    });
                }

                updatePercentFromPrices(context);
                updateSummary(context);
            };

            priceInput.addEventListener('input', handler);
            priceInput.addEventListener('change', handler);
            priceInput.addEventListener('blur', handler);
            priceInput.dataset.investmentCalcBound = 'true';
        }

        if (context.stopInput && !context.stopInput.dataset.investmentCalcPercentBound) {
            const syncStopPercent = () => {
                updatePercentFromPrices(context);
                updateSummary(context);
            };
            context.stopInput.addEventListener('change', syncStopPercent);
            context.stopInput.addEventListener('blur', syncStopPercent);
            context.stopInput.addEventListener('input', syncStopPercent);
            context.stopInput.dataset.investmentCalcPercentBound = 'true';
        }

        if (context.targetInput && !context.targetInput.dataset.investmentCalcPercentBound) {
            const syncTargetPercent = () => {
                updatePercentFromPrices(context);
                updateSummary(context);
            };
            context.targetInput.addEventListener('change', syncTargetPercent);
            context.targetInput.addEventListener('blur', syncTargetPercent);
            context.targetInput.addEventListener('input', syncTargetPercent);
            context.targetInput.dataset.investmentCalcPercentBound = 'true';
        }

        if (amountInput && !amountInput.dataset.investmentCalcBound) {
            const markAmountModified = () => {
                amountInput.dataset.userModified = 'true';
                delete amountInput.dataset.systemGenerated;
            };
            const handleAmountCommit = () => {
                markAmountModified();
                withLock(context, () => updateFromAmount(context));
            };
            amountInput.addEventListener('input', markAmountModified);
            amountInput.addEventListener('change', handleAmountCommit);
            amountInput.addEventListener('blur', handleAmountCommit);
            amountInput.dataset.investmentCalcBound = 'true';
        }

        if (context.sideInput && !context.sideInput.dataset.investmentCalcSideBound) {
            const handleSideChange = () => {
                context.sideInput.dataset.userModified = 'true';
                delete context.sideInput.dataset.systemGenerated;
                updateSummary(context);
            };
            context.sideInput.addEventListener('change', handleSideChange);
            context.sideInput.addEventListener('blur', handleSideChange);
            context.sideInput.dataset.investmentCalcSideBound = 'true';
        }

        if (context.tickerInput && !context.tickerInput.dataset.investmentCalcTickerBound) {
            const handleTickerChange = () => {
                updateSummary(context);
            };
            context.tickerInput.addEventListener('change', handleTickerChange);
            context.tickerInput.dataset.investmentCalcTickerBound = 'true';
        }
    }

    function createContext(modalElement, config) {
        if (!modalElement) {
            return null;
        }

        const options = Object.assign({}, DEFAULT_OPTIONS, config || {});

        const amountInput = resolveElement(modalElement, options.amountField || options.amountSelector);
        const quantityInput = resolveElement(modalElement, options.quantityField || options.quantitySelector);
        const priceInput = resolveElement(modalElement, options.priceField || options.priceSelector);
        const priceDisplay = resolveElement(modalElement, options.priceDisplay || options.priceDisplaySelector);
        const stopInput = resolveElement(modalElement, options.stopField || options.stopSelector);
        const targetInput = resolveElement(modalElement, options.targetField || options.targetSelector);
        const stopPercentInput = resolveElement(modalElement, options.stopPercentField || options.stopPercentSelector);
        const targetPercentInput = resolveElement(modalElement, options.targetPercentField || options.targetPercentSelector);
        const sideInput = resolveElement(modalElement, options.sideField || options.sideSelector);
        const tickerInput = resolveElement(modalElement, options.tickerField || options.tickerSelector);
        const summaryElement = resolveElement(modalElement, options.summaryField || options.summarySelector);

        if (!amountInput && !quantityInput) {
            return null;
        }

        return {
            modalElement,
            amountInput,
            quantityInput,
            priceInput,
            priceDisplay,
            stopInput,
            targetInput,
            stopPercentInput,
            targetPercentInput,
            sideInput,
            tickerInput,
            summaryElement,
            options,
            updateLock: false
        };
    }

    const InvestmentCalculationService = {
        computeQuantityFromInvestment,
        computeInvestmentFromQuantity,
        bindForm(modalElement, config = {}) {
            if (!modalElement) {
                return Promise.resolve();
            }

            let context = boundContexts.get(modalElement);
            if (context) {
                context.options = Object.assign({}, context.options, config || {});
                context.amountInput = resolveElement(modalElement, context.options.amountField || context.options.amountSelector);
                context.quantityInput = resolveElement(modalElement, context.options.quantityField || context.options.quantitySelector);
                context.priceInput = resolveElement(modalElement, context.options.priceField || context.options.priceSelector);
                context.priceDisplay = resolveElement(modalElement, context.options.priceDisplay || context.options.priceDisplaySelector);
                context.stopInput = resolveElement(modalElement, context.options.stopField || context.options.stopSelector);
                context.targetInput = resolveElement(modalElement, context.options.targetField || context.options.targetSelector);
                context.stopPercentInput = resolveElement(modalElement, context.options.stopPercentField || context.options.stopPercentSelector);
                context.targetPercentInput = resolveElement(modalElement, context.options.targetPercentField || context.options.targetPercentSelector);
                context.sideInput = resolveElement(modalElement, context.options.sideField || context.options.sideSelector);
                context.tickerInput = resolveElement(modalElement, context.options.tickerField || context.options.tickerSelector);
                context.summaryElement = resolveElement(modalElement, context.options.summaryField || context.options.summarySelector);
                attachListeners(context);
                updatePercentFromPrices(context);
                // Only update summary immediately if not in edit mode (where fields are populated later)
                // In edit mode, summary will be updated after populateForm completes
                if (config.skipInitialSummaryUpdate !== true) {
                    updateSummary(context);
                }
            } else {
                context = createContext(modalElement, config);
                if (!context) {
                    return Promise.resolve();
                }
                boundContexts.set(modalElement, context);
                attachListeners(context);
                updatePercentFromPrices(context);
                // Only update summary immediately if not in edit mode (where fields are populated later)
                // In edit mode, summary will be updated after populateForm completes
                if (config.skipInitialSummaryUpdate !== true) {
                    updateSummary(context);
                }
            }

            const forceSync = Boolean(context.options.forceSyncOnBind || context.options.forceRiskOnBind);
            syncValues(context, { force: forceSync });
            const riskPromise = applyDefaultRiskLevels(context, { force: Boolean(context.options.forceRiskOnBind) });
            if (riskPromise && typeof riskPromise.catch === 'function') {
                riskPromise.catch(error => {
                    window.Logger?.warn?.('⚠️ Error applying risk levels on bind', { error, source: 'InvestmentCalculationService' });
                });
            }
            // Update summary after risk levels are applied
            // But skip if skipInitialSummaryUpdate is true (edit mode - will be updated after populateForm)
            if (riskPromise && typeof riskPromise.then === 'function') {
                return riskPromise.then(() => {
                    if (config.skipInitialSummaryUpdate !== true) {
                        updateSummary(context);
                    }
                    return Promise.resolve();
                });
            }
            // If riskPromise is not a promise, update summary immediately (unless skipInitialSummaryUpdate is true)
            if (config.skipInitialSummaryUpdate !== true) {
                updateSummary(context);
            }
            return riskPromise || Promise.resolve();
        },
        resync(modalElement, options = {}) {
            const context = boundContexts.get(modalElement);
            if (!context) {
                return Promise.resolve();
            }

            syncValues(context, { force: Boolean(options.force) });
            updatePercentFromPrices(context);
            updateSummary(context);
            const riskPromise = applyDefaultRiskLevels(context, { force: Boolean(options.force) });
            if (riskPromise && typeof riskPromise.catch === 'function') {
                riskPromise.catch(error => {
                    window.Logger?.warn?.('⚠️ Error applying risk levels on resync', { error, source: 'InvestmentCalculationService' });
                });
            }
            // Update summary again after risk levels are applied
            if (riskPromise && typeof riskPromise.then === 'function') {
                return riskPromise.then(() => {
                    updateSummary(context);
                    return Promise.resolve();
                });
            }
            return riskPromise || Promise.resolve();
        },
        updateFromAmount(modalElement, options = {}) {
            const context = boundContexts.get(modalElement);
            if (!context) {
                return Promise.resolve();
            }
            withLock(context, () => updateFromAmount(context));
            return applyDefaultRiskLevels(context, { force: Boolean(options.force) });
        },
        updateFromQuantity(modalElement, options = {}) {
            const context = boundContexts.get(modalElement);
            if (!context) {
                return Promise.resolve();
            }
            withLock(context, () => updateFromQuantity(context));
            return applyDefaultRiskLevels(context, { force: Boolean(options.force) });
        },
        applyDefaultRisk(modalElement, options = {}) {
            const context = boundContexts.get(modalElement);
            if (!context) {
                return Promise.resolve();
            }
            return applyDefaultRiskLevels(context, options);
        }
    };

    window.InvestmentCalculationService = InvestmentCalculationService;
})();



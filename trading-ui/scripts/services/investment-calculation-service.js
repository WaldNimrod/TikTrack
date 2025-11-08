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
                input.value = '';
                if (systemGenerated) {
                    delete input.dataset.userModified;
                    delete input.dataset.systemGenerated;
                }
                return;
            }

            input.value = formatPercent(percentValue, context.options);

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
            priceInput.value = '';
            delete priceInput.dataset.systemGenerated;
            return true;
        }

        const percentValue = parseNumericString(rawValue);
        const entryPrice = getPriceFromContext(context);
        const computedPrice = computePriceFromPercent(entryPrice, percentValue, type === 'stop' ? 'stop' : 'target');

        if (!Number.isFinite(computedPrice) || computedPrice <= 0) {
            return false;
        }

        priceInput.value = computedPrice.toFixed(context.options.amountDecimals ?? DEFAULT_OPTIONS.amountDecimals);
        markFieldAsSystemGenerated(priceInput);
        return true;
    }

    function computeSummaryData(context) {
        const tickerLabel = getSelectedOptionText(context.tickerInput);
        const sideRaw = context.sideInput ? context.sideInput.value : '';
        const sideNormalized = normalizeSide(sideRaw);
        const sideLabel = getSelectedOptionText(context.sideInput);

        const entryPrice = getPriceFromContext(context);
        const quantityValue = parseInputValue(context.quantityInput);
        const amountValue = parseInputValue(context.amountInput);
        const stopPrice = parseInputValue(context.stopInput);
        const targetPrice = parseInputValue(context.targetInput);

        const quantity = Number.isFinite(quantityValue) && quantityValue > 0 ? quantityValue : null;
        const amount = Number.isFinite(amountValue) && amountValue > 0 ? amountValue : null;

        let totalInvestment = amount;
        if ((!totalInvestment || totalInvestment <= 0) && quantity !== null && isPositiveNumber(entryPrice)) {
            totalInvestment = quantity * entryPrice;
        }

        let riskPerUnit = null;
        if (quantity !== null && isPositiveNumber(entryPrice) && isPositiveNumber(stopPrice)) {
            if (sideNormalized === 'short') {
                const diff = stopPrice - entryPrice;
                riskPerUnit = diff > 0 ? diff : null;
            } else {
                const diff = entryPrice - stopPrice;
                riskPerUnit = diff > 0 ? diff : null;
            }
        }

        let rewardPerUnit = null;
        if (quantity !== null && isPositiveNumber(entryPrice) && isPositiveNumber(targetPrice)) {
            if (sideNormalized === 'short') {
                const diff = entryPrice - targetPrice;
                rewardPerUnit = diff > 0 ? diff : null;
            } else {
                const diff = targetPrice - entryPrice;
                rewardPerUnit = diff > 0 ? diff : null;
            }
        }

        const riskAmount = riskPerUnit !== null && quantity !== null ? riskPerUnit * quantity : null;
        const rewardAmount = rewardPerUnit !== null && quantity !== null ? rewardPerUnit * quantity : null;
        const ratio = riskAmount !== null && riskAmount > 0 && rewardAmount !== null && rewardAmount > 0
            ? rewardAmount / riskAmount
            : null;

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
        const amountDecimals = Number.isInteger(context.options.amountDecimals) ? context.options.amountDecimals : DEFAULT_OPTIONS.amountDecimals;
        const quantityText = summaryData.quantity !== null ? formatQuantityDisplay(summaryData.quantity, context.options) : '-';
        const investmentText = summaryData.totalInvestment !== null
            ? formatCurrencyDisplay(summaryData.totalInvestment, currencySymbol, amountDecimals)
            : '-';
        const riskText = summaryData.riskAmount !== null
            ? formatCurrencyDisplay(summaryData.riskAmount, currencySymbol, amountDecimals)
            : '-';
        const rewardText = summaryData.rewardAmount !== null
            ? formatCurrencyDisplay(summaryData.rewardAmount, currencySymbol, amountDecimals)
            : '-';
        const ratioText = formatRatioDisplay(summaryData.ratio);
        const sideDisplay = renderSideDisplay(summaryData.sideNormalized, summaryData.sideLabel);

        const summaryTitle = context.options.summaryTitle || DEFAULT_OPTIONS.summaryTitle;
        const tickerDisplay = summaryData.tickerLabel || '-';

        const summaryFields = [
            { label: 'טיקר', value: tickerDisplay },
            { label: 'צד', value: sideDisplay, allowHtml: true },
            { label: 'סה"כ השקעה', value: investmentText, direction: 'ltr' },
            { label: 'מספר מניות', value: quantityText, direction: 'ltr' },
            { label: 'סכום סיכון', value: riskText, direction: 'ltr' },
            { label: 'סכום סיכוי', value: rewardText, direction: 'ltr' },
            { label: 'יחס סיכון/סיכוי', value: ratioText, direction: 'ltr' }
        ];

        const summaryHtml = `
            <div class="risk-summary-card" style="background: var(--card-background, #f9f9f9); border: 1px solid var(--border-color, #e0e0e0); border-radius: 12px; padding: 16px;">
                <div class="risk-summary-card__title" style="font-weight: 600; font-size: 1rem; margin-bottom: 12px; color: var(--text-color, #1d1d1f);">
                    ${summaryTitle}
                </div>
                <div class="risk-summary-card__grid" style="display: grid; gap: 8px; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));">
                    ${summaryFields.map(field => `
                        <div class="risk-summary-card__item" style="background: var(--light-color, #ffffff); border: 1px solid var(--border-color, #e0e0e0); border-radius: 8px; padding: 8px 12px; display: flex; flex-direction: column; gap: 4px;">
                            <span class="risk-summary-card__label" style="font-size: 0.75rem; color: var(--text-muted, #6c757d);">${field.label}</span>
                            <span class="risk-summary-card__value" style="font-size: 0.95rem; color: var(--text-color, #1d1d1f);${field.direction ? ` direction: ${field.direction}; text-align: ${field.direction === 'ltr' ? 'left' : 'right'};` : ''}">
                                ${field.allowHtml ? field.value : String(field.value)}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        context.summaryElement.innerHTML = summaryHtml;
    }

    function updateSummary(context) {
        if (!context || !context.summaryElement) {
            return;
        }

        const summaryData = computeSummaryData(context);
        renderSummaryCard(context, summaryData);
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
                        stopInput.value = stopPrice.toFixed(2);
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
                        targetInput.value = targetPrice.toFixed(2);
                        targetInput.dataset.systemGenerated = 'true';
                        if (force && options.resetUserModified !== false) {
                            delete targetInput.dataset.userModified;
                        }
                    }
                }
            }

            updatePercentFromPrices(context);
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
                context.quantityInput.value = '';
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
    }

    function updateFromQuantity(context) {
        const quantityValue = parseInputValue(context.quantityInput);

        if (!isPositiveNumber(quantityValue)) {
            if (context.amountInput) {
                context.amountInput.value = '';
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
                context.amountInput.value = '';
                delete context.amountInput.dataset.systemGenerated;
            }
        }

        updatePercentFromPrices(context);
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
            };

            priceInput.addEventListener('input', handler);
            priceInput.addEventListener('change', handler);
            priceInput.addEventListener('blur', handler);
            priceInput.dataset.investmentCalcBound = 'true';
        }

        if (context.stopInput && !context.stopInput.dataset.investmentCalcPercentBound) {
            const syncStopPercent = () => {
                updatePercentFromPrices(context);
            };
            context.stopInput.addEventListener('change', syncStopPercent);
            context.stopInput.addEventListener('blur', syncStopPercent);
            context.stopInput.dataset.investmentCalcPercentBound = 'true';
        }

        if (context.targetInput && !context.targetInput.dataset.investmentCalcPercentBound) {
            const syncTargetPercent = () => {
                updatePercentFromPrices(context);
            };
            context.targetInput.addEventListener('change', syncTargetPercent);
            context.targetInput.addEventListener('blur', syncTargetPercent);
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
                updateSummary(context);
            } else {
                context = createContext(modalElement, config);
                if (!context) {
                    return Promise.resolve();
                }
                boundContexts.set(modalElement, context);
                attachListeners(context);
                updatePercentFromPrices(context);
                updateSummary(context);
            }

            const forceSync = Boolean(context.options.forceSyncOnBind || context.options.forceRiskOnBind);
            syncValues(context, { force: forceSync });
            const riskPromise = applyDefaultRiskLevels(context, { force: Boolean(context.options.forceRiskOnBind) });
            if (riskPromise && typeof riskPromise.catch === 'function') {
                riskPromise.catch(error => {
                    window.Logger?.warn?.('⚠️ Error applying risk levels on bind', { error, source: 'InvestmentCalculationService' });
                });
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
            const riskPromise = applyDefaultRiskLevels(context, { force: Boolean(options.force) });
            if (riskPromise && typeof riskPromise.catch === 'function') {
                riskPromise.catch(error => {
                    window.Logger?.warn?.('⚠️ Error applying risk levels on resync', { error, source: 'InvestmentCalculationService' });
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



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
        stopPreferenceKey: 'defaultStopLoss',
        targetPreferenceKey: 'defaultTargetPrice',
        forceRiskOnBind: false,
        forceSyncOnBind: false
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
    }

    function updateFromQuantity(context) {
        const quantityValue = parseInputValue(context.quantityInput);

        if (!isPositiveNumber(quantityValue)) {
            if (context.amountInput) {
                context.amountInput.value = '';
            }
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
    }

    function attachListeners(context) {
        if (!context) {
            return;
        }

        const { amountInput, quantityInput, priceInput } = context;

        attachRiskListeners(context);

        if (amountInput && !amountInput.dataset.investmentCalcBound) {
            const handleAmountChange = () => {
                amountInput.dataset.userModified = 'true';
                delete amountInput.dataset.systemGenerated;
                withLock(context, () => updateFromAmount(context));
            };
            amountInput.addEventListener('input', handleAmountChange);
            amountInput.addEventListener('change', handleAmountChange);
            amountInput.addEventListener('blur', handleAmountChange);
            amountInput.dataset.investmentCalcBound = 'true';
        }

        if (quantityInput && !quantityInput.dataset.investmentCalcBound) {
            const handleQuantityChange = () => {
                quantityInput.dataset.userModified = 'true';
                delete quantityInput.dataset.systemGenerated;
                withLock(context, () => updateFromQuantity(context));
            };
            quantityInput.addEventListener('input', handleQuantityChange);
            quantityInput.addEventListener('change', handleQuantityChange);
            quantityInput.addEventListener('blur', handleQuantityChange);
            quantityInput.dataset.investmentCalcBound = 'true';
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
            };

            priceInput.addEventListener('input', handler);
            priceInput.addEventListener('change', handler);
            priceInput.addEventListener('blur', handler);
            priceInput.dataset.investmentCalcBound = 'true';
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
                attachListeners(context);
            } else {
                context = createContext(modalElement, config);
                if (!context) {
                    return Promise.resolve();
                }
                boundContexts.set(modalElement, context);
                attachListeners(context);
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



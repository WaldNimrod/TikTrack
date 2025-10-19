/**
 * Select Populator Service - TikTrack
 * ===================================
 * 
 * מערכת מרכזית למילוי select boxes מ-API
 * מחליפה קוד חוזר ב-16 מקומות במערכת
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 * 
 * תכונות:
 * - טעינת tickers, accounts, currencies, trade plans מ-API
 * - מילוי select box אוטומטי
 * - סימון ברירת מחדל (מהעדפות או ערך ספציפי)
 * - תמיכה באופציה ריקה ("בחר...")
 * - cache של נתונים
 */

// ===== SELECT POPULATOR SERVICE =====

class SelectPopulatorService {
    static _getPreferenceFromMemory(preferenceName, aliases = []) {
        try {
            const prefs = window.PreferencesSystem?.manager?.currentPreferences || {};
            if (preferenceName in prefs) return prefs[preferenceName];
            for (const key of aliases) {
                if (key in prefs) return prefs[key];
            }
        } catch (_) {}
        return null;
    }
    /**
     * מילוי select box של טיקרים
     * 
     * @param {string} selectId - ID של ה-select element
     * @param {Object} options - אופציות: { includeEmpty: true, defaultValue: null, filterFn: null }
     * @returns {Promise<void>}
     * 
     * @example
     * await SelectPopulatorService.populateTickersSelect('tickerSelect', { 
     *   includeEmpty: true, 
     *   defaultValue: 5 
     * });
     */
    static async populateTickersSelect(selectId, options = {}) {
        const select = document.getElementById(selectId);
        if (!select) {
            console.warn(`⚠️ Select ${selectId} לא נמצא`);
            return;
        }
        
        try {
            // טעינת טיקרים מ-API
            const response = await fetch('/api/tickers/');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            let tickers = responseData.data || responseData || [];
            
            // סינון אם נדרש
            if (options.filterFn && typeof options.filterFn === 'function') {
                tickers = tickers.filter(options.filterFn);
            }
            
            // מילוי ה-select
            this._populateSelect(select, tickers, {
                valueField: 'id',
                textField: 'symbol',
                includeEmpty: options.includeEmpty !== false,
                emptyText: options.emptyText || 'בחר טיקר...',
                defaultValue: options.defaultValue
            });
            
            console.log(`✅ נטענו ${tickers.length} טיקרים ל-${selectId}`);
            
        } catch (error) {
            console.error('❌ שגיאה בטעינת טיקרים:', error);
        }
    }

    /**
     * מילוי select box של חשבונות מסחר
     * 
     * @param {string} selectId - ID של ה-select element
     * @param {Object} options - אופציות
     * @returns {Promise<void>}
     * 
     * @example
     * await SelectPopulatorService.populateAccountsSelect('accountSelect', { 
     *   defaultFromPreferences: true 
     * });
     */
    static async populateAccountsSelect(selectId, options = {}) {
        const select = document.getElementById(selectId);
        if (!select) {
            console.warn(`⚠️ Select ${selectId} לא נמצא`);
            return;
        }
        
        try {
            // טעינת חשבונות מ-API
            const response = await fetch('/api/trading-accounts/');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            let accounts = responseData.data || responseData || [];
            
            // סינון אם נדרש
            if (options.filterFn && typeof options.filterFn === 'function') {
                accounts = accounts.filter(options.filterFn);
            }
            
            // ברירת מחדל מהעדפות
            let defaultValue = options.defaultValue;
            if (options.defaultFromPreferences) {
                try {
                    const prefValue = this._getPreferenceFromMemory('default_trading_account', ['defaultTradingAccount', 'trading_account_id']);
                    if (prefValue) defaultValue = parseInt(prefValue);
                } catch (_) { /* שקט */ }
            }
            
            // מילוי ה-select
            this._populateSelect(select, accounts, {
                valueField: 'id',
                textField: 'name',
                includeEmpty: options.includeEmpty !== false,
                emptyText: options.emptyText || 'בחר חשבון...',
                defaultValue: defaultValue,
                defaultText: options.defaultText
            });
            
            console.log(`✅ נטענו ${accounts.length} חשבונות ל-${selectId}`);
            
        } catch (error) {
            console.error('❌ שגיאה בטעינת חשבונות:', error);
        }
    }

    /**
     * מילוי select box של מטבעות
     * 
     * @param {string} selectId - ID של ה-select element
     * @param {Object} options - אופציות
     * @returns {Promise<void>}
     * 
     * @example
     * await SelectPopulatorService.populateCurrenciesSelect('currencySelect', { 
     *   defaultFromPreferences: true 
     * });
     */
    static async populateCurrenciesSelect(selectId, options = {}) {
        const select = document.getElementById(selectId);
        if (!select) {
            console.warn(`⚠️ Select ${selectId} לא נמצא`);
            return;
        }
        
        try {
            // טעינת מטבעות מ-API
            const response = await fetch('/api/currencies/');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            let currencies = responseData.data || responseData || [];
            
            // סינון אם נדרש
            if (options.filterFn && typeof options.filterFn === 'function') {
                currencies = currencies.filter(options.filterFn);
            }
            
            // ברירת מחדל מהעדפות
            let defaultValue = options.defaultValue;
            if (options.defaultFromPreferences) {
                try {
                    // 1) מזהה ישיר
                    let prefValue = this._getPreferenceFromMemory('default_currency', ['defaultCurrencyId', 'currency_id']);
                    if (prefValue) {
                        defaultValue = parseInt(prefValue);
                    }

                    // 2) אם עדיין אין, ננסה לפי אליאסים טקסטואליים (כולל "CODE - NAME" ו-"NAME (CODE)")
                    if (!defaultValue) {
                        const raw = this._getPreferenceFromMemory('primaryCurrency', ['default_currency_code', 'default_currency_symbol', 'defaultCurrency']);
                        if (raw) {
                            const s = String(raw).trim();
                            const candidates = new Set();
                            const upper = s.toUpperCase();
                            const lower = s.toLowerCase();

                            // המחרוזת המקורית בשני רישיות
                            candidates.add(upper);
                            candidates.add(lower);

                            // תבנית "CODE - NAME"
                            if (s.includes('-')) {
                                candidates.add(s.split('-')[0].trim().toUpperCase());
                                candidates.add(s.split('-')[0].trim().toLowerCase());
                            }

                            // תבנית "NAME (CODE)"
                            const parenCode = (s.match(/\(([^)]+)\)/) || [])[1];
                            if (parenCode) {
                                candidates.add(parenCode.trim().toUpperCase());
                                candidates.add(parenCode.trim().toLowerCase());
                            }

                            // קוד 3-4 אותיות גדולות מאותר מהמחרוזת
                            const codeGuess = (s.match(/[A-Z]{3,4}/) || [])[0];
                            if (codeGuess) {
                                candidates.add(codeGuess.toUpperCase());
                                candidates.add(codeGuess.toLowerCase());
                            }

                            const match = currencies.find(c => {
                                const code = (c.code || c.symbol || '').toString();
                                const name = (c.name || '').toString();
                                return candidates.has(code.toUpperCase()) || candidates.has(code.toLowerCase()) ||
                                       candidates.has(name.toUpperCase()) || candidates.has(name.toLowerCase()) ||
                                       candidates.has(`${name} (${code})`.toUpperCase()) || candidates.has(`${name} (${code})`.toLowerCase());
                            });
                            if (match) defaultValue = match.id;
                        }
                    }
                } catch (_) { /* שקט */ }
            }
            
            // מילוי ה-select עם שם + קוד/סימול
            this._populateSelect(select, currencies, {
                valueField: 'id',
                textField: (item) => `${item.code || item.symbol}`,
                includeEmpty: options.includeEmpty !== false,
                emptyText: options.emptyText || 'בחר מטבע...',
                defaultValue: defaultValue,
                defaultText: options.defaultText
            });

            // Debug
            try {
                if (select && select.id) {
                    const selectedText = select.options[select.selectedIndex]?.text || '';
                    console.debug(`[SelectPopulator] ${select.id} defaultFromPreferences=${!!options.defaultFromPreferences}`, {
                        defaultValue,
                        selectedValue: select.value,
                        selectedText
                    });
                }
            } catch (_) {}
            
            console.log(`✅ נטענו ${currencies.length} מטבעות ל-${selectId}`);
            
        } catch (error) {
            console.error('❌ שגיאה בטעינת מטבעות:', error);
        }
    }

    /**
     * מילוי select box של תוכניות מסחר
     * 
     * @param {string} selectId - ID של ה-select element
     * @param {Object} options - אופציות
     * @returns {Promise<void>}
     * 
     * @example
     * await SelectPopulatorService.populateTradePlansSelect('planSelect');
     */
    static async populateTradePlansSelect(selectId, options = {}) {
        const select = document.getElementById(selectId);
        if (!select) {
            console.warn(`⚠️ Select ${selectId} לא נמצא`);
            return;
        }
        
        try {
            // טעינת תוכניות מ-API
            const response = await fetch('/api/trade_plans/');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            let plans = responseData.data || responseData || [];
            
            // סינון אם נדרש (למשל רק פעילים)
            if (options.filterFn && typeof options.filterFn === 'function') {
                plans = plans.filter(options.filterFn);
            }
            
            // מילוי ה-select
            this._populateSelect(select, plans, {
                valueField: 'id',
                textField: (item) => `${item.ticker?.symbol || 'N/A'} - ${item.side || 'N/A'}`,
                includeEmpty: options.includeEmpty !== false,
                emptyText: options.emptyText || 'בחר תכנון...',
                defaultValue: options.defaultValue
            });
            
            console.log(`✅ נטענו ${plans.length} תכנונים ל-${selectId}`);
            
        } catch (error) {
            console.error('❌ שגיאה בטעינת תכנונים:', error);
        }
    }

    /**
     * מילוי select גנרי מ-API
     * 
     * @param {string} selectId - ID של ה-select element
     * @param {string} endpoint - endpoint API
     * @param {Object} config - הגדרות: { valueField, textField, includeEmpty, emptyText, defaultValue, filterFn }
     * @returns {Promise<void>}
     * 
     * @example
     * await SelectPopulatorService.populateGenericSelect('mySelect', '/api/items/', {
     *   valueField: 'id',
     *   textField: 'name',
     *   defaultValue: 5
     * });
     */
    static async populateGenericSelect(selectId, endpoint, config = {}) {
        const select = document.getElementById(selectId);
        if (!select) {
            console.warn(`⚠️ Select ${selectId} לא נמצא`);
            return;
        }
        
        try {
            // טעינת נתונים מ-API
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            let items = responseData.data || responseData || [];
            
            // סינון אם נדרש
            if (config.filterFn && typeof config.filterFn === 'function') {
                items = items.filter(config.filterFn);
            }
            
            // מילוי ה-select
            this._populateSelect(select, items, {
                valueField: config.valueField || 'id',
                textField: config.textField || 'name',
                includeEmpty: config.includeEmpty !== false,
                emptyText: config.emptyText || 'בחר...',
                defaultValue: config.defaultValue
            });
            
            console.log(`✅ נטענו ${items.length} פריטים ל-${selectId}`);
            
        } catch (error) {
            console.error(`❌ שגיאה בטעינת נתונים מ-${endpoint}:`, error);
        }
    }

    // ===== PRIVATE HELPER METHOD =====

    /**
     * מילוי select box עם נתונים
     * @private
     */
    static _populateSelect(select, items, config) {
        // ניקוי האופציות הקיימות
        select.innerHTML = '';
        
        // הוספת אופציה ריקה אם נדרש
        if (config.includeEmpty) {
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = config.emptyText || 'בחר...';
            select.appendChild(emptyOption);
        }
        
        // הוספת כל הפריטים
        items.forEach((item, index) => {
            const option = document.createElement('option');
            
            // קביעת value
            if (typeof config.valueField === 'function') {
                option.value = config.valueField(item);
            } else {
                option.value = item[config.valueField];
            }
            
            // קביעת text
            if (typeof config.textField === 'function') {
                option.textContent = config.textField(item);
            } else {
                option.textContent = item[config.textField];
            }
            
            select.appendChild(option);
        });
        
        // סימון ברירת מחדל לפי value או לפי טקסט
        if (config.defaultValue !== undefined && config.defaultValue !== null) {
            select.value = config.defaultValue;
        } else if (config.defaultText) {
            const options = Array.from(select.options);
            const match = options.find(opt => (opt.textContent || '').trim() === String(config.defaultText).trim());
            if (match) {
                select.value = match.value;
            }
        }
    }
}

// ===== EXPORT TO GLOBAL SCOPE =====

window.SelectPopulatorService = SelectPopulatorService;

// Shortcuts למתודות נפוצות
window.populateTickersSelect = (selectId, options) => SelectPopulatorService.populateTickersSelect(selectId, options);
window.populateAccountsSelect = (selectId, options) => SelectPopulatorService.populateAccountsSelect(selectId, options);
window.populateCurrenciesSelect = (selectId, options) => SelectPopulatorService.populateCurrenciesSelect(selectId, options);
window.populateTradePlansSelect = (selectId, options) => SelectPopulatorService.populateTradePlansSelect(selectId, options);
window.populateGenericSelect = (selectId, endpoint, config) => SelectPopulatorService.populateGenericSelect(selectId, endpoint, config);



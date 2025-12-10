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


// ===== FUNCTION INDEX =====

// === Event Handlers ===
// - handleRelationTypeChange() - Handlerelationtypechange
// - handleTickerChange() - Handletickerchange

// === Data Functions ===
// - getFilteredTickers() - Getfilteredtickers

// === Other ===
// - populateSelect() - Populateselect
// - populateRelatedObjects() - Populaterelatedobjects

// ===== SELECT POPULATOR SERVICE =====

class SelectPopulatorService {
    /**
     * בדיקה האם תלויות נדרשות זמינות ומאותחלות
     * @private
     * @returns {Object} Object with availability flags
     */
    static _checkDependencies() {
        const deps = {
            preferencesCore: false,
            preferencesSystem: false,
            unifiedCacheManager: false
        };
        
        // בדיקת PreferencesCore - צריך להיות קיים וגם מאותחל
        if (typeof window.PreferencesCore !== 'undefined' && window.PreferencesCore) {
            try {
                // בדיקה שהמערכת זמינה לשימוש
                if (typeof window.PreferencesCore.currentUserId !== 'undefined') {
                    deps.preferencesCore = true;
                }
            } catch (e) {
                // PreferencesCore קיים אבל לא מאותחל
            }
        }
        
        // בדיקת PreferencesSystem - אופציונלי, לא נדרש
        if (typeof window.PreferencesSystem !== 'undefined' && window.PreferencesSystem) {
            try {
                if (window.PreferencesSystem.manager && 
                    typeof window.PreferencesSystem.manager.currentPreferences !== 'undefined') {
                    deps.preferencesSystem = true;
                }
            } catch (e) {
                // PreferencesSystem לא זמין - זה בסדר, זה אופציונלי
            }
        }
        
        // בדיקת UnifiedCacheManager - אופציונלי
        if (typeof window.UnifiedCacheManager !== 'undefined' && window.UnifiedCacheManager) {
            try {
                // בדיקה שהמערכת מאותחלת
                if (window.UnifiedCacheManager.initialized !== false) {
                    deps.unifiedCacheManager = true;
                }
            } catch (e) {
                // UnifiedCacheManager לא זמין - זה בסדר, יש fallback
            }
        }
        
        return deps;
    }
    
    static async _getPreferenceFromMemory(preferenceName, aliases = []) {
        console.log(`🔍 _getPreferenceFromMemory called for: ${preferenceName} with aliases:`, aliases);
        
        try {
            // בדיקת תלויות עם validation
            const deps = this._checkDependencies();
            
            // First, try PreferencesCore (synchronous check with cached data)
            if (deps.preferencesCore && deps.unifiedCacheManager) {
                try {
                    // Build cache key like PreferencesCore does
                    const userId = window.PreferencesCore.currentUserId || 1;
                    const profileId = window.PreferencesCore.currentProfileId !== null ? window.PreferencesCore.currentProfileId : 0;
                    
                    console.log(`🔍 Looking for preference ${preferenceName} with userId=${userId}, profileId=${profileId}`);
                    
                    // Try multiple profile IDs in case preferences are saved for different profiles
                    const profileIdsToTry = profileId !== 0 ? [profileId, 0] : [0];
                    
                    for (const tryProfileId of profileIdsToTry) {
                        const cacheKey = `preference_${preferenceName}_${userId}_${tryProfileId}`;
                        console.log(`🔍 Trying cache key: tiktrack_${cacheKey}`);
                        
                        // Try to get from cache synchronously - check both tiktrack_ prefix and without it
                        try {
                            // Try tiktrack_ prefix first
                            let cached = localStorage.getItem(`tiktrack_${cacheKey}`);
                            if (cached) {
                                const parsed = JSON.parse(cached);
                                console.log(`✅ Found preference ${preferenceName} in UnifiedCache (profileId=${tryProfileId}):`, parsed);
                                return parsed;
                            }
                            
                            // Try without prefix
                            cached = localStorage.getItem(cacheKey);
                            if (cached) {
                                const parsed = JSON.parse(cached);
                                console.log(`✅ Found preference ${preferenceName} in UnifiedCache (no prefix, profileId=${tryProfileId}):`, parsed);
                                return parsed;
                            }
                        } catch (e) {
                            console.log(`⚠️ Error reading from UnifiedCache for ${preferenceName} (profileId=${tryProfileId}):`, e);
                        }
                    }
                    
                    console.log(`⚠️ Preference ${preferenceName} not found in localStorage for any profile`);
                } catch (e) {
                    console.warn(`⚠️ Error accessing PreferencesCore/UnifiedCacheManager:`, e);
                    // Continue to fallback methods
                }
            } else if (!deps.preferencesCore) {
                console.log(`⚠️ PreferencesCore not available or not initialized - using fallback methods`);
            } else if (!deps.unifiedCacheManager) {
                console.log(`⚠️ UnifiedCacheManager not available or not initialized - using fallback methods`);
            }
            
            // Try window.currentPreferences (fallback)
            let prefs = {};
            if (window.currentPreferences && typeof window.currentPreferences === 'object') {
                prefs = window.currentPreferences;
                console.log(`✅ Using window.currentPreferences, found ${Object.keys(prefs).length} preferences`);
            } else if (deps.preferencesSystem && window.PreferencesSystem?.manager?.currentPreferences) {
                prefs = window.PreferencesSystem.manager.currentPreferences;
                console.log(`✅ Using PreferencesSystem.currentPreferences, found ${Object.keys(prefs).length} preferences`);
            } else {
                console.log(`⚠️ window.currentPreferences not available, trying localStorage fallback`);
                // Fallback to localStorage
                try {
                    const stored = localStorage.getItem('tikTrack_preferences');
                    if (stored) {
                        prefs = JSON.parse(stored);
                        console.log(`✅ Loaded preferences from localStorage, found ${Object.keys(prefs).length} preferences`);
                    } else {
                        console.log(`⚠️ No preferences found in localStorage 'tikTrack_preferences'`);
                    }
                } catch (e) {
                    console.warn(`⚠️ Failed to parse localStorage preferences:`, e);
                }
            }
            
            console.log(`🔍 Looking for preference: ${preferenceName}`);
            if (preferenceName in prefs) {
                console.log(`✅ Found preference ${preferenceName}: ${prefs[preferenceName]}`);
                return prefs[preferenceName];
            } else {
                console.log(`⚠️ Preference ${preferenceName} not found directly`);
            }
            
            console.log(`🔍 Trying aliases:`, aliases);
            for (const key of aliases) {
                if (key in prefs) {
                    console.log(`✅ Found preference via alias ${key}: ${prefs[key]}`);
                    return prefs[key];
                }
            }
            console.log(`⚠️ No preference found for ${preferenceName} or any aliases`);
        } catch (e) {
            console.error(`❌ Error in _getPreferenceFromMemory:`, e);
        }
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
    static async populateTickersSelect(selectIdOrElement, options = {}) {
        const selectIdentifier = typeof selectIdOrElement === 'string'
            ? selectIdOrElement
            : (selectIdOrElement?.id || selectIdOrElement?.name || selectIdOrElement?.getAttribute?.('data-select-id') || 'element');
        
        console.log(`🔍 [SelectPopulatorService] populateTickersSelect called for: ${selectIdentifier}`, {
            isString: typeof selectIdOrElement === 'string',
            options: options,
            hasFilterFn: !!(options.filterFn && typeof options.filterFn === 'function')
        });
        
        // Support both ID string and element object
        const select = typeof selectIdOrElement === 'string' 
            ? document.getElementById(selectIdOrElement)
            : selectIdOrElement;
        if (!select) {
            console.warn(`⚠️ Select ${selectIdentifier} לא נמצא`);
            return;
        }
        
        console.log(`🔍 [SelectPopulatorService] Select element found:`, {
            id: select.id,
            optionsBefore: select.options.length,
            valueBefore: select.value,
            innerHTMLBefore: select.innerHTML.substring(0, 100)
        });
        
        try {
            // טעינת טיקרים מ-API - רק טיקרים של המשתמש
            console.log(`🔍 [SelectPopulatorService] Fetching user tickers from /api/tickers/my...`);
            const response = await fetch('/api/tickers/my');
            if (!response.ok) {
                // Fallback to /api/tickers/ if /my fails
                console.warn(`⚠️ [SelectPopulatorService] /api/tickers/my failed, trying /api/tickers/...`);
                const fallbackResponse = await fetch('/api/tickers/');
                if (!fallbackResponse.ok) {
                    throw new Error(`HTTP error! status: ${fallbackResponse.status}`);
                }
                const fallbackData = await fallbackResponse.json();
                var tickers = fallbackData.data || fallbackData || [];
            } else {
                const responseData = await response.json();
                var tickers = responseData.data || responseData || [];
            }
            console.log(`🔍 [SelectPopulatorService] Got ${tickers.length} tickers from API`);
            
            // סינון אם נדרש
            if (options.filterFn && typeof options.filterFn === 'function') {
                const beforeFilter = tickers.length;
                tickers = tickers.filter(options.filterFn);
                console.log(`🔍 [SelectPopulatorService] Filtered ${beforeFilter} → ${tickers.length} tickers`);
            }
            
            // Sort tickers alphabetically using centralized business logic
            if (window.tickersData && typeof window.tickersData.sortTickersAlphabetically === 'function') {
                tickers = window.tickersData.sortTickersAlphabetically(tickers);
            } else {
                // Fallback sorting if service not available
                tickers.sort((a, b) => {
                    const symbolA = (a.symbol || a.ticker_symbol || '').toUpperCase();
                    const symbolB = (b.symbol || b.ticker_symbol || '').toUpperCase();
                    const symbolCompare = symbolA.localeCompare(symbolB, 'he', { numeric: true, sensitivity: 'base' });
                    if (symbolCompare !== 0) return symbolCompare;
                    const nameA = (a.name || '').toUpperCase();
                    const nameB = (b.name || '').toUpperCase();
                    return nameA.localeCompare(nameB, 'he', { numeric: true, sensitivity: 'base' });
                });
            }
            
            // מילוי ה-select - הצג טיקר + שם חברה
            console.log(`🔍 [SelectPopulatorService] Calling _populateSelect with ${tickers.length} tickers...`);
            
            // Format tickers to show symbol + company name (use custom name if available)
            const formattedTickers = tickers.map(ticker => {
                const displayName = ticker.name_custom || ticker.name || ticker.symbol;
                return {
                    ...ticker,
                    display_text: displayName ? `${ticker.symbol} - ${displayName}` : ticker.symbol
                };
            });
            
            this._populateSelect(select, formattedTickers, {
                valueField: 'id',
                textField: 'display_text',
                includeEmpty: options.includeEmpty !== false,
                emptyText: options.emptyText || 'בחר טיקר...',
                defaultValue: options.defaultValue
            });
            
            console.log(`✅ נטענו ${tickers.length} טיקרים ל-${selectIdentifier}`, {
                optionsAfter: select.options.length,
                valueAfter: select.value,
                optionsList: Array.from(select.options).slice(0, 5).map(opt => ({ value: opt.value, text: opt.textContent }))
            });
            
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
    static async populateAccountsSelect(selectIdOrElement, options = {}) {
        const selectIdentifier = typeof selectIdOrElement === 'string'
            ? selectIdOrElement
            : (selectIdOrElement?.id || selectIdOrElement?.name || selectIdOrElement?.getAttribute?.('data-select-id') || 'element');
        
        // Support both ID string and element object
        const select = typeof selectIdOrElement === 'string' 
            ? document.getElementById(selectIdOrElement)
            : selectIdOrElement;
        if (!select) {
            console.warn(`⚠️ Select ${selectIdentifier} לא נמצא`);
            return;
        }
        
        try {
            // טעינת חשבונות פעילים בלבד מ-API
            // אם רוצים כל החשבונות, יש להשתמש ב-filterFn או להגדיר includeAll: true
            const baseEndpoint = options.includeAll ? '/api/trading-accounts/' : '/api/trading-accounts/open';
            // Add cache busting to prevent stale cache issues in production
            const endpoint = `${baseEndpoint}?_t=${Date.now()}`;
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            let accounts = responseData.data || responseData || [];
            
            // סינון נוסף אם נדרש
            if (options.filterFn && typeof options.filterFn === 'function') {
                accounts = accounts.filter(options.filterFn);
            }
            
            // ברירת מחדל מהעדפות
            let defaultValue = options.defaultValue;
            if (options.defaultFromPreferences) {
                try {
                    const prefValue = await this._getPreferenceFromMemory('default_trading_account');
                    if (prefValue) {
                        // Try to parse as integer ID first
                        const parsed = parseInt(prefValue);
                        if (!isNaN(parsed)) {
                            defaultValue = parsed;
                        }
                    }
                } catch (e) { 
                    console.warn(`⚠️ Error getting account preference:`, e);
                }
            }
            
            // מילוי ה-select
            this._populateSelect(select, accounts, {
                valueField: 'id',
                textField: 'name',
                includeEmpty: options.includeEmpty !== false,
                emptyText: options.emptyText || 'בחר חשבון מסחר...',
                defaultValue: defaultValue,
                defaultText: options.defaultText
            });
            
            console.log(`✅ נטענו ${accounts.length} חשבונות ל-${selectIdentifier}`);
            
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
    static async populateCurrenciesSelect(selectIdOrElement, options = {}) {
        const selectIdentifier = typeof selectIdOrElement === 'string'
            ? selectIdOrElement
            : (selectIdOrElement?.id || selectIdOrElement?.name || selectIdOrElement?.getAttribute?.('data-select-id') || 'element');
        
        // Support both ID string and element object
        const select = typeof selectIdOrElement === 'string' 
            ? document.getElementById(selectIdOrElement)
            : selectIdOrElement;
        if (!select) {
            console.warn(`⚠️ Select ${selectIdentifier} לא נמצא`);
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
                    let prefValue = await this._getPreferenceFromMemory('default_currency', ['defaultCurrencyId', 'currency_id']);
                    if (prefValue) {
                        defaultValue = parseInt(prefValue);
                    }

                    // 2) אם עדיין אין, ננסה לפי אליאסים טקסטואליים (כולל "CODE - NAME" ו-"NAME (CODE)")
                    if (!defaultValue) {
                        const raw = await this._getPreferenceFromMemory('primaryCurrency', ['default_currency_code', 'default_currency_symbol', 'defaultCurrency']);
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
            
        } catch (error) {
            console.error('❌ שגיאה בטעינת מטבעות:', error);
        }
    }

    /**
     * מילוי select box של טריידים
     * 
     * @param {string} selectId - ID של ה-select element
     * @param {Object} options - אופציות
     * @returns {Promise<void>}
     * 
     * @example
     * await SelectPopulatorService.populateTradesSelect('tradeSelect');
     */
    static async populateTradesSelect(selectIdOrElement, options = {}) {
        const selectIdentifier = typeof selectIdOrElement === 'string'
            ? selectIdOrElement
            : (selectIdOrElement?.id || selectIdOrElement?.name || selectIdOrElement?.getAttribute?.('data-select-id') || 'element');
        
        // Support both ID string and element object
        const select = typeof selectIdOrElement === 'string' 
            ? document.getElementById(selectIdOrElement)
            : selectIdOrElement;
        if (!select) {
            console.warn(`⚠️ Select ${selectIdentifier} לא נמצא`);
            return;
        }
        
        try {
            // טעינת טריידים מ-API
            const response = await fetch('/api/trades/');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            let trades = responseData.data || responseData || [];
            
            // סינון אם נדרש (למשל רק פעילים)
            if (options.filterFn && typeof options.filterFn === 'function') {
                trades = trades.filter(options.filterFn);
            }
            
            // מילוי ה-select
            this._populateSelect(select, trades, {
                valueField: 'id',
                textField: (item) => {
                    const symbol = item.ticker?.symbol || item.symbol || 'N/A';
                    const name = item.name || '';
                    return name ? `${symbol} - ${name}` : symbol;
                },
                includeEmpty: options.includeEmpty !== false,
                emptyText: options.emptyText || 'בחר טרייד...',
                defaultValue: options.defaultValue
            });
            
            console.log(`✅ נטענו ${trades.length} טריידים ל-${selectIdentifier}`);
            
        } catch (error) {
            console.error('❌ שגיאה בטעינת טריידים:', error);
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
    static async populateTradePlansSelect(selectIdOrElement, options = {}) {
        const selectIdentifier = typeof selectIdOrElement === 'string'
            ? selectIdOrElement
            : (selectIdOrElement?.id || selectIdOrElement?.name || selectIdOrElement?.getAttribute?.('data-select-id') || 'element');
        
        // Support both ID string and element object
        const select = typeof selectIdOrElement === 'string' 
            ? document.getElementById(selectIdOrElement)
            : selectIdOrElement;
        if (!select) {
            console.warn(`⚠️ Select ${selectIdentifier} לא נמצא`);
            return;
        }
        
        try {
            // טעינת תוכניות מ-API
            const response = await fetch('/api/trade-plans/');
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
            
            console.log(`✅ נטענו ${plans.length} תכנונים ל-${selectIdentifier}`);
            
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

    /**
     * מילוי select box עם נתונים קיימים (לא מ-API)
     * פונקציה ציבורית למילוי select עם נתונים שכבר נטענו
     * 
     * @param {string|HTMLElement} selectIdOrElement - ID של ה-select element או האלמנט עצמו
     * @param {Array} items - מערך של אובייקטים
     * @param {Object} config - הגדרות: { valueField, textField, includeEmpty, emptyText, defaultValue }
     * @returns {void}
     * 
     * @example
     * SelectPopulatorService.populateSelectWithData('mySelect', dataArray, {
     *   valueField: 'id',
     *   textField: 'name',
     *   includeEmpty: true,
     *   emptyText: 'בחר...'
     * });
     */
    static populateSelectWithData(selectIdOrElement, items, config = {}) {
        const select = typeof selectIdOrElement === 'string' 
            ? document.getElementById(selectIdOrElement)
            : selectIdOrElement;
        if (!select) {
            console.warn(`⚠️ Select ${selectIdOrElement} לא נמצא`);
            return;
        }
        
        this._populateSelect(select, items, {
            valueField: config.valueField || 'id',
            textField: config.textField || 'name',
            includeEmpty: config.includeEmpty !== false,
            emptyText: config.emptyText || 'בחר...',
            defaultValue: config.defaultValue
        });
    }

    // ===== PRIVATE HELPER METHOD =====

    /**
     * מילוי select box עם נתונים
     * @private
     */
    static _populateSelect(select, items, config) {
        const selectId = select.id || 'unknown';
        console.log(`🔍 [SelectPopulatorService._populateSelect] Called for ${selectId}`, {
            itemsCount: items.length,
            config: config,
            optionsBefore: select.options.length,
            innerHTMLBefore: select.innerHTML.substring(0, 100)
        });
        
        // ניקוי האופציות הקיימות
        select.textContent = '';
        console.log(`🔍 [SelectPopulatorService._populateSelect] Cleared innerHTML for ${selectId}`);
        
        // הוספת אופציה ריקה אם נדרש
        if (config.includeEmpty) {
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = config.emptyText || 'בחר...';
            select.appendChild(emptyOption);
            console.log(`🔍 [SelectPopulatorService._populateSelect] Added empty option for ${selectId}`);
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
        
        console.log(`🔍 [SelectPopulatorService._populateSelect] Added ${items.length} options to ${selectId}`, {
            optionsAfter: select.options.length,
            firstFewOptions: Array.from(select.options).slice(0, 3).map(opt => ({ value: opt.value, text: opt.textContent }))
        });
        
        // סימון ברירת מחדל לפי value או לפי טקסט
        if (config.defaultValue !== undefined && config.defaultValue !== null) {
            // Try to set the value directly first
            select.value = config.defaultValue;
            
            // If value didn't set (type mismatch or option doesn't exist), try to find matching option
            if (select.value !== String(config.defaultValue)) {
                const options = Array.from(select.options);
                const match = options.find(opt => 
                    opt.value === String(config.defaultValue) ||
                    opt.value === config.defaultValue ||
                    String(opt.value) === String(config.defaultValue) ||
                    parseInt(opt.value) === parseInt(config.defaultValue)
                );
                if (match) {
                    select.value = match.value;
                }
            }
        } else if (config.defaultText) {
            const options = Array.from(select.options);
            const match = options.find(opt => (opt.textContent || '').trim() === String(config.defaultText).trim());
            if (match) {
                select.value = match.value;
            }
        }
    }
}

// ===== RELATED OBJECTS HANDLER - משולב מתוך related-objects-handler.js =====

/**
 * מילוי select עם נתונים - פונקציה עזר מקומית
 */
function populateSelect(selectId, data, field, prefix = '') {
  const select = document.getElementById(selectId);
  if (!select) {
    console.warn(`Select element not found: ${selectId}`);
    return;
  }

  select.textContent = '';
  const option = document.createElement('option');
  option.value = '';
  option.textContent = 'בחר אובייקט לשיוך...';
  select.appendChild(option);

  if (!data || data.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'אין רשומות זמינות';
    option.disabled = true;
    select.appendChild(option);
    return;
  }

  data.forEach(item => {
    const option = document.createElement('option');
    option.value = item.id;
    
    let displayText = '';
    if (prefix === 'חשבון מסחר') {
      const name = item.name || item.account_name || 'לא מוגדר';
      const currency = item.currency || 'ILS';
      displayText = `${name} (${currency})`;
    } else if (prefix === 'טרייד') {
      const symbol = item.symbol || item.ticker_symbol || item.ticker?.symbol || 'לא מוגדר';
      const side = item.side || 'לא מוגדר';
      const investmentType = item.investment_type || 'לא מוגדר';
      const date = item.created_at || item.date;
      const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
      displayText = `${symbol} | ${side} | ${investmentType} | ${formattedDate}`;
    } else if (prefix === 'תכנון') {
      const symbol = item.symbol || item.ticker_symbol || item.ticker?.symbol || 'לא מוגדר';
      const side = item.side || 'לא מוגדר';
      const investmentType = item.investment_type || 'לא מוגדר';
      const date = item.created_at || item.date;
      const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
      displayText = `${symbol} | ${side} | ${investmentType} | ${formattedDate}`;
    } else {
      displayText = item[field] || item.symbol || 'לא מוגדר';
    }

    option.textContent = displayText;
    select.appendChild(option);
  });
}

/**
 * סינון טיקרים לפי סוג השיוך
 * @param {number} relationType - סוג השיוך (1=חשבון מסחר, 2=טרייד, 3=תכנון, 4=טיקר)
 * @returns {Array} מערך טיקרים מסוננים
 */
function getFilteredTickers(relationType) {
  const allTickers = window.tickersData || [];
  
  if (relationType === 2) {
    // עבור טרייד - רק טיקרים שיש להם טריידים פתוחים או סגורים
    const tradesWithStatus = (window.tradesData || []).filter(trade => 
      trade.status === 'open' || trade.status === 'closed' || 
      trade.is_open === true || trade.is_closed === true
    );
    
    const tickerIds = new Set(tradesWithStatus.map(trade => 
      trade.ticker_id || trade.ticker?.id || trade.ticker
    ));
    
    return allTickers.filter(ticker => tickerIds.has(ticker.id));
    
  } else if (relationType === 3) {
    // עבור תוכנית - רק טיקרים שיש להם תכנונים פתוחים או סגורים
    const plansWithStatus = (window.tradePlansData || []).filter(plan => 
      plan.status === 'open' || plan.status === 'closed' ||
      plan.is_open === true || plan.is_closed === true
    );
    
    const tickerIds = new Set(plansWithStatus.map(plan => 
      plan.ticker_id || plan.ticker?.id || plan.ticker
    ));
    
    return allTickers.filter(ticker => tickerIds.has(ticker.id));
    
  } else if (relationType === 4) {
    // עבור טיקר - כל הטיקרים
    return allTickers;
  }
  
  return [];
}

/**
 * מילוי רשימת אובייקטים לפי סוג השיוך (משותף לתראות והערות)
 * @param {number} relationTypeId - מזהה סוג השיוך
 * @param {string} selectedTicker - טיקר נבחר לסינון (אופציונלי)
 * @param {string} selectElementId - ID של אלמנט הבחירה
 */
function populateRelatedObjects(relationTypeId, selectedTicker = null, selectElementId) {
  const selectElement = document.getElementById(selectElementId);
  if (!selectElement) {return;}

  // ניקוי הרשימה
  selectElement.textContent = '';
  const option = document.createElement('option');
  option.value = '';
  option.textContent = 'בחר אובייקט לשיוך...';
  selectElement.appendChild(option);

  // מילוי לפי סוג השיוך עם סינון לפי טיקר
  switch (relationTypeId) {
  case 1: // חשבון מסחר - רק חשבונות פתוחים
    let accountsData = (window.accountsData || []).filter(account => 
      account.status === 'open' || account.status === 'active' || account.is_active === true
    );
    // מיון א-ב לפי שם החשבון מסחר
    accountsData.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'he'));
    populateSelect(selectElementId, accountsData, 'name', 'חשבון מסחר');
    break;

  case 2: // טרייד - רק טריידים פתוחים וסגורים
    let tradesData = (window.tradesData || []).filter(trade => 
      trade.status === 'open' || trade.status === 'closed' || 
      trade.is_open === true || trade.is_closed === true
    );
    
    if (selectedTicker) {
      tradesData = tradesData.filter(trade => 
        trade.symbol === selectedTicker || 
        trade.ticker_symbol === selectedTicker ||
        trade.ticker?.symbol === selectedTicker ||
        trade.ticker_id === parseInt(selectedTicker)
      );
    }
    
    // מיון א-ב לפי סימבול
    tradesData.sort((a, b) => (a.symbol || '').localeCompare(b.symbol || '', 'he'));
    populateSelect(selectElementId, tradesData, 'symbol', 'טרייד');
    break;

  case 3: // תכנון טרייד - רק תכנונים פתוחים וסגורים
    let tradePlansData = (window.tradePlansData || []).filter(plan => 
      plan.status === 'open' || plan.status === 'closed' ||
      plan.is_open === true || plan.is_closed === true
    );
    
    if (selectedTicker) {
      tradePlansData = tradePlansData.filter(plan => 
        plan.symbol === selectedTicker || 
        plan.ticker_symbol === selectedTicker ||
        plan.ticker?.symbol === selectedTicker ||
        plan.ticker_id === parseInt(selectedTicker)
      );
    }
    
    // מיון א-ב לפי סימבול
    tradePlansData.sort((a, b) => (a.symbol || '').localeCompare(b.symbol || '', 'he'));
    populateSelect(selectElementId, tradePlansData, 'symbol', 'תכנון');
    break;

  case 4: // טיקר
    // עבור טיקר - הטיקר הוא הבחירה עצמה, לא נמלא את אלמנט הקישור
    selectElement.textContent = '';
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'לא רלוונטי עבור טיקר';
    selectElement.appendChild(option);
    break;
  }
}

/**
 * טיפול בשינוי סוג שיוך (משותף לתראות והערות)
 * @param {HTMLSelectElement} selectElement - אלמנט הבחירה שנבחר
 * @param {Object} config - קונפיגורציה: {tickerId, relationId, tickerSelectId, relatedSelectId}
 */
function handleRelationTypeChange(selectElement, config) {
  const relationType = parseInt(selectElement.value);
  const tickerSelect = document.getElementById(config.tickerSelectId);
  const relatedObjectSelect = document.getElementById(config.relatedSelectId);
  
  // 1. סוג שיוך - תמיד פעיל (אין צורך לשנות)
  
  // 2. טיקר - פעיל רק עבור טיקר(4)/תוכנית(3)/טרייד(2)
  if (tickerSelect) {
    if (relationType === 4) {
      // עבור טיקר - הטיקר הוא הבחירה של האובייקט לשיוך
      tickerSelect.disabled = false;
      tickerSelect.classList.remove('disabled-field');
      tickerSelect.required = true;
      
      // מילוי טיקרים מסוננים ומיון
      const filteredTickers = getFilteredTickers(relationType);
      filteredTickers.sort((a, b) => (a.symbol || '').localeCompare(b.symbol || '', 'he'));
      populateSelect(config.tickerSelectId, filteredTickers, 'symbol', '');
      
      // השבתת אלמנט לקישור עבור טיקר
      if (relatedObjectSelect) {
        relatedObjectSelect.disabled = true;
        relatedObjectSelect.classList.add('disabled-field');
        relatedObjectSelect.required = false;
        relatedObjectSelect.textContent = '';
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'לא רלוונטי עבור טיקר';
        relatedObjectSelect.appendChild(option);
      }
    } else if (relationType === 3 || relationType === 2) {
      // עבור תוכנית/טרייד - הטיקר משמש כפילטר
      tickerSelect.disabled = false;
      tickerSelect.classList.remove('disabled-field');
      tickerSelect.required = false; // לא חובה כי זה רק פילטר
      
      // מילוי טיקרים מסוננים ומיון
      const filteredTickers = getFilteredTickers(relationType);
      filteredTickers.sort((a, b) => (a.symbol || '').localeCompare(b.symbol || '', 'he'));
      populateSelect(config.tickerSelectId, filteredTickers, 'symbol', '');
      
      // הפעלת אלמנט לקישור
      if (relatedObjectSelect) {
        relatedObjectSelect.disabled = false;
        relatedObjectSelect.classList.remove('disabled-field');
        relatedObjectSelect.required = true;
      }
    } else if (relationType === 1) {
      // עבור חשבון מסחר - הטיקר לא פעיל
      tickerSelect.disabled = true;
      tickerSelect.classList.add('disabled-field');
      tickerSelect.required = false;
      tickerSelect.value = '';
      
      // הפעלת אלמנט לקישור
      if (relatedObjectSelect) {
        relatedObjectSelect.disabled = false;
        relatedObjectSelect.classList.remove('disabled-field');
        relatedObjectSelect.required = true;
      }
    } else {
      // אין בחירה - השבתת הכל
      tickerSelect.disabled = true;
      tickerSelect.classList.add('disabled-field');
      tickerSelect.required = false;
      tickerSelect.value = '';
      
      if (relatedObjectSelect) {
        relatedObjectSelect.disabled = true;
        relatedObjectSelect.classList.add('disabled-field');
        relatedObjectSelect.required = false;
        relatedObjectSelect.textContent = '';
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'בחר קודם סוג התראה';
        relatedObjectSelect.appendChild(option);
      }
    }
  }
  
  // 3. אלמנט לקישור - פעיל עבור חשבון מסחר(1)/תוכנית(3)/טרייד(2), לא פעיל עבור טיקר(4)
  if (relationType && relationType !== 4) {
    const selectedTicker = tickerSelect ? tickerSelect.value : null;
    populateRelatedObjects(relationType, selectedTicker, config.relatedSelectId);
  }
}

/**
 * טיפול בבחירת טיקר (משותף לתראות והערות)
 * @param {HTMLSelectElement} tickerSelect - אלמנט בחירת הטיקר
 * @param {Object} config - קונפיגורציה: {relationTypeId, onTickerChangeCallback}
 */
function handleTickerChange(tickerSelect, config) {
  const relationTypeSelect = document.getElementById(config.relationTypeId);
  const relationType = relationTypeSelect ? parseInt(relationTypeSelect.value) : null;
  
  if (relationType === 2 || relationType === 3) {
    // טיקר משמש כפילטר עבור תוכנית וטרייד
    const selectedTicker = tickerSelect.value;
    if (config.onTickerChangeCallback) {
      config.onTickerChangeCallback(relationType, selectedTicker);
    }
  } else if (relationType === 4) {
    // עבור טיקר - הטיקר הוא הבחירה עצמה
    if (config.onTickerChangeCallback) {
      config.onTickerChangeCallback(relationType, tickerSelect.value);
    }
  }
}

// ===== EXPORT TO GLOBAL SCOPE =====

window.SelectPopulatorService = SelectPopulatorService;

// Export public method for getting preferences
window.getPreferenceFromMemory = async (preferenceName, aliases = []) => await SelectPopulatorService._getPreferenceFromMemory(preferenceName, aliases);

// ייצוא פונקציות לטיפול באובייקטים מקושרים
window.getFilteredTickers = getFilteredTickers;
window.populateRelatedObjects = populateRelatedObjects;
window.handleRelationTypeChange = handleRelationTypeChange;
window.handleTickerChange = handleTickerChange;

// Shortcuts למתודות נפוצות
window.populateTickersSelect = (selectId, options) => SelectPopulatorService.populateTickersSelect(selectId, options);
window.populateAccountsSelect = (selectId, options) => SelectPopulatorService.populateAccountsSelect(selectId, options);
window.populateCurrenciesSelect = (selectId, options) => SelectPopulatorService.populateCurrenciesSelect(selectId, options);
window.populateTradesSelect = (selectId, options) => SelectPopulatorService.populateTradesSelect(selectId, options);
window.populateTradePlansSelect = (selectId, options) => SelectPopulatorService.populateTradePlansSelect(selectId, options);
window.populateGenericSelect = (selectId, endpoint, config) => SelectPopulatorService.populateGenericSelect(selectId, endpoint, config);

// ===== ALERT CONDITION POPULATOR =====

/**
 * מילוי select boxes לתנאי התראות
 */
class AlertConditionPopulator {
    
    static populateAttributeSelect(selectId, selectedValue = null) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        select.textContent = '';
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'בחר מאפיין';
        select.appendChild(option);
        
        const attributes = [
            { value: 'price', label: 'מחיר' },
            { value: 'change', label: 'שינוי' },
            { value: 'volume', label: 'נפח' },
            { value: 'ma', label: 'ממוצע נע' }
        ];
        
        attributes.forEach(attr => {
            const option = document.createElement('option');
            option.value = attr.value;
            option.textContent = attr.label;
            if (selectedValue === attr.value) option.selected = true;
            select.appendChild(option);
        });
    }
    
    static populateOperatorSelect(selectId, selectedValue = null) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        select.textContent = '';
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'בחר אופרטור';
        select.appendChild(option);
        
        const operators = [
            { value: 'more_than', label: 'יותר מ' },
            { value: 'less_than', label: 'פחות מ' },
            { value: 'equals', label: 'שווה ל' },
            { value: 'change', label: 'שינוי' },
            { value: 'change_up', label: 'שינוי למעלה' },
            { value: 'change_down', label: 'שינוי למטה' },
            { value: 'cross', label: 'חוצה' },
            { value: 'cross_up', label: 'חוצה למעלה' },
            { value: 'cross_down', label: 'חוצה למטה' }
        ];
        
        operators.forEach(op => {
            const option = document.createElement('option');
            option.value = op.value;
            option.textContent = op.label;
            if (selectedValue === op.value) option.selected = true;
            select.appendChild(option);
        });
    }
}

window.AlertConditionPopulator = AlertConditionPopulator;



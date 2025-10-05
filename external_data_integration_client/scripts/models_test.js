/**
 * Models Test JavaScript
 * 
 * This script provides functionality for testing the external data integration
 * models, including validation and data structure testing.
 * 
 * Author: TikTrack Development Team
 * Created: January 2025
 * Version: 1.0
 */

class ModelsTester {
    constructor() {
        this.testResults = [];
        this.initializeEventListeners();
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Ticker model test
        document.getElementById('test-ticker-model').addEventListener('click', () => {
            this.testTickerModel();
        });

        // Quote model test
        document.getElementById('test-quote-model').addEventListener('click', () => {
            this.testQuoteModel();
        });

        // Preferences model test
        document.getElementById('test-preferences-model').addEventListener('click', () => {
            this.testPreferencesModel();
        });

        // Validation tests
        document.getElementById('validate-timezone').addEventListener('click', () => {
            this.validateTimezone();
        });

        document.getElementById('validate-interval').addEventListener('click', () => {
            this.validateInterval();
        });

        document.getElementById('validate-mode').addEventListener('click', () => {
            this.validateMode();
        });

        // Clear results
        document.getElementById('clear-results').addEventListener('click', () => {
            this.clearResults();
        });
    }

    /**
     * Test Ticker model
     */
    testTickerModel() {
        const symbol = document.getElementById('ticker-symbol').value.trim();
        const name = document.getElementById('ticker-name').value.trim();
        const status = document.getElementById('ticker-status').value;
        const activeTrades = document.getElementById('ticker-active-trades').checked ? 1 : 0;

        // Validation
        const errors = [];
        if (!symbol) errors.push('סמל הוא שדה חובה');
        if (symbol.length > 10) errors.push('סמל לא יכול להיות יותר מ-10 תווים');
        if (!name) errors.push('שם הוא שדה חובה');
        if (name.length > 100) errors.push('שם לא יכול להיות יותר מ-100 תווים');

        if (errors.length > 0) {
            this.addResult('Ticker Model', 'error', errors.join(', '));
            return;
        }

        // Create ticker object
        const ticker = {
            symbol: symbol,
            name: name,
            status: status,
            active_trades: activeTrades,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Test to_dict method
        const tickerDict = this.simulateTickerToDict(ticker);
        
        this.addResult('Ticker Model', 'success', 
            `מודל Ticker נוצר בהצלחה: ${symbol} - ${name}`, 
            { ticker, tickerDict }
        );
    }

    /**
     * Test Quote model
     */
    testQuoteModel() {
        const tickerId = parseInt(document.getElementById('quote-ticker-id').value);
        const price = parseFloat(document.getElementById('quote-price').value);
        const changeAmount = parseFloat(document.getElementById('quote-change-amount').value);
        const changePercent = parseFloat(document.getElementById('quote-change-percent').value);
        const volume = parseInt(document.getElementById('quote-volume').value);
        const provider = document.getElementById('quote-provider').value;

        // Validation
        const errors = [];
        if (!tickerId || tickerId <= 0) errors.push('Ticker ID חייב להיות מספר חיובי');
        if (!price || price <= 0) errors.push('מחיר חייב להיות מספר חיובי');
        if (provider.length > 50) errors.push('שם ספק לא יכול להיות יותר מ-50 תווים');

        if (errors.length > 0) {
            this.addResult('Quote Model', 'error', errors.join(', '));
            return;
        }

        // Create quote object
        const quote = {
            ticker_id: tickerId,
            price: price,
            change_amount: changeAmount,
            change_percent: changePercent,
            volume: volume,
            high_24h: price + Math.random() * 10,
            low_24h: price - Math.random() * 10,
            open_price: price + (Math.random() - 0.5) * 5,
            previous_close: price - changeAmount,
            provider: provider,
            asof_utc: new Date().toISOString(),
            fetched_at: new Date().toISOString(),
            last_updated: new Date().toISOString(),
            created_at: new Date().toISOString()
        };

        // Test to_dict method
        const quoteDict = this.simulateQuoteToDict(quote);
        
        this.addResult('Quote Model', 'success', 
            `מודל Quote נוצר בהצלחה: מחיר $${price.toFixed(2)}`, 
            { quote, quoteDict }
        );
    }

    /**
     * Test Market Preferences model
     */
    testPreferencesModel() {
        const userId = parseInt(document.getElementById('pref-user-id').value);
        const timezone = document.getElementById('pref-timezone').value;
        const refreshMode = document.getElementById('pref-refresh-mode').value;
        const interval = parseInt(document.getElementById('pref-interval').value);

        // Validation
        const errors = [];
        if (!userId || userId <= 0) errors.push('User ID חייב להיות מספר חיובי');
        if (!this.validateTimezone(timezone)) errors.push('אזור זמן לא תקין');
        if (!this.validateRefreshMode(refreshMode)) errors.push('מצב רענון לא תקין');
        if (!this.validateRefreshInterval(interval)) errors.push('מרווח רענון לא תקין');

        if (errors.length > 0) {
            this.addResult('Market Preferences Model', 'error', errors.join(', '));
            return;
        }

        // Create preferences object
        const refreshOverrides = {
            mode: refreshMode,
            interval_minutes: interval,
            closed: {
                weekdays: { offset_minutes_after_close: 45 }
            },
            open: {
                active: { in_minutes: 5, off_minutes: 60 },
                no_active: { in_minutes: 60, off_minutes: 60 }
            },
            weekend: {
                open: { daily_hour_ny: 12 }
            }
        };

        const preferences = {
            user_id: userId,
            timezone: timezone,
            refresh_overrides_json: JSON.stringify(refreshOverrides),
            updated_at: new Date().toISOString()
        };

        // Test to_dict method
        const preferencesDict = this.simulatePreferencesToDict(preferences);
        
        this.addResult('Market Preferences Model', 'success', 
            `העדפות נוצרו בהצלחה עבור משתמש ${userId}`, 
            { preferences, preferencesDict }
        );
    }

    /**
     * Validate timezone
     */
    validateTimezone() {
        const timezone = document.getElementById('validation-timezone').value.trim();
        const isValid = this.validateTimezone(timezone);
        
        this.addResult('Timezone Validation', 
            isValid ? 'success' : 'error',
            `אזור זמן "${timezone}": ${isValid ? 'תקין' : 'לא תקין'}`
        );
    }

    /**
     * Validate interval
     */
    validateInterval() {
        const interval = parseInt(document.getElementById('validation-interval').value);
        const isValid = this.validateRefreshInterval(interval);
        
        this.addResult('Interval Validation', 
            isValid ? 'success' : 'error',
            `מרווח ${interval} דקות: ${isValid ? 'תקין' : 'לא תקין'}`
        );
    }

    /**
     * Validate mode
     */
    validateMode() {
        const mode = document.getElementById('validation-mode').value.trim();
        const isValid = this.validateRefreshMode(mode);
        
        this.addResult('Mode Validation', 
            isValid ? 'success' : 'error',
            `מצב "${mode}": ${isValid ? 'תקין' : 'לא תקין'}`
        );
    }

    /**
     * Validation helper methods
     */
    validateTimezone(timezone) {
        if (!timezone) return false;
        const validTimezones = ['UTC', 'Asia/Jerusalem', 'America/New_York', 'Europe/London'];
        return validTimezones.includes(timezone);
    }

    validateRefreshInterval(minutes) {
        if (!minutes || typeof minutes !== 'number') return false;
        return 1 <= minutes && minutes <= 1440;
    }

    validateRefreshMode(mode) {
        const validModes = ['auto', 'manual', 'custom'];
        return validModes.includes(mode);
    }

    /**
     * Simulate model methods
     */
    simulateTickerToDict(ticker) {
        return {
            id: ticker.id || 1,
            symbol: ticker.symbol,
            name: ticker.name,
            status: ticker.status,
            active_trades: Boolean(ticker.active_trades),
            created_at: ticker.created_at,
            updated_at: ticker.updated_at
        };
    }

    simulateQuoteToDict(quote) {
        return {
            id: quote.id || 1,
            ticker_id: quote.ticker_id,
            price: parseFloat(quote.price),
            change_amount: quote.change_amount ? parseFloat(quote.change_amount) : null,
            change_percent: quote.change_percent ? parseFloat(quote.change_percent) : null,
            volume: quote.volume,
            high_24h: quote.high_24h ? parseFloat(quote.high_24h) : null,
            low_24h: quote.low_24h ? parseFloat(quote.low_24h) : null,
            open_price: quote.open_price ? parseFloat(quote.open_price) : null,
            previous_close: quote.previous_close ? parseFloat(quote.previous_close) : null,
            provider: quote.provider,
            asof_utc: quote.asof_utc,
            fetched_at: quote.fetched_at,
            last_updated: quote.last_updated,
            created_at: quote.created_at
        };
    }

    simulatePreferencesToDict(preferences) {
        return {
            user_id: preferences.user_id,
            timezone: preferences.timezone,
            refresh_overrides: JSON.parse(preferences.refresh_overrides_json),
            updated_at: preferences.updated_at
        };
    }

    /**
     * Add test result
     */
    addResult(model, status, message, data = null) {
        const result = {
            timestamp: new Date().toLocaleTimeString('he-IL'),
            model: model,
            status: status,
            message: message,
            data: data
        };
        
        this.testResults.push(result);
        this.updateResultsDisplay();
    }

    /**
     * Update results display
     */
    updateResultsDisplay() {
        const resultsContainer = document.getElementById('test-results');
        resultsContainer.innerHTML = '';
        
        this.testResults.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = `alert alert-${result.status === 'success' ? 'success' : 'danger'} fade-in`;
            
            let content = `
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <strong>${result.model}</strong> - ${result.message}
                        <br><small class="text-muted">${result.timestamp}</small>
                    </div>
                    <span class="badge bg-${result.status === 'success' ? 'success' : 'danger'}">
                        ${result.status === 'success' ? 'הצלחה' : 'שגיאה'}
                    </span>
                </div>
            `;
            
            if (result.data) {
                content += `
                    <details class="mt-2">
                        <summary>פרטי הנתונים</summary>
                        <pre class="mt-2 bg-light p-2 rounded"><code>${JSON.stringify(result.data, null, 2)}</code></pre>
                    </details>
                `;
            }
            
            resultElement.innerHTML = content;
            resultsContainer.appendChild(resultElement);
        });
        
        // Scroll to bottom
        resultsContainer.scrollTop = resultsContainer.scrollHeight;
    }

    /**
     * Clear results
     */
    clearResults() {
        this.testResults = [];
        this.updateResultsDisplay();
    }
}

// Initialize the tester when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.modelsTester = new ModelsTester();
});







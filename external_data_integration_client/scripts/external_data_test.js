/**
 * External Data Integration Test Page JavaScript
 * 
 * This script provides functionality for testing the external data integration
 * system, including fetching quotes, checking system status, and logging.
 * 
 * Author: TikTrack Development Team
 * Created: January 2025
 * Version: 1.0
 */

class ExternalDataTester {
    constructor() {
        this.apiBaseUrl = '/api/v1';
        this.logEntries = [];
        this.isLoading = false;
        
        this.initializeEventListeners();
        this.updateCurrentTime();
        this.startTimeUpdate();
        this.log('info', 'דף בדיקה נטען בהצלחה');
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Single quote fetch
        document.getElementById('fetch-single').addEventListener('click', () => {
            this.fetchSingleQuote();
        });

        // Batch quotes fetch
        document.getElementById('fetch-batch').addEventListener('click', () => {
            this.fetchBatchQuotes();
        });

        // Refresh all prices
        document.getElementById('refresh-all').addEventListener('click', () => {
            this.refreshAllPrices();
        });

        // Check providers status
        document.getElementById('check-providers').addEventListener('click', () => {
            this.checkProvidersStatus();
        });

        // Clear log
        document.getElementById('clear-log').addEventListener('click', () => {
            this.clearLog();
        });

        // Enter key support for inputs
        document.getElementById('test-symbol').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.fetchSingleQuote();
            }
        });

        document.getElementById('test-symbols').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.fetchBatchQuotes();
            }
        });
    }

    /**
     * Update current time display
     */
    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleString('he-IL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('current-time').textContent = timeString;
    }

    /**
     * Start time update interval
     */
    startTimeUpdate() {
        setInterval(() => {
            this.updateCurrentTime();
        }, 1000);
    }

    /**
     * Show loading modal
     */
    showLoading(message = 'מעבד בקשה...') {
        this.isLoading = true;
        document.getElementById('loading-message').textContent = message;
        const modal = new bootstrap.Modal(document.getElementById('loadingModal'));
        modal.show();
    }

    /**
     * Hide loading modal
     */
    hideLoading() {
        this.isLoading = false;
        const modal = bootstrap.Modal.getInstance(document.getElementById('loadingModal'));
        if (modal) {
            modal.hide();
        }
    }

    /**
     * Add log entry
     */
    log(level, message) {
        const timestamp = new Date().toLocaleTimeString('he-IL');
        const logEntry = {
            timestamp,
            level,
            message
        };
        
        this.logEntries.push(logEntry);
        this.updateLogDisplay();
        
        // Keep only last 100 entries
        if (this.logEntries.length > 100) {
            this.logEntries = this.logEntries.slice(-100);
        }
    }

    /**
     * Update log display
     */
    updateLogDisplay() {
        const logContent = document.getElementById('log-content');
        logContent.innerHTML = '';
        
        this.logEntries.forEach(entry => {
            const logElement = document.createElement('div');
            logElement.className = 'log-entry';
            logElement.innerHTML = `
                <span class="log-timestamp">[${entry.timestamp}]</span>
                <span class="log-level-${entry.level}">[${entry.level.toUpperCase()}]</span>
                <span class="log-message">${entry.message}</span>
            `;
            logContent.appendChild(logElement);
        });
        
        // Scroll to bottom
        logContent.scrollTop = logContent.scrollHeight;
    }

    /**
     * Clear log
     */
    clearLog() {
        this.logEntries = [];
        this.updateLogDisplay();
        this.log('info', 'יומן נוקה');
    }

    /**
     * Fetch single quote
     */
    async fetchSingleQuote() {
        const symbol = document.getElementById('test-symbol').value.trim();
        if (!symbol) {
            this.log('warning', 'נא להזין סמל לבדיקה');
            return;
        }

        this.showLoading(`מביא מחיר עבור ${symbol}...`);
        this.log('info', `מביא מחיר עבור ${symbol}`);

        try {
            // Simulate API call (replace with actual API call)
            const response = await this.simulateApiCall(`/quotes/${symbol}`, {
                symbol: symbol,
                price: Math.random() * 1000 + 50,
                change_amount: (Math.random() - 0.5) * 20,
                change_percent: (Math.random() - 0.5) * 5,
                volume: Math.floor(Math.random() * 10000000),
                high_24h: Math.random() * 1000 + 50,
                low_24h: Math.random() * 1000 + 50,
                open_price: Math.random() * 1000 + 50,
                previous_close: Math.random() * 1000 + 50,
                provider: 'yahoo_finance',
                asof_utc: new Date().toISOString(),
                fetched_at: new Date().toISOString()
            });

            this.displaySingleQuote(response);
            this.log('success', `מחיר עבור ${symbol} התקבל בהצלחה`);
            
        } catch (error) {
            this.log('error', `שגיאה בקבלת מחיר עבור ${symbol}: ${error.message}`);
            this.showError(`שגיאה בקבלת מחיר עבור ${symbol}`);
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Fetch batch quotes
     */
    async fetchBatchQuotes() {
        const symbolsText = document.getElementById('test-symbols').value.trim();
        if (!symbolsText) {
            this.log('warning', 'נא להזין סמלים לבדיקה');
            return;
        }

        const symbols = symbolsText.split(',').map(s => s.trim()).filter(s => s);
        this.showLoading(`מביא מחירים עבור ${symbols.length} סמלים...`);
        this.log('info', `מביא מחירים עבור ${symbols.length} סמלים`);

        try {
            // Simulate API call (replace with actual API call)
            const results = [];
            for (const symbol of symbols) {
                const quote = {
                    symbol: symbol,
                    price: Math.random() * 1000 + 50,
                    change_amount: (Math.random() - 0.5) * 20,
                    change_percent: (Math.random() - 0.5) * 5,
                    volume: Math.floor(Math.random() * 10000000),
                    high_24h: Math.random() * 1000 + 50,
                    low_24h: Math.random() * 1000 + 50,
                    open_price: Math.random() * 1000 + 50,
                    previous_close: Math.random() * 1000 + 50,
                    provider: 'yahoo_finance',
                    asof_utc: new Date().toISOString(),
                    fetched_at: new Date().toISOString()
                };
                results.push(quote);
                
                // Simulate delay between requests
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            this.displayBatchResults(results);
            this.log('success', `${results.length} מחירים התקבלו בהצלחה`);
            
        } catch (error) {
            this.log('error', `שגיאה בקבלת מחירים: ${error.message}`);
            this.showError('שגיאה בקבלת מחירים');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Refresh all prices
     */
    async refreshAllPrices() {
        this.showLoading('מרענן כל המחירים...');
        this.log('info', 'מתחיל רענון כל המחירים');

        try {
            // Simulate API call (replace with actual API call)
            await this.simulateApiCall('/market-data/refresh', {
                total_tickers: 10,
                successful_updates: 8,
                failed_updates: 2,
                errors: ['Ticker INVALID not found', 'Network timeout for TSLA']
            });

            this.displaySystemStatus({
                message: 'רענון הושלם בהצלחה',
                total_tickers: 10,
                successful_updates: 8,
                failed_updates: 2
            });
            
            this.log('success', 'רענון כל המחירים הושלם');
            document.getElementById('last-refresh').textContent = new Date().toLocaleTimeString('he-IL');
            
        } catch (error) {
            this.log('error', `שגיאה ברענון מחירים: ${error.message}`);
            this.showError('שגיאה ברענון מחירים');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Check providers status
     */
    async checkProvidersStatus() {
        this.showLoading('בודק סטטוס ספקים...');
        this.log('info', 'בודק סטטוס ספקים');

        try {
            // Simulate API call (replace with actual API call)
            const response = await this.simulateApiCall('/market-data/providers', {
                yahoo_finance: {
                    provider: 'yahoo_finance',
                    is_active: true,
                    last_check: new Date().toISOString(),
                    config: {
                        timeout: 20,
                        retry_attempts: 2,
                        batch_size: 50
                    }
                },
                last_check: new Date().toISOString()
            });

            this.displaySystemStatus(response);
            this.log('success', 'סטטוס ספקים נבדק בהצלחה');
            
        } catch (error) {
            this.log('error', `שגיאה בבדיקת סטטוס ספקים: ${error.message}`);
            this.showError('שגיאה בבדיקת סטטוס ספקים');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Display single quote result
     */
    displaySingleQuote(quote) {
        const card = document.getElementById('single-quote-card');
        const content = document.getElementById('single-quote-content');
        
        const changeClass = quote.change_percent > 0 ? 'change-positive' : 
                           quote.change_percent < 0 ? 'change-negative' : 'change-neutral';
        
        content.innerHTML = `
            <div class="quote-item fade-in">
                <div class="quote-header">
                    <div class="quote-symbol">${quote.symbol}</div>
                    <div class="quote-price">$${quote.price.toFixed(2)}</div>
                </div>
                <div class="quote-change">
                    <div class="change-item">
                        <span class="change-label">שינוי</span>
                        <span class="change-value ${changeClass}">
                            ${quote.change_amount > 0 ? '+' : ''}${quote.change_amount.toFixed(2)}
                        </span>
                    </div>
                    <div class="change-item">
                        <span class="change-label">אחוז</span>
                        <span class="change-value ${changeClass}">
                            ${quote.change_percent > 0 ? '+' : ''}${quote.change_percent.toFixed(2)}%
                        </span>
                    </div>
                    <div class="change-item">
                        <span class="change-label">נפח</span>
                        <span class="change-value">${this.formatNumber(quote.volume)}</span>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-md-6">
                        <small class="text-muted">גבוה: $${quote.high_24h.toFixed(2)}</small>
                    </div>
                    <div class="col-md-6">
                        <small class="text-muted">נמוך: $${quote.low_24h.toFixed(2)}</small>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <small class="text-muted">פתיחה: $${quote.open_price.toFixed(2)}</small>
                    </div>
                    <div class="col-md-6">
                        <small class="text-muted">סגירה קודמת: $${quote.previous_close.toFixed(2)}</small>
                    </div>
                </div>
                <div class="mt-2">
                    <small class="text-muted">
                        <i class="fas fa-clock me-1"></i>
                        עודכן: ${new Date(quote.fetched_at).toLocaleString('he-IL')}
                    </small>
                </div>
            </div>
        `;
        
        card.style.display = 'block';
        card.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Display batch results
     */
    displayBatchResults(quotes) {
        const card = document.getElementById('batch-results-card');
        const content = document.getElementById('batch-results-content');
        
        content.innerHTML = `
            <div class="row">
                ${quotes.map(quote => {
                    const changeClass = quote.change_percent > 0 ? 'change-positive' : 
                                       quote.change_percent < 0 ? 'change-negative' : 'change-neutral';
                    
                    return `
                        <div class="col-md-6 mb-3">
                            <div class="quote-item fade-in">
                                <div class="quote-header">
                                    <div class="quote-symbol">${quote.symbol}</div>
                                    <div class="quote-price">$${quote.price.toFixed(2)}</div>
                                </div>
                                <div class="quote-change">
                                    <div class="change-item">
                                        <span class="change-label">שינוי</span>
                                        <span class="change-value ${changeClass}">
                                            ${quote.change_amount > 0 ? '+' : ''}${quote.change_amount.toFixed(2)}
                                        </span>
                                    </div>
                                    <div class="change-item">
                                        <span class="change-label">אחוז</span>
                                        <span class="change-value ${changeClass}">
                                            ${quote.change_percent > 0 ? '+' : ''}${quote.change_percent.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        card.style.display = 'block';
        card.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Display system status
     */
    displaySystemStatus(status) {
        const card = document.getElementById('system-status-card');
        const content = document.getElementById('system-status-content');
        
        if (status.yahoo_finance) {
            // Provider status
            content.innerHTML = `
                <div class="fade-in">
                    <h6>סטטוס ספקים:</h6>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card bg-light">
                                <div class="card-body">
                                    <h6 class="card-title">Yahoo Finance</h6>
                                    <p class="card-text">
                                        <span class="badge ${status.yahoo_finance.is_active ? 'bg-success' : 'bg-danger'}">
                                            ${status.yahoo_finance.is_active ? 'פעיל' : 'לא פעיל'}
                                        </span>
                                    </p>
                                    <small class="text-muted">
                                        בדיקה אחרונה: ${new Date(status.yahoo_finance.last_check).toLocaleString('he-IL')}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (status.total_tickers !== undefined) {
            // Refresh results
            content.innerHTML = `
                <div class="fade-in">
                    <h6>תוצאות רענון:</h6>
                    <div class="row">
                        <div class="col-md-4">
                            <div class="text-center">
                                <h4 class="text-primary">${status.total_tickers}</h4>
                                <small class="text-muted">סה"כ טיקרים</small>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="text-center">
                                <h4 class="text-success">${status.successful_updates}</h4>
                                <small class="text-muted">עודכנו בהצלחה</small>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="text-center">
                                <h4 class="text-danger">${status.failed_updates}</h4>
                                <small class="text-muted">נכשלו</small>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        card.style.display = 'block';
        card.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Show error message
     */
    showError(message) {
        // You can implement a toast notification here
        console.error(message);
    }

    /**
     * Format number with commas
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    /**
     * Simulate API call (replace with actual API calls)
     */
    async simulateApiCall(endpoint, response) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // Simulate occasional errors
        if (Math.random() < 0.1) {
            throw new Error('שגיאת רשת');
        }
        
        return response;
    }
}

// Initialize the tester when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.externalDataTester = new ExternalDataTester();
});

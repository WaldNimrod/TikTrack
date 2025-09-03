/**
 * External Data Service - Unified interface for all external data providers
 * ========================================================================
 * 
 * This service provides a unified interface for fetching market data from any external provider.
 * It works with the backend's normalizer system to ensure consistent data format
 * regardless of the data source (Yahoo Finance, Alpha Vantage, etc.).
 * 
 * Key Features:
 * - Provider-agnostic API
 * - Automatic data normalization through backend
 * - Built-in caching and error handling
 * - Support for single quotes and batch operations
 * - Real-time data updates
 * - Timezone handling (UTC storage, local display)
 * 
 * Architecture:
 * Frontend (this service) → Backend API → DataNormalizer → Provider Adapters
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @see Backend/services/external_data/data_normalizer.py
 * @see Backend/routes/external_data/quotes.py
 */

class ExternalDataService {
    /**
     * Initialize the External Data Service
     */
    constructor() {
        this.baseUrl = '/api/external-data';
        this.cache = new Map();
        this.cacheTimeout = 60000; // 1 minute cache
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
        
        // Request tracking for rate limiting
        this.requestCount = 0;
        this.requestWindow = 60000; // 1 minute window
        this.maxRequestsPerWindow = 100;
        this.requestTimes = [];
        
        // Initialize console logging
        this.initializeLogging();
        
        this.log('External Data Service initialized');
    }

    /**
     * Initialize console logging system
     */
    initializeLogging() {
        this.logPrefix = '[ExternalData]';
    }

    /**
     * Log messages with timestamp
     */
    log(message, level = 'info') {
        const timestamp = new Date().toLocaleTimeString('he-IL');
        const logMessage = `${this.logPrefix} [${timestamp}] ${message}`;
        
        if (window.console && window.console[level]) {
            window.console[level](logMessage);
        }
    }

    /**
     * Check rate limiting
     */
    checkRateLimit() {
        const now = Date.now();
        
        // Clean old requests outside the window
        this.requestTimes = this.requestTimes.filter(time => now - time < this.requestWindow);
        
        // Check if we're over the limit
        if (this.requestTimes.length >= this.maxRequestsPerWindow) {
            throw new Error('Rate limit exceeded. Please wait before making more requests.');
        }
        
        // Add current request
        this.requestTimes.push(now);
    }

    /**
     * Get cache key for a request
     */
    getCacheKey(endpoint, params = {}) {
        const paramString = Object.keys(params).length > 0 ? 
            '?' + new URLSearchParams(params).toString() : '';
        return `${endpoint}${paramString}`;
    }

    /**
     * Check if cached data is still valid
     */
    isCacheValid(cacheEntry) {
        if (!cacheEntry) return false;
        return Date.now() - cacheEntry.timestamp < this.cacheTimeout;
    }

    /**
     * Make HTTP request with retry logic
     */
    async makeRequest(url, options = {}) {
        let lastError = null;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                this.checkRateLimit();
                
                const response = await fetch(url, {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache',
                        ...options.headers
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                return data;

            } catch (error) {
                lastError = error;
                this.log(`Request attempt ${attempt} failed: ${error.message}`, 'warn');
                
                if (attempt < this.maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Get quote for a single ticker symbol
     * 
     * @param {string} symbol - Ticker symbol (e.g., 'AAPL')
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} Normalized quote data
     */
    async getQuote(symbol, options = {}) {
        try {
            this.log(`Fetching quote for ${symbol}`);
            
            // Check cache first
            const cacheKey = this.getCacheKey(`/quotes/symbol/${symbol}`, options);
            const cachedData = this.cache.get(cacheKey);
            
            if (this.isCacheValid(cachedData)) {
                this.log(`Using cached quote for ${symbol}`);
                return cachedData.data;
            }

            // Make API request
            const url = `${this.baseUrl}/quotes/symbol/${symbol}`;
            const params = new URLSearchParams(options).toString();
            const fullUrl = params ? `${url}?${params}` : url;
            
            const response = await this.makeRequest(fullUrl);
            
            if (response.status === 'success' && response.data) {
                // Cache the result
                this.cache.set(cacheKey, {
                    data: response.data,
                    timestamp: Date.now()
                });
                
                this.log(`Successfully fetched quote for ${symbol}`);
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to fetch quote data');
            }

        } catch (error) {
            this.log(`Error fetching quote for ${symbol}: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Get quotes for multiple ticker symbols (batch operation)
     * 
     * @param {Array<string>} symbols - Array of ticker symbols
     * @param {Object} options - Additional options
     * @returns {Promise<Array>} Array of normalized quote data
     */
    async getQuotes(symbols, options = {}) {
        try {
            if (!Array.isArray(symbols) || symbols.length === 0) {
                throw new Error('Symbols must be a non-empty array');
            }

            this.log(`Fetching quotes for ${symbols.length} symbols: ${symbols.join(', ')}`);

            // For large batches, split into smaller chunks
            const maxBatchSize = options.maxBatchSize || 25;
            if (symbols.length > maxBatchSize) {
                return await this.getBatchedQuotes(symbols, maxBatchSize, options);
            }

            // Check cache for all symbols
            const cachedResults = {};
            const symbolsToFetch = [];
            
            for (const symbol of symbols) {
                const cacheKey = this.getCacheKey(`/quotes/symbol/${symbol}`, options);
                const cachedData = this.cache.get(cacheKey);
                
                if (this.isCacheValid(cachedData)) {
                    cachedResults[symbol] = cachedData.data;
                } else {
                    symbolsToFetch.push(symbol);
                }
            }

            // If all symbols are cached, return cached data
            if (symbolsToFetch.length === 0) {
                this.log(`Using cached quotes for all ${symbols.length} symbols`);
                return symbols.map(symbol => cachedResults[symbol]);
            }

            // Make batch API request for uncached symbols
            const url = `${this.baseUrl}/quotes/batch`;
            const requestData = {
                symbols: symbolsToFetch,
                ...options
            };

            const response = await this.makeRequest(url, {
                method: 'POST',
                body: JSON.stringify(requestData)
            });

            if (response.status === 'success' && response.data) {
                // Cache individual results
                response.data.forEach(quote => {
                    if (quote && quote.symbol) {
                        const cacheKey = this.getCacheKey(`/quotes/symbol/${quote.symbol}`, options);
                        this.cache.set(cacheKey, {
                            data: quote,
                            timestamp: Date.now()
                        });
                    }
                });

                // Combine cached and fresh data
                const allResults = symbols.map(symbol => {
                    return cachedResults[symbol] || 
                           response.data.find(quote => quote.symbol === symbol) ||
                           null;
                });

                this.log(`Successfully fetched quotes for ${symbols.length} symbols`);
                return allResults;

            } else {
                throw new Error(response.message || 'Failed to fetch batch quote data');
            }

        } catch (error) {
            this.log(`Error fetching batch quotes: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Get quotes in smaller batches for large requests
     */
    async getBatchedQuotes(symbols, batchSize, options = {}) {
        const batches = [];
        for (let i = 0; i < symbols.length; i += batchSize) {
            batches.push(symbols.slice(i, i + batchSize));
        }

        this.log(`Splitting ${symbols.length} symbols into ${batches.length} batches of ${batchSize}`);

        const results = [];
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            this.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} symbols)`);
            
            const batchResults = await this.getQuotes(batch, options);
            results.push(...batchResults);
            
            // Add delay between batches to avoid rate limiting
            if (i < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        return results;
    }

    /**
     * Get system status and provider information
     * 
     * @returns {Promise<Object>} System status data
     */
    async getSystemStatus() {
        try {
            this.log('Fetching system status');
            
            const url = `${this.baseUrl}/status`;
            const response = await this.makeRequest(url);
            
            if (response.status === 'success') {
                this.log('Successfully fetched system status');
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to fetch system status');
            }

        } catch (error) {
            this.log(`Error fetching system status: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Clear cache for specific symbols or all cache
     * 
     * @param {Array<string>|null} symbols - Symbols to clear, or null for all
     */
    clearCache(symbols = null) {
        if (symbols === null) {
            this.cache.clear();
            this.log('Cleared all cache');
        } else {
            symbols.forEach(symbol => {
                const keysToDelete = [];
                for (const key of this.cache.keys()) {
                    if (key.includes(`/symbol/${symbol}`)) {
                        keysToDelete.push(key);
                    }
                }
                keysToDelete.forEach(key => this.cache.delete(key));
            });
            this.log(`Cleared cache for symbols: ${symbols.join(', ')}`);
        }
    }

    /**
     * Get cache statistics
     * 
     * @returns {Object} Cache statistics
     */
    getCacheStats() {
        const now = Date.now();
        let validEntries = 0;
        let expiredEntries = 0;

        for (const entry of this.cache.values()) {
            if (now - entry.timestamp < this.cacheTimeout) {
                validEntries++;
            } else {
                expiredEntries++;
            }
        }

        return {
            totalEntries: this.cache.size,
            validEntries,
            expiredEntries,
            cacheTimeout: this.cacheTimeout,
            requestCount: this.requestTimes.length,
            maxRequestsPerWindow: this.maxRequestsPerWindow
        };
    }

    /**
     * Format price for display with proper currency symbol
     * 
     * @param {number} price - Price value
     * @param {string} currency - Currency code
     * @returns {string} Formatted price
     */
    formatPrice(price, currency = 'USD') {
        if (typeof price !== 'number' || isNaN(price)) {
            return 'N/A';
        }

        const currencySymbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'JPY': '¥',
            'ILS': '₪'
        };

        const symbol = currencySymbols[currency] || currency;
        return `${symbol}${price.toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        })}`;
    }

    /**
     * Format percentage change with color coding
     * 
     * @param {number} changePercent - Percentage change
     * @returns {Object} Formatted change with color class
     */
    formatPercentageChange(changePercent) {
        if (typeof changePercent !== 'number' || isNaN(changePercent)) {
            return { text: 'N/A', colorClass: '' };
        }

        const sign = changePercent >= 0 ? '+' : '';
        const text = `${sign}${changePercent.toFixed(2)}%`;
        const colorClass = changePercent >= 0 ? 'text-success' : 'text-danger';

        return { text, colorClass };
    }

    /**
     * Format timestamp for display in local timezone
     * 
     * @param {string} utcTimestamp - UTC timestamp string
     * @returns {string} Formatted local time
     */
    formatTimestamp(utcTimestamp) {
        if (!utcTimestamp) {
            return 'N/A';
        }

        try {
            const date = new Date(utcTimestamp);
            return date.toLocaleString('he-IL', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            this.log(`Error formatting timestamp: ${error.message}`, 'warn');
            return utcTimestamp;
        }
    }

    /**
     * Check if market data is stale
     * 
     * @param {string} timestamp - Data timestamp
     * @param {number} maxAgeMinutes - Maximum age in minutes
     * @returns {boolean} True if data is stale
     */
    isDataStale(timestamp, maxAgeMinutes = 5) {
        if (!timestamp) return true;

        try {
            const dataTime = new Date(timestamp);
            const now = new Date();
            const ageMinutes = (now - dataTime) / (1000 * 60);
            
            return ageMinutes > maxAgeMinutes;
        } catch (error) {
            return true;
        }
    }
}

// Create global instance
window.ExternalDataService = window.ExternalDataService || new ExternalDataService();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExternalDataService;
}

// Service loaded and ready - console logging removed for no-console compliance

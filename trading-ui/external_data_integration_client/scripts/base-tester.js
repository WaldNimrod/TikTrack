/**
 * Base Tester Class for External Data Integration
 * 
 * This class provides common functionality for all test modules
 * including logging, time updates, loading states, and result display.
 * 
 * Author: TikTrack Development Team
 * Created: January 2025
 * Version: 1.0
 */

class BaseTester {
    constructor() {
        this.apiBaseUrl = '/api/v1';
        this.logEntries = [];
        this.isLoading = false;
        
        this.initializeBaseEventListeners();
        this.updateCurrentTime();
        this.startTimeUpdate();
    }

    /**
     * Initialize base event listeners
     */
    initializeBaseEventListeners() {
        // Common event listeners can be added here
    }

    /**
     * Update current time display
     */
    updateCurrentTime() {
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('he-IL', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            const dateString = now.toLocaleDateString('he-IL', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            timeElement.textContent = `${dateString} ${timeString}`;
        }
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
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.textContent = message;
        }
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
        if (!logContent) return;
        
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
     * Display results in a standardized format
     */
    displayResults(title, data, type = 'info') {
        const resultsContainer = document.getElementById('results-container');
        if (!resultsContainer) return;

        const resultElement = document.createElement('div');
        resultElement.className = `alert alert-${this.getStatusClass(type)} mb-3 fade-in`;
        
        let content = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h6 class="mb-2">${title}</h6>
                    <small class="text-muted">${new Date().toLocaleTimeString('he-IL')}</small>
                </div>
                <span class="badge bg-${this.getStatusClass(type)}">
                    ${this.getStatusText(type)}
                </span>
            </div>
        `;
        
        if (data) {
            content += `
                <details class="mt-2">
                    <summary>פרטי התוצאות</summary>
                    <pre class="mt-2 bg-light p-2 rounded"><code>${JSON.stringify(data, null, 2)}</code></pre>
                </details>
            `;
        }
        
        resultElement.innerHTML = content;
        resultsContainer.appendChild(resultElement);
        
        // Scroll to bottom
        resultsContainer.scrollTop = resultsContainer.scrollHeight;
    }

    /**
     * Get status class for Bootstrap
     */
    getStatusClass(status) {
        switch (status) {
            case 'success': return 'success';
            case 'error': return 'danger';
            case 'warning': return 'warning';
            case 'info': return 'info';
            default: return 'secondary';
        }
    }

    /**
     * Get status text in Hebrew
     */
    getStatusText(status) {
        switch (status) {
            case 'success': return 'הצלחה';
            case 'error': return 'שגיאה';
            case 'warning': return 'אזהרה';
            case 'info': return 'מידע';
            default: return 'לא ידוע';
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        console.error(message);
        this.log('error', message);
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

    /**
     * Format number with commas
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseTester;
}


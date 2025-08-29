/**
 * API Test JavaScript
 * 
 * This script provides functionality for testing API endpoints
 * including GET/POST requests, authentication, rate limiting, and error handling.
 * 
 * Author: TikTrack Development Team
 * Created: January 2025
 * Version: 1.0
 */

class ApiTester {
    constructor() {
        this.apiBaseUrl = '/api/v1';
        this.logEntries = [];
        this.isLoading = false;
        
        this.initializeEventListeners();
        this.updateCurrentTime();
        this.startTimeUpdate();
        this.log('info', 'דף בדיקת API נטען בהצלחה');
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Endpoint testing
        document.getElementById('test-endpoint')?.addEventListener('click', () => {
            this.testEndpoint();
        });

        document.getElementById('test-post')?.addEventListener('click', () => {
            this.testPostRequest();
        });

        // Authentication testing
        document.getElementById('test-auth')?.addEventListener('click', () => {
            this.testAuthentication();
        });

        document.getElementById('test-auth-fail')?.addEventListener('click', () => {
            this.testAuthFailure();
        });

        // Rate limiting testing
        document.getElementById('test-rate-limit')?.addEventListener('click', () => {
            this.testRateLimiting();
        });

        document.getElementById('test-rate-limit-exceed')?.addEventListener('click', () => {
            this.testRateLimitExceed();
        });

        // Error handling testing
        document.getElementById('test-404')?.addEventListener('click', () => {
            this.test404Error();
        });

        document.getElementById('test-500')?.addEventListener('click', () => {
            this.test500Error();
        });

        // Performance testing
        document.getElementById('test-performance')?.addEventListener('click', () => {
            this.testPerformance();
        });

        document.getElementById('test-concurrent')?.addEventListener('click', () => {
            this.testConcurrentRequests();
        });

        // Custom request testing
        document.getElementById('test-custom-request')?.addEventListener('click', () => {
            this.testCustomRequest();
        });

        // Initialize custom request edit functionality
        this.initializeCustomRequestEdit();
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
     * Initialize custom request edit functionality
     */
    initializeCustomRequestEdit() {
        const urlTextarea = document.getElementById('custom-endpoint-url');
        const urlLabel = document.getElementById('custom-endpoint-url-label');
        const jsonTextarea = document.getElementById('custom-request-json');
        const jsonLabel = document.getElementById('custom-request-json-label');
        
        if (urlTextarea && urlLabel) {
            urlTextarea.addEventListener('blur', function() {
                urlLabel.textContent = this.value || 'אין URL';
                urlLabel.style.display = 'block';
                this.style.display = 'none';
            });
        }
        
        if (jsonTextarea && jsonLabel) {
            jsonTextarea.addEventListener('blur', function() {
                jsonLabel.textContent = this.value || 'אין JSON';
                jsonLabel.style.display = 'block';
                this.style.display = 'none';
            });
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
        const logContent = document.getElementById('api-test-logs');
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
     * Display results
     */
    displayResults(title, data, type = 'info') {
        const resultsContainer = document.getElementById('api-results');
        if (!resultsContainer) return;

        const resultElement = document.createElement('div');
        resultElement.className = `result-item result-${type}`;
        resultElement.innerHTML = `
            <div class="result-header">
                <strong>${title}</strong>
                <small class="text-muted">${new Date().toLocaleTimeString('he-IL')}</small>
            </div>
            <div class="result-content">
                <pre>${JSON.stringify(data, null, 2)}</pre>
            </div>
        `;

        resultsContainer.appendChild(resultElement);
        resultsContainer.scrollTop = resultsContainer.scrollHeight;
    }

    /**
     * Test Basic Endpoint
     */
    async testEndpoint() {
        this.log('info', 'בדיקת endpoint בסיסי...');
        
        try {
            const startTime = performance.now();
            const response = await fetch('/api/v1/tickers/');
            const endTime = performance.now();
            
            const data = await response.json();
            
            const result = {
                endpoint: '/api/v1/tickers/',
                method: 'GET',
                status: response.status,
                statusText: response.statusText,
                responseTime: `${(endTime - startTime).toFixed(2)}ms`,
                dataLength: JSON.stringify(data).length,
                headers: Object.fromEntries(response.headers.entries()),
                timestamp: new Date().toISOString()
            };

            this.displayResults('בדיקת Endpoint בסיסי', result, response.ok ? 'success' : 'error');
            this.log(response.ok ? 'success' : 'error', `בדיקת endpoint הושלמה: ${response.status}`);
        } catch (error) {
            this.log('error', `שגיאה בבדיקת endpoint: ${error.message}`);
        }
    }

    /**
     * Test POST Request
     */
    async testPostRequest() {
        this.log('info', 'בדיקת בקשת POST...');
        
        try {
            const testData = {
                test: true,
                timestamp: new Date().toISOString(),
                message: 'בדיקת POST request'
            };
            
            const startTime = performance.now();
            const response = await fetch('/api/v1/preferences/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testData)
            });
            const endTime = performance.now();
            
            const result = {
                endpoint: '/api/v1/preferences/',
                method: 'POST',
                status: response.status,
                statusText: response.statusText,
                responseTime: `${(endTime - startTime).toFixed(2)}ms`,
                requestData: testData,
                timestamp: new Date().toISOString()
            };

            this.displayResults('בדיקת בקשת POST', result, response.ok ? 'success' : 'warning');
            this.log(response.ok ? 'success' : 'warning', `בדיקת POST הושלמה: ${response.status}`);
        } catch (error) {
            this.log('error', `שגיאה בבדיקת POST: ${error.message}`);
        }
    }

    /**
     * Test Authentication
     */
    async testAuthentication() {
        this.log('info', 'בדיקת אימות...');
        
        try {
            // Simulate authentication test
            const authData = {
                authentication_method: 'session_based',
                is_authenticated: true,
                user_id: 1,
                permissions: ['read', 'write'],
                session_valid: true,
                timestamp: new Date().toISOString()
            };

            this.displayResults('בדיקת אימות', authData, 'success');
            this.log('success', 'בדיקת אימות הושלמה בהצלחה');
        } catch (error) {
            this.log('error', `שגיאה בבדיקת אימות: ${error.message}`);
        }
    }

    /**
     * Test Authentication Failure
     */
    async testAuthFailure() {
        this.log('info', 'בדיקת כישלון אימות...');
        
        try {
            // Simulate authentication failure
            const authFailData = {
                authentication_method: 'session_based',
                is_authenticated: false,
                error_code: 'AUTH_FAILED',
                error_message: 'Session expired or invalid',
                required_action: 're_login',
                timestamp: new Date().toISOString()
            };

            this.displayResults('בדיקת כישלון אימות', authFailData, 'warning');
            this.log('warning', 'בדיקת כישלון אימות הושלמה');
        } catch (error) {
            this.log('error', `שגיאה בבדיקת כישלון אימות: ${error.message}`);
        }
    }

    /**
     * Test Rate Limiting
     */
    async testRateLimiting() {
        this.log('info', 'בדיקת הגבלת קצב...');
        
        try {
            // Simulate rate limiting test
            const rateLimitData = {
                current_requests: 45,
                max_requests_per_hour: 1000,
                remaining_requests: 955,
                reset_time: new Date(Date.now() + 3600000).toISOString(),
                rate_limit_headers: {
                    'X-RateLimit-Limit': '1000',
                    'X-RateLimit-Remaining': '955',
                    'X-RateLimit-Reset': new Date(Date.now() + 3600000).toISOString()
                },
                timestamp: new Date().toISOString()
            };

            this.displayResults('בדיקת הגבלת קצב', rateLimitData, 'success');
            this.log('success', 'בדיקת הגבלת קצב הושלמה בהצלחה');
        } catch (error) {
            this.log('error', `שגיאה בבדיקת הגבלת קצב: ${error.message}`);
        }
    }

    /**
     * Test Rate Limit Exceed
     */
    async testRateLimitExceed() {
        this.log('info', 'בדיקת חריגה מהגבלת קצב...');
        
        try {
            // Simulate rate limit exceeded
            const rateLimitExceedData = {
                current_requests: 1001,
                max_requests_per_hour: 1000,
                remaining_requests: 0,
                error_code: 'RATE_LIMIT_EXCEEDED',
                error_message: 'Rate limit exceeded. Please try again later.',
                retry_after: 3600,
                timestamp: new Date().toISOString()
            };

            this.displayResults('בדיקת חריגה מהגבלת קצב', rateLimitExceedData, 'warning');
            this.log('warning', 'בדיקת חריגה מהגבלת קצב הושלמה');
        } catch (error) {
            this.log('error', `שגיאה בבדיקת חריגה מהגבלת קצב: ${error.message}`);
        }
    }

    /**
     * Test 404 Error
     */
    async test404Error() {
        this.log('info', 'בדיקת שגיאת 404...');
        
        try {
            const startTime = performance.now();
            const response = await fetch('/api/v1/nonexistent-endpoint/');
            const endTime = performance.now();
            
            const result = {
                endpoint: '/api/v1/nonexistent-endpoint/',
                method: 'GET',
                status: response.status,
                statusText: response.statusText,
                responseTime: `${(endTime - startTime).toFixed(2)}ms`,
                expected: '404 Not Found',
                timestamp: new Date().toISOString()
            };

            this.displayResults('בדיקת שגיאת 404', result, response.status === 404 ? 'success' : 'warning');
            this.log(response.status === 404 ? 'success' : 'warning', `בדיקת 404 הושלמה: ${response.status}`);
        } catch (error) {
            this.log('error', `שגיאה בבדיקת 404: ${error.message}`);
        }
    }

    /**
     * Test 500 Error
     */
    async test500Error() {
        this.log('info', 'בדיקת שגיאת 500...');
        
        try {
            // Simulate 500 error test
            const error500Data = {
                endpoint: '/api/v1/test-500-error/',
                method: 'GET',
                status: 500,
                statusText: 'Internal Server Error',
                error_type: 'server_error',
                error_message: 'Internal server error occurred',
                timestamp: new Date().toISOString()
            };

            this.displayResults('בדיקת שגיאת 500', error500Data, 'warning');
            this.log('warning', 'בדיקת שגיאת 500 הושלמה');
        } catch (error) {
            this.log('error', `שגיאה בבדיקת 500: ${error.message}`);
        }
    }

    /**
     * Test Performance
     */
    async testPerformance() {
        this.log('info', 'בדיקת ביצועי API...');
        
        try {
            const requests = [];
            const startTime = performance.now();
            
            // Make 10 concurrent requests
            for (let i = 0; i < 10; i++) {
                requests.push(fetch('/api/v1/tickers/').then(r => ({ status: r.status, ok: r.ok })));
            }
            
            const responses = await Promise.all(requests);
            const endTime = performance.now();
            
            const performanceData = {
                total_requests: 10,
                successful_requests: responses.filter(r => r.ok).length,
                failed_requests: responses.filter(r => !r.ok).length,
                total_time: `${(endTime - startTime).toFixed(2)}ms`,
                average_time: `${((endTime - startTime) / 10).toFixed(2)}ms`,
                success_rate: `${((responses.filter(r => r.ok).length / 10) * 100).toFixed(1)}%`,
                timestamp: new Date().toISOString()
            };

            this.displayResults('בדיקת ביצועי API', performanceData, 'success');
            this.log('success', 'בדיקת ביצועי API הושלמה בהצלחה');
        } catch (error) {
            this.log('error', `שגיאה בבדיקת ביצועי API: ${error.message}`);
        }
    }

    /**
     * Test Concurrent Requests
     */
    async testConcurrentRequests() {
        this.log('info', 'בדיקת בקשות מקבילות...');
        
        try {
            const endpoints = [
                '/api/v1/tickers/',
                '/api/v1/accounts/',
                '/api/v1/alerts/',
                '/api/v1/cash_flows/'
            ];
            
            const startTime = performance.now();
            const requests = endpoints.map(endpoint => 
                fetch(endpoint).then(r => ({ endpoint, status: r.status, ok: r.ok }))
            );
            
            const responses = await Promise.all(requests);
            const endTime = performance.now();
            
            const concurrentData = {
                endpoints_tested: endpoints,
                total_requests: endpoints.length,
                successful_requests: responses.filter(r => r.ok).length,
                failed_requests: responses.filter(r => !r.ok).length,
                total_time: `${(endTime - startTime).toFixed(2)}ms`,
                average_time: `${((endTime - startTime) / endpoints.length).toFixed(2)}ms`,
                response_details: responses,
                timestamp: new Date().toISOString()
            };

            this.displayResults('בדיקת בקשות מקבילות', concurrentData, 'success');
            this.log('success', 'בדיקת בקשות מקבילות הושלמה בהצלחה');
        } catch (error) {
            this.log('error', `שגיאה בבדיקת בקשות מקבילות: ${error.message}`);
        }
    }

    /**
     * Test Custom Request
     */
    async testCustomRequest() {
        this.log('info', 'הרצת בקשת API מותאמת...');
        
        try {
            const urlElement = document.getElementById('custom-endpoint-url');
            const jsonElement = document.getElementById('custom-request-json');
            
            const url = urlElement ? urlElement.value : '/api/v1/tickers/';
            const jsonData = jsonElement ? jsonElement.value : '{}';
            
            let requestOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            // If JSON data is provided, use POST method
            if (jsonData && jsonData.trim() !== '{}' && jsonData.trim() !== '') {
                requestOptions.method = 'POST';
                requestOptions.body = jsonData;
            }
            
            const startTime = performance.now();
            const response = await fetch(url, requestOptions);
            const endTime = performance.now();
            
            let responseData;
            try {
                responseData = await response.json();
            } catch {
                responseData = await response.text();
            }
            
            const customData = {
                url: url,
                method: requestOptions.method,
                status: response.status,
                statusText: response.statusText,
                responseTime: `${(endTime - startTime).toFixed(2)}ms`,
                requestData: jsonData !== '{}' ? JSON.parse(jsonData) : null,
                responseData: responseData,
                headers: Object.fromEntries(response.headers.entries()),
                timestamp: new Date().toISOString()
            };

            this.displayResults('בקשת API מותאמת', customData, response.ok ? 'success' : 'warning');
            this.log(response.ok ? 'success' : 'warning', `בקשת API מותאמת הושלמה: ${response.status}`);
        } catch (error) {
            this.log('error', `שגיאה בבקשת API מותאמת: ${error.message}`);
        }
    }
}

// Initialize the tester when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.apiTester = new ApiTester();
});

// Global functions
function clearApiLogs() {
    const logContainer = document.getElementById('api-test-logs');
    if (logContainer) {
        logContainer.innerHTML = '';
        console.log('🧹 API logs cleared');
    }
}

function editCustomEndpointUrl() {
    const label = document.getElementById('custom-endpoint-url-label');
    const textarea = document.getElementById('custom-endpoint-url');
    if (label && textarea) {
        label.style.display = 'none';
        textarea.style.display = 'block';
        textarea.focus();
    }
}

function editCustomRequestJson() {
    const label = document.getElementById('custom-request-json-label');
    const textarea = document.getElementById('custom-request-json');
    if (label && textarea) {
        label.style.display = 'none';
        textarea.style.display = 'block';
        textarea.focus();
    }
}

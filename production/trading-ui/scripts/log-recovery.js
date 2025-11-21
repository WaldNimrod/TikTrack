/**
 * ========================================
 * Log Recovery Module - Linter Realtime Monitor
 * ========================================
 * 
 * מודול ניהול לוגים למערכת ניטור Linter
 * כולל שחזור לוגים וניהול הודעות
 * 
 * תכונות:
 * - טעינת לוגים
 * - שחזור לוגים
 * - ניהול הודעות לוג
 * - העתקת לוגים מפורטים
 * 
 * ========================================
 * 
 * מחבר: TikTrack Development Team
 * תאריך עדכון אחרון: 2025
 * ========================================
 */

/**
 * טעינת לוגים
 * Load logs
 */
function loadLogs() {
    try {
        const logs = JSON.parse(localStorage.getItem('linterLogs') || '[]');
        // Just update the display once with all logs, don't call handleLogEntry for each
        updateLogDisplay();
        // נטענו רשומות לוג
        
        // Try to load scanning results from localStorage as backup
        const savedResults = localStorage.getItem('linterScanningResults');
        if (savedResults) {
            try {
                const parsedResults = JSON.parse(savedResults);
                if (parsedResults && (parsedResults.errors?.length > 0 || parsedResults.warnings?.length > 0)) {
                    window.scanningResults = parsedResults;
                    console.log('✅ Loaded scanning results from localStorage backup');
                }
            } catch (parseError) {
                console.error('Error parsing saved scanning results:', parseError);
            }
        }
        
        console.log('✅ Logs loaded successfully');
    } catch (error) {
        console.error('❌ Error loading logs:', error);
        addLogEntry('ERROR', 'שגיאה בטעינת לוגים', { error: error.message });
    }
}

/**
 * קבלת כל רשומות הלוג
 * Get all log entries
 */
function getAllLogEntries() {
    try {
        return JSON.parse(localStorage.getItem('linterLogs') || '[]');
    } catch (error) {
        console.error('❌ Error getting log entries:', error);
        return [];
    }
}

/**
 * הוספת רשומת לוג
 * Add log entry
 */
function addLogEntry(level, message, details = {}) {
    const entry = {
        timestamp: new Date().toISOString(),
        level: level,
        message: message,
        details: details
    };
    
    // Store in localStorage
    try {
        const logs = getAllLogEntries();
        logs.push(entry);
        
        // Keep only last 1000 entries to prevent localStorage overflow
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        localStorage.setItem('linterLogs', JSON.stringify(logs));
        
        // Handle the log entry
        handleLogEntry(entry);
        
        console.log(`📝 Log entry added: ${level} - ${message}`);
    } catch (error) {
        console.error('❌ Error adding log entry:', error);
    }
}

/**
 * טיפול ברשומת לוג
 * Handle log entry
 */
function handleLogEntry(entry) {
    // Update log display
    updateLogDisplay();
    
    // Handle different log levels
    switch (entry.level) {
        case 'ERROR':
            handleCriticalError(entry);
            break;
        case 'WARNING':
            handleWarning(entry);
            break;
        case 'SUCCESS':
            handleSuccess(entry);
            break;
        case 'INFO':
            // Just log to console for info messages
            console.log(`ℹ️ ${entry.message}`);
            break;
    }
    
    // Monitor performance for relevant entries
    monitorPerformance(entry);
    
    // Monitor security for relevant entries
    monitorSecurity(entry);
}

/**
 * טיפול בשגיאות קריטיות
 * Handle critical errors
 */
function handleCriticalError(entry) {
    // Direct console log to avoid recursion
    console.error(`🚨 Critical Error: ${entry.message}`, entry.details);
    
    // Attempt recovery if possible
    if (entry.details && entry.details.recoverable) {
        attemptRecovery(entry);
    }
}

/**
 * טיפול באזהרות
 * Handle warnings
 */
function handleWarning(entry) {
    // Direct console log to avoid recursion
    console.warn(`⚠️ Warning: ${entry.message}`, entry.details);
}

/**
 * טיפול בהודעות הצלחה
 * Handle success messages
 */
function handleSuccess(entry) {
    // Direct console log to avoid recursion
    console.log(`✅ Success: ${entry.message}`, entry.details);
}

/**
 * ניטור ביצועים
 * Monitor performance
 */
function monitorPerformance(entry) {
    if (entry.details && entry.details.scanDuration) {
        const duration = entry.details.scanDuration;
        if (duration > 30000) { // More than 30 seconds
            addLogEntry('WARNING', 'סריקה איטית זוהתה', { 
                duration: duration,
                performance: 'slow'
            });
        }
    }
}

/**
 * ניטור אבטחה
 * Monitor security
 */
function monitorSecurity(entry) {
    const securityPatterns = [
        'password', 'token', 'key', 'secret', 'auth'
    ];
    
    const message = entry.message.toLowerCase();
    const hasSecurityPattern = securityPatterns.some(pattern => 
        message.includes(pattern)
    );
    
    if (hasSecurityPattern) {
        addLogEntry('WARNING', 'זוהה תוכן רגיש בלוג', {
            pattern: 'security-sensitive',
            message: entry.message
        });
    }
}

/**
 * עדכון תצוגת לוגים
 * Update log display
 */
function updateLogDisplay() {
    const logContainer = document.getElementById('logsContainer');
    if (!logContainer) return;
    
    const logs = getAllLogEntries();
    const recentLogs = logs.slice(-50); // Show last 50 entries
    
    // Clear existing content
    logContainer.innerHTML = '';
    
    // Add log entries
    recentLogs.forEach(log => {
        const logElement = document.createElement('div');
        logElement.className = `log-entry log-${log.level.toLowerCase()}`;
        
        const timestamp = new Date(log.timestamp).toLocaleString('he-IL');
        logElement.innerHTML = `
            <span class="log-timestamp">${timestamp}</span>
            <span class="log-level">${log.level}</span>
            <span class="log-message">${log.message}</span>
        `;
        
        logContainer.appendChild(logElement);
    });
    
    // Scroll to bottom
    logContainer.scrollTop = logContainer.scrollHeight;
}

/**
 * העתקת לוג מפורט
 * Copy detailed log
 */

/**
 * העתקת לוג בעיות לא פתורות
 * Copy unresolved issues log
 */
function copyUnresolvedIssuesLog() {
    if (!window.scanningResults) {
        console.warn('⚠️ No scanning data available');
        return;
    }
    
    const unresolvedIssues = [
        ...window.scanningResults.errors,
        ...window.scanningResults.warnings
    ];
    
    if (unresolvedIssues.length === 0) {
        console.log('ℹ️ No unresolved issues found');
        return;
    }
    
    // Format issues for copying
    const formattedIssues = unresolvedIssues.map(issue => {
        return `${issue.file}:${issue.line} - ${issue.type.toUpperCase()}: ${issue.message}`;
    }).join('\n');
    
    // Copy to clipboard
    navigator.clipboard.writeText(formattedIssues).then(() => {
        console.log('✅ Unresolved issues log copied to clipboard');
    }).catch(error => {
        console.error('❌ Error copying unresolved issues log:', error);
    });
}

/**
 * ניסיון שחזור
 * Attempt recovery
 */
function attemptRecovery(entry) {
    console.log('🔄 Attempting recovery for:', entry.message);
    
    // Implement recovery logic based on error type
    if (entry.details && entry.details.type === 'chart') {
        if (typeof window.attemptChartRecovery === 'function') {
            window.attemptChartRecovery();
        }
    } else if (entry.details && entry.details.type === 'storage') {
        if (typeof window.attemptStorageRecovery === 'function') {
            window.attemptStorageRecovery();
        }
    } else if (entry.details && entry.details.type === 'network') {
        if (typeof window.attemptNetworkRecovery === 'function') {
            window.attemptNetworkRecovery();
        }
    }
}

// Export functions to global scope
window.loadLogs = loadLogs;
window.getAllLogEntries = getAllLogEntries;
window.addLogEntry = addLogEntry;
window.handleLogEntry = handleLogEntry;
window.updateLogDisplay = updateLogDisplay;
/**
 * העתקת לוג מפורט של Linter Realtime Monitor
 * REMOVED: This function was moved to linter-realtime-monitor.js to avoid conflicts
 * The function is now available as window.copyLinterDetailedLog()
 */
window.copyUnresolvedIssuesLog = copyUnresolvedIssuesLog;

console.log('📝 Log Recovery Module loaded successfully');
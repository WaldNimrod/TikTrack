/**
 * ===== TikTrack Console Cleanup System =====
 * 
 * This file contains the console cleanup functionality that can be used
 * across all pages in the TikTrack application.
 * 
 * Features:
 * - Configurable cleanup interval from user preferences (default: 60 seconds)
 * - Automatic cleanup on page load
 * - Manual cleanup function
 * - Integration with preferences system
 * - localStorage caching for fast access
 * 
 * Default Settings:
 * - Default cleanup interval: 60 seconds (60000ms)
 * - Can be disabled by setting interval to 0
 * - Available intervals: 30s, 60s, 2min, 5min, 10min, disabled
 * 
 * Dependencies: None (standalone utility file)
 * Dependents: All HTML pages
 * 
 * File: trading-ui/scripts/console-cleanup.js
 * @version 2.2
 * @author TikTrack Development Team
 * @since August 2025
 */

/**
 * Global variable to store the cleanup timeout
 */
let consoleCleanupTimeout = null;

/**
 * Initializes console cleanup based on user preferences
 * 
 * This function loads the cleanup interval from preferences and sets up
 * the automatic cleanup timer. Default interval is 60 seconds.
 * 
 * @returns {Promise<void>}
 * 
 * @example
 * // Initialize console cleanup on page load
 * await initializeConsoleCleanup();
 */
async function initializeConsoleCleanup() {
    try {
        console.log('🔄 מאתחל ניקוי קונסולה...');

        // Load preferences from localStorage first (faster)
        const storedPreferences = localStorage.getItem('tiktrack_preferences');
        let cleanupInterval = 60000; // Default: 60 seconds (1 minute)

        if (storedPreferences) {
            try {
                const preferences = JSON.parse(storedPreferences);
                cleanupInterval = preferences.consoleCleanupInterval || 60000;
            } catch (error) {
                console.warn('⚠️ שגיאה בקריאת העדפות מ-localStorage:', error);
            }
        }

        // If no cleanup interval or set to 0, don't set up cleanup
        if (!cleanupInterval || cleanupInterval === 0) {
            console.log('ℹ️ ניקוי אוטומטי של קונסולה מבוטל');
            return;
        }

        // Clear any existing timeout
        if (consoleCleanupTimeout) {
            clearTimeout(consoleCleanupTimeout);
        }

        // Set up new cleanup timeout
        consoleCleanupTimeout = setTimeout(() => {
            clearConsole();
        }, cleanupInterval);

        console.log(`✅ ניקוי קונסולה מוגדר ל-${Math.floor(cleanupInterval / 1000)} שניות`);

    } catch (error) {
        console.error('❌ שגיאה באתחול ניקוי קונסולה:', error);
    }
}

/**
 * Clears the console and shows a cleanup message
 * 
 * This function clears the console and optionally shows a message
 * about the cleanup action.
 * 
 * @param {boolean} showMessage - Whether to show a cleanup message (default: true)
 * @returns {void}
 * 
 * @example
 * // Clear console with message
 * clearConsole();
 * 
 * @example
 * // Clear console silently
 * clearConsole(false);
 */
function clearConsole(showMessage = true) {
    if (showMessage) {
        console.log('🧹 Clearing console messages to reduce clutter...');
    }

    if (console.clear) {
        console.clear();
    }

    // Re-initialize cleanup for continuous operation
    initializeConsoleCleanup();
}

/**
 * Updates the console cleanup interval
 * 
 * This function updates the cleanup interval and restarts the timer.
 * It should be called when the user changes the preference.
 * 
 * @param {number} newInterval - New cleanup interval in milliseconds
 * @returns {Promise<void>}
 * 
 * @example
 * // Update to 2 minutes
 * await updateConsoleCleanupInterval(120000);
 * 
 * @example
 * // Disable cleanup
 * await updateConsoleCleanupInterval(0);
 */
async function updateConsoleCleanupInterval(newInterval) {
    try {
        console.log(`🔄 עדכון זמן ניקוי קונסולה ל-${newInterval}ms`);

        // Clear existing timeout
        if (consoleCleanupTimeout) {
            clearTimeout(consoleCleanupTimeout);
            consoleCleanupTimeout = null;
        }

        // If interval is 0, disable cleanup
        if (!newInterval || newInterval === 0) {
            console.log('ℹ️ ניקוי אוטומטי של קונסולה מבוטל');
            return;
        }

        // Set up new timeout
        consoleCleanupTimeout = setTimeout(() => {
            clearConsole();
        }, newInterval);

        console.log(`✅ זמן ניקוי קונסולה עודכן ל-${Math.floor(newInterval / 1000)} שניות`);

    } catch (error) {
        console.error('❌ שגיאה בעדכון זמן ניקוי קונסולה:', error);
    }
}

/**
 * Manual console cleanup function
 * 
 * This function can be called manually to clear the console immediately.
 * It also resets the cleanup timer.
 * 
 * @returns {void}
 * 
 * @example
 * // Manual cleanup
 * manualConsoleCleanup();
 */
function manualConsoleCleanup() {
    console.log('🧹 Manual console cleanup initiated...');
    clearConsole(false);
}

// Initialize cleanup when the script loads
document.addEventListener('DOMContentLoaded', () => {
    initializeConsoleCleanup();
});

// Export functions for global use
window.initializeConsoleCleanup = initializeConsoleCleanup;
window.clearConsole = clearConsole;
window.updateConsoleCleanupInterval = updateConsoleCleanupInterval;
window.manualConsoleCleanup = manualConsoleCleanup;

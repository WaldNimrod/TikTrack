/**
 * Global Favicon Manager - TikTrack
 * מנהל Favicon גלובלי - TikTrack
 * 
 * @description מגדיר favicon לכל העמודים בצורה מרוכזת
 * @version 1.0.0
 * @author TikTrack Development Team
 * @created 2025-09-22
 */

/**
 * Set favicon for the current page
 * מגדיר favicon לעמוד הנוכחי
 * 
 * @param {string} iconPath - Path to the icon file (default: 'favicon.ico')
 * @param {string} iconType - MIME type of the icon (default: 'image/svg+xml')
 */
function setGlobalFavicon(iconPath = 'favicon.ico', iconType = 'image/svg+xml') {
    try {
        // Remove existing favicon links
        const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
        existingFavicons.forEach(link => link.remove());
        
        // Create new favicon links
        const faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        faviconLink.type = iconType;
        faviconLink.href = iconPath;
        
        const shortcutLink = document.createElement('link');
        shortcutLink.rel = 'shortcut icon';
        shortcutLink.href = iconPath;
        
        // Add to head
        document.head.appendChild(faviconLink);
        document.head.appendChild(shortcutLink);
        
    } catch (error) {
        console.warn('⚠️ Failed to set global favicon:', error);
    }
}

/**
 * Set favicon based on page type
 * מגדיר favicon לפי סוג העמוד
 * 
 * @param {string} pageType - Type of page (home, linter, js-map, etc.)
 */
function setPageSpecificFavicon(pageType = 'home') {
    const iconMap = {
        'home': 'favicon.ico',
        'linter': 'images/icons/development.svg',
        'js-map': 'images/icons/development.svg',
        'accounts': 'images/icons/accounts.svg',
        'alerts': 'images/icons/alerts.svg',
        'cash-flows': 'images/icons/cash_flows.svg',
        'executions': 'images/icons/executions.svg',
        'db-display': 'images/icons/db_display.svg'
    };
    
    const iconPath = iconMap[pageType] || 'favicon.ico';
    const iconType = iconPath.endsWith('.svg') ? 'image/svg+xml' : 'image/x-icon';
    
    setGlobalFavicon(iconPath, iconType);
}

/**
 * Auto-detect page type and set appropriate favicon
 * מזהה אוטומטית את סוג העמוד ומגדיר favicon מתאים
 */
function autoSetFavicon() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().replace('.html', '');
    
    // Map filename to page type
    const pageTypeMap = {
        'index': 'home',
        'linter-realtime-monitor': 'linter',
        'js-map': 'js-map',
        'accounts': 'accounts',
        'alerts': 'alerts',
        'cash-flows': 'cash-flows',
        'executions': 'executions',
        'db-display': 'db-display'
    };
    
    const pageType = pageTypeMap[filename] || 'home';
    setPageSpecificFavicon(pageType);
}

// Auto-set favicon when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoSetFavicon);
} else {
    autoSetFavicon();
}

/**
 * Set favicon (alias for setGlobalFavicon)
 * מגדיר favicon (כינוי ל-setGlobalFavicon)
 * 
 * @param {string} iconPath - Path to the icon file
 * @param {string} iconType - MIME type of the icon
 */
function setFavicon(iconPath = 'favicon.ico', iconType = 'image/svg+xml') {
    return setGlobalFavicon(iconPath, iconType);
}

/**
 * Update favicon based on application status
 * מעדכן favicon לפי סטטוס האפליקציה
 * 
 * @param {string} status - Application status (online, offline, error, loading, etc.)
 */
async function updateFaviconBasedOnStatus(status = 'online') {
    const statusIcons = {
        'online': {
            path: 'favicon.ico',
            type: 'image/x-icon'
        },
        'offline': {
            path: 'images/icons/offline.svg',
            type: 'image/svg+xml'
        },
        'error': {
            path: 'images/icons/error.svg',
            type: 'image/svg+xml'
        },
        'loading': {
            path: 'images/icons/loading.svg',
            type: 'image/svg+xml'
        },
        'warning': {
            path: 'images/icons/warning.svg',
            type: 'image/svg+xml'
        },
        'success': {
            path: 'images/icons/success.svg',
            type: 'image/svg+xml'
        },
        'development': {
            path: 'images/icons/development.svg',
            type: 'image/svg+xml'
        },
        'maintenance': {
            path: 'images/icons/maintenance.svg',
            type: 'image/svg+xml'
        }
    };

    const iconConfig = statusIcons[status] || statusIcons['online'];
    
    try {
        setGlobalFavicon(iconConfig.path, iconConfig.type);
        
        // Store current status in unified cache for persistence
        if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
          await window.UnifiedCacheManager.save('appStatus', status, {
            layer: 'localStorage',
            ttl: null, // persistent
            syncToBackend: false
          });
        } else {
          localStorage.setItem('appStatus', status); // fallback
        }
        
    } catch (error) {
        console.warn(`⚠️ Failed to update favicon for status ${status}:`, error);
    }
}

/**
 * Get current application status from localStorage
 * מקבל סטטוס אפליקציה נוכחי מ-localStorage
 * 
 * @returns {string} Current application status
 */
async function getCurrentAppStatus() {
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
        return await window.UnifiedCacheManager.get('appStatus') || 'online';
    } else {
        return localStorage.getItem('appStatus') || 'online'; // fallback
    }
}

/**
 * Restore favicon based on saved status
 * משחזר favicon לפי סטטוס שמור
 */
function restoreFaviconFromStatus() {
    const savedStatus = getCurrentAppStatus();
    updateFaviconBasedOnStatus(savedStatus);
}

// Global exposure
window.setGlobalFavicon = setGlobalFavicon;
window.setPageSpecificFavicon = setPageSpecificFavicon;
window.autoSetFavicon = autoSetFavicon;
window.setFavicon = setFavicon;
window.updateFaviconBasedOnStatus = updateFaviconBasedOnStatus;
window.getCurrentAppStatus = getCurrentAppStatus;
window.restoreFaviconFromStatus = restoreFaviconFromStatus;



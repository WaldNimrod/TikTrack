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
        
        console.log('✅ Global favicon set successfully:', iconPath);
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

// Global exposure
window.setGlobalFavicon = setGlobalFavicon;
window.setPageSpecificFavicon = setPageSpecificFavicon;
window.autoSetFavicon = autoSetFavicon;

console.log('🔧 Global Favicon Manager loaded successfully');


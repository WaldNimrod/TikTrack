/**
 * Project Files Scanner Demo
 * =========================
 * 
 * דוגמה לשימוש במנגנון הגלובלי לסריקת קבצים
 * ניתן להשתמש בזה בכל עמוד במערכת
 * 
 * @version 1.0.0
 * @lastUpdated September 19, 2025
 */

// ========================================
// Demo Functions
// ========================================

/**
 * Demo: Show all project files
 */
async function showAllProjectFiles() {
    try {
        const files = await window.getProjectFiles();
        console.log('All project files:', files);
        
        const stats = await window.getFileStatistics();
        console.log('File statistics:', stats);
        
        // Show in UI if available
        if (typeof showNotification === 'function') {
            showNotification(`נמצאו ${stats.total} קבצים במערכת`, 'info', 'Project Files Scanner');
        }
        
        return files;
    } catch (error) {
        console.error('Error getting project files:', error);
        if (typeof showNotification === 'function') {
            showNotification('שגיאה בטעינת קבצי הפרויקט', 'error', 'Project Files Scanner');
        }
    }
}

/**
 * Demo: Show files by type
 */
async function showFilesByType(type) {
    try {
        const files = await window.getFilesByType(type);
        console.log(`${type} files:`, files);
        
        if (typeof showNotification === 'function') {
            showNotification(`נמצאו ${files.length} קבצי ${type}`, 'info', 'Project Files Scanner');
        }
        
        return files;
    } catch (error) {
        console.error(`Error getting ${type} files:`, error);
        if (typeof showNotification === 'function') {
            showNotification(`שגיאה בטעינת קבצי ${type}`, 'error', 'Project Files Scanner');
        }
    }
}

/**
 * Demo: Show file statistics
 */
async function showFileStatistics() {
    try {
        const stats = await window.getFileStatistics();
        console.log('File statistics:', stats);
        
        const message = `סטטיסטיקות קבצים:
        JavaScript: ${stats.js}
        HTML: ${stats.html}
        CSS: ${stats.css}
        Python: ${stats.python}
        Other: ${stats.other}
        סה"כ: ${stats.total}`;
        
        if (typeof showNotification === 'function') {
            showNotification(message, 'info', 'Project Files Statistics');
        }
        
        return stats;
    } catch (error) {
        console.error('Error getting file statistics:', error);
        if (typeof showNotification === 'function') {
            showNotification('שגיאה בטעינת סטטיסטיקות', 'error', 'Project Files Scanner');
        }
    }
}

/**
 * Demo: Clear cache and refresh
 */
function clearProjectFilesCache() {
    try {
        window.clearProjectFilesCache();
        console.log('Project files cache cleared');
        
        if (typeof showNotification === 'function') {
            showNotification('מטמון קבצי הפרויקט נוקה', 'success', 'Project Files Scanner');
        }
    } catch (error) {
        console.error('Error clearing cache:', error);
        if (typeof showNotification === 'function') {
            showNotification('שגיאה בניקוי המטמון', 'error', 'Project Files Scanner');
        }
    }
}

// ========================================
// Auto-demo on page load
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for the scanner to load
    setTimeout(async () => {
        if (typeof window.projectFilesScanner !== 'undefined') {
            console.log('🎯 Project Files Scanner Demo loaded');
            
            // Show statistics
            await showFileStatistics();
            
            // Show JavaScript files as example
            await showFilesByType('js');
        } else {
            console.warn('⚠️ Project Files Scanner not available');
        }
    }, 1000);
});

// ========================================
// Export functions for global use
// ========================================

window.showAllProjectFiles = showAllProjectFiles;
window.showFilesByType = showFilesByType;
window.showFileStatistics = showFileStatistics;
window.clearProjectFilesCache = clearProjectFilesCache;

/**
 * Script to clear modal navigation cache
 * Run this in console to clear the cached modal history
 */

(async function() {
    console.log('🧹 Clearing modal navigation cache...');
    
    // Option 1: Clear via UnifiedCacheManager (recommended)
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
        try {
            await window.UnifiedCacheManager.remove('modal-navigation-history', {
                layer: 'localStorage'
            });
            console.log('✅ Cleared modal-navigation-history from UnifiedCacheManager');
        } catch (error) {
            console.error('❌ Error clearing via UnifiedCacheManager:', error);
        }
    }
    
    // Option 2: Direct localStorage clear (fallback)
    try {
        const keys = Object.keys(localStorage);
        const modalKeys = keys.filter(key => 
            key.includes('modal') || 
            key.includes('navigation') || 
            key.includes('history')
        );
        
        modalKeys.forEach(key => {
            localStorage.removeItem(key);
            console.log(`✅ Removed: ${key}`);
        });
        
        if (modalKeys.length === 0) {
            console.log('ℹ️ No modal-related keys found in localStorage');
        }
    } catch (error) {
        console.error('❌ Error clearing localStorage:', error);
    }
    
    // Option 3: Clear all UnifiedCacheManager localStorage keys
    try {
        const allKeys = Object.keys(localStorage);
        const tiktrackKeys = allKeys.filter(key => key.startsWith('tiktrack_'));
        const modalRelatedKeys = tiktrackKeys.filter(key => 
            key.toLowerCase().includes('modal') || 
            key.toLowerCase().includes('navigation') ||
            key.toLowerCase().includes('history')
        );
        
        if (modalRelatedKeys.length > 0) {
            console.log('🔍 Found tiktrack_ keys related to modal:', modalRelatedKeys);
            // Don't auto-delete these - let user see them first
        }
    } catch (error) {
        console.error('❌ Error checking tiktrack_ keys:', error);
    }
    
    // Option 4: Clear modal history in memory
    if (window.modalNavigationManager) {
        window.modalNavigationManager.modalHistory = [];
        console.log('✅ Cleared modal history in memory');
    }
    
    console.log('✅ Cache clearing complete!');
    console.log('💡 Refresh the page (Ctrl+Shift+R / Cmd+Shift+R) to test changes');
})();



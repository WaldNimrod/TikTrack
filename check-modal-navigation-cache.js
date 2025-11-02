/**
 * Script to check and clear modal navigation cache
 * 
 * This script:
 * 1. Shows current cache state
 * 2. Allows clearing only modal-navigation-history
 * 3. Shows what's in localStorage related to modal navigation
 */

(function() {
    'use strict';
    
    console.log('🔍 Checking Modal Navigation Cache...\n');
    
    // 1. Check UnifiedCacheManager
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
        console.log('✅ UnifiedCacheManager is initialized');
        
        // Try to get cached history
        window.UnifiedCacheManager.get('modal-navigation-history', {
            layer: 'localStorage',
            fallback: () => null
        }).then(cachedHistory => {
            console.log('\n📦 Cached History from UnifiedCacheManager:');
            if (cachedHistory) {
                console.log('   Length:', cachedHistory.length);
                console.log('   Content:', JSON.stringify(cachedHistory, null, 2));
            } else {
                console.log('   ❌ No cached history found');
            }
        });
    } else {
        console.log('⚠️ UnifiedCacheManager not initialized');
    }
    
    // 2. Check localStorage directly
    console.log('\n💾 Checking localStorage directly:');
    const localStorageKeys = Object.keys(localStorage);
    const modalKeys = localStorageKeys.filter(key => 
        key.includes('modal') || 
        key.includes('navigation') || 
        key.includes('tiktrack_modal')
    );
    
    if (modalKeys.length > 0) {
        console.log(`   Found ${modalKeys.length} modal-related keys:`);
        modalKeys.forEach(key => {
            const value = localStorage.getItem(key);
            try {
                const parsed = JSON.parse(value);
                console.log(`   📌 ${key}:`, {
                    type: typeof parsed,
                    isArray: Array.isArray(parsed),
                    length: Array.isArray(parsed) ? parsed.length : 'N/A',
                    preview: JSON.stringify(parsed).substring(0, 200)
                });
            } catch (e) {
                console.log(`   📌 ${key}:`, value?.substring(0, 100));
            }
        });
    } else {
        console.log('   ✅ No modal-related keys in localStorage');
    }
    
    // 3. Check tiktrack_modal-navigation-history specifically
    const directKey = 'tiktrack_modal-navigation-history';
    const directValue = localStorage.getItem(directKey);
    if (directValue) {
        console.log(`\n🎯 Direct localStorage key: ${directKey}`);
        try {
            const parsed = JSON.parse(directValue);
            console.log('   Content:', JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.log('   Raw value:', directValue);
        }
    }
    
    // 4. Clear function
    window.clearModalNavigationCache = async function() {
        console.log('\n🧹 Clearing Modal Navigation Cache...');
        
        // Clear from UnifiedCacheManager
        if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
            await window.UnifiedCacheManager.remove('modal-navigation-history', {
                layer: 'localStorage'
            });
            console.log('   ✅ Cleared from UnifiedCacheManager');
        }
        
        // Clear from localStorage directly
        const keysToRemove = [
            'tiktrack_modal-navigation-history',
            'modal-navigation-history',
            'modal_navigation_history'
        ];
        
        keysToRemove.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log(`   ✅ Removed ${key} from localStorage`);
            }
        });
        
        // Also clear modalHistory in memory
        if (window.modalNavigationManager) {
            window.modalNavigationManager.modalHistory = [];
            console.log('   ✅ Cleared modalHistory in memory');
        }
        
        console.log('\n✅ Modal Navigation Cache cleared!');
        console.log('   💡 Please refresh the page and try again');
    };
    
    console.log('\n💡 Use window.clearModalNavigationCache() to clear the cache');
})();


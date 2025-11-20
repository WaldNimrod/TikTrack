/**
 * Preferences Refresh Controls
 * =============================
 * 
 * כפתורי רענון וניקוי מטמון להעדפות
 * 
 * @version 1.0.0
 * @created 2025-01-27
 */

(function() {
  'use strict';

  /**
   * Clear preferences cache only (without reloading)
   */
  window.clearPreferencesCache = async function() {
    window.Logger?.info?.('🧹 Clearing preferences cache...', { page: 'preferences-refresh-controls' });
    
    try {
      // Clear server-side cache
      const response = await fetch('/api/cache/clear', { method: 'POST' });
      if (!response.ok) {
        throw new Error(`Server cache clear failed: ${response.status}`);
      }
      
      // Clear client-side cache (UnifiedCacheManager)
      if (window.UnifiedCacheManager) {
        // Clear all preference-related cache keys
        const allKeys = Object.keys(localStorage);
        const prefKeys = allKeys.filter(key => 
          key.startsWith('preference_') || 
          key.startsWith('tiktrack_preference_') ||
          key.startsWith('preferences:') ||
          key === 'user-preferences' ||
          key === 'tiktrack_user-preferences'
        );
        
        for (const key of prefKeys) {
          localStorage.removeItem(key);
          if (window.UnifiedCacheManager.remove) {
            await window.UnifiedCacheManager.remove(key, { layer: 'localStorage' });
          }
        }
        
        // Clear PreferencesV4 cache
        if (window.PreferencesV4) {
          if (window.PreferencesV4.groupCache) {
            window.PreferencesV4.groupCache.clear();
          }
          if (window.PreferencesV4.cacheByGroup) {
            window.PreferencesV4.cacheByGroup.clear();
          }
          if (window.PreferencesV4.etagByGroup) {
            window.PreferencesV4.etagByGroup.clear();
          }
        }
        
        // Clear PreferencesCore cache
        if (window.PreferencesCore && window.PreferencesCore.clearCache) {
          await window.PreferencesCore.clearCache();
        }
      }
      
      window.Logger?.info?.('✅ Preferences cache cleared', { page: 'preferences-refresh-controls' });
      
      if (window.showSuccessNotification) {
        window.showSuccessNotification('מטמון העדפות נוקה בהצלחה', '', 3000);
      }
      
      return true;
    } catch (error) {
      window.Logger?.error?.('❌ Failed to clear preferences cache', error, { page: 'preferences-refresh-controls' });
      
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה בניקוי מטמון', error?.message || 'Unknown error', 5000);
      }
      
      return false;
    }
  };

  /**
   * Reload preferences data (without clearing cache first)
   */
  window.reloadPreferencesData = async function() {
    window.Logger?.info?.('📥 Reloading preferences data...', { page: 'preferences-refresh-controls' });
    
    try {
      const userId = window.PreferencesCore?.currentUserId ?? 1;
      const profileId = window.PreferencesCore?.currentProfileId ?? 0;
      
      // Step 1: Reload via PreferencesCore
      if (window.PreferencesCore && typeof window.PreferencesCore.initializeWithLazyLoading === 'function') {
        await window.PreferencesCore.initializeWithLazyLoading(userId, profileId, { force: true });
      }
      
      // Step 2: Reload via PreferencesUIV4 if available
      if (window.PreferencesUIV4 && typeof window.PreferencesUIV4.initialize === 'function') {
        // Reset initialized flag to allow re-initialization
        window.PreferencesUIV4.initialized = false;
        await window.PreferencesUIV4.initialize();
      }
      
      // Step 3: Update summary info
      await window.updatePreferencesSummary();
      
      window.Logger?.info?.('✅ Preferences data reloaded', { page: 'preferences-refresh-controls' });
      
      if (window.showSuccessNotification) {
        window.showSuccessNotification('העדפות נטענו מחדש בהצלחה', '', 3000);
      }
      
      return true;
    } catch (error) {
      window.Logger?.error?.('❌ Failed to reload preferences data', error, { page: 'preferences-refresh-controls' });
      
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה בטעינה מחדש', error?.message || 'Unknown error', 5000);
      }
      
      return false;
    }
  };

  /**
   * Full refresh: Clear cache + Reload + Update UI
   */
  window.refreshPreferencesData = async function() {
    window.Logger?.info?.('🔄 Starting full preferences refresh...', { page: 'preferences-refresh-controls' });
    
    try {
      // Step 1: Clear cache
      window.Logger?.info?.('Step 1/3: Clearing cache...', { page: 'preferences-refresh-controls' });
      const cacheCleared = await window.clearPreferencesCache();
      if (!cacheCleared) {
        window.Logger?.warn?.('Cache clear had issues, continuing anyway...', { page: 'preferences-refresh-controls' });
      }
      
      // Small delay to ensure cache is cleared
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 2: Reload preferences
      window.Logger?.info?.('Step 2/3: Reloading preferences...', { page: 'preferences-refresh-controls' });
      const dataReloaded = await window.reloadPreferencesData();
      if (!dataReloaded) {
        throw new Error('Failed to reload preferences data');
      }
      
      // Small delay to ensure preferences are in window.currentPreferences
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Step 3: Refresh UI (populate forms with new data)
      window.Logger?.info?.('Step 3/3: Refreshing UI...', { page: 'preferences-refresh-controls' });
      
      // Check current state before update
      const beforeState = {
        preferencesCount: Object.keys(window.currentPreferences || {}).length,
        summaryPreferencesCount: document.getElementById('preferencesCount')?.textContent || 'N/A',
        hasPreferencesUIV4: Boolean(window.PreferencesUIV4),
        hasPreferencesUI: Boolean(window.PreferencesUI),
      };
      window.Logger?.info?.('State before UI refresh', { 
        page: 'preferences-refresh-controls',
        ...beforeState 
      });
      
      // Update summary
      await window.updatePreferencesSummary();
      
      // Populate forms if PreferencesUIV4 is available
      // Note: We reset initialized flag to allow re-initialization
      if (window.PreferencesUIV4 && typeof window.PreferencesUIV4.initialize === 'function') {
        window.Logger?.info?.('Using PreferencesUIV4.initialize()', { page: 'preferences-refresh-controls' });
        // Reset initialized flag to allow re-initialization
        window.PreferencesUIV4.initialized = false;
        await window.PreferencesUIV4.initialize();
        
        // CRITICAL: Also explicitly populate form fields after initialization
        // This ensures all fields (especially colors) are populated even if initialize() didn't do it
        if (typeof window.PreferencesUIV4._populateAllFormFields === 'function') {
          window.Logger?.info?.('Explicitly populating all form fields after initialization', { 
            page: 'preferences-refresh-controls' 
          });
          await window.PreferencesUIV4._populateAllFormFields();
        }
      } else if (window.PreferencesUI && typeof window.PreferencesUI.loadAllPreferences === 'function') {
        window.Logger?.info?.('Using PreferencesUI.loadAllPreferences()', { page: 'preferences-refresh-controls' });
        await window.PreferencesUI.loadAllPreferences();
      } else {
        window.Logger?.warn?.('No UI refresh method available', { 
          page: 'preferences-refresh-controls',
          hasPreferencesUIV4: Boolean(window.PreferencesUIV4),
          hasPreferencesUI: Boolean(window.PreferencesUI),
        });
      }
      
      // Wait a bit for UI to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check state after update
      const afterState = {
        preferencesCount: Object.keys(window.currentPreferences || {}).length,
        summaryPreferencesCount: document.getElementById('preferencesCount')?.textContent || 'N/A',
      };
      window.Logger?.info?.('State after UI refresh', { 
        page: 'preferences-refresh-controls',
        ...afterState,
        changed: beforeState.preferencesCount !== afterState.preferencesCount || 
                 beforeState.summaryPreferencesCount !== afterState.summaryPreferencesCount,
      });
      
      window.Logger?.info?.('✅ Full preferences refresh completed', { page: 'preferences-refresh-controls' });
      
      if (window.showSuccessNotification) {
        window.showSuccessNotification('העדפות רועננו בהצלחה', 'מטמון נוקה, נתונים נטענו מחדש והממשק עודכן', 4000);
      }
      
      return true;
    } catch (error) {
      window.Logger?.error?.('❌ Full refresh failed', error, { page: 'preferences-refresh-controls' });
      
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה ברענון העדפות', error?.message || 'Unknown error', 5000);
      }
      
      return false;
    }
  };

  /**
   * Update preferences summary info
   */
  window.updatePreferencesSummary = async function() {
    window.Logger?.info?.('📊 Updating preferences summary...', { page: 'preferences-refresh-controls' });
    
    try {
      // Update preferences count
      const preferencesCount = Object.keys(window.currentPreferences || {}).length;
      const preferencesCountEl = document.getElementById('preferencesCount');
      if (preferencesCountEl) {
        preferencesCountEl.textContent = preferencesCount || '0';
        window.Logger?.info?.('Updated preferences count', { 
          page: 'preferences-refresh-controls',
          count: preferencesCount 
        });
      } else {
        window.Logger?.warn?.('preferencesCount element not found', { page: 'preferences-refresh-controls' });
      }
      
      // Update profiles count
      try {
        if (window.PreferencesData && typeof window.PreferencesData.loadProfiles === 'function') {
          const userId = window.PreferencesCore?.currentUserId ?? 1;
          const profiles = await window.PreferencesData.loadProfiles({ userId, force: true });
          const profilesCount = Array.isArray(profiles) ? profiles.length : (profiles?.data?.length || 0);
          const profilesCountEl = document.getElementById('profilesCount');
          if (profilesCountEl) {
            profilesCountEl.textContent = profilesCount || '0';
            window.Logger?.info?.('Updated profiles count', { 
              page: 'preferences-refresh-controls',
              count: profilesCount 
            });
          }
        } else {
          window.Logger?.warn?.('PreferencesData.loadProfiles not available', { page: 'preferences-refresh-controls' });
          const profilesCountEl = document.getElementById('profilesCount');
          if (profilesCountEl) {
            profilesCountEl.textContent = 'לא זמין';
          }
        }
      } catch (error) {
        window.Logger?.error?.('Error loading profiles count', error, { page: 'preferences-refresh-controls' });
        const profilesCountEl = document.getElementById('profilesCount');
        if (profilesCountEl) {
          profilesCountEl.textContent = 'שגיאה';
        }
      }
      
      // Update groups count
      try {
        if (window.PreferencesData && typeof window.PreferencesData.loadPreferenceGroupsMetadata === 'function') {
          const groupsData = await window.PreferencesData.loadPreferenceGroupsMetadata({ force: true });
          // Handle different response formats
          const groupsCount = groupsData?.count || 
                            groupsData?.data?.count || 
                            (Array.isArray(groupsData?.groups) ? groupsData.groups.length : 0) ||
                            (Array.isArray(groupsData?.data?.groups) ? groupsData.data.groups.length : 0) ||
                            0;
          const groupsCountEl = document.getElementById('groupsCount');
          if (groupsCountEl) {
            groupsCountEl.textContent = groupsCount || '0';
            window.Logger?.info?.('Updated groups count', { 
              page: 'preferences-refresh-controls',
              count: groupsCount,
              groupsDataKeys: groupsData ? Object.keys(groupsData) : []
            });
          }
        } else {
          window.Logger?.warn?.('PreferencesData.loadPreferenceGroupsMetadata not available', { page: 'preferences-refresh-controls' });
          const groupsCountEl = document.getElementById('groupsCount');
          if (groupsCountEl) {
            groupsCountEl.textContent = 'לא זמין';
          }
        }
      } catch (error) {
        window.Logger?.error?.('Error loading groups count', error, { page: 'preferences-refresh-controls' });
        const groupsCountEl = document.getElementById('groupsCount');
        if (groupsCountEl) {
          groupsCountEl.textContent = 'שגיאה';
        }
      }
      
      // User and profile names are updated by PreferencesUIV4._renderUser and _renderProfile
      // But we can verify they exist
      const activeProfileNameEl = document.getElementById('activeProfileName');
      const activeUserNameEl = document.getElementById('activeUserName');
      
      if (activeProfileNameEl && activeProfileNameEl.textContent === 'טוען...') {
        window.Logger?.warn?.('Profile name still loading', { page: 'preferences-refresh-controls' });
      }
      if (activeUserNameEl && activeUserNameEl.textContent === 'טוען...') {
        window.Logger?.warn?.('User name still loading', { page: 'preferences-refresh-controls' });
      }
      
      window.Logger?.info?.('✅ Summary updated', { page: 'preferences-refresh-controls' });
      
    } catch (error) {
      window.Logger?.error?.('❌ Failed to update summary', error, { page: 'preferences-refresh-controls' });
    }
  };

  console.log('✅ Preferences Refresh Controls loaded');
})();


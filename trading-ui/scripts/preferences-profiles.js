/**
 * Preferences Profiles System - TikTrack
 * ======================================
 * 
 * Dedicated system for managing user profiles
 * Simple and clean profile switching logic
 * 
 * @version 1.0.0
 * @date October 29, 2025
 * @author TikTrack Development Team
 * 
 * @description
 * Simple profile management system with:
 * - Profile switching
 * - Cache management via UnifiedCacheManager
 * - UI updates
 * - Error handling
 * 
 * @architecture
 * - ProfileManager: Core profile operations
 * - Simple switchProfile function
 * - Automatic cache clearing
 * - UI synchronization
 */

window.Logger.info('📄 Loading preferences-profiles.js v1.0.0...', { page: "preferences-profiles" });

// ============================================================================
// PROFILE MANAGER CLASS
// ============================================================================

/**
 * Profile Manager
 * Handles user profile operations
 */
class ProfileManager {
    constructor() {
        this.currentUserId = 1; // Default user
        this.currentProfileId = null; // Will be loaded from server
    }
    
    /**
     * Get user profiles
     * @param {number} userId - User ID
     * @returns {Promise<Array>} Profiles array
     */
    async getProfiles(userId = 1) {
        try {
            const response = await fetch(`/api/preferences/profiles?user_id=${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to load profiles');
            }
            
            return result.data.profiles || [];
        } catch (error) {
            window.Logger.error('❌ Error loading profiles:', error, { page: "preferences-profiles" });
            return [];
        }
    }
    
    /**
     * Switch to profile - SIMPLE IMPLEMENTATION
     * @param {number} profileId - Profile ID
     * @param {number} userId - User ID (default: 1)
     * @returns {Promise<boolean>} Success status
     */
    async switchProfile(profileId, userId = 1) {
        try {
            window.Logger.info(`🔄 Switching to profile ID: ${profileId}`, { page: "preferences-profiles" });
            
            // Update current profile ID immediately
            this.currentUserId = userId;
            this.currentProfileId = profileId;
            
            // Step 1: Call API to activate profile
            const response = await fetch('/api/preferences/profiles/activate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    profile_id: profileId
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to activate profile');
            }
            
            window.Logger.info('✅ Profile activated successfully', { page: "preferences-profiles" });
            
            // Step 2: Update PreferencesCore current profile
            if (window.PreferencesCore) {
                await window.PreferencesCore.setCurrentProfile(userId, profileId);
                window.Logger.info('✅ PreferencesCore updated', { page: "preferences-profiles" });
            }
            
            // Step 3: Clear cache via UnifiedCacheManager
            if (window.UnifiedCacheManager) {
                await window.UnifiedCacheManager.refreshUserPreferences();
                window.Logger.info('✅ Cache cleared via UnifiedCacheManager', { page: "preferences-profiles" });
            }
            
            // Step 4: Reload preferences
            if (window.PreferencesUI && typeof window.PreferencesUI.loadAllPreferences === 'function') {
                await window.PreferencesUI.loadAllPreferences(userId, profileId);
                window.Logger.info('✅ Preferences reloaded', { page: "preferences-profiles" });
            }
            
            // Step 5: Update UI
            if (typeof window.loadProfilesToDropdown === 'function') {
                await window.loadProfilesToDropdown(userId);
                window.Logger.info('✅ UI updated', { page: "preferences-profiles" });
            }
            
            window.Logger.info('✅ Profile switch completed successfully', { page: "preferences-profiles" });
            
            // Show success notification
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('פרופיל הוחלף בהצלחה!');
            }
            
            return true;
            
        } catch (error) {
            window.Logger.error('❌ Error switching profile:', error, { page: "preferences-profiles" });
            
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification(`שגיאה בהחלפת פרופיל: ${error.message}`);
            }
            
            return false;
        }
    }
    
    /**
     * Create new profile
     * @param {string} profileName - Profile name
     * @param {string} description - Profile description
     * @param {number} userId - User ID (default: 1)
     * @returns {Promise<number|null>} New profile ID or null
     */
    async createProfile(profileName, description = '', userId = 1) {
        try {
            window.Logger.info(`🔄 Creating profile: ${profileName}`, { page: "preferences-profiles" });
            
            const response = await fetch('/api/preferences/profiles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    profile_name: profileName,
                    description: description || `פרופיל ${profileName}`,
                    is_default: false
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to create profile');
            }
            
            const profileId = result.data?.profile_id || result.data?.id;
            window.Logger.info(`✅ Profile created with ID: ${profileId}`, { page: "preferences-profiles" });
            
            // Reload profiles dropdown
            if (typeof window.loadProfilesToDropdown === 'function') {
                await window.loadProfilesToDropdown();
            }
            
            // Show success notification
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification(`פרופיל "${profileName}" נוצר בהצלחה`);
            }
            
            return profileId;
            
        } catch (error) {
            window.Logger.error('❌ Error creating profile:', error, { page: "preferences-profiles" });
            
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification(`שגיאה ביצירת פרופיל: ${error.message}`);
            }
            
            return null;
        }
    }
    
    /**
     * Delete profile
     * @param {number} profileId - Profile ID
     * @param {number} userId - User ID (default: 1)
     * @returns {Promise<boolean>} Success status
     */
    async deleteProfile(profileId, userId = 1) {
        try {
            window.Logger.info(`🔄 Deleting profile ID: ${profileId}`, { page: "preferences-profiles" });
            
            const response = await fetch(`/api/preferences/profiles/${profileId}?user_id=${userId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to delete profile');
            }
            
            window.Logger.info('✅ Profile deleted successfully', { page: "preferences-profiles" });
            
            // Reload profiles dropdown
            if (typeof window.loadProfilesToDropdown === 'function') {
                await window.loadProfilesToDropdown();
            }
            
            // Show success notification
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('פרופיל נמחק בהצלחה');
            }
            
            return true;
            
        } catch (error) {
            window.Logger.error('❌ Error deleting profile:', error, { page: "preferences-profiles" });
            
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification(`שגיאה במחיקת פרופיל: ${error.message}`);
            }
            
            return false;
        }
    }
}

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================

window.ProfileManager = new ProfileManager();

// ============================================================================
// GLOBAL FUNCTIONS (Backward Compatibility)
// ============================================================================

/**
 * Switch profile (global wrapper)
 * @param {number} profileId - Profile ID
 * @param {number} userId - User ID (default: 1)
 * @returns {Promise<boolean>} Success status
 */
window.switchProfile = async function(profileId, userId = 1) {
    return await window.ProfileManager.switchProfile(profileId, userId);
};

/**
 * Get user profiles (global wrapper)
 * @param {number} userId - User ID (default: 1)
 * @returns {Promise<Array>} Profiles array
 */
window.getUserProfiles = async function(userId = 1) {
    return await window.ProfileManager.getProfiles(userId);
};

/**
 * Create new profile (global wrapper)
 * @param {string} profileName - Profile name
 * @param {string} description - Profile description
 * @param {number} userId - User ID (default: 1)
 * @returns {Promise<number|null>} New profile ID or null
 */
window.createProfile = async function(profileName, description = '', userId = 1) {
    return await window.ProfileManager.createProfile(profileName, description, userId);
};

/**
 * Delete profile (global wrapper)
 * @param {number} profileId - Profile ID
 * @param {number} userId - User ID (default: 1)
 * @returns {Promise<boolean>} Success status
 */
window.deleteProfile = async function(profileId, userId = 1) {
    return await window.ProfileManager.deleteProfile(profileId, userId);
};

// ============================================================================
// INITIALIZATION
// ============================================================================

window.Logger.info('✅ preferences-profiles.js v1.0.0 loaded successfully', { page: "preferences-profiles" });


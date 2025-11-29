/**
 * Preferences UI Layer - UI Management
 * =====================================
 *
 * שכבת UI להעדפות - עדכון UI בלבד
 *
 * תכונות:
 * - עדכון אופטימי של שדות
 * - מילוי קבוצות
 * - ניהול state של שדות
 *
 * @version 1.0.0
 * @lastUpdated January 2025
 */

// ============================================================================
// PREFERENCES UI LAYER CLASS
// ============================================================================

class PreferencesUILayer {
  constructor() {
    this.modifiedFields = new Set(); // Track modified fields
  }

  /**
   * Populate preference group
   * @param {string} sectionId - Section ID
   * @param {Object} preferences - Preferences object
   * @returns {Object} Population stats
   */
  populateGroup(sectionId, preferences) {
    // Use existing PreferencesGroupManager if available
    if (window.PreferencesGroupManager && typeof window.PreferencesGroupManager.populateGroupFields === 'function') {
      return window.PreferencesGroupManager.populateGroupFields(sectionId, preferences);
    }

    // Fallback: simple population
    const section = document.getElementById(sectionId);
    if (!section) {
      window.Logger?.warn?.('Section not found', {
        page: 'preferences-ui-layer',
        sectionId,
      });
      return { populatedCount: 0, unresolvedKeys: [] };
    }

    let populatedCount = 0;
    Object.keys(preferences).forEach(key => {
      const field = section.querySelector(`#${key}, [name="${key}"]`);
      if (field) {
        // Skip if field is modified
        if (this.isFieldModified(field.id || field.name)) {
          return;
        }

        if (field.type === 'checkbox') {
          field.checked = preferences[key] === 'true' || preferences[key] === true;
        } else {
          field.value = preferences[key];
        }
        populatedCount++;
      }
    });

    return { populatedCount, unresolvedKeys: [] };
  }

  /**
   * Update single field
   * @param {string} fieldId - Field ID
   * @param {any} value - Value
   */
  updateField(fieldId, value) {
    const field = document.getElementById(fieldId) || document.querySelector(`[name="${fieldId}"]`);
    if (!field) {
      window.Logger?.warn?.('Field not found', {
        page: 'preferences-ui-layer',
        fieldId,
      });
      return;
    }

    if (field.type === 'checkbox') {
      field.checked = value === 'true' || value === true;
    } else {
      field.value = value;
    }

    window.Logger?.debug?.('Updated field', {
      page: 'preferences-ui-layer',
      fieldId,
      value,
    });
  }

  /**
   * Update multiple fields
   * @param {Object} fields - Fields object { fieldId: value }
   */
  updateFields(fields) {
    Object.keys(fields).forEach(fieldId => {
      this.updateField(fieldId, fields[fieldId]);
    });

    window.Logger?.info?.(`Updated ${Object.keys(fields).length} fields`, {
      page: 'preferences-ui-layer',
    });
  }

  /**
   * Mark field as modified by user
   * @param {string} fieldId - Field ID
   */
  markFieldAsModified(fieldId) {
    this.modifiedFields.add(fieldId);
    const field = document.getElementById(fieldId) || document.querySelector(`[name="${fieldId}"]`);
    if (field) {
      field.dataset.userModified = 'true';
    }
  }

  /**
   * Clear field modification flag
   * @param {string} fieldId - Field ID
   */
  clearFieldModification(fieldId) {
    this.modifiedFields.delete(fieldId);
    const field = document.getElementById(fieldId) || document.querySelector(`[name="${fieldId}"]`);
    if (field) {
      delete field.dataset.userModified;
    }
  }

  /**
   * Check if field is modified
   * @param {string} fieldId - Field ID
   * @returns {boolean} True if modified
   */
  isFieldModified(fieldId) {
    return this.modifiedFields.has(fieldId);
  }
}

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================

// Create layer instance (this is a lightweight layer, the full PreferencesUI will be loaded later)
window.PreferencesUILayer = new PreferencesUILayer();

// Expose layer methods as PreferencesUI placeholder until full PreferencesUI loads
// This allows code to use PreferencesUI methods before preferences-ui.js loads
// The full PreferencesUI class will override this in preferences-ui.js
if (!window.PreferencesUI) {
  window.PreferencesUI = window.PreferencesUILayer;
}

window.Logger?.info?.('✅ PreferencesUI layer loaded', {
  page: 'preferences-ui-layer',
});


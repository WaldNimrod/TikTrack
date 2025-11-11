/**
 * Page State Manager - TikTrack
 * ==============================
 * 
 * מנהל מצב מרכזי לכל עמודי המערכת
 * 
 * תכונות:
 * - שמירה/טעינה של מצב מלא לעמוד: filters, sort, sections, entityFilters
 * - שימוש רק ב-UnifiedCacheManager
 * - מפתחות cache: pageState_${pageName}
 * - API פשוט: savePageState(pageName, state), loadPageState(pageName)
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/UNIFIED_CACHE_SYSTEM.md
 * 
 * Author: TikTrack Development Team
 * Version: 1.0.0
 * Last Updated: 2025-01-27
 */

/**
 * PageStateManager - מנהל מצב מרכזי לעמודים
 * 
 * מנהל את כל מצב העמודים:
 * - filters - מצב פילטרים ראשיים
 * - sort - מצב סידור טבלאות
 * - sections - מצב פתיחה/סגירה של סקשנים
 * - entityFilters - מצב פילטרים פנימיים לפי סוג ישות
 */
class PageStateManager {
  constructor() {
    this.initialized = false;
  }

  /**
   * אתחול מנהל המצב
   */
  async initialize() {
    if (!window.UnifiedCacheManager) {
      if (window.Logger) {
        window.Logger.warn('PageStateManager: UnifiedCacheManager not available', { page: "page-state-manager" });
      }
      return false;
    }

    if (!window.UnifiedCacheManager.initialized) {
      await window.UnifiedCacheManager.initialize();
    }

    this.initialized = true;
    return true;
  }

  /**
   * שמירת מצב מלא של עמוד
   * @param {string} pageName - שם העמוד (למשל: 'trades', 'executions')
   * @param {Object} state - מצב לשמירה
   * @param {Object} state.filters - מצב פילטרים ראשיים (אופציונלי)
   * @param {Object} state.sort - מצב סידור (אופציונלי)
   * @param {Object} state.sections - מצב סקשנים { [sectionId]: isHidden } (אופציונלי)
   * @param {Object} state.entityFilters - מצב פילטרים פנימיים { [entityType]: selectedValue } (אופציונלי)
   * @returns {Promise<boolean>} הצלחת השמירה
   */
  async savePageState(pageName, state) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!window.UnifiedCacheManager) {
      if (window.Logger) {
        window.Logger.warn(`PageStateManager.savePageState: UnifiedCacheManager not available for "${pageName}"`, { page: "page-state-manager" });
      }
      return false;
    }

    if (!pageName || typeof pageName !== 'string') {
      if (window.Logger) {
        window.Logger.error('PageStateManager.savePageState: pageName must be a non-empty string', { page: "page-state-manager" });
      }
      return false;
    }

    if (!state || typeof state !== 'object') {
      if (window.Logger) {
        window.Logger.error('PageStateManager.savePageState: state must be an object', { page: "page-state-manager" });
      }
      return false;
    }

    try {
      const cacheKey = `pageState_${pageName}`;
      const fullState = {
        filters: state.filters || null,
        sort: state.sort || null,
        sections: state.sections || {},
        entityFilters: state.entityFilters || {},
        timestamp: Date.now()
      };

      await window.UnifiedCacheManager.save(cacheKey, fullState, {
        layer: 'localStorage',
        ttl: null, // persistent
        syncToBackend: false
      });

      if (window.Logger) {
        window.Logger.debug(`PageStateManager.savePageState: Saved state for "${pageName}"`, { page: "page-state-manager" });
      }

      return true;
    } catch (err) {
      if (window.Logger) {
        window.Logger.error(`PageStateManager.savePageState: Failed to save state for "${pageName}"`, err, { page: "page-state-manager" });
      }
      return false;
    }
  }

  /**
   * טעינת מצב מלא של עמוד
   * @param {string} pageName - שם העמוד
   * @returns {Promise<Object|null>} מצב או null אם לא נמצא
   */
  async loadPageState(pageName) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!window.UnifiedCacheManager) {
      if (window.Logger) {
        window.Logger.warn(`PageStateManager.loadPageState: UnifiedCacheManager not available for "${pageName}"`, { page: "page-state-manager" });
      }
      return null;
    }

    if (!pageName || typeof pageName !== 'string') {
      if (window.Logger) {
        window.Logger.error('PageStateManager.loadPageState: pageName must be a non-empty string', { page: "page-state-manager" });
      }
      return null;
    }

    try {
      const cacheKey = `pageState_${pageName}`;
      const state = await window.UnifiedCacheManager.get(cacheKey, {
        layer: 'localStorage'
      });

      if (state && typeof state === 'object') {
        if (window.Logger) {
          window.Logger.debug(`PageStateManager.loadPageState: Loaded state for "${pageName}"`, { page: "page-state-manager" });
        }
        return state;
      }

      return null;
    } catch (err) {
      if (window.Logger) {
        window.Logger.error(`PageStateManager.loadPageState: Failed to load state for "${pageName}"`, err, { page: "page-state-manager" });
      }
      return null;
    }
  }

  /**
   * שמירת מצב פילטרים בלבד
   * @param {string} pageName - שם העמוד
   * @param {Object} filters - מצב פילטרים
   * @returns {Promise<boolean>} הצלחת השמירה
   */
  async saveFilters(pageName, filters) {
    const currentState = await this.loadPageState(pageName) || {};
    return await this.savePageState(pageName, {
      ...currentState,
      filters: filters
    });
  }

  /**
   * שמירת מצב סידור בלבד
   * @param {string} pageName - שם העמוד
   * @param {Object} sort - מצב סידור { columnIndex, direction }
   * @returns {Promise<boolean>} הצלחת השמירה
   */
  async saveSort(pageName, sort) {
    const currentState = await this.loadPageState(pageName) || {};
    return await this.savePageState(pageName, {
      ...currentState,
      sort: sort
    });
  }

  /**
   * שמירת מצב סקשנים בלבד
   * @param {string} pageName - שם העמוד
   * @param {Object} sections - מצב סקשנים { [sectionId]: isHidden }
   * @returns {Promise<boolean>} הצלחת השמירה
   */
  async saveSections(pageName, sections) {
    const currentState = await this.loadPageState(pageName) || {};
    return await this.savePageState(pageName, {
      ...currentState,
      sections: sections
    });
  }

  /**
   * שמירת מצב פילטרים פנימיים בלבד
   * @param {string} pageName - שם העמוד
   * @param {Object} entityFilters - מצב פילטרים פנימיים { [entityType]: selectedValue }
   * @returns {Promise<boolean>} הצלחת השמירה
   */
  async saveEntityFilters(pageName, entityFilters) {
    const currentState = await this.loadPageState(pageName) || {};
    return await this.savePageState(pageName, {
      ...currentState,
      entityFilters: entityFilters
    });
  }

  /**
   * טעינת מצב פילטרים בלבד
   * @param {string} pageName - שם העמוד
   * @returns {Promise<Object|null>} מצב פילטרים או null אם לא נמצא
   */
  async loadFilters(pageName) {
    const pageState = await this.loadPageState(pageName);
    return pageState && pageState.filters ? pageState.filters : null;
  }

  /**
   * טעינת מצב סידור בלבד
   * @param {string} pageName - שם העמוד
   * @returns {Promise<Object|null>} מצב סידור או null אם לא נמצא
   */
  async loadSort(pageName) {
    const pageState = await this.loadPageState(pageName);
    return pageState && pageState.sort ? pageState.sort : null;
  }

  /**
   * טעינת מצב סקשנים בלבד
   * @param {string} pageName - שם העמוד
   * @returns {Promise<Object>} מצב סקשנים (אובייקט ריק אם לא נמצא)
   */
  async loadSections(pageName) {
    const pageState = await this.loadPageState(pageName);
    return pageState && pageState.sections ? pageState.sections : {};
  }

  /**
   * טעינת מצב פילטרים פנימיים בלבד
   * @param {string} pageName - שם העמוד
   * @returns {Promise<Object>} מצב פילטרים פנימיים (אובייקט ריק אם לא נמצא)
   */
  async loadEntityFilters(pageName) {
    const pageState = await this.loadPageState(pageName);
    return pageState && pageState.entityFilters ? pageState.entityFilters : {};
  }

  /**
   * מיגרציה של נתונים קיימים מ-localStorage לפורמט PageStateManager
   * @param {string} pageName - שם העמוד
   * @returns {Promise<boolean>} הצלחת המיגרציה
   */
  async migrateLegacyData(pageName) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!window.UnifiedCacheManager) {
      return false;
    }

    try {
      // בדיקה אם כבר יש מצב חדש - אם כן, אין צורך במיגרציה
      const existingState = await this.loadPageState(pageName);
      if (existingState && existingState.timestamp) {
        return false; // כבר יש מצב חדש
      }

      const migratedState = {
        filters: null,
        sort: null,
        sections: {},
        entityFilters: {},
        timestamp: Date.now()
      };

      // מיגרציה של פילטרים ראשיים
      try {
        const headerFilters = localStorage.getItem('headerFilters');
        if (headerFilters) {
          const parsedFilters = JSON.parse(headerFilters);
          migratedState.filters = parsedFilters;
        }
      } catch (e) {
        if (window.Logger) {
          window.Logger.warn(`PageStateManager.migrateLegacyData: Failed to migrate headerFilters for "${pageName}"`, e, { page: "page-state-manager" });
        }
      }

      // מיגרציה של מצב סידור
      try {
        const sortStateKey = `sortState_${pageName}`;
        const sortState = localStorage.getItem(sortStateKey);
        if (sortState) {
          const parsedSort = JSON.parse(sortState);
          if (parsedSort.columnIndex !== undefined && parsedSort.direction) {
            migratedState.sort = {
              columnIndex: parsedSort.columnIndex,
              direction: parsedSort.direction
            };
          }
        }
      } catch (e) {
        if (window.Logger) {
          window.Logger.warn(`PageStateManager.migrateLegacyData: Failed to migrate sort state for "${pageName}"`, e, { page: "page-state-manager" });
        }
      }

      // מיגרציה של מצב סקשנים
      try {
        const sections = document.querySelectorAll('.content-section, .top-section');
        sections.forEach((section, index) => {
          const sectionId = section.getAttribute('data-section') || section.id || `section-${index}`;
          const storageKey = `${pageName}_${sectionId}_SectionHidden`;
          const isCollapsed = localStorage.getItem(storageKey) === 'true';
          if (isCollapsed) {
            migratedState.sections[sectionId] = true;
          }
        });
      } catch (e) {
        if (window.Logger) {
          window.Logger.warn(`PageStateManager.migrateLegacyData: Failed to migrate sections for "${pageName}"`, e, { page: "page-state-manager" });
        }
      }

      // מיגרציה של פילטרים פנימיים
      try {
        // חיפוש מפתחות entityFilter ב-localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`entityFilter_${pageName}_`)) {
            const entityType = key.replace(`entityFilter_${pageName}_`, '');
            const selectedValue = localStorage.getItem(key);
            if (selectedValue) {
              migratedState.entityFilters[entityType] = selectedValue;
            }
          }
        }
      } catch (e) {
        if (window.Logger) {
          window.Logger.warn(`PageStateManager.migrateLegacyData: Failed to migrate entity filters for "${pageName}"`, e, { page: "page-state-manager" });
        }
      }

      // שמירת המצב המיגרציה רק אם יש נתונים למיגרציה
      if (migratedState.filters || migratedState.sort || 
          Object.keys(migratedState.sections).length > 0 || 
          Object.keys(migratedState.entityFilters).length > 0) {
        await this.savePageState(pageName, migratedState);
        if (window.Logger) {
          window.Logger.info(`PageStateManager.migrateLegacyData: Migrated legacy data for "${pageName}"`, { page: "page-state-manager" });
        }
        return true;
      }

      return false;
    } catch (err) {
      if (window.Logger) {
        window.Logger.error(`PageStateManager.migrateLegacyData: Failed to migrate data for "${pageName}"`, err, { page: "page-state-manager" });
      }
      return false;
    }
  }

  /**
   * מחיקת מצב עמוד
   * @param {string} pageName - שם העמוד
   * @returns {Promise<boolean>} הצלחת המחיקה
   */
  async clearPageState(pageName) {
    if (!window.UnifiedCacheManager) {
      return false;
    }

    try {
      const cacheKey = `pageState_${pageName}`;
      await window.UnifiedCacheManager.remove(cacheKey, {
        layer: 'localStorage'
      });
      return true;
    } catch (err) {
      if (window.Logger) {
        window.Logger.error(`PageStateManager.clearPageState: Failed to clear state for "${pageName}"`, err, { page: "page-state-manager" });
      }
      return false;
    }
  }
}

// יצירת instance גלובלי
window.PageStateManager = new PageStateManager();

// אתחול אוטומטי
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.PageStateManager.initialize();
  });
} else {
  window.PageStateManager.initialize();
}


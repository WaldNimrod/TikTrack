/**
 * Table Data Registry - Unified table data tracking system
 * ========================================================
 *
 * This module maintains canonical references for table datasets (full, filtered, page-level)
 * so that pagination, summary statistics and auxiliary systems always work with the same source
 * of truth regardless of UI-level pagination.
 *
 * Related documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/TABLE_SYSTEM_ANALYSIS.md
 * - documentation/02-ARCHITECTURE/FRONTEND/PAGINATION_SYSTEM.md
 *
 * Author: TikTrack Development Team
 * Version: 1.0.0
 * Last Updated: 2025-11-10
 */

(function registerTableDataRegistry() {
  if (window.TableDataRegistry) {
    // Registry already loaded
    return;
  }

  class TableDataRegistry {
    constructor() {
      this._tables = new Map();
      this._tableIdMap = new Map();
      this._filteredListeners = new Map(); // tableType -> Set<callback>
    }

    /**
     * Ensure entry exists for table type
     * @param {string} tableType
     * @returns {Object|null}
     * @private
     */
    _ensureEntry(tableType) {
      if (!tableType) {
        return null;
      }

      if (!this._tables.has(tableType)) {
        this._tables.set(tableType, {
          fullData: [],
          filteredData: [],
          pageData: [],
          meta: {
            tableType,
            tableId: null,
            source: null,
            registeredAt: Date.now(),
            updatedAt: null,
            filteredUpdatedAt: null,
            pageUpdatedAt: null,
            pageInfo: {},
            activeFilters: null,
          },
        });
      }

      return this._tables.get(tableType);
    }

    /**
     * Attempt to infer table type from DOM by table id
     * @param {string} tableId
     * @returns {string|null}
     * @private
     */
    _inferTableTypeFromDom(tableId) {
      if (!tableId || typeof document === 'undefined') {
        return null;
      }

      try {
        const tableElement = document.getElementById(tableId);
        if (!tableElement) {
          return null;
        }

        const dataTableType = tableElement.getAttribute('data-table-type');
        if (dataTableType) {
          return dataTableType;
        }

        const container = tableElement.closest('[data-table-type]');
        if (container) {
          return container.getAttribute('data-table-type');
        }
      } catch (error) {
        if (window.Logger?.warn) {
          window.Logger.warn('TableDataRegistry: failed to infer table type from DOM', { tableId, error });
        }
      }

      return null;
    }

    /**
     * Resolve table type from either tableType or tableId
     * @param {string} identifier - tableType or tableId
     * @returns {string|null}
     */
    resolveTableType(identifier) {
      if (!identifier) {
        return null;
      }

      if (this._tables.has(identifier)) {
        return identifier;
      }

      if (this._tableIdMap.has(identifier)) {
        return this._tableIdMap.get(identifier);
      }

      const inferred = this._inferTableTypeFromDom(identifier);
      if (inferred) {
        this._tableIdMap.set(identifier, inferred);
        this._ensureEntry(inferred);
        const entry = this._tables.get(inferred);
        if (entry && !entry.meta.tableId) {
          entry.meta.tableId = identifier;
        }
        return inferred;
      }

      return null;
    }

    /**
     * Register table metadata
     * @param {Object} options
     * @param {string} options.tableType
     * @param {string} options.tableId
     * @param {string} [options.source]
     * @returns {{tableType: string, tableId: string}|null}
     */
    registerTable({ tableType, tableId, source } = {}) {
      const resolvedType = tableType || this.resolveTableType(tableId);
      if (!resolvedType) {
        return null;
      }

      const entry = this._ensureEntry(resolvedType);
      if (!entry) {
        return null;
      }

      if (tableId) {
        entry.meta.tableId = tableId;
        this._tableIdMap.set(tableId, resolvedType);
      }

      if (source) {
        entry.meta.source = source;
      }

      return {
        tableType: resolvedType,
        tableId: entry.meta.tableId || tableId || null,
      };
    }

    /**
     * Store full dataset for table
     * @param {string} identifier - tableType or tableId
     * @param {Array} data
     * @param {Object} [options]
     * @param {boolean} [options.resetFiltered=true]
     * @param {string} [options.tableId]
     * @returns {Array}
     */
    setFullData(identifier, data = [], options = {}) {
      const tableType = this.resolveTableType(identifier) || identifier;
      const entry = this._ensureEntry(tableType);
      if (!entry) {
        return [];
      }

      if (options.tableId) {
        this.registerTable({ tableType, tableId: options.tableId });
      }

      entry.fullData = Array.isArray(data) ? [...data] : [];
      entry.meta.updatedAt = Date.now();

      if (options.resetFiltered !== false) {
        this.setFilteredData(tableType, entry.fullData, {
          tableId: entry.meta.tableId,
          skipPageReset: true,
        });
      }

      return entry.fullData;
    }

    /**
     * Store filtered dataset for table
     * @param {string} identifier - tableType or tableId
     * @param {Array} data
     * @param {Object} [options]
     * @param {boolean} [options.skipPageReset=false]
     * @param {string} [options.tableId]
     * @returns {Array}
     */
    setFilteredData(identifier, data = [], options = {}) {
      const tableType = this.resolveTableType(identifier) || identifier;
      const entry = this._ensureEntry(tableType);
      if (!entry) {
        return [];
      }

      if (options.tableId) {
        this.registerTable({ tableType, tableId: options.tableId });
      }

      entry.filteredData = Array.isArray(data) ? [...data] : [];
      entry.meta.filteredUpdatedAt = Date.now();
      if (options.filterContext) {
        entry.meta.activeFilters = this._cloneFilterContext(options.filterContext);
      } else if (options.clearFilters) {
        entry.meta.activeFilters = null;
      }

      if (!options.skipPageReset) {
        this.setPageData(tableType, [], { tableId: entry.meta.tableId, skipCounts: true });
      }

      this._notifyFilteredChange(tableType, {
        tableType,
        data: entry.filteredData,
        filters: entry.meta.activeFilters,
        tableId: entry.meta.tableId || options.tableId || null,
      });

      return entry.filteredData;
    }

    /**
     * Store page dataset for table
     * @param {string} identifier - tableType or tableId
     * @param {Array} data
     * @param {Object} [options]
     * @param {Object} [options.pageInfo]
     * @param {boolean} [options.skipCounts=false]
     * @param {string} [options.tableId]
     * @returns {Array}
     */
    setPageData(identifier, data = [], options = {}) {
      const tableType = this.resolveTableType(identifier) || identifier;
      const entry = this._ensureEntry(tableType);
      if (!entry) {
        return [];
      }

      if (options.tableId) {
        this.registerTable({ tableType, tableId: options.tableId });
      }

      entry.pageData = Array.isArray(data) ? [...data] : [];
      entry.meta.pageUpdatedAt = Date.now();

      if (options.pageInfo && typeof options.pageInfo === 'object') {
        entry.meta.pageInfo = {
          ...(entry.meta.pageInfo || {}),
          ...options.pageInfo,
        };
      }

      if (!options.skipCounts) {
        entry.meta.pageInfo = entry.meta.pageInfo || {};
        entry.meta.pageInfo.currentPageSize = entry.pageData.length;
      }

      return entry.pageData;
    }

    /**
     * Get datasets
     * @param {string} identifier
     * @param {Object} [options]
     * @param {boolean} [options.asReference=false]
     * @returns {Array}
     */
    getFullData(identifier, options = {}) {
      const tableType = this.resolveTableType(identifier) || identifier;
      const entry = this._tables.get(tableType);
      if (!entry) {
        return [];
      }
      return options.asReference ? entry.fullData : [...entry.fullData];
    }

    getFilteredData(identifier, options = {}) {
      const tableType = this.resolveTableType(identifier) || identifier;
      const entry = this._tables.get(tableType);
      if (!entry) {
        return [];
      }
      const data = entry.filteredData.length > 0 ? entry.filteredData : entry.fullData;
      return options.asReference ? data : [...data];
    }

    /**
     * Get active filter context for a table (if available)
     * @param {string} identifier - tableType or tableId
     * @param {Object} [options]
     * @param {boolean} [options.asReference=false] - Return internal reference instead of clone
     * @returns {Object|null}
     */
    getActiveFilters(identifier, options = {}) {
      const tableType = this.resolveTableType(identifier) || identifier;
      const entry = this._tables.get(tableType);
      if (!entry || !entry.meta || !entry.meta.activeFilters) {
        return null;
      }
      if (options.asReference) {
        return entry.meta.activeFilters;
      }
      return this._cloneFilterContext(entry.meta.activeFilters);
    }

    getPageData(identifier, options = {}) {
      const tableType = this.resolveTableType(identifier) || identifier;
      const entry = this._tables.get(tableType);
      if (!entry) {
        return [];
      }
      return options.asReference ? entry.pageData : [...entry.pageData];
    }

    /**
     * Get basic counts
     * @param {string} identifier
     * @returns {{total: number, filtered: number, page: number}}
     */
    getCounts(identifier) {
      const tableType = this.resolveTableType(identifier) || identifier;
      const entry = this._tables.get(tableType);
      if (!entry) {
        return { total: 0, filtered: 0, page: 0 };
      }
      return {
        total: entry.fullData.length,
        filtered: entry.filteredData.length || entry.fullData.length,
        page: entry.pageData.length,
      };
    }

    /**
     * Get summary metadata for table
     * @param {string} identifier
     * @returns {Object|null}
     */
    getSummary(identifier) {
      const tableType = this.resolveTableType(identifier) || identifier;
      const entry = this._tables.get(tableType);
      if (!entry) {
        return null;
      }

      const counts = this.getCounts(tableType);

      return {
        tableType,
        tableId: entry.meta.tableId,
        source: entry.meta.source,
        registeredAt: entry.meta.registeredAt,
        updatedAt: entry.meta.updatedAt,
        filteredUpdatedAt: entry.meta.filteredUpdatedAt,
        pageUpdatedAt: entry.meta.pageUpdatedAt,
        counts,
        pageInfo: entry.meta.pageInfo || {},
      };
    }

    /**
     * Get registered tables list
     * @returns {Array<Object>}
     */
    getAllSummaries() {
      return Array.from(this._tables.keys()).map((tableType) => this.getSummary(tableType));
    }

    /**
     * Clear table data
     * @param {string} identifier
     * @returns {void}
     */
    clear(identifier) {
      const tableType = this.resolveTableType(identifier) || identifier;
      if (!tableType) {
        return;
      }

      const entry = this._tables.get(tableType);
      if (entry?.meta?.tableId) {
        this._tableIdMap.delete(entry.meta.tableId);
      }

      this._tables.delete(tableType);
      this._filteredListeners.delete(tableType);
    }

    /**
     * Reset registry
     */
    clearAll() {
      this._tables.clear();
      this._tableIdMap.clear();
      this._filteredListeners.clear();
    }

    /**
     * Subscribe to filtered data changes
     * @param {string} identifier - tableType or tableId
     * @param {Function} callback
     * @returns {Function} unsubscribe function
     */
    onFilteredDataChange(identifier, callback) {
      if (typeof callback !== 'function') {
        return () => {};
      }
      const tableType = this.resolveTableType(identifier) || identifier;
      if (!tableType) {
        return () => {};
      }
      const listeners = this._filteredListeners.get(tableType) || new Set();
      listeners.add(callback);
      this._filteredListeners.set(tableType, listeners);
      return () => this.offFilteredDataChange(tableType, callback);
    }

    /**
     * Unsubscribe from filtered data changes
     * @param {string} identifier - tableType or tableId
     * @param {Function} callback
     */
    offFilteredDataChange(identifier, callback) {
      const tableType = this.resolveTableType(identifier) || identifier;
      if (!tableType || !callback) {
        return;
      }
      const listeners = this._filteredListeners.get(tableType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this._filteredListeners.delete(tableType);
        }
      }
    }

    /**
     * Notify listeners about filtered data changes
     * @param {string} tableType
     * @param {Object} payload
     * @private
     */
    _notifyFilteredChange(tableType, payload) {
      if (!tableType) {
        return;
      }
      const listeners = this._filteredListeners.get(tableType);
      if (listeners && listeners.size > 0) {
        listeners.forEach((listener) => {
          try {
            listener(payload);
          } catch (error) {
            if (window.Logger?.warn) {
              window.Logger.warn('TableDataRegistry listener failed', { tableType, error });
            } else {
              console.warn('TableDataRegistry listener failed', tableType, error);
            }
          }
        });
      }
      const wildcardListeners = this._filteredListeners.get('*');
      if (wildcardListeners && wildcardListeners.size > 0) {
        wildcardListeners.forEach((listener) => {
          try {
            listener({ tableType, ...payload });
          } catch (error) {
            if (window.Logger?.warn) {
              window.Logger.warn('TableDataRegistry wildcard listener failed', { tableType, error });
            } else {
              console.warn('TableDataRegistry wildcard listener failed', tableType, error);
            }
          }
        });
      }
    }

    /**
     * Clone filter context into plain serializable structure
     * @param {Object} context
     * @returns {Object|null}
     * @private
     */
    _cloneFilterContext(context) {
      if (!context || typeof context !== 'object') {
        return null;
      }
      const cloneArray = (value) => {
        if (!Array.isArray(value)) {
          return [];
        }
        return value.map((item) => (typeof item === 'object' ? String(item) : item)).filter((item) => item !== undefined && item !== null);
      };
      return {
        status: cloneArray(context.status || context.statuses),
        type: cloneArray(context.type || context.types),
        account: cloneArray(context.account || context.accounts),
        search: typeof context.search === 'string' ? context.search : '',
        dateRange: context.dateRange ? { ...context.dateRange } : null,
        custom: context.custom ? { ...context.custom } : {},
      };
    }
  }

  const registryInstance = new TableDataRegistry();

  window.TableDataRegistry = registryInstance;
  window.tableDataRegistry = registryInstance;

  if (window.Logger?.info) {
    window.Logger.info('✅ TableDataRegistry loaded', { page: 'table-data-registry' });
  } else {
    console.log('✅ TableDataRegistry loaded');
  }
})();



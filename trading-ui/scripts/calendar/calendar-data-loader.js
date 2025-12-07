/**
 * Calendar Data Loader - TikTrack Calendar Data Loading
 * =====================================================
 * 
 * Loads and aggregates calendar data from multiple Data Services.
 * Integrates with CacheTTLGuard for automatic caching.
 * 
 * Documentation: See documentation/frontend/TRADING_JOURNAL_PAGE_AUDIT_PLAN.md
 * 
 * @version 1.0.0
 * @created November 2025
 * @author TikTrack Development Team
 */

(function() {
    'use strict';

    const CALENDAR_DATA_KEY = 'calendar-journal-data';
    const CALENDAR_TTL = 60 * 1000; // 60 seconds
    const PAGE_LOG_CONTEXT = { page: 'calendar-data-loader' };

    /**
     * Calendar Data Loader Class
     */
    class CalendarDataLoader {
        /**
         * Load all journal data for a specific month
         * Uses TradingJournalData.loadCalendarData() for unified data loading
         * @param {number} year - Year
         * @param {number} month - Month (0-11)
         * @param {Object} options - Options (force, entityFilter)
         * @returns {Promise<Object>} Aggregated data by day (day number as key)
         */
        static async loadMonthData(year, month, options = {}) {
            const { force = false, entityFilter = 'all' } = options;
            
            if (window.Logger) {
                window.Logger.info('Loading calendar month data', {
                    ...PAGE_LOG_CONTEXT,
                    year,
                    month,
                    entityFilter
                });
            }

            // Wait for TradingJournalData to be available
            let retries = 0;
            while (!window.TradingJournalData && retries < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                retries++;
            }

            if (!window.TradingJournalData) {
                if (window.Logger) {
                    window.Logger.warn('TradingJournalData not available, falling back to individual services', PAGE_LOG_CONTEXT);
                }
                return await this._loadMonthDataFallback(year, month, options);
            }

            try {
                // Use TradingJournalData.loadCalendarData() - note: month is 1-based in API (1-12)
                const calendarData = await window.TradingJournalData.loadCalendarData(
                    month + 1, // Convert 0-based to 1-based
                    year,
                    {
                        entity_type: entityFilter === 'all' ? undefined : entityFilter,
                        force
                    }
                );

                // Convert API format (entries_by_day with YYYY-MM-DD keys) to CalendarRenderer format (day number keys)
                const aggregated = this._convertCalendarDataFormat(calendarData, year, month);

                if (window.Logger) {
                    const totalEntries = Object.values(aggregated).reduce((sum, dayData) => {
                        return sum + (dayData.executions?.length || 0) +
                               (dayData.trades?.length || 0) +
                               (dayData.notes?.length || 0) +
                               (dayData.alerts?.length || 0) +
                               (dayData.cashFlows?.length || 0) +
                               (dayData.tradePlans?.length || 0);
                    }, 0);
                    
                    window.Logger.info('Calendar month data loaded from API', {
                        ...PAGE_LOG_CONTEXT,
                        year,
                        month,
                        totalDays: Object.keys(aggregated).length,
                        totalEntries
                    });
                }

                return aggregated;
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('Failed to load calendar data from TradingJournalData, falling back', {
                        ...PAGE_LOG_CONTEXT,
                        error: error?.message
                    });
                }
                // Fallback to individual services if API fails
                return await this._loadMonthDataFallback(year, month, options);
            }
        }

        /**
         * Convert calendar data from API format to CalendarRenderer format
         * API format: { entries_by_day: { 'YYYY-MM-DD': [entries...] } }
         * Renderer format: { dayNumber: { executions: [], trades: [], notes: [], alerts: [], cashFlows: [], tradePlans: [] } }
         * @private
         */
        static _convertCalendarDataFormat(calendarData, year, month) {
            const aggregated = {};
            const entriesByDay = calendarData?.entries_by_day || {};

            // Iterate through each day in entries_by_day
            Object.entries(entriesByDay).forEach(([dateKey, entries]) => {
                // Parse date from YYYY-MM-DD format
                const date = new Date(dateKey);
                if (isNaN(date.getTime())) return;

                // Check if date is in the target month
                if (date.getFullYear() !== year || date.getMonth() !== month) return;

                const day = date.getDate();

                // Initialize day data structure
                if (!aggregated[day]) {
                    aggregated[day] = {
                        executions: [],
                        trades: [],
                        notes: [],
                        alerts: [],
                        cashFlows: [],
                        tradePlans: []
                    };
                }

                // Group entries by entity type
                entries.forEach(entry => {
                    const entityType = entry.entity_type;
                    switch (entityType) {
                        case 'execution':
                            aggregated[day].executions.push(entry);
                            break;
                        case 'trade':
                            aggregated[day].trades.push(entry);
                            break;
                        case 'note':
                            aggregated[day].notes.push(entry);
                            break;
                        case 'alert':
                            aggregated[day].alerts.push(entry);
                            break;
                        case 'cash_flow':
                            aggregated[day].cashFlows.push(entry);
                            break;
                        case 'trade_plan':
                            aggregated[day].tradePlans.push(entry);
                            break;
                    }
                });
            });

            return aggregated;
        }

        /**
         * Fallback method: Load data from individual services (used if TradingJournalData is not available)
         * @private
         */
        static async _loadMonthDataFallback(year, month, options = {}) {
            const { force = false, entityFilter = 'all' } = options;
            
            // Get date range for month
            const { start, end } = window.CalendarDateUtils?.getMonthDateRange(year, month) || 
                                  this._getMonthDateRange(year, month);

            // Load data from all services directly
            const [executions, trades, notes, alerts, cashFlows, tradePlans] = await Promise.all([
                this._loadExecutions(start, end, entityFilter, force),
                this._loadTrades(start, end, entityFilter, force),
                this._loadNotes(start, end, entityFilter, force),
                this._loadAlerts(start, end, entityFilter, force),
                this._loadCashFlows(start, end, entityFilter, force),
                this._loadTradePlans(start, end, entityFilter, force)
            ]);

            // Aggregate by day
            const aggregated = this._aggregateByDay(executions, trades, notes, alerts, cashFlows, tradePlans, year, month);

            if (window.Logger) {
                window.Logger.info('Calendar month data loaded from individual services', {
                    ...PAGE_LOG_CONTEXT,
                    year,
                    month,
                    totalDays: Object.keys(aggregated).length,
                    executions: executions.length,
                    trades: trades.length,
                    notes: notes.length,
                    alerts: alerts.length,
                    cashFlows: cashFlows.length,
                    tradePlans: tradePlans.length
                });
            }

            return aggregated;
        }

        /**
         * Load executions for date range
         * @private
         */
        static async _loadExecutions(start, end, entityFilter, force) {
            if (entityFilter !== 'all' && entityFilter !== 'execution') {
                return [];
            }

            try {
                if (window.ExecutionsData?.loadExecutionsData) {
                    const allExecutions = await window.ExecutionsData.loadExecutionsData({ force });
                    // Normalize data - ExecutionsData returns array directly
                    const executionsArray = Array.isArray(allExecutions) ? allExecutions : (Array.isArray(allExecutions?.data) ? allExecutions.data : []);
                    return this._filterByDateRange(executionsArray, start, end, 'execution_date', 'date');
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('Failed to load executions for calendar', {
                        ...PAGE_LOG_CONTEXT,
                        error: error?.message
                    });
                }
            }
            return [];
        }

        /**
         * Load trades for date range
         * @private
         */
        static async _loadTrades(start, end, entityFilter, force) {
            if (entityFilter !== 'all' && entityFilter !== 'trade') {
                return [];
            }

            try {
                if (window.TradesData?.loadTradesData) {
                    const allTrades = await window.TradesData.loadTradesData({ force });
                    // Normalize data - TradesData returns array directly
                    const tradesArray = Array.isArray(allTrades) ? allTrades : (Array.isArray(allTrades?.data) ? allTrades.data : []);
                    return this._filterByDateRange(tradesArray, start, end, 'opened_at', 'created_at');
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('Failed to load trades for calendar', {
                        ...PAGE_LOG_CONTEXT,
                        error: error?.message
                    });
                }
            }
            return [];
        }

        /**
         * Load notes for date range
         * @private
         */
        static async _loadNotes(start, end, entityFilter, force) {
            if (entityFilter !== 'all' && entityFilter !== 'note') {
                return [];
            }

            try {
                if (window.NotesData?.loadNotesData) {
                    const allNotes = await window.NotesData.loadNotesData({ force });
                    // Normalize data - NotesData returns array directly
                    const notesArray = Array.isArray(allNotes) ? allNotes : (Array.isArray(allNotes?.data) ? allNotes.data : []);
                    return this._filterByDateRange(notesArray, start, end, 'created_at', 'date');
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('Failed to load notes for calendar', {
                        ...PAGE_LOG_CONTEXT,
                        error: error?.message
                    });
                }
            }
            return [];
        }

        /**
         * Load alerts for date range
         * @private
         */
        static async _loadAlerts(start, end, entityFilter, force) {
            if (entityFilter !== 'all' && entityFilter !== 'alert') {
                return [];
            }

            try {
                if (window.AlertsData?.loadAlertsData) {
                    const allAlerts = await window.AlertsData.loadAlertsData({ force });
                    // Normalize data - AlertsData returns array directly
                    const alertsArray = Array.isArray(allAlerts) ? allAlerts : (Array.isArray(allAlerts?.data) ? allAlerts.data : []);
                    return this._filterByDateRange(alertsArray, start, end, 'triggered_at', 'created_at', 'expiry_date');
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('Failed to load alerts for calendar', {
                        ...PAGE_LOG_CONTEXT,
                        error: error?.message
                    });
                }
            }
            return [];
        }

        /**
         * Load cash flows for date range
         * @private
         */
        static async _loadCashFlows(start, end, entityFilter, force) {
            if (entityFilter !== 'all' && entityFilter !== 'cash_flow') {
                return [];
            }

            try {
                if (window.CashFlowsData?.loadCashFlowsData) {
                    const allCashFlows = await window.CashFlowsData.loadCashFlowsData({ force });
                    // Normalize data - CashFlowsData returns array directly
                    const cashFlowsArray = Array.isArray(allCashFlows) ? allCashFlows : (Array.isArray(allCashFlows?.data) ? allCashFlows.data : []);
                    return this._filterByDateRange(cashFlowsArray, start, end, 'date');
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('Failed to load cash flows for calendar', {
                        ...PAGE_LOG_CONTEXT,
                        error: error?.message
                    });
                }
            }
            return [];
        }

        /**
         * Load trade plans for date range
         * @private
         */
        static async _loadTradePlans(start, end, entityFilter, force) {
            if (entityFilter !== 'all' && entityFilter !== 'trade_plan') {
                return [];
            }

            try {
                if (window.TradePlansData?.loadTradePlansData) {
                    const allTradePlans = await window.TradePlansData.loadTradePlansData({ force });
                    // Normalize data - TradePlansData returns array directly
                    const tradePlansArray = Array.isArray(allTradePlans) ? allTradePlans : (Array.isArray(allTradePlans?.data) ? allTradePlans.data : []);
                    return this._filterByDateRange(tradePlansArray, start, end, 'entry_date', 'created_at');
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('Failed to load trade plans for calendar', {
                        ...PAGE_LOG_CONTEXT,
                        error: error?.message
                    });
                }
            }
            return [];
        }

        /**
         * Filter entities by date range
         * @private
         */
        static _filterByDateRange(entities, start, end, ...dateFields) {
            if (!Array.isArray(entities)) return [];
            
            return entities.filter(entity => {
                // Try multiple date fields
                for (const field of dateFields) {
                    const dateValue = entity[field] || 
                                     (entity[`${field}_envelope`]?.utc) ||
                                     (entity[`${field}_envelope`]?.local);
                    
                    if (!dateValue) continue;
                    
                    const date = window.CalendarDateUtils?.parseDate(dateValue) || new Date(dateValue);
                    if (isNaN(date.getTime())) continue;
                    
                    // Check if date is within range
                    if (date >= start && date <= end) {
                        return true;
                    }
                }
                return false;
            });
        }

        /**
         * Aggregate entities by day
         * @private
         */
        static _aggregateByDay(executions, trades, notes, alerts, cashFlows, tradePlans, year, month) {
            const aggregated = {};

            // Helper to get day key
            const getDayKey = (date) => {
                const d = window.CalendarDateUtils?.parseDate(date) || new Date(date);
                if (isNaN(d.getTime())) return null;
                if (d.getFullYear() !== year || d.getMonth() !== month) return null;
                return d.getDate();
            };

            // Aggregate executions
            executions.forEach(execution => {
                const dateValue = execution.execution_date || execution.date || execution.created_at;
                const day = getDayKey(dateValue);
                if (day) {
                    if (!aggregated[day]) aggregated[day] = { executions: [], trades: [], notes: [], alerts: [], cashFlows: [], tradePlans: [] };
                    aggregated[day].executions.push(execution);
                }
            });

            // Aggregate trades
            trades.forEach(trade => {
                const dateValue = trade.opened_at || trade.created_at;
                const day = getDayKey(dateValue);
                if (day) {
                    if (!aggregated[day]) aggregated[day] = { executions: [], trades: [], notes: [], alerts: [], cashFlows: [], tradePlans: [] };
                    aggregated[day].trades.push(trade);
                }
            });

            // Aggregate notes
            notes.forEach(note => {
                const dateValue = note.created_at || note.date;
                const day = getDayKey(dateValue);
                if (day) {
                    if (!aggregated[day]) aggregated[day] = { executions: [], trades: [], notes: [], alerts: [], cashFlows: [], tradePlans: [] };
                    aggregated[day].notes.push(note);
                }
            });

            // Aggregate alerts
            alerts.forEach(alert => {
                const dateValue = alert.triggered_at || alert.created_at || alert.expiry_date;
                const day = getDayKey(dateValue);
                if (day) {
                    if (!aggregated[day]) aggregated[day] = { executions: [], trades: [], notes: [], alerts: [], cashFlows: [], tradePlans: [] };
                    aggregated[day].alerts.push(alert);
                }
            });

            // Aggregate cash flows
            cashFlows.forEach(cashFlow => {
                const dateValue = cashFlow.date;
                const day = getDayKey(dateValue);
                if (day) {
                    if (!aggregated[day]) aggregated[day] = { executions: [], trades: [], notes: [], alerts: [], cashFlows: [], tradePlans: [] };
                    aggregated[day].cashFlows.push(cashFlow);
                }
            });

            // Aggregate trade plans
            tradePlans.forEach(tradePlan => {
                const dateValue = tradePlan.entry_date || tradePlan.created_at;
                const day = getDayKey(dateValue);
                if (day) {
                    if (!aggregated[day]) aggregated[day] = { executions: [], trades: [], notes: [], alerts: [], cashFlows: [], tradePlans: [] };
                    aggregated[day].tradePlans.push(tradePlan);
                }
            });

            return aggregated;
        }

        /**
         * Get month date range (fallback if CalendarDateUtils not available)
         * @private
         */
        static _getMonthDateRange(year, month) {
            const start = new Date(year, month, 1);
            const end = new Date(year, month + 1, 0);
            end.setHours(23, 59, 59, 999);
            return { start, end };
        }

        /**
         * Load month data with CacheTTLGuard
         * @param {number} year - Year
         * @param {number} month - Month (0-11)
         * @param {Object} options - Options
         * @returns {Promise<Object>} Aggregated data
         */
        static async loadMonthDataWithCache(year, month, options = {}) {
            const { force = false, entityFilter = 'all' } = options;
            const cacheKey = `${CALENDAR_DATA_KEY}-${year}-${month}-${entityFilter}`;

            // Use CacheTTLGuard if available
            if (window.CacheTTLGuard?.ensure && !force) {
                return await window.CacheTTLGuard.ensure(cacheKey, async () => {
                    return await this.loadMonthData(year, month, options);
                }, {
                    ttl: CALENDAR_TTL,
                    afterRead: (data) => {
                        if (window.Logger) {
                            window.Logger.debug('Calendar data served from cache', {
                                ...PAGE_LOG_CONTEXT,
                                year,
                                month
                            });
                        }
                    },
                    afterLoad: (data) => {
                        if (window.Logger) {
                            window.Logger.debug('Calendar data loaded from API', {
                                ...PAGE_LOG_CONTEXT,
                                year,
                                month
                            });
                        }
                    }
                });
            }

            // Fallback to direct load
            return await this.loadMonthData(year, month, options);
        }
    }

    // Export to global scope
    window.CalendarDataLoader = CalendarDataLoader;

    if (window.Logger) {
        window.Logger.info('Calendar Data Loader loaded', { 
            page: 'calendar-data-loader' 
        });
    }

})();


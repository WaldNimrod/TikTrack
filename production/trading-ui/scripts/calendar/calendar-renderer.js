/**
 * Calendar Renderer - TikTrack Calendar Rendering
 * ==============================================
 * 
 * Renders calendar grid with integrated general systems.
 * Uses FieldRendererService, IconSystem, ColorSchemeSystem, and CalendarDataLoader.
 * 
 * Documentation: See documentation/frontend/TRADING_JOURNAL_PAGE_AUDIT_PLAN.md
 * 
 * @version 1.0.0
 * @created November 2025
 * @author TikTrack Development Team
 */

(function() {
    'use strict';

    const PAGE_LOG_CONTEXT = { page: 'calendar-renderer' };

    /**
     * Calendar Renderer Class
     */
    class CalendarRenderer {
        /**
         * Render calendar grid for current month
         * @param {number} year - Year
         * @param {number} month - Month (0-11)
         * @param {Object} dayData - Aggregated data by day (from CalendarDataLoader)
         * @param {HTMLElement} calendarGrid - Calendar grid element
         * @returns {Promise<void>}
         */
        static async render(year, month, dayData = {}, calendarGrid = null) {
            if (!calendarGrid) {
                calendarGrid = document.querySelector('.calendar-grid');
            }

            if (!calendarGrid) {
                if (window.Logger) {
                    window.Logger.warn('Calendar grid not found', PAGE_LOG_CONTEXT);
                }
                return;
            }

            if (window.Logger) {
                window.Logger.info('Rendering calendar', {
                    ...PAGE_LOG_CONTEXT,
                    year,
                    month
                });
            }

            // Clear existing content
            calendarGrid.textContent = '';

            // Render headers using Hebrew day names
            this._renderHeaders(calendarGrid);

            // Get calendar date utilities
            const firstDay = window.CalendarDateUtils?.getFirstDayOfMonth(year, month) || 
                           new Date(year, month, 1).getDay();
            const daysInMonth = window.CalendarDateUtils?.getDaysInMonth(year, month) || 
                              new Date(year, month + 1, 0).getDate();
            const isCurrentMonth = window.CalendarDateUtils?.isCurrentMonth(year, month) || false;

            // Add empty cells for days before month start
            for (let i = 0; i < firstDay; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'calendar-day-cell calendar-day-cell-empty';
                calendarGrid.appendChild(emptyCell);
            }

            // Render calendar days
            for (let day = 1; day <= daysInMonth; day++) {
                const dayCell = await this._renderDayCell(year, month, day, dayData[day] || {}, isCurrentMonth);
                calendarGrid.appendChild(dayCell);
            }

            if (window.Logger) {
                window.Logger.info('Calendar rendered successfully', {
                    ...PAGE_LOG_CONTEXT,
                    year,
                    month,
                    daysInMonth
                });
            }
        }

        /**
         * Render calendar headers
         * @private
         */
        static _renderHeaders(calendarGrid) {
            const dayNames = window.CalendarDateUtils?.getHebrewDayNames() || 
                           ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\''];
            
            dayNames.forEach(dayText => {
                const header = document.createElement('div');
                header.className = 'calendar-day-header';
                header.textContent = dayText;
                calendarGrid.appendChild(header);
            });
        }

        /**
         * Render single day cell
         * @private
         */
        static async _renderDayCell(year, month, day, dayData, isCurrentMonth) {
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day-cell';

            // Check if this is today
            const isToday = window.CalendarDateUtils?.isToday(year, month, day) || false;
            if (isToday) {
                dayCell.classList.add('calendar-day-cell-today');
            }

            // Day number
            const dayNumber = document.createElement('div');
            dayNumber.className = 'calendar-day-number';
            dayNumber.textContent = day;
            dayCell.appendChild(dayNumber);

            // Render indicators using FieldRendererService and IconSystem
            if (dayData && Object.keys(dayData).length > 0) {
                const indicatorsContainer = document.createElement('div');
                indicatorsContainer.className = 'calendar-day-indicators';

                // Render execution indicators
                if (dayData.executions && dayData.executions.length > 0) {
                    const indicator = await this._renderIndicator('execution', dayData.executions.length, 'ביצועים');
                    indicatorsContainer.appendChild(indicator);
                }

                // Render trade indicators
                if (dayData.trades && dayData.trades.length > 0) {
                    const indicator = await this._renderIndicator('trade', dayData.trades.length, 'טריידים');
                    indicatorsContainer.appendChild(indicator);
                }

                // Render note indicators
                if (dayData.notes && dayData.notes.length > 0) {
                    const indicator = await this._renderIndicator('note', dayData.notes.length, 'הערות');
                    indicatorsContainer.appendChild(indicator);
                }

                // Render alert indicators
                if (dayData.alerts && dayData.alerts.length > 0) {
                    const indicator = await this._renderIndicator('alert', dayData.alerts.length, 'התראות');
                    indicatorsContainer.appendChild(indicator);
                }

                // Render cash flow indicators
                if (dayData.cashFlows && dayData.cashFlows.length > 0) {
                    const indicator = await this._renderIndicator('cash_flow', dayData.cashFlows.length, 'תזרימי מזומן');
                    indicatorsContainer.appendChild(indicator);
                }

                // Render trade plan indicators
                if (dayData.tradePlans && dayData.tradePlans.length > 0) {
                    const indicator = await this._renderIndicator('trade_plan', dayData.tradePlans.length, 'תוכניות');
                    indicatorsContainer.appendChild(indicator);
                }

                if (indicatorsContainer.children.length > 0) {
                    dayCell.appendChild(indicatorsContainer);
                }
            }

            return dayCell;
        }

        /**
         * Render indicator for entity type
         * @private
         */
        static async _renderIndicator(entityType, count, label) {
            const indicator = document.createElement('div');
            indicator.className = `calendar-day-indicator ${entityType}`;

            // Get entity color from ColorSchemeSystem
            const entityColor = this._getEntityColor(entityType);
            if (entityColor) {
                indicator.style.setProperty('--entity-color', entityColor);
            }

            // Render icon using IconSystem
            if (window.IconSystem && window.IconSystem.initialized) {
                try {
                    const iconHTML = await window.IconSystem.renderIcon('entity', entityType, {
                        size: '12',
                        class: 'calendar-indicator-icon'
                    });
                    
                    const iconContainer = document.createElement('span');
                    iconContainer.className = 'calendar-indicator-icon-container';
                    iconContainer.textContent = '';
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(iconHTML, 'text/html');
                    doc.body.childNodes.forEach(node => {
                        iconContainer.appendChild(node.cloneNode(true));
                    });
                    indicator.appendChild(iconContainer);
                } catch (error) {
                    if (window.Logger) {
                        window.Logger.warn('Failed to render indicator icon', {
                            ...PAGE_LOG_CONTEXT,
                            entityType,
                            error: error?.message
                        });
                    }
                }
            }

            // Render count using FieldRendererService
            const countText = document.createElement('span');
            countText.className = 'calendar-indicator-count';
            countText.textContent = `${count} ${label}`;
            indicator.appendChild(countText);

            return indicator;
        }

        /**
         * Get entity color from ColorSchemeSystem
         * @private
         */
        static _getEntityColor(entityType) {
            if (typeof window.getComputedStyle === 'function') {
                try {
                    const color = getComputedStyle(document.documentElement)
                        .getPropertyValue(`--entity-${entityType.replace('_', '-')}-color`);
                    return color && color.trim() ? color.trim() : null;
                } catch (error) {
                    return null;
                }
            }
            return null;
        }

        /**
         * Update calendar with new data
         * @param {number} year - Year
         * @param {number} month - Month (0-11)
         * @param {Object} dayData - Aggregated data by day
         * @returns {Promise<void>}
         */
        static async update(year, month, dayData = {}) {
            const calendarGrid = document.querySelector('.calendar-grid');
            if (!calendarGrid) {
                if (window.Logger) {
                    window.Logger.warn('Calendar grid not found for update', PAGE_LOG_CONTEXT);
                }
                return;
            }

            await this.render(year, month, dayData, calendarGrid);
        }
    }

    // Export to global scope
    window.CalendarRenderer = CalendarRenderer;

    if (window.Logger) {
        window.Logger.info('Calendar Renderer loaded', { 
            page: 'calendar-renderer' 
        });
    }

})();


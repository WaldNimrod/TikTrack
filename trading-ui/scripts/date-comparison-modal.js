/**
 * Date Comparison Modal - Modal for comparing dates
 * 
 * This file handles the date comparison modal functionality for the mockup.
 * 
 * Documentation: See documentation/frontend/JAVASCRIPT_ARCHITECTURE.md
 * 
 * Related Documentation:
 * - documentation/frontend/DATE_COMPARISON_MODAL_DEVELOPER_GUIDE.md
 */

(function() {
    'use strict';

    // ===== GLOBAL STATE =====
    let selectedDates = []; // Array of selected dates (sorted chronologically)
    let comparisonData = null;
    let barChart = null;
    let lineChart = null;
    let barChartSeries = {};
    let lineChartSeries = {};
    const MAX_DATES = 10; // Maximum number of dates for comparison

    // Cache keys
    const CACHE_KEY_SELECTED_DATES = 'date-comparison-selected-dates';

    // ===== HELPER FUNCTIONS =====

    /**
     * Helper function to get CSS variable value
     * @param {string} variableName - CSS variable name
     * @param {string} fallback - Fallback value
     * @returns {string} CSS variable value or fallback
     */
    function getCSSVariableValue(variableName, fallback) {
        try {
            const value = getComputedStyle(document.documentElement).getPropertyValue(variableName);
            return value && value.trim() ? value.trim() : fallback;
        } catch (error) {
            return fallback;
        }
    }

    /**
     * Format date for display
     * @param {string} dateStr - Date string (YYYY-MM-DD)
     * @returns {string} Formatted date
     */
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('he-IL', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }

    // ===== DATE SELECTION FUNCTIONS =====

    /**
     * Handle date 1 change (legacy - not used in new design)
     */
    function handleDate1Change() {
        // Legacy function - dates are now managed through the dates list
        // This function is kept for compatibility but does nothing
    }

    /**
     * Handle date 2 change (legacy - not used in new design)
     */
    function handleDate2Change() {
        // Legacy function - dates are now managed through the dates list
        // This function is kept for compatibility but does nothing
    }

    /**
     * Validate dates
     * @returns {boolean} True if valid
     */
    async function validateDates() {
        const validationMessage = document.getElementById('date-validation-message');

        // Need at least 2 dates
        if (selectedDates.length < 2) {
            if (validationMessage) {
                let alertIcon = '<img src="../../images/icons/tabler/alert-triangle.svg" width="16" height="16" alt="alert" class="icon">';
                if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
                    try {
                        alertIcon = await window.IconSystem.renderIcon('button', 'alert-triangle', { size: '16', alt: 'alert', class: 'icon' });
                    } catch (error) {
                        // Fallback already set
                    }
                }
                validationMessage.innerHTML = `<div class="alert alert-warning">${alertIcon} נדרשים לפחות 2 תאריכים להשוואה</div>`;
            }
            if (window.showNotification) {
                window.showNotification('נדרשים לפחות 2 תאריכים להשוואה', 'warning');
            }
            return false;
        }

        // Check for duplicates
        const uniqueDates = [...new Set(selectedDates)];
        if (uniqueDates.length !== selectedDates.length) {
            if (validationMessage) {
                let alertIcon2 = '<img src="../../images/icons/tabler/alert-triangle.svg" width="16" height="16" alt="alert" class="icon">';
                if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
                    try {
                        alertIcon2 = await window.IconSystem.renderIcon('button', 'alert-triangle', { size: '16', alt: 'alert', class: 'icon' });
                    } catch (error) {
                        // Fallback already set
                    }
                }
                validationMessage.innerHTML = `<div class="alert alert-danger">${alertIcon2} יש תאריכים כפולים ברשימה</div>`;
            }
            if (window.showNotification) {
                window.showNotification('יש תאריכים כפולים ברשימה', 'error');
            }
            return false;
        }

        // Dates are already sorted, so we just need to check they're valid
        if (validationMessage) {
            validationMessage.innerHTML = '';
        }

        return true;
    }

    // ===== DATE MANAGEMENT FUNCTIONS (Multiple Dates) =====

    /**
     * Sort dates chronologically
     * @param {Array<string>} dates - Array of date strings (YYYY-MM-DD)
     * @returns {Array<string>} Sorted dates
     */
    function sortDates(dates) {
        return dates.filter(d => d).sort((a, b) => {
            return new Date(a) - new Date(b);
        });
    }

    /**
     * Handle new date input change
     */
    function handleNewDateInput() {
        const newDateInput = document.getElementById('new-date-input');
        const addBtn = document.getElementById('add-date-btn');
        
        if (!newDateInput || !addBtn) return;
        
        // Enable/disable add button based on input value
        addBtn.disabled = !newDateInput.value;
    }

    /**
     * Add date from input field
     */
    function addDateFromInput() {
        const newDateInput = document.getElementById('new-date-input');
        if (!newDateInput || !newDateInput.value) {
            if (window.showNotification) {
                window.showNotification('נא לבחור תאריך לפני הוספה', 'warning');
            }
            return;
        }

        const newDate = newDateInput.value;

        // Check if date already exists
        if (selectedDates.includes(newDate)) {
            if (window.showNotification) {
                window.showNotification('תאריך זה כבר קיים ברשימה', 'warning');
            }
            return;
        }

        // Check max dates limit
        if (selectedDates.length >= MAX_DATES) {
            if (window.showNotification) {
                window.showNotification(`ניתן להוסיף עד ${MAX_DATES} תאריכים`, 'warning');
            }
            return;
        }

        // Add date and sort
        selectedDates.push(newDate);
        selectedDates = sortDates(selectedDates);

        // Clear input
        // Use DataCollectionService to clear field if available
        if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
            window.DataCollectionService.setValue(newDateInput.id, '', 'dateOnly');
        } else {
            newDateInput.value = '';
        }
        handleNewDateInput();

        // Render dates list
        renderDateInputs();
        updateTableHeaders();
    }

    /**
     * Add a new date input (legacy function - kept for compatibility)
     */
    function addDateInput() {
        addDateFromInput();
    }

    /**
     * Remove a date input
     * @param {string} dateId - ID of the date input to remove
     */
    function removeDateInput(dateId) {
        // Check minimum dates requirement (at least 2 dates)
        if (selectedDates.length <= 2) {
            if (window.showNotification) {
                window.showNotification('חייבים להישאר לפחות 2 תאריכים להשוואה', 'warning');
            }
            return;
        }

        const dateItem = document.getElementById(`date-item-${dateId}`);
        if (!dateItem) return;

        const dateInput = document.getElementById(dateId);
        if (dateInput && dateInput.value) {
            // Remove from selectedDates
            selectedDates = selectedDates.filter(d => d !== dateInput.value);
        }

        // Re-render dates list
        renderDateInputs();
        updateTableHeaders();
    }

    /**
     * Handle date input change (from selected dates list)
     * @param {string} dateId - ID of the date input
     */
    function handleDateInputChange(dateId) {
        const dateInput = document.getElementById(dateId);
        if (!dateInput) return;

        const dateValue = dateInput.value;
        const oldDate = dateInput.dataset.originalDate;

        if (!dateValue) {
            // If date is cleared, restore original or remove if not required
            if (oldDate) {
                // Use DataCollectionService to set value if available
        if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
            window.DataCollectionService.setValue(dateInput.id, oldDate, 'dateOnly');
        } else {
            dateInput.value = oldDate;
        }
            }
            return;
        }

        // Check if date already exists (and it's not the same date)
        if (selectedDates.includes(dateValue) && dateValue !== oldDate) {
            if (window.showNotification) {
                window.showNotification('תאריך זה כבר קיים ברשימה', 'warning');
            }
            // Use DataCollectionService to set value if available
        if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
            window.DataCollectionService.setValue(dateInput.id, oldDate || '', 'dateOnly');
        } else {
            dateInput.value = oldDate || '';
        }
            return;
        }

        // Update selectedDates
        if (oldDate) {
            const index = selectedDates.indexOf(oldDate);
            if (index !== -1) {
                selectedDates[index] = dateValue;
            }
        } else {
            selectedDates.push(dateValue);
        }

        // Sort dates chronologically
        selectedDates = sortDates(selectedDates);

        // Re-render to update order
        renderDateInputs();
        updateTableHeaders();
    }

    /**
     * Update selected dates from all inputs (legacy - not used in new design)
     */
    function updateSelectedDates() {
        // This function is kept for compatibility but not actively used
        // Dates are managed through addDateFromInput and removeDateInput
    }

    /**
     * Update add button state based on number of dates
     */
    function updateAddButtonState() {
        const addBtn = document.getElementById('add-date-btn');
        const newDateInput = document.getElementById('new-date-input');
        
        if (!addBtn) return;

        if (selectedDates.length >= MAX_DATES) {
            addBtn.disabled = true;
            addBtn.title = `ניתן להוסיף עד ${MAX_DATES} תאריכים`;
            if (newDateInput) {
                newDateInput.disabled = true;
            }
        } else {
            // Button is enabled only if there's a date in the input
            if (newDateInput) {
                addBtn.disabled = !newDateInput.value;
            } else {
                addBtn.disabled = false;
            }
            addBtn.title = 'הוסף תאריך נוסף';
            if (newDateInput) {
                newDateInput.disabled = false;
            }
        }
    }

    /**
     * Render date inputs from selectedDates array
     */
    function renderDateInputs() {
        const datesList = document.getElementById('dates-list');
        if (!datesList) return;

        datesList.innerHTML = '';

        if (selectedDates.length === 0) {
            datesList.innerHTML = '<div class="text-muted text-center py-2">אין תאריכים נבחרים. הוסף תאריכים להשוואה.</div>';
            return;
        }

        selectedDates.forEach((date, index) => {
            const dateId = `date-input-${index}-${date.replace(/-/g, '')}`;
            const dateItem = document.createElement('div');
            dateItem.className = 'date-item';
            dateItem.id = `date-item-${dateId}`;
            
            const canRemove = selectedDates.length > 2; // Can only remove if more than 2 dates
            
            dateItem.innerHTML = `
                <label class="date-label form-label-small">תאריך ${index + 1} (${formatDate(date)}):</label>
                <input type="date" class="form-control form-control-sm date-input" id="${dateId}" value="${date}" data-original-date="${date}" data-onchange="handleDateInputChange('${dateId}')">
                <button type="button" class="remove-date-btn" data-onclick="removeDateInput('${dateId}')" title="${canRemove ? 'הסר תאריך' : 'חייבים להישאר לפחות 2 תאריכים'}" ${!canRemove ? 'disabled' : ''}>
                    <img src="../../images/icons/tabler/x.svg" width="16" height="16" alt="remove">
                </button>
            `;
            datesList.appendChild(dateItem);
        });

        updateAddButtonState();
    }

    /**
     * Update table headers with selected dates
     */
    function updateTableHeaders() {
        const thead = document.querySelector('#comparison-table thead tr');
        if (!thead) return;

        // Clear existing headers (except first "מדד" column)
        const existingHeaders = thead.querySelectorAll('th:not(:first-child)');
        existingHeaders.forEach(th => th.remove());

        // Add headers for each selected date
        selectedDates.forEach((date, index) => {
            const th = document.createElement('th');
            th.id = `date-header-${index}`;
            th.textContent = `תאריך ${index + 1} (${formatDate(date)})`;
            thead.appendChild(th);
        });

        // Add "שינוי" column header if we have at least 2 dates
        if (selectedDates.length >= 2) {
            const changeHeader = document.createElement('th');
            changeHeader.textContent = 'שינוי';
            thead.appendChild(changeHeader);
        }
    }

    /**
     * Compare dates - main comparison function
     * Works with multiple dates from selectedDates array
     */
    async function compareDates() {
        if (!(await validateDates())) {
            return;
        }

        if (selectedDates.length < 2) {
            if (window.showNotification) {
                window.showNotification('נדרשים לפחות 2 תאריכים להשוואה', 'warning');
            }
            return;
        }

        try {
            // Show loading notification
            if (window.showNotification) {
                window.showNotification('משווה תאריכים...', 'info');
            }

            // Save selected dates
            await saveSelectedDates();

            // Generate cache key from all dates
            const cacheKey = `date-comparison-results-${selectedDates.join('-')}`;
            let cachedResults = null;

            if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                cachedResults = await window.UnifiedCacheManager.get(cacheKey);
            }

            if (cachedResults) {
                comparisonData = cachedResults.comparisonData;
                if (window.Logger && typeof window.Logger.info === 'function') {
                    window.Logger.info('Loaded comparison data from cache', { 
                        page: 'date-comparison-modal',
                        dates: selectedDates
                    });
                }
            } else {
                // Generate mock comparison data for all dates
                comparisonData = generateComparisonDataForMultipleDates(selectedDates);

                // Save to cache
                if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                    await window.UnifiedCacheManager.save(cacheKey, {
                        dates: selectedDates,
                        comparisonData: comparisonData
                    }, { 
                        layer: 'memory', 
                        ttl: 3600000 // 1 hour
                    });
                }
            }

            // Update UI
            if (window.Logger && typeof window.Logger.info === 'function') {
                window.Logger.info('Updating UI with comparison data', { 
                    page: 'date-comparison-modal',
                    hasData: !!comparisonData,
                    datesCount: selectedDates.length
                });
            }
            
            updateComparisonTable(comparisonData);
            updateBarChart(comparisonData);
            updateLineChart(comparisonData);
            updateAlerts(comparisonData);
            updateSummary(comparisonData);

            // Update table headers
            updateTableHeaders();

            if (window.showNotification) {
                window.showNotification('השוואה הושלמה בהצלחה', 'success');
            }

            } catch (error) {
            if (window.Logger && typeof window.Logger.error === 'function') {
                window.Logger.error('Error comparing dates', { 
                        page: 'date-comparison-modal', 
                        error 
                    });
                }
            if (window.showNotification) {
                window.showNotification('שגיאה בביצוע השוואה', 'error');
            }
        }
    }

    /**
     * Save selected dates to cache only (using UnifiedCacheManager)
     */
    async function saveSelectedDates() {
        if (selectedDates.length < 2) return;

        try {
            // Save to UnifiedCacheManager only
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                await window.UnifiedCacheManager.save(CACHE_KEY_SELECTED_DATES, {
                    dates: selectedDates
                }, { 
                    layer: 'localStorage', 
                    ttl: 86400000 // 24 hours
                });
            }
        } catch (error) {
            if (window.Logger && typeof window.Logger.warn === 'function') {
                window.Logger.warn('Failed to save selected dates', { 
                    page: 'date-comparison-modal', 
                    error 
                });
            }
        }
    }

    /**
     * Load last selected dates from cache only (using UnifiedCacheManager)
     */
    async function loadLastSelectedDates() {
        try {
            let lastDates = null;

            // Load from UnifiedCacheManager only
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                lastDates = await window.UnifiedCacheManager.get(CACHE_KEY_SELECTED_DATES);
            }

            if (lastDates) {
                // Support both old format (date1/date2) and new format (dates array)
                if (lastDates.dates && Array.isArray(lastDates.dates)) {
                    // New format: array of dates
                    selectedDates = sortDates(lastDates.dates);
                } else if (lastDates.date1 && lastDates.date2) {
                    // Old format: convert to array
                    selectedDates = sortDates([lastDates.date1, lastDates.date2]);
                }

                // Ensure at least 2 dates
                if (selectedDates.length < 2) {
                    selectedDates = [];
                }

                // Render dates if we have any
                if (selectedDates.length >= 2) {
                    renderDateInputs();
                    updateTableHeaders();
                }

                if (window.Logger && typeof window.Logger.info === 'function') {
                    window.Logger.info('Loaded last selected dates', { 
                        page: 'date-comparison-modal',
                        dates: selectedDates
                    });
                }
            }
        } catch (error) {
            if (window.Logger && typeof window.Logger.warn === 'function') {
                window.Logger.warn('Failed to load last selected dates', { 
                    page: 'date-comparison-modal', 
                    error 
                });
            }
        }
    }

    // ===== DATA GENERATION =====

    /**
     * Generate mock comparison data for multiple dates
     * @param {Array<string>} dates - Array of dates (YYYY-MM-DD)
     * @returns {Object} Comparison data
     */
    function generateComparisonDataForMultipleDates(dates) {
        if (!dates || dates.length < 2) {
            throw new Error('Need at least 2 dates for comparison');
        }

        // Generate data for all dates
        const datesData = {};
        let baseData = null;

        dates.forEach(date => {
            datesData[date] = generateDateData(date, baseData);
            if (!baseData) {
                baseData = datesData[date]; // Use first date as base
            }
        });

        // Calculate changes relative to first date
        const firstDate = dates[0];
        const firstData = datesData[firstDate];
        const changes = {};

        dates.slice(1).forEach(date => {
            const currentData = datesData[date];
            changes[date] = {
                balance: currentData.balance - firstData.balance,
                balancePercent: firstData.balance > 0 ? ((currentData.balance - firstData.balance) / firstData.balance) * 100 : 0,
                portfolioValue: currentData.portfolioValue - firstData.portfolioValue,
                portfolioValuePercent: firstData.portfolioValue > 0 ? ((currentData.portfolioValue - firstData.portfolioValue) / firstData.portfolioValue) * 100 : 0,
                realizedPL: currentData.realizedPL - firstData.realizedPL,
                realizedPLPercent: firstData.realizedPL !== 0 ? ((currentData.realizedPL - firstData.realizedPL) / Math.abs(firstData.realizedPL)) * 100 : 0,
                unrealizedPL: currentData.unrealizedPL - firstData.unrealizedPL,
                unrealizedPLPercent: firstData.unrealizedPL !== 0 ? ((currentData.unrealizedPL - firstData.unrealizedPL) / Math.abs(firstData.unrealizedPL)) * 100 : 0,
                totalPL: currentData.totalPL - firstData.totalPL,
                totalPLPercent: firstData.totalPL !== 0 ? ((currentData.totalPL - firstData.totalPL) / Math.abs(firstData.totalPL)) * 100 : 0,
                positions: currentData.positions - firstData.positions,
                positionsPercent: firstData.positions > 0 ? ((currentData.positions - firstData.positions) / firstData.positions) * 100 : 0
            };
        });

        return {
            dates: dates,
            datesData: datesData,
            changes: changes,
            // Legacy support for 2-date comparison
            date1: dates[0],
            date2: dates[dates.length - 1],
            data1: datesData[dates[0]],
            data2: datesData[dates[dates.length - 1]]
        };
    }

    /**
     * Generate mock comparison data for two dates (legacy function)
     * @param {string} date1 - First date (YYYY-MM-DD)
     * @param {string} date2 - Second date (YYYY-MM-DD)
     * @returns {Object} Comparison data
     */
    function generateComparisonData(date1, date2) {
        return generateComparisonDataForMultipleDates([date1, date2]);
    }

    /**
     * Generate mock data for a specific date
     * @param {string} date - Date string (YYYY-MM-DD)
     * @param {Object} baseData - Base data to vary from (optional)
     * @returns {Object} Date data
     */
    function generateDateData(date, baseData = null) {
        // Use date as seed for consistent data
        const dateObj = new Date(date);
        const seed = dateObj.getTime();
        
        // Simple seeded random
        let seedValue = seed;
        function seededRandom() {
            seedValue = (seedValue * 9301 + 49297) % 233280;
            return seedValue / 233280;
        }

        // If baseData provided, vary from it
        if (baseData) {
            const variation = (seededRandom() - 0.5) * 0.2; // ±10%
            return {
                balance: Math.round(baseData.balance * (1 + variation)),
                portfolioValue: Math.round(baseData.portfolioValue * (1 + variation * 1.2)),
                realizedPL: Math.round(baseData.realizedPL * (1 + variation * 1.5)),
                unrealizedPL: Math.round(baseData.unrealizedPL * (1 + variation)),
                totalPL: Math.round(baseData.totalPL * (1 + variation * 1.3)),
                positions: Math.max(1, Math.round(baseData.positions * (1 + variation * 0.5)))
            };
        }

        // Generate new base data
        const realizedPL = Math.round(5000 + seededRandom() * 10000); // $5K-$15K
        const unrealizedPL = Math.round(10000 + seededRandom() * 10000); // $10K-$20K
        const totalPL = realizedPL + unrealizedPL;
        
        return {
            balance: Math.round(40000 + seededRandom() * 20000), // $40K-$60K
            portfolioValue: Math.round(60000 + seededRandom() * 30000), // $60K-$90K
            realizedPL: realizedPL,
            unrealizedPL: unrealizedPL,
            totalPL: totalPL,
            positions: Math.round(3 + seededRandom() * 5) // 3-8 positions
        };
    }

    // ===== TABLE FUNCTIONS =====

    /**
     * Update comparison table
     * Works with multiple dates from selectedDates array
     * @param {Object} data - Comparison data
     */
    function updateComparisonTable(data) {
        const tbody = document.getElementById('comparison-table-body');
        if (!tbody) {
            console.error('Comparison table body not found');
            if (window.Logger && typeof window.Logger.warn === 'function') {
                window.Logger.warn('Comparison table body not found', { page: 'date-comparison-modal' });
            }
            return;
        }
        
        if (!data || !data.datesData || !selectedDates || selectedDates.length < 2) {
            console.error('Invalid comparison data', data);
            if (window.Logger && typeof window.Logger.warn === 'function') {
                window.Logger.warn('Invalid comparison data', { page: 'date-comparison-modal', data });
            }
            const colCount = selectedDates.length + 2; // dates + metric + change
            tbody.innerHTML = `<tr><td colspan="${colCount}" class="text-center text-muted">אין נתונים להצגה</td></tr>`;
            return;
        }
        
        console.log('Updating comparison table with data:', data);

        const metrics = [
            { key: 'balance', label: 'יתרות', format: 'currency' },
            { key: 'portfolioValue', label: 'שווי תיק', format: 'currency' },
            { key: 'realizedPL', label: 'P/L ממומש', format: 'currency' },
            { key: 'unrealizedPL', label: 'P/L לא ממומש', format: 'currency' },
            { key: 'totalPL', label: 'P/L כולל', format: 'currency' },
            { key: 'positions', label: 'פוזיציות', format: 'number' }
        ];

        const firstDate = selectedDates[0];
        const firstData = data.datesData[firstDate];

        const rows = metrics.map(metric => {
            // Build row with metric label
            let rowHTML = `<tr><td><strong>${metric.label}</strong></td>`;

            // Add value for each date
            selectedDates.forEach(date => {
                const dateData = data.datesData[date];
                if (!dateData) {
                    rowHTML += '<td class="text-muted">-</td>';
                    return;
                }

                const value = dateData[metric.key];
                if (value === undefined || value === null) {
                    rowHTML += '<td class="text-muted">-</td>';
                    return;
                }

                let formattedValue;
                try {
                    if (metric.format === 'currency') {
                        formattedValue = formatCurrency(value);
        } else {
                        formattedValue = value.toString();
                    }
                } catch (error) {
                    console.error(`Error formatting metric ${metric.key} for date ${date}:`, error);
                    formattedValue = '-';
                }

                rowHTML += `<td>${formattedValue}</td>`;
            });

            // Add change column (relative to first date)
            if (selectedDates.length > 1) {
                const lastDate = selectedDates[selectedDates.length - 1];
                const lastData = data.datesData[lastDate];
                const change = data.changes[lastDate];

                if (lastData && change) {
                    const changeValue = change[metric.key];
                    const changePercent = change[metric.key + 'Percent'];

                    let formattedChange;
                    try {
                        if (metric.format === 'currency') {
                            formattedChange = formatPLChange(changeValue, changePercent);
                        } else {
                            formattedChange = formatNumberChange(changeValue, changePercent);
                        }
                    } catch (error) {
                        console.error(`Error formatting change for metric ${metric.key}:`, error);
                        formattedChange = '-';
                    }

                    rowHTML += `<td>${formattedChange}</td>`;
                } else {
                    rowHTML += '<td class="text-muted">-</td>';
                }
            }

            rowHTML += '</tr>';
            return rowHTML;
        }).join('');

        if (rows) {
            tbody.innerHTML = rows;
        } else {
            const colCount = selectedDates.length + 2;
            tbody.innerHTML = `<tr><td colspan="${colCount}" class="text-center text-muted">אין נתונים להצגה</td></tr>`;
        }
    }

    /**
     * Format currency value
     * @param {number} value - Currency value
     * @returns {string} Formatted currency
     */
    function formatCurrency(value) {
        if (window.FieldRendererService && typeof window.FieldRendererService.renderAmount === 'function') {
            return window.FieldRendererService.renderAmount(value, '$', 0, false);
        }
        // Fallback
        return `$${value.toLocaleString('en-US')}`;
    }

    /**
     * Format P/L change with percentage
     * @param {number} change - Change value
     * @param {number} percent - Change percentage
     * @returns {string} Formatted change
     */
    function formatPLChange(change, percent) {
        if (window.FieldRendererService && typeof window.FieldRendererService.renderPLChange === 'function') {
            return window.FieldRendererService.renderPLChange(change, percent, 'date_comparison');
        }
        
        // Fallback
        const sign = change >= 0 ? '+' : '';
        const changeFormatted = `${sign}$${Math.abs(change).toLocaleString('en-US')}`;
        const percentFormatted = percent !== null && percent !== undefined 
            ? ` (${sign}${Math.abs(percent).toFixed(1)}%)` 
            : '';
        const className = change >= 0 ? 'text-success' : 'text-danger';
        return `<span class="${className}">${changeFormatted}${percentFormatted}</span>`;
    }

    /**
     * Format number change with percentage
     * @param {number} change - Change value
     * @param {number} percent - Change percentage
     * @returns {string} Formatted change
     */
    function formatNumberChange(change, percent) {
        const sign = change >= 0 ? '+' : '';
        const changeFormatted = `${sign}${Math.abs(change)}`;
        const percentFormatted = percent !== null && percent !== undefined 
            ? ` (${sign}${Math.abs(percent).toFixed(1)}%)` 
            : '';
        const className = change >= 0 ? 'text-success' : 'text-danger';
        return `<span class="${className}">${changeFormatted}${percentFormatted}</span>`;
    }

    // ===== CHART FUNCTIONS =====

    /**
     * Wait for TradingView adapter to be available
     */
    async function waitForTradingViewAdapter() {
        let retries = 0;
        const maxRetries = 100; // 5 seconds max
        
        while ((typeof window.TradingViewChartAdapter === 'undefined' || 
               (typeof window.LightweightCharts === 'undefined' && typeof window.lightweightCharts === 'undefined')) && 
               retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 50));
            retries++;
        }
        
        if (typeof window.TradingViewChartAdapter === 'undefined') {
            if (window.Logger && typeof window.Logger.error === 'function') {
                window.Logger.error('TradingViewChartAdapter not available', { 
                    page: 'date-comparison-modal', 
                    timeout: maxRetries * 50 
                });
            }
            throw new Error('TradingViewChartAdapter not loaded');
        }
        
        if (typeof window.LightweightCharts === 'undefined' && typeof window.lightweightCharts === 'undefined') {
            if (window.Logger && typeof window.Logger.error === 'function') {
                window.Logger.error('LightweightCharts not available', { 
                    page: 'date-comparison-modal', 
                    timeout: maxRetries * 50 
                });
            }
            throw new Error('LightweightCharts not loaded');
        }
        
        if (window.Logger && typeof window.Logger.info === 'function') {
            window.Logger.info('TradingView libraries loaded', { page: 'date-comparison-modal' });
        }
    }

    /**
     * Initialize Bar Chart
     */
    async function initBarChart() {
        try {
            await waitForTradingViewAdapter();

            const container = document.getElementById('bar-chart-container');
            if (!container) {
                if (window.Logger && typeof window.Logger.error === 'function') {
                    window.Logger.error('Bar chart container not found', { page: 'date-comparison-modal' });
                }
                return;
            }

            // Get wrapper for width calculation
            const wrapper = container.closest('.chart-container-wrapper') || container.parentElement;
            const containerWidth = wrapper ? wrapper.clientWidth : container.clientWidth;

            // Remove loading indicator
            const loading = container.querySelector('.chart-loading');
            if (loading) loading.remove();

            // Destroy existing chart if any
            if (barChart) {
                try {
                    if (window.TradingViewChartAdapter && typeof window.TradingViewChartAdapter.destroyChart === 'function') {
                        window.TradingViewChartAdapter.destroyChart(barChart);
                    } else {
                        barChart.remove();
                    }
                    } catch (e) {
                        if (window.Logger && typeof window.Logger.warn === 'function') {
                            window.Logger.warn('Error removing existing bar chart', { 
                                page: 'date-comparison-modal', 
                                error: e 
                            });
                        }
                    }
            }

            // Get colors
            const textColor = getCSSVariableValue('--text-color', '#212529');
            const cardBg = getCSSVariableValue('--card-background', '#ffffff');
            const infoColor = getCSSVariableValue('--info-color', '#17a2b8');
            const successColor = getCSSVariableValue('--success-color', '#28a745');

            // Create chart
            barChart = window.TradingViewChartAdapter.createChart(container, {
                layout: {
                    background: { type: 'solid', color: 'transparent' },
                    textColor: textColor
                },
                grid: {
                    vertLines: { visible: false },
                    horzLines: { visible: true, color: getCSSVariableValue('--border-color', '#e0e0e0') }
                },
                width: containerWidth,
                height: 300,
                timeScale: {
                    visible: true,
                    timeVisible: true,
                    secondsVisible: false
                },
                rightPriceScale: {
                    borderVisible: true,
                    borderColor: getCSSVariableValue('--border-color', '#e0e0e0'),
                    scaleMargins: {
                        top: 0.1,
                        bottom: 0.1
                    }
                }
            });

            // Clear existing series
            Object.values(barChartSeries).forEach(series => {
                if (series) {
                    try {
                        barChart.removeSeries(series);
                    } catch (e) {
                        // Ignore
                    }
                }
            });
            barChartSeries = {};

            // Handle resize
            window.addEventListener('resize', () => {
                if (barChart) {
                    const wrapper = container.closest('.chart-container-wrapper') || container.parentElement;
                    const containerWidth = wrapper ? wrapper.clientWidth : container.clientWidth;
                    barChart.applyOptions({ width: containerWidth });
                }
            });

            if (window.Logger && typeof window.Logger.info === 'function') {
                window.Logger.info('Bar chart initialized', { page: 'date-comparison-modal' });
            }

        } catch (error) {
            if (window.Logger && typeof window.Logger.error === 'function') {
                window.Logger.error('Error initializing bar chart', { 
                                page: 'date-comparison-modal', 
                                error 
                            });
            }
        }
    }

    /**
     * Update Bar Chart with comparison data
     * @param {Object} data - Comparison data
     */
    function updateBarChart(data) {
        if (!barChart) {
            initBarChart().then(() => {
                if (barChart) {
                    updateBarChart(data);
                }
            });
            return;
        }

        try {
            const lightweightCharts = window.LightweightCharts || window.lightweightCharts;
            if (!lightweightCharts || !lightweightCharts.BarSeries) {
                if (window.Logger && typeof window.Logger.error === 'function') {
                    window.Logger.error('BarSeries not available', { page: 'date-comparison-modal' });
                }
                return;
            }

            // Clear existing series
            Object.values(barChartSeries).forEach(series => {
                if (series) {
                    try {
                        barChart.removeSeries(series);
                    } catch (e) {
                        // Ignore
                    }
                }
            });
            barChartSeries = {};

            // Get colors
            const infoColor = getCSSVariableValue('--info-color', '#17a2b8');
            const successColor = getCSSVariableValue('--success-color', '#28a745');

            // Generate bar chart data
            const barData = generateBarChartData(data);
            
            console.log('Updating bar chart with data:', barData);

            // Add series for date1
            const series1 = window.TradingViewChartAdapter.addBarSeries(barChart, {
                title: 'תאריך 1',
                upColor: infoColor,
                downColor: infoColor
            });
            
            if (barData.date1Data && barData.date1Data.length > 0) {
                series1.setData(barData.date1Data);
                barChartSeries.date1 = series1;
            }

            // Add series for date2
            const series2 = window.TradingViewChartAdapter.addBarSeries(barChart, {
                title: 'תאריך 2',
                upColor: successColor,
                downColor: successColor
            });
            
            if (barData.date2Data && barData.date2Data.length > 0) {
                series2.setData(barData.date2Data);
                barChartSeries.date2 = series2;
            }

            if (window.Logger && typeof window.Logger.info === 'function') {
                window.Logger.info('Bar chart updated', { page: 'date-comparison-modal' });
            }

        } catch (error) {
            if (window.Logger && typeof window.Logger.error === 'function') {
                window.Logger.error('Error updating bar chart', { 
                    page: 'date-comparison-modal', 
                    error 
                });
            }
        }
    }

    /**
     * Generate bar chart data
     * @param {Object} data - Comparison data
     * @returns {Object} Bar chart data
     */
    function generateBarChartData(data) {
        // Use actual dates from comparison for better visualization
        const date1Obj = new Date(data.date1);
        const date2Obj = new Date(data.date2);
        
        // Base timestamp: use date1 as base (in seconds)
        const baseTimestamp = Math.floor(date1Obj.getTime() / 1000);
        const secondsPerDay = 86400;
        const secondsPerHour = 3600;

        const metrics = [
            { key: 'balance', label: 'יתרות' },
            { key: 'portfolioValue', label: 'שווי תיק' },
            { key: 'realizedPL', label: 'P/L ממומש' },
            { key: 'unrealizedPL', label: 'P/L לא ממומש' },
            { key: 'totalPL', label: 'P/L כולל' },
            { key: 'positions', label: 'פוזיציות' }
        ];

        const date1Data = [];
        const date2Data = [];

        metrics.forEach((metric, index) => {
            // Each metric gets 2 days: 1 day for data + 1 day for spacing
            const categoryBaseTime = baseTimestamp + (index * 2 * secondsPerDay);
            
            // Date1 data at hour 0
            const time1 = categoryBaseTime;
            const value1 = data.data1[metric.key];
            date1Data.push({
                time: time1,
                open: value1,
                high: value1,
                low: value1,
                close: value1
            });

            // Date2 data at hour 1
            const time2 = categoryBaseTime + secondsPerHour;
            const value2 = data.data2[metric.key];
            date2Data.push({
                time: time2,
                open: value2,
                high: value2,
                low: value2,
                close: value2
            });
        });

        console.log('Generated bar chart data:', { date1Data, date2Data });

        return {
            date1Data: date1Data,
            date2Data: date2Data,
            categories: metrics.map(m => m.label)
        };
    }

    /**
     * Initialize Line Chart
     */
    async function initLineChart() {
        try {
            await waitForTradingViewAdapter();

            const container = document.getElementById('line-chart-container');
            if (!container) {
                if (window.Logger && typeof window.Logger.error === 'function') {
                    window.Logger.error('Line chart container not found', { page: 'date-comparison-modal' });
                }
                return;
            }

            // Get wrapper for width calculation
            const wrapper = container.closest('.chart-container-wrapper') || container.parentElement;
            const containerWidth = wrapper ? wrapper.clientWidth : container.clientWidth;

            // Remove loading indicator
            const loading = container.querySelector('.chart-loading');
            if (loading) loading.remove();

            // Destroy existing chart if any
            if (lineChart) {
                try {
                    if (window.TradingViewChartAdapter && typeof window.TradingViewChartAdapter.destroyChart === 'function') {
                        window.TradingViewChartAdapter.destroyChart(lineChart);
                } else {
                        lineChart.remove();
                    }
                    } catch (e) {
                        if (window.Logger && typeof window.Logger.warn === 'function') {
                            window.Logger.warn('Error removing existing line chart', { 
                                page: 'date-comparison-modal', 
                                error: e 
                            });
                        }
                    }
            }

            // Get colors
            const textColor = getCSSVariableValue('--text-color', '#212529');
            const cardBg = getCSSVariableValue('--card-background', '#ffffff');
            const infoColor = getCSSVariableValue('--info-color', '#17a2b8');
            const successColor = getCSSVariableValue('--success-color', '#28a745');
            const dangerColor = getCSSVariableValue('--danger-color', '#dc3545');

            // Create chart
            lineChart = window.TradingViewChartAdapter.createChart(container, {
                layout: {
                    background: { type: 'solid', color: 'transparent' },
                    textColor: textColor
                },
                grid: {
                    vertLines: { visible: false },
                    horzLines: { visible: true, color: getCSSVariableValue('--border-color', '#e0e0e0') }
                },
                width: containerWidth,
                height: 300,
                timeScale: {
                    visible: true,
                    timeVisible: true,
                    secondsVisible: false
                },
                rightPriceScale: {
                    borderVisible: true,
                    borderColor: getCSSVariableValue('--border-color', '#e0e0e0'),
                    scaleMargins: {
                        top: 0.1,
                        bottom: 0.1
                    }
                }
            });

            // Clear existing series
            Object.values(lineChartSeries).forEach(series => {
                if (series) {
                    try {
                        lineChart.removeSeries(series);
                    } catch (e) {
                        // Ignore
                    }
                }
            });
            lineChartSeries = {};

            // Handle resize
            window.addEventListener('resize', () => {
                if (lineChart) {
                    const wrapper = container.closest('.chart-container-wrapper') || container.parentElement;
                    const containerWidth = wrapper ? wrapper.clientWidth : container.clientWidth;
                    lineChart.applyOptions({ width: containerWidth });
                }
            });

            if (window.Logger && typeof window.Logger.info === 'function') {
                window.Logger.info('Line chart initialized', { page: 'date-comparison-modal' });
            }

        } catch (error) {
            if (window.Logger && typeof window.Logger.error === 'function') {
                window.Logger.error('Error initializing line chart', { 
                        page: 'date-comparison-modal', 
                        error 
                    });
                }
        }
    }

    /**
     * Update Line Chart with comparison data
     * @param {Object} data - Comparison data
     */
    function updateLineChart(data) {
        if (!lineChart) {
            initLineChart().then(() => {
                if (lineChart) {
                    updateLineChart(data);
                }
            });
            return;
        }

        try {
            const lightweightCharts = window.LightweightCharts || window.lightweightCharts;
            if (!lightweightCharts || !lightweightCharts.LineSeries) {
                if (window.Logger && typeof window.Logger.error === 'function') {
                    window.Logger.error('LineSeries not available', { page: 'date-comparison-modal' });
                }
                return;
            }

            // Clear existing series
            Object.values(lineChartSeries).forEach(series => {
                if (series) {
                    try {
                        lineChart.removeSeries(series);
                    } catch (e) {
                        // Ignore
                    }
                }
            });
            lineChartSeries = {};

            // Get colors
            const infoColor = getCSSVariableValue('--info-color', '#17a2b8');
            const successColor = getCSSVariableValue('--success-color', '#28a745');
            const dangerColor = getCSSVariableValue('--danger-color', '#dc3545');

            // Generate line chart data
            const lineData = generateLineChartData(data);
            
            console.log('Updating line chart with data:', lineData);

            // Add series for balance
            if (lineData.balanceData && lineData.balanceData.length > 0) {
                const balanceSeries = window.TradingViewChartAdapter.addLineSeries(lineChart, {
                    title: 'יתרות',
                    color: infoColor,
                    lineWidth: 2
                });
                balanceSeries.setData(lineData.balanceData);
                lineChartSeries.balance = balanceSeries;
            }

            // Add series for portfolio value
            if (lineData.portfolioData && lineData.portfolioData.length > 0) {
                const portfolioSeries = window.TradingViewChartAdapter.addLineSeries(lineChart, {
                    title: 'שווי תיק',
                    color: successColor,
                    lineWidth: 2
                });
                portfolioSeries.setData(lineData.portfolioData);
                lineChartSeries.portfolio = portfolioSeries;
            }

            // Add series for total PL
            if (lineData.plData && lineData.plData.length > 0) {
                const plSeries = window.TradingViewChartAdapter.addLineSeries(lineChart, {
                    title: 'P/L כולל',
                    color: dangerColor,
                    lineWidth: 2
                });
                plSeries.setData(lineData.plData);
                lineChartSeries.pl = plSeries;
            }

            if (window.Logger && typeof window.Logger.info === 'function') {
                window.Logger.info('Line chart updated', { page: 'date-comparison-modal' });
            }

        } catch (error) {
            if (window.Logger && typeof window.Logger.error === 'function') {
                window.Logger.error('Error updating line chart', { 
                    page: 'date-comparison-modal', 
                    error 
                });
            }
        }
    }

    /**
     * Generate line chart data
     * @param {Object} data - Comparison data
     * @returns {Object} Line chart data
     */
    function generateLineChartData(data) {
        // Use actual dates from comparison
        const date1Obj = new Date(data.date1);
        const date2Obj = new Date(data.date2);
        const daysDiff = Math.floor((date2Obj - date1Obj) / (1000 * 60 * 60 * 24));

        const balanceData = [];
        const portfolioData = [];
        const plData = [];

        // Generate intermediate points
        for (let i = 0; i <= daysDiff; i++) {
            const currentDate = new Date(date1Obj);
            currentDate.setDate(date1Obj.getDate() + i);
            
            // Format as YYYY-MM-DD for TradingView
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const timeStr = `${year}-${month}-${day}`;
            
            const progress = daysDiff > 0 ? i / daysDiff : 0;

            // Interpolate values
            const balance = data.data1.balance + (data.data2.balance - data.data1.balance) * progress;
            const portfolio = data.data1.portfolioValue + (data.data2.portfolioValue - data.data1.portfolioValue) * progress;
            const pl = data.data1.totalPL + (data.data2.totalPL - data.data1.totalPL) * progress;

            balanceData.push({ time: timeStr, value: balance });
            portfolioData.push({ time: timeStr, value: portfolio });
            plData.push({ time: timeStr, value: pl });
        }

        console.log('Generated line chart data:', { balanceData, portfolioData, plData });

        return {
            balanceData: balanceData,
            portfolioData: portfolioData,
            plData: plData
        };
    }

    // ===== ALERTS FUNCTIONS =====

    /**
     * Calculate alerts based on comparison data
     * @param {Object} data - Comparison data
     * @returns {Array} Array of alerts
     */
    function calculateAlerts(data) {
        const alerts = [];

        // Balance change > 5%
        const balanceChangePercent = Math.abs(data.changes.balancePercent);
        if (balanceChangePercent > 5) {
            alerts.push({
                type: 'warning',
                message: `שינוי משמעותי: שינוי ביתרות ${balanceChangePercent.toFixed(1)}%`
            });
        }

        // P/L change > 10%
        const plChangePercent = Math.abs(data.changes.totalPLPercent);
        if (plChangePercent > 10) {
            alerts.push({
                type: 'warning',
                message: `שינוי משמעותי: שינוי ב-P/L ${plChangePercent.toFixed(1)}%`
            });
        }

        return alerts;
    }

    /**
     * Update alerts display
     * @param {Object} data - Comparison data
     */
    function updateAlerts(data) {
        const alertsContainer = document.getElementById('alerts-container');
        if (!alertsContainer) return;

        const alerts = calculateAlerts(data);

        if (alerts.length === 0) {
            alertsContainer.innerHTML = '';
            return;
        }

        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert alert-${alert.type}">
                <img src="../../images/icons/tabler/alert-triangle.svg" width="16" height="16" alt="alert-triangle" class="icon">
                <strong>שינוי משמעותי:</strong> ${alert.message}
            </div>
        `).join('');
    }

    // ===== SUMMARY FUNCTIONS =====

    /**
     * Update summary display
     * @param {Object} data - Comparison data
     */
    async function updateSummary(data) {
        if (!window.InfoSummarySystem || !window.INFO_SUMMARY_CONFIGS) return;

        const config = window.INFO_SUMMARY_CONFIGS['date-comparison-modal'];
        if (!config) return;

        // Create summary data array (InfoSummarySystem expects an array)
        const summaryDataArray = [{
            total_change: data.changes.totalPL,
            avg_change_percent: data.changes.totalPLPercent,
            significant_changes: calculateAlerts(data).length
        }];

        try {
            // Use calculateAndRender with custom data
            // We need to override the calculator for custom stats
            const customConfig = {
                ...config,
                stats: config.stats.map(stat => {
                    if (stat.calculator === 'custom' && stat.customCalculator) {
                        return {
                            ...stat,
                            calculator: 'custom',
                            customCalculator: stat.customCalculator
                        };
                    }
                    return stat;
                })
            };

            // For custom calculators, we'll render manually
            const summaryData = summaryDataArray[0];
            const summaryContainer = document.getElementById('comparison-summary');
            if (summaryContainer) {
                let html = '<div class="info-summary"><h3>סיכום השוואה</h3><div class="summary-stats">';
                
                config.stats.forEach(stat => {
                    let value = 0;
                    if (stat.id === 'total_change') {
                        value = summaryData.total_change || 0;
                        const formatted = window.FieldRendererService && typeof window.FieldRendererService.renderAmount === 'function'
                            ? window.FieldRendererService.renderAmount(value, '$', 0, true)
                            : `$${value.toLocaleString('en-US')}`;
                        html += `<div class="stat-item"><span class="stat-label">${stat.label}:</span> <span class="stat-value">${formatted}</span></div>`;
                    } else if (stat.id === 'avg_change_percent') {
                        value = summaryData.avg_change_percent || 0;
                        const formatted = window.FieldRendererService && typeof window.FieldRendererService.renderNumericValue === 'function'
                            ? window.FieldRendererService.renderNumericValue(value, '%', true)
                            : `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
                        html += `<div class="stat-item"><span class="stat-label">${stat.label}:</span> <span class="stat-value">${formatted}</span></div>`;
                    } else if (stat.id === 'significant_changes') {
                        value = summaryData.significant_changes || 0;
                        html += `<div class="stat-item"><span class="stat-label">${stat.label}:</span> <span class="stat-value">${value}</span></div>`;
                    }
                });
                
                html += '</div></div>';
                summaryContainer.innerHTML = html;
            }
        } catch (error) {
            if (window.Logger && typeof window.Logger.warn === 'function') {
                window.Logger.warn('Failed to render summary', { 
                        page: 'date-comparison-modal', 
                        error 
                    });
                }
        }
    }

    // ===== DATE RANGE FUNCTIONS =====

    /**
     * Toggle date range filter menu
     */
    function toggleDateComparisonRangeFilterMenu() {
        const menu = document.getElementById('dateComparisonRangeFilterMenu');
        if (menu) {
            const isCurrentlyOpen = menu.classList.contains('show');
            if (isCurrentlyOpen) {
                menu.classList.remove('show');
            } else {
                menu.classList.add('show');
            }
        }
    }

    /**
     * Select date range option
     * This resets all dates and sets start date based on range + today as end date
     * @param {string} dateRange - Date range option
     */
    function selectDateComparisonRangeOption(dateRange) {
        const dateRangeItems = document.querySelectorAll('#dateComparisonRangeFilterMenu .date-range-filter-item');
        dateRangeItems.forEach(item => item.classList.remove('selected'));
        
        const clickedItem = Array.from(dateRangeItems).find(
            item => item.getAttribute('data-value') === dateRange
        );
        if (clickedItem) {
            clickedItem.classList.add('selected');
        }
        
        // Clear new date input
        const newDateInput = document.getElementById('new-date-input');
        if (newDateInput) {
            // Use DataCollectionService to clear field if available
        if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
            window.DataCollectionService.setValue(newDateInput.id, '', 'dateOnly');
        } else {
            newDateInput.value = '';
        }
        }
        
        // Get date range and update selectedDates
        const dateRangeResult = getDateRangeFromOption(dateRange);
        if (dateRangeResult && dateRangeResult.start) {
            // Format dates as YYYY-MM-DD
            const formatDateForInput = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            
            // Get today as end date
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStr = formatDateForInput(today);
            
            // Reset selectedDates and set: start date (from range) + today (as end date)
            selectedDates = sortDates([
                formatDateForInput(dateRangeResult.start),
                todayStr
            ]);
            
            // Render dates list
            renderDateInputs();
            
            // Update headers
            updateTableHeaders();
            
            // Update filter text
            updateDateComparisonRangeFilterText();
            
            // Automatically compare dates (with small delay to ensure DOM is updated)
            setTimeout(() => {
                compareDates();
            }, 100);
        }
        
        // Update filter text
        updateDateComparisonRangeFilterText();
        
        // Close menu
        const dateMenu = document.getElementById('dateComparisonRangeFilterMenu');
        if (dateMenu) {
            dateMenu.classList.remove('show');
        }
    }

    /**
     * Get date range from option
     * @param {string} range - Range option
     * @returns {Object} Date range with start and end
     */
    function getDateRangeFromOption(range) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let start = null;
        let end = today;
        
        switch (range) {
            case 'אתמול':
                // For "אתמול", compare day before yesterday to yesterday
                start = new Date(today);
                start.setDate(today.getDate() - 2); // Day before yesterday
                end = new Date(today);
                end.setDate(today.getDate() - 1); // Yesterday
                break;
                
            case 'השבוע': {
                const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
                start = new Date(today);
                start.setDate(today.getDate() - dayOfWeek);
                break;
            }
            
            case 'שבוע':
                start = new Date(today);
                start.setDate(today.getDate() - 7);
                break;
                
            case 'שבוע קודם': {
                const dayOfWeek = today.getDay();
                const lastWeekEnd = new Date(today);
                lastWeekEnd.setDate(today.getDate() - dayOfWeek - 1);
                end = new Date(lastWeekEnd);
                end.setHours(23, 59, 59, 999);
                start = new Date(lastWeekEnd);
                start.setDate(lastWeekEnd.getDate() - 6);
                start.setHours(0, 0, 0, 0);
                break;
            }
            
            case 'החודש': {
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
            }
            
            case 'חודש':
                start = new Date(today);
                start.setDate(today.getDate() - 30);
                break;
                
            case 'חודש קודם': {
                const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                start = lastMonthStart;
                end = lastMonthEnd;
                end.setHours(23, 59, 59, 999);
                break;
            }
            
            case 'השנה': {
                start = new Date(today.getFullYear(), 0, 1);
                break;
            }
            
            case 'שנה':
                start = new Date(today);
                start.setDate(today.getDate() - 365);
                break;
                
            case 'שנה קודמת': {
                const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
                const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
                start = lastYearStart;
                end = lastYearEnd;
                end.setHours(23, 59, 59, 999);
                break;
            }
        }
        
        if (start) {
            start.setHours(0, 0, 0, 0);
        }
        if (end) {
            end.setHours(23, 59, 59, 999);
        }
        
        return { start, end, range };
    }

    /**
     * Update date range filter text
     * Always shows the preset range text, not the actual dates
     */
    function updateDateComparisonRangeFilterText() {
        const selectedItem = document.querySelector('#dateComparisonRangeFilterMenu .date-range-filter-item.selected');
        const dateElement = document.getElementById('selectedDateComparisonRange');
        
        if (dateElement) {
            if (selectedItem) {
                // Always show preset selection text
                const optionText = selectedItem.querySelector('.option-text');
                const displayText = optionText ? optionText.textContent.trim() : selectedItem.getAttribute('data-value');
                dateElement.textContent = displayText;
            } else {
                dateElement.textContent = 'השנה'; // Default
            }
        }
    }

    // ===== INITIALIZATION =====

    /**
     * Initialize page
     */
    async function initializePage() {
        try {
            // Wait for UnifiedAppInitializer to complete
            // The system will auto-initialize, but we wait a bit for it to complete
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Load last selected dates
            await loadLastSelectedDates();
            
            // Initialize date range filter text
            updateDateComparisonRangeFilterText();
            
            // Set default selection to "השנה" if no dates loaded or less than 2 dates
            if (selectedDates.length < 2) {
                const defaultItem = document.querySelector('#dateComparisonRangeFilterMenu .date-range-filter-item[data-value="השנה"]');
                if (defaultItem) {
                    defaultItem.classList.add('selected');
                    // Auto-select default range (this will set 2 dates and trigger comparison)
                    selectDateComparisonRangeOption('השנה');
                }
            } else {
                // Render existing dates
                renderDateInputs();
                updateTableHeaders();
                // Trigger comparison with existing dates (after a short delay to ensure DOM is ready)
                setTimeout(() => {
                    compareDates();
                }, 500);
            }

            // Initialize charts (but don't show data until dates are selected)
            await initBarChart();
            await initLineChart();

            if (window.Logger && typeof window.Logger.info === 'function') {
                window.Logger.info('Date comparison modal initialized', { page: 'date-comparison-modal' });
            }

        } catch (error) {
            if (window.Logger && typeof window.Logger.error === 'function') {
                window.Logger.error('Error initializing date comparison modal', { 
                    page: 'date-comparison-modal', 
                    error 
                });
            }
        }
    }

    // ===== EXPORT FUNCTIONS =====

    /**
     * Export to Excel/PDF (placeholder)
     */
    function exportComparison() {
        if (window.showNotification) {
            window.showNotification('פונקציונליות ייצוא תשולב בעתיד', 'info');
        }
    }

    // ===== GLOBAL EXPORTS =====

    // Export functions to window for global access
    window.dateComparisonModal = {
        getCSSVariableValue,
        handleDate1Change,
        handleDate2Change,
        compareDates,
        exportComparison,
        initializePage
    };

    // Make functions available globally for onclick handlers
    // Wrap date change handlers to also update filter text
    window.handleDate1Change = function() {
        handleDate1Change();
        updateDateComparisonRangeFilterText();
    };
    
    window.handleDate2Change = function() {
        handleDate2Change();
        updateDateComparisonRangeFilterText();
    };
    
    window.compareDates = compareDates;
    window.toggleDateComparisonRangeFilterMenu = toggleDateComparisonRangeFilterMenu;
    window.selectDateComparisonRangeOption = selectDateComparisonRangeOption;
    
    // Date management functions
    window.addDateInput = addDateInput;
    window.addDateFromInput = addDateFromInput;
    window.removeDateInput = removeDateInput;
    window.handleDateInputChange = handleDateInputChange;
    window.handleNewDateInput = handleNewDateInput;

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePage);
    } else {
        // DOM already loaded
        initializePage();
    }

})();

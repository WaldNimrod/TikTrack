/**
 * Date Range Picker Service - TikTrack
 * =====================================
 * 
 * General service for date range picker component with preset options and custom date selection.
 * Uses HTML5 native date picker (input type="date") with calendar UI.
 * 
 * Features:
 * - Preset date ranges (today, yesterday, this week, this month, etc.)
 * - Custom date range selection with two date inputs
 * - Integration with DataCollectionService
 * - Automatic value formatting and parsing
 * 
 * Documentation: See documentation/frontend/GENERAL_SYSTEMS_LIST.md
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */


// ===== FUNCTION INDEX =====

// === UI Functions ===
// - updateDisplayAndTrigger() - Updatedisplayandtrigger

(function() {
    'use strict';

    /**
     * Date Range Picker Service
     */
    class DateRangePickerService {
        /**
         * Render date range picker HTML
         * 
         * @param {Object} config - Configuration object
         * @param {string} config.id - Unique ID for the picker container (required)
         * @param {string} config.label - Label for the date range field
         * @param {string} config.fromFieldId - ID for "from date" input (default: {id}_from)
         * @param {string} config.toFieldId - ID for "to date" input (default: {id}_to)
         * @param {string} config.presetFieldId - ID for preset select (default: {id}_preset)
         * @param {boolean} config.required - Whether field is required
         * @param {string} config.defaultValue - Default value (preset name or date range string "YYYY-MM-DD - YYYY-MM-DD")
         * @param {Array<string>} config.availablePresets - Available preset options (default: all)
         * @param {Function} config.onChange - Callback function when range changes (receives {preset, fromDate, toDate, rangeString})
         * @param {string} config.containerClass - Additional CSS classes for container
         * @returns {string} HTML string for date range picker
         */
        static render(config = {}) {
            const {
                id,
                label = 'טווח תאריכים',
                fromFieldId = `${id}_from`,
                toFieldId = `${id}_to`,
                presetFieldId = `${id}_preset`,
                required = false,
                defaultValue = '',
                availablePresets = null, // null = all presets
                onChange = null,
                containerClass = ''
            } = config;

            if (!id) {
                console.error('DateRangePickerService.render: id is required');
                return '';
            }

            // Default presets (same as header system)
            const allPresets = [
                { value: 'כל זמן', label: 'כל זמן' },
                { value: 'היום', label: 'היום' },
                { value: 'אתמול', label: 'אתמול' },
                { value: 'השבוע', label: 'השבוע' },
                { value: 'שבוע', label: 'שבוע (7 ימים)' },
                { value: 'שבוע קודם', label: 'שבוע שעבר' },
                { value: 'החודש', label: 'החודש' },
                { value: 'חודש', label: 'חודש (30 יום)' },
                { value: 'חודש קודם', label: 'חודש קודם' },
                { value: 'השנה', label: 'השנה' },
                { value: 'שנה', label: 'שנה (365 ימים)' },
                { value: 'שנה קודמת', label: 'שנה שעברה' },
                { value: 'מותאם אישית', label: 'מותאם אישית' }
            ];

            const presets = availablePresets 
                ? allPresets.filter(p => availablePresets.includes(p.value))
                : allPresets;

            // Parse default value
            let defaultPreset = '';
            let defaultFromDate = '';
            let defaultToDate = '';
            
            if (defaultValue) {
                // Check if it's a preset
                const isPreset = presets.some(p => p.value === defaultValue);
                if (isPreset) {
                    defaultPreset = defaultValue;
                } else if (defaultValue.includes(' - ')) {
                    // Parse date range string "YYYY-MM-DD - YYYY-MM-DD"
                    const parts = defaultValue.split(' - ').map(s => s.trim());
                    if (parts.length === 2) {
                        defaultPreset = 'מותאם אישית';
                        defaultFromDate = parts[0];
                        defaultToDate = parts[1];
                    }
                }
            }

            const requiredStar = required ? '<span class="text-danger">*</span>' : '';
            
            return `
                <div class="date-range-picker-container ${containerClass}" data-date-range-picker-id="${id}">
                    <label class="form-label">
                        ${label} ${requiredStar}
                    </label>
                    
                    <!-- Preset Select -->
                    <div class="mb-2">
                        <select class="form-select date-range-preset-select" 
                                id="${presetFieldId}" 
                                data-from-field="${fromFieldId}" 
                                data-to-field="${toFieldId}"
                                ${required ? 'required' : ''}>
                            ${presets.map(preset => `
                                <option value="${preset.value}" ${preset.value === defaultPreset ? 'selected' : ''}>
                                    ${preset.label}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <!-- Custom Date Inputs (hidden by default, shown when "מותאם אישית" is selected) -->
                    <div class="custom-date-range-inputs" 
                         id="${id}_custom_inputs" 
                         style="display: ${defaultPreset === 'מותאם אישית' ? 'block' : 'none'};">
                        <div class="row g-2">
                            <div class="col-md-6">
                                <label for="${fromFieldId}" class="form-label form-label-small">מתאריך</label>
                                <input type="date" 
                                       class="form-control form-control-sm" 
                                       id="${fromFieldId}" 
                                       name="${fromFieldId}"
                                       value="${defaultFromDate}">
                            </div>
                            <div class="col-md-6">
                                <label for="${toFieldId}" class="form-label form-label-small">עד תאריך</label>
                                <input type="date" 
                                       class="form-control form-control-sm" 
                                       id="${toFieldId}" 
                                       name="${toFieldId}"
                                       value="${defaultToDate}">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Display selected range -->
                    <div class="date-range-display mt-2 text-muted small" id="${id}_display"></div>
                </div>
            `;
        }

        /**
         * Initialize date range picker after rendering
         * Sets up event listeners and initializes display
         * 
         * @param {string} id - Picker container ID
         * @param {Function} onChange - Optional callback function
         */
        static initialize(id, onChange = null) {
            const container = document.querySelector(`[data-date-range-picker-id="${id}"]`);
            if (!container) {
                console.warn(`DateRangePickerService.initialize: Container with id "${id}" not found`);
                return;
            }

            const presetSelect = container.querySelector('.date-range-preset-select');
            const fromInput = container.querySelector('input[id$="_from"]');
            const toInput = container.querySelector('input[id$="_to"]');
            const customInputs = container.querySelector('.custom-date-range-inputs');
            const displayDiv = container.querySelector('.date-range-display');

            if (!presetSelect || !customInputs) {
                console.warn('DateRangePickerService.initialize: Required elements not found');
                return;
            }

            // Update display and trigger onChange
            const updateDisplayAndTrigger = () => {
                const preset = presetSelect.value;
                const fromDate = fromInput?.value || '';
                const toDate = toInput?.value || '';
                
                // Show/hide custom inputs
                if (preset === 'מותאם אישית') {
                    customInputs.style.display = 'block';
                } else {
                    customInputs.style.display = 'none';
                }

                // Update display
                if (displayDiv) {
                    const rangeString = this.getRangeString(id);
                    displayDiv.textContent = rangeString || '';
                }

                // Call onChange callback
                if (onChange && typeof onChange === 'function') {
                    const range = this.getRange(id);
                    onChange({
                        preset,
                        fromDate: range.fromDate || null,
                        toDate: range.toDate || null,
                        rangeString: this.getRangeString(id),
                        ...range
                    });
                }
            };

            // Preset change handler
            presetSelect.addEventListener('change', () => {
                const preset = presetSelect.value;
                
                if (preset === 'מותאם אישית') {
                    customInputs.style.display = 'block';
                    // Set default dates if empty (7 days ago to today)
                    if (fromInput && !fromInput.value) {
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        fromInput.value = weekAgo.toISOString().split('T')[0];
                    }
                    if (toInput && !toInput.value) {
                        const today = new Date();
                        toInput.value = today.toISOString().split('T')[0];
                    }
                } else {
                    customInputs.style.display = 'none';
                    // Clear custom dates when preset is selected
                    if (fromInput) fromInput.value = '';
                    if (toInput) toInput.value = '';
                }
                
                updateDisplayAndTrigger();
            });

            // Custom date change handlers
            if (fromInput) {
                fromInput.addEventListener('change', () => {
                    if (presetSelect.value !== 'מותאם אישית') {
                        presetSelect.value = 'מותאם אישית';
                    }
                    updateDisplayAndTrigger();
                });
            }

            if (toInput) {
                toInput.addEventListener('change', () => {
                    if (presetSelect.value !== 'מותאם אישית') {
                        presetSelect.value = 'מותאם אישית';
                    }
                    updateDisplayAndTrigger();
                });
            }

            // Initial display update
            updateDisplayAndTrigger();
        }

        /**
         * Get date range values
         * 
         * @param {string} id - Picker container ID
         * @returns {Object} Range object with {preset, fromDate, toDate, start, end}
         */
        static getRange(id) {
            const container = document.querySelector(`[data-date-range-picker-id="${id}"]`);
            if (!container) {
                return { preset: null, fromDate: null, toDate: null, start: null, end: null };
            }

            const presetSelect = container.querySelector('.date-range-preset-select');
            const fromInput = container.querySelector('input[id$="_from"]');
            const toInput = container.querySelector('input[id$="_to"]');

            if (!presetSelect) {
                return { preset: null, fromDate: null, toDate: null, start: null, end: null };
            }

            const preset = presetSelect.value;

            // If custom range
            if (preset === 'מותאם אישית' && fromInput && toInput) {
                const fromDate = fromInput.value;
                const toDate = toInput.value;
                
                if (fromDate && toDate) {
                    const start = new Date(fromDate);
                    const end = new Date(toDate);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    return {
                        preset: 'מותאם אישית',
                        fromDate,
                        toDate,
                        start,
                        end
                    };
                }
            }

            // Use translateDateRangeToDates if available
            if (window.translateDateRangeToDates && typeof window.translateDateRangeToDates === 'function') {
                const range = window.translateDateRangeToDates(preset);
                if (range) {
                    let start = null;
                    let end = null;
                    
                    // Handle DateEnvelope objects
                    if (range.startDate) {
                        if (typeof range.startDate === 'object' && (range.startDate.epochMs || range.startDate.utc)) {
                            start = range.startDate.epochMs ? new Date(range.startDate.epochMs) : new Date(range.startDate.utc);
                        } else {
                            start = new Date(range.startDate);
                        }
                        start.setHours(0, 0, 0, 0);
                    }
                    
                    if (range.endDate) {
                        if (typeof range.endDate === 'object' && (range.endDate.epochMs || range.endDate.utc)) {
                            end = range.endDate.epochMs ? new Date(range.endDate.epochMs) : new Date(range.endDate.utc);
                        } else {
                            end = new Date(range.endDate);
                        }
                        end.setHours(23, 59, 59, 999);
                    } else {
                        const today = new Date();
                        today.setHours(23, 59, 59, 999);
                        end = today;
                    }
                    
                    return {
                        preset,
                        fromDate: start ? start.toISOString().split('T')[0] : null,
                        toDate: end ? end.toISOString().split('T')[0] : null,
                        start,
                        end
                    };
                }
            }

            return { preset, fromDate: null, toDate: null, start: null, end: null };
        }

        /**
         * Get date range as string (for form submission)
         * 
         * @param {string} id - Picker container ID
         * @returns {string} Range string "YYYY-MM-DD - YYYY-MM-DD" or preset name
         */
        static getRangeString(id) {
            const range = this.getRange(id);
            
            if (range.preset === 'מותאם אישית' && range.fromDate && range.toDate) {
                return `${range.fromDate} - ${range.toDate}`;
            }
            
            if (range.fromDate && range.toDate) {
                return `${range.fromDate} - ${range.toDate}`;
            }
            
            return range.preset || '';
        }

        /**
         * Set date range value
         * 
         * @param {string} id - Picker container ID
         * @param {string} value - Preset name or date range string "YYYY-MM-DD - YYYY-MM-DD"
         */
        static setValue(id, value) {
            const container = document.querySelector(`[data-date-range-picker-id="${id}"]`);
            if (!container || !value) return;

            const presetSelect = container.querySelector('.date-range-preset-select');
            const fromInput = container.querySelector('input[id$="_from"]');
            const toInput = container.querySelector('input[id$="_to"]');

            if (!presetSelect) return;

            // Check if it's a preset
            const isPreset = Array.from(presetSelect.options).some(opt => opt.value === value);
            if (isPreset) {
                presetSelect.value = value;
                presetSelect.dispatchEvent(new Event('change'));
                return;
            }

            // Parse date range string
            if (value.includes(' - ')) {
                const parts = value.split(' - ').map(s => s.trim());
                if (parts.length === 2 && fromInput && toInput) {
                    presetSelect.value = 'מותאם אישית';
                    fromInput.value = parts[0];
                    toInput.value = parts[1];
                    presetSelect.dispatchEvent(new Event('change'));
                }
            }
        }
    }

    // Export to global scope
    window.DateRangePickerService = DateRangePickerService;

})();

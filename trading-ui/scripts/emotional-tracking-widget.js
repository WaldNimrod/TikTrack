/**
 * Emotional Tracking Widget - Emotional tracking widget
 * 
 * This file handles the emotional tracking widget functionality for the mockup.
 * 
 * Documentation: See documentation/frontend/EMOTIONAL_TRACKING_WIDGET_DEVELOPER_GUIDE.md
 * 
 * @version 2.0.0
 * @lastUpdated 2025-01-29
 */

(function() {
    'use strict';

    // Global state
    let emotionalPatternsChart = null;
    let emotionalPatternsSeries = null;
    let selectedEmotion = null;
    let mockEmotionalEntries = [];

    // Emotion types mapping
    const EMOTION_TYPES = {
        happy: { he: 'שמח', icon: 'mood-happy', color: '#4CAF50' },
        satisfied: { he: 'מרוצה', icon: 'mood-smile', color: '#8BC34A' },
        neutral: { he: 'ניטרלי', icon: 'mood-neutral', color: '#9E9E9E' },
        sad: { he: 'עצוב', icon: 'mood-sad', color: '#2196F3' },
        angry: { he: 'כועס', icon: 'mood-angry', color: '#F44336' },
        confused: { he: 'מבולבל', icon: 'mood-confused', color: '#FF9800' },
        stressed: { he: 'מתוח', icon: 'mood-stressed', color: '#E91E63' }
    };

    // Fallback icons for emotions (using Tabler icons)
    const EMOTION_ICON_FALLBACKS = {
        happy: 'check',           // ✓ for positive
        satisfied: 'check',        // ✓ for positive
        neutral: 'minus',          // - for neutral
        sad: 'x',                  // ✗ for negative
        angry: 'alert-triangle',   // ⚠ for warning
        confused: 'note',           // ℹ for info (note is fallback for info-circle)
        stressed: 'bolt'           // ⚡ for stress
    };

    /**
     * Initialize Header System
     */
    async function initializeHeader() {
        // Wait for HeaderSystem to be available
        if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
            try {
                await window.HeaderSystem.initialize();
                if (window.Logger) {
                    window.Logger.info('✅ Header System initialized', { page: 'emotional-tracking-widget' });
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('Error initializing Header System', { 
                        page: 'emotional-tracking-widget', 
                        error 
                    });
                }
            }
        } else {
            // Retry after a short delay if HeaderSystem not loaded yet
            setTimeout(() => {
                if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
                    window.HeaderSystem.initialize().catch((error) => {
                        if (window.Logger) {
                            window.Logger.error('Error initializing Header System (retry)', { 
                                page: 'emotional-tracking-widget', 
                                error 
                            });
                        }
                    });
                } else {
                    if (window.Logger) {
                        window.Logger.warn('HeaderSystem not available after retry', { page: 'emotional-tracking-widget' });
                    }
                }
            }, 500);
        }
    }

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
     * Initialize Emotional Patterns Chart
     * Creates a bar chart showing emotion distribution
     */
    async function initEmotionalPatternsChart() {
        const container = document.getElementById('emotionalPatternsChartContainer');
        if (!container) {
            if (window.Logger) {
                window.Logger.warn('Emotional patterns chart container not found', { page: 'emotional-tracking-widget' });
            }
            return;
        }

        // Check if TradingViewChartAdapter is available
        if (typeof window.TradingViewChartAdapter === 'undefined') {
            if (window.Logger) {
                window.Logger.warn('TradingViewChartAdapter not available, retrying...', { page: 'emotional-tracking-widget' });
            }
            // Retry after a delay
            setTimeout(initEmotionalPatternsChart, 500);
            return;
        }

        try {
            // Remove placeholder text
            const placeholder = container.querySelector('.chart-placeholder');
            if (placeholder) {
                placeholder.remove();
            }

            // Destroy existing chart if exists
            if (emotionalPatternsChart) {
                try {
                    emotionalPatternsChart.remove();
                } catch (e) {
                    // Ignore errors during cleanup
                }
                emotionalPatternsChart = null;
                emotionalPatternsSeries = null;
            }

            // Get container dimensions
            const containerWidth = container.clientWidth || 400;
            const containerHeight = 250; // Small chart height

            // Get theme colors
            const primaryColor = getCSSVariableValue('--primary-color', '#26baac');
            const textColor = getCSSVariableValue('--text-color', '#212529');
            const backgroundColor = getCSSVariableValue('--card-background', '#ffffff');
            const gridColor = getCSSVariableValue('--border-color', '#e0e0e0');

            // Create chart
            emotionalPatternsChart = window.TradingViewChartAdapter.createChart(container, {
                width: containerWidth,
                height: containerHeight,
                layout: {
                    textColor: textColor,
                    background: { type: 'solid', color: backgroundColor }
                },
                grid: {
                    vertLines: { color: gridColor, visible: true },
                    horzLines: { color: gridColor, visible: true }
                },
                timeScale: {
                    timeVisible: false,
                    secondsVisible: false,
                    borderVisible: false
                },
                rightPriceScale: {
                    visible: true,
                    borderVisible: false
                },
                leftPriceScale: {
                    visible: false
                },
                crosshair: {
                    mode: 0 // Hidden
                }
            });

            // Add bar series
            emotionalPatternsSeries = window.TradingViewChartAdapter.addBarSeries(emotionalPatternsChart, {
                upColor: primaryColor,
                downColor: primaryColor
            });

            // Generate mock data for emotion distribution
            const emotionData = generateEmotionChartData();

            // Set data
            emotionalPatternsSeries.setData(emotionData);

            // Fit content
            emotionalPatternsChart.timeScale().fitContent();

            if (window.Logger) {
                window.Logger.info('✅ Emotional patterns chart initialized', { page: 'emotional-tracking-widget' });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error initializing emotional patterns chart', { 
                    page: 'emotional-tracking-widget', 
                    error 
                });
            }
            // Show error message in container
            const container = document.getElementById('emotionalPatternsChartContainer');
            if (container) {
                container.innerHTML = '<div class="text-muted text-center p-3">שגיאה בטעינת הגרף</div>';
            }
        }
    }

    /**
     * Generate mock data for emotion chart
     * @returns {Array} Chart data array
     */
    function generateEmotionChartData() {
        const data = [];
        const today = new Date();
        
        // Generate data for last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Random emotion count for each day
            const emotionCount = Math.floor(Math.random() * 5) + 1;
            
            data.push({
                time: date.toISOString().split('T')[0],
                open: 0,
                high: emotionCount,
                low: 0,
                close: emotionCount
            });
        }
        
        return data;
    }

    /**
     * Update Recent Emotional Entries
     * Updates the list of recent emotional entries with mock data
     */
    async function updateRecentEntries() {
        const container = document.getElementById('recentEntriesContainer');
        if (!container) {
            return;
        }

        try {
            // Use existing mock entries if available, otherwise generate new ones
            let entries = mockEmotionalEntries;
            if (entries.length === 0) {
                entries = generateMockEmotionalEntries();
                mockEmotionalEntries = entries;
            }

            // Limit to 10 most recent entries
            entries = entries.slice(0, 10);

            // Clear container
            container.innerHTML = '';

            // Render entries
            for (const entry of entries) {
                const entryElement = await createEntryElement(entry);
                container.appendChild(entryElement);
            }

            if (window.Logger) {
                window.Logger.info('✅ Recent entries updated', { page: 'emotional-tracking-widget', count: entries.length });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error updating recent entries', { 
                    page: 'emotional-tracking-widget', 
                    error 
                });
            }
        }
    }

    /**
     * Generate mock emotional entries
     * @returns {Array} Array of emotional entry objects
     */
    function generateMockEmotionalEntries() {
        const entries = [];
        const today = new Date();
        const emotionKeys = Object.keys(EMOTION_TYPES);

        // Generate 10 entries
        for (let i = 0; i < 10; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(10 + Math.floor(Math.random() * 8));
            date.setMinutes(Math.floor(Math.random() * 60));

            const emotionKey = emotionKeys[Math.floor(Math.random() * emotionKeys.length)];
            const emotion = EMOTION_TYPES[emotionKey];
            const hasTrade = Math.random() > 0.3; // 70% chance of having a trade link

            entries.push({
                id: i + 1,
                emotion_type: emotionKey,
                emotion_display: emotion.he,
                recorded_at: date.toISOString(),
                notes: i % 3 === 0 ? 'טרייד מוצלח' : null,
                trade_id: hasTrade ? 123 + i : null,
                trade_display: hasTrade ? `Trade #${123 + i} - AAPL` : null,
                has_trade_link: hasTrade
            });
        }

        return entries;
    }

    /**
     * Create entry element for display
     * @param {Object} entry - Emotional entry object
     * @returns {HTMLElement} Entry element
     */
    async function createEntryElement(entry) {
        const item = document.createElement('div');
        item.className = 'list-group-item';

        // Get emotion icon
        const emotion = EMOTION_TYPES[entry.emotion_type];
        let iconHtml = '';
        
        // Use IconSystem if available
        const fallbackIcon = EMOTION_ICON_FALLBACKS[entry.emotion_type] || 'note';
        if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
            try {
                iconHtml = await window.IconSystem.renderIcon('button', fallbackIcon, { size: '16', alt: 'icon', class: 'icon' });
            } catch (error) {
                iconHtml = `<img src="../../images/icons/tabler/${fallbackIcon}.svg" width="16" height="16" alt="icon" class="icon">`;
            }
        } else {
            iconHtml = `<img src="../../images/icons/tabler/${fallbackIcon}.svg" width="16" height="16" alt="icon" class="icon">`;
        }

        // Format date
        let dateDisplay = '-';
        if (entry.recorded_at) {
            if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                dateDisplay = window.FieldRendererService.renderDate(entry.recorded_at, true);
            } else if (window.dateUtils && typeof window.dateUtils.formatDateTime === 'function') {
                dateDisplay = window.dateUtils.formatDateTime(entry.recorded_at);
            } else if (window.formatDateTime) {
                dateDisplay = window.formatDateTime(entry.recorded_at);
            } else {
                const date = new Date(entry.recorded_at);
                dateDisplay = date.toLocaleString('he-IL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        }

        // Build HTML
        item.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    ${iconHtml}
                    <strong>${entry.emotion_display}</strong>
                    <span class="text-muted ms-2">${dateDisplay}</span>
                </div>
                <small class="text-muted">${entry.has_trade_link ? entry.trade_display : 'ללא קישור'}</small>
            </div>
        `;

        return item;
    }

    /**
     * Update Insights
     * Updates the insights section with mock data
     */
    async function updateInsights() {
        const container = document.getElementById('insightsContainer');
        if (!container) {
            return;
        }

        try {
            // Generate mock insights
            const insights = generateMockInsights();

            // Clear container
            container.innerHTML = '';

            // Render insights
            for (const insight of insights) {
                const insightElement = await createInsightElement(insight);
                container.appendChild(insightElement);
            }

            if (window.Logger) {
                window.Logger.info('✅ Insights updated', { page: 'emotional-tracking-widget', count: insights.length });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error updating insights', { 
                    page: 'emotional-tracking-widget', 
                    error 
                });
            }
        }
    }

    /**
     * Generate mock insights
     * @returns {Array} Array of insight objects
     */
    function generateMockInsights() {
        return [
            {
                type: 'insight',
                severity: 'info',
                title: 'תובנה',
                message: 'אתה נוטה להיות מרוצה יותר בטריידים עם תוכנית (70% מהמקרים).',
                icon: 'note'
            },
            {
                type: 'pattern',
                severity: 'warning',
                title: 'דפוס',
                message: 'רמת מתח גבוהה יותר בטריידים של יום (day trading).',
                icon: 'alert-triangle'
            }
        ];
    }

    /**
     * Create insight element for display
     * @param {Object} insight - Insight object
     * @returns {HTMLElement} Insight element
     */
    async function createInsightElement(insight) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${insight.severity}`;

        // Get icon - use IconSystem if available
        let iconHtml = `<img src="../../images/icons/tabler/${insight.icon}.svg" width="16" height="16" alt="${insight.icon}" class="icon">`;
        if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
            try {
                iconHtml = await window.IconSystem.renderIcon('button', insight.icon, { size: '16', alt: insight.icon, class: 'icon' });
            } catch (error) {
                // Fallback already set
            }
        }

        alert.innerHTML = `
            ${iconHtml}
            <strong>${insight.title}:</strong> ${insight.message}
        `;

        return alert;
    }

    /**
     * Setup Quick Entry Form
     * Sets up event handlers for the quick entry form
     */
    async function setupQuickEntryForm() {
        // Setup emotion buttons with icons
        const emotionButtons = document.querySelectorAll('.emotion-button');
        for (const button of emotionButtons) {
            const emotionKey = button.getAttribute('data-emotion');
            const emotion = EMOTION_TYPES[emotionKey];
            
            if (emotion) {
                // Add icon to button - use relative path for mockup pages
                const iconSpan = button.querySelector('.emotion-icon');
                if (iconSpan) {
                    const fallbackIcon = EMOTION_ICON_FALLBACKS[emotionKey] || 'note';
                    // Render icon using IconSystem
                    let iconHTML = `<img src="../../images/icons/tabler/${fallbackIcon}.svg" width="16" height="16" alt="icon" class="icon">`;
                    if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
                        try {
                            iconHTML = await window.IconSystem.renderIcon('button', fallbackIcon, { size: '16', alt: 'icon', class: 'icon' });
                        } catch (error) {
                            // Fallback already set
                        }
                    }
                    iconSpan.innerHTML = iconHTML;
                }
            }

            button.addEventListener('click', function() {
                // Remove active class from all buttons
                emotionButtons.forEach(btn => btn.classList.remove('active', 'btn-primary'));
                emotionButtons.forEach(btn => btn.classList.add('btn-outline-secondary'));

                // Add active class to clicked button
                this.classList.add('active', 'btn-primary');
                this.classList.remove('btn-outline-secondary');

                // Store selected emotion
                const emotionKey = this.getAttribute('data-emotion');
                selectedEmotion = emotionKey;

                if (window.Logger) {
                    window.Logger.info('Emotion selected', { 
                        page: 'emotional-tracking-widget', 
                        emotion: selectedEmotion 
                    });
                }
            });
        });

        // Setup save button
        const saveButton = document.querySelector('#saveEmotionButton');
        if (saveButton) {
            saveButton.addEventListener('click', function() {
                handleSaveEmotion();
            });
        }

        // Setup ADD button (from Button System)
        const addButton = document.querySelector('[data-button-type="ADD"]');
        if (addButton) {
            addButton.addEventListener('click', function() {
                // Scroll to form or focus on first input
                const form = document.querySelector('.card-body');
                if (form) {
                    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }
    }

    /**
     * Handle Save Emotion
     * Handles saving a new emotional entry (mock - no API call)
     */
    async function handleSaveEmotion() {
        if (!selectedEmotion) {
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('נא לבחור רגש/תחושה', 'תיעוד רגשי');
            }
            return;
        }

        const tradeSelect = document.getElementById('linkedTradeEmotion');
        const notesTextarea = document.getElementById('emotionNotes');
        const tradeId = tradeSelect ? tradeSelect.value : null;
        const notes = notesTextarea ? notesTextarea.value.trim() : null;

        // Create new entry
        const newEntry = {
            id: mockEmotionalEntries.length + 1,
            emotion_type: selectedEmotion,
            emotion_display: EMOTION_TYPES[selectedEmotion].he,
            recorded_at: new Date().toISOString(),
            notes: notes || null,
            trade_id: tradeId ? parseInt(tradeId) : null,
            trade_display: tradeId ? tradeSelect.options[tradeSelect.selectedIndex].text : null,
            has_trade_link: !!tradeId
        };

        // Add to mock entries (prepend)
        mockEmotionalEntries.unshift(newEntry);

        // Show success notification
        if (window.NotificationSystem) {
            window.NotificationSystem.showSuccess('תיעוד נשמר בהצלחה', 'תיעוד רגשי');
        }

        // Reset form
        selectedEmotion = null;
        const emotionButtons = document.querySelectorAll('.emotion-button');
        emotionButtons.forEach(btn => {
            btn.classList.remove('active', 'btn-primary');
            btn.classList.add('btn-outline-secondary');
        });

        // Use DataCollectionService to clear fields if available
        if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
          if (tradeSelect) window.DataCollectionService.setValue(tradeSelect.id, '', 'text');
          if (notesTextarea) window.DataCollectionService.setValue(notesTextarea.id, '', 'text');
        } else {
          if (tradeSelect) tradeSelect.value = '';
          if (notesTextarea) notesTextarea.value = '';
        }

        // Update UI
        await updateRecentEntries();
        updateEmotionalPatternsChart();

        if (window.Logger) {
            window.Logger.info('Emotional entry saved', { 
                page: 'emotional-tracking-widget', 
                entry: newEntry 
            });
        }
    }

    /**
     * Update Emotional Patterns Chart
     * Updates the chart with current data
     */
    function updateEmotionalPatternsChart() {
        if (!emotionalPatternsChart || !emotionalPatternsSeries) {
            return;
        }

        try {
            const emotionData = generateEmotionChartData();
            emotionalPatternsSeries.setData(emotionData);
            emotionalPatternsChart.timeScale().fitContent();

            if (window.Logger) {
                window.Logger.info('Chart updated', { page: 'emotional-tracking-widget' });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error updating chart', { 
                    page: 'emotional-tracking-widget', 
                    error 
                });
            }
        }
    }

    /**
     * Setup mockup notice icon
     */
    async function setupMockupNotice() {
        const noticeIcon = document.querySelector('.mockup-notice-icon');
        if (noticeIcon) {
            // Render icon using IconSystem
            let iconHTML = `<img src="../../images/icons/tabler/note.svg" width="16" height="16" alt="icon" class="icon">`;
            if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
                try {
                    iconHTML = await window.IconSystem.renderIcon('button', 'note', { size: '16', alt: 'icon', class: 'icon' });
                } catch (error) {
                    // Fallback already set
                }
            }
            noticeIcon.innerHTML = iconHTML;
        }
    }

    /**
     * Initialize all widgets
     */
    async function initializeWidgets() {
        try {
            // Setup mockup notice icon
            await setupMockupNotice();

            // Initialize chart
            await initEmotionalPatternsChart();

            // Update recent entries
            await updateRecentEntries();

            // Update insights
            await updateInsights();

            // Setup form
            await setupQuickEntryForm();

            if (window.Logger) {
                window.Logger.info('✅ All widgets initialized', { page: 'emotional-tracking-widget' });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error initializing widgets', { 
                    page: 'emotional-tracking-widget', 
                    error 
                });
            }
        }
    }

    /**
     * Initialize page
     */
    function initializePage() {
        // Initialize Header System first
        initializeHeader();
        
        // Wait for Preferences to be loaded
        if (window.PreferencesCore && typeof window.PreferencesCore.initializeWithLazyLoading === 'function') {
            window.PreferencesCore.initializeWithLazyLoading().catch((error) => {
                if (window.Logger) {
                    window.Logger.warn('Preferences initialization failed (non-critical)', { 
                        page: 'emotional-tracking-widget', 
                        error 
                    });
                }
            });
        }

        // Initialize widgets after a delay to ensure all systems are loaded
        setTimeout(() => {
            initializeWidgets();
        }, 1000);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePage);
    } else {
        // DOM already loaded
        initializePage();
    }

    // Export functions to window for debugging
    window.emotionalTrackingWidget = {
        getCSSVariableValue,
        initializeHeader,
        initializeWidgets,
        updateRecentEntries,
        updateInsights,
        updateEmotionalPatternsChart,
        handleSaveEmotion
    };

})();

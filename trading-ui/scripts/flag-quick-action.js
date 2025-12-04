/**
 * Flag Quick Action - TikTrack
 * ============================
 * 
 * Quick Action - פלטת דגלים
 * 
 * @file trading-ui/scripts/flag-quick-action.js
 * @version 1.0.0
 * @created 26 בנובמבר 2025
 * @author TikTrack Development Team
 * 
 * ===== FUNCTION INDEX =====
 * 
 * FLAG PALETTE (4)
 * - initializeFlagPalette() - אתחול פלטת דגלים
 * - showFlagPalette(itemId, position) - הצגת פלטת דגלים
 * - hideFlagPalette() - הסתרת פלטת דגלים
 * - setFlagColor(itemId, color) - הגדרת צבע דגל
 * 
 * UTILITIES (1)
 * - getFlagColors() - קבלת רשימת צבעי דגלים
 * 
 * ==========================================
 */

(function() {
    'use strict';

    const PAGE_NAME = 'flag-quick-action';
    const PAGE_LOG_CONTEXT = { page: PAGE_NAME };

    let currentItemId = null;
    let flagPaletteElement = null;

    // ===== FLAG COLORS =====

    /**
     * Get available flag colors
     * @returns {Array} Array of flag color objects
     */
    function getFlagColors() {
        return [
            { value: '#26baac', label: 'Trade', entityType: 'trade' },
            { value: '#0056b3', label: 'Trade Plan', entityType: 'trade_plan' },
            { value: '#28a745', label: 'Account', entityType: 'account' },
            { value: '#20c997', label: 'Cash Flow', entityType: 'cash_flow' },
            { value: '#dc3545', label: 'Ticker', entityType: 'ticker' },
            { value: '#fc5a06', label: 'Alert', entityType: 'alert' },
            { value: '#6f42c1', label: 'Note', entityType: 'note' },
            { value: '#17a2b8', label: 'Execution', entityType: 'execution' }
        ];
    }

    // ===== FLAG PALETTE =====

    /**
     * Initialize flag palette
     */
    function initializeFlagPalette() {
        // Setup flag color buttons
        const flagButtons = document.querySelectorAll('.flag-color-btn');
        flagButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = btn.getAttribute('data-color');
                if (color && currentItemId) {
                    setFlagColor(currentItemId, color);
                }
            });
        });

        // Setup remove flag button
        const removeBtn = document.querySelector('[data-onclick*="removeFlag"]');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                if (currentItemId) {
                    removeFlag(currentItemId);
                }
            });
        }

        window.Logger?.debug?.('✅ Flag palette initialized', PAGE_LOG_CONTEXT);
    }

    /**
     * Show flag palette
     * @param {number} itemId - Item ID
     * @param {Object} position - Position { x, y } or element
     */
    function showFlagPalette(itemId, position) {
        currentItemId = itemId;

        // Find or create palette element
        flagPaletteElement = document.querySelector('.flag-palette-popup');
        if (!flagPaletteElement) {
            // Create palette if doesn't exist
            flagPaletteElement = createFlagPaletteElement();
            document.body.appendChild(flagPaletteElement);
        }

        // Position palette
        if (position && position.element) {
            const rect = position.element.getBoundingClientRect();
            flagPaletteElement.style.position = 'absolute';
            flagPaletteElement.style.top = `${rect.bottom + 5}px`;
            flagPaletteElement.style.left = `${rect.left}px`;
        } else if (position && position.x && position.y) {
            flagPaletteElement.style.position = 'absolute';
            flagPaletteElement.style.top = `${position.y}px`;
            flagPaletteElement.style.left = `${position.x}px`;
        }

        flagPaletteElement.classList.remove('d-none');
        flagPaletteElement.style.display = 'block';

        // Update active state based on current flag
        updateActiveFlagState(itemId);

        window.Logger?.debug?.('🚩 Flag palette shown', { ...PAGE_LOG_CONTEXT, itemId });
    }

    /**
     * Hide flag palette
     */
    function hideFlagPalette() {
        if (flagPaletteElement) {
            flagPaletteElement.classList.add('d-none');
            flagPaletteElement.style.display = 'none';
        }
        currentItemId = null;
    }

    /**
     * Set flag color
     * @param {number} itemId - Item ID
     * @param {string} color - Flag color (hex)
     * @async
     */
    async function setFlagColor(itemId, color) {
        try {
            if (window.WatchListsUIService?.setFlag) {
                await window.WatchListsUIService.setFlag(itemId, color);
            } else if (window.WatchListsPage?.setFlag) {
                await window.WatchListsPage.setFlag(itemId, color);
            } else {
                window.Logger?.warn?.('⚠️ No flag setter available', PAGE_LOG_CONTEXT);
            }

            hideFlagPalette();

            window.Logger?.info?.('✅ Flag color set', { ...PAGE_LOG_CONTEXT, itemId, color });
        } catch (error) {
            window.Logger?.error?.('❌ Error setting flag color', { ...PAGE_LOG_CONTEXT, itemId, color, error: error?.message || error });
        }
    }

    /**
     * Remove flag
     * @param {number} itemId - Item ID
     * @async
     */
    async function removeFlag(itemId) {
        try {
            if (window.WatchListsUIService?.removeFlag) {
                await window.WatchListsUIService.removeFlag(itemId);
            } else if (window.WatchListsPage?.removeFlag) {
                await window.WatchListsPage.removeFlag(itemId);
            } else {
                window.Logger?.warn?.('⚠️ No flag remover available', PAGE_LOG_CONTEXT);
            }

            hideFlagPalette();

            window.Logger?.info?.('✅ Flag removed', { ...PAGE_LOG_CONTEXT, itemId });
        } catch (error) {
            window.Logger?.error?.('❌ Error removing flag', { ...PAGE_LOG_CONTEXT, itemId, error: error?.message || error });
        }
    }

    /**
     * Update active flag state
     * @param {number} itemId - Item ID
     */
    function updateActiveFlagState(itemId) {
        // Get current flag color for item (would need to fetch from data)
        // This is a placeholder
        const flagButtons = document.querySelectorAll('.flag-color-btn');
        flagButtons.forEach(btn => {
            btn.classList.remove('active');
        });
    }

    /**
     * Create flag palette element (if needed)
     * @returns {HTMLElement} Palette element
     */
    function createFlagPaletteElement() {
        const palette = document.createElement('div');
        palette.className = 'flag-palette-popup';
        const paletteHTML = `
            <div class="flag-palette-header">בחר צבע דגל</div>
            <div class="flag-palette-colors">
                ${getFlagColors().map(color => `
                    <button type="button"
                            class="flag-color-btn flag-color-btn-lg"
                            data-color="${color.value}"
                            data-bg-color="${color.value}"
                            title="${color.label}"
                            data-onclick="window.FlagQuickAction?.setFlagColor(${currentItemId}, '${color.value}')">
                    </button>
                `).join('')}
            </div>
            <div class="flag-palette-footer">
                <button type="button"
                        class="btn btn-sm btn-secondary w-100"
                        data-onclick="window.FlagQuickAction?.removeFlag(${currentItemId})">
                    הסר דגל
                </button>
            </div>
        `;
        palette.textContent = '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(paletteHTML, 'text/html');
        doc.body.childNodes.forEach(node => {
          palette.appendChild(node.cloneNode(true));
        });
        return palette;
    }

    // ===== INITIALIZATION =====

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFlagPalette);
    } else {
        initializeFlagPalette();
    }

    // Close palette on outside click
    document.addEventListener('click', (e) => {
        if (flagPaletteElement && !flagPaletteElement.contains(e.target) && !e.target.closest('.btn-flag')) {
            hideFlagPalette();
        }
    });

    // ===== GLOBAL EXPORTS =====

    window.FlagQuickAction = {
        init: initializeFlagPalette,
        show: showFlagPalette,
        hide: hideFlagPalette,
        setFlagColor,
        removeFlag,
        getFlagColors
    };

    // Individual function exports
    window.showFlagPalette = showFlagPalette;
    window.hideFlagPalette = hideFlagPalette;
    window.setFlagColor = setFlagColor;
    window.removeFlag = removeFlag;

    window.Logger?.info?.('✅ FlagQuickAction loaded successfully', PAGE_LOG_CONTEXT);

})();








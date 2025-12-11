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
// === Functions ===
// - createFlagPaletteElement() - Createflagpaletteelement
// - removeFlag() - Removeflag
// - updateActiveFlagState() - Updateactiveflagstate

(function() {
    'use strict';

    const PAGE_NAME = 'flag-quick-action';
    const PAGE_LOG_CONTEXT = { page: PAGE_NAME };

    let currentItemId = null;
    let flagPaletteElement = null;

    // ===== FLAG COLORS =====

    /**
     * Get available flag colors
     * Uses ColorSchemeSystem to get colors from user preferences (not hardcoded)
     * Falls back to default colors if ColorSchemeSystem not available
     * @returns {Array} Array of flag color objects with entityType and dynamic color values
     */
    function getFlagColors() {
        // Use UI Service if available (preferred - centralized logic)
        if (window.WatchListsUIService?.getFlagColors) {
            return window.WatchListsUIService.getFlagColors();
        }
        
        // Fallback: Use ColorSchemeSystem directly with defaults
        const flagTypes = [
            { entityType: 'trade', label: 'Trade' },
            { entityType: 'trade_plan', label: 'Trade Plan' },
            { entityType: 'account', label: 'Account' },
            { entityType: 'cash_flow', label: 'Cash Flow' },
            { entityType: 'ticker', label: 'Ticker' },
            { entityType: 'alert', label: 'Alert' },
            { entityType: 'note', label: 'Note' },
            { entityType: 'execution', label: 'Execution' }
        ];
        
        // Default colors (fallback if ColorSchemeSystem not available)
        const defaultColors = {
            'trade': '#26baac',
            'trade_plan': '#0056b3',
            'account': '#28a745',
            'cash_flow': '#20c997',
            'ticker': '#dc3545',
            'alert': '#fc5a06',
            'note': '#6f42c1',
            'execution': '#17a2b8'
        };
        
        return flagTypes.map(flag => {
            // Try to get color from ColorSchemeSystem first
            let color = null;
            if (window.getEntityColor && typeof window.getEntityColor === 'function') {
                color = window.getEntityColor(flag.entityType);
            }
            
            // Fallback to default color if ColorSchemeSystem not available or returned empty
            if (!color || color === '') {
                color = defaultColors[flag.entityType] || '#6c757d'; // Gray fallback
            }
            
            return {
                entityType: flag.entityType,
                label: flag.label,
                value: color // Always return a color
            };
        });
    }

    // ===== FLAG PALETTE =====

    /**
     * Initialize flag palette
     */
    function initializeFlagPalette() {
        // Setup flag color buttons
        const flagButtons = document.querySelectorAll('.flag-color-btn');
        flagButtons.forEach(btn => {
            // Ensure background color is set from data-color or data-bg-color
            const color = btn.getAttribute('data-color') || btn.getAttribute('data-bg-color');
            if (color && !btn.style.backgroundColor) {
                btn.style.backgroundColor = color;
            }
            
            btn.addEventListener('click', (e) => {
                const btnColor = btn.getAttribute('data-color') || btn.getAttribute('data-bg-color');
                const entityType = btn.getAttribute('data-entity-type');
                if (btnColor && currentItemId) {
                    setFlagColor(currentItemId, btnColor, entityType);
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
            // Ensure it's added to body (not inside any container)
            if (flagPaletteElement.parentNode !== document.body) {
                document.body.appendChild(flagPaletteElement);
            }
        } else {
            // If palette exists but not in body, move it
            if (flagPaletteElement.parentNode !== document.body) {
                document.body.appendChild(flagPaletteElement);
            }
        }
        
        // Ensure all color buttons have their background colors set (for dynamic colors)
        const flagButtons = flagPaletteElement.querySelectorAll('.flag-color-btn');
        flagButtons.forEach(btn => {
            const color = btn.getAttribute('data-color') || btn.getAttribute('data-bg-color');
            if (color) {
                btn.style.backgroundColor = color; // Set dynamic color from ColorSchemeSystem
            }
        });

        // Position palette using fixed positioning for better control
        const isRTL = document.documentElement.dir === 'rtl' || 
                     getComputedStyle(document.body).direction === 'rtl';
        
        if (position && position.element) {
            const rect = position.element.getBoundingClientRect();
            const viewportWidth = window.innerWidth || 1920;
            const viewportHeight = window.innerHeight || 1080;
            
            // Temporarily show to get dimensions (but keep it in viewport)
            flagPaletteElement.style.visibility = 'hidden';
            flagPaletteElement.style.display = 'block';
            flagPaletteElement.style.position = 'fixed';
            flagPaletteElement.style.left = '-9999px'; // Off-screen but still measurable
            flagPaletteElement.style.top = '0px';
            const paletteWidth = flagPaletteElement.offsetWidth || 250;
            const paletteHeight = flagPaletteElement.offsetHeight || 200;
            
            // Calculate position
            let left, top;
            
            // Horizontal positioning (RTL-aware)
            if (isRTL) {
                // RTL: try to open to the left (before button)
                const spaceOnLeft = rect.left;
                const spaceOnRight = viewportWidth - rect.right;
                
                if (spaceOnLeft >= paletteWidth) {
                    // Enough space on left
                    left = rect.left - paletteWidth - 5;
                } else if (spaceOnRight >= paletteWidth) {
                    // Not enough on left, use right
                    left = rect.right + 5;
                } else {
                    // Default: align with button left edge
                    left = Math.max(5, rect.left - paletteWidth + 20);
                }
            } else {
                // LTR: try to open to the right
                const spaceOnRight = viewportWidth - rect.right;
                const spaceOnLeft = rect.left;
                
                if (spaceOnRight >= paletteWidth) {
                    left = rect.right + 5;
                } else if (spaceOnLeft >= paletteWidth) {
                    left = rect.left - paletteWidth - 5;
                } else {
                    left = Math.max(5, rect.right - paletteWidth + 20);
                }
            }
            
            // Vertical positioning
            if (rect.bottom + paletteHeight + 5 <= viewportHeight) {
                // Enough space below
                top = rect.bottom + 5;
            } else if (rect.top - paletteHeight - 5 >= 0) {
                // Not enough below, try above
                top = rect.top - paletteHeight - 5;
            } else {
                // Default: center vertically in viewport, but ensure it's visible
                top = Math.max(10, Math.min(rect.bottom + 5, viewportHeight - paletteHeight - 10));
            }
            
            // Ensure palette is within viewport bounds
            top = Math.max(10, Math.min(top, viewportHeight - paletteHeight - 10));
            left = Math.max(10, Math.min(left, viewportWidth - paletteWidth - 10));
            
            flagPaletteElement.style.position = 'fixed';
            flagPaletteElement.style.left = `${left}px`;
            flagPaletteElement.style.top = `${top}px`;
            flagPaletteElement.style.visibility = 'visible';
            flagPaletteElement.style.zIndex = '1050';
        } else if (position && position.x && position.y) {
            // Use provided coordinates (already in viewport coordinates)
            flagPaletteElement.style.position = 'fixed';
            flagPaletteElement.style.left = `${position.x}px`;
            flagPaletteElement.style.top = `${position.y}px`;
            flagPaletteElement.style.zIndex = '1050';
        } else {
            // Fallback: center screen
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const paletteWidth = flagPaletteElement.offsetWidth || 250;
            const paletteHeight = flagPaletteElement.offsetHeight || 200;
            
            flagPaletteElement.style.position = 'fixed';
            flagPaletteElement.style.left = `${(viewportWidth - paletteWidth) / 2}px`;
            flagPaletteElement.style.top = `${(viewportHeight - paletteHeight) / 2}px`;
            flagPaletteElement.style.transform = 'none'; // Remove transform for fixed positioning
            flagPaletteElement.style.zIndex = '1050';
        }

        // Ensure palette is visible and in DOM
        if (flagPaletteElement.parentNode !== document.body) {
            document.body.appendChild(flagPaletteElement);
        }
        
        flagPaletteElement.classList.remove('d-none');
        flagPaletteElement.style.display = 'block';
        flagPaletteElement.style.visibility = 'visible';
        flagPaletteElement.style.opacity = '1';
        
        // Force reflow to ensure positioning is applied
        void flagPaletteElement.offsetHeight;

        // Update active state based on current flag
        updateActiveFlagState(itemId);

        window.Logger?.debug?.('🚩 Flag palette shown', { ...PAGE_LOG_CONTEXT, itemId, 
            position: flagPaletteElement.style.position,
            left: flagPaletteElement.style.left,
            top: flagPaletteElement.style.top,
            display: flagPaletteElement.style.display,
            visibility: flagPaletteElement.style.visibility,
            offsetParent: flagPaletteElement.offsetParent !== null
        });
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
     * @param {string} color - Flag color (hex) - from ColorSchemeSystem (respects user preferences)
     * @param {string} entityType - Optional entity type (trade, trade_plan, etc.) - constant identifier
     * @async
     */
    async function setFlagColor(itemId, color, entityType = null) {
        try {
            // If entityType not provided, find it from color
            if (!entityType && color) {
                const flagColors = getFlagColors();
                const flagColor = flagColors.find(fc => fc.value === color);
                if (flagColor) {
                    entityType = flagColor.entityType;
                }
            }
            
            if (window.WatchListsUIService?.setFlag) {
                await window.WatchListsUIService.setFlag(itemId, color, entityType);
            } else if (window.WatchListsPage?.setFlag) {
                await window.WatchListsPage.setFlag(itemId, color, entityType);
            } else {
                window.Logger?.warn?.('⚠️ No flag setter available', PAGE_LOG_CONTEXT);
            }

            hideFlagPalette();

            window.Logger?.info?.('✅ Flag color set', { ...PAGE_LOG_CONTEXT, itemId, color, entityType });
        } catch (error) {
            window.Logger?.error?.('❌ Error setting flag color', { ...PAGE_LOG_CONTEXT, itemId, color, entityType, error: error?.message || error });
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
                            style="background-color: ${color.value}; width: 32px; height: 32px; border: 2px solid transparent; border-radius: 4px; cursor: pointer; transition: all 0.2s;"
                            data-color="${color.value}"
                            data-bg-color="${color.value}"
                            data-entity-type="${color.entityType || ''}"
                            title="${color.label}"
                            data-onclick="window.FlagQuickAction?.setFlagColor(${currentItemId}, '${color.value}', '${color.entityType || ''}')">
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








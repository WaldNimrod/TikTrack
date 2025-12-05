/**
 * Mockups Icon Initializer
 * ========================
 * 
 * Initializes icons in mockup pages by replacing icon placeholders
 * with IconSystem.renderIcon() output
 * 
 * Usage: Add this script to mockup pages after IconSystem is loaded
 */

(function() {
    'use strict';

    /**
     * Initialize icons by replacing placeholders with IconSystem output
     * @returns {Promise<void>}
     */
    async function initializeIcons() {
        // Wait for IconSystem to be available
        if (typeof window.IconSystem === 'undefined') {
            // Retry after a short delay
            setTimeout(initializeIcons, 100);
            return;
        }

        // Wait for IconSystem to be initialized
        if (!window.IconSystem.initialized) {
            await window.IconSystem.initialize();
        }

        // Find all icon placeholders
        const placeholders = document.querySelectorAll('.icon-placeholder[data-icon]');
        
        if (placeholders.length === 0) {
            return; // No icons to initialize
        }

        // Process each placeholder
        for (const placeholder of placeholders) {
            // Check if placeholder is still in DOM
            if (!placeholder.parentNode || !document.contains(placeholder)) {
                continue;
            }

            const iconName = placeholder.getAttribute('data-icon');
            const size = placeholder.getAttribute('data-size') || '16';
            const alt = placeholder.getAttribute('data-alt') || iconName;
            const className = placeholder.className.replace('icon-placeholder', '').trim() || 'icon';

            if (!iconName) {
                continue;
            }

            try {
                // Determine icon type (default to 'button' for Tabler icons)
                // If icon name contains entity types, use 'entity'
                // Special cases: Tabler icons that contain entity type names but are not entity icons
                const tablerIconExceptions = ['notebook', 'alert-circle', 'alert-triangle', 'alert-circle-filled', 'alert-triangle-filled'];
                const entityTypes = ['trade', 'execution', 'ticker', 'account', 'note', 'cash_flow', 'trade_plan', 'alert'];
                const isEntityIcon = entityTypes.some(type => iconName.includes(type)) && !tablerIconExceptions.includes(iconName);
                const iconType = isEntityIcon ? 'entity' : 'button';

                // Render icon using IconSystem
                const iconHTML = await window.IconSystem.renderIcon(iconType, iconName, {
                    size: size,
                    alt: alt,
                    class: className
                });

                // Replace placeholder with rendered icon
                if (placeholder.parentNode && document.contains(placeholder)) {
                    placeholder.outerHTML = iconHTML;
                }
            } catch (error) {
                // Fallback: try to use img tag with path
                if (placeholder.parentNode && document.contains(placeholder)) {
                    const fallbackPath = `../../images/icons/tabler/${iconName}.svg`;
                    placeholder.outerHTML = `<img src="${fallbackPath}" width="${size}" height="${size}" alt="${alt}" class="${className}" onerror="this.style.display='none'">`;
                }

                // Log error if Logger is available
                if (typeof window.Logger !== 'undefined') {
                    window.Logger.warn('Failed to render icon', {
                        icon: iconName,
                        error: error.message,
                        page: window.location.pathname.split('/').pop()
                    });
                }
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Wait for IconSystem to be ready
            setTimeout(initializeIcons, 100);
        });
    } else {
        // DOM already loaded, wait a bit for IconSystem
        setTimeout(initializeIcons, 100);
    }

    // Also initialize after delays to catch dynamically added icons
    setTimeout(initializeIcons, 500);
    setTimeout(initializeIcons, 1000);
    setTimeout(initializeIcons, 2000);

    // Export function for manual initialization
    window.initializeIcons = initializeIcons;
})();



/**
 * Icon Replacement Helper
 * =======================
 * 
 * פונקציה כללית להחלפת איקונים ב-HTML ובקבצי JS
 * משתמשת ב-IconSystem.renderIcon() להחלפת כל השימושים הישירים
 * 
 * Related Documentation:
 * - documentation/frontend/ICON_SYSTEM_GUIDE.md
 * 
 * Author: TikTrack Development Team
 * Version: 1.0.0
 * Last Updated: 2025-01-12
 */

/**
 * Replace all <img> tags with icons using IconSystem
 * @param {HTMLElement|Document} context - Element or document to search within
 * @param {Object} options - Replacement options
 * @returns {Promise<void>}
 */
async function replaceIconsInContext(context = document, options = {}) {
    if (!window.IconSystem || !window.IconSystem.initialized) {
        // Wait for IconSystem to be ready
        if (window.IconSystem && typeof window.IconSystem.initialize === 'function') {
            await window.IconSystem.initialize();
        } else {
            // Retry after delay
            setTimeout(() => replaceIconsInContext(context, options), 500);
            return;
        }
    }

    // Icon mapping: img src path -> IconSystem type and name
    const iconMappings = {
        // Entity icons
        'home.svg': { type: 'entity', name: 'home' },
        'executions.svg': { type: 'entity', name: 'execution' },
        'trades.svg': { type: 'entity', name: 'trade' },
        'trade_plans.svg': { type: 'entity', name: 'trade_plan' },
        'trading_accounts.svg': { type: 'entity', name: 'account' },
        'tickers.svg': { type: 'entity', name: 'ticker' },
        'alerts.svg': { type: 'entity', name: 'alert' },
        'cash_flows.svg': { type: 'entity', name: 'cash_flow' },
        'notes.svg': { type: 'entity', name: 'note' },
        'preferences.svg': { type: 'entity', name: 'preference' },
        'research.svg': { type: 'entity', name: 'research' },
        'user.svg': { type: 'entity', name: 'user' },
        
        // Button icons (Tabler)
        'info-circle.svg': { type: 'button', name: 'info-circle' },
        'x.svg': { type: 'button', name: 'close' },
        'alert-triangle.svg': { type: 'button', name: 'warning' },
        'loader.svg': { type: 'button', name: 'loader' },
        'refresh.svg': { type: 'button', name: 'refresh' },
        'sliders.svg': { type: 'button', name: 'sliders' },
        'layers.svg': { type: 'button', name: 'layers' },
        'terminal.svg': { type: 'button', name: 'terminal' },
        'clock-history.svg': { type: 'button', name: 'clock-history' },
        'filter.svg': { type: 'button', name: 'filter' },
        'search.svg': { type: 'button', name: 'search' },
        'settings.svg': { type: 'button', name: 'menu' },
        'check.svg': { type: 'button', name: 'check' },
        'trash.svg': { type: 'button', name: 'delete' }
    };

    // Find all img tags with icon paths (both absolute and relative)
    const imgTags = context.querySelectorAll('img[src*="/trading-ui/images/icons/"], img[src*="images/icons/"]');
    
    for (const img of imgTags) {
        // Skip if already processed
        if (img.dataset.iconReplaced === 'true') {
            continue;
        }
        
        const src = img.getAttribute('src') || '';
        const alt = img.getAttribute('alt') || '';
        const size = img.getAttribute('width') || img.getAttribute('height') || '16';
        const className = img.getAttribute('class') || 'icon';
        const style = img.getAttribute('style') || '';
        
        // Extract icon name from path
        const iconFileName = src.split('/').pop();
        const mapping = iconMappings[iconFileName];
        
        if (mapping) {
            try {
                const iconHTML = await window.IconSystem.renderIcon(mapping.type, mapping.name, {
                    size: size,
                    alt: alt,
                    class: className,
                    style: style
                });
                
                // Replace img with rendered icon
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = iconHTML;
                const newIcon = tempDiv.firstElementChild;
                
                if (newIcon) {
                    // Preserve data attributes
                    Array.from(img.attributes).forEach(attr => {
                        if (attr.name.startsWith('data-')) {
                            newIcon.setAttribute(attr.name, attr.value);
                        }
                    });
                    newIcon.dataset.iconReplaced = 'true';
                    img.parentNode.replaceChild(newIcon, img);
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('Failed to render icon', { 
                        icon: iconFileName, 
                        error, 
                        context: context.tagName || 'document' 
                    });
                }
            }
        }
    }
}

/**
 * Replace icons in dynamically created HTML string
 * @param {string} htmlString - HTML string with img tags
 * @returns {Promise<string>} HTML string with replaced icons
 */
async function replaceIconsInHTMLString(htmlString) {
    if (!window.IconSystem || !window.IconSystem.initialized) {
        await window.IconSystem.initialize();
    }

    // Create a temporary container
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    
    // Replace icons in the temporary container
    await replaceIconsInContext(tempDiv);
    
    // Return the updated HTML
    return tempDiv.innerHTML;
}

// Export to global
window.replaceIconsInContext = replaceIconsInContext;
window.replaceIconsInHTMLString = replaceIconsInHTMLString;


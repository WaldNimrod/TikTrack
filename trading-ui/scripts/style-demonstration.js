/**
 * Style Demonstration Page Scripts
 * 
 * This file contains all JavaScript functions for the style demonstration page.
 * All functions are moved from inline scripts to maintain clean architecture.
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @date 2025
 */

// Notification function - uses global notification system
// This function is a wrapper that calls the global showNotification function
function showNotification(message, type = 'info', title = 'מערכת', duration = 5000) {
    // Check if global notification system is available and it's not this function
    if (typeof window.showNotification === 'function' && window.showNotification !== showNotification) {
        // Call the global notification system
        window.showNotification(message, type, title, duration);
    } else {
        // Fallback to console.log if global system is not available
        console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
    }
}

// Style File Control Functions
// Store disabled styles for restoration
const disabledStyles = new Set();

// Toggle styles using CSS Cascade Control
function toggleStylesState(enabled) {
    const htmlElement = document.documentElement;
    
    if (enabled) {
        htmlElement.className = htmlElement.className.replace('styles-disabled', 'styles-enabled');
        console.log('🎨 [CASCADE] Enabled all styles via CSS cascade control');
    } else {
        htmlElement.className = htmlElement.className.replace('styles-enabled', 'styles-disabled');
        console.log('🎨 [CASCADE] Disabled all styles via CSS cascade control');
    }
    
    // Force browser to recalculate styles
    document.documentElement.offsetHeight;
}

function toggleStyleFile(filePath) {
    console.log(`🔄 [CASCADE TOGGLE] Trying to toggle: ${filePath}`);
    
    // Check if this style is currently disabled
    if (disabledStyles.has(filePath)) {
        // Enable the style
        disabledStyles.delete(filePath);
        console.log(`✅ [CASCADE ENABLE] Style enabled: ${filePath}`);
        showNotification(`${filePath} מופעל`, 'info');
    } else {
        // Disable the style
        disabledStyles.add(filePath);
        console.log(`🔴 [CASCADE DISABLE] Style disabled: ${filePath}`);
        showNotification(`${filePath} כובה`, 'info');
    }
    
    // Update the overall state based on disabled styles
    const allStylesDisabled = disabledStyles.size > 0;
    
    if (allStylesDisabled) {
        toggleStylesState(false); // Disable all styles
    } else {
        toggleStylesState(true); // Enable all styles
    }
    
    console.log(`📊 [CASCADE INFO] Total disabled styles: ${disabledStyles.size}`);
    console.log(`📊 [CASCADE INFO] Disabled styles:`, Array.from(disabledStyles));
    console.log(`🏁 [CASCADE END] Finished processing: ${filePath}`);
}

// Legacy function for backward compatibility
function toggleStyleLayer(layer) {
    console.warn('toggleStyleLayer is deprecated. Use toggleStyleFile instead.');
    toggleStyleFile(layer);
}

// Color System Functions
function updateColorSystem() {
    // Update CSS custom properties based on current settings
    const root = document.documentElement;
    
    // Get current color values from inputs or use defaults
    const primaryColor = getComputedStyle(root).getPropertyValue('--primary-color') || '#007bff';
    const secondaryColor = getComputedStyle(root).getPropertyValue('--secondary-color') || '#6c757d';
    
    // REMOVED: root.style.setProperty() calls - these create inline styles which violate project rules
    // The CSS custom properties should be defined in external CSS files only
    
    // Trigger color update event
    document.dispatchEvent(new CustomEvent('colorSystemUpdated', {
        detail: { primaryColor, secondaryColor }
    }));
}

// Style Testing Functions
function testStyleFile(filePath) {
    console.log(`Testing style file: ${filePath}`);
    
    // REMOVED: Adding test classes to body - this can interfere with page styling
    // Test classes should be defined in external CSS files only
    
    // Just log the test instead of modifying DOM
    console.log(`Style file test completed: ${filePath}`);
}

// Layer Control Functions
function toggleLayer(layerName) {
    const layerMappings = {
        '01-settings': ['toggleVariables', 'toggleColorsDynamic', 'toggleColorsSemantic', 'toggleSpacing', 'toggleTypography', 'toggleRtlLogical'],
        '02-tools': [], // Empty layer - no files
        '03-generic': ['toggleReset', 'toggleBase'],
        '04-elements': ['toggleHeadings', 'toggleLinks', 'toggleFormsBase', 'toggleButtonsBase'],
        '05-objects': ['toggleLayout', 'toggleGrid'],
        '06-components': ['toggleButtonsAdvanced', 'toggleTables', 'toggleCards', 'toggleModals', 'toggleNotifications', 'toggleNavigation', 'toggleFormsAdvanced', 'toggleBadgesStatus', 'toggleEntityColors']
    };
    
    const checkboxes = layerMappings[layerName];
    if (checkboxes) {
        if (checkboxes.length === 0) {
            // Empty layer (like 02-tools)
            showNotification(`שכבה ${layerName} ריקה - אין קבצים להפעיל/לכבות`, 'info');
            return;
        }
        
        // Check if any checkbox in this layer is unchecked
        const anyUnchecked = checkboxes.some(id => {
            const checkbox = document.getElementById(id);
            return checkbox && !checkbox.checked;
        });
        
        // Toggle all checkboxes in this layer
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = anyUnchecked; // If any unchecked, check all; otherwise uncheck all
                checkbox.dispatchEvent(new Event('change'));
            }
        });
        
        console.log(`Layer ${layerName} ${anyUnchecked ? 'enabled' : 'disabled'}`);
        showNotification(`שכבה ${layerName} ${anyUnchecked ? 'הופעלה' : 'כובה'}`, 'info');
    }
}

// Bulk Control Functions
function enableAllStyles() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][onchange*="toggleStyleFile"]');
    checkboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change'));
        }
    });
    
    // Remove Bootstrap override when all styles are enabled
    removeBootstrapOverride();
    
    console.log('All styles enabled');
}

function disableAllStyles() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][onchange*="toggleStyleFile"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            checkbox.checked = false;
            checkbox.dispatchEvent(new Event('change'));
        }
    });
    
    // Add Bootstrap override when all styles are disabled
    addBootstrapOverride();
    
    console.log('All styles disabled');
}

function resetToDefaults() {
    // Reset to default state (all enabled except Bootstrap)
    const checkboxes = document.querySelectorAll('input[type="checkbox"][onchange*="toggleStyleFile"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.id === 'toggleBootstrap') {
            checkbox.checked = true; // Bootstrap should be enabled by default
        } else {
            checkbox.checked = true; // All other styles enabled
        }
        checkbox.dispatchEvent(new Event('change'));
    });
    
    // Remove Bootstrap override when resetting to defaults (Bootstrap enabled)
    removeBootstrapOverride();
    
    console.log('Reset to default state');
}

function showStyleInfo() {
    const info = `
ITCSS (Inverted Triangle CSS) Architecture:

01-settings/     - CSS variables and configuration
02-tools/        - Mixins and functions (empty)
03-generic/      - Reset and base styles
04-elements/     - Basic HTML elements
05-objects/      - Layout objects
06-components/   - UI components

Total: 26 CSS files loaded individually
Loading order: Bootstrap → ITCSS files → Header styles
    `;
    
    alert(info);
    console.log('ITCSS Architecture Info:', info);
}

// Section Control Functions - Using global functions from ui-utils.js
// toggleAllSections() and toggleSection() are available globally
// These functions are loaded from ui-utils.js and provide:
// - toggleAllSections() - toggles all content sections and top section
// - toggleSection(sectionId) - toggles a specific section by ID
// - toggleTopSection() - toggles only the top section

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Style Demonstration Page Loaded');
    
    // REMOVED: updateColorSystem() call - this was causing inline styles to be applied
    // The color system should be handled by external CSS files only
    
    // Add event listeners for style file controls
    const styleCheckboxes = document.querySelectorAll('input[type="checkbox"][onchange*="toggleStyleFile"]');
    styleCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const filePath = this.getAttribute('onchange').match(/toggleStyleFile\('([^']+)'\)/)[1];
            if (filePath) {
                toggleStyleFile(filePath);
            }
        });
    });
    
    // Log all loaded CSS files
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    console.log('Loaded CSS files:');
    cssLinks.forEach(link => {
        console.log(`- ${link.href}`);
    });
    
    // Test the toggle functions
    console.log('Testing toggle functions...');
    
    // REMOVED: setTimeout test - this was causing style changes after page load
    // The toggle functions should only be called by user interaction, not automatically
});

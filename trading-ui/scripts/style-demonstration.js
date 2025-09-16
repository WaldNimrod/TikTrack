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
    // Check if global notification system is available
    if (typeof window.showNotification === 'function' && window.showNotification !== showNotification) {
        // Call the global notification system
        window.showNotification(message, type, title, duration);
    } else {
        // Fallback to console.log if global system is not available
        console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
    }
}

// Style File Control Functions
function toggleStyleFile(filePath) {
    console.log(`Trying to toggle: ${filePath}`);
    
    // Find the existing link element for this CSS file
    const allLinks = document.querySelectorAll('link[rel="stylesheet"]');
    let existingLink = null;
    
    // Try different matching strategies
    for (let link of allLinks) {
        const href = link.href;
        console.log(`Checking link: ${href}`);
        
        // Check if this link matches our file path
        if (href.includes(filePath) || 
            href.includes(filePath.replace('styles-new/', '')) ||
            href.includes(filePath.replace('01-settings/', '')) ||
            href.includes(filePath.replace('03-generic/', '')) ||
            href.includes(filePath.replace('04-elements/', '')) ||
            href.includes(filePath.replace('05-objects/', '')) ||
            href.includes(filePath.replace('06-components/', ''))) {
            existingLink = link;
            break;
        }
    }
    
    if (existingLink) {
        // Toggle the disabled state
        existingLink.disabled = !existingLink.disabled;
        console.log(`${filePath} ${existingLink.disabled ? 'disabled' : 'enabled'}`);
        console.log(`Link href: ${existingLink.href}`);
        console.log(`Link disabled: ${existingLink.disabled}`);
        
        // Force reflow to ensure changes take effect
        existingLink.offsetHeight;
        
        // Show visual feedback
        showNotification(`${filePath} ${existingLink.disabled ? 'כובה' : 'מופעל'}`, 'info');
    } else {
        console.warn(`CSS file not found: ${filePath}`);
        console.log('Available CSS links:');
        allLinks.forEach(link => console.log(`- ${link.href}`));
        showNotification(`קובץ CSS לא נמצא: ${filePath}`, 'error');
    }
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

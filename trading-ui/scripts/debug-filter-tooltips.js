/**
 * Debug Script for Filter Tooltips
 * =================================
 * 
 * Script to debug tooltip initialization for entity type filter buttons
 * 
 * Usage: Load this script and call debugFilterTooltips() in console
 */

/**
 * Debug filter tooltips initialization
 * @function debugFilterTooltips
 */
function debugFilterTooltips() {
  console.log('🔍 ===== FILTER TOOLTIPS DEBUG =====');
  console.log('');
  
  // 1. Check if button system is available
  console.log('1️⃣ Checking Button System Availability:');
  const buttonSystemAvailable = typeof window.advancedButtonSystem !== 'undefined';
  const initializeTooltipsAvailable = buttonSystemAvailable && 
    typeof window.advancedButtonSystem.initializeTooltips === 'function';
  
  console.log('   advancedButtonSystem available:', buttonSystemAvailable);
  console.log('   initializeTooltips available:', initializeTooltipsAvailable);
  console.log('');
  
  // 2. Find all filter button containers
  console.log('2️⃣ Searching for Filter Button Containers:');
  const filterContainers = document.querySelectorAll('.filter-buttons-container');
  console.log('   Found containers:', filterContainers.length);
  
  filterContainers.forEach((container, index) => {
    console.log(`   Container ${index + 1}:`, {
      id: container.id || '(no id)',
      classes: container.className,
      buttonsCount: container.querySelectorAll('button').length,
      buttonsWithTooltip: container.querySelectorAll('[data-tooltip]').length,
      buttonsWithDataOnclick: container.querySelectorAll('[data-onclick]').length
    });
  });
  console.log('');
  
  // 3. Check buttons in each container
  console.log('3️⃣ Checking Buttons in Each Container:');
  filterContainers.forEach((container, containerIndex) => {
    console.log(`   Container ${containerIndex + 1} (${container.id || 'no-id'}):`);
    const buttons = container.querySelectorAll('button[data-type]');
    console.log(`     Total filter buttons: ${buttons.length}`);
    
    buttons.forEach((btn, btnIndex) => {
      const entityType = btn.getAttribute('data-type');
      const hasDataTooltip = btn.hasAttribute('data-tooltip');
      const tooltipText = btn.getAttribute('data-tooltip');
      const hasOnclick = btn.hasAttribute('onclick');
      const hasDataOnclick = btn.hasAttribute('data-onclick');
      const buttonId = btn.id || '(no id)';
      
      // Check if Bootstrap tooltip is initialized
      const tooltipInstance = bootstrap?.Tooltip?.getInstance(btn);
      
      console.log(`     Button ${btnIndex + 1} (${entityType}):`, {
        id: buttonId,
        hasDataTooltip,
        tooltipText: tooltipText || '(empty)',
        hasOnclick,
        onclick: hasOnclick ? btn.getAttribute('onclick')?.substring(0, 50) + '...' : null,
        hasDataOnclick,
        dataOnclick: hasDataOnclick ? btn.getAttribute('data-onclick')?.substring(0, 50) + '...' : null,
        tooltipInitialized: tooltipInstance ? '✅ Yes' : '❌ No',
        tooltipInstance: tooltipInstance ? 'exists' : null
      });
    });
  });
  console.log('');
  
  // 4. Check Bootstrap availability
  console.log('4️⃣ Checking Bootstrap Availability:');
  console.log('   Bootstrap available:', typeof bootstrap !== 'undefined');
  console.log('   Bootstrap.Tooltip available:', typeof bootstrap?.Tooltip !== 'undefined');
  console.log('');
  
  // 5. Attempt manual initialization
  console.log('5️⃣ Attempting Manual Tooltip Initialization:');
  let initializedCount = 0;
  let failedCount = 0;
  
  filterContainers.forEach((container) => {
    const buttonsWithTooltip = container.querySelectorAll('[data-tooltip]');
    buttonsWithTooltip.forEach((btn) => {
      try {
        // Destroy existing tooltip if exists
        const existingTooltip = bootstrap?.Tooltip?.getInstance(btn);
        if (existingTooltip) {
          existingTooltip.dispose();
        }
        
        // Create new tooltip
        const tooltipText = btn.getAttribute('data-tooltip');
        const placement = btn.getAttribute('data-tooltip-placement') || 'top';
        const trigger = btn.getAttribute('data-tooltip-trigger') || 'hover';
        
        if (tooltipText && bootstrap?.Tooltip) {
          new bootstrap.Tooltip(btn, {
            title: tooltipText,
            placement: placement,
            trigger: trigger
          });
          initializedCount++;
          console.log(`   ✅ Initialized tooltip for button: ${btn.id || btn.getAttribute('data-type')}`);
        } else {
          failedCount++;
          console.warn(`   ⚠️ Failed to initialize: ${!tooltipText ? 'no tooltip text' : 'Bootstrap not available'}`);
        }
      } catch (error) {
        failedCount++;
        console.error(`   ❌ Error initializing tooltip:`, error);
      }
    });
  });
  
  console.log(`   Initialized: ${initializedCount}, Failed: ${failedCount}`);
  console.log('');
  
  // 6. Test tooltip display
  console.log('6️⃣ Testing Tooltip Display:');
  const testButton = filterContainers[0]?.querySelector('[data-tooltip]');
  if (testButton) {
    const tooltipInstance = bootstrap?.Tooltip?.getInstance(testButton);
    if (tooltipInstance) {
      console.log('   ✅ Test button has tooltip instance');
      console.log('   💡 Hover over the button to test tooltip display');
    } else {
      console.warn('   ⚠️ Test button does not have tooltip instance');
    }
  } else {
    console.warn('   ⚠️ No test button found');
  }
  console.log('');
  
  // 7. Summary
  console.log('📊 SUMMARY:');
  console.log(`   Filter containers found: ${filterContainers.length}`);
  const totalButtons = Array.from(filterContainers).reduce((sum, container) => 
    sum + container.querySelectorAll('button[data-type]').length, 0);
  const totalButtonsWithTooltip = Array.from(filterContainers).reduce((sum, container) => 
    sum + container.querySelectorAll('[data-tooltip]').length, 0);
  console.log(`   Total filter buttons: ${totalButtons}`);
  console.log(`   Buttons with data-tooltip: ${totalButtonsWithTooltip}`);
  console.log(`   Tooltips initialized: ${initializedCount}`);
  console.log('');
  
  console.log('💡 Tips:');
  console.log('   - Hover over buttons to test tooltips');
  console.log('   - Check browser console for errors');
  console.log('   - Verify Bootstrap is loaded');
  console.log('   - Verify button system is initialized');
  console.log('');
  
  return {
    containers: filterContainers.length,
    totalButtons,
    buttonsWithTooltip: totalButtonsWithTooltip,
    initialized: initializedCount,
    failed: failedCount
  };
}

/**
 * Initialize tooltips for specific container
 * @function initializeTooltipsForContainer
 * @param {string} containerId - Container ID
 */
function initializeTooltipsForContainer(containerId) {
  console.log(`🔧 Initializing tooltips for container: ${containerId}`);
  
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Container not found: ${containerId}`);
    return;
  }
  
  const buttons = container.querySelectorAll('[data-tooltip]');
  console.log(`   Found ${buttons.length} buttons with data-tooltip`);
  
  buttons.forEach((btn, index) => {
    try {
      // Destroy existing tooltip if exists
      const existingTooltip = bootstrap?.Tooltip?.getInstance(btn);
      if (existingTooltip) {
        existingTooltip.dispose();
      }
      
      const tooltipText = btn.getAttribute('data-tooltip');
      const placement = btn.getAttribute('data-tooltip-placement') || 'top';
      const trigger = btn.getAttribute('data-tooltip-trigger') || 'hover';
      
      if (tooltipText && bootstrap?.Tooltip) {
        new bootstrap.Tooltip(btn, {
          title: tooltipText,
          placement: placement,
          trigger: trigger
        });
        console.log(`   ✅ Button ${index + 1} (${btn.getAttribute('data-type')}): tooltip initialized`);
      } else {
        console.warn(`   ⚠️ Button ${index + 1}: ${!tooltipText ? 'no tooltip text' : 'Bootstrap not available'}`);
      }
    } catch (error) {
      console.error(`   ❌ Button ${index + 1}: error -`, error);
    }
  });
}

// Export to global scope
window.debugFilterTooltips = debugFilterTooltips;
window.initializeTooltipsForContainer = initializeTooltipsForContainer;

console.log('✅ Filter Tooltips Debug Script loaded');
console.log('💡 Call debugFilterTooltips() to debug tooltip initialization');


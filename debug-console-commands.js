// ===== פקודות דיבוג לקונסול =====
// העתק והדבק את הקוד הזה בקונסול הדפדפן

console.log('🔍 ===== DEBUG CONSOLE COMMANDS =====');

// 1. בדיקת מערכת הכפתורים
function debugButtonSystem() {
  console.log('📋 Button System Status:');
  console.log('  - window.ButtonSystem:', typeof window.ButtonSystem);
  console.log('  - window.BUTTON_ICONS:', typeof window.BUTTON_ICONS);
  console.log('  - window.toggleSection:', typeof window.toggleSection);
  
  // בדיקת כפתורים
  const buttons = document.querySelectorAll('button[data-onclick*="toggleSection"]');
  console.log(`📋 Found ${buttons.length} toggle buttons`);
  
  buttons.forEach((btn, index) => {
    console.log(`  - Button ${index + 1}:`, {
      onclick: btn.getAttribute('data-onclick'),
      type: btn.getAttribute('data-button-type'),
      text: btn.getAttribute('data-text'),
      parent: btn.closest('[data-section], .section-body')?.parentElement?.id
    });
  });
}

// 2. בדיקת כפתור ספציפי
function debugSpecificButton(buttonIndex = 0) {
  const buttons = document.querySelectorAll('button[data-onclick*="toggleSection"]');
  if (buttons[buttonIndex]) {
    const btn = buttons[buttonIndex];
    console.log('🔍 Debugging button:', btn);
    console.log('📋 Button details:', {
      onclick: btn.getAttribute('data-onclick'),
      type: btn.getAttribute('data-button-type'),
      text: btn.getAttribute('data-text'),
      parent: btn.closest('[data-section], .section-body')?.parentElement?.id
    });
    
    // ניסיון להריץ את הפונקציה
    try {
      const sectionId = btn.closest('[data-section], .section-body')?.parentElement?.id || 'test';
      console.log('📋 Attempting to call toggleSection with:', sectionId);
      if (typeof window.toggleSection === 'function') {
        window.toggleSection(sectionId);
      } else {
        console.error('❌ toggleSection function not available');
      }
    } catch (error) {
      console.error('❌ Error calling toggleSection:', error);
    }
  } else {
    console.error('❌ Button not found at index:', buttonIndex);
  }
}

// 3. בדיקת DOM readiness
function debugDOM() {
  console.log('📋 DOM Status:');
  console.log('  - document.readyState:', document.readyState);
  console.log('  - document.body:', document.body ? 'Ready' : 'Not ready');
  console.log('  - window.toggleSection:', typeof window.toggleSection);
  console.log('  - window.ButtonSystem:', typeof window.ButtonSystem);
}

console.log('✅ Debug functions available:');
console.log('  - debugButtonSystem() - check button system status');
console.log('  - debugSpecificButton(index) - debug specific button');
console.log('  - debugDOM() - check DOM status');
console.log('🔍 ===== END DEBUG SETUP =====');

// קוד בדיקה ספציפי לבעיית חשבון מסחר
console.log('🔍 === DEBUG ACCOUNT SELECTION ===');

// 1. בדיקת אלמנט חשבון מסחר
const accountSelect = document.getElementById('tradingAccountSelect');
console.log('Account Select Element:', accountSelect);

if (accountSelect) {
    console.log('Account Select Value:', accountSelect.value);
    console.log('Account Select Options:', accountSelect.options.length);
    
    // בדיקת כל האפשרויות
    console.log('All Options:');
    for (let i = 0; i < accountSelect.options.length; i++) {
        const option = accountSelect.options[i];
        console.log(`  ${i}: "${option.value}" - "${option.textContent}"`);
    }
    
    // בדיקת event listeners
    console.log('Event Listeners:');
    if (typeof getEventListeners !== 'undefined') {
        const listeners = getEventListeners(accountSelect);
        console.log('Change Listeners:', listeners.change?.length || 0);
    } else {
        console.log('getEventListeners not available');
    }
    
    // בדיקת CSS
    console.log('CSS Classes:', accountSelect.className);
    console.log('CSS Display:', window.getComputedStyle(accountSelect).display);
    console.log('CSS Visibility:', window.getComputedStyle(accountSelect).visibility);
}

// 2. בדיקת פונקציות
console.log('\nFunctions:');
console.log('handleAccountSelect:', typeof window.handleAccountSelect);
console.log('updateAnalyzeButton:', typeof window.updateAnalyzeButton);

// 3. בדיקת משתנים
console.log('\nVariables:');
console.log('selectedAccount:', window.selectedAccount);
console.log('selectedFile:', window.selectedFile);
console.log('selectedConnector:', window.selectedConnector);

// 4. בדיקת כפתור
console.log('\nButton:');
const continueBtn = document.querySelector('[data-button-type="PRIMARY"]');
if (continueBtn) {
    console.log('Continue Button:', continueBtn);
    console.log('Button Disabled:', continueBtn.disabled);
    console.log('Button Text:', continueBtn.textContent);
}

// 5. בדיקת modal
console.log('\nModal:');
const modal = document.getElementById('importUserDataModal');
if (modal) {
    console.log('Modal Display:', modal.style.display);
    console.log('Modal Classes:', modal.className);
    console.log('Modal Data Listeners Setup:', modal.hasAttribute('data-listeners-setup'));
}

// 6. בדיקת setupImportModalEventListeners
console.log('\nSetup Function:');
console.log('setupImportModalEventListeners:', typeof window.setupImportModalEventListeners);

// 7. בדיקת openImportUserDataModal
console.log('\nOpen Function:');
console.log('openImportUserDataModal:', typeof window.openImportUserDataModal);

console.log('\n✅ === ACCOUNT DEBUG COMPLETE ===');

/**
 * Debug script for cashFlowAccount select field
 * 
 * Run this in the browser console after opening the Cash Flow edit modal
 * to check the state of the cashFlowAccount field.
 * 
 * Usage:
 * 1. Open Cash Flow edit modal
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire script
 * 4. Press Enter
 */


// ===== FUNCTION INDEX =====

// === Event Handlers ===
// - changeHandler() - Changehandler

(function() {
    console.log('🔍 Starting Cash Flow Account Field Debug...\n');
    
    // Find the cashFlowAccount field
    const field = document.getElementById('cashFlowAccount');
    
    if (!field) {
        console.error('❌ Field cashFlowAccount not found in DOM');
        console.log('💡 Make sure the Cash Flow edit modal is open');
        return;
    }
    
    console.log('✅ Field found:', field);
    console.log('\n📊 Current Field State:');
    console.log('   ID:', field.id);
    console.log('   Value:', field.value);
    console.log('   Selected Index:', field.selectedIndex);
    console.log('   Options Count:', field.options.length);
    
    // Get selected option
    const selectedOption = field.options[field.selectedIndex];
    if (selectedOption) {
        console.log('   Selected Option:', {
            index: field.selectedIndex,
            value: selectedOption.value,
            text: selectedOption.text,
            selected: selectedOption.selected
        });
    } else {
        console.log('   Selected Option: NONE');
    }
    
    // List all options
    console.log('\n📋 All Options:');
    Array.from(field.options).forEach((opt, idx) => {
        const marker = opt.selected ? '👉' : '  ';
        console.log(`${marker} [${idx}] value="${opt.value}" text="${opt.text}" ${opt.selected ? '(SELECTED)' : ''}`);
    });
    
    // Check if value is empty or default
    if (!field.value || field.value === '' || field.value === '0') {
        console.log('\n⚠️ WARNING: Field value is empty or default');
    } else {
        console.log(`\n✅ Field has value: ${field.value}`);
    }
    
    // Check if displayed text matches expected
    const displayedText = selectedOption ? selectedOption.text : '';
    if (displayedText === 'בחר חשבון מסחר...' || displayedText === '') {
        console.log('\n⚠️ WARNING: Field displays default/empty text:', displayedText);
    } else {
        console.log(`\n✅ Field displays: ${displayedText}`);
    }
    
    // Check for event listeners
    console.log('\n🎧 Checking for event listeners...');
    const listeners = getEventListeners ? getEventListeners(field) : null;
    if (listeners) {
        console.log('   Event listeners:', listeners);
    } else {
        console.log('   (getEventListeners not available - use Chrome DevTools)');
    }
    
    // Monitor for changes
    console.log('\n👀 Monitoring field for changes (next 5 seconds)...');
    let changeCount = 0;
    const originalValue = field.value;
    const originalSelectedIndex = field.selectedIndex;
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
                changeCount++;
                console.log(`   🔄 Change #${changeCount}: value changed from "${mutation.oldValue}" to "${field.value}"`);
            }
        });
    });
    
    observer.observe(field, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ['value']
    });
    
    // Also listen for input/change events
    const changeHandler = () => {
        changeCount++;
        console.log(`   🔄 Change #${changeCount}: input/change event - new value: "${field.value}"`);
    };
    field.addEventListener('input', changeHandler);
    field.addEventListener('change', changeHandler);
    
    setTimeout(() => {
        observer.disconnect();
        field.removeEventListener('input', changeHandler);
        field.removeEventListener('change', changeHandler);
        
        console.log('\n📊 Final State After Monitoring:');
        console.log('   Original Value:', originalValue);
        console.log('   Current Value:', field.value);
        console.log('   Original Selected Index:', originalSelectedIndex);
        console.log('   Current Selected Index:', field.selectedIndex);
        console.log('   Total Changes Detected:', changeCount);
        
        if (field.value !== originalValue) {
            console.log('\n⚠️ WARNING: Field value changed during monitoring!');
            console.log('   This suggests something is modifying the field after it was set.');
        } else {
            console.log('\n✅ Field value remained stable during monitoring');
        }
        
        // Final check
        const finalSelectedOption = field.options[field.selectedIndex];
        const finalDisplayedText = finalSelectedOption ? finalSelectedOption.text : '';
        console.log('\n🎯 Final Displayed Text:', finalDisplayedText);
        
        if (finalDisplayedText === 'בחר חשבון מסחר...' && field.value && field.value !== '') {
            console.log('\n❌ PROBLEM DETECTED:');
            console.log('   Field has a value (' + field.value + ') but displays default text!');
            console.log('   This suggests a mismatch between field.value and the selected option.');
            
            // Try to find the option with matching value
            const matchingOption = Array.from(field.options).find(opt => opt.value === field.value);
            if (matchingOption) {
                console.log('   Found matching option:', matchingOption.text);
                console.log('   Attempting to fix by setting selectedIndex...');
                field.selectedIndex = Array.from(field.options).indexOf(matchingOption);
                console.log('   After fix - Selected Index:', field.selectedIndex);
                console.log('   After fix - Displayed Text:', field.options[field.selectedIndex]?.text);
            } else {
                console.log('   No matching option found for value:', field.value);
            }
        }
        
        console.log('\n✅ Debug complete!');
    }, 5000);
    
    // Return field reference for manual inspection
    return {
        field: field,
        check: function() {
            console.log('Manual check:', {
                value: this.field.value,
                selectedIndex: this.field.selectedIndex,
                selectedText: this.field.options[this.field.selectedIndex]?.text,
                allOptions: Array.from(this.field.options).map(opt => ({
                    value: opt.value,
                    text: opt.text,
                    selected: opt.selected
                }))
            });
        },
        setValue: function(value) {
            console.log(`Attempting to set value to: ${value}`);
            this.field.value = value;
            console.log(`After setting - value: ${this.field.value}, text: ${this.field.options[this.field.selectedIndex]?.text}`);
        }
    };
})();


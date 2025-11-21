/**
 * Debug script for Trade Edit Modal - Quantity and Amount fields
 * 
 * Run this in the browser console when the trade edit modal is open
 * to diagnose why quantity and amount fields are not being populated.
 */

(function() {
    console.log('🔍 ===== Trade Edit Modal Debug =====');
    
    // 1. Check if modal is open
    const modal = document.querySelector('#tradesModal');
    if (!modal) {
        console.error('❌ Trade modal (#tradesModal) not found! Is the modal open?');
        return;
    }
    console.log('✅ Trade modal found');
    
    // 2. Check if form exists
    const form = modal.querySelector('form');
    if (!form) {
        console.error('❌ Form not found in modal!');
        return;
    }
    console.log('✅ Form found:', form.id || 'no id');
    
    // 3. Check quantity field
    const quantityField = form.querySelector('#tradeQuantity');
    if (!quantityField) {
        console.error('❌ Quantity field (#tradeQuantity) not found!');
        console.log('Available input fields:', Array.from(form.querySelectorAll('input')).map(i => i.id || i.name || 'no-id'));
    } else {
        console.log('✅ Quantity field found:', {
            id: quantityField.id,
            name: quantityField.name,
            value: quantityField.value,
            type: quantityField.type,
            disabled: quantityField.disabled,
            readonly: quantityField.readOnly
        });
    }
    
    // 4. Check amount field
    const amountField = form.querySelector('#tradeTotalInvestment');
    if (!amountField) {
        console.error('❌ Amount field (#tradeTotalInvestment) not found!');
        console.log('Available input fields:', Array.from(form.querySelectorAll('input')).map(i => i.id || i.name || 'no-id'));
    } else {
        console.log('✅ Amount field found:', {
            id: amountField.id,
            name: amountField.name,
            value: amountField.value,
            type: amountField.type,
            disabled: amountField.disabled,
            readonly: amountField.readOnly
        });
    }
    
    // 5. Check entry price field
    const entryPriceField = form.querySelector('#tradeEntryPrice');
    if (!entryPriceField) {
        console.warn('⚠️ Entry price field (#tradeEntryPrice) not found!');
    } else {
        console.log('✅ Entry price field found:', {
            id: entryPriceField.id,
            value: entryPriceField.value,
            type: entryPriceField.type
        });
    }
    
    // 6. Check modal data
    const modalInfo = window.ModalManagerV2?.modals?.get('tradesModal');
    if (modalInfo) {
        console.log('✅ Modal info found:', {
            config: modalInfo.config ? 'exists' : 'missing',
            element: modalInfo.element ? 'exists' : 'missing',
            mode: modalInfo.mode || 'unknown'
        });
    } else {
        console.warn('⚠️ Modal info not found in ModalManagerV2');
    }
    
    // 7. Try to get entity data from modal
    const modalData = modalInfo?.entityData || modalInfo?.data;
    if (modalData) {
        console.log('✅ Entity data found in modal:', {
            keys: Object.keys(modalData),
            planned_quantity: modalData.planned_quantity,
            planned_amount: modalData.planned_amount,
            entry_price: modalData.entry_price,
            quantity: modalData.quantity,
            position_quantity: modalData.position_quantity,
            position_amount: modalData.position_amount,
            trade_plan: modalData.trade_plan ? 'exists' : 'missing'
        });
        
        if (modalData.trade_plan) {
            console.log('Trade plan data:', {
                planned_amount: modalData.trade_plan.planned_amount,
                entry_price: modalData.trade_plan.entry_price
            });
        }
    } else {
        console.warn('⚠️ Entity data not found in modal info');
        
        // Try to get from form dataset
        const formMode = form.dataset.mode;
        const tradeId = form.dataset.tradeId || form.dataset.entityId;
        console.log('Form dataset:', {
            mode: formMode,
            tradeId: tradeId
        });
        
        if (tradeId && window.ModalManagerV2) {
            console.log('🔍 Attempting to load entity data for trade ID:', tradeId);
            window.ModalManagerV2.loadEntityData('trade', tradeId).then(data => {
                console.log('✅ Loaded entity data:', {
                    keys: Object.keys(data || {}),
                    planned_quantity: data?.planned_quantity,
                    planned_amount: data?.planned_amount,
                    entry_price: data?.entry_price,
                    quantity: data?.quantity,
                    position_quantity: data?.position_quantity,
                    position_amount: data?.position_amount
                });
            }).catch(err => {
                console.error('❌ Error loading entity data:', err);
            });
        }
    }
    
    // 8. Check if populateForm was called
    console.log('🔍 Checking populateForm logs...');
    console.log('Look for logs starting with: 🔍 [Trade Edit]');
    
    // 9. Manual population test
    console.log('\n🧪 ===== Manual Population Test =====');
    if (quantityField && modalData) {
        const testQuantity = modalData.planned_quantity || modalData.quantity || modalData.position_quantity;
        if (testQuantity) {
            console.log(`🧪 Would set quantity to: ${testQuantity}`);
            console.log('Run: document.querySelector("#tradeQuantity").value = ' + testQuantity);
        } else {
            console.log('⚠️ No quantity value available in data');
        }
    }
    
    if (amountField && modalData) {
        const testAmount = modalData.planned_amount || modalData.position_amount;
        if (testAmount) {
            console.log(`🧪 Would set amount to: ${testAmount}`);
            console.log('Run: document.querySelector("#tradeTotalInvestment").value = ' + testAmount);
        } else {
            console.log('⚠️ No amount value available in data');
        }
    }
    
    console.log('\n✅ ===== Debug Complete =====');
    console.log('Check the logs above to identify the issue.');
})();


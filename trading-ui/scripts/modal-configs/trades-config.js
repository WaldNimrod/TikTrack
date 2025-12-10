/**
 * Trades Modal Configuration
 * קונפיגורציה למודל טריידים
 * 
 * @file trades-config.js
 * @version 1.0.0
 * @lastUpdated January 27, 2025
 */


// ===== FUNCTION INDEX =====

// === Functions ===
// - initializeTradesModal() - Initializetradesmodal

// === Initialization ===
// - initializeTradesModal() - Initializetradesmodal
// === Functions ===
// - initializeTradesModal() - Initializetradesmodal

const tradesModalConfig = window.tradesModalConfig;

// יצירת המודל אם ModalManagerV2 זמין - Deferred initialization
function initializeTradesModal() {
    if (!tradesModalConfig) {
        console.warn('⚠️ tradesModalConfig not defined, skipping trades modal init');
        return true; // avoid retry loops
    }
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.createCRUDModal === 'function') {
        try {
            window.ModalManagerV2.createCRUDModal(tradesModalConfig);
            console.log('✅ Trades modal created successfully');
            return true;
        } catch (error) {
            console.error('❌ Error creating Trades modal:', error);
            return false;
        }
    }
    return false;
}

if (window.ModalManagerV2) {
    initializeTradesModal();
} else {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                if (!initializeTradesModal()) {
                    setTimeout(() => {
                        if (!initializeTradesModal()) {
                            console.warn('⚠️ ModalManagerV2 not available for Trades modal after retries');
                        }
                    }, 500);
                }
            }, 100);
        });
    } else {
        setTimeout(() => {
            if (!initializeTradesModal()) {
                setTimeout(() => {
                    if (!initializeTradesModal()) {
                        console.warn('⚠️ ModalManagerV2 not available for Trades modal after retries');
                    }
                }, 500);
            }
        }, 100);
    }
}

// ייצוא לקונסול (לצורך debug)
window.tradesModalConfig = tradesModalConfig;

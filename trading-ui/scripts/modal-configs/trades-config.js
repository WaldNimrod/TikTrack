/**
 * Trades Modal Configuration
 * קונפיגורציה למודל טריידים
 * 
 * @file trades-config.js
 * @version 1.0.0
 * @lastUpdated January 27, 2025
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - initializeTradesModal() - Initialize trades modal

let tradesModalConfig = window.tradesModalConfig;
let tradesConfigWarned = false;

// יצירת המודל אם ModalManagerV2 זמין - Deferred initialization
function initializeTradesModal() {
    if (!tradesModalConfig) {
        if (!tradesConfigWarned) {
            tradesConfigWarned = true;
            console.warn('⚠️ tradesModalConfig not defined, skipping trades modal init (will keep waiting)');
        }
        return false; // allow a later retry if config loads late
    }
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.createCRUDModal === 'function') {
        try {
            window.ModalManagerV2.createCRUDModal(tradesModalConfig);
            window.Logger?.debug?.('✅ Trades modal created successfully', { page: 'trades-config' });
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

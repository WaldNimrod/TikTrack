/**
 * Warning System Examples - TikTrack Warning Usage Examples
 * ========================================================
 * 
 * USAGE EXAMPLES (August 25, 2025):
 * =================================
 * 
 * This file contains practical examples of how to use the centralized
 * warning system across different pages and scenarios.
 * 
 * EXAMPLES INCLUDED:
 * - Delete confirmations for different entity types
 * - Linked items warnings
 * - Validation errors
 * - System notifications
 * - Custom confirmations
 * 
 * USAGE PATTERNS:
 * - showDeleteWarning() - For delete confirmations
 * - showLinkedItemsWarning() - For linked items warnings
 * - showValidationWarning() - For validation errors
 * - showWarning() - For custom warnings
 * 
 * INTEGRATION EXAMPLES:
 * - Tickers page integration
 * - Accounts page integration
 * - Trades page integration
 * - Alerts page integration
 */

// ===== DELETE WARNING EXAMPLES =====

/**
 * Example: Delete ticker warning
 */
function exampleDeleteTicker() {
    const ticker = { id: 1, symbol: 'AAPL', name: 'Apple Inc.' };
    
    showDeleteWarning('ticker', `${ticker.symbol} - ${ticker.name}`, 
        () => {
            // onConfirm callback
            console.log('Deleting ticker:', ticker.id);
            // API call to delete ticker
        },
        () => {
            // onCancel callback
            console.log('Delete cancelled');
        }
    );
}

/**
 * Example: Delete account warning
 */
function exampleDeleteAccount() {
    const account = { id: 1, name: 'חשבון ראשי', balance: 50000 };
    
    showDeleteWarning('account', account.name, 
        () => {
            console.log('Deleting account:', account.id);
            // API call to delete account
        },
        () => {
            console.log('Delete cancelled');
        }
    );
}

/**
 * Example: Delete trade warning
 */
function exampleDeleteTrade() {
    const trade = { id: 1, symbol: 'AAPL', side: 'buy', quantity: 100 };
    
    showDeleteWarning('trade', `${trade.symbol} ${trade.side} ${trade.quantity}`, 
        () => {
            console.log('Deleting trade:', trade.id);
            // API call to delete trade
        },
        () => {
            console.log('Delete cancelled');
        }
    );
}

// ===== LINKED ITEMS WARNING EXAMPLES =====

/**
 * Example: Linked items warning for ticker
 */
function exampleLinkedItemsTicker() {
    showLinkedItemsWarning('ticker', 5, 
        () => {
            console.log('Force deleting ticker with linked items');
            // Force delete API call
        },
        () => {
            console.log('Linked items warning closed');
        }
    );
}

/**
 * Example: Linked items warning for account
 */
function exampleLinkedItemsAccount() {
    showLinkedItemsWarning('account', 3, 
        () => {
            console.log('Force deleting account with linked items');
            // Force delete API call
        },
        () => {
            console.log('Linked items warning closed');
        }
    );
}

// ===== VALIDATION WARNING EXAMPLES =====

/**
 * Example: Symbol validation error
 */
function exampleSymbolValidation() {
    showValidationWarning('symbol', 'סמל הטיקר כבר קיים במערכת');
}

/**
 * Example: Name validation error
 */
function exampleNameValidation() {
    showValidationWarning('name', 'שם הטיקר חייב להיות בין 2 ל-50 תווים');
}

/**
 * Example: Currency validation error
 */
function exampleCurrencyValidation() {
    showValidationWarning('currency', 'יש לבחור מטבע תקין');
}

// ===== CUSTOM WARNING EXAMPLES =====

/**
 * Example: Custom system warning
 */
function exampleSystemWarning() {
    showWarning('SYSTEM', {
        message: 'המערכת תעבור לתחזוקה בעוד 5 דקות'
    });
}

/**
 * Example: Custom confirmation
 */
function exampleCustomConfirmation() {
    showWarning('CONFIRMATION', {
        message: 'האם אתה בטוח שברצונך לייצא את כל הנתונים?'
    }, {}, 
        () => {
            console.log('Export confirmed');
            // Export data
        },
        () => {
            console.log('Export cancelled');
        }
    );
}

/**
 * Example: Custom warning with additional content
 */
function exampleCustomWarningWithContent() {
    const additionalContent = `
        <div class="alert alert-info mt-3">
            <strong>💡 טיפ:</strong> ניתן לשמור את הנתונים לפני המחיקה
        </div>
    `;
    
    showWarning('DELETE', {
        itemType: 'טרייד',
        itemName: 'AAPL Buy 100'
    }, {
        additionalContent: additionalContent
    }, 
        () => {
            console.log('Delete confirmed');
            // Delete item
        },
        () => {
            console.log('Delete cancelled');
        }
    );
}

// ===== INTEGRATION EXAMPLES =====

/**
 * Example: Integration with tickers page
 */
function exampleTickersPageIntegration() {
    // Delete ticker button click handler
    function onDeleteTickerClick(tickerId) {
        const ticker = tickersData.find(t => t.id == tickerId);
        if (!ticker) return;
        
        showDeleteWarning('ticker', `${ticker.symbol} - ${ticker.name}`, 
            () => deleteTickerFromAPI(tickerId),
            () => console.log('Delete cancelled')
        );
    }
    
    // Validation error handler
    function onValidationError(field, message) {
        showValidationWarning(field, message);
    }
}

/**
 * Example: Integration with accounts page
 */
function exampleAccountsPageIntegration() {
    // Delete account button click handler
    function onDeleteAccountClick(accountId) {
        const account = accountsData.find(a => a.id == accountId);
        if (!account) return;
        
        showDeleteWarning('account', account.name, 
            () => deleteAccountFromAPI(accountId),
            () => console.log('Delete cancelled')
        );
    }
}

/**
 * Example: Integration with trades page
 */
function exampleTradesPageIntegration() {
    // Delete trade button click handler
    function onDeleteTradeClick(tradeId) {
        const trade = tradesData.find(t => t.id == tradeId);
        if (!trade) return;
        
        const tradeDescription = `${trade.symbol} ${trade.side} ${trade.quantity}`;
        
        showDeleteWarning('trade', tradeDescription, 
            () => deleteTradeFromAPI(tradeId),
            () => console.log('Delete cancelled')
        );
    }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Mock API call for deleting ticker
 */
async function deleteTickerFromAPI(tickerId) {
    try {
        const response = await fetch(`/api/v1/tickers/${tickerId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('✅ טיקר נמחק בהצלחה', 'success');
            // Refresh data
        } else {
            const errorData = await response.json();
            
            // Check for linked items error
            if (errorData.error && errorData.error.message && 
                errorData.error.message.includes('linked items')) {
                
                showLinkedItemsWarning('ticker', 5);
                return;
            }
            
            showNotification('❌ שגיאה במחיקת טיקר: ' + errorData.error.message, 'error');
        }
    } catch (error) {
        showNotification('❌ שגיאה במחיקת טיקר', 'error');
    }
}

/**
 * Mock API call for deleting account
 */
async function deleteAccountFromAPI(accountId) {
    try {
        const response = await fetch(`/api/v1/accounts/${accountId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('✅ חשבון נמחק בהצלחה', 'success');
            // Refresh data
        } else {
            const errorData = await response.json();
            showNotification('❌ שגיאה במחיקת חשבון: ' + errorData.error.message, 'error');
        }
    } catch (error) {
        showNotification('❌ שגיאה במחיקת חשבון', 'error');
    }
}

/**
 * Mock API call for deleting trade
 */
async function deleteTradeFromAPI(tradeId) {
    try {
        const response = await fetch(`/api/v1/trades/${tradeId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('✅ טרייד נמחק בהצלחה', 'success');
            // Refresh data
        } else {
            const errorData = await response.json();
            showNotification('❌ שגיאה במחיקת טרייד: ' + errorData.error.message, 'error');
        }
    } catch (error) {
        showNotification('❌ שגיאה במחיקת טרייד', 'error');
    }
}

// ===== EXPORT FUNCTIONS TO GLOBAL SCOPE =====
window.exampleDeleteTicker = exampleDeleteTicker;
window.exampleDeleteAccount = exampleDeleteAccount;
window.exampleDeleteTrade = exampleDeleteTrade;
window.exampleLinkedItemsTicker = exampleLinkedItemsTicker;
window.exampleLinkedItemsAccount = exampleLinkedItemsAccount;
window.exampleSymbolValidation = exampleSymbolValidation;
window.exampleNameValidation = exampleNameValidation;
window.exampleCurrencyValidation = exampleCurrencyValidation;
window.exampleSystemWarning = exampleSystemWarning;
window.exampleCustomConfirmation = exampleCustomConfirmation;
window.exampleCustomWarningWithContent = exampleCustomWarningWithContent;

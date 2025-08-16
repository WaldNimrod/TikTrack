// ===== ACCOUNTS MANAGEMENT =====
// קובץ ייעודי לניהול חשבונות - משותף לכל הדפים

/**
 * טעינת חשבונות מהשרת
 * הפונקציה טוענת את כל החשבונות ומחזירה אותם
 * 
 * @returns {Promise<Array>} מערך של חשבונות
 * 
 * @example
 * const accounts = await loadAccountsData();
 */
async function loadAccountsData() {
    try {
        console.log('🔄 טוען חשבונות...');
        const response = await apiCall('/api/v1/accounts/');
        const accounts = response.data || response;
        console.log(`✅ נטענו ${accounts.length} חשבונות`);
        return accounts;
    } catch (error) {
        console.error('❌ שגיאה בטעינת חשבונות:', error);
        throw error;
    }
}

/**
 * חישוב סטטיסטיקות מנתוני החשבונות
 * הפונקציה מחשבת סטטיסטיקות כלליות מנתוני החשבונות
 * 
 * @param {Array} accounts - מערך של חשבונות
 * @returns {Object} אובייקט עם הסטטיסטיקות
 * 
 * @example
 * const stats = calculateAccountsStats(accounts);
 */
function calculateAccountsStats(accounts) {
    const activeAccounts = accounts.filter(acc => acc.status === 'פתוח').length;
    const totalValue = accounts.reduce((sum, acc) => sum + (acc.total_value || 0), 0);
    const totalProfitLoss = accounts.reduce((sum, acc) => sum + (acc.total_pl || 0), 0);
    const totalCashBalance = accounts.reduce((sum, acc) => sum + (acc.cash_balance || 0), 0);
    
    const profitPercentage = totalCashBalance > 0 ? (totalProfitLoss / totalCashBalance) * 100 : 0;
    
    return {
        active_accounts: activeAccounts,
        total_accounts: accounts.length,
        total_value: totalValue,
        total_profit_loss: totalProfitLoss,
        total_cash_balance: totalCashBalance,
        profit_percentage: profitPercentage
    };
}

/**
 * המרת סטטוס חשבון מ-עברית לאנגלית
 * הפונקציה ממירה ערכים בעברית לערכים שהשרת מצפה להם
 * 
 * @param {string} statusDisplay - סטטוס בעברית ('פתוח' או 'סגור')
 * @returns {string} סטטוס באנגלית ('active' או 'inactive')
 * 
 * @example
 * const status = convertAccountStatus('פתוח'); // returns 'active'
 */
function convertAccountStatus(statusDisplay) {
    // אין צורך בהמרה - מחזירים את הערך כמו שהוא
    return statusDisplay || 'פתוח';
}

/**
 * המרת סטטוס חשבון מאנגלית לעברית
 * הפונקציה ממירה ערכים מהשרת לערכים לתצוגה בעברית
 * 
 * @param {string} status - סטטוס באנגלית ('active' או 'inactive')
 * @returns {string} סטטוס בעברית ('פתוח' או 'סגור')
 * 
 * @example
 * const statusDisplay = convertAccountStatusToHebrew('active'); // returns 'פתוח'
 */
function convertAccountStatusToHebrew(status) {
    if (status === 'active' || status === 'פעיל' || status === 'open') {
        return 'פתוח';
    } else if (status === 'inactive' || status === 'לא פעיל' || status === 'closed') {
        return 'סגור';
    } else if (status === 'cancelled' || status === 'בוטל') {
        return 'מבוטל';
    }
    return status || 'פתוח';
}

/**
 * מילוי נתונים במודל עריכת חשבון
 * הפונקציה ממלאת את כל השדות במודל העריכה עם נתוני החשבון
 * 
 * @param {Object} account - נתוני החשבון
 * 
 * @example
 * fillAccountEditModal(accountData);
 */
function fillAccountEditModal(account) {
    console.log(`🔧 מילוי מודל עריכת חשבון עם נתונים:`, account);
    
    try {
        // מילוי שדות המודל עם הנתונים או ערכי ברירת מחדל
        document.getElementById('editAccountId').value = account.id;
        document.getElementById('editAccountName').value = account.name || '';
        document.getElementById('editAccountCurrency').value = account.currency || '';
        
        // המרת סטטוס לעברית
        const statusValue = convertAccountStatusToHebrew(account.status);
        document.getElementById('editAccountStatus').value = statusValue;
        
        document.getElementById('editAccountCashBalance').value = account.cash_balance || '';
        document.getElementById('editAccountTotalValue').value = account.total_value || '';
        document.getElementById('editAccountTotalPl').value = account.total_pl || '';
        document.getElementById('editAccountNotes').value = account.notes || '';
        
        console.log(`✅ מודל עריכת חשבון מולא בהצלחה`);
    } catch (error) {
        console.error(`❌ שגיאה במילוי מודל עריכת חשבון:`, error);
        throw error;
    }
}

/**
 * איסוף נתונים ממודל עריכת חשבון
 * הפונקציה אוספת את הנתונים מהשדות במודל העריכה
 * 
 * @returns {Object} אובייקט עם נתוני החשבון
 * 
 * @example
 * const accountData = collectAccountEditData();
 */
function collectAccountEditData() {
    const statusDisplay = document.getElementById('editAccountStatus').value || 'פתוח';
    // אין צורך בהמרה - שומרים את הערך בעברית
    const status = statusDisplay;
    
    return {
        name: document.getElementById('editAccountName').value,
        currency: document.getElementById('editAccountCurrency').value,
        status: status,
        cash_balance: parseFloat(document.getElementById('editAccountCashBalance').value) || 0,
        total_value: parseFloat(document.getElementById('editAccountTotalValue').value) || 0,
        total_pl: parseFloat(document.getElementById('editAccountTotalPl').value) || 0,
        notes: document.getElementById('editAccountNotes').value
    };
}

/**
 * עדכון חשבון
 * הפונקציה מעדכנת חשבון קיים בשרת
 * 
 * @param {number} accountId - מזהה החשבון
 * @returns {Promise<Object>} תגובה מהשרת
 * 
 * @example
 * const result = await updateAccount(123);
 */
async function updateAccount(accountId) {
    const accountData = collectAccountEditData();
    
    try {
        const response = await apiCall(`/api/v1/accounts/${accountId}`, {
            method: 'PUT',
            body: JSON.stringify(accountData)
        });
        
        console.log(`✅ חשבון ${accountId} עודכן בהצלחה`);
        return response;
    } catch (error) {
        console.error(`❌ שגיאה בעדכון חשבון ${accountId}:`, error);
        throw error;
    }
}

/**
 * מחיקת חשבון
 * הפונקציה בודקת אם יש טריידים פתוחים ומציגה אזהרה אם יש
 * 
 * @param {number} accountId - מזהה החשבון
 * @param {string} accountName - שם החשבון להודעות
 * @returns {Promise<Object>} תגובה מהשרת
 * 
 * @example
 * const result = await deleteAccount(123, 'חשבון בדיקה');
 */
async function deleteAccount(accountId, accountName) {
    // הצגת אישור מחיקה למשתמש
    if (!confirm(`⚠️ אזהרה: האם אתה בטוח שברצונך למחוק את החשבון "${accountName}"?\n\nפעולה זו אינה הפיכה והחשבון יימחק לחלוטין מהמערכת.`)) {
        return null;
    }
    
    try {
        // בדיקה אם יש טריידים פתוחים לחשבון
        console.log(`🔍 בודק טריידים פתוחים לחשבון ${accountId}...`);
        const tradesResponse = await apiCall(`/api/v1/trades/?account_id=${accountId}&status=${encodeURIComponent('פתוח')}`);
        const openTrades = tradesResponse.data || [];
        
        if (openTrades.length > 0) {
            // הצגת אזהרה עם טבלת הטריידים הפתוחים
            await showOpenTradesWarning(accountName, openTrades, 'delete');
            return null;
        }
        
        // אם אין טריידים פתוחים, ממשיך במחיקה
        const response = await apiCall(`/api/v1/accounts/${accountId}`, {
            method: 'DELETE'
        });
        
        console.log(`✅ חשבון "${accountName}" נמחק בהצלחה`);
        return response;
    } catch (error) {
        console.error(`❌ שגיאה במחיקת חשבון "${accountName}":`, error);
        throw error;
    }
}

/**
 * ביטול חשבון - שינוי סטטוס למבוטל
 * הפונקציה בודקת אם יש טריידים פתוחים ומציגה אזהרה אם יש
 * 
 * @param {number} accountId - מזהה החשבון
 * @param {string} accountName - שם החשבון להודעות
 * @returns {Promise<Object>} תגובה מהשרת
 * 
 * @example
 * const result = await cancelAccount(123, 'חשבון בדיקה');
 */
async function cancelAccount(accountId, accountName) {
    // הצגת אישור ביטול למשתמש
    if (!confirm(`⚠️ אזהרה: האם אתה בטוח שברצונך לבטל את החשבון "${accountName}"?\n\nהחשבון יקבל סטטוס "מבוטל" ולא יימחק מהמערכת.\nפעולה זו הפיכה.`)) {
        return null;
    }
    
    try {
        // בדיקה אם יש טריידים פתוחים לחשבון
        console.log(`🔍 בודק טריידים פתוחים לחשבון ${accountId}...`);
        const tradesResponse = await apiCall(`/api/v1/trades/?account_id=${accountId}&status=${encodeURIComponent('פתוח')}`);
        const openTrades = tradesResponse.data || [];
        
        if (openTrades.length > 0) {
            // הצגת אזהרה עם טבלת הטריידים הפתוחים
            await showOpenTradesWarning(accountName, openTrades, 'cancel');
            return null;
        }
        
        // אם אין טריידים פתוחים, ממשיך בביטול
        const response = await apiCall(`/api/v1/accounts/${accountId}`, {
            method: 'PUT',
            body: JSON.stringify({
                status: 'מבוטל'
            })
        });
        
        console.log(`✅ חשבון "${accountName}" בוטל בהצלחה`);
        return response;
    } catch (error) {
        console.error(`❌ שגיאה בביטול חשבון "${accountName}":`, error);
        throw error;
    }
}

/**
 * יצירת חשבון חדש
 * הפונקציה יוצרת חשבון חדש בשרת
 * 
 * @param {Object} accountData - נתוני החשבון החדש
 * @returns {Promise<Object>} תגובה מהשרת
 * 
 * @example
 * const result = await createAccount({ name: 'חשבון חדש', currency: 'ILS' });
 */
async function createAccount(accountData) {
    try {
        const response = await apiCall('/api/v1/accounts/', {
            method: 'POST',
            body: JSON.stringify(accountData)
        });
        
        console.log(`✅ חשבון חדש נוצר בהצלחה`);
        return response;
    } catch (error) {
        console.error(`❌ שגיאה ביצירת חשבון חדש:`, error);
        throw error;
    }
}

/**
 * הצגת מודל עריכת חשבון
 * הפונקציה מציגה את מודל העריכה עם נתוני החשבון
 * 
 * @param {Object} account - נתוני החשבון לעריכה
 * 
 * @example
 * showAccountEditModal(accountData);
 */
function showAccountEditModal(account) {
    console.log(`🔧 הצגת מודל עריכת חשבון:`, account);
    
    // מילוי הנתונים במודל
    fillAccountEditModal(account);
    
    // הצגת המודל
    const modalElement = document.getElementById('editAccountModal');
    if (modalElement) {
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        } else {
            // גיבוי אם Bootstrap לא זמין
            modalElement.style.display = 'block';
            modalElement.classList.add('show');
            document.body.classList.add('modal-open');
        }
    } else {
        console.error('❌ מודל עריכת חשבון לא נמצא');
    }
}

/**
 * הצגת מודל הוספת חשבון
 * הפונקציה מציגה את מודל ההוספה
 * 
 * @example
 * showAccountAddModal();
 */
function showAccountAddModal() {
    console.log(`🔧 הצגת מודל הוספת חשבון`);
    
    // ניקוי הטופס
    const form = document.getElementById('addAccountForm');
    if (form) {
        form.reset();
    }
    
    // הצגת המודל
    const modalElement = document.getElementById('addAccountModal');
    if (modalElement) {
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        } else {
            // גיבוי אם Bootstrap לא זמין
            modalElement.style.display = 'block';
            modalElement.classList.add('show');
            document.body.classList.add('modal-open');
        }
    } else {
        console.error('❌ מודל הוספת חשבון לא נמצא');
    }
}

/**
 * הצגת אזהרה עם טבלת טריידים פתוחים
 * הפונקציה מציגה מודל עם טבלה של הטריידים הפתוחים
 * 
 * @param {string} accountName - שם החשבון
 * @param {Array} openTrades - מערך של טריידים פתוחים
 * @param {string} action - סוג הפעולה ('cancel' או 'delete')
 * 
 * @example
 * showOpenTradesWarning('חשבון בדיקה', openTradesArray, 'cancel');
 */
async function showOpenTradesWarning(accountName, openTrades, action = 'cancel') {
    console.log(`⚠️ הצגת אזהרה עם ${openTrades.length} טריידים פתוחים`);
    
    try {
        // קבלת כל הטיקרים כדי לקבל את הסימבולים
        const tickersResponse = await apiCall('/api/v1/tickers/');
        const tickers = tickersResponse.data || tickersResponse;
        
        // יצירת מפה של ticker_id -> symbol
        const tickerMap = {};
        tickers.forEach(ticker => {
            tickerMap[ticker.id] = ticker.symbol;
        });
        
        // יצירת תוכן הטבלה עם סימבולים
        const tableRows = openTrades.map(trade => {
            const symbol = tickerMap[trade.ticker_id] || `טיקר ${trade.ticker_id}`;
            return `
                <tr>
                    <td>${symbol}</td>
                    <td>${formatDateTime(trade.opened_at)}</td>
                    <td>#${trade.id}</td>
                </tr>
            `;
        }).join('');
    
    // בחירת כותרת והודעה לפי סוג הפעולה
    const isDelete = action === 'delete';
    const title = isDelete ? '⚠️ לא ניתן למחוק חשבון' : '⚠️ לא ניתן לבטל חשבון';
    const actionText = isDelete ? 'למחוק' : 'לבטל';
    const actionPast = isDelete ? 'למחוק' : 'לבטל';
    
    // יצירת תוכן המודל
    const modalContent = `
        <div class="modal-header">
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            <h5 class="modal-title">${title}</h5>
        </div>
        <div class="modal-body">
            <div class="alert alert-warning">
                <strong>הסבר:</strong> לא ניתן ${actionText} את החשבון "${accountName}" כיוון שיש לו טריידים פתוחים.
                יש לסגור תחילה את כל הטריידים הפתוחים.
            </div>
            
            <h6>טריידים פתוחים:</h6>
            <div class="table-responsive">
                <table class="table table-sm table-striped">
                    <thead>
                        <tr>
                            <th>סימבול</th>
                            <th>תאריך פתיחה</th>
                            <th>מזהה טרייד</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
            
            <div class="mt-3">
                <small class="text-muted">
                    <strong>פעולות נדרשות:</strong>
                    <ul class="mb-0 mt-1">
                        <li>עבור לכל טרייד פתוח וסגור אותו</li>
                        <li>לאחר סגירת כל הטריידים, נסה שוב ${actionText} את החשבון</li>
                    </ul>
                </small>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">סגור</button>
            <button type="button" class="btn btn-primary" onclick="window.location.href='/trades'">עבור לטריידים</button>
        </div>
    `;
    
    // יצירת או עדכון מודל האזהרה
    let warningModal = document.getElementById('openTradesWarningModal');
    if (!warningModal) {
        warningModal = document.createElement('div');
        warningModal.id = 'openTradesWarningModal';
        warningModal.className = 'modal fade';
        warningModal.setAttribute('tabindex', '-1');
        warningModal.setAttribute('aria-labelledby', 'openTradesWarningModalLabel');
        warningModal.setAttribute('aria-hidden', 'true');
        document.body.appendChild(warningModal);
    }
    
    warningModal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                ${modalContent}
            </div>
        </div>
    `;
    
    // הצגת המודל
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modal = new bootstrap.Modal(warningModal);
        modal.show();
    } else {
        // גיבוי אם Bootstrap לא זמין
        warningModal.style.display = 'block';
        warningModal.classList.add('show');
        document.body.classList.add('modal-open');
        
        // הוספת backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(backdrop);
    }
    
    } catch (error) {
        console.error('❌ שגיאה בהצגת אזהרת טריידים פתוחים:', error);
        // הצגת הודעת שגיאה פשוטה
        alert(`שגיאה בהצגת פרטי הטריידים הפתוחים: ${error.message}`);
    }
}

/**
 * פונקציה עזר לעיצוב תאריך ושעה
 * 
 * @param {string} dateTimeString - מחרוזת תאריך ושעה
 * @returns {string} תאריך ושעה מעוצב
 */
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '-';
    
    try {
        const date = new Date(dateTimeString);
        return date.toLocaleString('he-IL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateTimeString;
    }
}

/**
 * רענון טבלת חשבונות
 * הפונקציה מרעננת את טבלת החשבונות בדף הנוכחי
 * 
 * @param {string} pageType - סוג הדף ('accounts' או 'database')
 * 
 * @example
 * refreshAccountsTable('accounts');
 */
function refreshAccountsTable(pageType = 'accounts') {
    console.log(`🔄 רענון טבלת חשבונות בדף ${pageType}`);
    
    if (pageType === 'accounts') {
        // רענון בדף החשבונות
        if (typeof loadTable === 'function') {
            loadTable('accounts');
        }
        if (typeof loadAccountsData === 'function') {
            loadAccountsData();
        }
    } else if (pageType === 'database') {
        // רענון בדף בסיס נתונים
        if (typeof loadAccounts === 'function') {
            loadAccounts();
        }
    }
}

/**
 * טעינת נתונים מהשרת לדף החשבונות
 * הפונקציה טוענת את כל החשבונות ומחשבת סטטיסטיקות
 * 
 * @example
 * loadAccountsData();
 */
async function loadAccountsData() {
    try {
        console.log('🔄 טוען נתוני חשבונות...');
        
        // טעינת כל החשבונות
        const response = await apiCall('/api/v1/accounts/');
        const accounts = response.data || [];
        
        // חישוב סטטיסטיקות
        const stats = calculateAccountsStats(accounts);
        updateAccountsStats(stats);
        
        console.log(`✅ נטענו ${accounts.length} חשבונות`);
        return accounts;
    } catch (error) {
        console.error('❌ שגיאה בטעינת נתוני חשבונות:', error);
        throw error;
    }
}

/**
 * עדכון סטטיסטיקות בדף החשבונות
 * 
 * @param {Object} stats - אובייקט הסטטיסטיקות
 * 
 * @example
 * updateAccountsStats({ active_accounts: 5, total_value: 100000 });
 */
function updateAccountsStats(stats) {
    const activeAccountsElement = document.getElementById('activeAccounts');
    const totalValueElement = document.getElementById('totalValue');
    const totalProfitElement = document.getElementById('totalProfit');
    const profitPercentageElement = document.getElementById('profitPercentage');
    
    if (activeAccountsElement) {
        activeAccountsElement.textContent = stats.active_accounts || 0;
    }
    if (totalValueElement) {
        const value = stats.total_value || 0;
        totalValueElement.textContent = `₪${value.toLocaleString()}`;
    }
    if (totalProfitElement) {
        const profit = stats.total_profit_loss || 0;
        totalProfitElement.textContent = `${profit >= 0 ? '+' : ''}₪${profit.toLocaleString()}`;
        totalProfitElement.className = `stat-value ${profit >= 0 ? 'positive' : 'negative'}`;
    }
    if (profitPercentageElement) {
        const percentage = stats.profit_percentage || 0;
        profitPercentageElement.textContent = `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
        profitPercentageElement.className = `stat-value ${percentage >= 0 ? 'positive' : 'negative'}`;
    }
}

/**
 * הצגת מודל הוספת חשבון
 * 
 * @example
 * showAddAccountModal();
 */
function showAddAccountModal() {
    console.log('📝 הצגת מודל הוספת חשבון');
    
    // ניקוי הטופס
    const form = document.getElementById('addAccountForm');
    if (form) {
        form.reset();
    }
    
    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('addAccountModal'));
    modal.show();
}

/**
 * הצגת מודל עריכת חשבון
 * 
 * @param {Object} account - אובייקט החשבון
 * 
 * @example
 * showEditAccountModal(accountObject);
 */
function showEditAccountModal(account) {
    console.log(`✏️ הצגת מודל עריכת חשבון: ${account.name}`);
    
    // מילוי הטופס עם נתוני החשבון
    document.getElementById('editAccountId').value = account.id;
    document.getElementById('editAccountName').value = account.name;
    document.getElementById('editAccountCurrency').value = account.currency;
    
    // המרת סטטוס לעברית
    const statusValue = convertAccountStatusToHebrew(account.status);
    document.getElementById('editAccountStatus').value = statusValue;
    
    document.getElementById('editAccountCashBalance').value = account.cash_balance || '';
    document.getElementById('editAccountTotalValue').value = account.total_value || '';
    document.getElementById('editAccountTotalPl').value = account.total_pl || '';
    document.getElementById('editAccountNotes').value = account.notes || '';
    
    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('editAccountModal'));
    modal.show();
}

/**
 * שמירת חשבון חדש
 * 
 * @example
 * saveAccount();
 */
async function saveAccount() {
    console.log('💾 שמירת חשבון חדש...');
    
    const form = document.getElementById('addAccountForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const accountData = collectAccountAddData();
    
    // הצגת אינדיקטור טעינה
    const saveButton = document.querySelector('#addAccountModal .btn-primary');
    const originalText = saveButton.textContent;
    saveButton.textContent = 'שומר...';
    saveButton.disabled = true;
    
    try {
        const result = await createAccount(accountData);
        
        if (result) {
            // סגירת המודל
            const modal = bootstrap.Modal.getInstance(document.getElementById('addAccountModal'));
            modal.hide();
            
            // טעינת נתונים מחדש
            await loadAccountsData();
            if (typeof loadTable === 'function') {
                loadTable('accounts');
            }
            
            // הצגת הודעה
            showNotification('חשבון נוסף בהצלחה!', 'success');
        }
    } catch (error) {
        console.error('❌ שגיאה בשמירת חשבון:', error);
        showNotification('שגיאה בהוספת החשבון', 'error');
    } finally {
        // החזרת הכפתור למצב רגיל
        saveButton.textContent = originalText;
        saveButton.disabled = false;
    }
}

/**
 * עדכון חשבון מהמודל
 * 
 * @example
 * updateAccountFromModal();
 */
async function updateAccountFromModal() {
    console.log('💾 עדכון חשבון מהמודל...');
    
    const form = document.getElementById('editAccountForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const accountId = document.getElementById('editAccountId').value;
    const accountData = collectAccountEditData();
    
    try {
        const result = await updateAccount(accountId);
        
        if (result) {
            // סגירת המודל
            const modal = bootstrap.Modal.getInstance(document.getElementById('editAccountModal'));
            modal.hide();
            
            // טעינת נתונים מחדש
            await loadAccountsData();
            if (typeof loadTable === 'function') {
                loadTable('accounts');
            }
            
            // הצגת הודעה
            showNotification('חשבון עודכן בהצלחה!', 'success');
        }
    } catch (error) {
        console.error('❌ שגיאה בעדכון חשבון:', error);
        showNotification('שגיאה בעדכון החשבון', 'error');
    }
}

/**
 * מחיקת חשבון מהמודל
 * 
 * @example
 * deleteAccountFromModal();
 */
async function deleteAccountFromModal() {
    console.log('🗑️ מחיקת חשבון מהמודל...');
    
    const accountId = document.getElementById('editAccountId').value;
    const accountName = document.getElementById('editAccountName').value;
    
    try {
        const result = await deleteAccount(accountId, accountName);
        
        if (result) {
            // סגירת המודל
            const modal = bootstrap.Modal.getInstance(document.getElementById('editAccountModal'));
            modal.hide();
            
            // טעינת נתונים מחדש
            await loadAccountsData();
            if (typeof loadTable === 'function') {
                loadTable('accounts');
            }
            
            // הצגת הודעה
            showNotification('חשבון נמחק בהצלחה!', 'success');
        }
    } catch (error) {
        console.error('❌ שגיאה במחיקת חשבון:', error);
        showNotification('שגיאה במחיקת החשבון', 'error');
    }
}

/**
 * איסוף נתוני הוספת חשבון מהטופס
 * 
 * @returns {Object} נתוני החשבון
 * 
 * @example
 * const data = collectAccountAddData();
 */
function collectAccountAddData() {
    const statusDisplay = document.getElementById('accountStatus').value || 'פתוח';
    const status = convertAccountStatus(statusDisplay);
    
    return {
        name: document.getElementById('accountName').value,
        currency: document.getElementById('accountCurrency').value,
        status: status,
        cash_balance: parseFloat(document.getElementById('accountCashBalance').value) || 0,
        total_value: parseFloat(document.getElementById('accountTotalValue').value) || 0,
        total_pl: parseFloat(document.getElementById('accountTotalPl').value) || 0,
        notes: document.getElementById('accountNotes').value
    };
}

/**
 * הצגת הודעה למשתמש
 * 
 * @param {string} message - הודעת ההודעה
 * @param {string} type - סוג ההודעה ('success', 'error', 'warning', 'info')
 * 
 * @example
 * showNotification('חשבון נוסף בהצלחה!', 'success');
 */
function showNotification(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// הפיכת הפונקציות לזמינות גלובלית
window.loadAccountsData = loadAccountsData;
window.calculateAccountsStats = calculateAccountsStats;
window.convertAccountStatus = convertAccountStatus;
window.convertAccountStatusToHebrew = convertAccountStatusToHebrew;
window.fillAccountEditModal = fillAccountEditModal;
window.collectAccountEditData = collectAccountEditData;
window.updateAccount = updateAccount;
window.deleteAccount = deleteAccount;
window.cancelAccount = cancelAccount;
window.createAccount = createAccount;
window.showAccountEditModal = showAccountEditModal;
window.showAccountAddModal = showAccountAddModal;
window.refreshAccountsTable = refreshAccountsTable;
window.showOpenTradesWarning = showOpenTradesWarning;
window.formatDateTime = formatDateTime;

// פונקציות חדשות לדף החשבונות
window.updateAccountsStats = updateAccountsStats;
window.showAddAccountModal = showAddAccountModal;
window.showEditAccountModal = showEditAccountModal;
window.saveAccount = saveAccount;
window.updateAccountFromModal = updateAccountFromModal;
window.deleteAccountFromModal = deleteAccountFromModal;
window.collectAccountAddData = collectAccountAddData;
window.showNotification = showNotification;

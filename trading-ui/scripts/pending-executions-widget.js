/**
 * Pending Executions Widget
 * מציג עסקאות הדורשות שיוך לטרייד בדף הבית
 * 
 * Created: 2025-10-14
 * Updated: 2025-01-29
 * Version: 2.0
 */

// ========================================
// Global Variables
// ========================================

let pendingExecutionsData = [];

// ========================================
// Main Functions
// ========================================

/**
 * טעינת עסקאות הדורשות שיוך
 */
async function loadPendingExecutions() {
    try {
        window.Logger?.info('🔄 Loading pending executions...', { page: "index" });
        
        const response = await fetch('/api/executions/pending-assignment');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
            const executions = result.data || [];
            const count = executions.length;
            
            window.Logger?.info(`✅ Loaded ${count} pending executions`, { page: "index" });
            
            // שמירת הנתונים גלובלית
            pendingExecutionsData = executions;
            
            // עדכון תצוגה
            updatePendingExecutionsDisplay(executions, count);
            
        } else {
            throw new Error(result.error?.message || 'Unknown API error');
        }
        
    } catch (error) {
        window.Logger?.error('❌ Error loading pending executions:', error, { page: "index" });
        
        // הצגת שגיאה בממשק
        const container = document.getElementById('pendingExecutionsTableContainer');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    שגיאה בטעינת עסקאות ממתינות: ${error.message}
                </div>`;
        }
        
        // עדכון מונה לשגיאה
        const countElement = document.getElementById('pendingExecutionsCount');
        if (countElement) {
            countElement.textContent = '!';
            countElement.className = 'badge bg-danger';
        }
        
        // הודעת שגיאה (אם מערכת ההודעות זמינה)
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בטעינת עסקאות ממתינות לשיוך', error.message);
        }
    }
}

/**
 * עדכון תצוגת עסקאות ממתינות
 */
function updatePendingExecutionsDisplay(executions, count) {
    // עדכון מונה
    const countElement = document.getElementById('pendingExecutionsCount');
    if (countElement) {
        countElement.textContent = count;
        countElement.className = count > 0 ? 'badge bg-warning' : 'badge bg-success';
    }
    
    // עדכון תצוגה בהתאם למספר העסקאות
    const messageElement = document.getElementById('pendingExecutionsMessage');
    const tableContainer = document.getElementById('pendingExecutionsTableContainer');
    
    if (count === 0) {
        // הצג הודעה "הכל תקין"
        if (messageElement) {
            messageElement.style.display = 'block';
            messageElement.innerHTML = `
                <i class="fas fa-check-circle text-success"></i>
                <strong>הכל תקין!</strong> כל העסקאות משוייכות לטרייד.
            `;
        }
        if (tableContainer) {
            tableContainer.style.display = 'none';
        }
    } else {
        // הצג טבלה
        if (messageElement) {
            messageElement.style.display = 'none';
        }
        if (tableContainer) {
            tableContainer.style.display = 'block';
            renderPendingExecutionsTable(executions);
        }
    }
}

/**
 * רינדור טבלת עסקאות ממתינות
 */
function renderPendingExecutionsTable(executions) {
    const tableContainer = document.getElementById('pendingExecutionsTableContainer');
    if (!tableContainer) {
        window.Logger?.warn('⚠️ pendingExecutionsTableContainer not found', { page: "index" });
        return;
    }
    
    // יצירת הטבלה
    const tableHTML = `
        <div class="table-responsive">
            <table class="data-table executions-table" id="pendingExecutionsTable">
                <thead>
                    <tr>
                        <th>תאריך</th>
                        <th>סוג</th>
                        <th>כמות</th>
                        <th>מחיר</th>
                        <th>טיקר</th>
                        <th>חשבון</th>
                        <th>פעולות</th>
                    </tr>
                </thead>
                <tbody>
                    ${executions.map(execution => renderPendingExecutionRow(execution)).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    tableContainer.innerHTML = tableHTML;
}

/**
 * רינדור שורה בטבלת עסקאות ממתינות
 */
function renderPendingExecutionRow(execution) {
    // עיצוב תאריך
    const date = execution.date ? new Date(execution.date).toLocaleDateString('he-IL') : '-';
    
    // עיצוב סוג עסקה
    const actionBadge = execution.action === 'buy' 
        ? '<span class="badge bg-success">קניה</span>' 
        : '<span class="badge bg-danger">מכירה</span>';
    
    // עיצוב טיקר
    const tickerSymbol = execution.ticker_symbol || execution.symbol || 'לא מוגדר';
    const tickerBadge = `
        <span class="linked-badge entity-ticker pending-assignment" 
              title="עסקה ממתינה לשיוך לטרייד">
            ${tickerSymbol}
        </span>`;
    
    // פורמט מחיר
    const price = execution.price ? `$${parseFloat(execution.price).toFixed(2)}` : '-';
    
    // תוכן השורה
    return `
        <tr data-execution-id="${execution.id}">
            <td>${date}</td>
            <td>${actionBadge}</td>
            <td>${execution.quantity || '-'}</td>
            <td>${price}</td>
            <td>${tickerBadge}</td>
            <td>${execution.account_name || '-'}</td>
            <td class="actions-cell">
                <button class="btn btn-sm btn-outline-primary" 
                        onclick="editExecutionFromWidget(${execution.id})" 
                        title="ערוך עסקה">
                    ✏️
                </button>
                <button class="btn btn-sm btn-outline-danger" 
                        onclick="deleteExecutionFromWidget(${execution.id})" 
                        title="מחק עסקה">
                    🗑️
                </button>
                <button class="btn btn-sm btn-outline-success" 
                        onclick="goToExecutionsPage(${execution.id})" 
                        title="עבור לדף עסקאות">
                    🔗
                </button>
            </td>
        </tr>
    `;
}

// ========================================
// Action Functions
// ========================================

/**
 * עריכת עסקה מהוידג'ט
 */
function editExecutionFromWidget(executionId) {
    window.Logger?.info(`✏️ Editing execution ${executionId} from widget`, { page: "index" });
    
    // מעבר לדף עסקאות ופתיחת עריכה
    const url = `/executions?edit=${executionId}`;
    window.location.href = url;
}

/**
 * מחיקת עסקה מהוידג'ט
 */
function deleteExecutionFromWidget(executionId) {
    window.Logger?.info(`🗑️ Deleting execution ${executionId} from widget`, { page: "index" });
    
    // בדיקה אם יש פונקציה גלובלית למחיקה
    if (typeof window.deleteExecution === 'function') {
        window.deleteExecution(executionId);
        
        // רענון הוידג'ט אחרי מחיקה
        setTimeout(() => {
            loadPendingExecutions();
        }, 500);
    } else {
        // אם אין פונקציה גלובלית - מעבר לדף עסקאות
        goToExecutionsPage(executionId);
    }
}

/**
 * מעבר לדף עסקאות עם הדגשת עסקה ספציפית
 */
function goToExecutionsPage(executionId = null) {
    const url = executionId ? `/executions?highlight=${executionId}` : '/executions';
    window.location.href = url;
}

/**
 * רענון וידג'ט עסקאות ממתינות
 */
function refreshPendingExecutionsWidget() {
    window.Logger?.info('🔄 Refreshing pending executions widget...', { page: "index" });
    loadPendingExecutions();
}

// ========================================
// Global Exports
// ========================================

// הפיכת הפונקציות לגלובליות
window.loadPendingExecutions = loadPendingExecutions;
window.refreshPendingExecutionsWidget = refreshPendingExecutionsWidget;
window.editExecutionFromWidget = editExecutionFromWidget;
window.deleteExecutionFromWidget = deleteExecutionFromWidget;
window.goToExecutionsPage = goToExecutionsPage;

// ========================================
// Auto-Initialization
// ========================================

// אתחול דרך UnifiedAppInitializer
window.initializePendingExecutionsWidget = () => {
    window.Logger?.info('📊 Pending Executions Widget initialized', { page: "index" });
    
    // בדיקה שהאלמנטים קיימים
    const countElement = document.getElementById('pendingExecutionsCount');
    const containerElement = document.getElementById('pendingExecutionsTableContainer');
    
    if (countElement && containerElement) {
        // טעינה ראשונית
        loadPendingExecutions();
        
        // רענון כל 30 שניות
        setInterval(loadPendingExecutions, 30000);
        
        window.Logger?.info('✅ Pending Executions Widget auto-refresh enabled (30s)', { page: "index" });
    } else {
        window.Logger?.warn('⚠️ Pending Executions Widget elements not found - widget disabled', { page: "index" });
    }
};

window.Logger?.info('📊 Pending Executions Widget script loaded', { page: "index" });


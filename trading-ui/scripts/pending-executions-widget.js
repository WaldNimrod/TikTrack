/**
 * Pending Executions Widget
 * מציג עסקאות הדורשות שיוך לטרייד בדף הבית
 * 
 * Created: 2025-10-14
 * Version: 1.0
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
        console.log('🔄 Loading pending executions...');
        
        const response = await fetch('/api/executions/pending-assignment');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
            const executions = result.data || [];
            const count = executions.length;
            
            console.log(`✅ Loaded ${count} pending executions`);
            
            // שמירת הנתונים גלובלית
            pendingExecutionsData = executions;
            
            // עדכון תצוגה
            updatePendingExecutionsDisplay(executions, count);
            
        } else {
            throw new Error(result.error?.message || 'Unknown API error');
        }
        
    } catch (error) {
        console.error('❌ Error loading pending executions:', error);
        
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
        console.warn('⚠️ pendingExecutionsTableContainer not found');
        return;
    }
    
    // יצירת הטבלה
    const tableHTML = `
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
    const actionBadge = `<span class="badge ${execution.action === 'buy' ? 'bg-success' : 'bg-danger'}">
        ${execution.action === 'buy' ? 'קניה' : 'מכירה'}
    </span>`;
    
    // עיצוב טיקר
    const tickerBadge = `
        <span class="linked-badge entity-ticker pending-assignment" 
              title="עסקה ממתינה לשיוך לטרייד">
            ${execution.ticker_symbol || execution.linked_display || 'לא מוגדר'}
        </span>`;
    
    // תוכן השורה
    return `
        <tr data-execution-id="${execution.id}">
            <td>${date}</td>
            <td>${actionBadge}</td>
            <td>${execution.quantity || '-'}</td>
            <td>$${execution.price ? execution.price.toFixed(2) : '0.00'}</td>
            <td>${tickerBadge}</td>
            <td>${execution.account_name || '-'}</td>
            <td class="actions-cell">
                <div class="actions-menu-container">
                    <button class="btn-icon actions-trigger" onclick="toggleActionsMenu(this, event)" title="פעולות">⋮</button>
                    <div class="actions-menu">
                        <button onclick="editExecutionFromWidget(${execution.id})" title="ערוך עסקה">
                            <i class="fas fa-edit"></i> ערוך
                        </button>
                        <button onclick="deleteExecutionFromWidget(${execution.id})" title="מחק עסקה">
                            <i class="fas fa-trash"></i> מחק
                        </button>
                        <button onclick="goToExecutionsPage(${execution.id})" title="עבור לדף עסקאות">
                            <i class="fas fa-external-link-alt"></i> פתח בדף עסקאות
                        </button>
                    </div>
                </div>
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
    console.log(`✏️ Editing execution ${executionId} from widget`);
    
    // מעבר לדף עסקאות ופתיחת עריכה
    const url = `/executions?edit=${executionId}`;
    window.location.href = url;
}

/**
 * מחיקת עסקה מהוידג'ט
 */
function deleteExecutionFromWidget(executionId) {
    console.log(`🗑️ Deleting execution ${executionId} from widget`);
    
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
    console.log('🔄 Refreshing pending executions widget...');
    loadPendingExecutions();
}

// ========================================
// Helper Functions
// ========================================

/**
 * פונקציה להחלפת תפריט פעולות (תואמת למערכת הקיימת)
 */
function toggleActionsMenu(button, event) {
    if (event) {
        event.stopPropagation();
    }
    
    // סגירת כל התפריטים הפתוחים
    document.querySelectorAll('.actions-menu.show').forEach(menu => {
        if (menu !== button.nextElementSibling) {
            menu.classList.remove('show');
        }
    });
    
    // החלפת תפריט נוכחי
    const menu = button.nextElementSibling;
    if (menu) {
        menu.classList.toggle('show');
    }
}

// סגירת תפריטים בלחיצה חיצונית
document.addEventListener('click', (event) => {
    if (!event.target.closest('.actions-menu-container')) {
        document.querySelectorAll('.actions-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

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

// טעינה אוטומטית כשהדף נטען
document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Pending Executions Widget initialized');
    
    // בדיקה שהאלמנטים קיימים
    const countElement = document.getElementById('pendingExecutionsCount');
    const containerElement = document.getElementById('pendingExecutionsTableContainer');
    
    if (countElement && containerElement) {
        // טעינה ראשונית
        loadPendingExecutions();
        
        // רענון כל 30 שניות
        setInterval(loadPendingExecutions, 30000);
        
        console.log('✅ Pending Executions Widget auto-refresh enabled (30s)');
    } else {
        console.warn('⚠️ Pending Executions Widget elements not found - widget disabled');
    }
});

console.log('📊 Pending Executions Widget script loaded');

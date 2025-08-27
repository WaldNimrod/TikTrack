// ===== EXECUTIONS MANAGEMENT =====
// קובץ ייעודי לניהול ביצועים - משותף לכל הדפים

/**
 * טעינת ביצועים מהשרת
 * הפונקציה טוענת את כל הביצועים ומחזירה אותם
 * 
 * @returns {Promise<Array>} מערך של ביצועים
 * 
 * @example
 * const executions = await loadExecutionsData();
 */
async function loadExecutionsData() {
    try {
        console.log('🔄 טוען ביצועים...');
        const response = await apiCall('/api/v1/executions/');
        const executions = response.data || response;
        console.log(`✅ נטענו ${executions.length} ביצועים`);
        return executions;
    } catch (error) {
        console.error('❌ שגיאה בטעינת ביצועים:', error);
        throw error;
    }
}

/**
 * חישוב סטטיסטיקות מנתוני הביצועים
 * הפונקציה מחשבת סטטיסטיקות כלליות מנתוני הביצועים
 * 
 * @param {Array} executions - מערך של ביצועים
 * @returns {Object} אובייקט עם הסטטיסטיקות
 * 
 * @example
 * const stats = calculateExecutionsStats(executions);
 */
function calculateExecutionsStats(executions) {
    const buyExecutions = executions.filter(exec => exec.action === 'buy').length;
    const sellExecutions = executions.filter(exec => exec.action === 'sell').length;
    const totalQuantity = executions.reduce((sum, exec) => sum + (exec.quantity || 0), 0);
    const totalFees = executions.reduce((sum, exec) => sum + (exec.fee || 0), 0);
    const totalValue = executions.reduce((sum, exec) => sum + ((exec.quantity || 0) * (exec.price || 0)), 0);
    
    return {
        buy_executions: buyExecutions,
        sell_executions: sellExecutions,
        total_executions: executions.length,
        total_quantity: totalQuantity,
        total_fees: totalFees,
        total_value: totalValue
    };
}

/**
 * המרת פעולת ביצוע לעברית
 * הפונקציה ממירה ערכים באנגלית לערכים לתצוגה בעברית
 * 
 * @param {string} action - פעולה באנגלית
 * @returns {string} פעולה בעברית
 * 
 * @example
 * const actionDisplay = convertExecutionActionToHebrew('buy'); // returns 'קנייה'
 */
function convertExecutionActionToHebrew(action) {
    if (action === 'buy') {
        return 'קנייה';
    } else if (action === 'sell') {
        return 'מכירה';
    }
    return action || '-';
}

/**
 * המרת פעולת ביצוע מעברית לאנגלית
 * הפונקציה ממירה ערכים בעברית לערכים שהשרת מצפה להם
 * 
 * @param {string} actionDisplay - פעולה בעברית
 * @returns {string} פעולה באנגלית
 * 
 * @example
 * const action = convertExecutionAction('קנייה'); // returns 'buy'
 */
function convertExecutionAction(actionDisplay) {
    if (actionDisplay === 'קנייה') {
        return 'buy';
    } else if (actionDisplay === 'מכירה') {
        return 'sell';
    }
    return actionDisplay || 'buy';
}

/**
 * מילוי נתונים במודל עריכת ביצוע
 * הפונקציה ממלאת את כל השדות במודל העריכה עם נתוני הביצוע
 * 
 * @param {Object} execution - נתוני הביצוע
 * 
 * @example
 * fillExecutionEditModal(executionData);
 */
function fillExecutionEditModal(execution) {
    console.log(`🔧 מילוי מודל עריכת ביצוע עם נתונים:`, execution);
    
    // מילוי שדות הטופס
    document.getElementById('editExecutionId').value = execution.id;
    document.getElementById('editExecutionTradeId').value = execution.trade_id || '';
    document.getElementById('editExecutionAction').value = convertExecutionActionToHebrew(execution.action);
    document.getElementById('editExecutionDate').value = execution.date ? execution.date.substring(0, 16) : '';
    document.getElementById('editExecutionQuantity').value = execution.quantity || '';
    document.getElementById('editExecutionPrice').value = execution.price || '';
    document.getElementById('editExecutionFee').value = execution.fee || '';
    document.getElementById('editExecutionSource').value = execution.source || '';
}

/**
 * איסוף נתונים ממודל עריכת ביצוע
 * הפונקציה אוספת את כל הנתונים מהמודל ומחזירה אובייקט
 * 
 * @returns {Object} אובייקט עם נתוני הביצוע
 * 
 * @example
 * const executionData = collectExecutionEditData();
 */
function collectExecutionEditData() {
    const executionData = {
        trade_id: document.getElementById('editExecutionTradeId').value ? parseInt(document.getElementById('editExecutionTradeId').value) : null,
        action: convertExecutionAction(document.getElementById('editExecutionAction').value),
        date: document.getElementById('editExecutionDate').value,
        quantity: parseFloat(document.getElementById('editExecutionQuantity').value) || 0,
        price: parseFloat(document.getElementById('editExecutionPrice').value) || 0,
        fee: parseFloat(document.getElementById('editExecutionFee').value) || 0,
        source: document.getElementById('editExecutionSource').value.trim()
    };
    
    console.log('📝 נתונים שנאספו ממודל עריכת ביצוע:', executionData);
    return executionData;
}

/**
 * איסוף נתונים ממודל הוספת ביצוע
 * הפונקציה אוספת את כל הנתונים מהמודל ומחזירה אובייקט
 * 
 * @returns {Object} אובייקט עם נתוני הביצוע החדש
 * 
 * @example
 * const executionData = collectExecutionAddData();
 */
function collectExecutionAddData() {
    const executionData = {
        trade_id: document.getElementById('executionTradeId').value ? parseInt(document.getElementById('executionTradeId').value) : null,
        action: convertExecutionAction(document.getElementById('executionAction').value),
        date: document.getElementById('executionDate').value,
        quantity: parseFloat(document.getElementById('executionQuantity').value) || 0,
        price: parseFloat(document.getElementById('executionPrice').value) || 0,
        fee: parseFloat(document.getElementById('executionFee').value) || 0,
        source: document.getElementById('executionSource').value.trim()
    };
    
    console.log('📝 נתונים שנאספו ממודל הוספת ביצוע:', executionData);
    return executionData;
}

/**
 * יצירת ביצוע חדש
 * הפונקציה שולחת בקשה לשרת ליצירת ביצוע חדש
 * 
 * @param {Object} executionData - נתוני הביצוע החדש
 * @returns {Promise<Object>} תשובה מהשרת
 * 
 * @example
 * const result = await createExecution(executionData);
 */
async function createExecution(executionData) {
    try {
        console.log('🚀 יוצר ביצוע חדש:', executionData);
        
        const response = await apiCall('/api/v1/executions/', {
            method: 'POST',
            body: JSON.stringify(executionData)
        });
        
        console.log('✅ ביצוע נוצר בהצלחה:', response);
        showNotification('ביצוע נוצר בהצלחה!', 'success');
        return response;
    } catch (error) {
        console.error('❌ שגיאה ביצירת ביצוע:', error);
        showNotification('שגיאה ביצירת ביצוע: ' + (error.message || 'שגיאה לא ידועה'), 'error');
        throw error;
    }
}

/**
 * עדכון ביצוע קיים
 * הפונקציה שולחת בקשה לשרת לעדכון ביצוע קיים
 * 
 * @param {number} executionId - מזהה הביצוע
 * @returns {Promise<Object>} תשובה מהשרת
 * 
 * @example
 * const result = await updateExecution(1);
 */
async function updateExecution(executionId) {
    try {
        const executionData = collectExecutionEditData();
        console.log(`🔄 מעדכן ביצוע ${executionId}:`, executionData);
        
        const response = await apiCall(`/api/v1/executions/${executionId}`, {
            method: 'PUT',
            body: JSON.stringify(executionData)
        });
        
        console.log('✅ ביצוע עודכן בהצלחה:', response);
        showNotification('ביצוע עודכן בהצלחה!', 'success');
        return response;
    } catch (error) {
        console.error('❌ שגיאה בעדכון ביצוע:', error);
        showNotification('שגיאה בעדכון ביצוע: ' + (error.message || 'שגיאה לא ידועה'), 'error');
        throw error;
    }
}

/**
 * מחיקת ביצוע
 * הפונקציה שולחת בקשה לשרת למחיקת ביצוע
 * 
 * @param {number} executionId - מזהה הביצוע
 * @param {string} executionAction - פעולת הביצוע
 * @returns {Promise<Object>} תשובה מהשרת
 * 
 * @example
 * const result = await deleteExecution(1, 'buy');
 */
async function deleteExecution(executionId, executionAction) {
    try {
        // אישור מחיקה
        const confirmed = confirm(`האם אתה בטוח שברצונך למחוק את הביצוע "${convertExecutionActionToHebrew(executionAction)}"?\n\nפעולה זו לא ניתנת לביטול.`);
        if (!confirmed) {
            console.log('❌ מחיקת ביצוע בוטלה על ידי המשתמש');
            return null;
        }
        
        console.log(`🗑️ מוחק ביצוע ${executionId}: ${executionAction}`);
        const response = await apiCall(`/api/v1/executions/${executionId}`, {
            method: 'DELETE'
        });
        
        console.log('✅ ביצוע נמחק בהצלחה:', response);
        showNotification(`ביצוע "${convertExecutionActionToHebrew(executionAction)}" נמחק בהצלחה!`, 'success');
        return response;
    } catch (error) {
        console.error('❌ שגיאה במחיקת ביצוע:', error);
        showNotification('שגיאה במחיקת ביצוע: ' + (error.message || 'שגיאה לא ידועה'), 'error');
        throw error;
    }
}

/**
 * ביטול ביצוע (שינוי סטטוס למבוטל)
 * הפונקציה שולחת בקשה לשרת לביטול ביצוע
 * 
 * @param {number} executionId - מזהה הביצוע
 * @param {string} executionAction - פעולת הביצוע
 * @returns {Promise<Object>} תשובה מהשרת
 * 
 * @example
 * const result = await cancelExecution(1, 'buy');
 */
async function cancelExecution(executionId, executionAction) {
    try {
        // אישור ביטול
        const confirmed = confirm(`האם אתה בטוח שברצונך לבטל את הביצוע "${convertExecutionActionToHebrew(executionAction)}"?\n\nהביצוע יסומן כבוטל.`);
        if (!confirmed) {
            console.log('❌ ביטול ביצוע בוטל על ידי המשתמש');
            return null;
        }
        
        console.log(`🚫 מבטל ביצוע ${executionId}: ${executionAction}`);
        const response = await apiCall(`/api/v1/executions/${executionId}`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'cancelled' })
        });
        
        console.log('✅ ביצוע בוטל בהצלחה:', response);
        showNotification(`ביצוע "${convertExecutionActionToHebrew(executionAction)}" בוטל בהצלחה!`, 'success');
        return response;
    } catch (error) {
        console.error('❌ שגיאה בביטול ביצוע:', error);
        showNotification('שגיאה בביטול ביצוע: ' + (error.message || 'שגיאה לא ידועה'), 'error');
        throw error;
    }
}

/**
 * הצגת מודל הוספת ביצוע
 * הפונקציה מציגה את המודל להוספת ביצוע חדש
 * 
 * @example
 * showAddExecutionModal();
 */
function showAddExecutionModal() {
    console.log('📝 מציג מודל הוספת ביצוע');
    
    // ניקוי הטופס
    document.getElementById('executionTradeId').value = '';
    document.getElementById('executionAction').value = 'קנייה';
    document.getElementById('executionDate').value = new Date().toISOString().substring(0, 16);
    document.getElementById('executionQuantity').value = '';
    document.getElementById('executionPrice').value = '';
    document.getElementById('executionFee').value = '';
    document.getElementById('executionSource').value = 'manual';
    
    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('addExecutionModal'));
    modal.show();
}

/**
 * הצגת מודל עריכת ביצוע
 * הפונקציה מציגה את המודל לעריכת ביצוע קיים
 * 
 * @param {Object} execution - נתוני הביצוע
 * 
 * @example
 * showEditExecutionModal(executionData);
 */
function showEditExecutionModal(execution) {
    console.log('✏️ מציג מודל עריכת ביצוע:', execution);
    
    // מילוי הנתונים
    fillExecutionEditModal(execution);
    
    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('editExecutionModal'));
    modal.show();
}

/**
 * שמירת ביצוע חדש
 * הפונקציה שומרת ביצוע חדש ומרעננת את הטבלה
 * 
 * @example
 * saveExecution();
 */
async function saveExecution() {
    try {
        const executionData = collectExecutionAddData();
        
        // בדיקות תקינות
        if (!executionData.trade_id) {
            showNotification('מזהה טרייד הוא שדה חובה', 'error');
            return;
        }
        
        if (!executionData.quantity || executionData.quantity <= 0) {
            showNotification('כמות חייב להיות גדול מ-0', 'error');
            return;
        }
        
        if (!executionData.price || executionData.price <= 0) {
            showNotification('מחיר חייב להיות גדול מ-0', 'error');
            return;
        }
        
        await createExecution(executionData);
        
        // סגירת המודל
        const modal = bootstrap.Modal.getInstance(document.getElementById('addExecutionModal'));
        modal.hide();
        
        // רענון הטבלה
        await refreshExecutionsTable();
        
    } catch (error) {
        console.error('❌ שגיאה בשמירת ביצוע:', error);
    }
}

/**
 * עדכון ביצוע מהמודל
 * הפונקציה מעדכנת ביצוע קיים ומרעננת את הטבלה
 * 
 * @example
 * updateExecutionFromModal();
 */
async function updateExecutionFromModal() {
    try {
        const executionId = document.getElementById('editExecutionId').value;
        const executionData = collectExecutionEditData();
        
        // בדיקות תקינות
        if (!executionData.trade_id) {
            showNotification('מזהה טרייד הוא שדה חובה', 'error');
            return;
        }
        
        if (!executionData.quantity || executionData.quantity <= 0) {
            showNotification('כמות חייב להיות גדול מ-0', 'error');
            return;
        }
        
        if (!executionData.price || executionData.price <= 0) {
            showNotification('מחיר חייב להיות גדול מ-0', 'error');
            return;
        }
        
        await updateExecution(executionId);
        
        // סגירת המודל
        const modal = bootstrap.Modal.getInstance(document.getElementById('editExecutionModal'));
        modal.hide();
        
        // רענון הטבלה
        await refreshExecutionsTable();
        
    } catch (error) {
        console.error('❌ שגיאה בעדכון ביצוע:', error);
    }
}

/**
 * רענון טבלת ביצועים
 * הפונקציה מרעננת את טבלת הביצועים עם נתונים עדכניים
 * 
 * @example
 * await refreshExecutionsTable();
 */
async function refreshExecutionsTable() {
    try {
        console.log('🔄 מרענן טבלת ביצועים...');
        const executions = await loadExecutionsData();
        
        // עדכון הטבלה (תלוי בדף)
        if (typeof updateExecutionsTable === 'function') {
            updateExecutionsTable(executions);
        }
        
        // עדכון סטטיסטיקות (תלוי בדף)
        if (typeof updateExecutionsStats === 'function') {
            const stats = calculateExecutionsStats(executions);
            updateExecutionsStats(stats);
        }
        
        console.log('✅ טבלת ביצועים רועננה בהצלחה');
    } catch (error) {
        console.error('❌ שגיאה ברענון טבלת ביצועים:', error);
    }
}

/**
 * הצגת הודעה למשתמש
 * הפונקציה מציגה הודעה למשתמש
 * 
 * @param {string} message - תוכן ההודעה
 * @param {string} type - סוג ההודעה (success/error/warning/info)
 * 
 * @example
 * showNotification('הביצוע נשמר בהצלחה!', 'success');
 */
function showNotification(message, type = 'info') {
    // בדיקה אם יש פונקציה גלובלית
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    // הצגה פשוטה
    console.log(`${type.toUpperCase()}: ${message}`);
    alert(message);
}

// ===== EXPORT FUNCTIONS TO GLOBAL SCOPE =====

// פונקציות עיקריות
window.loadExecutionsData = loadExecutionsData;
window.calculateExecutionsStats = calculateExecutionsStats;
window.convertExecutionAction = convertExecutionAction;
window.convertExecutionActionToHebrew = convertExecutionActionToHebrew;
window.fillExecutionEditModal = fillExecutionEditModal;
window.collectExecutionEditData = collectExecutionEditData;
window.collectExecutionAddData = collectExecutionAddData;
window.createExecution = createExecution;
window.updateExecution = updateExecution;
window.deleteExecution = deleteExecution;
window.cancelExecution = cancelExecution;

// פונקציות UI
window.showAddExecutionModal = showAddExecutionModal;
window.showEditExecutionModal = showEditExecutionModal;
window.saveExecution = saveExecution;
window.updateExecutionFromModal = updateExecutionFromModal;
window.refreshExecutionsTable = refreshExecutionsTable;
window.showNotification = showNotification;

console.log('✅ קובץ executions.js נטען בהצלחה - פונקציות זמינות גלובלית');

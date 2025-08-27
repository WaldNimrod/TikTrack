// ===== CRUD UTILS - פונקציות גלובליות לעריכה ומחיקה =====

/**
 * עריכת רשומה בטבלה
 * @param {string} tableType - סוג הטבלה
 * @param {number} id - מזהה הרשומה
 * @param {Object} data - נתונים לעדכון
 */
function editRecord(tableType, id, data) {
    console.log(`🔄 Editing ${tableType} record ${id}:`, data);
    
    // קריאה לפונקציה הספציפית של הטבלה
    const editFunction = window[`edit${tableType.charAt(0).toUpperCase() + tableType.slice(1)}Record`];
    if (typeof editFunction === 'function') {
        editFunction(id, data);
    } else {
        console.error(`❌ edit${tableType.charAt(0).toUpperCase() + tableType.slice(1)}Record function not found`);
    }
}

/**
 * מחיקת רשומה מטבלה
 * @param {string} tableType - סוג הטבלה
 * @param {number} id - מזהה הרשומה
 */
function deleteRecord(tableType, id) {
    console.log(`🗑️ Deleting ${tableType} record ${id}`);
    
    // קריאה לפונקציה הספציפית של הטבלה
    const deleteFunction = window[`delete${tableType.charAt(0).toUpperCase() + tableType.slice(1)}Record`];
    if (typeof deleteFunction === 'function') {
        deleteFunction(id);
    } else {
        console.error(`❌ delete${tableType.charAt(0).toUpperCase() + tableType.slice(1)}Record function not found`);
    }
}

/**
 * ביטול רשומה בטבלה
 * @param {string} tableType - סוג הטבלה
 * @param {number} id - מזהה הרשומה
 */
function cancelRecord(tableType, id) {
    console.log(`❌ Cancelling ${tableType} record ${id}`);
    
    // קריאה לפונקציה הספציפית של הטבלה
    const cancelFunction = window[`cancel${tableType.charAt(0).toUpperCase() + tableType.slice(1)}Record`];
    if (typeof cancelFunction === 'function') {
        cancelFunction(id);
    } else {
        console.error(`❌ cancel${tableType.charAt(0).toUpperCase() + tableType.slice(1)}Record function not found`);
    }
}

// ייצוא פונקציות גלובליות
window.editRecord = editRecord;
window.deleteRecord = deleteRecord;
window.cancelRecord = cancelRecord;

// ===== NOTES MANAGEMENT =====
// קובץ ייעודי לניהול הערות - משותף לכל הדפים

/**
 * טעינת הערות מהשרת
 * הפונקציה טוענת את כל ההערות ומחזירה אותן
 * 
 * @returns {Promise<Array>} מערך של הערות
 * 
 * @example
 * const notes = await loadNotesData();
 */
async function loadNotesData() {
    try {
        console.log('🔄 טוען הערות...');
        const response = await window.apiCall('/api/v1/notes/');
        const notes = response.data || response;
        console.log(`✅ נטענו ${notes.length} הערות`);
        return notes;
    } catch (error) {
        console.error('❌ שגיאה בטעינת הערות:', error);
        throw error;
    }
}

/**
 * חישוב סטטיסטיקות מנתוני ההערות
 * הפונקציה מחשבת סטטיסטיקות כלליות מנתוני ההערות
 * 
 * @param {Array} notes - מערך של הערות
 * @returns {Object} אובייקט עם הסטטיסטיקות
 * 
 * @example
 * const stats = calculateNotesStats(notes);
 */
function calculateNotesStats(notes) {
    const activeNotes = notes.filter(note => note.status === 'פעיל').length;
    const totalNotes = notes.length;
    const importantNotes = notes.filter(note => note.is_important).length;
    const recentNotes = notes.filter(note => {
        const noteDate = new Date(note.created_at);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return noteDate > weekAgo;
    }).length;
    
    return {
        active_notes: activeNotes,
        total_notes: totalNotes,
        important_notes: importantNotes,
        recent_notes: recentNotes
    };
}

/**
 * המרת סטטוס הערה מ-עברית לאנגלית
 * הפונקציה ממירה ערכים בעברית לערכים שהשרת מצפה להם
 * 
 * @param {string} statusDisplay - סטטוס בעברית
 * @returns {string} סטטוס באנגלית
 * 
 * @example
 * const status = convertNoteStatus('פעיל'); // returns 'active'
 */
function convertNoteStatus(statusDisplay) {
    if (statusDisplay === 'פעיל') return 'active';
    if (statusDisplay === 'לא פעיל') return 'inactive';
    if (statusDisplay === 'מבוטל') return 'cancelled';
    return statusDisplay || 'active';
}

/**
 * המרת סטטוס הערה מאנגלית לעברית
 * הפונקציה ממירה ערכים מהשרת לערכים לתצוגה בעברית
 * 
 * @param {string} status - סטטוס באנגלית
 * @returns {string} סטטוס בעברית
 * 
 * @example
 * const statusDisplay = convertNoteStatusToHebrew('active'); // returns 'פעיל'
 */
function convertNoteStatusToHebrew(status) {
    if (status === 'active' || status === 'פעיל') {
        return 'פעיל';
    } else if (status === 'inactive' || status === 'לא פעיל') {
        return 'לא פעיל';
    } else if (status === 'cancelled' || status === 'מבוטל') {
        return 'מבוטל';
    }
    return status || 'פעיל';
}

/**
 * מילוי נתונים במודל עריכת הערה
 * הפונקציה ממלאת את כל השדות במודל העריכה עם נתוני ההערה
 * 
 * @param {Object} note - נתוני ההערה
 * 
 * @example
 * fillNoteEditModal(noteData);
 */
function fillNoteEditModal(note) {
    console.log(`🔧 מילוי מודל עריכת הערה עם נתונים:`, note);
    
    // בדיקה שהאלמנטים קיימים
    const editNoteId = document.getElementById('editNoteId');
    const editNoteContent = document.getElementById('editNoteContent');
    const editNoteAccountId = document.getElementById('editNoteAccountId');
    const editNoteTradeId = document.getElementById('editNoteTradeId');
    const editNoteTradePlanId = document.getElementById('editNoteTradePlanId');
    const editNoteAttachment = document.getElementById('editNoteAttachment');
    
    if (!editNoteId || !editNoteContent || !editNoteAccountId || !editNoteTradeId || !editNoteTradePlanId || !editNoteAttachment) {
        console.error('❌ לא נמצאו כל האלמנטים הנדרשים למודל עריכת הערה');
        console.log('אלמנטים שנבדקו:', {
            editNoteId: !!editNoteId,
            editNoteContent: !!editNoteContent,
            editNoteAccountId: !!editNoteAccountId,
            editNoteTradeId: !!editNoteTradeId,
            editNoteTradePlanId: !!editNoteTradePlanId,
            editNoteAttachment: !!editNoteAttachment
        });
        return;
    }
    
    // מילוי שדות הטופס
    editNoteId.value = note.id;
    editNoteContent.value = note.content || '';
    editNoteAccountId.value = note.account_id || '';
    editNoteTradeId.value = note.trade_id || '';
    editNoteTradePlanId.value = note.trade_plan_id || '';
    editNoteAttachment.value = note.attachment || '';
    
    console.log('✅ מודל עריכת הערה מולא בהצלחה');
}

/**
 * איסוף נתונים ממודל עריכת הערה
 * הפונקציה אוספת את כל הנתונים מהמודל ומחזירה אובייקט
 * 
 * @returns {Object} אובייקט עם נתוני ההערה
 * 
 * @example
 * const noteData = collectNoteEditData();
 */
function collectNoteEditData() {
    const noteData = {
        content: document.getElementById('editNoteContent').value.trim(),
        account_id: document.getElementById('editNoteAccountId').value ? parseInt(document.getElementById('editNoteAccountId').value) : null,
        trade_id: document.getElementById('editNoteTradeId').value ? parseInt(document.getElementById('editNoteTradeId').value) : null,
        trade_plan_id: document.getElementById('editNoteTradePlanId').value ? parseInt(document.getElementById('editNoteTradePlanId').value) : null,
        attachment: document.getElementById('editNoteAttachment').value.trim()
    };
    
    console.log('📝 נתונים שנאספו ממודל עריכת הערה:', noteData);
    return noteData;
}

/**
 * איסוף נתונים ממודל הוספת הערה
 * הפונקציה אוספת את כל הנתונים מהמודל ומחזירה אובייקט
 * 
 * @returns {Object} אובייקט עם נתוני ההערה החדשה
 * 
 * @example
 * const noteData = collectNoteAddData();
 */
function collectNoteAddData() {
    const noteData = {
        content: document.getElementById('noteContent').value.trim(),
        account_id: document.getElementById('noteAccountId').value ? parseInt(document.getElementById('noteAccountId').value) : null,
        trade_id: document.getElementById('noteTradeId').value ? parseInt(document.getElementById('noteTradeId').value) : null,
        trade_plan_id: document.getElementById('noteTradePlanId').value ? parseInt(document.getElementById('noteTradePlanId').value) : null,
        attachment: document.getElementById('noteAttachment').value.trim()
    };
    
    console.log('📝 נתונים שנאספו ממודל הוספת הערה:', noteData);
    return noteData;
}

/**
 * יצירת הערה חדשה
 * הפונקציה שולחת בקשה לשרת ליצירת הערה חדשה
 * 
 * @param {Object} noteData - נתוני ההערה החדשה
 * @returns {Promise<Object>} תשובה מהשרת
 * 
 * @example
 * const result = await createNote(noteData);
 */
async function createNote(noteData) {
    try {
        console.log('🚀 יוצר הערה חדשה:', noteData);
        
        const response = await window.apiCall('/api/v1/notes/', {
            method: 'POST',
            body: JSON.stringify(noteData)
        });
        
        console.log('✅ הערה נוצרה בהצלחה:', response);
        showNotification('הערה נוצרה בהצלחה!', 'success');
        return response;
    } catch (error) {
        console.error('❌ שגיאה ביצירת הערה:', error);
        showNotification('שגיאה ביצירת הערה: ' + (error.message || 'שגיאה לא ידועה'), 'error');
        throw error;
    }
}

/**
 * עדכון הערה קיימת
 * הפונקציה שולחת בקשה לשרת לעדכון הערה קיימת
 * 
 * @param {number} noteId - מזהה ההערה
 * @returns {Promise<Object>} תשובה מהשרת
 * 
 * @example
 * const result = await updateNote(1);
 */
async function updateNote(noteId) {
    try {
        const noteData = collectNoteEditData();
        console.log(`🔄 מעדכן הערה ${noteId}:`, noteData);
        
        const response = await window.apiCall(`/api/v1/notes/${noteId}`, {
            method: 'PUT',
            body: JSON.stringify(noteData)
        });
        
        console.log('✅ הערה עודכנה בהצלחה:', response);
        showNotification('הערה עודכנה בהצלחה!', 'success');
        return response;
    } catch (error) {
        console.error('❌ שגיאה בעדכון הערה:', error);
        showNotification('שגיאה בעדכון הערה: ' + (error.message || 'שגיאה לא ידועה'), 'error');
        throw error;
    }
}

/**
 * מחיקת הערה
 * הפונקציה שולחת בקשה לשרת למחיקת הערה
 * 
 * @param {number} noteId - מזהה ההערה
 * @param {string} noteTitle - כותרת ההערה
 * @returns {Promise<Object>} תשובה מהשרת
 * 
 * @example
 * const result = await deleteNote(1, 'הערה חשובה');
 */
async function deleteNote(noteId, noteTitle) {
    try {
        // אישור מחיקה
        const confirmed = confirm(`האם אתה בטוח שברצונך למחוק את ההערה "${noteTitle}"?\n\nפעולה זו לא ניתנת לביטול.`);
        if (!confirmed) {
            console.log('❌ מחיקת הערה בוטלה על ידי המשתמש');
            return null;
        }
        
        console.log(`🗑️ מוחק הערה ${noteId}: ${noteTitle}`);
        const response = await window.apiCall(`/api/v1/notes/${noteId}`, {
            method: 'DELETE'
        });
        
        console.log('✅ הערה נמחקה בהצלחה:', response);
        showNotification(`הערה "${noteTitle}" נמחקה בהצלחה!`, 'success');
        return response;
    } catch (error) {
        console.error('❌ שגיאה במחיקת הערה:', error);
        showNotification('שגיאה במחיקת הערה: ' + (error.message || 'שגיאה לא ידועה'), 'error');
        throw error;
    }
}

/**
 * ביטול הערה (שינוי סטטוס למבוטל)
 * הפונקציה שולחת בקשה לשרת לביטול הערה
 * 
 * @param {number} noteId - מזהה ההערה
 * @param {string} noteTitle - כותרת ההערה
 * @returns {Promise<Object>} תשובה מהשרת
 * 
 * @example
 * const result = await cancelNote(1, 'הערה חשובה');
 */
async function cancelNote(noteId, noteTitle) {
    try {
        // אישור ביטול
        const confirmed = confirm(`האם אתה בטוח שברצונך לבטל את ההערה "${noteTitle}"?\n\nהסטטוס ישתנה ל"מבוטל".`);
        if (!confirmed) {
            console.log('❌ ביטול הערה בוטל על ידי המשתמש');
            return null;
        }
        
        console.log(`🚫 מבטל הערה ${noteId}: ${noteTitle}`);
        const response = await window.apiCall(`/api/v1/notes/${noteId}`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'מבוטל' })
        });
        
        console.log('✅ הערה בוטלה בהצלחה:', response);
        showNotification(`הערה "${noteTitle}" בוטלה בהצלחה!`, 'success');
        return response;
    } catch (error) {
        console.error('❌ שגיאה בביטול הערה:', error);
        showNotification('שגיאה בביטול הערה: ' + (error.message || 'שגיאה לא ידועה'), 'error');
        throw error;
    }
}

/**
 * הצגת מודל הוספת הערה
 * הפונקציה מציגה את המודל להוספת הערה חדשה
 * 
 * @example
 * showAddNoteModal();
 */
function showAddNoteModal() {
    console.log('📝 מציג מודל הוספת הערה');
    
    // ניקוי הטופס
    document.getElementById('noteContent').value = '';
    document.getElementById('noteAccountId').value = '';
    document.getElementById('noteTradeId').value = '';
    document.getElementById('noteTradePlanId').value = '';
    document.getElementById('noteAttachment').value = '';
    
    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('addNoteModal'));
    modal.show();
}

/**
 * הצגת מודל עריכת הערה
 * הפונקציה מציגה את המודל לעריכת הערה קיימת
 * 
 * @param {Object} note - נתוני ההערה
 * 
 * @example
 * showEditNoteModal(noteData);
 */
function showEditNoteModal(note) {
    console.log('✏️ מציג מודל עריכת הערה:', note);
    
    // בדיקה שהנתונים קיימים
    if (!note || !note.id) {
        console.error('❌ נתונים לא תקינים למודל עריכת הערה:', note);
        showNotification('שגיאה בטעינת נתוני ההערה', 'error');
        return;
    }
    
    // מילוי הנתונים
    fillNoteEditModal(note);
    
    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('editNoteModal'));
    modal.show();
}

/**
 * שמירת הערה חדשה
 * הפונקציה שומרת הערה חדשה ומרעננת את הטבלה
 * 
 * @example
 * saveNote();
 */
async function saveNote() {
    try {
        const noteData = collectNoteAddData();
        
        // בדיקות תקינות
        if (!noteData.content) {
            showNotification('תוכן ההערה הוא שדה חובה', 'error');
            return;
        }
        
        await createNote(noteData);
        
        // סגירת המודל
        const modal = bootstrap.Modal.getInstance(document.getElementById('addNoteModal'));
        modal.hide();
        
        // רענון הטבלה
        await refreshNotesTable();
        
    } catch (error) {
        console.error('❌ שגיאה בשמירת הערה:', error);
    }
}

/**
 * עדכון הערה מהמודל
 * הפונקציה מעדכנת הערה קיימת ומרעננת את הטבלה
 * 
 * @example
 * updateNoteFromModal();
 */
async function updateNoteFromModal() {
    try {
        const noteId = document.getElementById('editNoteId').value;
        const noteData = collectNoteEditData();
        
        // בדיקות תקינות
        if (!noteData.content) {
            showNotification('תוכן ההערה הוא שדה חובה', 'error');
            return;
        }
        
        await updateNote(noteId);
        
        // סגירת המודל
        const modal = bootstrap.Modal.getInstance(document.getElementById('editNoteModal'));
        modal.hide();
        
        // רענון הטבלה
        await refreshNotesTable();
        
    } catch (error) {
        console.error('❌ שגיאה בעדכון הערה:', error);
    }
}

/**
 * עדכון טבלת הערות בדף database.html
 * הפונקציה מעדכנת את הטבלה עם נתוני ההערות
 * 
 * @param {Array} notes - מערך של הערות
 * 
 * @example
 * updateNotesTable(notes);
 */
function updateNotesTable(notes) {
    console.log('🔄 מעדכן טבלת הערות עם', notes.length, 'הערות');
    
    const tbody = document.querySelector('#notesTable tbody');
    if (!tbody) {
        console.error('❌ לא נמצא tbody לטבלת הערות');
        return;
    }
    
    tbody.innerHTML = notes.map(note => `
        <tr>
            <td>${note.id}</td>
            <td>${note.account_id || '-'}</td>
            <td>${note.trade_id || '-'}</td>
            <td>${note.trade_plan_id || '-'}</td>
            <td>${note.content ? (note.content.length > 50 ? note.content.substring(0, 50) + '...' : note.content) : '-'}</td>
            <td>${window.formatDateTime(note.created_at)}</td>
            <td>${note.attachment || '-'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="showEditNoteModal(${JSON.stringify(note).replace(/"/g, '&quot;')})">ערוך</button>
                <button class="btn btn-sm btn-warning" onclick="cancelNote(${note.id}, 'הערה ${note.id}')">ביטול</button>
                <button class="btn btn-sm btn-danger" onclick="deleteNote(${note.id}, 'הערה ${note.id}')">מחק</button>
            </td>
        </tr>
    `).join('');
    
    // עדכון ספירת רשומות
    const countElement = document.getElementById('notesCount');
    if (countElement) {
        countElement.textContent = `${notes.length} הערות`;
    }
    
    // הצגת הטבלה אם היא מוסתרת
    const section = document.getElementById('notesSection');
    const container = document.getElementById('notesContainer');
    const footer = document.querySelector('#notesSection .table-footer');
    const icon = document.querySelector('#notesSection .filter-icon');
    
    if (section && section.classList.contains('collapsed')) {
        section.classList.remove('collapsed');
        if (container) container.style.display = 'block';
        if (footer) footer.style.display = 'block';
        if (icon) icon.textContent = '▲';
        localStorage.setItem('notesSectionOpen', 'true');
    }
    
    console.log('✅ טבלת הערות עודכנה בהצלחה');
}

/**
 * רענון טבלת הערות
 * הפונקציה מרעננת את טבלת ההערות עם נתונים עדכניים
 * 
 * @example
 * await refreshNotesTable();
 */
async function refreshNotesTable() {
    try {
        console.log('🔄 מרענן טבלת הערות...');
        const notes = await loadNotesData();
        
        // עדכון הטבלה (תלוי בדף)
        if (typeof updateNotesTable === 'function') {
            updateNotesTable(notes);
        }
        
        // עדכון סטטיסטיקות (תלוי בדף)
        if (typeof updateNotesStats === 'function') {
            const stats = calculateNotesStats(notes);
            updateNotesStats(stats);
        }
        
        console.log('✅ טבלת הערות רועננה בהצלחה');
    } catch (error) {
        console.error('❌ שגיאה ברענון טבלת הערות:', error);
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
 * showNotification('ההערה נשמרה בהצלחה!', 'success');
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
window.loadNotesData = loadNotesData;
window.calculateNotesStats = calculateNotesStats;
window.convertNoteStatus = convertNoteStatus;
window.convertNoteStatusToHebrew = convertNoteStatusToHebrew;
window.fillNoteEditModal = fillNoteEditModal;
window.collectNoteEditData = collectNoteEditData;
window.collectNoteAddData = collectNoteAddData;
window.createNote = createNote;
window.updateNote = updateNote;
window.deleteNote = deleteNote;
window.cancelNote = cancelNote;

// פונקציות UI
window.showAddNoteModal = showAddNoteModal;
window.showEditNoteModal = showEditNoteModal;
window.saveNote = saveNote;
window.updateNoteFromModal = updateNoteFromModal;
window.updateNotesTable = updateNotesTable;
window.refreshNotesTable = refreshNotesTable;
window.showNotification = showNotification;

console.log('✅ קובץ notes.js נטען בהצלחה - פונקציות זמינות גלובלית');

/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 45
 * 
 * PAGE INITIALIZATION (1)
 * - setupNoteValidationEvents() - setupNoteValidationEvents function
 * 
 * DATA LOADING (7)
 * - uploadFile() - * Add new note
 * - downloadFile() - downloadFile function
 * - loadNotesData() - loadNotesData function
 * - getEditorContent() - * ניקוי עיצוב בעורך
 * - getTypeDisplayName() - getTypeDisplayName function
 * - loadNoteForViewing() - * View a note
 * - getNoteRelatedDisplay() - getNoteRelatedDisplay function
 * 
 * DATA MANIPULATION (13)
 * - addNote() - addNote function
 * - deleteNote() - * Open note details modal
 * - updateNotesTable() - updateNotesTable function
 * - updateNotesSummary() - updateNotesSummary function
 * - updateGridFromComponent() - updateGridFromComponent function
 * - saveNote() - saveNote function
 * - updateNoteFromModal() - updateNoteFromModal function
 * - confirmDeleteNote() - confirmDeleteNote function
 * - deleteNoteFromServer() - deleteNoteFromServer function
 * - removeCurrentAttachment() - removeCurrentAttachment function
 * - showAddNoteModal() - * Replace current attachment
 * - saveNote() - * הצגת מודל הוספת הערה
 * - deleteNote() - deleteNote function
 * 
 * EVENT HANDLING (5)
 * - restoreNotesSectionState() - restoreNotesSectionState function
 * - onNoteRelationTypeChange() - onNoteRelationTypeChange function
 * - clearNoteValidationErrors() - clearNoteValidationErrors function
 * - setEditorContent() - * קבלת תוכן מעורך הטקסט
 * - toggleSection() - * Replace current attachment
 * 
 * UI UPDATES (3)
 * - showTickerPage() - * שחזור מצב סידור - שימוש בפונקציה גלובלית
 * - displayCurrentAttachment() - * Edit current note
 * - showEditNoteModal() - * Toggle section using global function
 * 
 * VALIDATION (2)
 * - validateNoteForm() - validateNoteForm function
 * - validateEditNoteForm() - * ולידציה של טופס הערה
 * 
 * UTILITIES (2)
 * - formatText() - * פונקציה להצגת דף טיקר (כרגע הודעת "בפיתוח")
 * - clearFormatting() - clearFormatting function
 * 
 * OTHER (12)
 * - viewLinkedItems() - viewLinkedItems function
 * - openNoteDetails() - openNoteDetails function
 * - editNote() - * Open note details modal
 * - populateSelect() - * Update grid from component filters
 * - populateEditSelectByType() - * Handle note relation type change
 * - clearSelectedFile() - clearSelectedFile function
 * - restoreSortState() - restoreSortState function
 * - filterNotesData() - filterNotesData function
 * - filterNotesByType() - filterNotesByType function
 * - viewNote() - * Get display name for type
 * - editCurrentNote() - editCurrentNote function
 * - replaceCurrentAttachment() - replaceCurrentAttachment function
 * 
 * ==========================================
 */
/**
 * Notes Page - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains all functions for managing notes including:
 * - CRUD operations for notes
 * - Data loading and table management
 * - Form validation and UI interactions
 * - Modal handling and state management
 * - Filtering and sorting functionality
 * - Related objects integration
 * 
 * Author: TikTrack Development Team
 * Version: 2.0
 * Last Updated: 2025-01-27
 */

// ===== קובץ JavaScript פשוט לדף הערות =====

// ייצוא מוקדם של הפונקציה למניעת שגיאות
window.loadNotesData = window.loadNotesData || function() {
  // loadNotesData not yet defined, using placeholder
  window.Logger.info('⚠️ loadNotesData placeholder called', { page: "notes" });
};

// הגדרת הפונקציה המלאה מיד אחרי ה-placeholder
window.loadNotesData = async function() {
  window.Logger.info('🚀🚀🚀 loadNotesData התחיל 🚀🚀🚀', { page: "notes" });

  try {
    // קריאה לשרת לקבלת נתוני הערות
    window.Logger.info('📡 קריאה לשרת לקבלת נתוני הערות...', { page: "notes" });
    const response = await fetch('/api/notes/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    window.Logger.info('📊 נתונים שהתקבלו מהשרת:', data, { page: "notes" });

    // שמירת הנתונים במשתנה גלובלי
    window.notesData = data.data || data;
    window.Logger.info('💾 נתונים נשמרו ב-window.notesData:', window.notesData.length, 'הערות', { page: "notes" });

    // עדכון הטבלה
    if (typeof window.updateNotesTable === 'function') {
      window.Logger.info('📊 מעדכן את טבלת הערות', { page: "notes" });
      window.updateNotesTable(window.notesData);
    } else {
      window.Logger.warn('⚠️ updateNotesTable לא זמין', { page: "notes" });
    }

    // עדכון סטטיסטיקות
    if (typeof window.updateNotesSummary === 'function') {
      window.Logger.info('📈 מעדכן את סטטיסטיקות הערות', { page: "notes" });
      window.updateNotesSummary(window.notesData);
    } else {
      window.Logger.warn('⚠️ updateNotesSummary לא זמין', { page: "notes" });
    }

    // עדכון מונה הטבלה
    const countElement = document.getElementById('notesCount');
    if (countElement) {
      countElement.textContent = `${window.notesData.length} הערות`;
    }

    window.Logger.info('✅ loadNotesData הושלם בהצלחה', { page: "notes" });

  } catch (error) {
    window.Logger.error('❌ שגיאה ב-loadNotesData:', error, { page: "notes" });
    
    // הצגת הודעת שגיאה למשתמש
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בטעינת נתוני הערות', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בטעינת נתוני הערות', 'error');
    } else {
      alert('שגיאה בטעינת נתוני הערות: ' + error.message);
    }
  }
};

/**
 * Add new note
 * @function addNote
 * @returns {void}
 */
function addNote() {
  try {
    window.Logger.info('➕ מוסיף הערה חדשה', { page: "notes" });
    
    // פתיחת מודל הוספת הערה
    showAddNoteModal();
    
  } catch (error) {
    window.Logger.error('שגיאה בהוספת הערה:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהוספת הערה', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה בהוספת הערה');
    }
  }
}

/**
 * Upload file for note
 * @function uploadFile
 * @param {string} noteId - Note ID
 * @returns {void}
 */
function uploadFile(noteId) {
  try {
    window.Logger.info('📤 מעלה קובץ להערה:', noteId, { page: "notes" });
    
    // יצירת input file
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '*/*';
    
    fileInput.onchange = function(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // יצירת FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('note_id', noteId);
      
      // שליחה לשרת
      fetch('/api/notes/' + noteId + '/upload', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('שגיאה בהעלאת קובץ');
        }
        return response.json();
      })
      .then(data => {
        window.Logger.info('✅ קובץ הועלה:', data, { page: "notes" });
        
        // הודעת הצלחה
        if (typeof window.showSuccessNotification === 'function') {
          window.showSuccessNotification('קובץ הועלה בהצלחה', '', 4000, 'business');
        } else if (typeof window.showNotification === 'function') {
          window.showSuccessNotification('קובץ הועלה בהצלחה', '', 4000, 'business');
        }
      })
      .catch(error => {
        window.Logger.error('שגיאה בהעלאת קובץ:', error, { page: "notes" });
        if (typeof window.showErrorNotification === 'function') {
          window.showErrorNotification('שגיאה בהעלאת קובץ', error.message);
        } else if (typeof window.showNotification === 'function') {
          window.showErrorNotification('שגיאה בהעלאת קובץ');
        }
      });
    };
    
    // הפעלת בחירת הקובץ
    fileInput.click();
    
  } catch (error) {
    window.Logger.error('שגיאה בהעלאת קובץ:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהעלאת קובץ', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה בהעלאת קובץ');
    }
  }
}

/**
 * Download file from note
 * @function downloadFile
 * @param {string} noteId - Note ID
 * @param {string} fileName - File name
 * @returns {void}
 */
function downloadFile(noteId, fileName) {
  try {
    window.Logger.info('📥 מוריד קובץ:', noteId, fileName, { page: "notes" });
    
    // יצירת קישור להורדה
    const downloadUrl = `/api/notes/${noteId}/download/${encodeURIComponent(fileName)}`;
    
    // יצירת אלמנט a להורדה
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.target = '_blank';
    
    // הוספה לדף והפעלה
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // הודעת הצלחה
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('הורדת קובץ החלה');
    } else if (typeof window.showNotification === 'function') {
      window.showSuccessNotification('הורדת קובץ החלה');
    }
    
  } catch (error) {
    window.Logger.error('שגיאה בהורדת קובץ:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהורדת קובץ', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה בהורדת קובץ');
    }
  }
}

/**
 * View linked items for note
 * @function viewLinkedItems
 * @param {string} noteId - Note ID
 * @returns {void}
 */
function viewLinkedItems(noteId) {
  try {
    window.Logger.info('🔗 מציג פריטים מקושרים להערה:', noteId, { page: "notes" });
    
    // חיפוש ההערה בנתונים
    const note = window.notesData.find(n => n.id === noteId);
    if (!note) {
      throw new Error('הערה לא נמצאה');
    }
    
    // הצגת מודל פריטים מקושרים
    if (typeof window.showLinkedItemsModal === 'function') {
      window.showLinkedItemsModal('notes', noteId, note.title || 'הערה');
    } else if (typeof window.showModalNotification === 'function') {
      const content = `
        <div class="linked-items">
          <h5>פריטים מקושרים</h5>
          <p>הערה: ${note.title || 'ללא כותרת'}</p>
          <p>תוכן: ${note.content || 'ללא תוכן'}</p>
          <p><em>פונקציונליות מקושרים זמינה במערכת הגלובלית</em></p>
        </div>
      `;
      window.showModalNotification('פריטים מקושרים', content, 'info');
    } else {
      alert(`פריטים מקושרים להערה:\n\n` +
        `כותרת: ${note.title || 'ללא כותרת'}\n` +
        `תוכן: ${note.content || 'ללא תוכן'}\n\n` +
        `פונקציונליות מקושרים זמינה במערכת הגלובלית`);
    }
    
  } catch (error) {
    window.Logger.error('שגיאה בהצגת פריטים מקושרים:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהצגת פריטים מקושרים', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה בהצגת פריטים מקושרים');
    }
  }
}
/*
 * Notes.js - Notes Page Management
 * =================================
 *
 * This file contains all notes management functionality for the TikTrack application.
 * It handles notes CRUD operations, table updates, and user interactions.
 *
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (global utilities and sorting functions)
 * - translation-utils.js (translation functions)
 *
 * Table Mapping:
 * - Uses 'notes' table type from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 *
 * File: trading-ui/scripts/notes.js
 * Version: 2.2
 * Last Updated: August 23, 2025
 */

// פונקציות בסיסיות
/**
 * Open note details modal
 * @param {number} _id - The ID of the note
 */
function openNoteDetails(_id) {
  try {
    showAddNoteModal();
  } catch (error) {
    window.Logger.error('שגיאה בפתיחת פרטי הערה:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בפתיחת פרטי הערה', error.message);
    }
  }
}

/**
 * Edit note
 * @function editNote
 * @param {string} _id - Note ID
 * @returns {void}
 */
function editNote(_id) {
  showEditNoteModal(_id);
}

/**
 * Delete note
 * @function deleteNote
 * @param {string} id - Note ID
 * @returns {void}
 */
function deleteNote(id) {
  // שימוש במערכת הגלובלית למחיקה
  if (typeof window.showDeleteWarning === 'function') {
    window.showDeleteWarning('notes', id, 'הערה', async () => {
      // קריאה לפונקציה המקומית לאחר אישור
      await confirmDeleteNote(id);
    }, null);
  } else {
    // גיבוי למקרה שהמערכת הגלובלית לא זמינה
    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'מחיקת הערה',
        'האם אתה בטוח שברצונך למחוק הערה זו?\n\nפעולה זו אינה ניתנת לביטול.',
        async () => {
          await confirmDeleteNote(id);
        },
        () => {
        },
      );
    } else {
      // fallback אחרון - confirm רגיל
      if (typeof window.showConfirmationDialog === 'function') {
        window.showConfirmationDialog(
          'מחיקת הערה',
          'האם אתה בטוח שברצונך למחוק הערה זו?',
          () => confirmDeleteNote(id),
        );
      } else {
        if (typeof window.showConfirmationDialog === 'function') {
          window.showConfirmationDialog(
            'מחיקת הערה',
            'האם אתה בטוח שברצונך למחוק הערה זו?',
            () => confirmDeleteNote(id),
          );
        } else {
          // Fallback למקרה שמערכת התראות לא זמינה
          const confirmed = window.window.showConfirmationDialog('אישור', 'האם אתה בטוח שברצונך למחוק הערה זו?');
          if (confirmed) {
            confirmDeleteNote(id);
          }
        }
      }
    }
  }
}

// פונקציות לפתיחה/סגירה של סקשנים

// toggleSection function removed - use toggleSection('main') instead

// פונקציה לשחזור מצב הסגירה
/**
 * Restore the state of notes sections from localStorage
 * Restores the collapsed/expanded state of various sections
 */
function restoreNotesSectionState() {
  try {
    // שחזור מצב top-section (התראות וסיכום)
    const topCollapsed = localStorage.getItem('notesTopSectionHidden') === 'true';
  const topSection = document.querySelector('.top-section');

  if (topSection) {
    const sectionBody = topSection.querySelector('.section-body');
    const toggleBtn = topSection.querySelector('button[onclick="toggleSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody && topCollapsed) {
      sectionBody.style.display = 'none';
      if (icon) {
        icon.textContent = '▼';
      }
    }
  }

  // שחזור מצב סקשן ההערות
  const notesCollapsed = localStorage.getItem('notesMainSectionHidden') === 'true';
  const contentSections = document.querySelectorAll('.content-section');
  const notesSection = contentSections[0];

  if (notesSection) {
    const sectionBody = notesSection.querySelector('.section-body');
    const toggleBtn = notesSection.querySelector('button[onclick="toggleSection(\'main\')"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody && notesCollapsed) {
      sectionBody.style.display = 'none';
      if (icon) {
        icon.textContent = '▼';
      }
    }
  }
  
  } catch (error) {
    window.Logger.error('שגיאה בשחזור מצב סקשנים:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בשחזור מצב סקשנים', error.message);
    }
  }
}

// פונקציות נוספות

// הגדרת הפונקציות כגלובליות
window.openNoteDetails = openNoteDetails;
window.editNote = editNote;
window.deleteNote = deleteNote;
// window.toggleSection removed - using global version from ui-utils.js
// toggleSection export removed - use toggleSection('main') instead
window.restoreNotesSectionState = restoreNotesSectionState;

// פונקציה לטעינת נתונים
/**
 * Load notes data from server
 * @function loadNotesData
 * @async
 * @returns {Promise<void>}
 */
async function loadNotesData() {
  window.Logger.info('Loading notes data (bypass cache)', { page: "notes" });

  try {
    // קריאה ישירה לשרת עם timestamp למניעת cache
    const response = await fetch(`/api/notes/?_t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    const notes = responseData.data || responseData;
    window.Logger.info('✅ נתונים התקבלו מהשרת:', notes ? notes.length : 0, 'הערות', { page: "notes" });

    // בדיקה אם הנתונים ריקים או לא תקינים
    if (!notes || notes.length === 0) {
      // window.Logger.warn('⚠️ לא נמצאו הערות בשרת', { page: "notes" });
      const tbody = document.querySelector('#notesTable tbody');
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center text-muted">
              <div style="padding: 20px;">
                <h5>📝 אין הערות</h5>
                <p>לא נמצאו הערות במערכת</p>
                <button data-button-type="ADD" data-onclick="openNoteDetails()" data-classes="btn-sm"></button>
              </div>
            </td>
          </tr>
        `;
        
        // 🔘 עדכון כפתורים דינמיים
        if (window.ButtonSystem && typeof window.ButtonSystem.initializeButtons === 'function') {
          window.ButtonSystem.initializeButtons();
        }
      }
      return;
    }

    // טעינת נתונים נוספים (חשבונות, טריידים, תוכניות, טיקרים)

    // פונקציה לטעינת נתונים עם טיפול בשגיאות
    const loadDataSafely = async (url, _dataName) => {
      try {
        const innerResponse = await fetch(url);
        if (!innerResponse.ok) {
          // window.Logger.warn(`⚠️ שגיאה בטעינת ${_dataName}: ${innerResponse.status}`, { page: "notes" });
          return [];
        }
        const data = await innerResponse.json();
        if (data.status === 'error') {
          // window.Logger.warn(`⚠️ שגיאה ב-API ${_dataName}: ${data.error?.message || 'שגיאה לא ידועה'}`, { page: "notes" });
          return [];
        }
        return Array.isArray(data.data) ? data.data : [];
      } catch {
        // window.Logger.warn(`⚠️ שגיאה בטעינת ${_dataName}:`, { page: "notes" });
        return [];
      }
    };

    const [accounts, trades, tradePlans, tickers] = await Promise.all([
      loadDataSafely('/api/accounts/', 'חשבונות'),
      loadDataSafely('/api/trades/', 'טריידים'),
      loadDataSafely('/api/trade_plans/', 'תוכניות'),
      loadDataSafely('/api/tickers/', 'טיקרים'),
    ]);

    // שמירת הנתונים ב-window לסינון
    window.notesData = notes;
    window.accountsData = accounts;
    window.tradesData = trades;
    window.tradePlansData = tradePlans;
    window.tickersData = tickers;

    // עדכון הטבלה עם הנתונים הנוספים
    // עדכון הטבלה עם הערות
    updateNotesTable(notes, accounts, trades, tradePlans, tickers);
    // loadNotesData הושלם בהצלחה

  } catch (error) {
    handleApiError(error, 'טעינת נתונים');

    // הצגת הודעת שגיאה בטבלה
    const tbody = document.querySelector('#notesTable tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-danger">
            <div style="padding: 20px;">
              <h5>❌ שגיאה בטעינת נתונים</h5>
              <p>לא ניתן לטעון נתונים מהשרת</p>
              <p class="small text-muted">${error.message}</p>
              <button class="btn btn-sm" onclick="loadNotesData()">נסה שוב</button>
            </div>
          </td>
        </tr>
      `;
      
      // 🔘 עדכון כפתורים דינמיים
      if (window.ButtonSystem && typeof window.ButtonSystem.initializeButtons === 'function') {
        window.ButtonSystem.initializeButtons();
      }
    }

    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בטעינת נתונים מהשרת: ' + error.message);
    } else {
      handleApiError(error, 'טעינת נתונים מהשרת');
    }
  }
}

/**
 * Update notes table display
 * @function updateNotesTable
 * @param {Array} notes - Notes array
 * @param {Array} accounts - Accounts array
 * @param {Array} trades - Trades array
 * @param {Array} tradePlans - Trade plans array
 * @param {Array} tickers - Tickers array
 * @returns {void}
 */
function updateNotesTable(notes, accounts = [], trades = [], tradePlans = [], tickers = []) {
  try {
    window.Logger.info('🚀🚀🚀 updateNotesTable התחיל עם', notes ? notes.length : 0, 'הערות 🚀🚀🚀', { page: "notes" });
    
    const tbody = document.querySelector('#notesTable tbody');
  if (!tbody) {
    window.Logger.error('❌ לא נמצא tbody בטבלה', { page: "notes" });
    handleElementNotFound('updateNotesTable', 'לא נמצא tbody בטבלה');
    return;
  }
  
  window.Logger.info('✅ tbody נמצא:', tbody, { page: "notes" });

  if (!notes || notes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted">
          <div style="padding: 20px;">
            <h5>📝 אין הערות</h5>
            <p>לא נמצאו הערות במערכת</p>
            <button class="btn btn-sm" onclick="openNoteDetails()">הוסף הערה ראשונה</button>
          </div>
        </td>
      </tr>
    `;
    
    // 🔘 עדכון כפתורים דינמיים
    if (window.ButtonSystem && typeof window.ButtonSystem.initializeButtons === 'function') {
      window.ButtonSystem.initializeButtons();
    }
    return;
  }

  // בניית שורות הטבלה
  const rows = notes.map(note => {
    const date = note.created_at ? new Date(note.created_at).toLocaleDateString('he-IL') : 'לא מוגדר';

    // הצגת תוכן כטקסט פשוט בלבד
    let contentDisplay = note.content || 'ללא תוכן';
    // הסרת תגי HTML אם יש
    contentDisplay = contentDisplay.replace(/<[^>]*>/g, '');
    // הגבלה ל-100 תווים
    if (contentDisplay.length > 100) {
      contentDisplay = contentDisplay.substring(0, 100) + '...';
    }

    // הצגת קובץ עם אייקון ו-10 תווים ראשונים
    let attachmentDisplay = '-';
    if (note.attachment) {
      const fileName = note.attachment;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      let fileIcon = '📄'; // ברירת מחדל

      // קביעת אייקון לפי סוג הקובץ
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(fileExtension)) {
        fileIcon = '🖼️';
      } else if (['pdf'].includes(fileExtension)) {
        fileIcon = '📕';
      } else if (['doc', 'docx'].includes(fileExtension)) {
        fileIcon = '📘';
      } else if (['txt'].includes(fileExtension)) {
        fileIcon = '📄';
      } else if (['xls', 'xlsx'].includes(fileExtension)) {
        fileIcon = '📊';
      }

      // הצגת אייקון + 10 תווים ראשונים
      const shortName = fileName.length > 10 ? fileName.substring(0, 10) + '...' : fileName;
      attachmentDisplay = `${fileIcon} ${shortName}`;
    }

    // קביעת סימבול ואובייקט מקושר באמצעות המערכת הכללית
    const dataSources = {
      accounts: accounts,
      trades: trades,
      tradePlans: tradePlans,
      tickers: tickers
    };

    const relatedObjectInfo = window.getRelatedObjectDisplay ? 
      window.getRelatedObjectDisplay(note, dataSources, { showLink: false, format: 'simple' }) :
      { display: 'כללי', icon: '🌐', class: 'related-general', color: '', bgColor: '', type: 'general', id: null };

    const relatedDisplay = relatedObjectInfo.display;
    const relatedClass = relatedObjectInfo.class;

    // קביעת סימבול באמצעות המערכת הכללית
    const symbolDisplay = window.getRelatedObjectSymbol ? 
      window.getRelatedObjectSymbol(note, dataSources) : '-';

    // קביעת סוג לפילטר באמצעות המערכת הכללית
    let typeForFilter = 'כללי';
    if (note.related_type_id && window.getRelatedObjectTypeNameHebrew) {
      typeForFilter = window.getRelatedObjectTypeNameHebrew(note.related_type_id);
    } else if (note.related_type_id) {
      // Fallback למערכת הישנה
      switch (note.related_type_id) {
      case 1: typeForFilter = 'חשבון מסחר'; break;
      case 2: typeForFilter = 'טרייד'; break;
      case 3: typeForFilter = 'תוכנית'; break;
      case 4: typeForFilter = 'טיקר'; break;
      default: typeForFilter = 'כללי';
      }
    }

    // יצירת קישור לסימבול (אם יש סימבול)
    let symbolLink = symbolDisplay;
    if (note.related_type_id === 1) {
      // עבור חשבונות - הצג רק אייקון קישור
      symbolLink = `<a href='#' onclick='viewLinkedItemsForNote(${note.id})' ` +
        'class=\'symbol-link\' title=\'עבור לדף החשבון מסחר\'>🔗</a>';
    } else if (symbolDisplay && symbolDisplay !== '-' && symbolDisplay !== '') {
      // עבור טיקרים, טריידים ותוכניות - הצג אייקון קישור + סימבול
      symbolLink = `<a href='#' onclick='showTickerPage("${symbolDisplay}")' ` +
        `class='symbol-link' title='עבור לדף הטיקר'>🔗</a> ${symbolDisplay}`;
    }

    return `
      <tr onclick='viewNote(${note.id})' style='cursor: pointer;'>
        <td class='ticker-cell'><span class='symbol-text'>${symbolDisplay || '-'}</span></td>
        <td>${contentDisplay}</td>
        <td style='padding: 0;' data-type='${typeForFilter}'>
          <div class='related-object-cell ${relatedClass}' 
            style='justify-content: flex-start; text-align: right; min-width: 150px;'>
            ${relatedDisplay}
          </div>
        </td>
        <td data-date='${note.created_at}'>${date}</td>
        <td>${attachmentDisplay}</td>
        <td class='actions-cell' onclick='event.stopPropagation();'>
          ${window.createActionsMenu ? window.createActionsMenu([
            { type: 'VIEW', onclick: `window.showEntityDetails('note', ${note.id}, { mode: 'view' })`, title: 'צפה בפרטי הערה' },
            { type: 'LINK', onclick: `window.showLinkedItemsModal && window.showLinkedItemsModal([], "note", ${note.id})`, title: 'צפה בפריטים מקושרים' },
            { type: 'EDIT', onclick: `editNote("${note.id}")`, title: 'ערוך הערה' },
            { type: 'DELETE', onclick: `deleteNote("${note.id}")`, title: 'מחק הערה' }
          ]) : `
          <button data-button-type="VIEW" data-variant="small" 
            data-onclick='window.showEntityDetails("note", ${note.id}, { mode: "view" })' 
            data-text="" title='צפה בפרטי הערה'>
          </button>
          <button data-button-type="LINK" data-variant="small" 
            data-onclick='window.showLinkedItemsModal && window.showLinkedItemsModal([], "note", ${note.id})' 
            data-text="" title='צפה בפריטים מקושרים'>
          </button>
          <button data-button-type="EDIT" data-variant="small" 
            data-onclick='editNote("${note.id}")' 
            data-text="" title='ערוך הערה'>
          </button>
          <button data-button-type="DELETE" data-variant="small" 
            data-onclick='deleteNote("${note.id}")' 
            data-text="" title='מחק הערה'>
          </button>
          `}
        </td>
      </tr>
    `;
  }).join('');

  tbody.innerHTML = rows;
  window.Logger.info('✅ טבלת הערות עודכנה בהצלחה עם', notes.length, 'הערות', { page: "notes" });
  window.Logger.info('🔍 מספר שורות בטבלה:', tbody.children.length, { page: "notes" });
  
  // עדכון table-count ו-info-summary
  updateNotesSummary(notes);
  
  // 🔘 עדכון כפתורים דינמיים
  if (window.ButtonSystem && typeof window.ButtonSystem.initializeButtons === 'function') {
    window.ButtonSystem.initializeButtons();
  }
  
  } catch (error) {
    window.Logger.error('שגיאה בעדכון טבלת הערות:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון טבלת הערות', error.message);
    }
  }
}

// פונקציה לעדכון סיכום הערות
/**
 * Update the notes summary section
 * @param {Array} notes - Array of notes to summarize
 */
function updateNotesSummary(notes) {
  try {
    // שמירת המספר המקורי לחיפוש
    window.originalNotesCount = notes.length;

  // עדכון table-count
  const tableCountElement = document.querySelector('.table-count');
  if (tableCountElement) {
    tableCountElement.textContent = `${notes.length} הערות`;
  }

  // מערכת מאוחדת לסיכום נתונים
  if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS) {
    const config = window.INFO_SUMMARY_CONFIGS.notes;
    window.InfoSummarySystem.calculateAndRender(notes, config);
  } else {
    // מערכת סיכום נתונים לא זמינה
    const summaryStatsElement = document.getElementById('summaryStats');
    if (summaryStatsElement) {
      summaryStatsElement.innerHTML = `
        <div style="color: #dc3545; font-weight: bold;">
          ⚠️ מערכת סיכום נתונים לא זמינה - נא לרענן את הדף
        </div>
      `;
    }
  }
  
  } catch (error) {
    window.Logger.error('שגיאה בעדכון סיכום הערות:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון סיכום הערות', error.message);
    }
  }
}

// פונקציה לעדכון גלובלי של הטבלה (נדרשת עבור הפילטרים)
/**
 * Update grid from component filters
 * @param {Array} _selectedStatuses - Selected statuses filter
 * @param {Array} _selectedTypes - Selected types filter
 * @param {Array} _selectedAccounts - Selected accounts filter
 * @param {Object} _selectedDateRange - Selected date range filter
 * @param {string} _searchTerm - Search term filter
 */
function updateGridFromComponent(
  _selectedStatuses,
  _selectedTypes,
  _selectedAccounts,
  _selectedDateRange,
  _searchTerm,
) {
  try {
    // כרגע רק נטען מחדש את הנתונים
    loadNotesData();
  } catch (error) {
    window.Logger.error('שגיאה בעדכון גריד מהקומפוננט:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון גריד מהקומפוננט', error.message);
    }
  }
}

// פונקציות מודלים
/**
 * הצגת מודל הערה (הוספה או עריכה)
 * @param {string} mode - 'add' או 'edit'
 * @param {number} [noteId] - מזהה ההערה (נדרש רק בעריכה)
 */

// REMOVED: Orphaned code - tradeRadio and editTradeRadio not defined

// REMOVED: Orphaned code - radio button event listeners not in function

/**
 * מילוי select עם נתונים
 */
function populateSelect(selectId, data, field, prefix = '') {
  try {
    const select = document.getElementById(selectId);
    if (!select) {return;}

  if (data.length > 0) {
    // Data available for population
  }

  select.innerHTML = '<option value="">בחר אובייקט לשיוך...</option>';

  data.forEach(item => {
    const option = document.createElement('option');
    option.value = item.id;

    // יצירת טקסט מותאם לכל סוג אובייקט
    let displayText = '';

    if (prefix === 'חשבון מסחר') {
      // עבור חשבון מסחר: שם החשבון מסחר + מטבע
      const name = item.name || item.account_name || 'לא מוגדר';
      const currency = item.currency || 'ILS';
      displayText = `${name} (${currency})`;
    } else if (prefix === 'טרייד') {
      // עבור טרייד: סימבול + תאריך
      const symbol = item.symbol || item.ticker_symbol || item.ticker?.symbol || 'לא מוגדר';
      const date = item.created_at || item.date;
      const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
      displayText = `${symbol} - ${formattedDate}`;
    } else if (prefix === 'תכנון') {
      // עבור תכנון: סימבול + תאריך
      const symbol = item.symbol || item.ticker_symbol || item.ticker?.symbol || 'לא מוגדר';
      const date = item.created_at || item.date;
      const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
      displayText = `${symbol} - ${formattedDate}`;
    } else {
      // עבור טיקר: רק סימבול
      displayText = item[field] || item.symbol || 'לא מוגדר';
    }

    option.textContent = displayText;
    select.appendChild(option);
  });
  
  } catch (error) {
    window.Logger.error('שגיאה במילוי select:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה במילוי select', error.message);
    }
  }
}

/**
 * Update radio buttons for note relation types
 * Sets up event listeners for relation type radio buttons
 * 
 * @function updateRadioButtons
 * @param {Array} accounts - Accounts array
 * @param {Array} trades - Trades array
 * @param {Array} tradePlans - Trade plans array
 * @param {Array} tickers - Tickers array
 * @returns {void}
 */
function updateRadioButtons(accounts = [], trades = [], tradePlans = [], tickers = []) {
  try {
    // עדכון רדיו באטון לחשבונות
    const accountRadio = document.getElementById('noteRelationAccount');
    const editAccountRadio = document.getElementById('editNoteRelationAccount');

    if (accountRadio) {
      accountRadio.addEventListener('change', () => {
        populateSelect('noteRelatedObjectSelect', accounts, 'name', 'חשבון מסחר');
      });
    }

    if (editAccountRadio) {
      editAccountRadio.addEventListener('change', () => {
        populateSelect('editNoteRelatedObjectSelect', accounts, 'name', 'חשבון מסחר');
      });
    }

    // עדכון רדיו באטון לטריידים
    const tradeRadio = document.getElementById('noteRelationTrade');
    const editTradeRadio = document.getElementById('editNoteRelationTrade');

    if (tradeRadio) {
      tradeRadio.addEventListener('change', () => {
        populateSelect('noteRelatedObjectSelect', trades, 'id', 'טרייד');
      });
    }

    if (editTradeRadio) {
      editTradeRadio.addEventListener('change', () => {
        populateSelect('editNoteRelatedObjectSelect', trades, 'id', 'טרייד');
      });
    }

    // עדכון רדיו באטון לתכנונים
    const planRadio = document.getElementById('noteRelationTradePlan');
    const editPlanRadio = document.getElementById('editNoteRelationTradePlan');

    if (planRadio) {
      planRadio.addEventListener('change', () => {
        populateSelect('noteRelatedObjectSelect', tradePlans, 'id', 'תכנון');
      });
    }

    if (editPlanRadio) {
      editPlanRadio.addEventListener('change', () => {
        populateSelect('editNoteRelatedObjectSelect', tradePlans, 'id', 'תכנון');
      });
    }

    // עדכון רדיו באטון לטיקרים
    const tickerRadio = document.getElementById('noteRelationTicker');
    const editTickerRadio = document.getElementById('editNoteRelationTicker');

    if (tickerRadio) {
      tickerRadio.addEventListener('change', () => {
        populateSelect('noteRelatedObjectSelect', tickers, 'symbol', '');
      });
    }

    if (editTickerRadio) {
      editTickerRadio.addEventListener('change', () => {
        populateSelect('editNoteRelatedObjectSelect', tickers, 'symbol', '');
      });
    }
    
  } catch (error) {
    window.Logger?.error('שגיאה בעדכון רדיו באטונים:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון רדיו באטונים', error.message);
    }
  }
}

/**
 * Handle note relation type change
 * Called when radio button for relation type changes
 */
function onNoteRelationTypeChange() {
  // הפונקציה הזו נקראת בעת שינוי רדיו באטון
  // הלוגיקה האמיתית נמצאת ב-updateRadioButtons
  // אבל אנחנו צריכים אותה לעבוד גם בעת טעינת נתונים לעריכה
}

async function populateEditSelectByType(relationType, selectedId) {
  try {
    let data = [];
    let displayField = '';
    let placeholder = '';

    switch (parseInt(relationType)) {
    case 1: { // חשבון מסחר
      const accountsResponse = await fetch('/api/accounts/');
      const accountsData = await accountsResponse.json();
      data = Array.isArray(accountsData.data) ? accountsData.data : [];
      displayField = 'name';
      placeholder = 'חשבון מסחר';
      break;
    }
    case 2: { // טרייד
      const tradesResponse = await fetch('/api/trades/');
      const tradesData = await tradesResponse.json();
      data = Array.isArray(tradesData.data) ? tradesData.data : [];
      displayField = 'id';
      placeholder = 'טרייד';
      break;
    }
    case 3: { // תוכנית
      const plansResponse = await fetch('/api/trade_plans/');
      const plansData = await plansResponse.json();
      data = Array.isArray(plansData.data) ? plansData.data : [];
      displayField = 'id';
      placeholder = 'תוכנית';
      break;
    }
    case 4: { // טיקר
      const tickersResponse = await fetch('/api/tickers/');
      const tickersData = await tickersResponse.json();
      data = Array.isArray(tickersData.data) ? tickersData.data : [];
      displayField = 'symbol';
      placeholder = 'טיקר';
      break;
    }
    }

    // מילוי הרשימה
    populateSelect('editNoteRelatedObjectSelect', data, displayField, placeholder);

    // בחירת הערך הנכון
    if (selectedId) {
      setTimeout(() => {
        const select = document.getElementById('editNoteRelatedObjectSelect');
        if (select) {
          select.value = selectedId;
        }
      }, 100);
    }

  } catch {
    // שגיאה במילוי רשימה לעריכה
  }
}

// ולידציה - משתמש במערכת הכללית window.validateEntityForm
/**
 * Validate note form
 * @param {string} content - Note content
 * @param {string} relationType - Type of relation
 * @param {string} relatedId - ID of related object
 * @param {File} attachment - Attachment file
 * @returns {boolean} Whether the form is valid
 */
/**
 * ולידציה של טופס הערה
 * @deprecated השתמש ב-window.validateEntityForm() במקום
 */
function validateNoteForm(content, relationType, relatedId, attachment) {
  const fieldConfigs = [
    {id: 'noteContent', name: 'תוכן הערה', rules: {required: true, minLength: 1, maxLength: 10000}},
    {id: 'noteRelationType', name: 'סוג קשר', rules: {required: true}},
    {id: 'noteRelatedId', name: 'מזהה קשור', rules: {required: true}}
  ];
  
  const result = window.validateEntityForm('noteForm', fieldConfigs);
  
  if (!result.isValid && result.errorMessages.length > 0) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאות ולידציה', result.errorMessages.join('\n'));
    }
  }
  
  return result.isValid;
}

// ולידציה - משתמש במערכת הכללית window.validateEntityForm
/**
 * Validate edit note form
 * @param {string} content - Note content
 * @param {string} relationType - Type of relation
 * @param {string} relatedId - ID of related object
 * @param {File} attachment - Attachment file
 * @returns {boolean} Whether the form is valid
 */
function validateEditNoteForm(content, relationType, relatedId, attachment) {
  try {
    let isValid = true;

    // ניקוי שגיאות קודמות
    clearNoteValidationErrors();

  // וולידציה של תוכן
  if (!content) {
    window.showValidationWarning('editContentError', 'תוכן הערה הוא שדה חובה');
    isValid = false;
  } else if (content.length < 1) {
    window.showValidationWarning('editContentError', 'תוכן ההערה חייב להכיל לפחות תו אחד');
    isValid = false;
  } else if (content.length > 10000) {
    window.showValidationWarning('editContentError', 'תוכן ההערה ארוך מדי (מקסימום 10,000 תווים)');
    isValid = false;
  }

  // וולידציה של סוג קשר
  if (!relationType) {
    window.showValidationWarning('editRelationTypeError', 'יש לבחור סוג אובייקט לשיוך');
    isValid = false;
  }

  // וולידציה של אובייקט קשור
  if (!relatedId) {
    window.showValidationWarning('editRelatedObjectError', 'יש לבחור אובייקט לשיוך');
    isValid = false;
  } else if (isNaN(parseInt(relatedId)) || parseInt(relatedId) <= 0) {
    window.showValidationWarning('editRelatedObjectError', 'מזהה אובייקט לא תקין');
    isValid = false;
  }

  // וולידציה של קובץ מצורף (אם קיים)
  if (attachment) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (attachment.size > maxSize) {
      window.showValidationWarning('editAttachmentError', 'קובץ מצורף גדול מדי (מקסימום 10MB)');
      isValid = false;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(attachment.type)) {
      window.showValidationWarning('editAttachmentError', 'סוג קובץ לא נתמך. מותרים: תמונות (JPG, PNG, GIF, BMP, WebP) ו-PDF בלבד');
      isValid = false;
    }
  }

  return isValid;
  
  } catch (error) {
    window.Logger.error('שגיאה בוולידציה של טופס עריכת הערה:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בוולידציה של טופס עריכת הערה', error.message);
    }
    return false;
  }
}

// פונקציות שמירה ומחיקה
async function saveNote() {
  
  // ניקוי מטמון לפני פעולת CRUD  // שימוש ב-DataCollectionService לאיסוף נתונים
  const noteData = DataCollectionService.collectFormData({
    content: { id: 'addNoteContent', type: 'text', isTextContent: true },
    relationType: { id: 'noteRelationType', type: 'text', isRadioChecked: true },
    relatedId: { id: 'noteRelatedObjectSelect', type: 'int' }
  });

  const content = getEditorContent('add');
  const relationType = noteData.relationType;
  const relatedId = noteData.relatedId;
  const attachment = document.getElementById('noteAttachment').files[0];

  // ולידציה - משתמש במערכת הכללית window.validateEntityForm

  clearNoteValidationErrors();

  try {
    // יצירת אובייקט JSON לשליחה
    const requestData = {
      content,
      related_type_id: parseInt(relationType),
      related_id: parseInt(relatedId),
    };

    const response = await fetch('/api/notes/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    await CRUDResponseHandler.handleSaveResponse(response, {
      modalId: 'addNoteModal',
      successMessage: 'הערה נשמרה בהצלחה!',
      apiUrl: '/api/notes/',
      entityName: 'הערה',
      reloadFn: window.loadNotesData,
      requiresHardReload: false
    });
  } catch (error) {
    CRUDResponseHandler.handleError(error, 'שמירת הערה');
  }
}

async function updateNoteFromModal() {
  
  // ניקוי מטמון לפני פעולת CRUD - עריכה  // שימוש ב-DataCollectionService לאיסוף נתונים
  const noteData = DataCollectionService.collectFormData({
    id: { id: 'editNoteId', type: 'int' },
    content: { id: 'editNoteContent', type: 'text', isTextContent: true },
    relationType: { id: 'editNoteRelationType', type: 'text', isRadioChecked: true },
    relatedId: { id: 'editNoteRelatedObjectSelect', type: 'int' }
  });

  const noteId = noteData.id;
  const content = getEditorContent('edit');
  const relationType = noteData.relationType;
  const relatedId = noteData.relatedId;
  const attachment = document.getElementById('editNoteAttachment').files[0];

  // בדיקה אם נדרשת מחיקת קובץ
  const shouldRemoveAttachment = window.removeAttachmentFlag === true;
  // const shouldReplaceAttachment = window.replaceAttachmentFlag === true;

  // ולידציה - משתמש במערכת הכללית window.validateEntityForm

  clearNoteValidationErrors();

  try {
    let response;

    // אם יש קובץ חדש או נדרשת מחיקת קובץ, השתמש ב-FormData
    if (attachment || shouldRemoveAttachment) {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('related_type_id', relationType);
      formData.append('related_id', relatedId);

      if (attachment) {
        formData.append('attachment', attachment);
      }

      if (shouldRemoveAttachment) {
        formData.append('remove_attachment', 'true');
      }

      response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        body: formData,
      });
    } else {
      // אחרת, השתמש ב-JSON
      const data = {
        content,
        related_type_id: parseInt(relationType),
        related_id: parseInt(relatedId),
      };

      response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    }

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    await CRUDResponseHandler.handleUpdateResponse(response, {
      modalId: 'editNoteModal',
      successMessage: 'הערה עודכנה בהצלחה!',
      apiUrl: '/api/notes/',
      entityName: 'הערה',
      reloadFn: window.loadNotesData,
      requiresHardReload: false
    });

    // ניקוי דגלים
    window.removeAttachmentFlag = false;
    window.replaceAttachmentFlag = false;

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'עדכון הערה');
  }
}

// פונקציה זו הוסרה - שימוש במערכת הגלובלית showDeleteWarning

async function confirmDeleteNote(noteId) {
  // סגירת המודל
  const modal = bootstrap.Modal.getInstance(document.getElementById('deleteNoteModal'));
  if (modal) {
    modal.hide();
  }

  // מחיקת ההערה
  await deleteNoteFromServer(noteId);
}

async function deleteNoteFromServer(noteId) {
  // ניקוי מטמון לפני פעולת CRUD - מחיקה  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
      await CRUDResponseHandler.handleDeleteResponse(response, {
        successMessage: 'הערה נמחקה בהצלחה!',
        apiUrl: '/api/notes/',
        entityName: 'הערה',
        reloadFn: window.loadNotesData,
        requiresHardReload: false
      });
      return; // יציאה מוצלחת
    } catch (error) {
      retryCount++;

      if (retryCount >= maxRetries) {
        // ניסיונות נגמרו - הצגת שגיאה
        CRUDResponseHandler.handleError(error, 'מחיקת הערה');
        return;
      } else {
        // המתנה לפני ניסיון נוסף
        const currentRetryCount = retryCount;
        await new Promise(resolve => setTimeout(resolve, 1000 * currentRetryCount));
      }
    }
  }
}

// פונקציות ולידציה

/**
 * Clear note validation errors
 * Uses global validation system or fallback to local system
 */
function clearNoteValidationErrors() {
  try {
    // שימוש במערכת הגלובלית לוולידציה
    if (typeof window.clearValidation === 'function') {
      window.clearValidation();
  } else {
    // fallback למערכת המקומית
    const errorElements = document.querySelectorAll('.invalid-feedback');
    errorElements.forEach(element => {
      element.textContent = '';
      element.style.display = 'none';
    });

    // הסרת קלאס is-invalid מכל השדות
    const fields = document.querySelectorAll('.is-invalid');
    fields.forEach(field => {
      field.classList.remove('is-invalid');
    });
  }
  
  } catch (error) {
    window.Logger.error('שגיאה בניקוי שגיאות ולידציה:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בניקוי שגיאות ולידציה', error.message);
    }
  }
}

// function getFieldByErrorId(errorId) {
//   switch (errorId) {
//   case 'contentError':
//     return document.getElementById('noteContent');
//   case 'editContentError':
//     return document.getElementById('editNoteContent');
//   case 'relationTypeError':
//     return document.querySelector('input[name="noteRelationType"]:checked')?.closest('.col-md-6');
//   case 'editRelationTypeError':
//     return document.querySelector('input[name="editNoteRelationType"]:checked')?.closest('.col-md-6');
//   case 'relatedObjectError':
//     return document.getElementById('noteRelatedObjectSelect');
//   case 'editRelatedObjectError':
//     return document.getElementById('editNoteRelatedObjectSelect');
//   default:
//     return null;
//   }
// }

// window.loadNotesData כבר מוגדר בתחילת הקובץ
window.updateNotesTable = updateNotesTable;
window.updateNotesSummary = updateNotesSummary;
window.updateGridFromComponent = updateGridFromComponent;
window.showAddNoteModal = showAddNoteModal;
window.showEditNoteModal = showEditNoteModal;
window.saveNote = saveNote;
window.updateNoteFromModal = updateNoteFromModal;
window.deleteNoteFromServer = deleteNoteFromServer;
// window.showDeleteNoteModal = showDeleteNoteModal; // הוסר - שימוש במערכת הגלובלית
window.confirmDeleteNote = confirmDeleteNote;
window.onNoteRelationTypeChange = onNoteRelationTypeChange;
window.populateEditSelectByType = populateEditSelectByType;
window.setupNoteValidationEvents = setupNoteValidationEvents;
window.updateRadioButtons = updateRadioButtons;
window.populateSelect = populateSelect;

// הוסר - המערכת המאוחדת מטפלת באתחול


// פונקציה להגדרת אירועי ולידציה
/**
 * Setup note validation events
 * Sets up event listeners for form validation
 */
function setupNoteValidationEvents() {
  try {
    // ולידציה לשדה תוכן (עורך טקסט עשיר)
    const contentField = document.getElementById('noteContent');
  if (contentField) {
    contentField.addEventListener('input', function () {
      const content = this.innerText || this.textContent || '';
      if (content.trim()) {
        this.classList.remove('is-invalid');
        this.classList.add('is-valid');
        const errorElement = document.getElementById('contentError');
        if (errorElement) {
          errorElement.style.display = 'none';
        }
      } else {
        this.classList.remove('is-valid');
      }
    });
  }

  // ולידציה לשדה תוכן בעריכה (עורך טקסט עשיר)
  const editContentField = document.getElementById('editNoteContent');
  if (editContentField) {
    editContentField.addEventListener('input', function () {
      const content = this.innerText || this.textContent || '';
      if (content.trim()) {
        this.classList.remove('is-invalid');
        this.classList.add('is-valid');
        const errorElement = document.getElementById('editContentError');
        if (errorElement) {
          errorElement.style.display = 'none';
        }
      } else {
        this.classList.remove('is-valid');
      }
    });
  }

  // ולידציה לבחירת אובייקט
  const relatedObjectSelect = document.getElementById('noteRelatedObjectSelect');
  if (relatedObjectSelect) {
    relatedObjectSelect.addEventListener('change', function () {
      if (this.value) {
        this.classList.remove('is-invalid');
        this.classList.add('is-valid');
        const errorElement = document.getElementById('relatedObjectError');
        if (errorElement) {
          errorElement.style.display = 'none';
        }
      } else {
        this.classList.remove('is-valid');
        this.classList.add('is-invalid');
        const errorElement = document.getElementById('relatedObjectError');
        if (errorElement) {
          errorElement.textContent = 'יש לבחור אובייקט לשיוך';
          errorElement.style.display = 'block';
        }
      }
    });
  }

  // ולידציה לבחירת אובייקט בעריכה
  const editRelatedObjectSelect = document.getElementById('editNoteRelatedObjectSelect');
  if (editRelatedObjectSelect) {
    editRelatedObjectSelect.addEventListener('change', function () {
      if (this.value) {
        this.classList.remove('is-invalid');
        this.classList.add('is-valid');
        const errorElement = document.getElementById('editRelatedObjectError');
        if (errorElement) {
          errorElement.style.display = 'none';
        }
      } else {
        this.classList.remove('is-valid');
        this.classList.add('is-invalid');
        const errorElement = document.getElementById('editRelatedObjectError');
        if (errorElement) {
          errorElement.textContent = 'יש לבחור אובייקט לשיוך';
          errorElement.style.display = 'block';
        }
      }
    });
  }

  // אירוע להחלפת קובץ מצורף
  const editAttachmentInput = document.getElementById('editNoteAttachment');
  if (editAttachmentInput) {
    editAttachmentInput.addEventListener('change', function () {
      if (this.files && this.files[0]) {
        const file = this.files[0];
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop()?.toLowerCase();
        let fileIcon = '📄';

        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(fileExtension)) {
          fileIcon = '🖼️';
        } else if (['pdf'].includes(fileExtension)) {
          fileIcon = '📕';
        } else if (['doc', 'docx'].includes(fileExtension)) {
          fileIcon = '📘';
        } else if (['txt'].includes(fileExtension)) {
          fileIcon = '📄';
        } else if (['xls', 'xlsx'].includes(fileExtension)) {
          fileIcon = '📊';
        }

        const displayElement = document.getElementById('currentAttachmentDisplay');
        if (displayElement) {
          displayElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>${fileIcon}</span>
              <span>${fileName} (חדש)</span>
              <span style="color: ${window.getTableColors ? window.getTableColors().positive : '#28a745'}; font-weight: bold;">✓ נבחר</span>
            </div>
          `;
        }

        // עדכון כפתורי הפעולה
        const actionsElement = document.getElementById('attachmentActions');
        if (actionsElement) {
          actionsElement.innerHTML = `
            <button type="button" class="btn btn-sm" disabled>
              ✅ קובץ נבחר
            </button>
            <button type="button" class="btn btn-sm" onclick="clearSelectedFile()">
              ❌ בטל בחירה
            </button>
          `;
          actionsElement.style.display = 'block';
        }
      }
    });
  }
  
  } catch (error) {
    window.Logger.error('שגיאה בהגדרת אירועי ולידציה:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהגדרת אירועי ולידציה', error.message);
    }
  }
}

// פונקציה לביטול בחירת קובץ
function clearSelectedFile() {
  try {
    const fileInput = document.getElementById('editNoteAttachment');
    const displayElement = document.getElementById('currentAttachmentDisplay');
    const actionsElement = document.getElementById('attachmentActions');

  if (fileInput) {
    fileInput.value = '';
  }

  if (displayElement) {
    displayElement.textContent = 'אין קובץ מצורף';
  }

  if (actionsElement) {
    actionsElement.style.display = 'none';
  }

  // ניקוי דגלים
  window.removeAttachmentFlag = false;
  window.replaceAttachmentFlag = false;
  
  } catch (error) {
    window.Logger.error('שגיאה בניקוי קובץ נבחר:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בניקוי קובץ נבחר', error.message);
    }
  }
}

// ===== פונקציות סידור =====

/**
 * פונקציה לסידור טבלת הערות
 * @param {number} columnIndex - אינדקס העמודה לסידור
 *
 * דוגמאות שימוש:
 * sortTable(0); // סידור לפי עמודת ID
 * sortTable(1); // סידור לפי עמודת תוכן
 * sortTable(3); // סידור לפי עמודת תאריך יצירה
 *
 * @requires window.sortTableData - פונקציה גלובלית מ-main.js
 */

/**
 * שחזור מצב סידור - שימוש בפונקציה גלובלית
 * @deprecated Use window.restoreAnyTableSort from main.js instead
 */
function restoreSortState() {
  try {
    // בדיקה אם יש נתונים לפני שחזור סידור
    if (!window.notesData || window.notesData.length === 0) {
      // אין נתונים לשחזור סידור - ממתין לטעינת נתונים
      return;
  }

  if (typeof window.restoreAnyTableSort === 'function') {
    window.restoreAnyTableSort('notes', window.notesData || [], updateNotesTable);
  } else {
    handleFunctionNotFound('restoreAnyTableSort', 'פונקציית שחזור מיון טבלה לא נמצאה');
  }
  
  } catch (error) {
    window.Logger.error('שגיאה בשחזור מצב סידור:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בשחזור מצב סידור', error.message);
    }
  }
}

// הגדרת הפונקציה כגלובלית
// window.sortTable export removed - using global version from tables.js

/**
 * פונקציה להצגת דף טיקר (כרגע הודעת "בפיתוח")
 * @param {string} symbol - סמל הטיקר
 */
function showTickerPage(symbol) {
  try {
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('מידע', `דף הטיקר ${symbol} נמצא בפיתוח`);
  } else {
    // Fallback notification
  }
  
  } catch (error) {
    window.Logger.error('שגיאה בהצגת דף טיקר:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהצגת דף טיקר', error.message);
    }
  }
}

// הגדרת הפונקציה כגלובלית
window.showTickerPage = showTickerPage;

/**
 * פונקציות עורך טקסט עשיר
 */

/**
 * עיצוב טקסט בעורך
 * @param {string} command - פקודת העיצוב
 * @param {string} mode - 'add' או 'edit'
 */
function formatText(command, mode = 'add') {
  try {
    const editorId = mode === 'edit' ? 'editNoteContent' : 'noteContent';
    const editor = document.getElementById(editorId);

  if (!editor) {
    return;
  }

  editor.focus();

  switch (command) {
  case 'bold':
    document.execCommand('bold', false, null);
    break;
  case 'italic':
    document.execCommand('italic', false, null);
    break;
  case 'underline':
    document.execCommand('underline', false, null);
    break;
  case 'strikethrough':
    document.execCommand('strikeThrough', false, null);
    break;
  case 'h1':
    document.execCommand('formatBlock', false, '<h1>');
    break;
  case 'h2':
    document.execCommand('formatBlock', false, '<h2>');
    break;
  case 'h3':
    document.execCommand('formatBlock', false, '<h3>');
    break;
  case 'ul':
    document.execCommand('insertUnorderedList', false, null);
    break;
  case 'ol':
    document.execCommand('insertOrderedList', false, null);
    break;
  case 'link': {
    // Function to handle link insertion
    const insertLink = (url) => {
      if (url && url.trim()) {
        document.execCommand('createLink', false, url);
        if (typeof window.showSuccessNotification === 'function') {
          window.showSuccessNotification('עורך טקסט', 'לינק נוסף בהצלחה');
        }
      }
    };
    
    // Use a custom prompt or fallback to browser prompt
    if (typeof window.showCustomPrompt === 'function') {
      window.showCustomPrompt(
        'הוספת לינק',
        'הכנס כתובת URL:',
        'http://',
        insertLink,
        () => window.Logger.info('❌ הוספת לינק - משתמש ביטל', { page: "notes" })
      );
    } else {
      // Fallback to browser prompt
      const url = prompt('הכנס כתובת URL:', 'http://');
      insertLink(url);
    }
    break;
  }
  default:
    // window.Logger.warn(`⚠️ פקודה לא מוכרת: ${command}`, { page: "notes" });
  }
  
  } catch (error) {
    window.Logger.error('שגיאה בעיצוב טקסט:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעיצוב טקסט', error.message);
    }
  }
}

/**
 * ניקוי עיצוב בעורך
 * @param {string} mode - 'add' או 'edit'
 */
function clearFormatting(mode = 'add') {
  try {
    const editorId = mode === 'edit' ? 'editNoteContent' : 'noteContent';
    const editor = document.getElementById(editorId);

  if (!editor) {
    return;
  }

  editor.focus();
  document.execCommand('removeFormat', false, null);
  
  } catch (error) {
    window.Logger.error('שגיאה בניקוי עיצוב:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בניקוי עיצוב', error.message);
    }
  }
}

/**
 * קבלת תוכן מעורך הטקסט
 * @param {string} mode - 'add' או 'edit'
 * @returns {string} תוכן העורך
 */
function getEditorContent(mode = 'add') {
  try {
    const editorId = mode === 'edit' ? 'editNoteContent' : 'noteContent';
    const editor = document.getElementById(editorId);

  if (!editor) {
    return '';
  }

  // בדיקה אם העורך ריק או מכיל רק תגיות HTML ריקות
  const content = editor.innerHTML;
  const textContent = editor.textContent || editor.innerText || '';

  // אם אין תוכן טקסט, החזר מחרוזת ריקה
  if (!textContent.trim()) {
    return '';
  }

  return content;
  
  } catch (error) {
    window.Logger.error('שגיאה בקבלת תוכן עורך:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בקבלת תוכן עורך', error.message);
    }
    return '';
  }
}

/**
 * הגדרת תוכן לעורך הטקסט
 * @param {string} content - התוכן להגדרה
 * @param {string} mode - 'add' או 'edit'
 */
function setEditorContent(content, mode = 'add') {
  try {
    const editorId = mode === 'edit' ? 'editNoteContent' : 'noteContent';
    const editor = document.getElementById(editorId);

  if (!editor) {
    return;
  }

  editor.innerHTML = content || '';
  
  } catch (error) {
    window.Logger.error('שגיאה בהגדרת תוכן עורך:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהגדרת תוכן עורך', error.message);
    }
  }
}

// הגדרת הפונקציות כגלובליות
window.formatText = formatText;
window.clearFormatting = clearFormatting;
window.getEditorContent = getEditorContent;
window.setEditorContent = setEditorContent;
window.filterNotesData = filterNotesData;
window.filterNotesByType = filterNotesByType;
window.getTypeDisplayName = getTypeDisplayName;
window.viewNote = viewNote;
window.loadNoteForViewing = loadNoteForViewing;
window.getNoteRelatedDisplay = getNoteRelatedDisplay;
window.editCurrentNote = editCurrentNote;
window.displayCurrentAttachment = displayCurrentAttachment;
window.removeCurrentAttachment = removeCurrentAttachment;
window.replaceCurrentAttachment = replaceCurrentAttachment;
window.clearSelectedFile = clearSelectedFile;

// פונקציה לסינון הערות לפי חיפוש
/**
 * Filter notes data by search term
 * @param {string} searchTerm - Search term to filter by
 */
function filterNotesData(searchTerm) {
  try {
    if (!window.notesData) {
      // window.Logger.warn('⚠️ אין נתוני הערות זמינים לסינון', { page: "notes" });
      return;
  }

  const filteredNotes = window.notesData.filter(note => {
    const content = note.content?.toLowerCase() || '';
    const relatedDisplay = getNoteRelatedDisplay(note).toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return content.includes(searchLower) || relatedDisplay.includes(searchLower);
  });

  updateNotesTable(
    filteredNotes,
    window.accountsData || [],
    window.tradesData || [],
    window.tradePlansData || [],
    window.tickersData || [],
  );
  
  } catch (error) {
    window.Logger.error('שגיאה בסינון נתוני הערות:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בסינון נתוני הערות', error.message);
    }
  }
}

// פונקציה לסינון הערות לפי סוג
/**
 * Filter notes by type
 * @param {string} type - Type to filter by
 */
function filterNotesByType(type) {
  try {
    if (!window.notesData) {
      // window.Logger.warn('⚠️ אין נתוני הערות זמינים לסינון', { page: "notes" });
      return;
  }

  // עדכון מצב הכפתורים
  const buttons = document.querySelectorAll('[data-type]');
  buttons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-type') === 'all') {
      const colors = window.getTableColors ? window.getTableColors() : { positive: '#28a745' };
      btn.style.backgroundColor = 'white';
      btn.style.color = colors.positive;
      btn.style.borderColor = colors.positive;
    } else {
      btn.classList.add('btn');
    }
  });

  const activeButton = document.querySelector(`[data-type="${type}"]`);
  if (activeButton) {
    if (type === 'all') {
      const colors = window.getTableColors ? window.getTableColors() : { positive: '#28a745' };
      activeButton.style.backgroundColor = 'white';
      activeButton.style.color = colors.positive;
      activeButton.style.borderColor = colors.positive;
    } else {
      activeButton.classList.remove('btn');
      activeButton.classList.add('active');
    }
  }

  let filteredNotes;
  if (type === 'all') {
    filteredNotes = window.notesData;
  } else {
    const typeMap = {
      'account': 1,
      'trade': 2,
      'trade_plan': 3,
      'ticker': 4,
    };

    const typeId = typeMap[type];
    if (typeId) {
      filteredNotes = window.notesData.filter(note => note.related_type_id === typeId);
    } else {
      filteredNotes = window.notesData;
    }
  }

  updateNotesTable(
    filteredNotes,
    window.accountsData || [],
    window.tradesData || [],
    window.tradePlansData || [],
    window.tickersData || [],
  );
  
  } catch (error) {
    window.Logger.error('שגיאה בסינון הערות לפי סוג:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בסינון הערות לפי סוג', error.message);
    }
  }
}

// פונקציה לקבלת שם תצוגה לסוג
/**
 * Get display name for type
 * @param {string} type - Type to get display name for
 * @returns {string} Display name
 */
function getTypeDisplayName(type) {
  try {
    switch (type) {
    case 'account': return 'חשבונות';
    case 'trade': return 'טריידים';
    case 'trade_plan': return 'תוכניות';
    case 'ticker': return 'טיקרים';
    default: return type;
    }
  } catch (error) {
    window.Logger.error('שגיאה בקבלת שם תצוגה לסוג:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בקבלת שם תצוגה לסוג', error.message);
    }
    return type;
  }
}

// פונקציה לצפייה בהערה
/**
 * View a note
 * @param {number} noteId - ID of the note to view
 */
function viewNote(noteId) {
  try {
    // צפייה בפרטי הערה באמצעות מודל פרטי ישות הגלובלי
    if (typeof window.showEntityDetails === 'function') {
      window.showEntityDetails('note', noteId, { mode: 'view' });
    } else {
      // Fallback למצב הישן אם המערכת הגלובלית לא זמינה
      // שמירת מזהה ההערה הנוכחית
      window.currentViewingNoteId = noteId;

      // טעינת נתוני ההערה
      if (typeof loadNoteForViewing === 'function') {
        loadNoteForViewing(noteId);
      }

      // הצגת המודל
      const modal = new bootstrap.Modal(document.getElementById('viewNoteModal'));
      modal.show();
    }
  
  } catch (error) {
    window.Logger.error('שגיאה בצפייה בהערה:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בצפייה בהערה', error.message);
    }
  }
}

// פונקציה לטעינת נתוני הערה לצפייה
async function loadNoteForViewing(noteId) {
  try {
    const response = await fetch(`/api/notes/${noteId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    const note = responseData.data || responseData;

    // מילוי המודל
    document.getElementById('viewNoteRelated').textContent = getNoteRelatedDisplay(note);
    document.getElementById('viewNoteContent').innerHTML = note.content || 'ללא תוכן';
    document.getElementById('viewNoteCreated').textContent = note.created_at ? new Date(note.created_at).toLocaleString('he-IL') : 'לא מוגדר';

    // הצגת קובץ מצורף
    const attachmentElement = document.getElementById('viewNoteAttachment');
    if (note.attachment) {
      const fileName = note.attachment;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      let fileIcon = '📄';

      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(fileExtension)) {
        fileIcon = '🖼️';
      } else if (['pdf'].includes(fileExtension)) {
        fileIcon = '📕';
      } else if (['doc', 'docx'].includes(fileExtension)) {
        fileIcon = '📘';
      } else if (['txt'].includes(fileExtension)) {
        fileIcon = '📄';
      } else if (['xls', 'xlsx'].includes(fileExtension)) {
        fileIcon = '📊';
      }

      attachmentElement.innerHTML = `
        <a href="/api/notes/files/${fileName}" target="_blank" class="btn btn-sm">
          ${fileIcon} ${fileName}
        </a>
      `;
    } else {
      attachmentElement.textContent = 'אין קובץ מצורף';
    }

  } catch {
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בטעינת נתוני הערה');
    }
  }
}

// פונקציה לקבלת תצוגת הקשר של הערה - משתמשת במערכת הכללית
/**
 * Get related object display for note
 * @param {Object} note - Note object
 * @returns {string} Display name of related object
 */
function getNoteRelatedDisplay(note) {
  try {
    if (!note.related_type_id || !note.related_id) {
      return 'כללי';
  }

  // שימוש במערכת הכללית אם זמינה
  if (window.getRelatedObjectDisplay) {
    const dataSources = {
      accounts: window.accountsData || [],
      trades: window.tradesData || [],
      tradePlans: window.tradePlansData || [],
      tickers: window.tickersData || []
    };
    
    const relatedInfo = window.getRelatedObjectDisplay(note, dataSources, {
      showLink: false,
      format: 'minimal'
    });
    
    return relatedInfo.display;
  }

  // Fallback למערכת הישנה
  switch (note.related_type_id) {
  case 1: return `🏦 חשבון מסחר ${note.related_id}`;
  case 2: return `📈 טרייד ${note.related_id}`;
  case 3: return `📋 תוכנית ${note.related_id}`;
  case 4: return `📊 טיקר ${note.related_id}`;
  default: return `אובייקט ${note.related_id}`;
  }
  
  } catch (error) {
    window.Logger.error('שגיאה בקבלת תצוגת אובייקט קשור:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בקבלת תצוגת אובייקט קשור', error.message);
    }
    return 'כללי';
  }
}

// פונקציה לעריכת הערה נוכחית
/**
 * Edit current note
 * Opens edit modal for the currently viewing note
 */
function editCurrentNote() {
  try {
    const noteId = window.currentViewingNoteId;
    if (noteId) {
      // סגירת מודל הצפייה
      const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewNoteModal'));
      viewModal.hide();

    // פתיחת מודל העריכה
    showEditNoteModal(noteId);
  }
  
  } catch (error) {
    window.Logger.error('שגיאה בעריכת הערה הנוכחית:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעריכת הערה הנוכחית', error.message);
    }
  }
}

// פונקציה להצגת קובץ מצורף נוכחי במודל עריכה
/**
 * Display current attachment in edit modal
 * @param {Object} attachment - Attachment object to display
 */
function displayCurrentAttachment(attachment) {
  try {
    const displayElement = document.getElementById('currentAttachmentDisplay');
    const actionsElement = document.getElementById('attachmentActions');

  if (!displayElement || !actionsElement) {
    return;
  }

  if (attachment) {
    const fileName = attachment;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    let fileIcon = '📄';

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(fileExtension)) {
      fileIcon = '🖼️';
    } else if (['pdf'].includes(fileExtension)) {
      fileIcon = '📕';
    } else if (['doc', 'docx'].includes(fileExtension)) {
      fileIcon = '📘';
    } else if (['txt'].includes(fileExtension)) {
      fileIcon = '📄';
    } else if (['xls', 'xlsx'].includes(fileExtension)) {
      fileIcon = '📊';
    }

    displayElement.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>${fileIcon}</span>
        <span>${fileName}</span>
        <a href="/api/notes/files/${fileName}" 
           target="_blank" 
           class="btn btn-sm" 
           style="margin-right: auto;">
          👁️ צפה
        </a>
      </div>
    `;
    actionsElement.style.display = 'block';
  } else {
    displayElement.textContent = 'אין קובץ מצורף';
    actionsElement.style.display = 'none';
  }
  
  } catch (error) {
    window.Logger.error('שגיאה בהצגת קובץ מצורף נוכחי:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהצגת קובץ מצורף נוכחי', error.message);
    }
  }
}

// פונקציה למחיקת קובץ מצורף נוכחי
/**
 * Remove current attachment
 * Removes the current attachment from edit modal
 */
function removeCurrentAttachment() {
  try {
    const displayElement = document.getElementById('currentAttachmentDisplay');
    const actionsElement = document.getElementById('attachmentActions');
    const fileInput = document.getElementById('editNoteAttachment');

  if (displayElement) {
    displayElement.textContent = 'אין קובץ מצורף';
  }

  if (actionsElement) {
    actionsElement.style.display = 'none';
  }

  if (fileInput) {
    fileInput.value = '';
  }

  // סימון שמחיקת הקובץ נדרשת
  window.removeAttachmentFlag = true;

  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('מידע', 'הקובץ המצורף יימחק בעת שמירת ההערה');
  } else {
    // Fallback notification
  }
  
  } catch (error) {
    window.Logger.error('שגיאה בהסרת קובץ מצורף נוכחי:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהסרת קובץ מצורף נוכחי', error.message);
    }
  }
}

// פונקציה להחלפת קובץ מצורף
/**
 * Replace current attachment
 * Opens file picker to replace current attachment
 */
function replaceCurrentAttachment() {
  const fileInput = document.getElementById('editNoteAttachment');
  if (fileInput) {
    fileInput.click();
  }

  // סימון שהחלפת הקובץ נדרשת
  window.replaceAttachmentFlag = true;
}

// ===== MISSING FUNCTIONS FOR ONCLICK ATTRIBUTES =====

// Toggle functions
/**
 * Toggle section using global function
 * Uses global toggleSection function if available
 */
// toggleSection function removed - using global version from ui-basic.js

// toggleSection function removed - use toggleSection('main') instead

// ===== MODAL FUNCTIONS - NEW SYSTEM =====

/**
 * הצגת מודל הוספת הערה
 * Uses ModalManagerV2 for consistent modal experience
 */
function showAddNoteModal() {
    window.Logger.debug('showAddNoteModal called', { page: 'notes' });
    
    if (window.ModalManagerV2) {
        window.ModalManagerV2.showModal('notesModal', 'add');
    } else {
        console.error('ModalManagerV2 not available');
    }
}

/**
 * הצגת מודל עריכת הערה
 * Uses ModalManagerV2 for consistent modal experience
 */
function showEditNoteModal(noteId) {
    window.Logger.debug('showEditNoteModal called', { noteId, page: 'notes' });
    
    if (window.ModalManagerV2) {
        window.ModalManagerV2.showEditModal('notesModal', 'note', noteId);
    } else {
        console.error('ModalManagerV2 not available');
    }
}

/**
 * שמירת הערה
 * Handles both add and edit modes
 */
// REMOVED: Duplicate saveNote function - using ModalManagerV2 automatic CRUD handling

/**
 * מחיקת הערה
 * Includes linked items check
 */
// REMOVED: Duplicate deleteNote function - using confirmDeleteNote instead

// ===== GLOBAL EXPORTS =====
window.loadNotesData = loadNotesData;
window.addNote = addNote;
window.editNote = editNote;
// Note: deleteNote and saveNote removed - using ModalManagerV2 and confirmDeleteNote instead
window.uploadFile = uploadFile;
window.downloadFile = downloadFile;
window.viewLinkedItems = viewLinkedItems;
window.updateNotesTable = updateNotesTable;
window.showAddNoteModal = showAddNoteModal;
window.showEditNoteModal = showEditNoteModal;
window.restoreNotesSectionState = restoreNotesSectionState;


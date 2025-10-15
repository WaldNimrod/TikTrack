// ===== קובץ JavaScript פשוט לדף הערות =====

// ===== Global Element Cache =====
let addNoteModal = null;
let addNoteModalElement = null;
let editNoteModal = null;
let editNoteModalElement = null;
let deleteNoteModal = null;
let deleteNoteModalElement = null;
let viewNoteModal = null;
let viewNoteModalElement = null;
let addNoteForm = null;
let noteRelatedObjectSelect = null;
let editNoteRelatedObjectSelect = null;

// Initialize on DOM ready
// DOMContentLoaded removed - handled by unified system via PAGE_CONFIGS in core-systems.js
// Initialization moved to initializeNotesPage

window.initializeNotesModals = function() {
    addNoteModalElement = document.getElementById('addNoteModal');
    editNoteModalElement = document.getElementById('editNoteModal');
    deleteNoteModalElement = document.getElementById('deleteNoteModal');
    viewNoteModalElement = document.getElementById('viewNoteModal');
    addNoteForm = document.getElementById('addNoteForm');
    noteRelatedObjectSelect = document.getElementById('noteRelatedObjectSelect');
    editNoteRelatedObjectSelect = document.getElementById('editNoteRelatedObjectSelect');
    
    if (addNoteModalElement) addNoteModal = new bootstrap.Modal(addNoteModalElement);
    if (editNoteModalElement) editNoteModal = new bootstrap.Modal(editNoteModalElement);
    if (deleteNoteModalElement) deleteNoteModal = new bootstrap.Modal(deleteNoteModalElement);
    if (viewNoteModalElement) viewNoteModal = new bootstrap.Modal(viewNoteModalElement);
};

/**
 * הוספת הערה חדשה
 * פותח מודל להוספת הערה חדשה
 */
function addNote() {
  try {
    
    // פתיחת מודל הוספת הערה
    showAddNoteModal();
    
  } catch (error) {
    console.error('שגיאה בהוספת הערה:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהוספת הערה', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה בהוספת הערה');
    }
  }
}

/**
 * העלאת קובץ
 * מעלה קובץ להערה
 * @param {number} noteId - מזהה ההערה
 */
function uploadFile(noteId) {
  try {
    
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
        
        // הודעת הצלחה
        if (typeof window.showSuccessNotification === 'function') {
          window.showSuccessNotification('קובץ הועלה בהצלחה');
        } else if (typeof window.showNotification === 'function') {
          window.showSuccessNotification('קובץ הועלה בהצלחה');
        }
      })
      .catch(error => {
        console.error('שגיאה בהעלאת קובץ:', error);
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
    console.error('שגיאה בהעלאת קובץ:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהעלאת קובץ', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה בהעלאת קובץ');
    }
  }
}

/**
 * הורדת קובץ
 * מוריד קובץ מהערה
 * @param {number} noteId - מזהה ההערה
 * @param {string} fileName - שם הקובץ
 */
function downloadFile(noteId, fileName) {
  try {
    
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
    console.error('שגיאה בהורדת קובץ:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהורדת קובץ', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה בהורדת קובץ');
    }
  }
}

/**
 * צפייה בפריטים מקושרים
 * מציג פריטים המקושרים להערה
 * @param {number} noteId - מזהה ההערה
 */
function viewLinkedItems(noteId) {
  try {
    
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
    console.error('שגיאה בהצגת פריטים מקושרים:', error);
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
function openNoteDetails(_id) {
  showAddNoteModal();
}

function editNote(_id) {
  showEditNoteModal(_id);
}

/**
 * הצגת פרטי הערה
 */
function showNoteDetails(noteId) {
    // חיפוש ההערה בנתונים
    const note = window.notesData ? window.notesData.find(n => n.id === noteId) : null;
    
    if (!note) {
        console.error(`❌ Note with ID ${noteId} not found`);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', `הערה עם ID ${noteId} לא נמצאה`);
        }
        return;
    }

    // שימוש במערכת הצגת פרטים כללית אם זמינה
    if (typeof window.showEntityDetails === 'function') {
        console.log(`📋 Opening note details for ID: ${noteId}`);
        window.showEntityDetails('note', noteId, { mode: 'view' });
    } else {
        // נסיון לאתחל את המערכת אם היא לא מאותחלת
        console.warn('showEntityDetails not available, attempting to initialize...');
        
        // נחכה קצת למערכת להיטען
        setTimeout(() => {
            if (typeof window.showEntityDetails === 'function') {
                console.log(`📋 Opening note details for ID: ${noteId} (after delay)`);
                window.showEntityDetails('note', noteId, { mode: 'view' });
            } else {
                console.error('showEntityDetails still not available after timeout');
                if (typeof window.showErrorNotification === 'function') {
                    window.showErrorNotification('שגיאה', 'מערכת הצגת פרטי ישויות לא זמינה');
                } else {
                    alert('מערכת הצגת פרטי ישויות לא זמינה');
                }
            }
        }, 500);
    }
}

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
// function restoreNotesSectionState() - REMOVED: Using global section state management system
// The global restoreAllSectionStates() function from ui-utils.js is used instead

// פונקציות נוספות

// הגדרת הפונקציות כגלובליות
window.openNoteDetails = openNoteDetails;
window.editNote = editNote;
window.deleteNote = deleteNote;
// window.toggleSection removed - using global version from ui-utils.js
// toggleSection export removed - use toggleSection('main') instead
// window.restoreNotesSectionState = restoreNotesSectionState; // REMOVED: Using global system

// פונקציה לטעינת נתונים

// Flag to prevent duplicate loading
let _isLoadingNotes = false;
async function loadNotesData() {
  // Prevent duplicate loading
  if (_isLoadingNotes) {
    return window.notesData || [];
  }
  _isLoadingNotes = true;

  try {
    // שימוש במערכת המאוחדת loadTableData (v2.0.0)
    const notes = await window.loadTableData('notes', null, {
      tableId: 'notesTable',
      entityName: 'הערות',
      columns: 7,
      onRetry: loadNotesData
    });

    // בדיקה אם הנתונים ריקים
    if (!notes || notes.length === 0) {
      const tbody = document.querySelector('#notesTable tbody');
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center text-muted">
              <div class="empty-state-message">
                <h5>📝 אין הערות</h5>
                <p>לא נמצאו הערות במערכת</p>
                <button class="btn btn-sm btn-primary" onclick="openNoteDetails()">הוסף הערה ראשונה</button>
              </div>
            </td>
          </tr>
        `;
      }
      window.notesData = [];
      _isLoadingNotes = false; // איפוס הדגל גם במקרה של נתונים ריקים
      return;
    }

    // טעינת נתונים נוספים (חשבונות, טריידים, תוכניות, טיקרים)
    const loadDataSafely = async (url, _dataName) => {
      try {
        const innerResponse = await fetch(url);
        if (!innerResponse.ok) return [];
        const data = await innerResponse.json();
        if (data.status === 'error') return [];
        return Array.isArray(data.data) ? data.data : [];
      } catch {
        return [];
      }
    };

    const [accounts, trades, tradePlans, tickers] = await Promise.all([
      loadDataSafely('/api/trading-accounts/', 'חשבונות מסחר'),
      loadDataSafely('/api/trades/', 'טריידים'),
      loadDataSafely('/api/trade_plans/', 'תוכניות'),
      loadDataSafely('/api/tickers/', 'טיקרים'),
    ]);

    // שמירת הנתונים ב-window
    window.notesData = notes;
    window.accountsData = accounts;
    window.tradesData = trades;
    window.tradePlansData = tradePlans;
    window.tickersData = tickers;

    // עדכון הטבלה
    updateNotesTable(notes, accounts, trades, tradePlans, tickers);

  } catch (error) {
    console.error('❌ שגיאה בטעינת נתוני הערות:', error);
  } finally {
    // איפוס הדגל בסוף הפונקציה
    _isLoadingNotes = false;
  }
}

// פונקציה לעדכון הטבלה
function updateNotesTable(notes, accounts = [], trades = [], tradePlans = [], tickers = []) {
  
  const tbody = document.querySelector('#notesTable tbody');
  if (!tbody) {
    console.error('❌ לא נמצא tbody בטבלה');
    handleElementNotFound('updateNotesTable', 'לא נמצא tbody בטבלה');
    return;
  }
  

  if (!notes || notes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted">
          <div class="empty-state-message">
            <h5>📝 אין הערות</h5>
            <p>לא נמצאו הערות במערכת</p>
            <button class="btn btn-sm btn-primary" onclick="openNoteDetails()">הוסף הערה ראשונה</button>
          </div>
        </td>
      </tr>
    `;
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
    
    // דיבוג לבדיקת נתוני קובץ
    if (note.id && window.location.search.includes('debug=1')) {
      console.log(`📎 Note ${note.id} attachment:`, note.attachment, typeof note.attachment);
      console.log(`📎 Note ${note.id} all attachment fields:`, {
        attachment: note.attachment,
        file_name: note.file_name,
        filename: note.filename,
        attached_file: note.attached_file
      });
    }
    
    // בדיקה רחבה יותר לשדות קובץ אפשריים
    const attachmentField = note.attachment || note.file_name || note.filename || note.attached_file;
    
    if (attachmentField && attachmentField !== null && attachmentField !== '' && attachmentField !== 'null') {
      const fileName = attachmentField;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      let fileIcon = '📄'; // ברירת מחדל

      // קביעת אייקון לפי סוג הקובץ
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'tiff', 'tif'].includes(fileExtension)) {
        fileIcon = '🖼️';
      } else if (['pdf'].includes(fileExtension)) {
        fileIcon = '📕';
      } else if (['doc', 'docx'].includes(fileExtension)) {
        fileIcon = '📘';
      } else if (['txt', 'rtf'].includes(fileExtension)) {
        fileIcon = '📄';
      } else if (['xls', 'xlsx'].includes(fileExtension)) {
        fileIcon = '📊';
      } else if (['ppt', 'pptx'].includes(fileExtension)) {
        fileIcon = '📋';
      }

      // הצגת אייקון + 10 תווים ראשונים עם אפשרות להורדה
      const shortName = fileName.length > 10 ? fileName.substring(0, 10) + '...' : fileName;
      attachmentDisplay = `<span title="${fileName}" style="cursor: pointer;" onclick="window.open('/api/notes/files/${fileName}', '_blank')">${fileIcon} ${shortName}</span>`;
    } else if (window.location.search.includes('debug=1') && (note.attachment || note.file_name || note.filename)) {
      // במקרה של debug - הצג מידע על שדות שקיימים אבל לא מוצגים
      attachmentDisplay = `🔍 DEBUG: Has fields but not displayed`;
    }

    // קביעת סימבול ואובייקט מקושר (כמו בעמוד התראות)
    let symbolDisplay = '-';
    let relatedDisplay = 'כללי';
    let relatedIcon = '🌐';
    let relatedClass = 'related-general';

    if (note.related_type_id && note.related_id) {
      // שימוש ב-related_entity_name שמגיע מהשרת
      relatedDisplay = note.related_entity_name || `אובייקט ${note.related_id}`;
      symbolDisplay = note.related_entity_name || '-';
      
      // קביעת אייקון וcss class לפי סוג
      switch (note.related_type_id) {
        case 1: // חשבון
          relatedIcon = '🏦';
          relatedClass = 'related-account';
          symbolDisplay = ''; // חשבון - ריק לחלוטין
          break;
        case 2: // טרייד
          relatedIcon = '📈';
          relatedClass = 'related-trade';
          break;
        case 3: // תוכנית
          relatedIcon = '📋';
          relatedClass = 'related-plan';
          break;
        case 4: // טיקר
          relatedIcon = '📊';
          relatedClass = 'related-ticker';
          break;
        default:
          relatedIcon = '❓';
          relatedClass = 'related-other';
      }
    }

    // הוספת האייקון לפני האובייקט
    relatedDisplay = relatedIcon + relatedDisplay;

    // שימוש ברכיב הגנרי להצגת אובייקט קשור (Linked Object Badge v2)
    const relatedBadge = (window.FieldRendererService && window.FieldRendererService.renderLinkedEntity)
      ? window.FieldRendererService.renderLinkedEntity(
          note.related_type || note.related_type_id,
          note.related_id,
          note.related_entity_name,
          {
            ticker: symbolDisplay || '',
            date: note.created_at || '',
          }
        )
      : `<div class='related-object-cell ${relatedClass}'>${relatedDisplay}</div>`;

    const dateBadge = window.FieldRendererService ? 
      window.FieldRendererService.renderDate(note.created_at) : 
      date;

    // קביעת סוג לפילטר
    let typeForFilter = 'כללי';
    if (note.related_type_id) {
      switch (note.related_type_id) {
      case 1: typeForFilter = 'חשבון'; break;
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
        'class=\'symbol-link\' title=\'עבור לדף החשבון\'>🔗</a>';
    } else if (symbolDisplay && symbolDisplay !== '-' && symbolDisplay !== '') {
      // עבור טיקרים, טריידים ותוכניות - הצג אייקון קישור + סימבול
      symbolLink = `<a href='#' onclick='showTickerPage("${symbolDisplay}")' ` +
        `class='symbol-link' title='עבור לדף הטיקר'>🔗</a> ${symbolDisplay}`;
    }

    return `
      <tr onclick='viewNote(${note.id})' class='clickable-row'>
        <td class='ticker-cell'><span class='symbol-text'>${symbolLink}</span></td>
        <td class='no-padding' data-type='${typeForFilter}'>${relatedBadge}</td>
        <td>${contentDisplay}</td>
        <td>${attachmentDisplay}</td>
        <td data-date='${note.created_at}'>${dateBadge}</td>
        <td class='col-actions actions-cell' onclick='event.stopPropagation();'>
            ${window.createActionsMenu ? window.createActionsMenu([
                window.createButton ? window.createButton('VIEW', `showNoteDetails(${note.id})`) : '',
                window.createLinkButton ? window.createLinkButton(`window.showLinkedItemsModal && window.showLinkedItemsModal([], 'note', ${note.id})`) : '',
                window.createEditButton ? window.createEditButton(`editNote(${note.id})`) : '',
                window.createDeleteButton ? window.createDeleteButton(`deleteNote(${note.id})`) : ''
            ], note.id) : ''}
        </td>
      </tr>
    `;
  }).join('');

  tbody.innerHTML = rows;
  
  // עדכון table-count ו-info-summary
  updateNotesSummary(notes);
}

// פונקציה לעדכון סיכום הערות
function updateNotesSummary(notes) {
  // שמירת המספר המקורי לחיפוש
  window.originalNotesCount = notes.length;

  // עדכון table-count
  const tableCountElement = document.querySelector('.table-count');
  if (tableCountElement) {
    tableCountElement.textContent = `${notes.length} הערות`;
  }

  // עדכון info-summary
  const totalNotesElement = document.getElementById('totalNotes');
  const activeNotesElement = document.getElementById('activeNotes');
  const recentNotesElement = document.getElementById('recentNotes');
  const totalLinksElement = document.getElementById('totalLinks');

  if (totalNotesElement) {
    totalNotesElement.textContent = notes.length;
  }

  if (activeNotesElement) {
    // הערות פעילות = כל ההערות (כרגע)
    activeNotesElement.textContent = notes.length;
  }

  if (recentNotesElement) {
    // הערות חדשות = הערות מה-7 ימים האחרונים
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentNotes = notes.filter(note => {
      const noteDate = new Date(note.created_at);
      return noteDate >= oneWeekAgo;
    });

    recentNotesElement.textContent = recentNotes.length;
  }

  if (totalLinksElement) {
    // סה"כ קישורים = הערות עם related_id
    const linkedNotes = notes.filter(note => note.related_id && note.related_type_id);
    totalLinksElement.textContent = linkedNotes.length;
  }

}

// פונקציה לעדכון גלובלי של הטבלה (נדרשת עבור הפילטרים)
function updateGridFromComponent(
  _selectedStatuses,
  _selectedTypes,
  _selectedAccounts,
  _selectedDateRange,
  _searchTerm,
) {
  // כרגע רק נטען מחדש את הנתונים
  loadNotesData();
}

// פונקציות מודלים
function showAddNoteModal() {
  // איפוס הטופס
  addNoteForm.reset();

  // ניקוי עורך הטקסט
  setEditorContent('', 'add');

  // ניקוי ולידציה
  clearNoteValidationErrors();

  // הסרת קלאסים של ולידציה
  const fields = document.querySelectorAll('.is-valid, .is-invalid');
  fields.forEach(field => {
    field.classList.remove('is-valid', 'is-invalid');
  });

  // טעינת נתונים למודל
  loadModalData();

  // בחירת טיקר כברירת מחדל אחרי טעינת הנתונים
  setTimeout(() => {
    const relationTypeSelect = document.getElementById('noteRelationType');
    if (relationTypeSelect) {
      relationTypeSelect.value = '4'; // טיקר = 4
      // טעינת אפשרויות לטיקר
      if (window.modalTickers) {
        populateSelect('noteRelationId', window.modalTickers, 'symbol', '');
        // הפעלת השדה
        const relationIdSelect = document.getElementById('noteRelationId');
        if (relationIdSelect) {
          relationIdSelect.disabled = false;
        }
      }
    }
  }, 200);

  // הצגת המודל
  if (addNoteModal) {
    addNoteModal.show();
  } else {
    const modal = bootstrap.Modal.getOrCreateInstance(addNoteModalElement);
    modal.show();
  }
}

async function showEditNoteModal(noteId) {
  // ניקוי דגלים
  window.removeAttachmentFlag = false;
  window.replaceAttachmentFlag = false;

  // הצגת המודל קודם
  let modal;
  if (editNoteModal) {
    modal = editNoteModal;
    modal.show();
  } else {
    modal = bootstrap.Modal.getOrCreateInstance(editNoteModalElement);
    modal.show();
  }

  // המתנה שהמודל יפתח ואז טעינת נתוני ההערה
  setTimeout(async () => {
    await loadNoteData(noteId);
  }, 100);
}

async function loadNoteData(noteId) {
  try {
    const response = await fetch(`/api/notes/${noteId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    // חילוץ הנתונים מהמבנה הנכון
    const note = responseData.data || responseData;
    
    // הגנה על נתונים חסרים
    if (!note || !note.id) {
      throw new Error('נתוני הערה לא נמצאו או לא תקינים');
    }
    // מילוי הטופס
    try {
      const editNoteIdElement = document.getElementById('editNoteId');
      if (editNoteIdElement) {
        editNoteIdElement.value = note.id;
      }
      setEditorContent(note.content || '', 'edit');
    } catch (error) {
      console.error('❌ שגיאה במילוי טופס העריכה:', error);
    }

    // הצגת קובץ מצורף נוכחי
    try {
      
      // בדיקה רחבה יותר לשדות קובץ אפשריים (כמו בטבלה)
      const attachmentField = note.attachment || note.file_name || note.filename || note.attached_file;
      
      displayCurrentAttachment(attachmentField);
    } catch (error) {
      console.error('❌ שגיאה בהצגת קובץ מצורף:', error);
    }

    // בחירת סוג הקשר
    const relationType = note.related_type_id;
    if (relationType) {
      const relationTypeSelect = document.getElementById('editNoteRelatedType');
      if (relationTypeSelect) {
        relationTypeSelect.value = relationType;
        
        // טעינת נתונים למודל אם עוד לא נטענו
        if (typeof window.loadModalData === 'function') {
          await window.loadModalData();
        }

        // מילוי הרשימה הנכונה לפי סוג הקשר
        await populateEditSelectByType(relationType, note.related_id);
      } else {
        console.warn('⚠️ לא נמצא select לסוג הקשר במודל העריכה');
      }
    }

  } catch (error) {
    console.error('❌ שגיאה בטעינת נתוני הערה:', error);
    console.error('❌ שגיאה מפורטת:', {
      message: error.message,
      stack: error.stack,
      noteId: noteId
    });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', `שגיאה בטעינת נתוני הערה: ${error.message}`);
    }
  }
}

async function loadModalData() {
  try {
    // טעינת נתונים במקביל
    const [accountsResponse, tradesResponse, tradePlansResponse, tickersResponse] = await Promise.all([
      fetch('/api/trading-accounts/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/trades/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/trade_plans/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/tickers/').then(r => r.json()).catch(() => ({ data: [] })),
    ]);

    const accounts = Array.isArray(accountsResponse.data) ? accountsResponse.data : [];
    const trades = Array.isArray(tradesResponse.data) ? tradesResponse.data : [];
    const tradePlans = Array.isArray(tradePlansResponse.data) ? tradePlansResponse.data : [];
    const tickers = Array.isArray(tickersResponse.data) ? tickersResponse.data : [];

    // עדכון רדיו באטונים
    updateRadioButtons(accounts, trades, tradePlans, tickers);

    // הערה: מילוי הנתונים יתבצע באופן דינמי כאשר המשתמש בוחר סוג קשר

  } catch {
    // המשך עם מערכים ריקים
    updateRadioButtons([], [], [], []);
  }
}

/**
 * עדכון select handlers לפי סוג הקשר
 */
function updateRadioButtons(accounts, trades, tradePlans, tickers) {
  // שמירת הנתונים בגלובל לשימוש מאוחר יותר
  window.modalAccounts = accounts;
  window.modalTrades = trades;
  window.modalTradePlans = tradePlans;
  window.modalTickers = tickers;

  // עדכון select לסוג קשר במודל הוספה
  const relationTypeSelect = document.getElementById('noteRelationType');
  if (relationTypeSelect) {
    // הסרת listeners קודמים כדי להימנע מהכפלה
    relationTypeSelect.removeEventListener('change', handleRelationTypeChange);
    relationTypeSelect.addEventListener('change', handleRelationTypeChange);
  }

  // עדכון select לסוג קשר במודל עריכה
  const editRelationTypeSelect = document.getElementById('editNoteRelatedType');
  if (editRelationTypeSelect) {
    editRelationTypeSelect.removeEventListener('change', handleEditRelationTypeChange);
    editRelationTypeSelect.addEventListener('change', handleEditRelationTypeChange);
  }
}

/**
 * טיפול בשינוי סוג קשר במודל הוספה
 */
function handleRelationTypeChange(event) {
  const relationType = event.target.value;
  const relationIdSelect = document.getElementById('noteRelationId');
  
  if (!relationIdSelect) return;
  
  // מחיקת אפשרויות קודמות
  relationIdSelect.innerHTML = '<option value="">בחר פריט</option>';
  
  // הפעלת השדה
  relationIdSelect.disabled = false;
  
  // מילוי לפי סוג הקשר
  switch (relationType) {
    case '1': // חשבון
      if (window.modalAccounts) {
        populateSelect('noteRelationId', window.modalAccounts, 'name', 'חשבון');
      }
      break;
    case '2': // טרייד
      if (window.modalTrades) {
        populateSelect('noteRelationId', window.modalTrades, null, 'טרייד');
      }
      break;
    case '3': // תוכנית
      if (window.modalTradePlans) {
        populateSelect('noteRelationId', window.modalTradePlans, null, 'תכנון');
      }
      break;
    case '4': // טיקר
      if (window.modalTickers) {
        populateSelect('noteRelationId', window.modalTickers, 'symbol', '');
      }
      break;
  }
}

/**
 * טיפול בשינוי סוג קשר במודל עריכה
 */
function handleEditRelationTypeChange(event) {
  const relationType = event.target.value;
  const relationIdSelect = document.getElementById('editNoteRelatedId');
  
  if (!relationIdSelect) return;
  
  // מחיקת אפשרויות קודמות
  relationIdSelect.innerHTML = '<option value="">בחר פריט</option>';
  
  // מילוי לפי סוג הקשר
  switch (relationType) {
    case '1': // חשבון
      if (window.modalAccounts) {
        populateSelect('editNoteRelatedId', window.modalAccounts, 'name', 'חשבון');
      }
      break;
    case '2': // טרייד
      if (window.modalTrades) {
        populateSelect('editNoteRelatedId', window.modalTrades, null, 'טרייד');
      }
      break;
    case '3': // תוכנית
      if (window.modalTradePlans) {
        populateSelect('editNoteRelatedId', window.modalTradePlans, null, 'תכנון');
      }
      break;
    case '4': // טיקר
      if (window.modalTickers) {
        populateSelect('editNoteRelatedId', window.modalTickers, 'symbol', '');
      }
      break;
  }
}

/**
 * מילוי select עם נתונים
 */
function populateSelect(selectId, data, field, prefix = '') {
  const select = document.getElementById(selectId);
  if (!select) {return;}

  if (data.length > 0) {
    // Data available for population
  }

  select.innerHTML = '<option value="">בחר אובייקט לשיוך...</option>';

  // מיון הרשומות לפי סימבול/שם לפני הצגה
  const sortedData = [...data].sort((a, b) => {
    let compareA, compareB;
    
    if (prefix === 'חשבון') {
      // לחשבונות: מיון לפי שם
      compareA = a.name || a.account_name || '';
      compareB = b.name || b.account_name || '';
    } else if (prefix === 'טרייד' || prefix === 'תכנון') {
      // לטריידים ותוכניות: מיון לפי סימבול
      compareA = a.symbol || a.ticker_symbol || a.ticker?.symbol || '';
      compareB = b.symbol || b.ticker_symbol || b.ticker?.symbol || '';
    } else {
      // לטיקרים: מיון לפי סימבול
      compareA = a.symbol || a.ticker_symbol || a[field] || '';
      compareB = b.symbol || b.ticker_symbol || b[field] || '';
    }
    
    return compareA.localeCompare(compareB, 'he', { numeric: true });
  });

  sortedData.forEach(item => {
    const option = document.createElement('option');
    option.value = item.id;

    // יצירת טקסט מותאם לכל סוג אובייקט
    let displayText = '';

    if (prefix === 'חשבון') {
      // עבור חשבון: שם החשבון + מטבע
      const name = item.name || item.account_name || 'לא מוגדר';
      const currency = item.currency || 'ILS';
      displayText = `${name} (${currency})`;
    } else if (prefix === 'טרייד') {
      // עבור טרייד: סימבול | צד | סוג השקעה | תאריך
      const symbol = item.symbol || item.ticker_symbol || item.ticker?.symbol || 'לא מוגדר';
      const side = item.side || 'לא מוגדר';
      const investmentType = item.investment_type || 'לא מוגדר';
      const date = item.created_at || item.date;
      const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
      displayText = `${symbol} | ${side} | ${investmentType} | ${formattedDate}`;
    } else if (prefix === 'תכנון') {
      // עבור תכנון: סימבול | צד | סוג השקעה | תאריך
      const symbol = item.symbol || item.ticker_symbol || item.ticker?.symbol || 'לא מוגדר';
      const side = item.side || 'לא מוגדר';
      const investmentType = item.investment_type || 'לא מוגדר';
      const date = item.created_at || item.date;
      const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
      displayText = `${symbol} | ${side} | ${investmentType} | ${formattedDate}`;
    } else {
      // עבור טיקר: רק סימבול
      displayText = item[field] || item.symbol || 'לא מוגדר';
    }

    option.textContent = displayText;
    select.appendChild(option);
  });
}

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
    case 1: { // חשבון
      try {
        const accountsResponse = await fetch('/api/trading-accounts/');
        if (!accountsResponse.ok) throw new Error(`HTTP error! status: ${accountsResponse.status}`);
        const accountsData = await accountsResponse.json();
        data = Array.isArray(accountsData.data) ? accountsData.data : [];
      } catch (error) {
        console.error('❌ שגיאה בטעינת חשבונות:', error);
        data = [];
      }
      displayField = 'name';
      placeholder = 'חשבון';
      break;
    }
    case 2: { // טרייד
      try {
        const tradesResponse = await fetch('/api/trades/');
        if (!tradesResponse.ok) throw new Error(`HTTP error! status: ${tradesResponse.status}`);
        const tradesData = await tradesResponse.json();
        data = Array.isArray(tradesData.data) ? tradesData.data : [];
      } catch (error) {
        console.error('❌ שגיאה בטעינת טריידים:', error);
        data = [];
      }
      displayField = null;
      placeholder = 'טרייד';
      break;
    }
    case 3: { // תוכנית
      try {
        const plansResponse = await fetch('/api/trade_plans/');
        if (!plansResponse.ok) throw new Error(`HTTP error! status: ${plansResponse.status}`);
        const plansData = await plansResponse.json();
        data = Array.isArray(plansData.data) ? plansData.data : [];
      } catch (error) {
        console.error('❌ שגיאה בטעינת תוכניות:', error);
        data = [];
      }
      displayField = null;
      placeholder = 'תכנון';
      break;
    }
    case 4: { // טיקר
      try {
        const tickersResponse = await fetch('/api/tickers/');
        if (!tickersResponse.ok) throw new Error(`HTTP error! status: ${tickersResponse.status}`);
        const tickersData = await tickersResponse.json();
        data = Array.isArray(tickersData.data) ? tickersData.data : [];
      } catch (error) {
        console.error('❌ שגיאה בטעינת טיקרים:', error);
        data = [];
      }
      displayField = 'symbol';
      placeholder = 'טיקר';
      break;
    }
    }

    // מילוי הרשימה
    const prefix = (placeholder === 'טרייד') ? 'טרייד' : 
                   (placeholder === 'תכנון') ? 'תכנון' : 
                   (placeholder === 'חשבון') ? 'חשבון' : '';
    populateSelect('editNoteRelatedId', data, displayField, prefix);

    // בחירת הערך הנכון
    if (selectedId) {
      setTimeout(() => {
        const select = document.getElementById('editNoteRelatedId');
        if (select) {
          select.value = selectedId;
        }
      }, 100);
    }

  } catch (error) {
    console.error('❌ שגיאה במילוי רשימה לעריכה:', error);
    console.error('❌ פרטים נוספים:', {
      relationType: relationType,
      selectedId: selectedId,
      message: error.message,
      stack: error.stack
    });
  }
}

/**
 * וולידציה מקיפה של טופס הערה חדשה
 * לפי STANDARD_VALIDATION_GUIDE.md + לוגיקה מיוחדת לעורך טקסט
 * 
 * @param {string} content - תוכן ההערה
 * @param {string} relationType - סוג הקשר
 * @param {string} relatedId - מזהה האובייקט הקשור
 * @param {File} attachment - קובץ מצורף (אופציונלי)
 * @returns {boolean} true אם הטופס תקין, false אחרת
 */
function validateNoteForm(content, relationType, relatedId, attachment) {
  // 1. ולידציה בסיסית של שדות HTML רגילים
  const basicValidation = window.validateEntityForm('addNoteForm', [
    { id: 'noteRelationType', name: 'סוג אובייקט' },
    { id: 'noteRelationId', name: 'אובייקט מקושר' }
  ]);
  
  if (!basicValidation) {
    return false;
  }

  // ולידציה מותאמת לשדות ספציפיים
  if (!relationType || relationType === '') {
    if (typeof window.showFieldError === 'function') {
      window.showFieldError('noteRelationType', 'יש לבחור סוג אובייקט לשיוך');
    }
    return false;
  }

  if (!relatedId || relatedId === '') {
    if (typeof window.showFieldError === 'function') {
      window.showFieldError('noteRelationId', 'יש לבחור אובייקט לשיוך');
    }
    return false;
  }

  // 2. ולידציה מיוחדת לתוכן העורך (לא שדה HTML רגיל)
  if (!content || content.trim().length === 0) {
    if (typeof window.showFieldError === 'function') {
      window.showFieldError('noteContent', 'תוכן הערה הוא שדה חובה');
    }
    if (window.showSimpleErrorNotification) {
      window.showSimpleErrorNotification('שגיאת ולידציה', 'תוכן הערה הוא שדה חובה');
    }
    return false;
  }
  
  if (content.length > 10000) {
    if (window.showSimpleErrorNotification) {
      window.showSimpleErrorNotification('שגיאת ולידציה', 'תוכן ההערה ארוך מדי (מקסימום 10,000 תווים)');
    }
    return false;
  }

  // 3. ולידציה של קובץ מצורף (אם קיים)
  if (attachment) {
    const maxSize = 5 * 1024 * 1024; // 5MB - מתאים לשרת
    if (attachment.size > maxSize) {
      if (window.showSimpleErrorNotification) {
        window.showSimpleErrorNotification('שגיאת ולידציה', 'קובץ מצורף גדול מדי (מקסימום 5MB)');
      }
      return false;
    }

    const allowedTypes = [
      // תמונות
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml', 'image/tiff',
      // מסמכים
      'application/pdf',
      // מסמכי Office
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // קבצי טקסט
      'text/plain', 'application/rtf'
    ];
    if (!allowedTypes.includes(attachment.type)) {
      if (window.showSimpleErrorNotification) {
        window.showSimpleErrorNotification('שגיאת ולידציה', 'סוג קובץ לא נתמך. מותרים: תמונות, מסמכי PDF, Office וטקסט');
      }
      return false;
    }
  }

  return true;
}

/**
 * וולידציה מקיפה של טופס עריכת הערה
 * לפי STANDARD_VALIDATION_GUIDE.md + לוגיקה מיוחדת לעורך טקסט
 * 
 * @param {string} content - תוכן ההערה
 * @param {string} relationType - סוג הקשר
 * @param {string} relatedId - מזהה האובייקט הקשור
 * @param {File} attachment - קובץ מצורף (אופציונלי)
 * @returns {boolean} true אם הטופס תקין, false אחרת
 */
function validateEditNoteForm(content, relationType, relatedId, attachment) {
  // 1. ולידציה בסיסית של שדות HTML רגילים
  const basicValidation = window.validateEntityForm('editNoteForm', [
    { id: 'editNoteRelatedType', name: 'סוג אובייקט' },
    { id: 'editNoteRelatedId', name: 'אובייקט מקושר' }
  ]);
  
  if (!basicValidation) {
    return false;
  }

  // ולידציה מותאמת לשדות ספציפיים
  if (!relationType || relationType === '') {
    if (typeof window.showFieldError === 'function') {
      window.showFieldError('editNoteRelatedType', 'יש לבחור סוג אובייקט לשיוך');
    }
    return false;
  }

  if (!relatedId || relatedId === '') {
    if (typeof window.showFieldError === 'function') {
      window.showFieldError('editNoteRelatedId', 'יש לבחור אובייקט לשיוך');
    }
    return false;
  }

  // 2. ולידציה מיוחדת לתוכן העורך
  if (!content || content.trim().length === 0) {
    if (typeof window.showFieldError === 'function') {
      window.showFieldError('editNoteContent', 'תוכן הערה הוא שדה חובה');
    }
    if (window.showSimpleErrorNotification) {
      window.showSimpleErrorNotification('שגיאת ולידציה', 'תוכן הערה הוא שדה חובה');
    }
    return false;
  }
  
  if (content.length > 10000) {
    if (window.showSimpleErrorNotification) {
      window.showSimpleErrorNotification('שגיאת ולידציה', 'תוכן ההערה ארוך מדי (מקסימום 10,000 תווים)');
    }
    return false;
  }

  // 3. ולידציה של קובץ מצורף (אם קיים)
  if (attachment) {
    const maxSize = 5 * 1024 * 1024; // 5MB - מתאים לשרת
    if (attachment.size > maxSize) {
      if (window.showSimpleErrorNotification) {
        window.showSimpleErrorNotification('שגיאת ולידציה', 'קובץ מצורף גדול מדי (מקסימום 5MB)');
      }
      return false;
    }

    const allowedTypes = [
      // תמונות
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml', 'image/tiff',
      // מסמכים
      'application/pdf',
      // מסמכי Office
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // קבצי טקסט
      'text/plain', 'application/rtf'
    ];
    if (!allowedTypes.includes(attachment.type)) {
      if (window.showSimpleErrorNotification) {
        window.showSimpleErrorNotification('שגיאת ולידציה', 'סוג קובץ לא נתמך. מותרים: תמונות, מסמכי PDF, Office וטקסט');
      }
      return false;
    }
  }

  return true;
}

// פונקציות שמירה ומחיקה
async function saveNote() {
  // איסוף נתונים מהטופס
  const content = getEditorContent('add');
  const relationType = document.getElementById('noteRelationType')?.value;
  const relatedId = document.getElementById('noteRelationId')?.value;
  const attachment = document.getElementById('noteAttachment').files[0];

  // ולידציה מקיפה
  if (!validateNoteForm(content, relationType, relatedId, attachment)) {
    return;
  }

  clearNoteValidationErrors();

  try {
    let response;

    // אם יש קובץ מצורף, השתמש ב-FormData
    if (attachment) {
      console.log('📎 יש קובץ מצורף, שולח דרך FormData:', attachment.name, attachment.size);
      const formData = new FormData();
      formData.append('content', content);
      formData.append('related_type_id', relationType);
      formData.append('related_id', relatedId);
      formData.append('attachment', attachment);

      response = await fetch('/api/notes/', {
        method: 'POST',
        body: formData, // אין headers עבור FormData - הדפדפן יוסיף אותם אוטומטית
      });
      
      // לוג לתגובה
      console.log('📋 Response status:', response.status, response.statusText);
      
      // אם יש שגיאה, נוסיף לוג מפורט
      if (!response.ok) {
        try {
          const errorResponse = await response.clone().json();
          console.log('❌ Error response:', errorResponse);
        } catch (e) {
          console.log('❌ Could not parse error response:', e);
        }
      }
    } else {
      console.log('📎 אין קובץ מצורף, שולח דרך JSON');
      // אם אין קובץ, השתמש ב-JSON
      const requestData = {
        content,
        related_type_id: parseInt(relationType),
        related_id: parseInt(relatedId),
      };

      response = await fetch('/api/notes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
    }

    // טיפול בתגובה באמצעות CRUDResponseHandler עם customValidationParser
    const result = await window.CRUDResponseHandler.handleSaveResponse(response, {
      modalId: 'addNoteModal',
      successMessage: 'הערה נשמרה בהצלחה',
      apiUrl: '/api/notes/',
      customValidationParser: (errorMessage, errorData) => {
        // errorMessage יכול להיות מחרוזת או אובייקט
        let messageStr = '';
        if (typeof errorMessage === 'string') {
          messageStr = errorMessage;
        } else if (typeof errorMessage === 'object' && errorMessage.message) {
          messageStr = errorMessage.message;
        } else if (typeof errorMessage === 'object') {
          messageStr = JSON.stringify(errorMessage);
        } else {
          messageStr = String(errorMessage);
        }
        
        // בדיקה אם זה שגיאת קובץ (לא validation של בסיס נתונים)
        if (messageStr.includes('קובץ גדול מדי') || 
            messageStr.includes('פורמט קובץ לא נתמך') || 
            messageStr.includes('שגיאה בשמירת הקובץ')) {
          // שגיאות קובץ - לא צריכים field error, רק הודעת שגיאה כללית
          return null; // CRUDResponseHandler יציג את ההודעה הכללית
        }
        
        // בדיקת שגיאות ולידציה של בסיס נתונים
        if (!messageStr || !messageStr.includes('validation failed')) return null;
        
        const validationErrors = messageStr.replace('Note validation failed: ', '').split('; ');
        return validationErrors.map(error => {
          if (error.includes("Field 'content' is required")) {
            return { fieldId: 'noteContent', message: 'תוכן הערה הוא שדה חובה' };
          } else if (error.includes("Field 'related_type_id' is required")) {
            return { fieldId: 'noteRelationType', message: 'יש לבחור סוג אובייקט לשיוך' };
          } else if (error.includes("Field 'related_id' is required")) {
            return { fieldId: 'noteRelationId', message: 'יש לבחור אובייקט לשיוך' };
          } else if (error.includes("Field 'related_id' references non-existent record")) {
            return { fieldId: 'noteRelationId', message: 'האובייקט שנבחר לא קיים במערכת' };
          }
          return null;
        }).filter(Boolean);
      },
      entityName: 'הערה'
    });

    // אם הפעולה הצליחה, הטופס יתאפס והמודל ייסגר אוטומטית
    // אם נכשלה, הטופס יישאר פתוח עם שגיאות ולידציה
    if (result === null) {
      // שגיאה - הטופס נשאר פתוח
      console.log('שמירת הערה נכשלה - הטופס נשאר פתוח לתקנות');
    }

  } catch {
    window.showErrorNotification('שגיאה בשמירה', 'שגיאה בשמירת הערה - בדוק את הנתונים שהוזנו');
  }
}

async function updateNoteFromModal() {
  // איסוף נתונים מהטופס
  const editNoteIdElement = document.getElementById('editNoteId');
  if (!editNoteIdElement) {
    console.error('❌ אלמנט editNoteId לא נמצא');
    window.showErrorNotification('שגיאה', 'שגיאה בטעינת נתוני ההערה');
    return;
  }
  
  const noteId = editNoteIdElement.value;
  if (!noteId) {
    console.error('❌ מזהה הערה לא נמצא');
    window.showErrorNotification('שגיאה', 'מזהה ההערה לא נמצא');
    return;
  }
  
  const content = getEditorContent('edit');
  const relationType = document.getElementById('editNoteRelatedType')?.value;
  const relatedId = document.getElementById('editNoteRelatedId')?.value;
  const attachment = document.getElementById('editNoteAttachment')?.files[0];

  // בדיקה אם נדרשת מחיקת קובץ
  const shouldRemoveAttachment = window.removeAttachmentFlag === true;
  // const shouldReplaceAttachment = window.replaceAttachmentFlag === true;

  // ולידציה מקיפה
  if (!validateEditNoteForm(content, relationType, relatedId, attachment)) {
    return;
  }

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

    // טיפול בתגובה באמצעות CRUDResponseHandler עם customValidationParser
    const result = await window.CRUDResponseHandler.handleUpdateResponse(response, {
      modalId: 'editNoteModal',
      successMessage: 'הערה עודכנה בהצלחה',
      apiUrl: `/api/notes/${noteId}`,
      customValidationParser: (errorMessage, errorData) => {
        // errorMessage יכול להיות מחרוזת או אובייקט
        let messageStr = '';
        if (typeof errorMessage === 'string') {
          messageStr = errorMessage;
        } else if (typeof errorMessage === 'object' && errorMessage.message) {
          messageStr = errorMessage.message;
        } else if (typeof errorMessage === 'object') {
          messageStr = JSON.stringify(errorMessage);
        } else {
          messageStr = String(errorMessage);
        }
        
        // בדיקה אם זה שגיאת קובץ (לא validation של בסיס נתונים)
        if (messageStr.includes('קובץ גדול מדי') || 
            messageStr.includes('פורמט קובץ לא נתמך') || 
            messageStr.includes('שגיאה בשמירת הקובץ')) {
          // שגיאות קובץ - לא צריכים field error, רק הודעת שגיאה כללית
          return null; // CRUDResponseHandler יציג את ההודעה הכללית
        }
        
        // בדיקת שגיאות ולידציה של בסיס נתונים
        if (!messageStr || !messageStr.includes('validation failed')) return null;
        
        const validationErrors = messageStr.replace('Note validation failed: ', '').split('; ');
        return validationErrors.map(error => {
          if (error.includes("Field 'content' is required")) {
            return { fieldId: 'editNoteContent', message: 'תוכן הערה הוא שדה חובה' };
          } else if (error.includes("Field 'related_type_id' is required")) {
            return { fieldId: 'editNoteRelatedType', message: 'יש לבחור סוג אובייקט לשיוך' };
          } else if (error.includes("Field 'related_id' is required")) {
            return { fieldId: 'editNoteRelatedId', message: 'יש לבחור אובייקט לשיוך' };
          } else if (error.includes("Field 'related_id' references non-existent record")) {
            return { fieldId: 'editNoteRelatedId', message: 'האובייקט שנבחר לא קיים במערכת' };
          }
          return null;
        }).filter(Boolean);
      },
      entityName: 'הערה'
    });

    // אם הפעולה הצליחה, הטופס יתאפס והמודל ייסגר אוטומטית
    // אם נכשלה, הטופס יישאר פתוח עם שגיאות ולידציה
    if (result === null) {
      // שגיאה - הטופס נשאר פתוח
      console.log('עדכון הערה נכשל - הטופס נשאר פתוח לתקנות');
    }

  } catch {
    window.showErrorNotification('שגיאה בעדכון', 'שגיאה בעדכון הערה - בדוק את הנתונים שהוזנו');
  }
}

// פונקציה זו הוסרה - שימוש במערכת הגלובלית showDeleteWarning

async function confirmDeleteNote(noteId) {
  // סגירת המודל
  const modal = bootstrap.Modal.getInstance(deleteNoteModalElement);
  if (modal) {
    modal.hide();
  }

  // מחיקת ההערה
  await deleteNoteFromServer(noteId);
}

async function deleteNoteFromServer(noteId) {
  try {
    const response = await fetch(`/api/notes/${noteId}`, {
      method: 'DELETE',
    });

    // טיפול בתגובה באמצעות CRUDResponseHandler
    await window.CRUDResponseHandler.handleDeleteResponse(response, {
      successMessage: 'הערה נמחקה בהצלחה',
      reloadFn: async () => {
        // ניקוי מטמון
        if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
          await window.UnifiedCacheManager.remove('notes');
        }
        // רענון טבלה
        await loadNotesData();
      },
      entityName: 'הערה'
    });

  } catch (error) {
    console.error('❌ Error deleting note:', error);
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה במחיקה', error.message || 'שגיאה במחיקת הערה');
    }
  }
}

// פונקציות ולידציה

function clearNoteValidationErrors() {
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
//     return noteRelatedObjectSelect;
//   case 'editRelatedObjectError':
//     return editNoteRelatedObjectSelect;
//   default:
//     return null;
//   }
// }

window.loadNotesData = loadNotesData;
window.resetNotesLoadingFlag = () => { _isLoadingNotes = false; };
window.updateNotesTable = updateNotesTable;
window.updateNotesSummary = updateNotesSummary;
window.updateGridFromComponent = updateGridFromComponent;
window.showAddNoteModal = showAddNoteModal;
window.showEditNoteModal = showEditNoteModal;
window.saveNote = saveNote;
window.updateNoteFromModal = updateNoteFromModal;
window.updateNote = updateNoteFromModal; // Alias for backward compatibility
window.deleteNoteFromServer = deleteNoteFromServer;
// window.showDeleteNoteModal = showDeleteNoteModal; // הוסר - שימוש במערכת הגלובלית
window.confirmDeleteNote = confirmDeleteNote;
window.onNoteRelationTypeChange = onNoteRelationTypeChange;
window.populateEditSelectByType = populateEditSelectByType;
window.setupNoteValidationEvents = setupNoteValidationEvents;
window.updateRadioButtons = updateRadioButtons;
window.populateSelect = populateSelect;

// Second DOMContentLoaded removed - merged into initializeNotesPage
window.initializeNotesPage = function() {
    
    // אתחול modals
    if (typeof window.initializeNotesModals === 'function') {
        window.initializeNotesModals();
    }
    
    // אתחול מערכת פילטרים לפי סוג אובייקט מקושר
    if (typeof window.initializeRelatedObjectFilters === 'function') {
        window.initializeRelatedObjectFilters();
    }
    
    // שחזור מצב הסגירה (המערכת המאוחדת כבר מטפלת בזה)
    // No need - handled by unified system in finalization stage
    
    // טעינת נתונים
    if (typeof window.loadNotesData === 'function') {
        loadNotesData();
    }
    
    // הוספת ולידציה בזמן אמת
    setupNoteValidationEvents();
    
    // שחזור מצב סידור
    restoreSortState();
    
};

// פונקציה להגדרת אירועי ולידציה
function setupNoteValidationEvents() {
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
  const relatedObjectSelect = noteRelatedObjectSelect;
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
  const editRelatedObjectSelect = editNoteRelatedObjectSelect;
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

        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'tiff', 'tif'].includes(fileExtension)) {
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
            <div class="d-flex align-items-center gap-2">
              <span>${fileIcon}</span>
              <span>${fileName} (חדש)</span>
              <span class="text-success fw-bold">✓ נבחר</span>
            </div>
          `;
        }

        // עדכון כפתורי הפעולה
        const actionsElement = document.getElementById('attachmentActions');
        if (actionsElement) {
          actionsElement.innerHTML = `
            <button type="button" class="btn btn-sm btn-outline-success" disabled>
              ✅ קובץ נבחר
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="clearSelectedFile()">
              ❌ בטל בחירה
            </button>
          `;
          actionsElement.style.display = 'block';
        }
      }
    });
  }
}

// פונקציה לביטול בחירת קובץ
function clearSelectedFile() {
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
}

// הגדרת הפונקציה כגלובלית
// window.sortTable export removed - using global version from tables.js

/**
 * פונקציה להצגת דף טיקר (כרגע הודעת "בפיתוח")
 * @param {string} symbol - סמל הטיקר
 */
function showTickerPage(symbol) {
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('מידע', `דף הטיקר ${symbol} נמצא בפיתוח`);
  } else {
    // Fallback notification
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
        () => console.log('❌ הוספת לינק - משתמש ביטל')
      );
    } else {
      // Fallback to browser prompt
      const url = prompt('הכנס כתובת URL:', 'http://');
      insertLink(url);
    }
    break;
  }
  default:
    // console.warn(`⚠️ פקודה לא מוכרת: ${command}`);
  }
}

/**
 * ניקוי עיצוב בעורך
 * @param {string} mode - 'add' או 'edit'
 */
function clearFormatting(mode = 'add') {
  const editorId = mode === 'edit' ? 'editNoteContent' : 'noteContent';
  const editor = document.getElementById(editorId);

  if (!editor) {
    return;
  }

  editor.focus();
  document.execCommand('removeFormat', false, null);
}

/**
 * קבלת תוכן מעורך הטקסט
 * @param {string} mode - 'add' או 'edit'
 * @returns {string} תוכן העורך
 */
function getEditorContent(mode = 'add') {
  const editorId = mode === 'edit' ? 'editNoteContent' : 'noteContent';
  const editor = document.getElementById(editorId);

  if (!editor) {
    return '';
  }

  // בדיקה אם זה textarea או עורך עשיר
  if (editor.tagName === 'TEXTAREA') {
    // עבור textarea רגיל - השתמש ב-value
    return editor.value || '';
  } else {
    // עבור עורך עשיר - בדיקה של innerHTML ו-textContent
    const content = editor.innerHTML;
    const textContent = editor.textContent || editor.innerText || '';

    // אם אין תוכן טקסט, החזר מחרוזת ריקה
    if (!textContent.trim()) {
      return '';
    }

    return content;
  }
}

/**
 * הגדרת תוכן לעורך הטקסט
 * @param {string} content - התוכן להגדרה
 * @param {string} mode - 'add' או 'edit'
 */
function setEditorContent(content, mode = 'add') {
  const editorId = mode === 'edit' ? 'editNoteContent' : 'noteContent';
  const editor = document.getElementById(editorId);

  if (!editor) {
    return;
  }

  // בדיקה אם זה textarea או עורך עשיר
  if (editor.tagName === 'TEXTAREA') {
    // עבור textarea רגיל - השתמש ב-value
    editor.value = content || '';
  } else {
    // עבור עורך עשיר - השתמש ב-innerHTML
    editor.innerHTML = content || '';
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
function filterNotesData(searchTerm) {
  if (!window.notesData) {
    // console.warn('⚠️ אין נתוני הערות זמינים לסינון');
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
}

// פונקציה לסינון הערות לפי סוג
function filterNotesByType(type) {
  if (!window.notesData) {
    // console.warn('⚠️ אין נתוני הערות זמינים לסינון');
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
      btn.classList.add('btn-outline-primary');
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
      activeButton.classList.remove('btn-outline-primary');
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
}

// פונקציה לקבלת שם תצוגה לסוג
function getTypeDisplayName(type) {
  switch (type) {
  case 'account': return 'חשבונות';
  case 'trade': return 'טריידים';
  case 'trade_plan': return 'תוכניות';
  case 'ticker': return 'טיקרים';
  default: return type;
  }
}

// פונקציה לצפייה בהערה
function viewNote(noteId) {
  // שמירת מזהה ההערה הנוכחית
  window.currentViewingNoteId = noteId;

  // טעינת נתוני ההערה
  loadNoteForViewing(noteId);

  // הצגת המודל
  const modal = new bootstrap.Modal(viewNoteModalElement);
  modal.show();
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

      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'tiff', 'tif'].includes(fileExtension)) {
        fileIcon = '🖼️';
      } else if (['pdf'].includes(fileExtension)) {
        fileIcon = '📕';
      } else if (['doc', 'docx'].includes(fileExtension)) {
        fileIcon = '📘';
      } else if (['txt', 'rtf'].includes(fileExtension)) {
        fileIcon = '📄';
      } else if (['xls', 'xlsx'].includes(fileExtension)) {
        fileIcon = '📊';
      } else if (['ppt', 'pptx'].includes(fileExtension)) {
        fileIcon = '📋';
      }

      attachmentElement.innerHTML = `
        <a href="/api/notes/files/${fileName}" target="_blank" class="btn btn-sm btn-outline-primary">
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

// פונקציה לקבלת תצוגת הקשר של הערה
function getNoteRelatedDisplay(note) {
  if (!note.related_type_id || !note.related_id) {
    return 'כללי';
  }

  switch (note.related_type_id) {
  case 1: return `🏦 חשבון ${note.related_id}`;
  case 2: return `📈 טרייד ${note.related_id}`;
  case 3: return `📋 תוכנית ${note.related_id}`;
  case 4: return `📊 טיקר ${note.related_id}`;
  default: return `אובייקט ${note.related_id}`;
  }
}

// פונקציה לעריכת הערה נוכחית
function editCurrentNote() {
  const noteId = window.currentViewingNoteId;
  if (noteId) {
    // סגירת מודל הצפייה
    const viewModal = bootstrap.Modal.getInstance(viewNoteModalElement);
    viewModal.hide();

    // פתיחת מודל העריכה
    showEditNoteModal(noteId);
  }
}

// פונקציה להצגת קובץ מצורף נוכחי במודל עריכה
function displayCurrentAttachment(attachment) {
  const displayElement = document.getElementById('currentAttachmentDisplay');
  const actionsElement = document.getElementById('attachmentActions');

  if (!displayElement || !actionsElement) {
    console.warn('⚠️ Missing elements for attachment display');
    return;
  }

  if (attachment && attachment !== 'null' && attachment !== '') {
    const fileName = attachment;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    let fileIcon = '📄';

    // קביעת אייקון לפי סוג הקובץ (כמו בטבלה)
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'tiff', 'tif'].includes(fileExtension)) {
      fileIcon = '🖼️';
    } else if (['pdf'].includes(fileExtension)) {
      fileIcon = '📕';
    } else if (['doc', 'docx'].includes(fileExtension)) {
      fileIcon = '📘';
    } else if (['txt', 'rtf'].includes(fileExtension)) {
      fileIcon = '📄';
    } else if (['xls', 'xlsx'].includes(fileExtension)) {
      fileIcon = '📊';
    } else if (['ppt', 'pptx'].includes(fileExtension)) {
      fileIcon = '📋';
    }

    displayElement.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <span>${fileIcon}</span>
        <span>${fileName}</span>
        <a href="/api/notes/files/${fileName}" 
           target="_blank" 
           class="btn btn-sm btn-outline-primary ms-auto">
          👁️ צפה
        </a>
      </div>
    `;
    
    // הוספת כפתורי פעולה
    actionsElement.innerHTML = `
      <div class="d-flex gap-2">
        <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeCurrentAttachment()">
          🗑️ הסר
        </button>
        <button type="button" class="btn btn-sm btn-outline-secondary" onclick="clearSelectedFile()">
          ✏️ החלף
        </button>
      </div>
    `;
    
    actionsElement.style.display = 'block';
    displayElement.style.display = 'block';
  } else {
    displayElement.textContent = 'אין קובץ מצורף';
    displayElement.style.display = 'none';
    actionsElement.style.display = 'none';
  }
}

// פונקציה למחיקת קובץ מצורף נוכחי
function removeCurrentAttachment() {
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
}

// פונקציה להחלפת קובץ מצורף
function replaceCurrentAttachment() {
  const fileInput = document.getElementById('editNoteAttachment');
  if (fileInput) {
    fileInput.click();
  }

  // סימון שהחלפת הקובץ נדרשת
  window.replaceAttachmentFlag = true;
}

// ===== MISSING FUNCTIONS FOR ONCLICK ATTRIBUTES =====

// Toggle functions - removed duplicate function that was causing infinite recursion
// The global toggleSection function from ui-utils.js is used instead

// toggleSection function removed - use toggleSection('main') instead

// ===== GLOBAL EXPORTS =====
// Export functions to global scope for onclick attributes
// window.toggleSection removed - using global version from ui-utils.js
// toggleSection export removed - use toggleSection('main') instead
window.openNoteDetails = openNoteDetails;
window.editNote = editNote;
// Detailed Log Functions for Notes Page
function generateDetailedLog() {
    try {
        const logData = {
            timestamp: new Date().toISOString(),
            page: 'notes',
            url: window.location.href,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            performance: {
                loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
                domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
            },
            memory: window.performance.memory ? {
                used: window.performance.memory.usedJSHeapSize,
                total: window.performance.memory.totalJSHeapSize,
                limit: window.performance.memory.jsHeapSizeLimit
            } : null,
            notesStats: {
                totalNotes: document.getElementById('totalNotes')?.textContent || 'לא נמצא',
                activeNotes: document.getElementById('activeNotes')?.textContent || 'לא נמצא',
                recentNotes: document.getElementById('recentNotes')?.textContent || 'לא נמצא',
                totalLinks: document.getElementById('totalLinks')?.textContent || 'לא נמצא'
            },
            sections: {
                topSection: {
                    title: 'הערות',
                    visible: !document.querySelector('.top-section')?.classList.contains('d-none'),
                    alertsCount: document.querySelectorAll('.alert-card').length,
                    summaryStats: document.getElementById('summaryStats')?.textContent || 'לא נמצא'
                },
                contentSection: {
                    title: 'ההערות שלי',
                    visible: !document.querySelector('.content-section')?.classList.contains('d-none'),
                    tableRows: document.querySelectorAll('#notesTable tbody tr').length,
                    tableData: document.querySelector('#notesContainer')?.textContent?.substring(0, 300) || 'לא נמצא'
                }
            },
            tableData: {
                totalRows: document.querySelectorAll('#notesTable tbody tr').length,
                headers: Array.from(document.querySelectorAll('#notesTable thead th')).map(th => th.textContent?.trim()),
                sortableColumns: document.querySelectorAll('.sortable-header').length,
                hasData: document.querySelectorAll('#notesTable tbody tr').length > 0
            },
            filters: {
                allButton: document.querySelector('button[data-type="all"]') ? 'זמין' : 'לא זמין',
                accountButton: document.querySelector('button[data-type="account"]') ? 'זמין' : 'לא זמין',
                tradeButton: document.querySelector('button[data-type="trade"]') ? 'זמין' : 'לא זמין',
                tradePlanButton: document.querySelector('button[data-type="trade_plan"]') ? 'זמין' : 'לא זמין',
                tickerButton: document.querySelector('button[data-type="ticker"]') ? 'זמין' : 'לא זמין',
                activeFilter: document.querySelector('.btn.active')?.textContent || 'לא נמצא'
            },
            modals: {
                addModal: addNoteModalElement ? 'זמין' : 'לא זמין',
                editModal: editNoteModalElement ? 'זמין' : 'לא זמין',
                deleteModal: deleteNoteModalElement ? 'זמין' : 'לא זמין'
            },
            functions: {
                addNote: typeof window.addNote === 'function' ? 'זמין' : 'לא זמין',
                editNote: typeof window.editNote === 'function' ? 'זמין' : 'לא זמין',
                deleteNote: typeof window.deleteNote === 'function' ? 'זמין' : 'לא זמין',
                toggleSection: typeof window.toggleSection === 'function' ? 'זמין' : 'לא זמין',
                filterNotesByRelatedObjectType: typeof window.filterNotesByRelatedObjectType === 'function' ? 'זמין' : 'לא זמין',
                uploadFile: typeof window.uploadFile === 'function' ? 'זמין' : 'לא זמין',
                formatText: typeof window.formatText === 'function' ? 'זמין' : 'לא זמין'
            },
            console: {
                errors: [],
                warnings: [],
                logs: []
            }
        };

        // Capture console messages
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalLog = console.log;

        console.error = function(...args) {
            logData.console.errors.push(args.join(' '));
            originalError.apply(console, args);
        };

        console.warn = function(...args) {
            logData.console.warnings.push(args.join(' '));
            originalWarn.apply(console, args);
        };

        console.log = function(...args) {
            logData.console.logs.push(args.join(' '));
            originalLog.apply(console, args);
        };

        return JSON.stringify(logData, null, 2);
    } catch (error) {
        return `Error generating log: ${error.message}`;
    }
}


window.deleteNote = deleteNote;
// window.filterNotesByRelatedObjectType = filterNotesByRelatedObjectType; // REMOVED: Function is defined in related-object-filters.js
window.formatText = formatText;
// window.loadNotesData = loadNotesData; // REMOVED: Already exported above
window.addNote = addNote;
window.uploadFile = uploadFile;
window.removeCurrentAttachment = removeCurrentAttachment;
window.replaceCurrentAttachment = replaceCurrentAttachment;
// window.copyDetailedLog export removed - using global version from system-management.js
// window.generateDetailedLog = generateDetailedLog; // REMOVED: Local function only

// Local copyDetailedLog function for notes page
async function copyDetailedLog() {
    try {
        const detailedLog = await generateDetailedLog();
        if (detailedLog) {
            await navigator.clipboard.writeText(detailedLog);
            if (window.showSuccessNotification) {
                window.showSuccessNotification('לוג מפורט הועתק ללוח');
            } else {
                alert('לוג מפורט הועתק ללוח!');
            }
        } else {
            if (window.showWarningNotification) {
                window.showWarningNotification('אין לוג להעתקה');
            } else {
                alert('אין לוג להעתקה');
            }
        }
    } catch (err) {
        console.error('שגיאה בהעתקה:', err);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בהעתקת הלוג');
        } else {
            alert('שגיאה בהעתקת הלוג');
        }
    }
}


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
    console.log('➕ מוסיף הערה חדשה');
    
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
    console.log('📤 מעלה קובץ להערה:', noteId);
    
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
        console.log('✅ קובץ הועלה:', data);
        
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
    console.log('📥 מוריד קובץ:', noteId, fileName);
    
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
    console.log('🔗 מציג פריטים מקושרים להערה:', noteId);
    
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
        window.showEntityDetails('note', noteId, { mode: 'view' });
    } else {
        // הצגה פשוטה
        const details = `פרטי הערה:
ID: ${note.id}
תוכן: ${note.content || 'אין תוכן'}
קובץ מצורף: ${note.attachment || 'אין קובץ'}
נוצר: ${note.created_at ? new Date(note.created_at).toLocaleString('he-IL') : 'לא מוגדר'}
עודכן: ${note.updated_at ? new Date(note.updated_at).toLocaleString('he-IL') : 'לא מוגדר'}
קשור ל: ${note.related_type_id ? `סוג ${note.related_type_id}` : 'לא מוגדר'}`;
        alert(details);
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
async function loadNotesData() {
  console.log('🚀🚀🚀 loadNotesData התחיל 🚀🚀🚀');

  try {
    // קריאה לשרת לקבלת נתוני הערות
    console.log('📡 קריאה לשרת לקבלת נתוני הערות...');
    const response = await fetch('/api/notes/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    const notes = responseData.data || responseData;
    console.log('✅ נתונים התקבלו מהשרת:', notes ? notes.length : 0, 'הערות');

    // בדיקה אם הנתונים ריקים או לא תקינים
    if (!notes || notes.length === 0) {
      // console.warn('⚠️ לא נמצאו הערות בשרת');
      const tbody = document.querySelector('#notesTable tbody');
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center text-muted">
              <div style="padding: 20px;">
                <h5>📝 אין הערות</h5>
                <p>לא נמצאו הערות במערכת</p>
                <button class="btn btn-sm btn-primary" onclick="openNoteDetails()">הוסף הערה ראשונה</button>
              </div>
            </td>
          </tr>
        `;
      }
      return;
    }

    // טעינת נתונים נוספים (חשבונות, טריידים, תוכניות, טיקרים)

    // פונקציה לטעינת נתונים עם טיפול בשגיאות
    const loadDataSafely = async (url, _dataName) => {
      try {
        const innerResponse = await fetch(url);
        if (!innerResponse.ok) {
          // console.warn(`⚠️ שגיאה בטעינת ${_dataName}: ${innerResponse.status}`);
          return [];
        }
        const data = await innerResponse.json();
        if (data.status === 'error') {
          // console.warn(`⚠️ שגיאה ב-API ${_dataName}: ${data.error?.message || 'שגיאה לא ידועה'}`);
          return [];
        }
        return Array.isArray(data.data) ? data.data : [];
      } catch {
        // console.warn(`⚠️ שגיאה בטעינת ${_dataName}:`);
        return [];
      }
    };

    const [accounts, trades, tradePlans, tickers] = await Promise.all([
      loadDataSafely('/api/trading-accounts/', 'חשבונות מסחר'),
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
    handleDataLoadError(error, 'טעינת נתונים');

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
              <button class="btn btn-sm btn-primary" onclick="loadNotesData()">נסה שוב</button>
            </div>
          </td>
        </tr>
      `;
    }

    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בטעינת נתונים מהשרת: ' + error.message);
    } else {
      handleDataLoadError(error, 'טעינת נתונים מהשרת');
    }
  }
}

// פונקציה לעדכון הטבלה
function updateNotesTable(notes, accounts = [], trades = [], tradePlans = [], tickers = []) {
  console.log('🚀🚀🚀 updateNotesTable התחיל עם', notes ? notes.length : 0, 'הערות 🚀🚀🚀');
  
  const tbody = document.querySelector('#notesTable tbody');
  if (!tbody) {
    console.error('❌ לא נמצא tbody בטבלה');
    handleElementNotFound('updateNotesTable', 'לא נמצא tbody בטבלה');
    return;
  }
  
  console.log('✅ tbody נמצא:', tbody);

  if (!notes || notes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted">
          <div style="padding: 20px;">
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

    // שימוש ב-FieldRendererService לעיצוב שדות
    const relatedTypeBadge = window.FieldRendererService ? 
      window.FieldRendererService.renderType(note.related_type, 'related_type') : 
      `<div class='related-object-cell ${relatedClass}' style='justify-content: flex-start; text-align: right; min-width: 150px;'>${relatedDisplay}</div>`;

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
      <tr onclick='viewNote(${note.id})' style='cursor: pointer;'>
        <td class='ticker-cell'><span class='symbol-text'>${symbolLink}</span></td>
        <td style='padding: 0;' data-type='${typeForFilter}'>${relatedTypeBadge}</td>
        <td>${contentDisplay}</td>
        <td>${attachmentDisplay}</td>
        <td data-date='${note.created_at}'>${dateBadge}</td>
        <td class='col-actions actions-cell actions-3-btn' onclick='event.stopPropagation();'>
            <button class="btn btn-sm btn-outline-info" onclick="window.showLinkedItemsModal && window.showLinkedItemsModal([], 'note', ${note.id})" title="פריטים מקושרים">
                <i class="bi bi-link-45deg"></i>
            </button>
            <button class="btn btn-sm btn-outline-primary" onclick="editNote(${note.id})" title="עריכה">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-info" onclick="showNoteDetails(${note.id})" title="פרטים">
                <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteNote(${note.id})" title="מחיקה">
                <i class="bi bi-trash"></i>
            </button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.innerHTML = rows;
  console.log('✅ טבלת הערות עודכנה בהצלחה עם', notes.length, 'הערות');
  console.log('🔍 מספר שורות בטבלה:', tbody.children.length);
  
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
    document.getElementById('noteRelationTicker').checked = true;
    // טעינת אפשרויות לטיקר
    const tickerRadio = document.getElementById('noteRelationTicker');
    if (tickerRadio && window.modalTickers) {
      populateSelect('noteRelatedObjectSelect', window.modalTickers, 'symbol', '');
    }
  }, 200);

  // הצגת המודל
  const modal = new bootstrap.Modal(addNoteModalElement);
  modal.show();
}

function showEditNoteModal(noteId) {
  // ניקוי דגלים
  window.removeAttachmentFlag = false;
  window.replaceAttachmentFlag = false;

  // טעינת נתוני ההערה
  loadNoteData(noteId);

  // הצגת המודל
  const modal = new bootstrap.Modal(editNoteModalElement);
  modal.show();
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
    // מילוי הטופס
    document.getElementById('editNoteId').value = note.id;
    setEditorContent(note.content || '', 'edit');

    // הצגת קובץ מצורף נוכחי
    displayCurrentAttachment(note.attachment);

    // בחירת סוג הקשר
    const relationType = note.related_type_id;
    if (relationType) {
      // בחירת הרדיו באטון הנכון
      const radioButton = document.querySelector(`input[name="editNoteRelationType"][value="${relationType}"]`);
      if (radioButton) {
        radioButton.checked = true;
        // טעינת נתונים למודל אם עוד לא נטענו
        if (typeof window.loadModalData === 'function') {
          await window.loadModalData();
        }

        // מילוי הרשימה הנכונה לפי סוג הקשר
        await populateEditSelectByType(relationType, note.related_id);
      } else {
        handleElementNotFound('populateEditSelectByType', `לא נמצא רדיו באטון עבור ערך: ${relationType}`);
      }
    } else {
      // console.warn('⚠️ אין סוג קשר מוגדר');
    }

  } catch {
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בטעינת נתוני הערה');
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

    // הגדרת נתונים ראשוניים (ברירת מחדל לטיקר)
    populateSelect('noteRelatedObjectSelect', tickers, 'symbol', '');
    populateSelect('editNoteRelatedObjectSelect', tickers, 'symbol', '');

  } catch {
    // המשך עם מערכים ריקים
    updateRadioButtons([], [], [], []);
  }
}

/**
 * עדכון רדיו באטונים
 */
function updateRadioButtons(accounts, trades, tradePlans, tickers) {
  // עדכון רדיו באטון לחשבונות
  const accountRadio = document.getElementById('noteRelationAccount');
  const editAccountRadio = document.getElementById('editNoteRelationAccount');

  if (accountRadio) {
    accountRadio.addEventListener('change', () => {
      populateSelect('noteRelatedObjectSelect', accounts, 'name', 'חשבון');
    });
  }

  if (editAccountRadio) {
    editAccountRadio.addEventListener('change', () => {
      populateSelect('editNoteRelatedObjectSelect', accounts, 'name', 'חשבון');
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

  data.forEach(item => {
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
      const accountsResponse = await fetch('/api/trading-accounts/');
      const accountsData = await accountsResponse.json();
      data = Array.isArray(accountsData.data) ? accountsData.data : [];
      displayField = 'name';
      placeholder = 'חשבון';
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
        const select = editNoteRelatedObjectSelect;
        if (select) {
          select.value = selectedId;
        }
      }, 100);
    }

  } catch {
    // שגיאה במילוי רשימה לעריכה
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
    { id: 'noteRelatedObjectSelect', name: 'אובייקט מקושר' }
  ]);
  
  if (!basicValidation) {
    return false;
  }

  // 2. ולידציה מיוחדת לתוכן העורך (לא שדה HTML רגיל)
  if (!content) {
    if (window.showSimpleErrorNotification) {
      window.showSimpleErrorNotification('שגיאת ולידציה', 'תוכן הערה הוא שדה חובה');
    }
    return false;
  }
  
  if (content.length < 1) {
    if (window.showSimpleErrorNotification) {
      window.showSimpleErrorNotification('שגיאת ולידציה', 'תוכן ההערה חייב להכיל לפחות תו אחד');
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
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (attachment.size > maxSize) {
      if (window.showSimpleErrorNotification) {
        window.showSimpleErrorNotification('שגיאת ולידציה', 'קובץ מצורף גדול מדי (מקסימום 10MB)');
      }
      return false;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(attachment.type)) {
      if (window.showSimpleErrorNotification) {
        window.showSimpleErrorNotification('שגיאת ולידציה', 'סוג קובץ לא נתמך. מותרים: תמונות ו-PDF בלבד');
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
    { id: 'editNoteRelationType', name: 'סוג אובייקט' },
    { id: 'editNoteRelatedObjectSelect', name: 'אובייקט מקושר' }
  ]);
  
  if (!basicValidation) {
    return false;
  }

  // 2. ולידציה מיוחדת לתוכן העורך
  if (!content) {
    if (window.showSimpleErrorNotification) {
      window.showSimpleErrorNotification('שגיאת ולידציה', 'תוכן הערה הוא שדה חובה');
    }
    return false;
  }
  
  if (content.length < 1) {
    if (window.showSimpleErrorNotification) {
      window.showSimpleErrorNotification('שגיאת ולידציה', 'תוכן ההערה חייב להכיל לפחות תו אחד');
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
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (attachment.size > maxSize) {
      if (window.showSimpleErrorNotification) {
        window.showSimpleErrorNotification('שגיאת ולידציה', 'קובץ מצורף גדול מדי (מקסימום 10MB)');
      }
      return false;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(attachment.type)) {
      if (window.showSimpleErrorNotification) {
        window.showSimpleErrorNotification('שגיאת ולידציה', 'סוג קובץ לא נתמך. מותרים: תמונות ו-PDF בלבד');
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
  const relationType = document.querySelector('input[name="noteRelationType"]:checked')?.value;
  const relatedId = window.DataCollectionService.getValue('noteRelatedObjectSelect', 'int');
  const attachment = document.getElementById('noteAttachment').files[0];

  // ולידציה מקיפה
  if (!validateNoteForm(content, relationType, relatedId, attachment)) {
    return;
  }

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

    const result = await response.json();

      // ניקוי מטמון notes
      if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
        await window.UnifiedCacheManager.remove('notes');
        console.log('✅ מטמון notes נוקה אחרי שמירה');
      }

    if (response.ok && result.status === 'success') {
      window.showSuccessNotification('הצלחה', 'הערה נשמרה בהצלחה!');

      // סגירת המודל וטעינה מחדש
      const modal = bootstrap.Modal.getInstance(addNoteModalElement);
      modal.hide();
      loadNotesData();
    } else {

      // טיפול בשגיאות וולידציה מהשרת
      if (result.error && result.error.message) {
        const serverMessage = result.error.message;

        // אם זו שגיאת וולידציה, נפרק אותה להודעות ספציפיות
        if (serverMessage.includes('validation failed')) {
          const validationErrors = serverMessage.replace('Note validation failed: ', '').split('; ');

          // הצגת כל שגיאה בנפרד
          validationErrors.forEach(error => {
            let fieldError = error;
            let fieldName = '';

            // תרגום שגיאות ספציפיות
            if (error.includes('Field \'content\' is required')) {
              fieldError = 'תוכן הערה הוא שדה חובה';
              fieldName = 'contentError';
            } else if (error.includes('Field \'related_type_id\' is required')) {
              fieldError = 'יש לבחור סוג אובייקט לשיוך';
              fieldName = 'relationTypeError';
            } else if (error.includes('Field \'related_id\' is required')) {
              fieldError = 'יש לבחור אובייקט לשיוך';
              fieldName = 'relatedObjectError';
            } else if (error.includes('Field \'related_id\' references non-existent record')) {
              fieldError = 'האובייקט שנבחר לא קיים במערכת';
              fieldName = 'relatedObjectError';
            }

            // שימוש במערכת ההתראות המובנת
            if (fieldName && window.showValidationWarning) {
              window.showValidationWarning(fieldName, fieldError);
            } else {
              window.showErrorNotification('שגיאת וולידציה', fieldError);
            }
          });
        } else {
          // שגיאה כללית
          window.showErrorNotification('שגיאה בשמירה', serverMessage);
        }
      } else {
        // הצגת הודעת שגיאה כללית
        window.showErrorNotification('שגיאה בשמירה', 'שגיאה בשמירת הערה - בדוק את הנתונים שהוזנו');
      }
    }

  } catch {
    window.showErrorNotification('שגיאה בשמירה', 'שגיאה בשמירת הערה - בדוק את הנתונים שהוזנו');
  }
}

async function updateNoteFromModal() {
  // איסוף נתונים מהטופס
  const noteId = document.getElementById('editNoteId').value;
  const content = getEditorContent('edit');
  const relationType = document.querySelector('input[name="editNoteRelationType"]:checked')?.value;
  const relatedId = editNoteRelatedObjectSelect.value;
  const attachment = document.getElementById('editNoteAttachment').files[0];

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

    const result = await response.json();

    if (response.ok && result.status === 'success') {
      window.showSuccessNotification('הצלחה', 'הערה עודכנה בהצלחה!');

      // ניקוי דגלים
      window.removeAttachmentFlag = false;
      window.replaceAttachmentFlag = false;

      // סגירת המודל וטעינה מחדש
      const modal = bootstrap.Modal.getInstance(editNoteModalElement);
      modal.hide();
      loadNotesData();
    } else {

      // טיפול בשגיאות וולידציה מהשרת
      if (result.error && result.error.message) {
        const serverMessage = result.error.message;

        // אם זו שגיאת וולידציה, נפרק אותה להודעות ספציפיות
        if (serverMessage.includes('validation failed')) {
          const validationErrors = serverMessage.replace('Note validation failed: ', '').split('; ');

          // הצגת כל שגיאה בנפרד
          validationErrors.forEach(error => {
            let fieldError = error;
            let fieldName = '';

            // תרגום שגיאות ספציפיות
            if (error.includes('Field \'content\' is required')) {
              fieldError = 'תוכן הערה הוא שדה חובה';
              fieldName = 'editContentError';
            } else if (error.includes('Field \'related_type_id\' is required')) {
              fieldError = 'יש לבחור סוג אובייקט לשיוך';
              fieldName = 'editRelationTypeError';
            } else if (error.includes('Field \'related_id\' is required')) {
              fieldError = 'יש לבחור אובייקט לשיוך';
              fieldName = 'editRelatedObjectError';
            } else if (error.includes('Field \'related_id\' references non-existent record')) {
              fieldError = 'האובייקט שנבחר לא קיים במערכת';
              fieldName = 'editRelatedObjectError';
            }

            // שימוש במערכת ההתראות המובנת
            if (fieldName && window.showValidationWarning) {
              window.showValidationWarning(fieldName, fieldError);
            } else {
              window.showErrorNotification('שגיאת וולידציה', fieldError);
            }
          });
        } else {
          // שגיאה כללית
          window.showErrorNotification('שגיאה בעדכון', serverMessage);
        }
      } else {
        // הצגת הודעת שגיאה כללית
        window.showErrorNotification('שגיאה בעדכון', 'שגיאה בעדכון הערה - בדוק את הנתונים שהוזנו');
      }
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
  const maxRetries = 3;
  let retryCount = 0;

        // ניקוי מטמון notes
        if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
          await window.UnifiedCacheManager.remove('notes');
          console.log('✅ מטמון notes נוקה אחרי מחיקה');
        }

  while (retryCount < maxRetries) {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        window.showSuccessNotification('הצלחה', 'הערה נמחקה בהצלחה!');
        loadNotesData();
        return; // יציאה מוצלחת
      } else {

        // טיפול בשגיאות מהשרת
        if (result.error && result.error.message) {
          const serverMessage = result.error.message;

          if (serverMessage.includes('has linked items')) {
            window.showErrorNotification('שגיאה במחיקה', 'לא ניתן למחוק הערה זו - יש פריטים מקושרים אליה');
          } else {
            window.showErrorNotification('שגיאה במחיקה', serverMessage);
          }
        } else {
          window.showErrorNotification('שגיאה במחיקה', 'שגיאה במחיקת הערה - בדוק את הנתונים');
        }
        return; // יציאה עם שגיאה
      }

    } catch {
      retryCount++;

      if (retryCount >= maxRetries) {
        // ניסיונות נגמרו - הצגת שגיאה
        window.showErrorNotification('שגיאה', `שגיאה במחיקת הערה לאחר ${maxRetries} ניסיונות. בדוק את חיבור השרת.`);
      } else {
        // המתנה לפני ניסיון נוסף
        const currentRetryCount = retryCount;
        await new Promise(resolve => setTimeout(resolve, 1000 * currentRetryCount));
      }
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

// Second DOMContentLoaded removed - merged into initializeNotesPage
window.initializeNotesPage = function() {
    console.log('📝 Initializing Notes Page...');
    
    // אתחול modals
    if (typeof window.initializeNotesModals === 'function') {
        window.initializeNotesModals();
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
    
    console.log('✅ Notes page initialized successfully');
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

  // בדיקה אם העורך ריק או מכיל רק תגיות HTML ריקות
  const content = editor.innerHTML;
  const textContent = editor.textContent || editor.innerText || '';

  // אם אין תוכן טקסט, החזר מחרוזת ריקה
  if (!textContent.trim()) {
    return '';
  }

  return content;
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

  editor.innerHTML = content || '';
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
           class="btn btn-sm btn-outline-primary" 
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

// Note CRUD functions
function openNoteDetails() {
    if (typeof window.openNoteDetails === 'function') {
        window.openNoteDetails();
    } else {
        console.warn('openNoteDetails function not found');
    }
}

function editNote(id) {
    if (typeof window.editNote === 'function') {
        window.editNote(id);
    } else {
        console.warn('editNote function not found');
    }
}

function deleteNote(id) {
    if (typeof window.deleteNote === 'function') {
        window.deleteNote(id);
    } else {
        console.warn('deleteNote function not found');
    }
}

// Filter functions
function filterNotesByRelatedObjectType(type) {
    if (typeof window.filterNotesByRelatedObjectType === 'function') {
        window.filterNotesByRelatedObjectType(type);
    } else {
        console.warn('filterNotesByRelatedObjectType function not found');
    }
}

// Text formatting functions
function formatText(format) {
    if (typeof window.formatText === 'function') {
        window.formatText(format);
    } else {
        console.warn('formatText function not found');
    }
}

// Data loading functions - removed duplicate loadNotesData function that was causing infinite loop

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
window.filterNotesByRelatedObjectType = filterNotesByRelatedObjectType;
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


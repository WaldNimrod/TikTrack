/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 40
 * 
 * PAGE INITIALIZATION (1)
 * - setupNoteValidationEvents() - setupNoteValidationEvents function
 * 
 * DATA LOADING (5)
 * - downloadFile() - downloadFile function
 * - getEditorContent() - * ניקוי עיצוב בעורך
 * - getTypeDisplayName() - getTypeDisplayName function
 * - loadNoteForViewing() - * View a note
 * - getNoteRelatedDisplay() - getNoteRelatedDisplay function
 * 
 * DATA MANIPULATION (11)
 * - deleteNote() - * Open note details modal
 * - updateNotesTable() - updateNotesTable function
 * - updateNotesSummary() - updateNotesSummary function
 * - updateGridFromComponent() - updateGridFromComponent function
 * - updateRadioButtons() - updateRadioButtons function
 * - saveNote() - saveNote function
 * - updateNoteFromModal() - updateNoteFromModal function
 * - confirmDeleteNote() - confirmDeleteNote function
 * - deleteNoteFromServer() - deleteNoteFromServer function
 * - removeCurrentAttachment() - removeCurrentAttachment function
 * - showAddNoteModal() - * Replace current attachment
 * 
 * EVENT HANDLING (3)
 * - onNoteRelationTypeChange() - onNoteRelationTypeChange function
 * - clearNoteValidationErrors() - clearNoteValidationErrors function
 * - setEditorContent() - * קבלת תוכן מעורך הטקסט
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
 * - filterNotesByType() - * Filter notes data by search term
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

if (!window.notesData) {
  window.notesData = [];
}

// Pagination instance variable
let notesPaginationInstance = null;

/**
 * Load additional data needed for rendering notes table (accounts, trades, tradePlans, tickers)
 * @returns {Promise<Object>} Object with accounts, trades, tradePlans, tickers arrays
 */
async function loadAdditionalNotesData() {
    // טעינת נתונים נוספים לצורך הצגת אובייקטים מקושרים
    let accounts = [];
    let trades = [];
    let tradePlans = [];
    let tickers = [];

    // פונקציה לטעינת נתונים נוספים באמצעות שירותי ישויות כלליים כשאפשר
    const loadAdditionalData = async () => {
      try {
        window.Logger.info('📡 טוען נתונים נוספים עבור הערות (שירותי ישויות)...', { page: "notes" });

        const loadAccounts = async () => {
          if (typeof window.getAccounts === 'function') {
            return await window.getAccounts();
          }
          const response = await fetch('/api/trading-accounts/');
          if (!response.ok) { return []; }
          const payload = await response.json();
          return Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
        };

        const loadTrades = async () => {
          // כרגע אין שירות טריידים כללי – שימוש ב-API ישיר
          const response = await fetch('/api/trades/');
          if (!response.ok) { return []; }
          const payload = await response.json();
          return Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
        };

        const loadTradePlans = async () => {
          try {
            // בדיקה אם TradePlansData זמין לפני שימוש ב-service
            // אם לא זמין, נדלג על השימוש ב-service ונעבור ישירות ל-API
            if (window.TradePlansData && typeof window.TradePlansData.loadTradePlansData === 'function') {
              if (window.tradePlanService && typeof window.tradePlanService.loadTradePlansData === 'function') {
                const data = await window.tradePlanService.loadTradePlansData();
                return Array.isArray(data) ? data : [];
              }
              if (typeof window.loadTradePlansData === 'function') {
                const data = await window.loadTradePlansData();
                return Array.isArray(data) ? data : [];
              }
            }
            // אם TradePlansData לא זמין, נשתמש ב-API ישיר
            const response = await fetch('/api/trade-plans/');
            if (!response.ok) { return []; }
            const payload = await response.json();
            return Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
          } catch (error) {
            // אם יש שגיאה, נחזיר מערך ריק במקום לזרוק שגיאה
            window.Logger?.warn('⚠️ שגיאה בטעינת תוכניות מסחר, מחזיר מערך ריק', { error: error.message }, { page: 'notes' });
            return [];
          }
        };

        const loadTickers = async () => {
          if (window.tickerService && typeof window.tickerService.getTickers === 'function') {
            const data = await window.tickerService.getTickers();
            return Array.isArray(data) ? data : [];
          }
          if (typeof window.getTickers === 'function') {
            const data = await window.getTickers();
            return Array.isArray(data) ? data : [];
          }
          const response = await fetch('/api/tickers/');
          if (!response.ok) { return []; }
          const payload = await response.json();
          return Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
        };

        const [accountsData, tradesData, tradePlansData, tickersData] = await Promise.all([
          loadAccounts(),
          loadTrades(),
          loadTradePlans(),
          loadTickers()
        ]);

        accounts = accountsData.filter(item => !Array.isArray(item) && typeof item === 'object' && item !== null);
        trades = tradesData.filter(item => !Array.isArray(item) && typeof item === 'object' && item !== null);
        tradePlans = tradePlansData.filter(item => !Array.isArray(item) && typeof item === 'object' && item !== null);
        tickers = tickersData.filter(item => !Array.isArray(item) && typeof item === 'object' && item !== null);
        
        window.Logger.info('✅ נתונים נוספים נטענו (שירותי ישויות):', {
          accounts: accounts.length,
          trades: trades.length,
          tradePlans: tradePlans.length,
          tickers: tickers.length
        }, { page: "notes" });
      } catch (error) {
        window.Logger.error('❌ שגיאה בטעינת נתונים נוספים (שירותי ישויות):', error, { page: "notes" });
        // המשך עם מערכים ריקים
        accounts = [];
        trades = [];
        tradePlans = [];
        tickers = [];
      }
    };

    // טעינת נתונים
    await loadAdditionalData();
    
    return { accounts, trades, tradePlans, tickers };
}

// ייצוא מוקדם של הפונקציה למניעת שגיאות
window.loadNotesData = window.loadNotesData || function() {
  // loadNotesData not yet defined, using placeholder
  window.Logger.info('⚠️ loadNotesData placeholder called', { page: "notes" });
};

// הגדרת הפונקציה המלאה מיד אחרי ה-placeholder
window.loadNotesData = async function(options = {}) {
  const loadOptions = {
    force: Boolean(options.force),
    ttl: options.ttl ?? window.NotesData?.TTL,
    signal: options.signal,
    queryParams: options.queryParams,
  };

  const fallbackLoader = async () => {
    const response = await fetch(`/api/notes/?_t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      signal: loadOptions.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const payload = await response.json();
    return Array.isArray(payload?.data) ? payload.data : payload;
  };

  try {
    const beforeCount = Array.isArray(window.notesData) ? window.notesData.length : 0;
    window.Logger.info('Loading notes data', {
      page: 'notes',
      force: loadOptions.force,
      beforeCount,
    });

    const useService = typeof window.NotesData?.loadNotesData === 'function';
    const data = useService
      ? await window.NotesData.loadNotesData(loadOptions)
      : await fallbackLoader();

    const normalizedNotes = Array.isArray(data)
      ? data.map(note => ({
          ...note,
          updated_at: note?.updated_at || note?.modified_at || note?.created_at || null
        }))
      : [];

    window.notesData = normalizedNotes;

    // סמן שאנחנו בתהליך עדכון כדי למנוע קריאות כפולות
    window._notesUpdateInProgress = true;
    
    try {
      if (typeof window.updateNotesTable === 'function') {
        await window.updateNotesTable(normalizedNotes);
      } else {
        window.Logger.warn('⚠️ updateNotesTable לא זמין', { page: 'notes' });
      }

      if (typeof window.updateNotesSummary === 'function') {
        window.updateNotesSummary(normalizedNotes);
      } else {
        window.Logger.warn('⚠️ updateNotesSummary לא זמין', { page: 'notes' });
      }
    } finally {
      // הסר את הסמן אחרי שהעדכון הושלם
      window._notesUpdateInProgress = false;
    }

    // עדכון ספירת רשומות - משתמש בפונקציה הגנרית לקבלת סך כל הרשומות
    if (window.updateTableCount) {
      window.updateTableCount('notesCount', 'notes', 'הערות', normalizedNotes.length);
    } else {
      // Fallback
      const countElement = document.getElementById('notesCount');
      if (countElement) {
        countElement.textContent = `${normalizedNotes.length} הערות`;
      }
    }

    if (typeof window.registerNotesTables === 'function') {
      window.registerNotesTables();
    }

    await restorePageState('notes');

    window.Logger.info(`✅ Loaded ${normalizedNotes.length} notes`, {
      page: 'notes',
      beforeCount,
      afterCount: normalizedNotes.length,
    });

    return normalizedNotes;
  } catch (error) {
    window.Logger.error('❌ loadNotesData: Error', error, { page: 'notes' });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בטעינת נתוני הערות', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בטעינת נתוני הערות', 'error');
    }
    throw error;
  }
};

// REMOVED: addNote - deprecated wrapper, use showAddNoteModal() directly

// REMOVED: uploadFile - unused function

/**
 * Download file attached to note
 * @param {number|string} noteId - Note ID
 * @param {string} fileName - File name to download
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

// REMOVED: viewLinkedItems - use window.viewLinkedItems(noteId, 'note') or window.viewLinkedItemsForNote(noteId) from linked-items.js instead
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
 * Open add note modal (not view details)
 * 
 * NOTE: This function opens the ADD note modal, not the view details modal.
 * For viewing note details, use viewNote(noteId) which uses showEntityDetails().
 * 
 * @param {number} _id - Not used (kept for backward compatibility)
 */
function openNoteDetails(_id) {
  try {
    // Use ModalManagerV2 directly to open ADD modal
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
      window.ModalManagerV2.showModal('notesModal', 'add');
    } else {
      window.Logger?.error('ModalManagerV2 לא זמין', { page: "notes" });
    }
  } catch (error) {
    window.Logger.error('שגיאה בפתיחת מודל הוספת הערה:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בפתיחת מודל הוספת הערה', error.message);
    }
  }
}

/**
 * Edit note
 * @function editNote
 * @param {string|number} _id - Note ID (must be numeric)
 * @returns {void}
 */
function editNote(_id) {
  // Ensure ID is a valid number
  const noteId = parseInt(_id);
  if (!noteId || isNaN(noteId)) {
    window.Logger?.error('⚠️ Invalid note ID for edit', { _id, noteId, page: "notes" });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'מספר זיהוי הערה לא תקין');
    }
    return;
  }
  
  // Use ModalManagerV2 directly
  if (window.ModalManagerV2 && typeof window.ModalManagerV2.showEditModal === 'function') {
    window.Logger?.debug('🔍 Opening edit modal for note', { noteId, page: 'notes' });
    window.ModalManagerV2.showEditModal('notesModal', 'note', noteId);
  } else {
    window.Logger?.error('ModalManagerV2 לא זמין', { page: "notes" });
  }
}

/**
 * Delete note
 * @function deleteNote
 * @param {string} id - Note ID
 * @returns {void}
 */
async function deleteNote(id) {
  try {
    // בדיקת פריטים מקושרים לפני חלון האישור
    if (typeof window.checkLinkedItemsBeforeAction === 'function') {
      const hasLinkedItems = await window.checkLinkedItemsBeforeAction('note', id, 'delete');
      if (hasLinkedItems) {
        // יש פריטים מקושרים - המודול כבר הוצג, לא נציג חלון אישור
        return;
      }
    }
    
    // אין פריטים מקושרים - המשך עם חלון האישור
    // Get note details for confirmation message
    let noteDetails = `הערה #${id}`;
    const note = window.notesData?.find(n => n.id === id || n.id === parseInt(id));
    
    if (note) {
      // Build detailed note info
      const relatedDisplay = getNoteRelatedDisplay(note);
      const contentPreview = note.content ? 
        note.content.replace(/<[^>]*>/g, '').substring(0, 100) + (note.content.length > 100 ? '...' : '') :
        'ללא תוכן';
      const createdEnvelope = window.dateUtils?.ensureDateEnvelope
        ? window.dateUtils.ensureDateEnvelope(note.created_at)
        : note.created_at;
      const date = createdEnvelope
        ? (window.dateUtils?.formatDate
            ? window.dateUtils.formatDate(createdEnvelope, { includeTime: false })
            : window.FieldRendererService?.renderDate
              ? window.FieldRendererService.renderDate(createdEnvelope)
              : (function fallbackDateDisplay(value) {
                  try {
                    // Use dateUtils for consistent date parsing
                    let parsed;
                    if (window.dateUtils && typeof window.dateUtils.ensureDateEnvelope === 'function') {
                      const envelope = window.dateUtils.ensureDateEnvelope(value);
                      if (envelope && envelope.epochMs) {
                        parsed = new Date(envelope.epochMs);
                      } else {
                        parsed = new Date(value?.utc || value?.local || value);
                      }
                    } else if (value && typeof value === 'object' && typeof value.epochMs === 'number') {
                      parsed = new Date(value.epochMs);
                    } else {
                      parsed = new Date(value?.utc || value?.local || value);
                    }
                    
                    if (!Number.isNaN(parsed.getTime())) {
                      // Use FieldRendererService or dateUtils for formatting
                      if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                        return window.FieldRendererService.renderDate(parsed, false);
                      }
                      if (window.formatDate) {
                        return window.formatDate(parsed);
                      }
                      if (window.dateUtils?.formatDate) {
                        return window.dateUtils.formatDate(parsed, { includeTime: false });
                      }
                      // Last resort: use toLocaleDateString
                      return parsed.toLocaleDateString('he-IL');
                    }
                  } catch (err) {
                    window.Logger?.warn('⚠️ fallbackDateDisplay failed', { err, value }, { page: 'notes' });
                  }
                  return 'לא מוגדר';
                })(createdEnvelope))
        : 'לא מוגדר';
      const attachment = note.attachment ? `📎 ${note.attachment}` : 'ללא קובץ מצורף';
      
      noteDetails = `${relatedDisplay} - תוכן: ${contentPreview}, תאריך: ${date}, ${attachment}`;
    }
    
    // Show delete warning with detailed information
    if (window.showDeleteWarning) {
      window.showDeleteWarning('note', noteDetails, 'הערה',
        async () => await confirmDeleteNote(id),
        () => {}
      );
    } else {
      // Fallback to simple confirm
      if (!confirm('האם אתה בטוח שברצונך למחוק את ההערה?')) {
        return;
      }
      confirmDeleteNote(id);
    }
    
  } catch (error) {
    window.Logger.error('שגיאה במחיקת הערה:', error, { page: 'notes' });
    CRUDResponseHandler.handleError(error, 'מחיקת הערה');
  }
}

// פונקציות לפתיחה/סגירה של סקשנים

// toggleSection function removed - use toggleSection('main') instead

// פונקציה לשחזור מצב הסגירה
/**
 * Restore the state of notes sections
 * REMOVED: This function has been removed. Section state restoration is now handled by:
 * - PageStateManager.loadPageState() - loads saved section states
 * - restoreAllSectionStates() - restores all sections using PageStateManager
 * 
 * This function used localStorage directly, which is now replaced by PageStateManager.
 * The restorePageState() function (line 2539) now handles section restoration via PageStateManager.
 */

// פונקציות נוספות

// הגדרת הפונקציות כגלובליות
window.openNoteDetails = openNoteDetails;
window.editNote = editNote;
window.deleteNote = deleteNote;
// window.toggleSection removed - using global version from ui-utils.js
// toggleSection export removed - use toggleSection('main') instead
// REMOVED: window.restoreNotesSectionState - use PageStateManager + restoreAllSectionStates() instead

// פונקציה לטעינת נתונים
// הפונקציה loadNotesData מוגדרת כבר בשורה 99 כ-window.loadNotesData
// הפונקציה הכפולה הזו הוסרה - משתמשים רק ב-window.loadNotesData שקורא ל-updateNotesTable(notes) בלבד

/**
 * Update notes table display
 * @function updateNotesTable
 * @param {Array} notes - Notes array
 * @param {Array} accounts - Accounts array
 * @param {Array} trades - Trades array
 * @param {Array} tradePlans - Trade plans array
 * @param {Array} tickers - Tickers array
 * @returns {Promise<void>}
 */
async function updateNotesTable(notes, options = {}) {
  try {
    const { skipPagination = false } = options;
    window.Logger.info('🟢🟢🟢 updateNotesTable נקראה (פונקציה רגילה) עם', notes ? notes.length : 0, 'הערות', { page: "notes" });
    window.Logger.info('🔍🔍🔵 Stack trace:', new Error().stack, { page: "notes" });
    
    const tbody = document.querySelector('#notesTable tbody');
    if (!tbody) {
      window.Logger.warn('⚠️ לא נמצא tbody בטבלה', { page: "notes" });
      // No notes table found on this page - skipping table update
      return;
    }

    const safeNotes = Array.isArray(notes) ? notes : [];

    // Check if we should use pagination
    if (!skipPagination && typeof window.updateTableWithPagination === 'function') {
      try {
        // Load additional data first (needed for rendering)
        const additionalData = await loadAdditionalNotesData();
        
        window.notesPaginationInstance = await window.updateTableWithPagination({
          tableId: 'notesTable',
          tableType: 'notes',
          data: safeNotes,
          render: async (pageData, context) => {
            // Render with additional data - כמו ב-cash_flows: יוצרים row וממלאים עם innerHTML
            tbody.textContent = '';
            pageData.forEach(note => {
              const row = document.createElement('tr');
              row.className = 'table-cell-clickable';
              
              // קביעת האובייקט המקושר
              // קביעת האובייקט המקושר - כמו במודול מקושרים: שימוש ב-FieldRendererService עם renderMode: 'linked-items-table'
              let relatedCellHtml = '-';
              if (note.related_type_id && note.related_id && window.FieldRendererService && typeof window.FieldRendererService.renderLinkedEntity === 'function') {
                try {
                  let displayName = '';
                  let metaForEntity = { renderMode: 'notes-table' }; // כמו בגרסה הקודמת - מציג שדות לפי סוג ישות
                  const relatedType = parseInt(note.related_type_id, 10);
                  
                  switch (relatedType) {
                    case 1: { // Trading Account
                      const account = additionalData.accounts?.find(a => a && a.id === note.related_id);
                      const accountName = account?.name || account?.account_name || `חשבון מסחר ${note.related_id}`;
                      displayName = accountName;
                      metaForEntity = {
                        renderMode: 'notes-table',
                        name: accountName,
                        status: account?.status || '',
                        currency: account?.currency_symbol || account?.currency || ''
                      };
                      break;
                    }
                    case 2: { // Trade
                      const trade = additionalData.trades?.find(t => t && t.id === note.related_id);
                      const tradeTicker = trade?.ticker_symbol || trade?.ticker?.symbol || (() => {
                        if (trade?.ticker_id) {
                          const ticker = additionalData.tickers?.find(tk => tk && tk.id === trade.ticker_id);
                          return ticker?.symbol;
                        }
                        return null;
                      })();
                      const tickerSymbol = tradeTicker || null; // רק סימבול, לא מזהה
                      const tradeDateEnvelope = window.dateUtils?.ensureDateEnvelope
                        ? window.dateUtils.ensureDateEnvelope(
                            trade?.created_at_envelope ||
                            trade?.createdAtEnvelope ||
                            trade?.created_at ||
                            trade?.opened_at ||
                            trade?.date ||
                            null
                          )
                        : (
                            trade?.created_at_envelope ||
                            trade?.createdAtEnvelope ||
                            trade?.created_at ||
                            trade?.opened_at ||
                            trade?.date ||
                            null
                          );
                      // displayName צריך להיות הסימבול, לא מזהה
                      displayName = tickerSymbol || `טרייד ${note.related_id}`;
                      metaForEntity = {
                        renderMode: 'notes-table',
                        ticker: tickerSymbol, // רק סימבול
                        date: tradeDateEnvelope,
                        date_envelope: tradeDateEnvelope,
                        status: trade?.status || '',
                        side: trade?.side || '',
                        investment_type: trade?.investment_type || ''
                      };
                      break;
                    }
                    case 3: { // Trade Plan
                      const plan = additionalData.tradePlans?.find(p => p && p.id === note.related_id);
                      const planTicker = plan?.ticker?.symbol || plan?.ticker_symbol || (() => {
                        if (plan?.ticker_id) {
                          const ticker = additionalData.tickers?.find(tk => tk && tk.id === plan.ticker_id);
                          return ticker?.symbol;
                        }
                        return null;
                      })();
                      const tickerSymbol = planTicker || null; // רק סימבול, לא מזהה
                      const planDateEnvelope = window.dateUtils?.ensureDateEnvelope
                        ? window.dateUtils.ensureDateEnvelope(
                            plan?.created_at_envelope ||
                            plan?.createdAtEnvelope ||
                            plan?.created_at ||
                            plan?.date ||
                            null
                          )
                        : (
                            plan?.created_at_envelope ||
                            plan?.createdAtEnvelope ||
                            plan?.created_at ||
                            plan?.date ||
                            null
                          );
                      // displayName צריך להיות הסימבול, לא מזהה
                      displayName = tickerSymbol || `תוכנית ${note.related_id}`;
                      metaForEntity = {
                        renderMode: 'notes-table',
                        ticker: tickerSymbol, // רק סימבול
                        date: planDateEnvelope,
                        date_envelope: planDateEnvelope,
                        status: plan?.status || '',
                        side: plan?.side || '',
                        investment_type: plan?.investment_type || '',
                        planned_amount: plan?.planned_amount || plan?.plannedAmount || null
                      };
                      break;
                    }
                    case 4: { // Ticker
                      const ticker = additionalData.tickers?.find(tk => tk && tk.id === note.related_id);
                      const tickerSymbol = ticker?.symbol || null; // רק סימבול, לא מזהה
                      // displayName צריך להיות הסימבול, לא מזהה
                      displayName = tickerSymbol || `טיקר ${note.related_id}`;
                      metaForEntity = {
                        renderMode: 'notes-table',
                        ticker: tickerSymbol, // רק סימבול
                        status: ticker?.status || ''
                      };
                      break;
                    }
                    default: {
                      displayName = `אובייקט ${note.related_id}`;
                      metaForEntity = { renderMode: 'notes-table' };
                    }
                  }
                  
                  relatedCellHtml = window.FieldRendererService.renderLinkedEntity(
                    note.related_type_id,
                    note.related_id,
                    displayName,
                    metaForEntity
                  );
                } catch (error) {
                  window.Logger?.warn('⚠️ renderLinkedEntity failed for note row, falling back to dash', { error, noteId: note?.id }, { page: "notes" });
                  relatedCellHtml = '-';
                }
              }
              
              // תוכן
              const noteContent = note.content || '';
              const contentDisplay = (() => {
                if (!noteContent || (typeof noteContent === 'string' && !noteContent.trim())) {
                  return 'ללא תוכן';
                }
                if (window.FieldRendererService && typeof window.FieldRendererService.renderTextPreview === 'function') {
                  try {
                    return window.FieldRendererService.renderTextPreview(noteContent, { maxLength: 20, emptyPlaceholder: 'ללא תוכן' });
                  } catch (error) {
                    window.Logger?.warn('⚠️ Error rendering text preview', { error, noteId: note?.id, page: 'notes' });
                  }
                }
                const fallbackPlain = String(noteContent).replace(/<[^>]*>/g, '').trim();
                if (!fallbackPlain) {
                  return 'ללא תוכן';
                }
                const truncated = fallbackPlain.length > 20 ? `${fallbackPlain.substring(0, 20).trimEnd()}…` : fallbackPlain;
                const escape = (text) => String(text)
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#39;');
                return `<span class="text-truncate-preview" title="${escape(fallbackPlain)}">${escape(truncated)}</span>`;
              })();
              
              // קובץ מצורף
              let attachmentDisplay = '-';
              const noteAttachment = note.attachment || null;
              if (noteAttachment && noteAttachment !== null && noteAttachment !== '' && typeof noteAttachment === 'string' && noteAttachment.trim() && noteAttachment !== 'null' && noteAttachment !== 'undefined') {
                try {
                  const fileExtension = noteAttachment.split('.').pop()?.toLowerCase();
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
                  const shortName = noteAttachment.length > 10 ? noteAttachment.substring(0, 10) + '...' : noteAttachment;
                  attachmentDisplay = `${fileIcon} ${shortName}`;
                } catch (error) {
                  attachmentDisplay = '-';
                }
              }
              
              // תאריך יצירה
              const createdEnvelope = window.dateUtils?.ensureDateEnvelope
                ? window.dateUtils.ensureDateEnvelope(note.created_at)
                : note.created_at;
              const dateDisplay = window.FieldRendererService?.renderDate
                ? window.FieldRendererService.renderDate(createdEnvelope || note.created_at)
                : window.dateUtils?.formatDate
                  ? window.dateUtils.formatDate(createdEnvelope || note.created_at, { includeTime: false })
                  : (() => {
                      try {
                        const dateValue = createdEnvelope?.utc || createdEnvelope?.local || note.created_at;
                        if (window.dateUtils && typeof window.dateUtils.ensureDateEnvelope === 'function') {
                          const envelope = window.dateUtils.ensureDateEnvelope(dateValue);
                          if (envelope && envelope.epochMs) {
                            const parsed = new Date(envelope.epochMs);
                            if (!Number.isNaN(parsed.getTime())) {
                              if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                                return window.FieldRendererService.renderDate(parsed, false);
                              }
                              if (window.dateUtils?.formatDate) {
                                return window.dateUtils.formatDate(parsed, { includeTime: false });
                              }
                              return parsed.toLocaleDateString('he-IL');
                            }
                          }
                        }
                      } catch (error) {
                        window.Logger?.warn('⚠️ notes table date fallback failed', { error, noteId: note?.id }, { page: 'notes' });
                      }
                      return 'לא מוגדר';
                    })();
              const dateSortValue = window.dateUtils?.getEpochMilliseconds
                ? window.dateUtils.getEpochMilliseconds(createdEnvelope || note.created_at)
                : (createdEnvelope?.epochMs || createdEnvelope?.utc || createdEnvelope?.local || note.created_at || '');
              
              // תאריך עדכון
              const updatedDateCell = (() => {
                const rawDate = note.updated_at || note.created_at || null;
                if (!rawDate) {
                  return `<td class="col-updated"><span class="updated-value-empty">לא זמין</span></td>`;
                }
                let dateDisplay = '';
                let epoch = null;
                if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                  dateDisplay = window.FieldRendererService.renderDate(rawDate, true);
                  if (window.dateUtils && typeof window.dateUtils.getEpochMilliseconds === 'function') {
                    const envelope = window.dateUtils.ensureDateEnvelope ? window.dateUtils.ensureDateEnvelope(rawDate) : rawDate;
                    epoch = window.dateUtils.getEpochMilliseconds(envelope || rawDate);
                  } else if (rawDate instanceof Date) {
                    epoch = rawDate.getTime();
                  } else if (typeof rawDate === 'string') {
                    const parsed = Date.parse(rawDate);
                    epoch = Number.isNaN(parsed) ? null : parsed;
                  } else if (rawDate && typeof rawDate === 'object' && rawDate.epochMs) {
                    epoch = rawDate.epochMs;
                  }
                } else {
                  const envelope = window.dateUtils && typeof window.dateUtils.ensureDateEnvelope === 'function'
                    ? window.dateUtils.ensureDateEnvelope(rawDate)
                    : rawDate && typeof rawDate === 'object' && (rawDate.epochMs || rawDate.utc || rawDate.local)
                      ? rawDate
                      : null;
                  epoch = (() => {
                    if (window.dateUtils && typeof window.dateUtils.getEpochMilliseconds === 'function') {
                      return window.dateUtils.getEpochMilliseconds(envelope || rawDate);
                    }
                    if (typeof window.getEpochMilliseconds === 'function') {
                      return window.getEpochMilliseconds(envelope || rawDate);
                    }
                    if (envelope && typeof envelope.epochMs === 'number') {
                      return envelope.epochMs;
                    }
                    if (rawDate instanceof Date) {
                      return rawDate.getTime();
                    }
                    if (typeof rawDate === 'string') {
                      const parsed = Date.parse(rawDate);
                      return Number.isNaN(parsed) ? null : parsed;
                    }
                    return null;
                  })();
                  if (epoch === null || Number.isNaN(epoch)) {
                    return `<td class="col-updated"><span class="updated-value-empty">לא זמין</span></td>`;
                  }
                  if (window.dateUtils && typeof window.dateUtils.formatDateTime === 'function') {
                    dateDisplay = window.dateUtils.formatDateTime(envelope || rawDate);
                  } else if (window.dateUtils && typeof window.dateUtils.formatDate === 'function') {
                    dateDisplay = window.dateUtils.formatDate(envelope || rawDate, { includeTime: true });
                  } else {
                    try {
                      const dateObj = new Date(epoch);
                      dateDisplay = window.formatDate ? window.formatDate(dateObj, true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(dateObj, { includeTime: true }) : dateObj.toLocaleString('he-IL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }));
                    } catch (err) {
                      window.Logger?.warn('⚠️ notes updated-cell date formatting failed', { err, noteId: note?.id }, { page: 'notes' });
                      return `<td class="col-updated"><span class="updated-value-empty">לא זמין</span></td>`;
                    }
                  }
                }
                if (!dateDisplay || dateDisplay === '-') {
                  return `<td class="col-updated"><span class="updated-value-empty">לא זמין</span></td>`;
                }
                return `<td class="col-updated"${epoch ? ` data-epoch="${epoch}"` : ''} title="${dateDisplay}"><span class="updated-value" dir="ltr">${dateDisplay}</span></td>`;
              })();
              
              // Actions menu
              const actionsMenu = (() => {
                if (!window.createActionsMenu) return '<!-- Actions menu not available -->';
                const noteId = note?.id ? parseInt(note.id) : null;
                if (!noteId) {
                  return '<!-- Invalid note ID -->';
                }
                const result = window.createActionsMenu([
                  { type: 'VIEW', onclick: `window.showEntityDetails('note', ${noteId}, { mode: 'view' })`, title: 'צפה בפרטי הערה' },
                  { type: 'EDIT', onclick: `editNote(${noteId})`, title: 'ערוך הערה' },
                  { type: 'DELETE', onclick: `deleteNote(${noteId})`, title: 'מחק הערה' }
                ]);
                return result || '';
              })();
              
              // בניית השורה - כמו ב-cash_flows: createElement
              const rowHTML = `
                <td class="col-linked-object related-cell">${relatedCellHtml}</td>
                <td class="col-content">${contentDisplay}</td>
                <td class="col-attachment">${attachmentDisplay}</td>
                <td class="col-created" data-date='${dateSortValue}'>${dateDisplay}</td>
                ${updatedDateCell}
                <td class="col-actions actions-cell">${actionsMenu}</td>
              `;
              const parser = new DOMParser();
              const doc = parser.parseFromString(`<tr>${rowHTML}</tr>`, 'text/html');
              const tempRow = doc.body.querySelector('tr');
              if (tempRow) {
                Array.from(tempRow.children).forEach(cell => {
                  row.appendChild(cell.cloneNode(true));
                });
              }
              
              tbody.appendChild(row);
            });
            
            // Update buttons
            if (window.advancedButtonSystem && typeof window.advancedButtonSystem.processButtons === 'function') {
              window.advancedButtonSystem.processButtons(tbody);
            } else if (window.ButtonSystem && typeof window.ButtonSystem.initializeButtons === 'function') {
              window.ButtonSystem.initializeButtons();
            }
            
            if (window.setPageTableData) {
              window.setPageTableData('notes', pageData, {
                tableId: 'notesTable',
                pageInfo: context?.pageInfo,
              });
            }
          },
          onFilteredDataChange: ({ filteredData }) => {
            if (typeof window.updateNotesSummary === 'function') {
              window.updateNotesSummary(Array.isArray(filteredData) ? filteredData : []);
            }
          },
        });
        return;
      } catch (error) {
        window.Logger?.warn('updateNotesTable pagination fallback triggered', { error, page: 'notes' });
      }
    }

    // טעינת נתונים נוספים לצורך הצגת אובייקטים מקושרים
    const additionalData = await loadAdditionalNotesData();
    
    // בדיקה שהנתונים קיימים
    if (!safeNotes || safeNotes.length === 0) {
      const emptyMessage = `
        <tr>
          <td colspan="6" class="text-center text-muted">
          <div style="padding: 20px;">
            <h5>📝 אין הערות</h5>
            <p>לא נמצאו הערות במערכת</p>
            <button data-button-type="ADD" data-variant="full" data-icon="➕" data-text="הוסף הערה ראשונה" data-classes="btn-sm" data-onclick="openNoteDetails()" data-tooltip="הוסף הערה ראשונה למערכת" data-tooltip-placement="top" data-tooltip-trigger="hover"></button>
          </div>
        </td>
      </tr>
    `;
      tbody.textContent = '';
      const parser = new DOMParser();
      const doc = parser.parseFromString(emptyMessage, 'text/html');
      doc.body.childNodes.forEach(node => {
        tbody.appendChild(node.cloneNode(true));
      });
      
      // 🔘 עדכון כפתורים דינמיים
      if (window.ButtonSystem && typeof window.ButtonSystem.initializeButtons === 'function') {
        window.ButtonSystem.initializeButtons();
      }
      
      if (typeof window.updateNotesSummary === 'function' && !window._notesUpdateInProgress) {
        window.updateNotesSummary([]);
      }
      return;
    }

    // בניית שורות הטבלה - כמו ב-cash_flows: יוצרים row וממלאים עם innerHTML
    safeNotes.forEach(note => {
      const row = document.createElement('tr');
      row.className = 'table-cell-clickable';
      
      // קביעת האובייקט המקושר - כמו במודול מקושרים: שימוש ב-FieldRendererService עם renderMode: 'linked-items-table'
      let relatedCellHtml = '-';
      if (note.related_type_id && note.related_id && window.FieldRendererService && typeof window.FieldRendererService.renderLinkedEntity === 'function') {
        try {
          let displayName = '';
          let metaForEntity = { renderMode: 'linked-items-table' };
          const relatedType = parseInt(note.related_type_id, 10);
          
          switch (relatedType) {
            case 1: { // Trading Account
              const account = additionalData.accounts?.find(a => a && a.id === note.related_id);
              const accountName = account?.name || account?.account_name || `חשבון מסחר ${note.related_id}`;
              displayName = accountName;
              metaForEntity = {
                renderMode: 'linked-items-table',
                name: accountName,
                status: account?.status || '',
                currency: account?.currency_symbol || account?.currency || ''
              };
              break;
            }
            case 2: { // Trade
              const trade = additionalData.trades?.find(t => t && t.id === note.related_id);
              const tradeTicker = trade?.ticker_symbol || trade?.ticker?.symbol || (() => {
                if (trade?.ticker_id) {
                  const ticker = additionalData.tickers?.find(tk => tk && tk.id === trade.ticker_id);
                  return ticker?.symbol;
                }
                return null;
              })();
              const tickerSymbol = tradeTicker || `טרייד ${note.related_id}`;
              const tradeDateEnvelope = window.dateUtils?.ensureDateEnvelope
                ? window.dateUtils.ensureDateEnvelope(
                    trade?.created_at_envelope ||
                    trade?.createdAtEnvelope ||
                    trade?.created_at ||
                    trade?.opened_at ||
                    trade?.date ||
                    null
                  )
                : (
                    trade?.created_at_envelope ||
                    trade?.createdAtEnvelope ||
                    trade?.created_at ||
                    trade?.opened_at ||
                    trade?.date ||
                    null
                  );
              displayName = tickerSymbol;
              metaForEntity = {
                renderMode: 'linked-items-table',
                ticker: tickerSymbol,
                date: tradeDateEnvelope,
                date_envelope: tradeDateEnvelope,
                status: trade?.status || '',
                side: trade?.side || '',
                investment_type: trade?.investment_type || ''
              };
              break;
            }
            case 3: { // Trade Plan
              const plan = additionalData.tradePlans?.find(p => p && p.id === note.related_id);
              const planTicker = plan?.ticker?.symbol || plan?.ticker_symbol || (() => {
                if (plan?.ticker_id) {
                  const ticker = additionalData.tickers?.find(tk => tk && tk.id === plan.ticker_id);
                  return ticker?.symbol;
                }
                return null;
              })();
              const tickerSymbol = planTicker || `תוכנית ${note.related_id}`;
              const planDateEnvelope = window.dateUtils?.ensureDateEnvelope
                ? window.dateUtils.ensureDateEnvelope(
                    plan?.created_at_envelope ||
                    plan?.createdAtEnvelope ||
                    plan?.created_at ||
                    plan?.date ||
                    null
                  )
                : (
                    plan?.created_at_envelope ||
                    plan?.createdAtEnvelope ||
                    plan?.created_at ||
                    plan?.date ||
                    null
                  );
              displayName = tickerSymbol;
              metaForEntity = {
                renderMode: 'linked-items-table',
                ticker: tickerSymbol,
                date: planDateEnvelope,
                date_envelope: planDateEnvelope,
                status: plan?.status || '',
                side: plan?.side || '',
                investment_type: plan?.investment_type || '',
                planned_amount: plan?.planned_amount || plan?.plannedAmount || null
              };
              break;
            }
            case 4: { // Ticker
              const ticker = additionalData.tickers?.find(tk => tk && tk.id === note.related_id);
              const tickerSymbol = ticker?.symbol || `טיקר ${note.related_id}`;
              displayName = tickerSymbol;
              metaForEntity = {
                renderMode: 'linked-items-table',
                ticker: tickerSymbol,
                status: ticker?.status || ''
              };
              break;
            }
            default: {
              displayName = `אובייקט ${note.related_id}`;
              metaForEntity = { renderMode: 'linked-items-table' };
            }
          }
          
          relatedCellHtml = window.FieldRendererService.renderLinkedEntity(
            note.related_type_id,
            note.related_id,
            displayName,
            metaForEntity
          );
        } catch (error) {
          window.Logger?.warn('⚠️ renderLinkedEntity failed for note row, falling back to dash', { error, noteId: note?.id }, { page: "notes" });
          relatedCellHtml = '-';
        }
      }
      
      // הצגת תוכן HTML עם הגבלה ל-20 תווים
      const noteContent = note.content || '';
      const contentDisplay = (() => {
        if (!noteContent || (typeof noteContent === 'string' && !noteContent.trim())) {
          return 'ללא תוכן';
        }
        if (window.FieldRendererService && typeof window.FieldRendererService.renderTextPreview === 'function') {
          try {
            return window.FieldRendererService.renderTextPreview(noteContent, { maxLength: 20, emptyPlaceholder: 'ללא תוכן' });
          } catch (error) {
            window.Logger?.warn('⚠️ Error rendering text preview', { error, noteId: note?.id, page: 'notes' });
          }
        }
        const fallbackPlain = String(noteContent).replace(/<[^>]*>/g, '').trim();
        if (!fallbackPlain) {
          return 'ללא תוכן';
        }
        const truncated = fallbackPlain.length > 20 ? `${fallbackPlain.substring(0, 20).trimEnd()}…` : fallbackPlain;
        const escape = (text) => String(text)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
        return `<span class="text-truncate-preview" title="${escape(fallbackPlain)}">${escape(truncated)}</span>`;
      })();
      
      // הצגת קובץ עם אייקון
      let attachmentDisplay = '-';
      const noteAttachment = note.attachment || null;
      if (noteAttachment && noteAttachment !== null && noteAttachment !== '' && typeof noteAttachment === 'string' && noteAttachment.trim() && noteAttachment !== 'null' && noteAttachment !== 'undefined') {
        try {
          const fileExtension = noteAttachment.split('.').pop()?.toLowerCase();
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
          const shortName = noteAttachment.length > 10 ? noteAttachment.substring(0, 10) + '...' : noteAttachment;
          attachmentDisplay = `${fileIcon} ${shortName}`;
        } catch (error) {
          attachmentDisplay = '-';
        }
      }
      
      // תאריך יצירה
      const createdEnvelope = window.dateUtils?.ensureDateEnvelope
        ? window.dateUtils.ensureDateEnvelope(note.created_at)
        : note.created_at;
      const dateDisplay = window.FieldRendererService?.renderDate
        ? window.FieldRendererService.renderDate(createdEnvelope || note.created_at)
        : window.dateUtils?.formatDate
          ? window.dateUtils.formatDate(createdEnvelope || note.created_at, { includeTime: false })
          : (() => {
              try {
                const dateValue = createdEnvelope?.utc || createdEnvelope?.local || note.created_at;
                if (window.dateUtils && typeof window.dateUtils.ensureDateEnvelope === 'function') {
                  const envelope = window.dateUtils.ensureDateEnvelope(dateValue);
                  if (envelope && envelope.epochMs) {
                    const parsed = new Date(envelope.epochMs);
                    if (!Number.isNaN(parsed.getTime())) {
                      if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                        return window.FieldRendererService.renderDate(parsed, false);
                      }
                      if (window.dateUtils?.formatDate) {
                        return window.dateUtils.formatDate(parsed, { includeTime: false });
                      }
                      return parsed.toLocaleDateString('he-IL');
                    }
                  }
                }
              } catch (error) {
                window.Logger?.warn('⚠️ notes table date fallback failed', { error, noteId: note?.id }, { page: 'notes' });
              }
              return 'לא מוגדר';
            })();
      const dateSortValue = window.dateUtils?.getEpochMilliseconds
        ? window.dateUtils.getEpochMilliseconds(createdEnvelope || note.created_at)
        : (createdEnvelope?.epochMs || createdEnvelope?.utc || createdEnvelope?.local || note.created_at || '');
      
      // תאריך עדכון
      const updatedDateCell = (() => {
        const rawDate = note.updated_at || note.created_at || null;
        if (!rawDate) {
          return `<td class="col-updated"><span class="updated-value-empty">לא זמין</span></td>`;
        }
        let dateDisplay = '';
        let epoch = null;
        if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
          dateDisplay = window.FieldRendererService.renderDate(rawDate, true);
          if (window.dateUtils && typeof window.dateUtils.getEpochMilliseconds === 'function') {
            const envelope = window.dateUtils.ensureDateEnvelope ? window.dateUtils.ensureDateEnvelope(rawDate) : rawDate;
            epoch = window.dateUtils.getEpochMilliseconds(envelope || rawDate);
          } else if (rawDate instanceof Date) {
            epoch = rawDate.getTime();
          } else if (typeof rawDate === 'string') {
            const parsed = Date.parse(rawDate);
            epoch = Number.isNaN(parsed) ? null : parsed;
          } else if (rawDate && typeof rawDate === 'object' && rawDate.epochMs) {
            epoch = rawDate.epochMs;
          }
        } else {
          const envelope = window.dateUtils && typeof window.dateUtils.ensureDateEnvelope === 'function'
            ? window.dateUtils.ensureDateEnvelope(rawDate)
            : rawDate && typeof rawDate === 'object' && (rawDate.epochMs || rawDate.utc || rawDate.local)
              ? rawDate
              : null;
          epoch = (() => {
            if (window.dateUtils && typeof window.dateUtils.getEpochMilliseconds === 'function') {
              return window.dateUtils.getEpochMilliseconds(envelope || rawDate);
            }
            if (typeof window.getEpochMilliseconds === 'function') {
              return window.getEpochMilliseconds(envelope || rawDate);
            }
            if (envelope && typeof envelope.epochMs === 'number') {
              return envelope.epochMs;
            }
            if (rawDate instanceof Date) {
              return rawDate.getTime();
            }
            if (typeof rawDate === 'string') {
              const parsed = Date.parse(rawDate);
              return Number.isNaN(parsed) ? null : parsed;
            }
            return null;
          })();
          if (epoch === null || Number.isNaN(epoch)) {
            return `<td class="col-updated"><span class="updated-value-empty">לא זמין</span></td>`;
          }
          if (window.dateUtils && typeof window.dateUtils.formatDateTime === 'function') {
            dateDisplay = window.dateUtils.formatDateTime(envelope || rawDate);
          } else if (window.dateUtils && typeof window.dateUtils.formatDate === 'function') {
            dateDisplay = window.dateUtils.formatDate(envelope || rawDate, { includeTime: true });
          } else {
            try {
              const dateObj = new Date(epoch);
              dateDisplay = window.formatDate ? window.formatDate(dateObj, true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(dateObj, { includeTime: true }) : dateObj.toLocaleString('he-IL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }));
            } catch (err) {
              window.Logger?.warn('⚠️ notes updated-cell date formatting failed', { err, noteId: note?.id }, { page: 'notes' });
              return `<td class="col-updated"><span class="updated-value-empty">לא זמין</span></td>`;
            }
          }
        }
        if (!dateDisplay || dateDisplay === '-') {
          return `<td class="col-updated"><span class="updated-value-empty">לא זמין</span></td>`;
        }
        return `<td class="col-updated"${epoch ? ` data-epoch="${epoch}"` : ''} title="${dateDisplay}"><span class="updated-value" dir="ltr">${dateDisplay}</span></td>`;
      })();
      
      // Actions menu
      const actionsMenu = (() => {
        if (!window.createActionsMenu) return '<!-- Actions menu not available -->';
        const noteId = note?.id ? parseInt(note.id) : null;
        if (!noteId) {
          return '<!-- Invalid note ID -->';
        }
        const result = window.createActionsMenu([
          { type: 'VIEW', onclick: `window.showEntityDetails('note', ${noteId}, { mode: 'view' })`, title: 'צפה בפרטי הערה' },
          { type: 'EDIT', onclick: `editNote(${noteId})`, title: 'ערוך הערה' },
          { type: 'DELETE', onclick: `deleteNote(${noteId})`, title: 'מחק הערה' }
        ]);
        return result || '';
      })();
      
      // בניית השורה - כמו ב-cash_flows: row.innerHTML
      const rowHTML = `
        <td class="col-linked-object related-cell">${relatedCellHtml}</td>
        <td class="col-content">${contentDisplay}</td>
        <td class="col-attachment">${attachmentDisplay}</td>
        <td class="col-created" data-date='${dateSortValue}'>${dateDisplay}</td>
        ${updatedDateCell}
        <td class="col-actions actions-cell">${actionsMenu}</td>
      `;
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<tr>${rowHTML}</tr>`, 'text/html');
      const tempRow = doc.body.querySelector('tr');
      if (tempRow) {
        Array.from(tempRow.children).forEach(cell => {
          row.appendChild(cell.cloneNode(true));
        });
      }
      
      tbody.appendChild(row);
    });
    
    window.Logger.info('✅ טבלת הערות עודכנה בהצלחה עם', safeNotes.length, 'הערות', { page: "notes", keepInfo: true });
    
    // עדכון table-count ו-info-summary
    if (typeof window.updateNotesSummary === 'function' && !window._notesUpdateInProgress) {
      window.updateNotesSummary(safeNotes);
    }
    
    // 🔘 עדכון כפתורים דינמיים
    if (window.advancedButtonSystem && typeof window.advancedButtonSystem.processButtons === 'function') {
      window.advancedButtonSystem.processButtons(tbody);
    } else if (window.ButtonSystem && typeof window.ButtonSystem.initializeButtons === 'function') {
      window.ButtonSystem.initializeButtons();
    }
    
  } catch (error) {
    window.Logger.error('שגיאה בעדכון טבלת הערות:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון טבלת הערות', error.message);
    }
  }
}

/**
 * Render notes table rows
 * @param {Array} notes - Array of notes to render
 * @param {Object} additionalData - Object with accounts, trades, tradePlans, tickers arrays
 * @returns {string} HTML string of table rows
 */
function renderNotesTableRows(notes, additionalData = {}) {
    if (!notes || notes.length === 0) {
        return '';
    }
    
    const accounts = additionalData.accounts || [];
    const trades = additionalData.trades || [];
    const tradePlans = additionalData.tradePlans || [];
    const tickers = additionalData.tickers || [];
    
    return notes.map(note => {
        try {
        const createdEnvelope = window.dateUtils?.ensureDateEnvelope
          ? window.dateUtils.ensureDateEnvelope(note.created_at)
          : note.created_at;
        const dateDisplay = window.FieldRendererService?.renderDate
          ? window.FieldRendererService.renderDate(createdEnvelope || note.created_at)
          : window.dateUtils?.formatDate
            ? window.dateUtils.formatDate(createdEnvelope || note.created_at, { includeTime: false })
            : (() => {
                try {
                  // Use dateUtils for consistent date parsing
                  let parsed;
                  const dateValue = createdEnvelope?.utc || createdEnvelope?.local || note.created_at;
                  if (window.dateUtils && typeof window.dateUtils.ensureDateEnvelope === 'function') {
                    const envelope = window.dateUtils.ensureDateEnvelope(dateValue);
                    if (envelope && envelope.epochMs) {
                      parsed = new Date(envelope.epochMs);
                    } else {
                      parsed = new Date(dateValue);
                    }
                  } else if (dateValue && typeof dateValue === 'object' && typeof dateValue.epochMs === 'number') {
                    parsed = new Date(dateValue.epochMs);
                  } else {
                    parsed = new Date(dateValue);
                  }
                  
                  if (!Number.isNaN(parsed.getTime())) {
                    // Use FieldRendererService or dateUtils for formatting
                    if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                      return window.FieldRendererService.renderDate(parsed, false);
                    }
                    if (window.dateUtils?.formatDate) {
                      return window.dateUtils.formatDate(parsed, { includeTime: false });
                    }
                    // Last resort: use toLocaleDateString
                    return parsed.toLocaleDateString('he-IL');
                  }
                } catch (error) {
                  window.Logger?.warn('⚠️ notes table date fallback failed', { error, noteId: note?.id }, { page: 'notes' });
                }
                return 'לא מוגדר';
              })();
        const dateSortValue = window.dateUtils?.getEpochMilliseconds
          ? window.dateUtils.getEpochMilliseconds(createdEnvelope || note.created_at)
          : (createdEnvelope?.epochMs || createdEnvelope?.utc || createdEnvelope?.local || note.created_at || '');

        // הצגת תוכן HTML עם הגבלה ל-20 תווים
        // Debug: Check note content
        const noteContent = note.content || '';
        const noteAttachment = note.attachment || null;
        
        // Ensure content is processed correctly
        const contentDisplay = (() => {
          // Check if content exists and is not empty
          if (!noteContent || (typeof noteContent === 'string' && !noteContent.trim())) {
            window.Logger?.warn('⚠️ Note content is empty', { noteId: note?.id, content: noteContent, page: 'notes' });
            return 'ללא תוכן';
          }
          
          // Use FieldRendererService if available
          if (window.FieldRendererService && typeof window.FieldRendererService.renderTextPreview === 'function') {
            try {
              return window.FieldRendererService.renderTextPreview(noteContent, { maxLength: 20, emptyPlaceholder: 'ללא תוכן' });
            } catch (error) {
              window.Logger?.warn('⚠️ Error rendering text preview', { error, noteId: note?.id, page: 'notes' });
            }
          }
          
          // Fallback: strip HTML and truncate
          const fallbackPlain = String(noteContent).replace(/<[^>]*>/g, '').trim();
          if (!fallbackPlain) {
            return 'ללא תוכן';
          }
          const truncated = fallbackPlain.length > 20 ? `${fallbackPlain.substring(0, 20).trimEnd()}…` : fallbackPlain;
          const escape = (text) => String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
          return `<span class="text-truncate-preview" title="${escape(fallbackPlain)}">${escape(truncated)}</span>`;
        })();

        // הצגת קובץ עם אייקון ו-10 תווים ראשונים
        let attachmentDisplay = '-';
        // Only show attachment if it exists and is not empty/null
        if (noteAttachment && noteAttachment !== null && noteAttachment !== '') {
          // Ensure attachment is a string before processing
          const fileName = typeof noteAttachment === 'string' ? noteAttachment : String(noteAttachment || '');
          
          // Only process if fileName is a valid non-empty string (not just whitespace)
          if (fileName && fileName.trim() && fileName !== 'null' && fileName !== 'undefined') {
            try {
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
            } catch (error) {
              window.Logger?.warn('⚠️ Error processing attachment', { error, noteId: note?.id, attachment: noteAttachment, page: 'notes' });
              attachmentDisplay = '-';
            }
          } else {
            // Invalid attachment value - show dash
            attachmentDisplay = '-';
          }
        }

      // קביעת האובייקט המקושר - כמו ב-cash_flows.js: כפתור קטן + טקסט פשוט
      let relatedCellHtml = '-';
      
      if (note.related_type_id && note.related_id) {
        let entityType = '';
        let displayName = '';
        
        switch (note.related_type_id) {
          case 1: { // Trading Account
            entityType = 'trading_account';
            const account = accounts.find(a => a && a.id === note.related_id);
            displayName = account?.name || account?.account_name || `חשבון מסחר ${note.related_id}`;
            break;
          }
          case 2: { // Trade
            entityType = 'trade';
            const trade = trades.find(t => t && t.id === note.related_id);
            const tradeTicker = trade?.ticker_symbol || trade?.ticker?.symbol || (() => {
              if (trade?.ticker_id) {
                const ticker = tickers.find(tk => tk && tk.id === trade.ticker_id);
                return ticker?.symbol;
              }
              return null;
            })();
            displayName = tradeTicker || `טרייד ${note.related_id}`;
            break;
          }
          case 3: { // Trade Plan
            entityType = 'trade_plan';
            const plan = tradePlans.find(p => p && p.id === note.related_id);
            const planTicker = plan?.ticker?.symbol || plan?.ticker_symbol || (() => {
              if (plan?.ticker_id) {
                const ticker = tickers.find(tk => tk && tk.id === plan.ticker_id);
                return ticker?.symbol;
              }
              return null;
            })();
            displayName = planTicker || `תוכנית ${note.related_id}`;
            break;
          }
          case 4: { // Ticker
            entityType = 'ticker';
            const ticker = tickers.find(tk => tk && tk.id === note.related_id);
            displayName = ticker?.symbol || `טיקר ${note.related_id}`;
            break;
          }
          default: {
            entityType = 'unknown';
            displayName = `אובייקט ${note.related_id}`;
          }
        }
        
        if (entityType && displayName) {
          relatedCellHtml = `
            <div class="table-cell-flex-small">
              <button class="btn btn-sm btn-outline-primary table-btn-small" 
                      data-onclick="if(window.showEntityDetails) { window.showEntityDetails('${entityType}', ${note.related_id}, { mode: 'view' }); } else if(window.showEntityDetailsModal) { window.showEntityDetailsModal('${entityType}', ${note.related_id}, 'view'); }" 
                      title="פתח פרטי ${displayName}">
                🔗
              </button>
              <span>${displayName}</span>
            </div>
          `;
        }
      }

        // Debug: Log note data to verify content and attachment are correct
        window.Logger?.debug('🔍 Building note table row', {
          noteId: note?.id,
          hasContent: !!noteContent,
          contentLength: noteContent?.length || 0,
          contentPreview: noteContent ? String(noteContent).substring(0, 50) : 'null',
          hasAttachment: !!noteAttachment,
          attachmentValue: noteAttachment,
          contentDisplay: contentDisplay.substring(0, 50),
          attachmentDisplay,
          page: 'notes'
        });

        return `
          <tr class="table-cell-clickable">
            <td class="related-cell">${relatedCellHtml}</td>
            <td class="col-content">${contentDisplay}</td>
            <td class="col-attachment">${attachmentDisplay}</td>
            <td class="col-created" data-date='${dateSortValue}'>${dateDisplay}</td>
            ${(() => {
              // Prefer FieldRendererService.renderDate for consistent date formatting
              const rawDate = note.updated_at || note.created_at || null;
              
              if (!rawDate) {
                return `<td class="col-updated"><span class="updated-value-empty">לא זמין</span></td>`;
              }

              // Use FieldRendererService.renderDate for proper date formatting
              let dateDisplay = '';
              let epoch = null;

              if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                // Use FieldRendererService to render date with time
                dateDisplay = window.FieldRendererService.renderDate(rawDate, true);
                
                // Get epoch for sorting
                if (window.dateUtils && typeof window.dateUtils.getEpochMilliseconds === 'function') {
                  const envelope = window.dateUtils.ensureDateEnvelope ? window.dateUtils.ensureDateEnvelope(rawDate) : rawDate;
                  epoch = window.dateUtils.getEpochMilliseconds(envelope || rawDate);
                } else if (rawDate instanceof Date) {
                  epoch = rawDate.getTime();
                } else if (typeof rawDate === 'string') {
                  const parsed = Date.parse(rawDate);
                  epoch = Number.isNaN(parsed) ? null : parsed;
                } else if (rawDate && typeof rawDate === 'object' && rawDate.epochMs) {
                  epoch = rawDate.epochMs;
                }
              } else {
                // Fallback: work directly with date envelope objects or raw values
                const envelope = window.dateUtils && typeof window.dateUtils.ensureDateEnvelope === 'function'
                  ? window.dateUtils.ensureDateEnvelope(rawDate)
                  : rawDate && typeof rawDate === 'object' && (rawDate.epochMs || rawDate.utc || rawDate.local)
                    ? rawDate
                    : null;

                // Derive epoch milliseconds in a canonical way
                epoch = (() => {
                  if (window.dateUtils && typeof window.dateUtils.getEpochMilliseconds === 'function') {
                    return window.dateUtils.getEpochMilliseconds(envelope || rawDate);
                  }
                  if (typeof window.getEpochMilliseconds === 'function') {
                    return window.getEpochMilliseconds(envelope || rawDate);
                  }
                  if (envelope && typeof envelope.epochMs === 'number') {
                    return envelope.epochMs;
                  }
                  if (rawDate instanceof Date) {
                    return rawDate.getTime();
                  }
                  if (typeof rawDate === 'string') {
                    const parsed = Date.parse(rawDate);
                    return Number.isNaN(parsed) ? null : parsed;
                  }
                  return null;
                })();

                if (epoch === null || Number.isNaN(epoch)) {
                  return `<td class="col-updated"><span class="updated-value-empty">לא זמין</span></td>`;
                }

                // Build date display using unified date utilities
                dateDisplay = (() => {
                  if (window.dateUtils && typeof window.dateUtils.formatDateTime === 'function') {
                    return window.dateUtils.formatDateTime(envelope || rawDate);
                  }
                  if (window.dateUtils && typeof window.dateUtils.formatDate === 'function') {
                    return window.dateUtils.formatDate(envelope || rawDate, { includeTime: true });
                  }
                  try {
                    const dateObj = new Date(epoch);
                    return window.formatDate ? window.formatDate(dateObj, true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(dateObj, { includeTime: true }) : dateObj.toLocaleString('he-IL', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }));
                  } catch (err) {
                    window.Logger?.warn('⚠️ notes updated-cell date formatting failed', { err, noteId: note?.id }, { page: 'notes' });
                    return 'לא מוגדר';
                  }
                })();
              }

              if (!dateDisplay || dateDisplay === '-') {
                return `<td class="col-updated"><span class="updated-value-empty">לא זמין</span></td>`;
              }

              return `<td class="col-updated"${epoch ? ` data-epoch="${epoch}"` : ''} title="${dateDisplay}"><span class="updated-value" dir="ltr">${dateDisplay}</span></td>`;
            })()}
            <td class='actions-cell'>
              ${(() => {
                if (!window.createActionsMenu) return '<!-- Actions menu not available -->';
                // Ensure note.id is properly escaped and is a number
                const noteId = note?.id ? parseInt(note.id) : null;
                if (!noteId) {
                  window.Logger?.warn('⚠️ Note ID is missing or invalid', { note, page: 'notes' });
                  return '<!-- Invalid note ID -->';
                }
                const result = window.createActionsMenu([
                  { type: 'VIEW', onclick: `window.showEntityDetails('note', ${noteId}, { mode: 'view' })`, title: 'צפה בפרטי הערה' },
                  { type: 'EDIT', onclick: `editNote(${noteId})`, title: 'ערוך הערה' },
                  { type: 'DELETE', onclick: `deleteNote(${noteId})`, title: 'מחק הערה' }
                ]);
                return result || '';
              })()}
            </td>
          </tr>
        `;
        } catch (error) {
          window.Logger.error(`❌ Error processing note ${note?.id}:`, error, { page: "notes" });
          return `<tr><td colspan="6" class="text-center text-danger">שגיאה בעיבוד הערה ${note?.id}</td></tr>`;
        }
    }).join('');
}

// פונקציה לעדכון סיכום הערות
/**
 * Update the notes summary section
 * Uses the centralized updatePageSummaryStats function from ui-utils.js
 * @param {Array} notes - Array of notes to summarize
 */
function updateNotesSummary(notes) {
  const notesArray = Array.isArray(notes)
    ? notes
    : (window.TableDataRegistry ? window.TableDataRegistry.getFilteredData('notes') : window.notesData || []);
  
  try {
    // שמירת המספר המקורי לחיפוש (נדרש לפונקציונליות ספציפית של עמוד הערות)
    window.originalNotesCount = notesArray.length;

    // עדכון table-count - משתמש בפונקציה הגנרית
    if (window.updateTableCount) {
      window.updateTableCount('.table-count', 'notes', 'הערות', notesArray.length);
    }

    // שימוש בפונקציה המרכזית לסיכום נתונים - כמו בשאר העמודים
    if (typeof window.updatePageSummaryStats === 'function') {
      window.updatePageSummaryStats('notes', notesArray);
    } else {
      // Fallback - מערכת סיכום נתונים לא זמינה
      const summaryStatsElement = document.getElementById('summaryStats');
      if (summaryStatsElement) {
        summaryStatsElement.textContent = '';
        const div = document.createElement('div');
        div.style.color = '#dc3545';
        div.style.fontWeight = 'bold';
        div.textContent = '⚠️ מערכת סיכום נתונים לא זמינה - נא לרענן את הדף';
        summaryStatsElement.appendChild(div);
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
 * @param {Array} _selectedStatuses - Selected statuses (unused)
 * @param {Array} _selectedTypes - Selected types (unused)
 * @param {Array} _selectedAccounts - Selected accounts (unused)
 * @param {Object} _selectedDateRange - Selected date range (unused)
 * @param {string} _searchTerm - Search term (unused)
 * @returns {void}
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
 * Populate select element with data
 * @param {string} selectId - Select element ID
 * @param {Array} data - Data array to populate
 * @param {string} field - Field name to display
 * @param {string} [prefix=''] - Prefix for option text
 * @returns {void}
 */
function populateSelect(selectId, data, field, prefix = '') {
  try {
    const select = document.getElementById(selectId);
    if (!select) {return;}

  if (data.length > 0) {
    // Data available for population
  }

  select.textContent = '';
  const option = document.createElement('option');
  option.value = '';
  option.textContent = 'בחר אובייקט לשיוך...';
  select.appendChild(option);

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
      const dateEnvelope = window.dateUtils?.ensureDateEnvelope ? window.dateUtils.ensureDateEnvelope(date) : date;
      const formattedDate = dateEnvelope
        ? (window.dateUtils?.formatDate
            ? window.dateUtils.formatDate(dateEnvelope, { includeTime: false })
            : (() => {
                try {
                  const parsed = new Date(dateEnvelope?.utc || dateEnvelope?.local || date);
                  if (!Number.isNaN(parsed.getTime())) {
                    return parsed.toLocaleDateString('he-IL');
                  }
                } catch (error) {
                  window.Logger?.warn('⚠️ populateSelect trade date fallback failed', { error, itemId: item?.id }, { page: 'notes' });
                }
                return 'לא מוגדר';
              })())
        : 'לא מוגדר';
      displayText = `${symbol} - ${formattedDate}`;
    } else if (prefix === 'תכנון') {
      // עבור תכנון: סימבול + תאריך
      const symbol = item.symbol || item.ticker_symbol || item.ticker?.symbol || 'לא מוגדר';
      const date = item.created_at || item.date;
      const dateEnvelope = window.dateUtils?.ensureDateEnvelope ? window.dateUtils.ensureDateEnvelope(date) : date;
      const formattedDate = dateEnvelope
        ? (window.dateUtils?.formatDate
            ? window.dateUtils.formatDate(dateEnvelope, { includeTime: false })
            : (() => {
                try {
                  const parsed = new Date(dateEnvelope?.utc || dateEnvelope?.local || date);
                  if (!Number.isNaN(parsed.getTime())) {
                    return parsed.toLocaleDateString('he-IL');
                  }
                } catch (error) {
                  window.Logger?.warn('⚠️ populateSelect plan date fallback failed', { error, itemId: item?.id }, { page: 'notes' });
                }
                return 'לא מוגדר';
              })())
        : 'לא מוגדר';
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
 * @returns {void}
 */
function onNoteRelationTypeChange() {
  // הפונקציה הזו נקראת בעת שינוי רדיו באטון
  // הלוגיקה האמיתית נמצאת ב-updateRadioButtons
  // אבל אנחנו צריכים אותה לעבוד גם בעת טעינת נתונים לעריכה
}

/**
 * Populate edit select by type
 * Uses SelectPopulatorService for consistent select population
 * @param {string} relationType - Relation type
 * @param {number|string} selectedId - Selected ID
 * @returns {Promise<void>}
 */
async function populateEditSelectByType(relationType, selectedId) {
  try {
    const select = document.getElementById('editNoteRelatedObjectSelect');
    if (!select) {
      window.Logger?.warn('⚠️ editNoteRelatedObjectSelect not found', { page: 'notes' });
      return;
    }

    // Check if SelectPopulatorService is available
    if (!window.SelectPopulatorService) {
      window.Logger?.warn('⚠️ SelectPopulatorService not available - using fallback', { page: 'notes' });
      // Fallback to old method if service not available
      await populateEditSelectByTypeFallback(relationType, selectedId);
      return;
    }

    switch (parseInt(relationType)) {
    case 1: { // חשבון מסחר
      await window.SelectPopulatorService.populateAccountsSelect(select, {
        includeEmpty: true,
        emptyText: 'בחר חשבון מסחר...',
        defaultValue: selectedId ? parseInt(selectedId) : null
      });
      break;
    }
    case 2: { // טרייד
      await window.SelectPopulatorService.populateTradesSelect(select, {
        includeEmpty: true,
        emptyText: 'בחר טרייד...',
        defaultValue: selectedId ? parseInt(selectedId) : null
      });
      break;
    }
    case 3: { // תוכנית
      await window.SelectPopulatorService.populateTradePlansSelect(select, {
        includeEmpty: true,
        emptyText: 'בחר תכנון...',
        defaultValue: selectedId ? parseInt(selectedId) : null
      });
      break;
    }
    case 4: { // טיקר
      await window.SelectPopulatorService.populateTickersSelect(select, {
        includeEmpty: true,
        emptyText: 'בחר טיקר...',
        defaultValue: selectedId ? parseInt(selectedId) : null
      });
      break;
    }
    default:
      window.Logger?.warn('⚠️ Unknown relation type', { relationType, page: 'notes' });
    }

  } catch (error) {
    window.Logger?.error('❌ Error populating edit select by type', error, { relationType, selectedId, page: 'notes' });
    // Fallback to old method on error
    try {
      await populateEditSelectByTypeFallback(relationType, selectedId);
    } catch (fallbackError) {
      window.Logger?.error('❌ Fallback also failed', fallbackError, { page: 'notes' });
    }
  }
}

/**
 * Fallback method for populateEditSelectByType
 * Used when SelectPopulatorService is not available
 * @private
 */
async function populateEditSelectByTypeFallback(relationType, selectedId) {
  let data = [];
  let displayField = '';
  let placeholder = '';

  switch (parseInt(relationType)) {
  case 1: { // חשבון מסחר
    const accountsResponse = await fetch('/api/trading-accounts/');
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
    const plansResponse = await fetch('/api/trade-plans/');
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
        // Use DataCollectionService to set value if available
        if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
          window.DataCollectionService.setValue(select.id, selectedId, 'int');
        } else {
          select.value = selectedId;
        }
      }
    }, 100);
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

/**
 * Save note (handles both add and edit modes)
 * 
 * שומר הערה חדשה או מעדכן הערה קיימת.
 * תומך בשמירה עם קבצים מצורפים ותגיות.
 * 
 * @function saveNote
 * @global
 * @returns {Promise<void>}
 * @throws {Error} When form validation fails or API call fails
 * 
 * @example
 * // Save a new note
 * await window.saveNote();
 * 
 * @example
 * // Update existing note (when form is in edit mode)
 * await window.saveNote();
 */
async function saveNote() {
  const form = document.getElementById('notesModalForm') || document.getElementById('addNoteForm');
  if (!form) {
    window.Logger?.warn('⚠️ Notes form not found - aborting save', { page: 'notes' });
    return;
  }

  const noteData = DataCollectionService.collectFormData({
    content: { id: 'noteContent', type: 'rich-text' }, // Rich text editor - returns HTML
    related_type_id: { id: 'noteRelatedType', type: 'text' },
    related_id: { id: 'noteRelatedObject', type: 'int' },
    tag_ids: { id: 'noteTags', type: 'tags', default: [] }
  });

  const content = noteData.content || ''; // HTML content from rich text editor
  const related_type_id = noteData.related_type_id;
  const related_id = noteData.related_id;
  const tagIds = Array.isArray(noteData.tag_ids) ? noteData.tag_ids : [];
  const attachmentFile = document.getElementById('noteAttachment')?.files[0];

  const textContent = content.replace(/<[^>]*>/g, '').trim();
  if (!textContent || textContent.length === 0) {
    window.showErrorNotification?.('שגיאה', 'תוכן ההערה חובה');
    return;
  }

  if (!related_type_id || !related_id) {
    window.showErrorNotification?.('שגיאה', 'יש לבחור סוג אובייקט ואובייקט מקושר');
    return;
  }

  if (content.length > 10000) {
    window.showErrorNotification?.('שגיאה', 'תוכן ההערה לא יכול להיות יותר מ-10000 תווים');
    return;
  }

  // Business Logic API validation
  if (window.NotesData?.validateNote) {
    try {
      const validationResult = await window.NotesData.validateNote({
        content: textContent,
        related_type_id: parseInt(related_type_id),
        related_id: parseInt(related_id)
      });

      if (!validationResult.is_valid) {
        const errorMessage = validationResult.errors?.join(', ') || 'ולידציה נכשלה';
        window.showErrorNotification?.('שגיאת ולידציה', errorMessage);
        return;
      }
    } catch (validationError) {
      window.Logger?.warn('⚠️ Note validation error (continuing with save)', {
        error: validationError,
        page: 'notes'
      });
      // Continue with save even if validation fails (fallback)
    }
  }

  // Validate note relation
  if (window.NotesData?.validateNoteRelation) {
    try {
      const relationValidation = await window.NotesData.validateNoteRelation(
        parseInt(related_type_id),
        parseInt(related_id)
      );

      if (!relationValidation.is_valid) {
        const errorMessage = relationValidation.errors?.join(', ') || 'ולידציה של קישור נכשלה';
        window.showErrorNotification?.('שגיאת ולידציה', errorMessage);
        return;
      }
    } catch (validationError) {
      window.Logger?.warn('⚠️ Note relation validation error (continuing with save)', {
        error: validationError,
        page: 'notes'
      });
      // Continue with save even if validation fails (fallback)
    }
  }

  const isEditMode = form.dataset.mode === 'edit';
  // Get entity ID - try dataset first, then DataCollectionService, then querySelector
  let formEntityId = form.dataset.entityId || form.dataset.noteId || null;
  if (!formEntityId) {
    const idInput = form.querySelector('input[name="id"]');
    if (idInput && idInput.id && window.DataCollectionService) {
      formEntityId = window.DataCollectionService.getValue(idInput.id, 'int', null);
    } else if (idInput) {
      formEntityId = idInput.value || null;
    }
  }
  const noteId = isEditMode && formEntityId ? parseInt(formEntityId, 10) : null;
  const method = noteId ? 'PUT' : 'POST';
  const url = noteId ? `/api/notes/${noteId}` : '/api/notes/';
  const reloadFn = () => window.loadNotesData({ force: true });

  try {
    let response;
    let payload;

    if (attachmentFile) {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('related_type_id', related_type_id);
      formData.append('related_id', related_id);
      formData.append('attachment', attachmentFile);
      payload = formData;
    } else {
      const requestData = {
        content,
        related_type_id: parseInt(related_type_id),
        related_id: parseInt(related_id)
      };
      payload = requestData;
    }

    const useService = method === 'POST'
      ? typeof window.NotesData?.createNote === 'function'
      : typeof window.NotesData?.updateNote === 'function';

    if (useService) {
      response = noteId
        ? await window.NotesData.updateNote(noteId, { payload })
        : await window.NotesData.createNote({ payload });
    } else if (attachmentFile) {
      response = await fetch(url, {
        method,
        body: payload
      });
    } else {
      response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    }

    const crudOptions = {
      modalId: 'notesModal',
      successMessage: noteId ? 'הערה עודכנה בהצלחה!' : 'הערה נשמרה בהצלחה!',
      entityName: 'הערה',
      reloadFn,
      requiresHardReload: false
    };

    let crudResult = null;
    if (noteId) {
      crudResult = await CRUDResponseHandler.handleUpdateResponse(response, crudOptions);
    } else {
      crudResult = await CRUDResponseHandler.handleSaveResponse(response, crudOptions);
    }

    // Cache invalidation after CRUDResponseHandler processes the response
    if (crudResult && window.CacheSyncManager?.invalidateByAction) {
      try {
        const action = noteId ? 'note-updated' : 'note-created';
        await window.CacheSyncManager.invalidateByAction(action);
      } catch (cacheError) {
        window.Logger?.warn('⚠️ Failed to invalidate cache after note save', {
          error: cacheError,
          page: 'notes'
        });
      }
    }

    // Debug: Log the result structure to understand what we're getting
    window.Logger?.debug('🔍 saveNote - crudResult structure:', {
      hasCrudResult: !!crudResult,
      crudResultType: typeof crudResult,
      hasData: !!crudResult?.data,
      hasId: crudResult?.data?.id !== undefined,
      crudResultKeys: crudResult ? Object.keys(crudResult) : [],
      dataKeys: crudResult?.data ? Object.keys(crudResult.data) : [],
      resultId: crudResult?.data?.id,
      resultIdDirect: crudResult?.id,
      page: 'notes'
    });

    const resolvedNoteId = noteId || Number(crudResult?.data?.id || crudResult?.id);
    window.Logger?.debug('🔍 saveNote - resolvedNoteId:', {
      noteId,
      resolvedNoteId,
      isFinite: Number.isFinite(resolvedNoteId),
      page: 'notes'
    });

    if (Number.isFinite(resolvedNoteId) && window.TagService) {
      try {
        await window.TagService.replaceEntityTags('note', resolvedNoteId, tagIds);
      } catch (tagError) {
        window.Logger?.warn('⚠️ Failed to update note tags', {
          error: tagError,
          noteId: resolvedNoteId,
          page: 'notes'
        });
        const errorMessage = window.TagService?.formatTagErrorMessage
          ? window.TagService.formatTagErrorMessage('ההערה נשמרה אך התגיות לא עודכנו', tagError)
          : 'ההערה נשמרה אך התגיות לא עודכנו';
        window.showErrorNotification?.('שמירת תגיות', errorMessage);
      }
    }
  } catch (error) {
    CRUDResponseHandler.handleError(error, 'שמירת הערה');
  }
}

/**
 * Update note from modal
 * @returns {Promise<void>}
 */
async function updateNoteFromModal() {
  
  // שימוש ב-DataCollectionService לאיסוף נתונים
  const noteData = DataCollectionService.collectFormData({
    id: { id: 'editNoteId', type: 'int' },
    content: { id: 'editNoteContent', type: 'rich-text' }, // Rich text editor
    relationType: { id: 'editNoteRelationType', type: 'text', isRadioChecked: true },
    relatedId: { id: 'editNoteRelatedObjectSelect', type: 'int' },
    tagIds: { id: 'editNoteTags', type: 'tags', default: [] }
  });

  const noteId = noteData.id;
  const content = noteData.content || getEditorContent('edit'); // Use rich-text content or fallback
  const relationType = noteData.relationType;
  const relatedId = noteData.relatedId;
  const tagIds = Array.isArray(noteData.tagIds) ? noteData.tagIds : [];
  const attachment = document.getElementById('editNoteAttachment').files[0];

  // בדיקה אם נדרשת מחיקת קובץ
  const shouldRemoveAttachment = window.removeAttachmentFlag === true;
  // const shouldReplaceAttachment = window.replaceAttachmentFlag === true;

  // ולידציה - משתמש במערכת הכללית window.validateEntityForm

  clearNoteValidationErrors();

  try {
    let response;
    let payload;

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
      payload = formData;
    } else {
      // אחרת, השתמש ב-JSON
      const data = {
        content,
        related_type_id: parseInt(relationType),
        related_id: parseInt(relatedId),
      };
      payload = data;
    }

    const useService = typeof window.NotesData?.updateNote === 'function';
    if (useService) {
      response = await window.NotesData.updateNote(noteId, { payload });
    } else if (payload instanceof FormData) {
      response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        body: payload,
      });
    } else {
      response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    }

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    const updateResult = await CRUDResponseHandler.handleUpdateResponse(response, {
      modalId: 'editNoteModal',
      successMessage: 'הערה עודכנה בהצלחה!',
      apiUrl: '/api/notes/',
      entityName: 'הערה',
      reloadFn: () => window.loadNotesData({ force: true }),
      requiresHardReload: false
    });

    if (updateResult !== null && window.TagService) {
      try {
        await window.TagService.replaceEntityTags('note', noteId, tagIds);
      } catch (tagError) {
        window.Logger?.warn('⚠️ Failed to update note tags (legacy edit)', {
          error: tagError,
          noteId,
          page: 'notes'
        });
        const errorMessage = window.TagService?.formatTagErrorMessage
          ? window.TagService.formatTagErrorMessage('ההערה עודכנה אך התגיות לא נשמרו', tagError)
          : 'ההערה עודכנה אך התגיות לא נשמרו';
        window.showErrorNotification?.('שמירת תגיות', errorMessage);
      }
    }

    // ניקוי דגלים
    window.removeAttachmentFlag = false;
    window.replaceAttachmentFlag = false;

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'עדכון הערה');
  }
}

// פונקציה זו הוסרה - שימוש במערכת הגלובלית showDeleteWarning

/**
 * Confirm and delete a note
 * Closes the delete confirmation modal using ModalManagerV2 and deletes the note
 * 
 * @function confirmDeleteNote
 * @param {number} noteId - ID of the note to delete
 * @returns {Promise<void>}
 * @since 2.1.0 - Updated to use ModalManagerV2.hideModal() instead of direct Bootstrap modal
 */
async function confirmDeleteNote(noteId) {
  // סגירת המודל דרך ModalManagerV2
  if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
    window.ModalManagerV2.hideModal('deleteNoteModal');
  } else {
    // Fallback ל-Bootstrap modal - עם ניקוי backdrop
    const modalElement = document.getElementById('deleteNoteModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
        // ניקוי backdrops אחרי סגירה
        if (window.ModalManagerV2?._cleanupBootstrapBackdrops) {
          setTimeout(() => {
            window.ModalManagerV2._cleanupBootstrapBackdrops();
          }, 100);
        }
      }
    }
  }

  // מחיקת ההערה
  await deleteNoteFromServer(noteId);
}

/**
 * Delete note from server
 * @param {number|string} noteId - Note ID
 * @returns {Promise<void>}
 */
async function deleteNoteFromServer(noteId) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const useService = typeof window.NotesData?.deleteNote === 'function';
      const response = useService
        ? await window.NotesData.deleteNote(noteId)
        : await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });

      // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
      await CRUDResponseHandler.handleDeleteResponse(response, {
        successMessage: 'הערה נמחקה בהצלחה!',
        apiUrl: '/api/notes/',
        entityName: 'הערה',
        reloadFn: () => window.loadNotesData({ force: true }),
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

// Legacy getFieldByErrorId function was removed; use validation-utils helpers instead
// Original implementation was removed as part of code cleanup
//     return document.getElementById('editNoteRelatedObjectSelect');
//   default:
//     return null;
//   }
// }

// window.loadNotesData כבר מוגדר בתחילת הקובץ
// window.updateNotesTable יוצא בשורה 2241
window.updateNotesSummary = updateNotesSummary;
window.updateGridFromComponent = updateGridFromComponent;
// REMOVED: window.showAddNoteModal - use window.ModalManagerV2.showModal('notesModal', 'add') directly
// REMOVED: window.showEditNoteModal - use window.ModalManagerV2.showEditModal('notesModal', 'note', id) directly
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
          displayElement.textContent = '';
          const container = document.createElement('div');
          container.style.display = 'flex';
          container.style.alignItems = 'center';
          container.style.gap = '8px';
          const iconSpan = document.createElement('span');
          iconSpan.textContent = fileIcon;
          container.appendChild(iconSpan);
          const nameSpan = document.createElement('span');
          nameSpan.textContent = `${fileName} (חדש)`;
          container.appendChild(nameSpan);
          const checkSpan = document.createElement('span');
          checkSpan.style.color = window.getTableColors ? window.getTableColors().positive : '#28a745';
          checkSpan.style.fontWeight = 'bold';
          checkSpan.textContent = '✓ נבחר';
          container.appendChild(checkSpan);
          displayElement.appendChild(container);
        }

        // עדכון כפתורי הפעולה
        const actionsElement = document.getElementById('attachmentActions');
        if (actionsElement) {
          actionsElement.textContent = '';
          const actionsHTML = `
            <button data-button-type="SECONDARY" data-variant="full" data-text="✅ קובץ נבחר" data-classes="btn-sm" type="button" disabled></button>
            <button data-button-type="CANCEL" data-variant="full" data-icon="❌" data-text="בטל בחירה" data-classes="btn-sm" data-onclick="clearSelectedFile()" type="button"></button>
          `;
          const parser = new DOMParser();
          const doc = parser.parseFromString(actionsHTML, 'text/html');
          doc.body.childNodes.forEach(node => {
            actionsElement.appendChild(node.cloneNode(true));
          });
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

/**
 * Clear selected file
 * @returns {void}
 */
function clearSelectedFile() {
  try {
    const fileInput = document.getElementById('editNoteAttachment');
    const displayElement = document.getElementById('currentAttachmentDisplay');
    const actionsElement = document.getElementById('attachmentActions');

  if (fileInput) {
    // Use DataCollectionService to clear field if available
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
      window.DataCollectionService.setValue(fileInput.id, '', 'text');
    } else {
      fileInput.value = '';
    }
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
 * sortTable(3); // סידור לפי עמודת נוצר ב:
 *
 * @requires window.sortTableData - פונקציה גלובלית מ-main.js
 */

/**
 * שחזור מצב סידור - שימוש בפונקציה גלובלית
 * @deprecated Use window.restoreAnyTableSort from main.js instead
 */
async function restoreSortState() {
  try {
    if (typeof window.pageUtils?.restoreSortState === 'function') {
      await window.pageUtils.restoreSortState('notes');
      return;
    }

    if (window.UnifiedTableSystem?.sorter?.applyDefaultSort) {
      await window.UnifiedTableSystem.sorter.applyDefaultSort('notes');
      return;
    }

    window.Logger?.debug('restoreSortState (notes): fallback handler not available', { page: "notes" });
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
    
    // בדיקה אם זה rich-text editor (Quill)
    if (window.RichTextEditorService) {
      const content = window.RichTextEditorService.getContent(editorId);
      return content || '';
    }
    
    // Fallback: עבודה עם אלמנט רגיל
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
    
    // בדיקה אם זה rich-text editor (Quill)
    if (window.RichTextEditorService) {
      window.RichTextEditorService.setContent(editorId, content || '');
      return;
    }
    
    // Fallback: עבודה עם אלמנט רגיל
    const editor = document.getElementById(editorId);
    if (!editor) {
      return;
    }

    editor.textContent = '';
    if (content) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      doc.body.childNodes.forEach(node => {
        editor.appendChild(node.cloneNode(true));
      });
    }
  
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

  if (typeof window.updateNotesTable === 'function') {
    window.updateNotesTable(filteredNotes);
  }
  
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
    // השארת הסגנון לניהול ע"י מערכת הכפתורים / CSS גלובלי
    btn.style.backgroundColor = '';
    btn.style.color = '';
    btn.style.borderColor = '';
  });

  const activeButton = document.querySelector(`[data-type="${type}"]`);
  if (activeButton) {
    activeButton.classList.add('active');
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

  if (typeof window.updateNotesTable === 'function') {
    window.updateNotesTable(filteredNotes);
  }
  
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
 * @deprecated Use window.translateEntityType() from translation-utils.js instead
 * This function is kept for backward compatibility but should use the centralized Translation Utilities
 * @param {string} type - Type to get display name for
 * @returns {string} Display name
 */
function getTypeDisplayName(type) {
  try {
    // Use Translation Utilities if available
    if (window.translateEntityType && typeof window.translateEntityType === 'function') {
      return window.translateEntityType(type);
    }
    
    // Fallback to local implementation
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
 * Opens the note view modal using the global entity details system or fallback to Bootstrap modal
 * 
 * @function viewNote
 * @param {number} noteId - ID of the note to view
 * @returns {void}
 * @since 2.1.0 - Updated to use ModalManagerV2 for modal management when available
 */
async function viewNote(noteId) {
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

      // הצגת המודל דרך ModalManagerV2 (אם זמין) או fallback ל-Bootstrap
      // viewNoteModal הוא מודל view-only מיוחד, לא חלק מ-ModalManagerV2 CRUD
      const modalElement = document.getElementById('viewNoteModal');
      if (modalElement) {
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
          // נסה להשתמש ב-ModalManagerV2 - אם המודל קיים במערכת
          try {
            await window.ModalManagerV2.showModal('viewNoteModal', 'view');
          } catch (error) {
            // אם המודל לא קיים במערכת, נשתמש ב-Bootstrap
            window.Logger?.warn('viewNoteModal not in ModalManagerV2, using Bootstrap fallback', { page: 'notes' });
            const modal = bootstrap?.Modal?.getOrCreateInstance(modalElement);
            if (modal) {
              modal.show();
            }
          }
        } else {
          // Fallback ל-Bootstrap modal - עם backdrop: false וניקוי
          if (bootstrap?.Modal) {
            // ניקוי backdrops לפני פתיחה
            if (window.ModalManagerV2?._cleanupBootstrapBackdrops) {
              window.ModalManagerV2._cleanupBootstrapBackdrops();
            }
            const modal = new bootstrap.Modal(modalElement, { backdrop: false });
            modal.show();
            // ניקוי backdrops אחרי פתיחה
            if (window.ModalManagerV2?._cleanupBootstrapBackdrops) {
              setTimeout(() => {
                window.ModalManagerV2._cleanupBootstrapBackdrops();
              }, 50);
            }
            // עדכון z-index
            if (window.ModalZIndexManager?.forceUpdate) {
              setTimeout(() => {
                window.ModalZIndexManager.forceUpdate(modalElement);
              }, 50);
            }
          }
        }
      }
    }
  
  } catch (error) {
    window.Logger.error('שגיאה בצפייה בהערה:', error, { page: "notes" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בצפייה בהערה', error.message);
    }
  }
}

/**
 * Load note data for viewing
 * @param {number|string} noteId - Note ID
 * @returns {Promise<void>}
 */
async function loadNoteForViewing(noteId) {
  try {
    let payload;
    if (typeof window.NotesData?.fetchNoteDetails === 'function') {
      payload = await window.NotesData.fetchNoteDetails(noteId);
    } else {
      const response = await fetch(`/api/notes/${noteId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      payload = await response.json();
    }

    const note = payload.data || payload;

    // מילוי המודל
    document.getElementById('viewNoteRelated').textContent = getNoteRelatedDisplay(note);
    const viewNoteContent = document.getElementById('viewNoteContent');
    if (viewNoteContent) {
      viewNoteContent.textContent = '';
      const content = note.content || 'ללא תוכן';
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      doc.body.childNodes.forEach(node => {
        viewNoteContent.appendChild(node.cloneNode(true));
      });
    }
    const createdEnvelope = window.dateUtils?.ensureDateEnvelope
      ? window.dateUtils.ensureDateEnvelope(note.created_at)
      : note.created_at;
    const createdDisplay = createdEnvelope
      ? (window.dateUtils?.formatDateTime
          ? window.dateUtils.formatDateTime(createdEnvelope)
          : window.dateUtils?.formatDate
            ? window.dateUtils.formatDate(createdEnvelope, { includeTime: true })
            : (() => {
                try {
                  const parsed = new Date(createdEnvelope?.utc || createdEnvelope?.local || note.created_at);
                  if (!Number.isNaN(parsed.getTime())) {
                    return window.formatDate ? window.formatDate(parsed, true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(parsed, { includeTime: true }) : parsed.toLocaleString('he-IL'));
                  }
                } catch (error) {
                  window.Logger?.warn('⚠️ viewNote created fallback failed', { error, noteId }, { page: 'notes' });
                }
                return 'לא מוגדר';
              })())
      : 'לא מוגדר';
    document.getElementById('viewNoteCreated').textContent = createdDisplay;

    // הצגת קובץ מצורף
    const attachmentElement = document.getElementById('viewNoteAttachment');
    if (note.attachment) {
      // Ensure attachment is a string before processing
      const fileName = typeof note.attachment === 'string' ? note.attachment : String(note.attachment || '');
      
      // Only process if fileName is a valid non-empty string
      if (fileName && fileName.trim()) {
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

        attachmentElement.textContent = '';
        const link = document.createElement('a');
        link.href = `/api/notes/files/${fileName}`;
        link.target = '_blank';
        link.className = 'btn btn-sm';
        link.textContent = `${fileIcon} ${fileName}`;
        attachmentElement.appendChild(link);
      } else {
        attachmentElement.textContent = '';
        const span = document.createElement('span');
        span.className = 'text-muted';
        span.textContent = 'אין קובץ מצורף';
        attachmentElement.appendChild(span);
      }
    } else {
      attachmentElement.textContent = '';
      const span = document.createElement('span');
      span.className = 'text-muted';
      span.textContent = 'אין קובץ מצורף';
      attachmentElement.appendChild(span);
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
 * Closes the view modal using ModalManagerV2 and opens edit modal for the currently viewing note
 * 
 * @function editCurrentNote
 * @returns {void}
 * @since 2.1.0 - Updated to use ModalManagerV2.hideModal() instead of direct Bootstrap modal
 */
function editCurrentNote() {
  try {
    const noteId = window.currentViewingNoteId;
    if (noteId) {
      // סגירת מודל הצפייה דרך ModalManagerV2
      if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
        window.ModalManagerV2.hideModal('viewNoteModal');
      } else {
        // Fallback ל-Bootstrap modal - עם ניקוי backdrop
        const modalElement = document.getElementById('viewNoteModal');
        if (modalElement) {
          const viewModal = bootstrap.Modal.getInstance(modalElement);
          if (viewModal) {
            viewModal.hide();
            // ניקוי backdrops אחרי סגירה
            if (window.ModalManagerV2?._cleanupBootstrapBackdrops) {
              setTimeout(() => {
                window.ModalManagerV2._cleanupBootstrapBackdrops();
              }, 100);
            }
          }
        }
      }

      // פתיחת מודל העריכה
      // Use ModalManagerV2 directly
      if (window.ModalManagerV2 && typeof window.ModalManagerV2.showEditModal === 'function') {
        window.ModalManagerV2.showEditModal('notesModal', 'note', noteId);
      } else {
        window.Logger?.error('ModalManagerV2 לא זמין', { page: "notes" });
      }
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
    // Ensure attachment is a string before processing
    const fileName = typeof attachment === 'string' ? attachment : String(attachment || '');
    
    // Only process if fileName is a valid non-empty string
    if (fileName && fileName.trim()) {
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

      displayElement.textContent = '';
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.gap = '8px';
      const iconSpan = document.createElement('span');
      iconSpan.textContent = fileIcon;
      container.appendChild(iconSpan);
      const nameSpan = document.createElement('span');
      nameSpan.textContent = fileName;
      container.appendChild(nameSpan);
      const link = document.createElement('a');
      link.href = `/api/notes/files/${fileName}` 
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
    // Use DataCollectionService to clear field if available
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
      window.DataCollectionService.setValue(fileInput.id, '', 'text');
    } else {
      fileInput.value = '';
    }
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
// REMOVED: showAddNoteModal - use window.ModalManagerV2.showModal('notesModal', 'add') directly

/**
 * הצגת מודל עריכת הערה
 * Uses ModalManagerV2 for consistent modal experience
 */
// REMOVED: showEditNoteModal - use window.ModalManagerV2.showEditModal('notesModal', 'note', noteId) directly

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
// window.loadNotesData כבר מוגדר בשורה 99
// REMOVED: window exports for removed functions
window.editNote = editNote;
// Note: deleteNote and saveNote removed - using ModalManagerV2 and confirmDeleteNote instead
// REMOVED: window.viewLinkedItems - use window.viewLinkedItems or window.viewLinkedItemsForNote from linked-items.js instead

/**
 * Restore page state (filters, sort, sections, entity filters)
 * @param {string} pageName - Page name
 * @returns {Promise<void>}
 */
async function restorePageState(pageName) {
  try {
    // אתחול PageStateManager אם לא מאותחל
    if (window.PageStateManager && !window.PageStateManager.initialized) {
      await window.PageStateManager.initialize();
    }

    if (!window.PageStateManager || !window.PageStateManager.initialized) {
      if (window.Logger) {
        window.Logger.warn('⚠️ PageStateManager not available, skipping state restoration', { page: pageName });
      }
      return;
    }

    // מיגרציה של נתונים קיימים אם יש
    await window.PageStateManager.migrateLegacyData(pageName);

    // טעינת מצב מלא
    const pageState = await window.PageStateManager.loadPageState(pageName);
    if (!pageState) {
      return; // אין מצב שמור
    }

    // שחזור פילטרים ראשיים
    if (pageState.filters && window.filterSystem) {
      window.filterSystem.currentFilters = { ...window.filterSystem.currentFilters, ...pageState.filters };
      if (window.filterSystem.applyAllFilters) {
        window.filterSystem.applyAllFilters();
      }
    }

    // שחזור סידור
    if (pageState.sort && window.UnifiedTableSystem && window.UnifiedTableSystem.sorter) {
      const { columnIndex, direction } = pageState.sort;
      if (typeof columnIndex === 'number' && columnIndex >= 0) {
        await window.UnifiedTableSystem.sorter.sort('notes', columnIndex, {
          direction: direction || 'asc',
          saveState: false // Don't save again, already restored
        });
      }
    } else if (window.UnifiedTableSystem && window.UnifiedTableSystem.sorter) {
      // אם אין מצב שמור, נסה להחיל סידור ברירת מחדל
      await window.UnifiedTableSystem.sorter.applyDefaultSort('notes');
    }

    // שחזור סקשנים
    if (pageState.sections && typeof window.restoreAllSectionStates === 'function') {
      await window.restoreAllSectionStates();
    }

    // שחזור פילטרים פנימיים (entity filters) - מתבצע אוטומטית ב-entity-details-renderer

    if (window.Logger) {
      window.Logger.debug(`✅ Page state restored for "${pageName}"`, { page: pageName });
    }
  } catch (error) {
    if (window.Logger) {
      window.Logger.error(`❌ Error restoring page state for "${pageName}":`, error, { page: pageName });
    }
  }
}

/**
 * Register notes table with UnifiedTableSystem
 * This function registers the notes table for unified sorting and filtering
 */
window.registerNotesTables = function() {
    if (!window.UnifiedTableSystem) {
        window.Logger?.warn('⚠️ UnifiedTableSystem not available for registration', { page: "notes" });
        return;
    }

    // Get column mappings from table-mappings.js
    const getColumns = (tableType) => {
        return window.TABLE_COLUMN_MAPPINGS?.[tableType] || [];
    };

    // Register notes table
    window.UnifiedTableSystem.registry.register('notes', {
        dataGetter: () => {
            return window.notesData || [];
        },
        updateFunction: (data) => {
            if (typeof window.updateNotesTable === 'function') {
                window.updateNotesTable(data);
            }
        },
        tableSelector: '#notesTable',
        columns: getColumns('notes'),
        sortable: true,
        filterable: true,
        // Default sort: created_at desc (column index 3 after attachment moved before date)
        defaultSort: { columnIndex: 3, direction: 'desc', key: 'created_at' }
    });
};
window.Logger.info('🔵🔵🔵 מייצא updateNotesTable גלובלית (שורה 2240)', { page: "notes" });
// ייצוא ישיר של הפונקציה המקורית - ללא wrapper כדי למנוע רקורסיה
window.updateNotesTable = updateNotesTable;

// REMOVED: window.showAddNoteModal - use window.showModalSafe('notesModal', 'add') directly

/**
 * Show edit note modal (wrapper for ModalManagerV2)
 * Maintains backward compatibility with HTML onclick handlers
 * @function showEditNoteModal
 * @param {number|string} noteId - ID of note to edit
 */
window.showEditNoteModal = async function(noteId) {
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.showEditModal === 'function') {
        await window.ModalManagerV2.showEditModal('notesModal', 'note', noteId);
        if (window.TagUIManager && typeof window.TagUIManager.hydrateSelectForEntity === 'function') {
            await window.TagUIManager.hydrateSelectForEntity('noteTags', 'note', noteId, { force: true });
            await window.TagUIManager.hydrateSelectForEntity('editNoteTags', 'note', noteId, { force: true });
        }
    } else {
        window.Logger.error('ModalManagerV2 not available', { page: 'notes' });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'מערכת המודלים לא זמינה. אנא רענן את הדף.');
        }
    }
};

// REMOVED: window.restoreNotesSectionState - use PageStateManager + restoreAllSectionStates() instead


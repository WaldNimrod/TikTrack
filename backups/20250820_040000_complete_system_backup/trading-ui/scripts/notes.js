/**
 * ========================================
 * דף ההערות - Notes Page
 * ========================================
 * 
 * קובץ ייעודי לדף ההערות (notes.html)
 * 
 * מערכת הערות מאפשרת יצירה, עריכה ומחיקה של הערות המקושרות לאובייקטים שונים:
 * - חשבונות (accounts)
 * - טריידים (trades) 
 * - תכנונים (trade plans)
 * - טיקרים (tickers)
 * 
 * תכונות עיקריות:
 * - טבלת הערות עם מיון וסינון
 * - מודלים להוספה ועריכה עם עורך טקסט מעוצב
 * - צרוף קבצים (PDF, תמונות)
 * - שיוך לאובייקטים עם סינון לפי סטטוס
 * - עיצוב מותאם עם איקונים וצבעים לכל סוג אובייקט
 * 
 * מבנה הנתונים:
 * - related_type_id: 1=חשבון, 2=טרייד, 3=תכנון, 4=טיקר
 * - related_id: מזהה האובייקט המקושר
 * - content: תוכן ההערה (HTML)
 * - attachment: שם הקובץ המצורף (אופציונלי)
 * 
 * מחבר: Tik.track Development Team
 * תאריך עדכון אחרון: 2025
 * ========================================
 */

// משתנים גלובליים
let notesData = [];

/**
 * טעינת נתוני הערות מהשרת
 * 
 * פונקציה זו טוענת את כל ההערות מהשרת ומעדכנת את הטבלה
 * כולל טעינת נתונים נוספים (חשבונות, טריידים, תכנונים, טיקרים) לצורך הצגה
 * 
 * @returns {Promise<Array>} מערך של הערות
 */
async function loadNotesData() {
  try {
    console.log('🔄 טוען הערות מהשרת...');
    const response = await window.apiCall('/api/notes');
    const notes = response.data || response;
    console.log(`✅ נטענו ${notes.length} הערות`);

    // עדכון המשתנה הגלובלי
    notesData = notes.map(note => ({
      id: note.id,
      content: note.content,
      related_type_id: note.related_type_id,
      related_id: note.related_id,
      attachment: note.attachment,
      created_at: note.created_at
    }));

    // עדכון הטבלה
    updateNotesTable(notesData);

    return notesData;

  } catch (error) {
    console.error('Error loading notes data:', error);
    return [];
  }
}

/**
 * עדכון טבלת הערות
 * 
 * פונקציה זו מעדכנת את טבלת ההערות עם הנתונים החדשים
 * כולל טעינת נתונים נוספים (חשבונות, טריידים, תכנונים, טיקרים) לצורך הצגה נכונה
 * 
 * תכונות:
 * - טעינת נתונים נוספים במקביל (Promise.allSettled)
 * - הצגת איקונים וצבעים לכל סוג אובייקט
 * - עיצוב מותאם לכל סוג אובייקט מקושר
 * - טיפול בשגיאות API בודדות
 * 
 * @param {Array} notes - מערך של הערות לעדכון
 */
async function updateNotesTable(notes) {
  console.log('🚀 === התחלת updateNotesTable בדף ההערות ===');
  console.log('🔄 מעדכן טבלת הערות עם', notes.length, 'הערות');

  const tbody = document.querySelector('#notesTable tbody');
  if (!tbody) {
    console.error('Table body not found');
    return;
  }

  // הצגת הודעת טעינה
  tbody.innerHTML = '<tr><td colspan="6" class="text-center">טוען נתונים...</td></tr>';

  try {
    console.log('🔄 טוען נתונים נוספים...');

    // טעינת נתונים נוספים במקביל עם טיפול בשגיאות
    const [accountsResponse, tradesResponse, tradePlansResponse, tickersResponse] = await Promise.allSettled([
      window.apiCall('/api/v1/accounts/').catch(e => { console.error("Failed to load accounts:", e); return { data: [] }; }),
      window.apiCall('/api/trades').catch(e => { console.error("Failed to load trades:", e); return { data: [] }; }),
      window.apiCall('/api/v1/trade_plans/').catch(e => { console.error("Failed to load trade plans:", e); return { data: [] }; }),
      window.apiCall('/api/tickers').catch(e => { console.error("Failed to load tickers:", e); return { data: [] }; })
    ]);

    // חילוץ הנתונים עם טיפול בשגיאות
    const accounts = accountsResponse.status === 'fulfilled' ? (accountsResponse.value.data || accountsResponse.value) : [];
    const trades = tradesResponse.status === 'fulfilled' ? (tradesResponse.value.data || tradesResponse.value) : [];
    const tradePlans = tradePlansResponse.status === 'fulfilled' ? (tradePlansResponse.value.data || tradePlansResponse.value) : [];
    const tickers = tickersResponse.status === 'fulfilled' ? (tickersResponse.value.data || tickersResponse.value) : [];

    console.log(`✅ נטענו ${accounts.length} חשבונות, ${trades.length} טריידים, ${tradePlans.length} תוכניות, ${tickers.length} טיקרים`);
    console.log('🔍 טיקרים שנטענו:', tickers);

    // בניית שורות הטבלה
    const rows = notes.map(note => {
      console.log('🔍 מעבד הערה', note.id + ':', note);

      let symbolDisplay = '';
      let relatedDisplay = '';
      let relatedClass = '';
      let relatedIcon = '';

      const relatedTypeId = note.related_type_id;
      const relatedId = note.related_id;

      console.log('🔍 related_type_id:', relatedTypeId, 'related_id:', relatedId);

      switch (relatedTypeId) {
        case 1: // חשבון
          console.log('🏦 מעבד חשבון ID:', relatedId);
          console.log('🏦 חשבונות זמינים:', accounts.length, accounts);
          const account = accounts.find(a => a.id == relatedId);
          console.log('🏦 חשבון שנמצא:', account);
          if (account) {
            const accountName = account.name || 'לא מוגדר';
            symbolDisplay = '';
            relatedDisplay = `חשבון: ${accountName.substring(0, 12)}`;
            relatedClass = 'related-account';
            relatedIcon = '🏦';
          }
          console.log('🏦 תוצאה: relatedDisplay="' + relatedDisplay + '", symbolDisplay="' + symbolDisplay + '"');
          break;

        case 2: // טרייד
          console.log('📈 מעבד טרייד ID:', relatedId);
          const trade = trades.find(t => t.id == relatedId);
          if (trade) {
            const tradeTicker = tickers.find(t => t.id == trade.ticker_id);
            const symbol = tradeTicker ? tradeTicker.symbol : 'לא ידוע';
            symbolDisplay = symbol;
            relatedDisplay = symbol;
            relatedClass = 'related-trade';
            relatedIcon = '📈';
          }
          break;

        case 3: // תכנון
          console.log('📋 מעבד תכנון ID:', relatedId);
          const plan = tradePlans.find(p => p.id == relatedId);
          if (plan) {
            const planTicker = tickers.find(t => t.id == plan.ticker_id);
            const symbol = planTicker ? planTicker.symbol : 'לא ידוע';
            symbolDisplay = symbol;
            relatedDisplay = symbol;
            relatedClass = 'related-plan';
            relatedIcon = '📋';
          }
          break;

        case 4: // טיקר
          console.log('🎯 מעבד טיקר ID:', relatedId);
          console.log('🎯 טיקרים זמינים:', tickers.length, tickers);
          const ticker = tickers.find(t => t.id == relatedId);
          console.log('🎯 טיקר שנמצא:', ticker);
          if (ticker) {
            symbolDisplay = ticker.symbol;
            relatedDisplay = ticker.symbol;
            relatedClass = 'related-ticker';
            relatedIcon = '🎯';
          }
          console.log('🎯 תוצאה: relatedDisplay="' + relatedDisplay + '", symbolDisplay="' + symbolDisplay + '"');
          break;
      }

      console.log('✅ תוצאה סופית עבור הערה', note.id + ':', 'symbolDisplay="' + symbolDisplay + '", relatedDisplay="' + relatedDisplay + '", relatedClass="' + relatedClass + '"');

      // יצירת קישור לקובץ אם יש
      const fileLink = note.attachment ? createFileLink(note.attachment) : '';

      // עיצוב תאריך
      const createdAt = note.created_at ? new Date(note.created_at).toLocaleDateString('he-IL') : 'לא מוגדר';

      return `
        <tr>
          <td><strong>${symbolDisplay}</strong></td>
          <td style="padding: 0;">
            <div class="related-object-cell ${relatedClass}" style="justify-content: flex-start; text-align: right;">
              ${relatedIcon} ${relatedDisplay}
            </div>
          </td>
          <td title="${formatContentForDisplay(note.content)}">${formatContentForDisplay(note.content)}</td>
          <td>${fileLink}</td>
          <td>${createdAt}</td>
          <td class="actions-cell">
            <button class="btn btn-sm btn-secondary" onclick="editNote('${note.id}')" title="ערוך">✏️</button>
            <button class="btn btn-sm btn-danger" onclick="deleteNote('${note.id}')" title="מחק">✕</button>
          </td>
        </tr>
      `;
    });

    // עדכון הטבלה
    tbody.innerHTML = rows.join('');

    console.log('✅ עדכון טבלת הערות הושלם');

    // עדכון סטטיסטיקות אם הפונקציה זמינה
    if (typeof window.updateTableStats === 'function') {
      window.updateTableStats(notes.length);
    }

  } catch (error) {
    console.error('Error updating notes table:', error);
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">שגיאה בטעינת נתונים</td></tr>';
  }
}

/**
 * עיצוב תוכן להצגה בטבלה
 * 
 * פונקציה זו מסירה תגיות HTML ומגבילה את התוכן ל-50 תווים
 * לצורך הצגה נקייה בטבלה
 * 
 * @param {string} content - תוכן HTML
 * @returns {string} תוכן מעוצב להצגה
 */
function formatContentForDisplay(content) {
  if (!content) return '';

  // הסרת תגיות HTML
  const textContent = content.replace(/<[^>]*>/g, '');

  // הגבלה ל-50 תווים
  return textContent.length > 50 ? textContent.substring(0, 50) + '...' : textContent;
}

/**
 * יצירת קישור לקובץ מצורף
 * 
 * פונקציה זו יוצרת קישור לקובץ מצורף עם אייקון מתאים
 * מציגה רק את 12 התווים הראשונים של שם הקובץ
 * 
 * @param {string} filename - שם הקובץ
 * @returns {string} HTML של הקישור
 */
function createFileLink(filename) {
  if (!filename) return '';

  // קביעת אייקון לפי סיומת הקובץ
  const fileIcon = getFileIcon(filename);

  // הצגת 12 תווים ראשונים בלבד
  const displayName = filename.length > 12 ? filename.substring(0, 12) + '...' : filename;

  return `<a href="/uploads/notes/${filename}" target="_blank" class="file-link" title="${filename}">${fileIcon} ${displayName}</a>`;
}

/**
 * קביעת אייקון קובץ לפי סיומת
 * 
 * @param {string} filename - שם הקובץ
 * @returns {string} אייקון מתאים
 */
function getFileIcon(filename) {
  if (!filename) return '📄';

  const extension = filename.split('.').pop().toLowerCase();

  switch (extension) {
    case 'pdf': return '📄';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif': return '🖼️';
    case 'doc':
    case 'docx': return '📝';
    case 'xls':
    case 'xlsx': return '📊';
    default: return '📄';
  }
}

/**
 * פונקציות נוספות
 */

/**
 * הצגת מודל הוספת הערה
 * 
 * פונקציה זו פותחת את המודל להוספת הערה חדשה
 * כולל הגדרת z-index גבוה כדי להבטיח שהמודל מופיע מעל כל התוכן
 * וטעינת נתונים לאובייקטים מקושרים
 * 
 * תכונות:
 * - הגדרת z-index גבוה (99999) למודל
 * - ניקוי שדות הטופס
 * - הגדרת ברירת מחדל לטרייד
 * - טעינת event listeners לרדיו באטונים
 */
function showAddNoteModal() {
  console.log('🔍 showAddNoteModal called');
  const modal = document.getElementById('addNoteModal');
  console.log('🔍 Modal element:', modal);
  console.log('🔍 Modal style:', modal ? modal.style : 'No modal');
  console.log('🔍 Modal computed style:', modal ? window.getComputedStyle(modal) : 'No modal');

  if (modal) {
    console.log('🔍 Modal found, showing...');
    try {
      // הגדרת z-index גבוה מאוד
      modal.style.zIndex = '99999';

      const bootstrapModal = new bootstrap.Modal(modal);
      console.log('🔍 Bootstrap modal object:', bootstrapModal);
      bootstrapModal.show();
      console.log('🔍 Modal should be visible now');

      // וידוא שהמודל מופיע מעל הכל
      setTimeout(() => {
        modal.style.zIndex = '99999';
        const dialog = modal.querySelector('.modal-dialog');
        if (dialog) {
          dialog.style.zIndex = '100000';
        }
        const content = modal.querySelector('.modal-content');
        if (content) {
          content.style.zIndex = '100001';
        }
        console.log('🔍 Modal display after show:', window.getComputedStyle(modal).display);
        console.log('🔍 Modal z-index after show:', window.getComputedStyle(modal).zIndex);
        console.log('🔍 Modal visibility after show:', window.getComputedStyle(modal).visibility);
      }, 100);

      // ניקוי השדות
      document.getElementById('noteContent').value = '';
      document.getElementById('noteContentEditor').innerHTML = '';
      document.getElementById('noteAttachment').value = '';

      // ניקוי בחירת אובייקט מקושר
      const unifiedSelect = document.getElementById('noteRelatedObjectSelect');
      if (unifiedSelect) {
        unifiedSelect.innerHTML = '<option value="">בחר אובייקט...</option>';
      }

      // הגדרת ברירת מחדל לטרייד
      const tradeRadio = document.getElementById('relatedTrade');
      if (tradeRadio) {
        tradeRadio.checked = true;
        console.log('🔍 Trade radio checked, calling setupRadioButtonListeners');
        setupRadioButtonListeners();
      } else {
        console.error('❌ Trade radio not found');
      }
    } catch (error) {
      console.error('❌ Error showing modal:', error);
    }
  } else {
    console.error('❌ Modal not found!');
  }
}

/**
 * הגדרת event listeners לרדיו באטונים
 * 
 * פונקציה זו מגדירה event listeners לכל הרדיו באטונים במודל
 * כרגע מתמקדת רק בטיקרים לצורך פישוט
 */
function setupRadioButtonListeners() {
  console.log('🔍 setupRadioButtonListeners called');

  // נתמקד רק בטיקרים
  setupTickerRadioListener();
}

/**
 * הגדרת event listener לטיקרים בלבד
 * 
 * פונקציה זו מוסיפה event listener לרדיו באטון של טיקרים
 * כשהמשתמש בוחר בטיקר, הפונקציה טוענת את רשימת הטיקרים הפעילים
 * 
 * @async
 */
async function setupTickerRadioListener() {
  console.log('🔍 setupTickerRadioListener called');

  const tickerRadio = document.getElementById('noteRelationTicker');
  console.log('🔍 Looking for ticker radio:', tickerRadio);

  if (tickerRadio) {
    console.log('🔍 Found ticker radio, adding listener');

    tickerRadio.addEventListener('change', async function () {
      console.log('🔍 Ticker radio changed!');

      if (this.checked) {
        console.log('🔍 Ticker radio is checked, loading tickers');
        await loadTickersForSelect();
      }
    });
  } else {
    console.error('❌ Ticker radio not found!');
  }
}

/**
 * טעינת טיקרים לסלקט
 * 
 * פונקציה זו טוענת את כל הטיקרים מהשרת ומסננת רק טיקרים פעילים
 * ממלאת את הסלקט עם הטיקרים הזמינים
 * 
 * @async
 */
async function loadTickersForSelect() {
  console.log('🔍 loadTickersForSelect called');

  try {
    const response = await fetch('/api/tickers');
    const data = await response.json();
    const tickers = data.data || data;

    console.log(`🔍 Loaded ${tickers.length} tickers from server`);

    // סינון רק טיקרים פעילים
    const activeTickers = tickers.filter(ticker => ticker.status === 'active');
    console.log(`🔍 Filtered to ${activeTickers.length} active tickers`);

    // מילוי הסלקט
    const select = document.getElementById('noteRelatedObjectSelect');
    if (select) {
      console.log('🔍 Found select element, populating');

      select.innerHTML = '<option value="">בחר טיקר...</option>';

      activeTickers.forEach(ticker => {
        const option = document.createElement('option');
        option.value = ticker.id;
        option.textContent = ticker.symbol;
        select.appendChild(option);
      });

      console.log(`🔍 Added ${activeTickers.length} ticker options to select`);
    } else {
      console.error('❌ Select element not found!');
    }

  } catch (error) {
    console.error('❌ Error loading tickers:', error);
  }
}

/**
 * טעינת נתונים למודל הערות
 */
async function loadModalDataForNotes() {
  console.log('🔍 loadModalDataForNotes called');
  try {
    console.log('🔄 טוען נתונים למודל הערות...');

    // טעינת נתונים במקביל
    const [accountsResponse, tradesResponse, tradePlansResponse, tickersResponse] = await Promise.all([
      fetch('/api/v1/accounts/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/trades').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/v1/trade_plans/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/tickers').then(r => r.json()).catch(() => ({ data: [] }))
    ]);

    const accounts = accountsResponse.data || accountsResponse || [];
    const trades = tradesResponse.data || tradesResponse || [];
    const tradePlans = tradePlansResponse.data || tradePlansResponse || [];
    const tickers = tickersResponse.data || tickersResponse || [];

    console.log(`✅ נטענו ${accounts.length} חשבונות, ${trades.length} טריידים, ${tradePlans.length} תוכניות, ${tickers.length} טיקרים`);

    // עדכון רדיו באטונים
    console.log('🔍 Calling updateRadioButtonsForNotes');
    updateRadioButtonsForNotes(accounts, trades, tradePlans, tickers);
  } catch (error) {
    console.error('שגיאה בטעינת נתונים למודל הערות:', error);
    // המשך עם מערכים ריקים
    updateRadioButtonsForNotes([], [], [], []);
  }
}

/**
 * עדכון רדיו באטונים למודל הערות
 */
function updateRadioButtonsForNotes(accounts, trades, tradePlans, tickers) {
  console.log('🔍 updateRadioButtonsForNotes called');

  // סינון נתונים לפי סטטוס
  const openAccounts = accounts.filter(item => item.status === 'open');
  const openTrades = trades.filter(item => item.status === 'open');
  const openTradePlans = tradePlans.filter(item => item.status === 'open');
  const activeTickers = tickers.filter(item => item.status === 'active');

  console.log(`🔍 Filtered: ${openAccounts.length} open accounts, ${openTrades.length} open trades, ${openTradePlans.length} open plans, ${activeTickers.length} active tickers`);

  // עדכון רדיו באטון לחשבונות
  const accountRadio = document.getElementById('relatedAccount');
  console.log('🔍 Looking for account radio:', accountRadio);
  if (accountRadio) {
    console.log('🔍 Adding listener to account radio');
    accountRadio.addEventListener('change', () => {
      console.log('🔍 Account radio changed');
      populateSelectForNotes('noteRelatedObjectSelect', openAccounts, 'name', 'חשבון');
    });
  } else {
    console.error('❌ Account radio not found');
  }

  // עדכון רדיו באטון לטריידים
  const tradeRadio = document.getElementById('relatedTrade');
  console.log('🔍 Looking for trade radio:', tradeRadio);
  if (tradeRadio) {
    console.log('🔍 Adding listener to trade radio');
    tradeRadio.addEventListener('change', () => {
      console.log('🔍 Trade radio changed');
      populateSelectForNotes('noteRelatedObjectSelect', openTrades, 'id', 'טרייד');
    });
  } else {
    console.error('❌ Trade radio not found');
  }

  // עדכון רדיו באטון לתכנונים
  const planRadio = document.getElementById('relatedTradePlan');
  console.log('🔍 Looking for plan radio:', planRadio);
  if (planRadio) {
    console.log('🔍 Adding listener to plan radio');
    planRadio.addEventListener('change', () => {
      console.log('🔍 Plan radio changed');
      populateSelectForNotes('noteRelatedObjectSelect', openTradePlans, 'id', 'תכנון');
    });
  } else {
    console.error('❌ Plan radio not found');
  }

  // עדכון רדיו באטון לטיקרים
  const tickerRadio = document.getElementById('relatedTicker');
  console.log('🔍 Looking for ticker radio:', tickerRadio);
  if (tickerRadio) {
    console.log('🔍 Adding listener to ticker radio');
    tickerRadio.addEventListener('change', () => {
      console.log('🔍 Ticker radio changed');
      populateSelectForNotes('noteRelatedObjectSelect', activeTickers, 'symbol', '');
    });
  } else {
    console.error('❌ Ticker radio not found');
  }
}

/**
 * מילוי select עם נתונים למודל הערות
 */
function populateSelectForNotes(selectId, data, field, prefix = '') {
  const select = document.getElementById(selectId);
  if (!select) {
    console.error('❌ Select element not found:', selectId);
    return;
  }

  console.log(`🔄 מילוי ${selectId} עם ${data.length} פריטים מסוג ${prefix}`);
  if (data.length > 0) {
    console.log('📋 דוגמה לפריט ראשון:', data[0]);
  }

  select.innerHTML = '<option value="">בחר אובייקט לשיוך...</option>';

  data.forEach(item => {
    const option = document.createElement('option');
    option.value = item.id;

    // יצירת טקסט מותאם לכל סוג אובייקט
    let displayText = '';

    if (prefix === 'חשבון') {
      // עבור חשבון: שם החשבון
      const name = item.name || item.account_name || 'לא מוגדר';
      displayText = name;
    } else if (prefix === 'טרייד') {
      // עבור טרייד: סימבול + צד + סוג + תאריך
      const symbol = item.symbol || item.ticker_symbol || item.ticker?.symbol || 'לא מוגדר';
      const side = item.side === 'buy' ? 'קנייה' : item.side === 'sell' ? 'מכירה' : item.side;
      const type = item.type === 'swing' ? 'סווינג' : item.type === 'investment' ? 'השקעה' : item.type;
      const date = item.created_at || item.opened_at || item.date;
      const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
      displayText = `${symbol},${side},${type},${formattedDate}-${item.id}`;
    } else if (prefix === 'תכנון') {
      // עבור תכנון: סימבול + תאריך
      const symbol = item.symbol || item.ticker_symbol || item.ticker?.symbol || 'לא מוגדר';
      const date = item.created_at || item.opened_at || item.date;
      const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
      displayText = `${symbol},${formattedDate}-${item.id}`;
    } else {
      // עבור טיקר: רק סימבול
      displayText = item[field] || item.symbol || 'לא מוגדר';
    }

    option.textContent = displayText;
    select.appendChild(option);
  });

  console.log(`✅ הוספנו ${data.length} אופציות ל-${selectId}`);
}

/**
 * פונקציה לפתיחת מודל עריכת הערה
 */
function editNote(noteId) {
  console.log('🔍 editNote called with ID:', noteId);
  const modal = document.getElementById('editNoteModal');
  console.log('🔍 Edit modal element:', modal);
  console.log('🔍 Edit modal style:', modal ? modal.style : 'No modal');
  console.log('🔍 Edit modal computed style:', modal ? window.getComputedStyle(modal) : 'No modal');

  if (modal) {
    console.log('🔍 Edit modal found, showing...');
    try {
      // הגדרת z-index גבוה מאוד
      modal.style.zIndex = '99999';

      const bootstrapModal = new bootstrap.Modal(modal);
      console.log('🔍 Bootstrap edit modal object:', bootstrapModal);
      bootstrapModal.show();
      console.log('🔍 Edit modal should be visible now');

      // וידוא שהמודל מופיע מעל הכל
      setTimeout(() => {
        modal.style.zIndex = '99999';
        const dialog = modal.querySelector('.modal-dialog');
        if (dialog) {
          dialog.style.zIndex = '100000';
        }
        const content = modal.querySelector('.modal-content');
        if (content) {
          content.style.zIndex = '100001';
        }
        console.log('🔍 Edit modal display after show:', window.getComputedStyle(modal).display);
        console.log('🔍 Edit modal z-index after show:', window.getComputedStyle(modal).zIndex);
        console.log('🔍 Edit modal visibility after show:', window.getComputedStyle(modal).visibility);
      }, 100);

      // טעינת נתוני ההערה
      loadNoteDataForEdit(noteId);
    } catch (error) {
      console.error('❌ Error showing edit modal:', error);
    }
  } else {
    console.error('❌ Edit modal not found!');
  }
}

/**
 * פונקציה לטעינת נתוני הערה לעריכה
 */
async function loadNoteDataForEdit(noteId) {
  console.log('🔍 loadNoteDataForEdit called with ID:', noteId);

  try {
    // טעינת נתוני ההערה מהשרת
    const response = await fetch(`/api/notes/${noteId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const note = await response.json();
    console.log('🔍 Note data loaded:', note);

    // מילוי שדות הטופס
    document.getElementById('editNoteContentEditor').innerHTML = note.content || '';
    document.getElementById('editNoteId').value = note.id;

    // בחירת הרדיו באטון הנכון
    const relatedTypeId = note.related_type_id;
    let selectedRadio = null;

    switch (relatedTypeId) {
      case 1: // חשבון
        selectedRadio = document.getElementById('editNoteRelationAccount');
        break;
      case 2: // טרייד
        selectedRadio = document.getElementById('editNoteRelationTrade');
        break;
      case 3: // תכנון
        selectedRadio = document.getElementById('editNoteRelationPlan');
        break;
      case 4: // טיקר
        selectedRadio = document.getElementById('editNoteRelationTicker');
        break;
    }

    if (selectedRadio) {
      selectedRadio.checked = true;
      console.log('🔍 Selected radio button:', selectedRadio.id);

      // טעינת האובייקטים המקושרים לסלקט
      await loadRelatedObjectsForEdit(relatedTypeId, note.related_id);
    }

  } catch (error) {
    console.error('❌ Error loading note data for edit:', error);

    // הצגת הודעת שגיאה
    if (typeof showErrorNotification === 'function') {
      showErrorNotification('שגיאה בטעינה', 'שגיאה בטעינת נתוני ההערה');
    } else {
      alert('שגיאה בטעינת נתוני ההערה');
    }
  }
}

/**
 * טעינת אובייקטים מקושרים למודל עריכה
 * 
 * פונקציה זו טוענת את האובייקטים המקושרים לסלקט במודל העריכה
 * ומבחרת את האובייקט הנכון
 * 
 * @param {number} relatedTypeId - סוג האובייקט המקושר
 * @param {string} selectedId - מזהה האובייקט הנבחר
 */
async function loadRelatedObjectsForEdit(relatedTypeId, selectedId) {
  console.log('🔍 loadRelatedObjectsForEdit called:', { relatedTypeId, selectedId });

  try {
    let objects = [];
    let endpoint = '';

    // טעינת האובייקטים לפי הסוג
    switch (relatedTypeId) {
      case 1: // חשבונות
        endpoint = '/api/v1/accounts/';
        break;
      case 2: // טריידים
        endpoint = '/api/trades';
        break;
      case 3: // תכנונים
        endpoint = '/api/v1/trade_plans/';
        break;
      case 4: // טיקרים
        endpoint = '/api/tickers';
        break;
    }

    if (endpoint) {
      const response = await fetch(endpoint);
      const data = await response.json();
      objects = data.data || data;

      // סינון לפי סטטוס
      if (relatedTypeId === 4) { // טיקרים - רק פעילים
        objects = objects.filter(obj => obj.status === 'active');
      } else { // אחרים - רק פתוחים
        objects = objects.filter(obj => obj.status === 'open');
      }

      // מילוי הסלקט
      const select = document.getElementById('editNoteRelatedObjectSelect');
      if (select) {
        select.innerHTML = '<option value="">בחר אובייקט...</option>';

        objects.forEach(obj => {
          const option = document.createElement('option');
          option.value = obj.id;

          // קביעת טקסט הצגה לפי סוג
          let displayText = '';
          switch (relatedTypeId) {
            case 1: // חשבון
              displayText = obj.name || `חשבון ${obj.id}`;
              break;
            case 2: // טרייד
              displayText = obj.symbol || `טרייד ${obj.id}`;
              break;
            case 3: // תכנון
              displayText = obj.symbol || `תכנון ${obj.id}`;
              break;
            case 4: // טיקר
              displayText = obj.symbol || `טיקר ${obj.id}`;
              break;
          }

          option.textContent = displayText;
          select.appendChild(option);
        });

        // בחירת האובייקט הנכון
        if (selectedId) {
          select.value = selectedId;
        }

        console.log(`🔍 Loaded ${objects.length} objects for edit`);
      }
    }

  } catch (error) {
    console.error('❌ Error loading related objects for edit:', error);
  }
}

/**
 * פונקציה למחיקת הערה
 * 
 * פונקציה זו מוחקת הערה מהשרת לאחר אישור המשתמש
 * כולל הצגת דיאלוג אישור ומחיקה מהטבלה
 * 
 * @param {string} noteId - מזהה ההערה למחיקה
 */
async function deleteNote(noteId) {
  console.log('🔍 deleteNote called with ID:', noteId);

  // אישור מחיקה
  if (!confirm('האם אתה בטוח שברצונך למחוק הערה זו?')) {
    console.log('🔍 Delete cancelled by user');
    return;
  }

  try {
    console.log('🔍 Deleting note from server...');

    // שליחת בקשת מחיקה לשרת
    const response = await fetch(`/api/notes/${noteId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ Note deleted successfully');

    // רענון הטבלה
    await loadNotesData();

    // הצגת הודעת הצלחה
    if (typeof showSuccessNotification === 'function') {
      showSuccessNotification('הערה נמחקה', 'ההערה נמחקה בהצלחה');
    } else {
      alert('הערה נמחקה בהצלחה');
    }

  } catch (error) {
    console.error('❌ Error deleting note:', error);

    // הצגת הודעת שגיאה
    if (typeof showErrorNotification === 'function') {
      showErrorNotification('שגיאה במחיקה', 'שגיאה במחיקת ההערה');
    } else {
      alert('שגיאה במחיקת ההערה');
    }
  }
}

/**
 * פונקציה לטעינת אובייקטים מקושרים למודל הוספה
 */
async function loadRelatedObjects(relatedTypeId) {
  const relatedIdSelect = document.getElementById('relatedId');
  relatedIdSelect.innerHTML = '<option value="">בחר אובייקט...</option>';

  if (!relatedTypeId) return;

  try {
    let data = [];
    let endpoint = '';

    switch (relatedTypeId) {
      case '1': // חשבונות
        endpoint = '/api/v1/accounts/';
        break;
      case '2': // טריידים
        endpoint = '/api/trades';
        break;
      case '3': // תכנונים
        endpoint = '/api/v1/trade_plans/';
        break;
      case '4': // טיקרים
        endpoint = '/api/tickers';
        break;
    }

    if (endpoint) {
      const response = await window.apiCall(endpoint);
      data = response.data || response;

      // סינון רק רשומות עם סטטוס פתוח
      const filteredData = data.filter(item => {
        if (relatedTypeId === '1') { // חשבונות
          return item.status === 'open';
        } else if (relatedTypeId === '2') { // טריידים
          return item.status === 'open';
        } else if (relatedTypeId === '3') { // תכנונים
          return item.status === 'open';
        } else if (relatedTypeId === '4') { // טיקרים
          return item.status === 'active';
        }
        return true;
      });

      filteredData.forEach(item => {
        let displayText = '';
        switch (relatedTypeId) {
          case '1': // חשבונות
            displayText = item.name;
            break;
          case '2': // טריידים
            displayText = `טרייד ${item.id}`;
            break;
          case '3': // תכנונים
            displayText = `תכנון ${item.id}`;
            break;
          case '4': // טיקרים
            displayText = item.symbol;
            break;
        }

        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = displayText;
        relatedIdSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('שגיאה בטעינת אובייקטים מקושרים:', error);
  }
}

/**
 * פונקציה לטעינת אובייקטים מקושרים למודל עריכה
 */
async function loadRelatedObjectsForEdit(relatedTypeId, selectedId) {
  const relatedIdSelect = document.getElementById('editRelatedId');
  relatedIdSelect.innerHTML = '<option value="">בחר אובייקט...</option>';

  if (!relatedTypeId) return;

  try {
    let data = [];
    let endpoint = '';

    switch (relatedTypeId) {
      case 1: // חשבונות
        endpoint = '/api/v1/accounts/';
        break;
      case 2: // טריידים
        endpoint = '/api/trades';
        break;
      case 3: // תכנונים
        endpoint = '/api/v1/trade_plans/';
        break;
      case 4: // טיקרים
        endpoint = '/api/tickers';
        break;
    }

    if (endpoint) {
      const response = await window.apiCall(endpoint);
      data = response.data || response;

      // סינון רק רשומות עם סטטוס פתוח
      const filteredData = data.filter(item => {
        if (relatedTypeId === 1) { // חשבונות
          return item.status === 'open';
        } else if (relatedTypeId === 2) { // טריידים
          return item.status === 'open';
        } else if (relatedTypeId === 3) { // תכנונים
          return item.status === 'open';
        } else if (relatedTypeId === 4) { // טיקרים
          return item.status === 'active';
        }
        return true;
      });

      filteredData.forEach(item => {
        let displayText = '';
        switch (relatedTypeId) {
          case 1: // חשבונות
            displayText = item.name;
            break;
          case 2: // טריידים
            displayText = `טרייד ${item.id}`;
            break;
          case 3: // תכנונים
            displayText = `תכנון ${item.id}`;
            break;
          case 4: // טיקרים
            displayText = item.symbol;
            break;
        }

        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = displayText;
        if (item.id == selectedId) {
          option.selected = true;
        }
        relatedIdSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('שגיאה בטעינת אובייקטים מקושרים:', error);
  }
}

/**
 * פונקציה לטעינת אובייקטים מקושרים למודל עריכה (עבור המודל הקיים)
 */
async function loadEditRelatedObjects(relationType, selectedId) {
  try {
    let data = [];
    let endpoint = '';
    let selectId = '';

    switch (relationType) {
      case 'trade_plan':
        endpoint = '/api/v1/trade_plans/';
        selectId = 'editNoteTradePlanId';
        break;
      case 'trade':
        endpoint = '/api/trades';
        selectId = 'editNoteTradeId';
        break;
      case 'account':
        endpoint = '/api/v1/accounts/';
        selectId = 'editNoteAccountId';
        break;
    }

    if (endpoint && selectId) {
      const response = await window.apiCall(endpoint);
      data = response.data || response;

      const select = document.getElementById(selectId);
      if (select) {
        select.style.display = 'block';
        select.innerHTML = '<option value="">בחר...</option>';

        data.forEach(item => {
          let displayText = '';
          switch (relationType) {
            case 'trade_plan':
              displayText = `תכנון ${item.id}`;
              break;
            case 'trade':
              displayText = `טרייד ${item.id}`;
              break;
            case 'account':
              displayText = item.name;
              break;
          }

          const option = document.createElement('option');
          option.value = item.id;
          option.textContent = displayText;
          if (item.id == selectedId) {
            option.selected = true;
          }
          select.appendChild(option);
        });
      }
    }
  } catch (error) {
    console.error('שגיאה בטעינת אובייקטים מקושרים:', error);
  }
}

/**
 * שמירת הערה חדשה
 * 
 * פונקציה זו שומרת הערה חדשה לשרת
 * כולל תוכן, אובייקט מקושר וקובץ מצורף
 * 
 * @returns {Promise<Object>} תגובה מהשרת
 */
async function saveNote() {
  console.log('🔍 saveNote called');

  // קבלת ערכי הטופס
  const content = document.getElementById('noteContentEditor').innerHTML;
  const attachment = document.getElementById('noteAttachment').files[0];

  // קבלת סוג האובייקט המקושר
  let relatedTypeId = null;
  const accountRadio = document.getElementById('noteRelationAccount');
  const tradeRadio = document.getElementById('noteRelationTrade');
  const planRadio = document.getElementById('noteRelationPlan');
  const tickerRadio = document.getElementById('noteRelationTicker');

  if (accountRadio && accountRadio.checked) relatedTypeId = 1;
  else if (tradeRadio && tradeRadio.checked) relatedTypeId = 2;
  else if (planRadio && planRadio.checked) relatedTypeId = 3;
  else if (tickerRadio && tickerRadio.checked) relatedTypeId = 4;

  // קבלת מזהה האובייקט המקושר
  const relatedId = document.getElementById('noteRelatedObjectSelect').value;

  console.log('🔍 Form data:', { content, relatedTypeId, relatedId, attachment });

  // בדיקות תקינות
  if (!content || content.trim() === '') {
    alert('נא להזין תוכן להערה');
    return;
  }

  if (!relatedTypeId) {
    alert('נא לבחור סוג אובייקט מקושר');
    return;
  }

  if (!relatedId) {
    alert('נא לבחור אובייקט מקושר');
    return;
  }

  try {
    // יצירת FormData לשליחה
    const formData = new FormData();
    formData.append('content', content);
    formData.append('related_type_id', relatedTypeId);
    formData.append('related_id', relatedId);

    if (attachment) {
      formData.append('attachment', attachment);
    }

    console.log('🔍 Sending note data to server...');

    // שליחה לשרת
    const response = await fetch('/api/notes', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Note saved successfully:', result);

    // סגירת המודל
    const modal = bootstrap.Modal.getInstance(document.getElementById('addNoteModal'));
    if (modal) {
      modal.hide();
    }

    // רענון הטבלה
    await loadNotesData();

    // הצגת הודעת הצלחה
    if (typeof showSuccessNotification === 'function') {
      showSuccessNotification('הערה נשמרה', 'ההערה נשמרה בהצלחה');
    } else {
      alert('הערה נשמרה בהצלחה');
    }

  } catch (error) {
    console.error('❌ Error saving note:', error);

    // הצגת הודעת שגיאה
    if (typeof showErrorNotification === 'function') {
      showErrorNotification('שגיאה בשמירה', 'שגיאה בשמירת ההערה');
    } else {
      alert('שגיאה בשמירת ההערה');
    }
  }
}

/**
 * פונקציה לעדכון הערה
 */
async function updateNote() {
  const noteId = document.getElementById('editNoteId').value;
  const content = document.getElementById('editNoteContent').value;
  const relatedTypeId = document.getElementById('editRelatedType').value;
  const relatedId = document.getElementById('editRelatedId').value;
  const attachment = document.getElementById('editNoteAttachment').files[0];

  if (!content || !relatedTypeId || !relatedId) {
    alert('נא למלא את כל השדות הנדרשים');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('related_type_id', relatedTypeId);
    formData.append('related_id', relatedId);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    const response = await fetch(`/api/notes/${noteId}`, {
      method: 'PUT',
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      console.log('הערה עודכנה בהצלחה:', result);

      // סגירת המודל
      const modal = bootstrap.Modal.getInstance(document.getElementById('editNoteModal'));
      modal.hide();

      // רענון הטבלה
      loadNotesData();

      alert('הערה עודכנה בהצלחה!');
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('שגיאה בעדכון הערה:', error);
    alert('שגיאה בעדכון הערה');
  }
}

/**
 * פונקציה לעדכון הערה מהמודל הקיים
 */
async function updateNoteFromModal() {
  const noteId = document.getElementById('editNoteId').value;
  const content = document.getElementById('editNoteContent').value;
  const attachment = document.getElementById('editNoteAttachment').files[0];

  // קבלת סוג הקשר
  const selectedRelationType = document.querySelector('input[name="editNoteRelationType"]:checked');
  if (!selectedRelationType) {
    alert('נא לבחור סוג אובייקט מקושר');
    return;
  }

  let relatedTypeId = '';
  let relatedId = '';

  switch (selectedRelationType.value) {
    case 'trade_plan':
      relatedTypeId = '3';
      relatedId = document.getElementById('editNoteTradePlanId').value;
      break;
    case 'trade':
      relatedTypeId = '2';
      relatedId = document.getElementById('editNoteTradeId').value;
      break;
    case 'account':
      relatedTypeId = '1';
      relatedId = document.getElementById('editNoteAccountId').value;
      break;
  }

  if (!content || !relatedId) {
    alert('נא למלא את כל השדות הנדרשים');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('related_type_id', relatedTypeId);
    formData.append('related_id', relatedId);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    const response = await fetch(`/api/notes/${noteId}`, {
      method: 'PUT',
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      console.log('הערה עודכנה בהצלחה:', result);

      // סגירת המודל
      const modal = bootstrap.Modal.getInstance(document.getElementById('editNoteModal'));
      modal.hide();

      // רענון הטבלה
      loadNotesData();

      alert('הערה עודכנה בהצלחה!');
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('שגיאה בעדכון הערה:', error);
    alert('שגיאה בעדכון הערה');
  }
}

/**
 * פונקציה למחיקת הערה מהשרת
 */
async function deleteNoteFromServer(noteId) {
  try {
    const response = await fetch(`/api/v1/notes/${noteId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      console.log('הערה נמחקה בהצלחה');

      // רענון הטבלה
      loadNotesData();

      alert('הערה נמחקה בהצלחה!');
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('שגיאה במחיקת הערה:', error);
    alert('שגיאה במחיקת הערה');
  }
}

// הוספת הפונקציות לגלובל
window.loadNotesData = loadNotesData;
window.updateNotesTable = updateNotesTable;
window.editNote = editNote;
window.deleteNote = deleteNote;
window.showAddNoteModal = showAddNoteModal;
window.saveNote = saveNote;
window.updateNoteFromModal = updateNoteFromModal;

// פונקציה לפתיחת פרטי הערה (הוספת הערה)
function openNoteDetails(id) {
  console.log('פתיחת פרטי הערה:', id);
  // פתיחת מודל הוספת הערה
  if (typeof showAddNoteModal === 'function') {
    showAddNoteModal();
  } else {
    console.error('showAddNoteModal function not found');
  }
}

window.openNoteDetails = openNoteDetails;

/**
 * ========================================
 * פונקציות גלובליות לעורך טקסט מעוצב
 * ========================================
 */

/**
 * עיצוב טקסט בעורך
 * 
 * פונקציה זו מעצבת טקסט בעורך הטקסט המעוצב
 * תומכת בעיצובים שונים: מודגש, נטוי, קו תחתון, קו חוצה
 * כותרות, רשימות, קישורים, יישור טקסט וכיוון טקסט
 * 
 * @param {string} command - פקודת העיצוב
 * @param {string} value - ערך נוסף (לצבע, קישור וכו')
 */
function formatText(command, value = null) {
  const editor = document.getElementById('noteContentEditor');
  if (!editor) {
    console.error('Editor not found');
    return;
  }

  // שמירת המיקום הנוכחי
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);

  // ביצוע הפקודה
  document.execCommand(command, false, value);

  // החזרת המיקום
  selection.removeAllRanges();
  selection.addRange(range);

  // סנכרון עם שדה הטקסט הנסתר
  syncEditorContent();
}

/**
 * סנכרון תוכן העורך
 * 
 * פונקציה זו מסנכרנת את תוכן העורך המעוצב עם שדה הטקסט הנסתר
 * מבטיחה שהתוכן נשמר גם אם העורך לא עובד כראוי
 */
function syncEditorContent() {
  const editor = document.getElementById('noteContentEditor');
  const hiddenField = document.getElementById('noteContent');

  if (editor && hiddenField) {
    hiddenField.value = editor.innerHTML;
  }
}

/**
 * הגדרת צבע טקסט
 * 
 * פונקציה זו מגדירה צבע לטקסט הנבחר בעורך
 * 
 * @param {string} color - קוד הצבע (hex או שם)
 */
function setTextColor(color) {
  formatText('foreColor', color);
}

/**
 * ========================================
 * פונקציות גלובליות לניהול סקשנים
 * ========================================
 */

/**
 * פתיחה/סגירה של סקשן עליון
 * 
 * פונקציה זו פותחת או סוגרת את הסקשן העליון של הדף
 * שומרת את המצב ב-localStorage לצורך שמירת העדפות המשתמש
 */
function toggleTopSection() {
  const section = document.getElementById('notesTopSection');
  const button = document.querySelector('[onclick="toggleTopSection()"]');

  if (section && button) {
    const isHidden = section.style.display === 'none';
    section.style.display = isHidden ? 'block' : 'none';
    button.innerHTML = isHidden ? '▼ הסתר' : '▶ הצג';

    // שמירת המצב
    localStorage.setItem('notesTopSectionHidden', !isHidden);
  }
}

/**
 * פתיחה/סגירה של סקשן ראשי
 * 
 * פונקציה זו פותחת או סוגרת את הסקשן הראשי של הדף
 * שומרת את המצב ב-localStorage לצורך שמירת העדפות המשתמש
 */
function toggleMainSection() {
  const section = document.getElementById('notesMainSection');
  const button = document.querySelector('[onclick="toggleMainSection()"]');

  if (section && button) {
    const isHidden = section.style.display === 'none';
    section.style.display = isHidden ? 'block' : 'none';
    button.innerHTML = isHidden ? '▼ הסתר' : '▶ הצג';

    // שמירת המצב
    localStorage.setItem('notesMainSectionHidden', !isHidden);
  }
}

/**
 * שחזור מצב הסקשנים
 * 
 * פונקציה זו משחזרת את המצב השמור של הסקשנים
 * נקראת בטעינת הדף כדי לשמור על העדפות המשתמש
 */
function restoreNotesSectionState() {
  // שחזור סקשן עליון
  const topSectionHidden = localStorage.getItem('notesTopSectionHidden') === 'true';
  const topSection = document.getElementById('notesTopSection');
  const topButton = document.querySelector('[onclick="toggleTopSection()"]');

  if (topSection && topButton) {
    topSection.style.display = topSectionHidden ? 'none' : 'block';
    topButton.innerHTML = topSectionHidden ? '▶ הצג' : '▼ הסתר';
  }

  // שחזור סקשן ראשי
  const mainSectionHidden = localStorage.getItem('notesMainSectionHidden') === 'true';
  const mainSection = document.getElementById('notesMainSection');
  const mainButton = document.querySelector('[onclick="toggleMainSection()"]');

  if (mainSection && mainButton) {
    mainSection.style.display = mainSectionHidden ? 'none' : 'block';
    mainButton.innerHTML = mainSectionHidden ? '▶ הצג' : '▼ הסתר';
  }
}

// הגדרת הפונקציה updateGridFromComponent לדף ההערות
window.updateGridFromComponent = function (selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
  console.log('🔄 === UPDATE GRID FROM COMPONENT (notes) ===');
  console.log('🔄 Parameters:', { selectedStatuses, selectedTypes, selectedDateRange, searchTerm });

  // בדיקה שהפונקציה הגלובלית קיימת
  if (typeof window.updateGridFromComponentGlobal === 'function') {
    // קריאה לפונקציה הגלובלית
    window.updateGridFromComponentGlobal(selectedStatuses, selectedTypes, [], selectedDateRange, searchTerm, 'notes');
  } else {
    console.error('❌ window.updateGridFromComponentGlobal is not defined');
    // קריאה ישירה לפונקציית הטעינה
    if (typeof window.loadNotesData === 'function') {
      window.loadNotesData();
    }
  }
};

// בדיקת Bootstrap בטעינת הדף
document.addEventListener('DOMContentLoaded', function () {
  console.log('🔍 DOM loaded, checking Bootstrap...');
  console.log('🔍 Bootstrap object:', typeof bootstrap !== 'undefined' ? bootstrap : 'Not loaded');
  console.log('🔍 Bootstrap.Modal:', typeof bootstrap !== 'undefined' && bootstrap.Modal ? 'Available' : 'Not available');

  // בדיקת המודלים
  const addModal = document.getElementById('addNoteModal');
  const editModal = document.getElementById('editNoteModal');
  console.log('🔍 Add modal found:', !!addModal);
  console.log('🔍 Edit modal found:', !!editModal);

  if (addModal) {
    console.log('🔍 Add modal z-index:', window.getComputedStyle(addModal).zIndex);
    console.log('🔍 Add modal display:', window.getComputedStyle(addModal).display);
  }

  if (editModal) {
    console.log('🔍 Edit modal z-index:', window.getComputedStyle(editModal).zIndex);
    console.log('🔍 Edit modal display:', window.getComputedStyle(editModal).display);
  }
});

/**
 * ========================================
 * הגדרת פונקציות גלובליות
 * ========================================
 * 
 * הגדרת הפונקציות כגלובליות כדי שיהיו זמינות מה-HTML
 */

// הגדרת הפונקציה updateGridFromComponent לדף ההערות
window.updateGridFromComponent = function () {
  console.log('🔄 updateGridFromComponent called for notes page');

  // החלת פילטרים על הנתונים
  let filteredNotes = [...notesData];
  if (typeof window.filterDataByFilters === 'function') {
    console.log('🔄 Applying filters to notes data...');
    filteredNotes = window.filterDataByFilters(notesData, 'notes');
    console.log('🔄 After applying filters:', filteredNotes.length, 'notes');
  }

  // עדכון הטבלה עם הנתונים המסוננים
  updateNotesTable(filteredNotes);
};

// הגדרת פונקציות גלובליות לעורך טקסט
window.formatText = formatText;
window.syncEditorContent = syncEditorContent;
window.setTextColor = setTextColor;

// הגדרת פונקציות גלובליות לניהול סקשנים
window.toggleTopSection = toggleTopSection;
window.toggleMainSection = toggleMainSection;
window.restoreNotesSectionState = restoreNotesSectionState;

// הגדרת פונקציות גלובליות למודלים
window.showAddNoteModal = showAddNoteModal;
window.editNote = editNote;
window.deleteNote = deleteNote;
window.saveNote = saveNote;

/**
 * ========================================
 * אתחול הדף
 * ========================================
 * 
 * פונקציה זו מתבצעת בטעינת הדף ומאתחלת את כל הפונקציונליות
 */

// אתחול הדף כשהדף נטען
document.addEventListener('DOMContentLoaded', async function () {
  console.log('🚀 === אתחול דף הערות ===');

  try {
    // שחזור מצב הסקשנים
    restoreNotesSectionState();

    // טעינת נתוני הערות
    await loadNotesData();

    // הגדרת event listeners
    setupRadioButtonListeners();

    console.log('✅ אתחול דף הערות הושלם');

  } catch (error) {
    console.error('❌ Error initializing notes page:', error);
  }
});

console.log('📝 Notes page script loaded successfully');

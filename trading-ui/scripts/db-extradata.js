// DB Extra Data Page Script

// Global state
let tableData = {};
let currentTableType = null;

// ===== INITIALIZATION =====

/**
 * Initialize the database extra data display page
 */
async function initDatabaseExtraDisplay() {
  console.log('🔄 Initializing database extra data display page...');
  
  try {
    // Load all helper tables
    await loadAllExtraTables();
    
    console.log('✅ Database extra data display page initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database extra data display page:', error);
  }
}

/**
 * Load all extra tables data
 */
async function loadAllExtraTables() {
  console.log('🔄 Loading all extra tables...');
  const tables = ['currencies', 'users', 'note_relation_types', 'external_data'];
  
  for (const table of tables) {
    try {
      console.log(`📊 Loading ${table}...`);
      await loadExtraTableData(table);
    } catch (error) {
      console.error(`Error loading ${table}:`, error);
    }
  }
  console.log('✅ All extra tables loaded');
  
  // Update the main display with all table statistics as cards
  updateMainTableDisplay();
}

/**
 * Load data for a specific table type
 * @param {string} tableType - The table type to load
 */
async function loadExtraTableData(tableType) {
  try {
    console.log(`📊 Loading data for table type: ${tableType}`);

    // Fetch data from server
    const data = await fetchTableData(tableType);

    // Store data
    tableData[tableType] = data;

    // Store the data for this table type
    if (!window.dbExtraTableData) {
      window.dbExtraTableData = {};
    }
    window.dbExtraTableData[tableType] = data;

    // Update the specific table display
    updateTableDisplay(tableType, data);

    console.log(`✅ Data loaded for ${tableType}: ${data.length} records`);

  } catch (error) {
    console.error(`❌ Error loading data for ${tableType}:`, error);
    handleDataLoadError(error, tableType);
  }
}

/**
 * Fetch table data from server
 * @param {string} tableType - The table type to fetch
 * @returns {Promise<Array>} The fetched data
 */
async function fetchTableData(tableType) {
  try {
    // Map table types to correct API endpoints
    const apiEndpoints = {
      'currencies': '/api/currencies/',
      'users': '/api/users/',
      'note_relation_types': '/api/note_relation_types/',
      'external_data': '/api/external-data/status/providers'
    };
    
    const endpoint = apiEndpoints[tableType] || `/api/${tableType}/`;
    console.log(`🌐 Fetching data for ${tableType} from ${endpoint}`);
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`📥 Received response for ${tableType}:`, result);

    // Handle different response formats
    if (result.status === 'success') {
      return result.data || [];
    } else if (result.providers) {
      // External data providers endpoint returns { providers: [...] }
      return result.providers || [];
    } else if (Array.isArray(result)) {
      // Some endpoints return array directly
      return result;
    } else {
      throw new Error(result.message || 'Unknown error');
    }
  } catch (error) {
    console.error(`❌ Error fetching ${tableType} data:`, error);
    throw error;
  }
}

/**
 * Handle data load error
 * @param {Error} error - The error that occurred
 * @param {string} tableType - The table type that failed
 */
function handleDataLoadError(error, tableType) {
  console.error(`Error loading ${tableType}:`, error);
  
  // Store empty array for failed table
  if (!window.dbExtraTableData) {
    window.dbExtraTableData = {};
  }
  window.dbExtraTableData[tableType] = [];
}

// ===== DISPLAY FUNCTIONS =====

/**
 * Get dynamic color for entity type
 * @param {string} entityType - The entity type
 * @returns {string} The color value
 */
function getEntityColor(entityType) {
  // Fallback colors based on the system documentation
  const fallbackColors = {
    'currencies': '#ffd700',      // זהב - מטבעות
    'users': '#17a2b8',            // כחול טורקיז - משתמשים
    'note_relation_types': '#6f42c1',  // סגול - סוגי קשרים
    'external_data': '#20c997'     // ירוק טורקיז - נתונים חיצוניים
  };
  
  // Try to get color from CSS variables first
  try {
    const colorVar = `--${entityType}-color`;
    const computedStyle = getComputedStyle(document.documentElement);
    const color = computedStyle.getPropertyValue(colorVar).trim();
    
    if (color && color !== '') {
      return color;
    }
  } catch (error) {
    console.warn('Error getting CSS color for', entityType, error);
  }
  
  const normalizedType = entityType.toLowerCase().trim();
  return fallbackColors[normalizedType] || '#6c757d';
}

/**
 * Update the main display with all table statistics as cards
 */
function updateMainTableDisplay() {
  const container = document.getElementById('dbExtraCardsContainer');
  if (!container) return;
  
  // Clear existing content
  container.innerHTML = '';
  
  // Table names and their display names with icons
  const tableInfo = {
    'currencies': { 
      name: 'מטבעות', 
      icon: 'fas fa-coins',
      entityType: 'currencies'
    },
    'users': { 
      name: 'משתמשים', 
      icon: 'fas fa-users',
      entityType: 'users'
    },
    'note_relation_types': { 
      name: 'סוגי קשרים', 
      icon: 'fas fa-link',
      entityType: 'note_relation_types'
    },
    'external_data': { 
      name: 'נתונים חיצוניים', 
      icon: 'fas fa-cloud-download-alt',
      entityType: 'external_data'
    }
  };
  
  // Create cards for each table
  Object.keys(tableInfo).forEach(tableType => {
    const data = window.dbExtraTableData?.[tableType] || [];
    const info = tableInfo[tableType];
    
    // Calculate table size (rough estimate)
    const sizeEstimate = data.length * 100; // Rough estimate: 100 bytes per record
    const sizeText = sizeEstimate > 1024 ? `${(sizeEstimate / 1024).toFixed(1)} KB` : `${sizeEstimate} B`;
    
    // Get dynamic color for this entity type
    const entityColor = getEntityColor(info.entityType);
    
    // Create card element - 4 per row with icon on the right
    const cardCol = document.createElement('div');
    cardCol.className = 'col-lg-3 col-md-4 col-sm-6 col-12 mb-3';
    
    cardCol.innerHTML = `
      <div class="card h-100 border-0 shadow-sm">
        <div class="card-body p-3">
          <!-- Header row with title and export button -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="card-title mb-0" style="font-size: 0.9rem; font-weight: 600;">${info.name}</h6>
            <button class="btn btn-outline-secondary btn-sm" onclick="exportExtraTableData('${tableType}')" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;" title="ייצוא נתונים">
              <i class="fas fa-download"></i>
            </button>
          </div>
          
          <!-- Content row with stats and icon -->
          <div class="d-flex align-items-center">
            <!-- Stats on the left -->
            <div class="flex-grow-1">
              <div class="row text-center">
                <div class="col-6">
                  <div class="border-end">
                    <small class="text-muted d-block">רשומות</small>
                    <strong style="color: ${entityColor}; font-size: 1rem;">${data.length}</strong>
                  </div>
                </div>
                <div class="col-6">
                  <small class="text-muted d-block">גודל</small>
                  <small style="color: ${entityColor}; font-size: 0.8rem;">${sizeText}</small>
                </div>
              </div>
            </div>
            <!-- Icon on the right -->
            <div class="ms-3">
              <i class="${info.icon} fa-2x" style="color: ${entityColor};"></i>
            </div>
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(cardCol);
  });
}

/**
 * Update table display with full data
 * @param {string} tableType - The table type
 * @param {Array} data - The data to display
 */
function updateTableDisplay(tableType, data) {
  // Convert table type to camelCase for ID matching
  // note_relation_types -> noteRelationTypes, external_data -> externalData
  const camelCaseType = tableType.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  
  const tableId = `${camelCaseType}Table`;
  const headerId = `${camelCaseType}TableHeader`;
  const bodyId = `${camelCaseType}TableBody`;
  
  const table = document.getElementById(tableId);
  const header = document.getElementById(headerId);
  const body = document.getElementById(bodyId);
  
  if (!table || !header || !body) {
    console.warn(`Table elements not found for ${tableType}. Looking for IDs: ${tableId}, ${headerId}, ${bodyId}`);
    return;
  }
  
  // Clear existing content
  header.innerHTML = '';
  body.innerHTML = '';
  
  if (!data || data.length === 0) {
    body.innerHTML = '<tr><td colspan="100%" class="text-center text-muted">אין נתונים להצגה</td></tr>';
    return;
  }
  
  // Generate headers from first record
  const firstRecord = data[0];
  const columns = Object.keys(firstRecord);
  
  // Create header row
  columns.forEach(column => {
    const th = document.createElement('th');
    th.textContent = column;
    th.style.fontSize = '0.85rem';
    th.style.fontWeight = '600';
    th.style.whiteSpace = 'normal';
    th.style.wordWrap = 'break-word';
    th.style.maxWidth = '150px';
    th.style.verticalAlign = 'middle';
    header.appendChild(th);
  });
  
  // Create data rows
  data.forEach(record => {
    const row = document.createElement('tr');
    
    columns.forEach(column => {
      const td = document.createElement('td');
      const value = record[column];
      
      // Format the value
      if (value === null || value === undefined) {
        td.textContent = '-';
        td.className = 'text-muted';
      } else if (typeof value === 'boolean') {
        td.textContent = value ? 'כן' : 'לא';
        td.className = value ? 'text-success' : 'text-danger';
      } else if (typeof value === 'number') {
        td.textContent = value.toLocaleString();
        td.className = 'text-end';
      } else if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
        // Date formatting
        try {
          const date = new Date(value);
          td.textContent = date.toLocaleString('he-IL');
          td.className = 'text-muted';
        } catch (e) {
          td.textContent = value;
        }
      } else {
        td.textContent = value;
      }
      
      td.style.fontSize = '0.85rem';
      row.appendChild(td);
    });
    
    body.appendChild(row);
  });
  
  console.log(`✅ Table ${tableType} updated with ${data.length} records`);
}

/**
 * Export table data
 * @param {string} tableType - The table type to export
 */
function exportExtraTableData(tableType) {
  const data = window.dbExtraTableData?.[tableType] || [];
  if (data.length === 0) {
    alert('אין נתונים לייצוא');
    return;
  }
  
  // Convert to CSV
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(','))
  ].join('\n');
  
  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${tableType}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  
  console.log(`📥 Exported ${tableType} data`);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('➕ Database extra data page DOM loaded');
    initDatabaseExtraDisplay();
});

// ===== MISSING FUNCTIONS FOR ONCLICK ATTRIBUTES =====

// Toggle functions


// Sorting functions

// Trigger functions
function showTriggerDetails(triggerId) {
    if (typeof window.showTriggerDetails === 'function') {
        window.showTriggerDetails(triggerId);
    } else {
        console.warn('showTriggerDetails function not found');
        console.log('Trigger details for:', triggerId);
    }
}

function testTrigger(triggerId) {
    if (typeof window.testTrigger === 'function') {
        window.testTrigger(triggerId);
    } else {
        console.warn('testTrigger function not found');
        console.log('Testing trigger:', triggerId);
    }
}

/**
 * Generate detailed log for Database Extra Data
 */
function generateDetailedLog() {
    const timestamp = new Date().toLocaleString('he-IL');
    const log = [];

    log.push('=== לוג מפורט - טבלאות עזר ===');
    log.push(`זמן יצירה: ${timestamp}`);
    log.push(`עמוד: ${window.location.href}`);
    log.push('');

    // 1. מצב כללי של העמוד
    log.push('--- מצב כללי של העמוד ---');
    const sections = document.querySelectorAll('.content-section, .section');
    sections.forEach((section, index) => {
        const header = section.querySelector('.section-header, h2, h3');
        const body = section.querySelector('.section-body, .card-body');
        const isOpen = body && body.style.display !== 'none' && !section.classList.contains('collapsed');
        const title = header ? header.textContent.trim() : `סקשן ${index + 1}`;
        log.push(`  ${index + 1}. "${title}": ${isOpen ? 'פתוח' : 'סגור'}`);
    });

    // 2. טבלאות עזר
    log.push('');
    log.push('--- טבלאות עזר ---');
    const tables = document.querySelectorAll('.table, table');
    log.push(`מספר טבלאות: ${tables.length}`);
    tables.forEach((table, index) => {
        const rows = table.querySelectorAll('tbody tr');
        const caption = table.querySelector('caption')?.textContent.trim() || `טבלה ${index + 1}`;
        log.push(`  ${index + 1}. "${caption}": ${rows.length} שורות`);
    });

    // 3. טריגרים
    log.push('');
    log.push('--- טריגרים ---');
    const triggers = document.querySelectorAll('.trigger, [data-trigger]');
    log.push(`מספר טריגרים: ${triggers.length}`);
    triggers.forEach((trigger, index) => {
        const name = trigger.textContent.trim() || trigger.dataset.trigger || `טריגר ${index + 1}`;
        const visible = trigger.offsetParent !== null ? 'נראה' : 'לא נראה';
        log.push(`  ${index + 1}. "${name}" (${visible})`);
    });

    // 4. כפתורים וקונטרולים
    log.push('');
    log.push('--- כפתורים וקונטרולים ---');
    const buttonIds = [
        'showTriggerDetailsBtn', 'testTriggerBtn', 'refreshBtn', 'exportBtn'
    ];
    
    buttonIds.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            const visible = btn.offsetParent !== null ? 'נראה' : 'לא נראה';
            const disabled = btn.disabled ? 'מבוטל' : 'פעיל';
            const text = btn.textContent.trim() || btn.value || 'ללא טקסט';
            log.push(`${btnId}: ${visible} - ${disabled} - "${text}"`);
        }
    });

    // 5. מידע טכני
    log.push('');
    log.push('--- מידע טכני ---');
    log.push(`זמן יצירת הלוג: ${timestamp}`);
    log.push(`גרסת דפדפן: ${navigator.userAgent}`);
    log.push(`רזולוציה מסך: ${screen.width}x${screen.height}`);
    log.push(`גודל חלון: ${window.innerWidth}x${window.innerHeight}`);
    
    if (performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        log.push(`זמן טעינת עמוד: ${loadTime}ms`);
    }
    
    if (navigator.deviceMemory) {
        log.push(`זיכרון זמין: ${navigator.deviceMemory}GB`);
    }
    
    log.push(`שפת דפדפן: ${navigator.language}`);
    log.push(`פלטפורמה: ${navigator.platform}`);

    // 6. שגיאות והערות מהקונסולה
    log.push('');
    log.push('--- שגיאות והערות מהקונסולה ---');
    log.push('⚠️ חשוב: הלוג המפורט חייב לכלול שגיאות קונסולה לאבחון בעיות');
    log.push('📋 הוראות: פתח את Developer Tools (F12) > Console');
    log.push('📋 העתק את כל השגיאות וההערות מהקונסולה');
    log.push('📋 הוסף אותן ללוג המפורט לפני שליחה');

    log.push('');
    log.push('=== סוף לוג ===');
    return log.join('\n');
}

// Local copyDetailedLog function for db-extradata page
async function copyDetailedLog() {
    try {
        const detailedLog = await generateDetailedLog();
        if (detailedLog) {
            await navigator.clipboard.writeText(detailedLog);
            
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('לוג מפורט הועתק ללוח', 'הלוג מכיל את כל מה שרואה המשתמש בעמוד');
            } else if (typeof window.showNotification === 'function') {
                window.showNotification('לוג מפורט הועתק ללוח', 'success');
            } else {
                alert('לוג מפורט הועתק ללוח!');
            }
        }
    } catch (error) {
        console.error('שגיאה בהעתקת הלוג המפורט:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בהעתקת הלוג', error.message);
        } else {
            alert('שגיאה בהעתקת הלוג: ' + error.message);
        }
    }
}

// ===== GLOBAL EXPORTS =====
// Export functions to global scope for onclick attributes
window.initDatabaseExtraDisplay = initDatabaseExtraDisplay;
window.exportExtraTableData = exportExtraTableData;
window.showTriggerDetails = showTriggerDetails;
window.testTrigger = testTrigger;

// ===== קובץ סקריפט לדף תכנונים =====

// משתנים גלובליים למיון
let designsCurrentSortColumn = null;
let designsCurrentSortDirection = 'asc';

// מערך ריק לנתוני תכנונים - יטען מהשרת
let designsData = [];

// פונקציה לתרגום סוג לעברית
function getTypeDisplay(type) {
  const typeMap = {
    'swing': 'סווינג',
    'investment': 'השקעה',
    'passive': 'פאסיבי'
  };
  return typeMap[type] || type;
}

// פונקציה לטעינת נתוני תכנונים עם פילטרים
async function loadDesignsData() {
  try {
    console.log('🔄 טוען נתוני תכנונים מהשרת...');
    
    // טעינת נתונים מהשרת
    const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
    const response = await fetch(`${base}/api/v1/trade_plans/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🔄 נתונים שהתקבלו מהשרת:', data);
    console.log('🔄 סוג הנתונים:', typeof data);
    console.log('🔄 האם מערך:', Array.isArray(data));
    if (data && typeof data === 'object') {
      console.log('🔄 מפתחות האובייקט:', Object.keys(data));
    }
    
    // בדיקה שהנתונים הם מערך
    let plansData = data;
    if (!Array.isArray(plansData)) {
      console.error('🔄 הנתונים שהתקבלו אינם מערך:', typeof plansData);
      if (plansData && plansData.data && Array.isArray(plansData.data)) {
        console.log('🔄 נמצא מערך בתוך data.data');
        plansData = plansData.data;
      } else {
        throw new Error('הנתונים שהתקבלו מהשרת אינם בפורמט הנכון');
      }
    }
    
    // המרת הנתונים לפורמט הנדרש
    let designs = plansData.map(plan => {
      console.log('🔄 מעבד תכנון:', plan);
      return {
        id: plan.id,
        ticker: plan.ticker_symbol || 'N/A',
        created_at: plan.created_at, // שמירת התאריך המקורי לפילטרים ולהצגה
        type: plan.investment_type || 'swing',
        side: plan.side || 'Long',
        amount: plan.planned_amount || 0,
        target: plan.target_price || 0,
        stop: plan.stop_price || 0,
        current: 0, // יטען בנפרד אם נדרש
        status: plan.status || 'open'
      };
    });
    
    // עדכון המערך הגלובלי
    designsData = designs;
    
    console.log('🔄 מספר תכנונים שנטענו:', designs.length);
    
    if (designs.length === 0) {
      console.log('🔄 אין תכנונים להצגה');
      const tbody = document.querySelector('#designsTable tbody');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted">אין תכנונים להצגה</td></tr>';
      }
      return;
    }
    
    // שימוש בפונקציה הגלובלית לסינון
    if (typeof window.filterDataByFilters === 'function') {
      designs = window.filterDataByFilters(designs, 'planning');
    } else {
      console.error('filterDataByFilters function not found');
    }
        
    // עדכון הטבלה
    if (typeof window.updateDesignsTable === 'function') {
      window.updateDesignsTable(designs);
    } else {
      console.error('updateDesignsTable function not found');
    }
    
    console.log('🔄 טעינת תכנונים הושלמה בהצלחה');
      
  } catch (error) {
    console.error('❌ Error loading designs data:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // הצגת הודעת שגיאה מפורטת יותר
    const tbody = document.querySelector('#designsTable tbody');
    if (tbody) {
      // בדיקה אם זו שגיאה של פילטר תאריכים
      const savedDateRange = localStorage.getItem('designsFilterDateRange');
      if (savedDateRange && savedDateRange !== 'כל זמן') {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center text-info">
          <i class="fas fa-info-circle"></i> אין נתונים לפילטר "${savedDateRange}"
          <br><small>נסה לשנות את הפילטר או לרענן את הדף</small>
        </td></tr>`;
      } else {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center text-danger">
          <i class="fas fa-exclamation-triangle"></i> שגיאה בטעינת נתונים
          <br><small>פרטי השגיאה: ${error.message}</small>
          <br><button class="btn btn-sm btn-outline-primary mt-2" onclick="if (typeof window.loadDesignsData === 'function') { window.loadDesignsData(); } else { location.reload(); }">נסה שוב</button>
        </td></tr>`;
      }
    }
    
    // עדכון ספירת רשומות
    const countElement = document.querySelector('.content-section .table-count');
    if (countElement) {
      countElement.textContent = 'שגיאה';
    }
  }
}

// פונקציה לעדכון הטבלה
function updateDesignsTable(designs) {
  const tbody = document.querySelector('#designsTable tbody');
  if (!tbody) {
    console.error('Table body not found for designs table');
    return;
  }
  
  // בדיקה אם אין נתונים
  if (!designs || designs.length === 0) {
    const savedDateRange = localStorage.getItem('designsFilterDateRange');
    if (savedDateRange && savedDateRange !== 'כל זמן') {
      tbody.innerHTML = `<tr><td colspan="10" class="text-center text-info">
        <i class="fas fa-info-circle"></i> אין נתונים לפילטר "${savedDateRange}"
        <br><small>נסה לשנות את הפילטר או לרענן את הדף</small>
      </td></tr>`;
    } else {
      tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted">
        <i class="fas fa-inbox"></i> אין תכנונים להצגה
        <br><small>אין תכנונים במערכת או שכל התכנונים מסוננים החוצה</small>
      </td></tr>`;
    }
    
    // עדכון ספירת רשומות
    const countElement = document.querySelector('.content-section .table-count');
    if (countElement) {
      countElement.textContent = '0 תכנונים';
    }
    
    // עדכון סטטיסטיקות הטבלה
    if (typeof window.updateTableStats === 'function') {
      window.updateTableStats('planning');
    } else {
      console.error('updateTableStats function not found');
    }
    
    // עדכון שדות תצוגת טווח תאריכים
    if (typeof window.updateDateDebugInfo === 'function') {
      setTimeout(() => window.updateDateDebugInfo(), 100);
    }
    return;
  }
  
  const tableHTML = designs.map(design => `
    <tr>
      <td><strong><a href="#" onclick="if (typeof window.openDesignDetails === 'function') { window.openDesignDetails('${design.id}'); } else { console.error('openDesignDetails function not found'); }" class="ticker-link">${design.ticker}</a></strong></td>
      <td>${design.created_at ? new Date(design.created_at).toLocaleDateString('he-IL') : 'N/A'}</td>
      <td><span class="type-${design.type}">${typeof window.getTypeDisplay === 'function' ? window.getTypeDisplay(design.type) : design.type}</span></td>
      <td><span class="${(design.side || 'Long').toLowerCase() === 'long' ? 'side-long' : 'side-short'}">${design.side || 'Long'}</span></td>
      <td>$${design.amount.toLocaleString()}</td>
      <td>$${design.target.toFixed(2)}</td>
      <td>$${design.stop.toFixed(2)}</td>
      <td>$${design.current.toFixed(2)} (0.0%)</td>
              <td><span class="status-badge status-${design.status}">${design.status === 'cancelled' ? 'מבוטל' : design.status === 'closed' ? 'סגור' : 'פתוח'}</span></td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-secondary" onclick="if (typeof window.editDesign === 'function') { window.editDesign('${design.id}'); } else { console.error('editDesign function not found'); }" title="ערוך">
          <span class="btn-icon">✏️</span>
        </button>
        <button class="btn btn-sm btn-danger" onclick="if (typeof window.deleteDesign === 'function') { window.deleteDesign('${design.id}'); } else { console.error('deleteDesign function not found'); }" title="מחק">X</button>
      </td>
    </tr>
  `).join('');
  
  tbody.innerHTML = tableHTML;
  
  // עדכון ספירת רשומות
  const countElement = document.querySelector('.content-section .table-count');
  if (countElement) {
    countElement.textContent = `${designs.length} תכנונים`;
  }
  
  // עדכון סטטיסטיקות הטבלה
  if (typeof window.updateTableStats === 'function') {
    window.updateTableStats('planning');
  } else {
    console.error('updateTableStats function not found');
  }
  
  // עדכון שדות תצוגת טווח תאריכים
  if (typeof window.updateDateDebugInfo === 'function') {
    setTimeout(() => window.updateDateDebugInfo(), 100);
  }
}

// פונקציה למיון הטבלה - נבנה מחדש
function sortTable(columnIndex) {
  console.log('🔄 === SORT TABLE FUNCTION CALLED ===');
  console.log('🔄 Column clicked:', columnIndex);
  console.log('🔄 Current sort column:', designsCurrentSortColumn);
  console.log('🔄 Current sort direction:', designsCurrentSortDirection);
  
  // קבלת הנתונים הנוכחיים
  let designs = [...designsData];
  console.log('🔄 Original data:', designs.map(d => `${d.ticker}: ${d.amount}`));
  
  // החלת פילטרים קיימים
  if (typeof window.filterDataByFilters === 'function') {
    designs = window.filterDataByFilters(designs, 'planning');
  } else {
    console.error('filterDataByFilters function not found');
  }
  console.log('🔄 After filtering:', designs.map(d => `${d.ticker}: ${d.amount}`));
  
  // עדכון המשתנים הגלובליים
  if (designsCurrentSortColumn === columnIndex) {
    designsCurrentSortDirection = designsCurrentSortDirection === 'asc' ? 'desc' : 'asc';
    console.log('🔄 Same column clicked, direction changed to:', designsCurrentSortDirection);
  } else {
    designsCurrentSortColumn = columnIndex;
    designsCurrentSortDirection = 'asc';
    console.log('🔄 New column clicked, set to column:', columnIndex, 'direction: asc');
  }
  
  // מיון הנתונים
  designs.sort((a, b) => {
    let aValue, bValue;
    
    switch (columnIndex) {
      case 0: // נכס (Ticker)
        aValue = a.ticker.toLowerCase();
        bValue = b.ticker.toLowerCase();
        break;
      case 1: // תאריך
        aValue = parseDateForSort(a.created_at);
        bValue = parseDateForSort(b.created_at);
        break;
      case 2: // סוג
        aValue = a.type.toLowerCase();
        bValue = b.type.toLowerCase();
        break;
      case 3: // צד
        aValue = (a.side || 'Long').toLowerCase();
        bValue = (b.side || 'Long').toLowerCase();
        break;
      case 4: // סכום
        aValue = parseFloat(a.amount);
        bValue = parseFloat(b.amount);
        break;
      case 5: // יעד
        aValue = parseFloat(a.target);
        bValue = parseFloat(b.target);
        break;
      case 6: // סטופ
        aValue = parseFloat(a.stop);
        bValue = parseFloat(b.stop);
        break;
      case 7: // נוכחי
        aValue = parseFloat(a.current);
        bValue = parseFloat(b.current);
        break;
      case 8: // סטטוס
        aValue = getStatusForSort(a.status);
        bValue = getStatusForSort(b.status);
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) {
      return designsCurrentSortDirection === 'asc' ? -1 : 1;
    } else if (aValue > bValue) {
      return designsCurrentSortDirection === 'asc' ? 1 : -1;
    } else {
      return 0;
    }
  });
  
  console.log('🔄 Sorted data:', designs.map(d => `${d.ticker}: ${d.amount}`));
  
  // עדכון הטבלה
  if (typeof window.updateDesignsTable === 'function') {
    window.updateDesignsTable(designs);
  } else {
    console.error('updateDesignsTable function not found');
  }
  
  // עדכון אייקונים
  if (typeof window.updateSortIcons === 'function') {
    window.updateSortIcons(columnIndex);
  } else {
    console.error('updateSortIcons function not found');
  }
  
  // שמירת מצב המיון ב-localStorage
  localStorage.setItem('designsSortColumn', columnIndex.toString());
  localStorage.setItem('designsSortDirection', designsCurrentSortDirection);
  
  console.log('🔄 === SORT TABLE FUNCTION COMPLETED ===');
}

// פונקציה להמרת תאריך למיון
function parseDateForSort(dateStr) {
  if (!dateStr) return 0;
  
  // אם זה תאריך בפורמט YYYY-MM-DD HH:MM:SS
  if (dateStr.includes('-')) {
    return new Date(dateStr).getTime();
  }
  
  // אם זה תאריך בפורמט DD.MM.YYYY
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);
    return new Date(year, month, day).getTime();
  }
  
  return 0;
}

// פונקציה לקבלת ערך סטטוס למיון
function getStatusForSort(status) {
  switch (status) {
    case 'open': return 1;
    case 'closed': return 2;
    case 'cancelled': return 3;
    default: return 0;
  }
}

// פונקציה לעדכון אייקוני המיון
function updateSortIcons(activeColumnIndex) {
  console.log('🔄 Updating sort icons for column:', activeColumnIndex);
  const buttons = document.querySelectorAll('.sortable-header-btn');
  console.log('🔄 Found sortable header buttons:', buttons.length);
  
  buttons.forEach((button, index) => {
    const sortIcon = button.querySelector('.sort-icon');
    if (sortIcon) {
      if (index === activeColumnIndex) {
        const iconText = designsCurrentSortDirection === 'asc' ? '↑' : '↓';
        sortIcon.textContent = iconText;
        sortIcon.style.color = '#ff9c05';
        sortIcon.style.fontWeight = 'bold';
        console.log(`🔄 Updated button ${index} icon to: ${iconText}`);
      } else {
        sortIcon.textContent = '↕';
        sortIcon.style.color = '#666';
        sortIcon.style.fontWeight = 'normal';
      }
    }
  });
}

// פונקציה לאיפוס מיון
function resetSort() {
  console.log('🧪 === RESET SORT ===');
  designsCurrentSortColumn = null;
  designsCurrentSortDirection = 'asc';
  
  // מחיקת מצב מיון מ-localStorage
  localStorage.removeItem('designsSortColumn');
  localStorage.removeItem('designsSortDirection');
  
  // איפוס אייקונים
  if (typeof window.updateSortIcons === 'function') {
    window.updateSortIcons(-1);
  } else {
    console.error('updateSortIcons function not found');
  }
  
  // רענון הנתונים
  if (typeof window.loadDesignsData === 'function') {
    window.loadDesignsData();
  } else {
    console.error('loadDesignsData function not found');
  }
  
  if (typeof window.showNotification === 'function') {
    window.showNotification('מיון אופס', 'success');
  } else {
    console.error('showNotification function not found');
  }
}

// פונקציות מותאמות לעמוד תכנונים
function loadDesigns() {
  console.log('טעינת תכנונים');
  if (typeof window.loadDesignsData === 'function') {
    window.loadDesignsData();
  } else {
    console.error('loadDesignsData function not found');
  }
}

function filterDesignsData(statuses, types, accounts, dateRange, searchTerm) {
  console.log('פילטור תכנונים:', { statuses, types, accounts, dateRange, searchTerm });
  // קריאה לפונקציה הגלובלית עם pageName
  if (typeof window.updateGridFromComponentGlobal === 'function') {
    window.updateGridFromComponentGlobal(statuses, types, accounts, dateRange, searchTerm, 'planning');
  } else {
    console.error('updateGridFromComponentGlobal function not found');
  }
}

// פונקציות נוספות
function resetAllFiltersAndReloadData() {
  if (typeof window.resetAllFiltersForPage === 'function') {
    window.resetAllFiltersForPage('planning');
  } else {
    console.error('resetAllFiltersForPage function not found');
  }
  if (typeof window.showNotification === 'function') {
    window.showNotification('כל הפילטרים אופסו', 'success');
  } else {
    console.error('showNotification function not found');
  }
}

// פונקציה לרענון נתונים בלבד (לא מאפסת פילטרים)
function refreshDataOnly() {
  if (typeof window.loadDesignsData === 'function') {
    window.loadDesignsData();
  } else {
    console.error('loadDesignsData function not found');
  }
}

function toggleDesignsSectionLocal() {
  const section = document.querySelector('.section-body');
  const toggleBtn = document.querySelector('button[onclick="toggleDesignsSectionLocal()"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;
  
  if (section) {
    const isHidden = section.style.display === 'none';
    section.style.display = isHidden ? 'block' : 'none';
    
    // עדכון האייקון
    if (icon) {
      icon.textContent = isHidden ? '▲' : '▼';
    }
    
    // שמירת המצב ב-localStorage
    localStorage.setItem('designsSectionCollapsed', !isHidden);
  }
}

function toggleTopSection() {
  const section = document.querySelector('.top-section .section-body');
  const toggleBtn = document.querySelector('.top-section button[onclick="toggleTopSection()"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;
  
  if (section) {
    const isCollapsed = section.classList.contains('collapsed');
    
    if (isCollapsed) {
      section.classList.remove('collapsed');
      section.style.display = 'block';
    } else {
      section.classList.add('collapsed');
      section.style.display = 'none';
    }
    
    // עדכון האייקון
    if (icon) {
      icon.textContent = isCollapsed ? '▲' : '▼';
    }
    
    // שמירת המצב ב-localStorage
    localStorage.setItem('topSectionCollapsed', !isCollapsed);
  }
}

function toggleMainSection() {
  const section = document.querySelector('.content-section .section-body');
  const toggleBtn = document.querySelector('.content-section button[onclick="toggleMainSection()"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;
  
  if (section) {
    const isCollapsed = section.classList.contains('collapsed');
    
    if (isCollapsed) {
      section.classList.remove('collapsed');
      section.style.display = 'block';
    } else {
      section.classList.add('collapsed');
      section.style.display = 'none';
    }
    
    // עדכון האייקון
    if (icon) {
      icon.textContent = isCollapsed ? '▲' : '▼';
    }
    
    // שמירת המצב ב-localStorage
    localStorage.setItem('mainSectionCollapsed', !isCollapsed);
  }
}

// פונקציה לשחזור מצב הסגירה
function restoreDesignsSectionState() {
  // שחזור מצב top section
  const topSection = document.querySelector('.top-section .section-body');
  const topToggleBtn = document.querySelector('.top-section button[onclick="toggleTopSection()"]');
  const topIcon = topToggleBtn ? topToggleBtn.querySelector('.filter-icon') : null;
  
  if (topSection && topToggleBtn && topIcon) {
    const topCollapsed = localStorage.getItem('topSectionCollapsed') === 'true';
    if (topCollapsed) {
      topSection.classList.add('collapsed');
      topSection.style.display = 'none';
      topIcon.textContent = '▼';
    } else {
      topSection.classList.remove('collapsed');
      topSection.style.display = 'block';
      topIcon.textContent = '▲';
    }
  }
  
  // שחזור מצב main section
  const mainSection = document.querySelector('.content-section .section-body');
  const mainToggleBtn = document.querySelector('.content-section button[onclick="toggleMainSection()"]');
  const mainIcon = mainToggleBtn ? mainToggleBtn.querySelector('.filter-icon') : null;
  
  if (mainSection && mainToggleBtn && mainIcon) {
    const mainCollapsed = localStorage.getItem('mainSectionCollapsed') === 'true';
    if (mainCollapsed) {
      mainSection.classList.add('collapsed');
      mainSection.style.display = 'none';
      mainIcon.textContent = '▼';
    } else {
      mainSection.classList.remove('collapsed');
      mainSection.style.display = 'block';
      mainIcon.textContent = '▲';
    }
  }
}

// פונקציות מותאמות לעמוד תכנונים
function showAddTradePlanModal() {
  console.log('הצגת מודל הוספת תכנון');
  const modal = new bootstrap.Modal(document.getElementById('addTradePlanModal'));
  // קבע ברירת מחדל של היום לשדה התאריך
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  const dateInput = document.getElementById('addTradePlanDate');
  if (dateInput) dateInput.value = todayStr;
  modal.show();
}

function openDesignDetails(id) {
  console.log('פתיחת פרטי תכנון:', id);
  // כאן יוכנס קוד לפתיחת פרטי תכנון
}

function editDesign(id) {
  console.log('עריכת תכנון:', id);
  // כאן יוכנס קוד לעריכת תכנון
}

function deleteDesign(id) {
  console.log('מחיקת תכנון:', id);
  // כאן יוכנס קוד למחיקת תכנון
}

function openAddTradePlanModal() {
  console.log('פתיחת מודל הוספת תכנון');
  const modal = new bootstrap.Modal(document.getElementById('addTradePlanModal'));
  modal.show();
}

function saveNewTradePlan() {
  console.log('שמירת תכנון חדש');
  
  // קבלת הנתונים מהטופס
  const ticker = document.getElementById('addTradePlanTicker').value;
  const type = document.getElementById('addTradePlanType').value;
  const side = document.getElementById('addTradePlanSide').value;
  const amount = parseFloat(document.getElementById('addTradePlanAmount').value);
  const target = parseFloat(document.getElementById('addTradePlanTarget').value);
  const stop = parseFloat(document.getElementById('addTradePlanStop').value);
  const date = document.getElementById('addTradePlanDate').value;
  
  // בדיקת תקינות
  if (!ticker || !type || !side || !amount || !target || !stop || !date) {
    if (typeof window.showNotification === 'function') {
      window.showNotification('נא למלא את כל השדות', 'error');
    } else {
      console.error('showNotification function not found');
    }
    return;
  }
  
  // כאן יוכנס קוד לשמירה לשרת
  // לעת עתה נציג הודעה
  if (typeof window.showNotification === 'function') {
    window.showNotification('תכנון חדש נשמר בהצלחה!', 'success');
  } else {
    console.error('showNotification function not found');
  }
  
  // סגירת המודל
  const modal = bootstrap.Modal.getInstance(document.getElementById('addTradePlanModal'));
  modal.hide();
  
  // רענון הטבלה
  if (typeof window.loadDesignsData === 'function') {
    window.loadDesignsData();
  } else {
    console.error('loadDesignsData function not found');
  }
}

// הגדרת הפונקציות כגלובליות
window.openDesignDetails = openDesignDetails;
window.openAddTradePlanModal = openAddTradePlanModal;
window.saveNewTradePlan = saveNewTradePlan;
window.editDesign = editDesign;
window.deleteDesign = deleteDesign;
window.sortTable = sortTable;
window.updateDesignsTable = updateDesignsTable;
window.loadDesignsData = loadDesignsData;
window.getTypeDisplay = getTypeDisplay;
window.updateSortIcons = updateSortIcons;
window.resetSort = resetSort;
window.loadDesigns = loadDesigns;
window.filterDesignsData = filterDesignsData;
window.resetAllFiltersAndReloadData = resetAllFiltersAndReloadData;
window.refreshDataOnly = refreshDataOnly;
window.toggleDesignsSectionLocal = toggleDesignsSectionLocal;
window.toggleTopSection = toggleTopSection;
window.toggleMainSection = toggleMainSection;
window.restoreDesignsSectionState = restoreDesignsSectionState;
window.showAddTradePlanModal = showAddTradePlanModal;

// הגדרת הפונקציה הגלובלית לעדכון מהפילטרים
window.updateGridFromComponent = function(selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
  console.log('🔄 updateGridFromComponent called with:', {
    selectedStatuses,
    selectedTypes,
    selectedDateRange,
    searchTerm
  });
  
  // קריאה לפונקציה הגלובלית
  if (typeof window.updateGridFromComponentGlobal === 'function') {
    window.updateGridFromComponentGlobal(selectedStatuses, selectedTypes, [], selectedDateRange, searchTerm, 'designs');
  } else {
    console.error('updateGridFromComponentGlobal function not found');
  }
};

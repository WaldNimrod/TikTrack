// ===== קובץ JavaScript פשוט לדף עיצובים =====

// פונקציות בסיסיות
function openDesignDetails(id) {
  console.log('פתיחת פרטי עיצוב:', id);
}

function editDesign(id) {
  console.log('עריכת עיצוב:', id);
}

function deleteDesign(id) {
  console.log('מחיקת עיצוב:', id);
}

// פונקציות לפתיחה/סגירה של סקשנים
function toggleDesignsSection() {
  console.log('🔄 toggleDesignsSection נקראה');
  const contentSections = document.querySelectorAll('.content-section');
  console.log('📋 מספר content-sections נמצא:', contentSections.length);
  const designsSection = contentSections[0]; // הסקשן הראשון - עיצובים
  
  if (!designsSection) {
    console.error('❌ לא נמצא סקשן עיצובים');
    return;
  }
  console.log('✅ סקשן עיצובים נמצא:', designsSection);

  const sectionBody = designsSection.querySelector('.section-body');
  const toggleBtn = designsSection.querySelector('button[onclick="toggleDesignsSection()"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  if (sectionBody) {
    const isCollapsed = sectionBody.style.display === 'none';

    if (isCollapsed) {
      sectionBody.style.display = 'block';
    } else {
      sectionBody.style.display = 'none';
    }

    // עדכון האייקון
    if (icon) {
      icon.textContent = isCollapsed ? '▲' : '▼';
    }

    // שמירת המצב ב-localStorage
    localStorage.setItem('designsSectionCollapsed', !isCollapsed);
  }
}

function toggleAccountsSection() {
  const contentSections = document.querySelectorAll('.content-section');
  const accountsSection = contentSections[1]; // הסקשן השני - חשבונות

  if (!accountsSection) {
    console.error('❌ לא נמצא סקשן חשבונות');
    return;
  }

  const sectionBody = accountsSection.querySelector('.section-body');
  const toggleBtn = accountsSection.querySelector('button[onclick="toggleAccountsSection()"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  if (sectionBody) {
    const isCollapsed = sectionBody.style.display === 'none';

    if (isCollapsed) {
      sectionBody.style.display = 'block';
    } else {
      sectionBody.style.display = 'none';
    }

    // עדכון האייקון
    if (icon) {
      icon.textContent = isCollapsed ? '▲' : '▼';
    }

    // שמירת המצב ב-localStorage
    localStorage.setItem('accountsSectionCollapsed', !isCollapsed);
  }
}

// פונקציה לשחזור מצב הסגירה
function restoreDesignsSectionState() {
  // שחזור מצב סקשן העיצובים
  const designsCollapsed = localStorage.getItem('designsSectionCollapsed') === 'true';
  const contentSections = document.querySelectorAll('.content-section');
  const designsSection = contentSections[0];
  
  if (designsSection) {
    const sectionBody = designsSection.querySelector('.section-body');
    const toggleBtn = designsSection.querySelector('button[onclick="toggleDesignsSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody && designsCollapsed) {
      sectionBody.style.display = 'none';
      if (icon) {
        icon.textContent = '▼';
      }
    }
  }

  // שחזור מצב סקשן החשבונות
  const accountsCollapsed = localStorage.getItem('accountsSectionCollapsed') === 'true';
  const accountsSection = contentSections[1];
  
  if (accountsSection) {
    const sectionBody = accountsSection.querySelector('.section-body');
    const toggleBtn = accountsSection.querySelector('button[onclick="toggleAccountsSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody && accountsCollapsed) {
      sectionBody.style.display = 'none';
      if (icon) {
        icon.textContent = '▼';
      }
    }
  }
}

// פונקציות נוספות
function resetAllFiltersAndReloadData() {
  console.log('איפוס פילטרים');
}

// הגדרת הפונקציה updateGridFromComponent לדף העיצובים
window.updateGridFromComponent = function (selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
  console.log('🔄 updateGridFromComponent called for designs page with:', {
    selectedStatuses,
    selectedTypes,
    selectedDateRange,
    searchTerm
  });

  // קריאה לפונקציה הגלובלית אם זמינה
  if (typeof window.updateGridFromComponentGlobal === 'function') {
    window.updateGridFromComponentGlobal(selectedStatuses, selectedTypes, [], selectedDateRange, searchTerm, 'designs');
  } else {
    console.error('❌ updateGridFromComponentGlobal function not found');
    // ניסיון נוסף אחרי זמן קצר
    setTimeout(() => {
      if (typeof window.updateGridFromComponentGlobal === 'function') {
        console.log('🔄 Retrying updateGridFromComponentGlobal...');
        window.updateGridFromComponentGlobal(selectedStatuses, selectedTypes, [], selectedDateRange, searchTerm, 'designs');
      }
    }, 1000);
  }
};

// הגדרת הפונקציות כגלובליות
window.openDesignDetails = openDesignDetails;
window.editDesign = editDesign;
window.deleteDesign = deleteDesign;
window.toggleDesignsSection = toggleDesignsSection;
window.toggleAccountsSection = toggleAccountsSection;
window.restoreDesignsSectionState = restoreDesignsSectionState;
window.resetAllFiltersAndReloadData = resetAllFiltersAndReloadData;

// בדיקת זמינות פונקציות מיד אחרי הגדרתן
console.log('🔍 === DESIGNS.JS FUNCTIONS CHECK ===');
console.log('🔍 updateGridFromComponent available:', typeof window.updateGridFromComponent);
console.log('🔍 updateGridFromComponentGlobal available:', typeof window.updateGridFromComponentGlobal);
console.log('🔍 updateAccountFilterMenu available:', typeof window.updateAccountFilterMenu);

// ניקוי הודעות קונסולה אחרי זמן קצר
setTimeout(() => {
  console.log('🧹 Clearing console messages to reduce clutter...');
  if (console.clear) {
    console.clear();
  }
}, 3000);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.updateGridFromComponent === 'function') {
    console.log('✅ updateGridFromComponent is properly defined for designs page');
  } else {
    console.warn('⚠️ updateGridFromComponent still not available for designs page');
  }
}, 1500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.updateGridFromComponentGlobal === 'function') {
    console.log('✅ updateGridFromComponentGlobal is properly defined for designs page');
  } else {
    console.warn('⚠️ updateGridFromComponentGlobal still not available for designs page');
  }
}, 2500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.updateAccountFilterMenu === 'function') {
    console.log('✅ updateAccountFilterMenu is properly defined for designs page');
  } else {
    console.warn('⚠️ updateAccountFilterMenu still not available for designs page');
  }
}, 3500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.filterDataByFilters === 'function') {
    console.log('✅ filterDataByFilters is properly defined for designs page');
  } else {
    console.warn('⚠️ filterDataByFilters still not available for designs page');
  }
}, 4500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.getDateRange === 'function') {
    console.log('✅ getDateRange is properly defined for designs page');
  } else {
    console.warn('⚠️ getDateRange still not available for designs page');
  }
}, 5500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.getTableType === 'function') {
    console.log('✅ getTableType is properly defined for designs page');
  } else {
    console.warn('⚠️ getTableType still not available for designs page');
  }
}, 6500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.loadSavedFiltersForPage === 'function') {
    console.log('✅ loadSavedFiltersForPage is properly defined for designs page');
  } else {
    console.warn('⚠️ loadSavedFiltersForPage still not available for designs page');
  }
}, 7500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.resetAllFiltersForPage === 'function') {
    console.log('✅ resetAllFiltersForPage is properly defined for designs page');
  } else {
    console.warn('⚠️ resetAllFiltersForPage still not available for designs page');
  }
}, 8500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.initializePageFilters === 'function') {
    console.log('✅ initializePageFilters is properly defined for designs page');
  } else {
    console.warn('⚠️ initializePageFilters still not available for designs page');
  }
}, 9500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.showNotification === 'function') {
    console.log('✅ showNotification is properly defined for designs page');
  } else {
    console.warn('⚠️ showNotification still not available for designs page');
  }
}, 10500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.updateTableStats === 'function') {
    console.log('✅ updateTableStats is properly defined for designs page');
  } else {
    console.warn('⚠️ updateTableStats still not available for designs page');
  }
}, 11500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.updateAccountFilterMenu === 'function') {
    console.log('✅ updateAccountFilterMenu is properly defined for designs page');
  } else {
    console.warn('⚠️ updateAccountFilterMenu still not available for designs page');
  }
}, 12500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.updateTableStats === 'function') {
    console.log('✅ updateTableStats is properly defined for designs page');
  } else {
    console.warn('⚠️ updateTableStats still not available for designs page');
  }
}, 13500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.updateAccountFilterMenu === 'function') {
    console.log('✅ updateAccountFilterMenu is properly defined for designs page');
  } else {
    console.warn('⚠️ updateAccountFilterMenu still not available for designs page');
  }
}, 14500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.updateTableStats === 'function') {
    console.log('✅ updateTableStats is properly defined for designs page');
  } else {
    console.warn('⚠️ updateTableStats still not available for designs page');
  }
}, 15500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.updateAccountFilterMenu === 'function') {
    console.log('✅ updateAccountFilterMenu is properly defined for designs page');
  } else {
    console.warn('⚠️ updateAccountFilterMenu still not available for designs page');
  }
}, 16500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.updateTableStats === 'function') {
    console.log('✅ updateTableStats is properly defined for designs page');
  } else {
    console.warn('⚠️ updateTableStats still not available for designs page');
  }
}, 17500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.updateAccountFilterMenu === 'function') {
    console.log('✅ updateAccountFilterMenu is properly defined for designs page');
  } else {
    console.warn('⚠️ updateAccountFilterMenu still not available for designs page');
  }
}, 18500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.updateTableStats === 'function') {
    console.log('✅ updateTableStats is properly defined for designs page');
  } else {
    console.warn('⚠️ updateTableStats still not available for designs page');
  }
}, 19500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.updateAccountFilterMenu === 'function') {
    console.log('✅ updateAccountFilterMenu is properly defined for designs page');
  } else {
    console.warn('⚠️ updateAccountFilterMenu still not available for designs page');
  }
}, 20500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.updateTableStats === 'function') {
    console.log('✅ updateTableStats is properly defined for designs page');
  } else {
    console.warn('⚠️ updateTableStats still not available for designs page');
  }
}, 21500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.updateAccountFilterMenu === 'function') {
    console.log('✅ updateAccountFilterMenu is properly defined for designs page');
  } else {
    console.warn('⚠️ updateAccountFilterMenu still not available for designs page');
  }
}, 22500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.updateTableStats === 'function') {
    console.log('✅ updateTableStats is properly defined for designs page');
  } else {
    console.warn('⚠️ updateTableStats still not available for designs page');
  }
}, 23500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.updateAccountFilterMenu === 'function') {
    console.log('✅ updateAccountFilterMenu is properly defined for designs page');
  } else {
    console.warn('⚠️ updateAccountFilterMenu still not available for designs page');
  }
}, 24500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.updateTableStats === 'function') {
    console.log('✅ updateTableStats is properly defined for designs page');
  } else {
    console.warn('⚠️ updateTableStats still not available for designs page');
  }
}, 25500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.updateAccountFilterMenu === 'function') {
    console.log('✅ updateAccountFilterMenu is properly defined for designs page');
  } else {
    console.warn('⚠️ updateAccountFilterMenu still not available for designs page');
  }
}, 26500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.updateTableStats === 'function') {
    console.log('✅ updateTableStats is properly defined for designs page');
  } else {
    console.warn('⚠️ updateTableStats still not available for designs page');
  }
}, 27500);

// בדיקה נוספת אחרי זמן קצר יותר
setTimeout(() => {
  if (typeof window.updateAccountFilterMenu === 'function') {
    console.log('✅ updateAccountFilterMenu is properly defined for designs page');
  } else {
    console.warn('⚠️ updateAccountFilterMenu still not available for designs page');
  }
}, 28500);

// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
  console.log('🔄 === DOM CONTENT LOADED ===');
  
  // שחזור מצב הסגירה
  restoreDesignsSectionState();
  
  // בדיקת זמינות פונקציות גלובליות
  setTimeout(() => {
    console.log('🔍 === CHECKING GLOBAL FUNCTIONS (DESIGNS) ===');
    console.log('🔍 updateGridFromComponent available:', typeof window.updateGridFromComponent);
    console.log('🔍 updateGridFromComponentGlobal available:', typeof window.updateGridFromComponentGlobal);
    console.log('🔍 updateAccountFilterMenu available:', typeof window.updateAccountFilterMenu);
    
    if (typeof window.updateGridFromComponent === 'function') {
      console.log('✅ updateGridFromComponent is properly defined for designs page');
    } else {
      console.warn('⚠️ updateGridFromComponent not available for designs page');
    }
  }, 1000);
  
  console.log('דף עיצובים נטען בהצלחה');
  
  // ניקוי הודעות קונסולה אחרי זמן קצר
  setTimeout(() => {
    console.log('🧹 Clearing console messages to reduce clutter...');
    if (console.clear) {
      console.clear();
    }
  }, 5000);
  
  // בדיקה נוספת אחרי זמן קצר יותר
  setTimeout(() => {
    if (typeof window.updateGridFromComponent === 'function') {
      console.log('✅ updateGridFromComponent is properly defined for designs page');
    } else {
      console.warn('⚠️ updateGridFromComponent still not available for designs page');
    }
  }, 2000);
});

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

// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
  console.log('🔄 === DOM CONTENT LOADED ===');
  
  // שחזור מצב הסגירה
  restoreDesignsSectionState();
  
  console.log('דף עיצובים נטען בהצלחה');
});

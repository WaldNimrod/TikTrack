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
function toggleTopSection() {
  console.log('🔄 toggleTopSection נקראה');
  const topSection = document.querySelector('.top-section');
  
  if (!topSection) {
    console.error('❌ לא נמצא top-section');
    return;
  }
  
  const sectionBody = topSection.querySelector('.section-body');
  const toggleBtn = topSection.querySelector('button[onclick="toggleTopSection()"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;
  
  if (sectionBody) {
    const isCollapsed = sectionBody.style.display === 'none';
    sectionBody.style.display = isCollapsed ? 'block' : 'none';
    
    if (icon) {
      icon.textContent = isCollapsed ? '▲' : '▼';
    }
    
    // שמירת המצב ב-localStorage
    localStorage.setItem('topSectionCollapsed', !isCollapsed);
    
    console.log(`✅ top-section ${isCollapsed ? 'נפתח' : 'נסגר'}`);
  }
}

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
function restoreTopSectionState() {
  // שחזור מצב הסקשן העליון
  const topCollapsed = localStorage.getItem('topSectionCollapsed') === 'true';
  const topSection = document.querySelector('.top-section');
  
  if (topSection) {
    const sectionBody = topSection.querySelector('.section-body');
    const toggleBtn = topSection.querySelector('button[onclick="toggleTopSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;
    
    if (sectionBody && topCollapsed) {
      sectionBody.style.display = 'none';
      if (icon) {
        icon.textContent = '▼';
      }
    }
  }
}

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

// פונקציה לאתחול הדף
function initializeDesignsPage() {
  console.log('🔄 אתחול דף עיצובים...');
  
  // שחזור מצב הסגירה
  restoreTopSectionState();
  restoreDesignsSectionState();
  restoreAccountsSectionState();
  
  console.log('✅ דף עיצובים אותחל בהצלחה');
}

// הגדרת הפונקציות כגלובליות
window.openDesignDetails = openDesignDetails;
window.editDesign = editDesign;
window.deleteDesign = deleteDesign;
window.toggleTopSection = toggleTopSection;
window.toggleDesignsSection = toggleDesignsSection;
window.toggleAccountsSection = toggleAccountsSection;
window.restoreTopSectionState = restoreTopSectionState;
window.restoreDesignsSectionState = restoreDesignsSectionState;
window.restoreAccountsSectionState = restoreAccountsSectionState;
window.initializeDesignsPage = initializeDesignsPage;
window.resetAllFiltersAndReloadData = resetAllFiltersAndReloadData;

// בדיקת זמינות פונקציות מיד אחרי הגדרתן
console.log('🔍 === DESIGNS.JS FUNCTIONS CHECK ===');
console.log('🔍 updateGridFromComponent available:', typeof window.updateGridFromComponent);



// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
  console.log('🔄 === DOM CONTENT LOADED ===');

  // אתחול הדף
  if (typeof initializeDesignsPage === 'function') {
    initializeDesignsPage();
  }

  // בדיקת זמינות פונקציות גלובליות
  setTimeout(() => {
    console.log('🔍 === CHECKING GLOBAL FUNCTIONS (DESIGNS) ===');
    console.log('🔍 updateGridFromComponent available:', typeof window.updateGridFromComponent);
    console.log('🔍 updateGridFromComponentGlobal available:', typeof window.updateGridFromComponentGlobal);

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
});

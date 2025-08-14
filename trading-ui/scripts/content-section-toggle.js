/**
 * מערכת כללית לכפתורי פתיחה/סגירה לכל content-section
 * מערכת זו מאפשרת לכל content-section לקבל כפתור פתיחה/סגירה אוטומטי
 */

class ContentSectionToggle {
  constructor() {
    this.init();
  }

  init() {
    // המתן לטעינת הדף
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    console.log('🔧 הגדרת מערכת content-section toggle...');
    
    // שחזור מצב החלקים
    this.restoreSectionStates();
    
    // הוספת event listeners
    this.setupEventListeners();
    
    console.log('✅ מערכת content-section toggle הוגדרה בהצלחה');
  }

  // פונקציה להצגה/הסתרה של content-section
  toggleSection(sectionElement) {
    const sectionId = sectionElement.id || 'section-' + Math.random().toString(36).substr(2, 9);
    const isCollapsed = sectionElement.classList.contains('collapsed');
    
    if (isCollapsed) {
      // פתיחת החלק
      sectionElement.classList.remove('collapsed');
      localStorage.setItem(`section-${sectionId}-open`, 'true');
      console.log(`📂 פתיחת חלק: ${sectionId}`);
    } else {
      // סגירת החלק
      sectionElement.classList.add('collapsed');
      localStorage.setItem(`section-${sectionId}-open`, 'false');
      console.log(`📁 סגירת חלק: ${sectionId}`);
    }
    
    // עדכון טקסט הכפתור
    this.updateToggleButton(sectionElement);
  }

  // שחזור מצב כל החלקים
  restoreSectionStates() {
    const contentSections = document.querySelectorAll('.content-section');
    
    contentSections.forEach(section => {
      const sectionId = section.id || 'section-' + Math.random().toString(36).substr(2, 9);
      const isOpen = localStorage.getItem(`section-${sectionId}-open`);
      
      if (isOpen === 'false') {
        section.classList.add('collapsed');
        console.log(`📁 שחזור חלק סגור: ${sectionId}`);
      }
      
      // עדכון טקסט הכפתור
      this.updateToggleButton(section);
    });
  }

  // הגדרת event listeners לכל content-section
  setupEventListeners() {
    const contentSections = document.querySelectorAll('.content-section');
    
    contentSections.forEach(section => {
      // הוספת כפתור toggle לכל table-header
      this.addToggleButton(section);
    });
  }

  // הוספת כפתור toggle לחלק
  addToggleButton(section) {
    const tableHeader = section.querySelector('.table-header');
    if (!tableHeader) return;
    
    // בדיקה אם כבר יש כפתור
    if (tableHeader.querySelector('.toggle-btn')) return;
    
    // יצירת כפתור
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-btn';
    toggleBtn.innerHTML = '▲';
    toggleBtn.title = 'הצג/הסתר תוכן';
    
    // הוספת event listener
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleSection(section);
    });
    
    // יצירת קונטיינר כפתורים או הוספה לקונטיינר קיים
    let buttonContainer = tableHeader.querySelector('.header-button-container');
    if (!buttonContainer) {
      buttonContainer = document.createElement('div');
      buttonContainer.className = 'header-button-container';
      tableHeader.insertBefore(buttonContainer, tableHeader.firstChild);
    }
    
    // הוספת הכפתור לקונטיינר
    buttonContainer.appendChild(toggleBtn);
  }

  // עדכון טקסט הכפתור
  updateToggleButton(section) {
    const toggleBtn = section.querySelector('.toggle-btn');
    if (toggleBtn) {
      toggleBtn.innerHTML = section.classList.contains('collapsed') ? '▼' : '▲';
    }
  }

  // פונקציה לפתיחת חלק ספציפי
  openSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section && section.classList.contains('collapsed')) {
      this.toggleSection(section);
    }
  }

  // פונקציה לסגירת חלק ספציפי
  closeSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section && !section.classList.contains('collapsed')) {
      this.toggleSection(section);
    }
  }

  // פונקציה לפתיחת כל החלקים
  openAllSections() {
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach(section => {
      if (section.classList.contains('collapsed')) {
        this.toggleSection(section);
      }
    });
  }

  // פונקציה לסגירת כל החלקים
  closeAllSections() {
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach(section => {
      if (!section.classList.contains('collapsed')) {
        this.toggleSection(section);
      }
    });
  }

  // פונקציה לאיפוס כל המצבים
  resetAllStates() {
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach(section => {
      const sectionId = section.id || 'section-' + Math.random().toString(36).substr(2, 9);
      localStorage.removeItem(`section-${sectionId}-open`);
      section.classList.remove('collapsed');
      this.updateToggleButton(section);
    });
  }

  // פונקציה להוספת כפתורים לחלקים חדשים (לשימוש דינמי)
  addToggleToNewSections() {
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach(section => {
      this.addToggleButton(section);
    });
  }
}

// יצירת instance גלובלי
window.contentSectionToggle = new ContentSectionToggle();

// הפיכת הפונקציות לזמינות גלובלית
window.toggleContentSection = (sectionElement) => window.contentSectionToggle.toggleSection(sectionElement);
window.openContentSection = (sectionId) => window.contentSectionToggle.openSection(sectionId);
window.closeContentSection = (sectionId) => window.contentSectionToggle.closeSection(sectionId);
window.openAllContentSections = () => window.contentSectionToggle.openAllSections();
window.closeAllContentSections = () => window.contentSectionToggle.closeAllSections();
window.resetAllContentSectionStates = () => window.contentSectionToggle.resetAllStates();
window.addToggleToNewContentSections = () => window.contentSectionToggle.addToggleToNewSections();

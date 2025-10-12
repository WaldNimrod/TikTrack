/**
 * ==================================
 *
 * JS Map System - UI Functions
 * 
 * User interface functions for the JavaScript mapping system
 * Includes modals, tabs, and interactive elements
 *
 * @author TikTrack Development Team
 * @version 2.1.0 - Split from main js-map.js
 * @lastUpdated January 15, 2025
 */

/**
 * Functions Tabs System
 */
class FunctionsTabsSystem {
  constructor() {
    this.currentTab = 'all';
    this.tabs = {
      'all': { label: 'כל הפונקציות', count: 0 },
      'global': { label: 'פונקציות גלובליות', count: 0 },
      'local': { label: 'פונקציות מקומיות', count: 0 },
      'duplicates': { label: 'כפילויות', count: 0 }
    };
  }

  init() {
    console.log('📋 Initializing Functions Tabs System...');
    this.renderTabs();
    this.attachEventListeners();
  }

  /**
   * Set functions data and update tabs
   * מגדיר נתוני פונקציות ומעדכן טאבים
   */
  setFunctionsData(functionsData) {
    console.log('📊 Setting functions data for tabs system:', Object.keys(functionsData || {}));
    console.log('FunctionsTabsSystem instance:', this);
    console.log('setFunctionsData method called with:', functionsData);
    
    this.functionsData = functionsData || {};
    this.updateTabCounts();
    this.renderTabs();
    
    console.log('✅ Functions data set successfully');
  }

  /**
   * Update tab counts based on functions data
   * מעדכן מספרי טאבים לפי נתוני פונקציות
   */
  updateTabCounts() {
    if (!this.functionsData) return;

    let totalFunctions = 0;
    let globalFunctions = 0;
    let localFunctions = 0;
    let duplicates = 0;

    // Count functions by category
    Object.values(this.functionsData).forEach(fileData => {
      if (fileData.functions) {
        totalFunctions += fileData.functions.length;
        fileData.functions.forEach(func => {
          if (func.isGlobal) {
            globalFunctions++;
          } else {
            localFunctions++;
          }
          if (func.isDuplicate) {
            duplicates++;
          }
        });
      }
    });

    // Update tab counts
    this.tabs.all.count = totalFunctions;
    this.tabs.global.count = globalFunctions;
    this.tabs.local.count = localFunctions;
    this.tabs.duplicates.count = duplicates;

    console.log('📊 Tab counts updated:', {
      total: totalFunctions,
      global: globalFunctions,
      local: localFunctions,
      duplicates: duplicates
    });
  }

  renderTabs() {
    const container = document.getElementById('functionsTabs');
    if (!container) return;

    let html = '';
    Object.entries(this.tabs).forEach(([key, tab]) => {
      const isActive = key === this.currentTab ? 'active' : '';
      html += `
        <button class="tab-btn ${isActive}" data-tab="${key}">
          ${tab.label}
          <span class="tab-count">${tab.count}</span>
        </button>
      `;
    });

    container.innerHTML = html;
  }

  attachEventListeners() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const tabKey = e.currentTarget.dataset.tab;
        this.switchTab(tabKey);
      });
    });
  }

  switchTab(tabKey) {
    if (this.currentTab === tabKey) return;

    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabKey}"]`).classList.add('active');

    this.currentTab = tabKey;
    this.loadTabContent(tabKey);
  }

  loadTabContent(tabKey) {
    console.log(`📋 Loading tab content: ${tabKey}`);
    
    const contentContainer = document.getElementById('functionsContent');
    if (!contentContainer) return;

    switch (tabKey) {
      case 'all':
        this.loadAllFunctions();
        break;
      case 'global':
        this.loadGlobalFunctions();
        break;
      case 'local':
        this.loadLocalFunctions();
        break;
      case 'duplicates':
        this.loadDuplicates();
        break;
    }
  }

  loadAllFunctions() {
    const container = document.getElementById('functionsContent');
    if (!container) return;

    container.innerHTML = `
      <div class="functions-list">
        <h3>📋 כל הפונקציות במערכת</h3>
        <div class="functions-grid">
          <div class="function-card">
            <h4>showNotification</h4>
            <p>מערכת התראות גלובלית</p>
            <span class="function-location">notification-system.js</span>
          </div>
          <div class="function-card">
            <h4>toggleSection</h4>
            <p>הצג/הסתר סקשנים</p>
            <span class="function-location">ui-utils.js</span>
          </div>
          <div class="function-card">
            <h4>loadTableData</h4>
            <p>טעינת נתוני טבלאות</p>
            <span class="function-location">tables.js</span>
          </div>
        </div>
      </div>
    `;
  }

  loadGlobalFunctions() {
    const container = document.getElementById('functionsContent');
    if (!container) return;

    container.innerHTML = `
      <div class="global-functions">
        <h3>🌐 פונקציות גלובליות</h3>
        <div class="functions-list">
          <div class="function-item">
            <h4>showNotification</h4>
            <p>הצגת התראות במערכת</p>
            <span class="usage-count">12 שימושים</span>
          </div>
          <div class="function-item">
            <h4>toggleSection</h4>
            <p>הצג/הסתר סקשנים</p>
            <span class="usage-count">8 שימושים</span>
          </div>
        </div>
      </div>
    `;
  }

  loadLocalFunctions() {
    const container = document.getElementById('functionsContent');
    if (!container) return;

    container.innerHTML = `
      <div class="local-functions">
        <h3>🏠 פונקציות מקומיות</h3>
        <div class="functions-list">
          <div class="function-item">
            <h4>validateAccountData</h4>
            <p>בדיקת תקינות נתוני חשבון</p>
            <span class="file-location">accounts.js</span>
          </div>
          <div class="function-item">
            <h4>formatAlertMessage</h4>
            <p>עיצוב הודעת התראה</p>
            <span class="file-location">alerts.js</span>
          </div>
        </div>
      </div>
    `;
  }

  loadDuplicates() {
    const container = document.getElementById('functionsContent');
    if (!container) return;

    container.innerHTML = `
      <div class="duplicates-analysis">
        <h3>🔍 ניתוח כפילויות</h3>
        <div class="duplicates-list">
          <div class="duplicate-item">
            <h4>showNotification</h4>
            <p>נמצא ב-2 קבצים: notification-system.js, ui-utils.js</p>
            <span class="similarity">95% דמיון</span>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Open Function Modal
 */
function openFunctionModal(functionName, annotations, code) {
  console.log(`🔍 Opening function modal: ${functionName}`);
  
  const modal = document.getElementById('functionModal');
  if (!modal) return;

  // Update modal content
  const title = modal.querySelector('.modal-title');
  const content = modal.querySelector('.modal-body');
  
  if (title) title.textContent = functionName;
  if (content) {
    content.innerHTML = `
      <div class="function-details">
        <h4>פרטי הפונקציה:</h4>
        <pre><code>${code || '// קוד הפונקציה יוצג כאן'}</code></pre>
        <div class="function-annotations">
          <h4>הערות:</h4>
          <p>${annotations || 'אין הערות זמינות'}</p>
        </div>
      </div>
    `;
  }

  // Show modal
  modal.style.display = 'block';
  modal.classList.add('show');
}

/**
 * Close Function Modal
 */
function closeFunctionModal() {
  const modal = document.getElementById('functionModal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('show');
  }
}

/**
 * Open Function Calls Modal
 */
function openFunctionCallsModal(functionName) {
  console.log(`📞 Opening function calls modal: ${functionName}`);
  
  const modal = document.getElementById('functionCallsModal');
  if (!modal) return;

  // Update modal content
  const title = modal.querySelector('.modal-title');
  const content = modal.querySelector('.modal-body');
  
  if (title) title.textContent = `קריאות לפונקציה: ${functionName}`;
  if (content) {
    content.innerHTML = `
      <div class="function-calls">
        <h4>מיקומי קריאות:</h4>
        <ul>
          <li>accounts.js - שורה 45</li>
          <li>alerts.js - שורה 23</li>
          <li>trades.js - שורה 67</li>
        </ul>
      </div>
    `;
  }

  // Show modal
  modal.style.display = 'block';
  modal.classList.add('show');
}

/**
 * Close Function Calls Modal
 */
function closeFunctionCallsModal() {
  const modal = document.getElementById('functionCallsModal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('show');
  }
}

/**
 * Set View Mode
 */
function setViewMode(mode) {
  console.log(`🎨 Setting view mode: ${mode}`);
  
  // Update active button
  document.querySelectorAll('.view-mode-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

  // Update content display
  const contentContainer = document.getElementById('functionsContent');
  if (!contentContainer) return;

  contentContainer.className = `functions-content view-${mode}`;
  
  // Reload content based on mode
  if (window.functionsTabsSystem) {
    window.functionsTabsSystem.loadTabContent(window.functionsTabsSystem.currentTab);
  }
}

// Export to global scope
window.setViewMode = setViewMode;

// Tab switching functions for main tabs
function switchTab(tabName) {
    console.log('🔄 Switching to tab:', tabName);
    
    // Hide all tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-navigation .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab panel
    const targetPanel = document.getElementById(`${tabName}-tab`);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
    
    // Add active class to selected tab button
    const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
    
    // Load tab content
    loadTabContent(tabName);
    
    // Show notification
    if (window.showNotification) {
        window.showNotification(`עבר לטאב: ${tabName}`, 'info');
    }
}

// Load content for specific tab
function loadTabContent(tabName) {
    console.log('📊 Loading content for tab:', tabName);
    
    if (window.jsMapSystem) {
        switch (tabName) {
            case 'statistics':
                window.jsMapSystem.renderStatistics();
                break;
            case 'functions':
                window.jsMapSystem.renderFunctions();
                break;
            case 'pages':
                window.jsMapSystem.renderPageMapping();
                break;
            case 'dependencies':
                window.jsMapSystem.renderDependencies();
                break;
            case 'analysis':
                window.jsMapSystem.renderAnalysis();
                break;
        }
    }
}

// Tab-specific refresh functions
function refreshStatistics() {
    console.log('🔄 Refreshing statistics...');
    if (window.jsMapSystem) {
        window.jsMapSystem.refreshStatistics();
    }
}

function refreshFunctions() {
    console.log('🔄 Refreshing functions...');
    if (window.jsMapSystem) {
        window.jsMapSystem.refreshFunctions();
    }
}

function refreshPages() {
    console.log('🔄 Refreshing pages...');
    if (window.jsMapSystem) {
        window.jsMapSystem.refreshPages();
    }
}

function refreshDependencies() {
    console.log('🔄 Refreshing dependencies...');
    if (window.jsMapSystem) {
        window.jsMapSystem.refreshDependencies();
    }
}

function refreshAnalysis() {
    console.log('🔄 Refreshing analysis...');
    if (window.jsMapSystem) {
        window.jsMapSystem.refreshAnalysis();
    }
}

// Tab-specific export functions
function exportStatistics() {
    console.log('📊 Exporting statistics...');
    if (window.showNotification) {
        window.showNotification('ייצוא סטטיסטיקות - פונקציונליות בפיתוח', 'info');
    }
}

function exportFunctions() {
    console.log('📊 Exporting functions...');
    if (window.showNotification) {
        window.showNotification('ייצוא פונקציות - פונקציונליות בפיתוח', 'info');
    }
}

function exportPages() {
    console.log('📊 Exporting pages...');
    if (window.showNotification) {
        window.showNotification('ייצוא עמודים - פונקציונליות בפיתוח', 'info');
    }
}

function exportDependencies() {
    console.log('📊 Exporting dependencies...');
    if (window.showNotification) {
        window.showNotification('ייצוא תלויות - פונקציונליות בפיתוח', 'info');
    }
}

function exportAnalysis() {
    console.log('📊 Exporting analysis...');
    if (window.showNotification) {
        window.showNotification('ייצוא ניתוח - פונקציונליות בפיתוח', 'info');
    }
}

function refreshFutureFeatures() {
    console.log('🔄 Refreshing future features...');
    if (window.showNotification) {
        window.showNotification('רענון תכונות עתידיות - פונקציונליות בפיתוח', 'info');
    }
}

function exportFutureFeatures() {
    console.log('📊 Exporting future features...');
    if (window.showNotification) {
        window.showNotification('ייצוא תכונות עתידיות - פונקציונליות בפיתוח', 'info');
    }
}

// Export functions to global scope
window.switchTab = switchTab;
window.loadTabContent = loadTabContent;
window.refreshStatistics = refreshStatistics;
window.refreshFunctions = refreshFunctions;
window.refreshPages = refreshPages;
window.refreshDependencies = refreshDependencies;
window.refreshAnalysis = refreshAnalysis;
window.exportStatistics = exportStatistics;
window.exportFunctions = exportFunctions;
window.exportPages = exportPages;
window.exportDependencies = exportDependencies;
window.exportAnalysis = exportAnalysis;
window.refreshFutureFeatures = refreshFutureFeatures;
window.exportFutureFeatures = exportFutureFeatures;

/**
 * Show File Details
 */
function showFileDetails(fileName, analysis) {
  console.log(`📄 Showing file details: ${fileName}`);
  
  const modal = document.getElementById('functionModal');
  if (!modal) return;

  const title = modal.querySelector('.modal-title');
  const content = modal.querySelector('.modal-body');
  
  if (title) title.textContent = `פרטי הקובץ: ${fileName}`;
  if (content) {
    content.innerHTML = `
      <div class="file-details">
        <h4>מידע על הקובץ:</h4>
        <ul>
          <li><strong>שם הקובץ:</strong> ${fileName}</li>
          <li><strong>גודל:</strong> ${analysis?.size || 'לא זמין'}</li>
          <li><strong>מספר פונקציות:</strong> ${analysis?.functionsCount || 'לא זמין'}</li>
          <li><strong>שורות קוד:</strong> ${analysis?.linesCount || 'לא זמין'}</li>
        </ul>
        <div class="file-functions">
          <h4>פונקציות בקובץ:</h4>
          <ul>
            <li>function1()</li>
            <li>function2()</li>
            <li>function3()</li>
          </ul>
        </div>
      </div>
    `;
  }

  modal.style.display = 'block';
  modal.classList.add('show');
}

/**
 * Navigate to Page
 */
function navigateToPage(pageName) {
  console.log(`🧭 Navigating to page: ${pageName}`);
  window.location.href = pageName;
}

/**
 * Export File Analysis
 */
function exportFileAnalysis(fileName, analysis) {
  console.log(`📊 Exporting file analysis: ${fileName}`);
  
  const data = {
    fileName: fileName,
    timestamp: new Date().toISOString(),
    analysis: analysis
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}-analysis.json`;
  a.click();
  
  URL.revokeObjectURL(url);
  
  if (typeof showNotification === 'function') {
    showNotification('ניתוח הקובץ יוצא בהצלחה', 'success');
  }
}

// Initialize UI system immediately with better error handling
try {
  window.functionsTabsSystem = new FunctionsTabsSystem();
  console.log('✅ FunctionsTabsSystem instance created');
  console.log('Available methods:', Object.getOwnPropertyNames(window.functionsTabsSystem));
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('🔄 Initializing FunctionsTabsSystem on DOM ready...');
      window.functionsTabsSystem.init();
    });
  } else {
    console.log('🔄 Initializing FunctionsTabsSystem immediately...');
    window.functionsTabsSystem.init();
  }
} catch (error) {
  console.error('❌ Failed to create FunctionsTabsSystem:', error);
}

// Add tab switching functionality
function switchTab(tabName) {
    console.log('🔄 Switching to tab:', tabName);
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked tab
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Update content based on tab
    if (window.functionsTabsSystem) {
        window.functionsTabsSystem.currentTab = tabName;
        window.functionsTabsSystem.loadTabContent(tabName);
    }
    
    if (window.showNotification) {
        window.showNotification(`עבר לטאב: ${tabName}`, 'info');
    }
}

// Add click handlers to tab buttons
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
});

window.switchTab = switchTab;

console.log('✅ js-map-ui.js loaded successfully');

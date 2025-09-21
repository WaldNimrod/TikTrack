/**
 * CRUD Testing Dashboard - TikTrack
 * =================================
 *
 * דשבורד לבדיקות CRUD של כל עמודי המערכת
 *
 * Features:
 * - בדיקות בסיסיות לכל עמוד
 * - בדיקות CRUD מלאות
 * - בדיקות חיבור
 * - דוחות בדיקות
 * - ייצוא תוצאות
 *
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated January 15, 2025
 */

class CRUDTestingDashboard {
  constructor() {
    this.testResults = {};
    this.testStats = {
      total: 0,
      passed: 0,
      failed: 0,
      pending: 0
    };
    
    this.init();
  }

  init() {
    console.log('🚀 אתחול CRUD Testing Dashboard...');
    
    // אתחול UI
    this.initUI();
    
    // טעינת נתונים
    this.loadTestData();
    
    // עדכון סטטיסטיקות
    this.updateStats();
    
    // עדכון אוטומטי כל 30 שניות
    this.startAutoRefresh();
    
    console.log('✅ CRUD Testing Dashboard אותחל בהצלחה');
  }

  initUI() {
    // עדכון סטטיסטיקות
    this.updateStatsUI();
    
    // הוספת event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // הוספת event listeners לכפתורים
    document.addEventListener('click', (e) => {
      if (e.target.matches('[onclick]')) {
        const onclick = e.target.getAttribute('onclick');
        if (onclick && onclick.includes('(')) {
          e.preventDefault();
          this.handleButtonClick(onclick);
        }
      }
    });
  }

  handleButtonClick(onclick) {
    try {
      // ביצוע הפונקציה
      eval(onclick);
    } catch (error) {
      console.error('שגיאה בביצוע פונקציה:', error);
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה', 'שגיאה בביצוע הפעולה: ' + error.message);
      }
    }
  }

  loadTestData() {
    // טעינת נתוני בדיקות מ-localStorage
    try {
      const savedResults = localStorage.getItem('crud_test_results');
      if (savedResults) {
        this.testResults = JSON.parse(savedResults);
      }
    } catch (error) {
      console.warn('שגיאה בטעינת נתוני בדיקות:', error);
    }
  }

  saveTestData() {
    // שמירת נתוני בדיקות ל-localStorage
    try {
      localStorage.setItem('crud_test_results', JSON.stringify(this.testResults));
    } catch (error) {
      console.warn('שגיאה בשמירת נתוני בדיקות:', error);
    }
  }

  updateStats() {
    // חישוב סטטיסטיקות
    this.testStats = {
      total: 0,
      passed: 0,
      failed: 0,
      pending: 0
    };

    Object.values(this.testResults).forEach(result => {
      this.testStats.total++;
      if (result.status === 'passed') {
        this.testStats.passed++;
      } else if (result.status === 'failed') {
        this.testStats.failed++;
      } else {
        this.testStats.pending++;
      }
    });
  }

  updateStatsUI() {
    // עדכון UI של סטטיסטיקות
    const totalElement = document.getElementById('totalTests');
    const passedElement = document.getElementById('passedTests');
    const failedElement = document.getElementById('failedTests');
    const pendingElement = document.getElementById('pendingTests');

    if (totalElement) totalElement.textContent = this.testStats.total;
    if (passedElement) passedElement.textContent = this.testStats.passed;
    if (failedElement) failedElement.textContent = this.testStats.failed;
    if (pendingElement) pendingElement.textContent = this.testStats.pending;
  }

  // פונקציות בדיקה
  async runBasicTest(pageName, pageUrl) {
    console.log(`🔍 ביצוע בדיקה בסיסית לעמוד: ${pageName}`);
    
    try {
      const response = await fetch(pageUrl);
      const result = {
        page: pageName,
        url: pageUrl,
        status: response.ok ? 'passed' : 'failed',
        timestamp: new Date().toISOString(),
        details: response.ok ? 'עמוד נטען בהצלחה' : `שגיאה: ${response.status}`
      };
      
      this.testResults[`${pageName}_basic`] = result;
      this.updateStats();
      this.updateStatsUI();
      this.saveTestData();
      
      this.showTestResult(result);
      
      return result;
    } catch (error) {
      const result = {
        page: pageName,
        url: pageUrl,
        status: 'failed',
        timestamp: new Date().toISOString(),
        details: `שגיאה: ${error.message}`
      };
      
      this.testResults[`${pageName}_basic`] = result;
      this.updateStats();
      this.updateStatsUI();
      this.saveTestData();
      
      this.showTestResult(result);
      
      return result;
    }
  }

  async runCRUDTest(pageName, apiUrl) {
    console.log(`🔍 ביצוע בדיקת CRUD לעמוד: ${pageName}`);
    
    try {
      // בדיקת GET
      const getResponse = await fetch(apiUrl);
      const getResult = getResponse.ok ? 'passed' : 'failed';
      
      // בדיקת POST (אם נתמך)
      let postResult = 'skipped';
      try {
        const postResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true })
        });
        postResult = postResponse.ok ? 'passed' : 'failed';
      } catch (e) {
        postResult = 'skipped';
      }
      
      const result = {
        page: pageName,
        url: apiUrl,
        status: getResult === 'passed' ? 'passed' : 'failed',
        timestamp: new Date().toISOString(),
        details: `GET: ${getResult}, POST: ${postResult}`
      };
      
      this.testResults[`${pageName}_crud`] = result;
      this.updateStats();
      this.updateStatsUI();
      this.saveTestData();
      
      this.showTestResult(result);
      
      return result;
    } catch (error) {
      const result = {
        page: pageName,
        url: apiUrl,
        status: 'failed',
        timestamp: new Date().toISOString(),
        details: `שגיאה: ${error.message}`
      };
      
      this.testResults[`${pageName}_crud`] = result;
      this.updateStats();
      this.updateStatsUI();
      this.saveTestData();
      
      this.showTestResult(result);
      
      return result;
    }
  }

  async checkConnection(pageName, apiUrl) {
    console.log(`🔍 בדיקת חיבור לעמוד: ${pageName}`);
    
    try {
      const response = await fetch(apiUrl, { method: 'HEAD' });
      const result = {
        page: pageName,
        url: apiUrl,
        status: response.ok ? 'passed' : 'failed',
        timestamp: new Date().toISOString(),
        details: response.ok ? 'חיבור תקין' : `שגיאת חיבור: ${response.status}`
      };
      
      this.testResults[`${pageName}_connection`] = result;
      this.updateStats();
      this.updateStatsUI();
      this.saveTestData();
      
      this.showTestResult(result);
      
      return result;
    } catch (error) {
      const result = {
        page: pageName,
        url: apiUrl,
        status: 'failed',
        timestamp: new Date().toISOString(),
        details: `שגיאה: ${error.message}`
      };
      
      this.testResults[`${pageName}_connection`] = result;
      this.updateStats();
      this.updateStatsUI();
      this.saveTestData();
      
      this.showTestResult(result);
      
      return result;
    }
  }

  showTestResult(result) {
    // הצגת תוצאת בדיקה
    const container = document.getElementById('testResultsContainer');
    const content = document.getElementById('testResultsContent');
    
    if (container && content) {
      container.classList.remove('d-none');
      
      const statusClass = result.status === 'passed' ? 'success' : 'failed';
      const statusIcon = result.status === 'passed' ? '✅' : '❌';
      
      content.innerHTML = `
        <div class="test-results ${statusClass}">
          <div class="test-summary">
            <span>${statusIcon} ${result.page}</span>
            <span>${new Date(result.timestamp).toLocaleString('he-IL')}</span>
          </div>
          <div class="test-details">
            <p><strong>URL:</strong> ${result.url}</p>
            <p><strong>סטטוס:</strong> ${result.status}</p>
            <p><strong>פרטים:</strong> ${result.details}</p>
          </div>
        </div>
      `;
    }
    
    // הצגת הודעה
    if (window.showNotification) {
      const message = result.status === 'passed' ? 
        `בדיקה הושלמה בהצלחה: ${result.page}` : 
        `בדיקה נכשלה: ${result.page}`;
      
      window.showNotification(result.status === 'passed' ? 'success' : 'error', message);
    }
  }

  // פונקציות ניהול
  async runAllBasicTests() {
    console.log('🚀 ביצוע כל הבדיקות הבסיסיות...');
    
    const pages = [
      { name: 'index', url: '/' },
      { name: 'trades', url: '/trades' },
      { name: 'accounts', url: '/accounts' },
      { name: 'alerts', url: '/alerts' },
      { name: 'tickers', url: '/tickers' },
      { name: 'executions', url: '/executions' },
      { name: 'cash_flows', url: '/cash_flows' },
      { name: 'trade_plans', url: '/trade_plans' },
      { name: 'constraints', url: '/constraints' },
      { name: 'notes', url: '/notes' },
      { name: 'research', url: '/research' },
      { name: 'preferences', url: '/preferences' }
    ];
    
    for (const page of pages) {
      await this.runBasicTest(page.name, page.url);
      // המתנה קצרה בין בדיקות
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('✅ כל הבדיקות הבסיסיות הושלמו');
  }

  async runAllCRUDTests() {
    console.log('🚀 ביצוע כל בדיקות CRUD...');
    
    const apis = [
      { name: 'trades', url: '/api/v1/trades/' },
      { name: 'accounts', url: '/api/v1/accounts/' },
      { name: 'alerts', url: '/api/v1/alerts/' },
      { name: 'tickers', url: '/api/v1/tickers/' },
      { name: 'executions', url: '/api/v1/executions/' },
      { name: 'cash_flows', url: '/api/v1/cash_flows/' },
      { name: 'trade_plans', url: '/api/v1/trade_plans/' },
      { name: 'constraints', url: '/api/v1/constraints/' },
      { name: 'notes', url: '/api/v1/notes/' },
      { name: 'preferences', url: '/api/v1/preferences/user' }
    ];
    
    for (const api of apis) {
      await this.runCRUDTest(api.name, api.url);
      // המתנה קצרה בין בדיקות
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('✅ כל בדיקות CRUD הושלמו');
  }

  async checkAllConnections() {
    console.log('🚀 בדיקת כל החיבורים...');
    
    const connections = [
      { name: 'trades', url: '/api/v1/trades/' },
      { name: 'accounts', url: '/api/v1/accounts/' },
      { name: 'alerts', url: '/api/v1/alerts/' },
      { name: 'tickers', url: '/api/v1/tickers/' },
      { name: 'executions', url: '/api/v1/executions/' },
      { name: 'cash_flows', url: '/api/v1/cash_flows/' },
      { name: 'trade_plans', url: '/api/v1/trade_plans/' },
      { name: 'constraints', url: '/api/v1/constraints/' },
      { name: 'notes', url: '/api/v1/notes/' },
      { name: 'preferences', url: '/api/v1/preferences/user' }
    ];
    
    for (const connection of connections) {
      await this.checkConnection(connection.name, connection.url);
      // המתנה קצרה בין בדיקות
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('✅ כל בדיקות החיבור הושלמו');
  }

  generateTestReport() {
    console.log('📊 יצירת דוח בדיקות...');
    
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.testStats,
      results: this.testResults
    };
    
    const reportText = `דוח בדיקות CRUD - TikTrack
=============================

תאריך: ${new Date(report.timestamp).toLocaleString('he-IL')}

סטטיסטיקות:
- סה"כ בדיקות: ${report.stats.total}
- הצליחו: ${report.stats.passed}
- נכשלו: ${report.stats.failed}
- ממתינות: ${report.stats.pending}

תוצאות מפורטות:
${Object.entries(report.results).map(([key, result]) => 
  `${key}: ${result.status} - ${result.details}`
).join('\n')}`;
    
    // העתקה ללוח
    navigator.clipboard.writeText(reportText).then(() => {
      if (window.showSuccessNotification) {
        window.showSuccessNotification('דוח בדיקות', 'דוח בדיקות הועתק ללוח בהצלחה');
      }
    }).catch(err => {
      console.error('שגיאה בהעתקה ללוח:', err);
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה', 'שגיאה בהעתקה ללוח: ' + err.message);
      }
    });
  }

  exportTestResults() {
    console.log('📤 ייצוא תוצאות בדיקות...');
    
    const data = {
      timestamp: new Date().toISOString(),
      stats: this.testStats,
      results: this.testResults
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `crud-test-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (window.showSuccessNotification) {
      window.showSuccessNotification('ייצוא', 'תוצאות בדיקות יוצאו בהצלחה');
    }
  }

  resetAllTests() {
    console.log('🔄 איפוס כל הבדיקות...');
    
    this.testResults = {};
    this.updateStats();
    this.updateStatsUI();
    this.saveTestData();
    
    // ניקוי תוצאות מהממשק
    const container = document.getElementById('testResultsContainer');
    const content = document.getElementById('testResultsContent');
    
    if (container) {
      container.classList.add('d-none');
    }
    
    if (window.showSuccessNotification) {
      window.showSuccessNotification('איפוס', 'כל הבדיקות אופסו בהצלחה');
    }
  }

  // פונקציות לסימון עמודים
  markPageComplete(pageName) {
    console.log(`✅ סימון עמוד ${pageName} כהושלם`);
    
    this.testResults[`${pageName}_status`] = {
      page: pageName,
      status: 'complete',
      timestamp: new Date().toISOString()
    };
    
    this.saveTestData();
    this.updatePageStatus(pageName, 'complete');
    
    if (window.showSuccessNotification) {
      window.showSuccessNotification('סימון', `עמוד ${pageName} סומן כהושלם`);
    }
  }

  markPagePartial(pageName) {
    console.log(`⚠️ סימון עמוד ${pageName} כחלקי`);
    
    this.testResults[`${pageName}_status`] = {
      page: pageName,
      status: 'partial',
      timestamp: new Date().toISOString()
    };
    
    this.saveTestData();
    this.updatePageStatus(pageName, 'partial');
    
    if (window.showSuccessNotification) {
      window.showSuccessNotification('סימון', `עמוד ${pageName} סומן כחלקי`);
    }
  }

  updatePageStatus(pageName, status) {
    // עדכון סטטוס עמוד בממשק
    const statusElement = document.querySelector(`[data-page="${pageName}"] .status-indicator`);
    if (statusElement) {
      statusElement.className = `status-indicator status-${status}`;
    }
  }

  startAutoRefresh() {
    // עדכון אוטומטי כל 30 שניות
    setInterval(() => {
      this.updateStats();
      this.updateStatsUI();
    }, 30000);
  }
}

// פונקציות גלובליות
function runAllBasicTests() {
  if (window.crudTestingDashboard) {
    window.crudTestingDashboard.runAllBasicTests();
  }
}

function runAllCRUDTests() {
  if (window.crudTestingDashboard) {
    window.crudTestingDashboard.runAllCRUDTests();
  }
}

function checkAllConnections() {
  if (window.crudTestingDashboard) {
    window.crudTestingDashboard.checkAllConnections();
  }
}

function generateTestReport() {
  if (window.crudTestingDashboard) {
    window.crudTestingDashboard.generateTestReport();
  }
}

function exportTestResults() {
  if (window.crudTestingDashboard) {
    window.crudTestingDashboard.exportTestResults();
  }
}

function resetAllTests() {
  if (window.crudTestingDashboard) {
    window.crudTestingDashboard.resetAllTests();
  }
}

function runBasicTest(pageName, pageUrl) {
  if (window.crudTestingDashboard) {
    window.crudTestingDashboard.runBasicTest(pageName, pageUrl);
  }
}

function runCRUDTest(pageName, apiUrl) {
  if (window.crudTestingDashboard) {
    window.crudTestingDashboard.runCRUDTest(pageName, apiUrl);
  }
}

function checkConnection(pageName, apiUrl) {
  if (window.crudTestingDashboard) {
    window.crudTestingDashboard.checkConnection(pageName, apiUrl);
  }
}

function markPageComplete(pageName) {
  if (window.crudTestingDashboard) {
    window.crudTestingDashboard.markPageComplete(pageName);
  }
}

function markPagePartial(pageName) {
  if (window.crudTestingDashboard) {
    window.crudTestingDashboard.markPagePartial(pageName);
  }
}

// פונקציה להעתקת לוג מפורט
function copyDetailedLog() {
  try {
    console.log('📋 יצירת לוג מפורט...');
    
    let log = '=== לוג מפורט - CRUD Testing Dashboard TikTrack ===\n\n';
    log += `📅 תאריך: ${new Date().toLocaleString('he-IL')}\n`;
    log += `🌐 URL: ${window.location.href}\n`;
    log += `👤 User Agent: ${navigator.userAgent}\n\n`;
    
    // סטטיסטיקות בדיקות
    log += '📊 סטטיסטיקות בדיקות:\n';
    log += `סה"כ בדיקות: ${window.crudTestingDashboard?.testStats?.total || 0}\n`;
    log += `הצליחו: ${window.crudTestingDashboard?.testStats?.passed || 0}\n`;
    log += `נכשלו: ${window.crudTestingDashboard?.testStats?.failed || 0}\n`;
    log += `ממתינות: ${window.crudTestingDashboard?.testStats?.pending || 0}\n\n`;
    
    // תוצאות בדיקות מפורטות
    log += '🔍 תוצאות בדיקות מפורטות:\n';
    if (window.crudTestingDashboard?.testResults) {
      Object.entries(window.crudTestingDashboard.testResults).forEach(([key, result], index) => {
        log += `${index + 1}. ${key}: ${result.status} - ${result.details}\n`;
        log += `   זמן: ${new Date(result.timestamp).toLocaleString('he-IL')}\n`;
        log += `   URL: ${result.url || 'לא זמין'}\n\n`;
      });
    } else {
      log += 'אין תוצאות בדיקות זמינות\n\n';
    }
    
    // מידע נוסף
    log += '🔧 מידע נוסף:\n';
    log += `גודל localStorage: ${JSON.stringify(localStorage).length} תווים\n`;
    log += `זמן טעינת דף: ${performance.timing ? (performance.timing.loadEventEnd - performance.timing.navigationStart) + 'ms' : 'לא זמין'}\n`;
    log += `זיכרון זמין: ${navigator.deviceMemory ? navigator.deviceMemory + 'GB' : 'לא זמין'}\n`;
    log += `חיבור: ${navigator.onLine ? 'מחובר' : 'לא מחובר'}\n\n`;
    
    log += '=== סוף לוג מפורט ===';
    
    // העתקה ללוח
    navigator.clipboard.writeText(log).then(() => {
      console.log('✅ לוג מפורט הועתק ללוח בהצלחה');
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('העתקה ללוח', 'לוג מפורט הועתק ללוח בהצלחה', 3000);
      }
    }).catch(err => {
      console.error('❌ שגיאה בהעתקה ללוח:', err);
      // Fallback - הצגת הלוג בחלון נפרד
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`<pre style="direction: rtl; text-align: right; font-family: monospace; white-space: pre-wrap;">${log}</pre>`);
      newWindow.document.title = 'לוג מפורט - CRUD Testing Dashboard';
    });
    
  } catch (error) {
    console.error('❌ שגיאה ביצירת לוג מפורט:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה ביצירת לוג מפורט: ' + error.message, 5000);
    }
  }
}

function toggleTopSection() {
  if (typeof window.toggleTopSectionGlobal === 'function') {
    window.toggleTopSectionGlobal();
  } else {
    console.warn('פונקציית toggleTopSectionGlobal לא נמצאה ב-main.js');
  }
}

function toggleAllSections() {
  const sections = document.querySelectorAll('.section-content');
  const toggleBtn = document.querySelector('.filter-toggle-btn');
  
  if (!sections.length || !toggleBtn) return;
  
  const isCollapsed = sections[0].style.display === 'none' || 
                     sections[0].classList.contains('collapsed');
  
  sections.forEach(section => {
    if (isCollapsed) {
      section.style.display = 'block';
      section.classList.remove('collapsed');
    } else {
      section.style.display = 'none';
      section.classList.add('collapsed');
    }
  });
  
  // Update button text
  toggleBtn.innerHTML = isCollapsed ? 
    '<i class="section-toggle-icon">▼</i>' : 
    '<i class="section-toggle-icon">▶</i>';
}

function toggleSection(sectionId) {
  const section = document.getElementById(sectionId);
  const toggleBtn = document.querySelector(`[onclick*="${sectionId}"] .section-toggle-icon`);
  
  if (!section) return;
  
  const isCollapsed = section.style.display === 'none' || 
                     section.classList.contains('collapsed');
  
  if (isCollapsed) {
    section.style.display = 'block';
    section.classList.remove('collapsed');
    if (toggleBtn) toggleBtn.innerHTML = '▼';
  } else {
    section.style.display = 'none';
    section.classList.add('collapsed');
    if (toggleBtn) toggleBtn.innerHTML = '▶';
  }
}

// ייצוא פונקציות ל-window scope
window.runAllBasicTests = runAllBasicTests;
window.runAllCRUDTests = runAllCRUDTests;
window.checkAllConnections = checkAllConnections;
window.generateTestReport = generateTestReport;
window.exportTestResults = exportTestResults;
window.resetAllTests = resetAllTests;
window.runBasicTest = runBasicTest;
window.runCRUDTest = runCRUDTest;
window.checkConnection = checkConnection;
window.markPageComplete = markPageComplete;
window.markPagePartial = markPagePartial;
window.copyDetailedLog = copyDetailedLog;
window.toggleTopSection = toggleTopSection;
window.toggleAllSections = toggleAllSections;
window.toggleSection = toggleSection;

// אתחול
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 טעינת דף CRUD Testing Dashboard...');
  
  // אתחול HeaderSystem
  if (window.headerSystem && !window.headerSystem.isInitialized) {
    console.log('✅ אתחול HeaderSystem...');
    window.headerSystem.init();
  }
  
  // יצירת מופע CRUD Testing Dashboard
  window.crudTestingDashboard = new CRUDTestingDashboard();
  
  console.log('✅ דף CRUD Testing Dashboard נטען בהצלחה');
});

/**
 * Generate detailed log for CRUD Testing Dashboard
 */
function generateDetailedLog() {
    const timestamp = new Date().toLocaleString('he-IL');
    const log = [];

    log.push('=== לוג מפורט - דשבורד בדיקות CRUD ===');
    log.push(`זמן יצירה: ${timestamp}`);
    log.push(`עמוד: ${window.location.href}`);
    log.push('');

    // סטטוס כללי
    log.push('--- סטטוס כללי ---');
    const topSection = document.querySelector('.top-section .section-body');
    const isTopOpen = topSection && topSection.style.display !== 'none';
    log.push(`סקשן עליון: ${isTopOpen ? 'פתוח' : 'סגור'}`);
    
    // תצוגה מפורטת לפי סקשנים
    log.push('--- תצוגה מפורטת לפי סקשנים ---');
    
    // סקשן עליון
    const summaryStats = document.getElementById('summaryStats');
    if (summaryStats) {
        const summaryItems = summaryStats.querySelectorAll('.summary-item');
        summaryItems.forEach((item, index) => {
            const label = item.querySelector('.summary-label')?.textContent || 'לא זמין';
            const value = item.querySelector('.summary-number')?.textContent || 'לא זמין';
            log.push(`סקשן עליון - פריט ${index + 1}: ${label} = "${value}"`);
        });
    }

    // טבלאות ונתונים
    log.push('--- טבלאות ונתונים ---');
    const testResults = document.querySelectorAll('.test-result');
    testResults.forEach((result, index) => {
        const pageName = result.querySelector('.page-name')?.textContent || 'לא זמין';
        const status = result.querySelector('.status-badge')?.textContent || 'לא זמין';
        const score = result.querySelector('.score')?.textContent || 'לא זמין';
        log.push(`תוצאה ${index + 1}: ${pageName} | סטטוס: ${status} | ציון: ${score}`);
    });

    // סטטיסטיקות וביצועים
    log.push('--- סטטיסטיקות וביצועים ---');
    if (window.crudTestingDashboard && window.crudTestingDashboard.testStats) {
        const stats = window.crudTestingDashboard.testStats;
        log.push(`סה"כ בדיקות: ${stats.total}`);
        log.push(`עברו: ${stats.passed}`);
        log.push(`נכשלו: ${stats.failed}`);
        log.push(`ממתינות: ${stats.pending}`);
    }

    // לוגים ושגיאות
    log.push('--- לוגים ושגיאות ---');
    if (window.consoleLogs && window.consoleLogs.length > 0) {
        const recentLogs = window.consoleLogs.slice(-10);
        recentLogs.forEach(entry => {
            log.push(`[${entry.timestamp}] ${entry.level}: ${entry.message}`);
        });
    } else {
        log.push('אין לוגים זמינים');
    }

    // מידע טכני
    log.push('--- מידע טכני ---');
    log.push(`User Agent: ${navigator.userAgent}`);
    log.push(`Language: ${navigator.language}`);
    log.push(`Platform: ${navigator.platform}`);
    log.push(`Page Load Time: ${Date.now() - performance.timing.navigationStart}ms`);

    log.push('=== סוף הלוג ===');
    return log.join('\n');
}

/**
 * Copy detailed log to clipboard
 */
async function copyDetailedLog() {
    try {
        const log = generateDetailedLog();
        await navigator.clipboard.writeText(log);
        window.showNotification('הלוג המפורט הועתק בהצלחה ללוח!', 'success');
        console.log('=== לוג מפורט שהועתק ===');
        console.log(log);
        console.log('=== סוף הלוג ===');
    } catch (error) {
        console.error('Failed to copy log:', error);
        window.showNotification('שגיאה בהעתקת הלוג: ' + error.message, 'error');
        // Fallback: show in console
        const log = generateDetailedLog();
        console.log('=== לוג מפורט (לא הועתק) ===');
        console.log(log);
        console.log('=== סוף הלוג ===');
    }
}

// ייצוא לגלובל scope
window.copyDetailedLog = copyDetailedLog;

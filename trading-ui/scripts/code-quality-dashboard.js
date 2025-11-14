/**
 * Code Quality Dashboard - TikTrack
 * ==================================
 *
 * Dashboard for monitoring and managing code quality across all user pages
 *
 * Features:
 * - Error Handling Coverage monitoring
 * - JSDoc Coverage monitoring
 * - Naming Conventions validation
 * - Function Index management
 * - Real-time quality metrics
 *
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated January 26, 2025
 */

if (window.Logger) {
  window.Logger.info('📊 Loading Code Quality Dashboard...', { page: 'code-quality-dashboard' });
}

/**
 * Code Quality Dashboard Class
 */
class CodeQualityDashboard {
  constructor() {
    this.isInitialized = false;
    this.lastCheckResults = {
      errorHandling: null,
      jsdoc: null,
      naming: null,
      functionIndex: null,
      duplicates: null,
    };

    this.duplicateItems = [];
    this.filteredDuplicateItems = [];
    this.activeDuplicateIndex = null;
    this.duplicateFilters = {
      type: 'all',
      category: 'all',
      minSimilarity: 0.7,
    };
    this.duplicateCategories = new Set();
  }

  /**
   * Initialize the dashboard
   */
  init() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize UI elements
      this.initializeUI();

      // Load initial data
      this.loadInitialData();
      this.initializeLintMonitorSection();

      this.isInitialized = true;
      if (window.Logger) {
        window.Logger.info('✅ Code Quality Dashboard initialized', {
          page: 'code-quality-dashboard',
        });
      }
    } catch (error) {
      if (window.Logger) {
        window.Logger.error('Error initializing Code Quality Dashboard:', error, {
          page: 'code-quality-dashboard',
        });
      }
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', 'נכשל באתחול דשבורד איכות הקוד');
      }
    }
  }

  /**
   * Initialize lint monitor section (migrated from dedicated page)
   */
  async initializeLintMonitorSection() {
    if (typeof window.initializeLintMonitor !== 'function' && !window.lintMonitorController) {
      window.Logger?.warn('Lint monitor controller not available on this page', {
        page: 'code-quality-dashboard',
      });
      return;
    }

    try {
      if (window.lintMonitorController) {
        await window.lintMonitorController.loadData();
        return;
      }

      await window.initializeLintMonitor();
    } catch (error) {
      window.Logger?.error('Failed to initialize lint monitor section', error, {
        page: 'code-quality-dashboard',
      });
      window.showErrorNotification?.('שגיאה', 'נכשל באתחול מודול הלינטר');
    }
  }

  /**
   * Initialize UI elements
   */
  initializeUI() {
    // Set up event listeners for buttons
    this.setupEventListeners();
    this.setupDuplicateFilters();

    // Initialize empty states
    this.updateSummaryStats();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Auto-refresh every 5 minutes
    setInterval(() => {
      this.refreshDashboard();
    }, 300000);
  }

  /**
   * Setup duplicate detection filters
   */
  setupDuplicateFilters() {
    const typeSelect = document.getElementById('duplicateTypeFilter');
    const categorySelect = document.getElementById('duplicateCategoryFilter');
    const similarityRange = document.getElementById('duplicateSimilarityRange');

    if (typeSelect) {
      typeSelect.addEventListener('change', () => {
        this.duplicateFilters.type = typeSelect.value;
        this.renderDuplicateTable();
      });
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', () => {
        this.duplicateFilters.category = categorySelect.value;
        this.renderDuplicateTable();
      });
    }

    if (similarityRange) {
      similarityRange.addEventListener('input', () => {
        const value = parseInt(similarityRange.value, 10) || 70;
        this.duplicateFilters.minSimilarity = value / 100;
        this.updateSimilarityDisplay(value);
      });

      similarityRange.addEventListener('change', () => {
        this.renderDuplicateTable();
      });
    }

    this.updateSimilarityDisplay();
  }

  /**
   * Load initial data
   */
  async loadInitialData() {
    try {
      // Show loading state
      this.showLoadingState();

      // Run all checks
      await this.runAllChecks();
    } catch (error) {
      if (window.Logger) {
        window.Logger.error('Error loading initial data:', error, {
          page: 'code-quality-dashboard',
        });
      }
      this.showErrorState('נכשל בטעינת נתונים ראשוניים');
    }
  }

  /**
   * Run all quality checks
   */
  async runAllChecks() {
    try {
      if (typeof window.showNotification === 'function') {
        window.showNotification('מריץ בדיקות איכות...', 'info');
      }

      // Run all checks in parallel
      const [errorHandling, jsdoc, naming, functionIndex, duplicates] = await Promise.all([
        this.runErrorHandlingCheck(),
        this.runJSDocCheck(),
        this.runNamingCheck(),
        this.runFunctionIndexCheck(),
        this.runDuplicateCheck(),
      ]);

      // Update UI with results
      this.updateAllResults(errorHandling, jsdoc, naming, functionIndex, duplicates);

      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('בדיקות איכות הושלמו');
      }
    } catch (error) {
      if (window.Logger) {
        window.Logger.error('Error running all checks:', error, { page: 'code-quality-dashboard' });
      }
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', 'נכשל בהרצת בדיקות איכות');
      }
    }
  }

  /**
   * Run Error Handling check
   */
  async runErrorHandlingCheck() {
    try {
      const response = await fetch('/api/quality-check/error-handling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.lastCheckResults.errorHandling = data;
      return data;
    } catch (error) {
      if (window.Logger) {
        window.Logger.error('Error running Error Handling check:', error, {
          page: 'code-quality-dashboard',
        });
      }
      throw error;
    }
  }

  /**
   * Run JSDoc check
   */
  async runJSDocCheck() {
    try {
      const response = await fetch('/api/quality-check/jsdoc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.lastCheckResults.jsdoc = data;
      return data;
    } catch (error) {
      if (window.Logger) {
        window.Logger.error('Error running JSDoc check:', error, {
          page: 'code-quality-dashboard',
        });
      }
      throw error;
    }
  }

  /**
   * Run Naming Conventions check
   */
  async runNamingCheck() {
    try {
      const response = await fetch('/api/quality-check/naming', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.lastCheckResults.naming = data;
      return data;
    } catch (error) {
      if (window.Logger) {
        window.Logger.error('Error running Naming check:', error, {
          page: 'code-quality-dashboard',
        });
      }
      throw error;
    }
  }

  /**
   * Run Function Index check
   */
  async runFunctionIndexCheck() {
    try {
      const response = await fetch('/api/quality-check/function-index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch (parseError) {
        window.Logger?.warn(
          'Failed to parse function index response payload',
          parseError,
          { page: 'code-quality-dashboard' },
        );
      }

      if (response.status === 503) {
        const unavailableResult = {
          status: 'unavailable',
          message:
            payload?.message ||
            'בדיקת Function Index אינה זמינה כרגע במערכת. ניתן להפעיל את המחולל הידני מהכפתור הייעודי ולנסות שוב לאחר הפריסה.',
          timestamp: payload?.timestamp || new Date().toISOString(),
          data: null,
        };
        this.lastCheckResults.functionIndex = unavailableResult;
        return unavailableResult;
      }

      if (!response.ok) {
        throw new Error(payload?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      this.lastCheckResults.functionIndex = payload;
      return payload;
    } catch (error) {
      if (window.Logger) {
        window.Logger.error('Error running Function Index check:', error, {
          page: 'code-quality-dashboard',
        });
      }
      throw error;
    }
  }

  /**
   * Run Duplicate Detection check
   */
  async runDuplicateCheck() {
    try {
      const response = await fetch('/api/quality-check/duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.lastCheckResults.duplicates = data;
      return data;
    } catch (error) {
      if (window.Logger) {
        window.Logger.error('Error running Duplicate check:', error, {
          page: 'code-quality-dashboard',
        });
      }
      throw error;
    }
  }

  /**
   * Generate Function Index for all files
   */
  async generateFunctionIndex() {
    try {
      if (typeof window.showNotification === 'function') {
        window.showNotification('מייצר Function Index...', 'info');
      }

      const response = await fetch('/api/quality-check/generate-function-index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('Function Index נוצר בהצלחה');
      }

      // Refresh Function Index check
      await this.runFunctionIndexCheck();
    } catch (error) {
      if (window.Logger) {
        window.Logger.error('Error generating Function Index:', error, {
          page: 'code-quality-dashboard',
        });
      }
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', 'נכשל ביצירת Function Index');
      }
    }
  }

  /**
   * Update all results in UI
   */
  updateAllResults(errorHandling, jsdoc, naming, functionIndex, duplicates) {
    this.displayErrorHandlingResults(errorHandling);
    this.displayJSDocResults(jsdoc);
    this.displayNamingResults(naming);
    this.displayFunctionIndexResults(functionIndex);
    this.displayDuplicateResults(duplicates);
    this.updateSummaryStats();
    this.updateLastUpdateTime();
  }

  /**
   * Display Error Handling results
   */
  displayErrorHandlingResults(data) {
    const resultsElement = document.getElementById('errorHandlingResults');
    if (!resultsElement) return;

    if (!data || !data.data) {
      resultsElement.innerHTML = '<div class="text-center text-muted">אין נתונים זמינים</div>';
      return;
    }

    const { summary, pages } = data.data;
    const coveragePercentage = parseFloat(summary.coveragePercentage);
    const statusClass =
      coveragePercentage >= 90 ? 'success' : coveragePercentage >= 70 ? 'warning' : 'danger';

    let html = `
            <div class="alert alert-${statusClass}">
                <h6>כיסוי Error Handling: ${summary.coveragePercentage}%</h6>
                <div class="row">
                    <div class="col-4">
                        <strong>${summary.total}</strong><br>
                        <small>סה"כ פונקציות</small>
                    </div>
                    <div class="col-4">
                        <strong>${summary.withCoverage}</strong><br>
                        <small>עם כיסוי</small>
                    </div>
                    <div class="col-4">
                        <strong>${summary.withoutCoverage}</strong><br>
                        <small>ללא כיסוי</small>
                    </div>
                </div>
            </div>
        `;

    // Add pages breakdown
    if (pages && pages.length > 0) {
      html +=
        '<div class="mt-3"><h6>פירוט לפי עמודים:</h6><div class="table-responsive"><table class="table table-sm">';
      html +=
        '<thead><tr><th>עמוד</th><th>כיסוי</th><th>פונקציות</th><th>סטטוס</th></tr></thead><tbody>';

      pages.forEach(page => {
        const pageStatusClass =
          parseFloat(page.coveragePercentage) >= 90
            ? 'success'
            : parseFloat(page.coveragePercentage) >= 70
              ? 'warning'
              : 'danger';
        const statusIcon =
          parseFloat(page.coveragePercentage) >= 90
            ? '✅'
            : parseFloat(page.coveragePercentage) >= 70
              ? '⚠️'
              : '❌';

        html += `
                    <tr>
                        <td>${page.file}</td>
                        <td>${page.coveragePercentage}%</td>
                        <td>${page.totalFunctions}</td>
                        <td><span class="badge bg-${pageStatusClass}">${statusIcon}</span></td>
                    </tr>
                `;
      });

      html += '</tbody></table></div></div>';
    }

    resultsElement.innerHTML = html;

    // Update stats
    const withCoverageElement = document.getElementById('errorHandlingWithCoverage');
    const withoutCoverageElement = document.getElementById('errorHandlingWithoutCoverage');
    const statusElement = document.getElementById('errorHandlingStatus');

    if (withCoverageElement) withCoverageElement.textContent = summary.withCoverage;
    if (withoutCoverageElement) withoutCoverageElement.textContent = summary.withoutCoverage;
    if (statusElement) statusElement.textContent = `${summary.coveragePercentage}%`;
  }

  /**
   * Display JSDoc results
   */
  displayJSDocResults(data) {
    const resultsElement = document.getElementById('jsdocResults');
    if (!resultsElement) return;

    if (!data || !data.data) {
      resultsElement.innerHTML = '<div class="text-center text-muted">אין נתונים זמינים</div>';
      return;
    }

    const { summary, pages } = data.data;
    const coveragePercentage = parseFloat(summary.coveragePercentage);
    const statusClass =
      coveragePercentage >= 100 ? 'success' : coveragePercentage >= 80 ? 'warning' : 'danger';

    let html = `
            <div class="alert alert-${statusClass}">
                <h6>כיסוי JSDoc: ${summary.coveragePercentage}%</h6>
                <div class="row">
                    <div class="col-4">
                        <strong>${summary.total}</strong><br>
                        <small>סה"כ פונקציות</small>
                    </div>
                    <div class="col-4">
                        <strong>${summary.withJSDoc}</strong><br>
                        <small>עם JSDoc</small>
                    </div>
                    <div class="col-4">
                        <strong>${summary.withoutJSDoc}</strong><br>
                        <small>ללא JSDoc</small>
                    </div>
                </div>
            </div>
        `;

    // Add pages breakdown
    if (pages && pages.length > 0) {
      html +=
        '<div class="mt-3"><h6>פירוט לפי עמודים:</h6><div class="table-responsive"><table class="table table-sm">';
      html +=
        '<thead><tr><th>עמוד</th><th>כיסוי</th><th>פונקציות</th><th>סטטוס</th></tr></thead><tbody>';

      pages.forEach(page => {
        const pageStatusClass =
          parseFloat(page.coveragePercentage) >= 100
            ? 'success'
            : parseFloat(page.coveragePercentage) >= 80
              ? 'warning'
              : 'danger';
        const statusIcon =
          parseFloat(page.coveragePercentage) >= 100
            ? '✅'
            : parseFloat(page.coveragePercentage) >= 80
              ? '⚠️'
              : '❌';

        html += `
                    <tr>
                        <td>${page.file}</td>
                        <td>${page.coveragePercentage}%</td>
                        <td>${page.totalFunctions}</td>
                        <td><span class="badge bg-${pageStatusClass}">${statusIcon}</span></td>
                    </tr>
                `;
      });

      html += '</tbody></table></div></div>';
    }

    resultsElement.innerHTML = html;

    // Update stats
    const withDocsElement = document.getElementById('jsdocWithDocs');
    const withoutDocsElement = document.getElementById('jsdocWithoutDocs');
    const statusElement = document.getElementById('jsdocStatus');

    if (withDocsElement) withDocsElement.textContent = summary.withJSDoc;
    if (withoutDocsElement) withoutDocsElement.textContent = summary.withoutJSDoc;
    if (statusElement) statusElement.textContent = `${summary.coveragePercentage}%`;
  }

  /**
   * Display Naming Conventions results
   */
  displayNamingResults(data) {
    const resultsElement = document.getElementById('namingResults');
    if (!resultsElement) return;

    if (!data || !data.data) {
      resultsElement.innerHTML = '<div class="text-center text-muted">אין נתונים זמינים</div>';
      return;
    }

    const { summary, pages } = data.data;
    const compliancePercentage =
      summary.total > 0 ? ((summary.compliant / summary.total) * 100).toFixed(2) : 0;
    const statusClass =
      compliancePercentage >= 95 ? 'success' : compliancePercentage >= 80 ? 'warning' : 'danger';

    let html = `
            <div class="alert alert-${statusClass}">
                <h6>עמידה בקונבנציות: ${compliancePercentage}%</h6>
                <div class="row">
                    <div class="col-4">
                        <strong>${summary.total}</strong><br>
                        <small>סה"כ פריטים</small>
                    </div>
                    <div class="col-4">
                        <strong>${summary.compliant}</strong><br>
                        <small>עומדים בקונבנציות</small>
                    </div>
                    <div class="col-4">
                        <strong>${summary.violations}</strong><br>
                        <small>הפרות</small>
                    </div>
                </div>
            </div>
        `;

    // Add pages breakdown
    if (pages && pages.length > 0) {
      html +=
        '<div class="mt-3"><h6>פירוט לפי עמודים:</h6><div class="table-responsive"><table class="table table-sm">';
      html +=
        '<thead><tr><th>עמוד</th><th>הפרות</th><th>סה"כ</th><th>סטטוס</th></tr></thead><tbody>';

      pages.forEach(page => {
        const pageStatusClass =
          page.violations.length === 0
            ? 'success'
            : page.violations.length <= 5
              ? 'warning'
              : 'danger';
        const statusIcon =
          page.violations.length === 0 ? '✅' : page.violations.length <= 5 ? '⚠️' : '❌';

        html += `
                    <tr>
                        <td>${page.file}</td>
                        <td>${page.violations.length}</td>
                        <td>${page.total}</td>
                        <td><span class="badge bg-${pageStatusClass}">${statusIcon}</span></td>
                    </tr>
                `;
      });

      html += '</tbody></table></div></div>';
    }

    resultsElement.innerHTML = html;

    // Update stats
    const compliantElement = document.getElementById('namingCompliant');
    const violationsElement = document.getElementById('namingViolations');
    const statusElement = document.getElementById('namingStatus');

    if (compliantElement) compliantElement.textContent = summary.compliant;
    if (violationsElement) violationsElement.textContent = summary.violations;
    if (statusElement) statusElement.textContent = `${compliancePercentage}%`;
  }

  /**
   * Display Function Index results
   */
  displayFunctionIndexResults(data) {
    const resultsElement = document.getElementById('functionIndexResults');
    if (!resultsElement) return;

    if (data?.status === 'unavailable') {
      const lastUpdated =
        (window.LintStatusService &&
          typeof window.LintStatusService._formatTimestamp === 'function' &&
          window.LintStatusService._formatTimestamp(data.timestamp)) ||
        new Date(data.timestamp || Date.now()).toLocaleString('he-IL');

      resultsElement.innerHTML = `
        <div class="alert alert-info">
          <h6>Function Index לא זמין כרגע</h6>
          <p>${
            data.message ||
            'המחולל נמצא בבנייה. אפשר להפעיל את יצירת ה-Function Index הידנית ולהריץ שוב לאחר הפריסה.'
          }</p>
          <p class="text-muted mb-0">עודכן לאחרונה: ${lastUpdated}</p>
        </div>
      `;
      return;
    }

    if (!data || !data.data) {
      resultsElement.innerHTML = '<div class="text-center text-muted">אין נתונים זמינים</div>';
      return;
    }

    const { summary, pages } = data.data;
    const statusClass =
      summary.filesWithIndex === summary.total
        ? 'success'
        : summary.filesWithIndex > 0
          ? 'warning'
          : 'danger';

    let html = `
            <div class="alert alert-${statusClass}">
                <h6>Function Index Status</h6>
                <div class="row">
                    <div class="col-4">
                        <strong>${summary.total}</strong><br>
                        <small>סה"כ קבצים</small>
                    </div>
                    <div class="col-4">
                        <strong>${summary.filesWithIndex}</strong><br>
                        <small>עם אינדקס</small>
                    </div>
                    <div class="col-4">
                        <strong>${summary.filesWithoutIndex}</strong><br>
                        <small>ללא אינדקס</small>
                    </div>
                </div>
            </div>
        `;

    // Add pages breakdown
    if (pages && pages.length > 0) {
      html +=
        '<div class="mt-3"><h6>פירוט לפי עמודים:</h6><div class="table-responsive"><table class="table table-sm">';
      html +=
        '<thead><tr><th>עמוד</th><th>אינדקס</th><th>פונקציות</th><th>סטטוס</th></tr></thead><tbody>';

      pages.forEach(page => {
        const pageStatusClass = page.hasIndex ? 'success' : 'danger';
        const statusIcon = page.hasIndex ? '✅' : '❌';

        html += `
                    <tr>
                        <td>${page.file}</td>
                        <td>${page.hasIndex ? 'יש' : 'אין'}</td>
                        <td>${page.totalFunctions}</td>
                        <td><span class="badge bg-${pageStatusClass}">${statusIcon}</span></td>
                    </tr>
                `;
      });

      html += '</tbody></table></div></div>';
    }

    resultsElement.innerHTML = html;

    // Update stats
    const withIndexElement = document.getElementById('filesWithIndex');
    const withoutIndexElement = document.getElementById('filesWithoutIndex');
    const statusElement = document.getElementById('functionIndexStatus');

    if (withIndexElement) withIndexElement.textContent = summary.filesWithIndex;
    if (withoutIndexElement) withoutIndexElement.textContent = summary.filesWithoutIndex;
    if (statusElement) statusElement.textContent = `${summary.filesWithIndex}/${summary.total}`;
  }

  /**
   * Display duplicate detection results
   */
  displayDuplicateResults(data) {
    if (!data || !data.data) {
      this.lastCheckResults.duplicates = null;
      this.duplicateItems = [];
      this.filteredDuplicateItems = [];
      this.updateDuplicateSummary();
      this.updateDuplicateCategoryOptions();
      this.renderDuplicateTable();
      const duplicatesTotalElement = document.getElementById('duplicatesTotal');
      if (duplicatesTotalElement) {
        duplicatesTotalElement.textContent = '0';
      }
      return;
    }

    const payload = data.data;
    const summary = payload.summary || {};
    const duplicates = Array.isArray(payload.duplicates) ? payload.duplicates : [];

    this.lastCheckResults.duplicates = data;
    this.duplicateItems = duplicates;
    this.duplicateCategories = new Set(
      duplicates
        .map(item => item.category)
        .filter(category => category && category !== 'UNCATEGORIZED')
    );

    this.updateDuplicateSummary(summary);
    this.updateDuplicateCategoryOptions();
    this.renderDuplicateTable();
  }

  updateDuplicateSummary(summary = {}) {
    const setText = (id, value) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    };

    setText('duplicateTotalCount', summary.totalDuplicates ?? 0);
    setText('duplicateExactCount', summary.exactDuplicates ?? 0);
    setText('duplicateNearCount', summary.nearDuplicates ?? 0);
    setText('duplicateSimilarCount', summary.similarPatterns ?? 0);
    setText('duplicatePotentialCount', summary.potentialDuplicates ?? 0);

    const categoryCount = summary.categories
      ? Object.keys(summary.categories).length
      : this.duplicateCategories.size;
    setText('duplicateCategoryCount', categoryCount);
  }

  updateDuplicateCategoryOptions() {
    const categorySelect = document.getElementById('duplicateCategoryFilter');
    if (!categorySelect) {
      return;
    }

    const currentValue = categorySelect.value;
    const categories = Array.from(this.duplicateCategories).sort((a, b) =>
      a.localeCompare(b, 'he')
    );

    const options = ['<option value="all">הכל</option>'];
    categories.forEach(category => {
      options.push(`<option value="${category}">${category}</option>`);
    });

    categorySelect.innerHTML = options.join('');

    if (categories.includes(currentValue)) {
      categorySelect.value = currentValue;
      this.duplicateFilters.category = currentValue;
    } else {
      categorySelect.value = 'all';
      this.duplicateFilters.category = 'all';
    }
  }

  getFilteredDuplicates() {
    return this.duplicateItems.filter(item => {
      if (!item) return false;

      const typeMatch =
        this.duplicateFilters.type === 'all' ||
        item.type?.toLowerCase() === this.duplicateFilters.type;
      const categoryMatch =
        this.duplicateFilters.category === 'all' ||
        item.category === this.duplicateFilters.category;
      const similarityMatch = (item.similarity ?? 0) >= this.duplicateFilters.minSimilarity;

      return typeMatch && categoryMatch && similarityMatch;
    });
  }

  renderDuplicateTable() {
    const tableBody = document.getElementById('duplicateTableBody');
    if (!tableBody) {
      return;
    }

    const filtered = this.getFilteredDuplicates();
    this.filteredDuplicateItems = filtered;

    if (filtered.length === 0) {
      tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">לא נמצאו כפילויות עבור המסננים שנבחרו</td>
                </tr>
            `;
      this.renderDuplicateDetails();
      return;
    }

    const rows = filtered
      .map((duplicate, index) => {
        const confidenceClass = this.getConfidenceBadgeClass(duplicate.confidence);
        return `
                <tr data-duplicate-index="${index}">
                    <td>${this.formatDuplicateType(duplicate.type)}</td>
                    <td>${this.formatPercentage(duplicate.similarity)}</td>
                    <td><span class="badge ${confidenceClass}">${this.formatPercentage(duplicate.confidence)}</span></td>
                    <td>${this.formatFunctionLabel(duplicate.func1)}</td>
                    <td>${this.formatFunctionLabel(duplicate.func2)}</td>
                    <td>${this.formatDuplicateCategory(duplicate.category)}</td>
                </tr>
            `;
      })
      .join('');

    tableBody.innerHTML = rows;
    this.bindDuplicateRowEvents();

    // Ensure first item details are shown by default
    if (filtered.length > 0) {
      this.showDuplicateDetails(0);
    }
  }

  bindDuplicateRowEvents() {
    const tableBody = document.getElementById('duplicateTableBody');
    if (!tableBody) {
      return;
    }

    const rows = tableBody.querySelectorAll('[data-duplicate-index]');
    rows.forEach(row => {
      row.addEventListener('click', () => {
        const index = parseInt(row.getAttribute('data-duplicate-index'), 10);
        this.showDuplicateDetails(index);
      });
    });
  }

  showDuplicateDetails(index) {
    this.activeDuplicateIndex = index;

    const tableBody = document.getElementById('duplicateTableBody');
    if (tableBody) {
      const rows = tableBody.querySelectorAll('[data-duplicate-index]');
      rows.forEach(row => {
        const rowIndex = parseInt(row.getAttribute('data-duplicate-index'), 10);
        row.classList.toggle('table-active', rowIndex === index);
      });
    }

    const duplicate = this.filteredDuplicateItems[index];
    this.renderDuplicateDetails(duplicate);
  }

  renderDuplicateDetails(duplicate) {
    const panel = document.getElementById('duplicateDetailsPanel');
    if (!panel) {
      return;
    }

    if (!duplicate) {
      panel.innerHTML = '<div class="text-center text-muted">בחר רשומה כדי לראות פרטים מלאים</div>';
      return;
    }

    const similarity = this.formatPercentage(duplicate.similarity);
    const confidence = this.formatPercentage(duplicate.confidence);
    const recommendation = duplicate.recommendation;

    panel.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <h6 class="mb-2">פירוט כללי</h6>
                            <p class="mb-1"><strong>סוג כפילות:</strong> ${this.formatDuplicateType(duplicate.type)}</p>
                            <p class="mb-1"><strong>דמיון:</strong> ${similarity}</p>
                            <p class="mb-1"><strong>ביטחון:</strong> ${confidence}</p>
                            <p class="mb-1"><strong>קטגוריה:</strong> ${this.formatDuplicateCategory(duplicate.category)}</p>
                        </div>
                        <div class="col-md-4">
                            <h6 class="mb-2">פונקציה 1</h6>
                            <p class="mb-1"><strong>שם:</strong> ${this.escapeHtml(duplicate.func1?.name || '—')}</p>
                            <p class="mb-1"><strong>קובץ:</strong> ${this.escapeHtml(duplicate.func1?.file || '—')}</p>
                            <p class="mb-1"><strong>שורה:</strong> ${duplicate.func1?.startLine ?? '—'}</p>
                            <div class="small text-muted mt-2">
                                ${this.renderContentPreview(duplicate.func1?.content)}
                            </div>
                        </div>
                        <div class="col-md-4">
                            <h6 class="mb-2">פונקציה 2</h6>
                            <p class="mb-1"><strong>שם:</strong> ${this.escapeHtml(duplicate.func2?.name || '—')}</p>
                            <p class="mb-1"><strong>קובץ:</strong> ${this.escapeHtml(duplicate.func2?.file || '—')}</p>
                            <p class="mb-1"><strong>שורה:</strong> ${duplicate.func2?.startLine ?? '—'}</p>
                            <div class="small text-muted mt-2">
                                ${this.renderContentPreview(duplicate.func2?.content)}
                            </div>
                        </div>
                    </div>
                    ${
                      recommendation
                        ? `
                        <hr>
                        <h6 class="mb-2">המלצה</h6>
                        <p class="mb-1"><strong>עדיפות:</strong> ${recommendation.priority || '—'}</p>
                        <p class="mb-1"><strong>פעולה:</strong> ${this.escapeHtml(recommendation.action || '—')}</p>
                        <p class="mb-0">${this.escapeHtml(recommendation.description || '')}</p>
                    `
                        : ''
                    }
                </div>
            </div>
        `;
  }

  updateSimilarityDisplay(rawValue) {
    const slider = document.getElementById('duplicateSimilarityRange');
    const display = document.getElementById('duplicateSimilarityValue');
    const value = rawValue !== undefined ? rawValue : slider ? parseInt(slider.value, 10) : 70;

    if (slider && rawValue === undefined) {
      slider.value = value;
    }

    if (display) {
      display.textContent = `${value}%`;
    }
  }

  resetDuplicateFilters() {
    this.duplicateFilters = {
      type: 'all',
      category: 'all',
      minSimilarity: 0.7,
    };

    const typeSelect = document.getElementById('duplicateTypeFilter');
    const categorySelect = document.getElementById('duplicateCategoryFilter');
    const similarityRange = document.getElementById('duplicateSimilarityRange');

    if (typeSelect) typeSelect.value = 'all';
    if (categorySelect) categorySelect.value = 'all';
    if (similarityRange) similarityRange.value = 70;

    this.updateSimilarityDisplay(70);
    this.renderDuplicateTable();
  }

  formatDuplicateType(type) {
    const map = {
      exact: 'כפילות מדויקת',
      near: 'כפילות קרובה',
      similar: 'דפוס דומה',
      potential: 'כפילות פוטנציאלית',
    };
    return map[type?.toLowerCase()] || type || '—';
  }

  formatDuplicateCategory(category) {
    if (!category || category === 'UNCATEGORIZED') {
      return 'ללא קטגוריה';
    }
    return category;
  }

  formatPercentage(value) {
    if (value === undefined || value === null) {
      return '0%';
    }
    return `${Math.round(value * 100)}%`;
  }

  formatFunctionLabel(func) {
    if (!func) {
      return '—';
    }
    const name = func.name || '—';
    const file = func.file || '—';
    return `${this.escapeHtml(name)} <span class="text-muted">(${this.escapeHtml(file)})</span>`;
  }

  getConfidenceBadgeClass(confidence) {
    const percentage = (confidence ?? 0) * 100;
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 60) return 'bg-warning text-dark';
    return 'bg-danger';
  }

  renderContentPreview(content) {
    if (!content) {
      return '';
    }
    const trimmed = content.trim();
    const preview = trimmed.substring(0, 400);
    const suffix = trimmed.length > 400 ? '…' : '';
    return this.escapeHtml(preview) + suffix;
  }

  escapeHtml(text) {
    if (!text) {
      return '';
    }
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Update summary statistics
   */
  updateSummaryStats() {
    const totalFunctionsElement = document.getElementById('totalFunctions');
    const errorHandlingCoverageElement = document.getElementById('errorHandlingCoverage');
    const jsdocCoverageElement = document.getElementById('jsdocCoverage');
    const namingComplianceElement = document.getElementById('namingCompliance');
    const duplicatesTotalElement = document.getElementById('duplicatesTotal');

    if (this.lastCheckResults.errorHandling && this.lastCheckResults.errorHandling.data) {
      if (totalFunctionsElement)
        totalFunctionsElement.textContent = this.lastCheckResults.errorHandling.data.summary.total;
      if (errorHandlingCoverageElement)
        errorHandlingCoverageElement.textContent =
          this.lastCheckResults.errorHandling.data.summary.coveragePercentage + '%';
    }

    if (this.lastCheckResults.jsdoc && this.lastCheckResults.jsdoc.data) {
      if (jsdocCoverageElement)
        jsdocCoverageElement.textContent =
          this.lastCheckResults.jsdoc.data.summary.coveragePercentage + '%';
    }

    if (this.lastCheckResults.naming && this.lastCheckResults.naming.data) {
      const summary = this.lastCheckResults.naming.data.summary;
      const compliancePercentage =
        summary.total > 0 ? ((summary.compliant / summary.total) * 100).toFixed(2) : 0;
      if (namingComplianceElement) namingComplianceElement.textContent = compliancePercentage + '%';
    }

    if (this.lastCheckResults.duplicates && this.lastCheckResults.duplicates.data) {
      if (duplicatesTotalElement) {
        duplicatesTotalElement.textContent =
          this.lastCheckResults.duplicates.data.summary.totalDuplicates ?? 0;
      }
    }
  }

  /**
   * Update last update time
   */
  updateLastUpdateTime() {
    const lastUpdateElement = document.getElementById('lastUpdateTime');
    if (lastUpdateElement) {
      lastUpdateElement.textContent = new Date().toLocaleTimeString('he-IL');
    }
  }

  /**
   * Show loading state
   */
  showLoadingState() {
    const sections = [
      'errorHandlingResults',
      'jsdocResults',
      'namingResults',
      'functionIndexResults',
      'duplicateResults',
    ];
    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.innerHTML =
          '<div class="text-center text-muted"><i class="fas fa-spinner fa-spin"></i> טוען...</div>';
      }
    });

    const duplicateDetails = document.getElementById('duplicateDetailsPanel');
    if (duplicateDetails) {
      duplicateDetails.innerHTML =
        '<div class="text-center text-muted"><i class="fas fa-spinner fa-spin"></i> טוען כפילויות...</div>';
    }
  }

  /**
   * Show error state
   */
  showErrorState(message) {
    const sections = [
      'errorHandlingResults',
      'jsdocResults',
      'namingResults',
      'functionIndexResults',
      'duplicateResults',
    ];
    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.innerHTML = `<div class="text-center text-danger">❌ ${message}</div>`;
      }
    });

    const duplicateDetails = document.getElementById('duplicateDetailsPanel');
    if (duplicateDetails) {
      duplicateDetails.innerHTML = `<div class="text-center text-danger">❌ ${message}</div>`;
    }
  }

  /**
   * Refresh dashboard
   */
  async refreshDashboard() {
    try {
      await this.runAllChecks();
    } catch (error) {
      if (window.Logger) {
        window.Logger.error('Error refreshing dashboard:', error, {
          page: 'code-quality-dashboard',
        });
      }
    }
  }
}

// Global functions for button onclick handlers
window.runAllChecks = async function () {
  if (window.codeQualityDashboard) {
    await window.codeQualityDashboard.runAllChecks();
  }
};

window.runErrorHandlingCheck = async function () {
  if (window.codeQualityDashboard) {
    await window.codeQualityDashboard.runErrorHandlingCheck();
  }
};

window.runJSDocCheck = async function () {
  if (window.codeQualityDashboard) {
    await window.codeQualityDashboard.runJSDocCheck();
  }
};

window.runNamingCheck = async function () {
  if (window.codeQualityDashboard) {
    await window.codeQualityDashboard.runNamingCheck();
  }
};

window.runFunctionIndexCheck = async function () {
  if (window.codeQualityDashboard) {
    await window.codeQualityDashboard.runFunctionIndexCheck();
  }
};

window.generateFunctionIndex = async function () {
  if (window.codeQualityDashboard) {
    await window.codeQualityDashboard.generateFunctionIndex();
  }
};

window.runDuplicateCheck = async function () {
  if (window.codeQualityDashboard) {
    await window.codeQualityDashboard
      .runDuplicateCheck()
      .then(result => {
        window.codeQualityDashboard.displayDuplicateResults(result);
        window.codeQualityDashboard.updateSummaryStats();
        window.codeQualityDashboard.updateLastUpdateTime();
        if (typeof window.showSuccessNotification === 'function') {
          window.showSuccessNotification('בדיקת הכפילויות הסתיימה בהצלחה');
        }
      })
      .catch(() => {
        const resultsElement = document.getElementById('duplicateResults');
        if (resultsElement) {
          resultsElement.innerHTML =
            '<div class="text-center text-danger">❌ שגיאה בהרצת בדיקת הכפילויות</div>';
        }
        const detailsElement = document.getElementById('duplicateDetailsPanel');
        if (detailsElement) {
          detailsElement.innerHTML =
            '<div class="text-center text-danger">❌ לא ניתן להציג פרטי כפילויות</div>';
        }
        if (typeof window.showErrorNotification === 'function') {
          window.showErrorNotification('שגיאה', 'בדיקת הכפילויות נכשלה');
        }
      });
  }
};

window.resetDuplicateFilters = function () {
  if (window.codeQualityDashboard) {
    window.codeQualityDashboard.resetDuplicateFilters();
  }
};

window.refreshDashboard = async function () {
  if (window.codeQualityDashboard) {
    await window.codeQualityDashboard.refreshDashboard();
  }
};

// Create global instance
const codeQualityDashboard = new CodeQualityDashboard();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    codeQualityDashboard.init();
  });
} else {
  codeQualityDashboard.init();
}

// Export globally
window.codeQualityDashboard = codeQualityDashboard;

if (window.Logger) {
  window.Logger.info('✅ Code Quality Dashboard loaded successfully', {
    page: 'code-quality-dashboard',
  });
}

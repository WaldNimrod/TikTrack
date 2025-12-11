/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 5
 * 
 * PAGE INITIALIZATION (1)
 * - initializeResearchPage() - initializeResearchPage function
 * 
 * DATA LOADING (2)
 * - getContainer() - getContainer function
 * - loadResearchData() - * Render data state with timestamp
 * 
 * UI UPDATES (2)
 * - renderPlaceholder() - * Get dashboard container element
 * - renderDataState() - * Get dashboard container element
 *
 * EOD INTEGRATION (2)
 * - loadEODResearchData() - Load EOD data for research analysis
 * - generateResearchInsights() - Generate insights from EOD data
 * 
 * ==========================================
 */
(function researchPageController() {
  const DASHBOARD_CONTAINER_ID = 'researchDashboardShell';

  const state = {
    data: null,
    lastUpdated: null,
    loading: false,
    lastError: null,
    errorNotified: false,
  };

  window.researchDashboardState = state;

  /**
   * Get dashboard container element
   * @returns {HTMLElement|null} Dashboard container element or null if not found
   */
  function getContainer() {
    return document.getElementById(DASHBOARD_CONTAINER_ID);
  }

  /**
   * Render placeholder message or error state
   * @param {Error|null} error - Error object to display, or null for idle state
   * @returns {void}
   */
  function renderPlaceholder(error) {
    const container = getContainer();
    if (!container) {
      return;
    }

    const message =
      error?.message ||
      'הדשבורד מחכה לחיבור שירותי המחקר. לאחר חיבור הנתונים נראה כאן כרטיסיות וגרפים.';

    container.textContent = '';
    const placeholder = document.createElement('div');
    placeholder.className = 'dashboard-placeholder';
    placeholder.setAttribute('data-state', error ? 'error' : 'idle');
    const p = document.createElement('p');
    p.textContent = message;
    placeholder.appendChild(p);
    container.appendChild(placeholder);
  }

  /**
   * Render data state with timestamp
   * @returns {void}
   */
  function renderDataState() {
    const container = getContainer();
    if (!container) {
      return;
    }

    if (!state.data) {
      renderPlaceholder(state.lastError);
      return;
    }

    const timestamp = new Date(state.lastUpdated).toLocaleString('he-IL');
    container.textContent = '';
        // Convert HTML string to DOM elements safely
        const parser = new DOMParser();
        const doc = parser.parseFromString(`
      <div class="info-summary" data-component="research-dashboard">
        <p>נתוני מחקר זמינים (עודכנו ב-${timestamp}).</p>
      </div>
    `, 'text/html');
        const fragment = document.createDocumentFragment();
        Array.from(doc.body.childNodes).forEach(node => {
            fragment.appendChild(node.cloneNode(true));
        });
        container.appendChild(fragment);
  }

  /**
   * Load research data from service or API
   * @param {Object} [options={}] - Loading options
   * @param {boolean} [options.forceRefresh=false] - Force refresh from server
   * @returns {Promise<void>}
   */
  async function loadResearchData(options = {}) {
    const container = getContainer();
    if (!container) {
      return;
    }

    try {
      state.loading = true;
      container.setAttribute('data-loading', 'true');

      const useService = typeof window.ResearchData?.loadResearchData === 'function';
      const data = useService ? await window.ResearchData.loadResearchData(options) : null;

      // === EOD INTEGRATION: Load EOD research data ===
      const eodResearchData = await loadEODResearchData(options);
      if (eodResearchData) {
        // Merge EOD data with existing research data
        state.eodData = eodResearchData;
        if (data) {
          state.data = { ...data, eodMetrics: eodResearchData };
        } else {
          state.data = { eodMetrics: eodResearchData };
        }
      }

      state.data = data;
      state.lastUpdated = Date.now();
      state.lastError = null;
      renderDataState();
    } catch (error) {
      state.lastError = error;
      renderPlaceholder(error);

      if (!state.errorNotified) {
        window.showWarningNotification?.('דשבורד תחקיר', error?.message || '');
        state.errorNotified = true;
      }
    } finally {
      state.loading = false;
      container.removeAttribute('data-loading');
    }
  }

  /**
   * Initialize research dashboard shell
   * @returns {Promise<void>}
   */
  async function initializeResearchPage() {
    window.Logger?.info('Initializing research dashboard shell', { page: 'research' });
    renderPlaceholder();
    await loadResearchData();
  }

  // === EOD INTEGRATION: Load EOD research data ===
  async function loadEODResearchData(options = {}) {
    try {
      window.Logger?.debug('🔍 Research Page - טוען נתוני EOD למחקר');

      // Load historical portfolio performance for backtesting
      const historicalPerformance = await window.EODIntegrationHelper.loadEODPortfolioMetrics(
        null, // global user
        {
          date_from: options.dateFrom || '2024-01-01',
          date_to: options.dateTo || new Date().toISOString().split('T')[0]
        }
      );

      // Load comparison data for research analysis
      const comparisonData = await window.EODIntegrationHelper.loadEODComparisonData({
        entity_type: options.entityType || 'portfolio',
        entity_id: options.entityId,
        date_from: options.dateFrom || '2024-01-01',
        date_to: options.dateTo || new Date().toISOString().split('T')[0]
      });

      // Load performance stats for research insights
      const performanceStats = await window.EODIntegrationHelper.loadEODPerformanceStats();

      const eodResearchData = {
        historicalPerformance: historicalPerformance?.data || [],
        comparisonData: comparisonData?.data || [],
        performanceStats: performanceStats || {},
        analysisTimestamp: new Date().toISOString(),
        researchInsights: generateResearchInsights(historicalPerformance?.data || [], comparisonData?.data || [])
      };

      if (window.Logger && eodResearchData.historicalPerformance.length > 0) {
        window.Logger.info(`✅ Loaded EOD research data for analysis`, {
          page: 'research',
          performanceRecords: eodResearchData.historicalPerformance.length,
          comparisonRecords: eodResearchData.comparisonData.length
        });
      }

      return eodResearchData;

    } catch (error) {
      window.Logger?.error('❌ Failed to load EOD research data:', error);
      return null;
    }
  }

  // === EOD INTEGRATION: Generate research insights from EOD data ===
  function generateResearchInsights(historicalData, comparisonData) {
    if (!Array.isArray(historicalData) || historicalData.length === 0) {
      return [];
    }

    const insights = [];

    try {
      // Calculate basic metrics
      const returns = historicalData
        .filter(d => d.total_return_pct !== undefined)
        .map(d => d.total_return_pct);

      if (returns.length > 0) {
        const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const maxReturn = Math.max(...returns);
        const minReturn = Math.min(...returns);
        const volatility = Math.sqrt(
          returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
        );

        insights.push({
          type: 'performance_summary',
          title: 'סיכום ביצועים היסטורי',
          description: `תשואה ממוצעת: ${(avgReturn * 100).toFixed(2)}%, תנודתיות: ${(volatility * 100).toFixed(2)}%`,
          data: { avgReturn, maxReturn, minReturn, volatility }
        });
      }

      // Generate comparison insights
      if (Array.isArray(comparisonData) && comparisonData.length > 0) {
        insights.push({
          type: 'comparison_analysis',
          title: 'ניתוח השוואתי',
          description: `זמינים ${comparisonData.length} רשומות להשוואה היסטורית`,
          data: { comparisonRecords: comparisonData.length }
        });
      }

      // Risk analysis
      const drawdowns = historicalData
        .filter(d => d.max_drawdown_pct !== undefined)
        .map(d => d.max_drawdown_pct);

      if (drawdowns.length > 0) {
        const maxDrawdown = Math.max(...drawdowns);
        insights.push({
          type: 'risk_analysis',
          title: 'ניתוח סיכונים',
          description: `שיא ירידה מקסימלי: ${(maxDrawdown * 100).toFixed(2)}%`,
          data: { maxDrawdown }
        });
      }

    } catch (error) {
      window.Logger?.error('Failed to generate research insights:', error);
    }

    return insights;
  }

window.initializeResearchPage = initializeResearchPage;
window.loadResearchData = loadResearchData;
window.loadEODResearchData = loadEODResearchData;
})();


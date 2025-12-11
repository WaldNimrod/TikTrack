/**
 * Chart Management Page Script
 * ===========================
 * Controls the development dashboard for managing Chart.js demos.
 * 
 * @version 1.0.0
 * @author TikTrack Development Team
 * 
 * ============================================================================
 * FUNCTION INDEX - Chart Management Page
 * ============================================================================
 * 
 * Class: ChartManagement
 * 
 * Initialization:
 * - constructor() - Initialize ChartManagement instance
 * - init() - Initialize chart management system
 * - ensureChartSystem() - Ensure Chart.js system is loaded
 * - registerAdapters() - Register performance and trades adapters
 * 
 * DOM Management:
 * - cacheElements() - Cache DOM elements for performance
 * - attachEvents() - Attach event listeners
 * - ensureChartsListContainer() - Ensure charts list container exists
 * - ensureChartContainer(chartId, title) - Ensure chart container exists
 * 
 * Chart Operations:
 * - refreshChartsStatus() - Refresh charts status display
 * - renderChart({ id, title, type, generator, data, container, options }) - Render chart
 * - createTestChart() - Create test chart
 * - createPerformanceChart() - Create performance chart
 * - createAccountChart() - Create account chart
 * - createMixedChart() - Create mixed chart
 * - updateTestChart() - Update test chart
 * - refreshAllCharts() - Refresh all charts
 * - removeChart(chartId) - Remove chart by ID
 * - destroyAllCharts() - Destroy all charts
 * 
 * Export:
 * - exportAllCharts(format) - Export all charts
 * - exportTestChart(format) - Export test chart
 * 
 * ============================================================================
 */

;(function () {
  const TEST_CHART_ID = 'chart-management-test';
  const TEST_CHART_CANVAS = '#testChart';

  class ChartManagement {
    constructor() {
      this.chartSystem = null;
      this.performanceAdapter = window.PerformanceAdapter || null;
      this.tradesAdapter = window.tradesAdapter || (window.TradesAdapter ? new window.TradesAdapter() : null);
      this.chartRegistry = new Map();
      this.autoRefreshTimer = null;
      this.initialized = false;
      this.state = {
        autoRefresh: false,
        refreshInterval: 30,
        theme: 'default',
      };
      this.elements = {};
    }

    async init() {
      if (this.initialized) {
        await this.refreshChartsStatus();
        return;
      }

      await this.ensureChartSystem();
      await this.registerAdapters();
      this.cacheElements();
      this.attachEvents();
      await this.refreshChartsStatus();
      this.initialized = true;
    }

    async ensureChartSystem() {
      if (window.ChartLoader && !window.chartLoader) {
        window.chartLoader = new window.ChartLoader();
      }
      if (window.chartLoader?.load) {
        await window.chartLoader.load();
      }

      // אם המערכת לא זמינה עדיין, לנסות לטעון סקריפט Chart System באופן דינמי
      if (!window.ChartSystem && typeof window.loadScriptOnce === 'function') {
        try {
          await window.loadScriptOnce('/scripts/charts/chart-system.js');
        } catch (e) {
          window.Logger?.warn?.('ChartSystem script load failed', { page: 'chart-management', error: e?.message });
        }
      }

      if (!this.chartSystem || typeof this.chartSystem.create !== 'function') {
        // window.ChartSystem is already an instance (from chart-system.js), not a class
        if (window.ChartSystem && typeof window.ChartSystem.create === 'function') {
          this.chartSystem = window.ChartSystem;
        } else {
          // Fallback: create new instance if ChartSystem class is available
          if (typeof ChartSystem !== 'undefined') {
            this.chartSystem = new ChartSystem();
            window.ChartSystem = this.chartSystem;
          } else {
            window.Logger?.error?.('ChartSystem not available', { page: 'chart-management' });
          }
        }
      }
    }

    async registerAdapters() {
      if (this.performanceAdapter && typeof this.chartSystem.registerAdapter === 'function') {
        this.chartSystem.registerAdapter('performance', this.performanceAdapter);
      }
      if (!this.tradesAdapter && window.TradesAdapter) {
        this.tradesAdapter = new window.TradesAdapter();
      }
    }

    cacheElements() {
      this.elements.totalCharts = document.getElementById('totalCharts');
      this.elements.activeCharts = document.getElementById('activeCharts');
      this.elements.errorCharts = document.getElementById('errorCharts');
      this.elements.memoryUsage = document.getElementById('memoryUsage');
      this.elements.chartsList = document.getElementById('chartsList');
      this.elements.chartTheme = document.getElementById('chartTheme');
      this.elements.autoRefresh = document.getElementById('autoRefresh');
      this.elements.refreshInterval = document.getElementById('refreshInterval');
      this.elements.exportFormat = document.getElementById('exportFormat');
    }

    attachEvents() {
      if (this.elements.chartTheme) {
        this.state.theme = this.elements.chartTheme.value;
      }
      if (this.elements.refreshInterval) {
        this.state.refreshInterval = Number(this.elements.refreshInterval.value) || 30;
      }
    }

    async refreshChartsStatus() {
      if (!this.chartSystem) {
        return;
      }
      const status = this.chartSystem.getStatus();
      if (this.elements.totalCharts) {
        this.elements.totalCharts.textContent = String(status.chartsCount || 0);
      }
      if (this.elements.activeCharts) {
        this.elements.activeCharts.textContent = String(status.chartsCount || 0);
      }
      if (this.elements.errorCharts) {
        this.elements.errorCharts.textContent = status.chartJsAvailable ? '0' : '1';
      }
      if (this.elements.memoryUsage) {
        const memory =
          window.performance &&
          window.performance.memory &&
          window.performance.memory.usedJSHeapSize
            ? `${(window.performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB`
            : 'לא זמין';
        this.elements.memoryUsage.textContent = memory;
      }
    }

    ensureChartsListContainer() {
      if (!this.elements.chartsList) {
        return;
      }
      const placeholder = this.elements.chartsList.querySelector('[data-empty-state]');
      if (placeholder) {
        placeholder.remove();
      }
    }

    ensureChartContainer(chartId, title) {
      this.ensureChartsListContainer();
      const existing = document.querySelector(`[data-chart-card="${chartId}"]`);
      if (existing) {
        return `#${existing.querySelector('canvas')?.id}`;
      }

      const canvasId = `${chartId}-canvas`;
      const card = document.createElement('div');
      card.className = 'card mb-3';
      card.dataset.chartCard = chartId;
      // Build card HTML and insert using tempDiv
      const cardHTML = `
        <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">${title}</h6>
            <button class="btn btn-sm btn-outline-danger" data-chart-remove="${chartId}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="card-body">
            <canvas id="${canvasId}" height="320"></canvas>
        </div>
      `;
      const parser = new DOMParser();
      const doc = parser.parseFromString(cardHTML, 'text/html');
      doc.body.childNodes.forEach(node => {
        card.appendChild(node.cloneNode(true));
      });
      this.elements.chartsList.appendChild(card);

      const removeBtn = card.querySelector('[data-chart-remove]');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => this.removeChart(chartId));
      }

      return `#${canvasId}`;
    }

    async renderChart({ id, title, type, generator, data, container, options }) {
      const targetSelector = container || this.ensureChartContainer(id, title);
      const payload = data || (await generator?.());
      if (!payload || !payload.data) {
        window.Logger?.warn('ChartManagement: missing data payload', { id, title });
        return;
      }

      await this.chartSystem.create({
        id,
        type,
        container: targetSelector,
        data: payload.data,
        options: {
          plugins: {
            title: {
              display: true,
              text: title,
            },
            legend: {
              position: 'bottom',
            },
          },
          ...options,
        },
      });

      this.chartRegistry.set(id, {
        title,
        type,
        container: targetSelector,
        generator,
      });

      await this.refreshChartsStatus();
    }

    async createTestChart() {
      if (!this.tradesAdapter) {
        window.Logger?.warn('ChartManagement: TradesAdapter not available');
        return;
      }

      /**
       * Generator function for test chart data
       * @returns {Promise<Object>} Chart data object
       */
      const generator = async () => {
        const raw = await this.tradesAdapter.getData({ limit: 200 });
        return { data: this.tradesAdapter.formatDataForStatusChart(raw) };
      };

      await this.renderChart({
        id: TEST_CHART_ID,
        title: 'התפלגות סטטוס טריידים',
        type: 'doughnut',
        generator,
        container: TEST_CHART_CANVAS,
      });
    }

    async createPerformanceChart() {
      if (!this.performanceAdapter) {
        window.Logger?.warn('ChartManagement: PerformanceAdapter not available');
        return;
      }

      /**
       * Generator function for performance chart data
       * @returns {Promise<Object>} Chart data object
       */
      const generator = async () => {
        const raw = await this.performanceAdapter.getData();
        return { data: this.performanceAdapter.formatData(raw) };
      };

      await this.renderChart({
        id: 'chart-management-performance',
        title: 'ביצועים חודשיים',
        type: 'line',
        generator,
      });
    }

    async createAccountChart() {
      if (!this.tradesAdapter) {
        return;
      }

      /**
       * Generator function for account chart data
       * @returns {Promise<Object>} Chart data object
       */
      const generator = async () => {
        const raw = await this.tradesAdapter.getData({ include_accounts: true });
        return { data: this.tradesAdapter.formatDataForAccountChart(raw) };
      };

      await this.renderChart({
        id: 'chart-management-accounts',
        title: 'טריידים לפי חשבון',
        type: 'bar',
        generator,
        options: {
          responsive: true,
          scales: {
            x: { stacked: false },
            y: { beginAtZero: true },
          },
        },
      });
    }

    async createMixedChart() {
      if (!this.tradesAdapter) {
        return;
      }

      /**
       * Generator function for mixed chart data
       * @returns {Promise<Object>} Chart data object with labels and datasets
       */
      const generator = async () => {
        const raw = await this.tradesAdapter.getData({ limit: 200 });
        const labels = raw.data?.map(trade => trade.created_at?.slice(0, 10)) || [];
        const totals = raw.data?.map(trade => trade.total_pl || 0) || [];
        const costs = raw.data?.map(trade => trade.entry_price || 0) || [];

        return {
          data: {
            labels,
            datasets: [
              {
                type: 'line',
                label: 'רווח/הפסד',
                data: totals,
                borderColor: '#26baac',
                backgroundColor: 'rgba(38, 186, 172, 0.2)',
                yAxisID: 'y',
              },
              {
                type: 'bar',
                label: 'מחיר כניסה',
                data: costs,
                backgroundColor: 'rgba(252, 90, 6, 0.4)',
                borderColor: '#fc5a06',
                yAxisID: 'y1',
              },
            ],
          },
        };
      };

      await this.renderChart({
        id: 'chart-management-mixed',
        title: 'ביצועים מול עלות',
        type: 'bar',
        generator,
        options: {
          responsive: true,
          scales: {
            y: {
              type: 'linear',
              position: 'left',
            },
            y1: {
              type: 'linear',
              position: 'right',
              grid: {
                drawOnChartArea: false,
              },
            },
          },
        },
      });
    }

    async updateTestChart() {
      await this.createTestChart();
    }

    async refreshAllCharts() {
      const refreshTasks = [];
      for (const [id, entry] of this.chartRegistry.entries()) {
        if (typeof entry.generator === 'function') {
          refreshTasks.push(
            this.renderChart({
              id,
              title: entry.title,
              type: entry.type,
              generator: entry.generator,
              container: entry.container,
            })
          );
        }
      }

      if (refreshTasks.length === 0) {
        await this.createTestChart();
      } else {
        await Promise.all(refreshTasks);
      }
    }

    removeChart(chartId) {
      this.chartSystem.destroy(chartId);
      this.chartRegistry.delete(chartId);

      const card = document.querySelector(`[data-chart-card="${chartId}"]`);
      if (card) {
        card.remove();
      }
      this.refreshChartsStatus();
    }

    destroyAllCharts() {
      this.chartSystem.destroyAll();
      this.chartRegistry.clear();
      if (this.elements.chartsList) {
        this.elements.chartsList.innerHTML.textContent = '';
        const div = document.createElement('div');
        div.className = 'text-muted';
        div.textContent = 'אין גרפים פעילים כרגע';
        chartsList.innerHTML.appendChild(div);
      }
      this.refreshChartsStatus();
    }

    exportAllCharts(format = 'png') {
      for (const chartId of this.chartRegistry.keys()) {
        this.chartSystem.export(chartId, format.toUpperCase());
      }
    }

    exportTestChart(format = 'png') {
      this.chartSystem.export(TEST_CHART_ID, format.toUpperCase());
    }

    changeTheme(theme) {
      this.state.theme = theme;
      this.chartSystem.setTheme?.(theme);
    }

    toggleAutoRefresh(enabled) {
      this.state.autoRefresh = enabled;
      if (this.autoRefreshTimer) {
        clearInterval(this.autoRefreshTimer);
        this.autoRefreshTimer = null;
      }

      if (enabled) {
        const intervalMs = this.state.refreshInterval * 1000;
        this.autoRefreshTimer = setInterval(() => {
          this.refreshAllCharts();
        }, intervalMs);
      }
    }

    updateRefreshInterval(intervalSeconds) {
      this.state.refreshInterval = Math.max(5, Number(intervalSeconds) || 30);
      if (this.state.autoRefresh) {
        this.toggleAutoRefresh(true);
      }
    }
  }

  const chartManagement = new ChartManagement();

  /**
   * Load and initialize chart management instance
   * @returns {Promise<ChartManagement>} Initialized chart management instance
   */
  async function loadChartManagement() {
    await chartManagement.init();
    return chartManagement;
  }

  /**
   * Expose action handler globally
   * @param {string} action - Action name to expose
   * @param {Function} handler - Handler function
   * @returns {void}
   */
  function expose(action, handler) {
    window[action] = async (...args) => {
      await loadChartManagement();
      return handler(...args);
    };
  }

  expose('refreshChartsStatus', () => chartManagement.refreshChartsStatus());
  expose('exportAllCharts', () => {
    const format = chartManagement.elements.exportFormat?.value || 'png';
    chartManagement.exportAllCharts(format);
  });
  expose('createNewChart', () => chartManagement.createTestChart());
  expose('refreshAllCharts', () => chartManagement.refreshAllCharts());
  expose('destroyAllCharts', () => chartManagement.destroyAllCharts());
  expose('createTestChart', () => chartManagement.createTestChart());
  expose('createPerformanceChart', () => chartManagement.createPerformanceChart());
  expose('createAccountChart', () => chartManagement.createAccountChart());
  expose('createMixedChart', () => chartManagement.createMixedChart());
  expose('updateTestChart', () => chartManagement.updateTestChart());
  expose('exportTestChart', () => {
    const format = chartManagement.elements.exportFormat?.value || 'png';
    chartManagement.exportTestChart(format);
  });
  expose('destroyTestChart', () => chartManagement.removeChart(TEST_CHART_ID));
  expose('changeChartTheme', theme => chartManagement.changeTheme(theme));
  expose('toggleAutoRefresh', enabled => chartManagement.toggleAutoRefresh(enabled));
  expose('setRefreshInterval', interval => chartManagement.updateRefreshInterval(interval));

  window.ChartManagement = ChartManagement;
  window.loadChartManagement = loadChartManagement;

  document.addEventListener('DOMContentLoaded', () => {
    loadChartManagement();
  });
})();

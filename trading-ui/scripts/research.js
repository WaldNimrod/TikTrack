/**
 * Research Page Controller
 * ========================
 * Minimal dashboard shell (no mock data, no legacy stubs).
 * 
 * @version 1.0.0
 * @author TikTrack Development Team
 * 
 * ============================================================================
 * FUNCTION INDEX - Research Page
 * ============================================================================
 * 
 * Initialization:
 * - initializeResearchPage() - Initialize research dashboard shell
 * 
 * Data Loading:
 * - loadResearchData(options) - Load research data from service or API
 * 
 * Rendering:
 * - renderPlaceholder(error) - Render placeholder message or error
 * - renderDataState() - Render data state with timestamp
 * 
 * Utilities:
 * - getContainer() - Get dashboard container element
 * 
 * ============================================================================
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
    container.innerHTML = `
      <div class="info-summary" data-component="research-dashboard">
        <p>נתוני מחקר זמינים (עודכנו ב-${timestamp}).</p>
      </div>
    `;
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

window.initializeResearchPage = initializeResearchPage;
window.loadResearchData = loadResearchData;
})();


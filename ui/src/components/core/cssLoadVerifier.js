/**
 * CSS Load Verifier - PhoenixBridge
 *
 * Version: v1.1.0
 * Team: Team 40 (UI Assets & Design) - "שומרי ה-DNA"
 * Date: 2026-02-07
 * Status: ✅ CORE FILE - DESIGN SPRINT
 *
 * Purpose:
 * Verify CSS loading order and CSS Variables availability.
 * Ensures phoenix-base.css (DNA Variables) is loaded first among Phoenix CSS files.
 *
 * CSS Loading Rule (Option B):
 * - Pico CSS (if exists) can be loaded before phoenix-base.css
 * - phoenix-base.css must be first among Phoenix CSS files
 * - All other Phoenix CSS files must be loaded after phoenix-base.css
 *
 * Integration:
 * Used by UAI DOMStage to verify CSS before continuing lifecycle.
 *
 * Usage:
 * import { CSSLoadVerifier } from './cssLoadVerifier.js';
 * const verifier = new CSSLoadVerifier({ strictMode: true });
 * await verifier.verifyCSSLoadOrder();
 */

import { maskedLog } from '../../utils/maskedLog.js';

class CSSLoadVerifier {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   * @param {string} options.baseCSSFile - Base CSS filename (default: 'phoenix-base.css')
   * @param {string[]} options.criticalVariables - Critical CSS Variables to check
   * @param {boolean} options.strictMode - Throw errors on failure (default: true)
   */
  constructor(options = {}) {
    this.options = {
      baseCSSFile: 'phoenix-base.css',
      criticalVariables: [
        '--color-primary',
        '--font-family-primary',
        '--spacing-md',
        '--apple-text-primary',
        '--z-index-sticky',
      ],
      strictMode: true, // Throw errors on failure
      ...options,
    };
  }

  /**
   * Verify CSS loading order
   * Main function that performs all checks
   *
   * @returns {Promise<boolean>} - true if order is correct
   * @throws {Error} - if strictMode is true and verification fails
   */
  async verifyCSSLoadOrder() {
    // 1. Check if phoenix-base.css is loaded first
    const baseCSSLoaded = this.checkCSSLoaded(this.options.baseCSSFile);
    if (!baseCSSLoaded) {
      const error = new Error(
        `${this.options.baseCSSFile} must be loaded first`,
      );
      error.code = 'CSS_BASE_FILE_NOT_LOADED';
      if (this.options.strictMode) {
        throw error;
      }
      maskedLog(`❌ ${error.message}`, { code: error.code });
      return false;
    }

    // 2. Verify CSS Variables are available
    const variablesAvailable = this.checkCSSVariables();
    if (!variablesAvailable) {
      const error = new Error(
        'CSS Variables from phoenix-base.css are not available',
      );
      error.code = 'CSS_VARIABLES_NOT_AVAILABLE';
      if (this.options.strictMode) {
        throw error;
      }
      maskedLog(`❌ ${error.message}`, { code: error.code });
      return false;
    }

    // 3. Check loading order of other CSS files
    const orderCorrect = this.checkLoadingOrder();
    if (!orderCorrect) {
      const error = new Error(
        `${this.options.baseCSSFile} must be loaded first`,
      );
      error.code = 'CSS_LOAD_ORDER_INCORRECT';
      if (this.options.strictMode) {
        throw error;
      }
      maskedLog(`⚠️ ${error.message}`, { code: error.code });
      return false;
    }

    maskedLog('✅ CSS Load Order Verified');
    return true;
  }

  /**
   * Check if specific CSS file is loaded
   *
   * @param {string} filename - CSS filename to check
   * @returns {boolean} - true if file is loaded, false otherwise
   */
  checkCSSLoaded(filename) {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    for (const link of links) {
      if (link.href.includes(filename)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if CSS Variables are available
   * Verifies that critical CSS Variables from phoenix-base.css are available
   *
   * @returns {boolean} - true if all critical variables are available, false otherwise
   */
  checkCSSVariables() {
    // Check for critical CSS Variables from phoenix-base.css
    const root = getComputedStyle(document.documentElement);

    for (const varName of this.options.criticalVariables) {
      const value = root.getPropertyValue(varName);
      if (!value || value.trim() === '') {
        maskedLog(`❌ CSS Variable ${varName} is not available`, { varName });
        return false;
      }
    }

    return true;
  }

  /**
   * Check loading order of CSS files
   * Verifies that phoenix-base.css is loaded first among Phoenix CSS files
   * (Pico CSS can be loaded before phoenix-base.css)
   *
   * @returns {boolean} - true if order is correct, false otherwise
   */
  checkLoadingOrder() {
    const links = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]'),
    );

    // Find all Phoenix CSS files (phoenix-* or D15_*)
    const phoenixCSSFiles = links.filter((link) => {
      const href = link.href.toLowerCase();
      return href.includes('phoenix') || href.includes('d15_');
    });

    // Find phoenix-base.css index among Phoenix CSS files
    const baseCSSIndex = phoenixCSSFiles.findIndex((link) =>
      link.href.includes(this.options.baseCSSFile),
    );

    // phoenix-base.css must be first among Phoenix CSS files
    if (baseCSSIndex !== 0) {
      const allLinksIndex = links.findIndex((link) =>
        link.href.includes(this.options.baseCSSFile),
      );
      maskedLog(
        `❌ ${this.options.baseCSSFile} must be loaded first among Phoenix CSS files`,
        { allLinksIndex, baseCSSIndex },
      );
      return false;
    }

    return true;
  }
}

// Export for use in UAI DOMStage
export { CSSLoadVerifier };

/**
 * DOM Stage - Stage 1: DOM Ready
 * --------------------------------------------------------
 * Waits for DOM to be ready and prepares basic structure
 * 
 * @description First stage of UAI lifecycle - DOM readiness and basic setup
 * @version v1.0.0
 */

import { StageBase } from './StageBase.js';
import { CSSLoadVerifier } from '../cssLoadVerifier.js';
import { maskedLog } from '../../../utils/maskedLog.js';

export class DOMStage extends StageBase {
  constructor() {
    super('DOM');
    this.config = null;
  }
  
  /**
   * Execute DOM stage
   * @returns {Promise<void>}
   */
  async execute() {
    try {
      this.markStarted();
      
      // Get config from UAI
      // ✅ REQUIRED: Use window.UAI.config (consistent with UAI namespace)
      // ❌ NO LEGACY FALLBACK - External config file is mandatory
      this.config = window.UAI?.config;
      
      if (!this.config) {
        throw new Error('UAI_CONFIG_MISSING: window.UAI.config is not defined. Make sure page config JS file is loaded before UAI.');
      }
      
      // Wait for DOM
      await this.waitForDOM();
      this.emit('dom-ready');
      
      // CRITICAL: CSS Load Verification - must pass before continuing
      const cssVerifier = new CSSLoadVerifier({ strictMode: true });
      try {
        await cssVerifier.verifyCSSLoadOrder();
        maskedLog('[DOM Stage] ✅ CSS Load Order Verified', {
          baseCSSFile: cssVerifier.options.baseCSSFile,
          variablesChecked: cssVerifier.options.criticalVariables.length
        });
        this.emit('css-verified', {
          timestamp: Date.now(),
          verified: true,
          baseCSSFile: cssVerifier.options.baseCSSFile,
          variablesChecked: cssVerifier.options.criticalVariables.length
        });
      } catch (error) {
        console.error('[DOM Stage] ❌ CSS Load Order Verification Failed:', {
          error: error.message,
          errorCode: error.code,
          baseCSSFile: cssVerifier.options.baseCSSFile
        });
        this.emit('css-verification-failed', {
          error: error.message,
          errorCode: error.code,
          timestamp: Date.now(),
          verified: false
        });
        // Stop lifecycle - CSS order is critical
        this.markError(error);
        throw error; // This will stop the entire UAI lifecycle
      }
      
      // Load auth guard if required
      if (this.config && this.config.requiresAuth) {
        await this.loadAuthGuard();
        this.emit('auth-complete');
      }
      
      // Load header if required
      if (this.config && this.config.requiresHeader) {
        await this.loadHeader();
        this.emit('header-loaded');
      }
      
      // Prepare containers
      this.prepareContainers();
      
      this.markCompleted();
    } catch (error) {
      this.markError(error);
      throw error;
    }
  }
  
  /**
   * Wait for DOM to be ready
   * @returns {Promise<void>}
   */
  async waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        resolve();
      } else {
        document.addEventListener('DOMContentLoaded', resolve, { once: true });
      }
    });
  }
  
  /**
   * Load auth guard
   * @returns {Promise<void>}
   */
  async loadAuthGuard() {
    // Check if authGuard is already loaded
    if (window.AuthGuard && window.AuthGuard._initialized) {
      return;
    }
    
    // Load authGuard.js
    await this.loadScript('/src/components/core/authGuard.js', { type: 'module' });
    
    // Wait for auth guard to initialize
    // Note: authGuard initializes immediately, but we wait a bit to ensure it's ready
    await new Promise((resolve) => {
      if (window.AuthGuard && window.AuthGuard._initialized) {
        resolve();
      } else {
        // Wait up to 2 seconds for auth guard to initialize
        const timeout = setTimeout(() => {
          console.warn('[DOM Stage] Auth guard initialization timeout');
          resolve();
        }, 2000);
        
        const checkInterval = setInterval(() => {
          if (window.AuthGuard && window.AuthGuard._initialized) {
            clearInterval(checkInterval);
            clearTimeout(timeout);
            resolve();
          }
        }, 100);
      }
    });
  }
  
  /**
   * Load header if required
   * @returns {Promise<void>}
   */
  async loadHeader() {
    // Check if header already exists
    if (document.querySelector('header#unified-header')) {
      return;
    }
    
    // Load statusAdapter first (required by phoenixFilterBridge for SSOT status mapping)
    if (!window.statusAdapter) {
      await this.loadScript('/src/utils/statusAdapter.js', { type: 'module' });
    }
    // Load phoenixFilterBridge.js (required by headerLoader) - ES module (imports statusAdapter)
    if (!window.PhoenixBridge) {
      await this.loadScript('/src/components/core/phoenixFilterBridge.js', { type: 'module' });
    }
    
    // Load headerLoader.js
    await this.loadScript('/src/components/core/headerLoader.js');
    
    // Wait for header to be injected
    await new Promise((resolve) => {
      const checkHeader = () => {
        if (document.querySelector('header#unified-header')) {
          resolve();
        } else {
          setTimeout(checkHeader, 100);
        }
      };
      checkHeader();
      
      // Timeout after 5 seconds
      setTimeout(() => {
        console.warn('[DOM Stage] Header loading timeout');
        resolve();
      }, 5000);
    });
  }
  
  /**
   * Prepare containers
   */
  prepareContainers() {
    // Ensure page-wrapper exists
    if (!document.querySelector('.page-wrapper')) {
      const pageWrapper = document.createElement('div');
      pageWrapper.className = 'page-wrapper';
      
      const pageContainer = document.createElement('div');
      pageContainer.className = 'page-container';
      
      const main = document.createElement('main');
      
      pageContainer.appendChild(main);
      pageWrapper.appendChild(pageContainer);
      
      // Insert before closing body tag or append to body
      if (document.body) {
        document.body.appendChild(pageWrapper);
      }
    }
    
    // Ensure tt-container exists in main
    const main = document.querySelector('main');
    if (main && !main.querySelector('tt-container')) {
      const ttContainer = document.createElement('tt-container');
      main.appendChild(ttContainer);
    }
  }
}

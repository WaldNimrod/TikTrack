/**
 * Unified App Init (UAI) - Main Controller
 * --------------------------------------------------------
 * Manages complete page lifecycle in 5 sequential stages
 * 
 * @description Central controller for page initialization lifecycle
 * @version v1.0.0
 * 
 * Lifecycle Stages:
 * 1. DOM - DOM readiness and basic setup
 * 2. Bridge - PhoenixBridge initialization
 * 3. Data - Data loading from API
 * 4. Render - UI rendering with data
 * 5. Ready - Finalization and ready signal
 */

import { DOMStage } from './stages/DOMStage.js';
import { BridgeStage } from './stages/BridgeStage.js';
import { DataStage } from './stages/DataStage.js';
import { RenderStage } from './stages/RenderStage.js';
import { ReadyStage } from './stages/ReadyStage.js';
import { maskedLog } from '../../utils/maskedLog.js';

/**
 * Unified App Init - Main Controller
 */
export class UnifiedAppInit {
  constructor(config = null) {
    // Load config from window.UAI.config
    // ✅ REQUIRED: Use window.UAI.config (consistent with UAI namespace)
    // ❌ NO LEGACY FALLBACK - External config file is mandatory
    this.config = config || window.UAI?.config;
    
    if (!this.config) {
      throw new Error('UAI_CONFIG_MISSING: window.UAI.config is not defined. Make sure page config JS file is loaded before UAI.');
    }
    
    // Validate config
    this.validateConfig();
    
    // Initialize stages
    this.currentStage = null;
    this.stages = {
      DOM: new DOMStage(),
      Bridge: new BridgeStage(),
      Data: new DataStage(),
      Render: new RenderStage(),
      Ready: new ReadyStage()
    };
    
    // Initialize global state
    window.UAI = window.UAI || {};
    window.UAI.instance = this;
    window.UAI.config = this.config;
    window.UAIState = window.UAIState || {};
    window.UAIState.pageType = this.config.pageType;
    window.UAIState.config = this.config;
  }
  
  /**
   * Validate UAI config
   * @throws {Error} If config is invalid
   */
  validateConfig() {
    const errors = [];
    
    // Required fields
    if (!this.config.pageType) {
      errors.push('pageType is required');
    }
    
    if (typeof this.config.requiresAuth !== 'boolean') {
      errors.push('requiresAuth must be a boolean');
    }
    
    if (typeof this.config.requiresHeader !== 'boolean') {
      errors.push('requiresHeader must be a boolean');
    }
    
    // Page type validation
    if (this.config.pageType && !/^[a-z][a-zA-Z0-9]*$/.test(this.config.pageType)) {
      errors.push('pageType must match pattern: ^[a-z][a-zA-Z0-9]*$');
    }
    
    // Data loader validation
    if (this.config.dataLoader && !/^\/src\/.*\.js$/.test(this.config.dataLoader)) {
      errors.push('dataLoader must be a valid path to .js file');
    }
    
    // Tables validation
    if (this.config.tables) {
      if (!Array.isArray(this.config.tables)) {
        errors.push('tables must be an array');
      } else {
        this.config.tables.forEach((table, index) => {
          if (!table.id) {
            errors.push(`tables[${index}].id is required`);
          }
          if (!table.type) {
            errors.push(`tables[${index}].type is required`);
          }
          if (table.pageSize && (table.pageSize < 10 || table.pageSize > 100)) {
            errors.push(`tables[${index}].pageSize must be between 10 and 100`);
          }
        });
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`UAI_CONFIG_INVALID: ${errors.join(', ')}`);
    }
  }
  
  /**
   * Initialize UAI - Execute all stages sequentially
   * @returns {Promise<void>}
   */
  async init() {
    const startTime = Date.now();
    
    try {
      maskedLog('[UAI] Starting initialization...', {
        pageType: this.config.pageType,
        requiresAuth: this.config.requiresAuth,
        requiresHeader: this.config.requiresHeader
      });
      
      // Stage 1: DOM
      this.currentStage = 'DOM';
      await this.stages.DOM.execute();
      maskedLog('[UAI] DOM stage completed');
      
      // Stage 2: Bridge
      this.currentStage = 'Bridge';
      await this.stages.Bridge.execute();
      maskedLog('[UAI] Bridge stage completed');
      
      // Stage 3: Data
      this.currentStage = 'Data';
      await this.stages.Data.execute();
      maskedLog('[UAI] Data stage completed');
      
      // Stage 4: Render
      this.currentStage = 'Render';
      await this.stages.Render.execute();
      maskedLog('[UAI] Render stage completed');
      
      // Stage 5: Ready
      this.currentStage = 'Ready';
      await this.stages.Ready.execute();
      maskedLog('[UAI] Ready stage completed');
      
      const duration = Date.now() - startTime;
      maskedLog('[UAI] Initialization completed successfully', {
        duration: `${duration}ms`,
        stages: ['DOM', 'Bridge', 'Data', 'Render', 'Ready']
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('[UAI] Initialization failed:', {
        error: error.message,
        stage: this.currentStage,
        duration: `${duration}ms`,
        stack: error.stack
      });
      
      // Emit error event
      window.dispatchEvent(new CustomEvent('uai:error', {
        detail: {
          error: error.message,
          stage: this.currentStage,
          duration,
          timestamp: Date.now()
        }
      }));
      
      throw error;
    }
  }
  
  /**
   * Get stage by name
   * @param {string} stageName - Name of stage
   * @returns {StageBase|null} Stage instance or null
   */
  getStage(stageName) {
    return this.stages[stageName] || null;
  }
  
  /**
   * Register lifecycle hook
   * @param {string} stageName - Name of stage
   * @param {Function} callback - Callback function
   */
  onStageComplete(stageName, callback) {
    window.addEventListener('uai:stage-complete', (e) => {
      if (e.detail && e.detail.stage === stageName) {
        callback(e.detail);
      }
    });
  }
}

// Auto-initialize if config is available
// ✅ REQUIRED: Use window.UAI.config (consistent with UAI namespace)
// ❌ NO LEGACY FALLBACK - External config file is mandatory
const hasConfig = window.UAI?.config;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (hasConfig) {
      const uai = new UnifiedAppInit();
      uai.init().catch(error => {
        console.error('[UAI] Auto-initialization failed:', error);
      });
    }
  });
} else {
  // DOM already loaded
  if (hasConfig) {
    const uai = new UnifiedAppInit();
    uai.init().catch(error => {
      console.error('[UAI] Auto-initialization failed:', error);
    });
  }
}

// Export for manual initialization
export default UnifiedAppInit;

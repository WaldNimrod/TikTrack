/**
 * Bridge Stage - UAI Stage 2
 * --------------------------------------------------------
 * Initializes PhoenixBridge and prepares event system
 * 
 * @description Stage 2 of UAI lifecycle - Bridge initialization
 * @version v1.0.0
 */

import { StageBase } from './StageBase.js';
import { maskedLog } from '../../../utils/maskedLog.js';

export class BridgeStage extends StageBase {
  constructor() {
    super('Bridge');
    this.bridge = null;
  }
  
  /**
   * Execute Bridge stage
   * @returns {Promise<void>}
   */
  async execute() {
    try {
      this.markStarted();
      
      // Wait for DOM stage to complete
      await this.waitForStage('DOM');
      
      // Ensure PhoenixBridge is loaded (should already be loaded by DOMStage)
      if (!window.PhoenixBridge) {
        // Fallback: load phoenixFilterBridge.js if not already loaded
        await this.loadScript('/src/components/core/phoenixFilterBridge.js', { type: 'module' });
      }
      
      if (!window.PhoenixBridge) {
        throw new Error('PhoenixBridge failed to initialize');
      }
      
      this.bridge = window.PhoenixBridge;
      
      // Initialize Bridge state if needed
      if (!this.bridge.state) {
        this.bridge.state = {
          accounts: [],
          filters: {
            status: null,
            investmentType: null,
            tradingAccount: null,
            dateRange: { from: null, to: null },
            search: ''
          },
          pageData: null
        };
      }
      
      // Setup event system
      this.setupEventSystem();
      
      // Emit bridge ready event
      this.emit('ready', {
        bridge: this.bridge,
        state: this.bridge.state
      });
      
      maskedLog('[Bridge Stage] PhoenixBridge initialized successfully', {
        hasState: !!this.bridge.state,
        hasFilters: !!this.bridge.state?.filters
      });
      
      this.markCompleted();
    } catch (error) {
      this.markError(error);
      throw error;
    }
  }
  
  /**
   * Setup event system for cross-component communication
   */
  setupEventSystem() {
    // Bridge is already set up by phoenixFilterBridge.js
    // This method can be extended for additional event setup if needed
    
    // Listen for filter changes and forward to UAI
    if (this.bridge && this.bridge.addEventListener) {
      this.bridge.addEventListener('phoenix-filter-change', (e) => {
        // Forward filter changes to UAI event system
        window.dispatchEvent(new CustomEvent('uai:bridge:filter-change', {
          detail: e.detail
        }));
      });
    }
  }
}

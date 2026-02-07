/**
 * Stage Base - Base class for all UAI stages
 * --------------------------------------------------------
 * Base class providing common functionality for all UAI stages
 * 
 * @description Base class for DOM, Bridge, Data, Render, and Ready stages
 * @version v1.0.0
 */

export class StageBase {
  constructor(name) {
    this.name = name;
    this.status = 'pending'; // pending, running, completed, error
    this.error = null;
    this.startTime = null;
    this.endTime = null;
  }
  
  /**
   * Execute stage - must be implemented by subclass
   * @throws {Error} If not implemented
   */
  async execute() {
    throw new Error(`execute() must be implemented by ${this.name}Stage subclass`);
  }
  
  /**
   * Wait for another stage to complete
   * @param {string} stageName - Name of stage to wait for
   * @returns {Promise<void>}
   */
  async waitForStage(stageName) {
    return new Promise((resolve) => {
      // Check if stage already completed via UAI instance
      if (window.UAI && window.UAI.instance) {
        const stage = window.UAI.instance.getStage(stageName);
        if (stage && stage.status === 'completed') {
          resolve();
          return;
        }
      }
      
      // Listen for stage completion event
      const handler = (e) => {
        if (e.detail && e.detail.stage === stageName) {
          window.removeEventListener('uai:stage-complete', handler);
          resolve();
        }
      };
      
      window.addEventListener('uai:stage-complete', handler);
      
      // Timeout after 30 seconds to prevent infinite waiting
      setTimeout(() => {
        window.removeEventListener('uai:stage-complete', handler);
        console.warn(`[StageBase] Timeout waiting for stage: ${stageName}`);
        resolve(); // Resolve anyway to prevent blocking
      }, 30000);
    });
  }
  
  /**
   * Load JavaScript file dynamically
   * @param {string} src - Path to script file
   * @param {Object} options - Load options
   * @returns {Promise<void>}
   */
  async loadScript(src, options = {}) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = src;
      script.type = options.type || 'text/javascript';
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      
      document.head.appendChild(script);
    });
  }
  
  /**
   * Emit stage event
   * @param {string} eventName - Event name (without prefix)
   * @param {Object} data - Event data
   */
  emit(eventName, data = {}) {
    const fullEventName = `uai:${this.name.toLowerCase()}:${eventName}`;
    window.dispatchEvent(new CustomEvent(fullEventName, {
      detail: { stage: this.name, ...data }
    }));
    
    // Also emit generic stage-complete event
    if (eventName === 'complete' || eventName === 'stage-complete') {
      window.dispatchEvent(new CustomEvent('uai:stage-complete', {
        detail: { stage: this.name, ...data }
      }));
    }
  }
  
  /**
   * Listen to stage event
   * @param {string} eventName - Event name (without prefix)
   * @param {Function} callback - Event callback
   */
  on(eventName, callback) {
    const fullEventName = `uai:${this.name.toLowerCase()}:${eventName}`;
    window.addEventListener(fullEventName, callback);
  }
  
  /**
   * Mark stage as started
   */
  markStarted() {
    this.status = 'running';
    this.startTime = Date.now();
  }
  
  /**
   * Mark stage as completed
   */
  markCompleted() {
    this.status = 'completed';
    this.endTime = Date.now();
    this.emit('complete', {
      duration: this.endTime - this.startTime
    });
  }
  
  /**
   * Mark stage as error
   * @param {Error} error - Error object
   */
  markError(error) {
    this.status = 'error';
    this.error = error;
    this.endTime = Date.now();
    this.emit('error', {
      error: error.message,
      duration: this.endTime - this.startTime
    });
  }
}

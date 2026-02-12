/**
 * Ready Stage - UAI Stage 5
 * --------------------------------------------------------
 * Finalizes initialization and signals page ready
 * 
 * @description Stage 5 of UAI lifecycle - Finalization
 * @version v1.0.0
 */

import { StageBase } from './StageBase.js';
import { maskedLog } from '../../../utils/maskedLog.js';

export class ReadyStage extends StageBase {
  constructor() {
    super('Ready');
  }
  
  /**
   * Execute Ready stage
   * @returns {Promise<void>}
   */
  async execute() {
    try {
      this.markStarted();
      
      // Wait for Render stage to complete
      await this.waitForStage('Render');
      
      // Finalize initialization
      this.finalize();
      
      // Signal page ready
      this.signalReady();
      
      this.markCompleted();
    } catch (error) {
      this.markError(error);
      throw error;
    }
  }
  
  /**
   * Finalize initialization
   */
  finalize() {
    // Update UAI state
    window.UAIState = window.UAIState || {};
    window.UAIState.ready = true;
    window.UAIState.readyTime = Date.now();
    
    // Mark all stages as complete
    if (window.UAI && window.UAI.instance) {
      const uai = window.UAI.instance;
      const stages = {
        DOM: uai.getStage('DOM')?.status || 'unknown',
        Bridge: uai.getStage('Bridge')?.status || 'unknown',
        Data: uai.getStage('Data')?.status || 'unknown',
        Render: uai.getStage('Render')?.status || 'unknown',
        Ready: 'completed'
      };
      
      window.UAIState.stages = stages;
      
      // Calculate total duration
      const domStage = uai.getStage('DOM');
      const readyStage = uai.getStage('Ready');
      if (domStage && readyStage && domStage.startTime && readyStage.endTime) {
        window.UAIState.totalDuration = readyStage.endTime - domStage.startTime;
      }
      
      maskedLog('[Ready Stage] Initialization finalized', {
        stages,
        totalDuration: window.UAIState.totalDuration ? `${window.UAIState.totalDuration}ms` : 'unknown'
      });
    } else {
      maskedLog('[Ready Stage] UAI instance not found during finalization', {});
    }
  }
  
  /**
   * Signal that page is ready
   */
  signalReady() {
    // Emit UAI ready event
    window.dispatchEvent(new CustomEvent('uai:ready', {
      detail: {
        timestamp: Date.now(),
        stages: ['DOM', 'Bridge', 'Data', 'Render', 'Ready'],
        state: window.UAIState
      }
    }));
    
    // Emit stage-specific ready event
    this.emit('ready', {
      timestamp: Date.now()
    });
    
    maskedLog('[Ready Stage] Page ready signal emitted');
  }
}

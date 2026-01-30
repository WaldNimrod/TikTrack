/**
 * Unified Progress Manager - TikTrack
 * ====================================
 * 
 * מערכת כללית להצגת התקדמות תהליכים בכל המערכת
 * ממשק אחיד ומשותף לכל העמודים
 * 
 * Documentation: See documentation/frontend/GENERAL_SYSTEMS_LIST.md
 * 
 * @version 1.0.0
 * @author TikTrack Development Team
 */

// ===== FUNCTION INDEX =====

// === Class Methods ===
// - UnifiedProgressManager.removeOverlay() - Removeoverlay

// === Initialization ===
// - UnifiedProgressManager.createOverlay() - Createoverlay

// === UI Functions ===
// - UnifiedProgressManager.showProgress() - Showprogress
// - UnifiedProgressManager.hideProgress() - Hideprogress
// - UnifiedProgressManager.updateProgress() - Updateprogress

(function() {
    'use strict';

    /**
     * Unified Progress Manager
     * מנהל התקדמות מאוחד
     */
    class UnifiedProgressManager {
        constructor() {
            this.activeOverlays = new Map();
            this.defaultConfig = {
                title: 'תהליך בעבודה',
                totalSteps: 4,
                showPercentage: true,
                showCurrentStep: true,
                zIndex: 2000
            };
        }

        /**
         * Create or get progress overlay element
         * @param {string} overlayId - Unique ID for the overlay
         * @param {Object} config - Configuration object
         * @returns {HTMLElement} Progress overlay element
         */
        createOverlay(overlayId, config = {}) {
            const mergedConfig = { ...this.defaultConfig, ...config };
            
            // Check if overlay already exists
            let overlay = document.getElementById(overlayId);
            if (overlay) {
                return overlay;
            }

            // Create overlay HTML structure
            const stepsHtml = Array.from({ length: mergedConfig.totalSteps }, (_, i) => {
                const stepNum = i + 1;
                return `
                    <div class="progress-step" data-step="${stepNum}">
                        <div class="step-icon">
                            <span class="step-number">${stepNum}</span>
                        </div>
                        <div class="step-content">
                            <div class="step-label">${mergedConfig.stepLabels?.[i] || `שלב ${stepNum}`}</div>
                            <div class="step-description">${mergedConfig.stepDescriptions?.[i] || 'ממתין...'}</div>
                        </div>
                    </div>
                `;
            }).join('');

            const overlayHtml = `
                <div id="${overlayId}" class="unified-progress-overlay d-none">
                    <div class="progress-overlay-content">
                        <div class="progress-overlay-header">
                            <h5 class="progress-overlay-title">${mergedConfig.title}</h5>
                            <button type="button" class="btn-close btn-close-white progress-overlay-close" aria-label="סגור" style="display: none;"></button>
                        </div>
                        <div class="progress-overlay-body">
                            <div class="progress-steps">
                                ${stepsHtml}
                            </div>
                            <div class="progress-bar-container">
                                <div class="progress" style="height: 8px;">
                                    <div class="progress-bar progress-bar-striped progress-bar-animated" 
                                         role="progressbar" 
                                         id="${overlayId}ProgressBar"
                                         style="width: 0%"
                                         aria-valuenow="0" 
                                         aria-valuemin="0" 
                                         aria-valuemax="100"></div>
                                </div>
                                ${mergedConfig.showPercentage ? `
                                    <div class="progress-percentage" id="${overlayId}ProgressPercentage">0%</div>
                                ` : ''}
                            </div>
                            ${mergedConfig.showCurrentStep ? `
                                <div class="progress-current-step" id="${overlayId}CurrentStep">
                                    <span class="current-step-icon">⏳</span>
                                    <span class="current-step-text">מתחיל תהליך...</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;

            // Ensure document.body is available
            if (!document.body) {
                if (window.Logger) {
                    window.Logger.error('UnifiedProgressManager: document.body not available', {
                        page: 'unified-progress-manager',
                        overlayId,
                        readyState: document.readyState
                    });
                }
                return null;  // Return null if body not available
            }

            // Add to body
            document.body.insertAdjacentHTML('beforeend', overlayHtml);
            overlay = document.getElementById(overlayId);

            // Verify overlay was created
            if (!overlay) {
                if (window.Logger) {
                    window.Logger.error('UnifiedProgressManager: Failed to create overlay element', {
                        page: 'unified-progress-manager',
                        overlayId,
                        htmlInserted: true
                    });
                }
                return null;  // Return null if element not found
            }

            // Store in active overlays
            this.activeOverlays.set(overlayId, {
                element: overlay,
                config: mergedConfig,
                currentStep: 0
            });

            // Debug: Verify storage
            if (window.Logger) {
                const verifyData = this.activeOverlays.get(overlayId);
                window.Logger.debug('UnifiedProgressManager: Overlay stored in Map', {
                    page: 'unified-progress-manager',
                    overlayId,
                    storedSuccessfully: !!verifyData,
                    elementExists: verifyData?.element ? true : false,
                    mapSize: this.activeOverlays.size
                });
            }

            return overlay;
        }

        /**
         * Show progress overlay
         * @param {string} overlayId - Overlay ID
         * @param {number} step - Current step (1-based)
         * @param {string} stepText - Current step text
         * @param {string} description - Step description
         */
        showProgress(overlayId, step = 1, stepText = '', description = '') {
            let overlayData = this.activeOverlays.get(overlayId);
            
            // Create overlay if it doesn't exist
            if (!overlayData) {
                const createdOverlay = this.createOverlay(overlayId);
                overlayData = this.activeOverlays.get(overlayId);
                
                // Verify overlay was created and stored
                if (!overlayData || !overlayData.element || !createdOverlay) {
                    if (window.Logger) {
                        window.Logger.error('UnifiedProgressManager: createOverlay failed', {
                            page: 'unified-progress-manager',
                            overlayId,
                            createdOverlayExists: !!createdOverlay,
                            overlayDataExists: !!overlayData,
                            elementExists: overlayData?.element ? true : false,
                            documentReady: document.readyState
                        });
                    }
                    return;  // Exit early if creation failed
                }
            }

            // Safety check: if overlayData still doesn't exist, log error and return
            if (!overlayData || !overlayData.element) {
                if (window.Logger) {
                    window.Logger.error('UnifiedProgressManager: Failed to create or retrieve overlay', {
                        page: 'unified-progress-manager',
                        overlayId,
                        overlayDataExists: !!overlayData,
                        elementExists: overlayData?.element ? true : false
                    });
                }
                return;
            }

            const overlay = overlayData.element;
            const config = overlayData.config;

            // Calculate z-index using ModalZIndexManager if available
            // Progress overlay should ALWAYS be above modals
            let overlayZIndex = config.zIndex || this.defaultConfig.zIndex;
            if (window.ModalZIndexManager) {
                const stack = window.ModalNavigationService?.getStack?.() || [];
                const stackDepth = stack.length;
                // Progress overlay should be above all modals
                // BASE_Z_INDEX (1040) + (max stack depth * 10) + 200 for progress overlay (higher than modals)
                overlayZIndex = window.ModalZIndexManager.BASE_Z_INDEX + (stackDepth * window.ModalZIndexManager.Z_INDEX_INCREMENT) + 200;
                
                if (window.Logger) {
                    window.Logger.debug('Progress overlay z-index calculated', {
                        page: 'unified-progress-manager',
                        stackDepth,
                        baseZIndex: window.ModalZIndexManager.BASE_Z_INDEX,
                        increment: window.ModalZIndexManager.Z_INDEX_INCREMENT,
                        calculatedZIndex: overlayZIndex
                    });
                }
            }
            overlay.style.zIndex = overlayZIndex;

            // Show overlay
            overlay.classList.remove('d-none');
            overlay.style.display = 'flex';

            // Update all steps
            const steps = overlay.querySelectorAll('.progress-step');
            steps.forEach((stepEl, index) => {
                const stepNum = index + 1;
                stepEl.classList.remove('active', 'completed');
                
                if (stepNum < step) {
                    stepEl.classList.add('completed');
                } else if (stepNum === step) {
                    stepEl.classList.add('active');
                }
            });

            // Update current step text
            const currentStepText = overlay.querySelector(`#${overlayId}CurrentStep .current-step-text`);
            if (currentStepText && stepText) {
                currentStepText.textContent = stepText;
            }

            // Update active step description
            const activeStep = overlay.querySelector(`.progress-step[data-step="${step}"]`);
            if (activeStep && description) {
                const descEl = activeStep.querySelector('.step-description');
                if (descEl) {
                    descEl.textContent = description;
                }
            }

            // Update progress bar
            const progressBar = overlay.querySelector(`#${overlayId}ProgressBar`);
            const progressPercentage = overlay.querySelector(`#${overlayId}ProgressPercentage`);
            const percentage = Math.min(100, (step / config.totalSteps) * 100);
            
            if (progressBar) {
                progressBar.style.width = `${percentage}%`;
                progressBar.setAttribute('aria-valuenow', percentage);
            }
            
            if (progressPercentage) {
                progressPercentage.textContent = `${Math.round(percentage)}%`;
            }

            // Update stored step
            overlayData.currentStep = step;

            if (window.Logger) {
                window.Logger.debug('Progress overlay updated', { 
                    overlayId,
                    step, 
                    stepText, 
                    percentage,
                    page: 'unified-progress-manager'
                });
            }
        }

        /**
         * Hide progress overlay
         * @param {string} overlayId - Overlay ID
         */
        hideProgress(overlayId) {
            const overlayData = this.activeOverlays.get(overlayId);
            if (!overlayData || !overlayData.element) {
                return;
            }

            const overlay = overlayData.element;
            overlay.classList.add('d-none');
            overlay.style.display = 'none';

            // Reset progress
            const progressBar = overlay.querySelector(`#${overlayId}ProgressBar`);
            const progressPercentage = overlay.querySelector(`#${overlayId}ProgressPercentage`);
            if (progressBar) {
                progressBar.style.width = '0%';
                progressBar.setAttribute('aria-valuenow', 0);
            }
            if (progressPercentage) {
                progressPercentage.textContent = '0%';
            }

            // Reset all steps
            const steps = overlay.querySelectorAll('.progress-step');
            steps.forEach(stepEl => {
                stepEl.classList.remove('active', 'completed');
            });

            // Reset current step
            overlayData.currentStep = 0;

            if (window.Logger) {
                window.Logger.debug('Progress overlay hidden', { 
                    overlayId,
                    page: 'unified-progress-manager' 
                });
            }
        }

        /**
         * Update progress with percentage (for non-step-based progress)
         * @param {string} overlayId - Overlay ID
         * @param {number} percentage - Progress percentage (0-100)
         * @param {string} message - Optional message
         */
        updateProgress(overlayId, percentage, message = '') {
            const overlayData = this.activeOverlays.get(overlayId);
            if (!overlayData || !overlayData.element) {
                return;
            }

            const overlay = overlayData.element;
            const progressBar = overlay.querySelector(`#${overlayId}ProgressBar`);
            const progressPercentage = overlay.querySelector(`#${overlayId}ProgressPercentage`);
            const currentStepText = overlay.querySelector(`#${overlayId}CurrentStep .current-step-text`);

            const clampedPercentage = Math.min(100, Math.max(0, percentage));

            if (progressBar) {
                progressBar.style.width = `${clampedPercentage}%`;
                progressBar.setAttribute('aria-valuenow', clampedPercentage);
            }

            if (progressPercentage) {
                progressPercentage.textContent = `${Math.round(clampedPercentage)}%`;
            }

            if (currentStepText && message) {
                currentStepText.textContent = message;
            }
        }

        /**
         * Remove overlay from DOM
         * @param {string} overlayId - Overlay ID
         */
        removeOverlay(overlayId) {
            const overlayData = this.activeOverlays.get(overlayId);
            if (overlayData && overlayData.element) {
                overlayData.element.remove();
                this.activeOverlays.delete(overlayId);
            }
        }
    }

    // Create global instance
    window.UnifiedProgressManager = UnifiedProgressManager;
    window.unifiedProgressManager = new UnifiedProgressManager();

    if (window.Logger) {
        window.Logger.info('✅ Unified Progress Manager loaded', { page: 'unified-progress-manager' });
    }
})();


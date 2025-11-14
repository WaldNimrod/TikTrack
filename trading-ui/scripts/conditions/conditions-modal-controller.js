/**
 * Conditions Modal Controller
 * ===========================
 *
 * Bridges between ModalManagerV2 and the Conditions UI Manager.
 * Handles modal lifecycle events, initializes the UI manager with
 * the appropriate context, and ensures the modal footer is hidden.
 */
(function () {
    const MODAL_ID = 'conditionsModal';

    class ConditionsModalController {
        constructor() {
            this.context = null;
            this.managerInstance = null;
            this.modalElement = null;
            this.bootstrapModal = null;
            this.isReady = false;
            this.parentModalId = null;
            this.parentModalInstance = null;
            this.navigationInstanceId = null;
            this.parentNavigationInstanceId = null;

            this.initialize();
        }

        initialize() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupModal());
            } else {
                this.setupModal();
            }
        }

        setupModal() {
            this.modalElement = document.getElementById(MODAL_ID);
            if (!this.modalElement) {
                if (window.ModalManagerV2 && window.conditionsModalConfig) {
                    try {
                        window.ModalManagerV2.createCRUDModal(window.conditionsModalConfig);
                        this.modalElement = document.getElementById(MODAL_ID);
                    } catch (error) {
                        window.Logger?.error('[ConditionsModalController] Failed to create modal from config', { error: error?.message, stack: error?.stack }, { page: 'conditions-modal-controller' });
                    }
                }
            }

            if (!this.modalElement) {
                window.Logger?.warn('[ConditionsModalController] Modal element not found', { page: 'conditions-modal-controller' });
                return;
            }

            try {
                // Ensure modal is the last child under body so it stacks above previously opened modals
                document.body.appendChild(this.modalElement);
            } catch (error) {
                window.Logger?.warn('[ConditionsModalController] Failed to reposition modal element in DOM', { error: error?.message, stack: error?.stack }, { page: 'conditions-modal-controller' });
            }

            this.modalElement.classList.add('modal-nested');

            this.bootstrapModal = bootstrap.Modal.getOrCreateInstance(this.modalElement, {
                backdrop: false,
                keyboard: true
            });
            this.modalElement.addEventListener('shown.bs.modal', () => this.onModalShown());
            this.modalElement.addEventListener('hidden.bs.modal', () => this.onModalHidden());

            this.isReady = true;
        }

        ensureModalPosition() {
            if (!this.modalElement) {
                return;
            }
            try {
                if (this.modalElement.parentElement !== document.body || document.body.lastElementChild !== this.modalElement) {
                    document.body.appendChild(this.modalElement);
                }
            } catch (error) {
                window.Logger?.warn('[ConditionsModalController] Failed to ensure modal position', { error: error?.message, stack: error?.stack }, { page: 'conditions-modal-controller' });
            }
        }

        buildModalTitle() {
            if (!this.context) {
                return 'ניהול תנאים';
            }
            const entityLabel = this.context.entityType === 'plan' ? 'תוכנית מסחר' : 'עסקה';
            const entityName = this.context.entityName ? ` (${this.context.entityName})` : '';
            return `ניהול תנאים – ${entityLabel} #${this.context.entityId}${entityName}`;
        }

        async open(context = {}) {
            window.Logger?.info('[ConditionsModalController] open called', { context }, { page: 'conditions-modal-controller' });
            this.context = {
                entityType: context.entityType || 'plan',
                entityId: context.entityId,
                entityName: context.entityName || '',
                parentModalId: context.parentModalId || null
            };
            this.parentModalId = this.context.parentModalId || null;

            if (!this.context.entityId) {
                window.Logger?.error('[ConditionsModalController] Missing entityId in context', { context }, { page: 'conditions-modal-controller' });
                window.showNotification?.('לא הוגדרה ישות לניהול תנאים', 'error');
                return;
            }

            if (!this.isReady) {
                this.setupModal();
            }

            if (!this.modalElement && window.ModalManagerV2 && window.conditionsModalConfig) {
                try {
                    window.ModalManagerV2.createCRUDModal(window.conditionsModalConfig);
                    this.setupModal();
                } catch (error) {
                    window.Logger?.error('[ConditionsModalController] Failed to create modal via ModalManagerV2', { error: error?.message, stack: error?.stack }, { page: 'conditions-modal-controller' });
                }
            }

            const navigationAvailable = Boolean(window.ModalNavigationService?.registerModalOpen);
            let parentEntry = null;

            if (navigationAvailable && typeof window.ModalNavigationService.getActiveEntry === 'function') {
                parentEntry = window.ModalNavigationService.getActiveEntry();
                if (!this.parentModalId && parentEntry?.modalId) {
                    this.parentModalId = parentEntry.modalId;
                }
                this.parentNavigationInstanceId = parentEntry?.instanceId || null;
            } else {
                this.parentNavigationInstanceId = null;
            }

            if (navigationAvailable) {
                const metadata = {
                    modalId: MODAL_ID,
                    modalType: 'conditions-modal',
                    entityType: this.context.entityType === 'plan' ? 'trade_plan' : 'trade',
                    entityId: this.context.entityId,
                    title: this.buildModalTitle(),
                    parentInstanceId: this.parentNavigationInstanceId,
                    sourceInfo: parentEntry
                        ? {
                            modalId: parentEntry.modalId,
                            entityType: parentEntry.entityType,
                            entityId: parentEntry.entityId,
                            instanceId: parentEntry.instanceId
                        }
                        : (this.parentModalId
                            ? { modalId: this.parentModalId }
                            : null),
                    metadata: {
                        parentModalId: this.parentModalId
                    }
                };

                try {
                    const navigationEntry = await window.ModalNavigationService.registerModalOpen(this.modalElement, metadata);
                    this.navigationInstanceId = navigationEntry?.instanceId || null;
                } catch (error) {
                    window.Logger?.warn('[ConditionsModalController] Failed to register modal in navigation service', { error: error?.message, stack: error?.stack }, { page: 'conditions-modal-controller' });
                    this.navigationInstanceId = null;
                }
            } else if (this.parentModalId) {
                const parentElement = document.getElementById(this.parentModalId);
                if (parentElement) {
                    try {
                        const instance = bootstrap?.Modal?.getInstance(parentElement) || bootstrap?.Modal?.getOrCreateInstance(parentElement, { backdrop: false, keyboard: true });
                        if (instance) {
                            instance.hide();
                            this.parentModalInstance = instance;
                        } else {
                            parentElement.classList.remove('show');
                            parentElement.style.display = 'none';
                        }
                    } catch (error) {
                        window.Logger?.warn('[ConditionsModalController] Failed to hide parent modal (fallback)', { error: error?.message, stack: error?.stack }, { page: 'conditions-modal-controller' });
                        parentElement.classList.remove('show');
                        parentElement.style.display = 'none';
                    }
                }
            }

            if (this.bootstrapModal) {
                this.ensureModalPosition();
                this.bootstrapModal.show();
            } else if (this.modalElement) {
                this.ensureModalPosition();
                this.modalElement.classList.add('show');
                this.modalElement.style.display = 'block';
            }

            requestAnimationFrame(() => this.ensureModalPosition());
        }

        async onModalShown() {
            window.Logger?.info('[ConditionsModalController] onModalShown triggered', { context: this.context }, { page: 'conditions-modal-controller' });
            if (!this.context) {
                window.Logger?.error('[ConditionsModalController] Modal opened without context', { page: 'conditions-modal-controller' });
                return;
            }

            this.configureModalUI();

            if (!this.managerInstance) {
                window.Logger?.info('[ConditionsModalController] Creating new ConditionsUIManager instance', { page: 'conditions-modal-controller' });
                this.managerInstance = new window.ConditionsUIManager();
            } else {
                window.Logger?.info('[ConditionsModalController] Reusing existing ConditionsUIManager instance', { page: 'conditions-modal-controller' });
            }

            window.conditionsUIManager = this.managerInstance;
            window.__conditionsActiveContext = { ...this.context };

            await this.managerInstance.initialize({
                entityType: this.context.entityType,
                entityId: this.context.entityId,
                entityName: this.context.entityName,
                containerId: 'conditionsManagerRoot'
            });

            if (this.navigationInstanceId && window.ModalNavigationService?.updateModalMetadata) {
                window.ModalNavigationService.updateModalMetadata(MODAL_ID, {
                    instanceId: this.navigationInstanceId,
                    title: this.buildModalTitle()
                });
            }
        }

        onModalHidden() {
            window.Logger?.info('[ConditionsModalController] onModalHidden triggered', {}, { page: 'conditions-modal-controller' });
            if (!window.ModalNavigationService?.registerModalOpen) {
                this.restoreParentModal();
            } else {
                this.navigationInstanceId = null;
            }

            this.context = null;
            window.__conditionsActiveContext = null;

            if (this.managerInstance?.closeConditionForm) {
                this.managerInstance.closeConditionForm();
            }

            if (window.conditionsUIManager === this.managerInstance) {
                window.conditionsUIManager = null;
            }
        }

        configureModalUI() {
            const footer = this.modalElement.querySelector('.modal-footer');
            if (footer) {
                footer.classList.add('d-none');
            }

            const titleElement = this.modalElement.querySelector('.modal-title');
            if (titleElement) {
                titleElement.textContent = this.buildModalTitle();
            }

            const entityLabelContainer = this.modalElement.querySelector('#conditionsModalEntityLabel');
            if (entityLabelContainer) {
                const entityLabel = this.context.entityType === 'plan' ? 'תוכנית מסחר' : 'עסקה';
                const nameText = this.context.entityName ? ` – ${this.context.entityName}` : '';
                entityLabelContainer.textContent = `${entityLabel} #${this.context.entityId}${nameText}`;
            }

            const backButton = this.modalElement.querySelector('[data-action="conditions-back"]');
            if (backButton) {
                const navigationAvailable = Boolean(window.ModalNavigationService?.goBack);
                if (navigationAvailable && this.navigationInstanceId && this.parentNavigationInstanceId) {
                    backButton.classList.remove('d-none');
                    backButton.onclick = () => {
                        window.ModalNavigationService.goBack?.();
                    };
                } else if (this.parentModalId) {
                    backButton.classList.remove('d-none');
                    backButton.onclick = () => this.goBackToParent();
                } else {
                    backButton.classList.add('d-none');
                    backButton.onclick = null;
                }
            }
        }

        goBackToParent() {
            if (window.ModalNavigationService?.goBack && this.navigationInstanceId && this.parentNavigationInstanceId) {
                window.ModalNavigationService.goBack();
                return;
            }

            if (this.bootstrapModal) {
                this.bootstrapModal.hide();
            } else if (this.modalElement) {
                this.modalElement.classList.remove('show');
                this.modalElement.style.display = 'none';
                this.restoreParentModal();
            }
        }

        restoreParentModal() {
            if (window.ModalNavigationService?.navigateTo && this.parentNavigationInstanceId) {
                const parentEntry = window.ModalNavigationService.getParentEntry?.(this.navigationInstanceId);
                if (parentEntry?.modalId) {
                    window.ModalNavigationService.navigateTo(parentEntry.modalId);
                }
                this.parentNavigationInstanceId = null;
                return;
            }

            if (!this.parentModalId) {
                return;
            }

            const parentId = this.parentModalId;
            this.parentModalId = null;

            const parentElement = document.getElementById(parentId);
            if (!parentElement) {
                this.parentModalInstance = null;
                return;
            }

            try {
                const instance = this.parentModalInstance || bootstrap?.Modal?.getInstance(parentElement) || bootstrap?.Modal?.getOrCreateInstance(parentElement, { backdrop: false, keyboard: true });
                if (instance) {
                    instance.show();
                } else {
                    parentElement.classList.add('show');
                    parentElement.style.display = 'block';
                }
            } catch (error) {
                window.Logger?.warn('[ConditionsModalController] Failed to restore parent modal (fallback)', { error: error?.message, stack: error?.stack }, { page: 'conditions-modal-controller' });
                parentElement.classList.add('show');
                parentElement.style.display = 'block';
            } finally {
                this.parentModalInstance = null;
            }
        }
    }

    window.ConditionsModalController = new ConditionsModalController();
    window.conditionsModalNoop = () => {};
})();


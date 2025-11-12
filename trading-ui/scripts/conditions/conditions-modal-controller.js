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
                        console.error('[ConditionsModalController] Failed to create modal from config', error);
                    }
                }
            }

            if (!this.modalElement) {
                console.warn('[ConditionsModalController] Modal element not found');
                return;
            }

            this.bootstrapModal = bootstrap.Modal.getOrCreateInstance(this.modalElement);
            this.modalElement.addEventListener('shown.bs.modal', () => this.onModalShown());
            this.modalElement.addEventListener('hidden.bs.modal', () => this.onModalHidden());

            this.isReady = true;
        }

        async open(context = {}) {
            this.context = {
                entityType: context.entityType || 'plan',
                entityId: context.entityId,
                entityName: context.entityName || '',
                parentModalId: context.parentModalId || null
            };
            this.parentModalId = this.context.parentModalId || null;

            if (!this.context.entityId) {
                console.error('[ConditionsModalController] Missing entityId in context');
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
                    console.error('[ConditionsModalController] Failed to create modal via ModalManagerV2', error);
                }
            }

            if (this.parentModalId) {
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
                        console.warn('[ConditionsModalController] Failed to hide parent modal', { error });
                        parentElement.classList.remove('show');
                        parentElement.style.display = 'none';
                    }
                }
            }

            if (this.bootstrapModal) {
                this.bootstrapModal.show();
            } else if (this.modalElement) {
                this.modalElement.classList.add('show');
                this.modalElement.style.display = 'block';
            }
        }

        async onModalShown() {
            if (!this.context) {
                console.error('[ConditionsModalController] Modal opened without context');
                return;
            }

            this.configureModalUI();

            if (!this.managerInstance) {
                this.managerInstance = new window.ConditionsUIManager();
            }

            await this.managerInstance.initialize({
                entityType: this.context.entityType,
                entityId: this.context.entityId,
                entityName: this.context.entityName,
                containerId: 'conditionsManagerRoot'
            });
        }

        onModalHidden() {
            this.restoreParentModal();

            this.context = null;
            if (this.managerInstance?.closeConditionForm) {
                this.managerInstance.closeConditionForm();
            }
        }

        configureModalUI() {
            const footer = this.modalElement.querySelector('.modal-footer');
            if (footer) {
                footer.classList.add('d-none');
            }

            const titleElement = this.modalElement.querySelector('.modal-title');
            if (titleElement) {
                const entityLabel = this.context.entityType === 'plan' ? 'תוכנית מסחר' : 'עסקה';
                const entityName = this.context.entityName ? ` (${this.context.entityName})` : '';
                titleElement.textContent = `ניהול תנאים – ${entityLabel} #${this.context.entityId}${entityName}`;
            }

            const entityLabelContainer = this.modalElement.querySelector('#conditionsModalEntityLabel');
            if (entityLabelContainer) {
                const entityLabel = this.context.entityType === 'plan' ? 'תוכנית מסחר' : 'עסקה';
                const nameText = this.context.entityName ? ` – ${this.context.entityName}` : '';
                entityLabelContainer.textContent = `${entityLabel} #${this.context.entityId}${nameText}`;
            }

            const backButton = this.modalElement.querySelector('[data-action="conditions-back"]');
            if (backButton) {
                if (this.parentModalId) {
                    backButton.classList.remove('d-none');
                    backButton.onclick = () => this.goBackToParent();
                } else {
                    backButton.classList.add('d-none');
                    backButton.onclick = null;
                }
            }
        }

        goBackToParent() {
            if (this.bootstrapModal) {
                this.bootstrapModal.hide();
            } else if (this.modalElement) {
                this.modalElement.classList.remove('show');
                this.modalElement.style.display = 'none';
                this.restoreParentModal();
            }
        }

        restoreParentModal() {
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
                console.warn('[ConditionsModalController] Failed to restore parent modal', { error });
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


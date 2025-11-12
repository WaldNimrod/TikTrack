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
                entityName: context.entityName || ''
            };

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
                titleElement.textContent = `ניהול תנאים – ${entityLabel} #${this.context.entityId}`;
            }
        }
    }

    window.ConditionsModalController = new ConditionsModalController();
    window.conditionsModalNoop = () => {};
})();


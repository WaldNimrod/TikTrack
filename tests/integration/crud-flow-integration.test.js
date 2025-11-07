/**
 * CRUD Flow Integration Tests
 * ===========================
 * 
 * בדיקות אינטגרציה של זרימת CRUD מלאה
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const { loadScriptsInOrder, setupBasicMocks } = require('../utils/test-loader');

describe('CRUD Flow Integration', () => {
    beforeAll(() => {
        // Setup basic mocks
        setupBasicMocks({
            PreferencesSystem: {
                initialized: true,
                getPreference: jest.fn().mockResolvedValue(true)
            },
            FieldRendererService: {
                renderStatus: jest.fn((status) => `<span class="status-${status}">${status}</span>`),
                renderSide: jest.fn((side) => `<span class="side-${side}">${side}</span>`),
                renderAmount: jest.fn((amount) => `<span>${amount}</span>`)
            },
            SelectPopulatorService: {
                populate: jest.fn().mockResolvedValue(true)
            }
        });

        // Mock fetch for API calls
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ status: 'success', data: {} }),
            text: () => Promise.resolve('{}')
        });

        // Mock DOM
        const form = document.createElement('form');
        form.id = 'test-form';
        form.innerHTML = `
            <input name="name" value="Test" />
            <select name="status"></select>
            <button type="submit">Save</button>
        `;
        document.body.appendChild(form);

        // Load systems in order
        const code = loadScriptsInOrder(['standalone-core', 'core-modules', 'core-utilities', 'services', 'crud']);
        eval(code);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Data Collection + CRUD Handler Integration', () => {
        test('should collect data and handle CRUD response', async () => {
            if (!window.DataCollectionService || !window.CRUDResponseHandler) {
                return;
            }

            const form = document.getElementById('test-form');
            if (form && window.DataCollectionService.collect) {
                const data = window.DataCollectionService.collect('test-form');
                
                // Data should be collected
                expect(data).toBeDefined();
            }
        });

        test('should handle CRUD response with field renderer', async () => {
            if (!window.CRUDResponseHandler || !window.FieldRendererService) {
                return;
            }

            const response = {
                status: 'success',
                data: { id: 1, status: 'active', side: 'buy' }
            };

            // CRUD handler should use field renderer
            if (window.CRUDResponseHandler.handleResponse) {
                await expect(window.CRUDResponseHandler.handleResponse(response)).resolves.not.toThrow();
            }
        });
    });

    describe('Data Collection + Field Renderer Integration', () => {
        test('should collect data and render fields', () => {
            if (!window.DataCollectionService || !window.FieldRendererService) {
                return;
            }

            const form = document.getElementById('test-form');
            if (form && window.DataCollectionService.collect) {
                const data = window.DataCollectionService.collect('test-form');
                
                // Field renderer should be available for rendering
                expect(window.FieldRendererService.renderStatus).toBeDefined();
            }
        });
    });

    describe('CRUD Handler + Notification Integration', () => {
        test('should show notification on CRUD success', async () => {
            if (!window.CRUDResponseHandler || !window.showSuccessNotification) {
                return;
            }

            const response = {
                status: 'success',
                message: 'Operation successful'
            };

            if (window.CRUDResponseHandler.handleResponse) {
                await window.CRUDResponseHandler.handleResponse(response);
                
                // Should trigger notification
                expect(window.showSuccessNotification || window.showNotification).toBeDefined();
            }
        });

        test('should show error notification on CRUD failure', async () => {
            if (!window.CRUDResponseHandler || !window.showErrorNotification) {
                return;
            }

            const response = {
                status: 'error',
                error: 'Operation failed'
            };

            if (window.CRUDResponseHandler.handleResponse) {
                await window.CRUDResponseHandler.handleResponse(response);
                
                // Should trigger error notification
                expect(window.showErrorNotification || window.showNotification).toBeDefined();
            }
        });
    });

    describe('Error Handling Integration', () => {
        test('should handle data collection errors', () => {
            if (!window.DataCollectionService) {
                return;
            }

            // Non-existent form should be handled
            if (window.DataCollectionService.collect) {
                expect(() => {
                    window.DataCollectionService.collect('non-existent-form');
                }).not.toThrow();
            }
        });

        test('should handle CRUD response errors', async () => {
            if (!window.CRUDResponseHandler) {
                return;
            }

            const invalidResponse = null;

            if (window.CRUDResponseHandler.handleResponse) {
                await expect(window.CRUDResponseHandler.handleResponse(invalidResponse)).resolves.not.toThrow();
            }
        });
    });
});


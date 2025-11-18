/**
 * Unified CRUD Service Integration Tests
 * ======================================
 * 
 * Integration tests for UnifiedCRUDService
 * Tests integration with DataCollectionService, CRUDResponseHandler, CacheSyncManager, and ModalManagerV2
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

// Load the actual code files
const unifiedCRUDCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/services/unified-crud-service.js'),
    'utf8'
);

const crudResponseHandlerCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/services/crud-response-handler.js'),
    'utf8'
);

const dataCollectionCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/services/data-collection-service.js'),
    'utf8'
);

describe('UnifiedCRUDService Integration', () => {
    let UnifiedCRUDService;
    let DataCollectionService;
    let CRUDResponseHandler;
    
    // Mock dependencies
    let mockCacheSyncManager;
    let mockModalManagerV2;
    let mockEntityDetailsAPI;
    let mockLogger;
    let mockFetch;
    let mockDocument;
    
    beforeAll(() => {
        // Mock the global environment
        global.window = {
            Logger: null,
            DataCollectionService: null,
            CRUDResponseHandler: null,
            CacheSyncManager: null,
            ModalManagerV2: null,
            entityDetailsAPI: null,
            showErrorNotification: jest.fn(),
            showSuccessNotification: jest.fn(),
            loadTradesData: jest.fn(),
            loadTradePlansData: jest.fn(),
            loadAlertsData: jest.fn(),
            loadTickersData: jest.fn(),
            loadTradingAccountsDataForTradingAccountsPage: jest.fn(),
            loadExecutionsData: jest.fn(),
            loadCashFlowsData: jest.fn(),
            loadNotesData: jest.fn(),
            TradesData: {
                createTrade: jest.fn(),
                updateTrade: jest.fn()
            }
        };
        
        // Mock document
        mockDocument = {
            getElementById: jest.fn(),
            querySelector: jest.fn(),
            createElement: jest.fn()
        };
        global.document = mockDocument;
        
        // Mock fetch
        global.fetch = jest.fn();
        mockFetch = global.fetch;
        
        // Mock console
        global.console = {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            info: jest.fn(),
            debug: jest.fn()
        };
        
        // Setup mocks
        mockCacheSyncManager = {
            invalidateByAction: jest.fn().mockResolvedValue(true)
        };
        mockModalManagerV2 = {
            hideModal: jest.fn()
        };
        mockEntityDetailsAPI = {
            deleteEntity: jest.fn().mockResolvedValue(true)
        };
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };
        
        // Set up window objects
        global.window.CacheSyncManager = mockCacheSyncManager;
        global.window.ModalManagerV2 = mockModalManagerV2;
        global.window.entityDetailsAPI = mockEntityDetailsAPI;
        global.window.Logger = mockLogger;
        
        // Evaluate the real code
        eval(dataCollectionCode);
        DataCollectionService = global.window.DataCollectionService;
        global.window.DataCollectionService = DataCollectionService;
        
        eval(crudResponseHandlerCode);
        CRUDResponseHandler = global.window.CRUDResponseHandler;
        global.window.CRUDResponseHandler = CRUDResponseHandler;
        
        eval(unifiedCRUDCode);
        UnifiedCRUDService = global.window.UnifiedCRUDService;
    });
    
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        
        // Setup default mock responses
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ status: 'success', data: { id: 1 } })
        });
        
        // Setup default form element
        mockDocument.getElementById.mockReturnValue({
            value: 'test',
            dataset: { mode: 'add' }
        });
    });
    
    describe('Integration with DataCollectionService', () => {
        test('should collect form data using DataCollectionService', async () => {
            const fieldMap = {
                content: { id: 'noteContent', type: 'rich-text' },
                related_type_id: { id: 'noteRelatedType', type: 'text' },
                related_id: { id: 'noteRelatedObject', type: 'int' }
            };
            
            const collectedData = {
                content: '<p>Test note</p>',
                related_type_id: '2',
                related_id: '123'
            };
            
            // Mock DataCollectionService
            DataCollectionService.collectFormData = jest.fn().mockReturnValue(collectedData);
            
            await UnifiedCRUDService.saveEntity('note', null, {
                fieldMap,
                modalId: 'notesModal'
            });
            
            expect(DataCollectionService.collectFormData).toHaveBeenCalledWith(fieldMap);
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/notes',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(collectedData)
                })
            );
        });
        
        test('should handle rich-text fields correctly', async () => {
            const fieldMap = {
                content: { id: 'noteContent', type: 'rich-text' }
            };
            
            const collectedData = {
                content: '<p>Rich text content</p>'
            };
            
            DataCollectionService.collectFormData = jest.fn().mockReturnValue(collectedData);
            
            await UnifiedCRUDService.saveEntity('note', null, {
                fieldMap,
                modalId: 'notesModal'
            });
            
            expect(DataCollectionService.collectFormData).toHaveBeenCalled();
            expect(mockFetch).toHaveBeenCalled();
        });
    });
    
    describe('Integration with CRUDResponseHandler', () => {
        test('should use CRUDResponseHandler.handleSaveResponse for new entities', async () => {
            const entityData = { trading_account_id: 1, ticker_id: 2 };
            
            const mockResponse = {
                ok: true,
                json: async () => ({ status: 'success', data: { id: 1 } })
            };
            
            mockFetch.mockResolvedValue(mockResponse);
            
            await UnifiedCRUDService.saveEntity('trade', entityData, {
                modalId: 'tradesModal',
                successMessage: 'טרייד נוסף בהצלחה',
                entityName: 'טרייד',
                reloadFn: jest.fn()
            });
            
            expect(CRUDResponseHandler.handleSaveResponse).toHaveBeenCalledWith(
                mockResponse,
                expect.objectContaining({
                    modalId: 'tradesModal',
                    successMessage: 'טרייד נוסף בהצלחה',
                    entityName: 'טרייד'
                })
            );
        });
        
        test('should use CRUDResponseHandler.handleUpdateResponse for existing entities', async () => {
            const entityData = { id: 123, status: 'closed' };
            
            const mockResponse = {
                ok: true,
                json: async () => ({ status: 'success', data: { id: 123 } })
            };
            
            mockFetch.mockResolvedValue(mockResponse);
            
            await UnifiedCRUDService.updateEntity('trade', 123, { status: 'closed' }, {
                modalId: 'tradesModal',
                successMessage: 'טרייד עודכן בהצלחה',
                entityName: 'טרייד'
            });
            
            expect(CRUDResponseHandler.handleUpdateResponse).toHaveBeenCalledWith(
                mockResponse,
                expect.objectContaining({
                    modalId: 'tradesModal',
                    successMessage: 'טרייד עודכן בהצלחה',
                    entityName: 'טרייד'
                })
            );
        });
        
        test('should use CRUDResponseHandler.handleDeleteResponse for deletions', async () => {
            const mockResponse = {
                ok: true,
                json: async () => ({ status: 'success' })
            };
            
            mockEntityDetailsAPI.deleteEntity.mockResolvedValue(mockResponse);
            
            await UnifiedCRUDService.deleteEntity('trade', 123, {
                modalId: 'tradesModal',
                successMessage: 'טרייד נמחק בהצלחה',
                entityName: 'טרייד'
            });
            
            expect(CRUDResponseHandler.handleDeleteResponse).toHaveBeenCalledWith(
                mockResponse,
                expect.objectContaining({
                    modalId: 'tradesModal',
                    successMessage: 'טרייד נמחק בהצלחה',
                    entityName: 'טרייד'
                })
            );
        });
        
        test('should use CRUDResponseHandler.handleError for error handling', async () => {
            const error = new Error('API error');
            mockFetch.mockRejectedValue(error);
            
            await UnifiedCRUDService.saveEntity('trade', { trading_account_id: 1 }, {
                modalId: 'tradesModal',
                entityName: 'טרייד'
            });
            
            expect(CRUDResponseHandler.handleError).toHaveBeenCalledWith(
                error,
                'שמירת טרייד'
            );
        });
    });
    
    describe('Integration with CacheSyncManager', () => {
        test('should invalidate cache after save', async () => {
            await UnifiedCRUDService.saveEntity('trade', { trading_account_id: 1 }, {
                modalId: 'tradesModal'
            });
            
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trade-created');
        });
        
        test('should invalidate cache after update', async () => {
            await UnifiedCRUDService.updateEntity('trade', 123, { status: 'closed' }, {
                modalId: 'tradesModal'
            });
            
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trade-updated');
        });
        
        test('should invalidate cache after delete', async () => {
            await UnifiedCRUDService.deleteEntity('trade', 123, {
                modalId: 'tradesModal'
            });
            
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trade-deleted');
        });
        
        test('should handle cache invalidation errors gracefully', async () => {
            mockCacheSyncManager.invalidateByAction.mockRejectedValue(new Error('Cache error'));
            
            const result = await UnifiedCRUDService.saveEntity('trade', { trading_account_id: 1 }, {
                modalId: 'tradesModal'
            });
            
            expect(mockLogger.warn).toHaveBeenCalled();
            expect(result).toBeDefined(); // Should still succeed
        });
    });
    
    describe('Integration with ModalManagerV2', () => {
        test('should close modal through CRUDResponseHandler', async () => {
            // CRUDResponseHandler handles modal closing
            // We test that the modalId is passed correctly
            await UnifiedCRUDService.saveEntity('trade', { trading_account_id: 1 }, {
                modalId: 'tradesModal',
                successMessage: 'טרייד נוסף בהצלחה',
                entityName: 'טרייד'
            });
            
            expect(CRUDResponseHandler.handleSaveResponse).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    modalId: 'tradesModal'
                })
            );
        });
    });
    
    describe('Integration with EntityDetailsAPI', () => {
        test('should use EntityDetailsAPI.deleteEntity if available', async () => {
            await UnifiedCRUDService.deleteEntity('trade', 123, {
                modalId: 'tradesModal',
                entityName: 'טרייד'
            });
            
            expect(mockEntityDetailsAPI.deleteEntity).toHaveBeenCalledWith('trade', 123);
        });
        
        test('should fallback to fetch if EntityDetailsAPI not available', async () => {
            global.window.entityDetailsAPI = null;
            
            await UnifiedCRUDService.deleteEntity('trade', 123, {
                modalId: 'tradesModal',
                entityName: 'טרייד'
            });
            
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/trades/123',
                expect.objectContaining({
                    method: 'DELETE'
                })
            );
            
            // Restore mock
            global.window.entityDetailsAPI = mockEntityDetailsAPI;
        });
    });
    
    describe('Full CRUD Flow Integration', () => {
        test('should complete full create flow', async () => {
            const entityData = {
                trading_account_id: 1,
                ticker_id: 2,
                status: 'open',
                side: 'Long'
            };
            
            const options = {
                modalId: 'tradesModal',
                successMessage: 'טרייד נוסף בהצלחה',
                entityName: 'טרייד',
                reloadFn: jest.fn()
            };
            
            const result = await UnifiedCRUDService.saveEntity('trade', entityData, options);
            
            // Verify all integration points
            expect(mockFetch).toHaveBeenCalled();
            expect(CRUDResponseHandler.handleSaveResponse).toHaveBeenCalled();
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trade-created');
            expect(result).toBeDefined();
        });
        
        test('should complete full update flow', async () => {
            const entityData = { status: 'closed' };
            
            const options = {
                modalId: 'tradesModal',
                successMessage: 'טרייד עודכן בהצלחה',
                entityName: 'טרייד',
                reloadFn: jest.fn()
            };
            
            const result = await UnifiedCRUDService.updateEntity('trade', 123, entityData, options);
            
            // Verify all integration points
            expect(mockFetch).toHaveBeenCalled();
            expect(CRUDResponseHandler.handleUpdateResponse).toHaveBeenCalled();
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trade-updated');
            expect(result).toBeDefined();
        });
        
        test('should complete full delete flow', async () => {
            const options = {
                modalId: 'tradesModal',
                successMessage: 'טרייד נמחק בהצלחה',
                entityName: 'טרייד',
                reloadFn: jest.fn()
            };
            
            const result = await UnifiedCRUDService.deleteEntity('trade', 123, options);
            
            // Verify all integration points
            expect(mockEntityDetailsAPI.deleteEntity).toHaveBeenCalled();
            expect(CRUDResponseHandler.handleDeleteResponse).toHaveBeenCalled();
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trade-deleted');
            expect(result).toBe(true);
        });
    });
    
    describe('Error Handling Integration', () => {
        test('should handle DataCollectionService errors', async () => {
            DataCollectionService.collectFormData = jest.fn().mockImplementation(() => {
                throw new Error('Collection error');
            });
            
            await expect(
                UnifiedCRUDService.saveEntity('note', null, {
                    fieldMap: { content: { id: 'noteContent', type: 'rich-text' } },
                    modalId: 'notesModal'
                })
            ).rejects.toThrow('Collection error');
        });
        
        test('should handle CRUDResponseHandler errors', async () => {
            CRUDResponseHandler.handleSaveResponse = jest.fn().mockRejectedValue(new Error('Handler error'));
            
            const result = await UnifiedCRUDService.saveEntity('trade', { trading_account_id: 1 }, {
                modalId: 'tradesModal',
                entityName: 'טרייד'
            });
            
            expect(CRUDResponseHandler.handleError).toHaveBeenCalled();
            expect(result).toBeNull();
        });
        
        test('should handle CacheSyncManager errors gracefully', async () => {
            mockCacheSyncManager.invalidateByAction.mockRejectedValue(new Error('Cache error'));
            
            const result = await UnifiedCRUDService.saveEntity('trade', { trading_account_id: 1 }, {
                modalId: 'tradesModal'
            });
            
            expect(mockLogger.warn).toHaveBeenCalled();
            expect(result).toBeDefined(); // Should still succeed
        });
    });
    
    describe('Logger Integration', () => {
        test('should log debug messages during operations', async () => {
            await UnifiedCRUDService.saveEntity('trade', { trading_account_id: 1 }, {
                modalId: 'tradesModal'
            });
            
            expect(mockLogger.debug).toHaveBeenCalled();
        });
        
        test('should log info messages on success', async () => {
            await UnifiedCRUDService.saveEntity('trade', { trading_account_id: 1 }, {
                modalId: 'tradesModal'
            });
            
            expect(mockLogger.info).toHaveBeenCalled();
        });
        
        test('should log error messages on failure', async () => {
            mockFetch.mockRejectedValue(new Error('Test error'));
            
            await UnifiedCRUDService.saveEntity('trade', { trading_account_id: 1 }, {
                modalId: 'tradesModal',
                entityName: 'טרייד'
            });
            
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });
});


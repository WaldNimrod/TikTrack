/**
 * Unified CRUD Service Unit Tests
 * ================================
 * 
 * Unit tests for the UnifiedCRUDService system
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

// Import the real UnifiedCRUDService code
const fs = require('fs');
const path = require('path');

// Load the actual UnifiedCRUDService code
const unifiedCRUDCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/services/unified-crud-service.js'), 
    'utf8'
);

describe('UnifiedCRUDService', () => {
    let UnifiedCRUDService;
    
    // Mock dependencies
    let mockDataCollectionService;
    let mockCRUDResponseHandler;
    let mockCacheSyncManager;
    let mockEntityDetailsAPI;
    let mockLogger;
    let mockFetch;
    
    beforeAll(() => {
        // Mock the global environment
        global.window = {
            Logger: null,
            DataCollectionService: null,
            CRUDResponseHandler: null,
            CacheSyncManager: null,
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
            },
            TradePlansData: {
                createTradePlan: jest.fn(),
                updateTradePlan: jest.fn()
            },
            AlertsData: {
                createAlert: jest.fn(),
                updateAlert: jest.fn()
            },
            TickersData: {
                createTicker: jest.fn(),
                updateTicker: jest.fn()
            },
            TradingAccountsData: {
                createTradingAccount: jest.fn(),
                updateTradingAccount: jest.fn()
            },
            ExecutionsData: {
                createExecution: jest.fn(),
                updateExecution: jest.fn()
            },
            CashFlowsData: {
                createCashFlow: jest.fn(),
                updateCashFlow: jest.fn()
            },
            NotesData: {
                createNote: jest.fn(),
                updateNote: jest.fn()
            }
        };
        
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
        mockDataCollectionService = {
            collectFormData: jest.fn()
        };
        mockCRUDResponseHandler = {
            handleSaveResponse: jest.fn(),
            handleUpdateResponse: jest.fn(),
            handleDeleteResponse: jest.fn(),
            handleError: jest.fn()
        };
        mockCacheSyncManager = {
            invalidateByAction: jest.fn()
        };
        mockEntityDetailsAPI = {
            deleteEntity: jest.fn()
        };
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };
        
        // Set up window objects
        global.window.DataCollectionService = mockDataCollectionService;
        global.window.CRUDResponseHandler = mockCRUDResponseHandler;
        global.window.CacheSyncManager = mockCacheSyncManager;
        global.window.entityDetailsAPI = mockEntityDetailsAPI;
        global.window.Logger = mockLogger;
        
        // Evaluate the real code
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
        
        mockCRUDResponseHandler.handleSaveResponse.mockResolvedValue({ data: { id: 1 } });
        mockCRUDResponseHandler.handleUpdateResponse.mockResolvedValue({ data: { id: 1 } });
        mockCRUDResponseHandler.handleDeleteResponse.mockResolvedValue({ data: { id: 1 } });
        
        mockCacheSyncManager.invalidateByAction.mockResolvedValue(true);
        
        mockEntityDetailsAPI.deleteEntity.mockResolvedValue(true);
    });
    
    describe('saveEntity', () => {
        test('should save a new entity successfully', async () => {
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
            
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/trades',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(entityData)
                })
            );
            
            expect(mockCRUDResponseHandler.handleSaveResponse).toHaveBeenCalled();
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trade-created');
            expect(result).toBeDefined();
        });
        
        test('should update an existing entity successfully', async () => {
            const entityData = {
                id: 123,
                status: 'closed',
                closed_at: new Date().toISOString()
            };
            
            const options = {
                modalId: 'tradesModal',
                successMessage: 'טרייד עודכן בהצלחה',
                entityName: 'טרייד',
                reloadFn: jest.fn()
            };
            
            const result = await UnifiedCRUDService.saveEntity('trade', entityData, {
                ...options,
                isEdit: true
            });
            
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/trades/123',
                expect.objectContaining({
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' }
                })
            );
            
            expect(mockCRUDResponseHandler.handleUpdateResponse).toHaveBeenCalled();
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trade-updated');
            expect(result).toBeDefined();
        });
        
        test('should collect form data if entityData not provided', async () => {
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
            
            mockDataCollectionService.collectFormData.mockReturnValue(collectedData);
            
            const options = {
                modalId: 'notesModal',
                fieldMap
            };
            
            await UnifiedCRUDService.saveEntity('note', null, options);
            
            expect(mockDataCollectionService.collectFormData).toHaveBeenCalledWith(fieldMap);
            expect(mockFetch).toHaveBeenCalled();
        });
        
        test('should throw error for invalid entity type', async () => {
            await expect(
                UnifiedCRUDService.saveEntity('invalid_type', {}, {})
            ).rejects.toThrow('Invalid entity type');
        });
        
        test('should throw error when no data provided', async () => {
            await expect(
                UnifiedCRUDService.saveEntity('trade', null, {})
            ).rejects.toThrow('No data provided');
        });
        
        test('should use entity service method if available', async () => {
            const entityData = { trading_account_id: 1, ticker_id: 2 };
            
            global.window.TradesData.createTrade.mockResolvedValue({ data: { id: 1 } });
            
            await UnifiedCRUDService.saveEntity('trade', entityData, {
                modalId: 'tradesModal'
            });
            
            expect(global.window.TradesData.createTrade).toHaveBeenCalledWith(entityData);
            expect(mockFetch).not.toHaveBeenCalled();
        });
        
        test('should handle errors gracefully', async () => {
            const error = new Error('API error');
            mockFetch.mockRejectedValue(error);
            
            const result = await UnifiedCRUDService.saveEntity('trade', { trading_account_id: 1 }, {
                modalId: 'tradesModal',
                entityName: 'טרייד'
            });
            
            expect(mockCRUDResponseHandler.handleError).toHaveBeenCalledWith(
                error,
                'שמירת טרייד'
            );
            expect(result).toBeNull();
        });
    });
    
    describe('updateEntity', () => {
        test('should update entity successfully', async () => {
            const entityId = 123;
            const entityData = {
                status: 'closed',
                closed_at: new Date().toISOString()
            };
            
            const options = {
                modalId: 'tradesModal',
                successMessage: 'טרייד עודכן בהצלחה',
                entityName: 'טרייד'
            };
            
            const result = await UnifiedCRUDService.updateEntity('trade', entityId, entityData, options);
            
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/trades/123',
                expect.objectContaining({
                    method: 'PUT'
                })
            );
            
            expect(mockCRUDResponseHandler.handleUpdateResponse).toHaveBeenCalled();
            expect(result).toBeDefined();
        });
    });
    
    describe('deleteEntity', () => {
        test('should delete entity successfully', async () => {
            const entityId = 123;
            const options = {
                modalId: 'tradesModal',
                successMessage: 'טרייד נמחק בהצלחה',
                entityName: 'טרייד',
                reloadFn: jest.fn()
            };
            
            const result = await UnifiedCRUDService.deleteEntity('trade', entityId, options);
            
            expect(mockEntityDetailsAPI.deleteEntity).toHaveBeenCalledWith('trade', entityId);
            expect(mockCRUDResponseHandler.handleDeleteResponse).toHaveBeenCalled();
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trade-deleted');
            expect(result).toBe(true);
        });
        
        test('should check linked items before deletion', async () => {
            const entityId = 123;
            const checkLinkedItems = jest.fn().mockResolvedValue(true);
            
            const options = {
                modalId: 'tradesModal',
                checkLinkedItems
            };
            
            const result = await UnifiedCRUDService.deleteEntity('trade', entityId, options);
            
            expect(checkLinkedItems).toHaveBeenCalledWith('trade', entityId);
            expect(mockEntityDetailsAPI.deleteEntity).not.toHaveBeenCalled();
            expect(result).toBe(false);
        });
        
        test('should fallback to fetch if EntityDetailsAPI not available', async () => {
            global.window.entityDetailsAPI = null;
            
            const entityId = 123;
            const options = {
                modalId: 'tradesModal',
                entityName: 'טרייד'
            };
            
            await UnifiedCRUDService.deleteEntity('trade', entityId, options);
            
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/trades/123',
                expect.objectContaining({
                    method: 'DELETE'
                })
            );
            
            // Restore mock
            global.window.entityDetailsAPI = mockEntityDetailsAPI;
        });
        
        test('should handle errors gracefully', async () => {
            const error = new Error('Delete failed');
            mockEntityDetailsAPI.deleteEntity.mockRejectedValue(error);
            
            const result = await UnifiedCRUDService.deleteEntity('trade', 123, {
                modalId: 'tradesModal',
                entityName: 'טרייד'
            });
            
            expect(mockCRUDResponseHandler.handleError).toHaveBeenCalledWith(
                error,
                'מחיקת טרייד'
            );
            expect(result).toBe(false);
        });
    });
    
    describe('_getEntityAPIEndpoint', () => {
        test('should return correct endpoint for each entity type', () => {
            expect(UnifiedCRUDService._getEntityAPIEndpoint('trade')).toBe('/api/trades');
            expect(UnifiedCRUDService._getEntityAPIEndpoint('trade_plan')).toBe('/api/trade-plans');
            expect(UnifiedCRUDService._getEntityAPIEndpoint('alert')).toBe('/api/alerts');
            expect(UnifiedCRUDService._getEntityAPIEndpoint('ticker')).toBe('/api/tickers');
            expect(UnifiedCRUDService._getEntityAPIEndpoint('trading_account')).toBe('/api/trading-accounts');
            expect(UnifiedCRUDService._getEntityAPIEndpoint('execution')).toBe('/api/executions');
            expect(UnifiedCRUDService._getEntityAPIEndpoint('cash_flow')).toBe('/api/cash-flows');
            expect(UnifiedCRUDService._getEntityAPIEndpoint('note')).toBe('/api/notes');
        });
        
        test('should return default endpoint for unknown entity type', () => {
            expect(UnifiedCRUDService._getEntityAPIEndpoint('unknown')).toBe('/api/unknown');
        });
    });
    
    describe('_getEntityActionName', () => {
        test('should return correct action name for each entity and operation', () => {
            expect(UnifiedCRUDService._getEntityActionName('trade', 'created')).toBe('trade-created');
            expect(UnifiedCRUDService._getEntityActionName('trade', 'updated')).toBe('trade-updated');
            expect(UnifiedCRUDService._getEntityActionName('trade', 'deleted')).toBe('trade-deleted');
            
            expect(UnifiedCRUDService._getEntityActionName('trade_plan', 'created')).toBe('trade-plan-created');
            expect(UnifiedCRUDService._getEntityActionName('alert', 'updated')).toBe('alert-updated');
            expect(UnifiedCRUDService._getEntityActionName('note', 'deleted')).toBe('note-deleted');
        });
        
        test('should handle ticker special case', () => {
            expect(UnifiedCRUDService._getEntityActionName('ticker', 'created')).toBe('ticker-updated');
            expect(UnifiedCRUDService._getEntityActionName('ticker', 'updated')).toBe('ticker-updated');
            expect(UnifiedCRUDService._getEntityActionName('ticker', 'deleted')).toBe('ticker-updated');
        });
    });
    
    describe('_isValidEntityType', () => {
        test('should return true for valid entity types', () => {
            expect(UnifiedCRUDService._isValidEntityType('trade')).toBe(true);
            expect(UnifiedCRUDService._isValidEntityType('trade_plan')).toBe(true);
            expect(UnifiedCRUDService._isValidEntityType('alert')).toBe(true);
            expect(UnifiedCRUDService._isValidEntityType('ticker')).toBe(true);
            expect(UnifiedCRUDService._isValidEntityType('trading_account')).toBe(true);
            expect(UnifiedCRUDService._isValidEntityType('execution')).toBe(true);
            expect(UnifiedCRUDService._isValidEntityType('cash_flow')).toBe(true);
            expect(UnifiedCRUDService._isValidEntityType('note')).toBe(true);
        });
        
        test('should return false for invalid entity types', () => {
            expect(UnifiedCRUDService._isValidEntityType('invalid')).toBe(false);
            expect(UnifiedCRUDService._isValidEntityType('')).toBe(false);
            expect(UnifiedCRUDService._isValidEntityType(null)).toBe(false);
        });
    });
    
    describe('_getDefaultReloadFunction', () => {
        test('should return correct reload function for each entity type', () => {
            const tradeReload = UnifiedCRUDService._getDefaultReloadFunction('trade');
            expect(tradeReload).toBeDefined();
            expect(typeof tradeReload).toBe('function');
            
            const noteReload = UnifiedCRUDService._getDefaultReloadFunction('note');
            expect(noteReload).toBeDefined();
            expect(typeof noteReload).toBe('function');
        });
        
        test('should return null for unknown entity type', () => {
            expect(UnifiedCRUDService._getDefaultReloadFunction('unknown')).toBeNull();
        });
    });
    
    describe('_getEntityServiceMethod', () => {
        test('should return correct service method for trade', () => {
            const createMethod = UnifiedCRUDService._getEntityServiceMethod('trade', 'create');
            expect(createMethod).toBe(global.window.TradesData.createTrade);
            
            const updateMethod = UnifiedCRUDService._getEntityServiceMethod('trade', 'update');
            expect(updateMethod).toBe(global.window.TradesData.updateTrade);
        });
        
        test('should return null for unknown entity type', () => {
            expect(UnifiedCRUDService._getEntityServiceMethod('unknown', 'create')).toBeNull();
        });
        
        test('should return null for unknown operation', () => {
            expect(UnifiedCRUDService._getEntityServiceMethod('trade', 'unknown')).toBeNull();
        });
    });
    
    describe('Integration with DataCollectionService', () => {
        test('should use DataCollectionService for form data collection', async () => {
            const fieldMap = {
                content: { id: 'noteContent', type: 'rich-text' },
                related_type_id: { id: 'noteRelatedType', type: 'text' }
            };
            
            const collectedData = {
                content: '<p>Test</p>',
                related_type_id: '2'
            };
            
            mockDataCollectionService.collectFormData.mockReturnValue(collectedData);
            
            await UnifiedCRUDService.saveEntity('note', null, {
                fieldMap,
                modalId: 'notesModal'
            });
            
            expect(mockDataCollectionService.collectFormData).toHaveBeenCalledWith(fieldMap);
        });
    });
    
    describe('Integration with CRUDResponseHandler', () => {
        test('should use CRUDResponseHandler for save response', async () => {
            await UnifiedCRUDService.saveEntity('trade', { trading_account_id: 1 }, {
                modalId: 'tradesModal',
                entityName: 'טרייד'
            });
            
            expect(mockCRUDResponseHandler.handleSaveResponse).toHaveBeenCalled();
        });
        
        test('should use CRUDResponseHandler for update response', async () => {
            await UnifiedCRUDService.updateEntity('trade', 123, { status: 'closed' }, {
                modalId: 'tradesModal',
                entityName: 'טרייד'
            });
            
            expect(mockCRUDResponseHandler.handleUpdateResponse).toHaveBeenCalled();
        });
        
        test('should use CRUDResponseHandler for delete response', async () => {
            await UnifiedCRUDService.deleteEntity('trade', 123, {
                modalId: 'tradesModal',
                entityName: 'טרייד'
            });
            
            expect(mockCRUDResponseHandler.handleDeleteResponse).toHaveBeenCalled();
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
    
    describe('Error Handling', () => {
        test('should handle API errors gracefully', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 400,
                json: async () => ({ error: { message: 'Validation error' } })
            });
            
            mockCRUDResponseHandler.handleSaveResponse.mockResolvedValue(null);
            
            const result = await UnifiedCRUDService.saveEntity('trade', { trading_account_id: 1 }, {
                modalId: 'tradesModal',
                entityName: 'טרייד'
            });
            
            expect(result).toBeNull();
        });
        
        test('should handle network errors gracefully', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));
            
            const result = await UnifiedCRUDService.saveEntity('trade', { trading_account_id: 1 }, {
                modalId: 'tradesModal',
                entityName: 'טרייד'
            });
            
            expect(mockCRUDResponseHandler.handleError).toHaveBeenCalled();
            expect(result).toBeNull();
        });
    });
    
    describe('Logger Integration', () => {
        test('should log debug messages', async () => {
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


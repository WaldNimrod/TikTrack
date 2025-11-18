/**
 * Unified CRUD Service E2E Tests
 * ================================
 * 
 * End-to-End tests for UnifiedCRUDService
 * Tests complete user workflows for CRUD operations
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

const linkedItemsServiceCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/services/linked-items-service.js'),
    'utf8'
);

describe('UnifiedCRUDService E2E Flows', () => {
    let UnifiedCRUDService;
    let DataCollectionService;
    let CRUDResponseHandler;
    let LinkedItemsService;
    
    // Mock dependencies
    let mockCacheSyncManager;
    let mockModalManagerV2;
    let mockEntityDetailsAPI;
    let mockLogger;
    let mockFetch;
    let mockDocument;
    let mockWindow;
    
    beforeAll(() => {
        // Mock the global environment
        mockWindow = {
            Logger: null,
            DataCollectionService: null,
            CRUDResponseHandler: null,
            CacheSyncManager: null,
            ModalManagerV2: null,
            entityDetailsAPI: null,
            UnifiedCRUDService: null,
            LinkedItemsService: null,
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
            updateNotesTable: jest.fn(),
            checkLinkedItemsBeforeAction: jest.fn().mockResolvedValue(false),
            showEntityDetails: jest.fn(),
            TradesData: {
                createTrade: jest.fn(),
                updateTrade: jest.fn()
            },
            TradePlansData: {
                createTradePlan: jest.fn(),
                updateTradePlan: jest.fn()
            }
        };
        
        global.window = mockWindow;
        
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
            deleteEntity: jest.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ status: 'success' })
            })
        };
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };
        
        // Set up window objects
        mockWindow.CacheSyncManager = mockCacheSyncManager;
        mockWindow.ModalManagerV2 = mockModalManagerV2;
        mockWindow.entityDetailsAPI = mockEntityDetailsAPI;
        mockWindow.Logger = mockLogger;
        
        // Evaluate the real code
        eval(dataCollectionCode);
        DataCollectionService = mockWindow.DataCollectionService;
        
        eval(crudResponseHandlerCode);
        CRUDResponseHandler = mockWindow.CRUDResponseHandler;
        
        eval(unifiedCRUDCode);
        UnifiedCRUDService = mockWindow.UnifiedCRUDService;
        
        eval(linkedItemsServiceCode);
        LinkedItemsService = mockWindow.LinkedItemsService;
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
    
    describe('Complete CRUD Flow - Trade', () => {
        test('should complete full create → update → delete flow', async () => {
            // Step 1: Create trade
            const createData = {
                trading_account_id: 1,
                ticker_id: 2,
                status: 'open',
                side: 'Long'
            };
            
            const createResult = await UnifiedCRUDService.saveEntity('trade', createData, {
                modalId: 'tradesModal',
                successMessage: 'טרייד נוסף בהצלחה',
                entityName: 'טרייד',
                reloadFn: mockWindow.loadTradesData
            });
            
            expect(createResult).toBeDefined();
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trade-created');
            
            // Step 2: Update trade
            const updateData = { status: 'closed', closed_at: new Date().toISOString() };
            const tradeId = createResult?.data?.id || 1;
            
            const updateResult = await UnifiedCRUDService.updateEntity('trade', tradeId, updateData, {
                modalId: 'tradesModal',
                successMessage: 'טרייד עודכן בהצלחה',
                entityName: 'טרייד',
                reloadFn: mockWindow.loadTradesData
            });
            
            expect(updateResult).toBeDefined();
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trade-updated');
            
            // Step 3: Delete trade
            const deleteResult = await UnifiedCRUDService.deleteEntity('trade', tradeId, {
                modalId: 'tradesModal',
                successMessage: 'טרייד נמחק בהצלחה',
                entityName: 'טרייד',
                reloadFn: mockWindow.loadTradesData
            });
            
            expect(deleteResult).toBe(true);
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trade-deleted');
        });
    });
    
    describe('Complete CRUD Flow - Note with Rich Text', () => {
        test('should complete full create → update → delete flow for note', async () => {
            // Step 1: Create note with form data collection
            const fieldMap = {
                content: { id: 'noteContent', type: 'rich-text' },
                related_type_id: { id: 'noteRelatedType', type: 'text' },
                related_id: { id: 'noteRelatedObject', type: 'int' },
                tag_ids: { id: 'noteTags', type: 'tags', default: [] }
            };
            
            const collectedData = {
                content: '<p>Test note content</p>',
                related_type_id: '2',
                related_id: '123',
                tag_ids: [1, 2]
            };
            
            DataCollectionService.collectFormData = jest.fn().mockReturnValue(collectedData);
            
            const createResult = await UnifiedCRUDService.saveEntity('note', null, {
                fieldMap,
                modalId: 'notesModal',
                successMessage: 'הערה נשמרה בהצלחה!',
                entityName: 'הערה',
                reloadFn: () => mockWindow.loadNotesData({ force: true })
            });
            
            expect(DataCollectionService.collectFormData).toHaveBeenCalledWith(fieldMap);
            expect(createResult).toBeDefined();
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('note-created');
            
            // Step 2: Update note
            const noteId = createResult?.data?.id || 1;
            const updateData = {
                content: '<p>Updated note content</p>',
                related_type_id: 2,
                related_id: 123
            };
            
            const updateResult = await UnifiedCRUDService.updateEntity('note', noteId, updateData, {
                modalId: 'notesModal',
                successMessage: 'הערה עודכנה בהצלחה!',
                entityName: 'הערה',
                reloadFn: () => mockWindow.loadNotesData({ force: true })
            });
            
            expect(updateResult).toBeDefined();
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('note-updated');
            
            // Step 3: Delete note
            const deleteResult = await UnifiedCRUDService.deleteEntity('note', noteId, {
                modalId: 'notesModal',
                successMessage: 'הערה נמחקה בהצלחה!',
                entityName: 'הערה',
                reloadFn: mockWindow.updateNotesTable
            });
            
            expect(deleteResult).toBe(true);
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('note-deleted');
        });
    });
    
    describe('Linked Items Flow with UnifiedCRUDService', () => {
        test('should delete entity from linked items modal using UnifiedCRUDService', async () => {
            // Simulate linked items modal context
            const item = {
                id: 123,
                type: 'note',
                status: 'open'
            };
            
            const sourceInfo = {
                sourceType: 'trade',
                sourceId: 456
            };
            
            // Generate delete function using LinkedItemsService
            const deleteFunction = LinkedItemsService._getDeleteFunctionForType('note', 123);
            
            expect(deleteFunction).toBeDefined();
            expect(typeof deleteFunction).toBe('string');
            
            // The function should reference UnifiedCRUDService
            expect(deleteFunction).toContain('UnifiedCRUDService');
        });
        
        test('should handle unlink trade from plan flow', async () => {
            // Simulate unlink operation
            const tradeId = 123;
            const planId = 456;
            
            // Unlink: update trade.trade_plan_id = null
            const result = await UnifiedCRUDService.updateEntity('trade', tradeId, {
                trade_plan_id: null
            }, {
                successMessage: 'קישור לתוכנית בוטל בהצלחה',
                entityName: 'טרייד',
                reloadFn: () => {
                    if (mockWindow.loadTradesData) mockWindow.loadTradesData();
                    if (mockWindow.loadTradePlansData) mockWindow.loadTradePlansData();
                }
            });
            
            expect(result).toBeDefined();
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trade-updated');
        });
    });
    
    describe('Cancel/Uncancel Flow', () => {
        test('should handle cancel trade plan flow', async () => {
            // This would typically use the cancel function from LinkedItemsService
            // We test that UnifiedCRUDService can be used for status updates
            const planId = 123;
            
            const result = await UnifiedCRUDService.updateEntity('trade_plan', planId, {
                status: 'cancelled',
                cancelled_at: new Date().toISOString()
            }, {
                modalId: 'tradePlansModal',
                successMessage: 'תוכנית בוטלה בהצלחה',
                entityName: 'תוכנית',
                reloadFn: mockWindow.loadTradePlansData
            });
            
            expect(result).toBeDefined();
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trade-plan-updated');
        });
        
        test('should handle reactivate trade plan flow', async () => {
            const planId = 123;
            
            const result = await UnifiedCRUDService.updateEntity('trade_plan', planId, {
                status: 'open',
                cancelled_at: null
            }, {
                modalId: 'tradePlansModal',
                successMessage: 'תוכנית הופעלה מחדש בהצלחה',
                entityName: 'תוכנית',
                reloadFn: mockWindow.loadTradePlansData
            });
            
            expect(result).toBeDefined();
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trade-plan-updated');
        });
    });
    
    describe('Error Recovery Flow', () => {
        test('should recover from API error and retry', async () => {
            // First attempt fails
            mockFetch.mockRejectedValueOnce(new Error('Network error'));
            
            // Second attempt succeeds
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 'success', data: { id: 1 } })
            });
            
            // In real scenario, user would retry
            // Here we test that error handling works
            const result = await UnifiedCRUDService.saveEntity('trade', { trading_account_id: 1 }, {
                modalId: 'tradesModal',
                entityName: 'טרייד'
            });
            
            expect(CRUDResponseHandler.handleError).toHaveBeenCalled();
            expect(result).toBeNull();
        });
        
        test('should handle validation errors gracefully', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 400,
                json: async () => ({ error: { message: 'Validation error' } })
            });
            
            CRUDResponseHandler.handleSaveResponse = jest.fn().mockResolvedValue(null);
            
            const result = await UnifiedCRUDService.saveEntity('trade', { trading_account_id: 1 }, {
                modalId: 'tradesModal',
                entityName: 'טרייד'
            });
            
            expect(result).toBeNull();
            expect(mockWindow.showErrorNotification).not.toHaveBeenCalled(); // CRUDResponseHandler handles it
        });
    });
    
    describe('Cache Invalidation Flow', () => {
        test('should invalidate all related caches after trade operation', async () => {
            await UnifiedCRUDService.saveEntity('trade', { trading_account_id: 1 }, {
                modalId: 'tradesModal'
            });
            
            // Verify cache invalidation
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trade-created');
            
            // In real scenario, this would trigger:
            // - trades-data cache invalidation
            // - dashboard-data cache invalidation
            // - Any other dependent caches
        });
        
        test('should invalidate caches for all entity types', async () => {
            const entityTypes = ['trade', 'trade_plan', 'alert', 'ticker', 'trading_account', 'execution', 'cash_flow', 'note'];
            
            for (const entityType of entityTypes) {
                jest.clearAllMocks();
                
                await UnifiedCRUDService.saveEntity(entityType, { id: 1 }, {
                    modalId: `${entityType}Modal`
                });
                
                expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalled();
            }
        });
    });
    
    describe('Multi-Entity Operations Flow', () => {
        test('should handle multiple entity operations in sequence', async () => {
            // Create trade
            const tradeResult = await UnifiedCRUDService.saveEntity('trade', {
                trading_account_id: 1,
                ticker_id: 2
            }, {
                modalId: 'tradesModal',
                entityName: 'טרייד'
            });
            
            expect(tradeResult).toBeDefined();
            
            // Create note linked to trade
            const noteResult = await UnifiedCRUDService.saveEntity('note', {
                content: '<p>Note for trade</p>',
                related_type_id: 2, // trade
                related_id: tradeResult?.data?.id || 1
            }, {
                modalId: 'notesModal',
                entityName: 'הערה'
            });
            
            expect(noteResult).toBeDefined();
            
            // Update trade
            await UnifiedCRUDService.updateEntity('trade', tradeResult?.data?.id || 1, {
                status: 'closed'
            }, {
                modalId: 'tradesModal',
                entityName: 'טרייד'
            });
            
            // Delete note
            await UnifiedCRUDService.deleteEntity('note', noteResult?.data?.id || 1, {
                modalId: 'notesModal',
                entityName: 'הערה'
            });
            
            // Verify all operations completed
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledTimes(4);
        });
    });
});


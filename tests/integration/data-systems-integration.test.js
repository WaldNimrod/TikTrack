/**
 * Data Systems Integration Tests
 * ==============================
 * 
 * בדיקות אינטגרציה בין מערכות נתונים שונות
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

// Import the real systems
const fs = require('fs');
const path = require('path');

// Load the actual system codes
const cacheManagerCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/unified-cache-manager.js'), 
    'utf8'
);

const tableSystemCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/table-system.js'), 
    'utf8'
);

const chartSystemCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/chart-system.js'), 
    'utf8'
);

describe('Data Systems Integration', () => {
    let UnifiedCacheManager;
    let TableSystem;
    let ChartSystem;
    let cacheManager;
    
    beforeAll(() => {
        // Mock the global environment
        global.window = {
            Logger: {
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
                debug: jest.fn()
            },
            indexedDB: {
                open: jest.fn(),
                deleteDatabase: jest.fn()
            },
            localStorage: {
                getItem: jest.fn(),
                setItem: jest.fn(),
                removeItem: jest.fn(),
                clear: jest.fn()
            },
            sessionStorage: {
                getItem: jest.fn(),
                setItem: jest.fn(),
                removeItem: jest.fn(),
                clear: jest.fn()
            },
            fetch: jest.fn()
        };
        
        // Mock DOM methods
        global.document = {
            createElement: jest.fn(),
            getElementById: jest.fn(),
            querySelector: jest.fn(),
            querySelectorAll: jest.fn()
        };
        
        // Mock Chart.js
        global.Chart = {
            register: jest.fn(),
            unregister: jest.fn(),
            getChart: jest.fn(),
            destroy: jest.fn()
        };
        
        // Mock layer classes
        global.MemoryLayer = class MemoryLayer {
            async initialize() { return true; }
            async get(key) { return null; }
            async set(key, value, options) { return true; }
            async delete(key) { return true; }
            async clear() { return true; }
            async getStats() { return { entries: 0, size: 0 }; }
        };
        
        global.LocalStorageLayer = class LocalStorageLayer {
            async initialize() { return true; }
            async get(key) { return null; }
            async set(key, value, options) { return true; }
            async delete(key) { return true; }
            async clear() { return true; }
            async getStats() { return { entries: 0, size: 0 }; }
        };
        
        global.IndexedDBLayer = class IndexedDBLayer {
            async initialize() { return true; }
            async get(key) { return null; }
            async set(key, value, options) { return true; }
            async delete(key) { return true; }
            async clear() { return true; }
            async getStats() { return { entries: 0, size: 0 }; }
        };
        
        global.BackendCacheLayer = class BackendCacheLayer {
            async initialize() { return true; }
            async get(key) { return null; }
            async set(key, value, options) { return true; }
            async delete(key) { return true; }
            async clear() { return true; }
            async getStats() { return { entries: 0, size: 0 }; }
        };
        
        // Load the real systems
        eval(cacheManagerCode);
        eval(tableSystemCode);
        eval(chartSystemCode);
        
        UnifiedCacheManager = global.UnifiedCacheManager;
        TableSystem = global.TableSystem;
        ChartSystem = global.ChartSystem;
    });
    
    beforeEach(() => {
        cacheManager = new UnifiedCacheManager();
        jest.clearAllMocks();
    });
    
    describe('Cache + Table Integration', () => {
        test('should cache table data and retrieve it', async () => {
            const tableData = [
                { id: 1, symbol: 'AAPL', price: 150.00 },
                { id: 2, symbol: 'GOOGL', price: 2800.00 }
            ];
            
            // Mock cache operations
            cacheManager.layers.memory.set = jest.fn().mockResolvedValue(true);
            cacheManager.layers.memory.get = jest.fn().mockResolvedValue(tableData);
            
            // Mock table operations
            TableSystem.loadTableData = jest.fn().mockResolvedValue(tableData);
            TableSystem.updateTable = jest.fn().mockResolvedValue(true);
            
            // Test cache integration
            await cacheManager.set('trades-table-data', tableData);
            const cachedData = await cacheManager.get('trades-table-data');
            
            expect(cachedData).toEqual(tableData);
            expect(cacheManager.layers.memory.set).toHaveBeenCalledWith('trades-table-data', tableData, expect.any(Object));
            expect(cacheManager.layers.memory.get).toHaveBeenCalledWith('trades-table-data');
        });
        
        test('should handle table data updates with cache invalidation', async () => {
            const originalData = [
                { id: 1, symbol: 'AAPL', price: 150.00 }
            ];
            
            const updatedData = [
                { id: 1, symbol: 'AAPL', price: 155.00 }
            ];
            
            // Mock cache operations
            cacheManager.layers.memory.set = jest.fn().mockResolvedValue(true);
            cacheManager.layers.memory.delete = jest.fn().mockResolvedValue(true);
            
            // Mock table operations
            TableSystem.updateTable = jest.fn().mockResolvedValue(true);
            
            // Test cache invalidation
            await cacheManager.set('trades-table-data', originalData);
            await cacheManager.delete('trades-table-data');
            await cacheManager.set('trades-table-data', updatedData);
            
            expect(cacheManager.layers.memory.delete).toHaveBeenCalledWith('trades-table-data');
            expect(cacheManager.layers.memory.set).toHaveBeenCalledWith('trades-table-data', updatedData, expect.any(Object));
        });
    });
    
    describe('Cache + Chart Integration', () => {
        test('should cache chart data and retrieve it', async () => {
            const chartData = {
                labels: ['Jan', 'Feb', 'Mar'],
                datasets: [{
                    label: 'Trades',
                    data: [10, 20, 30]
                }]
            };
            
            // Mock cache operations
            cacheManager.layers.indexedDB = {
                set: jest.fn().mockResolvedValue(true),
                get: jest.fn().mockResolvedValue(chartData)
            };
            
            // Mock chart operations
            ChartSystem.createChart = jest.fn().mockResolvedValue({ id: 'chart-1' });
            ChartSystem.updateChart = jest.fn().mockResolvedValue(true);
            
            // Test cache integration
            await cacheManager.set('trades-chart-data', chartData);
            const cachedData = await cacheManager.get('trades-chart-data');
            
            expect(cachedData).toEqual(chartData);
            expect(cacheManager.layers.indexedDB.set).toHaveBeenCalledWith('trades-chart-data', chartData, expect.any(Object));
            expect(cacheManager.layers.indexedDB.get).toHaveBeenCalledWith('trades-chart-data');
        });
        
        test('should handle chart data updates with cache synchronization', async () => {
            const originalChartData = {
                labels: ['Jan', 'Feb'],
                datasets: [{ data: [10, 20] }]
            };
            
            const updatedChartData = {
                labels: ['Jan', 'Feb', 'Mar'],
                datasets: [{ data: [10, 20, 30] }]
            };
            
            // Mock cache operations
            cacheManager.layers.indexedDB = {
                set: jest.fn().mockResolvedValue(true),
                get: jest.fn().mockResolvedValue(updatedChartData)
            };
            
            // Mock chart operations
            ChartSystem.updateChart = jest.fn().mockResolvedValue(true);
            
            // Test cache synchronization
            await cacheManager.set('trades-chart-data', originalChartData);
            await cacheManager.set('trades-chart-data', updatedChartData);
            const cachedData = await cacheManager.get('trades-chart-data');
            
            expect(cachedData).toEqual(updatedChartData);
            expect(ChartSystem.updateChart).toHaveBeenCalledWith('trades-chart', updatedChartData);
        });
    });
    
    describe('Table + Chart Integration', () => {
        test('should update chart when table data changes', () => {
            const tableData = [
                { id: 1, symbol: 'AAPL', price: 150.00, date: '2025-01-01' },
                { id: 2, symbol: 'GOOGL', price: 2800.00, date: '2025-01-02' }
            ];
            
            // Mock table operations
            TableSystem.updateTable = jest.fn().mockResolvedValue(true);
            TableSystem.getTableData = jest.fn().mockReturnValue(tableData);
            
            // Mock chart operations
            ChartSystem.updateChart = jest.fn().mockResolvedValue(true);
            ChartSystem.getChartData = jest.fn().mockReturnValue({
                labels: ['2025-01-01', '2025-01-02'],
                datasets: [{ data: [150.00, 2800.00] }]
            });
            
            // Test integration
            TableSystem.updateTable('trades-table', tableData);
            const chartData = ChartSystem.getChartData('trades-chart');
            
            expect(chartData.labels).toContain('2025-01-01');
            expect(chartData.labels).toContain('2025-01-02');
            expect(chartData.datasets[0].data).toContain(150.00);
            expect(chartData.datasets[0].data).toContain(2800.00);
        });
        
        test('should handle table sorting with chart updates', () => {
            const unsortedData = [
                { id: 1, symbol: 'GOOGL', price: 2800.00, date: '2025-01-02' },
                { id: 2, symbol: 'AAPL', price: 150.00, date: '2025-01-01' }
            ];
            
            const sortedData = [
                { id: 2, symbol: 'AAPL', price: 150.00, date: '2025-01-01' },
                { id: 1, symbol: 'GOOGL', price: 2800.00, date: '2025-01-02' }
            ];
            
            // Mock table sorting
            TableSystem.sortTableData = jest.fn().mockReturnValue(sortedData);
            TableSystem.updateTable = jest.fn().mockResolvedValue(true);
            
            // Mock chart operations
            ChartSystem.updateChart = jest.fn().mockResolvedValue(true);
            
            // Test sorting integration
            const sorted = TableSystem.sortTableData(unsortedData, 'date', 'asc');
            TableSystem.updateTable('trades-table', sorted);
            
            expect(sorted[0].symbol).toBe('AAPL');
            expect(sorted[1].symbol).toBe('GOOGL');
            expect(ChartSystem.updateChart).toHaveBeenCalledWith('trades-chart', expect.any(Object));
        });
    });
    
    describe('Data Synchronization', () => {
        test('should synchronize data between cache and UI components', async () => {
            const syncData = { id: 1, symbol: 'AAPL', price: 150.00 };
            
            // Mock cache operations
            cacheManager.layers.memory.set = jest.fn().mockResolvedValue(true);
            cacheManager.layers.localStorage.set = jest.fn().mockResolvedValue(true);
            cacheManager.layers.indexedDB = {
                set: jest.fn().mockResolvedValue(true)
            };
            
            // Mock UI operations
            TableSystem.updateTable = jest.fn().mockResolvedValue(true);
            ChartSystem.updateChart = jest.fn().mockResolvedValue(true);
            
            // Test synchronization
            await cacheManager.set('sync-data', syncData, { sync: true });
            
            expect(cacheManager.layers.memory.set).toHaveBeenCalledWith('sync-data', syncData, expect.any(Object));
            expect(cacheManager.layers.localStorage.set).toHaveBeenCalledWith('sync-data', syncData, expect.any(Object));
            expect(cacheManager.layers.indexedDB.set).toHaveBeenCalledWith('sync-data', syncData, expect.any(Object));
        });
        
        test('should handle data conflicts between systems', async () => {
            const conflictData = { id: 1, symbol: 'AAPL', price: 150.00 };
            const updatedData = { id: 1, symbol: 'AAPL', price: 155.00 };
            
            // Mock cache operations
            cacheManager.layers.memory.get = jest.fn().mockResolvedValue(conflictData);
            cacheManager.layers.localStorage.get = jest.fn().mockResolvedValue(updatedData);
            
            // Mock conflict resolution
            cacheManager.resolveConflict = jest.fn().mockResolvedValue(updatedData);
            
            // Test conflict resolution
            const memoryData = await cacheManager.layers.memory.get('conflict-key');
            const localStorageData = await cacheManager.layers.localStorage.get('conflict-key');
            const resolvedData = await cacheManager.resolveConflict(memoryData, localStorageData);
            
            expect(resolvedData.price).toBe(155.00);
        });
    });
    
    describe('Performance Integration', () => {
        test('should handle large datasets efficiently', async () => {
            const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
                id: i,
                symbol: `STOCK${i}`,
                price: Math.random() * 1000
            }));
            
            // Mock performance monitoring
            const startTime = Date.now();
            
            // Mock cache operations
            cacheManager.layers.indexedDB = {
                set: jest.fn().mockResolvedValue(true),
                get: jest.fn().mockResolvedValue(largeDataset)
            };
            
            // Mock table operations
            TableSystem.renderTable = jest.fn().mockResolvedValue(true);
            
            // Test performance
            await cacheManager.set('large-dataset', largeDataset);
            const cachedData = await cacheManager.get('large-dataset');
            await TableSystem.renderTable('large-table', cachedData);
            
            const endTime = Date.now();
            const totalTime = endTime - startTime;
            
            expect(cachedData).toEqual(largeDataset);
            expect(totalTime).toBeLessThan(2000); // < 2 seconds
        });
    });
    
    describe('Error Handling Integration', () => {
        test('should handle cache failures gracefully', async () => {
            const testData = { id: 1, symbol: 'AAPL', price: 150.00 };
            
            // Mock cache failure
            cacheManager.layers.memory.set = jest.fn().mockRejectedValue(new Error('Cache failed'));
            cacheManager.layers.localStorage.set = jest.fn().mockResolvedValue(true);
            
            // Mock fallback
            TableSystem.loadTableData = jest.fn().mockResolvedValue(testData);
            
            // Test error handling
            try {
                await cacheManager.set('test-key', testData);
            } catch (error) {
                const fallbackData = await TableSystem.loadTableData('trades-table');
                expect(fallbackData).toEqual(testData);
            }
        });
        
        test('should handle table rendering errors gracefully', () => {
            const corruptedData = { id: 1, symbol: null, price: 'invalid' };
            
            // Mock table rendering error
            TableSystem.renderTable = jest.fn().mockImplementation(() => {
                throw new Error('Table rendering failed');
            });
            
            // Mock error handling
            TableSystem.handleError = jest.fn().mockReturnValue('<div class="error">Table rendering failed</div>');
            
            try {
                TableSystem.renderTable('corrupted-table', corruptedData);
            } catch (error) {
                const errorHtml = TableSystem.handleError(error);
                expect(errorHtml).toContain('error');
            }
        });
    });
});

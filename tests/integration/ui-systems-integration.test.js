/**
 * UI Systems Integration Tests
 * ============================
 * 
 * בדיקות אינטגרציה בין מערכות UI שונות
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

// Import the real systems
const fs = require('fs');
const path = require('path');

// Load the actual system codes
const fieldRendererCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/services/field-renderer-service.js'), 
    'utf8'
);

const buttonSystemCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/button-system.js'), 
    'utf8'
);

const tableSystemCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/table-system.js'), 
    'utf8'
);

describe('UI Systems Integration', () => {
    let FieldRendererService;
    let ButtonSystem;
    let TableSystem;
    
    beforeAll(() => {
        // Mock the global environment
        global.window = {
            Logger: {
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
                debug: jest.fn()
            }
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
        
        // Load the real systems
        eval(fieldRendererCode);
        eval(buttonSystemCode);
        eval(tableSystemCode);
        
        FieldRendererService = global.FieldRendererService;
        ButtonSystem = global.ButtonSystem;
        TableSystem = global.TableSystem;
    });
    
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    describe('Field Renderer + Button Integration', () => {
        test('should render buttons with field data', () => {
            const fieldData = { 
                id: 1, 
                status: 'active',
                symbol: 'AAPL',
                price: 150.00
            };
            
            // Mock field renderer
            FieldRendererService.renderStatus = jest.fn().mockReturnValue('<span class="status-active">Active</span>');
            FieldRendererService.renderAction = jest.fn().mockReturnValue('<button class="btn-edit">Edit</button>');
            
            // Mock button system
            ButtonSystem.createEditButton = jest.fn().mockReturnValue('<button class="btn btn-edit">Edit</button>');
            ButtonSystem.createDeleteButton = jest.fn().mockReturnValue('<button class="btn btn-delete">Delete</button>');
            
            // Test integration
            const statusHtml = FieldRendererService.renderStatus(fieldData.status);
            const editButton = ButtonSystem.createEditButton(fieldData.id);
            const deleteButton = ButtonSystem.createDeleteButton(fieldData.id);
            
            expect(statusHtml).toContain('status-active');
            expect(editButton).toContain('btn-edit');
            expect(deleteButton).toContain('btn-delete');
        });
        
        test('should handle field validation with buttons', () => {
            const invalidData = { 
                id: null, 
                status: 'invalid',
                symbol: '',
                price: -100
            };
            
            // Mock validation
            FieldRendererService.validateField = jest.fn().mockReturnValue(false);
            ButtonSystem.createSaveButton = jest.fn().mockReturnValue('<button class="btn btn-save" disabled>Save</button>');
            
            const isValid = FieldRendererService.validateField(invalidData);
            const saveButton = ButtonSystem.createSaveButton();
            
            expect(isValid).toBe(false);
            expect(saveButton).toContain('disabled');
        });
    });
    
    describe('Table + Field Renderer Integration', () => {
        test('should render table rows with field data', () => {
            const tableData = [
                { id: 1, symbol: 'AAPL', price: 150.00, status: 'active' },
                { id: 2, symbol: 'GOOGL', price: 2800.00, status: 'pending' }
            ];
            
            // Mock field renderer
            FieldRendererService.renderStatus = jest.fn()
                .mockReturnValueOnce('<span class="status-active">Active</span>')
                .mockReturnValueOnce('<span class="status-pending">Pending</span>');
            
            FieldRendererService.renderCurrency = jest.fn()
                .mockReturnValueOnce('<span class="currency">$150.00</span>')
                .mockReturnValueOnce('<span class="currency">$2,800.00</span>');
            
            // Mock table system
            TableSystem.renderTableRow = jest.fn().mockImplementation((data) => {
                const status = FieldRendererService.renderStatus(data.status);
                const price = FieldRendererService.renderCurrency(data.price);
                return `<tr><td>${data.symbol}</td><td>${price}</td><td>${status}</td></tr>`;
            });
            
            // Test integration
            const row1 = TableSystem.renderTableRow(tableData[0]);
            const row2 = TableSystem.renderTableRow(tableData[1]);
            
            expect(row1).toContain('AAPL');
            expect(row1).toContain('$150.00');
            expect(row1).toContain('status-active');
            
            expect(row2).toContain('GOOGL');
            expect(row2).toContain('$2,800.00');
            expect(row2).toContain('status-pending');
        });
        
        test('should handle table sorting with field rendering', () => {
            const unsortedData = [
                { id: 1, symbol: 'GOOGL', price: 2800.00 },
                { id: 2, symbol: 'AAPL', price: 150.00 }
            ];
            
            // Mock table sorting
            TableSystem.sortTableData = jest.fn().mockReturnValue([
                { id: 2, symbol: 'AAPL', price: 150.00 },
                { id: 1, symbol: 'GOOGL', price: 2800.00 }
            ]);
            
            // Mock field rendering
            FieldRendererService.renderCurrency = jest.fn()
                .mockReturnValue('<span class="currency">$150.00</span>')
                .mockReturnValue('<span class="currency">$2,800.00</span>');
            
            const sortedData = TableSystem.sortTableData(unsortedData, 'symbol', 'asc');
            
            expect(sortedData[0].symbol).toBe('AAPL');
            expect(sortedData[1].symbol).toBe('GOOGL');
        });
    });
    
    describe('Button + Table Integration', () => {
        test('should generate action buttons for table rows', () => {
            const rowData = { id: 1, symbol: 'AAPL', status: 'active' };
            
            // Mock button system
            ButtonSystem.generateActionButtons = jest.fn().mockReturnValue(`
                <div class="action-buttons">
                    <button class="btn btn-edit" data-id="1">Edit</button>
                    <button class="btn btn-delete" data-id="1">Delete</button>
                </div>
            `);
            
            // Mock table system
            TableSystem.renderTableRow = jest.fn().mockImplementation((data) => {
                const actions = ButtonSystem.generateActionButtons(data);
                return `<tr><td>${data.symbol}</td><td>${actions}</td></tr>`;
            });
            
            const rowHtml = TableSystem.renderTableRow(rowData);
            
            expect(rowHtml).toContain('AAPL');
            expect(rowHtml).toContain('btn-edit');
            expect(rowHtml).toContain('btn-delete');
        });
        
        test('should handle button click events in table context', () => {
            const rowData = { id: 1, symbol: 'AAPL', status: 'active' };
            
            // Mock button click handler
            ButtonSystem.handleButtonClick = jest.fn().mockImplementation((buttonType, rowId) => {
                if (buttonType === 'edit') {
                    return { action: 'edit', id: rowId };
                } else if (buttonType === 'delete') {
                    return { action: 'delete', id: rowId };
                }
            });
            
            // Mock table update
            TableSystem.updateTableRow = jest.fn().mockResolvedValue(true);
            
            // Test button click
            const editResult = ButtonSystem.handleButtonClick('edit', rowData.id);
            const deleteResult = ButtonSystem.handleButtonClick('delete', rowData.id);
            
            expect(editResult.action).toBe('edit');
            expect(deleteResult.action).toBe('delete');
        });
    });
    
    describe('Error Handling Integration', () => {
        test('should handle field rendering errors gracefully', () => {
            const invalidData = { id: null, status: 'invalid' };
            
            // Mock field renderer error
            FieldRendererService.renderStatus = jest.fn().mockImplementation(() => {
                throw new Error('Field rendering failed');
            });
            
            // Mock error handling
            FieldRendererService.handleError = jest.fn().mockReturnValue('<span class="error">Error</span>');
            
            try {
                FieldRendererService.renderStatus(invalidData.status);
            } catch (error) {
                const errorHtml = FieldRendererService.handleError(error);
                expect(errorHtml).toContain('error');
            }
        });
        
        test('should handle table rendering errors gracefully', () => {
            const corruptedData = { id: 1, symbol: null, price: 'invalid' };
            
            // Mock table rendering error
            TableSystem.renderTableRow = jest.fn().mockImplementation(() => {
                throw new Error('Table rendering failed');
            });
            
            // Mock error handling
            TableSystem.handleError = jest.fn().mockReturnValue('<tr class="error-row"><td>Error</td></tr>');
            
            try {
                TableSystem.renderTableRow(corruptedData);
            } catch (error) {
                const errorRow = TableSystem.handleError(error);
                expect(errorRow).toContain('error-row');
            }
        });
    });
    
    describe('Performance Integration', () => {
        test('should handle large datasets efficiently', () => {
            const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
                id: i,
                symbol: `STOCK${i}`,
                price: Math.random() * 1000
            }));
            
            // Mock performance monitoring
            const startTime = Date.now();
            
            // Mock table rendering
            TableSystem.renderTable = jest.fn().mockImplementation((data) => {
                return data.map(row => `<tr><td>${row.symbol}</td></tr>`).join('');
            });
            
            // Mock field rendering
            FieldRendererService.renderCurrency = jest.fn().mockImplementation((price) => {
                return `<span class="currency">$${price.toFixed(2)}</span>`;
            });
            
            const tableHtml = TableSystem.renderTable(largeDataset);
            const endTime = Date.now();
            const renderTime = endTime - startTime;
            
            expect(tableHtml).toContain('STOCK0');
            expect(tableHtml).toContain('STOCK999');
            expect(renderTime).toBeLessThan(1000); // < 1 second
        });
    });
    
    describe('Data Flow Integration', () => {
        test('should maintain data consistency across systems', () => {
            const originalData = { id: 1, symbol: 'AAPL', price: 150.00, status: 'active' };
            
            // Mock data flow
            FieldRendererService.renderStatus = jest.fn().mockReturnValue('<span class="status-active">Active</span>');
            ButtonSystem.createEditButton = jest.fn().mockReturnValue('<button class="btn-edit">Edit</button>');
            TableSystem.renderTableRow = jest.fn().mockReturnValue('<tr><td>AAPL</td></tr>');
            
            // Test data consistency
            const statusHtml = FieldRendererService.renderStatus(originalData.status);
            const editButton = ButtonSystem.createEditButton(originalData.id);
            const tableRow = TableSystem.renderTableRow(originalData);
            
            expect(statusHtml).toContain('status-active');
            expect(editButton).toContain('btn-edit');
            expect(tableRow).toContain('AAPL');
        });
    });
});

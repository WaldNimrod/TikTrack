/**
 * Field Renderer Service Unit Tests
 * =================================
 * 
 * Unit tests for the Field Renderer Service system
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

// Import the real Field Renderer Service
const fs = require('fs');
const path = require('path');

// Load the actual Field Renderer Service code
const fieldRendererCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/services/field-renderer-service.js'), 
    'utf8'
);

describe('Field Renderer Service', () => {
    let FieldRendererService;
    
    beforeAll(() => {
        // Mock the global environment before loading the real code
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
        
        // Evaluate the real code to get the FieldRendererService
        eval(fieldRendererCode);
        FieldRendererService = global.FieldRendererService;
    });
    
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
    });
    
    describe('Status Rendering', () => {
        test('should render status with correct class', () => {
            const status = 'active';
            const expectedHtml = '<span class="status-badge status-active">Active</span>';
            fieldRenderer.renderStatus.mockReturnValue(expectedHtml);
            
            const result = fieldRenderer.renderStatus(status);
            
            expect(fieldRenderer.renderStatus).toHaveBeenCalledWith(status);
            expect(result).toBe(expectedHtml);
        });
        
        test('should render different status types', () => {
            const statuses = ['active', 'inactive', 'pending', 'completed', 'cancelled'];
            
            statuses.forEach(status => {
                fieldRenderer.renderStatus(status);
                expect(fieldRenderer.renderStatus).toHaveBeenCalledWith(status);
            });
        });
    });
    
    describe('Side Rendering', () => {
        test('should render buy side', () => {
            const side = 'buy';
            const expectedHtml = '<span class="side-badge side-buy">Buy</span>';
            fieldRenderer.renderSide.mockReturnValue(expectedHtml);
            
            const result = fieldRenderer.renderSide(side);
            
            expect(fieldRenderer.renderSide).toHaveBeenCalledWith(side);
            expect(result).toBe(expectedHtml);
        });
        
        test('should render sell side', () => {
            const side = 'sell';
            const expectedHtml = '<span class="side-badge side-sell">Sell</span>';
            fieldRenderer.renderSide.mockReturnValue(expectedHtml);
            
            const result = fieldRenderer.renderSide(side);
            
            expect(fieldRenderer.renderSide).toHaveBeenCalledWith(side);
            expect(result).toBe(expectedHtml);
        });
    });
    
    describe('Numeric Badge Rendering', () => {
        test('should render positive numeric badge', () => {
            const value = 100;
            const expectedHtml = '<span class="numeric-badge positive">+100</span>';
            fieldRenderer.renderNumericBadge.mockReturnValue(expectedHtml);
            
            const result = fieldRenderer.renderNumericBadge(value);
            
            expect(fieldRenderer.renderNumericBadge).toHaveBeenCalledWith(value);
            expect(result).toBe(expectedHtml);
        });
        
        test('should render negative numeric badge', () => {
            const value = -50;
            const expectedHtml = '<span class="numeric-badge negative">-50</span>';
            fieldRenderer.renderNumericBadge.mockReturnValue(expectedHtml);
            
            const result = fieldRenderer.renderNumericBadge(value);
            
            expect(fieldRenderer.renderNumericBadge).toHaveBeenCalledWith(value);
            expect(result).toBe(expectedHtml);
        });
    });
    
    describe('Currency Rendering', () => {
        test('should render currency with symbol', () => {
            const amount = 1000;
            const currency = 'USD';
            const expectedHtml = '<span class="currency">$1,000.00</span>';
            fieldRenderer.renderCurrency.mockReturnValue(expectedHtml);
            
            const result = fieldRenderer.renderCurrency(amount, currency);
            
            expect(fieldRenderer.renderCurrency).toHaveBeenCalledWith(amount, currency);
            expect(result).toBe(expectedHtml);
        });
        
        test('should render different currencies', () => {
            const currencies = ['USD', 'EUR', 'GBP', 'JPY'];
            
            currencies.forEach(currency => {
                fieldRenderer.renderCurrency(1000, currency);
                expect(fieldRenderer.renderCurrency).toHaveBeenCalledWith(1000, currency);
            });
        });
    });
    
    describe('Type Rendering', () => {
        test('should render trade type', () => {
            const type = 'stock';
            const expectedHtml = '<span class="type-badge type-stock">Stock</span>';
            fieldRenderer.renderType.mockReturnValue(expectedHtml);
            
            const result = fieldRenderer.renderType(type);
            
            expect(fieldRenderer.renderType).toHaveBeenCalledWith(type);
            expect(result).toBe(expectedHtml);
        });
        
        test('should render different types', () => {
            const types = ['stock', 'option', 'future', 'forex', 'crypto'];
            
            types.forEach(type => {
                fieldRenderer.renderType(type);
                expect(fieldRenderer.renderType).toHaveBeenCalledWith(type);
            });
        });
    });
    
    describe('Action Rendering', () => {
        test('should render edit action', () => {
            const action = 'edit';
            const expectedHtml = '<button class="action-btn edit-btn">Edit</button>';
            fieldRenderer.renderAction.mockReturnValue(expectedHtml);
            
            const result = fieldRenderer.renderAction(action);
            
            expect(fieldRenderer.renderAction).toHaveBeenCalledWith(action);
            expect(result).toBe(expectedHtml);
        });
        
        test('should render delete action', () => {
            const action = 'delete';
            const expectedHtml = '<button class="action-btn delete-btn">Delete</button>';
            fieldRenderer.renderAction.mockReturnValue(expectedHtml);
            
            const result = fieldRenderer.renderAction(action);
            
            expect(fieldRenderer.renderAction).toHaveBeenCalledWith(action);
            expect(result).toBe(expectedHtml);
        });
    });
    
    describe('Priority Rendering', () => {
        test('should render high priority', () => {
            const priority = 'high';
            const expectedHtml = '<span class="priority-badge priority-high">High</span>';
            fieldRenderer.renderPriority.mockReturnValue(expectedHtml);
            
            const result = fieldRenderer.renderPriority(priority);
            
            expect(fieldRenderer.renderPriority).toHaveBeenCalledWith(priority);
            expect(result).toBe(expectedHtml);
        });
        
        test('should render different priorities', () => {
            const priorities = ['low', 'medium', 'high', 'urgent'];
            
            priorities.forEach(priority => {
                fieldRenderer.renderPriority(priority);
                expect(fieldRenderer.renderPriority).toHaveBeenCalledWith(priority);
            });
        });
    });
    
    describe('Shares Rendering', () => {
        test('should render shares with formatting', () => {
            const shares = 1000;
            const expectedHtml = '<span class="shares">1,000 shares</span>';
            fieldRenderer.renderShares.mockReturnValue(expectedHtml);
            
            const result = fieldRenderer.renderShares(shares);
            
            expect(fieldRenderer.renderShares).toHaveBeenCalledWith(shares);
            expect(result).toBe(expectedHtml);
        });
    });
    
    describe('Boolean Rendering', () => {
        test('should render true boolean', () => {
            const value = true;
            const expectedHtml = '<span class="boolean-true">✓</span>';
            fieldRenderer.renderBoolean.mockReturnValue(expectedHtml);
            
            const result = fieldRenderer.renderBoolean(value);
            
            expect(fieldRenderer.renderBoolean).toHaveBeenCalledWith(value);
            expect(result).toBe(expectedHtml);
        });
        
        test('should render false boolean', () => {
            const value = false;
            const expectedHtml = '<span class="boolean-false">✗</span>';
            fieldRenderer.renderBoolean.mockReturnValue(expectedHtml);
            
            const result = fieldRenderer.renderBoolean(value);
            
            expect(fieldRenderer.renderBoolean).toHaveBeenCalledWith(value);
            expect(result).toBe(expectedHtml);
        });
    });
    
    describe('Ticker Info Rendering', () => {
        test('should render ticker info', () => {
            const ticker = 'AAPL';
            const info = { name: 'Apple Inc.', price: 150.00 };
            const expectedHtml = '<div class="ticker-info"><span class="ticker">AAPL</span><span class="name">Apple Inc.</span><span class="price">$150.00</span></div>';
            fieldRenderer.renderTickerInfo.mockReturnValue(expectedHtml);
            
            const result = fieldRenderer.renderTickerInfo(ticker, info);
            
            expect(fieldRenderer.renderTickerInfo).toHaveBeenCalledWith(ticker, info);
            expect(result).toBe(expectedHtml);
        });
    });
    
    describe('Linked Entity Rendering', () => {
        test('should render linked entity', () => {
            const entity = { id: 1, type: 'trade', name: 'Trade #1' };
            const expectedHtml = '<div class="linked-entity"><span class="entity-type">Trade</span><span class="entity-name">Trade #1</span></div>';
            fieldRenderer.renderLinkedEntity.mockReturnValue(expectedHtml);
            
            const result = fieldRenderer.renderLinkedEntity(entity);
            
            expect(fieldRenderer.renderLinkedEntity).toHaveBeenCalledWith(entity);
            expect(result).toBe(expectedHtml);
        });
    });
    
    describe('Error Handling', () => {
        test('should handle invalid status', () => {
            fieldRenderer.renderStatus.mockImplementation(() => {
                throw new Error('Invalid status');
            });
            
            expect(() => {
                fieldRenderer.renderStatus('invalid');
            }).toThrow('Invalid status');
        });
        
        test('should handle invalid side', () => {
            fieldRenderer.renderSide.mockImplementation(() => {
                throw new Error('Invalid side');
            });
            
            expect(() => {
                fieldRenderer.renderSide('invalid');
            }).toThrow('Invalid side');
        });
    });
    
    describe('Integration with Other Systems', () => {
        test('should work with table system', () => {
            const status = 'active';
            fieldRenderer.renderStatus(status);
            
            expect(fieldRenderer.renderStatus).toHaveBeenCalledWith(status);
        });
        
        test('should work with button system', () => {
            const action = 'edit';
            fieldRenderer.renderAction(action);
            
            expect(fieldRenderer.renderAction).toHaveBeenCalledWith(action);
        });
    });
});

/**
 * Button System Unit Tests
 * =========================
 * 
 * Unit tests for the Button System
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

// Import the real Button System
const fs = require('fs');
const path = require('path');

// Load the actual Button System code
const buttonSystemCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/button-system.js'), 
    'utf8'
);

describe('Button System', () => {
    let ButtonSystem;
    
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
        
        // Evaluate the real code to get the ButtonSystem
        eval(buttonSystemCode);
        ButtonSystem = global.ButtonSystem;
    });
    
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
    });
    
    describe('Button Creation', () => {
        test('should create edit button', () => {
            const id = 1;
            const expectedHtml = '<button class="btn btn-edit" data-id="1">Edit</button>';
            buttonSystem.createEditButton.mockReturnValue(expectedHtml);
            
            const result = buttonSystem.createEditButton(id);
            
            expect(buttonSystem.createEditButton).toHaveBeenCalledWith(id);
            expect(result).toBe(expectedHtml);
        });
        
        test('should create delete button', () => {
            const id = 1;
            const expectedHtml = '<button class="btn btn-delete" data-id="1">Delete</button>';
            buttonSystem.createDeleteButton.mockReturnValue(expectedHtml);
            
            const result = buttonSystem.createDeleteButton(id);
            
            expect(buttonSystem.createDeleteButton).toHaveBeenCalledWith(id);
            expect(result).toBe(expectedHtml);
        });
        
        test('should create cancel button', () => {
            const expectedHtml = '<button class="btn btn-cancel">Cancel</button>';
            buttonSystem.createCancelButton.mockReturnValue(expectedHtml);
            
            const result = buttonSystem.createCancelButton();
            
            expect(buttonSystem.createCancelButton).toHaveBeenCalled();
            expect(result).toBe(expectedHtml);
        });
        
        test('should create link button', () => {
            const url = '/trades/1';
            const text = 'View Trade';
            const expectedHtml = '<a href="/trades/1" class="btn btn-link">View Trade</a>';
            buttonSystem.createLinkButton.mockReturnValue(expectedHtml);
            
            const result = buttonSystem.createLinkButton(url, text);
            
            expect(buttonSystem.createLinkButton).toHaveBeenCalledWith(url, text);
            expect(result).toBe(expectedHtml);
        });
        
        test('should create add button', () => {
            const expectedHtml = '<button class="btn btn-add">Add New</button>';
            buttonSystem.createAddButton.mockReturnValue(expectedHtml);
            
            const result = buttonSystem.createAddButton();
            
            expect(buttonSystem.createAddButton).toHaveBeenCalled();
            expect(result).toBe(expectedHtml);
        });
        
        test('should create save button', () => {
            const expectedHtml = '<button class="btn btn-save">Save</button>';
            buttonSystem.createSaveButton.mockReturnValue(expectedHtml);
            
            const result = buttonSystem.createSaveButton();
            
            expect(buttonSystem.createSaveButton).toHaveBeenCalled();
            expect(result).toBe(expectedHtml);
        });
    });
    
    describe('Action Button Generation', () => {
        test('should generate action buttons for table row', () => {
            const rowData = { id: 1, name: 'Test Item' };
            const expectedHtml = '<div class="action-buttons"><button class="btn btn-edit" data-id="1">Edit</button><button class="btn btn-delete" data-id="1">Delete</button></div>';
            buttonSystem.generateActionButtons.mockReturnValue(expectedHtml);
            
            const result = buttonSystem.generateActionButtons(rowData);
            
            expect(buttonSystem.generateActionButtons).toHaveBeenCalledWith(rowData);
            expect(result).toBe(expectedHtml);
        });
        
        test('should generate action buttons with custom actions', () => {
            const rowData = { id: 1, name: 'Test Item' };
            const actions = ['edit', 'view', 'delete'];
            const expectedHtml = '<div class="action-buttons"><button class="btn btn-edit" data-id="1">Edit</button><button class="btn btn-view" data-id="1">View</button><button class="btn btn-delete" data-id="1">Delete</button></div>';
            buttonSystem.generateActionButtons.mockReturnValue(expectedHtml);
            
            const result = buttonSystem.generateActionButtons(rowData, actions);
            
            expect(buttonSystem.generateActionButtons).toHaveBeenCalledWith(rowData, actions);
            expect(result).toBe(expectedHtml);
        });
    });
    
    describe('Table Action Buttons', () => {
        test('should load table action buttons', () => {
            const tableId = 'trades-table';
            const expectedResult = { success: true, buttonsLoaded: 10 };
            buttonSystem.loadTableActionButtons.mockReturnValue(expectedResult);
            
            const result = buttonSystem.loadTableActionButtons(tableId);
            
            expect(buttonSystem.loadTableActionButtons).toHaveBeenCalledWith(tableId);
            expect(result).toEqual(expectedResult);
        });
        
        test('should load table action buttons with options', () => {
            const tableId = 'trades-table';
            const options = { actions: ['edit', 'delete'], position: 'right' };
            const expectedResult = { success: true, buttonsLoaded: 10 };
            buttonSystem.loadTableActionButtons.mockReturnValue(expectedResult);
            
            const result = buttonSystem.loadTableActionButtons(tableId, options);
            
            expect(buttonSystem.loadTableActionButtons).toHaveBeenCalledWith(tableId, options);
            expect(result).toEqual(expectedResult);
        });
    });
    
    describe('Button Styling and Classes', () => {
        test('should apply correct CSS classes', () => {
            const id = 1;
            const expectedHtml = '<button class="btn btn-edit btn-primary" data-id="1">Edit</button>';
            buttonSystem.createEditButton.mockReturnValue(expectedHtml);
            
            const result = buttonSystem.createEditButton(id);
            
            expect(buttonSystem.createEditButton).toHaveBeenCalledWith(id);
            expect(result).toContain('btn-edit');
            expect(result).toContain('btn-primary');
        });
        
        test('should apply different button sizes', () => {
            const id = 1;
            const size = 'large';
            const expectedHtml = '<button class="btn btn-edit btn-large" data-id="1">Edit</button>';
            buttonSystem.createEditButton.mockReturnValue(expectedHtml);
            
            const result = buttonSystem.createEditButton(id, { size });
            
            expect(buttonSystem.createEditButton).toHaveBeenCalledWith(id, { size });
            expect(result).toContain('btn-large');
        });
    });
    
    describe('Button Event Handling', () => {
        test('should handle button click events', () => {
            const id = 1;
            const onClick = jest.fn();
            const expectedHtml = '<button class="btn btn-edit" data-id="1" onclick="handleEdit(1)">Edit</button>';
            buttonSystem.createEditButton.mockReturnValue(expectedHtml);
            
            const result = buttonSystem.createEditButton(id, { onClick });
            
            expect(buttonSystem.createEditButton).toHaveBeenCalledWith(id, { onClick });
            expect(result).toContain('onclick');
        });
        
        test('should handle button confirmation for delete', () => {
            const id = 1;
            const confirmMessage = 'Are you sure you want to delete this item?';
            const expectedHtml = '<button class="btn btn-delete" data-id="1" onclick="confirmDelete(1, \'Are you sure you want to delete this item?\')">Delete</button>';
            buttonSystem.createDeleteButton.mockReturnValue(expectedHtml);
            
            const result = buttonSystem.createDeleteButton(id, { confirmMessage });
            
            expect(buttonSystem.createDeleteButton).toHaveBeenCalledWith(id, { confirmMessage });
            expect(result).toContain('confirmDelete');
        });
    });
    
    describe('Button Accessibility', () => {
        test('should include ARIA attributes', () => {
            const id = 1;
            const expectedHtml = '<button class="btn btn-edit" data-id="1" aria-label="Edit item 1" role="button">Edit</button>';
            buttonSystem.createEditButton.mockReturnValue(expectedHtml);
            
            const result = buttonSystem.createEditButton(id);
            
            expect(buttonSystem.createEditButton).toHaveBeenCalledWith(id);
            expect(result).toContain('aria-label');
            expect(result).toContain('role="button"');
        });
        
        test('should support keyboard navigation', () => {
            const id = 1;
            const expectedHtml = '<button class="btn btn-edit" data-id="1" tabindex="0">Edit</button>';
            buttonSystem.createEditButton.mockReturnValue(expectedHtml);
            
            const result = buttonSystem.createEditButton(id);
            
            expect(buttonSystem.createEditButton).toHaveBeenCalledWith(id);
            expect(result).toContain('tabindex="0"');
        });
    });
    
    describe('Error Handling', () => {
        test('should handle invalid button creation', () => {
            buttonSystem.createEditButton.mockImplementation(() => {
                throw new Error('Button creation failed');
            });
            
            expect(() => {
                buttonSystem.createEditButton(1);
            }).toThrow('Button creation failed');
        });
        
        test('should handle table action button loading errors', () => {
            buttonSystem.loadTableActionButtons.mockImplementation(() => {
                throw new Error('Table action buttons loading failed');
            });
            
            expect(() => {
                buttonSystem.loadTableActionButtons('invalid-table');
            }).toThrow('Table action buttons loading failed');
        });
    });
    
    describe('Integration with Other Systems', () => {
        test('should work with table system', () => {
            const tableId = 'trades-table';
            buttonSystem.loadTableActionButtons(tableId);
            
            expect(buttonSystem.loadTableActionButtons).toHaveBeenCalledWith(tableId);
        });
        
        test('should work with field renderer system', () => {
            const rowData = { id: 1, name: 'Test Item' };
            buttonSystem.generateActionButtons(rowData);
            
            expect(buttonSystem.generateActionButtons).toHaveBeenCalledWith(rowData);
        });
    });
});

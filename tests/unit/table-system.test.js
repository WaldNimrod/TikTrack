/**
 * Unified Table System Unit Tests
 * ===============================
 *
 * Tests for the unified table management system.
 */

const fs = require('fs');
const path = require('path');

const unifiedTableSystemCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/unified-table-system.js'),
    'utf8'
);

describe('Unified Table System', () => {
    let UnifiedTableSystem;
    let updateFn;
    let tableConfig;

    beforeAll(() => {
        const storage = {};

        global.localStorage = {
            setItem: (key, value) => {
                storage[key] = String(value);
            },
            getItem: (key) => {
                return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null;
            },
            removeItem: (key) => {
                delete storage[key];
            },
            clear: () => {
                Object.keys(storage).forEach((key) => delete storage[key]);
            }
        };

        global.console = {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            info: jest.fn(),
            trace: jest.fn()
        };

        global.window = {
            Logger: {
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
                debug: jest.fn()
            },
            filterSystem: {
                applyFilter: jest.fn(),
                clearFilters: jest.fn()
            },
            getSortState: jest.fn().mockReturnValue({ columnIndex: -1, direction: 'asc' }),
            saveSortState: jest.fn(),
            sortTableData: jest.fn((columnIndex, data, tableType, updateFunction) => {
                const sorted = [...data].sort((a, b) => {
                    const valueA = Object.values(a)[columnIndex];
                    const valueB = Object.values(b)[columnIndex];
                    if (valueA < valueB) return -1;
                    if (valueA > valueB) return 1;
                    return 0;
                });

                if (typeof updateFunction === 'function') {
                    updateFunction(sorted);
                }

                return sorted;
            })
        };

        global.document = {
            querySelectorAll: jest.fn().mockReturnValue([]),
            querySelector: jest.fn(),
            addEventListener: jest.fn()
        };

        eval(unifiedTableSystemCode);
        UnifiedTableSystem = window.UnifiedTableSystem;
    });

    beforeEach(() => {
        jest.clearAllMocks();

        window.filterSystem = {
            applyFilter: jest.fn(),
            clearFilters: jest.fn()
        };

        window.sortTableData = jest.fn((columnIndex, data, tableType, updateFunction) => {
            const sorted = [...data].sort((a, b) => {
                const valueA = Object.values(a)[columnIndex];
                const valueB = Object.values(b)[columnIndex];
                if (valueA < valueB) return -1;
                if (valueA > valueB) return 1;
                return 0;
            });

            if (typeof updateFunction === 'function') {
                updateFunction(sorted);
            }

            return sorted;
        });

        updateFn = jest.fn();
        tableConfig = {
            dataGetter: jest.fn(() => [
                { id: 1, name: 'Charlie', age: 30 },
                { id: 2, name: 'Alice', age: 25 },
                { id: 3, name: 'Bob', age: 35 }
            ]),
            updateFunction: updateFn,
            tableSelector: '#test-table',
            columns: ['id', 'name', 'age']
        };

        UnifiedTableSystem.registry.clear();
        UnifiedTableSystem.registry.register('test_table', tableConfig);
        window._sortTableDataInProgress = false;
    });

    test('registry stores configuration', () => {
        const config = UnifiedTableSystem.registry.getConfig('test_table');
        expect(config).toBeDefined();
        expect(config.updateFunction).toBe(updateFn);
    });

    test('sorter.sort delegates to window.sortTableData and calls update function', () => {
        const result = UnifiedTableSystem.sorter.sort('test_table', 1);

        expect(window.sortTableData).toHaveBeenCalledWith(
            1,
            expect.any(Array),
            'test_table',
            expect.any(Function)
        );

        expect(updateFn).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({ name: 'Alice' })
        ]));

        expect(result).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'Alice' })
        ]));
    });

    test('filter.apply delegates to global filterSystem', () => {
        UnifiedTableSystem.filter.apply('test_table', 'status', 'open');
        expect(window.filterSystem.applyFilter).toHaveBeenCalledWith('status', 'open');
    });

    test('filter.clear delegates to global filterSystem', () => {
        UnifiedTableSystem.filter.clear('test_table');
        expect(window.filterSystem.clearFilters).toHaveBeenCalled();
    });

    test('renderTable uses renderer to update table', () => {
        const data = [{ id: 99, name: 'Delta', age: 28 }];
        window.renderTable('test_table', data);

        expect(updateFn).toHaveBeenCalledWith(data, expect.any(Object));
    });

    test('updateTable uses renderer update', () => {
        const data = [{ id: 5, name: 'Echo', age: 31 }];
        window.updateTable('test_table', data);

        expect(updateFn).toHaveBeenCalledWith(data, expect.any(Object));
    });

    test('state manager saves and loads table state from localStorage', () => {
        const state = { page: 2, sort: { columnIndex: 1, direction: 'desc' } };
        UnifiedTableSystem.state.save('test_table', state);

        const loaded = UnifiedTableSystem.state.load('test_table');
        expect(loaded).toEqual(state);
    });
});

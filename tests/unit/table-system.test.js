/**
 * Unified Table System Unit Tests
 * ===============================
 *
 * Tests for the unified table management system.
 */

const fs = require('fs');
const path = require('path');

const tableDataRegistryCode = fs.readFileSync(
  path.join(__dirname, '../../trading-ui/scripts/table-data-registry.js'),
  'utf8'
);

const unifiedTableSystemCode = fs.readFileSync(
  path.join(__dirname, '../../trading-ui/scripts/unified-table-system.js'),
  'utf8'
);

describe('Unified Table System', () => {
    let UnifiedTableSystem;
    let updateFn;
    let tableConfig;
    let cachedState;

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

        cachedState = null;

        global.window = {
            Logger: {
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
                debug: jest.fn()
            },
            TABLE_COLUMN_MAPPINGS: {
                linked_items: ['type', 'related_type'],
            },
            UnifiedCacheManager: {
                save: jest.fn((key, value) => {
                    cachedState = value;
                    return Promise.resolve();
                }),
                get: jest.fn(() => Promise.resolve(cachedState)),
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

        eval(tableDataRegistryCode);
        eval(unifiedTableSystemCode);
        UnifiedTableSystem = window.UnifiedTableSystem;
    });

    beforeEach(() => {
        jest.clearAllMocks();

        cachedState = null;

        window.UnifiedCacheManager = {
            save: jest.fn((key, value) => {
                cachedState = value;
                return Promise.resolve();
            }),
            get: jest.fn(() => Promise.resolve(cachedState)),
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
        if (window.TableDataRegistry?.clearAll) {
            window.TableDataRegistry.clearAll();
        }
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
            expect.any(Function),
            expect.objectContaining({
                columnIndex: 1,
                tableType: 'test_table'
            })
        );

        expect(updateFn).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({ name: 'Alice' })
        ]));

        expect(result).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'Alice' })
        ]));
    });

    test('filter.apply filters data via TableDataRegistry context', () => {
        const sampleData = [
            { id: 1, status: 'open', name: 'Alpha' },
            { id: 2, status: 'closed', name: 'Beta' },
            { id: 3, status: 'open', name: 'Gamma' }
        ];
        tableConfig.dataGetter.mockReturnValue(sampleData);
        if (window.TableDataRegistry?.setFullData) {
            window.TableDataRegistry.setFullData('test_table', sampleData, { resetFiltered: false });
        }

        const result = UnifiedTableSystem.filter.apply('test_table', { status: ['open'] });

        expect(result).toHaveLength(2);
        expect(result.every(item => item.status === 'open')).toBe(true);

        const registryFiltered = window.TableDataRegistry?.getFilteredData
            ? window.TableDataRegistry.getFilteredData('test_table')
            : [];
        expect(registryFiltered).toHaveLength(2);
    });

    test('filter.apply merges with existing active filters when requested', () => {
        const sampleData = [
            { id: 1, status: 'open', type: 'investment', name: 'Alpha' },
            { id: 2, status: 'open', type: 'swing', name: 'Beta' },
            { id: 3, status: 'closed', type: 'investment', name: 'Gamma' }
        ];
        tableConfig.dataGetter.mockReturnValue(sampleData);
        if (window.TableDataRegistry?.setFullData) {
            window.TableDataRegistry.setFullData('test_table', sampleData, { resetFiltered: false });
            window.TableDataRegistry.setFilteredData('test_table', sampleData.filter(item => item.status === 'open'), {
                filterContext: {
                    status: ['open'],
                    type: [],
                    account: [],
                    search: '',
                    dateRange: null,
                    custom: {},
                },
            });
        }

        const result = UnifiedTableSystem.filter.apply(
            'test_table',
            { type: ['investment'] },
            undefined,
            { mergeWithActiveFilters: true }
        );

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({ id: 1 });

        const registryFiltered = window.TableDataRegistry?.getFilteredData
            ? window.TableDataRegistry.getFilteredData('test_table')
            : [];
        expect(registryFiltered).toHaveLength(1);
    });

    test('filter.apply supports relatedType custom filtering', () => {
        const linkedItemsData = [
            { id: 10, type: 'trade', related_type_id: 2 },
            { id: 11, type: 'trading_account', related_type_id: 1 },
            { id: 12, type: 'note', related_type_id: null },
        ];

        UnifiedTableSystem.registry.register('linked_items__test', {
            dataGetter: () => linkedItemsData,
            updateFunction: jest.fn(),
            tableSelector: '#linked-table',
            columns: ['type', 'related_type_id'],
            filterable: true,
            sortable: false,
        });

        if (window.TableDataRegistry?.setFullData) {
            window.TableDataRegistry.setFullData('linked_items__test', linkedItemsData, {
                tableId: 'linked-table',
                resetFiltered: true,
            });
        }

        const result = UnifiedTableSystem.filter.apply('linked_items__test', { custom: { relatedType: 'trade' } });

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({ type: 'trade' });

        const registryFiltered = window.TableDataRegistry?.getFilteredData
            ? window.TableDataRegistry.getFilteredData('linked_items__test')
            : [];
        expect(registryFiltered).toHaveLength(1);
        expect(registryFiltered[0]).toMatchObject({ type: 'trade' });
    });

    test('filter.clear resets filtered dataset', () => {
        const sampleData = [
            { id: 1, status: 'open', name: 'Alpha' },
            { id: 2, status: 'closed', name: 'Beta' }
        ];
        tableConfig.dataGetter.mockReturnValue(sampleData);
        if (window.TableDataRegistry?.setFullData) {
            window.TableDataRegistry.setFullData('test_table', sampleData, { resetFiltered: false });
            window.TableDataRegistry.setFilteredData('test_table', [sampleData[0]], { filterContext: { status: ['open'] } });
        }

        const cleared = UnifiedTableSystem.filter.clear('test_table');

        expect(cleared).toEqual(sampleData);
        const registryFiltered = window.TableDataRegistry?.getFilteredData
            ? window.TableDataRegistry.getFilteredData('test_table')
            : [];
        expect(registryFiltered).toEqual(sampleData);
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

    test('state manager saves and loads table state from localStorage', async () => {
        const state = { page: 2, sort: { columnIndex: 1, direction: 'desc' } };
        await UnifiedTableSystem.state.save('test_table', state);
        expect(window.UnifiedCacheManager).toBeDefined();
        expect(window.UnifiedCacheManager.save).toHaveBeenCalledTimes(1);
        expect(window.UnifiedCacheManager.save).toHaveBeenCalledWith(
            'tableState_test_table',
            state,
            expect.objectContaining({ layer: 'localStorage' })
        );

        expect(cachedState).toEqual(state);

        const loaded = await UnifiedTableSystem.state.load('test_table');
        expect(loaded).toEqual(state);
    });
});

/* eslint-disable no-undef */

describe('Unified table sorting system', () => {

  const bootstrapSortingModules = () => {
    jest.isolateModules(() => {
      global.window = {
        Logger: {
          warn: jest.fn(),
          info: jest.fn(),
          debug: jest.fn(),
          error: jest.fn(),
        },
        UnifiedCacheManager: {
          initialized: true,
          initialize: jest.fn(() => Promise.resolve(true)),
          save: jest.fn(() => Promise.resolve(true)),
          get: jest.fn(() => Promise.resolve(null)),
          remove: jest.fn(() => Promise.resolve(true)),
        },
        PageStateManager: {
          initialized: true,
          saveSort: jest.fn(() => Promise.resolve(true)),
          loadSort: jest.fn(() => Promise.resolve(null)),
        },
        getCurrentPageName: jest.fn(() => 'trades'),
      };

      require('../../trading-ui/scripts/services/table-sort-value-adapter.js');
      require('../../trading-ui/scripts/table-mappings.js');
      require('../../trading-ui/scripts/tables.js');

      window.PageStateManager = {
        initialized: true,
        saveSort: jest.fn(() => Promise.resolve(true)),
        loadSort: jest.fn(() => Promise.resolve(null)),
      };
    });
  };

  beforeEach(() => {
    jest.resetModules();
    bootstrapSortingModules();
  });

  test('default sort chain follows canonical (date, status, ticker)', () => {
    const chain = window.getDefaultSortChain('trades');
    expect(Array.isArray(chain)).toBe(true);
    expect(chain[0]).toMatchObject({ priority: 'date', direction: 'desc' });
    expect(chain[1]).toMatchObject({ priority: 'status', direction: 'asc' });
    expect(chain[2]).toMatchObject({ priority: 'ticker', direction: 'asc' });
  });

  test('compareTableRows sorts newest first when forcing direction', () => {
    const chain = window.getDefaultSortChain('trades');
    const primaryColumnIndex = chain[0].columnIndex;

    const rows = [
      {
        created_at: '2024-01-02T10:00:00Z',
        updated_at: '2024-01-02T10:00:00Z',
        status: 'open',
        ticker_symbol: 'AAA',
      },
      {
        created_at: '2024-01-03T09:00:00Z',
        updated_at: '2024-01-03T09:00:00Z',
        status: 'closed',
        ticker_symbol: 'BBB',
      },
      {
        created_at: '2024-01-01T15:00:00Z',
        updated_at: '2024-01-01T15:00:00Z',
        status: 'open',
        ticker_symbol: 'CCC',
      },
    ];

    const sorted = [...rows].sort(
      (a, b) => window.compareTableRows(a, b, 'trades', primaryColumnIndex, 'desc'),
    );

    expect(sorted[0].ticker_symbol).toBe('BBB'); // newest
    expect(sorted[sorted.length - 1].ticker_symbol).toBe('CCC'); // oldest
  });

  test('saveSortState persists chain to cache and PageStateManager', async () => {
    const chain = window.getDefaultSortChain('trades');
    const primary = chain[0];

    await window.saveSortState('trades', primary.columnIndex, primary.direction, { chain });

    expect(window.UnifiedCacheManager.save).toHaveBeenCalledWith(
      expect.stringContaining('sortState_trades'),
      expect.objectContaining({
        columnIndex: primary.columnIndex,
        direction: primary.direction,
        chain,
      }),
      expect.any(Object),
    );

    expect(window.PageStateManager.saveSort).toHaveBeenCalledWith(
      'trades',
      expect.objectContaining({
        tableType: 'trades',
        columnIndex: primary.columnIndex,
        direction: primary.direction,
        chain,
      }),
    );
  });
});


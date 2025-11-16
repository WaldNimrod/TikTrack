/* eslint-env jest */

describe('Preferences V4 - Cache invalidation on group save', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetModules();
    global.window = global.window || {};
    global.document = { readyState: 'complete', addEventListener: jest.fn() };
    global.window.Logger = { info: jest.fn(), error: jest.fn(), debug: jest.fn(), warn: jest.fn() };
    // Mock UnifiedCacheManager
    global.window.UnifiedCacheManager = {
      invalidateByDependency: jest.fn(),
    };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete global.window.PreferencesV4;
  });

  function mockFetchResponseOnce(body) {
    global.fetch = jest.fn(async () => ({
      status: 200,
      headers: new Map([['ETag', 'W/"etag"']]),
      json: async () => ({ success: true, data: body }),
    }));
  }

  test('saveGroup triggers UnifiedCacheManager.invalidateByDependency with group key', async () => {
    // Load the module under test
    require('../../trading-ui/scripts/services/preferences-v4.js');

    // Mock save response to include "changed" map
    mockFetchResponseOnce({ changed: { 'ui.page_size': { old: 25, new: 50 } } });

    await global.window.PreferencesV4.saveGroup('ui', { 'ui.page_size': 50 });
    expect(global.window.UnifiedCacheManager.invalidateByDependency).toHaveBeenCalledWith('preferences:ui');
  });
});



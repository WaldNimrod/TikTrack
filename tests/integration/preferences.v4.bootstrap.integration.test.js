/* eslint-env jest */

describe('Preferences V4 - Integration-like bootstrap flow', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetModules();
    global.window = global.window || {};
    global.document = { readyState: 'complete', addEventListener: jest.fn() };
    global.window.Logger = { info: jest.fn(), error: jest.fn(), debug: jest.fn(), warn: jest.fn() };
    global.window.addEventListener = global.window.addEventListener || jest.fn();
    global.window.dispatchEvent = global.window.dispatchEvent || jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete global.window.PreferencesV4;
  });

  function mockBootstrap(profileId, etag, groups = { ui: {}, colors: {}, trading: {} }) {
    global.fetch = jest.fn(async (url) => {
      // Simulate bootstrap endpoint
      if (String(url).includes('/api/preferences/bootstrap')) {
        return {
          status: 200,
          headers: new Map([['ETag', etag]]),
          json: async () => ({
            success: true,
            data: {
              profile_context: { user_id: 1, resolved_profile_id: profileId, versions: { last_update: '2025-01-01T00:00:00' } },
              groups,
              group_etags: {},
            },
          }),
        };
      }
      throw new Error('Unexpected URL in mock');
    });
  }

  test('bootstrap twice with different profile ids updates profileContext', async () => {
    require('../../trading-ui/scripts/services/preferences-v4.js');
    // First bootstrap
    mockBootstrap(0, 'W/"e1"');
    let result = await global.window.PreferencesV4.bootstrap(['ui', 'colors', 'trading']);
    expect(result.profileContext?.resolved_profile_id).toBe(0);
    // Second bootstrap with different profile id
    mockBootstrap(2, 'W/"e2"');
    result = await global.window.PreferencesV4.bootstrap(['ui', 'colors', 'trading'], 2);
    expect(result.profileContext?.resolved_profile_id).toBe(2);
  });
});



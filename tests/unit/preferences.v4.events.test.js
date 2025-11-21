/**
 * Preferences V4 - Events Flow Tests (Unit)
 */
/* eslint-env jest */

describe('PreferencesV4 Events (Unit)', () => {
  const originalFetch = global.fetch;
  let listeners = {};

  beforeEach(() => {
    jest.resetModules();
    global.window = global.window || {};
    global.document = {
      readyState: 'complete',
      addEventListener: jest.fn(),
    };
    listeners = {};
    global.window.addEventListener = (name, fn) => {
      listeners[name] = listeners[name] || [];
      listeners[name].push(fn);
    };
    global.window.dispatchEvent = (evt) => {
      const arr = listeners[evt.type] || [];
      for (const fn of arr) fn(evt);
    };
    global.window.Logger = { info: jest.fn(), error: jest.fn(), debug: jest.fn(), warn: jest.fn() };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete global.window.PreferencesV4;
  });

  function mockFetchSequence(handlers) {
    let call = 0;
    global.fetch = jest.fn(async () => {
      const handler = handlers[call] || handlers[handlers.length - 1];
      call += 1;
      return handler();
    });
  }

  test('bootstrap dispatches preferences:bootstrap:ready', async () => {
    const etag = 'W/\"abc\"';
    mockFetchSequence([
      async () => ({
        status: 200,
        headers: new Map([['ETag', etag]]),
        json: async () => ({
          success: true,
          data: {
            profile_context: { user_id: 1, resolved_profile_id: 0, versions: { last_update: '2025-01-01T00:00:00' } },
            groups: { ui: {}, colors: {}, trading: {} },
            group_etags: {},
          },
        }),
      }),
    ]);

    require('../../trading-ui/scripts/services/preferences-v4.js');

    let readyFired = false;
    global.window.addEventListener('preferences:bootstrap:ready', () => { readyFired = true; });
    await global.window.PreferencesV4.bootstrap(['ui', 'colors', 'trading']);
    expect(readyFired).toBe(true);
  });

  test('getGroup dispatches preferences:updated', async () => {
    const groupName = 'ui';
    mockFetchSequence([
      async () => ({
        status: 200,
        headers: new Map([['ETag', 'W/\"xyz\"']]),
        json: async () => ({
          success: true,
          data: {
            profile_context: { user_id: 1, resolved_profile_id: 0, versions: { last_update: '2025-01-01T00:00:00' } },
            groups: { [groupName]: {} },
            group_etags: {},
          },
        }),
      }),
      async () => ({
        status: 200,
        headers: new Map([['ETag', 'W/\"g1\"']]),
        json: async () => ({
          success: true,
          data: {
            group: groupName,
            values: { 'ui.page_size': 25 },
            profile_context: { user_id: 1, resolved_profile_id: 0 },
          },
        }),
      }),
    ]);

    require('../../trading-ui/scripts/services/preferences-v4.js');
    await global.window.PreferencesV4.bootstrap([groupName]);

    let updatedFired = false;
    global.window.addEventListener('preferences:updated', (e) => {
      if (e?.detail?.scope === 'group' && e?.detail?.group === groupName) {
        updatedFired = true;
      }
    });

    await global.window.PreferencesV4.getGroup(groupName);
    expect(updatedFired).toBe(true);
  });
});



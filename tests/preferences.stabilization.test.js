/**
 * Preferences stabilization tests
 * - Verifies request dedupe/backoff
 * - Ensures single init path calls PreferencesData.loadProfiles once
 */

describe('Preferences stabilization', () => {
  beforeEach(() => {
    global.window = Object.create(null);
    window.Logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
    window.NotificationSystem = { error: jest.fn() };
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  test('dedupe prevents duplicate simultaneous requests', async () => {
    jest.useFakeTimers();
    const responses = [
      Promise.resolve({ ok: true, json: async () => ({ a: 1 }) }),
      Promise.resolve({ ok: true, json: async () => ({ a: 1 }) }),
    ];
    global.fetch = jest.fn()
      .mockReturnValueOnce(responses[0])
      .mockReturnValueOnce(responses[1]);

    require('../trading-ui/scripts/services/preferences-data.js');

    const p1 = window.PreferencesData.loadPreference({ preferenceName: 'x', userId: 1, profileId: 2, force: true });
    const p2 = window.PreferencesData.loadPreference({ preferenceName: 'x', userId: 1, profileId: 2, force: true });

    // Both should resolve, fetch should effectively be called once due to dedupe (second hits the same in-flight promise)
    const r = await Promise.all([p1, p2]);
    expect(r[0].cached).toBe(false);
    expect(r[1].cached).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('backoff retries on 429 then succeeds', async () => {
    jest.useFakeTimers();
    const first = Promise.resolve({
      ok: false,
      status: 429,
      headers: { get: () => '1' },
      json: async () => ({ message: 'rate limit' }),
    });
    const second = Promise.resolve({
      ok: true,
      json: async () => ({ data: { preferences: {} } }),
    });
    global.fetch = jest.fn()
      .mockReturnValueOnce(first)
      .mockReturnValueOnce(second);

    require('../trading-ui/scripts/services/preferences-data.js');
    const resPromise = window.PreferencesData.loadAllPreferencesRaw({ userId: 1, profileId: 2, force: true });

    // Fast-forward retry-after
    await Promise.resolve();
    jest.advanceTimersByTime(1100);
    const res = await resPromise;
    expect(res).toHaveProperty('preferences');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test('PreferencesUI.initialize performs single orchestrated flow', async () => {
    // Mocks
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ data: {} }) });
    require('../trading-ui/scripts/services/preferences-data.js');

    window.PreferencesData.loadProfiles = jest.fn().mockResolvedValue({
      profiles: [],
      profileContext: { user: { id: 1 }, resolved_profile_id: 2 },
    });
    window.PreferencesCore = {
      getAllPreferences: jest.fn().mockResolvedValue({}),
    };
    window.LazyLoader = { initialize: jest.fn().mockResolvedValue() };

    // Load UI module
    require('../trading-ui/scripts/preferences-ui.js');
    expect(window.PreferencesUI).toBeTruthy();
    await window.PreferencesUI.initialize();

    expect(window.PreferencesData.loadProfiles).toHaveBeenCalledTimes(1);
    expect(window.LazyLoader.initialize).toHaveBeenCalledWith(1, 2);
    expect(window.PreferencesCore.getAllPreferences).toHaveBeenCalled();
  });
});




/* eslint-env jest */

describe('Preferences API extended contract (frontend integration)', () => {
  beforeAll(() => {
    // Initialize service modules
    // eslint-disable-next-line global-require
    require('../../trading-ui/scripts/services/preferences-data.js');
    global.fetch = jest.fn();
    global.window.Logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/preferences/user/group returns profile_context with resolved_profile_id', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          user_id: 1,
          requested_profile_id: null,
          profile_id: 7,
          group_name: 'colors',
          preferences: [{ preference_name: 'primaryColor', saved_value: '#26baac' }],
          profile_context: {
            user: { id: 1 },
            resolved_profile_id: 7,
            resolved_profile: { id: 7, name: 'Profile #7' },
          },
        },
      }),
    });

    const result = await window.PreferencesData.loadPreferenceGroup({
      groupName: 'colors',
      userId: 1,
      profileId: 7,
      force: true,
    });
    expect(result.profileContext).toBeTruthy();
    expect(result.profileContext.resolved_profile_id).toBe(7);
    expect(result.preferences.primaryColor).toBe('#26baac');
  });

  test('POST /api/preferences/user/multiple includes profile_context', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          user_id: 1,
          preference_names: ['timezone', 'linkColor'],
          preferences: { timezone: 'UTC', linkColor: '#26baac' },
          count: 2,
          profile_id: 7,
          actual_profile_id: 7,
          profile_context: {
            user: { id: 1 },
            resolved_profile_id: 7,
            resolved_profile: { id: 7, name: 'Profile #7' },
          },
        },
      }),
    });

    const result = await window.PreferencesData.loadPreferencesByNames({
      names: ['timezone', 'linkColor'],
      userId: 1,
      profileId: 7,
      force: true,
    });
    expect(result.timezone).toBe('UTC');
    expect(result.linkColor).toBe('#26baac');
  });
});




/**
 * Preferences Standardization - Unit Tests
 * Verifies alias mapping and value normalization behavior.
 */

/* eslint-env jest */

describe('PreferencesGroupManager alias mapping and normalization', () => {
  let Manager;
  beforeAll(() => {
    // Minimal DOM
    document.body.innerHTML = `
      <div id="section2">
        <div class="section-body" style="display:block">
          <select id="defaultStatusFilter" name="defaultStatusFilter">
            <option value="open">open</option>
            <option value="closed">closed</option>
            <option value="all">all</option>
          </select>
          <input id="primaryColor" name="primaryColor" type="color" data-color-key="primary_color" />
        </div>
      </div>
    `;
    // Load module under test (CommonJS via JSDOM bundling in Jest env)
    // eslint-disable-next-line global-require
    require('../trading-ui/scripts/preferences-group-manager.js');
    Manager = window.PreferencesGroupManager;
  });

  test('reverse aliases include canonical and alias keys', () => {
    expect(Manager.reverseNameAliases.defaultStatusFilter).toBe('default_status_filter');
    expect(Manager.reverseNameAliases.default_status_filter).toBe('default_status_filter');
    expect(Manager.reverseNameAliases.primaryColor).toBe('primary_color');
  });

  test('populateGroupFields maps canonical keys to DOM fields', () => {
    const stats = Manager.populateGroupFields('section2', {
      default_status_filter: 'open',
      primary_color: '#26baac',
    });
    const statusEl = document.getElementById('defaultStatusFilter');
    const colorEl = document.getElementById('primaryColor');
    expect(statusEl.value).toBe('open');
    expect(colorEl.value.toLowerCase()).toBe('#26baac');
    expect(stats.populatedCount).toBeGreaterThanOrEqual(2);
    expect(Array.isArray(stats.unresolvedKeys)).toBe(true);
  });

  test('collectGroupData uses canonical keys (data-color-key and aliases)', () => {
    const section = document.getElementById('section2');
    const data = Manager.collectGroupData(section);
    expect(Object.prototype.hasOwnProperty.call(data, 'default_status_filter')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(data, 'primary_color')).toBe(true);
  });
});




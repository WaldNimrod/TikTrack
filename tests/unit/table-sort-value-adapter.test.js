/** @jest-environment node */
/* eslint-env jest */
/* global describe, test, expect, jest */
describe('TableSortValueAdapter', () => {
  const loadAdapter = () => {
    jest.resetModules();
    global.window = {};
    require('../../trading-ui/scripts/services/table-sort-value-adapter.js');
    return global.window.TableSortValueAdapter;
  };

  test('returns epochMs for nested date envelopes', () => {
    const Adapter = loadAdapter();
    const value = Adapter.getSortValue({
      value: { date: { utc: '2024-05-05T12:00:00Z' } },
    });
    expect(typeof value).toBe('number');
    expect(value).toBe(Date.parse('2024-05-05T12:00:00Z'));
  });

  test('detects numeric-string and trims whitespace', () => {
    const Adapter = loadAdapter();
    const value = Adapter.getSortValue({ value: '  41.5 ' });
    expect(value).toBeCloseTo(41.5);
  });

  test('maps boolean-like strings to numeric flags when type forced', () => {
    const Adapter = loadAdapter();
    expect(Adapter.getSortValue({ value: 'Yes', type: 'boolean' })).toBe(1);
    expect(Adapter.getSortValue({ value: 'no', type: 'boolean' })).toBe(0);
  });

  test('allows explicit type override even when auto would differ', () => {
    const Adapter = loadAdapter();
    const result = Adapter.getSortValue({ value: '42', type: 'string' });
    expect(result).toBe('42');
  });

  test('uses fallback when value is nil', () => {
    const Adapter = loadAdapter();
    const value = Adapter.getSortValue({ value: null, fallback: 'UPPER' });
    expect(value).toBe('upper');
  });

  test('returns lowercase strings for textual values', () => {
    const Adapter = loadAdapter();
    const value = Adapter.getSortValue({ value: 'MixedCase' });
    expect(value).toBe('mixedcase');
  });

  test('returns null for invalid date envelopes', () => {
    const Adapter = loadAdapter();
    const value = Adapter.getSortValue({ value: { utc: 'invalid-date' } });
    expect(value).toBeNull();
  });

  test('falls back to raw object when type detection stays auto', () => {
    const Adapter = loadAdapter();
    const payload = { foo: 'bar' };
    const value = Adapter.getSortValue({ value: payload });
    expect(value).toBe(payload);
  });

  test('unknown types reuse fallback strategy', () => {
    const Adapter = loadAdapter();
    expect(Adapter.getSortValue({ value: 123, type: 'mystery' })).toBe(123);
    expect(Adapter.getSortValue({ value: 'Alpha', type: 'mystery' })).toBe('alpha');
  });

  test('date adapter returns null for unsupported payloads', () => {
    const Adapter = loadAdapter();
    expect(Adapter.getSortValue({ value: { invalid: true }, type: 'date' })).toBeNull();
  });

  test('numeric adapter returns null for non-numeric inputs', () => {
    const Adapter = loadAdapter();
    expect(Adapter.getSortValue({ value: 'not-a-number', type: 'numeric' })).toBeNull();
  });

  test('numeric-string adapter reuses numeric handler when value already number', () => {
    const Adapter = loadAdapter();
    expect(Adapter.getSortValue({ value: 77, type: 'numeric-string' })).toBe(77);
  });

  test('numeric-string adapter returns null for NaN strings', () => {
    const Adapter = loadAdapter();
    expect(Adapter.getSortValue({ value: 'abc', type: 'numeric-string' })).toBeNull();
  });

  test('boolean adapter returns null for unrecognized strings', () => {
    const Adapter = loadAdapter();
    expect(Adapter.getSortValue({ value: 'perhaps', type: 'boolean' })).toBeNull();
  });

  test('date adapter normalizes ISO-only strings', () => {
    const Adapter = loadAdapter();
    const value = Adapter.getSortValue({ value: '2024-08-19', type: 'date' });
    expect(value).toBe(Date.parse('2024-08-19T00:00:00Z'));
  });

  test('date adapter handles Date instances directly', () => {
    const Adapter = loadAdapter();
    const source = new Date('2023-12-01T10:00:00Z');
    const value = Adapter.getSortValue({ value: source, type: 'date' });
    expect(value).toBe(source.getTime());
  });

  test('date envelope adapter returns null for empty payloads', () => {
    const Adapter = loadAdapter();
    expect(Adapter.getSortValue({ value: null, type: 'dateEnvelope' })).toBeNull();
    expect(Adapter.getSortValue({ value: undefined, type: 'dateEnvelope' })).toBeNull();
    expect(Adapter.getSortValue({ value: {}, type: 'dateEnvelope' })).toBeNull();
  });

  test('date envelope adapter prefers epochMs when available', () => {
    const Adapter = loadAdapter();
    expect(Adapter.getSortValue({ value: { epochMs: 123456789 }, type: 'dateEnvelope' })).toBe(123456789);
  });

  test('auto detection treats plain numbers and booleans via numeric/boolean resolvers', () => {
    const Adapter = loadAdapter();
    expect(Adapter.getSortValue({ value: 11 })).toBe(11);
    expect(Adapter.getSortValue({ value: true })).toBe(1);
  });

  test('auto detection recognizes ISO-looking strings as dates', () => {
    const Adapter = loadAdapter();
    const value = Adapter.getSortValue({ value: '2025-01-15T08:30:00Z' });
    expect(value).toBe(Date.parse('2025-01-15T00:00:00Z'));
  });

  test('date adapter accepts raw timestamps', () => {
    const Adapter = loadAdapter();
    const timestamp = Date.now();
    expect(Adapter.getSortValue({ value: timestamp, type: 'date' })).toBe(timestamp);
  });
});

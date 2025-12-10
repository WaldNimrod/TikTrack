/**
 * Historical Data Helpers
 * Shared utilities for OHLC validation, sorting, and date normalization.
 * Uses existing global systems only; no fallback or fake data is generated.
 *
 * Exposes:
 *  - sanitizeOhlcSeries(points): filters invalid OHLC points and normalizes dates
 *  - toEpochSeconds(dateValue): converts Date/ISO/DateEnvelope to epoch seconds
 *  - normalizeDateEnvelope(dateValue): converts DateEnvelope/ISO/Date to Date
 */
(function historicalDataHelpers() {

// ===== FUNCTION INDEX =====

// === Event Handlers ===
// - toEpochSeconds() - Toepochseconds

// === Other ===
// - normalizeDateEnvelope() - Normalizedateenvelope
// - sanitizeOhlcSeries() - Sanitizeohlcseries

  'use strict';

  function normalizeDateEnvelope(dateValue) {
    if (!dateValue) return null;

    try {
      // DateEnvelope format
      if (typeof dateValue === 'object') {
        if (dateValue.utc) {
          return new Date(dateValue.utc);
        }
        if (dateValue.epochMs) {
          return new Date(dateValue.epochMs);
        }
        if (dateValue.date || dateValue.date_envelope) {
          return normalizeDateEnvelope(dateValue.date || dateValue.date_envelope);
        }
      }

      // ISO / Date string
      if (typeof dateValue === 'string') {
        return new Date(dateValue);
      }

      // Date object
      if (dateValue instanceof Date) {
        return dateValue;
      }
    } catch (error) {
      if (window.Logger) {
        window.Logger.warn('normalizeDateEnvelope failed', { error, dateValue });
      }
    }

    return null;
  }

  function toEpochSeconds(dateValue) {
    const dateObj = normalizeDateEnvelope(dateValue);
    if (!dateObj || isNaN(dateObj.getTime())) return null;
    return Math.floor(dateObj.getTime() / 1000);
  }

  function sanitizeOhlcSeries(points = []) {
    const cleaned = [];
    let droppedCount = 0;

    for (const item of points) {
      if (!item) {
        droppedCount += 1;
        continue;
      }

      const hasAll = ['open', 'high', 'low', 'close'].every(
        (field) => item[field] !== null && item[field] !== undefined && !Number.isNaN(item[field])
      );
      if (!hasAll) {
        droppedCount += 1;
        continue;
      }

      const dateObj = normalizeDateEnvelope(item.date || item.date_envelope || item.dateObj);
      if (!dateObj || isNaN(dateObj.getTime())) {
        droppedCount += 1;
        continue;
      }

      cleaned.push({
        ...item,
        dateObj,
        time: toEpochSeconds(dateObj),
      });
    }

    cleaned.sort((a, b) => a.dateObj - b.dateObj);

    return {
      cleaned,
      droppedCount,
    };
  }

  window.HistoricalDataHelpers = {
    normalizeDateEnvelope,
    toEpochSeconds,
    sanitizeOhlcSeries,
  };

  window.Logger?.debug?.('HistoricalDataHelpers initialized', { page: 'shared-helpers' });
})();



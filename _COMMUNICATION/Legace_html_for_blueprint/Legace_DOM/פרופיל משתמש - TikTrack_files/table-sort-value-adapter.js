/**
 * Table Sort Value Adapter - TikTrack
 * ===================================
 *
 * Bridges DateEnvelope outputs (see DATE_ENVELOPE_BLUEPRINT.md) and the unified
 * table sorting system. Converts heterogeneous field values into a single
 * sortable primitive without leaking parsing logic into page code.
 *
 * Supported `type` values (extensible):
 * - 'dateEnvelope' : expects `{ epochMs, utc, ... }`
 * - 'date'         : ISO strings or timestamps (legacy)
 * - 'numeric'      : numbers (already numeric)
 * - 'numeric-string': strings representing numbers
 * - 'boolean'      : truthy/falsy values mapped to 1/0
 * - 'string'       : textual comparison (lower-cased)
 * - 'auto' / undefined : best-effort detection
 *
 * @version 0.1.0
 * @created January 2026
 * @author TikTrack
 */


// ===== FUNCTION INDEX =====

// === Other ===
// - TableSortValueAdapter.switch() - Switch

class TableSortValueAdapter {
    /**
     * Resolve a sortable key for the given value.
     *
     * @param {Object} config
     * @param {*} config.value - Raw value from table data.
     * @param {string} [config.type='auto'] - Declared sort type.
     * @param {*} [config.fallback] - Fallback value if primary is null/undefined.
     * @returns {number|string|null} sortable primitive (prefer numbers for stable sort)
     */
    static getSortValue({ value, type = 'auto', fallback } = {}) {
        const resolvedValue = this._isNil(value) ? fallback : value;
        const resolvedType = this._resolveType(type, resolvedValue);

        switch (resolvedType) {
            case 'dateEnvelope':
                return this._fromDateEnvelope(resolvedValue);
            case 'date':
                return this._fromDate(resolvedValue);
            case 'numeric':
                return this._fromNumeric(resolvedValue);
            case 'numeric-string':
                return this._fromNumericString(resolvedValue);
            case 'boolean':
                return this._fromBoolean(resolvedValue);
            case 'string':
                return this._fromString(resolvedValue);
            default:
                return this._fallbackValue(resolvedValue);
        }
    }

    /**
     * Supported type aliases resolver.
     * @private
     */
    static _resolveType(type, value) {
        if (type && type !== 'auto') {
            return type;
        }

        if (this._isDateEnvelope(value)) {
            return 'dateEnvelope';
        }
        if (typeof value === 'number') {
            return 'numeric';
        }
        if (typeof value === 'boolean') {
            return 'boolean';
        }
        if (typeof value === 'string') {
            // Date heuristics: ISO or YYYY-MM-DD
            if (this._looksLikeDate(value)) {
                return 'date';
            }
            if (!Number.isNaN(Number(value)) && value.trim() !== '') {
                return 'numeric-string';
            }
            return 'string';
        }

        return 'auto';
    }

    static _fromDateEnvelope(envelope) {
        if (!envelope || typeof envelope !== 'object') {
            return null;
        }

        if (typeof envelope.epochMs === 'number' && !Number.isNaN(envelope.epochMs)) {
            return envelope.epochMs;
        }

        if (envelope.utc) {
            const parsed = Date.parse(envelope.utc);
            return Number.isNaN(parsed) ? null : parsed;
        }

        // Support legacy nested envelope `{ date: { utc: ... } }`
        if (envelope.date && typeof envelope.date === 'object') {
            return this._fromDateEnvelope(envelope.date);
        }

        return null;
    }

    static _fromDate(dateValue) {
        if (this._isNil(dateValue)) return null;

        if (typeof dateValue === 'number' && !Number.isNaN(dateValue)) {
            return dateValue;
        }

        if (typeof dateValue === 'string') {
            const trimmed = dateValue.trim();
            if (!trimmed) return null;

            // Limit to date-only sorting: take YYYY-MM-DD before parsing if present
            const dateOnlyMatch = trimmed.match(/^\d{4}-\d{2}-\d{2}/);
            const normalized = dateOnlyMatch ? `${dateOnlyMatch[0]}T00:00:00Z` : trimmed;
            const parsed = Date.parse(normalized);
            return Number.isNaN(parsed) ? null : parsed;
        }

        if (dateValue instanceof Date) {
            return dateValue.getTime();
        }

        return null;
    }

    static _fromNumeric(value) {
        if (typeof value === 'number' && !Number.isNaN(value)) {
            return value;
        }
        return null;
    }

    static _fromNumericString(value) {
        if (typeof value !== 'string') {
            return this._fromNumeric(value);
        }

        const num = Number(value);
        return Number.isNaN(num) ? null : num;
    }

    static _fromBoolean(value) {
        if (value === true) return 1;
        if (value === false) return 0;
        if (typeof value === 'string') {
            const lowered = value.toLowerCase();
            if (['true', 'yes', 'y', '1'].includes(lowered)) return 1;
            if (['false', 'no', 'n', '0'].includes(lowered)) return 0;
        }
        return null;
    }

    static _fromString(value) {
        if (this._isNil(value)) return '';
        return String(value).toLocaleLowerCase('en-US');
    }

    static _fallbackValue(value) {
        if (typeof value === 'number') {
            return this._fromNumeric(value);
        }
        if (typeof value === 'string') {
            return this._fromString(value);
        }
        return value ?? null;
    }

    static _looksLikeDate(value) {
        return /^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{4}-\d{2}-\d{2}T/.test(value);
    }

    static _isDateEnvelope(value) {
        if (!value || typeof value !== 'object') return false;
        if (typeof value.epochMs === 'number') return true;
        if (typeof value.utc === 'string') return true;
        if (value.date) return this._isDateEnvelope(value.date);
        return false;
    }

    static _isNil(value) {
        return value === null || value === undefined;
    }
}

// Register globally for legacy access patterns (mirrors other services)
if (typeof window !== 'undefined') {
    window.TableSortValueAdapter = TableSortValueAdapter;
    window.getTableSortValue = TableSortValueAdapter.getSortValue.bind(TableSortValueAdapter);
}


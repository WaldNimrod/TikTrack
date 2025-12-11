/**
 * Cache Key Helper - Optimized Cache Key Generation
 * ==================================================
 * 
 * Provides optimized cache key generation functions to improve cache hit rates.
 * 
 * Features:
 * - Normalized key generation (handles object order, whitespace, etc.)
 * - Hash-based keys for complex objects (faster lookups)
 * - Consistent key format across all services
 * 
 * Usage:
 *   import { generateCacheKey, hashObject } from './cache-key-helper.js';
 *   const key = generateCacheKey('business:calculate-stop-price', { price: 100, percentage: 5 });
 */


// ===== FUNCTION INDEX =====

// === Other ===
// - simpleHash() - Simplehash
// - normalizeValue() - Normalizevalue
// - generateCacheKey() - Generatecachekey
// - generateCacheKeyFromObject() - Generatecachekeyfromobject
// - hashObject() - Hashobject

(function() {
  'use strict';

  /**
   * Simple hash function for cache keys (non-cryptographic)
   * @param {string} str - String to hash
   * @returns {string} Hash value
   */
  function simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Normalize a value for cache key generation
   * @param {*} value - Value to normalize
   * @returns {string} Normalized string representation
   */
  function normalizeValue(value) {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'number') {
      // Round to 2 decimal places for price/percentage values to improve cache hits
      return Number(value.toFixed(2)).toString();
    }
    if (typeof value === 'boolean') {
      return value ? '1' : '0';
    }
    if (typeof value === 'string') {
      // Normalize string: trim, lowercase for case-insensitive keys
      return value.trim().toLowerCase();
    }
    if (Array.isArray(value)) {
      return value.map(normalizeValue).join(',');
    }
    if (typeof value === 'object') {
      // Sort object keys for consistent key generation
      const sortedKeys = Object.keys(value).sort();
      return sortedKeys.map(key => `${key}:${normalizeValue(value[key])}`).join('|');
    }
    return String(value);
  }

  /**
   * Generate optimized cache key
   * @param {string} prefix - Key prefix (e.g., 'business:calculate-stop-price')
   * @param {...*} args - Arguments to include in the key
   * @returns {string} Optimized cache key
   */
  function generateCacheKey(prefix, ...args) {
    if (!prefix || typeof prefix !== 'string') {
      throw new Error('Cache key prefix must be a non-empty string');
    }

    const normalizedArgs = args.map(normalizeValue).join(':');
    
    // For simple keys (short), use direct format
    if (normalizedArgs.length < 100) {
      return `${prefix}:${normalizedArgs}`;
    }
    
    // For complex keys (long), use hash for better performance
    const hash = simpleHash(normalizedArgs);
    return `${prefix}:${hash}`;
  }

  /**
   * Generate cache key from object
   * @param {string} prefix - Key prefix
   * @param {Object} params - Parameters object
   * @returns {string} Optimized cache key
   */
  function generateCacheKeyFromObject(prefix, params) {
    if (!params || typeof params !== 'object') {
      return prefix;
    }
    
    const normalized = normalizeValue(params);
    
    // For simple objects, use direct format
    if (normalized.length < 100) {
      return `${prefix}:${normalized}`;
    }
    
    // For complex objects, use hash
    const hash = simpleHash(normalized);
    return `${prefix}:${hash}`;
  }

  /**
   * Hash an object for cache key generation
   * @param {Object} obj - Object to hash
   * @returns {string} Hash value
   */
  function hashObject(obj) {
    if (!obj || typeof obj !== 'object') {
      return '';
    }
    const normalized = normalizeValue(obj);
    return simpleHash(normalized);
  }

  // Export functions
  if (typeof window !== 'undefined') {
    window.CacheKeyHelper = {
      generateCacheKey,
      generateCacheKeyFromObject,
      hashObject,
      normalizeValue
    };
    
    window.Logger?.info?.('✅ CacheKeyHelper initialized', { page: 'cache-key-helper' });
  }
})();


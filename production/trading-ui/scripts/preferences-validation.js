/**
 * Preferences Validation System - TikTrack
 * =========================================
 *
 * Strict validation system for preferences
 * Validates existence, format, and constraints before save
 *
 * @version 1.0.0
 * @date January 23, 2025
 * @author TikTrack Development Team
 *
 * @description
 * Comprehensive validation system with:
 * - Preference existence validation
 * - Data type validation
 * - Constraint validation
 * - Format validation
 * - Business rule validation
 *
 * @architecture
 * - PreferenceValidator: Core validation logic
 * - ExistenceChecker: Database existence validation
 * - FormatValidator: Data format validation
 * - ConstraintValidator: Business rule validation
 * - ValidationReporter: Error reporting and feedback
 */
/* global ValidationError */

if (window.Logger && window.Logger.info) {
  window.Logger.info('📄 Loading preferences-validation.js v1.0.0...', { page: 'preferences-validation' });
}

// ============================================================================
// FUNCTION INDEX
// ============================================================================
/**
 * ============================================================================
 * FUNCTION INDEX - Preferences Validation System
 * ============================================================================
 * 
 * Core Classes:
 * - PreferenceValidator - Core validation logic
 * - ExistenceError - Error for preference not found
 * - FormatError - Error for invalid format
 * - ConstraintError - Error for constraint violation
 * 
 * Global Functions:
 * - validatePreference(preferenceName, value, dataType) - Validate preference
 * - checkPreferenceExists(preferenceName) - Check if preference exists
 * - validatePreferenceFormat(value, dataType) - Validate format
 * - validatePreferenceConstraints(value, constraints) - Validate constraints
 * 
 * Global Instances:
 * - window.PreferenceValidator - Main validator instance
 * 
 * Documentation: See documentation/04-FEATURES/CORE/preferences/PREFERENCES_COMPLETE_DEVELOPER_GUIDE.md
 * ============================================================================
 */

// ============================================================================
// VALIDATION ERROR CLASSES
// ============================================================================

/**
 * ValidationError is already defined in preferences-core-new.js
 * Using the existing ValidationError class
 * If not available, define a fallback
 */
if (typeof ValidationError === 'undefined' && typeof window.ValidationError === 'undefined') {
    class ValidationError extends Error {
        constructor(message, preferenceName = null) {
            super(message);
            this.name = 'ValidationError';
            this.preferenceName = preferenceName;
        }
    }
    window.ValidationError = ValidationError;
}

// Use global ValidationError if available
const ValidationErrorClass = window.ValidationError || ValidationError;

/**
 * Existence Error
 * Error for preference not found in database
 */
class ExistenceError extends ValidationErrorClass {
  constructor(preferenceName) {
    super(`Preference '${preferenceName}' not found in database. Please create a migration to add this preference.`, preferenceName, 'NOT_FOUND');
    this.name = 'ExistenceError';
  }
}

/**
 * Format Error
 * Error for invalid data format
 */
class FormatError extends ValidationErrorClass {
  constructor(preferenceName, expectedFormat, actualValue) {
    super(`Invalid format for '${preferenceName}': expected ${expectedFormat}, got ${typeof actualValue}`, preferenceName, 'INVALID_FORMAT');
    this.name = 'FormatError';
    this.expectedFormat = expectedFormat;
    this.actualValue = actualValue;
  }
}

/**
 * Constraint Error
 * Error for constraint violations
 */
class ConstraintError extends ValidationErrorClass {
  constructor(preferenceName, constraint, value) {
    super(`Constraint violation for '${preferenceName}': ${constraint}`, preferenceName, 'CONSTRAINT_VIOLATION');
    this.name = 'ConstraintError';
    this.constraint = constraint;
    this.value = value;
  }
}

// ============================================================================
// EXISTENCE CHECKER CLASS
// ============================================================================

/**
 * Preference Existence Checker
 * Validates that preferences exist in database
 */
class ExistenceChecker {
  constructor() {
    this.existenceCache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
    this.timestamps = new Map();
  }

  /**
     * Check if preference exists in database
     * @param {string} preferenceName - Preference name
     * @returns {Promise<boolean>} Exists status
     */
  async checkExists(preferenceName) {
    // Check cache first
    const cached = this.getCached(preferenceName);
    if (cached !== null) {
      return cached;
    }

    try {
      const exists = await window.PreferencesData.checkPreferenceExists(preferenceName);
      this.setCached(preferenceName, exists);
      return exists;
    } catch (error) {
      window.Logger.error(`❌ Error checking preference existence for ${preferenceName}:`, error, { page: 'preferences-validation' });
      return false;
    }
  }

  /**
     * Check multiple preferences existence
     * @param {Array<string>} preferenceNames - Preference names
     * @returns {Promise<Object>} Existence results
     */
  async checkMultipleExists(preferenceNames) {
    const results = {};

    for (const name of preferenceNames) {
      try {
        results[name] = await this.checkExists(name);
      } catch (error) {
        window.Logger.error(`❌ Error checking existence for ${name}:`, error, { page: 'preferences-validation' });
        results[name] = false;
      }
    }

    return results;
  }

  /**
     * Get cached existence result
     * @param {string} preferenceName - Preference name
     * @returns {boolean|null} Cached result or null
     */
  getCached(preferenceName) {
    const timestamp = this.timestamps.get(preferenceName);
    if (!timestamp) {return null;}

    // Check TTL
    if (Date.now() - timestamp > this.cacheTTL) {
      this.existenceCache.delete(preferenceName);
      this.timestamps.delete(preferenceName);
      return null;
    }

    return this.existenceCache.get(preferenceName);
  }

  /**
     * Set cached existence result
     * @param {string} preferenceName - Preference name
     * @param {boolean} exists - Exists status
     */
  setCached(preferenceName, exists) {
    this.existenceCache.set(preferenceName, exists);
    this.timestamps.set(preferenceName, Date.now());
  }

  /**
     * Clear existence cache
     */
  clearCache() {
    this.existenceCache.clear();
    this.timestamps.clear();
  }
}

// ============================================================================
// FORMAT VALIDATOR CLASS
// ============================================================================

/**
 * Format Validator
 * Validates data format and type
 */
class FormatValidator {
  constructor() {
    this.validators = new Map();
    this.setupDefaultValidators();
  }

  /**
     * Setup default format validators
     */
  setupDefaultValidators() {
    // String validators
    this.validators.set('string', value => typeof value === 'string');

    // Number validators
    this.validators.set('number', value => typeof value === 'number' && !isNaN(value) && isFinite(value));

    // Boolean validators
    this.validators.set('boolean', value => typeof value === 'boolean');

    // JSON validators
    this.validators.set('json', value => {
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      }
      return typeof value === 'object';
    });

    // Email validators
    this.validators.set('email', value => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return typeof value === 'string' && emailRegex.test(value);
    });

    // URL validators
    this.validators.set('url', value => {
      if (typeof value !== 'string') {return false;}
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    });

    // Color validators
    this.validators.set('color', value => {
      if (typeof value !== 'string') {return false;}

      // Hex color validation
      if (value.startsWith('#')) {
        return /^#[0-9A-Fa-f]{6}$/.test(value) || /^#[0-9A-Fa-f]{3}$/.test(value);
      }

      // RGB color validation
      if (value.startsWith('rgb')) {
        return /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(value);
      }

      // Named colors (basic validation)
      const namedColors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'grey'];
      return namedColors.includes(value.toLowerCase());
    });
  }

  /**
     * Validate format
     * @param {string} preferenceName - Preference name
     * @param {any} value - Value to validate
     * @param {string} dataType - Expected data type
     * @returns {boolean} Is valid
     */
  validate(preferenceName, value, dataType) {
    const validator = this.validators.get(dataType);
    if (!validator) {
      window.Logger.warn(`⚠️ No validator for data type: ${dataType}`, { page: 'preferences-validation' });
      return true; // Allow unknown types
    }

    const isValid = validator(value);
    if (!isValid) {
      window.Logger.warn(`⚠️ Format validation failed for ${preferenceName}: expected ${dataType}, got ${typeof value}`, { page: 'preferences-validation' });
    }

    return isValid;
  }

  /**
     * Get validation error for format
     * @param {string} preferenceName - Preference name
     * @param {any} value - Value to validate
     * @param {string} dataType - Expected data type
     * @returns {FormatError|null} Error or null
     */
  getValidationError(preferenceName, value, dataType) {
    if (this.validate(preferenceName, value, dataType)) {
      return null;
    }

    return new FormatError(preferenceName, dataType, value);
  }
}

// ============================================================================
// CONSTRAINT VALIDATOR CLASS
// ============================================================================

/**
 * Constraint Validator
 * Validates business rules and constraints
 */
class ConstraintValidator {
  constructor() {
    this.constraints = new Map();
    this.setupDefaultConstraints();
  }

  /**
     * Setup default constraints
     */
  setupDefaultConstraints() {
    // Number constraints
    this.constraints.set('pagination_size_default', {
      min: 10,
      max: 1000,
      type: 'number',
    });

    // Commission constraints
    this.constraints.set('defaultCommission', {
      min: 0,
      max: 100,
      type: 'number',
    });

    // Price constraints
    this.constraints.set('defaultStopLoss', {
      min: 0.1,
      max: 95,
      type: 'number',
    });

    this.constraints.set('defaultTargetPrice', {
      min: 0.1,
      max: 500,
      type: 'number',
    });

    // Chart constraints
    this.constraints.set('chartRefreshInterval', {
      min: 30,
      max: 300000,
      type: 'number',
    });

    // Integer constraints
    this.constraints.set('default_trading_account', {
      min: 1,
      type: 'number',
      allowEmpty: true,
    });

    // String length constraints
    this.constraints.set('defaultSearchFilter', {
      minLength: 0,
      maxLength: 200,
      type: 'string',
    });
  }

  /**
     * Validate constraints
     * @param {string} preferenceName - Preference name
     * @param {any} value - Value to validate
     * @returns {boolean} Is valid
     */
  validate(preferenceName, value) {
    const constraint = this.constraints.get(preferenceName);
    if (!constraint) {
      return true; // No constraints defined
    }

    const isEmptyValue = value === '' || value === null || value === undefined;
    if (constraint.allowEmpty && isEmptyValue) {
      return true;
    }

    // Number constraints
    if (constraint.type === 'number') {
      // Convert string to number if needed
      const numValue = typeof value === 'string' ? parseFloat(value) : value;

      if (isNaN(numValue)) {
        window.Logger.warn(`⚠️ Constraint validation failed: ${preferenceName} = "${value}" is not a number`, { page: 'preferences-validation' });
        return false;
      }

      if (constraint.min !== undefined && numValue < constraint.min) {
        window.Logger.warn(`⚠️ Constraint violation: ${preferenceName} = ${numValue} < ${constraint.min} (min allowed)`, { page: 'preferences-validation' });
        return false;
      }

      if (constraint.max !== undefined && numValue > constraint.max) {
        window.Logger.warn(`⚠️ Constraint violation: ${preferenceName} = ${numValue} > ${constraint.max} (max allowed)`, { page: 'preferences-validation' });
        return false;
      }
    }

    // String constraints
    if (constraint.type === 'string') {
      if (typeof value !== 'string') {return false;}

      if (constraint.minLength !== undefined && value.length < constraint.minLength) {
        window.Logger.warn(`⚠️ Constraint violation: ${preferenceName} length ${value.length} < ${constraint.minLength}`, { page: 'preferences-validation' });
        return false;
      }

      if (constraint.maxLength !== undefined && value.length > constraint.maxLength) {
        window.Logger.warn(`⚠️ Constraint violation: ${preferenceName} length ${value.length} > ${constraint.maxLength}`, { page: 'preferences-validation' });
        return false;
      }
    }

    return true;
  }

  /**
     * Get constraint error
     * @param {string} preferenceName - Preference name
     * @param {any} value - Value to validate
     * @returns {ConstraintError|null} Error or null
     */
  getConstraintError(preferenceName, value) {
    const constraint = this.constraints.get(preferenceName);
    if (!constraint) {
      return null;
    }

    const isEmptyValue = value === '' || value === null || value === undefined;
    if (constraint.allowEmpty && isEmptyValue) {
      return null;
    }

    // Log constraint details for debugging
    window.Logger.debug(`🔍 Checking constraints for ${preferenceName}:`, {
      value,
      valueType: typeof value,
      valueAsNumber: typeof value === 'string' ? parseFloat(value) : value,
      constraint,
      page: 'preferences-validation',
    });

    if (this.validate(preferenceName, value)) {
      return null;
    }

    const constraintText = this.formatConstraintText(constraint);

    window.Logger.warn(`⚠️ Constraint violation for ${preferenceName}:`, {
      value,
      constraint: constraintText,
      fullConstraint: constraint,
      page: 'preferences-validation',
    });

    return new ConstraintError(preferenceName, constraintText, value);
  }

  /**
     * Format constraint text
     * @param {Object} constraint - Constraint object
     * @returns {string} Formatted text
     */
  formatConstraintText(constraint) {
    if (!constraint) {return 'No constraints';}

    const parts = [];

    if (constraint.min !== undefined) {
      parts.push(`min: ${constraint.min}`);
    }

    if (constraint.max !== undefined) {
      parts.push(`max: ${constraint.max}`);
    }

    if (constraint.minLength !== undefined) {
      parts.push(`minLength: ${constraint.minLength}`);
    }

    if (constraint.maxLength !== undefined) {
      parts.push(`maxLength: ${constraint.maxLength}`);
    }

    return parts.join(', ');
  }
}

// ============================================================================
// MAIN PREFERENCE VALIDATOR CLASS
// ============================================================================

/**
 * Main Preference Validator
 * Coordinates all validation operations
 */
class PreferenceValidator {
  constructor() {
    this.existenceChecker = new ExistenceChecker();
    this.formatValidator = new FormatValidator();
    this.constraintValidator = new ConstraintValidator();

    this.validationStats = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: [],
    };
  }

  /**
     * Validate single preference
     * @param {string} preferenceName - Preference name
     * @param {any} value - Preference value
     * @param {string} dataType - Expected data type
     * @returns {Promise<Object>} Validation result
     */
  async validatePreference(preferenceName, value, dataType = 'string') {
    this.validationStats.total++;

    const result = {
      name: preferenceName,
      value,
      valid: true,
      errors: [],
    };

    try {
      // Check existence
      const exists = await this.existenceChecker.checkExists(preferenceName);
      if (!exists) {
        const error = new ExistenceError(preferenceName);
        result.errors.push(error);
        result.valid = false;
      }

      // Check format
      const formatError = this.formatValidator.getValidationError(preferenceName, value, dataType);
      if (formatError) {
        result.errors.push(formatError);
        result.valid = false;
      }

      // Check constraints
      const constraintError = this.constraintValidator.getConstraintError(preferenceName, value);
      if (constraintError) {
        result.errors.push(constraintError);
        result.valid = false;
      }

      if (result.valid) {
        this.validationStats.passed++;
      } else {
        this.validationStats.failed++;
        this.validationStats.errors.push(...result.errors);
      }

    } catch (error) {
      window.Logger.error(`❌ Validation error for ${preferenceName}:`, error, { page: 'preferences-validation' });
      result.errors.push(new ValidationErrorClass(`Validation failed: ${error.message}`, preferenceName));
      result.valid = false;
      this.validationStats.failed++;
      this.validationStats.errors.push(result.errors[result.errors.length - 1]);
    }

    return result;
  }

  /**
     * Validate multiple preferences
     * @param {Object} preferences - Preferences object
     * @param {Object} dataTypes - Data types mapping
     * @returns {Promise<Object>} Validation results
     */
  async validatePreferences(preferences, dataTypes = {}) {
    window.Logger.info(`🔍 Validating ${Object.keys(preferences, { page: 'preferences-validation' }).length} preferences...`);

    const results = {
      total: 0,
      valid: 0,
      invalid: 0,
      details: {},
    };

    for (const [name, value] of Object.entries(preferences)) {
      const dataType = dataTypes[name] || 'string';
      const result = await this.validatePreference(name, value, dataType);

      results.total++;
      if (result.valid) {
        results.valid++;
      } else {
        results.invalid++;
      }

      results.details[name] = result;
    }

    window.Logger.info(`✅ Validation complete: ${results.valid}/${results.total} valid`, { page: 'preferences-validation' });
    return results;
  }

  /**
     * Get validation statistics
     * @returns {Object} Validation stats
     */
  getValidationStats() {
    return {
      ...this.validationStats,
      successRate: this.validationStats.total > 0 ?
        Math.round(this.validationStats.passed / this.validationStats.total * 100) : 0,
    };
  }

  /**
     * Clear validation statistics
     */
  clearStats() {
    this.validationStats = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: [],
    };
  }

  /**
     * Get validation errors
     * @returns {Array<ValidationError>} Validation errors
     */
  getValidationErrors() {
    return this.validationStats.errors;
  }
}

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================

// Create global instance
window.PreferenceValidator = new PreferenceValidator();

// ============================================================================
// GLOBAL FUNCTIONS
// ============================================================================

/**
 * Validate single preference
 * @param {string} preferenceName - Preference name
 * @param {any} value - Preference value
 * @param {string} dataType - Expected data type
 */
window.validatePreference = async function(preferenceName, value, dataType = 'string') {
  return await window.PreferenceValidator.validatePreference(preferenceName, value, dataType);
};

/**
 * Validate multiple preferences
 * @param {Object} preferences - Preferences object
 * @param {Object} dataTypes - Data types mapping
 */
window.validatePreferences = async function(preferences, dataTypes = {}) {
  return await window.PreferenceValidator.validatePreferences(preferences, dataTypes);
};

/**
 * Get validation statistics
 */
window.getValidationStats = function() {
  return window.PreferenceValidator.getValidationStats();
};

/**
 * Clear validation statistics
 */
window.clearValidationStats = function() {
  return window.PreferenceValidator.clearStats();
};

// ============================================================================
// INITIALIZATION
// ============================================================================

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.Logger.info('📄 Preferences validation system ready', { page: 'preferences-validation' });
  });
} else {
  window.Logger.info('📄 Preferences validation system ready', { page: 'preferences-validation' });
}

if (window.Logger && window.Logger.info) {
  window.Logger.info('✅ preferences-validation.js loaded successfully', { page: 'preferences-validation' });
}

/**
 * System Management Data Validators - TikTrack
 * ============================================
 * 
 * Data validation and normalization utilities for system management sections
 * Provides validators for all data types used in system management
 * 
 * @version 1.0.0
 * @lastUpdated January 27, 2025
 * @author TikTrack Development Team
 */

class SMDataValidators {
  /**
   * Validate system overview data
   * אימות נתוני סקירת מערכת
   * @param {Object} data - System overview data
   * @returns {Object} Validation result with valid flag and normalized data
   */
  static validateSystemOverview(data) {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Invalid data structure' };
    }
    
    const required = ['timestamp', 'overall_status', 'system_score'];
    const missing = required.filter(key => !(key in data));
    
    if (missing.length > 0) {
      return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
    }
    
    return { valid: true, data: this.normalizeSystemOverview(data) };
  }
  
  /**
   * Normalize system overview data
   * נרמול נתוני סקירת מערכת
   * @param {Object} data - System overview data
   * @returns {Object} Normalized data
   */
  static normalizeSystemOverview(data) {
    return {
      ...data,
      system_score: Math.max(0, Math.min(100, data.system_score || 0)),
      response_time_ms: data.response_time_ms || 0,
      overall_status: data.overall_status || 'unknown',
      overall_performance: data.overall_performance || 'unknown',
      uptime: data.uptime || 'unknown',
      summary: {
        uptime: data.summary?.uptime || 'unknown',
        active_connections: data.summary?.active_connections || 0,
        memory_usage_percent: Math.max(0, Math.min(100, data.summary?.memory_usage_percent || 0)),
        cpu_usage_percent: Math.max(0, Math.min(100, data.summary?.cpu_usage_percent || 0)),
        disk_usage_percent: Math.max(0, Math.min(100, data.summary?.disk_usage_percent || 0))
      },
      health: data.health || {},
      metrics: data.metrics || {},
      timestamp: data.timestamp || new Date().toISOString()
    };
  }

  /**
   * Validate server status data
   * אימות נתוני סטטוס שרת
   * @param {Object} data - Server status data
   * @returns {Object} Validation result
   */
  static validateServerStatus(data) {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Invalid server status data structure' };
    }
    
    return { valid: true, data: this.normalizeServerStatus(data) };
  }
  
  /**
   * Normalize server status data
   * נרמול נתוני סטטוס שרת
   * @param {Object} data - Server status data
   * @returns {Object} Normalized data
   */
  static normalizeServerStatus(data) {
    return {
      ...data,
      server_mode: data.server_mode || {},
      overall_health: data.overall_health || {},
      timestamp: data.timestamp || new Date().toISOString()
    };
  }

  /**
   * Validate cache statistics data
   * אימות נתוני סטטיסטיקות מטמון
   * @param {Object} data - Cache statistics data
   * @returns {Object} Validation result
   */
  static validateCacheStats(data) {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Invalid cache statistics data structure' };
    }
    
    return { valid: true, data: this.normalizeCacheStats(data) };
  }
  
  /**
   * Normalize cache statistics data
   * נרמול נתוני סטטיסטיקות מטמון
   * @param {Object} data - Cache statistics data
   * @returns {Object} Normalized data
   */
  static normalizeCacheStats(data) {
    return {
      ...data,
      hit_rate: Math.max(0, Math.min(100, data.hit_rate || 0)),
      miss_rate: Math.max(0, Math.min(100, data.miss_rate || 0)),
      total_requests: Math.max(0, data.total_requests || 0),
      timestamp: data.timestamp || new Date().toISOString()
    };
  }

  /**
   * Validate performance data
   * אימות נתוני ביצועים
   * @param {Object} data - Performance data
   * @returns {Object} Validation result
   */
  static validatePerformanceData(data) {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Invalid performance data structure' };
    }
    
    return { valid: true, data: this.normalizePerformanceData(data) };
  }
  
  /**
   * Normalize performance data
   * נרמול נתוני ביצועים
   * @param {Object} data - Performance data
   * @returns {Object} Normalized data
   */
  static normalizePerformanceData(data) {
    return {
      ...data,
      overview: data.overview || null,
      metrics: data.metrics || null,
      performance: data.performance || null,
      timestamp: data.timestamp || new Date().toISOString()
    };
  }

  /**
   * Validate database data
   * אימות נתוני בסיס נתונים
   * @param {Object} data - Database data
   * @returns {Object} Validation result
   */
  static validateDatabaseData(data) {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Invalid database data structure' };
    }
    
    return { valid: true, data: this.normalizeDatabaseData(data) };
  }
  
  /**
   * Normalize database data
   * נרמול נתוני בסיס נתונים
   * @param {Object} data - Database data
   * @returns {Object} Normalized data
   */
  static normalizeDatabaseData(data) {
    return {
      ...data,
      status: data.status || 'unknown',
      size: Math.max(0, data.size || 0),
      tables: data.tables || [],
      timestamp: data.timestamp || new Date().toISOString()
    };
  }

  /**
   * Validate environment data
   * אימות נתוני סביבה
   * @param {Object} data - Environment data
   * @returns {Object} Validation result
   */
  static validateEnvironmentData(data) {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Invalid environment data structure' };
    }
    
    return { valid: true, data: this.normalizeEnvironmentData(data) };
  }
  
  /**
   * Normalize environment data
   * נרמול נתוני סביבה
   * @param {Object} data - Environment data
   * @returns {Object} Normalized data
   */
  static normalizeEnvironmentData(data) {
    return {
      ...data,
      environment: data.environment || 'development',
      port: data.port || 8080,
      database: {
        name: data.database?.name || 'unknown',
        host: data.database?.host || 'localhost',
        port: data.database?.port || 5432,
        type: data.database?.type || 'PostgreSQL'
      },
      timestamp: data.timestamp || new Date().toISOString()
    };
  }

  /**
   * Validate SMTP settings data
   * אימות נתוני הגדרות SMTP
   * @param {Object} data - SMTP settings data
   * @returns {Object} Validation result
   */
  static validateSMTPSettings(data) {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Invalid SMTP settings data structure' };
    }
    
    return { valid: true, data: this.normalizeSMTPSettings(data) };
  }
  
  /**
   * Normalize SMTP settings data
   * נרמול נתוני הגדרות SMTP
   * @param {Object} data - SMTP settings data
   * @returns {Object} Normalized data
   */
  static normalizeSMTPSettings(data) {
    return {
      ...data,
      smtp_host: data.smtp_host || '',
      smtp_port: Math.max(1, Math.min(65535, data.smtp_port || 587)),
      smtp_user: data.smtp_user || '',
      smtp_from_email: data.smtp_from_email || '',
      smtp_from_name: data.smtp_from_name || '',
      smtp_use_tls: data.smtp_use_tls !== false,
      smtp_enabled: data.smtp_enabled !== false,
      smtp_test_email: data.smtp_test_email || ''
    };
  }

  /**
   * Generic validator for any data
   * אימות כללי לכל סוג נתון
   * @param {*} data - Data to validate
   * @param {string} type - Data type
   * @returns {Object} Validation result
   */
  static validate(data, type) {
    switch (type) {
      case 'system_overview':
        return this.validateSystemOverview(data);
      case 'server_status':
        return this.validateServerStatus(data);
      case 'cache_stats':
        return this.validateCacheStats(data);
      case 'performance':
        return this.validatePerformanceData(data);
      case 'database':
        return this.validateDatabaseData(data);
      case 'environment':
        return this.validateEnvironmentData(data);
      case 'smtp_settings':
        return this.validateSMTPSettings(data);
      default:
        return { valid: true, data: data };
    }
  }
}

// Export for global access
window.SMDataValidators = SMDataValidators;





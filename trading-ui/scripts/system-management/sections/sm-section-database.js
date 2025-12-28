/**
 * System Management Database Section - TikTrack
 * =========================================
 * 
 * Database section for database management and monitoring
 * Shows database status, size, tables, and backup information
 * 
 * @version 1.0.0
 * @lastUpdated October 19, 2025
 * @author TikTrack Development Team
 */

class SMDatabaseSection extends SMBaseSection {
  constructor(sectionId, config) {
    super(sectionId, config);
    this.apiEndpoints = {
      overview: '/api/system/overview',
      database: '/api/system/database' // Use system database endpoint
    };
  }

  /**
   * Load database data from APIs
   * טעינת נתוני בסיס נתונים מה-APIs
   */
  async loadData() {
    try {
      this.isLoading = true;
      console.log(`🗄️ Loading database data from multiple endpoints`);

      // Load data from multiple endpoints in parallel
      const [overviewData, databaseData] = await Promise.allSettled([
        this.fetchSystemOverview(),
        this.fetchDatabaseInfo()
      ]);

      // Combine data from all sources
      const combinedData = {
        overview: overviewData.status === 'fulfilled' ? overviewData.value : null,
        database: databaseData.status === 'fulfilled' ? databaseData.value : null,
        timestamp: new Date().toISOString()
      };

      this.lastData = combinedData;
      this.render(combinedData);
      this.retryCount = 0; // Reset retry count on success

    } catch (error) {
      console.error('❌ Failed to load database data:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Fetch system overview
   * קבלת סקירת מערכת
   */
  async fetchSystemOverview() {
    try {
      const response = await this.fetchWithTimeout(this.apiEndpoints.overview, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.status === 'success' ? result.data : null;
    } catch (error) {
      console.warn('⚠️ Failed to fetch system overview:', error);
      return null;
    }
  }

  /**
   * Fetch database info
   * קבלת מידע בסיס נתונים
   */
  async fetchDatabaseInfo() {
    try {
      const response = await this.fetchWithTimeout(this.apiEndpoints.database, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.status === 'success' ? result.data : null;
    } catch (error) {
      console.warn('⚠️ Failed to fetch database info:', error);
      return null;
    }
  }

  /**
   * Render database data
   * הצגת נתוני בסיס נתונים
   */
  render(data) {
    if (!data || (!data.overview && !data.database)) {
      this.showEmptyState('אין נתוני בסיס נתונים זמינים');
      return;
    }

    try {
      const databaseHtml = this.createDatabaseHTML(data);
      this.container.textContent = '';
      const parser = new DOMParser();
      const doc = parser.parseFromString(databaseHtml, 'text/html');
      doc.body.childNodes.forEach(node => {
        this.container.appendChild(node.cloneNode(true));
      });
      
      console.log('✅ Database section rendered successfully');
      
    } catch (error) {
      console.error('❌ Failed to render database section:', error);
      this.handleError(error, {
        section: this.sectionId,
        action: 'render',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Create database HTML
   * יצירת HTML של בסיס נתונים
   */
  createDatabaseHTML(data) {
    const { overview, database } = data;
    // Use database data from API response
    const status = database || {};
    const info = database || {};

    return `
      <div class="database-overview">
        <!-- Database Status Cards -->
        <div class="row mb-4">
          <div class="col-md-3">
            ${this.createConnectionStatusCard(overview, status)}
          </div>
          <div class="col-md-3">
            ${this.createDatabaseSizeCard(overview, status, info)}
          </div>
          <div class="col-md-3">
            ${this.createTablesCountCard(overview, status, info)}
          </div>
          <div class="col-md-3">
            ${this.createBackupStatusCard(overview, status, info)}
          </div>
        </div>

        <!-- Database Information -->
        <div class="row mb-4">
          <div class="col-12">
            ${this.createDatabaseInfoCard(overview, status, info)}
          </div>
        </div>

        <!-- Database Operations -->
        <div class="row">
          <div class="col-12">
            ${this.createDatabaseOperationsCard(overview, status, info)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create connection status card
   * יצירת כרטיס סטטוס חיבור
   */
  createConnectionStatusCard(overview, status) {
    const connectionStatus = this.getConnectionStatus(overview, status);
    const statusColor = this.getConnectionStatusColor(connectionStatus);
    const statusText = this.getConnectionStatusText(connectionStatus);

    return `
      <div class="card database-connection-card">
        <div class="card-body text-center">
          <h5><i class="fas fa-database"></i> חיבור לבסיס נתונים</h5>
          
          <div class="connection-status">
            <div class="status-icon status-${statusColor}">
              <i class="fas fa-${this.getConnectionStatusIcon(connectionStatus)}"></i>
            </div>
            <div class="status-text">${statusText}</div>
          </div>
          
          <div class="connection-details">
            <div class="detail-item">
              <span class="detail-label">זמן חיבור:</span>
              <span class="detail-value">${this.getConnectionTime(overview, status)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">סטטוס:</span>
              <span class="detail-value">${connectionStatus}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create database size card
   * יצירת כרטיס גודל בסיס נתונים
   */
  createDatabaseSizeCard(overview, status, info) {
    const dbSize = this.getDatabaseSize(overview, status, info);
    const sizeFormatted = dbSize ? SMUIComponents.formatBytes(dbSize) : 'לא זמין';

    return `
      <div class="card database-size-card">
        <div class="card-body text-center">
          <h5><i class="fas fa-hdd"></i> גודל בסיס נתונים</h5>
          
          <div class="size-metric">
            <div class="metric-value text-primary">
              ${sizeFormatted}
            </div>
            <div class="metric-label">גודל כולל</div>
          </div>
          
          <div class="size-details">
            <div class="detail-item">
              <span class="detail-label">טבלאות:</span>
              <span class="detail-value">${this.getTablesCount(overview, status, info)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">רשומות:</span>
              <span class="detail-value">${this.getRecordsCount(overview, status, info)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create tables count card
   * יצירת כרטיס מספר טבלאות
   */
  createTablesCountCard(overview, status, info) {
    const tablesCount = this.getTablesCount(overview, status, info);
    const tablesList = this.getTablesList(overview, status, info);

    return `
      <div class="card database-tables-card">
        <div class="card-body text-center">
          <h5><i class="fas fa-table"></i> טבלאות</h5>
          
          <div class="tables-metric">
            <div class="metric-value text-info">
              ${tablesCount}
            </div>
            <div class="metric-label">מספר טבלאות</div>
          </div>
          
          <div class="tables-list">
            ${tablesList.slice(0, 5).map(table => `
              <div class="table-item">
                <i class="fas fa-table"></i>
                <span>${table.name}</span>
                <small class="text-muted">(${table.records || 0})</small>
              </div>
            `).join('')}
            
            ${tablesList.length > 5 ? `
              <div class="table-item text-muted">
                <i class="fas fa-ellipsis-h"></i>
                <span>ועוד ${tablesList.length - 5} טבלאות...</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create backup status card
   * יצירת כרטיס סטטוס גיבוי
   */
  createBackupStatusCard(overview, status, info) {
    const backupStatus = this.getBackupStatus(overview, status, info);
    const lastBackup = this.getLastBackupTime(overview, status, info);

    return `
      <div class="card database-backup-card">
        <div class="card-body text-center">
          <h5><i class="fas fa-shield-alt"></i> גיבוי</h5>
          
          <div class="backup-status">
            <div class="status-icon status-${this.getBackupStatusColor(backupStatus)}">
              <i class="fas fa-${this.getBackupStatusIcon(backupStatus)}"></i>
            </div>
            <div class="status-text">${backupStatus}</div>
          </div>
          
          <div class="backup-details">
            <div class="detail-item">
              <span class="detail-label">גיבוי אחרון:</span>
              <span class="detail-value">${lastBackup}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">סטטוס:</span>
              <span class="detail-value">${backupStatus}</span>
            </div>
          </div>
          
          <div class="backup-actions mt-3">
            <button class="btn btn-primary btn-sm" onclick="SMDatabaseSection.createBackup()">
              <i class="fas fa-save"></i> צור גיבוי
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create database info card
   * יצירת כרטיס מידע בסיס נתונים
   */
  createDatabaseInfoCard(overview, status, info) {
    const dbInfo = this.getDatabaseInfo(overview, status, info);

    return `
      <div class="card">
        <div class="card-header">
          <h5><i class="fas fa-info-circle"></i> מידע בסיס נתונים</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td><strong>סוג בסיס נתונים:</strong></td>
                    <td>${dbInfo.type}</td>
                  </tr>
                  <tr>
                    <td><strong>גרסה:</strong></td>
                    <td>${dbInfo.version}</td>
                  </tr>
                  <tr>
                    <td><strong>מיקום קובץ:</strong></td>
                    <td>${dbInfo.filePath}</td>
                  </tr>
                  <tr>
                    <td><strong>קידוד:</strong></td>
                    <td>${dbInfo.encoding}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="col-md-6">
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td><strong>זמן פעילות:</strong></td>
                    <td>${dbInfo.uptime}</td>
                  </tr>
                  <tr>
                    <td><strong>חיבורים פעילים:</strong></td>
                    <td>${dbInfo.activeConnections}</td>
                  </tr>
                  <tr>
                    <td><strong>שאילתות כולל:</strong></td>
                    <td>${dbInfo.totalQueries}</td>
                  </tr>
                  <tr>
                    <td><strong>זמן תגובה ממוצע:</strong></td>
                    <td>${dbInfo.avgResponseTime}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create database operations card
   * יצירת כרטיס פעולות בסיס נתונים
   */
  createDatabaseOperationsCard(overview, status, info) {
    return `
      <div class="card">
        <div class="card-header">
          <h5><i class="fas fa-tools"></i> פעולות בסיס נתונים</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <h6>פעולות גיבוי</h6>
              <div class="operation-buttons">
                <button class="btn btn-outline-primary btn-sm me-2 mb-2" onclick="SMDatabaseSection.createBackup()">
                  <i class="fas fa-save"></i> צור גיבוי
                </button>
                <button class="btn btn-outline-info btn-sm me-2 mb-2" onclick="SMDatabaseSection.listBackups()">
                  <i class="fas fa-list"></i> רשימת גיבויים
                </button>
                <button class="btn btn-outline-warning btn-sm me-2 mb-2" onclick="SMDatabaseSection.restoreBackup()">
                  <i class="fas fa-undo"></i> שחזר גיבוי
                </button>
              </div>
            </div>
            <div class="col-md-6">
              <h6>פעולות תחזוקה</h6>
              <div class="operation-buttons">
                <button class="btn btn-outline-secondary btn-sm me-2 mb-2" onclick="SMDatabaseSection.optimizeDatabase()">
                  <i class="fas fa-cogs"></i> אופטימיזציה
                </button>
                <button class="btn btn-outline-info btn-sm me-2 mb-2" onclick="SMDatabaseSection.checkIntegrity()">
                  <i class="fas fa-check-circle"></i> בדיקת תקינות
                </button>
                <button class="btn btn-outline-danger btn-sm me-2 mb-2" onclick="SMDatabaseSection.vacuumDatabase()">
                  <i class="fas fa-broom"></i> ניקוי
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get connection status
   * קבלת סטטוס חיבור
   */
  getConnectionStatus(overview, status) {
    if (overview && overview.database && overview.database.status) {
      return overview.database.status === 'healthy' ? 'connected' : 'disconnected';
    }
    
    if (status && status.connected !== undefined) {
      return status.connected ? 'connected' : 'disconnected';
    }
    
    return 'unknown';
  }

  /**
   * Get connection status color
   * קבלת צבע סטטוס חיבור
   */
  getConnectionStatusColor(status) {
    const colors = {
      'connected': 'success',
      'disconnected': 'danger',
      'unknown': 'secondary'
    };
    return colors[status] || 'secondary';
  }

  /**
   * Get connection status text
   * קבלת טקסט סטטוס חיבור
   */
  getConnectionStatusText(status) {
    const texts = {
      'connected': 'מחובר',
      'disconnected': 'לא מחובר',
      'unknown': 'לא ידוע'
    };
    return texts[status] || 'לא ידוע';
  }

  /**
   * Get connection status icon
   * קבלת אייקון סטטוס חיבור
   */
  getConnectionStatusIcon(status) {
    const icons = {
      'connected': 'check-circle',
      'disconnected': 'times-circle',
      'unknown': 'question-circle'
    };
    return icons[status] || 'question-circle';
  }

  /**
   * Get connection time
   * קבלת זמן חיבור
   */
  getConnectionTime(overview, status) {
    if (status && status.connection_time) {
      return status.connection_time;
    }
    
    if (overview && overview.database && overview.database.uptime) {
      return overview.database.uptime;
    }
    
    return 'לא זמין';
  }

  /**
   * Get database size
   * קבלת גודל בסיס נתונים
   */
  getDatabaseSize(overview, status, info) {
    // Try info first (from /api/system/database)
    if (info) {
      if (info.size_mb !== undefined) {
        return info.size_mb * 1024 * 1024; // Convert MB to bytes
      }
      if (info.size !== undefined) {
        return typeof info.size === 'number' ? info.size : null;
      }
    }
    
    // Try status
    if (status) {
      if (status.size_mb !== undefined) {
        return status.size_mb * 1024 * 1024;
      }
      if (status.size !== undefined) {
        return typeof status.size === 'number' ? status.size : null;
      }
    }
    
    // Try overview
    if (overview && overview.database) {
      if (overview.database.size_mb !== undefined) {
        return overview.database.size_mb * 1024 * 1024;
      }
      if (overview.database.size !== undefined) {
        return typeof overview.database.size === 'number' ? overview.database.size : null;
      }
    }
    
    return null;
  }

  /**
   * Get tables count
   * קבלת מספר טבלאות
   */
  getTablesCount(overview, status, info) {
    // Try info first (from /api/system/database)
    if (info) {
      if (info.table_count !== undefined) {
        return info.table_count;
      }
      if (info.tables_count !== undefined) {
        return info.tables_count;
      }
      if (info.tables && Array.isArray(info.tables)) {
        return info.tables.length;
      }
    }
    
    // Try status
    if (status) {
      if (status.table_count !== undefined) {
        return status.table_count;
      }
      if (status.tables_count !== undefined) {
        return status.tables_count;
      }
      if (status.tables && Array.isArray(status.tables)) {
        return status.tables.length;
      }
    }
    
    // Try overview
    if (overview && overview.database) {
      if (overview.database.table_count !== undefined) {
        return overview.database.table_count;
      }
      if (overview.database.tables_count !== undefined) {
        return overview.database.tables_count;
      }
      if (overview.database.tables && Array.isArray(overview.database.tables)) {
        return overview.database.tables.length;
      }
    }
    
    return 0;
  }

  /**
   * Get records count
   * קבלת מספר רשומות
   */
  getRecordsCount(overview, status, info) {
    if (info && info.total_records) {
      return info.total_records;
    }
    
    if (status && status.total_records) {
      return status.total_records;
    }
    
    if (overview && overview.database && overview.database.total_records) {
      return overview.database.total_records;
    }
    
    return 0;
  }

  /**
   * Get tables list
   * קבלת רשימת טבלאות
   */
  getTablesList(overview, status, info) {
    // Try info first (from /api/system/database)
    if (info && info.tables && Array.isArray(info.tables)) {
      return info.tables.map(table => ({
        name: table.name || table,
        records: info.record_counts?.[table.name || table] || table.records || 0
      }));
    }
    
    // Try status
    if (status && status.tables && Array.isArray(status.tables)) {
      return status.tables.map(table => ({
        name: table.name || table,
        records: status.record_counts?.[table.name || table] || table.records || 0
      }));
    }
    
    // Try overview
    if (overview && overview.database && overview.database.tables && Array.isArray(overview.database.tables)) {
      return overview.database.tables.map(table => ({
        name: table.name || table,
        records: overview.database.record_counts?.[table.name || table] || table.records || 0
      }));
    }
    
    return [];
  }

  /**
   * Get backup status
   * קבלת סטטוס גיבוי
   */
  getBackupStatus(overview, status, info) {
    if (info && info.backup_status) {
      return info.backup_status;
    }
    
    if (status && status.backup_status) {
      return status.backup_status;
    }
    
    if (overview && overview.database && overview.database.backup_status) {
      return overview.database.backup_status;
    }
    
    return 'unknown';
  }

  /**
   * Get last backup time
   * קבלת זמן גיבוי אחרון
   */
  getLastBackupTime(overview, status, info) {
    if (info && info.last_backup) {
      return info.last_backup;
    }
    
    if (status && status.last_backup) {
      return status.last_backup;
    }
    
    if (overview && overview.database && overview.database.last_backup) {
      return overview.database.last_backup;
    }
    
    return 'לא זמין';
  }

  /**
   * Get backup status color
   * קבלת צבע סטטוס גיבוי
   */
  getBackupStatusColor(status) {
    const colors = {
      'up_to_date': 'success',
      'outdated': 'warning',
      'failed': 'danger',
      'unknown': 'secondary'
    };
    return colors[status] || 'secondary';
  }

  /**
   * Get backup status icon
   * קבלת אייקון סטטוס גיבוי
   */
  getBackupStatusIcon(status) {
    const icons = {
      'up_to_date': 'check-circle',
      'outdated': 'exclamation-triangle',
      'failed': 'times-circle',
      'unknown': 'question-circle'
    };
    return icons[status] || 'question-circle';
  }

  /**
   * Get database info
   * קבלת מידע בסיס נתונים
   */
  getDatabaseInfo(overview, status, info) {
    return {
      type: info?.type || status?.type || overview?.database?.type || 'PostgreSQL',
      version: info?.version || status?.version || overview?.database?.version || 'לא זמין',
      filePath: info?.file_path || status?.file_path || overview?.database?.file_path || 'לא זמין',
      encoding: info?.encoding || status?.encoding || overview?.database?.encoding || 'UTF-8',
      uptime: info?.uptime || status?.uptime || overview?.database?.uptime || 'לא זמין',
      activeConnections: info?.active_connections || status?.active_connections || overview?.database?.active_connections || 0,
      totalQueries: info?.total_queries || status?.total_queries || overview?.database?.total_queries || 0,
      avgResponseTime: info?.avg_response_time ? SMUIComponents.formatDuration(info.avg_response_time) : 
                      status?.avg_response_time ? SMUIComponents.formatDuration(status.avg_response_time) : 
                      overview?.database?.avg_response_time ? SMUIComponents.formatDuration(overview.database.avg_response_time) : 'לא זמין'
    };
  }

  /**
   * Create backup (static method for global access)
   * יצירת גיבוי (מתודה סטטית לגישה גלובלית)
   */
  static async createBackup() {
    try {
      console.log('💾 Creating database backup...');
      
      const response = await fetch('/api/database/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        if (window.showNotification) {
          window.showNotification(result.message || 'גיבוי נוצר בהצלחה', 'success');
        }
        
        // Refresh database section
        const databaseSection = document.getElementById('sm-database');
        if (databaseSection) {
          const sectionInstance = window.systemManagementMain?.sections?.get('sm-database');
          if (sectionInstance) {
            await sectionInstance.refresh();
          }
        }
      } else {
        throw new Error(result.message || 'Failed to create backup');
      }
      
    } catch (error) {
      console.error('❌ Failed to create backup:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה ביצירת גיבוי: ${error.message}`, 'error');
      }
    }
  }

  /**
   * List backups (static method for global access)
   * רשימת גיבויים (מתודה סטטית לגישה גלובלית)
   */
  static async listBackups() {
    try {
      console.log('📋 Listing database backups...');
      
      const response = await fetch('/api/database/backups', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        // Show backups in a modal or alert
        const backups = result.data || [];
        const backupsList = backups.map(backup => 
          `${backup.name} - ${backup.created_at} (${SMUIComponents.formatBytes(backup.size)})`
        ).join('\n');
        
        if (window.showInfoNotification) {
          window.showInfoNotification(`רשימת גיבויים:\n${backupsList}`, 'info');
        } else {
          alert(`רשימת גיבויים:\n${backupsList}`);
        }
      } else {
        throw new Error(result.message || 'Failed to list backups');
      }
      
    } catch (error) {
      console.error('❌ Failed to list backups:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה ברשימת גיבויים: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Restore backup (static method for global access)
   * שחזור גיבוי (מתודה סטטית לגישה גלובלית)
   */
  static async restoreBackup() {
    try {
      console.log('🔄 Restoring database backup...');
      
      // This would typically show a modal to select backup file
      const backupName = prompt('הזן שם קובץ הגיבוי לשחזור:');
      if (!backupName) return;
      
      const response = await fetch('/api/database/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ backup_name: backupName })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        if (window.showNotification) {
          window.showNotification(result.message || 'גיבוי שוחזר בהצלחה', 'success');
        }
        
        // Refresh database section
        const databaseSection = document.getElementById('sm-database');
        if (databaseSection) {
          const sectionInstance = window.systemManagementMain?.sections?.get('sm-database');
          if (sectionInstance) {
            await sectionInstance.refresh();
          }
        }
      } else {
        throw new Error(result.message || 'Failed to restore backup');
      }
      
    } catch (error) {
      console.error('❌ Failed to restore backup:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה בשחזור גיבוי: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Optimize database (static method for global access)
   * אופטימיזציה של בסיס נתונים (מתודה סטטית לגישה גלובלית)
   */
  static async optimizeDatabase() {
    try {
      console.log('⚡ Optimizing database...');
      
      const response = await fetch('/api/database/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        if (window.showNotification) {
          window.showNotification(result.message || 'אופטימיזציה הושלמה בהצלחה', 'success');
        }
      } else {
        throw new Error(result.message || 'Failed to optimize database');
      }
      
    } catch (error) {
      console.error('❌ Failed to optimize database:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה באופטימיזציה: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Check integrity (static method for global access)
   * בדיקת תקינות (מתודה סטטית לגישה גלובלית)
   */
  static async checkIntegrity() {
    try {
      console.log('🔍 Checking database integrity...');
      
      const response = await fetch('/api/database/integrity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        if (window.showNotification) {
          window.showNotification(result.message || 'בדיקת תקינות הושלמה בהצלחה', 'success');
        }
      } else {
        throw new Error(result.message || 'Failed to check integrity');
      }
      
    } catch (error) {
      console.error('❌ Failed to check integrity:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה בבדיקת תקינות: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Vacuum database (static method for global access)
   * ניקוי בסיס נתונים (מתודה סטטית לגישה גלובלית)
   */
  static async vacuumDatabase() {
    try {
      console.log('🧹 Vacuuming database...');
      
      const response = await fetch('/api/database/vacuum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        if (window.showNotification) {
          window.showNotification(result.message || 'ניקוי הושלם בהצלחה', 'success');
        }
        
        // Refresh database section
        const databaseSection = document.getElementById('sm-database');
        if (databaseSection) {
          const sectionInstance = window.systemManagementMain?.sections?.get('sm-database');
          if (sectionInstance) {
            await sectionInstance.refresh();
          }
        }
      } else {
        throw new Error(result.message || 'Failed to vacuum database');
      }
      
    } catch (error) {
      console.error('❌ Failed to vacuum database:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה בניקוי: ${error.message}`, 'error');
      }
    }
  }
}

// Export for use in other modules
window.SMDatabaseSection = SMDatabaseSection;

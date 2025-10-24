# Logger Service - מפרט מלא

## סקירה

**מטרה:** מערכת logging מלאה עם Backend integration  
**זמן:** 1 שבוע  
**תוצאה:** Logger Service + Backend API + Database

---

## Frontend Logger Service

### Log Levels

```javascript
const LogLevel = {
  DEBUG: 0,    // Development debugging
  INFO: 1,     // General information
  WARN: 2,      // Warnings
  ERROR: 3      // Errors
};
```

### Core Logger Class

```javascript
class Logger {
  static currentLevel = LogLevel.INFO;
  static logs = [];
  static maxLogs = 1000;
  static batchSize = 10;
  static batchTimeout = 5000;
  static pendingLogs = [];
  static flushTimeout = null;

  /**
   * Main logging method
   * @param {number} level - Log level
   * @param {string} message - Log message
   * @param {object} context - Additional context
   */
  static log(level, message, context = {}) {
    if (level < this.currentLevel) return;

    const logEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: Object.keys(LogLevel)[level],
      message,
      context: this.sanitizeContext(context),
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      url: window.location.href,
      referrer: document.referrer
    };

    // Local storage
    this.addToLocalLogs(logEntry);

    // Console output
    this.outputToConsole(logEntry);

    // Send to server (for WARN and ERROR)
    if (level >= LogLevel.WARN) {
      this.queueForServer(logEntry);
    }

    // Save to localStorage for dashboard
    this.saveToLocalStorage(logEntry);
  }

  /**
   * Add to local logs array
   * @param {object} logEntry - Log entry
   */
  static addToLocalLogs(logEntry) {
    this.logs.push(logEntry);
    
    // Maintain max logs limit
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Output to browser console
   * @param {object} logEntry - Log entry
   */
  static outputToConsole(logEntry) {
    const consoleMethod = this.getConsoleMethod(logEntry.level);
    const formattedMessage = this.formatMessage(logEntry);
    
    console[consoleMethod](formattedMessage, logEntry.context);
  }

  /**
   * Queue log for server sending
   * @param {object} logEntry - Log entry
   */
  static queueForServer(logEntry) {
    this.pendingLogs.push(logEntry);

    // Send batch if full
    if (this.pendingLogs.length >= this.batchSize) {
      this.flushToServer();
    }

    // Set timeout for partial batch
    if (!this.flushTimeout) {
      this.flushTimeout = setTimeout(() => {
        this.flushToServer();
      }, this.batchTimeout);
    }
  }

  /**
   * Send logs to server
   */
  static async flushToServer() {
    if (this.pendingLogs.length === 0) return;

    const logsToSend = [...this.pendingLogs];
    this.pendingLogs = [];
    
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }

    try {
      const response = await fetch('/api/logs/batch', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ 
          logs: logsToSend,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = await response.json();
      Logger.debug('Logs sent to server', { 
        count: logsToSend.length,
        result 
      });

    } catch (error) {
      console.error('Failed to send logs to server:', error);
      
      // Re-queue logs on failure (with backoff)
      this.pendingLogs.unshift(...logsToSend);
      
      // Exponential backoff
      const delay = Math.min(30000, 1000 * Math.pow(2, this.retryCount || 0));
      setTimeout(() => this.flushToServer(), delay);
    }
  }
}
```

### Public API Methods

```javascript
class Logger {
  /**
   * Debug level logging
   * @param {string} message - Debug message
   * @param {object} context - Debug context
   */
  static debug(message, context = {}) {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Info level logging
   * @param {string} message - Info message
   * @param {object} context - Info context
   */
  static info(message, context = {}) {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Warning level logging
   * @param {string} message - Warning message
   * @param {object} context - Warning context
   */
  static warn(message, context = {}) {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Error level logging
   * @param {string} message - Error message
   * @param {Error} error - Error object
   * @param {object} context - Error context
   */
  static error(message, error = null, context = {}) {
    const errorContext = {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        fileName: error.fileName,
        lineNumber: error.lineNumber
      } : null
    };
    
    this.log(LogLevel.ERROR, message, errorContext);
  }

  /**
   * Performance logging
   * @param {string} operation - Operation name
   * @param {number} duration - Duration in ms
   * @param {object} context - Performance context
   */
  static performance(operation, duration, context = {}) {
    this.log(LogLevel.INFO, `Performance: ${operation}`, {
      ...context,
      duration,
      operation,
      type: 'performance'
    });
  }

  /**
   * User action logging
   * @param {string} action - User action
   * @param {object} context - Action context
   */
  static userAction(action, context = {}) {
    this.log(LogLevel.INFO, `User action: ${action}`, {
      ...context,
      action,
      type: 'user-action'
    });
  }
}
```

### Utility Methods

```javascript
class Logger {
  /**
   * Get logs with filters
   * @param {object} filters - Filter options
   * @returns {Array} - Filtered logs
   */
  static getLogs(filters = {}) {
    let logs = [...this.logs];
    
    if (filters.level) {
      logs = logs.filter(log => log.level === filters.level);
    }
    
    if (filters.page) {
      logs = logs.filter(log => log.page === filters.page);
    }
    
    if (filters.since) {
      const since = new Date(filters.since);
      logs = logs.filter(log => new Date(log.timestamp) >= since);
    }
    
    if (filters.userId) {
      logs = logs.filter(log => log.userId === filters.userId);
    }
    
    return logs;
  }

  /**
   * Clear local logs
   */
  static clearLogs() {
    this.logs = [];
    localStorage.removeItem('app-logs');
  }

  /**
   * Set log level
   * @param {number} level - New log level
   */
  static setLevel(level) {
    this.currentLevel = level;
    Logger.info('Log level changed', { level: Object.keys(LogLevel)[level] });
  }

  /**
   * Get current statistics
   * @returns {object} - Logger stats
   */
  static getStats() {
    const logs = this.getLogs();
    const stats = {
      total: logs.length,
      byLevel: {},
      byPage: {},
      errors: 0,
      warnings: 0
    };

    logs.forEach(log => {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      stats.byPage[log.page] = (stats.byPage[log.page] || 0) + 1;
      
      if (log.level === 'ERROR') stats.errors++;
      if (log.level === 'WARN') stats.warnings++;
    });

    return stats;
  }
}
```

---

## Backend API

### Database Model

```python
# Backend/models/log.py
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Log(Base):
    __tablename__ = 'logs'
    
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    level = Column(String(10), nullable=False)
    message = Column(Text, nullable=False)
    context = Column(JSON, nullable=True)
    page = Column(String(255), nullable=True)
    user_agent = Column(String(500), nullable=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    session_id = Column(String(100), nullable=True)
    url = Column(String(500), nullable=True)
    referrer = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat(),
            'level': self.level,
            'message': self.message,
            'context': self.context,
            'page': self.page,
            'user_agent': self.user_agent,
            'user_id': self.user_id,
            'session_id': self.session_id,
            'url': self.url,
            'referrer': self.referrer,
            'created_at': self.created_at.isoformat()
        }
```

### API Endpoints

```python
# Backend/routes/api/logs.py
from flask import Blueprint, request, jsonify
from models.log import Log
from config.database import db
from datetime import datetime, timedelta
import logging

logs_bp = Blueprint('logs', __name__, url_prefix='/api/logs')

@logs_bp.route('/batch', methods=['POST'])
def create_logs_batch():
    """
    Create multiple logs at once
    POST /api/logs/batch
    """
    try:
        data = request.get_json()
        logs = data.get('logs', [])
        
        if not logs:
            return jsonify({'error': 'No logs provided'}), 400
        
        # Validate logs
        for log_data in logs:
            if not all(k in log_data for k in ['timestamp', 'level', 'message']):
                return jsonify({'error': 'Invalid log format'}), 400
        
        # Create log entries
        log_objects = []
        for log_data in logs:
            log = Log(
                timestamp=datetime.fromisoformat(
                    log_data['timestamp'].replace('Z', '+00:00')
                ),
                level=log_data['level'],
                message=log_data['message'],
                context=log_data.get('context'),
                page=log_data.get('page'),
                user_agent=log_data.get('userAgent'),
                user_id=log_data.get('userId'),
                session_id=log_data.get('sessionId'),
                url=log_data.get('url'),
                referrer=log_data.get('referrer')
            )
            log_objects.append(log)
        
        # Bulk insert
        db.session.bulk_save_objects(log_objects)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'count': len(log_objects),
            'timestamp': datetime.utcnow().isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logging.error(f'Log batch creation failed: {str(e)}')
        return jsonify({'error': str(e)}), 500

@logs_bp.route('/', methods=['GET'])
def get_logs():
    """
    Get logs with filters
    GET /api/logs?level=ERROR&since=2025-01-24&limit=100
    """
    try:
        # Parse filters
        level = request.args.get('level')
        since = request.args.get('since')
        page = request.args.get('page')
        user_id = request.args.get('user_id')
        limit = int(request.args.get('limit', 100))
        offset = int(request.args.get('offset', 0))
        
        # Build query
        query = Log.query
        
        if level:
            query = query.filter_by(level=level)
        if since:
            since_date = datetime.fromisoformat(since)
            query = query.filter(Log.timestamp >= since_date)
        if page:
            query = query.filter_by(page=page)
        if user_id:
            query = query.filter_by(user_id=user_id)
        
        # Execute query
        total = query.count()
        logs = query.order_by(Log.timestamp.desc()).offset(offset).limit(limit).all()
        
        return jsonify({
            'success': True,
            'logs': [log.to_dict() for log in logs],
            'total': total,
            'count': len(logs),
            'offset': offset,
            'limit': limit
        }), 200
        
    except Exception as e:
        logging.error(f'Log retrieval failed: {str(e)}')
        return jsonify({'error': str(e)}), 500

@logs_bp.route('/stats', methods=['GET'])
def get_log_stats():
    """
    Get log statistics
    GET /api/logs/stats
    """
    try:
        since = request.args.get('since')
        if since:
            since_date = datetime.fromisoformat(since)
            logs = Log.query.filter(Log.timestamp >= since_date)
        else:
            logs = Log.query
        
        # Calculate stats
        total = logs.count()
        by_level = {}
        by_page = {}
        
        for log in logs.all():
            by_level[log.level] = by_level.get(log.level, 0) + 1
            by_page[log.page] = by_page.get(log.page, 0) + 1
        
        return jsonify({
            'success': True,
            'stats': {
                'total': total,
                'by_level': by_level,
                'by_page': by_page,
                'errors': by_level.get('ERROR', 0),
                'warnings': by_level.get('WARN', 0)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@logs_bp.route('/cleanup', methods=['POST'])
def cleanup_old_logs():
    """
    Delete logs older than X days
    POST /api/logs/cleanup
    """
    try:
        data = request.get_json()
        days = data.get('days', 30)
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        deleted = Log.query.filter(Log.timestamp < cutoff_date).delete()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'deleted': deleted,
            'cutoff_date': cutoff_date.isoformat()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
```

---

## Integration Examples

### Basic Usage

```javascript
// Simple logging
Logger.info('User logged in', { userId: 123 });
Logger.error('API call failed', error, { endpoint: '/api/trades' });

// Performance logging
const start = Date.now();
await fetchData();
Logger.performance('fetchData', Date.now() - start);

// User actions
Logger.userAction('button_click', { button: 'save', page: 'trades' });
```

### Advanced Usage

```javascript
// Get filtered logs
const errorLogs = Logger.getLogs({ level: 'ERROR', since: '2025-01-24' });
const pageLogs = Logger.getLogs({ page: '/trades.html' });

// Statistics
const stats = Logger.getStats();
console.log(`Total logs: ${stats.total}, Errors: ${stats.errors}`);

// Clear logs
Logger.clearLogs();
```

---

## Testing Plan

### Unit Tests (8 tests)
- [ ] Basic logging (all levels)
- [ ] Context sanitization
- [ ] Batch sending
- [ ] Error handling
- [ ] Log filtering
- [ ] Statistics calculation
- [ ] Performance logging
- [ ] User action logging

### Integration Tests (5 tests)
- [ ] Server communication
- [ ] Database storage
- [ ] Error recovery
- [ ] Batch processing
- [ ] Cleanup operations

---

## Performance Considerations

### Frontend
- Batch sending (10 logs per batch)
- Exponential backoff on failures
- Memory management (max 1000 logs)
- Background processing

### Backend
- Bulk insert operations
- Database indexing
- Automatic cleanup
- Rate limiting

/**
 * Real-time Notifications Client - TikTrack
 * =========================================
 *
 * WebSocket client for real-time notifications integration
 * with existing notification system
 *
 * Features:
 * - WebSocket connection management
 * - Event handling for real-time updates
 * - Integration with existing notification system
 * - Background tasks notifications
 * - Database change notifications
 * - External data update notifications
 *
 * Dependencies:
 * - notification-system.js (existing notification functions)
 * - socket.io-client library
 *
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated September 2, 2025
 */

class RealtimeNotificationsClient {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.serverUrl = window.location.origin;
    this.eventHandlers = new Map();
    this.connectionStats = {
      connectedAt: null,
      disconnectedAt: null,
      totalMessages: 0,
      lastMessageAt: null,
    };

    // Initialize
    this.init();
  }

  init() {
    try {
      // Check if Socket.IO is available
      if (typeof io === 'undefined') {
        console.warn('Socket.IO not available, loading from CDN...');
        this.loadSocketIO();
      } else {
        this.connect();
      }
    } catch (error) {
      console.error('Error initializing real-time notifications client:', error);
    }
  }

  loadSocketIO() {
    // Load Socket.IO from CDN if not available
    const script = document.createElement('script');
    script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
    script.onload = () => {
      console.log('Socket.IO loaded successfully');
      this.connect();
    };
    script.onerror = () => {
      console.error('Failed to load Socket.IO from CDN');
    };
    document.head.appendChild(script);
  }

  connect() {
    try {
      console.log('🔌 Connecting to WebSocket server...');

      // Create Socket.IO connection
      if (typeof io === 'undefined') {
        console.warn('Socket.IO not available, skipping connection');
        return;
      }
      
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      // Set up event handlers
      this.setupEventHandlers();

      console.log('✅ WebSocket connection established');

    } catch (error) {
      console.error('❌ Error connecting to WebSocket server:', error);
      this.scheduleReconnect();
    }
  }

  setupEventHandlers() {
    if (!this.socket) {return;}

    // Connection events
    this.socket.on('connect', () => {
      this.connected = true;
      this.connectionStats.connectedAt = new Date();
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;

      console.log('🔗 WebSocket connected');
      this.showConnectionStatus('connected');

      // Join user-specific room if user is logged in
      this.joinUserRoom();
    });

    this.socket.on('disconnect', reason => {
      this.connected = false;
      this.connectionStats.disconnectedAt = new Date();

      console.log('🔌 WebSocket disconnected:', reason);
      this.showConnectionStatus('disconnected');

      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', error => {
      console.error('❌ WebSocket connection error:', error);
      this.showConnectionStatus('error');
      this.scheduleReconnect();
    });

    this.socket.on('reconnect', attemptNumber => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
      this.showConnectionStatus('reconnected');
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ WebSocket reconnection failed');
      this.showConnectionStatus('failed');
    });

    // Real-time notification events
    this.setupNotificationEvents();

    // Custom events
    this.setupCustomEvents();
  }

  setupNotificationEvents() {
    if (!this.socket) {return;}

    // Background task events
    this.socket.on('background_task_started', data => {
      console.log('🚀 Background task started:', data);
      this.handleBackgroundTaskEvent('started', data);
    });

    this.socket.on('background_task_completed', data => {
      console.log('✅ Background task completed:', data);
      this.handleBackgroundTaskEvent('completed', data);
    });

    this.socket.on('background_task_failed', data => {
      console.log('❌ Background task failed:', data);
      this.handleBackgroundTaskEvent('failed', data);
    });

    // Database events
    this.socket.on('data_updated', data => {
      console.log('📊 Data updated:', data);
      this.handleDataEvent('updated', data);
    });

    this.socket.on('data_error', data => {
      console.log('❌ Data error:', data);
      this.handleDataEvent('error', data);
    });

    // External data events
    this.socket.on('external_data_update', data => {
      console.log('🌐 External data updated:', data);
      this.handleExternalDataEvent('updated', data);
    });

    this.socket.on('external_data_error', data => {
      console.log('❌ External data error:', data);
      this.handleExternalDataEvent('error', data);
    });

    // System events
    this.socket.on('connected', data => {
      console.log('🔗 Client connected to server:', data);
      this.handleSystemEvent('connected', data);
    });

    this.socket.on('room_joined', data => {
      console.log('🚪 Joined room:', data);
      this.handleSystemEvent('room_joined', data);
    });

    this.socket.on('room_left', data => {
      console.log('🚪 Left room:', data);
      this.handleSystemEvent('room_left', data);
    });
  }

  setupCustomEvents() {
    if (!this.socket) {return;}

    // Handle custom events from other parts of the system
    this.socket.onAny((eventName, ...args) => {
      if (!this.isSystemEvent(eventName)) {
        console.log(`📡 Custom event received: ${eventName}`, args);
        this.handleCustomEvent(eventName, args);
      }
    });
  }

  isSystemEvent(eventName) {
    const systemEvents = [
      'connect', 'disconnect', 'connect_error', 'reconnect', 'reconnect_failed',
      'background_task_started', 'background_task_completed', 'background_task_failed',
      'data_updated', 'data_error', 'external_data_update', 'external_data_error',
      'connected', 'room_joined', 'room_left',
    ];
    return systemEvents.includes(eventName);
  }

  // ===== EVENT HANDLERS =====

  handleBackgroundTaskEvent(type, data) {
    try {
      const taskName = data.task_name || 'Unknown Task';
      const taskId = data.task_id || 'unknown';
      const timestamp = data.timestamp || new Date().toISOString();

      switch (type) {
      case 'started':
        this.showInfoNotification(
          'משימה ברקע התחילה',
          `המשימה "${taskName}" התחילה לרוץ`,
          5000,
        );
        break;

      case 'completed':
        this.showSuccessNotification(
          'משימה ברקע הושלמה',
          `המשימה "${taskName}" הושלמה בהצלחה`,
          6000,
        );
        break;

      case 'failed':
        this.showErrorNotification(
          'שגיאה במשימה ברקע',
          `המשימה "${taskName}" נכשלה: ${data.error || 'שגיאה לא ידועה'}`,
          8000,
        );
        break;
      }

      // Update connection stats
      this.connectionStats.totalMessages++;
      this.connectionStats.lastMessageAt = new Date();

      // Emit custom event for other parts of the system
      this.emitCustomEvent('background_task_event', { type, data });

    } catch (error) {
      console.error('Error handling background task event:', error);
    }
  }

  handleDataEvent(type, data) {
    try {
      const table = data.table || 'Unknown Table';
      const operation = data.operation || 'Unknown Operation';

      switch (type) {
      case 'updated':
        this.showInfoNotification(
          'נתונים עודכנו',
          `${table} עודכן בהצלחה`,
          4000,
        );
        break;

      case 'error':
        this.showErrorNotification(
          'שגיאת נתונים',
          `שגיאה ב-${table}: ${data.error || 'שגיאה לא ידועה'}`,
          6000,
        );
        break;
      }

      // Update connection stats
      this.connectionStats.totalMessages++;
      this.connectionStats.lastMessageAt = new Date();

      // Emit custom event for other parts of the system
      this.emitCustomEvent('data_event', { type, data });

    } catch (error) {
      console.error('Error handling data event:', error);
    }
  }

  handleExternalDataEvent(type, data) {
    try {
      const provider = data.provider || 'Unknown Provider';

      switch (type) {
      case 'updated': {
        const tickerCount = data.ticker_count || 0;
        this.showSuccessNotification(
          'נתונים חיצוניים עודכנו',
          `${provider} עודכן: ${tickerCount} טיקרים`,
          5000,
        );
        break;
      }

      case 'error':
        this.showErrorNotification(
          'שגיאת נתונים חיצוניים',
          `${provider}: ${data.error || 'שגיאה לא ידועה'}`,
          6000,
        );
        break;
      }

      // Update connection stats
      this.connectionStats.totalMessages++;
      this.connectionStats.lastMessageAt = new Date();

      // Emit custom event for other parts of the system
      this.emitCustomEvent('external_data_event', { type, data });

    } catch (error) {
      console.error('Error handling external data event:', error);
    }
  }

  handleSystemEvent(type, data) {
    try {
      switch (type) {
      case 'connected':
        console.log('Successfully connected to server');
        break;

      case 'room_joined':
        console.log(`Joined room: ${data.room}`);
        break;

      case 'room_left':
        console.log(`Left room: ${data.room}`);
        break;
      }

    } catch (error) {
      console.error('Error handling system event:', error);
    }
  }

  handleCustomEvent(eventName, args) {
    try {
      // Emit custom event for other parts of the system
      this.emitCustomEvent('custom_event', { eventName, args });

    } catch (error) {
      console.error('Error handling custom event:', error);
    }
  }

  // ===== NOTIFICATION INTEGRATION =====

  showInfoNotification(title, message, duration = 4000) {
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification(title, message, duration);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification(message, 'info', title, duration);
    } else {
      console.log(`[INFO] ${title}: ${message}`);
    }
  }

  showSuccessNotification(title, message, duration = 5000) {
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification(title, message, duration);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification(message, 'success', title, duration);
    } else {
      console.log(`[SUCCESS] ${title}: ${message}`);
    }
  }

  showErrorNotification(title, message, duration = 6000) {
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification(title, message, duration);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification(message, 'error', title, duration);
    } else {
      console.log(`[ERROR] ${title}: ${message}`);
    }
  }

  showWarningNotification(title, message, duration = 5000) {
    if (typeof window.showWarningNotification === 'function') {
      window.showWarningNotification(title, message, duration);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification(message, 'warning', title, duration);
    } else {
      console.log(`[WARNING] ${title}: ${message}`);
    }
  }

  // ===== ROOM MANAGEMENT =====

  joinUserRoom() {
    // TODO: Implement user authentication and room joining - ראה: CENTRAL_TASKS_TODO.md (משימה 6)
    // For now, join a default room
    this.joinRoom('default');
  }

  joinRoom(roomName) {
    if (this.socket && this.connected) {
      this.socket.emit('join_room', { room: roomName });
      console.log(`🚪 Joining room: ${roomName}`);
    }
  }

  leaveRoom(roomName) {
    if (this.socket && this.connected) {
      this.socket.emit('leave_room', { room: roomName });
      console.log(`🚪 Leaving room: ${roomName}`);
    }
  }

  // ===== CUSTOM EVENTS =====

  emitCustomEvent(eventName, data) {
    // Create and dispatch custom event
    const customEvent = new CustomEvent('tiktrack_realtime_event', {
      detail: {
        eventName,
        data,
        timestamp: new Date().toISOString(),
      },
    });

    document.dispatchEvent(customEvent);
  }

  // ===== UTILITY METHODS =====

  showConnectionStatus(status) {
    const statusMessages = {
      'connected': '🔗 מחובר לשרת בזמן אמת',
      'disconnected': '🔌 מנותק מהשרת',
      'error': '❌ שגיאת חיבור',
      'reconnected': '🔄 התחבר מחדש',
      'failed': '❌ נכשל בהתחברות מחדש',
    };

    const message = statusMessages[status] || 'מצב חיבור לא ידוע';

    if (status === 'connected' || status === 'reconnected') {
      this.showSuccessNotification('חיבור WebSocket', message, 3000);
    } else if (status === 'error' || status === 'failed') {
      this.showErrorNotification('שגיאת WebSocket', message, 5000);
    } else {
      this.showWarningNotification('מצב WebSocket', message, 4000);
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Max 30 seconds

      console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts} in ${this.reconnectDelay}ms`);

      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.connected = false;
      console.log('🔌 WebSocket disconnected manually');
    }
  }

  getConnectionStats() {
    return {
      ...this.connectionStats,
      connected: this.connected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // ===== PUBLIC API =====

  isConnected() {
    return this.connected;
  }

  sendMessage(event, data) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
      return true;
    }
    return false;
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

// ===== GLOBAL INSTANCE =====

// Create global instance
window.realtimeNotificationsClient = new RealtimeNotificationsClient();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RealtimeNotificationsClient;
}

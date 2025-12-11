# Server Documentation

## 📋 Overview

This directory contains all server-related documentation for the TikTrack system, including configuration, deployment, and troubleshooting guides.

## 📁 Contents

### ⚙️ **Configuration**

- **[CONFIGURATIONS.md](CONFIGURATIONS.md)** - Server configuration settings and options
- **[GUIDELINES.md](GUIDELINES.md)** - Development guidelines for server code

### 🚀 **Deployment**

- **[README_SERVER_STABILITY.md](README_SERVER_STABILITY.md)** - Server stability guide and best practices

### 🔧 **Troubleshooting**

- **[ISSUES.md](ISSUES.md)** - Known server issues and solutions
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Troubleshooting guide for common problems

### 📋 **Project Status**

- **[PROJECT_STATUS_SUMMARY.md](../../PROJECT_STATUS_SUMMARY.md)** - Complete project status and progress summary

## 🖥️ Server Architecture

### Technology Stack ✅ **ENHANCED**

- **Framework**: Flask (Python) עם שיפורי ביצועים מתקדמים
- **WSGI Server**: Flask development server עם Connection Pool
- **Database**: SQLite עם 24 אינדקסים ו-Query Optimization
- **Static Files**: Served directly by Flask
- **API**: RESTful API with JSON responses ו-Rate Limiting
- **Performance**: Cache System, Metrics Collection, Health Checks
- **Security**: Response Headers, Error Handling, Background Tasks

### Server Components ✅ **ENHANCED**

- **Main Application**: `Backend/app.py` עם שיפורי ביצועים
- **API Routes**: `Backend/routes/` עם Rate Limiting (23+ blueprints)
- **Services**: `Backend/services/` עם Cache, Health, Metrics, Background Tasks
- **Models**: `Backend/models/` עם Query Optimization
- **Database**: `simpleTrade_new.db` עם Connection Pool ו-Indexes
- **Utils**: `Backend/utils/` עם Performance Monitor, Error Handlers
- **Config**: `Backend/config/` עם Logging מתקדם

### **Complex Startup Process**

The server requires significant initialization time due to:

- **Database Initialization** - Connection pool setup, table creation
- **Blueprint Registration** - 23+ API route blueprints
- **Background Services** - Task scheduler, data refresh scheduler
- **External Data Integration** - Yahoo Finance connector
- **Real-time Notifications** - WebSocket services
- **Performance Monitoring** - Metrics collection, health checks
- **Cache System** - Advanced cache service initialization

**Typical Startup Time**: 10-30 seconds for full initialization

## 🚀 Server Management

### 🆕 **Cursor Tasks Integration System (Current - December 2024)**

TikTrack now uses a modern Cursor Tasks integration system for server management:

#### **🎮 Cursor Tasks (Recommended Method)**

```bash
# In Cursor IDE:
Cmd+Shift+P → "Tasks: Run Task" → Select task
```

**Available Tasks**:

- **🔄 Restart Server (Quick)** - Fast server restart
- **🔄 Restart & Open Dashboard** - Restart + open management dashboard
- **🚀 Quick: Development Mode Setup** - Development mode + dashboard
- **🚀 Quick: Start & Open Dashboard** - Start server + monitoring
- **🛑 Stop Server** - Stop server
- **📊 Server Status** - Check server status

#### **🌐 Web Dashboard Management**

- **Server Monitor**: `http://localhost:8080/server-monitor`
- **System Management**: `http://localhost:8080/system-management`

**Dashboard Features**:

- **Quick Actions**: Start, Restart, Stop, Status
- **Cache Mode Control**: Development, No Cache, Production, Preserve
- **Real-time Monitoring**: Server status, uptime, memory usage
- **API Integration**: Direct API calls for server management

#### **🔗 API Endpoints**

```bash
# Server Management
POST /api/server/restart          # Restart server
POST /api/server/start            # Start server
POST /api/server/stop             # Stop server
POST /api/server/change-mode      # Change cache mode

# Health & Status
GET /api/system/health            # Basic health check
GET /api/system/health/detailed   # Detailed health status
```

#### **Cache Modes**

- **development**: TTL 10 seconds (fast development)
- **no-cache**: Cache disabled (immediate updates)
- **production**: TTL 5 minutes (performance)
- **preserve**: Keep current cache state (default)

### **Legacy Script System (Deprecated)**
>
> ⚠️ **Note**: The old restart script system has been replaced by Cursor Tasks integration for better IDE integration and reliability.

### Legacy Server Management

#### **Complete Server Restart (Legacy)**

```bash
./restart_server_complete.sh
```

- **Complete server shutdown and restart**
- **Automatic error detection and fixing**
- **Comprehensive logging and monitoring**
- **Cache and temporary files cleanup**
- **Health checks and validation**
- **Retry logic with up to 10 attempts**
- **Port: 8080**

#### Development Mode (Port 8080)

```bash
./start_server.sh
```

- **Environment Detection**: Automatically detects from workspace directory name
  - `TikTrackApp` → Development (port 8080)
  - `TikTrackApp-Production` → Production (port 5001)
- Uses Flask development server
- Hot reload enabled
- Debug mode active
- Port: **8080**

#### Production Mode (Port 5001)

```bash
./start_server.sh
```

- **Environment Detection**: Automatically detects from workspace directory name
  - `TikTrackApp-Production` → Production (port 5001)
  - `TikTrackApp` → Development (port 8080)
- Uses Flask development server
- Optimized for production
- Better stability and performance
- Port: **5001**
- Can override with: `./start_server.sh --env production`

### Server Health Check

```bash
python3 Backend/server_health_check.py
```

## ⚙️ Configuration Options

### Environment Variables

- **FLASK_ENV**: development/production
- **FLASK_DEBUG**: true/false
- **DATABASE_URL**: SQLite database path

### Server Settings

- **Host**: 127.0.0.1 (localhost)
- **Port**:
  - **Development**: 8080 (workspace: `TikTrackApp`)
  - **Production**: 5001 (workspace: `TikTrackApp-Production`)
- **Environment Detection**: Automatic by workspace directory name
- **Threads**: 4 (production)
- **Timeout**: 30 seconds

## 🔍 Monitoring and Logging ✅ **ENHANCED**

### Log Files

- **Server Logs**: `logs/app.log` (580KB)
- **Error Logs**: `logs/errors.log` (132KB)
- **Performance Logs**: `logs/performance.log` (452KB)
- **Database Logs**: `logs/database.log` (452KB)
- **Access Logs**: Console output

### Health Monitoring ✅ **ADVANCED**

- **Health Check**: `/api/health` - בדיקה בסיסית
- **Detailed Health**: `/api/health/detailed` - בדיקה מפורטת
- **Metrics Collection**: `/api/metrics/collect` - איסוף מדדי ביצועים
- **Cache Monitoring**: `/api/cache/stats` - ניטור cache
- **Rate Limiting**: `/api/rate-limits/stats` - ניטור מגבלות
- **Database Analysis**: `/api/database/analyze` - ניתוח בסיס נתונים
- **Background Tasks**: `/api/tasks/status` - ניטור משימות רקע

## ⚠️ Common Issues

### Script Hanging

- **Problem**: Restart scripts appear to hang during startup
- **Root Cause**: Server takes 10-30 seconds to fully initialize
- **Solution**: Scripts now use longer timeouts, but may still need adjustment

### Port Conflicts

- Check if port 8080 is in use: `lsof -i :8080`
- Kill existing processes if necessary
- Use complete restart for thorough cleanup

### Database Locks

- SQLite database locks can occur
- Complete restart removes WAL/SHM files
- Check for long-running transactions

### Cache Mode Issues

- Cache modes may not be fully synchronized
- Use `--cache-mode=no-cache` for debugging
- Check server cache status: `curl -s http://localhost:8080/api/cache/status`

### Memory Issues

- Monitor memory usage
- Restart server periodically
- Check for memory leaks

## 🔧 Maintenance

### Regular Tasks

- Monitor log files
- Check server performance
- Update dependencies
- Backup database

### Performance Optimization ✅ **IMPLEMENTED**

- **Connection Pool**: QueuePool עם 30 חיבורים במקביל
- **Database Indexes**: 24 אינדקסים לשיפור ביצועים
- **Query Optimization**: QueryOptimizer עם lazy loading
- **Cache System**: In-memory caching עם TTL
- **Response Headers**: אופטימיזציה לביצועי דפדפן
- **Background Tasks**: תחזוקה אוטומטית
- **Metrics Collection**: ניטור ביצועים מתקדם

## 🔗 Related Documentation

- [Database Documentation](../database/README.md)
- [Development Guidelines](../development/README.md)
- [Backend Documentation](../backend/README.md)

---

**Last Updated:** September 1, 2025  
**Version:** 2.0.2  
**Maintainer:** TikTrack Development Team

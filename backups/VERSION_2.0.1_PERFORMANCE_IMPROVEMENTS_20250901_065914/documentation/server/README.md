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

### Technology Stack
- **Framework**: Flask (Python)
- **WSGI Server**: Flask development server
- **Database**: SQLite
- **Static Files**: Served directly by Flask
- **API**: RESTful API with JSON responses

### Server Components
- **Main Application**: `Backend/app.py`
- **API Routes**: `Backend/routes/`
- **Services**: `Backend/services/`
- **Models**: `Backend/models/`
- **Database**: `simpleTrade_new.db`

## 🚀 Server Management

### 🆕 **Unified Server Restart System (Recommended)**

TikTrack now includes a sophisticated unified restart system with multiple modes:

#### **Smart Auto Mode (Default)**
```bash
./restart
```
- **Intelligent mode detection** based on system health
- **Automatic problem diagnosis** and mode selection
- **Memory usage analysis** and error pattern recognition
- **Database lock detection** and automatic cleanup

#### **Quick Restart Mode**
```bash
./restart quick
```
- **Fast restart** (5-10 seconds)
- **Development and testing** scenarios
- **Basic health checks** and port cleanup
- **Minimal logging** and resource usage

#### **Complete Restart Mode**
```bash
./restart complete
```
- **Comprehensive restart** (30-60 seconds)
- **Production and troubleshooting** scenarios
- **Complete system analysis** and validation
- **Route validation** (23+ endpoints)
- **Automatic problem fixing** and recovery

#### **Interactive Mode**
```bash
./restart --interactive
```
- **User choice** with detailed menu
- **Mode comparison** and recommendations
- **System status** display

#### **Additional Options**
```bash
./restart --help         # Show all options
./restart --status       # Show system status
./restart --info         # Show mode information
./restart --verbose      # Detailed output
```

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

#### Development Mode
```bash
./start_dev.sh
```
- Uses Flask development server
- Hot reload enabled
- Debug mode active
- Port: 8080

#### Production Mode
```bash
./start_server.sh
```
- Uses Flask development server
- Optimized for production
- Better stability and performance
- Port: 8080

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
- **Port**: 8080
- **Threads**: 4 (production)
- **Timeout**: 30 seconds

## 🔍 Monitoring and Logging

### Log Files
- **Server Logs**: `logs/server.log`
- **Error Logs**: `logs/error.log`
- **Access Logs**: Console output

### Health Monitoring
- Built-in health check endpoint: `/health`
- Server status monitoring scripts
- Automatic restart capabilities

## ⚠️ Common Issues

### Port Conflicts
- Check if port 8080 is in use
- Use different port if needed
- Kill existing processes if necessary

### Database Locks
- SQLite database locks can occur
- Restart server to resolve
- Check for long-running transactions

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

### Performance Optimization
- Use production WSGI server
- Enable gzip compression
- Optimize database queries
- Monitor response times

## 🔗 Related Documentation
- [Database Documentation](../database/README.md)
- [Development Guidelines](../development/README.md)
- [Backend Documentation](../backend/README.md)

---

**Last Updated:** August 22, 2025  
**Maintainer:** TikTrack Development Team

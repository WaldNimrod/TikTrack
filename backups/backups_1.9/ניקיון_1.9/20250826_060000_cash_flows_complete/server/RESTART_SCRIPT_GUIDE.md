# TikTrack Complete Server Restart Script Guide
# =============================================

## 🎯 Overview

The `restart_server_complete.sh` script is a comprehensive server management tool that performs a complete server restart with automatic error detection, fixing, and validation. It's designed to solve complex server issues that regular restart methods cannot handle.

## 🚀 Features

### ✅ **Complete Server Shutdown**
- Stops all Python server processes
- Kills processes using port 8080
- Removes database locks (WAL/SHM files)
- Ensures complete cleanup

### 🔧 **Automatic Error Detection & Fixing**
- Detects missing Python packages and installs them
- Identifies port conflicts and resolves them
- Handles virtual environment issues
- Cleans cache and temporary files

### 📊 **Comprehensive Logging**
- Colored output with timestamps
- Detailed logs saved to `server_detailed.log`
- Error analysis and reporting
- Performance metrics

### 🏥 **Health Monitoring**
- Multiple health checks (6 rounds)
- Tests main page, API endpoints, and database connectivity
- Calculates success rate
- Validates server functionality

### 🔄 **Retry Logic**
- Up to 10 retry attempts
- Configurable delay between attempts
- Automatic problem resolution
- Graceful failure handling

## 📋 Usage

### Basic Usage
```bash
./restart_server_complete.sh
```

### What Happens
1. **System Resource Check** - Memory, disk, Python version
2. **Dependency Validation** - Required files and directories
3. **Complete Shutdown** - Stop all server processes
4. **Database Cleanup** - Remove locks and verify accessibility
5. **Cache Cleanup** - Remove temporary files and cache
6. **Environment Setup** - Activate virtual environment
7. **Package Installation** - Install missing packages automatically
8. **Server Startup** - Start server with detailed logging
9. **Health Validation** - Perform comprehensive health checks
10. **Final Analysis** - Analyze logs and provide summary

## ⚙️ Configuration

### Environment Variables
```bash
SERVER_PORT=8080              # Server port
SERVER_HOST="127.0.0.1"       # Server host
MAX_RETRY_ATTEMPTS=10         # Maximum retry attempts
RETRY_DELAY=3                 # Delay between retries (seconds)
MAX_STARTUP_TIME=30           # Maximum server startup time
HEALTH_CHECK_INTERVAL=5       # Interval between health checks
MAX_HEALTH_CHECKS=6           # Number of health check rounds
```

### Log Files
- **Detailed Log**: `server_detailed.log`
- **Error Log**: `logs/errors.log`
- **App Log**: `logs/app.log`

## 🔧 Automatic Fixes

### Package Management
- **Missing Packages**: Automatically installs required Python packages
- **Virtual Environment**: Recreates corrupted virtual environments
- **Dependencies**: Validates and fixes missing dependencies

### Process Management
- **Port Conflicts**: Kills processes using port 8080
- **Python Processes**: Stops all Python server processes
- **Database Locks**: Removes WAL/SHM files

### Cache Cleanup
- **Python Cache**: Removes `__pycache__` directories and `.pyc` files
- **Flask Cache**: Cleans session and cache files
- **System Files**: Removes `.DS_Store` and `Thumbs.db`
- **Log Files**: Removes old log files (7+ days)
- **Upload Temp**: Cleans temporary upload files

## 📊 Health Checks

### What's Tested
1. **Main Page**: `GET /` (HTTP 200)
2. **API Health**: `GET /api/health` (HTTP 200)
3. **Database**: `GET /api/v1/accounts/` (HTTP 200)

### Success Criteria
- **Minimum Success Rate**: 80% (15/18 checks)
- **Response Time**: < 5 seconds per check
- **HTTP Status**: 200 OK for all endpoints

## 🚨 Error Handling

### Retry Logic
- **Maximum Attempts**: 10
- **Delay Between Attempts**: 3 seconds
- **Automatic Fixes**: Applied before each retry
- **Graceful Exit**: After maximum attempts reached

### Error Types Handled
- **Dependency Issues**: Missing files, directories, packages
- **Process Conflicts**: Port conflicts, hanging processes
- **Database Issues**: Locks, accessibility problems
- **Environment Issues**: Virtual environment corruption
- **Startup Failures**: Server startup problems
- **Health Issues**: Server not responding properly

## 📈 Performance Metrics

### Timing Information
- **Total Startup Time**: Measured and reported
- **Individual Step Timing**: Logged for each step
- **Health Check Timing**: Response times tracked
- **Retry Attempts**: Counted and reported

### Resource Monitoring
- **Memory Usage**: Monitored and warned if high (>90%)
- **Disk Usage**: Checked for available space
- **Process Count**: Validated no conflicting processes
- **Database Size**: Monitored and logged

## 🔍 Troubleshooting

### Common Issues

#### High Memory Usage
```
[WARNING] High memory usage detected (97%)
```
**Solution**: The script continues but warns about potential performance issues.

#### Missing Packages
```
[WARNING] Missing Python packages: flask-cors
[INFO] Attempting to install missing packages automatically...
```
**Solution**: Automatically installs missing packages.

#### Port Conflicts
```
[INFO] Found processes using port 8080: 95318
[INFO] Sending SIGTERM to port processes...
```
**Solution**: Automatically kills conflicting processes.

#### Database Locks
```
[INFO] Found WAL file, removing database lock
[INFO] Found SHM file, removing database lock
```
**Solution**: Automatically removes database lock files.

### Manual Troubleshooting

#### Check Server Status
```bash
lsof -i :8080
```

#### View Detailed Logs
```bash
tail -f server_detailed.log
```

#### Check Error Logs
```bash
tail -f logs/errors.log
```

#### Manual Server Start
```bash
cd Backend && python3 dev_server.py
```

## 📝 Log Analysis

### Success Indicators
- ✅ All health checks passed (100% success rate)
- ✅ Server started successfully
- ✅ No startup issues found
- ✅ All required packages available

### Warning Indicators
- ⚠️ High memory usage
- ⚠️ Some health checks failed (but above 80%)
- ⚠️ Recent errors in logs (but not blocking)

### Error Indicators
- ❌ Maximum retries reached
- ❌ Server startup failed
- ❌ Health checks below 80%
- ❌ Critical dependency issues

## 🎯 Best Practices

### When to Use
- **After code changes** that aren't loading
- **When server is unresponsive** to regular restarts
- **After system updates** or package installations
- **When experiencing cache issues**
- **For production deployments**

### When Not to Use
- **For simple code changes** (use `./start_dev.sh`)
- **During active development** (use auto-reload)
- **For quick testing** (use manual server start)

### Maintenance
- **Regular Log Review**: Check `server_detailed.log` periodically
- **Cleanup**: Remove old log files manually if needed
- **Monitoring**: Watch for repeated failures
- **Updates**: Keep script updated with new fixes

## 🔗 Related Documentation

- **[README.md](README.md)** - General server documentation
- **[CONFIGURATIONS.md](CONFIGURATIONS.md)** - Server configuration options
- **[README_SERVER_STABILITY.md](README_SERVER_STABILITY.md)** - Stability guidelines
- **[GUIDELINES.md](GUIDELINES.md)** - Development guidelines

## 📞 Support

### Getting Help
1. **Check Logs**: Review `server_detailed.log` for detailed information
2. **Run Manual**: Try manual server start for comparison
3. **Check Dependencies**: Verify Python packages and environment
4. **Review Configuration**: Check server settings and ports

### Reporting Issues
When reporting issues, include:
- **Script Output**: Full console output
- **Log Files**: Relevant sections from `server_detailed.log`
- **System Info**: Python version, OS, memory usage
- **Steps to Reproduce**: What led to the issue

---

**Last Updated**: August 22, 2025  
**Version**: 1.0  
**Maintainer**: TikTrack Development Team


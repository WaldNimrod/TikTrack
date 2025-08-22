# TikTrack Complete Server Restart Script

## 🚀 Quick Start

```bash
./restart_server_complete.sh
```

## 🎯 What It Does

This script performs a **complete server restart** with automatic error detection and fixing:

- ✅ **Stops all server processes** completely
- 🧹 **Cleans cache and temporary files**
- 🔧 **Fixes common issues automatically**
- 📊 **Performs health checks**
- 🔄 **Retries up to 10 times** if needed
- 📝 **Provides detailed logging**

## 📖 Full Documentation

For complete documentation, see:
- **[RESTART_SCRIPT_GUIDE.md](documentation/server/RESTART_SCRIPT_GUIDE.md)** - Comprehensive guide
- **[Server README.md](documentation/server/README.md)** - Server documentation

## 🆚 When to Use

### ✅ **Use This Script When:**
- Code changes aren't loading
- Server is unresponsive
- After system updates
- Cache issues
- Production deployments

### ❌ **Don't Use For:**
- Simple code changes (use `./start_dev.sh`)
- Active development (use auto-reload)
- Quick testing (use manual start)

## 📊 Output

The script provides:
- **Colored console output** with timestamps
- **Detailed logs** in `server_detailed.log`
- **Performance metrics** and timing
- **Health check results**
- **Troubleshooting tips**

## 🔗 Quick Links

- **Server URL**: http://127.0.0.1:8080
- **Detailed Log**: `server_detailed.log`
- **Error Log**: `logs/errors.log`

---

**Version**: 1.0 (August 22, 2025)  
**Maintainer**: TikTrack Development Team


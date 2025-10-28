# LLM Server Management Guide
# ===========================
# Quick reference guide for AI developers working with TikTrack server

**Purpose:** Quick reference for AI developers and automated systems  
**Target:** LLM assistants, automated scripts, CI/CD systems  
**Last Updated:** October 2025

---

## 🚀 **Quick Start Commands**

### **Start Server (Recommended)**
```bash
./start_server.sh
```

### **Check for Conflicts Only**
```bash
./start_server.sh --check-only
```

### **Force Start (Dangerous - Not Recommended)**
```bash
./start_server.sh --force
```

---

## ❌ **What NOT to Do**

### **NEVER run these commands:**
```bash
# ❌ WRONG - Don't run directly
python3 Backend/app.py

# ❌ WRONG - Don't use old scripts
python3 Backend/dev_server.py
python3 Backend/dev_server_optimized.py
./restart-bg.sh
```

### **Why these are wrong:**
- No process conflict detection
- Can create multiple server instances
- No error handling
- No logging integration

---

## 🔍 **Troubleshooting Common Issues**

### **Issue: "Port 8080 already in use"**
**Solution:**
1. Check for existing processes:
   ```bash
   ./start_server.sh --check-only
   ```
2. If conflicts found, kill existing process:
   ```bash
   kill [PID]
   ```
3. Start server again:
   ```bash
   ./start_server.sh
   ```

### **Issue: "Server won't start"**
**Solution:**
1. Check Python installation:
   ```bash
   python3 --version
   ```
2. Check file permissions:
   ```bash
   ls -la start_server.sh
   chmod +x start_server.sh
   ```
3. Check for file conflicts:
   ```bash
   ./start_server.sh --check-only
   ```

### **Issue: "Permission denied"**
**Solution:**
```bash
chmod +x start_server.sh
chmod +x Backend/utils/server_lock_manager.py
```

---

## 📊 **Server Status Commands**

### **Check if server is running:**
```bash
lsof -i :8080
```

### **Find TikTrack processes:**
```bash
ps aux | grep -E "(app\.py|tiktrack)" | grep -v grep
```

### **Check server logs:**
```bash
tail -f Backend/logs/app.log
```

---

## 🛠️ **Development Workflow**

### **Normal Development Cycle:**
1. **Start server:**
   ```bash
   ./start_server.sh
   ```
2. **Make code changes**
3. **Stop server:** `Ctrl+C`
4. **Restart server:**
   ```bash
   ./start_server.sh
   ```

### **If you see conflicts:**
1. **Check what's running:**
   ```bash
   ./start_server.sh --check-only
   ```
2. **Kill conflicting process:**
   ```bash
   kill [PID]
   ```
3. **Start fresh:**
   ```bash
   ./start_server.sh
   ```

---

## 📝 **Logging and Monitoring**

### **Log Files Location:**
- **Main logs:** `Backend/logs/app.log`
- **Error logs:** `Backend/logs/errors.log`
- **Server management:** `Backend/logs/server.log`

### **Monitor logs in real-time:**
```bash
# All logs
tail -f Backend/logs/app.log

# Errors only
tail -f Backend/logs/errors.log

# Server management
tail -f Backend/logs/server.log
```

---

## ⚡ **Quick Reference**

| Action | Command |
|--------|---------|
| Start server | `./start_server.sh` |
| Check conflicts | `./start_server.sh --check-only` |
| Force start | `./start_server.sh --force` |
| Stop server | `Ctrl+C` |
| Check port | `lsof -i :8080` |
| Find processes | `ps aux \| grep app.py` |
| View logs | `tail -f Backend/logs/app.log` |

---

## 🚨 **Emergency Procedures**

### **If server is completely stuck:**
1. **Find all Python processes:**
   ```bash
   ps aux | grep python
   ```
2. **Kill TikTrack processes:**
   ```bash
   kill -9 [PID]
   ```
3. **Verify port is free:**
   ```bash
   lsof -i :8080
   ```
4. **Start fresh:**
   ```bash
   ./start_server.sh
   ```

### **If startup script fails:**
1. **Check Python:**
   ```bash
   python3 --version
   ```
2. **Check files exist:**
   ```bash
   ls -la start_server.sh Backend/app.py Backend/utils/server_lock_manager.py
   ```
3. **Check permissions:**
   ```bash
   chmod +x start_server.sh
   ```

---

## 📋 **Checklist for AI Developers**

### **Before starting server:**
- [ ] Use `./start_server.sh` (not direct Python)
- [ ] Check for existing processes first
- [ ] Ensure Python3 is available
- [ ] Verify file permissions

### **If conflicts detected:**
- [ ] Read the error message carefully
- [ ] Note the PID of conflicting process
- [ ] Kill the conflicting process
- [ ] Try starting again

### **After server starts:**
- [ ] Verify server is accessible at `http://127.0.0.1:8080`
- [ ] Check logs for any errors
- [ ] Monitor for multiple processes

---

## 💡 **Best Practices**

1. **Always use the startup script** - Never run Python directly
2. **Check for conflicts first** - Use `--check-only` flag
3. **Read error messages** - They contain specific guidance
4. **Monitor logs** - Check for errors and warnings
5. **Clean shutdown** - Use Ctrl+C, not kill -9
6. **One server at a time** - Never run multiple instances

---

## 🔗 **Related Documentation**

- **Full Guide:** `documentation/server/SERVER_MANAGEMENT_GUIDE.md`
- **Restart Guide:** `documentation/server/RESTART_SCRIPT_GUIDE.md`
- **Cursor Rules:** `.cursorrules` (Server Management Rules section)

# Production Startup Script Update Guide
# =======================================
# מדריך עדכון סקריפט ההפעלה של הפרודקשן

**גרסה:** 1.0  
**תאריך:** נובמבר 2025

---

## 📋 **סקירה כללית**

מדריך זה מפרט את השינויים הנדרשים בסקריפט ההפעלה של הפרודקשן (`start_server.sh`) כדי לתמוך ב-PostgreSQL.

---

## 🔧 **שינויים נדרשים**

### **שלב 1: הוספת פונקציות**

הוסף את הפונקציות הבאות לסקריפט שלך (אחרי `check_python()`):

```bash
setup_postgresql_env() {
    # Only set PostgreSQL env vars if not already set and in production mode
    if [ "$ENVIRONMENT" = "production" ]; then
        if [ -z "$POSTGRES_HOST" ]; then
            log_info "Setting PostgreSQL environment variables (production defaults)..."
            export POSTGRES_HOST=localhost
            export POSTGRES_DB=TikTrack-db-production
            export POSTGRES_USER=TikTrakDBAdmin
            export POSTGRES_PASSWORD="BigMeZoo1974!?"
            log_success "PostgreSQL environment variables configured"
        else
            log_info "PostgreSQL environment variables already set (using existing values)"
        fi
    fi
}

check_postgresql_container() {
    # Only check in production mode when using PostgreSQL
    if [ "$ENVIRONMENT" = "production" ] && [ -n "$POSTGRES_HOST" ]; then
        log_header "Checking PostgreSQL container..."
        
        if ! command -v docker &> /dev/null; then
            log_warning "Docker not found - skipping PostgreSQL container check"
            return 0
        fi
        
        if docker ps --format '{{.Names}}' | grep -q 'tiktrack-postgres-dev'; then
            local container_status=$(docker ps --filter "name=tiktrack-postgres-dev" --format '{{.Status}}')
            log_success "PostgreSQL container is running: $container_status"
            
            # Check if container is healthy
            if echo "$container_status" | grep -q 'healthy'; then
                log_success "PostgreSQL container is healthy"
            else
                log_warning "PostgreSQL container is running but not yet healthy"
                log_info "Waiting for container to become healthy..."
                local attempts=0
                local max_attempts=30
                while [ $attempts -lt $max_attempts ]; do
                    if docker ps --filter "name=tiktrack-postgres-dev" --format '{{.Status}}' | grep -q 'healthy'; then
                        log_success "PostgreSQL container is now healthy"
                        return 0
                    fi
                    sleep 1
                    attempts=$((attempts + 1))
                done
                log_warning "PostgreSQL container did not become healthy within $max_attempts seconds"
                log_warning "Server will start anyway, but database connection may fail"
            fi
        else
            log_warning "PostgreSQL container 'tiktrack-postgres-dev' is not running"
            log_info "To start it, run: docker-compose -f docker/docker-compose.dev.yml up -d postgres-dev"
            log_warning "Server will start anyway, but database connection will fail"
        fi
    fi
}
```

### **שלב 2: קריאה לפונקציות**

בפונקציה `main()`, אחרי `check_files()` ולפני `check_conflicts()`, הוסף:

```bash
# Setup PostgreSQL environment variables (production mode)
setup_postgresql_env

# Check PostgreSQL container (production mode with PostgreSQL)
check_postgresql_container
```

### **שלב 3: עדכון start_server()**

בפונקציה `start_server()`, עדכן את החלק שמציג מידע על בסיס הנתונים:

```bash
# Display database information
if [ "$ENVIRONMENT" = "production" ] && [ -n "$POSTGRES_HOST" ]; then
    log_info "Database: PostgreSQL"
    log_info "  Host: ${POSTGRES_HOST}"
    log_info "  Database: ${POSTGRES_DB}"
    log_info "  User: ${POSTGRES_USER}"
elif [ -n "$DB_PATH" ]; then
    log_info "Database: SQLite ($(basename "$DB_PATH"))"
fi
```

---

## 📝 **דוגמה מלאה**

ראה `scripts/db/production_start_server_template.sh` לדוגמה מלאה של השינויים.

---

## ✅ **בדיקה**

אחרי העדכון, בדוק:

1. **הפעל את השרת:**
   ```bash
   ./start_server.sh
   ```

2. **ודא שמשתני הסביבה מוגדרים:**
   ```bash
   # השרת אמור להציג:
   # [INFO] Setting PostgreSQL environment variables (production defaults)...
   # [SUCCESS] PostgreSQL environment variables configured
   ```

3. **ודא שה-container נבדק:**
   ```bash
   # השרת אמור להציג:
   # Checking PostgreSQL container...
   # [SUCCESS] PostgreSQL container is running: Up X minutes (healthy)
   ```

4. **בדוק חיבור לבסיס הנתונים:**
   ```bash
   curl http://localhost:5001/api/system/health
   ```

---

## 🔄 **Rollback**

אם צריך לחזור ל-SQLite:

1. הסר את הקריאות ל-`setup_postgresql_env()` ו-`check_postgresql_container()`
2. הסר את משתני הסביבה של PostgreSQL
3. השרת יחזור להשתמש ב-SQLite

---

**תאריך עדכון אחרון:** נובמבר 2025  
**גרסה:** 1.0



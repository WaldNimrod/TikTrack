# שמות וזיהוי סביבות - TikTrack

**תאריך:** ינואר 2025  
**גרסה:** 1.0  
**מטרה:** הגדרה ברורה של שמות וזיהוי 3 הסביבות

---

## 📋 טבלת זיהוי סביבות

| סביבה | שם תיקייה | משתנה סביבה | פורט | Database | תיקיית קוד |
|-------|-----------|--------------|------|----------|------------|
| **Development** | `TikTrackApp` | `development` | 8080 | `TikTrack-db-development` | `Backend/` |
| **Testing** | `TikTrackApp-Production` | `testing` | 5001 | `TikTrack-db-testing` | `production/Backend/` |
| **Online** | `TikTrackApp-Online` | `online` | 80/443 | `TikTrack-db-online` | `online/Backend/` |

---

## 🔍 זיהוי לפי שם תיקייה

### לוגיקה נוכחית (לפני שינויים)
```bash
# start_server.sh
if [[ "$workspace_name" == *"Production"* ]]; then
    echo "production"  # פורט 5001
elif [[ "$workspace_name" == "TikTrackApp" ]]; then
    echo "development"  # פורט 8080
fi
```

### לוגיקה חדשה (אחרי שינויים)
```bash
# start_server.sh
if [[ "$workspace_name" == *"Online"* ]]; then
    echo "online"  # פורט 80/443
elif [[ "$workspace_name" == *"Production"* ]]; then
    echo "testing"  # פורט 5001 (שינוי מ-production)
elif [[ "$workspace_name" == "TikTrackApp" ]]; then
    echo "development"  # פורט 8080
else
    echo "development"  # default
fi
```

---

## 🔄 זיהוי לפי משתנה סביבה

### משתנה סביבה: `TIKTRACK_ENV`

**ערכים אפשריים:**
- `development` → Development
- `testing` → Testing
- `online` → Online

**שימוש:**
```bash
# Development
export TIKTRACK_ENV=development
./start_server.sh

# Testing
export TIKTRACK_ENV=testing
./start_server.sh

# Online
export TIKTRACK_ENV=online
./start_server.sh
```

---

## 📝 שמות Databases

### לפני השינויים
- `TikTrack-db-development` ✅ נשאר
- `TikTrack-db-production` ⚠️ ישתנה

### אחרי השינויים
- `TikTrack-db-development` ✅ נשאר
- `TikTrack-db-testing` ⚠️ שינוי מ-production
- `TikTrack-db-online` ⚠️ חדש

---

## 🏷️ שמות סביבות בקוד

### משתנים בקוד
```python
# Backend/config/settings.py
ENVIRONMENT = os.getenv("TIKTRACK_ENV", "development").lower()
IS_PRODUCTION = ENVIRONMENT == "production"  # ישתנה
IS_TESTING = ENVIRONMENT == "testing"        # חדש
IS_ONLINE = ENVIRONMENT == "online"          # חדש
```

### אחרי השינויים
```python
# Development
ENVIRONMENT = "development"
IS_PRODUCTION = False
IS_TESTING = False
IS_ONLINE = False

# Testing
ENVIRONMENT = "testing"
IS_PRODUCTION = False  # שינוי מ-True
IS_TESTING = True      # חדש
IS_ONLINE = False

# Online
ENVIRONMENT = "online"
IS_PRODUCTION = False
IS_TESTING = False
IS_ONLINE = True  # חדש
```

---

## 🔗 מיפוי סביבות

### Development
- **תיקייה:** `TikTrackApp/`
- **זיהוי:** `TikTrackApp` → `development`
- **פורט:** 8080
- **Database:** `TikTrack-db-development`
- **Config:** `Backend/config/settings.py`

### Testing
- **תיקייה:** `TikTrackApp-Production/`
- **זיהוי:** `TikTrackApp-Production` → `testing`
- **פורט:** 5001
- **Database:** `TikTrack-db-testing`
- **Config:** `production/Backend/config/settings.py`

### Online
- **תיקייה:** `TikTrackApp-Online/` (על השרת)
- **זיהוי:** `TikTrackApp-Online` → `online` או `TIKTRACK_ENV=online`
- **פורט:** 80/443 (דרך Nginx)
- **Database:** `TikTrack-db-online`
- **Config:** `online/Backend/config/settings.py`

---

## ✅ כללי שמות

### Databases
- **פורמט:** `TikTrack-db-{environment}`
- **דוגמאות:**
  - `TikTrack-db-development`
  - `TikTrack-db-testing`
  - `TikTrack-db-online`

### Environment Variables
- **פורמט:** `TIKTRACK_ENV={environment}`
- **ערכים:** `development`, `testing`, `online`

### Directory Names
- **פורמט:** `TikTrackApp-{Environment}`
- **דוגמאות:**
  - `TikTrackApp` (development)
  - `TikTrackApp-Production` (testing)
  - `TikTrackApp-Online` (online)

---

**עודכן:** ינואר 2025  
**גרסה:** 1.0


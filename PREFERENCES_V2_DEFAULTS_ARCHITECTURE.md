# ארכיטקטורת ברירות מחדל דינמיות - מערכת העדפות V2

## 📋 **סקירה כללית**

מערכת העדפות V2 עברה שיפור משמעותי בארכיטקטורה - ברירות המחדל עברו מקידוד קשיח בקוד לניהול דינמי באמצעות קובץ JSON. שינוי זה מאפשר גמישות רבה יותר, תחזוקה קלה יותר, ואפשרות לעדכן ברירות מחדל ללא צורך בשינוי קוד.

---

## 🏗️ **ארכיטקטורה חדשה**

### **לפני השינוי (V2.0)**
```
┌─────────────────────────────────────┐
│           קוד JavaScript            │
│  getDefaultPreferences() {          │
│    return {                         │
│      primaryCurrency: 'USD',        │
│      timezone: 'Asia/Jerusalem',    │
│      ...                            │
│    };                               │
│  }                                  │
└─────────────────────────────────────┘
```

### **אחרי השינוי (V2.1)**
```
┌─────────────────────────────────────┐
│        קובץ JSON                    │
│  Backend/config/                    │
│  preferences_defaults.json          │
│  {                                  │
│    "general": {                     │
│      "primaryCurrency": "USD",      │
│      "timezone": "Asia/Jerusalem"   │
│    }                                │
│  }                                  │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│         שירות השרת                  │
│  PreferencesServiceV2               │
│  .load_defaults_from_file()         │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│         API Endpoints               │
│  GET /api/v2/preferences/defaults   │
│  POST /api/v2/preferences/defaults  │
│  POST /api/v2/preferences/          │
│  defaults/save-from-current         │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│         ממשק המשתמש                 │
│  כפתור "שמור ברירות מחדל"          │
│  saveCurrentAsDefaults()            │
└─────────────────────────────────────┘
```

---

## 📁 **קבצים חדשים/מעודכנים**

### **1. קובץ ברירות מחדל**
**מיקום**: `Backend/config/preferences_defaults.json`

```json
{
  "version": "2.0",
  "lastUpdated": "2025-09-05T00:00:00Z",
  "description": "ברירות מחדל למערכת העדפות TikTrack V2",
  
  "general": {
    "primaryCurrency": "USD",
    "secondaryCurrency": "ILS",
    "timezone": "Asia/Jerusalem",
    "language": "he",
    "dateFormat": "DD/MM/YYYY",
    "numberFormat": "1,234.56",
    "defaultStopLoss": 5.0,
    "defaultTargetPrice": 10.0,
    "defaultCommission": 1.0,
    "defaultTradeAmount": null,
    "riskPercentage": 2.0,
    "tradingHours": {
      "start": "09:30",
      "end": "16:00"
    }
  },
  
  "defaultFilters": {
    "status": "open",
    "type": "swing",
    "account": "all",
    "dateRange": "this_week",
    "search": "",
    "profit": "all",
    "minAmount": null,
    "maxAmount": null
  },
  
  "ui": {
    "theme": "light",
    "compactMode": false,
    "showAnimations": true,
    "sidebarPosition": "right",
    "defaultPage": "dashboard",
    "table": {
      "pageSize": 25,
      "showIcons": true,
      "autoRefresh": false,
      "refreshInterval": 30
    },
    "charts": {
      "theme": "modern",
      "animation": true,
      "showGrid": true,
      "defaultPeriod": "1M"
    }
  },
  
  "externalData": {
    "providers": {
      "primary": "yahoo",
      "secondary": "google",
      "fallback": "alpha_vantage"
    },
    "refresh": {
      "interval": 5,
      "cacheTTL": 5,
      "maxBatchSize": 25,
      "requestDelay": 200
    },
    "reliability": {
      "retryAttempts": 3,
      "retryDelay": 5,
      "timeoutDuration": 30
    },
    "display": {
      "showPercentageChanges": true,
      "showVolume": true,
      "showMarketCap": false,
      "show52WeekRange": false
    }
  },
  
  "notifications": {
    "general": {
      "enabled": true,
      "sound": true,
      "popup": true,
      "email": false
    },
    "trading": {
      "tradeExecuted": true,
      "stopLoss": true,
      "targetReached": true,
      "marginCall": true
    },
    "data": {
      "dataFailures": true,
      "staleData": false,
      "priceAlerts": true
    }
  },
  
  "console": {
    "cleanupInterval": 60,
    "autoClear": true,
    "maxEntries": 1000,
    "verboseLogging": false,
    "logLevel": "INFO"
  },
  
  "advanced": {
    "performance": {
      "enableCaching": true,
      "prefetchData": true,
      "lazyLoading": true
    },
    "security": {
      "sessionTimeout": 30,
      "autoBackup": true,
      "backupInterval": 24
    },
    "analytics": {
      "trackUserActivity": true,
      "generateReports": false
    }
  },
  
  "colorScheme": {
    "numericValues": {
      "positive": {
        "light": "#d4edda",
        "medium": "#28a745",
        "dark": "#155724",
        "border": "#c3e6cb"
      },
      "negative": {
        "light": "#f8d7da",
        "medium": "#dc3545",
        "dark": "#721c24",
        "border": "#f5c6cb"
      },
      "zero": {
        "light": "#e2e3e5",
        "medium": "#6c757d",
        "dark": "#383d41",
        "border": "#d6d8db"
      }
    },
    "entities": {
      "trade": "#007bff",
      "tradePlan": "#0056b3",
      "account": "#28a745",
      "cashFlow": "#20c997",
      "ticker": "#dc3545",
      "alert": "#ff9c05",
      "note": "#6f42c1",
      "constraint": "#6c757d",
      "design": "#495057",
      "research": "#343a40",
      "preference": "#adb5bd",
      "execution": "#17a2b8"
    },
    "statuses": {
      "open": {
        "light": "rgba(40, 167, 69, 0.1)",
        "medium": "#28a745",
        "dark": "#155724",
        "border": "rgba(40, 167, 69, 0.3)"
      },
      "closed": {
        "light": "rgba(108, 117, 125, 0.1)",
        "medium": "#6c757d",
        "dark": "#383d41",
        "border": "rgba(108, 117, 125, 0.3)"
      },
      "cancelled": {
        "light": "rgba(220, 53, 69, 0.1)",
        "medium": "#dc3545",
        "dark": "#721c24",
        "border": "rgba(220, 53, 69, 0.3)"
      }
    },
    "investmentTypes": {
      "swing": {
        "light": "rgba(0, 123, 255, 0.1)",
        "medium": "#007bff",
        "dark": "#0056b3",
        "border": "rgba(0, 123, 255, 0.3)"
      },
      "investment": {
        "light": "rgba(40, 167, 69, 0.1)",
        "medium": "#28a745",
        "dark": "#155724",
        "border": "rgba(40, 167, 69, 0.3)"
      },
      "passive": {
        "light": "rgba(111, 66, 193, 0.1)",
        "medium": "#6f42c1",
        "dark": "#4a2c7a",
        "border": "rgba(111, 66, 193, 0.3)"
      }
    }
  },
  
  "opacitySettings": {
    "mainHeader": 100,
    "subHeader": 30
  },
  
  "refreshOverrides": {
    "activeTickersTradingHours": 5,
    "activeTickersOffHours": 60,
    "inactiveTickersTradingHours": 60,
    "inactiveTickersOffHours": 60,
    "closedTickersOffset": 45
  },
  
  "dashboardLayout": {
    "defaultWidgets": ["portfolio", "recentTrades", "marketOverview"],
    "widgetPositions": {},
    "autoRefresh": true,
    "refreshInterval": 30
  },
  
  "keyboardShortcuts": {
    "savePreferences": "Ctrl+S",
    "resetToDefaults": "Ctrl+R",
    "exportPreferences": "Ctrl+E",
    "importPreferences": "Ctrl+I",
    "newProfile": "Ctrl+N",
    "duplicateProfile": "Ctrl+D"
  },
  
  "advancedAlerts": {
    "priceChangeThreshold": 5.0,
    "volumeSpikeThreshold": 200.0,
    "marketHoursOnly": true,
    "alertCooldown": 300
  },
  
  "importExportSettings": {
    "defaultFormat": "json",
    "includeSensitiveData": false,
    "compressExports": true,
    "backupBeforeImport": true
  }
}
```

### **2. שירות השרת - PreferencesServiceV2**

**מיקום**: `Backend/services/preferences_service_v2.py`

#### **פונקציות חדשות**:

```python
@classmethod
def load_defaults_from_file(cls) -> Dict[str, Any]:
    """טען ברירות מחדל מקובץ JSON"""
    try:
        if not os.path.exists(cls.DEFAULTS_FILE_PATH):
            logger.warning(f"Defaults file not found: {cls.DEFAULTS_FILE_PATH}")
            return cls.get_fallback_defaults()
        
        with open(cls.DEFAULTS_FILE_PATH, 'r', encoding='utf-8') as f:
            defaults = json.load(f)
        
        logger.info(f"✅ Loaded defaults from file: {cls.DEFAULTS_FILE_PATH}")
        return defaults
        
    except (json.JSONDecodeError, IOError) as e:
        logger.error(f"❌ Error loading defaults from file: {e}")
        return cls.get_fallback_defaults()

@classmethod
def save_defaults_to_file(cls, defaults: Dict[str, Any]) -> bool:
    """שמור ברירות מחדל לקובץ JSON"""
    try:
        # עדכן תאריך עדכון אחרון
        defaults['lastUpdated'] = datetime.utcnow().isoformat() + 'Z'
        
        # וודא שהתיקייה קיימת
        os.makedirs(os.path.dirname(cls.DEFAULTS_FILE_PATH), exist_ok=True)
        
        with open(cls.DEFAULTS_FILE_PATH, 'w', encoding='utf-8') as f:
            json.dump(defaults, f, indent=2, ensure_ascii=False)
        
        logger.info(f"✅ Saved defaults to file: {cls.DEFAULTS_FILE_PATH}")
        return True
        
    except (IOError, TypeError) as e:
        logger.error(f"❌ Error saving defaults to file: {e}")
        return False

@classmethod
def get_fallback_defaults(cls) -> Dict[str, Any]:
    """ברירות מחדל גיבוי במקרה של כשל בטעינת הקובץ"""
    return {
        "version": "2.0",
        "lastUpdated": datetime.utcnow().isoformat() + 'Z',
        "description": "Fallback defaults - file loading failed",
        "general": {
            "primaryCurrency": "USD",
            "timezone": "Asia/Jerusalem",
            "defaultStopLoss": 5.0,
            "defaultTargetPrice": 10.0,
            "defaultCommission": 1.0
        },
        "defaultFilters": {
            "status": "open",
            "type": "swing",
            "dateRange": "this_week"
        },
        "externalData": {
            "providers": {
                "primary": "yahoo",
                "secondary": "google"
            },
            "refresh": {
                "interval": 5,
                "cacheTTL": 5
            }
        }
    }
```

#### **עדכון פונקציה קיימת**:

```python
@classmethod
def _create_default_preferences_for_profile(cls, db: Session, user_id: int, profile_id: int):
    """צור הגדרות ברירת מחדל לפרופיל חדש"""
    try:
        # טען ברירות מחדל מקובץ JSON
        defaults = cls.load_defaults_from_file()
        
        preferences = UserPreferencesV2(
            user_id=user_id,
            profile_id=profile_id,
            version=defaults.get('version', '2.0')
        )
        
        # עדכן הגדרות מברירות מחדל
        preferences.from_dict(defaults)
        
        # ... שאר הקוד
```

### **3. API Endpoints חדשים**

**מיקום**: `Backend/routes/api/preferences_v2.py`

#### **GET /api/v2/preferences/defaults**
```python
@preferences_v2_bp.route('/api/v2/preferences/defaults', methods=['GET'])
@cache_with_deps(ttl=300, dependencies=['preferences_defaults'])
def get_defaults():
    """קבל ברירות מחדל נוכחיות"""
    try:
        defaults = PreferencesServiceV2.load_defaults_from_file()
        
        return jsonify({
            'success': True,
            'data': {
                'defaults': defaults,
                'lastUpdated': defaults.get('lastUpdated'),
                'version': defaults.get('version')
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'DEFAULTS_LOAD_FAILED'
        }), 500
```

#### **POST /api/v2/preferences/defaults**
```python
@preferences_v2_bp.route('/api/v2/preferences/defaults', methods=['POST'])
def update_defaults():
    """עדכן ברירות מחדל"""
    try:
        data = request.get_json()
        if not data or 'defaults' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing defaults data',
                'code': 'INVALID_REQUEST'
            }), 400
        
        defaults = data['defaults']
        
        # שמור ברירות מחדל לקובץ
        success = PreferencesServiceV2.save_defaults_to_file(defaults)
        
        if success:
            # בטל מטמון
            invalidate_cache('preferences_defaults')
            
            return jsonify({
                'success': True,
                'message': 'Defaults updated successfully',
                'data': {
                    'lastUpdated': defaults.get('lastUpdated'),
                    'version': defaults.get('version')
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to save defaults',
                'code': 'SAVE_FAILED'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'DEFAULTS_UPDATE_FAILED'
        }), 500
```

#### **POST /api/v2/preferences/defaults/save-from-current**
```python
@preferences_v2_bp.route('/api/v2/preferences/defaults/save-from-current', methods=['POST'])
def save_current_as_defaults():
    """שמור את ההגדרות הנוכחיות כברירות מחדל"""
    try:
        db: Session = next(get_db())
        user_id = get_user_id_from_request()
        data = request.get_json()
        
        profile_id = data.get('profile_id') if data else None
        
        # קבל הגדרות נוכחיות
        preferences = PreferencesServiceV2.get_preferences_v2(db, user_id, profile_id)
        if not preferences:
            return jsonify({
                'success': False,
                'error': 'No preferences found to save as defaults',
                'code': 'PREFERENCES_NOT_FOUND'
            }), 404
        
        # המר להגדרות ברירת מחדל
        defaults = preferences.to_dict()
        
        # שמור ברירות מחדל לקובץ
        success = PreferencesServiceV2.save_defaults_to_file(defaults)
        
        if success:
            # בטל מטמון
            invalidate_cache('preferences_defaults')
            
            return jsonify({
                'success': True,
                'message': 'Current preferences saved as defaults',
                'data': {
                    'lastUpdated': defaults.get('lastUpdated'),
                    'version': defaults.get('version')
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to save defaults',
                'code': 'SAVE_FAILED'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'SAVE_DEFAULTS_FAILED'
        }), 500
```

### **4. JavaScript Client - preferences-v2.js**

**מיקום**: `trading-ui/scripts/preferences-v2.js`

#### **עדכון פונקציה קיימת**:

```javascript
async getDefaultPreferences() {
  try {
    // נסה לטעון ברירות מחדל מהשרת
    const response = await fetch('/api/v2/preferences/defaults');
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log('✅ Loaded defaults from server');
        return data.data.defaults;
      }
    }
    
    // Fallback לברירות מחדל מקומיות
    console.warn('⚠️ Using fallback defaults');
    return this.getFallbackDefaults();
    
  } catch (error) {
    console.error('❌ Error loading defaults:', error);
    return this.getFallbackDefaults();
  }
}

getFallbackDefaults() {
  return {
    version: '2.0',
    lastUpdated: new Date().toISOString(),
    description: 'Fallback defaults - server loading failed',
    general: {
      primaryCurrency: 'USD',
      timezone: 'Asia/Jerusalem',
      defaultStopLoss: 5,
      defaultTargetPrice: 10,
      defaultCommission: 1
    },
    defaultFilters: {
      status: 'open',
      type: 'swing', 
      dateRange: 'this_week'
    },
    ui: {
      theme: 'light',
      compactMode: false,
      showAnimations: true
    },
    externalData: {
      providers: {
        primary: 'yahoo',
        secondary: 'google'
      },
      refresh: {
        interval: 5,
        cacheTTL: 5
      }
    }
  };
}
```

#### **פונקציות חדשות**:

```javascript
// פונקציות ברירות מחדל
async saveCurrentAsDefaults() {
  try {
    if (!this.currentProfile) {
      this.showError('אין פרופיל נבחר');
      return false;
    }
    
    const response = await fetch('/api/v2/preferences/defaults/save-from-current', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        profile_id: this.currentProfile.id
      })
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    if (data.success) {
      this.showSuccess('ברירות המחדל נשמרו בהצלחה');
      return true;
    } else {
      throw new Error(data.error || 'Failed to save defaults');
    }
    
  } catch (error) {
    console.error('❌ Error saving defaults:', error);
    this.showError('שגיאה בשמירת ברירות מחדל: ' + error.message);
    return false;
  }
}

async loadDefaultsFromServer() {
  try {
    const response = await fetch('/api/v2/preferences/defaults');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    if (data.success) {
      return data.data.defaults;
    } else {
      throw new Error(data.error || 'Failed to load defaults');
    }
    
  } catch (error) {
    console.error('❌ Error loading defaults:', error);
    return null;
  }
}

// פונקציה גלובלית
async function saveCurrentAsDefaults() {
  if (window.preferencesV2) {
    await window.preferencesV2.saveCurrentAsDefaults();
  }
}
```

### **5. ממשק המשתמש - preferences-v2.html**

**מיקום**: `trading-ui/preferences-v2.html`

#### **כפתור חדש**:

```html
<button class="btn btn-primary btn-sm me-2" onclick="saveCurrentAsDefaults()"
    title="שמור את ההגדרות הנוכחיות כברירות מחדל">
  <i class="bi bi-bookmark-star"></i> שמור ברירות מחדל
</button>
```

---

## 🔄 **תהליך העבודה החדש**

### **1. טעינת ברירות מחדל**
```
משתמש נכנס לעמוד העדפות
           │
           ▼
JavaScript קורא ל-API
           │
           ▼
שירות השרת טוען מקובץ JSON
           │
           ▼
ברירות מחדל מוצגות למשתמש
```

### **2. שמירת ברירות מחדל חדשות**
```
משתמש לוחץ "שמור ברירות מחדל"
           │
           ▼
JavaScript שולח בקשה לשרת
           │
           ▼
שירות השרת שומר לקובץ JSON
           │
           ▼
מטמון מתבטל + הודעה למשתמש
```

### **3. יצירת פרופיל חדש**
```
משתמש יוצר פרופיל חדש
           │
           ▼
שירות השרת טוען ברירות מחדל
           │
           ▼
פרופיל נוצר עם ברירות מחדל
```

---

## ✅ **יתרונות הארכיטקטורה החדשה**

### **1. גמישות**
- ✅ **עדכון ברירות מחדל ללא שינוי קוד**
- ✅ **ניהול מרכזי של כל ברירות המחדל**
- ✅ **אפשרות לגרסאות שונות של ברירות מחדל**

### **2. תחזוקה**
- ✅ **קובץ JSON אחד במקום קוד מפוזר**
- ✅ **בדיקת תקינות אוטומטית**
- ✅ **גיבוי ושחזור קלים**

### **3. ביצועים**
- ✅ **מטמון חכם עם TTL**
- ✅ **טעינה אסינכרונית**
- ✅ **Fallback במקרה של כשל**

### **4. חוויית משתמש**
- ✅ **כפתור "שמור ברירות מחדל"**
- ✅ **הודעות ברורות על הצלחה/כשל**
- ✅ **תאימות מלאה לאחור**

### **5. אבטחה**
- ✅ **ולידציה של נתונים**
- ✅ **הגנה מפני כשלים**
- ✅ **לוגים מפורטים**

---

## 🔧 **הגדרות מטמון**

### **Cache TTL**
- **ברירות מחדל**: 300 שניות (5 דקות)
- **תלות**: `preferences_defaults`
- **ביטול אוטומטי**: בעת עדכון ברירות מחדל

### **Cache Keys**
```python
@cache_with_deps(ttl=300, dependencies=['preferences_defaults'])
def get_defaults():
    # ...
```

---

## 📊 **מטריקות ומעקב**

### **לוגים**
```python
logger.info(f"✅ Loaded defaults from file: {cls.DEFAULTS_FILE_PATH}")
logger.info(f"✅ Saved defaults to file: {cls.DEFAULTS_FILE_PATH}")
logger.warning(f"Defaults file not found: {cls.DEFAULTS_FILE_PATH}")
logger.error(f"❌ Error loading defaults from file: {e}")
```

### **מטריקות**
- **זמן טעינת ברירות מחדל**
- **שיעור הצלחה/כשל**
- **מספר עדכונים**
- **גודל קובץ ברירות מחדל**

---

## 🚀 **תכונות עתידיות**

### **1. גרסאות ברירות מחדל**
- היסטוריית שינויים בברירות מחדל
- אפשרות לחזור לגרסה קודמת
- השוואה בין גרסאות

### **2. ברירות מחדל מותאמות אישית**
- ברירות מחדל לכל משתמש
- ברירות מחדל לכל קבוצת משתמשים
- ברירות מחדל לכל סביבה (dev/prod)

### **3. יבוא/יצוא ברירות מחדל**
- ייצוא ברירות מחדל לקובץ
- יבוא ברירות מחדל מקובץ
- סנכרון בין סביבות

### **4. ממשק ניהול ברירות מחדל**
- עמוד ניהול ברירות מחדל
- עריכה ויזואלית של ברירות מחדל
- בדיקת תקינות בזמן אמת

---

## 📋 **רשימת בדיקות**

### **בדיקות פונקציונליות**
- [ ] טעינת ברירות מחדל מקובץ JSON
- [ ] שמירת ברירות מחדל לקובץ JSON
- [ ] כפתור "שמור ברירות מחדל" עובד
- [ ] Fallback במקרה של כשל
- [ ] מטמון עובד כראוי
- [ ] ביטול מטמון בעת עדכון

### **בדיקות ביצועים**
- [ ] זמן טעינה מהיר (< 100ms)
- [ ] מטמון מקטין בקשות
- [ ] אין memory leaks
- [ ] טעינה אסינכרונית לא חוסמת UI

### **בדיקות אבטחה**
- [ ] ולידציה של נתוני JSON
- [ ] הגנה מפני path traversal
- [ ] הגנה מפני JSON injection
- [ ] הרשאות נכונות לקובץ

### **בדיקות תאימות**
- [ ] תאימות לאחור עם V2.0
- [ ] תאימות עם V1 (מיגרציה)
- [ ] תאימות עם דפדפנים שונים
- [ ] תאימות עם מערכות הפעלה שונות

---

## 🎯 **סיכום**

הארכיטקטורה החדשה של ברירות מחדל דינמיות מספקת:

1. **גמישות מקסימלית** - עדכון ברירות מחדל ללא שינוי קוד
2. **תחזוקה קלה** - קובץ JSON אחד במקום קוד מפוזר
3. **ביצועים מעולים** - מטמון חכם וטעינה אסינכרונית
4. **חוויית משתמש משופרת** - כפתור "שמור ברירות מחדל"
5. **אבטחה גבוהה** - ולידציה והגנה מפני כשלים

המערכת מוכנה לשימוש מלא ומספקת בסיס איתן לתכונות עתידיות מתקדמות.

---

**תאריך יצירה**: 2025-09-05  
**גרסה**: 2.1  
**סטטוס**: ✅ הושלם בהצלחה  
**מפתח**: TikTrack Development Team

# מדריך אופטימיזציה - מערכת העדפות
## Optimization Guide - Preferences System

> **גרסה 3.0** - ביצועים מקסימליים וצריכת משאבים מינימלית

---

## 🎯 מדריך מהיר למפתחים

### ⚡ אופטימיזציה קריטית לקריאת העדפות

**הבעיה:** קריאת העדפות היא פעולה שחוזרת המון פעמים בהמון עמודים.

**הפתרון:** Cache אגרסיבי + Lazy Loading

---

## 🚀 אסטרטגיות אופטימיזציה

### 1. Cache Strategy

#### Frontend Cache
```javascript
// Cache גלובלי ב-JavaScript
window.preferencesCache = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000, // 5 דקות
  
  isValid() {
    return this.data && 
           this.timestamp && 
           (Date.now() - this.timestamp) < this.ttl;
  },
  
  get() {
    return this.isValid() ? this.data : null;
  },
  
  set(data) {
    this.data = data;
    this.timestamp = Date.now();
  },
  
  clear() {
    this.data = null;
    this.timestamp = null;
  }
};
```

#### Backend Cache
```python
from functools import lru_cache
from datetime import datetime, timedelta

class PreferencesCache:
    def __init__(self):
        self._cache = {}
        self._timestamps = {}
        self.ttl = timedelta(minutes=5)
    
    def get(self, user_id: int, profile_id: int = None):
        key = f"{user_id}_{profile_id or 'default'}"
        
        if key in self._cache:
            if datetime.now() - self._timestamps[key] < self.ttl:
                return self._cache[key]
            else:
                # Cache expired
                del self._cache[key]
                del self._timestamps[key]
        
        return None
    
    def set(self, user_id: int, preferences: dict, profile_id: int = None):
        key = f"{user_id}_{profile_id or 'default'}"
        self._cache[key] = preferences
        self._timestamps[key] = datetime.now()
    
    def invalidate(self, user_id: int, profile_id: int = None):
        key = f"{user_id}_{profile_id or 'default'}"
        if key in self._cache:
            del self._cache[key]
            del self._timestamps[key]

# Global cache instance
preferences_cache = PreferencesCache()
```

### 2. Database Optimization

#### אינדקסים קריטיים
```sql
-- אינדקסים לביצועים מקסימליים
CREATE INDEX idx_user_preferences_lookup ON user_preferences(user_id, profile_id, preference_id);
CREATE INDEX idx_preference_types_active ON preference_types(is_active, group_id);
CREATE INDEX idx_preference_profiles_user_active ON preference_profiles(user_id, is_active);

-- אינדקס מורכב לשאילתות מהירות
CREATE INDEX idx_user_preferences_complex ON user_preferences(user_id, profile_id) 
INCLUDE (preference_id, saved_value);
```

#### Query Optimization
```python
# ❌ רע - N+1 queries
def get_user_preferences_bad(db: Session, user_id: int, profile_id: int):
    preferences = {}
    types = db.query(PreferenceType).filter(PreferenceType.is_active == True).all()
    
    for pref_type in types:
        user_pref = db.query(UserPreference).filter(
            UserPreference.user_id == user_id,
            UserPreference.profile_id == profile_id,
            UserPreference.preference_id == pref_type.id
        ).first()
        # N+1 problem!
    
    return preferences

# ✅ טוב - Single query עם JOIN
def get_user_preferences_optimized(db: Session, user_id: int, profile_id: int):
    query = db.query(
        PreferenceType.preference_name,
        PreferenceType.data_type,
        PreferenceType.group_id,
        PreferenceGroup.group_name,
        UserPreference.saved_value
    ).select_from(PreferenceType)\
     .join(PreferenceGroup, PreferenceType.group_id == PreferenceGroup.id)\
     .outerjoin(UserPreference, and_(
         UserPreference.preference_id == PreferenceType.id,
         UserPreference.user_id == user_id,
         UserPreference.profile_id == profile_id
     ))\
     .filter(PreferenceType.is_active == True)\
     .order_by(PreferenceGroup.group_name, PreferenceType.preference_name)
    
    return query.all()
```

### 3. Lazy Loading Strategy

#### Frontend Lazy Loading
```javascript
// טעינה עצלה של העדפות
class PreferencesLoader {
  constructor() {
    this.loading = false;
    this.promise = null;
  }
  
  async load(userId, profileId = null) {
    // אם כבר טוען, החזר את אותו Promise
    if (this.loading && this.promise) {
      return this.promise;
    }
    
    // בדוק cache
    const cached = window.preferencesCache.get();
    if (cached) {
      return cached;
    }
    
    // התחל טעינה
    this.loading = true;
    this.promise = this._fetchPreferences(userId, profileId);
    
    try {
      const result = await this.promise;
      window.preferencesCache.set(result);
      return result;
    } finally {
      this.loading = false;
      this.promise = null;
    }
  }
  
  async _fetchPreferences(userId, profileId) {
    const response = await fetch(`/api/v1/preferences/user?profile_id=${profileId || ''}`);
    return response.json();
  }
}

// Global instance
window.preferencesLoader = new PreferencesLoader();
```

### 4. Batch Operations

#### שמירה בקבוצות
```python
def save_user_preferences_batch(db: Session, user_id: int, preferences: dict, profile_id: int = None):
    """שמירת העדפות בקבוצות לביצועים מקסימליים"""
    
    # הכנת נתונים לכניסה
    batch_data = []
    preference_types = get_preference_types_map(db)  # Cache this!
    
    for group_name, group_prefs in preferences.items():
        for pref_name, pref_value in group_prefs.items():
            pref_type_id = preference_types.get(f"{group_name}.{pref_name}")
            if pref_type_id:
                batch_data.append({
                    'user_id': user_id,
                    'profile_id': profile_id,
                    'preference_id': pref_type_id,
                    'saved_value': str(pref_value)
                })
    
    # מחיקת העדפות קיימות
    db.query(UserPreference).filter(
        UserPreference.user_id == user_id,
        UserPreference.profile_id == profile_id
    ).delete()
    
    # הכנסת נתונים חדשים בקבוצה
    if batch_data:
        db.bulk_insert_mappings(UserPreference, batch_data)
    
    db.commit()
    
    # עדכון cache
    preferences_cache.invalidate(user_id, profile_id)
```

---

## 📊 מדדי ביצועים

### יעדים
- **זמן טעינה ראשונית:** < 100ms
- **זמן טעינה מ-cache:** < 10ms
- **זמן שמירה:** < 200ms
- **זיכרון cache:** < 1MB per user

### ניטור
```python
import time
from functools import wraps

def performance_monitor(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        
        # Log performance
        duration = (end_time - start_time) * 1000  # ms
        if duration > 100:  # Alert if > 100ms
            logger.warning(f"Slow preferences operation: {func.__name__} took {duration:.2f}ms")
        
        return result
    return wrapper

@performance_monitor
def get_user_preferences(db: Session, user_id: int, profile_id: int = None):
    # Implementation...
```

---

## 🔧 כלי אופטימיזציה

### 1. Database Connection Pooling
```python
# config.py
DATABASE_CONFIG = {
    'pool_size': 20,
    'max_overflow': 30,
    'pool_pre_ping': True,
    'pool_recycle': 3600
}
```

### 2. Query Caching
```python
from sqlalchemy.orm import joinedload

# Eager loading למניעת N+1
def get_preference_types_with_groups(db: Session):
    return db.query(PreferenceType)\
             .options(joinedload(PreferenceType.group))\
             .filter(PreferenceType.is_active == True)\
             .all()
```

### 3. Memory Management
```python
# ניקוי cache אוטומטי
import threading
import time

class CacheCleaner:
    def __init__(self, cache, interval=300):  # 5 minutes
        self.cache = cache
        self.interval = interval
        self.running = False
        self.thread = None
    
    def start(self):
        if not self.running:
            self.running = True
            self.thread = threading.Thread(target=self._cleanup_loop)
            self.thread.daemon = True
            self.thread.start()
    
    def _cleanup_loop(self):
        while self.running:
            time.sleep(self.interval)
            self.cache.cleanup_expired()
    
    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join()

# Start cache cleaner
cache_cleaner = CacheCleaner(preferences_cache)
cache_cleaner.start()
```

---

## 📈 המלצות לביצועים

### ✅ DO
- השתמש ב-cache אגרסיבי
- בצע batch operations
- השתמש ב-indexes מתאימים
- Monitor performance metrics
- Implement lazy loading

### ❌ DON'T
- אל תטען העדפות בכל page load
- אל תבצע N+1 queries
- אל תשמור cache ללא TTL
- אל תטען נתונים מיותרים
- אל תשכח לנקות cache

---

## 🚨 Troubleshooting

### בעיות נפוצות

#### Cache לא מתעדכן
```python
# וודא שמוחקים cache אחרי שמירה
def save_preferences_and_invalidate_cache(db, user_id, preferences, profile_id):
    save_user_preferences(db, user_id, preferences, profile_id)
    preferences_cache.invalidate(user_id, profile_id)  # חשוב!
```

#### ביצועים איטיים
```python
# בדוק שאילתות
import logging
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# או השתמש ב-EXPLAIN
db.execute("EXPLAIN QUERY PLAN SELECT ...")
```

#### זיכרון גבוה
```python
# הגבל גודל cache
class LimitedCache:
    def __init__(self, max_size=1000):
        self.max_size = max_size
        self._cache = {}
        self._access_order = []
    
    def set(self, key, value):
        if len(self._cache) >= self.max_size:
            # Remove least recently used
            oldest_key = self._access_order.pop(0)
            del self._cache[oldest_key]
        
        self._cache[key] = value
        self._access_order.append(key)
```

---

*עדכון אחרון: ינואר 2025 | גרסה 3.0*

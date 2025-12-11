# מפרט מימוש - תיעוד רגשי

## Emotional Tracking Implementation Specification

**תאריך יצירה:** 29 בינואר 2025  
**סטטוס:** מפרט מימוש לשלבים הבאים  
**גרסה:** 1.0.0

---

## סקירה כללית

מסמך זה מגדיר את מפרט המימוש המלא למערכת תיעוד רגשי, החל משכבת הלוגיקה העסקית ועד לבסיס הנתונים.

**מסמכים קשורים:**

- `documentation/frontend/EMOTIONAL_TRACKING_DATA_STRUCTURE.md` - מבנה נתונים מפורט
- `documentation/frontend/EMOTIONAL_TRACKING_WIDGET_DEVELOPER_GUIDE.md` - מדריך מפתח למוקאפ

---

## 1. מבנה נתונים

### 1.1 טבלת `emotional_entries`

```sql
CREATE TABLE emotional_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    emotion_type VARCHAR(20) NOT NULL,
    recorded_at DATETIME NOT NULL,
    notes TEXT,
    trade_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (trade_id) REFERENCES trades(id),
    CHECK (emotion_type IN ('happy', 'satisfied', 'neutral', 'sad', 'angry', 'confused', 'stressed'))
);
```

### 1.2 אינדקסים

```sql
CREATE INDEX idx_emotional_entries_user_id ON emotional_entries(user_id);
CREATE INDEX idx_emotional_entries_recorded_at ON emotional_entries(recorded_at);
CREATE INDEX idx_emotional_entries_trade_id ON emotional_entries(trade_id);
CREATE INDEX idx_emotional_entries_emotion_type ON emotional_entries(emotion_type);
CREATE INDEX idx_emotional_entries_user_recorded ON emotional_entries(user_id, recorded_at);
```

### 1.3 שדות

| שדה | סוג | חובה | תיאור |
|-----|-----|------|-------|
| `id` | Integer | ✅ | מזהה ייחודי |
| `user_id` | Integer | ✅ | משתמש שיצר את התיעוד |
| `emotion_type` | String(20) | ✅ | סוג הרגש (happy, satisfied, neutral, sad, angry, confused, stressed) |
| `recorded_at` | DateTime | ✅ | תאריך ושעה של התיעוד |
| `notes` | Text | ❌ | הערות טקסטואליות |
| `trade_id` | Integer | ❌ | קישור לטרייד |
| `created_at` | DateTime | ✅ | תאריך יצירה |
| `updated_at` | DateTime | ✅ | תאריך עדכון אחרון |

---

## 2. Backend Requirements

### 2.1 מודל `EmotionalEntry`

**קובץ:** `Backend/models/emotional_entry.py`

```python
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from .base import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

class EmotionalEntry(BaseModel):
    """
    Emotional Entry model - represents an emotional tracking entry
    
    Attributes:
        user_id (int): User who created the entry
        emotion_type (str): Type of emotion (happy, satisfied, neutral, sad, angry, confused, stressed)
        recorded_at (datetime): Date and time of the entry
        notes (str): Optional notes
        trade_id (int): Optional link to trade
        
    Relationships:
        user: User who created the entry
        trade: Linked trade (optional)
    """
    __tablename__ = "emotional_entries"
    
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    emotion_type = Column(String(20), nullable=False)
    recorded_at = Column(DateTime, nullable=False)
    notes = Column(Text, nullable=True)
    trade_id = Column(Integer, ForeignKey('trades.id'), nullable=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    trade = relationship("Trade", foreign_keys=[trade_id])
    
    __table_args__ = (
        CheckConstraint(
            "emotion_type IN ('happy', 'satisfied', 'neutral', 'sad', 'angry', 'confused', 'stressed')",
            name='check_emotion_type'
        ),
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        result = super().to_dict()
        result.update({
            'emotion_type': self.emotion_type,
            'recorded_at': self.recorded_at.isoformat() if self.recorded_at else None,
            'notes': self.notes,
            'trade_id': self.trade_id,
            'user_id': self.user_id
        })
        return result
```

### 2.2 Service `EmotionalEntryService`

**קובץ:** `Backend/services/emotional_entry_service.py`

**פונקציות נדרשות:**

```python
class EmotionalEntryService:
    @staticmethod
    def get_all(db: Session, user_id: int = None) -> List[EmotionalEntry]:
        """Get all emotional entries, optionally filtered by user"""
        
    @staticmethod
    def get_by_id(db: Session, entry_id: int) -> Optional[EmotionalEntry]:
        """Get emotional entry by ID"""
        
    @staticmethod
    def get_recent(db: Session, user_id: int, limit: int = 10) -> List[EmotionalEntry]:
        """Get recent emotional entries for a user"""
        
    @staticmethod
    def create(db: Session, data: Dict[str, Any]) -> EmotionalEntry:
        """Create a new emotional entry"""
        
    @staticmethod
    def update(db: Session, entry_id: int, data: Dict[str, Any]) -> EmotionalEntry:
        """Update an emotional entry"""
        
    @staticmethod
    def delete(db: Session, entry_id: int) -> bool:
        """Delete an emotional entry"""
        
    @staticmethod
    def get_chart_data(db: Session, user_id: int, period: str = 'week') -> List[Dict]:
        """Get chart data for emotion distribution"""
        
    @staticmethod
    def get_insights(db: Session, user_id: int) -> List[Dict]:
        """Get insights and patterns analysis"""
```

### 2.3 API Routes

**קובץ:** `Backend/routes/api/emotional_entries.py`

**Endpoints:**

| Method | Endpoint | תיאור |
|--------|----------|-------|
| `GET` | `/api/emotional-entries/` | קבלת כל התיעודים |
| `GET` | `/api/emotional-entries/{id}` | קבלת תיעוד ספציפי |
| `POST` | `/api/emotional-entries/` | יצירת תיעוד חדש |
| `PUT` | `/api/emotional-entries/{id}` | עדכון תיעוד |
| `DELETE` | `/api/emotional-entries/{id}` | מחיקת תיעוד |
| `GET` | `/api/emotional-entries/stats` | סטטיסטיקות כלליות |
| `GET` | `/api/emotional-entries/chart-data` | נתונים לגרף |
| `GET` | `/api/emotional-entries/insights` | תובנות וניתוח דפוסים |
| `GET` | `/api/emotional-entries/recent` | תיעודים אחרונים |

**Query Parameters:**

- `?user_id={id}` - סינון לפי משתמש
- `?trade_id={id}` - סינון לפי טרייד
- `?emotion_type={type}` - סינון לפי רגש
- `?start_date={date}` - תאריך התחלה
- `?end_date={date}` - תאריך סיום
- `?period={day|week|month|all_time}` - תקופת זמן
- `?limit={number}` - הגבלת תוצאות

---

## 3. Frontend Requirements

### 3.1 Frontend Service

**קובץ:** `trading-ui/scripts/services/emotional-entry-service.js`

**פונקציות נדרשות:**

```javascript
class EmotionalEntryService {
    static async getAll(options = {}) {
        // GET /api/emotional-entries/
    }
    
    static async getById(id) {
        // GET /api/emotional-entries/{id}
    }
    
    static async create(data) {
        // POST /api/emotional-entries/
    }
    
    static async update(id, data) {
        // PUT /api/emotional-entries/{id}
    }
    
    static async delete(id) {
        // DELETE /api/emotional-entries/{id}
    }
    
    static async getChartData(period = 'week') {
        // GET /api/emotional-entries/chart-data?period={period}
    }
    
    static async getInsights() {
        // GET /api/emotional-entries/insights
    }
    
    static async getRecent(limit = 10) {
        // GET /api/emotional-entries/recent?limit={limit}
    }
}
```

### 3.2 אינטגרציה עם API

**עדכון `emotional-tracking-widget.js`:**

```javascript
// במקום generateMockEmotionalEntries()
async function loadRecentEntries() {
    try {
        const data = await EmotionalEntryService.getRecent(10);
        updateRecentEntries(data);
    } catch (error) {
        window.Logger.error('Error loading recent entries', { error });
        window.NotificationSystem.showError('שגיאה בטעינת תיעודים', 'לא ניתן לטעון את התיעודים');
    }
}

// במקום generateEmotionChartData()
async function loadChartData(period = 'week') {
    try {
        const data = await EmotionalEntryService.getChartData(period);
        const chartData = data.map(item => ({
            time: item.date,
            open: 0,
            high: item.count,
            low: 0,
            close: item.count
        }));
        emotionalPatternsSeries.setData(chartData);
        emotionalPatternsChart.timeScale().fitContent();
    } catch (error) {
        window.Logger.error('Error loading chart data', { error });
    }
}

// במקום generateMockInsights()
async function loadInsights() {
    try {
        const data = await EmotionalEntryService.getInsights();
        updateInsights(data);
    } catch (error) {
        window.Logger.error('Error loading insights', { error });
    }
}
```

### 3.3 אינטגרציה עם מטמון

**שימוש ב-UnifiedCacheManager:**

```javascript
// טעינת תיעודים עם מטמון
async function loadRecentEntries() {
    const cacheKey = 'emotional-entries-recent';
    
    // בדיקת מטמון
    const cached = await window.UnifiedCacheManager.get(cacheKey, {
        ttl: 5 * 60 * 1000 // 5 minutes
    });
    
    if (cached) {
        updateRecentEntries(cached);
        return;
    }
    
    // טעינה מהשרת
    try {
        const data = await EmotionalEntryService.getRecent(10);
        await window.UnifiedCacheManager.save(cacheKey, data, {
            ttl: 5 * 60 * 1000
        });
        updateRecentEntries(data);
    } catch (error) {
        window.Logger.error('Error loading recent entries', { error });
    }
}
```

---

## 4. Business Logic

### 4.1 חישוב תובנות

**אלגוריתם מוצע:**

```python
def calculate_insights(db: Session, user_id: int) -> List[Dict]:
    """
    Calculate insights based on emotional entries
    
    Returns:
        List of insight objects with type, severity, title, message
    """
    insights = []
    
    # 1. Correlation with trade plans
    entries_with_plans = db.query(EmotionalEntry).join(Trade).filter(
        EmotionalEntry.user_id == user_id,
        EmotionalEntry.trade_id.isnot(None),
        Trade.trade_plan_id.isnot(None)
    ).count()
    
    total_entries_with_trades = db.query(EmotionalEntry).filter(
        EmotionalEntry.user_id == user_id,
        EmotionalEntry.trade_id.isnot(None)
    ).count()
    
    if total_entries_with_trades > 0:
        plan_satisfaction_rate = (entries_with_plans / total_entries_with_trades) * 100
        if plan_satisfaction_rate > 60:
            insights.append({
                'type': 'insight',
                'severity': 'info',
                'title': 'תובנה',
                'message': f'אתה נוטה להיות מרוצה יותר בטריידים עם תוכנית ({plan_satisfaction_rate:.0f}% מהמקרים).'
            })
    
    # 2. Correlation with investment type
    day_trading_stress = calculate_stress_level(db, user_id, 'day')
    swing_trading_stress = calculate_stress_level(db, user_id, 'swing')
    
    if day_trading_stress > swing_trading_stress * 1.5:
        insights.append({
            'type': 'pattern',
            'severity': 'warning',
            'title': 'דפוס',
            'message': 'רמת מתח גבוהה יותר בטריידים של יום (day trading).'
        })
    
    # 3. Correlation with P/L
    positive_pl_emotions = calculate_positive_emotions_for_profitable_trades(db, user_id)
    if positive_pl_emotions > 70:
        insights.append({
            'type': 'insight',
            'severity': 'info',
            'title': 'תובנה',
            'message': 'רגשות חיוביים יותר בטריידים רווחיים.'
        })
    
    return insights
```

### 4.2 ניתוח דפוסים

**פונקציות נדרשות:**

```python
def analyze_emotion_patterns(db: Session, user_id: int, period: str = 'week') -> Dict:
    """
    Analyze emotion patterns for a user
    
    Returns:
        Dictionary with pattern analysis
    """
    # Calculate emotion distribution
    # Calculate trends over time
    # Calculate correlations
    # Identify anomalies
    pass

def calculate_stress_level(db: Session, user_id: int, investment_type: str = None) -> float:
    """
    Calculate average stress level for a user
    
    Returns:
        Average stress level (0-10)
    """
    pass

def calculate_positive_emotions_for_profitable_trades(db: Session, user_id: int) -> float:
    """
    Calculate percentage of positive emotions for profitable trades
    
    Returns:
        Percentage (0-100)
    """
    pass
```

### 4.3 קורלציות

**קורלציות מוצעות:**

1. **קורלציה עם תוכניות:** מרוצה יותר בטריידים עם תוכנית
2. **קורלציה עם סוג השקעה:** מתח גבוה ב-day trading
3. **קורלציה עם P/L:** רגשות חיוביים יותר בטריידים רווחיים
4. **קורלציה עם זמן:** רגשות שליליים יותר בשעות מסוימות
5. **מגמות:** שינוי ברגשות לאורך זמן

---

## 5. שלבי מימוש מוצעים

### שלב 1: Backend Foundation

1. יצירת טבלת `emotional_entries`
2. יצירת מודל `EmotionalEntry`
3. יצירת Service `EmotionalEntryService`
4. יצירת API Routes בסיסיים (CRUD)

### שלב 2: Frontend Integration

1. יצירת Frontend Service
2. עדכון `emotional-tracking-widget.js` לחיבור ל-API
3. אינטגרציה עם מטמון
4. עדכון כל הווידג'טים לנתונים אמיתיים

### שלב 3: Business Logic

1. מימוש חישוב תובנות
2. מימוש ניתוח דפוסים
3. מימוש קורלציות
4. מימוש אלגוריתמי Machine Learning (אופציונלי)

### שלב 4: Advanced Features

1. התראות על דפוסים שליליים
2. דוחות רגשיים
3. השוואות בין תקופות
4. אנליטיקה מתקדמת

---

## 6. שאלות פתוחות

### 6.1 שאלות טכניות

1. **איזה סוג גרף?** Bar Chart או Pie Chart או שניהם?
2. **תקופות זמן:** איזה תקופות לתמוך? (יום, שבוע, חודש, שנה, כל הזמן)
3. **עריכה/מחיקה:** האם לאפשר עריכה או מחיקה של תיעודים?
4. **התראות:** האם להוסיף התראות על דפוסים שליליים?

### 6.2 שאלות פונקציונליות

1. **תובנות:** איך לחשב תובנות? באיזה אלגוריתם?
2. **דוחות:** האם להוסיף דוחות רגשיים?
3. **Machine Learning:** האם להוסיף ML לניתוח דפוסים?
4. **Export:** האם להוסיף אפשרות לייצוא נתונים?

---

## 7. הערות חשובות

- כל העבודה הנוכחית היא ברמת מוקאפ - נתוני דמה בלבד
- אין חיבור ל-API או Backend בשלב זה
- אין שימוש במטמון בשלב זה (רק הבנה)
- כל הנתונים הם mock data
- כל הפונקציונליות היא frontend בלבד

---

**תאריך עדכון אחרון:** 29 בינואר 2025  
**גרסה:** 1.0.0  
**סטטוס:** מפרט מימוש - ממתין לאישור לפני מימוש


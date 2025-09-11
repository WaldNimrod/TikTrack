# מערכת הגדרות משתמש חדשה - TikTrack
## מסמך אפיון ארכיטקטורה

---

## ⚠️ **הערה חשובה על התפתחות המערכת**

**מערכת העדפות V2 הפכה למערכת העדפות הגנרית**

המערכת הנוכחית התפתחה ממערכת "V2" למערכת העדפות גנרית ומובילה. התהליך כלל:

1. **שלב V1** - מערכת בסיסית (הוסרה לחלוטין)
2. **שלב V2** - מערכת מתקדמת עם פרופילים מרובים
3. **שלב נוכחי** - מערכת העדפות גנרית (לשעבר V2)

**כל ההפניות ל-V2 הוסרו מהקוד והממשק** כדי לפשט את המערכת ולהפוך אותה לגנרית יותר.

---

### 📋 **סקירת המערכת הקיימת**

**מבנה הנתונים הקיים:**
- טבלת `users` עם שדה `preferences_json` (legacy)  
- טבלת `user_preferences` מובנית עם 35+ שדות
- נתונים עבור user_id = 1 (nimrod) כוללים:
  - הגדרות בסיסיות (מטבע, timezone, עמלות)
  - פילטרים (סטטוס, סוג, חשבון, תאריכים) 
  - הגדרות נתונים חיצוניים
  - מערכת צבעים מתקדמת (numeric values, entities, status, investment types)
  - הגדרות שקיפות כותרות
  - הגדרות refresh overrides

---

## 🎯 **מערכת חדשה - דרישות**

### **1. מודל מתקדם יותר**
```python
class UserPreferencesNew(BaseModel):
    # בסיסיים
    user_id: int
    profile_name: str = "ברירת מחדל"
    
    # הגדרות כלליות
    general_settings: GeneralSettings
    
    # פילטרים
    default_filters: DefaultFilters
    
    # מערכת צבעים
    color_scheme: ColorScheme
    
    # נתונים חיצוניים
    external_data: ExternalDataSettings
    
    # ממשק משתמש
    ui_preferences: UIPreferences
    
    # התראות
    notifications: NotificationSettings
```

### **2. יכולות חדשות**
- **פרופילי העדפות מרובים** לכל משתמש
- **יבוא/יצוא הגדרות** 
- **הגדרות ברירת מחדל דינמיות**
- **מעקב היסטוריה** של שינויים
- **בדיקת תקינות** מתקדמת
- **API מאוחד** ומשופר

### **3. מיגרציה חלקה**
- שמירת כל הנתונים הקיימים
- תמיכה לאחור במערכת הישנה
- מיגרציה הדרגתית

---

## 🏗️ **ארכיטקטורה**

### **Backend Components:**
1. **Models**: `UserPreferences`, `PreferenceProfile`, `PreferenceHistory`
2. **Services**: `PreferencesService`, `MigrationService`  
3. **API**: `/api/v2/preferences/*`
4. **Validators**: תבניות בדיקה מתקדמות

### **Frontend Components:**
1. **React Components** (חדש במקום HTML סטטי)
2. **State Management** עם Redux
3. **Theme System** דינמי
4. **Settings Wizard** לאיפוס ואירוח

---

## 📊 **מבנה נתונים מפורט**

### **GeneralSettings**
```json
{
  "primaryCurrency": "USD",
  "timezone": "Asia/Jerusalem", 
  "language": "he",
  "defaultStopLoss": 5.0,
  "defaultTargetPrice": 10.0,
  "defaultCommission": 1.0,
  "tradingHours": {
    "start": "09:30",
    "end": "16:00"
  }
}
```

### **ColorScheme** 
```json
{
  "theme": "light|dark|auto",
  "numericValues": {
    "positive": {"text": "#1f770e", "bg": "#d2fdc9"},
    "negative": {"text": "#7e1621", "bg": "#f4b8bd"},
    "zero": {"text": "#6c757d", "bg": "#e2e3e5"}
  },
  "entities": {
    "trade": "#660000",
    "account": "#1b0b75",
    "ticker": "#019193"
  },
  "status": {
    "open": {"text": "#28a745", "bg": "rgba(40,167,69,0.1)"},
    "closed": {"text": "#6c757d", "bg": "rgba(108,117,125,0.1)"}
  }
}
```

### **UIPreferences**
```json
{
  "headerOpacity": {"main": 60, "sub": 30},
  "tablePageSize": 25,
  "showAnimations": true,
  "compactMode": false,
  "sidebarPosition": "right",
  "defaultPage": "dashboard"
}
```

---

## 🔄 **תהליך המיגרציה**

### **שלב 1: יצירת מבנה חדש**
1. מודל `UserPreferences` 
2. שירותי מיגרציה
3. API endpoints חדשים

### **שלב 2: מיגרציה**
```python
def migrate_existing_preferences():
    """מעביר נתונים מהמערכת הישנה לחדשה"""
    # 1. קריאת נתונים קיימים
    # 2. המרה למבנה חדש  
    # 3. שמירה במודל חדש
    # 4. בדיקת תקינות
```

### **שלב 3: החלפה הדרגתית**
- Frontend משתמש ב-API החדש
- API ישן נשמר לתאימות
- מעבר מלא אחרי וידוא

---

## ✅ **יתרונות המערכת החדשה**

1. **מבנה נקי יותר** - הפרדה בין סוגי הגדרות
2. **גמישות** - פרופילים מרובים, יבוא/יצוא
3. **ביצועים** - cache מתקדם, lazy loading  
4. **תחזוקה** - קוד נקי יותר, טסטים
5. **חוויית משתמש** - ממשק מודרני, responsive

---

## 📝 **תכנון יישום**

### **Priority 1 - Core**
- [x] ניתוח מערכת קיימת
- [ ] מודל UserPreferences
- [ ] API endpoints בסיסיים
- [ ] מיגרציה

### **Priority 2 - Enhanced** 
- [ ] פרופילים מרובים
- [ ] יבוא/יצוא
- [ ] ממשק React

### **Priority 3 - Advanced**
- [ ] היסטוריה
- [ ] הגדרות דינמיות
- [ ] אנליטיקה

---

*מסמך זה מתבסס על ניתוח מעמיק של המערכת הקיימת ונתוני המשתמש הקיימים*
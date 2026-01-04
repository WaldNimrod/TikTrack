# Unified CRUD System - TikTrack

## סקירה כללית

**Unified CRUD System** היא מערכת מרכזית לניהול פעולות CRUD (Create, Read, Update, Delete) במערכת TikTrack. המערכת מספקת ממשק אחיד לכל הישויות במערכת עם אינטגרציה מלאה למערכות קיימות.

## ארכיטקטורה

### מבנה בסיסי

```javascript
// Unified CRUD Service Interface
const crudService = {
  create: async (entityType, data) => { /* implementation */ },
  read: async (entityType, id) => { /* implementation */ },
  update: async (entityType, id, data) => { /* implementation */ },
  delete: async (entityType, id) => { /* implementation */ },
  list: async (entityType, filters) => { /* implementation */ }
};
```

### רכיבים מרכזיים

#### 1. Unified CRUD Service

- **קובץ:** `trading-ui/scripts/services/unified-crud-service.js`
- **תפקיד:** ממשק אחיד לכל פעולות CRUD
- **אינטגרציה:** עובד עם UnifiedPayloadBuilder ו-CRUD Response Handler

#### 2. Entity-Specific Services

- **מיקום:** `trading-ui/scripts/services/*-data.js`
- **תפקיד:** שירותים ייעודיים לכל ישות (trades, executions, etc.)
- **אינטגרציה:** משתמשים ב-Unified CRUD Service כבסיס

#### 3. CRUD Response Handler

- **קובץ:** `trading-ui/scripts/services/crud-response-handler.js`
- **תפקיד:** טיפול אחיד בתגובות CRUD וטיפול בשגיאות

## API Reference

### Methods

#### `create(entityType, data)`

**פרמטרים:**

- `entityType` (string): סוג הישות (trades, executions, etc.)
- `data` (object): נתוני הישות ליצירה

**מחזיר:** Promise עם תוצאת היצירה

#### `read(entityType, id)`

**פרמטרים:**

- `entityType` (string): סוג הישות
- `id` (number): מזהה הישות

**מחזיר:** Promise עם נתוני הישות

#### `update(entityType, id, data)`

**פרמטרים:**

- `entityType` (string): סוג הישות
- `id` (number): מזהה הישות
- `data` (object): נתונים מעודכנים

**מחזיר:** Promise עם תוצאת העדכון

#### `delete(entityType, id)`

**פרמטרים:**

- `entityType` (string): סוג הישות
- `id` (number): מזהה הישות

**מחזיר:** Promise עם תוצאת המחיקה

#### `list(entityType, filters)`

**פרמטרים:**

- `entityType` (string): סוג הישות
- `filters` (object): מסננים לחיפוש

**מחזיר:** Promise עם רשימת ישויות

## אינטגרציה עם מערכות אחרות

### Unified Payload Builder

```javascript
// Integration example
const payload = await UnifiedPayloadBuilder.build(entityType, formData);
const result = await UnifiedCRUDService.create(entityType, payload);
```

### Cache Integration

```javascript
// Cache-aware CRUD operations
const result = await CRUDCacheIntegration.create(entityType, data);
```

### Modal System

```javascript
// Modal-based CRUD
await ModalQuantumSystem.openCRUDModal(entityType, operation, data);
```

## טיפול בשגיאות

### Error Handling Strategy

1. **Validation Errors:** מוצגים בטופס עם הודעות ספציפיות
2. **Network Errors:** retry mechanism עם fallback
3. **Authentication Errors:** redirect ללוגין
4. **Server Errors:** logging ו-user notification

### Error Response Format

```javascript
{
  success: false,
  error: {
    type: 'VALIDATION_ERROR',
    message: 'Validation failed',
    details: { field: 'email', message: 'Invalid format' }
  }
}
```

## בדיקות ואיכות

### Test Coverage

- ✅ CRUD operations for all entities
- ✅ Error handling scenarios
- ✅ Cache integration
- ✅ Modal integration
- ✅ Network failure recovery

### Performance Metrics

- **Response Time:** < 500ms for simple operations
- **Cache Hit Rate:** > 80%
- **Error Rate:** < 1%

## תחזוקה

### הוספת ישות חדשה

1. צור entity service ב-`trading-ui/scripts/services/`
2. הוסף ל-UnifiedPayloadBuilder
3. עדכן CRUD Response Handler אם נדרש
4. הוסף לבדיקות

### עדכון קיים

1. שנה את ה-entity service
2. עדכן את ה-payload builder
3. הרץ regression tests
4. עדכן תיעוד

---

**גרסה:** 1.0.0
**תאריך:** 1 בינואר 2026
**סטטוס:** ✅ פעיל ומתועד

# סכמת מסד נתונים: מערכת Watch List

## Database Schema: Watch List System

**תאריך:** 28 בינואר 2025  
**גרסה:** 1.0.0  
**מטרה:** מפרט מלא של מבנה מסד הנתונים למערכת Watch List

---

## סקירה כללית

מערכת Watch List משתמשת בשתי טבלאות עיקריות:

1. `watch_lists` - רשימות הצפייה של המשתמשים
2. `watch_list_items` - הטיקרים בכל רשימה

---

## טבלה: `watch_lists`

### מטרה

אחסון רשימות צפייה מותאמות אישית לכל משתמש.

### שדות

| שם שדה | טיפוס | אילוצים | תיאור |
|---------|-------|---------|-------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | מזהה ייחודי |
| `user_id` | INTEGER | NOT NULL, FOREIGN KEY → users.id | מזהה משתמש (תמיכה ריבוי משתמשים) |
| `name` | VARCHAR(100) | NOT NULL | שם הרשימה (ייחודי למשתמש) |
| `icon` | VARCHAR(50) | NULL | שם איקון מ-IconSystem (למשל: 'chart-line', 'star') |
| `color_hex` | VARCHAR(7) | NULL | צבע רשימה (hex format: #RRGGBB) |
| `display_order` | INTEGER | NOT NULL, DEFAULT 0 | סדר תצוגה ידני (לסידור) |
| `view_mode` | VARCHAR(20) | NOT NULL, DEFAULT 'table' | מצב תצוגה: 'table', 'cards', 'compact' |
| `default_sort_column` | VARCHAR(50) | NULL | עמודת מיון ברירת מחדל |
| `default_sort_direction` | VARCHAR(4) | NOT NULL, DEFAULT 'asc' | כיוון מיון: 'asc', 'desc' |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | תאריך יצירה |
| `updated_at` | DATETIME | NULL, ON UPDATE CURRENT_TIMESTAMP | תאריך עדכון אחרון |

### Constraints

```sql
UNIQUE(user_id, name)  -- שם רשימה ייחודי למשתמש
FOREIGN KEY (user_id) REFERENCES users(id)
CHECK (view_mode IN ('table', 'cards', 'compact'))
CHECK (default_sort_direction IN ('asc', 'desc'))
```

### Indexes

```sql
INDEX idx_watch_lists_user_id (user_id)
INDEX idx_watch_lists_user_order (user_id, display_order)
```

---

## טבלה: `watch_list_items`

### מטרה

אחסון הטיקרים בכל רשימה, כולל תמיכה בטיקרים קיימים במערכת וטיקרים חיצוניים.

### שדות

| שם שדה | טיפוס | אילוצים | תיאור |
|---------|-------|---------|-------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | מזהה ייחודי |
| `watch_list_id` | INTEGER | NOT NULL, FOREIGN KEY → watch_lists.id | מזהה רשימה |
| `ticker_id` | INTEGER | NULL, FOREIGN KEY → tickers.id | מזהה טיקר (NULL אם טיקר חיצוני) |
| `external_symbol` | VARCHAR(10) | NULL | Symbol לטיקר חיצוני (NULL אם טיקר במערכת) |
| `external_name` | VARCHAR(100) | NULL | שם לטיקר חיצוני |
| `flag_color` | VARCHAR(7) | NULL | צבע דגל (hex format מתוך 8 צבעי ישויות) |
| `display_order` | INTEGER | NOT NULL, DEFAULT 0 | סדר תצוגה ידני בתוך הרשימה |
| `notes` | VARCHAR(500) | NULL | הערות משתמש על הטיקר |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | תאריך יצירה |
| `updated_at` | DATETIME | NULL, ON UPDATE CURRENT_TIMESTAMP | תאריך עדכון אחרון |

### Constraints

```sql
-- חייב להיות טיקר במערכת או טיקר חיצוני (אבל לא שניהם)
CHECK (
  (ticker_id IS NOT NULL AND external_symbol IS NULL) OR
  (ticker_id IS NULL AND external_symbol IS NOT NULL)
)

-- טיקר במערכת לא יכול להופיע פעמיים באותה רשימה
UNIQUE(watch_list_id, ticker_id) WHERE ticker_id IS NOT NULL

-- טיקר חיצוני לא יכול להופיע פעמיים באותה רשימה
UNIQUE(watch_list_id, external_symbol) WHERE external_symbol IS NOT NULL

FOREIGN KEY (watch_list_id) REFERENCES watch_lists(id) ON DELETE CASCADE
FOREIGN KEY (ticker_id) REFERENCES tickers(id) ON DELETE SET NULL
```

### Indexes

```sql
INDEX idx_watch_list_items_list_id (watch_list_id)
INDEX idx_watch_list_items_ticker_id (ticker_id)
INDEX idx_watch_list_items_external_symbol (external_symbol)
INDEX idx_watch_list_items_flag_color (flag_color)
INDEX idx_watch_list_items_list_order (watch_list_id, display_order)
```

---

## Relationships

### WatchList → User (Many-to-One)

- משתמש יכול להחזיק מספר רשימות
- Foreign Key: `watch_lists.user_id → users.id`

### WatchList → WatchListItem (One-to-Many)

- רשימה יכולה להכיל מספר טיקרים
- Foreign Key: `watch_list_items.watch_list_id → watch_lists.id`
- CASCADE DELETE: מחיקת רשימה מוחקת את כל הפריטים

### WatchListItem → Ticker (Many-to-One, Optional)

- פריט יכול להצביע על טיקר במערכת (או להיות חיצוני)
- Foreign Key: `watch_list_items.ticker_id → tickers.id`
- SET NULL on DELETE: אם טיקר נמחק, הפריט נשאר עם external_symbol

---

## SQL Schema Definition

### PostgreSQL (Production)

```sql
-- Watch Lists Table
CREATE TABLE watch_lists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    color_hex VARCHAR(7),
    display_order INTEGER NOT NULL DEFAULT 0,
    view_mode VARCHAR(20) NOT NULL DEFAULT 'table',
    default_sort_column VARCHAR(50),
    default_sort_direction VARCHAR(4) NOT NULL DEFAULT 'asc',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_watch_lists_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_watch_lists_user_name 
        UNIQUE (user_id, name),
    CONSTRAINT ck_watch_lists_view_mode 
        CHECK (view_mode IN ('table', 'cards', 'compact')),
    CONSTRAINT ck_watch_lists_sort_direction 
        CHECK (default_sort_direction IN ('asc', 'desc'))
);

CREATE INDEX idx_watch_lists_user_id ON watch_lists(user_id);
CREATE INDEX idx_watch_lists_user_order ON watch_lists(user_id, display_order);

-- Watch List Items Table
CREATE TABLE watch_list_items (
    id SERIAL PRIMARY KEY,
    watch_list_id INTEGER NOT NULL,
    ticker_id INTEGER,
    external_symbol VARCHAR(10),
    external_name VARCHAR(100),
    flag_color VARCHAR(7),
    display_order INTEGER NOT NULL DEFAULT 0,
    notes VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_watch_list_items_list 
        FOREIGN KEY (watch_list_id) REFERENCES watch_lists(id) ON DELETE CASCADE,
    CONSTRAINT fk_watch_list_items_ticker 
        FOREIGN KEY (ticker_id) REFERENCES tickers(id) ON DELETE SET NULL,
    CONSTRAINT ck_watch_list_items_ticker_xor_external 
        CHECK (
            (ticker_id IS NOT NULL AND external_symbol IS NULL) OR
            (ticker_id IS NULL AND external_symbol IS NOT NULL)
        ),
    CONSTRAINT uk_watch_list_items_list_ticker 
        UNIQUE (watch_list_id, ticker_id) 
        WHERE ticker_id IS NOT NULL,
    CONSTRAINT uk_watch_list_items_list_external 
        UNIQUE (watch_list_id, external_symbol) 
        WHERE external_symbol IS NOT NULL
);

CREATE INDEX idx_watch_list_items_list_id ON watch_list_items(watch_list_id);
CREATE INDEX idx_watch_list_items_ticker_id ON watch_list_items(ticker_id);
CREATE INDEX idx_watch_list_items_external_symbol ON watch_list_items(external_symbol);
CREATE INDEX idx_watch_list_items_flag_color ON watch_list_items(flag_color);
CREATE INDEX idx_watch_list_items_list_order ON watch_list_items(watch_list_id, display_order);
```

---

## Business Rules (Database Level)

### 1. הגבלת מספר רשימות

- **לא ברמת DB**: בדיקה ב-Business Logic Service
- **Reason**: גמישות לשינוי בעתיד

### 2. הגבלת מספר טיקרים לרשימה

- **לא ברמת DB**: בדיקה ב-Business Logic Service
- **Reason**: גמישות לשינוי בעתיד

### 3. שמירת סדר ידני

- **DB Level**: שדה `display_order` בכל טבלה
- **Business Logic**: עדכון order על reorder

### 4. טיקר יחיד ברשימה

- **DB Level**: UNIQUE constraints
- **Prevents**: כפילות באותה רשימה

---

## Migration Strategy

### Step 1: Create Tables

```sql
-- Migration: create_watch_lists_tables
-- Version: migration_20250128_create_watch_lists
```

### Step 2: Add Sample Data (Optional)

```sql
-- For testing/development
INSERT INTO watch_lists (user_id, name, icon, color_hex) 
VALUES (1, 'Tech Stocks', 'chart-line', '#26baac');
```

---

## Data Integrity Considerations

### On Ticker Deletion

- **Scenario**: טיקר נמחק מ-tickers table
- **Action**: `ticker_id` ב-watch_list_items מוגדר ל-NULL
- **Result**: הפריט נשאר עם `external_symbol` (אם קיים)

### On Watch List Deletion

- **Scenario**: רשימה נמחקת
- **Action**: CASCADE DELETE - כל הפריטים נמחקים
- **Reason**: אין משמעות לפריטים בלי רשימה

### On User Deletion

- **Scenario**: משתמש נמחק
- **Action**: CASCADE DELETE - כל הרשימות נמחקות
- **Result**: כל הפריטים נמחקים גם (cascade)

---

## Performance Considerations

### Indexes

- ✅ All foreign keys indexed
- ✅ Composite index for user + order queries
- ✅ Index on flag_color for filtered queries

### Query Optimization

- **Common Query**: Get all lists for user with item count

  ```sql
  SELECT wl.*, COUNT(wli.id) as item_count
  FROM watch_lists wl
  LEFT JOIN watch_list_items wli ON wl.id = wli.watch_list_id
  WHERE wl.user_id = ?
  GROUP BY wl.id
  ORDER BY wl.display_order;
  ```

---

## Future Enhancements (Not in v1)

### Possible Additions

1. **Shared Watchlists**: `shared_with_user_id` field
2. **Watchlist Templates**: `template_id` field
3. **Tags on Items**: Many-to-many עם tags table
4. **Watch History**: `viewed_at` timestamps
5. **Collaborative Editing**: `last_edited_by_user_id`

---

**סיכום:** הסכמה תומכת בכל הדרישות עם תמיכה מלאה בטיקרים חיצוניים, ריבוי משתמשים, וסידור ידני. כל ה-constraints ו-indexes מתוכננים לביצועים מיטביים.
























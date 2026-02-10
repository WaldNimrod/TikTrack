# 🔍 סריקת ואיסוף חומרים לשלב 3: תכנון, טריידים, רשימות צפייה

**תאריך:** 2026-01-31  
**גרסה:** v1.1.0  
**סטטוס:** 🔍 **סריקה ראשונית - מוכן ליצירת בלופרינטים**

**⚠️ כלל קריטי - Blueprint = תבנית עיצובית בלבד:**
- **מטרה:** יצירת ממשק מדויק ויזואלית ומבחינת CSS
- **מידע:** שימוש במידע דמה (mock data) בלבד
- **לא מתעסקים עם:** מהיכן מגיע המידע, איך הוא מחושב, או איך הוא נשמר
- **רק עיצוב:** תבנית עיצובית מדויקת ונקייה בלבד
- **מבוסס על:** Legacy Files + אפיון קיים + סגנונות קיימים (קישור אליהם)

---

## 📋 סקירה כללית

מסמך זה מכיל את כל החומרים שנאספו עבור שלב 3: השלמת עמודים - תכנון, טריידים, רשימות צפייה.

### **עמודים בשלב 3:**

1. **תכנון טריידים** (`trade_plans`)
2. **טריידים** (`trades`)
3. **רשימות צפייה** (`watch_lists`)

---

## 📊 1. תכנון טריידים (`trade_plans`)

### **1.1 Legacy Files**

**קובץ Legacy:**
- `/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/trade_plans.html`
- **סטטוס:** ✅ נמצא

**מבנה הטבלה ב-Legacy:**
| עמודה | תיאור |
|-------|--------|
| טיקר | קישור לטיקר |
| נוצר ב: | תאריך יצירה |
| סטטוס | סטטוס התכנון |
| סוג | סוג התכנון |
| צד | כיוון (קניה/מכירה) |
| כמות | כמות מתוכננת |
| מחיר | מחיר מתוכנן |
| השקעה | סכום השקעה מתוכנן |
| סיכוי | סיכוי רווח |
| סיכון | סיכון |
| יחס | יחס סיכון/תגמול |
| עודכן | תאריך עדכון |
| פעולות | תפריט פעולות |

**סיכום מידע:**
- סה"כ תכנונים
- סה"כ השקעה
- השקעה ממוצעת
- רווח כולל

**כפתורי פעולה:**
- הוסף תכנון חדש
- הצג/הסתר

### **1.2 Database Schema**

**טבלה:** `user_data.trade_plans`

**שדות עיקריים:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `ticker_id` (UUID, FK → tickers)
- `trading_account_id` (UUID, FK → trading_accounts, nullable)
- `strategy_id` (UUID, FK → strategies, nullable)
- `plan_name` (VARCHAR(200))
- `thesis` (TEXT)
- `direction` (trade_direction ENUM)
- `planned_entry_price` (NUMERIC(20, 8))
- `planned_quantity` (NUMERIC(20, 8))
- `planned_stop_loss` (NUMERIC(20, 8))
- `planned_take_profit` (NUMERIC(20, 8))
- `planned_risk_amount` (NUMERIC(20, 6))
- `planned_reward_amount` (NUMERIC(20, 6))
- `risk_reward_ratio` (NUMERIC(10, 2))
- `status` (trade_status ENUM) - DEFAULT 'DRAFT'
- `planned_entry_date` (DATE)
- `activated_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- `deleted_at` (TIMESTAMPTZ)
- `metadata` (JSONB)
- `tags` (VARCHAR(255)[])

**Indexes:**
- `idx_trade_plans_user` (user_id, created_at DESC)
- `idx_trade_plans_ticker` (ticker_id)
- `idx_trade_plans_status` (status)
- `idx_trade_plans_strategy` (strategy_id)

### **1.3 OpenAPI Spec**

**סטטוס:** ⏳ צריך לבדוק
**קובץ:** `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml`

### **1.4 Field Maps**

**סטטוס:** ✅ נמצא
**קבצים:**
- `documentation/01-ARCHITECTURE/LOGIC/WP_20_09_C_FIELD_MAP_PLAYBOOKS.md` - **Playbooks** (ייתכן שזה trade_plans)
- `documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_PLAYBOOKS.md` - גרסה נוספת

**הערה:** צריך לבדוק אם `playbooks` = `trade_plans` או שזה משהו אחר

---

## 📊 2. טריידים (`trades`)

### **2.1 Legacy Files**

**קובץ Legacy:**
- `/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/trades.html`
- **סטטוס:** ✅ נמצא

**מבנה הטבלה ב-Legacy:**
| עמודה | תיאור |
|-------|--------|
| טיקר | קישור לטיקר |
| כמות | כמות בטרייד |
| מחיר ממוצע | מחיר ממוצע |
| P/L | רווח/הפסד |
| סטטוס | סטטוס הטרייד |
| סוג | סוג הטרייד |
| צד | כיוון (קניה/מכירה) |
| חשבון מסחר | חשבון מסחר |
| נוצר ב: | תאריך יצירה |
| נסגר ב | תאריך סגירה |
| עודכן | תאריך עדכון |
| פעולות | תפריט פעולות |

**כפתורי פעולה:**
- הוסף טרייד חדש
- הצג/הסתר

### **2.2 Database Schema**

**טבלה:** `user_data.trades`

**שדות עיקריים:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `ticker_id` (UUID, FK → tickers)
- `trading_account_id` (UUID, FK → trading_accounts)
- `parent_trade_id` (UUID, FK → trades, nullable) - היררכיה
- `strategy_id` (UUID, FK → strategies, nullable)
- `origin_plan_id` (UUID, FK → trade_plans, nullable)
- `trigger_alert_id` (UUID, FK → alerts, nullable)
- `direction` (trade_direction ENUM)
- `quantity` (NUMERIC(20, 8)) - NOT NULL, CHECK > 0
- `avg_entry_price` (NUMERIC(20, 8))
- `avg_exit_price` (NUMERIC(20, 8))
- `stop_loss` (NUMERIC(20, 8))
- `take_profit` (NUMERIC(20, 8))
- `realized_pl` (NUMERIC(20, 6)) - DEFAULT 0
- `unrealized_pl` (NUMERIC(20, 6)) - DEFAULT 0
- `total_pl` (NUMERIC(20, 6)) - GENERATED (realized + unrealized)
- `commission` (NUMERIC(20, 6)) - DEFAULT 0
- `fees` (NUMERIC(20, 6)) - DEFAULT 0
- `status` (trade_status ENUM) - DEFAULT 'DRAFT'
- `calculated_status` (calculated_trade_status ENUM)
- `entry_date` (TIMESTAMPTZ)
- `exit_date` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- `deleted_at` (TIMESTAMPTZ)
- `metadata` (JSONB)
- `tags` (VARCHAR(255)[])

**Indexes:**
- `idx_trades_user` (user_id, created_at DESC)
- `idx_trades_ticker` (ticker_id)
- `idx_trades_account` (trading_account_id)
- `idx_trades_status` (status)
- `idx_trades_parent` (parent_trade_id)
- `idx_trades_strategy` (strategy_id)

**Constraints:**
- `trades_positive_quantity` CHECK (quantity > 0)
- `trades_not_self_parent` CHECK (parent_trade_id IS NULL OR parent_trade_id != id)

### **2.3 OpenAPI Spec**

**סטטוס:** ⏳ צריך לבדוק
**קובץ:** `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml`

### **2.4 Field Maps**

**סטטוס:** ✅ נמצא
**קבצים:**
- `documentation/01-ARCHITECTURE/LOGIC/WP_20_09_C_FIELD_MAP_TRADES.md` - **Trades**
- `documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TRADES.md` - גרסה נוספת

---

## 📊 3. רשימות צפייה (`watch_lists`)

### **3.1 Legacy Files**

**קובץ Legacy:**
- `/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/watch_lists.html`
- **סטטוס:** ✅ נמצא

**מבנה הטבלה ב-Legacy:**
| עמודה | תיאור |
|-------|--------|
| דגל | דגל/סימון |
| סמל | סמל הטיקר |
| מחיר | מחיר נוכחי |
| שינוי | שינוי במחיר |
| שינוי % | שינוי באחוזים |
| שינוי היום % | שינוי יומי באחוזים |
| ATR | Average True Range |
| פוזיציה | פוזיציה קיימת |
| שינוי בערך | שינוי בערך הפוזיציה |
| רווח/הפסד | P/L |
| רווח/הפסד % | P/L באחוזים |
| פעולות | תפריט פעולות |

**תצוגות:**
- תצוגת טבלה
- תצוגת כרטיסים
- תצוגה קומפקטית

**כפתורי פעולה:**
- הוסף טיקר לרשימה
- הצג/הסתר

### **3.2 Database Schema**

**סטטוס:** ⚠️ **לא נמצאה טבלת watch_lists ב-DB Schema**

**הערה:** צריך לבדוק:
1. האם קיימת טבלה נפרדת?
2. האם זה חלק מטבלה אחרת?
3. האם צריך ליצור טבלה חדשה?

**טבלאות אפשריות:**
- `user_data.user_tickers` - אולי רשימות צפייה הן חלק מטבלה זו?
- צריך לבדוק עם Team 20/10

### **3.3 OpenAPI Spec**

**סטטוס:** ⏳ צריך לבדוק
**קובץ:** `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml`

### **3.4 Field Maps**

**סטטוס:** ⚠️ **לא נמצא**
**הערה:** צריך לבדוק אם קיים Field Map לרשימות צפייה או שצריך ליצור אחד חדש

---

## 📝 סיכום חומרים זמינים

### **תכנון טריידים (`trade_plans`):**
- ✅ Legacy File: `trade_plans.html`
- ✅ DB Schema: `user_data.trade_plans`
- ⏳ OpenAPI Spec: צריך לבדוק (לא נמצא endpoint ספציפי)
- ⚠️ Field Map: **לא נמצא** - Playbooks זה לא trade_plans (Playbooks = מנוע חוקים)

### **טריידים (`trades`):**
- ✅ Legacy File: `trades.html`
- ✅ DB Schema: `user_data.trades`
- ✅ OpenAPI Spec: נמצא endpoint `/trades`
- ✅ Field Map: `WP_20_09_C_FIELD_MAP_TRADES.md`

### **רשימות צפייה (`watch_lists`):**
- ✅ Legacy File: `watch_lists.html`
- ⚠️ DB Schema: **לא נמצא** - צריך הבהרה (אולי חלק מ-`user_tickers`?)
- ⏳ OpenAPI Spec: צריך לבדוק
- ⚠️ Field Map: **לא נמצא** - צריך לבדוק או ליצור

---

## ❓ שאלות פתוחות

### **1. רשימות צפייה - DB Schema**
- **שאלה:** האם קיימת טבלה נפרדת לרשימות צפייה?
- **אפשרויות:**
  - טבלה נפרדת `user_data.watch_lists` + `user_data.watch_list_items`
  - חלק מ-`user_data.user_tickers` עם flag
  - צריך ליצור טבלה חדשה
- **פעולה:** לשאול את Team 20/10

### **2. תכנון טריידים - Field Map**
- **שאלה:** האם קיים Field Map ל-`trade_plans`?
- **מצב נוכחי:** נמצא `WP_20_09_C_FIELD_MAP_PLAYBOOKS.md` אבל זה מנוע חוקים, לא trade_plans
- **פעולה:** לשאול את Team 20/10 אם קיים Field Map ל-trade_plans או שצריך ליצור אחד

### **3. OpenAPI Specs**
- **שאלה:** האם קיימים endpoints עבור `trade_plans` ו-`watch_lists`?
- **מצב נוכחי:** נמצא endpoint `/trades` אבל לא נמצא endpoint ל-`trade_plans` או `watch_lists`
- **פעולה:** לבדוק ב-`OPENAPI_SPEC_V2.5.2.yaml` או לשאול את Team 20/10

### **4. רשימות צפייה - Field Map**
- **שאלה:** האם קיים Field Map ל-`watch_lists`?
- **פעולה:** לבדוק או לשאול את Team 20/10

---

## 🎯 תהליך עבודה נכון - Team 31 (Blueprint)

### **⚠️ כלל קריטי - Blueprint = תבנית עיצובית בלבד:**
- **מטרה:** יצירת ממשק מדויק ויזואלית ומבחינת CSS
- **מידע:** שימוש במידע דמה (mock data) בלבד
- **לא מתעסקים עם:** מהיכן מגיע המידע, איך הוא מחושב, או איך הוא נשמר
- **רק עיצוב:** תבנית עיצובית מדויקת ונקייה בלבד

### **תהליך עבודה נכון:**

#### **שלב 1: מחקר וניתוח מקיף** 🔍
1. **סקירת Legacy Files** - `/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/`
   - ✅ קריאה וניתוח של קובץ HTML Legacy לעמוד המטרה
   - ✅ לימוד מבנה, קומפוננטות וסגנונות
   - ✅ זיהוי כל מחלקות CSS, IDs ו-data attributes
   - ✅ זיהוי תלויות JavaScript או אינטראקציות (למטרות עיצוב בלבד)

2. **בדיקת DB Schema** - להבנת השדות הקיימים
   - ✅ בדיקת טבלאות DB רלוונטיות
   - ✅ בדיקת שדות וטיפוסים
   - ✅ השוואה לשדות ב-Legacy

3. **בדיקת OpenAPI Spec** - להבנת מבנה הנתונים
   - ✅ בדיקת endpoints רלוונטיים (אם קיימים)
   - ✅ בדיקת request/response schemas

4. **ניתוח מבנה טבלאות קיים** - `tickers_BLUEPRINT.html` או `trading_accounts_BLUEPRINT.html` כתבנית
   - ✅ השוואה למבנה טבלאות קיים
   - ✅ זיהוי דפוסים משותפים
   - ✅ זיהוי קומפוננטות LEGO System

#### **שלב 2: יצירת בלופרינט** 🏗️
1. **בסיס: תבנית קיימת** - `tickers_BLUEPRINT.html` או `trading_accounts_BLUEPRINT.html`
   - ✅ העתקת מבנה בסיסי מתבנית קיימת
   - ✅ שמירה על מבנה HTML זהה
   - ✅ שמירה על מחלקות CSS זהה
   - ✅ התאמה לשדות ספציפיים לפי Legacy

2. **שימוש בסגנונות קיימים** - קישור אליהם, לא יצירת חדשים
   - ✅ שימוש במחלקות CSS מ-`phoenix-base.css` (קריאה בלבד)
   - ✅ שימוש במחלקות CSS מ-`phoenix-components.css` (קריאה בלבד)
   - ✅ שימוש במחלקות CSS מ-`phoenix-header.css` (קריאה בלבד)
   - ✅ **רק תיקונים ספציפיים** - רק ב-inline `<style>` אם נדרש

3. **התאמה לפי Legacy ואפיון**
   - ✅ התאמת מבנה הטבלה לפי Legacy
   - ✅ התאמת עמודות לפי Legacy ואפיון
   - ✅ התאמת פילטרים לפי Legacy
   - ✅ הוספת מידע דמה (mock data) בלבד

#### **שלב 3: בדיקות ואימות** ✅
1. בדיקת מבנה HTML
2. בדיקת CSS (שימוש בסגנונות קיימים)
3. בדיקת טבלאות
4. בדיקת פילטרים

#### **שלב 4: תיעוד והגשה** 📤
1. יצירת מדריך יישום מפורט
2. יצירת מסמך הגשה
3. עדכון אינדקס

---

## 🎯 צעדים הבאים

1. **סקירת Legacy Files** - קריאה וניתוח של `trade_plans.html`, `trades.html`, `watch_lists.html`
2. **יצירת בלופרינטים** - מבוסס על תבנית קיימת (`tickers_BLUEPRINT.html`) והתאמה לפי Legacy
3. **שימוש בסגנונות קיימים** - קישור לקבצי CSS קיימים, לא יצירת חדשים
4. **הוספת מידע דמה** - mock data בלבד, לא קוד מרכזי
5. **תיעוד והגשה** - מדריך יישום ומסמך הגשה

---

## 📚 קבצים רלוונטיים

### **Legacy Files:**
- `/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/trade_plans.html`
- `/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/trades.html`
- `/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/watch_lists.html`

### **DB Schema:**
- `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`

### **OpenAPI Spec:**
- `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/documentation/05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml`

### **Field Maps:**
- `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/documentation/01-ARCHITECTURE/LOGIC/`

---

**Team 31 (Blueprint)**  
**Status:** 🔍 **MATERIALS SCAN COMPLETE**  
**Next Step:** בדיקת OpenAPI Specs ו-Field Maps, הבהרת DB Schema לרשימות צפייה

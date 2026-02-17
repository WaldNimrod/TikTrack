# 🧊 משימה 20.2: תכנון שכבת הזהות והגישה (Identity Brick)

**id:** `WP_20_02_IDENTITY_AND_ACCESS`  
**owner:** Team 20 (Backend Implementation)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-05  
**version:** v1.0

---

**צוות מבצע:** 20 | **קדימות:** P0 (The Master Brick) 

### 🎯 1. יעדי המשימה 
הגדרת תשתית המשתמשים וההרשאות שתשמש כבסיס לכל המערכת. 

### 🧱 2. סקואופ לביצוע (Detailed Scope) 
#### א. ישות משתמש (User Entity) 
- [ ] **Schema:** טבלת `users` (ULID, email, password_hash, is_active). 
- [ ] **Roles:** שדה `role_id` לקישור להרשאות. 
#### ב. מודל קבוצות והרשאות (Flat RBAC) 
- [ ] **Groups:** טבלת `groups` (ID, name, priority). 
- [ ] **Permissions:** טבלת `permissions` (key, description). 
- [ ] **Logic:** הגדרת מודל ה-Additive (איחוד הרשאות). 
#### ג. חוזה אבטחה (Auth Contract) 
- [ ] **JWT:** הגדרת מבנה ה-Payload של ה-Token. 
- [ ] **API:** Endpoint של `POST /api/v1/auth/login` ו-`GET /api/v1/auth/me`. 

### 🏁 3. תוצרים נדרשים 
- `IDENTITY_SCHEMA.json`: הגדרת הטבלאות והקשרים. 
- `AUTH_FLOW.md`: תרשים זרימת האוטנטיקציה ב-Phoenix. 
# 🔐 Database Credentials Configuration - TikTrack Phoenix

**Version:** 1.0  
**Date:** 2026-01-31  
**Session:** SESSION_01  
**Status:** ✅ **CONFIGURED**  
**Maintained by:** Team 60 (DevOps & Platform)  
**Last Updated:** 2026-01-31

---

## 📋 Overview

This document provides secure reference for database credentials configuration. **The actual password is stored in `api/.env` file (which is in `.gitignore`) and should NEVER be committed to git.**

---

## 🗄️ Database Configuration

### **Database Name:**
```
TikTrack-phoenix-db
```

### **Database User:**
```
TikTrackDbAdmin
```

### **Database Connection Format:**
```
postgresql://TikTrackDbAdmin:<PASSWORD>@localhost:5432/TikTrack-phoenix-db
```

⚠️ **SECURITY:** Replace `<PASSWORD>` with the actual password stored in `api/.env`.

---

## 🔒 Password Security

### **Password Storage:**
- **Location:** `api/.env` file (already in `.gitignore`)
- **Format:** Cryptographically secure random string (32+ characters)
- **Generation:** Python `secrets.token_urlsafe()` or equivalent
- **Backup:** Store in secure password manager

### **Security Best Practices:**
1. ✅ Password stored in `.env` file (not committed to git)
2. ✅ Password stored in secure password manager
3. ✅ Password is cryptographically secure (32+ characters)
4. ✅ Never commit `.env` file to git
5. ✅ Rotate password periodically for security

---

## 📝 Database Setup Instructions

### **1. Create Database:**
```bash
createdb TikTrack-phoenix-db
```

### **2. Create User:**
```sql
CREATE USER TikTrackDbAdmin WITH PASSWORD '<secure-password>';
```

### **3. Grant Privileges:**
```sql
GRANT ALL PRIVILEGES ON DATABASE "TikTrack-phoenix-db" TO TikTrackDbAdmin;
```

### **4. Create Schemas:**
```sql
\c TikTrack-phoenix-db
CREATE SCHEMA IF NOT EXISTS user_data;
CREATE SCHEMA IF NOT EXISTS market_data;
GRANT ALL ON SCHEMA user_data TO TikTrackDbAdmin;
GRANT ALL ON SCHEMA market_data TO TikTrackDbAdmin;
```

### **5. Set Default Privileges:**
```sql
ALTER DEFAULT PRIVILEGES IN SCHEMA user_data GRANT ALL ON TABLES TO TikTrackDbAdmin;
ALTER DEFAULT PRIVILEGES IN SCHEMA market_data GRANT ALL ON TABLES TO TikTrackDbAdmin;
```

### **6. Configure Environment Variable:**
```bash
# In api/.env file:
DATABASE_URL=postgresql://TikTrackDbAdmin:<PASSWORD>@localhost:5432/TikTrack-phoenix-db
```

---

## ✅ Verification

### **Test Database Connection:**
```bash
psql postgresql://TikTrackDbAdmin:<PASSWORD>@localhost:5432/TikTrack-phoenix-db -c "SELECT 1;"
```

### **Check Backend Health:**
```bash
curl http://localhost:8082/health
```

**Expected Response:**
```json
{
    "status": "ok",
    "components": {
        "database": {
            "status": "ok",
            "message": "Database connection successful"
        }
    }
}
```

---

## 📎 Related Documents

1. **Infrastructure Guide:** `documentation/01-ARCHITECTURE/TT2_INFRASTRUCTURE_GUIDE.md`
2. **Database Schema:** `04-ENGINEERING_&_ARCHITECTURE/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
3. **Environment Variables:** `api/.env` (not in git)

---

## 👥 System Users

### **User 1: Primary Administrator**
- **Username:** `nimrod`
- **Email:** `nimrod@mezoo.co`
- **Phone:** `NULL` (no phone number)
- **Password:** `4181`
- **Role:** `SUPERADMIN`
- **Status:** ✅ **CREATED** - Active, Email verified

### **User 2: Secondary Administrator**
- **Username:** `nimrod_wald`
- **Email:** `waldnimrod@gmail.com`
- **Phone:** `NULL` (no phone number)
- **Password:** `4181`
- **Role:** `ADMIN`
- **Status:** ✅ **CREATED** - Active, Email verified

**Password Hash:** `$2b$12$2ZlMcAQvc63M5UudvUzUM.gYjOXCIGrRUwHQZ0BgWqcAP8an.qQtG` (bcrypt for password `4181`)

⚠️ **SECURITY:** User passwords are bcrypt hashed in database. Never store plain text passwords.

---

## 📋 Database Schema Status

### **Authentication Tables Created:**

1. ✅ **`user_data.users`** - Core users table
   - Supports authentication (username, email, password_hash)
   - Supports phone authentication (phone_number, phone_verified)
   - Role-based access control (USER, ADMIN, SUPERADMIN)
   - User status management (is_active, is_email_verified)

2. ✅ **`user_data.password_reset_requests`** - Password recovery
   - Supports email and SMS password reset
   - Token and verification code management

3. ✅ **`user_data.user_refresh_tokens`** - Refresh token management
   - Stores refresh tokens for JWT authentication
   - Supports token rotation and revocation
   - Foreign key to `user_data.users(id)` ON DELETE CASCADE
   - Unique constraint on `jti` (JWT ID)
   - Indexes on `user_id`, `jti`, and `expires_at`
   - **Columns:**
     - `id` - UUID PRIMARY KEY
     - `user_id` - UUID NOT NULL (FK to users.id)
     - `token_hash` - VARCHAR(255) NOT NULL (SHA-256 hash)
     - `jti` - VARCHAR(255) UNIQUE NOT NULL (JWT ID)
     - `expires_at` - TIMESTAMPTZ NOT NULL
     - `revoked_at` - TIMESTAMPTZ NULL (NULL if active)
     - `created_at` - TIMESTAMPTZ NOT NULL DEFAULT NOW()

4. ✅ **`user_data.notes`** - User notes
   - Polymorphic notes system

**Note:** Additional tables will be created incrementally during development.

---

## 🔄 Change Log

### **2026-01-31 (Initial Setup):**
- ✅ Database `TikTrack-phoenix-db` created
- ✅ User `TikTrackDbAdmin` created
- ✅ Password configured securely
- ✅ All privileges granted
- ✅ Schemas created (`user_data`, `market_data`)
- ✅ Default privileges configured
- ✅ Backend connection verified

### **2026-01-31 (System Users):**
- ✅ Primary admin user created (`nimrod`, SUPERADMIN)
- ✅ Secondary admin user created (`nimrod_wald`, ADMIN)
- ✅ Authentication tables created (`user_data.users`, `user_data.password_reset_requests`, `user_data.notes`)
- ✅ Users ready for login testing

### **2026-01-31 (Refresh Token Table):**
- ✅ `user_data.user_refresh_tokens` table created
- ✅ Table structure verified (UUID id, user_id FK, token_hash, jti, expires_at, revoked_at, created_at)
- ✅ Constraints created (jti_not_empty, hash_not_empty, FK to users, unique jti)
- ✅ Indexes created (user_id, jti, expires_at)
- ✅ Backend server restarted
- ✅ Ready for refresh token operations

---

**Prepared by:** Team 60 (DevOps & Platform)  
**Date:** 2026-01-31  
**log_entry | [Team 60] | DATABASE_CREDENTIALS_CONFIGURED | COMPLETE | GREEN | 2026-01-31**

---

⚠️ **REMINDER:** The actual password is stored in `api/.env` file. Never commit this file to git. Store the password securely in a password manager.

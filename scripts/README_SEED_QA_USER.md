# QA Test User Seed - README

**Team 60 (DevOps & Platform)**  
**Created:** 2026-02-07  
**Purpose:** Permanent QA test user for Gate B Runtime/E2E testing

---

## 📋 Overview

This seed script ensures that a permanent QA test user (`TikTrackAdmin` / `4181`) is available in the database after every reset/refresh for QA testing purposes.

---

## 👤 QA Test User Credentials

| Field | Value |
|-------|-------|
| **Username** | `TikTrackAdmin` |
| **Password** | `4181` |
| **Email** | `qatest@tiktrack.com` |
| **Role** | `ADMIN` |
| **Status** | Active, Email Verified |

---

## 🚀 Usage

### **Method 1: Python Script (Recommended)**

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix
python3 scripts/seed_qa_test_user.py
```

**Features:**
- ✅ Creates/updates QA test user
- ✅ Verifies user exists
- ✅ Tests login endpoint (if backend is running)
- ✅ Returns exit code 0 on success

### **Method 2: SQL Script Directly**

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix
psql -U TikTrackDbAdmin -d TikTrack-phoenix-db -f scripts/seed_qa_test_user.sql
```

---

## 🔄 Running After DB Reset/Refresh

### **After Database Reset:**

1. **Restore database schema** (if needed)
2. **Run seed script:**
   ```bash
   python3 scripts/seed_qa_test_user.py
   ```

### **Automated Integration:**

**Option 1: Add to reset script**
```bash
# After database reset commands
python3 scripts/seed_qa_test_user.py
```

**Option 2: Add to CI/CD pipeline**
```yaml
# After database reset step
- name: Seed QA Test User
  run: python3 scripts/seed_qa_test_user.py
```

**Option 3: Add to Docker entrypoint**
```bash
# In docker-entrypoint.sh or similar
python3 /app/scripts/seed_qa_test_user.py
```

---

## ✅ Verification

### **1. Check User Exists:**

```sql
SELECT 
    id,
    username,
    email,
    role,
    is_active,
    is_email_verified
FROM user_data.users
WHERE username = 'TikTrackAdmin';
```

### **2. Test Login:**

```bash
curl -X POST http://localhost:8082/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username_or_email": "TikTrackAdmin",
    "password": "4181"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

---

## 📝 Script Behavior

### **If User Exists:**
- ✅ Updates password hash (ensures it's correct)
- ✅ Ensures user is active
- ✅ Ensures email is verified
- ✅ Updates `updated_at` timestamp

### **If User Doesn't Exist:**
- ✅ Creates new user with specified credentials
- ✅ Sets role to ADMIN
- ✅ Sets is_active = TRUE
- ✅ Sets is_email_verified = TRUE

---

## 🔒 Security Notes

- ✅ Password is bcrypt hashed in database
- ✅ Password hash: `$2b$12$2ZlMcAQvc63M5UudvUzUM.gYjOXCIGrRUwHQZ0BgWqcAP8an.qQtG`
- ⚠️ **DO NOT** commit plain text passwords to git
- ⚠️ **DO NOT** use this user in production

---

## 📞 Support

**For questions or issues:**
- 📧 `_COMMUNICATION/team_60/`
- 📋 Format: `TEAM_[ID]_TO_TEAM_60_SEED_QA_USER_[SUBJECT].md`

---

**Team 60 (DevOps & Platform)**  
**Last Updated:** 2026-02-07

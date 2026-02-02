# 🏗️ TikTrack Phoenix - Infrastructure Guide

**Version:** 2.1  
**Date:** 2026-01-31  
**Session:** SESSION_01  
**Status:** ✅ **COMPLETE**  
**Last Updated:** 2026-01-31 (Database Credentials Configuration)

---

## 📋 Overview

מדריך מקיף לתשתיות פרויקט פיניקס. מסמך זה מכסה את כל ההיבטים הטכניים של התשתית - Frontend, Backend, Database, Environment, ו-Deployment.

**קהל יעד:**
- מפתחים חדשים בפרויקט
- Team 60 (DevOps & Platform)
- מפתחים עתידיים
- מנהלי פרויקטים

---

## 🎯 Table of Contents

1. [Stack Overview](#stack-overview)
2. [Frontend Infrastructure](#frontend-infrastructure)
3. [Backend Infrastructure](#backend-infrastructure)
4. [Database Infrastructure](#database-infrastructure)
5. [Environment Configuration](#environment-configuration)
6. [Development Setup](#development-setup)
7. [Build & Deployment](#build--deployment)
8. [Troubleshooting](#troubleshooting)
9. [Team Responsibilities](#team-responsibilities)

---

## 🛠️ Stack Overview

### **Technology Stack**

#### **Frontend:**
- **React:** ^18.2.0
- **React DOM:** ^18.2.0
- **React Router:** ^6.20.0
- **Vite:** ^5.0.0 (Build Tool)
- **Axios:** ^1.6.0 (HTTP Client)
- **Pico CSS:** ^1.0 (CSS Framework - CDN)

#### **Backend:**
- **Python:** 3.11+
- **FastAPI:** Latest
- **PostgreSQL:** 14+
- **SQLAlchemy:** Latest (ORM)
- **Pydantic:** Latest (Data Validation)
- **JWT:** PyJWT (Authentication)

#### **Database:**
- **PostgreSQL:** 14+
- **ULID:** External IDs
- **BIGINT:** Internal IDs
- **JSONB:** Flexible data storage

### **Ports:**
- **Frontend V2:** 8080 (as per Master Blueprint: "Ports: V2 (8080), Legacy (8081)")
- **Backend API:** 8082
- **Legacy System:** 8081

---

## 🎨 Frontend Infrastructure

### **Build System**

#### **Package Management:**
- **File:** `ui/package.json`
- **Type:** `module` (ESM)
- **Package Manager:** npm (recommended)

#### **Available Scripts:**
```bash
npm run dev      # Start development server (port 8080 - V2)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

#### **Vite Configuration:**
- **File:** `ui/vite.config.js`
- **Dev Server Port:** 8080 (V2 port as per Master Blueprint)
- **API Proxy:** `/api` → `http://localhost:8082` (Backend API)
- **Build Output:** `dist/`
- **Source Maps:** Enabled

**Key Configuration:**
```javascript
server: {
  port: 8080,  // V2 port as per Master Blueprint
  proxy: {
    '/api': {
      target: 'http://localhost:8082',  // Backend API
      changeOrigin: true,
      secure: false,
    },
  },
}
```

#### **Entry Points:**
- **HTML:** `ui/index.html`
- **React Entry:** `ui/src/main.jsx`
- **Root Element:** `<div id="root"></div>`

### **Router Infrastructure**

#### **Router Setup:**
- **File:** `ui/src/router/AppRouter.jsx`
- **Type:** BrowserRouter (HTML5 History API)
- **Base:** `/` (root)

#### **Route Structure:**
```
Public Routes:
  /login              → LoginForm
  /register           → RegisterForm
  /reset-password     → PasswordResetFlow

Protected Routes:
  /dashboard          → Dashboard (ProtectedRoute wrapper)
  /accounts           → AccountsView (ProtectedRoute wrapper)
  /brokers            → BrokersView (ProtectedRoute wrapper)
  /cash               → CashView (ProtectedRoute wrapper)

Default Routes:
  /                   → Redirects to /login
  *                   → 404 fallback (redirects to /login)
```

### **CSS Loading Order (CRITICAL)**

⚠️ **DO NOT CHANGE THIS ORDER** - It follows the CSS Standards Protocol.

**Loading Sequence:**
1. **Pico CSS** (CDN in `index.html`)
   - Framework base styles
   - Loaded first to establish foundation

2. **phoenix-base.css** (`ui/src/styles/phoenix-base.css`)
   - Global defaults & DNA variables (`:root`)
   - Overrides Pico CSS where needed

3. **phoenix-components.css** (`ui/src/styles/phoenix-components.css`)
   - LEGO components (reusable building blocks)
   - Semantic tags (tt-container, tt-section, etc.)

4. **phoenix-tables.css** (`ui/src/styles/phoenix-tables.css`) ⚠️ **נדרש להעברה מסטייג'ינג**
   - Unified tables system styles
   - BEM naming convention (phoenix-table-*)
   - Must be loaded after phoenix-components.css

5. **phoenix-header.css** (`ui/src/styles/phoenix-header.css`)
   - Header component styles
   - Only loaded if header is used

6. **Page-specific CSS** (e.g., `D15_IDENTITY_STYLES.css`)
   - Loaded per route by Team 30
   - Page-specific overrides

**Implementation:**
CSS files are imported in `ui/src/main.jsx` in the exact order listed above.

### **Dependencies**

#### **Runtime Dependencies:**
- **react** (^18.2.0) - Core React library
- **react-dom** (^18.2.0) - React DOM renderer
- **react-router-dom** (^6.20.0) - Client-side routing
- **axios** (^1.6.0) - HTTP client for API requests

#### **Development Dependencies:**
- **vite** (^5.0.0) - Build tool and dev server
- **@vitejs/plugin-react** (^4.2.0) - Vite plugin for React
- **eslint** (^8.55.0) - Code linting

---

## ⚙️ Backend Infrastructure

### **Application Structure**

```
api/
├── main.py                 # FastAPI application entry point
├── core/
│   ├── config.py          # Configuration management
│   └── database.py        # Database connection & session
├── models/                # SQLAlchemy models
├── schemas/               # Pydantic schemas
├── routers/               # API route handlers
├── services/              # Business logic
├── utils/                 # Utility functions
└── requirements.txt       # Python dependencies
```

### **FastAPI Configuration**

#### **Main Application:**
- **File:** `api/main.py`
- **Framework:** FastAPI
- **Port:** 8082 (Frontend V2 uses port 8080 per Master Blueprint)
- **CORS:** Enabled (configured for frontend)

#### **Key Features:**
- Async/Await support
- Automatic OpenAPI documentation
- Request validation (Pydantic)
- JWT Authentication
- Refresh Token Rotation

### **Dependencies**

#### **Core Dependencies:**
- **fastapi** - Web framework
- **uvicorn** - ASGI server
- **sqlalchemy** - ORM
- **pydantic** - Data validation
- **python-jose** - JWT handling
- **bcrypt** - Password hashing (direct usage, **no passlib**)
- **python-multipart** - Form data handling
- **cryptography** - Encryption utilities

#### **Database:**
- **psycopg2-binary** - PostgreSQL adapter
- **alembic** - Database migrations (if used)

### **API Endpoints**

#### **Base URL:**
- **Development:** `http://localhost:8082/api/v1`
- **Production:** `https://api.tiktrack.com/api/v1`

#### **Available Endpoints:**
- `/auth/login` - User authentication
- `/auth/register` - User registration
- `/auth/refresh` - Token refresh
- `/auth/logout` - User logout
- `/auth/reset-password` - Password reset
- `/users/me` - Current user profile
- `/user/api-keys` - API keys management

**Full API Documentation:** See `OPENAPI_SPEC_V2.5.2.yaml`

### **Password Hashing (Authentication)**

#### **Implementation:**
- **Library:** `bcrypt` (direct usage, **no passlib**)
- **Location:** `api/services/auth.py`
- **Version:** bcrypt 5.0.0+ (compatible with Python 3.11+)

#### **Functions:**

##### **hash_password(password: str) -> str**
```python
import bcrypt

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password string
    """
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
```

##### **verify_password(plain_password: str, hashed_password: str) -> bool**
```python
import bcrypt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hash using bcrypt.
    
    Args:
        plain_password: Plain text password
        hashed_password: Bcrypt hash string
        
    Returns:
        True if password matches, False otherwise
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False
```

#### **Best Practices:**
- **Salt Generation:** Uses `bcrypt.gensalt()` for automatic salt generation
- **Encoding:** Always encode passwords to UTF-8 before hashing/verification
- **Error Handling:** Wraps verification in try-except for security
- **No passlib:** Direct bcrypt usage (removed passlib in v2.5 due to compatibility issues)

#### **Migration Notes:**
- **Removed:** `passlib` (was causing compatibility issues with bcrypt 5.0.0)
- **Direct API:** Same API (`bcrypt.checkpw` / `bcrypt.hashpw`) - no breaking changes
- **Reference:** See `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DIRECTIVE_AUTH_FIX.md`

---

## 🗄️ Database Infrastructure

### **Database System:**
- **Type:** PostgreSQL 14+
- **Connection:** SQLAlchemy ORM
- **Connection Pool:** Configured in `api/core/database.py`

### **Database Configuration (Production Setup)**

#### **Database Name:**
```
TikTrack-phoenix-db
```

#### **Database User:**
```
TikTrackDbAdmin
```

#### **Database Connection Format:**
```
postgresql://TikTrackDbAdmin:<PASSWORD>@localhost:5432/TikTrack-phoenix-db
```

⚠️ **SECURITY:** The database password is stored in `api/.env` file (which is in `.gitignore`). **Never commit the password to git.** Store the password securely in a password manager.

#### **Database Setup Steps:**
1. **Create Database:**
   ```bash
   createdb TikTrack-phoenix-db
   ```

2. **Create User:**
   ```sql
   CREATE USER TikTrackDbAdmin WITH PASSWORD '<secure-password>';
   ```

3. **Grant Privileges:**
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE "TikTrack-phoenix-db" TO TikTrackDbAdmin;
   ```

4. **Create Schemas:**
   ```sql
   \c TikTrack-phoenix-db
   CREATE SCHEMA IF NOT EXISTS user_data;
   CREATE SCHEMA IF NOT EXISTS market_data;
   GRANT ALL ON SCHEMA user_data TO TikTrackDbAdmin;
   GRANT ALL ON SCHEMA market_data TO TikTrackDbAdmin;
   ```

5. **Set Default Privileges:**
   ```sql
   ALTER DEFAULT PRIVILEGES IN SCHEMA user_data GRANT ALL ON TABLES TO TikTrackDbAdmin;
   ALTER DEFAULT PRIVILEGES IN SCHEMA market_data GRANT ALL ON TABLES TO TikTrackDbAdmin;
   ```

6. **Configure Environment Variable:**
   ```bash
   # In api/.env file:
   DATABASE_URL=postgresql://TikTrackDbAdmin:<PASSWORD>@localhost:5432/TikTrack-phoenix-db
   ```

#### **Password Security:**
- **Password Generation:** Use cryptographically secure random string (32+ characters)
- **Storage:** Store in `api/.env` (already in `.gitignore`)
- **Backup:** Store password in secure password manager
- **Rotation:** Rotate password periodically for security

### **Schema Structure:**
- **External IDs:** ULID strings (for API responses)
- **Internal IDs:** BIGINT (for database relations)
- **Time:** Global UTC
- **Flexible Data:** JSONB columns

### **Key Tables:**
- `user_data.users` - User accounts
- `user_data.password_reset_requests` - Password recovery
- `user_data.user_refresh_tokens` - Refresh token storage (✅ Created)
- `user_data.notes` - User notes
- `user_api_keys` - API keys (encrypted) - Future

**Current Authentication Tables (5 tables):**
1. ✅ `user_data.users` - Core users table
2. ✅ `user_data.password_reset_requests` - Password recovery
3. ✅ `user_data.user_refresh_tokens` - Refresh token management
4. ✅ `user_data.revoked_tokens` - Token revocation/blacklist
5. ✅ `user_data.notes` - User notes

**Full Schema:** See `04-ENGINEERING_&_ARCHITECTURE/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`

### **Database Verification:**
To verify database connection is working:
```bash
# Test connection
psql postgresql://TikTrackDbAdmin:<PASSWORD>@localhost:5432/TikTrack-phoenix-db -c "SELECT 1;"

# Check Backend health endpoint
curl http://localhost:8082/health
```

**Expected Health Check Response:**
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

## 🌍 Environment Configuration

### **Frontend Environment Variables**

#### **File Locations:**
- **Development:** `ui/.env.development`
- **Production:** `ui/.env.production`
- **Template:** `ui/.env.example`

#### **Variable Naming:**
⚠️ **CRITICAL:** All environment variables MUST have `VITE_` prefix. Vite will NOT load variables without this prefix.

#### **Available Variables:**
```env
VITE_API_BASE_URL=http://localhost:8082/api/v1
VITE_APP_NAME=TikTrack Phoenix
VITE_APP_VERSION=2.0.0
VITE_APP_ENV=development
```

#### **Usage in Code:**
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const appName = import.meta.env.VITE_APP_NAME;
```

### **Backend Environment Variables**

#### **File Location:**
- **Development:** `.env` (in `api/` directory)
- **Production:** Environment variables on server

#### **Key Variables:**
```env
# Database Configuration
DATABASE_URL=postgresql://TikTrackDbAdmin:<PASSWORD>@localhost:5432/TikTrack-phoenix-db

# JWT Configuration
SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
```

⚠️ **IMPORTANT:** 
- Replace `<PASSWORD>` with the actual database password
- Password is stored securely in `api/.env` (in `.gitignore`)
- Never commit `.env` file to git
- Store password in secure password manager

#### **Configuration Management:**
- **File:** `api/core/config.py`
- **Type:** Pydantic Settings
- **Source:** Environment variables + `.env` file

---

## 🚀 Development Setup

### **Prerequisites**

#### **Required Software:**
- **Node.js:** 18+ (for Frontend)
- **Python:** 3.11+ (for Backend)
- **PostgreSQL:** 14+ (for Database)
- **Git:** Latest

#### **Recommended Tools:**
- **VS Code** or **Cursor** (IDE)
- **Postman** or **Insomnia** (API testing)
- **pgAdmin** or **DBeaver** (Database management)

### **Initial Setup**

#### **1. Clone Repository:**
```bash
git clone <repository-url>
cd TikTrackAppV2-phoenix
```

#### **2. Frontend Setup:**
```bash
cd ui
npm install
cp .env.example .env.development
# Edit .env.development if needed
```

#### **3. Backend Setup:**
```bash
cd api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
# Create .env file with database credentials
```

#### **4. Database Setup:**

**⚠️ IMPORTANT:** Use the production database configuration (see [Database Infrastructure](#-database-infrastructure) section above).

**Quick Setup:**
```bash
# Create database
createdb TikTrack-phoenix-db

# Create user (replace <secure-password> with actual password)
psql -c "CREATE USER TikTrackDbAdmin WITH PASSWORD '<secure-password>';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE \"TikTrack-phoenix-db\" TO TikTrackDbAdmin;"

# Connect to database and create schemas
psql -d TikTrack-phoenix-db -c "CREATE SCHEMA IF NOT EXISTS user_data;"
psql -d TikTrack-phoenix-db -c "CREATE SCHEMA IF NOT EXISTS market_data;"
psql -d TikTrack-phoenix-db -c "GRANT ALL ON SCHEMA user_data TO TikTrackDbAdmin;"
psql -d TikTrack-phoenix-db -c "GRANT ALL ON SCHEMA market_data TO TikTrackDbAdmin;"

# Run schema (if available)
psql -d TikTrack-phoenix-db -f ../04-ENGINEERING_&_ARCHITECTURE/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql

# Configure DATABASE_URL in api/.env
# DATABASE_URL=postgresql://TikTrackDbAdmin:<PASSWORD>@localhost:5432/TikTrack-phoenix-db
```

**For detailed setup instructions, see [Database Infrastructure](#-database-infrastructure) section.**

### **Running Development Servers**

⚠️ **IMPORTANT:** Frontend V2 MUST run on port **8080** (as defined in Master Blueprint: "Ports: V2 (8080), Legacy (8081)"). Backend API runs on port **8082**.

#### **Option 1: Using Scripts (Recommended)**

**Backend:**
```bash
./scripts/start-backend.sh
```

**Frontend:**
```bash
./scripts/start-frontend.sh
```

**Stop Servers:**
```bash
./scripts/stop-backend.sh
./scripts/stop-frontend.sh
```

**Restart Backend:**
```bash
./scripts/restart-backend.sh
```

**Check Status:**
```bash
# Via Cursor Task: "📋 Check Server Status"
# Or manually:
lsof -Pi :8080 -sTCP:LISTEN  # Backend
lsof -Pi :3000 -sTCP:LISTEN  # Frontend
```

#### **Option 2: Manual Commands**

**Backend (Start First):**
```bash
cd api
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload --port 8080
# Server runs on http://localhost:8080
# API Base URL: http://localhost:8080/api/v1
# Health Check: http://localhost:8080/health
# API Docs: http://localhost:8080/docs
```

**Verification:**
- ✅ Health check: `curl http://localhost:8080/health` returns `{"status": "ok"}`
- ✅ API docs accessible at `http://localhost:8080/docs`

**Frontend:**
```bash
cd ui
npm run dev
# Server runs on http://localhost:8080 (V2 port)
# Proxy configured: /api -> http://localhost:8082
```

#### **Option 3: Cursor Tasks**

**Using Cursor Tasks (Easiest):**
1. Press `Cmd+Shift+P` (macOS) / `Ctrl+Shift+P` (Windows/Linux)
2. Type: `Tasks: Run Task`
3. Select: `🚀 Start All Servers (Backend + Frontend)`

**Available Tasks:**
- 🚀 Start Backend Server (Port 8082)
- 🛑 Stop Backend Server
- 🔄 Restart Backend Server
- 🚀 Start Frontend Dev Server (Port 3000)
- 🛑 Stop Frontend Dev Server
- 🚀 Start All Servers (Backend + Frontend) - **Default Build Task**
- 🛑 Stop All Servers
- 📋 Check Server Status

### **Development Workflow**

**Order of Operations:**
1. **Start Database** (if running locally)
2. **Start Backend** (`uvicorn main:app --reload --port 8082`)
3. **Start Frontend** (`npm run dev`) ⚠️ **Port 8080 is MANDATORY for V2**
4. **Access Application:** `http://localhost:8080`

**Why Port 8080 for Frontend?**
- Defined in Master Blueprint: "Ports: V2 (8080), Legacy (8081)"
- V2 (Frontend) uses port 8080
- Backend API runs on port 8082 (different port to avoid conflict)
- Frontend proxy configured for `http://localhost:8082`
- Environment variables set to `http://localhost:8082/api/v1`

---

## 📦 Build & Deployment

### **Frontend Build**

#### **Development Build:**
```bash
cd ui
npm run dev
```

#### **Production Build:**
```bash
cd ui
npm run build
# Output: ui/dist/
```

#### **Preview Production Build:**
```bash
cd ui
npm run preview
```

### **Backend Deployment**

#### **Production Server:**
```bash
cd api
uvicorn main:app --host 0.0.0.0 --port 8082
```

#### **With Process Manager (PM2):**
```bash
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8082" --name tiktrack-api
```

### **Environment Variables (Production)**

#### **Frontend:**
- Set `VITE_API_BASE_URL` to production API URL
- Set `VITE_APP_ENV=production`

#### **Backend:**
- Set `DATABASE_URL` to production database
- Set `SECRET_KEY` to secure random string
- Set JWT expiration times
- Backend runs on port 8082 (Frontend V2 uses 8080)

---

## 🔧 Troubleshooting

### **Frontend Issues**

#### **Build Errors:**
- **Problem:** `npm install` fails
- **Solution:** 
  - Clear cache: `rm -rf node_modules/.vite`
  - Delete `node_modules` and `package-lock.json`
  - Run `npm install` again
  - Check Node.js version (18+)

#### **Proxy Issues:**
- **Problem:** API requests fail
- **Solution:**
  - Verify backend is running on port 8082
  - Check `vite.config.js` proxy configuration (should point to `http://localhost:8082`)
  - Ensure backend CORS is configured correctly

#### **Environment Variables Not Loading:**
- **Problem:** `import.meta.env.VITE_*` returns undefined
- **Solution:**
  - Verify variable has `VITE_` prefix
  - Restart dev server after changing `.env` files
  - Check file is named correctly (`.env.development`)

#### **CSS Not Loading:**
- **Problem:** Styles not applied
- **Solution:**
  - Check CSS Loading Order in `main.jsx`
  - Verify CSS files exist in `ui/src/styles/`
  - Check browser console for import errors

### **Backend Issues**

#### **Database Connection Errors:**
- **Problem:** Cannot connect to database
- **Solution:**
  - Verify PostgreSQL is running
  - Check `DATABASE_URL` in `.env`
  - Verify database exists: `psql -l`
  - Check user permissions

#### **Import Errors:**
- **Problem:** Module not found
- **Solution:**
  - Activate virtual environment
  - Install dependencies: `pip install -r requirements.txt`
  - Check Python path

#### **Port Already in Use:**
- **Problem:** Port 8080 or 8082 already in use
- **Solution:**
  - Frontend (8080): `lsof -i :8080` (macOS/Linux)
  - Backend (8082): `lsof -i :8082` (macOS/Linux)
  - Kill process or use scripts (they handle this automatically)

### **General Issues**

#### **CORS Errors:**
- **Problem:** CORS policy blocks requests
- **Solution:**
  - Verify backend CORS configuration in `main.py`
  - Check frontend origin matches CORS allowed origins
  - Verify proxy configuration in `vite.config.js`

#### **JWT Token Issues:**
- **Problem:** Authentication fails
- **Solution:**
  - Check `SECRET_KEY` matches between requests
  - Verify token expiration times
  - Check token format in request headers

---

## 👥 Team Responsibilities

### **Team 60 (DevOps & Platform)**
- ✅ Build System maintenance (`package.json`, `vite.config.js`)
- ✅ Environment Variables management (`.env` files)
- ✅ Router infrastructure updates (`AppRouter.jsx`)
- ✅ Dependency management (version control)
- ✅ CI/CD setup (future)
- ✅ Infrastructure documentation

### **Team 20 (Backend)**
- ✅ Backend API development
- ✅ Database schema management
- ✅ Backend configuration
- ✅ API documentation (OpenAPI)

### **Team 30 (Frontend)**
- ✅ Frontend components development
- ✅ Router usage (adding routes/components)
- ✅ API integration
- ✅ CSS implementation (following CSS Standards)

### **Team 40 (UI Assets)**
- ✅ Design Tokens creation
- ✅ CSS files creation (`phoenix-base.css`, `phoenix-components.css`)
- ✅ Style guidelines

---

## 📚 Additional Resources

### **Documentation:**
- **Master Blueprint:** `documentation/01-ARCHITECTURE/TT2_MASTER_BLUEPRINT.md`
- **CSS Standards:** `documentation/07-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md`
- **JS Standards:** `documentation/07-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md`
- **Database Schema:** `04-ENGINEERING_&_ARCHITECTURE/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
- **OpenAPI Spec:** `OPENAPI_SPEC_V2.5.2.yaml`

### **Infrastructure Files:**
- **Frontend Infrastructure:** `ui/infrastructure/README.md`
- **Backend Config:** `api/core/config.py`
- **Database Config:** `api/core/database.py`

### **Team Documentation:**
- **Team 60 Definition:** `documentation/07-POLICIES/TT2_TEAM_60_DEFINITION.md`
- **Team Operations:** `06-GOVERNANCE_&_COMPLIANCE/standards/CURSOR_INTERNAL_PLAYBOOK.md`

---

## 🔄 Updates & Maintenance

### **Version History:**
- **v2.0** (2026-01-31): Complete infrastructure setup (Team 60)
- **v1.0**: Initial infrastructure (Team 20)

### **Maintenance:**
- **Team 60** maintains this document
- Updates required when infrastructure changes
- All changes must be documented

---

**Last Updated:** 2026-01-31  
**Maintained By:** Team 60 (DevOps & Platform)  
**Status:** ✅ **COMPLETE**

---

**log_entry | Team 60 | INFRASTRUCTURE_GUIDE | SESSION_01 | GREEN | 2026-01-31**

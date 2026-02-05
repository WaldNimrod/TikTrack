# 🏗️ TikTrack Phoenix Infrastructure Guide

**id:** `TT2_INFRASTRUCTURE_GUIDE`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (New document)  
**last_updated:** 2026-02-05  
**version:** v1.0

---

## 📢 Executive Summary

מדריך מקיף לתשתיות המערכת TikTrack Phoenix V2. כולל הגדרות Frontend, Backend, Database, Environment, ו-Deployment.

---

## 🎨 Frontend Infrastructure

### **Stack:**
- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** JavaScript (ES6+)
- **Styling:** ITCSS + BEM, Fluid Design (no media queries)

### **Port Configuration:**
- **Development:** Port `8080` (Vite Dev Server)
- **Production:** Port `8080` (Vite Build)

### **Key Files:**
- **Configuration:** `ui/vite.config.js`
- **Routes SSOT:** `ui/public/routes.json` (v1.1.2)
- **Entry Point:** `ui/src/main.jsx`
- **Auth Guard:** `ui/src/components/core/authGuard.js`

### **Routes SSOT:**
```json
{
  "version": "1.1.2",
  "frontend": 8080,
  "backend": 8082,
  "routes": {
    "auth": { "login": "/login.html", "register": "/register.html" },
    "financial": { "trading_accounts": "/trading_accounts.html" },
    "planning": { "trade_plans": "/trade_plans.html" },
    "research": { "trades_history": "/trades_history.html" }
  },
  "public_routes": ["/login", "/register", "/reset-password"]
}
```

### **Proxy Configuration:**
- **API Proxy:** `/api` → `http://localhost:8082` (Backend API)
- **Configuration:** `ui/vite.config.js` (proxy settings)

### **Environment Variables:**
- **Development:** `.env.development` (local)
- **Production:** `.env.production` (build-time)
- **Debug Mode:** `VITE_DEBUG=true` (enables audit trail and debug logs)

---

## ⚙️ Backend Infrastructure

### **Stack:**
- **Framework:** FastAPI (Python 3.11+)
- **ORM:** SQLAlchemy
- **Database:** PostgreSQL 14+
- **Authentication:** JWT (access + refresh tokens)

### **Port Configuration:**
- **API Server:** Port `8082` (FastAPI)
- **Legacy Port:** Port `8081` (deprecated)

### **Key Files:**
- **Entry Point:** `api/main.py`
- **Configuration:** `api/core/config.py`
- **Database:** `api/core/database.py`
- **Routers:** `api/routers/` (auth, users, trading_accounts, etc.)

### **API Structure:**
```
/api/v1/
  ├── /auth (authentication endpoints)
  ├── /users (user management)
  ├── /trading_accounts (trading accounts)
  ├── /cash_flows (cash flow management)
  └── /positions (position tracking)
```

### **CORS Configuration:**
- **Allowed Origins:** `http://localhost:8080` (Frontend)
- **Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers:** Content-Type, Authorization

### **Environment Variables:**
- **Database URL:** `DATABASE_URL` (PostgreSQL connection string)
- **JWT Secret:** `JWT_SECRET_KEY` (token signing)
- **JWT Algorithm:** `HS256`
- **Token Expiry:** `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS`

---

## 🗄️ Database Infrastructure

### **Database:**
- **Name:** `TikTrack-phoenix-db`
- **User:** `TikTrackDbAdmin`
- **Host:** `localhost`
- **Port:** `5432`
- **Connection:** PostgreSQL 14+

### **Schemas:**
- **`user_data`** - User authentication, profiles, notes
- **`market_data`** - Market data, tickers, exchange rates

### **Key Tables:**
- **`user_data.users`** - Core users table (ULID, email, password_hash)
- **`user_data.user_refresh_tokens`** - Refresh token management
- **`user_data.revoked_tokens`** - Token revocation/blacklist
- **`user_data.password_reset_requests`** - Password recovery

### **Database Setup:**
See `documentation/01-ARCHITECTURE/TT2_DATABASE_CREDENTIALS.md` for detailed setup instructions.

### **Connection String Format:**
```
postgresql://TikTrackDbAdmin:<PASSWORD>@localhost:5432/TikTrack-phoenix-db
```

⚠️ **SECURITY:** Password stored in `api/.env` (never committed to git).

---

## 🔐 Security Infrastructure

### **Authentication:**
- **Method:** JWT (JSON Web Tokens)
- **Tokens:** Access Token (short-lived) + Refresh Token (long-lived)
- **Storage:** Refresh tokens in database (`user_data.user_refresh_tokens`)
- **Revocation:** Token blacklist (`user_data.revoked_tokens`)

### **Password Security:**
- **Hashing:** bcrypt (12 rounds)
- **Storage:** Hashed passwords only (never plain text)
- **Reset:** Email/SMS verification codes

### **API Security:**
- **CORS:** Configured for Frontend origin only
- **Rate Limiting:** SlowAPI middleware
- **Input Validation:** Pydantic schemas
- **Error Handling:** Standardized error codes

### **Frontend Security:**
- **Token Masking:** `maskedLog` utility prevents token leakage
- **Auth Guard:** Protects routes, redirects unauthenticated users
- **Secure Storage:** Tokens stored securely (not localStorage)

---

## 🚀 Deployment Infrastructure

### **Frontend Deployment:**
- **Build Command:** `npm run build` (Vite production build)
- **Output:** `ui/dist/` (static files)
- **Server:** Serve static files from `dist/` directory
- **Routes:** All routes handled by `index.html` (SPA routing)

### **Backend Deployment:**
- **Server:** FastAPI with Uvicorn
- **Command:** `uvicorn api.main:app --host 0.0.0.0 --port 8082`
- **Process Manager:** Systemd or PM2 (recommended)
- **Health Check:** `GET /health` endpoint

### **Database Deployment:**
- **PostgreSQL:** Production-ready PostgreSQL 14+ instance
- **Backup:** Regular automated backups (recommended: daily)
- **Migrations:** Alembic for schema migrations

### **Environment Setup:**
1. **Frontend:** Copy `.env.production` with production values
2. **Backend:** Copy `api/.env` with production database credentials
3. **Database:** Run migrations and seed initial data

---

## 📋 Infrastructure Checklist

### **Development Setup:**
- ✅ Frontend dev server running on port 8080
- ✅ Backend API server running on port 8082
- ✅ Database `TikTrack-phoenix-db` created
- ✅ Database user `TikTrackDbAdmin` configured
- ✅ Environment variables configured
- ✅ CORS configured for localhost:8080

### **Production Setup:**
- ✅ Frontend built and deployed
- ✅ Backend API deployed and running
- ✅ Database production instance configured
- ✅ Environment variables set securely
- ✅ CORS configured for production domain
- ✅ SSL/TLS certificates configured
- ✅ Monitoring and logging configured

---

## 📎 Related Documents

- **Master Blueprint:** `documentation/01-ARCHITECTURE/TT2_MASTER_BLUEPRINT.md`
- **Database Credentials:** `documentation/01-ARCHITECTURE/TT2_DATABASE_CREDENTIALS.md`
- **Routes SSOT:** `ui/public/routes.json`
- **Backend API Spec:** `05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml`

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-05  
**סטטוס:** 🔒 **SSOT - ACTIVE**

**log_entry | [Team 10] | INFRASTRUCTURE_GUIDE | CREATED | BLUE | 2026-02-05**

# 🏗️ TikTrack Phoenix - Infrastructure Documentation

**Team:** 60 (DevOps & Platform)  
**Session:** SESSION_01  
**Date:** 2026-01-31  
**Status:** ✅ Infrastructure Setup Complete

---

## 📋 Overview

This directory contains documentation for the TikTrack Phoenix Frontend infrastructure setup. This includes Build System, Environment Variables, Router Infrastructure, and Dependency Management.

---

## 🛠️ Stack Technical

### **Core Technologies:**
- **React:** ^18.2.0
- **React DOM:** ^18.2.0
- **React Router:** ^6.20.0
- **Vite:** ^5.0.0 (Build Tool)
- **Axios:** ^1.6.0 (HTTP Client)

### **Development Tools:**
- **@vitejs/plugin-react:** ^4.2.0
- **ESLint:** ^8.55.0 (Code Quality)

---

## 📦 Build System

### **Package Management:**
- **File:** `ui/package.json`
- **Type:** `module` (ESM)
- **Package Manager:** npm (recommended)

### **Available Scripts:**
```bash
npm run dev      # Start development server (port 8080)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### **Vite Configuration:**
- **File:** `ui/vite.config.js`
- **Dev Server Port:** 8080 (Port Unification - Single Source of Truth)
- **API Proxy:** `/api` → `http://localhost:8082` (Backend API)
- **Build Output:** `dist/`
- **Source Maps:** Enabled

### **Entry Point:**
- **HTML:** `ui/index.html`
- **React Entry:** `ui/src/main.jsx`
- **Root Element:** `<div id="root"></div>`

---

## 🌍 Environment Variables

### **File Locations:**
- **Development:** `ui/.env.development`
- **Production:** `ui/.env.production`
- **Template:** `ui/.env.example`

### **Variable Naming:**
⚠️ **CRITICAL:** All environment variables MUST have `VITE_` prefix. Vite will NOT load variables without this prefix.

### **Usage in Code:**
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const appName = import.meta.env.VITE_APP_NAME;
```

### **Available Variables:**
- `VITE_API_BASE_URL` - Backend API base URL
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version
- `VITE_APP_ENV` - Environment (development/production)

### **Default Values:**
- **Development:** `http://localhost:8082/api/v1` (Backend API port)
- **Production:** `https://api.tiktrack.com/api/v1`

---

## 🗺️ Router Infrastructure

### **Router Setup:**
- **File:** `ui/src/router/AppRouter.jsx`
- **Type:** BrowserRouter (HTML5 History API)
- **Base:** `/` (root)

### **Route Structure:**
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

### **Protected Routes:**
Protected routes use the `ProtectedRoute` component wrapper, which:
- Checks for authentication token
- Redirects to `/login` if not authenticated
- Renders child component if authenticated

---

## 📚 Dependencies

### **Runtime Dependencies:**

#### **react** (^18.2.0)
- **Purpose:** Core React library
- **Why:** UI component framework

#### **react-dom** (^18.2.0)
- **Purpose:** React DOM renderer
- **Why:** Renders React components to DOM

#### **react-router-dom** (^6.20.0)
- **Purpose:** Client-side routing
- **Why:** Navigation between pages without full page reloads

#### **axios** (^1.6.0)
- **Purpose:** HTTP client for API requests
- **Why:** Handles API communication with backend

### **Development Dependencies:**

#### **vite** (^5.0.0)
- **Purpose:** Build tool and dev server
- **Why:** Fast HMR, optimized builds, modern tooling

#### **@vitejs/plugin-react** (^4.2.0)
- **Purpose:** Vite plugin for React
- **Why:** Enables React Fast Refresh and JSX transformation

#### **eslint** (^8.55.0)
- **Purpose:** Code linting
- **Why:** Code quality and consistency

---

## 🎨 CSS Loading Order (CRITICAL)

⚠️ **DO NOT CHANGE THIS ORDER** - It follows the CSS Standards Protocol.

### **Loading Sequence:**

1. **Pico CSS** (CDN in `index.html`)
   - Framework base styles
   - Loaded first to establish foundation

2. **phoenix-base.css** (`ui/src/styles/phoenix-base.css`)
   - Global defaults & DNA variables (`:root`)
   - Overrides Pico CSS where needed

3. **phoenix-components.css** (`ui/src/styles/phoenix-components.css`)
   - LEGO components (reusable building blocks)
   - Semantic tags (tt-container, tt-section, etc.)

4. **phoenix-header.css** (`ui/src/styles/phoenix-header.css`)
   - Header component styles
   - Only loaded if header is used

5. **Page-specific CSS** (e.g., `D15_IDENTITY_STYLES.css`)
   - Loaded per route by Team 30
   - Page-specific overrides

### **Implementation:**
CSS files are imported in `ui/src/main.jsx` in the exact order listed above.

---

## 🔗 Integration Points

### **With Team 20 (Backend):**
- **API Base URL:** `http://localhost:8082/api/v1` (Development)
- **Port:** 8082 (Backend API - Port Unification)
- **CORS:** Backend allows only `http://localhost:8080` (Frontend)
- **Proxy:** Vite proxy configured for `/api` → `http://localhost:8082`

### **With Team 30 (Frontend):**
- **Port:** 8080 (Frontend Dev Server - Port Unification)
- **Components:** Team 30 creates components, Team 60 provides infrastructure
- **Router:** Team 60 provides skeleton, Team 30 adds routes/components

### **With Team 40 (UI Assets):**
- **CSS Files:** Located in `ui/src/styles/`
- **Design Tokens:** Located in `ui/design-tokens/`
- **Loading Order:** Team 60 ensures correct CSS loading order

---

## 🚀 Getting Started

### **Initial Setup:**

1. **Install Dependencies:**
   ```bash
   cd ui
   npm install
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env.development
   # Edit .env.development if needed
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

4. **Access Application:**
   - Frontend: `http://localhost:8080` (Port Unification)
   - Backend API: `http://localhost:8082/api/v1` (Port Unification)

### **Build for Production:**

```bash
npm run build
```

Output will be in `ui/dist/` directory.

---

## 📝 Notes for Team 30

### **Router Usage:**
- Router infrastructure is ready in `ui/src/router/AppRouter.jsx`
- Uncomment and import your components when ready
- Protected routes are wrapped with `ProtectedRoute` component

### **CSS Loading:**
- CSS loading order is handled in `ui/src/main.jsx`
- Page-specific CSS should be imported per route
- Follow CSS Standards Protocol for any new CSS files

### **Environment Variables:**
- Use `import.meta.env.VITE_*` to access variables
- All variables must have `VITE_` prefix
- Default values are set in `.env.development`

---

## 🔍 Troubleshooting

### **Build Errors:**
- Ensure all dependencies are installed: `npm install`
- Check Node.js version (recommended: 18+)
- Clear cache: `rm -rf node_modules/.vite`

### **Proxy Issues:**
- Verify backend is running on port 8082
- Check `vite.config.js` proxy configuration (`/api` → `http://localhost:8082`)
- Ensure backend CORS is configured correctly (allows only `http://localhost:8080`)

### **Environment Variables Not Loading:**
- Verify variable has `VITE_` prefix
- Restart dev server after changing `.env` files
- Check file is named correctly (`.env.development`)

---

## 📡 Reporting

**Team 60 Responsibilities:**
- Build System maintenance
- Environment Variables management
- Router infrastructure updates
- Dependency management

**For Issues:**
- Report to Team 10 (The Gateway)
- Include error logs and steps to reproduce
- Check this documentation first

---

**Last Updated:** 2026-01-31  
**Maintained By:** Team 60 (DevOps & Platform)  
**Status:** ✅ Infrastructure Setup Complete

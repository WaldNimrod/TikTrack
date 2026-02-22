# 🏗️ Architecture Overview - Phoenix (TikTrack V2)
**project_domain:** TIKTRACK

**תאריך יצירה:** 2026-02-03  
**גרסה:** v1.0  
**מטרה:** מסמך ארכיטקטורה מקיף למערכת Phoenix (TikTrack V2)  
**צוותים אחראים:** Team 20 (Backend) + Team 30 (Frontend)  
**סטטוס:** ✅ **READY FOR EXTERNAL AUDIT**

---

## 📋 תקציר מנהלים

מסמך זה מספק סקירה מקיפה של ארכיטקטורת המערכת Phoenix (TikTrack V2), כולל:
- ארכיטקטורת Frontend (LEGO System, Cube Isolation)
- ארכיטקטורת Backend (Modular Cubes, API Layer)
- ארכיטקטורת Database (PostgreSQL, Schema Design)
- Design Patterns בשימוש
- Security Architecture
- Data Flow Diagrams

---

## 🏗️ ארכיטקטורה כללית

### **Stack Technology**

- **Frontend:** React 18, JavaScript (ES6+), Vite
- **Backend:** FastAPI (Python 3.11+), PostgreSQL
- **Build Tools:** Vite (Frontend), Poetry (Backend)
- **State Management:** React Hooks, Zustand (לסקשנים)
- **Routing:** React Router v6
- **Styling:** CSS (ITCSS), CSS Variables (SSOT)

### **Monorepo Structure**

```text
TikTrackAppV2-phoenix/
├── api/                    # Backend (FastAPI)
├── ui/                      # Frontend (React)
├── storage/                 # File storage
├── scripts/                 # Utility scripts
└── documentation/           # System documentation
```

---

## 🎨 Frontend Architecture

### **1. LEGO Modular Architecture**

המערכת מבוססת על ארכיטקטורת LEGO מודולרית המאפשרת בנייה של עמודים מ-Components קטנים ומשותפים.

#### **1.1 LEGO Component Hierarchy**

```text
page-wrapper
  └── page-container
      └── main
          └── tt-container (max-width: 1400px)
              └── tt-section (independent content unit)
                  ├── index-section__header (section header)
                  └── index-section__body (section content)
                      └── tt-section-row (internal division)
                          └── tt-section-col (column)
```

**קבצי CSS:**
- `phoenix-base.css` - CSS Variables (SSOT) + Base Styles
- `phoenix-components.css` - LEGO Components (tt-container, tt-section, tt-section-row)
- `phoenix-header.css` - Unified Header Component
- `D15_IDENTITY_STYLES.css` - Page-specific styles (Auth pages)
- `D15_DASHBOARD_STYLES.css` - Page-specific styles (Dashboard pages)

**סדר טעינה (CRITICAL):**
1. Pico CSS (CDN)
2. phoenix-base.css
3. phoenix-components.css
4. phoenix-header.css
5. Page-specific CSS

#### **1.2 Cube Isolation Pattern**

**עקרון:** כל קוביה היא אי עצמאי המתקשר רק דרך ה-Shared.

**מבנה:**

```text
ui/src/cubes/
├── identity/          # Identity & Authentication Cube
│   ├── components/    # Cube-specific components
│   ├── hooks/         # Cube-specific hooks
│   └── services/      # Cube-specific services
├── shared/            # Shared resources (only way to communicate)
│   ├── components/    # Shared components (PhoenixTable, etc.)
│   ├── contexts/      # Shared contexts (PhoenixFilterContext)
│   ├── hooks/         # Shared hooks
│   └── utils/         # Shared utilities (transformers)
└── [future cubes]     # Additional cubes (Financial, Analytics, etc.)
```

**חוקי ברזל:**
- 🚨 **אין imports בין קוביות (חוץ מ-`cubes/shared`)**
- 🚨 **כל קוביה היא אי עצמאי**
- 🚨 **כל לוגיקה עסקית נשארת בתוך הקוביה**

**דוגמה - Identity Cube:**

```text
identity/
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   ├── PasswordResetFlow.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── AuthForm.jsx (shared component)
│   ├── profile/
│   │   ├── ProfileView.jsx
│   │   └── PasswordChangeForm.jsx
│   ├── AuthErrorHandler.jsx
│   └── AuthLayout.jsx
├── hooks/
│   └── useAuthValidation.js
└── services/
    ├── auth.js
    └── apiKeys.js
```

#### **1.3 Component Patterns**

**Shared Components (cubes/shared):**
- `PhoenixTable` - טבלאות React עם סידור, סינון, ו-Accessibility
- `PhoenixFilterContext` - Context API לפילטרים גלובליים
- `usePhoenixTableSort` - Hook לניהול סידור
- `usePhoenixTableFilter` - Hook לניהול פילטרים מקומיים

**Cube Components (cubes/identity):**
- `AuthForm` - Component משותף לטופסי Auth (Login, Register, Reset Password)
- `AuthErrorHandler` - Component לטיפול והצגת שגיאות
- `AuthLayout` - Layout משותף לעמודי Auth
- `ProtectedRoute` - רכיב הגנה על Routes שדורשים אימות

---

## 🔄 Transformation Layer Pattern

### **2.1 Data Transformation**

**עקרון:** הפרדה מוחלטת בין Backend (snake_case) ל-Frontend (camelCase).

**מיקום:** `ui/src/cubes/shared/utils/transformers.js`

**פונקציות:**
- `apiToReact(apiData)` - המרה מ-snake_case ל-camelCase (API → React State)
- `reactToApi(reactData)` - המרה מ-camelCase ל-snake_case (React State → API)
- `reactToApiPasswordChange(reactData)` - המרה ספציפית לשינוי סיסמה

**דוגמה:**

```javascript
// API Response (snake_case)
const apiData = {
  user_id: "123",
  is_email_verified: true,
  external_ulids: "01ARZ3NDEKTSV4RRFFQ69G5FAV"
};

// React State (camelCase)
const reactData = apiToReact(apiData);
// Returns: {
//   userId: "123",
//   isEmailVerified: true,
//   externalUlids: "01ARZ3NDEKTSV4RRFFQ69G5FAV"
// }
```

**חוק ברזל:** כל תקשורת API חייבת לעבור דרך Transformation Layer.

---

## 🔐 Security Architecture

### **3.1 Authentication Flow**

**Frontend Perspective:**

1. **Login Request:**

   ```text
   User Input (camelCase) 
     → reactToApi() (camelCase → snake_case)
     → API POST /api/v1/auth/login
     → Backend validates
     → Returns JWT tokens
   ```

2. **Token Storage:**
   - Access Token: `localStorage.getItem('access_token')`
   - Refresh Token: `localStorage.getItem('refresh_token')`

3. **Protected Routes:**
   - `ProtectedRoute` component checks authentication
   - Validates token with backend
   - Redirects to `/login` if not authenticated

4. **Token Refresh:**
   - Automatic refresh on token expiration
   - Uses refresh token to get new access token
   - Seamless user experience

**Components:**
- `ProtectedRoute` - Route guard component
- `authService.login()` - Login service
- `authService.refreshToken()` - Token refresh service
- `authService.isAuthenticated()` - Authentication check

### **3.2 Authorization Model**

**Frontend Implementation:**
- Route-level protection via `ProtectedRoute`
- Component-level checks via `authService.getCurrentUser()`
- API-level authorization handled by backend

**Authorization Flow:**

```text
User Request
  → ProtectedRoute checks authentication
  → Component loads user data
  → API call with JWT token
  → Backend validates token + permissions
  → Returns authorized data
```

### **3.3 Security Headers**

**Frontend:**
- No sensitive data in localStorage (except tokens)
- HTTPS only (enforced by backend)
- CORS configuration (handled by backend)

**Backend:**
- JWT token validation
- CORS headers
- Security headers (X-Frame-Options, etc.)

---

## 📊 Data Flow Diagrams

### **4.1 User Request Flow**

```text
User Action (Click/Submit)
  ↓
React Component (Event Handler)
  ↓
Form Validation (useAuthValidation Hook)
  ↓
Transformation Layer (reactToApi)
  ↓
API Service (authService.login)
  ↓
HTTP Request (snake_case payload)
  ↓
Backend API (FastAPI)
  ↓
Database (PostgreSQL)
  ↓
Backend Response (snake_case)
  ↓
Transformation Layer (apiToReact)
  ↓
React State Update (camelCase)
  ↓
UI Update (React Re-render)
```

### **4.2 API Request Flow**

```text
Component
  ↓
Service Layer (auth.js)
  ↓
Transform (reactToApi) - camelCase → snake_case
  ↓
HTTP Request (fetch/axios)
  ↓
Backend API Endpoint
  ↓
Response (snake_case)
  ↓
Transform (apiToReact) - snake_case → camelCase
  ↓
Component State Update
```

### **4.3 Data Transformation Flow**

```text
Backend API Response:
{
  "user_id": "123",
  "is_email_verified": true,
  "external_ulids": "01ARZ3NDEKTSV4RRFFQ69G5FAV"
}
  ↓
apiToReact()
  ↓
React State:
{
  userId: "123",
  isEmailVerified: true,
  externalUlids: "01ARZ3NDEKTSV4RRFFQ69G5FAV"
}
  ↓
User edits form
  ↓
React State (camelCase)
  ↓
reactToApi()
  ↓
API Request Payload:
{
  "user_id": "123",
  "is_email_verified": true,
  "external_ulids": "01ARZ3NDEKTSV4RRFFQ69G5FAV"
}
```

---

## 🎯 Design Patterns

### **5.1 LEGO Modular Architecture**

**עקרון:** בנייה של עמודים מ-Components קטנים ומשותפים.

**יתרונות:**
- Reusability - Components משותפים
- Maintainability - שינויים במקום אחד
- Consistency - עיצוב אחיד
- Scalability - הוספת עמודים חדשים בקלות

**דוגמה - HomePage:**
```jsx
<PageWrapper>
  <PageContainer>
    <Main>
      <TtContainer>
        <TtSection data-section="section-0">
          <IndexSectionHeader>
            <h1>מידע</h1>
          </IndexSectionHeader>
          <IndexSectionBody>
            <TtSectionRow>
              {/* Content */}
            </TtSectionRow>
          </IndexSectionBody>
        </TtSection>
      </TtContainer>
    </Main>
  </PageContainer>
</PageWrapper>
```

### **5.2 Cube Isolation Pattern**

**עקרון:** כל קוביה היא אי עצמאי המתקשר רק דרך ה-Shared.

**יתרונות:**
- Independence - קוביות לא תלויות זו בזו
- Testability - בדיקות מבודדות
- Maintainability - שינויים בקוביה אחת לא משפיעים על אחרות
- Scalability - הוספת קוביות חדשות בקלות

**דוגמה:**
```javascript
// ✅ נכון - Import מ-shared
import { apiToReact } from '../../cubes/shared/utils/transformers.js';

// ❌ לא נכון - Import מקוביה אחרת
import { something } from '../../cubes/financial/utils/helpers.js';
```

### **5.3 Transformation Layer Pattern**

**עקרון:** הפרדה מוחלטת בין Backend (snake_case) ל-Frontend (camelCase).

**יתרונות:**
- Consistency - פורמט אחיד בכל המערכת
- Type Safety - המרה מפורשת
- Maintainability - שינויים במקום אחד
- Debugging - קל לזהות בעיות המרה

### **5.4 Component Composition Pattern**

**עקרון:** בנייה של Components מורכבים מ-Components קטנים.

**דוגמה - AuthForm:**
```jsx
<AuthLayout title="התחברות" subtitle="ברוכים הבאים">
  <AuthErrorHandler error={error} fieldErrors={fieldErrors} />
  <form onSubmit={handleSubmit}>
    {/* Form fields */}
  </form>
</AuthLayout>
```

---

## 🔧 Backend Architecture

### **1. Backend Stack Technology**

**Core Framework:**
- **FastAPI** (Python 3.11+) - Modern, fast web framework for building APIs
- **SQLAlchemy** (Async) - Async ORM for database operations
- **PostgreSQL** (15+) - Relational database with advanced features
- **Pydantic** - Data validation using Python type annotations
- **JWT** (python-jose) - Token-based authentication

**Key Libraries:**
- **slowapi** - Rate limiting middleware
- **passlib** (bcrypt) - Password hashing
- **asyncpg** - Async PostgreSQL driver
- **python-dotenv** - Environment variable management

**Development Tools:**
- **Poetry** - Dependency management
- **pytest** - Testing framework
- **Black** - Code formatting
- **mypy** - Static type checking

---

### **2. Backend Modular Architecture**

**Directory Structure:**

```text
api/
├── main.py                 # FastAPI application entry point
├── core/                   # Core infrastructure
│   ├── config.py          # Application configuration (Pydantic Settings)
│   └── database.py        # Database connection & session management
├── routers/                # API route handlers (REST endpoints)
│   ├── auth.py            # Authentication routes (login, register, refresh, logout)
│   ├── users.py           # User management routes (profile, password change)
│   └── api_keys.py        # API key management routes
├── models/                 # SQLAlchemy ORM models
│   ├── base.py            # Base model class
│   ├── enums.py           # Database ENUM types
│   ├── identity.py        # User & identity models
│   └── tokens.py          # Token models (refresh tokens, revoked tokens)
├── schemas/                # Pydantic schemas (API request/response models)
│   └── identity.py        # Identity schemas (LoginRequest, UserResponse, etc.)
├── services/               # Business logic layer
│   ├── auth.py            # Authentication service (JWT, password hashing)
│   ├── password_reset.py  # Password reset service
│   ├── api_keys.py        # API key service
│   └── encryption.py      # Data encryption service
└── utils/                  # Utility functions
    ├── dependencies.py    # FastAPI dependencies (get_current_user, etc.)
    ├── exceptions.py      # Custom exception classes & error codes
    └── identity.py        # Identity utilities (ULID conversion)
```

**Architecture Layers:**

1. **Routers Layer** (`routers/`)
   - Handles HTTP requests/responses
   - Input validation via Pydantic schemas
   - Error handling with error codes
   - Rate limiting per endpoint

2. **Services Layer** (`services/`)
   - Business logic implementation
   - Authentication & authorization
   - Data encryption/decryption
   - External service integration

3. **Models Layer** (`models/`)
   - Database schema definition (SQLAlchemy ORM)
   - Relationships between entities
   - Database constraints & indexes

4. **Schemas Layer** (`schemas/`)
   - API contract definition (Pydantic)
   - Request/response validation
   - Data transformation (snake_case)

5. **Core Layer** (`core/`)
   - Application configuration
   - Database connection management
   - Shared infrastructure

**Design Patterns:**
- **Dependency Injection** - FastAPI dependency system
- **Repository Pattern** - Service layer abstracts database access
- **Factory Pattern** - Service factories (get_auth_service, etc.)
- **Strategy Pattern** - Multiple authentication strategies

---

## 🗄️ Database Architecture

### **Database Overview**

**Database System:** PostgreSQL 15+

**Schema Organization:**
- **`market_data`** - Public market data (tickers, prices, exchanges)
- **`user_data`** - User-specific trading data

**Total Tables:** 48 tables
- 11 tables in `market_data` schema
- 37 tables in `user_data` schema

**Key Features:**
- **UUID Primary Keys** - Internal IDs (UUID v4)
- **ULID External IDs** - User-facing identifiers (26-character ULID)
- **Soft Deletes** - `deleted_at` timestamp for data retention
- **Audit Fields** - `created_at`, `updated_at`, `created_by`, `updated_by`
- **JSONB Support** - Flexible metadata storage
- **Partial Indexes** - Optimized indexes for active records (`WHERE deleted_at IS NULL`)

### **Database Schema Details**

#### **User Data Schema (`user_data`)**

**Core Tables:**
- `users` - User accounts & profiles
- `user_api_keys` - Multi-provider API keys (encrypted)
- `password_reset_requests` - Password reset tokens & SMS codes
- `revoked_tokens` - Revoked refresh tokens (for logout)

**Key Constraints:**
- **Unique Constraints:** 
  - Email (partial index - excludes ADMIN/SUPERADMIN)
  - Phone number (partial index - excludes ADMIN/SUPERADMIN)
  - Username
- **Foreign Keys:** Cascading deletes for related data
- **Check Constraints:** Data validation at database level

**Indexes:**
- 20+ indexes for query optimization
- Partial indexes for soft-delete patterns
- Composite indexes for common query patterns

#### **Market Data Schema (`market_data`)**

**Core Tables:**
- `exchanges` - Stock exchanges (NASDAQ, NYSE, etc.)
- `sectors` - Market sectors
- `tickers` - Stock tickers & symbols
- `ticker_prices` - Historical price data

**Materialized Views:**
- 2 materialized views for aggregated data

### **Database Connection Management**

**Connection Pool:**
- **Async Engine** - SQLAlchemy async engine
- **Session Factory** - AsyncSessionLocal for request-scoped sessions
- **Connection Pooling** - Managed by SQLAlchemy (default settings)

**Transaction Management:**
- **Automatic Commit** - Commits on successful request completion
- **Automatic Rollback** - Rolls back on exceptions
- **Session Scoping** - One session per request (via FastAPI dependency)

### **Database Extensions**

**PostgreSQL Extensions:**
- `uuid-ossp` - UUID generation
- `pgcrypto` - Encryption functions
- `pg_trgm` - Trigram text search
- `btree_gin` - GIN indexes for btree types

---

### **3. Backend Security Architecture**

#### **3.1 Authentication**

**JWT Token-Based Authentication:**
- **Access Token** - Short-lived (24 hours), contains user ULID
- **Refresh Token** - Long-lived (7 days), stored in httpOnly cookie
- **Token Rotation** - Refresh tokens rotated on each refresh

**Token Structure:**
```json
{
  "sub": "01ARZ3NDEKTSV4RRFFQ69G5FAV",  // User ULID
  "exp": 1706812000,                    // Expiration timestamp
  "iat": 1706725600,                    // Issued at timestamp
  "type": "access"                      // Token type
}
```

**Authentication Flow:**
1. User submits credentials → `POST /api/v1/auth/login`
2. Backend validates credentials → Database lookup + password verification
3. Backend generates tokens → JWT access token + refresh token
4. Tokens returned → Access token in response body, refresh token in cookie
5. Subsequent requests → Access token in `Authorization: Bearer <token>` header

#### **3.2 Authorization**

**Role-Based Access Control (RBAC):**
- **USER** - Standard user role
- **ADMIN** - Administrative role (can have duplicate email/phone)
- **SUPERADMIN** - Super administrative role

**Authorization Checks:**
- **Route-level** - `get_current_user` dependency validates token
- **Resource-level** - Users can only access their own resources
- **Role-based** - Admin/SuperAdmin have extended permissions

#### **3.3 Data Encryption**

**Password Hashing:**
- **Algorithm:** bcrypt (via passlib)
- **Rounds:** 12 (configurable)
- **Storage:** Hashed passwords never stored in plaintext

**API Key Encryption:**
- **Encryption:** AES encryption for API keys
- **Storage:** Encrypted API keys stored in database
- **Decryption:** On-demand decryption for API calls

**Sensitive Data:**
- Passwords: Hashed (bcrypt)
- API Keys: Encrypted (AES)
- Refresh Tokens: Signed (JWT)

#### **3.4 Security Headers**

**CORS Configuration:**
- **Allowed Origins:** Configurable via environment variable
- **Credentials:** Enabled (for httpOnly cookies)
- **Methods:** GET, POST, PUT, DELETE, OPTIONS, PATCH
- **Headers:** All headers allowed

**Rate Limiting:**
- **IP-based** - Rate limiting per IP address
- **Per-endpoint** - Different limits for different endpoints
- **Slowapi** - Rate limiting middleware

**Error Handling:**
- **Error Codes** - Machine-readable error codes
- **No Information Leakage** - Generic error messages for security
- **Structured Logging** - Security events logged

---

### **4. Backend Data Flow Diagrams**

#### **4.1 Authentication Request Flow**

```text
Client Request
  ↓
FastAPI Router (auth.py)
  ↓
Pydantic Schema Validation (LoginRequest)
  ↓
Service Layer (auth.py - login method)
  ↓
Database Query (User lookup)
  ↓
Password Verification (bcrypt)
  ↓
JWT Token Generation
  ↓
Response (LoginResponse with access_token)
  ↓
Set-Cookie (refresh_token in httpOnly cookie)
  ↓
Client Receives Tokens
```

#### **4.2 Protected Route Request Flow**

```text
Client Request (with Authorization header)
  ↓
FastAPI Router (users.py)
  ↓
Dependency Injection (get_current_user)
  ↓
JWT Token Validation (decode & verify)
  ↓
Database Query (User lookup by ULID)
  ↓
Authorization Check (user exists, active, etc.)
  ↓
Route Handler (business logic)
  ↓
Service Layer (if needed)
  ↓
Database Operations (CRUD)
  ↓
Response (UserResponse with snake_case)
  ↓
Client Receives Data
```

#### **4.3 Database Query Flow**

```text
Service Method Call
  ↓
SQLAlchemy ORM Query
  ↓
Async Session (AsyncSessionLocal)
  ↓
SQL Query Generation
  ↓
Connection Pool (asyncpg)
  ↓
PostgreSQL Database
  ↓
Query Execution
  ↓
Result Set
  ↓
ORM Mapping (SQLAlchemy models)
  ↓
Python Objects
  ↓
Pydantic Schema Conversion (snake_case)
  ↓
API Response
```

#### **4.4 Error Handling Flow**

```text
Exception Occurs
  ↓
Exception Handler (global_exception_handler)
  ↓
Error Classification
  ├── HTTPExceptionWithCode → Return with error_code
  ├── HTTPException → Convert to HTTPExceptionWithCode
  ├── RequestValidationError → Return with VALIDATION_INVALID_FORMAT
  └── Exception → Return with SERVER_ERROR
  ↓
Error Logging (structured logging)
  ↓
JSON Response
  {
    "detail": "Human-readable message",
    "error_code": "MACHINE_READABLE_CODE"
  }
  ↓
Client Receives Error
```

---

## 🔗 Integration Points

### **6.1 Frontend ↔ Backend**

**API Communication:**
- RESTful API (FastAPI)
- JSON payloads (snake_case)
- JWT Authentication
- Error handling via `error_code` + `detail`

**Endpoints:**
- `/api/v1/auth/*` - Authentication endpoints
- `/api/v1/users/*` - User management endpoints
- `/api/v1/*` - Additional endpoints

### **6.2 Frontend ↔ Database**

**Indirect:** כל גישה ל-Database דרך Backend API בלבד.

---

## 📋 קישורים רלוונטיים

### **Frontend Documentation:**
- `documentation/01-ARCHITECTURE/TT2_SECTION_ARCHITECTURE_SPEC.md` - LEGO System Spec
- `documentation/01-ARCHITECTURE/TT2_UI_INTEGRATION_PATTERN.md` - UI Integration Pattern
- `documentation/04-DESIGN_UX_UI/CSS_LOADING_ORDER.md` - CSS Loading Order
- `documentation/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md` - Master Bible

### **Backend Documentation:**
- `documentation/01-ARCHITECTURE/TT2_BACKEND_LEGO_SPEC.md` - Backend LEGO Architecture
- `documentation/01-ARCHITECTURE/TT2_BACKEND_CUBE_INVENTORY.md` - Backend Cube Inventory
- `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` - Full Database Schema
- `api/main.py` - FastAPI application entry point
- `api/core/` - Core infrastructure (config, database)
- `api/routers/` - API route handlers
- `api/services/` - Business logic layer
- `api/models/` - SQLAlchemy ORM models
- `api/schemas/` - Pydantic schemas

### **API Documentation:**
- `_COMMUNICATION/90_Architects_comunication/EXTERNAL_AUDIT_v1/01_TECHNICAL/identity_api_schema.yaml` - Identity API Schema

---

## ⚠️ הערות חשובות

1. **CSS Loading Order:** סדר הטעינה הוא קריטי - אין לשנות!
2. **Cube Isolation:** אין imports בין קוביות (חוץ מ-shared)
3. **Transformation Layer:** כל תקשורת API חייבת לעבור דרך transformers
4. **CSS Variables:** כל הצבעים דרך `phoenix-base.css` (SSOT)
5. **No Inline Styles:** אין inline styles (חוץ מ-dynamic styles מותרים)

---

**נוצר על ידי:** Team 30 (Frontend) + Team 20 (Backend)  
**תאריך:** 2026-02-03  
**עדכון אחרון:** 2026-02-03 (Team 20 - Backend sections completed)  
**סטטוס:** ✅ **COMPLETE - READY FOR EXTERNAL AUDIT**

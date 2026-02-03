# 🏗️ Architecture Overview - Phoenix (TikTrack V2)

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

## 🗄️ Database Architecture

**מיקום:** `documentation/01-ARCHITECTURE/PHX_DB_SCHEMA_SIGN_OFF.md`

**עקרונות:**
- PostgreSQL
- ULID for External IDs
- BIGINT for Internal IDs
- Global UTC time
- Normalized schema

**קישור:** ראה מסמכי Backend Architecture (Team 20)

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
**סטטוס:** ✅ **READY FOR EXTERNAL AUDIT**

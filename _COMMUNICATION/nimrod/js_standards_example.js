/**
 * PHOENIX JS CORE IMPLEMENTATION (v1.1 - Final Execution Standard)
 * ------------------------------------------------------------
 * קובץ זה מהווה דוגמה מחייבת למימוש לוגיקה צד-לקוח.
 * דגשים: Transformation Layer, js- selectors, ו-Audit Trail.
 */

/**
 * 1. PHOENIX AUDIT SYSTEM
 * תשתית לניטור ודיבאגינג בזמן אמת.
 */
class PhoenixAudit {
    constructor() {
      // זיהוי Debug Flag מה-URL
      this.isDebug = new URLSearchParams(window.location.search).has('debug');
      this.logs = [];
    }
  
    /**
     * @description רישום פעולה לוגית
     * @param {string} module - שם המודול (למשל: 'Auth')
     * @param {string} action - הפעולה המבוצעת
     * @param {object} data - נתונים בפורמט נקי
     */
    log(module, action, data = null) {
      const entry = { timestamp: new Date().toISOString(), module, action, data };
      this.logs.push(entry);
  
      if (this.isDebug) {
        console.info(`🛡️ [Phoenix Audit][${module}] ${action}`, data || '');
      }
    }
  
    error(module, message, error = null) {
      console.error(`❌ [Phoenix Audit][${module}] ERROR: ${message}`, error);
    }
  }
  
  const audit = new PhoenixAudit();
  
  /**
   * 2. TRANSFORMATION LAYER (Data Normalization)
   * הפרדה בין ה-Backend (snake_case) לבין ה-Frontend (camelCase).
   */
  const AuthTransformer = {
    /**
     * @description המרה מנתוני API לנתוני State של React
     * @legacyReference D15_USER_OBJECT
     */
    apiToReact(apiData) {
      return {
        userId: apiData.user_id,
        accessToken: apiData.access_token,
        isEmailVerified: apiData.is_email_verified,
        userTier: apiData.user_tier_levels // שמירה על המבנה הלוגי מה-Legacy
      };
    },
  
    /**
     * @description המרה מנתוני UI לפורמט Payload עבור ה-API
     */
    reactToApi(uiState) {
      return {
        username_or_email: uiState.email,
        password: uiState.password,
        remember_me: uiState.rememberMe,
        client_timestamp: Date.now()
      };
    }
  };
  
  /**
   * 3. PRACTICAL IMPLEMENTATION: LOGIN LOGIC
   * מימוש לוגיקת הכניסה בסטנדרט LOD 400.
   */
  class AuthManager {
    constructor() {
      this.initEventListeners();
    }
  
    initEventListeners() {
      // שימוש ב-js- prefix להפרדה מוחלטת מה-CSS
      const form = document.querySelector('.js-login-form');
      if (!form) return;
  
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleLogin(form);
      });
    }
  
    async handleLogin(formElement) {
      const formData = new FormData(formElement);
      const credentials = Object.fromEntries(formData.entries());
  
      audit.log('Auth', 'Login attempt started', { email: credentials.email });
  
      try {
        // שלב 1: טרנספורמציה ל-API (snake_case)
        const payload = AuthTransformer.reactToApi(credentials);
        audit.log('Auth', 'Payload prepared for API', payload);
  
        // שלב 2: סימולציה של קריאת API
        // const response = await fetch('/api/login', { method: 'POST', body: JSON.stringify(payload) });
        const mockResponse = {
          user_id: "ULID_01JHG",
          access_token: "jwt_signed_token",
          is_email_verified: true,
          user_tier_levels: "pro"
        };
  
        // שלב 3: טרנספורמציה חזרה ל-React State (camelCase)
        const userData = AuthTransformer.apiToReact(mockResponse);
        audit.log('Auth', 'Login successful', userData);
  
        // הפנייה לדאשבורד (D15_INDEX)
        window.location.href = './D15_INDEX.html';
  
      } catch (error) {
        audit.error('Auth', 'Login failure', error);
        this.showErrorUI("שגיאה בהתחברות. אנא בדוק את פרטיך.");
      }
    }
  
    showErrorUI(message) {
      // שימוש ברכיבי LEGO להצגת שגיאה
      const errorSection = document.querySelector('.js-error-feedback');
      if (errorSection) {
        errorSection.textContent = message;
        errorSection.hidden = false;
      }
    }
  }
  
  // אתחול המנהל לאחר טעינת ה-DOM
  document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
  });
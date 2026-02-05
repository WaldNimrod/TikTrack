/**
 * User Profile Page Logic
 * ----------------------
 * Handles user profile page functionality: loading user data, form submissions, and API interactions
 * Based on ProfileView.jsx implementation
 */

// Global state
const userProfileState = {
  userData: null,
  isLoading: false,
  isUpdatingInfo: false,
  isUpdatingPassword: false,
  isSavingApiKeys: false,
  showGeminiKey: false,
  showPerplexityKey: false,
  openSections: {
    'section-0': true,
    'section-1': true,
    'section-3': true,
  }
};

/**
 * Initialize user profile page
 */
async function initializeUserProfilePage() {
  try {
    // Setup event listeners
    setupEventListeners();
    
    // Load user data
    await loadUserData();
    
    // Load API keys
    await loadApiKeys();
    
    console.log('User profile page initialized');
  } catch (error) {
    console.error('Error initializing user profile page:', error);
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // User info form
  const userInfoForm = document.getElementById('userInfoForm');
  if (userInfoForm) {
    userInfoForm.addEventListener('submit', handleUserInfoSubmit);
  }
  
  const userInfoForm2 = document.getElementById('userInfoForm2');
  if (userInfoForm2) {
    userInfoForm2.addEventListener('submit', handleUserInfoSubmit);
  }
  
  // Password form
  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', handlePasswordSubmit);
  }
  
  // API keys form
  const aiAnalysisSettingsForm = document.getElementById('aiAnalysisSettingsForm');
  if (aiAnalysisSettingsForm) {
    aiAnalysisSettingsForm.addEventListener('submit', handleApiKeysSubmit);
  }
  
  // Action buttons
  const changePasswordBtn = document.getElementById('changePasswordBtn');
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', () => {
      window.location.href = '/change-password';
    });
  }
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // API key toggle buttons
  const toggleGeminiKeyBtn = document.getElementById('toggleGeminiKeyBtn');
  if (toggleGeminiKeyBtn) {
    toggleGeminiKeyBtn.addEventListener('click', () => {
      userProfileState.showGeminiKey = !userProfileState.showGeminiKey;
      const input = document.getElementById('geminiApiKey');
      if (input) {
        input.type = userProfileState.showGeminiKey ? 'text' : 'password';
      }
      const icon = document.getElementById('toggleGeminiKeyIcon');
      if (icon) {
        icon.textContent = userProfileState.showGeminiKey ? '👁️' : '👁️‍🗨️';
      }
    });
  }
  
  const togglePerplexityKeyBtn = document.getElementById('togglePerplexityKeyBtn');
  if (togglePerplexityKeyBtn) {
    togglePerplexityKeyBtn.addEventListener('click', () => {
      userProfileState.showPerplexityKey = !userProfileState.showPerplexityKey;
      const input = document.getElementById('perplexityApiKey');
      if (input) {
        input.type = userProfileState.showPerplexityKey ? 'text' : 'password';
      }
      const icon = document.getElementById('togglePerplexityKeyIcon');
      if (icon) {
        icon.textContent = userProfileState.showPerplexityKey ? '👁️' : '👁️‍🗨️';
      }
    });
  }
  
  // Validate API key buttons
  const validateGeminiBtn = document.getElementById('validateGeminiBtn');
  if (validateGeminiBtn) {
    validateGeminiBtn.addEventListener('click', validateGeminiKey);
  }
  
  const validatePerplexityBtn = document.getElementById('validatePerplexityBtn');
  if (validatePerplexityBtn) {
    validatePerplexityBtn.addEventListener('click', validatePerplexityKey);
  }
  
  // Resend verification buttons
  const resendEmailBtn = document.getElementById('resendEmailVerificationBtn');
  if (resendEmailBtn) {
    resendEmailBtn.addEventListener('click', handleResendEmailVerification);
  }
  
  const resendPhoneBtn = document.getElementById('resendPhoneVerificationBtn');
  if (resendPhoneBtn) {
    resendPhoneBtn.addEventListener('click', handleResendPhoneVerification);
  }
}

/**
 * Load user data from API
 */
async function loadUserData() {
  if (userProfileState.isLoading) return;
  
  userProfileState.isLoading = true;
  
  try {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    const response = await fetch('/api/v1/users/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    userProfileState.userData = data;
    
    // Populate forms
    populateUserInfoForm(data);
    
  } catch (error) {
    console.error('Error loading user data:', error);
  } finally {
    userProfileState.isLoading = false;
  }
}

/**
 * Populate user info form
 */
function populateUserInfoForm(userData) {
  const usernameInput = document.getElementById('profileUsername');
  if (usernameInput) {
    usernameInput.value = userData.username || '';
  }
  
  const emailInput = document.getElementById('profileEmail');
  if (emailInput) {
    emailInput.value = userData.email || '';
  }
  
  const emailInput2 = document.getElementById('profileEmail2');
  if (emailInput2) {
    emailInput2.value = userData.email || '';
  }
  
  const phoneInput = document.getElementById('phoneNumber');
  if (phoneInput) {
    phoneInput.value = userData.phoneNumber || userData.phone || '';
  }
  
  const firstNameInput = document.getElementById('profileFirstName');
  if (firstNameInput) {
    firstNameInput.value = userData.firstName || '';
  }
  
  const firstNameInput2 = document.getElementById('profileFirstName2');
  if (firstNameInput2) {
    firstNameInput2.value = userData.firstName || '';
  }
  
  const lastNameInput = document.getElementById('profileLastName');
  if (lastNameInput) {
    lastNameInput.value = userData.lastName || '';
  }
  
  const lastNameInput2 = document.getElementById('profileLastName2');
  if (lastNameInput2) {
    lastNameInput2.value = userData.lastName || '';
  }
  
  const iconInput = document.getElementById('profileIcon');
  if (iconInput) {
    iconInput.value = userData.icon || '';
  }
  
  const iconInput2 = document.getElementById('profileIcon2');
  if (iconInput2) {
    iconInput2.value = userData.icon || '';
  }
  
  // Update verification status badges
  updateEmailVerificationStatus(userData.isEmailVerified || userData.is_email_verified || false);
  updatePhoneVerificationStatus(userData.phoneVerified || userData.is_phone_verified || false);
}

/**
 * Update email verification status badge
 */
function updateEmailVerificationStatus(isVerified) {
  const statusEl = document.getElementById('emailVerificationStatus');
  if (statusEl) {
    if (isVerified) {
      statusEl.textContent = '✓ מאומת';
      statusEl.className = 'badge bg-success';
    } else {
      statusEl.textContent = '✗ לא מאומת';
      statusEl.className = 'badge bg-danger';
    }
  }
}

/**
 * Update phone verification status badge
 */
function updatePhoneVerificationStatus(isVerified) {
  const statusEl = document.getElementById('phoneVerificationStatus');
  if (statusEl) {
    if (isVerified) {
      statusEl.textContent = '✓ מאומת';
      statusEl.className = 'badge bg-success';
    } else {
      statusEl.textContent = '✗ לא מאומת';
      statusEl.className = 'badge bg-danger';
    }
  }
}

/**
 * Handle user info form submit
 */
async function handleUserInfoSubmit(e) {
  e.preventDefault();
  
  if (userProfileState.isUpdatingInfo) return;
  
  userProfileState.isUpdatingInfo = true;
  
  try {
    const form = e.target;
    const formData = {
      email: form.querySelector('#profileEmail')?.value || form.querySelector('#profileEmail2')?.value || '',
      firstName: form.querySelector('#profileFirstName')?.value || form.querySelector('#profileFirstName2')?.value || '',
      lastName: form.querySelector('#profileLastName')?.value || form.querySelector('#profileLastName2')?.value || '',
      icon: form.querySelector('#profileIcon')?.value || form.querySelector('#profileIcon2')?.value || '',
    };
    
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    const response = await fetch('/api/v1/users/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    userProfileState.userData = { ...userProfileState.userData, ...data };
    
    // Update all form fields
    populateUserInfoForm(userProfileState.userData);
    
    alert('פרטים עודכנו בהצלחה');
    
  } catch (error) {
    console.error('Error updating user info:', error);
    alert('שגיאה בעדכון הפרטים: ' + error.message);
  } finally {
    userProfileState.isUpdatingInfo = false;
  }
}

/**
 * Handle password form submit
 */
async function handlePasswordSubmit(e) {
  e.preventDefault();
  
  if (userProfileState.isUpdatingPassword) return;
  
  const form = e.target;
  const currentPassword = form.querySelector('#currentPassword')?.value;
  const newPassword = form.querySelector('#newPassword')?.value;
  const confirmNewPassword = form.querySelector('#confirmNewPassword')?.value;
  
  if (newPassword !== confirmNewPassword) {
    alert('הסיסמאות החדשות אינן תואמות');
    return;
  }
  
  if (newPassword.length < 6) {
    alert('הסיסמה החדשה חייבת להכיל לפחות 6 תווים');
    return;
  }
  
  userProfileState.isUpdatingPassword = true;
  
  try {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    const response = await fetch('/api/v1/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({
        old_password: currentPassword,
        new_password: newPassword
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    
    // Clear form
    form.reset();
    
    alert('הסיסמה עודכנה בהצלחה');
    
  } catch (error) {
    console.error('Error updating password:', error);
    alert('שגיאה בעדכון הסיסמה: ' + error.message);
  } finally {
    userProfileState.isUpdatingPassword = false;
  }
}

/**
 * Handle API keys form submit
 */
async function handleApiKeysSubmit(e) {
  e.preventDefault();
  
  if (userProfileState.isSavingApiKeys) return;
  
  userProfileState.isSavingApiKeys = true;
  
  try {
    const form = e.target;
    const formData = {
      aiDefaultProvider: form.querySelector('#aiDefaultProvider')?.value || 'gemini',
      geminiApiKey: form.querySelector('#geminiApiKey')?.value || '',
      perplexityApiKey: form.querySelector('#perplexityApiKey')?.value || '',
    };
    
    // TODO: Implement API keys save when endpoint is available
    console.log('API keys save requested:', formData);
    alert('שמירת מפתחות API - פונקציונליות זו תשולב בקרוב');
    
  } catch (error) {
    console.error('Error saving API keys:', error);
    alert('שגיאה בשמירת מפתחות API: ' + error.message);
  } finally {
    userProfileState.isSavingApiKeys = false;
  }
}

/**
 * Load API keys
 */
async function loadApiKeys() {
  try {
    // TODO: Implement API keys load when endpoint is available
    console.log('API keys load requested');
  } catch (error) {
    console.error('Error loading API keys:', error);
  }
}

/**
 * Validate Gemini API key
 */
async function validateGeminiKey() {
  const input = document.getElementById('geminiApiKey');
  const statusEl = document.getElementById('geminiKeyStatus');
  const btnText = document.getElementById('validateGeminiBtnText');
  
  if (!input || !input.value) {
    if (statusEl) statusEl.textContent = 'אנא הזן מפתח API';
    return;
  }
  
  if (btnText) btnText.textContent = 'בודק...';
  
  try {
    // TODO: Implement Gemini API key validation when endpoint is available
    console.log('Validating Gemini API key');
    if (statusEl) statusEl.textContent = 'בדיקת מפתח Gemini - פונקציונליות זו תשולב בקרוב';
  } catch (error) {
    console.error('Error validating Gemini key:', error);
    if (statusEl) statusEl.textContent = 'שגיאה בבדיקת המפתח';
  } finally {
    if (btnText) btnText.textContent = 'בדוק';
  }
}

/**
 * Validate Perplexity API key
 */
async function validatePerplexityKey() {
  const input = document.getElementById('perplexityApiKey');
  const statusEl = document.getElementById('perplexityKeyStatus');
  const btnText = document.getElementById('validatePerplexityBtnText');
  
  if (!input || !input.value) {
    if (statusEl) statusEl.textContent = 'אנא הזן מפתח API';
    return;
  }
  
  if (btnText) btnText.textContent = 'בודק...';
  
  try {
    // TODO: Implement Perplexity API key validation when endpoint is available
    console.log('Validating Perplexity API key');
    if (statusEl) statusEl.textContent = 'בדיקת מפתח Perplexity - פונקציונליות זו תשולב בקרוב';
  } catch (error) {
    console.error('Error validating Perplexity key:', error);
    if (statusEl) statusEl.textContent = 'שגיאה בבדיקת המפתח';
  } finally {
    if (btnText) btnText.textContent = 'בדוק';
  }
}

/**
 * Handle resend email verification
 */
async function handleResendEmailVerification() {
  const btn = document.getElementById('resendEmailVerificationBtn');
  if (!btn) return;
  
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'שולח...';
  
  try {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    const response = await fetch('/api/v1/auth/resend-email-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    alert('הודעת וריפיקציה נשלחה לאימייל שלך. אנא בדוק את תיבת הדואר.');
    
    // Reload user data to update verification status
    await loadUserData();
  } catch (error) {
    console.error('Error resending email verification:', error);
    alert('שגיאה בשליחת הודעת וריפיקציה: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

/**
 * Handle resend phone verification
 */
async function handleResendPhoneVerification() {
  const btn = document.getElementById('resendPhoneVerificationBtn');
  if (!btn) return;
  
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'שולח...';
  
  try {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    const response = await fetch('/api/v1/auth/resend-phone-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    alert('קוד וריפיקציה נשלח לטלפון שלך. אנא הזן את הקוד.');
    
    // Reload user data to update verification status
    await loadUserData();
  } catch (error) {
    console.error('Error resending phone verification:', error);
    alert('שגיאה בשליחת קוד וריפיקציה: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

/**
 * Handle logout
 */
async function handleLogout() {
  try {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    await fetch('/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('access_token');
    
    window.location.href = '/login';
  } catch (error) {
    console.error('Error logging out:', error);
    // Navigate anyway
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('access_token');
    window.location.href = '/login';
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeUserProfilePage);
} else {
  initializeUserProfilePage();
}

/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 *
 * This index lists all functions in this file, organized by category.
 *
 * Total Functions: 22
 *
 * PAGE INITIALIZATION (3)
 * - initializeUserProfilePage() - Initialize user profile page
 * - setupProfileEventListeners() - Setup event listeners for profile
 * - loadUserProfile() - Load user profile data
 *
 * SECTION MANAGEMENT (2)
 * - toggleSection(sectionId) - Toggle section visibility
 * - updateSectionStates() - Update section toggle states
 *
 * PROFILE MANAGEMENT (4)
 * - saveProfile() - Save profile changes
 * - changePassword() - Change user password
 * - validateProfileForm() - Validate profile form
 * - populateProfileForm(profile) - Populate profile form
 *
 * API KEY MANAGEMENT (4)
 * - saveApiKeys() - Save API keys
 * - validateGeminiKey() - Validate Gemini API key
 * - validatePerplexityKey() - Validate Perplexity API key
 * - testApiKey(apiType, key) - Test API key validity
 *
 * UI MANAGEMENT (5)
 * - showProfileModal() - Show profile edit modal
 * - hideProfileModal() - Hide profile edit modal
 * - showPasswordModal() - Show password change modal
 * - hidePasswordModal() - Hide password change modal
 * - updateProfileDisplay(profile) - Update profile display
 *
 * UTILITIES (4)
 * - formatProfileDate(date) - Format profile date
 * - validateEmail(email) - Validate email format
 * - showValidationError(field, message) - Show validation error
 * - clearValidationErrors() - Clear validation errors
 *
 * ==========================================
 */

/* ===== DEBUG INSTRUMENTATION - USER PROFILE ===== */
// region agent log
if (typeof fetch !== 'undefined') {
  fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      location: 'user_profile.js:load',
      message: 'User profile module loaded',
      data: {
        timestamp: Date.now(),
        page: window.location.pathname,
        module: 'user_profile.js',
        functions: 22
      },
      sessionId: 'user_profile_creation',
      hypothesisId: 'H1_missing_js_files'
    })
  }).catch(() => {});
}
// endregion

// Global state for user profile
const profileState = {
  currentProfile: null,
  loading: false,
  sections: {
    'top': true,
    'ai-analysis': false
  }
};

/**
 * Initialize user profile page
 */
function initializeUserProfilePage() {
  if (typeof window.Logger !== 'undefined') {
    window.Logger.info('Initializing user profile page', { page: 'user_profile' });
  }

  try {
    // Setup event listeners
    setupProfileEventListeners();

    // Load user profile
    loadUserProfile();

    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('פרופיל משתמש', 'טוען נתוני פרופיל...');
    }

    // #region agent log - page initialization
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        location: 'user_profile.js:initializeUserProfilePage',
        message: 'User profile page initialized successfully',
        data: {
          timestamp: Date.now(),
          page: window.location.pathname,
          sections: profileState.sections
        },
        sessionId: 'user_profile_creation',
        hypothesisId: 'H1_missing_js_files'
      })
    }).catch(() => {});
    // #endregion

  } catch (error) {
    if (typeof window.Logger !== 'undefined') {
      window.Logger.error('Error initializing user profile page', error, { page: 'user_profile' });
    }
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה באתחול פרופיל משתמש', error.message);
    }
  }
}

/**
 * Setup event listeners for profile
 */
function setupProfileEventListeners() {
  // Section toggle buttons
  document.querySelectorAll('[data-section-toggle]').forEach(button => {
    button.addEventListener('click', (e) => {
      const sectionId = e.target.getAttribute('data-section-toggle');
      toggleSection(sectionId);
    });
  });

  // Profile edit buttons
  const editProfileBtn = document.getElementById('editProfileBtn');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const cancelProfileBtn = document.getElementById('cancelProfileBtn');

  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', showProfileModal);
  }
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', saveProfile);
  }
  if (cancelProfileBtn) {
    cancelProfileBtn.addEventListener('click', hideProfileModal);
  }

  // Password change buttons
  const changePasswordBtn = document.getElementById('changePasswordBtn');
  const savePasswordBtn = document.getElementById('savePasswordBtn');
  const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');

  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', showPasswordModal);
  }
  if (savePasswordBtn) {
    savePasswordBtn.addEventListener('click', changePassword);
  }
  if (cancelPasswordBtn) {
    cancelPasswordBtn.addEventListener('click', hidePasswordModal);
  }

  // API key buttons
  const saveApiKeysBtn = document.getElementById('saveApiKeysBtn');
  const testGeminiBtn = document.getElementById('testGeminiBtn');
  const testPerplexityBtn = document.getElementById('testPerplexityBtn');

  if (saveApiKeysBtn) {
    saveApiKeysBtn.addEventListener('click', saveApiKeys);
  }
  if (testGeminiBtn) {
    testGeminiBtn.addEventListener('click', () => validateGeminiKey());
  }
  if (testPerplexityBtn) {
    testPerplexityBtn.addEventListener('click', () => validatePerplexityKey());
  }
}

/**
 * Load user profile data
 */
async function loadUserProfile() {
  if (profileState.loading) return;

  profileState.loading = true;

  try {
    // #region agent log - API integration marker: user_profile LIST
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        location: 'user_profile.js:loadUserProfile:list_api_call',
        message: 'API integration marker: user_profile LIST operation initiated',
        data: {
          timestamp: Date.now(),
          page: window.location.pathname,
          function: 'loadUserProfile',
          endpoint: '/api/user/profile/',
          method: 'GET',
          operation: 'LIST'
        },
        sessionId: 'user_profile_api_integration',
        hypothesisId: 'H2_api_integration_markers'
      })
    }).catch(() => {});
    // #endregion

    const response = await fetch('/api/user/profile/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status === 'success') {
      profileState.currentProfile = data.data;
      updateProfileDisplay(data.data);
    } else {
      throw new Error(data.message || 'Failed to load profile');
    }

  } catch (error) {
    if (typeof window.Logger !== 'undefined') {
      window.Logger.warn('Failed to load user profile from API, using defaults', { error: error.message });
    }

    // Use default profile data
    const defaultProfile = {
      name: 'משתמש',
      email: '',
      phone: '',
      language: 'he',
      timezone: 'Asia/Jerusalem',
      gemini_api_key: '',
      perplexity_api_key: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    profileState.currentProfile = defaultProfile;
    updateProfileDisplay(defaultProfile);

  } finally {
    profileState.loading = false;
  }
}

/**
 * Toggle section visibility
 */
function toggleSection(sectionId) {
  profileState.sections[sectionId] = !profileState.sections[sectionId];

  const section = document.getElementById(`section${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}`);
  const toggleBtn = document.querySelector(`[data-section-toggle="${sectionId}"]`);

  if (section) {
    if (profileState.sections[sectionId]) {
      section.classList.remove('d-none');
      section.classList.add('d-block');
    } else {
      section.classList.remove('d-block');
      section.classList.add('d-none');
    }
  }

  if (toggleBtn) {
    const icon = toggleBtn.querySelector('i, .icon');
    if (icon) {
      icon.style.transform = profileState.sections[sectionId] ? 'rotate(0deg)' : 'rotate(180deg)';
    }
  }

  if (typeof window.Logger !== 'undefined') {
    window.Logger.info(`Toggled section ${sectionId}`, {
      page: 'user_profile',
      sectionId,
      visible: profileState.sections[sectionId]
    });
  }
}

/**
 * Update section states
 */
function updateSectionStates() {
  Object.keys(profileState.sections).forEach(sectionId => {
    const section = document.getElementById(`section${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}`);
    if (section) {
      if (profileState.sections[sectionId]) {
        section.classList.remove('d-none');
        section.classList.add('d-block');
      } else {
        section.classList.remove('d-block');
        section.classList.add('d-none');
      }
    }
  });
}

/**
 * Show profile edit modal
 */
function showProfileModal() {
  const modal = document.getElementById('profileEditModal');
  if (!modal) return;

  if (profileState.currentProfile) {
    populateProfileForm(profileState.currentProfile);
  }

  modal.style.display = 'block';
  clearValidationErrors();
}

/**
 * Hide profile edit modal
 */
function hideProfileModal() {
  const modal = document.getElementById('profileEditModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * Show password change modal
 */
function showPasswordModal() {
  const modal = document.getElementById('passwordChangeModal');
  if (!modal) return;

  // Clear form
  const form = document.getElementById('passwordChangeForm');
  if (form) {
    form.reset();
  }

  modal.style.display = 'block';
  clearValidationErrors();
}

/**
 * Hide password change modal
 */
function hidePasswordModal() {
  const modal = document.getElementById('passwordChangeModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * Save profile changes
 */
async function saveProfile() {
  if (!validateProfileForm()) {
    return;
  }

  const formData = new FormData(document.getElementById('profileEditForm'));
  const profileData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    language: formData.get('language'),
    timezone: formData.get('timezone')
  };

  try {
    const response = await fetch('/api/user/profile/', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'success') {
      profileState.currentProfile = { ...profileState.currentProfile, ...profileData };
      updateProfileDisplay(profileState.currentProfile);
      hideProfileModal();

      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', 'פרופיל עודכן בהצלחה');
      }
    } else {
      throw new Error(data.message || 'Failed to update profile');
    }

  } catch (error) {
    if (typeof window.Logger !== 'undefined') {
      window.Logger.error('Error saving profile', error, { page: 'user_profile' });
    }
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בשמירת פרופיל', error.message);
    }
  }
}

/**
 * Change user password
 */
async function changePassword() {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validate passwords
  if (!currentPassword || !newPassword || !confirmPassword) {
    showValidationError('password', 'אנא מלא את כל השדות');
    return;
  }

  if (newPassword !== confirmPassword) {
    showValidationError('password', 'הסיסמאות החדשות אינן תואמות');
    return;
  }

  if (newPassword.length < 6) {
    showValidationError('password', 'הסיסמה החדשה חייבת להכיל לפחות 6 תווים');
    return;
  }

  try {
    const response = await fetch('/api/user/change_password/', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'success') {
      hidePasswordModal();

      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', 'הסיסמה שונתה בהצלחה');
      }
    } else {
      throw new Error(data.message || 'Failed to change password');
    }

  } catch (error) {
    if (typeof window.Logger !== 'undefined') {
      window.Logger.error('Error changing password', error, { page: 'user_profile' });
    }
    showValidationError('password', error.message);
  }
}

/**
 * Save API keys
 */
async function saveApiKeys() {
  const geminiKey = document.getElementById('geminiApiKey').value.trim();
  const perplexityKey = document.getElementById('perplexityApiKey').value.trim();

  try {
    const response = await fetch('/api/user/profile/', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        gemini_api_key: geminiKey,
        perplexity_api_key: perplexityKey
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'success') {
      profileState.currentProfile = {
        ...profileState.currentProfile,
        gemini_api_key: geminiKey,
        perplexity_api_key: perplexityKey
      };

      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', 'מפתחות API נשמרו בהצלחה');
      }
    } else {
      throw new Error(data.message || 'Failed to save API keys');
    }

  } catch (error) {
    if (typeof window.Logger !== 'undefined') {
      window.Logger.error('Error saving API keys', error, { page: 'user_profile' });
    }
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בשמירת מפתחות API', error.message);
    }
  }
}

/**
 * Validate Gemini API key
 */
async function validateGeminiKey() {
  const key = document.getElementById('geminiApiKey').value.trim();

  if (!key) {
    showValidationError('gemini', 'אנא הזן מפתח Gemini API');
    return;
  }

  try {
    const isValid = await testApiKey('gemini', key);

    if (isValid) {
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', 'מפתח Gemini API תקין');
      }
      document.getElementById('geminiStatus').textContent = '✓ תקין';
      document.getElementById('geminiStatus').className = 'text-success';
    } else {
      showValidationError('gemini', 'מפתח Gemini API לא תקין');
      document.getElementById('geminiStatus').textContent = '✗ לא תקין';
      document.getElementById('geminiStatus').className = 'text-danger';
    }

  } catch (error) {
    showValidationError('gemini', 'שגיאה בבדיקת מפתח Gemini API');
    document.getElementById('geminiStatus').textContent = '✗ שגיאה';
    document.getElementById('geminiStatus').className = 'text-danger';
  }
}

/**
 * Validate Perplexity API key
 */
async function validatePerplexityKey() {
  const key = document.getElementById('perplexityApiKey').value.trim();

  if (!key) {
    showValidationError('perplexity', 'אנא הזן מפתח Perplexity API');
    return;
  }

  try {
    const isValid = await testApiKey('perplexity', key);

    if (isValid) {
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', 'מפתח Perplexity API תקין');
      }
      document.getElementById('perplexityStatus').textContent = '✓ תקין';
      document.getElementById('perplexityStatus').className = 'text-success';
    } else {
      showValidationError('perplexity', 'מפתח Perplexity API לא תקין');
      document.getElementById('perplexityStatus').textContent = '✗ לא תקין';
      document.getElementById('perplexityStatus').className = 'text-danger';
    }

  } catch (error) {
    showValidationError('perplexity', 'שגיאה בבדיקת מפתח Perplexity API');
    document.getElementById('perplexityStatus').textContent = '✗ שגיאה';
    document.getElementById('perplexityStatus').className = 'text-danger';
  }
}

/**
 * Test API key validity
 */
async function testApiKey(apiType, key) {
  try {
    const endpoint = apiType === 'gemini' ?
      '/api/user/validate_gemini_key/' :
      '/api/user/validate_perplexity_key/';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ api_key: key })
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.status === 'success' && data.valid === true;

  } catch (error) {
    if (typeof window.Logger !== 'undefined') {
      window.Logger.warn(`Error testing ${apiType} API key`, { error: error.message });
    }
    return false;
  }
}

/**
 * Validate profile form
 */
function validateProfileForm() {
  clearValidationErrors();

  const form = document.getElementById('profileEditForm');
  if (!form) return false;

  const name = form.querySelector('[name="name"]').value.trim();
  const email = form.querySelector('[name="email"]').value.trim();

  let isValid = true;

  if (!name) {
    showValidationError('name', 'אנא הזן שם');
    isValid = false;
  }

  if (!email) {
    showValidationError('email', 'אנא הזן כתובת אימייל');
    isValid = false;
  } else if (!validateEmail(email)) {
    showValidationError('email', 'אנא הזן כתובת אימייל תקינה');
    isValid = false;
  }

  return isValid;
}

/**
 * Populate profile form
 */
function populateProfileForm(profile) {
  const form = document.getElementById('profileEditForm');
  if (!form || !profile) return;

  form.querySelector('[name="name"]').value = profile.name || '';
  form.querySelector('[name="email"]').value = profile.email || '';
  form.querySelector('[name="phone"]').value = profile.phone || '';
  form.querySelector('[name="language"]').value = profile.language || 'he';
  form.querySelector('[name="timezone"]').value = profile.timezone || 'Asia/Jerusalem';
}

/**
 * Update profile display
 */
function updateProfileDisplay(profile) {
  if (!profile) return;

  // Update profile display elements
  const nameEl = document.getElementById('profileName');
  const emailEl = document.getElementById('profileEmail');
  const phoneEl = document.getElementById('profilePhone');
  const languageEl = document.getElementById('profileLanguage');
  const timezoneEl = document.getElementById('profileTimezone');

  if (nameEl) nameEl.textContent = profile.name || 'לא צוין';
  if (emailEl) emailEl.textContent = profile.email || 'לא צוין';
  if (phoneEl) phoneEl.textContent = profile.phone || 'לא צוין';
  if (languageEl) nameEl.textContent = profile.language === 'he' ? 'עברית' : 'English';
  if (timezoneEl) timezoneEl.textContent = profile.timezone || 'Asia/Jerusalem';

  // Update API keys display (masked)
  const geminiKeyEl = document.getElementById('geminiApiKey');
  const perplexityKeyEl = document.getElementById('perplexityApiKey');

  if (geminiKeyEl && profile.gemini_api_key) {
    geminiKeyEl.value = profile.gemini_api_key;
  }
  if (perplexityKeyEl && profile.perplexity_api_key) {
    perplexityKeyEl.value = profile.perplexity_api_key;
  }

  // Update section states
  updateSectionStates();
}

/**
 * Format profile date
 */
function formatProfileDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('he-IL');
}

/**
 * Validate email format
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Show validation error
 */
function showValidationError(field, message) {
  const errorEl = document.getElementById(`${field}Error`);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }

  // Add error class to field
  const fieldEl = document.querySelector(`[name="${field}"]`);
  if (fieldEl) {
    fieldEl.classList.add('is-invalid');
  }
}

/**
 * Clear validation errors
 */
function clearValidationErrors() {
  document.querySelectorAll('.invalid-feedback').forEach(el => {
    el.style.display = 'none';
  });

  document.querySelectorAll('.is-invalid').forEach(el => {
    el.classList.remove('is-invalid');
  });
}

// Export functions to global scope
window.initializeUserProfilePage = initializeUserProfilePage;
window.toggleSection = toggleSection;
window.validateGeminiKey = validateGeminiKey;
window.validatePerplexityKey = validatePerplexityKey;
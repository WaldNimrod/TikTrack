/**
 * Playwright Authentication Helper
 * =================================
 * Helper functions for Playwright E2E tests to handle authentication
 *
 * Features:
 * - Login with username/password
 * - Session-based authentication support
 * - Cookie/session state management
 * - Support for multiple test users
 *
 * @version 1.0.0
 * @created December 4, 2025
 */


// ===== FUNCTION INDEX =====

// === Event Handlers ===
// - waitForAuthentication() - Waitforauthentication
// - verifyAuthentication() - Verifyauthentication

// === Data Functions ===
// - getCurrentUser() - Getcurrentuser

// === Other ===
// - authenticateUser() - Authenticateuser
// - logoutUser() - Logoutuser

/**
 * Authenticate user with Playwright
 * @param {Page} page - Playwright page object
 * @param {string} username - Username to login with
 * @param {string} password - Password to login with
 * @param {Object} options - Optional configuration
 * @param {string} options.baseURL - Base URL (default: 'http://localhost:8080')
 * @param {number} options.timeout - Timeout in ms (default: 30000)
 * @returns {Promise<void>}
 */
async function authenticateUser(page, username, password, options = {}) {
  const {
    baseURL = process.env.BASE_URL || 'http://localhost:8080',
    timeout = 30000
  } = options;

  const loginURL = `${baseURL}/`;

  try {
    // Navigate to login page
    await page.goto(loginURL, { waitUntil: 'networkidle' });

    // Wait for login container to be available
    await page.waitForSelector('#loginContainer', { timeout });

    // Wait for login form to be created (it's created dynamically by auth.js)
    // The form might take a moment to be created via createLoginInterface()
    await page.waitForSelector('#loginForm', { timeout });

    // Wait a bit more to ensure form is fully ready
    await page.waitForTimeout(500);

    // Fill username field
    const usernameField = page.locator('#username');
    await usernameField.waitFor({ state: 'visible', timeout });
    await usernameField.fill(username);

    // Fill password field
    const passwordField = page.locator('#password');
    await passwordField.waitFor({ state: 'visible', timeout });
    await passwordField.fill(password);

    // Click login button or submit form
    const loginBtn = page.locator('#loginBtn');
    await loginBtn.waitFor({ state: 'visible', timeout });

    // Wait for localStorage update after login (login happens via form submit, then redirects after 1 second)
    const authPromise = page.waitForFunction(
      () => {
        try {
          const currentUser = sessionStorage.getItem('currentUser'); // Option 1
          return currentUser !== null && currentUser !== '';
        } catch (e) {
          return false;
        }
      },
      { timeout }
    );

    // Click login button (triggers form submit)
    await loginBtn.click();

    // Wait for authentication to be verified (localStorage update)
    await authPromise;

    // Wait for navigation (happens after 1 second delay in auth.js)
    try {
      await page.waitForURL(url => !url.includes('/login'), { timeout: 10000 });
    } catch (e) {
      // If navigation doesn't happen, that's okay - we're authenticated
      // Just verify we're not on login page
      const currentURL = page.url();
      if (currentURL.includes('/login')) {
        // Wait a bit more for redirect
        await page.waitForTimeout(2000);
      }
    }

    // Verify authentication by checking localStorage
    const isAuthenticated = await page.evaluate(() => {
      try {
        const currentUser = sessionStorage.getItem('currentUser');
        const authToken = sessionStorage.getItem('authToken'); // Option 1
        return currentUser !== null && currentUser !== '' && authToken !== null;
      } catch (e) {
        return false;
      }
    });

    if (!isAuthenticated) {
      // Check for error message on page
      const errorMessage = await page.evaluate(() => {
        const errorDiv = document.getElementById('loginError');
        return errorDiv ? errorDiv.textContent : null;
      });
      
      if (errorMessage) {
        throw new Error(`Authentication failed: ${errorMessage}`);
      }
      throw new Error('Authentication failed - currentUser or authToken not found in sessionStorage (Option 1)');
    }

    // Wait a bit more for any redirects to settle (auth.js redirects after 1 second)
    await page.waitForTimeout(1500);
    
    // Additional verification: check that we're not on login page anymore (if redirect happened)
    const currentURL = page.url();
    if (currentURL.includes('/login')) {
      // If still on login page, wait a bit more for redirect
      await page.waitForTimeout(2000);
      const finalURL = page.url();
      if (finalURL.includes('/login')) {
        // Still on login page - but we have localStorage, so authentication worked
        // This might be okay if redirect didn't happen yet
        // Just log a warning
        console.warn('Still on login page after authentication, but localStorage indicates success');
      }
    }

  } catch (error) {
    // Take screenshot on error
    await page.screenshot({ path: 'auth-error.png', fullPage: true });
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

/**
 * Wait for authentication to be verified
 * @param {Page} page - Playwright page object
 * @param {number} timeout - Timeout in ms (default: 10000)
 * @returns {Promise<boolean>} - True if authenticated
 */
async function waitForAuthentication(page, timeout = 10000) {
  try {
    await page.waitForFunction(
      () => {
        try {
          const currentUser = sessionStorage.getItem('currentUser'); // Option 1
          return currentUser !== null && currentUser !== '';
        } catch (e) {
          return false;
        }
      },
      { timeout }
    );
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Verify that user is authenticated
 * @param {Page} page - Playwright page object
 * @returns {Promise<boolean>} - True if authenticated
 */
async function verifyAuthentication(page) {
  try {
    const isAuthenticated = await page.evaluate(() => {
      try {
        const currentUser = sessionStorage.getItem('currentUser');
        const authToken = sessionStorage.getItem('authToken'); // Option 1
        return currentUser !== null && currentUser !== '' && authToken !== null;
      } catch (e) {
        return false;
      }
    });
    return isAuthenticated;
  } catch (error) {
    return false;
  }
}

/**
 * Get current authenticated user from localStorage
 * @param {Page} page - Playwright page object
 * @returns {Promise<Object|null>} - User object or null
 */
async function getCurrentUser(page) {
  try {
    const user = await page.evaluate(() => {
      try {
        const currentUserStr = sessionStorage.getItem('currentUser'); // Option 1
        if (!currentUserStr) {
          return null;
        }
        return JSON.parse(currentUserStr);
      } catch (e) {
        return null;
      }
    });
    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Logout user
 * @param {Page} page - Playwright page object
 * @param {string} baseURL - Base URL (default: 'http://localhost:8080')
 * @returns {Promise<void>}
 */
async function logoutUser(page, baseURL = process.env.BASE_URL || 'http://localhost:8080') {
  try {
    // Navigate to logout endpoint or call logout function
    await page.goto(`${baseURL}/api/auth/logout`, { waitUntil: 'networkidle' });

    // Clear localStorage
    await page.evaluate(() => {
      sessionStorage.removeItem('currentUser');
      sessionStorage.removeItem('authToken'); // Option 1
      sessionStorage.clear();
    });

    // Wait a bit for cleanup
    await page.waitForTimeout(500);
  } catch (error) {
    // Ignore errors during logout
    console.warn('Error during logout:', error.message);
  }
}

module.exports = {
  authenticateUser,
  waitForAuthentication,
  verifyAuthentication,
  getCurrentUser,
  logoutUser
};


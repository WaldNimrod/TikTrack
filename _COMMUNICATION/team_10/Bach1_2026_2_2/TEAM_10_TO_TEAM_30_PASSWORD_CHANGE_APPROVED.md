# ✅ הודעה: צוות 10 → צוות 30 (Password Change Flow - Architectural Decision)

**From:** Team 10 (The Gateway)  
**To:** Team 30 (Frontend)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.5  
**Subject:** PASSWORD_CHANGE_FLOW_APPROVED | Status: ✅ APPROVED  
**Priority:** ✅ **ARCHITECTURAL_DECISION**

---

## ✅ הודעה חשובה

**החלטה אדריכלית רשמית: Password Change Flow מאושר!**

האדריכלית הראשית אישרה את ה-Password Change Flow.  
**צריך לעדכן את רכיב הפרופיל (D15_PROF_VIEW.html).**

---

## 🏰 החלטה אדריכלית

**Backend Endpoint:** `PUT /users/me/password` ✅ **APPROVED**

**Payload (API Layer - snake_case):**
```json
{
  "old_password": "string",
  "new_password": "string"
}
```

**Frontend State (React Layer - camelCase):**
```javascript
{
  currentPassword: "string",  // → old_password
  newPassword: "string"      // → new_password
}
```

---

## 🔵 הנחיות לביצוע - צוות 30 (Frontend)

### **1. UI Context**

**מיקום:** הוספת סקשן "אבטחה" בתוך `D15_PROF_VIEW.html`

**LEGO Component:**
```html
<tt-section data-title="אבטחת חשבון">
  <!-- Password change form here -->
</tt-section>
```

---

### **2. Form Structure**

**שדות נדרשים:**
- `currentPassword` - הסיסמה הנוכחית
- `newPassword` - הסיסמה החדשה
- `confirmPassword` - אימות הסיסמה החדשה (client-side validation)

**Eye Icon:** חובה לכלול Eye icon (הצג סיסמה) תואם למערכת הלגסי

---

### **3. Naming Alignment**

**React State (camelCase):**
```javascript
const [formData, setFormData] = useState({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});
```

**API Payload (snake_case):**
```javascript
// After transformation
{
  old_password: formData.currentPassword,
  new_password: formData.newPassword
}
```

---

### **4. Transformer Update** 🔄

**חובה לעדכן את ה-AuthTransformer:**

**File:** `ui/src/utils/transformers.js` (או מיקום אחר לפי הארגון שלכם)

**הוספת מיפוי:**
```javascript
/**
 * Transform React password change form to API payload
 * @param {Object} reactData - React form data (camelCase)
 * @returns {Object} API payload (snake_case)
 */
export function reactToApiPasswordChange(reactData) {
  return {
    old_password: reactData.currentPassword,
    new_password: reactData.newPassword
  };
}

/**
 * Transform API password change response to React state
 * @param {Object} apiResponse - API response
 * @returns {Object} React state data
 */
export function apiToReactPasswordChange(apiResponse) {
  // Usually just success message, but if needed:
  return {
    message: apiResponse.message || 'Password changed successfully'
  };
}
```

---

### **5. Component Implementation**

**File:** `ui/src/components/profile/PasswordChangeForm.jsx` (או מיקום אחר)

**Structure:**
```javascript
import React, { useState } from 'react';
import { reactToApiPasswordChange } from '../../utils/transformers';
import authService from '../../services/auth';
import { audit } from '../../utils/audit';
import { debugLog } from '../../utils/debug';

const PasswordChangeForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Client-side validation
      if (formData.newPassword !== formData.confirmPassword) {
        setError('הסיסמאות לא תואמות');
        return;
      }

      // Transform to API format
      const payload = reactToApiPasswordChange({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      // API call
      await authService.changePassword(payload);

      // Success
      audit.log('PasswordChangeForm', 'Password changed successfully');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      // Show success message
      
    } catch (error) {
      debugLog('PasswordChangeForm', 'Password change error', error);
      setError(error.message || 'שגיאה בשינוי הסיסמה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <tt-section data-title="אבטחת חשבון">
      {/* Form implementation */}
    </tt-section>
  );
};

export default PasswordChangeForm;
```

---

### **6. Service Update**

**File:** `ui/src/services/auth.js`

**הוספת method:**
```javascript
/**
 * Change user password
 * @param {Object} passwordData - Password change data (snake_case after transformation)
 * @returns {Promise<Object>} Success response
 */
async changePassword(passwordData) {
  const response = await apiClient.put('/users/me/password', passwordData);
  return response.data;
}
```

---

### **7. Integration with Profile View**

**File:** `ui/src/components/profile/ProfileView.jsx` (או מיקום אחר)

**הוספת PasswordChangeForm:**
```javascript
import PasswordChangeForm from './PasswordChangeForm';

const ProfileView = () => {
  return (
    <div>
      {/* Profile sections */}
      <PasswordChangeForm />
    </div>
  );
};
```

---

## 📋 Checklist לביצוע

- [ ] סקשן "אבטחה" נוסף ל-Profile View
- [ ] LEGO Component (`<tt-section data-title="אבטחת חשבון">`)
- [ ] Form עם שדות: currentPassword, newPassword, confirmPassword
- [ ] Eye icon (הצג סיסמה) לכל שדה סיסמה
- [ ] Client-side validation (סיסמאות תואמות)
- [ ] Transformer מעודכן (`reactToApiPasswordChange`)
- [ ] Service method (`authService.changePassword`)
- [ ] Error handling (LEGO structure)
- [ ] Loading states
- [ ] Audit Trail (`?debug` mode)
- [ ] Fidelity match עם Legacy

---

## 🎨 Fidelity Requirements

**חובה להתאים ל-Legacy:**
- Eye icon (הצג סיסמה) - תואם למערכת הלגסי
- Form structure - תואם ל-D15_PROF_VIEW.html
- Error display - LEGO structure (`tt-container` > `tt-section`)
- Loading states - תואם למערכת

---

## 📡 דיווח נדרש

**לאחר המימוש, שלחו:**

```text
From: Team 30
To: Team 10 (The Gateway)
Subject: Password Change Form Implemented
Status: COMPLETED
Component: PasswordChangeForm.jsx
Features: Form, Transformer, Service, Error handling, Fidelity match
log_entry | [Team 30] | PASSWORD_CHANGE_FORM_IMPLEMENTED | COMPONENT | GREEN
```

---

## ✅ Sign-off

**Architectural Decision:** ✅ **APPROVED**  
**Component:** Password Change Form in Profile View  
**Status:** ✅ **READY FOR IMPLEMENTATION**

---

**Team 10 (The Gateway)**  
**Status:** ✅ **ARCHITECTURAL_DECISION_DELIVERED**

---

**log_entry | Team 10 | PASSWORD_CHANGE_APPROVED | TO_TEAM_30 | GREEN | 2026-01-31**

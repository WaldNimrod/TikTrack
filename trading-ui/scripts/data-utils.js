/**
 * Data Utilities JavaScript
 * 
 * פונקציות נתונים משותפות באמת - רק מה שמשמש הרבה עמודים
 * 
 * File: trading-ui/scripts/data-utils.js
 * Version: 1.0
 * Last Updated: August 23, 2025
 */

// ===== Generic API Functions =====

/**
 * קריאה כללית ל-API
 * Generic API call
 */
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(endpoint, options);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error(`❌ API call failed for ${endpoint}:`, error);
        throw error;
    }
}

/**
 * טעינת נתונים כללית
 * Generic data loading
 */
async function loadData(endpoint, dataKey, updateFunction, summaryFunction = null) {
    try {
        console.log(`🔄 Loading data from ${endpoint}`);

        const data = await apiCall(endpoint);
        const items = data[dataKey] || [];

        // Store in global scope
        const globalKey = dataKey.replace(/s$/, 'Data'); // alerts -> alertData
        window[globalKey] = items;
        window[`filtered${globalKey.charAt(0).toUpperCase() + globalKey.slice(1)}`] = [...items];

        // Update UI
        if (typeof updateFunction === 'function') {
            updateFunction();
        }

        if (typeof summaryFunction === 'function') {
            summaryFunction();
        }

        console.log(`✅ Data loaded successfully from ${endpoint}`);

    } catch (error) {
        console.error(`❌ Error loading data from ${endpoint}:`, error);
        showError(`שגיאה בטעינת נתונים מ-${endpoint}`);
    }
}

/**
 * שמירת נתונים כללית
 * Generic data saving
 */
async function saveData(endpoint, data, reloadFunction = null) {
    try {
        console.log(`🔄 Saving data to ${endpoint}`);

        const result = await apiCall(endpoint, 'POST', data);

        console.log(`✅ Data saved successfully to ${endpoint}`);

        // Reload data if function provided
        if (typeof reloadFunction === 'function') {
            await reloadFunction();
        }

        return result;

    } catch (error) {
        console.error(`❌ Error saving data to ${endpoint}:`, error);
        showError(`שגיאה בשמירת נתונים ל-${endpoint}`);
        throw error;
    }
}

/**
 * עדכון נתונים כללי
 * Generic data updating
 */
async function updateData(endpoint, id, data, reloadFunction = null) {
    try {
        console.log(`🔄 Updating data at ${endpoint}/${id}`);

        const result = await apiCall(`${endpoint}/${id}`, 'PUT', data);

        console.log(`✅ Data updated successfully at ${endpoint}/${id}`);

        // Reload data if function provided
        if (typeof reloadFunction === 'function') {
            await reloadFunction();
        }

        return result;

    } catch (error) {
        console.error(`❌ Error updating data at ${endpoint}/${id}:`, error);
        showError(`שגיאה בעדכון נתונים ב-${endpoint}`);
        throw error;
    }
}

/**
 * מחיקת נתונים כללית
 * Generic data deletion
 */
async function deleteData(endpoint, id, reloadFunction = null) {
    try {
        console.log(`🔄 Deleting data from ${endpoint}/${id}`);

        await apiCall(`${endpoint}/${id}`, 'DELETE');

        console.log(`✅ Data deleted successfully from ${endpoint}/${id}`);

        // Reload data if function provided
        if (typeof reloadFunction === 'function') {
            await reloadFunction();
        }

    } catch (error) {
        console.error(`❌ Error deleting data from ${endpoint}/${id}:`, error);
        showError(`שגיאה במחיקת נתונים מ-${endpoint}`);
        throw error;
    }
}

// ===== Validation Functions =====

/**
 * אימות שדה חובה
 * Validate required field
 */
function validateRequired(value, fieldName) {
    if (!value || value.trim() === '') {
        showError(`שדה ${fieldName} הוא שדה חובה`);
        return false;
    }
    return true;
}

/**
 * אימות מספר
 * Validate number
 */
function validateNumber(value, fieldName, min = null, max = null) {
    const num = parseFloat(value);
    if (isNaN(num)) {
        showError(`שדה ${fieldName} חייב להיות מספר`);
        return false;
    }

    if (min !== null && num < min) {
        showError(`שדה ${fieldName} חייב להיות לפחות ${min}`);
        return false;
    }

    if (max !== null && num > max) {
        showError(`שדה ${fieldName} חייב להיות לכל היותר ${max}`);
        return false;
    }

    return true;
}

/**
 * אימות תאריך
 * Validate date
 */
function validateDate(value, fieldName) {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
        showError(`שדה ${fieldName} חייב להיות תאריך תקין`);
        return false;
    }
    return true;
}

// ===== Export Functions =====
window.apiCall = apiCall;
window.loadData = loadData;
window.saveData = saveData;
window.updateData = updateData;
window.deleteData = deleteData;
window.validateRequired = validateRequired;
window.validateNumber = validateNumber;
window.validateDate = validateDate;

console.log('✅ Data Utils loaded successfully');

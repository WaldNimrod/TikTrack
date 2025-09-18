/**
 * Preferences Admin Interface V3
 * ==============================
 * 
 * ממשק ניהול למערכת העדפות V3
 * 
 * @version 3.0.0
 * @lastUpdated January 2025
 * @author TikTrack Development Team
 */

// ===== ADMIN INTERFACE FUNCTIONS =====

/**
 * יצירת ממשק ניהול העדפות
 */
window.createPreferencesAdminInterface = function() {
    console.log('🔧 Creating preferences admin interface...');
    
    // בדיקה אם הממשק כבר קיים
    const existingAdmin = document.getElementById('preferences-admin-interface');
    if (existingAdmin) {
        console.log('⚠️ Admin interface already exists, removing...');
        existingAdmin.remove();
    }
    
    // יצירת הממשק
    const adminInterface = document.createElement('div');
    adminInterface.id = 'preferences-admin-interface';
    adminInterface.className = 'preferences-admin-interface';
    adminInterface.innerHTML = `
        <div class="admin-header">
            <h3><i class="bi bi-gear-fill"></i> ממשק ניהול העדפות V3</h3>
            <div class="admin-controls">
                <button class="btn btn-sm btn-outline-primary" onclick="window.refreshAdminData()">
                    <i class="bi bi-arrow-clockwise"></i> רענן
                </button>
                <button class="btn btn-sm btn-outline-secondary" onclick="window.toggleAdminInterface()">
                    <i class="bi bi-x-lg"></i> סגור
                </button>
            </div>
        </div>
        
        <div class="admin-content">
            <!-- חיפוש וסינון -->
            <div class="admin-search-section">
                <div class="row g-3 mb-3">
                    <div class="col-md-3">
                        <label class="form-label">משתמש:</label>
                        <select class="form-select" id="admin-user-select">
                            <option value="1">משתמש 1 (ברירת מחדל)</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">פרופיל:</label>
                        <select class="form-select" id="admin-profile-select">
                            <option value="">כל הפרופילים</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">קבוצה:</label>
                        <select class="form-select" id="admin-group-select">
                            <option value="">כל הקבוצות</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">חיפוש:</label>
                        <input type="text" class="form-control" id="admin-search-input" placeholder="חפש העדפה...">
                    </div>
                </div>
            </div>
            
            <!-- טבלת העדפות -->
            <div class="admin-table-section">
                <div class="table-responsive">
                    <table class="table table-striped table-hover" id="admin-preferences-table">
                        <thead class="table-dark">
                            <tr>
                                <th>מזהה</th>
                                <th>שם העדפה</th>
                                <th>קבוצה</th>
                                <th>סוג</th>
                                <th>ערך שמור</th>
                                <th>ערך ברירת מחדל</th>
                                <th>פעולות</th>
                            </tr>
                        </thead>
                        <tbody id="admin-preferences-tbody">
                            <tr>
                                <td colspan="7" class="text-center text-muted">
                                    <i class="bi bi-hourglass-split"></i> טוען נתונים...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- סטטיסטיקות -->
            <div class="admin-stats-section">
                <div class="row g-3">
                    <div class="col-md-3">
                        <div class="card bg-primary text-white">
                            <div class="card-body">
                                <h5 class="card-title">סה"כ העדפות</h5>
                                <h3 id="admin-total-preferences">-</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-success text-white">
                            <div class="card-body">
                                <h5 class="card-title">העדפות שמורות</h5>
                                <h3 id="admin-saved-preferences">-</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-info text-white">
                            <div class="card-body">
                                <h5 class="card-title">קבוצות</h5>
                                <h3 id="admin-total-groups">-</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-warning text-white">
                            <div class="card-body">
                                <h5 class="card-title">פרופילים</h5>
                                <h3 id="admin-total-profiles">-</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // הוספת הממשק לעמוד
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.appendChild(adminInterface);
        console.log('✅ Admin interface created successfully');
        
        // טעינת נתונים ראשונית
        window.loadAdminData();
        
        // הוספת מאזינים לאירועים
        window.setupAdminEventListeners();
    } else {
        console.error('❌ Could not find main content area');
    }
};

/**
 * טעינת נתונים לממשק הניהול
 */
window.loadAdminData = async function() {
    try {
        console.log('📊 Loading admin data...');
        
        // טעינת פרופילים
        await window.loadAdminProfiles();
        
        // טעינת קבוצות
        await window.loadAdminGroups();
        
        // טעינת העדפות
        await window.loadAdminPreferences();
        
        // עדכון סטטיסטיקות
        window.updateAdminStats();
        
        console.log('✅ Admin data loaded successfully');
    } catch (error) {
        console.error('❌ Error loading admin data:', error);
        window.showAdminError('שגיאה בטעינת נתונים', error.message);
    }
};

/**
 * טעינת פרופילים לממשק הניהול
 */
window.loadAdminProfiles = async function() {
    try {
        const userId = document.getElementById('admin-user-select')?.value || 1;
        const profiles = await window.getUserProfiles(userId);
        
        const profileSelect = document.getElementById('admin-profile-select');
        if (profileSelect) {
            profileSelect.innerHTML = '<option value="">כל הפרופילים</option>';
            
            profiles.forEach(profile => {
                const option = document.createElement('option');
                option.value = profile.id;
                option.textContent = `${profile.name} (${profile.active ? 'פעיל' : 'לא פעיל'})`;
                profileSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('❌ Error loading profiles:', error);
    }
};

/**
 * טעינת קבוצות לממשק הניהול
 */
window.loadAdminGroups = async function() {
    try {
        // קבוצות ידועות
        const groups = [
            { name: 'general', display: 'כללי' },
            { name: 'colors', display: 'צבעים' },
            { name: 'filters', display: 'פילטרים' },
            { name: 'ui', display: 'ממשק משתמש' },
            { name: 'external_data', display: 'נתונים חיצוניים' },
            { name: 'notifications', display: 'התראות' }
        ];
        
        const groupSelect = document.getElementById('admin-group-select');
        if (groupSelect) {
            groupSelect.innerHTML = '<option value="">כל הקבוצות</option>';
            
            groups.forEach(group => {
                const option = document.createElement('option');
                option.value = group.name;
                option.textContent = group.display;
                groupSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('❌ Error loading groups:', error);
    }
};

/**
 * טעינת העדפות לממשק הניהול
 */
window.loadAdminPreferences = async function() {
    try {
        const userId = document.getElementById('admin-user-select')?.value || 1;
        const profileId = document.getElementById('admin-profile-select')?.value;
        
        // טעינת כל ההעדפות
        const allPreferences = await window.getAllUserPreferences(userId, profileId);
        
        // טעינת מידע על העדפות
        const preferencesData = [];
        for (const [name, value] of Object.entries(allPreferences)) {
            try {
                const info = await window.getPreferenceInfo(name);
                preferencesData.push({
                    name: name,
                    value: value,
                    info: info
                });
            } catch (error) {
                console.warn(`⚠️ Could not get info for preference ${name}:`, error);
                preferencesData.push({
                    name: name,
                    value: value,
                    info: { group: 'unknown', type: 'unknown' }
                });
            }
        }
        
        // הצגת הנתונים בטבלה
        window.displayAdminPreferences(preferencesData);
        
    } catch (error) {
        console.error('❌ Error loading preferences:', error);
        window.showAdminError('שגיאה בטעינת העדפות', error.message);
    }
};

/**
 * הצגת העדפות בטבלת הניהול
 */
window.displayAdminPreferences = function(preferencesData) {
    const tbody = document.getElementById('admin-preferences-tbody');
    if (!tbody) return;
    
    // סינון נתונים
    const filteredData = window.filterAdminPreferences(preferencesData);
    
    if (filteredData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    <i class="bi bi-search"></i> לא נמצאו העדפות
                </td>
            </tr>
        `;
        return;
    }
    
    // יצירת שורות הטבלה
    tbody.innerHTML = filteredData.map((pref, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>
                <strong>${pref.name}</strong>
                ${pref.info.description ? `<br><small class="text-muted">${pref.info.description}</small>` : ''}
            </td>
            <td>
                <span class="badge bg-secondary">${pref.info.group || 'unknown'}</span>
            </td>
            <td>
                <span class="badge bg-info">${pref.info.type || 'unknown'}</span>
            </td>
            <td>
                <code>${pref.value !== null ? pref.value : 'null'}</code>
            </td>
            <td>
                <code>${pref.info.default_value || 'none'}</code>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="window.editAdminPreference('${pref.name}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="window.resetAdminPreference('${pref.name}')">
                    <i class="bi bi-arrow-clockwise"></i>
                </button>
            </td>
        </tr>
    `).join('');
};

/**
 * סינון העדפות בממשק הניהול
 */
window.filterAdminPreferences = function(preferencesData) {
    const groupFilter = document.getElementById('admin-group-select')?.value;
    const searchFilter = document.getElementById('admin-search-input')?.value.toLowerCase();
    
    return preferencesData.filter(pref => {
        // סינון לפי קבוצה
        if (groupFilter && pref.info.group !== groupFilter) {
            return false;
        }
        
        // סינון לפי חיפוש
        if (searchFilter) {
            const searchText = `${pref.name} ${pref.info.description || ''}`.toLowerCase();
            if (!searchText.includes(searchFilter)) {
                return false;
            }
        }
        
        return true;
    });
};

/**
 * עדכון סטטיסטיקות בממשק הניהול
 */
window.updateAdminStats = function() {
    try {
        const tbody = document.getElementById('admin-preferences-tbody');
        if (!tbody) return;
        
        const rows = tbody.querySelectorAll('tr');
        const totalPreferences = rows.length;
        
        // ספירת העדפות שמורות (לא null)
        const savedPreferences = Array.from(rows).filter(row => {
            const valueCell = row.querySelector('td:nth-child(5) code');
            return valueCell && valueCell.textContent !== 'null';
        }).length;
        
        // עדכון הסטטיסטיקות
        const totalElement = document.getElementById('admin-total-preferences');
        const savedElement = document.getElementById('admin-saved-preferences');
        const groupsElement = document.getElementById('admin-total-groups');
        const profilesElement = document.getElementById('admin-total-profiles');
        
        if (totalElement) totalElement.textContent = totalPreferences;
        if (savedElement) savedElement.textContent = savedPreferences;
        if (groupsElement) groupsElement.textContent = '6'; // קבוצות ידועות
        if (profilesElement) profilesElement.textContent = '2'; // פרופילים ידועים
        
    } catch (error) {
        console.error('❌ Error updating admin stats:', error);
    }
};

/**
 * עריכת העדפה בממשק הניהול
 */
window.editAdminPreference = function(preferenceName) {
    console.log(`✏️ Editing preference: ${preferenceName}`);
    
    // יצירת מודל עריכה
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'editPreferenceModal';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">עריכת העדפה: ${preferenceName}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">ערך חדש:</label>
                        <input type="text" class="form-control" id="editPreferenceValue" placeholder="הכנס ערך חדש...">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                    <button type="button" class="btn btn-primary" onclick="window.saveEditedPreference('${preferenceName}')">שמור</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // הצגת המודל
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // טעינת הערך הנוכחי
    window.getPreference(preferenceName).then(value => {
        const valueInput = document.getElementById('editPreferenceValue');
        if (valueInput) {
            valueInput.value = value;
        }
    });
};

/**
 * שמירת העדפה שעודכנה
 */
window.saveEditedPreference = async function(preferenceName) {
    try {
        const newValue = document.getElementById('editPreferenceValue')?.value;
        if (newValue === undefined) {
            throw new Error('ערך לא תקין');
        }
        
        await window.savePreference(preferenceName, newValue);
        
        // סגירת המודל
        const modal = document.getElementById('editPreferenceModal');
        if (modal) {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
            modal.remove();
        }
        
        // רענון הנתונים
        await window.loadAdminPreferences();
        
        // הודעת הצלחה
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('נשמר', `העדפה ${preferenceName} נשמרה בהצלחה`);
        }
        
    } catch (error) {
        console.error('❌ Error saving edited preference:', error);
        window.showAdminError('שגיאה בשמירה', error.message);
    }
};

/**
 * איפוס העדפה לברירת מחדל
 */
window.resetAdminPreference = async function(preferenceName) {
    try {
        console.log(`🔄 Resetting preference: ${preferenceName}`);
        
        // קבלת ערך ברירת מחדל
        const info = await window.getPreferenceInfo(preferenceName);
        const defaultValue = info.default_value;
        
        if (defaultValue !== undefined) {
            await window.savePreference(preferenceName, defaultValue);
            
            // רענון הנתונים
            await window.loadAdminPreferences();
            
            // הודעת הצלחה
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('אופס', `העדפה ${preferenceName} אופסה לברירת מחדל`);
            }
        } else {
            throw new Error('לא נמצא ערך ברירת מחדל');
        }
        
    } catch (error) {
        console.error('❌ Error resetting preference:', error);
        window.showAdminError('שגיאה באיפוס', error.message);
    }
};

/**
 * רענון נתוני הניהול
 */
window.refreshAdminData = async function() {
    console.log('🔄 Refreshing admin data...');
    
    // מחיקת מטמון
    window.clearPreferencesCache();
    
    // טעינת נתונים מחדש
    await window.loadAdminData();
    
    // הודעת הצלחה
    if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('רענן', 'נתוני הניהול רועננו בהצלחה');
    }
};

/**
 * הצגת שגיאה בממשק הניהול
 */
window.showAdminError = function(title, message) {
    console.error(`❌ Admin Error: ${title} - ${message}`);
    
    if (typeof window.showError === 'function') {
        window.showError(title, message);
    } else {
        alert(`${title}: ${message}`);
    }
};

/**
 * הגדרת מאזינים לאירועים בממשק הניהול
 */
window.setupAdminEventListeners = function() {
    // מאזין לשינוי משתמש
    const userSelect = document.getElementById('admin-user-select');
    if (userSelect) {
        userSelect.addEventListener('change', async () => {
            await window.loadAdminProfiles();
            await window.loadAdminPreferences();
        });
    }
    
    // מאזין לשינוי פרופיל
    const profileSelect = document.getElementById('admin-profile-select');
    if (profileSelect) {
        profileSelect.addEventListener('change', async () => {
            await window.loadAdminPreferences();
        });
    }
    
    // מאזין לשינוי קבוצה
    const groupSelect = document.getElementById('admin-group-select');
    if (groupSelect) {
        groupSelect.addEventListener('change', () => {
            window.loadAdminPreferences();
        });
    }
    
    // מאזין לחיפוש
    const searchInput = document.getElementById('admin-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            window.loadAdminPreferences();
        });
    }
};

/**
 * הצגה/הסתרה של ממשק הניהול
 */
window.toggleAdminInterface = function() {
    const adminInterface = document.getElementById('preferences-admin-interface');
    if (adminInterface) {
        adminInterface.remove();
        console.log('✅ Admin interface removed');
    }
};

/**
 * הצגת ממשק הניהול
 */
window.showPreferencesAdmin = function() {
    window.createPreferencesAdminInterface();
};

// ===== AUTO-INITIALIZATION =====

// אתחול אוטומטי כשהדף נטען
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, preferences admin interface ready');
    
    // הוספת כפתור לממשק הניהול (אם לא קיים)
    setTimeout(() => {
        const existingButton = document.getElementById('show-admin-button');
        if (!existingButton) {
            const button = document.createElement('button');
            button.id = 'show-admin-button';
            button.className = 'btn btn-outline-secondary btn-sm';
            button.innerHTML = '<i class="bi bi-gear-fill"></i> ממשק ניהול';
            button.onclick = window.showPreferencesAdmin;
            
            // הוספת הכפתור לעמוד
            const header = document.querySelector('.page-header');
            if (header) {
                header.appendChild(button);
            }
        }
    }, 1000);
});

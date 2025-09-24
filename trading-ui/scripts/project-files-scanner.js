/**
 * Global Project Files Scanner
 * מנגנון גלובלי לסריקת ותיעוד קבצי הפרויקט
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @description Provides comprehensive file discovery and caching for the entire project
 */

// ========================================
// Global Project Files Scanner Class
// ========================================

class ProjectFilesScanner {
    constructor() {
        this.cache = {
            files: null,
            timestamp: null,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        };
        
        this.fileTypes = {
            js: { extensions: ['.js'], count: 0 },
            html: { extensions: ['.html', '.htm'], count: 0 },
            css: { extensions: ['.css'], count: 0 },
            python: { extensions: ['.py'], count: 0 },
            other: { extensions: ['.md', '.json', '.txt', '.yml', '.yaml', '.xml', '.sql', '.sh', '.bat'], count: 0 }
        };
        
        this.excludePatterns = [
            'node_modules',
            '.git',
            '__pycache__',
            '.pytest_cache',
            'venv',
            'env',
            '.env',
            'dist',
            'build',
            'coverage',
            '.coverage',
            'backup',
            'backups',
            'temp',
            'tmp',
            '.DS_Store',
            'Thumbs.db'
        ];
    }

    /**
     * Get all project files with caching
     * @param {Array} selectedTypes - Array of selected file types
     * @returns {Object} Object containing arrays of files by type
     */
    async getProjectFiles(selectedTypes = null) {
        // Check cache first (only if no specific types requested)
        if (this.isCacheValid() && !selectedTypes) {
            return this.cache.files;
        }

        // Discover files
        const discoveredFiles = await this.discoverAllFiles(selectedTypes);
        
        // Update cache
        this.cache.files = discoveredFiles;
        this.cache.timestamp = Date.now();
        
        // Save to localStorage and Unified IndexedDB
        await this.saveToLocalStorage();
        
        return discoveredFiles;
    }

    /**
     * Get files by specific type
     * @param {string} type - File type (js, html, css, python, other)
     * @returns {Array} Array of file paths
     */
    async getFilesByType(type) {
        const allFiles = await this.getProjectFiles();
        return allFiles[type] || [];
    }

    /**
     * Get total number of files
     * @returns {number} Total file count
     */
    async getTotalFileCount() {
        const allFiles = await this.getProjectFiles();
        return Object.values(allFiles).reduce((sum, files) => sum + files.length, 0);
    }

    /**
     * Get file statistics by type
     * @returns {Object} Statistics object
     */
    async getFileStatistics() {
        const allFiles = await this.getProjectFiles();
        const stats = {
            total: 0,
            js: 0,
            html: 0,
            css: 0,
            python: 0,
            other: 0
        };

        Object.keys(allFiles).forEach(type => {
            const count = allFiles[type] ? allFiles[type].length : 0;
            stats[type] = count;
            stats.total += count;
        });

        return stats;
    }

    /**
     * Clear project files cache
     */
    async clearCache() {
        this.cache.files = null;
        this.cache.timestamp = null;
        
        // Clear localStorage
        localStorage.removeItem('projectFiles');
        localStorage.removeItem('projectFilesTimestamp');
        
        // Clear from Unified IndexedDB directly (avoiding recursive call)
        try {
            if (window.UnifiedIndexedDB && typeof window.UnifiedIndexedDB.clearStore === 'function') {
                await window.UnifiedIndexedDB.clearStore('fileMappings');
            }
        } catch (error) {
            console.warn('Failed to clear file mapping from UnifiedIndexedDB:', error);
        }
        
        console.log('🗑️ Project files cache cleared');
    }

    /**
     * Check if cache is valid
     * @returns {boolean} True if cache is valid
     */
    isCacheValid() {
        if (!this.cache.files || !this.cache.timestamp) {
            return false;
        }
        
        const age = Date.now() - this.cache.timestamp;
        return age < this.cache.maxAge;
    }

    /**
     * Save cache to localStorage and Unified IndexedDB
     */
    async saveToLocalStorage() {
        try {
            // Save to localStorage for immediate access
            localStorage.setItem('projectFiles', JSON.stringify(this.cache.files));
            localStorage.setItem('projectFilesTimestamp', this.cache.timestamp.toString());
            
            // Save to Unified IndexedDB for persistent storage
            if (this.cache.files) {
                await this.saveFileMappingToIndexedDB(this.cache.files);
            }
        } catch (error) {
            console.warn('Failed to save project files cache:', error);
        }
    }

    /**
     * Load cache from localStorage
     */
    loadFromLocalStorage() {
        try {
            const cached = localStorage.getItem('projectFiles');
            const timestamp = localStorage.getItem('projectFilesTimestamp');
            
            if (cached && timestamp) {
                this.cache.files = JSON.parse(cached);
                this.cache.timestamp = parseInt(timestamp);
            }
        } catch (error) {
            console.warn('Failed to load project files cache:', error);
        }
    }

    /**
     * Discover all files in the project dynamically
     * @param {Array} selectedTypes - Array of selected file types
     * @returns {Object} Object containing arrays of files by type
     */
    async discoverAllFiles(selectedTypes = null) {
        const discoveredFiles = {
            js: [],
            html: [],
            css: [],
            python: [],
            other: []
        };

        try {
            // Try to get files from server API first
            // Attempting to get files from server API
            const serverFiles = await this.getFilesFromServer(selectedTypes);
            if (serverFiles && Object.keys(serverFiles).length > 0) {
                // Server file discovery successful, using dynamic files
                return serverFiles;
            }
        } catch (error) {
            // Log error silently - no local notifications
            
            // Show notification to user
            if (typeof window.showNotification === 'function') {
                window.showNotification('warning', '⚠️ השרת לא זמין');
            }
        }

        try {
            // Try local file discovery as second option
            const localFiles = await this.getFilesFromLocalAPI();
            if (localFiles && Object.keys(localFiles).length > 0) {
                return localFiles;
            }
        } catch (error) {
            // Log error silently - no local notifications
            
            // Show notification to user
            if (typeof window.showNotification === 'function') {
                window.showNotification('warning', '⚠️ גילוי קבצים מקומי נכשל');
            }
        }

        // No static fallback - show recovery confirmation dialog
        // Server not available - showing recovery confirmation
        
        // Show warning message and feedback in UI
        if (typeof window.showNotification === 'function') {
            window.showNotification('warning', '⚠️ המערכת לא יכולה לגלות קבצים כרגע');
        }
        
        // Show confirmation window via notification system
        return await this.showRecoveryConfirmation();
    }

    /**
     * Get files from server API
     * @param {Array} selectedTypes - Array of selected file types
     * @returns {Object} Object containing arrays of files by type
     */
    async getFilesFromServer(selectedTypes = null) {
        try {
            // Fetching files from server API
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 seconds timeout
            
            // Build query parameters for selected file types
            let url = '/api/file-scanner/files';
            if (selectedTypes && selectedTypes.length > 0) {
                const typesParam = selectedTypes.join(',');
                url += `?types=${encodeURIComponent(typesParam)}`;
                // Requesting specific file types
            } else {
                // Requesting all file types
            }
            
            // Make the actual API call
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            // Response status
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();
            // Server response data
            
            if (data.status === 'success' && data.data) {
                // Server file discovery successful
                return data.data;
            } else {
                console.error('❌ Server returned invalid response:', data);
                throw new Error('Server returned invalid response');
            }
        } catch (error) {
            // Log error silently - no local notifications
            return null;
        }
    }

    /**
     * Discover files using local file system API (if available)
     * @returns {Object} Object containing arrays of files by type
     */
    async getFilesFromLocalAPI() {
        try {
            // Try to use File System Access API if available
            if ('showDirectoryPicker' in window) {
                // This would require user interaction, so we'll skip for now
                return null;
            }
            
            // Try to use a local file discovery mechanism
            // This could be implemented with a local server or other method
            return null;
        } catch (error) {
            // Log error silently - no local notifications
            
            // Show notification to user
            if (typeof window.showNotification === 'function') {
                window.showNotification('warning', '⚠️ גילוי קבצים מקומי נכשל');
            }
            
            return null;
        }
    }

    /**
     * Show recovery confirmation dialog
     * @returns {Object} Object containing arrays of files by type
     */
    async showRecoveryConfirmation() {
        return new Promise((resolve) => {
            // Check if there's a saved mapping in IndexedDB first
            this.getLastFileMappingFromIndexedDB().then(lastMapping => {
                if (lastMapping && lastMapping.files) {
                    // Show confirmation dialog
                    const date = new Date(lastMapping.timestamp).toLocaleString('he-IL');
                    const message = `נמצא מיפוי קבצים שמור מ-${date}. האם לשחזר מיפוי זה?`;
                    
                    // Use global confirmation dialog
                    if (typeof window.showConfirmationDialog === 'function') {
                        window.showConfirmationDialog(
                            'שחזור מיפוי קבצים',
                            message,
                            () => {
                                // User chose Yes - restore from last saved scan
                                // User chose to restore from last saved scan
                                
                                if (typeof window.showNotification === 'function') {
                                    window.showNotification('success', `✅ שחזור מיפוי קבצים מהסריקה האחרונה (${date})`);
                                }
                                
                                resolve(lastMapping.files);
                            },
                            () => {
                                // User chose No - display page with relevant feedback
                                // User chose not to restore
                                
                                if (typeof window.showNotification === 'function') {
                                    window.showNotification('info', 'ℹ️ מיפוי קבצים לא שוחזר - המערכת מוכנה למיפוי חדש');
                                }
                                
                                resolve({
                                    js: [],
                                    html: [],
                                    css: [],
                                    python: [],
                                    other: []
                                });
                            },
                            'warning'
                        );
                    } else {
                        // Fallback to native confirm if global dialog not available
                        if (confirm(message)) {
                            // User chose Yes - restore from last saved scan
                            console.log('✅ User chose to restore from last saved scan');
                            
                            if (typeof window.showNotification === 'function') {
                                window.showNotification('success', `✅ שחזור מיפוי קבצים מהסריקה האחרונה (${date})`);
                            }
                            
                            resolve(lastMapping.files);
                        } else {
                            // User chose No - display page with relevant feedback
                            console.log('❌ User chose not to restore');
                            
                            if (typeof window.showNotification === 'function') {
                                window.showNotification('info', 'ℹ️ מיפוי קבצים לא שוחזר - המערכת מוכנה למיפוי חדש');
                            }
                            
                            resolve({
                                js: [],
                                html: [],
                                css: [],
                                python: [],
                                other: []
                            });
                        }
                    }
                } else {
                    // No saved data available
                    console.log('❌ No saved file mapping found');
                    
                    if (typeof window.showNotification === 'function') {
                        window.showNotification('warning', '⚠️ אין מיפוי קבצים שמור - בצע מיפוי ראשון');
                    }
                    
                    resolve({
                        js: [],
                        html: [],
                        css: [],
                        python: [],
                        other: []
                    });
                }
            }).catch(error => {
                // Recovery failed or no data available
                console.error('❌ Recovery check failed:', error);
                
                if (typeof window.showNotification === 'function') {
                    window.showNotification('error', '❌ לא ניתן לבדוק מיפוי שמור - בצע מיפוי חדש');
                }
                
                resolve({
                    js: [],
                    html: [],
                    css: [],
                    python: [],
                    other: []
                });
            });
        });
    }

    /**
     * Attempt IndexedDB recovery for file mapping
     * @returns {Object} Object containing arrays of files by type
     */
    async attemptIndexedDBRecovery() {
        try {
            console.log('🔄 Attempting IndexedDB recovery...');
            
            // Check if IndexedDB is available
            if (!('indexedDB' in window)) {
                throw new Error('IndexedDB not available');
            }
            
            // Try to get last saved file mapping from IndexedDB
            const lastMapping = await this.getLastFileMappingFromIndexedDB();
            
            if (lastMapping && lastMapping.files) {
                console.log('✅ IndexedDB recovery successful - found last file mapping');
                console.log('📅 Last mapping date:', lastMapping.timestamp);
                console.log('📊 Files recovered:', {
                    js: lastMapping.files.js?.length || 0,
                    html: lastMapping.files.html?.length || 0,
                    css: lastMapping.files.css?.length || 0,
                    python: lastMapping.files.python?.length || 0,
                    other: lastMapping.files.other?.length || 0
                });
                
                // Show recovery notification via global system
                if (typeof window.showNotification === 'function') {
                    const date = new Date(lastMapping.timestamp).toLocaleString('he-IL');
                    window.showNotification('success', `✅ שחזור מיפוי קבצים מהסריקה האחרונה (${date})`);
                }
                
                return lastMapping.files;
            } else {
                throw new Error('No saved file mapping found in IndexedDB');
            }
            
        } catch (error) {
            console.error('❌ IndexedDB recovery failed:', error);
            
            // Show error notification via global system
            if (typeof window.showNotification === 'function') {
                window.showNotification('warning', '⚠️ אין מיפוי קבצים שמור - בצע מיפוי ראשון');
            }
            
            
            // Return empty structure
            return {
                js: [],
                html: [],
                css: [],
                python: [],
                other: []
            };
        }
    }
    
    /**
     * Get last file mapping from Unified IndexedDB
     * @returns {Object} Last saved file mapping
     */
    async getLastFileMappingFromIndexedDB() {
        try {
            if (!window.UnifiedIndexedDB) {
                throw new Error('UnifiedIndexedDB not available');
            }
            
            const lastMapping = await window.UnifiedIndexedDB.getFileMapping();
            return lastMapping;
        } catch (error) {
            console.warn('Failed to get last mapping from UnifiedIndexedDB:', error);
            return null;
        }
    }

    /**
     * Save file mapping to Unified IndexedDB
     * @param {Object} files - File mapping data to save
     */
    async saveFileMappingToIndexedDB(files) {
        try {
            if (!window.UnifiedIndexedDB) {
                console.warn('UnifiedIndexedDB not available - cannot save file mapping');
                return;
            }

            const mappingData = {
                files: files,
                timestamp: Date.now(),
                version: '1.0.0'
            };

                await window.UnifiedIndexedDB.saveFileMapping(mappingData.files, 'project-files-scanner');
            console.log('✅ File mapping saved to UnifiedIndexedDB successfully');
        } catch (error) {
            console.error('❌ Failed to save file mapping to UnifiedIndexedDB:', error);
        }
    }
    
    


    /**
     * Check if file should be included
     * @param {string} filePath - File path to check
     * @returns {boolean} True if file should be included
     */
    isValidFile(filePath) {
        // Check if file is in exclude patterns
        for (const pattern of this.excludePatterns) {
            if (filePath.includes(pattern)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Get file extension
     * @param {string} filePath - File path
     * @returns {string} File extension
     */
    getFileExtension(filePath) {
        const lastDot = filePath.lastIndexOf('.');
        if (lastDot === -1) {
            return '';
        }
        return filePath.substring(lastDot);
    }

    /**
     * Get file type based on extension
     * @param {string} filePath - File path
     * @returns {string} File type
     */
    getFileType(filePath) {
        const extension = this.getFileExtension(filePath).toLowerCase();
        
        switch (extension) {
            case '.js': return 'js';
            case '.html':
            case '.htm': return 'html';
            case '.css': return 'css';
            case '.py': return 'python';
            default: return 'other';
        }
    }
}

// ========================================
// Global Instance and Export
// ========================================

// Create global instance
window.projectFilesScanner = new ProjectFilesScanner();

// Global convenience functions
window.getProjectFiles = () => window.projectFilesScanner.getProjectFiles();
window.getFilesByType = (type) => window.projectFilesScanner.getFilesByType(type);
window.getTotalFileCount = () => window.projectFilesScanner.getTotalFileCount();
window.getFileStatistics = () => window.projectFilesScanner.getFileStatistics();
window.clearProjectFilesCache = () => window.projectFilesScanner.clearCache();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectFilesScanner;
}

console.log('✅ Project Files Scanner loaded successfully');

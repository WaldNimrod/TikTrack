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
        
        // Save to localStorage
        this.saveToLocalStorage();
        
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
    clearCache() {
        this.cache.files = null;
        this.cache.timestamp = null;
        localStorage.removeItem('projectFiles');
        localStorage.removeItem('projectFilesTimestamp');
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
     * Save cache to localStorage
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('projectFiles', JSON.stringify(this.cache.files));
            localStorage.setItem('projectFilesTimestamp', this.cache.timestamp.toString());
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
            console.log('🔍 Attempting to get files from server API...');
            const serverFiles = await this.getFilesFromServer(selectedTypes);
            if (serverFiles && Object.keys(serverFiles).length > 0) {
                console.log('✅ Server file discovery successful, using dynamic files');
                return serverFiles;
            }
        } catch (error) {
            console.warn('❌ Failed to get files from server, trying local API:', error);
        }

        try {
            // Try local file discovery as second option
            const localFiles = await this.getFilesFromLocalAPI();
            if (localFiles && Object.keys(localFiles).length > 0) {
                return localFiles;
            }
        } catch (error) {
            console.warn('Failed to get files from local API, falling back to static list:', error);
        }

        // No static fallback - use IndexedDB recovery instead
        console.log('⚠️ Server not available - attempting IndexedDB recovery');
        return await this.attemptIndexedDBRecovery();
    }

    /**
     * Get files from server API
     * @param {Array} selectedTypes - Array of selected file types
     * @returns {Object} Object containing arrays of files by type
     */
    async getFilesFromServer(selectedTypes = null) {
        try {
            console.log('🔍 Fetching files from server API...');
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 seconds timeout
            
            // Build query parameters for selected file types
            let url = '/api/v1/files/discover';
            if (selectedTypes && selectedTypes.length > 0) {
                const typesParam = selectedTypes.join(',');
                url += `?types=${encodeURIComponent(typesParam)}`;
                console.log('🔍 Requesting specific file types:', selectedTypes);
            } else {
                console.log('🔍 Requesting all file types');
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            console.log('🔍 Response status:', response.status);
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();
            console.log('🔍 Server response data:', data);
            console.log('🔍 Data success:', data.success);
            console.log('🔍 Data files:', data.files);
            
            if (data.success && data.files) {
                console.log(`✅ Server file discovery successful: ${data.total_files} files found`);
                console.log('📊 File breakdown:', {
                    js: data.files.js?.length || 0,
                    html: data.files.html?.length || 0,
                    css: data.files.css?.length || 0,
                    python: data.files.python?.length || 0,
                    other: data.files.other?.length || 0
                });
                return data.files;
            } else {
                console.error('❌ Server returned invalid response:', data);
                throw new Error('Server returned invalid response');
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('❌ Server file discovery timed out after 35 seconds');
            } else {
                console.error('❌ Server file discovery failed:', error);
            }
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
            console.warn('Local file discovery failed:', error);
            return null;
        }
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
                
                // Show recovery notification
                this.showRecoveryNotification(lastMapping.timestamp);
                
                return lastMapping.files;
            } else {
                throw new Error('No saved file mapping found in IndexedDB');
            }
            
        } catch (error) {
            console.error('❌ IndexedDB recovery failed:', error);
            
            // Show error notification
            this.showRecoveryErrorNotification(error.message);
            
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
     * Get last file mapping from IndexedDB
     * @returns {Object} Last saved file mapping
     */
    async getLastFileMappingFromIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('TikTrackFileMapping', 1);
            
            request.onerror = () => {
                reject(new Error('Failed to open IndexedDB'));
            };
            
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['fileMappings'], 'readonly');
                const store = transaction.objectStore('fileMappings');
                const getRequest = store.get('lastMapping');
                
                getRequest.onsuccess = () => {
                    resolve(getRequest.result);
                };
                
                getRequest.onerror = () => {
                    reject(new Error('Failed to get last mapping from IndexedDB'));
                };
            };
            
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains('fileMappings')) {
                    db.createObjectStore('fileMappings');
                }
            };
        });
    }
    
    /**
     * Show recovery notification
     * @param {string} timestamp - Timestamp of recovered mapping
     */
    showRecoveryNotification(timestamp) {
        const date = new Date(timestamp).toLocaleString('he-IL');
        const message = `✅ שחזור מיפוי קבצים מהסריקה האחרונה (${date})`;
        
        // Show in notification system
        if (typeof window.showNotification === 'function') {
            window.showNotification('success', message);
        }
        
        // Show in console
        console.log('📢 ' + message);
    }
    
    /**
     * Show recovery error notification
     * @param {string} errorMessage - Error message
     */
    showRecoveryErrorNotification(errorMessage) {
        const message = `❌ לא ניתן לשחזר מיפוי קבצים: ${errorMessage}`;
        
        // Show in notification system
        if (typeof window.showNotification === 'function') {
            window.showNotification('error', message);
        }
        
        // Show in console
        console.error('📢 ' + message);
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

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectFilesScanner;
}

console.log('✅ Project Files Scanner loaded successfully');


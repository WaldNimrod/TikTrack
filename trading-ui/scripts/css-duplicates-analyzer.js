/**
 * CSS Duplicates Analyzer - סקריפט מעשי לניתוח כפילויות
 * משתמש ב-CSS Specificity Analyzer לניתוח אוטומטי
 */

class CSSDuplicatesAnalyzer {
    constructor() {
        this.analyzer = window.cssSpecificityAnalyzer;
        this.results = [];
    }

    /**
     * רשימת הכפילויות מהדוח האחרון
     */
    getDuplicatesList() {
        return [
            // כפילויות שנותרו לניתוח
            {
                selector: '.hero-stats',
                files: ['styles-new/05-objects/_grid.css', 'styles-new/07-trumps/index-hero-section.css']
            },
            {
                selector: '.dashboard-row',
                files: ['styles-new/05-objects/_layout.css', 'styles-new/06-components/_linter-realtime-monitor.css']
            },
            {
                selector: '.top-section',
                files: ['styles-new/05-objects/_layout.css', 'styles-new/07-trumps/index-hero-section.css']
            },
            {
                selector: '.filter-toggle-btn',
                files: ['styles-new/05-objects/_layout.css', 'styles-new/07-trumps/chart_management.css']
            },
            {
                selector: '.section-toggle-icon',
                files: ['styles-new/05-objects/_layout.css', 'styles-new/07-trumps/chart_management.css']
            },
            {
                selector: '.loading',
                files: ['styles-new/06-components/_bootstrap-overrides.css', 'styles-new/07-trumps/chart_management.css']
            },
            {
                selector: '.success-message',
                files: ['styles-new/06-components/_constraints.css', 'styles-new/07-trumps/chart_management.css']
            },
            {
                selector: '.w-25',
                files: ['styles-new/06-components/_forms-advanced.css', 'styles-new/09-utilities/_utilities.css']
            },
            {
                selector: '.logo-section',
                files: ['styles-new/06-components/_navigation.css', 'styles-new/header-styles.css']
            },
            {
                selector: '.logo-text',
                files: ['styles-new/06-components/_navigation.css', 'styles-new/header-styles.css']
            },
            {
                selector: '.header-actions',
                files: ['styles-new/06-components/_system-management.css', 'styles-new/07-trumps/chart_management.css']
            },
            {
                selector: '.filters-container',
                files: ['styles-new/06-components/_unified-log-display.css', 'styles-new/header-styles.css']
            },
            {
                selector: '.filter-group',
                files: ['styles-new/06-components/_unified-log-display.css', 'styles-new/header-styles.css']
            },
            {
                selector: '.filter-actions',
                files: ['styles-new/06-components/_unified-log-display.css', 'styles-new/header-styles.css']
            },
            {
                selector: '.info-summary',
                files: ['styles-new/06-components/_cards.css', 'styles-new/06-components/_info-summary.css', 'styles-new/06-components/_linter-realtime-monitor.css', 'styles-new/06-components/_system-management.css']
            },
            {
                selector: '.status-card',
                files: ['styles-new/06-components/_cards.css', 'styles-new/06-components/_linter-realtime-monitor.css', 'styles-new/06-components/_system-management.css']
            },
            {
                selector: '.status-text',
                files: ['styles-new/06-components/_chart-management.css', 'styles-new/06-components/_info-summary.css', 'styles-new/06-components/_server-monitor.css']
            },
            {
                selector: '.log-entry',
                files: ['styles-new/06-components/_info-summary.css', 'styles-new/06-components/_server-monitor.css', 'styles-new/06-components/_system-management.css']
            },
            {
                selector: '.table-responsive',
                files: ['styles-new/06-components/_background-tasks.css', 'styles-new/06-components/_tables.css']
            },
            {
                selector: '.type-cell',
                files: ['styles-new/06-components/_badges-status.css', 'styles-new/06-components/_unified-log-display.css']
            },
            {
                selector: '.type-investment',
                files: ['styles-new/06-components/_badges-status.css', 'styles-new/06-components/_entity-colors.css']
            },
            {
                selector: '.modal-dialog',
                files: ['styles-new/06-components/_bootstrap-overrides.css', 'styles-new/06-components/_modals.css']
            },
            {
                selector: '.modal-dialog.modal-lg',
                files: ['styles-new/06-components/_bootstrap-overrides.css', 'styles-new/06-components/_modals.css']
            },
            {
                selector: '.modal-content',
                files: ['styles-new/06-components/_bootstrap-overrides.css', 'styles-new/06-components/_modals.css']
            },
            {
                selector: '.modal-backdrop',
                files: ['styles-new/06-components/_bootstrap-overrides.css', 'styles-new/06-components/_modals.css']
            },
            {
                selector: '.toast',
                files: ['styles-new/06-components/_bootstrap-overrides.css', 'styles-new/06-components/_modals.css']
            },
            {
                selector: '.toast-container',
                files: ['styles-new/06-components/_bootstrap-overrides.css', 'styles-new/06-components/_modals.css']
            },
            {
                selector: '.modal.show',
                files: ['styles-new/06-components/_bootstrap-overrides.css', 'styles-new/06-components/_modals.css']
            },
            {
                selector: '.modal-backdrop.show',
                files: ['styles-new/06-components/_bootstrap-overrides.css', 'styles-new/06-components/_modals.css']
            },
            {
                selector: '#warningModal',
                files: ['styles-new/06-components/_bootstrap-overrides.css', 'styles-new/06-components/_modals.css']
            },
            {
                selector: '.checkbox-group',
                files: ['styles-new/06-components/_bootstrap-overrides.css', 'styles-new/06-components/_forms-advanced.css']
            },
            {
                selector: '.pagination-container',
                files: ['styles-new/06-components/_bootstrap-overrides.css', 'styles-new/06-components/_pagination-system.css']
            },
            {
                selector: '.pagination-info',
                files: ['styles-new/06-components/_bootstrap-overrides.css', 'styles-new/06-components/_pagination-system.css']
            },
            {
                selector: '.page-size-selector',
                files: ['styles-new/06-components/_bootstrap-overrides.css', 'styles-new/06-components/_pagination-system.css']
            },
            {
                selector: '.pagination-btn',
                files: ['styles-new/06-components/_bootstrap-overrides.css', 'styles-new/06-components/_pagination-system.css']
            },
            {
                selector: '.pagination-btn:disabled',
                files: ['styles-new/06-components/_bootstrap-overrides.css', 'styles-new/06-components/_pagination-system.css']
            },
            {
                selector: '.actions-row',
                files: ['styles-new/06-components/_buttons-advanced.css', 'styles-new/06-components/_linter-realtime-monitor.css']
            }
        ];
    }

    /**
     * קריאת תוכן קובץ CSS דרך API
     */
    async readCSSFileContent(filePath) {
        try {
            const response = await fetch(`/api/css/content?file=${encodeURIComponent(filePath)}`);
            const data = await response.json();
            
            if (data.success) {
                return data.content;
            } else {
                throw new Error(data.message || 'שגיאה בקריאת קובץ');
            }
        } catch (error) {
            console.error(`שגיאה בקריאת ${filePath}:`, error);
            return null;
        }
    }

    /**
     * ניתוח כפילות בודדת עם תוכן אמיתי
     */
    async analyzeSingleDuplicate(duplicate) {
        console.log(`\n🔍 מנתח: ${duplicate.selector}`);
        
        const analyses = [];
        
        for (const file of duplicate.files) {
            console.log(`  📁 קורא: ${file}`);
            
            const cssContent = await this.readCSSFileContent(file);
            if (!cssContent) {
                console.log(`    ❌ לא ניתן לקרוא את הקובץ`);
                continue;
            }

            // חיפוש ההגדרה
            const definition = this.findSelectorDefinition(cssContent, duplicate.selector);
            if (!definition) {
                console.log(`    ❌ הגדרה לא נמצאה`);
                continue;
            }

            // ניתוח איכות
            const analysis = this.analyzer.analyzeFileQuality(definition, file);
            const specificity = this.analyzer.calculateSpecificity(duplicate.selector);
            
            analyses.push({
                file,
                selector: duplicate.selector,
                definition,
                specificity,
                ...analysis
            });

            console.log(`    ✅ ציון איכות: ${analysis.qualityScore}`);
            console.log(`    📊 מאפיינים: ${analysis.depth}`);
        }

        if (analyses.length === 0) {
            console.log(`  ❌ לא נמצאו הגדרות תקינות`);
            return null;
        }

        // מציאת ההגדרה החזקה ביותר
        const strongest = analyses.reduce((prev, current) => {
            if (current.qualityScore > prev.qualityScore) return current;
            if (current.qualityScore === prev.qualityScore && current.specificity > prev.specificity) return current;
            return prev;
        }, analyses[0]);

        console.log(`  🏆 החזקה ביותר: ${strongest.file} (ציון: ${strongest.qualityScore})`);

        return {
            selector: duplicate.selector,
            strongest,
            allAnalyses: analyses,
            recommendation: {
                keep: strongest.file,
                remove: duplicate.files.filter(f => f !== strongest.file)
            }
        };
    }

    /**
     * חיפוש הגדרת סלקטור
     */
    findSelectorDefinition(cssContent, selector) {
        const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`(${escapedSelector}\\s*\\{[^}]*\\})`, 'g');
        const matches = cssContent.match(pattern);
        
        return matches && matches.length > 0 ? matches[0] : null;
    }

    /**
     * ניתוח כל הכפילויות
     */
    async analyzeAllDuplicates() {
        console.log('🚀 מתחיל ניתוח אוטומטי של כל הכפילויות...\n');
        
        const duplicates = this.getDuplicatesList();
        const results = [];
        
        for (let i = 0; i < duplicates.length; i++) {
            console.log(`\n📋 כפילות ${i + 1}/${duplicates.length}`);
            
            try {
                const result = await this.analyzeSingleDuplicate(duplicates[i]);
                if (result) {
                    results.push(result);
                }
                
                // הפסקה קצרה כדי לא להעמיס על השרת
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`❌ שגיאה בניתוח כפילות ${duplicates[i].selector}:`, error.message);
            }
        }

        console.log('\n🎯 סיכום ניתוח:');
        console.log(`✅ נותחו ${results.length} כפילויות`);
        
        this.results = results;
        return results;
    }

    /**
     * יצירת דוח HTML
     */
    generateHTMLReport() {
        if (!this.results || this.results.length === 0) {
            return '<p>אין תוצאות להצגה. הרץ קודם analyzeAllDuplicates()</p>';
        }

        return this.analyzer.generateHTMLReport(this.results);
    }

    /**
     * יצירת רשימת המלצות לפעולה
     */
    generateActionList() {
        if (!this.results || this.results.length === 0) {
            return [];
        }

        const actions = [];
        
        this.results.forEach(result => {
            result.recommendation.remove.forEach(fileToRemove => {
                actions.push({
                    action: 'remove',
                    file: fileToRemove,
                    selector: result.selector,
                    reason: `נשאיר ${result.strongest.file} (ציון: ${result.strongest.qualityScore})`,
                    keepFile: result.strongest.file
                });
            });
        });

        return actions;
    }

    /**
     * הדפסת רשימת פעולות מומלצות
     */
    printActionList() {
        const actions = this.generateActionList();
        
        console.log('\n📋 רשימת פעולות מומלצות:');
        console.log('=====================================');
        
        actions.forEach((action, index) => {
            console.log(`\n${index + 1}. הסר ${action.selector} מ-${action.file}`);
            console.log(`   סיבה: ${action.reason}`);
        });
        
        console.log(`\n📊 סה"כ ${actions.length} פעולות מומלצות`);
        
        return actions;
    }
}

// יצירת instance גלובלי
window.cssDuplicatesAnalyzer = new CSSDuplicatesAnalyzer();

console.log('🔧 CSS Duplicates Analyzer נטען בהצלחה!');
console.log('📖 שימוש:');
console.log('   const analyzer = window.cssDuplicatesAnalyzer;');
console.log('   const results = await analyzer.analyzeAllDuplicates();');
console.log('   analyzer.printActionList();');

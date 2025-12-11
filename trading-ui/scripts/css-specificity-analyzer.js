/**
 * CSS Specificity Analyzer
 * בודק אוטומטית איזו הגדרת CSS יותר חזקה ומשפיעה בפועל
 */


// ===== FUNCTION INDEX =====

// === CSS Analysis ===
// - CSSSpecificityAnalyzer.analyze() - Analyze
// - CSSSpecificityAnalyzer.calculateSpecificity() - Calculate Specificity
// - CSSSpecificityAnalyzer.compareRules() - Compare Rules

// === Utility ===
// - CSSSpecificityAnalyzer.formatResults() - Format Results

class CSSSpecificityAnalyzer {
    constructor() {
        this.duplicates = [];
        this.results = [];
    }

    /**
     * חישוב CSS Specificity
     * מחזיר מספר שמייצג את עוצמת הסלקטור
     */
    calculateSpecificity(selector) {
        // ניקוי הסלקטור
        const cleanSelector = selector.replace(/[\[\]]/g, '');
        
        let specificity = 0;
        let a = 0, b = 0, c = 0, d = 0;

        // ID selectors (#id)
        a = (cleanSelector.match(/#/g) || []).length;

        // Class selectors (.class), attribute selectors ([attr]), pseudo-classes (:hover)
        b = (cleanSelector.match(/\.|\[|:/g) || []).length;

        // Element selectors (div, span, etc.)
        c = (cleanSelector.match(/\b[a-zA-Z]/g) || []).length;

        // Universal selector (*)
        d = (cleanSelector.includes('*') ? 1 : 0);

        specificity = a * 1000 + b * 100 + c * 10 + d;
        return specificity;
    }

    /**
     * ניתוח עומק הגדרה - כמה מאפיינים יש
     */
    analyzeDefinitionDepth(cssContent) {
        const properties = cssContent.match(/[a-zA-Z-]+:\s*[^;]+;/g) || [];
        return properties.length;
    }

    /**
     * בדיקת states מיוחדים (:hover, :focus, :active)
     */
    hasSpecialStates(cssContent) {
        const states = /:(hover|focus|active|visited|link|first-child|last-child|nth-child)/g;
        return (cssContent.match(states) || []).length;
    }

    /**
     * בדיקת media queries
     */
    hasMediaQueries(cssContent) {
        return cssContent.includes('@media');
    }

    /**
     * בדיקת custom properties (CSS variables)
     */
    hasCustomProperties(cssContent) {
        return cssContent.includes('var(--') || cssContent.includes('--');
    }

    /**
     * ניתוח קובץ CSS - מחזיר ציון איכות
     */
    analyzeFileQuality(cssContent, filePath) {
        const depth = this.analyzeDefinitionDepth(cssContent);
        const states = this.hasSpecialStates(cssContent);
        const mediaQueries = this.hasMediaQueries(cssContent);
        const customProps = this.hasCustomProperties(cssContent);
        
        // חישוב ציון איכות
        let qualityScore = 0;
        qualityScore += depth * 2; // יותר מאפיינים = יותר איכות
        qualityScore += states * 10; // states מיוחדים = יותר איכות
        qualityScore += mediaQueries * 5; // רספונסיביות = יותר איכות
        qualityScore += customProps * 3; // משתני CSS = יותר איכות

        return {
            filePath,
            depth,
            states,
            mediaQueries,
            customProps,
            qualityScore
        };
    }

    /**
     * ניתוח כפילות - מוצא איזו הגדרה יותר חזקה
     */
    analyzeDuplicate(selector, files) {
        console.log(`\n🔍 מנתח כפילות: ${selector}`);
        console.log(`📁 קבצים: ${files.join(', ')}`);

        const analyses = [];

        for (const file of files) {
            try {
                // קריאת תוכן הקובץ
                const cssContent = this.readCSSFile(file);
                
                // חיפוש ההגדרה בקובץ
                const definition = this.findSelectorDefinition(cssContent, selector);
                
                if (definition) {
                    const analysis = this.analyzeFileQuality(definition, file);
                    const specificity = this.calculateSpecificity(selector);
                    
                    analyses.push({
                        file,
                        selector,
                        definition,
                        specificity,
                        ...analysis
                    });

                    console.log(`  ✅ ${file}:`);
                    console.log(`     📊 ציון איכות: ${analysis.qualityScore}`);
                    console.log(`     🎯 מאפיינים: ${analysis.depth}`);
                    console.log(`     🎨 States: ${analysis.states}`);
                    console.log(`     📱 Media Queries: ${analysis.mediaQueries ? 'כן' : 'לא'}`);
                    console.log(`     🔧 Custom Properties: ${analysis.customProps ? 'כן' : 'לא'}`);
                    console.log(`     ⚡ Specificity: ${specificity}`);
                } else {
                    console.log(`  ❌ ${file}: הגדרה לא נמצאה`);
                }
            } catch (error) {
                console.error(`  ❌ שגיאה בקובץ ${file}:`, error.message);
            }
        }

        // מציאת ההגדרה החזקה ביותר
        const strongest = analyses.reduce((prev, current) => {
            // עדיפות לציון איכות, אחר כך ל-specificity
            if (current.qualityScore > prev.qualityScore) return current;
            if (current.qualityScore === prev.qualityScore && current.specificity > prev.specificity) return current;
            return prev;
        }, analyses[0]);

        console.log(`\n🏆 ההגדרה החזקה ביותר: ${strongest.file}`);
        console.log(`   📊 ציון איכות: ${strongest.qualityScore}`);
        console.log(`   ⚡ Specificity: ${strongest.specificity}`);

        return {
            selector,
            strongest,
            allAnalyses: analyses,
            recommendation: {
                keep: strongest.file,
                remove: files.filter(f => f !== strongest.file)
            }
        };
    }

    /**
     * קריאת קובץ CSS
     */
    readCSSFile(filePath) {
        // זה יעבוד רק בדפדפן - נצטרך להעביר את התוכן מבחוץ
        throw new Error('readCSSFile צריך להיות מוחלף בפונקציה שמקבלת תוכן');
    }

    /**
     * חיפוש הגדרת סלקטור בקובץ
     */
    findSelectorDefinition(cssContent, selector) {
        // חיפוש ההגדרה המדויקת
        const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`(${escapedSelector}\\s*\\{[^}]*\\})`, 'g');
        const matches = cssContent.match(pattern);
        
        if (matches && matches.length > 0) {
            return matches[0];
        }
        return null;
    }

    /**
     * ניתוח רשימת כפילויות
     */
    async analyzeDuplicates(duplicatesList) {
        console.log('🚀 מתחיל ניתוח כפילויות CSS...\n');
        
        const results = [];
        
        for (let i = 0; i < duplicatesList.length; i++) {
            const duplicate = duplicatesList[i];
            console.log(`\n📋 כפילות ${i + 1}/${duplicatesList.length}`);
            
            try {
                const analysis = this.analyzeDuplicate(duplicate.selector, duplicate.files);
                results.push(analysis);
            } catch (error) {
                console.error(`❌ שגיאה בניתוח כפילות ${duplicate.selector}:`, error.message);
            }
        }

        console.log('\n🎯 סיכום ניתוח:');
        console.log(`✅ נותחו ${results.length} כפילויות`);
        
        return results;
    }

    /**
     * יצירת דוח HTML
     */
    generateHTMLReport(results) {
        let html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>דוח ניתוח כפילויות CSS</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .analysis-card { margin-bottom: 1rem; }
        .quality-score { font-size: 1.2em; font-weight: bold; }
        .recommendation { background: #f8f9fa; padding: 1rem; border-radius: 0.5rem; }
    </style>
</head>
<body>
    <div class="container mt-4">
        <h1 class="text-center mb-4">📊 דוח ניתוח כפילויות CSS</h1>
        <div class="alert alert-info">
            <strong>📈 סה"כ נותחו:</strong> ${results.length} כפילויות
        </div>
`;

        results.forEach((result, index) => {
            html += `
        <div class="card analysis-card">
            <div class="card-header">
                <h5 class="mb-0">${index + 1}. ${result.selector}</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <h6>📁 קבצים:</h6>
                        <ul class="list-group list-group-flush">
            `;
            
            result.allAnalyses.forEach(analysis => {
                const isStrongest = analysis.file === result.strongest.file;
                html += `
                            <li class="list-group-item ${isStrongest ? 'bg-success text-white' : ''}">
                                <strong>${analysis.file}</strong>
                                ${isStrongest ? ' 🏆' : ''}
                                <br>
                                <small>ציון: ${analysis.qualityScore} | מאפיינים: ${analysis.depth}</small>
                            </li>
                `;
            });
            
            html += `
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <div class="recommendation">
                            <h6>💡 המלצה:</h6>
                            <p><strong>שמור:</strong> ${result.strongest.file}</p>
                            <p><strong>מחק:</strong> ${result.recommendation.remove.join(', ')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            `;
        });

        html += `
    </div>
</body>
</html>
        `;

        return html;
    }
}

// יצירת instance גלובלי
window.cssSpecificityAnalyzer = new CSSSpecificityAnalyzer();

console.log('🔧 CSS Specificity Analyzer נטען בהצלחה!');
console.log('📖 שימוש:');
console.log('   const analyzer = window.cssSpecificityAnalyzer;');
console.log('   const results = await analyzer.analyzeDuplicates(duplicatesList);');

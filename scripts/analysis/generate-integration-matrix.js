#!/usr/bin/env node

/**
 * Generate Integration Matrix - TikTrack
 * ======================================
 * 
 * יצירת מטריצת אינטגרציה מכל הנתונים שנאספו
 * 
 * @version 1.0.0
 * @created November 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
    scanResultsFile: 'reports/integration-analysis/integration-scan-results.json',
    outputFile: 'documentation/02-ARCHITECTURE/FRONTEND/INTEGRATION_MATRIX.md',
    systemsListFile: 'documentation/frontend/GENERAL_SYSTEMS_LIST.md'
};

class IntegrationMatrixGenerator {
    constructor() {
        this.scanResults = null;
        this.systemsList = [];
        this.matrix = [];
    }

    /**
     * Load scan results
     */
    loadScanResults() {
        const resultsPath = path.join(process.cwd(), CONFIG.scanResultsFile);
        
        if (!fs.existsSync(resultsPath)) {
            console.warn('⚠️  Scan results not found, generating empty matrix');
            return {};
        }
        
        this.scanResults = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
        return this.scanResults;
    }

    /**
     * Load systems list
     */
    loadSystemsList() {
        const listPath = path.join(process.cwd(), CONFIG.systemsListFile);
        
        if (!fs.existsSync(listPath)) {
            return [];
        }
        
        const content = fs.readFileSync(listPath, 'utf8');
        
        // Extract system names from the markdown
        const systemPattern = /### \*\*([^*]+)\*\*/g;
        const systems = [];
        let match;
        
        while ((match = systemPattern.exec(content)) !== null) {
            const systemName = match[1].trim();
            if (systemName && !systemName.includes('חבילת') && !systemName.includes('מערכת')) {
                systems.push(systemName);
            }
        }
        
        this.systemsList = systems;
        return systems;
    }

    /**
     * Generate matrix
     */
    generateMatrix() {
        if (!this.scanResults || !this.scanResults.systems) {
            console.warn('⚠️  No scan results available, generating basic matrix');
            this.loadSystemsList();
            return this.generateBasicMatrix();
        }
        
        const systems = Object.keys(this.scanResults.systems);
        this.matrix = [];
        
        systems.forEach(systemName => {
            const systemData = this.scanResults.systems[systemName];
            const deps = systemData.dependencies;
            
            // Collect all dependencies
            const allDeps = [
                ...(deps.direct || []).map(d => d.target),
                ...(deps.indirect || []).map(d => d.target),
                ...(deps.optional || []).map(d => d.target),
                ...(deps.required || []).map(d => d.target)
            ];
            
            const uniqueDeps = [...new Set(allDeps)];
            
            // Find who uses this system
            const usedBy = [];
            systems.forEach(otherSystem => {
                if (otherSystem === systemName) return;
                const otherData = this.scanResults.systems[otherSystem];
                if (otherData) {
                    const otherDeps = [
                        ...(otherData.dependencies.direct || []).map(d => d.target),
                        ...(otherData.dependencies.indirect || []).map(d => d.target),
                        ...(otherData.dependencies.optional || []).map(d => d.target),
                        ...(otherData.dependencies.required || []).map(d => d.target)
                    ];
                    if (otherDeps.includes(systemName)) {
                        usedBy.push(otherSystem);
                    }
                }
            });
            
            // Determine integration type
            const integrationType = this.determineIntegrationType(deps);
            
            // Determine status
            const status = this.determineIntegrationStatus(systemName, deps, uniqueDeps);
            
            // Get initialization order
            const initOrder = this.scanResults.initializationOrder?.[systemData.file] || 'N/A';
            
            // Critical issues
            const criticalIssues = this.getCriticalIssues(systemName);
            
            this.matrix.push({
                systemName: systemName,
                file: systemData.file,
                dependsOn: uniqueDeps,
                usedBy: usedBy,
                integrationType: integrationType,
                status: status,
                initializationOrder: initOrder,
                criticalIssues: criticalIssues,
                totalDependencies: systemData.totalDependencies || 0
            });
        });
        
        return this.matrix;
    }

    /**
     * Determine integration type
     */
    determineIntegrationType(deps) {
        const types = [];
        
        if (deps.required && deps.required.length > 0) {
            types.push('Required');
        }
        if (deps.direct && deps.direct.length > 0) {
            types.push('Direct');
        }
        if (deps.optional && deps.optional.length > 0) {
            types.push('Optional');
        }
        if (deps.indirect && deps.indirect.length > 0) {
            types.push('Indirect');
        }
        
        return types.length > 0 ? types.join(', ') : 'None';
    }

    /**
     * Determine integration status
     */
    determineIntegrationStatus(systemName, deps, uniqueDeps) {
        // Check if dependencies are defined in known systems
        const unknownDeps = uniqueDeps.filter(dep => {
            // Check if it's in scan results
            return !this.scanResults.systems[dep];
        });
        
        if (unknownDeps.length > 0) {
            return 'Broken';
        }
        
        if (deps.required && deps.required.length > 0 && deps.optional && deps.optional.length === 0) {
            return 'Working';
        }
        
        if (deps.optional && deps.optional.length > 0 && deps.required && deps.required.length === 0) {
            return 'Working';
        }
        
        if (deps.required && deps.required.length > 0 && deps.optional && deps.optional.length > 0) {
            return 'Partial';
        }
        
        return uniqueDeps.length > 0 ? 'Working' : 'Unknown';
    }

    /**
     * Get critical issues for system
     */
    getCriticalIssues(systemName) {
        const issues = [];
        
        if (this.scanResults.integrationIssues) {
            const systemIssues = this.scanResults.integrationIssues.filter(i => 
                i.system === systemName && i.severity === 'error'
            );
            issues.push(...systemIssues.map(i => i.issue));
        }
        
        // Check for circular dependencies
        if (this.scanResults.circularDependencies) {
            this.scanResults.circularDependencies.forEach(cycle => {
                if (cycle.includes(systemName)) {
                    issues.push(`Circular dependency: ${cycle.join(' -> ')}`);
                }
            });
        }
        
        return issues;
    }

    /**
     * Generate basic matrix when no scan results
     */
    generateBasicMatrix() {
        this.loadSystemsList();
        
        return this.systemsList.map(systemName => ({
            systemName: systemName,
            file: 'N/A',
            dependsOn: [],
            usedBy: [],
            integrationType: 'Unknown',
            status: 'Unknown',
            initializationOrder: 'N/A',
            criticalIssues: [],
            totalDependencies: 0
        }));
    }

    /**
     * Generate markdown matrix
     */
    generateMarkdown() {
        let markdown = `# מטריצת אינטגרציה - TikTrack
## Integration Matrix

**תאריך יצירה:** ${new Date().toLocaleDateString('he-IL')}  
**גרסה:** 1.0.0  
**סטטוס:** מעודכן אוטומטית

---

## 📊 מטריצת אינטגרציה

מטריצה זו מציגה את כל האינטגרציות והתלויות בין המערכות הכלליות במערכת TikTrack.

### קטגוריות:

**סוגי אינטגרציה:**
- **Direct:** קריאה ישירה (window.Service.method())
- **Indirect:** דרך מערכת מתווכת
- **Optional:** עם fallback (window.X && window.X.method())
- **Required:** חובה - שגיאה אם חסר

**סטטוס אינטגרציה:**
- **Working:** אינטגרציה עובדת במלואה
- **Partial:** חלקי - עובד אבל לא אופטימלי
- **Broken:** שבור - שגיאות ידועות
- **Missing:** חסר - צריך ליצור
- **Unknown:** לא נבדק

---

## 📋 טבלת אינטגרציה

| מערכת | קובץ | תלויות (Depends On) | משתמשות בה (Used By) | סוג אינטגרציה | סטטוס | סדר אתחול | בעיות קריטיות | הערות |
|--------|------|---------------------|---------------------|----------------|--------|-----------|---------------|-------|
`;

        this.matrix.forEach(row => {
            const dependsOn = row.dependsOn.length > 0 
                ? row.dependsOn.join(', ') 
                : '-';
            const usedBy = row.usedBy.length > 0 
                ? row.usedBy.join(', ') 
                : '-';
            const issues = row.criticalIssues.length > 0 
                ? row.criticalIssues.join('; ') 
                : '-';
            
            markdown += `| ${row.systemName} | ${row.file} | ${dependsOn} | ${usedBy} | ${row.integrationType} | ${row.status} | ${row.initializationOrder} | ${issues} | - |\n`;
        });

        markdown += `
---

## 📊 סיכום סטטיסטיקות

### סיכום לפי סטטוס:
`;

        const statusCounts = {};
        this.matrix.forEach(row => {
            statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
        });

        Object.entries(statusCounts).forEach(([status, count]) => {
            markdown += `- **${status}:** ${count} מערכות\n`;
        });

        markdown += `
### סיכום לפי סוג אינטגרציה:
`;

        const typeCounts = {};
        this.matrix.forEach(row => {
            row.integrationType.split(', ').forEach(type => {
                typeCounts[type] = (typeCounts[type] || 0) + 1;
            });
        });

        Object.entries(typeCounts).forEach(([type, count]) => {
            markdown += `- **${type}:** ${count} מערכות\n`;
        });

        markdown += `
### מערכות עם הכי הרבה תלויות:
`;

        const topDependencies = [...this.matrix]
            .sort((a, b) => b.totalDependencies - a.totalDependencies)
            .slice(0, 10);

        topDependencies.forEach((row, index) => {
            markdown += `${index + 1}. **${row.systemName}:** ${row.totalDependencies} תלויות\n`;
        });

        markdown += `
---

## 🔍 בעיות שזוהו

`;

        const criticalIssues = this.matrix.filter(row => row.criticalIssues.length > 0);
        if (criticalIssues.length > 0) {
            criticalIssues.forEach(row => {
                markdown += `### ${row.systemName}\n`;
                row.criticalIssues.forEach(issue => {
                    markdown += `- ⚠️ ${issue}\n`;
                });
                markdown += `\n`;
            });
        } else {
            markdown += `✅ לא זוהו בעיות קריטיות\n`;
        }

        markdown += `
---

## 📝 הערות

- מטריצה זו נוצרת אוטומטית מניתוח הקוד
- לפרטים נוספים ראה: SYSTEM_INTEGRATION_ANALYSIS_REPORT.md
- עדכון אחרון: ${new Date().toLocaleString('he-IL')}
`;

        return markdown;
    }

    /**
     * Save matrix
     */
    saveMatrix() {
        const outputPath = path.join(process.cwd(), CONFIG.outputFile);
        const outputDir = path.dirname(outputPath);
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const markdown = this.generateMarkdown();
        fs.writeFileSync(outputPath, markdown);
        
        console.log(`💾 Integration matrix saved to: ${outputPath}`);
        return outputPath;
    }
}

// Main execution
if (require.main === module) {
    const generator = new IntegrationMatrixGenerator();
    
    generator.loadScanResults();
    generator.generateMatrix();
    generator.saveMatrix();
    
    console.log('\n✅ Integration matrix generated!');
    console.log(`📊 Matrix contains ${generator.matrix.length} systems`);
}

module.exports = IntegrationMatrixGenerator;



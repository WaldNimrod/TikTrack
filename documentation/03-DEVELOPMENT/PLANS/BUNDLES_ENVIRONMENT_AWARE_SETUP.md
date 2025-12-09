# תוכנית קביעת Bundles לפי סביבה

## Environment-Aware Bundles Setup Plan

**תאריך:** 6 בדצמבר 2025  
**גרסה:** 1.0.0  
**סטטוס:** 📋 תוכנית

---

## 🎯 מטרה

לקבע את מערכת ה-bundles כך שהיא:

- ✅ **Development** (`TikTrackApp`) - **ללא bundles** (scripts בודדים)
- ✅ **Production** (`TikTrackApp-Production`) - **עם bundles** (ברירת מחדל)
- ✅ זיהוי אוטומטי של סביבה לפי שם תיקייה
- ✅ אפשרות override ידנית עם flags

---

## 📋 משימות נדרשות

### 1. זיהוי סביבה אוטומטי ב-`generate-script-loading-code.js`

#### 1.1 הוספת פונקציית זיהוי סביבה

**קובץ:** `trading-ui/scripts/generate-script-loading-code.js`

**קוד נדרש:**

```javascript
/**
 * Detect environment from workspace directory name
 * - TikTrackApp-Production → production
 * - TikTrackApp → development
 */
function detectEnvironment() {
  const cwd = process.cwd();
  const workspaceName = path.basename(cwd);
  
  // Check for Production in directory name (case-insensitive)
  if (workspaceName.includes('Production') || workspaceName.includes('production')) {
    return 'production';
  } else if (workspaceName === 'TikTrackApp') {
    return 'development';
  } else {
    // Default to development if uncertain (safer default)
    console.warn(`⚠️ Could not determine environment from directory: ${workspaceName}`);
    console.warn('Defaulting to development. Use --mode flag to override.');
    return 'development';
  }
}
```

#### 1.2 עדכון ברירת מחדל

**שינוי נדרש:**

```javascript
// לפני:
function generateScriptLoadingCode(pageName, mode = 'development', useBundles = false)

// אחרי:
function generateScriptLoadingCode(pageName, mode = null, useBundles = null) {
  // Auto-detect environment if not provided
  if (!mode) {
    mode = detectEnvironment();
  }
  
  // Auto-set useBundles based on environment
  if (useBundles === null) {
    useBundles = (mode === 'production');
  }
  
  // ... rest of function
}
```

#### 1.3 עדכון Command Line Arguments

**שינוי נדרש:**

```javascript
// לפני:
const mode = modeArg ? modeArg.split('=')[1] : 'development';
const useBundles = useBundlesArg !== undefined || process.env.USE_BUNDLES === 'true';

// אחרי:
let mode = modeArg ? modeArg.split('=')[1] : null;
let useBundles = useBundlesArg !== undefined ? true : 
                 (useBundlesArg === '--no-bundles' ? false : null);

// Auto-detect if not provided
if (!mode) {
  mode = detectEnvironment();
}
if (useBundles === null) {
  useBundles = (mode === 'production');
}
```

**פעולות:**

- [ ] הוספת `detectEnvironment()` function
- [ ] עדכון `generateScriptLoadingCode()` ל-auto-detect
- [ ] עדכון command line arguments parsing
- [ ] הוספת `--no-bundles` flag ל-override

---

### 2. עדכון תעוד

#### 2.1 עדכון Bundling System Guide

**קובץ:** `documentation/03-DEVELOPMENT/GUIDES/BUNDLING_SYSTEM_GUIDE.md`

**עדכונים נדרשים:**

- [ ] הוספת סעיף "Environment Detection"
- [ ] הסבר על Development vs Production
- [ ] דוגמאות לשימוש

#### 2.2 עדכון Initialization System Documentation

**קובץ:** `documentation/02-ARCHITECTURE/FRONTEND/UNIFIED_INITIALIZATION_SYSTEM.md`

**עדכונים נדרשים:**

- [ ] עדכון סעיף "Bundling System" - environment-aware
- [ ] הסבר על זיהוי אוטומטי

---

### 3. Validation & Checks

#### 3.1 Environment Validation

**יצירת סקריפט:** `scripts/build/validate-environment-bundles.js`

**תפקיד:**

- בדיקה שכל העמודים ב-production משתמשים ב-bundles
- בדיקה שכל העמודים ב-development לא משתמשים ב-bundles
- דוח על חוסר התאמה

**פעולות:**

- [ ] יצירת `scripts/build/validate-environment-bundles.js`
- [ ] הוספת checks לכל עמודים
- [ ] הוספת error reporting

---

### 4. Build Scripts

#### 4.1 עדכון package.json

**הוספת scripts:**

```json
{
  "scripts": {
    "build:bundles": "node scripts/build/bundle-packages.js",
    "build:validate": "node scripts/build/validate-environment-bundles.js",
    "build:production": "npm run build:bundles && npm run build:validate"
  }
}
```

**פעולות:**

- [ ] הוספת `build:validate` script
- [ ] הוספת `build:production` script

---

## 📊 לוגיקה

### Development Environment (`TikTrackApp`)

- **Mode:** `development`
- **Use Bundles:** `false` (ברירת מחדל)
- **Scripts:** בודדים (ללא bundles)
- **סיבה:** קל יותר ל-debug, hot reload, ופיתוח

### Production Environment (`TikTrackApp-Production`)

- **Mode:** `production`
- **Use Bundles:** `true` (ברירת מחדל)
- **Scripts:** bundles (מיניפיקציה ואופטימיזציה)
- **סיבה:** ביצועים טובים יותר, פחות בקשות רשת

### Override Options

- `--mode=development` - Force development mode
- `--mode=production` - Force production mode
- `--use-bundles` - Force use bundles
- `--no-bundles` - Force no bundles

---

## ✅ קריטריונים להצלחה

- ✅ `generate-script-loading-code.js` מזהה סביבה אוטומטית
- ✅ Development environment - ללא bundles (ברירת מחדל)
- ✅ Production environment - עם bundles (ברירת מחדל)
- ✅ אפשרות override עם flags
- ✅ כל התעוד מעודכן
- ✅ Validation checks מונעים חוסר התאמה

---

## 📝 דוגמאות שימוש

### Development (אוטומטי)

```bash
# בתיקייה: TikTrackApp
node trading-ui/scripts/generate-script-loading-code.js index
# תוצאה: Mode: development | Use Bundles: false
```

### Production (אוטומטי)

```bash
# בתיקייה: TikTrackApp-Production
node trading-ui/scripts/generate-script-loading-code.js index
# תוצאה: Mode: production | Use Bundles: true
```

### Override

```bash
# Force production mode
node trading-ui/scripts/generate-script-loading-code.js index --mode=production

# Force no bundles
node trading-ui/scripts/generate-script-loading-code.js index --no-bundles
```

---

## 🎯 תוצאה סופית

לאחר השלמת כל המשימות:

1. ✅ Development environment - ללא bundles (אוטומטי)
2. ✅ Production environment - עם bundles (אוטומטי)
3. ✅ זיהוי אוטומטי לפי שם תיקייה
4. ✅ אפשרות override עם flags
5. ✅ Validation מונע חוסר התאמה
6. ✅ תעוד מלא ומעודכן

---

**תאריך יצירה:** 6 בדצמבר 2025  
**סטטוס:** 📋 תוכנית - מוכן לביצוע



# מדריך מפתחים - Package Manifest כ-Source of Truth (SOT)

**תאריך יצירה:** 1 בינואר 2026
**גרסה:** 1.0.0
**סטטוס:** ✅ פעיל ומתועד
**מיקום:** `trading-ui/scripts/init-system/package-manifest.js`

---

## 📋 תוכן עניינים

1. [מה זה Package Manifest?](#מה-זה-package-manifest)
2. [מדוע הוא SOT?](#מדוע-הוא-sot)
3. [מבנה המניפסט](#מבנה-המניפסט)
4. [שימוש יומי](#שימוש-יומי)
5. [עדכון מניפסט](#עדכון-מניפסט)
6. [אימות ובדיקות](#אימות-ובדיקות)
7. [פתרון בעיות](#פתרון-בעיות)

---

## 🎯 מה זה Package Manifest

### הגדרה

Package Manifest הוא קובץ JavaScript מרכזי המגדיר את כל החבילות (packages), התלויות, וסדר הטעינה של מערכת TikTrack. הוא משמש כ-Source of Truth (SOT) יחיד לכל המידע על טעינת סקריפטים.

### מיקום וחשיבות

**מיקום:** `trading-ui/scripts/init-system/package-manifest.js`
**גודל:** 2,502 שורות
**חשיבות:** כל שינוי בטעינת סקריפטים חייב לעבור דרך המניפסט

---

## 🔍 מדוע הוא SOT

### עקרון יחידות האמת

המניפסט הוא **המקור היחיד והאמין** למידע על:

- **חבילות קיימות** - רשימת כל החבילות במערכת
- **תלויות** - אילו חבילות תלויות באילו
- **סדר טעינה** - באיזה סדר לטעון כל חבילה
- **אסטרטגיות טעינה** - defer/async/sync לכל חבילה
- **בריאות מערכת** - מצב כל חבילה ותלויותיה

### יתרונות

- **מניעת חוסר עקביות** - כל המידע במקום אחד
- **אוטומציה** - כלי בדיקה יכולים לקרוא מהמניפסט
- **תחזוקה קלה** - שינוי במקום אחד משפיע על הכל
- **בטיחות** - מניעת טעינה של סקריפטים לא מורשים

---

## 🏗️ מבנה המניפסט

### מבנה כללי

```javascript
const PACKAGE_MANIFEST = {
  "package-id": {
    id: "package-id",
    name: "Package Display Name",
    description: "Package description",
    version: "1.0.0",
    critical: true/false,
    loadOrder: 1.0,
    dependencies: ["dependency-package-id"],
    loadingStrategy: "defer",
    scripts: [
      {
        file: "path/to/script.js",
        globalCheck: "window.GlobalName",
        description: "Script description",
        required: true,
        loadOrder: 1,
        loadingStrategy: "defer"
      }
    ]
  }
};
```

### שדות חובה

- **id:** מזהה יחודי (אותיות קטנות, מקפים)
- **name:** שם תצוגה בעברית
- **description:** תיאור מפורט
- **version:** גרסה סמנטית
- **critical:** האם חבילה קריטית למערכת
- **loadOrder:** סדר טעינה (מספר עשרוני)
- **dependencies:** מערך של package IDs
- **loadingStrategy:** "defer" / "async" / "sync"
- **scripts:** מערך של אובייקטי סקריפט

### שדות סקריפט

- **file:** נתיב לקובץ (יחסית ל-trading-ui/scripts/)
- **globalCheck:** ביטוי לבדיקת זמינות (window.GlobalName)
- **description:** תיאור הסקריפט
- **required:** האם סקריפט חובה
- **loadOrder:** סדר בתוך החבילה
- **loadingStrategy:** אסטרטגיית טעינה ספציפית

---

## 📊 שימוש יומי

### קריאת מידע על חבילה

```javascript
// קבל חבילה לפי ID
const authPackage = PACKAGE_MANIFEST.auth;

// בדוק תלויות
const dependencies = authPackage.dependencies; // ["core-systems"]

// קבל סקריפטים
const scripts = authPackage.scripts;
```

### בדיקת זמינות

```javascript
function isPackageAvailable(packageId) {
  const pkg = PACKAGE_MANIFEST[packageId];
  if (!pkg) return false;

  // בדוק שכל התלויות זמינות
  for (const depId of pkg.dependencies) {
    if (!isPackageAvailable(depId)) return false;
  }

  // בדוק שכל הסקריפטים טעונים
  for (const script of pkg.scripts) {
    if (script.required && !eval(script.globalCheck)) {
      return false;
    }
  }

  return true;
}
```

### חיפוש חבילה

```javascript
function findPackageByGlobal(globalName) {
  for (const [packageId, pkg] of Object.entries(PACKAGE_MANIFEST)) {
    for (const script of pkg.scripts) {
      if (script.globalCheck.includes(globalName)) {
        return { packageId, package: pkg, script };
      }
    }
  }
  return null;
}
```

---

## 🔧 עדכון מניפסט

### הוספת חבילה חדשה

```javascript
// 1. הוסף למניפסט
PACKAGE_MANIFEST["new-package"] = {
  id: "new-package",
  name: "חבילה חדשה",
  description: "תיאור החבילה החדשה",
  version: "1.0.0",
  critical: false,
  loadOrder: 5.0,
  dependencies: ["core-systems"],
  loadingStrategy: "defer",
  scripts: [
    {
      file: "new-package/main.js",
      globalCheck: "window.NewPackage",
      description: "סקריפט ראשי",
      required: true,
      loadOrder: 1
    }
  ]
};

// 2. עדכן סדר טעינה אם נדרש
// 3. הוסף תלויות אם נדרש
```

### הוספת סקריפט לחבילה קיימת

```javascript
const package = PACKAGE_MANIFEST["existing-package"];
package.scripts.push({
  file: "existing-package/new-script.js",
  globalCheck: "window.NewGlobal",
  description: "סקריפט חדש",
  required: false,
  loadOrder: package.scripts.length + 1
});
```

### שינוי סדר טעינה

```javascript
// שנה loadOrder כדי לשנות סדר טעינה
PACKAGE_MANIFEST["package-a"].loadOrder = 1.0; // טען ראשון
PACKAGE_MANIFEST["package-b"].loadOrder = 2.0; // טען שני

// זכור: loadOrder הוא מספר עשרוני
// 1.0, 1.1, 1.2, 2.0, 2.1, etc.
```

---

## ✅ אימות ובדיקות

### כלי בדיקה זמינים

```bash
# בדיקת תלויות
node scripts/audit/validate-package-dependencies.js

# בדיקת סדר טעינה
node scripts/audit/validate-all-pages-load-order.js

# אימות מניפסט
node scripts/audit/validate-head-template.js
```

### בדיקות ידניות

```javascript
// בדוק שכל החבילות מוגדרות
console.log('Total packages:', Object.keys(PACKAGE_MANIFEST).length);

// בדוק תלויות מעגליות
function checkCircularDependencies() {
  // implementation...
}

// בדוק שכל הקבצים קיימים
function validateFilePaths() {
  for (const pkg of Object.values(PACKAGE_MANIFEST)) {
    for (const script of pkg.scripts) {
      const fullPath = `trading-ui/scripts/${script.file}`;
      // check if file exists
    }
  }
}
```

---

## 🔧 פתרון בעיות

### בעיית "חבילה לא נטענת"

**סימפטומים:**

- שגיאות ReferenceError
- פונקציות לא זמינות
- מערכות לא מתחילות

**פתרון:**

1. בדוק שחבילה מוגדרת במניפסט
2. ודא שכל התלויות קיימות
3. בדוק סדר טעינה (loadOrder)
4. אמת שקבצים קיימים

### בעיית "תלויות מעגליות"

**סימפטומים:**

- אתחול לא מסתיים
- שגיאות טעינה
- מערכת תקועה

**פתרון:**

1. הרץ validate-package-dependencies.js
2. הסר תלויות מעגליות
3. שנה סדר טעינה אם נדרש

### בעיית "סקריפט לא נטען"

**סימפטומים:**

- Global לא זמין
- פונקציות חסרות
- מערכת לא שלמה

**פתרון:**

1. בדוק נתיב קובץ
2. ודא globalCheck נכון
3. בדוק אסטרטגיית טעינה
4. אמת שסקריפט קיים

---

## 📚 תיעוד נוסף

- [UNIFIED_INITIALIZATION_SYSTEM.md](UNIFIED_INITIALIZATION_SYSTEM.md)
- [UNIFIED_INITIALIZATION_SYSTEM_API.md](UNIFIED_INITIALIZATION_SYSTEM_API.md)
- [INIT_LOADING_MONITORING_SYSTEM_GUIDE.md](../../03-DEVELOPMENT/TOOLS/INIT_LOADING_MONITORING_SYSTEM_GUIDE.md)
- [PACKAGE_LOAD_ORDER_AUDIT_TOOLS_GUIDE.md](../../03-DEVELOPMENT/TOOLS/PACKAGE_LOAD_ORDER_AUDIT_TOOLS_GUIDE.md)

---

**Team F - Package Manifest SOT Maintenance**

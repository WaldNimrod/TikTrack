# עדכון - זיהוי סקריפטים נוספים וחדשים

**תאריך:** ${new Date().toLocaleDateString('he-IL')} ${new Date().toLocaleTimeString('he-IL')}

## ✅ סיכום

כלי Init System Check שופר כדי לזהות ולתריע על שני סוגי בעיות חדשות:

1. **סקריפטים נוספים בעמוד** - סקריפטים שקיימים בחבילות אבל לא מוגדרים ב-PAGE_CONFIGS של העמוד
2. **סקריפטים חדשים/לא מתועדים** - סקריפטים שלא קיימים באף חבילה ב-PACKAGE_MANIFEST

---

## 🔍 שיפורים שבוצעו

### 1. זיהוי סקריפטים נוספים בעמוד

**מה נבדק:**
- סקריפט שנטען בפועל בעמוד
- הסקריפט קיים ב-PACKAGE_MANIFEST (בחבילה כלשהי)
- הסקריפט **לא** מוגדר ב-PAGE_CONFIGS של העמוד הנוכחי

**דוגמה:**
```
סקריפט: "services/account-balance-service.js"
קיים בחבילה: "entity-services"
לא מוגדר בעמוד: "trades"
```

**הודעת התראה:**
```
⚠️ סקריפט נוסף בעמוד: services/account-balance-service.js
   - קיים בחבילות אבל לא מוגדר ב-PAGE_CONFIGS
   - מוגדר בחבילות: entity-services
```

### 2. זיהוי סקריפטים חדשים/לא מתועדים

**מה נבדק:**
- סקריפט שנטען בפועל בעמוד
- הסקריפט **לא** קיים ב-PACKAGE_MANIFEST (באף חבילה)
- הסקריפט **לא** מוגדר ב-PAGE_CONFIGS של העמוד

**דוגמה:**
```
סקריפט: "my-new-script.js"
לא קיים באף חבילה
נטען ישירות ב-HTML
```

**הודעת שגיאה:**
```
❌ סקריפט חדש/לא מתועד: my-new-script.js
   - לא קיים באף חבילה ב-PACKAGE_MANIFEST ולא מוגדר בעמוד
   - ⚠️ יש להוסיף לחבילה מתאימה ב-PACKAGE_MANIFEST או להסיר מהעמוד
```

---

## 📊 תצוגת התוצאות

התוצאות מוצגות בשתי קטגוריות נפרדות:

### קטגוריה 1: סקריפטים נוספים בעמוד
- **סוג:** `extra_script_in_page`
- **חומרה:** `warning`
- **תצוגה:** `alert alert-warning`
- **מידע נוסף:** רשימת החבילות שהסקריפט קיים בהן

### קטגוריה 2: סקריפטים חדשים/לא מתועדים
- **סוג:** `new_untracked_script`
- **חומרה:** `error`
- **תצוגה:** `alert alert-danger`
- **מידע נוסף:** המלצה להוסיף לחבילה או להסיר מהעמוד

---

## 🛠️ שינויים טכניים

### קובץ: `monitoring-functions.js`

**שינויים:**

1. **יצירת מפת סקריפטים לחבילות:**
   ```javascript
   const scriptToPackageMap = {}; // Map script file to package IDs
   ```

2. **איסוף כל הסקריפטים מ-PACKAGE_MANIFEST:**
   ```javascript
   const allManifestScripts = [];
   // איסוף מכל החבילות
   ```

3. **בדיקה כפולה:**
   - בדיקה אם הסקריפט קיים ב-PACKAGE_MANIFEST
   - בדיקה אם הסקריפט מוגדר ב-PAGE_CONFIGS

4. **הגדרת רשימת סקריפטים מורשים (system scripts):**
   ```javascript
   const allowedSystemScripts = [
       'bootstrap', 'font-awesome', 'jquery',
       'init-system', 'monitoring-functions', ...
   ];
   ```

### קובץ: `init-system-check.js`

**שינויים:**

1. **חישוב ספירת בעיות כוללת:**
   ```javascript
   const totalIssues = results.criticalErrors + 
                      results.mismatches + 
                      loadOrderIssues.length +
                      extraScriptsInPage.length +    // חדש
                      newUntrackedScripts.length;     // חדש
   ```

2. **הפרדת בעיות לפי קטגוריות:**
   - סקריפטים חסרים
   - סקריפטים נוספים בעמוד ← חדש
   - סקריפטים חדשים/לא מתועדים ← חדש
   - כפילויות
   - בעיות אחרות

3. **תצוגה מובחנת:**
   - סקריפטים נוספים: אזהרה (`alert-warning`)
   - סקריפטים חדשים: שגיאה (`alert-danger`)
   - מידע נוסף: רשימת חבילות, המלצות

---

## 🎯 דוגמאות שימוש

### תרחיש 1: סקריפט נוסף בעמוד

**מצב:**
- עמוד `trades` טוען את החבילה `base`
- בעמוד יש גם `<script src="scripts/services/account-balance-service.js">`
- הסקריפט קיים בחבילה `entity-services`
- החבילה `entity-services` **לא** מוגדרת ב-PAGE_CONFIGS של `trades`

**תוצאה:**
```
⚠️ סקריפט נוסף בעמוד: services/account-balance-service.js
   - קיים בחבילות אבל לא מוגדר ב-PAGE_CONFIGS
   - מוגדר בחבילות: entity-services
```

### תרחיש 2: סקריפט חדש

**מצב:**
- עמוד טוען `<script src="scripts/my-custom-script.js">`
- הסקריפט לא קיים באף חבילה ב-PACKAGE_MANIFEST
- הסקריפט לא מוגדר ב-PAGE_CONFIGS

**תוצאה:**
```
❌ סקריפט חדש/לא מתועד: my-custom-script.js
   - לא קיים באף חבילה ב-PACKAGE_MANIFEST ולא מוגדר בעמוד
   - ⚠️ יש להוסיף לחבילה מתאימה ב-PACKAGE_MANIFEST או להסיר מהעמוד
```

---

## ✅ בדיקות

### בדיקות שבוצעו:

1. ✅ זיהוי סקריפטים נוספים בעמוד
2. ✅ זיהוי סקריפטים חדשים/לא מתועדים
3. ✅ הצגת מידע נכון (חבילות, המלצות)
4. ✅ מניעת כפילויות בהודעות
5. ✅ ספירה נכונה של בעיות כוללת
6. ✅ תצוגה מסודרת עם קטגוריות נפרדות

---

## 📝 הערות חשובות

### סקריפטים מורשים (לא מדווחים):

1. **סקריפטים ספציפיים לעמוד:**
   - `${pageName}.js` - מותר לכל עמוד

2. **סקריפטים מערכתיים:**
   - `bootstrap`, `font-awesome`, `jquery`
   - `init-system`, `monitoring-functions`, `init-system-check`
   - `package-manifest`, `page-initialization-configs`, `unified-app-initializer`

### פעולות מומלצות:

**לסקריפטים נוספים:**
- להוסיף את החבילה ל-PAGE_CONFIGS של העמוד, או
- להסיר את הסקריפט מהעמוד אם הוא לא נדרש

**לסקריפטים חדשים:**
- להוסיף את הסקריפט לחבילה מתאימה ב-PACKAGE_MANIFEST, או
- להסיר את הסקריפט מהעמוד אם הוא לא נדרש, או
- להגדיר כסקריפט ספציפי לעמוד (אם באמת ספציפי)

---

**נוצר:** ${new Date().toISOString()}



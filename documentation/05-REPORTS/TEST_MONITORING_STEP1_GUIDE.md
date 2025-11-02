# הוראות שלב 1 - יצירת קוד טעינה

**תאריך:** ${new Date().toLocaleDateString('he-IL')}

## 📍 באיזה עמוד לבצע את שלב 1?

### אפשרות 1: עמוד ניהול מערכת (מומלץ) ⭐

**עמוד:** `/init-system-management.html`

**למה זה הכי טוב:**
- ✅ הכלי כבר טעון שם (`PageTemplateGenerator`)
- ✅ כל התלויות זמינות (`PACKAGE_MANIFEST`, `PAGE_CONFIGS`)
- ✅ זה העמוד שמיועד לפיתוח וכלי עזר

**איך לבצע:**
1. פתח בדפדפן: `http://localhost:8080/init-system-management.html`
2. פתח את הקונסולה (F12)
3. הרץ:
   ```javascript
   // בדיקה שהכלי זמין
   if (typeof window.PageTemplateGenerator !== 'undefined') {
       console.log('✅ PageTemplateGenerator זמין');
       
       // יצירת קוד טעינה
       const scriptTags = window.PageTemplateGenerator.generateScriptTagsForPage('test-monitoring');
       
       // הצגה בקונסולה
       console.log('📋 קוד הטעינה שנוצר:');
       console.log(scriptTags);
       
       // העתקה אוטומטית ללוח
       navigator.clipboard.writeText(scriptTags).then(() => {
           console.log('✅ הקוד הועתק ללוח!');
           alert('✅ הקוד הועתק ללוח - הדבק ב-test-monitoring.html');
       }).catch(err => {
           console.error('❌ שגיאה בהעתקה:', err);
           console.log('📋 העתק ידנית מהקונסולה');
       });
   } else {
       console.error('❌ PageTemplateGenerator לא זמין - נסה עמוד אחר');
   }
   ```

---

### אפשרות 2: כל עמוד אחר (עם טעינה דינמית)

**עמוד:** כל עמוד (למשל `/trades.html`, `/alerts.html`)

**למה זה עובד:**
- גם אם הכלי לא נטען אוטומטית, אפשר לטעון אותו דינמית

**איך לבצע:**
1. פתח כל עמוד במערכת
2. פתח את הקונסולה (F12)
3. הרץ:
   ```javascript
   // טעינה דינמית של הכלים
   async function loadTemplateGenerator() {
       // טעינת הכלים הנדרשים
       await loadScript('scripts/init-system/package-manifest.js');
       await loadScript('scripts/page-initialization-configs.js');
       await loadScript('scripts/init-system/dev-tools/page-template-generator.js');
       
       // המתן לטעינה
       await new Promise(resolve => setTimeout(resolve, 1000));
       
       if (typeof window.PageTemplateGenerator !== 'undefined') {
           const scriptTags = window.PageTemplateGenerator.generateScriptTagsForPage('test-monitoring');
           console.log(scriptTags);
           navigator.clipboard.writeText(scriptTags);
           console.log('✅ הקוד הועתק ללוח!');
       }
   }
   
   function loadScript(src) {
       return new Promise((resolve, reject) => {
           const script = document.createElement('script');
           script.src = src;
           script.onload = resolve;
           script.onerror = reject;
           document.head.appendChild(script);
       });
   }
   
   loadTemplateGenerator();
   ```

---

### אפשרות 3: test-monitoring.html עצמו (אחרי עדכון ראשוני)

**עמוד:** `/test-monitoring.html` (אחרי שטענת אותו פעם אחת עם הכלים)

**למה זה עובד:**
- אחרי שתעדכן את העמוד פעם אחת עם הכלים, תוכל להריץ את הפקודה ישירות שם

---

## ✅ המלצה

**השתמש באפשרות 1 (init-system-management.html)** כי:
- זה הכי פשוט
- זה העמוד המיועד לכלי פיתוח
- כל התלויות כבר שם

---

## 📝 צעדים לאחר יצירת הקוד

1. **העתק את הקוד** מהקונסולה (או מהלוח אם הועתק אוטומטית)
2. **פתח את** `trading-ui/test-monitoring.html`
3. **מצא את השורה:**
   ```html
   <!-- ⚠️ PLACEHOLDER - Scripts will be generated here by PageTemplateGenerator -->
   ```
4. **החלף** את כל ה-PLACEHOLDER (משורה "START SCRIPT LOADING ORDER" עד "END SCRIPT LOADING ORDER") בקוד שנוצר
5. **שמור את הקובץ**

---

**נוצר:** ${new Date().toISOString()}



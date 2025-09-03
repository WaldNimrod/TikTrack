# 🔧 **תצורת מערכת הלינטר - TikTrack**

## **📋 סקירה כללית**

מערכת הלינטר כוללת כלים מתקדמים לבדיקת איכות קוד, עיצוב, ביצועים ואבטחה.

## **🛠️ כלים מותקנים**

### **JavaScript (ESLint v9)**
- **תצורה:** `eslint.config.js`
- **כללים:** 150+ כללי איכות קוד
- **תוספים:** Import, JSDoc, Promise, Security, Unicorn
- **בדיקות:** איכות קוד, סגנון, ביצועים, אבטחה

### **CSS (Stylelint)**
- **תצורה:** `.stylelintrc`
- **כללים:** סדר properties, SCSS validation
- **תוספים:** Order, SCSS
- **בדיקות:** עיצוב, סדר, תאימות

### **HTML (HTMLHint)**
- **תצורה:** `.htmlhintrc`
- **כללים:** 40+ כללי validation
- **בדיקות:** תקפות HTML, accessibility, SEO

### **Code Formatting (Prettier)**
- **תצורה:** `.prettierrc`
- **כללים:** עיצוב עקבי
- **קבצים:** JS, CSS, HTML, JSON

## **📊 סקריפטי npm**

### **בדיקה בסיסית:**
- `npm run lint` - בדיקת JavaScript
- `npm run html:check` - בדיקת HTML
- `npm run css:check` - בדיקת CSS
- `npm run format:check` - בדיקת עיצוב

### **תיקון אוטומטי:**
- `npm run lint:fix` - תיקון JavaScript
- `npm run css:fix` - תיקון CSS
- `npm run format` - עיצוב אוטומטי
- `npm run fix:all` - תיקון כל הקבצים

### **דוחות מתקדמים:**
- `npm run quality:report` - דוח איכות HTML
- `npm run performance:check` - בדיקת ביצועים
- `npm run bundle:analyze` - ניתוח bundle
- `npm run validate:all` - בדיקה מקיפה

## **⚙️ תצורות מיוחדות**

### **JavaScript Rules:**
- **איכות קוד:** Complexity, depth, function size
- **ביצועים:** No eval, no new functions
- **אבטחה:** No script URLs, no eval
- **סגנון:** Indentation, quotes, spacing

### **CSS Rules:**
- **סדר Properties:** Logical grouping
- **SCSS:** Advanced SCSS validation
- **עיצוב:** Consistent spacing, naming

### **HTML Rules:**
- **תקפות:** Valid HTML5 structure
- **Accessibility:** Alt tags, labels
- **SEO:** Meta tags, structure

## **🚀 שימוש יומיומי**

### **לפני commit:**
```bash
npm run check:all
```

### **תיקון בעיות:**
```bash
npm run fix:all
```

### **דוח איכות:**
```bash
npm run quality:report
```

### **בדיקת ביצועים:**
```bash
npm run performance:check
```

## **📈 מדדי איכות**

### **יעדים:**
- **JavaScript:** < 100 שגיאות
- **CSS:** < 500 בעיות
- **HTML:** < 100 בעיות
- **ביצועים:** > 90 Lighthouse score

### **מדידה:**
- דוחות אוטומטיים
- מעקב מתמשך
- שיפור הדרגתי

## **🔧 הגדרות נוספות**

### **IDE Integration:**
- VS Code extensions
- Pre-commit hooks
- CI/CD integration

### **Custom Rules:**
- Project-specific patterns
- Hebrew/English considerations
- RTL layout support

# דוח מבנה חבילות וחבילות לכל עמוד

**תאריך:** ${new Date().toLocaleDateString('he-IL')}  
**גרסה:** 1.0.0

---

## 📦 מבנה החבילות במערכת (29 חבילות)

החבילות מסודרות לפי `loadOrder` - סדר הטעינה:

| # | ID | שם | Scripts | תלויות | loadOrder |
|---|----|----|---------|--------|-----------|
${this.generatePackageTable()}

---

## 📄 חבילות מוגדרות לכל עמוד

### עמודים מרכזיים

${this.generatePagesPackagesTable('main')}

### עמודים טכניים

${this.generatePagesPackagesTable('technical')}

### עמודים נוספים

${this.generatePagesPackagesTable('other')}

---

## 🔍 ניתוח חלוקת חבילות

### חבילות לפי גודל

${this.generatePackageSizeAnalysis()}

### חבילות לפי שימוש

${this.generatePackageUsageAnalysis()}

---

## ⚠️ בעיות שזוהו

${this.generateIssuesSummary()}

---

**הערות:**
- כל עמוד **חייב** לכלול את חבילת `base`
- חבילות נטענות לפי `loadOrder` - חבילה עם מספר נמוך יותר נטענת קודם
- תלויות נטענות אוטומטית לפני החבילה התלויה


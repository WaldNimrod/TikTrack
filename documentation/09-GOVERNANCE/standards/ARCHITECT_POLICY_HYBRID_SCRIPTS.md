# 📜 מדיניות סקריפטים: מותר <script src>, אסור Inline

**id:** `ARCHITECT_POLICY_HYBRID_SCRIPTS`  
**owner:** Chief Architect (Gemini Bridge)  
**status:** 🔒 **SSOT - MANDATORY**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-04  
**version:** v1.0

---

**מקור:** פקודת האדריכל המאוחדת + דוח ביקורת חיצונית

---

## 📢 Executive Summary

לפי פקודת האדריכל המאוחדת ודוח הביקורת החיצונית, מדיניות הסקריפטים המעודכנת היא:

### **מותר:**
- ✅ תגי `<script src="...">` לטעינת תשתיות (Bridge, Loaders, Auth Guard)
- ✅ שימוש במודולים חיצוניים דרך `<script type="module" src="...">`

### **אסור:**
- ❌ קוד Inline JavaScript בתוך תגי `<script>` בקבצי HTML או JSX
- ❌ כל קוד JavaScript שנכתב ישירות בתוך ה-HTML

---

## 🎯 מטרת המדיניות

מדיניות זו מאפשרת את הארכיטקטורה ההיברידית של פרויקט Phoenix:
- **Shell (HTML):** עמודי HTML סטטיים עם טעינת תשתיות דרך `<script src>`
- **Cubes (React):** איים של לוגיקה ב-React components
- **Bridge:** חיבור בין Shell ל-Cubes דרך `window.PhoenixBridge`

---

## 📋 דוגמאות

### ✅ **מותר:**

```html
<!-- טעינת Bridge -->
<script src="/infrastructure/phoenix-bridge.js"></script>

<!-- טעינת Auth Guard -->
<script type="module" src="/src/components/core/authGuard.js"></script>

<!-- טעינת Loader -->
<script src="/infrastructure/page-loader.js"></script>
```

### ❌ **אסור:**

```html
<!-- אסור - Inline JavaScript -->
<script>
  const token = localStorage.getItem('token');
  console.log(token);
</script>

<!-- אסור - Event Handlers Inline -->
<button onclick="handleClick()">Click</button>

<!-- אסור - JavaScript בתוך HTML -->
<div onload="init()">Content</div>
```

---

## 🔄 רטרואקטיביות

כל עמודי ה-Auth הקיימים חייבים לעבור Refactor להוצאת הלוגיקה לקבצים חיצוניים.

**דוגמה לתיקון:**

**לפני (אסור):**
```html
<script>
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
  }
</script>
```

**אחרי (מותר):**
```html
<script type="module" src="/src/components/core/authGuard.js"></script>
```

---

## ⚠️ אכיפה

- **G-Bridge:** כל חריגה תגרור פסילת G-Bridge מיידית
- **Code Review:** כל קוד חדש חייב לעמוד במדיניות זו
- **Refactoring:** קוד קיים חייב לעבור Refactor בהתאם

---

## 📚 קישורים רלוונטיים

- `PHOENIX_MASTER_BIBLE.md` - סעיף 6.4
- `ARCHITECT_EXTERNAL_REVIEW_RESPONSE.md` - דוח התגובה לביקורת החיצונית

---

**עודכן על ידי:** צוות 10 (The Gateway) | 2026-02-04  
**גרסה:** v1.0 (מדיניות היברידית)

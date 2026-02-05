# ⚓ אסטרטגיית ניווט: קישורים סטנדרטיים במבנה היברידי

**סטטוס:** 🔒 LOCKED  
**נושא:** הסבר אדריכלי לשימוש בקישורי `<a>` בתפריט הראשי.  
**תאריך:** 2026-02-04

---

## 🔍 1. הבעיה בניתוב ריאקט (React Router) במערכת שלנו

ברוב אפליקציות הריאקט, הניווט מתבצע ללא טעינת עמוד (Client-side Routing). זה נראה מהיר, אבל בפיניקס v2 זה יוצר בעיה:

### איבוד Fidelity
כל עמוד בפיניקס (D16, D21 וכו') הוא קובץ HTML עצמאי שנבנה כדי להיות העתק מושלם של הלגסי. מעבר "פנימי" של ריאקט עלול לשבש את טעינת הסגנונות (CSS) הייחודיים לכל עמוד.

### זיכרון נקי
כשאנחנו עוברים דף בצורה סטנדרטית, הדפדפן מנקה את הזיכרון. זה מבטיח שבאג בעמוד אחד לא "יזהם" את העמוד הבא.

---

## 🌐 2. היתרון בקישורים סטנדרטיים (`<a>`)

### SSOT (מקור אמת יחיד)
התפריט הוא חלק מה-Shell (המעטפת). הוא צריך לעבוד תמיד, גם אם קובץ ה-JavaScript של הריאקט נכשל בטעינה.

### SEO ונגישות
מנועי חיפוש וטכנולוגיות מסייעות מבינים הכי טוב קישורים פשוטים.

### פשטות לצוותים
מפתח בצוות 10 לא צריך לדעת ריאקט כדי להוסיף פריט לתפריט. הוא פשוט מעדכן קובץ HTML.

---

## 🌉 3. איך שומרים על ה"אינטליגנציה"? (The Bridge)

השאלה המתבקשת היא: "אם זה קישור סטנדרטי ועוברים דף, איך המערכת זוכרת שסיננתי 'חשבון אינטראקטיב'?"

כאן נכנס ה-Bridge:

### לפני המעבר
הקישור בתפריט "מזריק" את הפרמטרים ל-URL (למשל: `accounts.html?acc=123`).

### אחרי המעבר
עמוד הריאקט החדש קורא את ה-URL וטוען את הנתונים הנכונים מיד.

### גיבוי
ה-Bridge שומר את המצב ב-`sessionStorage` ליתר ביטחון.

---

## 🎯 4. סיכום התפקידים

### תפריט (Navigation)
**קישורים רגילים.** אחראי על ה"איפה אני?".

### פילטר גלובלי (Global Filter)
**רכיב היברידי.** מציג נתונים מריאקט, אבל משפיע על הקישורים בתפריט.

### תוכן (Content)
**ריאקט מלא.** אחראי על ה"מה אני רואה?".

---

## 📋 יישום במערכת

### קבצים רלוונטיים:

1. **UnifiedHeader.jsx** (`ui/src/components/core/UnifiedHeader.jsx`)
   - תפריט ראשי עם קישורי `<a>` סטנדרטיים
   - טיפול ב-navigation events

2. **navigation-handler.js** (`ui/src/views/financial/navigation-handler.js`)
   - Bridge logic לטיפול בפרמטרים
   - שמירת מצב ב-sessionStorage

3. **phoenix-filter-bridge.js** (`ui/src/components/core/phoenix-filter-bridge.js`)
   - גשר בין React Filter Context לקישורים בתפריט

### Routes מוגדרים:

#### React Router (AppRouter.jsx):
- `/` → HomePage (Protected)
- `/profile` → ProfileView (Protected)
- `/login` → LoginForm (Public)
- `/register` → RegisterForm (Public)
- `/reset-password` → PasswordResetFlow (Public)

#### Vite Middleware (vite.config.js):
- `/trading_accounts` → `trading_accounts.html`
- `/user_profile` → `user_profile.html`
- `/brokers_fees` → `brokers_fees.html`
- `/cash_flows` → `cash_flows.html`

---

## ⚠️ כללי אצבע

1. **תפריט ראשי:** תמיד קישורי `<a>` סטנדרטיים
2. **פילטרים:** React Components שמשפיעים על URL parameters
3. **תוכן עמוד:** React Components מלאים
4. **מעבר בין עמודים:** תמיד דרך קישור סטנדרטי (לא `navigate()`)

---

## 🔧 דוגמאות קוד

### ✅ נכון - קישור סטנדרטי בתפריט:
```jsx
<a href="/trading_accounts" onClick={handleHtmlPageNavigation}>
  חשבונות מסחר
</a>
```

### ❌ לא נכון - React Router Link בתפריט:
```jsx
<Link to="/trading_accounts">
  חשבונות מסחר
</Link>
```

### ✅ נכון - Bridge עם פרמטרים:
```javascript
// לפני מעבר
const url = `/trading_accounts?filter=active&account=123`;
window.location.href = url;

// אחרי מעבר (בעמוד החדש)
const params = new URLSearchParams(window.location.search);
const accountId = params.get('account');
```

---

## ⚠️ בעיות יישום נוכחיות

### בעיה 1: שימוש ב-`<Link>` במקום `<a>` ב-UnifiedHeader.jsx

בקוד הנוכחי יש שימוש ב-`<Link>` של React Router במקומות שלא צריכים:

```jsx
// ❌ לא תואם לאסטרטגיה:
<Link to="/" className="tiktrack-nav-link" data-page="home">
<Link to="/trade_plans" className="tiktrack-nav-link">
<Link to="/trades" className="tiktrack-nav-link">
```

**צריך להיות:**
```jsx
// ✅ תואם לאסטרטגיה:
<a href="/" className="tiktrack-nav-link" data-page="home">
<a href="/trade_plans" className="tiktrack-nav-link">
<a href="/trades" className="tiktrack-nav-link">
```

### בעיה 2: ערבוב בין React Router ו-HTML Pages

יש ערבוב בין:
- קישורי `<a>` לעמודי HTML (`/trading_accounts`, `/user_profile`)
- קישורי `<Link>` לעמודי React (`/`, `/profile`)

**המלצה:** להעביר את כל הקישורים בתפריט ל-`<a>` סטנדרטיים, גם לעמודי React.

---

## 📝 רשימת משימות לתיקון

- [ ] להחליף את כל ה-`<Link>` ב-`UnifiedHeader.jsx` ל-`<a>` סטנדרטיים
- [ ] להסיר את ה-`import { Link } from 'react-router-dom'` מ-`UnifiedHeader.jsx`
- [ ] לוודא ש-`handleHtmlPageNavigation` מטפל בכל הקישורים
- [ ] לבדוק שהפילטרים עובדים עם קישורי `<a>` סטנדרטיים
- [ ] לתעד את השינויים

---

**log_entry | [Architect] | NAVIGATION_STRATEGY | HYBRID_MODEL_APPROVED | BLUE | 2026-02-04**

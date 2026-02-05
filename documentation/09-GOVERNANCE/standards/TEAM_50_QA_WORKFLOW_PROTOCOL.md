# 🧪 נוהל עבודה לבדיקות QA - Team 50 (QA & Fidelity)

**id:** `TEAM_50_QA_WORKFLOW_PROTOCOL`  
**owner:** Team 50 (QA & Fidelity)  
**status:** 🔒 **SSOT - MANDATORY**  
**supersedes:** None (Master document)  
**last_updated:** 2026-01-31  
**version:** v1.0

---

**מיקום:** `documentation/09-GOVERNANCE/standards/`  
**סטטוס:** ✅ נוהל מחייב

---

## 📋 תקציר מנהלים

נוהל זה מגדיר את דרך העבודה המדויקת של Team 50 (QA) בביצוע בדיקות Integration Testing, כולל שימוש בבדיקות Selenium אוטומטיות ולידציה ויזואלית סופית.

**הדיוק הוא לא יעד, הוא דרך חיים.**

---

## 🎯 הגדרת תפקיד Team 50

### תפקידים עיקריים:

1. **ולידציה של Evidence** בתיקייה `05-REPORTS/artifacts/`
2. **בדיקות Integration Testing** - Backend + Frontend יחד
3. **בדיקות Code Review** - וידוא compliance עם סטנדרטים
4. **בדיקות Runtime** - בדיקות Selenium אוטומטיות
5. **לידציה ויזואלית** - בדיקה ידנית סופית בדפדפן

---

## 📋 נוהל עבודה - שלבים

### שלב 1: Code Review (חובה ראשונית)

**מטרה:** וידוא compliance עם סטנדרטים לפני בדיקות runtime.

**תהליך:**
1. **קריאת קוד:**
   - Frontend: `ui/src/`
   - Backend: `api/`
   - Integration points: Services, Transformers, API calls

2. **בדיקת Compliance:**
   - ✅ **CSS Standards:** `documentation/07-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md`
   - ✅ **JS Standards:** `documentation/07-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md`
   - ✅ **Architectural Standards:** `PHOENIX_MASTER_BIBLE.md`

3. **תיעוד תוצאות:**
   - יצירת דוח QA לפי `TEAM_50_QA_REPORT_TEMPLATE.md`
   - הפרדה לפי צוותים (🔵 Frontend / 🟢 Backend / 🟡 Integration)
   - ציון בעיות עם מיקום מדויק (קובץ, שורה)

**תוצר:** דוח Code Review מלא

---

### שלב 2: בדיקות Selenium אוטומטיות (חובה)

**מטרה:** ביצוע בדיקות אוטומטיות מקיפות ללא צילומי מסך.

**תהליך:**

1. **הכנת תשתית:**
   ```bash
   cd tests
   npm install
   ```

2. **ודא Infrastructure:**
   - Backend running: `http://localhost:8082`
   - Frontend running: `http://localhost:8080`
   - Health check: `curl http://localhost:8082/health`

3. **הרצת בדיקות:**
   ```bash
   # כל הבדיקות
   npm run test:all
   
   # או לפי קטגוריה
   npm run test:auth      # Authentication Flow
   npm run test:user      # User Management Flow
   npm run test:apikeys   # API Keys Management Flow
   npm run test:errors    # Error Handling & Security
   ```

4. **ניטור תוצאות:**
   - כל בדיקה מציגה: ✅ PASS / ❌ FAIL / ⏸️ SKIP
   - סיכום אוטומטי בסיום
   - לוגים מפורטים (Console, Network)

5. **תיעוד תוצאות:**
   - עדכון דוח QA עם תוצאות Runtime
   - ציון בדיקות שעברו/נכשלו
   - איסוף Evidence (לוגים, תוצאות)

**תוצר:** דוח Runtime Testing עם תוצאות אוטומטיות

---

### שלב 3: לידציה ויזואלית סופית (חובה)

**מטרה:** בדיקה ידנית סופית בדפדפן אחרי שכל הבדיקות האוטומטיות עוברות.

**תהליך:**

1. **הכנה:**
   - כל הבדיקות האוטומטיות עברו בהצלחה ✅
   - Infrastructure מוכן (Backend + Frontend)

2. **בדיקה ידנית:**
   - פתיחת דפדפן: `http://localhost:8080`
   - בדיקת כל ה-Flows:
     - Authentication (Login, Register, Logout)
     - User Management (Profile, Settings)
     - API Keys (Create, List, Update, Delete)
     - Error Handling (Network errors, API errors)

3. **בדיקת Fidelity:**
   - התאמה ויזואלית ל-Legacy (אם רלוונטי)
   - בדיקת RTL mirroring
   - בדיקת Responsive design
   - בדיקת States (hover, focus, active)

4. **תיעוד:**
   - ציון "לידציה ויזואלית עברה" בדוח
   - תיעוד כל בעיה ויזואלית שנמצאה

**תוצר:** אישור לידציה ויזואלית בדוח QA

---

## 📊 פורמט דיווח

### דוח QA מלא חייב לכלול:

1. **Executive Summary:**
   - סטטוס כללי
   - סיכום תוצאות
   - הערכה כוללת

2. **Quick Reference:**
   - טבלת תוצאות (Code Review + Runtime)
   - טבלת Issues לפי צוותים
   - סיכום כללי

3. **Code Review Results:**
   - תוצאות Code Review מפורטות
   - Compliance verification
   - Evidence (קוד, שורות)

4. **Runtime Testing Results:**
   - תוצאות Selenium אוטומטיות
   - סיכום תוצאות
   - Evidence (לוגים, תוצאות)

5. **Visual Validation:**
   - סטטוס לידציה ויזואלית
   - בעיות ויזואליות (אם יש)

6. **Issues Found:**
   - הפרדה לפי צוותים (🔵 Frontend / 🟢 Backend / 🟡 Integration)
   - כל Issue עם:
     - Severity, Priority
     - Location (קובץ, שורה)
     - Description, Recommendation
     - Impact

7. **Recommendations:**
   - המלצות לכל צוות
   - Action items

8. **Sign-off:**
   - סטטוס סופי
   - Readiness assessment

---

## 🔗 הפניה לסטנדרטים מחייבים

### CSS Standards (חובה)

**מסמך:** `documentation/07-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md`

**עיקרי הסטנדרטים:**
- ✅ ITCSS + BEM methodology
- ✅ Fluid Design (clamp, Container Queries, Logical Viewports)
- ✅ Logical Properties בלבד (אין physical properties)
- ✅ CSS Variables בלבד (אין צבעים ישירים)
- ✅ Z-Index Registry (אין Z-Index ישיר)
- ✅ DNA Multiples (8px base unit)
- ✅ Comments LOD 400

**בדיקות QA נדרשות:**
- [ ] Pixel Match (0 pixel deviation)
- [ ] RTL Mirroring verification
- [ ] State Integrity (hover, focus, active)
- [ ] G-Bridge validation passed

---

### JavaScript Standards (חובה)

**מסמך:** `documentation/07-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md`

**עיקרי הסטנדרטים:**
- ✅ Transformation Layer (`apiToReact`, `reactToApi`)
- ✅ API Layer: `snake_case` בלבד
- ✅ React Layer: `camelCase` בלבד
- ✅ JS Selectors: `js-` prefix בלבד (אין BEM classes)
- ✅ Audit Trail System (`PhoenixAudit`)
- ✅ Debug Mode (`?debug` URL parameter)
- ✅ JSDoc עם `@legacyReference`

**בדיקות QA נדרשות:**
- [ ] Network Integrity (Payloads ב-snake_case)
- [ ] Console Audit (נקי במצב רגיל, מלא ב-`?debug`)
- [ ] Fidelity Resilience (שגיאות ב-LEGO components)
- [ ] Transformation Layer compliance

---

## 🧪 בדיקות Selenium - תהליך מפורט

### תשתית בדיקות

**מיקום:** `tests/`

**קבצים:**
- `selenium-config.js` - הגדרות Selenium
- `auth-flow.test.js` - בדיקות Authentication
- `user-management.test.js` - בדיקות User Management
- `api-keys.test.js` - בדיקות API Keys
- `error-handling.test.js` - בדיקות Error Handling
- `run-all.js` - Test runner

### תהליך ביצוע

1. **הכנה:**
   ```bash
   cd tests
   npm install
   ```

2. **בדיקת Infrastructure:**
   - Backend: `curl http://localhost:8082/health`
   - Frontend: `curl http://localhost:8080`

3. **הרצת בדיקות:**
   ```bash
   npm run test:all
   ```

4. **ניטור:**
   - כל בדיקה מציגה סטטוס (✅ PASS / ❌ FAIL / ⏸️ SKIP)
   - סיכום אוטומטי בסיום
   - לוגים מפורטים

5. **תיעוד:**
   - עדכון דוח QA עם תוצאות
   - ציון בדיקות שעברו/נכשלו

---

## ✅ רשימת בדיקות לפני דיווח

### Code Review Checklist

- [ ] כל הקוד נבדק
- [ ] Compliance עם CSS Standards
- [ ] Compliance עם JS Standards
- [ ] Compliance עם Architectural Standards
- [ ] Issues מתועדים עם מיקום מדויק
- [ ] דוח לפי Template

### Runtime Testing Checklist

- [ ] Infrastructure מוכן (Backend + Frontend)
- [ ] כל הבדיקות האוטומטיות הורצו
- [ ] תוצאות תועדו בדוח
- [ ] Evidence נאסף (לוגים, תוצאות)

### Visual Validation Checklist

- [ ] כל הבדיקות האוטומטיות עברו ✅
- [ ] בדיקה ידנית בוצעה בדפדפן
- [ ] כל ה-Flows נבדקו
- [ ] Fidelity נבדק (אם רלוונטי)
- [ ] תיעוד בעיות ויזואליות (אם יש)

---

## 📋 תהליך דיווח לצוותים

### דיווח Issues

**פורמט:**
- הפרדה לפי צוותים (🔵 Frontend / 🟢 Backend / 🟡 Integration)
- כל Issue עם:
  - Severity (Critical / High / Medium / Low)
  - Priority (Critical / High / Medium / Low)
  - Location (קובץ, שורה)
  - Description
  - Recommendation
  - Impact

**קישורים לדוחות:**
- כל דוח כולל קישורים לסעיפים רלוונטיים
- קישורים למסמכי סטנדרטים

---

## 🔗 קישורים למסמכי סטנדרטים

### CSS Standards

- **נוהל מחייב:** `documentation/07-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md`
- **הודעה לצוות 30:** `_COMMUNICATION/TEAM_30_CSS_STANDARDS_PROTOCOL_MANDATORY.md`

### JavaScript Standards

- **נוהל מחייב:** `documentation/07-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md`
- **הודעה לצוות 30:** `_COMMUNICATION/TEAM_30_JS_STANDARDS_PROTOCOL_MANDATORY.md`

### QA Standards

- **QA Report Template:** `documentation/06-GOVERNANCE_&_COMPLIANCE/standards/TEAM_50_QA_REPORT_TEMPLATE.md`
- **נוהל עבודה זה:** `documentation/06-GOVERNANCE_&_COMPLIANCE/standards/TEAM_50_QA_WORKFLOW_PROTOCOL.md`

---

## 📊 דוגמה לתהליך מלא

### Phase 1.5 Integration Testing

1. **Code Review:**
   - ✅ בדיקת כל הקוד
   - ✅ Compliance verification
   - ✅ תיעוד Issues

2. **Selenium Automation:**
   - ✅ `npm run test:all`
   - ✅ כל הבדיקות עברו
   - ✅ תיעוד תוצאות

3. **Visual Validation:**
   - ✅ בדיקה ידנית בדפדפן
   - ✅ כל ה-Flows נבדקו
   - ✅ אישור לידציה ויזואלית

4. **דיווח:**
   - ✅ דוח QA מלא
   - ✅ דיווח לצוות 10
   - ✅ קישורים לצוותים לתיקונים

---

## ✅ Sign-off

**נוהל זה הוא מחייב לכל בדיקות QA של Team 50.**

**חובה לעמוד בכל השלבים:**
1. Code Review
2. Selenium Automation
3. Visual Validation
4. דיווח מלא

---

**Last Updated:** 2026-01-31  
**Maintained By:** Team 50 (QA)  
**Approved By:** Team 10 (The Gateway)

---

**log_entry | Team 50 | QA_WORKFLOW_PROTOCOL | STANDARD | GREEN | 2026-01-31**

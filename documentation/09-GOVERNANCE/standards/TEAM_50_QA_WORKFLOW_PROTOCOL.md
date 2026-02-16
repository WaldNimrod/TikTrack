# 🧪 נוהל עבודה לבדיקות QA - Team 50 (QA & Fidelity)

**id:** `TEAM_50_QA_WORKFLOW_PROTOCOL`  
**owner:** Team 50 (QA & Fidelity)  
**status:** 🔒 **SSOT - MANDATORY**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-10  
**version:** v2.5

**מקור עדכון:** 
- נוהל QA מחייב מצוות 90 (Spy) והאדריכלית הראשית - מפת עבודה מלאה (Automation-First + E2E חובה)
- SOP-010: Manual Intent & Simulation Protocol - סימולציה טכנית מלאה (Selenium E2E)  
**⚠️ Note:** מסמך זה מכיל הפניות לקבצי תקשורת (`_COMMUNICATION`) לצורכי התייחסות בלבד. קבצי התקשורת אינם חלק מה-SSOT.

---

**מיקום:** `documentation/09-GOVERNANCE/standards/`  
**סטטוס:** ✅ נוהל מחייב

---

## 📋 תקציר מנהלים

נוהל זה מגדיר את דרך העבודה המדויקת של Team 50 (QA) בביצוע בדיקות Integration Testing, כולל שימוש בבדיקות Selenium אוטומטיות ובדיקות E2E המדמות חוויית משתמש מקצה לקצה.

**הדיוק הוא לא יעד, הוא דרך חיים.**

**⚠️ חשוב - תפקיד Team 50:**
- **בדיקות פנימיות - שכבה ראשונה:** הבדיקות שלנו הן בדיקות פנימיות לפני העברה לביקורת חיצונית
- **אוטומציה מלאה:** אנחנו מבצעים את כל הבדיקות האוטומטיות
- **תיקונים עד השלמה:** מעבירים תיקונים לצוותים עד להשלמה ומעבר חלק של הבדיקות באופן מלא
- **E2E המדמות חוויית משתמש:** כולל בדיקות המדמות ככל הניתן את חווית המשתמש הסופית מקצה לקצה
- **אישור לפני בקרה חיצונית:** לאחר אישור שלנו הקוד עובר לסבב בקרה חיצוני
- **אין בדיקות ידניות:** בדיקות ידניות לא נכללות בתהליך שלנו - אלה רק אחרי הבקרה החיצונית

---

## 🚨 תנאי הפעלה: מתי מתחילים QA (חובה)

1. **QA מתבצע רק אחרי שצוות 10 אישר השלמה ובדיקות ראשוניות.**  
   לא מריצים QA על "סבב פיתוח" לפני שצוות 10 קבע שהשלב/התוכנית הושלמו ובדיקות השער הראשוניות בוצעו. ראה `TT2_QUALITY_ASSURANCE_GATE_PROTOCOL` סעיף 1א.

2. **חובה לקבל מצוות 10 עדכון מפורט כולל קונטקסט.**  
   צוות 50 **אינו בלופ של סבב הפיתוח**. ללא עדכון מפורט מצוות 10 — **לא מתחילים QA**.  
   העדכון חייב לכלול:
   - **מה פותח** — תוכנית/שלב, משימות שהושלמו, צוותים.
   - **מה נדרש לבדוק** — scope (עמודים, API, תזרים), אילו Gates רלוונטיים.
   - **קונטקסט** — קישורים ל-SSOT (תוכנית, ADR, Page Tracker), Endpoints/פורטים, הנחיות.

**ללא מסירת קונטקסט מפורט מצוות 10 — Team 50 לא מניח הבנה של "הסבב האחרון" ולא מפעיל בדיקות.**

---

## 🎯 הגדרת תפקיד Team 50

### תפקידים עיקריים:

1. **ולידציה של Evidence** בתיקייה `05-REPORTS/artifacts/`
2. **בדיקות Integration Testing** - Backend + Frontend יחד
3. **בדיקות Code Review** - וידוא compliance עם סטנדרטים
4. **בדיקות Runtime** - בדיקות Selenium אוטומטיות
5. **בדיקות E2E** - בדיקות המדמות חוויית משתמש מקצה לקצה
6. **תיקונים עד השלמה** - העברת תיקונים לצוותים עד להשלמה ומעבר חלק של הבדיקות
7. **דיווח תקלות (נוהל מחייב)** — עם כל ממצא של שגיאה: עדכון קצר ל-Team 10 + דרישת תיקון מפורטת לצוות/ים הרלוונטיים. ראה `TT2_TEAM_50_DEFECT_REPORTING_PROCEDURE` (חובה).

**⚠️ לא נכלל בתפקידנו:**
- ❌ **בדיקות ידניות** - אלה חלק מהביקורת החיצונית בלבד

---

## 🧭 מפת נוהל QA (שלבים + דרישות)

**מקור:** נוהל QA מחייב מצוות 90 (Spy) והאדריכלית הראשית  
**סטטוס:** 🔒 **MANDATORY - נוהל קבוע ומחייב לכל הפרויקט**

---

## ✅ כללי חובה

### **Automation-First:**
- ✅ אין קיצור דרך — כל מה שאפשר אוטומטי
- ✅ כל Gate חייב להיות אוטומטי (חוץ מ-Gate D)

### **E2E חובה:**
- ✅ ללא E2E אין GREEN
- ✅ Gate C (UI↔Runtime) הוא חובה

### **E2E המדמות חוויית משתמש:**
- ✅ בדיקות E2E המדמות ככל הניתן את חווית המשתמש הסופית מקצה לקצה
- ✅ Gate C (UI↔Runtime) כולל בדיקות E2E מלאות

### **Manual QA Gate (פעם אחת בלבד) - SOP-010:**
- ✅ Manual QA Gate מבוצע פעם אחת בלבד לאחר שכל האוטומציות עברו
- ✅ כולל: Console Hygiene, Security Validation, Digital Twin
- ✅ ביצוע רק לאחר Team 30 מסיים יישור מלא
- ✅ **SOP-010:** כל הרצת דפדפן היא סימולציה אוטומטית (Selenium) - לא בדיקה ידנית
- ⚠️ בדיקות ידניות אמיתיות (על ידי בן אנוש) הן חלק מהביקורת החיצונית בלבד

### **Zero-Deviation:**
- ✅ סטייה = RED מיידי
- ✅ אין אישור עם סטיות

### **בדיקות אבטחה חובה:**
- ✅ Masked Log + token leakage בכל Gate
- ✅ בדיקות אבטחה בכל שלב

---

## 🧭 Gate A — Doc↔Code (אוטומטי, חובה)

**מטרה:** לוודא שכל Spec ב-SSOT תואם לקוד.

**בדיקות חובה:**
- [ ] התאמת endpoints (path/method/response)
- [ ] התאמת schemas (names/types/enums)
- [ ] התאמת versions (routes.json, transformers)
- [ ] התאמת Specs ב-SSOT לקוד בפועל

**תוצר:** Doc/Code Matrix + דוח סטיות

**תהליך:**
1. קריאת Specs מ-`documentation/01-ARCHITECTURE/`
2. השוואה לקוד בפועל (`ui/src/`, `api/`)
3. זיהוי סטיות
4. דוח סטיות עם מיקום מדויק

**קריטריוני הצלחה:**
- ✅ 0 סטיות = GREEN
- ❌ כל סטייה = RED מיידי

---

## 🧭 Gate B — Contract↔Runtime (אוטומטי, חובה)

**מטרה:** לוודא שה-API חוזר בפועל לפי החוזים.

**בדיקות חובה:**
- [ ] Contract tests מול backend live
- [ ] אימות ש-Shared_Services בלבד (אין API calls ישירים)
- [ ] אימות UAI config חיצוני בלבד (אין inline config)
- [ ] אימות PDSC Boundary Contract
- [ ] אימות Error Schema (PDSC format)

**תוצר:** ContractTestReport

**תהליך:**
1. הרצת Contract Tests מול Backend live
2. בדיקת ש-Shared_Services בלבד משמש ל-API calls
3. בדיקת ש-UAI config חיצוני בלבד
4. בדיקת PDSC Boundary Contract compliance
5. דוח Contract Tests

**קריטריוני הצלחה:**
- ✅ כל ה-Contracts מאומתים = GREEN
- ❌ כל סטייה = RED מיידי

---

## 🧭 Gate C — UI↔Runtime (E2E חובה) - SOP-010 Compliance

**מטרה:** בדיקות E2E לכל הדפים הקריטיים - סימולציה טכנית מלאה.

**SOP-010 Requirements:**
- ✅ **Selenium/Headless להרצות UI מלאות** - כל הרצת דפדפן היא סימולציה אוטומטית
- ✅ **CRUD E2E לכל endpoints** - כולל summary/derivatives
- ✅ **Security validation** - Masked Log, token leakage, headers
- ✅ **Routes SSOT compliance** - אימות ש-Shared_Services משתמש ב-routes.json

**בדיקות חובה:**
- [ ] UAI stages מלאים (DOM → Bridge → Data → Render → Ready)
- [ ] Filters / pagination / summary / toggles
- [ ] CSS load order (phoenix-base first)
- [ ] Failure injection (Backend down → error handling תקין)
- [ ] Console Hygiene (0 שגיאות, 0 אזהרות) - בדיקת קונסולה בדפדפן
- [ ] Security Validation (Masked Log, Token Leakage) - בדיקת קונסולה + localStorage + DOM
- [ ] CRUD E2E - כל ה-endpoints (כולל summary)

**תוצר:** E2EReport + screenshots + logs + network logs

**תהליך:**
1. הרצת Selenium E2E Tests לכל הדפים הקריטיים (D16, D18, D21)
2. בדיקת UAI stages מלאים
3. בדיקת Filters, Pagination, Summary, Toggles
4. בדיקת CSS load order
5. Failure injection tests
6. Console Hygiene validation (בדיקת קונסולה בדפדפן)
7. Security Validation (Masked Log, Token Leakage) - בדיקת קונסולה + localStorage + DOM
8. CRUD E2E - כל ה-endpoints (כולל summary)
9. Routes SSOT compliance
10. דוח E2E עם screenshots + logs + network logs

**קריטריוני הצלחה:**
- ✅ כל ה-E2E Tests עברו = GREEN
- ✅ 0 שגיאות בקונסולה = GREEN
- ✅ אין token leakage = GREEN
- ✅ CRUD E2E עבר = GREEN
- ❌ כל כשל = RED מיידי

**Artifacts חובה:**
- ✅ Screenshots לכל עמוד
- ✅ Console logs (JSON)
- ✅ Network logs (JSON)
- ✅ Test summary (JSON)
- ✅ Errors log (JSON)

---

## 🧭 Manual QA Gate (פעם אחת בלבד)

**מטרה:** בדיקות Manual QA פעם אחת בלבד לאחר שכל האוטומציות עברו.

**בדיקות חובה:**
- [ ] Console Hygiene - בדיקת קוד (0 שגיאות, 0 אזהרות)
- [ ] Security Validation - בדיקת קוד (Masked Log, Token Leakage, Authorization)
- [ ] Digital Twin - בדיקת קוד (כל ה-containers מוגדרים)

**תוצר:** Manual QA Gate Report

**תהליך:**
1. כל ה-Gates A, B, C עברו ✅
2. Team 30 סיים יישור מלא ✅
3. בדיקת Console Hygiene (מקוד)
4. בדיקת Security Validation (מקוד)
5. בדיקת Digital Twin (מקוד)
6. דוח Manual QA Gate

**קריטריוני הצלחה:**
- ✅ Console Hygiene - VERIFIED (מקוד)
- ✅ Security Validation - VERIFIED (מקוד)
- ✅ Digital Twin - VERIFIED (מקוד)

**הערה:** בדיקות ידניות אמיתיות (בדפדפן) הן חלק מהביקורת החיצונית בלבד.

---

## 🧭 Gate D — Manual/Visual (ביקורת חיצונית בלבד)

**⚠️ חשוב:** Gate D הוא חלק מהביקורת החיצונית בלבד, לא חלק מתהליך Team 50.

**מטרה:** אישור חזותי ותפקודי סופי (ביקורת חיצונית)

**בדיקות חובה (ביקורת חיצונית):**
- [ ] תקינות UI מול SSOT
- [ ] דיוק תאריכים/סכומים/labels
- [ ] UX sanity
- [ ] Visual validation

**תוצר:** ManualApproval (ביקורת חיצונית)

**תהליך (ביקורת חיצונית):**
1. כל ה-Gates A, B, C עברו ✅ (Team 50)
2. הקוד עבר לביקורת חיצונית
3. בדיקה ידנית בדפדפן (ביקורת חיצונית)
4. בדיקת תקינות UI מול SSOT (ביקורת חיצונית)
5. בדיקת דיוק תאריכים/סכומים/labels (ביקורת חיצונית)
6. UX sanity check (ביקורת חיצונית)
7. Visual validation (ביקורת חיצונית)
8. אישור ידני סופי (ביקורת חיצונית)

**קריטריוני הצלחה:**
- ✅ כל הבדיקות הידניות עברו = GREEN (ביקורת חיצונית)
- ❌ כל בעיה = RED מיידי (ביקורת חיצונית)

---

## 📋 נוהל עבודה - שלבים (Legacy - עדיין תקף)

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
   - **בעיית תקשורת/אימות:** להשתמש בסקריפטים המתועדים ב־`SERVERS_SCRIPTS_SSOT` (`init-servers-for-qa.sh`, `fix-env-after-restart.sh`) — איתחול וביצוע בדיקה חוזרת. לא לסמן BLOCKED איתחול בחוזרה — ראה `TEAM_50_QA_RERUN_SOP` כלל קבוע.

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

### 🚨 דיווח תקלות — נוהל מחייב (עם כל שגיאה)

**בכל סבב בדיקות שבו נמצאת לפחות תקלה אחת — חובה להפעיל:**

1. **עדכון לצוות 10** — מסמך קצר: מה נבדק, מה נכשל, למי נשלחה דרישת תיקון + קישור למסמך המפורט.  
   תבנית: `TEAM_50_TO_TEAM_10_UPDATE_[נושא].md`

2. **דרישת תיקון לצוות/ים הרלוונטיים** — מסמך **מפורט ביותר**: שגיאה מדויקת, שחזור (Reproduction), מיקום בקוד, תיקון נדרש, אימות — כך שהצוות יכול לממש בלי לנחש.  
   תבנית: `TEAM_50_TO_TEAM_[מספר]_FIX_REQUEST_[נושא].md`

**נוהל מלא (מחייב):** `documentation/05-PROCEDURES/TT2_TEAM_50_DEFECT_REPORTING_PROCEDURE.md`

---

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
- **הודעה לצוות 30:** `_COMMUNICATION/TEAM_30_CSS_STANDARDS_PROTOCOL_MANDATORY.md` ⚠️ **NON-SSOT - Communication only**

### JavaScript Standards

- **נוהל מחייב:** `documentation/07-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md`
- **הודעה לצוות 30:** `_COMMUNICATION/TEAM_30_JS_STANDARDS_PROTOCOL_MANDATORY.md` ⚠️ **NON-SSOT - Communication only**

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

## 📊 תוצרים סופיים חובה

**כל בדיקת QA חייבת לכלול:**

1. **DocCode Matrix** - Gate A
2. **ContractTestReport** - Gate B
3. **E2EReport** - Gate C
4. **ManualApproval** - Gate D
5. **QA Final Summary** - סיכום כולל

---

## 📂 אחריות מיוחדת של Team 50

### **תחזוקת סדר קבצי הבדיקות + אינדקס בדיקות:**
- ✅ אינדקס חייב להיות עדכני ומסונכרן עם Specs חדשים
- ✅ כל בדיקה חדשה חייבת להיכנס לאינדקס
- ✅ תחזוקה שוטפת של אינדקס הבדיקות

**מקור:** `documentation/09-GOVERNANCE/standards/TEAM_50_QA_TEST_INDEX.md`

---

## ✅ Sign-off

**נוהל זה הוא מחייב לכל בדיקות QA של Team 50.**

**חובה לעמוד בכל ה-Gates (Team 50) - SOP-010:**
1. Gate A - Doc↔Code (אוטומטי, חובה)
2. Gate B - Contract↔Runtime (אוטומטי, חובה)
3. Gate C - UI↔Runtime (E2E חובה) - **Selenium E2E - סימולציה טכנית מלאה**
   - Selenium/Headless להרצות UI מלאות
   - CRUD E2E לכל endpoints (כולל summary/derivatives)
   - Security validation (Masked Log, token leakage, headers)
   - Routes SSOT compliance
   - Artifacts: logs, screenshots, HTML/JUnit report
4. Manual QA Gate (פעם אחת בלבד) - Console Hygiene, Security Validation, Digital Twin
   - **SOP-010:** כל הרצת דפדפן היא סימולציה אוטומטית (Selenium) - לא בדיקה ידנית

**Gate D - Manual/Visual (בדיקות ידניות אמיתיות):**
- ⚠️ לא חלק מתהליך Team 50
- ⚠️ חלק מהביקורת החיצונית בלבד

**כללי חובה (Team 50) - SOP-010:**
- ✅ **Automation-First** - אין קיצורי דרך
- ✅ **E2E חובה** - Selenium E2E - סימולציה טכנית מלאה
- ✅ **תיקונים עד השלמה** - העברת תיקונים לצוותים עד להשלמה ומעבר חלק
- ✅ **Zero-Deviation** - סטייה = RED מיידי
- ✅ **בדיקות אבטחה חובה** - Masked Log, Token Leakage, Headers
- ✅ **Manual QA Gate (פעם אחת בלבד)** - Console Hygiene, Security Validation, Digital Twin
- ✅ **SOP-010:** כל הרצת דפדפן היא סימולציה אוטומטית (Selenium) - לא בדיקה ידנית
- ✅ **Artifacts חובה:** logs, screenshots, HTML/JUnit report
- ⚠️ **בדיקות ידניות אמיתיות** (על ידי בן אנוש) - אלה חלק מהביקורת החיצונית בלבד

---

**Last Updated:** 2026-02-07  
**Maintained By:** Team 50 (QA)  
**Approved By:** Team 10 (The Gateway) + Team 90 (Spy) + האדריכלית הראשית

---

**log_entry | Team 50 | QA_WORKFLOW_PROTOCOL | STANDARD | GREEN | 2026-01-31**

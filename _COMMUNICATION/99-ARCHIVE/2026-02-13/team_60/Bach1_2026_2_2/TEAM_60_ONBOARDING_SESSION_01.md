# 🚀 חבילת אונבורדינג: צוות 60 (DevOps & Platform) | Session 01

**From:** Team 10 (The Gateway)  
**To:** Team 60 (DevOps & Platform)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Authentication & Identity  
**Status:** 🟢 **ACTIVE - READY TO START**

---

## 🎯 הגדרת תפקיד

**צוות 60 (DevOps & Platform)** הוא ה"אינסטלטור האדריכלי" של פרויקט פיניקס.

**ייעוד:** תשתיות ייצור (Build), סביבות פיתוח ו-Deployment.

**תפקיד מרכזי:** אתם אחראים על כל התשתית הטכנית שמאפשרת לצוותים האחרים לעבוד - Build System, Environment Variables, Routing Infrastructure, Dependency Management, ו-CI/CD.

---

## 📚 מסמכי חובה (Mandatory Reading)

**עליכם לקרוא ולשלוט במלואם לפני תחילת עבודה:**

1. **📖 PHOENIX_MASTER_BIBLE.md**
   - מיקום: `documentation/06-GOVERNANCE_&_COMPLIANCE/standards/PHOENIX_MASTER_BIBLE.md`
   - חוקי הברזל, פרוטוקול כניסה

2. **⚔️ CURSOR_INTERNAL_PLAYBOOK.md**
   - מיקום: `06-GOVERNANCE_&_COMPLIANCE/standards/CURSOR_INTERNAL_PLAYBOOK.md`
   - נהלי עבודה, פורמט דיווח, ארגון קבצים

3. **🗂️ D15_SYSTEM_INDEX.md**
   - מיקום: `D15_SYSTEM_INDEX.md`
   - אינדקס כל התיעוד

4. **🏗️ TT2_TEAM_60_DEFINITION.md**
   - מיקום: `documentation/07-POLICIES/TT2_TEAM_60_DEFINITION.md`
   - הגדרת תפקיד מפורטת ואחריות

5. **🏛️ TT2_MASTER_BLUEPRINT.md**
   - מיקום: `documentation/01-ARCHITECTURE/TT2_MASTER_BLUEPRINT.md`
   - Stack טכני: React 18, Vite, FastAPI, PostgreSQL

6. **📋 TEAM_10_INFRASTRUCTURE_REQUEST.md**
   - מיקום: `_COMMUNICATION/TEAM_10_INFRASTRUCTURE_REQUEST.md`
   - בקשה מיידית לתשתית Frontend (P0 - Blocking)

7. **🎨 TT2_CSS_STANDARDS_PROTOCOL.md**
   - מיקום: `documentation/07-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md`
   - **CRITICAL:** CSS Loading Order חובה (Pico → phoenix-base → phoenix-components → phoenix-header → page-specific)

---

## 🛡️ חוקי ברזל לביצוע (Immutable Laws)

1. **CSS Loading Order:** שמירה מוחלטת על סדר טעינת CSS (לפי CSS Standards Protocol)
2. **Environment Variables:** כל משתנה חייב להיות עם `VITE_` prefix (Vite requirement)
3. **No Code Logic:** אתם יוצרים תשתית בלבד - לא כותבים לוגיקה עסקית
4. **Documentation:** כל תשתית חייבת להיות מתועדת ב-`infrastructure/`
5. **Coordination:** עבודה בסנכרון עם Team 20 (Backend) ו-Team 30 (Frontend)

---

## 📊 מצב עדכני של הפרויקט

### **Phase 1.1 & 1.2: Backend - ✅ COMPLETE**
- ✅ Team 20 סיים את כל משימות Backend
- ✅ 15 API Endpoints מוכנים ומתועדים
- ✅ OpenAPI Spec v2.5.2 מלא ומעודכן
- ✅ JWT Authentication עם Refresh Token Rotation
- ✅ QA Approved - כל Backend עבר בדיקות

### **Phase 1.3: Frontend - ⚠️ BLOCKED ON INFRASTRUCTURE**
- ⚠️ **Team 30 (Frontend) ממתין לתשתית שלכם**
- ✅ Team 31 סיים HTML/CSS Blueprints (D15_LOGIN.html, D15_REGISTER.html, D15_RESET_PWD.html)
- ✅ Team 40 סיים Design Tokens ו-Styles
- ✅ Team 30 כבר יצר Components (LoginForm, RegisterForm, וכו')
- ❌ **חסר:** Build System, Router Infrastructure, Environment Variables

### **צוותים פעילים:**
- ✅ Team 10 (The Gateway) - פעיל
- ✅ Team 20 (Backend) - Phase 1 Complete
- ⚠️ Team 30 (Frontend) - ממתין לתשתית (P0 Blocker)
- ✅ Team 40 (UI Assets) - Complete
- ✅ Team 50 (QA) - פעיל

---

## 🎯 משימות מיידיות (P0 - Blocking)

### **משימה 60.1.1: Frontend Build System Setup**
**עדיפות:** P0 - **BLOCKING Team 30**  
**זמן משוער:** 2-3 שעות  
**מקור:** `_COMMUNICATION/TEAM_10_INFRASTRUCTURE_REQUEST.md`

**תת-משימות:**
- [ ] יצירת `ui/package.json` עם dependencies נדרשים:
  - `react` ^18.2.0
  - `react-dom` ^18.2.0
  - `react-router-dom` ^6.20.0
  - `axios` ^1.6.0
  - `@vitejs/plugin-react` ^4.2.0 (dev)
  - `vite` ^5.0.0 (dev)
- [ ] יצירת `ui/vite.config.js`:
  - React plugin configuration
  - Server port: 3000
  - Proxy `/api` → `http://localhost:8080`
  - Build optimization
- [ ] יצירת `ui/index.html`:
  - Entry point עם `<div id="root"></div>`
  - Pico CSS CDN link (לפי CSS Loading Order)
  - Script tag ל-`/src/main.jsx`

**תוצר:** `ui/package.json`, `ui/vite.config.js`, `ui/index.html`  
**Evidence:** שמור ב-`documentation/05-REPORTS/artifacts_SESSION_01/`

---

### **משימה 60.1.2: Environment Variables Setup**
**עדיפות:** P0 - **BLOCKING Team 30**  
**זמן משוער:** 30 דקות  
**מקור:** `_COMMUNICATION/TEAM_10_INFRASTRUCTURE_REQUEST.md`

**תת-משימות:**
- [ ] יצירת `ui/.env.development`:
  - `VITE_API_BASE_URL=http://localhost:8080/api/v1`
  - `VITE_APP_NAME=TikTrack Phoenix`
  - `VITE_APP_VERSION=2.0.0`
- [ ] יצירת `ui/.env.production`:
  - `VITE_API_BASE_URL=https://api.tiktrack.com/api/v1`
  - `VITE_APP_NAME=TikTrack Phoenix`
  - `VITE_APP_VERSION=2.0.0`
- [ ] יצירת `ui/.env.example` (template)

**תוצר:** `ui/.env.development`, `ui/.env.production`, `ui/.env.example`  
**Evidence:** שמור ב-`documentation/05-REPORTS/artifacts_SESSION_01/`

---

### **משימה 60.1.3: React Router Core Infrastructure**
**עדיפות:** P0 - **BLOCKING Team 30**  
**זמן משוער:** 1-2 שעות  
**מקור:** `_COMMUNICATION/TEAM_10_INFRASTRUCTURE_REQUEST.md`

**תת-משימות:**
- [ ] יצירת `ui/src/router/AppRouter.jsx`:
  - BrowserRouter setup
  - Routes structure (Public + Protected)
  - Default redirects (`/` → `/login`)
  - 404 fallback
- [ ] יצירת `ui/src/main.jsx`:
  - ReactDOM.createRoot setup
  - CSS Loading Order (CRITICAL - לפי CSS Standards):
    1. Pico CSS (CDN - ב-index.html)
    2. phoenix-base.css
    3. phoenix-components.css
    4. phoenix-header.css (if used)
    5. Page-specific CSS (D15_IDENTITY_STYLES.css)
  - AppRouter integration

**תוצר:** `ui/src/router/AppRouter.jsx`, `ui/src/main.jsx`  
**Evidence:** שמור ב-`documentation/05-REPORTS/artifacts_SESSION_01/`

---

### **משימה 60.1.4: Infrastructure Documentation**
**עדיפות:** P1  
**זמן משוער:** 1 שעה

**תת-משימות:**
- [ ] יצירת `ui/infrastructure/README.md`:
  - תיעוד Stack הטכני
  - הסבר על Build Process
  - הסבר על Environment Variables
  - הסבר על Router Structure
- [ ] תיעוד Dependencies:
  - רשימת כל ה-dependencies והסבר למה כל אחד נדרש
  - גרסאות מומלצות

**תוצר:** `ui/infrastructure/README.md`  
**Evidence:** שמור ב-`documentation/05-REPORTS/artifacts_SESSION_01/`

---

## 🔍 Deep Scan נדרש

**לפני תחילת עבודה, עליכם לבצע:**

1. **סריקת Master Blueprint:**
   - `documentation/01-ARCHITECTURE/TT2_MASTER_BLUEPRINT.md`
   - הבנת ה-Stack: React 18, Vite, FastAPI, PostgreSQL
   - הבנת Ports: 8080 (Backend), 3000 (Frontend)

2. **סריקת CSS Standards:**
   - `documentation/07-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md`
   - **CRITICAL:** הבנת CSS Loading Order (חובה!)

3. **סריקת Infrastructure Request:**
   - `_COMMUNICATION/TEAM_10_INFRASTRUCTURE_REQUEST.md`
   - הבנת כל הדרישות הטכניות

4. **סריקת Team 30 Progress:**
   - `_COMMUNICATION/TEAM_30_TO_TEAM_10_PROGRESS_UPDATE.md`
   - הבנת מה Team 30 כבר יצר ומה הוא צריך

---

## 🔗 אינטגרציה עם צוותים אחרים

### **עם Team 20 (Backend):**
- **API Base URL:** `http://localhost:8080/api/v1` (Development)
- **Port:** 8080 (Backend)
- **CORS:** Backend כבר מוגדר ל-CORS (אין צורך בשינויים)

### **עם Team 30 (Frontend):**
- **Port:** 3000 (Frontend Dev Server)
- **Proxy:** `/api` → `http://localhost:8080` (ב-vite.config.js)
- **Components:** Team 30 כבר יצר Components - אתם רק יוצרים את התשתית

### **עם Team 40 (UI Assets):**
- **CSS Files:** כבר קיימים ב-`ui/styles/`
- **Design Tokens:** כבר קיימים ב-`ui/design-tokens/`
- **אתם רק:** מוודאים שה-CSS נטען בסדר הנכון

---

## 📡 תקשורת ודיווח

### **דיווח EOD (End of Day):**
כל יום בסיום העבודה, שלחו ל-Team 10 סיכום:
- מה הושלם היום
- מה מתוכנן למחר
- חסמים או שאלות
- Build errors או בעיות טכניות

### **דיווח סיום משימה:**
לאחר השלמת כל משימה, שלחו:
```text
From: Team 60
To: Team 10 (The Gateway)
Subject: Task Completion | WP-60.1.1
Status: COMPLETED
Evidence: documentation/05-REPORTS/artifacts_SESSION_01/TEAM_60_TASK_60.1.1_EVIDENCE.md
log_entry | [Team 60] | TASK_COMPLETE | 60.1.1 | GREEN
```

### **שאלות:**
- שאלות טכניות → Team 10 (The Gateway)
- שאלות אדריכליות → דרך Team 10 בלבד
- שאלות על Backend → דרך Team 10 → Team 20
- שאלות על Frontend → דרך Team 10 → Team 30

---

## ✅ פרוטוקול "אני מוכן"

**לאחר השלמת הלימוד והסריקה, שלחו הודעה בפורמט הבא:**

```text
From: Team 60
To: Team 10 (The Gateway)
Subject: READINESS_DECLARATION | Status: GREEN
Done: Study of Bible & Index. Deep scan of Infrastructure context, Master Blueprint, CSS Standards, and Infrastructure Request.
Context Check: TT2_MASTER_BLUEPRINT.md, TT2_CSS_STANDARDS_PROTOCOL.md, TEAM_10_INFRASTRUCTURE_REQUEST.md
Next: Ready to start Phase 1.3 infrastructure tasks (60.1.1, 60.1.2, 60.1.3, 60.1.4).
log_entry | [Team 60] | READY | 001 | GREEN
```

---

## 🎯 Priority & Impact

### **P0 (Blocking) - משימות 60.1.1, 60.1.2, 60.1.3:**
**Impact:** Team 30 לא יכול להריץ את הפרויקט ללא תשתית זו.  
**Deadline:** מיידי - Team 30 ממתין.

### **P1 (High) - משימה 60.1.4:**
**Impact:** תיעוד חשוב לתחזוקה עתידית.  
**Deadline:** לאחר השלמת P0 tasks.

---

## 📋 קבצים רלוונטיים

### **מסמכי הגדרה:**
- `documentation/07-POLICIES/TT2_TEAM_60_DEFINITION.md` - הגדרת תפקיד מפורטת
- `06-GOVERNANCE_&_COMPLIANCE/standards/CURSOR_INTERNAL_PLAYBOOK.md` - נהלי עבודה
- `documentation/06-GOVERNANCE_&_COMPLIANCE/standards/PHOENIX_MASTER_BIBLE.md` - חוקי הברזל

### **מסמכי בקשה:**
- `_COMMUNICATION/TEAM_10_INFRASTRUCTURE_REQUEST.md` - בקשה מיידית לתשתית
- `_COMMUNICATION/TEAM_30_TO_TEAM_10_PROGRESS_UPDATE.md` - מצב Team 30

### **מסמכי סטנדרטים:**
- `documentation/07-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md` - **CRITICAL:** CSS Loading Order
- `documentation/01-ARCHITECTURE/TT2_MASTER_BLUEPRINT.md` - Stack טכני

### **מסמכי תקשורת:**
- `_COMMUNICATION/TEAM_10_TO_TEAM_30_INFRASTRUCTURE_RESPONSE.md` - תשובה ל-Team 30
- `_COMMUNICATION/TEAM_10_ROLE_CLARIFICATION.md` - הבהרת תפקיד Team 10

---

## 🚨 הערות חשובות

1. **CSS Loading Order הוא CRITICAL:**
   - Pico CSS חייב להיות ראשון (CDN ב-index.html)
   - phoenix-base.css שני
   - phoenix-components.css שלישי
   - phoenix-header.css רביעי (אם נדרש)
   - Page-specific CSS אחרון
   - **אין לשנות את הסדר הזה!**

2. **Environment Variables:**
   - כל משתנה חייב להיות עם `VITE_` prefix
   - Vite לא יטען משתנים ללא prefix זה

3. **Router Infrastructure:**
   - אתם יוצרים את השלד בלבד
   - Team 30 יוסיף את ה-Components וה-Logic
   - שמרו על Routes בסיסיים: `/login`, `/register`, `/reset-password`, `/dashboard`

4. **Build System:**
   - Vite דורש `type: "module"` ב-package.json
   - Proxy configuration חשוב ל-CORS

---

## 🎯 צעדים הבאים

1. **עכשיו:** התחילו עם משימות P0 (60.1.1, 60.1.2, 60.1.3)
2. **אחרי P0:** המשיכו עם משימה 60.1.4 (תיעוד)
3. **תיאום:** עדכנו את Team 10 כשכל משימה מוכנה
4. **אימות:** ודאו ש-Team 30 יכול להריץ `npm run dev` בהצלחה

---

**Prepared by:** Team 10 (The Gateway)  
**Status:** 🟢 **READY FOR ACTIVATION**  
**Next:** Awaiting READINESS_DECLARATION from Team 60

---

**log_entry | Team 10 | TEAM_60_ONBOARDING | SESSION_01 | GREEN | 2026-01-31**

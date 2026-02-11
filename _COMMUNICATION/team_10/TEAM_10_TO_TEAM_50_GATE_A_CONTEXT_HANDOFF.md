# 📤 Team 10 → Team 50: מסירת קונטקסט מפורט — שער א' (G.2)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 50 (QA)  
**תאריך:** 2026-01-30  
**סטטוס:** 📋 **קונטקסט למסירה — תנאי להרצת שער א'**  
**מקור נהלים:** `documentation/09-GOVERNANCE/standards/TEAM_50_QA_WORKFLOW_PROTOCOL.md` — חובה לקבל עדכון מפורט כולל קונטקסט לפני הפעלת QA.

---

## 1. מה פותח (תוכנית / שלב / צוותים)

| פריט | תיאור |
|------|--------|
| **תוכנית** | סדר עבודה עד שער א' — שלבים 0, 1, 2 (`TEAM_10_ORDER_OF_WORK_UNTIL_GATE_A.md`) |
| **שלב** | שלב 0 (גשר React/HTML), שלב 1 (שער אוטנטיקציה 4 טיפוסים A/B/C/D), שלב 2 (Header אחרי Login → Home) |
| **משימות שהושלמו** | Lock Hybrid, Auth Redirect Rules, routes.json, Header path, React Tables (אין mount per page), איסור Header ב־Containers, Header לפני React; Auth Guard A/B/C/D, Type B (Home = שני containers), User Icon Success/Warning, Admin JWT, Open בלי Header; Header persistence אחרי Login → Home |
| **צוותים** | Team 20 (JWT role), Team 30 (לוגיקה, Guards, Header loader), Team 40 (Header path, User Icon CSS) |

---

## 2. מה נדרש לבדוק (Scope)

### 2.1 Scope בדיקות

| תחום | פריטים |
|------|--------|
| **עמודים** | `/` (Home — Type B: Guest / Logged-in containers), `/login`, `/register`, `/reset-password` (Type A — בלי Header), `/trading_accounts`, `/brokers_fees`, `/cash_flows` (Type C — אורח → Home), `/admin/design-system` (Type D — רק admin) |
| **תזרים** | אורח ב־Home → רואה Guest בלבד; Login → Home → רואה Logged-in; אורח נכנס ל־Type C → redirect ל־Home; לא־admin נכנס ל־/admin/design-system → redirect/403; Header מופיע בכל עמוד מלבד A; Header נשאר אחרי Login → Home |
| **API** | Auth (login, JWT עם שדה `role`); אין שינוי ב־Broker API בשלב זה לצורך שער א' |
| **Gate רלוונטי** | **שער א'** — הרצת סוויטת הבדיקות (E2E וכו'); **0 SEVERE** — תנאי למעבר |

### 2.2 תרחישים לבדיקה (מומלץ)

1. **Type B (Home):** אורח ב־`/` רואה Guest Container בלבד; מחובר רואה Logged-in בלבד; Login → ניווט ל־Home → תצוגה מחליפה ל־Logged-in; אין redirect לאורח ב־Home.
2. **Type A:** `/login`, `/register`, `/reset-password` — ללא Header.
3. **Type C:** אורח מנווט ל־`/trading_accounts` (או דף C אחר) → redirect ל־Home (לא ל־/login).
4. **Type D:** משתמש עם role USER מנווט ל־`/admin/design-system` → redirect ל־Home (או 403); משתמש ADMIN/SUPERADMIN — גישה.
5. **Header:** Header קיים בכל עמוד מלבד A; אחרי Login → מעבר ל־Home — Header נשאר.
6. **User Icon:** מחובר — צבע success; לא מחובר — צבע warning (לא שחור).

---

## 3. קונטקסט (SSOT, Endpoints, הנחיות)

### 3.1 מסמכי SSOT והתוכנית

| מסמך | שימוש |
|------|--------|
| `_COMMUNICATION/team_10/ADR_STAGE0_BRIDGE_AND_REACT_TABLES_SSOT.md` | נעילה Stage 0; Auth 4-Type (§3, §3.1); תיקונים ויזואליים |
| `_COMMUNICATION/team_10/TEAM_10_ORDER_OF_WORK_UNTIL_GATE_A.md` | סדר העבודה עד שער א' |
| `_COMMUNICATION/team_10/TEAM_10_VISUAL_GAPS_WORK_PLAN.md` | תוכנית עבודה מאוחדת; סעיף 4 (אוטנטיקציה), משימה 7 (Header) |
| `_COMMUNICATION/team_10/TEAM_10_GATE_A_VERIFICATION_AND_SIGN_OFF.md` | אימות Team 10 (G.1) — שלבים 0, 1, 2 מאושרים |

### 3.2 דוחות השלמה (Evidence)

| צוות | קובץ |
|------|--------|
| Team 20 | `_COMMUNICATION/team_20/TEAM_20_ADMIN_JWT_ROLE_READINESS.md`, `_COMMUNICATION/team_20/ADMIN_ROLE_MAPPING.md` |
| Team 30 | `_COMMUNICATION/team_30/TEAM_30_STAGE_0_1_COMPLETION_REPORT.md` |
| Team 40 | `_COMMUNICATION/team_40/TEAM_40_HEADER_AND_USER_ICON_COMPLETION.md` |

### 3.3 קבצי קוד רלוונטיים (שונו בשלבים 0–2)

- `ui/src/components/core/authGuard.js` — A/B/C/D, getPageType(), isAdmin(), checkAuthAndRedirect()
- `ui/src/cubes/identity/services/auth.js` — getUserRole(), isAdmin()
- `ui/src/cubes/identity/components/auth/ProtectedRoute.jsx` — requireAdmin, redirect ל־Home
- `ui/src/router/AppRouter.jsx` — route `/admin/design-system`, Home לא ב־ProtectedRoute
- `ui/src/components/admin/DesignSystemDashboard.jsx` — placeholder
- `ui/src/components/core/headerLoader.js` — Header אחרי Login; נתיב unified-header
- `ui/src/views/shared/unified-header.html` — User Icon classes (alert/success)
- `ui/public/routes.json` — routes ללא .html

### 3.4 Endpoints / פורטים (הנחיות)

- **Frontend:** לפי תצורת הפרויקט (Vite/dev server).
- **Backend Auth:** לפי תצורת API (למשל `POST .../api/v1/auth/login`); JWT payload כולל `role` (USER, ADMIN, SUPERADMIN).
- **מקור:** `_COMMUNICATION/team_20/TEAM_20_ADMIN_JWT_ROLE_READINESS.md` — דוגמאות ו־role values.

### 3.5 הנחיות

- **שער א':** הרצת סוויטת הבדיקות (E2E וכו') — **0 SEVERE** — תנאי למעבר.
- **דיווח תקלות:** לפי `TT2_TEAM_50_DEFECT_REPORTING_PROCEDURE` — עדכון ל־Team 10 + דרישת תיקון לצוות הרלוונטי.

---

## 4. אישור Team 10

Team 10 אישר השלמת שלבים 0, 1, 2 (G.1) ומעביר קונטקסט זה ל־Team 50. **מרגע מסירה זו — Team 50 רשאי להפעיל את סוויטת הבדיקות של שער א'.**

---

**Team 10 (The Gateway)**  
**log_entry | GATE_A_CONTEXT_HANDOFF | G2_COMPLETE | 2026-01-30**

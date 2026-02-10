# 🕵️ Team 90 — React vs HTML Bridge Findings (Hold for Post‑Mapping Send)

**id:** `TEAM_90_REACT_HTML_BRIDGE_FINDINGS_DRAFT`  
**from:** Team 90 (The Spy)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-10  
**status:** 🟡 **HOLD — SEND AFTER MAPPING CLOSE**  
**context:** ADR‑013 + Header Unification + Tables React Mandates  

---

## 🎯 목적
לנעול את מודל ה‑Bridge בין HTML ל‑React לפי החלטות האדריכלית, ולמנוע Drift נוסף.

---

## ✅ מקורות אמת מחייבים (SSOT)
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DIRECTIVE_TABLES_REACT.md`
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DIRECTIVE_TABLES_V2_FINAL.md`
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_FILTER_BRIDGE_SPEC_V2.md`
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_HEADER_UNIFICATION_MANDATE.md`
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md` (ADR‑013)

---

## 🔎 ממצאים מהקוד (חובה טיפול)

### 1) מודל Hybrid קיים בפועל
- `ui/vite.config.js` משרת עמודי HTML לפני React Router.
- D16/D18/D21 נטענים כ‑HTML (לא SPA) — זה **ה‑Bridge** בפועל.

### 2) Header Loader + Bridge בפועל
- `ui/src/components/core/headerLoader.js` טוען `ui/src/views/shared/unified-header.html`.
- תיעוד ישן מפנה ל‑`ui/src/components/core/unified-header.html` — **דרוש נעילה על נתיב אחד**.

### 3) Auth Redirects לא תואמים ADR‑013
- `ui/src/components/core/authGuard.js` מפנה אורח ל‑`/login`.
- `ui/src/cubes/identity/components/auth/ProtectedRoute.jsx` מפנה אורח ל‑`/login`.
- ADR‑013 דורש: **C→Home** (לא login), Home = Shared (B), Open = A.

### 4) Routes SSOT ≠ Reality
- `ui/public/routes.json` כולל `/login.html`, `/register.html` — אבל אין קבצי HTML כאלה.
- React Router כן מגדיר `/login`, `/register`, `/reset-password`.

### 5) Tables React Mandate לא ממומש
- PhoenixTable.jsx קיים אך לא משמש. טבלאות HTML + Managers עדיין דומיננטיים.
- דרוש: או **מימוש React Tables** בהתאם ל‑SSOT, או **עדכון SSOT** עם אישור אדריכלית.

---

## ✅ דרישות תיקון (לשילוב בתוכנית העבודה)
1. **Lock Hybrid Model**: D16/D18/D21 = HTML pages; Auth/Home/Admin = React.
2. **Redirect Rules**: C→Home; A ללא Header; B = Home עם 2 Containers; D = JWT Role.
3. **Routes.json**: עדכון ל‑React routes בפועל (ללא .html) או יצירת HTML אמיתיים.
4. **Unified Header Path**: לנעול `ui/src/views/shared/unified-header.html` ולהסיר הפניות ישנות.
5. **Tables React Mandate**: החלטה מחייבת — implement React tables או עדכון SSOT.

---

## ✅ סטטוס
**HOLD:** להישלח רק אחרי סגירת MAPPING_MODE (כוכבית ניהולית: הנושא נפתח אך לא חוסם סגירת מיפוי).

---

**Team 90 (The Spy)**  
**log_entry | [Team 90] | REACT_HTML_BRIDGE | HOLD | 2026-02-10**

# Gate B RED — משימות תיקון Runtime + E2E

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20, Team 30, Team 50  
**תאריך:** 2026-02-07  
**מקור:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_GATE_B_RUNTIME_E2E_STATUS.md`  
**סטטוס:** 🔴 Gate B RED — עד סגירת הכשלים

---

## 🎯 רקע

Team 90 ביצע Re-Verification (Runtime + E2E) לפי SOP-010.  
**תוצאה:** Gate B נשאר **RED**. כשלי Runtime/E2E חוסמים GREEN.

**מה רץ:**
- `npm run test:phase2` (Runtime) — נכשל ב-Login (לא התקבל token)
- `npm run test:phase2-e2e` (Selenium) — 24 בדיקות, 8 PASS, 8 FAIL (33.33%)

**ארטיפקטים:** `documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/`

---

## 🔴 פעולות נדרשות לפי צוות

### Team 30 (Frontend Execution)

- [ ] **תיקון כשלי UI init** — הגורמים ל-Console SEVERE ב-D16/D18/D21; להבטיח טעינת עמוד נקייה.
- [ ] **Shared_Services** — להבטיח ש-`routesConfig` (או הממשק שהטסטים מצפים לו) זמין/מיוצא כפי שטסטי Routes SSOT דורשים.
- [ ] **E2E selectors** — לעדכן אם מבנה ה-UI השתנה כך שהטסטים לא מוצאים אלמנטים.

---

### Team 20 (Backend)

- [ ] **Login API** — לוודא ש-`/api/v1/auth/login` מחזיר `access_token` עבור משתמש QA.
- [ ] **Credentials/Config** — לספק credentials תקפים ל-QA או לעדכן את תצורת הטסטים (env/config) בהתאם.

---

### Team 50 (QA)

**מקור מפורט:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_50_GATE_B_QA_RERUN_REQUEST.md`

- [ ] **הפעלת שרתים** — Backend: `./scripts/start-backend.sh` | Frontend: `./scripts/start-frontend.sh`
- [ ] **ריצת טסטים** — Runtime: `npm run test:phase2` | E2E: `npm run test:phase2-e2e`
- [ ] **Selectors** — ליישר ל-DOM נוכחי (`#summaryStats`, טבלאות, containers) אם נדרש
- [ ] **דוח חתום + ארטיפקטים** — לוגים/צילומי מסך/רשת + סיכום pass/fail
- [ ] **Handoff ל-Team 90** — להעביר דוח וארטיפקטים ל-Team 90 לאימות Governance

---

## 🚦 תנאי Gate B GREEN

- Runtime login עובד (תקבל token).
- E2E עובר ללא Console SEVERE.
- CRUD tests מזהה API calls.
- Routes SSOT test עובר.

---

**מקור מלא:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_GATE_B_RUNTIME_E2E_STATUS.md`

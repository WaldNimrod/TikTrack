# Gate B — מנדט ל-Team 50: ריצת QA חוזרת (Re-Run)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 50 (QA & Fidelity)  
**תאריך:** 2026-02-07  
**נושא:** Gate B — Runtime + E2E Re-Run (לאחר תיקונים)  
**סטטוס:** 🔴 **RE-RUN REQUIRED**

---

## 🎯 רקע

Team 90 ביצע Re-Verification; Gate B נשאר **RED** עקב כשלי Runtime/E2E.  
Team 90 פנה אליכם בבקשה ל-**ריצה חוזרת מלאה** (Runtime + E2E) לאחר תיקוני Team 20/30.

**בקשת Team 90 (מחייבת):**  
`_COMMUNICATION/team_90/TEAM_90_TO_TEAM_50_GATE_B_QA_RERUN_REQUEST.md`

---

## ✅ פעולות נדרשות (חובה)

1. **הפעלת שרתים (סקריפטים סטנדרטיים)**
   - Backend: `./scripts/start-backend.sh`
   - Frontend: `./scripts/start-frontend.sh`

2. **ריצת טסטים**
   - Runtime: `npm run test:phase2`
   - E2E Selenium: `npm run test:phase2-e2e`

3. **עדכון Selectors (אם נדרש)**
   - יישור ל-DOM נוכחי: `#summaryStats`, טבלאות, containers וכו'.

4. **תוצר חתום + ארטיפקטים**
   - דוח ריצה + ארטיפקטים (לוגים, צילומי מסך, network) + סיכום pass/fail.
   - **Handoff ל-Team 90** — להעברת הדוח והארטיפקטים לאימות Governance.

---

## 🚦 Acceptance Criteria (תנאי למעבר ל-GREEN)

- Runtime tests עוברים (login token מתקבל + בדיקות API רצות).
- E2E עובר עם **0 Console SEVERE**.
- CRUD E2E מציג API calls בפועל (לא 0).
- Routes SSOT test עובר.

---

## 📌 קבצים רלוונטיים

- **בקשת Team 90:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_50_GATE_B_QA_RERUN_REQUEST.md`
- **משימות כל הצוותים:** `_COMMUNICATION/team_10/TEAM_10_GATE_B_RUNTIME_E2E_ACTIONS.md`
- **מעקב Gate B:** `_COMMUNICATION/team_10/TEAM_10_GATE_B_ARCHITECT_DECISION_IMPLEMENTATION.md`

**log_entry | [Team 10] | GATE_B | TEAM_50_RERUN_MANDATE_ISSUED | 2026-02-07**

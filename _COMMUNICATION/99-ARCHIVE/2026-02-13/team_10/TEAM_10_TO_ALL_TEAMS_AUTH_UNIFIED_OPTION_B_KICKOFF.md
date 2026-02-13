# 🚫 Team 10 → כל הצוותים: איחוד Auth תחת Shared_Services (Option B) — ביצוע מידי

**מאת:** Team 10 (The Gateway)  
**אל:** צוותים 20, 30, 50  
**תאריך:** 2026-02-10  
**סטטוס:** 🔒 **החלטה מאושרת — חוב לסגירה לפני אישור השער באופן סופי**  
**מקור:** Team 90 (The Spy) — דו"ח החלטה מאושרת (G‑Lead).

---

## 1. הקשר

במהלך הבדיקות עלו שאלות בין הצוותים ו־Team 50, והתגלה **חוב נוסף** — auth לא עובר דרך Shared_Services (axios ישיר), ובנוסף באג ב־refresh (token לא נשמר אחרי apiToReact).  
**החלטה סופית:** Option B — איחוד מלא של כל auth דרך Shared_Services. אין חריגים.

---

## 2. SSOT (נעול)

**מסמך:** `_COMMUNICATION/team_10/SSOT_AUTH_UNIFIED_SHARED_SERVICES_OPTION_B.md`

- Root cause, Evidence, Task Breakdown, Acceptance Criteria — כלול במסמך.

---

## 3. חלוקת משימות — ביצוע מידי

| צוות | מסמך מנדט | תמצית |
|------|-----------|--------|
| **Team 30** | `TEAM_10_TO_TEAM_30_AUTH_UNIFIED_SHARED_SERVICES_MANDATE.md` | החלפת authService — כל auth דרך Shared_Services; endpoints login/register/refresh/users/me/profile; response handling עם apiToReact ו־accessToken; תיקון שמירת token אחרי refresh. |
| **Team 20** | `TEAM_10_TO_TEAM_20_AUTH_CONTRACT_AND_SSOT_MANDATE.md` | חוזה Response אחיד (access_token, token_type, expires_at, user); עדכון OpenAPI/SSOT. |
| **Team 50** | `TEAM_10_TO_TEAM_50_GATE_A_AUTH_QA_UPDATE_MANDATE.md` | עדכון Gate A: auth דרך Shared_Services; response עם access_token; E2E ללא "no token received"; בדיקה ש־token נשמר אחרי refresh; Gate A PASS. |

---

## 4. Acceptance Criteria (משותף)

- אין שימוש ב־axios ישיר עבור auth.
- כל auth endpoints עוברים דרך Shared_Services.
- token נשמר ב־localStorage לאחר login + refresh.
- קונטרקט response אחיד ומאומת ב־QA.
- Gate A חוזר PASS ללא failures.

---

## 5. סדר ביצוע

1. **Team 20** — חוזה + OpenAPI (במקביל או ראשון).  
2. **Team 30** — איחוד auth דרך Shared_Services + תיקון refresh.  
3. **Team 50** — עדכון בדיקות + הרצת Gate A לאחר השלמת 20/30.

---

**Team 10 (The Gateway)**  
**log_entry | AUTH_UNIFIED_OPTION_B_KICKOFF | TO_ALL_TEAMS | 2026-02-10**

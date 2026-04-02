# Team 50 — Selenium E2E Registry (TikTrack)

**מטרה:** אינדקס יעודי לשימוש עתידי — סקריפטים, פקודות הרצה, תלויות, והקשר WP/Gate.

**עדכון אחרון:** 2026-03-21  
**בעלות תיעוד:** Team 50 (`_COMMUNICATION/team_50/` לעדכוני מסלול; קוד ב־`tests/`).

### מינוח מדויק (WP S003-P003-WP001)

| מונח | משמעות |
| --- | --- |
| **העדפות משתמש** | **D39** — `/preferences.html` — **לא** לבלבל עם «הגדרות מערכת». |
| **ניהול מערכת / הגדרות מערכת (מינוח מוצר)** | **D40** — `/system_management.html` — עמוד נפרד מ-D39. |
| **ניהול משתמשים** | **D41** — `/user_management.html` |

שם הקובץ `s003-p003-wp001-system-settings-selenium...` היסטורי; הכיסוי הוא **D39+D40+D41** לפי הטבלה למטה.

---

## תשתית משותפת

| פריט | ערך |
| --- | --- |
| Frontend | `http://127.0.0.1:8080` (`tests/selenium-config.js` → `TEST_CONFIG.frontendUrl`) |
| Backend | `http://127.0.0.1:8082` |
| Chrome | נדרש Chrome + ChromeDriver (או `CHROMEDRIVER_REMOTE=true` + שירות ב־`127.0.0.1:9515`) |
| Headless | `HEADLESS=true` לפני `npm run ...` |

**הפעלת שרתים (מקדים):** `scripts/start-backend.sh` — בדיקת `curl -s http://localhost:8082/health` → 200; UI: `ui` — `npm run dev` על 8080.

---

## רישום סקריפטים

| ID | קובץ | npm script | תוכנית / Gate | הערות |
| --- | --- | --- | --- | --- |
| **E2E-S003-P003-WP001** | `s003-p003-wp001-system-settings-selenium.e2e.test.js` | `npm run test:s003-p003-wp001` | S003-P003-WP001 / GATE_4 §5 | D39 העדפות + `window.TT.preferences`, D40 מבנה+דגלים+trigger job, D41 טבלה, AUTH non-admin |
| **E2E-PHASE2** | `phase2-e2e-selenium.test.js` | `npm run test:phase2-e2e` | Phase 2 / D16-D21 | פורטפוליו/חשבונות וכו' |

---

## משתני סביבה (S003-P003-WP001)

| משתנה | משמעות |
| --- | --- |
| `PHASE2_TEST_USERNAME` / `PHASE2_TEST_PASSWORD` | אדמין (ברירת מחדל: TikTrackAdmin / 4181) |
| `QA_NONADMIN_USER` / `QA_NONADMIN_PASS` | משתמש לא-אדמין לבדיקת guard (ברירת מחדל: qa_nonadmin / qa403test) |
| `RUN_DESTRUCTIVE_D41` | לא בשימוש בגרסה הנוכחית (שמור ל-Promote/Demote בסביבה מבודדת) |

---

## קישורים קנוניים

- דוח GATE_4: `_COMMUNICATION/team_50/TEAM_50_S003_P003_WP001_GATE4_QA_REPORT_v1.0.0.md` (כולל §7 נספח הערות מצטבר)
- מנדט §5: `_COMMUNICATION/team_50/TEAM_50_S003_P003_WP001_GATE4_QA_v1.0.0.md`
- החלטות אדריכלות (מודאל trigger, סביבת QA): `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_00_S003_P003_WP001_ARCHITECT_DECISION_BRIEF_v1.0.0.md`

---

log_entry | TEAM_50 | SELENIUM_E2E_REGISTRY | CREATED | 2026-03-21

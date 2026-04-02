---
id: TEAM_101_LAYER2_PHASE_A_FAILURE_ROOT_CAUSE_AND_REMEDIATION_OPTIONS_v1.0.0
historical_record: true
from: Team 101 (AOS Domain Architect / simulation lane)
to: Team 100 (Gateway), Team 61, Team 51, Team 50
cc: Team 30
date: 2026-03-23
status: FINAL_ANALYSIS
related_tests: tests/pipeline-dashboard-phase-a.e2e.test.js, tests/pipeline-dashboard-smoke.e2e.test.js---

# דוח — כשל L2-PHASE-A (סט 2): שורש בעיה ואופציות פתרון

## 1. תקציר מנהלים

| פריט | ערך |
|------|-----|
| **היקף** | סט בדיקות **Layer 2** (קטלוג Team 101): `L2-SMOKE` + `L2-PHASE-A` |
| **תוצאה** | **L2-SMOKE — PASS** · **L2-PHASE-A — FAIL** |
| **שורש (מאושר בקוד)** | הטסט מניח ש־`#files-badge` יגיע לפורמט מספרי `n/m`, בעוד שהממשק (במצב WP סגור) מציג **`N/A`** — התנהגות **מכוונת** ב־`checkExpectedFiles()` |
| **סיווג** | **Drift בין תנאי אוטומציה לבין חוזה UI/מצב pipeline** — לא רגרסיית פונקציונליות “שבורה” בדשבורד |
| **המלצה קצרה** | לעדכן את טסט Phase A (או להזרים מצב WP פעיל בבידוד) — ראו §5 |

---

## 2. הקשר והגדרות

### 2.1 מהו “סט 2”

לפי `TEAM_101_SIMULATION_TEST_CATALOG_v1.0.0.md`:

- **Layer 2 — dashboard (8090 + Selenium)**  
  - **L2-SMOKE:** `cd tests && HEADLESS=true npm run test:pipeline-dashboard-smoke`  
  - **L2-PHASE-A:** `cd tests && HEADLESS=true npm run test:pipeline-dashboard-phase-a`  

**תנאי־קדם:** `./agents_os/scripts/start_ui_server.sh` (פורט 8090).

### 2.2 תוצאות הרצה (מאומתות בסשן אבחון)

| בדיקה | פלט | הערות |
|--------|-----|--------|
| L2-SMOKE | `PIPELINE_DASHBOARD_SMOKE: PASS` | כולל מעבר דומיין TikTrack ↔ Agents OS, באנר, מנדטה בסיסית |
| L2-PHASE-A | `PIPELINE_PHASE_A: FAIL` + `Wait timed out after ~20000ms` | כשל עקב wait על `files-badge` |

**הרצה מקבילה** של שני הטסטים עלולה לייצר `ECONNREFUSED 127.0.0.1:9515` — שני תהליכי Node מנסים להקים ChromeDriver על **פורט קבוע** (9515) ב־`tests/selenium-config.js`. להרצה יציבה: **רצף** (Smoke ואז Phase A) או פורט/שירות נפרד לכל ריצה.

---

## 3. ניתוח שורש הבעיה (Root Cause)

### 3.1 איפה נכשל הטסט

ב־`pipeline-dashboard-phase-a.e2e.test.js` יש wait שמחייב תבנית מספרית בבאג׳ הקבצים:

```63:66:tests/pipeline-dashboard-phase-a.e2e.test.js
    await driver.wait(async () => {
      const badge = await driver.findElement(By.id('files-badge')).getText();
      return /\d+\s*\/\s*\d+/.test(badge);
    }, 20000);
```

כל עוד `badge` **אינו** תואם ל־`/^\d+\s*\/\s*\d+/` (למשל מחרוזת כמו `3/5` בלי טקסט נוסף — ה־regex בפועל בודק תת־מחרוזת), ה־`driver.wait` ימשיך עד **תום 20 שניות** ואז יזרוק timeout.

### 3.2 מה הממשק באמת עושה במצב “אין WP פעיל / סגור”

ב־`agents_os/ui/js/pipeline-dashboard.js`, פונקציית `checkExpectedFiles()` מטפלת במפורש במצב שבו **אין בדיקת קבצים רלוונטית**:

```1888:1894:agents_os/ui/js/pipeline-dashboard.js
  const gate = pipelineState?.current_gate || "";
  if (gate === "COMPLETE" || gate === "NONE" || !gate) {
    list.innerHTML =
      '<div style="color:var(--text-muted);font-size:12px;padding:4px 0">⚪ No active work package — file checks not applicable</div>';
    const badge = document.getElementById("files-badge");
    if (badge) badge.textContent = "N/A";
    return;
  }
```

כאשר `current_gate` הוא למשל **`COMPLETE`** (כפי שמופיע ב־`pipeline_state_tiktrack.json` עבור WP אחרון שסומן כסגור), הבאג׳ הופך ל־**`N/A`** — לא ל־`n/m`.

### 3.3 למה L2-SMOKE עובר ו־Phase A נכשל

- **Smoke** בודק טעינה, רצועת WP, באנר, מנדטה, מעבר דומיין — **בלי** לחייב פורמט מספרי ב־`files-badge`.
- **Phase A** נועד להרחיב כיסוי ל־`dashboard-wp-gate-strip`, באג׳ קבצים, רשימת קבצים ו־`expected-file-row` — אבל **קושר** את הצלחת השלב לתבנית `n/m` ש**לא מתקיימת** כשהמערכת במצב **לגיטימי** של “WP סגור”.

### 3.4 מסקנת שורש

**הכשל אינו מעיד על “דשבורד שבור” בהכרח**, אלא על **אי־התאמה בין**:

1. **מצב נתונים קנוני נוכחי** (TikTrack: `current_gate: COMPLETE` ל־WP אחרון), לבין  
2. **הנחת הטסט** שדורשת מצב כאילו יש **שער פעיל** עם סריקת קבצים וספירה `found/total`.

זה **דrift ספציפי לבדיקה**, לא הוכחת regression פונקציונלי גורפת (אלא אם כן ההחלטה העסקית היא ש־Phase A **חייב** תמיד לרוץ מול WP פעיל בלבד — אז יש לבדוק **fixture** ולא את הדשבורד בלייד).

---

## 4. גורמים לווי (Contributing Factors)

| גורם | הסבר |
|------|------|
| **פורט ChromeDriver קבוע (9515)** | שני טסטים במקביל = סיכון ל־`ECONNREFUSED` / תחרות על אותו שירות. |
| **מצב repo דינמי** | `pipeline_state_*.json` משתנה עם התקדמות עבודה; טסט שלא מבודד מצב עלול “להתיישן” מבחינת הנחות. |
| **אי־תיעוד במקור הטסט** | אין בכותרת הטסט אזהרה מפורשת ש־Phase A דורש `current_gate` ∉ {COMPLETE, NONE, ריק}. |

---

## 5. אופציות פתרון

### אופציה A — עדכון הטסט (מומלץ לזריזות)

**מה:** להרחיב את תנאי ה־wait על `files-badge` כך שיקבל גם:

- פורמט `n/m` (מצב פעיל), **או**
- `N/A` **כאשר** אומת מראש שהשער הוא `COMPLETE` / `NONE` / ריק (למשל קריאת טקסט מ־`#s-gate-pill` או משדה gate בדף), **או**
- מצב “לא רלוונטי” עם הודעה ברשימה (טקסט “file checks not applicable”).

**יתרונות:** מהיר; לא משנה SSOT; מתאים להנחיית Team 00 ש־GAP-002 וכו' לא חוסמים — כאן זה התאמת אוטומציה למצב סגירה לגיטימי.  
**חסרונות:** Phase A כבר לא “מוכיח” ספירת קבצים כשהמצב סגור — צריך סעיף נפרד/טסט אחר למצב פעיל.

---

### אופציה B — בידוד מצב (fixture / query param)

**מה:** להריץ את Phase A מול **מצב pipeline קבוע** (למשל העתק `pipeline_state` ל־mock, או פרמטר URL תיעודי שמטעין WP פעיל לבדיקות בלבד — **רק אם** קיים מנגנון כזה בשרת הסטטי או ב־build לבדיקות).

**יתרונות:** הטסט נשאר “קשוח” על `n/m` כשיש WP פעיל.  
**חסרונות:** דורש תשתית נוספת; סיכון לסטייה מזרימת המפעיל האמיתית אם ה־fixture לא מתוחזק.

---

### אופציה C — שינוי מוצר (לא מומלץ כברירת מחדל)

**מה:** לשנות את `checkExpectedFiles` כך שגם ב־`COMPLETE` יוצג משהו בפורמט `0/0 found` במקום `N/A`.

**יתרונות:** הטסט הישן עובר בלי שינוי.  
**חסרונות:** **שינוי סמנטי בממשק** — `N/A` מבהיר שלא רלוונטי; `0/0` עלול לבלבל מפעילים; דורש אישור UX (Team 30) ו־QA.

---

### אופציה D — פיצול טסטים

**מה:**

- **Phase A-Active:** דורש `n/m` + שורות קבצים — רץ רק ב־CI nightly עם fixture / סביבה עם WP פעיל.  
- **Phase A-Closed:** בודק רק ש־`files-badge` הוא `N/A` ורשימה מציגה “not applicable” כשהשער סגור.

**יתרונות:** כיסוי מפורש לשני המצבים.  
**חסרונות:** שני קבצים/סקריפטים לתחזוקה.

---

## 6. המלצת Team 101

1. **לממש מיד אופציה A או D** — ללא שינוי התנהגות מוצר בלי אישור UX.  
2. **לתעד בקטלוג הבדיקות** ש־L2-PHASE-A תלוי במצב gate (או ב־fixture).  
3. **ב־CI:** להריץ Layer 2 ברצף, לא במקביל, או להפוך את פורט ה־ChromeDriver לדינמי/לפי PID בעתיד (נפרד מדוח זה).

---

## 7. הפניות

- קטלוג: `TEAM_101_SIMULATION_TEST_CATALOG_v1.0.0.md`  
- פערים מחקריים (הקשר GAP / סימולציה): `TEAM_101_PIPELINE_SIMULATION_RESEARCH_GAP_ANALYSIS_v1.0.0.md`  
- קונפיג Selenium: `tests/selenium-config.js` (פורט 9515)

---

**log_entry | TEAM_101 | LAYER2_PHASE_A | ROOT_CAUSE_REPORT | 2026-03-23**

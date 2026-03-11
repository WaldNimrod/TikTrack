# Team 10 | שער פיתוח מקדמי — בקשות השלמת מידע והחלטות

**project_domain:** TIKTRACK  
**id:** TEAM_10_PRE_DEVELOPMENT_GATE_AND_INFORMATION_REQUESTS  
**from:** Team 10 (The Gateway / Orchestrator)  
**to:** Nimrod, Team 00, Team 90, Team 20, Team 30, Team 50, Team 60  
**date:** 2025-01-30  
**status:** **GATE CLOSED** — ממתין להשלמות לפני אישור פיתוח  

---

## 0) עקרון Team 10 — שער חכם

**Team 10** הוא צומת מרכזי ואורקסטראטור של תהליך הפיתוח.  
חובתנו להבטיח **אפיון מדויק וסגור** לפני אישור יציאה לדרך — ללא הנחות, ללא ניחושים, **בתאום מלא בין הצוותים**.

**סטטוס נוכחי:** אין אישור לצאת לפיתוח עד לקבלת כל ההשלמות וההחלטות המפורטות להלן.

---

## 1) סיכום פערים והחלטות נדרשות

| דומיין | פערי מידע | החלטות אדריכליות | מסמך בקשה |
|--------|-----------|-------------------|------------|
| **מחירים ונתוני שוק** | price_source/null, current vs last_close, TASE אגורות, מתי להמיר | איפה להמיר TASE — Backend vs Frontend; לוגיקת current/last_close | GIN-001 |
| **סטטוס טיקר** | status vs is_active — מיפוי מלא; הגדרת "טיקרים פעילים" בסיכום | יישור לסיכום — מה לספור; מקרא טקסט סופי | GIN-002 |
| **תפריט פעולות** | מפרט UX מדויק — hover vs click; delay; שטחים | החלטה: hover-only או click-to-open | GIN-003 |
| **עמוד ניהול מערכת** | רשימת תרחישי Runtime; מבנה היסטוריה; API למשימות; נוסחת עומס | מיפוי תרחישים ל־UI; סכמת job_run_history; נוסחת מכוון חום | GIN-004 |
| **Market Data Settings** | גבולות SSOT מלאים; reglas ולידציה; המלצות | טבלת validation_errors; נוסחת המלצות | GIN-005 |
| **אוטומציה / QA** | רשימת E2E assertions; הגדרת PASS runtime | מתי להוסיף לאוטומציה; סדר עדיפויות | GIN-006 |

---

## 2) מסמכי בקשה מפורטים

| מזהה | נושא | נמענים | קובץ |
|------|------|---------|------|
| **GIN-001** | מחירים — current/last_close, TASE, price_source | Team 20, 30, 00 | `TEAM_10_GIN_001_PRICE_AND_MARKET_DATA_CLARIFICATIONS.md` |
| **GIN-002** | סטטוס טיקר — status/is_active, סיכום, מקרא | Team 20, 30, 00 | `TEAM_10_GIN_002_TICKER_STATUS_AND_SUMMARY_CLARIFICATIONS.md` |
| **GIN-003** | תפריט פעולות — UX מפרט | Team 30, 00 | `TEAM_10_GIN_003_TABLE_ACTIONS_MENU_UX_SPEC.md` |
| **GIN-004** | עמוד ניהול מערכת — תרחישים, היסטוריה, משימות | Team 30, 20, 60, 90 | `TEAM_10_GIN_004_SYSTEM_MANAGEMENT_SPEC_COMPLETIONS.md` |
| **GIN-005** | Market Data — גבולות, ולידציה, המלצות | Team 20, 30 | `TEAM_10_GIN_005_MARKET_DATA_SETTINGS_SPEC.md` |
| **GIN-006** | אוטומציה — runtime assertions, הגדרות | Team 50, 90 | `TEAM_10_GIN_006_QA_AUTOMATION_SPEC_COMPLETIONS.md` |

---

## 3) תנאי פתיחת השער

| # | תנאי | בעלים |
|---|------|-------|
| 1 | קבלת תשובות מפורטות לכל GIN-001 עד GIN-006 | Nimrod / Architects |
| 2 | עדכון אפיונים/SSOT לפי התשובות | Teams 00, 90 |
| 3 | Team 10 מאשר "READY FOR DEVELOPMENT" במסמך נפרד | Team 10 |
| 4 | חבילת עבודה ממוספרת (Task List) עם תלותיות ו־acceptance criteria | Team 10 |

**עד שלא מתקיימים כל התנאים — אין אישור לפיתוח.**

---

## 4) לוג החלטה

| timestamp | פעולה |
|-----------|-------|
| 2025-01-30 | Team 10: יצירת מסמך שער; 6 GINים; GATE CLOSED |

---

**log_entry | TEAM_10 | PRE_DEVELOPMENT_GATE | GIN_PACKAGE_CREATED | 2025-01-30**

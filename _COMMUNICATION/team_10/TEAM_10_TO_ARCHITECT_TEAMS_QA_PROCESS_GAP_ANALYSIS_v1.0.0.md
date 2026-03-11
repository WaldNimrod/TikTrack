# Team 10 → צוותים אדריכליים | ניתוח כשל בתהליכי QA

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_ARCHITECT_TEAMS_QA_PROCESS_GAP_ANALYSIS  
**from:** Team 10 (The Gateway)  
**to:** Team 90 (GATE_7), Team 50 (QA), Team 00 (Architect)  
**date:** 2025-01-30  
**historical_record:** true
**status:** HANDOFF — לטיפול בערוץ נפרד  
**context:** S002-P002-WP003 GATE_7 | משוב Nimrod (סעיף 2.5)

---

## 0) מטרת המסמך

מסמך זה מתאר **כשל שזוהה בתהליכי ה־QA** — הפער בין אימות סטטי (קוד) לאימות בזמן ריצה (runtime).  
המסמך מיועד לצוותים האדריכליים לצורך **טיפול בערוץ נפרד**. הצוות המקומי ימשיך בתיקון הקוד והחבילה הפעילה.

---

## 1) סיכום הכשל

| היבט | תיאור |
|------|--------|
| **כשל** | בדיקות אוטומטיות (AUTO-WP003-01/02) מאמתות **binding בקוד** בלבד — לא **נוכחות נתונים בזמן ריצה**. |
| **תוצאה** | באגים ברורים (עמודות מקור/עודכן ב מציגות "—"; רמזור אדום לכולם) **לא נתגלו** באוטומציה. |
| **גילוי** | רק בבדיקה אנושית (GATE_7 Human, Nimrod). |

---

## 2) דוגמאות קונקרטיות

### דוגמה 1 — עמודות מקור + עודכן ב

| בדיקה | מה אומת | מה לא אומת |
|-------|---------|-------------|
| **AUTO-WP003-01** | `tickersTableInit.js` מכיל `sourceCell` ו־`asOfCell` עם `getPriceSourceLabel` / `formatPriceAsOf` | האם ה־API מחזיר `price_source` ו־`price_as_of_utc`? האם התאים מציגים ערך ≠ "—"? |
| **תוצאה** | PASS (binding קיים) | **בהריצה:** התאים מציגים "—" — כי ה־API מחזיר null |

**קוד רלוונטי:**
```javascript
// tickersTableInit.js — שורות 155-171
sourceCell.textContent = getPriceSourceLabel(priceSource) || '—';
asOfCell.textContent = priceAsOf ? formatPriceAsOf(priceAsOf) : '—';
```
כאשר `priceSource` או `priceAsOf` הם null — התצוגה היא "—". האוטומציה לא בודקת שזה לא קורה.

---

### דוגמה 2 — רמזור אדום לכולם

| בדיקה | מה אומת | מה לא אומת |
|-------|---------|-------------|
| **AUTO-WP003-01/07** | `getTrafficLightFromSource(priceSource)` קיים; traffic-light class מקושר ל־col-symbol | האם לפחות טיקר אחד מציג רמזור ירוק או צהוב? |
| **לוגיקה** | `price_source` null → רמזור אדום (`priceReliabilityLabels.js`) | כשכל הטיקרים עם `price_source=null` — כולם אדומים. אין assertion על פילוח הצבעים. |

**קוד רלוונטי:**
```javascript
// priceReliabilityLabels.js
export function getTrafficLightFromSource(source) {
  if (!source) return 'red';
  if (source === 'EOD') return 'green';
  // ...
}
```

---

### דוגמה 3 — R2 דיווח — אך לא regression

| שלב | ממצא | מסקנה |
|-----|------|--------|
| **R2 QA (TEAM_50_GATE7_R2_QA_REPORT)** | 1.1 PARTIAL — "When null → '—'"; 1.2 BLOCK — "price_source=null → red" | הממצאים **נתגלו** |
| **אופן ביצוע** | MCP session + API checks — **ידני** | לא חלק מ־regression automation |
| **Pre-Human (AUTO-WP003)** | Code inspection — PASS | לא ריצה חוזרת של assertions אלו |

הממצאים נזנחו בין R2 ל־Pre-Human כי האוטומציה שינתה מפרשנות ל־"runtime OK" ל־"binding OK".

---

## 3) הפער המבני

```
┌─────────────────────────────────────────────────────────────────────┐
│ AUTO-WP003-01/02: "השדות קיימים וקושרים נכון" (code inspection)      │
│ → PASS אם הקוד מכיל sourceCell, asOfCell, getPriceSourceLabel...     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ חסר
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Runtime assertion: "לפחות X טיקרים מציגים מקור ≠ '—' ועודכן ב ≠ '—'" │
│ Runtime assertion: "לא כל הרמזורים אדומים"                           │
└─────────────────────────────────────────────────────────────────────┘
```

| סוג אימות | קיים? | מקום |
|-----------|--------|------|
| Binding בקוד | כן | AUTO-WP003-01, 02 |
| Runtime: ערכי תצוגה | לא | — |
| Human scenarios (S7-WP003-01) | כן — ידני | GATE_7 Human Approval |

---

## 4) המלצות

### 4.1 הגדרת בדיקות (Team 90, Team 50)

| המלצה | תיאור |
|-------|--------|
| **R1** | עדכן AUTO-WP003-01: "binding **ובנוסף** runtime data presence — לפחות 3 סמלים עם מקור ועודכן ב לא ריקים". |
| **R2** | הוסף AUTO-WP003-xx: "Traffic light distribution — לא כל הרמזורים אדומים (או: ≥1 ירוק/צהוב מתוך סמלי דוגמה)". |
| **R3** | הכלל שווה־ערך ל־S7-WP003-01 באוטומציה: "3/3 sampled symbols show full transparency set". |

### 4.2 יישום (Team 50)

| המלצה | תיאור |
|-------|--------|
| **R4** | E2E (Selenium/Playwright/MCP): ניווט ל־`/tickers` → assert עמודת "מקור" ≠ "—" עבור ≥1 שורה. |
| **R5** | E2E: assert עמודת "עודכן ב" ≠ "—" עבור ≥1 שורה. |
| **R6** | E2E: assert קיים ≥1 `.traffic-light--green` או `.traffic-light--yellow` (לא כולם red). |

### 4.3 תהליך (Team 00, Team 90)

| המלצה | תיאור |
|-------|--------|
| **R7** | הבחנה מפורשת: "code binding OK" ≠ "runtime data OK" — במסמכי gate ו־check definition. |
| **R8** | Pre-Human gate: דרישת runtime assertions כחלק מ־AUTO-WP003, לא רק code inspection. |

---

## 5) מסמכים רלוונטיים

| מסמך | שימוש |
|------|--------|
| `TEAM_50_TO_TEAM_90_S002_P002_WP003_G7_PREHUMAN_UI_AUTOMATION_REPORT_v1.0.0.md` | עדות למה נבדק (binding) |
| `TEAM_50_TO_TEAM_10_S002_P002_WP003_GATE7_R2_QA_REPORT.md` | דוגמה לממצאים שנתגלו בידני |
| `TEAM_10_NIMROD_S002_P002_WP003_G7_PRELIMINARY_FEEDBACK_v1.0.0.md` | מקור המשוב (סעיף 2.5) |
| `ui/src/views/management/tickers/tickersTableInit.js` | קוד binding |
| `ui/src/utils/priceReliabilityLabels.js` | לוגיקת traffic light |

---

## 6) סטטוס

**HANDOFF** — המסמך מועבר לטיפול בערוץ נפרד.  
הצוות המקומי מתמקד בתיקון הקוד והחבילה הפעילה (S002-P002-WP003).

---

**log_entry | TEAM_10 | QA_PROCESS_GAP_ANALYSIS | TO_ARCHITECT_TEAMS | HANDOFF | 2025-01-30**

---
id: TEAM_100_AOS_V3_MOCKUP_SYNTHESIS_AND_NEXT_STEP_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 00 (System Designer / Nimrod)
cc: Team 31, Team 51, Team 11
date: 2026-03-27
type: SYNTHESIS + NEXT_STEP_RECOMMENDATION
subject: AOS v3 Mockup — סינתזת כל המקורות + המלצת צעד הבא
sources:
  - TEAM_100_AOS_V3_MOCKUP_GAP_ANALYSIS_v1.0.0.md (Team 100, ניתוח ממשקים)
  - TEAM_31_TO_TEAM_100_AOS_V3_MOCKUP_COMPREHENSIVE_STATUS_v1.0.0.md (Team 31, מצב מוקאפ)
  - TEAM_31_AOS_V3_PIPELINE_OPERATOR_NEXT_ACTION_UI_PROPOSAL_v1.0.0.md (Team 31, הצעת Operator Handoff)
  - TEAM_51_AOS_V3_MOCKUP_QA_REPORT_v1.0.2.md (Team 51, PASS)
  - סריקה ישירה של כל 5 דפי המוקאפ
  - agents_os_v2/orchestrator/pipeline.py + context/injection.py---

# סינתזה + המלצת צעד הבא — AOS v3 Mockup

---

## 1. מה הודגש מדוח Team 31 — דברים שמשנים את ניתוח הפערים

**עובדה קריטית שלא היתה ברורה מסריקת הממשק בלבד:**

**Team 51 כבר הוציא PASS v1.0.2** — כלומר המוקאפ עבר QA מסודר. חלק מ-12 הממצאים ה-MAJOR בדוח הפערים שלנו (v1.0.0) ייתכן ותוקנו. פירוש: ניתוח הפערים מייצג תמונת מצב לפני עדכוני QA.

**מה Team 31 הוסיף שחשוב לנו:**

1. **Operator Handoff הוא הצעה רשמית** — לא באג, לא דריפט. Team 31 בנה אותו ביודעין, מתעד אותו כ"טיוטה לביקורת", ומפנה לקובץ הצעה נפרד. הם מבקשים החלטה מוצרית.

2. **9 מתוך 15 סוגי אירועים אינם מיוצגים בשורות המוקאפ** — filter dropdown כולל את כולם (TC-M09 PASS), אבל ב-`MOCK_HISTORY.events` מופיעים רק: RUN_INITIATED, PHASE_PASSED, GATE_FAILED_BLOCKING, GATE_FAILED_ADVISORY, GATE_APPROVED, CORRECTION_RESUBMITTED. חסרים: GATE_PASSED, RUN_COMPLETED, CORRECTION_ESCALATED, CORRECTION_RESOLVED, RUN_PAUSED, RUN_RESUMED, RUN_RESUMED_WITH_NEW_ASSIGNMENT, PRINCIPAL_OVERRIDE, ROUTING_FAILED.

3. **אי-עקביות דמו:** preset "CORRECTION + escalated" מציג באנר בהתבסס על `latest_event_type`, אך אין שורת `CORRECTION_ESCALATED` בלדג'ר עצמו — הבאנר "תלוי באוויר".

4. **Team 31 שואל 4 שאלות אדריכליות** שצריכות תשובה לפני שממשיכים.

---

## 2. עדכון סטטוס ממצאים מדוח הפערים (v1.0.0)

### ממצאים שעשויים להיות מתוקנים (QA PASS v1.0.2 — לאמת ב-TC ספציפי):

| ממצא | מקורי | עדכון |
|------|-------|--------|
| PO-01/03: domain_id מציג "domain_id" | MAJOR | **לאמת** — Team 51 CC-round v1.0.2 אמור לכסות mock data fixes |
| PO-02: Ideas inline actions לכל הסטטוסים | MAJOR | **לאמת** — TC-M20-11 בבדיקות Team 51 |
| H-02: GATE_4/GATE_5 חסרים בפילטר | MINOR | **לאמת** |
| C-01: Routing rules ריק | MAJOR | **לאמת** |
| T-01: Copy Full Context בתחתית | MAJOR | **לאמת** — mandate קבע "primary, top right" |
| T-02: שכבות L1-L4 חתוכות | MAJOR | **לאמת** |

### ממצאים שלא מכוסים בבדיקות QA (Team 51 לא בדק — מחוץ לתחום TC הנוכחיות):

| ממצא | ID | מדוע לא בQA |
|------|-----|-------------|
| אין שדה verdict/reason לפני Advance/Fail | X-02/P-02 | לא נכלל ב-TC-M01 עד M25 |
| CORRECTION אינה מציגה blocking findings | X-03 | לא נכלל ב-TC |
| H-01: אין run_id filter בHistory | H-01 | TC-M09 לא בדק פילטר run_id |
| Operator Handoff: אין spec backing | X-01/P-01 | מחוץ לתחום QA |
| אי-עקביות CORRECTION_ESCALATED בלדג'ר | Team 31 §7.3 | חדש מדוח Team 31 |
| 9 סוגי אירוע לא מיוצגים בשורות | Team 31 §7.2 | חדש מדוח Team 31 |

---

## 3. ניתוח: מה חסר אדריכלית לפני BUILD

### קבוצה A — פערים שדורשים **ספציפיקציה** (Stage 8B micro-amendment)

| פריט | הסבר |
|------|-------|
| **§6.1.D — Operator Handoff (X-01)** | הממשק הכי חשוב בכל הדשבורד. Team 31 מימש טיוטה, מבקש spec. נדרשת הגדרת: (1) "Previous" = last ledger event for run_id [GET /api/history?run_id=X&limit=1]; (2) "Next" = rule-based from {status, is_human_gate, actor_engine}; (3) CLI command = POST /api/runs/{run_id}/{action} עם כלל-הבנייה; (4) fallback text כשאין active run. |
| **§6.1.E — Verdict/Reason input (X-02)** | `POST /api/runs/{run_id}/advance` ו-`/fail` דורשים body fields: `summary` (optional) ל-advance, `reason` (required) ל-fail + findings_notes (optional). UI: inline textarea או modal לפני submit. |
| **§6.1.F — CORRECTION blocking findings display (X-03)** | כשstatus=CORRECTION: section "Blocking findings" = last GATE_FAILED_BLOCKING event's `reason` + `verdict` מ-GET /api/history?run_id=X&event_type=GATE_FAILED_BLOCKING&limit=1 |
| **§6.2 History — run_id filter (H-01)** | הוספת פרמטר run_id לפילטרים. Portfolio's "View History" → navigates to `/history?run_id=X`. |
| **§7 integration tests** | TC-IT-15: Operator Handoff renders correct "next" action per status; TC-IT-16: advance with reason persists to events; TC-IT-17: CORRECTION state shows last GATE_FAILED_BLOCKING reason |

### קבוצה B — פערי דמו שדורשים **תיקון מוקאפ** (Team 31 — לא spec חדש)

| פריט | פעולה |
|------|--------|
| 9 סוגי אירוע לא מיוצגים בלדג'ר | הוסף 2-3 שורות ל-`MOCK_HISTORY.events` שמכסות: GATE_PASSED, RUN_PAUSED/RESUMED, PRINCIPAL_OVERRIDE |
| CORRECTION_ESCALATED: אי-עקביות בין באנר ללדג'ר | הוסף שורת `CORRECTION_ESCALATED` ל-`MOCK_HISTORY` כשpreset = escalated |
| mock data domain_id (אם לא תוקן ב-QA) | תקן ערכי תאים |
| Ideas inline actions (אם לא תוקן ב-QA) | הגבל כפתורי Approve/Reject/Defer ל-NEW/EVALUATING בלבד |

### קבוצה C — שאלות Team 31 — תשובות (ראה §4 למטה)

---

## 4. תשובות לשאלות Team 31 (§9 בדוח שלהם)

**שאלה 1: האם Operator Handoff נכנס כדרישה חובה?**

**תשובה: כן — חובה, Stage 8B.** זהו הגשר בין "מה הפיפליין יצר" ל"מה המפעיל עושה". ראה §3 קבוצה A לעיל — הגדרה מלאה דרושה לפני BUILD. ה-UX שמימש Team 31 מאושר כטיוטה נכונה.

**שאלה 2: לוג ריצה — GetHistory בלבד או מצב מקוצר?**

**תשובה: GetHistory בלבד** עם `run_id` filter. `GET /api/history?run_id={run_id}&order=desc&limit=50`. אין endpoint נפרד "current run events" — History API מספיק. עמודות חובה בלוג הריצה: seq (מספר רץ), occurred_at, event_type, gate/phase, actor, verdict, reason.

**שאלה 3: האם צריך מיפוי 1:1 בין preset escalated לשורת CORRECTION_ESCALATED?**

**תשובה: כן — עקביות מחייבת.** כשpreset = escalated, הלוג חייב להכיל שורת `CORRECTION_ESCALATED`. אחרת המשתמש רואה באנר ללא ראיה בלדג'ר — זה מטעה. Team 31 מוסיף שורה ל-`MOCK_HISTORY` כשzסצנריה זו פעילה.

**שאלה 4: האם דרושים אירועים חדשים לACK מפעיל / ingestion?**

**תשובה: לא — 15 האירועים הקיימים מספיקים.** "אישור CLI" של המפעיל מתועד דרך `POST /api/runs/{run_id}/advance` שמייצר `PHASE_PASSED` או `GATE_PASSED` — שמשמעותם "המפעיל אישר". אין צורך באירוע `OPERATOR_ACK` נפרד. אם בעתיד תהיה אינטגרציה פולטה-פוש, ניתן להוסיף דרך `payload_json` לאירועים קיימים.

---

## 5. המלצת צעד הבא — Stage 8B Micro-Amendment

### הגדרה

Stage 8B = ספציפיקציה מינימלית שמשלימה את פערי ה-Operator Experience לפני BUILD. **לא** spec stage חדש מלא — micro-amendment ממוקד.

### היקף Stage 8B

| פריט | תוצר |
|------|-------|
| §6.1.D — Operator Handoff | fields, rules, API sources, fallback text |
| §6.1.E — Verdict/Reason input | UI form spec + `POST /advance` body extension |
| §6.1.F — CORRECTION findings display | section spec + API source |
| §6.2 — History run_id filter | filter field + Portfolio navigation |
| §4.12 amendment — GET /api/history | הוספת `run_id` query param לחוזה |
| §4.2 amendment — POST /api/runs/{id}/advance | הוספת `summary` field לbody |
| §4.3 amendment — POST /api/runs/{id}/fail | validation: `reason` required |
| §7 — 3 integration tests חדשים (TC-IT-15/16/17) | |

### בעלים

| שלב | צוות | תוצאה |
|-----|-------|--------|
| 1. Stage 8B spec | Team 100 | `TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.0.md` |
| 2. Review | Team 190 | PASS |
| 3. Gate approval | Team 00 | אישור |
| 4. Mockup update | Team 31 | 3 sections חדשות + mock data fixes |
| 5. QA | Team 51 | TC matrix מורחב |
| 6. Team 00 UX review | Team 00 | sign-off סופי |
| 7. **BUILD begins** | Teams 21/61/11 | — |

---

## 6. מה שאפשר לדחות ל-BUILD (לא חוסם מוקאפ)

הממצאים הבאים מהגאפ אנליזה — **לא חוסמים** — BUILD יטפל בהם כחלק מיישום:

| פריט | סיבה |
|------|-------|
| T-04: Engine field editable | החלטת implem ב-BUILD |
| T-05: Children display | mock data only |
| T-06: Refresh button position | cosmetic |
| P-04: Sidebar duplicate metadata | cosmetic |
| PO-05: 3rd completed run row | mock data |
| C-02: POST/PUT mock row in routing | nice-to-have |
| X-04/05: Workflow guidance tooltips | content post-BUILD |

---

## 7. סיכום — טבלת החלטות ל-Team 00

| # | שאלה | **המלצה** |
|---|------|-----------|
| D-01 | Operator Handoff — לאשר כדרישה? | **✅ כן — §6.1.D, Stage 8B, חובה** |
| D-02 | Verdict/Reason input — איפה? | **✅ Inline textarea** מתחת לכפתורי Advance/Fail — expand on click |
| D-03 | History run_id filter | **✅ הוסף שדה run_id לפילטרים; Portfolio ← query param** |
| D-04 | Engine field — editable? | **⚪ Read-only בUI; definition.yaml SSOT — AD-S8A-05 כבר נועל** |
| D-05 | Stage 8B micro-amendment — לאשר? | **✅ כן — Team 100 מייצר, Team 190 מאשר, Team 00 gates** |

---

**log_entry | TEAM_100 | MOCKUP_SYNTHESIS | v1.0.0 | 2026-03-27**

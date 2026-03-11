# Team 10 → Nimrod | 3 החלטות — LOCKED

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_NIMROD_PENDING_DECISIONS  
**from:** Team 10 (The Gateway)  
**to:** Nimrod (Human Approver)  
**date:** 2026-03-11  
**status:** **RESOLVED** — כל 3 ההחלטות נעולות ב־TEAM_00_DECISIONS_LOCK_v1.0.0  

---

## Correction Cycle (TEAM_190 / TEAM_00 revalidation)

| Field | Value |
|-------|-------|
| correction_cycle_ref | TEAM_190_TO_TEAM_10_S002_P002_WP003_PLAN_REVALIDATION_RESULT_v1.0.0 (BF-01, BF-02, BF-03) |
| architect_review_ref | TEAM_00_TO_TEAM_10_S002_P002_WP003_GATE7_REVIEW_RESULT_v1.0.0 (N1) |
| what_changed | תאריכים 2025-01-30→2026-03-11; עדכון סטטוס Team 60 blocker → CLOSED (evidence: TEAM_60_RE_VERIFY_RESULT PASS) |

---

## הקונטקסט

Team 00 סגר את כל 3 ההחלטות. **כל האפיונים והשאלות נענו.**  
מסמך החלטות: `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_10_S002_P002_WP003_DECISIONS_LOCK_v1.0.0.md`

**מסמך מקור:** `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_10_S002_P002_WP003_GATE7_SPEC_RESPONSE_v1.0.0.md`

---

## [A] תפריט פעולות בטבלה (ממצא #7)

**בעיה:** תפריט פעולות נסגר לפני שהמשתמש מגיע אליו.

| אופציה | תיאור |
|--------|--------|
| **A (מומלצת)** | **Hover-only** — תפריט נפתח על hover על השורה (delay 150ms), נסגר כשיוצאים מה־zone (100ms exit delay). Zone משותפת: שורה + פאנל, gap=0. |
| **B** | **Click-to-open** — אייקון `⋮` בכל שורה, לחיצה פותחת dropdown. נסגר בלחיצה מחוץ. |

**✅ LOCKED:** אופציה A (Hover-only)

---

## [B] פורמט היסטוריית ריצות (ממצא #11)

**בעיה:** הצגת היסטוריה לכל משימה בעמוד ניהול מערכת.

| אופציה | תיאור |
|--------|--------|
| **A (מומלצת)** | **Inline expand** — כפתור `▼ היסטוריה` מתחת לכל job, לחיצה מציגה 5 ריצות אחרונות inline. |
| **B** | **Modal** — כפתור "הצג היסטוריה" → modal עם טבלה ופגינציה. |

**✅ LOCKED:** אופציה A (Inline expand). Log Viewer → D40, לא WP003.

---

## [C] Heat Indicator — נוסחה וספים (ממצא #14)

**בעיה:** כרטיס סיכום עומס להגדרות Market Data.

### נוסחה

| אופציה | נוסחה |
|--------|--------|
| **A (מומלצת)** | `load_pct = (active_tickers / max_active_tickers) × 100` — פשוטה ושקופה |
| **B** | Weighted — כולל call rate ו־quota (מורכב יותר) |

### ספי תצוגה

| אופציה | ירוק | צהוב | אדום |
|--------|------|------|------|
| **A (מומלצת)** | 0–49% | 50–79% | ≥80% |
| **B** | 0–39% | 40–69% | 70–89% (High), ≥90% (Critical) |

**✅ LOCKED:** נוסחה A | ספים A (ירוק <50%, צהוב 50–79%, אדום ≥80%)

---

## אופן התשובה (היסטורי)

השב בפורמט:
```
[A] A או B
[B] A או B
[C] נוסחה: A או B | ספים: A או B
```

או השאר את הבחירות בטקסט חופשי — Team 10 ימפה לתבנית.

---

**כל 3 ההחלטות נעולות. PRE_DEVELOPMENT_GATE פתוח. Gate-blocker Team 60: CLOSED** — evidence: `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_S002_P002_WP003_AUTO_WP003_05_RE_VERIFY_RESULT.md` (status PASS, 2025-01-31). ticker_prices מאוכלס, AUTO-WP003-05 PASS.

---

**log_entry | TEAM_10 | PENDING_DECISIONS | TO_NIMROD | 2026-03-11**

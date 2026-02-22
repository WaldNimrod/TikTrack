# Team 10 → אדריכלית: עדכון — יישור קו רשימת עמודים ו־SSOT
**project_domain:** TIKTRACK

**id:** TEAM_10_TO_ARCHITECT_P3_003_SSOT_ALIGNMENT_UPDATE  
**from:** Team 10 (The Gateway)  
**to:** אדריכלית (Chief Architect / Team 90)  
**date:** 2026-02-15  
**סוג:** עדכון מידע — יישור מטריצה, תפריט וסקופ לפי החלטת G-Lead

---

## 1. סיכום היישור

בוצע **יישור מלא** בין רשימת העמודים במערכת, המטריצה (P3-003), תפריט ראשי, סקופ צוות 31 ו־Page Tracker — לפי החלטות G-Lead. מקור אמת יחיד לרשימת עמודים: **TT2_PAGES_SSOT_MASTER_LIST**.

---

## 2. תיקונים מרכזיים שבוצעו

### 2.1 תפריט ותוכן

| נושא | בוצע |
|------|------|
| **trade_plans** | במטריצה כ־IN SCOPE (D24). קישור בתפריט: **תוכניות טריידים** → `/trade_plans.html` (לא "אנליזת AI"). |
| **ai_analysis** | עמוד **נפרד** (D25). קישור בתפריט: **אנליזת AI** → `/ai_analysis.html`. קיים בלגסי; נדרש Blueprint. |
| **trades** | עמוד **ניהול טריידים** (D29) — תחת תפריט מעקב; נוסף ל־routes.json ו־unified-header. מציג ישויות טרייד. |

### 2.2 עמודים חובה (בלופרינט ושלב במטריצה)

כל אלה חובה, קיימים בלגסי; נדרש Blueprint (או "נדרש אפיון" אם חסר):  
trading_journal, watch_lists, ticker_dashboard, strategy_analysis, trades_history, portfolio_state, tag_management, **data_import** (דחוף — ייבוא CSV לתזרימים/ביצועים), trades.

### 2.3 דשבורדים ברמה 1

**כל הכפתורים ברמה 1** (בית, תכנון, מעקב, מחקר, נתונים, ניהול) — **עמודי דשבורד**.  
**לא נדרש Blueprint**; יבנו בבאץ' אחד בשלב מתקדם.

### 2.4 לא נדרש / ללא Blueprint

- **לא נדרש:** api_keys, securities.  
- **ללא Blueprint:** research (דשבורד ראשי); system_management, design_system (חיוניים, design_system קיים).

---

## 3. מסמכי SSOT שנוצרו/עודכנו

| מסמך | תיאור |
|------|--------|
| **documentation/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md** | רשימת עמודים מאסטר — ממוספרת (D15–D41), תפריט, בלופרינט?, אפיון. |
| **documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md** | עודכן ל־v4.3; שורות D24–D29, D37–D41; הפניה ל־TT2_PAGES_SSOT_MASTER_LIST. |
| **_COMMUNICATION/team_10/TEAM_10_P3_003_BLUEPRINT_SCOPE_AND_DRIFT_MATRIX.md** | מטריצה מתיישרת ל-SSOT; עקרון דשבורדים. |
| **_COMMUNICATION/team_10/TEAM_10_P3_003_PAGES_COMPARISON_TABLE.md** | טבלת השוואה ממוספרת — מטריצה, תיעוד, סקופ 31, תפריט. |
| **ui/public/routes.json** | נוספו planning.ai_analysis, tracking.trades. |
| **ui/src/views/shared/unified-header.html** | תכנון: תוכניות טריידים + אנליזת AI; מעקב: ניהול טריידים. |

---

## 4. צוותים שעודכנו

- **Team 31:** הנחיה — תוכניות טריידים / אנליזת AI (נפרד), רשימת עמודים חובה, לא נדרש, דשבורדים (TEAM_10_TO_TEAM_31_P3_003_SCOPE_CORRECTIONS_AND_SSOT).
- **Team 30:** יישור תפריט ל-SSOT — הושלם (unified-header, headerLinksUpdater.js); ACK נשלח.

---

## 5. הפניות

| מסמך | נתיב |
|------|------|
| SSOT רשימת עמודים | documentation/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md |
| תיקוני מטריצה/תפריט | _COMMUNICATION/team_10/TEAM_10_P3_003_MATRIX_AND_MENU_CORRECTIONS.md |
| נוהל קידום ידע | documentation/05-PROCEDURES/TT2_KNOWLEDGE_PROMOTION_PROTOCOL.md |

---

**log_entry | TEAM_10 | TO_ARCHITECT | P3_003_SSOT_ALIGNMENT_UPDATE | 2026-02-15**

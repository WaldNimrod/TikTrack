# Team 10 → Team 00 | פרומט קאנוני — בקשה לאפיונים והשלמות מידע

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_00_CANONICAL_SPEC_COMPLETION_PROMPT  
**from:** Team 10 (The Gateway / Orchestrator)  
**to:** Team 00 (Architect)  
**date:** 2025-01-30  
**status:** PROMPT — להעברה ל-Team 00

---

## פרומט להעתקה ישירה (לשליחה ל-Team 00)

ראה להלן — כל התוכן מתחת ל־"פרומט קאנוני" ניתן להעתקה ולשליחה.

---

## פרומט קאנוני (גרסה מלאה)

**הקונטקסט:**  
אנחנו בשלב **Pre-Development Gate** בתוכנית S002-P002-WP003 (Market Data Hardening). לאחר איסוף משוב מ-Nimrod ב-GATE_7, זיהינו 14 ממצאים + פער בתהליכי QA. Team 10 פועל כשער — **אין אישור לפיתוח** עד לקבלת אפיון מדויק וסגור. מטרתנו: עבודה חלקה, מדויקת, ללא הנחות או ניחושים, בתאום מלא בין הצוותים.

**הבקשה:**  
לספק את **כל האפיונים והשלמות המידע** הנדרשות במסמכי ה-GIN המצורפים — כולל החלטות אדריכליות, טקסטים סופיים מאושרים, סכמות וטבלאות. ללא תשובות מפורטות — השער סגור והפיתוח לא יוצא לדרך.

**מסמכי מקור והקשר:**

| מסמך | תיאור | קישור |
|------|--------|-------|
| **מסמך שער ראשי** | Pre-Development Gate — סיכום פערים, תנאי פתיחה | `_COMMUNICATION/team_10/TEAM_10_PRE_DEVELOPMENT_GATE_AND_INFORMATION_REQUESTS_v1.0.0.md` |
| **משוב Nimrod** | 14 ממצאים + 2.5 (אוטומציה) — מקור כל הדרישות | `_COMMUNICATION/team_10/TEAM_10_NIMROD_S002_P002_WP003_G7_PRELIMINARY_FEEDBACK_v1.0.0.md` |
| **ניתוח כשל QA** | למה ממצאים 1+2 לא נתגלו באוטומציה — Handoff לאדריכלים | `_COMMUNICATION/team_10/TEAM_10_TO_ARCHITECT_TEAMS_QA_PROCESS_GAP_ANALYSIS_v1.0.0.md` |
| **GIN-001** | מחירים — current vs last_close, TASE אגורות, price_source | `_COMMUNICATION/team_10/TEAM_10_GIN_001_PRICE_AND_MARKET_DATA_CLARIFICATIONS.md` |
| **GIN-002** | סטטוס טיקר — status/is_active, סיכום, מקרא | `_COMMUNICATION/team_10/TEAM_10_GIN_002_TICKER_STATUS_AND_SUMMARY_CLARIFICATIONS.md` |
| **GIN-003** | תפריט פעולות — UX (hover/click, delay, שטחים) | `_COMMUNICATION/team_10/TEAM_10_GIN_003_TABLE_ACTIONS_MENU_UX_SPEC.md` |
| **GIN-004** | עמוד ניהול מערכת — תרחישי Runtime, היסטוריה, משימות | `_COMMUNICATION/team_10/TEAM_10_GIN_004_SYSTEM_MANAGEMENT_SPEC_COMPLETIONS.md` |
| **GIN-005** | Market Data Settings — גבולות, ולידציה, מכוון חום | `_COMMUNICATION/team_10/TEAM_10_GIN_005_MARKET_DATA_SETTINGS_SPEC.md` |
| **GIN-006** | אוטומציה — runtime assertions, עדכון AUTO-WP003 | `_COMMUNICATION/team_10/TEAM_10_GIN_006_QA_AUTOMATION_SPEC_COMPLETIONS.md` |

**מסמכי אפיון קיימים (להשלמה/עדכון):**

| מסמך | תיאור |
|------|--------|
| `archive/documentation_legacy/snapshots/2026-02-17_0000/09-GOVERNANCE/TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT.md` | סטטוס טיקר — יש לבחון וליישר |
| `archive/documentation_legacy/snapshots/2026-02-17_0000/09-GOVERNANCE/TT2_SYSTEM_STATUS_VALUES_SSOT.md` | ערכי סטטוס מערכתיים |
| `documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_10_FIELD_MAP_BACKGROUND_TASKS.md` | Field Map משימות רקע |
| `documentation/docs-system/01-ARCHITECTURE/LOGIC/WP_20_10_FIELD_MAP_SYSTEM_SETTINGS.md` | Field Map הגדרות מערכת |

**תהליך ושלב:**
- **Stage:** S002 (Phoenix Roadmap)
- **Program:** S002-P002
- **Work Package:** S002-P002-WP003 (Market Data Hardening)
- **Gate:** GATE_7 Human — BLOCK בעקבות משוב
- **עמדה נוכחית:** Pre-Development Gate — Team 10 לא מאשר יציאה לפיתוח עד שכל ה-GINים יקבלו תשובות והאפיונים יוגדרו כסגורים

**תוצרים נדרשים מ-Team 00:**
1. תשובות לכל שאלות ב-GIN-001 עד GIN-006 (או הפניה לצוותים רלוונטיים עם הנחיות ברורות)
2. החלטות אדריכליות מפורשת (TASE, current/last_close, hover vs click, נוסחת עומס, מכוון חום)
3. טקסטים מאושרים (מקרא סטטוס, המלצות Market Data)
4. עדכון/יצירת SSOT נדרשים (PRICE_SEMANTICS, LOAD_HEAT_INDICATOR, TABLE_ACTIONS_UX)
5. אישור או תיקון לגבי יישור הקוד לאפיון (TT2_TICKER_STATUS)

**עד לקבלת ההשלמות — השער סגור.**

---

**Team 10 — The Gateway**

---

**log_entry | TEAM_10 | CANONICAL_PROMPT | TO_TEAM_00 | 2025-01-30**

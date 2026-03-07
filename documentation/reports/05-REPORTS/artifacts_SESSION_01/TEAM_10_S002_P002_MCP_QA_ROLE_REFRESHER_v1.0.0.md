# Team 10 | S002-P002 MCP-QA Transition — תזכורת תפקיד (v1.0.0)

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_10_S002_P002_MCP_QA_ROLE_REFRESHER_v1.0.0  
**owner:** Team 10 (Gateway Orchestration)  
**date:** 2026-03-07  
**status:** ACTIVE  
**program_id:** S002-P002  
**gate_id:** GATE_3_PREPARATION  
**source:** TEAM_190_TO_TEAM_10_S002_P002_MCP_QA_TRANSITION_ACTIVATION_PROMPT_v1.0.0.md  

---

## 1) תפקיד Team 10 בהקשר זה

- **תפקיד:** Gateway Orchestration — הבעלים של שלב GATE_3_PREPARATION; מפעיל את חבילת העבודה S002-P002 (MCP-QA Transition) בהתאם לתנאי טריגר ונקודות גבול נעולות.
- **סמכות:** החלטת ארכיטקט (MCP-QA transition) ו־Team 190 (אישור LLD400) ננעלו; בעלות שערים לפי 04_GATE_MODEL_PROTOCOL.

---

## 2) תנאי טריגר (חובה — כולם חייבים להתקיים לפני פתיחת GATE_3 execution)

| # | תנאי | וידוא |
|---|------|--------|
| 1 | סגירת החבילה הפעילה הנוכחית ב־**GATE_8 PASS** — חבילת As-Made של Team 70 התקבלה | יש לאמת מול Team 90 / Team 70 |
| 2 | שרשרת הספק של **S002-P002** פתוחה ואושרה למסלול ביצוע (GATE_0..GATE_2; Team 100 סמכות ב־GATE_2) | יש לאמת מול Team 100 |
| 3 | **WSM** מסונכרן ל־S002-P002 כתוכנית פעילה לפני הוצאת מנדטי ביצוע | יש לאמת מול SSM/WSM |

עד שכל שלושת התנאים מתקיימים — Team 10 **לא** פותח ביצוע GATE_3; מצב תגובה: `WAITING_ON_TRIGGER`.

---

## 3) גבולות ביצוע נעולים (ללא סטייה)

| כלל | תוכן |
|-----|------|
| 1 | אין סטייה מבעלות שערים (no gate-owner drift). |
| 2 | **GATE_7:** בעלים — Team 90; סמכות אנושית — Nimrod (Team 00); עדות MCP — ייעוצית בלבד. |
| 3 | **GATE_8:** סגירת lifecycle רק עם Team 90 closure PASS. |
| 4 | **Team 61:** שליטה **רק** במסלול אוטומציית repo (CI, tooling, evidence hooks). |
| 5 | **Team 60:** שליטה **רק** ב־runtime/platform ובמשמורת מפתחות חתימה (Ed25519). |

---

## 4) תוצרים נדרשים — מחזור ראשון (6 מסמכים)

| # | תוצר | תוכן עיקרי |
|---|--------|-------------|
| 1 | TEAM_10_S002_P002_MCP_QA_TRANSITION_WORK_PACKAGE_DEFINITION_v1.0.0.md | WP-A (Hybrid Integration), WP-B (Controlled Agentic Expansion); שרשרת שערים ובעלים מפורשת |
| 2 | TEAM_10_S002_P002_MCP_QA_TRANSITION_GATE3_EXECUTION_PLAN_v1.0.0.md | תכנית אורקסטרציה G3.1..G3.9; הגדרת checkpoint חובה G3.5 |
| 3 | TEAM_10_TO_TEAM_61_S002_P002_MCP_QA_AUTOMATION_ACTIVATION_v1.0.0.md | מנדטים לאוטומציית repo: CI, אינטגרציית כלים, hooks ליצירת evidence |
| 4 | TEAM_10_TO_TEAM_60_S002_P002_MCP_QA_RUNTIME_AND_SIGNING_ACTIVATION_v1.0.0.md | חיזוק runtime; משמורת מפתח Ed25519; הגדרת שירות חתימה |
| 5 | TEAM_10_TO_TEAM_50_S002_P002_MCP_QA_HYBRID_QA_ACTIVATION_v1.0.0.md | ריצות parity היברידיות (MCP + Selenium safety net) |
| 6 | TEAM_10_TO_TEAM_90_S002_P002_MCP_EVIDENCE_VALIDATION_PROTOCOL_ACTIVATION_v1.0.0.md | נקודות ביקורת לאימות evidence מימוש ל־GATE_5/GATE_6 |

---

## 5) חוזה Evidence (דרישה לתחילת ביצוע)

כל `MATERIALIZATION_EVIDENCE.json` בתוכנית זו חייב לכלול:

1. **provenance tag:** `TARGET_RUNTIME` \| `LOCAL_DEV_NON_AUTHORITATIVE` \| `SIMULATION`
2. **signature block:** `Ed25519`, `key_id`, `signature_base64`, `signed_payload_sha256`, `signed_at_utc`, `signed_by_team`
3. **gate context** + נתיב ארטיפקט ניתן למעקב

---

## 6) תגובה נדרשת ל־Team 190

מסמך אחד קנוני:

**`TEAM_10_TO_TEAM_190_S002_P002_MCP_QA_TRANSITION_ACTIVATION_ACK_v1.0.0.md`**

שדות חובה:
1. **trigger readiness status:** `READY` \| `WAITING_ON_TRIGGER`
2. **planned issue date** — תאריך מתוכנן להוצאת מנדטי המחזור הראשון
3. **אישור** עמידה בבעלות שערים הנעולה ובחוזה חתימת evidence

---

**log_entry | TEAM_10 | S002_P002_MCP_QA_ROLE_REFRESHER | 2026-03-07**

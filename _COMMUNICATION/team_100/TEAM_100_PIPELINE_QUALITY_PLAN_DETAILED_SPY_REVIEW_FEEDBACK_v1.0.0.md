---
id: TEAM_100_PIPELINE_QUALITY_PLAN_DETAILED_SPY_REVIEW_FEEDBACK_v1.0.0
status: SUPERSEDED_BY_PLAN_v3.3.0
superseded_by: _COMMUNICATION/team_100/TEAM_100_PIPELINE_QUALITY_PLAN_v3.3.0.md
superseded_date: 2026-04-01
from: Team 100 (Chief System Architect / Chief R&D) — סעיף משוב איכות מורחב (reconnaissance)
to: Team 100 (בעלי התכנית), Team 11 (Gateway), Team 190 (Constitutional Validator)
cc: Team 00 (Principal), Team 21, Team 31, Team 51, Team 61, Team 170
date: 2026-04-01
type: FEEDBACK_REPORT — איכות פרומפטים, קונטקסט לצוותים, ועומק תכנית Pipeline Quality
domain: agents_os
branch: aos-v3
reviewed_artifact:
  path: _COMMUNICATION/team_100/TEAM_100_PIPELINE_QUALITY_PLAN_v3.0.0.md
  note: הקובץ ב-repo נושא כותרת v3.1.0 (מחליף v3.0.0); יש להתייחס לתוכן כאל אותה תכנית עם DELTA בשורות 1–5.
authority:
  - documentation/docs-governance/01-FOUNDATIONS/TEAMS_ROSTER_v1.0.0.json (Layer 1–4)
  - AGENTS.md — מפת קונטקסט ו־AOS v3
  - _COMMUNICATION/team_100/TEAM_100_PIPELINE_QUALITY_PLAN_v3.0.0.md (המסמך הנסקר)
status: SUBMITTED — לשילוב בתכנית v3.2+ או annex לפני מימוש
---

# דוח משוב מפורט — תכנית איכות פייפליין (ביקורת עומק)

## 1. תקציר מנהלים

התכנית ב־`TEAM_100_PIPELINE_QUALITY_PLAN_v3.0.0.md` (בפועל **v3.1.0** בכותרת הקובץ) מטפלת היטב ב־**מסלול טכני** של feedback (§A–§F), חיווט UI (§B), הרחבת governance (§C), מיפוי מנועים (§D), auto-advance (§E), תקציב טוקנים (§H) ו־KPIs (§I).  

**פער מרכזי:** מעט מאוד בתכנית מגדיר במפורש **איכות תוכן** של הפרומפטים והקונטקסט שמקבל כל צוות (L4 חוזק, גרסאות SSOT, מניעת הצלבת דומיין, קריאות למפעיל אנושי). בלי שכבה זו, ניתן “להריץ פייפליין ירוק” עם פרומפטים ארוכים אך **שגויים או חסרי מידע פעיל**.

דוח זה מספק: **הקשר**, **רפרנסים לקוד/מסמכים**, **דוגמאות**, ו**המלצות מדורגות** לשילוב בתכנית.

---

## 2. הקשר ומיקום המסמך הנסקר

| שדה | ערך |
|-----|-----|
| **נתיב קובץ** | `_COMMUNICATION/team_100/TEAM_100_PIPELINE_QUALITY_PLAN_v3.0.0.md` |
| **גרסה בכותרת** | v3.1.0 — Option A נעול; STATUS: PENDING SECOND REVIEW (team_190) |
| **מחליף** | v3.0.0 (שורות 4–5 בקובץ) |
| **מקור DELTA מ־v2** | טבלת BF-190-01…08 (שורות 9–20) |

**הערת ניהול מסמכים (לא חוסם, אך מבלבל):** הפניות חיצוניות ל־`..._v3.0.0.md` בעוד שהתוכן הוא v3.1.0 — מומלץ איחוד שם קובץ ל־`..._v3.1.0.md` או שורת “SSOT filename” בראש המסמך.

---

## 3. ממצאים מסוכמים (חומרה + מזהה)

| ID | חומרה | נושא | תמצית |
|----|--------|------|--------|
| SR-01 | **GAP** | איכות פרומפט / L4 | אין חוזה PQC לתוכן L4 ול־SSOT refs |
| SR-02 | **HIGH** | §A `structured_json` | דוגמה טובה; חסר schema / validation מפורש |
| SR-03 | **HIGH** | §H חיתוך טוקנים | חיתוך L3/L4 לפי אורך עלול למחוק handoff קריטי |
| SR-04 | **MEDIUM** | §F fingerprint | `mtime+size` לא מייצג ייחוד תוכן |
| SR-05 | **MEDIUM** | §H אומדן טוקנים | `len//4` גס; עברית/מבנה MD |
| SR-06 | **MEDIUM** | §I API + שלב rollout | aggregate endpoint + יעדים ללא baseline |
| SR-07 | **LOW** | סדר Phase 1 | תלות לוגית בין P2-F04 ל־§B לא מפורשת בטקסט |
| SR-08 | **INFO** | §A–§E מול קוד | התכנית מתיישבת עם המצב ב־repo (ראו §4) |

---

## 4. אימות מול הקוד (קונטקסט טכני)

### 4.1 `FeedbackIngestBody` — תואם לתיאור התכנית (לפני §A)

התכנית (§A) טוענת ש־`/feedback` אינו תומך ב־`CANONICAL_AUTO`. **אומת:**

```33:38:agents_os_v3/modules/definitions/models.py
class FeedbackIngestBody(BaseModel):
    """POST /runs/{run_id}/feedback — operator modes B/C/D only (UI §10.1)."""

    detection_mode: Literal["OPERATOR_NOTIFY", "NATIVE_FILE", "RAW_PASTE"]
    file_path: Optional[str] = None
    raw_text: Optional[str] = None
```

**הקשר:** `AdvanceRunBody` כבר כולל `feedback_json` אופציונלי (Mode A) — התכנית נכונה שזה **לא** יוצג כ־Layer 1 canonical אם נעולים על Option A ל־`/feedback`.

```25:30:agents_os_v3/modules/definitions/models.py
class AdvanceRunBody(BaseModel):
    """UC-02 / T11; summary + optional Mode A feedback_json (UI §10.6)."""

    verdict: Literal["pass", "resubmit"] = "pass"
    summary: Optional[str] = None
    feedback_json: Optional[dict[str, Any]] = None
```

### 4.2 `resolve_actor_team_id` — תומך ב־§E

§E מציע שימוש ב־`resolve_actor_team_id` לפני `uc_02_advance_run`. **הפונקציה קיימת ומשמשת ב־builder:**

```77:81:agents_os_v3/modules/prompting/builder.py
        actor_team = resolve_actor_team_id(cur, run)
        if not actor_team:
            from agents_os_v3.modules.state.errors import StateMachineError

            raise StateMachineError("ROUTING_UNRESOLVED", 500, details={"run_id": run_id})
```

**הקשר:** §E עקבי עם דפוס קיים בקוד; יש לוודא שב־auto-advance אין מצב שבו `resolve_actor_team_id` מחזיר `None` — אז יש fail-safe (התכנית מזכירה `try/except StateMachineError`).

### 4.3 `token_budget_warning` — תואם ל־§H (מצב נוכחי)

```112:117:agents_os_v3/modules/prompting/builder.py
            "meta": {
                "template_id": str(tpl["id"]),
                "template_version": ver,
                "actor_team_id": actor_team,
                "token_budget_warning": None,
            },
```

**הקשר:** §H מציע מילוי שדה זה — היום הוא תמיד `None`; ה־UI שמתואר בתכנית (badge) יכול להיצמד לשדה קיים.

### 4.4 UI Handoff — תואם ל־§B (mock)

כפתורי ingestion משתמשים ב־`data-mock-toast` (לא API חי), כפי ש§B מתאר:

```1703:1741:agents_os_v3/ui/app.js
  function renderHandoffIngestionExtra(state) {
    ...
      '<button type="button" class="btn" data-mock-toast="' +
```

קונטיינר ב־`index.html`:

```237:237:agents_os_v3/ui/index.html
        <div id="aosv3-handoff-feedback-forms" class="aosv3-handoff-feedback-forms" hidden></div>
```

---

## 5. ממצאים מפורטים — הקשר, רפרנס, דוגמה, המלצה

### SR-01 — פער “איכות תוכן פרומפט” (GAP)

**הקשר:** המשתמש (Principal) הדגיש שאיכות הפרומפטים והקונטקסט לכל צוות קריטית. התכנית מתמקדת ב־FIP, scheduler, token cap, KPI — לא ב־**מה חייב להופיע ב־L1–L4** מבחינת משמעות.

**רפרנסים:**
- מודל הרכבה נוכחי: `agents_os_v3/modules/prompting/builder.py` — L4 הוא `json.dumps(run_public)` בלבד (שורות 101–102), ללא שדות “משימה מובנית” או אימות.
- רוסטר שכבות: `documentation/docs-governance/01-FOUNDATIONS/TEAMS_ROSTER_v1.0.0.json` — מקור ל־Layer 1–4 לפי AGENTS.md.

**דוגמה — L4 “רע” (סיכון תפעולי):**

```text
המשימה: לטפל בבעיה ולעדכן קבצים לפי הצורך.
```

**דוגמה — L4 “טוב” (ניתן לאימות אוטומטי חלקי):**

```markdown
## L4 — Task envelope
- work_package_id: S003-P005-WP001   (שלוש רמות חובה)
- assigned_team_id: team_21
- current_gate_id: GATE_0
- writes_to_allowlist: agents_os_v3/modules/management/api.py, agents_os_v3/tests/...
- forbidden: agents_os_v2/**, שדות חדשים בלי GIN
- deliverables: (1) קוד (2) pytest ירוק (3) Seal ל־team_11
- evidence_refs:
  - _COMMUNICATION/team_190/TEAM_190_..._VALIDATION_v1.0.1.md §blockers
```

**המלצה:** להוסיף לתכנית סעיף **§J — Prompt Quality Contract (PQC)** עם צ’ק־ליסט חובה לפני/אחרי הרכבה (ראו **נספח א**).

---

### SR-02 — §A: `structured_json` בלי schema (HIGH)

**הקשר:** Option A מרחיב את `/feedback` ל־`CANONICAL_AUTO`. התכנית מציגה דוגמת JSON (שורות 80–89 בקובץ התכנית) אך לא מחייבת מבנה.

**רפרנס:** התכנית §A (שורות 38–66 בקובץ התכנית).

**דוגמה — גוף בקשה מינימלי מוצע (להגדרה כ־Pydantic משני):**

```json
{
  "detection_mode": "CANONICAL_AUTO",
  "structured_json": {
    "schema_version": "1",
    "work_package_id": "S003-P005-WP001",
    "gate_id": "GATE_0",
    "verdict": "FAIL",
    "confidence": "HIGH",
    "summary": "שני blockers: runtime ID vs definition.yaml; registry PLANNED",
    "blocking_findings": [
      {
        "id": "BF-001",
        "severity": "BLOCKER",
        "evidence_path": "_COMMUNICATION/team_190/TEAM_190_S003_P005_GATE_0_VALIDATION_v1.0.1.md",
        "route_recommendation": "arch"
      }
    ]
  }
}
```

**המלצה:**
1. להגדיר מודל `StructuredVerdictV1` (או שם קנוני) ולנקות/לאמת לפני `uc_15`.
2. לרשום ב־TRIGGER PROTOCOL לצוותים: **שדות חובה** + **enumים** (`verdict`, `confidence`, `route_recommendation`).

---

### SR-03 — §H: חיתוך L3/L4 לפי תווים (HIGH)

**הקשר:** חיתוך `l3[:2000]` / `l4[:3000]` עלול לקצץ את ה־run JSON או policies באמצע מפתח — JSON לא תקין, או הסרת `work_package_id`.

**רפרנס:** התכנית §H (pseudo-code בשורות 331–336).

**דוגמה לכשל שקט:** הסוכן מקבל `L4_run_json` עם `"work_package_id":` ללא ערך כי המחרוזת נחתכה באמצע.

**המלצה:**
- חיתוך לפי **סעיפי markdown** מסומנים (למשל `## OPTIONAL_*`) ב־L1/L2, לא ב־L4 גולמי.
- אם חיתוך חייב — להחזיר במטא: `truncation_applied: true`, `truncated_layers: ["L3_policies_json"]`, ולוג אירוע.

---

### SR-04 — §F: fingerprint קובץ (MEDIUM)

**הקשר:** `sha1(path + mtime + size)` לא משנה אם התוכן השתנה בלי שינוי גודל/זמן (נדיר) או במקרי edge אחרים.

**רפרנס:** התכנית §F (שורות 254–257).

**המלצה:** אחרי קריאת תוכן הקובץ (לפני POST), חשב `sha256(content)[:16]` ושמור ב־`_PROCESSED_FILES`; השאר `max_instances=1` כמתוכנן.

---

### SR-05 — §H: אומדן טוקנים (MEDIUM)

**הקשר:** `_approx_tokens = len(text)//4` מתאים לאנגלית גסה; עברית ו־emoji עלולים לסטות מ־מודל הספק.

**המלצה:** לתעד בבירור “heuristic lower bound”; אופציונלי: `tiktoken` אם dependency מאושר; אחרת שני ספים — `chars` ו־`approx_tokens` ב־meta.

---

### SR-06 — §I: KPI endpoint ויעדים (MEDIUM)

**הקשר:** `GET /api/events?aggregate=detection_mode` דורש עיצוב הרשאות (מי רואה אגרגציות דומייניות) ו־migration אם העמודות חסרות.

**המלצה:** שלב **0 — collection only** (ללא SLA), אחרי N ריצות להגדיר יעדי >80% וכו’; לקשר ל־Authority Model (`X-Actor-Team-Id`, tier).

---

### SR-07 — סדר Phase 1 (LOW)

**הקשר:** רשימת Phase 1 בתכנית מתחילה ב־`P2-F04` לפני §B.

**המלצה:** משפט אחד בתכנית: “אם ה־banner תלוי באירועי ingest אמיתיים, בצע §B לפני אימות מלא של F04” או הפוך — לפי תלות בפועל.

---

## 6. נקודות חוזק בתכנית (לשימור)

1. **סגירת לולאה עם 190** — טבלת BF ממופה לסעיפים; שקיפות לביקורת חוזרת.
2. **§B wire-not-rebuild** — מונע כפילות UI; מותאם ל־`app.js` / `index.html` בפועל.
3. **§D engine = definition.yaml** — Iron Rule נכון למניעת drift תיעודי.
4. **§E שימוש ב־`resolve_actor_team_id`** — עקבי עם `machine.py` / `portfolio.py`.
5. **§I KPIs** — צעד בשל לקראת מדידת איכות אמיתית (אחרי תיקוני SR-06).

---

## 7. המלצות מדורגות לשילוב בתכנית

| עדיפות | פעולה | בעלות מוצעת |
|--------|--------|-------------|
| **P0** | הוספת §J PQC (נספח א כטיוטה רשמית) | Team 100 |
| **P0** | Schema ל־`structured_json` (Layer 1) | Team 21 + Team 100 |
| **P1** | תיקון אסטרטגיית חיתוך טוקנים (סעיפים + מטא truncation) | Team 21 |
| **P1** | חיזוק §F ב־hash תוכן | Team 21 |
| **P2** | שיפור אומדן טוקנים + תיעוד | Team 21 |
| **P2** | §I rollout דו-שלבי + RBAC | Team 61 + Team 100 |
| **P3** | איחוד שם קובץ תכנית v3.0.0 ↔ v3.1.0 | Team 11 / Team 191 |

---

## נספח א — טיוטת §J: Prompt Quality Contract (PQC)

**מטרה:** כל הרכבת פרומפט לצוות מספקת מינימום שניתן לבדוק (אנושית או אוטומטית).

### J.1 בדיקות לפני שליחה לסוכן

| # | בדיקה | כשל = |
|---|--------|--------|
| J1.1 | `work_package_id` תואם פורמט `S{NNN}-P{NNN}-WP{NNN}` | BLOCK — לא להרכיב |
| J1.2 | `assigned_team_id` תואם routing / assignment לריצה | BLOCK |
| J1.3 | כל נתיב ב־`writes_to` תחת allowlist דומיין (TikTrack vs AOS) | BLOCK |
| J1.4 | הפניות SSOT כוללות מזהה מסמך + גרסה (או path) | WARN אם חסר |
| J1.5 | L4 מכיל `NEXT_ACTION` אחד ברור (פקודה / מסמך יעד) | WARN |

### J.2 בדיקות איכות תוכן (דוגמה)

- **אסור** משפטים כמו “תקן לפי הצורך” בלי קישור ל־verdict או ל־WP.
- **חובה** בלוק “Forbidden” שחוזר על IR-2 (v2 freeze) כאשר הריצה ב־AOS v3.

### J.3 דוגמת “כותרת קנונית” ל־L1 (טמפלט)

```markdown
# Gate {gate_id} — Team {actor_team_id}
## SSOT bundle
- Work Package: {work_package_id}
- Templates: {template_id} v{template_version}
- Governance: agents_os_v3/governance/{actor_team_id}.md
## Trigger protocol
POST /api/runs/{run_id}/feedback … (כפי §A בתכנית)
```

---

## נספח ב — מפת רפרנסים מהירה

| נושא | נתיב |
|------|------|
| תכנית נסקרה | `_COMMUNICATION/team_100/TEAM_100_PIPELINE_QUALITY_PLAN_v3.0.0.md` |
| מודלים HTTP | `agents_os_v3/modules/definitions/models.py` |
| הרכבת פרומפט | `agents_os_v3/modules/prompting/builder.py` |
| Resolver שחקן | `agents_os_v3/modules/routing/resolver.py` |
| UI Handoff | `agents_os_v3/ui/app.js`, `agents_os_v3/ui/index.html` |
| AGENTS / קונטקסט | `AGENTS.md` |
| רוסטר צוותים | `documentation/docs-governance/01-FOUNDATIONS/TEAMS_ROSTER_v1.0.0.json` |

---

**log_entry | TEAM_100 | PIPELINE_QUALITY | SPY_REVIEW_DETAILED_FEEDBACK | SUBMITTED | 2026-04-01**

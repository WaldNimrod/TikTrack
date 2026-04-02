---
id: DM-005
date: 2026-04-02
historical_record: true
version: 1.1.0
supersedes: TEAM_00_TO_TEAM_101_DM_005_PIPELINE_STABILIZATION_MANDATE_v1.0.0.md
dm_type: DIRECT_MANDATE
from: Team 00 (System Designer / Principal — בן־אנוש יחיד)
to: Team 101 (AOS Domain Architect / Stabilization Lead)
authority: Team 00 — constitutional authority, unrestricted
classification: IRON_RULE
pipeline_impact: BRIDGE_TO_PIPELINE
scope_boundary: Pipeline stabilization proof only — zero TikTrack implementation
wsm_update_required: true (upon completion)
return_path: Team 101 → completion report → Team 100 architectural review → Team 00 sign-off
cascade_authorization: Team 101 may activate Team 61 / Team 51 / Team 90 / Team 170 as needed. All cascaded actions within this DM scope are implicitly authorized (per DMP cascade ratification 2026-03-24).
status: ACTIVE
date_issued: 2026-03-24
date_updated: 2026-03-24
registry_ref: _COMMUNICATION/_Architects_Decisions/DIRECT_MANDATE_REGISTRY_v1.0.0.md
supersedes_work_plan: S003-P011-WP002 (CANCELLED — all prior work plans void)
basis_documents:
  - TEAM_00_S003_CLOSURE_SCOPE_AND_PIPELINE_STABILITY_CRITERIA_v1.0.0.md
  - TEAM_101_TO_TEAM_00_S003_PIPELINE_STABILITY_ASSESSMENT_v1.0.0.md---

# DM-005 v1.1.0 — Pipeline Stabilization Mandate
## ייצוב Pipeline + הוכחת ריצה — Team 101 כ-Lead

---

## §1 — הקשר המלא

### §1.1 — מה הושג (לפני מנדט זה)

| פריט | מצב | ראיה |
|---|---|---|
| WP099 ניוקה מ-pipeline_state | ✅ | `pipeline_state_agentsos.json` → S003-P012-WP005 COMPLETE |
| ssot_check agents_os | ✅ exit 0 | אומת 2026-03-23 |
| ssot_check tiktrack | ✅ exit 0 | אומת 2026-03-23 |
| 206 pytest passed | ✅ | `agents_os_v2/tests/` exit 0 |
| Layer 1 verify | ✅ | `generate_mocks.py` + `verify_layer1.py --phase-b` PASS |
| Selenium smoke + Phase A | ✅ | דוחות Team 101 (206 passed) |
| GATE_2 five-phase | ✅ | אושר ברמת Canary |
| Dashboard DM badge + Roadmap panel | ✅ | DM-004 CLOSED/ABSORB |
| TikTrack pipeline clean | ✅ | S003-P013-WP001 COMPLETE |

### §1.2 — הערכת Team 101 (2026-03-23)

Team 101 הגיש `TEAM_101_TO_TEAM_00_S003_PIPELINE_STABILITY_ASSESSMENT_v1.0.0.md`. המסקנה המרכזית:

> **"לא נדרש סבב ייצוב AOS נפרד כדי לאפשר ביצוע חלק של חבילות TikTrack דרך ה-pipeline."**

ה-assessment מיפה את כל SC criteria ומצא:

| SC | מצב | הערת Team 101 |
|---|---|---|
| SC-AOS-01 | ✅ MET | WP099 cleared, ssot_check exit 0 |
| SC-AOS-02 | ⏳ PENDING | סגירת תיק ניהולית ל-WP002 — לא כשל טכני |
| SC-AOS-03 | 🔶 PARTIAL | נדרשת ריצת אימות G0→G5 אחת בפועל |
| SC-AOS-04 | ✅ MET | GATE_2 five-phase — Canary level |
| SC-AOS-05 | ✅ MET | ssot_check exit 0 |
| SC-TT-01/02 | ✅ MET | TikTrack pipeline clean |
| SC-TT-03 | 🔶 PARTIAL | יוכח בריצת אימות (לא dev נפרד) |
| SC-UI-01..05 | ✅ MET/MOSTLY | DM-004 + Canary confirmed |
| SC-TEST-01..03 | ✅ MET | 206 pytest + Layer1 + Selenium |

**סיכום:** מתוך 13 SC criteria — **10 MET, 3 נדרשים לסגירה** (2 PARTIAL + 1 PENDING). אף אחד מה-3 אינו כשל קוד — כולם ניהוליים או verification בלבד.

### §1.3 — החלטות Team 00

1. **S003-P011-WP002 CANCELLED** — כל תוכניות העבודה הקודמות ל-WP002 מבוטלות
2. **TRACK_DIRECT** — ייצוב הפייפליין דרך מסלול ישיר, לא pipeline WP
3. **Team 101 = Lead** — מנהל את כל תהליך הייצוב ומפעיל צוותים לפי צורך
4. **3 פריטים נותרים בלבד** — ראה §2 מטה

---

## §2 — מה נדרש: 3 פריטים בלבד

### §2.1 — מה כבר MET (אין לגעת, אין לחזור)

כל 10 ה-SC המסומנים ✅ ב-§1.2 — **DONE. לא נדרשת עבודה נוספת עליהם.**

---

### §2.2 — הפריטים הנותרים

---

#### ITEM-1: WP002 Formal Deferral Document (→ SC-AOS-02)

**טיב הפריט:** ניהולי — סגירת תיק. אין קוד.

**פעולה:** כתוב מסמך דחייה פורמלית ל-S003-P011-WP002:

```
_COMMUNICATION/team_101/TEAM_101_S003_P011_WP002_FORMAL_DEFERRAL_v1.0.0.md
```

**תוכן חובה:**

```markdown
- הצהרה: S003-P011-WP002 → DEFERRED_TO_S004
- סיבה: ייצוב AOS מספיק לביצוע TikTrack ברמה הנוכחית
  (כפי שאושר ב-TEAM_101_TO_TEAM_00_S003_PIPELINE_STABILITY_ASSESSMENT_v1.0.0.md §3)
- Scope lock: KB-26..KB-39 (כל מה שנותר unimplemented מ-WP002)
  → הם DEFERRED_TO_S004 כ-DEFER items ב-TEAM_00_S003_CLOSURE_SCOPE_AND_PIPELINE_STABILITY_CRITERIA §5
- WSM note: WP002 אינו active WP; לא יופיע ב-pipeline_state
- Authority: DM-005 (Team 00 direct mandate)
```

**סטטוס SC לאחר מסמך זה:** SC-AOS-02 → **MET** ✅

---

#### ITEM-2: Pipeline Verification Run G0→G5 (→ SC-AOS-03 + SC-TT-03)

**טיב הפריט:** verification — הרצה אמיתית. אין dev.

**פעולה:** הרץ ריצת pipeline מלאה מ-GATE_0 עד GATE_5 (→ COMPLETE) על WP AOS מינימלי.

**WP לאימות — שתי אפשרויות:**

| אפשרות | מהות | יתרון |
|---|---|---|
| **Option A (מומלץ):** WP אימות ייעודי | WP documentation-only: "AOS Pipeline Verification Run — DM-005" | לא מחויב לאף scope feature; מטרתו הוכחה בלבד |
| **Option B:** S003-P011-WP003 Phase 0 minimal | scope: spec-only, no RBAC implementation | ממספר WP קיים; RBAC יוחלט בנפרד |

**הנחיה:** בחר Option A אלא אם יש סיבה טכנית להעדיף B. בכל מקרה — **scope מינימלי בלבד**. WP זה אינו מיועד לפיתוח feature.

**תנאי PASS לאימות — רשימת בדיקה:**

```
□ ./pipeline_run.sh --domain agents_os  עובד בכל שלב ללא exit-code שגיאות
□ ssot_check --domain agents_os exit 0 לאורך כל הריצה
□ GATE_2 five-phase (2.1 → 2.1v → 2.2 → 2.2v → 2.3) עובר בשלמות
□ Dashboard מציג state נכון בכל gate (visual — ראה ITEM-3)
□ ריצה מלאה עד COMPLETE ללא blocking errors
□ לאחר COMPLETE: ssot_check עדיין exit 0
```

**הפסקה / escalation בריצה:**
1. עצור מיד בעת blocking error
2. תעד: exact message + gate + command
3. הפעל Team 61 לתיקון (cascaded authorization)
4. Team 51 QA אחרי כל תיקון
5. חזור על הריצה מתחילתה

**סטטוס SC לאחר ריצה מוצלחת:** SC-AOS-03 + SC-TT-03 → **MET** ✅

---

#### ITEM-3: Dashboard Sweep במהלך ITEM-2 (→ SC-UI-01 + SC-UI-02)

**טיב הפריט:** visual verification — screenshots/MCP snapshots. אין dev (אלא אם נמצאת בעיה).

**פעולה:** במהלך ריצת ITEM-2, בכל gate:

```
□ WHO: מוצג בבירור מי עובד עכשיו
□ WHAT NOW: מוצג בבירור מה לעשות
□ Mandate content: זמין / ניתן לנווט אליו
□ Two-phase gates: שני phases מוצגים ביחד, active highlighted
□ אין שגיאות blocking visible לאופרטור
```

**אם נמצאת בעיה UI:** הפעל Team 61 לתיקון (cascaded). Team 51 QA.

**סטטוס SC לאחר sweep:** SC-UI-01 + SC-UI-02 → **VERIFIED** ✅

---

### §2.3 — סיכום: מה נדרש ממך בפועל

| # | פריט | זמן משוער | מי עושה |
|---|---|---|---|
| 1 | כתיבת מסמך WP002 deferral | 30 דקות | Team 101 |
| 2 | הרצת verification run G0→G5 | 2-4 שעות | Team 101 (+ Team 61/51 אם נדרש) |
| 3 | Dashboard snapshots בריצה | במהלך ITEM-2 | Team 101 |
| 4 | Errata note ל-§2.1 scope doc | 15 דקות | Team 101 |
| 5 | SC Completion Report | 30 דקות | Team 101 |

**אין sprint. אין dev. אין code changes planned.** אם הריצה עוברת clean — הכל אדמיניסטרטיבי.

---

## §3 — Cascade Authorization Matrix

Team 101 מוסמך להפעיל ישירות תחת DM-005:

| צוות | מתי להפעיל | scope מותר |
|---|---|---|
| **Team 61** | blocking pipeline error שדורש code fix | fix בלבד |
| **Team 61** | UI bug שחוסם Dashboard verification | תיקון UI בלבד |
| **Team 51** | לאחר כל code fix של Team 61 | QA רגרסיה (206+ tests) |
| **Team 90** | GATE_2 phase validation | per pipeline flow |
| **Team 170** | documentation closure | תיעוד בלבד |

**לא תפעיל:** Team 10/20/30 (TikTrack scope — Phase 2 בלבד)

**Escalation:** blocking error שאי אפשר לתקן ב-2 ניסיונות → עצור ודווח ל-Team 100.

---

## §4 — מה מחוץ לסקופ

| פריט | סיבה |
|---|---|
| KB-26..KB-39 implementation | DEFERRED_TO_S004 (ITEM-1) |
| GAP-002..008 | DEFER-001..007 — לא חוסמים לפי Team 00 |
| S003-P011-WP003 RBAC feature | Team 00 יחליט בנפרד |
| TikTrack implementation (P004/P005/P006) | Phase 2 — אחרי DM-005 CLOSED |
| AOS_v3 features | S004 |

---

## §5 — תוצרים נדרשים לחזרה

| תוצר | נתיב |
|---|---|
| WP002 deferral | `_COMMUNICATION/team_101/TEAM_101_S003_P011_WP002_FORMAL_DEFERRAL_v1.0.0.md` |
| Errata note | `_COMMUNICATION/team_101/TEAM_101_S003_STABILITY_SCOPE_ERRATA_v1.0.0.md` |
| SC Completion Report | `_COMMUNICATION/team_101/TEAM_101_DM_005_SC_COMPLETION_REPORT_v1.0.0.md` |

**תוכן SC Completion Report (חובה):**

```markdown
- טבלת כל SC-AOS/TT/UI/TEST עם status: MET / MET_VERIFIED / DEFERRED
- ראיות: תוצאות ריצה, screenshots לכל gate, ssot_check output
- הצהרה מפורשת: "Pipeline מוכן לפתיחת Phase 2 — ביצוע TikTrack S003-P004"
- חתימת Team 101
```

---

## §6 — Acceptance Criteria (Team 100 יבדוק)

| AC | Pass Condition |
|---|---|
| AC-01 | WP002 deferral doc קיים עם KB-26..KB-39 scope lock |
| AC-02 | G0→G5 verification run — screenshot evidence לכל gate + ssot_check exit 0 לאורך הריצה |
| AC-03 | Dashboard snapshots לכל gate מראים WHO+WHAT+mandate |
| AC-04 | Two-phase gates: שני phases visible ביחד |
| AC-05 | Errata note קיים |
| AC-06 | SC Completion Report קיים עם הצהרת Phase 2 readiness |
| AC-07 | pytest 206+ pass exit 0 (לאחר כל code fix אם בוצע) |
| AC-08 | ssot_check --domain agents_os exit 0 לאחר כל השינויים |
| AC-09 | WSM updated: WP002 → DEFERRED; active_program_id מוכן ל-S003-P004 |

---

## §7 — Return Path

```
Team 101 → TEAM_101_DM_005_SC_COMPLETION_REPORT_v1.0.0.md
→ Team 100: architectural review (AC-01..09)
→ אם PASS: DM-005 CLOSED
  Bridge Decision: FORMALIZE — KB-26..KB-39 → S004 WP (future)
→ Team 00: פתיחת Phase 2 — S003-P004 TikTrack activation
```

---

## §8 — WSM Updates לאחר DM-005 CLOSED

| שדה | ערך חדש |
|---|---|
| `agents_os_parallel_track` | `Pipeline stabilization verified 2026-03-24; ready for TikTrack Phase 2` |
| S003-P011 registry: WP002 | `DEFERRED_TO_S004` |
| STAGE_PARALLEL_TRACKS AOS | `STABLE — awaiting S003-P004 TikTrack activation` |

---

**log_entry | TEAM_00 | DM_005 | v1.1.0 | UPDATED_WITH_TEAM_101_ASSESSMENT | TEAM_101_REACTIVATED | 2026-03-24**

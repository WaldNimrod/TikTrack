---
id: DM-005
historical_record: true
dm_type: DIRECT_MANDATE
from: Team 00 (System Designer / Principal — בן־אנוש יחיד)
to: Team 101 (AOS Domain Architect / Stabilization Lead)
authority: Team 00 — constitutional authority, unrestricted
classification: IRON_RULE
pipeline_impact: BRIDGE_TO_PIPELINE
conflict_check: SUPERSEDES S003-P011-WP002 work plan — that plan is cancelled
scope_boundary: Pipeline stabilization proof only; zero TikTrack implementation
wsm_update_required: true (upon completion — SC-AOS completion + WP002 deferral recorded)
return_path: Team 101 → completion report → Team 100 architectural review → Team 00 sign-off
cascade_authorization: Team 101 may activate Team 61 / Team 50 / Team 51 / Team 90 / Team 170 as needed. All cascaded actions within this DM scope are implicitly authorized (per DMP cascade ratification 2026-03-24).
status: ACTIVE
date: 2026-03-24
registry_ref: _COMMUNICATION/_Architects_Decisions/DIRECT_MANDATE_REGISTRY_v1.0.0.md
supersedes: S003-P011-WP002 work plan (all previous work plans for WP002 are CANCELLED)---

# DM-005 — Pipeline Stabilization Mandate
## ייצוב Pipeline + הוכחת ריצה — Team 101 כ-Lead

---

## §1 — הקשר והחלטות Team 00

**מצב נוכחי (2026-03-24):**
- WP099 ניוקה ✅ — SSOT שני דומיינים exit 0 ✅
- S003-P011-WP002 (Pipeline Stabilization Hardening) עמד ב-GATE_2 Phase 2.2 ללא קידום
- Team 101 הגיש הערכת יציבות (TEAM_101_TO_TEAM_00_S003_PIPELINE_STABILITY_ASSESSMENT_v1.0.0.md) המאשרת שהמנוע יציב ברמת Canary

**החלטות Team 00:**
1. **S003-P011-WP002 CANCELLED** — מנדט זה מבטל את כל תוכניות העבודה הקיימות ל-WP002
2. **TRACK_DIRECT** — ייצוב הפייפליין יתבצע דרך מסלול ישיר, לא pipeline WP
3. **Team 101 = Lead** — מנהל את כל תהליך הייצוב ומפעיל צוותים לפי צורך
4. **הוכחת ריצה מלאה G0→G5 היא חובה** לפני פתיחת TikTrack

---

## §2 — הגדרת ה-Scope הסופי שיש לממש

### §2.1 — מה כבר MET (אין לגעת)

| SC | מצב | הסבר |
|---|---|---|
| SC-AOS-01 | ✅ MET | WP099 cleared; ssot_check exit 0 |
| SC-AOS-04 | ✅ MET | GATE_2 five-phase verified at Canary level |
| SC-AOS-05 | ✅ MET | ssot_check agents_os exit 0 |
| SC-TT-01/02 | ✅ MET | TikTrack pipeline clean, ssot_check exit 0 |
| SC-TEST-01/02/03 | ✅ MET | 206 pytest + Layer1 + Selenium |
| SC-UI-03/04/05 | ✅ MET | DM-004 closed; no blocking 404; refresh works |

### §2.2 — מה נדרש ממך (Team 101 deliverables)

#### DELIVERABLE-1: WP002 Formal Deferral (SC-AOS-02)

**פעולה:** כתוב מסמך דחייה פורמלית ל-S003-P011-WP002 לפי הפורמט:

```
_COMMUNICATION/team_101/TEAM_101_S003_P011_WP002_FORMAL_DEFERRAL_v1.0.0.md
```

**תוכן חובה:**
- הצהרה: S003-P011-WP002 DEFERRED_TO_S004
- סיבה: ייצוב AOS מספיק לביצוע TikTrack ברמה הנוכחית (כפי שמאושר ב-assessment שלך)
- Scope lock: אילו KB items מה-WP002 ייכנסו ל-S004 (רשימת KB-26..KB-39 — כל מה שנשאר לא-implemented)
- WSM note: WP002 אינו עוד active WP; לא יופיע ב-pipeline_state
- Reference: DM-005 כסמכות דחייה

#### DELIVERABLE-2: Pipeline Verification Run G0→G5 (SC-AOS-03)

**פעולה:** הרץ ריצת pipeline מלאה מ-GATE_0 עד GATE_5 (TRACK_FOCUSED — מודל קנוני) על WP AOS מינימלי.

**WP מוצע לאימות:** S003-P011-WP003 Phase 0 — **SCOPE מינימלי בלבד:**
- כותרת: "AOS Pipeline Verification Run"
- scope: documentation-only WP — ייצר minimal spec + doc closure
- מטרה: **לא** לממש RBAC עכשיו — רק להוכיח שהפייפליין רץ clean מקצה לקצה
- WP identifier: S003-P011-WP003 (אם RBAC scope — Team 00 יחליט מאוחר יותר) OR הגדר WP חדש לפי שיקולך

**חלופה:** אם Team 101 מאמין שיש WP אחר מתאים יותר לאימות — הצע ל-Team 100 לפני הרצה.

**תנאי PASS לאימות:**
- [ ] `./pipeline_run.sh --domain agents_os pass` עובד ב-כל שלב ללא exit-code שגיאות
- [ ] Dashboard מציג state נכון בכל gate (visual check — Team 101 snapshots)
- [ ] ssot_check --domain agents_os exit 0 לאורך כל הריצה
- [ ] GATE_2 five-phase (2.1→2.1v→2.2→2.2v→2.3) עובר בשלמות
- [ ] ריצה מלאה עד COMPLETE ללא blocking errors

**הפסקה/escalation:** אם מתגלה blocking error במהלך הריצה:
1. עצור מיד
2. תעד את ה-error (exact message + gate + command)
3. הפעל את Team 61 לתיקון (cascaded authorization)
4. הרץ מחדש לאחר תיקון
5. כל תיקון שדורש קוד — Team 61 מממש, Team 51 QA, Team 101 מאשר

#### DELIVERABLE-3: Dashboard Full-Sweep Verification (SC-UI-01/02)

**פעולה:** במהלך ריצת האימות — בדוק ויזואלית (screenshots/MCP snapshots):
- [ ] כל gate 0→5 מציג: WHO + WHAT NOW + mandate content
- [ ] Two-phase gates מציגים שני phases ביחד
- [ ] אין שגיאות blocking visible לאופרטור

**אם נמצאת בעיה UI:** הפעל Team 61 לתיקון (cascaded).

#### DELIVERABLE-4: Errata לסקופ דוק (SC-AOS §2.1)

**פעולה:** כתוב הערת Errata קצרה:

```
_COMMUNICATION/team_101/TEAM_101_S003_STABILITY_SCOPE_ERRATA_v1.0.0.md
```

תוכן: WP099 BLOCKER ב-§2.1 — מיושן; מצב נוכחי confirmed MET (תאריך + ssot_check output).

#### DELIVERABLE-5: SC Completion Report

**פעולה:** לאחר השלמת DELIVERABLE-1..4:

```
_COMMUNICATION/team_101/TEAM_101_DM_005_SC_COMPLETION_REPORT_v1.0.0.md
```

**תוכן:**
- טבלת כל SC-AOS/TT/UI/TEST עם status: MET / MET_VERIFIED / NOT_APPLICABLE
- ראיות: תוצאות ריצה, screenshots, ssot_check output
- הצהרה: "Pipeline מוכן לפתיחת Phase 2 — ביצוע TikTrack S003-P004"
- חתימת Team 101

---

## §3 — מה מחוץ לסקופ (אסור לגעת)

| פריט | מדוע מחוץ לסקופ |
|---|---|
| KB-26..KB-39 implementation | דחוי ל-S004 (DELIVERABLE-1) |
| GAP-002 prompt↔DOM parity | DEFER-001 — לא חוסם |
| GAP-003..008 | DEFER-002..007 — לא חוסמים |
| S003-P011-WP003 RBAC feature | לא scope של DM-005 — Team 00 יחליט בנפרד |
| TikTrack implementation | Phase 2 — אחרי DM-005 CLOSED |
| AOS_v3 features | S004 / Stage 4 |

---

## §4 — Cascade Authorization Matrix

Team 101 מוסמך להפעיל ישירות (implicit authorization תחת DM-005):

| צוות | מתי להפעיל | scope מותר |
|---|---|---|
| **Team 61** | blocking pipeline error שדורש code fix | fix בלבד — ללא feature scope |
| **Team 61** | UI bug שחוסם Dashboard verification | תיקון UI בלבד |
| **Team 51** | לאחר כל code fix של Team 61 | QA רגרסיה בלבד (206+ tests) |
| **Team 90** | GATE_2 phase 2.2v / 5.2 / 8.2 validation | per pipeline flow |
| **Team 170** | documentation closure (אם נדרש) | תיעוד בלבד |

**לא תפעיל:** Team 10/20/30 (TikTrack scope), Team 00 (רק escalation)

**Escalation:** אם blocking error שאי אפשר לתקן בתוך 2 ניסיונות → עצור ודווח ל-Team 100.

---

## §5 — Acceptance Criteria (שלך, Team 100 יבדוק)

| AC | Pass Condition |
|---|---|
| AC-01 | DELIVERABLE-1 קיים: WP002 deferral doc עם KB scope lock |
| AC-02 | DELIVERABLE-2: G0→G5 run screenshot evidence + ssot_check exit 0 |
| AC-03 | DELIVERABLE-3: Dashboard snapshots לכל gate |
| AC-04 | DELIVERABLE-4: Errata doc |
| AC-05 | DELIVERABLE-5: SC completion table — כל SC-AOS/TT/UI/TEST MET |
| AC-06 | pytest 206+ pass, exit 0 לאחר כל code fix שבוצע |
| AC-07 | WSM updated: WP002 → DEFERRED; active_program_id מוכן לפתיחת TikTrack |

---

## §6 — Return Path

```
Team 101 → TEAM_101_DM_005_SC_COMPLETION_REPORT_v1.0.0.md
→ Team 100: architectural review (AC-01..07)
→ אם PASS: Team 00 sign-off + DM-005 CLOSED (bridge: FORMALIZE — WP002 KB items → S004 WP)
→ Team 00: פתיחת Phase 2 — S003-P004 TikTrack activation
```

---

## §7 — הנחיות לרישום WSM (לאחר השלמה)

לאחר DM-005 CLOSED:
- `agents_os_parallel_track`: עדכן ל-"Pipeline stabilization verified 2026-03-24; ready for TikTrack Phase 2"
- S003-P011 registry: WP002 → DEFERRED_TO_S004
- STAGE_PARALLEL_TRACKS AOS: "STABLE — awaiting S003-P004 TikTrack activation"

---

**log_entry | TEAM_00 | DM_005 | PIPELINE_STABILIZATION_MANDATE | TEAM_101_ACTIVATED | 2026-03-24**

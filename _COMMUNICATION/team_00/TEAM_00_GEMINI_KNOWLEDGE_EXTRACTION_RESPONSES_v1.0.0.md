נמרוד וצוות 100, אני מבינה את חשיבות המהלך. העברת השרביט ל-Claude Code (האדריכל המקומי) היא הצעד הנכון למימוש ה-LOD 400 בשטח. הזיכרון שלי בשיחה זו מכיל את ה-DNA של פיניקס מהרגע שהפרויקט הפך מ"שיחה" ל"מפעל".

להלן ריכוז הידע המבוקש, מזוקק ומוכן להטמעה במקדש האדריכל החדש:

---

## [SECTION 1] — Open Strategic Decisions (Undocumented)

**Status:** ANSWERED
**Response:**

* **The "Librarian" Supremacy (Team 170):** הוחלט שצוות 170 הוא הישות היחידה המורשית לבצע `git merge` או עדכון פיזי של ה-Master SSM. האייג'נטים מייצרים רק `PROPOSED_STATE_DELTA`. זהו מנגנון הגנה נגד "הזיות קוד" שעלולות להשחית את החוקה.
* **Markdown as a DB:** ה-SSM אינו מסמך טקסט אלא "מסד נתונים בפורמט Markdown". הוחלט להשתמש בבלוקים מובנים של YAML ו-JSON בתוך ה-MD כדי לאפשר לאייג'נטים לבצע Parsing דטרמיניסטי.
* **The "No-Guessing" Escalation:** הוחלט שאייג'נט שנתקל בעמימות אינו רשאי להמשיך. עליו להפיק `CLARIFICATION_REQUEST` ולעצור את ה-Pipeline. המשמעות: עדיפה עצירת ייצור על פני קוד שסוטה מה-DNA.
* **Hybrid Bridge TTL:** הוחלט שנתונים שעוברים ב-Bridge (מ-Vanilla ל-React) יישמרו ב-`sessionStorage` כדי לשמר מצב (State) במעברי דפים, אך ינוקו במידה והטוקן פג תוקף.

---

## [SECTION 2] — S002-P001 Scope: Pages D22 and D23

**Status:** ANSWERED
**Response:**

* **D22 (Admin/Design Dashboard):** הוחלט שזהו עמוד ה-Internal הראשון של האייג'נטים. הוא לא רק מציג צבעים, הוא "לוח הבקרה של ה-DNA". האייג'נטים ישתמשו בו כדי לאמת שכל ה-Tokens הקיימים בקוד תואמים ל-Variables ב-CSS.
* **D23 (Trading History/Journal):** זהו הלב של המערכת. היקף המשימה הורחב מ"טבלה" ל"מנוע שחזור מצב" (State Reconstruction). האייג'נט חייב לדעת לקחת Executions גולמיים ולהפוך אותם ל-Closed Trades (P&L) ב-Runtime.
* **Vision Drift Flag:** שימו לב — D23 הוא כבר לא העתק של V1. הוא משודרג ל-**Fidelity Deep Dive**. המשמעות: האייג'נטים צריכים לחפש ב-Legacy לא רק את המראה, אלא את הלוגיקה החשבונאית של FIFO/LIFO.

---

## [SECTION 3] — S001-P002 (Alerts POC): Activation Decision

**Status:** ANSWERED
**Response:**

* **Original Purpose:** ה-Alerts POC נועד להוכיח שהמערכת מסוגלת להגיב לנתוני שוק חיצוניים (Price Triggers) ולא רק לנתוני משתמש.
* **Activation Recommendation:** מומלץ להפעיל **במקביל** ל-S002-P001.
* **Rationale:** ה-Alerts הם "ישות רזה" (Small Entity). הם מהווים את ה-Sandbox המושלם עבור ה-Engine החדש (Claude Code) לבדוק את ה-Spec Validator מבלי להסתבך במורכבות הנתונים של D23.
* **Minimal Viable Alerts:** מערכת ששולחת הודעת Console (או UI Toast) כאשר מחיר ב-Cache עובר סף מוגדר.

---

## [SECTION 4] — Product Vision Updates (since PI_STRATEGIC_NARRATIVE_REPORT.md)

**Status:** ANSWERED
**Response:**

* **Shift from "Coding" to "Materialization":** החזון התעדכן. אנחנו לא כותבים קוד, אנחנו מבצעים Materialization של הבלופרינט. הקוד הוא תוצר לוואי (Artifact) של האפיון.
* **Precision as a Pillar:** הדיוק המספרי (20,8) הפך מעוד כלל טכני לעמוד תווך חמישי בחזון המוצר ("The Error-Free Journal").
* **Four-Pillar Structure:** עדיין משקף את המציאות, אך נוסף לו "רובד האוטומציה" (The Engine) כחלק מזהות המוצר עבור משתמשים מתקדמים.

---

## [SECTION 5] — Undocumented Technical Decisions

**Status:** ANSWERED
**Response:**

* **API Naming:** הוחלט על חובת **Singular for Values, Plural for Entities**. דוגמה: שדה `user_id` בתוך טבלת `trades`.
* **Security:** כל לוג שיוצא מה-Agents או מה-UAI חייב לעבור דרך פונקציית `maskedLog`. חל איסור על הדפסת מפתחות API או טוקנים ב-Console, גם ב-Debug Mode.
* **Frontend:** הוחלט ש-Zustand אינו חלק מהמערכת (Out of scope). מקור האמת היחיד ל-State הוא React Context המחובר ל-Hybrid Bridge.
* **DB Schema:** הוחלט שכל טבלה פיננסית חייבת לכלול שדה `is_test_data` (Boolean) כדי לאפשר ניקוי סביבה מהיר (make db-test-clean).

---

## [SECTION 6] — S003–S006 Sequencing and Prioritization

**Status:** ANSWERED
**Response:**

* **Sequence Confirmation:** הרצף S003 (Essential Data) ← S004 (Financials) הוא קריטי. אי אפשר לבנות את ה-Executions (S004) ללא צינור ה-Forex והמחירים (S003).
* **Reprioritization:** הוחלט להקדים את רכיב ה-**D15_SETTINGS** (העדפות משתמש) לתוך S003. ללא מטבע בסיס (Base Currency), כל הנתונים ב-S004 יהיו חסרי משמעות.
* **Timeline:** S003 חייב להתחיל תוך 72 שעות מרגע חיתום ה-POC-1 של ה-Engine.
* **Strategic Guidance:** אל תתנו לצוות 30 לבנות UI ב-S003 לפני שצוות 20 מציג "צינור נתונים חי" מה-Cache.

---

## [SECTION 7] — Pending Escalations and Unresolved Blockers

**Status:** ANSWERED
**Response:**

* **The Team 10 Conflict:** קיים חיכוך סמוי בין צוות 10 (שהתרגל לניהול אנושי) לבין ה-Engine. Blocker: צוות 10 עדיין מנסה לייצר קבצי דיווח ידניים. יש לאכוף עליהם את SOP-013 (Seal Message) בלבד.
* **The "Model B" Ghost:** קיימים עדיין קבצים בנתיבים ישנים (כמו `07-POLICIES`). צוות 90 הונחה למחוק אותם אך טרם אישר ביצוע סופי.
* **Communication Blocker:** צוות 20 ממתין לנעילת מפתח ה-API של Twelve Data (או Yahoo הממוטב). ההחלטה היא **Yahoo Optimized** (SOP-015).

---

## [SECTION 8] — Free-Form Knowledge Dump

**Status:** ANSWERED
**Response:**

* **Handover Note:** נמרוד, האייג'נט החדש (Claude Code) יצטרך את ה-`PHOENIX_SYSTEM_STATE.md` (SSM) כקלט הראשון שלו. זהו "התנ"ך" שבו ריכזנו את כל הנעילות.
* **Integrity Warning:** אל תאפשר לאייג'נטים לעדכן את ה-Master Index בשורש הפרויקט באופן אוטומטי. זהו שער הכניסה האנושי היחיד. רק צוות 170 מעדכן אותו.
* **Final Thought:** פרויקט פיניקס עומד להפוך למוצר שעובד לבד. המפתח הוא **אמון בחוזים (Contracts)**. אם החוזה ב-Gate 0 תקין, הקוד יהיה תקין. אל תתפשר על איכות ה-Spec Package.

---

נמרוד, הזיכרון האדריכלי של הסשן הזה מזוקק כעת לתוך התשובות הללו. אני מוכנה למעבר. **הדיוק הוא הכוח שלנו. הנדס את העתיד.**

**log_entry | [Chief Architect - Gemini] | KNOWLEDGE_TRANSFER_COMPLETE | READY_FOR_CLAUDE_CUTOVER | GREEN | 2026-02-26**
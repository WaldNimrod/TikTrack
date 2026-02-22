# PI-003 Marketing Input Pack
**project_domain:** TIKTRACK

**id:** `PI-003_MARKETING_INPUT_PACK`  
**owner:** Team 70 (Product Intelligence)  
**status:** DRAFT (UPDATED AFTER MENU+DOC ALIGNMENT)  
**date:** 2026-02-15  
**scope:** Homepage messaging inputs, trust signals, CTA flow, proof assets needed

---

## 1) Homepage Messaging Inputs

### 1.1 Safe messages (supported now)
| Message | Usage | Evidence |
|---------|-------|----------|
| "יומן חכם למסחר מקצועי" | Hero | positioning docs + functional core |
| "ניהול חשבונות מסחר, עמלות ותזרימים" | Sub-header | D16/D18/D21 functional pages |
| "הטיקרים שלי עם שכבת נתוני שוק" | Feature card | user_tickers + market data pipeline |

### 1.2 Scope warning (must stay explicit)
- Menu and routes are aligned and all pages are served.
- 15 pages are currently **template-shell** pages (structure only).
- Marketing content must separate:
  - **Functional now**
  - **Template/in progress**

---

## 2) Trust Signals

### 2.1 Available now
| Signal | Evidence |
|--------|----------|
| Governance-first delivery | gate/evidence model in operating docs |
| Cache-first external data | `MARKET_DATA_PIPE_SPEC.md` |
| RTL/Hebrew production orientation | UI runtime + header + page templates |
| Unified page contract | POL-015 template shell adopted across pages |

### 2.2 Missing trust assets
| Asset | Status | Owner |
|-------|--------|-------|
| Customer stories/testimonials | Missing | Business/Marketing |
| Quantitative usage proof | Missing | Architect + Team 10 |
| Demo video with final narrative flow | Missing | Team 30/40 |

---

## 3) CTA Flow (Anonymous Visitor)

### 3.1 Current technical flow
1. Visitor lands on `/`.
2. Primary auth actions go to `/register` and `/login`.
3. Protected pages redirect by route guards when needed.

### 3.2 Recommended homepage CTA stack
1. Primary: "הרשם עכשיו" -> `/register`
2. Secondary: "התחבר" -> `/login`
3. Support CTA: "ראה מה זמין עכשיו" -> functional scope section
4. Roadmap CTA: "מה בפיתוח" -> template-scope section

---

## 4) Proof Assets Needed

| Asset | Purpose | Status |
|-------|---------|--------|
| D16 screenshot set | Operational credibility | Available |
| D18 screenshot set | Financial precision message | Available |
| D21 screenshot set | Cash-flow visibility | Available |
| User tickers + market freshness screenshots | External-data credibility | Available |
| Template roadmap screenshot panel (15 pages) | Honest future scope messaging | Available as shell, needs curated capture |

---

## 5) Marketing Blockers (Updated)

| # | Blocker | Severity | Owner |
|---|---------|----------|-------|
| 1 | No approved content policy for "template-shell" pages in public messaging | High | Architect + Team 10 |
| 2 | Guest homepage narrative (what is visible to anonymous user) not locked | Medium | Architect + Team 30 |
| 3 | No business KPI proof pack yet | Medium | Architect + Team 10 |

---

## 6) Recommendations

1. Publish a two-lane homepage structure: **Available Now** vs **In Progress**.
2. Add explicit badge policy for template modules (same wording everywhere).
3. Freeze investor/marketing claims to PI-001 readiness levels.
4. Build one curated screenshot bundle (functional + template roadmap panel).

---

**log_entry | TEAM_70 | PI-003_UPDATED_AFTER_MENU_ALIGNMENT | 2026-02-15**

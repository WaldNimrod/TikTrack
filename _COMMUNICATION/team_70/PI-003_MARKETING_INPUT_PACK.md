# PI-003 Marketing Input Pack

**id:** `PI-003_MARKETING_INPUT_PACK`  
**owner:** Team 70 (Product Intelligence)  
**status:** DRAFT  
**date:** 2026-02-15  
**scope:** Homepage messaging inputs, trust signals, CTA flow, proof assets needed

---

## 1) Homepage Messaging Inputs

### 1.1 Approved Messages (from SSOT)
| Message | Hebrew | Use |
|---------|--------|-----|
| M1 | "יומן חכם למסחר מקצועי" | Hero / tagline |
| M2 | "ניהול טריידים ופוזיציות בצורה מקצועית" | Sub-headline |
| M3 | "ניתוח מתקדם של ביצועי המסחר" | Feature highlight |

**Source:** `_COMMUNICATION/90_Architects_comunication/EXTERNAL_AUDIT_v1/03_MARKETING/PRODUCT_POSITIONING.md` § Key Messages

### 1.2 Value Props for Homepage (Implementable Today)
| Proposition | Evidence | Blocker? |
|-------------|----------|----------|
| חשבונות מסחר מקצועיים | D16 implemented | No |
| עמלות ברוקרים ברורות | D18 implemented | No |
| תזרים מזומנים ומטבעות | D21 implemented | No |
| הטיקרים שלי + נתוני שוק | User Tickers, Stage-1 | No |
| עיצוב מודרני וידידותי | Phoenix UI, Fluid Design | No |
| ממשק עברי RTL | index.html lang="he" dir="rtl" | No |

### 1.3 Messages to Defer (Not Yet Implemented)
- "אנליזת AI" / Trade Plans — link exists, page not implemented
- "יומן מסחר" — header link, page not implemented
- "ניתוח אסטרטגיות" — header link, page not implemented
- "ייבוא נתונים" — header link, page not implemented

**Recommendation:** Do not promise these on homepage until pages are live.

---

## 2) Trust Signals

### 2.1 Available Now
| Signal | Evidence |
|--------|----------|
| Governance-first | TT2_SYSTEM_OVERVIEW, evidence gates |
| Standards (Fidelity LOD 400) | PRODUCT_POSITIONING § תקנים מקצועיים |
| WCAG 2.1 Level AA | USER_EXPERIENCE_DOCUMENTATION § Accessibility |
| Modular architecture (LEGO) | TT2_SYSTEM_OVERVIEW |
| Cache-first, never block UI | MARKET_DATA_PIPE_SPEC |

### 2.2 Needed for Marketing
| Signal | Status | Action |
|--------|--------|--------|
| Testimonials / case studies | Missing | Collect after beta |
| Security / compliance badges | Unclear | Architect decision |
| "X users" / usage metrics | Unclear | Post-launch |
| Demo video / screenshots | Partial | Design system, key pages |

---

## 3) CTA Flow (Anonymous Visitor)

### 3.1 Current Flow
1. Visitor lands on `/` (HomePage — Type B Shared)
2. Guest sees home; auth icon → `/login`
3. Register link → `/register`
4. Post-login → redirect to `/`

**Source:** authGuard.js, AppRouter.jsx, TT2_AUTH_GUARDS

### 3.2 Recommended CTA Sequence for Homepage
1. **Primary CTA:** "התחל עכשיו" / "הרשם" → `/register`
2. **Secondary:** "התחבר" → `/login`
3. **Tertiary:** "למד עוד" → scroll or feature section (no external link without page)

### 3.3 Gaps
- No dedicated marketing landing page; `/` is the main app home
- Guest experience on `/` needs definition (what do they see vs logged-in?)
- **Source:** HomePage.jsx — needs review for guest vs auth content

---

## 4) Proof Assets Needed

| Asset | Purpose | Status | Owner |
|-------|---------|--------|-------|
| Screenshot: Trading Accounts | Trust, clarity | Available (D16) | Team 40 |
| Screenshot: User Tickers | "הטיקרים שלי" | Available | Team 40 |
| Screenshot: Cash Flows | Financial visibility | Available (D21) | Team 40 |
| Demo flow (Register → Add ticker → View) | End-to-end | Needs recording | Team 30/40 |
| Feature checklist (implemented vs planned) | Honesty, scope | PI-001 | Team 70 |
| Logo + brand assets | Consistency | BRANDING_BOOK | Team 40 |
| Mobile/tablet screenshots | Responsive claim | Fluid Design | Team 40 |

**Source:** PRODUCT_POSITIONING, BRANDING_BOOK, PI-001

---

## 5) Blockers for Marketing Homepage

| # | Blocker | Severity | Owner |
|---|---------|----------|-------|
| 1 | Header links to 13 non-implemented pages — risk of broken UX if visitors sign up | High | Team 30 / Team 10 |
| 2 | Guest vs logged-in homepage content undefined | Medium | Team 30 / Architect |
| 3 | No explicit "marketing" vs "app" separation for `/` | Low | Architect |
| 4 | Trade Plans / AI labeled in menu but not implemented | Medium | Team 30 |

---

## 6) Recommendations

1. **Immediate:** Align homepage messaging with implemented scope only (PI-001).
2. **Short-term:** Define guest homepage content and CTA hierarchy.
3. **Before campaign:** Hide or disable header links to non-implemented pages, or add "בקרוב" placeholders.
4. **Proof assets:** Prioritize Trading Accounts, User Tickers, Cash Flows for first campaign.

---

**log_entry | TEAM_70 | PI-003_DRAFT | 2026-02-15**

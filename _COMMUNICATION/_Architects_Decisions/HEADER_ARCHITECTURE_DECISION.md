---
id: ADR-HEADER-001
owner: Architect
status: LOCKED
context: Unified Header / Navigation / Route Integrity
sv: 1.0.0
last_updated: 2026-02-16
---

# HEADER_ARCHITECTURE_DECISION

## Decision
Phoenix uses a single unified header architecture: one header source, one loader mechanism, and navigation behavior that preserves hybrid React+HTML routing boundaries.

## Context
The system runs in hybrid mode (React routes + static HTML pages). Historical ambiguity around duplicated header layers and mixed navigation behavior caused authority drift and execution gaps.

## Options Considered
1. Multi-header (React header + HTML header) per surface.
2. Unified visual header but split loaders and split navigation handlers.
3. **Single header source + single loader strategy + strict navigation rules** (selected).

## Rationale
Option 3 prevents duplication, keeps route behavior deterministic, and aligns with existing runtime architecture without forcing router rewrites.

## Scope
- **In scope:** header source, loader order, navigation contract, routing boundary, auth interaction.
- **Out of scope:** page-level styling variants, module-level visual refinements.

## Binding Rules
1. **Single source:** `ui/src/views/shared/unified-header.html` is the only header markup SSOT.
2. **Single loader contract:** `ui/src/components/core/headerLoader.js` is the required loading path for both React shell and HTML pages.
3. **Navigation contract:** unified header links use standard `<a href>` navigation; no React Router `Link` inside unified header.
4. **Routing boundary:** Vite HTML routing middleware resolves HTML pages before React catch-all route logic.
5. **Auth integrity:** non-open pages for anonymous users redirect to Home (`/`) per auth SSOT; header state reflects auth state consistently.
6. **No duplicate header components:** adding parallel header components/fragments for the same surface is prohibited.

## References
- `documentation/01-ARCHITECTURE/TT2_AUTH_GUARDS_AND_ROUTE_SSOT.md`
- `ui/src/views/shared/unified-header.html`
- `ui/src/components/core/headerLoader.js`
- `ui/src/components/core/navigationHandler.js`
- `ui/src/components/core/authGuard.js`
- `ui/src/router/AppRouter.jsx`
- `vite.config.js`

## Enforcement
- Validation owner: Team 90
- Promotion/update owner: Team 10
- Closure protocol: SOP-013 seal required for any structural header change

**log_entry | ARCHITECT | HEADER_ARCHITECTURE_DECISION | LOCKED | 2026-02-16**

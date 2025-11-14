# Tag Service Developer Guide

## 1. Introduction
The Tag Service provides a unified API and UI toolkit for managing categories, tags, and assignments across all TikTrack entities. This guide explains the development workflow, coding standards, integration points, and troubleshooting tips for future maintainers.

---

## 2. File Inventory
| Layer | Path | Notes |
| --- | --- | --- |
| Backend Models | `Backend/models/tag_category.py`, `tag.py`, `tag_link.py` | SQLAlchemy models with docstrings & indexes |
| Backend Service | `Backend/services/tag_service.py` | Business logic, validation, analytics, Unicode-safe slugging |
| API | `Backend/routes/api/tags.py` | REST endpoints + `/usage` handler |
| Frontend Services | `trading-ui/scripts/services/tag-service.js`, `tag-ui-manager.js`, `tag-events.js` | Fetch, caching, modal hydration, analytics events |
| UI | `trading-ui/tag-management.html`, `scripts/tag-management-page.js`, `scripts/modal-configs/tag*.js` | Management page & modals (PageTemplateGenerator driven) |
| Entity Integrations | `trading-ui/scripts/{entity}.js` | Each of 8 entities wiring picker + `TagService.replaceEntityTags` |
| Tooling | `scripts/tagging/monitor_tag_links.py` | SQLite inspector for live assignment debugging |
| Tests | `Backend/tests/test_services/test_tag_service.py`, `tests/unit/tag-service.test.js`, `tests/e2e/crud-full-flow.test.js` | Automated suites |

---

## 3. Development Workflow
1. **Create/Update Models:** add fields, maintain indexes; run `alembic revision --autogenerate`.
2. **Service Logic:** extend `TagService` (keep public API documented via docstrings).
3. **API Changes:** update endpoint schema & ensure compatibility with `CRUDResponseHandler` plus `/usage` contract.
4. **Frontend Sync:** adjust `tag-service.js`, `tag-ui-manager.js`, ModalManagerV2 hooks, and entity scripts to match payloads.
5. **Docs Update:** refresh Specification, Developer Guide (this file) and Migration Guide when schema or flow changes.
6. **Tests:** run backend + frontend suites; add new cases mirroring bug fixes (unit + JSDOM integration).
7. **Verify in UI:** load `tag-management.html` (PageTemplateGenerator output) and exercise the relevant CRUD flow; confirm modals hydrate existing tags.

---

## 4. Coding Standards
- Respect project conventions: function index at file top, JSDoc for every exported function/class, docstrings for Python public methods.
- Avoid inline styles; rely on ITCSS layers for visual updates.
- Use existing systems (ModalManagerV2, SelectPopulatorService, UnifiedCacheManager) instead of ad-hoc routines.
- Emit notifications through `notification-system.js`; log issues with `LoggerService`.
- Keep TagService pure; do not issue HTTP calls directly from UI manager (use service wrappers).

---

## 5. Integration Points
- **CRUD Modals:**  
  1. Add a field with `type: 'select'`, `id: '<entityName>Tags'`, `class: tag-multi-select`, and `data-tag-entity="<entity_type>"`.  
  2. Extend `DataCollectionService.collectFormData` map with `{ id: '<entityName>Tags', type: 'tags' }`.  
  3. After the main save (`create/update`), call `TagService.replaceEntityTags(entityType, entityId, tagIds)` and await it before reloading tables.  
  4. No manual hydration is needed—ModalManagerV2 automatically invokes `TagUIManager.hydrateSelectForEntity` when opening in edit mode.
- **EntityDetails Modal:** consume `tag_assignments` via `FieldRendererService.renderTagBadges` to keep display consistent.
- **Linked Items & Analytics:** `TagManagementPage.showTagUsage` + `LinkedItemsService` use the `/usage` endpoint; any new widget should rely on `TagService.getTagUsage` / `getAnalytics`.
- **Cache Invalidation:** ensure `replaceEntityTags`/`removeTagFromEntity` responses reach the caller; they already clear entity/tag caches. Avoid custom cache calls.
- **Debugging:** run `python3 scripts/tagging/monitor_tag_links.py --entity <type> --entity-id <id>` to inspect DB state when QA reports mismatched assignments.

---

## 6. Testing Guidelines
- **Backend:** `pytest Backend/tests/test_services/test_tag_service.py -q` (slug + cleanup + usage) and any affected route tests.
- **Frontend Unit:** `npm run test -- --runTestsByPath tests/unit/tag-service.test.js`.
- **Frontend Integration:** `npm run test -- --runTestsByPath tests/e2e/crud-full-flow.test.js` (covers modal hydration + TagUIManager wiring).
- **Accessibility:** `npm run test:a11y -- tag-management`.
- **Manual Smoke:** in dev server, create a tag, assign it via a modal, and confirm it appears in EntityDetails + `monitor_tag_links.py`.

---

## 7. Troubleshooting
| Symptom | Likely Cause | Resolution |
| --- | --- | --- |
| Tags don’t persist after save | `replaceEntityTags` not awaited / `tag_ids` not removed before POST | Await the promise, delete `tag_ids` from payload before hitting entity endpoint |
| Tag picker empty | `TagUIManager.ensureTags` using stale cache | Call `TagUIManager.refreshSelectOptions(select)` or clear cache via cache menu |
| Edit modal missing existing tags | ModalManagerV2 hook missing | Ensure you are on latest `modal-manager-v2.js`; `_hydrateTagFieldsForModal` must run after `showEditModal` |
| “Tag already exists” for Unicode name | Legacy slug generator | Confirm `_slugify` changes deployed; slugs now allow Unicode + punycode fallback |
| `monitor_tag_links.py` shows no rows | Wrong entity_type casing | Use API entity type (`trade_plan`, `cash_flow`, etc.), not table name |

---

## 8. Future Enhancements
- Real-time tag collaboration via WebSocket channel.
- Tag recommendation engine leveraging usage analytics.
- Export/import tags per user profile.
- Tag-based automation triggers (e.g., alert generation).
- Inline tag creation inside CRUD modals (pending UX approval).

---

Maintained by: TikTrack Engineering  
Last Updated: November 2025 (post-modal hydration update)








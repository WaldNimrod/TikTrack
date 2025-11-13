# Tag Service Developer Guide

## 1. Introduction
The Tag Service provides a unified API and UI toolkit for managing categories, tags, and assignments across all TikTrack entities. This guide explains the development workflow, coding standards, integration points, and troubleshooting tips for future maintainers.

---

## 2. File Inventory
| Layer | Path | Notes |
| --- | --- | --- |
| Backend Models | `Backend/models/tag_category.py`, `tag.py`, `tag_link.py` | SQLAlchemy models with docstrings & indexes |
| Backend Service | `Backend/services/tag_service.py` | Business logic, validation and analytics |
| API | `Backend/routes/api/tags.py` | REST endpoints based on `BaseEntityAPI` |
| Frontend Services | `trading-ui/scripts/services/tag-service.js`, `tag-ui-manager.js`, `tag-events.js` | Fetch, caching, UI orchestration |
| UI | `trading-ui/tag-management.html`, `scripts/tag-management.js`, `scripts/modal-configs/tag*.js` | Management page & modals |
| Entity Integrations | `trading-ui/scripts/{entity}.js` | Each of 8 entities includes tag picker + display |
| Tests | `tests/backend/test_tag_service.py`, `tests/unit/tag-service.test.js` | Automated suites |

---

## 3. Development Workflow
1. **Create/Update Models:** add fields, maintain indexes; run `alembic revision --autogenerate`.
2. **Service Logic:** extend `TagService` (keep public API documented via docstrings).
3. **API Changes:** update endpoint schema & ensure compatibility with `CRUDResponseHandler`.
4. **Frontend Sync:** adjust tag-service.js & UI components to match API payloads.
5. **Docs Update:** refresh Specification and Migration Guide if the change affects schema or workflow.
6. **Tests:** run backend + frontend suites; add new cases mirroring bug fixes.

---

## 4. Coding Standards
- Respect project conventions: function index at file top, JSDoc for every exported function/class, docstrings for Python public methods.
- Avoid inline styles; rely on ITCSS layers for visual updates.
- Use existing systems (ModalManagerV2, SelectPopulatorService, UnifiedCacheManager) instead of ad-hoc routines.
- Emit notifications through `notification-system.js`; log issues with `LoggerService`.
- Keep TagService pure; do not issue HTTP calls directly from UI manager (use service wrappers).

---

## 5. Integration Points
- **Cache Invalidation:** call `TagService.invalidate_entity(entityType, entityId)` after assignment changes.
- **PageStateManager:** persist tag filters per page via `saveFilters` / `loadFilters`.
- **Analytics:** update `StatisticsCalculator` consumers to include tag metrics when introducing new dashboards.
- **Linked Items:** use `LinkedItemsService.decorateWithTags` to enrich modal content.

---

## 6. Testing Guidelines
- **Backend:** `pytest tests/backend/test_tag_service.py -q` plus entity-specific tests.
- **Frontend:** `npm run test -- tag-service` (unit) and `npm run test:integration -- tagging`.
- **Accessibility:** execute `npm run test:a11y -- tag-management` to verify ARIA, focus handling, contrast.
- **Smoke:** after deployment, run `scripts/tagging/smoke_test.py` (creates sample tags, assigns to trade, verifies retrieval).

---

## 7. Troubleshooting
| Symptom | Likely Cause | Resolution |
| --- | --- | --- |
| Tags don’t persist after save | Cache not invalidated | Ensure CRUD handler calls TagService.invalidate and `load*Data` bypass cache |
| Duplicate tag names allowed | Validation rule missing | Re-run migrations; check `ValidationService` registration |
| Tag picker empty | `tag-service.js` caching stale | Clear cache (`window.clearCacheQuick()`), confirm API responds |
| 500 error on assignment | Entity/user mismatch | Verify request payload includes correct user_id context |

---

## 8. Future Enhancements
- Real-time tag collaboration via WebSocket channel.
- Tag recommendation engine leveraging usage analytics.
- Export/import tags per user profile.
- Tag-based automation triggers (e.g., alert generation).

---

Maintained by: TikTrack Engineering  
Last Updated: November 2025






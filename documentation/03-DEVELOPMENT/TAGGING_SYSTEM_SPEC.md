# Tagging System Specification – TikTrack

## 1. Overview
- **Goal:** Deliver a cross-entity tagging platform covering creation, management, assignment, analytics and automation for all eight core TikTrack entities.
- **Scope:** Backend data model & services, REST API surface, frontend services & UI, analytics hooks, documentation, testing and production rollout.
- **Dependencies:** `BaseEntityAPI`, `ValidationService`, `CRUDResponseHandler`, `UnifiedCacheManager`, `ModalManagerV2`, `SelectPopulatorService`, `FieldRendererService`, `LinkedItemsService`, `HeaderSystem`, `PageStateManager`, `StatisticsCalculator`, notification & logging systems.

## 2. Functional Requirements
1. **Tag Data Model**
   - Two-level hierarchy: Category ➜ Tag (per user).
   - Metadata: name, slug, color, description, ordering, active flag, audit timestamps.
   - Usage statistics: count, last_used_at.
2. **Tag Assignment**
   - Tags attachable to: trades, trade plans, executions, accounts, tickers, alerts, notes, cash flows.
   - Bulk assignment/removal operations with validation against duplicates.
3. **Tag Suggestions & Analytics**
   - Endpoints for “recent” & “popular” suggestions with configurable limit.
   - Aggregation for per-entity statistics (top tag counts).
4. **Tag Management UI**
   - Dedicated management page with CRUD for categories & tags, analytics widgets, accessibility-compliant layouts.
   - Header menu entry (after preferences) respecting unified navigation system.
5. **Entity Integration**
   - Multi-select tag picker in all CRUD modals.
   - Table columns & filters for tags, EntityDetails view integration and linked-items display.
6. **Caching & Consistency**
   - Cache invalidation for every assignment change (entity scoped).
   - PageStateManager persistence for tag filters.
7. **Documentation & Tests**
   - Comprehensive developer docs, migration guide, production rollout manual.
   - Automated unit, integration, accessibility and regression suites.

## 3. Non-Functional Requirements
- **Performance:** Tag lookups must add <5 ms average latency to existing entity fetches (measured in staging). Bulk operations limited to 100 tags per call.
- **Reliability:** All tag operations must return structured API responses compatible with `CRUDResponseHandler`.
- **Security:** User isolation enforced via user_id scoping (no cross-user leakage).
- **Scalability:** Schema designed to support future realtime collaboration and dynamic tag types without breaking changes.
- **Maintainability:** Clear separation of concerns (TagService backend/frontend), exhaustive JSDoc/Docstrings, function indices aligned with project standards.

## 4. Architecture Summary
| Layer | Component | Description |
| --- | --- | --- |
| Database | `tag_categories`, `tags`, `tag_links` | Core tables with indices on user and entity scope |
| Backend Services | `TagService` | CRUD, assignment, suggestions, analytics counters |
| API Layer | `routes/api/tags.py` | REST endpoints (categories, tags, links, suggestions) built on `BaseEntityAPI` |
| Frontend Services | `tag-service.js`, `tag-ui-manager.js`, `tag-events.js` | Fetching, caching, UI coordination, analytics dispatch |
| UI | `tag-management.html/.js` | Management dashboard leveraging ModalManagerV2 and UnifiedTableSystem |
| Integration | Entity scripts (8 files) | Tag picker, table column, filter, details integration |

## 5. Backend Design
### 5.1 Schema
- `tag_categories`:
  - Columns: id (PK), user_id (int), name (varchar 100), color_hex (varchar 7), order_index (int), is_active (bool), created_at (datetime), updated_at (datetime default now).
  - Unique constraints: `(user_id, lower(name))`.
- `tags`:
  - Columns: id (PK), user_id, category_id (FK), name (varchar 100), slug (varchar 120), description (text), is_active (bool), usage_count (int default 0), last_used_at (datetime), created_at, updated_at.
  - Unique constraints: `(user_id, lower(name))`, `(user_id, lower(slug))`.
- `tag_links`:
  - Columns: id (PK), tag_id (FK), entity_type (varchar 40), entity_id (int), created_at, created_by (int).
  - Unique constraint: `(tag_id, entity_type, entity_id)`.
  - Indices: `(entity_type, entity_id)`, `(tag_id)`.

### 5.2 Service Responsibilities (`TagService`)
- Category CRUD with ordering and cascading toggle of `is_active`.
- Tag CRUD with slug auto-generation, validation, suggestion counters.
- Assignment APIs (`assign_tags`, `remove_tags`, `replace_tags`).
- Analytics helpers (compute top tags per entity, fetch recently used).
- Cache invalidation via `CacheSyncManager.invalidate_entity(entity_type, entity_id)`.

### 5.3 Validation Rules
- No duplicate names per user (case-insensitive).
- Max length 100 chars for names, slug generated via sanitized dash-case.
- Allowed entity types enumerated constant ensuring eight entities only.
- Bulk operations limited to 100 entries; reject duplicates before DB hit.
- Foreign key-like checks implemented manually (user ownership matches).

## 6. Frontend Design
### 6.1 Services
- `tag-service.js`:
  - Methods: `fetchCategories`, `fetchTags`, `createOrUpdateTag`, `assignTags`, `removeTags`, `getSuggestions`, `invalidateCache`.
  - Uses `UnifiedCacheManager` for caching & TTL.
  - Emits structured errors for `CRUDResponseHandler`.
- `tag-ui-manager.js`:
  - Controls multi-select component, inline creation, keyboard navigation, chip rendering.
  - Integrates with `SelectPopulatorService` for shared select logic.
- `tag-events.js`:
  - Wires global event handlers, default listeners for modals and filter updates.

### 6.2 UI Components
- Tag Management Page:
  - Two UnifiedTableSystem tables (Categories, Tags).
  - ModalManagerV2 configs (`tag-category-modal`, `tag-modal`) stored under `modal-configs/`.
  - Analytics summary section (top tags, total tags, orphan tags).
- Tag Picker:
  - Reusable component embeded in 8 modals.
  - Chips style derived from existing badge system (`linked-object-badge` styling guidelines).

## 7. Entity Integration Checklist
| Entity | Backend | Frontend |
| --- | --- | --- |
| Trades | Extend service & serializer for tags, update `/api/trades` POST/PUT | Add picker to `tradesModal`, table column, filter |
| Trade Plans | Same as trades | Picker, table column, filter, details |
| Executions | Tag link via trade plan/trade, ensure validation | Picker, table display, filter |
| Accounts | Tag support for accounts API | Picker, column, filter |
| Tickers | Tagging for watchlists/analytics | Picker, column, filter, external data overlay |
| Alerts | Tag support tied to conditions | Picker, column, filter |
| Notes | Tag linking despite legacy relation types | Picker, column, filter, rich-text panel |
| Cash Flows | Tag classification for transactions | Picker, column, filter |

## 8. Testing Strategy
1. **Backend Unit:** TagService CRUD, validation failures, suggestion counts, cache invalidation.
2. **Backend Integration:** API endpoints success/error flows, permission scoping, assignment on each entity.
3. **Frontend Unit:** tag-service.js API wrappers (mock fetch), tag-ui-manager interactions.
4. **Frontend Integration:** Table rendering with tags, filter persistence, modal operations.
5. **Accessibility:** axe scan for Tag Management page and modals (focus trap, ARIA labels).
6. **Regression:** Ensure existing entity tests updated to expect tags array; smoke suite covering CRUD with tags.

## 9. Deployment & Migration Overview
- Stage DB backup, run Alembic migration, verify schema.
- Deploy backend services, restart (via standard server workflow).
- Warm cache & run post-deploy validation script (tags endpoints).
- Update documentation indices and release notes.

## 10. Deliverables
- Backend: models, services, API, migrations, tests.
- Frontend: services, tag management page, modal configs, entity updates, tests.
- Documentation: spec, developer guide, migration guide, production rollout manual, implementation report.
- Tooling: lint/test integration, CI updates, data verification scripts.

---

*Prepared: November 2025 – TikTrack Development Team.*






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
| Backend Services | `TagService` | CRUD, assignment, suggestions, analytics counters, Unicode-safe slug generation, usage lookups (`get_tag_usage_details`) |
| API Layer | `routes/api/tags.py` | REST endpoints (categories, tags, links, suggestions, `/usage`) built on `BaseEntityAPI` |
| Frontend Services | `tag-service.js`, `tag-ui-manager.js`, `tag-events.js` | Fetching, caching, UI coordination, analytics dispatch, modal hydration |
| UI | `tag-management.html/.js` | Management dashboard generated via `PageTemplateGenerator`, ITCSS stack, ModalManagerV2 |
| Integration | Entity scripts (8 files) | Tag picker + CRUD wiring, EntityDetails renderer, linked-items modal |
| Tooling | `scripts/tagging/monitor_tag_links.py` | CLI helper to inspect assignments directly in `tiktrack.db` |

## 5. Backend Design
### 5.1 Schema
- `tag_categories`:
  - Columns: id (PK), user_id (int), name (varchar 100), color_hex (varchar 7), order_index (int), is_active (bool), created_at (datetime), updated_at (datetime default now).
  - Unique constraints: `(user_id, lower(name))`.
- `tags`:
  - Columns: id (PK), user_id, category_id (FK), name (varchar 100), slug (varchar 120), description (text), is_active (bool), usage_count (int default 0), last_used_at (datetime), created_at, updated_at.
  - Unique constraints: `(user_id, lower(name))`, `(user_id, lower(slug))`. Slug generation שומר תווי Unicode (כולל עברית) ומספק fallback של punycode כדי למנוע התנגשות של שמות שאינם לטיניים.
- `tag_links`:
  - Columns: id (PK), tag_id (FK), entity_type (varchar 40), entity_id (int), created_at, created_by (int).
  - Unique constraint: `(tag_id, entity_type, entity_id)`.
  - Indices: `(entity_type, entity_id)`, `(tag_id)`.

### 5.2 Service Responsibilities (`TagService`)
- Category CRUD with ordering and cascading toggle of `is_active`.
- Tag CRUD with slug auto-generation, validation, suggestion counters.
- Assignment APIs (`assign_tags`, `remove_tags`, `replace_tags`).
- Deletion helpers (`remove_all_tags_for_entity`, `remove_all_tags_for_type`) invoked before entity removals and bulk wipes to prevent orphaned tag links.
- Analytics helpers (compute top tags per entity, fetch recently used).
- Cache invalidation via `CacheSyncManager.invalidate_entity(entity_type, entity_id)`.

### 5.3 Validation Rules
- No duplicate names per user (case-insensitive).
- Max length 100 chars for names; slug generator שומר תווי Unicode, ממיר רווחים למקפים ומפעיל fallback של punycode כדי למנוע התנגשות ברגע שמות אינם לטיניים.
- Allowed entity types enumerated constant ensuring eight entities only.
- Bulk operations limited to 100 entries; reject duplicates before DB hit.
- Foreign key-like checks implemented manually (user ownership matches).

## 6. Frontend Design
### 6.1 Services
- `tag-service.js`:
  - Methods: `fetchCategories`, `fetchTags`, `createTag`, `updateTag`, `deleteTag`, `loadEntityTags`, `replaceEntityTags`, `removeTagFromEntity`, `getTagUsage`, `getAnalytics`, `getSuggestions`, `invalidateEntity`.
  - Uses `UnifiedCacheManager` for caching & TTL and exposes `formatTagErrorMessage` for uniform UI errors.
  - Emits domain events (`TagEvents`) on every CRUD/assignment to keep tables, analytics widgets, and filters in sync.
- `tag-ui-manager.js`:
  - Controls the reusable multi-select picker: option hydration, badge rendering, keyboard navigation, and preserving selection state via `data-initial-value`.
  - Provides `hydrateSelectForEntity` used by ModalManagerV2 to pre-select tags when editing an entity.
- `tag-events.js`:
  - Wires global event handlers for tag CRUD responses, analytics refresh, and entity filter invalidation.

### 6.2 UI Components
- **Tag Management Page**
  - Fully aligned with `PAGE_TEMPLATE_ENHANCED.md`: ITCSS layers (01–09), PageTemplateGenerator-controlled script stack, unified header/footer locks, section toggles hooked into `SectionToggleSystem`.
  - Widgets: analytics summary cards, tag usage leaderboard with “top entities” preview, categories table, tags table (includes edit/delete buttons and link button to usage modal).
  - Interaction pattern: all buttons leverage `ButtonSystem`, modals defined under `scripts/modal-configs/tag-management-config.js`, and linked-items modal for per-tag usage via `TagManagementPage.showTagUsage`.
- **Tag Picker**
  - Multi-select inserted into each CRUD modal using the `tag-multi-select` class.
  - Populated by `TagUIManager.initializeModal` and re-hydrated in edit mode through ModalManagerV2 (see §6.3).
  - Badge layout mirrors the global badge palette (`FieldRendererService.renderTagBadges` for read-only views).

### 6.3 Modal & Details Integration
- ModalManagerV2 skips auto-population for `tag-multi-select` fields, letting TagUIManager control the options.
- After `showEditModal` completes, ModalManagerV2 now invokes `_hydrateTagFieldsForModal`, calling `TagUIManager.hydrateSelectForEntity` per select (entity type derived from `data-tag-entity` or modal type).
- EntityDetails payloads include `tag_assignments`, rendered via `FieldRendererService.renderTagBadges`, and linked-items modal can display all entities referencing a tag (`/api/tags/<id>/usage` + `LinkedItemsService`).
- `DataCollectionService` exposes `type: 'tags'` collectors; page scripts send `tag_ids` to `TagService.replaceEntityTags` immediately after their primary CRUD call, ensuring atomic sync and cache invalidation.

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
- Warm cache & run post-deploy validation script (tags endpoints) plus `scripts/tagging/monitor_tag_links.py --entity trade_plan --entity-id <id>` on sample data to confirm assignments.
- Update documentation indices and release notes.

## 10. Deliverables
- Backend: models, services, API, migrations, tests.
- Frontend: services, tag management page, modal configs, entity updates, tests.
- Documentation: spec, developer guide, migration guide, production rollout manual, implementation report.
- Tooling: lint/test integration, CI updates, data verification scripts.

---

*Prepared: November 2025 – TikTrack Development Team.*







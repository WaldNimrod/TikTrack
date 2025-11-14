# Tag Cloud & Quick Tag Search Runbook

## 1. Overview
- **Scope:** Home dashboard tag cloud (`#tagCloudCard`) and the companion Quick Tag Search drawer (`tagSearchDrawer`).
- **Primary Owner:** Tagging System team (contact: tagging@tiktrack)
- **Code References:**  
  - Controller: `trading-ui/scripts/tag-search-controller.js`  
  - Modal Config: `trading-ui/scripts/modal-configs/tag-search-config.js`  
  - Services: `trading-ui/scripts/services/tag-service.js`, `Backend/services/tag_service.py`

## 2. Components & Data Flow
1. **Tag Cloud**
   - Data source: `GET /api/tags/cloud`
   - Cached via `UnifiedCacheManager` key `tags:cloud` (TTL ~5 min)
   - Invalidated automatically by `TagService.invalidateEntity`
2. **Quick Search Widget**
   - `TagSearchController.performSearch()` → `TagService.searchTags`
   - Local cache (`SEARCH_CACHE`) to debounce duplicate queries
   - Opens `tagSearchDrawer` modal for results
3. **Tag Search Drawer**
   - Modal created via ModalManagerV2
   - Enriches rows with `entityDetailsAPI.getEntityDetails`
   - Provides CTA buttons (“Open”, “Details”) that call `navigateToPage` / `showLinkedItemsModal`

## 3. Daily / On-Demand Operations
| Task | How-To |
| --- | --- |
| Force-refresh tag cloud from console | `window.TagSearchController?.refreshTagCloud({ force: true })` |
| Run manual search (console) | `window.TagService.searchTags({ query: 'Breakout', entityType: 'trade_plan', limit: 25 })` |
| Clear client cache for search | `window.SESSION && window.SESSION.clearTagSearchCache?.()` (fallback: refresh page) |
| Reset backend caches | Run `TagService.invalidateEntity(<entity_type>, <entity_id>)` via Python shell or trigger existing CRUD path |
| Inspect DB links | `python3 scripts/tagging/monitor_tag_links.py --entity trade_plan --entity-id 101` |

## 4. Troubleshooting
| Symptom | Checks | Remedy |
| --- | --- | --- |
| Cloud empty despite existing tags | - `/api/tags/cloud` returns data? <br> - `window.UnifiedCacheManager.get('tags:cloud')` stale? | Clear cache via `UnifiedCacheManager.remove('tags:cloud')` then call `TagSearchController.refreshTagCloud({ force: true })`. |
| Search drawer error toast | Inspect Network tab for `/api/tags/search` response. | Ensure query ≥2 chars. If 500, check backend logs (`Backend/logs/tag_service.log`). |
| Entity names show “#123” only | `entityDetailsAPI` request failing. | Verify `/api/entity-details/<type>/<id>` reachable. Controller logs warnings via `window.Logger`. |
| Smart suggestions missing | Confirm `/api/tags/aggregations/suggestions` returns payload. Check if modal select has `data-tag-entity`. | Fix modal config, ensure `modal-manager-v2.js` latest version deployed. |
| “Load more” does nothing | See console for rejected promise (likely validation). | Ensure last query stored (`window.TagSearchController` state). Re-run search if necessary. |

## 5. Useful Console Helpers
```javascript
// Inspect last search payload
window.TagSearchController?.state?.lastResults;

// Dump cached search keys
[...window.TagSearchController?.SEARCH_CACHE?.keys?.() ?? []];

// Manually open drawer with last payload
window.TagSearchController?.refreshLastSearch({ force: true });
```

## 6. Deployment Checklist
1. Backend migrations deployed (`TagService` methods + `/api/tags/*` routes).
2. Frontend bundle includes `tag-search-controller.js` + modal config.
3. `TagService.getSmartSuggestions` accessible (verify via console call).
4. Jest suite `tests/unit/tag-service.test.js` and backend `pytest Backend/tests/test_services/test_tag_service.py` executed/passed.

---

Maintained by: TikTrack Engineering – Tagging System  
Last Updated: November 2025


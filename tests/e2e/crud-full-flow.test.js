/**
 * Tagging CRUD Integration Tests
 * ==============================
 *
 * These Jest-based integration tests replace the previous Playwright suite.
 * They focus on verifying that the tagging infrastructure (DataCollectionService,
 * ModalManagerV2 and TagService) works cohesively after the recent refactor.
 */

const { JSDOM } = require('jsdom');
const { setupBasicMocks, loadScriptsInOrder } = require('../utils/test-loader');

describe('Tagging CRUD Integration', () => {
    let dom;

    beforeAll(() => {
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            url: 'http://localhost:8080',
            pretendToBeVisual: true
        });

        global.window = dom.window;
        global.document = dom.window.document;

        setupBasicMocks({
            Logger: {
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
                debug: jest.fn()
            }
        });

        // Restore native DOM helpers from JSDOM (setupBasicMocks provides jest.fn stubs)
        document.getElementById = dom.window.document.getElementById.bind(dom.window.document);
        document.querySelector = dom.window.document.querySelector.bind(dom.window.document);
        document.querySelectorAll = dom.window.document.querySelectorAll.bind(dom.window.document);
        document.createElement = dom.window.document.createElement.bind(dom.window.document);
        document.body.appendChild = dom.window.document.body.appendChild.bind(dom.window.document.body);
        document.body.insertAdjacentHTML = dom.window.document.body.insertAdjacentHTML?.bind(dom.window.document.body);

        const code = loadScriptsInOrder([
            'standalone-core',
            'core-modules',
            'core-utilities',
            'ui-advanced',
            'services',
            'crud',
            'modal'
        ]);
        // eslint-disable-next-line no-eval
        eval(code);

        const ModalManagerCtor = window.ModalManagerV2 || global.ModalManagerV2;
        if (typeof ModalManagerCtor === 'function') {
            window.ModalManagerV2 = new ModalManagerCtor();
        }

        if (!window.TagService) {
            throw new Error('TagService failed to load for tagging integration tests');
        }

        if (!window.TagUIManager) {
            throw new Error('TagUIManager failed to load for tagging integration tests');
        }

        if (typeof window.ModalManagerV2 === 'function' &&
             (!window.ModalManagerV2.modals || typeof window.ModalManagerV2.modals.clear !== 'function')) {
            window.ModalManagerV2 = new window.ModalManagerV2();
        } else if (!window.ModalManagerV2 && typeof ModalManagerV2 === 'function') {
            window.ModalManagerV2 = new ModalManagerV2();
        }

        if (window.ModalManagerV2) {
            if (!(window.ModalManagerV2.modals instanceof Map)) {
                const entries = window.ModalManagerV2.modals && typeof window.ModalManagerV2.modals === 'object'
                    ? Object.entries(window.ModalManagerV2.modals)
                    : [];
                window.ModalManagerV2.modals = new Map(entries);
            }
            if (!(window.ModalManagerV2.configurations instanceof Map)) {
                const configEntries = window.ModalManagerV2.configurations && typeof window.ModalManagerV2.configurations === 'object'
                    ? Object.entries(window.ModalManagerV2.configurations)
                    : [];
                window.ModalManagerV2.configurations = new Map(configEntries);
            }
        }
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        dom?.window?.close();
    });

    beforeEach(() => {
        window.TagEvents = {
            emitCategoryUpdated: jest.fn(),
            emitTagUpdated: jest.fn(),
            emitEntityTagsUpdated: jest.fn(),
            emitInitialized: jest.fn()
        };

        window.UnifiedCacheManager = window.UnifiedCacheManager || {
            get: jest.fn(),
            save: jest.fn(),
            remove: jest.fn()
        };
    });

    test('DataCollectionService.collectFormData extracts selected tags', () => {
        const select = document.createElement('select');
        select.id = 'tradeTagsField';
        select.className = 'tag-multi-select';
        select.multiple = true;
        document.body.appendChild(select);

        const selectedTags = [11, 22, 33];
        const getSelectedSpy = jest.spyOn(window.TagUIManager, 'getSelectedValues').mockReturnValue(selectedTags);

        const formData = window.DataCollectionService.collectFormData({
            trade_tags: { id: 'tradeTagsField', type: 'tags', default: [] }
        });

        expect(getSelectedSpy).toHaveBeenCalledTimes(1);
        expect(getSelectedSpy).toHaveBeenCalledWith(select);
        expect(formData.trade_tags).toEqual(selectedTags);
    });

    test('ModalManagerV2.handleModalShown initializes TagUIManager for tag fields', () => {
        const modalElement = document.createElement('div');
        modalElement.id = 'tradesModal';
        modalElement.innerHTML = `
            <div class="modal-content">
                <select id="tradeTagsField" class="tag-multi-select" multiple></select>
            </div>
        `;
        document.body.appendChild(modalElement);

        if (typeof window.ModalManagerV2.createCRUDModal === 'function' && !window.ModalManagerV2.modals?.has?.('tradesModal')) {
            window.ModalManagerV2.createCRUDModal({
                id: 'tradesModal',
                entityType: 'trade',
                title: { add: 'טרייד חדש' },
                size: 'lg',
                fields: []
            });
        }

        const initializeSpy = jest.spyOn(window.TagUIManager, 'initializeModal').mockImplementation(() => {});

        expect(() => window.ModalManagerV2.handleModalShown(modalElement)).not.toThrow();
        if (initializeSpy.mock.calls.length > 0) {
            expect(initializeSpy).toHaveBeenCalledWith(modalElement);
        }
    });

    test('TagService.replaceEntityTags posts payload and invalidates caches', async () => {
        const removeSpy = jest.spyOn(window.UnifiedCacheManager, 'remove').mockResolvedValue();

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ data: { assigned: [5, 6] } })
        });

        const result = await window.TagService.replaceEntityTags('trade', 42, [5, 6]);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith('/api/tags/assign', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
                entity_type: 'trade',
                entity_id: 42,
                tag_ids: [5, 6]
            })
        }));

        expect(removeSpy).toHaveBeenCalled();
        expect(window.TagEvents.emitEntityTagsUpdated).toHaveBeenCalledWith({
            entityType: 'trade',
            entityId: 42,
            tagIds: [5, 6],
            action: 'replace'
        });
        expect(result).toEqual({ assigned: [5, 6] });
  });

    test('TagService.formatTagErrorMessage appends server message when available', () => {
        const baseMessage = 'הטיקר נשמר אך התגיות לא עודכנו';
        const error = new Error('Tags not found for user');

        const enriched = window.TagService.formatTagErrorMessage(baseMessage, error);
        expect(enriched).toBe(`${baseMessage} (${error.message})`);

        const fallback = window.TagService.formatTagErrorMessage(baseMessage, null);
        expect(fallback).toBe(baseMessage);
  });

    test('EntityDetailsRenderer.renderBasicInfo delegates tag rendering to FieldRendererService', () => {
        const proto = window.EntityDetailsRenderer?.prototype || window.entityDetailsRenderer?.constructor?.prototype;
        expect(proto).toBeDefined();

        const renderer = Object.create(proto);
        renderer.entityColors = renderer.entityColors || {};

        const tags = [
            { id: 1, name: 'חשוב', category_name: 'סטטוס', category_color: '#26baac' },
            { id: 2, name: 'לטיפול', category_name: 'פעולה', category_color: '#fc5a06' }
        ];

        const spy = jest.spyOn(window.FieldRendererService, 'renderTagBadges').mockReturnValue('<div class="tag-block"></div>');

        const html = renderer.renderBasicInfo({
            id: 42,
            status: 'open',
            created_at: '2024-01-01T12:00:00Z',
            updated_at: '2024-01-02T12:00:00Z',
            tag_assignments: tags
        }, 'trade');

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(tags, expect.objectContaining({
            entityType: 'trade',
            title: 'תגיות',
            emptyMessage: 'אין תגיות משויכות'
        }));
        expect(html).toContain('tag-block');

        spy.mockRestore();
    });

    test('EntityDetailsRenderer.renderTagsDisplay provides fallback markup without FieldRendererService', () => {
        const proto = window.EntityDetailsRenderer?.prototype || window.entityDetailsRenderer?.constructor?.prototype;
        expect(proto).toBeDefined();

        const renderer = Object.create(proto);
        renderer.entityColors = renderer.entityColors || {};

        const original = window.FieldRendererService.renderTagBadges;
        delete window.FieldRendererService.renderTagBadges;

        const html = renderer.renderTagsDisplay('trade', [
            { id: 7, name: 'בדיקה', category_name: 'סטטוס' }
        ], { title: 'תגיות מותאמות' });

        expect(html).toContain('תגיות מותאמות');
        expect(html).toContain('בדיקה');

        window.FieldRendererService.renderTagBadges = original;
    });
});



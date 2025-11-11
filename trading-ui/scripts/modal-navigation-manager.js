/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * MODAL NAVIGATION SERVICE (16)
 * - constructor()
 * - init()
 * - subscribe(listener)
 * - unsubscribe(listener)
 * - registerModalOpen(modalElement, metadata)
 * - registerModalClose(modalId)
 * - updateModalMetadata(modalId, updates)
 * - getStack(options)
 * - getActiveEntry()
 * - getActiveModalId()
 * - getParentEntry(modalId)
 * - canGoBack()
 * - goBack()
 * - navigateTo(modalId)
 * - clear()
 * - _hideModal(modalId)
 * MODAL NAVIGATION UI (7)
 * - constructor(service)
 * - init()
 * - onStateChange(state)
 * - refreshOpenModals()
 * - updateModalNavigation(modalElement)
 * - getBreadcrumb(modalElement)
 * - _attachBreadcrumbHandlers(container)
 * UTILITIES (5)
 * - resolvePageName(explicitName)
 * - resolveModalElement(modalId)
 * - extractModalTitle(modalElement)
 * - buildDisplayLabel(entry)
 * - cloneMetadata(entry)
 * ==========================================
 */

const ENTITY_LABELS = {
  ticker: 'טיקר',
  trade: 'טרייד',
  trade_plan: 'תכנון',
  execution: 'ביצוע',
  trading_account: 'חשבון מסחר',
  account: 'חשבון',
  alert: 'התראה',
  note: 'הערה',
  cash_flow: 'תזרים מזומנים',
  trade_selector: 'בחירת טרייד'
};

function resolvePageName(explicitName = null) {
  if (explicitName && typeof explicitName === 'string') {
    return explicitName;
  }
  try {
    if (typeof window.getCurrentPageName === 'function') {
      return window.getCurrentPageName() || 'default';
    }
  } catch {
    // ignore
  }
  return 'default';
}

function resolveModalElement(modalId) {
  if (!modalId) {
    return null;
  }
  return document.getElementById(modalId) || null;
}

function extractModalTitle(modalElement) {
  if (!modalElement) {
    return '';
  }
  const titleElement = modalElement.querySelector('.modal-title');
  if (titleElement && typeof titleElement.textContent === 'string') {
    return titleElement.textContent.trim();
  }
  const ariaLabel = modalElement.getAttribute('aria-label');
  if (ariaLabel) {
    return ariaLabel.trim();
  }
  return '';
}

function cloneEntry(entry) {
  return {
    instanceId: entry.instanceId,
    modalId: entry.modalId,
    modalType: entry.modalType,
    entityType: entry.entityType,
    entityId: entry.entityId,
    title: entry.title,
    sourceInfo: entry.sourceInfo,
    pageName: entry.pageName,
    parentInstanceId: entry.parentInstanceId ?? null,
    openedAt: entry.openedAt,
    metadata: { ...(entry.metadata || {}) }
  };
}

function buildDisplayLabel(entry) {
  if (entry.title && entry.title.trim()) {
    return entry.title.trim();
  }
  const baseLabel = ENTITY_LABELS[entry.entityType] || entry.entityType || 'מודול';
  if (entry.entityId !== null && entry.entityId !== undefined && entry.entityId !== '') {
    return `${baseLabel} ${entry.entityId}`;
  }
  return baseLabel;
}

function createInstanceId(modalId) {
  const base = modalId || 'modal';
  return `${base}::${Date.now()}::${Math.random().toString(36).slice(2, 8)}`;
}

class ModalNavigationService {
  constructor() {
    this.stack = [];
    this.activeInstanceId = null;
    this.openModals = new Map(); // modalId -> HTMLElement
    this.listeners = new Set();
    this.debugEnabled = false;
    this.debugUnsubscribe = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) {
      return;
    }
    try {
      const persisted = await window.PageStateManager?.loadModalNavigationState?.();
      if (persisted && Array.isArray(persisted.stack)) {
        this.stack = persisted.stack.map(entry => ({
          instanceId: entry.instanceId || createInstanceId(entry.modalId),
          modalId: entry.modalId,
          modalType: entry.modalType || 'modal',
          entityType: entry.entityType ?? null,
          entityId: entry.entityId ?? null,
          title: entry.title || '',
          sourceInfo: entry.sourceInfo || null,
          pageName: entry.pageName || resolvePageName(entry.pageName),
          parentInstanceId: entry.parentInstanceId ?? null,
          openedAt: entry.openedAt || Date.now(),
          metadata: { ...(entry.metadata || {}) }
        }));
        if (persisted.activeInstanceId) {
          this.activeInstanceId = persisted.activeInstanceId;
        } else if (this.stack.length) {
          this.activeInstanceId = this.stack[this.stack.length - 1].instanceId;
        }
      }
    } catch (error) {
      window.Logger?.warn('ModalNavigationService.init: failed to load persisted state', {
        error,
        page: 'modal-navigation-manager'
      });
    }
    this.initialized = true;
  }

  subscribe(listener) {
    if (typeof listener !== 'function') {
      return () => {};
    }
    this.listeners.add(listener);
    return () => this.unsubscribe(listener);
  }

  unsubscribe(listener) {
    this.listeners.delete(listener);
  }

  async registerModalOpen(modalElement, metadata = {}) {
    await this.init();
    const element = modalElement || resolveModalElement(metadata.modalId);
    const modalId = metadata.modalId || element?.id;
    if (!modalId) {
      window.Logger?.warn('ModalNavigationService.registerModalOpen: modalId is required', {
        metadata,
        page: 'modal-navigation-manager'
      });
      return null;
    }

    const entry = this._buildEntry(element, modalId, metadata);
    const replaceActive = metadata.replaceActive === true;
    const allowDuplicate = metadata.allowDuplicateEntries === true;
    const currentTop = this.stack.length ? this.stack[this.stack.length - 1] : null;

    let targetIndex = -1;
    if (replaceActive && currentTop && currentTop.modalId === entry.modalId) {
      targetIndex = this.stack.length - 1;
    } else if (!allowDuplicate) {
      targetIndex = this._findLastIndexByModalId(entry.modalId);
    }

    if (targetIndex >= 0) {
      const mergedEntry = {
        ...this.stack[targetIndex],
        ...entry,
        parentInstanceId:
          entry.parentInstanceId ?? this.stack[targetIndex].parentInstanceId ?? (targetIndex > 0 ? this.stack[targetIndex - 1].instanceId : null)
      };
      this.stack = [
        ...this.stack.slice(0, targetIndex),
        mergedEntry,
        ...this.stack.slice(targetIndex + 1)
      ];
      this.activeInstanceId = mergedEntry.instanceId;
    } else {
      const parentInstanceId = entry.parentInstanceId ?? (currentTop ? currentTop.instanceId : null);
      this.stack = [
        ...this.stack,
        {
          ...entry,
          parentInstanceId
        }
      ];
      this.activeInstanceId = entry.instanceId;
    }

    this.openModals.set(entry.modalId, element || null);
    await this._persistState();
    this._emitState();
    this._logDebug('registerModalOpen', {
      modalId: entry.modalId,
      entry: this._summarizeEntry(entry),
      replaceActive,
      allowDuplicate,
      stackSummary: this._stackSummary()
    });
    return cloneEntry(entry);
  }

  async registerModalClose(modalId) {
    await this.init();
    if (!modalId) {
      return;
    }
    const index = this._findLastIndexByModalId(modalId);
    if (index < 0) {
      this._logDebug('registerModalClose:missing', {
        modalId
      }, 'warn');
      return;
    }
    this.stack = [
      ...this.stack.slice(0, index),
      ...this.stack.slice(index + 1)
    ];
    this.activeInstanceId = this.stack.length ? this.stack[this.stack.length - 1].instanceId : null;
    const stillExists = this.stack.some(entry => entry.modalId === modalId);
    if (!stillExists) {
      this.openModals.delete(modalId);
    }
    if (this.stack.length === 0) {
      await window.PageStateManager?.clearModalNavigationState?.();
    } else {
      await this._persistState();
    }
    this._emitState();
    this._logDebug('registerModalClose', {
      modalId,
      stackSummary: this._stackSummary()
    });
  }

  async updateModalMetadata(modalId, updates = {}) {
    await this.init();
    if (!modalId && !updates.instanceId) {
      return;
    }
    const targetIndex = updates.instanceId
      ? this.stack.findIndex(entry => entry.instanceId === updates.instanceId)
      : this._findLastIndexByModalId(modalId);
    if (targetIndex < 0) {
      return;
    }
    const existing = this.stack[targetIndex];
    const merged = {
      ...existing,
      modalType: updates.modalType ?? existing.modalType,
      entityType: updates.entityType !== undefined ? updates.entityType : existing.entityType,
      entityId: updates.entityId !== undefined ? updates.entityId : existing.entityId,
      title: updates.title !== undefined ? (updates.title || '').trim() : existing.title,
      sourceInfo: updates.sourceInfo !== undefined ? updates.sourceInfo : existing.sourceInfo,
      metadata: {
        ...(existing.metadata || {}),
        ...(updates.metadata || {})
      }
    };
    this.stack = [
      ...this.stack.slice(0, targetIndex),
      merged,
      ...this.stack.slice(targetIndex + 1)
    ];
    if (targetIndex === this.stack.length - 1) {
      this.activeInstanceId = merged.instanceId;
    }
    await this._persistState();
    this._emitState();
    this._logDebug('updateModalMetadata', {
      modalId: modalId || merged.modalId,
      updates: {
        modalType: merged.modalType,
        entityType: merged.entityType,
        entityId: merged.entityId,
        title: merged.title,
        sourceInfo: merged.sourceInfo
      },
      stackSummary: this._stackSummary()
    });
  }

  getStack(options = {}) {
    const includeElements = options.includeElements === true;
    return this.stack.map(entry => {
      if (!includeElements) {
        return cloneEntry(entry);
      }
      return {
        ...cloneEntry(entry),
        element: this.openModals.get(entry.modalId) || resolveModalElement(entry.modalId)
      };
    });
  }

  getActiveEntry() {
    if (!this.stack.length) {
      return null;
    }
    const entry = this.stack[this.stack.length - 1];
    return {
      ...cloneEntry(entry),
      element: this.openModals.get(entry.modalId) || resolveModalElement(entry.modalId)
    };
  }

  getActiveModalId() {
    if (!this.stack.length) {
      return null;
    }
    return this.stack[this.stack.length - 1].modalId;
  }

  getParentEntry(modalId) {
    if (!this.stack.length) {
      return null;
    }
    if (!modalId) {
      if (this.stack.length < 2) {
        return null;
      }
      const parent = this.stack[this.stack.length - 2];
      return {
        ...cloneEntry(parent),
        element: this.openModals.get(parent.modalId) || resolveModalElement(parent.modalId)
      };
    }
    const index = this._findLastIndexByModalId(modalId);
    if (index <= 0) {
      return null;
    }
    const parent = this.stack[index - 1];
    return {
      ...cloneEntry(parent),
      element: this.openModals.get(parent.modalId) || resolveModalElement(parent.modalId)
    };
  }

  canGoBack() {
    return this.stack.length > 1;
  }

  async goBack() {
    await this.init();
    if (!this.canGoBack()) {
      return false;
    }
    const currentEntry = this.stack[this.stack.length - 1];
    const previousEntry = this.stack[this.stack.length - 2];
    this._logDebug('goBack:start', {
      current: this._summarizeEntry(currentEntry),
      target: this._summarizeEntry(previousEntry),
      stackSummary: this._stackSummary()
    });
    await this._navigateBetween(currentEntry, previousEntry);
    this._logDebug('goBack:complete', {
      activeInstanceId: this.activeInstanceId,
      stackSummary: this._stackSummary()
    });
    return true;
  }

  async navigateTo(modalId) {
    await this.init();
    if (!modalId) {
      return false;
    }
    const targetIndex = this._findLastIndexByModalId(modalId);
    if (targetIndex < 0) {
      return false;
    }
    const currentIndex = this.stack.length - 1;
    if (targetIndex === currentIndex) {
      await this._ensureModalVisible(this.stack[targetIndex]);
      return true;
    }

    const entriesToClose = this.stack.slice(targetIndex + 1).map(entry => ({ ...entry }));
    for (const entry of entriesToClose.reverse()) {
      await this._hideModalInstance(entry);
    }
    const targetEntry = this.stack[targetIndex] || this.stack[this.stack.length - 1];
    await this._ensureModalVisible(targetEntry);
    this.activeInstanceId = targetEntry?.instanceId || null;
    await this._persistState();
    this._emitState();
    this._logDebug('navigateTo', {
      modalId,
      target: this._summarizeEntry(targetEntry),
      stackSummary: this._stackSummary()
    });
    return true;
  }

  async clear() {
    this.stack = [];
    this.activeInstanceId = null;
    this.openModals.clear();
    await window.PageStateManager?.clearModalNavigationState?.();
    this._emitState();
    this._logDebug('clear', {
      stackSummary: this._stackSummary()
    });
  }

  _buildEntry(modalElement, modalId, metadata) {
    return {
      instanceId: metadata.instanceId || createInstanceId(modalId),
      modalId,
      modalType: metadata.modalType || metadata.type || 'modal',
      entityType: metadata.entityType ?? null,
      entityId: metadata.entityId ?? null,
      title: (metadata.title || extractModalTitle(modalElement) || '').trim(),
      sourceInfo: metadata.sourceInfo || null,
      pageName: metadata.pageName || resolvePageName(metadata.pageName),
      parentInstanceId: metadata.parentInstanceId ?? null,
      openedAt: metadata.openedAt || Date.now(),
      metadata: {
        ...(metadata.metadata || {}),
        ...(metadata.mode ? { mode: metadata.mode } : {})
      }
    };
  }

  debugSnapshot(options = {}) {
    const includeElements = options.includeElements === true;
    return {
      timestamp: Date.now(),
      activeInstanceId: this.activeInstanceId,
      activeModalId: this.getActiveModalId(),
      stackLength: this.stack.length,
      stack: this.stack.map(entry => {
        const summary = this._summarizeEntry(entry);
        if (includeElements) {
          summary.elementPresent = Boolean(this.openModals.get(entry.modalId) || resolveModalElement(entry.modalId));
        }
        return summary;
      })
    };
  }

  enableDebugLogging(options = {}) {
    if (this.debugEnabled && this.debugUnsubscribe) {
      return this.debugUnsubscribe;
    }
    const level = options.level || 'debug';
    const includeStack = options.includeStack !== false;
    const listener = snapshot => {
      this._logDebug(
        'state:update',
        {
          stackLength: snapshot.stack.length,
          activeModalId: snapshot.activeModalId,
          activeInstanceId: snapshot.activeInstanceId,
          stackSummary: includeStack ? snapshot.stack.map(entry => this._summarizeEntry(entry)) : undefined
        },
        level
      );
    };
    this.debugUnsubscribe = this.subscribe(listener);
    this.debugEnabled = true;
    this._logDebug(
      'debugLoggingEnabled',
      {
        stackLength: this.stack.length,
        stackSummary: includeStack ? this._stackSummary() : undefined
      },
      level
    );
    return () => this.disableDebugLogging();
  }

  disableDebugLogging() {
    if (typeof this.debugUnsubscribe === 'function') {
      this.debugUnsubscribe();
    }
    this.debugUnsubscribe = null;
    this.debugEnabled = false;
    this._logDebug('debugLoggingDisabled', {
      stackSummary: this._stackSummary()
    });
  }

  async _persistState() {
    if (!window.PageStateManager || typeof window.PageStateManager.saveModalNavigationState !== 'function') {
      return false;
    }
    if (this.stack.length === 0) {
      await window.PageStateManager.clearModalNavigationState?.();
      return true;
    }
    const payload = {
      stack: this.stack.map(cloneEntry),
      activeInstanceId: this.activeInstanceId,
      activeModalId: this.getActiveModalId()
    };
    await window.PageStateManager.saveModalNavigationState(payload, {
      pageName: this._currentPageName()
    });
    return true;
  }

  _emitState() {
    const snapshot = {
      stack: this.stack.map(cloneEntry),
      activeInstanceId: this.activeInstanceId,
      activeModalId: this.getActiveModalId()
    };
    this.listeners.forEach(listener => {
      try {
        listener(snapshot);
      } catch (error) {
        window.Logger?.error('ModalNavigationService listener error', error, {
          page: 'modal-navigation-manager'
        });
      }
    });
  }

  _currentPageName() {
    if (!this.stack.length) {
      return resolvePageName();
    }
    const active = this.stack[this.stack.length - 1];
    return resolvePageName(active.pageName);
  }

  _findLastIndexByModalId(modalId) {
    for (let i = this.stack.length - 1; i >= 0; i--) {
      if (this.stack[i].modalId === modalId) {
        return i;
      }
    }
    return -1;
  }

  async _navigateBetween(currentEntry, targetEntry) {
    if (!currentEntry || !targetEntry) {
      return;
    }
    this._logDebug('navigateBetween:start', {
      current: this._summarizeEntry(currentEntry),
      target: this._summarizeEntry(targetEntry)
    });
    await this._hideModalInstance(currentEntry);
    await this._ensureModalVisible(targetEntry);
    this.activeInstanceId = targetEntry.instanceId;
    await this._persistState();
    this._emitState();
    this._logDebug('navigateBetween:complete', {
      activeInstanceId: this.activeInstanceId,
      stackSummary: this._stackSummary()
    });
  }

  async _hideModalInstance(entry) {
    const element = this.openModals.get(entry.modalId) || resolveModalElement(entry.modalId);
    if (!element) {
      this._logDebug('hideModalInstance:missing-element', {
        modalId: entry.modalId,
        instanceId: entry.instanceId
      });
      await this.registerModalClose(entry.modalId);
      return;
    }
    await new Promise(resolve => {
      const onHidden = () => {
        element.removeEventListener('hidden.bs.modal', onHidden);
        resolve();
      };
      element.addEventListener('hidden.bs.modal', onHidden, { once: true });
      this._logDebug('hideModalInstance:pending', {
        modalId: entry.modalId,
        instanceId: entry.instanceId
      });
      const instance = bootstrap?.Modal?.getInstance(element) || bootstrap?.Modal?.getOrCreateInstance(element, { backdrop: false });
      if (instance) {
        instance.hide();
      } else {
        element.classList.remove('show');
        onHidden();
      }
    });
    this._logDebug('hideModalInstance:complete', {
      modalId: entry.modalId,
      instanceId: entry.instanceId
    });
  }

  async _ensureModalVisible(entry) {
    if (!entry) {
      return;
    }
    const element = this.openModals.get(entry.modalId) || resolveModalElement(entry.modalId);
    if (!element) {
      this._logDebug('ensureModalVisible:missing-element', {
        modalId: entry.modalId,
        instanceId: entry.instanceId
      });
      return;
    }
    await this._dispatchRestoreEvent(element, entry, 'before-show');
    if (!element.classList.contains('show')) {
      await new Promise(resolve => {
        const onShown = () => {
          element.removeEventListener('shown.bs.modal', onShown);
          resolve();
        };
        element.addEventListener('shown.bs.modal', onShown, { once: true });
        const instance = bootstrap?.Modal?.getOrCreateInstance(element, { backdrop: false });
        if (instance?.show) {
          instance.show();
        } else {
          element.classList.add('show');
          onShown();
        }
      });
      this._logDebug('ensureModalVisible:shown', {
        modalId: entry.modalId,
        instanceId: entry.instanceId
      });
    }
    await this._dispatchRestoreEvent(element, entry, 'after-show');
  }

  async _dispatchRestoreEvent(element, entry, stage) {
    try {
      const detail = {
        stage,
        entry: cloneEntry(entry)
      };
      const event = new CustomEvent('modal-navigation:restore', { detail });
      element.dispatchEvent(event);
      this._logDebug('dispatchRestoreEvent', {
        stage,
        modalId: entry?.modalId,
        instanceId: entry?.instanceId,
        entityType: entry?.entityType,
        entityId: entry?.entityId,
        title: entry?.title
      });
    } catch (error) {
      window.Logger?.warn('ModalNavigationService._dispatchRestoreEvent error', {
        error,
        stage,
        entryId: entry?.instanceId,
        page: 'modal-navigation-manager'
      });
    }
  }

  _stackSummary() {
    return this.stack.map(entry => this._summarizeEntry(entry));
  }

  _summarizeEntry(entry) {
    if (!entry) {
      return null;
    }
    return {
      instanceId: entry.instanceId,
      modalId: entry.modalId,
      modalType: entry.modalType,
      entityType: entry.entityType,
      entityId: entry.entityId,
      title: entry.title,
      sourceInfo: entry.sourceInfo || null,
      parentInstanceId: entry.parentInstanceId ?? null
    };
  }

  _logDebug(action, payload = {}, level = 'debug') {
    const logger = window.Logger;
    const logLevel = level || 'debug';
    const message = `ModalNavigationService.${action}`;
    const meta = {
      ...payload,
      stackLength: this.stack.length,
      activeModalId: this.getActiveModalId(),
      page: 'modal-navigation-manager'
    };

    if (logger && typeof logger[logLevel] === 'function') {
      try {
        logger[logLevel](message, meta);
        return;
      } catch (error) {
        console.warn('ModalNavigationService._logDebug logger error', error, meta);
      }
    }

    if (logLevel === 'error') {
      console.error(message, meta);
    } else if (logLevel === 'warn') {
      console.warn(message, meta);
    } else {
      console.debug(message, meta);
    }
  }
}

class ModalNavigationUI {
  constructor(service) {
    this.service = service;
    this.initialized = false;
    this.unsubscribe = null;
    this.init();
  }

  async init() {
    if (this.initialized) {
      return;
    }
    await this.service.init();
    this.unsubscribe = this.service.subscribe(() => this.refreshOpenModals());
    document.addEventListener('shown.bs.modal', event => {
      if (event.target?.classList?.contains('modal')) {
        this.updateModalNavigation(event.target);
      }
    });
    document.addEventListener('hidden.bs.modal', event => {
      if (event.target?.classList?.contains('modal')) {
        this.refreshOpenModals();
      }
    });
    this.refreshOpenModals();
    this.initialized = true;
  }

  refreshOpenModals() {
    const openModals = document.querySelectorAll('.modal.show');
    openModals.forEach(modal => this.updateModalNavigation(modal));
  }

  updateModalNavigation(modalElement) {
    if (!modalElement || !(modalElement instanceof HTMLElement)) {
      return;
    }
    this._updateBreadcrumb(modalElement);
    this._updateBackButton(modalElement);
  }

  getBreadcrumb(modalElement = null) {
    const stack = this.service.getStack();
    if (!stack.length) {
      return '';
    }
    const activeModalId = modalElement?.id || this.service.getActiveModalId();
    return this._renderBreadcrumb(stack, activeModalId);
  }

  _updateBreadcrumb(modalElement) {
    const stack = this.service.getStack();
    let container = modalElement.querySelector('#entityDetailsBreadcrumb') ||
                    modalElement.querySelector('.modal-navigation-breadcrumb');

    if (!container) {
      const header = modalElement.querySelector('.modal-header');
      if (!header) {
        return;
      }
      container = document.createElement('div');
      container.id = 'entityDetailsBreadcrumb';
      container.className = 'modal-navigation-breadcrumb';
      const titleElement = header.querySelector('.modal-title');
      if (titleElement && titleElement.nextSibling) {
        header.insertBefore(container, titleElement.nextSibling);
      } else {
        const closeButton = header.querySelector('[data-button-type="CLOSE"]') || header.lastChild;
        header.insertBefore(container, closeButton);
      }
    }

    if (stack.length <= 1) {
      container.style.display = 'none';
      container.style.visibility = 'hidden';
      container.innerHTML = '';
      return;
    }

    container.innerHTML = this._renderBreadcrumb(stack, modalElement.id);
    container.style.display = 'block';
    container.style.visibility = 'visible';
    container.style.opacity = '1';
    container.style.pointerEvents = 'auto';
    this._attachBreadcrumbHandlers(container);
  }

  _renderBreadcrumb(stack, activeModalId) {
    const items = stack.map(entry => {
      const isActive = entry.modalId === activeModalId && entry === stack[stack.length - 1];
      const label = buildDisplayLabel(entry);
      if (isActive) {
        return `<span class="breadcrumb-item breadcrumb-current" data-modal-id="${entry.modalId}" style="font-weight: bold; color: var(--current-entity-color-dark, #333);">${label}</span>`;
      }
      return `<a href="#" class="breadcrumb-item breadcrumb-link" data-modal-id="${entry.modalId}" style="color: var(--current-entity-color-dark, #26baac); text-decoration: underline; cursor: pointer;">${label}</a>`;
    });

    return `<span class="modal-history-count-label" style="margin-right: 0.5rem; font-size: 0.85rem; color: #666; font-weight: bold;">[מערך: ${stack.length}]</span><div class="modal-breadcrumb-trail">${items.join(' / ')}</div>`;
  }

  _attachBreadcrumbHandlers(container) {
    if (container._modalNavigationHandler) {
      container.removeEventListener('click', container._modalNavigationHandler);
    }
    const handler = event => {
      const link = event.target.closest('.breadcrumb-link');
      if (!link) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const modalId = link.getAttribute('data-modal-id');
      if (modalId) {
        this.service.navigateTo(modalId);
      }
    };
    container.addEventListener('click', handler);
    container._modalNavigationHandler = handler;
  }

  _updateBackButton(modalElement) {
    const header = modalElement.querySelector('.modal-header');
    if (!header) {
      return;
    }
    const canGoBack = this.service.canGoBack();
    let backButton = header.querySelector('[data-button-type="BACK"]') ||
                     header.querySelector('.modal-back-btn') ||
                     header.querySelector('#entityDetailsBackBtn');

    if (!backButton) {
      backButton = document.createElement('button');
      backButton.id = 'entityDetailsBackBtn';
      backButton.className = 'modal-back-btn';
      backButton.setAttribute('data-button-type', 'BACK');
      backButton.setAttribute('data-variant', 'full');
      backButton.setAttribute('data-text', 'חזור');
      backButton.type = 'button';
      backButton.setAttribute('data-onclick', 'window.goBackInModalNavigation && window.goBackInModalNavigation()');
      const closeButton = header.querySelector('[data-button-type="CLOSE"]') || header.querySelector('.btn-close');
      if (closeButton) {
        header.insertBefore(backButton, closeButton);
      } else {
        header.appendChild(backButton);
      }
      if (window.ButtonSystem?.processButton) {
        window.ButtonSystem.processButton(backButton);
      }
    }

    if (!canGoBack) {
      backButton.style.display = 'none';
      backButton.style.visibility = 'hidden';
      return;
    }

    backButton.disabled = !canGoBack;
    backButton.style.pointerEvents = canGoBack ? 'auto' : 'none';
    backButton.style.opacity = canGoBack ? '1' : '0.5';
    backButton.style.display = 'flex';
    backButton.style.visibility = 'visible';
    if (!backButton.getAttribute('data-onclick')) {
      backButton.setAttribute('data-onclick', 'window.goBackInModalNavigation && window.goBackInModalNavigation()');
    }
  }
}

const modalNavigationService = new ModalNavigationService();
const modalNavigationUI = new ModalNavigationUI(modalNavigationService);

window.ModalNavigationService = modalNavigationService;

window.modalNavigationManager = {
  goBack: () => modalNavigationService.goBack(),
  canGoBack: () => modalNavigationService.canGoBack(),
  updateModalNavigation: modalElement => modalNavigationUI.updateModalNavigation(modalElement),
  getBreadcrumb: modalElement => modalNavigationUI.getBreadcrumb(modalElement)
};

window.pushModalToNavigation = async function(modalElement, metadata = {}) {
  return modalNavigationService.registerModalOpen(modalElement, metadata);
};

window.goBackInModalNavigation = async function() {
  return modalNavigationService.goBack();
};

window.getModalBreadcrumb = function(modalElement = null) {
  return modalNavigationUI.getBreadcrumb(modalElement);
};

window.registerModalNavigationClose = async function(modalId) {
  return modalNavigationService.registerModalClose(modalId);
};

window.ModalNavigationDebug = {
  enable: options => modalNavigationService.enableDebugLogging(options),
  disable: () => modalNavigationService.disableDebugLogging(),
  snapshot: options => modalNavigationService.debugSnapshot(options)
};

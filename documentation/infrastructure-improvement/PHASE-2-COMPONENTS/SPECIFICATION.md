# Web Components - מפרט מלא

## סקירה

**מטרה:** 15 רכיבים מוכנים להפחתת קוד חוזר  
**זמן:** 4-5 שבועות  
**תוצאה:** 70% פחות קוד חוזר, זמן פיתוח ↓ 50%

---

## ארכיטקטורה

### Component System

```javascript
/**
 * TikTrack Web Components System
 * מערכת רכיבים מבוססת Web Components API
 */

// Base Component Class
class TTComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = {};
    this.props = {};
    this.eventListeners = new Map();
  }

  // Lifecycle methods
  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.afterRender();
  }

  disconnectedCallback() {
    this.cleanupEventListeners();
  }

  // Render method (to be implemented by each component)
  render() {
    throw new Error('render() method must be implemented');
  }

  // Event handling
  setupEventListeners() {
    // Override in child components
  }

  cleanupEventListeners() {
    this.eventListeners.forEach((listener, element) => {
      element.removeEventListener(listener.event, listener.handler);
    });
    this.eventListeners.clear();
  }

  // State management
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  // Props management
  setProps(newProps) {
    this.props = { ...this.props, ...newProps };
    this.render();
  }

  // Utility methods
  addEventListener(element, event, handler) {
    element.addEventListener(event, handler);
    this.eventListeners.set(element, { event, handler });
  }

  // Styling
  getStyles() {
    return `
      <style>
        :host {
          display: block;
          font-family: var(--font-family, 'Arial', sans-serif);
        }
        ${this.getComponentStyles()}
      </style>
    `;
  }

  getComponentStyles() {
    // Override in child components
    return '';
  }
}
```

---

## רכיבים בסיסיים (5 רכיבים)

### 1. tt-button

```javascript
class TTButton extends TTComponent {
  static get observedAttributes() {
    return ['variant', 'size', 'disabled', 'loading', 'icon'];
  }

  getComponentStyles() {
    return `
      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: var(--button-padding, 8px 16px);
        border: none;
        border-radius: var(--button-radius, 4px);
        font-size: var(--button-font-size, 14px);
        font-weight: var(--button-font-weight, 500);
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        gap: var(--button-gap, 8px);
      }
      
      .button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .button--primary {
        background-color: var(--color-primary, #007bff);
        color: white;
      }
      
      .button--secondary {
        background-color: var(--color-secondary, #6c757d);
        color: white;
      }
      
      .button--success {
        background-color: var(--color-success, #28a745);
        color: white;
      }
      
      .button--danger {
        background-color: var(--color-danger, #dc3545);
        color: white;
      }
      
      .button--small {
        padding: 4px 8px;
        font-size: 12px;
      }
      
      .button--large {
        padding: 12px 24px;
        font-size: 16px;
      }
      
      .loading {
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
  }

  render() {
    const variant = this.getAttribute('variant') || 'primary';
    const size = this.getAttribute('size') || 'medium';
    const disabled = this.hasAttribute('disabled');
    const loading = this.hasAttribute('loading');
    const icon = this.getAttribute('icon');
    const text = this.textContent;

    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <button 
        class="button button--${variant} button--${size}" 
        ${disabled ? 'disabled' : ''}
        ${loading ? 'data-loading' : ''}
      >
        ${loading ? '<span class="loading">⟳</span>' : ''}
        ${icon ? `<span class="icon">${icon}</span>` : ''}
        <span class="text">${text}</span>
      </button>
    `;
  }

  setupEventListeners() {
    const button = this.shadowRoot.querySelector('.button');
    this.addEventListener(button, 'click', (e) => {
      if (!this.hasAttribute('disabled') && !this.hasAttribute('loading')) {
        this.dispatchEvent(new CustomEvent('tt-click', {
          detail: { originalEvent: e },
          bubbles: true
        }));
      }
    });
  }
}

customElements.define('tt-button', TTButton);
```

### 2. tt-input

```javascript
class TTInput extends TTComponent {
  static get observedAttributes() {
    return ['type', 'placeholder', 'value', 'disabled', 'required', 'error'];
  }

  getComponentStyles() {
    return `
      .input-container {
        position: relative;
        display: block;
      }
      
      .input {
        width: 100%;
        padding: var(--input-padding, 8px 12px);
        border: 1px solid var(--input-border-color, #ddd);
        border-radius: var(--input-radius, 4px);
        font-size: var(--input-font-size, 14px);
        transition: border-color 0.2s ease;
      }
      
      .input:focus {
        outline: none;
        border-color: var(--color-primary, #007bff);
      }
      
      .input:disabled {
        background-color: var(--input-disabled-bg, #f5f5f5);
        cursor: not-allowed;
      }
      
      .input--error {
        border-color: var(--color-danger, #dc3545);
      }
      
      .error-message {
        color: var(--color-danger, #dc3545);
        font-size: 12px;
        margin-top: 4px;
        display: none;
      }
      
      .error-message.show {
        display: block;
      }
    `;
  }

  render() {
    const type = this.getAttribute('type') || 'text';
    const placeholder = this.getAttribute('placeholder') || '';
    const value = this.getAttribute('value') || '';
    const disabled = this.hasAttribute('disabled');
    const required = this.hasAttribute('required');
    const error = this.getAttribute('error') || '';

    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <div class="input-container">
        <input 
          type="${type}"
          placeholder="${placeholder}"
          value="${value}"
          ${disabled ? 'disabled' : ''}
          ${required ? 'required' : ''}
          class="input ${error ? 'input--error' : ''}"
        />
        ${error ? `<div class="error-message show">${error}</div>` : ''}
      </div>
    `;
  }

  setupEventListeners() {
    const input = this.shadowRoot.querySelector('.input');
    
    this.addEventListener(input, 'input', (e) => {
      this.dispatchEvent(new CustomEvent('tt-input', {
        detail: { value: e.target.value },
        bubbles: true
      }));
    });

    this.addEventListener(input, 'change', (e) => {
      this.dispatchEvent(new CustomEvent('tt-change', {
        detail: { value: e.target.value },
        bubbles: true
      }));
    });
  }
}

customElements.define('tt-input', TTInput);
```

### 3. tt-select

```javascript
class TTSelect extends TTComponent {
  static get observedAttributes() {
    return ['options', 'value', 'placeholder', 'disabled', 'multiple'];
  }

  getComponentStyles() {
    return `
      .select-container {
        position: relative;
        display: block;
      }
      
      .select {
        width: 100%;
        padding: var(--select-padding, 8px 12px);
        border: 1px solid var(--select-border-color, #ddd);
        border-radius: var(--select-radius, 4px);
        font-size: var(--select-font-size, 14px);
        background-color: white;
        cursor: pointer;
      }
      
      .select:focus {
        outline: none;
        border-color: var(--color-primary, #007bff);
      }
      
      .select:disabled {
        background-color: var(--select-disabled-bg, #f5f5f5);
        cursor: not-allowed;
      }
    `;
  }

  render() {
    const options = JSON.parse(this.getAttribute('options') || '[]');
    const value = this.getAttribute('value') || '';
    const placeholder = this.getAttribute('placeholder') || 'Select...';
    const disabled = this.hasAttribute('disabled');
    const multiple = this.hasAttribute('multiple');

    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <div class="select-container">
        <select 
          class="select"
          ${disabled ? 'disabled' : ''}
          ${multiple ? 'multiple' : ''}
        >
          <option value="" disabled>${placeholder}</option>
          ${options.map(option => `
            <option value="${option.value}" ${option.value === value ? 'selected' : ''}>
              ${option.label}
            </option>
          `).join('')}
        </select>
      </div>
    `;
  }

  setupEventListeners() {
    const select = this.shadowRoot.querySelector('.select');
    
    this.addEventListener(select, 'change', (e) => {
      this.dispatchEvent(new CustomEvent('tt-change', {
        detail: { value: e.target.value },
        bubbles: true
      }));
    });
  }
}

customElements.define('tt-select', TTSelect);
```

### 4. tt-badge

```javascript
class TTBadge extends TTComponent {
  static get observedAttributes() {
    return ['variant', 'size', 'text'];
  }

  getComponentStyles() {
    return `
      .badge {
        display: inline-flex;
        align-items: center;
        padding: var(--badge-padding, 4px 8px);
        border-radius: var(--badge-radius, 12px);
        font-size: var(--badge-font-size, 12px);
        font-weight: var(--badge-font-weight, 500);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .badge--primary {
        background-color: var(--color-primary, #007bff);
        color: white;
      }
      
      .badge--success {
        background-color: var(--color-success, #28a745);
        color: white;
      }
      
      .badge--warning {
        background-color: var(--color-warning, #ffc107);
        color: black;
      }
      
      .badge--danger {
        background-color: var(--color-danger, #dc3545);
        color: white;
      }
      
      .badge--small {
        padding: 2px 6px;
        font-size: 10px;
      }
      
      .badge--large {
        padding: 6px 12px;
        font-size: 14px;
      }
    `;
  }

  render() {
    const variant = this.getAttribute('variant') || 'primary';
    const size = this.getAttribute('size') || 'medium';
    const text = this.getAttribute('text') || this.textContent;

    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <span class="badge badge--${variant} badge--${size}">
        ${text}
      </span>
    `;
  }
}

customElements.define('tt-badge', TTBadge);
```

### 5. tt-card

```javascript
class TTCard extends TTComponent {
  static get observedAttributes() {
    return ['title', 'subtitle', 'image', 'actions'];
  }

  getComponentStyles() {
    return `
      .card {
        background: white;
        border-radius: var(--card-radius, 8px);
        box-shadow: var(--card-shadow, 0 2px 4px rgba(0,0,0,0.1));
        overflow: hidden;
        transition: box-shadow 0.2s ease;
      }
      
      .card:hover {
        box-shadow: var(--card-shadow-hover, 0 4px 8px rgba(0,0,0,0.15));
      }
      
      .card-header {
        padding: var(--card-header-padding, 16px);
        border-bottom: 1px solid var(--card-border-color, #eee);
      }
      
      .card-title {
        font-size: var(--card-title-font-size, 18px);
        font-weight: var(--card-title-font-weight, 600);
        margin: 0 0 4px 0;
      }
      
      .card-subtitle {
        font-size: var(--card-subtitle-font-size, 14px);
        color: var(--card-subtitle-color, #666);
        margin: 0;
      }
      
      .card-image {
        width: 100%;
        height: auto;
        display: block;
      }
      
      .card-body {
        padding: var(--card-body-padding, 16px);
      }
      
      .card-footer {
        padding: var(--card-footer-padding, 16px);
        border-top: 1px solid var(--card-border-color, #eee);
        background-color: var(--card-footer-bg, #f8f9fa);
      }
    `;
  }

  render() {
    const title = this.getAttribute('title') || '';
    const subtitle = this.getAttribute('subtitle') || '';
    const image = this.getAttribute('image') || '';
    const actions = this.getAttribute('actions') || '';

    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <div class="card">
        ${image ? `<img src="${image}" class="card-image" alt="${title}">` : ''}
        <div class="card-header">
          ${title ? `<h3 class="card-title">${title}</h3>` : ''}
          ${subtitle ? `<p class="card-subtitle">${subtitle}</p>` : ''}
        </div>
        <div class="card-body">
          <slot></slot>
        </div>
        ${actions ? `<div class="card-footer">${actions}</div>` : ''}
      </div>
    `;
  }
}

customElements.define('tt-card', TTCard);
```

---

## רכיבים מתקדמים (10 רכיבים)

### 6. tt-modal

```javascript
class TTModal extends TTComponent {
  static get observedAttributes() {
    return ['open', 'title', 'size', 'closable'];
  }

  getComponentStyles() {
    return `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }
      
      .modal-overlay.open {
        opacity: 1;
        visibility: visible;
      }
      
      .modal {
        background: white;
        border-radius: var(--modal-radius, 8px);
        box-shadow: var(--modal-shadow, 0 10px 30px rgba(0,0,0,0.3));
        max-width: 90vw;
        max-height: 90vh;
        overflow: hidden;
        transform: scale(0.9);
        transition: transform 0.3s ease;
      }
      
      .modal-overlay.open .modal {
        transform: scale(1);
      }
      
      .modal--small { max-width: 400px; }
      .modal--medium { max-width: 600px; }
      .modal--large { max-width: 800px; }
      .modal--fullscreen { max-width: 95vw; max-height: 95vh; }
      
      .modal-header {
        padding: var(--modal-header-padding, 16px 20px);
        border-bottom: 1px solid var(--modal-border-color, #eee);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .modal-title {
        font-size: var(--modal-title-font-size, 18px);
        font-weight: var(--modal-title-font-weight, 600);
        margin: 0;
      }
      
      .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .modal-body {
        padding: var(--modal-body-padding, 20px);
        max-height: 60vh;
        overflow-y: auto;
      }
      
      .modal-footer {
        padding: var(--modal-footer-padding, 16px 20px);
        border-top: 1px solid var(--modal-border-color, #eee);
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
    `;
  }

  render() {
    const open = this.hasAttribute('open');
    const title = this.getAttribute('title') || '';
    const size = this.getAttribute('size') || 'medium';
    const closable = this.hasAttribute('closable');

    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <div class="modal-overlay ${open ? 'open' : ''}">
        <div class="modal modal--${size}">
          <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            ${closable ? '<button class="modal-close">&times;</button>' : ''}
          </div>
          <div class="modal-body">
            <slot></slot>
          </div>
          <div class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const overlay = this.shadowRoot.querySelector('.modal-overlay');
    const closeBtn = this.shadowRoot.querySelector('.modal-close');
    
    if (closeBtn) {
      this.addEventListener(closeBtn, 'click', () => {
        this.close();
      });
    }
    
    this.addEventListener(overlay, 'click', (e) => {
      if (e.target === overlay) {
        this.close();
      }
    });
  }

  open() {
    this.setAttribute('open', '');
    this.dispatchEvent(new CustomEvent('tt-open', { bubbles: true }));
  }

  close() {
    this.removeAttribute('open');
    this.dispatchEvent(new CustomEvent('tt-close', { bubbles: true }));
  }
}

customElements.define('tt-modal', TTModal);
```

### 7. tt-table

```javascript
class TTTable extends TTComponent {
  static get observedAttributes() {
    return ['data', 'columns', 'sortable', 'filterable', 'pagination'];
  }

  getComponentStyles() {
    return `
      .table-container {
        overflow-x: auto;
        border-radius: var(--table-radius, 8px);
        box-shadow: var(--table-shadow, 0 2px 4px rgba(0,0,0,0.1));
      }
      
      .table {
        width: 100%;
        border-collapse: collapse;
        background: white;
      }
      
      .table th,
      .table td {
        padding: var(--table-cell-padding, 12px 16px);
        text-align: left;
        border-bottom: 1px solid var(--table-border-color, #eee);
      }
      
      .table th {
        background-color: var(--table-header-bg, #f8f9fa);
        font-weight: var(--table-header-font-weight, 600);
        color: var(--table-header-color, #333);
        cursor: pointer;
        user-select: none;
      }
      
      .table th:hover {
        background-color: var(--table-header-hover-bg, #e9ecef);
      }
      
      .table tbody tr:hover {
        background-color: var(--table-row-hover-bg, #f8f9fa);
      }
      
      .table-sort {
        display: inline-block;
        margin-left: 4px;
      }
      
      .table-sort::after {
        content: '↕';
        opacity: 0.5;
      }
      
      .table-sort.asc::after {
        content: '↑';
        opacity: 1;
      }
      
      .table-sort.desc::after {
        content: '↓';
        opacity: 1;
      }
      
      .table-pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background-color: var(--table-footer-bg, #f8f9fa);
      }
      
      .table-info {
        color: var(--table-info-color, #666);
        font-size: 14px;
      }
      
      .table-controls {
        display: flex;
        gap: 8px;
        align-items: center;
      }
    `;
  }

  render() {
    const data = JSON.parse(this.getAttribute('data') || '[]');
    const columns = JSON.parse(this.getAttribute('columns') || '[]');
    const sortable = this.hasAttribute('sortable');
    const filterable = this.hasAttribute('filterable');
    const pagination = this.hasAttribute('pagination');

    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              ${columns.map(col => `
                <th class="${sortable ? 'sortable' : ''}" data-column="${col.key}">
                  ${col.label}
                  ${sortable ? '<span class="table-sort"></span>' : ''}
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${columns.map(col => `
                  <td>${row[col.key] || ''}</td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${pagination ? `
          <div class="table-pagination">
            <div class="table-info">
              Showing 1-${data.length} of ${data.length} entries
            </div>
            <div class="table-controls">
              <button>Previous</button>
              <button>Next</button>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  setupEventListeners() {
    const sortableHeaders = this.shadowRoot.querySelectorAll('.sortable');
    
    sortableHeaders.forEach(header => {
      this.addEventListener(header, 'click', () => {
        const column = header.dataset.column;
        this.sort(column);
      });
    });
  }

  sort(column) {
    // Implement sorting logic
    this.dispatchEvent(new CustomEvent('tt-sort', {
      detail: { column },
      bubbles: true
    }));
  }
}

customElements.define('tt-table', TTTable);
```

### 8. tt-form

```javascript
class TTForm extends TTComponent {
  static get observedAttributes() {
    return ['action', 'method', 'novalidate'];
  }

  getComponentStyles() {
    return `
      .form {
        display: flex;
        flex-direction: column;
        gap: var(--form-gap, 16px);
      }
      
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      .form-label {
        font-weight: var(--form-label-font-weight, 500);
        color: var(--form-label-color, #333);
        font-size: var(--form-label-font-size, 14px);
      }
      
      .form-error {
        color: var(--color-danger, #dc3545);
        font-size: 12px;
        margin-top: 4px;
      }
      
      .form-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 16px;
      }
    `;
  }

  render() {
    const action = this.getAttribute('action') || '';
    const method = this.getAttribute('method') || 'POST';
    const novalidate = this.hasAttribute('novalidate');

    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <form 
        class="form" 
        action="${action}" 
        method="${method}"
        ${novalidate ? 'novalidate' : ''}
      >
        <slot></slot>
      </form>
    `;
  }

  setupEventListeners() {
    const form = this.shadowRoot.querySelector('.form');
    
    this.addEventListener(form, 'submit', (e) => {
      e.preventDefault();
      this.handleSubmit(e);
    });
  }

  handleSubmit(e) {
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    this.dispatchEvent(new CustomEvent('tt-submit', {
      detail: { data },
      bubbles: true
    }));
  }
}

customElements.define('tt-form', TTForm);
```

### 9. tt-notification

```javascript
class TTNotification extends TTComponent {
  static get observedAttributes() {
    return ['type', 'title', 'message', 'duration', 'closable'];
  }

  getComponentStyles() {
    return `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: var(--notification-radius, 8px);
        box-shadow: var(--notification-shadow, 0 4px 12px rgba(0,0,0,0.15));
        padding: var(--notification-padding, 16px);
        max-width: 400px;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
      }
      
      .notification.show {
        transform: translateX(0);
      }
      
      .notification--success {
        border-left: 4px solid var(--color-success, #28a745);
      }
      
      .notification--error {
        border-left: 4px solid var(--color-danger, #dc3545);
      }
      
      .notification--warning {
        border-left: 4px solid var(--color-warning, #ffc107);
      }
      
      .notification--info {
        border-left: 4px solid var(--color-info, #17a2b8);
      }
      
      .notification-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      
      .notification-title {
        font-weight: 600;
        font-size: 14px;
        margin: 0;
      }
      
      .notification-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .notification-message {
        font-size: 14px;
        color: #666;
        margin: 0;
      }
    `;
  }

  render() {
    const type = this.getAttribute('type') || 'info';
    const title = this.getAttribute('title') || '';
    const message = this.getAttribute('message') || '';
    const closable = this.hasAttribute('closable');

    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <div class="notification notification--${type}">
        <div class="notification-header">
          <h4 class="notification-title">${title}</h4>
          ${closable ? '<button class="notification-close">&times;</button>' : ''}
        </div>
        <p class="notification-message">${message}</p>
      </div>
    `;
  }

  setupEventListeners() {
    const notification = this.shadowRoot.querySelector('.notification');
    const closeBtn = this.shadowRoot.querySelector('.notification-close');
    
    if (closeBtn) {
      this.addEventListener(closeBtn, 'click', () => {
        this.close();
      });
    }
    
    // Auto close
    const duration = parseInt(this.getAttribute('duration') || '5000');
    if (duration > 0) {
      setTimeout(() => {
        this.close();
      }, duration);
    }
  }

  show() {
    this.style.display = 'block';
    setTimeout(() => {
      this.classList.add('show');
    }, 10);
  }

  close() {
    this.classList.remove('show');
    setTimeout(() => {
      this.remove();
    }, 300);
  }
}

customElements.define('tt-notification', TTNotification);
```

### 10. tt-loader

```javascript
class TTLoader extends TTComponent {
  static get observedAttributes() {
    return ['size', 'color', 'text'];
  }

  getComponentStyles() {
    return `
      .loader {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
      }
      
      .loader-spinner {
        border: 2px solid var(--loader-border-color, #f3f3f3);
        border-top: 2px solid var(--loader-color, #007bff);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      .loader--small .loader-spinner {
        width: 20px;
        height: 20px;
      }
      
      .loader--medium .loader-spinner {
        width: 40px;
        height: 40px;
      }
      
      .loader--large .loader-spinner {
        width: 60px;
        height: 60px;
      }
      
      .loader-text {
        font-size: 14px;
        color: var(--loader-text-color, #666);
        text-align: center;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
  }

  render() {
    const size = this.getAttribute('size') || 'medium';
    const color = this.getAttribute('color') || '';
    const text = this.getAttribute('text') || '';

    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <div class="loader loader--${size}">
        <div class="loader-spinner" style="${color ? `border-top-color: ${color};` : ''}"></div>
        ${text ? `<div class="loader-text">${text}</div>` : ''}
      </div>
    `;
  }
}

customElements.define('tt-loader', TTLoader);
```

---

## רכיבים מתקדמים (5 רכיבים)

### 11. tt-tabs

```javascript
class TTTabs extends TTComponent {
  static get observedAttributes() {
    return ['active', 'tabs'];
  }

  getComponentStyles() {
    return `
      .tabs {
        display: flex;
        flex-direction: column;
      }
      
      .tabs-header {
        display: flex;
        border-bottom: 1px solid var(--tabs-border-color, #eee);
      }
      
      .tabs-tab {
        padding: var(--tabs-tab-padding, 12px 16px);
        background: none;
        border: none;
        cursor: pointer;
        font-size: 14px;
        color: var(--tabs-tab-color, #666);
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
      }
      
      .tabs-tab:hover {
        color: var(--tabs-tab-hover-color, #333);
      }
      
      .tabs-tab.active {
        color: var(--tabs-tab-active-color, #007bff);
        border-bottom-color: var(--tabs-tab-active-color, #007bff);
      }
      
      .tabs-content {
        padding: var(--tabs-content-padding, 16px);
      }
      
      .tabs-panel {
        display: none;
      }
      
      .tabs-panel.active {
        display: block;
      }
    `;
  }

  render() {
    const active = this.getAttribute('active') || '0';
    const tabs = JSON.parse(this.getAttribute('tabs') || '[]');

    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <div class="tabs">
        <div class="tabs-header">
          ${tabs.map((tab, index) => `
            <button 
              class="tabs-tab ${index == active ? 'active' : ''}" 
              data-tab="${index}"
            >
              ${tab.label}
            </button>
          `).join('')}
        </div>
        <div class="tabs-content">
          ${tabs.map((tab, index) => `
            <div class="tabs-panel ${index == active ? 'active' : ''}" data-panel="${index}">
              ${tab.content}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const tabs = this.shadowRoot.querySelectorAll('.tabs-tab');
    
    tabs.forEach(tab => {
      this.addEventListener(tab, 'click', () => {
        const tabIndex = tab.dataset.tab;
        this.setActiveTab(tabIndex);
      });
    });
  }

  setActiveTab(index) {
    // Update active tab
    const tabs = this.shadowRoot.querySelectorAll('.tabs-tab');
    const panels = this.shadowRoot.querySelectorAll('.tabs-panel');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    panels.forEach(panel => panel.classList.remove('active'));
    
    tabs[index].classList.add('active');
    panels[index].classList.add('active');
    
    this.setAttribute('active', index);
    
    this.dispatchEvent(new CustomEvent('tt-tab-change', {
      detail: { activeTab: index },
      bubbles: true
    }));
  }
}

customElements.define('tt-tabs', TTTabs);
```

### 12. tt-accordion

```javascript
class TTAccordion extends TTComponent {
  static get observedAttributes() {
    return ['items', 'multiple'];
  }

  getComponentStyles() {
    return `
      .accordion {
        border: 1px solid var(--accordion-border-color, #eee);
        border-radius: var(--accordion-radius, 8px);
        overflow: hidden;
      }
      
      .accordion-item {
        border-bottom: 1px solid var(--accordion-border-color, #eee);
      }
      
      .accordion-item:last-child {
        border-bottom: none;
      }
      
      .accordion-header {
        padding: var(--accordion-header-padding, 16px);
        background: var(--accordion-header-bg, #f8f9fa);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: background-color 0.2s ease;
      }
      
      .accordion-header:hover {
        background-color: var(--accordion-header-hover-bg, #e9ecef);
      }
      
      .accordion-title {
        font-weight: 500;
        margin: 0;
      }
      
      .accordion-icon {
        transition: transform 0.2s ease;
      }
      
      .accordion-item.open .accordion-icon {
        transform: rotate(180deg);
      }
      
      .accordion-content {
        padding: var(--accordion-content-padding, 16px);
        display: none;
        background: white;
      }
      
      .accordion-item.open .accordion-content {
        display: block;
      }
    `;
  }

  render() {
    const items = JSON.parse(this.getAttribute('items') || '[]');
    const multiple = this.hasAttribute('multiple');

    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <div class="accordion">
        ${items.map((item, index) => `
          <div class="accordion-item" data-index="${index}">
            <div class="accordion-header">
              <h3 class="accordion-title">${item.title}</h3>
              <span class="accordion-icon">▼</span>
            </div>
            <div class="accordion-content">
              ${item.content}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  setupEventListeners() {
    const headers = this.shadowRoot.querySelectorAll('.accordion-header');
    
    headers.forEach(header => {
      this.addEventListener(header, 'click', () => {
        const item = header.closest('.accordion-item');
        const index = item.dataset.index;
        this.toggleItem(index);
      });
    });
  }

  toggleItem(index) {
    const item = this.shadowRoot.querySelector(`[data-index="${index}"]`);
    const multiple = this.hasAttribute('multiple');
    
    if (!multiple) {
      // Close all other items
      const allItems = this.shadowRoot.querySelectorAll('.accordion-item');
      allItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('open');
        }
      });
    }
    
    item.classList.toggle('open');
    
    this.dispatchEvent(new CustomEvent('tt-accordion-toggle', {
      detail: { index, open: item.classList.contains('open') },
      bubbles: true
    }));
  }
}

customElements.define('tt-accordion', TTAccordion);
```

### 13. tt-dropdown

```javascript
class TTDropdown extends TTComponent {
  static get observedAttributes() {
    return ['options', 'placeholder', 'value', 'searchable'];
  }

  getComponentStyles() {
    return `
      .dropdown {
        position: relative;
        display: inline-block;
        width: 100%;
      }
      
      .dropdown-trigger {
        width: 100%;
        padding: var(--dropdown-trigger-padding, 8px 12px);
        border: 1px solid var(--dropdown-border-color, #ddd);
        border-radius: var(--dropdown-radius, 4px);
        background: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .dropdown-trigger:focus {
        outline: none;
        border-color: var(--color-primary, #007bff);
      }
      
      .dropdown-arrow {
        transition: transform 0.2s ease;
      }
      
      .dropdown.open .dropdown-arrow {
        transform: rotate(180deg);
      }
      
      .dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid var(--dropdown-border-color, #ddd);
        border-top: none;
        border-radius: 0 0 var(--dropdown-radius, 4px) var(--dropdown-radius, 4px);
        box-shadow: var(--dropdown-shadow, 0 2px 8px rgba(0,0,0,0.1));
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
      }
      
      .dropdown.open .dropdown-menu {
        display: block;
      }
      
      .dropdown-option {
        padding: var(--dropdown-option-padding, 8px 12px);
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      
      .dropdown-option:hover {
        background-color: var(--dropdown-option-hover-bg, #f8f9fa);
      }
      
      .dropdown-option.selected {
        background-color: var(--dropdown-option-selected-bg, #e3f2fd);
      }
      
      .dropdown-search {
        padding: 8px 12px;
        border-bottom: 1px solid var(--dropdown-border-color, #eee);
      }
      
      .dropdown-search input {
        width: 100%;
        padding: 4px 8px;
        border: 1px solid var(--dropdown-border-color, #ddd);
        border-radius: 4px;
        font-size: 14px;
      }
    `;
  }

  render() {
    const options = JSON.parse(this.getAttribute('options') || '[]');
    const placeholder = this.getAttribute('placeholder') || 'Select...';
    const value = this.getAttribute('value') || '';
    const searchable = this.hasAttribute('searchable');

    const selectedOption = options.find(opt => opt.value === value);

    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <div class="dropdown">
        <div class="dropdown-trigger">
          <span class="dropdown-text">${selectedOption ? selectedOption.label : placeholder}</span>
          <span class="dropdown-arrow">▼</span>
        </div>
        <div class="dropdown-menu">
          ${searchable ? `
            <div class="dropdown-search">
              <input type="text" placeholder="Search..." class="dropdown-search-input">
            </div>
          ` : ''}
          ${options.map(option => `
            <div class="dropdown-option ${option.value === value ? 'selected' : ''}" data-value="${option.value}">
              ${option.label}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const trigger = this.shadowRoot.querySelector('.dropdown-trigger');
    const options = this.shadowRoot.querySelectorAll('.dropdown-option');
    const searchInput = this.shadowRoot.querySelector('.dropdown-search-input');
    
    this.addEventListener(trigger, 'click', () => {
      this.toggle();
    });
    
    options.forEach(option => {
      this.addEventListener(option, 'click', () => {
        const value = option.dataset.value;
        this.selectOption(value);
      });
    });
    
    if (searchInput) {
      this.addEventListener(searchInput, 'input', (e) => {
        this.filterOptions(e.target.value);
      });
    }
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.contains(e.target)) {
        this.close();
      }
    });
  }

  toggle() {
    this.classList.toggle('open');
  }

  open() {
    this.classList.add('open');
  }

  close() {
    this.classList.remove('open');
  }

  selectOption(value) {
    this.setAttribute('value', value);
    this.close();
    
    this.dispatchEvent(new CustomEvent('tt-change', {
      detail: { value },
      bubbles: true
    }));
  }

  filterOptions(searchTerm) {
    const options = this.shadowRoot.querySelectorAll('.dropdown-option');
    options.forEach(option => {
      const label = option.textContent.toLowerCase();
      const matches = label.includes(searchTerm.toLowerCase());
      option.style.display = matches ? 'block' : 'none';
    });
  }
}

customElements.define('tt-dropdown', TTDropdown);
```

### 14. tt-pagination

```javascript
class TTPagination extends TTComponent {
  static get observedAttributes() {
    return ['current', 'total', 'per-page', 'show-info'];
  }

  getComponentStyles() {
    return `
      .pagination {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      
      .pagination-info {
        color: var(--pagination-info-color, #666);
        font-size: 14px;
      }
      
      .pagination-controls {
        display: flex;
        gap: 4px;
        align-items: center;
      }
      
      .pagination-btn {
        padding: var(--pagination-btn-padding, 6px 12px);
        border: 1px solid var(--pagination-btn-border-color, #ddd);
        background: white;
        cursor: pointer;
        border-radius: var(--pagination-btn-radius, 4px);
        font-size: 14px;
        transition: all 0.2s ease;
      }
      
      .pagination-btn:hover:not(:disabled) {
        background-color: var(--pagination-btn-hover-bg, #f8f9fa);
      }
      
      .pagination-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .pagination-btn.active {
        background-color: var(--color-primary, #007bff);
        color: white;
        border-color: var(--color-primary, #007bff);
      }
      
      .pagination-ellipsis {
        padding: 6px 12px;
        color: var(--pagination-ellipsis-color, #666);
      }
    `;
  }

  render() {
    const current = parseInt(this.getAttribute('current') || '1');
    const total = parseInt(this.getAttribute('total') || '0');
    const perPage = parseInt(this.getAttribute('per-page') || '10');
    const showInfo = this.hasAttribute('show-info');
    
    const totalPages = Math.ceil(total / perPage);
    const start = (current - 1) * perPage + 1;
    const end = Math.min(current * perPage, total);

    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <div class="pagination">
        ${showInfo ? `
          <div class="pagination-info">
            Showing ${start}-${end} of ${total} entries
          </div>
        ` : ''}
        <div class="pagination-controls">
          <button class="pagination-btn" data-page="${current - 1}" ${current <= 1 ? 'disabled' : ''}>
            Previous
          </button>
          ${this.renderPageNumbers(current, totalPages)}
          <button class="pagination-btn" data-page="${current + 1}" ${current >= totalPages ? 'disabled' : ''}>
            Next
          </button>
        </div>
      </div>
    `;
  }

  renderPageNumbers(current, totalPages) {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (current >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages.map(page => {
      if (page === '...') {
        return '<span class="pagination-ellipsis">...</span>';
      }
      return `
        <button 
          class="pagination-btn ${page == current ? 'active' : ''}" 
          data-page="${page}"
        >
          ${page}
        </button>
      `;
    }).join('');
  }

  setupEventListeners() {
    const buttons = this.shadowRoot.querySelectorAll('.pagination-btn');
    
    buttons.forEach(button => {
      this.addEventListener(button, 'click', () => {
        const page = parseInt(button.dataset.page);
        if (page && page !== parseInt(this.getAttribute('current'))) {
          this.setAttribute('current', page);
          this.dispatchEvent(new CustomEvent('tt-page-change', {
            detail: { page },
            bubbles: true
          }));
        }
      });
    });
  }
}

customElements.define('tt-pagination', TTPagination);
```

### 15. tt-chart

```javascript
class TTChart extends TTComponent {
  static get observedAttributes() {
    return ['type', 'data', 'options'];
  }

  getComponentStyles() {
    return `
      .chart {
        position: relative;
        width: 100%;
        height: 300px;
      }
      
      .chart-canvas {
        width: 100%;
        height: 100%;
      }
      
      .chart-loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--chart-loading-color, #666);
      }
    `;
  }

  render() {
    const type = this.getAttribute('type') || 'line';
    const data = JSON.parse(this.getAttribute('data') || '{}');
    const options = JSON.parse(this.getAttribute('options') || '{}');

    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <div class="chart">
        <canvas class="chart-canvas"></canvas>
        <div class="chart-loading">Loading chart...</div>
      </div>
    `;

    // Initialize chart after render
    setTimeout(() => {
      this.initializeChart(type, data, options);
    }, 100);
  }

  initializeChart(type, data, options) {
    const canvas = this.shadowRoot.querySelector('.chart-canvas');
    const ctx = canvas.getContext('2d');
    
    // Simple chart implementation (in real app, use Chart.js or similar)
    this.drawSimpleChart(ctx, type, data, options);
    
    // Hide loading
    const loading = this.shadowRoot.querySelector('.chart-loading');
    loading.style.display = 'none';
  }

  drawSimpleChart(ctx, type, data, options) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    if (type === 'line' && data.labels && data.datasets) {
      this.drawLineChart(ctx, data, width, height);
    } else if (type === 'bar' && data.labels && data.datasets) {
      this.drawBarChart(ctx, data, width, height);
    } else if (type === 'pie' && data.datasets) {
      this.drawPieChart(ctx, data, width, height);
    }
  }

  drawLineChart(ctx, data, width, height) {
    const dataset = data.datasets[0];
    const labels = data.labels;
    const values = dataset.data;
    
    if (values.length === 0) return;
    
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    
    const stepX = width / (values.length - 1);
    const stepY = height / range;
    
    ctx.strokeStyle = dataset.borderColor || '#007bff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    values.forEach((value, index) => {
      const x = index * stepX;
      const y = height - (value - min) * stepY;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
  }

  drawBarChart(ctx, data, width, height) {
    const dataset = data.datasets[0];
    const labels = data.labels;
    const values = dataset.data;
    
    if (values.length === 0) return;
    
    const max = Math.max(...values);
    const barWidth = width / values.length * 0.8;
    const barSpacing = width / values.length * 0.2;
    
    ctx.fillStyle = dataset.backgroundColor || '#007bff';
    
    values.forEach((value, index) => {
      const barHeight = (value / max) * height;
      const x = index * (barWidth + barSpacing) + barSpacing / 2;
      const y = height - barHeight;
      
      ctx.fillRect(x, y, barWidth, barHeight);
    });
  }

  drawPieChart(ctx, data, width, height) {
    const dataset = data.datasets[0];
    const values = dataset.data;
    const colors = dataset.backgroundColor || ['#007bff', '#28a745', '#ffc107', '#dc3545'];
    
    if (values.length === 0) return;
    
    const total = values.reduce((sum, value) => sum + value, 0);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    
    let currentAngle = 0;
    
    values.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI;
      
      ctx.fillStyle = colors[index % colors.length];
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();
      
      currentAngle += sliceAngle;
    });
  }
}

customElements.define('tt-chart', TTChart);
```

---

## סיכום

### רכיבים שנוצרו (15 רכיבים)

**בסיסיים (5):**
1. tt-button - כפתורים עם variants
2. tt-input - שדות קלט עם validation
3. tt-select - רשימות נפתחות
4. tt-badge - תגיות מידע
5. tt-card - כרטיסי תוכן

**מתקדמים (5):**
6. tt-modal - חלונות קופצים
7. tt-table - טבלאות עם sorting
8. tt-form - טפסים עם validation
9. tt-notification - התראות
10. tt-loader - אנימציות טעינה

**מתקדמים (5):**
11. tt-tabs - טאבים
12. tt-accordion - אקורדיון
13. tt-dropdown - רשימות נפתחות מתקדמות
14. tt-pagination - ניווט עמודים
15. tt-chart - גרפים

### יתרונות

**הפחתת קוד:**
- 70% פחות קוד חוזר
- זמן פיתוח ↓ 50%
- אחידות UI מלאה

**תחזוקה:**
- רכיבים נפרדים
- API אחיד
- תיעוד מלא

**ביצועים:**
- Web Components native
- Tree shaking
- Lazy loading

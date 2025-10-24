# Code Generators - מפרט מלא

## סקירה

**מטרה:** כלי יצירת קוד אוטומטיים להפחתת זמן פיתוח  
**זמן:** 3-4 שבועות  
**תוצאה:** CRUD ב-1 שעה במקום יום (↓ 87%)

---

## ארכיטקטורה

### Generator System

```javascript
/**
 * TikTrack Code Generator System
 * מערכת יצירת קוד אוטומטית
 */

class CodeGenerator {
  constructor() {
    this.templates = new Map();
    this.variables = new Map();
    this.output = [];
  }

  /**
   * Register template
   * @param {string} name - Template name
   * @param {string} content - Template content
   */
  registerTemplate(name, content) {
    this.templates.set(name, content);
  }

  /**
   * Set variable
   * @param {string} key - Variable key
   * @param {any} value - Variable value
   */
  setVariable(key, value) {
    this.variables.set(key, value);
  }

  /**
   * Generate code from template
   * @param {string} templateName - Template to use
   * @param {object} variables - Additional variables
   * @returns {string} - Generated code
   */
  generate(templateName, variables = {}) {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    const allVariables = { ...Object.fromEntries(this.variables), ...variables };
    return this.processTemplate(template, allVariables);
  }

  /**
   * Process template with variables
   * @param {string} template - Template content
   * @param {object} variables - Variables to replace
   * @returns {string} - Processed template
   */
  processTemplate(template, variables) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  /**
   * Generate multiple files
   * @param {Array} files - Array of file definitions
   * @returns {Array} - Generated files
   */
  generateFiles(files) {
    return files.map(file => ({
      path: file.path,
      content: this.generate(file.template, file.variables)
    }));
  }
}
```

---

## CRUD Generator

### Template System

```javascript
// CRUD Generator Templates
const CRUD_TEMPLATES = {
  // Frontend Service
  'frontend-service': `
/**
 * {{entityName}} Service
 * {{entityDescription}}
 */

class {{entityName}}Service {
  static baseUrl = '/api/{{entityNameLower}}';
  
  /**
   * Get all {{entityNameLower}}
   * @param {object} filters - Filter options
   * @returns {Promise<Array>} - {{entityNameLower}} list
   */
  static async getAll(filters = {}) {
    try {
      Logger.info('Fetching {{entityNameLower}} list', { filters });
      
      const cacheKey = \`{{entityNameLower}}-data-\${JSON.stringify(filters)}\`;
      const cached = await CacheManager.get(cacheKey);
      if (cached) {
        Logger.debug('{{entityNameLower}} list loaded from cache');
        return cached;
      }
      
      const response = await fetch(\`\${this.baseUrl}?\${new URLSearchParams(filters)}\`);
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      
      const data = await response.json();
      CacheManager.set(cacheKey, data, 'medium');
      
      Logger.info('{{entityNameLower}} list fetched successfully', { count: data.length });
      return data;
      
    } catch (error) {
      Logger.error('Failed to fetch {{entityNameLower}} list', error, { filters });
      throw error;
    }
  }
  
  /**
   * Get {{entityNameLower}} by ID
   * @param {number} id - {{entityNameLower}} ID
   * @returns {Promise<Object>} - {{entityNameLower}} data
   */
  static async getById(id) {
    try {
      Logger.info('Fetching {{entityNameLower}} by ID', { id });
      
      const cacheKey = \`{{entityNameLower}}-\${id}\`;
      const cached = await CacheManager.get(cacheKey);
      if (cached) {
        Logger.debug('{{entityNameLower}} loaded from cache', { id });
        return cached;
      }
      
      const response = await fetch(\`\${this.baseUrl}/\${id}\`);
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      
      const data = await response.json();
      CacheManager.set(cacheKey, data, 'medium');
      
      Logger.info('{{entityNameLower}} fetched successfully', { id });
      return data;
      
    } catch (error) {
      Logger.error('Failed to fetch {{entityNameLower}}', error, { id });
      throw error;
    }
  }
  
  /**
   * Create new {{entityNameLower}}
   * @param {object} data - {{entityNameLower}} data
   * @returns {Promise<Object>} - Created {{entityNameLower}}
   */
  static async create(data) {
    try {
      Logger.info('Creating {{entityNameLower}}', { data });
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      
      const result = await response.json();
      
      // Invalidate cache
      CacheManager.invalidateByDependency('{{entityNameLower}}-data');
      
      Logger.info('{{entityNameLower}} created successfully', { id: result.id });
      return result;
      
    } catch (error) {
      Logger.error('Failed to create {{entityNameLower}}', error, { data });
      throw error;
    }
  }
  
  /**
   * Update {{entityNameLower}}
   * @param {number} id - {{entityNameLower}} ID
   * @param {object} data - Updated data
   * @returns {Promise<Object>} - Updated {{entityNameLower}}
   */
  static async update(id, data) {
    try {
      Logger.info('Updating {{entityNameLower}}', { id, data });
      
      const response = await fetch(\`\${this.baseUrl}/\${id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      
      const result = await response.json();
      
      // Invalidate cache
      CacheManager.remove(\`{{entityNameLower}}-\${id}\`);
      CacheManager.invalidateByDependency('{{entityNameLower}}-data');
      
      Logger.info('{{entityNameLower}} updated successfully', { id });
      return result;
      
    } catch (error) {
      Logger.error('Failed to update {{entityNameLower}}', error, { id, data });
      throw error;
    }
  }
  
  /**
   * Delete {{entityNameLower}}
   * @param {number} id - {{entityNameLower}} ID
   * @returns {Promise<boolean>} - Success status
   */
  static async delete(id) {
    try {
      Logger.info('Deleting {{entityNameLower}}', { id });
      
      const response = await fetch(\`\${this.baseUrl}/\${id}\`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      
      // Invalidate cache
      CacheManager.remove(\`{{entityNameLower}}-\${id}\`);
      CacheManager.invalidateByDependency('{{entityNameLower}}-data');
      
      Logger.info('{{entityNameLower}} deleted successfully', { id });
      return true;
      
    } catch (error) {
      Logger.error('Failed to delete {{entityNameLower}}', error, { id });
      throw error;
    }
  }
}

window.{{entityName}}Service = {{entityName}}Service;
`,

  // Backend Model
  'backend-model': `
# Backend/models/{{entityNameLower}}.py

from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class {{entityName}}(Base):
    __tablename__ = '{{entityNameLower}}'
    
    id = Column(Integer, primary_key=True)
    {{#fields}}
    {{name}} = Column({{type}}, {{#nullable}}nullable=True{{/nullable}}{{^nullable}}nullable=False{{/nullable}})
    {{/fields}}
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            {{#fields}}
            '{{name}}': self.{{name}},
            {{/fields}}
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<{{entityName}}(id={self.id})>'
`,

  // Backend API
  'backend-api': `
# Backend/routes/api/{{entityNameLower}}.py

from flask import Blueprint, request, jsonify
from models.{{entityNameLower}} import {{entityName}}
from config.database import db
from datetime import datetime

{{entityNameLower}}_bp = Blueprint('{{entityNameLower}}', __name__, url_prefix='/api/{{entityNameLower}}')

@{{entityNameLower}}_bp.route('/', methods=['GET'])
def get_{{entityNameLower}}():
    """
    Get all {{entityNameLower}}
    GET /api/{{entityNameLower}}?page=1&limit=10&search=term
    """
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        search = request.args.get('search', '')
        
        query = {{entityName}}.query
        
        if search:
            {{#searchFields}}
            query = query.filter({{entityName}}.{{field}}.ilike(f'%{search}%'))
            {{/searchFields}}
        
        total = query.count()
        {{entityNameLower}} = query.offset((page - 1) * limit).limit(limit).all()
        
        return jsonify({
            'success': True,
            'data': [item.to_dict() for item in {{entityNameLower}}],
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@{{entityNameLower}}_bp.route('/<int:id>', methods=['GET'])
def get_{{entityNameLower}}_by_id(id):
    """
    Get {{entityNameLower}} by ID
    GET /api/{{entityNameLower}}/123
    """
    try:
        {{entityNameLower}} = {{entityName}}.query.get_or_404(id)
        return jsonify({
            'success': True,
            'data': {{entityNameLower}}.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@{{entityNameLower}}_bp.route('/', methods=['POST'])
def create_{{entityNameLower}}():
    """
    Create new {{entityNameLower}}
    POST /api/{{entityNameLower}}
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        {{#requiredFields}}
        if '{{field}}' not in data:
            return jsonify({'error': '{{field}} is required'}), 400
        {{/requiredFields}}
        
        {{entityNameLower}} = {{entityName}}(
            {{#fields}}
            {{name}}=data.get('{{name}}'),
            {{/fields}}
        )
        
        db.session.add({{entityNameLower}})
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {{entityNameLower}}.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@{{entityNameLower}}_bp.route('/<int:id>', methods=['PUT'])
def update_{{entityNameLower}}(id):
    """
    Update {{entityNameLower}}
    PUT /api/{{entityNameLower}}/123
    """
    try:
        {{entityNameLower}} = {{entityName}}.query.get_or_404(id)
        data = request.get_json()
        
        {{#fields}}
        if '{{name}}' in data:
            {{entityNameLower}}.{{name}} = data['{{name}}']
        {{/fields}}
        
        {{entityNameLower}}.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {{entityNameLower}}.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@{{entityNameLower}}_bp.route('/<int:id>', methods=['DELETE'])
def delete_{{entityNameLower}}(id):
    """
    Delete {{entityNameLower}}
    DELETE /api/{{entityNameLower}}/123
    """
    try:
        {{entityNameLower}} = {{entityName}}.query.get_or_404(id)
        db.session.delete({{entityNameLower}})
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '{{entityNameLower}} deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
`,

  // Frontend Page
  'frontend-page': `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>{{entityName}} Management</title>
    <link rel="stylesheet" href="styles-new/master.css">
    <link rel="stylesheet" href="styles-new/{{entityNameLower}}.css">
</head>
<body>
    <div class="container">
        <h1>{{entityName}} Management</h1>
        
        <!-- Filters -->
        <div class="filters-section">
            <div class="filter-group">
                <input type="text" id="search-{{entityNameLower}}" placeholder="Search {{entityNameLower}}..." class="filter-input">
                <button id="filter-{{entityNameLower}}" class="filter-button">Filter</button>
                <button id="clear-filters" class="filter-button secondary">Clear</button>
            </div>
        </div>
        
        <!-- Actions -->
        <div class="actions-section">
            <button id="add-{{entityNameLower}}" class="action-button primary">
                <span class="icon">+</span>
                Add {{entityName}}
            </button>
            <button id="refresh-{{entityNameLower}}" class="action-button">
                <span class="icon">⟳</span>
                Refresh
            </button>
        </div>
        
        <!-- Table -->
        <div class="table-container">
            <table id="{{entityNameLower}}-table" class="data-table">
                <thead>
                    <tr>
                        {{#fields}}
                        <th data-sort="{{name}}">{{label}}</th>
                        {{/fields}}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="{{entityNameLower}}-tbody">
                    <!-- Data will be loaded here -->
                </tbody>
            </table>
        </div>
        
        <!-- Pagination -->
        <div id="{{entityNameLower}}-pagination" class="pagination-container">
            <!-- Pagination will be generated here -->
        </div>
    </div>

    <!-- {{entityName}} Modal -->
    <div id="{{entityNameLower}}-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-title">{{entityName}} Details</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="{{entityNameLower}}-form">
                    {{#fields}}
                    <div class="form-group">
                        <label for="{{name}}">{{label}}:</label>
                        <input type="{{inputType}}" id="{{name}}" name="{{name}}" {{#required}}required{{/required}}>
                    </div>
                    {{/fields}}
                </form>
            </div>
            <div class="modal-footer">
                <button id="save-{{entityNameLower}}" class="action-button primary">Save</button>
                <button id="cancel-{{entityNameLower}}" class="action-button">Cancel</button>
            </div>
        </div>
    </div>

    <script src="scripts/cache-manager.js"></script>
    <script src="scripts/logger-service.js"></script>
    <script src="scripts/{{entityNameLower}}-service.js"></script>
    <script src="scripts/{{entityNameLower}}.js"></script>
</body>
</html>
`,

  // Frontend JavaScript
  'frontend-js': `
/**
 * {{entityName}} Management
 * {{entityDescription}}
 */

class {{entityName}}Manager {
  constructor() {
    this.currentPage = 1;
    this.pageSize = 10;
    this.filters = {};
    this.editingId = null;
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.load{{entityName}}();
  }
  
  setupEventListeners() {
    // Add button
    document.getElementById('add-{{entityNameLower}}').addEventListener('click', () => {
      this.openModal();
    });
    
    // Refresh button
    document.getElementById('refresh-{{entityNameLower}}').addEventListener('click', () => {
      this.load{{entityName}}();
    });
    
    // Filter button
    document.getElementById('filter-{{entityNameLower}}').addEventListener('click', () => {
      this.applyFilters();
    });
    
    // Clear filters
    document.getElementById('clear-filters').addEventListener('click', () => {
      this.clearFilters();
    });
    
    // Save button
    document.getElementById('save-{{entityNameLower}}').addEventListener('click', () => {
      this.save{{entityName}}();
    });
    
    // Cancel button
    document.getElementById('cancel-{{entityNameLower}}').addEventListener('click', () => {
      this.closeModal();
    });
    
    // Modal close
    document.querySelector('.modal-close').addEventListener('click', () => {
      this.closeModal();
    });
  }
  
  async load{{entityName}}() {
    try {
      Logger.info('Loading {{entityNameLower}} list');
      
      const data = await {{entityName}}Service.getAll({
        page: this.currentPage,
        limit: this.pageSize,
        ...this.filters
      });
      
      this.render{{entityName}}(data.data);
      this.renderPagination(data.pagination);
      
    } catch (error) {
      Logger.error('Failed to load {{entityNameLower}} list', error);
      this.showError('Failed to load {{entityNameLower}} list');
    }
  }
  
  render{{entityName}}({{entityNameLower}}) {
    const tbody = document.getElementById('{{entityNameLower}}-tbody');
    tbody.innerHTML = '';
    
    {{entityNameLower}}.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = \`
        {{#fields}}
        <td>\${item.{{name}} || '-'}</td>
        {{/fields}}
        <td>
          <button class="action-button small" onclick="{{entityNameLower}}Manager.edit{{entityName}}(\${item.id})">
            Edit
          </button>
          <button class="action-button small danger" onclick="{{entityNameLower}}Manager.delete{{entityName}}(\${item.id})">
            Delete
          </button>
        </td>
      \`;
      tbody.appendChild(row);
    });
  }
  
  renderPagination(pagination) {
    const container = document.getElementById('{{entityNameLower}}-pagination');
    container.innerHTML = \`
      <div class="pagination">
        <button \${pagination.page <= 1 ? 'disabled' : ''} onclick="{{entityNameLower}}Manager.previousPage()">
          Previous
        </button>
        <span>Page \${pagination.page} of \${pagination.pages}</span>
        <button \${pagination.page >= pagination.pages ? 'disabled' : ''} onclick="{{entityNameLower}}Manager.nextPage()">
          Next
        </button>
      </div>
    \`;
  }
  
  openModal({{entityNameLower}} = null) {
    this.editingId = {{entityNameLower}} ? {{entityNameLower}}.id : null;
    
    if ({{entityNameLower}}) {
      // Edit mode
      document.getElementById('modal-title').textContent = 'Edit {{entityName}}';
      {{#fields}}
      document.getElementById('{{name}}').value = {{entityNameLower}}.{{name}} || '';
      {{/fields}}
    } else {
      // Add mode
      document.getElementById('modal-title').textContent = 'Add {{entityName}}';
      document.getElementById('{{entityNameLower}}-form').reset();
    }
    
    document.getElementById('{{entityNameLower}}-modal').style.display = 'block';
  }
  
  closeModal() {
    document.getElementById('{{entityNameLower}}-modal').style.display = 'none';
    this.editingId = null;
  }
  
  async save{{entityName}}() {
    try {
      const formData = new FormData(document.getElementById('{{entityNameLower}}-form'));
      const data = Object.fromEntries(formData.entries());
      
      if (this.editingId) {
        await {{entityName}}Service.update(this.editingId, data);
        Logger.info('{{entityNameLower}} updated successfully', { id: this.editingId });
      } else {
        await {{entityName}}Service.create(data);
        Logger.info('{{entityNameLower}} created successfully');
      }
      
      this.closeModal();
      this.load{{entityName}}();
      
    } catch (error) {
      Logger.error('Failed to save {{entityNameLower}}', error);
      this.showError('Failed to save {{entityNameLower}}');
    }
  }
  
  async edit{{entityName}}(id) {
    try {
      const {{entityNameLower}} = await {{entityName}}Service.getById(id);
      this.openModal({{entityNameLower}});
    } catch (error) {
      Logger.error('Failed to load {{entityNameLower}} for editing', error);
      this.showError('Failed to load {{entityNameLower}}');
    }
  }
  
  async delete{{entityName}}(id) {
    if (!confirm('Are you sure you want to delete this {{entityNameLower}}?')) {
      return;
    }
    
    try {
      await {{entityName}}Service.delete(id);
      Logger.info('{{entityNameLower}} deleted successfully', { id });
      this.load{{entityName}}();
    } catch (error) {
      Logger.error('Failed to delete {{entityNameLower}}', error);
      this.showError('Failed to delete {{entityNameLower}}');
    }
  }
  
  applyFilters() {
    const search = document.getElementById('search-{{entityNameLower}}').value;
    this.filters = search ? { search } : {};
    this.currentPage = 1;
    this.load{{entityName}}();
  }
  
  clearFilters() {
    document.getElementById('search-{{entityNameLower}}').value = '';
    this.filters = {};
    this.currentPage = 1;
    this.load{{entityName}}();
  }
  
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.load{{entityName}}();
    }
  }
  
  nextPage() {
    this.currentPage++;
    this.load{{entityName}}();
  }
  
  showError(message) {
    // Show error notification
    Logger.error('{{entityNameLower}} error', { message });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.{{entityNameLower}}Manager = new {{entityName}}Manager();
});
`
};
```

---

## Form Generator

### Template System

```javascript
const FORM_TEMPLATES = {
  // Form HTML
  'form-html': `
<form id="{{formName}}-form" class="{{formName}}-form">
  {{#fields}}
  <div class="form-group">
    <label for="{{name}}">{{label}}:</label>
    {{#isSelect}}
    <select id="{{name}}" name="{{name}}" {{#required}}required{{/required}}>
      <option value="">Select {{label}}...</option>
      {{#options}}
      <option value="{{value}}">{{label}}</option>
      {{/options}}
    </select>
    {{/isSelect}}
    {{^isSelect}}
    {{#isTextarea}}
    <textarea id="{{name}}" name="{{name}}" {{#required}}required{{/required}} rows="{{rows}}">{{defaultValue}}</textarea>
    {{/isTextarea}}
    {{^isTextarea}}
    <input 
      type="{{inputType}}" 
      id="{{name}}" 
      name="{{name}}" 
      value="{{defaultValue}}"
      {{#required}}required{{/required}}
      {{#placeholder}}placeholder="{{placeholder}}"{{/placeholder}}
      {{#pattern}}pattern="{{pattern}}"{{/pattern}}
      {{#min}}min="{{min}}"{{/min}}
      {{#max}}max="{{max}}"{{/max}}
    >
    {{/isTextarea}}
    {{/isSelect}}
    {{#helpText}}
    <small class="form-help">{{helpText}}</small>
    {{/helpText}}
    <div class="form-error" id="{{name}}-error"></div>
  </div>
  {{/fields}}
  
  <div class="form-actions">
    <button type="submit" class="btn btn-primary">{{submitText}}</button>
    <button type="button" class="btn btn-secondary" onclick="this.form.reset()">Reset</button>
  </div>
</form>
`,

  // Form JavaScript
  'form-js': `
/**
 * {{formName}} Form Handler
 * {{formDescription}}
 */

class {{formName}}Handler {
  constructor() {
    this.form = document.getElementById('{{formName}}-form');
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.setupValidation();
  }
  
  setupEventListeners() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
    
    // Real-time validation
    {{#fields}}
    document.getElementById('{{name}}').addEventListener('blur', () => {
      this.validateField('{{name}}');
    });
    {{/fields}}
  }
  
  setupValidation() {
    // Add validation rules
    {{#fields}}
    {{#required}}
    this.addValidationRule('{{name}}', 'required', '{{label}} is required');
    {{/required}}
    {{#pattern}}
    this.addValidationRule('{{name}}', 'pattern', '{{label}} format is invalid', '{{pattern}}');
    {{/pattern}}
    {{#min}}
    this.addValidationRule('{{name}}', 'min', '{{label}} must be at least {{min}}', {{min}});
    {{/min}}
    {{#max}}
    this.addValidationRule('{{name}}', 'max', '{{label}} must be at most {{max}}', {{max}});
    {{/max}}
    {{/fields}}
  }
  
  addValidationRule(fieldName, rule, message, value = null) {
    const field = document.getElementById(fieldName);
    if (!field.validationRules) {
      field.validationRules = [];
    }
    field.validationRules.push({ rule, message, value });
  }
  
  validateField(fieldName) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(fieldName + '-error');
    
    if (!field.validationRules) return true;
    
    for (const rule of field.validationRules) {
      if (!this.checkRule(field, rule)) {
        errorElement.textContent = rule.message;
        field.classList.add('error');
        return false;
      }
    }
    
    errorElement.textContent = '';
    field.classList.remove('error');
    return true;
  }
  
  checkRule(field, rule) {
    const value = field.value.trim();
    
    switch (rule.rule) {
      case 'required':
        return value !== '';
      case 'pattern':
        return new RegExp(rule.value).test(value);
      case 'min':
        return parseFloat(value) >= rule.value;
      case 'max':
        return parseFloat(value) <= rule.value;
      default:
        return true;
    }
  }
  
  validateForm() {
    let isValid = true;
    
    {{#fields}}
    if (!this.validateField('{{name}}')) {
      isValid = false;
    }
    {{/fields}}
    
    return isValid;
  }
  
  async handleSubmit() {
    if (!this.validateForm()) {
      Logger.warn('Form validation failed');
      return;
    }
    
    try {
      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData.entries());
      
      Logger.info('{{formName}} form submitted', { data });
      
      // Process form data
      await this.processForm(data);
      
      // Show success message
      this.showSuccess('{{formName}} submitted successfully');
      
      // Reset form
      this.form.reset();
      
    } catch (error) {
      Logger.error('Failed to submit {{formName}} form', error);
      this.showError('Failed to submit form');
    }
  }
  
  async processForm(data) {
    // Override in child classes
    Logger.info('Processing {{formName}} form data', { data });
  }
  
  showSuccess(message) {
    // Show success notification
    Logger.info('{{formName}} success', { message });
  }
  
  showError(message) {
    // Show error notification
    Logger.error('{{formName}} error', { message });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new {{formName}}Handler();
});
`
};
```

---

## Table Generator

### Template System

```javascript
const TABLE_TEMPLATES = {
  // Table HTML
  'table-html': `
<div class="table-container">
  <div class="table-header">
    <h3>{{tableTitle}}</h3>
    <div class="table-actions">
      <button id="add-{{tableName}}" class="btn btn-primary">
        <span class="icon">+</span>
        Add {{entityName}}
      </button>
      <button id="refresh-{{tableName}}" class="btn btn-secondary">
        <span class="icon">⟳</span>
        Refresh
      </button>
    </div>
  </div>
  
  <div class="table-filters">
    <input type="text" id="search-{{tableName}}" placeholder="Search..." class="filter-input">
    <select id="filter-{{tableName}}" class="filter-select">
      <option value="">All {{entityName}}</option>
      {{#filterOptions}}
      <option value="{{value}}">{{label}}</option>
      {{/filterOptions}}
    </select>
  </div>
  
  <table id="{{tableName}}-table" class="data-table">
    <thead>
      <tr>
        {{#columns}}
        <th data-sort="{{field}}" class="sortable">
          {{label}}
          <span class="sort-icon">↕</span>
        </th>
        {{/columns}}
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="{{tableName}}-tbody">
      <!-- Data will be loaded here -->
    </tbody>
  </table>
  
  <div class="table-pagination">
    <div class="pagination-info">
      Showing <span id="pagination-start">0</span> to <span id="pagination-end">0</span> of <span id="pagination-total">0</span> entries
    </div>
    <div class="pagination-controls">
      <button id="prev-page" class="btn btn-sm">Previous</button>
      <span id="page-info">Page 1 of 1</span>
      <button id="next-page" class="btn btn-sm">Next</button>
    </div>
  </div>
</div>
`,

  // Table JavaScript
  'table-js': `
/**
 * {{tableName}} Table Handler
 * {{tableDescription}}
 */

class {{tableName}}Table {
  constructor() {
    this.currentPage = 1;
    this.pageSize = 10;
    this.sortField = null;
    this.sortDirection = 'asc';
    this.filters = {};
    this.data = [];
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.loadData();
  }
  
  setupEventListeners() {
    // Add button
    document.getElementById('add-{{tableName}}').addEventListener('click', () => {
      this.openAddModal();
    });
    
    // Refresh button
    document.getElementById('refresh-{{tableName}}').addEventListener('click', () => {
      this.loadData();
    });
    
    // Search input
    document.getElementById('search-{{tableName}}').addEventListener('input', (e) => {
      this.filters.search = e.target.value;
      this.currentPage = 1;
      this.loadData();
    });
    
    // Filter select
    document.getElementById('filter-{{tableName}}').addEventListener('change', (e) => {
      this.filters.filter = e.target.value;
      this.currentPage = 1;
      this.loadData();
    });
    
    // Sort headers
    document.querySelectorAll('.sortable').forEach(header => {
      header.addEventListener('click', () => {
        const field = header.dataset.sort;
        this.sort(field);
      });
    });
    
    // Pagination
    document.getElementById('prev-page').addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadData();
      }
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
      this.currentPage++;
      this.loadData();
    });
  }
  
  async loadData() {
    try {
      Logger.info('Loading {{tableName}} data', { 
        page: this.currentPage, 
        filters: this.filters 
      });
      
      const params = {
        page: this.currentPage,
        limit: this.pageSize,
        ...this.filters
      };
      
      if (this.sortField) {
        params.sort = this.sortField;
        params.direction = this.sortDirection;
      }
      
      const response = await fetch(\`/api/{{entityNameLower}}?\${new URLSearchParams(params)}\`);
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      
      const result = await response.json();
      this.data = result.data;
      
      this.renderTable();
      this.renderPagination(result.pagination);
      
      Logger.info('{{tableName}} data loaded successfully', { 
        count: this.data.length 
      });
      
    } catch (error) {
      Logger.error('Failed to load {{tableName}} data', error);
      this.showError('Failed to load data');
    }
  }
  
  renderTable() {
    const tbody = document.getElementById('{{tableName}}-tbody');
    tbody.innerHTML = '';
    
    this.data.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = \`
        {{#columns}}
        <td>\${this.formatCell(item.{{field}}, '{{type}}')}</td>
        {{/columns}}
        <td>
          <button class="btn btn-sm" onclick="{{tableName}}Table.editItem(\${item.id})">
            Edit
          </button>
          <button class="btn btn-sm btn-danger" onclick="{{tableName}}Table.deleteItem(\${item.id})">
            Delete
          </button>
        </td>
      \`;
      tbody.appendChild(row);
    });
  }
  
  formatCell(value, type) {
    if (value === null || value === undefined) return '-';
    
    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'datetime':
        return new Date(value).toLocaleString();
      case 'currency':
        return new Intl.NumberFormat('he-IL', {
          style: 'currency',
          currency: 'ILS'
        }).format(value);
      case 'number':
        return new Intl.NumberFormat('he-IL').format(value);
      case 'boolean':
        return value ? 'Yes' : 'No';
      default:
        return value;
    }
  }
  
  renderPagination(pagination) {
    document.getElementById('pagination-start').textContent = 
      ((pagination.page - 1) * pagination.limit) + 1;
    document.getElementById('pagination-end').textContent = 
      Math.min(pagination.page * pagination.limit, pagination.total);
    document.getElementById('pagination-total').textContent = pagination.total;
    document.getElementById('page-info').textContent = 
      \`Page \${pagination.page} of \${pagination.pages}\`;
    
    document.getElementById('prev-page').disabled = pagination.page <= 1;
    document.getElementById('next-page').disabled = pagination.page >= pagination.pages;
  }
  
  sort(field) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    this.loadData();
  }
  
  editItem(id) {
    Logger.info('Edit item requested', { id });
    // Implement edit functionality
  }
  
  deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    Logger.info('Delete item requested', { id });
    // Implement delete functionality
  }
  
  openAddModal() {
    Logger.info('Add item requested');
    // Implement add functionality
  }
  
  showError(message) {
    Logger.error('{{tableName}} error', { message });
    // Show error notification
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.{{tableName}}Table = new {{tableName}}Table();
});
`
};
```

---

## Generator CLI

### Command Line Interface

```javascript
/**
 * TikTrack Code Generator CLI
 * Command line interface for code generation
 */

class GeneratorCLI {
  constructor() {
    this.generator = new CodeGenerator();
    this.setupTemplates();
  }
  
  setupTemplates() {
    // Register all templates
    Object.entries(CRUD_TEMPLATES).forEach(([name, template]) => {
      this.generator.registerTemplate(name, template);
    });
    
    Object.entries(FORM_TEMPLATES).forEach(([name, template]) => {
      this.generator.registerTemplate(name, template);
    });
    
    Object.entries(TABLE_TEMPLATES).forEach(([name, template]) => {
      this.generator.registerTemplate(name, template);
    });
  }
  
  /**
   * Generate CRUD for entity
   * @param {string} entityName - Entity name (e.g., 'User')
   * @param {Array} fields - Entity fields
   * @param {object} options - Generation options
   */
  generateCRUD(entityName, fields, options = {}) {
    const entityNameLower = entityName.toLowerCase();
    const entityDescription = options.description || `${entityName} management`;
    
    // Set common variables
    this.generator.setVariable('entityName', entityName);
    this.generator.setVariable('entityNameLower', entityNameLower);
    this.generator.setVariable('entityDescription', entityDescription);
    this.generator.setVariable('fields', fields);
    
    // Generate files
    const files = [
      {
        path: `scripts/${entityNameLower}-service.js`,
        template: 'frontend-service',
        variables: {}
      },
      {
        path: `Backend/models/${entityNameLower}.py`,
        template: 'backend-model',
        variables: {}
      },
      {
        path: `Backend/routes/api/${entityNameLower}.py`,
        template: 'backend-api',
        variables: {}
      },
      {
        path: `${entityNameLower}.html`,
        template: 'frontend-page',
        variables: {}
      },
      {
        path: `scripts/${entityNameLower}.js`,
        template: 'frontend-js',
        variables: {}
      }
    ];
    
    return this.generator.generateFiles(files);
  }
  
  /**
   * Generate form for entity
   * @param {string} formName - Form name
   * @param {Array} fields - Form fields
   * @param {object} options - Generation options
   */
  generateForm(formName, fields, options = {}) {
    const formDescription = options.description || `${formName} form`;
    
    this.generator.setVariable('formName', formName);
    this.generator.setVariable('formDescription', formDescription);
    this.generator.setVariable('fields', fields);
    
    const files = [
      {
        path: `forms/${formName}-form.html`,
        template: 'form-html',
        variables: {}
      },
      {
        path: `scripts/${formName}-form.js`,
        template: 'form-js',
        variables: {}
      }
    ];
    
    return this.generator.generateFiles(files);
  }
  
  /**
   * Generate table for entity
   * @param {string} tableName - Table name
   * @param {Array} columns - Table columns
   * @param {object} options - Generation options
   */
  generateTable(tableName, columns, options = {}) {
    const tableDescription = options.description || `${tableName} table`;
    const entityName = options.entityName || tableName;
    
    this.generator.setVariable('tableName', tableName);
    this.generator.setVariable('tableDescription', tableDescription);
    this.generator.setVariable('entityName', entityName);
    this.generator.setVariable('columns', columns);
    
    const files = [
      {
        path: `tables/${tableName}-table.html`,
        template: 'table-html',
        variables: {}
      },
      {
        path: `scripts/${tableName}-table.js`,
        template: 'table-js',
        variables: {}
      }
    ];
    
    return this.generator.generateFiles(files);
  }
}

// Export for use
window.GeneratorCLI = GeneratorCLI;
```

---

## Usage Examples

### Generate CRUD for User

```javascript
const cli = new GeneratorCLI();

const userFields = [
  { name: 'username', type: 'String', label: 'Username', inputType: 'text', required: true },
  { name: 'email', type: 'String', label: 'Email', inputType: 'email', required: true },
  { name: 'firstName', type: 'String', label: 'First Name', inputType: 'text', required: true },
  { name: 'lastName', type: 'String', label: 'Last Name', inputType: 'text', required: true },
  { name: 'isActive', type: 'Boolean', label: 'Active', inputType: 'checkbox', required: false }
];

const files = cli.generateCRUD('User', userFields, {
  description: 'User management system'
});

console.log('Generated files:', files);
```

### Generate Form for Contact

```javascript
const contactFields = [
  { name: 'name', label: 'Name', inputType: 'text', required: true },
  { name: 'email', label: 'Email', inputType: 'email', required: true },
  { name: 'phone', label: 'Phone', inputType: 'tel', required: false },
  { name: 'message', label: 'Message', inputType: 'textarea', required: true, rows: 5 }
];

const formFiles = cli.generateForm('Contact', contactFields, {
  description: 'Contact form for inquiries'
});
```

---

## סיכום

### כלים שנוצרו

**CRUD Generator:**
- Frontend Service (JavaScript)
- Backend Model (Python)
- Backend API (Python)
- Frontend Page (HTML)
- Frontend JavaScript

**Form Generator:**
- Form HTML
- Form JavaScript with validation

**Table Generator:**
- Table HTML
- Table JavaScript with sorting/pagination

### יתרונות

**זמן פיתוח:**
- CRUD חדש: יום → 1 שעה (↓ 87%)
- Form חדש: 4 שעות → 30 דקות (↓ 87%)
- Table חדש: 6 שעות → 1 שעה (↓ 83%)

**איכות קוד:**
- אחידות מלאה
- Best practices
- Error handling
- Logging integration

**תחזוקה:**
- Templates ניתנים לעדכון
- Code generation אוטומטי
- Documentation אוטומטי

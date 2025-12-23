/**
 * Autocomplete Service - TikTrack
 * ===============================
 *
 * General autocomplete system for reusable suggestions dropdown.
 * Supports overlay positioning, keyboard navigation, debouncing, and custom rendering.
 *
 * Documentation: See documentation/03-DEVELOPMENT/GUIDES/AUTOCOMPLETE_SERVICE_GUIDE.md
 *
 * Function Index:
 * - init(inputElement, config) - Initialize autocomplete on input
 * - destroy(inputElement) - Destroy autocomplete instance
 * - show(inputElement, suggestions) - Show suggestions overlay
 * - hide(inputElement) - Hide suggestions overlay
 */

;(function autocompleteServiceFactory() {
  'use strict';

  const DEFAULT_CONFIG = {
    minChars: 0,
    maxSuggestions: 10,
    debounceDelay: 300,
    zIndex: 10000,
    itemRenderer: null, // Custom renderer function
    onSelect: null, // Callback when item is selected
    filterFunction: null, // Custom filter function
    fetchFunction: null // Function that returns Promise with suggestions
  };

  // Store instances per input element
  const instances = new Map();

  /**
   * Debounce helper
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Get or create overlay element for input
   */
  function getOrCreateOverlay(input) {
    const overlayId = `autocomplete-overlay-${input.id || input.name || 'default'}`;
    let overlay = document.getElementById(overlayId);
    
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = overlayId;
      overlay.className = 'autocomplete-overlay';
      overlay.setAttribute('role', 'listbox');
      overlay.setAttribute('aria-label', 'הצעות');
      document.body.appendChild(overlay);
    }
    
    return overlay;
  }

  /**
   * Remove overlay element
   */
  function removeOverlay(input) {
    const overlayId = `autocomplete-overlay-${input.id || input.name || 'default'}`;
    const overlay = document.getElementById(overlayId);
    if (overlay) {
      overlay.remove();
    }
  }

  /**
   * Calculate overlay position relative to input
   */
  function calculatePosition(input, overlay) {
    const inputRect = input.getBoundingClientRect();
    const isRTL = document.documentElement.dir === 'rtl' || 
                  getComputedStyle(document.body).direction === 'rtl';
    
    // Temporarily show overlay to get dimensions
    const wasVisible = overlay.style.display !== 'none';
    if (!wasVisible) {
      overlay.style.display = 'block';
      overlay.style.visibility = 'hidden';
    }
    
    const overlayWidth = overlay.offsetWidth || inputRect.width;
    const overlayHeight = overlay.offsetHeight || 200;
    
    if (!wasVisible) {
      overlay.style.display = 'none';
      overlay.style.visibility = '';
    }
    
    // Position above input by default (for RTL layout, tags widget is at bottom of page)
    // Check if there's enough space above input
    const spaceAbove = inputRect.top;
    const spaceBelow = window.innerHeight - inputRect.bottom;
    
    let top, left;
    
    // If more space above than below, position above
    // Otherwise position below
    if (spaceAbove > spaceBelow && spaceAbove >= overlayHeight + 2) {
      // Position above input
      top = inputRect.top - overlayHeight - 2;
      if (top < 0) {
        top = 2;
      }
    } else {
      // Position below input
      top = inputRect.bottom + 2;
      // If overlay goes beyond viewport bottom, position above instead
      if (top + overlayHeight > window.innerHeight) {
        top = inputRect.top - overlayHeight - 2;
        if (top < 0) {
          top = 2;
        }
      }
    }
    
    left = inputRect.left;
    
    // Align with input width
    overlay.style.width = `${inputRect.width}px`;
    overlay.style.left = `${left}px`;
    overlay.style.top = `${top}px`;
    
    // RTL: text alignment
    overlay.style.direction = isRTL ? 'rtl' : 'ltr';
    overlay.style.textAlign = isRTL ? 'right' : 'left';
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Render suggestions in overlay
   */
  function renderSuggestions(overlay, suggestions, config, selectedIndex = -1) {
    if (!suggestions || suggestions.length === 0) {
      overlay.textContent = '';
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'autocomplete-empty';
      emptyDiv.textContent = 'אין הצעות';
      overlay.appendChild(emptyDiv);
      return;
    }

    const itemsHtml = suggestions.map((item, index) => {
      const isSelected = index === selectedIndex ? 'autocomplete-item-selected' : '';
      let content;
      
      if (config.itemRenderer && typeof config.itemRenderer === 'function') {
        // Custom renderer - assume it returns safe HTML (developer responsibility)
        content = config.itemRenderer(item, index);
      } else {
        // Default renderer - escape HTML
        const text = typeof item === 'string' 
          ? item 
          : (item.name || item.label || JSON.stringify(item));
        content = escapeHtml(String(text));
      }
      
      return `
        <div class="autocomplete-item ${isSelected}" 
             data-index="${index}" 
             role="option"
             aria-selected="${index === selectedIndex}">
          ${content}
        </div>
      `;
    }).join('');

    overlay.textContent = '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(itemsHtml, 'text/html');
    doc.body.childNodes.forEach(node => {
        overlay.appendChild(node.cloneNode(true));
    });
  }

  /**
   * Show overlay with suggestions
   */
  function showOverlay(input, suggestions, config, selectedIndex = -1) {
    const overlay = getOrCreateOverlay(input);
    const instance = instances.get(input);
    
    if (!instance) {
      return;
    }
    
    // Filter suggestions if filterFunction provided
    let filteredSuggestions = suggestions;
    if (config.filterFunction && typeof config.filterFunction === 'function') {
      filteredSuggestions = config.filterFunction(suggestions, input.value);
    }
    
    // Limit number of suggestions
    filteredSuggestions = filteredSuggestions.slice(0, config.maxSuggestions);
    
    // Render suggestions
    renderSuggestions(overlay, filteredSuggestions, config, selectedIndex);
    
    // Position overlay
    calculatePosition(input, overlay);
    
    // Show overlay
    overlay.style.display = 'block';
    overlay.style.zIndex = config.zIndex;
    overlay.setAttribute('aria-expanded', 'true');
    
    // Store current suggestions
    instance.currentSuggestions = filteredSuggestions;
    instance.selectedIndex = selectedIndex;
    
    // Attach click handlers
    attachItemHandlers(overlay, input, config, instance);
  }

  /**
   * Hide overlay
   */
  function hideOverlay(input) {
    const overlay = getOrCreateOverlay(input);
    overlay.style.display = 'none';
    overlay.setAttribute('aria-expanded', 'false');
    
    const instance = instances.get(input);
    if (instance) {
      instance.selectedIndex = -1;
    }
  }

  /**
   * Attach click handlers to items
   */
  function attachItemHandlers(overlay, input, config, instance) {
    const items = overlay.querySelectorAll('.autocomplete-item');
    
    items.forEach((item, index) => {
      item.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        const suggestion = instance.currentSuggestions[index];
        if (suggestion && config.onSelect) {
          config.onSelect(suggestion, index);
        }
        
        hideOverlay(input);
      });
      
      item.addEventListener('mouseenter', () => {
        // Update selected index on hover
        instance.selectedIndex = index;
        renderSuggestions(overlay, instance.currentSuggestions, config, index);
      });
    });
  }

  /**
   * Handle keyboard navigation
   */
  function handleKeyDown(event, input, config, instance) {
    const overlay = getOrCreateOverlay(input);
    const isVisible = overlay.style.display !== 'none';
    
    if (!isVisible || !instance.currentSuggestions || instance.currentSuggestions.length === 0) {
      return;
    }
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        instance.selectedIndex = Math.min(
          instance.selectedIndex + 1,
          instance.currentSuggestions.length - 1
        );
        renderSuggestions(overlay, instance.currentSuggestions, config, instance.selectedIndex);
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        instance.selectedIndex = Math.max(instance.selectedIndex - 1, -1);
        renderSuggestions(overlay, instance.currentSuggestions, config, instance.selectedIndex);
        break;
        
      case 'Enter':
        event.preventDefault();
        if (instance.selectedIndex >= 0 && instance.selectedIndex < instance.currentSuggestions.length) {
          const suggestion = instance.currentSuggestions[instance.selectedIndex];
          if (config.onSelect) {
            config.onSelect(suggestion, instance.selectedIndex);
          }
          hideOverlay(input);
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        hideOverlay(input);
        input.blur();
        break;
    }
  }

  /**
   * Fetch suggestions using fetchFunction
   */
  async function fetchSuggestions(input, config, instance) {
    if (!config.fetchFunction || typeof config.fetchFunction !== 'function') {
      window.Logger?.warn?.('AutocompleteService: No fetchFunction provided', { page: 'autocomplete-service' });
      return [];
    }
    
    try {
      instance.loading = true;
      
      // Show loading state
      const overlay = getOrCreateOverlay(input);
      overlay.textContent = '';
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'autocomplete-loading';
      loadingDiv.textContent = 'טוען...';
      overlay.appendChild(loadingDiv);
      overlay.style.display = 'block';
      calculatePosition(input, overlay);
      
      const query = input.value || '';
      const suggestions = await config.fetchFunction(query);
      
      instance.loading = false;
      
      // Check if still relevant (user might have typed more)
      if (input.value === query) {
        if (suggestions && suggestions.length > 0) {
          showOverlay(input, suggestions, config);
        } else {
          overlay.textContent = '';
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'autocomplete-empty';
      emptyDiv.textContent = 'אין הצעות';
      overlay.appendChild(emptyDiv);
        }
      }
    } catch (error) {
      instance.loading = false;
      window.Logger?.error?.('AutocompleteService: Error fetching suggestions', { error, page: 'autocomplete-service' });
      
      const overlay = getOrCreateOverlay(input);
      overlay.textContent = '';
      const errorDiv = document.createElement('div');
      errorDiv.className = 'autocomplete-error';
      errorDiv.textContent = 'שגיאה בטעינת הצעות';
      overlay.appendChild(errorDiv);
      
      if (window.NotificationSystem) {
        window.NotificationSystem.showError('שגיאה בטעינת הצעות. אנא נסה שוב.');
      }
    }
  }

  /**
   * Initialize autocomplete on input element
   */
  function init(inputElement, config = {}) {
    if (!inputElement || !(inputElement instanceof HTMLInputElement)) {
      window.Logger?.error?.('AutocompleteService: Invalid input element', { page: 'autocomplete-service' });
      return;
    }
    
    // Merge config with defaults
    const mergedConfig = {
      ...DEFAULT_CONFIG,
      ...config
    };
    
    // Validate required config
    if (!mergedConfig.fetchFunction || typeof mergedConfig.fetchFunction !== 'function') {
      window.Logger?.error?.('AutocompleteService: fetchFunction is required', { page: 'autocomplete-service' });
      return;
    }
    
    // Remove existing instance if any
    if (instances.has(inputElement)) {
      destroy(inputElement);
    }
    
    // Create instance
    const instance = {
      config: mergedConfig,
      debouncedFetch: null,
      currentSuggestions: [],
      selectedIndex: -1,
      loading: false,
      blurTimeout: null
    };
    
    // Create debounced fetch function
    instance.debouncedFetch = debounce((query) => {
      if (mergedConfig.minChars === 0 || query.length >= mergedConfig.minChars) {
        fetchSuggestions(inputElement, mergedConfig, instance);
      } else {
        hideOverlay(inputElement);
      }
    }, mergedConfig.debounceDelay);
    
    // Event handlers
    const handleInput = (event) => {
      const query = event.target.value || '';
      instance.debouncedFetch(query);
    };
    
    const handleFocus = () => {
      // Clear any pending blur timeout
      if (instance.blurTimeout) {
        clearTimeout(instance.blurTimeout);
        instance.blurTimeout = null;
      }
      
      // Show suggestions if there's a query or minChars is 0
      const query = inputElement.value || '';
      if (mergedConfig.minChars === 0 || query.length >= mergedConfig.minChars) {
        instance.debouncedFetch(query);
      }
    };
    
    const handleBlur = () => {
      // Delay hide to allow click on suggestions
      instance.blurTimeout = setTimeout(() => {
        hideOverlay(inputElement);
      }, 200);
    };
    
    const handleKeyDownWrapper = (event) => {
      handleKeyDown(event, inputElement, mergedConfig, instance);
    };
    
    // Click outside handler
    const handleClickOutside = (event) => {
      const overlay = getOrCreateOverlay(inputElement);
      if (
        !inputElement.contains(event.target) &&
        !overlay.contains(event.target)
      ) {
        hideOverlay(inputElement);
      }
    };
    
    // Attach event listeners
    inputElement.addEventListener('input', handleInput);
    inputElement.addEventListener('focus', handleFocus);
    inputElement.addEventListener('blur', handleBlur);
    inputElement.addEventListener('keydown', handleKeyDownWrapper);
    document.addEventListener('click', handleClickOutside);
    
    // Store handlers for cleanup
    instance.handlers = {
      input: handleInput,
      focus: handleFocus,
      blur: handleBlur,
      keydown: handleKeyDownWrapper,
      clickOutside: handleClickOutside
    };
    
    // Store instance
    instances.set(inputElement, instance);
    
    window.Logger?.info?.('AutocompleteService: Initialized', { 
      inputId: inputElement.id, 
      page: 'autocomplete-service' 
    });
  }

  /**
   * Destroy autocomplete instance
   */
  function destroy(inputElement) {
    if (!inputElement || !instances.has(inputElement)) {
      return;
    }
    
    const instance = instances.get(inputElement);
    
    // Remove event listeners
    if (instance.handlers) {
      inputElement.removeEventListener('input', instance.handlers.input);
      inputElement.removeEventListener('focus', instance.handlers.focus);
      inputElement.removeEventListener('blur', instance.handlers.blur);
      inputElement.removeEventListener('keydown', instance.handlers.keydown);
      document.removeEventListener('click', instance.handlers.clickOutside);
    }
    
    // Clear timeouts
    if (instance.blurTimeout) {
      clearTimeout(instance.blurTimeout);
    }
    if (instance.debouncedFetch) {
      // Debounced function cleanup is handled by timeout clearing
    }
    
    // Hide and remove overlay
    hideOverlay(inputElement);
    removeOverlay(inputElement);
    
    // Remove instance
    instances.delete(inputElement);
    
    window.Logger?.info?.('AutocompleteService: Destroyed', { 
      inputId: inputElement.id, 
      page: 'autocomplete-service' 
    });
  }

  /**
   * Show suggestions manually
   */
  function show(inputElement, suggestions) {
    if (!inputElement || !instances.has(inputElement)) {
      window.Logger?.warn?.('AutocompleteService: Cannot show - instance not found', { page: 'autocomplete-service' });
      return;
    }
    
    const instance = instances.get(inputElement);
    showOverlay(inputElement, suggestions, instance.config);
  }

  /**
   * Hide suggestions manually
   */
  function hide(inputElement) {
    if (!inputElement || !instances.has(inputElement)) {
      return;
    }
    
    hideOverlay(inputElement);
  }

  // Public API
  const AutocompleteService = {
    init,
    destroy,
    show,
    hide,
    version: '1.0.0'
  };

  // Export to global scope
  window.AutocompleteService = AutocompleteService;

  // Log successful load
  if (window.Logger) {
    window.Logger.debug('✅ Autocomplete Service loaded successfully', { 
      page: 'autocomplete-service', 
      version: '1.0.0' 
    });
  }
})();


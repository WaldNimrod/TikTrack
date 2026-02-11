/**
 * DOMPurify configuration for Rich-Text (SOP-012)
 * -----------------------------------------------
 * Allowlist per SOP_012_DOMPURIFY_ALLOWLIST.md
 * Tags: p, br, strong, em, u, a, ul, ol, li, span
 * span class: only phx-rt--* (success, warning, danger, highlight)
 * No style attribute; no event handlers
 */

import DOMPurify from 'dompurify';

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'span'];
const ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

/** Allow only class values starting with phx-rt-- */
const PHX_RT_PREFIX = 'phx-rt--';
const ALLOWED_SPAN_CLASSES = ['phx-rt--success', 'phx-rt--warning', 'phx-rt--danger', 'phx-rt--highlight'];

/** href: only http, https, mailto */
const SAFE_URI = /^(?:(?:https?|mailto):)/i;

/**
 * Sanitize HTML from Rich-Text editor for storage/display
 * @param {string} dirty - Raw HTML from editor
 * @returns {string} Sanitized HTML
 */
export function sanitizeRichTextHtml(dirty) {
  if (!dirty || typeof dirty !== 'string') return '';

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_ATTR: ['target', 'rel'],
    ALLOWED_URI_REGEXP: SAFE_URI,
    FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'form', 'input'],
    FORBID_ATTR: ['style', 'onerror', 'onload'],
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    hooks: {
      uponSanitizeAttribute: (node, data) => {
        if (data.attrName === 'class' && data.attrValue) {
          const allowed = data.attrValue.split(/\s+/).filter((c) =>
            c && (ALLOWED_SPAN_CLASSES.includes(c) || c.startsWith(PHX_RT_PREFIX))
          );
          data.attrValue = allowed.join(' ');
        }
        if (data.attrName === 'href' && data.attrValue && !SAFE_URI.test(data.attrValue)) {
          data.attrValue = '';
        }
      }
    }
  });
}

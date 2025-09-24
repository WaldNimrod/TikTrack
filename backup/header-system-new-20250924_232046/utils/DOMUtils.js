/**
 * DOM Utilities - Header System
 * כלי עזר לעבודה עם DOM
 * 
 * @version 1.0.0
 * @lastUpdated $(date)
 * @author TikTrack Development Team
 */

class DOMUtils {
  /**
   * בחירת אלמנט יחיד
   * @param {string} selector - סלקטור CSS
   * @param {Element} context - הקשר לחיפוש (אופציונלי)
   * @returns {Element|null} - האלמנט שנמצא או null
   */
  static select(selector, context = document) {
    try {
      return context.querySelector(selector);
    } catch (error) {
      console.error('❌ DOMUtils.select error:', error);
      return null;
    }
  }

  /**
   * בחירת מספר אלמנטים
   * @param {string} selector - סלקטור CSS
   * @param {Element} context - הקשר לחיפוש (אופציונלי)
   * @returns {NodeList} - רשימת אלמנטים
   */
  static selectAll(selector, context = document) {
    try {
      return context.querySelectorAll(selector);
    } catch (error) {
      console.error('❌ DOMUtils.selectAll error:', error);
      return [];
    }
  }

  /**
   * בדיקת קיום אלמנט
   * @param {string} selector - סלקטור CSS
   * @param {Element} context - הקשר לחיפוש (אופציונלי)
   * @returns {boolean} - האם האלמנט קיים
   */
  static exists(selector, context = document) {
    return this.select(selector, context) !== null;
  }

  /**
   * יצירת אלמנט חדש
   * @param {string} tagName - שם התג
   * @param {Object} attributes - תכונות האלמנט
   * @param {string} content - תוכן האלמנט
   * @returns {Element} - האלמנט החדש
   */
  static create(tagName, attributes = {}, content = '') {
    try {
      const element = document.createElement(tagName);
      
      // הוספת תכונות
      Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
          element.className = value;
        } else if (key === 'innerHTML') {
          element.innerHTML = value;
        } else {
          element.setAttribute(key, value);
        }
      });
      
      // הוספת תוכן
      if (content) {
        element.textContent = content;
      }
      
      return element;
    } catch (error) {
      console.error('❌ DOMUtils.create error:', error);
      return null;
    }
  }

  /**
   * הוספת אלמנט להורה
   * @param {Element} parent - אלמנט ההורה
   * @param {Element} child - אלמנט הילד
   * @param {string} position - מיקום ההוספה ('append', 'prepend', 'before', 'after')
   */
  static append(parent, child, position = 'append') {
    try {
      if (!parent || !child) return;
      
      switch (position) {
        case 'append':
          parent.appendChild(child);
          break;
        case 'prepend':
          parent.insertBefore(child, parent.firstChild);
          break;
        case 'before':
          parent.parentNode.insertBefore(child, parent);
          break;
        case 'after':
          parent.parentNode.insertBefore(child, parent.nextSibling);
          break;
      }
    } catch (error) {
      console.error('❌ DOMUtils.append error:', error);
    }
  }

  /**
   * הסרת אלמנט
   * @param {Element} element - האלמנט להסרה
   */
  static remove(element) {
    try {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    } catch (error) {
      console.error('❌ DOMUtils.remove error:', error);
    }
  }

  /**
   * הוספת מחלקה
   * @param {Element} element - האלמנט
   * @param {string} className - שם המחלקה
   */
  static addClass(element, className) {
    try {
      if (element && className) {
        element.classList.add(className);
      }
    } catch (error) {
      console.error('❌ DOMUtils.addClass error:', error);
    }
  }

  /**
   * הסרת מחלקה
   * @param {Element} element - האלמנט
   * @param {string} className - שם המחלקה
   */
  static removeClass(element, className) {
    try {
      if (element && className) {
        element.classList.remove(className);
      }
    } catch (error) {
      console.error('❌ DOMUtils.removeClass error:', error);
    }
  }

  /**
   * החלפת מחלקה
   * @param {Element} element - האלמנט
   * @param {string} oldClass - המחלקה הישנה
   * @param {string} newClass - המחלקה החדשה
   */
  static replaceClass(element, oldClass, newClass) {
    try {
      if (element) {
        this.removeClass(element, oldClass);
        this.addClass(element, newClass);
      }
    } catch (error) {
      console.error('❌ DOMUtils.replaceClass error:', error);
    }
  }

  /**
   * בדיקת קיום מחלקה
   * @param {Element} element - האלמנט
   * @param {string} className - שם המחלקה
   * @returns {boolean} - האם המחלקה קיימת
   */
  static hasClass(element, className) {
    try {
      return element && element.classList.contains(className);
    } catch (error) {
      console.error('❌ DOMUtils.hasClass error:', error);
      return false;
    }
  }

  /**
   * החלפת מחלקה (toggle)
   * @param {Element} element - האלמנט
   * @param {string} className - שם המחלקה
   */
  static toggleClass(element, className) {
    try {
      if (element && className) {
        element.classList.toggle(className);
      }
    } catch (error) {
      console.error('❌ DOMUtils.toggleClass error:', error);
    }
  }

  /**
   * הגדרת תכונה
   * @param {Element} element - האלמנט
   * @param {string} attribute - שם התכונה
   * @param {string} value - ערך התכונה
   */
  static setAttribute(element, attribute, value) {
    try {
      if (element && attribute) {
        element.setAttribute(attribute, value);
      }
    } catch (error) {
      console.error('❌ DOMUtils.setAttribute error:', error);
    }
  }

  /**
   * קבלת תכונה
   * @param {Element} element - האלמנט
   * @param {string} attribute - שם התכונה
   * @returns {string|null} - ערך התכונה או null
   */
  static getAttribute(element, attribute) {
    try {
      return element && attribute ? element.getAttribute(attribute) : null;
    } catch (error) {
      console.error('❌ DOMUtils.getAttribute error:', error);
      return null;
    }
  }

  /**
   * הסרת תכונה
   * @param {Element} element - האלמנט
   * @param {string} attribute - שם התכונה
   */
  static removeAttribute(element, attribute) {
    try {
      if (element && attribute) {
        element.removeAttribute(attribute);
      }
    } catch (error) {
      console.error('❌ DOMUtils.removeAttribute error:', error);
    }
  }

  /**
   * הגדרת תוכן טקסט
   * @param {Element} element - האלמנט
   * @param {string} text - הטקסט
   */
  static setText(element, text) {
    try {
      if (element) {
        element.textContent = text;
      }
    } catch (error) {
      console.error('❌ DOMUtils.setText error:', error);
    }
  }

  /**
   * קבלת תוכן טקסט
   * @param {Element} element - האלמנט
   * @returns {string} - הטקסט
   */
  static getText(element) {
    try {
      return element ? element.textContent : '';
    } catch (error) {
      console.error('❌ DOMUtils.getText error:', error);
      return '';
    }
  }

  /**
   * הגדרת תוכן HTML
   * @param {Element} element - האלמנט
   * @param {string} html - ה-HTML
   */
  static setHTML(element, html) {
    try {
      if (element) {
        element.innerHTML = html;
      }
    } catch (error) {
      console.error('❌ DOMUtils.setHTML error:', error);
    }
  }

  /**
   * קבלת תוכן HTML
   * @param {Element} element - האלמנט
   * @returns {string} - ה-HTML
   */
  static getHTML(element) {
    try {
      return element ? element.innerHTML : '';
    } catch (error) {
      console.error('❌ DOMUtils.getHTML error:', error);
      return '';
    }
  }

  /**
   * בדיקת נראות אלמנט
   * @param {Element} element - האלמנט
   * @returns {boolean} - האם האלמנט נראה
   */
  static isVisible(element) {
    try {
      if (!element) return false;
      
      const style = window.getComputedStyle(element);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             style.opacity !== '0';
    } catch (error) {
      console.error('❌ DOMUtils.isVisible error:', error);
      return false;
    }
  }

  /**
   * הסתרת אלמנט
   * @param {Element} element - האלמנט
   */
  static hide(element) {
    try {
      if (element) {
        element.style.display = 'none';
      }
    } catch (error) {
      console.error('❌ DOMUtils.hide error:', error);
    }
  }

  /**
   * הצגת אלמנט
   * @param {Element} element - האלמנט
   * @param {string} display - סוג התצוגה (ברירת מחדל: 'block')
   */
  static show(element, display = 'block') {
    try {
      if (element) {
        element.style.display = display;
      }
    } catch (error) {
      console.error('❌ DOMUtils.show error:', error);
    }
  }

  /**
   * החלפת נראות אלמנט
   * @param {Element} element - האלמנט
   * @param {string} display - סוג התצוגה (ברירת מחדל: 'block')
   */
  static toggleVisibility(element, display = 'block') {
    try {
      if (element) {
        if (this.isVisible(element)) {
          this.hide(element);
        } else {
          this.show(element, display);
        }
      }
    } catch (error) {
      console.error('❌ DOMUtils.toggleVisibility error:', error);
    }
  }

  /**
   * חיפוש אלמנטים לפי תכונה
   * @param {string} attribute - שם התכונה
   * @param {string} value - ערך התכונה
   * @param {Element} context - הקשר לחיפוש (אופציונלי)
   * @returns {NodeList} - רשימת אלמנטים
   */
  static findByAttribute(attribute, value, context = document) {
    try {
      return context.querySelectorAll(`[${attribute}="${value}"]`);
    } catch (error) {
      console.error('❌ DOMUtils.findByAttribute error:', error);
      return [];
    }
  }

  /**
   * חיפוש אלמנטים לפי מחלקה
   * @param {string} className - שם המחלקה
   * @param {Element} context - הקשר לחיפוש (אופציונלי)
   * @returns {NodeList} - רשימת אלמנטים
   */
  static findByClass(className, context = document) {
    try {
      return context.getElementsByClassName(className);
    } catch (error) {
      console.error('❌ DOMUtils.findByClass error:', error);
      return [];
    }
  }

  /**
   * חיפוש אלמנטים לפי תג
   * @param {string} tagName - שם התג
   * @param {Element} context - הקשר לחיפוש (אופציונלי)
   * @returns {NodeList} - רשימת אלמנטים
   */
  static findByTag(tagName, context = document) {
    try {
      return context.getElementsByTagName(tagName);
    } catch (error) {
      console.error('❌ DOMUtils.findByTag error:', error);
      return [];
    }
  }

  /**
   * בדיקת יחסי הורה-ילד
   * @param {Element} parent - אלמנט ההורה
   * @param {Element} child - אלמנט הילד
   * @returns {boolean} - האם הילד הוא צאצא של ההורה
   */
  static contains(parent, child) {
    try {
      return parent && child && parent.contains(child);
    } catch (error) {
      console.error('❌ DOMUtils.contains error:', error);
      return false;
    }
  }

  /**
   * קבלת אלמנט ההורה הקרוב
   * @param {Element} element - האלמנט
   * @param {string} selector - סלקטור CSS
   * @returns {Element|null} - אלמנט ההורה או null
   */
  static closest(element, selector) {
    try {
      return element ? element.closest(selector) : null;
    } catch (error) {
      console.error('❌ DOMUtils.closest error:', error);
      return null;
    }
  }

  /**
   * קבלת אלמנטים אחים
   * @param {Element} element - האלמנט
   * @param {string} selector - סלקטור CSS (אופציונלי)
   * @returns {Array} - רשימת אלמנטים אחים
   */
  static siblings(element, selector = null) {
    try {
      if (!element || !element.parentNode) return [];
      
      const siblings = Array.from(element.parentNode.children);
      const filtered = siblings.filter(sibling => sibling !== element);
      
      if (selector) {
        return filtered.filter(sibling => sibling.matches(selector));
      }
      
      return filtered;
    } catch (error) {
      console.error('❌ DOMUtils.siblings error:', error);
      return [];
    }
  }

  /**
   * בדיקת התאמה לסלקטור
   * @param {Element} element - האלמנט
   * @param {string} selector - סלקטור CSS
   * @returns {boolean} - האם האלמנט מתאים לסלקטור
   */
  static matches(element, selector) {
    try {
      return element ? element.matches(selector) : false;
    } catch (error) {
      console.error('❌ DOMUtils.matches error:', error);
      return false;
    }
  }
}

// ייצוא למטרות בדיקה
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DOMUtils;
}

// הוספה לזירה הגלובלית
if (typeof window !== 'undefined') {
  window.DOMUtils = DOMUtils;
}

console.log('✅ DOMUtils נוצר ופועל');

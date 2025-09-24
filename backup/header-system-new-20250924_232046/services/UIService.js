/**
 * UI Service - Header System
 * שירות ממשק משתמש מרכזי למערכת הכותרת
 * 
 * @version 1.0.0
 * @lastUpdated $(date)
 * @author TikTrack Development Team
 */

class UIService {
  constructor() {
    this.elements = new Map();
    this.animations = new Map();
    this.observers = new Map();
    this.config = HEADER_CONFIG.UI;
    this.isInitialized = false;
    
    // הגדרת לוגים
    this.setupLogging();
    
    // אתחול
    this.init();
  }

  /**
   * הגדרת מערכת לוגים
   */
  setupLogging() {
    this.log = {
      debug: (...args) => {
        if (HEADER_CONFIG.LOGGING.LEVEL === 'debug' && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.log('🔍 [UIService]', ...args);
        }
      },
      info: (...args) => {
        if (['debug', 'info'].includes(HEADER_CONFIG.LOGGING.LEVEL) && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.log('ℹ️ [UIService]', ...args);
        }
      },
      warn: (...args) => {
        if (['debug', 'info', 'warn'].includes(HEADER_CONFIG.LOGGING.LEVEL) && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.warn('⚠️ [UIService]', ...args);
        }
      },
      error: (...args) => {
        if (HEADER_CONFIG.LOGGING.CONSOLE) {
          console.error('❌ [UIService]', ...args);
        }
      }
    };
  }

  /**
   * אתחול השירות
   */
  async init() {
    try {
      this.log.info('מתחיל אתחול UIService...');
      
      // הגדרת observers
      this.setupObservers();
      
      // הגדרת event listeners
      this.setupEventListeners();
      
      // בדיקת תמיכה ב-RTL
      this.checkRTLSupport();
      
      // בדיקת תמיכה באנימציות
      this.checkAnimationSupport();
      
      this.isInitialized = true;
      this.log.info('UIService אותחל בהצלחה');
      
    } catch (error) {
      this.log.error('שגיאה באתחול UIService:', error);
      throw error;
    }
  }

  /**
   * הגדרת observers
   */
  setupObservers() {
    try {
      // ResizeObserver
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver((entries) => {
          entries.forEach(entry => {
            this.handleResize(entry);
          });
        });
      }

      // IntersectionObserver
      if (typeof IntersectionObserver !== 'undefined') {
        this.intersectionObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            this.handleIntersection(entry);
          });
        });
      }

      // MutationObserver
      if (typeof MutationObserver !== 'undefined') {
        this.mutationObserver = new MutationObserver((mutations) => {
          mutations.forEach(mutation => {
            this.handleMutation(mutation);
          });
        });
      }
      
      this.log.debug('Observers הוגדרו');
      
    } catch (error) {
      this.log.error('UIService.setupObservers error:', error);
    }
  }

  /**
   * הגדרת event listeners
   */
  setupEventListeners() {
    try {
      // אירועי חלון
      EventUtils.addListener(window, 'resize', () => {
        this.handleWindowResize();
      });

      EventUtils.addListener(window, 'orientationchange', () => {
        this.handleOrientationChange();
      });

      // אירועי מקלדת
      EventUtils.addListener(document, 'keydown', (event) => {
        this.handleKeyDown(event);
      });

      // אירועי עכבר
      EventUtils.addListener(document, 'mousemove', (event) => {
        this.handleMouseMove(event);
      });

      EventUtils.addListener(document, 'click', (event) => {
        this.handleClick(event);
      });
      
      this.log.debug('Event listeners הוגדרו');
      
    } catch (error) {
      this.log.error('UIService.setupEventListeners error:', error);
    }
  }

  /**
   * בדיקת תמיכה ב-RTL
   */
  checkRTLSupport() {
    try {
      const htmlElement = document.documentElement;
      const isRTL = htmlElement.dir === 'rtl' || htmlElement.getAttribute('dir') === 'rtl';
      
      this.config.RTL_SUPPORT = isRTL;
      this.log.debug(`תמיכה ב-RTL: ${isRTL}`);
      
    } catch (error) {
      this.log.error('UIService.checkRTLSupport error:', error);
    }
  }

  /**
   * בדיקת תמיכה באנימציות
   */
  checkAnimationSupport() {
    try {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (prefersReducedMotion) {
        this.config.ANIMATIONS = false;
        this.config.REDUCED_MOTION = true;
      }
      
      this.log.debug(`תמיכה באנימציות: ${this.config.ANIMATIONS}`);
      
    } catch (error) {
      this.log.error('UIService.checkAnimationSupport error:', error);
    }
  }

  /**
   * עדכון אלמנט
   * @param {string} selector - סלקטור האלמנט
   * @param {Object} updates - עדכונים
   * @param {Object} options - אפשרויות נוספות
   */
  updateElement(selector, updates, options = {}) {
    try {
      const element = DOMUtils.select(selector);
      if (!element) {
        this.log.warn(`UIService.updateElement: Element not found: ${selector}`);
        return false;
      }

      const {
        text = null,
        html = null,
        classes = null,
        attributes = null,
        styles = null,
        animation = null
      } = updates;

      // עדכון טקסט
      if (text !== null) {
        DOMUtils.setText(element, text);
      }

      // עדכון HTML
      if (html !== null) {
        DOMUtils.setHTML(element, html);
      }

      // עדכון מחלקות
      if (classes) {
        if (classes.add) {
          classes.add.forEach(className => DOMUtils.addClass(element, className));
        }
        if (classes.remove) {
          classes.remove.forEach(className => DOMUtils.removeClass(element, className));
        }
        if (classes.toggle) {
          classes.toggle.forEach(className => DOMUtils.toggleClass(element, className));
        }
      }

      // עדכון תכונות
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          DOMUtils.setAttribute(element, key, value);
        });
      }

      // עדכון סגנונות
      if (styles) {
        Object.entries(styles).forEach(([property, value]) => {
          element.style[property] = value;
        });
      }

      // אנימציה
      if (animation && this.config.ANIMATIONS) {
        this.animateElement(element, animation, options);
      }

      this.log.debug(`אלמנט עודכן: ${selector}`, updates);
      return true;
      
    } catch (error) {
      this.log.error('UIService.updateElement error:', error);
      return false;
    }
  }

  /**
   * אנימציה של אלמנט
   * @param {Element} element - האלמנט
   * @param {Object} animation - הגדרות האנימציה
   * @param {Object} options - אפשרויות נוספות
   */
  animateElement(element, animation, options = {}) {
    try {
      if (!this.config.ANIMATIONS) return;

      const {
        type = 'fadeIn',
        duration = this.config.ANIMATION_DURATION,
        easing = 'ease-in-out',
        delay = 0,
        onComplete = null
      } = animation;

      const animationId = this.generateAnimationId();
      
      const animationObj = {
        id: animationId,
        element,
        type,
        duration,
        easing,
        delay,
        onComplete,
        startTime: Date.now() + delay,
        isComplete: false
      };

      this.animations.set(animationId, animationObj);

      // הפעלת האנימציה
      setTimeout(() => {
        this.executeAnimation(animationObj);
      }, delay);

      return animationId;
      
    } catch (error) {
      this.log.error('UIService.animateElement error:', error);
      return null;
    }
  }

  /**
   * ביצוע אנימציה
   * @param {Object} animationObj - אובייקט האנימציה
   */
  executeAnimation(animationObj) {
    try {
      const { element, type, duration, easing, onComplete } = animationObj;

      // הגדרת CSS transition
      element.style.transition = `all ${duration}ms ${easing}`;

      // ביצוע האנימציה לפי סוג
      switch (type) {
        case 'fadeIn':
          element.style.opacity = '0';
          element.style.display = 'block';
          requestAnimationFrame(() => {
            element.style.opacity = '1';
          });
          break;

        case 'fadeOut':
          element.style.opacity = '1';
          requestAnimationFrame(() => {
            element.style.opacity = '0';
          });
          break;

        case 'slideIn':
          element.style.transform = 'translateY(-100%)';
          element.style.display = 'block';
          requestAnimationFrame(() => {
            element.style.transform = 'translateY(0)';
          });
          break;

        case 'slideOut':
          element.style.transform = 'translateY(0)';
          requestAnimationFrame(() => {
            element.style.transform = 'translateY(-100%)';
          });
          break;

        case 'scaleIn':
          element.style.transform = 'scale(0)';
          element.style.display = 'block';
          requestAnimationFrame(() => {
            element.style.transform = 'scale(1)';
          });
          break;

        case 'scaleOut':
          element.style.transform = 'scale(1)';
          requestAnimationFrame(() => {
            element.style.transform = 'scale(0)';
          });
          break;

        default:
          this.log.warn(`Unknown animation type: ${type}`);
          return;
      }

      // סיום האנימציה
      setTimeout(() => {
        this.completeAnimation(animationObj);
      }, duration);
      
    } catch (error) {
      this.log.error('UIService.executeAnimation error:', error);
    }
  }

  /**
   * השלמת אנימציה
   * @param {Object} animationObj - אובייקט האנימציה
   */
  completeAnimation(animationObj) {
    try {
      const { id, element, onComplete } = animationObj;

      // ניקוי CSS transition
      element.style.transition = '';

      // קריאה לפונקציית השלמה
      if (onComplete && typeof onComplete === 'function') {
        onComplete(element);
      }

      // סימון כמושלם
      animationObj.isComplete = true;

      // הסרה מהרשימה
      this.animations.delete(id);
      
    } catch (error) {
      this.log.error('UIService.completeAnimation error:', error);
    }
  }

  /**
   * ביטול אנימציה
   * @param {string} animationId - מזהה האנימציה
   */
  cancelAnimation(animationId) {
    try {
      if (this.animations.has(animationId)) {
        const animationObj = this.animations.get(animationId);
        
        // ניקוי CSS transition
        animationObj.element.style.transition = '';
        
        // הסרה מהרשימה
        this.animations.delete(animationId);
        
        this.log.debug(`אנימציה בוטלה: ${animationId}`);
      }
      
    } catch (error) {
      this.log.error('UIService.cancelAnimation error:', error);
    }
  }

  /**
   * ביטול כל האנימציות
   */
  cancelAllAnimations() {
    try {
      this.animations.forEach((animationObj, id) => {
        this.cancelAnimation(id);
      });
      
      this.log.debug('כל האנימציות בוטלו');
      
    } catch (error) {
      this.log.error('UIService.cancelAllAnimations error:', error);
    }
  }

  /**
   * הצגת אלמנט
   * @param {string} selector - סלקטור האלמנט
   * @param {Object} options - אפשרויות נוספות
   */
  showElement(selector, options = {}) {
    try {
      const element = DOMUtils.select(selector);
      if (!element) return false;

      const { animation = null, display = 'block' } = options;

      if (animation && this.config.ANIMATIONS) {
        this.animateElement(element, { ...animation, type: 'fadeIn' });
      } else {
        DOMUtils.show(element, display);
      }

      this.log.debug(`אלמנט הוצג: ${selector}`);
      return true;
      
    } catch (error) {
      this.log.error('UIService.showElement error:', error);
      return false;
    }
  }

  /**
   * הסתרת אלמנט
   * @param {string} selector - סלקטור האלמנט
   * @param {Object} options - אפשרויות נוספות
   */
  hideElement(selector, options = {}) {
    try {
      const element = DOMUtils.select(selector);
      if (!element) return false;

      const { animation = null } = options;

      if (animation && this.config.ANIMATIONS) {
        this.animateElement(element, {
          ...animation,
          type: 'fadeOut',
          onComplete: () => {
            DOMUtils.hide(element);
            if (animation.onComplete) {
              animation.onComplete(element);
            }
          }
        });
      } else {
        DOMUtils.hide(element);
      }

      this.log.debug(`אלמנט הוסתר: ${selector}`);
      return true;
      
    } catch (error) {
      this.log.error('UIService.hideElement error:', error);
      return false;
    }
  }

  /**
   * החלפת נראות אלמנט
   * @param {string} selector - סלקטור האלמנט
   * @param {Object} options - אפשרויות נוספות
   */
  toggleElement(selector, options = {}) {
    try {
      const element = DOMUtils.select(selector);
      if (!element) return false;

      if (DOMUtils.isVisible(element)) {
        this.hideElement(selector, options);
      } else {
        this.showElement(selector, options);
      }

      return true;
      
    } catch (error) {
      this.log.error('UIService.toggleElement error:', error);
      return false;
    }
  }

  /**
   * טיפול בשינוי גודל חלון
   */
  handleWindowResize() {
    try {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // עדכון נקודות שבירה
      this.updateBreakpoints(width);

      // הודעת מאזינים
      EventUtils.dispatchGlobalEvent(HEADER_EVENTS.UI_RESIZE, {
        width,
        height,
        isMobile: width <= this.config.MOBILE_BREAKPOINT,
        isTablet: width <= this.config.TABLET_BREAKPOINT && width > this.config.MOBILE_BREAKPOINT,
        isDesktop: width > this.config.TABLET_BREAKPOINT
      });
      
    } catch (error) {
      this.log.error('UIService.handleWindowResize error:', error);
    }
  }

  /**
   * עדכון נקודות שבירה
   * @param {number} width - רוחב החלון
   */
  updateBreakpoints(width) {
    try {
      const isMobile = width <= this.config.MOBILE_BREAKPOINT;
      const isTablet = width <= this.config.TABLET_BREAKPOINT && width > this.config.MOBILE_BREAKPOINT;
      const isDesktop = width > this.config.TABLET_BREAKPOINT;

      // עדכון מחלקות CSS
      document.body.classList.toggle('mobile', isMobile);
      document.body.classList.toggle('tablet', isTablet);
      document.body.classList.toggle('desktop', isDesktop);
      
    } catch (error) {
      this.log.error('UIService.updateBreakpoints error:', error);
    }
  }

  /**
   * טיפול בשינוי כיוון
   */
  handleOrientationChange() {
    try {
      // המתן לסיום האנימציה
      setTimeout(() => {
        this.handleWindowResize();
      }, 100);
      
    } catch (error) {
      this.log.error('UIService.handleOrientationChange error:', error);
    }
  }

  /**
   * טיפול בלחיצת מקש
   * @param {KeyboardEvent} event - אירוע המקלדת
   */
  handleKeyDown(event) {
    try {
      // הודעת מאזינים
      EventUtils.dispatchGlobalEvent('ui:keydown', {
        key: event.key,
        code: event.code,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey
      });
      
    } catch (error) {
      this.log.error('UIService.handleKeyDown error:', error);
    }
  }

  /**
   * טיפול בתנועת עכבר
   * @param {MouseEvent} event - אירוע העכבר
   */
  handleMouseMove(event) {
    try {
      // הודעת מאזינים
      EventUtils.dispatchGlobalEvent('ui:mousemove', {
        x: event.clientX,
        y: event.clientY,
        target: event.target
      });
      
    } catch (error) {
      this.log.error('UIService.handleMouseMove error:', error);
    }
  }

  /**
   * טיפול בלחיצה
   * @param {MouseEvent} event - אירוע העכבר
   */
  handleClick(event) {
    try {
      // הודעת מאזינים
      EventUtils.dispatchGlobalEvent('ui:click', {
        x: event.clientX,
        y: event.clientY,
        target: event.target,
        button: event.button
      });
      
    } catch (error) {
      this.log.error('UIService.handleClick error:', error);
    }
  }

  /**
   * טיפול בשינוי גודל
   * @param {ResizeObserverEntry} entry - רשומת השינוי
   */
  handleResize(entry) {
    try {
      const { target, contentRect } = entry;
      
      // הודעת מאזינים
      EventUtils.dispatchGlobalEvent('ui:resize', {
        element: target,
        width: contentRect.width,
        height: contentRect.height
      });
      
    } catch (error) {
      this.log.error('UIService.handleResize error:', error);
    }
  }

  /**
   * טיפול בהצטלבות
   * @param {IntersectionObserverEntry} entry - רשומת ההצטלבות
   */
  handleIntersection(entry) {
    try {
      const { target, isIntersecting, intersectionRatio } = entry;
      
      // הודעת מאזינים
      EventUtils.dispatchGlobalEvent('ui:intersection', {
        element: target,
        isIntersecting,
        intersectionRatio
      });
      
    } catch (error) {
      this.log.error('UIService.handleIntersection error:', error);
    }
  }

  /**
   * טיפול במוטציה
   * @param {MutationRecord} mutation - רשומת המוטציה
   */
  handleMutation(mutation) {
    try {
      const { target, type, addedNodes, removedNodes } = mutation;
      
      // הודעת מאזינים
      EventUtils.dispatchGlobalEvent('ui:mutation', {
        element: target,
        type,
        addedNodes,
        removedNodes
      });
      
    } catch (error) {
      this.log.error('UIService.handleMutation error:', error);
    }
  }

  /**
   * יצירת מזהה אנימציה ייחודי
   * @returns {string} - מזהה ייחודי
   */
  generateAnimationId() {
    return `animation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * הרס השירות
   */
  destroy() {
    try {
      this.log.info('משמיד UIService...');
      
      // ביטול כל האנימציות
      this.cancelAllAnimations();
      
      // ניקוי observers
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      if (this.intersectionObserver) {
        this.intersectionObserver.disconnect();
      }
      if (this.mutationObserver) {
        this.mutationObserver.disconnect();
      }
      
      // ניקוי מצב
      this.elements.clear();
      this.animations.clear();
      this.observers.clear();
      
      this.isInitialized = false;
      this.log.info('UIService הושמד');
      
    } catch (error) {
      this.log.error('UIService.destroy error:', error);
    }
  }

  /**
   * קבלת מידע על השירות
   * @returns {Object} - מידע על השירות
   */
  getInfo() {
    return {
      isInitialized: this.isInitialized,
      elementsCount: this.elements.size,
      animationsCount: this.animations.size,
      observersCount: this.observers.size,
      config: this.config
    };
  }
}

// ייצוא למטרות בדיקה
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIService;
}

// הוספה לזירה הגלובלית
if (typeof window !== 'undefined') {
  window.UIService = UIService;
}

console.log('✅ UIService נוצר ופועל');

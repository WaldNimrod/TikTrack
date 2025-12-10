/**
 * Designs Animations Demo - Floating UI + GSAP Examples
 * =====================================================
 * 
 * דוגמאות חיות של אנימציות Floating UI + GSAP לעמוד עיצובים
 * 
 * Documentation: See documentation/03-DEVELOPMENT/GUIDES/UNIFIED_UI_POSITIONING_GUIDE.md
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - initAnimationsDemo() - Initanimationsdemo

;(function() {
  'use strict';

  /**
   * Initialize animations demo
   */
  function initAnimationsDemo() {
    // Setup overlay hover for positioning demo
    const positioningList = document.getElementById('positioningDemoList');
    if (positioningList && window.WidgetOverlayService) {
      window.WidgetOverlayService.setupOverlayHover(
        positioningList,
        'li[data-widget-overlay="true"]',
        '.widget-details-container',
        {
          hoverClass: 'is-hovered',
          gap: 8,
          minWidth: 280,
          maxWidth: 400,
          zIndex: 1050,
          useAnimations: true,
          transitionDuration: 200
        }
      );
    }

    // Setup overlay hover for combined demo
    const combinedList = document.getElementById('combinedDemoList');
    if (combinedList && window.WidgetOverlayService) {
      window.WidgetOverlayService.setupOverlayHover(
        combinedList,
        'li[data-widget-overlay="true"]',
        '.widget-details-container',
        {
          hoverClass: 'is-hovered',
          gap: 8,
          minWidth: 280,
          maxWidth: 400,
          zIndex: 1050,
          useAnimations: true,
          transitionDuration: 200
        }
      );
    }
  }

  /**
   * Demo: Fade In animation
   */
  window.demoFadeIn = function() {
    const element = document.getElementById('fadeDemo');
    if (!element) return;

    element.style.display = 'block';
    
    if (window.UnifiedUIPositioning && window.UnifiedUIPositioning.isGSAPAvailable()) {
      // Use GSAP
      window.gsap.fromTo(element, 
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    } else {
      // Fallback to CSS transition
      element.style.transition = 'opacity 0.3s ease-in-out';
      setTimeout(() => {
        element.style.opacity = '1';
      }, 10);
    }
  };

  /**
   * Demo: Fade Out animation
   */
  window.demoFadeOut = function() {
    const element = document.getElementById('fadeDemo');
    if (!element) return;

    if (window.UnifiedUIPositioning && window.UnifiedUIPositioning.isGSAPAvailable()) {
      // Use GSAP
      window.gsap.to(element, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          element.style.display = 'none';
        }
      });
    } else {
      // Fallback to CSS transition
      element.style.transition = 'opacity 0.3s ease-in-out';
      element.style.opacity = '0';
      setTimeout(() => {
        element.style.display = 'none';
      }, 300);
    }
  };

  /**
   * Demo: Slide In animation
   */
  window.demoSlideIn = function() {
    const element = document.getElementById('slideDemo');
    if (!element) return;

    element.style.display = 'block';
    
    if (window.UnifiedUIPositioning && window.UnifiedUIPositioning.isGSAPAvailable()) {
      // Use GSAP
      window.gsap.fromTo(element, 
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    } else {
      // Fallback to CSS transition
      element.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 10);
    }
  };

  /**
   * Demo: Slide Out animation
   */
  window.demoSlideOut = function() {
    const element = document.getElementById('slideDemo');
    if (!element) return;

    if (window.UnifiedUIPositioning && window.UnifiedUIPositioning.isGSAPAvailable()) {
      // Use GSAP
      window.gsap.to(element, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          element.style.display = 'none';
        }
      });
    } else {
      // Fallback to CSS transition
      element.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
      element.style.opacity = '0';
      element.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        element.style.display = 'none';
      }, 300);
    }
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimationsDemo);
  } else {
    initAnimationsDemo();
  }

})();



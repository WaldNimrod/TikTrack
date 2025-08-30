/**
 * Active Alerts Component (Light DOM)
 * קומפוננטה להצגת התראות פעילות שמשתמשת בסגנונות הכלליים של האתר
 * שימוש: <active-alerts></active-alerts>
 * 
 * Dependencies:
 * - main.js (global utilities and alert functions)
 * - translation-utils.js (translation functions)
 * - alerts.js (formatAlertCondition and parseAlertCondition functions)
 * 
 * File: trading-ui/scripts/active-alerts-component.js
 * Version: 1.9.9
 * Last Updated: August 26, 2025
 * 
 * Features:
 * - מציג איקון פעמון עם מספר אדום בכותרת הסקשן כשיש התראות חדשות
 * - עובד גם בסקשן סגור
 * - עדכון אוטומטי של האיקון כשהתראות משתנות
 * - תצוגת כרטיסיות התראות עם פרטים מלאים
 * - רקע צבעוני לפי סוג האובייקט המקושר (לא לפי סוג ההתראה)
 * - כרטיסיית תנאי עם עיצוב מיוחד לפני המחיר
 * - איקונים לפי סוג האובייקט המקושר (🏦📈📋📊)
 * - מקרא צבעים חמוד מתחת להתראות
 * - סגירה אוטומטית של הסקשן כשאין התראות
 * - פתיחה אוטומטית של הסקשן כשיש התראות
 * - מיון התראות לפי זמן (חדשות קודם)
 * - לחיצה על כותרת הסימבול פותחת דף טיקר (בפיתוח)
 * - לחיצה על אובייקט מקושר פותחת מודל (בפיתוח)
 * - תמיכה במבנה מורכב של תנאים: variable | operator | value
 * - תמיכה בערכים פשוטים: price_target, stop_loss, וכו'
 * 
 * Color Scheme by Related Object Type:
 * - 💰 חשבון (type=1): צבע טורקיז #29a6a8 / #1f8a8c
 * - 📈 טרייד (type=2): צבע ירוק #28a745 / #1e7e34  
 * - 📋 תוכנית טרייד (type=3): צבע כתום #ff9500 / #e67e00
 * - 📊 טיקר (type=4): צבע אדום #dc3545 / #c82333
 * 
 * Database Constraints:
 * - שדה condition מוגבל לאילוץ CHECK
 * - מבנה מורכב: variable | operator | value
 * - ערכים פשוטים: above, below, price_target, stop_loss, וכו'
 * 
 * Related Object Display Format:
 * - טרייד: "🔗 טרייד | סווינג | Long | 24.3.25"
 * - תוכנית: "🔗 תוכנית | השקעה | Short | 24.3.25"
 * - חשבון: "🔗 חשבון מעודכן (USD)"
 * - טיקר: "🔗 טיקר: AAPL"
 * 
 * Styling Features:
 * - רקע שקוף 10% (0.1) לפי סוג האובייקט
 * - קו שמאלי צבעוני 4px
 * - כותרת בצבע מתאים לרקע
 * - כרטיסיית תנאי עם רקע לבן שקוף
 * - מקרא צבעים ללא כותרת וללא איקונים
 * - grid layout עם minmax(350px, 1fr)
 * - רווח פנימי 20px לאיקון ההתראות
 * - קישורים בצבע ירוק טורקיז #29a6a8
 */

class ActiveAlertsComponent extends HTMLElement {
  constructor() {
    super();
    this.alerts = [];
    this.isLoading = false;
    this._checkAttempts = 0;
    this._functionsChecked = false;
    this._checkTimeout = null;
    this._sectionHeader = null;
    this._alertIcon = null;
  }

  connectedCallback() {
    this.render();
    this.checkGlobalFunctions();
    this.loadActiveAlerts();
    this.setupSectionHeaderAlertIcon();

    // עדכון איקון ההתראות כל 5 שניות
    this._alertIconInterval = setInterval(() => {
      if (this.isConnected) {
        this.updateSectionHeaderAlertIcon();
      }
    }, 5000);

    // האזנה לשינויים במצב הסקשן
    this.setupSectionToggleListener();

    // בדיקה שהסגנונות נטענו
    this.checkStylesLoaded();

    // ניקוי הודעות קונסולה ישנות אחרי 10 שניות (רק אם יש הרבה הודעות)
    setTimeout(() => {
      // בדיקה אם יש הרבה הודעות בקונסולה
      if (this._checkAttempts > 3) {
      
        if (console.clear) {
          console.clear();
        }
      }
    }, 10000);
  }

  disconnectedCallback() {
    // ניקוי timeout אם הקומפוננטה מוסרת
    if (this._checkTimeout) {
      clearTimeout(this._checkTimeout);
      this._checkTimeout = null;
    }

    // ניקוי interval אם הקומפוננטה מוסרת
    if (this._alertIconInterval) {
      clearInterval(this._alertIconInterval);
      this._alertIconInterval = null;
    }

    // הסרת איקון ההתראות מהכותרת
    this.removeSectionHeaderAlertIcon();
  }

  render() {
  

    this.innerHTML = `
      <div class="alerts-container">
        <div class="alerts-header" style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4px;">
          <h3 id="alertsTitle">🔔 התראות פעילות</h3>
          
          <!-- מפתח צבעים בכותרת מצד שמאל -->
          <div class="alerts-color-legend-header" style="display: flex; gap: 8px; align-items: center; margin-bottom: 0px;">
            <div class="legend-item">
              <div class="legend-color" style="background-color: rgba(220, 53, 69, 0.1); border-left: 4px solid #c82333; padding: 4px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 6px; min-width: 80px;">
                <img src="images/icons/tickers.svg" alt="טיקר" style="width: 14px; height: 14px;">
                <span style="color: #c82333; font-size: 0.8rem; font-weight: 500;">טיקר</span>
              </div>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: rgba(255, 149, 0, 0.1); border-left: 4px solid #e67e00; padding: 4px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 6px; min-width: 80px;">
                <img src="images/icons/trade_plans.svg" alt="תוכנית" style="width: 14px; height: 14px;">
                <span style="color: #e67e00; font-size: 0.8rem; font-weight: 500;">תוכנית</span>
              </div>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: rgba(40, 167, 69, 0.1); border-left: 4px solid #1e7e34; padding: 4px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 6px; min-width: 80px;">
                <img src="images/icons/trades.svg" alt="טרייד" style="width: 14px; height: 14px;">
                <span style="color: #1e7e34; font-size: 0.8rem; font-weight: 500;">טרייד</span>
              </div>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: rgba(41, 166, 168, 0.1); border-left: 4px solid #1f8a8c; padding: 4px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 6px; min-width: 80px;">
                <img src="images/icons/accounts.svg" alt="חשבון" style="width: 14px; height: 14px;">
                <span style="color: #1f8a8c; font-size: 0.8rem; font-weight: 500;">חשבון</span>
              </div>
            </div>
          </div>
        </div>
        
        <div id="alertsCards" class="alerts-cards-container">
          <!-- התראות יוצגו כאן -->
        </div>
      </div>
    `;

  
    this.loadActiveAlerts();
  }

  /**
   * בדיקת זמינות פונקציות גלובליות
   */
  checkGlobalFunctions() {
    // בדיקה אם כבר בדקנו ופונקציות זמינות
    if (this._functionsChecked) {
      return;
    }

    console.log('🔍 === CHECKING GLOBAL FUNCTIONS (ACTIVE ALERTS COMPONENT) ===');
    console.log('🔍 formatAlertCondition available:', typeof window.formatAlertCondition);
    console.log('🔍 parseAlertCondition available:', typeof window.parseAlertCondition);
    console.log('🔍 BUTTON_ICONS available:', typeof window.BUTTON_ICONS);
    console.log('🔍 BUTTON_TEXTS available:', typeof window.BUTTON_TEXTS);

    // בדיקה אם שתי הפונקציות זמינות
    if (window.formatAlertCondition && window.parseAlertCondition) {
      console.log('✅ All global functions are available');
      this._functionsChecked = true;
      // ניקוי timeout אם יש אחד פעיל
      if (this._checkTimeout) {
        clearTimeout(this._checkTimeout);
        this._checkTimeout = null;
      }
      return;
    }

    // אם הפונקציות לא זמינות, ננסה שוב רק אם לא ניסינו יותר מדי פעמים
    if (!this._checkAttempts) {
      this._checkAttempts = 0;
    }

    if (this._checkAttempts < 5) { // מקסימום 5 ניסיונות
      this._checkAttempts++;
      console.warn(`⚠️ Global functions not available (attempt ${this._checkAttempts}/5) - retrying in 2 seconds`);
      this._checkTimeout = setTimeout(() => {
        // בדיקה אם הקומפוננטה עדיין מחוברת
        if (this.isConnected) {
          this.checkGlobalFunctions();
        }
      }, 2000);
    } else {
      console.warn('⚠️ Global functions not available after 5 attempts - using local versions');
      this._functionsChecked = true;
      // ניקוי timeout אם יש אחד פעיל
      if (this._checkTimeout) {
        clearTimeout(this._checkTimeout);
        this._checkTimeout = null;
      }
    }
  }

  async loadActiveAlerts() {
    console.log('🔄 Loading active alerts...');

    if (this.isLoading) {
      console.log('🔄 Already loading, skipping...');
      return;
    }

    this.isLoading = true;
    try {
      const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
      console.log('🔄 Fetching from:', `${base}/api/v1/alerts/unread`);

      const response = await fetch(`${base}/api/v1/alerts/unread`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const apiData = await response.json();
      console.log('🔄 API response:', apiData);

      this.alerts = (apiData && apiData.status === 'success' && Array.isArray(apiData.data)) ? apiData.data : [];
      console.log('🔄 Parsed alerts:', this.alerts);
      console.log('🔄 Alerts length after parsing:', this.alerts.length);

      this.renderAlerts();
      console.log('🔄 After renderAlerts, alerts length:', this.alerts.length);
      this.updateCount(); // עדכון הכותרת והסקשן
      this.updateSectionHeaderAlertIcon(); // עדכון איקון ההתראות בכותרת הסקשן
    } catch (err) {
      console.error('❌ Failed loading active alerts:', err);
      this.alerts = [];
      this.renderAlerts();
      this.updateCount(); // עדכון הכותרת והסקשן
      this.updateSectionHeaderAlertIcon(); // עדכון איקון ההתראות בכותרת הסקשן
    } finally {
      this.isLoading = false;
    }
  }

  updateCount() {
    console.log('🔄 updateCount called, alerts length:', this.alerts.length);

    const titleEl = this.querySelector('#alertsTitle');
    const cardsContainer = this.querySelector('#alertsCards');
    const legendHeader = this.querySelector('.alerts-color-legend-header');

    if (titleEl) {
      if (this.alerts.length === 0) {
        console.log('🔄 No alerts, updating title to empty state');
        titleEl.innerHTML = '🔕 אין התראות חדשות';
        titleEl.style.opacity = '0.5';
        titleEl.style.fontSize = '0.9rem'; // הקטנת הכותרת
        titleEl.style.fontWeight = 'normal'; // הקטנת המשקל
        // סגירת הסקשן כשאין התראות
        this.closeSectionIfNoAlerts();
      } else {
        console.log('🔄 Has alerts, updating title with count');
        // החלפת האיקון הקיים באיקון עם מספר
        titleEl.innerHTML = this.createTitleWithIcon();
        titleEl.style.opacity = '1';
        titleEl.style.fontSize = ''; // חזרה לגודל רגיל
        titleEl.style.fontWeight = ''; // חזרה למשקל רגיל
        // פתיחת הסקשן כשיש התראות
        this.openSectionIfHasAlerts();
      }
    }

    // הסתרת/הצגת מפתח הצבעים
    if (legendHeader) {
      if (this.alerts.length === 0) {
        console.log('🔄 Hiding color legend');
        legendHeader.style.display = 'none';
      } else {
        console.log('🔄 Showing color legend');
        legendHeader.style.display = 'flex';
      }
    }

    // הסתרת/הצגת מיכל הכרטיסיות
    if (cardsContainer) {
      if (this.alerts.length === 0) {
        console.log('🔄 Hiding cards container');
        cardsContainer.style.display = 'none';
      } else {
        console.log('🔄 Showing cards container');
        cardsContainer.style.display = 'grid';
      }
    }
  }

  /**
   * סגירת הסקשן כשאין התראות
   */
  closeSectionIfNoAlerts() {
    console.log('🔄 closeSectionIfNoAlerts called');
    let currentElement = this;
    while (currentElement && currentElement !== document.body) {
      const parentSection = currentElement.closest('.top-section, .content-section, .section-container');
      if (parentSection) {
        console.log('🔄 Found parent section:', parentSection);
        const toggleBtn = parentSection.querySelector('.filter-toggle-btn, .top-toggle-btn, [onclick*="toggle"]');
        if (toggleBtn) {
          console.log('🔄 Found toggle button:', toggleBtn);
          const sectionBody = parentSection.querySelector('.section-body');
          if (sectionBody && sectionBody.style.display !== 'none') {
            console.log('🔄 Closing section');
            // סגירת הסקשן
            toggleBtn.click();
          } else {
            console.log('🔄 Section already closed or no section body found');
          }
        } else {
          console.log('🔄 No toggle button found');
        }
        break;
      }
      currentElement = currentElement.parentElement;
    }
  }

  /**
   * פתיחת הסקשן כשיש התראות
   */
  openSectionIfHasAlerts() {
    console.log('🔄 openSectionIfHasAlerts called');
    let currentElement = this;
    while (currentElement && currentElement !== document.body) {
      const parentSection = currentElement.closest('.top-section, .content-section, .section-container');
      if (parentSection) {
        console.log('🔄 Found parent section:', parentSection);
        const toggleBtn = parentSection.querySelector('.filter-toggle-btn, .top-toggle-btn, [onclick*="toggle"]');
        if (toggleBtn) {
          console.log('🔄 Found toggle button:', toggleBtn);
          const sectionBody = parentSection.querySelector('.section-body');
          if (sectionBody && sectionBody.style.display === 'none') {
            console.log('🔄 Opening section');
            // פתיחת הסקשן
            toggleBtn.click();
          } else {
            console.log('🔄 Section already open or no section body found');
          }
        } else {
          console.log('🔄 No toggle button found');
        }
        break;
      }
      currentElement = currentElement.parentElement;
    }
  }

  renderAlerts() {
    console.log('🎨 Rendering alerts, count:', this.alerts?.length);
    console.log('🎨 Alerts data:', this.alerts);

    const container = this.querySelector('#alertsCards');
    const legendHeader = this.querySelector('.alerts-color-legend-header');
    
    if (!container) {
      console.warn('❌ No alertsCards container found');
      return;
    }

    console.log('✅ Found alertsCards container');

    if (!this.alerts.length) {
      console.log('🎨 No alerts to display');
      // הסתרת המיכל כשאין התראות
      container.style.display = 'none';
      // הסתרת מפתח הצבעים כשאין התראות
      if (legendHeader) {
        legendHeader.style.display = 'none';
      }
      this.updateSectionHeaderAlertIcon(); // עדכון איקון ההתראות בכותרת הסקשן
      return;
    }

    console.log('🎨 Rendering', this.alerts.length, 'alerts');

    // הצגת מפתח הצבעים כשיש התראות
    if (legendHeader) {
      legendHeader.style.display = 'flex';
    }

    // מיון ההתראות לפי זמן מהחדשה לישנה
    const sortedAlerts = [...this.alerts].sort((a, b) => {
      const timeA = new Date(a.triggered_at || a.created_at);
      const timeB = new Date(b.triggered_at || b.created_at);
      return timeB - timeA; // מהחדשה לישנה
    });

    console.log('🎨 Sorted alerts:', sortedAlerts);

    // הצגת המיכל כשיש התראות
    container.style.display = 'grid';

    // יצירת HTML לכל התראה
    const alertsHTML = sortedAlerts.map(a => {
      const html = this.createAlertCardHTML(a);
      console.log('🎨 Generated HTML for alert:', a.id, html);
      return html;
    }).join('');

    console.log('🎨 Final HTML:', alertsHTML);
    container.innerHTML = alertsHTML;

    this.setupCardEventListeners();
    this.updateSectionHeaderAlertIcon(); // עדכון איקון ההתראות בכותרת הסקשן
  }

  createAlertCardHTML(alert) {
    console.log('🔍 Creating alert card for:', alert);

    // שמירת ההתראה הנוכחית לשימוש בפונקציות אחרות
    this.currentAlert = alert;

    const timeAgo = this.getTimeAgo(alert.created_at);
    const triggeredTime = this.getTriggeredTime(alert);
    const icon = this.getAlertIcon(alert.type);

    // קבלת הסימבול מהאובייקט המקושר
    console.log('🔍 Alert related data:', {
      related_type_id: alert.related_type_id,
      related_object_id: alert.related_object_id,
      related_id: alert.related_id, // בדיקה אם יש שדה אחר
      ticker_id: alert.ticker_id,
      ticker_symbol: alert.ticker_symbol
    });

    // נסה לקבל סימבול מהטיקר ישירות
    let symbol = alert.ticker_symbol;
    if (!symbol && alert.related_type_id && alert.related_id) {
      symbol = this.getSymbolFromRelatedObject(alert.related_type_id, alert.related_id);
    }
    // אם עדיין אין סימבול, נציג "התראה" ככותרת
    if (!symbol) {
      symbol = 'התראה';
    }
    console.log('🔍 Symbol:', symbol);

    // שימוש בפונקציה formatAlertCondition לתרגום התנאי
    console.log('🔍 Raw condition:', alert.condition);
    const formattedCondition = window.formatAlertCondition ? window.formatAlertCondition(alert.condition) : this.formatAlertCondition(alert.condition);

    console.log('🔍 Formatted condition:', formattedCondition);
    console.log('🔍 Alert type:', alert.type);
    console.log('🔍 Alert message:', alert.message);

    // נתוני דמה לטיקר
    const currentPrice = this.getCurrentPrice(symbol);
    const dailyChange = this.getDailyChange(symbol);
    const changeClass = dailyChange.startsWith('+') ? 'positive' : 'negative';
    console.log('🔍 Price data:', { currentPrice, dailyChange, changeClass });

    // טיפול בשדות undefined
    const message = alert.message || '';
    const relatedType = this.getRelatedTypeFromId(alert.related_type_id);
    // נסה להשתמש ב-related_id אם related_object_id לא קיים
    const relatedObjectId = alert.related_id;
    console.log('🔍 Calling getRelatedObjectDetails with:', { related_type_id: alert.related_type_id, relatedObjectId });
    const relatedObjectDetails = this.getRelatedObjectDetails(alert.related_type_id, relatedObjectId);

    // קביעת רקע צבעוני לפי סוג האובייקט המקושר (לא לפי סוג ההתראה)
    const relatedTypeId = alert.related_type_id || 4; // ברירת מחדל לטיקר
    console.log('🔍 Creating alert card with relatedTypeId:', relatedTypeId);
    const objectIcon = this.getObjectTypeIcon(relatedTypeId);
    console.log('🔍 Object icon for header:', objectIcon);

    const html = `
      <div class="alert-card" data-related-type="${relatedTypeId}" data-alert-id="${alert.id}">
        <div class="alert-card-header">
          <h4 class="alert-card-title clickable" onclick="window.showTickerPage('${symbol}')">${objectIcon} ${symbol || 'התראה'}</h4>
          <span class="alert-card-time">${triggeredTime}</span>
          <button class="btn-mark-read-icon" data-alert-id="${alert.id}" title="${window.BUTTON_TEXTS ? window.BUTTON_TEXTS.READ : 'קראתי'}">${window.BUTTON_ICONS ? window.BUTTON_ICONS.READ : '✓'}</button>
        </div>
        <div class="alert-card-related-object">
          ${relatedObjectDetails}
        </div>
        <div class="alert-card-content">
          <div class="alert-card-details">
            <span class="alert-detail-item condition-item">${window.translateConditionFields(alert.condition_attribute, alert.condition_operator, alert.condition_number)}</span>
            <span class="alert-detail-item ${changeClass}">${currentPrice}</span>
            <span class="alert-detail-item ${changeClass}">${dailyChange}</span>
            ${message ? `<span class="alert-detail-item message-icon" title="${message}">${window.BUTTON_ICONS ? window.BUTTON_ICONS.SEARCH : '🔍'}</span>` : ''}
          </div>
        </div>
      </div>
    `;

    console.log('🔍 Generated HTML:', html);
    return html;
  }

  setupCardEventListeners() {
    this.querySelectorAll('.btn-mark-read-icon').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.alertId);
        this.markAlertAsRead(id);
      });
    });
  }

  async markAlertAsRead(alertId) {
    const btn = this.querySelector(`.btn-mark-read-icon[data-alert-id="${alertId}"]`);
    if (btn) { 
      btn.disabled = true; 
            btn.textContent = window.BUTTON_ICONS ? window.BUTTON_ICONS.READ : '✓';
      btn.style.opacity = '0.5'; 
    }
    try {
      const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
      const res = await fetch(`${base}/api/v1/alerts/${alertId}/mark-read`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' } });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const card = this.querySelector(`[data-alert-id="${alertId}"]`);
      if (card) {
        card.style.opacity = '0.5';
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
          card.remove();
          this.alerts = this.alerts.filter(a => a.id !== alertId);
          this.updateCount();
          this.updateSectionHeaderAlertIcon(); // עדכון איקון ההתראות בכותרת הסקשן
          if (!this.alerts.length) this.renderAlerts();
          setTimeout(() => this.loadActiveAlerts(), 400);
        }, 220);
      }
    } catch (err) {
      console.error('failed marking alert as read', err);
      if (btn) { 
        btn.disabled = false; 
        btn.textContent = window.BUTTON_ICONS ? window.BUTTON_ICONS.APPROVE : '✓'; 
        btn.style.opacity = '1'; 
      }
    }
  }

  // Helpers
  getTimeAgo(s) {
    const now = new Date();
    const d = new Date(s);
    const mins = Math.floor((now - d) / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 1) return 'עכשיו';
    if (mins < 60) return `לפני ${mins} דקות`;
    if (hours < 24) return `לפני ${hours} שעות`;
    if (days < 7) return `לפני ${days} ימים`;
    return d.toLocaleDateString('he-IL');
  }

  /**
   * קבלת זמן הפעלת ההתראה עם תאריך ושעה
   */
  getTriggeredTime(alert) {
    // אם יש שדה triggered_at, נשתמש בו
    if (alert.triggered_at) {
      return this.formatDateTime(alert.triggered_at);
    }

    // אם יש שדה is_triggered ויש created_at, נשתמש ב-created_at
    if (alert.is_triggered && alert.created_at) {
      return this.formatDateTime(alert.created_at);
    }

    // אחרת נשתמש ב-created_at כרגיל
    return this.getTimeAgo(alert.created_at);
  }

  /**
   * עיצוב תאריך ושעה
   */
  formatDateTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    // אם זה היום - הצג רק שעה
    if (diffDays === 0) {
      return date.toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }

    // אם זה אתמול - הצג "אתמול" + שעה
    if (diffDays === 1) {
      return `אתמול ${date.toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })}`;
    }

    // אם זה השבוע - הצג יום + שעה
    if (diffDays < 7) {
      const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
      const dayName = dayNames[date.getDay()];
      return `${dayName} ${date.toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })}`;
    }

    // אם זה יותר משבוע - הצג תאריך + שעה
    return `${date.toLocaleDateString('he-IL')} ${date.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })}`;
  }

  getAlertIcon(t) {
    const m = { price_alert: '🎯', stop_loss: '⚠️', volume_alert: '📊', custom_alert: '🔔' };
    return m[t] || '🔔';
  }

  getAlertTypeDisplay(t) {
    const m = { price_alert: 'התראת מחיר', stop_loss: 'עצירת הפסד', volume_alert: 'התראת נפח', custom_alert: 'התראה מותאמת' };
    return m[t] || t;
  }

  getEntityTypeDisplay(t) {
    const m = { account: 'חשבון', trade: 'טרייד', trade_plan: 'תכנון', ticker: 'טיקר' };
    return m[t] || t;
  }

  getRelatedTypeFromId(typeId) {
    const typeMap = {
      1: 'account',
      2: 'trade',
      3: 'trade_plan',
      4: 'ticker'
    };
    return typeMap[typeId] || 'unknown';
  }

  extractTickerFromCondition(c) {
    if (!c) return '';
    const m = c.match(/\b(AAPL|GOOGL|MSFT|TSLA|NVDA|SPY|QQQ|IWM|AMZN|META|NFLX|AMD|INTC|ORCL|CRM|ADBE)\b/i);
    return m ? m[1].toUpperCase() : '';
  }

  getRandomTicker() {
    const tickers = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'SPY', 'QQQ', 'IWM', 'AMZN', 'META', 'NFLX', 'AMD', 'INTC', 'ORCL', 'CRM', 'ADBE'];
    return tickers[Math.floor(Math.random() * tickers.length)];
  }



  /**
   * פונקציה לתרגום תנאי התראה לעברית
   * משתמשת בפונקציה הגלובלית אם זמינה, אחרת משתמשת בגרסה מקומית
   */
  formatAlertCondition(condition) {
    // בדיקה אם הפונקציה הגלובלית זמינה
    if (window.formatAlertCondition) {
      return window.formatAlertCondition(condition);
    }

    // גרסה מקומית כגיבוי
    if (!condition) return '-';

    // מגוון תנאי התראות לדוגמה
    const conditionExamples = {
      'below': 'מחיר < 150',
      'above': 'מחיר > 200',
      'crosses_up': 'מחיר חוצה למעלה 180',
      'crosses_down': 'מחיר חוצה למטה 160',
      'volume_high': 'נפח מסחר > 1M',
      'daily_change_positive': 'שינוי יומי > 2%',
      'daily_change_negative': 'שינוי יומי < -1%',
      'moving_average_cross': 'ממוצע נע חוצה 50',
      'price_target': 'מחיר מגיע ליעד',
      'stop_loss': 'מחיר מגיע לעצירת הפסד',
      'breakout': 'פריצת התנגדות',
      'breakdown': 'פריצת תמיכה',
      'rsi_overbought': 'RSI > 70',
      'rsi_oversold': 'RSI < 30',
      'macd_signal': 'MACD חוצה אות',
      'bollinger_upper': 'מחיר מגיע לגבול עליון',
      'bollinger_lower': 'מחיר מגיע לגבול תחתון'
    };

    // אם יש תנאי מוכן, נחזיר אותו
    if (conditionExamples[condition]) {
      return conditionExamples[condition];
    }

    const parsed = this.parseAlertCondition(condition);

    // המרת משתנה לעברית
    const variableLabels = {
      'price': 'מחיר',
      'daily_change': 'שינוי יומי',
      'moving_average': 'ממוצע נע',
      'volume': 'נפח מסחר'
    };

    // המרת אופרטור לעברית
    const operatorLabels = {
      'greater_than': '>',
      'less_than': '<',
      'crosses': 'חוצה',
      'crosses_up': 'חוצה למעלה',
      'crosses_down': 'חוצה למטה',
      'increases_by': 'עולה ב',
      'decreases_by': 'יורד ב',
      'increases_by_percent': 'עולה ב%',
      'decreases_by_percent': 'יורד ב%'
    };

    const variableDisplay = variableLabels[parsed.variable] || parsed.variable;
    const operatorDisplay = operatorLabels[parsed.operator] || parsed.operator;

    if (parsed.operator && parsed.value) {
      return `${variableDisplay} ${operatorDisplay} ${parsed.value}`;
    } else if (parsed.variable) {
      return parsed.variable; // אם אין אופרטור או ערך, נציג רק את המשתנה
    } else {
      return condition; // אם לא הצלחנו לפרק, נציג את המקורי
    }
  }

  /**
   * פונקציה לפרסור תנאי התראה
   * משתמשת בפונקציה הגלובלית אם זמינה, אחרת משתמשת בגרסה מקומית
   */
  parseAlertCondition(condition) {
    // בדיקה אם הפונקציה הגלובלית זמינה
    if (window.parseAlertCondition) {
      return window.parseAlertCondition(condition);
    }

    // גרסה מקומית כגיבוי
    if (!condition) return { variable: '', operator: '', value: '' };

    const parts = condition.split('|');
    if (parts.length >= 3) {
      return {
        variable: parts[0] || '',
        operator: parts[1] || '',
        value: parts[2] || ''
      };
    } else if (parts.length === 2) {
      return {
        variable: parts[0] || '',
        operator: parts[1] || '',
        value: ''
      };
    } else if (parts.length === 1) {
      return {
        variable: parts[0] || '',
        operator: '',
        value: ''
      };
    }

    return { variable: '', operator: '', value: '' };
  }

  /**
 * מציאת כותרת הסקשן והוספת איקון התראות
 */
  setupSectionHeaderAlertIcon() {
    // חיפוש כותרת הסקשן - נחפש את הכותרת הקרובה ביותר
    let currentElement = this;
    while (currentElement && currentElement !== document.body) {
      // חיפוש בסקשן האב
      const parentSection = currentElement.closest('.content-section, .top-section, .section-container');
      if (parentSection) {
        const sectionHeader = parentSection.querySelector('.section-header');
        if (sectionHeader) {
          this._sectionHeader = sectionHeader;
          this.createAlertIcon();
          break;
        }
      }

      // חיפוש בתוך הסקשן הנוכחי (רק אם לא מצאנו בסקשן האב)
      if (!this._sectionHeader) {
        const sectionHeader = currentElement.querySelector('.section-header, .alerts-header');
        if (sectionHeader) {
          this._sectionHeader = sectionHeader;
          this.createAlertIcon();
          break;
        }
      }

      currentElement = currentElement.parentElement;
    }
  }

  /**
   * יצירת איקון התראות בכותרת הסקשן
   */
  createAlertIcon() {
    if (!this._sectionHeader) return;

    // הסרת איקון קיים אם יש
    this.removeSectionHeaderAlertIcon();

    // יצירת איקון חדש
    this._alertIcon = document.createElement('div');
    this._alertIcon.className = 'section-alert-icon';
    this._alertIcon.innerHTML = `
      <div class="alert-bell-icon" title="לחץ לפתיחת התראות">
        <span class="bell-emoji">🔔</span>
        <span class="alert-count-badge" id="sectionAlertCount">0</span>
      </div>
    `;

    // הוספת event listener לאיקון
    const bellIcon = this._alertIcon.querySelector('.alert-bell-icon');
    if (bellIcon) {
      bellIcon.addEventListener('click', () => {
        this.openSectionWithAlerts();
      });
    }

    // הוספה לכותרת הסקשן - בצד שמאל (ימין ב-RTL) ליד כפתור הסגירה
    const tableActions = this._sectionHeader.querySelector('.table-actions');
    if (tableActions) {
      // הוספה בתחילת table-actions (לפני כפתור הסגירה)
      tableActions.insertBefore(this._alertIcon, tableActions.firstChild);
    } else {
      // אם אין table-actions, נוסיף בסוף הכותרת
      this._sectionHeader.appendChild(this._alertIcon);
    }

    // עדכון האיקון עם מספר ההתראות הנוכחי
    this.updateSectionHeaderAlertIcon();
  }

  /**
   * פתיחת הסקשן שמכיל את ההתראות
   */
  openSectionWithAlerts() {
    // חיפוש הסקשן שמכיל את הקומפוננט
    let currentElement = this;
    while (currentElement && currentElement !== document.body) {
      // חיפוש בסקשן האב
      const parentSection = currentElement.closest('.content-section, .top-section, .section-container');
      if (parentSection) {
        // חיפוש כפתור פתיחה/סגירה של הסקשן
        const toggleBtn = parentSection.querySelector('.filter-toggle-btn, .top-toggle-btn, [onclick*="toggle"]');
        if (toggleBtn) {
          // בדיקה אם הסקשן סגור
          const sectionBody = parentSection.querySelector('.section-body, .alerts-cards-container');
          if (sectionBody && sectionBody.style.display === 'none') {
            // לחיצה על כפתור הפתיחה
            toggleBtn.click();
          }
        }
        break;
      }
      currentElement = currentElement.parentElement;
    }

    // גלילה לסקשן ההתראות
    setTimeout(() => {
      this.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }

  /**
 * עדכון איקון ההתראות בכותרת הסקשן
 */
  updateSectionHeaderAlertIcon() {
    // בדיקה אם האיקון קיים, אם לא - יצירתו מחדש
    if (!this._alertIcon || !this._alertIcon.isConnected) {
      this.setupSectionHeaderAlertIcon();
      return;
    }

    const countBadge = this._alertIcon.querySelector('#sectionAlertCount');
    if (countBadge) {
      countBadge.textContent = this.alerts.length;

      // בדיקה אם הסקשן סגור
      const isSectionClosed = this.isSectionClosed();

      // הצגה/הסתרה לפי מספר ההתראות ומצב הסקשן
      if (this.alerts.length > 0 && isSectionClosed) {
        this._alertIcon.style.display = 'inline-flex';
        countBadge.style.display = 'inline-flex';

        // הוספת אפקט הדגשה כשיש התראות חדשות
        this._alertIcon.classList.add('has-alerts');
      } else {
        this._alertIcon.style.display = 'none';
        countBadge.style.display = 'none';
        this._alertIcon.classList.remove('has-alerts');
      }
    }

    // עדכון האיקון הפנימי
    this.updateInternalAlertIcon();
  }

  /**
   * עדכון האיקון הפנימי של הקומפוננט
   */
  updateInternalAlertIcon() {
    const titleCountBadge = this.querySelector('.title-count-badge');
    if (titleCountBadge) {
      titleCountBadge.textContent = this.alerts.length;
    }
  }

  /**
   * בדיקה אם הסקשן סגור
   */
  isSectionClosed() {
    // חיפוש הסקשן שמכיל את הקומפוננט
    let currentElement = this;
    while (currentElement && currentElement !== document.body) {
      const parentSection = currentElement.closest('.content-section, .top-section, .section-container');
      if (parentSection) {
        // חיפוש הגוף של הסקשן
        const sectionBody = parentSection.querySelector('.section-body, .alerts-cards-container');
        if (sectionBody) {
          // בדיקה אם הגוף מוסתר
          return sectionBody.style.display === 'none' ||
            sectionBody.style.height === '0px' ||
            sectionBody.classList.contains('collapsed');
        }
        break;
      }
      currentElement = currentElement.parentElement;
    }
    return false;
  }

  /**
   * הגדרת האזנה לשינויים במצב הסקשן
   */
  setupSectionToggleListener() {
    // חיפוש הסקשן שמכיל את הקומפוננט
    let currentElement = this;
    while (currentElement && currentElement !== document.body) {
      const parentSection = currentElement.closest('.content-section, .top-section, .section-container');
      if (parentSection) {
        // חיפוש כפתור הפתיחה/סגירה
        const toggleBtn = parentSection.querySelector('.filter-toggle-btn, .top-toggle-btn, [onclick*="toggle"]');
        if (toggleBtn) {
          // האזנה ללחיצות על כפתור הפתיחה/סגירה
          toggleBtn.addEventListener('click', () => {
            // עדכון האיקון אחרי קצת זמן (לתת לסקשן להתעדכן)
            setTimeout(() => {
              this.updateSectionHeaderAlertIcon();
            }, 100);
          });
        }
        break;
      }
      currentElement = currentElement.parentElement;
    }
  }

  /**
   * בדיקה שהסגנונות נטענו
   */
  checkStylesLoaded() {
    // בדיקה שהסגנונות שלנו נטענו
    const styleSheets = Array.from(document.styleSheets);
    const hasStyles = styleSheets.some(sheet => {
      try {
        return sheet.href && sheet.href.includes('styles.css');
      } catch (e) {
        return false;
      }
    });

    if (!hasStyles) {
      console.warn('⚠️ Active Alerts Component: styles.css not found - icon may not display correctly');
    } else {
      console.log('✅ Active Alerts Component: styles loaded successfully');
    }
  }

  /**
   * יצירת כותרת עם איקון פעמון ומספר
   */
  createTitleWithIcon() {
    return `
      <span class="title-bell-icon">
        <span class="bell-emoji">🔔</span>
        <span class="title-count-badge">${this.alerts.length}</span>
      </span>
      התראות פעילות
    `;
  }

  /**
   * קבלת פרטי האובייקט המקושר - כמו בטבלת ההתראות
   */
  getRelatedObjectDetails(relatedTypeId, relatedObjectId) {
    console.log('🔍 Getting related object details:', { relatedTypeId, relatedObjectId });

    // בדיקה אם השדות קיימים
    if (relatedTypeId === null || relatedTypeId === undefined || relatedObjectId === null || relatedObjectId === undefined) {
      console.log('🔍 No related object - showing general');
      return '<span class="no-linked-object">כללי</span>';
    }

    // קביעת האובייקט המקושר לפי הטבלה - בדיוק כמו בטבלת ההתראות
    let relatedDisplay = '';

    switch (relatedTypeId) {
      case 1: // חשבון
        // נציג שם חשבון עם מטבע
        const accountNames = ['חשבון מעודכן (USD)', 'חשבון השקעות (ILS)', 'חשבון מסחר (USD)', 'חשבון פנסיה (ILS)'];
        const accountName = accountNames[relatedObjectId % accountNames.length];
        relatedDisplay = accountName;
        break;
      case 2: // טרייד
        // נציג טרייד עם סוג השקעה, צד ותאריך בפורמט: טרייד | סווינג | Long | 24.3.25
        const investmentTypes = ['סווינג', 'השקעה', 'פסיבי'];
        const sides = ['Long', 'Short'];
        const investmentType = investmentTypes[relatedObjectId % investmentTypes.length];
        const side = sides[relatedObjectId % sides.length];
        const tradeDate = new Date().toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '.');

        relatedDisplay = `טרייד | ${investmentType} | ${side} | ${tradeDate}`;
        break;
      case 3: // תוכנית
        // נציג תוכנית עם סוג השקעה, צד ותאריך בפורמט: תוכנית | סווינג | Long | 24.3.25
        const planTypes = ['סווינג', 'השקעה', 'פסיבי'];
        const planSides = ['Long', 'Short'];
        const planType = planTypes[relatedObjectId % planTypes.length];
        const planSide = planSides[relatedObjectId % planSides.length];
        const planDate = new Date().toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '.');
        relatedDisplay = `תוכנית | ${planType} | ${planSide} | ${planDate}`;
        break;
      case 4: // טיקר - נציג את הסימבול עם המילה "טיקר:"
        const symbol = this.getSymbolFromRelatedObject(relatedTypeId, relatedObjectId);
        relatedDisplay = symbol ? `טיקר: ${symbol}` : `טיקר ${relatedObjectId}`;
        break;
      default:
        relatedDisplay = `אובייקט ${relatedObjectId}`;
    }

    console.log('🔍 Related object display:', relatedDisplay);
    console.log('🔍 Final HTML for related object:', `<span class="linked-object-text">🔗 ${relatedDisplay}</span>`);

    // החזרת הטקסט עם איקון קישור קטן - קישור לאובייקטים מקושרים
    return `<span class="linked-object-text linked-object-clickable" onclick="window.showRelatedObjectModal(${relatedTypeId}, ${relatedObjectId})">🔗 ${relatedDisplay}</span>`;
  }

  /**
   * פונקציה גלובלית להצגת הודעה על קישור לאובייקט
   */
  static showLinkedObjectMessage() {
    if (window.showInfoNotification) {
      window.showInfoNotification('קישור לאובייקט נמצא בפיתוח', 'info');
    } else {
      alert('קישור לאובייקט נמצא בפיתוח');
    }
  }

  /**
   * קבלת הסימבול מהאובייקט המקושר
   */
  getSymbolFromRelatedObject(relatedTypeId, relatedObjectId) {
    console.log('🔍 getSymbolFromRelatedObject called with:', { relatedTypeId, relatedObjectId });

    if (!relatedObjectId) {
      console.log('🔍 No relatedObjectId, returning null');
      return null;
    }

    // אם יש לנו ticker_symbol ישירות מהשרת, נשתמש בו
    if (this.currentAlert && this.currentAlert.ticker_symbol) {
      console.log('🔍 Using ticker_symbol from server:', this.currentAlert.ticker_symbol);
      return this.currentAlert.ticker_symbol;
    }

    const relatedType = this.getRelatedTypeFromId(relatedTypeId);
    console.log('🔍 Related type:', relatedType);

    // כרגע נחזיר סימבול דמה - בהמשך יטען מהשרת
    // בהתבסס על סוג האובייקט המקושר
    switch (relatedType) {
      case 'ticker':
        // אם זה טיקר, נחזיר סימבול אקראי
        const tickerSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'SPY', 'QQQ', 'IWM', 'AMZN', 'META', 'NFLX', 'AMD', 'INTC', 'ORCL', 'CRM', 'ADBE'];
        const symbol = tickerSymbols[relatedObjectId % tickerSymbols.length];
        console.log('🔍 Ticker symbol:', symbol);
        return symbol;
      case 'trade':
        // אם זה טרייד, נחזיר סימבול דמה
        const tradeSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA'];
        return tradeSymbols[relatedObjectId % tradeSymbols.length];
      case 'trade_plan':
        // אם זה תכנון טרייד, נחזיר סימבול דמה
        const planSymbols = ['SPY', 'QQQ', 'IWM', 'AMZN', 'META'];
        return planSymbols[relatedObjectId % planSymbols.length];
      case 'account':
        // אם זה חשבון, נחזיר שם החשבון
        const accountNames = ['חשבון מעודכן', 'חשבון השקעות', 'חשבון מסחר', 'חשבון פנסיה'];
        return accountNames[relatedObjectId % accountNames.length];
      default:
        console.log('🔍 Unknown related type, returning התראה');
        return 'התראה';
    }
  }

  /**
   * קבלת מחיר נוכחי (נתוני דמה)
   */
  getCurrentPrice(symbol) {
    if (!symbol) return 'N/A';

    // נתוני דמה - בהמשך יטען מהשרת
    const prices = {
      'AAPL': '$150.25',
      'GOOGL': '$2,850.75',
      'MSFT': '$320.50',
      'TSLA': '$245.80',
      'NVDA': '$450.30',
      'SPY': '$450.30',
      'QQQ': '$380.45',
      'IWM': '$185.20',
      'AMZN': '$3,200.00',
      'META': '$380.50',
      'NFLX': '$580.25',
      'AMD': '$120.75',
      'INTC': '$45.80',
      'ORCL': '$125.40',
      'CRM': '$280.90',
      'ADBE': '$520.60'
    };

    return prices[symbol] || '$100.00';
  }

  /**
   * קבלת שינוי יומי (נתוני דמה)
   */
  getDailyChange(symbol) {
    if (!symbol) return 'N/A';

    // נתוני דמה - בהמשך יטען מהשרת
    const changes = {
      'AAPL': '+2.5%',
      'GOOGL': '-1.2%',
      'MSFT': '+3.1%',
      'TSLA': '-0.8%',
      'NVDA': '+5.2%',
      'SPY': '+1.8%',
      'QQQ': '+2.3%',
      'IWM': '-0.5%',
      'AMZN': '+1.7%',
      'META': '-2.1%',
      'NFLX': '+4.3%',
      'AMD': '+6.8%',
      'INTC': '-1.5%',
      'ORCL': '+0.9%',
      'CRM': '+2.4%',
      'ADBE': '-0.7%'
    };

    return changes[symbol] || '+0.0%';
  }

  /**
   * קביעת מחלקת CSS לפי סוג ההתראה
   */
  getAlertTypeClass(alertType) {
    const typeClasses = {
      'price_alert': 'alert-card-price',
      'stop_loss': 'alert-card-stop-loss',
      'volume_alert': 'alert-card-volume',
      'custom_alert': 'alert-card-custom'
    };
    return typeClasses[alertType] || 'alert-card-default';
  }

  /**
   * קביעת איקון לפי סוג האובייקט המקושר - מעודכן לאיקונים של המערכת
   */
  getObjectTypeIcon(relatedTypeId) {
    console.log('🔍 getObjectTypeIcon called with relatedTypeId:', relatedTypeId);
    // איקונים עקביים עם המערכת - שימוש באיקונים SVG האמיתיים
    const objectIcons = {
      1: '<img src="images/icons/accounts.svg" alt="חשבון" style="width: 16px; height: 16px; vertical-align: middle;">', // חשבון
      2: '<img src="images/icons/trades.svg" alt="טרייד" style="width: 16px; height: 16px; vertical-align: middle;">', // טרייד
      3: '<img src="images/icons/trade_plans.svg" alt="תוכנית טרייד" style="width: 16px; height: 16px; vertical-align: middle;">', // תוכנית טרייד
      4: '<img src="images/icons/tickers.svg" alt="טיקר" style="width: 16px; height: 16px; vertical-align: middle;">'  // טיקר
    };
    const icon = objectIcons[relatedTypeId] || objectIcons[4]; // ברירת מחדל לטיקר
    console.log('🔍 getObjectTypeIcon returning icon:', icon);
    return icon;
  }

  /**
   * הסרת איקון ההתראות מהכותרת
   */
  removeSectionHeaderAlertIcon() {
    if (this._alertIcon && this._alertIcon.parentNode) {
      this._alertIcon.parentNode.removeChild(this._alertIcon);
      this._alertIcon = null;
    }
  }
}

customElements.define('active-alerts', ActiveAlertsComponent);

// פונקציה לעדכון הקומפוננטה כאשר הפונקציות הגלובליות נטענות
window.updateActiveAlertsComponent = function () {
  const components = document.querySelectorAll('active-alerts');
  components.forEach(component => {
    if (component.checkGlobalFunctions && !component._functionsChecked) {
      component.checkGlobalFunctions();
    }
    // עדכון איקון ההתראות
    if (component.updateSectionHeaderAlertIcon) {
      component.updateSectionHeaderAlertIcon();
    }
  });
};

// פונקציה לעדכון איקון ההתראות בכל הקומפוננטים
window.updateAllAlertIcons = function () {
  const components = document.querySelectorAll('active-alerts');
  components.forEach(component => {
    if (component.updateSectionHeaderAlertIcon) {
      component.updateSectionHeaderAlertIcon();
    }
  });
};

// האזנה לשינויים בפונקציות הגלובליות
window.addEventListener('load', () => {
  // בדיקה אם הפונקציות זמינות אחרי טעינת הדף
  setTimeout(() => {
    if (window.formatAlertCondition && window.parseAlertCondition) {
      window.updateActiveAlertsComponent();
    }
  }, 1000);
});

// האזנה לשינויים בדף (כמו פתיחה/סגירה של סקשנים)
window.addEventListener('DOMContentLoaded', () => {
  // עדכון איקונים אחרי טעינת הדף
  setTimeout(() => {
    window.updateAllAlertIcons();
  }, 500);
});

// האזנה לשינויים ב-URL (ניווט בין עמודים)
let currentUrl = window.location.href;
window.addEventListener('popstate', () => {
  if (currentUrl !== window.location.href) {
    currentUrl = window.location.href;
    // עדכון איקונים אחרי ניווט
    setTimeout(() => {
      window.updateAllAlertIcons();
    }, 300);
  }
});

// פונקציה גלובלית להצגת הודעה על אובייקט מקושר
window.showLinkedObjectMessage = function () {
  if (window.showInfoNotification) {
    window.showInfoNotification('אובייקט מקושר', 'הקישור לאובייקט המקושר יופעל בהמשך');
  } else {
    alert('הקישור לאובייקט המקושר יופעל בהמשך');
  }
};

// פונקציה גלובלית לפתיחת דף טיקר
window.showTickerPage = function (symbol) {
  if (window.showInfoNotification) {
    window.showInfoNotification('דף טיקר', `דף הטיקר עבור ${symbol} ייפתח בקרוב`);
  } else {
    alert(`דף הטיקר עבור ${symbol} ייפתח בקרוב`);
  }
};

// פונקציה גלובלית להצגת מודל אובייקטים מקושרים
window.showRelatedObjectModal = function (relatedTypeId, relatedObjectId) {
  if (window.showInfoNotification) {
    window.showInfoNotification('אובייקט מקושר', `פתיחת אובייקט מסוג ${relatedTypeId} עם מזהה ${relatedObjectId} - ייפתח בקרוב`);
  } else {
    alert(`פתיחת אובייקט מסוג ${relatedTypeId} עם מזהה ${relatedObjectId} - ייפתח בקרוב`);
  }
};

// הפונקציות formatAlertCondition ו-parseAlertCondition הועברו לקובץ alerts.js


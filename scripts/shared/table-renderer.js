/**
 * ========================================
 * Shared Table Renderer
 * ========================================
 * 
 * קוד משותף לטבלאות:
 * - תפריט פעולות
 * - תגי סטטוס
 * - כפתור פריטים מקושרים
 * - רינדור שורות
 */

/**
 * מחלקה לרינדור טבלאות
 */
class TableRenderer {
  /**
   * רינדור תפריט פעולות
   * @param {string} entityType - סוג ישות (trade_plan, trade, etc.)
   * @param {number} entityId - מזהה הישות
   * @param {Object} options - אפשרויות נוספות
   * @returns {string} HTML של התפריט
   */
  static renderActionsMenu(entityType, entityId, options = {}) {
    const actions = [];

    // עריכה - תמיד זמינה
    actions.push(`
      <button class="btn btn-sm btn-outline-primary" onclick="window.${this.getEntityModule(entityType)}.showEdit${this.getEntityName(entityType)}Modal(${entityId})" title="עריכה">
        <i class="fas fa-edit"></i>
      </button>
    `);

    // פעולות ספציפיות לפי סוג ישות
    switch (entityType) {
      case 'trade_plan':
        // ביצוע (רק אם פעיל)
        if (options.status === 'active') {
          actions.push(`
            <button class="btn btn-sm btn-outline-success" onclick="window.TradePlansData.executeTradePlan(${entityId})" title="ביצוע">
              <i class="fas fa-play"></i>
            </button>
          `);
        }
        // ביטול (רק אם פעיל)
        if (options.status === 'active') {
          actions.push(`
            <button class="btn btn-sm btn-outline-warning" onclick="window.TradePlansData.cancelTradePlan(${entityId})" title="ביטול">
              <i class="fas fa-stop"></i>
            </button>
          `);
        }
        break;

      case 'trade':
        // סגירה (רק אם פתוח)
        if (options.status === 'open') {
          actions.push(`
            <button class="btn btn-sm btn-outline-warning" onclick="window.TradesUI.showCloseTradeModal(${entityId})" title="סגירה">
              <i class="fas fa-times"></i>
            </button>
          `);
        }
        break;
    }

    // העתקה - תמיד זמינה
    actions.push(`
      <button class="btn btn-sm btn-outline-info" onclick="window.${this.getEntityModule(entityType)}.copy${this.getEntityName(entityType)}(${entityId})" title="העתקה">
        <i class="fas fa-copy"></i>
      </button>
    `);

    // מחיקה - תמיד זמינה
    actions.push(`
      <button class="btn btn-sm btn-outline-danger" onclick="window.${this.getEntityModule(entityType)}.delete${this.getEntityName(entityType)}(${entityId})" title="מחיקה">
        <i class="fas fa-trash"></i>
      </button>
    `);

    // פריטים מקושרים - תמיד זמין
    actions.push(`
      <button class="btn btn-sm btn-outline-secondary" onclick="window.viewLinkedItemsFor${this.getEntityName(entityType)}(${entityId})" title="פריטים מקושרים">
        <i class="fas fa-link"></i>
      </button>
    `);

    return `
      <div class="btn-group" role="group">
        ${actions.join('')}
      </div>
    `;
  }

  /**
   * רינדור תג סטטוס
   * @param {string} status - סטטוס
   * @param {string} entityType - סוג ישות
   * @returns {string} HTML של התג
   */
  static renderStatusBadge(status, entityType = '') {
    const statusMap = {
      // סטטוסים כלליים
      'active': { class: 'badge bg-success', text: 'פעיל' },
      'inactive': { class: 'badge bg-secondary', text: 'לא פעיל' },
      'pending': { class: 'badge bg-warning', text: 'ממתין' },
      'cancelled': { class: 'badge bg-danger', text: 'בוטל' },
      
      // סטטוסים ספציפיים לטריידים
      'open': { class: 'badge bg-success', text: 'פתוח' },
      'closed': { class: 'badge bg-primary', text: 'סגור' },
      
      // סטטוסים ספציפיים לתוכניות
      'executed': { class: 'badge bg-primary', text: 'בוצע' }
    };

    const statusInfo = statusMap[status] || { 
      class: 'badge bg-light text-dark', 
      text: status || 'לא ידוע' 
    };
    
    return `<span class="${statusInfo.class}">${statusInfo.text}</span>`;
  }

  /**
   * רינדור כפתור פריטים מקושרים
   * @param {string} entityType - סוג ישות
   * @param {number} entityId - מזהה הישות
   * @returns {string} HTML של הכפתור
   */
  static renderLinkedItemsButton(entityType, entityId) {
    return `
      <button class="btn btn-sm btn-outline-secondary" onclick="window.viewLinkedItemsFor${this.getEntityName(entityType)}(${entityId})" title="פריטים מקושרים">
        <i class="fas fa-link"></i>
      </button>
    `;
  }

  /**
   * רינדור תג סוג טרייד
   * @param {string} tradeType - סוג טרייד
   * @returns {string} HTML של התג
   */
  static renderTradeTypeBadge(tradeType) {
    const typeMap = {
      'buy': { class: 'badge bg-success', text: 'רכישה' },
      'sell': { class: 'badge bg-danger', text: 'מכירה' },
      'long': { class: 'badge bg-primary', text: 'ארוך' },
      'short': { class: 'badge bg-warning', text: 'קצר' }
    };

    const typeInfo = typeMap[tradeType] || { 
      class: 'badge bg-light text-dark', 
      text: tradeType || 'לא ידוע' 
    };
    
    return `<span class="${typeInfo.class}">${typeInfo.text}</span>`;
  }

  /**
   * רינדור רווח/הפסד
   * @param {number} profit - רווח/הפסד
   * @param {string} currency - מטבע
   * @returns {string} HTML של הרווח/הפסד
   */
  static renderProfitLoss(profit, currency = '₪') {
    const numProfit = parseFloat(profit);
    
    if (numProfit > 0) {
      return `<span class="text-success">${currency}${numProfit.toFixed(2)}</span>`;
    } else if (numProfit < 0) {
      return `<span class="text-danger">-${currency}${Math.abs(numProfit).toFixed(2)}</span>`;
    } else {
      return `<span class="text-muted">${currency}0.00</span>`;
    }
  }

  /**
   * רינדור אחוז רווח/הפסד
   * @param {number} percentage - אחוז
   * @returns {string} HTML של האחוז
   */
  static renderProfitLossPercentage(percentage) {
    const numPercentage = parseFloat(percentage);
    
    if (numPercentage > 0) {
      return `<span class="text-success">+${numPercentage.toFixed(2)}%</span>`;
    } else if (numPercentage < 0) {
      return `<span class="text-danger">${numPercentage.toFixed(2)}%</span>`;
    } else {
      return `<span class="text-muted">0.00%</span>`;
    }
  }

  /**
   * רינדור מצב ריק
   * @param {string} entityType - סוג ישות
   * @param {number} colSpan - מספר עמודות
   * @returns {string} HTML של המצב הריק
   */
  static renderEmptyState(entityType, colSpan = 10) {
    const entityName = this.getEntityName(entityType);
    const icon = entityType === 'trade_plan' ? 'fa-chart-line' : 'fa-chart-line';
    
    return `
      <tr>
        <td colspan="${colSpan}" class="text-center text-muted py-4">
          <div class="d-flex flex-column align-items-center">
            <i class="fas ${icon} fa-2x mb-2"></i>
            <span>אין ${entityName}ים</span>
            <small>לחץ על "הוסף ${entityName}" כדי להתחיל</small>
          </div>
        </td>
      </tr>
    `;
  }

  /**
   * רינדור תאריך
   * @param {string|Date} date - תאריך
   * @param {string} format - פורמט
   * @returns {string} תאריך מעוצב
   */
  static renderDate(date, format = 'he-IL') {
    if (!date) {
      return 'לא ידוע';
    }

    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString(format);
    } catch (error) {
      return 'לא תקין';
    }
  }

  /**
   * רינדור מטבע
   * @param {number|string} amount - סכום
   * @param {string} currency - מטבע
   * @returns {string} סכום מעוצב
   */
  static renderCurrency(amount, currency = '₪') {
    const num = parseFloat(amount);
    if (isNaN(num)) {
      return `${currency} 0.00`;
    }
    return `${currency} ${num.toFixed(2)}`;
  }

  /**
   * קבלת שם מודול לפי סוג ישות
   * @param {string} entityType - סוג ישות
   * @returns {string} שם מודול
   */
  static getEntityModule(entityType) {
    const moduleMap = {
      'trade_plan': 'TradePlansUI',
      'trade': 'TradesUI'
    };
    return moduleMap[entityType] || 'UnknownModule';
  }

  /**
   * קבלת שם ישות לפי סוג
   * @param {string} entityType - סוג ישות
   * @returns {string} שם ישות
   */
  static getEntityName(entityType) {
    const nameMap = {
      'trade_plan': 'TradePlan',
      'trade': 'Trade'
    };
    return nameMap[entityType] || 'Entity';
  }

  /**
   * רינדור טבלה מלאה
   * @param {string} tableId - מזהה הטבלה
   * @param {Array} data - נתונים
   * @param {Object} config - קונפיגורציה
   * @returns {void}
   */
  static renderTable(tableId, data, config = {}) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    
    if (!tbody) {
      console.error(`❌ Table body not found for table: ${tableId}`);
      return;
    }

    // ניקוי הטבלה
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
      tbody.innerHTML = this.renderEmptyState(config.entityType, config.colSpan);
      return;
    }

    // רינדור כל שורה
    data.forEach(item => {
      const row = this.renderTableRow(item, config);
      tbody.appendChild(row);
    });

    console.log(`✅ Rendered ${data.length} items in table: ${tableId}`);
  }

  /**
   * רינדור שורה בטבלה
   * @param {Object} item - פריט
   * @param {Object} config - קונפיגורציה
   * @returns {HTMLElement} אלמנט שורה
   */
  static renderTableRow(item, config = {}) {
    const row = document.createElement('tr');
    row.setAttribute(`data-${config.entityType}-id`, item.id);

    // רינדור עמודות לפי קונפיגורציה
    if (config.columns) {
      config.columns.forEach(column => {
        const cell = document.createElement('td');
        cell.className = column.class || '';
        cell.innerHTML = this.renderCellContent(item, column);
        row.appendChild(cell);
      });
    }

    return row;
  }

  /**
   * רינדור תוכן תא
   * @param {Object} item - פריט
   * @param {Object} column - קונפיגורציה של עמודה
   * @returns {string} תוכן התא
   */
  static renderCellContent(item, column) {
    const value = item[column.field];
    
    switch (column.type) {
      case 'status':
        return this.renderStatusBadge(value, column.entityType);
      case 'trade_type':
        return this.renderTradeTypeBadge(value);
      case 'profit_loss':
        return this.renderProfitLoss(value, column.currency);
      case 'percentage':
        return this.renderProfitLossPercentage(value);
      case 'date':
        return this.renderDate(value, column.format);
      case 'currency':
        return this.renderCurrency(value, column.currency);
      case 'actions':
        return this.renderActionsMenu(column.entityType, item.id, { status: item.status });
      case 'linked_items':
        return this.renderLinkedItemsButton(column.entityType, item.id);
      default:
        return value || '';
    }
  }
}

// ייצוא המודול
window.TableRenderer = TableRenderer;

console.log('✅ Shared Table Renderer module loaded');

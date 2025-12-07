/**
 * Recent Trades Widget - TikTrack Dashboard
 * =========================================
 * Renders the "טריידים אחרונים" card on the home page.
 *
 * This widget relies only on general systems:
 * - FieldRendererService for formatting amounts, dates, sides.
 * - NotificationSystem (optional) for error messaging.
 */

;(function () {
  const MAX_ITEMS = 5;
  const CONTAINER_ID = 'recentTrades';

  function resolveDateValue(value) {
    if (!value && value !== 0) {
      return null;
    }
    if (typeof value === 'string') {
      return value;
    }
    if (value && typeof value === 'object') {
      return value.utc || value.local || value.display || value.iso || value.date || null;
    }
    return null;
  }

  /**
   * Format date - משתמש ב-FieldRendererService המרכזי
   * @deprecated - השתמש ישירות ב-window.FieldRendererService.renderDate() או renderDateShort()
   * @param {*} value - תאריך לעיצוב
   * @returns {string} תאריך מעוצב
   */
  function formatDate(value) {
    const resolved = resolveDateValue(value);
    if (!resolved) {
      return '';
    }
    
    // שימוש ישיר ב-FieldRendererService - המערכת תמיד זמינה דרך BASE package
    if (window.FieldRendererService?.renderDateShort) {
      return window.FieldRendererService.renderDateShort(resolved) || '';
    }
    
    if (window.FieldRendererService?.renderDate) {
      return window.FieldRendererService.renderDate(resolved, false);
    }
    
    // Fallback למקרה נדיר ביותר שהמערכת לא זמינה
    try {
      const dateObj = new Date(resolved);
      if (!Number.isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' });
      }
    } catch (error) {
      window.Logger?.warn('RecentTradesWidget: formatDate failed', { error: error?.message });
    }
    
    return '';
  }

  /**
   * Format amount - משתמש ב-FieldRendererService המרכזי
   * @deprecated - השתמש ישירות ב-window.FieldRendererService.renderAmount()
   * @param {*} value - סכום לעיצוב
   * @param {string} currencySymbol - סמל מטבע
   * @returns {string} HTML של סכום מעוצב
   */
  function formatAmount(value, currencySymbol = '$') {
    const numeric = Number(value) || 0;
    
    // שימוש ישיר ב-FieldRendererService - המערכת תמיד זמינה דרך BASE package
    if (window.FieldRendererService?.renderAmount) {
      return window.FieldRendererService.renderAmount(numeric, currencySymbol, 2, true);
    }
    
    // Fallback למקרה נדיר ביותר שהמערכת לא זמינה
    return `${currencySymbol}${numeric.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Format side - משתמש ב-FieldRendererService המרכזי
   * @deprecated - השתמש ישירות ב-window.FieldRendererService.renderSide()
   * @param {string} value - Side value (Long/Short)
   * @returns {string} HTML של side badge
   */
  function formatSide(value) {
    if (!value) {
      return '';
    }
    // שימוש ישיר ב-FieldRendererService - המערכת תמיד זמינה דרך BASE package
    if (window.FieldRendererService?.renderSide) {
      return window.FieldRendererService.renderSide(value);
    }
    // Fallback למקרה נדיר ביותר שהמערכת לא זמינה
    return value || '';
  }

  function normalizeTrades(trades = []) {
    return trades
      .filter(Boolean)
      .map(trade => ({
        symbol: trade?.ticker?.symbol || trade?.symbol || (trade?.id ? `#${trade.id}` : '—'),
        side: trade?.side || trade?.position?.side || '',
        quantity: trade?.position?.quantity ?? trade?.quantity,
        amount: trade?.position?.amount ?? trade?.amount ?? trade?.total_pl,
        date: trade?.created_at || trade?.opened_at || trade?.entry_date || trade?.executed_at,
      }))
      .sort((a, b) => {
        const dateA = resolveDateValue(a.date);
        const dateB = resolveDateValue(b.date);
        
        // Use TableSortValueAdapter if available
        if (typeof window.TableSortValueAdapter?.getSortValue === 'function') {
          const sortValueA = window.TableSortValueAdapter.getSortValue({ value: dateA, type: 'auto' });
          const sortValueB = window.TableSortValueAdapter.getSortValue({ value: dateB, type: 'auto' });
          return (sortValueB || 0) - (sortValueA || 0);
        }
        
        // Fallback to dateUtils for consistent date comparison
        const getEpoch = (dateValue) => {
          if (!dateValue) return 0;
          if (window.dateUtils && typeof window.dateUtils.getEpochMilliseconds === 'function') {
            const envelope = window.dateUtils.ensureDateEnvelope ? window.dateUtils.ensureDateEnvelope(dateValue) : dateValue;
            return window.dateUtils.getEpochMilliseconds(envelope || dateValue) || 0;
          }
          // Fallback for DateEnvelope objects
          if (dateValue && typeof dateValue === 'object' && typeof dateValue.epochMs === 'number') {
            return dateValue.epochMs;
          }
          // Fallback for Date objects or strings
          try {
            const dateObj = dateValue instanceof Date ? dateValue : new Date(dateValue);
            return dateObj.getTime() || 0;
          } catch {
            return 0;
          }
        };
        const timeA = getEpoch(dateA);
        const timeB = getEpoch(dateB);
        return timeB - timeA;
      })
      .slice(0, MAX_ITEMS);
  }

  function renderEmpty(container) {
    container.textContent = '';
    const div = document.createElement('div');
    div.className = 'text-muted small';
    div.textContent = 'אין טריידים זמינים';
    container.appendChild(div);
  }

  function renderList(trades, container, currencySymbol) {
    const list = document.createElement('ul');
    list.className = 'list-group list-group-flush';

    trades.forEach(trade => {
      const item = document.createElement('li');
      item.className = 'list-group-item d-flex justify-content-between align-items-start gap-2';

      const contentWrap = document.createElement('div');
      contentWrap.className = 'd-flex flex-column';

      const title = document.createElement('span');
      title.className = 'fw-semibold';
      title.textContent = trade.symbol;
      contentWrap.appendChild(title);

      const metaRow = document.createElement('div');
      metaRow.className = 'd-flex flex-wrap align-items-center gap-2 text-muted small';

      const sideValue = formatSide(trade.side);
      if (sideValue) {
        const sideSpan = document.createElement('span');
        if (typeof sideValue === 'string' && sideValue.includes('<')) {
          sideSpan.textContent = '';
          const parser = new DOMParser();
          const doc = parser.parseFromString(sideValue, 'text/html');
          doc.body.childNodes.forEach(node => {
            sideSpan.appendChild(node.cloneNode(true));
          });
        } else {
          sideSpan.textContent = sideValue;
        }
        metaRow.appendChild(sideSpan);
      }

      if (trade.quantity !== undefined && trade.quantity !== null) {
        const qtySpan = document.createElement('span');
        qtySpan.textContent = `כמות: ${Number(trade.quantity).toLocaleString('he-IL')}`;
        metaRow.appendChild(qtySpan);
      }

      const dateLabel = formatDate(trade.date);
      if (dateLabel) {
        const dateSpan = document.createElement('span');
        dateSpan.textContent = dateLabel;
        metaRow.appendChild(dateSpan);
      }

      contentWrap.appendChild(metaRow);
      item.appendChild(contentWrap);

      const amountWrap = document.createElement('div');
      amountWrap.className = 'text-end fw-semibold';
      const amountHTML = formatAmount(trade.amount, currencySymbol);
      amountWrap.textContent = '';
      const parser = new DOMParser();
      const doc = parser.parseFromString(amountHTML, 'text/html');
      doc.body.childNodes.forEach(node => {
        amountWrap.appendChild(node.cloneNode(true));
      });
      item.appendChild(amountWrap);

      list.appendChild(item);
    });

    container.textContent = '';
    container.appendChild(list);
  }

  const RecentTradesWidget = {
    render(trades = [], currencySymbol = '$') {
      const container = document.getElementById(CONTAINER_ID);
      if (!container) {
        return;
      }

      const normalized = normalizeTrades(trades);
      if (normalized.length === 0) {
        renderEmpty(container);
        return;
      }

      renderList(normalized, container, currencySymbol);
    },
  };

  window.RecentTradesWidget = RecentTradesWidget;
})();


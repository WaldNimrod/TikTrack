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

  function formatDate(value) {
    const resolved = resolveDateValue(value);
    if (!resolved) {
      return '';
    }
    if (window.FieldRendererService?.renderDateShort) {
      try {
        return window.FieldRendererService.renderDateShort(resolved) || '';
      } catch (error) {
        window.Logger?.warn('RecentTradesWidget: renderDateShort failed', { error: error?.message });
      }
    }
    const dateObj = new Date(resolved);
    if (Number.isNaN(dateObj.getTime())) {
      return '';
    }
    return dateObj.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  function formatAmount(value, currencySymbol = '$') {
    const numeric = Number(value) || 0;
    if (window.FieldRendererService?.renderAmount) {
      try {
        return window.FieldRendererService.renderAmount(numeric, currencySymbol, 2, true);
      } catch (error) {
        window.Logger?.warn('RecentTradesWidget: renderAmount failed', { error: error?.message });
      }
    }
    return `${currencySymbol}${numeric.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function formatSide(value) {
    if (window.FieldRendererService?.renderTradeSide) {
      try {
        return window.FieldRendererService.renderTradeSide(value);
      } catch (error) {
        window.Logger?.warn('RecentTradesWidget: renderTradeSide failed', { error: error?.message });
      }
    }
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
        const timeA = new Date(resolveDateValue(a.date) || 0).getTime();
        const timeB = new Date(resolveDateValue(b.date) || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, MAX_ITEMS);
  }

  function renderEmpty(container) {
    container.innerHTML = '<div class="text-muted small">אין טריידים זמינים</div>';
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
          sideSpan.innerHTML = sideValue;
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
      amountWrap.innerHTML = formatAmount(trade.amount, currencySymbol);
      item.appendChild(amountWrap);

      list.appendChild(item);
    });

    container.innerHTML = '';
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


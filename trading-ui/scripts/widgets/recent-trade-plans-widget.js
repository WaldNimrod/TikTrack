/**
 * Recent Trade Plans Widget - TikTrack Dashboard
 * ==============================================
 * Renders the "תוכניות אחרונות" card on the home page.
 *
 * This widget relies only on general systems:
 * - FieldRendererService for formatting amounts, dates, sides.
 * - NotificationSystem (optional) for error messaging.
 */

;(function () {
  const MAX_ITEMS = 5;
  const CONTAINER_ID = 'recentTradePlans';

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
      return window.FieldRendererService.renderDateShort(resolved) || '';
    }
    
    if (window.FieldRendererService?.renderDate) {
      return window.FieldRendererService.renderDate(resolved, false);
    }
    
    try {
      const dateObj = new Date(resolved);
      if (!Number.isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' });
      }
    } catch (error) {
      window.Logger?.warn('RecentTradePlansWidget: formatDate failed', { error: error?.message });
    }
    
    return '';
  }

  function normalizeTradePlans(tradePlans = []) {
    return tradePlans
      .filter(Boolean)
      .map(plan => ({
        name: plan?.name || plan?.title || (plan?.id ? `תוכנית #${plan.id}` : '—'),
        symbol: plan?.ticker?.symbol || plan?.symbol || '',
        investmentType: plan?.investment_type || plan?.type || '',
        amount: plan?.amount || plan?.total_amount || plan?.investment_amount,
        date: plan?.created_at || plan?.opened_at || plan?.entry_date,
        status: plan?.status || '',
      }))
      .sort((a, b) => {
        const dateA = resolveDateValue(a.date);
        const dateB = resolveDateValue(b.date);
        
        if (typeof window.TableSortValueAdapter?.getSortValue === 'function') {
          const sortValueA = window.TableSortValueAdapter.getSortValue({ value: dateA, type: 'auto' });
          const sortValueB = window.TableSortValueAdapter.getSortValue({ value: dateB, type: 'auto' });
          return (sortValueB || 0) - (sortValueA || 0);
        }
        
        const getEpoch = (dateValue) => {
          if (!dateValue) return 0;
          if (window.dateUtils && typeof window.dateUtils.getEpochMilliseconds === 'function') {
            const envelope = window.dateUtils.ensureDateEnvelope ? window.dateUtils.ensureDateEnvelope(dateValue) : dateValue;
            return window.dateUtils.getEpochMilliseconds(envelope || dateValue) || 0;
          }
          if (dateValue && typeof dateValue === 'object' && typeof dateValue.epochMs === 'number') {
            return dateValue.epochMs;
          }
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
    container.innerHTML = '<div class="text-muted small">אין תוכניות זמינות</div>';
  }

  function renderList(plans, container, currencySymbol) {
    const list = document.createElement('ul');
    list.className = 'list-group list-group-flush';

    plans.forEach(plan => {
      const item = document.createElement('li');
      item.className = 'list-group-item d-flex justify-content-between align-items-start gap-2';

      const contentWrap = document.createElement('div');
      contentWrap.className = 'd-flex flex-column';

      const title = document.createElement('span');
      title.className = 'fw-semibold';
      title.textContent = plan.name;
      contentWrap.appendChild(title);

      const metaRow = document.createElement('div');
      metaRow.className = 'd-flex flex-wrap align-items-center gap-2 text-muted small';

      if (plan.symbol) {
        const symbolSpan = document.createElement('span');
        symbolSpan.textContent = plan.symbol;
        metaRow.appendChild(symbolSpan);
      }

      if (plan.investmentType) {
        const typeSpan = document.createElement('span');
        typeSpan.textContent = plan.investmentType;
        metaRow.appendChild(typeSpan);
      }

      const dateLabel = formatDate(plan.date);
      if (dateLabel) {
        const dateSpan = document.createElement('span');
        dateSpan.textContent = dateLabel;
        metaRow.appendChild(dateSpan);
      }

      contentWrap.appendChild(metaRow);
      item.appendChild(contentWrap);

      if (plan.amount !== undefined && plan.amount !== null) {
        const amountWrap = document.createElement('div');
        amountWrap.className = 'text-end fw-semibold';
        if (window.FieldRendererService?.renderAmount) {
          amountWrap.innerHTML = window.FieldRendererService.renderAmount(
            Number(plan.amount),
            currencySymbol,
            2,
            true
          );
        } else {
          amountWrap.textContent = `${currencySymbol}${Number(plan.amount).toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        item.appendChild(amountWrap);
      }

      list.appendChild(item);
    });

    container.innerHTML = '';
    container.appendChild(list);
  }

  const RecentTradePlansWidget = {
    render(tradePlans = [], currencySymbol = '$') {
      const container = document.getElementById(CONTAINER_ID);
      if (!container) {
        return;
      }

      const normalized = normalizeTradePlans(tradePlans);
      if (normalized.length === 0) {
        renderEmpty(container);
        return;
      }

      renderList(normalized, container, currencySymbol);
    },
  };

  window.RecentTradePlansWidget = RecentTradePlansWidget;
})();


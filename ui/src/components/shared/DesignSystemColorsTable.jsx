/**
 * Design System Colors Table - DNA Color Variables
 * -------------------------------------------------
 * Displays all CSS color variables from phoenix-base.css
 * Dynamic: swatches use var(--name) - no inline hex
 * SOP-012, Design System Page
 */

import React from 'react';

const COLOR_CATEGORIES = [
  {
    title: '1. Brand Colors (6 משתנים)',
    rows: [
      { label: 'Primary', vars: ['--color-primary-light', '--color-primary', '--color-primary-dark'] },
      { label: 'Secondary', vars: ['--color-secondary-light', '--color-secondary', '--color-secondary-dark'] },
    ],
  },
  {
    title: '2. Entity Colors (27 משתנים)',
    rows: [
      { label: 'trade', vars: ['--entity-trade-light', '--entity-trade', '--entity-trade-dark'] },
      { label: 'trade_plan', vars: ['--entity-trade_plan-light', '--entity-trade_plan', '--entity-trade_plan-dark'] },
      { label: 'execution', vars: ['--entity-execution-light', '--entity-execution', '--entity-execution-dark'] },
      { label: 'trading_account', vars: ['--entity-trading_account-light', '--entity-trading_account', '--entity-trading_account-dark'] },
      { label: 'cash_flow', vars: ['--entity-cash_flow-light', '--entity-cash_flow', '--entity-cash_flow-dark'] },
      { label: 'ticker', vars: ['--entity-ticker-light', '--entity-ticker', '--entity-ticker-dark'] },
      { label: 'alert', vars: ['--entity-alert-light', '--entity-alert', '--entity-alert-dark'] },
      { label: 'note', vars: ['--entity-note-light', '--entity-note', '--entity-note-dark'] },
      { label: 'research', vars: ['--entity-research-light', '--entity-research', '--entity-research-dark'] },
    ],
  },
  {
    title: '3. Message & Status (12 משתנים)',
    rows: [
      { label: 'info', vars: ['--message-info-light', '--message-info', '--message-info-dark'] },
      { label: 'warning', vars: ['--message-warning-light', '--message-warning', '--message-warning-dark'] },
      { label: 'error', vars: ['--message-error-light', '--message-error', '--message-error-dark'] },
      { label: 'success', vars: ['--message-success-light', '--message-success', '--message-success-dark'] },
    ],
  },
  {
    title: '3.1 סטטוסים קבועים — System Status (12 משתנים)',
    rows: [
      { label: 'pending (ממתין)', vars: ['--status-pending-light', '--status-pending', '--status-pending-dark'] },
      { label: 'active (פתוח)', vars: ['--status-active-light', '--status-active', '--status-active-dark'] },
      { label: 'inactive (סגור)', vars: ['--status-inactive-light', '--status-inactive', '--status-inactive-dark'] },
      { label: 'cancelled (מבוטל)', vars: ['--status-cancelled-light', '--status-cancelled', '--status-cancelled-dark'] },
    ],
  },
  {
    title: '4. Investment Types (3 משתנים)',
    rows: [
      { label: 'trade', vars: ['--investment-trade-color'] },
      { label: 'investment', vars: ['--investment-investment-color'] },
      { label: 'passive', vars: ['--investment-passive-color'] },
    ],
  },
  {
    title: '5. Numeric Values (9 משתנים)',
    rows: [
      { label: 'positive', vars: ['--numeric-positive-light', '--numeric-positive', '--numeric-positive-dark'] },
      { label: 'negative', vars: ['--numeric-negative-light', '--numeric-negative', '--numeric-negative-dark'] },
      { label: 'zero', vars: ['--numeric-zero-light', '--numeric-zero', '--numeric-zero-dark'] },
    ],
  },
  {
    title: '6. Base & Border (6 משתנים)',
    rows: [
      { label: 'background', vars: ['--color-background', '--color-background-secondary'] },
      { label: 'text', vars: ['--color-text', '--color-text-secondary'] },
      { label: 'border', vars: ['--color-border', '--color-border-light'] },
    ],
  },
];

const ColorRow = ({ label, vars }) => (
  <tr className="phoenix-table__row">
    <td className="phoenix-table__cell">
      <code>{label}</code>
    </td>
    <td className="phoenix-table__cell">
      <div className="design-system-colors-swatches">
        {vars.map((v) => (
          <div key={v} className="design-system-color-item">
            <div
              className="design-system-color-swatch"
              style={{ background: `var(${v})` }}
              title={v}
            />
            <code className="design-system-color-var">{v}</code>
          </div>
        ))}
      </div>
    </td>
  </tr>
);

const DesignSystemColorsTable = () => (
  <div className="design-system-section">
    <h2 className="design-system-section__title">משתני צבע DNA</h2>
    <p className="design-system-section__description">
      משתני הצבע מ־<code>phoenix-base.css</code> (כולל סטטוסים קבועים). הצבעים מקושרים למשתנים — ללא inline.
    </p>
    <div className="phoenix-table-wrapper">
      <table className="phoenix-table">
        <thead className="phoenix-table__head">
          <tr className="phoenix-table__row">
            <th className="phoenix-table__header">קטגוריה/שם</th>
            <th className="phoenix-table__header">משתנה + Swatch</th>
          </tr>
        </thead>
        <tbody className="phoenix-table__body">
          {COLOR_CATEGORIES.map((cat) => (
            <React.Fragment key={cat.title}>
              <tr className="phoenix-table__row design-system-category-header">
                <td colSpan={2} className="phoenix-table__cell">
                  <strong>{cat.title}</strong>
                </td>
              </tr>
              {cat.rows.map((row) => (
                <ColorRow key={row.label} label={row.label} vars={row.vars} />
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default DesignSystemColorsTable;

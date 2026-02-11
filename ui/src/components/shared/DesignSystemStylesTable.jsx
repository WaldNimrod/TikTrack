/**
 * Design System Styles Table Component
 * -------------------------------------
 * Component for displaying Rich-Text and Button styles dictionary
 * Used in Design System Dashboard (Type D - Admin-only)
 * 
 * @description Displays a table showing all Rich-Text styles (.phx-rt--*) and Button styles (.btn-*)
 * @version v1.0.0
 * @source SOP-012 §3
 */

import React from 'react';

/**
 * DesignSystemStylesTable Component
 * 
 * @description Table component displaying Rich-Text and Button styles dictionary
 * Used by DesignSystemDashboard component
 */
const DesignSystemStylesTable = () => {
  // Rich-Text Styles Data
  const richTextStyles = [
    {
      className: '.phx-rt--success',
      description: 'טקסט הצלחה (ירוק)',
      usage: 'Success messages, positive feedback',
      cssVariable: '--message-success',
      color: '#10b981',
      example: <span className="phx-rt--success">דוגמה לטקסט הצלחה</span>
    },
    {
      className: '.phx-rt--warning',
      description: 'טקסט אזהרה (כתום)',
      usage: 'Warning messages, caution notices',
      cssVariable: '--message-warning',
      color: '#f59e0b',
      example: <span className="phx-rt--warning">דוגמה לטקסט אזהרה</span>
    },
    {
      className: '.phx-rt--danger',
      description: 'טקסט סכנה (אדום)',
      usage: 'Error messages, critical alerts',
      cssVariable: '--message-error',
      color: '#ef4444',
      example: <span className="phx-rt--danger">דוגמה לטקסט סכנה</span>
    },
    {
      className: '.phx-rt--highlight',
      description: 'הדגשה צבעונית',
      usage: 'Important highlights, emphasis',
      cssVariable: '--color-secondary',
      color: '#fc5a06',
      example: <span className="phx-rt--highlight">דוגמה להדגשה</span>
    }
  ];

  // Button Styles Data (from DNA_BUTTON_SYSTEM.md)
  const buttonStyles = [
    {
      className: '.btn-primary',
      description: 'פעולה ראשית',
      usage: 'שמור, אישור, שלח',
      cssVariable: '--context-primary',
      color: '#475569',
      example: <button className="btn btn-primary">שמור</button>
    },
    {
      className: '.btn-auth-primary',
      description: 'כפתור ראשי בעמודי Auth',
      usage: 'התחבר, הרשם',
      cssVariable: '--color-primary',
      color: '#26baac',
      example: <button className="btn btn-auth-primary">התחבר</button>
    },
    {
      className: '.btn-success',
      description: 'פעולות הצלחה',
      usage: 'אישור, שמירה מוצלחת',
      cssVariable: '--message-success',
      color: '#10b981',
      example: <button className="btn btn-success">אישור</button>
    },
    {
      className: '.btn-warning',
      description: 'פעולות אזהרה',
      usage: 'מחיקה, ביטול פעולה',
      cssVariable: '--message-warning',
      color: '#f59e0b',
      example: <button className="btn btn-warning">ביטול</button>
    },
    {
      className: '.btn-secondary',
      description: 'פעולות משניות',
      usage: 'ביטול, חזרה',
      cssVariable: '--color-secondary',
      color: '#fc5a06',
      example: <button className="btn btn-secondary">ביטול</button>
    },
    {
      className: '.btn-outline-secondary',
      description: 'כפתור ברירת מחדל (הפוך)',
      usage: 'כפתור ברירת מחדל',
      cssVariable: '--color-primary',
      color: '#26baac',
      example: <button className="btn btn-outline-secondary">ברירת מחדל</button>
    },
    {
      className: '.btn-logout',
      description: 'התנתקות',
      usage: 'התנתקות מהמערכת',
      cssVariable: '--color-error-red',
      color: '#ef4444',
      example: <button className="btn btn-logout">התנתק</button>
    },
    {
      className: '.btn-sm',
      description: 'כפתור קטן',
      usage: 'כפתורים קטנים במיקומים צפופים',
      cssVariable: 'N/A',
      color: 'N/A',
      example: <button className="btn btn-primary btn-sm">קטן</button>
    }
  ];

  return (
    <div className="design-system-styles">
      {/* Rich-Text Styles Section */}
      <div className="design-system-section">
        <h2 className="design-system-section__title">Rich-Text Styles</h2>
        <p className="design-system-section__description">
          מחלקות CSS לסגנון טקסט ב-Rich-Text Editor (TipTap). רק מחלקות המתחילות ב-<code>phx-rt--</code> מאושרות.
        </p>
        
        <div className="phoenix-table-wrapper">
          <table className="phoenix-table">
            <thead className="phoenix-table__head">
              <tr className="phoenix-table__row">
                <th className="phoenix-table__header">מחלקה</th>
                <th className="phoenix-table__header">תיאור</th>
                <th className="phoenix-table__header">שימוש</th>
                <th className="phoenix-table__header">CSS Variable</th>
                <th className="phoenix-table__header">דוגמה</th>
              </tr>
            </thead>
            <tbody className="phoenix-table__body">
              {richTextStyles.map((style, index) => (
                <tr key={index} className="phoenix-table__row">
                  <td className="phoenix-table__cell">
                    <code>{style.className}</code>
                  </td>
                  <td className="phoenix-table__cell">{style.description}</td>
                  <td className="phoenix-table__cell">{style.usage}</td>
                  <td className="phoenix-table__cell">
                    <code>{style.cssVariable}</code>
                  </td>
                  <td className="phoenix-table__cell">
                    {style.example}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Button Styles Section */}
      <div className="design-system-section">
        <h2 className="design-system-section__title">Button Styles</h2>
        <p className="design-system-section__description">
          מחלקות CSS לכפתורים במערכת. כל הכפתורים משתמשים במחלקה הבסיסית <code>.btn</code>.
        </p>
        
        <div className="phoenix-table-wrapper">
          <table className="phoenix-table">
            <thead className="phoenix-table__head">
              <tr className="phoenix-table__row">
                <th className="phoenix-table__header">מחלקה</th>
                <th className="phoenix-table__header">תיאור</th>
                <th className="phoenix-table__header">שימוש</th>
                <th className="phoenix-table__header">CSS Variable</th>
                <th className="phoenix-table__header">דוגמה</th>
              </tr>
            </thead>
            <tbody className="phoenix-table__body">
              {buttonStyles.map((style, index) => (
                <tr key={index} className="phoenix-table__row">
                  <td className="phoenix-table__cell">
                    <code>{style.className}</code>
                  </td>
                  <td className="phoenix-table__cell">{style.description}</td>
                  <td className="phoenix-table__cell">{style.usage}</td>
                  <td className="phoenix-table__cell">
                    {style.cssVariable !== 'N/A' ? <code>{style.cssVariable}</code> : '—'}
                  </td>
                  <td className="phoenix-table__cell">
                    {style.example}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DesignSystemStylesTable;

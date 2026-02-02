/**
 * PageFooter - רכיב פוטר קבוע למערכת
 * -------------------------------------
 * רכיב React לפוטר קבוע של המערכת
 * 
 * @description מימוש של הפוטר הקבוע לפי הבלופרינט footer.html
 * @standard JS Standards Protocol ✅ | CSS Standards Protocol ✅
 * @blueprintSource _COMMUNICATION/team_01/team_01_staging/footer.html
 */

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PageFooter Component
 * 
 * @description רכיב פוטר קבוע עם 3 עמודות: פרטי קשר, מפת אתר, שותפים
 */
const PageFooter = () => {
  return (
    <footer className="page-footer" dir="rtl">
      <div className="page-footer__container">
        {/* Column 1: Contact Information */}
        <div className="page-footer__column">
          <h3 className="page-footer__title">פרטי קשר</h3>
          <p className="page-footer__text">דוא"ל: info@tiktrack.co.il</p>
          <p className="page-footer__text">טלפון: 03-1234567</p>
          <p className="page-footer__text">כתובת: רחוב דוגמה 123, תל אביב</p>
          <p className="page-footer__text">שעות פעילות: א'-ה' 09:00-18:00</p>
        </div>
        
        {/* Column 2: Site Map */}
        <div className="page-footer__column">
          <h3 className="page-footer__title">מפת אתר</h3>
          <p className="page-footer__text">
            <Link to="/" className="page-footer__link">דף הבית</Link>
          </p>
          <p className="page-footer__text">
            <Link to="/portfolio" className="page-footer__link">פורטפוליו</Link>
          </p>
          <p className="page-footer__text">
            <Link to="/trades" className="page-footer__link">טריידים</Link>
          </p>
          <p className="page-footer__text">
            <Link to="/research" className="page-footer__link">מחקר</Link>
          </p>
          <p className="page-footer__text">
            <Link to="/settings" className="page-footer__link">הגדרות</Link>
          </p>
        </div>
        
        {/* Column 3: Partners */}
        <div className="page-footer__column">
          <h3 className="page-footer__title">שותפים</h3>
          <p className="page-footer__text">שותף אסטרטגי 1</p>
          <p className="page-footer__text">שותף אסטרטגי 2</p>
          <p className="page-footer__text">שותף טכנולוגי</p>
          <p className="page-footer__text">שותף פיננסי</p>
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;

/**
 * AuthLayout - Layout משותף לעמודי Auth
 * --------------------------------------
 * Component משותף למבנה HTML/JSX של עמודי Auth.
 *
 * @description Layout משותף לעמודי Auth עם תמיכה ב-LEGO System, RTL, ו-Accessibility
 * @standard JS Standards Protocol ✅ | LEGO System ✅ | Accessibility ✅ | RTL Support ✅
 * @legacyReference Legacy.auth.layout()
 *
 * @example
 * ```javascript
 * <AuthLayout
 *   title="התחברות"
 *   subtitle="ברוכים הבאים ל-TikTrack"
 *   links={[
 *     { to: "/register", text: "הרשמה עכשיו", className: "auth-link-bold" }
 *   ]}
 * >
 *   <form>...</form>
 * </AuthLayout>
 * ```
 */

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Link Configuration Type
 * @typedef {Object} LinkConfig
 * @property {string} to - Route path
 * @property {string} text - Link text
 * @property {string} [className] - Additional CSS classes
 * @property {string} [testId] - Test ID
 */

/**
 * AuthLayout Component
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Page title (Hebrew)
 * @param {string} [props.subtitle] - Page subtitle (Hebrew)
 * @param {string} [props.logoUrl] - Logo image URL (default: "/images/logo.svg")
 * @param {React.ReactNode} props.children - Page content (usually form)
 * @param {Array<LinkConfig>} [props.links] - Footer links array
 * @param {string} [props.footerText] - Footer text (before links)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} - Auth layout component
 */
const AuthLayout = ({
  title,
  subtitle = 'ברוכים הבאים ל-TikTrack',
  logoUrl = '/images/logo.svg',
  children,
  links = [],
  footerText = null,
  className = '',
}) => {
  return (
    <div className={`auth-layout-root ${className}`} dir="rtl">
      <tt-container>
        <tt-section>
          {/* Header */}
          <div className="auth-header">
            {logoUrl && (
              <div className="auth-logo">
                <img src={logoUrl} alt="TikTrack Logo" />
              </div>
            )}
            {subtitle && <p className="auth-subtitle">{subtitle}</p>}
            {title && <h1 className="auth-title">{title}</h1>}
          </div>

          {/* Content (usually form) */}
          {children}

          {/* Footer Links */}
          {links.length > 0 && (
            <div className="auth-footer-zone">
              {footerText && <span>{footerText} </span>}
              {links.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  className={`auth-link ${link.className || ''}`}
                  data-testid={link.testId}
                >
                  {link.text}
                </Link>
              ))}
            </div>
          )}
        </tt-section>
      </tt-container>
    </div>
  );
};

export default AuthLayout;

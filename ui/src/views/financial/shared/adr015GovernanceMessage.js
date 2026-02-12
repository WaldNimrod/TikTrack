/**
 * ADR-015 — הודעת משילות "ברוקר אחר" (SSOT)
 * --------------------------------------------------------
 * טקסט הודעה והקישור — SSOT: documentation/06-ENGINEERING/ADR_015_GOVERNANCE_MESSAGE_SSOT.md
 * שימוש ב-D16 בלבד (בחירת ברוקר "אחר").
 */

const PRIMARY_ADMIN_CONTACT = 'mailto:support@tiktrack.app';

/** @returns {string} קישור למייל מנהל ראשי */
export function getPrimaryAdminContact() {
  return PRIMARY_ADMIN_CONTACT;
}

const MESSAGE_BODY = 'במידה ולא מצאתם את הברוקר שלכם במערכת, עדין ניתן לייצר את החשבון מסחר — אבל לא ניתן יהיה לייבא אוטומטית נתונים. מומלץ ליצור איתנו קשר ולבקש הוספת הברוקר למערכת, ';

/** @returns {{ body: string, linkHref: string, linkText: string }} נתוני הודעה להצגה */
export function getGovernanceMessageData() {
  return {
    body: MESSAGE_BODY,
    linkHref: PRIMARY_ADMIN_CONTACT,
    linkText: 'קישור למייל מנהל ראשי'
  };
}

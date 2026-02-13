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

/* ADR-018: Message for broker "אחר" - is_supported=false */
const MESSAGE_BODY = 'רוצה שנוסיף תמיכה בברוקר שלך? ';

/** @returns {{ body: string, linkHref: string, linkText: string }} נתוני הודעה להצגה */
export function getGovernanceMessageData() {
  return {
    body: MESSAGE_BODY,
    linkHref: PRIMARY_ADMIN_CONTACT,
    linkText: 'צור קשר'
  };
}

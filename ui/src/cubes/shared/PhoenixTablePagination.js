/**
 * PhoenixTablePagination - אובייקט קבוע לניהול pagination בטבלאות
 * -----------------------------------------------------------------
 * SSOT: סידור מיון, חלוקה לעמודים, תצוגת ספירה.
 * כל הטבלאות ממשות את האובייקט הזה לאחידות מלאה.
 *
 * @description אובייקט קבוע - MANDATORY בכל מימוש טבלה
 * @standard JS Standards Protocol ✅ | Clean Slate Rule ✅
 */

const PhoenixTablePagination = {
  /**
   * computeState - חישוב מצב pagination (defensive: total לעולם לא 0 כשיש נתונים)
   * @param {number} total - ספירה מדווחת
   * @param {number} currentPage - עמוד נוכחי
   * @param {number} pageSize - שורות לעמוד
   * @param {number} [dataLength] - אורך מערך הנתונים (fallback אם total שגוי)
   * @returns {{ start: number, end: number, total: number, totalPages: number }}
   */
  computeState(total = 0, currentPage = 1, pageSize = 25, dataLength = 0) {
    const safeTotal = Math.max(total || 0, dataLength || 0);
    const totalPages = Math.max(1, Math.ceil(safeTotal / pageSize));
    const start = safeTotal === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, safeTotal);
    return { start, end, total: safeTotal, totalPages };
  },

  /**
   * formatInfoText - טקסט תצוגה: "מציג X-Y מתוך Z רשומות"
   * @param {number} start
   * @param {number} end
   * @param {number} total
   * @returns {string}
   */
  formatInfoText(start, end, total) {
    return `מציג ${start}-${end} מתוך ${total} רשומות`;
  },

  /**
   * extractTableData - חילוץ נתונים מכל פורמט תגובה (array, {data}, {notes}, {results}, {items})
   * @param {Array|Object} response - תגובת API
   * @returns {{ data: Array, total: number }}
   */
  extractTableData(response) {
    const arr = Array.isArray(response)
      ? response
      : (response?.data ?? response?.notes ?? response?.results ?? response?.items ?? []) || [];
    const reported = response?.total ?? response?.total_count ?? null;
    const total = Math.max(arr.length, reported ?? 0);
    return { data: arr, total };
  }
};

if (typeof window !== 'undefined') {
  window.PhoenixTablePagination = PhoenixTablePagination;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PhoenixTablePagination;
}

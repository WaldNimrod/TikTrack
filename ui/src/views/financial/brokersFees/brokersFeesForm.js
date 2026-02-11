/**
 * Brokers Fees Form - Form component for add/edit broker fees
 * --------------------------------------------------------
 * Creates and manages form for broker fees (D18)
 * ADR-013: Broker select from GET /api/v1/reference/brokers
 */

import { createModal, closeModal } from '../../../components/shared/PhoenixModal.js';
import { fetchReferenceBrokers } from '../shared/fetchReferenceBrokers.js';

/**
 * Create broker fee form HTML
 * @param {Object} data - Existing broker fee data (for edit mode) or null (for add mode)
 * @param {Array<{value: string, label: string}>} brokerOptions - Broker options for select
 * @returns {string} HTML string for the form
 */
function createBrokerFeeFormHTML(data = null, brokerOptions = []) {
  const isEdit = data !== null;
  const broker = data?.broker || data?.brokerName || '';
  const commissionType = data?.commissionType || data?.commission_type || 'TIERED';
  // Extract numeric value if it's a formatted string, otherwise use as-is
  const commissionValueRaw = data?.commissionValue || data?.commission_value || 0;
  const commissionValue = typeof commissionValueRaw === 'string' && commissionValueRaw.includes('/') 
    ? parseFloat(commissionValueRaw.replace(/[^0-9.]/g, '')) || 0 
    : (typeof commissionValueRaw === 'number' ? commissionValueRaw : parseFloat(commissionValueRaw) || 0);
  const minimum = data?.minimum || 0;

  // Ensure current broker is in options (legacy/edit case)
  const options = [...brokerOptions];
  if (broker && !options.some(o => o.value === broker)) {
    options.unshift({ value: broker, label: broker });
  }
  const brokerOptionsHTML = options.map(o => `<option value="${String(o.value).replace(/"/g, '&quot;')}" ${broker === o.value ? 'selected' : ''}>${String(o.label)}</option>`).join('');

  const brokerFieldHTML = options.length > 0
    ? `<select id="broker" name="broker" required>
         <option value="">-- בחר ברוקר --</option>
         ${brokerOptionsHTML}
       </select>`
    : `<input 
          type="text" 
          id="broker" 
          name="broker" 
          value="${broker}" 
          required 
          placeholder="הזן שם ברוקר"
        />`;

  return `
    <form id="brokerFeeForm" class="phoenix-form">
      <div class="form-group">
        <label for="broker">שם ברוקר *</label>
        ${brokerFieldHTML}
        <span class="form-error" id="brokerError"></span>
      </div>
      
      <div class="form-group">
        <label for="commissionType">סוג עמלה *</label>
        <select id="commissionType" name="commissionType" required>
          <option value="TIERED" ${commissionType === 'TIERED' ? 'selected' : ''}>מדורגת (TIERED)</option>
          <option value="FLAT" ${commissionType === 'FLAT' ? 'selected' : ''}>קבועה (FLAT)</option>
        </select>
        <span class="form-error" id="commissionTypeError"></span>
      </div>
      
      <div class="form-group">
        <label for="commissionValue">ערך עמלה *</label>
        <input 
          type="number" 
          id="commissionValue" 
          name="commissionValue" 
          value="${commissionValue}" 
          step="0.000001" 
          min="0" 
          required 
          placeholder="לדוגמה: 0.0035"
        />
        <span class="form-error" id="commissionValueError"></span>
      </div>
      
      <div class="form-group">
        <label for="minimum">מינימום לפעולה (USD) *</label>
        <input 
          type="number" 
          id="minimum" 
          name="minimum" 
          value="${minimum}" 
          step="0.01" 
          min="0" 
          required 
          placeholder="0.00"
        />
        <span class="form-error" id="minimumError"></span>
      </div>
    </form>
  `;
}

/**
 * Show broker fee modal (add/edit)
 * @param {Object} data - Existing broker fee data (for edit) or null (for add)
 * @param {Function} onSave - Callback function when form is saved
 */
export async function showBrokerFeeFormModal(data, onSave) {
  const isEdit = data !== null;
  const title = isEdit ? 'עריכת עמלה' : 'הוספת ברוקר חדש';
  
  let brokerOptions = [];
  try {
    brokerOptions = await fetchReferenceBrokers();
  } catch (e) {
    console.warn('[Brokers Fees Form] Could not load brokers, fallback to text input:', e);
  }
  const formHTML = createBrokerFeeFormHTML(data, brokerOptions);
  
  createModal({
    title: title,
    content: formHTML,
    entity: 'brokers_fees',
    showSaveButton: true,
    saveButtonText: 'שמור',
    onSave: function() {
      const form = document.getElementById('brokerFeeForm');
      if (!form) return;
      
      // Validate form
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      
      // Collect form data
      const brokerValue = document.getElementById('broker').value.trim();
      const commissionTypeValue = document.getElementById('commissionType').value;
      const commissionValueInput = document.getElementById('commissionValue').value.trim();
      const minimumInput = document.getElementById('minimum').value.trim();
      
      // Parse commissionValue - ensure it's a valid number
      const commissionValueParsed = commissionValueInput ? parseFloat(commissionValueInput) : NaN;
      const minimumParsed = minimumInput ? parseFloat(minimumInput) : NaN;
      
      // Validate required fields
      if (!brokerValue) {
        document.getElementById('brokerError').textContent = 'שם ברוקר הוא שדה חובה';
        return;
      }
      
      if (isNaN(commissionValueParsed) || commissionValueParsed < 0) {
        document.getElementById('commissionValueError').textContent = 'ערך עמלה חייב להיות מספר חיובי';
        return;
      }
      
      if (isNaN(minimumParsed) || minimumParsed < 0) {
        document.getElementById('minimumError').textContent = 'מינימום חייב להיות מספר חיובי';
        return;
      }
      
      const formData = {
        broker: brokerValue,
        commissionType: commissionTypeValue,
        commissionValue: commissionValueParsed, // Number, not string
        minimum: minimumParsed // Number, not string
      };
      
      // Clear errors
      document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
      
      // Call save handler
      if (onSave) {
        onSave(formData, data);
      }
      
      // Close modal
      closeModal();
    },
    onClose: function() {
      // Cleanup if needed
    }
  });
}

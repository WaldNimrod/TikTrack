"""
Import Validator - Pre-import validation for cashflow records

This service performs comprehensive validation of cashflow records before import
to ensure 100% data accuracy and business rule compliance.

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-16
"""

from typing import Dict, Any, Optional, Tuple, List
from sqlalchemy.orm import Session
from config.logging import get_logger

logger = get_logger(__name__)

# ============================================================================
# FUNCTION INDEX
# ============================================================================
# Public API:
#   - validate_cashflow_record(): Validate single cashflow record before import
#   - validate_exchange_pair(): Validate exchange pair (FROM + TO) before import
#   - validate_batch(): Validate batch of records
#
# Internal:
#   - _validate_type(): Validate cashflow_type is valid
#   - _validate_amount(): Validate amount != 0
#   - _validate_fee_amount(): Validate fee_amount >= 0
#   - _validate_currency(): Validate currency exists in database
#   - _validate_exchange_structure(): Validate exchange pair structure
# ============================================================================

class ImportValidator:
    """
    Validator for import records before database insertion.
    
    This class provides pre-import validation to ensure:
    - Type validation: cashflow_type is valid
    - Amount validation: amount != 0, fee_amount >= 0
    - Currency validation: currency exists in database
    - Exchange validation: exchange pairs are correctly structured
    """
    
    # Valid cashflow types (from CashFlow model)
    VALID_CASHFLOW_TYPES = {
        'deposit',
        'withdrawal',
        'fee',
        'dividend',
        'interest',
        'tax',
        'transfer_in',
        'transfer_out',
        'currency_exchange_from',
        'currency_exchange_to',
        'other_positive',
        'other_negative',
        'syep_interest',
        'borrow_fee'  # Maps to 'fee' in storage
    }
    
    @staticmethod
    def validate_cashflow_record(
        record: Dict[str, Any],
        db_session: Optional[Session] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Validate cashflow record before import.
        
        Args:
            record: Cashflow record dict to validate
            db_session: Optional database session for currency validation
            
        Returns:
            (is_valid, error_message)
            - is_valid: True if record is valid, False otherwise
            - error_message: Error message if invalid, None if valid
        """
        # Check required fields
        if not record.get('cashflow_type'):
            return False, "Missing cashflow_type"
        
        cashflow_type = record.get('cashflow_type', '').lower()
        
        # Validate type
        if cashflow_type not in ImportValidator.VALID_CASHFLOW_TYPES:
            return False, f"Invalid cashflow_type: {cashflow_type}"
        
        # Validate amount
        amount = record.get('amount')
        if amount is None:
            return False, "Missing amount"
        
        try:
            amount_float = float(amount)
            if amount_float == 0:
                return False, "Amount cannot be zero"
        except (TypeError, ValueError):
            return False, f"Invalid amount: {amount}"
        
        # Validate fee_amount
        fee_amount = record.get('fee_amount', 0)
        try:
            fee_amount_float = float(fee_amount) if fee_amount is not None else 0.0
            if fee_amount_float < 0:
                return False, "Fee amount cannot be negative"
        except (TypeError, ValueError):
            return False, f"Invalid fee_amount: {fee_amount}"
        
        # Validate currency if db_session provided
        if db_session:
            currency_symbol = record.get('currency')
            if currency_symbol:
                try:
                    from services.currency_service import CurrencyService
                    currency = CurrencyService.get_by_symbol(db_session, currency_symbol)
                    if not currency:
                        return False, f"Currency '{currency_symbol}' not found in database"
                except Exception as e:
                    logger.warning(f"Failed to validate currency {currency_symbol}: {e}")
                    # Don't fail validation on currency lookup errors - just warn
        
        return True, None
    
    @staticmethod
    def validate_exchange_pair(
        from_record: Dict[str, Any],
        to_record: Dict[str, Any],
        db_session: Optional[Session] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Validate exchange pair (FROM + TO) before import.
        
        Args:
            from_record: FROM record dict
            to_record: TO record dict
            db_session: Optional database session for currency validation
            
        Returns:
            (is_valid, error_message)
        """
        # Validate both records individually
        from_valid, from_error = ImportValidator.validate_cashflow_record(from_record, db_session)
        if not from_valid:
            return False, f"FROM record invalid: {from_error}"
        
        to_valid, to_error = ImportValidator.validate_cashflow_record(to_record, db_session)
        if not to_valid:
            return False, f"TO record invalid: {to_error}"
        
        # Validate exchange structure
        from_type = from_record.get('cashflow_type', '').lower()
        to_type = to_record.get('cashflow_type', '').lower()
        
        if from_type != 'currency_exchange_from':
            return False, f"FROM record must have type 'currency_exchange_from', got '{from_type}'"
        
        if to_type != 'currency_exchange_to':
            return False, f"TO record must have type 'currency_exchange_to', got '{to_type}'"
        
        # Validate external_id match (if both have it)
        from_external_id = from_record.get('external_id')
        to_external_id = to_record.get('external_id')
        
        if from_external_id and to_external_id:
            if from_external_id != to_external_id:
                return False, f"Exchange pair external_id mismatch: FROM='{from_external_id}', TO='{to_external_id}'"
        
        # Validate currencies are different
        from_currency = from_record.get('currency')
        to_currency = to_record.get('currency')
        
        if from_currency and to_currency:
            if from_currency.upper() == to_currency.upper():
                return False, f"Exchange currencies must be different: both are '{from_currency}'"
        
        # Validate amounts have opposite signs
        from_amount = float(from_record.get('amount', 0))
        to_amount = float(to_record.get('amount', 0))
        
        if from_amount > 0:
            return False, f"FROM amount must be negative, got {from_amount}"
        
        if to_amount < 0:
            return False, f"TO amount must be positive, got {to_amount}"
        
        return True, None
    
    @staticmethod
    def validate_batch(
        records: List[Dict[str, Any]],
        db_session: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Validate batch of records.
        
        Args:
            records: List of cashflow records to validate
            db_session: Optional database session for currency validation
            
        Returns:
            Dict with:
            - valid_records: List of valid records
            - invalid_records: List of (record, error_message) tuples
            - validation_summary: Summary statistics
        """
        valid_records = []
        invalid_records = []
        
        for idx, record in enumerate(records):
            is_valid, error_message = ImportValidator.validate_cashflow_record(record, db_session)
            if is_valid:
                valid_records.append(record)
            else:
                invalid_records.append((idx, record, error_message))
        
        return {
            'valid_records': valid_records,
            'invalid_records': invalid_records,
            'validation_summary': {
                'total': len(records),
                'valid': len(valid_records),
                'invalid': len(invalid_records)
            }
        }


"""
Validation Service - Validates data integrity and business rules

This service performs comprehensive validation of normalized records
to ensure data quality and business rule compliance before import.

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-16
"""

from typing import List, Dict, Any, Optional, Tuple, Set
from collections import Counter, defaultdict
from datetime import datetime, timezone
import logging
from sqlalchemy.orm import Session

from services.date_normalization_service import DateNormalizationService

logger = logging.getLogger(__name__)

# Import models
try:
    from models.ticker import Ticker
except ImportError:
    logger.warning("Failed to import Ticker model - ticker validation will be limited")
    Ticker = None

try:
    from models.trading_account import TradingAccount
except ImportError:
    logger.warning("Failed to import TradingAccount model - account validation will be limited")
    TradingAccount = None

class ValidationService:
    """
    Service for validating normalized records.
    
    This service performs various validation checks including:
    - Data type validation
    - Business rule validation
    - Range validation
    - Format validation
    """
    
    ZERO_AMOUNT_ALLOWED_TYPES: Set[str] = {
        'syep_activity',
        'syep_interest',
        'interest_accrual',
        'dividend_accrual'
    }

    def __init__(self, db_session: Session = None, date_normalizer: Optional[DateNormalizationService] = None):
        """Initialize the validation service"""
        self.db_session = db_session
        self.date_normalizer = date_normalizer or DateNormalizationService()
        self.validation_rules = {
            'symbol': self._validate_symbol,
            'action': self._validate_action,
            'date': self._validate_date,
            'quantity': self._validate_quantity,
            'price': self._validate_price,
            'fee': self._validate_fee,
            'external_id': self._validate_external_id,
            'source': self._validate_source
        }
    
    def validate_records(
        self,
        records: List[Dict[str, Any]],
        task_type: str = 'executions'
    ) -> Dict[str, Any]:
        """
        Validate a list of normalized records for the specified task type.
        """
        task = (task_type or 'executions').lower()
        if task == 'cashflows':
            return self._validate_cashflow_records(records)
        if task == 'account_reconciliation':
            return self._validate_account_reconciliation_records(records)
        if task == 'portfolio_positions':
            return self._validate_portfolio_records(records)
        if task == 'taxes_and_fx':
            return self._validate_tax_fx_records(records)
        return self._validate_execution_records(records)

    # ------------------------------------------------------------------
    # Execution validation (existing flow)
    # ------------------------------------------------------------------

    def _validate_execution_records(self, records: List[Dict[str, Any]]) -> Dict[str, Any]:
        valid_records = []
        invalid_records = []
        validation_errors = []

        for i, record in enumerate(records):
            try:
                errors = self._validate_single_record(record)

                if errors:
                    invalid_records.append(record)
                    validation_errors.append({
                        'record_index': i,
                        'record': record,
                        'errors': errors
                    })
                else:
                    valid_records.append(record)

            except Exception as exc:
                invalid_records.append(record)
                validation_errors.append({
                    'record_index': i,
                    'record': record,
                    'errors': [f"Validation error: {str(exc)}"]
                })
                logger.error("Failed to validate execution record %s: %s", i, exc)

        logger.info("🔍 Starting missing tickers check for %s valid execution records", len(valid_records))
        missing_tickers = self._check_missing_tickers(valid_records)
        logger.info("📊 Missing tickers result: %s", missing_tickers)

        return {
            'valid_records': valid_records,
            'invalid_records': invalid_records,
            'validation_errors': validation_errors,
            'missing_tickers': missing_tickers,
            'total_records': len(records),
            'valid_count': len(valid_records),
            'invalid_count': len(invalid_records),
            'validation_rate': (len(valid_records) / len(records) * 100) if records else 0
        }

    # ------------------------------------------------------------------
    # Cashflow validation
    # ------------------------------------------------------------------

    def _validate_cashflow_records(self, records: List[Dict[str, Any]]) -> Dict[str, Any]:
        valid_records: List[Dict[str, Any]] = []
        invalid_records: List[Dict[str, Any]] = []
        validation_errors: List[Dict[str, Any]] = []
        missing_accounts: Dict[str, int] = {}
        missing_account_details: List[Dict[str, Any]] = []
        currency_issues: List[Dict[str, Any]] = []
        type_stats: Dict[str, Dict[str, Any]] = {}
        issues_by_type: Dict[str, List[Dict[str, Any]]] = defaultdict(list)

        for i, record in enumerate(records):
            try:
                errors = []
                cashflow_type = str(record.get('cashflow_type') or 'unknown').lower()
                stats_entry = type_stats.setdefault(
                    cashflow_type,
                    {
                        'total_records': 0,
                        'valid_records': 0,
                        'invalid_records': 0,
                        'total_amount': 0.0,
                        'currencies': Counter(),
                        'sections': Counter()
                    }
                )
                stats_entry['total_records'] += 1

                amount = record.get('amount')
                amount_value = None
                if amount is None:
                    errors.append("Missing amount")
                else:
                    try:
                        amount_value = float(amount)
                        stats_entry['total_amount'] += amount_value
                        section_name = str(record.get('section') or '').strip() or 'unknown_section'
                        stats_entry['sections'][section_name] += 1
                        allow_zero_amount = cashflow_type in self.ZERO_AMOUNT_ALLOWED_TYPES
                        if amount_value == 0 and not allow_zero_amount:
                            errors.append("Amount cannot be zero")
                    except (TypeError, ValueError):
                        errors.append(f"Invalid amount value: {amount}")

                currency = record.get('currency')
                if not currency:
                    errors.append("Currency is required")
                else:
                    normalized_currency = self._normalize_currency_code(currency)
                    if not normalized_currency:
                        errors.append(f"Invalid currency code: {currency}")
                    elif len(normalized_currency) != 3:
                        currency_issues.append({
                            'record_index': i,
                            'currency': currency,
                            'message': 'Currency code should be 3 characters',
                            'cashflow_type': cashflow_type
                        })
                    if normalized_currency and amount_value is not None:
                        stats_entry['currencies'][normalized_currency] += amount_value

                if not record.get('cashflow_type'):
                    errors.append("cashflow_type is required")

                if not record.get('effective_date'):
                    errors.append("effective_date envelope is required")

                # IMPORTANT: For cashflows, source_account is set at session level (trading_account_id)
                # It's applied to all records by _ensure_cashflow_account_binding before validation
                # So we only validate if it exists, but don't fail if it's missing (it will be set later)
                source_account_raw = record.get('source_account')
                source_account = str(source_account_raw).strip() if source_account_raw not in (None, '') else ''
                if source_account:
                    record['source_account'] = source_account
                    # Only validate account existence if source_account is provided
                    if not self._account_exists(source_account):
                        missing_accounts[source_account] = missing_accounts.get(source_account, 0) + 1
                        missing_account_details.append({
                            'record_index': i,
                            'cashflow_type': cashflow_type,
                            'currency': record.get('currency'),
                            'amount': record.get('amount'),
                            'memo': record.get('memo'),
                            'section': record.get('section'),
                            'status': 'not_found',
                            'account': source_account,
                            'metadata': record.get('metadata', {})
                        })
                # Note: If source_account is missing, it will be set by _ensure_cashflow_account_binding
                # before validation, so we don't fail validation here

                if errors:
                    invalid_records.append(record)
                    validation_errors.append({
                        'record_index': i,
                        'record': record,
                        'errors': errors
                    })
                    stats_entry['invalid_records'] += 1
                    issues_by_type[cashflow_type].append({
                        'record_index': i,
                        'errors': errors,
                        'record': record
                    })
                else:
                    valid_records.append(record)
                    stats_entry['valid_records'] += 1

            except Exception as exc:
                invalid_records.append(record)
                validation_errors.append({
                    'record_index': i,
                    'record': record,
                    'errors': [f"Validation error: {str(exc)}"]
                })
                logger.error("Failed to validate cashflow record %s: %s", i, exc)

        serializable_type_stats: Dict[str, Dict[str, Any]] = {}
        for cf_type, stats in type_stats.items():
            serializable_type_stats[cf_type] = {
                **stats,
                'currencies': dict(stats['currencies']),
                'sections': dict(stats['sections'])
            }

        return {
            'valid_records': valid_records,
            'invalid_records': invalid_records,
            'validation_errors': validation_errors,
            'missing_accounts': sorted(missing_accounts.keys()),
            'missing_account_details': missing_account_details,
            'currency_issues': currency_issues,
            'total_records': len(records),
            'valid_count': len(valid_records),
            'invalid_count': len(invalid_records),
            'validation_rate': (len(valid_records) / len(records) * 100) if records else 0,
            'type_stats': serializable_type_stats,
            'issues_by_type': dict(issues_by_type)
        }

    # ------------------------------------------------------------------
    # Account reconciliation validation
    # ------------------------------------------------------------------

    def _validate_account_reconciliation_records(self, records: List[Dict[str, Any]]) -> Dict[str, Any]:
        valid_records = []
        invalid_records = []
        validation_errors = []

        missing_accounts: Dict[str, int] = {}
        base_currency_mismatches: List[Dict[str, Any]] = []
        entitlement_warnings: List[Dict[str, Any]] = []
        missing_documents_report: List[Dict[str, Any]] = []

        for i, record in enumerate(records):
            try:
                errors = []
                account_identifier = record.get('account_id')
                base_currency = record.get('base_currency')
                as_of_envelope = record.get('as_of')

                if not account_identifier:
                    errors.append("account_id is required")
                if not base_currency:
                    errors.append("base_currency is required")
                if not as_of_envelope:
                    errors.append("as_of date envelope is required")

                account = self._fetch_account(account_identifier) if account_identifier else None
                if account_identifier and not account:
                    missing_accounts[account_identifier] = missing_accounts.get(account_identifier, 0) + 1
                elif account and base_currency:
                    account_currency_code = self._extract_account_currency(account)
                    normalized_requested = self._normalize_currency_code(base_currency)
                    if account_currency_code and normalized_requested and account_currency_code != normalized_requested:
                        base_currency_mismatches.append({
                            'account_id': account_identifier,
                            'expected': account_currency_code,
                            'reported': normalized_requested
                        })

                entitlements = record.get('entitlements') or []
                if not entitlements:
                    entitlement_warnings.append({
                        'account_id': account_identifier,
                        'message': 'No entitlements reported'
                    })

                missing_documents = record.get('missing_documents') or []
                if missing_documents:
                    missing_documents_report.append({
                        'account_id': account_identifier,
                        'documents': missing_documents
                    })

                if errors:
                    invalid_records.append(record)
                    validation_errors.append({
                        'record_index': i,
                        'record': record,
                        'errors': errors
                    })
                else:
                    valid_records.append(record)

            except Exception as exc:
                invalid_records.append(record)
                validation_errors.append({
                    'record_index': i,
                    'record': record,
                    'errors': [f"Validation error: {str(exc)}"]
                })
                logger.error("Failed to validate account reconciliation record %s: %s", i, exc)

        return {
            'valid_records': valid_records,
            'invalid_records': invalid_records,
            'validation_errors': validation_errors,
            'missing_accounts': sorted(missing_accounts.keys()),
            'base_currency_mismatches': base_currency_mismatches,
            'entitlement_warnings': entitlement_warnings,
            'missing_documents_report': missing_documents_report,
            'total_records': len(records),
            'valid_count': len(valid_records),
            'invalid_count': len(invalid_records),
            'validation_rate': (len(valid_records) / len(records) * 100) if records else 0
        }

    def _validate_portfolio_records(self, records: List[Dict[str, Any]]) -> Dict[str, Any]:
        valid_records: List[Dict[str, Any]] = []
        invalid_records: List[Dict[str, Any]] = []
        validation_errors: List[Dict[str, Any]] = []
        currency_totals: Dict[str, float] = defaultdict(float)
        category_totals: Dict[str, float] = defaultdict(float)
        zero_quantity_positions: List[Dict[str, Any]] = []

        for i, record in enumerate(records):
            errors: List[str] = []
            record_type = (record.get('record_type') or '').lower()
            currency = record.get('currency')

            if record_type == 'open_position' and not record.get('symbol'):
                errors.append("symbol is required for open positions")
            if not currency:
                errors.append("currency is required")
            if not record.get('account_id'):
                errors.append("account_id is required")
            if not record.get('statement_period_end'):
                errors.append("statement_period_end envelope is required")

            market_value = record.get('market_value')
            market_value_numeric: Optional[float] = None
            try:
                market_value_numeric = float(market_value)
            except (TypeError, ValueError):
                errors.append("market_value must be numeric")

            if record_type == 'open_position':
                quantity = record.get('quantity')
                try:
                    quantity_value = float(quantity)
                    if quantity_value == 0 and (market_value_numeric is None or market_value_numeric == 0):
                        zero_quantity_positions.append({
                            'record_index': i,
                            'symbol': record.get('symbol'),
                            'currency': currency
                        })
                except (TypeError, ValueError):
                    errors.append("quantity must be numeric")

            if errors:
                invalid_records.append(record)
                validation_errors.append({
                    'record_index': i,
                    'record': record,
                    'errors': errors
                })
            else:
                valid_records.append(record)
                category = record.get('asset_category') or 'unknown'
                if market_value_numeric is not None:
                    category_totals[category] += market_value_numeric
                    if currency:
                        currency_totals[currency] += market_value_numeric

        return {
            'valid_records': valid_records,
            'invalid_records': invalid_records,
            'validation_errors': validation_errors,
            'currency_totals': dict(currency_totals),
            'asset_category_totals': dict(category_totals),
            'zero_quantity_positions': zero_quantity_positions,
            'total_records': len(records),
            'valid_count': len(valid_records),
            'invalid_count': len(invalid_records),
            'validation_rate': (len(valid_records) / len(records) * 100) if records else 0
        }

    def _validate_tax_fx_records(self, records: List[Dict[str, Any]]) -> Dict[str, Any]:
        valid_records: List[Dict[str, Any]] = []
        invalid_records: List[Dict[str, Any]] = []
        validation_errors: List[Dict[str, Any]] = []
        totals_by_currency: Dict[str, float] = defaultdict(float)
        totals_by_type: Dict[str, float] = defaultdict(float)
        nav_components: Dict[str, float] = defaultdict(float)
        forex_trades: List[Dict[str, Any]] = []

        amount_required_types = {'withholding_tax', 'tax_cashflow', 'forex_conversion'}

        for i, record in enumerate(records):
            errors: List[str] = []
            record_type = (record.get('record_type') or '').lower()
            currency = record.get('currency')

            amount_value: Optional[float] = None
            amount = record.get('amount')
            if amount not in (None, ''):
                try:
                    amount_value = float(amount)
                except (TypeError, ValueError):
                    errors.append("amount must be numeric")
            elif record_type in amount_required_types:
                errors.append("amount must be numeric")

            if record_type in amount_required_types and not currency:
                errors.append("currency is required for monetary records")

            if record_type == 'forex_conversion':
                if not record.get('source_currency') or not record.get('target_currency'):
                    errors.append("forex conversion requires source/target currencies")
                forex_trades.append({
                    'record_index': i,
                    'symbol': record.get('symbol'),
                    'source_currency': record.get('source_currency'),
                    'target_currency': record.get('target_currency'),
                    'quantity': record.get('quantity'),
                    'trade_price': record.get('trade_price'),
                    'amount': amount_value
                })
            elif record_type == 'nav_component' and amount_value is not None:
                component = record.get('component') or 'nav'
                nav_components[component] += amount_value

            if amount_value is not None and currency and record_type in {'withholding_tax', 'tax_cashflow'}:
                totals_by_currency[currency] += amount_value
                totals_by_type[record_type] += amount_value

            if errors:
                invalid_records.append(record)
                validation_errors.append({
                    'record_index': i,
                    'record': record,
                    'errors': errors
                })
            else:
                valid_records.append(record)

        return {
            'valid_records': valid_records,
            'invalid_records': invalid_records,
            'validation_errors': validation_errors,
            'totals_by_currency': dict(totals_by_currency),
            'totals_by_type': dict(totals_by_type),
            'nav_components': dict(nav_components),
            'forex_trades': forex_trades,
            'total_records': len(records),
            'valid_count': len(valid_records),
            'invalid_count': len(invalid_records),
            'validation_rate': (len(valid_records) / len(records) * 100) if records else 0
        }

    # ------------------------------------------------------------------
    # Helpers for account & currency validation
    # ------------------------------------------------------------------

    def _account_exists(self, account_identifier: str) -> bool:
        if not account_identifier:
            return False
        if not self.db_session or not TradingAccount:
            return True
        return self._fetch_account(account_identifier) is not None

    def _fetch_account(self, account_identifier: str) -> Optional[TradingAccount]:
        if not self.db_session or not TradingAccount or account_identifier is None:
            return None

        query = self.db_session.query(TradingAccount)

        # Try numeric ID
        account = None
        if isinstance(account_identifier, (int,)) or (
            isinstance(account_identifier, str) and account_identifier.isdigit()
        ):
            try:
                account = query.filter(TradingAccount.id == int(account_identifier)).first()
            except (ValueError, TypeError):
                account = None

        if account:
            return account

        # Fallback: match by name (case-sensitive first, then case-insensitive)
        account = query.filter(TradingAccount.name == account_identifier).first()
        if account:
            return account

        return query.filter(TradingAccount.name.ilike(account_identifier)).first()

    def _extract_account_currency(self, account: TradingAccount) -> Optional[str]:
        if not account:
            return None
        try:
            if hasattr(account, 'currency') and account.currency and hasattr(account.currency, 'symbol'):
                symbol = account.currency.symbol
            elif hasattr(account, 'currency_symbol'):
                symbol = account.currency_symbol
            else:
                symbol = None
            return self._normalize_currency_code(symbol)
        except Exception:
            return None

    @staticmethod
    def _normalize_currency_code(currency: Any) -> Optional[str]:
        if not currency:
            return None
        try:
            return str(currency).strip().upper()
        except Exception:
            return None
    
    def _validate_single_record(self, record: Dict[str, Any]) -> List[str]:
        """
        Validate a single record.
        
        Args:
            record: Record to validate
            
        Returns:
            List[str]: List of validation error messages
        """
        errors = []
        
        # Check required fields
        required_fields = ['symbol', 'action', 'date', 'quantity', 'price']
        for field in required_fields:
            if field not in record or record[field] is None:
                errors.append(f"Missing required field: {field}")
        
        # Validate each field
        for field, validator in self.validation_rules.items():
            if field in record:
                field_errors = validator(record[field], record)
                errors.extend(field_errors)
        
        return errors
    
    def _validate_symbol(self, value: Any, record: Dict[str, Any]) -> List[str]:
        """Validate symbol field"""
        errors = []
        
        if not value or not isinstance(value, str):
            errors.append("Symbol must be a non-empty string")
        elif len(value.strip()) == 0:
            errors.append("Symbol cannot be empty")
        elif len(value) > 10:
            errors.append("Symbol too long (max 10 characters)")
        elif not value.replace('-', '').replace('.', '').isalnum():
            errors.append("Symbol contains invalid characters")
        
        return errors
    
    def _validate_action(self, value: Any, record: Dict[str, Any]) -> List[str]:
        """Validate action field"""
        errors = []
        
        if not value or not isinstance(value, str):
            errors.append("Action must be a non-empty string")
        elif value not in ['buy', 'sell']:
            errors.append(f"Invalid action: {value}. Must be 'buy' or 'sell'")
        
        # Cross-validate with quantity
        if 'quantity' in record and 'action' in record:
            try:
                quantity = float(record['quantity'])
                action = record['action']
                
                if action == 'buy' and quantity <= 0:
                    errors.append("Buy action requires positive quantity")
                elif action == 'sell' and quantity <= 0:
                    errors.append("Sell action requires positive quantity")
            except (ValueError, TypeError):
                pass  # Quantity validation will catch this
        
        return errors
    
    def _validate_date(self, value: Any, record: Dict[str, Any]) -> List[str]:
        """Validate date field"""
        errors = []
        
        if not value:
            errors.append("Date is required")
            return errors
        
        normalized_dt = self._coerce_to_datetime(value)

        if normalized_dt is None:
            # Provide a clearer error depending on the payload type
            if isinstance(value, dict):
                errors.append("Date envelope is missing required fields (utc/epochMs)")
            else:
                errors.append("Date must be a valid ISO string or DateEnvelope")
            return errors
        
        # Ensure timezone awareness (treat as UTC if naive)
        if normalized_dt.tzinfo is None:
            normalized_dt = normalized_dt.replace(tzinfo=timezone.utc)
            
            # Check if date is reasonable (not too far in past/future)
        now = datetime.now(timezone.utc)
        if normalized_dt.year < 1900:
                errors.append("Date too far in the past")
        elif normalized_dt.year > now.year + 1:
                errors.append("Date too far in the future")
        
        return errors
    
    def _validate_quantity(self, value: Any, record: Dict[str, Any]) -> List[str]:
        """Validate quantity field"""
        errors = []
        
        if value is None:
            errors.append("Quantity is required")
            return errors
        
        try:
            qty = float(value)
            
            if qty <= 0:
                errors.append("Quantity must be positive")
            elif qty > 1000000:  # Reasonable upper limit
                errors.append("Quantity too large (max 1,000,000)")
            elif qty < 0.0001:  # Reasonable lower limit
                errors.append("Quantity too small (min 0.0001)")
                
        except (ValueError, TypeError):
            errors.append(f"Invalid quantity: {value}")
        
        return errors

    def _coerce_to_datetime(self, value: Any) -> Optional[datetime]:
        """
        Convert supported date inputs (ISO string or DateEnvelope) into datetime.
        """
        if value is None:
            return None

        if isinstance(value, datetime):
            return value

        try:
            normalized = self.date_normalizer.normalize_input_payload({'date': value})
            candidate = normalized.get('date') if isinstance(normalized, dict) else None
            if isinstance(candidate, datetime):
                return candidate
        except Exception as exc:
            logger.debug(f"Failed to normalize date value '{value}': {exc}")

        return None
    
    def _validate_price(self, value: Any, record: Dict[str, Any]) -> List[str]:
        """Validate price field"""
        errors = []
        
        if value is None:
            errors.append("Price is required")
            return errors
        
        try:
            price = float(value)
            
            if price <= 0:
                errors.append("Price must be positive")
            elif price > 1000000:  # Reasonable upper limit
                errors.append("Price too high (max 1,000,000)")
            elif price < 0.0001:  # Reasonable lower limit
                errors.append("Price too low (min 0.0001)")
                
        except (ValueError, TypeError):
            errors.append(f"Invalid price: {value}")
        
        return errors
    
    def _validate_fee(self, value: Any, record: Dict[str, Any]) -> List[str]:
        """Validate fee field"""
        errors = []
        
        if value is None:
            return errors  # Fee is optional
        
        try:
            fee = float(value)
            
            if fee < 0:
                errors.append("Fee cannot be negative")
            elif fee > 10000:  # Reasonable upper limit
                errors.append("Fee too high (max 10,000)")
                
        except (ValueError, TypeError):
            errors.append(f"Invalid fee: {value}")
        
        return errors
    
    def _validate_external_id(self, value: Any, record: Dict[str, Any]) -> List[str]:
        """Validate external_id field"""
        errors = []
        
        if not value or not isinstance(value, str):
            errors.append("External ID is required")
        elif len(value.strip()) == 0:
            errors.append("External ID cannot be empty")
        elif len(value) > 100:
            errors.append("External ID too long (max 100 characters)")
        
        return errors
    
    def _validate_source(self, value: Any, record: Dict[str, Any]) -> List[str]:
        """Validate source field"""
        errors = []
        
        if not value or not isinstance(value, str):
            errors.append("Source is required")
        elif len(value.strip()) == 0:
            errors.append("Source cannot be empty")
        elif len(value) > 50:
            errors.append("Source too long (max 50 characters)")
        
        return errors
    
    def get_validation_summary(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get a summary of validation results.
        
        Args:
            result: Result from validate_records
            
        Returns:
            Dict[str, Any]: Validation summary
        """
        total = result.get('total_records', 0)
        valid = result.get('valid_count', 0)
        invalid = result.get('invalid_count', 0)
        
        # Categorize errors by type
        error_categories = {}
        for error_info in result.get('validation_errors', []):
            for error in error_info.get('errors', []):
                error_type = error.split(':')[0] if ':' in error else 'General'
                error_categories[error_type] = error_categories.get(error_type, 0) + 1
        
        return {
            'total_records': total,
            'valid_records': valid,
            'invalid_records': invalid,
            'validation_rate': result.get('validation_rate', 0),
            'error_categories': error_categories,
            'has_errors': invalid > 0,
            'is_valid': invalid == 0
        }
    
    def validate_business_rules(self, records: List[Dict[str, Any]]) -> List[str]:
        """
        Validate business rules across all records.
        
        Args:
            records: List of records to validate
            
        Returns:
            List[str]: List of business rule violations
        """
        violations = []
        
        # Check for duplicate external IDs within the batch
        external_ids = [r.get('external_id') for r in records if r.get('external_id')]
        if len(external_ids) != len(set(external_ids)):
            violations.append("Duplicate external IDs found within the batch")
        
        # Check for suspicious patterns
        symbols = [r.get('symbol') for r in records if r.get('symbol')]
        if len(set(symbols)) == 1 and len(records) > 100:
            violations.append("All records have the same symbol - possible data issue")
        
        # Check for date consistency
        dates = [r.get('date') for r in records if r.get('date')]
        if dates:
            try:
                parsed_dates = [datetime.fromisoformat(d.replace('Z', '+00:00')) for d in dates]
                date_range = max(parsed_dates) - min(parsed_dates)
                if date_range.days > 365:
                    violations.append("Date range spans more than one year")
            except ValueError:
                violations.append("Invalid date format in records")
        
        return violations
    
    def _check_missing_tickers(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Check which tickers are missing from the database.
        
        Args:
            records: List of valid records to check
            
        Returns:
            List[Dict[str, Any]]: List of missing ticker info with symbol and currency
        """
        logger.info(f"🔍 _check_missing_tickers called with {len(records)} records")
        
        if not self.db_session:
            logger.warning("No database session provided - skipping ticker validation")
            return []
        
        try:
            # Get unique symbols with currency info from records
            symbol_currency_map = {}
            for record in records:
                symbol = record.get('symbol')
                currency = record.get('currency', 'USD')  # Default to USD
                if symbol:
                    symbol_currency_map[symbol] = currency
            
            symbols = list(symbol_currency_map.keys())
            logger.info(f"📊 Found {len(symbols)} unique symbols: {symbols[:10]}...")
            
            if not symbols:
                logger.info("No symbols found in records")
                return []
            
            # Query existing tickers
            if not Ticker:
                logger.warning("Ticker model not available - skipping ticker validation")
                return []
            
            # Load ticker cache if not loaded
            if not hasattr(self, 'ticker_cache') or self.ticker_cache is None:
                self._load_ticker_cache()
            
            # Use cache if available
            if hasattr(self, 'ticker_cache') and self.ticker_cache:
                logger.info(f"🔍 Using ticker cache for {len(symbols)} symbols")
                existing_symbols = set(self.ticker_cache.keys())
                missing_tickers = []
                for symbol in symbols:
                    if symbol not in existing_symbols:
                        missing_tickers.append({
                            'symbol': symbol,
                            'currency': symbol_currency_map[symbol]
                        })
                logger.info(f"✅ Found {len(missing_tickers)} missing tickers: {[t['symbol'] for t in missing_tickers]}")
                return missing_tickers
            
            logger.info(f"🔍 Querying database for {len(symbols)} symbols")
            existing_tickers = self.db_session.query(Ticker.symbol).filter(
                Ticker.symbol.in_(symbols)
            ).all()
            logger.info(f"📊 Found {len(existing_tickers)} existing tickers in DB")
            
            existing_symbols = {ticker.symbol for ticker in existing_tickers}
            missing_tickers = []
            for symbol in symbols:
                if symbol not in existing_symbols:
                    missing_tickers.append({
                        'symbol': symbol,
                        'currency': symbol_currency_map[symbol]
                    })
            
            logger.info(f"✅ Found {len(missing_tickers)} missing tickers: {[t['symbol'] for t in missing_tickers]}")
            return missing_tickers
            
        except Exception as e:
            logger.error(f"❌ Failed to check missing tickers: {str(e)}")
            import traceback
            logger.error(f"📋 Traceback: {traceback.format_exc()}")
            return []
    
    def _load_ticker_cache(self):
        """
        Load ticker cache from database.
        
        This method loads all tickers into memory for faster validation.
        """
        try:
            if not self.db_session or not Ticker:
                logger.warning("Cannot load ticker cache - no database session or Ticker model")
                self.ticker_cache = None
                return
            
            logger.info("🔄 Loading ticker cache from database...")
            tickers = self.db_session.query(Ticker).all()
            
            # Create cache as dict with symbol as key
            self.ticker_cache = {ticker.symbol: ticker for ticker in tickers}
            logger.info(f"✅ Loaded {len(self.ticker_cache)} tickers into cache")
            
        except Exception as e:
            logger.error(f"❌ Failed to load ticker cache: {str(e)}")
            self.ticker_cache = None

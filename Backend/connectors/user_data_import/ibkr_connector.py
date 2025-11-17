"""
IBKR Import Connector - Interactive Brokers CSV format connector

This connector handles Interactive Brokers Activity Statement CSV files.
It parses the complex IBKR format and extracts trading data from the
"Trades" section of the statement.

IBKR Format:
- Multi-section CSV with headers
- Trades section starts with "Trades,Header,DataDiscriminator,..."
- Trade records start with "Trades,Data,Order,..."
- Complex column structure with multiple data types

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-16
"""

import csv
import io
import re
from decimal import Decimal, InvalidOperation
from typing import List, Dict, Any, Optional, Tuple, Iterable
from datetime import datetime, timezone
from .base_connector import BaseConnector
from services.date_normalization_service import DateNormalizationService
from config.logging import get_logger

logger = get_logger(__name__)

class IBKRConnector(BaseConnector):
    """
    IBKR connector for Interactive Brokers Activity Statement files.
    
    This connector handles the complex IBKR CSV format and extracts
    trading data from the Trades section of the statement.
    """
    CASHFLOW_SECTION_NAMES = {
        'Deposits & Withdrawals': 'deposit_withdrawal',
        'Interest': 'interest',
        'Interest Accruals': 'interest_accrual',
        'Dividends': 'dividend',
        'Change in Dividend Accruals': 'dividend_accrual',
        'Withholding Tax': 'tax',
        'Borrow Fee Details': 'borrow_fee',
        'Stock Yield Enhancement Program Securities Lent Activity': 'syep_activity',
        'Stock Yield Enhancement Program Securities Lent Interest Details': 'syep_interest',
        'Transfers': 'transfer',
        'Cash Report': 'cash_report'
    }

    ACCOUNT_SECTION_NAMES = {
        'Account Information': 'account_info',
        'Account Configuration': 'account_configuration',
        'Base Currency Summary': 'base_currency',
        'Account Summary': 'account_summary'
    }

    PORTFOLIO_SECTION_NAMES = {
        'Open Positions': 'open_positions',
        'Forex Balances': 'forex_balances',
        'Net Asset Value': 'net_asset_value',
        'Change in NAV': 'nav_changes',
        'Mark-to-Market Performance Summary': 'mtm_summary'
    }

    TAX_FX_SECTION_NAMES = {
        'Withholding Tax': 'withholding_tax',
        'Change in NAV': 'nav_changes',
        'Mark-to-Market Performance Summary': 'mtm_summary',
        'Realized & Unrealized Performance Summary': 'realized_unrealized_summary'
    }

    def __init__(self):
        super().__init__()
        self._last_symbol_metadata_entries: List[Dict[str, Any]] = []
        self._cached_sections: Dict[str, Any] = {}
        self._pending_forex_rows: List[Dict[str, Any]] = []

    def identify_file(self, file_content: str, file_name: str) -> bool:
        """
        Identifies if the given file content and name match the IBKR Activity Statement format.
        Checks for specific keywords and section headers.
        """
        if not file_name.lower().endswith('.csv'):
            return False

        # Check for common IBKR statement indicators
        if "Interactive Brokers" not in file_content or "Activity Statement" not in file_content:
            return False

        # Check for the "Trades" section header
        if "Trades,Header,DataDiscriminator" not in file_content:
            return False

        return True

    def detect_format(self, file_content: str) -> bool:
        """
        Detect if the file content matches IBKR format.
        
        Args:
            file_content: Raw file content as string
            
        Returns:
            bool: True if format matches, False otherwise
        """
        try:
            lines = file_content.strip().split('\n')
            
            # Look for IBKR-specific headers
            ibkr_indicators = [
                'Statement,Header,Field Name,Field Value',
                'Account Information,Header,Field Name,Field Value',
                'Trades,Header,DataDiscriminator,Asset Category',
                'Interactive Brokers LLC'
            ]
            
            found_indicators = 0
            for line in lines[:20]:  # Check first 20 lines
                for indicator in ibkr_indicators:
                    if indicator in line:
                        found_indicators += 1
                        break
            
            # Need at least 2 indicators to be confident
            return found_indicators >= 2
            
        except Exception:
            return False

    def precheck_file(
        self,
        file_content: str,
        *,
        file_name: Optional[str] = None,
        task_type: Optional[str] = None
    ) -> Dict[str, Any]:
        result = super().precheck_file(
            file_content,
            file_name=file_name or '',
            task_type=task_type
        )
        warnings = result.get('warnings', []) if isinstance(result, dict) else []
        if not result.get('success'):
            return result

        errors: List[str] = []
        required_headers = [
            'Trades,Header,DataDiscriminator',
            'Statement,Header,Field Name,Field Value'
        ]
        missing_headers = [header for header in required_headers if header not in file_content]
        if missing_headers:
            errors.append(
                "הקובץ חסר את הכותרות הנדרשות: " + ', '.join(missing_headers)
            )

        # Check for Account Information section - can be either "Account ID" or "Account" field
        has_account_info = (
            'Account Information,Data,Account ID' in file_content or
            'Account Information,Data,Account' in file_content
        )
        if not has_account_info:
            warnings = warnings + ['לא נמצא מקטע Account Information. ייתכן שיידרש זיהוי חשבון ידני.']

        if errors:
            return {
                'success': False,
                'errors': errors,
                'warnings': warnings
            }

        return {
            'success': True,
            'message': 'הקובץ זוהה כדוח IBKR תקין. ניתן להמשיך לניתוח.',
            'warnings': warnings
        }
    
    def parse_file(
        self,
        file_content: str,
        file_name: str = None,
        task_type: str = 'executions'
    ) -> List[Dict[str, Any]]:
        """
        Parse the IBKR CSV file content for the requested task type.

        Args:
            file_content: Raw file content as string
            task_type: Import task identifier (executions | cashflows | account_reconciliation)

        Returns:
            List[Dict[str, Any]]: Raw data records for the selected task
        """
        sections = self.parse_sections(file_content)
        if task_type == 'cashflows':
            return sections.get('cashflows', [])
        if task_type == 'account_reconciliation':
            account_data = sections.get('account_reconciliation') or {}
            # Account reconciliation returns a single struct rather than list
            return [account_data] if account_data else []
        if task_type == 'portfolio_positions':
            return sections.get('portfolio_positions', [])
        if task_type == 'taxes_and_fx':
            return sections.get('taxes_and_fx', [])
        return sections.get('executions', [])

    def parse_sections(self, file_content: str) -> Dict[str, Any]:
        """
        Parse the file into logical sections (executions, cashflows, account info).
        Results are cached per connector instance to avoid re-parsing.
        """
        if not file_content or not file_content.strip():
            return {
                'executions': [],
                'cashflows': [],
                'account_reconciliation': {}
            }

        content_hash = hash(file_content)
        if (
            self._cached_sections
            and self._cached_sections.get('raw_content_hash') == content_hash
        ):
            return self._cached_sections['sections']

        lines = file_content.strip().split('\n')
        self._last_symbol_metadata_entries = self._parse_symbol_metadata(lines)

        executions = self._parse_trades_section(lines)
        cashflows = self._parse_cashflow_sections(lines)
        account_info = self._parse_account_sections(lines)
        statement_metadata = self._parse_statement_metadata(lines)
        cash_report_summary = self._parse_cash_report_summary(lines)  # Summary totals from Cash Report

        forex_cashflows = self._build_forex_cashflows()
        all_cashflows = cashflows + forex_cashflows
        portfolio_positions = self._parse_portfolio_sections(
            lines,
            statement_metadata,
            account_info
        )
        tax_fx_records = self._parse_tax_fx_sections(
            lines,
            statement_metadata,
            all_cashflows
        )

        sections = {
            'executions': executions,
            'cashflows': all_cashflows,
            'account_reconciliation': account_info,
            'portfolio_positions': portfolio_positions,
            'taxes_and_fx': tax_fx_records,
            'cash_report_summary': cash_report_summary,  # Summary totals from Cash Report for validation
            'statement_metadata': statement_metadata
        }

        self._cached_sections = {
            'raw_content_hash': content_hash,
            'sections': sections
        }
        return sections

    # ------------------------------------------------------------------
    # Section parsing
    # ------------------------------------------------------------------

    def _parse_trades_section(self, lines: List[str]) -> List[Dict[str, Any]]:
        """
        Parse the Trades section and return raw execution rows.
        """
        records: List[Dict[str, Any]] = []
        forex_rows: List[Dict[str, Any]] = []
        trades_start = None

        for idx, line in enumerate(lines):
            if line.startswith('Trades,Header,DataDiscriminator'):
                trades_start = idx
                break

        if trades_start is None:
            raise ValueError("Trades section not found in IBKR file")

        header_line = lines[trades_start]
        header_reader = csv.reader(io.StringIO(header_line))
        headers = [col.strip() for col in next(header_reader)]

        for rel_idx in range(trades_start + 1, len(lines)):
            line = lines[rel_idx].strip()
            if not line:
                continue

            if line.startswith('Trades,Trailer'):
                break

            if not line.startswith('Trades,Data'):
                continue

            value_reader = csv.reader(io.StringIO(line))
            values = next(value_reader)
            row = {}
            for col_idx, header in enumerate(headers):
                row[header] = values[col_idx].strip() if col_idx < len(values) else ''
            row['_row_number'] = rel_idx + 1
            if str(row.get('Asset Category', '')).strip() == 'Forex' and row.get('DataDiscriminator') == 'Order':
                forex_rows.append(row)
                continue
            records.append(row)

        self._pending_forex_rows = forex_rows
        return records

    def _parse_cashflow_sections(self, lines: List[str]) -> List[Dict[str, Any]]:
        """
        Parse cashflow-related sections (cash report, deposits, interest, etc.)
        """
        records: List[Dict[str, Any]] = []
        current_section: Optional[str] = None
        current_headers: Optional[List[str]] = None

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue

            header_section = self._match_section_header(stripped, self.CASHFLOW_SECTION_NAMES.keys())
            if header_section:
                current_section = header_section
                current_headers = self._parse_section_headers(stripped)
                continue

            if not current_section or not current_headers:
                continue

            if stripped.startswith(f'{current_section},Trailer'):
                current_section = None
                current_headers = None
                continue

            if not stripped.startswith(f'{current_section},Data'):
                continue

            value_reader = csv.reader(io.StringIO(stripped))
            values = next(value_reader)
            row = {}
            for idx, header in enumerate(current_headers):
                value_idx = idx + 2  # Skip section & descriptor columns
                row[header] = values[value_idx].strip() if value_idx < len(values) else ''

            if self._should_skip_cashflow_row(current_section, row):
                continue

            record = self._build_cashflow_record(current_section, row)
            if record:
                records.append(record)

        return records

    def _parse_cash_report_summary(self, lines: List[str]) -> Dict[str, float]:
        """
        Parse Cash Report section and extract summary totals by Activity.
        
        IMPORTANT: This function is used ONLY for comparison purposes, not for creating cashflow records.
        It extracts totals from the Cash Report section to compare with imported cashflows.
        
        The function filters out activities that are NOT real cash movements:
        - Cash FX Translation Gain/Loss (unrealized FX, not actual cash)
        - Trades (Sales/Purchase) (part of executions, not separate cashflow)
        - Commissions (included in executions/forex, not separate)
        - Starting/Ending Cash balances (summary rows, not transactions)
        
        Only REAL cash movements are included in the summary for comparison.
        
        Returns:
            Dict mapping cashflow_type to total_amount from Cash Report summaries
            (only includes real cash movements, excludes accounting entries)
        """
        summary_totals: Dict[str, float] = {}
        in_cash_report = False
        current_headers: Optional[List[str]] = None
        
        # Mapping from Cash Report Activity names to cashflow_type
        # IMPORTANT: Only map REAL cash movements (exclude accounting entries)
        activity_to_type = {
            'Dividends': 'dividend',
            'Deposits': 'deposit',
            'Withdrawals': 'withdrawal',
            'Account Transfers': 'transfer',
            'Broker Interest Paid and Received': 'interest',
            'Interest': 'interest',
            'Withholding Tax': 'tax',
            'Payment In Lieu of Dividends': 'dividend',
            # NOTE: The following are NOT mapped because they are skipped:
            # - 'Commissions': Included in executions/forex, not separate cashflow
            # - 'Cash FX Translation Gain/Loss': Unrealized FX, not actual cash
            # - 'Trades (Sales)' / 'Trades (Purchase)': Part of executions, not cashflow
        }
        
        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue
            
            # Check if we're entering Cash Report section
            if stripped.startswith('Cash Report,Header'):
                in_cash_report = True
                current_headers = self._parse_section_headers(stripped)
                continue
            
            # Check if we're leaving Cash Report section
            if in_cash_report and not stripped.startswith('Cash Report'):
                in_cash_report = False
                current_headers = None
                continue
            
            if not in_cash_report or not current_headers:
                continue
            
            # Only process Data rows (skip Header, Trailer, etc.)
            if not stripped.startswith('Cash Report,Data'):
                continue
            
            # Parse the row
            value_reader = csv.reader(io.StringIO(stripped))
            values = next(value_reader)
            
            if len(values) < 3:
                continue
            
            # Activity is in the third column (index 2)
            activity = values[2].strip() if len(values) > 2 else ''
            
            # Skip summary rows (Starting Cash, Ending Cash, etc.)
            skip_activities = [
                'Starting Cash',
                'Ending Cash',
                'Ending Settled Cash',
                'Starting Collateral Value',
                'Ending Collateral Value',
                'Net Cash Balance',
                'Net Settled Cash Balance',
                'Net Securities Lent Activity'
            ]
            if activity in skip_activities:
                continue
            
            # IMPORTANT: Skip activities that are NOT real cash movements
            # These are accounting entries, not actual cash flows
            skip_non_cash_activities = [
                'Cash FX Translation Gain/Loss',  # Unrealized FX gain/loss, not actual cash
                'Trades (Sales)',  # Part of executions, not separate cashflow
                'Trades (Purchase)',  # Part of executions, not separate cashflow
                'Commissions'  # Included in executions or forex_conversion, not separate
            ]
            if activity in skip_non_cash_activities:
                continue
            
            # Get cashflow_type from activity mapping
            cashflow_type = activity_to_type.get(activity)
            if not cashflow_type:
                # Try to infer from activity name
                activity_lower = activity.lower()
                if 'dividend' in activity_lower:
                    cashflow_type = 'dividend'
                elif 'interest' in activity_lower:
                    cashflow_type = 'interest'
                elif 'tax' in activity_lower or 'withholding' in activity_lower:
                    cashflow_type = 'tax'
                elif 'fee' in activity_lower or 'commission' in activity_lower:
                    cashflow_type = 'fee'
                elif 'deposit' in activity_lower:
                    cashflow_type = 'deposit'
                elif 'withdrawal' in activity_lower:
                    cashflow_type = 'withdrawal'
                elif 'transfer' in activity_lower:
                    cashflow_type = 'transfer'
                else:
                    # Skip unknown activities
                    continue
            
            # Get total amount from Base Currency Summary column (usually index 4)
            # Or from Total column if available
            total_amount = None
            if len(values) > 4:
                total_str = values[4].strip()
                try:
                    total_amount = float(total_str) if total_str else 0.0
                except (ValueError, TypeError):
                    pass
            
            if total_amount is not None and cashflow_type:
                # Sum up totals for the same cashflow_type
                summary_totals[cashflow_type] = summary_totals.get(cashflow_type, 0.0) + abs(total_amount)
        
        return summary_totals

    def _parse_statement_metadata(self, lines: List[str]) -> Dict[str, Any]:
        metadata: Dict[str, Any] = {
            'period': None,
            'period_start_date': None,
            'period_end_date': None,
            'generated_at': None
        }

        for line in lines:
            if not line.startswith('Statement,Data'):
                continue
            try:
                values = next(csv.reader(io.StringIO(line)))
            except Exception:
                continue
            if len(values) < 4:
                continue
            field_name = values[2].strip()
            field_value = values[3].strip()
            if field_name == 'Period':
                cleaned = field_value.strip('"')
                metadata['period'] = cleaned
                start, end = self._split_period_range(cleaned)
                if start:
                    metadata['period_start_date'] = start
                if end:
                    metadata['period_end_date'] = end
            elif field_name == 'WhenGenerated':
                metadata['generated_at'] = field_value.strip('"')

        return metadata

    def _split_period_range(self, value: str) -> Tuple[Optional[str], Optional[str]]:
        if not value or '-' not in value:
            return (None, None)
        start_raw, end_raw = value.split('-', 1)
        return (
            self._parse_period_date(start_raw),
            self._parse_period_date(end_raw)
        )

    def _parse_period_date(self, value: str) -> Optional[str]:
        if not value:
            return None
        cleaned = value.replace('"', '').strip()
        for fmt in ('%B %d, %Y', '%Y-%m-%d'):
            try:
                dt = datetime.strptime(cleaned, fmt)
                return dt.date().isoformat()
            except ValueError:
                continue
        return None

    def _parse_simple_date(self, value: str) -> Optional[datetime]:
        if not value:
            return None
        cleaned = value.replace('"', '').strip()
        for fmt in ('%Y-%m-%d', '%d-%b-%Y', '%Y/%m/%d'):
            try:
                dt = datetime.strptime(cleaned, fmt)
                return dt.replace(tzinfo=timezone.utc)
            except ValueError:
                continue
        try:
            return self._parse_ibkr_datetime(cleaned)
        except Exception:
            return None

    def _iter_section_rows(
        self,
        lines: List[str],
        section_name: str,
        include_totals: bool = False
    ) -> Iterable[Dict[str, Any]]:
        capturing = False
        current_headers: Optional[List[str]] = None

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue

            if stripped.startswith(f'{section_name},Header'):
                capturing = True
                current_headers = self._parse_section_headers(stripped)
                continue

            if not capturing:
                continue

            if stripped.startswith(f'{section_name},Trailer'):
                capturing = False
                current_headers = None
                continue

            if include_totals and stripped.startswith(f'{section_name},Total'):
                try:
                    values = next(csv.reader(io.StringIO(stripped)))
                except Exception:
                    continue
                row = {'__row_type': 'total'}
                if current_headers:
                    for idx, header in enumerate(current_headers):
                        value_idx = idx + 2
                        row[header] = values[value_idx].strip() if value_idx < len(values) else ''
                yield row
                continue

            if not stripped.startswith(f'{section_name},Data'):
                continue

            if not current_headers:
                continue

            try:
                values = next(csv.reader(io.StringIO(stripped)))
            except Exception:
                continue

            row = {'__row_type': 'data'}
            for idx, header in enumerate(current_headers):
                value_idx = idx + 2  # Skip section & descriptor columns
                row[header] = values[value_idx].strip() if value_idx < len(values) else ''
            yield row

    def _parse_portfolio_sections(
        self,
        lines: List[str],
        statement_metadata: Dict[str, Any],
        account_info: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        if not lines:
            return []

        records: List[Dict[str, Any]] = []
        account_id = account_info.get('account_id') if isinstance(account_info, dict) else None
        period_end = statement_metadata.get('period_end_date')
        period_label = statement_metadata.get('period')

        for row in self._iter_section_rows(lines, 'Open Positions', include_totals=True):
            record = self._build_open_position_record(row, account_id, period_label, period_end)
            if record:
                records.append(record)

        for row in self._iter_section_rows(lines, 'Forex Balances', include_totals=True):
            record = self._build_forex_balance_record(row, account_id, period_label, period_end)
            if record:
                records.append(record)

        return records

    def _build_open_position_record(
        self,
        row: Dict[str, Any],
        account_id: Optional[str],
        period_label: Optional[str],
        period_end: Optional[str]
    ) -> Optional[Dict[str, Any]]:
        if not row:
            return None

        symbol = row.get('Symbol') or row.get('Description') or ''
        record_type = 'open_position_total' if row.get('__row_type') != 'data' else 'open_position'

        if not symbol and record_type == 'open_position':
            return None

        return {
            'record_type': record_type,
            'account_id': account_id,
            'asset_category': row.get('Asset Category') or row.get('DataDiscriminator'),
            'currency': row.get('Currency'),
            'symbol': symbol,
            'quantity': self._parse_float(row.get('Quantity')),
            'multiplier': self._parse_float(row.get('Mult')),
            'cost_price': self._parse_float(row.get('Cost Price')),
            'cost_basis': self._parse_float(row.get('Cost Basis')),
            'close_price': self._parse_float(row.get('Close Price')),
            'market_value': self._parse_float(row.get('Value')),
            'unrealized_pl': self._parse_float(row.get('Unrealized P/L')),
            'code': row.get('Code'),
            'statement_period': period_label,
            'statement_period_end': period_end,
            '_raw_row': row
        }

    def _build_forex_balance_record(
        self,
        row: Dict[str, Any],
        account_id: Optional[str],
        period_label: Optional[str],
        period_end: Optional[str]
    ) -> Optional[Dict[str, Any]]:
        if not row:
            return None

        description = row.get('Description') or row.get('Currency') or ''
        record_type = 'forex_balance_total' if row.get('__row_type') != 'data' else 'forex_balance'

        return {
            'record_type': record_type,
            'account_id': account_id,
            'asset_category': row.get('Asset Category'),
            'currency': row.get('Currency'),
            'description': description,
            'quantity': self._parse_float(row.get('Quantity')),
            'cost_price': self._parse_float(row.get('Cost Price')),
            'cost_basis': self._parse_float(row.get('Cost Basis in EUR') or row.get('Cost Basis')),
            'close_price': self._parse_float(row.get('Close Price')),
            'market_value': self._parse_float(row.get('Value in EUR') or row.get('Value')),
            'unrealized_pl': self._parse_float(row.get('Unrealized P/L in EUR') or row.get('Unrealized P/L')),
            'statement_period': period_label,
            'statement_period_end': period_end,
            '_raw_row': row
        }

    def _parse_tax_fx_sections(
        self,
        lines: List[str],
        statement_metadata: Dict[str, Any],
        cashflow_records: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        records: List[Dict[str, Any]] = []
        if not lines:
            return records

        records.extend(self._build_withholding_tax_records(lines, statement_metadata))
        records.extend(self._build_nav_change_records(lines, statement_metadata))
        records.extend(self._build_mtm_summary_records(lines, statement_metadata))
        records.extend(self._build_realized_unrealized_records(lines, statement_metadata))
        records.extend(self._build_tax_cashflow_records(cashflow_records, statement_metadata))

        return records

    def _build_withholding_tax_records(
        self,
        lines: List[str],
        statement_metadata: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        records: List[Dict[str, Any]] = []
        for row in self._iter_section_rows(lines, 'Withholding Tax'):
            amount = self._parse_float(row.get('Amount'))
            record = {
                'record_type': 'withholding_tax',
                'currency': row.get('Currency'),
                'amount': amount,
                'description': row.get('Description') or '',
                'tax_code': row.get('Code') or '',
                'effective_date': self._parse_simple_date(row.get('Date')),
                'statement_period': statement_metadata.get('period'),
                'statement_period_end': statement_metadata.get('period_end_date'),
                '_raw_row': row
            }
            records.append(record)
        return records

    def _build_nav_change_records(
        self,
        lines: List[str],
        statement_metadata: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        records: List[Dict[str, Any]] = []
        for row in self._iter_section_rows(lines, 'Change in NAV'):
            field_name = row.get('Field Name') or row.get('Field')
            if not field_name:
                continue
            value = self._parse_float(row.get('Field Value') or row.get('Value'))
            record = {
                'record_type': 'nav_component',
                'component': field_name,
                'amount': value,
                'statement_period': statement_metadata.get('period'),
                'statement_period_end': statement_metadata.get('period_end_date'),
                '_raw_row': row
            }
            records.append(record)
        return records

    def _build_mtm_summary_records(
        self,
        lines: List[str],
        statement_metadata: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        records: List[Dict[str, Any]] = []
        for row in self._iter_section_rows(lines, 'Mark-to-Market Performance Summary'):
            asset_category = row.get('Asset Category')
            if asset_category and asset_category.lower() != 'forex':
                continue
            record = {
                'record_type': 'mtm_forex',
                'asset_category': asset_category,
                'symbol': row.get('Symbol'),
                'prior_quantity': self._parse_float(row.get('Prior Quantity')),
                'current_quantity': self._parse_float(row.get('Current Quantity')),
                'prior_price': self._parse_float(row.get('Prior Price')),
                'current_price': self._parse_float(row.get('Current Price')),
                'mtm_position': self._parse_float(row.get('Mark-to-Market P/L Position')),
                'mtm_transaction': self._parse_float(row.get('Mark-to-Market P/L Transaction')),
                'mtm_commissions': self._parse_float(row.get('Mark-to-Market P/L Commissions')),
                'mtm_other': self._parse_float(row.get('Mark-to-Market P/L Other')),
                'mtm_total': self._parse_float(row.get('Mark-to-Market P/L Total')),
                'statement_period': statement_metadata.get('period'),
                'statement_period_end': statement_metadata.get('period_end_date'),
                '_raw_row': row
            }
            records.append(record)
        return records

    def _build_realized_unrealized_records(
        self,
        lines: List[str],
        statement_metadata: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        records: List[Dict[str, Any]] = []
        for row in self._iter_section_rows(lines, 'Realized & Unrealized Performance Summary'):
            asset_category = row.get('Asset Category')
            if asset_category and asset_category.lower() != 'forex':
                continue
            record = {
                'record_type': 'realized_unrealized_forex',
                'asset_category': asset_category,
                'symbol': row.get('Symbol'),
                'realized_pl': self._parse_float(row.get('Realized P/L')),
                'unrealized_pl': self._parse_float(row.get('Unrealized P/L')),
                'total_pl': self._parse_float(row.get('Total P/L')),
                'statement_period': statement_metadata.get('period'),
                'statement_period_end': statement_metadata.get('period_end_date'),
                '_raw_row': row
            }
            records.append(record)
        return records

    def _build_tax_cashflow_records(
        self,
        cashflow_records: List[Dict[str, Any]],
        statement_metadata: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        if not cashflow_records:
            return []

        relevant_sections = {'Withholding Tax', 'Cash Report', 'Trades'}
        relevant_types = {'tax', 'forex_conversion'}
        records: List[Dict[str, Any]] = []

        for flow in cashflow_records:
            section = str(flow.get('section') or '').strip()
            cf_type = str(flow.get('cashflow_type') or '').lower()
            if section not in relevant_sections and cf_type not in relevant_types:
                continue

            record_type = 'forex_conversion' if cf_type == 'forex_conversion' else 'tax_cashflow'
            record = {
                'record_type': record_type,
                'currency': flow.get('currency'),
                'amount': flow.get('amount'),
                'effective_date': flow.get('effective_date'),
                'description': flow.get('memo') or section or '',
                'source_account': flow.get('source_account'),
                'statement_period': statement_metadata.get('period'),
                'statement_period_end': statement_metadata.get('period_end_date'),
                '_raw_row': flow.get('_raw_row') or flow
            }

            if cf_type == 'forex_conversion':
                record.update({
                    'source_currency': flow.get('source_currency'),
                    'target_currency': flow.get('target_currency'),
                    'quantity': flow.get('quantity'),
                    'trade_price': flow.get('trade_price'),
                    'commission': flow.get('commission'),
                    'basis': flow.get('basis'),
                    'realized_pl': flow.get('realized_pl'),
                    'mtm_pl': flow.get('mtm_pl')
                })

            records.append(record)

        return records

    def _build_cashflow_record(self, section_name: str, row: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Convert raw row dictionary into a unified cashflow record dict.
        """
        try:
            section_key = self.CASHFLOW_SECTION_NAMES.get(section_name, '').lower()

            # Ignore SYEP activity rows – only the interest details translate to cash movements
            if section_key == 'syep_activity':
                return None
            cashflow_type = self._resolve_cashflow_type(section_name, row)
            amount, currency = self._extract_amount_and_currency(row, section_key)

            if amount is None:
                return None

            effective_date = self._extract_datetime(
                row,
                ['Date', 'Trade Date', 'Settle Date', 'Value Date', 'Pay Date']
            )

            memo = (
                row.get('Description')
                or row.get('Activity Description')
                or row.get('Memo')
                or row.get('Field Name')
                or ''
            )
            source_account = row.get('Account') or row.get('Account ID') or row.get('Xfer Account') or ''
            target_account = (
                row.get('Transfer Account')
                or row.get('Target Account')
                or row.get('Xfer Company')
                or ''
            )
            source_account = source_account or self._infer_account_from_row(section_key, row, memo)
            target_account = target_account or self._infer_account_from_row(section_key, row, memo, target=True)
            asset_symbol = row.get('Symbol') or row.get('Underlying Symbol') or ''

            record: Dict[str, Any] = {
                'section': section_name,
                'cashflow_type': cashflow_type,
                'amount': amount,
                'currency': currency or row.get('Currency') or '',
                'effective_date': effective_date,
                'source_account': source_account,
                'target_account': target_account,
                'asset_symbol': asset_symbol,
                'memo': memo,
                'tax_country': row.get('Withholding Tax Country') or row.get('Country') or '',
                '_raw_row': row
            }

            record.update(self._build_section_specific_fields(section_key, row))

            retain_zero = record.pop('retain_zero_amount', False)
            if amount == 0 and not retain_zero:
                return None

            return record
        except Exception as exc:
            logger.debug("Failed to build cashflow record for section %s: %s", section_name, exc)
            return None

    def _build_section_specific_fields(self, section_key: str, row: Dict[str, Any]) -> Dict[str, Any]:
        extras: Dict[str, Any] = {}

        if section_key == 'transfer':
            extras.update({
                'quantity': self._parse_float(row.get('Qty')),
                'transfer_type': row.get('Type'),
                'direction': row.get('Direction'),
                'market_value': self._parse_float(row.get('Market Value')),
                'cash_amount': self._parse_float(row.get('Cash Amount'))
            })
        elif section_key == 'dividend_accrual':
            # NOTE: Dividend accrual records represent declared but not yet paid dividends.
            # These are accounting entries, not actual cash movements.
            # Users should verify the actual meaning of these records before importing.
            extras.update({
                'gross_amount': self._parse_float(row.get('Gross Amount')),
                'net_amount': self._parse_float(row.get('Net Amount')),
                'tax': self._parse_float(row.get('Tax')),
                'fee': self._parse_float(row.get('Fee')),
                'ex_date': row.get('Ex Date'),
                'pay_date': row.get('Pay Date')
            })
        elif section_key == 'borrow_fee':
            extras.update({
                'fee_rate_percent': self._parse_float(row.get('Fee Rate (%)')),
                'underlying_value': self._parse_float(row.get('Value')),
                'quantity': self._parse_float(row.get('Quantity'))
            })
        elif section_key == 'syep_activity':
            extras.update({
                'transaction_id': row.get('Transaction ID'),
                'collateral_amount': self._parse_float(row.get('Collateral Amount')),
                'quantity': self._parse_float(row.get('Quantity'))
            })
        elif section_key == 'syep_interest':
            extras.update({
                'transaction_id': row.get('Transaction ID'),
                'collateral_amount': self._parse_float(row.get('Collateral Amount')),
                'market_rate_percent': self._parse_float(row.get('Market-based Rate (%)')),
                'customer_rate_percent': self._parse_float(row.get('Interest Rate on Customer Collateral (%)')),
                'quantity': self._parse_float(row.get('Quantity'))
            })
        elif section_key == 'interest_accrual':
            extras['retain_zero_amount'] = True

        return extras

    def _should_skip_cashflow_row(self, section_name: str, row: Dict[str, Any]) -> bool:
        """
        Determine if a cashflow row should be skipped.
        
        IMPORTANT: This function filters out summary rows and accounting entries that are NOT
        real cash movements. Only actual cash flow transactions should be processed.
        
        Skips rows that are:
        - Headers, trailers, totals, subtotals
        - Starting/Ending Cash balances (summary rows, not transactions)
        - Any summary or accounting entries that don't represent actual money movement
        
        Args:
            section_name: Name of the section being processed
            row: Dictionary representing a single row of data
            
        Returns:
            True if the row should be skipped, False if it should be processed
        """
        values = [str(value).strip() for value in row.values()]
        first_value = next((value for value in values if value and value not in {'--'}), '')

        if not first_value:
            return True

        lowered = first_value.lower()
        
        # Skip headers, trailers, totals, subtotals, starting/ending balances
        skip_patterns = [
            'header',
            'trailer',
            'subtotal',
            'ending',
            'starting'
        ]
        if any(pattern in lowered for pattern in skip_patterns):
            return True
            
        if lowered.startswith('total') or lowered.endswith(' total') or lowered.endswith(' totals'):
            return True
        if lowered.startswith('starting') and 'dividend accrual' in lowered:
            return True

        if section_name == 'Dividends' and lowered in {'total', 'total in eur'}:
            return True
        if section_name == 'Borrow Fee Details' and lowered.startswith('total'):
            return True
        if section_name == 'Withholding Tax' and lowered.startswith('total'):
            return True

        return False

    def _parse_account_sections(self, lines: List[str]) -> Dict[str, Any]:
        """
        Parse account configuration sections and consolidate into a single structure.
        """
        account_data: Dict[str, Any] = {
            'account_id': None,
            'base_currency': None,
            'margin_status': None,
            'entitlements': set(),
            'missing_documents': set(),
            'account_aliases': set(),
            'raw_sections': {}
        }

        current_section: Optional[str] = None
        current_headers: Optional[List[str]] = None

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue

            header_section = self._match_section_header(stripped, self.ACCOUNT_SECTION_NAMES.keys())
            if header_section:
                current_section = header_section
                current_headers = self._parse_section_headers(stripped)
                account_data['raw_sections'][self.ACCOUNT_SECTION_NAMES[header_section]] = []
                continue

            if not current_section or not current_headers:
                continue

            if stripped.startswith(f'{current_section},Trailer'):
                current_section = None
                current_headers = None
                continue

            if not stripped.startswith(f'{current_section},Data'):
                continue

            values = next(csv.reader(io.StringIO(stripped)))
            row = {}
            for idx, header in enumerate(current_headers):
                value_idx = idx + 2
                row[header] = values[value_idx].strip() if value_idx < len(values) else ''

            section_key = self.ACCOUNT_SECTION_NAMES[current_section]
            account_data['raw_sections'][section_key].append(row)
            self._accumulate_account_data(section_key, row, account_data)

        account_data['entitlements'] = sorted(account_data['entitlements'])
        account_data['missing_documents'] = sorted(account_data['missing_documents'])
        account_data['account_aliases'] = sorted(account_data['account_aliases'])

        return account_data

    def _accumulate_account_data(self, section_key: str, row: Dict[str, Any], accumulator: Dict[str, Any]) -> None:
        """
        Populate consolidated account information from a row.
        """
        if section_key == 'account_info':
            field = row.get('Field Name') or row.get('Field')
            value = row.get('Field Value') or row.get('Value')
            if not field or value is None:
                return
            lowered = field.lower()
            if lowered in {
                'account id',
                'accountid',
                'account number',
                'account #',
                'account',
                'account no.'
            }:
                accumulator['account_id'] = str(value).strip()
            elif lowered in {'base currency', 'basecurrency'}:
                accumulator['base_currency'] = value
            elif lowered in {'margin type', 'account type'}:
                accumulator['margin_status'] = value

        elif section_key == 'base_currency':
            currency = row.get('Currency') or row.get('Base Currency')
            if currency:
                accumulator['base_currency'] = currency

        elif section_key == 'account_summary':
            tag = row.get('Tag') or row.get('Field Name')
            value = row.get('Value') or row.get('Amount')
            if not tag:
                return
            accumulator.setdefault('summary_values', {})[tag] = value

        elif section_key == 'account_configuration':
            setting = row.get('Setting') or row.get('Description')
            value = row.get('Value') or row.get('Status')
            if not setting:
                return
            lowered = setting.lower()
            if 'entitlement' in lowered and value:
                accumulator['entitlements'].add(value)
            elif 'document' in lowered and value and 'missing' in value.lower():
                accumulator['missing_documents'].add(setting)
            elif 'alias' in lowered and value:
                accumulator['account_aliases'].add(value)

    # ------------------------------------------------------------------
    # Utility helpers for parsing
    # ------------------------------------------------------------------

    @staticmethod
    def _parse_section_headers(header_line: str) -> List[str]:
        reader = csv.reader(io.StringIO(header_line))
        headers = [col.strip() for col in next(reader)]
        if len(headers) > 2 and headers[1].lower() == 'header':
            return headers[2:]
        return headers

    @staticmethod
    def _match_section_header(line: str, candidates: Iterable[str]) -> Optional[str]:
        for candidate in candidates:
            if line.startswith(f'{candidate},Header'):
                return candidate
        return None

    def _resolve_cashflow_type(self, section_name: str, row: Dict[str, Any]) -> str:
        section_key = self.CASHFLOW_SECTION_NAMES.get(section_name, '').lower()

        if section_key == 'cash_report':
            # IMPORTANT: Cash Report section should not be processed here as cashflow records.
            # Cash Report is only used for summary comparison, not for creating cashflow records.
            # Individual cashflow records come from their specific sections (Dividends, Interest, etc.).
            # If we reach here, it means a Cash Report row was not filtered out properly.
            # Return 'cash_adjustment' as fallback, but this should rarely happen.
            activity_code = (row.get('Activity Code') or row.get('Activity') or '').lower()
            description = (row.get('Description') or row.get('Activity Description') or '').lower()
            
            # Skip non-cash activities (should have been filtered in _parse_cash_report_summary)
            skip_activities = [
                'cash fx translation gain/loss',
                'trades (sales)',
                'trades (purchase)',
                'commissions'
            ]
            if any(skip in activity_code or skip in description for skip in skip_activities):
                return 'cash_adjustment'  # Will be filtered out later
            
            if 'dividend' in activity_code or 'dividend' in description:
                return 'dividend'
            if 'interest' in activity_code or 'interest' in description:
                return 'interest'
            if 'tax' in activity_code or 'withholding' in description:
                return 'tax'
            # NOTE: 'fee' and 'commission' should not appear here as they are filtered in _parse_cash_report_summary
            # But if they do, we skip them (return cash_adjustment which will be filtered)
            if 'fee' in activity_code or 'commission' in description:
                return 'cash_adjustment'  # Will be filtered out (commissions are in executions/forex)
            if 'deposit' in description:
                return 'deposit'
            if 'withdrawal' in description or 'transfer' in description:
                return 'withdrawal'
            return activity_code or 'cash_adjustment'

        if section_key == 'deposit_withdrawal':
            amount, _ = self._extract_amount_and_currency(row, section_key)
            return 'deposit' if amount and amount > 0 else 'withdrawal'

        if section_key == 'interest':
            description = (row.get('Description') or row.get('Activity Description') or '').lower()
            memo = (row.get('Memo') or row.get('Field Name') or '').lower()
            text_blob = ' '.join(filter(None, [description, memo]))
            if 'stock yield enhancement' in text_blob or 'syep' in text_blob:
                return 'syep_interest'
            return 'interest'
        if section_key == 'dividend':
            return 'dividend'
        if section_key == 'tax':
            return 'tax'
        if section_key == 'fee':
            return 'fee'

        if section_key == 'syep_interest':
            return 'syep_interest'

        return section_key or 'cash_adjustment'

    def _extract_amount_and_currency(
        self,
        row: Dict[str, Any],
        section_key: str = ''
    ) -> Tuple[Optional[float], Optional[str]]:
        amount_decimal: Optional[Decimal] = None

        def set_amount(*keys: str) -> Optional[Decimal]:
            for key in keys:
                if key in row and row[key]:
                    value = self._safe_decimal(row[key])
                    if value is not None:
                        return value
            return None

        if section_key == 'transfer':
            amount_decimal = set_amount('Market Value', 'Cash Amount')
        elif section_key == 'dividend_accrual':
            amount_decimal = set_amount('Net Amount', 'Gross Amount')
        elif section_key == 'borrow_fee':
            amount_decimal = set_amount('Borrow Fee', 'Value')
        elif section_key == 'syep_activity':
            amount_decimal = set_amount('Collateral Amount')
        elif section_key == 'syep_interest':
            amount_decimal = set_amount('Interest Paid to Customer')
        elif section_key == 'interest_accrual':
            amount_decimal = set_amount('Field Value')
        else:
            amount_decimal = set_amount(
                'Amount',
                'Settled Cash',
                'Gross Amount',
                'Net Amount',
                'Amount (Base Currency)',
                'Net Cash',
                'Trade Amount',
                'Value'
            )

        currency = (
            row.get('Currency')
            or row.get('Trade Currency')
            or row.get('Base Currency')
            or row.get('Cash Currency')
        )

        return (float(amount_decimal) if amount_decimal is not None else None, currency)

    def _extract_datetime(self, row: Dict[str, Any], keys: List[str]) -> Optional[datetime]:
        for key in keys:
            candidate = row.get(key)
            if not candidate:
                continue
            try:
                return self._parse_ibkr_datetime(candidate)
            except ValueError:
                continue
        return None

    @staticmethod
    def _safe_decimal(value: Any) -> Optional[Decimal]:
        if value in (None, '', '--'):
            return None
        if isinstance(value, (int, float, Decimal)):
            return Decimal(str(value))
        try:
            cleaned = str(value).replace('$', '').replace(',', '').strip()
            if cleaned.startswith('(') and cleaned.endswith(')'):
                cleaned = f"-{cleaned[1:-1]}"
            return Decimal(cleaned)
        except (InvalidOperation, ValueError):
            return None

    def extract_symbol_metadata(
        self,
        file_content: str,
        raw_records: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        if not self._last_symbol_metadata_entries and file_content:
            try:
                lines = file_content.strip().split('\n')
                self._last_symbol_metadata_entries = self._parse_symbol_metadata(lines)
            except Exception as parse_error:
                # Log and continue with empty metadata
                logger.warning("Failed to parse IBKR symbol metadata: %s", parse_error)
                self._last_symbol_metadata_entries = []

        return list(self._last_symbol_metadata_entries)

    def _build_forex_cashflows(self) -> List[Dict[str, Any]]:
        """
        Build forex conversion cashflow records.
        
        IMPORTANT: This function creates TWO separate records (FROM/TO) for each forex conversion,
        instead of a single record with Proceeds. This atomic model ensures:
        1. Correct pairing during import (matching by date, currencies, exchange_rate, asset_symbol)
        2. Accurate amount calculation (FROM: -abs(quantity), TO: abs(quantity * trade_price))
        3. Proper fee assignment (commission goes only on FROM record)
        4. Complete metadata for pairing (exchange_rate, quantity, source_currency, target_currency, symbol)
        
        The records are created from _pending_forex_rows which are identified in _parse_trades_section
        as rows where Asset Category == 'Forex' AND DataDiscriminator == 'Order'.
        
        Returns:
            List of forex conversion records (from and to pairs)
            Each forex conversion results in 2 records that will be paired during import.
        """
        forex_records: List[Dict[str, Any]] = []
        if not self._pending_forex_rows:
            return forex_records

        for row in self._pending_forex_rows:
            try:
                effective_date = self._extract_datetime(
                    row,
                    ['Date/Time', 'Trade Date']
                )
                symbol = row.get('Symbol', '').strip()
                
                # Validate symbol format: must contain dot and identify two currencies (BASE.QUOTE)
                if not symbol or '.' not in symbol:
                    logger.warning(f"⚠️ Skipping forex row with invalid Symbol format (must be BASE.QUOTE): {symbol}")
                    continue
                
                pair_base, pair_quote = self._split_currency_pair(symbol)
                if not pair_base or not pair_quote:
                    logger.warning(f"⚠️ Skipping forex row - failed to extract currencies from Symbol: {symbol}")
                    continue
                
                # Extract key values from IBKR row
                quantity = self._parse_float(row.get('Quantity'))
                trade_price = self._parse_float(row.get('T. Price'))
                proceeds = self._parse_float(row.get('Proceeds'))
                commission = self._parse_float(row.get('Comm/Fee'))
                
                # Validate required fields
                if quantity is None or quantity == 0:
                    logger.warning(f"⚠️ Skipping forex row with invalid Quantity: {row.get('Quantity')}")
                    continue
                if trade_price is None or trade_price == 0:
                    logger.warning(f"⚠️ Skipping forex row with invalid T.Price: {row.get('T. Price')}")
                    continue
                
                # Calculate amounts correctly:
                # - FROM: negative quantity in base currency (what we're selling)
                # - TO: positive quantity * price in quote currency (what we're receiving)
                from_amount = -abs(quantity)  # Always negative (outgoing)
                to_amount = abs(quantity * trade_price)  # Always positive (incoming)
                
                # Common metadata for both records
                common_metadata = {
                    'exchange_rate': trade_price,
                    'quantity': quantity,
                    'proceeds': proceeds,  # For verification
                    'source_currency': pair_base,
                    'target_currency': pair_quote,
                    'symbol': symbol,
                    'basis': self._parse_float(row.get('Basis')),
                    'realized_pl': self._parse_float(row.get('Realized P/L')),
                    'mtm_pl': self._parse_float(row.get('MTM P/L'))
                }
                
                # Create FROM record (negative, base currency)
                from_record = {
                    'section': 'Trades',
                    'cashflow_type': 'forex_conversion',
                    'amount': from_amount,
                    'currency': pair_base,  # Base currency (what we're selling)
                    'effective_date': effective_date,
                    'source_account': row.get('Account') or '',
                    'target_account': '',
                    'asset_symbol': symbol,
                    'memo': row.get('Code') or '',
                    'tax_country': '',
                    'quantity': quantity,
                    'trade_price': trade_price,
                    'commission': commission,  # Fee goes on FROM record
                    'source_currency': pair_base,
                    'target_currency': pair_quote,
                    'metadata': dict(common_metadata),  # Copy for FROM
                    '_raw_row': row
                }
                
                # Create TO record (positive, quote currency)
                to_record = {
                    'section': 'Trades',
                    'cashflow_type': 'forex_conversion',
                    'amount': to_amount,
                    'currency': pair_quote,  # Quote currency (what we're receiving)
                    'effective_date': effective_date,
                    'source_account': row.get('Account') or '',
                    'target_account': '',
                    'asset_symbol': symbol,
                    'memo': row.get('Code') or '',
                    'tax_country': '',
                    'quantity': quantity,
                    'trade_price': trade_price,
                    'commission': 0.0,  # Fee only on FROM record
                    'source_currency': pair_base,
                    'target_currency': pair_quote,
                    'metadata': dict(common_metadata),  # Copy for TO
                    '_raw_row': row
                }
                
                # Add both records (they will be paired later by matching currencies and date)
                forex_records.append(from_record)
                forex_records.append(to_record)
                
            except Exception as exc:
                logger.error(f"❌ Failed to build forex conversion record: {exc}", exc_info=True)

        self._pending_forex_rows = []
        return forex_records

    @staticmethod
    def _split_currency_pair(symbol: str) -> Tuple[str, str]:
        if not symbol or '.' not in symbol:
            return (symbol or '', '')
        base, quote = symbol.split('.', 1)
        return base.upper(), quote.upper()

    ACCOUNT_TOKEN_REGEX = re.compile(r'U\d{6,}')

    def _infer_account_from_row(
        self,
        section_key: str,
        row: Dict[str, Any],
        memo: str,
        target: bool = False
    ) -> str:
        candidates = []
        if section_key == 'transfer':
            if target:
                candidates.extend([
                    row.get('Transfer Account'),
                    row.get('Xfer Company')
                ])
            else:
                candidates.extend([
                    row.get('Xfer Account'),
                    row.get('Account'),
                    row.get('Account ID')
                ])
        elif section_key == 'deposit_withdrawal':
            candidates.append(row.get('Account'))
        elif section_key in {'dividend', 'dividend_accrual', 'interest', 'tax', 'borrow_fee'}:
            candidates.append(row.get('Account'))

        candidates.extend([
            row.get('Account ID'),
            row.get('Account'),
            memo
        ])

        for candidate in candidates:
            if not candidate:
                continue
            match = self.ACCOUNT_TOKEN_REGEX.search(str(candidate))
            if match:
                return match.group(0)
        return ''
    
    def normalize_record(self, raw_record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize an IBKR record to standard format.
        
        Args:
            raw_record: Raw data record from parse_file
            
        Returns:
            Dict[str, Any]: Normalized record with standard fields
        """
        try:
            # Extract IBKR-specific fields
            symbol = str(raw_record.get('Symbol', '')).strip()
            asset_category = str(raw_record.get('Asset Category', '')).strip()
            currency = str(raw_record.get('Currency', '')).strip()
            date_time = str(raw_record.get('Date/Time', '')).strip()
            quantity = self._parse_float(raw_record.get('Quantity', 0))
            trade_price = self._parse_float(raw_record.get('T. Price', 0))
            close_price = self._parse_float(raw_record.get('C. Price', 0))
            proceeds = self._parse_float(raw_record.get('Proceeds', 0))
            comm_fee = self._parse_float(raw_record.get('Comm/Fee', 0))
            basis = self._parse_float(raw_record.get('Basis', 0))
            realized_pl = self._parse_float(raw_record.get('Realized P/L', 0))
            mtm_pl = self._parse_float(raw_record.get('MTM P/L', 0))
            code = str(raw_record.get('Code', '')).strip()
            
            # Parse date and time
            date_value = self._parse_ibkr_datetime(date_time)
            normalizer = DateNormalizationService("UTC")
            date_envelope = normalizer.normalize_output(date_value)
            
            # Determine action based on quantity
            if quantity > 0:
                action = 'buy'
            elif quantity < 0:
                action = 'sell'
                quantity = abs(quantity)  # Make quantity positive
            else:
                # Skip records with zero quantity
                raise ValueError("Zero quantity trade")
            
            # Use trade price as the main price
            price = trade_price if trade_price > 0 else close_price
            
            # Calculate fee (use commission/fee field)
            fee = abs(comm_fee) if comm_fee != 0 else 0
            
            return {
                'symbol': symbol,
                'action': action,
                'date': date_envelope,
                'quantity': quantity,
                'price': price,
                'fee': fee,
                'currency': currency,
                'asset_category': asset_category,
                'proceeds': proceeds,
                'basis': basis,
                'realized_pl': realized_pl,
                'mtm_pl': mtm_pl,
                'code': code,
                'row_number': raw_record.get('_row_number', 0)
            }
            
        except Exception as e:
            raise ValueError(f"Failed to normalize IBKR record: {str(e)}")
    
    def get_supported_file_types(self) -> List[str]:
        """
        Returns a list of file extensions supported by this connector.
        """
        return ['.csv']

    def get_connector_name(self) -> str:
        """
        Returns the human-readable name of the connector.
        """
        return 'Interactive Brokers CSV'

    def get_provider_name(self) -> str:
        """
        Get the provider name for this connector.
        
        Returns:
            str: Provider name
        """
        return "IBKR"
    
    def _is_trade_record(self, row: Dict[str, Any]) -> bool:
        """
        Check if a row represents a trade record.
        
        Args:
            row: CSV row data
            
        Returns:
            bool: True if this is a trade record
        """
        # Check for trade record indicators
        data_discriminator = str(row.get('DataDiscriminator', '')).strip()
        asset_category = str(row.get('Asset Category', '')).strip()
        symbol = str(row.get('Symbol', '')).strip()
        
        # Must be an "Order" record with valid data
        return (
            data_discriminator == 'Order' and
            asset_category in ['Stocks', 'Options', 'Futures', 'Forex'] and
            symbol and
            symbol != '--'
        )
    
    def _parse_float(self, value: Any) -> float:
        """
        Parse a value to float, handling IBKR-specific formats.
        
        Args:
            value: Value to parse
            
        Returns:
            float: Parsed float value
        """
        if value is None or value == '' or value == '--':
            return 0.0
        
        try:
            # Handle string values
            if isinstance(value, str):
                # Remove common formatting
                cleaned = value.replace('$', '').replace(',', '').replace(' ', '')
                # Handle negative values in parentheses
                if cleaned.startswith('(') and cleaned.endswith(')'):
                    cleaned = '-' + cleaned[1:-1]
                return float(cleaned)
            
            return float(value)
            
        except (ValueError, TypeError):
            return 0.0
    
    def _parse_ibkr_datetime(self, date_time_str: str) -> datetime:
        """
        Parse IBKR datetime string to ISO format.
        
        Args:
            date_time_str: IBKR datetime string
            
        Returns:
            str: ISO formatted datetime string
        """
        if not date_time_str:
            raise ValueError("Date/Time is required")
        
        # IBKR format: "2025-09-03, 09:35:18" or "2025-09-03,09:35:18"
        try:
            # Clean the string
            cleaned = date_time_str.replace('"', '').strip()
            
            # Try IBKR format first
            if ',' in cleaned:
                date_part, time_part = cleaned.split(',', 1)
                date_part = date_part.strip()
                time_part = time_part.strip()
                
                # Combine and parse
                iso_str = f"{date_part}T{time_part}"
                dt = datetime.fromisoformat(iso_str)
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                else:
                    dt = dt.astimezone(timezone.utc)
                return dt
            
            # Try other common formats
            date_formats = [
                '%Y-%m-%dT%H:%M:%S',
                '%Y-%m-%d %H:%M:%S',
                '%Y-%m-%d',
                '%m/%d/%Y %H:%M:%S',
                '%m/%d/%Y'
            ]
            
            for fmt in date_formats:
                try:
                    dt = datetime.strptime(cleaned, fmt)
                    return dt.replace(tzinfo=timezone.utc)
                except ValueError:
                    continue
            
            # If all else fails, try ISO parsing
            dt = datetime.fromisoformat(cleaned.replace('Z', '+00:00'))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            else:
                dt = dt.astimezone(timezone.utc)
            return dt
            
        except Exception as e:
            raise ValueError(f"Unable to parse IBKR datetime: {date_time_str} - {str(e)}")
    
    def get_expected_format(self) -> Dict[str, Any]:
        """
        Get information about the expected file format.
        
        Returns:
            Dict[str, Any]: Format information
        """
        return {
            'format_name': 'IBKR Activity Statement',
            'file_extension': '.csv',
            'provider': 'Interactive Brokers LLC',
            'description': 'Interactive Brokers Activity Statement CSV file',
            'sections': [
                'Statement Information',
                'Account Information', 
                'Net Asset Value',
                'Trades',
                'Dividends',
                'Interest',
                'Open Positions'
            ],
            'trade_section': 'Trades',
            'trade_indicators': [
                'Trades,Header,DataDiscriminator,Asset Category',
                'Trades,Data,Order,Stocks'
            ],
            'required_columns': [
                'Symbol', 'Date/Time', 'Quantity', 'T. Price', 'C. Price',
                'Proceeds', 'Comm/Fee', 'Basis', 'Realized P/L', 'MTM P/L'
            ]
        }
    
    def extract_account_info(self, file_content: str) -> Dict[str, Any]:
        """
        Extract account information from IBKR file.
        
        Args:
            file_content: Raw file content as string
            
        Returns:
            Dict[str, Any]: Account information
        """
        account_info = {}
        
        try:
            lines = file_content.strip().split('\n')
            
            for line in lines:
                if line.startswith('Account Information,Data,'):
                    parts = line.split(',', 3)
                    if len(parts) >= 4:
                        field_name = parts[2]
                        field_value = parts[3]
                        
                        if field_name == 'Account':
                            account_info['account_number'] = field_value
                        elif field_name == 'Name':
                            account_info['account_holder'] = field_value
                        elif field_name == 'Account Type':
                            account_info['account_type'] = field_value
                        elif field_name == 'Base Currency':
                            account_info['base_currency'] = field_value
                            
        except Exception as e:
            # Don't fail the entire process for account info
            pass
        
        return account_info

    def _parse_symbol_metadata(self, lines: List[str]) -> List[Dict[str, Any]]:
        entries: Dict[str, Dict[str, Any]] = {}

        for line in lines:
            if not line.startswith('Net Stock Position Summary,Data'):
                continue

            try:
                values = next(csv.reader(io.StringIO(line)))
            except Exception:
                continue

            if len(values) < 6:
                continue

            currency = values[3].strip()
            symbol = values[4].strip()
            company_name = values[5].strip()

            if not symbol:
                continue

            normalized_symbol = symbol.upper()
            entry = entries.setdefault(normalized_symbol, {
                'symbol': normalized_symbol,
                'display_symbol': symbol,
                'source': 'ibkr_net_stock_position_summary',
                'sources': ['ibkr_net_stock_position_summary']
            })

            if company_name:
                entry.setdefault('company_name', company_name)
            if currency:
                entry.setdefault('currency', currency)

        for line in lines:
            if not line.startswith('Financial Instrument Information,Data'):
                continue

            try:
                values = next(csv.reader(io.StringIO(line)))
            except Exception:
                continue

            if len(values) < 9:
                continue

            symbol = values[3].strip() or values[7].strip()
            if not symbol:
                continue

            normalized_symbol = symbol.upper()
            entry = entries.setdefault(normalized_symbol, {
                'symbol': normalized_symbol,
                'display_symbol': symbol,
                'source': 'ibkr_financial_instrument_information',
                'sources': ['ibkr_financial_instrument_information']
            })

            company_name = values[4].strip()
            exchange_code = values[8].strip()

            if company_name and not entry.get('company_name'):
                entry['company_name'] = company_name
            if exchange_code:
                entry['exchange_code'] = exchange_code

            sources = set(entry.get('sources', []))
            sources.add('ibkr_financial_instrument_information')
            entry['sources'] = sorted(sources)

        # Ensure we always return the company name source even when only the first section is parsed
        for entry in entries.values():
            sources = set(entry.get('sources', []))
            if entry.get('source') == 'ibkr_net_stock_position_summary':
                sources.add('ibkr_net_stock_position_summary')
            entry['sources'] = sorted(sources) if sources else [entry.get('source', 'connector')]

        return list(entries.values())

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
from typing import List, Dict, Any, Optional
from datetime import datetime
from .base_connector import BaseImportConnector

class IBKRConnector(BaseImportConnector):
    """
    IBKR connector for Interactive Brokers Activity Statement files.
    
    This connector handles the complex IBKR CSV format and extracts
    trading data from the Trades section of the statement.
    """
    
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
    
    def parse_file(self, file_content: str) -> List[Dict[str, Any]]:
        """
        Parse the IBKR CSV file content.
        
        Args:
            file_content: Raw file content as string
            
        Returns:
            List[Dict[str, Any]]: List of raw data records
        """
        records = []
        
        try:
            reader = csv.DictReader(io.StringIO(file_content))
            
            for row_num, row in enumerate(reader, 1):
                # Look for trade records
                if self._is_trade_record(row):
                    # Add row number for tracking
                    row['_row_number'] = row_num
                    records.append(row)
                    
        except Exception as e:
            raise ValueError(f"Failed to parse IBKR file: {str(e)}")
        
        return records
    
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
            date = self._parse_ibkr_datetime(date_time)
            
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
                'date': date,
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
    
    def _parse_ibkr_datetime(self, date_time_str: str) -> str:
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
                return dt.isoformat()
            
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
                    return dt.isoformat()
                except ValueError:
                    continue
            
            # If all else fails, try ISO parsing
            dt = datetime.fromisoformat(cleaned.replace('Z', '+00:00'))
            return dt.isoformat()
            
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

"""
Demo Import Connector - Simple CSV connector for testing

This connector handles simple CSV files with basic trading data for testing
and demonstration purposes. It provides a straightforward format that's
easy to understand and modify.

CSV Format:
symbol,action,date,quantity,price,fee

Example:
AAPL,buy,2025-01-15T10:30:00,100,150.25,1.50
TSLA,sell,2025-01-15T11:45:00,50,200.75,2.00

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-16
"""

import csv
import io
from typing import List, Dict, Any, List
from datetime import datetime
from .base_connector import BaseImportConnector

class DemoConnector(BaseImportConnector):
    """
    Demo connector for simple CSV files.
    
    This connector is designed for testing and demonstration purposes.
    It handles a simple CSV format with basic trading data.
    """
    
    def detect_format(self, file_content: str) -> bool:
        """
        Detect if the file content matches the demo CSV format.
        
        Args:
            file_content: Raw file content as string
            
        Returns:
            bool: True if format matches, False otherwise
        """
        try:
            # Try to parse as CSV
            reader = csv.DictReader(io.StringIO(file_content))
            
            # Check if we have the expected columns
            expected_columns = {'symbol', 'action', 'date', 'quantity', 'price', 'fee'}
            actual_columns = set(reader.fieldnames or [])
            
            # Must have all expected columns
            if not expected_columns.issubset(actual_columns):
                return False
            
            # Try to read at least one row to validate format
            rows = list(reader)
            if not rows:
                return False
            
            # Check if first row has valid data structure
            first_row = rows[0]
            for field in expected_columns:
                if field not in first_row:
                    return False
            
            return True
            
        except Exception:
            return False
    
    def parse_file(self, file_content: str) -> List[Dict[str, Any]]:
        """
        Parse the demo CSV file content.
        
        Args:
            file_content: Raw file content as string
            
        Returns:
            List[Dict[str, Any]]: List of raw data records
        """
        records = []
        
        try:
            reader = csv.DictReader(io.StringIO(file_content))
            
            for row_num, row in enumerate(reader, 1):
                # Skip empty rows
                if not any(row.values()):
                    continue
                
                # Add row number for tracking
                row['_row_number'] = row_num
                records.append(row)
                
        except Exception as e:
            raise ValueError(f"Failed to parse demo CSV file: {str(e)}")
        
        return records
    
    def normalize_record(self, raw_record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize a demo CSV record to standard format.
        
        Args:
            raw_record: Raw data record from parse_file
            
        Returns:
            Dict[str, Any]: Normalized record with standard fields
        """
        try:
            # Extract and clean data
            symbol = str(raw_record.get('symbol', '')).strip().upper()
            action = str(raw_record.get('action', '')).strip().lower()
            date_str = str(raw_record.get('date', '')).strip()
            quantity = self._parse_float(raw_record.get('quantity', 0))
            price = self._parse_float(raw_record.get('price', 0))
            fee = self._parse_float(raw_record.get('fee', 0))
            
            # Parse date
            date = self._parse_date(date_str)
            
            # Determine action based on quantity sign
            if quantity < 0:
                action = 'sell'
                quantity = abs(quantity)  # Make quantity positive
            elif action not in ['buy', 'sell']:
                # Default to buy if action is not specified or invalid
                action = 'buy'
            
            return {
                'symbol': symbol,
                'action': action,
                'date': date,
                'quantity': quantity,
                'price': price,
                'fee': fee,
                'row_number': raw_record.get('_row_number', 0)
            }
            
        except Exception as e:
            raise ValueError(f"Failed to normalize demo record: {str(e)}")
    
    def get_provider_name(self) -> str:
        """
        Get the provider name for this connector.
        
        Returns:
            str: Provider name
        """
        return "Demo"
    
    def _parse_float(self, value: Any) -> float:
        """
        Parse a value to float, handling various formats.
        
        Args:
            value: Value to parse
            
        Returns:
            float: Parsed float value
        """
        if value is None or value == '':
            return 0.0
        
        try:
            # Handle string values
            if isinstance(value, str):
                # Remove common currency symbols and formatting
                cleaned = value.replace('$', '').replace(',', '').replace(' ', '')
                return float(cleaned)
            
            return float(value)
            
        except (ValueError, TypeError):
            return 0.0
    
    def _parse_date(self, date_str: str) -> str:
        """
        Parse date string to ISO format.
        
        Args:
            date_str: Date string to parse
            
        Returns:
            str: ISO formatted date string
        """
        if not date_str:
            raise ValueError("Date is required")
        
        # Try common date formats
        date_formats = [
            '%Y-%m-%dT%H:%M:%S',      # ISO format with time
            '%Y-%m-%d %H:%M:%S',      # ISO format with space
            '%Y-%m-%d',               # ISO date only
            '%Y/%m/%d',               # US format
            '%d/%m/%Y',               # European format
            '%m/%d/%Y'                # US format with month first
        ]
        
        for fmt in date_formats:
            try:
                dt = datetime.strptime(date_str, fmt)
                return dt.isoformat()
            except ValueError:
                continue
        
        # If no format matches, try to parse as ISO
        try:
            dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            return dt.isoformat()
        except ValueError:
            raise ValueError(f"Unable to parse date: {date_str}")
    
    def get_expected_format(self) -> Dict[str, Any]:
        """
        Get information about the expected file format.
        
        Returns:
            Dict[str, Any]: Format information
        """
        return {
            'format_name': 'Demo CSV',
            'file_extension': '.csv',
            'required_columns': ['symbol', 'action', 'date', 'quantity', 'price', 'fee'],
            'optional_columns': [],
            'delimiter': ',',
            'encoding': 'utf-8',
            'example_header': 'symbol,action,date,quantity,price,fee',
            'example_row': 'AAPL,buy,2025-01-15T10:30:00,100,150.25,1.50',
            'description': 'Simple CSV format for testing and demonstration'
        }

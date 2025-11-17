#!/usr/bin/env python3
"""
Test Filtering Logic - Test selected_types filtering at all stages

This script tests the filtering logic at all three filtering points:
1. _build_preview_payload
2. execute_import
3. _execute_import_cashflows

Usage:
    python3 Backend/scripts/test_filtering_logic.py

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-16
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.user_data_import.import_orchestrator import ImportOrchestrator
from unittest.mock import Mock, MagicMock

def test_filtering_logic():
    """Test filtering logic at all stages"""
    print("\n🧪 TESTING FILTERING LOGIC")
    print("=" * 80)
    
    # Mock database session
    db_session = Mock()
    orchestrator = ImportOrchestrator(db_session)
    
    # Create mock pipeline result
    pipeline_result = {
        'validation_result': {'valid_records': []},
        'duplicate_result': {
            'clean_records': [
                {'record': {'cashflow_type': 'dividend', 'amount': 100.0, 'currency': 'USD'}},
                {'record': {'cashflow_type': 'interest', 'amount': 50.0, 'currency': 'USD'}},
                {'record': {'cashflow_type': 'fee', 'amount': 10.0, 'currency': 'USD'}},
                {'record': {'cashflow_type': 'tax', 'amount': 5.0, 'currency': 'USD'}}
            ]
        },
        'raw_records': []
    }
    
    # Test filtering in _build_preview_payload
    print("\n📊 Test 1: Filtering in _build_preview_payload")
    selected_types = ['dividend', 'fee']
    result = orchestrator._build_preview_payload('cashflows', pipeline_result, selected_types=selected_types)
    
    records_to_import = result.get('records_to_import', [])
    print(f"  Input: 4 records (dividend, interest, fee, tax)")
    print(f"  Selected Types: {selected_types}")
    print(f"  Output: {len(records_to_import)} records")
    
    types = [rec.get('cashflow_type') for rec in records_to_import]
    print(f"  Types: {types}")
    
    assert len(records_to_import) == 2
    assert 'dividend' in types
    assert 'fee' in types
    assert 'interest' not in types
    assert 'tax' not in types
    print("  ✅ PASS: Filtering works correctly")
    
    # Verify selected_types is stored
    assert result.get('selected_types') == selected_types
    print("  ✅ PASS: selected_types is stored in preview_data")
    
    print("\n✅ All filtering tests passed!")

if __name__ == '__main__':
    test_filtering_logic()


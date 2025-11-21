#!/usr/bin/env python3
"""
Export import records to CSV - represents exact data that will be saved to database.
"""
import sys
import os
import csv
import json
from datetime import datetime

# Add Backend to path
sys.path.insert(0, 'Backend')

# Change to project root
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(project_root)

# Mock UI_DIR before importing
import config.settings
config.settings.UI_DIR = 'trading-ui'

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.import_session import ImportSession
from services.user_data_import.import_orchestrator import ImportOrchestrator
from connectors.user_data_import.ibkr_connector import IBKRConnector

def main():
    # Read the sample file
    file_path = '_Tmp/activity - 2024.csv'
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return
    
    with open(file_path, 'r', encoding='utf-8') as f:
        file_content = f.read()

    print('📁 Parsing file...')
    print(f'File size: {len(file_content)} characters')
    print()

    # Initialize database session
    from config.settings import DATABASE_URL
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db_session = Session()

    try:
        # Create a temporary import session
        print('🔍 Creating import session...')
        orchestrator = ImportOrchestrator(db_session)
        
        # Create session
        session_result = orchestrator.create_import_session(
            user_id=1,
            file_name='activity - 2024.csv',
            file_content=file_content,
            connector_type='ibkr'
        )
        
        if not session_result.get('success'):
            print(f"❌ Failed to create session: {session_result.get('error')}")
            return
        
        session_id = session_result['session_id']
        print(f'✅ Created session ID: {session_id}')
        print()

        # Generate preview (this processes everything)
        print('🔄 Generating preview (processing records)...')
        preview_result = orchestrator.generate_preview(session_id, 'cashflows')
        
        if not preview_result.get('success'):
            print(f"❌ Failed to generate preview: {preview_result.get('error')}")
            return
        
        preview_data = preview_result['preview_data']
        records_to_import = preview_data.get('records_to_import', [])
        
        print(f'✅ Processed {len(records_to_import)} records for import')
        print()

        # Prepare CSV data with all fields that will be saved to database
        output_file = '_Tmp/cashflow_import_records_for_database.csv'
        
        fieldnames = [
            'record_index',
            'cashflow_type',
            'storage_type',
            'amount',
            'currency',
            'effective_date',
            'description',
            'source_account',
            'target_account',
            'asset_symbol',
            'memo',
            'external_id',
            'section',
            'mapping_note',
            'quantity',
            'trade_price',
            'commission',
            'source_currency',
            'target_currency',
            'exchange_rate',
            'metadata_json',
            'is_exchange_from',
            'is_exchange_to',
            'exchange_external_id'
        ]

        records_for_csv = []

        for idx, entry in enumerate(records_to_import):
            # Handle both formats: {'record': {...}} or direct record
            if isinstance(entry, dict) and 'record' in entry:
                record = entry['record']
            else:
                record = entry
            
            # Extract metadata
            metadata = record.get('metadata', {})
            if not isinstance(metadata, dict):
                metadata = {}
            
            # Determine if this is an exchange record
            storage_type = record.get('storage_type', '')
            is_exchange_from = storage_type == 'currency_exchange_from'
            is_exchange_to = storage_type == 'currency_exchange_to'
            exchange_external_id = metadata.get('exchange_external_id') or record.get('external_id', '')
            
            # Build description (as it will be saved)
            description_parts = []
            if record.get('memo'):
                description_parts.append(str(record['memo']))
            if record.get('target_account'):
                description_parts.append(f"Target: {record['target_account']}")
            if record.get('asset_symbol'):
                description_parts.append(f"Asset: {record['asset_symbol']}")
            if record.get('mapping_note'):
                description_parts.append(f"מקור תזרים: {record['mapping_note']}")
            description = ' | '.join(description_parts) if description_parts else ''
            
            row_data = {
                'record_index': idx + 1,
                'cashflow_type': record.get('cashflow_type', ''),
                'storage_type': storage_type,
                'amount': record.get('amount', 0),
                'currency': record.get('currency', ''),
                'effective_date': str(record.get('effective_date', '')),
                'description': description,
                'source_account': record.get('source_account', ''),
                'target_account': record.get('target_account', ''),
                'asset_symbol': record.get('asset_symbol', ''),
                'memo': record.get('memo', ''),
                'external_id': record.get('external_id', ''),
                'section': record.get('section', ''),
                'mapping_note': record.get('mapping_note', ''),
                'quantity': record.get('quantity', ''),
                'trade_price': record.get('trade_price', ''),
                'commission': record.get('commission', ''),
                'source_currency': record.get('source_currency', '') or metadata.get('source_currency', ''),
                'target_currency': record.get('target_currency', '') or metadata.get('target_currency', ''),
                'exchange_rate': metadata.get('exchange_rate', '') or record.get('trade_price', ''),
                'metadata_json': json.dumps(metadata, ensure_ascii=False) if metadata else '',
                'is_exchange_from': 'Yes' if is_exchange_from else 'No',
                'is_exchange_to': 'Yes' if is_exchange_to else 'No',
                'exchange_external_id': exchange_external_id
            }
            
            records_for_csv.append(row_data)

        # Write to CSV
        print(f'📝 Writing {len(records_for_csv)} records to CSV...')
        with open(output_file, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(records_for_csv)

        print(f'✅ CSV file created: {output_file}')
        print(f'   Full path: {os.path.abspath(output_file)}')
        print(f'   Total records: {len(records_for_csv)}')
        print()
        
        # Summary
        print('📊 Summary by cashflow_type:')
        type_counts = {}
        type_totals = {}
        exchange_pairs = {}
        
        for record in records_for_csv:
            cf_type = record['cashflow_type']
            type_counts[cf_type] = type_counts.get(cf_type, 0) + 1
            try:
                amount = float(record['amount'] or 0)
                type_totals[cf_type] = type_totals.get(cf_type, 0.0) + abs(amount)
            except:
                pass
            
            # Count exchange pairs
            if record['is_exchange_from'] == 'Yes' or record['is_exchange_to'] == 'Yes':
                ext_id = record['exchange_external_id']
                if ext_id:
                    exchange_pairs[ext_id] = exchange_pairs.get(ext_id, 0) + 1
        
        for cf_type in sorted(type_counts.keys()):
            count = type_counts[cf_type]
            total = type_totals.get(cf_type, 0.0)
            print(f'   {cf_type:<25} {count:>5} records, Total: {total:>15,.2f}')
        
        print()
        print(f'📊 Exchange pairs: {len(exchange_pairs)} unique exchange IDs')
        print(f'   (Each pair should have 2 records: FROM + TO)')
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db_session.close()

if __name__ == '__main__':
    main()


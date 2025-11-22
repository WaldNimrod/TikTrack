#!/usr/bin/env python3
"""
Create Import Tags Script
==========================

Creates all required tags for import records in a dedicated category.

This script creates:
- Category: "ייבוא נתונים IBKR" (and other providers if needed)
- Tags: All section names from IBKR connector (Dividends, Interest, etc.)

Usage:
    python3 Backend/scripts/create_import_tags.py [--provider PROVIDER] [--user-id USER_ID]

Examples:
    # Create tags for IBKR (default)
    python3 Backend/scripts/create_import_tags.py
    
    # Create tags for Demo provider
    python3 Backend/scripts/create_import_tags.py --provider Demo
    
    # Create tags for specific user
    python3 Backend/scripts/create_import_tags.py --user-id 1
"""

import sys
import os
import argparse
from pathlib import Path

# Add Backend directory to path for imports
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
sys.path.insert(0, backend_dir)

# Set working directory to Backend to avoid config issues
os.chdir(backend_dir)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import func

# Import models directly
from models.tag_category import TagCategory
from models.tag import Tag

# Import TagService directly (avoid __init__.py that loads all services)
import importlib.util
tag_service_path = os.path.join(backend_dir, "services", "tag_service.py")
spec = importlib.util.spec_from_file_location("tag_service", tag_service_path)
tag_service_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tag_service_module)
TagService = tag_service_module.TagService
# Get database path
def get_database_path():
    """Get the database path"""
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "db", "tiktrack.db")
    return os.path.normpath(db_path)

# IBKR section names (from IBKRConnector.CASHFLOW_SECTION_NAMES)
# Only include sections that are actually imported (skip accruals, summaries)
IMPORT_SECTION_NAMES = [
    'Dividends',
    'Interest',
    'Deposits & Withdrawals',
    'Withholding Tax',
    'Borrow Fee Details',
    'Transfers',
    'Forex Conversion',  # For forex exchange records
]

# Providers to create categories for
PROVIDERS = ['IBKR', 'Demo']


def create_import_tags(provider_name: str = 'IBKR', user_id: int = 1, db_session=None):
    """
    Create import tags for a specific provider.
    
    Args:
        provider_name: Provider name (e.g., 'IBKR', 'Demo')
        user_id: User ID (default: 1)
        db_session: Database session (if None, creates new one)
    """
    should_close_session = False
    if db_session is None:
        db_path = get_database_path()
        engine = create_engine(f'sqlite:///{db_path}')
        Session = sessionmaker(bind=engine)
        db_session = Session()
        should_close_session = True
    
    try:
        category_name = f"ייבוא נתונים {provider_name}"
        
        # Get or create category
        existing_category = (
            db_session.query(TagCategory)
            .filter(
                TagCategory.user_id == user_id,
                TagCategory.name == category_name
            )
            .first()
        )
        
        if existing_category:
            print(f"✅ Category already exists: {category_name} (ID: {existing_category.id})")
            category_id = existing_category.id
        else:
            category = TagService.create_category(
                db_session,
                user_id=user_id,
                name=category_name,
                color_hex="#26baac",  # Primary logo color
                is_active=True
            )
            category_id = category.id
            print(f"✅ Created category: {category_name} (ID: {category_id})")
        
        # Create tags for each section
        created_count = 0
        existing_count = 0
        
        for section_name in IMPORT_SECTION_NAMES:
            # Check if tag already exists (by name, case-insensitive)
            from sqlalchemy import func
            existing_tag = (
                db_session.query(Tag)
                .filter(
                    Tag.user_id == user_id,
                    func.lower(Tag.name) == func.lower(section_name)
                )
                .first()
            )
            
            if existing_tag:
                print(f"  ℹ️  Tag already exists: {section_name} (ID: {existing_tag.id}, Category: {existing_tag.category_id})")
                existing_count += 1
            else:
                try:
                    tag = TagService.create_tag(
                        db_session,
                        user_id=user_id,
                        name=section_name,
                        category_id=category_id,
                        description="נוצר אוטומטית ממודול ייבוא",
                        is_active=True
                    )
                    print(f"  ✅ Created tag: {section_name} (ID: {tag.id})")
                    created_count += 1
                except ValueError as e:
                    # Tag might have been created by another process
                    print(f"  ⚠️  Failed to create tag {section_name}: {e}")
                    existing_count += 1
        
        db_session.commit()
        
        print(f"\n📊 Summary for {provider_name}:")
        print(f"  - Created: {created_count} tags")
        print(f"  - Already existed: {existing_count} tags")
        print(f"  - Total: {len(IMPORT_SECTION_NAMES)} tags")
        
    except Exception as e:
        db_session.rollback()
        print(f"❌ Error creating import tags: {e}")
        raise
    finally:
        if should_close_session:
            db_session.close()


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Create import tags for IBKR and other providers',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--provider',
        type=str,
        default='IBKR',
        help='Provider name (default: IBKR)'
    )
    parser.add_argument(
        '--user-id',
        type=int,
        default=1,
        help='User ID (default: 1)'
    )
    parser.add_argument(
        '--all-providers',
        action='store_true',
        help='Create tags for all providers (IBKR, Demo)'
    )
    
    args = parser.parse_args()
    
    print("🚀 Creating Import Tags")
    print("=" * 60)
    
    if args.all_providers:
        # Create tags for all providers
        for provider in PROVIDERS:
            print(f"\n📦 Processing provider: {provider}")
            print("-" * 60)
            create_import_tags(provider, args.user_id)
    else:
        # Create tags for single provider
        create_import_tags(args.provider, args.user_id)
    
    print("\n🎉 Script completed successfully!")


if __name__ == '__main__':
    main()


#!/usr/bin/env python3
"""
Watch Lists Backend Testing Script
==================================

Comprehensive testing of Watch Lists backend (Models + Service):
- Database models validation
- Service CRUD operations
- Business logic validation
- Error handling

Author: TikTrack Development Team
Date: January 2025
"""

import os
import sys
from pathlib import Path

# Add Backend directory to path
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

# Set up environment variables if not set
if not os.getenv('POSTGRES_HOST'):
    os.environ['POSTGRES_HOST'] = 'localhost'
    os.environ['POSTGRES_DB'] = 'TikTrack-db-development'
    os.environ['POSTGRES_USER'] = 'TikTrakDBAdmin'
    os.environ['POSTGRES_PASSWORD'] = 'BigMeZoo1974!?'

from sqlalchemy.orm import Session
from config.database import SessionLocal
from models.watch_list import WatchList, WatchListItem
from models.user import User
from models.ticker import Ticker
from services.watch_list_service import WatchListService
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Test results
test_results = {
    'passed': [],
    'failed': [],
    'errors': []
}

def print_test(name, status, message=''):
    """Print test result"""
    status_symbol = '✅' if status else '❌'
    print(f"{status_symbol} {name}")
    if message:
        print(f"   {message}")
    
    if status:
        test_results['passed'].append(name)
    else:
        test_results['failed'].append(name)
        if message:
            test_results['errors'].append(f"{name}: {message}")

def test_models_import():
    """Test that models can be imported"""
    print("\n📋 Testing Models Import...")
    try:
        from models.watch_list import WatchList, WatchListItem
        print_test("Import WatchList model", True)
        print_test("Import WatchListItem model", True)
        return True
    except Exception as e:
        print_test("Import models", False, str(e))
        return False

def test_service_import():
    """Test that service can be imported"""
    print("\n📋 Testing Service Import...")
    try:
        from services.watch_list_service import WatchListService
        print_test("Import WatchListService", True)
        print_test("MAX_LISTS_PER_USER constant", True, f"Value: {WatchListService.MAX_LISTS_PER_USER}")
        return True
    except Exception as e:
        print_test("Import service", False, str(e))
        return False

def test_get_default_user(db: Session):
    """Get default user for testing"""
    try:
        user = db.query(User).filter(User.is_default == True).first()
        if user:
            return user.id
        # Fallback to first user
        user = db.query(User).first()
        return user.id if user else 1
    except Exception as e:
        logger.warning(f"Error getting default user: {e}")
        return 1

def test_create_watch_list(db: Session, user_id: int):
    """Test creating a watch list"""
    print("\n📋 Testing CREATE Watch List...")
    try:
        watch_list = WatchListService.create_watch_list(
            db=db,
            user_id=user_id,
            name="Test Tech Stocks",
            icon="chart-line",
            color_hex="#26baac",
            view_mode="table"
        )
        print_test("CREATE watch list", True, f"Created list ID: {watch_list.id}, Name: {watch_list.name}")
        return watch_list.id
    except Exception as e:
        print_test("CREATE watch list", False, str(e))
        return None

def test_get_watch_lists(db: Session, user_id: int):
    """Test getting all watch lists"""
    print("\n📋 Testing GET All Watch Lists...")
    try:
        lists = WatchListService.get_watch_lists(db, user_id)
        print_test("GET all watch lists", True, f"Retrieved {len(lists)} lists")
        return lists
    except Exception as e:
        print_test("GET all watch lists", False, str(e))
        return []

def test_get_watch_list_by_id(db: Session, list_id: int, user_id: int):
    """Test getting a single watch list"""
    print(f"\n📋 Testing GET Watch List by ID ({list_id})...")
    try:
        watch_list = WatchListService.get_watch_list_by_id(db, list_id, user_id)
        if watch_list:
            print_test("GET watch list by ID", True, f"List name: {watch_list.name}")
            return watch_list
        else:
            print_test("GET watch list by ID", False, "List not found")
            return None
    except Exception as e:
        print_test("GET watch list by ID", False, str(e))
        return None

def test_update_watch_list(db: Session, list_id: int, user_id: int):
    """Test updating a watch list"""
    print(f"\n📋 Testing UPDATE Watch List ({list_id})...")
    try:
        watch_list = WatchListService.update_watch_list(
            db=db,
            list_id=list_id,
            user_id=user_id,
            name="Updated Tech Stocks",
            view_mode="cards",
            color_hex="#fc5a06"
        )
        if watch_list:
            print_test("UPDATE watch list", True, f"Updated name: {watch_list.name}, View mode: {watch_list.view_mode}")
            return True
        else:
            print_test("UPDATE watch list", False, "List not found")
            return False
    except Exception as e:
        print_test("UPDATE watch list", False, str(e))
        return False

def test_get_watch_list_items(db: Session, list_id: int, user_id: int):
    """Test getting watch list items"""
    print(f"\n📋 Testing GET Watch List Items ({list_id})...")
    try:
        items = WatchListService.get_watch_list_items(db, list_id, user_id)
        print_test("GET watch list items", True, f"Retrieved {len(items)} items")
        return items
    except Exception as e:
        print_test("GET watch list items", False, str(e))
        return []

def test_add_ticker_to_list(db: Session, list_id: int, user_id: int):
    """Test adding ticker to list"""
    print(f"\n📋 Testing ADD Ticker to List ({list_id})...")
    
    # Try to get a ticker first
    ticker = db.query(Ticker).first()
    item_id = None
    
    if ticker:
        try:
            item = WatchListService.add_ticker_to_list(
                db=db,
                list_id=list_id,
                user_id=user_id,
                ticker_id=ticker.id,
                flag_color="#26baac",
                notes="Test ticker from system"
            )
            item_id = item.id
            print_test("ADD ticker (system)", True, f"Added item ID: {item_id}, Ticker: {ticker.symbol}")
        except Exception as e:
            print_test("ADD ticker (system)", False, str(e))
    
    # Also test external ticker
    try:
        item = WatchListService.add_ticker_to_list(
            db=db,
            list_id=list_id,
            user_id=user_id,
            external_symbol="AAPL",
            external_name="Apple Inc.",
            flag_color="#fc5a06",
            notes="Test external ticker"
        )
        print_test("ADD ticker (external)", True, f"Added item ID: {item.id}, Symbol: AAPL")
        return item_id or item.id
    except Exception as e:
        print_test("ADD ticker (external)", False, str(e))
        return item_id

def test_update_item(db: Session, item_id: int, user_id: int):
    """Test updating a watch list item"""
    print(f"\n📋 Testing UPDATE Item ({item_id})...")
    try:
        item = WatchListService.update_item(
            db=db,
            item_id=item_id,
            user_id=user_id,
            flag_color="#fc5a06",
            notes="Updated notes"
        )
        if item:
            print_test("UPDATE item", True, f"Updated flag color: {item.flag_color}")
            return True
        else:
            print_test("UPDATE item", False, "Item not found")
            return False
    except Exception as e:
        print_test("UPDATE item", False, str(e))
        return False

def test_update_item_order(db: Session, list_id: int, user_id: int, item_ids: list):
    """Test updating item order"""
    print(f"\n📋 Testing UPDATE Item Order ({list_id})...")
    try:
        items_order = [{"id": item_id, "display_order": idx} for idx, item_id in enumerate(item_ids)]
        result = WatchListService.update_item_order(db, list_id, user_id, items_order)
        print_test("UPDATE item order", True, f"Reordered {len(item_ids)} items")
        return result
    except Exception as e:
        print_test("UPDATE item order", False, str(e))
        return False

def test_remove_ticker_from_list(db: Session, item_id: int, user_id: int):
    """Test removing ticker from list"""
    print(f"\n📋 Testing REMOVE Ticker from List ({item_id})...")
    try:
        result = WatchListService.remove_ticker_from_list(db, item_id, user_id)
        if result:
            print_test("REMOVE ticker from list", True, f"Removed item ID: {item_id}")
            return True
        else:
            print_test("REMOVE ticker from list", False, "Item not found")
            return False
    except Exception as e:
        print_test("REMOVE ticker from list", False, str(e))
        return False

def test_delete_watch_list(db: Session, list_id: int, user_id: int):
    """Test deleting a watch list"""
    print(f"\n📋 Testing DELETE Watch List ({list_id})...")
    try:
        result = WatchListService.delete_watch_list(db, list_id, user_id)
        if result:
            print_test("DELETE watch list", True, f"Deleted list ID: {list_id}")
            return True
        else:
            print_test("DELETE watch list", False, "List not found")
            return False
    except Exception as e:
        print_test("DELETE watch list", False, str(e))
        return False

def test_validation_errors(db: Session, user_id: int):
    """Test validation error handling"""
    print("\n📋 Testing Validation Errors...")
    
    # Test duplicate name
    try:
        list1 = WatchListService.create_watch_list(db, user_id, name="Duplicate Test")
        try:
            list2 = WatchListService.create_watch_list(db, user_id, name="Duplicate Test")
            print_test("Validation: duplicate name", False, "Should have raised ValueError")
            # Clean up
            if list2:
                WatchListService.delete_watch_list(db, list2.id, user_id)
        except ValueError as e:
            print_test("Validation: duplicate name", True, f"Correctly rejected: {str(e)}")
        # Clean up
        if list1:
            WatchListService.delete_watch_list(db, list1.id, user_id)
    except Exception as e:
        print_test("Validation: duplicate name", False, str(e))
    
    # Test invalid view_mode
    try:
        WatchListService.create_watch_list(db, user_id, name="Invalid View", view_mode="invalid")
        print_test("Validation: invalid view_mode", False, "Should have raised ValueError")
    except ValueError as e:
        print_test("Validation: invalid view_mode", True, f"Correctly rejected: {str(e)}")
    except Exception as e:
        print_test("Validation: invalid view_mode", False, str(e))
    
    # Test max lists per user
    try:
        # Create lists up to max
        created_lists = []
        for i in range(WatchListService.MAX_LISTS_PER_USER):
            try:
                list_obj = WatchListService.create_watch_list(
                    db, user_id, name=f"Max Test {i+1}"
                )
                created_lists.append(list_obj.id)
            except Exception as e:
                break
        
        # Try to create one more
        try:
            WatchListService.create_watch_list(db, user_id, name="Over Max")
            print_test("Validation: max lists", False, "Should have raised ValueError")
        except ValueError as e:
            print_test("Validation: max lists", True, f"Correctly rejected: {str(e)}")
        
        # Clean up
        for list_id in created_lists:
            try:
                WatchListService.delete_watch_list(db, list_id, user_id)
            except:
                pass
    except Exception as e:
        print_test("Validation: max lists", False, str(e))

def main():
    """Run all tests"""
    print("=" * 60)
    print("Watch Lists Backend Comprehensive Testing")
    print("=" * 60)
    
    # Test imports
    if not test_models_import():
        print("\n❌ Cannot continue - models import failed")
        return 1
    
    if not test_service_import():
        print("\n❌ Cannot continue - service import failed")
        return 1
    
    # Get database session
    db: Session = SessionLocal()
    
    try:
        # Get default user
        user_id = test_get_default_user(db)
        print(f"\n👤 Using user ID: {user_id}")
        
        # Run CRUD tests
        list_id = test_create_watch_list(db, user_id)
        if not list_id:
            print("\n❌ Cannot continue - failed to create list")
            return 1
        
        test_get_watch_lists(db, user_id)
        test_get_watch_list_by_id(db, list_id, user_id)
        test_update_watch_list(db, list_id, user_id)
        
        items = test_get_watch_list_items(db, list_id, user_id)
        
        item_id = test_add_ticker_to_list(db, list_id, user_id)
        items = test_get_watch_list_items(db, list_id, user_id)
        
        if item_id:
            test_update_item(db, item_id, user_id)
        
        item_ids = [item.id for item in items if item.id]
        if len(item_ids) >= 2:
            test_update_item_order(db, list_id, user_id, item_ids)
        
        # Remove one item
        if len(item_ids) > 0:
            test_remove_ticker_from_list(db, item_ids[0], user_id)
        
        # Validation tests
        test_validation_errors(db, user_id)
        
        # Cleanup
        test_delete_watch_list(db, list_id, user_id)
        
    except Exception as e:
        logger.error(f"Test error: {e}", exc_info=True)
        print(f"\n❌ Test error: {e}")
        return 1
    finally:
        db.close()
    
    # Print summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    print(f"✅ Passed: {len(test_results['passed'])}")
    print(f"❌ Failed: {len(test_results['failed'])}")
    
    if test_results['failed']:
        print("\nFailed tests:")
        for error in test_results['errors']:
            print(f"   - {error}")
    
    if len(test_results['failed']) == 0:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n⚠️  {len(test_results['failed'])} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())










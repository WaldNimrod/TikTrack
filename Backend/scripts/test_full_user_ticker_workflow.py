#!/usr/bin/env python3
"""
Full User-Ticker Workflow Test
===============================

Tests the complete workflow of user-ticker integration:
1. Creating/associating a ticker
2. Updating custom fields (name_custom, type_custom)
3. Saving remarks
4. Status updates
5. Verification

Author: TikTrack Development Team
Date: January 2025
"""

import os
import sys
import time
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from config.settings import DATABASE_URL
from models.user import User
from models.ticker import Ticker
from models.user_ticker import UserTicker
from models.trade import Trade
from models.trade_plan import TradePlan
from services.ticker_service import TickerService

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

class WorkflowTester:
    def __init__(self):
        self.engine = create_engine(DATABASE_URL)
        self.Session = sessionmaker(bind=self.engine)
        self.db = self.Session()
        self.passed = 0
        self.failed = 0
        self.test_ticker_id = None
        self.test_user_id = None
        
    def log_pass(self, message):
        print(f"{Colors.GREEN}✅ PASS:{Colors.RESET} {message}")
        self.passed += 1
        
    def log_fail(self, message):
        print(f"{Colors.RED}❌ FAIL:{Colors.RESET} {message}")
        self.failed += 1
        
    def log_info(self, message):
        print(f"{Colors.BLUE}ℹ️  INFO:{Colors.RESET} {message}")
        
    def log_step(self, step_num, description):
        print(f"\n{Colors.BOLD}=== Step {step_num}: {description} ==={Colors.RESET}")
        
    def setup_test_data(self):
        """Setup: Get a test user"""
        self.log_step(0, "Setup Test Data")
        
        # Get first user
        user = self.db.query(User).first()
        if not user:
            self.log_fail("No users found in database")
            return False
            
        self.test_user_id = user.id
        self.log_info(f"Using test user ID: {self.test_user_id} ({user.username})")
        return True
        
    def test_1_create_or_associate_ticker(self):
        """Step 1: Create new ticker or associate existing ticker"""
        self.log_step(1, "Create/Associate Ticker")
        
        try:
            # Check if test ticker exists
            test_symbol = "TEST_WORKFLOW"
            existing_ticker = self.db.query(Ticker).filter(
                Ticker.symbol == test_symbol
            ).first()
            
            if existing_ticker:
                self.log_info(f"Ticker {test_symbol} already exists (ID: {existing_ticker.id})")
                self.test_ticker_id = existing_ticker.id
                
                # Check if user already has this ticker
                existing_association = self.db.query(UserTicker).filter(
                    UserTicker.user_id == self.test_user_id,
                    UserTicker.ticker_id == existing_ticker.id
                ).first()
                
                if existing_association:
                    self.log_info("User already has this ticker - will test update instead")
                    return True
                else:
                    # Create association
                    user_ticker = UserTicker(
                        user_id=self.test_user_id,
                        ticker_id=existing_ticker.id,
                        name_custom=None,
                        type_custom=None,
                        status='open',
                        created_at=datetime.utcnow()
                    )
                    self.db.add(user_ticker)
                    self.db.commit()
                    self.log_pass(f"Created association for existing ticker {test_symbol}")
                    return True
            else:
                # Create new ticker
                new_ticker = Ticker(
                    symbol=test_symbol,
                    name="Test Workflow Ticker",
                    type="Stock",
                    currency_id=1,
                    status='open',
                    remarks=None
                )
                self.db.add(new_ticker)
                self.db.commit()
                self.db.refresh(new_ticker)
                self.test_ticker_id = new_ticker.id
                self.log_info(f"Created new ticker {test_symbol} (ID: {new_ticker.id})")
                
                # Create association
                user_ticker = UserTicker(
                    user_id=self.test_user_id,
                    ticker_id=new_ticker.id,
                    name_custom=None,
                    type_custom=None,
                    status='open',
                    created_at=datetime.utcnow()
                )
                self.db.add(user_ticker)
                self.db.commit()
                self.log_pass(f"Created new ticker and association for {test_symbol}")
                return True
                
        except Exception as e:
            self.log_fail(f"Failed to create/associate ticker: {e}")
            return False
            
    def test_2_update_custom_fields(self):
        """Step 2: Update custom fields (name_custom, type_custom)"""
        self.log_step(2, "Update Custom Fields")
        
        try:
            user_ticker = self.db.query(UserTicker).filter(
                UserTicker.user_id == self.test_user_id,
                UserTicker.ticker_id == self.test_ticker_id
            ).first()
            
            if not user_ticker:
                self.log_fail("User-ticker association not found")
                return False
                
            # Update custom fields
            user_ticker.name_custom = "שם מותאם אישית - בדיקה"
            user_ticker.type_custom = "מניה"
            self.db.commit()
            self.db.refresh(user_ticker)
            
            if user_ticker.name_custom == "שם מותאם אישית - בדיקה" and \
               user_ticker.type_custom == "מניה":
                self.log_pass("Custom fields updated successfully")
                return True
            else:
                self.log_fail(f"Custom fields not updated correctly: name_custom={user_ticker.name_custom}, type_custom={user_ticker.type_custom}")
                return False
                
        except Exception as e:
            self.log_fail(f"Failed to update custom fields: {e}")
            return False
            
    def test_3_save_remarks(self):
        """Step 3: Save remarks to ticker"""
        self.log_step(3, "Save Remarks")
        
        try:
            ticker = self.db.query(Ticker).filter(Ticker.id == self.test_ticker_id).first()
            if not ticker:
                self.log_fail("Ticker not found")
                return False
                
            # Save remarks
            test_remarks = f"הערה לבדיקה - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            ticker.remarks = test_remarks
            self.db.commit()
            self.db.refresh(ticker)
            
            if ticker.remarks == test_remarks:
                self.log_pass(f"Remarks saved successfully: {ticker.remarks[:50]}...")
                return True
            else:
                self.log_fail(f"Remarks not saved correctly: {ticker.remarks}")
                return False
                
        except Exception as e:
            self.log_fail(f"Failed to save remarks: {e}")
            return False
            
    def test_4_verify_data(self):
        """Step 4: Verify all data is saved correctly"""
        self.log_step(4, "Verify Saved Data")
        
        try:
            # Verify ticker
            ticker = self.db.query(Ticker).filter(Ticker.id == self.test_ticker_id).first()
            if not ticker:
                self.log_fail("Ticker not found")
                return False
                
            self.log_info(f"Ticker: {ticker.symbol} - {ticker.name}")
            self.log_info(f"Remarks: {ticker.remarks}")
            
            # Verify user-ticker association
            user_ticker = self.db.query(UserTicker).filter(
                UserTicker.user_id == self.test_user_id,
                UserTicker.ticker_id == self.test_ticker_id
            ).first()
            
            if not user_ticker:
                self.log_fail("User-ticker association not found")
                return False
                
            self.log_info(f"Custom name: {user_ticker.name_custom}")
            self.log_info(f"Custom type: {user_ticker.type_custom}")
            self.log_info(f"Status: {user_ticker.status}")
            
            # Verify using get_user_tickers
            user_tickers = TickerService.get_user_tickers(self.db, self.test_user_id)
            test_ticker = next((t for t in user_tickers if t.id == self.test_ticker_id), None)
            
            if test_ticker:
                has_custom_name = hasattr(test_ticker, 'name_custom') and test_ticker.name_custom == "שם מותאם אישית - בדיקה"
                has_custom_type = hasattr(test_ticker, 'type_custom') and test_ticker.type_custom == "מניה"
                has_status = hasattr(test_ticker, 'user_ticker_status')
                
                if has_custom_name and has_custom_type and has_status:
                    self.log_pass("All data verified through get_user_tickers")
                    return True
                else:
                    self.log_fail(f"Data verification failed: name_custom={has_custom_name}, type_custom={has_custom_type}, status={has_status}")
                    return False
            else:
                self.log_fail("Ticker not found in get_user_tickers result")
                return False
                
        except Exception as e:
            self.log_fail(f"Verification failed: {e}")
            return False
            
    def test_5_status_updates(self):
        """Step 5: Test status updates"""
        self.log_step(5, "Test Status Updates")
        
        try:
            # Test update_user_ticker_status
            result = TickerService.update_user_ticker_status(
                self.db, 
                self.test_user_id, 
                self.test_ticker_id
            )
            
            if result:
                user_ticker = self.db.query(UserTicker).filter(
                    UserTicker.user_id == self.test_user_id,
                    UserTicker.ticker_id == self.test_ticker_id
                ).first()
                
                # Since we don't have open trades/plans, status should be 'closed'
                expected_status = 'closed'
                if user_ticker.status == expected_status:
                    self.log_pass(f"User-ticker status updated correctly: {user_ticker.status}")
                else:
                    self.log_fail(f"Status mismatch: expected {expected_status}, got {user_ticker.status}")
                    
            # Test update_ticker_status_auto
            result = TickerService.update_ticker_status_auto(self.db, self.test_ticker_id)
            if result:
                ticker = self.db.query(Ticker).filter(Ticker.id == self.test_ticker_id).first()
                self.log_pass(f"Ticker overall status updated: {ticker.status}")
            else:
                self.log_fail("update_ticker_status_auto returned False")
                
            return True
            
        except Exception as e:
            self.log_fail(f"Status update test failed: {e}")
            return False
            
    def test_6_api_simulation(self):
        """Step 6: Simulate API calls"""
        self.log_step(6, "Simulate API Calls")
        
        try:
            # Simulate GET /api/tickers/my
            user_tickers = TickerService.get_user_tickers(self.db, self.test_user_id)
            test_ticker = next((t for t in user_tickers if t.id == self.test_ticker_id), None)
            
            if test_ticker:
                # Simulate converting to dict (as API would do)
                ticker_dict = test_ticker.to_dict()
                
                # Add custom fields (as API does)
                if hasattr(test_ticker, 'name_custom'):
                    ticker_dict['name_custom'] = test_ticker.name_custom
                if hasattr(test_ticker, 'type_custom'):
                    ticker_dict['type_custom'] = test_ticker.type_custom
                if hasattr(test_ticker, 'user_ticker_status'):
                    ticker_dict['user_ticker_status'] = test_ticker.user_ticker_status
                    
                # Verify dict has all fields
                has_name = 'name_custom' in ticker_dict and ticker_dict['name_custom'] == "שם מותאם אישית - בדיקה"
                has_type = 'type_custom' in ticker_dict and ticker_dict['type_custom'] == "מניה"
                has_status = 'user_ticker_status' in ticker_dict
                has_remarks = 'remarks' in ticker_dict and ticker_dict['remarks'] is not None
                
                if has_name and has_type and has_status and has_remarks:
                    self.log_pass("API simulation successful - all fields present")
                    self.log_info(f"  name_custom: {ticker_dict.get('name_custom')}")
                    self.log_info(f"  type_custom: {ticker_dict.get('type_custom')}")
                    self.log_info(f"  user_ticker_status: {ticker_dict.get('user_ticker_status')}")
                    self.log_info(f"  remarks: {ticker_dict.get('remarks')[:50]}...")
                    return True
                else:
                    self.log_fail(f"API simulation failed: name={has_name}, type={has_type}, status={has_status}, remarks={has_remarks}")
                    return False
            else:
                self.log_fail("Ticker not found in get_user_tickers")
                return False
                
        except Exception as e:
            self.log_fail(f"API simulation failed: {e}")
            return False
            
    def cleanup(self):
        """Cleanup: Optionally remove test data"""
        self.log_step(7, "Cleanup (Optional)")
        
        try:
            # Remove user-ticker association
            user_ticker = self.db.query(UserTicker).filter(
                UserTicker.user_id == self.test_user_id,
                UserTicker.ticker_id == self.test_ticker_id
            ).first()
            
            if user_ticker:
                self.db.delete(user_ticker)
                self.log_info("Removed user-ticker association")
                
            # Optionally remove ticker (commented out to keep for inspection)
            # ticker = self.db.query(Ticker).filter(Ticker.id == self.test_ticker_id).first()
            # if ticker:
            #     self.db.delete(ticker)
            #     self.log_info("Removed test ticker")
                
            self.db.commit()
            self.log_info("Cleanup completed (test data kept for inspection)")
            
        except Exception as e:
            self.log_fail(f"Cleanup failed: {e}")
            
    def run_full_workflow(self):
        """Run the complete workflow test"""
        print(f"\n{Colors.BOLD}{'='*60}")
        print(f"Full User-Ticker Workflow Test")
        print(f"{'='*60}{Colors.RESET}\n")
        
        if not self.setup_test_data():
            return 1
            
        steps = [
            self.test_1_create_or_associate_ticker,
            self.test_2_update_custom_fields,
            self.test_3_save_remarks,
            self.test_4_verify_data,
            self.test_5_status_updates,
            self.test_6_api_simulation
        ]
        
        all_passed = True
        for step in steps:
            if not step():
                all_passed = False
                break
                
        # Optional cleanup
        # self.cleanup()
        
        # Summary
        print(f"\n{Colors.BOLD}{'='*60}")
        print(f"Workflow Test Summary")
        print(f"{'='*60}{Colors.RESET}")
        print(f"{Colors.GREEN}✅ Passed: {self.passed}{Colors.RESET}")
        print(f"{Colors.RED}❌ Failed: {self.failed}{Colors.RESET}")
        print(f"{'='*60}\n")
        
        if all_passed and self.failed == 0:
            print(f"{Colors.GREEN}{Colors.BOLD}🎉 Full workflow test passed!{Colors.RESET}")
            print(f"\n{Colors.BLUE}Test ticker ID: {self.test_ticker_id}")
            print(f"Test user ID: {self.test_user_id}{Colors.RESET}")
            return 0
        else:
            print(f"{Colors.RED}{Colors.BOLD}❌ Workflow test failed{Colors.RESET}")
            return 1
            
    def __del__(self):
        if hasattr(self, 'db'):
            self.db.close()

if __name__ == "__main__":
    import sys
    tester = WorkflowTester()
    sys.exit(tester.run_full_workflow())


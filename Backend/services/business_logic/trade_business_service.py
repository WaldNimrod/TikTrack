"""
Trade Business Logic Service - TikTrack
========================================

Business logic for trade calculations, validations, and rule applications.
Moved from frontend to ensure consistency and centralization.

Documentation:
- documentation/02-ARCHITECTURE/BACKEND/BUSINESS_LOGIC_LAYER.md
"""

from __future__ import annotations

import logging
from decimal import Decimal
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from .base_business_service import BaseBusinessService
from .business_rules_registry import business_rules_registry

logger = logging.getLogger(__name__)


class TradeBusinessService(BaseBusinessService):
    """
    Business logic service for trades.
    
    Handles all trade-related calculations, validations, and business rules.
    """
    
    @property
    def table_name(self) -> Optional[str]:
        """Return the database table name for trades."""
        return 'trades'
    
    def __init__(self, db_session: Optional[Session] = None):
        """Initialize the trade business service."""
        super().__init__(db_session)
        self.registry = business_rules_registry
    
    # ========================================================================
    # Price Calculations
    # ========================================================================
    
    def calculate_stop_price(
        self,
        current_price: float,
        stop_percentage: float,
        side: str
    ) -> Dict[str, Any]:
        """
        Calculate stop price based on percentage.
        
        Args:
            current_price: Current price of the ticker
            stop_percentage: Stop percentage (e.g., 10 for 10%)
            side: Trade side ('Long', 'Short', 'buy', 'sell')
            
        Returns:
            Dict with 'stop_price' (float) and 'is_valid' (bool)
            
        Example:
            result = service.calculate_stop_price(100.0, 10.0, 'Long')
            # Returns: {'stop_price': 90.0, 'is_valid': True}
        """
        self.log_business_event('stop_price_calculation', {
            'current_price': current_price,
            'stop_percentage': stop_percentage,
            'side': side
        })
        
        # Validation
        if not current_price or current_price <= 0:
            return {
                'stop_price': 0.0,
                'is_valid': False,
                'error': 'Invalid current price for stop calculation'
            }
        
        if not stop_percentage or stop_percentage <= 0:
            return {
                'stop_price': 0.0,
                'is_valid': False,
                'error': 'Invalid stop percentage'
            }
        
        # Normalize side
        side_lower = side.lower() if side else 'long'
        is_long = side_lower in ['long', 'buy']
        
        # Calculate
        percentage = stop_percentage / 100.0
        
        if is_long:
            # For Long: Stop below current price
            stop_price = current_price * (1 - percentage)
        else:
            # For Short: Stop above current price
            stop_price = current_price * (1 + percentage)
        
        # Validate result
        if stop_price <= 0:
            return {
                'stop_price': 0.0,
                'is_valid': False,
                'error': 'Calculated stop price is invalid'
            }
        
        return {
            'stop_price': round(stop_price, 2),
            'is_valid': True,
            'error': None
        }
    
    def calculate_target_price(
        self,
        current_price: float,
        target_percentage: float,
        side: str
    ) -> Dict[str, Any]:
        """
        Calculate target price based on percentage.
        
        Args:
            current_price: Current price of the ticker
            target_percentage: Target percentage (e.g., 2000 for 2000%)
            side: Trade side ('Long', 'Short', 'buy', 'sell')
            
        Returns:
            Dict with 'target_price' (float) and 'is_valid' (bool)
        """
        self.log_business_event('target_price_calculation', {
            'current_price': current_price,
            'target_percentage': target_percentage,
            'side': side
        })
        
        # Validation
        if not current_price or current_price <= 0:
            return {
                'target_price': 0.0,
                'is_valid': False,
                'error': 'Invalid current price for target calculation'
            }
        
        if not target_percentage or target_percentage <= 0:
            return {
                'target_price': 0.0,
                'is_valid': False,
                'error': 'Invalid target percentage'
            }
        
        # Normalize side
        side_lower = side.lower() if side else 'long'
        is_long = side_lower in ['long', 'buy']
        
        # Calculate
        percentage = target_percentage / 100.0
        
        if is_long:
            # For Long: Target above current price
            target_price = current_price * (1 + percentage)
        else:
            # For Short: Target below current price
            target_price = current_price * (1 - percentage)
        
        # Validate result
        if target_price <= 0:
            return {
                'target_price': 0.0,
                'is_valid': False,
                'error': 'Calculated target price is invalid'
            }
        
        return {
            'target_price': round(target_price, 2),
            'is_valid': True,
            'error': None
        }
    
    def calculate_percentage_from_price(
        self,
        current_price: float,
        target_price: float,
        side: str
    ) -> Dict[str, Any]:
        """
        Calculate percentage from current price to target price.
        
        Args:
            current_price: Current price
            target_price: Target price
            side: Trade side ('Long', 'Short', 'buy', 'sell')
            
        Returns:
            Dict with 'percentage' (float) and 'is_valid' (bool)
        """
        # Validation
        if not current_price or current_price <= 0:
            return {
                'percentage': 0.0,
                'is_valid': False,
                'error': 'Invalid current price for percentage calculation'
            }
        
        if not target_price or target_price <= 0:
            return {
                'percentage': 0.0,
                'is_valid': False,
                'error': 'Invalid target price for percentage calculation'
            }
        
        # Normalize side
        side_lower = side.lower() if side else 'long'
        is_long = side_lower in ['long', 'buy']
        
        # Calculate percentage
        if is_long:
            percentage = (target_price - current_price) / current_price * 100
        else:
            percentage = (current_price - target_price) / current_price * 100
        
        # For stop price (target_price < current_price for Long, target_price > current_price for Short),
        # percentage will be negative. In the system, stop percentage is always positive.
        # So we use absolute value to ensure consistency with frontend expectations.
        # Note: This function is used for both stop and target prices, but stop percentage
        # should always be positive in the UI (10% not -10%).
        percentage = abs(percentage)
        
        return {
            'percentage': round(percentage, 2),
            'is_valid': True,
            'error': None
        }
    
    # ========================================================================
    # Investment Calculations
    # ========================================================================
    
    def calculate_investment(
        self,
        price: Optional[float] = None,
        quantity: Optional[float] = None,
        amount: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Calculate investment values (price, quantity, amount).
        Provides bidirectional conversions between these values.
        
        Args:
            price: Entry price per share
            quantity: Number of shares
            amount: Total investment amount
            
        Returns:
            Dict with calculated values and 'is_valid' (bool)
            
        Example:
            # Calculate amount from price and quantity
            result = service.calculate_investment(price=100.0, quantity=10.0)
            # Returns: {'price': 100.0, 'quantity': 10.0, 'amount': 1000.0, 'is_valid': True}
            
            # Calculate quantity from price and amount
            result = service.calculate_investment(price=100.0, amount=1000.0)
            # Returns: {'price': 100.0, 'quantity': 10.0, 'amount': 1000.0, 'is_valid': True}
        """
        self.log_business_event('investment_calculation', {
            'price': price,
            'quantity': quantity,
            'amount': amount
        })
        
        # Validate inputs
        price = price if price and price > 0 else None
        quantity = quantity if quantity and quantity > 0 else None
        amount = amount if amount and amount > 0 else None
        
        # Calculate missing value
        if price and quantity and not amount:
            # Calculate amount
            amount = price * quantity
        elif price and amount and not quantity:
            # Calculate quantity
            quantity = amount / price
        elif quantity and amount and not price:
            # Calculate price
            price = amount / quantity
        elif price and quantity and amount:
            # All provided - validate consistency
            calculated_amount = price * quantity
            if abs(calculated_amount - amount) > 0.01:  # Allow small rounding differences
                return {
                    'price': price,
                    'quantity': quantity,
                    'amount': amount,
                    'is_valid': False,
                    'error': 'Provided values are inconsistent'
                }
        else:
            return {
                'price': price or 0.0,
                'quantity': quantity or 0.0,
                'amount': amount or 0.0,
                'is_valid': False,
                'error': 'At least two values (price, quantity, amount) must be provided'
            }
        
        # Validate results
        if price and price <= 0:
            return {
                'price': 0.0,
                'quantity': quantity or 0.0,
                'amount': amount or 0.0,
                'is_valid': False,
                'error': 'Calculated price is invalid'
            }
        
        if quantity and quantity <= 0:
            return {
                'price': price or 0.0,
                'quantity': 0.0,
                'amount': amount or 0.0,
                'is_valid': False,
                'error': 'Calculated quantity is invalid'
            }
        
        if amount and amount <= 0:
            return {
                'price': price or 0.0,
                'quantity': quantity or 0.0,
                'amount': 0.0,
                'is_valid': False,
                'error': 'Calculated amount is invalid'
            }
        
        return {
            'price': round(price, 2) if price else 0.0,
            'quantity': round(quantity, 4) if quantity else 0.0,  # Support fractional shares
            'amount': round(amount, 2) if amount else 0.0,
            'is_valid': True,
            'error': None
        }
    
    # ========================================================================
    # P/L Calculations
    # ========================================================================
    
    def calculate_pl(
        self,
        entry_price: float,
        exit_price: float,
        quantity: float,
        side: str
    ) -> Dict[str, Any]:
        """
        Calculate profit/loss for a trade.
        
        Args:
            entry_price: Entry price
            exit_price: Exit price
            quantity: Number of shares
            side: Trade side ('Long', 'Short', 'buy', 'sell')
            
        Returns:
            Dict with 'pl' (float), 'pl_percent' (float), and 'is_valid' (bool)
        """
        # Validation
        if not entry_price or entry_price <= 0:
            return {
                'pl': 0.0,
                'pl_percent': 0.0,
                'is_valid': False,
                'error': 'Invalid entry price'
            }
        
        if not exit_price or exit_price <= 0:
            return {
                'pl': 0.0,
                'pl_percent': 0.0,
                'is_valid': False,
                'error': 'Invalid exit price'
            }
        
        if not quantity or quantity <= 0:
            return {
                'pl': 0.0,
                'pl_percent': 0.0,
                'is_valid': False,
                'error': 'Invalid quantity'
            }
        
        # Normalize side
        side_lower = side.lower() if side else 'long'
        is_long = side_lower in ['long', 'buy']
        
        # Calculate P/L
        if is_long:
            pl = (exit_price - entry_price) * quantity
        else:
            pl = (entry_price - exit_price) * quantity
        
        pl_percent = (pl / (entry_price * quantity)) * 100 if entry_price * quantity > 0 else 0.0
        
        return {
            'pl': round(pl, 2),
            'pl_percent': round(pl_percent, 2),
            'is_valid': True,
            'error': None
        }
    
    def calculate_risk_reward(
        self,
        entry_price: float,
        stop_price: float,
        target_price: float,
        quantity: float,
        side: str
    ) -> Dict[str, Any]:
        """
        Calculate risk/reward ratio for a trade.
        
        Args:
            entry_price: Entry price
            stop_price: Stop loss price
            target_price: Take profit price
            quantity: Number of shares
            side: Trade side ('Long', 'Short', 'buy', 'sell')
            
        Returns:
            Dict with 'risk' (float), 'reward' (float), 'ratio' (float), and 'is_valid' (bool)
        """
        # Calculate risk (loss if stop is hit)
        stop_result = self.calculate_pl(entry_price, stop_price, quantity, side)
        if not stop_result['is_valid']:
            return {
                'risk': 0.0,
                'reward': 0.0,
                'ratio': 0.0,
                'is_valid': False,
                'error': 'Invalid stop price calculation'
            }
        risk = abs(stop_result['pl'])  # Risk is always positive (absolute loss)
        
        # Calculate reward (profit if target is hit)
        target_result = self.calculate_pl(entry_price, target_price, quantity, side)
        if not target_result['is_valid']:
            return {
                'risk': risk,
                'reward': 0.0,
                'ratio': 0.0,
                'is_valid': False,
                'error': 'Invalid target price calculation'
            }
        reward = target_result['pl'] if target_result['pl'] > 0 else 0.0
        
        # Calculate ratio
        ratio = reward / risk if risk > 0 else 0.0
        
        return {
            'risk': round(risk, 2),
            'reward': round(reward, 2),
            'ratio': round(ratio, 2),
            'is_valid': True,
            'error': None
        }
    
    # ========================================================================
    # Validation
    # ========================================================================
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate trade data according to business rules.
        
        Validation order (CRITICAL - must follow this order):
        1. Database Constraints (ValidationService) - checks NOT NULL, UNIQUE, FOREIGN KEY, ENUM, RANGE, CHECK
        2. Business Rules Registry - checks min/max, allowed_values, required (only if not in Constraints)
        3. Complex Business Rules - checks business logic (e.g., price*quantity validation)
        
        Args:
            data: Trade data dictionary
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        # Step 0: Explicit user_id validation (BEFORE constraint validation)
        if 'user_id' not in data or data.get('user_id') is None:
            errors.append("user_id is required for trade creation")
        
        # Step 1: Validate against database constraints (FIRST!)
        is_valid, constraint_errors = self.validate_with_constraints(data)
        if not is_valid:
            errors.extend(constraint_errors)
            self.logger.debug(f"Constraint validation found {len(constraint_errors)} errors")
        
        # Step 2: Validate against business rules registry (SECOND!)
        # Note: BusinessRulesRegistry יכול לבדוק חוקים מורכבים יותר מ-Constraints
        # (למשל: min/max values שלא מוגדרים ב-CHECK constraints, או חוקים דינמיים)
        from .utils.edge_cases_utils import is_empty_value
        
        for field, value in data.items():
            if is_empty_value(value):
                continue
            
            rule_result = self.registry.validate_value('trade', field, value)
            if not rule_result['is_valid']:
                errors.append(rule_result['error'])
        
        # Step 3: Complex business rules (THIRD!)
        if 'price' in data and 'quantity' in data:
            price = data.get('price')
            quantity = data.get('quantity')
            if price and quantity:
                # Validate investment calculation
                inv_result = self.calculate_investment(price=price, quantity=quantity)
                if not inv_result['is_valid']:
                    errors.append(f"Invalid price/quantity combination: {inv_result.get('error')}")
        
        # Validate stop/target prices if provided
        if 'entry_price' in data and 'stop_price' in data:
            entry = data.get('entry_price')
            stop = data.get('stop_price')
            side = data.get('side', 'long')
            if entry and stop:
                # Stop should be below entry for long, above for short
                side_lower = side.lower()
                is_long = side_lower in ['long', 'buy']
                if is_long and stop >= entry:
                    errors.append("Stop price must be below entry price for long positions")
                elif not is_long and stop <= entry:
                    errors.append("Stop price must be above entry price for short positions")
        
        if 'entry_price' in data and 'target_price' in data:
            entry = data.get('entry_price')
            target = data.get('target_price')
            side = data.get('side', 'long')
            if entry and target:
                # Target should be above entry for long, below for short
                side_lower = side.lower()
                is_long = side_lower in ['long', 'buy']
                if is_long and target <= entry:
                    errors.append("Target price must be above entry price for long positions")
                elif not is_long and target >= entry:
                    errors.append("Target price must be below entry price for short positions")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform trade calculations.
        
        Args:
            data: Trade data dictionary
            
        Returns:
            Dict with calculated values
        """
        results = {}
        
        # Calculate investment if price and quantity provided
        if 'price' in data and 'quantity' in data:
            inv_result = self.calculate_investment(
                price=data.get('price'),
                quantity=data.get('quantity')
            )
            if inv_result['is_valid']:
                results['amount'] = inv_result['amount']
        
        # Calculate P/L if entry and exit provided
        if 'entry_price' in data and 'exit_price' in data and 'quantity' in data:
            pl_result = self.calculate_pl(
                entry_price=data.get('entry_price'),
                exit_price=data.get('exit_price'),
                quantity=data.get('quantity'),
                side=data.get('side', 'long')
            )
            if pl_result['is_valid']:
                results['pl'] = pl_result['pl']
                results['pl_percent'] = pl_result['pl_percent']
        
        # Calculate risk/reward if stop and target provided
        if all(k in data for k in ['entry_price', 'stop_price', 'target_price', 'quantity']):
            rr_result = self.calculate_risk_reward(
                entry_price=data.get('entry_price'),
                stop_price=data.get('stop_price'),
                target_price=data.get('target_price'),
                quantity=data.get('quantity'),
                side=data.get('side', 'long')
            )
            if rr_result['is_valid']:
                results['risk'] = rr_result['risk']
                results['reward'] = rr_result['reward']
                results['risk_reward_ratio'] = rr_result['ratio']
        
        return results
    
    def validate_trade_plan_change(
        self,
        new_trade_plan_id: Optional[int],
        trade_data: Dict[str, Any],
        trade_plan_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Validate changing a trade's trade plan.
        
        This includes checking:
        - Ticker match between trade and plan
        - Side match (Long/Short)
        - Date validation (plan created_at <= trade opened_at)
        
        Args:
            new_trade_plan_id: New trade plan ID (None means removing plan)
            trade_data: Current trade data
            trade_plan_data: Optional trade plan data (if not provided, will need to be fetched)
            
        Returns:
            Dict with 'is_valid' (bool), 'errors' (List[str]), and 'message' (str)
        """
        errors = []
        
        # If no plan ID, it's valid (removing plan)
        if not new_trade_plan_id:
            return {
                'is_valid': True,
                'errors': [],
                'message': ''
            }
        
        # Basic validation
        if new_trade_plan_id <= 0:
            errors.append("Invalid trade plan ID")
            return {
                'is_valid': False,
                'errors': errors,
                'message': 'Invalid trade plan ID'
            }
        
        # Business rule: Can't change plan if trade is closed
        if trade_data.get('status') == 'closed':
            errors.append("Cannot change trade plan for closed trades")
            return {
                'is_valid': False,
                'errors': errors,
                'message': 'Cannot change trade plan for closed trades'
            }
        
        # If trade plan data provided, validate it
        if trade_plan_data:
            # Check ticker match
            trade_ticker_id = trade_data.get('ticker_id')
            plan_ticker_id = trade_plan_data.get('ticker_id')
            if trade_ticker_id and plan_ticker_id and trade_ticker_id != plan_ticker_id:
                trade_ticker_symbol = trade_data.get('ticker_symbol', 'שונה')
                plan_ticker_symbol = trade_plan_data.get('ticker', {}).get('symbol', 'שונה') if isinstance(trade_plan_data.get('ticker'), dict) else trade_plan_data.get('ticker_symbol', 'שונה')
                errors.append(
                    f"התוכנית החדשה מקושרת לטיקר {plan_ticker_symbol} ואילו הטרייד מקושר לטיקר {trade_ticker_symbol}. "
                    "לא ניתן לקשר תוכנית לטיקר אחר."
                )
            
            # Check side match
            trade_side = trade_data.get('side', '').lower()
            plan_side = trade_plan_data.get('side', '').lower()
            if trade_side and plan_side:
                # Normalize sides
                trade_is_long = trade_side in ['long', 'buy']
                plan_is_long = plan_side in ['long', 'buy']
                if trade_is_long != plan_is_long:
                    trade_side_display = 'Long' if trade_is_long else 'Short'
                    plan_side_display = 'Long' if plan_is_long else 'Short'
                    errors.append(
                        f"התוכנית החדשה היא {plan_side_display} ואילו הטרייד הוא {trade_side_display}. "
                        "לא ניתן לקשר תוכנית לצד אחר."
                    )
            
            # Check date validation (plan created_at <= trade opened_at)
            plan_created_at = trade_plan_data.get('created_at')
            trade_opened_at = trade_data.get('opened_at')
            if plan_created_at and trade_opened_at:
                from datetime import datetime
                try:
                    plan_date = datetime.fromisoformat(plan_created_at.replace('Z', '+00:00')) if isinstance(plan_created_at, str) else plan_created_at
                    trade_date = datetime.fromisoformat(trade_opened_at.replace('Z', '+00:00')) if isinstance(trade_opened_at, str) else trade_opened_at
                    
                    if plan_date > trade_date:
                        errors.append(
                            f"תאריך יצירת התוכנית מאוחר מתאריך פתיחת הטרייד. "
                            "לא ניתן לקשר תוכנית שנוצרה אחרי פתיחת הטרייד."
                        )
                except (ValueError, AttributeError) as e:
                    # Date parsing failed - add error instead of silently skipping
                    error_msg = f"שגיאה בפענוח תאריכים: תאריך יצירת תוכנית או תאריך פתיחת טרייד לא תקין"
                    errors.append(error_msg)
                    self.logger.error(
                        f"Failed to parse dates for trade plan validation: plan_created_at={plan_created_at}, "
                        f"trade_opened_at={trade_opened_at}, error={str(e)}"
                    )
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors,
            'message': errors[0] if errors else ''
        }
    
    def validate_trade_changes(
        self,
        original_trade: Dict[str, Any],
        updated_trade: Dict[str, Any],
        trade_plan_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Validate changes to a trade.
        
        This includes checking:
        - Trade plan changes (ticker, side, date validation)
        - Ticker changes
        - Status changes (position validation)
        - Date validation (closed_at >= opened_at)
        
        Args:
            original_trade: Original trade data
            updated_trade: Updated trade data
            trade_plan_data: Optional trade plan data for validation
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        # Business rule: Can't change critical fields if trade is closed
        if original_trade.get('status') == 'closed':
            critical_fields = ['price', 'quantity', 'side', 'entry_price', 'ticker_id']
            for field in critical_fields:
                original_value = original_trade.get(field)
                updated_value = updated_trade.get(field)
                if updated_value is not None and updated_value != original_value:
                    errors.append(f"Cannot change {field} for closed trades")
        
        # Check trade plan changes
        original_plan_id = original_trade.get('trade_plan_id')
        updated_plan_id = updated_trade.get('trade_plan_id')
        
        # Normalize to integers or None
        original_plan_id = int(original_plan_id) if original_plan_id else None
        updated_plan_id = int(updated_plan_id) if updated_plan_id else None
        
        if original_plan_id != updated_plan_id:
            # Validate trade plan change
            plan_validation = self.validate_trade_plan_change(
                updated_plan_id,
                updated_trade,
                trade_plan_data
            )
            if not plan_validation['is_valid']:
                errors.extend(plan_validation['errors'])
        
        # Check ticker changes
        original_ticker_id = original_trade.get('ticker_id')
        updated_ticker_id = updated_trade.get('ticker_id')
        
        original_ticker_id = int(original_ticker_id) if original_ticker_id else None
        updated_ticker_id = int(updated_ticker_id) if updated_ticker_id else None
        
        if original_ticker_id != updated_ticker_id:
            # Business rule: Can't change ticker if trade has executions
            # (This would need to be checked with database, but we validate here)
            if original_trade.get('status') == 'closed':
                errors.append("Cannot change ticker for closed trades")
        
        # Check status changes
        if updated_trade.get('status') == 'closed' and original_trade.get('status') != 'closed':
            # Business rule: Validate position before closing
            # (Position validation would need database access)
            # For now, we just check that required fields are present
            if not updated_trade.get('closed_at'):
                errors.append("closed_at is required when closing a trade")
        
        # Date validation: closed_at >= opened_at
        opened_at = updated_trade.get('opened_at') or original_trade.get('opened_at')
        closed_at = updated_trade.get('closed_at')
        
        if opened_at and closed_at:
            from datetime import datetime
            try:
                opened_date = datetime.fromisoformat(opened_at.replace('Z', '+00:00')) if isinstance(opened_at, str) else opened_at
                closed_date = datetime.fromisoformat(closed_at.replace('Z', '+00:00')) if isinstance(closed_at, str) else closed_at
                
                if closed_date < opened_date:
                    errors.append(
                        f"תאריך סגירה לא יכול להיות לפני תאריך יצירה"
                    )
            except (ValueError, AttributeError) as e:
                # Date parsing failed - add error instead of silently skipping
                error_msg = f"שגיאה בפענוח תאריכים: תאריך פתיחה או תאריך סגירה לא תקין"
                errors.append(error_msg)
                self.logger.error(
                    f"Failed to parse dates for trade validation: opened_at={opened_at}, "
                    f"closed_at={closed_at}, error={str(e)}"
                )
        
        # Validate updated data
        validation_result = self.validate(updated_trade)
        if not validation_result['is_valid']:
            errors.extend(validation_result['errors'])
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }


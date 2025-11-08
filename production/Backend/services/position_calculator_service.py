"""
Position Calculator Service - TikTrack
מערכת חישוב פוזיציות טריידים

תאריך: 24/10/2025
גרסה: 1.0.0
מטרה: חישוב פוזיציות נוכחיות לטריידים על בסיס ביצועים
"""

from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, List, Optional, Any
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class PositionCalculatorService:
    """
    Service for calculating current trade positions based on executions
    """
    
    def __init__(self):
        self.logger = logger
    
    def calculate_position(self, db: Session, trade_id: int) -> Optional[Dict[str, Any]]:
        """
        Calculate current position for a single trade
        
        Args:
            db: Database session
            trade_id: Trade ID to calculate position for
            
        Returns:
            Dict with position data or None if no executions
        """
        try:
            # Get all executions for this trade
            query = text("""
                SELECT action, quantity, price, fee, date, created_at
                FROM executions 
                WHERE trade_id = :trade_id 
                ORDER BY date ASC, created_at ASC
            """)
            
            result = db.execute(query, {"trade_id": trade_id})
            executions = result.fetchall()
            
            if not executions:
                self.logger.info(f"No executions found for trade {trade_id}")
                return None
            
            # Calculate position
            total_bought = 0.0
            total_sold = 0.0
            total_cost = 0.0
            total_fees = 0.0
            last_execution_date = None
            
            for execution in executions:
                action = execution.action
                quantity = float(execution.quantity)
                price = float(execution.price)
                fee = float(execution.fee or 0)
                exec_date = execution.date or execution.created_at
                
                # Convert string to datetime if needed
                if isinstance(exec_date, str):
                    try:
                        exec_date = datetime.fromisoformat(exec_date.replace('Z', '+00:00'))
                    except:
                        exec_date = datetime.now()
                
                if last_execution_date is None or exec_date > last_execution_date:
                    last_execution_date = exec_date
                
                if action == 'buy':
                    total_bought += quantity
                    total_cost += (quantity * price) + fee
                    total_fees += fee
                elif action == 'sell':
                    total_sold += quantity
                    total_fees += fee
            
            # Calculate net position
            net_quantity = total_bought - total_sold
            
            # Calculate average price (only for bought shares)
            if total_bought > 0:
                average_price = total_cost / total_bought
            else:
                average_price = 0.0
            
            # Determine position side
            if net_quantity > 0:
                side = 'long'
            elif net_quantity < 0:
                side = 'short'
            else:
                side = 'closed'
            
            position_data = {
                'quantity': net_quantity,
                'average_price': average_price,
                'total_cost': total_cost,
                'total_fees': total_fees,
                'side': side,
                'last_updated': last_execution_date.isoformat() if last_execution_date and hasattr(last_execution_date, 'isoformat') else str(last_execution_date) if last_execution_date else None,
                'total_bought': total_bought,
                'total_sold': total_sold
            }
            
            self.logger.info(f"Calculated position for trade {trade_id}: {position_data}")
            return position_data
            
        except Exception as e:
            self.logger.error(f"Error calculating position for trade {trade_id}: {str(e)}")
            return None
    
    def calculate_positions_batch(self, db: Session, trade_ids: List[int]) -> Dict[int, Optional[Dict[str, Any]]]:
        """
        Calculate positions for multiple trades in batch
        
        Args:
            db: Database session
            trade_ids: List of trade IDs to calculate positions for
            
        Returns:
            Dict mapping trade_id to position data
        """
        try:
            if not trade_ids:
                return {}
            
            # Get all executions for these trades in one query
            placeholders = ','.join([':trade_id_' + str(i) for i in range(len(trade_ids))])
            params = {f'trade_id_{i}': trade_id for i, trade_id in enumerate(trade_ids)}
            
            query = text(f"""
                SELECT trade_id, action, quantity, price, fee, date, created_at
                FROM executions 
                WHERE trade_id IN ({placeholders})
                ORDER BY trade_id, date ASC, created_at ASC
            """)
            
            result = db.execute(query, params)
            executions = result.fetchall()
            
            # Group executions by trade_id
            trade_executions = {}
            for execution in executions:
                trade_id = execution.trade_id
                if trade_id not in trade_executions:
                    trade_executions[trade_id] = []
                trade_executions[trade_id].append(execution)
            
            # Calculate position for each trade
            positions = {}
            for trade_id in trade_ids:
                if trade_id in trade_executions:
                    # Calculate position for this trade
                    execs = trade_executions[trade_id]
                    
                    total_bought = 0.0
                    total_sold = 0.0
                    total_cost = 0.0
                    total_fees = 0.0
                    last_execution_date = None
                    
                    for execution in execs:
                        action = execution.action
                        quantity = float(execution.quantity)
                        price = float(execution.price)
                        fee = float(execution.fee or 0)
                        exec_date = execution.date or execution.created_at
                        
                        if last_execution_date is None or exec_date > last_execution_date:
                            last_execution_date = exec_date
                        
                        if action == 'buy':
                            total_bought += quantity
                            total_cost += (quantity * price) + fee
                            total_fees += fee
                        elif action == 'sell':
                            total_sold += quantity
                            total_fees += fee
                    
                    # Calculate net position
                    net_quantity = total_bought - total_sold
                    
                    # Calculate average price (only for bought shares)
                    if total_bought > 0:
                        average_price = total_cost / total_bought
                    else:
                        average_price = 0.0
                    
                    # Determine position side
                    if net_quantity > 0:
                        side = 'long'
                    elif net_quantity < 0:
                        side = 'short'
                    else:
                        side = 'closed'
                    
                    positions[trade_id] = {
                        'quantity': net_quantity,
                        'average_price': average_price,
                        'total_cost': total_cost,
                        'total_fees': total_fees,
                        'side': side,
                        'last_updated': last_execution_date.isoformat() if last_execution_date and hasattr(last_execution_date, 'isoformat') else str(last_execution_date) if last_execution_date else None,
                        'total_bought': total_bought,
                        'total_sold': total_sold
                    }
                else:
                    positions[trade_id] = None
            
            self.logger.info(f"Calculated positions for {len(trade_ids)} trades")
            return positions
            
        except Exception as e:
            self.logger.error(f"Error calculating batch positions: {str(e)}")
            return {trade_id: None for trade_id in trade_ids}
    
    def get_position_summary(self, db: Session, trade_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a summary of position data for display
        
        Args:
            db: Database session
            trade_id: Trade ID to get summary for
            
        Returns:
            Simplified position summary or None
        """
        position = self.calculate_position(db, trade_id)
        if not position:
            return None
        
        return {
            'quantity': position['quantity'],
            'average_price': position['average_price'],
            'side': position['side'],
            'last_updated': position['last_updated']
        }

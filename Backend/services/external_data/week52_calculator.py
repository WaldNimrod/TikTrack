"""
Week 52 Calculator Service
==========================

Service for calculating 52-week high and low prices from historical data.

Author: TikTrack Development Team
Date: November 2025
"""

import logging
from datetime import datetime, timedelta
from typing import Optional, List
from dataclasses import dataclass
from sqlalchemy.orm import Session
from sqlalchemy import and_

from models.external_data import MarketDataQuote

logger = logging.getLogger(__name__)


@dataclass
class Week52Result:
    """Result of 52-week range calculation with metadata"""
    high: Optional[float]
    low: Optional[float]
    source: str  # 'database' or 'provider'
    data_points_used: int
    warnings: List[str]


class Week52Calculator:
    """
    Service for calculating 52-week high and low prices.
    
    Calculates the highest and lowest prices from the last 52 weeks (365 days)
    of historical market data.
    """
    
    def __init__(self, db_session: Session):
        self.db_session = db_session
    
    def calculate_52w_range(
        self, 
        ticker_id: int, 
        db_session: Optional[Session] = None
    ) -> Optional[Week52Result]:
        """
        Calculate 52-week high and low from historical data.
        
        Args:
            ticker_id: Ticker ID
            db_session: Database session (optional, uses self.db_session if not provided)
            
        Returns:
            Week52Result if successful, None if insufficient data
        """
        session = db_session or self.db_session
        
        try:
            # Get data from last 52 weeks (365 days)
            cutoff_date = datetime.utcnow() - timedelta(days=365)
            
            quotes = session.query(MarketDataQuote).filter(
                and_(
                    MarketDataQuote.ticker_id == ticker_id,
                    MarketDataQuote.high_price.isnot(None),
                    MarketDataQuote.low_price.isnot(None),
                    MarketDataQuote.asof_utc >= cutoff_date
                )
            ).order_by(MarketDataQuote.asof_utc).all()
            
            if len(quotes) < 10:  # Minimum data points required
                logger.info(f"Insufficient database data for 52W range: {len(quotes)} quotes, need at least 10")
                return None
            
            # Calculate high and low
            valid_highs = [q.high_price for q in quotes if q.high_price is not None]
            valid_lows = [q.low_price for q in quotes if q.low_price is not None]
            
            if not valid_highs or not valid_lows:
                logger.warning(f"No valid high/low prices found for ticker {ticker_id}")
                return None
            
            high_52w = max(valid_highs)
            low_52w = min(valid_lows)
            
            logger.info(f"📊 Calculated 52W range from database: high={high_52w:.4f}, low={low_52w:.4f} (data points: {len(quotes)})")
            
            return Week52Result(
                high=high_52w,
                low=low_52w,
                source='database',
                data_points_used=len(quotes),
                warnings=[]
            )
            
        except Exception as e:
            logger.error(f"Error calculating 52W range for ticker {ticker_id}: {e}")
            return None


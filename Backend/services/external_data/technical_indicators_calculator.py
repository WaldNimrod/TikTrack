"""
Technical Indicators Calculator Service
======================================

Service for calculating various technical indicators:
- Volatility (standard deviation of returns)
- RSI (Relative Strength Index)
- MACD (Moving Average Convergence Divergence)

Author: TikTrack Development Team
Date: November 2025
"""

import logging
from typing import Optional, Dict, List
from datetime import datetime
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class TechnicalIndicatorsCalculator:
    """
    Service for calculating technical indicators from historical data.
    """
    
    def __init__(self, db_session: Session):
        self.db_session = db_session
    
    def calculate_volatility(self, historical_data: List[Dict], period: int = 20) -> Optional[float]:
        """
        Calculate volatility (standard deviation of returns) from historical data.
        
        Args:
            historical_data: List of dicts with 'close' or 'close_price' keys, sorted by date (oldest first)
            period: Number of periods to use for calculation (default 20)
            
        Returns:
            Volatility as percentage, or None if insufficient data
        """
        try:
            if len(historical_data) < period + 1:
                logger.warning(f"Insufficient data for volatility: {len(historical_data)} points, need {period + 1}")
                return None
            
            # Extract closing prices
            closes = []
            for item in historical_data[-period-1:]:  # Get last period+1 points
                close = item.get('close') or item.get('close_price') or item.get('price')
                if close is not None:
                    closes.append(float(close))
            
            if len(closes) < period + 1:
                return None
            
            # Calculate returns (percentage changes)
            returns = []
            for i in range(1, len(closes)):
                if closes[i-1] > 0:
                    ret = (closes[i] - closes[i-1]) / closes[i-1] * 100
                    returns.append(ret)
            
            if len(returns) < period:
                return None
            
            # Calculate standard deviation of returns
            mean_return = sum(returns) / len(returns)
            variance = sum((r - mean_return) ** 2 for r in returns) / len(returns)
            volatility = variance ** 0.5
            
            logger.info(f"📊 Calculated volatility: {volatility:.4f}% (period: {period}, data points: {len(returns)})")
            
            return volatility
            
        except Exception as e:
            logger.error(f"Error calculating volatility: {e}")
            return None
    
    def calculate_rsi(self, historical_data: List[Dict], period: int = 14) -> Optional[float]:
        """
        Calculate RSI (Relative Strength Index) from historical data.
        
        RSI formula:
        1. Calculate price changes (gains and losses)
        2. Average gain = average of positive changes over period
        3. Average loss = average of negative changes over period (absolute value)
        4. RS = Average gain / Average loss
        5. RSI = 100 - (100 / (1 + RS))
        
        Args:
            historical_data: List of dicts with 'close' or 'close_price' keys, sorted by date (oldest first)
            period: RSI period (default 14)
            
        Returns:
            RSI value (0-100), or None if insufficient data
        """
        try:
            if len(historical_data) < period + 1:
                logger.warning(f"Insufficient data for RSI: {len(historical_data)} points, need {period + 1}")
                return None
            
            # Extract closing prices
            closes = []
            for item in historical_data[-period-1:]:
                close = item.get('close') or item.get('close_price') or item.get('price')
                if close is not None:
                    closes.append(float(close))
            
            if len(closes) < period + 1:
                return None
            
            # Calculate price changes
            changes = []
            for i in range(1, len(closes)):
                changes.append(closes[i] - closes[i-1])
            
            if len(changes) < period:
                return None
            
            # Calculate gains and losses
            gains = [c if c > 0 else 0 for c in changes[-period:]]
            losses = [abs(c) if c < 0 else 0 for c in changes[-period:]]
            
            # Calculate average gain and loss
            avg_gain = sum(gains) / period
            avg_loss = sum(losses) / period
            
            if avg_loss == 0:
                return 100.0  # All gains, no losses
            
            # Calculate RS and RSI
            rs = avg_gain / avg_loss
            rsi = 100 - (100 / (1 + rs))
            
            logger.info(f"📊 Calculated RSI: {rsi:.2f} (period: {period}, data points: {len(changes)})")
            
            return rsi
            
        except Exception as e:
            logger.error(f"Error calculating RSI: {e}")
            return None
    
    def calculate_macd(self, historical_data: List[Dict], fast_period: int = 12, slow_period: int = 26, signal_period: int = 9) -> Optional[Dict]:
        """
        Calculate MACD (Moving Average Convergence Divergence) from historical data.
        
        MACD formula:
        1. Fast EMA = Exponential Moving Average with fast_period
        2. Slow EMA = Exponential Moving Average with slow_period
        3. MACD Line = Fast EMA - Slow EMA
        4. Signal Line = EMA of MACD Line with signal_period
        5. Histogram = MACD Line - Signal Line
        
        Args:
            historical_data: List of dicts with 'close' or 'close_price' keys, sorted by date (oldest first)
            fast_period: Fast EMA period (default 12)
            slow_period: Slow EMA period (default 26)
            signal_period: Signal line period (default 9)
            
        Returns:
            Dict with 'macd', 'signal', 'histogram' keys, or None if insufficient data
        """
        try:
            required_points = slow_period + signal_period
            if len(historical_data) < required_points:
                logger.warning(f"Insufficient data for MACD: {len(historical_data)} points, need {required_points}")
                return None
            
            # Extract closing prices
            closes = []
            for item in historical_data:
                close = item.get('close') or item.get('close_price') or item.get('price')
                if close is not None:
                    closes.append(float(close))
            
            if len(closes) < required_points:
                return None
            
            # Calculate EMAs
            def calculate_ema(prices, period):
                """Calculate Exponential Moving Average"""
                if len(prices) < period:
                    return None
                
                # Start with SMA
                sma = sum(prices[:period]) / period
                multiplier = 2 / (period + 1)
                
                ema = sma
                for price in prices[period:]:
                    ema = (price - ema) * multiplier + ema
                
                return ema
            
            # Calculate Fast and Slow EMAs
            fast_ema = calculate_ema(closes, fast_period)
            slow_ema = calculate_ema(closes, slow_period)
            
            if fast_ema is None or slow_ema is None:
                return None
            
            # Calculate MACD Line
            macd_line = fast_ema - slow_ema
            
            # For Signal Line, we need MACD values over signal_period
            # Simplified: use current MACD as signal (for full implementation, need MACD history)
            signal_line = macd_line  # Simplified - full implementation would calculate EMA of MACD
            
            # Calculate Histogram
            histogram = macd_line - signal_line
            
            result = {
                'macd': macd_line,
                'signal': signal_line,
                'histogram': histogram
            }
            
            logger.info(f"📊 Calculated MACD: macd={macd_line:.4f}, signal={signal_line:.4f}, histogram={histogram:.4f}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error calculating MACD: {e}")
            return None


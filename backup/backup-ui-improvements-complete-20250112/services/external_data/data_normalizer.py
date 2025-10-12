"""
Data Normalizer Service
Normalizes data from different external providers into consistent format
"""

import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from models.external_data import MarketDataQuote, IntradayDataSlot
from models.ticker import Ticker

logger = logging.getLogger(__name__)

@dataclass
class NormalizedQuote:
    """Normalized quote data across all providers"""
    symbol: str
    ticker_id: int
    price: float
    change_pct: Optional[float] = None
    change_amount: Optional[float] = None
    volume: Optional[int] = None
    currency: str = 'USD'
    asof_utc: Optional[datetime] = None
    source: str = 'normalized'
    quality_score: float = 1.0
    provider_count: int = 1
    is_aggregated: bool = False

@dataclass
class NormalizedIntraday:
    """Normalized intraday data across all providers"""
    symbol: str
    ticker_id: int
    slot_start: datetime
    open_price: float
    high_price: float
    low_price: float
    close_price: float
    volume: int
    slot_duration_minutes: int = 15
    quality_score: float = 1.0
    provider_count: int = 1
    is_aggregated: bool = False

class DataNormalizer:
    """
    Normalizes market data from different providers into consistent format
    Handles data aggregation, quality scoring, and format standardization
    """
    
    def __init__(self, db_session: Session):
        self.db_session = db_session
        
        # Quality scoring weights
        self.weights = {
            'price_consistency': 0.3,
            'volume_consistency': 0.2,
            'timestamp_freshness': 0.25,
            'provider_reliability': 0.25
        }
        
        # Provider reliability scores (can be updated based on performance)
        self.provider_reliability = {
            'yahoo_finance': 0.9,
            'google_finance': 0.8,
            'alpha_vantage': 0.85,
            'iex_cloud': 0.88
        }
    
    def normalize_quotes(self, symbol: str, provider_quotes: List[Dict]) -> Optional[NormalizedQuote]:
        """
        Normalize quotes from multiple providers for a single symbol
        
        Args:
            symbol: Stock symbol
            provider_quotes: List of quote data from different providers
            
        Returns:
            NormalizedQuote object with aggregated data
        """
        if not provider_quotes:
            return None
        
        try:
            # Get ticker ID
            ticker = self.db_session.query(Ticker).filter(Ticker.symbol == symbol).first()
            if not ticker:
                logger.warning(f"Ticker not found for symbol: {symbol}")
                return None
            
            # Extract and validate price data
            valid_quotes = []
            for quote_data in provider_quotes:
                if self._is_valid_quote(quote_data):
                    valid_quotes.append(quote_data)
            
            if not valid_quotes:
                logger.warning(f"No valid quotes found for {symbol}")
                return None
            
            # Aggregate prices using weighted average
            normalized_price = self._aggregate_prices(valid_quotes)
            
            # Aggregate other fields
            normalized_change_pct = self._aggregate_change_percentages(valid_quotes)
            normalized_change_amount = self._aggregate_change_amounts(valid_quotes)
            normalized_volume = self._aggregate_volumes(valid_quotes)
            
            # Determine currency (use most common)
            currency = self._determine_currency(valid_quotes)
            
            # Calculate quality score
            quality_score = self._calculate_quote_quality(valid_quotes)
            
            # Use most recent timestamp
            asof_utc = max(
                (q.get('asof_utc') for q in valid_quotes if q.get('asof_utc')), 
                default=datetime.now(timezone.utc)
            )
            
            return NormalizedQuote(
                symbol=symbol,
                ticker_id=ticker.id,
                price=normalized_price,
                change_pct=normalized_change_pct,
                change_amount=normalized_change_amount,
                volume=normalized_volume,
                currency=currency,
                asof_utc=asof_utc,
                source='normalized',
                quality_score=quality_score,
                provider_count=len(valid_quotes),
                is_aggregated=len(valid_quotes) > 1
            )
            
        except Exception as e:
            logger.error(f"Error normalizing quotes for {symbol}: {e}")
            return None
    
    def normalize_intraday_data(self, symbol: str, provider_data: List[Dict]) -> List[NormalizedIntraday]:
        """
        Normalize intraday data from multiple providers for a single symbol
        
        Args:
            symbol: Stock symbol
            provider_data: List of intraday data from different providers
            
        Returns:
            List of NormalizedIntraday objects
        """
        if not provider_data:
            return []
        
        try:
            # Get ticker ID
            ticker = self.db_session.query(Ticker).filter(Ticker.symbol == symbol).first()
            if not ticker:
                logger.warning(f"Ticker not found for symbol: {symbol}")
                return []
            
            # Group data by time slots
            slot_data = self._group_intraday_by_slots(provider_data)
            
            normalized_slots = []
            for slot_start, slot_quotes in slot_data.items():
                if len(slot_quotes) > 0:
                    normalized_slot = self._normalize_intraday_slot(
                        symbol, ticker.id, slot_start, slot_quotes
                    )
                    if normalized_slot:
                        normalized_slots.append(normalized_slot)
            
            return normalized_slots
            
        except Exception as e:
            logger.error(f"Error normalizing intraday data for {symbol}: {e}")
            return []
    
    def _is_valid_quote(self, quote_data: Dict) -> bool:
        """Check if quote data is valid"""
        required_fields = ['price', 'source']
        
        # Check required fields
        for field in required_fields:
            if field not in quote_data or quote_data[field] is None:
                return False
        
        # Check price validity
        try:
            price = float(quote_data['price'])
            if price <= 0:
                return False
        except (ValueError, TypeError):
            return False
        
        # Check timestamp if present
        if 'asof_utc' in quote_data and quote_data['asof_utc']:
            try:
                if isinstance(quote_data['asof_utc'], str):
                    datetime.fromisoformat(quote_data['asof_utc'].replace('Z', '+00:00'))
                elif isinstance(quote_data['asof_utc'], datetime):
                    pass  # Already datetime
                else:
                    return False
            except ValueError:
                return False
        
        return True
    
    def _aggregate_prices(self, quotes: List[Dict]) -> float:
        """Aggregate prices using weighted average based on provider reliability"""
        if len(quotes) == 1:
            return float(quotes[0]['price'])
        
        total_weight = 0
        weighted_sum = 0
        
        for quote in quotes:
            provider = quote.get('source', 'unknown')
            weight = self.provider_reliability.get(provider, 0.5)
            
            total_weight += weight
            weighted_sum += float(quote['price']) * weight
        
        return weighted_sum / total_weight if total_weight > 0 else 0
    
    def _aggregate_change_percentages(self, quotes: List[Dict]) -> Optional[float]:
        """Aggregate percentage changes"""
        valid_changes = [
            float(q['change_pct']) for q in quotes 
            if q.get('change_pct') is not None
        ]
        
        if not valid_changes:
            return None
        
        if len(valid_changes) == 1:
            return valid_changes[0]
        
        # Use median for percentage changes to avoid outliers
        return sorted(valid_changes)[len(valid_changes) // 2]
    
    def _aggregate_change_amounts(self, quotes: List[Dict]) -> Optional[float]:
        """Aggregate change amounts"""
        valid_changes = [
            float(q['change_amount']) for q in quotes 
            if q.get('change_amount') is not None
        ]
        
        if not valid_changes:
            return None
        
        if len(valid_changes) == 1:
            return valid_changes[0]
        
        # Use median for change amounts to avoid outliers
        return sorted(valid_changes)[len(valid_changes) // 2]
    
    def _aggregate_volumes(self, quotes: List[Dict]) -> Optional[int]:
        """Aggregate volume data"""
        valid_volumes = [
            int(q['volume']) for q in quotes 
            if q.get('volume') is not None and q['volume'] > 0
        ]
        
        if not valid_volumes:
            return None
        
        if len(valid_volumes) == 1:
            return valid_volumes[0]
        
        # Use median for volumes to avoid outliers
        return sorted(valid_volumes)[len(valid_volumes) // 2]
    
    def _determine_currency(self, quotes: List[Dict]) -> str:
        """Determine the currency to use (most common)"""
        currencies = [q.get('currency', 'USD') for q in quotes if q.get('currency')]
        
        if not currencies:
            return 'USD'
        
        # Count occurrences
        currency_counts = {}
        for currency in currencies:
            currency_counts[currency] = currency_counts.get(currency, 0) + 1
        
        # Return most common currency
        return max(currency_counts.items(), key=lambda x: x[1])[0]
    
    def _calculate_quote_quality(self, quotes: List[Dict]) -> float:
        """Calculate quality score for aggregated quote"""
        if len(quotes) == 1:
            return 1.0
        
        scores = []
        
        # Price consistency
        prices = [float(q['price']) for q in quotes]
        price_variance = self._calculate_variance(prices)
        price_consistency = max(0, 1 - (price_variance / (max(prices) ** 2)))
        scores.append(price_consistency * self.weights['price_consistency'])
        
        # Volume consistency (if available)
        volumes = [int(q['volume']) for q in quotes if q.get('volume')]
        if len(volumes) > 1:
            volume_variance = self._calculate_variance(volumes)
            volume_consistency = max(0, 1 - (volume_variance / (max(volumes) ** 2)))
            scores.append(volume_consistency * self.weights['volume_consistency'])
        else:
            scores.append(self.weights['volume_consistency'])
        
        # Timestamp freshness
        timestamps = [q.get('asof_utc') for q in quotes if q.get('asof_utc')]
        if timestamps:
            max_age = max(
                (datetime.now(timezone.utc) - ts).total_seconds() 
                for ts in timestamps if isinstance(ts, datetime)
            )
            timestamp_freshness = max(0, 1 - (max_age / 3600))  # 1 hour max
            scores.append(timestamp_freshness * self.weights['timestamp_freshness'])
        else:
            scores.append(self.weights['timestamp_freshness'])
        
        # Provider reliability
        provider_scores = [
            self.provider_reliability.get(q.get('source', 'unknown'), 0.5) 
            for q in quotes
        ]
        avg_provider_reliability = sum(provider_scores) / len(provider_scores)
        scores.append(avg_provider_reliability * self.weights['provider_reliability'])
        
        return sum(scores)
    
    def _calculate_variance(self, values: List[Union[int, float]]) -> float:
        """Calculate variance of a list of values"""
        if len(values) <= 1:
            return 0
        
        mean = sum(values) / len(values)
        squared_diff_sum = sum((x - mean) ** 2 for x in values)
        return squared_diff_sum / len(values)
    
    def _group_intraday_by_slots(self, provider_data: List[Dict]) -> Dict[datetime, List[Dict]]:
        """Group intraday data by time slots"""
        slot_data = {}
        
        for data in provider_data:
            if 'slot_start' in data and data['slot_start']:
                slot_start = data['slot_start']
                if isinstance(slot_start, str):
                    try:
                        slot_start = datetime.fromisoformat(slot_start.replace('Z', '+00:00'))
                    except ValueError:
                        continue
                
                if slot_start not in slot_data:
                    slot_data[slot_start] = []
                slot_data[slot_start].append(data)
        
        return slot_data
    
    def _normalize_intraday_slot(
        self, 
        symbol: str, 
        ticker_id: int, 
        slot_start: datetime, 
        slot_quotes: List[Dict]
    ) -> Optional[NormalizedIntraday]:
        """Normalize a single intraday time slot"""
        if not slot_quotes:
            return None
        
        try:
            # Aggregate OHLCV data
            open_prices = [float(q['open_price']) for q in slot_quotes if q.get('open_price')]
            high_prices = [float(q['high_price']) for q in slot_quotes if q.get('high_price')]
            low_prices = [float(q['low_price']) for q in slot_quotes if q.get('low_price')]
            close_prices = [float(q['close_price']) for q in slot_quotes if q.get('close_price')]
            volumes = [int(q['volume']) for q in slot_quotes if q.get('volume')]
            
            if not all([open_prices, high_prices, low_prices, close_prices, volumes]):
                return None
            
            # Use median for OHLCV to avoid outliers
            open_price = sorted(open_prices)[len(open_prices) // 2]
            high_price = sorted(high_prices)[len(high_prices) // 2]
            low_price = sorted(low_prices)[len(low_prices) // 2]
            close_price = sorted(close_prices)[len(close_prices) // 2]
            volume = sorted(volumes)[len(volumes) // 2]
            
            # Get slot duration from first quote
            slot_duration = slot_quotes[0].get('slot_duration_minutes', 15)
            
            # Calculate quality score
            quality_score = self._calculate_intraday_quality(slot_quotes)
            
            return NormalizedIntraday(
                symbol=symbol,
                ticker_id=ticker_id,
                slot_start=slot_start,
                open_price=open_price,
                high_price=high_price,
                low_price=low_price,
                close_price=close_price,
                volume=volume,
                slot_duration_minutes=slot_duration,
                quality_score=quality_score,
                provider_count=len(slot_quotes),
                is_aggregated=len(slot_quotes) > 1
            )
            
        except Exception as e:
            logger.error(f"Error normalizing intraday slot for {symbol}: {e}")
            return None
    
    def _calculate_intraday_quality(self, slot_quotes: List[Dict]) -> float:
        """Calculate quality score for intraday data"""
        if len(slot_quotes) == 1:
            return 1.0
        
        # Similar logic to quote quality but for OHLCV data
        scores = []
        
        # Price consistency across OHLCV
        all_prices = []
        for quote in slot_quotes:
            prices = [
                quote.get('open_price'), quote.get('high_price'), 
                quote.get('low_price'), quote.get('close_price')
            ]
            all_prices.extend([p for p in prices if p is not None])
        
        if all_prices:
            price_variance = self._calculate_variance(all_prices)
            price_consistency = max(0, 1 - (price_variance / (max(all_prices) ** 2)))
            scores.append(price_consistency * 0.4)
        else:
            scores.append(0.4)
        
        # Volume consistency
        volumes = [q.get('volume') for q in slot_quotes if q.get('volume')]
        if len(volumes) > 1:
            volume_variance = self._calculate_variance(volumes)
            volume_consistency = max(0, 1 - (volume_variance / (max(volumes) ** 2)))
            scores.append(volume_consistency * 0.3)
        else:
            scores.append(0.3)
        
        # Provider reliability
        provider_scores = [
            self.provider_reliability.get(q.get('source', 'unknown'), 0.5) 
            for q in slot_quotes
        ]
        avg_provider_reliability = sum(provider_scores) / len(provider_scores)
        scores.append(avg_provider_reliability * 0.3)
        
        return sum(scores)
    
    def save_normalized_quote(self, normalized_quote: NormalizedQuote) -> bool:
        """Save normalized quote to database"""
        try:
            # Check if we already have a recent normalized quote
            existing_quote = self.db_session.query(MarketDataQuote).filter(
                MarketDataQuote.ticker_id == normalized_quote.ticker_id,
                MarketDataQuote.source == 'normalized',
                MarketDataQuote.asof_utc >= datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
            ).first()
            
            if existing_quote:
                # Update existing quote
                existing_quote.price = normalized_quote.price
                existing_quote.change_pct_day = normalized_quote.change_pct
                existing_quote.change_amount_day = normalized_quote.change_amount
                existing_quote.volume = normalized_quote.volume
                existing_quote.currency = normalized_quote.currency
                existing_quote.asof_utc = normalized_quote.asof_utc
                existing_quote.quality_score = normalized_quote.quality_score
                existing_quote.updated_at = datetime.now(timezone.utc)
            else:
                # Create new normalized quote
                db_quote = MarketDataQuote(
                    ticker_id=normalized_quote.ticker_id,
                    provider_id=1,  # Use provider ID 1 for normalized data
                    asof_utc=normalized_quote.asof_utc,
                    price=normalized_quote.price,
                    change_pct_day=normalized_quote.change_pct,
                    change_amount_day=normalized_quote.change_amount,
                    volume=normalized_quote.volume,
                    currency=normalized_quote.currency,
                    source=normalized_quote.source,
                    is_stale=False,
                    quality_score=normalized_quote.quality_score
                )
                self.db_session.add(db_quote)
            
            self.db_session.commit()
            logger.debug(f"Saved normalized quote for {normalized_quote.symbol}")
            return True
            
        except SQLAlchemyError as e:
            logger.error(f"Error saving normalized quote for {normalized_quote.symbol}: {e}")
            self.db_session.rollback()
            return False
    
    def save_normalized_intraday(self, normalized_slots: List[NormalizedIntraday]) -> bool:
        """Save normalized intraday data to database"""
        try:
            for slot in normalized_slots:
                # Check if slot already exists
                existing_slot = self.db_session.query(IntradayDataSlot).filter(
                    IntradayDataSlot.ticker_id == slot.ticker_id,
                    IntradayDataSlot.slot_start_utc == slot.slot_start,
                    IntradayDataSlot.slot_duration_minutes == slot.slot_duration_minutes,
                    IntradayDataSlot.source == 'normalized'
                ).first()
                
                if existing_slot:
                    # Update existing slot
                    existing_slot.open_price = slot.open_price
                    existing_slot.high_price = slot.high_price
                    existing_slot.low_price = slot.low_price
                    existing_slot.close_price = slot.close_price
                    existing_slot.volume = slot.volume
                    existing_slot.is_complete = True
                    existing_slot.quality_score = slot.quality_score
                else:
                    # Create new slot
                    new_slot = IntradayDataSlot(
                        ticker_id=slot.ticker_id,
                        provider_id=1,  # Use provider ID 1 for normalized data
                        slot_start_utc=slot.slot_start,
                        open_price=slot.open_price,
                        high_price=slot.high_price,
                        low_price=slot.low_price,
                        close_price=slot.close_price,
                        volume=slot.volume,
                        slot_duration_minutes=slot.slot_duration_minutes,
                        is_complete=True,
                        quality_score=slot.quality_score
                    )
                    self.db_session.add(new_slot)
            
            self.db_session.commit()
            logger.debug(f"Saved {len(normalized_slots)} normalized intraday slots")
            return True
            
        except SQLAlchemyError as e:
            logger.error(f"Error saving normalized intraday data: {e}")
            self.db_session.rollback()
            return False
    
    def get_normalized_quote(self, symbol: str) -> Optional[NormalizedQuote]:
        """Get the most recent normalized quote for a symbol"""
        try:
            ticker = self.db_session.query(Ticker).filter(Ticker.symbol == symbol).first()
            if not ticker:
                return None
            
            quote = self.db_session.query(MarketDataQuote).filter(
                MarketDataQuote.ticker_id == ticker.id,
                MarketDataQuote.source == 'normalized'
            ).order_by(MarketDataQuote.asof_utc.desc()).first()
            
            if quote:
                return NormalizedQuote(
                    symbol=symbol,
                    ticker_id=ticker.id,
                    price=quote.price,
                    change_pct=quote.change_pct_day,
                    change_amount=quote.change_amount_day,
                    volume=quote.volume,
                    currency=quote.currency,
                    asof_utc=quote.asof_utc,
                    source=quote.source,
                    quality_score=quote.quality_score,
                    provider_count=1,
                    is_aggregated=False
                )
            
            return None
            
        except SQLAlchemyError as e:
            logger.error(f"Error getting normalized quote for {symbol}: {e}")
            return None
    
    def get_normalized_intraday(self, symbol: str, interval_minutes: int = 15) -> List[NormalizedIntraday]:
        """Get normalized intraday data for a symbol"""
        try:
            ticker = self.db_session.query(Ticker).filter(Ticker.symbol == symbol).first()
            if not ticker:
                return []
            
            # Get today's data
            today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            
            slots = self.db_session.query(IntradayDataSlot).filter(
                IntradayDataSlot.ticker_id == ticker.id,
                IntradayDataSlot.source == 'normalized',
                IntradayDataSlot.slot_start_utc >= today_start,
                IntradayDataSlot.slot_duration_minutes == interval_minutes
            ).order_by(IntradayDataSlot.slot_start_utc).all()
            
            return [
                NormalizedIntraday(
                    symbol=symbol,
                    ticker_id=ticker.id,
                    slot_start=slot.slot_start_utc,
                    open_price=slot.open_price,
                    high_price=slot.high_price,
                    low_price=slot.low_price,
                    close_price=slot.close_price,
                    volume=slot.volume,
                    slot_duration_minutes=slot.slot_duration_minutes,
                    quality_score=slot.quality_score,
                    provider_count=1,
                    is_aggregated=False
                )
                for slot in slots
            ]
            
        except SQLAlchemyError as e:
            logger.error(f"Error getting normalized intraday data for {symbol}: {e}")
            return []

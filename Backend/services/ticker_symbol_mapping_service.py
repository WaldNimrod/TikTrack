"""
Ticker Symbol Mapping Service - TikTrack

This service manages mappings between internal ticker symbols and provider-specific symbols.
Allows different external data providers to use different symbol formats for the same ticker.

Example: Ticker "500X" might need "500X.MI" for Yahoo Finance.

Author: TikTrack Development Team
Version: 1.0
Date: January 2025
"""

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
import logging

from models.ticker import Ticker, TickerProviderSymbol
from models.external_data import ExternalDataProvider
from services.cache_service import cache_service

logger = logging.getLogger(__name__)

# Cache TTL for symbol mappings (5 minutes)
CACHE_TTL = 300


class TickerSymbolMappingService:
    """
    Service for managing ticker provider symbol mappings
    
    This service provides functionality to:
    - Get provider-specific symbols for tickers
    - Set/update provider symbol mappings
    - Delete mappings
    - Get all mappings for a ticker
    
    All operations are cached for performance.
    """
    
    @staticmethod
    def _get_cache_key(ticker_id: int, provider_id: int) -> str:
        """Generate cache key for ticker-provider mapping"""
        return f"ticker_symbol_mapping:{ticker_id}:{provider_id}"
    
    @staticmethod
    def _get_all_mappings_cache_key(ticker_id: int) -> str:
        """Generate cache key for all mappings of a ticker"""
        return f"ticker_symbol_mappings_all:{ticker_id}"
    
    @staticmethod
    def get_provider_symbol(db: Session, ticker_id: int, provider_id: int) -> Optional[str]:
        """
        Get provider-specific symbol for a ticker
        
        Args:
            db: Database session
            ticker_id: ID of the ticker
            provider_id: ID of the external data provider
            
        Returns:
            Optional[str]: Provider-specific symbol if mapping exists, None otherwise
            
        Example:
            >>> symbol = TickerSymbolMappingService.get_provider_symbol(db, 1, 1)
            >>> print(symbol)  # "500X.MI" or None
        """
        # Check cache first
        cache_key = TickerSymbolMappingService._get_cache_key(ticker_id, provider_id)
        cached_symbol = cache_service.get(cache_key)
        if cached_symbol is not None:
            logger.debug(f"Cache hit for ticker {ticker_id}, provider {provider_id}")
            return cached_symbol
        
        try:
            # Query database
            mapping = db.query(TickerProviderSymbol).filter(
                TickerProviderSymbol.ticker_id == ticker_id,
                TickerProviderSymbol.provider_id == provider_id
            ).first()
            
            if mapping:
                symbol = mapping.provider_symbol
                # Cache the result
                cache_service.set(cache_key, symbol, CACHE_TTL)
                logger.debug(f"Found mapping for ticker {ticker_id}, provider {provider_id}: {symbol}")
                return symbol
            
            # Cache None result to avoid repeated queries
            cache_service.set(cache_key, None, CACHE_TTL // 2)  # Shorter TTL for None results
            logger.debug(f"No mapping found for ticker {ticker_id}, provider {provider_id}")
            return None
            
        except SQLAlchemyError as e:
            logger.error(f"Database error getting provider symbol: {e}")
            return None
    
    @staticmethod
    def get_provider_symbol_with_fallback(db: Session, ticker_id: int, provider_id: int) -> str:
        """
        Get provider-specific symbol with fallback to internal symbol
        
        This is the main method to use - it always returns a symbol.
        If no mapping exists, returns the ticker's internal symbol.
        
        Args:
            db: Database session
            ticker_id: ID of the ticker
            provider_id: ID of the external data provider
            
        Returns:
            str: Provider-specific symbol or internal symbol as fallback
            
        Example:
            >>> symbol = TickerSymbolMappingService.get_provider_symbol_with_fallback(db, 1, 1)
            >>> print(symbol)  # "500X.MI" or "500X" (fallback)
        """
        # Try to get mapping
        provider_symbol = TickerSymbolMappingService.get_provider_symbol(db, ticker_id, provider_id)
        
        if provider_symbol:
            return provider_symbol
        
        # Fallback to internal symbol
        try:
            ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
            if ticker:
                logger.debug(f"Using fallback symbol '{ticker.symbol}' for ticker {ticker_id}, provider {provider_id}")
                return ticker.symbol
        except SQLAlchemyError as e:
            logger.error(f"Database error getting ticker for fallback: {e}")
        
        # Last resort - return empty string (should not happen)
        logger.warning(f"Could not get symbol for ticker {ticker_id}, provider {provider_id}")
        return ""
    
    @staticmethod
    def set_provider_symbol(
        db: Session, 
        ticker_id: int, 
        provider_id: int, 
        provider_symbol: str,
        is_primary: bool = False
    ) -> Optional[TickerProviderSymbol]:
        """
        Set or update provider symbol mapping
        
        Args:
            db: Database session
            ticker_id: ID of the ticker
            provider_id: ID of the external data provider
            provider_symbol: Provider-specific symbol format
            is_primary: Whether this is the primary mapping for this provider
            
        Returns:
            Optional[TickerProviderSymbol]: Created/updated mapping or None on error
            
        Example:
            >>> mapping = TickerSymbolMappingService.set_provider_symbol(
            ...     db, 1, 1, "500X.MI", is_primary=True
            ... )
        """
        try:
            # Check if mapping already exists
            existing = db.query(TickerProviderSymbol).filter(
                TickerProviderSymbol.ticker_id == ticker_id,
                TickerProviderSymbol.provider_id == provider_id
            ).first()
            
            if existing:
                # Update existing mapping
                existing.provider_symbol = provider_symbol
                existing.is_primary = is_primary
                existing.updated_at = datetime.now(timezone.utc)
                mapping = existing
                logger.info(f"Updated mapping for ticker {ticker_id}, provider {provider_id}: {provider_symbol}")
            else:
                # Create new mapping
                mapping = TickerProviderSymbol(
                    ticker_id=ticker_id,
                    provider_id=provider_id,
                    provider_symbol=provider_symbol,
                    is_primary=is_primary,
                    updated_at=datetime.now(timezone.utc)
                )
                db.add(mapping)
                logger.info(f"Created mapping for ticker {ticker_id}, provider {provider_id}: {provider_symbol}")
            
            db.commit()
            db.refresh(mapping)
            
            # Invalidate cache
            cache_key = TickerSymbolMappingService._get_cache_key(ticker_id, provider_id)
            cache_service.delete(cache_key)
            all_mappings_key = TickerSymbolMappingService._get_all_mappings_cache_key(ticker_id)
            cache_service.delete(all_mappings_key)
            
            return mapping
            
        except SQLAlchemyError as e:
            logger.error(f"Database error setting provider symbol: {e}")
            db.rollback()
            return None
    
    @staticmethod
    def delete_mapping(db: Session, ticker_id: int, provider_id: int) -> bool:
        """
        Delete provider symbol mapping
        
        Args:
            db: Database session
            ticker_id: ID of the ticker
            provider_id: ID of the external data provider
            
        Returns:
            bool: True if deleted successfully, False otherwise
            
        Example:
            >>> success = TickerSymbolMappingService.delete_mapping(db, 1, 1)
        """
        try:
            mapping = db.query(TickerProviderSymbol).filter(
                TickerProviderSymbol.ticker_id == ticker_id,
                TickerProviderSymbol.provider_id == provider_id
            ).first()
            
            if mapping:
                db.delete(mapping)
                db.commit()
                
                # Invalidate cache
                cache_key = TickerSymbolMappingService._get_cache_key(ticker_id, provider_id)
                cache_service.delete(cache_key)
                all_mappings_key = TickerSymbolMappingService._get_all_mappings_cache_key(ticker_id)
                cache_service.delete(all_mappings_key)
                
                logger.info(f"Deleted mapping for ticker {ticker_id}, provider {provider_id}")
                return True
            else:
                logger.warning(f"Mapping not found for ticker {ticker_id}, provider {provider_id}")
                return False
                
        except SQLAlchemyError as e:
            logger.error(f"Database error deleting mapping: {e}")
            db.rollback()
            return False
    
    @staticmethod
    def get_all_mappings(db: Session, ticker_id: int) -> List[Dict[str, Any]]:
        """
        Get all provider symbol mappings for a ticker
        
        Args:
            db: Database session
            ticker_id: ID of the ticker
            
        Returns:
            List[Dict[str, Any]]: List of mappings with provider info
            
        Example:
            >>> mappings = TickerSymbolMappingService.get_all_mappings(db, 1)
            >>> print(mappings)  # [{"provider_id": 1, "provider_name": "yahoo_finance", "symbol": "500X.MI"}, ...]
        """
        # Check cache first
        cache_key = TickerSymbolMappingService._get_all_mappings_cache_key(ticker_id)
        cached_mappings = cache_service.get(cache_key)
        if cached_mappings is not None:
            logger.debug(f"Cache hit for all mappings of ticker {ticker_id}")
            return cached_mappings
        
        try:
            mappings = db.query(TickerProviderSymbol).filter(
                TickerProviderSymbol.ticker_id == ticker_id
            ).all()
            
            result = []
            for mapping in mappings:
                # Get provider info
                provider = db.query(ExternalDataProvider).filter(
                    ExternalDataProvider.id == mapping.provider_id
                ).first()
                
                result.append({
                    'id': mapping.id,
                    'ticker_id': mapping.ticker_id,
                    'provider_id': mapping.provider_id,
                    'provider_name': provider.name if provider else None,
                    'provider_display_name': provider.display_name if provider else None,
                    'provider_symbol': mapping.provider_symbol,
                    'is_primary': mapping.is_primary,
                    'created_at': mapping.created_at.isoformat() if mapping.created_at else None,
                    'updated_at': mapping.updated_at.isoformat() if mapping.updated_at else None
                })
            
            # Cache the result
            cache_service.set(cache_key, result, CACHE_TTL)
            logger.debug(f"Found {len(result)} mappings for ticker {ticker_id}")
            return result
            
        except SQLAlchemyError as e:
            logger.error(f"Database error getting all mappings: {e}")
            return []
    
    @staticmethod
    def get_provider_id_by_name(db: Session, provider_name: str) -> Optional[int]:
        """
        Get provider ID by provider name
        
        Args:
            db: Database session
            provider_name: Name of the provider (e.g., 'yahoo_finance')
            
        Returns:
            Optional[int]: Provider ID or None if not found
            
        Example:
            >>> provider_id = TickerSymbolMappingService.get_provider_id_by_name(db, 'yahoo_finance')
        """
        try:
            provider = db.query(ExternalDataProvider).filter(
                ExternalDataProvider.name == provider_name
            ).first()
            
            return provider.id if provider else None
            
        except SQLAlchemyError as e:
            logger.error(f"Database error getting provider ID: {e}")
            return None
    
    @staticmethod
    def invalidate_cache_for_ticker(ticker_id: int) -> None:
        """
        Invalidate all cache entries for a ticker
        
        Args:
            ticker_id: ID of the ticker
        """
        # This is a helper method to invalidate all cache entries
        # when we don't know all provider IDs
        # We'll delete the all_mappings cache key which will force refresh
        all_mappings_key = TickerSymbolMappingService._get_all_mappings_cache_key(ticker_id)
        cache_service.delete(all_mappings_key)
        
        # Note: Individual provider cache keys will expire naturally
        # or can be invalidated when we know the provider_id
        logger.debug(f"Invalidated cache for ticker {ticker_id}")


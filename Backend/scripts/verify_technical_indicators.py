#!/usr/bin/env python3
"""
Script to verify technical indicators calculations

Checks:
1. Volatility calculation (30 days)
2. MA 20 calculation
3. MA 150 calculation
4. 52W range calculation
5. Data availability for calculations

Usage:
    python3 Backend/scripts/verify_technical_indicators.py [--ticker-id TICKER_ID]
"""

import sys
import os
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.database import SessionLocal
from models.ticker import Ticker
from services.external_data.technical_indicators_calculator import TechnicalIndicatorsCalculator
from services.external_data.week52_calculator import Week52Calculator
from models.external_data import MarketDataQuote, ExternalDataProvider
from sqlalchemy import func
import argparse


def get_provider_id(session) -> Optional[int]:
    """Get Yahoo Finance provider ID"""
    provider = session.query(ExternalDataProvider).filter(
        ExternalDataProvider.name == 'yahoo_finance'
    ).first()
    return provider.id if provider else None


def verify_ticker_indicators(session, ticker: Ticker, provider_id: int) -> Dict[str, Any]:
    """Verify technical indicators for a single ticker"""
    result = {
        'ticker_id': ticker.id,
        'ticker_symbol': ticker.symbol,
        'indicators': {},
        'issues': [],
        'status': 'ok'
    }
    
    # Check available quotes
    quote_count = session.query(MarketDataQuote).filter(
        MarketDataQuote.ticker_id == ticker.id,
        MarketDataQuote.provider_id == provider_id
    ).count()
    
    result['available_quotes'] = quote_count
    
    if quote_count < 10:
        result['status'] = 'insufficient_data'
        result['issues'].append(f'Only {quote_count} quotes available, need at least 10 for basic calculations')
        return result
    
    tech_calculator = TechnicalIndicatorsCalculator(session)
    week52_calculator = Week52Calculator(session)
    
    # Verify Volatility (30 days)
    if quote_count >= 30:
        try:
            volatility = tech_calculator.calculate_volatility(ticker.id, period=30, db_session=session)
            if volatility is not None:
                result['indicators']['volatility_30'] = {
                    'value': volatility,
                    'status': 'ok',
                    'period': 30
                }
            else:
                result['indicators']['volatility_30'] = {
                    'status': 'calculation_failed',
                    'error': 'Calculation returned None'
                }
                result['issues'].append('Volatility calculation returned None')
        except Exception as e:
            result['indicators']['volatility_30'] = {
                'status': 'error',
                'error': str(e)
            }
            result['issues'].append(f'Volatility calculation error: {e}')
    else:
        result['indicators']['volatility_30'] = {
            'status': 'insufficient_data',
            'required': 30,
            'available': quote_count
        }
        result['issues'].append(f'Not enough quotes for Volatility (need 30, have {quote_count})')
    
    # Verify MA 20
    if quote_count >= 20:
        try:
            sma_20 = tech_calculator.calculate_sma(ticker.id, period=20, db_session=session)
            if sma_20 is not None:
                result['indicators']['ma_20'] = {
                    'value': sma_20,
                    'status': 'ok',
                    'period': 20
                }
            else:
                result['indicators']['ma_20'] = {
                    'status': 'calculation_failed',
                    'error': 'Calculation returned None'
                }
                result['issues'].append('MA 20 calculation returned None')
        except Exception as e:
            result['indicators']['ma_20'] = {
                'status': 'error',
                'error': str(e)
            }
            result['issues'].append(f'MA 20 calculation error: {e}')
    else:
        result['indicators']['ma_20'] = {
            'status': 'insufficient_data',
            'required': 20,
            'available': quote_count
        }
        result['issues'].append(f'Not enough quotes for MA 20 (need 20, have {quote_count})')
    
    # Verify MA 150
    if quote_count >= 120:  # 80% of 150
        try:
            sma_150 = tech_calculator.calculate_sma(ticker.id, period=150, db_session=session)
            if sma_150 is not None:
                result['indicators']['ma_150'] = {
                    'value': sma_150,
                    'status': 'ok',
                    'period': 150
                }
            else:
                result['indicators']['ma_150'] = {
                    'status': 'calculation_failed',
                    'error': 'Calculation returned None'
                }
                result['issues'].append('MA 150 calculation returned None')
        except Exception as e:
            result['indicators']['ma_150'] = {
                'status': 'error',
                'error': str(e)
            }
            result['issues'].append(f'MA 150 calculation error: {e}')
    else:
        result['indicators']['ma_150'] = {
            'status': 'insufficient_data',
            'required': 120,
            'available': quote_count
        }
        result['issues'].append(f'Not enough quotes for MA 150 (need 120, have {quote_count})')
    
    # Verify 52W range
    if quote_count >= 10:
        try:
            week52_result = week52_calculator.calculate_52w_range(ticker.id, db_session=session)
            if week52_result:
                result['indicators']['week52'] = {
                    'high': week52_result.high,
                    'low': week52_result.low,
                    'status': 'ok',
                    'warnings': week52_result.warnings if hasattr(week52_result, 'warnings') else []
                }
            else:
                result['indicators']['week52'] = {
                    'status': 'calculation_failed',
                    'error': 'Calculation returned None'
                }
                result['issues'].append('52W range calculation returned None')
        except Exception as e:
            result['indicators']['week52'] = {
                'status': 'error',
                'error': str(e)
            }
            result['issues'].append(f'52W range calculation error: {e}')
    else:
        result['indicators']['week52'] = {
            'status': 'insufficient_data',
            'required': 10,
            'available': quote_count
        }
        result['issues'].append(f'Not enough quotes for 52W range (need 10, have {quote_count})')
    
    # Determine overall status
    indicators_ok = sum(1 for ind in result['indicators'].values() if ind.get('status') == 'ok')
    total_indicators = len(result['indicators'])
    
    if indicators_ok == 0:
        result['status'] = 'no_indicators'
    elif indicators_ok < total_indicators:
        result['status'] = 'partial_indicators'
    elif result['issues']:
        result['status'] = 'has_warnings'
    
    return result


def verify_all_tickers(session, provider_id: int, ticker_id: Optional[int] = None) -> Dict[str, Any]:
    """Verify indicators for all tickers or a specific ticker"""
    results = {
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'provider_id': provider_id,
        'tickers_checked': 0,
        'tickers_all_ok': 0,
        'tickers_partial': 0,
        'tickers_no_indicators': 0,
        'ticker_results': []
    }
    
    # Get tickers to check
    if ticker_id:
        tickers = session.query(Ticker).filter(Ticker.id == ticker_id).all()
    else:
        tickers = session.query(Ticker).filter(Ticker.status == 'open').all()
    
    results['tickers_checked'] = len(tickers)
    
    for ticker in tickers:
        ticker_result = verify_ticker_indicators(session, ticker, provider_id)
        results['ticker_results'].append(ticker_result)
        
        if ticker_result['status'] == 'ok':
            results['tickers_all_ok'] += 1
        elif ticker_result['status'] == 'no_indicators':
            results['tickers_no_indicators'] += 1
        else:
            results['tickers_partial'] += 1
    
    return results


def print_results(results: Dict[str, Any]):
    """Print verification results"""
    print("=" * 80)
    print("Technical Indicators Verification Report")
    print("=" * 80)
    print(f"Timestamp: {results['timestamp']}")
    print(f"Provider ID: {results['provider_id']}")
    print()
    print(f"Tickers checked: {results['tickers_checked']}")
    print(f"  ✓ All indicators OK: {results['tickers_all_ok']}")
    print(f"  ⚠ Partial indicators: {results['tickers_partial']}")
    print(f"  ✗ No indicators: {results['tickers_no_indicators']}")
    print()
    
    # Print detailed results for tickers with issues
    if results['tickers_partial'] > 0 or results['tickers_no_indicators'] > 0:
        print("Tickers with issues:")
        print("-" * 80)
        for ticker_result in results['ticker_results']:
            if ticker_result['status'] != 'ok':
                print(f"\nTicker: {ticker_result['ticker_symbol']} (ID: {ticker_result['ticker_id']})")
                print(f"  Status: {ticker_result['status']}")
                print(f"  Available quotes: {ticker_result['available_quotes']}")
                print(f"  Indicators:")
                for ind_name, ind_data in ticker_result['indicators'].items():
                    status_icon = '✓' if ind_data.get('status') == 'ok' else '✗'
                    print(f"    {status_icon} {ind_name}: {ind_data.get('status', 'unknown')}")
                    if ind_data.get('status') == 'ok' and 'value' in ind_data:
                        print(f"      Value: {ind_data['value']}")
                    elif ind_data.get('error'):
                        print(f"      Error: {ind_data['error']}")
                if ticker_result['issues']:
                    print(f"  Issues:")
                    for issue in ticker_result['issues']:
                        print(f"    - {issue}")
    
    print()
    print("=" * 80)


def main():
    parser = argparse.ArgumentParser(description='Verify technical indicators calculations')
    parser.add_argument('--ticker-id', type=int, help='Verify specific ticker ID')
    parser.add_argument('--json', action='store_true', help='Output results as JSON')
    
    args = parser.parse_args()
    
    session = SessionLocal()
    try:
        provider_id = get_provider_id(session)
        if not provider_id:
            print("ERROR: Yahoo Finance provider not found in database")
            return 1
        
        results = verify_all_tickers(session, provider_id, args.ticker_id)
        
        if args.json:
            import json
            print(json.dumps(results, indent=2, default=str))
        else:
            print_results(results)
        
        # Return exit code based on results
        if results['tickers_no_indicators'] > 0 or results['tickers_partial'] > 0:
            return 1
        return 0
        
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1
    finally:
        session.close()


if __name__ == '__main__':
    sys.exit(main())


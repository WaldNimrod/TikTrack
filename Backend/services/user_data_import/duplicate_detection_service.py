"""
Duplicate Detection Service - Smart duplicate detection for import data

This service implements intelligent duplicate detection using multiple strategies:
1. Exact external_id matching
2. 4/5 field similarity matching (ticker, quantity, price, date, action)
3. Within-file duplicate detection
4. Against-system duplicate detection

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-16
"""

from typing import List, Dict, Any, Optional, Tuple, Set
from datetime import datetime, timedelta
import logging
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from models.execution import Execution
from models.ticker import Ticker
from models.trade import Trade
from models.cash_flow import CashFlow
from models.trading_account import TradingAccount

logger = logging.getLogger(__name__)

class DuplicateDetectionService:
    """
    Service for detecting duplicates in import data.
    
    This service uses multiple strategies to identify potential duplicates:
    - External ID matching (exact)
    - Field similarity matching (4/5 rule)
    - Within-file detection
    - Against-system detection
    """
    
    def __init__(self, db_session: Session):
        """
        Initialize the duplicate detection service.
        
        Args:
            db_session: Database session for querying existing data
        """
        self.db_session = db_session
        self.similarity_threshold = 4  # 4 out of 5 fields must match for duplicate detection
        self.price_tolerance = 0.01    # Price difference tolerance
        self.date_tolerance_days = 1   # Date difference tolerance
    
    def detect_duplicates(
        self,
        records: List[Dict[str, Any]],
        trading_trading_account_id: int,
        task_type: str = 'executions'
    ) -> Dict[str, Any]:
        """
        Detect duplicates in a list of records for the requested task type.
        """
        task = (task_type or 'executions').lower()
        if task == 'cashflows':
            return self._detect_cashflow_duplicates(records, trading_trading_account_id)
        if task == 'account_reconciliation':
            return self._detect_account_reconciliation_duplicates(records)
        if task in {'portfolio_positions', 'taxes_and_fx'}:
            return self._passthrough_duplicate_result(records)
        return self._detect_execution_duplicates(records, trading_trading_account_id)

    # ------------------------------------------------------------------
    # Execution duplicate detection (legacy behavior)
    # ------------------------------------------------------------------

    def _detect_execution_duplicates(
        self,
        records: List[Dict[str, Any]],
        trading_trading_account_id: int
    ) -> Dict[str, Any]:
        results = {
            'within_file_duplicates': [],
            'existing_records': [],
            'clean_records': [],
            'total_checked': len(records),
            'duplicate_count': 0,
            'clean_count': 0
        }
        
        # Get existing executions for this account
        existing_executions = self._get_existing_executions(trading_trading_account_id, records)
        
        # Track processed records to avoid double-checking
        processed_indices = set()
        
        for i, record in enumerate(records):
            if i in processed_indices:
                continue
                
            # Check for within-file duplicates
            within_file_matches = self._find_within_file_duplicates(
                records, i, processed_indices
            )
            
            # Check for existing records
            existing_matches = self._find_system_duplicates(
                record, existing_executions
            )
            
            if within_file_matches or existing_matches:
                # This is a duplicate
                duplicate_info = {
                    'record_index': i,
                    'record': record,
                    'within_file_matches': within_file_matches,
                    'system_matches': existing_matches,
                    'duplicate_type': self._classify_duplicate_type(
                        within_file_matches, existing_matches
                    ),
                    'confidence_score': self._calculate_confidence_score(
                        record, within_file_matches, existing_matches
                    )
                }
                
                if within_file_matches:
                    results['within_file_duplicates'].append(duplicate_info)
                if existing_matches:
                    results['existing_records'].append(duplicate_info)
                
                # Mark all matching records as processed
                processed_indices.add(i)
                for match in within_file_matches:
                    processed_indices.add(match['record_index'])
                
                results['duplicate_count'] += 1
            else:
                # This is a clean record
                results['clean_records'].append({
                    'record_index': i,
                    'record': record
                })
                results['clean_count'] += 1
        
        return results

    # ------------------------------------------------------------------
    # Cashflow duplicate detection
    # ------------------------------------------------------------------

    def _detect_cashflow_duplicates(
        self,
        records: List[Dict[str, Any]],
        trading_trading_account_id: int
    ) -> Dict[str, Any]:
        results = {
            'within_file_duplicates': [],
            'existing_records': [],
            'clean_records': [],
            'total_checked': len(records),
            'duplicate_count': 0,
            'clean_count': 0
        }

        if not records:
            return results

        signature_map: Dict[str, Dict[str, Any]] = {}
        processed_indices: Set[int] = set()
        existing_cashflows = self._get_existing_cashflows(records)

        for index, record in enumerate(records):
            if index in processed_indices:
                continue

            signature = self._calculate_cashflow_signature(record)
            matches = []

            if signature in signature_map:
                matches.append({
                    'record_index': signature_map[signature]['index'],
                    'record': signature_map[signature]['record'],
                    'match_type': 'cashflow_signature',
                    'confidence': 90,
                    'signature': signature
                })

            signature_map[signature] = {'index': index, 'record': record}

            system_matches = self._find_existing_cashflow_matches(record, existing_cashflows)
            if system_matches:
                matches.extend(system_matches)

            if matches:
                duplicate_info = {
                    'record_index': index,
                    'record': record,
                    'within_file_matches': [m for m in matches if m.get('record_index') is not None],
                    'system_matches': [m for m in matches if m.get('cashflow_id')],
                    'duplicate_type': 'cashflow_duplicate',
                    'confidence_score': self._calculate_cashflow_confidence(matches)
                }

                if duplicate_info['within_file_matches']:
                    results['within_file_duplicates'].append(duplicate_info)
                    for match in duplicate_info['within_file_matches']:
                        processed_indices.add(match['record_index'])

                if duplicate_info['system_matches']:
                    results['existing_records'].append(duplicate_info)

                processed_indices.add(index)
                results['duplicate_count'] += 1
            else:
                results['clean_records'].append({
                    'record_index': index,
                    'record': record,
                    'signature': signature
                })
                results['clean_count'] += 1

        return results

    # ------------------------------------------------------------------
    # Account reconciliation duplicate detection
    # ------------------------------------------------------------------

    def _detect_account_reconciliation_duplicates(
        self,
        records: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        results = {
            'within_file_duplicates': [],
            'existing_records': [],
            'clean_records': [],
            'total_checked': len(records),
            'duplicate_count': 0,
            'clean_count': 0
        }

        seen_external_ids: Dict[str, Dict[str, Any]] = {}

        for index, record in enumerate(records):
            external_id = record.get('external_id')
            signature = self._calculate_account_signature(record)
            matches = []

            if external_id and external_id in seen_external_ids:
                matches.append({
                    'record_index': seen_external_ids[external_id]['index'],
                    'record': seen_external_ids[external_id]['record'],
                    'match_type': 'external_id',
                    'confidence': 100
                })

            elif signature and signature in seen_external_ids:
                matches.append({
                    'record_index': seen_external_ids[signature]['index'],
                    'record': seen_external_ids[signature]['record'],
                    'match_type': 'account_signature',
                    'confidence': 85
                })

            if external_id:
                seen_external_ids[external_id] = {'index': index, 'record': record}
            if signature:
                seen_external_ids[signature] = {'index': index, 'record': record}

            if matches:
                duplicate_info = {
                    'record_index': index,
                    'record': record,
                    'within_file_matches': matches,
                    'system_matches': [],
                    'duplicate_type': 'account_reconciliation_duplicate',
                    'confidence_score': max(match['confidence'] for match in matches)
                }
                results['within_file_duplicates'].append(duplicate_info)
                results['duplicate_count'] += 1
            else:
                results['clean_records'].append({
                    'record_index': index,
                    'record': record
                })
                results['clean_count'] += 1

        return results

    def _passthrough_duplicate_result(self, records: List[Dict[str, Any]]) -> Dict[str, Any]:
        clean_records = [
            {
                'record_index': index,
                'record': record
            }
            for index, record in enumerate(records)
        ]
        return {
            'within_file_duplicates': [],
            'existing_records': [],
            'clean_records': clean_records,
            'total_checked': len(records),
            'duplicate_count': 0,
            'clean_count': len(clean_records)
        }
    
    # ------------------------------------------------------------------
    # Helper methods for cashflow/account duplicate detection
    # ------------------------------------------------------------------

    def _calculate_cashflow_signature(self, record: Dict[str, Any]) -> str:
        try:
            amount = abs(float(record.get('amount', 0)))
        except (TypeError, ValueError):
            amount = 0.0

        date_value = self._resolve_datetime(record.get('effective_date'))
        date_key = date_value.date().isoformat() if date_value else 'unknown'

        signature_parts = [
            str(record.get('cashflow_type') or '').lower(),
            str(record.get('currency') or '').upper(),
            f"{amount:.2f}",
            date_key,
            str(record.get('source_account') or '').upper()
        ]
        return '|'.join(signature_parts)

    def _calculate_cashflow_confidence(self, matches: List[Dict[str, Any]]) -> float:
        if not matches:
            return 0.0
        return max(match.get('confidence', 75) for match in matches)

    def _find_existing_cashflow_matches(
        self,
        record: Dict[str, Any],
        existing_cashflows: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        matches = []
        record_signature = self._calculate_cashflow_signature(record)
        record_external_id = record.get('external_id')

        for cashflow in existing_cashflows:
            signature = cashflow.get('_signature')
            external_id = cashflow.get('external_id')

            if record_external_id and external_id and record_external_id == external_id:
                matches.append({
                    'cashflow_id': cashflow.get('id'),
                    'cashflow': cashflow,
                    'match_type': 'exact_external_id',
                    'confidence': 100
                })
                continue

            if signature and signature == record_signature:
                matches.append({
                    'cashflow_id': cashflow.get('id'),
                    'cashflow': cashflow,
                    'match_type': 'cashflow_signature',
                    'confidence': 90
                })

        return matches

    def _get_existing_cashflows(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not self.db_session or not CashFlow:
            return []

        account_ids = set()
        date_candidates = []

        for record in records:
            account_id = self._resolve_account_id(record.get('source_account'))
            if account_id:
                account_ids.add(account_id)

            effective_date = self._resolve_datetime(record.get('effective_date'))
            if effective_date:
                date_candidates.append(effective_date.date())

        query = self.db_session.query(CashFlow)

        if account_ids:
            query = query.filter(CashFlow.trading_account_id.in_(list(account_ids)))

        if date_candidates:
            min_date = min(date_candidates) - timedelta(days=1)
            max_date = max(date_candidates) + timedelta(days=1)
            query = query.filter(CashFlow.date >= min_date, CashFlow.date <= max_date)

        try:
            cashflows = query.all()
        except Exception as exc:
            logger.error("Failed to fetch cashflows for duplicate detection: %s", exc)
            return []

        results = []
        for cashflow in cashflows:
            try:
                cf_dict = cashflow.to_dict()
                signature = self._calculate_cashflow_signature({
                    'cashflow_type': cf_dict.get('type'),
                    'currency': cf_dict.get('currency_symbol'),
                    'amount': cf_dict.get('amount'),
                    'effective_date': cf_dict.get('date'),
                    'source_account': cf_dict.get('account_name')
                })
                cf_dict['_signature'] = signature
                results.append(cf_dict)
            except Exception as exc:
                logger.debug("Failed to build cashflow signature for %s: %s", cashflow.id, exc)
                continue

        return results

    def _resolve_account_id(self, account_identifier: Any) -> Optional[int]:
        if not self.db_session or account_identifier is None or not TradingAccount:
            return None

        if isinstance(account_identifier, int):
            return account_identifier

        if isinstance(account_identifier, str):
            try:
                if account_identifier.isdigit():
                    return int(account_identifier)
            except ValueError:
                pass

            account = self.db_session.query(TradingAccount).filter(
                TradingAccount.name == account_identifier
            ).first()
            if account:
                return account.id

            account = self.db_session.query(TradingAccount).filter(
                TradingAccount.name.ilike(account_identifier)
            ).first()
            if account:
                return account.id

        return None

    def _calculate_account_signature(self, record: Dict[str, Any]) -> Optional[str]:
        account_id = record.get('account_id')
        as_of = self._resolve_datetime(record.get('as_of'))

        if not account_id or not as_of:
            return None

        normalized_currency = str(record.get('base_currency') or '').upper()
        date_key = as_of.date().isoformat()

        return f"{account_id}|{normalized_currency}|{date_key}"
    
    def _find_within_file_duplicates(self, records: List[Dict[str, Any]], 
                                   current_index: int, 
                                   processed_indices: Set[int]) -> List[Dict[str, Any]]:
        """
        Find duplicates within the same file.
        
        Args:
            records: All records in the file
            current_index: Index of current record
            processed_indices: Set of already processed indices
            
        Returns:
            List[Dict[str, Any]]: List of matching records
        """
        current_record = records[current_index]
        matches = []
        
        for i, other_record in enumerate(records):
            if (i <= current_index or 
                i in processed_indices or 
                i == current_index):
                continue
            
            # Check for exact external_id match
            if (current_record.get('external_id') and 
                other_record.get('external_id') and
                current_record['external_id'] == other_record['external_id']):
                matches.append({
                    'record_index': i,
                    'record': other_record,
                    'match_type': 'exact_external_id',
                    'confidence': 100
                })
                continue
            
            # Check for field similarity (3/5 rule)
            similarity_score = self._calculate_field_similarity(
                current_record, other_record
            )
            
            if similarity_score >= self.similarity_threshold:
                matches.append({
                    'record_index': i,
                    'record': other_record,
                    'match_type': 'field_similarity',
                    'confidence': (similarity_score / 5) * 100,
                    'similarity_score': similarity_score
                })
        
        return matches
    
    def _find_system_duplicates(self, record: Dict[str, Any], 
                               existing_executions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Find duplicates against existing system data.
        
        Args:
            record: Record to check
            existing_executions: List of existing executions from database
            
        Returns:
            List[Dict[str, Any]]: List of matching system records
        """
        matches = []
        
        for existing in existing_executions:
            # Check for exact external_id match
            if (record.get('external_id') and 
                existing.get('external_id') and
                record['external_id'] == existing['external_id']):
                matches.append({
                    'execution_id': existing['id'],
                    'execution': existing,
                    'match_type': 'exact_external_id',
                    'confidence': 100
                })
                continue
            
            # Check for field similarity (3/5 rule)
            similarity_score = self._calculate_field_similarity(
                record, existing
            )
            
            if similarity_score >= self.similarity_threshold:
                matches.append({
                    'execution_id': existing['id'],
                    'execution': existing,
                    'match_type': 'field_similarity',
                    'confidence': (similarity_score / 5) * 100,
                    'similarity_score': similarity_score
                })
        
        return matches
    
    def _calculate_field_similarity(self, record1: Dict[str, Any], 
                                  record2: Dict[str, Any]) -> int:
        """
        Calculate similarity score between two records (0-5).
        
        Args:
            record1: First record
            record2: Second record
            
        Returns:
            int: Similarity score (0-5)
        """
        score = 0
        
        # Check symbol match
        if (record1.get('symbol') and record2.get('symbol') and
            record1['symbol'].upper() == record2['symbol'].upper()):
            score += 1
        
        # Check quantity match
        if (record1.get('quantity') and record2.get('quantity') and
            abs(float(record1['quantity']) - float(record2['quantity'])) < 0.001):
            score += 1
        
        # Check price match - integer part only
        if (record1.get('price') and record2.get('price')):
            price1 = float(record1['price'])
            price2 = float(record2['price'])
            if price1 == price2:
                score += 1
        
        # Check date match - same day AND within 5 minutes time window
        if record1.get('date') and record2.get('date'):
            try:
                date1 = self._resolve_datetime(record1.get('date'))
                date2 = self._resolve_datetime(record2.get('date'))

                if date1 and date2:
                    same_day = date1.date() == date2.date()
                    time_diff = abs((date1 - date2).total_seconds())
                    within_5_minutes = time_diff <= 300  # 5 minutes = 300 seconds
                    
                    if same_day and within_5_minutes:
                        score += 1
            except Exception:
                pass
        
        # Check action match
        if (record1.get('action') and record2.get('action') and
            record1['action'] == record2['action']):
            score += 1
        
        return score
    
    def _get_existing_executions(self, trading_trading_account_id: int, records: List[Dict] = None) -> List[Dict[str, Any]]:
        """
        Get existing executions filtered by date range and symbols
        
        Args:
            trading_trading_account_id: Account ID (ignored - we check against all executions)
            records: List of records to check against (for filtering)
            
        Returns:
            List[Dict[str, Any]]: List of existing executions with symbol information
        """
        try:
            # If no records provided, get all executions (legacy behavior)
            if not records:
                logger.info("No records provided, querying all executions")
                executions = self.db_session.query(Execution).outerjoin(
                    Trade, Execution.trade_id == Trade.id
                ).all()
            else:
                # Extract date range and symbols from records for filtering
                symbols = list(set([r.get('symbol') for r in records if r.get('symbol')]))
                dates = [r.get('date') for r in records if r.get('date')]
                
                if not symbols or not dates:
                    logger.info("No symbols or dates found in records")
                    return []
                
                # Parse dates and get range
                parsed_dates = []
                for date_value in dates:
                    parsed_date = self._resolve_datetime(date_value)
                    if parsed_date:
                        parsed_dates.append(parsed_date)
                    else:
                        logger.warning(f"Failed to parse date {date_value}")
                
                if not parsed_dates:
                    logger.warning("No valid dates found in records")
                    return []
                
                min_date = min(parsed_dates) - timedelta(days=1)
                max_date = max(parsed_dates) + timedelta(days=1)
                
                logger.info(f"Querying executions for symbols {symbols} between {min_date} and {max_date}")
                
                symbol_values = [symbol.upper() for symbol in symbols]
                
                # Query executions in date range for these symbols
                # Check both direct ticker_id and through trade
                executions = self.db_session.query(Execution)\
                    .outerjoin(Trade, Execution.trade_id == Trade.id)\
                    .outerjoin(Ticker, (Trade.ticker_id == Ticker.id) | (Execution.ticker_id == Ticker.id))\
                    .filter(
                        Ticker.symbol.in_(symbol_values),
                        Execution.date >= min_date,
                        Execution.date <= max_date
                    ).all()
                
                # Also check executions with direct ticker_id that match symbols
                direct_executions = self.db_session.query(Execution)\
                    .join(Ticker, Execution.ticker_id == Ticker.id)\
                    .filter(
                        Ticker.symbol.in_(symbol_values),
                        Execution.date >= min_date,
                        Execution.date <= max_date
                    ).all()
                
                # Combine results and remove duplicates
                all_executions = executions + direct_executions
                executions = list({execution.id: execution for execution in all_executions}.values())
            
            logger.info(f"Found {len(executions)} existing executions")
            
            # Convert to dict with symbol
            result = []
            for execution in executions:
                try:
                    exec_dict = execution.to_dict()
                    
                    # Add ticker symbol for comparison
                    if execution.trade_id:
                        # Get ticker through trade
                        trade = self.db_session.query(Trade).filter(Trade.id == execution.trade_id).first()
                        if trade and trade.ticker_id:
                            ticker = self.db_session.query(Ticker).filter(Ticker.id == trade.ticker_id).first()
                            if ticker:
                                exec_dict['symbol'] = ticker.symbol
                    elif execution.ticker_id:
                        # Direct ticker reference
                        ticker = self.db_session.query(Ticker).filter(Ticker.id == execution.ticker_id).first()
                        if ticker:
                            exec_dict['symbol'] = ticker.symbol
                    
                    result.append(exec_dict)
                except Exception as e:
                    logger.warning(f"Failed to process execution {execution.id}: {e}")
                    continue
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to query existing executions: {str(e)}")
            return []  # Return empty list, not None

    def _resolve_datetime(self, value: Any) -> Optional[datetime]:
        """
        Normalize various date representations into a timezone-aware datetime.
        """
        if value is None:
            return None

        if isinstance(value, datetime):
            return value

        if isinstance(value, str):
            try:
                cleaned = value.replace('Z', '+00:00')
                return datetime.fromisoformat(cleaned)
            except ValueError:
                try:
                    return datetime.strptime(value, '%Y-%m-%d')
                except ValueError:
                    return None

        if isinstance(value, dict):
            # DateEnvelope format
            for key in ('utc', 'iso', 'value'):
                if value.get(key):
                    resolved = self._resolve_datetime(value[key])
                    if resolved:
                        return resolved
            # Some envelopes might include nested dicts under 'local'
            if value.get('local'):
                resolved = self._resolve_datetime(value['local'])
                if resolved:
                    return resolved

        return None
    
    def _classify_duplicate_type(self, within_file_matches: List[Dict[str, Any]], 
                                existing_matches: List[Dict[str, Any]]) -> str:
        """
        Classify the type of duplicate.
        
        Args:
            within_file_matches: Within-file duplicate matches
            existing_matches: Existing records matches
            
        Returns:
            str: Duplicate type classification
        """
        if within_file_matches and existing_matches:
            return 'both_within_and_existing'
        elif within_file_matches:
            return 'within_file_only'
        elif existing_matches:
            return 'existing_only'
        else:
            return 'none'
    
    def _calculate_confidence_score(self, record: Dict[str, Any], 
                                 within_file_matches: List[Dict[str, Any]], 
                                 existing_matches: List[Dict[str, Any]]) -> float:
        """
        Calculate confidence score for duplicate detection.
        
        Args:
            record: Original record
            within_file_matches: Within-file matches
            existing_matches: Existing records matches
            
        Returns:
            float: Confidence score (0-100)
        """
        max_confidence = 0
        
        # Check within-file matches
        for match in within_file_matches:
            if match.get('confidence', 0) > max_confidence:
                max_confidence = match['confidence']
        
        # Check existing matches
        for match in existing_matches:
            if match.get('confidence', 0) > max_confidence:
                max_confidence = match['confidence']
        
        return max_confidence
    
    def get_duplicate_summary(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get a summary of duplicate detection results.
        
        Args:
            results: Results from detect_duplicates
            
        Returns:
            Dict[str, Any]: Duplicate detection summary
        """
        within_file_count = len(results.get('within_file_duplicates', []))
        existing_count = len(results.get('existing_records', []))
        clean_count = results.get('clean_count', 0)
        total_count = results.get('total_checked', 0)
        
        # Calculate confidence distribution
        confidence_scores = []
        for duplicate in results.get('within_file_duplicates', []):
            confidence_scores.append(duplicate.get('confidence_score', 0))
        for duplicate in results.get('existing_records', []):
            confidence_scores.append(duplicate.get('confidence_score', 0))
        
        avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
        
        return {
            'total_records': total_count,
            'clean_records': clean_count,
            'within_file_duplicates': within_file_count,
            'existing_records': existing_count,
            'total_duplicates': within_file_count + existing_count,
            'duplicate_rate': ((within_file_count + existing_count) / total_count * 100) if total_count > 0 else 0,
            'average_confidence': avg_confidence,
            'high_confidence_duplicates': len([c for c in confidence_scores if c >= 80]),
            'medium_confidence_duplicates': len([c for c in confidence_scores if 50 <= c < 80]),
            'low_confidence_duplicates': len([c for c in confidence_scores if c < 50])
        }
    
    def get_duplicate_details(self, results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Get detailed information about duplicates for user review.
        
        Args:
            results: Results from detect_duplicates
            
        Returns:
            List[Dict[str, Any]]: Detailed duplicate information
        """
        details = []
        
        # Process within-file duplicates
        for duplicate in results.get('within_file_duplicates', []):
            details.append({
                'type': 'within_file',
                'record_index': duplicate['record_index'],
                'symbol': duplicate['record'].get('symbol'),
                'action': duplicate['record'].get('action'),
                'quantity': duplicate['record'].get('quantity'),
                'price': duplicate['record'].get('price'),
                'date': duplicate['record'].get('date'),
                'external_id': duplicate['record'].get('external_id'),
                'confidence_score': duplicate.get('confidence_score', 0),
                'match_count': len(duplicate.get('within_file_matches', [])),
                'matches': duplicate.get('within_file_matches', [])
            })
        
        # Process existing records
        for duplicate in results.get('existing_records', []):
            details.append({
                'type': 'existing',
                'record_index': duplicate['record_index'],
                'symbol': duplicate['record'].get('symbol'),
                'action': duplicate['record'].get('action'),
                'quantity': duplicate['record'].get('quantity'),
                'price': duplicate['record'].get('price'),
                'date': duplicate['record'].get('date'),
                'external_id': duplicate['record'].get('external_id'),
                'confidence_score': duplicate.get('confidence_score', 0),
                'match_count': len(duplicate.get('system_matches', [])),
                'matches': duplicate.get('system_matches', [])
            })
        
        # Sort by confidence score (highest first)
        details.sort(key=lambda x: x.get('confidence_score', 0), reverse=True)
        
        return details

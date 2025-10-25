"""
Duplicate Detection Service - Smart duplicate detection for import data

This service implements intelligent duplicate detection using multiple strategies:
1. Exact external_id matching
2. 3/5 field similarity matching (ticker, quantity, price, date, action)
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
from models.execution import Execution
from models.ticker import Ticker

logger = logging.getLogger(__name__)

class DuplicateDetectionService:
    """
    Service for detecting duplicates in import data.
    
    This service uses multiple strategies to identify potential duplicates:
    - External ID matching (exact)
    - Field similarity matching (3/5 rule)
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
        self.similarity_threshold = 3  # Minimum matching fields out of 5
        self.price_tolerance = 0.01    # Price difference tolerance
        self.date_tolerance_days = 1   # Date difference tolerance
    
    def detect_duplicates(self, records: List[Dict[str, Any]], 
                         account_id: int) -> Dict[str, Any]:
        """
        Detect duplicates in a list of records.
        
        Args:
            records: List of normalized records to check
            account_id: Account ID for system duplicate checking
            
        Returns:
            Dict[str, Any]: Duplicate detection results
        """
        results = {
            'within_file_duplicates': [],
            'system_duplicates': [],
            'clean_records': [],
            'total_checked': len(records),
            'duplicate_count': 0,
            'clean_count': 0
        }
        
        # Get existing executions for this account
        existing_executions = self._get_existing_executions(account_id)
        
        # Track processed records to avoid double-checking
        processed_indices = set()
        
        for i, record in enumerate(records):
            if i in processed_indices:
                continue
                
            # Check for within-file duplicates
            within_file_matches = self._find_within_file_duplicates(
                records, i, processed_indices
            )
            
            # Check for system duplicates
            system_matches = self._find_system_duplicates(
                record, existing_executions
            )
            
            if within_file_matches or system_matches:
                # This is a duplicate
                duplicate_info = {
                    'record_index': i,
                    'record': record,
                    'within_file_matches': within_file_matches,
                    'system_matches': system_matches,
                    'duplicate_type': self._classify_duplicate_type(
                        within_file_matches, system_matches
                    ),
                    'confidence_score': self._calculate_confidence_score(
                        record, within_file_matches, system_matches
                    )
                }
                
                if within_file_matches:
                    results['within_file_duplicates'].append(duplicate_info)
                if system_matches:
                    results['system_duplicates'].append(duplicate_info)
                
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
        
        # Check price match (with tolerance)
        if (record1.get('price') and record2.get('price')):
            price1 = float(record1['price'])
            price2 = float(record2['price'])
            if abs(price1 - price2) <= self.price_tolerance:
                score += 1
        
        # Check date match (with tolerance)
        if (record1.get('date') and record2.get('date')):
            try:
                date1 = datetime.fromisoformat(record1['date'].replace('Z', '+00:00'))
                date2 = datetime.fromisoformat(record2['date'].replace('Z', '+00:00'))
                if abs((date1 - date2).days) <= self.date_tolerance_days:
                    score += 1
            except ValueError:
                pass
        
        # Check action match
        if (record1.get('action') and record2.get('action') and
            record1['action'] == record2['action']):
            score += 1
        
        return score
    
    def _get_existing_executions(self, account_id: int) -> List[Dict[str, Any]]:
        """
        Get existing executions for the account.
        
        Args:
            account_id: Account ID to query
            
        Returns:
            List[Dict[str, Any]]: List of existing executions
        """
        try:
            # Query executions for this account
            executions = self.db_session.query(Execution).join(
                Execution.trade
            ).filter(
                Execution.trade.has(account_id=account_id)
            ).all()
            
            return [execution.to_dict() for execution in executions]
            
        except Exception as e:
            logger.error(f"Failed to query existing executions: {str(e)}")
            return []
    
    def _classify_duplicate_type(self, within_file_matches: List[Dict[str, Any]], 
                                system_matches: List[Dict[str, Any]]) -> str:
        """
        Classify the type of duplicate.
        
        Args:
            within_file_matches: Within-file duplicate matches
            system_matches: System duplicate matches
            
        Returns:
            str: Duplicate type classification
        """
        if within_file_matches and system_matches:
            return 'both_within_and_system'
        elif within_file_matches:
            return 'within_file_only'
        elif system_matches:
            return 'system_only'
        else:
            return 'none'
    
    def _calculate_confidence_score(self, record: Dict[str, Any], 
                                 within_file_matches: List[Dict[str, Any]], 
                                 system_matches: List[Dict[str, Any]]) -> float:
        """
        Calculate confidence score for duplicate detection.
        
        Args:
            record: Original record
            within_file_matches: Within-file matches
            system_matches: System matches
            
        Returns:
            float: Confidence score (0-100)
        """
        max_confidence = 0
        
        # Check within-file matches
        for match in within_file_matches:
            if match.get('confidence', 0) > max_confidence:
                max_confidence = match['confidence']
        
        # Check system matches
        for match in system_matches:
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
        system_count = len(results.get('system_duplicates', []))
        clean_count = results.get('clean_count', 0)
        total_count = results.get('total_checked', 0)
        
        # Calculate confidence distribution
        confidence_scores = []
        for duplicate in results.get('within_file_duplicates', []):
            confidence_scores.append(duplicate.get('confidence_score', 0))
        for duplicate in results.get('system_duplicates', []):
            confidence_scores.append(duplicate.get('confidence_score', 0))
        
        avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
        
        return {
            'total_records': total_count,
            'clean_records': clean_count,
            'within_file_duplicates': within_file_count,
            'system_duplicates': system_count,
            'total_duplicates': within_file_count + system_count,
            'duplicate_rate': ((within_file_count + system_count) / total_count * 100) if total_count > 0 else 0,
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
        
        # Process system duplicates
        for duplicate in results.get('system_duplicates', []):
            details.append({
                'type': 'system',
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

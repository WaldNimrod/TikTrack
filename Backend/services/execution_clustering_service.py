"""
Execution Clustering Service
Service for clustering executions into groups for trade creation

This service groups executions by:
- Ticker (required)
- Trading account (optional)
- Side (long/short)

Clusters combine compatible execution actions:
- Long trades: buy (opening) + sell (closing)
- Short trades: short (opening) + cover (closing)

================================================================================
⚠️  KNOWN ISSUE - PRODUCTION BUG ⚠️
================================================================================

STATUS: Critical bug identified in production environment
DATE: 2025-11-24
ENVIRONMENT: Production (TikTrackApp-Production workspace, port 5001)
DATABASE: PostgreSQL (TikTrack-db-development)

PROBLEM:
'Sell' execution actions are being incorrectly clustered into 'short' side
clusters instead of 'long' side clusters.

EXAMPLE - TIUP TICKER (ID=50):
- Expected: All 4 executions (1 buy + 3 sell) should be in cluster '50-2-long'
- Actual: 
  * Execution 1089 (buy) → correctly in cluster '50-2-long' ✓
  * Execution 1090 (sell) → INCORRECTLY in cluster '50-2-short' ✗
  * Execution 1091 (sell) → INCORRECTLY in cluster '50-2-short' ✗
  * Execution 1092 (sell) → INCORRECTLY in cluster '50-2-short' ✗

SCOPE:
- Issue affects 31 clusters (all 'short' clusters contain only 'sell' actions)
- All 'long' clusters contain only 'buy' actions (missing 'sell' executions)
- Total: 75 clusters (44 long, 31 short) - all short clusters are incorrect

ROOT CAUSE:
Unknown - requires investigation by development team.

VERIFICATION:
- Function map_execution_action_to_trade_side('sell') correctly returns 'long'
  when tested in isolation
- Clustering code in add_execution() uses this function correctly
- However, API response shows 'sell' executions in 'short' clusters
- Code logic appears correct, but results are wrong

DEBUGGING ATTEMPTS (ALL FAILED TO IDENTIFY ROOT CAUSE):
1. Added extensive logging (logger.warning/logger.debug) - logs not appearing
2. Added print statements for TIUP executions - output not visible
3. Disabled cache decorator (@cache_result) - issue persists
4. Verified mapping function works correctly in isolation
5. Server restarted multiple times - issue persists
6. Cache cleared (nuclear level) - issue persists
7. Checked for code path issues - no alternative paths found

POSSIBLE CAUSES (TO INVESTIGATE):
1. Cache issue: Old cached results being returned despite cache being disabled
2. Database data issue: execution.action values in DB might be different than expected
3. Code path issue: Different code path being executed than expected
4. Session/transaction issue: Data being read before commit or from wrong session
5. Import/module issue: Old version of code being loaded from cache or wrong path
6. Production environment using different code (production/Backend vs Backend)

NEXT STEPS FOR DEVELOPMENT TEAM:
1. Verify execution.action values in database for TIUP executions (IDs: 1089, 1090, 1091, 1092)
2. Add breakpoint/debugger in add_execution() method to inspect execution.action at runtime
3. Check if there's any code that modifies execution.action before clustering
4. Verify the code path: ensure get_execution_trade_creation_clusters() is actually being called
5. Check server logs for any errors or warnings during clustering
6. Test with fresh database session (no cache, no transactions)
7. Consider adding unit tests to verify clustering logic with known data
8. Check if production environment is using different code path (production/Backend vs Backend)
9. Verify Python module cache - may need to clear __pycache__ directories
10. Check if there's a different version of this file in production/Backend directory

FILES TO CHECK:
- Backend/services/execution_clustering_service.py (this file)
- Backend/routes/api/executions.py (API endpoint - line ~311)
- Backend/models/execution.py (Execution model - check action field definition)
- production/Backend/services/execution_clustering_service.py (if exists - may be different version)
- Any code that modifies execution.action before clustering

WORKAROUND:
None available - this is a critical bug affecting trade creation functionality.
Users cannot create trades from 'sell' executions because they appear in wrong clusters.

DETAILED NOTES:
See get_execution_trade_creation_clusters() docstring for complete investigation details.

================================================================================
"""

import logging
from collections import defaultdict
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from sqlalchemy.orm import Session, joinedload

from models.execution import Execution
from services.cache_service import cache_result, cache_service

logger = logging.getLogger(__name__)

# Cache TTL for clusters (5 minutes)
CLUSTER_CACHE_TTL = 300


def map_execution_action_to_trade_side(action: Optional[str]) -> str:
    """
    Map execution action to trade side.
    
    Long trades: buy (opening) + sell (closing)
    Short trades: short (opening) + cover (closing)
    
    Args:
        action: Execution action (buy, sell, short, cover)
        
    Returns:
        'long' or 'short'
    
    NOTE: This function has been verified to work correctly in isolation.
    When tested directly, map_execution_action_to_trade_side('sell') returns 'long'.
    However, in production, 'sell' executions are being clustered into 'short' clusters.
    This suggests the issue is elsewhere in the clustering logic or data flow.
    """
    if not action:
        return 'long'
    normalized = action.lower()
    # Short trades: short (opening) and cover (closing)
    if normalized in {"short", "cover"}:
        return 'short'
    # Long trades: buy (opening) and sell (closing)
    # All other actions (buy, sell) default to long
    return 'long'


class ClusterStatsCalculator:
    """Calculates statistics for execution clusters"""
    
    @staticmethod
    def calculate_stats(executions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate cluster statistics from executions
        
        Args:
            executions: List of execution dictionaries
            
        Returns:
            Dictionary with calculated statistics
        """
        total_quantity = 0.0
        total_value = 0.0
        total_fee = 0.0
        earliest_date = None
        latest_date = None
        
        for execution in executions:
            quantity = execution.get('quantity') or 0
            price = execution.get('price') or 0
            value = execution.get('value') or (quantity * price)
            fee = execution.get('fee') or 0
            
            total_quantity += quantity
            total_value += value
            total_fee += fee
            
            execution_date = execution.get('date')
            if execution_date:
                # Handle date envelope format
                if isinstance(execution_date, dict):
                    date_obj = execution_date.get('utc') or execution_date.get('local') or execution_date.get('display')
                    if isinstance(date_obj, str):
                        try:
                            execution_date = datetime.fromisoformat(date_obj.replace('Z', '+00:00'))
                        except:
                            execution_date = None
                    elif isinstance(date_obj, datetime):
                        execution_date = date_obj
                    else:
                        execution_date = None
                
                if execution_date:
                    if earliest_date is None or execution_date < earliest_date:
                        earliest_date = execution_date
                    if latest_date is None or execution_date > latest_date:
                        latest_date = execution_date
        
        average_price = round(total_value / total_quantity, 4) if total_quantity else None
        
        return {
            "total_quantity": total_quantity,
            "total_value": round(total_value, 2),
            "total_fee": round(total_fee, 2),
            "average_price": average_price,
            "execution_count": len(executions),
            "date_range": {
                "start": earliest_date,
                "end": latest_date
            }
        }
    
    @staticmethod
    def calculate_meta(executions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate cluster metadata from executions
        
        Args:
            executions: List of execution dictionaries
            
        Returns:
            Dictionary with metadata (sources, notes)
        """
        source_counts = defaultdict(int)
        notes = []
        
        for execution in executions:
            source = (execution.get('source') or 'manual').lower()
            source_counts[source] += 1
            
            execution_notes = execution.get('notes')
            if execution_notes:
                note_text = execution_notes.strip() if isinstance(execution_notes, str) else str(execution_notes).strip()
                if note_text:
                    notes.append(note_text)
        
        distinct_sources = list(source_counts.keys())
        
        return {
            "source_counts": dict(source_counts),
            "distinct_sources": distinct_sources,
            "notes": notes,
            "flags": {
                "multiple_executions": len(executions) > 1,
                "has_notes": len(notes) > 0,
                "has_multiple_sources": len(distinct_sources) > 1
            }
        }


class ClusterBuilder:
    """Builds execution clusters for trade creation"""
    
    def __init__(self, db: Session):
        self.db = db
        self.clusters: Dict[Tuple[int, Optional[int], str], Dict[str, Any]] = {}
    
    def add_execution(self, execution: Execution) -> None:
        """
        Add execution to appropriate cluster
        
        Args:
            execution: Execution object to add
        """
        # DEBUG: Print statements for TIUP debugging
        is_tiup = execution.ticker_id == 50
        if is_tiup:
            print(f"\n{'='*80}")
            print(f"[CLUSTERING DEBUG] Execution {execution.id}: action={repr(execution.action)}, ticker_id={execution.ticker_id}, account_id={execution.trading_account_id}")
            print(f"[CLUSTERING DEBUG] execution.action type: {type(execution.action)}")
            print(f"[CLUSTERING DEBUG] execution.action value: {repr(execution.action)}")
        
        # Use WARNING level for visibility - especially for TIUP debugging
        log_level = logger.warning if is_tiup else logger.debug
        
        log_level(f"[CLUSTERING] Execution {execution.id}: action={repr(execution.action)}, ticker_id={execution.ticker_id}, account_id={execution.trading_account_id}")
        
        side = map_execution_action_to_trade_side(execution.action)
        if is_tiup:
            print(f"[CLUSTERING DEBUG] map_execution_action_to_trade_side({repr(execution.action)}) = {side}")
        log_level(f"[CLUSTERING] Execution {execution.id}: map_execution_action_to_trade_side({repr(execution.action)}) = {side}")
        
        normalized_action = (execution.action or 'buy').lower()
        account_id = execution.trading_account_id
        
        # Cluster by ticker, account, and side (long/short)
        cluster_key = (execution.ticker_id, account_id, side)
        expected_cluster_id = f"{execution.ticker_id}-{account_id}-{side}"
        if is_tiup:
            print(f"[CLUSTERING DEBUG] cluster_key={cluster_key}, expected_cluster_id={expected_cluster_id}")
        log_level(f"[CLUSTERING] Execution {execution.id}: cluster_key={cluster_key}, expected_cluster_id={expected_cluster_id}")
        
        if cluster_key not in self.clusters:
            if is_tiup:
                print(f"[CLUSTERING DEBUG] Creating new cluster: {expected_cluster_id}")
            log_level(f"[CLUSTERING] Creating new cluster: {expected_cluster_id}")
            self._create_cluster(cluster_key, execution, side)
        else:
            if is_tiup:
                print(f"[CLUSTERING DEBUG] Using existing cluster: {expected_cluster_id}")
            log_level(f"[CLUSTERING] Using existing cluster: {expected_cluster_id}")
        
        cluster = self.clusters[cluster_key]
        actual_cluster_id = cluster.get('cluster_id', 'unknown')
        if is_tiup:
            print(f"[CLUSTERING DEBUG] Adding to cluster {actual_cluster_id} (expected: {expected_cluster_id})")
            if actual_cluster_id != expected_cluster_id:
                print(f"[CLUSTERING DEBUG] ❌ BUG: cluster_id mismatch! Expected {expected_cluster_id}, got {actual_cluster_id}")
        log_level(f"[CLUSTERING] Execution {execution.id}: Adding to cluster {actual_cluster_id} (expected: {expected_cluster_id})")
        
        if actual_cluster_id != expected_cluster_id:
            logger.error(f"[CLUSTERING BUG] Execution {execution.id} (action={repr(execution.action)}) mapped to side={side}, but cluster_id is {actual_cluster_id} instead of {expected_cluster_id}")
            if is_tiup:
                print(f"[CLUSTERING DEBUG] ❌ ERROR LOGGED: cluster_id mismatch!")
        
        self._add_execution_to_cluster(cluster, execution, normalized_action, side)
        if is_tiup:
            print(f"{'='*80}\n")
    
    def _create_cluster(self, cluster_key: Tuple[int, Optional[int], str], execution: Execution, side: str) -> None:
        """Create a new cluster"""
        ticker = execution.ticker
        trading_account = execution.trading_account
        
        cluster_id = f"{execution.ticker_id}-{execution.trading_account_id or 'none'}-{side}"
        is_tiup = execution.ticker_id == 50
        if is_tiup:
            print(f"[CLUSTERING DEBUG] _create_cluster: cluster_id={cluster_id}, side={side}, ticker_id={execution.ticker_id}, account_id={execution.trading_account_id}")
        log_level = logger.warning if is_tiup else logger.debug
        log_level(f"[CLUSTERING] Creating cluster: cluster_id={cluster_id}, side={side}, ticker_id={execution.ticker_id}, account_id={execution.trading_account_id}")
        
        cluster = {
            "cluster_id": cluster_id,
            "ticker": {
                "id": execution.ticker_id,
                "symbol": ticker.symbol if ticker else None,
                "name": ticker.name if ticker else None,
                "type": ticker.type if ticker else None
            },
            "trading_account": {
                "id": execution.trading_account_id,
                "name": trading_account.name if trading_account else None,
                "currency_id": trading_account.currency_id if trading_account else None
            },
            "side": side,
            "actions": set(),
            "executions": [],
            "execution_ids": [],
            "stats": {
                "total_quantity": 0.0,
                "total_value": 0.0,
                "total_fee": 0.0,
                "earliest_date": None,
                "latest_date": None
            },
            "meta": {
                "source_counts": defaultdict(int),
                "notes": []
            }
        }
        self.clusters[cluster_key] = cluster
    
    def _add_execution_to_cluster(self, cluster: Dict[str, Any], execution: Execution, normalized_action: str, side: str) -> None:
        """Add execution to existing cluster"""
        execution_dict = execution.to_dict()
        quantity = execution.quantity or 0
        price = execution.price or 0
        execution_value = quantity * price
        fee = execution.fee or 0
        
        execution_dict["value"] = execution_value
        execution_dict["side"] = side
        execution_dict["normalized_action"] = normalized_action
        # Keep original action from database, don't override with normalized_action
        # This ensures frontend can display the correct action (buy/sell/short/cover)
        if "action" not in execution_dict or not execution_dict["action"]:
            execution_dict["action"] = execution.action or normalized_action
        execution_dict["selected"] = True
        
        cluster["executions"].append(execution_dict)
        cluster["execution_ids"].append(execution.id)
        cluster["actions"].add(normalized_action)
        
        stats = cluster["stats"]
        stats["total_quantity"] += quantity
        stats["total_value"] += execution_value
        stats["total_fee"] += fee or 0
        
        execution_date = execution.date
        if execution_date:
            if stats["earliest_date"] is None or execution_date < stats["earliest_date"]:
                stats["earliest_date"] = execution_date
            if stats["latest_date"] is None or execution_date > stats["latest_date"]:
                stats["latest_date"] = execution_date
        
        meta = cluster["meta"]
        source_value = (execution.source or 'manual').lower()
        meta["source_counts"][source_value] += 1
        
        if execution.notes:
            note_text = execution.notes.strip()
            if note_text:
                meta["notes"].append(note_text)
    
    def build_clusters(self, max_items: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Build final cluster list with all calculated data
        
        Args:
            max_items: Maximum number of clusters to return
            
        Returns:
            List of cluster dictionaries
        """
        clusters_list: List[Dict[str, Any]] = []
        
        for cluster in self.clusters.values():
            # Calculate final statistics
            stats = cluster["stats"]
            meta = cluster.pop("meta", {"source_counts": defaultdict(int), "notes": []})
            
            total_quantity = stats["total_quantity"]
            total_value = stats["total_value"]
            stats["average_price"] = round(total_value / total_quantity, 4) if total_quantity else None
            stats["total_value"] = round(total_value, 2)
            stats["total_fee"] = round(stats["total_fee"], 2)
            stats["execution_count"] = len(cluster["executions"])
            
            earliest_date = stats.pop("earliest_date", None)
            latest_date = stats.pop("latest_date", None)
            stats["date_range"] = {
                "start": earliest_date,
                "end": latest_date
            }
            
            source_counts = meta.get("source_counts", defaultdict(int))
            distinct_sources = list(source_counts.keys())
            
            cluster["flags"] = {
                "multiple_executions": stats["execution_count"] > 1,
                "has_notes": len(meta.get("notes", [])) > 0,
                "has_multiple_sources": len(distinct_sources) > 1
            }
            
            cluster["stats"]["distinct_sources"] = distinct_sources
            
            notes_summary = self._build_notes_summary(meta.get("notes", []))
            primary_source = self._get_primary_source(source_counts)
            
            # Determine primary action based on side
            primary_action = self._determine_primary_action(cluster["side"], cluster["actions"])
            
            cluster["suggested_trade"] = {
                "ticker_id": cluster["ticker"]["id"],
                "ticker_symbol": cluster["ticker"].get("symbol"),
                "trading_account_id": cluster["trading_account"]["id"],
                "side": cluster["side"],
                "action": primary_action,
                "entry_price": stats["average_price"],
                "entry_date": earliest_date,
                "last_execution_date": latest_date,
                "quantity": total_quantity,
                "amount": stats["total_value"],
                "fee": stats["total_fee"],
                "source": primary_source,
                "execution_ids": cluster["execution_ids"],
                "notes": notes_summary,
                "default_selected_execution_ids": cluster["execution_ids"]
            }
            
            # Convert actions set to list for JSON serialization
            cluster["actions"] = sorted(list(cluster["actions"]))
            
            clusters_list.append(cluster)
        
        # Sort clusters by date and value
        clusters_list.sort(
            key=lambda item: (
                item["stats"].get("date_range", {}).get("end") or datetime.min,
                item["stats"].get("total_value", 0)
            ),
            reverse=True
        )
        
        if max_items and max_items > 0:
            clusters_list = clusters_list[:max_items]
        
        return clusters_list
    
    def _determine_primary_action(self, side: str, actions: set) -> str:
        """Determine primary action for cluster"""
        if not actions:
            return 'buy' if side == 'long' else 'short'
        
        # For long: prefer buy, for short: prefer short
        if side == 'long' and 'buy' in actions:
            return 'buy'
        elif side == 'short' and 'short' in actions:
            return 'short'
        else:
            return list(actions)[0]
    
    @staticmethod
    def _get_primary_source(source_counts: Dict[str, int]) -> str:
        """Get primary source from source counts"""
        if not source_counts:
            return 'manual'
        return max(source_counts.items(), key=lambda item: item[1])[0]
    
    @staticmethod
    def _build_notes_summary(notes: List[str]) -> Optional[str]:
        """Build notes summary string"""
        if not notes:
            return None
        first_note = notes[0]
        remaining = len(notes) - 1
        if remaining <= 0:
            return first_note
        return f"{first_note} (+{remaining} הערות נוספות)"


class ExecutionClusteringService:
    """Main service for execution clustering"""
    
    @staticmethod
    def get_pending_executions(db: Session, limit: Optional[int] = None, offset: int = 0) -> List[Execution]:
        """
        Get all executions without trade assignment and with ticker_id
        
        Args:
            db: Database session
            limit: Maximum number of executions to return (None for all)
            offset: Number of executions to skip (for pagination)
            
        Returns:
            List of executions with ticker_id but no trade_id
        """
        query = db.query(Execution).options(
            joinedload(Execution.ticker),
            joinedload(Execution.trading_account)
        ).filter(
            Execution.trade_id.is_(None),
            Execution.ticker_id.isnot(None)
        ).order_by(Execution.date.desc())
        
        if limit is not None:
            query = query.limit(limit).offset(offset)
        
        executions = query.all()
        
        logger.info(f"Found {len(executions)} executions pending trade assignment (limit={limit}, offset={offset})")
        return executions
    
    @staticmethod
    # @cache_result(ttl=CLUSTER_CACHE_TTL, key_prefix="execution_clusters")  # Temporarily disabled for debugging
    def get_execution_trade_creation_clusters(
        db: Session,
        max_items: Optional[int] = None,
        limit_executions: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Cluster executions by ticker/account/side for quick trade creation.
        
        Clusters combine compatible execution actions:
        - Long trades: buy (opening) + sell (closing)
        - Short trades: short (opening) + cover (closing)
        
        A trade cannot mix long and short executions.
        
        Args:
            db: Database session
            max_items: Maximum number of clusters to return
            limit_executions: Maximum number of executions to process (for pagination)
            
        Returns:
            List of cluster dictionaries
        
        ========================================================================
        ⚠️  KNOWN ISSUE - REQUIRES INVESTIGATION ⚠️
        ========================================================================
        
        STATUS: BUG IDENTIFIED - IN PRODUCTION ENVIRONMENT
        
        PROBLEM:
        Execution actions of type 'sell' are being incorrectly clustered into
        'short' side clusters instead of 'long' side clusters.
        
        EXPECTED BEHAVIOR:
        - 'sell' actions should map to 'long' side (closing long position)
        - 'buy' actions should map to 'long' side (opening long position)
        - 'short' actions should map to 'short' side (opening short position)
        - 'cover' actions should map to 'short' side (closing short position)
        
        ACTUAL BEHAVIOR:
        - 'sell' actions are being clustered into 'short' side clusters
        - Example: TIUP ticker (ID=50) has 4 pending executions:
          * Execution 1089: action='buy' → correctly in cluster '50-2-long'
          * Execution 1090: action='sell' → INCORRECTLY in cluster '50-2-short'
          * Execution 1091: action='sell' → INCORRECTLY in cluster '50-2-short'
          * Execution 1092: action='sell' → INCORRECTLY in cluster '50-2-short'
        
        VERIFICATION:
        - The function `map_execution_action_to_trade_side('sell')` correctly
          returns 'long' when tested directly
        - The clustering code in `add_execution()` uses this function correctly
        - However, the API response shows 'sell' executions in 'short' clusters
        
        POSSIBLE CAUSES:
        1. Cache issue: Old cached results being returned (cache disabled for debugging)
        2. Database data issue: execution.action values in DB might be different
        3. Code path issue: Different code path being executed than expected
        4. Session/transaction issue: Data being read before commit or from wrong session
        
        DEBUGGING ATTEMPTS:
        - Added extensive logging (logger.warning/logger.debug) - logs not appearing
        - Added print statements for TIUP executions - output not visible
        - Disabled cache decorator - issue persists
        - Verified mapping function works correctly in isolation
        - Server restarted multiple times - issue persists
        
        ENVIRONMENT:
        - Production environment (TikTrackApp-Production workspace)
        - PostgreSQL database (TikTrack-db-development)
        - Cache system active (but decorator disabled for debugging)
        - Server running on port 5001
        
        NEXT STEPS FOR DEVELOPMENT TEAM:
        1. Verify execution.action values in database for TIUP executions (IDs: 1089, 1090, 1091, 1092)
        2. Add breakpoint/debugger in add_execution() method to inspect execution.action at runtime
        3. Check if there's any code that modifies execution.action before clustering
        4. Verify the code path: ensure get_execution_trade_creation_clusters() is actually being called
        5. Check server logs for any errors or warnings during clustering
        6. Test with fresh database session (no cache, no transactions)
        7. Consider adding unit tests to verify clustering logic with known data
        
        FILES TO CHECK:
        - Backend/services/execution_clustering_service.py (this file)
        - Backend/routes/api/executions.py (API endpoint)
        - Backend/models/execution.py (Execution model - check action field)
        - Any code that modifies execution.action before clustering
        
        DATE: 2025-11-24
        ========================================================================
        """
        print("\n" + "="*80)
        print("[CLUSTERING DEBUG] Starting get_execution_trade_creation_clusters")
        logger.warning("[CLUSTERING] Starting get_execution_trade_creation_clusters")
        pending_executions = ExecutionClusteringService.get_pending_executions(
            db, 
            limit=limit_executions
        )
        print(f"[CLUSTERING DEBUG] Found {len(pending_executions)} pending executions")
        logger.warning(f"[CLUSTERING] Found {len(pending_executions)} pending executions")
        
        # Log TIUP executions specifically
        tiup_executions = [e for e in pending_executions if e.ticker_id == 50]
        if tiup_executions:
            print(f"[CLUSTERING DEBUG] TIUP executions found: {len(tiup_executions)}")
            logger.warning(f"[CLUSTERING] TIUP executions found: {len(tiup_executions)}")
            for ex in tiup_executions:
                print(f"[CLUSTERING DEBUG] TIUP Execution {ex.id}: action={repr(ex.action)}, type={type(ex.action)}, ticker_id={ex.ticker_id}, account_id={ex.trading_account_id}")
                logger.warning(f"[CLUSTERING] TIUP Execution {ex.id}: action={repr(ex.action)}, ticker_id={ex.ticker_id}, account_id={ex.trading_account_id}")
        
        builder = ClusterBuilder(db)
        for execution in pending_executions:
            builder.add_execution(execution)
        
        clusters = builder.build_clusters(max_items=max_items)
        
        # Log TIUP clusters
        tiup_clusters = [c for c in clusters if c.get('ticker', {}).get('id') == 50]
        if tiup_clusters:
            print(f"[CLUSTERING DEBUG] TIUP clusters created: {len(tiup_clusters)}")
            logger.warning(f"[CLUSTERING] TIUP clusters created: {len(tiup_clusters)}")
            for cluster in tiup_clusters:
                print(f"[CLUSTERING DEBUG] TIUP Cluster: {cluster.get('cluster_id')}, side={cluster.get('side')}, executions={len(cluster.get('executions', []))}")
                logger.warning(f"[CLUSTERING] TIUP Cluster: {cluster.get('cluster_id')}, side={cluster.get('side')}, executions={len(cluster.get('executions', []))}")
                for ex in cluster.get('executions', []):
                    print(f"[CLUSTERING DEBUG]   - Execution {ex.get('id')}: action={ex.get('action')}, side={ex.get('side')}")
                    logger.warning(f"[CLUSTERING]   - Execution {ex.get('id')}: action={ex.get('action')}, side={ex.get('side')}")
        
        print(f"[CLUSTERING DEBUG] Returning {len(clusters)} clusters total")
        print("="*80 + "\n")
        logger.warning(f"[CLUSTERING] Returning {len(clusters)} clusters total")
        return clusters


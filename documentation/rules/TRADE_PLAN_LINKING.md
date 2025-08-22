# Trade-Plan Linking Rules - TikTrack

## Overview

This document describes the rules for linking between trades and trade plans in the TikTrack system.

## Main Rules

### 1. Mandatory Linking
- **Every trade must be linked to some plan**
- **Cannot create a trade without linking to a plan**

### 2. Status Rules
- **Open trade**: Must be linked to a plan in `open` or `closed` status
- **Closed/cancelled trade**: Can be assigned to a plan in any status

### 3. Date Rules
- **Trade creation date cannot be earlier than plan creation date**
- **Plan must exist before creating the trade**

### 4. Side Rules
- **Trade side must be identical to plan side**
- **Possible values**: `Long`, `Short`
- **Default**: `Long`

### 5. Type Rules
- **Trade type can be different from plan type**
- **Default**: New trade gets type from plan
- **Late change**: User can change trade type without needing to change the plan

## Examples

### Example 1: Valid Trade
```
Plan:
- ID: 1
- Type: swing
- Side: Long
- Status: open

Trade:
- Trade Plan ID: 1
- Type: swing (taken from plan)
- Side: Long (must be identical)
- Status: open
```

### Example 2: Changing Trade Type
```
Plan:
- ID: 2
- Type: investment
- Side: Long
- Status: open

Trade:
- Trade Plan ID: 2
- Type: swing (different from plan - allowed)
- Side: Long (identical to plan - required)
- Status: open
```

### Example 3: Invalid Trade
```
Plan:
- ID: 3
- Type: swing
- Side: Long
- Status: open

Trade:
- Trade Plan ID: 3
- Type: swing
- Side: Short (different from plan - not allowed!)
- Status: open
```

## Technical Implementation

### Trade Model
```python
def validate_trade_plan_link(self, trade_plan):
    # Check side - must be identical
    if self.side != trade_plan.side:
        return False, f"Trade side ({self.side}) must be identical to plan side ({trade_plan.side})"
    
    # Additional checks...
    return True, "Valid"
```

### Trade Service
```python
def create(db: Session, data: Dict[str, Any]) -> Trade:
    # Assign type from plan if not defined
    if 'type' not in data or not data['type']:
        data['type'] = trade_plan.investment_type
    
    # Assign side from plan if not defined
    if 'side' not in data or not data['side']:
        data['side'] = trade_plan.side
    
    # Create trade...
```

### Data Fix Script
```python
def find_best_plan_for_trade(trade: Dict, plans: List[Dict]) -> Optional[int]:
    # Filter by side - must be identical
    side_matching = [p for p in valid_plans if p.get('side', 'Long') == trade.get('side', 'Long')]
    if side_matching:
        valid_plans = side_matching
    else:
        return None  # No plan with same side
```

## Validation Tests

### Automated Tests
1. **Link check**: Every trade linked to a plan
2. **Status check**: Open trades with valid plans
3. **Date check**: No trades created before plans
4. **Side check**: Trade side identical to plan side

### Test Script
```bash
python3 fix_trade_plan_links.py
```

## System Impact

### Advantages
- **Data integrity**: Every trade linked to a valid plan
- **Consistency**: Clear rules for all links
- **Flexibility**: Option to change trade type without affecting plan
- **Error prevention**: Automatic validation before saving

### Limitations
- **Fixed side**: Cannot change trade side without changing plan
- **Plan dependency**: Every trade depends on existing plan
- **Complexity**: More rules to maintain

## Usage Instructions

### Creating New Trade
1. Select existing plan
2. System will automatically assign type and side from plan
3. Can change type later

### Updating Trade
1. Change type: allowed
2. Change side: not allowed (must change plan)
3. Change link: System will check validity

### Fixing Data
1. Run `fix_trade_plan_links.py`
2. Script will find best plan for each trade
3. Will check and fix all rules

## Summary

The rules ensure:
- **Integrity**: Every trade linked to valid plan
- **Consistency**: Identical side between trade and plan
- **Flexibility**: Type can be different
- **Reliability**: Reliable and accurate data

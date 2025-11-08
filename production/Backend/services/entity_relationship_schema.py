"""
Entity Relationship Schema - TikTrack
=====================================

Central schema definition for all entity relationships in the TikTrack system.
This schema defines how entities are linked to each other, including:
- Direct foreign key relationships
- Through relationships (via intermediate entities)
- Conditional relationships (via conditions)
- Legacy relationships (via related_type_id/related_id)

This schema will be used by EntityRelationshipResolver to generically fetch
linked items for any entity type.

Author: TikTrack Development Team
Version: 1.0.0
Date: 2025-11-08

Usage:
    >>> from services.entity_relationship_schema import ENTITY_RELATIONSHIPS
    >>> resolver = EntityRelationshipResolver(ENTITY_RELATIONSHIPS)
    >>> linked_items = resolver.get_linked_items(db, 'trade', 1)
"""

from typing import Dict, Any, List, Optional, Literal

# ===== RELATIONSHIP TYPE DEFINITIONS =====

# Relationship types
RELATIONSHIP_DIRECT = 'direct'  # Direct foreign key (e.g., trade.ticker_id)
RELATIONSHIP_THROUGH = 'through'  # Through intermediate entity (e.g., alert -> plan_condition -> trade_plan)
RELATIONSHIP_CONDITIONAL = 'conditional'  # Conditional relationship (e.g., alert -> trade_condition -> trade)
RELATIONSHIP_LEGACY = 'legacy'  # Legacy relationship via related_type_id/related_id (e.g., note.related_type_id)

# ===== NOTE RELATION TYPE MAPPINGS =====
# These IDs map to note_relation_types table
NOTE_RELATION_TYPE_TRADING_ACCOUNT = 1
NOTE_RELATION_TYPE_TRADE = 2
NOTE_RELATION_TYPE_TRADE_PLAN = 3
NOTE_RELATION_TYPE_TICKER = 4
NOTE_RELATION_TYPE_ALERT = 5
NOTE_RELATION_TYPE_CASH_FLOW = 6
NOTE_RELATION_TYPE_EXECUTION = 7
NOTE_RELATION_TYPE_NOTE = 8

# ===== ENTITY RELATIONSHIP SCHEMA =====

ENTITY_RELATIONSHIPS: Dict[str, Dict[str, Any]] = {
    'ticker': {
        'parents': [],
        'children': {
            'trade': {
                'type': RELATIONSHIP_DIRECT,
                'field': 'ticker_id',
                'query': 'Trade.ticker_id == {entity_id}',
                'required': False
            },
            'trade_plan': {
                'type': RELATIONSHIP_DIRECT,
                'field': 'ticker_id',
                'query': 'TradePlan.ticker_id == {entity_id}',
                'required': False
            },
            'alert': {
                'type': RELATIONSHIP_DIRECT,
                'field': 'ticker_id',
                'query': 'Alert.ticker_id == {entity_id}',
                'required': False
            },
            'execution': {
                'type': RELATIONSHIP_DIRECT,
                'field': 'ticker_id',
                'query': 'Execution.ticker_id == {entity_id}',
                'required': False
            },
            'note': {
                'type': RELATIONSHIP_LEGACY,
                'field': 'related_type_id',
                'value': NOTE_RELATION_TYPE_TICKER,
                'query': 'Note.related_type_id == {relation_type_id} AND Note.related_id == {entity_id}',
                'required': False
            }
        }
    },
    
    'trade': {
        'parents': {
            'trading_account': {
                'type': RELATIONSHIP_DIRECT,
                'field': 'trading_account_id',
                'query': 'Trade.trading_account_id == {entity_id}',
                'required': True
            },
            'ticker': {
                'type': RELATIONSHIP_DIRECT,
                'field': 'ticker_id',
                'query': 'Trade.ticker_id == {entity_id}',
                'required': True
            },
            'trade_plan': {
                'type': RELATIONSHIP_DIRECT,
                'field': 'trade_plan_id',
                'query': 'Trade.trade_plan_id == {entity_id}',
                'required': False
            }
        },
        'children': {
            'execution': {
                'type': RELATIONSHIP_DIRECT,
                'field': 'trade_id',
                'query': 'Execution.trade_id == {entity_id}',
                'required': False
            },
            'cash_flow': {
                'type': RELATIONSHIP_DIRECT,
                'field': 'trade_id',
                'query': 'CashFlow.trade_id == {entity_id}',
                'required': False
            },
            'note': {
                'type': RELATIONSHIP_LEGACY,
                'field': 'related_type_id',
                'value': NOTE_RELATION_TYPE_TRADE,
                'query': 'Note.related_type_id == {relation_type_id} AND Note.related_id == {entity_id}',
                'required': False
            },
            'alert': {
                'type': RELATIONSHIP_CONDITIONAL,
                'field': 'trade_condition_id',
                'through': 'TradeCondition',
                'query': 'TradeCondition.trade_id == {entity_id}',
                'target_query': 'Alert.trade_condition_id == TradeCondition.id',
                'required': False
            }
        }
    },
    
    'trade_plan': {
        'parents': {
            'trading_account': {
                'type': RELATIONSHIP_DIRECT,
                'field': 'trading_account_id',
                'query': 'TradePlan.trading_account_id == {entity_id}',
                'required': True
            },
            'ticker': {
                'type': RELATIONSHIP_DIRECT,
                'field': 'ticker_id',
                'query': 'TradePlan.ticker_id == {entity_id}',
                'required': True
            }
        },
        'children': {
            'trade': {
                'type': RELATIONSHIP_DIRECT,
                'field': 'trade_plan_id',
                'query': 'Trade.trade_plan_id == {entity_id}',
                'required': False
            },
            'note': {
                'type': RELATIONSHIP_LEGACY,
                'field': 'related_type_id',
                'value': NOTE_RELATION_TYPE_TRADE_PLAN,
                'query': 'Note.related_type_id == {relation_type_id} AND Note.related_id == {entity_id}',
                'required': False
            },
            'alert': {
                'type': RELATIONSHIP_CONDITIONAL,
                'field': 'plan_condition_id',
                'through': 'PlanCondition',
                'query': 'PlanCondition.trade_plan_id == {entity_id}',
                'target_query': 'Alert.plan_condition_id == PlanCondition.id',
                'required': False,
                'legacy_support': {
                    'type': RELATIONSHIP_LEGACY,
                    'field': 'related_type_id',
                    'value': NOTE_RELATION_TYPE_TRADE_PLAN,
                    'query': 'Alert.related_type_id == {relation_type_id} AND Alert.related_id == {entity_id}',
                    'required': False
                }
            }
        }
    },
    
    'trading_account': {
        'parents': [],
        'children': {
            'trade': {
                'type': RELATIONSHIP_DIRECT,
                'field': 'trading_account_id',
                'query': 'Trade.trading_account_id == {entity_id}',
                'required': False
            },
            'trade_plan': {
                'type': RELATIONSHIP_DIRECT,
                'field': 'trading_account_id',
                'query': 'TradePlan.trading_account_id == {entity_id}',
                'required': False
            },
            'execution': {
                'type': RELATIONSHIP_DIRECT,
                'field': 'trading_account_id',
                'query': 'Execution.trading_account_id == {entity_id}',
                'required': False
            },
            'cash_flow': {
                'type': RELATIONSHIP_DIRECT,
                'field': 'trading_account_id',
                'query': 'CashFlow.trading_account_id == {entity_id}',
                'required': False
            },
            'alert': {
                'type': RELATIONSHIP_LEGACY,
                'field': 'related_type_id',
                'value': NOTE_RELATION_TYPE_TRADING_ACCOUNT,
                'query': 'Alert.related_type_id == {relation_type_id} AND Alert.related_id == {entity_id}',
                'required': False
            },
            'note': {
                'type': RELATIONSHIP_LEGACY,
                'field': 'related_type_id',
                'value': NOTE_RELATION_TYPE_TRADING_ACCOUNT,
                'query': 'Note.related_type_id == {relation_type_id} AND Note.related_id == {entity_id}',
                'required': False
            }
        }
    },
    
    'execution': {
        'parents': {
            'trading_account': {
                'type': RELATIONSHIP_DIRECT,
                'field': 'trading_account_id',
                'query': 'Execution.trading_account_id == {entity_id}',
                'required': True
            },
            'ticker': {
                'type': RELATIONSHIP_DIRECT,
                'field': 'ticker_id',
                'query': 'Execution.ticker_id == {entity_id}',
                'required': False,
                'prevent_duplicates': True  # May also be linked through trade
            },
            'trade': {
                'type': RELATIONSHIP_DIRECT,
                'field': 'trade_id',
                'query': 'Execution.trade_id == {entity_id}',
                'required': False,
                'cascade_ticker': True  # If trade exists, also add its ticker
            }
        },
        'children': []
    },
    
    'cash_flow': {
        'parents': {
            'trading_account': {
                'type': RELATIONSHIP_DIRECT,
                'field': 'trading_account_id',
                'query': 'CashFlow.trading_account_id == {entity_id}',
                'required': True
            },
            'trade': {
                'type': RELATIONSHIP_DIRECT,
                'field': 'trade_id',
                'query': 'CashFlow.trade_id == {entity_id}',
                'required': False,
                'cascade_ticker': True  # If trade exists, also add its ticker
            }
        },
        'children': []
    },
    
    'alert': {
        'parents': {
            'ticker': {
                'type': RELATIONSHIP_DIRECT,
                'field': 'ticker_id',
                'query': 'Alert.ticker_id == {entity_id}',
                'required': False
            },
            'trade_plan': {
                'type': RELATIONSHIP_CONDITIONAL,
                'field': 'plan_condition_id',
                'through': 'PlanCondition',
                'query': 'PlanCondition.id == Alert.plan_condition_id',
                'target_query': 'PlanCondition.trade_plan_id == {entity_id}',
                'required': False,
                'cascade_account': True  # If trade_plan exists, also add its trading_account
            },
            'trade': {
                'type': RELATIONSHIP_CONDITIONAL,
                'field': 'trade_condition_id',
                'through': 'TradeCondition',
                'query': 'TradeCondition.id == Alert.trade_condition_id',
                'target_query': 'TradeCondition.trade_id == {entity_id}',
                'required': False,
                'cascade_account': True,  # If trade exists, also add its trading_account
                'cascade_plan': True  # If trade exists and has trade_plan_id, also add trade_plan
            },
            'trading_account': {
                'type': RELATIONSHIP_LEGACY,
                'field': 'related_type_id',
                'value': NOTE_RELATION_TYPE_TRADING_ACCOUNT,
                'query': 'Alert.related_type_id == {relation_type_id} AND Alert.related_id == {entity_id}',
                'required': False,
                'prevent_duplicates': True  # May also be linked through trade_plan or trade
            }
        },
        'children': {
            'trade': {
                'type': RELATIONSHIP_DIRECT,
                'field': 'ticker_id',
                'query': 'Trade.ticker_id == Alert.ticker_id AND Alert.ticker_id == {entity_id}',
                'required': False,
                'prevent_duplicates': True  # May already be added as parent
            },
            'note': {
                'type': RELATIONSHIP_LEGACY,
                'field': 'related_type_id',
                'value': NOTE_RELATION_TYPE_ALERT,
                'query': 'Note.related_type_id == {relation_type_id} AND Note.related_id == {entity_id}',
                'required': False
            }
        }
    },
    
    'note': {
        'parents': {
            # Note has dynamic parent based on related_type_id
            # This will be resolved dynamically in the resolver
            'dynamic': {
                'type': RELATIONSHIP_LEGACY,
                'field': 'related_type_id',
                'query': 'Note.related_type_id == {relation_type_id} AND Note.related_id == {entity_id}',
                'required': True
            }
        },
        'children': []
    }
}

# ===== FIELD DEFINITIONS PER ENTITY TYPE =====
# Defines which fields should be included in linked item output for each entity type

LINKED_ITEM_FIELDS: Dict[str, Dict[str, Any]] = {
    'ticker': {
        'required': ['id', 'type', 'name', 'title', 'status', 'created_at'],
        'optional': ['description', 'updated_at'],
        'never': ['side', 'investment_type']
    },
    'trade': {
        'required': ['id', 'type', 'name', 'title', 'status', 'side', 'investment_type', 'created_at'],
        'optional': ['description', 'updated_at', 'closed_at'],
        'never': []
    },
    'trade_plan': {
        'required': ['id', 'type', 'name', 'title', 'status', 'side', 'investment_type', 'created_at'],
        'optional': ['description', 'updated_at', 'cancelled_at'],
        'never': []
    },
    'trading_account': {
        'required': ['id', 'type', 'name', 'title', 'status', 'created_at'],
        'optional': ['description', 'updated_at'],
        'never': ['side', 'investment_type']
    },
    'execution': {
        'required': ['id', 'type', 'name', 'title', 'status', 'created_at'],
        'optional': ['description', 'side', 'updated_at', 'date', 'action'],
        'never': ['investment_type']
    },
    'cash_flow': {
        'required': ['id', 'type', 'name', 'title', 'status', 'created_at'],
        'optional': ['description', 'amount', 'currency_symbol', 'updated_at', 'date'],
        'never': ['side', 'investment_type']
    },
    'alert': {
        'required': ['id', 'type', 'name', 'title', 'status', 'created_at'],
        'optional': ['description', 'is_triggered', 'triggered_at', 'updated_at'],
        'never': ['side', 'investment_type']
    },
    'note': {
        'required': ['id', 'type', 'name', 'title', 'status', 'created_at'],
        'optional': ['description', 'content', 'updated_at'],
        'never': ['side', 'investment_type']
    }
}

# ===== FIELD FORMATTING RULES =====
# Defines how to format fields for display in linked items

FIELD_FORMATTERS: Dict[str, Dict[str, Any]] = {
    'name': {
        'trade': lambda item: item.get('ticker_symbol') or f"טרייד #{item['id']}",
        'trade_plan': lambda item: item.get('ticker_symbol') or f"תכנית #{item['id']}",
        'execution': lambda item: f"ביצוע {item.get('action', '')} {item.get('quantity', '')} יחידות {item.get('ticker_symbol', '')}".strip() or f"ביצוע #{item['id']}",
        'cash_flow': lambda item: f"{item.get('currency_symbol', '')}{item.get('amount', '')}" if item.get('amount') else f"תזרים #{item['id']}",
        'alert': lambda item: item.get('message') or f"התראה #{item['id']}",
        'note': lambda item: (item.get('content', '')[:50] + '...') if item.get('content') and len(item.get('content', '')) > 50 else (item.get('content') or f"הערה #{item['id']}"),
        'default': lambda item: item.get('name') or item.get('title') or f"{item['type']} #{item['id']}"
    },
    'title': {
        'trade': lambda item: f"טרייד {item.get('side', '')} על {item.get('ticker_symbol', '')}".strip() or f"טרייד #{item['id']}",
        'trade_plan': lambda item: f"תכנית {item.get('side', '')} על {item.get('ticker_symbol', '')}".strip() or f"תכנית #{item['id']}",
        'execution': lambda item: f"ביצוע {item.get('action', '')} {item.get('ticker_symbol', '')}".strip() or f"ביצוע #{item['id']}",
        'cash_flow': lambda item: f"תזרים {item.get('type', '')}" or f"תזרים #{item['id']}",
        'alert': lambda item: item.get('message') or f"התראה #{item['id']}",
        'note': lambda item: (item.get('content', '')[:50] + '...') if item.get('content') and len(item.get('content', '')) > 50 else (item.get('content') or f"הערה #{item['id']}"),
        'default': lambda item: item.get('title') or item.get('name') or f"{item['type']} #{item['id']}"
    },
    'description': {
        'trade': lambda item: f"טרייד {item.get('side', '')} על {item.get('ticker_symbol', '')}".strip() or f"טרייד #{item['id']}",
        'trade_plan': lambda item: f"תכנית השקעה #{item['id']}",
        'execution': lambda item: f"ביצוע {item.get('action', '')} {item.get('quantity', '')} יחידות {item.get('ticker_symbol', '')}".strip() or f"ביצוע #{item['id']}",
        'cash_flow': lambda item: f"תזרים {item.get('type', '')} - {item.get('currency_symbol', '')} {item.get('amount', '')}".strip() if item.get('amount') else f"תזרים #{item['id']}",
        'alert': lambda item: f"התראה לטיקר {item.get('ticker_id', '')}" if item.get('ticker_id') else f"התראה #{item['id']}",
        'note': lambda item: item.get('content', '')[:50] + '...' if item.get('content') and len(item.get('content', '')) > 50 else (item.get('content') or ''),
        'default': lambda item: item.get('description') or item.get('name') or item.get('title') or ''
    }
}

# ===== CANONICAL OUTPUT SCHEMA =====
# Defines the exact structure of a linked item in the API response

CANONICAL_LINKED_ITEM_SCHEMA = {
    'id': int,  # Required
    'type': str,  # Required: 'trade' | 'trade_plan' | 'execution' | 'trading_account' | 'ticker' | 'alert' | 'note' | 'cash_flow'
    'name': str,  # Required: Display name
    'title': str,  # Required: Display title (usually same as name)
    'description': Optional[str],  # Optional: Detailed description
    'status': str,  # Required: 'open' | 'closed' | 'cancelled' | 'active'
    'side': Optional[str],  # Optional: 'Long' | 'Short' | 'buy' | 'sell' | null
    'investment_type': Optional[str],  # Optional: 'swing' | 'passive' | 'day' | null
    'created_at': str,  # Required: ISO format datetime
    'updated_at': Optional[str],  # Optional: ISO format datetime or null
    # Entity-specific fields (optional):
    'amount': Optional[float],  # For cash_flow
    'currency_symbol': Optional[str],  # For cash_flow
    'is_triggered': Optional[str],  # For alert: 'false' | 'new' | 'true'
    'content': Optional[str],  # For note
    'action': Optional[str],  # For execution: 'buy' | 'sell'
    'date': Optional[str],  # For execution/cash_flow: ISO format date
    'ticker_symbol': Optional[str],  # For trade/trade_plan/execution: ticker symbol
}

# ===== HELPER FUNCTIONS =====

def get_entity_schema(entity_type: str) -> Optional[Dict[str, Any]]:
    """Get schema for a specific entity type"""
    return ENTITY_RELATIONSHIPS.get(entity_type)

def get_linked_item_fields(entity_type: str) -> Dict[str, Any]:
    """Get field definitions for a specific entity type"""
    return LINKED_ITEM_FIELDS.get(entity_type, {
        'required': ['id', 'type', 'name', 'title', 'status', 'created_at'],
        'optional': ['description', 'updated_at'],
        'never': []
    })

def get_field_formatter(field_name: str, entity_type: str):
    """Get formatter function for a specific field and entity type"""
    formatters = FIELD_FORMATTERS.get(field_name, {})
    return formatters.get(entity_type) or formatters.get('default') or (lambda item: item.get(field_name, ''))

def validate_linked_item(item: Dict[str, Any]) -> bool:
    """Validate that a linked item matches the canonical schema"""
    required_fields = ['id', 'type', 'name', 'title', 'status', 'created_at']
    return all(field in item for field in required_fields)


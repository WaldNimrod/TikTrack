"""
Migration: Insert Initial External Data Configuration (Simple Version)
Inserts initial configuration for Yahoo Finance and default user preferences using direct SQL
"""

import sqlite3
import json
from datetime import datetime, timezone
from pathlib import Path

# Get the database path
BASE_DIR = Path(__file__).parent.parent
DB_PATH = BASE_DIR / "db" / "simpleTrade_new.db"

def insert_initial_data():
    """Insert initial external data configuration"""
    if not DB_PATH.exists():
        print(f"❌ Database not found at: {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Insert Yahoo Finance provider
        yahoo_provider_data = {
            'name': 'yahoo_finance',
            'display_name': 'Yahoo Finance',
            'is_active': True,
            'provider_type': 'finance',
            'api_key': None,  # Yahoo Finance doesn't require API key
            'base_url': 'https://query1.finance.yahoo.com',
            'rate_limit_per_hour': 900,
            'timeout_seconds': 20,
            'retry_attempts': 2,
            'cache_ttl_hot': 60,
            'cache_ttl_warm': 300,
            'max_symbols_per_batch': 50,
            'preferred_batch_size': 25,
            'is_healthy': True,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        # Check if provider already exists
        cursor.execute(
            "SELECT id FROM external_data_providers WHERE name = ?",
            ('yahoo_finance',)
        )
        existing = cursor.fetchone()
        
        if not existing:
            cursor.execute("""
                INSERT INTO external_data_providers (
                    name, display_name, is_active, provider_type, api_key, base_url,
                    rate_limit_per_hour, timeout_seconds, retry_attempts,
                    cache_ttl_hot, cache_ttl_warm, max_symbols_per_batch,
                    preferred_batch_size, is_healthy, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                yahoo_provider_data['name'], yahoo_provider_data['display_name'],
                yahoo_provider_data['is_active'], yahoo_provider_data['provider_type'],
                yahoo_provider_data['api_key'], yahoo_provider_data['base_url'],
                yahoo_provider_data['rate_limit_per_hour'], yahoo_provider_data['timeout_seconds'],
                yahoo_provider_data['retry_attempts'], yahoo_provider_data['cache_ttl_hot'],
                yahoo_provider_data['cache_ttl_warm'], yahoo_provider_data['max_symbols_per_batch'],
                yahoo_provider_data['preferred_batch_size'], yahoo_provider_data['is_healthy'],
                yahoo_provider_data['created_at'], yahoo_provider_data['updated_at']
            ))
            print("✅ Yahoo Finance provider created")
        else:
            print("ℹ️ Yahoo Finance provider already exists")
        
        # Insert default user preferences for user ID 1 (nimrod)
        default_preferences = {
            'user_id': 1,
            'timezone': 'Asia/Jerusalem',
            'refresh_overrides_json': json.dumps({
                'closed': {'weekdays': {'offset_minutes_after_close': 45}},
                'open': {
                    'active': {'in_minutes': 5, 'off_minutes': 60},
                    'no_active': {'in_minutes': 60, 'off_minutes': 60}
                },
                'weekend': {'open': {'daily_hour_ny': 12}}
            }),
            'primary_provider': 'yahoo_finance',
            'secondary_provider': None,
            'primary_currency': 'USD',
            'show_percentage_changes': True,
            'show_volume': True,
            'notify_on_data_failures': True,
            'notify_on_stale_data': False,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        # Check if user preferences already exist
        cursor.execute(
            "SELECT id FROM user_data_preferences WHERE user_id = ?",
            (1,)
        )
        existing_prefs = cursor.fetchone()
        
        if not existing_prefs:
            cursor.execute("""
                INSERT INTO user_data_preferences (
                    user_id, timezone, refresh_overrides_json, primary_provider,
                    secondary_provider, primary_currency, show_percentage_changes,
                    show_volume, notify_on_data_failures, notify_on_stale_data,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                default_preferences['user_id'], default_preferences['timezone'],
                default_preferences['refresh_overrides_json'], default_preferences['primary_provider'],
                default_preferences['secondary_provider'], default_preferences['primary_currency'],
                default_preferences['show_percentage_changes'], default_preferences['show_volume'],
                default_preferences['notify_on_data_failures'], default_preferences['notify_on_stale_data'],
                default_preferences['created_at'], default_preferences['updated_at']
            ))
            print("✅ Default user preferences created for user ID 1")
        else:
            print("ℹ️ User preferences already exist for user ID 1")
        
        # Insert Google Finance provider (inactive for now)
        google_provider_data = {
            'name': 'google_finance',
            'display_name': 'Google Finance',
            'is_active': False,  # Inactive for Stage-1
            'provider_type': 'finance',
            'api_key': None,
            'base_url': 'https://www.google.com/finance',
            'rate_limit_per_hour': 900,
            'timeout_seconds': 20,
            'retry_attempts': 2,
            'cache_ttl_hot': 60,
            'cache_ttl_warm': 300,
            'max_symbols_per_batch': 50,
            'preferred_batch_size': 25,
            'is_healthy': False,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        # Check if Google provider already exists
        cursor.execute(
            "SELECT id FROM external_data_providers WHERE name = ?",
            ('google_finance',)
        )
        existing_google = cursor.fetchone()
        
        if not existing_google:
            cursor.execute("""
                INSERT INTO external_data_providers (
                    name, display_name, is_active, provider_type, api_key, base_url,
                    rate_limit_per_hour, timeout_seconds, retry_attempts,
                    cache_ttl_hot, cache_ttl_warm, max_symbols_per_batch,
                    preferred_batch_size, is_healthy, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                google_provider_data['name'], google_provider_data['display_name'],
                google_provider_data['is_active'], google_provider_data['provider_type'],
                google_provider_data['api_key'], google_provider_data['base_url'],
                google_provider_data['rate_limit_per_hour'], google_provider_data['timeout_seconds'],
                google_provider_data['retry_attempts'], google_provider_data['cache_ttl_hot'],
                google_provider_data['cache_ttl_warm'], google_provider_data['max_symbols_per_batch'],
                google_provider_data['preferred_batch_size'], google_provider_data['is_healthy'],
                google_provider_data['created_at'], google_provider_data['updated_at']
            ))
            print("✅ Google Finance provider created (inactive)")
        else:
            print("ℹ️ Google Finance provider already exists")
        
        conn.commit()
        print("✅ Initial external data configuration completed")
        
    except Exception as e:
        print(f"❌ Error inserting initial data: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


def remove_initial_data():
    """Remove initial external data configuration"""
    if not DB_PATH.exists():
        print(f"❌ Database not found at: {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Remove providers
        cursor.execute("DELETE FROM external_data_providers WHERE name IN (?, ?)", ('yahoo_finance', 'google_finance'))
        print("✅ External data providers removed")
        
        # Remove user preferences
        cursor.execute("DELETE FROM user_data_preferences WHERE user_id = ?", (1,))
        print("✅ User data preferences removed")
        
        conn.commit()
        print("✅ Initial external data configuration removed")
        
    except Exception as e:
        print(f"❌ Error removing initial data: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "down":
        print("🔄 Removing initial external data configuration...")
        remove_initial_data()
    else:
        print("🔄 Inserting initial external data configuration...")
        insert_initial_data()

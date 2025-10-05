"""
Migration: Insert Initial External Data Configuration
Inserts initial configuration for Yahoo Finance and default user preferences
"""

from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, DateTime, Float, Boolean, Text, ForeignKey
from sqlalchemy.dialects.sqlite import BOOLEAN
import os
import sys
import json
from datetime import datetime, timezone

# Add the parent directory to the path so we can import models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.settings import DATABASE_URL

def insert_initial_data():
    """Insert initial external data configuration"""
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
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
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        }
        
        # Check if provider already exists
        existing = conn.execute(
            "SELECT id FROM external_data_providers WHERE name = 'yahoo_finance'"
        ).fetchone()
        
        if not existing:
            conn.execute("""
                INSERT INTO external_data_providers (
                    name, display_name, is_active, provider_type, api_key, base_url,
                    rate_limit_per_hour, timeout_seconds, retry_attempts,
                    cache_ttl_hot, cache_ttl_warm, max_symbols_per_batch,
                    preferred_batch_size, is_healthy, created_at, updated_at
                ) VALUES (
                    :name, :display_name, :is_active, :provider_type, :api_key, :base_url,
                    :rate_limit_per_hour, :timeout_seconds, :retry_attempts,
                    :cache_ttl_hot, :cache_ttl_warm, :max_symbols_per_batch,
                    :preferred_batch_size, :is_healthy, :created_at, :updated_at
                )
            """, yahoo_provider_data)
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
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        }
        
        # Check if user preferences already exist
        existing_prefs = conn.execute(
            "SELECT id FROM user_data_preferences WHERE user_id = 1"
        ).fetchone()
        
        if not existing_prefs:
            conn.execute("""
                INSERT INTO user_data_preferences (
                    user_id, timezone, refresh_overrides_json, primary_provider,
                    secondary_provider, primary_currency, show_percentage_changes,
                    show_volume, notify_on_data_failures, notify_on_stale_data,
                    created_at, updated_at
                ) VALUES (
                    :user_id, :timezone, :refresh_overrides_json, :primary_provider,
                    :secondary_provider, :primary_currency, :show_percentage_changes,
                    :show_volume, :notify_on_data_failures, :notify_on_stale_data,
                    :created_at, :updated_at
                )
            """, default_preferences)
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
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        }
        
        # Check if Google provider already exists
        existing_google = conn.execute(
            "SELECT id FROM external_data_providers WHERE name = 'google_finance'"
        ).fetchone()
        
        if not existing_google:
            conn.execute("""
                INSERT INTO external_data_providers (
                    name, display_name, is_active, provider_type, api_key, base_url,
                    rate_limit_per_hour, timeout_seconds, retry_attempts,
                    cache_ttl_hot, cache_ttl_warm, max_symbols_per_batch,
                    preferred_batch_size, is_healthy, created_at, updated_at
                ) VALUES (
                    :name, :display_name, :is_active, :provider_type, :api_key, :base_url,
                    :rate_limit_per_hour, :timeout_seconds, :retry_attempts,
                    :cache_ttl_hot, :cache_ttl_warm, :max_symbols_per_batch,
                    :preferred_batch_size, :is_healthy, :created_at, :updated_at
                )
            """, google_provider_data)
            print("✅ Google Finance provider created (inactive)")
        else:
            print("ℹ️ Google Finance provider already exists")
        
        conn.commit()
    
    print("✅ Initial external data configuration completed")


def remove_initial_data():
    """Remove initial external data configuration"""
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Remove providers
        conn.execute("DELETE FROM external_data_providers WHERE name IN ('yahoo_finance', 'google_finance')")
        print("✅ External data providers removed")
        
        # Remove user preferences
        conn.execute("DELETE FROM user_data_preferences WHERE user_id = 1")
        print("✅ User data preferences removed")
        
        conn.commit()
    
    print("✅ Initial external data configuration removed")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "down":
        print("🔄 Removing initial external data configuration...")
        remove_initial_data()
    else:
        print("🔄 Inserting initial external data configuration...")
        insert_initial_data()

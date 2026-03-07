# Schema Confirmation Output — Team 20
# DATABASE_URL: localhost:5432/TikTrack-phoenix-db

## tickers (market_data)
  {'column_name': 'id', 'data_type': 'uuid', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'symbol', 'data_type': 'character varying', 'character_maximum_length': 20, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'exchange_id', 'data_type': 'uuid', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'company_name', 'data_type': 'character varying', 'character_maximum_length': 255, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'ticker_type', 'data_type': 'USER-DEFINED', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'sector_id', 'data_type': 'uuid', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'industry_id', 'data_type': 'uuid', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'market_cap_group_id', 'data_type': 'uuid', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'cusip', 'data_type': 'character varying', 'character_maximum_length': 9, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'isin', 'data_type': 'character varying', 'character_maximum_length': 12, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'figi', 'data_type': 'character varying', 'character_maximum_length': 12, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'is_active', 'data_type': 'boolean', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'delisted_date', 'data_type': 'date', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'created_at', 'data_type': 'timestamp with time zone', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'updated_at', 'data_type': 'timestamp with time zone', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'deleted_at', 'data_type': 'timestamp with time zone', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'metadata', 'data_type': 'jsonb', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'status', 'data_type': 'character varying', 'character_maximum_length': 20, 'numeric_precision': None, 'numeric_scale': None}

## user_api_keys
  {'column_name': 'id', 'data_type': 'uuid', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'user_id', 'data_type': 'uuid', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'provider', 'data_type': 'USER-DEFINED', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'provider_label', 'data_type': 'character varying', 'character_maximum_length': 100, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'api_key_encrypted', 'data_type': 'text', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'api_secret_encrypted', 'data_type': 'text', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'additional_config', 'data_type': 'jsonb', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'is_active', 'data_type': 'boolean', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'is_verified', 'data_type': 'boolean', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'last_verified_at', 'data_type': 'timestamp with time zone', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'verification_error', 'data_type': 'text', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'rate_limit_per_minute', 'data_type': 'integer', 'character_maximum_length': None, 'numeric_precision': 32, 'numeric_scale': 0}
  {'column_name': 'rate_limit_per_day', 'data_type': 'integer', 'character_maximum_length': None, 'numeric_precision': 32, 'numeric_scale': 0}
  {'column_name': 'quota_used_today', 'data_type': 'integer', 'character_maximum_length': None, 'numeric_precision': 32, 'numeric_scale': 0}
  {'column_name': 'quota_reset_at', 'data_type': 'timestamp with time zone', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'created_by', 'data_type': 'uuid', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'updated_by', 'data_type': 'uuid', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'created_at', 'data_type': 'timestamp with time zone', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'updated_at', 'data_type': 'timestamp with time zone', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'deleted_at', 'data_type': 'timestamp with time zone', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'version', 'data_type': 'integer', 'character_maximum_length': None, 'numeric_precision': 32, 'numeric_scale': 0}
  {'column_name': 'metadata', 'data_type': 'jsonb', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}

## user_refresh_tokens
  {'column_name': 'id', 'data_type': 'uuid', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'user_id', 'data_type': 'uuid', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'token_hash', 'data_type': 'character varying', 'character_maximum_length': 255, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'jti', 'data_type': 'character varying', 'character_maximum_length': 255, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'expires_at', 'data_type': 'timestamp with time zone', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'revoked_at', 'data_type': 'timestamp with time zone', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'created_at', 'data_type': 'timestamp with time zone', 'character_maximum_length': None, 'numeric_precision': None, 'numeric_scale': None}

## revoked_tokens
  {'column_name': 'jti', 'data_type': 'character varying'}
  {'column_name': 'expires_at', 'data_type': 'timestamp with time zone'}
  {'column_name': 'revoked_at', 'data_type': 'timestamp with time zone'}

## trading_account_fees
  {'column_name': 'id', 'data_type': 'uuid'}
  {'column_name': 'user_id', 'data_type': 'uuid'}
  {'column_name': 'trading_account_id', 'data_type': 'uuid'}
  {'column_name': 'commission_type', 'data_type': 'USER-DEFINED'}
  {'column_name': 'commission_value', 'data_type': 'numeric'}
  {'column_name': 'minimum', 'data_type': 'numeric'}
  {'column_name': 'created_at', 'data_type': 'timestamp with time zone'}
  {'column_name': 'updated_at', 'data_type': 'timestamp with time zone'}
  {'column_name': 'deleted_at', 'data_type': 'timestamp with time zone'}

## exchange_rates
  {'column_name': 'id', 'data_type': 'uuid', 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'from_currency', 'data_type': 'character varying', 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'to_currency', 'data_type': 'character varying', 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'conversion_rate', 'data_type': 'numeric', 'numeric_precision': 20, 'numeric_scale': 8}
  {'column_name': 'last_sync_time', 'data_type': 'timestamp with time zone', 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'created_at', 'data_type': 'timestamp with time zone', 'numeric_precision': None, 'numeric_scale': None}
  {'column_name': 'updated_at', 'data_type': 'timestamp with time zone', 'numeric_precision': None, 'numeric_scale': None}

## ticker_prices (price, market_cap)
  {'column_name': 'price', 'data_type': 'numeric', 'numeric_precision': 20, 'numeric_scale': 8}
  {'column_name': 'market_cap', 'data_type': 'numeric', 'numeric_precision': 24, 'numeric_scale': 4}

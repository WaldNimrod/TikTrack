"""
Scheduler Registry — CANONICAL JOB REGISTRY (Iron Rule)
ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION §2.2

All jobs MUST be registered here. No job exists outside this file.
"""

JOB_REGISTRY = [
    {
        "job_name": "sync_ticker_prices_intraday",
        "module": "api.background.jobs.sync_intraday",
        "function": "run",
        "trigger": "interval",
        "minutes": "from_settings:INTRADAY_INTERVAL_MINUTES",
        "runtime_class": "TARGET_RUNTIME",
        "enabled_default": True,
        "description": "Syncs intraday price data for active tickers",
    },
    {
        "job_name": "sync_exchange_rates_eod",
        "module": "api.background.jobs.sync_exchange_rates_eod",
        "function": "run",
        "trigger": "interval",
        "minutes": 1440,
        "runtime_class": "TARGET_RUNTIME",
        "enabled_default": True,
        "description": "EOD sync of exchange rates (Alpha→Yahoo); updates last_sync_time for /reference/exchange-rates (BF-004)",
    },
    {
        "job_name": "check_alert_conditions",
        "module": "api.background.jobs.check_alert_conditions",
        "function": "run",
        "trigger": "interval",
        "minutes": "from_settings:INTRADAY_INTERVAL_MINUTES",
        "run_after": "sync_ticker_prices_intraday",
        "runtime_class": "TARGET_RUNTIME",
        "enabled_default": True,
        "description": "Evaluates alert conditions against latest market data",
    },
]

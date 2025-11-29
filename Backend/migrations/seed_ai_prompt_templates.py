#!/usr/bin/env python3
"""
Migration: Seed AI Prompt Templates
Date: 2025-01-28
Version: 1.0.0

Seeds initial AI prompt templates for the AI Analysis system.
Includes 4 templates:
1. Equity Research Analysis
2. Technical Analysis Deep Dive
3. Trade Performance & Portfolio Analysis
4. Risk & Conditions Analysis
"""

import os
import sys
import json
from datetime import datetime
from pathlib import Path

# Add Backend directory to path
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy import text
from sqlalchemy.orm import Session
from config.database import SessionLocal, engine
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Template 1: Equity Research Analysis
EQUITY_RESEARCH_TEMPLATE = {
    "name": "Equity Research Analysis",
    "name_he": "ניתוח מחקר הון",
    "description": "Comprehensive equity analysis with fundamental and macroeconomic perspectives",
    "prompt_text": """Act as an elite equity research analyst at a top-tier investment firm or hedge fund. You were top in your class and your analysis is always top notch. You need to analyze a company using both fundamental and macroeconomic perspectives. Structure your response according to the framework below.

Stock Ticker / Company Name: {stock_ticker}
Investment Thesis: {investment_thesis}
Goal: {goal}

Use the following structure to deliver a clear, well-reasoned equity research report:

1. Fundamental Analysis
2. Analyze revenue growth, gross & net margin trends, free cash flow
3. Compare valuation metrics vs sector peers (P/E, EV/EBITDA, etc.)
4. Review insider ownership and recent insider trades
5. Thesis Validation
6. Present 3 arguments supporting the thesis
7. Highlight 2 counter-arguments or key risks
8. Provide a final verdict: Bullish / Bearish / Neutral with justification
9. Sector & Macro View
10. Give a short sector overview
11. Outline relevant macroeconomic trends
12. Explain company's competitive positioning
13. Catalyst Watch
14. List upcoming events (earnings, product launches, regulation, etc.)
15. Identify both short-term and long-term catalysts
16. Investment Summary
17. 5-bullet investment thesis summary
18. Final recommendation: Buy / Hold / Sell
19. Confidence level (High / Medium / Low)
20. Expected timeframe (e.g. 6–12 months)

Build the report this way:
- Use markdown
- Use bullet points where appropriate
- Be concise, professional, and insight-driven
- Do not explain your process just deliver the analysis""",
    "variables_json": json.dumps({
        "variables": [
            {
                "key": "stock_ticker",
                "label": "Stock Ticker / Company Name",
                "type": "text",
                "required": False,
                "placeholder": "Add name if you want specific analysis",
                "default_value": None
            },
            {
                "key": "investment_thesis",
                "label": "Investment Thesis",
                "type": "textarea",
                "required": False,
                "placeholder": "Add input here",
                "default_value": None
            },
            {
                "key": "goal",
                "label": "Goal",
                "type": "textarea",
                "required": False,
                "placeholder": "Add the goal here",
                "default_value": None
            }
        ]
    }, ensure_ascii=False),
    "is_active": True,
    "sort_order": 1
}

# Template 2: Technical Analysis Deep Dive
TECHNICAL_ANALYSIS_TEMPLATE = {
    "name": "Technical Analysis Deep Dive",
    "name_he": "ניתוח טכני מעמיק",
    "description": "Comprehensive technical analysis with chart patterns and indicators",
    "prompt_text": """Act as an elite technical analyst with decades of experience in chart pattern recognition and technical indicator analysis. You specialize in identifying high-probability trading setups using advanced technical analysis. Analyze the stock using comprehensive technical methods and structure your response according to the framework below.

Stock Ticker / Company Name: {stock_ticker}
Time Frame: {time_frame}
Technical Indicators: {technical_indicators}
Chart Pattern Focus: {chart_pattern_focus}
Investment Type: {investment_type}

Use the following structure to deliver a clear, well-reasoned technical analysis:

1. Price Action Analysis
- Current price position vs key levels
- Recent price movements and momentum
- Volume analysis and confirmation signals

2. Technical Indicators Review
- RSI analysis (overbought/oversold conditions)
- MACD signals and crossovers
- Moving averages alignment (50, 100, 200 day)
- Bollinger Bands position and volatility

3. Chart Pattern Identification
- Identify current chart patterns
- Pattern completion probability
- Measured move targets if pattern completes

4. Support & Resistance Analysis
- Key support levels (with strength rating)
- Key resistance levels (with strength rating)
- Breakout/breakdown scenarios

5. Trading Setup Assessment
- Entry signals and triggers
- Stop-loss recommendations
- Take-profit targets (multiple levels)
- Risk/reward ratio calculation

6. Technical Summary
- Overall technical bias: Bullish / Bearish / Neutral
- Confidence level (High / Medium / Low)
- Expected price movement timeframe
- Key levels to watch

Build the report this way:
- Use markdown
- Use bullet points where appropriate
- Include specific price levels and percentages
- Be concise, professional, and insight-driven
- Do not explain your process just deliver the analysis""",
    "variables_json": json.dumps({
        "variables": [
            {
                "key": "stock_ticker",
                "label": "Stock Ticker / Company Name",
                "type": "text",
                "required": False,
                "placeholder": "Add name if you want specific analysis",
                "default_value": None
            },
            {
                "key": "time_frame",
                "label": "Time Frame",
                "type": "select",
                "required": False,
                "options": ["1 day", "1 week", "1 month", "3 months", "1 year"],
                "default_value": "1 month"
            },
            {
                "key": "technical_indicators",
                "label": "Technical Indicators",
                "type": "text",
                "required": False,
                "placeholder": "Select from Trading Methods (RSI, MACD, Moving Averages, etc.)",
                "default_value": None
            },
            {
                "key": "chart_pattern_focus",
                "label": "Chart Pattern Focus",
                "type": "select",
                "required": False,
                "options": ["Head & Shoulders", "Triangles", "Flags", "Support/Resistance", "Trend Lines"],
                "default_value": None
            },
            {
                "key": "investment_type",
                "label": "Investment Type",
                "type": "select",
                "required": False,
                "options": ["swing", "investment", "passive", "day_trading", "scalping"],
                "default_value": None
            }
        ]
    }, ensure_ascii=False),
    "is_active": True,
    "sort_order": 2
}

# Template 3: Trade Performance & Portfolio Analysis
TRADE_PERFORMANCE_TEMPLATE = {
    "name": "Trade Performance & Portfolio Analysis",
    "name_he": "ניתוח ביצועים ופורטפוליו",
    "description": "Analysis of trading performance and portfolio optimization",
    "prompt_text": """Act as a senior portfolio analyst at a top-tier trading firm. You excel at analyzing trading performance, identifying patterns in execution, and providing actionable recommendations for portfolio optimization. Analyze the trading data and structure your response according to the framework below.

Ticker Symbol: {ticker_symbol}
Date Range: {date_range}
Analysis Focus: {analysis_focus}
Investment Type Filter: {investment_type_filter}
Trading Account: {trading_account}

Use the following structure to deliver a clear, well-reasoned performance analysis:

1. Performance Overview
- Total P&L for the period
- Win rate and average win/loss ratio
- Best and worst performing trades
- ROI and Sharpe ratio if applicable

2. Trade Pattern Analysis
- Most profitable entry strategies
- Exit timing effectiveness
- Holding period analysis
- Correlation with market conditions

3. Risk Assessment
- Maximum drawdown period
- Risk per trade analysis
- Position sizing effectiveness
- Volatility impact on performance

4. Execution Quality Review
- Entry price vs intended price analysis
- Slippage assessment
- Timing of entries/exits
- Comparison to market benchmarks

5. Portfolio Optimization Recommendations
- Suggested position sizing adjustments
- Entry/exit strategy improvements
- Risk management enhancements
- Diversification suggestions

6. Action Plan
- 5-bullet summary of key findings
- Top 3 actionable recommendations
- Priority level for each recommendation
- Expected impact of implementing changes

Build the report this way:
- Use markdown
- Use bullet points where appropriate
- Include specific numbers and percentages
- Be concise, professional, and insight-driven
- Do not explain your process just deliver the analysis""",
    "variables_json": json.dumps({
        "variables": [
            {
                "key": "ticker_symbol",
                "label": "Ticker Symbol",
                "type": "text",
                "required": False,
                "placeholder": "Stock ticker to analyze",
                "default_value": None
            },
            {
                "key": "date_range",
                "label": "Date Range",
                "type": "text",
                "required": False,
                "placeholder": "Start date - End date",
                "default_value": None
            },
            {
                "key": "analysis_focus",
                "label": "Analysis Focus",
                "type": "select",
                "required": False,
                "options": ["Performance Review", "Risk Assessment", "Optimization Recommendations"],
                "default_value": "Performance Review"
            },
            {
                "key": "investment_type_filter",
                "label": "Investment Type Filter",
                "type": "select",
                "required": False,
                "options": ["swing", "investment", "passive", "day_trading", "scalping"],
                "default_value": None
            },
            {
                "key": "trading_account",
                "label": "Trading Account",
                "type": "text",
                "required": False,
                "placeholder": "Optional - filter by trading account",
                "default_value": None
            }
        ]
    }, ensure_ascii=False),
    "is_active": True,
    "sort_order": 3
}

# Template 4: Risk & Conditions Analysis
RISK_CONDITIONS_TEMPLATE = {
    "name": "Risk & Conditions Analysis",
    "name_he": "ניתוח סיכונים ותנאים",
    "description": "Analysis of risk profile and condition effectiveness",
    "prompt_text": """Act as a risk management specialist with expertise in trading conditions and alert systems. Analyze the risk profile and condition effectiveness for a specific trading strategy. Structure your response according to the framework below.

Ticker Symbol: {ticker_symbol}
Trade Plan ID: {trade_plan_id}
Trade ID: {trade_id}
Condition Focus: {condition_focus}
Investment Type: {investment_type}

Use the following structure to deliver a clear, well-reasoned risk analysis:

1. Condition Effectiveness Analysis
- Success rate of conditions
- False positive/negative rates
- Condition trigger timing
- Alert generation effectiveness

2. Risk Profile Assessment
- Risk per condition type
- Correlation between conditions
- Risk concentration analysis
- Diversification effectiveness

3. Optimization Recommendations
- Suggested condition adjustments
- Parameter tuning recommendations
- Alert threshold optimizations
- Risk management improvements

4. Action Plan
- 5-bullet summary
- Top 3 recommendations
- Implementation priority

Build the report this way:
- Use markdown
- Use bullet points where appropriate
- Include specific numbers and percentages
- Be concise, professional, and insight-driven
- Do not explain your process just deliver the analysis""",
    "variables_json": json.dumps({
        "variables": [
            {
                "key": "ticker_symbol",
                "label": "Ticker Symbol",
                "type": "text",
                "required": False,
                "placeholder": "Stock ticker to analyze",
                "default_value": None
            },
            {
                "key": "trade_plan_id",
                "label": "Trade Plan ID",
                "type": "number",
                "required": False,
                "placeholder": "Optional - analyze plan conditions",
                "default_value": None
            },
            {
                "key": "trade_id",
                "label": "Trade ID",
                "type": "number",
                "required": False,
                "placeholder": "Optional - analyze trade conditions",
                "default_value": None
            },
            {
                "key": "condition_focus",
                "label": "Condition Focus",
                "type": "text",
                "required": False,
                "placeholder": "Select from Trading Methods",
                "default_value": None
            },
            {
                "key": "investment_type",
                "label": "Investment Type",
                "type": "select",
                "required": False,
                "options": ["swing", "investment", "passive", "day_trading", "scalping"],
                "default_value": None
            }
        ]
    }, ensure_ascii=False),
    "is_active": True,
    "sort_order": 4
}

TEMPLATES = [
    EQUITY_RESEARCH_TEMPLATE,
    TECHNICAL_ANALYSIS_TEMPLATE,
    TRADE_PERFORMANCE_TEMPLATE,
    RISK_CONDITIONS_TEMPLATE
]


def seed_templates(db: Session):
    """Seed AI prompt templates"""
    logger.info("🚀 Starting AI prompt templates seeding...")
    
    for template in TEMPLATES:
        # Check if template already exists
        result = db.execute(
            text("SELECT id FROM ai_prompt_templates WHERE name = :name"),
            {"name": template["name"]}
        ).fetchone()
        
        if result:
            logger.info(f"⏭️  Template '{template['name']}' already exists, skipping...")
            continue
        
        # Insert template
        db.execute(
            text("""
                INSERT INTO ai_prompt_templates 
                (name, name_he, description, prompt_text, variables_json, is_active, sort_order)
                VALUES (:name, :name_he, :description, :prompt_text, :variables_json, :is_active, :sort_order)
            """),
            template
        )
        logger.info(f"✅ Created template: {template['name']}")
    
    db.commit()
    logger.info("🎉 AI prompt templates seeding completed successfully!")


def main():
    """Run seeding"""
    db: Session = SessionLocal()
    
    try:
        seed_templates(db)
        logger.info("🎉 Seeding completed successfully!")
    except Exception as e:
        logger.error(f"❌ Seeding failed: {e}", exc_info=True)
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()


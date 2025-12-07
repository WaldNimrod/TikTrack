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
                "label": "טיקר",
                "type": "select",
                "required": False,
                "placeholder": "בחר טיקר...",
                "default_value": None,
                "options": [],
                "integration": "tickers"
            },
            {
                "key": "investment_thesis",
                "label": "סיבת השקעה",
                "type": "select",
                "required": False,
                "placeholder": "בחר סיבה...",
                "default_value": None,
                "options": [],
                "integration": "reasons"
            },
            {
                "key": "goal",
                "label": "מטרה",
                "type": "select",
                "required": False,
                "placeholder": "בחר מטרה...",
                "default_value": None,
                "options": [
                    {"value": "long_term_investment", "label": "השקעה ארוכת טווח - בניית פורטפוליו יציב"},
                    {"value": "short_term_trading", "label": "מסחר קצר טווח - רווחים מהירים"},
                    {"value": "sector_analysis", "label": "ניתוח סקטור - הבנת תעשייה ספציפית"},
                    {"value": "valuation_check", "label": "בדיקת הערכה - האם המניה מוערכת נכון"},
                    {"value": "risk_assessment", "label": "הערכת סיכונים - זיהוי סיכונים פוטנציאליים"},
                    {"value": "entry_timing", "label": "תזמון כניסה - מתי הזמן הנכון לקנות"},
                    {"value": "exit_strategy", "label": "אסטרטגיית יציאה - מתי למכור"},
                    {"value": "portfolio_diversification", "label": "גיוון פורטפוליו - הוספת מניה לפורטפוליו"},
                    {"value": "competitive_analysis", "label": "ניתוח תחרותי - השוואה למתחרים"},
                    {"value": "fundamental_review", "label": "סקירה פונדמנטלית - בדיקת יסודות החברה"}
                ]
            },
            {
                "key": "response_language",
                "label": "שפת המשוב",
                "type": "select",
                "required": False,
                "placeholder": "בחר שפה...",
                "default_value": "hebrew",
                "options": [
                    {"value": "hebrew", "label": "עברית"},
                    {"value": "english", "label": "אנגלית"}
                ]
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
    "prompt_text": """Act as an elite technical analyst with decades of experience in chart pattern recognition and technical indicator analysis. You specialize in identifying high-probability trading setups using advanced technical analysis. Analyze the stock using comprehensive technical methods, and when historical trading data is provided, use it to validate technical patterns and improve your analysis accuracy. Structure your response according to the framework below.

Analysis Parameters:
Stock Ticker / Company Name: {stock_ticker}
Time Frame: {time_frame}
Technical Indicators: {technical_indicators}
Chart Pattern Focus: {chart_pattern_focus}
Investment Type: {investment_type}

=== HISTORICAL TRADING DATA ===
{trade_data_structured}

IMPORTANT: If trading data is provided above, use it to:
- Validate technical patterns with actual entry/exit points
- Compare predicted support/resistance levels with actual price action
- Assess how technical indicators aligned with actual trade outcomes
- Identify which technical setups were most successful historically

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
                "label": "טיקר",
                "type": "text",
                "required": False,
                "placeholder": "הזן טיקר לניתוח ספציפי",
                "default_value": None
            },
            {
                "key": "time_frame",
                "label": "מסגרת זמן",
                "type": "select",
                "required": False,
                "options": [
                    {"value": "1 day", "label": "יום אחד"},
                    {"value": "1 week", "label": "שבוע אחד"},
                    {"value": "1 month", "label": "חודש אחד"},
                    {"value": "3 months", "label": "3 חודשים"},
                    {"value": "1 year", "label": "שנה אחת"}
                ],
                "default_value": "1 month"
            },
            {
                "key": "technical_indicators",
                "label": "אינדיקטורים טכניים",
                "type": "select",
                "required": False,
                "placeholder": "בחר אינדיקטורים טכניים...",
                "default_value": None,
                "options": [],
                "integration": "trading_methods"
            },
            {
                "key": "chart_pattern_focus",
                "label": "מיקוד תבניות גרף",
                "type": "select",
                "required": False,
                "options": [
                    {"value": "Head & Shoulders", "label": "ראש וכתפיים"},
                    {"value": "Triangles", "label": "משולשים"},
                    {"value": "Flags", "label": "דגלים"},
                    {"value": "Support/Resistance", "label": "תמיכה/התנגדות"},
                    {"value": "Trend Lines", "label": "קווי מגמה"}
                ],
                "default_value": None
            },
            {
                "key": "investment_type",
                "label": "סוג השקעה",
                "type": "select",
                "required": False,
                "options": [
                    {"value": "swing", "label": "סווינג"},
                    {"value": "investment", "label": "השקעה"},
                    {"value": "passive", "label": "פאסיבי"},
                    {"value": "day_trading", "label": "מסחר יומי"},
                    {"value": "scalping", "label": "סקלפינג"}
                ],
                "default_value": None
            },
            {
                "key": "date_range",
                "label": "טווח תאריכים",
                "type": "date-range",
                "required": False,
                "placeholder": "",
                "default_value": None
            },
            {
                "key": "trading_account",
                "label": "חשבון מסחר",
                "type": "select",
                "required": False,
                "placeholder": "בחר חשבון מסחר...",
                "default_value": None,
                "options": [],
                "integration": "trading_accounts"
            },
            {
                "key": "response_language",
                "label": "שפת המשוב",
                "type": "select",
                "required": False,
                "placeholder": "בחר שפה...",
                "default_value": "hebrew",
                "options": [
                    {"value": "hebrew", "label": "עברית"},
                    {"value": "english", "label": "אנגלית"}
                ]
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
    "prompt_text": """Act as a senior portfolio analyst at a top-tier trading firm. You excel at analyzing trading performance, identifying patterns in execution, and providing actionable recommendations for portfolio optimization. Analyze the trading data provided below and structure your response according to the framework.

Analysis Parameters:
Ticker Symbol: {ticker_symbol}
Date Range: {date_range}
Analysis Focus: {analysis_focus}
Investment Type Filter: {investment_type_filter}

=== TRADING DATA ===
{trade_data_structured}

IMPORTANT: Use the actual trading data provided above to calculate real metrics and provide specific insights. The data includes actual executions, positions, and performance.

Use the following structure to deliver a clear, well-reasoned performance analysis:

1. Performance Overview
- Total P&L for the period (calculate from actual data)
- Win rate and average win/loss ratio (based on actual trades)
- Best and worst performing trades (with specific IDs and details)
- ROI and Sharpe ratio if applicable (calculated from data)

2. Trade Pattern Analysis
- Most profitable entry strategies (analyze actual execution patterns)
- Exit timing effectiveness (analyze actual exit points vs targets)
- Holding period analysis (calculate from actual trade dates)
- Correlation with market conditions

3. Risk Assessment
- Maximum drawdown period (from actual P&L data)
- Risk per trade analysis (actual position sizes and stops)
- Position sizing effectiveness (compare planned vs actual)
- Volatility impact on performance

4. Execution Quality Review
- Entry price vs intended price analysis (compare planned vs actual)
- Slippage assessment (actual vs planned execution prices)
- Timing of entries/exits (analyze execution timing)
- Comparison to market benchmarks

5. Trade Plan vs Execution Analysis
- Compare original trade plan targets vs actual results
- Analyze condition effectiveness (which conditions triggered)
- Assess reasons and thesis validity

6. Portfolio Optimization Recommendations
- Suggested position sizing adjustments (based on actual performance)
- Entry/exit strategy improvements (learned from actual trades)
- Risk management enhancements (based on actual drawdowns)
- Diversification suggestions

7. Action Plan
- 5-bullet summary of key findings
- Top 3 actionable recommendations
- Priority level for each recommendation
- Expected impact of implementing changes

Build the report this way:
- Use markdown
- Use bullet points where appropriate
- Include specific numbers and percentages from actual data
- Reference specific trade IDs when relevant
- Be concise, professional, and insight-driven
- Do not explain your process just deliver the analysis""",
    "variables_json": json.dumps({
        "variables": [
            {
                "key": "ticker_symbol",
                "label": "טיקר",
                "type": "text",
                "required": False,
                "placeholder": "הזן טיקר לניתוח",
                "default_value": None
            },
            {
                "key": "date_range",
                "label": "טווח תאריכים",
                "type": "date-range",
                "required": False,
                "placeholder": "",
                "default_value": None
            },
            {
                "key": "analysis_focus",
                "label": "מיקוד ניתוח",
                "type": "select",
                "required": False,
                "options": [
                    {"value": "Performance Review", "label": "סקירת ביצועים"},
                    {"value": "Risk Assessment", "label": "הערכת סיכונים"},
                    {"value": "Optimization Recommendations", "label": "המלצות אופטימיזציה"}
                ],
                "default_value": "Performance Review"
            },
            {
                "key": "investment_type_filter",
                "label": "סינון סוג השקעה",
                "type": "select",
                "required": False,
                "options": [
                    {"value": "swing", "label": "סווינג"},
                    {"value": "investment", "label": "השקעה"},
                    {"value": "passive", "label": "פאסיבי"},
                    {"value": "day_trading", "label": "מסחר יומי"},
                    {"value": "scalping", "label": "סקלפינג"}
                ],
                "default_value": None
            },
            {
                "key": "trading_account",
                "label": "חשבון מסחר",
                "type": "select",
                "required": False,
                "placeholder": "בחר חשבון מסחר...",
                "default_value": None,
                "options": [],
                "integration": "trading_accounts"
            },
            {
                "key": "trade_selection_type",
                "label": "סוג בחירת טריידים",
                "type": "select",
                "required": False,
                "options": [
                    {"value": "all", "label": "כל הטריידים"},
                    {"value": "single", "label": "טרייד בודד"},
                    {"value": "multiple", "label": "קבוצת טריידים"},
                    {"value": "filtered", "label": "טריידים מסוננים"}
                ],
                "default_value": "all"
            },
            {
                "key": "single_trade_id",
                "label": "מזהה טרייד (לטרייד בודד)",
                "type": "number",
                "required": False,
                "placeholder": "הזן ID של טרייד ספציפי",
                "default_value": None,
                "conditional_display": {
                    "depends_on": "trade_selection_type",
                    "show_when": "single"
                }
            },
            {
                "key": "analysis_topics",
                "label": "נושאי ניתוח",
                "type": "select",
                "required": False,
                "placeholder": "בחר נושאי ניתוח...",
                "default_value": None,
                "options": [
                    {"value": "performance", "label": "סקירת ביצועים"},
                    {"value": "risk", "label": "הערכת סיכונים"},
                    {"value": "execution", "label": "איכות ביצוע"},
                    {"value": "optimization", "label": "המלצות אופטימיזציה"},
                    {"value": "patterns", "label": "תבניות מסחר"},
                    {"value": "correlation", "label": "קורלציה לשוק"}
                ]
            },
            {
                "key": "response_language",
                "label": "שפת המשוב",
                "type": "select",
                "required": False,
                "placeholder": "בחר שפה...",
                "default_value": "hebrew",
                "options": [
                    {"value": "hebrew", "label": "עברית"},
                    {"value": "english", "label": "אנגלית"}
                ]
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
    "prompt_text": """Act as a risk management specialist with expertise in trading conditions and alert systems. Analyze the risk profile and condition effectiveness for a specific trading strategy. When trading data is provided below, use it to analyze actual condition performance and compare planned conditions with execution results. Structure your response according to the framework below.

Analysis Parameters:
Ticker Symbol: {ticker_symbol}
Trade Plan ID: {trade_plan_id}
Trade ID: {trade_id}
Condition Focus: {condition_focus}
Investment Type: {investment_type}

=== TRADING DATA (TRADE PLANS & CONDITIONS) ===
{trade_data_structured}

IMPORTANT: If trading data is provided above, use it to:
- Analyze actual condition trigger rates and timing
- Compare planned conditions (from Trade Plans) with actual trade outcomes
- Assess condition effectiveness: which conditions led to profitable trades vs losses
- Identify false positives/negatives in condition triggers
- Evaluate risk per condition type based on actual performance

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
                "label": "טיקר",
                "type": "text",
                "required": False,
                "placeholder": "הזן סמל טיקר לניתוח",
                "default_value": None
            },
            {
                "key": "trade_plan_id",
                "label": "מזהה תוכנית מסחר",
                "type": "number",
                "required": False,
                "placeholder": "אופציונלי - ניתוח תנאי תוכנית",
                "default_value": None
            },
            {
                "key": "trade_id",
                "label": "מזהה טרייד",
                "type": "number",
                "required": False,
                "placeholder": "אופציונלי - ניתוח תנאי טרייד",
                "default_value": None
            },
            {
                "key": "condition_focus",
                "label": "מיקוד תנאים",
                "type": "select",
                "required": False,
                "placeholder": "בחר שיטת מסחר...",
                "default_value": None,
                "options": [],
                "integration": "trading_methods"
            },
            {
                "key": "investment_type",
                "label": "סוג השקעה",
                "type": "select",
                "required": False,
                "options": [
                    {"value": "swing", "label": "סווינג"},
                    {"value": "investment", "label": "השקעה"},
                    {"value": "passive", "label": "פאסיבי"},
                    {"value": "day_trading", "label": "מסחר יומי"},
                    {"value": "scalping", "label": "סקלפינג"}
                ],
                "default_value": None
            },
            {
                "key": "trading_account",
                "label": "חשבון מסחר",
                "type": "select",
                "required": False,
                "placeholder": "בחר חשבון מסחר...",
                "default_value": None,
                "options": [],
                "integration": "trading_accounts"
            },
            {
                "key": "date_range",
                "label": "טווח תאריכים",
                "type": "date-range",
                "required": False,
                "placeholder": "",
                "default_value": None
            },
            {
                "key": "response_language",
                "label": "שפת המשוב",
                "type": "select",
                "required": False,
                "placeholder": "בחר שפה...",
                "default_value": "hebrew",
                "options": [
                    {"value": "hebrew", "label": "עברית"},
                    {"value": "english", "label": "אנגלית"}
                ]
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


def seed_templates(db: Session, update_existing: bool = True):
    """Seed AI prompt templates
    
    Args:
        db: Database session
        update_existing: If True, update existing templates instead of skipping
    """
    logger.info("🚀 Starting AI prompt templates seeding...")
    
    for template in TEMPLATES:
        # Check if template already exists
        result = db.execute(
            text("SELECT id FROM ai_prompt_templates WHERE name = :name"),
            {"name": template["name"]}
        ).fetchone()
        
        if result:
            if update_existing:
                # Update existing template
                db.execute(
                    text("""
                        UPDATE ai_prompt_templates 
                        SET name_he = :name_he,
                            description = :description,
                            prompt_text = :prompt_text,
                            variables_json = :variables_json,
                            is_active = :is_active,
                            sort_order = :sort_order
                        WHERE name = :name
                    """),
                    template
                )
                logger.info(f"🔄 Updated template: {template['name']}")
            else:
                logger.info(f"⏭️  Template '{template['name']}' already exists, skipping...")
                continue
        else:
            # Insert new template
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


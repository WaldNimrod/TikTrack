#!/usr/bin/env python3
"""
Re-analyze Hebrew responses excluding financial terms, company names, and tickers
"""

import sys
import re
from pathlib import Path

# Common financial terms in English (should be excluded from Hebrew count)
FINANCIAL_TERMS = {
    'revenue', 'growth', 'margin', 'analysis', 'recommendation', 'buy', 'sell', 'hold',
    'high', 'medium', 'low', 'bullish', 'bearish', 'neutral', 'fundamental', 'technical',
    'valuation', 'risk', 'return', 'investment', 'portfolio', 'sector', 'market', 'company',
    'stock', 'price', 'earnings', 'cash flow', 'free cash flow', 'p/e', 'ev/ebitda',
    'fcf', 'pe', 'ebitda', 'eps', 'roe', 'roa', 'dividend', 'yield', 'beta', 'alpha',
    'volatility', 'liquidity', 'leverage', 'equity', 'debt', 'assets', 'liabilities',
    'balance sheet', 'income statement', 'cash flow statement', 'financial statements',
    'quarterly', 'annual', 'guidance', 'forecast', 'outlook', 'catalyst', 'event',
    'earnings call', 'conference call', 'analyst', 'rating', 'target price', 'consensus',
    'institutional', 'retail', 'volume', 'trading', 'exchange', 'listing', 'ipo',
    'merger', 'acquisition', 'spin-off', 'split', 'reverse split', 'dividend yield',
    'payout ratio', 'retention ratio', 'book value', 'market cap', 'enterprise value',
    'working capital', 'current ratio', 'quick ratio', 'debt to equity', 'interest coverage',
    'operating margin', 'net margin', 'gross margin', 'ebitda margin', 'profit margin',
    'revenue growth', 'earnings growth', 'eps growth', 'fcf growth', 'organic growth',
    'acquisition growth', 'same store sales', 'comparable sales', 'same store growth',
    'guidance', 'beat', 'miss', 'in line', 'surprise', 'revision', 'upgrade', 'downgrade',
    'initiate', 'coverage', 'outperform', 'underperform', 'market perform', 'sector perform',
    'strong buy', 'moderate buy', 'hold', 'moderate sell', 'strong sell', 'accumulate',
    'reduce', 'neutral', 'positive', 'negative', 'cautious', 'optimistic', 'pessimistic',
    'bullish', 'bearish', 'mixed', 'uncertain', 'volatile', 'stable', 'trending', 'range bound'
}

# Common company name patterns (ticker symbols, company names)
COMPANY_PATTERNS = [
    r'\b[A-Z]{1,5}\b',  # Ticker symbols (1-5 uppercase letters)
    r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(Inc|Corp|Ltd|LLC|Co|Company|Technologies|Systems|Group|Holdings)\b',  # Company names
    r'\bApple|Microsoft|Google|Amazon|Meta|Tesla|NVIDIA|AMD|Intel|IBM|Oracle|Salesforce|Adobe|Netflix|Disney|Coca-Cola|Pepsi|Walmart|Target|Home Depot|Lowe\'s|McDonald\'s|Starbucks|Nike|Adidas|Visa|Mastercard|PayPal|Square|Shopify|Zoom|Slack|Dropbox|Box|Atlassian|ServiceNow|Workday|Splunk|Okta|CrowdStrike|Zscaler|Palo Alto|Fortinet|Check Point|CyberArk|Varonis|SailPoint|BeyondTrust|Rapid7|Qualys|Tenable|F5|Akamai|Cloudflare|Fastly|Datadog|New Relic|Dynatrace|AppDynamics|Elastic|MongoDB|Snowflake|Databricks|Confluent|Kafka|Redis|PostgreSQL|MySQL|MariaDB|Oracle DB|SQL Server|DB2|Cassandra|DynamoDB|Couchbase|Neo4j|ArangoDB|InfluxDB|TimescaleDB|ClickHouse|Druid|Pinot|Kylin|Hive|Impala|Presto|Trino|Spark|Flink|Storm|Samza|Kafka Streams|Kafka Connect|Kafka MirrorMaker|Kafka Schema Registry|Kafka REST Proxy|Kafka Admin|Kafka Consumer|Kafka Producer|Kafka Broker|Kafka Cluster|Kafka Topic|Kafka Partition|Kafka Offset|Kafka Consumer Group|Kafka Replication|Kafka Leader|Kafka Follower|Kafka ISR|Kafka Controller|Kafka Zookeeper|Kafka KRaft|Kafka Connect|Kafka Streams|Kafka MirrorMaker|Kafka Schema Registry|Kafka REST Proxy|Kafka Admin|Kafka Consumer|Kafka Producer|Kafka Broker|Kafka Cluster|Kafka Topic|Kafka Partition|Kafka Offset|Kafka Consumer Group|Kafka Replication|Kafka Leader|Kafka Follower|Kafka ISR|Kafka Controller|Kafka Zookeeper|Kafka KRaft\b'
]

def is_hebrew_char(char: str) -> bool:
    """Check if character is Hebrew"""
    return '\u0590' <= char <= '\u05FF'

def is_financial_term(word: str) -> bool:
    """Check if word is a financial term"""
    word_lower = word.lower().strip('.,;:!?()[]{}"\'-')
    return word_lower in FINANCIAL_TERMS

def is_company_name(word: str) -> bool:
    """Check if word matches company name patterns"""
    for pattern in COMPANY_PATTERNS:
        if re.search(pattern, word, re.IGNORECASE):
            return True
    return False

def count_hebrew_with_exclusions(text: str) -> dict:
    """Count Hebrew characters excluding financial terms and company names"""
    if not text:
        return {
            'total_chars': 0,
            'hebrew_chars': 0,
            'hebrew_percentage': 0.0,
            'excluded_words': []
        }
    
    # Split text into words
    words = re.findall(r'\b\w+\b', text)
    
    # Count Hebrew characters
    hebrew_chars = sum(1 for char in text if is_hebrew_char(char))
    total_chars = len(text)
    
    # Find excluded words (financial terms and company names)
    excluded_words = []
    for word in words:
        if is_financial_term(word) or is_company_name(word):
            excluded_words.append(word)
    
    # Calculate percentage
    hebrew_percentage = (hebrew_chars / total_chars * 100) if total_chars > 0 else 0.0
    
    return {
        'total_chars': total_chars,
        'hebrew_chars': hebrew_chars,
        'hebrew_percentage': hebrew_percentage,
        'excluded_words': list(set(excluded_words)),
        'excluded_count': len(set(excluded_words))
    }

def analyze_response_file(file_path: str):
    """Analyze a response file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()
    
    result = count_hebrew_with_exclusions(text)
    return result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 analyze_hebrew_with_exclusions.py <text_file>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    result = analyze_response_file(file_path)
    
    print("=" * 80)
    print("📊 ניתוח משוב בעברית (ללא מונחים פיננסיים ושמות חברות)")
    print("=" * 80)
    print()
    print(f"📋 סטטיסטיקות:")
    print(f"   - אורך כולל: {result['total_chars']} תווים")
    print(f"   - תווים עבריים: {result['hebrew_chars']} ({result['hebrew_percentage']:.1f}%)")
    print(f"   - מילים שהוחרגו: {result['excluded_count']}")
    if result['excluded_words']:
        print(f"   - דוגמאות למילים שהוחרגו: {', '.join(result['excluded_words'][:10])}")
    print()
    print("=" * 80)

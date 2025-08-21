#!/usr/bin/env python3
"""
Script to add diverse notes to the database
"""

import sqlite3
import os
import shutil
from datetime import datetime, timedelta
import random

# Database path
DB_PATH = 'Backend/db/simpleTrade_new.db'

# File upload folder path
UPLOAD_FOLDER = 'Backend/uploads/notes'

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Sample data
SAMPLE_NOTES = [
    # Account notes
    {
        'content': '<h3>New Account Opening</h3><p>Opened new account at Bank Hapoalim with opening balance of ₪50,000. Account intended for daily trading.</p>',
        'related_type_id': 1,  # Account
        'related_id': 1,
        'attachment': 'account_opening.pdf',
        'created_at': datetime.now() - timedelta(days=30)
    },
    {
        'content': '<h4>Balance Update</h4><p>Account balance updated to ₪75,000 after profits from recent trades.</p><strong>Status:</strong> <span style="color: green;">Updated</span>',
        'related_type_id': 1,
        'related_id': 2,
        'attachment': 'balance_update.jpg',
        'created_at': datetime.now() - timedelta(days=15)
    },
    
    # Trade notes
    {
        'content': '<h3>AAPL Trade</h3><p>Purchase of 100 Apple shares at $150. <br><strong>Reason:</strong> Positive earnings report</p><ul><li>Support: $145</li><li>Resistance: $160</li></ul>',
        'related_type_id': 2,  # Trade
        'related_id': 1,
        'attachment': 'aapl_analysis.pdf',
        'created_at': datetime.now() - timedelta(days=10)
    },
    {
        'content': '<h4>TSLA Sale</h4><p>Sale of 50 Tesla shares at $250. <br><span style="color: red;">Profit: $5,000</span></p>',
        'related_type_id': 2,
        'related_id': 2,
        'attachment': 'tsla_sale.png',
        'created_at': datetime.now() - timedelta(days=5)
    },
    {
        'content': '<h3>MSFT Trade</h3><p>Purchase of 75 Microsoft shares at $300. <br><strong>Strategy:</strong> Long-term investment</p>',
        'related_type_id': 2,
        'related_id': 3,
        'attachment': 'msft_chart.jpg',
        'created_at': datetime.now() - timedelta(days=3)
    },
    
    # Planning notes
    {
        'content': '<h3>Q4 2025 Planning</h3><p>Planning for Q4 2025 trades. <br><strong>Goals:</strong></p><ol><li>Increase investment portfolio by 20%</li><li>Risk diversification</li><li>Daily monitoring</li></ol>',
        'related_type_id': 3,  # Planning
        'related_id': 1,
        'attachment': 'q4_planning.pdf',
        'created_at': datetime.now() - timedelta(days=25)
    },
    {
        'content': '<h4>Technology Planning</h4><p>Planning for technology sector trades. <br><span style="color: blue;">Recommended stocks:</span> AAPL, MSFT, GOOGL</p>',
        'related_type_id': 3,
        'related_id': 2,
        'attachment': 'tech_plan.png',
        'created_at': datetime.now() - timedelta(days=20)
    },
    
    # Ticker notes
    {
        'content': '<h3>AAPL Analysis</h3><p>Technical analysis of Apple. <br><strong>Indicators:</strong></p><ul><li>RSI: 65</li><li>MACD: Positive</li><li>Strong support</li></ul>',
        'related_type_id': 4,  # Ticker
        'related_id': 1,
        'attachment': 'aapl_technical.pdf',
        'created_at': datetime.now() - timedelta(days=12)
    },
    {
        'content': '<h4>TSLA Update</h4><p>Update on Tesla - positive sales report. <br><span style="color: green;">Forecast: 15% increase</span></p>',
        'related_type_id': 4,
        'related_id': 2,
        'attachment': 'tsla_update.jpg',
        'created_at': datetime.now() - timedelta(days=8)
    },
    
    # Additional notes
    {
        'content': '<h3>Weekly Summary</h3><p>Summary of weekly trades. <br><strong>Results:</strong></p><ul><li>Total profit: ₪12,000</li><li>5 successful trades</li><li>2 losing trades</li></ul>',
        'related_type_id': 1,
        'related_id': 3,
        'attachment': 'weekly_summary.pdf',
        'created_at': datetime.now() - timedelta(days=7)
    },
    {
        'content': '<h4>Market Analysis</h4><p>Current market analysis. <br><span style="color: orange;">Warning:</span> High volatility expected</p>',
        'related_type_id': 2,
        'related_id': 4,
        'attachment': 'market_analysis.png',
        'created_at': datetime.now() - timedelta(days=2)
    },
    {
        'content': '<h3>New Strategy</h3><p>Development of new trading strategy. <br><strong>Principles:</strong></p><ol><li>Strict risk management</li><li>Technical monitoring</li><li>Precise timing</li></ol>',
        'related_type_id': 3,
        'related_id': 3,
        'attachment': 'new_strategy.pdf',
        'created_at': datetime.now() - timedelta(days=1)
    },
    {
        'content': '<h4>GOOGL Update</h4><p>Update on Google - new product launch. <br><span style="color: green;">Trading opportunity</span></p>',
        'related_type_id': 4,
        'related_id': 3,
        'attachment': 'googl_news.jpg',
        'created_at': datetime.now() - timedelta(hours=6)
    }
]

def create_sample_files():
    """Create sample files"""
    sample_files = {
        'account_opening.pdf': b'%PDF-1.4\n%Sample PDF content\n',
        'balance_update.jpg': b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9',
        'aapl_analysis.pdf': b'%PDF-1.4\n%AAPL Analysis Report\n',
        'tsla_sale.png': b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x07tIME\x07\xe5\x08\x13\x0c\x1d\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xf5\x27\xde\xfc\x00\x00\x00\x00IEND\xaeB`\x82',
        'msft_chart.jpg': b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9',
        'q4_planning.pdf': b'%PDF-1.4\n%Q4 Planning Document\n',
        'tech_plan.png': b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x07tIME\x07\xe5\x08\x13\x0c\x1d\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xf5\x27\xde\xfc\x00\x00\x00\x00IEND\xaeB`\x82',
        'aapl_technical.pdf': b'%PDF-1.4\n%AAPL Technical Analysis\n',
        'tsla_update.jpg': b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9',
        'weekly_summary.pdf': b'%PDF-1.4\n%Weekly Summary Report\n',
        'market_analysis.png': b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x07tIME\x07\xe5\x08\x13\x0c\x1d\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xf5\x27\xde\xfc\x00\x00\x00\x00IEND\xaeB`\x82',
        'new_strategy.pdf': b'%PDF-1.4\n%New Trading Strategy\n',
        'googl_news.jpg': b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9'
    }
    
    for filename, content in sample_files.items():
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        with open(file_path, 'wb') as f:
            f.write(content)
        print(f"✅ Created sample file: {filename}")

def add_notes_to_database():
    """Add notes to database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if notes already exist
        cursor.execute("SELECT COUNT(*) FROM notes")
        existing_count = cursor.fetchone()[0]
        
        if existing_count > 0:
            print(f"⚠️  Found {existing_count} existing notes. Skipping...")
            return
        
        # Add notes
        for note in SAMPLE_NOTES:
            cursor.execute("""
                INSERT INTO notes (content, related_type_id, related_id, attachment, created_at)
                VALUES (?, ?, ?, ?, ?)
            """, (
                note['content'],
                note['related_type_id'],
                note['related_id'],
                note['attachment'],
                note['created_at'].isoformat()
            ))
        
        conn.commit()
        print(f"✅ Added {len(SAMPLE_NOTES)} notes to database")
        
    except Exception as e:
        print(f"❌ Error adding notes: {e}")
        conn.rollback()
    finally:
        conn.close()

def main():
    """Main function"""
    print("🚀 Starting notes data generation...")
    
    # Create sample files
    print("📁 Creating sample files...")
    create_sample_files()
    
    # Add notes to database
    print("💾 Adding notes to database...")
    add_notes_to_database()
    
    print("✅ Notes data generation completed!")

if __name__ == "__main__":
    main()


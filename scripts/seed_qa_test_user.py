#!/usr/bin/env python3
"""
QA Test User Seed Script
Team 60 (DevOps & Platform)
Created: 2026-02-07
Purpose: Create permanent QA test user for Gate B Runtime/E2E testing

This script creates a permanent test user (TikTrackAdmin / 4181) that will be
available after every database reset/refresh for QA testing purposes.

Usage:
    python scripts/seed_qa_test_user.py
"""

import sys
import os
import psycopg2
from pathlib import Path

# Read DATABASE_URL from .env
env_file = Path(__file__).parent.parent / "api" / ".env"
DATABASE_URL = None

if env_file.exists():
    with open(env_file, 'r') as f:
        for line in f:
            if line.startswith("DATABASE_URL=") and not line.startswith("#"):
                DATABASE_URL = line.split("=", 1)[1].strip().strip('"').strip("'")
                break

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL not found.")
    print("   Please set it in api/.env file (DATABASE_URL=...)")
    sys.exit(1)

# Parse DATABASE_URL
if "postgresql+asyncpg://" in DATABASE_URL:
    db_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
elif "postgresql://" not in DATABASE_URL:
    print(f"❌ ERROR: Invalid DATABASE_URL format: {DATABASE_URL}")
    sys.exit(1)
else:
    db_url = DATABASE_URL

# QA Test User credentials (permanent for Gate B)
QA_USERNAME = "TikTrackAdmin"
QA_PASSWORD = "4181"
QA_EMAIL = "qatest@tiktrack.com"


def run_sql_file(conn, sql_file_path):
    """Execute SQL file."""
    print(f"📄 Executing: {sql_file_path}")
    
    with open(sql_file_path, 'r') as f:
        sql_content = f.read()
    
    try:
        with conn.cursor() as cur:
            cur.execute(sql_content)
            conn.commit()
            
            # Get verification result
            cur.execute("""
                SELECT 
                    id,
                    username,
                    email,
                    role,
                    is_active,
                    is_email_verified,
                    created_at
                FROM user_data.users
                WHERE username = %s
            """, (QA_USERNAME,))
            
            user = cur.fetchone()
            if user:
                print(f"✅ QA test user verified:")
                print(f"   ID: {user[0]}")
                print(f"   Username: {user[1]}")
                print(f"   Email: {user[2]}")
                print(f"   Role: {user[3]}")
                print(f"   Active: {user[4]}")
                print(f"   Email Verified: {user[5]}")
                print(f"   Created: {user[6]}")
                return True
            else:
                print(f"❌ User not found after creation!")
                return False
                
    except Exception as e:
        print(f"❌ Error executing SQL: {e}")
        conn.rollback()
        return False


def verify_login():
    """Verify that login endpoint returns a token."""
    import httpx
    
    print("\n" + "=" * 60)
    print("Verifying Login Endpoint")
    print("=" * 60)
    
    try:
        # Try to login with QA test user
        with httpx.Client() as client:
            # Try username_or_email format (correct format)
            response = client.post(
                "http://localhost:8082/api/v1/auth/login",
                json={
                    "username_or_email": QA_USERNAME,
                    "password": QA_PASSWORD
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data:
                    print(f"✅ Login successful!")
                    print(f"   Status: {response.status_code}")
                    print(f"   Token received: Yes")
                    print(f"   Token preview: {data['access_token'][:50]}...")
                    if "refresh_token" in data:
                        print(f"   Refresh token: Yes")
                    return True
                else:
                    print(f"⚠️  Login returned 200 but no access_token in response")
                    print(f"   Response: {data}")
                    return False
            else:
                print(f"❌ Login failed!")
                print(f"   Status: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
    except httpx.ConnectError:
        print(f"⚠️  Could not connect to backend API (http://localhost:8082)")
        print(f"   Backend might not be running. Skipping login verification.")
        return None
    except ImportError:
        print(f"⚠️  httpx not installed. Skipping login verification.")
        print(f"   Install with: pip install httpx")
        return None
    except Exception as e:
        print(f"⚠️  Error verifying login: {str(e)}")
        return None


def main():
    """Main entry point."""
    print("=" * 60)
    print("QA Test User Seed Script")
    print("Team 60 (DevOps & Platform)")
    print("=" * 60)
    print(f"\n📊 Creating QA test user:")
    print(f"   Username: {QA_USERNAME}")
    print(f"   Password: {QA_PASSWORD}")
    print(f"   Email: {QA_EMAIL}")
    print(f"   Role: ADMIN")
    print()
    
    # Get script directory
    script_dir = Path(__file__).parent
    sql_file = script_dir / "seed_qa_test_user.sql"
    
    if not sql_file.exists():
        print(f"❌ SQL file not found: {sql_file}")
        sys.exit(1)
    
    # Connect to database
    print(f"🔌 Connecting to database...")
    try:
        conn = psycopg2.connect(db_url)
        print("✅ Connected to database")
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        sys.exit(1)
    
    # Execute SQL file
    success = run_sql_file(conn, sql_file)
    
    # Close connection
    conn.close()
    print("\n🔌 Disconnected from database")
    
    # Verify login (if backend is running)
    login_result = verify_login()
    
    # Exit with appropriate code
    print("\n" + "=" * 60)
    if success:
        if login_result is True:
            print("✅ QA Test User Seed Complete - Login Verified")
        elif login_result is None:
            print("✅ QA Test User Seed Complete - Login Verification Skipped")
        else:
            print("⚠️  QA Test User Seed Complete - Login Verification Failed")
        print("=" * 60)
        sys.exit(0 if login_result is not False else 1)
    else:
        print("❌ QA Test User Seed Failed")
        print("=" * 60)
        sys.exit(1)


if __name__ == "__main__":
    main()

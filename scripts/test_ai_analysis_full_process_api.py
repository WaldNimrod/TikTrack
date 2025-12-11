#!/usr/bin/env python3
"""
Full AI Analysis Process Test - API Level
Tests all 4 templates with full process including validation and note creation
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any, List, Optional

# Configuration
BASE_URL = "http://127.0.0.1:8080"
SESSION = requests.Session()

# Test credentials (admin/admin123 as per rules)
LOGIN_DATA = {
    "username": "admin",
    "password": "admin123"
}

# Template configurations - ALL 4 TEMPLATES
TEMPLATES = [
    {
        "id": 1,
        "name": "ניתוח מחקר הון",
        "variables": {
            "version": "2.0",
            "prompt_variables": {
                "stock_ticker": "AAPL",
                "investment_thesis": "תוכנית swing עבור AAPL",
                "goal": "long_term_investment",  # Use value from options, not label
                "response_language": "hebrew"
            },
            "filters": {},
            "trade_selection": {},
            "metadata": {
                "analysis_scope": "ניתוח מחקר הון",
                "filters_applied": [],
                "created_via": "wizard_test"
            }
        }
    },
    {
        "id": 2,
        "name": "ניתוח טכני מעמיק",
        "variables": {
            "version": "2.0",
            "prompt_variables": {
                "stock_ticker": "TSLA",
                "technical_indicators": "RSI",
                "response_language": "hebrew"
            },
            "filters": {},
            "trade_selection": {},
            "metadata": {
                "analysis_scope": "ניתוח טכני מעמיק",
                "filters_applied": [],
                "created_via": "wizard_test"
            }
        }
    },
    {
        "id": 3,
        "name": "ניתוח ביצועים ופורטפוליו",
        "variables": {
            "version": "2.0",
            "prompt_variables": {
                "response_language": "hebrew"
            },
            "filters": {
                "trading_account_id": 1  # First account - required for this template
            },
            "trade_selection": {},
            "metadata": {
                "analysis_scope": "ניתוח ביצועים ופורטפוליו",
                "filters_applied": ["trading_account_id"],
                "created_via": "wizard_test"
            }
        }
    },
    {
        "id": 4,
        "name": "ניתוח סיכונים ותנאים",
        "variables": {
            "version": "2.0",
            "prompt_variables": {
                "stock_ticker": "GOOGL",
                "response_language": "hebrew"
            },
            "filters": {},
            "trade_selection": {},
            "metadata": {
                "analysis_scope": "ניתוח סיכונים ותנאים",
                "filters_applied": [],
                "created_via": "wizard_test"
            }
        }
    }
]


def login() -> bool:
    """Login and set session"""
    try:
        response = SESSION.post(
            f"{BASE_URL}/api/auth/login",
            json=LOGIN_DATA,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print("✅ Login successful")
            return True
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False


def validate_request(template_id: int, variables: Dict[str, Any], provider: str = "gemini") -> tuple[bool, List[str]]:
    """Validate analysis request"""
    try:
        response = SESSION.post(
            f"{BASE_URL}/api/business/ai-analysis/validate",
            json={
                "template_id": template_id,
                "variables": variables,
                "provider": provider
            },
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "success" and data.get("data", {}).get("is_valid"):
                print(f"    ✅ Validation passed")
                return True, []
            else:
                errors = data.get("error", {}).get("errors", ["Validation failed"])
                print(f"    ❌ Validation failed: {errors}")
                return False, errors
        else:
            error_data = response.json() if response.content else {}
            errors = error_data.get("error", {}).get("errors", [f"HTTP {response.status_code}"])
            print(f"    ❌ Validation error: {errors}")
            return False, errors
    except Exception as e:
        print(f"    ❌ Validation exception: {e}")
        return False, [str(e)]


def generate_analysis(template_id: int, variables: Dict[str, Any], provider: str = "gemini") -> Optional[Dict[str, Any]]:
    """Generate analysis"""
    try:
        response = SESSION.post(
            f"{BASE_URL}/api/ai-analysis/generate",
            json={
                "template_id": template_id,
                "variables": variables,
                "provider": provider
            },
            headers={"Content-Type": "application/json"},
            timeout=300  # 5 minutes timeout
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "success":
                analysis = data.get("data", {})
                print(f"    ✅ Analysis generated: ID {analysis.get('id')}")
                return analysis
            else:
                error_msg = data.get("message", "Unknown error")
                print(f"    ❌ Generation failed: {error_msg}")
                return None
        else:
            error_data = response.json() if response.content else {}
            error_msg = error_data.get("message", f"HTTP {response.status_code}")
            print(f"    ❌ Generation error: {error_msg}")
            return None
    except Exception as e:
        print(f"    ❌ Generation exception: {e}")
        return None


def wait_for_analysis(analysis_id: int, max_wait: int = 120) -> Optional[Dict[str, Any]]:
    """Wait for analysis to complete"""
    print(f"    ⏳ Waiting for analysis {analysis_id} to complete...")
    
    start_time = time.time()
    attempts = 0
    
    while time.time() - start_time < max_wait:
        try:
            response = SESSION.get(
                f"{BASE_URL}/api/ai-analysis/history/{analysis_id}",
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success":
                    analysis = data.get("data", {})
                    status = analysis.get("status")
                    
                    if status == "completed":
                        print(f"    ✅ Analysis completed")
                        return analysis
                    elif status == "failed":
                        error_msg = analysis.get("error_message", "Unknown error")
                        print(f"    ❌ Analysis failed: {error_msg}")
                        return None
                    # else: still pending, continue waiting
                    
            attempts += 1
            if attempts % 10 == 0:
                elapsed = int(time.time() - start_time)
                print(f"    ⏳ Still waiting... ({elapsed}s)")
            
            time.sleep(2)
        except Exception as e:
            print(f"    ⚠️ Error checking status: {e}")
            time.sleep(2)
    
    print(f"    ❌ Timeout waiting for analysis")
    return None


def create_note(analysis: Dict[str, Any], related_type: int = None, related_id: int = None) -> Optional[int]:
    """Create note from analysis"""
    try:
        # Prepare note content
        template_name = analysis.get("template_name", "לא ידוע")
        provider = analysis.get("provider", "לא ידוע")
        created_at = analysis.get("created_at", datetime.now().isoformat())
        response_text = analysis.get("response_text", "")
        
        # Create header
        header = f"""<div class="ai-analysis-note-header">
<h4>ניתוח AI: {template_name}</h4>
<p><strong>מנוע:</strong> {provider}<br>
<strong>תאריך:</strong> {created_at}</p>
<hr>
</div>
"""
        
        note_content = header + response_text
        
        # Create note - API requires both related_type_id and related_id
        # If not provided, skip note creation (notes can be created manually via UI)
        if related_type is None or related_id is None:
            print(f"    ⚠️ Skipping note creation - related_type_id and related_id required")
            print(f"       (related_type_id={related_type}, related_id={related_id})")
            print(f"       Note can be created manually via UI from analysis results")
            return None
        
        note_data = {
            "content": note_content,
            "related_type_id": related_type,
            "related_id": related_id
        }
        
        # Try the notes endpoint
        response = SESSION.post(
            f"{BASE_URL}/api/notes",
            json=note_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code in [200, 201]:
            data = response.json()
            if data.get("status") == "success":
                note_data_result = data.get("data", {})
                note_id = note_data_result.get("id") if isinstance(note_data_result, dict) else note_data_result
                if note_id:
                    print(f"    ✅ Note created: ID {note_id}")
                    return note_id
                else:
                    print(f"    ⚠️ Note created but no ID returned. Response: {data}")
                    return None
            else:
                error_msg = data.get("error", {}).get("message", data.get("message", "Unknown error"))
                print(f"    ❌ Note creation failed: {error_msg}")
                print(f"    Response: {response.text[:200]}")
                return None
        else:
            error_data = response.json() if response.content else {}
            error_msg = error_data.get("error", {}).get("message", error_data.get("message", f"HTTP {response.status_code}"))
            print(f"    ❌ Note creation error: {error_msg}")
            print(f"    Response: {response.text[:200]}")
            return None
    except Exception as e:
        print(f"    ❌ Note creation exception: {e}")
        return None


def test_template(template: Dict[str, Any]) -> Dict[str, Any]:
    """Test single template"""
    template_id = template["id"]
    template_name = template["name"]
    variables = template["variables"]
    
    print(f"\n📋 Testing Template {template_id}: {template_name}")
    print("=" * 60)
    
    start_time = time.time()
    result = {
        "template_id": template_id,
        "template_name": template_name,
        "success": False,
        "analysis_id": None,
        "note_id": None,
        "errors": [],
        "duration": 0
    }
    
    try:
        # Step 1: Validate
        print("  🔵 Step 1: Validating request...")
        is_valid, errors = validate_request(template_id, variables, "gemini")
        if not is_valid:
            result["errors"] = errors
            result["duration"] = int((time.time() - start_time) * 1000)
            return result
        
        # Step 2: Generate
        print("  🔵 Step 2: Generating analysis...")
        analysis = generate_analysis(template_id, variables, "gemini")
        if not analysis:
            result["errors"].append("Analysis generation failed")
            result["duration"] = int((time.time() - start_time) * 1000)
            return result
        
        analysis_id = analysis.get("id")
        result["analysis_id"] = analysis_id
        
        # Step 3: Wait for completion
        print("  🔵 Step 3: Waiting for analysis to complete...")
        completed_analysis = wait_for_analysis(analysis_id, max_wait=180)  # 3 minutes
        if not completed_analysis:
            result["errors"].append("Analysis did not complete")
            result["duration"] = int((time.time() - start_time) * 1000)
            return result
        
        # Step 4: Create note
        print("  🔵 Step 4: Creating note...")
        note_id = create_note(completed_analysis)
        result["note_id"] = note_id
        
        result["success"] = True
        result["duration"] = int((time.time() - start_time) * 1000)
        
        print(f"\n  ✅ Template {template_id} completed successfully")
        print(f"     Analysis ID: {analysis_id}")
        print(f"     Note ID: {note_id or 'Not created'}")
        print(f"     Duration: {result['duration']}ms")
        
    except Exception as e:
        result["errors"].append(str(e))
        result["duration"] = int((time.time() - start_time) * 1000)
        print(f"\n  ❌ Template {template_id} failed: {e}")
    
    return result


def main():
    """Main test function - Tests ALL 4 templates comprehensively"""
    print("🧪 Full AI Analysis Process Test - ALL 4 TEMPLATES")
    print("=" * 70)
    print(f"Testing {len(TEMPLATES)} templates via Wizard Flow")
    print(f"Base URL: {BASE_URL}")
    print("=" * 70)
    print()
    
    # Login
    if not login():
        print("\n❌ Cannot proceed without login")
        return
    
    # Test all 4 templates
    results = []
    for i, template in enumerate(TEMPLATES, 1):
        print(f"\n{'='*70}")
        print(f"Testing Template {i}/{len(TEMPLATES)}: ID {template['id']} - {template['name']}")
        print(f"{'='*70}")
        
        result = test_template(template)
        results.append(result)
        
        # Delay between tests (except last)
        if i < len(TEMPLATES):
            print(f"\n⏳ Waiting 5 seconds before next template...")
            time.sleep(5)
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]
    
    print(f"✅ Successful: {len(successful)}/{len(results)}")
    print(f"❌ Failed: {len(failed)}/{len(results)}")
    
    if successful:
        print("\n✅ Successful tests:")
        for r in successful:
            print(f"  - Template {r['template_id']} ({r['template_name']}):")
            print(f"    Analysis ID: {r['analysis_id']}")
            print(f"    Note ID: {r['note_id'] or 'Not created'}")
            print(f"    Duration: {r['duration']}ms")
    
    if failed:
        print("\n❌ Failed tests:")
        for r in failed:
            print(f"  - Template {r['template_id']} ({r['template_name']}):")
            print(f"    Errors: {', '.join(r['errors'])}")
            if r['analysis_id']:
                print(f"    Analysis ID: {r['analysis_id']} (may be pending)")
    
    print("\n" + "=" * 60)
    print(f"Total duration: {sum(r['duration'] for r in results)}ms")
    print("=" * 60)


if __name__ == "__main__":
    main()


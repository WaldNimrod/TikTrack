#!/usr/bin/env python3
"""
הרצת כל הבדיקות על כל עמודי הבדיקה
Run all validation tests on all test pages

מריץ:
1. ניתוח מבנה
2. תיקון מבנה
3. בדיקת תקינות
4. יצירת דוח סופי
"""

import subprocess
import sys
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.parent
SCRIPTS_DIR = BASE_DIR / "scripts" / "testing"

def run_script(script_name, description):
    """Run a test script"""
    print(f"\n{'='*60}")
    print(f"{description}")
    print(f"{'='*60}\n")
    
    script_path = SCRIPTS_DIR / script_name
    if not script_path.exists():
        print(f"⚠️  Script not found: {script_name}")
        return False
    
    try:
        result = subprocess.run(
            [sys.executable, str(script_path)],
            cwd=str(BASE_DIR),
            capture_output=True,
            text=True,
            timeout=300
        )
        
        if result.returncode == 0:
            print("✅ Success")
            if result.stdout:
                print(result.stdout[-500:])  # Last 500 chars
            return True
        else:
            print("❌ Failed")
            if result.stderr:
                print(result.stderr[-500:])
            return False
    except subprocess.TimeoutExpired:
        print("⏱️  Timeout")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def main():
    """Main function"""
    print("=" * 60)
    print("הרצת כל הבדיקות - כל עמודי הבדיקה")
    print("=" * 60)
    
    results = {}
    
    # 1. ניתוח מבנה
    results["structure_analysis"] = run_script(
        "analyze_test_pages_structure.py",
        "1. ניתוח מבנה כל עמודי הבדיקה"
    )
    
    # 2. תיקון מבנה
    results["structure_fixes"] = run_script(
        "fix_test_pages_structure.py",
        "2. תיקון מבנה בסיסי"
    )
    
    # 3. בדיקת תקינות
    results["structure_validation"] = run_script(
        "validate_test_pages_structure.py",
        "3. בדיקת תקינות מבנה"
    )
    
    # 4. יצירת דוח מקיף
    results["comprehensive_report"] = run_script(
        "generate_comprehensive_test_report.py",
        "4. יצירת דוח מקיף"
    )
    
    # סיכום
    print("\n" + "=" * 60)
    print("סיכום כל הבדיקות")
    print("=" * 60)
    
    for test_name, success in results.items():
        status = "✅" if success else "❌"
        print(f"{status} {test_name}")
    
    all_passed = all(results.values())
    
    if all_passed:
        print("\n✅ כל הבדיקות עברו בהצלחה!")
    else:
        print("\n⚠️  חלק מהבדיקות נכשלו")
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())


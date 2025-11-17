#!/usr/bin/env python3
"""
Sync Trading UI to Production
==============================

Copies trading-ui/ directory to production/trading-ui/ for complete isolation.

Purpose: Ensure production has its own UI copy, completely separate from development
Location: scripts/sync_ui_to_production.py
"""

import shutil
import sys
from pathlib import Path

# Critical UI directories/files that must exist in production after sync
CRITICAL_UI_PATHS = [
    Path("styles-new"),
    Path("styles"),
    Path("styles-new/header-styles.css"),
]

def sync_ui_to_production():
    """Copy trading-ui/ to production/trading-ui/"""
    
    # Get paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    source_ui = project_root / "trading-ui"
    target_ui = project_root / "production" / "trading-ui"
    
    if not source_ui.exists():
        print(f"❌ Source UI directory not found: {source_ui}")
        return False
    
    print("=" * 70)
    print("TikTrack UI Sync to Production")
    print("=" * 70)
    print(f"Source: {source_ui}")
    print(f"Target: {target_ui}")
    print()
    
    # Remove existing production UI if exists
    if target_ui.exists():
        print(f"🗑️  Removing existing production UI...")
        shutil.rmtree(target_ui)
    
    # Copy entire directory
    print(f"📁 Copying UI files...")
    try:
        shutil.copytree(source_ui, target_ui, ignore=shutil.ignore_patterns(
            'node_modules',
            '.git',
            '__pycache__',
            '*.pyc',
            '.DS_Store',
            'coverage',
            '*.log'
        ))
        
        # Count files
        ui_files = list(target_ui.rglob('*'))
        ui_files = [f for f in ui_files if f.is_file()]
        
        print(f"✅ Successfully copied {len(ui_files)} files")
        print(f"📁 Location: {target_ui}")
        print()

        ensure_critical_ui_paths(source_ui, target_ui)

        print("=" * 70)
        print("✅ UI sync completed successfully!")
        print("=" * 70)
        
        return True
        
    except Exception as e:
        print(f"❌ Error copying UI: {e}")
        return False


def ensure_critical_ui_paths(source_ui: Path, target_ui: Path) -> None:
    """Ensure required style directories/files always exist in production."""
    print("🔍 Verifying critical UI directories...")
    for rel_path in CRITICAL_UI_PATHS:
        src = source_ui / rel_path
        dst = target_ui / rel_path

        if not src.exists():
            print(f"  ⚠️  Missing from source (skipping): {rel_path}")
            continue

        if dst.exists():
            print(f"  ✅ Verified: {rel_path}")
            continue

        dst.parent.mkdir(parents=True, exist_ok=True)
        if src.is_dir():
            shutil.copytree(src, dst)
        else:
            shutil.copy2(src, dst)

        print(f"  🆗 Restored: {rel_path}")
    print("🔒 Critical UI paths verified.\n")

if __name__ == "__main__":
    success = sync_ui_to_production()
    sys.exit(0 if success else 1)


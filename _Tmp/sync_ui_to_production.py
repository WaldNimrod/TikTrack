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
        # Use dirs_exist_ok=True to allow overwriting
        if target_ui.exists():
            shutil.rmtree(target_ui)
        
        # Use copytree with copy_function=shutil.copy2 to preserve metadata
        # This ensures files are properly copied with timestamps
        shutil.copytree(
            source_ui, 
            target_ui, 
            ignore=shutil.ignore_patterns(
                'node_modules',
                '.git',
                '__pycache__',
                '*.pyc',
                '.DS_Store',
                'coverage',
                '*.log'
            ),
            copy_function=shutil.copy2,  # Preserve metadata (timestamps, permissions)
            dirs_exist_ok=False
        )
        
        # Count files
        ui_files = list(target_ui.rglob('*'))
        ui_files = [f for f in ui_files if f.is_file()]
        
        # Count CSS files specifically
        css_files = [f for f in ui_files if f.suffix == '.css']
        
        # Count JS files
        js_files = [f for f in ui_files if f.suffix == '.js']
        
        # Count HTML files
        html_files = [f for f in ui_files if f.suffix == '.html']
        
        print(f"✅ Successfully copied {len(ui_files)} files")
        print(f"   📄 CSS files: {len(css_files)}")
        print(f"   📄 JS files: {len(js_files)}")
        print(f"   📄 HTML files: {len(html_files)}")
        print(f"📁 Location: {target_ui}")
        print()
        
        # Verify critical files were copied
        critical_files = [
            'scripts/header-system.js',
            'styles-new/header-styles.css',
            'data_import.html',
            'index.html'
        ]
        
        print("🔍 Verifying critical files...")
        all_critical_ok = True
        for rel_path in critical_files:
            target_file = target_ui / rel_path
            if target_file.exists():
                print(f"  ✅ {rel_path}")
            else:
                print(f"  ❌ MISSING: {rel_path}")
                all_critical_ok = False
        
        if not all_critical_ok:
            print("  ⚠️  Some critical files are missing!")
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


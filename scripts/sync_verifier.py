#!/usr/bin/env python3
"""
Sync Verifier
=============

Verifies that sync operations completed successfully by checking
critical files and comparing checksums.

Purpose: Ensure all files are properly synced to production
Location: scripts/sync_verifier.py
"""

import hashlib
import sys
from pathlib import Path
from typing import Dict, List

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))


class SyncVerifier:
    """Verifies sync operations"""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
    
    def calculate_checksum(self, file_path: Path) -> str:
        """Calculate MD5 checksum"""
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    
    def verify_critical_files(self) -> Dict[str, bool]:
        """Verify critical files are synced correctly"""
        critical_files = {
            'header-system.js': 'trading-ui/scripts/header-system.js',
            'header-styles.css': 'trading-ui/styles-new/header-styles.css',
            'data_import.html': 'trading-ui/data_import.html',
            'index.html': 'trading-ui/index.html',
            'app.py': 'Backend/app.py',
            'settings.py': 'Backend/config/settings.py',
        }
        
        results = {}
        
        for name, rel_path in critical_files.items():
            dev_file = self.project_root / rel_path
            prod_file = self.project_root / "production" / rel_path
            
            if not dev_file.exists():
                print(f"  ⚠️  {name}: Source file not found")
                results[name] = False
                continue
            
            if not prod_file.exists():
                print(f"  ❌ {name}: Missing in production")
                results[name] = False
                continue
            
            # Compare checksums
            try:
                dev_checksum = self.calculate_checksum(dev_file)
                prod_checksum = self.calculate_checksum(prod_file)
                
                if dev_checksum == prod_checksum:
                    print(f"  ✅ {name}: Verified (checksum match)")
                    results[name] = True
                else:
                    print(f"  ❌ {name}: Checksum mismatch")
                    print(f"      Dev:  {dev_checksum[:16]}...")
                    print(f"      Prod: {prod_checksum[:16]}...")
                    results[name] = False
            except Exception as e:
                print(f"  ❌ {name}: Error verifying - {e}")
                results[name] = False
        
        return results
    
    def verify_sync_complete(self) -> bool:
        """Verify sync completed successfully"""
        print("  🔍 Verifying sync completion...")
        
        results = self.verify_critical_files()
        
        all_ok = all(results.values())
        
        if all_ok:
            print("  ✅ All critical files verified")
        else:
            failed = [name for name, ok in results.items() if not ok]
            print(f"  ❌ Verification failed for: {', '.join(failed)}")
        
        return all_ok


def main():
    """Main entry point"""
    print("=" * 70)
    print("TikTrack Sync Verification")
    print("=" * 70)
    print()
    
    verifier = SyncVerifier(PROJECT_ROOT)
    success = verifier.verify_sync_complete()
    
    print()
    print("=" * 70)
    if success:
        print("✅ Sync verification passed!")
    else:
        print("❌ Sync verification failed!")
    print("=" * 70)
    
    return success


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)


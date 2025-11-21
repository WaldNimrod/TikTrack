#!/usr/bin/env python3
"""
Sync Verifier
=============

Verifies that sync operations completed successfully by checking
critical files and comparing checksums.
"""

import hashlib
import sys
from pathlib import Path
from typing import Dict, List

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

try:
    from logger import get_logger
except ImportError:
    sys.path.insert(0, str(Path(__file__).parent))
    from logger import get_logger


class SyncVerifier:
    """Verifies sync operations"""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.logger = get_logger()
    
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
                self.logger.warning(f"  ⚠️  {name}: Source file not found")
                results[name] = False
                continue
            
            if not prod_file.exists():
                self.logger.error(f"  ❌ {name}: Missing in production")
                results[name] = False
                continue
            
            # Compare checksums
            try:
                dev_checksum = self.calculate_checksum(dev_file)
                prod_checksum = self.calculate_checksum(prod_file)
                
                if dev_checksum == prod_checksum:
                    self.logger.info(f"  ✅ {name}: Verified (checksum match)")
                    results[name] = True
                else:
                    self.logger.error(f"  ❌ {name}: Checksum mismatch")
                    self.logger.error(f"      Dev:  {dev_checksum[:16]}...")
                    self.logger.error(f"      Prod: {prod_checksum[:16]}...")
                    results[name] = False
            except Exception as e:
                self.logger.error(f"  ❌ {name}: Error verifying - {e}")
                results[name] = False
        
        return results
    
    def verify_sync_complete(self) -> bool:
        """Verify sync completed successfully"""
        self.logger.info("  🔍 Verifying sync completion...")
        
        results = self.verify_critical_files()
        
        all_ok = all(results.values())
        
        if all_ok:
            self.logger.info("  ✅ All critical files verified")
        else:
            failed = [name for name, ok in results.items() if not ok]
            self.logger.error(f"  ❌ Verification failed for: {', '.join(failed)}")
        
        return all_ok


if __name__ == '__main__':
    verifier = SyncVerifier(PROJECT_ROOT)
    success = verifier.verify_sync_complete()
    sys.exit(0 if success else 1)


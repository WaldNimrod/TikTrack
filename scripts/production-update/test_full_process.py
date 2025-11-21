#!/usr/bin/env python3
"""
Full Process Test
=================

Tests the complete production update process to verify all components work correctly.
"""

import json
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

try:
    sys.path.insert(0, str(Path(__file__).parent.parent / "utils"))
    from logger import get_logger
except ImportError:
    # Fallback
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger("test")
    def get_logger():
        return logger


class FullProcessTester:
    """Tests the full production update process"""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.logger = get_logger()
        self.test_dir = project_root / "_Tmp" / "production-update-test"
        self.results = {
            'test_started': datetime.now().isoformat(),
            'scenarios': [],
            'summary': {}
        }
    
    def create_snapshot(self) -> Path:
        """Create snapshot of current production for testing"""
        snapshot_dir = self.test_dir / f"snapshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        snapshot_dir.mkdir(parents=True, exist_ok=True)
        
        # Copy production directory
        production_dir = self.project_root / "production"
        if production_dir.exists():
            snapshot_prod = snapshot_dir / "production"
            shutil.copytree(production_dir, snapshot_prod)
            self.logger.info(f"  📸 Snapshot created: {snapshot_dir}")
        
        return snapshot_dir
    
    def restore_snapshot(self, snapshot_dir: Path):
        """Restore snapshot"""
        snapshot_prod = snapshot_dir / "production"
        production_dir = self.project_root / "production"
        
        if snapshot_prod.exists():
            if production_dir.exists():
                shutil.rmtree(production_dir)
            shutil.copytree(snapshot_prod, production_dir)
            self.logger.info(f"  🔄 Snapshot restored from: {snapshot_dir}")
    
    def test_dry_run(self) -> dict:
        """Test 1: Dry-run of full process"""
        self.logger.info("=" * 70)
        self.logger.info("Test 1: Dry-Run of Full Process")
        self.logger.info("=" * 70)
        
        try:
            result = subprocess.run(
                [sys.executable, str(self.project_root / "scripts" / "production-update" / "master.py"),
                 "--dry-run"],
                cwd=str(self.project_root),
                capture_output=True,
                text=True,
                timeout=300
            )
            
            success = result.returncode == 0
            
            return {
                'name': 'Dry-Run Test',
                'success': success,
                'returncode': result.returncode,
                'stdout': result.stdout,
                'stderr': result.stderr
            }
        except subprocess.TimeoutExpired:
            return {
                'name': 'Dry-Run Test',
                'success': False,
                'error': 'Timeout after 300 seconds'
            }
        except Exception as e:
            return {
                'name': 'Dry-Run Test',
                'success': False,
                'error': str(e)
            }
    
    def test_specific_steps(self, steps: list) -> dict:
        """Test specific steps"""
        self.logger.info("=" * 70)
        self.logger.info(f"Test: Specific Steps {steps}")
        self.logger.info("=" * 70)
        
        try:
            steps_str = ','.join(map(str, steps))
            result = subprocess.run(
                [sys.executable, str(self.project_root / "scripts" / "production-update" / "master.py"),
                 "--steps", steps_str, "--dry-run"],
                cwd=str(self.project_root),
                capture_output=True,
                text=True,
                timeout=300
            )
            
            success = result.returncode == 0
            
            return {
                'name': f'Specific Steps Test ({steps_str})',
                'success': success,
                'returncode': result.returncode,
                'stdout': result.stdout,
                'stderr': result.stderr
            }
        except Exception as e:
            return {
                'name': f'Specific Steps Test ({steps_str})',
                'success': False,
                'error': str(e)
            }
    
    def test_transformations(self) -> dict:
        """Test post-sync transformations"""
        self.logger.info("=" * 70)
        self.logger.info("Test: Post-Sync Transformations")
        self.logger.info("=" * 70)
        
        try:
            sys.path.insert(0, str(self.project_root / "scripts" / "production-update" / "utils"))
            from post_sync_transformer import run_transformations
            success = run_transformations(
                project_root=self.project_root,
                backup_db=True,
                restore_db=True
            )
            
            results = run_transformations(
                project_root=self.project_root,
                backup_db=True,
                restore_db=True
            )
            
            success = all(results.values()) if isinstance(results, dict) else results
            
            return {
                'name': 'Transformations Test',
                'success': success,
                'results': results if isinstance(results, dict) else {}
            }
        except Exception as e:
            return {
                'name': 'Transformations Test',
                'success': False,
                'error': str(e)
            }
    
    def test_schema_detection(self) -> dict:
        """Test schema detection"""
        self.logger.info("=" * 70)
        self.logger.info("Test: Schema Detection")
        self.logger.info("=" * 70)
        
        try:
            sys.path.insert(0, str(self.project_root / "scripts" / "production-update" / "utils"))
            from schema_detector import detect_changes
            report = detect_changes(project_root=self.project_root)
            
            report = detect_changes(project_root=self.project_root)
            
            return {
                'name': 'Schema Detection Test',
                'success': True,
                'has_changes': report.get('has_changes', False) if report else False,
                'report': report
            }
        except Exception as e:
            return {
                'name': 'Schema Detection Test',
                'success': False,
                'error': str(e)
            }
    
    def test_file_verification(self) -> dict:
        """Test file verification"""
        self.logger.info("=" * 70)
        self.logger.info("Test: File Verification")
        self.logger.info("=" * 70)
        
        try:
            sys.path.insert(0, str(self.project_root / "scripts" / "production-update" / "utils"))
            from file_verifier import verify_files
            results = verify_files(project_root=self.project_root)
            
            return {
                'name': 'File Verification Test',
                'success': True,
                'all_ok': results.get('all_ok', False) if results else False,
                'results': results
            }
        except Exception as e:
            return {
                'name': 'File Verification Test',
                'success': False,
                'error': str(e)
            }
    
    def run_all_tests(self) -> dict:
        """Run all test scenarios"""
        self.logger.info("=" * 70)
        self.logger.info("Full Process Test Suite")
        self.logger.info("=" * 70)
        self.logger.info(f"Started: {self.results['test_started']}")
        self.logger.info("")
        
        # Create snapshot
        snapshot = self.create_snapshot()
        
        try:
            # Test 1: Dry-run
            result1 = self.test_dry_run()
            self.results['scenarios'].append(result1)
            
            # Test 2: Transformations
            result2 = self.test_transformations()
            self.results['scenarios'].append(result2)
            
            # Test 3: Schema detection
            result3 = self.test_schema_detection()
            self.results['scenarios'].append(result3)
            
            # Test 4: File verification
            result4 = self.test_file_verification()
            self.results['scenarios'].append(result4)
            
            # Test 5: Specific steps (5, 6, 8, 9)
            result5 = self.test_specific_steps([5, 6, 8, 9])
            self.results['scenarios'].append(result5)
            
        finally:
            # Restore snapshot
            self.restore_snapshot(snapshot)
        
        # Generate summary
        total = len(self.results['scenarios'])
        passed = sum(1 for s in self.results['scenarios'] if s.get('success'))
        failed = total - passed
        
        self.results['summary'] = {
            'total': total,
            'passed': passed,
            'failed': failed,
            'success_rate': f"{(passed/total*100):.1f}%" if total > 0 else "0%"
        }
        
        self.results['test_completed'] = datetime.now().isoformat()
        
        # Print summary
        self.logger.info("")
        self.logger.info("=" * 70)
        self.logger.info("Test Summary")
        self.logger.info("=" * 70)
        self.logger.info(f"Total tests: {total}")
        self.logger.info(f"Passed: {passed}")
        self.logger.info(f"Failed: {failed}")
        self.logger.info(f"Success rate: {self.results['summary']['success_rate']}")
        
        # Save report
        report_file = self.project_root / "_Tmp" / "production-update-reports" / "full_process_test_report.json"
        report_file.parent.mkdir(parents=True, exist_ok=True)
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, default=str)
        
        self.logger.info(f"📄 Full report saved to: {report_file}")
        
        return self.results


def main():
    """Main entry point"""
    tester = FullProcessTester(PROJECT_ROOT)
    results = tester.run_all_tests()
    
    # Exit with error code if any tests failed
    if results['summary']['failed'] > 0:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == '__main__':
    main()


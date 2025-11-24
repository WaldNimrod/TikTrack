#!/usr/bin/env python3
"""
TikTrack Production Update Master Script
========================================

Master script that orchestrates the entire production update process.
Can run all steps or specific steps as needed.

Usage:
    python scripts/production-update/master.py                    # Run all steps
    python scripts/production-update/master.py --steps 1,3,5       # Run specific steps
    python scripts/production-update/master.py --skip 2,4          # Skip specific steps
    python scripts/production-update/master.py --dry-run           # Dry run (no changes)
    python scripts/production-update/master.py --resume             # Resume from last failure
"""

import argparse
import json
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Set

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

# Import step modules directly
import importlib.util

# Load step modules dynamically
def load_step_module(step_name):
    """Load a step module dynamically"""
    step_path = PROJECT_ROOT / "scripts" / "production-update" / "steps" / f"{step_name}.py"
    spec = importlib.util.spec_from_file_location(step_name, step_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

# Import utils
sys.path.insert(0, str(PROJECT_ROOT / "scripts" / "production-update" / "utils"))
from logger import UpdateLogger, get_logger, set_logger
from reporter import UpdateReporter, get_reporter, set_reporter
from rollback import RollbackManager

# Import step modules
# Note: Some steps may not exist - we'll handle that gracefully
def safe_load_step(step_name):
    """Safely load a step module, return None if not found"""
    try:
        return load_step_module(step_name)
    except Exception:
        return None

# Load all step modules
save_production_changes = safe_load_step("00_save_production_changes")
collect_changes = safe_load_step("01_collect_changes")
check_server = load_step_module("02_check_server")
merge_main = safe_load_step("02_merge_main")
merge_to_production = safe_load_step("03_merge_to_production")
backup_database = load_step_module("04_backup_database")
sync_code = load_step_module("05_sync_code")
stop_server = load_step_module("07_stop_server")
run_migrations = load_step_module("08_run_migrations")
fix_config = safe_load_step("07_fix_config") or safe_load_step("09_fix_config")
check_server_updates = load_step_module("10_check_server_updates")
update_server = load_step_module("11_update_server")
validate = load_step_module("08_validate")
start_server = load_step_module("13_start_server")
verify_stability = load_step_module("14_verify_server_stability")
bump_version = load_step_module("09_bump_version")
commit_push = load_step_module("10_commit_push")


# Step mapping - Updated to match new plan
STEP_MODULES = {}

# Step 1: Save production changes (optional - use collect_changes if available)
if save_production_changes:
    STEP_MODULES[1] = ('save_production_changes', save_production_changes)
elif collect_changes:
    STEP_MODULES[1] = ('collect_changes', collect_changes)

# Step 2: Check server
STEP_MODULES[2] = ('check_server', check_server)

# Step 3: Backup database
STEP_MODULES[3] = ('backup_database', backup_database)

# Step 4: Update main (use collect_changes or merge_main)
if collect_changes:
    STEP_MODULES[4] = ('update_main', collect_changes)
elif merge_main:
    STEP_MODULES[4] = ('merge_main', merge_main)

# Step 5: Merge to production
if merge_to_production:
    STEP_MODULES[5] = ('merge_to_production', merge_to_production)
elif merge_main:
    STEP_MODULES[5] = ('merge_main', merge_main)

# Step 6: Sync code
STEP_MODULES[6] = ('sync_code', sync_code)

# Step 7: Stop server
STEP_MODULES[7] = ('stop_server', stop_server)

# Step 8: Run migrations
STEP_MODULES[8] = ('run_migrations', run_migrations)

# Step 9: Fix config
if fix_config:
    STEP_MODULES[9] = ('fix_config', fix_config)

# Step 10: Check server updates
STEP_MODULES[10] = ('check_server_updates', check_server_updates)

# Step 11: Update server
STEP_MODULES[11] = ('update_server', update_server)

# Step 12: Validate
STEP_MODULES[12] = ('validate', validate)

# Step 13: Start server
STEP_MODULES[13] = ('start_server', start_server)

# Step 14: Verify stability
STEP_MODULES[14] = ('verify_stability', verify_stability)

# Step 15: Bump version
STEP_MODULES[15] = ('bump_version', bump_version)

# Step 16: Commit and push
STEP_MODULES[16] = ('commit_push', commit_push)


class UpdateMaster:
    """Master orchestrator for production update"""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.config_file = project_root / "scripts" / "production-update" / "config" / "steps_config.json"
        self.state_file = project_root / "_Tmp" / "production-update-state.json"
        self.config = self._load_config()
        self.logger = UpdateLogger()
        self.reporter = UpdateReporter()
        self.rollback_manager = RollbackManager()
        
        # Set global instances
        set_logger(self.logger)
        set_reporter(self.reporter)
        
        self.state: Dict = {}
        self._load_state()
    
    def _load_config(self) -> Dict:
        """Load steps configuration"""
        if self.config_file.exists():
            with open(self.config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    
    def _load_state(self):
        """Load saved state"""
        if self.state_file.exists():
            try:
                with open(self.state_file, 'r', encoding='utf-8') as f:
                    self.state = json.load(f)
            except Exception:
                self.state = {}
        else:
            self.state = {}
    
    def _save_state(self):
        """Save current state"""
        self.state_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Convert Path objects to strings for JSON serialization
        def convert_paths(obj):
            if isinstance(obj, Path):
                return str(obj)
            elif isinstance(obj, dict):
                return {k: convert_paths(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_paths(item) for item in obj]
            elif isinstance(obj, tuple):
                return tuple(convert_paths(item) for item in obj)
            else:
                return obj
        
        serializable_state = convert_paths(self.state)
        with open(self.state_file, 'w', encoding='utf-8') as f:
            json.dump(serializable_state, f, indent=2)
    
    def _get_steps_to_run(self, requested_steps: Optional[List[int]] = None,
                         skip_steps: Optional[List[int]] = None) -> List[int]:
        """Determine which steps to run"""
        max_step = max(STEP_MODULES.keys()) if STEP_MODULES else 16
        if requested_steps:
            steps = [s for s in requested_steps if 1 <= s <= max_step and s in STEP_MODULES]
        else:
            steps = list(STEP_MODULES.keys())
        
        if skip_steps:
            steps = [s for s in steps if s not in skip_steps]
        
        return sorted(steps)
    
    def run_step(self, step_number: int, dry_run: bool = False, previous_result: Optional[Dict] = None) -> Dict:
        """Run a single step
        
        Args:
            step_number: Step number to run
            dry_run: If True, don't make changes
            previous_result: Result from previous step (for passing data between steps)
        """
        if step_number not in STEP_MODULES:
            return {'success': False, 'error': f'Invalid step number: {step_number}'}
        
        step_name, step_module = STEP_MODULES[step_number]
        step_config = self.config.get('steps', {}).get(f"{step_number:02d}_{step_name}", {})
        
        self.logger.step_start(step_config.get('name', step_name), step_number)
        
        start_time = time.time()
        
        try:
            # Run step - pass previous result if available
            if previous_result and hasattr(step_module, 'run_step'):
                # Try to pass previous result if step accepts it
                import inspect
                sig = inspect.signature(step_module.run_step)
                if 'server_status' in sig.parameters or 'update_report' in sig.parameters or 'server_pid' in sig.parameters:
                    # Step accepts previous result
                    if 'server_status' in sig.parameters:
                        result = step_module.run_step(dry_run=dry_run, server_status=previous_result)
                    elif 'update_report' in sig.parameters:
                        result = step_module.run_step(dry_run=dry_run, update_report=previous_result)
                    elif 'server_pid' in sig.parameters:
                        result = step_module.run_step(dry_run=dry_run, server_pid=previous_result.get('pid'))
                    else:
                        result = step_module.run_step(dry_run=dry_run)
                else:
                    result = step_module.run_step(dry_run=dry_run)
            else:
                result = step_module.run_step(dry_run=dry_run)
            
            duration = time.time() - start_time
            success = result.get('success', False)
            
            # Report step
            self.reporter.add_step(
                step_name,
                step_number,
                success,
                duration,
                result
            )
            
            # Save state
            self.state[f'step_{step_number}'] = {
                'completed': success,
                'timestamp': datetime.now().isoformat(),
                'result': result
            }
            self._save_state()
            
            self.logger.step_end(step_name, success)
            
            return result
            
        except Exception as e:
            duration = time.time() - start_time
            self.logger.error(f"  ❌ Step {step_number} failed with exception: {e}")
            self.reporter.add_step(step_name, step_number, False, duration, {'error': str(e)})
            import traceback
            traceback.print_exc()
            return {'success': False, 'error': str(e)}
    
    def run(self, steps: Optional[List[int]] = None, skip: Optional[List[int]] = None,
            dry_run: bool = False, resume: bool = False, create_snapshot: bool = True) -> bool:
        """
        Run the update process
        
        Args:
            steps: Specific steps to run (None = all)
            skip: Steps to skip
            dry_run: If True, don't make changes
            resume: Resume from last failure
            create_snapshot: Create rollback snapshot before starting
        
        Returns:
            True if all steps succeeded
        """
        self.logger.info("=" * 70)
        self.logger.info("TikTrack Production Update Master Script")
        self.logger.info("=" * 70)
        self.logger.info(f"Started: {datetime.now().isoformat()}")
        if dry_run:
            self.logger.info("  [DRY RUN MODE - No changes will be made]")
        self.logger.info("")
        
        # Create snapshot
        if create_snapshot and not dry_run:
            snapshot_id = self.rollback_manager.create_snapshot("pre-update")
            self.state['snapshot_id'] = snapshot_id
            self._save_state()
        
        # Determine steps to run
        steps_to_run = self._get_steps_to_run(steps, skip)
        
        if resume and self.state.get('last_failed_step'):
            # Resume from last failure
            last_failed = self.state['last_failed_step']
            self.logger.info(f"🔄 Resuming from step {last_failed}")
            steps_to_run = [s for s in steps_to_run if s >= last_failed]
        
        self.logger.info(f"📋 Steps to run: {', '.join(map(str, steps_to_run))}")
        self.logger.info("")
        
        # Run steps
        all_success = True
        previous_result = None
        for step_num in steps_to_run:
            result = self.run_step(step_num, dry_run, previous_result=previous_result)
            
            # Pass result to next step if needed
            previous_result = result
            
            if not result.get('success'):
                all_success = False
                self.state['last_failed_step'] = step_num
                self._save_state()
                
                if not dry_run:
                    self.logger.error(f"\n❌ Step {step_num} failed. Process stopped.")
                    self.logger.info("💡 You can:")
                    self.logger.info("  1. Fix the issue and run: --resume")
                    self.logger.info("  2. Rollback: python scripts/production-update/utils/rollback.py")
                    break
        
        # Finalize
        self.reporter.finalize(all_success)
        self.reporter.print_summary()
        
        # Save report
        if not dry_run:
            report_file = self.reporter.save_json()
            self.logger.info(f"📄 Full report saved to: {report_file}")
        
        if all_success:
            self.state['last_failed_step'] = None
            self._save_state()
            self.logger.info("\n🎉 Production update completed successfully!")
        else:
            self.logger.error("\n❌ Production update failed!")
        
        return all_success


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='TikTrack Production Update Master Script',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run all steps
  python scripts/production-update/master.py

  # Run specific steps
  python scripts/production-update/master.py --steps 1,3,5

  # Skip specific steps
  python scripts/production-update/master.py --skip 2,4

  # Dry run (no changes)
  python scripts/production-update/master.py --dry-run

  # Resume from last failure
  python scripts/production-update/master.py --resume
        """
    )
    
    parser.add_argument(
        '--steps',
        type=str,
        help='Comma-separated list of step numbers to run (e.g., 1,3,5)'
    )
    
    parser.add_argument(
        '--skip',
        type=str,
        help='Comma-separated list of step numbers to skip (e.g., 2,4)'
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Dry run mode - show what would be done without making changes'
    )
    
    parser.add_argument(
        '--resume',
        action='store_true',
        help='Resume from last failed step'
    )
    
    parser.add_argument(
        '--no-snapshot',
        action='store_true',
        help='Skip creating rollback snapshot'
    )
    
    args = parser.parse_args()
    
    # Parse steps
    steps = None
    if args.steps:
        try:
            steps = [int(s.strip()) for s in args.steps.split(',')]
        except ValueError:
            print("❌ Invalid steps format. Use comma-separated numbers (e.g., 1,3,5)")
            sys.exit(1)
    
    skip = None
    if args.skip:
        try:
            skip = [int(s.strip()) for s in args.skip.split(',')]
        except ValueError:
            print("❌ Invalid skip format. Use comma-separated numbers (e.g., 2,4)")
            sys.exit(1)
    
    # Run master
    master = UpdateMaster(PROJECT_ROOT)
    success = master.run(
        steps=steps,
        skip=skip,
        dry_run=args.dry_run,
        resume=args.resume,
        create_snapshot=not args.no_snapshot
    )
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()


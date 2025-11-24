#!/usr/bin/env python3
"""
Update Reporter
===============

Provides detailed reporting on the update process including:
- Summary of changes
- List of updated/new/deleted files
- Warnings and issues
- Update history
"""

import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any

# Import logger - handle both relative and absolute imports
try:
    from .logger import get_logger
except ImportError:
    # Fallback for direct execution
    from logger import get_logger


class UpdateReporter:
    """Reporter for production update process"""
    
    def __init__(self, report_dir: Optional[Path] = None):
        self.report_dir = report_dir or Path("_Tmp/production-update-reports")
        self.report_dir.mkdir(parents=True, exist_ok=True)
        
        self.logger = get_logger()
        self.report: Dict[str, Any] = {
            'start_time': datetime.now().isoformat(),
            'steps': [],
            'files_updated': [],
            'files_new': [],
            'files_deleted': [],
            'warnings': [],
            'errors': [],
            'summary': {}
        }
    
    def add_step(self, step_name: str, step_number: int, success: bool, 
                 duration: float, details: Optional[Dict] = None):
        """Add step execution to report"""
        step_info = {
            'number': step_number,
            'name': step_name,
            'success': success,
            'duration_seconds': duration,
            'timestamp': datetime.now().isoformat(),
            'details': details or {}
        }
        self.report['steps'].append(step_info)
        
        if not success:
            self.report['errors'].append({
                'message': f"Step {step_number} ({step_name}) failed",
                'step': step_name,
                'timestamp': datetime.now().isoformat()
            })
    
    def add_file_updated(self, file_path: str, details: Optional[Dict] = None):
        """Add updated file to report"""
        file_info = {
            'path': file_path,
            'timestamp': datetime.now().isoformat(),
            'details': details or {}
        }
        self.report['files_updated'].append(file_info)
    
    def add_file_new(self, file_path: str, details: Optional[Dict] = None):
        """Add new file to report"""
        file_info = {
            'path': file_path,
            'timestamp': datetime.now().isoformat(),
            'details': details or {}
        }
        self.report['files_new'].append(file_info)
    
    def add_file_deleted(self, file_path: str, reason: str = ""):
        """Add deleted file to report"""
        file_info = {
            'path': file_path,
            'timestamp': datetime.now().isoformat(),
            'reason': reason
        }
        self.report['files_deleted'].append(file_info)
    
    def add_warning(self, warning: str, step: Optional[str] = None):
        """Add warning to report"""
        warning_info = {
            'message': warning,
            'step': step,
            'timestamp': datetime.now().isoformat()
        }
        self.report['warnings'].append(warning_info)
        self.logger.warning(warning)
    
    def add_error(self, error: str, step: Optional[str] = None):
        """Add error to report"""
        error_info = {
            'message': error,
            'step': step,
            'timestamp': datetime.now().isoformat()
        }
        self.report['errors'].append(error_info)
        self.logger.error(error)
    
    def finalize(self, success: bool):
        """Finalize report"""
        self.report['end_time'] = datetime.now().isoformat()
        self.report['success'] = success
        
        # Calculate summary
        start = datetime.fromisoformat(self.report['start_time'])
        end = datetime.fromisoformat(self.report['end_time'])
        duration = (end - start).total_seconds()
        
        self.report['summary'] = {
            'total_duration_seconds': duration,
            'steps_completed': len([s for s in self.report['steps'] if s['success']]),
            'steps_failed': len([s for s in self.report['steps'] if not s['success']]),
            'files_updated_count': len(self.report['files_updated']),
            'files_new_count': len(self.report['files_new']),
            'files_deleted_count': len(self.report['files_deleted']),
            'warnings_count': len(self.report['warnings']),
            'errors_count': len(self.report['errors'])
        }
    
    def save_json(self) -> Path:
        """Save report as JSON"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_file = self.report_dir / f"update_report_{timestamp}.json"
        
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
        
        serializable_report = convert_paths(self.report)
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(serializable_report, f, indent=2, ensure_ascii=False)
        
        return report_file
    
    def print_summary(self):
        """Print summary to console"""
        summary = self.report['summary']
        
        self.logger.info("\n" + "="*70)
        self.logger.info("UPDATE SUMMARY")
        self.logger.info("="*70)
        self.logger.info(f"Duration: {summary['total_duration_seconds']:.1f} seconds")
        self.logger.info(f"Steps completed: {summary['steps_completed']}/{len(self.report['steps'])}")
        self.logger.info(f"Files updated: {summary['files_updated_count']}")
        self.logger.info(f"Files new: {summary['files_new_count']}")
        self.logger.info(f"Files deleted: {summary['files_deleted_count']}")
        self.logger.info(f"Warnings: {summary['warnings_count']}")
        self.logger.info(f"Errors: {summary['errors_count']}")
        
        if self.report['warnings']:
            self.logger.info("\n⚠️  WARNINGS:")
            for warning in self.report['warnings']:
                self.logger.info(f"  - {warning['message']}")
        
        if self.report['errors']:
            self.logger.info("\n❌ ERRORS:")
            for error in self.report['errors']:
                self.logger.info(f"  - {error['message']}")
        
        self.logger.info("="*70 + "\n")


# Global reporter instance
_reporter_instance: Optional[UpdateReporter] = None


def get_reporter() -> UpdateReporter:
    """Get global reporter instance"""
    global _reporter_instance
    if _reporter_instance is None:
        _reporter_instance = UpdateReporter()
    return _reporter_instance


def set_reporter(reporter: UpdateReporter):
    """Set global reporter instance"""
    global _reporter_instance
    _reporter_instance = reporter


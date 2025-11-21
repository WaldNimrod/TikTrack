#!/usr/bin/env python3
"""
Step 05: Schema & Data Check
=============================

Detects schema and data changes between development and production.
"""

import json
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

# Import utils
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "scripts" / "production-update" / "utils"))
from logger import get_logger
from reporter import get_reporter
from schema_detector import detect_changes


def run_step(dry_run: bool = False) -> dict:
    """
    Check for schema and data changes
    
    Returns:
        Dict with step results
    """
    logger = get_logger()
    reporter = get_reporter()
    
    logger.step_start("Schema & Data Check", 5)
    
    project_root = Path(__file__).parent.parent.parent.parent
    
    if dry_run:
        logger.info("  [DRY RUN] Would check for schema and data changes")
        return {'success': True, 'dry_run': True}
    
    try:
        logger.info("  🔍 Detecting schema and data changes...")
        
        report = detect_changes(project_root=project_root)
        
        # Log findings
        if report.get('has_changes'):
            logger.warning("  ⚠️  Changes detected between dev and production")
            
            # Schema changes
            schema = report.get('schema', {})
            if schema.get('missing_tables'):
                logger.warning(f"    Missing tables: {', '.join(schema['missing_tables'])}")
            if schema.get('table_diffs'):
                logger.warning(f"    Table differences: {len(schema['table_diffs'])} tables")
            if schema.get('missing_indexes'):
                logger.warning(f"    Missing indexes: {', '.join(schema['missing_indexes'])}")
            
            # Reference data changes
            ref_data = report.get('reference_data', {})
            if ref_data.get('missing_records'):
                for table, count in ref_data['missing_records'].items():
                    logger.info(f"    {table}: {count} missing records")
            if ref_data.get('changed_records'):
                for table, count in ref_data['changed_records'].items():
                    logger.info(f"    {table}: {count} changed records")
            
            # Preferences changes
            preferences = report.get('preferences', {})
            if preferences.get('missing_records') or preferences.get('changed_records'):
                logger.warning("    System preferences have changes")
            
            # Groups changes (CRITICAL!)
            groups = report.get('groups', {})
            if groups.get('missing_records') or groups.get('changed_records'):
                logger.error("    ⚠️  CRITICAL: Groups have changes - requires approval!")
                reporter.add_error("Groups changes detected - requires explicit approval", "schema_check")
        else:
            logger.info("  ✅ No changes detected")
        
        # Critical changes
        critical = report.get('critical_changes', [])
        if critical:
            for change in critical:
                logger.error(f"    ❌ {change}")
        
        # Save report
        report_file = project_root / "_Tmp" / "production-update-reports" / "schema_check_report.json"
        report_file.parent.mkdir(parents=True, exist_ok=True)
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, default=str)
        
        logger.info(f"  📄 Report saved to: {report_file}")
        
        # Return success even if changes detected (they'll be handled in sync step)
        return {
            'success': True,
            'has_changes': report.get('has_changes', False),
            'critical_changes': critical,
            'report': report
        }
        
    except Exception as e:
        logger.error(f"  ❌ Error during schema check: {e}")
        reporter.add_error(f"Schema check error: {e}", "schema_check")
        return {'success': False, 'error': str(e)}


if __name__ == '__main__':
    result = run_step()
    sys.exit(0 if result.get('success') else 1)



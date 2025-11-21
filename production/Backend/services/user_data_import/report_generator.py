"""
Report Generator for User Data Import

Generates detailed reports for import sessions and saves them to user-specific directories.
Allows users to download comprehensive reports after import completion.

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-26
"""

import os
import json
from datetime import datetime
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class ImportReportGenerator:
    """
    Generates detailed import reports and manages user report directories.
    """
    
    def __init__(self, base_reports_dir: str = "Backend/reports/user_imports"):
        """
        Initialize the report generator.
        
        Args:
            base_reports_dir: Base directory for storing user reports
        """
        self.base_reports_dir = base_reports_dir
        self.ensure_base_directory()
    
    def ensure_base_directory(self):
        """Ensure the base reports directory exists."""
        if not os.path.exists(self.base_reports_dir):
            os.makedirs(self.base_reports_dir, exist_ok=True)
    
    def get_user_report_dir(self, user_id: int) -> str:
        """
        Get the report directory for a specific user.
        
        Args:
            user_id: User ID
            
        Returns:
            str: Path to user's report directory
        """
        user_dir = os.path.join(self.base_reports_dir, f"user_{user_id}")
        if not os.path.exists(user_dir):
            os.makedirs(user_dir, exist_ok=True)
        return user_dir
    
    def generate_import_report(self, session_id: int, user_id: int, 
                              analysis_results: Dict[str, Any],
                              preview_data: Dict[str, Any] = None,
                              execution_results: Dict[str, Any] = None) -> str:
        """
        Generate a comprehensive import report.
        
        Args:
            session_id: Import session ID
            user_id: User ID
            analysis_results: Detailed analysis results
            preview_data: Preview data (optional)
            execution_results: Execution results (optional)
            
        Returns:
            str: Path to the generated report file
        """
        try:
            user_dir = self.get_user_report_dir(user_id)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            report_filename = f"import_report_{session_id}_{timestamp}.json"
            report_path = os.path.join(user_dir, report_filename)
            
            # Generate comprehensive report
            report = {
                "session_info": {
                    "session_id": session_id,
                    "user_id": user_id,
                    "generated_at": datetime.now().isoformat(),
                    "report_version": "1.0"
                },
                "analysis_results": analysis_results,
                "preview_data": preview_data,
                "execution_results": execution_results,
                "summary": self._generate_summary(analysis_results, preview_data, execution_results)
            }
            
            # Save report to file
            with open(report_path, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Generated import report: {report_path}")
            return report_path
            
        except Exception as e:
            logger.error(f"Failed to generate import report: {str(e)}")
            raise
    
    def save_import_file(self, user_id: int, session_id: int, 
                        file_content: str, file_name: str, 
                        status: str = "completed") -> str:
        """
        Save the original import file to the server with timestamp.
        
        Args:
            user_id: User ID
            session_id: Import session ID
            file_content: Original file content
            file_name: Original file name
            status: Import status (completed, failed, cancelled)
            
        Returns:
            str: Path to the saved file
        """
        try:
            user_dir = self.get_user_report_dir(user_id)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Create filename with timestamp and status
            name, ext = os.path.splitext(file_name)
            saved_filename = f"{name}_session_{session_id}_{status}_{timestamp}{ext}"
            file_path = os.path.join(user_dir, saved_filename)
            
            # Save file content
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(file_content)
            
            logger.info(f"Saved import file: {file_path}")
            return file_path
            
        except Exception as e:
            logger.error(f"Failed to save import file: {str(e)}")
            raise
    
    def _generate_summary(self, analysis_results: Dict[str, Any],
                         preview_data: Dict[str, Any] = None,
                         execution_results: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Generate a summary of the import process.
        
        Args:
            analysis_results: Analysis results
            preview_data: Preview data
            execution_results: Execution results
            
        Returns:
            Dict[str, Any]: Summary information
        """
        summary = {
            "total_records": analysis_results.get('total_records', 0),
            "valid_records": analysis_results.get('valid_records', 0),
            "invalid_records": analysis_results.get('invalid_records', 0),
            "duplicate_records": analysis_results.get('duplicate_records', 0),
            "success_rate": 0,
            "import_status": "pending",
            "task_type": analysis_results.get('task_type', 'executions')
        }

        task_type = summary['task_type']

        if task_type == 'cashflows':
            summary['cashflow_summary'] = analysis_results.get('cashflow_summary', {})
            summary['cashflow_records'] = analysis_results.get('cashflow_records', summary['cashflow_summary'].get('record_count', 0))
            summary['missing_accounts'] = analysis_results.get('missing_accounts', [])
            summary['currency_issues'] = analysis_results.get('currency_issues', [])
        elif task_type == 'account_reconciliation':
            account_validation_results = analysis_results.get('account_validation_results', {})
            summary['missing_accounts'] = account_validation_results.get('missing_accounts', analysis_results.get('missing_accounts', []))
            summary['base_currency_mismatches'] = account_validation_results.get('base_currency_mismatches', analysis_results.get('base_currency_mismatches', []))
            summary['entitlement_warnings'] = account_validation_results.get('entitlement_warnings', analysis_results.get('entitlement_warnings', []))
            summary['missing_documents_report'] = account_validation_results.get('missing_documents_report', analysis_results.get('missing_documents_report', []))
            summary['account_validation_results'] = account_validation_results
        
        if analysis_results.get('total_records', 0) > 0:
            summary["success_rate"] = (analysis_results.get('valid_records', 0) / 
                                     analysis_results.get('total_records', 1)) * 100
        
        if preview_data:
            summary["records_to_import"] = len(preview_data.get('records_to_import', []))
            summary["records_to_skip"] = len(preview_data.get('records_to_skip', []))
        
        if execution_results:
            summary["import_status"] = "completed"
            summary["imported_records"] = execution_results.get('imported_records', 0)
            summary["skipped_records"] = execution_results.get('skipped_records', 0)
        
        return summary
    
    def get_user_reports(self, user_id: int) -> List[Dict[str, Any]]:
        """
        Get all reports for a specific user.
        
        Args:
            user_id: User ID
            
        Returns:
            List[Dict[str, Any]]: List of user reports with metadata
        """
        try:
            user_dir = self.get_user_report_dir(user_id)
            reports = []
            
            if os.path.exists(user_dir):
                for filename in os.listdir(user_dir):
                    if filename.startswith("import_report_") and filename.endswith(".json"):
                        file_path = os.path.join(user_dir, filename)
                        file_stat = os.stat(file_path)
                        
                        # Load report metadata
                        try:
                            with open(file_path, 'r', encoding='utf-8') as f:
                                report_data = json.load(f)
                            
                            reports.append({
                                "filename": filename,
                                "session_id": report_data.get('session_info', {}).get('session_id'),
                                "generated_at": report_data.get('session_info', {}).get('generated_at'),
                                "file_size": file_stat.st_size,
                                "summary": report_data.get('summary', {})
                            })
                        except Exception as e:
                            logger.warning(f"Failed to load report metadata for {filename}: {str(e)}")
            
            # Sort by generation time (newest first)
            reports.sort(key=lambda x: x.get('generated_at', ''), reverse=True)
            return reports
            
        except Exception as e:
            logger.error(f"Failed to get user reports: {str(e)}")
            return []
    
    def get_report_file_path(self, user_id: int, filename: str) -> str:
        """
        Get the full path to a specific report file.
        
        Args:
            user_id: User ID
            filename: Report filename
            
        Returns:
            str: Full path to the report file
        """
        user_dir = self.get_user_report_dir(user_id)
        return os.path.join(user_dir, filename)
    
    def cleanup_old_reports(self, user_id: int, days_to_keep: int = 30):
        """
        Clean up old reports for a user.
        
        Args:
            user_id: User ID
            days_to_keep: Number of days to keep reports
        """
        try:
            user_dir = self.get_user_report_dir(user_id)
            if not os.path.exists(user_dir):
                return
            
            cutoff_time = datetime.now().timestamp() - (days_to_keep * 24 * 60 * 60)
            
            for filename in os.listdir(user_dir):
                if filename.startswith("import_report_") and filename.endswith(".json"):
                    file_path = os.path.join(user_dir, filename)
                    if os.path.getmtime(file_path) < cutoff_time:
                        os.remove(file_path)
                        logger.info(f"Cleaned up old report: {filename}")
                        
        except Exception as e:
            logger.error(f"Failed to cleanup old reports: {str(e)}")

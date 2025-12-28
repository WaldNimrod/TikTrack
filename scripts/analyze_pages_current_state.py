#!/usr/bin/env python3
"""
Code Review - Current State Analysis Script
==========================================

סורק את כל 45+ עמודי המערכת ומזהה בעיות לפי דוח Code Review:
1. שימוש ב-async במקום defer
2. כפילויות CSS/JS
3. הגדרות כפולות של showModalSafe
4. מסלולי API ללא אימות

@version 1.0.0
@created December 2025
@updated December 2025
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Set, Tuple
from dataclasses import dataclass, asdict

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
TRADING_UI = PROJECT_ROOT / "trading-ui"
BACKEND_ROUTES = PROJECT_ROOT / "Backend" / "routes" / "api"
REPORTS_DIR = PROJECT_ROOT / "reports"

# Alternative paths for pages that might be in subdirectories
PAGE_ALTERNATIVES = {
    'portfolio_state_page.html': 'mockups/daily-snapshots/portfolio_state_page.html',
    'trade_history_page.html': 'mockups/daily-snapshots/trade_history_page.html',
    'tradingview_test_page.html': 'mockups/daily-snapshots/tradingview_test_page.html'
}

# All pages from PAGES_LIST.md
MAIN_PAGES = [
    'index.html', 'trades.html', 'trade_plans.html', 'alerts.html',
    'tickers.html', 'ticker_dashboard.html', 'trading_accounts.html',
    'executions.html', 'data_import.html', 'cash_flows.html', 'notes.html',
    'research.html', 'portfolio_state_page.html', 'trade_history_page.html',
    'trading_journal.html', 'ai_analysis.html', 'watch_list.html',
    'preferences.html', 'user_profile.html'
]

TECHNICAL_PAGES = [
    'db_display.html', 'db_extradata.html', 'constraints.html',
    'background_tasks.html', 'server_monitor.html', 'system_management.html',
    'notifications_center.html', 'css_management.html', 'tradingview_test_page.html',
    'dynamic_colors_display.html', 'designs.html'
]

SECONDARY_PAGES = [
    'external_data_dashboard.html', 'chart_management.html', 'crud_testing_dashboard.html'
]

AUTH_PAGES = [
    'register.html', 'forgot_password.html', 'reset_password.html'
]

DEV_TOOLS_PAGES = [
    'button_color_mapping.html', 'button_color_mapping_simple.html',
    'preferences_groups_management.html', 'tag_management.html',
    'cache_management.html', 'code_quality_dashboard.html', 'init_system_management.html'
]

MOCKUP_PAGES = [
    'conditions_modals.html', 'conditions_test.html',
    'tradingview_widgets_showcase.html', 'trades_formatted.html'
]

# External pages (optional)
EXTERNAL_PAGES = [
    'external_data_integration_client/pages/test_external_data.html',
    'external_data_integration_client/pages/test_models.html'
]

ALL_PAGES = MAIN_PAGES + TECHNICAL_PAGES + SECONDARY_PAGES + AUTH_PAGES + DEV_TOOLS_PAGES + MOCKUP_PAGES

@dataclass
class PageAnalysis:
    """Analysis results for a single page"""
    page_name: str
    file_path: str
    category: str
    issues: Dict[str, List[str]]
    scripts_count: int
    async_scripts: List[str]
    duplicate_css: List[str]
    show_modal_safe_definitions: int
    has_async_critical_scripts: bool

    def to_dict(self):
        return asdict(self)

class CurrentStateAnalyzer:
    def __init__(self):
        self.results = {}
        self.total_pages = 0
        self.pages_with_issues = 0

    def analyze_all_pages(self) -> Dict:
        """Analyze all pages and return comprehensive report"""
        print("🔍 Starting comprehensive page analysis...")
        print(f"📊 Total pages to analyze: {len(ALL_PAGES)}")

        for page in ALL_PAGES:
            try:
                result = self.analyze_page(page)
                self.results[page] = result
                self.total_pages += 1

                if result.issues:
                    self.pages_with_issues += 1

            except Exception as e:
                print(f"❌ Error analyzing {page}: {e}")
                # Add error result
                self.results[page] = PageAnalysis(
                    page_name=page,
                    file_path=str(TRADING_UI / page),
                    category="unknown",
                    issues={"errors": [str(e)]},
                    scripts_count=0,
                    async_scripts=[],
                    duplicate_css=[],
                    show_modal_safe_definitions=0,
                    has_async_critical_scripts=False
                )

        # Analyze API routes
        api_issues = self.analyze_api_routes()

        return {
            "summary": {
                "total_pages": self.total_pages,
                "pages_with_issues": self.pages_with_issues,
                "main_pages": len(MAIN_PAGES),
                "technical_pages": len(TECHNICAL_PAGES),
                "secondary_pages": len(SECONDARY_PAGES),
                "auth_pages": len(AUTH_PAGES),
                "dev_tools_pages": len(DEV_TOOLS_PAGES),
                "mockup_pages": len(MOCKUP_PAGES),
                "external_pages": len(EXTERNAL_PAGES)
            },
            "page_results": {k: v.to_dict() for k, v in self.results.items()},
            "api_issues": api_issues,
            "critical_findings": self.get_critical_findings()
        }

    def analyze_page(self, page_name: str) -> PageAnalysis:
        """Analyze a single page"""
        file_path = TRADING_UI / page_name

        # Try alternative path if main path doesn't exist
        if not file_path.exists() and page_name in PAGE_ALTERNATIVES:
            alt_path = PAGE_ALTERNATIVES[page_name]
            file_path = TRADING_UI / alt_path
            print(f"🔄 Trying alternative path for {page_name}: {alt_path}")

        # Determine category
        if page_name in MAIN_PAGES:
            category = "main"
        elif page_name in TECHNICAL_PAGES:
            category = "technical"
        elif page_name in SECONDARY_PAGES:
            category = "secondary"
        elif page_name in AUTH_PAGES:
            category = "auth"
        elif page_name in DEV_TOOLS_PAGES:
            category = "dev-tools"
        elif page_name in MOCKUP_PAGES:
            category = "mockup"
        else:
            category = "external"

        issues = {}
        async_scripts = []
        duplicate_css = []
        show_modal_safe_definitions = 0
        has_async_critical_scripts = False

        if not file_path.exists():
            issues["file_not_found"] = [f"File does not exist: {file_path}"]
            return PageAnalysis(
                page_name=page_name,
                file_path=str(file_path),
                category=category,
                issues=issues,
                scripts_count=0,
                async_scripts=async_scripts,
                duplicate_css=duplicate_css,
                show_modal_safe_definitions=show_modal_safe_definitions,
                has_async_critical_scripts=has_async_critical_scripts
            )

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Count total scripts
            scripts_count = len(re.findall(r'<script[^>]*src="[^"]*"[^>]*></script>', content, re.IGNORECASE))

            # Find async scripts
            async_pattern = r'<script[^>]*\sasync[^>]*src="([^"]*)"[^>]*></script>'
            async_matches = re.findall(async_pattern, content, re.IGNORECASE)
            async_scripts.extend(async_matches)

            # Check for critical scripts with async (problematic)
            critical_async = []
            for script_src in async_matches:
                if any(critical in script_src.lower() for critical in [
                    'api-config', 'global-favicon', 'cache-sync-manager',
                    'error-handlers', 'unified-cache-manager', 'header-system',
                    'ui-utils', 'page-utils', 'translation-utils', 'button-icons',
                    'event-handler-manager', 'button-system-init', 'color-scheme-system',
                    'tables.js', 'data-utils.js', 'pagination-system.js',
                    'modal-manager-v2.js', 'crud-response-handler.js'
                ]):
                    critical_async.append(script_src)
                    has_async_critical_scripts = True

            if critical_async:
                issues["critical_async_scripts"] = critical_async

            # Find duplicate CSS
            css_pattern = r'<link[^>]*href="([^"]*\.css[^"]*)"[^>]*>'
            css_links = re.findall(css_pattern, content, re.IGNORECASE)
            css_counts = {}
            for css in css_links:
                css_counts[css] = css_counts.get(css, 0) + 1

            for css, count in css_counts.items():
                if count > 1:
                    duplicate_css.append(f"{css} (appears {count} times)")

            if duplicate_css:
                issues["duplicate_css"] = duplicate_css

            # Find showModalSafe definitions
            show_modal_pattern = r'showModalSafe\s*=\s*async\s*\(modalId'
            show_modal_matches = re.findall(show_modal_pattern, content)
            show_modal_safe_definitions = len(show_modal_matches)

            if show_modal_safe_definitions > 1:
                issues["multiple_showModalSafe"] = [f"Found {show_modal_safe_definitions} definitions"]
            elif show_modal_safe_definitions == 0:
                # Check if it's using the global one
                pass  # We'll check this later

            # Additional issues
            if async_scripts and not issues.get("critical_async_scripts"):
                issues["async_scripts"] = async_scripts[:5]  # Show first 5

        except Exception as e:
            issues["parsing_error"] = [str(e)]

        return PageAnalysis(
            page_name=page_name,
            file_path=str(file_path),
            category=category,
            issues=issues,
            scripts_count=scripts_count,
            async_scripts=async_scripts,
            duplicate_css=duplicate_css,
            show_modal_safe_definitions=show_modal_safe_definitions,
            has_async_critical_scripts=has_async_critical_scripts
        )

    def analyze_api_routes(self) -> Dict[str, List[str]]:
        """Analyze API routes for authentication issues"""
        issues = {}

        # Check trades.py for the specific routes mentioned in the report
        trades_file = BACKEND_ROUTES / "trades.py"
        if trades_file.exists():
            try:
                with open(trades_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Check for pending-plan routes
                pending_assignments_pattern = r'@trades_bp\.route\([^}]*pending-plan/assignments'
                pending_creations_pattern = r'@trades_bp\.route\([^}]*pending-plan/creations'

                assignments_match = re.search(pending_assignments_pattern, content, re.MULTILINE | re.DOTALL)
                creations_match = re.search(pending_creations_pattern, content, re.MULTILINE | re.DOTALL)

                if assignments_match:
                    # Check if require_authentication is present near this route (before or after)
                    route_start = assignments_match.start()
                    route_end = assignments_match.end()

                    # Check 500 chars before and 200 chars after the route
                    search_area = content[max(0, route_start-500):route_end+200]
                    if '@require_authentication()' not in search_area:
                        issues["missing_auth_pending_plan_assignments"] = ["/pending-plan/assignments route missing @require_authentication()"]

                if creations_match:
                    # Check if require_authentication is present near this route (before or after)
                    route_start = creations_match.start()
                    route_end = creations_match.end()

                    # Check 500 chars before and 200 chars after the route
                    search_area = content[max(0, route_start-500):route_end+200]
                    if '@require_authentication()' not in search_area:
                        issues["missing_auth_pending_plan_creations"] = ["/pending-plan/creations route missing @require_authentication()"]

            except Exception as e:
                issues["api_analysis_error"] = [f"Error analyzing trades.py: {e}"]

        return issues

    def get_critical_findings(self) -> Dict[str, any]:
        """Get critical findings summary"""
        critical_pages = []
        pages_with_critical_async = []
        pages_with_multiple_modals = []
        api_issues = []

        for page_name, analysis in self.results.items():
            if analysis.has_async_critical_scripts:
                pages_with_critical_async.append(page_name)

            if analysis.show_modal_safe_definitions > 1:
                pages_with_multiple_modals.append(page_name)

            if analysis.issues:
                critical_pages.append(page_name)

        return {
            "pages_with_critical_async_scripts": pages_with_critical_async,
            "pages_with_multiple_modal_definitions": pages_with_multiple_modals,
            "total_critical_pages": len(critical_pages),
            "percentage_with_issues": f"{(len(critical_pages) / self.total_pages * 100):.1f}%" if self.total_pages > 0 else "0%"
        }

def main():
    """Main function"""
    print("🚀 Code Review - Current State Analysis")
    print("=" * 50)

    analyzer = CurrentStateAnalyzer()
    results = analyzer.analyze_all_pages()

    # Save results
    output_file = REPORTS_DIR / "code_review_current_state_analysis.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    # Print summary
    summary = results["summary"]
    critical = results["critical_findings"]

    print(f"\n📊 Analysis Complete")
    print(f"Total pages analyzed: {summary['total_pages']}")
    print(f"Pages with issues: {summary['pages_with_issues']}")
    print(f"Percentage with issues: {critical['percentage_with_issues']}")
    print(f"Pages with critical async scripts: {len(critical['pages_with_critical_async_scripts'])}")
    print(f"Pages with multiple modal definitions: {len(critical['pages_with_multiple_modal_definitions'])}")

    # Print API issues
    api_issues = results["api_issues"]
    if api_issues:
        print("\n🔐 API Security Issues:")
        for issue, details in api_issues.items():
            print(f"  - {issue}: {details}")

    print(f"\n💾 Results saved to: {output_file}")

    # Create markdown summary
    md_file = REPORTS_DIR / "code_review_current_state_analysis.md"
    with open(md_file, 'w', encoding='utf-8') as f:
        f.write("# Code Review - Current State Analysis\n\n")
        f.write(f"**Generated:** December 2025\n")
        f.write(f"**Total Pages:** {summary['total_pages']}\n")
        f.write(f"**Pages with Issues:** {summary['pages_with_issues']}\n\n")

        f.write("## Critical Findings\n\n")
        f.write(f"- Pages with critical async scripts: {len(critical['pages_with_critical_async_scripts'])}\n")
        f.write(f"- Pages with multiple modal definitions: {len(critical['pages_with_multiple_modal_definitions'])}\n")
        f.write(f"- Percentage with issues: {critical['percentage_with_issues']}\n\n")

        if api_issues:
            f.write("## API Security Issues\n\n")
            for issue, details in api_issues.items():
                f.write(f"- **{issue}**: {details}\n")
            f.write("\n")

        f.write("## Next Steps\n\n")
        f.write("1. Fix critical async scripts in base packages\n")
        f.write("2. Remove duplicate CSS links\n")
        f.write("3. Consolidate showModalSafe definitions\n")
        f.write("4. Add missing authentication decorators\n")
        f.write("5. Re-run analysis to verify fixes\n")

    print(f"📝 Markdown summary saved to: {md_file}")

if __name__ == "__main__":
    main()

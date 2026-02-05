#!/usr/bin/env python3
"""
סקריפט לניתוח מקיף של D18_BRKRS_VIEW ו-D21_CASH_VIEW
מאת: Team 31 (Blueprint)
תאריך: 2026-02-02
"""

import os
import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional

class SpecAnalyzer:
    """מנתח מפרטים וקבצי Legacy עבור D18 ו-D21"""
    
    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        self.results = {
            'd18': {},
            'd21': {},
            'common_patterns': {},
            'recommendations': []
        }
    
    def analyze_d18_specs(self):
        """ניתוח מפרטים עבור D18_BRKRS_VIEW"""
        print("🔍 Analyzing D18_BRKRS_VIEW specifications...")
        
        d18_data = {
            'legacy_files': [],
            'db_schema': {},
            'api_spec': {},
            'field_maps': [],
            'ui_files': []
        }
        
        # 1. Legacy HTML files
        legacy_d18 = self.base_dir.parent.parent / "team_01" / "team_01_staging" / "D18_BRKRS_VIEW.html"
        if legacy_d18.exists():
            d18_data['legacy_files'].append(str(legacy_d18))
            content = legacy_d18.read_text(encoding='utf-8')
            d18_data['legacy_structure'] = self._extract_table_structure(content, 'D18')
        
        # 2. UI implementation files
        ui_d18 = self.base_dir.parent.parent.parent / "ui" / "src" / "views" / "financial" / "D18_BRKRS_VIEW.html"
        if ui_d18.exists():
            d18_data['ui_files'].append(str(ui_d18))
            content = ui_d18.read_text(encoding='utf-8')
            d18_data['ui_structure'] = self._extract_table_structure(content, 'D18')
        
        # 3. Extract table columns from legacy
        if 'legacy_structure' in d18_data:
            columns = self._extract_columns_from_html(content)
            d18_data['table_columns'] = columns
        
        self.results['d18'] = d18_data
        return d18_data
    
    def analyze_d21_specs(self):
        """ניתוח מפרטים עבור D21_CASH_VIEW"""
        print("🔍 Analyzing D21_CASH_VIEW specifications...")
        
        d21_data = {
            'legacy_files': [],
            'db_schema': {},
            'api_spec': {},
            'field_maps': [],
            'ui_files': []
        }
        
        # 1. Legacy HTML files
        legacy_d21 = self.base_dir.parent.parent / "team_01" / "team_01_staging" / "D21_CASH_VIEW.html"
        if legacy_d21.exists():
            d21_data['legacy_files'].append(str(legacy_d21))
            content = legacy_d21.read_text(encoding='utf-8')
            d21_data['legacy_structure'] = self._extract_table_structure(content, 'D21')
        
        # 2. UI implementation files
        ui_d21 = self.base_dir.parent.parent.parent / "ui" / "src" / "views" / "financial" / "D21_CASH_VIEW.html"
        if ui_d21.exists():
            d21_data['ui_files'].append(str(ui_d21))
            content = ui_d21.read_text(encoding='utf-8')
            d21_data['ui_structure'] = self._extract_table_structure(content, 'D21')
        
        # 3. Extract table columns from legacy
        if 'legacy_structure' in d21_data:
            columns = self._extract_columns_from_html(content)
            d21_data['table_columns'] = columns
        
        self.results['d21'] = d21_data
        return d21_data
    
    def analyze_db_schema(self):
        """ניתוח DB Schema עבור brokers ו-cash_flows"""
        print("🔍 Analyzing DB Schema...")
        
        schema_file = self.base_dir.parent.parent.parent / "documentation" / "06-ENGINEERING" / "PHX_DB_SCHEMA_V2.5_FULL_DDL.sql"
        
        if schema_file.exists():
            content = schema_file.read_text(encoding='utf-8')
            
            # Extract brokers info (from trading_accounts table - broker field)
            broker_pattern = r'broker\s+VARCHAR\((\d+)\)'
            broker_match = re.search(broker_pattern, content)
            if broker_match:
                self.results['d18']['db_schema'] = {
                    'broker_field': {
                        'type': 'VARCHAR',
                        'length': broker_match.group(1),
                        'location': 'trading_accounts table'
                    }
                }
            
            # Extract cash_flows table structure
            cash_flows_pattern = r'CREATE TABLE user_data\.cash_flows\s*\((.*?)\);'
            cash_flows_match = re.search(cash_flows_pattern, content, re.DOTALL)
            if cash_flows_match:
                table_def = cash_flows_match.group(1)
                fields = self._parse_table_fields(table_def)
                self.results['d21']['db_schema'] = {
                    'table_name': 'cash_flows',
                    'fields': fields
                }
    
    def analyze_api_spec(self):
        """ניתוח OpenAPI Spec"""
        print("🔍 Analyzing OpenAPI Specification...")
        
        api_file = self.base_dir.parent.parent.parent / "documentation" / "07-CONTRACTS" / "OPENAPI_SPEC_V2_FINAL.yaml"
        
        if api_file.exists():
            content = api_file.read_text(encoding='utf-8')
            
            # Extract cash_flows endpoints
            cash_flows_pattern = r'/cash_flows:.*?(?=\n  /|\Z)'
            cash_flows_match = re.search(cash_flows_pattern, content, re.DOTALL)
            if cash_flows_match:
                self.results['d21']['api_spec'] = {
                    'endpoint': '/cash_flows',
                    'definition': cash_flows_match.group(0)[:500]  # First 500 chars
                }
            
            # Extract CashFlowResponse schema
            cash_flow_response_pattern = r'CashFlowResponse:.*?(?=\n    [A-Z]|\Z)'
            cash_flow_response_match = re.search(cash_flow_response_pattern, content, re.DOTALL)
            if cash_flow_response_match:
                schema_content = cash_flow_response_match.group(0)
                properties = self._extract_yaml_properties(schema_content)
                self.results['d21']['api_spec']['response_schema'] = properties
    
    def _extract_table_structure(self, html_content: str, page_id: str) -> Dict:
        """חילוץ מבנה טבלה מ-HTML"""
        structure = {
            'has_table': '<table' in html_content,
            'columns': [],
            'filters': [],
            'actions': []
        }
        
        # Extract table headers
        header_pattern = r'<th[^>]*>(.*?)</th>'
        headers = re.findall(header_pattern, html_content, re.DOTALL)
        structure['columns'] = [self._clean_html(h) for h in headers]
        
        # Extract filters
        filter_pattern = r'<input[^>]*type=["\'](date|text|select)["\'][^>]*>'
        filters = re.findall(filter_pattern, html_content)
        structure['filters'] = filters
        
        # Extract action buttons
        action_pattern = r'<button[^>]*>(.*?)</button>'
        actions = re.findall(action_pattern, html_content, re.DOTALL)
        structure['actions'] = [self._clean_html(a) for a in actions]
        
        return structure
    
    def _extract_columns_from_html(self, html_content: str) -> List[str]:
        """חילוץ עמודות מטבלה"""
        columns = []
        header_pattern = r'<th[^>]*>(.*?)</th>'
        headers = re.findall(header_pattern, html_content, re.DOTALL)
        for header in headers:
            clean_header = self._clean_html(header)
            if clean_header:
                columns.append(clean_header)
        return columns
    
    def _parse_table_fields(self, table_def: str) -> List[Dict]:
        """פירוק הגדרות שדות מטבלה"""
        fields = []
        lines = table_def.split('\n')
        for line in lines:
            line = line.strip()
            if not line or line.startswith('--') or line.startswith('CONSTRAINT'):
                continue
            
            # Match field definition: field_name TYPE constraints
            field_match = re.match(r'(\w+)\s+(\w+(?:\([^)]+\))?)', line)
            if field_match:
                field_name = field_match.group(1)
                field_type = field_match.group(2)
                fields.append({
                    'name': field_name,
                    'type': field_type,
                    'raw': line
                })
        return fields
    
    def _extract_yaml_properties(self, yaml_content: str) -> Dict:
        """חילוץ properties מ-YAML schema"""
        properties = {}
        prop_pattern = r'(\w+):\s*\n\s+type:\s*(\w+)'
        matches = re.findall(prop_pattern, yaml_content)
        for prop_name, prop_type in matches:
            properties[prop_name] = prop_type
        return properties
    
    def _clean_html(self, html: str) -> str:
        """ניקוי HTML מטקסט"""
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', html)
        # Remove extra whitespace
        text = ' '.join(text.split())
        return text.strip()
    
    def generate_recommendations(self):
        """יצירת המלצות על בסיס הניתוח"""
        recommendations = []
        
        # D18 Recommendations
        if 'table_columns' in self.results['d18']:
            d18_cols = self.results['d18'].get('table_columns', [])
            if d18_cols:
                recommendations.append({
                    'page': 'D18_BRKRS_VIEW',
                    'type': 'table_structure',
                    'recommendation': f'Use Phoenix Tables System with columns: {", ".join(d18_cols)}',
                    'priority': 'HIGH'
                })
        
        # D21 Recommendations
        if 'table_columns' in self.results['d21']:
            d21_cols = self.results['d21'].get('table_columns', [])
            if d21_cols:
                recommendations.append({
                    'page': 'D21_CASH_VIEW',
                    'type': 'table_structure',
                    'recommendation': f'Use Phoenix Tables System with columns: {", ".join(d21_cols)}',
                    'priority': 'HIGH'
                })
        
        # Common patterns
        recommendations.append({
            'page': 'BOTH',
            'type': 'template',
            'recommendation': 'Use D15_PAGE_TEMPLATE_V3.html as base template',
            'priority': 'CRITICAL'
        })
        
        recommendations.append({
            'page': 'BOTH',
            'type': 'tables',
            'recommendation': 'Follow D16_ACCTS_VIEW.html as table template (Phoenix Tables System)',
            'priority': 'CRITICAL'
        })
        
        self.results['recommendations'] = recommendations
        return recommendations
    
    def generate_report(self) -> str:
        """יצירת דוח מפורט"""
        report = []
        report.append("# 📊 דוח ניתוח מפרטים - D18_BRKRS_VIEW ו-D21_CASH_VIEW\n")
        report.append(f"**תאריך:** {Path(__file__).stat().st_mtime}\n")
        report.append("---\n\n")
        
        # D18 Section
        report.append("## 🔍 D18_BRKRS_VIEW - ניתוח\n\n")
        d18 = self.results['d18']
        if d18.get('table_columns'):
            report.append("### עמודות טבלה מזוהות:\n")
            for i, col in enumerate(d18['table_columns'], 1):
                report.append(f"{i}. {col}\n")
            report.append("\n")
        
        if d18.get('db_schema'):
            report.append("### DB Schema:\n")
            report.append(f"```json\n{json.dumps(d18['db_schema'], indent=2, ensure_ascii=False)}\n```\n\n")
        
        # D21 Section
        report.append("## 🔍 D21_CASH_VIEW - ניתוח\n\n")
        d21 = self.results['d21']
        if d21.get('table_columns'):
            report.append("### עמודות טבלה מזוהות:\n")
            for i, col in enumerate(d21['table_columns'], 1):
                report.append(f"{i}. {col}\n")
            report.append("\n")
        
        if d21.get('db_schema'):
            report.append("### DB Schema:\n")
            report.append(f"```json\n{json.dumps(d21['db_schema'], indent=2, ensure_ascii=False)}\n```\n\n")
        
        # Recommendations
        report.append("## 💡 המלצות\n\n")
        for rec in self.results['recommendations']:
            report.append(f"### {rec['page']} - {rec['type']} ({rec['priority']})\n")
            report.append(f"{rec['recommendation']}\n\n")
        
        return ''.join(report)
    
    def save_results(self, output_file: Path):
        """שמירת תוצאות ל-JSON"""
        output_file.write_text(
            json.dumps(self.results, indent=2, ensure_ascii=False),
            encoding='utf-8'
        )
        print(f"✅ Results saved to {output_file}")


def main():
    """Main execution"""
    script_dir = Path(__file__).parent
    analyzer = SpecAnalyzer(script_dir)
    
    print("🚀 Starting comprehensive analysis...\n")
    
    # Analyze D18
    analyzer.analyze_d18_specs()
    
    # Analyze D21
    analyzer.analyze_d21_specs()
    
    # Analyze DB Schema
    analyzer.analyze_db_schema()
    
    # Analyze API Spec
    analyzer.analyze_api_spec()
    
    # Generate recommendations
    analyzer.generate_recommendations()
    
    # Save results
    results_file = script_dir / "d18_d21_analysis_results.json"
    analyzer.save_results(results_file)
    
    # Generate report
    report_file = script_dir / "d18_d21_analysis_report.md"
    report_file.write_text(analyzer.generate_report(), encoding='utf-8')
    print(f"✅ Report saved to {report_file}")
    
    print("\n✅ Analysis complete!")
    print(f"📊 Results: {results_file}")
    print(f"📄 Report: {report_file}")


if __name__ == "__main__":
    main()

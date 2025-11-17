#!/usr/bin/env python3
"""
Phase 3 Requirements Analysis Script
====================================
סורק את כל העמודים לזיהוי legacy patterns, inline styles, וסטטוס תיעוד
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from collections import defaultdict

# Base paths
PROJECT_ROOT = Path(__file__).parent.parent
TRADING_UI = PROJECT_ROOT / "trading-ui"
SCRIPTS_DIR = TRADING_UI / "scripts"
DOCS_DIR = PROJECT_ROOT / "documentation"
REPORTS_DIR = DOCS_DIR / "reports" / "user-pages-standardization"

# Pages to analyze (Phase 3 - excluding development tools)
PHASE3_CENTRAL_PAGES = [
    "index", "trades", "trade_plans", "alerts", "tickers",
    "trading_accounts", "executions", "data_import", "cash_flows",
    "notes", "research", "preferences"
]

PHASE3_SUPPORTING_PAGES = [
    "external-data-dashboard", "chart-management", "crud-testing-dashboard"
]

PHASE3_ALL_PAGES = PHASE3_CENTRAL_PAGES + PHASE3_SUPPORTING_PAGES

@dataclass
class LegacyPattern:
    """Legacy code pattern location"""
    file_path: str
    line_number: int
    pattern_type: str  # 'jquery_ajax', 'xmlhttprequest', 'inline_onclick'
    code_snippet: str
    function_context: Optional[str] = None

@dataclass
class InlineStyle:
    """Inline style location"""
    file_path: str
    line_number: int
    element: str
    style_content: str
    suggested_class: Optional[str] = None

@dataclass
class FunctionDoc:
    """Function documentation status"""
    function_name: str
    line_number: int
    has_jsdoc: bool
    has_params: bool
    has_returns: bool
    has_examples: bool
    jsdoc_quality: str  # 'complete', 'partial', 'missing'

@dataclass
class Phase3Analysis:
    """Phase 3 analysis results for a single page"""
    page_name: str
    page_type: str  # 'central' or 'supporting'
    html_file: Optional[str] = None
    js_file: Optional[str] = None
    
    # Legacy patterns
    jquery_ajax_locations: List[LegacyPattern] = None
    xmlhttprequest_locations: List[LegacyPattern] = None
    inline_onclick_locations: List[LegacyPattern] = None
    
    # Inline styles
    inline_styles: List[InlineStyle] = None
    
    # Documentation
    has_function_index: bool = False
    function_index_quality: str = "missing"  # 'complete', 'partial', 'missing'
    functions: List[FunctionDoc] = None
    jsdoc_coverage: float = 0.0  # percentage
    
    # Summary counts
    total_jquery_ajax: int = 0
    total_xmlhttprequest: int = 0
    total_inline_onclick: int = 0
    total_inline_styles: int = 0
    total_functions: int = 0
    documented_functions: int = 0
    
    def __post_init__(self):
        if self.jquery_ajax_locations is None:
            self.jquery_ajax_locations = []
        if self.xmlhttprequest_locations is None:
            self.xmlhttprequest_locations = []
        if self.inline_onclick_locations is None:
            self.inline_onclick_locations = []
        if self.inline_styles is None:
            self.inline_styles = []
        if self.functions is None:
            self.functions = []

def find_page_files(page_name: str) -> Tuple[Optional[Path], Optional[Path]]:
    """Find HTML and JS files for a page"""
    html_file = TRADING_UI / f"{page_name}.html"
    js_file = SCRIPTS_DIR / f"{page_name}.js"
    
    html_path = html_file if html_file.exists() else None
    js_path = js_file if js_file.exists() else None
    
    return html_path, js_path

def find_legacy_patterns_in_js(js_path: Path, page_name: str) -> Dict[str, List[LegacyPattern]]:
    """Find legacy patterns in JavaScript file"""
    if not js_path or not js_path.exists():
        return {
            'jquery_ajax': [],
            'xmlhttprequest': [],
            'inline_onclick': []
        }
    
    with open(js_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        content = ''.join(lines)
    
    patterns = {
        'jquery_ajax': [],
        'xmlhttprequest': [],
        'inline_onclick': []
    }
    
    # Find jQuery AJAX patterns
    jquery_patterns = [
        r'\.ajax\s*\(',
        r'\$\.ajax\s*\(',
        r'jQuery\.ajax\s*\('
    ]
    
    for i, line in enumerate(lines, 1):
        for pattern in jquery_patterns:
            if re.search(pattern, line):
                # Try to find function context
                function_context = None
                for j in range(max(0, i-10), i):
                    func_match = re.search(r'function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?function|(\w+)\s*:\s*(?:async\s+)?function', lines[j])
                    if func_match:
                        function_context = func_match.group(1) or func_match.group(2) or func_match.group(3)
                        break
                
                patterns['jquery_ajax'].append(LegacyPattern(
                    file_path=str(js_path.relative_to(PROJECT_ROOT)),
                    line_number=i,
                    pattern_type='jquery_ajax',
                    code_snippet=line.strip()[:100],
                    function_context=function_context
                ))
                break
    
    # Find XMLHttpRequest patterns
    xhr_patterns = [
        r'new\s+XMLHttpRequest\s*\(',
        r'XMLHttpRequest\s*\(',
        r'new\s+XMLHttpRequest'
    ]
    
    for i, line in enumerate(lines, 1):
        for pattern in xhr_patterns:
            if re.search(pattern, line):
                function_context = None
                for j in range(max(0, i-10), i):
                    func_match = re.search(r'function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?function|(\w+)\s*:\s*(?:async\s+)?function', lines[j])
                    if func_match:
                        function_context = func_match.group(1) or func_match.group(2) or func_match.group(3)
                        break
                
                patterns['xmlhttprequest'].append(LegacyPattern(
                    file_path=str(js_path.relative_to(PROJECT_ROOT)),
                    line_number=i,
                    pattern_type='xmlhttprequest',
                    code_snippet=line.strip()[:100],
                    function_context=function_context
                ))
                break
    
    # Note: inline onclick in JS files is less common, but we check anyway
    # Only find legacy onclick= (not data-onclick which is the new standard)
    for i, line in enumerate(lines, 1):
        # Look for onclick= that is NOT part of data-onclick or a string containing data-onclick
        if re.search(r'(?<!data-)onclick\s*=', line) and 'data-onclick' not in line:
            function_context = None
            for j in range(max(0, i-10), i):
                func_match = re.search(r'function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?function|(\w+)\s*:\s*(?:async\s+)?function', lines[j])
                if func_match:
                    function_context = func_match.group(1) or func_match.group(2) or func_match.group(3)
                    break
            
            patterns['inline_onclick'].append(LegacyPattern(
                file_path=str(js_path.relative_to(PROJECT_ROOT)),
                line_number=i,
                pattern_type='inline_onclick',
                code_snippet=line.strip()[:100],
                function_context=function_context
            ))
    
    return patterns

def find_inline_onclick_in_html(html_path: Path) -> List[LegacyPattern]:
    """Find inline onclick handlers in HTML file (only legacy onclick=, not data-onclick)"""
    if not html_path or not html_path.exists():
        return []
    
    with open(html_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    patterns = []
    
    for i, line in enumerate(lines, 1):
        # Find onclick= patterns (but NOT data-onclick= which is the new standard)
        # Look for onclick= that is NOT preceded by data-
        onclick_matches = re.finditer(r'(?<!data-)onclick\s*=\s*["\']([^"\']+)["\']', line)
        for match in onclick_matches:
            onclick_value = match.group(1)
            # Extract element tag if possible
            element_match = re.search(r'<(\w+)[^>]*(?<!data-)onclick', line)
            element = element_match.group(1) if element_match else 'unknown'
            
            patterns.append(LegacyPattern(
                file_path=str(html_path.relative_to(PROJECT_ROOT)),
                line_number=i,
                pattern_type='inline_onclick',
                code_snippet=line.strip()[:150],
                function_context=onclick_value[:50]
            ))
    
    return patterns

def find_inline_styles(html_path: Path) -> List[InlineStyle]:
    """Find inline styles in HTML file"""
    if not html_path or not html_path.exists():
        return []
    
    with open(html_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    styles = []
    
    for i, line in enumerate(lines, 1):
        # Find style= patterns
        style_matches = re.finditer(r'style\s*=\s*["\']([^"\']+)["\']', line)
        for match in style_matches:
            style_content = match.group(1)
            # Extract element tag
            element_match = re.search(r'<(\w+)[^>]*style', line)
            element = element_match.group(1) if element_match else 'unknown'
            
            # Generate suggested class name
            suggested_class = generate_class_name(style_content, element)
            
            styles.append(InlineStyle(
                file_path=str(html_path.relative_to(PROJECT_ROOT)),
                line_number=i,
                element=element,
                style_content=style_content,
                suggested_class=suggested_class
            ))
    
    return styles

def generate_class_name(style_content: str, element: str) -> str:
    """Generate a suggested CSS class name from inline style"""
    # Extract key properties
    props = {}
    for prop in style_content.split(';'):
        if ':' in prop:
            key, value = prop.split(':', 1)
            props[key.strip()] = value.strip()
    
    # Generate class name based on properties
    class_parts = []
    if 'color' in props:
        class_parts.append('color')
    if 'background' in props or 'background-color' in props:
        class_parts.append('bg')
    if 'font-size' in props:
        class_parts.append('font')
    if 'margin' in props:
        class_parts.append('margin')
    if 'padding' in props:
        class_parts.append('padding')
    if 'display' in props:
        class_parts.append('display')
    
    if class_parts:
        return f"{element}-{'-'.join(class_parts)}"
    return f"{element}-custom"

def check_function_index(js_path: Path) -> Tuple[bool, str]:
    """Check if JS file has function index and assess quality"""
    if not js_path or not js_path.exists():
        return False, "missing"
    
    with open(js_path, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.split('\n')
    
    # Look for function index patterns
    index_patterns = [
        r'FUNCTION\s+INDEX',
        r'Function\s+Index',
        r'function\s+index',
        r'פונקציות',
        r'רשימת\s+פונקציות'
    ]
    
    has_index = any(re.search(pattern, content, re.IGNORECASE) for pattern in index_patterns)
    
    if not has_index:
        return False, "missing"
    
    # Check quality - look for organized structure
    quality = "partial"
    if re.search(r'FUNCTION\s+INDEX.*=+', content, re.IGNORECASE | re.MULTILINE):
        quality = "complete"
    
    return True, quality

def analyze_functions_and_jsdoc(js_path: Path) -> Tuple[List[FunctionDoc], float]:
    """Analyze functions and JSDoc coverage"""
    if not js_path or not js_path.exists():
        return [], 0.0
    
    with open(js_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        content = ''.join(lines)
    
    functions = []
    
    # Find all function definitions
    function_patterns = [
        (r'function\s+(\w+)\s*\(', 'function'),
        (r'const\s+(\w+)\s*=\s*(?:async\s+)?function', 'const_function'),
        (r'(\w+)\s*:\s*(?:async\s+)?function', 'method'),
        (r'(\w+)\s*:\s*(?:async\s+)?\([^)]*\)\s*=>', 'arrow'),
        (r'const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>', 'const_arrow')
    ]
    
    for i, line in enumerate(lines, 1):
        for pattern, func_type in function_patterns:
            match = re.search(pattern, line)
            if match:
                func_name = match.group(1)
                
                # Check for JSDoc above the function (look back up to 10 lines)
                has_jsdoc = False
                has_params = False
                has_returns = False
                has_examples = False
                
                for j in range(max(0, i-10), i):
                    if '/**' in lines[j]:
                        has_jsdoc = True
                        # Check for @param
                        if '@param' in lines[j] or any('@param' in lines[k] for k in range(j, min(len(lines), j+20))):
                            has_params = True
                        # Check for @returns
                        if '@returns' in lines[j] or any('@returns' in lines[k] for k in range(j, min(len(lines), j+20))):
                            has_returns = True
                        # Check for @example
                        if '@example' in lines[j] or any('@example' in lines[k] for k in range(j, min(len(lines), j+20))):
                            has_examples = True
                        break
                
                # Determine quality
                if has_jsdoc and has_params and has_returns:
                    quality = 'complete'
                elif has_jsdoc:
                    quality = 'partial'
                else:
                    quality = 'missing'
                
                functions.append(FunctionDoc(
                    function_name=func_name,
                    line_number=i,
                    has_jsdoc=has_jsdoc,
                    has_params=has_params,
                    has_returns=has_returns,
                    has_examples=has_examples,
                    jsdoc_quality=quality
                ))
                break
    
    # Calculate coverage
    total = len(functions)
    documented = sum(1 for f in functions if f.has_jsdoc)
    coverage = (documented / total * 100) if total > 0 else 0.0
    
    return functions, coverage

def analyze_page_phase3(page_name: str, page_type: str) -> Phase3Analysis:
    """Analyze a single page for Phase 3 requirements"""
    html_path, js_path = find_page_files(page_name)
    
    analysis = Phase3Analysis(
        page_name=page_name,
        page_type=page_type,
        html_file=str(html_path.relative_to(PROJECT_ROOT)) if html_path else None,
        js_file=str(js_path.relative_to(PROJECT_ROOT)) if js_path else None
    )
    
    # Analyze JS file for legacy patterns
    if js_path:
        js_patterns = find_legacy_patterns_in_js(js_path, page_name)
        analysis.jquery_ajax_locations = js_patterns['jquery_ajax']
        analysis.xmlhttprequest_locations = js_patterns['xmlhttprequest']
        analysis.inline_onclick_locations.extend(js_patterns['inline_onclick'])
        
        # Check function index
        has_index, quality = check_function_index(js_path)
        analysis.has_function_index = has_index
        analysis.function_index_quality = quality
        
        # Analyze functions and JSDoc
        functions, coverage = analyze_functions_and_jsdoc(js_path)
        analysis.functions = functions
        analysis.jsdoc_coverage = coverage
        analysis.total_functions = len(functions)
        analysis.documented_functions = sum(1 for f in functions if f.has_jsdoc)
    
    # Analyze HTML file for inline onclick and styles
    if html_path:
        html_onclick = find_inline_onclick_in_html(html_path)
        analysis.inline_onclick_locations.extend(html_onclick)
        
        html_styles = find_inline_styles(html_path)
        analysis.inline_styles = html_styles
    
    # Calculate totals
    analysis.total_jquery_ajax = len(analysis.jquery_ajax_locations)
    analysis.total_xmlhttprequest = len(analysis.xmlhttprequest_locations)
    analysis.total_inline_onclick = len(analysis.inline_onclick_locations)
    analysis.total_inline_styles = len(analysis.inline_styles)
    
    return analysis

def generate_per_page_report(analysis: Phase3Analysis) -> str:
    """Generate detailed report for a single page"""
    report = f"""# דוח Phase 3 - {analysis.page_name}

**תאריך סריקה**: {Path(__file__).stat().st_mtime}
**סוג עמוד**: {'עמוד מרכזי' if analysis.page_type == 'central' else 'עמוד תומך'}

## קבצים

- **HTML**: `{analysis.html_file or 'לא נמצא'}`
- **JavaScript**: `{analysis.js_file or 'לא נמצא'}`

---

## סעיף A: Legacy Code Patterns

### jQuery AJAX

**סה"כ מופעים**: {analysis.total_jquery_ajax}

"""
    
    if analysis.total_jquery_ajax > 0:
        report += "**מיקומים**:\n\n"
        for loc in analysis.jquery_ajax_locations:
            report += f"- **שורה {loc.line_number}** ב-`{loc.file_path}`\n"
            if loc.function_context:
                report += f"  - פונקציה: `{loc.function_context}`\n"
            report += f"  - קוד: `{loc.code_snippet[:80]}...`\n\n"
    else:
        report += "✅ **אין מופעים** - העמוד נקי מ-jQuery AJAX\n\n"
    
    report += f"""### XMLHttpRequest

**סה"כ מופעים**: {analysis.total_xmlhttprequest}

"""
    
    if analysis.total_xmlhttprequest > 0:
        report += "**מיקומים**:\n\n"
        for loc in analysis.xmlhttprequest_locations:
            report += f"- **שורה {loc.line_number}** ב-`{loc.file_path}`\n"
            if loc.function_context:
                report += f"  - פונקציה: `{loc.function_context}`\n"
            report += f"  - קוד: `{loc.code_snippet[:80]}...`\n\n"
    else:
        report += "✅ **אין מופעים** - העמוד נקי מ-XMLHttpRequest\n\n"
    
    report += f"""### Inline onclick Handlers

**סה"כ מופעים**: {analysis.total_inline_onclick}

"""
    
    if analysis.total_inline_onclick > 0:
        report += "**מיקומים**:\n\n"
        for loc in analysis.inline_onclick_locations:
            report += f"- **שורה {loc.line_number}** ב-`{loc.file_path}`\n"
            if loc.function_context:
                report += f"  - Handler: `{loc.function_context}`\n"
            report += f"  - קוד: `{loc.code_snippet[:80]}...`\n\n"
    else:
        report += "✅ **אין מופעים** - העמוד נקי מ-inline onclick\n\n"
    
    report += f"""---

## סעיף B: Inline Styles

**סה"כ מופעים**: {analysis.total_inline_styles}

"""
    
    if analysis.total_inline_styles > 0:
        report += "**מיקומים והצעות**:\n\n"
        for style in analysis.inline_styles:
            report += f"- **שורה {style.line_number}** ב-`{style.file_path}`\n"
            report += f"  - אלמנט: `<{style.element}>`\n"
            report += f"  - Style: `{style.style_content[:60]}...`\n"
            if style.suggested_class:
                report += f"  - הצעה ל-class: `.{style.suggested_class}`\n"
            report += "\n"
    else:
        report += "✅ **אין מופעים** - העמוד נקי מ-inline styles\n\n"
    
    report += f"""---

## סעיף C: Documentation Status

### Function Index

**סטטוס**: {'✅ קיים' if analysis.has_function_index else '❌ חסר'}
**איכות**: {analysis.function_index_quality}

### JSDoc Coverage

**כיסוי**: {analysis.jsdoc_coverage:.1f}% ({analysis.documented_functions}/{analysis.total_functions} פונקציות)

**פירוט**:
- **פונקציות עם JSDoc מלא** (params + returns): {sum(1 for f in analysis.functions if f.jsdoc_quality == 'complete')}
- **פונקציות עם JSDoc חלקי**: {sum(1 for f in analysis.functions if f.jsdoc_quality == 'partial')}
- **פונקציות ללא JSDoc**: {sum(1 for f in analysis.functions if f.jsdoc_quality == 'missing')}

"""
    
    if analysis.total_functions > 0:
        report += "**רשימת פונקציות**:\n\n"
        for func in analysis.functions[:20]:  # Show first 20
            status = "✅" if func.has_jsdoc else "❌"
            report += f"- {status} `{func.function_name}()` (שורה {func.line_number}) - {func.jsdoc_quality}\n"
        if len(analysis.functions) > 20:
            report += f"\n... ועוד {len(analysis.functions) - 20} פונקציות\n"
    
    report += f"""---

## סעיף D: Recommended Tasks

### עדיפות גבוהה

"""
    
    tasks = []
    if analysis.total_jquery_ajax > 0:
        tasks.append(f"1. החלפת {analysis.total_jquery_ajax} מופעי jQuery AJAX ל-fetch() API")
    if analysis.total_xmlhttprequest > 0:
        tasks.append(f"2. החלפת {analysis.total_xmlhttprequest} מופעי XMLHttpRequest ל-fetch() API")
    if analysis.total_inline_onclick > 0:
        tasks.append(f"3. החלפת {analysis.total_inline_onclick} מופעי inline onclick ל-event listeners")
    
    if tasks:
        report += "\n".join(tasks) + "\n\n"
    else:
        report += "✅ אין legacy patterns\n\n"
    
    report += "### עדיפות בינונית\n\n"
    
    tasks = []
    if analysis.total_inline_styles > 0:
        tasks.append(f"1. העברת {analysis.total_inline_styles} inline styles ל-CSS classes")
    if not analysis.has_function_index:
        tasks.append("2. הוספת function index לקובץ JS")
    if analysis.jsdoc_coverage < 100:
        tasks.append(f"3. הוספת JSDoc ל-{analysis.total_functions - analysis.documented_functions} פונקציות חסרות")
    
    if tasks:
        report += "\n".join(tasks) + "\n\n"
    else:
        report += "✅ כל המשימות הושלמו\n\n"
    
    report += "---\n\n"
    report += "*דוח נוצר אוטומטית על ידי `scripts/analyze-phase3-requirements.py`*\n"
    
    return report

def generate_summary_report(all_analyses: List[Phase3Analysis]) -> str:
    """Generate summary report for all pages"""
    report = f"""# דוח סיכום Phase 3 - Legacy Cleanup ושיפור תיעוד

**תאריך סריקה**: {Path(__file__).stat().st_mtime}
**סה"כ עמודים נסרקו**: {len(all_analyses)}

---

## סיכום כללי

### Legacy Patterns

| קטגוריה | סה"כ מופעים | עמודים עם מופעים |
|---------|-------------|------------------|
| jQuery AJAX | {sum(a.total_jquery_ajax for a in all_analyses)} | {sum(1 for a in all_analyses if a.total_jquery_ajax > 0)} |
| XMLHttpRequest | {sum(a.total_xmlhttprequest for a in all_analyses)} | {sum(1 for a in all_analyses if a.total_xmlhttprequest > 0)} |
| Inline onclick | {sum(a.total_inline_onclick for a in all_analyses)} | {sum(1 for a in all_analyses if a.total_inline_onclick > 0)} |

### Inline Styles

**סה"כ מופעים**: {sum(a.total_inline_styles for a in all_analyses)}
**עמודים עם inline styles**: {sum(1 for a in all_analyses if a.total_inline_styles > 0)}

### Documentation

| קטגוריה | סטטוס |
|---------|--------|
| Function Index | {sum(1 for a in all_analyses if a.has_function_index)}/{len(all_analyses)} עמודים |
| JSDoc Coverage ממוצע | {sum(a.jsdoc_coverage for a in all_analyses) / len(all_analyses) if all_analyses else 0:.1f}% |

---

## טבלת סטטוס לפי עמוד

| עמוד | jQuery AJAX | XMLHttpRequest | Inline onclick | Inline Styles | Function Index | JSDoc Coverage |
|------|------------|----------------|---------------|---------------|----------------|----------------|
"""
    
    for analysis in sorted(all_analyses, key=lambda x: x.page_name):
        report += f"| {analysis.page_name} | {analysis.total_jquery_ajax} | {analysis.total_xmlhttprequest} | {analysis.total_inline_onclick} | {analysis.total_inline_styles} | {'✅' if analysis.has_function_index else '❌'} | {analysis.jsdoc_coverage:.1f}% |\n"
    
    report += "\n---\n\n"
    report += "## קישורים לדוחות מפורטים\n\n"
    
    for analysis in sorted(all_analyses, key=lambda x: x.page_name):
        report += f"- [{analysis.page_name}](PHASE3_{analysis.page_name}.report.md)\n"
    
    report += "\n---\n\n"
    report += "*דוח נוצר אוטומטית על ידי `scripts/analyze-phase3-requirements.py`*\n"
    
    return report

def main():
    """Main execution function"""
    print("🔍 Starting Phase 3 requirements analysis...")
    print(f"📁 Scanning {len(PHASE3_ALL_PAGES)} pages...")
    
    # Ensure reports directory exists
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    
    all_analyses = []
    
    # Analyze central pages
    for page_name in PHASE3_CENTRAL_PAGES:
        print(f"  Analyzing {page_name}...")
        analysis = analyze_page_phase3(page_name, 'central')
        all_analyses.append(analysis)
        
        # Generate per-page report
        report = generate_per_page_report(analysis)
        report_path = REPORTS_DIR / f"PHASE3_{page_name}.report.md"
        report_path.write_text(report, encoding='utf-8')
        print(f"    ✅ Report saved: {report_path.name}")
    
    # Analyze supporting pages
    for page_name in PHASE3_SUPPORTING_PAGES:
        print(f"  Analyzing {page_name}...")
        analysis = analyze_page_phase3(page_name, 'supporting')
        all_analyses.append(analysis)
        
        # Generate per-page report
        report = generate_per_page_report(analysis)
        report_path = REPORTS_DIR / f"PHASE3_{page_name}.report.md"
        report_path.write_text(report, encoding='utf-8')
        print(f"    ✅ Report saved: {report_path.name}")
    
    # Generate summary report
    print("\n📊 Generating summary report...")
    summary = generate_summary_report(all_analyses)
    summary_path = REPORTS_DIR / "PHASE3_SCAN_SUMMARY.md"
    summary_path.write_text(summary, encoding='utf-8')
    print(f"  ✅ Summary saved: {summary_path.name}")
    
    # Save JSON data
    json_data = {
        'scan_date': str(Path(__file__).stat().st_mtime),
        'total_pages': len(all_analyses),
        'pages': [asdict(analysis) for analysis in all_analyses]
    }
    json_path = REPORTS_DIR / "PHASE3_SCAN_DATA.json"
    json_path.write_text(json.dumps(json_data, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"  ✅ JSON data saved: {json_path.name}")
    
    # Print summary statistics
    print("\n📈 Summary Statistics:")
    print(f"  - Total jQuery AJAX: {sum(a.total_jquery_ajax for a in all_analyses)}")
    print(f"  - Total XMLHttpRequest: {sum(a.total_xmlhttprequest for a in all_analyses)}")
    print(f"  - Total inline onclick: {sum(a.total_inline_onclick for a in all_analyses)}")
    print(f"  - Total inline styles: {sum(a.total_inline_styles for a in all_analyses)}")
    print(f"  - Pages with function index: {sum(1 for a in all_analyses if a.has_function_index)}/{len(all_analyses)}")
    print(f"  - Average JSDoc coverage: {sum(a.jsdoc_coverage for a in all_analyses) / len(all_analyses) if all_analyses else 0:.1f}%")
    
    print("\n✅ Phase 3 analysis complete!")

if __name__ == '__main__':
    main()


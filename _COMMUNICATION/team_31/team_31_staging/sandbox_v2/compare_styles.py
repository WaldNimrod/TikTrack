#!/usr/bin/env python3
"""
Style Comparison Script
Compares HTML structure, CSS classes, inline styles, and attributes between two HTML files.
"""

import re
from pathlib import Path
from html.parser import HTMLParser
from collections import defaultdict
import json

class HTMLAnalyzer(HTMLParser):
    def __init__(self):
        super().__init__()
        self.classes = set()
        self.ids = set()
        self.inline_styles = []
        self.elements = []
        self.structure = []
        self.current_path = []
        
    def handle_starttag(self, tag, attrs):
        self.current_path.append(tag)
        path_str = ' > '.join(self.current_path)
        
        attrs_dict = dict(attrs)
        
        # Collect classes
        if 'class' in attrs_dict:
            classes = attrs_dict['class'].split()
            self.classes.update(classes)
            for cls in classes:
                self.elements.append({
                    'tag': tag,
                    'class': cls,
                    'path': path_str,
                    'attrs': attrs_dict
                })
        
        # Collect IDs
        if 'id' in attrs_dict:
            self.ids.add(attrs_dict['id'])
            self.elements.append({
                'tag': tag,
                'id': attrs_dict['id'],
                'path': path_str,
                'attrs': attrs_dict
            })
        
        # Collect inline styles
        if 'style' in attrs_dict:
            self.inline_styles.append({
                'tag': tag,
                'path': path_str,
                'style': attrs_dict['style'],
                'attrs': attrs_dict
            })
        
        # Store structure
        self.structure.append({
            'tag': tag,
            'path': path_str,
            'attrs': attrs_dict
        })
    
    def handle_endtag(self, tag):
        if self.current_path and self.current_path[-1] == tag:
            self.current_path.pop()

def extract_css_from_style_tags(html_content):
    """Extract CSS from <style> tags"""
    style_pattern = r'<style[^>]*>(.*?)</style>'
    matches = re.findall(style_pattern, html_content, re.DOTALL | re.IGNORECASE)
    return matches

def extract_css_links(html_content):
    """Extract CSS file links"""
    link_pattern = r'<link[^>]*rel=["\']stylesheet["\'][^>]*href=["\']([^"\']+)["\']'
    matches = re.findall(link_pattern, html_content, re.IGNORECASE)
    return matches

def extract_js_links(html_content):
    """Extract JavaScript file links"""
    script_pattern = r'<script[^>]*src=["\']([^"\']+)["\']'
    matches = re.findall(script_pattern, html_content, re.IGNORECASE)
    return matches

def analyze_html_file(file_path):
    """Analyze an HTML file and return structured data"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Parse HTML
    parser = HTMLAnalyzer()
    parser.feed(content)
    
    # Extract additional info
    css_inline = extract_css_from_style_tags(content)
    css_links = extract_css_links(content)
    js_links = extract_js_links(content)
    
    return {
        'classes': parser.classes,
        'ids': parser.ids,
        'inline_styles': parser.inline_styles,
        'elements': parser.elements,
        'structure': parser.structure,
        'css_inline': css_inline,
        'css_links': css_links,
        'js_links': js_links,
        'content_length': len(content)
    }

def compare_files(file1_path, file2_path):
    """Compare two HTML files and report differences"""
    print("=" * 80)
    print(f"Comparing HTML Files")
    print("=" * 80)
    print(f"\nFile 1: {file1_path}")
    print(f"File 2: {file2_path}\n")
    
    data1 = analyze_html_file(file1_path)
    data2 = analyze_html_file(file2_path)
    
    # Compare classes
    print("\n" + "=" * 80)
    print("CSS CLASSES COMPARISON")
    print("=" * 80)
    
    classes_only_1 = data1['classes'] - data2['classes']
    classes_only_2 = data2['classes'] - data1['classes']
    classes_common = data1['classes'] & data2['classes']
    
    print(f"\nCommon classes: {len(classes_common)}")
    print(f"Classes only in File 1: {len(classes_only_1)}")
    print(f"Classes only in File 2: {len(classes_only_2)}")
    
    if classes_only_1:
        print(f"\n⚠️  Classes ONLY in File 1 ({len(classes_only_1)}):")
        for cls in sorted(classes_only_1):
            print(f"  - {cls}")
    
    if classes_only_2:
        print(f"\n⚠️  Classes ONLY in File 2 ({len(classes_only_2)}):")
        for cls in sorted(classes_only_2):
            print(f"  - {cls}")
    
    # Compare IDs
    print("\n" + "=" * 80)
    print("ELEMENT IDs COMPARISON")
    print("=" * 80)
    
    ids_only_1 = data1['ids'] - data2['ids']
    ids_only_2 = data2['ids'] - data1['ids']
    
    if ids_only_1:
        print(f"\n⚠️  IDs ONLY in File 1 ({len(ids_only_1)}):")
        for id_val in sorted(ids_only_1):
            print(f"  - {id_val}")
    
    if ids_only_2:
        print(f"\n⚠️  IDs ONLY in File 2 ({len(ids_only_2)}):")
        for id_val in sorted(ids_only_2):
            print(f"  - {id_val}")
    
    # Compare inline styles
    print("\n" + "=" * 80)
    print("INLINE STYLES COMPARISON")
    print("=" * 80)
    
    print(f"\nFile 1 has {len(data1['inline_styles'])} elements with inline styles")
    print(f"File 2 has {len(data2['inline_styles'])} elements with inline styles")
    
    if data1['inline_styles']:
        print(f"\n⚠️  Inline styles in File 1:")
        for style_info in data1['inline_styles'][:10]:  # Show first 10
            print(f"  - {style_info['tag']} ({style_info['path']})")
            print(f"    Style: {style_info['style'][:100]}...")
    
    if data2['inline_styles']:
        print(f"\n⚠️  Inline styles in File 2:")
        for style_info in data2['inline_styles'][:10]:  # Show first 10
            print(f"  - {style_info['tag']} ({style_info['path']})")
            print(f"    Style: {style_info['style'][:100]}...")
    
    # Compare CSS links
    print("\n" + "=" * 80)
    print("CSS FILE LINKS COMPARISON")
    print("=" * 80)
    
    css_links_1 = set(data1['css_links'])
    css_links_2 = set(data2['css_links'])
    
    css_only_1 = css_links_1 - css_links_2
    css_only_2 = css_links_2 - css_links_1
    
    print(f"\nFile 1 CSS links ({len(css_links_1)}):")
    for link in sorted(css_links_1):
        print(f"  - {link}")
    
    print(f"\nFile 2 CSS links ({len(css_links_2)}):")
    for link in sorted(css_links_2):
        print(f"  - {link}")
    
    if css_only_1:
        print(f"\n⚠️  CSS links ONLY in File 1:")
        for link in sorted(css_only_1):
            print(f"  - {link}")
    
    if css_only_2:
        print(f"\n⚠️  CSS links ONLY in File 2:")
        for link in sorted(css_only_2):
            print(f"  - {link}")
    
    # Compare JS links
    print("\n" + "=" * 80)
    print("JAVASCRIPT FILE LINKS COMPARISON")
    print("=" * 80)
    
    js_links_1 = set(data1['js_links'])
    js_links_2 = set(data2['js_links'])
    
    js_only_1 = js_links_1 - js_links_2
    js_only_2 = js_links_2 - js_links_1
    
    print(f"\nFile 1 JS links ({len(js_links_1)}):")
    for link in sorted(js_links_1):
        print(f"  - {link}")
    
    print(f"\nFile 2 JS links ({len(js_links_2)}):")
    for link in sorted(js_links_2):
        print(f"  - {link}")
    
    if js_only_1:
        print(f"\n⚠️  JS links ONLY in File 1:")
        for link in sorted(js_only_1):
            print(f"  - {link}")
    
    if js_only_2:
        print(f"\n⚠️  JS links ONLY in File 2:")
        for link in sorted(js_only_2):
            print(f"  - {link}")
    
    # Compare inline CSS
    print("\n" + "=" * 80)
    print("INLINE CSS (<style> tags) COMPARISON")
    print("=" * 80)
    
    print(f"\nFile 1 has {len(data1['css_inline'])} <style> blocks")
    print(f"File 2 has {len(data2['css_inline'])} <style> blocks")
    
    if data1['css_inline']:
        print(f"\n⚠️  <style> blocks in File 1:")
        for i, css in enumerate(data1['css_inline'], 1):
            print(f"\n  Block {i} ({len(css)} chars):")
            # Extract first few rules
            rules = re.findall(r'([^{]+)\{([^}]+)\}', css[:500])
            for selector, props in rules[:5]:
                print(f"    {selector.strip()}: {props.strip()[:50]}...")
    
    if data2['css_inline']:
        print(f"\n⚠️  <style> blocks in File 2:")
        for i, css in enumerate(data2['css_inline'], 1):
            print(f"\n  Block {i} ({len(css)} chars):")
            # Extract first few rules
            rules = re.findall(r'([^{]+)\{([^}]+)\}', css[:500])
            for selector, props in rules[:5]:
                print(f"    {selector.strip()}: {props.strip()[:50]}...")
    
    # File size comparison
    print("\n" + "=" * 80)
    print("FILE SIZE COMPARISON")
    print("=" * 80)
    
    print(f"\nFile 1 size: {data1['content_length']:,} characters")
    print(f"File 2 size: {data2['content_length']:,} characters")
    diff = data2['content_length'] - data1['content_length']
    print(f"Difference: {diff:+,} characters ({diff/data1['content_length']*100:+.2f}%)")
    
    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    
    issues = []
    if classes_only_1 or classes_only_2:
        issues.append(f"Different CSS classes ({len(classes_only_1)} vs {len(classes_only_2)})")
    if ids_only_1 or ids_only_2:
        issues.append(f"Different element IDs ({len(ids_only_1)} vs {len(ids_only_2)})")
    if len(data1['inline_styles']) != len(data2['inline_styles']):
        issues.append(f"Different inline styles count ({len(data1['inline_styles'])} vs {len(data2['inline_styles'])})")
    if css_only_1 or css_only_2:
        issues.append(f"Different CSS file links ({len(css_only_1)} vs {len(css_only_2)})")
    if js_only_1 or js_only_2:
        issues.append(f"Different JS file links ({len(js_only_1)} vs {len(js_only_2)})")
    if len(data1['css_inline']) != len(data2['css_inline']):
        issues.append(f"Different <style> blocks count ({len(data1['css_inline'])} vs {len(data2['css_inline'])})")
    
    if issues:
        print("\n⚠️  ISSUES FOUND:")
        for issue in issues:
            print(f"  - {issue}")
    else:
        print("\n✅ No major structural differences found!")
    
    print("\n" + "=" * 80)

if __name__ == "__main__":
    # Default paths
    script_dir = Path(__file__).parent
    base_dir = script_dir.parent.parent.parent
    
    file1 = base_dir / "team_01" / "team_01_staging" / "D16_ACCTS_VIEW.html"
    file2 = script_dir / "D16_ACCTS_VIEW.html"
    
    if not file1.exists():
        print(f"❌ Error: File 1 not found: {file1}")
        exit(1)
    
    if not file2.exists():
        print(f"❌ Error: File 2 not found: {file2}")
        exit(1)
    
    compare_files(file1, file2)

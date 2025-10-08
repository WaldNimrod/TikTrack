#!/usr/bin/env python3
"""
Fix page-scripts-matrix table by adding missing columns
"""
import re

def fix_table_columns():
    # Read the file
    with open('trading-ui/page-scripts-matrix.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to find table rows that need fixing
    # Look for rows with script-name that end with </tr>
    pattern = r'(\s*<td class="script-name">[^<]+</td>.*?)(?=\s*</tr>)'

    def add_missing_columns(match):
        row_content = match.group(1)
        # Count current <td> tags (more precise)
        td_tags = re.findall(r'<td[^>]*>.*?</td>', row_content)
        td_count = len(td_tags)

        print(f"Found {td_count} columns in row")

        # We need 23 columns total (script-name + 22 data columns)
        if td_count < 23:
            missing = 23 - td_count
            print(f"Adding {missing} missing columns")
            for _ in range(missing):
                row_content += '\n                        <td></td>'
        elif td_count > 23:
            print(f"Too many columns ({td_count}), removing extras")
            # Keep only first 23 columns
            td_tags = td_tags[:23]
            row_content = ''.join(td_tags)

        return row_content

    # Apply the fix
    fixed_content = re.sub(pattern, add_missing_columns, content, flags=re.DOTALL)

    # Write back
    with open('trading-ui/page-scripts-matrix.html', 'w', encoding='utf-8') as f:
        f.write(fixed_content)

    print("Table columns fixed!")

if __name__ == "__main__":
    fix_table_columns()

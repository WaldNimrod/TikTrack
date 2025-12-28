#!/usr/bin/env python3
"""
Fix AI Analysis API tests to use auth_client correctly
"""

import re

def fix_test_file():
    # Read the file
    with open('Backend/tests/integration/test_ai_analysis_api.py', 'r') as f:
        content = f.read()

    # Define the endpoints that require authentication
    auth_endpoints = [
        'generate_analysis',
        'get_history',
        'get_analysis_by_id',
        'delete_analysis',
        'check_analysis_availability',
        'check_analysis_availability_batch',
        'delete_all_analyses',
        'manage_llm_provider',
        'retry_failed_analysis'
    ]

    # Find all test functions that have mock_user_id parameter
    test_functions = re.findall(r'def test_([^)]*mock_user_id[^)]*):', content)

    for func_name in test_functions:
        # Check if this function is for an authenticated endpoint
        is_auth = any(endpoint in func_name for endpoint in auth_endpoints)

        if is_auth:
            # Change parameter from client to auth_client
            content = re.sub(
                rf'def test_{func_name}\(client, mock_user_id\):',
                rf'def test_{func_name}(auth_client, mock_user_id):',
                content
            )

            # Remove app_context and g.user_id setup
            pattern = rf'(def test_{func_name}\(auth_client, mock_user_id\):.*?)with client\.application\.app_context\(\):\s*g\.user_id = mock_user_id\s*'
            content = re.sub(pattern, r'\1', content, flags=re.DOTALL)

            # Change response = client. to response = auth_client.
            content = re.sub(
                rf'(def test_{func_name}\(auth_client, mock_user_id\):.*?)response = client\.',
                r'\1response = auth_client.',
                content,
                flags=re.DOTALL
            )

    # Fix URLs from /api/ai-analysis/ to /api/ai_analysis/
    content = content.replace('/api/ai-analysis/', '/api/ai_analysis/')

    # Write back
    with open('Backend/tests/integration/test_ai_analysis_api.py', 'w') as f:
        f.write(content)

    print("✅ Fixed test file")

if __name__ == '__main__':
    fix_test_file()

#!/usr/bin/env python3
"""
Replace all http://localhost:8000 references with ${API_BASE_URL} template literal
and inject the apiConfig import at the top of each file.
"""
import os
import re
import sys

SRC_DIR = "/Users/harshitsuthar/workspace/raghuvirconsultants-site/frontend/src"
HARDCODED = "http://localhost:8000"
PLACEHOLDER = "${API_BASE_URL}"
IMPORT_ADMIN = "import { API_BASE_URL } from '../../config/apiConfig';"
IMPORT_PAGES = "import { API_BASE_URL } from '../config/apiConfig';"
IMPORT_INVESTOR = "import { API_BASE_URL } from '../config/apiConfig';"
IMPORT_ADMIN_OLD = "import { API_BASE_URL } from '../config/apiConfig';"  # for adminDashboard root

# Map path fragments to relative import depth
def get_import_line(filepath):
    rel = os.path.relpath(filepath, SRC_DIR)
    parts = rel.split(os.sep)
    depth = len(parts) - 1  # number of directory levels
    dots = '../' * depth
    return f"import {{ API_BASE_URL }} from '{dots}config/apiConfig';"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if HARDCODED not in content:
        return False  # nothing to do

    import_line = get_import_line(filepath)

    # Replace all occurrences:
    # 'http://localhost:8000/...' -> `${API_BASE_URL}/...`
    # The tricky part: URL may appear in single-quoted strings, template literals, or backtick strings
    # We replace the full string segment
    new_content = content.replace(f"'{HARDCODED}", f"`${{API_BASE_URL}}")
    # Also fix closing quote on same-line simple strings:
    # e.g. 'http://localhost:8000/api/foo' -> `${API_BASE_URL}/api/foo`
    # After replacement, single-quoted URLs look like: `${API_BASE_URL}/api/foo'
    # We need to replace trailing ' that end those strings with `
    new_content = re.sub(r'`\$\{API_BASE_URL\}([^`\n\']*?)\'', r'`${API_BASE_URL}\1`', new_content)

    # Already-backtick-template strings with http://localhost:8000:
    new_content = new_content.replace(f"`{HARDCODED}", f"`${{API_BASE_URL}}")

    # Add import if not already present
    if 'apiConfig' not in new_content:
        # Find first import line and insert after it
        lines = new_content.split('\n')
        last_import_idx = -1
        for i, line in enumerate(lines):
            if line.startswith('import '):
                last_import_idx = i
        if last_import_idx >= 0:
            lines.insert(last_import_idx + 1, import_line)
        else:
            lines.insert(0, import_line)
        new_content = '\n'.join(lines)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

changed = []
for root, dirs, files in os.walk(SRC_DIR):
    # Skip apiConfig.js itself
    for fname in files:
        if fname.endswith(('.jsx', '.js', '.ts', '.tsx')):
            fpath = os.path.join(root, fname)
            if 'apiConfig' in fpath:
                continue
            if process_file(fpath):
                changed.append(os.path.relpath(fpath, SRC_DIR))

print(f"Updated {len(changed)} files:")
for f in sorted(changed):
    print(f"  {f}")

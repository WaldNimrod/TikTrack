#!/bin/bash
# validate_aos.sh — Universal _aos/ Validation (9 Checks)
# =========================================================
# L-GATE_B exit criterion: MUST return exit code 0 (all checks PASS).
#
# Usage: bash validate_aos.sh [project-root]
#   project-root defaults to current directory.
#   Expects _aos/ directory at project-root/_aos/
#
# Exit: 0 = ALL PASS, 1 = ONE OR MORE FAIL
# Dependencies: python3, PyYAML (python3 -c "import yaml")

set -uo pipefail

PROJECT_ROOT="${1:-.}"
AOS_DIR="$PROJECT_ROOT/_aos"
PASS_COUNT=0
FAIL_COUNT=0

# --- Pre-flight: PyYAML check ---
if ! python3 -c "import yaml" 2>/dev/null; then
    echo "FATAL: PyYAML not installed. Run: pip3 install pyyaml"
    exit 1
fi

if [ ! -d "$AOS_DIR" ]; then
    echo "FATAL: _aos/ directory not found at $AOS_DIR"
    exit 1
fi

log_pass() { echo "[PASS] Check $1: $2"; ((PASS_COUNT++)) || true; }
log_fail() { echo "[FAIL] Check $1: $2"; ((FAIL_COUNT++)) || true; }

# ================================================================
# Check 1: YAML Parse Validity
# ================================================================
check_1() {
    python3 -c "
import yaml, sys
for fname in ['$AOS_DIR/roadmap.yaml', '$AOS_DIR/team_assignments.yaml']:
    try:
        with open(fname) as f:
            data = yaml.safe_load(f)
        if data is None:
            print(f'EMPTY_FILE: {fname}', file=sys.stderr)
            sys.exit(1)
    except FileNotFoundError:
        print(f'NOT_FOUND: {fname}', file=sys.stderr)
        sys.exit(1)
    except yaml.YAMLError as e:
        print(f'PARSE_ERROR: {fname}: {e}', file=sys.stderr)
        sys.exit(1)
" && log_pass 1 "YAML files parse correctly" || log_fail 1 "YAML parse error"
}

# ================================================================
# Check 2: Cross-Engine Iron Rule
# ================================================================
check_2() {
    python3 -c "
import yaml, sys
with open('$AOS_DIR/team_assignments.yaml') as f:
    data = yaml.safe_load(f)
teams = data.get('teams', [])
builders = [t for t in teams if t.get('role_type') == 'builder_agent']
validators = [t for t in teams if t.get('role_type') == 'validator_agent']
if not builders:
    print('NO_BUILDER: no builder_agent found', file=sys.stderr)
    sys.exit(1)
if not validators:
    print('NO_VALIDATOR: no validator_agent found', file=sys.stderr)
    sys.exit(1)
for b in builders:
    for v in validators:
        if b.get('engine','').strip() == v.get('engine','').strip():
            print(f'VIOLATION: {b[\"id\"]} ({b[\"engine\"]}) == {v[\"id\"]} ({v[\"engine\"]})', file=sys.stderr)
            sys.exit(1)
" && log_pass 2 "Cross-engine Iron Rule satisfied" || log_fail 2 "Cross-engine Iron Rule VIOLATED"
}

# ================================================================
# Check 3: Version Consistency
# ================================================================
check_3() {
    python3 -c "
import yaml, sys, re, os
meta_path = '$AOS_DIR/metadata.yaml'
lkv_path = '$AOS_DIR/lean-kit/LEAN_KIT_VERSION.md'
if not os.path.isfile(meta_path):
    print(f'NOT_FOUND: {meta_path}', file=sys.stderr)
    sys.exit(1)
if not os.path.isfile(lkv_path):
    print(f'NOT_FOUND: {lkv_path}', file=sys.stderr)
    sys.exit(1)
with open(meta_path) as f:
    meta = yaml.safe_load(f)
lkv_meta = str(meta.get('lean_kit_version', '')).split('+')[0].strip()
with open(lkv_path) as f:
    content = f.read()
# Try markdown bold format first, then plain
match = re.search(r'\*\*version:\*\*\s*(\S+)', content)
if not match:
    match = re.search(r'version:\s*(\S+)', content)
if not match:
    print('PARSE_ERROR: cannot extract version from LEAN_KIT_VERSION.md', file=sys.stderr)
    sys.exit(1)
lkv_file = match.group(1).split('+')[0].strip()
if lkv_meta != lkv_file:
    print(f'MISMATCH: metadata.yaml={lkv_meta} vs LEAN_KIT_VERSION.md={lkv_file}', file=sys.stderr)
    sys.exit(1)
" && log_pass 3 "Version consistency confirmed" || log_fail 3 "Version mismatch"
}

# ================================================================
# Check 4: spec_ref Resolution
# ================================================================
check_4() {
    python3 -c "
import yaml, sys, os
with open('$AOS_DIR/roadmap.yaml') as f:
    data = yaml.safe_load(f)
for wp in data.get('work_packages', []):
    ref = wp.get('spec_ref', '')
    if not ref:
        continue
    if ref.startswith('/'):
        print(f'ABSOLUTE_PATH: {wp[\"id\"]} spec_ref={ref}', file=sys.stderr)
        sys.exit(1)
    if '..' in ref:
        print(f'PARENT_TRAVERSAL: {wp[\"id\"]} spec_ref={ref}', file=sys.stderr)
        sys.exit(1)
    full = os.path.join('$PROJECT_ROOT', ref)
    if not os.path.isfile(full):
        print(f'NOT_FOUND: {wp[\"id\"]} spec_ref={ref} (resolved: {full})', file=sys.stderr)
        sys.exit(1)
" && log_pass 4 "All spec_refs resolve to existing files" || log_fail 4 "spec_ref resolution failed"
}

# ================================================================
# Check 5: Required Fields — Schema Compliance
# ================================================================
check_5() {
    python3 -c "
import yaml, sys
with open('$AOS_DIR/roadmap.yaml') as f:
    rm = yaml.safe_load(f)
with open('$AOS_DIR/team_assignments.yaml') as f:
    ta = yaml.safe_load(f)

# Project block required fields
proj = rm.get('project', {})
for field in ['id', 'name', 'profile', 'lean_kit_version', 'owner', 'active_milestone']:
    val = proj.get(field, '')
    if not val or str(val).strip() == '':
        print(f'MISSING: project.{field}', file=sys.stderr)
        sys.exit(1)

# WP block required fields
for wp in rm.get('work_packages', []):
    for field in ['id', 'label', 'status', 'track', 'current_lean_gate', 'assigned_builder', 'assigned_validator', 'spec_ref']:
        val = wp.get(field, '')
        if not val or str(val).strip() == '':
            print(f'MISSING: WP {wp.get(\"id\", \"?\")}.{field}', file=sys.stderr)
            sys.exit(1)

# team_assignments required fields
if not ta.get('project_id', ''):
    print('MISSING: project_id in team_assignments.yaml', file=sys.stderr)
    sys.exit(1)
for team in ta.get('teams', []):
    for field in ['id', 'role_type', 'engine']:
        val = team.get(field, '')
        if not val or str(val).strip() == '':
            print(f'MISSING: team.{field} in team ' + team.get('id', '?'), file=sys.stderr)
            sys.exit(1)
" && log_pass 5 "All required fields present" || log_fail 5 "Missing required fields"
}

# ================================================================
# Check 6: metadata.yaml Existence + Provenance
# ================================================================
check_6() {
    python3 -c "
import yaml, sys, os
meta_path = '$AOS_DIR/metadata.yaml'
if not os.path.isfile(meta_path):
    print(f'NOT_FOUND: {meta_path}', file=sys.stderr)
    sys.exit(1)
with open(meta_path) as f:
    meta = yaml.safe_load(f)
if meta is None:
    print('EMPTY: metadata.yaml is empty', file=sys.stderr)
    sys.exit(1)
for key in ['lean_kit_version', 'lean_kit_source_sha', 'lean_kit_source_date', 'profile']:
    val = meta.get(key, '')
    if not val or str(val).strip() == '':
        print(f'EMPTY_KEY: metadata.yaml.{key}', file=sys.stderr)
        sys.exit(1)
# L2 additional check
profile = str(meta.get('profile', ''))
if profile in ('L2', 'L3'):
    aev = meta.get('aos_engine_version', '')
    if not aev or str(aev).strip() == '':
        print(f'EMPTY_KEY: metadata.yaml.aos_engine_version (required for {profile})', file=sys.stderr)
        sys.exit(1)
" && log_pass 6 "metadata.yaml complete" || log_fail 6 "metadata.yaml incomplete"
}

# ================================================================
# Check 7: Team ID Slug Regex
# ================================================================
check_7() {
    python3 -c "
import yaml, sys, re
with open('$AOS_DIR/team_assignments.yaml') as f:
    data = yaml.safe_load(f)
pattern = re.compile(r'^[a-z][a-z0-9]*_[a-z]+$')
for team in data.get('teams', []):
    tid = str(team.get('id', ''))
    if not pattern.match(tid):
        print(f'BAD_SLUG: \"{tid}\" does not match ^[a-z][a-z0-9]*_[a-z]+\$', file=sys.stderr)
        sys.exit(1)
" && log_pass 7 "All team IDs match slug regex" || log_fail 7 "Slug regex violation"
}

# ================================================================
# Check 8: Reserved Role Suffix
# ================================================================
check_8() {
    python3 -c "
import yaml, sys
RESERVED = {'sd', 'arch', 'build', 'val', 'doc', 'gate'}
with open('$AOS_DIR/team_assignments.yaml') as f:
    data = yaml.safe_load(f)
for team in data.get('teams', []):
    tid = str(team.get('id', ''))
    parts = tid.rsplit('_', 1)
    if len(parts) != 2:
        print(f'NO_SUFFIX: \"{tid}\" has no underscore separator', file=sys.stderr)
        sys.exit(1)
    suffix = parts[1]
    if suffix not in RESERVED:
        print(f'BAD_SUFFIX: \"{tid}\" suffix \"{suffix}\" not in {sorted(RESERVED)}', file=sys.stderr)
        sys.exit(1)
" && log_pass 8 "All team suffixes are reserved" || log_fail 8 "Reserved suffix violation"
}

# ================================================================
# Check 9: Profile Enum Compliance
# ================================================================
check_9() {
    python3 -c "
import yaml, sys
VALID_PROFILES = {'L0', 'L2', 'L3'}
with open('$AOS_DIR/roadmap.yaml') as f:
    rm = yaml.safe_load(f)
with open('$AOS_DIR/metadata.yaml') as f:
    meta = yaml.safe_load(f)
rp = str(rm.get('project', {}).get('profile', ''))
mp = str(meta.get('profile', ''))
if rp not in VALID_PROFILES:
    print(f'BAD_PROFILE: roadmap.yaml profile=\"{rp}\" not in {sorted(VALID_PROFILES)}', file=sys.stderr)
    sys.exit(1)
if mp not in VALID_PROFILES:
    print(f'BAD_PROFILE: metadata.yaml profile=\"{mp}\" not in {sorted(VALID_PROFILES)}', file=sys.stderr)
    sys.exit(1)
if rp != mp:
    print(f'MISMATCH: roadmap.yaml profile=\"{rp}\" != metadata.yaml profile=\"{mp}\"', file=sys.stderr)
    sys.exit(1)
" && log_pass 9 "Profile enum valid and consistent" || log_fail 9 "Profile enum violation"
}

# ================================================================
# Execute All Checks
# ================================================================
echo "validate_aos.sh — running 9 checks on $AOS_DIR"
echo "================================================="

check_1
check_2
check_3
check_4
check_5
check_6
check_7
check_8
check_9

echo ""
echo "================================================="
echo "RESULT: $PASS_COUNT PASS / $FAIL_COUNT FAIL"
echo "================================================="

if [ "$FAIL_COUNT" -eq 0 ]; then
    echo "L-GATE_B EXIT CRITERION: SATISFIED"
    exit 0
else
    echo "L-GATE_B EXIT CRITERION: NOT MET ($FAIL_COUNT failures)"
    exit 1
fi

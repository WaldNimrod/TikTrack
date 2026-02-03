#!/bin/bash

# Cube Scaffolding Script
# Team 60 (DevOps & Platform)
# Creates a new cube with standard structure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if cube name is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Cube name is required${NC}"
    echo "Usage: ./create-cube.sh <cube-name>"
    exit 1
fi

CUBE_NAME="$1"
CUBE_DIR="ui/src/cubes/${CUBE_NAME}"
TEMPLATES_DIR="ui/infrastructure/cube-scaffolding/templates"

# Validate cube name (lowercase, no spaces)
if [[ ! "$CUBE_NAME" =~ ^[a-z][a-z0-9_]*$ ]]; then
    echo -e "${RED}Error: Cube name must be lowercase, start with a letter, and contain only letters, numbers, and underscores${NC}"
    exit 1
fi

# Check if cube already exists
if [ -d "$CUBE_DIR" ]; then
    echo -e "${RED}Error: Cube '${CUBE_NAME}' already exists${NC}"
    exit 1
fi

echo -e "${GREEN}Creating cube: ${CUBE_NAME}${NC}"

# Create directory structure
mkdir -p "${CUBE_DIR}/components"
mkdir -p "${CUBE_DIR}/services"
mkdir -p "${CUBE_DIR}/hooks"

# Copy templates
if [ -f "${TEMPLATES_DIR}/service-template.js" ]; then
    cp "${TEMPLATES_DIR}/service-template.js" "${CUBE_DIR}/services/${CUBE_NAME}.js"
    echo -e "${GREEN}✓ Created service template${NC}"
fi

if [ -f "${TEMPLATES_DIR}/component-template.jsx" ]; then
    cp "${TEMPLATES_DIR}/component-template.jsx" "${CUBE_DIR}/components/${CUBE_NAME}Component.jsx"
    echo -e "${GREEN}✓ Created component template${NC}"
fi

if [ -f "${TEMPLATES_DIR}/hook-template.js" ]; then
    cp "${TEMPLATES_DIR}/hook-template.js" "${CUBE_DIR}/hooks/use${CUBE_NAME^}.js"
    echo -e "${GREEN}✓ Created hook template${NC}"
fi

# Create README
cat > "${CUBE_DIR}/README.md" << EOF
# ${CUBE_NAME} Cube

**Created:** $(date +%Y-%m-%d)  
**Team:** [Team Name]

## Description

[Describe the cube's purpose and functionality]

## Structure

- \`components/\` - React components
- \`services/\` - API services
- \`hooks/\` - Custom React hooks

## Usage

[Add usage examples]

## Dependencies

- \`cubes/shared/\` - Shared utilities and components
EOF

echo -e "${GREEN}✓ Created README${NC}"

echo -e "${GREEN}✓ Cube '${CUBE_NAME}' created successfully!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update service template: ${CUBE_DIR}/services/${CUBE_NAME}.js"
echo "2. Update component template: ${CUBE_DIR}/components/${CUBE_NAME}Component.jsx"
echo "3. Update hook template: ${CUBE_DIR}/hooks/use${CUBE_NAME^}.js"
echo "4. Update README: ${CUBE_DIR}/README.md"

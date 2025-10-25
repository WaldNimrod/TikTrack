#!/bin/bash

# TikTrack Rollback Script
# Allows rolling back to any stage of the fixing process

STAGE=$1

if [ -z "$STAGE" ]; then
    echo "Usage: ./rollback-stage.sh [stage]"
    echo "Available stages:"
    echo "  stage-0-backup    - Initial backup before fixes"
    echo "  stage-1-syntax     - After syntax fixes"
    echo "  stage-2-validation - After validation"
    echo "  stage-3-quality   - After quality improvements"
    echo "  stage-4-docs       - After documentation"
    echo "  stage-5-complete   - Final state"
    exit 1
fi

echo "🔄 Rolling back to stage: $STAGE"

case $STAGE in
    "stage-0-backup")
        echo "📦 Restoring to initial backup..."
        git checkout stage-0-backup
        ;;
    "stage-1-syntax")
        echo "🔧 Restoring to after syntax fixes..."
        git checkout stage-1-syntax
        ;;
    "stage-2-validation")
        echo "✅ Restoring to after validation..."
        git checkout stage-2-validation
        ;;
    "stage-3-quality")
        echo "📈 Restoring to after quality improvements..."
        git checkout stage-3-quality
        ;;
    "stage-4-docs")
        echo "📚 Restoring to after documentation..."
        git checkout stage-4-docs
        ;;
    "stage-5-complete")
        echo "🎉 Restoring to final state..."
        git checkout stage-5-complete
        ;;
    *)
        echo "❌ Unknown stage: $STAGE"
        echo "Available stages: stage-0-backup, stage-1-syntax, stage-2-validation, stage-3-quality, stage-4-docs, stage-5-complete"
        exit 1
        ;;
esac

echo "✅ Rollback completed to: $STAGE"

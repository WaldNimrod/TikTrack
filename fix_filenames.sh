#!/bin/bash

echo "🔧 Fixing filenames with 'from macBook Air - nimrod'..."

# Count files to fix
total_files=$(find . -name "*from macBook Air - nimrod*" | wc -l)
echo "📊 Found $total_files files to fix"

# Fix files in batches
fixed=0
find . -name "*from macBook Air - nimrod*" | while read file; do
    # Get directory and filename
    dir=$(dirname "$file")
    filename=$(basename "$file")
    
    # Remove the suffix
    newname=$(echo "$filename" | sed 's/ (from macBook Air - nimrod)//')
    
    # Move the file
    if mv "$file" "$dir/$newname" 2>/dev/null; then
        echo "✅ Fixed: $filename -> $newname"
        ((fixed++))
    else
        echo "❌ Failed to fix: $filename"
    fi
    
    # Show progress every 50 files
    if [ $((fixed % 50)) -eq 0 ]; then
        echo "📈 Progress: $fixed/$total_files files fixed"
    fi
done

echo "🎉 Filename fixing completed!"
echo "📊 Total files fixed: $fixed"






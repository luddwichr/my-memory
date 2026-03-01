#!/bin/bash
set -euo pipefail

echo "renaming files"

TARGET_DIR="${1:?Usage: $0 <directory>}"

if [ ! -d "$TARGET_DIR" ]; then
    echo "Error: '$TARGET_DIR' is not a directory" >&2
    exit 1
fi

index=0
for file in "$TARGET_DIR"/*; do
    ext="${file##*.}"
    mv -- "$file" "$TARGET_DIR/$index.$ext"
    index=$((index + 1))
done

echo "Renamed $index files in '$TARGET_DIR'"

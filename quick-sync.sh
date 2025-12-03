#!/bin/bash

# Quick sync script - just copy files from v0 and see what changed

echo "Copy the changed files from v0, then press Enter..."
read

# Show changes
git status --short

echo ""
echo "Changed files listed above. To see detailed changes:"
echo "  git diff <filename>"
echo ""
echo "To commit all changes:"
echo "  git add ."
echo "  git commit -m 'Updated from v0'"

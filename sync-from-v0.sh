#!/bin/bash

# MuscleDesk - Sync Script from v0
# This script helps you sync only changed files from v0 to your local project

echo "==================================="
echo "MuscleDesk - v0 Sync Helper"
echo "==================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d .git ]; then
    echo "${YELLOW}Git not initialized. Initializing now...${NC}"
    git init
    git add .
    git commit -m "Initial commit"
    echo "${GREEN}Git initialized successfully!${NC}"
    echo ""
fi

# Show current branch
echo "Current branch: $(git branch --show-current)"
echo ""

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "${YELLOW}You have uncommitted changes:${NC}"
    git status --short
    echo ""
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
        echo "${GREEN}Changes committed!${NC}"
    fi
    echo ""
fi

# Create a new branch for v0 updates
BRANCH_NAME="v0-update-$(date +%Y%m%d-%H%M%S)"
echo "${YELLOW}Creating new branch: $BRANCH_NAME${NC}"
git checkout -b "$BRANCH_NAME"

echo ""
echo "${GREEN}Ready to sync! Follow these steps:${NC}"
echo ""
echo "1. Download the latest version from v0 (or copy individual files)"
echo "2. Paste/extract the files into this directory"
echo "3. Run: ${YELLOW}git status${NC} to see what changed"
echo "4. Run: ${YELLOW}git diff${NC} to see line-by-line changes"
echo "5. Run: ${YELLOW}git add .${NC} to stage changes"
echo "6. Run: ${YELLOW}git commit -m 'Updated from v0'${NC}"
echo "7. Run: ${YELLOW}git checkout main${NC} to go back to main"
echo "8. Run: ${YELLOW}git merge $BRANCH_NAME${NC} to apply changes"
echo ""
echo "${YELLOW}Press Enter when you've copied the new files...${NC}"
read

# Show what changed
if [ -n "$(git status --porcelain)" ]; then
    echo ""
    echo "${GREEN}=== Files Changed ===${NC}"
    git status --short
    echo ""
    
    # Count changes
    MODIFIED=$(git status --short | grep "^ M" | wc -l)
    ADDED=$(git status --short | grep "^??" | wc -l)
    DELETED=$(git status --short | grep "^ D" | wc -l)
    
    echo "Modified: $MODIFIED files"
    echo "Added: $ADDED files"
    echo "Deleted: $DELETED files"
    echo ""
    
    read -p "Show detailed diff? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git diff
    fi
    
    echo ""
    read -p "Commit these changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "Updated from v0 - $(date)"
        echo "${GREEN}Changes committed!${NC}"
        echo ""
        echo "To apply to main branch:"
        echo "  git checkout main"
        echo "  git merge $BRANCH_NAME"
    fi
else
    echo "${YELLOW}No changes detected.${NC}"
    git checkout main
    git branch -d "$BRANCH_NAME"
fi

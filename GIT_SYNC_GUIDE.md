# Git Sync Guide - Update from v0 Without Full Re-download

This guide helps you update only the changed files from v0 without downloading the entire ZIP every time.

## Initial Setup (One Time Only)

\`\`\`bash
# Initialize git in your project
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial MuscleDesk setup"

# Create main branch
git branch -M main
\`\`\`

## Method 1: Automatic Sync Script (Recommended)

\`\`\`bash
# Make scripts executable
chmod +x sync-from-v0.sh
chmod +x quick-sync.sh

# Run the sync script
./sync-from-v0.sh
\`\`\`

The script will:
- Create a new branch for updates
- Wait for you to paste new files
- Show you exactly what changed
- Help you commit the changes
- Guide you to merge into main

## Method 2: Manual File-by-File Update (Fastest)

When I tell you which files changed (like "Updated: hooks/useGymData.ts"), just:

\`\`\`bash
# 1. Copy ONLY that file from v0 preview
# 2. Paste it into your local project
# 3. See what changed:
git diff hooks/useGymData.ts

# 4. If it looks good, your dev server auto-reloads!
# (No commit needed for testing)
\`\`\`

## Method 3: Quick Check What Changed

\`\`\`bash
# After pasting any files:
git status              # See which files changed
git diff                # See all changes
git diff <filename>     # See specific file changes
\`\`\`

## Workflow Example

**Me (v0):** "I updated `components/auth/SignupPage.tsx` to fix the schema error"

**You do:**
\`\`\`bash
# 1. Copy that ONE file from v0 preview
# 2. Paste into your local components/auth/SignupPage.tsx
# 3. Browser auto-reloads - test it!
# 4. If good, commit:
git add components/auth/SignupPage.tsx
git commit -m "Fixed schema cache error"
\`\`\`

## See History

\`\`\`bash
# See all your updates
git log --oneline

# See what changed in last update
git show

# Go back to previous version if needed
git checkout HEAD~1 <filename>
\`\`\`

## Pro Tips

1. **Test First, Commit Later** - Your dev server auto-reloads when you paste files, so test before committing

2. **Small Commits** - Commit after each logical change (easier to undo if needed)

3. **Keep .env.local Safe** - It's already in .gitignore, so it won't be overwritten

4. **Quick Diff Check** - Before committing, run `git diff` to make sure only expected files changed

## Troubleshooting

**"Too many changes to review"**
\`\`\`bash
# See just filenames
git status --short

# Check one file at a time
git diff components/auth/SignupPage.tsx
\`\`\`

**"I want to undo changes"**
\`\`\`bash
# Undo changes to specific file
git checkout -- <filename>

# Undo all uncommitted changes
git reset --hard
\`\`\`

**"Files not syncing"**
- Make sure you're pasting into correct folders
- Check file permissions: `ls -la`
- Restart dev server: `npm run dev`

## GitHub Setup (Optional but Recommended)

\`\`\`bash
# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/muscledesk.git
git push -u origin main

# Now you can push updates
git push
\`\`\`

With GitHub, you can:
- Access your code from anywhere
- Track all changes forever
- Deploy directly to Vercel
- Collaborate with others

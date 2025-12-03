# Windows Git Sync Guide for MuscleDesk

## One-Time Setup (Already Done)

\`\`\`powershell
# Initialize Git (run once)
git init
git add .
git commit -m "Initial MuscleDesk setup"
\`\`\`

## Easy Sync Method (Recommended)

When I say "Updated: `hooks/useGymData.ts`":

1. **Open the file in v0** - Click the filename in the v0 code block
2. **Copy everything** - Press `Ctrl+A`, then `Ctrl+C`
3. **Open locally** - Open `hooks/useGymData.ts` in VS Code
4. **Paste** - Press `Ctrl+A`, then `Ctrl+V`, then `Ctrl+S`
5. **Done!** - Your browser auto-reloads with changes

No scripts needed! Just copy-paste one file.

## Using PowerShell Scripts

### See what changed:
\`\`\`powershell
.\quick-sync.ps1
\`\`\`

### Guided sync:
\`\`\`powershell
.\sync-from-v0.ps1
\`\`\`

### Or use simple batch file:
\`\`\`cmd
sync.bat
\`\`\`

## Useful Git Commands

\`\`\`powershell
# See what files changed
git status

# See detailed changes
git diff

# Commit changes
git add .
git commit -m "Fixed schema cache issue"

# View history
git log --oneline

# Undo last commit (keeps changes)
git reset --soft HEAD~1
\`\`\`

## No Restart Needed!

✅ Copy one file → Save → Auto-reload
❌ No `npm install` needed
❌ No server restart needed
❌ No ZIP download needed

## Troubleshooting

**Scripts won't run?**
\`\`\`powershell
# Enable script execution (run once as admin)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
\`\`\`

**Still issues?**
Just use the copy-paste method. It's the fastest anyway!

@echo off
echo === MuscleDesk Quick Sync ===
echo.
echo Current changed files:
git status --short
echo.
echo To sync from v0:
echo 1. Copy the file content from v0
echo 2. Paste into your local file
echo 3. Save (browser auto-reloads)
echo.
echo To commit: git add . && git commit -m "Updated files"
echo.
pause

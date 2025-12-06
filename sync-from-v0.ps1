# MuscleDesk - Windows Sync Script from v0
# Usage: .\sync-from-v0.ps1

Write-Host "=== MuscleDesk Sync from v0 ===" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "Git not initialized. Initializing now..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial setup"
    Write-Host "Git initialized successfully!" -ForegroundColor Green
}

# Show current status
Write-Host "Current git status:" -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "=== How to sync files from v0 ===" -ForegroundColor Cyan
Write-Host "1. Open the file in v0 preview (click on filename)"
Write-Host "2. Copy the entire file content (Ctrl+A, Ctrl+C)"
Write-Host "3. Open the same file in your local editor"
Write-Host "4. Paste and save (Ctrl+V, Ctrl+S)"
Write-Host "5. Your browser will auto-reload!"
Write-Host ""

# Ask which files were updated
Write-Host "Which files did you update? (comma separated, or press Enter to skip)" -ForegroundColor Yellow
Write-Host "Example: hooks/useGymData.ts, components/auth/SignupPage.tsx"
$files = Read-Host "Files"

if ($files) {
    $fileList = $files -split "," | ForEach-Object { $_.Trim() }
    
    Write-Host ""
    Write-Host "Checking updated files..." -ForegroundColor Cyan
    
    foreach ($file in $fileList) {
        if (Test-Path $file) {
            Write-Host "✓ $file - Found" -ForegroundColor Green
        } else {
            Write-Host "✗ $file - Not found" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Do you want to commit these changes? (y/n)" -ForegroundColor Yellow
    $commit = Read-Host
    
    if ($commit -eq "y") {
        git add .
        Write-Host "Enter commit message:" -ForegroundColor Yellow
        $message = Read-Host
        git commit -m $message
        Write-Host "✓ Changes committed!" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=== Quick Reference ===" -ForegroundColor Cyan
Write-Host "View changes: git diff"
Write-Host "View status: git status"
Write-Host "View log: git log --oneline"
Write-Host ""

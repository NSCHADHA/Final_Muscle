# Quick file sync checker
Write-Host "=== Files Changed from v0 ===" -ForegroundColor Cyan
Write-Host ""

# Show what changed
git diff --name-only

Write-Host ""
Write-Host "=== Full Diff ===" -ForegroundColor Yellow
git diff

Write-Host ""
Write-Host "Run 'git add .' and 'git commit -m \"message\"' when ready" -ForegroundColor Green

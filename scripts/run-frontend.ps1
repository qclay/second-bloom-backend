param(
  [int]$Port = 4000,
  [string]$ApiBase = 'http://localhost:3000/api/v1'
)

$ErrorActionPreference = 'Stop'

Write-Host "[frontend] Starting static client on http://localhost:$Port" -ForegroundColor Cyan
Write-Host "[frontend] Backend API expected at: $ApiBase" -ForegroundColor DarkCyan
Write-Host "[frontend] Open: http://localhost:$Port" -ForegroundColor Green
Write-Host "[frontend] Stop: Ctrl+C" -ForegroundColor Yellow

npx serve client -l $Port

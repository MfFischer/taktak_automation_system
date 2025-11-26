# Taktak Application Startup Script
# This script starts both server and client in separate windows

Write-Host "Starting Taktak Application..." -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptDir = $PSScriptRoot

# Start server in a new PowerShell window
Write-Host "Starting server in new window..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", "$scriptDir\start-server.ps1"

# Wait a moment for server to start
Start-Sleep -Seconds 2

# Start client in a new PowerShell window
Write-Host "Starting client in new window..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", "$scriptDir\start-client.ps1"

Write-Host ""
Write-Host "Taktak is starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Server: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Client: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Two PowerShell windows have been opened." -ForegroundColor Gray
Write-Host "Close them to stop the application." -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


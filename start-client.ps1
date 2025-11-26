# Taktak Client Startup Script
# This script starts the Taktak client directly without npm

Write-Host "Starting Taktak Client..." -ForegroundColor Cyan
Write-Host ""

# Change to client directory
Set-Location -Path "$PSScriptRoot\apps\client"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "WARNING: node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Check if vite is installed
$vitePath = "..\..\node_modules\.bin\vite.ps1"
if (-not (Test-Path $vitePath)) {
    Write-Host "WARNING: vite not found. Installing..." -ForegroundColor Yellow
    npm install -g vite
    Write-Host ""
}

# Start the client with vite
Write-Host "Starting client on http://localhost:5173" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the client" -ForegroundColor Gray
Write-Host ""

# Run vite directly
npx vite


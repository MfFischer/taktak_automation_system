# Taktak Server Startup Script
# This script starts the Taktak server directly without npm

Write-Host "Starting Taktak Server..." -ForegroundColor Cyan
Write-Host ""

# Change to server directory
Set-Location -Path "$PSScriptRoot\apps\server"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "WARNING: node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Check if tsx is installed
$tsxPath = "..\..\node_modules\.bin\tsx.ps1"
if (-not (Test-Path $tsxPath)) {
    Write-Host "WARNING: tsx not found. Installing..." -ForegroundColor Yellow
    npm install -g tsx
    Write-Host ""
}

# Start the server with tsx watch
Write-Host "Starting server on http://localhost:3001" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Run tsx directly
npx tsx watch src/index.ts


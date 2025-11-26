@echo off
REM Taktak Client Startup Script
REM This script starts the Taktak client directly without npm

echo.
echo ========================================
echo   Starting Taktak Client
echo ========================================
echo.

cd /d "%~dp0apps\client"

REM Check if node_modules exists
if not exist "node_modules" (
    echo [WARNING] node_modules not found. Installing dependencies...
    call npm install
    echo.
)

echo [INFO] Starting client on http://localhost:5173
echo [INFO] Press Ctrl+C to stop the client
echo.

REM Run vite directly
call npx vite


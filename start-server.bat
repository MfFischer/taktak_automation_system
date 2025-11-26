@echo off
REM Taktak Server Startup Script
REM This script starts the Taktak server directly without npm

echo.
echo ========================================
echo   Starting Taktak Server
echo ========================================
echo.

cd /d "%~dp0apps\server"

REM Check if node_modules exists
if not exist "node_modules" (
    echo [WARNING] node_modules not found. Installing dependencies...
    call npm install
    echo.
)

echo [INFO] Starting server on http://localhost:3001
echo [INFO] Press Ctrl+C to stop the server
echo.

REM Run tsx directly
call npx tsx watch src/index.ts

